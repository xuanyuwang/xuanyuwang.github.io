import * as React from 'react';
import { useState } from 'react';
import 'carbon-components/scss/components/ui-shell/_header.scss';
import 'carbon-components/scss/components/ui-shell/_side-nav.scss';
import {
	Header,
	HeaderName,
	HeaderNavigation,
	HeaderMenuItem,
	HeaderMenuButton,
	HeaderSideNavItems,
	SideNav,
	SideNavItems
} from 'carbon-components-react';
import { Provider, connect } from 'react-redux';
import { RootStore, switchPage } from 'js/APIs/RootAPI';
import { PageNames } from 'js/APIs/Manifest';

const Shell = (props) => {
	const [isSideNavActive, setSideNav] = useState(false);
	const menuItems = [
		// <HeaderMenuItem key={PageNames.HOME} onClick={() => { props.switchPage(PageNames.HOME); }}>Home</HeaderMenuItem>,
		<HeaderMenuItem key={PageNames.ME} onClick={() => { props.switchPage(PageNames.ME); }}>About Me</HeaderMenuItem>,
		<HeaderMenuItem key={PageNames.BLOG} onClick={() => { props.switchPage(PageNames.BLOG); }}>Blog</HeaderMenuItem>
	];
	const shell =  <Header aria-label="Xuanyu's Corner" id={'ui-shell-header'}>
		<HeaderMenuButton
			aria-label='Open menu'
			onClick={() => {
				setSideNav(!isSideNavActive);
			}}
			isActive={isSideNavActive}
		/>
		<HeaderName href='#' prefix=''>
            Xuanyu&apos;s Corner
		</HeaderName>
		<HeaderNavigation aria-label="navigation">
			{menuItems}
		</HeaderNavigation>
		<SideNav aria-label='side navigation'
			expanded={isSideNavActive}
			isPersistent={false}
		>
			<SideNavItems expanded={isSideNavActive}>
				<HeaderSideNavItems>
					{menuItems}
				</HeaderSideNavItems>
			</SideNavItems>
		</SideNav>
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