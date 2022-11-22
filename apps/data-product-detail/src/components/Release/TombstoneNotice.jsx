import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';

import Theme from 'portal-core-components/lib/components/Theme';

import RouteService from 'portal-core-components/lib/service/RouteService';
import { DoiStatusType } from 'portal-core-components/lib/types/neonApi';

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
    route: { release: currentRelease },
    data: { productReleaseDois, product: baseProduct },
  } = state;
  const isTombstoned = productReleaseDois
    && productReleaseDois[currentRelease]
    && productReleaseDois[currentRelease].status === DoiStatusType.TOMBSTONED;
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
  if (Array.isArray(baseProduct.releases) && (baseProduct.releases.length > 0)) {
    const latestAvailableProductRelease = baseProduct.releases[0];
    if (latestAvailableProductRelease && latestAvailableProductRelease.release) {
      if (latestAvailableProductRelease.release.localeCompare(citationRelease.release) !== 0) {
        const dataProductDetailLink = (
          <Link href={RouteService.getProductDetailPath(baseProduct.productCode)}>
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
