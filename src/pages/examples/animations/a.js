export default class MyAButton extends HTMLElement {
    constructor() {
        super();
        this.render()
    }

    render() {
        this.innerHTML = `<b>A</b> component`
    }
}

console.log("a loaded")