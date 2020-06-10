import React from 'react';

import Checkbox from '@material-ui/core/Checkbox';
import Chip from '@material-ui/core/Chip';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import Theme from 'portal-core-components/lib/components/Theme';

const FilterCheckBox = (props) => {
  const {
    name,
    value,
    count,
    countTitle,
    subtitle,
    checked,
    filterKey,
    filterValues,
    onApplyFilter,
    onResetFilter,
  } = props;

  const showCount = typeof count !== 'undefined';
  const showSubtitle = typeof subtitle !== 'undefined';

  const onChange = (value, isChecked) => {
    const updatedFilterValue = isChecked
      ? [...filterValues, value]
      : [...filterValues.filter(v => v !== value)];
    const uniqueFilterValue = [...(new Set(updatedFilterValue))];
    if (!uniqueFilterValue.length) { return onResetFilter(filterKey); }
    return onApplyFilter(filterKey, uniqueFilterValue);
  };

  const chipContainerStyle = {
    height: '100%',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  };

  const subtitleStyle = {
    fontSize: '0.725rem',
    color: Theme.palette.grey[300],
  };

  const label = (
    <React.Fragment>
      {name}
      {showSubtitle ? (
        <Typography variant="body2" style={subtitleStyle}>
          {subtitle}
        </Typography>
      ) : null}
    </React.Fragment>
  );

  return (
    <Grid container style={{ marginBottom: Theme.spacing(showSubtitle ? 1 : 0) }}>
      <Grid item xs={showCount ? 10 : 12}>
        <FormControlLabel
          label={label}
          control={
            <Checkbox
              style={{ padding: Theme.spacing(0.5) }}
              color="primary"
              checked={checked}
              onChange={() => onChange(value, !checked)}
            />
          }
        />
      </Grid>
      {showCount ? (
        <Grid item xs={2}>
          <div
            style={chipContainerStyle}
            title={countTitle ? countTitle.replace('{n}', count) : null}
          >
            <Chip
              style={{ color: Theme.palette.grey[900] }}
              variant="outlined"
              size="small"
              label={count}
              />
          </div>
        </Grid>
      ) : null}
    </Grid>
  );
};

export default FilterCheckBox;
