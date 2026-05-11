export default class MyAButton extends HTMLElement {
    constructor() {
        super();
        this.render()
    }

    render() {
        this.innerHTML = `Im the version <b>A</b>`
    }
}

console.log("a loaded")