import * as Plot from "https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/+esm";

export default class ObservablePlotWrapper extends HTMLElement {
    connectedCallback() {
        const data = this.generateData();
        const plot = Plot.plot({
            style: {
                background: "transparent",
                fontFamily: "Times New Roman, serif",
                fontSize: "12px"
            },
            grid: true,
            y: {
                label: "↑ Complexity"
            },
            x: {
                label: "Time →"
            },
            marks: [
                Plot.lineY(data, {x: "x", y: "y", stroke: "steelblue"}),
                Plot.dot(data, {x: "x", y: "y", stroke: "steelblue", fill: "white"}),
                Plot.ruleY([0])
            ],
            caption: "Fig 2.1: The exponential growth of node_modules over time."
        });

        this.innerHTML = ''; // Clear loading state if any
        this.append(plot);
    }

    generateData() {
        // Generate a sigmoid-like curve to represent "complexity"
        const data = [];
        for (let i = -5; i <= 5; i += 0.5) {
            data.push({
                x: i + 5,
                y: 1 / (1 + Math.exp(-i)) + (Math.random() * 0.1 - 0.05)
            });
        }
        return data;
    }
}
customElements.define("observable-plot-wrapper", ObservablePlotWrapper);