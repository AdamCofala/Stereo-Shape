import * as THREE from "three";
import { OrbitCamera } from "./orbitCamera.js";
import { Shape } from "./shape.js";
import { GUI } from "dat.gui";
import { lineDrawer } from "./lineDrawer.js";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { handleGUI } from "./gui.js";

export default class mainScene extends THREE.Scene {
  private renderer: THREE.WebGLRenderer;

  constructor(renderer: THREE.WebGLRenderer) {
    super();

    // Step 2: Store the renderer so you can use it in other methods
    this.renderer = renderer;
    this.mainCamera = new OrbitCamera({
      position: new THREE.Vector3(0, 5, 10),
    });

    this.shape = new Shape();
    this.linedrawer = new lineDrawer(this);

    this.gui = new handleGUI(this);
    this.initialize();
  }

  //Objects
  mainCamera: OrbitCamera;
  shape: Shape;
  linedrawer: lineDrawer;
  gui: handleGUI;

  activeLinePoinst: THREE.Vector3[] = [];
  activeLine = new Line2();
  public activeLineVisibility = false;

  // Public variables
  public vertecies: THREE.Vector3[] = [];
  public hideCursor = 1;
  charArray: string[] = [];

  // Shape parameters for drawings
  public params = {
    type: 0,
    a: 2,
    b: 3,
    c: 4,
    h: 2,
    nangle: 4,
    in_circle: false,
    out_circle: false,
  };

  // Defined materials
  material = new LineMaterial({
    color: 0xff00ea,
    linewidth: 3,
    resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
    transparent: true,
    depthTest: true,
    depthWrite: true,
  });

  circleMaterial = new LineMaterial({
    color: 0x9500f4,
    linewidth: 3,
    resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
    transparent: true,
    depthTest: true,
    depthWrite: true,
  });

  public lineMaterial = new LineMaterial({
    color: 0xff96,
    linewidth: 3,
    resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
    transparent: true,
    depthTest: true,
    depthWrite: true,
  });

  public angleMaterial = new LineMaterial({
    color: 0xffdf,
    linewidth: 3,
    resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
    transparent: true,
    depthTest: true,
    depthWrite: true,
  });

  initialize() {
    this.gui.setupGUI();
    this.gui.createCustomLeftPanel();
    this.createShape();
  }

  public createShape() {
    this.clear();
    this.addLight();

    // Generate new shape
    const points = this.shape.createTrianglesVertices(
      this.params.a,
      this.params.b,
      this.params.c,
      this.params.h,
      this.params.type,
      this.params.nangle,
      this.params.in_circle,
      this.params.out_circle,
    );

    this.vertecies = points;
    const shape = this.createLine2(points, this.material, false);
    this.add(shape);

    const circlePoints = this.shape.getCircle();

    if (circlePoints.length > 0) {
      const circle = this.createLine2(circlePoints, this.circleMaterial, false);
      this.add(circle);
    }

    const rightAnglePoints = this.shape.getRightAngleMarker(
      points[0],
      points[1],
      points[2],
    );

    if (rightAnglePoints.length > 0) {
      const rightAngle = this.createLine2(
        rightAnglePoints,
        this.material,
        false,
      );
      this.add(rightAngle);
    }

    this.drawLines();
    this.drawAngles();

    if (this.activeLineVisibility) this.drawActiveLine();
  }

  public drawLines() {
    let i = 0;
    while (i < this.linedrawer.lineBuffer.length) {
      const points: THREE.Vector3[] = [
        this.linedrawer.lineBuffer[i].A,
        this.linedrawer.lineBuffer[i].B,
      ];

      const newlineMaterial = new LineMaterial({
        color: this.linedrawer.lineBuffer[i].color.getHex(),
        linewidth: 3,
        resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
        transparent: true,
        depthTest: true,
        depthWrite: true,
      });

      const newLine = this.createLine2(points, newlineMaterial, false);
      this.add(newLine);
      newLine.geometry;
      i++;
    }
  }

  public drawAngles() {
    let i = 0;
    while (i < this.linedrawer.angleBuffer.length) {
      const points: THREE.Vector3[] = this.linedrawer.generateAngle(
        this.linedrawer.angleBuffer[i].A,
        this.linedrawer.angleBuffer[i].B,
        this.linedrawer.angleBuffer[i].C,
      );

      const newlineMaterial = new LineMaterial({
        color: this.linedrawer.angleBuffer[i].color.getHex(),
        linewidth: 3,
        resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
        transparent: true,
        depthTest: true,
        depthWrite: true,
      });

      const angle = this.createLine2(points, newlineMaterial, false);
      this.add(angle);
      angle.geometry;
      i++;
    }
  }

  drawActiveLine() {
    const newlineMaterial = new LineMaterial({
      color: this.lineMaterial.color.getHex(),
      opacity: 0.8,
      transparent: true,
      linewidth: 3,
      resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
      depthTest: true,
    });

    const activeLineGeomatry = new LineGeometry().setFromPoints(
      this.activeLinePoinst,
    );

    this.activeLine = new Line2(activeLineGeomatry, newlineMaterial);
    this.add(this.activeLine);
  }

