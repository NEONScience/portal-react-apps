import React from 'react';
import moment from 'moment';

import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Divider from '@material-ui/core/Divider';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';

import DataProductAvailability from 'portal-core-components/lib/components/DataProductAvailability';
import DownloadDataButton from 'portal-core-components/lib/components/DownloadDataButton';
import DownloadDataContext from 'portal-core-components/lib/components/DownloadDataContext';
import DownloadStepForm from 'portal-core-components/lib/components/DownloadStepForm';
import ExternalHostInfo from 'portal-core-components/lib/components/ExternalHostInfo';
import Theme from 'portal-core-components/lib/components/Theme';

import RouteService from 'portal-core-components/lib/service/RouteService';
import { exists, isStringNonEmpty } from 'portal-core-components/lib/util/typeUtil';

import DataProductContext from '../DataProductContext';
import Section from './Section';
import SkeletonSection from './SkeletonSection';
import TombstoneNotice from '../Release/TombstoneNotice';

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
  card: {
    marginBottom: theme.spacing(4),
    backgroundColor: theme.colors.GOLD[50],
    borderColor: theme.colors.GOLD[300],
  },
  cardContent: {
    padding: theme.spacing(2),
    paddingBottom: `${theme.spacing(2)}px !important`,
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
      release: currentRelease,
      bundle: {
        doiProductCode,
        parentCodes,
        forwardAvailabilityFromParent,
      },
    },
    data: {
      productReleaseDois,
      bundleParents,
      tombstoneAvailability,
    },
  } = state;

  if (!exists(productData)) {
    return <SkeletonSection {...props} />;
  }

  const isBundleChild = (parentCodes.length > 0)
    && (isStringNonEmpty(doiProductCode) || Array.isArray(doiProductCode));
  const isTombstoned = DataProductContext.determineTombstoned(productReleaseDois, currentRelease);
  const appliedTombstoneAvailability = (isTombstoned && exists(tombstoneAvailability))
    ? tombstoneAvailability[currentRelease]
    : {};

  const dataAvailable = (Object.keys(productData).length
    && ((productData.siteCodes || []).length > 0));
  const tombstoneDataAvailable = (isTombstoned
    && exists(appliedTombstoneAvailability)
    && ((appliedTombstoneAvailability.siteCodes || []).length > 0));

  let availabilityAppliedSiteCodes = [];
  if (dataAvailable) {
    availabilityAppliedSiteCodes = productData.siteCodes;
  } else if (tombstoneDataAvailable) {
    availabilityAppliedSiteCodes = appliedTombstoneAvailability.siteCodes;
  }

  const computeAvailableDateRange = () => availabilityAppliedSiteCodes.reduce((acc, siteCode) => {
    const first = siteCode.availableMonths[0];
    const last = siteCode.availableMonths[siteCode.availableMonths.length - 1];
    if (acc[0] === null || acc[0] > first) { acc[0] = first; }
    if (acc[1] === null || acc[1] < last) { acc[1] = last; }
    return acc;
  }, [null, null]);

  const availableSites = availabilityAppliedSiteCodes.length;
  const availableSiteCodes = availabilityAppliedSiteCodes.map((site) => site.siteCode);
  const availableDates = computeAvailableDateRange();
  let availableDatesFormatted = ['n/a', 'n/a'];
  if (dataAvailable || tombstoneDataAvailable) {
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
        <Card className={classes.card}>
          <CardContent className={classes.cardContent}>
            {bundleParentLink}
            <Typography variant="body2">
              {/* eslint-disable react/jsx-one-expression-per-line */}
              It is not available as a standalone download.
              Data availability information and data product download is only available through
              the parent {Object.keys(bundleParents).length > 1 ? 'products' : 'product'}.
              {/* eslint-enable react/jsx-one-expression-per-line */}
            </Typography>
          </CardContent>
        </Card>
      </Section>
    );
  }

  const bundleInfo = isBundleChild ? (
    <Card className={classes.card}>
      <CardContent className={classes.cardContent}>
        {bundleParentLink}
        <Typography variant="body2">
          It is not available as a standalone download. Data availability shown
          below reflects availability of the entire bundle.
        </Typography>
      </CardContent>
    </Card>
  ) : null;

  const renderNoDataDisplay = () => {
    if (isTombstoned) return null;
    return (<i>No data currently availabile for this product.</i>);
  };
  const renderAvailability = () => {
    if (!dataAvailable && !tombstoneDataAvailable) {
      return renderNoDataDisplay();
    }
    let dataProductAva;
    let downloadDataButton;
    if (dataAvailable) {
      downloadDataButton = (
        <DownloadDataButton
          size="large"
          data-gtm="data-product-page.section.availability.download-data-button"
          data-gtm-product-code={productData.productCode}
          data-selenium="data-product-page.section.availability.download-data-button"
        />
      );
      dataProductAva = (<DataProductAvailability view="ungrouped" disableSelection />);
    } else if (tombstoneDataAvailable) {
      downloadDataButton = null;
      dataProductAva = (
        <DataProductAvailability
          siteCodes={availabilityAppliedSiteCodes}
          view="ungrouped"
          availabilityStatusType="tombstoned"
          disableSelection
        />
      );
    }
    return (
      <>
        {bundleInfo}
        <div className={classes.summaryDivStyle}>
          <div>
            <Typography variant="h6" className={classes.summaryStyle}>
              {`${availableDatesFormatted[0]} – ${availableDatesFormatted[1]}`}
            </Typography>
            <Typography variant="h6" className={classes.summaryStyle}>
              {`${availableSites} total site${availableSites === 1 ? '' : 's'}`}
            </Typography>
          </div>
          {downloadDataButton}
        </div>
        <Divider style={{ margin: Theme.spacing(3, 0) }} />
        {dataProductAva}
      </>
    );
  };

  const renderExternalHost = () => {
    if (!isStringNonEmpty(productData.productCode) || isTombstoned) return null;
    return (
      <ExternalHostInfo
        productCode={productData.productCode}
        siteCodes={availableSiteCodes}
        style={{ marginTop: Theme.spacing(4) }}
        data-selenium="data-product-page.section.availability.external-host-info"
      />
    );
  };

  const renderSection = () => {
    if (!fromManifest && !fromAOPManifest && fromExternalHost) {
      let externalAvailability = null;
      if (dataAvailable) {
        externalAvailability = (
          <div style={{ marginBottom: Theme.spacing(4) }}>
            <DataProductAvailability view="ungrouped" disableSelection />
          </div>
        );
      }
      return (
        <>
          {externalAvailability}
          <DownloadStepForm stepKey={requiredSteps[0].key} />
        </>
      );
    }
    return (
      <>
        {renderAvailability()}
        {renderExternalHost()}
      </>
    );
  };

  return (
    <Section {...props}>
      <TombstoneNotice />
      {renderSection()}
    </Section>
  );
};

export default AvailabilitySection;
