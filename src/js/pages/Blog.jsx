import * as React from 'react';
import { Link } from 'carbon-components-react';

import './Blog.scss';

const pageId = 'page-blog';

const Blogs = () => {
	return <div id={`${pageId}-main`}>
		<div id={`${pageId}-list-container`}>
			<div className={`${pageId}-list-item`}>
				<Link href={"https://www.notion.so/Web-Project-28adcdb3b74344d8b87764e00991e6db"}>The structure of a web project</Link>
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