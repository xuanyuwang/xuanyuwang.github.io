import * as React from 'react';
import { Link } from 'carbon-components-react';
import {List as BlogList } from './blogList';
import { Pages } from '../APIs/Manifest';
import { Shell } from '../components/Shell/Shell';
import { renderReactPage } from '../APIs/util';

import './Blog.scss';
import 'carbon-components/scss/components/link/_link.scss';

const pageId = 'page-blog';

const Blogs = () => {
	const blogs = BlogList.map((item) => {
		const {name, link} = item;
		return <div key={name} className={`${pageId}-list-item`}>
			<Link href={link}>{name}</Link>
		</div>;
	});
	return <div id={`${pageId}-main`}>
		<div id={`${pageId}-list-container`}>
			{blogs}
		</div>
	</div>;
};
const Page = () => {
	return <React.Fragment>
		<Shell currentPage={Pages.BLOG}>
		</Shell>
		<div id={pageId} className={'page'}>
			<Blogs></Blogs>
		</div>;
	</React.Fragment>;
};

renderReactPage(Page);

export default { Page };
export { Page };