  public activeLineUpdate(A: THREE.Vector3) {
    if (this.activeLinePoinst.length === 2) {
      this.activeLinePoinst[1] = A;

      const positions = [
        this.activeLinePoinst[0].x,
        this.activeLinePoinst[0].y,
        this.activeLinePoinst[0].z,
        this.activeLinePoinst[1].x,
        this.activeLinePoinst[1].y,
        this.activeLinePoinst[1].z,
      ];

      this.activeLine.geometry.setPositions(positions);
      this.activeLine.geometry.attributes.position.needsUpdate = true;
    }
  }

  public clearAll() {
    this.linedrawer.lineBuffer.length = 0;
    this.linedrawer.angleBuffer.length = 0;
  }

  private createLine2(
    points: THREE.Vector3[],
    material: LineMaterial,
    closed: boolean = false,
  ): Line2 {
    const positions: number[] = [];

    points.forEach((point) => {
      positions.push(point.x, point.y, point.z);
    });

    if (closed && points.length > 0) {
      positions.push(points[0].x, points[0].y, points[0].z);
    }

    const geometry = new LineGeometry();
    geometry.setPositions(positions);

    return new Line2(geometry, material);
  }

  public onWindowResize() {
    this.material.resolution.set(window.innerWidth, window.innerHeight);
    this.circleMaterial.resolution.set(window.innerWidth, window.innerHeight);
    this.lineMaterial.resolution.set(window.innerWidth, window.innerHeight);
  }

  private addLight() {
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 4, 2);
    this.add(light);
  }

  public cleanup() {
    const existingPanel = document.getElementById("left-control-panel");
    if (existingPanel) {
      existingPanel.remove();
    }
  }

  public captureScreenshotWithCanvasCrop(padding: number = 20) {
    const camera = this.mainCamera.getCamera();
    const aspect = camera.aspect;

    const baseResolution = 4096; // For higher resolution than that the shape isnt fully visible
    const tempWidth = Math.floor(baseResolution * Math.max(1, aspect));
    const tempHeight = Math.floor(baseResolution * Math.max(1, 1 / aspect));

    const tempRenderer = new THREE.WebGLRenderer({
      preserveDrawingBuffer: true,
      antialias: true,
      alpha: true,
    });

    this.material.linewidth *= 2;
    this.circleMaterial.linewidth *= 2;

    tempRenderer.setSize(tempWidth, tempHeight);
    tempRenderer.setClearColor(0x000000, 0);
    tempRenderer.render(this, camera);

    this.material.linewidth /= 2;
    this.circleMaterial.linewidth /= 2;

    const gl = tempRenderer.getContext();
    const pixels = new Uint8Array(tempWidth * tempHeight * 4);
    gl.readPixels(
      0,
      0,
      tempWidth,
      tempHeight,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      pixels,
    );

    // Flip the image vertically
    const flippedPixels = new Uint8Array(pixels.length);
    for (let y = 0; y < tempHeight; y++) {
      const srcStart = y * tempWidth * 4;
      const destStart = (tempHeight - 1 - y) * tempWidth * 4;
      flippedPixels.set(
        pixels.subarray(srcStart, srcStart + tempWidth * 4),
        destStart,
      );
    }

    // Find bounds of non-transparent pixels
    const bounds = this.findContentBounds(flippedPixels, tempWidth, tempHeight);
    if (!bounds) {
      tempRenderer.dispose();
      return;
    }

    const croppedCanvas = document.createElement("canvas");
    const croppedCtx = croppedCanvas.getContext("2d")!;

    const cropX = Math.max(0, bounds.minX - padding);
    const cropY = Math.max(0, bounds.minY - padding);
    const cropWidth = Math.min(tempWidth, bounds.maxX + padding) - cropX;
    const cropHeight = Math.min(tempHeight, bounds.maxY + padding) - cropY;

    croppedCanvas.width = cropWidth;
    croppedCanvas.height = cropHeight;

    // Create a helper canvas for Uint8Array → ImageData conversion
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = tempWidth;
    tempCanvas.height = tempHeight;
    const tempCtx = tempCanvas.getContext("2d")!;
    const imageData = new ImageData(
      new Uint8ClampedArray(flippedPixels),
      tempWidth,
      tempHeight,
    );
    tempCtx.putImageData(imageData, 0, 0);

    // Copy the cropped section from the temporary canvas
    croppedCtx.drawImage(
      tempCanvas,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight,
    );

    // Save
    const screenshot = croppedCanvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = screenshot;
    link.download = `shape_tight_crop_${Date.now()}.png`;
    link.click();

    tempRenderer.dispose();
  }

  private findContentBounds(pixels: Uint8Array, width: number, height: number) {
    let minX = width,
      minY = height,
      maxX = 0,
      maxY = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        const alpha = pixels[index + 3];

        if (alpha > 0) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }

    return { minX, minY, maxX, maxY };
  }
}
