import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Markdown from 'react-markdown';
import dateFormat from 'dateformat';
import truncate from 'lodash/truncate';

import { makeStyles } from '@material-ui/core/styles';

import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Hidden from '@material-ui/core/Hidden';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import ClearIcon from '@material-ui/icons/Clear';
import SearchIcon from '@material-ui/icons/Search';

import MaterialTable, { MTableToolbar } from 'material-table';

import ComponentErrorBoundary from 'portal-core-components/lib/components/Error/ComponentErrorBoundary';
import CustomComponentFallback from 'portal-core-components/lib/components/Error/CustomComponentFallback';
import SiteChip from 'portal-core-components/lib/components/SiteChip/SiteChip';
import Theme from 'portal-core-components/lib/components/Theme/Theme';

import DataProductContext from '../DataProductContext';
import Detail from './Detail';

const {
  useDataProductContextState,
  getCurrentProductFromState,
  getCurrentProductLatestAvailableDate,
  getCurrentReleaseObjectFromState,
  getLatestReleaseObjectFromState,
} = DataProductContext;

const unresolvedStyle = {
  color: '#9a3036', // portal-core-components Theme COLORS.RED[600]
  fontWeight: 700,
};

const useStyles = makeStyles((theme) => ({
  container: {
    backgroundColor: theme.palette.grey[50],
    padding: theme.spacing(2),
  },
  rowDivider: {
    marginBottom: theme.spacing(2),
  },
  unresolved: { ...unresolvedStyle },
  xsRowDivider: {
    margin: theme.spacing(1, 0),
  },
  xsRow: {
    padding: theme.spacing(2),
    borderLeft: `2px solid ${theme.palette.grey[50]}`,
    borderRight: `2px solid ${theme.palette.grey[50]}`,
    '&:nth-child(even)': {
      backgroundColor: theme.palette.grey[50],
    },
  },
  locationsContainer: {
    maxHeight: '160px',
    overflowY: 'hidden',
    position: 'relative',
  },
  locations: {
    maxHeight: '160px',
    overflowY: 'scroll',
    '& > div:not(:first-child)': {
      marginTop: theme.spacing(1.5),
    },
  },
  locationsBottom: {
    top: '159px',
    height: '1px',
    width: '100%',
    position: 'absolute',
    borderBottom: '1px dotted black',
  },
}));

const getDateSortWithNulls = (field, alternateField = null) => (
  (a, b) => {
    if (a[field] === b[field]) {
      if (!alternateField) { return 0; }
      return a[alternateField] < b[alternateField] ? -1 : 1;
    }
    if (a[field] === null) { return 1; }
    if (b[field] === null) { return -1; }
    return a[field] < b[field] ? -1 : 1;
  }
);

const IssueLogDetailTextComponent = (props) => {
  const { content } = props;
  return (
    <Typography variant="body2" component="div">
      {content}
    </Typography>
  );
};
IssueLogDetailTextComponent.propTypes = {
  content: PropTypes.string,
};
IssueLogDetailTextComponent.defaultProps = {
  content: null,
};

const MarkdownFallbackComponent = (props) => ((
  <CustomComponentFallback
    // eslint-disable-next-line react/no-unstable-nested-components
    FallbackComponent={() => ((<IssueLogDetailTextComponent {...props} />))}
  />
));

