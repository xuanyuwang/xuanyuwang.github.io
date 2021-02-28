import React from 'react';
import 'carbon-components/scss/components/ui-shell/_header.scss';
import {
    Header,
    HeaderName,
    HeaderNavigation,
    HeaderMenuItem,
    HeaderMenu
} from 'carbon-components-react/es/components/UIShell';

const Shell = () => {
    return <Header aria-label="Xuanyu's Corner">
        <HeaderName href='#' prefix=''>
            Xuanyu's Corner
        </HeaderName>
        <HeaderNavigation aria-label="navigation">
            <HeaderMenuItem>About Me</HeaderMenuItem>
            <HeaderMenuItem>Playgounds</HeaderMenuItem>
        </HeaderNavigation>
    </Header>
}

export default Shell;