/* eslint-disable react/forbid-prop-types */
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import makeStyles from '@mui/styles/makeStyles';

import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import SearchIcon from '@mui/icons-material/Search';

import LoginRequiredCard from 'portal-core-components/lib/components/Card/LoginRequiredCard';
import NeonEnvironment from 'portal-core-components/lib/components/NeonEnvironment/NeonEnvironment';
import NeonContext from 'portal-core-components/lib/components/NeonContext/NeonContext';
import Theme from 'portal-core-components/lib/components/Theme';
import { exists } from 'portal-core-components/lib/util/typeUtil';

import SelectSampleIdentifier from '../Queries/SelectSampleIdentifier';
import QueryBySampleTag from '../Queries/QueryBySampleTag';
import QueryBarcodeGuid from '../Queries/QueryBarcodeGuid';
import QueryBySampleTagAndClass from '../Queries/QueryBySampleTagAndClass';
import DownloadSampleClassesButton from '../DownloadSampleClassesButton/DownloadSampleClassesButton';

import { QUERY_TYPE } from '../../util/queryUtil';

const useStyles = makeStyles((theme) => ({
  row: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexWrap: 'wrap',
    '& > *': {
      margin: theme.spacing(0, 2, 2, 0),
    },
  },
  searchIcon: {
    marginLeft: Theme.spacing(1.5),
    marginRight: Theme.spacing(-0.5),
  },
}));

function SampleQueryPresentation(props) {
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

  const neonContextSessionState = NeonContext.useNeonContextSessionState();
  // Check preconditions for initial status
  const {
    ready: preconditionsSatisfied,
    canAccessData,
  } = neonContextSessionState;

  const submitQuery = () => {
    let url = NeonEnvironment.getFullApiPath('samples');
    const headers = {
      ...neonContextSessionState.sessionHeaders
    };
    switch (queryType) {
      case QUERY_TYPE.SAMPLE_TAG: {
        const appliedSampleTag = exists(sampleTag) ? sampleTag.trim() : null;
        const classUrl = `${url}/classes?sampleTag=${encodeURIComponent(appliedSampleTag)}`;
        const viewUrl = `${url}/view?sampleTag=${encodeURIComponent(appliedSampleTag)}`;
        const appliedSampleClass = exists(sampleClass) ? sampleClass : null;
        return onQuerySampleClassClick(
          classUrl,
          viewUrl,
          cacheControl,
          appliedSampleClass,
          headers,
        );
      }
      case QUERY_TYPE.BARCODE: {
        const appliedBarcode = exists(barcode) ? barcode.trim() : null;
        url = `${url}/view?barcode=${encodeURIComponent(appliedBarcode)}`;
        return onQueryClick(url, cacheControl, headers);
      }
      case QUERY_TYPE.ARCHIVE_GUID: {
        const appliedArchiveGuid = exists(archiveGuid) ? archiveGuid.trim() : null;
        url = `${url}/view?archiveGuid=${encodeURIComponent(appliedArchiveGuid)}`;
        return onQueryClick(url, cacheControl, headers);
      }
      default:
        return undefined;
    }
  };

  useEffect(() => {
    if (!preconditionsSatisfied) { return; }
    if (!canAccessData) { return; }
    const headers = {
      ...neonContextSessionState.sessionHeaders
    };
    if (!urlParams.parsed) {
      onSetUrlParams();
    } else if (urlParams.fetch) {
      onQuerySampleFromUrl(urlParams, headers);
    }
  }, [
    preconditionsSatisfied,
    canAccessData,
    neonContextSessionState,
    onSetUrlParams,
    onQuerySampleFromUrl,
    urlParams,
  ]);

  const renderDataAccessCard = () => {
    if (!preconditionsSatisfied) { return <></>; }
    if (canAccessData) { return <></>; }
    return (
      <LoginRequiredCard
        showValidation
        isAuthenticated={neonContextSessionState.authenticated}
        accountValidated={neonContextSessionState.accountValidated}
        accountValidationSteps={neonContextSessionState.accountValidationSteps}
      />
    );
  };

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

  const renderButtonContents = () => {
    if (!preconditionsSatisfied) {
      return (
        <React.Fragment>
          Initializing...
          <CircularProgress size={24} className={classes.searchIcon} />
        </React.Fragment>
      );
    }
    if (queryIsLoading) {
      return (
        <React.Fragment>
          Searching...
          <CircularProgress size={24} className={classes.searchIcon} />
        </React.Fragment>
      );
    }
    return (
      <React.Fragment>
        Search
        <SearchIcon fontSize="small" className={classes.searchIcon} />
      </React.Fragment>
    );
  };

  const getSearchDisabled = () => {
    return queryIsLoading || !canAccessData || !preconditionsSatisfied;
  };

  return (
    <div style={{ marginBottom: Theme.spacing(5) }} data-selenium="search-samples-section">
      <Typography variant="h4" gutterBottom>
        Search Samples
      </Typography>
      {renderDataAccessCard()}
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
            disabled={getSearchDisabled()}
            data-gtm="sample-search-form.submit-button"
            data-selenium="sample-search-form.submit-button"
          >
            {renderButtonContents()}
          </Button>
        </div>
        {renderError()}
      </div>
    </div>
  );
}

SampleQueryPresentation.propTypes = {
  query: PropTypes.shape({
    queryType: PropTypes.string,
    queryErrorStr: PropTypes.string,
    sampleClass: PropTypes.string,
    barcode: PropTypes.string,
    sampleTag: PropTypes.string,
    archiveGuid: PropTypes.string,
    queryIsLoading: PropTypes.bool,
  }).isRequired,
  cacheControl: PropTypes.object.isRequired,
  onQueryClick: PropTypes.func.isRequired,
  onQuerySampleClassClick: PropTypes.func.isRequired,
  onQuerySampleFromUrl: PropTypes.func.isRequired,
  urlParams: PropTypes.object.isRequired,
  onSetUrlParams: PropTypes.func.isRequired,
};

export default SampleQueryPresentation;
