import React from 'react';
import Container from '@material-ui/core/Container';
import AppBar from '@material-ui/core/AppBar';
import ComponentsMap from './LabComponents';
import Typography from '@material-ui/core/Typography';
import { Toolbar } from '@material-ui/core';

const LabTemplate = (props) => {
	const { pageContext } = props;
	const LabComponent = ComponentsMap[pageContext.name];
	return <Container className='lab-template'>
		<AppBar position='static'>
			<Toolbar>
				<Typography>{pageContext.name}</Typography>
				{/* <Typography>{pageContext.date}</Typography> */}
			</Toolbar>
		</AppBar>
		{LabComponent ? <LabComponent /> : null}
	</Container>;
};

export default LabTemplate;