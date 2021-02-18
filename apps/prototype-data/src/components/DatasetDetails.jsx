import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';

import DownloadIcon from '@material-ui/icons/SaveAlt';
import FileIcon from '@material-ui/icons/InsertDriveFile';
import XmlIcon from '@material-ui/icons/DescriptionOutlined';
import ZipIcon from '@material-ui/icons/Archive';

import DataThemeIcon from 'portal-core-components/lib/components/DataThemeIcon';
import NeonEnvironment from 'portal-core-components/lib/components/NeonEnvironment';
import Theme from 'portal-core-components/lib/components/Theme';

import PrototypeContext from '../PrototypeContext';

const { usePrototypeContextState } = PrototypeContext;

const useStyles = makeStyles((theme) => ({
  chip: {
    marginRight: theme.spacing(0.5),
    marginBottom: theme.spacing(1),
    maxWidth: '-webkit-fill-available',
  },
  chipMoz: {
    maxWidth: '-moz-available',
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
    projectDescription,
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
  const themeIcons = (dataThemes || []).sort().map((dataTheme) => (
    <div key={dataTheme} style={{ marginRight: Theme.spacing(0.5) }}>
      <DataThemeIcon theme={dataTheme} size={4} />
    </div>
  ));

  const keywordChips = !(keywords || []).length ? null : keywords.map((keyword) => (
    <Chip
      label={keyword}
      key={keyword}
      size="small"
      className={`${classes.chip} ${classes.chipMoz}`}
    />
  ));

  const uploadedMoment = moment(dateUploaded);

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

  /**
     Main render
  */
  return (
    <div>
      <Grid container spacing={4}>

        {/* Left Column */}
        <Grid item xs={12} sm={8} lg={9}>
          {/* Prototype Dataset ID */}
          <div className={classes.section}>
            {getSectionTitle('Prototype Dataset ID')}
            <Chip label={uuid} className={classes.datasetIdChip} />
          </div>
          {/* Files and Download */}
          <div className={classes.section}>
            {getSectionTitle('Files and Download')}
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
          {/* Locations and Study Area */}
          <div className={classes.section}>
            {getSectionTitle('Locations and Study Area')}
            <Typography variant="body2">
              {studyAreaDescription}
            </Typography>
          </div>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} sm={4} lg={3}>
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
        </Grid>
      </Grid>
    </div>
  );
};

DatasetDetails.propTypes = {
  uuid: PropTypes.string.isRequired,
};

export default DatasetDetails;
