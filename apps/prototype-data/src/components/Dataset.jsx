import React from 'react';
import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Chip from '@material-ui/core/Chip';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import DataThemeIcon from 'portal-core-components/lib/components/DataThemeIcon';
import SiteChip from 'portal-core-components/lib/components/SiteChip/SiteChip';
import Theme from 'portal-core-components/lib/components/Theme';

import DetailsIcon from '@material-ui/icons/InfoOutlined';

import PrototypeContext from '../PrototypeContext';

const { usePrototypeContextState } = PrototypeContext;

const useStyles = makeStyles((theme) => ({
  actions: {
    justifyContent: 'flex-end',
  },
  content: {
    paddingBottom: theme.spacing(1.5),
  },
  datasetCard: {
    marginBottom: theme.spacing(3),
  },
  datasetIdChip: {
    color: theme.palette.grey[500],
    border: `1px solid ${theme.palette.grey[500]}`,
    backgroundColor: theme.palette.grey[100],
    fontWeight: 600,
    height: '28px',
    [theme.breakpoints.down('xs')]: {
      fontSize: '0.67rem',
    },
  },
  title: {
    fontWeight: 500,
  },
  startFlex: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  cardFirstColumnSection: {
    marginBottom: theme.spacing(2),
  },
  sectionTitle: {
    fontWeight: 500,
    marginBottom: theme.spacing(1),
  },
  chip: {
    marginRight: theme.spacing(0.5),
    marginBottom: theme.spacing(1),
    maxWidth: '-webkit-fill-available',
  },
  chipMoz: {
    maxWidth: '-moz-available',
  },
  siteChipToolip: {
    width: '280px',
  },
  NA: {
    fontStyle: 'italic',
    color: theme.palette.grey[400],
  },
}));

