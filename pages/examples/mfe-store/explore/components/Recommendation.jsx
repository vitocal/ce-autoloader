import register from "preact-custom-element";
import { src, srcset } from "../utils.js";

import "./Recommendation.css";

/**
 * Recommendation component.
 * @param {RecoItem} props - The properties of the Recommendation component.
 * @returns {string} The Recommendation component markup.
 */
export const Recommendation = ({ image, url, name }) => {
  return (
    <li className="e_Recommendation" key={url}>
      <a className="e_Recommendation_link" href={url} data-navigo>
        <img
          className="e_Recommendation_image"
          src={src(image, 200)}
          srcSet={srcset(image, [200, 400])}
          alt=""
          sizes="200px"
          width="200"
          height="200"
        />
        <span className="e_Recommendation_name">{name}</span>
      </a>
    </li>
  );
};
export default register(Recommendation, "explore-recommendation", ["image", "url", "name"]);
