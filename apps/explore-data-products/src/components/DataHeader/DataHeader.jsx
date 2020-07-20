import React from 'react';
import moment from 'moment';

import { makeStyles } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Collapse from '@material-ui/core/Collapse';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import IconButton from "@material-ui/core/IconButton";
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import Skeleton from '@material-ui/lab/Skeleton';

import DateIcon from '@material-ui/icons/DateRange';
import ListIcon from '@material-ui/icons/List';
import NoneIcon from '@material-ui/icons/NotInterested';
import ClearIcon from '@material-ui/icons/Clear';

import Theme from 'portal-core-components/lib/components/Theme';

import { FILTER_KEYS } from '../../util/filterUtil';
import { downloadCatalog } from '../../util/catalogUtil';

const useStyles = makeStyles(theme => ({
  card: {
    marginBottom: theme.spacing(3),
    backgroundColor: theme.palette.grey[50],
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.25), 0px 1px 1px rgba(0, 0, 0, 0.25)',
  },
  divider: {
    margin: theme.spacing(2, 0, 2.5, 0),
  },
  catalogContainer: {
    marginBottom: theme.spacing(1.5),
  },
  sectionTitle: {
    fontWeight: 500,
    marginBottom: theme.spacing(1.5),
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
    fontSize: '0.875rem',
  },
  downloadContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    marginTop: theme.spacing(1),
  },
  downloadLabel: {
    color: theme.palette.grey[400],
    whiteSpace: 'nowrap',
    margin: theme.spacing(0, 0.5, 0.5, 0),
  },
  title: {
    fontWeight: 600,
    [theme.breakpoints.up('md')]: {
      marginBottom: theme.spacing(2),
      fontSize: '1.5rem',
    },
    [theme.breakpoints.down('sm')]: {
      marginRight: theme.spacing(1.5),
      fontSize: '1.3rem',
    },
  },
  summary: {
    color: theme.palette.grey[400],
    fontWeight: 400,
    fontSize: '0.85rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginTop: theme.spacing(1),
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
    neonContextState,
  } = props;

  const belowMd = useMediaQuery(Theme.breakpoints.down('sm'));
  const visible = catalogSummaryVisible || !belowMd;

  const { states: statesJSON = {} } = neonContextState.data;

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

  const getTooltip = (format, filtered) => {
    const baseTooltip = `Download a ${format} file containing catalog data (product name, description, url, etc.--no science data)`;
    return filtered
      ? `${baseTooltip} for the ${stats.products.filtered} data product${stats.products.filtered === 1 ? '' : 's'} matching currently applied filters, sorted by the current sort.`
      : `${baseTooltip} for all ${stats.products.total} data product${stats.products.total === 1 ? '' : 's'}, sorted alphabetically by name.`;
  };

  let catalogSummaryContents = (
    <Grid container spacing={3} style={{ marginBottom: Theme.spacing(belowMd ? -3 : 1) }}>
      <Grid item xs={12} sm={6}>
        <div className={classes.catalogContainer}>
          <Typography component="h3" variant="h5" className={classes.sectionTitle}>
            All Products
          </Typography>
          <div className={classes.statContainer}>
            <div className={classes.stat}>
              <ListIcon className={classes.statIcon} />
              <Typography
                variant="subtitle1"
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
                variant="subtitle1"
                className={classes.statLabel}
                data-selenium={`${selenium}.total-stats.dates-available`}
              >
                {totalAvailability}
              </Typography>
            </div>
          </div>
          <div className={classes.downloadContainer}>
            <Typography variant="caption" className={classes.downloadLabel}>
              Download Full Catalog:
            </Typography>
            <ButtonGroup
              size="small"
              color="primary"
              variant="text"
              aria-label="download full catalog (all products)"
            >
              <Tooltip title={getTooltip('CSV', false)}>
                <Button
                  {...gtmProps('csv', false)}
                  onClick={() => { handleDownload('csv', false); }}
                  aria-label="Download Full Catalog CSV"
                >
                  CSV
                </Button>
              </Tooltip>
              <Tooltip title={getTooltip('JSON', false)}>
                <Button
                  {...gtmProps('json', false)}
                  onClick={() => { handleDownload('json', false); }}
                  aria-label="Download Full Catalog JSON"
                >
                  JSON
                </Button>
              </Tooltip>
              <Tooltip title={getTooltip('PDF', false)}>
                <Button
                  {...gtmProps('pdf', false)}
                  onClick={() => { handleDownload('pdf', false); }}
                  aria-label="Download Full Catalog PDF"
                >
                  PDF
                </Button>
              </Tooltip>
            </ButtonGroup>
          </div>
        </div>
      </Grid>
      <Grid item xs={12} sm={6}>
        <div className={classes.catalogContainer} style={{ opacity: filtersApplied.length ? 1 : 0.5 }}>
          <Typography component="h3" variant="h5" className={classes.sectionTitle}>
            Filtered Products
          </Typography>
          {filtersApplied.length ? (
            <React.Fragment>
              <div className={classes.statContainer}>
                <div className={classes.stat}>
                  <ListIcon className={classes.statIcon} />
                  <Typography
                    variant="subtitle1"
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
                    variant="subtitle1"
                    className={classes.statLabel}
                    data-selenium={`${selenium}.filtered-stats.dates-available`}
                  >
                    {filteredAvailability}
                  </Typography>
                </div>
              </div>
              <div className={classes.downloadContainer}>
                <Typography variant="caption" className={classes.downloadLabel}>
                  Download Filtered Catalog:
                </Typography>
                <ButtonGroup
                  size="small"
                  color="primary"
                  variant="text"
                  aria-label="download catalog containing only filtered products"
                  disabled={!filtersApplied.length}
                >
                  <Tooltip title={getTooltip('CSV', true)}>
                    <Button
                      {...gtmProps('csv', true)}
                      onClick={() => { handleDownload('csv', true); }}
                      aria-label="Download Filtered Catalog CSV"
                    >
                      CSV
                    </Button>
                  </Tooltip>
                  <Tooltip title={getTooltip('JSON', true)}>
                    <Button
                      {...gtmProps('json', true)}
                      onClick={() => { handleDownload('json', true); }}
                      aria-label="Download Filtered Catalog JSON"
                    >
                      JSON
                    </Button>
                  </Tooltip>
                  <Tooltip title={getTooltip('PDF', true)}>
                    <Button
                      {...gtmProps('pdf', true)}
                      onClick={() => { handleDownload('pdf', true); }}
                      aria-label="Download Filtered Catalog PDF"
                    >
                      PDF
                    </Button>
                  </Tooltip>
                </ButtonGroup>
              </div>
            </React.Fragment>
          ) : (
            <div className={classes.statContainer}>
              <NoneIcon className={classes.statIcon} />
              <Typography
                variant="subtitle1"
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
          <div className={classes.catalogContainer}>
            <Typography component="h3" variant="h5" className={classes.sectionTitle}>All Products</Typography>
            <Skeleton width="70%" height={12} style={{ margin: Theme.spacing(2, 0, 1.5, 0) }} />
            <Skeleton width="85%" height={12} style={{ margin: Theme.spacing(2, 0, 1.5, 0) }} />
            <Skeleton width="80%" height={20} style={{ margin: Theme.spacing(2, 0, 1.5, 0) }} />
          </div>
        </Grid>
        <Grid item xs={12} sm={6}>
          <div className={classes.catalogContainer}>
            <Typography component="h3" variant="h5" className={classes.sectionTitle}>Filtered Products</Typography>
            <Skeleton width="70%" height={12} style={{ margin: Theme.spacing(2, 0, 1.5, 0) }} />
            <Skeleton width="85%" height={12} style={{ margin: Theme.spacing(2, 0, 1.5, 0) }} />
            <Skeleton width="80%" height={20} style={{ margin: Theme.spacing(2, 0, 1.5, 0) }} />
          </div>
        </Grid>
      </Grid>
    );
  }

  if (belowMd) {
    let summary = `${stats.products.total} total products`;
    if (filtersApplied.length) {
      summary = `${summary}, ${stats.products.filtered} filtered`;
    }
    return (
      <Card className={classes.card}>
        <CardContent data-selenium="browse-data-products-page.catalog-summary">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ flex: 1 }}>
              <Typography variant="h4" component="h2" className={classes.title}>Summary</Typography>
              <div className={classes.summary}>
                {summary}
              </div>
            </div>
            <Tooltip
              placement="left"
              title={`${catalogSummaryVisible ? 'Collapse' : 'Expand'} catalog summary and download options`}
            >
              <IconButton onClick={onToggleCatalogSummaryVisibility}>
                {catalogSummaryVisible ? <ClearIcon /> : <ListIcon />}
              </IconButton>
            </Tooltip>
          </div>
          <Collapse in={visible}>
            <Divider className={classes.divider} />
            {catalogSummaryContents}
          </Collapse>
        </CardContent>
      </Card>
    );
  }

  return catalogSummaryContents;
};

export default DataHeader;
