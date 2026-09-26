import { src, srcset, fmtprice } from "../utils.js";

import "./Product.css";

/**
 * Product component.
 * @param {Product} props - The properties of the Product component.
 * @returns {string} The Product component markup.
 */
export default ({ name, url, image, startPrice }) => {
  return (
    <li className="e_Product" key={url}>
      <a className="e_Product_link" href={url} data-navigo>
        <img
          className="e_Product_image"
          src={src(image, 200)}
          srcSet={srcset(image, [200, 400, 800])}
          sizes="300px"
          width="200"
          height="200"
        />
        <span className="e_Product_name">{name}</span>
        <span className="e_Product_price">{fmtprice(startPrice)}</span>
      </a>
    </li>
  );
};
