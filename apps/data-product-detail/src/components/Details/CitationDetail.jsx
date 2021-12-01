/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react';
import dateFormat from 'dateformat';

import { CopyToClipboard } from 'react-copy-to-clipboard';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Link from '@material-ui/core/Link';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import CopyIcon from '@material-ui/icons/Assignment';
import DownloadIcon from '@material-ui/icons/SaveAlt';

import Theme from 'portal-core-components/lib/components/Theme';

import BundleService from 'portal-core-components/lib/service/BundleService';
import DataCiteService, {
  CitationDownloadType,
} from 'portal-core-components/lib/service/DataCiteService';
import RouteService from 'portal-core-components/lib/service/RouteService';
import { isStringNonEmpty } from 'portal-core-components/lib/util/typeUtil';

import Detail from './Detail';
import DataProductContext from '../DataProductContext';

const { useDataProductContextState } = DataProductContext;

const useStyles = makeStyles((theme) => ({
  cardActions: {
    flexWrap: 'wrap',
    marginTop: theme.spacing(-1),
    '&> *': {
      marginLeft: '0px !important',
      marginTop: theme.spacing(1),
    },
    '&> :not(:last-child)': {
      marginRight: theme.spacing(1),
    },
  },
  cardButton: {
    padding: '5px 10px',
    backgroundColor: '#fff',
    whiteSpace: 'nowrap',
  },
  cardButtonIcon: {
    marginRight: Theme.spacing(1),
  },
  citationCard: {
    marginTop: theme.spacing(2),
  },
  citationText: {
    fontFamily: 'monospace',
  },
  citationTextWithQualifier: {
    marginTop: theme.spacing(1.5),
    fontFamily: 'monospace',
  },
  bundleParentBlurbCard: {
    backgroundColor: Theme.colors.GOLD[50],
    marginTop: theme.spacing(1),
  },
  bundleParentBlurbCardContent: {
    padding: theme.spacing(2),
    paddingBottom: '20px !important',
  },
  bundleParentBlurb: {
    fontStyle: 'italic',
    fontSize: '0.8rem',
  },
}));

