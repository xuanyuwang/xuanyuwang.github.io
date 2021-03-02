import * as React from 'react';
import 'carbon-components/scss/components/ui-shell/_header.scss';
import {
	Header,
	HeaderName,
	HeaderNavigation,
	HeaderMenuItem
} from 'carbon-components-react';
import { Provider, connect } from 'react-redux';
import { RootStore, switchPage } from 'js/APIs/RootAPI';
import { PageNames } from 'js/APIs/Manifest';

const Shell = (props) => {
	const shell =  <Header aria-label="Xuanyu's Corner" id={'ui-shell-header'}>
		<HeaderName href='#' prefix=''>
            Xuanyu&apos;s Corner
		</HeaderName>
		<HeaderNavigation aria-label="navigation">
			<HeaderMenuItem onClick={() => { props.switchPage(PageNames.HOME); }}>Home</HeaderMenuItem>
			<HeaderMenuItem onClick={() => { props.switchPage(PageNames.ME); }}>About Me</HeaderMenuItem>
			<HeaderMenuItem>Playgounds</HeaderMenuItem>
		</HeaderNavigation>
	</Header>;
	return <Provider store={RootStore}>
		{shell}
	</Provider>;
};

const connectedShell = connect(
	(state) => {
		return state;
	},
	(dispatch) => {
		return {
			switchPage: (pageName) => dispatch(switchPage({ page: pageName})),
		};
	}
)(Shell);

export default connectedShell;