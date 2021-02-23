/* eslint-disable import/prefer-default-export */
import React from 'react';

import Skeleton from '@material-ui/lab/Skeleton';

import Theme from 'portal-core-components/lib/components/Theme';

// eslint-disable-next-line max-len
export const getSkeleton = (height = 10, width = 100, marginBottom = 0, widthIsPercent = true, variant = 'text') => {
  let widthValue = width || 100;
  if (Array.isArray(width) && width.length === 2) {
    widthValue = Math.round(width[0] + (Math.random() * (width[1] - width[0])));
  }
  const widthProp = widthIsPercent ? `${widthValue}%` : widthValue;
  const props = { height, width: widthProp, variant: 'rect' };
  if (marginBottom) { props.style = { marginBottom }; }
  return (
    <Skeleton
      variant={variant}
      height={height}
      width={widthProp}
      style={!marginBottom ? null : { marginBottom: Theme.spacing(marginBottom) }}
    />
  );
};
