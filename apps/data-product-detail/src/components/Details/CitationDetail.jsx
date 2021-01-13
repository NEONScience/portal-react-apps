/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react';
import dateFormat from 'dateformat';

import { of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';

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

import NeonEnvironment from 'portal-core-components/lib/components/NeonEnvironment';
import Theme from 'portal-core-components/lib/components/Theme';

import Detail from './Detail';
import DataProductContext from '../DataProductContext';

const { useDataProductContextState } = DataProductContext;

const DATA_POLICIES_URL = 'https://www.neonscience.org/data-samples/data-policies-citation';

const IS_PROD_ENV = ['localhost', 'int', 'cert'].every(
  (prefix) => !window.location.host.startsWith(prefix),
);
const DATACITE_API_ROOT = IS_PROD_ENV
  ? 'https://api.datacite.org/dois/'
  : 'https://api.test.datacite.org/dois/';

const CITATION_FORMATS = {
  BIBTEX: {
    shortName: 'BibTex',
    longName: 'BibTex',
    mime: 'application/x-bibtex',
    extension: 'bib',
    generateProvisionalCitation: (product) => (`@misc{${product.productCode}/provisional,
  doi = {},
  url = {${window.location.href}},
  author = {{National Ecological Observatory Network (NEON)}},
  language = {en},
  title = {${product.productName} (${product.productCode})},
  publisher = {National Ecological Observatory Network (NEON)},
  year = {${(new Date()).getFullYear()}}
}`),
  },
  RIS: {
    shortName: 'RIS',
    longName: 'Research Information Systems (RIS)',
    mime: 'application/x-research-info-systems',
    extension: 'ris',
    generateProvisionalCitation: (product) => (`TY  - DATA
T1  - ${product.productName} (${product.productCode})
AU  - National Ecological Observatory Network (NEON)
DO  - 
UR  - ${window.location.href}
PY  - ${(new Date()).getFullYear()}
PB  - National Ecological Observatory Network (NEON)
LA  - en
ER  - `),
  },
};
Object.keys(CITATION_FORMATS).forEach((key) => { CITATION_FORMATS[key].KEY = key; });

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
  } = state;

  const latestRelease = releases && releases.length ? releases[0] : null;

  const bundleParentCode = bundle.parentCodes.length ? bundle.parentCodes[0] : null;

  const citableBaseProduct = bundle.parentCodes.length
    ? bundleParents[bundleParentCode] || baseProduct
    : baseProduct;

  let citableReleaseProduct = null;
  const citationReleaseTag = currentReleaseTag || (latestRelease || {}).release || null;
  if (citationReleaseTag) {
    citableReleaseProduct = bundleParentCode
      ? (bundleParentReleases[bundleParentCode] || {})[citationReleaseTag] || null
      : productReleases[citationReleaseTag] || null;
  }

  let bundleParentLink = null;
  if (bundleParentCode) {
    const bundleParentName = currentReleaseTag
      ? citableReleaseProduct.productName
      : citableBaseProduct.productName;
    let bundleParentHref = `${NeonEnvironment.getHost()}/data-products/${bundleParentCode}`;
    if (currentReleaseTag) { bundleParentHref += `/${currentReleaseTag}`; }
    bundleParentLink = (
      <Link href={bundleParentHref}>
        {`${bundleParentName} (${bundleParentCode})`}
      </Link>
    );
  }

  const dataPolicyLink = (
    <Link href={DATA_POLICIES_URL}>
      Data Policies &amp; Citation Guidelines
    </Link>
  );

  const getReleaseObject = (release) => (
    !release || release === 'provisional' ? null : (
      releases.find((r) => r.release === release)
    )
  );

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
    const url = 'https://data.neonscience.org';
    const accessed = releaseObject === null
      ? `${url} (accessed ${today})`
      : `Dataset accessed from ${url} on ${today}`;
    return `${neon}. ${productName}${doiText}. ${accessed}`;
  };

  // Actual function that makes the download happen with payload passed as an argument.
  // We don't hit the DataCite API directly with a link as, while this will download a valid file,
  // we have no control over the file name. As such we fetch the content with ajax (see
  // handleDownloadCitation) and pass it here the same as we do a provisional citation (which
  // requires no fetch) and execute the download in this way allowing full file name control.
  const executeDownload = (fileName, mimeType, payload) => {
    const link = document.createElement('a');
    if (URL) {
      link.href = URL.createObjectURL(new Blob([payload], { type: mimeType }));
    } else {
      link.setAttribute('href', `data:${mimeType},${encodeURI(payload)}`);
    }
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Click handler for initiating a citation download
  const handleDownloadCitation = (release, format) => {
    if (!CITATION_FORMATS[format]) { return; }
    const { mime, extension, generateProvisionalCitation } = CITATION_FORMATS[format];
    const fileName = `NEON-${citableBaseProduct.productCode}-${release}.${extension}`;
    // Provisional: generate client-side and immediately download
    if (release === 'provisional') {
      const provisionalCitation = generateProvisionalCitation(citableBaseProduct);
      if (!provisionalCitation) { return; }
      executeDownload(fileName, mime, provisionalCitation);
      return;
    }
    // Release: fetch content from DataCite API to pipe into download
    const fullDoi = getReleaseDoi(release);
    if (!fullDoi) { return; }
    const doiId = fullDoi.split('/').slice(-2).join('/');
    const citationUrl = `${DATACITE_API_ROOT}${mime}/${doiId}`;
    ajax({
      url: citationUrl,
      method: 'GET',
      responseType: 'text',
    }).pipe(
      map((citationContent) => {
        executeDownload(fileName, mime, citationContent.response);
      }),
      catchError((error) => {
        // eslint-disable-next-line no-console
        console.error(`Unable to download citation ${fileName}`, error);
        return of(error);
      }),
    ).subscribe();
  };

  const renderCitationCard = (release, conditional = false) => {
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
          {Object.keys(CITATION_FORMATS).map((key) => (
            <Tooltip
              key={key}
              placement="bottom-start"
              title={(
                downloadEnabled
                  ? `Click to download the ${citableBaseProduct.productCode}/${release} citation as a file in ${CITATION_FORMATS[key].longName} format`
                  : 'Citation format downloads are not available because this product release has no DOI'
              )}
            >
              <span style={downloadEnabled ? {} : { cursor: 'no-drop' }}>
                <Button
                  size="small"
                  color="primary"
                  variant="outlined"
                  className={classes.cardButton}
                  onClick={() => { handleDownloadCitation(release, key); }}
                  disabled={!downloadEnabled}
                >
                  <DownloadIcon fontSize="small" className={classes.cardButtonIcon} />
                  {`Download (${CITATION_FORMATS[key].shortName})`}
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
              <b>Note:</b> This product bundled into {bundleParentLink}.
              The {currentReleaseTag || !latestRelease ? 'citation below refers' : 'citations below refer'} to
              that product and this sub-product is not directly citable.
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
