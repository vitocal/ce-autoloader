import ds from "./components/catalog";
import explore from "./explore/catalog";
import decide from "./decide/catalog";
import checkout from "./checkout/catalog";

export const catalog = {
    ...ds,
    ...explore,
    ...decide,
    ...checkout
};

export default catalog;