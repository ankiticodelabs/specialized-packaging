import React from 'react'
import { AvatarSmall, Button, ListingCard, NamedLink } from '../../../../../components';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import css from './FeaturedListingsSection.module.css';
import { useConfiguration } from '../../../../../context/configurationContext';
import { createSlug } from '../../../../../util/urlHelpers';

const FeaturedListingsSection = ({ options }) => {
  const history = useHistory();
  const getListings = options?.listings;
  const config = useConfiguration();

  const { listingFields } = config?.listing || {};
  // Build a map for capability option -> label using configuration listingFields
  const capabilitiesField = Array.isArray(listingFields)
    ? listingFields.find(f => f?.key === 'capabilities')
    : null;
  const capabilityLabelByOption = (capabilitiesField?.enumOptions || []).reduce((acc, curr) => {
    if (curr?.option) acc[curr.option] = curr?.label || curr?.option;
    return acc;
  }, {});

  return (
    <div >
      <div >
        <div >
          <div >
            <div >Featured Manufacturers</div>
            <p>Discover verified packaging specialists across various industries</p>
            <div >
              <NamedLink name='SearchPage'>
                View All
                {/* <BrandIconCard type="rightarrow" /> */}
              </NamedLink>
            </div>
          </div>
          <div>
            {(getListings?.filter(l => l?.attributes?.publicData?.isVerified) || []).slice(0, 6).map((item, i) => {
              return (
                <ListingCard key={item.id} listing={item} className={css.listing} />
              )
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeaturedListingsSection