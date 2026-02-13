import * as THREE from 'three';
var drawTypes;
(function (drawTypes) {
    drawTypes[drawTypes["lines"] = 0] = "lines";
    drawTypes[drawTypes["angles"] = 1] = "angles";
})(drawTypes || (drawTypes = {}));
export default class inputManager {
    // ✅ 3. UPDATE THE CONSTRUCTOR'S PARAMETER TYPE
    constructor(scene, renderer) {
        this.lock = false;
        this.rKeyToggle = false;
        this.mouseToggle = false;
        this.keyStates = {};
        this.zPressed = false;
        // Example method
        this.mouseDown = (event) => {
            if (event.button === 1) { // 2 = prawy przycisk myszy
                this.renderer.domElement.requestPointerLock();
                this.mouseToggle = true;
                5;
                event.preventDefault(); // Zapobiegaj domyślnej akcji
            }
            if (event.button === 0) {
                let lineVec = [];
                this.scene.linedrawer.bilboardRaycast(event.clientX, event.clientY, this.scene.vertecies, this.scene.mainCamera, false);
            }
        };
        this.mouseUp = (event) => {
            if (event.button === 1) { // 2 = prawy przycisk myszy
                document.exitPointerLock();
                event.preventDefault(); // Zapobiegaj domyślnej akcji
                this.mouseToggle = false;
            }
        };
        this.mouseMove = (event) => {
            const deltaTheta = event.movementX * 0.002; // Adjust sensitivity as needed
            const deltaPhi = event.movementY * -0.002; // Adjust sensitivity as needed
            if (document.pointerLockElement === this.renderer.domElement)
                this.scene.mainCamera.rotate(deltaTheta, deltaPhi);
            if (this.scene.activeLineVisibility) {
                let b = this.scene.linedrawer.bilboardRaycast(event.clientX, event.clientY, this.scene.vertecies, this.scene.mainCamera, true);
                if (b != null) {
                    this.scene.activeLineUpdate(b);
                    return;
                }
                this.scene.activeLineUpdate(this.scene.mainCamera.screenToWorldRay(event.clientX, event.clientY, window.innerWidth, window.innerHeight).add(this.scene.mainCamera.getPosition()));
            }
        };
        this.mouseWheel = (event) => {
            this.scene.mainCamera.zoom(event.deltaY * 0.01);
        };
        this.isEKeyPressed = false; // Flag to track if 'e' is currently pressed
        this.scene = scene;
        this.renderer = renderer;
    }
    // private constructor() {
    // }
    // Public static method to get the instance of the class
    static getInstance(scene, renderer) {
        if (!inputManager.instance) {
            inputManager.instance = new inputManager(scene, renderer);
        }
        return inputManager.instance;
    }
    init() {
        document.addEventListener('mousemove', this.mouseMove);
        document.addEventListener('wheel', this.mouseWheel);
        document.addEventListener('mousedown', this.mouseDown);
        document.addEventListener('mouseup', this.mouseUp);
        // Zapobiegaj domyślnemu menu kontekstowemu
        document.addEventListener('contextmenu', (e) => e.preventDefault());
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
        window.addEventListener('keydown', (r) => this.onKeyDown(r));
        window.addEventListener('keyup', (r) => this.onKeyUp(r));
    }
    onKeyDown(event) {
        this.keyStates[event.key.toLowerCase()] = true;
    }
    onKeyUp(event) {
        this.keyStates[event.key.toLowerCase()] = false;
    }
    isPressed(key) {
        return !!this.keyStates[key.toLowerCase()];
    }
    update() {
        let offset = new THREE.Vector3(0, 0.03, 0);
        if (this.isPressed('e')) {
            this.scene.mainCamera.setTarget(this.scene.mainCamera.getTarget().clone().add(offset));
            this.scene.mainCamera.updateProjectionMatrixP();
        }
        if (this.isPressed('q')) {
            this.scene.mainCamera.setTarget(this.scene.mainCamera.getTarget().sub(offset));
            this.scene.mainCamera.updateProjectionMatrixP();
        }
        if (this.isPressed('z') || this.isPressed("3")) {
            if (this.zPressed === false) {
                this.scene.linedrawer.undo();
                this.scene.createShape();
                this.zPressed = true;
            }
        }
        else
            this.zPressed = false;
        if (this.isPressed('r')) {
            if (!this.rKeyToggle) {
                this.renderer.domElement.requestPointerLock();
                this.rKeyToggle = true;
                this.lock = true;
            }
        }
        else {
            if (this.rKeyToggle) {
                document.exitPointerLock();
                this.rKeyToggle = false;
                this.lock = this.mouseToggle;
            }
        }
        if (this.isPressed('1')) {
            this.scene.linedrawer.setDrawingType(drawTypes.lines);
            this.scene.linedrawer.nullInters();
            this.scene.gui.selectButton(this.scene.gui.linesButton);
        }
        if (this.isPressed('2')) {
            this.scene.linedrawer.setDrawingType(drawTypes.angles);
            this.scene.linedrawer.nullInters();
            this.scene.gui.selectButton(this.scene.gui.anglesButton);
        }
    }
    cleanup() {
        document.removeEventListener('mousemove', this.mouseMove);
        document.removeEventListener('wheel', this.mouseWheel);
        document.removeEventListener('mousedown', this.mouseDown);
        document.removeEventListener('mouseup', this.mouseUp);
    }
}
