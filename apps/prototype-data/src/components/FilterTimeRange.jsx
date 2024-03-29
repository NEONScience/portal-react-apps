import React, { useEffect, useState } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import { MuiPickersUtilsProvider, DatePicker } from '@material-ui/pickers';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Slider from '@material-ui/core/Slider';

import MomentUtils from '@date-io/moment';
import moment from 'moment';

import Theme from 'portal-core-components/lib/components/Theme';

import PrototypeContext from '../PrototypeContext';
import FilterBase from './FilterBase';

import { FILTER_KEYS } from '../filterUtil';

const { usePrototypeContextState } = PrototypeContext;

const getYearMoment = (year) => moment(`${year}-06-01`);

const useStyles = makeStyles((theme) => ({
  slider: {
    width: `calc(100% - ${theme.spacing(6)}px)`,
    marginLeft: Theme.spacing(3),
    marginBottom: Theme.spacing(5.5),
  },
}));

const FilterTimeRange = () => {
  const classes = useStyles(Theme);

  const [state, dispatch] = usePrototypeContextState();
  const {
    filtersApplied,
    filterValues,
    filterItems,
  } = state;

  const filterKey = FILTER_KEYS.TIME_RANGE;
  const currentRange = filterValues[filterKey];
  const selectableRange = filterItems[filterKey];
  const sliderMin = 0;
  const sliderMax = selectableRange.length - 1;

  // Control the slider but do with local state. Only send slider values through the main reducer
  // when the change is committed (i.e. on mouse up / drag stop)
  const [activelySlidingTimeRange, setActivelySlidingTimeRange] = useState([...currentRange]);
  const [activelySliding, setActivelySliding] = useState(false);
  const sliderValue = activelySlidingTimeRange.map((x, i) => (
    selectableRange.indexOf(x || currentRange[i])
  ));
  useEffect(() => {
    if ((
      currentRange[0] !== activelySlidingTimeRange[0]
        || currentRange[1] !== activelySlidingTimeRange[1]
    ) && !activelySliding) {
      setActivelySlidingTimeRange([...currentRange]);
    }
  }, [
    activelySliding,
    activelySlidingTimeRange,
    setActivelySlidingTimeRange,
    currentRange,
  ]);

  const filterBaseProps = {
    title: 'Time Range',
    subtitle: 'Show datasets with any data between a min and max year',
    'data-selenium': 'prototype-datasets-page.filters.time-range',
  };

  // Render initial state (no inputs; enable button only) if not applied
  if (!selectableRange.length || !filtersApplied.includes(filterKey)) {
    const initialFilterValue = [
      selectableRange[sliderMin],
      selectableRange[sliderMax],
    ];
    return (
      <FilterBase {...filterBaseProps}>
        <Button
          title="Filter on time range…"
          aria-label="Filter on time range…"
          data-selenium="prototype-datasets-page.filters.time-range.enable-button"
          variant="outlined"
          color="primary"
          style={{ width: '100%' }}
          disabled={!selectableRange.length}
          onClick={() => {
            dispatch({ type: 'applyFilter', filterKey, filterValue: initialFilterValue });
          }}
        >
          Filter on time range…
        </Button>
      </FilterBase>
    );
  }

  const showMarksAt = [sliderMin, sliderMax];
  if (sliderMax >= 3) {
    const interval = Math.floor(sliderMax / 3);
    showMarksAt.push(interval);
    showMarksAt.push(sliderMax - interval);
  }
  const marks = selectableRange.map((label, value) => ({
    label: showMarksAt.includes(value) ? label : null,
    value,
  }));

  const handleChangeDatePicker = (rangeIndex, value) => {
    // Confirm arguments are sane
    const newSliderValue = selectableRange.indexOf(value);
    if (![0, 1].includes(rangeIndex) || newSliderValue === -1) { return; }

    // Apply the updated filter value to state
    const newFilterValues = [
      currentRange[0] === null ? selectableRange[sliderMin] : currentRange[0],
      currentRange[1] === null ? selectableRange[sliderMax] : currentRange[1],
    ];
    newFilterValues[rangeIndex] = value;
    dispatch({ type: 'applyFilter', filterKey, filterValue: newFilterValues });
  };

  // Render active time range filter with slider and date picker inputs
  return (
    <FilterBase
      {...filterBaseProps}
      handleResetFilter={() => { dispatch({ type: 'resetFilter', filterKey }); }}
      showResetButton
    >
      <Slider
        className={classes.slider}
        data-selenium="prototype-datasets-page.filters.time-range.slider"
        defaultValue={[sliderMin, sliderMax]}
        valueLabelDisplay="auto"
        min={sliderMin}
        max={sliderMax}
        marks={marks}
        value={sliderValue}
        valueLabelFormat={(x) => selectableRange[x]}
        onMouseDown={() => { setActivelySliding(true); }}
        onChange={(event, values) => {
          setActivelySlidingTimeRange([
            Math.max(values[0], sliderMin),
            Math.min(values[1], sliderMax),
          ].map((x) => selectableRange[x]));
        }}
        onChangeCommitted={(event, values) => {
          setActivelySliding(false);
          dispatch({
            type: 'applyFilter',
            filterKey,
            filterValue: [
              Math.max(values[0], sliderMin),
              Math.min(values[1], sliderMax),
            ].map((x) => selectableRange[x]),
          });
        }}
      />
      <MuiPickersUtilsProvider utils={MomentUtils}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <DatePicker
              data-selenium="browse-data-products-page.filters.time-range.from-input"
              inputVariant="outlined"
              margin="dense"
              orientation="portrait"
              value={getYearMoment(currentRange[0] || selectableRange[sliderMin])}
              onChange={(value) => handleChangeDatePicker(0, value)}
              views={['year']}
              label="From"
              openTo="year"
              minDate={getYearMoment(selectableRange[sliderMin])}
              maxDate={getYearMoment(currentRange[1] || selectableRange[sliderMax]).subtract(1, 'years')}
            />
          </Grid>
          <Grid item xs={6}>
            <DatePicker
              data-selenium="browse-data-products-page.filters.time-range.through-input"
              inputVariant="outlined"
              margin="dense"
              orientation="portrait"
              value={getYearMoment(currentRange[1] || selectableRange[sliderMax])}
              onChange={(value) => handleChangeDatePicker(1, value)}
              views={['year']}
              label="Through"
              openTo="year"
              minDate={getYearMoment(currentRange[0] || selectableRange[sliderMin]).add(1, 'years')}
              maxDate={getYearMoment(selectableRange[sliderMax])}
            />
          </Grid>
        </Grid>
      </MuiPickersUtilsProvider>
    </FilterBase>
  );
};

export default FilterTimeRange;
