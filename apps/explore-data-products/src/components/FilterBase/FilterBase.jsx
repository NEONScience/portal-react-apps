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
  title: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
    minHeight: '30px',
  },
  subtitle: {
    color: theme.palette.grey[300],
    fontSize: '0.85rem',
    marginLeft: theme.spacing(1.5),
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
      <div className={classes.title}>
        <Typography variant="h5">
          {title}
          {subtitle ? (
            <span className={classes.subtitle}>{subtitle}</span>
          ) : null}
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
      {contents}
    </div>
  );
};

export default FilterBase;
