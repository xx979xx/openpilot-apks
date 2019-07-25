import React, { Component } from 'react';
import ScrollThrough from '../ScrollThrough';

import PropTypes from 'prop-types';

import { ScrollView, View, Text } from 'react-native';
import Documents from './Documents';

import X from '../../themes';
import SetupStyles from '../Setup';
import Styles from './SetupTermsStyles';

// i18n
import { i18n } from '../../utils/I18n'
import { t, Trans } from "@lingui/macro"

export default class SetupTerms extends Component {
    static propTypes = {
        onAccept: PropTypes.func,
    };

    constructor(props) {
        super(props);

        this.state = {
            hasScrolled: false,
        };
    }

    onScroll = ({ nativeEvent }) => {
        if (!this.state.hasScrolled) {
            this.setState({ hasScrolled: true });
        }
    }

    render() {
        const { hasScrolled } = this.state;

        return (
            <ScrollThrough
                onPrimaryButtonClick={ this.props.onAccept }
                primaryButtonText={ i18n._(hasScrolled ? t`I agree to the terms` : t`Read to Continue`) }
                secondaryButtonText={ i18n._(t`Decline`) }
                onScroll={ this.onScroll }
                primaryButtonEnabled={ hasScrolled }>
                <X.Text weight='semibold' color='white'><Trans>Comma.ai, Inc. Terms & Conditions</Trans></X.Text>
                <X.Text size='small' color='white' style={ Styles.tosText }>{ Documents.TOS }</X.Text>
                <X.Text size='small' color='white'><Trans>Privacy policy available at https://my.comma.ai/privacy.html</Trans></X.Text>
            </ScrollThrough>
        );

    }
}
