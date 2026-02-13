# StereoShape

## 1. Project Overview

Real-time 3D geometry visualization tool built with Three.js and TypeScript. Create, inspect, and annotate 3D geometric shapes directly in the browser — from simple triangles to prisms and cuboids.

You can play with it online: https://adamcofala.github.io/Stereo-Shape/

**Key Features:**
- 9 shape types: scalene/right/isosceles/equilateral triangles, regular pyramids, rectangular pyramids, cuboids, regular prisms
- Interactive 3D orbital camera with mouse rotation and scroll zoom
- Draw lines and measure angles directly on shapes with vertex snapping
- Inscribed and circumscribed circle visualization on triangle bases
- Right angle markers automatically displayed
- Customizable colors, line widths, and dimensions via dat.GUI panel
- High-resolution screenshot export (cropped to shape bounds)
- Undo system for drawn annotations

| Feature | Description |
|---|---|
| Shape builder | Choose from 9 shape types with adjustable dimensions (sides A/B/C, height, number of sides) |
| Line & angle tools | Click vertices/edges to draw measurement lines and angle arcs with smart snapping |
| Circle overlays | Toggle inscribed or circumscribed circles on the triangle base |
| Screenshot export | Save a transparent, cropped PNG at up to 4096px resolution |

---

## 2. Architecture

### 2.1. `mainScene` ([src/mainScene.ts](src/mainScene.ts))
Extends `THREE.Scene`. Central manager that owns the camera, shape generator, line drawer, GUI, and all materials. Handles shape creation, line/angle rendering, active line preview, window resize, and screenshot capture.

### 2.2. `Shape` ([src/shape.ts](src/shape.ts))
Pure geometry generator. Computes 3D vertices for all 9 shape types using parametric math. Handles triangle inequality validation, right angle marker generation, and inscribed/circumscribed circle computation (circumcenter, incenter, inradius, circumradius).

### 2.3. `handleGUI` ([src/gui.ts](src/gui.ts))
Builds the dat.GUI control panel (shape type, dimensions, circles, colors, line widths, screenshot) and the left-side drawing toolbar (lines, angles, undo, clear). All controls trigger live scene updates.

### 2.4. `lineDrawer` ([src/lineDrawer.ts](src/lineDrawer.ts))
Drawing engine for annotations. Uses billboard-based raycasting to detect clicks on shape edges, snaps to vertices/midpoints/height projections/line intersections, manages line and angle buffers with undo support, and computes segment-segment intersections for snap points.

### 2.5. `OrbitCamera` ([src/orbitCamera.ts](src/orbitCamera.ts))
Spherical coordinate orbital camera. Supports mouse-drag rotation, scroll zoom with smooth interpolation, keyboard height adjustment (Q/E), and provides screen-to-world ray conversion for the raycasting system.

### 2.6. `inputManager` ([src/inputManager.ts](src/inputManager.ts))
Singleton input handler. Routes mouse events (click, drag, scroll) and keyboard shortcuts to the camera and line drawer. Manages pointer lock for camera rotation and keyboard-based tool switching.

### 2.7. `main` ([src/main.ts](src/main.ts))
Application entry point. Creates the WebGL renderer, scene, and input manager. Runs the main animation loop: input update → resize → camera update → render.

---

## 3. User Guide

### 3.1. Requirements
- Node.js 18+
- npm

### 3.2. Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open the URL printed in the terminal (usually `http://localhost:5173/Stereo-Shape/`).

### 3.3. Building for Production

```bash
npm run build
```

Output goes to the `dist/` folder. Preview with `npm run preview`.

### 3.4. Controls

| Input | Action |
|---|---|
| **Left Click** | Place line/angle point on shape |
| **Middle Mouse (hold)** | Rotate camera |
| **Scroll** | Zoom in/out |
| **Q / E** | Move camera target down / up |
| **R** | Toggle pointer lock for camera rotation |
| **1** | Switch to Line drawing mode |
| **2** | Switch to Angle drawing mode |
| **Z / 3** | Undo last drawn annotation |

### 3.5. GUI Panel (right side)

**Shape Settings:**
- **Base / Shape Type** — select from 9 geometric shapes
- **Dimensions** — adjust sides A, B, C, height, and polygon side count
- **Base Circles** — toggle inscribed or circumscribed circle

**Visuals & Image:**
- **Line Width** — main shape lines and circle lines
- **Colors** — shape, circle, drawn lines, and angle arcs
- **Image** — save a cropped transparent PNG screenshot

### 3.6. Drawing Toolbar (left side)

| Button | Function |
|---|---|
| Lines (≡) | Draw line segments between two points |
| Angles (∠) | Mark angles by selecting three points |
| UNDO | Remove last drawn annotation |
| CLEAR ALL | Remove all drawn annotations |

---

## 4. Deployment

The project is configured for **GitHub Pages** deployment via GitHub Actions.

On every push to `main` (or `master`), the workflow in `.github/workflows/deploy.yml`:
1. Installs dependencies (`npm ci`)
2. Builds the project (`npm run build`)
3. Deploys the `dist/` folder to GitHub Pages

The site is available at: `https://<username>.github.io/Stereo-Shape/`

---

## 5. Future Enhancements

- Dimension labels displayed on edges
- Angle value display (degrees) on arcs
- Surface area and volume calculation panel
- Touch/mobile support
- More shape types (cones, spheres, cylinders)
- Animation/rotation mode for presentation
- Share shape configuration via URL parameters
