import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';

import Theme from 'portal-core-components/lib/components/Theme';

import RouteService from 'portal-core-components/lib/service/RouteService';
import { exists, isStringNonEmpty } from 'portal-core-components/lib/util/typeUtil';

import DataProductContext from '../DataProductContext';

const { useDataProductContextState } = DataProductContext;

const useStyles = makeStyles((theme) => ({
  card: {
    backgroundColor: Theme.colors.BROWN[50],
    borderColor: Theme.colors.BROWN[300],
    marginBottom: theme.spacing(4),
  },
  cardHeader: {
    padding: theme.spacing(3),
    paddingBottom: 0,
  },
  cardContent: {
    paddingTop: theme.spacing(2),
  },
}));

const TombstoneNotice = () => {
  const classes = useStyles(Theme);
  const [state] = useDataProductContextState();
  const {
    route: { release: currentRelease, bundle },
    data: { productReleaseDois, bundleParents, product: baseProduct },
  } = state;
  const isTombstoned = DataProductContext.determineTombstoned(productReleaseDois, currentRelease);
  if (!isTombstoned) {
    return null;
  }
  const citationRelease = productReleaseDois[currentRelease];
  let doiDisplay = ' ';
  if (citationRelease.url) {
    const doiId = citationRelease.url.split('/').slice(-2).join('/');
    doiDisplay = ` (DOI:${doiId}) `;
  }
  let latestAvailableReleaseBlurb = null;
  let appliedProduct = baseProduct;
  let appliedReleases = baseProduct.releases;
  if ((bundle.parentCodes.length > 0) && isStringNonEmpty(bundle.doiProductCode)) {
    const bundleParentData = (bundleParents[bundle.doiProductCode] || {});
    if (exists(bundleParentData.releases)) {
      appliedProduct = bundleParentData;
      appliedReleases = bundleParentData.releases;
    }
  }
  if (Array.isArray(appliedReleases) && (appliedReleases.length > 0)) {
    const latestAvailableProductRelease = appliedReleases[0];
    if (latestAvailableProductRelease && latestAvailableProductRelease.release) {
      if (latestAvailableProductRelease.release.localeCompare(citationRelease.release) !== 0) {
        const dataProductDetailLink = (
          <Link href={RouteService.getProductDetailPath(appliedProduct.productCode)}>
            newer release
          </Link>
        );
        latestAvailableReleaseBlurb = (
          <>
            {/* eslint-disable react/jsx-one-expression-per-line, max-len */}
            has been replaced by a {dataProductDetailLink} and&nbsp;
            {/* eslint-enable react/jsx-one-expression-per-line, max-len */}
          </>
        );
      }
    }
  }
  const contactUsLink = (
    <Link href={RouteService.getContactUsPath()}>
      Contact Us
    </Link>
  );
  const tombstoneNote = (
    <>
      {/* eslint-disable react/jsx-one-expression-per-line, max-len */}
      {citationRelease.release} of this data product
      {doiDisplay} {latestAvailableReleaseBlurb}is no longer available for download.
      If this specific release is needed for research purposes, please fill out
      the {contactUsLink} form.
      {/* eslint-enable react/jsx-one-expression-per-line, max-len */}
    </>
  );
  return (
    <Card className={classes.card}>
      <CardHeader
        className={classes.cardHeader}
        title={(<Typography variant="h5" component="h2">Release Notice</Typography>)}
      />
      <CardContent className={classes.cardContent}>
        <Typography variant="body2" color="textSecondary">
          {tombstoneNote}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default TombstoneNotice;
