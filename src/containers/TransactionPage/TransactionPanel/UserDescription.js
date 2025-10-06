import React from 'react';
import { formatMoney } from '../../../util/currency';
import { FormattedMessage, useIntl } from 'react-intl';
import css from './TransactionPanel.module.css';
import { NamedLink } from '../../../components';
import { createSlug } from '../../../util/urlHelpers';

const formatMoneyIfSupportedCurrency = (price, intl) => {
    try {
        return formatMoney(intl, price);
    } catch (e) {
        return `(${price.currency})`;
    }
};

const UserDescription = props => {
    const { listing, protectedData } = props;
    const { title, price, description } = listing?.attributes || {};
    const intl = useIntl();
    const { unitType } = listing?.attributes?.publicData || {};
    const { inquiryEmail, inquiryQuantity, inquiryTimeline ,inquiryMessage} = protectedData || {};

    const priceValue = (
        <span className={css.udPriceValue}>{formatMoneyIfSupportedCurrency(price, intl)}</span>
    );
    const pricePerUnit = (
        <span className={css.udPerUnit}>
            <FormattedMessage id="OrderPanel.perUnit" values={{ unitType }} />
        </span>
    );

    const timelineLabel = (() => {
        if (!inquiryTimeline && inquiryTimeline !== 0) return '';
        const n = Number(inquiryTimeline);
        if (Number.isNaN(n)) return `${inquiryTimeline}`;
        return `${n} ${n === 1 ? 'week' : 'weeks'}`;
    })();

    return (
        <div className={css.udCard}>
            <div className={css.udHeader}>

                <p className={css.udTitle}>
                    <NamedLink
                        name="ListingPage"
                        params={{ id: listing.id?.uuid, slug: createSlug(title) }}
                    >
                        {title}
                    </NamedLink></p>
                <div className={css.udPriceRow}>
                    {priceValue}
                    {pricePerUnit}
                </div>
            </div>

            <div className={css.udInfoGrid}>
                <div className={css.udInfoItem}>
                    <p className={css.udInfoLabel}>Email</p>
                    <p className={css.udInfoValue}>{inquiryEmail || '-'}</p>
                </div>
                <div className={css.udInfoItem}>
                    <p className={css.udInfoLabel}>Quantity</p>
                    <p className={css.udInfoValue}>{inquiryQuantity || '-'}</p>
                </div>
                <div className={css.udInfoItem}>
                    <p className={css.udInfoLabel}>Timeline</p>
                    <p className={css.udInfoValue}>{timelineLabel || '-'}</p>
                </div>
            </div>

            <div className={css.udDesc}>
                <p className={css.udDescHeading}>Description</p>
                <p className={css.udDescText}>{inquiryMessage}</p>
            </div>
        </div>
    );
};

export default UserDescription;
