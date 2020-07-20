import React from "react";

import { makeStyles } from '@material-ui/core/styles';
import Button from "@material-ui/core/Button";
import Skeleton from '@material-ui/lab/Skeleton';
import Typography from "@material-ui/core/Typography";
import ClearIcon from '@material-ui/icons/Clear';

import Theme from 'portal-core-components/lib/components/Theme';

const useStyles = makeStyles(theme => ({
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
    'data-selenium': dataSeleniumTag,
  } = props;

  let contents = children;
  if (parseInt(skeleton) > 0) {
    contents = [];
    for (let i = 0; i < skeleton; i++) {
      contents.push(
        <Skeleton
          key={`skeleton-${i}`}
          width="100%"
          height={12}
          style={{ marginTop: Theme.spacing(2.5), marginBottom: Theme.spacing(2.5) }}
        />
      );
    }
  }

  return (
    <div className={classes.filter} data-selenium={dataSeleniumTag}>
      <div className={classes.titleContainer}>
        <Typography variant="h5" component="h3" className={classes.title}>
          {title}
        </Typography>
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
      {subtitle ? (
        <Typography variant="body2" className={classes.subtitle}>{subtitle}</Typography>
      ) : null}
      {contents}
    </div>
  );
};

export default FilterBase;
