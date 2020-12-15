/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react';
import dateFormat from 'dateformat';

import { CopyToClipboard } from 'react-copy-to-clipboard';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import CopyIcon from '@material-ui/icons/Assignment';
import DownloadIcon from '@material-ui/icons/SaveAlt';

import Theme from 'portal-core-components/lib/components/Theme';

import Detail from './Detail';
import DataProductContext from '../DataProductContext';

const DATA_POLICIES_URL = 'https://www.neonscience.org/data-samples/data-policies-citation';

const IS_PROD_ENV = ['localhost', 'int', 'cert'].every(
  prefix => !window.location.host.startsWith(prefix),
);
const DATACITE_API_ROOT = IS_PROD_ENV
  ? 'https://api.datacite.org/dois/'
  : 'https://api.test.datacite.org/dois/';

const CITATION_FORMATS = {
  BIBTEX: {
    shortName: 'BibTex',
    longName: 'BibTex',
    mime: 'application/x-bibtex',
    extension: 'bibtex',
    generateProvisionalCitation: product => (`@misc{,
  doi = {},
  url = {${window.location.href}},
  author = {{National Ecological Observatory Network (NEON)}},
  language = {en},
  title = {${product.productName}},
  publisher = {National Ecological Observatory Network (NEON)},
  year = {${(new Date()).getFullYear()}}
}`),
  },
  RIS: {
    shortName: 'RIS',
    longName: 'Research Information Systems (RIS)',
    mime: 'application/x-research-info-systems',
    extension: 'ris',
    generateProvisionalCitation: product => (`TY  - DATA
T1  - ${product.productName}
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

const useStyles = makeStyles(theme => ({
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
}));

const CitationDetail = () => {
  const classes = useStyles(Theme);
  const [state] = DataProductContext.useDataProductContextState();
  const product = DataProductContext.getCurrentProductFromState(state);

  const {
    route: {
      productCode,
      release: currentRelease,
    },
    data: {
      product: baseProduct,
    },
  } = state;
  const { releases } = baseProduct;

  const latestRelease = releases && releases.length ? releases[0] : null;

  const dataPolicyLink = (
    <a href={DATA_POLICIES_URL}>
      Data Policies &amp; Citation Guidelines
    </a>
  );

  const getReleaseObject = release => (
    !release || release === 'provisional' ? null : (
      releases.find(r => r.release === release)
    )
  );

  const getReleaseDoi = (release) => {
    const releaseObject = getReleaseObject(release);
    return releaseObject && releaseObject.productDoi && releaseObject.productDoi.url
      ? releaseObject.productDoi.url
      : null;
  };

  const getCitationText = (release) => {
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

  const getCitationHref = (release, format) => {
    if (!CITATION_FORMATS[format]) { return null; }
    const { mime, generateProvisionalCitation } = CITATION_FORMATS[format];
    if (release === 'provisional') {
      const provisionalCitation = generateProvisionalCitation(baseProduct);
      if (!provisionalCitation) { return null; }
      return (
        URL
          ? URL.createObjectURL(new Blob([provisionalCitation], { type: mime }))
          : `data:${mime},${encodeURI(provisionalCitation)}`
      );
    }
    const fullDoi = getReleaseDoi(release);
    if (!fullDoi) { return null; }
    const doiId = fullDoi.split('/').slice(-2).join('/');
    return `${DATACITE_API_ROOT}${mime}/${doiId}`;
  };

  const renderCitationCard = (release, conditional = false) => {
    const provisional = release === 'provisional';
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
    const citationText = getCitationText(release);
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
            title="Click to copy the above citation text to the clipboard"
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
          {Object.keys(CITATION_FORMATS).map(key => (
            <Tooltip
              key={key}
              placement="bottom-start"
              title={(
                downloadEnabled
                  ? `Click to download the above citation as a file in ${CITATION_FORMATS[key].longName} format`
                  : 'Citation format downloads are not available because this product release has no DOI'
              )}
            >
              <span style={downloadEnabled ? {} : { cursor: 'no-drop' }}>
                <Button
                  size="small"
                  color="primary"
                  variant="outlined"
                  className={classes.cardButton}
                  href={getCitationHref(release, key)}
                  download={`${productCode}_${release}.${CITATION_FORMATS[key].extension}`}
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
          currentRelease || latestRelease === null
            ? 'Please use this citation in your publications. '
            : 'Please use the appropriate citation(s) from below in your publications. If using both provisional and release data please include both citations. '
        )}
        See {dataPolicyLink} for more info.
      </Typography>
      {currentRelease ? (
        renderCitationCard(currentRelease)
      ) : (
        <React.Fragment>
          {renderCitationCard('provisional', latestRelease !== null)}
          {latestRelease ? renderCitationCard(latestRelease.release, true) : null}
        </React.Fragment>
      )}
    </Detail>
  );
};

export default CitationDetail;
