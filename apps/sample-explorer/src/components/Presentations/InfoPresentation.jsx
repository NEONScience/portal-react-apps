import React from 'react';

import { makeStyles } from '@material-ui/core/styles';

import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import InfoIcon from '@material-ui/icons/InfoOutlined';

import Theme from 'portal-core-components/lib/components/Theme';

import RouteService from 'portal-core-components/lib/service/RouteService';

import DownloadSampleClassesButton from '../DownloadSampleClassesButton/DownloadSampleClassesButton';

const useStyles = makeStyles((theme) => ({
  infoIcon: {
    marginLeft: theme.spacing(1.5),
    marginBottom: theme.spacing(-0.5),
    color: theme.palette.grey[400],
  },
  accordionDetails: {
    display: 'block',
    '& tt': {
      fontWeight: 600,
      fontSize: '1.15rem',
    },
    '& h5:not(:first-child)': {
      marginTop: theme.spacing(4),
    },
  },
}));

const InfoPresentation = (props) => {
  const classes = useStyles(Theme);
  const exploreDataProductsLink = (
    <Link href={RouteService.getDataProductExplorePath()}>
      Explore Data Products
    </Link>
  );

  return (
    <div
      style={{ marginTop: Theme.spacing(2), marginBottom: Theme.spacing(5) }}
      data-selenium="info-section"
    >
      <Typography variant="subtitle1" style={{ marginBottom: Theme.spacing(3) }}>
        Find current or past physical locations of a sample and explore its place in the hierarchy
        with other samples.
      </Typography>
      <div>
        <Accordion style={{ marginBottom: '32px' }} data-selenium="general-info">
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="samples-info-content"
            id="samples-info-header"
          >
            General Info
            <InfoIcon className={classes.infoIcon} />
          </AccordionSummary>
          <AccordionDetails id="samples-info-content" className={classes.accordionDetails}>
            <Grid container spacing={3}>

              <Grid item xs={12} md={6}>
                <Typography variant="h5" gutterBottom>
                  Location
                </Typography>
                <Typography variant="body1" gutterBottom>
                  NEON samples are physical objects collected or measured and tracked over time.
                  Most samples are collected and held in possession, but some samples remain in the
                  field, such as trees and live mammals. Some samples are discarded after analysis,
                  such as surface water samples, and some samples may be archived, such as beetles.
                </Typography>
                <Typography variant="body1" gutterBottom>
                  The <b>Sample Events</b> table displays the location of a sample throughout
                  collection and analysis, as well as a subset of other data related to the sample,
                  such as its condition when received by a facility. If you are interested in
                  requesting an archived sample for your research, this interface can tell you if a
                  given sample was archived, and at what facility.
                </Typography>
                <Typography variant="body1" gutterBottom>
                  If your primary interest is in downloadable data for analysis please
                  visit {exploreDataProductsLink}.
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h5" gutterBottom>
                  Hierarchy
                </Typography>
                <Typography variant="body1" gutterBottom>
                  A sample hierarchy is created when a sample is subsampled, or when multiple
                  samples are pooled, creating child sample(s). Any sample may have parent sample(s)
                  and/or child sample(s). The <b>Sample Hierarchy Graph</b> allows a user to explore
                  these relationships, e.g. to find all the leaf samples (child samples) collected
                  from a given tree (parent sample).
                </Typography>

                <Typography variant="h5" gutterBottom>
                  Sample Classes
                </Typography>
                <Typography variant="body1" gutterBottom>
                  A sample class is a category of samples. For example, individual mosquitoes
                  indexed during the identification process are a different sample class from pooled
                  mosquitoes sent to the pathogen testing facility. Related samples at different
                  levels in a sample hierarchy have different classes.
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h5" gutterBottom>
                  Searching by Sample Identifier and Class
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Samples can be searched by tag, barcode, or GUID. Not every sample will have all
                  three identifiers.
                </Typography>
                <Typography variant="body1" gutterBottom>
                  In NEON data files, sample identifiers appear under field names ending in
                  either <tt>ID</tt> or <tt>IDList</tt> (e.g. <tt>sampleID</tt>, <tt>sampleIDList</tt>).
                  In the case of a list, sample tags will be separated by pipes,
                  e.g. <tt>CPER_003.20140816.0710|CPER_004.20140816.0903</tt>. Lists are not
                  searchable as whole lists; each sample identifier in a list must be searched for
                  individually.
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Duplicate tags may exist in different sample classes. If your query for a tag
                  returns only one class then no further action is needed. If your query for a tag
                  returns samples of different classes then <b>download and consult the current list
                  of supported sample classes</b> to determine the class of interest.
                </Typography>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </div>
      <DownloadSampleClassesButton {...props} />
    </div>
  );
};

export default InfoPresentation;
