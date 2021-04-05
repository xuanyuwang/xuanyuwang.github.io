import * as React from 'react';
import { Link } from 'carbon-components-react';
import resume from 'static/Resume-Xuanyu-Wang.pdf';
import './Me.scss';

const pageIDPrefix = 'page-me';

const Page = () => {
	return <div id={pageIDPrefix}>
		<object id={`${pageIDPrefix}-pdf-containe`} data={resume} type={"application/pdf"}>
			<div>
				Your browser does not support viewing PDF. Please use this <Link href="https://www.linkedin.com/in/xuanyu-wang/">My LinkedIn profile</Link> instead.
			</div>
		</object>
	</div>;
};

export default Page;