import React, { useEffect } from "react";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import SelectSampleIdentifier from "../Queries/SelectSampleIdentifier";
import QueryBySampleTag from "../Queries/QueryBySampleTag";
import QueryBarcodeGuid from "../Queries/QueryBarcodeGuid";
import QueryBySampleTagAndClass from "../Queries/QueryBySampleTagAndClass";
import { QUERY_TYPE } from "../../util/queryUtil";
import { getFullSamplesApiPath } from "../../util/envUtil";
import { exists } from "portal-core-components/lib/util/typeUtil";

import "./SampleQueryPresentation.css"

const SampleQueryPresentation = (props) => {
  const setQueryType = (queryType) => {
    props.onSetQueryType(queryType);
  };
  const setQuerySampleTag = (sampleTag) => {
    props.onSetQuerySampleTag(sampleTag);
  };

  const submitQuery = () => {
    let url = getFullSamplesApiPath();
    switch (props.query.queryType) {
      case QUERY_TYPE.SAMPLE_TAG:
        let appliedSampleTag = null;
        if (exists(props.query.sampleTag)) {
          appliedSampleTag = props.query.sampleTag.trim();
        }
        let classUrl = url + "/classes?sampleTag=" + encodeURIComponent(appliedSampleTag)
        let viewUrl = url + "/view?sampleTag=" + encodeURIComponent(appliedSampleTag)
        let appliedSampleClass = null;
        if (exists(props.query.sampleClass)) {
          appliedSampleClass = props.query.sampleClass;
        }
        return props.onQuerySampleClassClick(classUrl, viewUrl, props.cacheControl, appliedSampleClass);
      case QUERY_TYPE.BARCODE:
        let appliedBarcode = null;
        if (exists(props.query.barcode)) {
          appliedBarcode = props.query.barcode.trim();
        }
        url = url + "/view?barcode=" + encodeURIComponent(appliedBarcode);
        return props.onQueryClick(url, props.cacheControl);
      case QUERY_TYPE.ARCHIVE_GUID:
        let appliedArchiveGuid = null;
        if (exists(props.query.archiveGuid)) {
          appliedArchiveGuid = props.query.archiveGuid.trim();
        }
        url = url + "/view?archiveGuid=" + encodeURIComponent(appliedArchiveGuid);
        return props.onQueryClick(url, props.cacheControl);
      default:
        break;
    }
  };

  useEffect(() => {
    if (!props.urlParams.parsed) {
      props.onSetUrlParams();
    } else if (props.urlParams.fetch) {
      props.onQuerySampleFromUrl(props.urlParams);
    }
  });

  let showSampleClass = false;
  if ((props.query.queryType === QUERY_TYPE.SAMPLE_TAG)
      && (props.query.sampleClasses.length > 0)) {
    showSampleClass = true;
  }

  let downloadRow = (
    <Grid item xs={12} style={{ marginTop: "5px" }}>
      <Button
        variant="contained"
        color="primary"
        onClick={() => { submitQuery(); }}>
        Search
      </Button>
    </Grid>
  );

  if (props.query.queryType === QUERY_TYPE.SAMPLE_TAG) {
    let sampleClassQuery = null;
    let queryTypeGrid = 5;
    let sampleTagGrid = 7;
    if (showSampleClass) {
      queryTypeGrid = 4;
      sampleTagGrid = 4;
      sampleClassQuery = (
        <Grid item xs={12} sm={4}>
          <div className="query-select-class">
            <QueryBySampleTagAndClass
              {...props}
              queryType={props.query.queryType}
              sampleTag={props.query.sampleTag}
              sampleClass={props.query.sampleClass}
            />
          </div>
        </Grid>
      );
    }
    return (
      <div>
        <Typography variant="h5" style={{ marginBottom: "10px" }}>
          Sample Search
        </Typography>
        <div id="sample-tag-query" className="query-container">
          <Grid container spacing={1}>
            <Grid item xs={12} sm={queryTypeGrid}>
              <div className="query-select-type">
                <SelectSampleIdentifier
                  {...props}
                  queryType={"Sample Tag"}
                  action={setQueryType}
                />
              </div>
            </Grid>
            <Grid item xs={12} sm={sampleTagGrid}>
              <div className="query-input">
                <QueryBySampleTag
                  {...props}
                  onSetQuerySampleTag={setQuerySampleTag}
                  action={props.onQuerySampleClassClick}
                />
              </div>
            </Grid>
            {sampleClassQuery}
            {downloadRow}
          </Grid>
        </div>
      </div>
    );
  } else {
    return (
      <div>
        <Typography variant="h5" style={{ marginBottom: "10px" }}>
          Sample Search
        </Typography>
        <div id="sample-barcode-guid-query" className="query-container">
          <Grid container spacing={1}>
            <Grid item xs={12} sm={5}>
              <div className="query-select-type">
                <SelectSampleIdentifier
                  {...props}
                  queryType={props.query.queryType}
                  action={setQueryType}
                />
              </div>
            </Grid>
            <Grid item xs={12} sm={7}>
              <div className="query-input">
                <QueryBarcodeGuid
                  {...props}
                  queryType={props.query.queryType}
                />
              </div>
            </Grid>
            {downloadRow}
          </Grid>
        </div>
      </div>
    );
  }
}

export default SampleQueryPresentation;
