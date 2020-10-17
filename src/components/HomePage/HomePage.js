import React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import SvgIcon from '@material-ui/core/SvgIcon';
import PageHelmet from '../PageHelmet/PageHelmet';

import ToolBox from '../../resources/icons/tool-box.svg';

const Title = () => {
	return <Container maxWidth={false} style={{
		alignItems: 'center',
		justifyContent: 'center'
	}}>
		<Typography variant='h4' align='center'>You can think me as a</Typography>
		<Typography variant='h2' align='center'>front-end developer</Typography>
	</Container>
};
const NavigationButtons = () => {
	return <Container maxWidth={false}>
		<IconButton>

		</IconButton>
	</Container>;
};
const Credit = () => {
	return <div style={{ position: 'fixed', top: '100%', left: '50%', transform: 'translate(-50%, -100%)'}}>
		Icons made by <a href="https://www.flaticon.com/authors/srip" title="srip">srip</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a>
	</div>;
};
const Content = () => {
	return <Container style={{
		alignItems: 'center',
		justifyContent: 'center',
		display: 'flex',
		flexDirection: 'column'
	}}>
		{Title()}
		{NavigationButtons()}
	</Container>;
}
const HomePage = () => {
	return <Container maxWidth={false} style={{
		display: 'flex',
		position: 'fixed',
		height: '100%',
		width: '100%'
		}}>
		<PageHelmet />
		{Content()}
		{Credit()}
	</Container>
};


export default HomePage;