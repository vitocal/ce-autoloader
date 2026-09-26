import { useState, useRef } from "preact/hooks";
import register from "preact-custom-element";
import data from "../database/index.js";
import { src, srcset } from "../utils.js";

import "./StorePicker.css";

function StorePicker() {
  const dialogRef = useRef(null);
  const rootRef = useRef(null);
  const [selectedStore, setSelectedStore] = useState(null);

  const handleOpenDialog = () => {
    dialogRef.current?.showModal();
  };

  const handleSelectStore = (store, e) => {
    // Dispatch the custom event targeting the host Web Component element
    const hostElement = rootRef.current?.getRootNode()?.host || rootRef.current;

    hostElement?.dispatchEvent(
      new CustomEvent("explore:store-selected", {
        bubbles: true,
        composed: true,
        detail: String(store.id),
      }),
    );

    // Update selected store state (replaces manual innerHTML copying)
    setSelectedStore(store);

    dialogRef.current?.close();
  };

  return (
    <div className="e_StorePicker" ref={rootRef}>
      <div className="e_StorePicker_control" data-boundary="explore">
        <div className="e_StorePicker_selected">
          {selectedStore && (
            <>
              <img
                className="e_StorePicker_image"
                src={src(selectedStore.image, 200)}
                srcSet={srcset(selectedStore.image, [200, 400])}
                width="200"
                height="200"
                alt={selectedStore.name}
              />
              <p className="e_StorePicker_address">
                {selectedStore.name}
                <br />
                {selectedStore.street}
                <br />
                {selectedStore.city}
              </p>
            </>
          )}
        </div>
        <ds-button class="e_StorePicker_choose" type="button" onClick={handleOpenDialog}>
          choose a store
        </ds-button>
      </div>

      <dialog className="e_StorePicker_dialog" data-boundary="explore" ref={dialogRef}>
        <div className="e_StorePicker_wrapper">
          <h2>Stores</h2>
          <ul className="e_StorePicker_list">
            {data.stores.map((s) => (
              <li key={s.id} className="e_StorePicker_entry">
                <div className="e_StorePicker_content">
                  <img
                    className="e_StorePicker_image"
                    src={src(s.image, 200)}
                    srcSet={srcset(s.image, [200, 400])}
                    width="200"
                    height="200"
                    alt={s.name}
                  />
                  <p className="e_StorePicker_address">
                    {s.name}
                    <br />
                    {s.street}
                    <br />
                    {s.city}
                  </p>
                </div>
                <ds-button
                  className="e_StorePicker_select"
                  type="button"
                  data-id={s.id}
                  onClick={(e) => handleSelectStore(s, e)}
                >
                  select
                </ds-button>
              </li>
            ))}
          </ul>
        </div>
      </dialog>
    </div>
  );
}

register(StorePicker, "explore-storepicker");

export default StorePicker;
