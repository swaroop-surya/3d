import * as THREE from 'three';
import { proceduralTextures } from './textures';

export interface ParticleSystemResult {
  particlesGroup: THREE.Group;
  update: (delta: number, time: number, weather: string) => void;
}

export function createParticleSystems(): ParticleSystemResult {
  const particlesGroup = new THREE.Group();
  particlesGroup.name = 'environmental_particles';

  // 1. Cherry Blossom Petals
  const petalCount = 280;
  const petalGeo = new THREE.BufferGeometry();
  const petalPositions = new Float32Array(petalCount * 3);
  const petalVelocities: { vx: number; vy: number; vz: number; rotSpeed: number }[] = [];

  const petalTex = proceduralTextures.createPetalTexture();
  const petalMat = new THREE.PointsMaterial({
    map: petalTex,
    size: 0.8,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });

  for (let i = 0; i < petalCount; i++) {
    // Clustered around the Cherry Blossom Garden (x: -18, z: 10)
    petalPositions[i * 3] = -18 + (Math.random() - 0.5) * 22;
    petalPositions[i * 3 + 1] = 2 + Math.random() * 12;
    petalPositions[i * 3 + 2] = 10 + (Math.random() - 0.5) * 22;

    petalVelocities.push({
      vx: (Math.random() - 0.2) * 0.4,
      vy: -0.4 - Math.random() * 0.4,
      vz: (Math.random() - 0.5) * 0.3,
      rotSpeed: Math.random() * 2,
    });
  }

  petalGeo.setAttribute('position', new THREE.BufferAttribute(petalPositions, 3));
  const petalMesh = new THREE.Points(petalGeo, petalMat);
  particlesGroup.add(petalMesh);

  // 2. Fireflies & Glowing Star Specks
  const fireflyCount = 120;
  const fireflyGeo = new THREE.BufferGeometry();
  const fireflyPositions = new Float32Array(fireflyCount * 3);
  const fireflyOriginal: [number, number, number][] = [];

  const glowTex = proceduralTextures.createGlowTexture();
  const fireflyMat = new THREE.PointsMaterial({
    map: glowTex,
    size: 1.2,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    color: 0xffe299,
  });

  for (let i = 0; i < fireflyCount; i++) {
    const rx = (Math.random() - 0.5) * 60;
    const ry = 1.5 + Math.random() * 8;
    const rz = (Math.random() - 0.5) * 60;

    fireflyPositions[i * 3] = rx;
    fireflyPositions[i * 3 + 1] = ry;
    fireflyPositions[i * 3 + 2] = rz;
    fireflyOriginal.push([rx, ry, rz]);
  }

  fireflyGeo.setAttribute('position', new THREE.BufferAttribute(fireflyPositions, 3));
  const fireflyMesh = new THREE.Points(fireflyGeo, fireflyMat);
  particlesGroup.add(fireflyMesh);

  // 3. Floating Musical Notes around Music Pavilion (x = 16, z = 16)
  const noteCount = 24;
  const noteGeo = new THREE.BufferGeometry();
  const notePositions = new Float32Array(noteCount * 3);
  const noteTex = proceduralTextures.createNoteTexture();
  const noteMat = new THREE.PointsMaterial({
    map: noteTex,
    size: 1.4,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
  });

  for (let i = 0; i < noteCount; i++) {
    notePositions[i * 3] = 16 + (Math.random() - 0.5) * 5;
    notePositions[i * 3 + 1] = 4 + Math.random() * 4;
    notePositions[i * 3 + 2] = 16 + (Math.random() - 0.5) * 5;
  }
  noteGeo.setAttribute('position', new THREE.BufferAttribute(notePositions, 3));
  const noteMesh = new THREE.Points(noteGeo, noteMat);
  particlesGroup.add(noteMesh);

  // Update loop
  const update = (delta: number, time: number, weather: string) => {
    // 1. Petals update
    const pPos = petalGeo.attributes.position.array as Float32Array;
    const windMult = weather === 'petal_breeze' ? 2.5 : 1.0;

    for (let i = 0; i < petalCount; i++) {
      const idx = i * 3;
      pPos[idx] += Math.sin(time + i) * 0.05 + petalVelocities[i].vx * windMult * delta;
      pPos[idx + 1] += petalVelocities[i].vy * (weather === 'gentle_rain' ? 2.0 : 1.0) * delta;
      pPos[idx + 2] += Math.cos(time + i) * 0.04 + petalVelocities[i].vz * delta;

      // Wrap around
      if (pPos[idx + 1] < 1.0) {
        pPos[idx] = -18 + (Math.random() - 0.5) * 22;
        pPos[idx + 1] = 10 + Math.random() * 5;
        pPos[idx + 2] = 10 + (Math.random() - 0.5) * 22;
      }
    }
    petalGeo.attributes.position.needsUpdate = true;

    // 2. Fireflies bobbing
    const fPos = fireflyGeo.attributes.position.array as Float32Array;
    for (let i = 0; i < fireflyCount; i++) {
      const idx = i * 3;
      const [ox, oy, oz] = fireflyOriginal[i];
      fPos[idx] = ox + Math.sin(time * 0.8 + i) * 0.8;
      fPos[idx + 1] = oy + Math.cos(time * 1.1 + i) * 0.6;
      fPos[idx + 2] = oz + Math.sin(time * 0.6 + i * 2) * 0.8;
    }
    fireflyGeo.attributes.position.needsUpdate = true;

    // 3. Notes rising and rotating
    const nPos = noteGeo.attributes.position.array as Float32Array;
    for (let i = 0; i < noteCount; i++) {
      const idx = i * 3;
      nPos[idx + 1] += delta * 0.7;
      nPos[idx] += Math.sin(time * 2.0 + i) * 0.02;
      if (nPos[idx + 1] > 8.5) {
        nPos[idx + 1] = 4.0;
        nPos[idx] = 16 + (Math.random() - 0.5) * 4;
        nPos[idx + 2] = 16 + (Math.random() - 0.5) * 4;
      }
    }
    noteGeo.attributes.position.needsUpdate = true;
  };

  return {
    particlesGroup,
    update,
  };
}
