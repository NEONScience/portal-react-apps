import React, { useEffect, useCallback, useMemo } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { useDispatch, useSelector, batch } from 'react-redux';

import FormControl from '@material-ui/core/FormControl';
import ListItemText from '@material-ui/core/ListItemText';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Chip from '@material-ui/core/Chip';
import Link from '@material-ui/core/Link';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Autocomplete, {
  createFilterOptions,
  AutocompleteChangeDetails,
  AutocompleteChangeReason,
  AutocompleteRenderInputParams,
  AutocompleteRenderOptionState,
} from '@material-ui/lab/Autocomplete';
import Skeleton from '@material-ui/lab/Skeleton';
import {
  makeStyles,
  createStyles,
  Theme as MuiTheme,
} from '@material-ui/core/styles';

import SearchIcon from '@material-ui/icons/Search';

import BundleListItemIcon from 'portal-core-components/lib/components/Bundles/BundleListItemIcon';
import DataProductBundleCard from 'portal-core-components/lib/components/Bundles/DataProductBundleCard';
import Theme from 'portal-core-components/lib/components/Theme/Theme';

import BundleContentBuilder from 'portal-core-components/lib/components/Bundles/BundleContentBuilder';
import RouteService from 'portal-core-components/lib/service/RouteService';
import { AsyncStateType } from 'portal-core-components/lib/types/asyncFlow';
import { exists, existsNonEmpty } from 'portal-core-components/lib/util/typeUtil';
import { NeonTheme } from 'portal-core-components/lib/components/Theme/types';
import { IDataProductLike } from 'portal-core-components/lib/types/internal';

