import React from 'react';
import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core/styles';
import Checkbox from '@material-ui/core/Checkbox';
import Chip from '@material-ui/core/Chip';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Typography from '@material-ui/core/Typography';

import Theme from 'portal-core-components/lib/components/Theme';

const useStyles = makeStyles((theme) => ({
  formControl: {
    width: `calc(100% + ${theme.spacing(2)}px)`,
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

const FilterCheckBox = (props) => {
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
  } = props;

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
            <div style={{ paddingRight: Theme.spacing(1) }}>{label}</div>
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

FilterCheckBox.propTypes = {
  name: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  value: PropTypes.string.isRequired,
  filterValues: PropTypes.arrayOf(PropTypes.string).isRequired,
  count: PropTypes.number,
  countTitle: PropTypes.string,
  subtitle: PropTypes.string,
  checked: PropTypes.bool,
  onApplyFilter: PropTypes.func.isRequired,
  onResetFilter: PropTypes.func.isRequired,
};

FilterCheckBox.defaultProps = {
  count: null,
  countTitle: null,
  subtitle: null,
  checked: false,
};

export default FilterCheckBox;
