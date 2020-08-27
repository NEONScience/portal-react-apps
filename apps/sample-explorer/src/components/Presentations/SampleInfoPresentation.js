import React from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

import { exists } from "portal-core-components/lib/util/typeUtil";

const SampleInfoPresentation = (props) => {
  let notAvailable = (<i>{"Not Available"}</i>);

  let sampleTag = notAvailable;
  if (exists(props.search.sampleTag)) {
    sampleTag = props.search.sampleTag;
  }
  let sampleClass = notAvailable;
  if (exists(props.search.sampleClass)) {
    sampleClass = props.search.sampleClass;
  }
  let classDescription = notAvailable;
  if (exists(props.sampleClassDesc.get(props.search.sampleClass))) {
    classDescription = props.sampleClassDesc.get(props.search.sampleClass);
  }
  let barcode = notAvailable;
  if (exists(props.search.barcode)) {
    barcode = props.search.barcode;
  }
  let archiveGuid = notAvailable;
  if (exists(props.search.archiveGuid)) {
    archiveGuid = props.search.archiveGuid;
  }

  if (props.query.queryErrorStr !== "success") {
    return (<React.Fragment />);
  }

  return (
    <Grid container spacing={1}>
      <Grid item xs={12} sm={6}>
        <Typography variant="h6">
          Sample Tag
        </Typography>
        <Typography variant="body1">
          {sampleTag}
        </Typography>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Typography variant="h6">
          Sample Class
        </Typography>
        <Typography variant="body1">
          {sampleClass}
        </Typography>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Typography variant="h6">
          Barcode
        </Typography>
        <Typography variant="body1">
          {barcode}
        </Typography>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Typography variant="h6">
          Sample Class Description
        </Typography>
        <Typography variant="body1">
          {classDescription}
        </Typography>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Typography variant="h6">
          Archive Guid
        </Typography>
        <Typography variant="body1">
          {archiveGuid}
        </Typography>
      </Grid>
    </Grid>
  );
}

export default SampleInfoPresentation;
