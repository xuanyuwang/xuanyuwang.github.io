import { PageNames } from 'js/APIs/Manifest';

import * as HomePage from 'js/pages/HomePage';
import * as MePage from 'js/pages/Me';

export const loadPage = (pageName) => {
	switch (pageName) {
	case PageNames.HOME:
		return HomePage;
	case PageNames.ME:
		return MePage;
	default:
		break;
	}
};