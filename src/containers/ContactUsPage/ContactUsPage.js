import React, { useState, useCallback } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { useConfiguration } from '../../context/configurationContext';
import { useIntl } from '../../util/reactIntl';
import { ensureCurrentUser } from '../../util/data';
import { isScrollingDisabled } from '../../ducks/ui.duck';
import { sendinquiry } from './ContactUsPage.duck';

import {
    Page,
    UserNav,
    LayoutSingleColumn,
    H3,
} from '../../components';

import TopbarContainer from '../../containers/TopbarContainer/TopbarContainer';
import FooterContainer from '../../containers/FooterContainer/FooterContainer';
import ContactUsForm from './ContactUsForm';

import css from './ContactUsPage.module.css';
import { onSendEmail } from '../../util/api';

// Import Calendly popup
import { PopupModal } from 'react-calendly';

export const ContactUsPageComponent = props => {
    const intl = useIntl();
    const config = useConfiguration();

    const { currentUser, scrollingDisabled, onSendinquiry } = props;

    const user = ensureCurrentUser(currentUser);
    const { email, profile } = user?.attributes || {};
    const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ');

    // Used to force re-render when form resets
    const [formKey, setFormKey] = useState(0);


    const handleSubmit = useCallback(
        async (values, form) => {
            console.log(values, '&&& &&& => values');

            try {
                const { companyName, websiteName, phoneNumber, typeofPacking, problemToSolve } = values;

                const payload = {
                    recipientName: fullName,
                    recipientEmail: email,
                    companyName,
                    websiteName,
                    phoneNumber,
                    typeofPacking,
                    problemToSolve,
                };
                console.log(payload, '&&& &&& => payload');


                const response = await onSendEmail(payload);

                if (response?.data) {
                    // ✅ Success handling (use toast/snackbar if available)
                    console.log('Inquiry sent successfully:', response.data);

                    // Reset the form cleanly
                    if (form?.reset) form.reset();

                    // Fallback: force a re-render to ensure fields are cleared
                    setFormKey(prev => prev + 1);
                }
            } catch (error) {
                console.error('❌ Error sending inquiry:', error);
                const errorMessage =
                    error?.response?.data?.errors?.[0]?.detail || 'Failed to send inquiry. Please try again.';
                // Display user feedback (e.g., toast or inline error)
                console.log(errorMessage);
            }
        },
        [email, fullName]
    );

    const title = intl.formatMessage({ id: 'ContactUsPage.title' });

    return (
        <Page className={css.root} title={title} scrollingDisabled={scrollingDisabled}>
            <LayoutSingleColumn
                topbar={
                    <>
                        <TopbarContainer />
                        <UserNav currentPage="ContactUsPage" />
                    </>
                }
                footer={<FooterContainer />}
            >
                <div className={css.content}>
                    {user?.id ? (
                        <ContactUsForm key={formKey} onSubmit={handleSubmit} />
                    ) : (
                        <div className={css.notLoggedIn}>
                            <p>{intl.formatMessage({ id: 'ContactUsPage.loginRequired' })}</p>
                        </div>
                    )}
                </div>
                <div className={css.calendlyButtonWrapper}>
                    <div>Schedule a Discussion</div>
                    <div>I can provide a Calendly Link</div>
                    <button
                        className={css.calendlyButton}
                        onClick={() => {
                            // Open Calendly in a new tab
                            const calendlyUrl = 'https://calendly.com/dmarinac/15min?back=';
                            window.open(calendlyUrl, '_blank');
                        }}
                    >
                        Schedule a Call
                    </button>
                </div>
            </LayoutSingleColumn>
        </Page>
    );
};

// -------------------- Redux Connection --------------------

const mapStateToProps = state => {
    const { currentUser } = state.user;
    return {
        currentUser,
        scrollingDisabled: isScrollingDisabled(state),
    };
};

const mapDispatchToProps = dispatch => ({
    //   onSendinquiry: params => dispatch(sendinquiry(params)),
});

export default compose(
    connect(mapStateToProps, mapDispatchToProps)
)(ContactUsPageComponent);
