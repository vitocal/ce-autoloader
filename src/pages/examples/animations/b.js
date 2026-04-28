export default class MyBButton extends HTMLElement {
    constructor() {
        super();
        this.render()
    }

    render() {
        this.innerHTML = `I'm the version <b>B</b>`
    }
}