import AppStateSelector from '../../selectors/app';
import AppFlow from '../../actions/flows/app';
import { DataProduct, DataProductBundle, DataProductParent } from '../../types/store';
import { StylesHook } from '../../types/styles';
import { AppActionCreator } from '../../actions/app';
import { DataProductSelectOption, DataProductSelectState } from '../states/AppStates';
import { determineBundle, findBundle, findForwardParent } from '../../util/bundleUtil';
import { calcSearchSlice, SearchSlice } from '../../util/searchSlice';

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
    cardSelectedProduct: {
      marginBottom: muiTheme.spacing(2),
      border: '1px solid #d7d9d9',
    },
    cardContentSelectedProduct: {
      padding: muiTheme.spacing(2),
    },
    autocompleteInput: {
      padding: `${muiTheme.spacing(2)}px !important`,
    },
    autocompletePopupOpen: {
      transform: 'rotate(0) !important',
    },
    autocompleteLabel: {
      paddingLeft: `${muiTheme.spacing(1)}px !important`,
      paddingTop: '6px !important',
    },
    autocompleteLabelShrink: {
      transform: 'translate(6px, -9px) scale(0.75) !important',
    },
    productName: {
      fontWeight: 600,
    },
    productCodeChip: {
      color: muiTheme.palette.grey[400],
      border: `1px solid ${muiTheme.palette.grey[400]}`,
      backgroundColor: muiTheme.palette.grey[100],
      fontWeight: 600,
    },
    searchHighlight: {
      fontWeight: 700,
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
    focalBundleProduct,
  }: DataProductSelectState = state;

  const isLoading = (productsFetchState === AsyncStateType.WORKING)
    || (bundlesFetchState === AsyncStateType.WORKING);
  const isComplete = (productsFetchState === AsyncStateType.FULLFILLED)
    && (bundlesFetchState === AsyncStateType.FULLFILLED);
  const hasProduct: boolean = exists(selectedProduct);
  products.sort((a: DataProduct, b: DataProduct): number => (
    a.productName.localeCompare(b.productName)
  ));
  const initialProduct: DataProduct = !hasProduct
    ? products.find((value: DataProduct): boolean => existsNonEmpty(value.siteCodes)) as DataProduct
    : selectedProduct as DataProduct;
  const releaseBundles: DataProductBundle[] = determineBundle(bundles, selectedRelease?.release);

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
        if (AppFlow.fetchFocalProductReleaseDoi.asyncResetAction) {
          dispatch(AppFlow.fetchFocalProductReleaseDoi.asyncResetAction());
          dispatch(AppActionCreator.resetFocalProductReleaseDoi());
        }
        if (AppFlow.fetchFocalProductReleaseTombAva.asyncResetAction) {
          dispatch(AppFlow.fetchFocalProductReleaseTombAva.asyncResetAction());
          dispatch(AppActionCreator.resetFocalProductReleaseTombAva());
        }
      })
    ),
    [dispatch],
  );

  useEffect(
    () => {
      if (!hasProduct && isComplete) {
        let parentBundle: DataProductParent|undefined;
        const bundle: DataProductBundle|undefined = findBundle(
          releaseBundles,
          initialProduct.productCode,
        );
        if (bundle) {
          parentBundle = findForwardParent(bundle);
        }
        handleChangeCb(initialProduct, parentBundle, selectedRelease?.release);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch, isComplete],
  );

  const getOptionsDisabled = (value: DataProductSelectOption): boolean => {
    const bundle: DataProductBundle|undefined = findBundle(releaseBundles, value.productCode);
    let disabled = !value.hasData;
    if (bundle) {
      const parent: DataProductParent|undefined = findForwardParent(bundle);
      disabled = !parent || !parent.forwardAvailability;
    }
    return disabled;
  };
  const getProductSecondaryMessage = (
    value: DataProduct,
    paramBundle?: DataProductBundle,
  ): [string, boolean] => {
    const bundle: DataProductBundle|undefined = paramBundle
      || findBundle(releaseBundles, value.productCode);
    let hasManyParents = false;
    let bundleMessage = '';
    if (bundle) {
      const parent: DataProductParent|undefined = findForwardParent(bundle);
      if (parent) {
        bundleMessage = `This data product (${value.productCode}) is
          bundled into ${parent.parentProductCode}`;
      } else {
        const parentCodes = bundle.parentProducts
          .map((mapParent: DataProductParent): string => mapParent.parentProductCode);
        if (parentCodes.length <= 0) {
          bundleMessage = `This data product (${value.productCode}) is bundled.`;
        } else {
          let parentCodeMessage;
          if (parentCodes.length > 1) {
            hasManyParents = true;
            parentCodeMessage = parentCodes.join(', ');
          } else {
            parentCodeMessage = parentCodes[0];
          }
          bundleMessage = `This data product (${value.productCode}) is
            bundled into ${parentCodeMessage}`;
          bundleMessage = `${bundleMessage}. See ${parentCodeMessage} for availability.`;
        }
      }
    }
    return [!bundle ? value.productCode : bundleMessage, hasManyParents];
  };
  const renderOption = (
    value: DataProductSelectOption,
    renderOptionState: AutocompleteRenderOptionState,
  ): JSX.Element => {
    const bundle: DataProductBundle|undefined = findBundle(releaseBundles, value.productCode);
    const [secondaryMessage, hasManyParents]: [string, boolean] = getProductSecondaryMessage(
      value as DataProduct,
      bundle,
    );
    const nameSlice: SearchSlice[] = calcSearchSlice(
      value.productName,
      renderOptionState.inputValue,
    );
    const secondarySlice: SearchSlice[] = calcSearchSlice(
      secondaryMessage,
      renderOptionState.inputValue,
    );
    const renderSlices = (slices: SearchSlice[]): JSX.Element[] => ((
      slices.map((slice: SearchSlice, idx: number): JSX.Element => ((
        // eslint-disable-next-line react/no-array-index-key
        <span key={`key-${idx}`} className={slice.found ? classes.searchHighlight : undefined}>
          {slice.text}
        </span>
      )))
    ));
    return (
      <div key={value.productCode} style={{ display: 'flex', alignItems: 'center' }}>
        {!bundle ? <React.Fragment /> : <BundleListItemIcon isSplit={hasManyParents} />}
        <ListItemText
          className={classes.listItemTextProduct}
          primary={(<div>{renderSlices(nameSlice)}</div>)}
          secondary={(<>{renderSlices(secondarySlice)}</>)}
        />
      </div>
    );
  };

  const renderDataProductSelect = (): JSX.Element => {
    if ((products.length <= 0) || isLoading) {
      return (
        <Skeleton variant="rect" width="100%" height={90} className={classes.skeleton} />
      );
    }
    return (
      <Autocomplete
        fullWidth
        openOnFocus
        blurOnSelect
        id="select-data-products"
        options={products}
        value={{ ...initialProduct, hasData: true }}
        popupIcon={(<SearchIcon />)}
        classes={{
          input: classes.autocompleteInput,
          popupIndicatorOpen: classes.autocompletePopupOpen,
        }}
        groupBy={(option: DataProductSelectOption): string => option.productScienceTeam}
        getOptionSelected={(
          option: DataProductSelectOption,
          value: DataProductSelectOption,
        ): boolean => (option.productCode.localeCompare(value.productCode) === 0)}
        getOptionDisabled={(option: DataProductSelectOption): boolean => (
          getOptionsDisabled(option)
        )}
        getOptionLabel={(option: DataProductSelectOption): string => ''}
        filterOptions={createFilterOptions({
          trim: true,
          stringify: (option: DataProductSelectOption): string => {
            const bundle: DataProductBundle|undefined = findBundle(
              releaseBundles,
              option.productCode,
            );
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const [secondaryMessage]: string = getProductSecondaryMessage(
              option as DataProduct,
              bundle,
            );
            return `${option.productName} ${secondaryMessage as string} ${option.productScienceTeam}`;
          },
        })}
        renderOption={(
          value: DataProductSelectOption,
          renderOptionState: AutocompleteRenderOptionState,
        ): JSX.Element => renderOption(value, renderOptionState)}
        renderInput={(params: AutocompleteRenderInputParams): React.ReactNode => (
          <TextField
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...params}
            variant="outlined"
            label="Search Data Products"
            InputLabelProps={{
              ...params.InputLabelProps,
              className: classes.autocompleteLabel,
              classes: {
                shrink: classes.autocompleteLabelShrink,
              },
            }}
          />
        )}
        onChange={(
          event: React.ChangeEvent<unknown>,
          nextValue: DataProductSelectOption | null,
          reason: AutocompleteChangeReason,
          details?: AutocompleteChangeDetails<DataProductSelectOption>,
        ): void => {
          if (!exists(nextValue)) return;
          const nextProduct: DataProduct = !exists(nextValue)
            ? products.find((value: DataProduct): boolean => true) as DataProduct
            : products.find((value: DataProduct): boolean => {
              const coerced = (nextValue as DataProduct);
              return value.productCode.localeCompare(coerced.productCode) === 0;
            }) as DataProduct;
          let parentBundle: DataProductParent|undefined;
          const bundle: DataProductBundle|undefined = findBundle(
            releaseBundles,
            nextProduct.productCode,
          );
          if (bundle) {
            parentBundle = findForwardParent(bundle);
          }
          handleChangeCb(nextProduct, parentBundle, selectedRelease?.release);
        }}
      />
    );
  };

  const renderBundle = (): JSX.Element => {
    if ((products.length <= 0) || isLoading || !initialProduct) {
      return (<React.Fragment />);
    }
    const bundle = findBundle(releaseBundles, initialProduct.productCode);
    if (!bundle) {
      return (<React.Fragment />);
    }
    const parent: DataProductParent|undefined = findForwardParent(bundle);
    if (!parent || !parent.forwardAvailability) {
      return (<React.Fragment />);
    }
    let focalProductName = '';
    if (exists(focalBundleProduct)
        && (parent.parentProductCode === (focalBundleProduct as DataProduct).productCode)) {
      focalProductName = (focalBundleProduct as DataProduct).productName || '';
    }
    const dataProductLike: IDataProductLike = {
      productCode: parent.parentProductCode,
      productName: focalProductName,
    };
    const titleContent = BundleContentBuilder.buildDefaultTitleContent(
      dataProductLike,
      selectedRelease?.release,
    );
    const subTitleContent = BundleContentBuilder.buildDefaultSubTitleContent(true, false);
    return (
      <div style={{ marginTop: Theme.spacing(3) }}>
        <DataProductBundleCard
          isSplit={false}
          titleContent={titleContent}
          subTitleContent={subTitleContent}
        />
      </div>
    );
  };

  const renderSelectedProduct = (): JSX.Element => {
    if ((products.length <= 0) || isLoading || !initialProduct) {
      return (
        <Skeleton variant="rect" width="100%" height={90} className={classes.skeleton} />
      );
    }
    return (
      <Card className={classes.cardSelectedProduct}>
        <CardContent className={classes.cardContentSelectedProduct}>
          <div>
            <Typography variant="h6" className={classes.productName}>
              <Link
                target="_blank"
                rel="noreferrer noopener"
                href={RouteService.getProductDetailPath(initialProduct.productCode)}
              >
                {initialProduct.productName}
              </Link>
            </Typography>
            <div style={{ margin: Theme.spacing(1.5, 0) }}>
              <Chip
                size="small"
                label={initialProduct.productCode}
                className={classes.productCodeChip}
              />
            </div>
            <Typography variant="body2" style={{ marginTop: Theme.spacing(1) }}>
              {initialProduct.productDescription}
            </Typography>
          </div>
          {renderBundle()}
        </CardContent>
      </Card>
    );
  };

  return (
    <div id="data-product-select" className={classes.section}>
      <FormControl fullWidth>
        <Typography variant="h5" component="h3" className={classes.sectionTitle}>
          Data Product
        </Typography>
        {renderDataProductSelect()}
      </FormControl>
      <div className={classes.infoCallout}>
        {renderSelectedProduct()}
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
