import * as THREE from 'three';
import { InteractiveObjectData } from '../types';
import { audioService } from '../services/audioService';

export interface InteractionCallbacks {
  onHoverChange: (data: InteractiveObjectData | null) => void;
  onObjectClick: (data: InteractiveObjectData) => void;
}

export class InteractionManager {
  private camera: THREE.Camera;
  private domElement: HTMLElement;
  private interactiveObjects: Array<{ mesh: THREE.Object3D; data: InteractiveObjectData }>;
  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private mousePos: THREE.Vector2 = new THREE.Vector2(-999, -999);

  private hoveredItem: { mesh: THREE.Object3D; data: InteractiveObjectData } | null = null;
  private callbacks: InteractionCallbacks;

  private isPointerDown: boolean = false;
  private pointerDownPos: { x: number; y: number } = { x: 0, y: 0 };

  constructor(
    camera: THREE.Camera,
    domElement: HTMLElement,
    interactiveObjects: Array<{ mesh: THREE.Object3D; data: InteractiveObjectData }>,
    callbacks: InteractionCallbacks
  ) {
    this.camera = camera;
    this.domElement = domElement;
    this.interactiveObjects = interactiveObjects;
    this.callbacks = callbacks;

    this.bindEvents();
  }

  private bindEvents() {
    this.domElement.addEventListener('pointermove', this.handlePointerMove);
    this.domElement.addEventListener('pointerdown', this.handlePointerDown);
    this.domElement.addEventListener('pointerup', this.handlePointerUp);
  }

  public dispose() {
    this.domElement.removeEventListener('pointermove', this.handlePointerMove);
    this.domElement.removeEventListener('pointerdown', this.handlePointerDown);
    this.domElement.removeEventListener('pointerup', this.handlePointerUp);
  }

  private handlePointerMove = (e: PointerEvent) => {
    const rect = this.domElement.getBoundingClientRect();
    this.mousePos.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mousePos.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  };

  private handlePointerDown = (e: PointerEvent) => {
    this.isPointerDown = true;
    this.pointerDownPos = { x: e.clientX, y: e.clientY };
  };

  private handlePointerUp = (e: PointerEvent) => {
    // Check if it was a click (not a camera drag)
    const dist = Math.hypot(e.clientX - this.pointerDownPos.x, e.clientY - this.pointerDownPos.y);
    this.isPointerDown = false;

    if (dist < 6 && this.hoveredItem) {
      audioService.playChime(1.1);
      this.callbacks.onObjectClick(this.hoveredItem.data);
    }
  };

  public update() {
    if (this.mousePos.x === -999) return;

    this.raycaster.setFromCamera(this.mousePos, this.camera);
    const meshes = this.interactiveObjects.map((item) => item.mesh);
    const intersects = this.raycaster.intersectObjects(meshes, true);

    if (intersects.length > 0) {
      // Find top matching parent
      let hitMesh: THREE.Object3D | null = intersects[0].object;
      let matched = this.interactiveObjects.find((item) => item.mesh === hitMesh);

      while (!matched && hitMesh && hitMesh.parent) {
        hitMesh = hitMesh.parent;
        matched = this.interactiveObjects.find((item) => item.mesh === hitMesh);
      }

      if (matched && matched !== this.hoveredItem) {
        this.hoveredItem = matched;
        this.domElement.style.cursor = 'pointer';
        this.callbacks.onHoverChange(matched.data);
      }
    } else {
      if (this.hoveredItem) {
        this.hoveredItem = null;
        this.domElement.style.cursor = 'grab';
        this.callbacks.onHoverChange(null);
      }
    }
  }

  public getHovered(): InteractiveObjectData | null {
    return this.hoveredItem ? this.hoveredItem.data : null;
  }
}
