import React from 'react';
import Container from '@material-ui/core/Container';
import PageHelmet from '../PageHelmet/PageHelmet';
import Earth from './Labs/Earth/Earth';

const HomePage = () => {
	return <Container>
		<PageHelmet/>
		<Earth/>
	</Container>
};

export default HomePage;