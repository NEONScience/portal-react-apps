import React from 'react';
import PropTypes from 'prop-types';

import makeStyles from '@mui/styles/makeStyles';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import InfoIcon from '@mui/icons-material/InfoOutlined';

import ReleaseFilter from 'portal-core-components/lib/components/ReleaseFilter';
import Theme from 'portal-core-components/lib/components/Theme';

import RouteService from 'portal-core-components/lib/service/RouteService';
import { resolveProps } from 'portal-core-components/lib/util/defaultProps';

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

const defaultProps = {
  skeleton: false,
};

const FilterRelease = (inProps) => {
  const classes = useStyles(Theme);
  const props = resolveProps(defaultProps, inProps);
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
    <Link
      href={RouteService.getDataRevisionsReleasePath()}
      target="_blank"
      underline="hover"
    >
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
      <Tooltip placement="right" title={tooltip} interactive="true">
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
        key={selected}
      />
    </FilterBase>
  );
};

FilterRelease.propTypes = {
  skeleton: PropTypes.bool,
};

export default FilterRelease;
