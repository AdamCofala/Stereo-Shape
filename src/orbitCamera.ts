import * as THREE from 'three';
import { GUI } from 'dat.gui';


interface OrbitCameraOptions {
    fov?: number;
    aspect?: number;
    near?: number;
    far?: number;
    position?: THREE.Vector3;
    target?: THREE.Vector3;
    distance?: number;
    minDistance?: number;
    maxDistance?: number;
}

export class OrbitCamera {
    private camera: THREE.PerspectiveCamera;
    private target: THREE.Vector3;
    private distance: number;
    private minDistance: number;
    private maxDistance: number;
    private theta: number;
    private phi: number;
    private targetDistance: number;
    private zoomSpeed: number = 0.08;

    constructor(options: OrbitCameraOptions = {}) {
        const {
            fov = 70,
            aspect = window.innerWidth / window.innerHeight,
            near = 0.1,
            far = 1000,
            position = new THREE.Vector3(0, 0, 5),
            target = new THREE.Vector3(0, 0, 0),
            distance = 5,
            minDistance = 1,
            maxDistance = 100,
            
        } = options;

        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.camera.position.copy(position);
        this.target = target;
        this.distance = distance;
        this.minDistance = minDistance;
        this.maxDistance = maxDistance;
        this.targetDistance = distance;
        
        this.theta = 0;
        this.phi = Math.PI / 4; // Start at 45 degrees

        this.updateCameraPosition();
    }

    public getPosition(): THREE.Vector3{
        return this.camera.position;
    }
    
    public getCamera(): THREE.PerspectiveCamera {
        return this.camera;
    }

    public setPosition(pos: THREE.Vector3) {
            // WRITE THIS
    }


    public update(delta: number): void {

        this.distance += (this.targetDistance - this.distance) * this.zoomSpeed;
        
        // Update camera position based on spherical coordinates
        this.updateCameraPosition();
        this.camera.lookAt(this.target);
    }

    public getProjectionMatrixInverse(): THREE.Matrix4 {
        return this.camera.projectionMatrixInverse;
    }

    public getViewMatrix(): THREE.Matrix4
    {
        return this.camera.matrixWorldInverse;
    }

    public getViewMatrixInverse(): THREE.Matrix4 {
        return this.camera.matrixWorld;
    }

    public updateProjectionMatrixP()
    {
        this.camera.updateProjectionMatrix();
    }

    public screenToWorldRay(mouseX: number, mouseY: number, screenWidth: number, screenHeight: number): THREE.Vector3 {
        // Konwersja do NDC
        const x = (2.0 * mouseX) / screenWidth - 1.0;
        const y = 1.0 - (2.0 * mouseY) / screenHeight;

        // Punkt na near plane w clip space
        const rayClip = new THREE.Vector4(x, y, -1.0, 1.0);

        // Konwersja do eye space
        const rayEye = rayClip.clone().applyMatrix4(this.camera.projectionMatrixInverse);
        rayEye.z = -1.0;
        rayEye.w = 0.0; // Wektor kierunkowy, nie punkt

        // Konwersja do world space
        const rayWorld = rayEye.clone().applyMatrix4(this.camera.matrixWorld);

        return new THREE.Vector3(rayWorld.x, rayWorld.y, rayWorld.z).normalize();
    }

    public getWorldDirection(target: THREE.Vector3): void 
    {
        const direction = new THREE.Vector3();
        this.camera.getWorldDirection(direction);
        target.copy(direction);
    }

    public updateAspect(aspect: number)
    {
        this.camera.aspect = aspect;
        this.camera.updateProjectionMatrix();
    }
    public setTarget(target: THREE.Vector3): void {
        this.target.copy(target);
    }

    public getTarget()
    {
        return this.target;
    }

    public rotate(deltaTheta: number, deltaPhi: number): void {
        this.theta += deltaTheta;
        this.phi = Math.max(0.01, Math.min(Math.PI - 0.01, this.phi + deltaPhi)); // Clamp phi
        this.updateCameraPosition();
    }

    public zoom(deltaDistance: number): void {
        this.targetDistance = Math.max(this.minDistance, Math.min(this.maxDistance, this.targetDistance + deltaDistance*0.4));
    }

    private updateCameraPosition(): void {
        const x = this.distance * Math.sin(this.phi) * Math.cos(this.theta);
        const y = this.distance * Math.cos(this.phi);
        const z = this.distance * Math.sin(this.phi) * Math.sin(this.theta);

        this.camera.position.set(x, y+this.target.y, z);
    }
}