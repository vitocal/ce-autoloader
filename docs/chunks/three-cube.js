import*as e from"https://esm.sh/three@0.160.0";var t=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:`open`})}connectedCallback(){this.shadowRoot.innerHTML=`
            <style>
                :host { display: inline-flex; width: 100%; min-height: 160px; }
                #container { width: 100%; height: auto; }
            </style>
            <div id="container"></div>
        `;let t=this.shadowRoot.getElementById(`container`),n=t.clientWidth,r=t.clientHeight,i=new e.Scene;i.background=new e.Color(61680);let a=new e.PerspectiveCamera(75,n/r,.1,100);a.position.z=3;let o=new e.WebGLRenderer({antialias:!0});o.setSize(n,r),t.appendChild(o.domElement);let s=new e.BoxGeometry(2,2,2),c=new e.MeshNormalMaterial,l=new e.Mesh(s,c);i.add(l);let u=()=>{this.animationId=requestAnimationFrame(u),l.rotation.x+=.01,l.rotation.y+=.01,o.render(i,a)};u(),this.cleanup=()=>{cancelAnimationFrame(this.animationId),o.dispose()}}disconnectedCallback(){this.cleanup&&this.cleanup()}};customElements.define(`three-cube`,t);export{t as default};
//# sourceMappingURL=three-cube.js.map