import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildFloatingIsland } from './procedural/islandBuilder';
import { buildAllLocations } from './procedural/locationsBuilder';
import { createParticleSystems } from './procedural/particles';
import { CameraController } from './CameraController';
import { InteractionManager } from './InteractionManager';
import { InteractiveObjectData, IslandLocationId, TimeOfDay, WeatherState, Memory } from '../types';
import { proceduralTextures } from './procedural/textures';

interface WorldCanvasProps {
  timeOfDay: TimeOfDay;
  weather: WeatherState;
  onHoverObject: (data: InteractiveObjectData | null) => void;
  onSelectObject: (data: InteractiveObjectData) => void;
  activeLocation: IslandLocationId;
  onLocationChange: (loc: IslandLocationId) => void;
  controllerRef: React.MutableRefObject<CameraController | null>;
  memories: Memory[];
}

export const WorldCanvas: React.FC<WorldCanvasProps> = ({
  timeOfDay,
  weather,
  onHoverObject,
  onSelectObject,
  activeLocation,
  onLocationChange,
  controllerRef,
  memories,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const dynamicFramesRef = useRef<Map<string, THREE.Mesh>>(new Map());

  // Lighting & Background configuration by TimeOfDay
  const THEME_LIGHTING = {
    morning: {
      sky: 0xf6e3d4,
      fog: 0xf5d9cb,
      sunColor: 0xffe0b5,
      sunIntensity: 2.2,
      hemiSky: 0xffedd8,
      hemiGround: 0xb5c9b4,
      hemiIntensity: 1.1,
    },
    afternoon: {
      sky: 0xd9eaf8,
      fog: 0xc8ddf0,
      sunColor: 0xfffae8,
      sunIntensity: 2.4,
      hemiSky: 0xe8f2ff,
      hemiGround: 0xbcd4bb,
      hemiIntensity: 1.2,
    },
    sunset: {
      sky: 0xdec8e8, // Soft lavender
      fog: 0xebcad8, // Pastel pink
      sunColor: 0xffab76, // Warm amber sunset
      sunIntensity: 2.5,
      hemiSky: 0xe6b5ce,
      hemiGround: 0x8f7d95,
      hemiIntensity: 1.0,
    },
    night: {
      sky: 0x16132b, // Deep dreamy indigo
      fog: 0x1f1b3b,
      sunColor: 0x8294d9, // Moonlight
      sunIntensity: 0.9,
      hemiSky: 0x2b2353,
      hemiGround: 0x141026,
      hemiIntensity: 0.6,
    },
  };

  useEffect(() => {
    if (!mountRef.current) return;

    // 1. Detect Software WebGL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Initialize Scene & Renderer
    const scene = new THREE.Scene();
    const currentTheme = THEME_LIGHTING[timeOfDay];
    scene.background = new THREE.Color(currentTheme.sky);
    scene.fog = new THREE.FogExp2(currentTheme.fog, 0.0075);

    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      600
    );

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mountRef.current.appendChild(renderer.domElement);

    // 3. Environment Map (PMREM)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 4. Lighting Rig (3-Point balanced lighting)
    const sunLight = new THREE.DirectionalLight(currentTheme.sunColor, currentTheme.sunIntensity);
    sunLight.position.set(35, 45, 25);
    sunLight.castShadow = !isSoftwareGl;
    if (sunLight.castShadow) {
      sunLight.shadow.mapSize.width = 2048;
      sunLight.shadow.mapSize.height = 2048;
      sunLight.shadow.camera.near = 10;
      sunLight.shadow.camera.far = 130;
      sunLight.shadow.camera.left = -50;
      sunLight.shadow.camera.right = 50;
      sunLight.shadow.camera.top = 50;
      sunLight.shadow.camera.bottom = -50;
      sunLight.shadow.bias = -0.0004;
      sunLight.shadow.normalBias = 0.02;
    }
    scene.add(sunLight);

    const hemiLight = new THREE.HemisphereLight(
      currentTheme.hemiSky,
      currentTheme.hemiGround,
      currentTheme.hemiIntensity
    );
    scene.add(hemiLight);

    // Subtle romantic rim light
    const rimLight = new THREE.DirectionalLight(0xffd5e5, 0.7);
    rimLight.position.set(-30, 25, -35);
    scene.add(rimLight);

    // 5. Build Floating Island & Terrain
    const island = buildFloatingIsland();
    scene.add(island.islandGroup);

    // 6. Build Locations & Interactive Objects
    const locations = buildAllLocations();
    scene.add(locations.locationsGroup);
    dynamicFramesRef.current = locations.dynamicFrames;

    // 7. Environmental Particles
    const particles = createParticleSystems();
    scene.add(particles.particlesGroup);

    // 8. Camera Controller
    const controller = new CameraController(camera, renderer.domElement);
    controllerRef.current = controller;

    // 9. Interaction Manager
    const interaction = new InteractionManager(
      camera,
      renderer.domElement,
      locations.interactiveObjects,
      {
        onHoverChange: (data) => onHoverObject(data),
        onObjectClick: (data) => onSelectObject(data),
      }
    );

    // 10. Animation & Render Loop with Software WebGL Guard
    let animFrameId = 0;
    let lastReportedLocation = controller.currentLocationId;
    let lastTime = performance.now();
    let startTime = performance.now();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          window.setTimeout(cb, 80);
        }
      };
      window.setTimeout(poll, 5);
    }

    const tick = () => {
      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      const time = (now - startTime) / 1000;
      lastTime = now;

      // Updates
      controller.update(delta);
      interaction.update();
      island.update(delta, time);
      locations.update(delta, time);
      particles.update(delta, time, weather);

      if (controller.currentLocationId !== lastReportedLocation) {
        lastReportedLocation = controller.currentLocationId;
        onLocationChange(lastReportedLocation);
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        animFrameId = requestAnimationFrame(tick);
      }
    };

    tick();

    // 11. Handle Resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      controller.dispose();
      interaction.dispose();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update lighting & atmosphere dynamically when timeOfDay changes
  useEffect(() => {
    // Synchronize textures on dynamic frames
    if (dynamicFramesRef.current) {
      memories.forEach((mem) => {
        if (mem.assigned_frame_id && dynamicFramesRef.current.has(mem.assigned_frame_id)) {
          const frameMesh = dynamicFramesRef.current.get(mem.assigned_frame_id)!;
          if (frameMesh.material instanceof THREE.MeshBasicMaterial) {
            frameMesh.material.map = proceduralTextures.createPhotoTexture(
              mem.media_url,
              mem.title
            );
            frameMesh.material.needsUpdate = true;
          }
        }
      });
    }
  }, [memories]);

  return <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />;
};
