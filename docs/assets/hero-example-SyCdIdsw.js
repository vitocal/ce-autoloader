import{LitElement as v,css as j}from"lit";import{x as S}from"./lit-html-Dbe4NQd5.js";const b=Symbol.for(""),$=t=>{if(t?.r===b)return t?._$litStatic$},f=t=>({_$litStatic$:t,r:b}),y=new Map,T=t=>(e,...i)=>{const s=i.length;let a,o;const r=[],c=[];let h,l=0,d=!1;for(;l<s;){for(h=e[l];l<s&&(o=i[l],(a=$(o))!==void 0);)h+=a+e[++l],d=!0;l!==s&&c.push(o),r.push(h),l++}if(l===s&&r.push(e[s]),d){const k=r.join("$$lit$$");(e=y.get(k))===void 0&&(r.raw=r,y.set(k,e=r)),i=c}return t(e,...i)},u=T(S),g="she";async function C(){try{if(!window.Prism){const t="https://cdn.jsdelivr.net/npm/prismjs@1.30.0";await P(t),await z({baseUrl:t,language:SyntaxHighlightElement.config.languages})}}catch(t){console.error(t)}}function E(t,e){const i=window.Prism?.languages[e]||void 0;return i?window.Prism.tokenize(t,i).flatMap(x):(console.warn(`window.Prism.languages.${e} is undefined.`),[])}const q=["atrule","attr-name","attr-value","bold","boolean","builtin","cdata","char","class-name","comment","constant","deleted","doctype","entity","function","important","inserted","italic","keyword","namespace","number","operator","prolog","property","punctuation","regex","rule","selector","string","symbol","tag","url"],p={javascript:"clike",actionscript:"javascript",arduino:"cpp",aspnet:["markup","csharp"],bison:"c",c:"clike",csharp:"clike",cpp:"c",coffeescript:"javascript",crystal:"ruby","css-extras":"css",d:"clike",dart:"clike",django:"markup",erb:["ruby","markup-templating"],fsharp:"clike",flow:"javascript",glsl:"clike",go:"clike",groovy:"clike",haml:"ruby",handlebars:"markup-templating",haxe:"clike",java:"clike",jolie:"clike",kotlin:"clike",less:"css",markdown:"markup","markup-templating":"markup",n4js:"javascript",nginx:"clike",objectivec:"c",opencl:"cpp",parser:"markup",php:["clike","markup-templating"],"php-extras":"php",plsql:"sql",processing:"clike",protobuf:"clike",pug:"javascript",qore:"clike",jsx:["markup","javascript"],tsx:["jsx","typescript"],reason:"clike",ruby:"clike",sass:"css",scss:"css",scala:"java",smarty:"markup-templating",soy:"markup-templating",swift:"clike",tap:"yaml",textile:"markup",tt2:["clike","markup-templating"],twig:"markup",typescript:"javascript",vbnet:"basic",velocity:"markup",wiki:"markup",xeora:"markup",xquery:"markup"},A={html:"markup",xml:"markup",svg:"markup",mathml:"markup",ssml:"markup",atom:"markup",rss:"markup",js:"javascript",g4:"antlr4",ino:"arduino","arm-asm":"armasm",art:"arturo",adoc:"asciidoc",avs:"avisynth",avdl:"avro-idl",gawk:"awk",sh:"bash",shell:"bash",shortcode:"bbcode",rbnf:"bnf",oscript:"bsl",cs:"csharp",dotnet:"csharp",cfc:"cfscript","cilk-c":"cilkc","cilk-cpp":"cilkcpp",cilk:"cilkcpp",coffee:"coffeescript",conc:"concurnas",jinja2:"django","dns-zone":"dns-zone-file",dockerfile:"docker",gv:"dot",eta:"ejs",xlsx:"excel-formula",xls:"excel-formula",gamemakerlanguage:"gml",po:"gettext",gni:"gn",ld:"linker-script","go-mod":"go-module",hbs:"handlebars",mustache:"handlebars",hs:"haskell",idr:"idris",gitignore:"ignore",hgignore:"ignore",npmignore:"ignore",webmanifest:"json",kt:"kotlin",kts:"kotlin",kum:"kumir",tex:"latex",context:"latex",ly:"lilypond",emacs:"lisp",elisp:"lisp","emacs-lisp":"lisp",md:"markdown",moon:"moonscript",n4jsd:"n4js",nani:"naniscript",objc:"objectivec",qasm:"openqasm",objectpascal:"pascal",px:"pcaxis",pcode:"peoplecode",plantuml:"plant-uml",pq:"powerquery",mscript:"powerquery",pbfasm:"purebasic",purs:"purescript",py:"python",qs:"qsharp",rkt:"racket",razor:"cshtml",rpy:"renpy",res:"rescript",robot:"robotframework",rb:"ruby","sh-session":"shell-session",shellsession:"shell-session",smlnj:"sml",sol:"solidity",sln:"solution-file",rq:"sparql",sclang:"supercollider",t4:"t4-cs",trickle:"tremor",troy:"tremor",trig:"turtle",ts:"typescript",tsconfig:"typoscript",uscript:"unrealscript",uc:"unrealscript",url:"uri",vb:"visual-basic",vba:"visual-basic",webidl:"web-idl",mathematica:"wolfram",nb:"wolfram",wl:"wolfram",xeoracube:"xeora",yml:"yaml"},m=new Set;function H(t){return Array.from(t||[]).map(e=>A[e]||e)}function w(t){const e=H(t).reduce((i,s)=>{const a=p[s]?Array.isArray(p[s])?p[s]:[p[s]]:[];return i.push(...w(a),s),i},[]);return Array.from(new Set(e))}async function z({baseUrl:t,language:e}){const i=w(e);for(const s of i)await new Promise((a,o)=>{if(m.has(s))return a();const r=document.createElement("script");r.src=`${t}/components/prism-${s}.min.js`,r.async=!0,r.onload=()=>{document.head.removeChild(r),m.add(s),a(s)},r.onerror=c=>{document.head.removeChild(r),o(c)},document.head.appendChild(r)});return m}function P(t){return new Promise((e,i)=>{const s=document.createElement("script");s.src=`${t}/components/prism-core.min.js`,s.async=!0,s.onload=e,s.onerror=i,document.head.appendChild(s)})}function x(t){return typeof t?.content=="string"?t:Array.isArray(t.content)?t.content.flatMap(e=>typeof e=="string"?{type:t.type,content:e,length:e.length}:e).flatMap(x):t}const M={languages:["markup","css","javascript"],tokenTypes:q,languageTokens:{},setup:C,tokenize:E};function R(t=[],{languageTokens:e={}}={}){const i=Object.entries(e).flatMap(a=>{const[o,r]=a;return r.map(c=>`${o}-${c}`)}),s=[...t,...i];for(const a of s)CSS.highlights.set(a,new Highlight)}class n extends HTMLElement{static async define(e="syntax-highlight",i=customElements){if(!CSS.highlights){console.info("The CSS Custom Highlight API is not supported in this browser.");return}if(!i.get(e))return typeof n.#e?.setup=="function"&&await n.#e.setup(),R(n.#e.tokenTypes,{languageTokens:n.#e.languageTokens}),i.define(e,n),n}static#e=Object.assign(M,window[g]?.config||{});static get config(){return n.#e}static set config(e){n.#e=Object.assign(n.#e,e)}#s;#t=new Set;get contentElement(){return this.hasAttribute("content-selector")?this.querySelector(this.getAttribute("content-selector"))||this:this}get language(){return this.getAttribute("language")||"plaintext"}set language(e){this.setAttribute("language",e)}get highlights(){return this.#t}constructor(){super(),this.#s=this.attachInternals(),this.#s.role="code"}connectedCallback(){this.hasAttribute("tabindex")||this.setAttribute("tabindex","0"),this.paintTokenHighlights()}paintTokenHighlights(){const e=n.#e.tokenize(this.contentElement.innerText,this.language)||[],i=n.#e.languageTokens?.[this.language]||[];let s=0;for(const a of e){if(a.type){const o=i.includes(a.type)?`${this.language}-${a.type}`:a.type,r=new Range;r.setStart(this.contentElement.firstChild,s),r.setEnd(this.contentElement.firstChild,s+a.length),CSS.highlights.get(o)?.add(r),this.#t.add({tokenType:o,range:r})}s+=a.length}}clearTokenHighlights(){for(const e of this.highlights)CSS.highlights.get(e.tokenType)?.delete(e.range),this.#t.delete(e)}update(){this.clearTokenHighlights(),this.paintTokenHighlights()}}window[g]=window[g]||{};window.SyntaxHighlightElement=n;new URL(import.meta.url).searchParams.has("define","false")||await n.define();class L extends v{static styles=j`
    @layer component {
		hero-example {
			display: grid;
			grid-template-columns: 2fr 1fr;
			grid-gap: 1rem;
			position: relative;
			align-items: center;

			.left {
				grid-column: 1 / 2;
			}
			.right {
				grid-column: 2 / 3;
			}

			.preview {
				transition: height 0.3s ease-in-out;
			}
			.preview[mode="code"] {
				height: 150px;
			}
			.preview[mode="preview"] {
				height: calc-size(auto, size);
				height: auto;
			}
		}
		syntax-highlight {
			height: 100%; width: 100%;
  			white-space: pre-wrap;
		}
		three-cube {
			width: 100%;
			height: 160px;


			&:not(:defined) {
				width: 100%;
				height: 160px;

				background-color: var(--color-bg-dark);
			}
		}

		@media (max-width: 60ch) {
			hero-example {
				display: flex;
				flex-direction: column;
				width: 100%;
				flex-wrap: wrap;
				align-items: stretch;

				.left,.right {
					max-width: 100%;
				}
			}
		}
    }`;static properties={mode:{state:!0}};createRenderRoot(){return this}constructor(){super(),this.mode="code",this.constructor.styles.styleSheet&&!document.adoptedStyleSheets.includes(this.constructor.styles.styleSheet)&&document.adoptedStyleSheets.push(this.constructor.styles.styleSheet)}js_template(){return`import CERegistry from 'ce-autoloader';

const registry = new CERegistry({
	root: document.body,
	/* A central registry for all your components 😘 */
	catalog: {
		"three-cube": () => import("/src/components/three-cube.js"),
		"nord-button": "https://unpkg.com/@nord-ui/button@1.0.0/dist/nord-button.js",
	}
});

await registry.discover();`}html_template(){return`&lt;body>
		&lt;!-- Anywhere in my HTML page -->
		&lt;three-cube>&lt;/three-cube>
&lt;/body>`}onClick(){this.mode=this.mode==="code"?"preview":"code"}updated(){}render(){let e=this.mode==="code"?u`<pre><syntax-highlight language="html">${f(this.html_template())}</syntax-highlight></pre>`:u`<three-cube ce-outline-highlight></three-cube>`;return u`
			<div class="left card flex-y" >
        		<h4 class="flex-x">
					Javascript
					<nord-button @click=${this.onClick} class="ml-auto" variant="primary" size="m" square>
					  <nord-icon name="interface-play" label="Play" size="m"></nord-icon>
					</nord-button>
				</h4>
        		<pre><syntax-highlight language="js">${f(this.js_template())}</syntax-highlight></pre>
    		</div>

			<div class="preview right card flex-y" mode=${this.mode}>
				<h4 class="flex-x">Preview</h4>
				${e}
			</div>
		`}}customElements.define("hero-example",L);export{L as default};
