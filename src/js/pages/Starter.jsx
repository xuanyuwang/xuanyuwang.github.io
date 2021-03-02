import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Shell from "../components/Shell/Shell";
import { Provider, connect } from 'react-redux';
import { RootStore } from 'js/APIs/RootAPI';

import { loadPage } from 'js/APIs/utils';

import './site.scss';

const prepareDocument = () => {
	const body = document.body;
	const page = document.createElement('div');
	page.id = 'page';
	body.appendChild(page);
};

const site = (props) => {
	const pageName = props.page;
	const { default: page } = loadPage(pageName);
	return <Provider store={RootStore}>
		<Shell></Shell>
		<div id={'page-body'}>
			{page()}
		</div>
	</Provider>;
};
const ConnectedSite = connect((state) => state)(site);

const Site = () => {
	return <Provider store={RootStore}>
		<ConnectedSite></ConnectedSite>
	</Provider>;
};

const renderSite = async () => {
	prepareDocument();

	const site = Site();
	const siteContainer = document.getElementById('page');
	ReactDOM.render(site, siteContainer);
};
renderSite();
export default renderSite;