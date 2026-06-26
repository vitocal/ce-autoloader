import { counter as e, decrement as t, increment as n } from "./store.ts.js";
import r from "./node_modules/@r2wc/react-to-web-component/dist/react-to-web-component.js";
import { useSignals as i } from "./node_modules/@preact/signals-react/runtime/dist/runtime.module.js";
import { require_jsx_runtime as a } from "./node_modules/react/jsx-runtime.js";
//#region pages/components/vi/frameworks/react-counter.tsx
var o = a(), s = r(() => (i(), /* @__PURE__ */ (0, o.jsxs)("div", {
	className: "counter-card react",
	children: [
		/* @__PURE__ */ (0, o.jsxs)("h3", {
			style: { color: "#61dafb" },
			children: [/* @__PURE__ */ (0, o.jsxs)("svg", {
				width: "24",
				height: "24",
				viewBox: "-10.5 -9.45 21 18.9",
				fill: "none",
				xmlns: "http://www.w3.org/2000/svg",
				children: [/* @__PURE__ */ (0, o.jsx)("circle", {
					cx: "0",
					cy: "0",
					r: "2",
					fill: "currentColor"
				}), /* @__PURE__ */ (0, o.jsxs)("g", {
					stroke: "currentColor",
					strokeWidth: "1",
					fill: "none",
					children: [
						/* @__PURE__ */ (0, o.jsx)("ellipse", {
							rx: "10",
							ry: "4.5"
						}),
						/* @__PURE__ */ (0, o.jsx)("ellipse", {
							rx: "10",
							ry: "4.5",
							transform: "rotate(60)"
						}),
						/* @__PURE__ */ (0, o.jsx)("ellipse", {
							rx: "10",
							ry: "4.5",
							transform: "rotate(120)"
						})
					]
				})]
			}), "React Counter"]
		}),
		/* @__PURE__ */ (0, o.jsxs)("div", {
			className: "controls",
			children: [
				/* @__PURE__ */ (0, o.jsx)("button", {
					type: "button",
					onClick: t,
					children: "-"
				}),
				/* @__PURE__ */ (0, o.jsx)("span", {
					className: "count",
					children: e.value
				}),
				/* @__PURE__ */ (0, o.jsx)("button", {
					type: "button",
					onClick: n,
					children: "+"
				})
			]
		}),
		/* @__PURE__ */ (0, o.jsx)("style", { children: ".react h3 { color: #61dafb; }" })
	]
})), {});
customElements.define("react-counter", s);
//#endregion
export { s as default };
