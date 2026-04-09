import confetti from "canvas-confetti";

export default class ConfettiButton extends HTMLElement {
  connectedCallback() {
    this.style.display = "block";
    this.throwConfetti();

    this.addEventListener("click", (e: MouseEvent) => {
      this.throwConfetti(
        e.clientX / window.innerWidth,
        e.clientY / window.innerHeight,
      );
    });
  }

  throwConfetti(x?: number, y?: number) {
    if (x === undefined || y === undefined) {
      x = this.getBoundingClientRect().x / window.innerWidth;
      y = this.getBoundingClientRect().y / window.innerHeight;
    }

    confetti({
      particleCount: 150,
      spread: 60,
      origin: { x, y },
    });
  }
}
customElements.define("confetti-button", ConfettiButton);
