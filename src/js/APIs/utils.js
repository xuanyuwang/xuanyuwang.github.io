import { PageNames } from 'js/APIs/Manifest';

import * as HomePage from 'js/pages/HomePage';
import * as MePage from 'js/pages/Me';
import * as BlogPage from 'js/pages/Blog';

export const loadPage = (pageName) => {
	switch (pageName) {
	case PageNames.HOME:
		return HomePage;
	case PageNames.ME:
		return MePage;
	case PageNames.BLOG:
		return BlogPage;
	default:
		break;
	}
};