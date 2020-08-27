import React from "react";
import { withStyles } from "@material-ui/core/styles";
import MuiExpansionPanel from "@material-ui/core/ExpansionPanel";
import MuiExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import MuiExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { getFullSamplesApiPath } from "../../util/envUtil";

const ExpansionPanel = withStyles({
  root: {
    border: "1px solid rgba(0, 0, 0, .125)",
    borderRadius: "4px",
    boxShadow: "none",
    marginTop: "10px",
    "&:not(:last-child)": {
      borderBottom: 0,
    },
    "&:before": {
      display: "none",
    },
  },
  expanded: {
    marginTop: "10px",
  },
})(MuiExpansionPanel);

const ExpansionPanelSummary = withStyles({
  root: {
    backgroundColor: "rgba(0, 0, 0, .03)",
    borderRadius: "4px",
    marginBottom: -1,
    minHeight: 56,
    "&$expanded": {
      minHeight: 56,
    },
  },
  content: {
    "&$expanded": {
      margin: "12px 0",
    },
  },
  expanded: {},
})(MuiExpansionPanelSummary);

const ExpansionPanelDetails = withStyles(theme => ({
  root: {
    display: "block",
    padding: theme.spacing(2),
  },
}))(MuiExpansionPanelDetails);

const InfoPresentation = (props) => {
  const [expanded, setExpanded] = React.useState(false);

  const downloadSupportedSampleClasses = () => {
    if (props.sampleClassDesc.size === 0) {
      let url = getFullSamplesApiPath() + "/supportedClasses"
      props.onDownloadSupportedClassesClick(url, true, true)
    } else {
      props.onDownloadSupportedClassesClick(null, false, true)
    }
  };

  const handlePanelExpanded = (expanded) => {
    setExpanded(expanded);
  };

  let sectionHeaderStyle = {
    marginTop: "20px"
  };
  let downloadLink = {
    fontSize: "1rem",
    verticalAlign: "inherit"
  };

  return (
    <div>
      <Typography variant="body1">
        The sample viewer has two primary purposes:
      </Typography>
      <ol>
        <li>
          <Typography variant="body1">
            To find the current or past physical location of a sample.
          </Typography>
        </li>
        <li>
          <Typography variant="body1">
            To view and explore the sample hierarchy.
          </Typography>
        </li>
      </ol>
      <Typography variant="body1">
        Click&nbsp;
        <Link
          component="button"
          variant="h6"
          style={downloadLink}
          onClick={() => {
            downloadSupportedSampleClasses();
          }}
        >
          here
        </Link>
        &nbsp;to download the current list of supported sample classes.
      </Typography>
      <ExpansionPanel
          expanded={expanded}
          onChange={() => { handlePanelExpanded(!expanded); }}>
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">
            <Link
              component="button"
              variant="h6"
            >
              View Additional Information
            </Link>
          </Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Typography variant="h6">
            Location
          </Typography>
          <Typography variant="body1">
            NEON samples are physical objects collected or measured and tracked over time. Most samples are
            collected and held in possession, but some samples remain in the field, such as trees and live
            mammals. Some samples are discarded after analysis, such as surface water samples, and some samples
            may be archived, such as beetles. The Sample Events table displays the location of a sample
            throughout collection and analysis, as well as a subset of other data related to the sample, such
            as its condition when received by a facility. If you are interested in requesting an archived
            sample for your research, this interface can tell you if a given sample was archived, and at what
            facility. If your primary interest is in data for analysis, use the NEON data portal:
            data.neonscience.org
          </Typography>
          <Typography variant="h6" style={sectionHeaderStyle}>
            Hierarchy
          </Typography>
          <Typography variant="body1">
            A sample hierarchy is created when a sample is subsampled, or when multiple samples are pooled,
            creating child sample(s). Any sample may have parent sample(s) and/or child sample(s). The Sample
            Graph allows a user to explore these relationships, e.g. to find all the leaf samples
            (child samples) collected from a given tree (parent sample).
          </Typography>
          <Typography variant="body1" style={sectionHeaderStyle}>
            Samples can be searched by tag, barcode, or GUID. Not every sample will have all three identifiers.
          </Typography>
          <Typography variant="h6" style={sectionHeaderStyle}>
            Searching by sample tag and class
          </Typography>
          <Typography variant="body1">
            In NEON data files, sample tags appear under field names ending in either ID or IDList, e.g. sampleID,
            sampleIDList. In the case of a list, sample tags will be separated by pipes, e.g.
            CPER_003.20140816.0710|CPER_004.20140816.0903

            Lists are not searchable as lists, each sample in a list can be searched individually.

            Duplicate tags may exist in different sample classes. Sample class refers to a category of samples,
            such that, for example, individual mosquitoes indexed during the identification process are a different
            sample class from pooled mosquitoes sent to the pathogen testing facility. Related samples at different
            levels in a sample hierarchy have different classes.

            If your query for a tag returns only one class, no further action is needed. If your query for a tag
            returns samples of different classes, consult list here (
              <Link
                component="button"
                variant="h6"
                style={downloadLink}
                onClick={() => {
                  downloadSupportedSampleClasses();
                }}
              >
                download list
              </Link>
            ) and select the class of interest.
          </Typography>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    </div>
  );
}

export default InfoPresentation;
