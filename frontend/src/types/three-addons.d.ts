declare module "three/examples/jsm/controls/OrbitControls" {
  import { Camera } from "three";
  export class OrbitControls {
    constructor(camera: Camera, domElement?: HTMLElement);
    enableDamping: boolean;
    dampingFactor: number;
    rotateSpeed: number;
    zoomSpeed: number;
    enablePan: boolean;
    minDistance: number;
    maxDistance: number;
    autoRotate: boolean;
    autoRotateSpeed: number;
    object: Camera;
    update(): void;
    reset(): void;
    dispose(): void;
  }
}
