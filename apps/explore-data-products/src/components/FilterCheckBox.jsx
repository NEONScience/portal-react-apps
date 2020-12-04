import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Checkbox from '@material-ui/core/Checkbox';
import Chip from '@material-ui/core/Chip';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Typography from '@material-ui/core/Typography';

import Theme from 'portal-core-components/lib/components/Theme';

const useStyles = makeStyles(theme => ({
  formControl: {
    width: `calc(100% + ${theme.spacing(2)}px)`,
    marginLeft: theme.spacing(-2),
    marginRight: 'unset',
    marginBottom: theme.spacing(1),
    '& > span.MuiFormControlLabel-label': {
      width: '100%',
    }
  },
  countLabel: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',    
  },
  chip: {
    cursor: 'pointer',
    color: theme.palette.grey[700],
    fontSize: '0.7rem',
  },
  title: {
    fontSize: '0.85rem',
  },
  subtitle: {
    fontSize: '0.725rem',
    color: theme.palette.grey[300],
  },
}));


const FilterCheckBox = (props) => {
  const classes = useStyles(Theme);
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

  const label = (
    <React.Fragment>
      <span className={classes.title}>{name}</span>
      {showSubtitle ? (
        <Typography variant="body2" className={classes.subtitle}>
          {subtitle}
        </Typography>
      ) : null}
    </React.Fragment>
  );

  return (
    <FormControlLabel
      className={classes.formControl}
      label={(
        showCount ? (
          <div className={classes.countLabel}>
            <div>{label}</div>
            <Chip
              className={classes.chip}
              variant="outlined"
              size="small"
              label={count}
              title={countTitle ? countTitle.replace('{n}', count) : null}
            />
          </div>
        ) : label
      )}
      control={
        <Checkbox
          color="primary"
          checked={checked}
          onChange={() => onChange(value, !checked)}
        />
      }
    />
  );
};

export default FilterCheckBox;
