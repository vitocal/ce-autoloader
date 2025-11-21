import confetti from 'https://esm.sh/canvas-confetti';

export default class ConfettiButton extends HTMLElement {
    connectedCallback() {
        this.style.display = 'block';
        this.addEventListener('click', (e: MouseEvent) => {
            // If the click target is a button, or the component itself
            const target = e.target as HTMLElement;
            if (target?.tagName === 'BUTTON' || target === this) {
                confetti({
                    particleCount: 150,
                    spread: 60,
                    origin: {
                        x: e.clientX / window.innerWidth,
                        y: e.clientY / window.innerHeight
                    }
                });
            }
        });
    }
}
customElements.define("confetti-button", ConfettiButton);
