import React, { useEffect } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { batch, useDispatch, useSelector } from 'react-redux';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import {
  makeStyles,
  createStyles,
  Theme as MuiTheme,
} from '@material-ui/core/styles';

import NeonPage from 'portal-core-components/lib/components/NeonPage';
import Theme from 'portal-core-components/lib/components/Theme/Theme';
import { AsyncStateType } from 'portal-core-components/lib/types/asyncFlow';

import AppStateSelector from '../selectors/app';
import AppFlow from '../actions/flows/app';
import { AppComponentState } from './states/AppStates';
import { StylesHook } from '../types/styles';

const useStyles: StylesHook = makeStyles((muiTheme: MuiTheme) =>
  // eslint-disable-next-line implicit-arrow-linebreak
  createStyles({
    codeDiv: {
      overflowY: 'scroll',
      fontfamily: 'monospace',
      whiteSpace: 'pre',
      backgroundColor: '#f5f6f7',
      padding: '20px',
      height: '400px',
    },
  })) as StylesHook;

const App: React.FC = (): JSX.Element => {
  const state: AppComponentState = useSelector(AppStateSelector.app);
  const classes: Record<string, string> = useStyles(Theme);
  const dispatch: Dispatch<AnyAction> = useDispatch();
  const {
    productFetchState,
    products,
  }: AppComponentState = state;

  const isLoading = (productFetchState === AsyncStateType.WORKING);

  useEffect(
    () => {
      batch(() => {
        dispatch(AppFlow.fetchProducts.asyncAction());
      });
    },
    [dispatch],
  );

  const title = 'App Name';
  const breadcrumbs = [
    { name: 'Data & Samples', href: 'https://www.neonscience.org/data-samples/' },
    { name: 'Data Portal', href: 'https://www.neonscience.org/data-samples/data' },
    { name: title },
  ];

  return (
    <NeonPage
      title={title}
      loading={isLoading ? 'Loading...' : undefined}
      breadcrumbHomeHref="https://www.neonscience.org/"
      breadcrumbs={breadcrumbs}
    >
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography>
            Hello, NEON App!
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <div className={classes.codeDiv}>
            {JSON.stringify(products, null, 2)}
          </div>
        </Grid>
      </Grid>
    </NeonPage>
  );
};

export default App;
