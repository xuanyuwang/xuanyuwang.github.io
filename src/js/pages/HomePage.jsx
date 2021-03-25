import * as React from 'react';
import { Link } from 'carbon-components-react';
import resume from 'static/Resume-Xuanyu-Wang.pdf';

const HomePage = () => {
	return <React.Fragment>
		<div>
		This site is under construction. It will be come soon.
		</div>
		<div>
			<Link href="https://www.linkedin.com/in/xuanyu-wang/">My LinkedIn profile</Link>
		</div>
		<div>
			<Link href={resume}>My resume</Link>
		</div>
	</React.Fragment>;
};

export default HomePage;