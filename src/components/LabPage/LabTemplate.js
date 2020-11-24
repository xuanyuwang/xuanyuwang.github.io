import React from 'react';
import Container from '@material-ui/core/Container';
import AppBar from '@material-ui/core/AppBar';
import ComponentsMap from './LabComponents';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import Chip from '@material-ui/core/Chip';

import './LabTemplate.scss';

const LabTemplate = (props) => {
	const { pageContext } = props;
	const LabComponent = ComponentsMap[pageContext.name];
	const tags = pageContext.tags.map((tag) => {
					const label = tag.tag.raw.slug;
					return <Chip label={label} key={label}/>;
				});
	return <Container className='lab-template'>
		<AppBar position='static'>
			<Toolbar>
				<Typography>{pageContext.name}</Typography>
				{/* <Typography>{pageContext.date}</Typography> */}
				<Container className='tags'>
					{tags}
				</Container>
			</Toolbar>
		</AppBar>
		{LabComponent ? <LabComponent /> : null}
	</Container>;
};

export default LabTemplate;