import React, { useEffect, useCallback, useMemo } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { useDispatch, useSelector, batch } from 'react-redux';

import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import Skeleton from '@material-ui/lab/Skeleton';
import {
  makeStyles,
  createStyles,
  Theme as MuiTheme,
} from '@material-ui/core/styles';

import InfoCard from 'portal-core-components/lib/components/Card/InfoCard';
import Theme from 'portal-core-components/lib/components/Theme/Theme';
import { AsyncStateType } from 'portal-core-components/lib/types/asyncFlow';
import { exists, existsNonEmpty, isStringNonEmpty } from 'portal-core-components/lib/util/typeUtil';

import AppStateSelector from '../../selectors/app';
import AppFlow from '../../actions/flows/app';
import { Site } from '../../types/store';
import { StylesHook } from '../../types/styles';
import { AppActionCreator } from '../../actions/app';
import { SiteSelectOption, SiteSelectState } from '../states/AppStates';

const useStyles: StylesHook = makeStyles((muiTheme: MuiTheme) =>
  // eslint-disable-next-line implicit-arrow-linebreak
  createStyles({
    section: {
      marginBottom: muiTheme.spacing(4),
    },
    sectionTitle: {
      fontWeight: 500,
      marginBottom: muiTheme.spacing(2),
    },
    sectionSubtitle: {
      marginBottom: muiTheme.spacing(2),
    },
    infoCallout: {
      marginTop: muiTheme.spacing(3),
    },
    skeleton: {
      marginBottom: '16px',
    },
  })) as StylesHook;

const useSiteSelectSelector = (): SiteSelectState => useSelector(
  AppStateSelector.siteSelect,
);

const SiteSelect: React.FC = (): JSX.Element => {
  const state: SiteSelectState = useSiteSelectSelector();
  const classes: Record<string, string> = useStyles(Theme);
  const dispatch: Dispatch<AnyAction> = useDispatch();
  const {
    sitesFetchState,
    sites,
    selectedSite,
    selectedRelease,
  }: SiteSelectState = state;

  const isLoading = (sitesFetchState === AsyncStateType.WORKING);
  const isComplete = (sitesFetchState === AsyncStateType.FULLFILLED);
  const hasSite: boolean = exists(selectedSite);
  const initialSite: Site = !hasSite
    ? sites.find((value: Site): boolean => (
      existsNonEmpty(value.dataProducts)
    )) as Site
    : selectedSite as Site;

  const handleChangeCb = useCallback(
    (siteCb: Site, releaseCb?: string) => (
      batch(() => {
        dispatch(AppActionCreator.setSelectedSite(siteCb));
        dispatch(AppFlow.fetchFocalSite.asyncAction({
          siteCode: siteCb.siteCode,
          release: releaseCb,
        }));
      })
    ),
    [dispatch],
  );

  useEffect(
    () => {
      if (!hasSite && isComplete) {
        handleChangeCb(initialSite, selectedRelease?.release);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch, isComplete],
  );

  const renderSiteSelect = (): JSX.Element => {
    if ((sites.length <= 0) || isLoading) {
      return <Skeleton variant="rect" width="100%" height={90} className={classes.skeleton} />;
    }
    return (
      <Select
        fullWidth
        variant="outlined"
        value={initialSite.siteCode}
        onChange={(event: React.ChangeEvent<{ value: unknown }>): void => {
          const nextSite: Site = !isStringNonEmpty(event.target.value)
            ? sites.find((value: Site): boolean => true) as Site
            : sites.find((value: Site): boolean => (
              value.siteCode === event.target.value
            )) as Site;
          handleChangeCb(nextSite, selectedRelease?.release);
        }}
      >
        {sites.map((value: SiteSelectOption): JSX.Element => ((
          <MenuItem
            key={value.siteCode}
            value={value.siteCode}
            disabled={!value.hasData}
          >
            <ListItemText primary={value.siteDescription} secondary={value.siteCode} />
          </MenuItem>
        )))}
      </Select>
    );
  };

  const renderCallout = (): JSX.Element => {
    if ((sites.length <= 0) || isLoading) {
      return <Skeleton variant="rect" width="100%" height={90} className={classes.skeleton} />;
    }
    return (
      <InfoCard
        titleContent={(
          <Typography variant="subtitle2" component="div">
            Learn more about this field site by viewing the field site page:&nbsp;
            <Link
              target="_blank"
              rel="noreferrer noopener"
              href={`https://www.neonscience.org/field-sites/${initialSite.siteCode}`}
            >
              {initialSite.siteCode}
            </Link>
          </Typography>
        )}
      />
    );
  };

  return (
    <div id="site-select" className={classes.section}>
      <FormControl fullWidth>
        <Typography variant="h5" component="h3" className={classes.sectionTitle}>
          Site
        </Typography>
        <Typography variant="subtitle1" className={classes.sectionSubtitle}>
          Choose a field site to view availability
        </Typography>
        {renderSiteSelect()}
      </FormControl>
      <div className={classes.infoCallout}>
        {renderCallout()}
      </div>
    </div>
  );
};

const SiteSelectMemo = (): JSX.Element => (
  useMemo(
    () => (<SiteSelect />),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [useSiteSelectSelector()],
  )
);

export default SiteSelectMemo;
