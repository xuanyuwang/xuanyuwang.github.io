import * as React from 'react';
import { Link } from 'carbon-components-react';
import {List as BlogList } from './blogList';

import './Blog.scss';
import 'carbon-components/scss/components/link/_link.scss';

const pageId = 'page-blog';

const Blogs = () => {
	console.log(BlogList);
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
	return <div id={pageId}>
		<Blogs></Blogs>
	</div>;
};

export default Page;