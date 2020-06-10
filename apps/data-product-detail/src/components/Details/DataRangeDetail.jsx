import React, { useContext } from 'react';
import dateFormat from 'dateformat';

import Typography from '@material-ui/core/Typography';

import Detail from './Detail';

import { StoreContext } from '../../Store';

const renderDemarc = (demarc) => {
  if (!demarc) {
    return 'n/a';
  } if (demarc === 'ongoing') {
    return 'ongoing';
  }
  return dateFormat(new Date(`${demarc}-02`), 'mmmm yyyy');
};

const DataRangeDetail = () => {
  const { state } = useContext(StoreContext);
  const target = state.bundleParent ? 'bundleParent' : 'product';
  const { siteCodes } = state[target];

  let rangeText = <i>n/a</i>;

  // Min/max data data range can only be derived from available site-months,
  // so derive it. Todo: get this back from the API directly?
  if (state.product.productStatus === 'FUTURE') {
    rangeText = <i>n/a (future data product)</i>;
  } else if (!(siteCodes || []).length) {
    rangeText = <i>n/a (no data)</i>;
  } else {
    const range = siteCodes
      .map(site => [
        site.availableMonths[0],
        site.availableMonths[site.availableMonths.length - 1],
      ])
      .reduce((acc, site) => [
        (!acc[0] || site[0] < acc[0] ? site[0] : acc[0]),
        (!acc[1] || site[1] > acc[1] ? site[1] : acc[1]),
      ], [null, null]);

    if (state.product.productStatus === 'ACTIVE') {
      range[1] = 'ongoing';
    }

    rangeText = `${renderDemarc(range[0])} - ${renderDemarc(range[1])}`;
  }

  let tooltip = 'The available date range from the earliest observation to the latest observation, across the entire observatory. Each site may have a different range.';
  if (state.bundleParent) {
    tooltip = `${tooltip} Also, as this product is part of a bundle, these dates represent availability of the entire bundle. See the Availability and Download section below for more detail.`;
  }

  return (
    <Detail title="Date Range" tooltip={tooltip}>
      <Typography variant="body2">
        {rangeText}
      </Typography>
    </Detail>
  );
};

export default DataRangeDetail;
