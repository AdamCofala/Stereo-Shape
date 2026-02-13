class VirtualCursor {
  private cursor: HTMLElement;
  private isActive = false;

  constructor() {
    this.cursor = document.getElementById('virtualCursor')!;
    this.init();
  }

  private init() {
    // Pokazuj/ukryj kursor w zależności od obecności myszy w oknie
    document.addEventListener('mouseenter', () => this.show());
    document.addEventListener('mouseleave', () => this.hide());

    // Aktualizuj pozycję kursora
    document.addEventListener('mousemove', (e) => this.updatePosition(e));

    // Przechwytuj kliknięcia (przykład dla lewego przycisku)
    document.addEventListener('mousedown', (e) => this.handleClick(e));
  }

  private show() {
    this.cursor.style.display = 'block';
    this.isActive = true;
  }

  private hide() {
    this.cursor.style.display = 'none';
    this.isActive = false;
  }

  private updatePosition(e: MouseEvent) {
    if (!this.isActive) return;
    this.cursor.style.left = `${e.clientX}px`;
    this.cursor.style.top = `${e.clientY}px`;
  }

  private handleClick(e: MouseEvent) {
    if (!this.isActive) return;

    // Symuluj kliknięcie na elementach pod kursorem (np. dla interakcji z UI)
    const elementUnderCursor = document.elementFromPoint(e.clientX, e.clientY);
    if (elementUnderCursor) {
      elementUnderCursor.dispatchEvent(new MouseEvent('click', { 
        bubbles: true,
        clientX: e.clientX,
        clientY: e.clientY 
      }));
    }
  }
}