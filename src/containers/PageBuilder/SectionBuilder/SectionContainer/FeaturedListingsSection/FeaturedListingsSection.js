import React from 'react'
import { AvatarSmall, Button, ListingCard, NamedLink } from '../../../../../components';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import css from './FeaturedListingsSection.module.css';
import { useConfiguration } from '../../../../../context/configurationContext';
import { createSlug } from '../../../../../util/urlHelpers';
import IconCard from '../../../../../components/SavedCardDetails/IconCard/IconCard';
import Slider from 'react-slick';

function SampleNextArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{ ...style, display: "block" }}
      onClick={onClick}
    >
     &#8250;
      </div>
  );
}

function SamplePrevArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{ ...style, display: "block" }}
      onClick={onClick}
    >
    &#8249;
    </div>
  );
}

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

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    responsive: [
      {
        breakpoint: 1320,
        settings: {
          slidesToShow: 3.2,
          slidesToScroll: 1,
          centerMode: true,
        }
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2.5,
          slidesToScroll: 1,
          initialSlide: 1,
          centerMode: true,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2.1,
          slidesToScroll: 1,
          initialSlide: 1,
          centerMode: true,
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1.5,
          slidesToScroll: 1,
          initialSlide: 1,
          centerMode: true,
        }
      },
      {
        breakpoint: 500,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          // initialSlide: 1,
          // centerMode: true,
        }
      }
    ]
  };

  return (
    <div className={css.featureListing}>
      <div className={css.featureHead}>
        <div>
          <div className={css.featureHeading}>Featured Manufacturers</div>
          <p className={css.featureSubHeading}>This is the only AI-fueled Specialized Packaging Marketplace. We work directly with packaging manufacturers to caputure and understand what types of specialized packaging that make better than anyone else, and why. We actively work to connect them with Decision Makers-Buyers who want what they do but don't know they exist.</p>
        </div>
        <div className={css.viewAllBtn}>
          <NamedLink name='SearchPage'>
            View All
            <IconCard brand="rightarrow" />
          </NamedLink>
        </div>
      </div>
      <div className={css.listingGrid}>
         <Slider {...settings}>
        {(getListings?.filter(l => l?.attributes?.publicData?.isVerified) || []).slice(0, 6).map((item, i) => {
          return (
            <ListingCard key={item.id} listing={item} className={css.listing} />
          )
        })}
        </Slider>
      </div>
    </div>
  );
}

export default FeaturedListingsSection