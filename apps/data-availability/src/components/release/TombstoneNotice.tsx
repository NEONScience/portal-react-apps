import React from 'react';
import { useSelector } from 'react-redux';

import { makeStyles, Theme as MuiTheme } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';

import Theme from 'portal-core-components/lib/components/Theme';
import { NeonTheme } from 'portal-core-components/lib/components/Theme/types';
import { exists } from 'portal-core-components/lib/util/typeUtil';

import AppStateSelector from '../../selectors/app';
import { StylesHook } from '../../types/styles';
import { TombstoneNoticeState } from '../states/AppStates';
import { DataProductReleaseDoi } from '../../types/store';

const useStyles: StylesHook = makeStyles((theme: MuiTheme) => ({
  card: {
    backgroundColor: (Theme as NeonTheme).colors.BROWN[50],
    borderColor: (Theme as NeonTheme).colors.BROWN[300],
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(4),
  },
  cardHeader: {
    padding: theme.spacing(3),
    paddingBottom: 0,
  },
  cardContent: {
    paddingTop: theme.spacing(2),
  },
  doiList: {
    width: '100%',
  },
}));

const useTombstoneNoticdSelector = (): TombstoneNoticeState => useSelector(
  AppStateSelector.tombstoneNotice,
);

const TombstoneNotice: React.FC = (): JSX.Element => {
  const state: TombstoneNoticeState = useTombstoneNoticdSelector();
  const classes = useStyles(Theme);
  const { isTombstoned, focalProductReleaseDoi }: TombstoneNoticeState = state;
  if (!(isTombstoned === true) || !exists(focalProductReleaseDoi)) {
    return <></>;
  }
  let citationReleases: DataProductReleaseDoi[] = [];
  if (!Array.isArray(focalProductReleaseDoi)) {
    citationReleases.push(focalProductReleaseDoi as DataProductReleaseDoi);
  } else {
    citationReleases = focalProductReleaseDoi;
  }
  const renderTombstoneNotes = () => (
    citationReleases.map((citationRelease) => {
      let doiDisplay = ' ';
      if (citationRelease.url) {
        const doiId = citationRelease.url.split('/').slice(-2).join('/');
        doiDisplay = ` (DOI:${doiId}) `;
      }
      const tombstoneNote = (
        <>
          {/* eslint-disable react/jsx-one-expression-per-line, max-len */}
          {citationRelease.release} of this data product
          {doiDisplay} is no longer available for download.
          {/* eslint-enable react/jsx-one-expression-per-line, max-len */}
        </>
      );
      return (
        <ListItem
          dense
          disableGutters
          key={`TombstonedDoiUrlKey-${citationRelease.url}`}
          alignItems="flex-start"
          ContainerComponent="div"
        >
          <ListItemText
            primary={(
              <Typography variant="body2" color="textSecondary">
                {tombstoneNote}
              </Typography>
            )}
          />
        </ListItem>
      );
    })
  );
  return (
    <Card className={classes.card}>
      <CardHeader
        className={classes.cardHeader}
        title={(<Typography variant="h5" component="h2">Release Notice</Typography>)}
      />
      <CardContent className={classes.cardContent}>
        <List dense disablePadding className={classes.doiList}>
          {renderTombstoneNotes()}
        </List>
      </CardContent>
    </Card>
  );
};

export default TombstoneNotice;
