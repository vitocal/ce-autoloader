import*as o from"https://cdn.jsdelivr.net/npm/@observablehq/plot/+esm";import f from"https://cdn.jsdelivr.net/npm/suncalc@1/+esm";import*as e from"https://cdn.jsdelivr.net/npm/d3/+esm";class g extends HTMLElement{connectedCallback(){const i="pt-BR",p=new Date().getUTCFullYear(),m=o.plot({aspectRatio:.6,marginLeft:90,width:1152,style:`
    margin: 0 -14px;
    background: #111;
    color: #fff;
    max-width: none;
    text-transform: uppercase;
    width: calc(100% + 28px);
  `,x:{domain:e.range(1,40),axis:null},y:{domain:e.range(12)},length:{type:"identity"},marks:(({data:t,x:n,y:a,r:s,hemisphere:h,projection:c})=>[o.axisY({textAnchor:"start",tickFormat:o.formatMonth(i,"long"),tickSize:0,dx:-50}),o.dot(t,{x:n,y:a,r:s,fill:"#333"}),o.text(t,{x:n,y:a,r:s,text:r=>r.getUTCDate(),dy:-s-5,fontSize:7}),o.vector(t,{x:n,y:a,length(r){const l=e.utcHour.offset(r,12);return 180-f.getMoonIllumination(l).phase*360},shape:{draw(r,l){c.rotate([l,0]).scale(s),e.geoPath(c,r)(h)}},anchor:"start",fill:"currentColor"})])({data:(()=>{const t=e.utcYear(Date.UTC(p,0,1));return e.utcDays(t,e.utcYear.offset(t))})(),x(t){const a=e.utcMonth(t).getUTCDay()||7;return t.getUTCDate()+a},y(t){return t.getUTCMonth()},r:12,hemisphere:e.geoCircle()(),projection:e.geoOrthographic().translate([0,0])})});this.innerHTML="",this.append(m)}}customElements.define("observable-plot-wrapper",g);export{g as default};
