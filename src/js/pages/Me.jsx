import * as React from 'react';
import { Link } from 'carbon-components-react';
import { Pages } from '../APIs/Manifest';
import { Shell } from '../components/Shell/Shell';
import resume from 'static/Resume-Xuanyu-Wang.pdf';
import { renderReactPage } from '../APIs/util';
import './Me.scss';

const pageIDPrefix = 'page-me';

const AboutMe = () => {
	return <div id={pageIDPrefix} className={'page'}>
		<object id={`${pageIDPrefix}-pdf-containe`} data={resume} type={"application/pdf"}>
			<div>
				Your browser does not support viewing PDF. Please use this <Link href="https://www.linkedin.com/in/xuanyu-wang/">My LinkedIn profile</Link> instead.
			</div>
		</object>
	</div>;
};

const Page = () => {
	return <React.Fragment>
		<Shell currentPage={Pages.ME}>
		</Shell>
		<AboutMe/>
	</React.Fragment>;
};

renderReactPage(Page);

export default { Page };