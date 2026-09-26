import register from "preact-custom-element";
import { src, srcset } from "../utils.js";

import data from "../database/index.js";

import './HomePage.css';

const HomePage = () => {
    return (
        <>
            <explore-header ></explore-header>
            <main className="e_HomePage">
                {data.teaser.map(
                    ({ title, image, url }) =>
                        <a className="e_HomePage__categoryLink" href={url} key={url} data-navigo>
                            <img
                                src={src(image, 500)}
                                srcSet={srcset(image, [500, 1000])}
                                sizes="100vw, (min-width: 500px) 50vw"
                                alt=""
                            />
                            {title}
                        </a>,
                )}
                <div className="e_HomePage__recommendations">
                    <explore-recommendations skus={JSON.stringify(["CL-01-GY", "AU-07-MT"])} ></explore-recommendations>
                </div>
            </main>
            <explore-footer ></explore-footer>
        </>
    );
};

const WebHomePage = register(HomePage, 'explore-page-home');

export default WebHomePage;
