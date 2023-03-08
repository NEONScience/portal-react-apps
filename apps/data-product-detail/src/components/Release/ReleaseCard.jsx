/* eslint-disable import/no-unresolved */
import React from 'react';

import moment from 'moment';

import { CopyToClipboard } from 'react-copy-to-clipboard';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Link from '@material-ui/core/Link';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import CopyIcon from '@material-ui/icons/Assignment';

import Theme from 'portal-core-components/lib/components/Theme';

import RouteService from 'portal-core-components/lib/service/RouteService';
import { exists, existsNonEmpty, isStringNonEmpty } from 'portal-core-components/lib/util/typeUtil';

import DataProductContext from '../DataProductContext';

import DetailTooltip from '../Details/DetailTooltip';

const DOI_TOOLTIP = 'Digital Object Identifier (DOI) - A citable, permanent link to this data product release';

const {
  APP_STATUS,
  useDataProductContextState,
  getCurrentReleaseObjectFromState,
  getProductDoiInfo,
  determineTombstoned,
} = DataProductContext;

const useStyles = makeStyles((theme) => ({
  multiCitationContainer: {
    marginTop: theme.spacing(2),
  },
  doiList: {
    width: '100%',
  },
  doiListItemText: {
    margin: 0,
  },
  doiListItemSecondaryAction: {
    paddingRight: '120px',
  },
  card: {
    backgroundColor: 'rgba(225, 227, 234, 0.6)', // This is => theme.colors.NEON_BLUE[50]
    borderColor: theme.colors.NEON_BLUE[700],
    marginBottom: theme.spacing(4),
  },
  cardHeader: {
    padding: theme.spacing(3),
    paddingBottom: 0,
  },
  cardContent: {
    paddingTop: theme.spacing(2),
  },
  flex: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
  },
  copyButton: {
    backgroundColor: '#fff',
  },
  releaseAttribTitle: {
    marginRight: theme.spacing(1),
  },
  releaseAttribValue: {
    fontWeight: 600,
  },
  releaseInfoLink: {
    fontWeight: 600,
  },
  doiFromParentBlurb: {
    marginTop: theme.spacing(1),
  },
}));

