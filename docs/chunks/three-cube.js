import*as e from"three";var t=.6,n=.1,r=class extends HTMLElement{#e=null;constructor(){super(),this.attachShadow({mode:`open`})}connectedCallback(){if(this.#e)return;this.shadowRoot.innerHTML=`
            <style>
                :host { display: block; width: 100%; min-height: 160px; }
                #container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    width: 100%;
                    height: 100%;
                    min-height: 160px;
                }
                canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
            </style>
            <div id="container">
                <slot></slot>
            </div>
        `;let r=this.shadowRoot.getElementById(`container`),i;try{i=new e.WebGLRenderer({antialias:!0})}catch{this.textContent=`WebGL is unavailable`;return}let a=new e.Scene;a.background=new e.Color(61680);let o=new e.PerspectiveCamera(75,1,.1,100);o.position.z=3,i.setPixelRatio(Math.min(window.devicePixelRatio,2)),r.appendChild(i.domElement);let s=new e.BoxGeometry(2,2,2),c=new e.MeshNormalMaterial,l=new e.Mesh(s,c);a.add(l);let u=new e.Timer;u.connect(document);let d=e=>{u.update(e);let r=Math.min(u.getDelta(),n);l.rotation.x+=r*t,l.rotation.y+=r*t,i.render(a,o)},f=(e,t)=>{e&&t&&(o.aspect=e/t,o.updateProjectionMatrix(),i.setSize(e,t,!1),i.render(a,o))},p=window.matchMedia(`(prefers-reduced-motion: reduce)`),m=()=>{p.matches?(i.setAnimationLoop(null),i.render(a,o)):i.setAnimationLoop(d)},h=new IntersectionObserver(([e])=>{e.isIntersecting?m():i.setAnimationLoop(null)});h.observe(this);let g=new ResizeObserver(([e])=>{f(e.contentRect.width,e.contentRect.height)});g.observe(r),p.addEventListener(`change`,m),f(r.clientWidth,r.clientHeight),this.#e=()=>{i.setAnimationLoop(null),h.disconnect(),g.disconnect(),p.removeEventListener(`change`,m),u.dispose(),s.dispose(),c.dispose(),i.dispose(),i.forceContextLoss(),i.domElement.remove()}}disconnectedCallback(){queueMicrotask(()=>{this.isConnected||(this.#e?.(),this.#e=null)})}};customElements.get(`three-cube`)||customElements.define(`three-cube`,r);export{r as default};
//# sourceMappingURL=three-cube.js.map