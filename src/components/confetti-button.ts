import confetti from 'https://esm.sh/canvas-confetti';

export default class ConfettiButton extends HTMLElement {
    connectedCallback() {
        // this.style.display = 'block';
        confetti({
            particleCount: 150,
            spread: 60,
            origin: {
                x: this.getBoundingClientRect().x / window.innerWidth,
                y: this.getBoundingClientRect().y / window.innerHeight
            }
        });

        this.addEventListener('click', (e: MouseEvent) => {
            confetti({
                particleCount: 150,
                spread: 60,
                origin: {
                    x: e.clientX / window.innerWidth,
                    y: e.clientY / window.innerHeight
                }
            });
        });
    }
}
customElements.define("confetti-button", ConfettiButton);
