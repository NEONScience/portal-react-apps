import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

import ReleaseFilter from 'portal-core-components/lib/components/ReleaseFilter';
import Theme from 'portal-core-components/lib/components/Theme';

const useStyles = makeStyles(theme => ({
  releaseCard: {
    backgroundColor: Theme.colors.BROWN[50],
    borderColor: Theme.colors.BROWN[300],
    marginBottom: theme.spacing(4),
  },
  releaseAttribTitle: {
    marginRight: theme.spacing(1),
  },
  releaseAttribValue: {
    fontWeight: 600,
  },
}));

const ReleaseCard = (props) => {
  const classes = useStyles(Theme);
  const {
    releases,
    currentRelease,
    onChangeRelease,
    catalogStats,
    skeleton,
  } = props;

  return (
    <Card className={classes.releaseCard}>
      <CardContent>
        <ReleaseFilter
          key={currentRelease}
          skeleton={!!skeleton}
          selected={currentRelease}
          releases={releases}
          onChange={onChangeRelease}
          nullReleaseProductCount={catalogStats.totalProducts}
          showGenerationDate
          showProductCount
          horizontal
        />
      </CardContent>
    </Card>
  );
};

export default ReleaseCard;
