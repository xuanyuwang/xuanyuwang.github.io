import React from 'react';
import ReactDOM from 'react-dom';
import Shell from "../components/Shell/Shell";
import Manifest from './Manifest';

const prepareDocument = () => {
    const body = document.body;
    const page = document.createElement('div');
    page.id = 'page';
    body.appendChild(page);
};

async function renderSite(){
    prepareDocument();

    const starterPageName = Manifest.StarterPage;
    const pageModule = await import(`./${starterPageName}.jsx`);
    const StarterPage = pageModule.default;
    const Site = <Shell>
        <StarterPage></StarterPage>
    </Shell>;
    const page = document.getElementById('page');
    ReactDOM.render(Site, page);
}
renderSite();
export default renderSite;