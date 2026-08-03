import React from 'react';

import Link from '@mui/material/Link';
import { useTheme } from '@mui/material/styles';

import DataThemeIcon from 'portal-core-components/lib/components/DataThemeIcon';

import RouteService from 'portal-core-components/lib/service/RouteService';

import DataProductContext from '../DataProductContext';
import Detail from './Detail';

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
  const muiTheme = useTheme();

  const { themes } = product;

  const renderTheme = (theme) => (
    <Link
      key={theme}
      title={theme}
      style={{ marginRight: muiTheme.spacing(1) }}
      href={RouteService.getThemeDetailPath(dataThemeHrefs[theme])}
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
