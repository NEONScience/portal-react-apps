import React from 'react';
import { useSelector } from 'react-redux';

import { makeStyles, Theme as MuiTheme } from '@material-ui/core/styles';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';

import ReleaseNoticeCard from 'portal-core-components/lib/components/Card/ReleaseNoticeCard';
import Theme from 'portal-core-components/lib/components/Theme';
import { exists } from 'portal-core-components/lib/util/typeUtil';

import AppStateSelector from '../../selectors/app';
import { StylesHook } from '../../types/styles';
import { TombstoneNoticeState } from '../states/AppStates';
import { DataProductReleaseDoi } from '../../types/store';

const useStyles: StylesHook = makeStyles((theme: MuiTheme) => ({
  doiList: {
    width: '100%',
  },
  noticeCardDivider: {
    margin: theme.spacing(0, 0, 2, 0),
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
          <b>{citationRelease.release}</b> of this data product
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
              <Typography variant="body2" color="textPrimary">
                {tombstoneNote}
              </Typography>
            )}
          />
        </ListItem>
      );
    })
  );
  return (
    <ReleaseNoticeCard
      messageContent={(
        <>
          <Divider className={classes.noticeCardDivider} />
          <List dense disablePadding className={classes.doiList}>
            {renderTombstoneNotes()}
          </List>
        </>
      )}
    />
  );
};

export default TombstoneNotice;