const Dataset = (props) => {
  const { uuid } = props;
  const classes = useStyles(Theme);
  const atSm = useMediaQuery(Theme.breakpoints.only('sm'));
  const downSm = useMediaQuery(Theme.breakpoints.down('sm'));
  const atMd = useMediaQuery(Theme.breakpoints.only('md'));
  const showDetailIconOnly = atSm || atMd;

  const [state, dispatch] = usePrototypeContextState();
  const { datasets: { [uuid]: dataset } } = state;

  if (typeof dataset === 'undefined') { return null; }

  const {
    dataThemes,
    endYear,
    locations,
    keywords,
    projectDescription,
    projectTitle,
    startYear,
    version,
  } = dataset;

  const themeIcons = (dataThemes || []).sort().map((dataTheme) => (
    <div key={dataTheme} style={{ marginRight: Theme.spacing(0.5) }}>
      <DataThemeIcon theme={dataTheme} size={4} />
    </div>
  ));

  const siteChips = (!locations || []).length
    ? null
    : locations
      .filter((location) => location && location.siteCode)
      .sort((a, b) => a.siteCode.localeCompare(b.siteCode))
      .map((location) => {
        let siteCode;
        // eslint-disable-next-line prefer-regex-literals
        const regex = new RegExp(/^[A-Z]{4}$/);
        if (regex) {
          const matches = regex.exec(location.siteCode);
          const valid = (matches && (matches.length > 0)) || false;
          if (valid) {
            siteCode = location.siteCode;
          }
        }
        if (!siteCode) {
          return null;
        }
        const renderTitle = (titleLoc) => ((
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Typography variant="subtitle2">Site Name</Typography>
              {titleLoc.siteName
                ? <Typography variant="body2">{titleLoc.siteName}</Typography>
                : <Typography variant="subtitle2" className={classes.NA}>None specified</Typography>}
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2">State</Typography>
              {titleLoc.state
                ? <Typography variant="body2">{titleLoc.state}</Typography>
                : <Typography variant="subtitle2" className={classes.NA}>None specified</Typography>}
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2">Domain</Typography>
              {titleLoc.domain
                ? <Typography variant="body2">{titleLoc.domain}</Typography>
                : <Typography variant="subtitle2" className={classes.NA}>None specified</Typography>}
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2">Latitude</Typography>
              {titleLoc.latitude
                ? <Typography variant="body2">{titleLoc.latitude}</Typography>
                : <Typography variant="subtitle2" className={classes.NA}>None specified</Typography>}
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2">Longitude</Typography>
              {titleLoc.longitude
                ? <Typography variant="body2">{titleLoc.longitude}</Typography>
                : <Typography variant="subtitle2" className={classes.NA}>None specified</Typography>}
            </Grid>
          </Grid>
        ));
        return (
          <Tooltip
            arrow
            key={siteCode}
            style={{ flex: 0 }}
            classes={{ tooltip: classes.siteChipToolip }}
            placement="top"
            title={renderTitle(location)}
          >
            <div>
              <SiteChip
                key={siteCode}
                color="primary"
                label={siteCode}
                className={`${classes.chip} ${classes.chipMoz}`}
              />
            </div>
          </Tooltip>
        );
      })
      .filter((chip) => chip !== null);

  const keywordChips = !(keywords || []).length ? null : keywords.map((keyword) => (
    <Chip
      label={keyword}
      key={keyword}
      size="small"
      className={`${classes.chip} ${classes.chipMoz}`}
    />
  ));

  const renderSites = () => {
    if (!siteChips || (siteChips.length <= 0)) {
      return (<Typography variant="body2" className={classes.NA}>None specified</Typography>);
    }
    return siteChips;
  };

  const renderDetailButton = () => {
    let buttonText = 'Details and Data';
    if (showDetailIconOnly) {
      buttonText = 'Details';
    }
    let buttonStyle = {
      width: '100%',
    };
    if (!downSm) {
      buttonStyle = {
        ...buttonStyle,
        maxWidth: '200px',
      };
    }
    return (
      <Button
        variant="contained"
        color="primary"
        style={buttonStyle}
        endIcon={<DetailsIcon />}
        onClick={() => dispatch({ type: 'setNextUuid', uuid })}
      >
        {buttonText}
      </Button>
    );
  };

  return (
    <Card className={classes.datasetCard}>
      <CardContent className={classes.content}>
        <Grid container spacing={2} style={{ marginBottom: Theme.spacing(1) }}>
          <Grid item xs={12} sm={9} md={8} lg={8}>
            <Typography variant="h6" className={classes.title}>
              {projectTitle}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={3} md={4} lg={4} style={{ textAlign: 'right' }}>
            {renderDetailButton()}
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={10}>
            <Typography variant="subtitle2" className={classes.sectionTitle}>
              Prototype Dataset ID
            </Typography>
            <div style={{ marginBottom: Theme.spacing(3) }}>
              <Chip label={uuid} className={classes.datasetIdChip} />
            </div>
            <Typography variant="subtitle2" className={classes.sectionTitle}>
              Project Description
            </Typography>
            <Typography variant="body2" style={{ marginBottom: Theme.spacing(3) }}>
              {projectDescription}
            </Typography>
            <div>
              <Typography variant="subtitle2" className={classes.sectionTitle}>
                Locations / Sites
              </Typography>
              <div className={classes.startFlex} style={{ flexWrap: 'wrap' }}>
                {renderSites()}
              </div>
            </div>
            <br />
            <div>
              <Typography variant="subtitle2" className={classes.sectionTitle}>
                Scientific Keywords
              </Typography>
              <div className={classes.startFlex} style={{ flexWrap: 'wrap' }}>
                {keywordChips}
              </div>
            </div>
          </Grid>
          <Grid item xs={12} sm={2}>
            <div className={classes.cardFirstColumnSection}>
              <Typography variant="subtitle2" className={classes.sectionTitle}>
                Time Range
              </Typography>
              <Typography variant="body2">
                {startYear === endYear ? startYear : `${startYear} – ${endYear}`}
              </Typography>
            </div>
            <div className={classes.cardFirstColumnSection}>
              <Typography variant="subtitle2" className={classes.sectionTitle}>
                Data Themes
              </Typography>
              <div className={classes.startFlex}>
                {themeIcons}
              </div>
            </div>
            <div className={classes.cardFirstColumnSection}>
              <Typography variant="subtitle2" className={classes.sectionTitle}>
                Version
              </Typography>
              <Typography variant="body2">
                {version || '--'}
              </Typography>
            </div>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

Dataset.propTypes = {
  uuid: PropTypes.string.isRequired,
};

export default Dataset;