const IssueLogDetail = () => {
  const classes = useStyles(Theme);

  const [state] = useDataProductContextState();
  const product = getCurrentProductFromState(state);

  const currentReleaseObject = getCurrentReleaseObjectFromState(state);
  const latestReleaseObject = getLatestReleaseObjectFromState(state);
  const currentRelease = currentReleaseObject ? currentReleaseObject.release : null;
  const latestAvailableMonth = getCurrentProductLatestAvailableDate(state, currentRelease);
  const latestReleaseAvailableMonth = getCurrentProductLatestAvailableDate(
    state,
    latestReleaseObject ? latestReleaseObject.release : null,
  );

  const [xsSortColumn, setXsSortColumn] = useState('resolvedDate');
  const [xsSortDirection, setXsSortDirection] = useState('desc');
  const [xsSearch, setXsSearch] = useState('');

  const changeLogs = product.changeLogs || [];
  const rowGetsUnresolvedStyling = (row) => (
    !row.resolvedDate
    || (currentReleaseObject
      && (row.resolvedDate >= currentReleaseObject.generationDate)
      && (row.dateRangeStart <= latestAvailableMonth))
    || (!currentReleaseObject
      && (row.resolvedDate >= latestReleaseObject?.generationDate)
      && (row.dateRangeStart <= latestReleaseAvailableMonth))
  );

  if (!changeLogs.length) {
    return (
      <Detail
        title="Issue Log"
        content={(
          <i>No issues for this data product.</i>
        )}
      />
    );
  }

  // If we're viewing a specific release, show only applicable change logs
  // based on the latest available data atom and the start date of the entry
  const appliedChangeLogs = product.changeLogs
    .filter((value) => {
      if (!value || !value.dateRangeStart || !latestAvailableMonth || !currentRelease) {
        return true;
      }
      return value.dateRangeStart <= latestAvailableMonth;
    });

  const components = {
    Container: Box,
    // eslint-disable-next-line react/no-unstable-nested-components
    Toolbar: (props) => (
      <div style={{ marginLeft: '-24px' }}>
        <MTableToolbar {...props} />
      </div>
    ),
  };

  const formatDuration = (row) => {
    const start = (new Date(row.dateRangeStart)).getTime();
    const end = (new Date(row.dateRangeEnd)).getTime();
    const days = Math.ceil((end - start) / 86400000);
    return days === 1 ? '1 Day' : `${days} Days`;
  };

  const formatSummary = (issueString) => truncate(issueString, { length: 40, separator: /\W+/ });

  const formatDate = (dateString) => dateFormat(dateString, 'yyyy-mm-dd', true);

  const formatLocations = (locationsString) => {
    const renderLine = (line) => {
      if (!line.length) { return null; }
      const pattern = /\b([A-Z]{4})\b/g;
      const split = line.split(pattern);
      const matches = line.match(pattern);
      const nodes = split.reduce((arr, element) => {
        if (!element) return arr;
        return [
          ...arr,
          Array.isArray(matches) && matches.includes(element)
            ? <SiteChip label={element} key={element} />
            : element,
        ];
      }, []);
      return <div key={line}>{nodes}</div>;
    };
    return (
      <div className={classes.locationsContainer}>
        <div className={classes.locations}>
          {locationsString.split(/;/).filter((line) => line.length).map((line) => renderLine(line))}
        </div>
        <div className={classes.locationsBottom} />
      </div>
    );
  };

  const columns = [{
    title: 'Issue',
    field: 'issue',
    searchable: true,
    render: (row) => formatSummary(row.issue),
    cellStyle: (fieldData, rowData) => (rowData.parentIssueID
      ? {
        borderLeft: `1px dotted ${Theme.palette.grey[100]}`,
        paddingLeft: Theme.spacing(4),
        boxShadow: `${Theme.spacing(-10)}px ${Theme.spacing(0)}px ${Theme.palette.grey[50]}`,
      } : {}),
  }, {
    title: 'Resolution',
    field: 'resolution',
    searchable: true,
    hidden: true,
  }, {
    title: 'Date Reported',
    field: 'issueDate',
    type: 'date',
    sorting: true,
    render: (row) => formatDate(row.issueDate),
  }, {
    title: 'Date Resolved',
    field: 'resolvedDate',
    type: 'date',
    sorting: true,
    defaultSort: 'desc',
    customSort: getDateSortWithNulls('resolvedDate', 'issueDate'),
    render: (row) => {
      if (rowGetsUnresolvedStyling(row)) {
        if (row.resolvedDate) {
          // If we're viewing a resolved entry, not viewing a specific release
          // Show unresolved in the latest release when the resolved date
          // is after the latest release generation date and when
          // the start date of the entry is before the latest available data
          // atom of the latest release
          // This means it is resolved in some portion of the provisional data
          // and unresolved in some portion of the latest release data
          if (!currentRelease
              && latestAvailableMonth
              && latestReleaseObject
              && latestReleaseObject.release
              && (row.resolvedDate > latestReleaseObject.generationDate)
              && (row.dateRangeStart < latestReleaseAvailableMonth)) {
            return (
              <>
                <div>
                  {formatDate(row.resolvedDate)}
                </div>
                <div style={{ fontSize: '0.65rem' }}>
                  {`Resolved in provisional, unresolved in ${latestReleaseObject.release} release`}
                </div>
              </>
            );
          }
          // If we're viewing a resolved entry, viewing a specific release
          // Show resolved for next release, unresolved in current
          // This means that it is unresolved for some portion of the release data
          // and resolved after the generation date of the release
          if (currentRelease
              && (row.resolvedDate > currentReleaseObject.generationDate)
              && (row.dateRangeStart < latestAvailableMonth)) {
            return (
              <>
                <div>
                  {formatDate(row.resolvedDate)}
                </div>
                <div style={{ fontSize: '0.65rem' }}>
                  {`Resolved for next release, unresolved in ${currentRelease} release`}
                </div>
              </>
            );
          }
        }
        // If the issue is unresolved, indicate as such
        return 'unresolved';
      }
      return formatDate(row.resolvedDate);
    },
    cellStyle: (fieldData, rowData) => (
      rowGetsUnresolvedStyling(rowData) ? unresolvedStyle : {}
    ),
  }, {
    title: 'Locations Affected',
    field: 'locationAffected',
    searchable: true,
    render: (row) => formatLocations(row.locationAffected),
  }, {
    title: 'Issue Start',
    field: 'dateRangeStart',
    type: 'date',
    sorting: true,
    render: (row) => formatDate(row.dateRangeStart),
  }, {
    title: 'Issue End',
    field: 'dateRangeEnd',
    type: 'date',
    sorting: true,
    defaultSort: 'desc',
    customSort: getDateSortWithNulls('dateRangeEnd', 'dateRangeStart'),
    render: (row) => (row.dateRangeEnd ? formatDate(row.dateRangeEnd) : 'ongoing'),
    cellStyle: (fieldData) => (fieldData ? {} : unresolvedStyle),
  }];

  // This function allows us to call the renders defined for Material Table
  // above in other ways (e.g. small viewport layout)
  const renderIssueField = (issue, field) => {
    const column = columns.find((col) => field === col.field);
    if (!column) { return null; }
    return column.render(issue);
  };

  const detailPanel = [
    {
      icon: 'unfold_more',
      openIcon: 'unfold_less',
      tooltip: 'View Issue Details',
      render: (row) => {
        const {
          issue,
          resolution,
          dateRangeEnd,
        } = row;
        return (
          <>
            <Container className={classes.container}>
              <Grid container spacing={1}>
                <Grid item xs={12} sm={3} md={2}>
                  <Typography variant="subtitle2">Issue Details</Typography>
                </Grid>
                <Grid item xs={12} sm={9} md={10}>
                  <ComponentErrorBoundary
                    // eslint-disable-next-line react/no-unstable-nested-components
                    fallbackComponent={() => ((
                      <MarkdownFallbackComponent content={issue} />
                    ))}
                    onReset={() => { /* noop for boundary reset */ }}
                  >
                    <Typography variant="body2" component="div">
                      <Markdown>{issue}</Markdown>
                    </Typography>
                  </ComponentErrorBoundary>
                </Grid>
                <Grid item xs={12} sm={3} md={2}>
                  <Typography variant="subtitle2">Resolution</Typography>
                </Grid>
                <Grid item xs={12} sm={9} md={10}>
                  {resolution ? (
                    <ComponentErrorBoundary
                      // eslint-disable-next-line react/no-unstable-nested-components
                      fallbackComponent={() => ((
                        <MarkdownFallbackComponent content={resolution} />
                      ))}
                      onReset={() => { /* noop for boundary reset */ }}
                    >
                      <Typography variant="body2" component="div">
                        <Markdown>{resolution}</Markdown>
                      </Typography>
                    </ComponentErrorBoundary>
                  ) : (
                    <Typography variant="body2" className={classes.unresolved}>Unresolved</Typography>
                  )}
                </Grid>
                {dateRangeEnd ? (
                  <>
                    <Grid item xs={12} sm={3} md={2}>
                      <Typography variant="subtitle2">Duration</Typography>
                    </Grid>
                    <Grid item xs={12} sm={9} md={10}>
                      <Typography variant="body2">{formatDuration(row)}</Typography>
                    </Grid>
                  </>
                ) : null}
              </Grid>
            </Container>
            <Divider className={classes.rowDivider} />
          </>
        );
      },
    },
  ];

  const localization = {
    pagination: {
      labelRowsSelect: 'top-level issues',
    },
    toolbar: {
      searchPlaceholder: 'Search issues',
    },
  };

  // A table view does not make sense for a small viewport. Instead show the
  // issues in a paginated, serachable "table" containing one column with
  // consistent formatting.
  const renderIssueXsRow = (issue) => (
    <div
      key={issue.id}
      className={classes.xsRow}
      data-selenium="data-product-page.detail.issue-log.issue"
    >
      <Typography variant="body2">
        {issue.issue}
      </Typography>
      <Divider className={classes.xsRowDivider} />
      <Grid container spacing={1}>
        <Grid item xs={6}>
          <b>Reported</b>
          <br />
          {renderIssueField(issue, 'issueDate')}
        </Grid>
        <Grid item xs={6}>
          <b>Resolved</b>
          <br />
          {renderIssueField(issue, 'resolvedDate')}
        </Grid>
        <Grid item xs={6}>
          <b>Issue Start</b>
          <br />
          {renderIssueField(issue, 'dateRangeStart')}
        </Grid>
        <Grid item xs={6}>
          <b>Issue End</b>
          <br />
          {renderIssueField(issue, 'dateRangeEnd')}
        </Grid>
        <Grid item xs={12}>
          <b>Locations Affected:</b>
          <br />
          {renderIssueField(issue, 'locationAffected')}
        </Grid>
        <Grid item xs={12}>
          <b>Resolution</b>
          <br />
          {issue.resolution}
        </Grid>
      </Grid>
    </div>
  );

  const handleChangeXsSortColumn = (event) => setXsSortColumn(event.target.value);
  const handleChangeXsSortDirection = (event) => setXsSortDirection(event.target.value);
  const handleChangeXsSearch = (event) => setXsSearch(event.target.value);
  const handleClearXsSearch = () => setXsSearch('');

  const xsFilterOutChildIssues = (issue) => issue.parentIssueID === null;
  const xsSearchIssues = (issue) => {
    if (!xsSearch.length) { return true; }
    return (
      issue.issue.includes(xsSearch)
      || issue.resolution.includes(xsSearch)
      || issue.locationAffected.includes(xsSearch)
    );
  };
  const xsSortIssues = (issueA, issueB) => {
    const fieldA = issueA[xsSortColumn];
    const fieldB = issueB[xsSortColumn];
    if (!fieldA || !fieldB || fieldA === fieldB) { return 0; }
    const dir = xsSortDirection === 'desc' ? -1 : 1;
    return ((fieldA > fieldB ? 1 : -1) * dir);
  };

  const renderIssueXsRows = () => appliedChangeLogs
    .filter(xsFilterOutChildIssues)
    .filter(xsSearchIssues)
    .sort(xsSortIssues)
    .map((issue) => renderIssueXsRow(issue));

  const totalIssues = appliedChangeLogs
    .filter(xsFilterOutChildIssues)
    .length;

  const visibleIssues = appliedChangeLogs
    .filter(xsFilterOutChildIssues)
    .filter(xsSearchIssues)
    .length;

  const showingIssues = `Showing ${visibleIssues} of ${totalIssues} total issues.`;

  return (
    <>
      <Hidden smDown>
        <Detail seleniumKey="issue-log">
          <MaterialTable
            title=""
            components={components}
            columns={columns}
            data={appliedChangeLogs}
            parentChildData={(row, rows) => rows.find((a) => a.id === row.parentIssueID)}
            detailPanel={detailPanel}
            onRowClick={(event, rowData, togglePanel) => togglePanel()}
            localization={localization}
            options={{
              padding: 'dense',
              detailPanelColumnAlignment: 'right',
              detailPanelType: 'single',
              rowStyle: (row) => (!rowGetsUnresolvedStyling(row) ? {} : {
                backgroundColor: Theme.colors.GOLD[50],
              }),
            }}
          />
        </Detail>
      </Hidden>
      <Hidden mdUp>
        <Detail title="Issue Log" seleniumKey="issue-log">
          <Grid container spacing={1}>
            <Grid item xs={6} sm={4}>
              <FormControl fullWidth>
                <InputLabel htmlFor="sort-column">Sort By</InputLabel>
                <Select
                  value={xsSortColumn}
                  onChange={handleChangeXsSortColumn}
                  inputProps={{ name: 'sort-column', id: 'sort-column' }}
                  data-selenium="data-product-page.detail.issue-log.sort-column"
                  fullWidth
                >
                  <MenuItem value="issueDate">Date Reported</MenuItem>
                  <MenuItem value="resolvedDate">Date Resolved</MenuItem>
                  <MenuItem value="dateRangeStart">Issue Start</MenuItem>
                  <MenuItem value="dateRangeEnd">Issue End</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={4}>
              <FormControl fullWidth>
                <InputLabel htmlFor="sort-direction">Sort Direction</InputLabel>
                <Select
                  value={xsSortDirection}
                  onChange={handleChangeXsSortDirection}
                  inputProps={{ name: 'sort-direction', id: 'sort-direction' }}
                  data-selenium="data-product-page.detail.issue-log.sort-direction"
                  fullWidth
                >
                  <MenuItem value="asc">Ascending</MenuItem>
                  <MenuItem value="desc">Descending</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel htmlFor="search" shrink>Search Issues</InputLabel>
                <TextField
                  id="search"
                  label=" "
                  onChange={handleChangeXsSearch}
                  value={xsSearch}
                  data-selenium="data-product-page.detail.issue-log.search"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton aria-label="clear search term" onClick={handleClearXsSearch}>
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </FormControl>
            </Grid>
          </Grid>
          <div style={{ margin: Theme.spacing(1.5, 0) }}>
            <b>
              {showingIssues}
            </b>
            <br />
            <i>Child issues not shown.</i>
          </div>
          {renderIssueXsRows()}
        </Detail>
      </Hidden>
    </>
  );
};

export default IssueLogDetail;
