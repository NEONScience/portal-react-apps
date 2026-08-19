import React from 'react';

import NeonPage from '@neonscience/portal-core-components/components/NeonPage';
import RouteService from '@neonscience/portal-core-components/service/RouteService';
import { makeStyles } from '@neonscience/portal-core-components/components/Theme/makeStyles';

import InfoPresentation from '../presentations/InfoPresentation';
import ControlPresentation from '../presentations/ControlPresentation';
import ColumnManagerContainer from '../containers/ColumnManagerContainer';
import DataTableContainer from '../containers/DataTableContainer';

const useStyles = makeStyles()((theme) => ({
  pageContainer: {
    '& .MuiBreadcrumbs-root': {
      '& .MuiBreadcrumbs-li': {
        '& svg': {
          verticalAlign: 'unset',
        },
      },
    },
  },
}));

const App = () => {
  const { classes } = useStyles();
  const breadcrumbs = [
    { name: 'Data', href: RouteService.getDataSamplesDataPath() },
    { name: 'Samples & Specimens', href: RouteService.getSamplesPath() },
    { name: 'Taxonomic Lists' },
  ];
  return (
    <div className={classes.pageContainer}>
      <NeonPage
        customizeAuthContainer
        title="Taxonomic Lists"
        breadcrumbs={breadcrumbs}
        breadcrumbHomeHref={RouteService.getWebHomePath()}
      >
        <InfoPresentation />
        <ControlPresentation />
        <ColumnManagerContainer />
        <DataTableContainer />
      </NeonPage>
    </div>
  );
};

export default App;
