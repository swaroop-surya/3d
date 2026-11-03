import * as THREE from 'three';
import { IslandLocationId, LocationMeta } from '../types';

export const ISLAND_LOCATIONS: LocationMeta[] = [
  {
    id: 'memory_house',
    name: 'The Memory House',
    description: 'Our cozy cottage, fireplace hearth, and relationship mailbox.',
    position: [0, 5.2, 12],
    lookAt: [0, 4.0, 0],
    icon: 'Home',
  },
  {
    id: 'cherry_garden',
    name: 'Cherry Blossom Garden',
    description: 'Drifting pink petals, lovers’ bench, and glowing lanterns.',
    position: [-18, 5.5, 22],
    lookAt: [-18, 4.0, 10],
    icon: 'Flower2',
  },
  {
    id: 'crystal_lake',
    name: 'Crystal Lake',
    description: 'Reflective waters, wooden pier, wish fountain, and memory bottle.',
    position: [-20, 5.0, 27],
    lookAt: [-20, 2.5, 16],
    icon: 'Waves',
  },
  {
    id: 'photo_museum',
    name: 'Photo Museum',
    description: 'Our neoclassical gallery walls, featured frames, and master scrapbook.',
    position: [22, 5.8, -1],
    lookAt: [22, 4.0, -12],
    icon: 'Image',
  },
  {
    id: 'post_office',
    name: 'Letter Post Office',
    description: 'Handwritten love letters, wax seals, and scheduled surprises.',
    position: [12, 5.0, -15],
    lookAt: [12, 3.8, -24],
    icon: 'Mail',
  },
  {
    id: 'observatory',
    name: 'The Observatory',
    description: 'Celestial dome on the hill, telescope, and relationship constellations.',
    position: [-4, 15.0, -14],
    lookAt: [-4, 12.0, -26],
    icon: 'Sparkles',
  },
  {
    id: 'music_pavilion',
    name: 'Music Pavilion',
    description: 'Open-air wooden gazebo, vintage gramophone, and our soundtrack.',
    position: [16, 5.5, 27],
    lookAt: [16, 3.8, 16],
    icon: 'Music',
  },
  {
    id: 'sunset_viewpoint',
    name: 'Sunset Viewpoint',
    description: 'Dramatic cliff overlook deck, couple bench, and golden horizon.',
    position: [24, 6.8, 30],
    lookAt: [24, 5.2, 20],
    icon: 'Sunset',
  },
];

export class CameraController {
  private camera: THREE.PerspectiveCamera;
  private domElement: HTMLElement;

  // Position & Orientation
  private currentPos: THREE.Vector3 = new THREE.Vector3(0, 14, 32);
  private targetPos: THREE.Vector3 = new THREE.Vector3(0, 14, 32);

  private currentLook: THREE.Vector3 = new THREE.Vector3(0, 4, 0);
  private targetLook: THREE.Vector3 = new THREE.Vector3(0, 4, 0);

  // Spherical yaw/pitch angles for free-look
  private yaw: number = 0;
  private pitch: number = -0.25;
  private targetYaw: number = 0;
  private targetPitch: number = -0.25;

  // Speeds & Input State
  private baseSpeed: number = 14.0;
  private moveSpeed: number = 14.0;
  private isPointerDown: boolean = false;
  private lastPointerX: number = 0;
  private lastPointerY: number = 0;

  private keysPressed: Set<string> = new Set();
  public virtualJoystick: { x: number; y: number } = { x: 0, y: 0 };
  public virtualVertical: number = 0; // -1 (down), 1 (up)

  private isInspecting: boolean = false;
  private isTransitioning: boolean = false;
  private transitionAlpha: number = 1.0;

  // Active Location Tracker
  public currentLocationId: IslandLocationId = 'memory_house';

  constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
    this.camera = camera;
    this.domElement = domElement;

    this.camera.position.copy(this.currentPos);
    this.camera.lookAt(this.currentLook);

