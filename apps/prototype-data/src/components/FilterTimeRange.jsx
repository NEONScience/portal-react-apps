import React, { useEffect, useState, useReducer } from 'react';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Slider from '@mui/material/Slider';

import moment from 'moment';

import { makeStyles } from 'portal-core-components/lib/components/Theme/makeStyles';

import PrototypeContext from '../PrototypeContext';
import FilterBase from './FilterBase';

import { FILTER_KEYS } from '../filterUtil';

const { usePrototypeContextState } = PrototypeContext;

const getYearMoment = (year) => moment(`${year}-06-01`);

const useStyles = makeStyles()((theme) => ({
  slider: {
    width: `calc(100% - ${theme.spacing(6)})`,
    marginLeft: theme.spacing(3),
    marginBottom: theme.spacing(5.5),
  },
}));

const dateRangeReducer = (state, action) => {
  const newState = { ...state };
  switch (action.type) {
    case 'setActivelySlidingTimeRange':
      newState.activelySlidingTimeRange = action.activelySlidingTimeRange;
      return newState;
    default:
      return state;
  }
};

const FilterTimeRange = () => {
  const { classes } = useStyles();

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
  const initialState = { activelySlidingTimeRange: [...currentRange] };
  const [dateRangeState, dateRangeDispatch] = useReducer(dateRangeReducer, initialState);
  const [activelySliding, setActivelySliding] = useState(false);
  const sliderValue = dateRangeState.activelySlidingTimeRange.map((x, i) => (
    selectableRange.indexOf(x || currentRange[i])
  ));
  useEffect(() => {
    if ((
      currentRange[0] !== dateRangeState.activelySlidingTimeRange[0]
        || currentRange[1] !== dateRangeState.activelySlidingTimeRange[1]
    ) && !activelySliding) {
      const action = {
        type: 'setActivelySlidingTimeRange',
        activelySlidingTimeRange: [...currentRange],
      };
      dateRangeDispatch(action);
    }
  }, [
    activelySliding,
    dateRangeState,
    dateRangeDispatch,
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
    const year = value.year();
    const newSliderValue = selectableRange.indexOf(year);

    if (![0, 1].includes(rangeIndex) || newSliderValue === -1) { return; }

    // Apply the updated filter value to state
    const newFilterValues = [
      currentRange[0] === null ? selectableRange[sliderMin] : currentRange[0],
      currentRange[1] === null ? selectableRange[sliderMax] : currentRange[1],
    ];
    newFilterValues[rangeIndex] = year;
    dispatch({ type: 'applyFilter', filterKey, filterValue: newFilterValues });
  };

  // Render active time range filter with slider and date picker inputs
  const fromMinDate = getYearMoment(selectableRange[sliderMin]);
  const fromMaxDate = getYearMoment(currentRange[1] || selectableRange[sliderMax])
    .subtract(1, 'years');
  const throughMinDate = getYearMoment(currentRange[0] || selectableRange[sliderMin])
    .add(1, 'years');
  const throughMaxDate = getYearMoment(selectableRange[sliderMax]);
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
        onPointerDown={() => { setActivelySliding(true); }}
        onChange={(event, values) => {
          const sliderRange = [
            Math.max(values[0], sliderMin),
            Math.min(values[1], sliderMax),
          ];
          const mappedDisplayRange = sliderRange.map((x) => selectableRange[x]);
          const action = {
            type: 'setActivelySlidingTimeRange',
            activelySlidingTimeRange: mappedDisplayRange,
          };
          dateRangeDispatch(action);
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

      <LocalizationProvider dateAdapter={AdapterMoment}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <DatePicker
              data-selenium="browse-data-products-page.filters.time-range.from-input"
              orientation="portrait"
              value={getYearMoment(currentRange[0] || selectableRange[sliderMin])}
              onChange={(value) => handleChangeDatePicker(0, value)}
              views={['year']}
              label="From"
              openTo="year"
              minDate={fromMinDate}
              maxDate={fromMaxDate}
              slotProps={{
                textField: {
                  size: 'small',
                  width: '100%',
                  margin: 'dense',
                  variant: 'outlined',
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <DatePicker
              data-selenium="browse-data-products-page.filters.time-range.through-input"
              orientation="portrait"
              value={getYearMoment(currentRange[1] || selectableRange[sliderMax])}
              onChange={(value) => handleChangeDatePicker(1, value)}
              views={['year']}
              label="Through"
              openTo="year"
              minDate={throughMinDate}
              maxDate={throughMaxDate}
              slotProps={{
                textField: {
                  size: 'small',
                  width: '100%',
                  margin: 'dense',
                  variant: 'outlined',
                },
              }}
            />
          </Grid>
        </Grid>
      </LocalizationProvider>

    </FilterBase>
  );
};

export default FilterTimeRange;
