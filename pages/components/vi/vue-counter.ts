import { defineCustomElement } from 'https://esm.sh/vue@3/dist/vue.esm-browser.prod.js';

const VueCounter = defineCustomElement({
    props: {},
    setup() {
        return {};
    },
    data() {
        return { count: 0 }
    },
    template: `
        <div class="counter-card vue">
            <h3>
                <svg class="logo" viewBox="0 0 128 128" width="24" height="24" data-v-0f418ad7=""><path fill="#42b883" d="M78.8,10L64,35.4L49.2,10H0l64,110l64-110C128,10,78.8,10,78.8,10z" data-v-0f418ad7=""></path><path fill="#35495e" d="M78.8,10L64,35.4L49.2,10H25.6L64,76l38.4-66H78.8z" data-v-0f418ad7=""></path></svg>
                Vue Counter
            </h3>
            <div class="controls">
                <button type="button" @click="count--">-</button>
                <span class="count">{{ count }}</span>
                <button type="button" @click="count++">+</button>
            </div>
        </div>
    `,

    styles: [`.vue h3 { color: #42b883; }`]
}, { shadowRoot: false });

export default VueCounter;
customElements.define('vue-counter', VueCounter);
