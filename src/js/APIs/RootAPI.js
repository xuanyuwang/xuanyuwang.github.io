import { Manifest } from './Manifest';

const RootAPI = {
	loadPage: async (pageName) => {
		const pagePath = Manifest.Pages[pageName];
		console.log(pagePath);
		const page = await import('js/pages/HomePage');
		return page;
	}
}

export { RootAPI };