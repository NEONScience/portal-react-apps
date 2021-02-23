/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react';
import PropTypes from 'prop-types';

import dateFormat from 'dateformat';
import moment from 'moment';

import { CopyToClipboard } from 'react-copy-to-clipboard';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Chip from '@material-ui/core/Chip';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import CopyIcon from '@material-ui/icons/Assignment';
import DownloadIcon from '@material-ui/icons/SaveAlt';
import FileIcon from '@material-ui/icons/InsertDriveFile';
import XmlIcon from '@material-ui/icons/DescriptionOutlined';
import ZipIcon from '@material-ui/icons/Archive';

import DataThemeIcon from 'portal-core-components/lib/components/DataThemeIcon';
import NeonEnvironment from 'portal-core-components/lib/components/NeonEnvironment';
import SiteMap from 'portal-core-components/lib/components/SiteMap';
import Theme from 'portal-core-components/lib/components/Theme';

import PrototypeContext from '../PrototypeContext';

const { usePrototypeContextState } = PrototypeContext;

const DATA_POLICIES_URL = 'https://www.neonscience.org/data-samples/data-policies-citation';

const useStyles = makeStyles((theme) => ({
  chip: {
    marginRight: theme.spacing(0.5),
    marginBottom: theme.spacing(1),
    maxWidth: '-webkit-fill-available',
  },
  chipMoz: {
    maxWidth: '-moz-available',
  },
  citationText: {
    fontFamily: 'monospace',
    fontSize: '1.05rem',
  },
  datasetIdChip: {
    color: theme.palette.grey[500],
    border: `1px solid ${theme.palette.grey[500]}`,
    backgroundColor: theme.palette.grey[100],
    fontWeight: 600,
    height: '28px',
  },
  list: {
    padding: theme.spacing(0),
    marginTop: theme.spacing(-1),
    marginBottom: theme.spacing(1),
  },
  listItemSecondarySpacer: {
    margin: theme.spacing(0, 2),
    color: theme.palette.grey[200],
  },
  listItemIcon: {
    minWidth: theme.spacing(4),
    marginRight: theme.spacing(1),
  },
  listItemCitation: {
    '& span': {
      fontFamily: 'monospace',
      fontSize: '0.95rem',
      lineHeight: 1.5,
    },
  },
  listItemRelatedDataProduct: {
    borderRadius: theme.spacing(0.5),
    border: '0.5px solid #ffffff00',
    '&:hover': {
      border: `0.5px solid ${theme.palette.primary.main}`,
    },
    '& p': {
      color: theme.palette.primary.main,
      textDecoration: 'underline',
      marginTop: theme.spacing(0.5),
      '&:hover': {
        color: Theme.colors.LIGHT_BLUE[400],
      },
    },
  },
  listItemFile: {
    paddingLeft: theme.spacing(1),
    '& p': {
      marginTop: theme.spacing(0.5),
    },
  },
  listItemFileDetails: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    display: 'block',
  },
  section: {
    marginBottom: theme.spacing(4),
  },
  sectionSubtitle: {
    marginBottom: theme.spacing(1),
  },
  sectionTitle: {
    marginBottom: theme.spacing(1.5),
  },
  scienceTeamsUl: {
    paddingLeft: theme.spacing(2),
    margin: '0px',
  },
  startFlex: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  NA: {
    fontStyle: 'italic',
    color: theme.palette.grey[400],
  },
}));

const formatBytes = (bytes) => {
  if (!Number.isInteger(bytes) || bytes < 0) {
    return '0.000 B';
  }
  const scales = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const log = Math.log(bytes) / Math.log(1024);
  const scale = Math.floor(log);
  const precision = Math.floor(3 - ((log - scale) * 3));
  return `${(bytes / (1024 ** scale)).toFixed(precision)} ${scales[scale]}`;
};

export const downloadUuid = (uuid) => {
  if (!uuid) { return null; }
  const form = document.createElement('form');
  form.style.display = 'none';
  form.action = `${NeonEnvironment.getFullApiPath('download')}/prototype/stream`;
  form.method = 'POST';

  const input = document.createElement('input');
  input.name = 'manifest';
  input.value = JSON.stringify({ uuid });
  form.appendChild(input);

  document.body.appendChild(form);
  const submit = form.submit();
  document.body.removeChild(form);

  return submit;
};

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

