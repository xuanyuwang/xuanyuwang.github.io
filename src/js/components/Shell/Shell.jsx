import * as React from 'react';
import 'carbon-components/scss/components/ui-shell/_header.scss';
import {
	Header,
	HeaderName,
	HeaderNavigation,
	HeaderMenuItem
} from 'carbon-components-react';

const Shell = () => {
	return <Header aria-label="Xuanyu's Corner">
		<HeaderName href='#' prefix=''>
            Xuanyu&apos;s Corner
		</HeaderName>
		<HeaderNavigation aria-label="navigation">
			<HeaderMenuItem>About Me</HeaderMenuItem>
			<HeaderMenuItem>Playgounds</HeaderMenuItem>
		</HeaderNavigation>
	</Header>
}

export default Shell;