const ReleaseCard = () => {
  const classes = useStyles(Theme);

  const [state] = useDataProductContextState();
  const {
    app: { status: appStatus },
    route: { release: currentRelease, bundle },
    data: {
      bundleParentReleases,
      productReleaseDois,
      product: baseProduct,
    },
  } = state;

  const loading = ![APP_STATUS.READY, APP_STATUS.ERROR].includes(appStatus);

  // Get the current release object if appropriate to do so
  const hasRouteRelease = isStringNonEmpty(currentRelease);
  const currentReleaseObject = getCurrentReleaseObjectFromState(state);
  const hideDoi = currentReleaseObject && !currentReleaseObject.showDoi;
  let currentReleaseGenDate = null;
  if (currentReleaseObject) {
    const generationMoment = moment(currentReleaseObject.generationDate);
    currentReleaseGenDate = generationMoment ? generationMoment.format('MMMM D, YYYY') : null;
  }
  let currentDoiUrls = getProductDoiInfo(state);

  // Special handling for bundle children
  if ((currentDoiUrls.length > 0)
      && (bundle.parentCodes.length > 0)
      && (isStringNonEmpty(bundle.doiProductCode) || existsNonEmpty(bundle.doiProductCode))) {
    currentDoiUrls = currentDoiUrls.map((currentDoiUrl) => {
      const bundleParentCode = currentDoiUrl.productCode;
      const bundleParentData = (bundleParentReleases[bundleParentCode] || {})[currentRelease] || {};
      const { productName: bundleParentName } = bundleParentData;
      const bundleParentLink = !Object.keys(bundleParentData).length ? null : (
        <Link
          href={RouteService.getProductDetailPath(bundleParentCode, currentRelease)}
        >
          {`${bundleParentName} (${bundleParentCode})`}
        </Link>
      );
      return {
        ...currentDoiUrl,
        bundleParentLink,
        doiUrlIsFromBundleParent: true,
      };
    });
  }

  const isTombstoned = determineTombstoned(productReleaseDois, currentRelease);
  const showNotInReleaseNotice = hasRouteRelease
    && !loading
    && !exists(currentReleaseObject)
    && !hideDoi
    && !isTombstoned;

  const releaseInfoHref = !currentRelease
    ? null
    : RouteService.getReleaseDetailPath(currentRelease);
  const releaseInfoTooltip = !currentRelease ? null : (
    `Click to view general information about all data products in the ${currentRelease} release`
  );

  const renderNotInReleaseNotice = () => {
    if (!showNotInReleaseNotice) return null;
    const dataProductDetailLink = (
      <Link href={RouteService.getProductDetailPath(baseProduct.productCode)}>
        here
      </Link>
    );
    return (
      <Card className={classes.card}>
        <CardHeader
          className={classes.cardHeader}
          title={(<Typography variant="h5" component="h2">Release Notice</Typography>)}
        />
        <CardContent className={classes.cardContent}>
          <Typography variant="body2" color="textPrimary">
            {/* eslint-disable react/jsx-one-expression-per-line, max-len */}
            {currentRelease} of this data product is not available.
            The data product releases can be found {dataProductDetailLink}.
            {/* eslint-enable react/jsx-one-expression-per-line, max-len */}
          </Typography>
        </CardContent>
      </Card>
    );
  };

  const renderReleaseCard = () => {
    if (!currentReleaseObject || hideDoi || (currentDoiUrls.length < 1)) {
      return null;
    }
    const hasManyDois = (currentDoiUrls.length > 1);
    const renderDois = () => {
      if (!hasManyDois) {
        if (!currentDoiUrls[0]) {
          return null;
        }
        const currentDoiUrl = currentDoiUrls[0];
        return (
          <>
            <Typography variant="subtitle2" color="textPrimary" component="p">
              <span className={classes.releaseAttribTitle}>DOI:</span>
              <span className={classes.releaseAttribValue}>
                {currentDoiUrl.doiUrl}
              </span>
              <DetailTooltip tooltip={DOI_TOOLTIP} />
            </Typography>
            {!currentDoiUrl.doiUrlIsFromBundleParent ? null : (
              <>
                <Typography variant="subtitle2" color="textSecondary" className={classes.doiFromParentBlurb}>
                  {/* eslint-disable react/jsx-one-expression-per-line */}
                  This data product release is bundled into {currentDoiUrl.bundleParentLink}
                  {/* eslint-enable react/jsx-one-expression-per-line */}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  The above DOI refers to that data product release and there is no DOI directly
                  associated with this sub-product release.
                </Typography>
              </>
            )}
          </>
        );
      }
      const items = currentDoiUrls.map((currentDoiUrl) => (
        <ListItem
          dense
          disableGutters
          key={`ReleaseCardDoiUrlKey-${currentDoiUrl}`}
          alignItems="flex-start"
          ContainerComponent="div"
          classes={{
            secondaryAction: classes.doiListItemSecondaryAction,
          }}
        >
          <ListItemText
            className={classes.doiListItemText}
            primary={(
              !currentDoiUrl.doiUrlIsFromBundleParent ? null : (
                <Typography variant="subtitle2" className={classes.doiFromParentBlurb}>
                  {/* eslint-disable react/jsx-one-expression-per-line */}
                  {currentDoiUrl.bundleParentLink}
                  {/* eslint-enable react/jsx-one-expression-per-line */}
                </Typography>
              )
            )}
            secondary={(
              <Typography variant="subtitle2" color="textPrimary" component="p">
                <span className={classes.releaseAttribTitle}>DOI:</span>
                <span className={classes.releaseAttribValue}>
                  {currentDoiUrl.doiUrl}
                </span>
                <DetailTooltip tooltip={DOI_TOOLTIP} />
              </Typography>
            )}
          />
          <ListItemSecondaryAction>
            <CopyToClipboard text={currentDoiUrl.doiUrl}>
              <Button
                color="primary"
                variant="outlined"
                size="small"
                className={classes.copyButton}
              >
                <CopyIcon fontSize="small" />
                Copy DOI
              </Button>
            </CopyToClipboard>
          </ListItemSecondaryAction>
        </ListItem>
      ));
      let subTitleContent = (
        <>Please cite one or both depending on which data are used.</>
      );
      if (currentDoiUrls.length > 2) {
        subTitleContent = (
          <>Please cite depending on which data are used.</>
        );
      }
      return (
        <div className={classes.multiCitationContainer}>
          <Typography variant="subtitle2">
            This data product release is a sub-product of the following data product releases:
          </Typography>
          <List dense disablePadding classeName={classes.doiList}>
            {items}
          </List>
          <Typography variant="subtitle2" style={{ marginTop: Theme.spacing(1) }}>
            {subTitleContent}
          </Typography>
        </div>
      );
    };
    return (
      <Card className={classes.card}>
        <CardContent>
          <div className={classes.flex}>
            <Typography variant="h5" component="h2">
              Release:&nbsp;
              <Tooltip
                placement="right"
                title={releaseInfoTooltip}
                className={classes.tooltip}
              >
                <Link href={releaseInfoHref} className={classes.releaseInfoLink}>
                  {currentRelease}
                </Link>
              </Tooltip>
            </Typography>
            {hasManyDois || !currentDoiUrls[0] ? null : (
              <CopyToClipboard text={currentDoiUrls[0].doiUrl}>
                <Button
                  color="primary"
                  variant="outlined"
                  size="small"
                  className={classes.copyButton}
                >
                  <CopyIcon fontSize="small" />
                  Copy DOI
                </Button>
              </CopyToClipboard>
            )}
          </div>
          <Typography variant="subtitle2" color="textPrimary" component="p">
            <span className={classes.releaseAttribTitle}>Generated:</span>
            <span className={classes.releaseAttribValue}>{currentReleaseGenDate}</span>
          </Typography>
          {renderDois()}
        </CardContent>
      </Card>
    );
  };
  return (
    <>
      {renderNotInReleaseNotice()}
      {renderReleaseCard()}
    </>
  );
};

export default ReleaseCard;