// /client/src/main.ts

import * as THREE from 'three'
import mainScene from './mainScene.js'
import inputManager from './inputManager.js'

let width = window.innerWidth
let height = window.innerHeight

const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('app') as HTMLCanvasElement,
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
    powerPreference: 'high-performance'
})

renderer.setSize(width, height)
renderer.setClearColor(0x1B1B25);

// Pass the renderer into the scene's constructor
const scene = new mainScene(renderer);
//scene.initialize()

// Now that both are created, you can export them
export { renderer, scene };

const inputManagerInstance = inputManager.getInstance(scene, renderer);
inputManagerInstance.init();

function updateWindowSize()
{
  width = window.innerWidth
  height = window.innerHeight
  renderer.setSize(width, height)
}

function tick() {
  inputManagerInstance.update();
  updateWindowSize();
  scene.mainCamera.updateAspect(width/height)
  scene.mainCamera.update(0);
  renderer.render(scene, scene.mainCamera.getCamera());

  requestAnimationFrame(tick);
}
tick();