import * as THREE from "three";
//import {scene} from './main.js'
import mainScene from "./mainScene.js";
//import { renderer } from './main.js';
import { ThreeMFLoader } from "three/examples/jsm/Addons.js";
import { cameraFar } from "three/tsl";
import { lineDrawer } from "./lineDrawer.js";

enum drawTypes {
  lines,
  angles,
}

export default class inputManager {
  private scene: mainScene;
  private renderer: THREE.WebGLRenderer;

  // ✅ 3. UPDATE THE CONSTRUCTOR'S PARAMETER TYPE
  constructor(scene: mainScene, renderer: THREE.WebGLRenderer) {
    this.scene = scene;
    this.renderer = renderer;
  }

  private static instance: inputManager;
  private lock = false;
  private rKeyToggle = false;
  private mouseToggle = false;

  private keyStates: { [key: string]: boolean } = {};

  zPressed = false;

  // private constructor() {

  // }

  // Public static method to get the instance of the class
  public static getInstance(
    scene: mainScene,
    renderer: THREE.WebGLRenderer,
  ): inputManager {
    if (!inputManager.instance) {
      inputManager.instance = new inputManager(scene, renderer);
    }
    return inputManager.instance;
  }

  public init() {
    document.addEventListener("mousemove", this.mouseMove);
    document.addEventListener("wheel", this.mouseWheel);
    document.addEventListener("mousedown", this.mouseDown);
    document.addEventListener("mouseup", this.mouseUp);

    // Prevent default context menu
    document.addEventListener("contextmenu", (e) => e.preventDefault());

    window.addEventListener("keydown", (e) => this.onKeyDown(e));
    window.addEventListener("keyup", (e) => this.onKeyUp(e));

    window.addEventListener("keydown", (r) => this.onKeyDown(r));
    window.addEventListener("keyup", (r) => this.onKeyUp(r));
  }

  // Example method

  private mouseDown = (event: MouseEvent) => {
    if (event.button === 1) {
      // Middle mouse button
      this.renderer.domElement.requestPointerLock();
      this.mouseToggle = true;
      5;
      event.preventDefault(); // Prevent default action
    }
    if (event.button === 0) {
      let lineVec: THREE.Vector3[] = [];
      this.scene.linedrawer.bilboardRaycast(
        event.clientX,
        event.clientY,
        this.scene.vertecies,
        this.scene.mainCamera,
        false,
      );
    }
  };

  private mouseUp = (event: MouseEvent) => {
    if (event.button === 1) {
      // Middle mouse button
      document.exitPointerLock();
      event.preventDefault(); // Prevent default action
      this.mouseToggle = false;
    }
  };

  private mouseMove = (event: MouseEvent) => {
    const deltaTheta = event.movementX * 0.002; // Adjust sensitivity as needed
    const deltaPhi = event.movementY * -0.002; // Adjust sensitivity as needed
    if (document.pointerLockElement === this.renderer.domElement)
      this.scene.mainCamera.rotate(deltaTheta, deltaPhi);

    if (this.scene.activeLineVisibility) {
      let b = this.scene.linedrawer.bilboardRaycast(
        event.clientX,
        event.clientY,
        this.scene.vertecies,
        this.scene.mainCamera,
        true,
      );
      if (b != null) {
        this.scene.activeLineUpdate(b);
        return;
      }
      this.scene.activeLineUpdate(
        this.scene.mainCamera
          .screenToWorldRay(
            event.clientX,
            event.clientY,
            window.innerWidth,
            window.innerHeight,
          )
          .add(this.scene.mainCamera.getPosition()),
      );
    }
  };

  private mouseWheel = (event: WheelEvent) => {
    this.scene.mainCamera.zoom(event.deltaY * 0.01);
  };

  public isEKeyPressed = false; // Flag to track if 'e' is currently pressed

  private onKeyDown(event: KeyboardEvent): void {
    this.keyStates[event.key.toLowerCase()] = true;
  }

  private onKeyUp(event: KeyboardEvent): void {
    this.keyStates[event.key.toLowerCase()] = false;
  }

  public isPressed(key: string): boolean {
    return !!this.keyStates[key.toLowerCase()];
  }

  public update(): void {
    let offset = new THREE.Vector3(0, 0.03, 0);
    if (this.isPressed("e")) {
      this.scene.mainCamera.setTarget(
        this.scene.mainCamera.getTarget().clone().add(offset),
      );
      this.scene.mainCamera.updateProjectionMatrixP();
    }

    if (this.isPressed("q")) {
      this.scene.mainCamera.setTarget(
        this.scene.mainCamera.getTarget().sub(offset),
      );
      this.scene.mainCamera.updateProjectionMatrixP();
    }

    if (this.isPressed("z") || this.isPressed("3")) {
      if (this.zPressed === false) {
        this.scene.linedrawer.undo();
        this.scene.createShape();
        this.zPressed = true;
      }
    } else this.zPressed = false;

    if (this.isPressed("r")) {
      if (!this.rKeyToggle) {
        this.renderer.domElement.requestPointerLock();
        this.rKeyToggle = true;
        this.lock = true;
      }
    } else {
      if (this.rKeyToggle) {
        document.exitPointerLock();
        this.rKeyToggle = false;
        this.lock = this.mouseToggle;
      }
    }

    if (this.isPressed("1")) {
      this.scene.linedrawer.setDrawingType(drawTypes.lines);
      this.scene.linedrawer.nullInters();
      this.scene.gui.selectButton(this.scene.gui.linesButton!);
    }

    if (this.isPressed("2")) {
      this.scene.linedrawer.setDrawingType(drawTypes.angles);
      this.scene.linedrawer.nullInters();
      this.scene.gui.selectButton(this.scene.gui.anglesButton!);
    }
  }

  private cleanup() {
    document.removeEventListener("mousemove", this.mouseMove);
    document.removeEventListener("wheel", this.mouseWheel);
    document.removeEventListener("mousedown", this.mouseDown);
    document.removeEventListener("mouseup", this.mouseUp);
  }
}
