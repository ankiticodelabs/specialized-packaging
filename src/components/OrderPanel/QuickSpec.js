// QuickSpecs.js
import React from 'react';
import css from './OrderPanel.module.css';

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
      <h3 className={css.quickSpecsTitle}>Quick Specs</h3>
      <ul className={css.quickSpecsList}>
        {(minMOQ || maxMOQ) && (
          <li>
            <strong>MOQ Range:</strong> {minMOQ} – {maxMOQ}+ units
          </li>
        )}
        {(minLeadTime || maxLeadTime) && (
          <li>
            <strong>Lead Time:</strong> {minLeadTime} – {maxLeadTime} weeks
          </li>
        )}
        {maxWidth && (
          <li>
            <strong>Max Width:</strong> {maxWidth} inches
          </li>
        )}
        {colors && (
          <li>
            <strong>Print Colors:</strong> Up to {colors} colors
          </li>
        )}
      </ul>
    </div>
  );
};

export default QuickSpecs;
