import React from 'react';
import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Skeleton from '@material-ui/lab/Skeleton';
import Typography from '@material-ui/core/Typography';
import ClearIcon from '@material-ui/icons/Clear';

import Theme from 'portal-core-components/lib/components/Theme';

const useStyles = makeStyles((theme) => ({
  filter: {
    '& ul': {
      listStyleType: 'none',
      margin: theme.spacing(0),
      paddingLeft: theme.spacing(1),
    },
  },
  titleContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
    minHeight: '30px',
  },
  titleButtonContainer: {
    display: 'flex',
    alignItems: 'center',
    '& > *': {
      marginLeft: theme.spacing(1),
    },
  },
  title: {
    fontWeight: 500,
  },
  subtitle: {
    fontSize: '0.725rem',
    color: theme.palette.grey[400],
    marginTop: Theme.spacing(1),
    marginBottom: Theme.spacing(2),
  },
}));

const FilterBase = (props) => {
  const classes = useStyles(Theme);
  const {
    title,
    subtitle,
    children,
    skeleton,
    showResetButton,
    handleResetFilter,
    additionalTitleButton,
    'data-selenium': dataSeleniumTag,
  } = props;

  let contents = children;
  if (parseInt(skeleton, 10) > 0) {
    contents = [];
    for (let i = 0; i < skeleton; i += 1) {
      contents.push(
        <Skeleton
          key={`skeleton-${i}`}
          width="100%"
          height={12}
          style={{ marginTop: Theme.spacing(2.5), marginBottom: Theme.spacing(2.5) }}
        />,
      );
    }
  }

  return (
    <div className={classes.filter} data-selenium={dataSeleniumTag}>
      <div className={classes.titleContainer}>
        {typeof title !== 'string' ? title : (
          <Typography variant="h5" component="h3" className={classes.title}>
            {title}
          </Typography>
        )}
        <div className={classes.titleButtonContainer}>
          {React.isValidElement(additionalTitleButton) && !skeleton ? additionalTitleButton : null}
          {typeof handleResetFilter === 'function' && showResetButton ? (
            <Button
              title={`Reset the ${title} Filter`}
              aria-label={`Reset the ${title} Filter`}
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<ClearIcon />}
              onClick={handleResetFilter}
            >
              Reset
            </Button>
          ) : null}
        </div>
      </div>
      {subtitle ? (
        <Typography variant="body2" className={classes.subtitle}>{subtitle}</Typography>
      ) : null}
      {contents}
    </div>
  );
};

FilterBase.propTypes = {
  title: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.string,
  ]).isRequired,
  subtitle: PropTypes.string,
  skeleton: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
  showResetButton: PropTypes.bool,
  handleResetFilter: PropTypes.func,
  additionalTitleButton: PropTypes.node,
  'data-selenium': PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([
      PropTypes.node,
      PropTypes.string,
    ])),
    PropTypes.node,
    PropTypes.string,
  ]).isRequired,
};

FilterBase.defaultProps = {
  subtitle: null,
  skeleton: false,
  showResetButton: false,
  handleResetFilter: () => {},
  additionalTitleButton: null,
  'data-selenium': null,
};

export default FilterBase;
