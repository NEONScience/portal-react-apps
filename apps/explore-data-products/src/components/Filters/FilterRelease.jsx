/* eslint-disable import/no-unresolved */
import React from 'react';
import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import InfoIcon from '@material-ui/icons/InfoOutlined';

import ReleaseFilter from 'portal-core-components/lib/components/ReleaseFilter';
import Theme from 'portal-core-components/lib/components/Theme';

import RouteService from 'portal-core-components/lib/service/RouteService';

import ExploreContext from '../../ExploreContext';
import FilterBase from '../FilterBase';

import { FILTER_KEYS, FILTER_LABELS } from '../../util/filterUtil';

const useStyles = makeStyles((theme) => ({
  title: {
    fontWeight: 500,
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: theme.spacing(1),
  },
}));

const FilterRelease = (props) => {
  const classes = useStyles(Theme);
  const { skeleton } = props;

  const [state, dispatch] = ExploreContext.useExploreContextState();
  const {
    catalogStats,
    filterValues,
    filtersApplied,
    releases,
  } = state;

  const filterKey = FILTER_KEYS.RELEASE;
  const selected = filterValues[filterKey];

  const releasesLink = (
    <Link href={RouteService.getDataRevisionsReleasePath()} target="_blank">
      Data Product Revisions and Releases
    </Link>
  );
  /* eslint-disable react/jsx-one-expression-per-line */
  const tooltip = (
    <div>
      A data release is a set of data files that is static (unchanging), always available to end
      users, and citable. See {releasesLink} for more details.
    </div>
  );
  /* eslint-enable react/jsx-one-expression-per-line */
  const title = (
    <div className={classes.titleContainer}>
      <Typography variant="h5" component="h3" className={classes.title}>
        {FILTER_LABELS[filterKey]}
      </Typography>
      <Tooltip placement="right" title={tooltip} interactive>
        <IconButton size="small" aria-label={tooltip} style={{ marginLeft: Theme.spacing(0.5) }}>
          <InfoIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </div>
  );

  return (
    <FilterBase
      title={title}
      data-selenium="browse-data-products-page.filters.release"
      handleResetFilter={() => { dispatch({ type: 'resetFilter', filterKey }); }}
      showResetButton={filtersApplied.includes(filterKey)}
    >
      {/* maxWidth of 276 to match with the wider sidebar */}
      <ReleaseFilter
        title={null}
        releases={releases}
        selected={selected}
        skeleton={!!skeleton}
        onChange={(filterValue) => dispatch({ type: 'applyFilter', filterKey, filterValue })}
        showGenerationDate
        showProductCount
        showReleaseLink
        nullReleaseProductCount={catalogStats.totalProducts}
        maxWidth={276}
        key={selected}
      />
    </FilterBase>
  );
};

FilterRelease.propTypes = {
  skeleton: PropTypes.bool,
};

FilterRelease.defaultProps = {
  skeleton: false,
};

export default FilterRelease;
