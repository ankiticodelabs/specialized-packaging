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

import css from './InquiryForm.module.css';
import { NO_ACCESS_PAGE_INITIATE_TRANSACTIONS } from '../../../util/urlHelpers';

const ErrorMessage = props => {
  const { error } = props;
  const userPendingApproval = isErrorNoPermissionForUserPendingApproval(error);
  const userHasNoTransactionRights = isErrorNoPermissionForInitiateTransactions(error);

  // No transaction process attached to listing
  return error ? (
    <p className={css.error}>
      {error.message === 'No transaction process attached to listing' ? (
        <FormattedMessage id="InquiryForm.sendInquiryErrorNoProcess" />
      ) : isTooManyRequestsError(error) ? (
        <FormattedMessage id="InquiryForm.tooManyRequestsError" />
      ) : userPendingApproval ? (
        <FormattedMessage id="InquiryForm.userPendingApprovalError" />
      ) : userHasNoTransactionRights ? (
        <FormattedMessage
          id="InquiryForm.noTransactionRightsError"
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
        <FormattedMessage id="InquiryForm.sendInquiryError" />
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
const InquiryForm = props => (
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
      const messageLabel = intl.formatMessage(
        {
          id: 'InquiryForm.messageLabel',
        },
        { authorDisplayName }
      );
      const messagePlaceholder = intl.formatMessage(
        {
          id: 'InquiryForm.messagePlaceholder',
        },
        { authorDisplayName }
      );
      const messageRequiredMessage = intl.formatMessage({
        id: 'SendInquiryForm.messageRequired',
      });
      const messageRequired = validators.requiredAndNonEmptyString(messageRequiredMessage);

      const classes = classNames(rootClassName || css.root, className);
      const submitInProgress = inProgress;
      const submitDisabled = submitInProgress;

      return (
        <Form className={classes} onSubmit={handleSubmit} enforcePagePreloadFor="OrderDetailsPage">
          {/* <IconInquiry className={css.icon} /> */}
          {/* <Heading as="h2" rootClassName={css.heading}>
            <FormattedMessage id="InquiryForm.heading" values={{ listingTitle }} />
          </Heading> */}
          <div className={css.inquiryBox}>
            <h3 className={css.inquiryTitle}><FormattedMessage id='SendInquiryForm.heading'/></h3>
            <p className={css.inquiryDescription}><FormattedMessage id='SendInquiryForm.description'/></p>
            <div className={css.inquiryRow}>
              <FieldTextInput
                id="inquiryUserName"
                name="inquiryUserName"
                label={intl.formatMessage({ id: 'SendInquiryForm.nameLabel' })}
                required
                className={css.inquiryFieldHalf}
                placeholder={intl.formatMessage({ id: 'SendInquiryForm.namePlaceholder' })}
              />
              <FieldTextInput
                id="inquiryEmail"
                name="inquiryEmail"
                label={intl.formatMessage({ id: 'SendInquiryForm.emailLabel' })}
                type="email"
                required
                className={css.inquiryFieldHalf}
                placeholder={intl.formatMessage({ id: 'SendInquiryForm.emailPlaceholder' })}
              />
            </div>
            {/* <FieldTextInput
              id="inquiryCompany"
              name="inquiryCompany"
              label={intl.formatMessage({ id: 'SendInquiryForm.companyLabel' })}
              className={css.inquiryField}
            /> */}
            <FieldTextInput
              className={css.field}
              type="textarea"
              name="inquiryMessage"
              id={formId ? `${formId}.inquiryMessage` : 'inquiryMessage'}
              label={intl.formatMessage({ id: 'SendInquiryForm.messageLabel' })}
              placeholder={intl.formatMessage({ id: 'SendInquiryForm.messagePlaceholder' })}
              validate={messageRequired}
            />
            <div className={css.inquiryRow}>
              <FieldTextInput
                type="number"
                id="inquiryQuantity"
                name="inquiryQuantity"
                label={intl.formatMessage({ id: 'SendInquiryForm.quantityLabel' })}
                placeholder={intl.formatMessage({ id: 'SendInquiryForm.quantityPlaceholder' })}
                className={css.inquiryFieldHalf}
                required
              />
              <FieldTextInput
                type="number"
                id="inquiryTimeline"
                name="inquiryTimeline"
                label={intl.formatMessage({ id: 'SendInquiryForm.timelineLabel' })}
                placeholder={intl.formatMessage({ id: 'SendInquiryForm.timelinePlaceholder' })}
                className={css.inquiryFieldHalf}
                required
              />
            </div>
          </div>

          <div className={submitButtonWrapperClassName}>
            <ErrorMessage error={sendInquiryError} />
            <PrimaryButton classNam={css.inquirySubmitButton} type="submit" inProgress={submitInProgress} disabled={submitDisabled}>
              <FormattedMessage id="InquiryForm.submitButtonText" />
            </PrimaryButton>
          </div>
        </Form>
      );
    }}
  />
);

export default InquiryForm;
