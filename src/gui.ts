import { GUI } from "dat.gui";
//import {scene} from './main.js'
import { lineDrawer } from "./lineDrawer.js";
import mainScene from "./mainScene.js"; // Import the TYPE, not the instance

export enum drawTypes {
  lines,
  angles,
}

export class handleGUI {
  private gui: GUI | null = null;

  private scene: mainScene;

  constructor(sceneToControl: mainScene) {
    // 2. STORE the scene for use in other methods
    this.scene = sceneToControl;
  }

  public setupGUI() {
    if (this.gui) this.gui.destroy();
    this.gui = new GUI({
      autoPlace: true,
      hideable: false,
      closed: false,
      closeOnTop: false,
    });

    const shapeFolder = this.gui.addFolder("Shape Settings");
    shapeFolder.open();

    const state = { act: "Scalene Triangle" };
    const typeOptions = [
      "Scalene Triangle",
      "Right Triangle",
      "Right Isosceles Triangle",
      "Isosceles Triangle",
      "Equilateral Triangle",
      "Regular Pyramid",
      "Rectangular Pyramid",
      "Cuboid",
      "Regular Prism",
    ];

    shapeFolder
      .add(state, "act")
      .options(typeOptions)
      .name("Base / Shape Type")
      .onChange(() => {
        this.scene.params.type = typeOptions.indexOf(state.act);
        this.scene.clearAll();
        this.scene.createShape();
      });

    // Dimension parameters
    const paramsFolder = shapeFolder.addFolder("Dimensions");
    paramsFolder
      .add(this.scene.params, "a", 0.1, 6)
      .step(0.1)
      .name("Side A")
      .onChange(() => {
        (this.scene.clearAll(), this.scene.createShape());
      });
    paramsFolder
      .add(this.scene.params, "b", 0.1, 6)
      .step(0.1)
      .name("Side B")
      .onChange(() => {
        (this.scene.clearAll(), this.scene.createShape());
      });
    paramsFolder
      .add(this.scene.params, "c", 0.1, 6)
      .step(0.1)
      .name("Side C")
      .onChange(() => {
        (this.scene.clearAll(), this.scene.createShape());
      });
    paramsFolder
      .add(this.scene.params, "h", 0.1, 6)
      .step(0.1)
      .name("Height")
      .onChange(() => {
        (this.scene.clearAll(), this.scene.createShape());
      });
    paramsFolder
      .add(this.scene.params, "nangle", 3, 16)
      .step(1)
      .name("Number of Sides")
      .onChange(() => {
        (this.scene.clearAll(), this.scene.createShape());
      });
    paramsFolder.open();

    // Circles
    const circleFolder = shapeFolder.addFolder("Base Circles");

    circleFolder
      .add(this.scene.params, "in_circle")
      .name("Inscribed Circle")
      .listen()
      .onChange((value: boolean) => {
        if (value) {
          this.scene.params.out_circle = false;
        }
        this.scene.clearAll();
        this.scene.createShape();
      });

    circleFolder
      .add(this.scene.params, "out_circle")
      .name("Circumscribed Circle")
      .listen()
      .onChange((value: boolean) => {
        if (value) {
          this.scene.params.in_circle = false;
        }
        this.scene.clearAll();
        this.scene.createShape();
      });

    circleFolder.open();

    const visualsFolder = this.gui.addFolder("Visuals & Image");

    const lineFolder = visualsFolder.addFolder("Line Width");
    const lineParams = {
      mainLineWidth: 3,
      circleLineWidth: 3,
    };

    lineFolder
      .add(lineParams, "mainLineWidth", 1, 20)
      .step(1)
      .name("Main Lines")
      .onChange((value: number) => {
        this.scene.material.linewidth = value;
        this.scene.createShape();
      });

    lineFolder
      .add(lineParams, "circleLineWidth", 1, 20)
      .step(1)
      .name("Circles")
      .onChange((value: number) => {
        this.scene.circleMaterial.linewidth = value;
        this.scene.createShape();
      });

    lineFolder.open();

    const colorFolder = visualsFolder.addFolder("Colors");
    const colorParams = {
      Shape: this.scene.material.color.getHex(),
      Circle: this.scene.circleMaterial.color.getHex(),
      Line: this.scene.lineMaterial.color.getHex(),
      Angles: this.scene.angleMaterial.color.getHex(),
    };
    colorFolder.addColor(colorParams, "Shape").onChange((value) => {
      this.scene.material.color.set(value);
      this.scene.createShape();
    });
    colorFolder.addColor(colorParams, "Circle").onChange((value) => {
      this.scene.circleMaterial.color.set(value);
      this.scene.createShape();
    });
    colorFolder.addColor(colorParams, "Line").onChange((value) => {
      this.scene.lineMaterial.color.set(value);
      this.scene.drawLines();
    });
    colorFolder.addColor(colorParams, "Angles").onChange((value) => {
      this.scene.angleMaterial.color.set(value);
      this.scene.drawAngles();
    });
    colorFolder.open();

    let functions = {
      screenShot: () => this.scene.captureScreenshotWithCanvasCrop(),
    };
    const imageFolder = visualsFolder.addFolder("Image");
    imageFolder.add(functions, "screenShot").name("Save image as .png");
    imageFolder.open();

    visualsFolder.open();

    this.gui.domElement.style.margin = "70px";
    this.gui.domElement.style.position = "fixed";
    this.gui.domElement.style.zIndex = "3000";
    this.gui.domElement.style.right = "0";
    this.gui.domElement.style.scale = "1.1";
  }

