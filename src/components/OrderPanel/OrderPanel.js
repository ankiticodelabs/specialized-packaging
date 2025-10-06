import React, { useEffect, useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import loadable from '@loadable/component';
import classNames from 'classnames';

import { FormattedMessage, useIntl } from '../../util/reactIntl';
import {
  displayDeliveryPickup,
  displayDeliveryShipping,
  displayPrice,
} from '../../util/configHelpers';
import {
  propTypes,
  AVAILABILITY_MULTIPLE_SEATS,
  LISTING_STATE_CLOSED,
  LINE_ITEM_NIGHT,
  LINE_ITEM_DAY,
  LINE_ITEM_HOUR,
  LINE_ITEM_FIXED,
  LINE_ITEM_ITEM,
  STOCK_MULTIPLE_ITEMS,
  STOCK_INFINITE_MULTIPLE_ITEMS,
  LISTING_STATE_PUBLISHED,
} from '../../util/types';
import { formatMoney } from '../../util/currency';
import { createSlug, parse, stringify } from '../../util/urlHelpers';
import { userDisplayNameAsString } from '../../util/data';
import {
  INQUIRY_PROCESS_NAME,
  getSupportedProcessesInfo,
  isBookingProcess,
  isPurchaseProcess,
  resolveLatestProcessName,
} from '../../transactions/transaction';

import { ModalInMobile, PrimaryButton, AvatarSmall, H1, H2, Button, Modal } from '../../components';
import PriceVariantPicker from './PriceVariantPicker/PriceVariantPicker';

import css from './OrderPanel.module.css';
import QuickSpecs from './QuickSpec';
import InquiryForm from '../../containers/ListingPage/InquiryForm/InquiryForm';
import { matchPathname } from '../../util/routes';
import { useRouteConfiguration } from '../../context/routeConfigurationContext';

const BookingTimeForm = loadable(() =>
  import(/* webpackChunkName: "BookingTimeForm" */ './BookingTimeForm/BookingTimeForm')
);
const BookingDatesForm = loadable(() =>
  import(/* webpackChunkName: "BookingDatesForm" */ './BookingDatesForm/BookingDatesForm')
);
const BookingFixedDurationForm = loadable(() =>
  import(
    /* webpackChunkName: "BookingFixedDurationForm" */ './BookingFixedDurationForm/BookingFixedDurationForm'
  )
);
const InquiryWithoutPaymentForm = loadable(() =>
  import(
    /* webpackChunkName: "InquiryWithoutPaymentForm" */ './InquiryWithoutPaymentForm/InquiryWithoutPaymentForm'
  )
);
const ProductOrderForm = loadable(() =>
  import(/* webpackChunkName: "ProductOrderForm" */ './ProductOrderForm/ProductOrderForm')
);

// This defines when ModalInMobile shows content as Modal
const MODAL_BREAKPOINT = 1023;
const TODAY = new Date();

const isPublishedListing = listing => {
  return listing.attributes.state === LISTING_STATE_PUBLISHED;
};

const priceData = (price, currency, intl) => {
  if (price && price.currency === currency) {
    const formattedPrice = formatMoney(intl, price);
    return { formattedPrice, priceTitle: formattedPrice };
  } else if (price) {
    return {
      formattedPrice: `(${price.currency})`,
      priceTitle: `Unsupported currency (${price.currency})`,
    };
  }
  return {};
};

const getCheapestPriceVariant = (priceVariants = []) => {
  return priceVariants.reduce((cheapest, current) => {
    return current.priceInSubunits < cheapest.priceInSubunits ? current : cheapest;
  }, priceVariants[0]);
};

const formatMoneyIfSupportedCurrency = (price, intl) => {
  try {
    return formatMoney(intl, price);
  } catch (e) {
    return `(${price.currency})`;
  }
};

const openOrderModal = (isOwnListing, isClosed, history, location) => {
  if (isOwnListing || isClosed) {
    window.scrollTo(0, 0);
  } else {
    const { pathname, search, state } = location;
    const searchString = `?${stringify({ ...parse(search), orderOpen: true })}`;
    history.push(`${pathname}${searchString}`, state);
  }
};

const closeOrderModal = (history, location) => {
  const { pathname, search, state } = location;
  const { orderOpen, ...searchParams } = parse(search);
  const searchString = `?${stringify(searchParams)}`;
  history.push(`${pathname}${searchString}`, state);
};

const handleSubmit = (
  isOwnListing,
  isClosed,
  isInquiryWithoutPayment,
  onSubmit,
  history,
  location
) => {
  // TODO: currently, inquiry-process does not have any form to ask more order data.
  // We can submit without opening any inquiry/order modal.
  return isInquiryWithoutPayment
    ? () => onSubmit({})
    : () => openOrderModal(isOwnListing, isClosed, history, location);
};

const dateFormattingOptions = { month: 'short', day: 'numeric', weekday: 'short' };

const PriceMaybe = props => {
  const {
    price,
    publicData,
    validListingTypes,
    intl,
    marketplaceCurrency,
    showCurrencyMismatch = false,
  } = props;
  const { listingType, unitType } = publicData || {};

  const foundListingTypeConfig = validListingTypes.find(conf => conf.listingType === listingType);
  const showPrice = displayPrice(foundListingTypeConfig);
  const isPriceVariationsInUse = !!publicData?.priceVariationsEnabled;
  const hasMultiplePriceVariants = publicData?.priceVariants?.length > 1;

  if (!showPrice || !price || (isPriceVariationsInUse && hasMultiplePriceVariants)) {
    return null;
  }

  // Get formatted price or currency code if the currency does not match with marketplace currency
  const { formattedPrice, priceTitle } = priceData(price, marketplaceCurrency, intl);
  const priceValue = (
    <span className={css.priceValue}>{formatMoneyIfSupportedCurrency(price, intl)}</span>
  );
  const pricePerUnit = (
    <span className={css.perUnit}>
      <FormattedMessage id="OrderPanel.perUnit" values={{ unitType }} />
    </span>
  );

  // TODO: In CTA, we don't have space to show proper error message for a mismatch of marketplace currency
  //       Instead, we show the currency code in place of the price
  return showCurrencyMismatch ? (
    <div className={css.priceContainerInCTA}>
      <div className={css.priceValueInCTA} title={priceTitle}>
        <FormattedMessage
          id="OrderPanel.priceInMobileCTA"
          values={{ priceValue: formattedPrice }}
        />
      </div>
      <div className={css.perUnitInCTA}>
        <FormattedMessage id="OrderPanel.perUnit" values={{ unitType }} />
      </div>
    </div>
  ) : (
    <div className={css.priceContainer}>
      <p className={css.price}>
        <FormattedMessage id="OrderPanel.price" values={{ priceValue, pricePerUnit }} />
      </p>
    </div>
  );
};

const PriceMissing = () => {
  return (
    <p className={css.error}>
      <FormattedMessage id="OrderPanel.listingPriceMissing" />
    </p>
  );
};
const InvalidCurrency = () => {
  return (
    <p className={css.error}>
      <FormattedMessage id="OrderPanel.listingCurrencyInvalid" />
    </p>
  );
};

const InvalidPriceVariants = () => {
  return (
    <p className={css.error}>
      <FormattedMessage id="OrderPanel.listingPriceVariantsAreInvalid" />
    </p>
  );
};

const hasUniqueVariants = priceVariants => {
  const priceVariantsSlugs = priceVariants?.map(variant =>
    variant.name ? createSlug(variant.name) : 'no-name'
  );
  return new Set(priceVariantsSlugs).size === priceVariants.length;
};

const hasValidPriceVariants = priceVariants => {
  const isArray = Array.isArray(priceVariants);
  const hasItems = isArray && priceVariants.length > 0;
  const variantsHaveNames = hasItems && priceVariants.every(variant => variant.name);
  const namesAreUnique = hasItems && hasUniqueVariants(priceVariants);

  return variantsHaveNames && namesAreUnique;
};
const isCMSPage = found =>
  found.route?.name === 'CMSPage' ? `CMSPage:${found.params?.pageId}` : null;
const isInboxPage = found =>
  found.route?.name === 'InboxPage' ? `InboxPage:${found.params?.tab}` : null;
const getResolvedCurrentPage = (location, routeConfiguration) => {
  const matchedRoutes = matchPathname(location.pathname, routeConfiguration);
  if (matchedRoutes.length > 0) {
    const found = matchedRoutes[0];
    const cmsPageName = isCMSPage(found);
    const inboxPageName = isInboxPage(found);
    return cmsPageName ? cmsPageName : inboxPageName ? inboxPageName : `${found.route?.name}`;
  }
};
/**
 * @typedef {Object} ListingTypeConfig
 * @property {string} listingType - The type of the listing
 * @property {string} transactionType - The type of the transaction
 * @property {string} transactionType.process - The process descriptionof the transaction
 * @property {string} transactionType.alias - The alias of the transaction process
 * @property {string} transactionType.unitType - The unit type of the transaction
 */

/**
 * OrderPanel is a component that renders a panel for making bookings, purchases, or inquiries for a listing.
 * It handles different transaction processes and displays appropriate forms based on the listing type.
 *
 * @param {Object} props
 * @param {string} [props.rootClassName] - Custom class that overwrites the default class for the root element
 * @param {string} [props.className] - Custom class that extends
 * @param {string} [props.titleClassName] - Custom class name for the title
 * @param {propTypes.listing} props.listing - The listing data (either regular or own listing)
 * @param {Array<ListingTypeConfig>} props.validListingTypes - Array of valid listing type configurations
 * @param {boolean} [props.isOwnListing=false] - Whether the listing belongs to the current user
 * @param {listingType.user|listingType.currentUser} props.author - The listing author's user data
 * @param {ReactNode} [props.authorLink] - Custom component for rendering the author link
 * @param {ReactNode} [props.payoutDetailsWarning] - Warning message about payout details
 * @param {Function} props.onSubmit - Handler for form submission
 * @param {ReactNode|string} props.title - Title of the panel
 * @param {ReactNode} [props.titleDesktop] - Alternative title for desktop view
 * @param {ReactNode|string} [props.subTitle] - Subtitle text
 * @param {Function} props.onManageDisableScrolling - Handler for managing scroll behavior
 * @param {Function} props.onFetchTimeSlots - Handler for fetching available time slots
 * @param {Object} [props.monthlyTimeSlots] - Available time slots by month
 * @param {Function} props.onFetchTransactionLineItems - Handler for fetching transaction line items
 * @param {Function} [props.onContactUser] - Handler for contacting the listing author
 * @param {Array} [props.lineItems] - Array of line items for the transaction
 * @param {boolean} props.fetchLineItemsInProgress - Whether line items are being fetched
 * @param {Object} [props.fetchLineItemsError] - Error object if line items fetch failed
 * @param {string} props.marketplaceCurrency - The currency used in the marketplace
 * @param {number} props.dayCountAvailableForBooking - Number of days available for booking
 * @param {string} props.marketplaceName - Name of the marketplace
 *
 * @returns {JSX.Element} Component that displays the order panel with appropriate form
 */
const OrderPanel = props => {
  const [mounted, setMounted] = useState(false);
  const intl = useIntl();
  const location = useLocation();
  const history = useHistory();
  const routeConfiguration = useRouteConfiguration();
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
   // When modal closes, scroll page to top on MOBILE only
  useEffect(() => {
    if (isInquiryModalOpen) return;
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= MODAL_BREAKPOINT;
    if (!isMobile) return;

    const scrollToTopNow = () => {
      // Try multiple strategies to ensure top in different browsers
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0; // Chrome, Firefox, IE
      document.body.scrollTop = 0; // Safari
    };
    // Delay a frame to ensure DOM has updated after unmount/close
    requestAnimationFrame(scrollToTopNow);
    // And once more shortly after to be safe against layout shifts
    setTimeout(scrollToTopNow, 100);
  }, [isInquiryModalOpen]);
  
  // Lock background scroll when inquiry modal is open (mobile-safe)
  useEffect(() => {
    if (!isInquiryModalOpen) return;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, [isInquiryModalOpen]);
  const {
    rootClassName,
    className,
    titleClassName,
    listing,
    validListingTypes,
    lineItemUnitType: lineItemUnitTypeMaybe,
    isOwnListing,
    onSubmit,
    title,
    titleDesktop,
    author,
    authorLink,
    onManageDisableScrolling,
    onFetchTimeSlots,
    monthlyTimeSlots,
    timeSlotsForDate,
    onFetchTransactionLineItems,
    onContactUser,
    lineItems,
    marketplaceCurrency,
    dayCountAvailableForBooking,
    marketplaceName,
    fetchLineItemsInProgress,
    fetchLineItemsError,
    payoutDetailsWarning,
    showListingImage,
    sendInquiryError,
    sendInquiryInProgress,
    onSubmitInquiry
  } = props;
  console.log(props, '%%% %%% => props');

  const publicData = listing?.attributes?.publicData || {};
  const { phoneNumber, email } = author?.attributes?.profile?.publicData || {};

  const { listingType, unitType, transactionProcessAlias = '', priceVariants, startTimeInterval } =
    publicData || {};

  const processName = resolveLatestProcessName(transactionProcessAlias.split('/')[0]);
  const lineItemUnitType = lineItemUnitTypeMaybe || `line-item/${unitType}`;

  const price = listing?.attributes?.price;
  const isPaymentProcess = processName !== INQUIRY_PROCESS_NAME;

  const showPriceMissing = isPaymentProcess && !price;
  const showInvalidCurrency = isPaymentProcess && price?.currency !== marketplaceCurrency;

  const timeZone = listing?.attributes?.availabilityPlan?.timezone;
  const isClosed = listing?.attributes?.state === LISTING_STATE_CLOSED;

  const isBooking = isBookingProcess(processName);
  const shouldHaveFixedBookingDuration = isBooking && [LINE_ITEM_FIXED].includes(lineItemUnitType);
  const showBookingFixedDurationForm =
    mounted && shouldHaveFixedBookingDuration && !isClosed && timeZone && priceVariants?.length > 0;

  const shouldHaveBookingTime = isBooking && [LINE_ITEM_HOUR].includes(lineItemUnitType);
  const showBookingTimeForm = mounted && shouldHaveBookingTime && !isClosed && timeZone;

  const shouldHaveBookingDates =
    isBooking && [LINE_ITEM_DAY, LINE_ITEM_NIGHT].includes(lineItemUnitType);
  // const showBookingDatesForm = mounted && shouldHaveBookingDates && !isClosed && timeZone;
  const showBookingDatesForm = false;
  const currentPage = getResolvedCurrentPage(location, routeConfiguration);

  // The listing resource has a relationship: `currentStock`,
  // which you should include when making API calls.
  const isPurchase = isPurchaseProcess(processName);
  const shouldHavePurchase = isPurchase && lineItemUnitType === LINE_ITEM_ITEM;
  const currentStock = listing.currentStock?.attributes?.quantity;
  const isOutOfStock = shouldHavePurchase && !isClosed && currentStock === 0;

  // Show form only when stock is fully loaded. This avoids "Out of stock" UI by
  // default before all data has been downloaded.
  const showProductOrderForm =
    mounted && shouldHavePurchase && !isClosed && typeof currentStock === 'number';

  const showInquiryForm = mounted && !isClosed && processName === INQUIRY_PROCESS_NAME;

  const supportedProcessesInfo = getSupportedProcessesInfo();
  const isKnownProcess = supportedProcessesInfo.map(info => info.name).includes(processName);

  const { pickupEnabled, shippingEnabled } = listing?.attributes?.publicData || {};

  const listingTypeConfig = validListingTypes.find(conf => conf.listingType === listingType);
  const displayShipping = displayDeliveryShipping(listingTypeConfig);
  const displayPickup = displayDeliveryPickup(listingTypeConfig);
  const allowOrdersOfMultipleItems = [STOCK_MULTIPLE_ITEMS, STOCK_INFINITE_MULTIPLE_ITEMS].includes(
    listingTypeConfig?.stockType
  );

  const searchParams = parse(location.search);
  const isOrderOpen = !!searchParams.orderOpen;
  const preselectedPriceVariantSlug = searchParams.bookableOption;

  const seatsEnabled = [AVAILABILITY_MULTIPLE_SEATS].includes(listingTypeConfig?.availabilityType);

  // Note: publicData contains priceVariationsEnabled if listing is created with priceVariations enabled.
  const isPriceVariationsInUse = !!publicData?.priceVariationsEnabled;
  const preselectedPriceVariant =
    Array.isArray(priceVariants) && preselectedPriceVariantSlug && isPriceVariationsInUse
      ? priceVariants.find(pv => pv?.name && createSlug(pv?.name) === preselectedPriceVariantSlug)
      : null;

  const priceVariantsMaybe = isPriceVariationsInUse
    ? {
      isPriceVariationsInUse,
      priceVariants,
      priceVariantFieldComponent: PriceVariantPicker,
      preselectedPriceVariant,
      isPublishedListing: isPublishedListing(listing),
    }
    : !isPriceVariationsInUse && showBookingFixedDurationForm
      ? {
        isPriceVariationsInUse: false,
        priceVariants: [getCheapestPriceVariant(priceVariants)],
        priceVariantFieldComponent: PriceVariantPicker,
      }
      : {};

  const showInvalidPriceVariantsMessage =
    isPriceVariationsInUse && !hasValidPriceVariants(priceVariants);

  const sharedProps = {
    lineItemUnitType,
    onSubmit,
    price,
    marketplaceCurrency,
    listingId: listing.id,
    isOwnListing,
    marketplaceName,
    onFetchTransactionLineItems,
    lineItems,
    fetchLineItemsInProgress,
    fetchLineItemsError,
    payoutDetailsWarning,
  };

  const showClosedListingHelpText = listing.id && isClosed;

  const subTitleText = showClosedListingHelpText
    ? intl.formatMessage({ id: 'OrderPanel.subTitleClosedListing' })
    : null;

  const authorDisplayName = userDisplayNameAsString(author, '');

  const classes = classNames(rootClassName || css.root, className);
  const titleClasses = classNames(titleClassName || css.orderTitle);

  return (
    <div className={classes}>
      <ModalInMobile
        containerClassName={css.modalContainer}
        id="OrderFormInModal"
        isModalOpenOnMobile={isOrderOpen}
        onClose={() => closeOrderModal(history, location)}
        showAsModalMaxWidth={MODAL_BREAKPOINT}
        onManageDisableScrolling={onManageDisableScrolling}
        usePortal
      >
        {/* <div className={css.modalHeading}>
          <H1 className={css.heading}>{title}</H1>
        </div> */}

        {showListingImage && (
          <div className={css.orderHeading}>
            {titleDesktop ? titleDesktop : <H2 className={titleClasses}>{title}</H2>}
            {subTitleText ? <div className={css.orderHelp}>{subTitleText}</div> : null}
          </div>
        )}
        {currentPage === 'ListingPage' ?<>
          <PriceMaybe
            price={price}
            publicData={publicData}
            validListingTypes={validListingTypes}
            intl={intl}
            marketplaceCurrency={marketplaceCurrency}
          />
        <div className={css.author}>
          <AvatarSmall user={author} className={css.providerAvatar} />
          <span className={css.providerNameLinked}>
            <FormattedMessage id="OrderPanel.author" values={{ name: authorLink }} />
          </span>
          <span className={css.providerNamePlain}>
            <FormattedMessage id="OrderPanel.author" values={{ name: authorDisplayName }} />
          </span>
        </div>
         </>: null}
        {currentPage === 'ListingPage' ?
          <>
            <QuickSpecs publicData={publicData} />
           <Button type='button' onClick={() => setIsInquiryModalOpen(true)}>Inquiry Now</Button>
        <div className={css.contactCard}>
          <h3 className={css.contactTitle}>Contact Information</h3>
          <ul className={css.contactList}>
            {phoneNumber && (
              <li>
                <span className={css.contactIcon}>
                  <svg version="1.1" id="Layer_1" enable-background="new 0 0 32 32" width="20" height="20" viewBox="0 0 20 20"><path fill="none" stroke="hsl(210 15% 45%)" stroke-width="1.25" stroke-miterlimit="10" d="m8.5 5.313 -2.563 -2.625c-0.313 -0.25 -0.75 -0.25 -1.063 0l-1.938 2c-0.438 0.375 -0.563 1 -0.375 1.5 0.5 1.438 1.813 4.313 4.375 6.875s5.438 3.813 6.875 4.375c0.563 0.188 1.125 0.063 1.563 -0.313l1.938 -1.938c0.313 -0.313 0.313 -0.75 0 -1.063L14.75 11.563a0.719 0.719 0 0 0 -1.063 0L12.125 13.125s-1.75 -0.75 -3.125 -2.063 -2.063 -3.125 -2.063 -3.125L8.5 6.375c0.313 -0.313 0.313 -0.813 0 -1.063z" /></svg>
                </span>
                {/* <span>{publicData.phoneNumber}</span> */}
                <span>{phoneNumber}</span>
              </li>
            )}
            {email && (
              <li>
                <span className={css.contactIcon}>
                  <svg width="20px" height="20px" viewBox="0 0 0.4 0.4" xmlns="http://www.w3.org/2000/svg" fill="hsl(210 15% 45%)"><path fill-rule="evenodd" clip-rule="evenodd" d="m0.025 0.088 0.013 -0.013h0.325l0.013 0.013v0.225l-0.013 0.013h-0.325l-0.013 -0.013zm0.025 0.026V0.3h0.3V0.113L0.208 0.223H0.193zM0.326 0.1H0.074L0.2 0.197z"/></svg>
                </span>
                {/* <span>{publicData.email}</span> */}
                <span>{email}</span>
              </li>
            )}
            {publicData?.websiteUrl && (
              <li>
                <span className={css.contactIcon}>
                  <svg width="20px" height="20px" viewBox="0 0 0.6 0.6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.191 0.523c-0.001 0 -0.002 0.001 -0.003 0.001 -0.049 -0.024 -0.088 -0.064 -0.112 -0.112 0 -0.001 0.001 -0.002 0.001 -0.003 0.03 0.009 0.062 0.016 0.093 0.021 0.006 0.032 0.012 0.063 0.021 0.093" fill="hsl(210 15% 45%)"/><path d="M0.524 0.411c-0.025 0.05 -0.066 0.09 -0.116 0.114 0.01 -0.032 0.017 -0.064 0.023 -0.096 0.032 -0.005 0.063 -0.012 0.093 -0.021 0 0.001 0.001 0.002 0.001 0.003" fill="hsl(210 15% 45%)"/><path d="M0.525 0.193c-0.032 -0.01 -0.063 -0.017 -0.096 -0.023 -0.005 -0.032 -0.013 -0.064 -0.023 -0.096 0.052 0.025 0.094 0.067 0.118 0.118" fill="hsl(210 15% 45%)"/><path d="M0.191 0.077c-0.009 0.03 -0.015 0.061 -0.021 0.093 -0.032 0.005 -0.064 0.013 -0.096 0.023 0.024 -0.05 0.065 -0.092 0.114 -0.116 0.001 0 0.002 0.001 0.003 0.001" fill="hsl(210 15% 45%)" /><path d="M0.387 0.165c-0.058 -0.007 -0.117 -0.007 -0.175 0 0.006 -0.034 0.014 -0.069 0.026 -0.101 0.001 -0.002 0 -0.004 0.001 -0.006 0.02 -0.005 0.04 -0.008 0.061 -0.008 0.021 0 0.042 0.003 0.061 0.008 0 0.002 0 0.004 0.001 0.006 0.011 0.033 0.019 0.067 0.026 0.101" fill="hsl(210 15% 45%)"/><path d="M0.165 0.387c-0.034 -0.006 -0.069 -0.014 -0.101 -0.026 -0.002 -0.001 -0.004 0 -0.006 -0.001 -0.005 -0.02 -0.008 -0.04 -0.008 -0.061 0 -0.021 0.003 -0.042 0.008 -0.061 0.002 0 0.004 0 0.006 -0.001 0.033 -0.011 0.067 -0.019 0.101 -0.026 -0.006 0.058 -0.006 0.117 0 0.175" fill="hsl(210 15% 45%)"/><path d="M0.55 0.3c0 0.021 -0.003 0.042 -0.008 0.061 -0.002 0 -0.004 0 -0.006 0.001 -0.033 0.011 -0.067 0.019 -0.101 0.026 0.007 -0.058 0.007 -0.117 0 -0.175 0.034 0.006 0.069 0.014 0.101 0.026 0.002 0.001 0.004 0.001 0.006 0.001 0.005 0.02 0.008 0.04 0.008 0.061" fill="hsl(210 15% 45%)"/><path d="M0.387 0.435c-0.006 0.034 -0.014 0.069 -0.026 0.101 -0.001 0.002 -0.001 0.004 -0.001 0.006 -0.02 0.005 -0.04 0.008 -0.061 0.008 -0.021 0 -0.042 -0.003 -0.061 -0.008 0 -0.002 0 -0.004 -0.001 -0.006a0.75 0.75 0 0 1 -0.026 -0.101c0.029 0.003 0.058 0.006 0.087 0.006s0.058 -0.002 0.087 -0.006" fill="hsl(210 15% 45%)"/><path d="M0.394 0.394a0.75 0.75 0 0 1 -0.188 0 0.75 0.75 0 0 1 0 -0.188 0.75 0.75 0 0 1 0.188 0 0.75 0.75 0 0 1 0 0.188" fill="hsl(210 15% 45%)"/></svg>
                </span>
                <span>{publicData.websiteUrl}</span>
              </li>
            )}
          </ul>
        </div>
         {/* <InquiryForm
          className={css.inquiryForm}
          submitButtonWrapperClassName={css.inquirySubmitButtonWrapper}
          listingTitle={title}
          authorDisplayName={authorDisplayName}
          sendInquiryError={sendInquiryError}
          onSubmit={onSubmitInquiry}
          inProgress={sendInquiryInProgress}
        /> */}
    
          </> : null}
        {showPriceMissing ? (
          <PriceMissing />
        ) : showInvalidCurrency ? (
          <InvalidCurrency />
        ) : showInvalidPriceVariantsMessage ? (
          <InvalidPriceVariants />
        ) : showBookingFixedDurationForm ? (
          <BookingFixedDurationForm
            seatsEnabled={seatsEnabled}
            className={css.bookingForm}
            formId="OrderPanelBookingFixedDurationForm"
            dayCountAvailableForBooking={dayCountAvailableForBooking}
            monthlyTimeSlots={monthlyTimeSlots}
            timeSlotsForDate={timeSlotsForDate}
            onFetchTimeSlots={onFetchTimeSlots}
            startDatePlaceholder={intl.formatDate(TODAY, dateFormattingOptions)}
            startTimeInterval={startTimeInterval}
            timeZone={timeZone}
            {...priceVariantsMaybe}
            {...sharedProps}
          />
        ) : showBookingTimeForm ? (
          <BookingTimeForm
            seatsEnabled={seatsEnabled}
            className={css.bookingForm}
            formId="OrderPanelBookingTimeForm"
            dayCountAvailableForBooking={dayCountAvailableForBooking}
            monthlyTimeSlots={monthlyTimeSlots}
            timeSlotsForDate={timeSlotsForDate}
            onFetchTimeSlots={onFetchTimeSlots}
            startDatePlaceholder={intl.formatDate(TODAY, dateFormattingOptions)}
            endDatePlaceholder={intl.formatDate(TODAY, dateFormattingOptions)}
            timeZone={timeZone}
            {...priceVariantsMaybe}
            {...sharedProps}
          />
        ) : showBookingDatesForm ? (
          <BookingDatesForm
            seatsEnabled={seatsEnabled}
            className={css.bookingForm}
            formId="OrderPanelBookingDatesForm"
            dayCountAvailableForBooking={dayCountAvailableForBooking}
            monthlyTimeSlots={monthlyTimeSlots}
            onFetchTimeSlots={onFetchTimeSlots}
            timeZone={timeZone}
            {...priceVariantsMaybe}
            {...sharedProps}
          />
        ) : showProductOrderForm ? (
          <ProductOrderForm
            formId="OrderPanelProductOrderForm"
            currentStock={currentStock}
            allowOrdersOfMultipleItems={allowOrdersOfMultipleItems}
            pickupEnabled={pickupEnabled && displayPickup}
            shippingEnabled={shippingEnabled && displayShipping}
            displayDeliveryMethod={displayPickup || displayShipping}
            onContactUser={onContactUser}
            {...sharedProps}
          />
        ) : showInquiryForm ? (
          <InquiryWithoutPaymentForm formId="OrderPanelInquiryForm" onSubmit={onSubmit} />
        ) : !isKnownProcess ? (
          <p className={css.errorSidebar}>
            <FormattedMessage id="OrderPanel.unknownTransactionProcess" />
          </p>
        ) : null}
      </ModalInMobile>
      {/* QuickSpecs moved to ListingPage before SectionMapMaybe for mobile only */}
      {!isInquiryModalOpen && currentPage === 'ListingPage' && (
        <div className={css.openOrderForm}>
          <PriceMaybe
            price={price}
            publicData={publicData}
            validListingTypes={validListingTypes}
            intl={intl}
            marketplaceCurrency={marketplaceCurrency}
            showCurrencyMismatch
          />
          {/* 
          {isClosed ? (
            <div className={css.closedListingButton}>
              <FormattedMessage id="OrderPanel.closedListingButtonText" />
            </div>
          ) : (
            <PrimaryButton
              onClick={handleSubmit(
                isOwnListing,
                isClosed,
                showInquiryForm,
                onSubmit,
                history,
                location
              )}
              disabled={isOutOfStock}
            >
              {isBooking ? (
                <FormattedMessage id="OrderPanel.ctaButtonMessageBooking" />
              ) : isOutOfStock ? (
                <FormattedMessage id="OrderPanel.ctaButtonMessageNoStock" />
              ) : isPurchase ? (
                <FormattedMessage id="OrderPanel.ctaButtonMessagePurchase" />
              ) : (
                <FormattedMessage id="OrderPanel.ctaButtonMessageInquiry" />
              )}
            </PrimaryButton>
          )} */}
          <Button type='button' onClick={() => setIsInquiryModalOpen(true)}>Inquiry Now</Button>
        </div>
      )}
      <Modal
        id="ListingPage.inquiry"
        contentClassName={css.inquiryModalContent}
        isOpen={isInquiryModalOpen}
        onClose={() => {
          setIsInquiryModalOpen(false);
        }}
        usePortal
        onManageDisableScrolling={onManageDisableScrolling}
      >
        <InquiryForm
          className={css.inquiryForm}
          submitButtonWrapperClassName={css.inquirySubmitButtonWrapper}
          listingTitle={title}
          authorDisplayName={authorDisplayName}
          sendInquiryError={sendInquiryError}
          onSubmit={onSubmitInquiry}
          inProgress={sendInquiryInProgress}
        />
      </Modal>
    </div>
  );
};

export default OrderPanel;
