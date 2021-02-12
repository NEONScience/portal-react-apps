import React from 'react';
import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core/styles';
// import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

import Theme from 'portal-core-components/lib/components/Theme';

import PrototypeContext from '../PrototypeContext';

const { usePrototypeContextState } = PrototypeContext;

const useStyles = makeStyles((theme) => ({
  datasetCard: {
    marginBottom: theme.spacing(3),
  },
}));

const Dataset = (props) => {
  const { uuid } = props;
  const classes = useStyles(Theme);

  const [state] = usePrototypeContextState();
  const { datasets: { [uuid]: dataset } } = state;

  if (typeof dataset === 'undefined') { return null; }

  return (
    <Card className={classes.datasetCard}>
      <CardContent>
        {uuid}
        <br />
        {dataset.projectTitle}
        <br />
        {`${dataset.startYear} - ${dataset.endYear}`}
      </CardContent>
    </Card>
  );
};

Dataset.propTypes = {
  uuid: PropTypes.string.isRequired,
};

export default Dataset;
