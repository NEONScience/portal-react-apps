/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react';
import PropTypes from 'prop-types';

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
    <Link href={RouteService.getDataPoliciesCitationPath()}>
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
