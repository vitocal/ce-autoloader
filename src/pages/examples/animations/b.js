export default class MyBButton extends HTMLElement {
    constructor() {
        super();
        this.render()
    }

    render() {
        this.innerHTML = `<b>B</b> component`
    }
}
