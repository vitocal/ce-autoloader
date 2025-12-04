import*as e from"https://esm.sh/three@0.160.0";class l extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}connectedCallback(){this.shadowRoot.innerHTML=`
            <style>
                :host { display: inline-flex; width: 100%; min-height: 160px; }
                #container { width: 100%; height: 100%; }
            </style>
            <div id="container"></div>
        `;const n=this.shadowRoot.getElementById("container"),a=n.clientWidth,s=n.clientHeight,i=new e.Scene;i.background=new e.Color(0);const c=new e.PerspectiveCamera(75,a/s,.1,100);c.position.z=3;const t=new e.WebGLRenderer({antialias:!0});t.setSize(a,s),n.appendChild(t.domElement);const d=new e.BoxGeometry(2,2,2),h=new e.MeshNormalMaterial,o=new e.Mesh(d,h);i.add(o);const r=()=>{this.animationId=requestAnimationFrame(r),o.rotation.x+=.01,o.rotation.y+=.01,t.render(i,c)};r(),this.cleanup=()=>{cancelAnimationFrame(this.animationId),t.dispose()}}disconnectedCallback(){this.cleanup&&this.cleanup()}}customElements.define("three-cube",l);export{l as default};
