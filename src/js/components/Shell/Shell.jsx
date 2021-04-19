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
import { Pages } from 'js/APIs/Manifest';

const Shell = (props) => {
	const [isSideNavActive, setSideNav] = useState(false);
	const menuItems = Object.values(Pages).map((page) => {
		return <HeaderMenuItem key={page.title} href={`${page.link}`} isCurrentPage={props.currentPage.title === page.title}>{page.title}</HeaderMenuItem>
	});
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
	return shell;
};

export default { Shell };
export { Shell };