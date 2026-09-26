import { html, IMAGE_SERVER } from "../utils.js";
import r2wc from "@r2wc/react-to-web-component";

import "./Footer.css";

const Footer = () => {
  return (
    <footer className="e_Footer" data-boundary="explore">
      <div className="e_Footer__cutter">
        <div className="e_Footer__inner">
          <div className="e_Footer__initiative">
            <img src="/cdn/img/neulandlogo.svg" alt="neuland - Büro für Informatik" width="45" height="40" />
            <p>
              based on{" "}
              <a href="https://micro-frontends.org/tractor-store/" target="_blank">
                the tractor store 2.0
              </a>
              <br />a{" "}
              <a href="https://github.com/vitocal/ce-autoloader" target="_blank">
                ce-autoloader
              </a>{" "}
              project
            </p>
          </div>

          <div className="e_Footer__credits">
            <h3>techstack</h3>
            <p>web components, vite, ce-autoloader, preact, vue</p>
            <p>
              build by{" "}
              <a href="https://github.com/vitocal" target="_blank">
                vitocal
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default r2wc(Footer, {});
