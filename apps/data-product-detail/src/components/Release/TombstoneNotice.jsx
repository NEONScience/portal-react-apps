import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Divider from '@material-ui/core/Divider';
import Link from '@material-ui/core/Link';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';

import Theme from 'portal-core-components/lib/components/Theme';

import BundleContentBuilder from 'portal-core-components/lib/components/Bundles/BundleContentBuilder';
import ReleaseNoticeCard from 'portal-core-components/lib/components/Card/ReleaseNoticeCard';
import RouteService from 'portal-core-components/lib/service/RouteService';
import { exists, isStringNonEmpty } from 'portal-core-components/lib/util/typeUtil';

import DataProductContext from '../DataProductContext';

const { useDataProductContextState, getProductDoiInfo } = DataProductContext;

const useStyles = makeStyles((theme) => ({
  doiListMultiBundle: {
    marginLeft: theme.spacing(3),
  },
  doiListItemText: {
    margin: 0,
  },
  doiFromParentBlurb: {
    marginTop: theme.spacing(1),
  },
  doiBlurb: {
    marginBottom: theme.spacing(1),
  },
  doiBundleLink: {
    marginBottom: theme.spacing(0.25),
  },
  noticeCardDivider: {
    margin: theme.spacing(0, 0, 2, 0),
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
  const isAtleastOneTombstoned = DataProductContext.determineTombstoned(
    productReleaseDois,
    currentRelease,
    true,
  );
  const citationReleases = productReleaseDois[currentRelease];
  const checkHasManyDois = Array.isArray(citationReleases);
  if (!isAtleastOneTombstoned || (!isTombstoned && !checkHasManyDois)) {
    return null;
  }
  const allDoiUrls = getProductDoiInfo(state);
  const tombstonedDoiUrls = allDoiUrls.filter((doiUrlInfo) => (
    doiUrlInfo.isTombstoned
  ));
  const hasTombstonedDois = (tombstonedDoiUrls.length >= 1);
  const hasManyTombstonedDois = (tombstonedDoiUrls.length > 1);
  if (!hasTombstonedDois) {
    return null;
  }
  const bundledLink = BundleContentBuilder.getBundledLink();
  const renderSingleTombstoneNote = (tombstonedDoiUrl) => {
    let doiDisplay = ' ';
    if (tombstonedDoiUrl.doiUrl) {
      const doiId = tombstonedDoiUrl.doiUrl.split('/').slice(-2).join('/');
      doiDisplay = ` (DOI:${doiId}) `;
    }
    const tombstonedRelease = tombstonedDoiUrl.releaseDoi.release;
    let latestAvailableReleaseBlurb = null;
    let appliedProduct = baseProduct;
    let appliedReleases = baseProduct.releases;
    let bundleParentLink = null;
    let doiUrlIsFromBundleParent = false;
    if ((bundle.parentCodes.length > 0) && isStringNonEmpty(tombstonedDoiUrl.productCode)) {
      const bundleParentData = (bundleParents[tombstonedDoiUrl.productCode] || {});
      if (exists(bundleParentData)) {
        const {
          productCode: bundleParentCode,
          productName: bundleParentName,
        } = bundleParentData;
        appliedProduct = bundleParentData;
        appliedReleases = bundleParentData.releases || [];
        doiUrlIsFromBundleParent = true;
        bundleParentLink = (
          <Link
            href={RouteService.getProductDetailPath(bundleParentCode, currentRelease)}
          >
            {`${bundleParentName} (${bundleParentCode})`}
          </Link>
        );
      }
    }
    if (Array.isArray(appliedReleases) && (appliedReleases.length > 0)) {
      const latestAvailableProductRelease = appliedReleases[0];
      if (latestAvailableProductRelease && latestAvailableProductRelease.release) {
        if (latestAvailableProductRelease.release.localeCompare(tombstonedRelease) !== 0) {
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
    const renderPrimary = () => {
      if (!hasManyTombstonedDois) {
        return (
          <Typography variant="body2">
            {/* eslint-disable react/jsx-one-expression-per-line, max-len */}
            <b>{tombstonedRelease}</b> of this data product
            {doiDisplay} {latestAvailableReleaseBlurb}is no longer available for download.
            If this specific release is needed for research purposes, please fill out
            the {contactUsLink} form.
            {/* eslint-enable react/jsx-one-expression-per-line, max-len */}
          </Typography>
        );
      }
      if (!doiUrlIsFromBundleParent) {
        return null;
      }
      return (
        <Typography variant="body2" className={classes.doiBundleLink}>
          {bundleParentLink}
        </Typography>
      );
    };
    const renderSecondary = () => {
      if (!hasManyTombstonedDois) {
        if (!doiUrlIsFromBundleParent) {
          return null;
        }
        return (
          <>
            <Typography variant="subtitle2" color="textPrimary" className={classes.doiFromParentBlurb}>
              {/* eslint-disable react/jsx-one-expression-per-line */}
              This data product release is {bundledLink} into {bundleParentLink}.
              {/* eslint-enable react/jsx-one-expression-per-line */}
            </Typography>
            <Typography variant="body2" color="textPrimary">
              The above DOI refers to that data product release and there is no DOI directly
              associated with this data product release.
              {/* eslint-enable react/jsx-one-expression-per-line */}
            </Typography>
          </>
        );
      }
      return (
        <Typography variant="body2" color="textPrimary">
          {/* eslint-disable react/jsx-one-expression-per-line, max-len */}
          <b>{tombstonedRelease}</b> of this data product
          {doiDisplay} {latestAvailableReleaseBlurb}is no longer available for download.
          If this specific release is needed for research purposes, please fill out
          the {contactUsLink} form.
          {/* eslint-enable react/jsx-one-expression-per-line, max-len */}
        </Typography>
      );
    };
    return (
      <ListItem
        dense
        disableGutters
        key={`TombstonedDoiUrlKey-${tombstonedDoiUrl.doiUrl}`}
        alignItems="flex-start"
        ContainerComponent="div"
      >
        <ListItemText
          className={hasManyTombstonedDois ? classes.doiListItemText : undefined}
          primary={renderPrimary()}
          secondary={renderSecondary()}
        />
      </ListItem>
    );
  };
  const renderTombstoneNotes = () => (
    tombstonedDoiUrls.map((tombstonedDoiUrl) => (
      renderSingleTombstoneNote(tombstonedDoiUrl)
    ))
  );
  return (
    <ReleaseNoticeCard
      messageContent={(
        <>
          <Divider className={classes.noticeCardDivider} />
          {!hasManyTombstonedDois ? null : (
            <Typography variant="subtitle2" className={classes.doiBlurb}>
              {/* eslint-disable react/jsx-one-expression-per-line, max-len */}
              This data product release is {bundledLink} into the following data product releases:
              {/* eslint-enable react/jsx-one-expression-per-line, max-len */}
            </Typography>
          )}
          <List
            dense
            disablePadding
            className={hasManyTombstonedDois ? classes.doiListMultiBundle : undefined}
          >
            {renderTombstoneNotes()}
          </List>
        </>
      )}
    />
  );
};

export default TombstoneNotice;
