import * as React from 'react';
import { Link } from 'carbon-components-react';
import resume from 'static/Resume-Xuanyu-Wang.pdf';
import backgrounImage from 'static/home-background.jpg';
import './HomePage.scss';

const HomePage = () => {
	return <div id='home-page' style={{ backgroundImage: `url("${backgrounImage}")` }}>
		<div>
		This site is under construction. It will be come soon.
		</div>
		<div>
			<Link href="https://www.linkedin.com/in/xuanyu-wang/">My LinkedIn profile</Link>
		</div>
		<div>
			<Link href={resume}>My resume</Link>
		</div>
	</div>;
};

export default HomePage;