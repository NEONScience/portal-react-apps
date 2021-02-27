/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react';
import PropTypes from 'prop-types';

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

import PrototypeContext from '../PrototypeContext';

const { usePrototypeContextState } = PrototypeContext;

const DATA_POLICIES_URL = 'https://www.neonscience.org/data-samples/data-policies-citation';

const CITATION_FORMATS = {
  BIBTEX: {
    shortName: 'BibTex',
    longName: 'BibTex',
    mime: 'application/x-bibtex',
    extension: 'bib',
    generateProvisionalCitation: (dataset) => (`@misc{${dataset.uuid}/prototype,
  doi = {},
  url = {${window.location.href}},
  author = {{National Ecological Observatory Network (NEON)}},
  language = {en},
  title = {${dataset.projectTitle} (${dataset.projectTitle})},
  publisher = {National Ecological Observatory Network (NEON)},
  year = {${(new Date()).getFullYear()}}
}`),
  },
  RIS: {
    shortName: 'RIS',
    longName: 'Research Information Systems (RIS)',
    mime: 'application/x-research-info-systems',
    extension: 'ris',
    generateProvisionalCitation: (dataset) => (`TY  - DATA
T1  - ${dataset.projectTitle} (${dataset.uuid})
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

const getCitationText = (dataset) => {
  if (!dataset) { return null; }
  const { projectTitle } = dataset;
  const now = new Date();
  const today = dateFormat(now, 'mmmm d, yyyy');
  const neon = 'NEON (National Ecological Observatory Network)';
  const url = `https://data.neonscience.org/prototype-datasets/${dataset.uuid}`;
  const accessed = `(accessed ${today})`;
  return `${neon}. ${projectTitle}. ${url} ${accessed}`;
};

const useStyles = makeStyles(() => ({
  citationText: {
    fontFamily: 'monospace',
    fontSize: '1.05rem',
  },
}));

const Citation = (props) => {
  const classes = useStyles(Theme);

  const { uuid } = props;
  const [state] = usePrototypeContextState();
  const {
    datasets: { [uuid]: dataset },
  } = state;

  if (typeof dataset === 'undefined') { return null; }

  const dataPolicyLink = (
    <Link href={DATA_POLICIES_URL}>Data Policies &amp; Citation Guidelines</Link>
  );
  const citationText = getCitationText(dataset);

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
  const handleDownloadCitation = (format) => {
    if (!CITATION_FORMATS[format]) { return; }
    const { mime, extension, generateProvisionalCitation } = CITATION_FORMATS[format];
    const fileName = `NEON-Prototype-Dataset-${uuid}.${extension}`;
    // Generate client-side and immediately download
    const provisionalCitation = generateProvisionalCitation(dataset);
    if (!provisionalCitation) { return; }
    executeDownload(fileName, mime, provisionalCitation);
  };

  // Render
  return (
    <div>
      <Typography variant="subtitle2" gutterBottom>
        Please use this citation in your publications. See {dataPolicyLink} for more info.
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1" className={classes.citationText}>
            {citationText}
          </Typography>
        </CardContent>
        <CardActions>
          <Tooltip
            placement="bottom-start"
            title="Click to copy the above citation to the clipboard"
          >
            <CopyToClipboard text={citationText}>
              <Button size="small" color="primary" variant="outlined" startIcon={<CopyIcon />}>
                Copy
              </Button>
            </CopyToClipboard>
          </Tooltip>
          {Object.keys(CITATION_FORMATS).map((key) => (
            <Tooltip
              key={key}
              placement="bottom-start"
              title={`Click to download this citation as a file in ${CITATION_FORMATS[key].longName} format`}
            >
              <span>
                <Button
                  size="small"
                  color="primary"
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  className={classes.cardButton}
                  onClick={() => { handleDownloadCitation(key); }}
                >
                  {`Download (${CITATION_FORMATS[key].shortName})`}
                </Button>
              </span>
            </Tooltip>
          ))}
        </CardActions>
      </Card>
    </div>
  );
};

Citation.propTypes = {
  uuid: PropTypes.string.isRequired,
};

export default Citation;
