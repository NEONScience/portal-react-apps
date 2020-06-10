import React, { useContext, useState } from 'react';
import Markdown from 'markdown-to-jsx';
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

import Theme from 'portal-core-components/lib/components/Theme';
import SiteChip from 'portal-core-components/lib/components/SiteChip';

import Detail from './Detail';

import { StoreContext } from '../../Store';

const unresolvedStyle = {
  color: '#9a3036', // portal-core-components Theme COLORS.RED[600]
  fontWeight: 700,
};

const useStyles = makeStyles(theme => ({
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

const IssueLogDetail = () => {
  const { state } = useContext(StoreContext);
  const classes = useStyles(Theme);

  const [xsSortColumn, setXsSortColumn] = useState('issueDate');
  const [xsSortDirection, setXsSortDirection] = useState('desc');
  const [xsSearch, setXsSearch] = useState('');

  const changeLogs = (state.product.changeLogs || []);

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

  const components = {
    Container: Box,
    Toolbar: props => (
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

  const formatSummary = issueString => truncate(issueString, { length: 40, separator: /\W+/ });

  const formatDate = dateString => dateFormat(dateString, 'yyyy-mm-dd');

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
          {locationsString.split(/;/).filter(line => line.length).map(line => renderLine(line))}
        </div>
        <div className={classes.locationsBottom} />
      </div>
    );
  };

  const columns = [{
    title: 'Issue',
    field: 'issue',
    searchable: true,
    render: row => formatSummary(row.issue),
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
    defaultSort: 'desc',
    render: row => formatDate(row.issueDate),
  }, {
    title: 'Date Resolved',
    field: 'resolvedDate',
    type: 'date',
    sorting: true,
    defaultSort: 'desc',
    render: row => (row.resolvedDate ? formatDate(row.resolvedDate) : 'unresolved'),
    cellStyle: fieldData => (fieldData ? {} : unresolvedStyle),
  }, {
    title: 'Locations Affected',
    field: 'locationAffected',
    searchable: true,
    render: row => formatLocations(row.locationAffected),
  }, {
    title: 'Issue Start',
    field: 'dateRangeStart',
    type: 'date',
    sorting: true,
    defaultSort: 'desc',
    render: row => formatDate(row.dateRangeStart),
  }, {
    title: 'Issue End',
    field: 'dateRangeEnd',
    type: 'date',
    sorting: true,
    defaultSort: 'desc',
    render: row => (row.dateRangeEnd ? formatDate(row.dateRangeEnd) : 'ongoing'),
    cellStyle: fieldData => (fieldData ? {} : unresolvedStyle),
  }];

  // This function allows us to call the renders defined for Material Table
  // above in other ways (e.g. small viewport layout)
  const renderIssueField = (issue, field) => {
    const column = columns.find(col => field === col.field);
    if (!column) { return null; }
    return column.render(issue);
  };

  const detailPanel = [
    {
      icon: 'unfold_more',
      openIcon: 'unfold_less',
      tooltip: 'View Issue Details',
      render: row => (
        <React.Fragment>
          <Container className={classes.container}>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={3} md={2}>
                <Typography variant="subtitle2">Issue Details</Typography>
              </Grid>
              <Grid item xs={12} sm={9} md={10}>
                <Typography variant="body2">
                  <Markdown>{row.issue}</Markdown>
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3} md={2}>
                <Typography variant="subtitle2">Resolution</Typography>
              </Grid>
              <Grid item xs={12} sm={9} md={10}>
                {row.resolution ? (
                  <Typography variant="body2">
                    <Markdown>{row.resolution}</Markdown>
                  </Typography>
                ) : (
                  <Typography variant="body2" className={classes.unresolved}>Unresolved</Typography>
                )}
              </Grid>
              {row.dateRangeEnd ? (
                <React.Fragment>
                  <Grid item xs={12} sm={3} md={2}>
                    <Typography variant="subtitle2">Duration</Typography>
                  </Grid>
                  <Grid item xs={12} sm={9} md={10}>
                    <Typography variant="body2">{formatDuration(row)}</Typography>
                  </Grid>
                </React.Fragment>
              ) : null}
            </Grid>
          </Container>
          <Divider className={classes.rowDivider} />
        </React.Fragment>
      ),
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
  const renderIssueXsRow = issue => (
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

  const handleChangeXsSortColumn = event => setXsSortColumn(event.target.value);
  const handleChangeXsSortDirection = event => setXsSortDirection(event.target.value);
  const handleChangeXsSearch = event => setXsSearch(event.target.value);
  const handleClearXsSearch = () => setXsSearch('');

  const xsFilterOutChildIssues = issue => issue.parentIssueID === null;
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

  const renderIssueXsRows = () => changeLogs
    .filter(xsFilterOutChildIssues)
    .filter(xsSearchIssues)
    .sort(xsSortIssues)
    .map(issue => renderIssueXsRow(issue));

  const totalIssues = changeLogs
    .filter(xsFilterOutChildIssues)
    .length;

  const visibleIssues = changeLogs
    .filter(xsFilterOutChildIssues)
    .filter(xsSearchIssues)
    .length;

  const showingIssues = `Showing ${visibleIssues} of ${totalIssues} total issues.`;

  return (
    <React.Fragment>
      <Hidden smDown>
        <Detail seleniumKey="issue-log">
          <MaterialTable
            title="Issue Log"
            components={components}
            columns={columns}
            data={changeLogs}
            parentChildData={(row, rows) => rows.find(a => a.id === row.parentIssueID)}
            detailPanel={detailPanel}
            onRowClick={(event, rowData, togglePanel) => togglePanel()}
            localization={localization}
            options={{
              padding: 'dense',
              detailPanelColumnAlignment: 'right',
              detailPanelType: 'single',
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
    </React.Fragment>
  );
};

export default IssueLogDetail;
