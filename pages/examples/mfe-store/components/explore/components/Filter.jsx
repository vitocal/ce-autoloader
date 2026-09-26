import { html } from "../utils.js";

import "./Filter.css";

export default ({ filters }) => {
  return (
    <div className="e_Filter">
      Filter:
      <ul>
        {filters.map((f) =>
          f.active ? (
            <li className="e_Filter__filter--active" key={f.name}>
              {f.name}
            </li>
          ) : (
            <li key={f.name}>
              <a href={f.url} data-navigo>
                {f.name}
              </a>
            </li>
          ),
        )}
      </ul>
    </div>
  );
};
