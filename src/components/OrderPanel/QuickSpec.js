// QuickSpecs.js
import React from 'react';
import css from './OrderPanel.module.css';
import IconCard from '../SavedCardDetails/IconCard/IconCard';

const QuickSpecs = ({ publicData }) => {
  if (!publicData) return null;

  const {
    minMOQ,
    maxMOQ,
    minLeadTime,
    maxLeadTime,
    maxWidth,
    colors,
  } = publicData;

  return (
    <div className={css.quickSpecs}>
      <h3 className={css.quickSpecsTitle}>
        <IconCard brand="clock" />
        Quick Specs
      </h3>
      <ul className={css.quickSpecsList}>
        {(minMOQ || maxMOQ) && (
          <li>
            <div className={css.headingBold}>MOQ Range:</div> 
            <div className={css.normalText}>{minMOQ} – {maxMOQ}+ units</div>
          </li>
        )}
        {(minLeadTime || maxLeadTime) && (
          <li>
            <div className={css.headingBold}>Lead Time:</div> 
            <div className={css.normalText}>{minLeadTime} – {maxLeadTime} weeks</div>
          </li>
        )}
        {maxWidth && (
          <li>
            <div className={css.headingBold}>Max Width:</div> 
            <div className={css.normalText}>{maxWidth} inches</div>
          </li>
        )}
        {colors && (
          <li>
            <div className={css.headingBold}>Print Colors:</div> 
            <div className={css.normalText}>Up to {colors} colors</div>
          </li>
        )}
      </ul>
    </div>
  );
};

export default QuickSpecs;
