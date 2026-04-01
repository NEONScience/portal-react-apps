/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react';
import PropTypes from 'prop-types';

import { CopyToClipboard } from 'react-copy-to-clipboard';

import makeStyles from '@mui/styles/makeStyles';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import CopyIcon from '@mui/icons-material/Assignment';
import DownloadIcon from '@mui/icons-material/SaveAlt';

import Theme from 'portal-core-components/lib/components/Theme';

import CitationService from 'portal-core-components/lib/service/CitationService';
import DataCiteService, {
  CitationDownloadType,
} from 'portal-core-components/lib/service/DataCiteService';
import RouteService from 'portal-core-components/lib/service/RouteService';

import PrototypeContext from '../PrototypeContext';

const { usePrototypeContextState } = PrototypeContext;

const useStyles = makeStyles(() => ({
  citationText: {
    fontFamily: 'monospace',
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
    <Link href={RouteService.getDataPoliciesCitationPath()} underline="hover">
      Data Policies &amp; Citation Guidelines
    </Link>
  );
  const citationText = CitationService.buildPrototypeDatasetCitationText(dataset);

  // Click handler for initiating a citation download
  const handleDownloadCitation = (format) => {
    const { doi } = dataset;
    const hasDoi = doi && doi.url;
    const doiId = hasDoi
      ? doi.url.split('/').slice(-2).join('/')
      : uuid;
    DataCiteService.downloadCitation(
      format,
      CitationDownloadType.PROTOTYPE_DATASET,
      dataset,
      doiId,
      hasDoi ? undefined : 'provisional',
    );
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
          {/* NOTE: Tooltip is breaking CopyToClipboard as of MUI v5!
            <Tooltip
            placement="bottom-start"
            title="Click to copy the above citation to the clipboard"
          > */}
          <CopyToClipboard text={citationText}>
            <Button size="small" color="primary" variant="outlined" startIcon={<CopyIcon />}>
              Copy
            </Button>
          </CopyToClipboard>
          {/* </Tooltip> */}
          {DataCiteService.getPrototypeDatasetFormats().map((format) => (
            <Tooltip
              key={format.shortName}
              placement="bottom-start"
              title={`Click to download this citation as a file in ${format.longName} format`}
            >
              <span>
                <Button
                  size="small"
                  color="primary"
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  className={classes.cardButton}
                  onClick={() => { handleDownloadCitation(format.shortName); }}
                >
                  {`Download (${format.shortName})`}
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
