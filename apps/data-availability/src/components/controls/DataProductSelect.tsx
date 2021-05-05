import React, { useEffect, useCallback, useMemo } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { useDispatch, useSelector, batch } from 'react-redux';

import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import Skeleton from '@material-ui/lab/Skeleton';
import {
  makeStyles,
  createStyles,
  Theme as MuiTheme,
} from '@material-ui/core/styles';

import BundleIcon from '@material-ui/icons/Archive';

import InfoCard from 'portal-core-components/lib/components/Card/InfoCard';
import NeonEnvironment from 'portal-core-components/lib/components/NeonEnvironment/NeonEnvironment';
import Theme from 'portal-core-components/lib/components/Theme/Theme';
import { AsyncStateType } from 'portal-core-components/lib/types/asyncFlow';
import { exists, existsNonEmpty, isStringNonEmpty } from 'portal-core-components/lib/util/typeUtil';
import { NeonTheme } from 'portal-core-components/lib/components/Theme/types';

import AppStateSelector from '../../selectors/app';
import AppFlow from '../../actions/flows/app';
import { DataProduct, DataProductBundle, DataProductParent } from '../../types/store';
import { StylesHook } from '../../types/styles';
import { AppActionCreator } from '../../actions/app';
import { DataProductSelectOption, DataProductSelectState } from '../states/AppStates';
import { findBundle, findForwardParent } from '../../util/bundleUtil';

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
    callout: {
      margin: muiTheme.spacing(0.5, 0, 3, 0),
      backgroundColor: '#ffffff',
      borderColor: '#d7d9d9',
    },
    calloutIcon: {
      color: (Theme as NeonTheme).colors.LIGHT_BLUE[300],
      marginRight: muiTheme.spacing(2),
    },
    listItemTextProduct: {
      display: 'inline-block',
      whiteSpace: 'normal',
    },
    card: {
      marginBottom: muiTheme.spacing(2),
      backgroundColor: (Theme as NeonTheme).colors.GOLD[50],
      borderColor: (Theme as NeonTheme).colors.GOLD[300],
    },
    cardContent: {
      display: 'flex',
      alignItems: 'center',
      padding: '16px !important',
    },
    cardIcon: {
      color: (Theme as NeonTheme).colors.GOLD[700],
      marginRight: muiTheme.spacing(2),
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
    bundlesFetchState,
    bundles,
    productsFetchState,
    products,
    selectedProduct,
    selectedRelease,
  }: DataProductSelectState = state;

  const isLoading = (productsFetchState === AsyncStateType.WORKING)
    || (bundlesFetchState === AsyncStateType.WORKING);
  const isComplete = (productsFetchState === AsyncStateType.FULLFILLED)
    && (bundlesFetchState === AsyncStateType.FULLFILLED);
  const hasProduct: boolean = exists(selectedProduct);
  const initialProduct: DataProduct = !hasProduct
    ? products.find((value: DataProduct): boolean => (
      existsNonEmpty(value.siteCodes)
    )) as DataProduct
    : selectedProduct as DataProduct;

  const handleChangeCb = useCallback(
    (productCb: DataProduct, parentCb?: DataProductParent, releaseCb?: string) => (
      batch(() => {
        dispatch(AppActionCreator.setSelectedProduct(productCb));
        dispatch(AppFlow.fetchFocalProduct.asyncAction({
          productCodes: parentCb
            ? [productCb.productCode, parentCb.parentProductCode]
            : [productCb.productCode],
          release: releaseCb,
        }));
      })
    ),
    [dispatch],
  );

  useEffect(
    () => {
      if (!hasProduct && isComplete) {
        let parentBundle: DataProductParent|undefined;
        const bundle: DataProductBundle|undefined = findBundle(bundles, initialProduct.productCode);
        if (bundle) {
          parentBundle = findForwardParent(bundle);
        }
        handleChangeCb(initialProduct, parentBundle, selectedRelease?.release);
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
          let parentBundle: DataProductParent|undefined;
          const bundle: DataProductBundle|undefined = findBundle(bundles, nextProduct.productCode);
          if (bundle) {
            parentBundle = findForwardParent(bundle);
          }
          handleChangeCb(nextProduct, parentBundle, selectedRelease?.release);
        }}
      >
        {products.map((value: DataProductSelectOption): JSX.Element => {
          const bundle: DataProductBundle|undefined = findBundle(bundles, value.productCode);
          let disabled = !value.hasData;
          let bundleMessage: string|undefined;
          if (bundle) {
            const parent: DataProductParent|undefined = findForwardParent(bundle);
            disabled = !parent || !parent.forwardAvailability;
            if (parent) {
              bundleMessage = `This data product (${value.productCode}) is
                bundled into ${parent.parentProductCode}`;
            } else {
              const parentCodes = bundle.parentProducts
                .map((mapParent: DataProductParent): string => mapParent.parentProductCode);
              if (parentCodes.length <= 0) {
                bundleMessage = `This data product (${value.productCode}) is bundled.`;
              } else {
                const parentCodeMessage = `${parentCodes.length > 1
                  ? parentCodes.join(', ')
                  : parentCodes[0]}`;
                bundleMessage = `This data product (${value.productCode}) is
                  bundled into ${parentCodeMessage}`;
                bundleMessage = `${bundleMessage}. See ${parentCodeMessage} for availability.`;
              }
            }
          }
          return (
            <MenuItem
              key={value.productCode}
              value={value.productCode}
              disabled={disabled}
            >
              {!bundle ? <React.Fragment /> : (
                <ListItemIcon>
                  <BundleIcon />
                </ListItemIcon>
              )}
              <ListItemText
                className={classes.listItemTextProduct}
                primary={value.productName}
                secondary={
                  !bundle
                    ? value.productCode
                    : bundleMessage
                }
              />
            </MenuItem>
          );
        })}
      </Select>
    );
  };

  const renderBundle = (): JSX.Element => {
    if ((products.length <= 0) || isLoading || !initialProduct) {
      return (<React.Fragment />);
    }
    const bundle = findBundle(bundles, initialProduct.productCode);
    if (!bundle) {
      return (<React.Fragment />);
    }
    const parent: DataProductParent|undefined = findForwardParent(bundle);
    if (!parent || !parent.forwardAvailability) {
      return (<React.Fragment />);
    }
    return (
      <Card className={classes.card}>
        <CardContent className={classes.cardContent}>
          <BundleIcon fontSize="large" className={classes.cardIcon} />
          <div style={{ flexGrow: 1 }}>
            <Typography variant="subtitle2">
              {`This data product is bundled into ${parent.parentProductCode}`}
            </Typography>
            <Typography variant="body2">
              <>
                It is not available as a standalone download. Data availability shown
                below reflects availability of the entire bundle.
              </>
            </Typography>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderCallout = (): JSX.Element => {
    if ((products.length <= 0) || isLoading) {
      return <Skeleton variant="rect" width="100%" height={90} className={classes.skeleton} />;
    }
    return (
      <InfoCard
        classes={{
          callout: classes.callout,
          calloutIcon: classes.calloutIcon,
        }}
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
        {renderBundle()}
      </div>
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
