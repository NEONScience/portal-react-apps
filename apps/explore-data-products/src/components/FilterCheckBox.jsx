import React from 'react';

import makeStyles from '@mui/styles/makeStyles';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';

import Theme from 'portal-core-components/lib/components/Theme';
import { resolveProps } from 'portal-core-components/lib/util/defaultProps';

const useStyles = makeStyles((theme) => ({
  formControl: {
    width: `calc(100% + ${theme.spacing(2)})`,
    marginLeft: theme.spacing(-2),
    marginRight: 'unset',
    marginBottom: theme.spacing(1),
    '& > span.MuiFormControlLabel-label': {
      width: '100%',
    },
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

const defaultProps = {
  count: null,
  countTitle: null,
  subtitle: null,
  checked: false,
};

const FilterCheckBox = (inProps) => {
  const classes = useStyles(Theme);
  const {
    name,
    value,
    count,
    countTitle,
    subtitle,
    checked,
    filterValues,
    onApplyFilter,
    onResetFilter,
  } = resolveProps(defaultProps, inProps);

  const showCount = typeof count !== 'undefined';
  const showSubtitle = typeof subtitle !== 'undefined';

  const onChange = (isChecked) => {
    const updatedFilterValue = isChecked
      ? [...filterValues, value]
      : [...filterValues.filter((v) => v !== value)];
    const uniqueFilterValue = [...(new Set(updatedFilterValue))];
    if (!uniqueFilterValue.length) { return onResetFilter(); }
    return onApplyFilter(uniqueFilterValue);
  };

  const label = (
    <>
      <span className={classes.title}>{name}</span>
      {showSubtitle ? (
        <Typography variant="body2" className={classes.subtitle}>
          {subtitle}
        </Typography>
      ) : null}
    </>
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
      control={(
        <Checkbox
          color="primary"
          checked={checked}
          onChange={() => onChange(!checked)}
        />
      )}
    />
  );
};

export default FilterCheckBox;
