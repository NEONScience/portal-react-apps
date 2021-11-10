import React, { useMemo } from 'react';
import moment from 'moment';

import { makeStyles } from '@material-ui/core/styles';
import Divider from '@material-ui/core/Divider';
import Link from '@material-ui/core/Link';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import Typography from '@material-ui/core/Typography';

import BundleIcon from '@material-ui/icons/Archive';

import DataProductAvailability from 'portal-core-components/lib/components/DataProductAvailability';
import DownloadDataButton from 'portal-core-components/lib/components/DownloadDataButton';
import DownloadDataContext from 'portal-core-components/lib/components/DownloadDataContext';
import DownloadStepForm from 'portal-core-components/lib/components/DownloadStepForm';
import ExternalHostInfo from 'portal-core-components/lib/components/ExternalHostInfo';
import Theme from 'portal-core-components/lib/components/Theme';

import RouteService from 'portal-core-components/lib/service/RouteService';
import { isStringNonEmpty } from 'portal-core-components/lib/util/typeUtil';

import DataProductContext from '../DataProductContext';
import Section from './Section';
import SkeletonSection from './SkeletonSection';

const useStyles = makeStyles((theme) => ({
  summaryDivStyle: {
    width: '100%',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  summaryStyle: {
    color: theme.palette.grey[300],
    lineHeight: '1em',
    marginBottom: theme.spacing(1),
  },
  startFlex: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  infoSnackbar: {
    backgroundColor: theme.palette.grey[50],
    color: '#000',
    border: `1px solid ${theme.palette.primary.main}80`,
    margin: theme.spacing(0, 0, 4, 0),
    padding: theme.spacing(0.5, 2),
    '& div': {
      width: '100%',
    },
  },
  infoSnackbarIcon: {
    color: theme.palette.grey[300],
    marginRight: theme.spacing(2),
  },
}));

const AvailabilitySection = (props) => {
  const classes = useStyles(Theme);

  const [state] = DataProductContext.useDataProductContextState();

  const [{
    productData,
    fromManifest,
    fromAOPManifest,
    fromExternalHost,
    requiredSteps,
  }] = DownloadDataContext.useDownloadDataState();

  const {
    route: {
      bundle: {
        doiProductCode,
        parentCodes,
        forwardAvailabilityFromParent,
      },
    },
    data: {
      bundleParents,
    },
  } = state;
  const isBundleChild = (parentCodes.length > 0) && isStringNonEmpty(doiProductCode);

  const dataAvailable = Object.keys(productData).length && (productData.siteCodes || []).length;

  const computeAvailableDateRange = () => (productData.siteCodes || []).reduce((acc, siteCode) => {
    const first = siteCode.availableMonths[0];
    const last = siteCode.availableMonths[siteCode.availableMonths.length - 1];
    if (acc[0] === null || acc[0] > first) { acc[0] = first; }
    if (acc[1] === null || acc[1] < last) { acc[1] = last; }
    return acc;
  }, [null, null]);

  const availableSites = (productData.siteCodes || []).length;
  const availableSiteCodes = (productData.siteCodes || []).map((site) => site.siteCode);
  const availableDates = useMemo(computeAvailableDateRange, [productData.siteCodes]);
  let availableDatesFormatted = ['n/a', 'n/a'];
  if (dataAvailable) {
    availableDatesFormatted = availableDates
      .filter((month) => isStringNonEmpty(month))
      .map((month) => moment(`${month}-02`).format('MMMM YYYY'));
  }

  const getParentProductLink = (parentProductData = {}) => (
    <Link
      href={RouteService.getProductDetailPath(parentProductData.productCode)}
      target="_blank"
    >
      {`${parentProductData.productName} (${parentProductData.productCode})`}
    </Link>
  );

  let bundleParentLink = null;
  if (isBundleChild) {
    bundleParentLink = parentCodes.length === 1
      ? (
        <Typography variant="subtitle2">
          {/* eslint-disable react/jsx-one-expression-per-line */}
          This data product is bundled into {getParentProductLink(bundleParents[doiProductCode])}
          {/* eslint-enable react/jsx-one-expression-per-line */}
        </Typography>
      ) : (
        <>
          <Typography variant="subtitle2">
            This data product has been split and bundled into more than one parent data product:
          </Typography>
          <ul style={{ margin: Theme.spacing(1, 0) }}>
            {parentCodes.map((parentCode) => (
              <li key={parentCode}>
                {getParentProductLink(bundleParents[parentCode])}
              </li>
            ))}
          </ul>
        </>
      );
  }

  // Bundle children that don't forward availability: no donwload button, just link to parent
  if (isBundleChild && !forwardAvailabilityFromParent) {
    return (
      <Section {...props}>
        <SnackbarContent
          className={classes.infoSnackbar}
          message={(
            <div className={classes.startFlex} style={{ width: '100%' }}>
              <BundleIcon fontSize="large" className={classes.infoSnackbarIcon} />
              <div style={{ flexGrow: 1 }}>
                {bundleParentLink}
                <Typography variant="body2">
                  {/* eslint-disable react/jsx-one-expression-per-line */}
                  It is not available as a standalone download.
                  Data availability information and product download is only available through
                  the parent product{Object.keys(bundleParents).length > 1 ? 's' : ''}.
                  {/* eslint-enable react/jsx-one-expression-per-line */}
                </Typography>
              </div>
            </div>
          )}
        />
      </Section>
    );
  }

  const bundleInfo = isBundleChild ? (
    <SnackbarContent
      className={classes.infoSnackbar}
      message={(
        <div className={classes.startFlex} style={{ width: '100%' }}>
          <BundleIcon fontSize="large" className={classes.infoSnackbarIcon} />
          <div style={{ flexGrow: 1 }}>
            {bundleParentLink}
            <Typography variant="body2">
              It is not available as a standalone download. Data availability shown
              below reflects availability of the entire bundle.
            </Typography>
          </div>
        </div>
      )}
    />
  ) : null;

  return !productData ? <SkeletonSection {...props} /> : (
    <Section {...props}>
      {!fromManifest && !fromAOPManifest && fromExternalHost ? (
        <>
          {!dataAvailable ? null : (
            <div style={{ marginBottom: Theme.spacing(4) }}>
              <DataProductAvailability view="ungrouped" disableSelection />
            </div>
          )}
          <DownloadStepForm stepKey={requiredSteps[0].key} />
        </>
      ) : (
        <>
          {dataAvailable ? (
            <>
              <div className={classes.summaryDivStyle}>
                {bundleInfo}
                <div>
                  <Typography variant="h6" className={classes.summaryStyle}>
                    {`${availableDatesFormatted[0]} – ${availableDatesFormatted[1]}`}
                  </Typography>
                  <Typography variant="h6" className={classes.summaryStyle}>
                    {`${availableSites} total site${availableSites === 1 ? '' : 's'}`}
                  </Typography>
                </div>
                <DownloadDataButton
                  size="large"
                  data-gtm="data-product-page.section.availability.download-data-button"
                  data-gtm-product-code={productData.productCode}
                  data-selenium="data-product-page.section.availability.download-data-button"
                />
              </div>
              <Divider style={{ margin: Theme.spacing(3, 0) }} />
              <DataProductAvailability view="ungrouped" disableSelection />
            </>
          ) : (
            <i>No data currently availabile for this product.</i>
          )}
          {!productData.productCode ? null : (
            <ExternalHostInfo
              productCode={productData.productCode}
              siteCodes={availableSiteCodes}
              style={{ marginTop: Theme.spacing(4) }}
              data-selenium="data-product-page.section.availability.external-host-info"
            />
          )}
        </>
      )}
    </Section>
  );
};

export default AvailabilitySection;
