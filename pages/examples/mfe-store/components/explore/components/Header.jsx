// import MiniCart from "../../checkout/components/MiniCart.js";
import Navigation from "./Navigation.jsx";
import r2wc from "@r2wc/react-to-web-component";

import "./Header.css";

/**
 * Header component.
 */
const Header = ({ c }) => {
  return (
    <header className="e_Header" data-boundary="explore">
      <div className="e_Header__cutter">
        <div className="e_Header__inner">
          <a className="e_Header__link" href="#/">
            <img className="e_Header__logo" src="/cdn/img/logo.svg" alt="Micro Frontends - Tractor Store" />
          </a>
          <div className="e_Header__navigation">
            <Navigation />
          </div>
          <div className="e_Header__cart"></div>
        </div>
      </div>
    </header>
  );
};

export default r2wc(Header, {});