const DatasetDetails = (props) => {
  const { uuid } = props;
  const classes = useStyles(Theme);

  const [state] = usePrototypeContextState();
  const {
    datasets: { [uuid]: dataset },
    manifestRollups: { [uuid]: manifestRollup },
  } = state;

  if (typeof dataset === 'undefined') { return null; }

  const {
    data: { files }, // url: dataUrl
    datasetAbstract,
    dataThemes,
    dateUploaded,
    designDescription,
    metadataDescription,
    endYear,
    keywords,
    locations,
    projectDescription,
    publicationCitations,
    relatedDataProducts,
    scienceTeams,
    startYear,
    studyAreaDescription,
  } = dataset;

  /**
     Helper functions
  */
  const getSectionTitle = (title) => (
    <Typography variant="h5" component="h3" className={classes.sectionTitle}>
      {title}
    </Typography>
  );

  const getSectionSubtitle = (title) => (
    <Typography variant="h6" component="h4" className={classes.sectionSubtitle}>
      {title}
    </Typography>
  );

  const getNA = (label = 'n/a') => (
    <Typography variant="body1" className={classes.NA}>{label}</Typography>
  );

  /**
     Pre-rendering
  */
  const uploadedMoment = moment(dateUploaded);

  // Theme Icons
  const themeIcons = (dataThemes || []).sort().map((dataTheme) => (
    <div key={dataTheme} style={{ marginRight: Theme.spacing(0.5) }}>
      <DataThemeIcon theme={dataTheme} size={4} />
    </div>
  ));

  // Keyword Chips
  const keywordChips = !(keywords || []).length ? null : keywords.map((keyword) => (
    <Chip
      label={keyword}
      key={keyword}
      size="small"
      className={`${classes.chip} ${classes.chipMoz}`}
    />
  ));

  // Science Teams
  let scienceTeamsFormatted = getNA();
  if (scienceTeams.length < 2) {
    scienceTeamsFormatted = (
      <Typography variant="body1">{scienceTeams[0]}</Typography>
    );
  } else {
    scienceTeamsFormatted = (
      <ul className={classes.scienceTeamsUl}>
        {scienceTeams.map((team) => (
          <li key={team}>
            <Typography variant="body1">{team}</Typography>
          </li>
        ))}
      </ul>
    );
  }

  // Related Data Products
  const relatedDataProductsLinks = !relatedDataProducts.length ? getNA('none') : (
    <List dense className={classes.list}>
      {relatedDataProducts.map((dataProduct) => {
        const { dataProductCode, dataProductName } = dataProduct;
        const href = `../../data-products/${dataProductCode}`;
        return (
          <ListItem
            key={dataProductCode}
            className={classes.listItemRelatedDataProduct}
            component="a"
            href={href}
            button
          >
            <ListItemText primary={dataProductName} secondary={dataProductCode} />
          </ListItem>
        );
      })}
    </List>
  );

  // Download File List
  const downloadFileList = !files.length ? getNA('none available') : (
    <List dense className={classes.list}>
      {files.map((file) => {
        const {
          description,
          fileName,
          size,
          type: { name: type },
        } = file;
        const formattedSize = formatBytes(size);
        const secondary = (
          <span className={classes.listItemFileDetails}>
            {formattedSize}
            <span className={classes.listItemSecondarySpacer}>|</span>
            {fileName}
          </span>
        );
        let TypeIcon = FileIcon;
        if (type === 'DATA') { TypeIcon = ZipIcon; }
        if (type === 'EML') { TypeIcon = XmlIcon; }
        return (
          <ListItem
            key={fileName}
            className={classes.listItemFile}
            title={`Click to download ${fileName} (${formattedSize})`}
          >
            <ListItemIcon className={classes.listItemIcon}>
              <TypeIcon />
            </ListItemIcon>
            <ListItemText primary={description} secondary={secondary} />
          </ListItem>
        );
      })}
    </List>
  );

  // Download Button
  const downloadButton = (
    <Button
      color="primary"
      variant="contained"
      onClick={() => { downloadUuid(uuid); }}
      startIcon={<DownloadIcon />}
      data-selenium="prototype-dataset-download-button"
      style={{ marginBottom: Theme.spacing(2) }}
      disabled={!manifestRollup}
    >
      {(
        manifestRollup
          ? `Download Package (Estimated Size: ${formatBytes(manifestRollup.totalBytes || 0)})`
          : 'Download not available'
      )}
    </Button>
  );

  // Manual Location Data
  const manualLocationData = [];
  if (Array.isArray(locations) && locations.length) {
    locations.forEach((location) => {
      if (!Number.isFinite(location.latitude) || !Number.isFinite(location.longitude)) { return; }
      manualLocationData.push({
        manualLocationType: 'PROTOTYPE_SITE',
        ...location,
      });
    });
  }

  // Citation
  const dataPolicyLink = (
    <Link href={DATA_POLICIES_URL}>Data Policies &amp; Citation Guidelines</Link>
  );
  const citationText = getCitationText(dataset);
  const citation = (
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
        </CardActions>
      </Card>
    </div>
  );

  /**
     Main render
  */
  return (
    <div>
      <Grid container spacing={4}>

        {/* Left Column */}
        <Grid item xs={12} sm={12} md={8} lg={9} xl={10}>
          {/* Prototype Dataset ID */}
          <div className={classes.section}>
            {getSectionTitle('Prototype Dataset ID')}
            <Chip label={uuid} className={classes.datasetIdChip} />
          </div>
          {/* Download */}
          <div className={classes.section}>
            {getSectionTitle('Download')}
            {downloadButton}
            {getSectionSubtitle(`Files in this Package (${files.length})`)}
            {downloadFileList}
            {!metadataDescription ? null : (
              <Typography variant="body2">
                {metadataDescription}
              </Typography>
            )}
          </div>
          {/* Project Decription */}
          <div className={classes.section}>
            {getSectionTitle('Project Description')}
            <Typography variant="body2">
              {projectDescription}
            </Typography>
          </div>
          {/* Design Decription */}
          <div className={classes.section}>
            {getSectionTitle('Design Description')}
            <Typography variant="body2">
              {designDescription}
            </Typography>
          </div>
          {/* Dataset Abstract */}
          <div className={classes.section}>
            {getSectionTitle('Dataset Abstract')}
            <Typography variant="body2">
              {datasetAbstract}
            </Typography>
          </div>
          {/* Citation */}
          <div className={classes.section}>
            {getSectionTitle('Citation')}
            {citation}
          </div>
          {/* Locations and Study Area */}
          <div className={classes.section}>
            {getSectionTitle('Locations and Study Area')}
            <Typography variant="body2" gutterBottom>
              {studyAreaDescription}
            </Typography>
            {!manualLocationData.length ? (
              <Typography variant="body2" className={classes.NA}>
                No valid associated locations found
              </Typography>
            ) : (
              <SiteMap manualLocationData={manualLocationData} />
            )}
          </div>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} sm={12} md={4} lg={3} xl={2}>
          {/* Time Range */}
          <div className={classes.section}>
            {getSectionTitle('Time Range')}
            <Typography variant="body1">
              {startYear === endYear ? startYear : `${startYear} – ${endYear}`}
            </Typography>
          </div>
          {/* Date Uploaded */}
          <div className={classes.section}>
            {getSectionTitle('Uploaded')}
            <Typography variant="body1">
              {!uploadedMoment.isValid() ? getNA() : uploadedMoment.format('MMMM D, YYYY')}
            </Typography>
          </div>
          {/* Data Themes */}
          <div className={classes.section}>
            {getSectionTitle('Data Themes')}
            <div className={classes.startFlex}>
              {themeIcons}
            </div>
          </div>
          {/* Science Teams */}
          <div className={classes.section}>
            {getSectionTitle(`Science Team${scienceTeams.length > 1 ? 's' : ''}`)}
            {scienceTeamsFormatted}
          </div>
          {/* Keywords */}
          <div className={classes.section}>
            {getSectionTitle('Scientific Keywords')}
            <div className={classes.startFlex} style={{ flexWrap: 'wrap' }}>
              {keywordChips}
            </div>
          </div>
          {/* Related Data Products */}
          <div className={classes.section}>
            {getSectionTitle('Related Data Products')}
            {relatedDataProductsLinks}
          </div>
          {/* Publication Citations */}
          <div className={classes.section}>
            {getSectionTitle('Publication Citations')}
            {Array.isArray(publicationCitations) && publicationCitations.length ? (
              <List dense className={classes.list}>
                {publicationCitations.map((pubCitation) => {
                  const { citation: pubCitText } = pubCitation;
                  return (
                    <ListItem key={pubCitText} className={classes.listItemCitation}>
                      <ListItemText primary={pubCitText} />
                    </ListItem>
                  );
                })}
              </List>
            ) : (
              <Typography variant="body1" className={classes.NA}>
                None
              </Typography>
            )}
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

DatasetDetails.propTypes = {
  uuid: PropTypes.string.isRequired,
};

export default DatasetDetails;
