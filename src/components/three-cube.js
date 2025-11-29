import * as THREE from 'https://esm.sh/three@0.160.0';

export default class ThreeCube extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {

        this.shadowRoot.innerHTML = `
            <style>
                :host { display: inline-flex; width: 100%; height: 150px; }
                #container { width: 100%; height: 100%; }
            </style>
            <div id="container"></div>
        `;

        const container = this.shadowRoot.getElementById('container');
        const width = container.clientWidth;
        const height = container.clientHeight;

        // Scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);

        // Camera
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
        camera.position.z = 3;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        container.appendChild(renderer.domElement);

        // Cube
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const material = new THREE.MeshNormalMaterial();
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        // Animation
        const animate = () => {
            this.animationId = requestAnimationFrame(animate);
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
            renderer.render(scene, camera);
        };

        animate();

        // Cleanup
        this.cleanup = () => {
            cancelAnimationFrame(this.animationId);
            renderer.dispose();
        };
    }

    disconnectedCallback() {
        if (this.cleanup) this.cleanup();
    }
}
customElements.define('three-cube', ThreeCube);