import React from 'react';
import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Skeleton from '@material-ui/lab/Skeleton';

import Theme from 'portal-core-components/lib/components/Theme';

// Theme and override styles are (re)introduced here because without them
// the primary color is lost and the expansion panel layout gets messed up.
const useStyles = makeStyles(theme => ({
  expansionPanel: {
    borderRadius: Theme.spacing(0.5),
  },
  expansionPanelSummary: {
    display: 'flex !important',
    padding: `${theme.spacing(0, 3)} !important`,
  },
  expansionPanelDetails: {
    display: 'block',
    overflowX: 'hidden',
    boxSizing: 'border-box',
  },
}));

const Section = (props) => {
  const classes = useStyles(Theme);

  const {
    sectionRef,
    title,
    expanded,
    setExpanded,
    skeleton,
    children,
    ...otherProps
  } = props;

  const genericKey = (skeleton ? 'skeleton' : (title || 'generic'))
    .toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const seleniumKey = otherProps['data-selenium'] || `data-product-page.section.${genericKey}`;

  const handleToggleExpand = (event, newExpanded) => {
    setExpanded(newExpanded);
  };

  return (
    <React.Fragment>
      <ExpansionPanel
        ref={sectionRef}
        expanded={expanded}
        className={classes.expansionPanel}
        style={{ marginBottom: Theme.spacing(3) }}
        onChange={handleToggleExpand}
        TransitionProps={{ timeout: 0 }}
        data-selenium={seleniumKey}
      >
        <ExpansionPanelSummary
          className={classes.expansionPanelSummary}
          expandIcon={<ExpandMoreIcon />}
          IconButtonProps={{ 'data-selenium': `${seleniumKey}.expand` }}
        >
          {skeleton ? (
            <Skeleton width="20%" height={24} style={{ marginBottom: '16px' }} />
          ) : (
            <Typography variant="h5">{title}</Typography>
          )}
        </ExpansionPanelSummary>
        <ExpansionPanelDetails
          className={classes.expansionPanelDetails}
          data-selenium={`${seleniumKey}.contents`}
        >
          {children}
        </ExpansionPanelDetails>
      </ExpansionPanel>
    </React.Fragment>
  );
};

Section.propTypes = {
  sectionRef: PropTypes.shape({
    current: PropTypes.instanceOf(Element),
  }),
  title: PropTypes.string.isRequired,
  expanded: PropTypes.bool,
  setExpanded: PropTypes.func.isRequired,
  setVisible: PropTypes.func, // eslint-disable-line react/no-unused-prop-types
  skeleton: PropTypes.bool,
  children: PropTypes.node,
};

Section.defaultProps = {
  sectionRef: { current: null },
  expanded: true,
  setVisible: null,
  skeleton: false,
  children: null,
};

export default Section;
