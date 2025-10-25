import React, { useState } from 'react';
import classNames from 'classnames';
import { FormattedMessage } from '../../../../util/reactIntl';
import { LISTING_STATE_DRAFT } from '../../../../util/types';
import { types as sdkTypes } from '../../../../util/sdkLoader';
import { isPriceVariationsEnabled } from '../../../../util/configHelpers';
import { isValidCurrencyForTransactionProcess } from '../../../../util/fieldHelpers';
import { FIXED, isBookingProcess } from '../../../../transactions/transaction';

import { H3, ListingLink } from '../../../../components';
import EditListingAboutForm from './EditListingAboutForm';

import css from './EditListingAboutPanel.module.css';

const { Money } = sdkTypes;

// ---------------------------
// Get listing type config
// ---------------------------
const getListingTypeConfig = (publicData, listingTypes) => {
  const selectedListingType = publicData?.listingType;
  return listingTypes.find(conf => conf.listingType === selectedListingType);
};

// ---------------------------
// Get Initial Values
// ---------------------------
const getInitialValues = props => {
  const { listing, listingTypes } = props;
  const { publicData } = listing?.attributes || {};

  const { aboutSections = [] } = publicData || {};

  const listingTypeConfig = getListingTypeConfig(publicData, listingTypes);
  const isPriceVariationsInUse = isPriceVariationsEnabled(publicData, listingTypeConfig);

  // ✅ Always ensure at least one empty section appears initially
  const safeSections =
    aboutSections.length > 0 ? aboutSections : [{ title: '', description: '' }];

  return {
    aboutSections: safeSections,
  };
};

// ---------------------------
// Optimistic listing helper
// ---------------------------
const getOptimisticListing = (listing, updateValues) => ({
  ...listing,
  attributes: {
    ...listing.attributes,
    ...updateValues,
    publicData: {
      ...listing.attributes?.publicData,
      ...updateValues?.publicData,
    },
  },
});

// ---------------------------
// Main Component
// ---------------------------
const EditListingAboutPanel = props => {
  const [state, setState] = useState({ initialValues: getInitialValues(props) });

  const {
    className,
    rootClassName,
    listing,
    marketplaceCurrency,
    listingMinimumPriceSubUnits,
    disabled,
    ready,
    onSubmit,
    submitButtonText,
    listingTypes,
    panelUpdated,
    updateInProgress,
    errors,
  } = props;

  const classes = classNames(rootClassName || css.root, className);
  const initialValues = state.initialValues;

  const isPublished =
    listing?.id && listing?.attributes?.state !== LISTING_STATE_DRAFT;
  const publicData = listing?.attributes?.publicData;
  const listingTypeConfig = getListingTypeConfig(publicData, listingTypes);
  const transactionProcessAlias = listingTypeConfig?.transactionType?.alias;
  const process = listingTypeConfig?.transactionType?.process;

  const isBooking = isBookingProcess(process);
  const isPriceVariationsInUse = isPriceVariationsEnabled(publicData, listingTypeConfig);
  const isCompatibleCurrency = isValidCurrencyForTransactionProcess(
    transactionProcessAlias,
    marketplaceCurrency
  );

  const priceCurrencyValid = !isCompatibleCurrency
    ? false
    : marketplaceCurrency && initialValues.price instanceof Money
    ? initialValues.price.currency === marketplaceCurrency
    : !!marketplaceCurrency;

  return (
    <main className={classes}>
      <H3 as="h1">
        {isPublished ? (
          <FormattedMessage
            id="EditListingAboutPanel.title"
            values={{
              listingTitle: <ListingLink listing={listing} />,
              lineBreak: <br />,
            }}
          />
        ) : (
          <FormattedMessage
            id="EditListingAboutPanel.createListingTitle"
            values={{ lineBreak: <br /> }}
          />
        )}
      </H3>

      {priceCurrencyValid ? (
        <EditListingAboutForm
          className={css.form}
          initialValues={initialValues}
          onSubmit={values => {
            const { aboutSections } = values;

            const updateValues = {
              publicData: {
                ...listing?.attributes?.publicData,
                aboutSections: aboutSections || [],
              },
            };

            // ✅ Keep the latest values in state
            setState({ initialValues: values });
            onSubmit(updateValues);
          }}
          marketplaceCurrency={marketplaceCurrency}
          listingMinimumPriceSubUnits={listingMinimumPriceSubUnits}
          saveActionMsg={submitButtonText}
          disabled={disabled}
          ready={ready}
          updated={panelUpdated}
          updateInProgress={updateInProgress}
          fetchErrors={errors}
        />
      ) : (
        <div className={css.priceCurrencyInvalid}>
          <FormattedMessage
            id="EditListingPricingPanel.listingPriceCurrencyInvalid"
            values={{ marketplaceCurrency }}
          />
        </div>
      )}
    </main>
  );
};

export default EditListingAboutPanel;
