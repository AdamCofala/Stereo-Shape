class VirtualCursor {
  private cursor: HTMLElement;
  private isActive = false;

  constructor() {
    this.cursor = document.getElementById("virtualCursor")!;
    this.init();
  }

  private init() {
    // Show/hide cursor based on mouse presence in the window
    document.addEventListener("mouseenter", () => this.show());
    document.addEventListener("mouseleave", () => this.hide());

    // Update cursor position
    document.addEventListener("mousemove", (e) => this.updatePosition(e));

    // Intercept clicks (example for left button)
    document.addEventListener("mousedown", (e) => this.handleClick(e));
  }

  private show() {
    this.cursor.style.display = "block";
    this.isActive = true;
  }

  private hide() {
    this.cursor.style.display = "none";
    this.isActive = false;
  }

  private updatePosition(e: MouseEvent) {
    if (!this.isActive) return;
    this.cursor.style.left = `${e.clientX}px`;
    this.cursor.style.top = `${e.clientY}px`;
  }

  private handleClick(e: MouseEvent) {
    if (!this.isActive) return;

    // Simulate click on elements under cursor (e.g., for UI interaction)
    const elementUnderCursor = document.elementFromPoint(e.clientX, e.clientY);
    if (elementUnderCursor) {
      elementUnderCursor.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          clientX: e.clientX,
          clientY: e.clientY,
        }),
      );
    }
  }
}
