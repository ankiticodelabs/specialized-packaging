import React, { useState } from 'react';
import classNames from 'classnames';
import { FormattedMessage } from '../../../../util/reactIntl';
import { LISTING_STATE_DRAFT, propTypes } from '../../../../util/types';
import { types as sdkTypes } from '../../../../util/sdkLoader';
import { isPriceVariationsEnabled } from '../../../../util/configHelpers';
import { isValidCurrencyForTransactionProcess } from '../../../../util/fieldHelpers';
import { FIXED, isBookingProcess } from '../../../../transactions/transaction';

import { H3, ListingLink } from '../../../../components';
import EditListingPricingForm from './EditListingPricingForm';

import {
  getInitialValuesForPriceVariants,
  handleSubmitValuesForPriceVariants,
} from './BookingPriceVariants';
import {
  getInitialValuesForStartTimeInterval,
  handleSubmitValuesForStartTimeInterval,
} from './StartTimeInverval';

import css from './EditListingPricingPanel.module.css';

const { Money } = sdkTypes;

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
  const {
    unitType,
    mediaLink,
    pricingPolicy,
  } = publicData || {};

  const listingTypeConfig = getListingTypeConfig(publicData, listingTypes);
  const isPriceVariationsInUse = isPriceVariationsEnabled(publicData, listingTypeConfig);

  // Return appropriate initial values depending on listing type
  return unitType === FIXED || isPriceVariationsInUse
    ? {
        ...getInitialValuesForPriceVariants(props, isPriceVariationsInUse),
        ...getInitialValuesForStartTimeInterval(props),
        pricingPolicy,
        mediaLink
      }
    : {
        pricingPolicy,
        mediaLink
      };
};

// ---------------------------
// Optimistic listing helper
// ---------------------------
const getOptimisticListing = (listing, updateValues) => {
  return {
    ...listing,
    attributes: {
      ...listing.attributes,
      ...updateValues,
      publicData: {
        ...listing.attributes?.publicData,
        ...updateValues?.publicData,
      },
    },
  };
};

// ---------------------------
// Main Component
// ---------------------------
const EditListingPricingPanel = props => {
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

  const isPublished = listing?.id && listing?.attributes?.state !== LISTING_STATE_DRAFT;
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

  const unitType = listing?.attributes?.publicData?.unitType;

  return (
    <main className={classes}>
      <H3 as="h1">
        {isPublished ? (
          <FormattedMessage
            id="EditListingPricingPanel.title"
            values={{
              listingTitle: <ListingLink listing={listing} />,
              lineBreak: <br />,
            }}
          />
        ) : (
          <FormattedMessage
            id="EditListingPricingPanel.createListingTitle"
            values={{ lineBreak: <br /> }}
          />
        )}
      </H3>

      {priceCurrencyValid ? (
        <EditListingPricingForm
          className={css.form}
          initialValues={initialValues}
          onSubmit={values => {
            const {
              mediaLink,
              pricingPolicy,
            } = values;

            const updateValues = {
              publicData: {
                ...listing?.attributes?.publicData,
                // maxLeadTime,
                // maxMOQ,
                // maxWidth,
                // minLeadTime,
                // minMOQ,
                // colors,
                pricingPolicy,
                mediaLink,
                priceVariationsEnabled: isPriceVariationsInUse,
              },
            };

            // Store the new initial values to avoid overwriting mid-submit
            setState({ initialValues: values });
            onSubmit(updateValues);
          }}
          marketplaceCurrency={marketplaceCurrency}
          unitType={unitType}
          listingTypeConfig={listingTypeConfig}
          isPriceVariationsInUse={isPriceVariationsInUse}
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

export default EditListingPricingPanel;
