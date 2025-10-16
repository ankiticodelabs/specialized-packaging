import React, { useEffect, useState } from 'react';
import { Field, Form as FinalForm } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import classNames from 'classnames';

// Import util modules
import { FormattedMessage, useIntl } from '../../util/reactIntl';
import { composeValidators, nonEmptyArray, required, moneySubUnitAmountAtLeast } from '../../util/validators';
import { types as sdkTypes } from '../../util/sdkLoader';
const { Money } = sdkTypes;

// Import shared components
import { Form, Button, AspectRatioWrapper, Modal, NamedLink, FieldTextInput, FieldCurrencyInput } from '../../components';
// Import modules from this directory
import css from './ContactUsForm.module.css';
import { PrimaryButton } from '../../components';
import appSettings from '../../config/settings';
import { useConfiguration } from '../../context/configurationContext';
import * as validators from '../../util/validators';
import { formatMoney } from '../../util/currency';

const getPriceValidators = (listingMinimumPriceSubUnits, marketplaceCurrency, intl) => {
    const priceRequiredMsgId = { id: 'GiftCardPageForm.priceRequired' };
    const priceRequiredMsg = intl.formatMessage(priceRequiredMsgId);
    const priceRequired = validators.required(priceRequiredMsg);

    const minPriceRaw = new Money(listingMinimumPriceSubUnits, marketplaceCurrency);
    const minPrice = formatMoney(intl, minPriceRaw);
    const priceTooLowMsgId = { id: 'GiftCardPageForm.priceTooLow' };
    const priceTooLowMsg = intl.formatMessage(priceTooLowMsgId, { minPrice });
    const minPriceRequired = validators.moneySubUnitAmountAtLeast(
        priceTooLowMsg,
        listingMinimumPriceSubUnits
    );

    return listingMinimumPriceSubUnits
        ? validators.composeValidators(priceRequired, minPriceRequired)
        : priceRequired;
};
// Show various error messages
const ErrorMessage = props => {
    const { fetchErrors } = props;
    const { updateListingError, createListingDraftError, showListingsError } = fetchErrors || {};
    const errorMessage = updateListingError ? (
        <FormattedMessage id="EditListingDetailsForm.updateFailed" />
    ) : createListingDraftError ? (
        <FormattedMessage id="EditListingDetailsForm.createListingDraftError" />
    ) : showListingsError ? (
        <FormattedMessage id="EditListingDetailsForm.showListingFailed" />
    ) : null;

    if (errorMessage) {
        return <p className={css.error}>{errorMessage}</p>;
    }
    return null;
};



const ContactUsForm = props => {
    const config = useConfiguration();
    return (
        <FinalForm
            {...props}
            mutators={{ ...arrayMutators }}
            keepDirtyOnReinitialize={true}
            onSubmit={(values, form) => {
                // Pass both values and form instance to the parent's onSubmit
                return props.onSubmit(values, form);
            }}
            render={formRenderProps => {
                const {
                    autoFocus,
                    unitType,
                    className,
                    disabled,
                    submitInProgress,
                    ready,
                    formId = 'GiftCardPageForm',
                    form: formApi,
                    handleSubmit,
                    invalid,
                    pristine,
                    marketplaceName,
                    saveActionMsg,
                    updated,
                    updateInProgress,
                    fetchErrors,
                    listingFieldsConfig = [],
                    listingCurrency,
                    values,
                    form,
                } = formRenderProps;
                const listingMinimumPriceSubUnits = config.listingMinimumPriceSubUnits;
                const marketplaceCurrency = config.currency;
                const intl = useIntl();
                const classes = classNames(css.root, className);
                const submitDisabled =
                    invalid ||
                    disabled ||
                    submitInProgress
                const priceValidators = getPriceValidators(
                    listingMinimumPriceSubUnits,
                    marketplaceCurrency,
                    intl
                );
                return (
                    <>
                        <Form
                            className={classes}
                            onSubmit={handleSubmit}
                        >
                            <ErrorMessage fetchErrors={fetchErrors} />
                            <h1 className={css.title}>Contact us</h1>

                            <div className={css.fieldWrapper}>
                                <FieldTextInput
                                    id="companyName"
                                    className={css.inputBox}
                                    name="companyName"
                                    type="text"
                                    label={intl.formatMessage({ id: 'ContactUsForm.companyNameLabel' })}
                                    validate={composeValidators(required(
                                        <FormattedMessage id="ContactUsForm.companyNameRequired" />
                                    ))}
                                />
                                <FieldTextInput
                                    id="websiteName"
                                    name="websiteName"
                                    type="text"
                                    label={intl.formatMessage({ id: 'ContactUsForm.websiteNameLabel' })}
                                    className={css.inputBox}
                                    validate={composeValidators(required(
                                        <FormattedMessage id="ContactUsForm.websiteNameRequired" />
                                    ))}
                                />
                            </div>
                                <FieldTextInput
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    type="number"
                                    label={intl.formatMessage({ id: 'ContactUsForm.phoneNumberLabel' })}
                                    className={css.singleInput}
                                    validate={composeValidators(required(
                                        <FormattedMessage id="ContactUsForm.phoneNumberRequired" />
                                    ))}
                                />
                                <FieldTextInput
                                    id="typeofPacking"
                                    name="typeofPacking"
                                    type="textarea"
                                    row="5"
                                    label={intl.formatMessage({ id: 'ContactUsForm.typeofPackingLabel' })}
                                    className={css.singleInput}
                                    validate={composeValidators(required(
                                        <FormattedMessage id="ContactUsForm.typeofPackingRequired" />
                                    ))}
                                />
                                <FieldTextInput
                                    id="problemToSolve"
                                    name="problemToSolve"
                                    type="textarea"
                                    row="5"
                                    label={intl.formatMessage({ id: 'ContactUsForm.problemToSolveLabel' })}
                                    className={css.singleInput}
                                    validate={composeValidators(required(
                                        <FormattedMessage id="ContactUsForm.problemToSolveRequired" />
                                    ))}
                                />

                            <div className={css.bottomWrapper}>
                                <PrimaryButton type="submit" inProgress={submitInProgress} disabled={submitDisabled}>
                                    <FormattedMessage id="ContactUsForm.sendButton" />
                                </PrimaryButton>
                            </div>
                        </Form>
                    </>
                );
            }}
        />
    );
};

export default ContactUsForm;
