import React from 'react';

import Link from '@material-ui/core/Link';

import DataThemeIcon from 'portal-core-components/lib/components/DataThemeIcon';
import Theme from 'portal-core-components/lib/components/Theme';

import DataProductContext from '../DataProductContext';
import Detail from './Detail';

// TODO: get this from a canonical location?
const dataThemeBaseUrl = 'http://www.neonscience.org/data/data-themes/';

const dataThemeHrefs = {
  Atmosphere: 'atmosphere',
  Biogeochemistry: 'biogeochemistry',
  Ecohydrology: 'ecohydrology',
  'Land Use, Land Cover, and Land Processes': 'land-cover-processes',
  'Organisms, Populations, and Communities': 'organisms-populations-communities',
};

const ThemesDetail = () => {
  const [state] = DataProductContext.useDataProductContextState();
  const product = DataProductContext.getCurrentProductFromState(state);

  const { themes } = product;

  const renderTheme = (theme) => (
    <Link
      key={theme}
      title={theme}
      style={{ marginRight: Theme.spacing(1) }}
      href={`${dataThemeBaseUrl}${dataThemeHrefs[theme]}`}
    >
      <DataThemeIcon
        theme={theme}
        size={3.75}
      />
    </Link>
  );

  return (
    <Detail title="Data Themes">
      {(themes || []).length ? themes.map(renderTheme) : <i>n/a</i>}
    </Detail>
  );
};

export default ThemesDetail;
