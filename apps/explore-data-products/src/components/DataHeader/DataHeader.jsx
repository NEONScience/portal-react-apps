import React from 'react';
import moment from 'moment';

import { makeStyles } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Collapse from '@material-ui/core/Collapse';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import IconButton from "@material-ui/core/IconButton";
import Paper from "@material-ui/core/Paper";
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import Skeleton from '@material-ui/lab/Skeleton';

import DateIcon from '@material-ui/icons/DateRange';
import ListIcon from '@material-ui/icons/List';
import CatalogIcon from '@material-ui/icons/DescriptionOutlined';
import NoneIcon from '@material-ui/icons/NotInterested';

import NeonContext from 'portal-core-components/lib/components/NeonContext';
import Theme from 'portal-core-components/lib/components/Theme';

import { FILTER_KEYS } from '../../util/filterUtil';
import { downloadCatalog } from '../../util/catalogUtil';

const useStyles = makeStyles(theme => ({
  divider: {
    margin: theme.spacing(2, 0),
  },
  statContainer: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  stat: {
    color: theme.palette.grey[500],
    display: 'flex',
    alignItems: 'flex-start',
    marginRight: theme.spacing(2),
  },
  statIcon: {
    color: theme.palette.grey[500],
    margin: theme.spacing(0.375, 0.5, 0, 0),
    fontSize: '1rem',
  },
  statLabel: {
    fontSize: '0.95rem',
  },
  downloadContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    marginTop: theme.spacing(1),
  },
  downloadIcon: {
    color: theme.palette.grey[300],
    marginRight: theme.spacing(0.5),
    fontSize: '1rem',
  },
  downloadLabel: {
    color: theme.palette.grey[300],
    whiteSpace: 'nowrap',
    marginRight: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
    cursor: 'help',
  },
  popper: {
    '& > div': {
      padding: theme.spacing(1, 1.5),
      fontSize: '0.85rem',
      fontWeight: 300,
      backgroundColor: theme.palette.grey[800],
    },
    '& a': {
      color: theme.palette.grey[100],
    },
  },
  paper: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    justifyContent: 'space-between',
    alignItems: 'top',
  },
  summarizeH5: {
    color: '#000000',
    display: 'inline',
    fontStyle: 'normal',
    marginRight: theme.spacing(1.5),
  },
  summarize: {
    color: theme.palette.grey[300],
    fontStyle: 'italic',
    fontWeight: 400,
    fontSize: '0.85rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));

const DataHeader = (props) => {
  const classes = useStyles(Theme);
  const {
    products,
    productOrder,
    catalogStats,
    filtersApplied,
    filterValues,
    sortMethod,
    sortDirection,
    skeleton,
    localStorageSearch,
    catalogSummaryVisible,
    onToggleCatalogSummaryVisibility,
  } = props;

  const visibleBreakpoint = useMediaQuery('(min-width:960px)');
  const visible = catalogSummaryVisible || visibleBreakpoint;

  const [{ data: neonContextData }] = NeonContext.useNeonContextState();
  const { states: statesJSON = {} } = neonContextData;

  const handleDownload = (ext, filtered) => {
    if (!filtered) {
      downloadCatalog(products, productOrder, ext);
    } else {
      downloadCatalog(products, productOrder, ext, filtersApplied, filterValues, sortMethod, sortDirection, localStorageSearch, statesJSON);
    }
  };

  const gtmProps = (ext, filtered) => ({
    'data-gtm': 'explore-data-products.download-catalog',
    'data-gtm-catalog-ext': ext,
    'data-gtm-catalog-filtered': filtered ? 'filtered' : 'full',
  });

  const stats = {
    products: {
      total: catalogStats.totalProducts,
      filtered: productOrder.length,
    },
    sites: {
      total: catalogStats.totalSites,
      filtered: 0,
    },
    dateRange: {
      total: catalogStats.totalDateRange,
      filtered: [null, null],      
    },
  };

  const filteredSites = new Set();
  const filteredDates = new Set();

  productOrder.forEach((productCode) => {
    products[productCode].filterableValues[FILTER_KEYS.SITES].forEach((site) => filteredSites.add(site));
    products[productCode].filterableValues[FILTER_KEYS.DATE_RANGE].forEach((date) => filteredDates.add(date));
  });

  stats.sites.filtered = filteredSites.size;
  stats.dateRange.filtered = Array.from(filteredDates).sort();
  stats.dateRange.filtered.splice(1, stats.dateRange.filtered.length - 2);

  const formatRange = (stat, offset) => stats.dateRange[stat][offset]
    ? moment(`${stats.dateRange[stat][offset]}-02`).format('MMM YYYY')
    : '';
  const totalAvailability = `Data available ${formatRange('total', 0)} – ${formatRange('total', 1)}`;
  const filteredAvailability = stats.dateRange.filtered.length === 2
    ? `Data available ${formatRange('filtered', 0)} – ${formatRange('filtered', 1)}`
    : 'No data available';

  const selenium = 'browse-data-products-page.data-header';

  const baseTooltip = 'Download a CSV, JSON, or PDF file containing catalog data (product name, description, url, etc.--no science data)';
  const tooltips = {
    all: `${baseTooltip} for all ${stats.products.total} data product${stats.products.total === 1 ? '' : 's'}, sorted alphabetically by name.`,
    filtered: `${baseTooltip} for the ${stats.products.filtered} data product${stats.products.filtered === 1 ? '' : 's'} matching currently applied filters, sorted by the current sort.`,
  };

  let catalogSummaryContents = (
    <Grid container spacing={3} style={{ marginBottom: Theme.spacing(1) }}>
      <Grid item xs={12} sm={6}>
        <div>
          <Typography variant={visibleBreakpoint ? 'h5' : 'h6'} gutterBottom>All Products</Typography>
          <div className={classes.statContainer}>
            <div className={classes.stat}>
              <ListIcon className={classes.statIcon} />
              <Typography
                variant="subtitle2"
                className={classes.statLabel}
                data-selenium={`${selenium}.total-stats.products-and-sites`}
              >
                {`
${stats.products.total} product${stats.products.total === 1 ? '' : 's'}
from ${stats.sites.total} site${stats.sites.total === 1 ? '' : 's'}
                `}
              </Typography>
            </div>
            <div className={classes.stat}>
              <DateIcon className={classes.statIcon} />
              <Typography
                variant="subtitle2"
                className={classes.statLabel}
                data-selenium={`${selenium}.total-stats.dates-available`}
              >
                {totalAvailability}
              </Typography>
            </div>
          </div>
          <div className={classes.downloadContainer}>
            <Tooltip title={tooltips.all} PopperProps={{ className: classes.popper }}>
              <div className={classes.downloadLabel} aria-label={tooltips.all}>
                <CatalogIcon className={classes.downloadIcon} />
                <Typography variant="button">
                  Download Full Catalog
                </Typography>
              </div>
            </Tooltip>
            <ButtonGroup
              size="small"
              color="primary"
              variant="text"
              aria-label="download full catalog (all products)"
              >
              <Button {...gtmProps('csv', false)} onClick={() => { handleDownload('csv', false); }}>CSV</Button>
              <Button {...gtmProps('json', false)} onClick={() => { handleDownload('json', false); }}>JSON</Button>
              <Button {...gtmProps('pdf', false)} onClick={() => { handleDownload('pdf', false); }}>PDF</Button>
            </ButtonGroup>
          </div>
        </div>
      </Grid>
      <Grid item xs={12} sm={6}>
        <div style={{ opacity: filtersApplied.length ? 1 : 0.5 }}>
          <Typography variant={visibleBreakpoint ? 'h5' : 'h6'} gutterBottom>Filtered Products</Typography>
          {filtersApplied.length ? (
            <React.Fragment>
              <div className={classes.statContainer}>
                <div className={classes.stat}>
                  <ListIcon className={classes.statIcon} />
                  <Typography
                    variant="subtitle2"
                    className={classes.statLabel}
                    data-selenium={`${selenium}.filtered-stats.products-and-sites`}
                  >
                    {`
${stats.products.filtered} product${stats.products.filtered === 1 ? '' : 's'}
from ${stats.sites.filtered} site${stats.sites.filtered === 1 ? '' : 's'}
                    `}
                  </Typography>
                </div>
                <div className={classes.stat}>
                  {stats.dateRange.filtered.length === 2 ? (
                    <DateIcon className={classes.statIcon} />
                  ) : (
                    <NoneIcon className={classes.statIcon} />
                  )}
                  <Typography
                    variant="subtitle2"
                    className={classes.statLabel}
                    data-selenium={`${selenium}.filtered-stats.dates-available`}
                  >
                    {filteredAvailability}
                  </Typography>
                </div>
              </div>
              <div className={classes.downloadContainer}>
                <Tooltip title={tooltips.filtered} PopperProps={{ className: classes.popper }}>
                  <div className={classes.downloadLabel} aria-label={tooltips.filtered}>
                    <CatalogIcon className={classes.downloadIcon} />
                    <Typography variant="button">
                      Download Filtered Catalog
                    </Typography>
                  </div>
                </Tooltip>
                <ButtonGroup
                  size="small"
                  color="primary"
                  variant="text"
                  aria-label="download catalog containing only filtered products"
                  disabled={!filtersApplied.length}
                >
                  <Button {...gtmProps('csv', true)} onClick={() => { handleDownload('csv', true); }}>CSV</Button>
                  <Button {...gtmProps('json', true)} onClick={() => { handleDownload('json', true); }}>JSON</Button>
                  <Button {...gtmProps('pdf', true)} onClick={() => { handleDownload('pdf', true); }}>PDF</Button>
                </ButtonGroup>
              </div>
            </React.Fragment>
          ) : (
            <div className={classes.statContainer}>
              <NoneIcon className={classes.statIcon} />
              <Typography
                variant="subtitle2"
                className={classes.statLabel}
                data-selenium={`${selenium}.filterfiltered-stats.products-and-sites`}
              >
                <i>no filters currently applied</i>
              </Typography>
            </div>
          )}
        </div>
      </Grid>
    </Grid>
  );

  if (skeleton) {
    catalogSummaryContents = (
      <Grid container spacing={3} style={{ marginBottom: Theme.spacing(1) }}>
        <Grid item xs={12} sm={6}>
          <Typography variant="h5" gutterBottom>All Products</Typography>
          <Skeleton width="80%" height={12} style={{ margin: Theme.spacing(2, 0, 2, 0) }} />
          <Skeleton width="60%" height={12} style={{ margin: Theme.spacing(3, 0, 2, 0) }} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="h5" style={{ opacity: 0.5 }} gutterBottom>Filtered Products</Typography>
          <Skeleton width="60%" height={12} style={{ margin: Theme.spacing(2, 0, 2, 0) }} />
        </Grid>
      </Grid>
    );
  }

  if (!visibleBreakpoint) {
    let summarize = `${stats.products.total} total products`;
    if (filtersApplied.length) {
      summarize = `${summarize}, ${stats.products.filtered} filtered`;
    }
    return (
      <Paper
        className={classes.paper}
        data-selenium="browse-data-products-page.catalog-summary"
      >
        <Grid container>
          <Grid item xs={9} sm={9}>
            <div className={classes.summarize}>
              <Typography variant="h5" className={classes.summarizeH5}>
                Summary
              </Typography>
              {summarize}
            </div>
          </Grid>
          <Grid item xs={3} sm={3} style={{ textAlign: "right" }}>
            <Tooltip title={`${catalogSummaryVisible ? 'Collapse' : 'Expand'} catalog summary and download options`}>
              <IconButton size="small" onClick={onToggleCatalogSummaryVisibility}>
                <ListIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
        <Collapse in={visible}>
          <Divider className={classes.divider} />
          {catalogSummaryContents}
        </Collapse>
      </Paper>
    );
  }

  return catalogSummaryContents;
};

export default DataHeader;