    this.bindEvents();
  }

  private bindEvents() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);

    this.domElement.addEventListener('pointerdown', this.handlePointerDown);
    window.addEventListener('pointermove', this.handlePointerMove);
    window.addEventListener('pointerup', this.handlePointerUp);
    this.domElement.addEventListener('wheel', this.handleWheel, { passive: true });
    this.domElement.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  public dispose() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);

    this.domElement.removeEventListener('pointerdown', this.handlePointerDown);
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('pointerup', this.handlePointerUp);
    this.domElement.removeEventListener('wheel', this.handleWheel);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    // Ignore input if user is typing in form inputs/modals
    if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

    this.keysPressed.add(e.code);

    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
      this.moveSpeed = this.baseSpeed * 2.2;
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keysPressed.delete(e.code);

    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
      this.moveSpeed = this.baseSpeed;
    }
  };

  private handlePointerDown = (e: PointerEvent) => {
    // Only drag look if clicking directly on canvas, not button overlays
    if ((e.target as HTMLElement) !== this.domElement) return;

    this.isPointerDown = true;
    this.lastPointerX = e.clientX;
    this.lastPointerY = e.clientY;
  };

  private handlePointerMove = (e: PointerEvent) => {
    if (!this.isPointerDown) return;

    const dx = e.clientX - this.lastPointerX;
    const dy = e.clientY - this.lastPointerY;

    this.lastPointerX = e.clientX;
    this.lastPointerY = e.clientY;

    const sensitivity = 0.0035;
    this.targetYaw -= dx * sensitivity;
    this.targetPitch -= dy * sensitivity;

    // Clamp pitch between -85 deg and +85 deg
    const maxPitch = Math.PI / 2 - 0.05;
    this.targetPitch = Math.max(-maxPitch, Math.min(maxPitch, this.targetPitch));

    if (this.isTransitioning) {
      this.isTransitioning = false;
    }
  };

  private handlePointerUp = () => {
    this.isPointerDown = false;
  };

  private handleWheel = (e: WheelEvent) => {
    // Zoom in / out in look direction
    const zoomDelta = e.deltaY * 0.015;
    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);

    this.targetPos.addScaledVector(forward, -zoomDelta);
    this.clampBoundaries(this.targetPos);
  };

  public flyToLocation(locationId: IslandLocationId) {
    const loc = ISLAND_LOCATIONS.find((l) => l.id === locationId);
    if (!loc) return;

    this.currentLocationId = locationId;
    this.isInspecting = false;
    this.isTransitioning = true;
    this.transitionAlpha = 0.0;

    this.targetPos.set(...loc.position);
    this.targetLook.set(...loc.lookAt);

    // Compute target yaw and pitch from lookAt
    const dir = new THREE.Vector3().subVectors(this.targetLook, this.targetPos).normalize();
    this.targetPitch = Math.asin(dir.y);
    this.targetYaw = Math.atan2(-dir.x, -dir.z);
  }

  public inspectObject(position: [number, number, number], offsetDist: number = 3.5) {
    this.isInspecting = true;
    this.isTransitioning = true;
    this.transitionAlpha = 0.0;

    const target = new THREE.Vector3(...position);
    this.targetLook.copy(target);

    // Position camera slightly offset and facing target
    const currentDir = new THREE.Vector3().subVectors(this.currentPos, target).normalize();
    if (currentDir.length() < 0.1) currentDir.set(0, 0.5, 1).normalize();

    this.targetPos.copy(target).addScaledVector(currentDir, offsetDist);
    this.targetPos.y = Math.max(target.y + 0.5, this.targetPos.y);

    const dir = new THREE.Vector3().subVectors(this.targetLook, this.targetPos).normalize();
    this.targetPitch = Math.asin(dir.y);
    this.targetYaw = Math.atan2(-dir.x, -dir.z);
  }

  public exitInspection() {
    this.isInspecting = false;
    this.flyToLocation(this.currentLocationId);
  }

  public getIsInspecting(): boolean {
    return this.isInspecting;
  }

  private clampBoundaries(pos: THREE.Vector3) {
    // Keep camera within island sky dome
    const maxRadius = 55;
    const xzDist = Math.hypot(pos.x, pos.z);
    if (xzDist > maxRadius) {
      const angle = Math.atan2(pos.z, pos.x);
      pos.x = Math.cos(angle) * maxRadius;
      pos.z = Math.sin(angle) * maxRadius;
    }

    pos.y = Math.max(2.5, Math.min(42.0, pos.y));
  }

  public update(delta: number) {
    // Smooth angle interpolation
    this.yaw = THREE.MathUtils.damp(this.yaw, this.targetYaw, 12, delta);
    this.pitch = THREE.MathUtils.damp(this.pitch, this.targetPitch, 12, delta);

    // Compute 3D look direction from yaw and pitch (for camera aim)
    const lookForward = new THREE.Vector3(
      -Math.sin(this.yaw) * Math.cos(this.pitch),
      Math.sin(this.pitch),
      -Math.cos(this.yaw) * Math.cos(this.pitch)
    ).normalize();

    // Horizontal movement vectors (strictly on X/Z ground plane)
    // This ensures joystick forward/back and strafe moves across the island without changing altitude
    const horizontalForward = new THREE.Vector3(
      -Math.sin(this.yaw),
      0,
      -Math.cos(this.yaw)
    ).normalize();
    const horizontalRight = new THREE.Vector3(-horizontalForward.z, 0, horizontalForward.x).normalize();
    const up = new THREE.Vector3(0, 1, 0);

    // Movement direction accumulator
    const moveDir = new THREE.Vector3();

    // Desktop keyboard horizontal navigation
    if (this.keysPressed.has('KeyW') || this.keysPressed.has('ArrowUp')) moveDir.add(horizontalForward);
    if (this.keysPressed.has('KeyS') || this.keysPressed.has('ArrowDown')) moveDir.sub(horizontalForward);
    if (this.keysPressed.has('KeyA') || this.keysPressed.has('ArrowLeft')) moveDir.sub(horizontalRight);
    if (this.keysPressed.has('KeyD') || this.keysPressed.has('ArrowRight')) moveDir.add(horizontalRight);

    // Desktop elevation
    if (this.keysPressed.has('Space')) moveDir.add(up);
    if (this.keysPressed.has('KeyC') || this.keysPressed.has('ControlLeft')) moveDir.sub(up);

    // Mobile Virtual Joystick: pure horizontal navigation (Forward, Backward, Strafe Left/Right)
    if (this.virtualJoystick.x !== 0 || this.virtualJoystick.y !== 0) {
      moveDir.addScaledVector(horizontalRight, this.virtualJoystick.x);
      moveDir.addScaledVector(horizontalForward, this.virtualJoystick.y);
    }

    // Mobile Elevation Arrows: pure vertical altitude control
    if (this.virtualVertical !== 0) {
      moveDir.addScaledVector(up, this.virtualVertical);
    }

    if (moveDir.lengthSq() > 0.001) {
      moveDir.normalize();
      this.targetPos.addScaledVector(moveDir, this.moveSpeed * delta);
      this.clampBoundaries(this.targetPos);
      if (this.isInspecting) this.isInspecting = false;
    }

    // Exponential smoothing for position
    const lerpRate = this.isTransitioning ? 5.5 : 9.0;
    this.currentPos.x = THREE.MathUtils.damp(this.currentPos.x, this.targetPos.x, lerpRate, delta);
    this.currentPos.y = THREE.MathUtils.damp(this.currentPos.y, this.targetPos.y, lerpRate, delta);
    this.currentPos.z = THREE.MathUtils.damp(this.currentPos.z, this.targetPos.z, lerpRate, delta);

    this.camera.position.copy(this.currentPos);

    // Update camera lookAt
    const lookTarget = new THREE.Vector3().copy(this.currentPos).add(lookForward);
    this.camera.lookAt(lookTarget);

    // Detect closest location
    this.updateCurrentLocation();
  }

  private updateCurrentLocation() {
    let closestId = this.currentLocationId;
    let closestDist = Infinity;

    ISLAND_LOCATIONS.forEach((loc) => {
      const d = Math.hypot(
        this.currentPos.x - loc.lookAt[0],
        this.currentPos.z - loc.lookAt[2]
      );
      if (d < closestDist) {
        closestDist = d;
        closestId = loc.id;
      }
    });

    if (closestDist < 18) {
      this.currentLocationId = closestId;
    }
  }

  public getCompassAngle(): number {
    return this.yaw;
  }
}
