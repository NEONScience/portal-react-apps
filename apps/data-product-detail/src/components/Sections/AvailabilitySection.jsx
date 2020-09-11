import React, { useMemo, useContext } from 'react';
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
import NeonEnvironment from 'portal-core-components/lib/components/NeonEnvironment';
import Theme from 'portal-core-components/lib/components/Theme';

import { StoreContext } from '../../Store';
import Section from './Section';

const useStyles = makeStyles(theme => ({
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
  const { state } = useContext(StoreContext);
  const [{
    productData,
    fromManifest,
    fromAOPManifest,
    fromExternalHost,
    requiredSteps,
  }] = DownloadDataContext.useDownloadDataState();

  const { bundleParent, bundleForwardAvailabilityFromParent } = state;

  const dataAvailable = Object.keys(productData).length && (productData.siteCodes || []).length;

  const computeAvailableDateRange = () => (productData.siteCodes || []).reduce((acc, siteCode) => {
    const first = siteCode.availableMonths[0];
    const last = siteCode.availableMonths[siteCode.availableMonths.length - 1];
    if (acc[0] === null || acc[0] > first) { acc[0] = first; }
    if (acc[1] === null || acc[1] < last) { acc[1] = last; }
    return acc;
  }, [null, null]);

  const availableSites = (productData.siteCodes || []).length;
  const availableSiteCodes = (productData.siteCodes || []).map(site => site.siteCode);
  const availableDates = useMemo(computeAvailableDateRange, [productData.siteCodes]);
  const availableDatesFormatted = availableDates
    .map(month => moment(`${month}-02`).format('MMMM YYYY'));

  const isBundleChild = bundleParent !== null;
  const bundleParentLink = isBundleChild ? (
    <Link
      href={`${NeonEnvironment.getHost()}/data-products/${state.bundleParent.productCode}`}
      target="_blank"
    >
      {`${state.bundleParent.productName} (${state.bundleParent.productCode})`}
    </Link>
  ) : null;

  // Bundle children that don't forward availability: no donwload button, just link to parent
  if (isBundleChild && !bundleForwardAvailabilityFromParent) {
    return (
      <Section {...props}>
        <SnackbarContent
          className={classes.infoSnackbar}
          message={(
            <div className={classes.startFlex} style={{ width: '100%' }}>
              <BundleIcon fontSize="large" className={classes.infoSnackbarIcon} />
              <div style={{ flexGrow: 1 }}>
                <Typography variant="subtitle2">
                  {/* eslint-disable react/jsx-one-expression-per-line */}
                  This data product is bundled into {bundleParentLink}
                  {/* eslint-enable react/jsx-one-expression-per-line */}
                </Typography>
                <Typography variant="body2">
                  It is not available as a standalone download. Data availability information
                  and product download is only available through the parent product.
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
            <Typography variant="subtitle2">
              {/* eslint-disable react/jsx-one-expression-per-line */}
              This data product is bundled into {bundleParentLink}
              {/* eslint-enable react/jsx-one-expression-per-line */}
            </Typography>
            <Typography variant="body2">
              It is not available as a standalone download. Data availability shown
              below reflects availability of the entire bundle.
            </Typography>
          </div>
        </div>
      )}
    />
  ) : null;

  return (
    <Section {...props}>
      {!fromManifest && !fromAOPManifest && fromExternalHost ? (
        <React.Fragment>
          {!dataAvailable ? null : (
            <div style={{ marginBottom: Theme.spacing(4) }}>
              <DataProductAvailability view="ungrouped" disableSelection />
            </div>
          )}
          <DownloadStepForm stepKey={requiredSteps[0].key} />
        </React.Fragment>
      ) : (
        <React.Fragment>
          {dataAvailable ? (
            <React.Fragment>
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
            </React.Fragment>
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
        </React.Fragment>
      )}
    </Section>
  );
};

export default AvailabilitySection;
