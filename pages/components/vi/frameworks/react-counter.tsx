import r2wc from "@r2wc/react-to-web-component";
import { useSignals } from "@preact/signals-react/runtime";
import { counter, increment, decrement } from "./store";

const ReactCounter = () => {
  useSignals();

  return (
    <div className="counter-card react">
      <h3 style={{ color: "#61dafb" }}>
        <svg width="24" height="24" viewBox="-10.5 -9.45 21 18.9" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="0" cy="0" r="2" fill="currentColor"></circle>
          <g stroke="currentColor" strokeWidth="1" fill="none">
            <ellipse rx="10" ry="4.5"></ellipse>
            <ellipse rx="10" ry="4.5" transform="rotate(60)"></ellipse>
            <ellipse rx="10" ry="4.5" transform="rotate(120)"></ellipse>
          </g>
        </svg>
        React Counter
      </h3>
      <div className="controls">
        <button type="button" onClick={decrement}>
          -
        </button>
        <span className="count">{counter.value}</span>
        <button type="button" onClick={increment}>
          +
        </button>
      </div>
      <style>{`.react h3 { color: #61dafb; }`}</style>
    </div>
  );
};

const ReactCounterComponent = r2wc(ReactCounter, {});
export default ReactCounterComponent;
customElements.define("react-counter", ReactCounterComponent);
