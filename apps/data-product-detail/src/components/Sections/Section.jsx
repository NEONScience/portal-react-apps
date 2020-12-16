import React from 'react';
import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Skeleton from '@material-ui/lab/Skeleton';

import Theme from 'portal-core-components/lib/components/Theme';

// Theme and override styles are (re)introduced here because without them
// the primary color is lost and the expansion panel layout gets messed up.
const useStyles = makeStyles((theme) => ({
  section: {
    marginBottom: theme.spacing(6),
  },
}));

const Section = (props) => {
  const classes = useStyles(Theme);

  const {
    hash,
    name,
    skeleton,
    children,
    ...otherProps
  } = props;

  const genericKey = (skeleton ? 'skeleton' : (name || 'generic'))
    .toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const seleniumKey = otherProps['data-selenium'] || `data-product-page.section.${genericKey}`;

  return (
    <div className={classes.section} id={hash.slice(1)} data-selenium={seleniumKey}>
      {skeleton ? (
        <Skeleton width="20%" height={24} style={{ marginBottom: '16px' }} />
      ) : (
        <Typography variant="h4" component="h2" gutterBottom>{name}</Typography>
      )}
      {children}
    </div>
  );
};

Section.propTypes = {
  hash: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  skeleton: PropTypes.bool,
  children: PropTypes.node,
};

Section.defaultProps = {
  skeleton: false,
  children: null,
};

export default Section;
