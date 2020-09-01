import React from "react";

import { makeStyles } from '@material-ui/core/styles';

import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import InfoIcon from '@material-ui/icons/InfoOutlined';

import Theme from 'portal-core-components/lib/components/Theme';

const useStyles = makeStyles((theme) => ({
  infoIcon: {
    marginLeft: theme.spacing(1.5),
    marginBottom: theme.spacing(-0.5),
    color: theme.palette.grey[400],
  },
  ol: {
    marginBottom: theme.spacing(3),
    fontSize: '0.95rem',
    '& li': {
      marginBottom: theme.spacing(1),
    },
  },
}));

const InfoPresentation = () => {
  const classes = useStyles(Theme);
  return (
    <div data-selenium="info-section">
      <Accordion style={{ marginBottom: '32px' }} defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="taxon-info-content"
          id="taxon-info-header"
        >
          General Info
          <InfoIcon className={classes.infoIcon} />
        </AccordionSummary>
        <AccordionDetails id="taxon-info-content" style={{ padding: '0px 24px 24px 24px' }}>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={6}>
              <Typography variant="body1" style={{ marginBottom: '24px' }}>
                Taxonomic lists are compiled from a variety of published sources and are used to:
              </Typography>
              <ol className={classes.ol}>
                <li>
                  Constrain data entry to verified scientific names
                </li>
                <li>
                  Constrain data entry to known geographic ranges
                </li>
                <li>
                  Track rare, threatened and endangered species
                </li>
                <li>
                  Provide information on means of establishment (i.e. native vs introduced)
                </li>
                <li>
                  Provide higher taxonomy
                </li>
                <li>
                  Map taxonomic synonymies
                </li>
              </ol>
              <Typography variant="body1">
                The availability and accuracy of source data varies by taxonomic group. NEON anticipates
                these lists will be updated and refined over time.
              </Typography>
            </Grid>
            <Grid item xs={12} lg={6}>
              <Typography variant="body1" style={{ marginBottom: '24px' }}>
                In general, NEON field staff (aka parataxonomists) are limited to selecting only taxa whose
                geographic range extends over the sampling location. NEON staff may use either the accepted
                scientific name or any known synonym, but, for consistency, nomenclature provided on the data
                portal reflects the accepted name and its corresponding higher taxonomy (rather than the
                synonym selected).
              </Typography>
              <Typography variant="body1">
                Expert taxonomists contracted by NEON are permitted to return data with
                taxonomic identifications unconstrained by expected geographic range. Expanded data packages
                contain the exact nomenclature provided by the expert taxonomist, including their assignment
                of higher taxonomy. Basic packages reflect the accepted name (according to the NEON taxon
                list) and its corresponding higher taxonomy. See individual data products and their associated
                documentation for further details.
              </Typography>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

export default InfoPresentation;
