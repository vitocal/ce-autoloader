import "./Navigation.css";

export default () => {
  return (
    <nav className="e_Navigation">
      <ul className="e_Navigation__list">
        <li className="e_Navigation__item">
          <a href="/products" data-navigo>
            Machines
          </a>
        </li>
        <li className="e_Navigation__item">
          <a href="/stores" data-navigo>
            Stores
          </a>
        </li>
      </ul>
    </nav>
  );
};
