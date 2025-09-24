import React from 'react';
import { Form as FinalForm } from 'react-final-form';
import classNames from 'classnames';

import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import * as validators from '../../../util/validators';
import { propTypes } from '../../../util/types';
import {
    isErrorNoPermissionForInitiateTransactions,
    isErrorNoPermissionForUserPendingApproval,
    isTooManyRequestsError,
} from '../../../util/errors';

import {
    Form,
    PrimaryButton,
    FieldTextInput,
    IconInquiry,
    Heading,
    NamedLink,
} from '../../../components';

import css from './SendInquiryForm.module.css';
import { NO_ACCESS_PAGE_INITIATE_TRANSACTIONS } from '../../../util/urlHelpers';

const ErrorMessage = props => {
    const { error } = props;
    const userPendingApproval = isErrorNoPermissionForUserPendingApproval(error);
    const userHasNoTransactionRights = isErrorNoPermissionForInitiateTransactions(error);

    // No transaction process attached to listing
    return error ? (
        <p className={css.error}>
            {error.message === 'No transaction process attached to listing' ? (
                <FormattedMessage id="SendInquiryForm.sendInquiryErrorNoProcess" />
            ) : isTooManyRequestsError(error) ? (
                <FormattedMessage id="SendInquiryForm.tooManyRequestsError" />
            ) : userPendingApproval ? (
                <FormattedMessage id="SendInquiryForm.userPendingApprovalError" />
            ) : userHasNoTransactionRights ? (
                <FormattedMessage
                    id="SendInquiryForm.noTransactionRightsError"
                    values={{
                        NoAccessLink: msg => (
                            <NamedLink
                                name="NoAccessPage"
                                params={{ missingAccessRight: NO_ACCESS_PAGE_INITIATE_TRANSACTIONS }}
                            >
                                {msg}
                            </NamedLink>
                        ),
                    }}
                />
            ) : (
                <FormattedMessage id="SendInquiryForm.sendInquiryError" />
            )}
        </p>
    ) : null;
};

/**
 * The InquiryForm component.
 * NOTE: this InquiryForm is only for booking & purchase processes
 * The default-inquiry process is handled differently
 *
 * @component
 * @param {Object} props
 * @param {string} [props.className] - Custom class that extends the default class for the root element
 * @param {string} [props.rootClassName] - Custom class that overrides the default class for the root element
 * @param {string} [props.submitButtonWrapperClassName] - Custom class to be passed for the submit button wrapper
 * @param {boolean} [props.inProgress] - Whether the inquiry is in progress
 * @param {string} props.listingTitle - The listing title
 * @param {string} props.authorDisplayName - The author display name
 * @param {propTypes.error} props.sendInquiryError - The send inquiry error
 * @returns {JSX.Element} inquiry form component
 */
const SendInquiryForm = props => (
    <FinalForm
        {...props}
        render={fieldRenderProps => {
            const {
                rootClassName,
                className,
                submitButtonWrapperClassName,
                formId,
                handleSubmit,
                inProgress = false,
                listingTitle,
                authorDisplayName,
                sendInquiryError,
            } = fieldRenderProps;

            const intl = useIntl();
            const messageRequiredMessage = intl.formatMessage({
                id: 'SendInquiryForm.messageRequired',
            });
            const messageRequired = validators.requiredAndNonEmptyString(messageRequiredMessage);

            const classes = classNames(rootClassName || css.root, className);
            const submitInProgress = inProgress;
            const submitDisabled = submitInProgress;

            return (
                <Form className={classes} onSubmit={handleSubmit} enforcePagePreloadFor="OrderDetailsPage">
                    {/* Inquiry Fields */}
                    <div className={css.inquiryBox}>
                        <h3 className={css.inquiryTitle}>Send Inquiry</h3>
                        <div className={css.inquiryRow}>
                            <FieldTextInput
                                id="inquiryName"
                                name="inquiryName"
                                label={intl.formatMessage({ id: 'SendInquiryForm.nameLabel' })}
                                required
                                className={css.inquiryFieldHalf}
                            />
                            <FieldTextInput
                                id="inquiryEmail"
                                name="inquiryEmail"
                                label={intl.formatMessage({ id: 'SendInquiryForm.emailLabel' })}
                                type="email"
                                required
                                className={css.inquiryFieldHalf}
                            />
                        </div>
                        <FieldTextInput
                            id="inquiryCompany"
                            name="inquiryCompany"
                            label={intl.formatMessage({ id: 'SendInquiryForm.companyLabel' })}
                            className={css.inquiryField}
                        />
                        <FieldTextInput
                            type="textarea"
                            id="inquiryProjectDescription"
                            name="inquiryProjectDescription"
                            label={intl.formatMessage({ id: 'SendInquiryForm.projectDescriptionLabel' })}
                            required
                            className={css.inquiryField}
                            placeholder={intl.formatMessage({ id: 'SendInquiryForm.projectDescriptionPlaceholder' })}
                        />
                        <div className={css.inquiryRow}>
                            <FieldTextInput
                            type="number"
                                id="inquiryQuantity"
                                name="inquiryQuantity"
                                label={intl.formatMessage({ id: 'SendInquiryForm.quantityLabel' })}
                                placeholder={intl.formatMessage({ id: 'SendInquiryForm.quantityPlaceholder' })}
                                className={css.inquiryFieldHalf}
                            />
                            <FieldTextInput
                            type="number"
                                id="inquiryTimeline"
                                name="inquiryTimeline"
                                label={intl.formatMessage({ id: 'SendInquiryForm.timelineLabel' })}
                                placeholder={intl.formatMessage({ id: 'SendInquiryForm.timelinePlaceholder' })}
                                className={css.inquiryFieldHalf}
                            />
                        </div>
                    </div>
                    <div className={submitButtonWrapperClassName}>
                        <ErrorMessage error={sendInquiryError} />
                        <PrimaryButton type="submit" inProgress={submitInProgress} disabled={submitDisabled}>
                            <FormattedMessage id="SendInquiryForm.submitButtonText" />
                        </PrimaryButton>
                    </div>
                </Form>
            );
        }}
    />
);

export default SendInquiryForm;

