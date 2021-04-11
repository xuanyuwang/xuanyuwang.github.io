import * as React from 'react';
import { Link } from 'carbon-components-react';
import {List as BlogList } from './blogList';

import './Blog.scss';

const pageId = 'page-blog';

const Blogs = () => {
	console.log(BlogList);
	const blogs = BlogList.map((item) => {
		const {name, link} = item;
		return <Link key={name} href={link}>{name}</Link>;
	});
	return <div id={`${pageId}-main`}>
		<div id={`${pageId}-list-container`}>
			<div className={`${pageId}-list-item`}>
				{blogs}
			</div>
		</div>
	</div>;
};
const Page = () => {
	return <div id={pageId}>
		<Blogs></Blogs>
	</div>;
};

export default Page;