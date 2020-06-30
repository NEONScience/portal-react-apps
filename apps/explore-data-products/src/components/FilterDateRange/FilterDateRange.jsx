import React, { useEffect, useState } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import { MuiPickersUtilsProvider, DatePicker } from '@material-ui/pickers';
import Button from "@material-ui/core/Button";
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';

import MomentUtils from '@date-io/moment';
import moment from 'moment';

import Theme from 'portal-core-components/lib/components/Theme';

import { FILTER_KEYS } from '../../util/filterUtil';
import FilterBase from '../FilterBase/FilterBase';

const getYearMonthMoment = yearMonth => moment(`${yearMonth}-01`);

const useStyles = makeStyles(theme => ({
  slider: {
    width: `calc(100% - ${theme.spacing(6)}px)`,
    marginLeft: Theme.spacing(3),
    marginBottom: Theme.spacing(5.5),
  },
}));

const FilterDateRange = (props) => {
  const {
    filtersApplied,
    filterItems,
    filterValues,
    onApplyFilter,
    onResetFilter,
  } = props;
  const classes = useStyles(Theme);

  const filterKey = FILTER_KEYS.DATE_RANGE;
  const currentRange = filterValues[filterKey];
  const selectableRange = filterItems[filterKey];
  const sliderMin = 0;
  const sliderMax = selectableRange.length - 1;

  // Control the slider but do with local state. Only send slider values through the main reducer
  // when the change is committed (i.e. on mouse up / drag stop)
  const [activelySlidingDateRange, setActivelySlidingDateRange] = useState([...currentRange]);
  const [activelySliding, setActivelySliding] = useState(false);
  const sliderValue = activelySlidingDateRange.map((x, i) => (
    selectableRange.indexOf(x || currentRange[i])
  ));
  useEffect(() => {
    if ((
      currentRange[0] !== activelySlidingDateRange[0]
        || currentRange[1] !== activelySlidingDateRange[1]
    ) && !activelySliding) {
      setActivelySlidingDateRange([...currentRange]);
    }
  }, [
    activelySliding,
    activelySlidingDateRange,
    setActivelySlidingDateRange,
    currentRange,
  ]);

  const renderSubtitle = () => {
    const subtitleStyle = {
      fontSize: '0.725rem',
      color: Theme.palette.grey[300],
      marginBottom: Theme.spacing(2),
    };
    return (
      <Typography variant="body2" style={subtitleStyle}>
        Show products that have any data available between two dates.
      </Typography>
    );
  };

  // Render initial state (no inputs; enable button only) if not applied
  if (!selectableRange.length || !filtersApplied.includes(filterKey)) {
    const initialFilterValue = [
      selectableRange[sliderMin],
      selectableRange[sliderMax],
    ];
    return (
      <FilterBase
        title="Available Dates"
        data-selenium="browse-data-products-page.filters.date-range"
      >
        {renderSubtitle()}
        <Button 
          title="Filter on available dates…"
          aria-label="Filter on available dates…"
          data-selenium="browse-data-products-page.filters.date-range.enable-button"
          variant="outlined"
          color="primary"
          style={{ width: '100%' }}
          disabled={!selectableRange.length}
          onClick={() => onApplyFilter(filterKey, initialFilterValue)}
        >
          Filter on available dates…
        </Button>
      </FilterBase>
    );  
  }

  const marks = [{
    value: sliderMin,
    label: selectableRange[sliderMin].substring(0, 4),
  }];
  const yearsInSlider = Math.floor(selectableRange.length / 12);
  const innerMark = Math.ceil(yearsInSlider / Math.ceil(yearsInSlider % 3 ? 2 : 3));
  for (let y = 1; y < yearsInSlider; y++) {
    marks.push({
      value: 12 * y,
      label: (y === innerMark || y === innerMark * 2) ? selectableRange[12 * y].substring(0, 4) : null,
    });
  }
  marks.push({
    value: sliderMax,
    label: selectableRange[sliderMax].substring(0, 4),
  });  

  const handleChangeDatePicker = (rangeIndex, value) => {
    // Confirm arguments are sane
    const formattedValue = value.format('YYYY-MM');
    const newSliderValue = selectableRange.indexOf(formattedValue);
    if (!formattedValue || ![0, 1].includes(rangeIndex) || newSliderValue === -1) { return; }

    // Apply the updated filter value to state
    const newFilterValues = [
      currentRange[0] === null ? selectableRange[sliderMin] : currentRange[0],
      currentRange[1] === null ? selectableRange[sliderMax] : currentRange[1],
    ];
    newFilterValues[rangeIndex] = formattedValue;
    onApplyFilter(filterKey, newFilterValues);
  };

  // Render active date range filter with slider and date picker inputs
  return (
    <FilterBase
      title="Available Dates"
      handleResetFilter={() => onResetFilter(filterKey)}
      data-selenium="browse-data-products-page.filters.date-range"
      showResetButton
    >
      {renderSubtitle()}
      <Slider
        className={classes.slider}
        data-selenium="browse-data-products-page.filters.date-range.slider"
        defaultValue={[sliderMin, sliderMax]}
        valueLabelDisplay="auto"
        min={sliderMin}
        max={sliderMax}
        marks={marks}
        value={sliderValue}
        valueLabelFormat={x => selectableRange[x]}
        onMouseDown={() => { setActivelySliding(true); }}
        onChange={(event, values) => {
          setActivelySlidingDateRange([
            Math.max(values[0], sliderMin),
            Math.min(values[1], sliderMax),
          ].map(x => selectableRange[x]));
        }}
        onChangeCommitted={(event, values) => {
          setActivelySliding(false);
          onApplyFilter(
            filterKey,
            [
              Math.max(values[0], sliderMin),
              Math.min(values[1], sliderMax),
            ].map(x => selectableRange[x]),
          );
        }}
      />
      <MuiPickersUtilsProvider utils={MomentUtils}>
        <DatePicker
          data-selenium="browse-data-products-page.filters.date-range.from-input"
          inputVariant="outlined"
          margin="dense"
          value={getYearMonthMoment(currentRange[0] || selectableRange[sliderMin])}
          onChange={(value) => handleChangeDatePicker(0, value)}
          views={['month', 'year']}
          label="From"
          openTo="month"
          minDate={getYearMonthMoment(selectableRange[sliderMin])}
          maxDate={getYearMonthMoment(currentRange[1] || selectableRange[sliderMax]).subtract(1, 'months')}
          style={{ width: '100%', marginBottom: Theme.spacing(2) }}
        />
        <DatePicker
          data-selenium="browse-data-products-page.filters.date-range.through-input"
          inputVariant="outlined"
          margin="dense"
          value={getYearMonthMoment(currentRange[1] || selectableRange[sliderMax])}
          onChange={(value) => handleChangeDatePicker(1, value)}
          views={['month', 'year']}
          label="Through"
          openTo="month"
          minDate={getYearMonthMoment(currentRange[0] || selectableRange[sliderMin]).add(1, 'months')}
          maxDate={getYearMonthMoment(selectableRange[sliderMax])}
          style={{ width: '100%' }}
        />
      </MuiPickersUtilsProvider>
    </FilterBase>
  );
};

export default FilterDateRange;