const CitationDetail = () => {
  const classes = useStyles(Theme);
  const [state] = useDataProductContextState();

  const {
    route: {
      release: currentReleaseTag,
      bundle,
    },
    data: {
      product: baseProduct,
      productReleases,
      bundleParents,
      bundleParentReleases,
      releases,
    },
    neonContextState: {
      data: {
        bundles: bundlesCtx,
      },
    },
  } = state;

  const latestRelease = (releases && releases.length)
    ? releases.find((r) => r.showCitation)
    : null;

  const hasBundleCode = (bundle.parentCodes.length > 0) && isStringNonEmpty(bundle.doiProductCode);
  const bundleParentCode = hasBundleCode
    ? bundle.doiProductCode
    : null;

  const citableBaseProduct = hasBundleCode
    ? bundleParents[bundleParentCode] || baseProduct
    : baseProduct;

  /**
   * Determines if the latest release has a bundle defined for this product
   * @returns True if the latest release has a bundle defined for this product
   */
  const hasLatestBundleRelease = () => {
    if (!bundleParentReleases || !bundleParentCode) {
      return null;
    }
    const latestReleaseTag = (latestRelease || {}).release;
    if (!latestReleaseTag) {
      return null;
    }
    return BundleService.isProductInBundle(
      bundlesCtx,
      latestReleaseTag,
      baseProduct.productCode,
    );
  };

  let citableReleaseProduct = null;
  const citationReleaseTag = currentReleaseTag || (latestRelease || {}).release || null;
  if (citationReleaseTag) {
    // If we're referencing latest release and provisional, and there isn't a bundle
    // defined for the latest release, use base product for release citation
    if (!currentReleaseTag && !hasLatestBundleRelease()) {
      citableReleaseProduct = baseProduct;
    } else {
      // When a bundled product code is available for the given release,
      // get the product for the parent code and release.
      // Otherwise, the citable product is the current product for the specified
      // release when available.
      citableReleaseProduct = bundleParentCode
        ? (bundleParentReleases[bundleParentCode] || {})[citationReleaseTag] || null
        : productReleases[citationReleaseTag] || null;
    }
  }

  let bundleParentLink = null;
  if (bundleParentCode) {
    const bundleParentName = currentReleaseTag && citableReleaseProduct
      ? citableReleaseProduct.productName
      : citableBaseProduct.productName;
    let bundleParentHref = RouteService.getProductDetailPath(bundleParentCode);
    if (currentReleaseTag) {
      bundleParentHref = RouteService.getProductDetailPath(bundleParentCode, currentReleaseTag);
    }
    bundleParentLink = (
      <Link href={bundleParentHref}>
        {`${bundleParentName} (${bundleParentCode})`}
      </Link>
    );
  }

  const dataPolicyLink = (
    <Link href={RouteService.getDataPoliciesCitationPath()}>
      Data Policies &amp; Citation Guidelines
    </Link>
  );

  const getReleaseObject = (release) => (
    !release || release === 'provisional' ? null : (
      releases.find((r) => r.release === release)
    )
  );

  const currentReleaseObject = getReleaseObject(currentReleaseTag);
  const hideCitation = currentReleaseObject && !currentReleaseObject.showCitation;

  const getReleaseDoi = (release) => {
    const releaseObject = getReleaseObject(release);
    return releaseObject && releaseObject.productDoi && releaseObject.productDoi.url
      ? releaseObject.productDoi.url
      : null;
  };

  const getCitationText = (product, release) => {
    if (!product) { return null; }
    const releaseObject = getReleaseObject(release);
    const citationDoi = (
      releaseObject && releaseObject.productDoi && releaseObject.productDoi.url
        ? releaseObject.productDoi.url
        : null
    );
    const now = new Date();
    const today = dateFormat(now, 'mmmm d, yyyy');
    const neon = 'NEON (National Ecological Observatory Network)';
    const productName = releaseObject === null
      ? `${product.productName} (${product.productCode})`
      : `${product.productName}, ${release} (${product.productCode})`;
    const doiText = citationDoi ? `. ${citationDoi}` : '';
    const url = RouteService.getDataProductCitationDownloadUrl();
    const accessed = releaseObject === null
      ? `${url} (accessed ${today})`
      : `Dataset accessed from ${url} on ${today}`;
    return `${neon}. ${productName}${doiText}. ${accessed}`;
  };

  // Click handler for initiating a citation download
  const handleDownloadCitation = (release, format) => {
    const provisional = release === 'provisional';
    const citationProduct = provisional ? citableBaseProduct : citableReleaseProduct;
    // Release: fetch content from DataCite API to pipe into download
    const fullDoi = getReleaseDoi(release);
    DataCiteService.downloadCitation(
      format,
      CitationDownloadType.DATA_PRODUCT,
      citationProduct,
      fullDoi,
      release,
    );
  };

  const renderCitationCard = (release, conditional = false) => {
    if (hideCitation) { return null; }
    const provisional = release === 'provisional';
    const citationProduct = provisional ? citableBaseProduct : citableReleaseProduct;
    if (!citationProduct) { return null; }
    const downloadEnabled = provisional || getReleaseDoi(release) !== null;
    let conditionalText = null;
    let citationClassName = classes.citationText;
    if (conditional) {
      conditionalText = (
        <Typography variant="body1" component="h6">
          {(
            provisional
              ? 'If Provisional data are used, include:'
              : 'If Released data are used, include:'
          )}
        </Typography>
      );
      citationClassName = classes.citationTextWithQualifier;
    }
    const citationText = getCitationText(citationProduct, release);
    return (
      <Card className={classes.citationCard}>
        <CardContent>
          {conditionalText}
          <Typography variant="body1" className={citationClassName}>
            {citationText}
          </Typography>
        </CardContent>
        <CardActions className={classes.cardActions}>
          <Tooltip
            placement="bottom-start"
            title="Click to copy the above plain text citation to the clipboard"
          >
            <CopyToClipboard text={citationText}>
              <Button
                size="small"
                color="primary"
                variant="outlined"
                className={classes.cardButton}
              >
                <CopyIcon fontSize="small" className={classes.cardButtonIcon} />
                Copy
              </Button>
            </CopyToClipboard>
          </Tooltip>
          {DataCiteService.getDataProductFormats().map((format) => (
            <Tooltip
              key={format.shortName}
              placement="bottom-start"
              title={(
                downloadEnabled
                  ? `Click to download the ${citationProduct.productCode}/${release} citation as a file in ${format.longName} format`
                  : 'Citation format downloads are not available because this product release has no DOI'
              )}
            >
              <span style={downloadEnabled ? {} : { cursor: 'no-drop' }}>
                <Button
                  size="small"
                  color="primary"
                  variant="outlined"
                  className={classes.cardButton}
                  onClick={() => { handleDownloadCitation(release, format.shortName); }}
                  disabled={!downloadEnabled}
                >
                  <DownloadIcon fontSize="small" className={classes.cardButtonIcon} />
                  {`Download (${format.shortName})`}
                </Button>
              </span>
            </Tooltip>
          ))}
        </CardActions>
      </Card>
    );
  };

  return (
    <Detail title="Citation">
      <Typography variant="subtitle2">
        {(
          currentReleaseTag || latestRelease === null
            ? 'Please use this citation in your publications. '
            : 'Please use the appropriate citation(s) from below in your publications. If using both provisional and release data please include both citations. '
        )}
        See {dataPolicyLink} for more info.
      </Typography>
      {!bundleParentLink ? null : (
        <Card className={classes.bundleParentBlurbCard}>
          <CardContent className={classes.bundleParentBlurbCardContent}>
            <Typography variant="body2" color="textSecondary" className={classes.bundleParentBlurb}>
              {/* eslint-disable react/jsx-one-expression-per-line, max-len */}
              <b>Note:</b> This product is bundled into {bundleParentLink}.
              The {currentReleaseTag || !latestRelease ? 'citation below refers' : 'citations below refer'} to
              that product as this sub-product is not directly citable.
              {/* eslint-enable react/jsx-one-expression-per-line, max-len */}
            </Typography>
          </CardContent>
        </Card>
      )}
      {currentReleaseTag ? (
        renderCitationCard(currentReleaseTag)
      ) : (
        <>
          {renderCitationCard('provisional', latestRelease !== null)}
          {latestRelease ? renderCitationCard(latestRelease.release, true) : null}
        </>
      )}
    </Detail>
  );
};

export default CitationDetail;
