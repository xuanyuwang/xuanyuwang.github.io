import React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import PageHelmet from '../PageHelmet/PageHelmet';

const Title = () => {
	return <Container maxWidth={false} style={{ position: 'fixed', top: '50%', left: 0, transform: 'translateY(-50%)' }}>
		<Typography variant='h4' align='center'>You can think me as a</Typography>
		<Typography variant='h2' align='center'>front-end developer</Typography>
	</Container>
};
const HomePage = () => {
	return <Container maxWidth={false}>
		<PageHelmet/>
		{Title()}
	</Container>
};

export default HomePage;