  selectedButton: HTMLDivElement | null = null;
  linesButton: HTMLDivElement | null = null;
  anglesButton: HTMLDivElement | null = null;

  public selectButton = (button: HTMLDivElement) => {
    if (this.selectedButton) {
      this.selectedButton.style.background = "#2a2a3a";
      this.selectedButton.style.borderColor = "#444";
    }
    button.style.background = "#c1b8ff50";
    button.style.borderColor = "#666";
    this.selectedButton = button;
  };

  public createCustomLeftPanel() {
    // Remove existing panel if it exists
    const existingPanel = document.getElementById("left-control-panel");
    if (existingPanel) existingPanel.remove();

    // Create the panel container
    const panel = document.createElement("div");
    panel.id = "left-control-panel";
    panel.style.cssText = `q
            scale: 0.9;
            position: fixed;
            left: 20px;
            top: 20px;
            width: auto;
            background: #1d1d27;
            border: 1px solid #555;
            border-radius: 8px;
            padding: 15px;
            font-family: 'Overpass', Arial, sans-serif;
            font-size: 12px;
            color: white;
            z-index: 3000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        `;

    // Add drawing controls section
    const drawingTitle = document.createElement("h4");
    drawingTitle.textContent = "DRAWING";
    drawingTitle.style.cssText = `
            margin: 0 0 15px 0;
            color: #fff;
            font-size: 14px;
            letter-spacing: 0.5px;
            border-bottom: 1px solid #444;
            padding-bottom: 8px;
        `;
    panel.appendChild(drawingTitle);

    // Button container
    const buttonsContainer = document.createElement("div");
    buttonsContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 12px;
        `;

    const buttonBaseStyle = `
            width: 60px;
            height: 60px;
            background: #2a2a3a;
            border: 2px solid #444;
            border-radius: 6px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        `;

    const selectButton = (button: HTMLDivElement) => {
      if (this.selectedButton) {
        this.selectedButton.style.background = "#2a2a3a";
        this.selectedButton.style.borderColor = "#444";
      }
      button.style.background = "#c1b8ff50";
      button.style.borderColor = "#666";
      this.selectedButton = button;
    };

    const addHoverEffects = (button: HTMLDivElement) => {
      button.onmouseenter = () => {
        if (this.selectedButton !== button)
          button.style.background = "#c1b8ff75";
        button.style.borderColor = "#b384ff";
        button.style.transform = "translateY(-2px)";
      };
      button.onmouseleave = () => {
        if (this.selectedButton !== button) button.style.background = "#2a2a3a";
        button.style.borderColor = "#444";
        button.style.transform = "none";
      };
    };

    // Lines button
    this.linesButton = document.createElement("div");
    this.linesButton.style.cssText = buttonBaseStyle;
    this.linesButton.innerHTML = `
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <line x1="5" y1="10" x2="35" y2="10" stroke="white" stroke-width="2" />
                <line x1="5" y1="20" x2="35" y2="20" stroke="white" stroke-width="2" />
                <line x1="5" y1="30" x2="35" y2="30" stroke="white" stroke-width="2" />
            </svg>
        `;
    addHoverEffects(this.linesButton);
    this.linesButton.onclick = () => {
      selectButton(this.linesButton!);
      this.scene.linedrawer.nullInters();
      this.scene.linedrawer.drawingType = drawTypes.lines;
    };

    // Angles button
    this.anglesButton = document.createElement("div");
    this.anglesButton.style.cssText = buttonBaseStyle;
    this.anglesButton.innerHTML = `
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <line x1="20" y1="30" x2="5" y2="10" stroke="white" stroke-width="2" />
                <line x1="20" y1="30" x2="35" y2="10" stroke="white" stroke-width="2" />
                <path d="M10 25 A8 8 0 0 1 30 25" stroke="white" stroke-width="1" fill="none" />
            </svg>
        `;
    addHoverEffects(this.anglesButton);
    this.anglesButton.onclick = () => {
      selectButton(this.anglesButton!);
      this.scene.linedrawer.nullInters();
      this.scene.linedrawer.drawingType = drawTypes.angles;
    };

    // Clear button as a div instead of a button
    const undo = document.createElement("div");
    undo.style.cssText =
      buttonBaseStyle +
      `
        background: #2a2a3a;
        font-family: 'Overpass';
        font-weight: bold;
        font-size: 12px;
        color: white;
        letter-spacing: 0.5px;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
    `;

    const undoText = document.createElement("span");
    undoText.textContent = "UNDO";
    undoText.style.fontWeight = "bold";
    undo.appendChild(undoText);

    undo.onmouseenter = () => {
      undo.style.background = "#c1b8ff75";
      undo.style.borderColor = "#b384ff";
      undo.style.transform = "translateY(-2px)";
    };
    undo.onmouseleave = () => {
      undo.style.background = "#2a2a3a";
      undo.style.borderColor = "#444";
      undo.style.transform = "none";
    };
    undo.onclick = () => {
      this.scene.linedrawer.undo();
      this.scene.createShape();
    };

    // Clear button as a div instead of a button
    const clearBtn = document.createElement("div");
    clearBtn.style.cssText =
      buttonBaseStyle +
      `
        background: #2a2a3a;
        font-family: 'Overpass';
        font-weight: bold;
        font-size: 12px;
        color: white;
        letter-spacing: 0.5px;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
    `;

    const clearText = document.createElement("span");
    clearText.textContent = "CLEAR ALL";
    clearText.style.fontWeight = "bold";
    clearBtn.appendChild(clearText);

    clearBtn.onmouseenter = () => {
      clearBtn.style.background = "#c1b8ff75";
      clearBtn.style.borderColor = "#b384ff";
      clearBtn.style.transform = "translateY(-2px)";
    };
    clearBtn.onmouseleave = () => {
      clearBtn.style.background = "#2a2a3a";
      clearBtn.style.borderColor = "#444";
      clearBtn.style.transform = "none";
    };
    clearBtn.onclick = () => {
      this.scene.clearAll();
      this.scene.createShape();
    };

    // Append all buttons
    buttonsContainer.appendChild(this.linesButton);
    buttonsContainer.appendChild(this.anglesButton);
    buttonsContainer.appendChild(undo);
    buttonsContainer.appendChild(clearBtn);
    panel.appendChild(buttonsContainer);

    // Add to DOM
    document.body.appendChild(panel);

    // Select default button
    selectButton(this.linesButton);
  }
}
