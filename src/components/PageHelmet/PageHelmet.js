import React from 'react';
import { Helmet } from 'react-helmet';

const PageHelmet = () => {
	return <Helmet>
		<title>Wonderland</title>
		<meta name='viewport' content='minimum-scale=1, initial-scale=1, width=device-width'/>
	</Helmet>
};

export default PageHelmet;