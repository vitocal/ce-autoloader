import{onCLS as e,onFCP as t,onINP as n,onLCP as r,onTTFB as i}from"web-vitals";var a=[{id:`lcp`,type:`largest-contentful-paint`,acronym:`LCP`,label:`Largest Contentful Paint`,unit:`seconds`,good:2500,poor:4e3,core:!0,href:`https://web.dev/articles/lcp`},{id:`inp`,type:`event`,acronym:`INP`,label:`Interaction to Next Paint`,unit:`milliseconds`,good:200,poor:500,core:!0,href:`https://web.dev/articles/inp`},{id:`cls`,type:`layout-shift`,acronym:`CLS`,label:`Cumulative Layout Shift`,unit:`unitless`,good:.1,poor:.25,core:!0,href:`https://web.dev/articles/cls`},{id:`fcp`,type:`paint`,acronym:`FCP`,label:`First Contentful Paint`,unit:`seconds`,good:1800,poor:3e3,href:`https://web.dev/articles/fcp`},{id:`ttfb`,type:`navigation`,acronym:`TTFB`,label:`Time to First Byte`,unit:`milliseconds`,good:800,poor:1800,href:`https://web.dev/articles/ttfb`}],o=`https://pagespeed.web.dev/analysis?url=https://vitocal.github.io/ce-autoloader/`,s={good:`Good`,average:`Needs improvement`,poor:`Poor`,unknown:`Not measured`,unsupported:`Not supported`},c=new Set(globalThis.PerformanceObserver?.supportedEntryTypes??[]);function l(e){return c.has(e.type)}function u(e,t){return l(e)?t==null||!Number.isFinite(t)?`unknown`:t<=e.good?`good`:t<=e.poor?`average`:`poor`:`unsupported`}function d(e,t){return l(e)?t==null||!Number.isFinite(t)?`—`:e.unit===`seconds`?`${(t/1e3).toFixed(1)} s`:e.unit===`milliseconds`?`${Math.round(t)} ms`:t.toFixed(3):`n/a`}var f=class extends HTMLElement{#e={fcp:null,lcp:null,cls:null,inp:null,ttfb:null};#t=null;#n=null;constructor(){super(),this.attachShadow({mode:`open`})}connectedCallback(){this.shadowRoot.innerHTML=`<style>${p}</style><div class="panel"></div>`,this.#n=this.shadowRoot.querySelector(`.panel`);let a={reportAllChanges:!0};r(({value:e})=>this.#r(`lcp`,e),a),n(({value:e})=>this.#r(`inp`,e),a),e(({value:e})=>this.#r(`cls`,e),a),t(({value:e})=>this.#r(`fcp`,e),a),i(({value:e})=>this.#r(`ttfb`,e),a),this.#o()}disconnectedCallback(){cancelAnimationFrame(this.#t)}#r(e,t){this.#e[e]!==t&&(this.#e[e]=t,this.#i())}#i(){this.#t||=requestAnimationFrame(()=>{this.#t=null,this.#o()})}#a(){let e=a.filter(e=>e.core&&l(e)),t=e.filter(e=>this.#e[e.id]==null);return t.length===1&&t[0].id===`inp`?{rating:`unknown`,text:`Waiting for a first interaction`}:t.length?{rating:`unknown`,text:`Measuring…`}:e.every(e=>u(e,this.#e[e.id])===`good`)?{rating:`good`,text:`Passed`}:{rating:`poor`,text:`Failed`}}#o(){let e=this.#a(),t=a.map(e=>{let t=this.#e[e.id],n=u(e,t);return`
        <li data-rating="${n}"${e.core?``:` data-supporting="true"`}>
          <span class="dot" aria-hidden="true"></span>
          <span class="name">
            <a href="${e.href}" target="_blank" rel="noopener">${e.label}</a>
            <span class="acronym">${e.acronym}</span>
          </span>
          <span class="value">${d(e,t)}</span>
          <span class="rating">${s[n]}</span>
        </li>`}).join(``);this.#n.innerHTML=`
      <div class="headline" data-rating="${e.rating}">
        <p class="title">Core Web Vitals <span class="verdict">${e.text}</span></p>
        <p class="note">
          This session, unthrottled, in this browser. CrUX judges the 75th percentile of real users instead —
          <a href="${o}" target="_blank" rel="noopener">run Lighthouse on this page</a>.
        </p>
      </div>
      <ul class="metrics">${t}</ul>
    `}},p=`
  :host {
    display: block;
    contain: layout;
    font-family: var(--font-body, system-ui, sans-serif);
    color: var(--color-fg, #222);
    --rating-good: var(--color-primary, oklch(70% 0.15 145));
    --rating-average: color-mix(in srgb, var(--color-secondary, oklch(85% 0.15 85)), black 12%);
    --rating-poor: var(--color-accent, oklch(60% 0.25 25));
    --rating-unknown: var(--color-fg-muted, #8a8a8a);
    --hairline: color-mix(in srgb, currentColor, transparent 86%);
  }

  .panel {
    display: grid;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    border: 1px solid var(--hairline);
    border-radius: var(--radius-md, 0.75rem);
    background: var(--color-bg-light, #fff);
  }

  .title {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
    font-family: var(--font-display, inherit);
    font-size: 1.35rem;
    font-weight: 700;
    line-height: 1.1;
  }

  .verdict {
    font-family: var(--font-mono, monospace);
    font-size: 0.62rem;
    font-weight: 400;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 0.15rem 0.55rem;
    border: 1px solid currentColor;
    border-radius: 1rem;
    color: var(--rating-unknown);
  }
  .headline[data-rating="good"] .verdict { color: var(--rating-good); }
  .headline[data-rating="poor"] .verdict { color: var(--rating-poor); }

  .note { margin: 0.35rem 0 0; font-size: 0.8rem; line-height: 1.45; color: var(--color-fg-muted, #666); }
  .note a { color: inherit; }

  .metrics { margin: 0; padding: 0; list-style: none; }
  .metrics li {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto auto;
    align-items: center;
    gap: 0.6rem;
    padding: 0.4rem 0;
  }
  .metrics li + li { border-top: 1px solid var(--hairline); }

  .dot { width: 0.6rem; height: 0.6rem; border-radius: 50%; background: var(--rating-unknown); }
  li[data-rating="good"] .dot { background: var(--rating-good); }
  li[data-rating="average"] .dot { background: var(--rating-average); }
  li[data-rating="poor"] .dot { background: var(--rating-poor); }
  li[data-rating="unsupported"] .dot { background: none; border: 1px dashed var(--rating-unknown); }

  .name { display: flex; align-items: baseline; gap: 0.4rem; flex-wrap: wrap; font-size: 0.9rem; }
  .name a { color: inherit; text-underline-offset: 0.2em; text-decoration-color: var(--hairline); }
  .acronym { font-family: var(--font-mono, monospace); font-size: 0.7rem; color: var(--rating-unknown); }
  .value { font-size: 0.95rem; font-weight: 600; font-variant-numeric: tabular-nums; }
  .rating { min-width: 8.5rem; text-align: right; font-size: 0.72rem; color: var(--color-fg-muted, #666); }

  /* FCP and TTFB are context for the three Core Web Vitals, not part of them. */
  li[data-supporting] .name a,
  li[data-supporting] .value { color: var(--color-fg-muted, #666); }
  li[data-supporting] .value { font-weight: 500; }

  @media (max-width: 34rem) {
    .metrics li { grid-template-columns: auto minmax(0, 1fr) auto; }
    .rating { grid-column: 2 / -1; min-width: 0; text-align: left; }
  }
`;customElements.get(`web-vitals`)||customElements.define(`web-vitals`,f);export{f as default};
//# sourceMappingURL=web-vitals.js.map