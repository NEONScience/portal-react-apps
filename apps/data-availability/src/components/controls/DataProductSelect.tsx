import React, { useEffect, useCallback, useMemo } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { useDispatch, useSelector, batch } from 'react-redux';

import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import Skeleton from '@material-ui/lab/Skeleton';
import {
  makeStyles,
  createStyles,
  Theme as MuiTheme,
} from '@material-ui/core/styles';

import InfoCard from 'portal-core-components/lib/components/Card/InfoCard';
import NeonEnvironment from 'portal-core-components/lib/components/NeonEnvironment/NeonEnvironment';
import Theme from 'portal-core-components/lib/components/Theme/Theme';
import { AsyncStateType } from 'portal-core-components/lib/types/asyncFlow';
import { exists, existsNonEmpty, isStringNonEmpty } from 'portal-core-components/lib/util/typeUtil';

import AppStateSelector from '../../selectors/app';
import AppFlow from '../../actions/flows/app';
import { DataProduct } from '../../types/store';
import { StylesHook } from '../../types/styles';
import { AppActionCreator } from '../../actions/app';
import { DataProductSelectOption, DataProductSelectState } from '../states/AppStates';

const useStyles: StylesHook = makeStyles((muiTheme: MuiTheme) =>
  // eslint-disable-next-line implicit-arrow-linebreak
  createStyles({
    section: {
      marginBottom: muiTheme.spacing(4),
    },
    sectionTitle: {
      fontWeight: 500,
      marginBottom: muiTheme.spacing(2),
    },
    sectionSubtitle: {
      marginBottom: muiTheme.spacing(2),
    },
    infoCallout: {
      marginTop: muiTheme.spacing(3),
    },
    skeleton: {
      marginBottom: '16px',
    },
  })) as StylesHook;

const useDataProductSelectSelector = (): DataProductSelectState => useSelector(
  AppStateSelector.dataProductSelect,
);

const DataProductSelect: React.FC = (): JSX.Element => {
  const state: DataProductSelectState = useDataProductSelectSelector();
  const classes: Record<string, string> = useStyles(Theme);
  const dispatch: Dispatch<AnyAction> = useDispatch();
  const {
    productsFetchState,
    products,
    selectedProduct,
    selectedRelease,
  }: DataProductSelectState = state;

  const isLoading = (productsFetchState === AsyncStateType.WORKING);
  const isComplete = (productsFetchState === AsyncStateType.FULLFILLED);
  const hasProduct: boolean = exists(selectedProduct);
  const initialProduct: DataProduct = !hasProduct
    ? products.find((value: DataProduct): boolean => (
      existsNonEmpty(value.siteCodes)
    )) as DataProduct
    : selectedProduct as DataProduct;

  const handleChangeCb = useCallback(
    (productCb: DataProduct, releaseCb?: string) => (
      batch(() => {
        dispatch(AppActionCreator.setSelectedProduct(productCb));
        dispatch(AppFlow.fetchFocalProduct.asyncAction({
          productCode: productCb.productCode,
          release: releaseCb,
        }));
      })
    ),
    [dispatch],
  );

  useEffect(
    () => {
      if (!hasProduct && isComplete) {
        handleChangeCb(initialProduct, selectedRelease?.release);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch, isComplete],
  );

  const renderDataProductSelect = (): JSX.Element => {
    if ((products.length <= 0) || isLoading) {
      return <Skeleton variant="rect" width="100%" height={90} className={classes.skeleton} />;
    }
    return (
      <Select
        fullWidth
        variant="outlined"
        value={initialProduct.productCode}
        onChange={(event: React.ChangeEvent<{ value: unknown }>): void => {
          const nextProduct: DataProduct = !isStringNonEmpty(event.target.value)
            ? products.find((value: DataProduct): boolean => true) as DataProduct
            : products.find((value: DataProduct): boolean => (
              value.productCode === event.target.value
            )) as DataProduct;
          handleChangeCb(nextProduct, selectedRelease?.release);
        }}
      >
        {products.map((value: DataProductSelectOption): JSX.Element => ((
          <MenuItem
            key={value.productCode}
            value={value.productCode}
            disabled={!value.hasData}
          >
            <ListItemText primary={value.productName} secondary={value.productCode} />
          </MenuItem>
        )))}
      </Select>
    );
  };

  const renderCallout = (): JSX.Element => {
    if ((products.length <= 0) || isLoading) {
      return <Skeleton variant="rect" width="100%" height={90} className={classes.skeleton} />;
    }
    return (
      <InfoCard
        titleContent={(
          <Typography variant="subtitle2" component="div">
            Learn more or download data for this product by viewing product details:&nbsp;
            <Link
              target="_blank"
              rel="noreferrer noopener"
              href={`${NeonEnvironment.getHost() || ''}/data-products/${initialProduct.productCode}`}
            >
              {initialProduct.productName}
            </Link>
          </Typography>
        )}
      />
    );
  };

  return (
    <div id="data-product-select" className={classes.section}>
      <FormControl fullWidth>
        <Typography variant="h5" component="h3" className={classes.sectionTitle}>
          Data Product
        </Typography>
        <Typography variant="subtitle1" className={classes.sectionSubtitle}>
          Choose a data product to view availability
        </Typography>
        {renderDataProductSelect()}
      </FormControl>
      <div className={classes.infoCallout}>
        {renderCallout()}
      </div>
    </div>
  );
};

const DataProductSelectMemo = (): JSX.Element => (
  useMemo(
    () => (<DataProductSelect />),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [useDataProductSelectSelector()],
  )
);

export default DataProductSelectMemo;
