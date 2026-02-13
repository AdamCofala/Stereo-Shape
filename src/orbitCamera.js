import * as THREE from 'three';
export class OrbitCamera {
    constructor(options = {}) {
        this.zoomSpeed = 0.08;
        const { fov = 70, aspect = window.innerWidth / window.innerHeight, near = 0.1, far = 1000, position = new THREE.Vector3(0, 0, 5), target = new THREE.Vector3(0, 0, 0), distance = 5, minDistance = 1, maxDistance = 100, } = options;
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
    getPosition() {
        return this.camera.position;
    }
    getCamera() {
        return this.camera;
    }
    setPosition(pos) {
        // WRITE THIS
    }
    update(delta) {
        this.distance += (this.targetDistance - this.distance) * this.zoomSpeed;
        // Update camera position based on spherical coordinates
        this.updateCameraPosition();
        this.camera.lookAt(this.target);
    }
    getProjectionMatrixInverse() {
        return this.camera.projectionMatrixInverse;
    }
    getViewMatrix() {
        return this.camera.matrixWorldInverse;
    }
    getViewMatrixInverse() {
        return this.camera.matrixWorld;
    }
    updateProjectionMatrixP() {
        this.camera.updateProjectionMatrix();
    }
    screenToWorldRay(mouseX, mouseY, screenWidth, screenHeight) {
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
    getWorldDirection(target) {
        const direction = new THREE.Vector3();
        this.camera.getWorldDirection(direction);
        target.copy(direction);
    }
    updateAspect(aspect) {
        this.camera.aspect = aspect;
        this.camera.updateProjectionMatrix();
    }
    setTarget(target) {
        this.target.copy(target);
    }
    getTarget() {
        return this.target;
    }
    rotate(deltaTheta, deltaPhi) {
        this.theta += deltaTheta;
        this.phi = Math.max(0.01, Math.min(Math.PI - 0.01, this.phi + deltaPhi)); // Clamp phi
        this.updateCameraPosition();
    }
    zoom(deltaDistance) {
        this.targetDistance = Math.max(this.minDistance, Math.min(this.maxDistance, this.targetDistance + deltaDistance * 0.4));
    }
    updateCameraPosition() {
        const x = this.distance * Math.sin(this.phi) * Math.cos(this.theta);
        const y = this.distance * Math.cos(this.phi);
        const z = this.distance * Math.sin(this.phi) * Math.sin(this.theta);
        this.camera.position.set(x, y + this.target.y, z);
    }
}
