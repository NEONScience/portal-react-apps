import React, { useEffect } from "react";

import { makeStyles } from '@material-ui/core/styles';

import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';

import Button from "@material-ui/core/Button";
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from "@material-ui/core/Typography";
import SearchIcon from '@material-ui/icons/Search';

import Theme from 'portal-core-components/lib/components/Theme';
import { exists } from "portal-core-components/lib/util/typeUtil";

import SelectSampleIdentifier from "../Queries/SelectSampleIdentifier";
import QueryBySampleTag from "../Queries/QueryBySampleTag";
import QueryBarcodeGuid from "../Queries/QueryBarcodeGuid";
import QueryBySampleTagAndClass from "../Queries/QueryBySampleTagAndClass";
import DownloadSampleClassesButton from '../DownloadSampleClassesButton/DownloadSampleClassesButton';

import { QUERY_TYPE } from "../../util/queryUtil";
import { getFullSamplesApiPath } from "../../util/envUtil";

const useStyles = makeStyles(theme => ({
  row: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexWrap: 'wrap',
    '& > *': {
      margin: theme.spacing(0, 2, 2, 0),
    }
  },
  searchIcon: {
    marginLeft: Theme.spacing(1.5),
    marginRight: Theme.spacing(-0.5),
  },
}));

const SampleQueryPresentation = (props) => {
  const {
    query: {
      queryType,
      queryErrorStr,
      sampleClass,
      barcode,
      sampleTag,
      archiveGuid,
      queryIsLoading,
    },
    cacheControl,
    onQueryClick,
    onQuerySampleClassClick,
    onQuerySampleFromUrl,
    urlParams,
    onSetUrlParams,
  } = props;

  const classes = useStyles(Theme);

  const submitQuery = () => {
    let url = getFullSamplesApiPath();
    switch (queryType) {
      case QUERY_TYPE.SAMPLE_TAG:
        const appliedSampleTag = exists(sampleTag) ? sampleTag.trim() : null;
        const classUrl = `${url}/classes?sampleTag=${encodeURIComponent(appliedSampleTag)}`;
        const viewUrl = `${url}/view?sampleTag=${encodeURIComponent(appliedSampleTag)}`;
        const appliedSampleClass = exists(sampleClass) ? sampleClass : null;
        return onQuerySampleClassClick(classUrl, viewUrl, cacheControl, appliedSampleClass);
      case QUERY_TYPE.BARCODE:
        const appliedBarcode = exists(barcode) ? barcode.trim() : null;
        url = `${url}/view?barcode=${encodeURIComponent(appliedBarcode)}`;
        return onQueryClick(url, cacheControl);
      case QUERY_TYPE.ARCHIVE_GUID:
        const appliedArchiveGuid = exists(archiveGuid) ? archiveGuid.trim() : null;
        url = `${url}/view?archiveGuid=${encodeURIComponent(appliedArchiveGuid)}`;
        return onQueryClick(url, cacheControl);
      default:
        break;
    }
  };

  useEffect(() => {
    if (!urlParams.parsed) {
      onSetUrlParams();
    } else if (urlParams.fetch) {
      onQuerySampleFromUrl(urlParams);
    }
  });

  // Error State
  const renderError = () => {
    if (queryErrorStr === null || queryErrorStr === 'success') { return null; }
    return (
      <Alert
        severity="error"
        data-selenium="sample-search-form.error"
        style={{ width: 'max-content' }}
      >
        <AlertTitle style={{ marginBottom: 0 }}>{queryErrorStr}</AlertTitle>
        {!/sample class/i.test(queryErrorStr) ? null : (
          <div style={{ marginTop: Theme.spacing(1.5) }}>
            <DownloadSampleClassesButton {...props} />
          </div>
        )}
      </Alert>
    );
  };

  return (
    <div style={{ marginBottom: Theme.spacing(5) }} data-selenium="search-samples-section">
      <Typography variant="h4" gutterBottom>
        Search Samples
      </Typography>
      <div data-selenium="sample-query-form">
        <div className={classes.row}>
          <SelectSampleIdentifier {...props} />
          <QueryBySampleTagAndClass {...props} />
        </div>
        <div className={classes.row}>
          {queryType === QUERY_TYPE.SAMPLE_TAG ? (
            <QueryBySampleTag {...props} />
          ) : (
            <QueryBarcodeGuid {...props} />
          )}
          <Button
            size="large"
            variant="contained"
            color="primary"
            onClick={submitQuery}
            disabled={queryIsLoading}
            data-selenium="sample-search-form.submit-button"
          >
            {queryIsLoading ? (
              <React.Fragment>
                Searching...
                <CircularProgress size={24} className={classes.searchIcon} />
              </React.Fragment>
            ) : (          
              <React.Fragment>
                Search
                <SearchIcon fontSize="small" className={classes.searchIcon} />
              </React.Fragment>
            )}
          </Button>
        </div>
        {renderError()}
      </div>
    </div>
  );
};

export default SampleQueryPresentation;
