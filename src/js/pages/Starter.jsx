import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Shell from "../components/Shell/Shell";

import { Manifest } from 'js/APIs/Manifest';
import { RootAPI } from 'js/APIs/RootAPI';

const prepareDocument = () => {
	const body = document.body;
	const page = document.createElement('div');
	page.id = 'page';
	body.appendChild(page);
};

const renderSite = async () => {
	prepareDocument();

	const { default: StarterPage } = await RootAPI.loadPage(Manifest.StarterPage);
	const Site = <React.Fragment>
		<Shell>
		</Shell>
		<StarterPage></StarterPage>
	</React.Fragment>;
	const page = document.getElementById('page');
	ReactDOM.render(Site, page);
}
renderSite();
export default renderSite;