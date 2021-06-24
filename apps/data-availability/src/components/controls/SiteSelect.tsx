import React, { useEffect, useCallback, useMemo } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { useDispatch, useSelector, batch } from 'react-redux';

import FormControl from '@material-ui/core/FormControl';
import ListItemText from '@material-ui/core/ListItemText';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Chip from '@material-ui/core/Chip';
import Link from '@material-ui/core/Link';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Autocomplete, {
  createFilterOptions,
  AutocompleteChangeDetails,
  AutocompleteChangeReason,
  AutocompleteRenderInputParams,
  AutocompleteRenderOptionState,
} from '@material-ui/lab/Autocomplete';
import Skeleton from '@material-ui/lab/Skeleton';
import {
  makeStyles,
  createStyles,
  Theme as MuiTheme,
} from '@material-ui/core/styles';

import LocationIcon from '@material-ui/icons/MyLocation';
import SearchIcon from '@material-ui/icons/Search';

import NeonContext from 'portal-core-components/lib/components/NeonContext/NeonContext';
import Theme from 'portal-core-components/lib/components/Theme/Theme';
import { AsyncStateType } from 'portal-core-components/lib/types/asyncFlow';
import { exists, existsNonEmpty, isStringNonEmpty } from 'portal-core-components/lib/util/typeUtil';

import AppStateSelector from '../../selectors/app';
import AppFlow from '../../actions/flows/app';
import { Site } from '../../types/store';
import { StylesHook } from '../../types/styles';
import { AppActionCreator } from '../../actions/app';
import { SiteSelectOption, SiteSelectState } from '../states/AppStates';
import { calcSearchSlice, SearchSlice } from '../../util/searchSlice';

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
    cardSelectedSite: {
      marginBottom: muiTheme.spacing(2),
      border: '1px solid #d7d9d9',
    },
    cardContentSelectedSite: {
      padding: muiTheme.spacing(2),
    },
    autocompleteInput: {
      padding: `${muiTheme.spacing(2)}px !important`,
    },
    autocompletePopupOpen: {
      transform: 'rotate(0) !important',
    },
    autocompleteLabel: {
      paddingLeft: `${muiTheme.spacing(1)}px !important`,
      paddingTop: '6px !important',
    },
    autocompleteLabelShrink: {
      transform: 'translate(6px, -9px) scale(0.75) !important',
    },
    siteName: {
      fontWeight: 600,
    },
    siteCodeChip: {
      color: muiTheme.palette.grey[400],
      border: `1px solid ${muiTheme.palette.grey[400]}`,
      backgroundColor: muiTheme.palette.grey[100],
      fontWeight: 600,
    },
    siteDetailsRow: {
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'space-between',
    },
    siteDetailsColumn: {
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      flexWrap: 'wrap',
    },
    siteDetail: {
      marginRight: Theme.spacing(4),
    },
    startFlex: {
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
    },
    searchHighlight: {
      fontWeight: 700,
    },
  })) as StylesHook;

const useSiteSelectSelector = (): SiteSelectState => useSelector(
  AppStateSelector.siteSelect,
);

interface SiteSelectDataOption extends SiteSelectOption {
  domainName: string;
  stateName: string;
}

const transformOptions = (
  sites: SiteSelectOption[],
  states: Record<string, unknown>,
  domains: Record<string, unknown>,
): SiteSelectDataOption[] => (
  sites
    .map((value: SiteSelectOption): SiteSelectDataOption => (
      transformOption(value, states, domains)
    ))
    .filter((a: SiteSelectDataOption): boolean => exists(a) && isStringNonEmpty(a.stateName))
    .sort((a: SiteSelectDataOption, b: SiteSelectDataOption): number => (
      a.stateName.localeCompare(b.stateName)
    ))
);

const transformOption = (
  value: SiteSelectOption,
  states: Record<string, unknown>,
  domains: Record<string, unknown>,
): SiteSelectDataOption => ({
  ...value,
  stateName: exists(states[value.stateCode])
    ? (states[value.stateCode] as Record<string, unknown>).name as string
    : value.stateCode,
  domainName: exists(domains[value.domainCode])
    ? (domains[value.domainCode] as Record<string, unknown>).name as string
    : value.domainCode,
});

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

  const [{ data: neonContextData }] = NeonContext.useNeonContextState();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { states, domains }: Record<string, unknown> = neonContextData;
  const siteOptions: SiteSelectDataOption[] = transformOptions(
    sites,
    states as Record<string, unknown>,
    domains as Record<string, unknown>,
  );

  const isLoading = (sitesFetchState === AsyncStateType.WORKING);
  const isComplete = (sitesFetchState === AsyncStateType.FULLFILLED);
  const hasSite: boolean = exists(selectedSite);
  const initialSite: Site = !hasSite
    ? sites.find((value: Site): boolean => (
      existsNonEmpty(value.dataProducts)
    )) as Site
    : selectedSite as Site;

  const selectedSiteOption: SiteSelectDataOption = transformOption(
    { ...initialSite, hasData: true },
    states as Record<string, unknown>,
    domains as Record<string, unknown>,
  );

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

  const renderOption = (
    value: SiteSelectDataOption,
    renderOptionState: AutocompleteRenderOptionState,
  ): JSX.Element => {
    const primarySlice: SearchSlice[] = calcSearchSlice(
      `${value.siteDescription}, ${value.stateCode}`,
      renderOptionState.inputValue,
    );
    const codeSlice: SearchSlice[] = calcSearchSlice(
      value.siteCode,
      renderOptionState.inputValue,
    );
    const domainSlice: SearchSlice[] = calcSearchSlice(
      `${value.domainCode} (${value.domainName})`,
      renderOptionState.inputValue,
    );
    const locSlice: SearchSlice[] = calcSearchSlice(
      `${value.siteLatitude}, ${value.siteLongitude}`,
      renderOptionState.inputValue,
    );
    const renderSlices = (slices: SearchSlice[]): JSX.Element[] => ((
      slices.map((slice: SearchSlice, idx: number): JSX.Element => ((
        // eslint-disable-next-line react/no-array-index-key
        <span key={`key-${idx}`} className={slice.found ? classes.searchHighlight : undefined}>
          {slice.text}
        </span>
      )))
    ));
    return (
      <div key={value.siteCode}>
        <ListItemText
          primary={(<div>{renderSlices(primarySlice)}</div>)}
          secondary={(
            <React.Fragment>
              <Typography variant="caption">
                {renderSlices(codeSlice)}
                {' - Domain '}
                {renderSlices(domainSlice)}
              </Typography>
              <br />
              <Typography variant="caption">
                {'Lat/Lon: '}
                {renderSlices(locSlice)}
              </Typography>
            </React.Fragment>
          )}
        />
      </div>
    );
  };
  const renderSiteSelect = (): JSX.Element => {
    if ((sites.length <= 0) || isLoading) {
      return <Skeleton variant="rect" width="100%" height={90} className={classes.skeleton} />;
    }
    return (
      <Autocomplete
        fullWidth
        openOnFocus
        blurOnSelect
        id="select-sites"
        options={siteOptions}
        value={selectedSiteOption}
        popupIcon={(<SearchIcon />)}
        classes={{
          input: classes.autocompleteInput,
          popupIndicatorOpen: classes.autocompletePopupOpen,
        }}
        groupBy={(option: SiteSelectDataOption): string => option.stateName}
        getOptionSelected={(
          option: SiteSelectDataOption,
          value: SiteSelectDataOption,
        ): boolean => (option.siteCode.localeCompare(value.siteCode) === 0)}
        getOptionDisabled={(option: SiteSelectDataOption): boolean => (
          !option.hasData
        )}
        getOptionLabel={(option: SiteSelectDataOption): string => ''}
        filterOptions={createFilterOptions({
          trim: true,
          stringify: (option: SiteSelectDataOption) => (
            `${option.siteDescription}, ${option.stateCode} ${option.siteCode} `
              + `${option.domainCode} (${option.domainName}) `
              + `${option.stateName}`
              + `${option.siteLatitude}, ${option.siteLongitude}`
          ),
        })}
        renderOption={(
          value: SiteSelectDataOption,
          renderOptionState: AutocompleteRenderOptionState,
        ): JSX.Element => renderOption(value, renderOptionState)}
        renderInput={(params: AutocompleteRenderInputParams): React.ReactNode => (
          <TextField
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...params}
            variant="outlined"
            label="Search Field Sites"
            InputLabelProps={{
              ...params.InputLabelProps,
              className: classes.autocompleteLabel,
              classes: {
                shrink: classes.autocompleteLabelShrink,
              },
            }}
          />
        )}
        onChange={(
          event: React.ChangeEvent<unknown>,
          nextValue: SiteSelectDataOption | null,
          reason: AutocompleteChangeReason,
          details?: AutocompleteChangeDetails<SiteSelectDataOption>,
        ): void => {
          if (!exists(nextValue)) return;
          const nextSite: Site = !exists(nextValue)
            ? sites.find((value: Site): boolean => true) as Site
            : sites.find((value: Site): boolean => (
              value.siteCode.localeCompare((nextValue as Site).siteCode) === 0
            )) as Site;
          handleChangeCb(nextSite, selectedRelease?.release);
        }}
      />
    );
  };

  const renderSelectedSite = (): JSX.Element => {
    if ((sites.length <= 0) || isLoading || !selectedSiteOption) {
      return (
        <Skeleton variant="rect" width="100%" height={90} className={classes.skeleton} />
      );
    }
    return (
      <Card className={classes.cardSelectedSite}>
        <CardContent className={classes.cardContentSelectedSite}>
          <div>
            <Typography variant="h6" className={classes.siteName}>
              <Link
                target="_blank"
                rel="noreferrer noopener"
                href={`https://www.neonscience.org/field-sites/${selectedSiteOption.siteCode}`}
              >
                {selectedSiteOption.siteDescription}
              </Link>
            </Typography>
            <div style={{ margin: Theme.spacing(1.5, 0, 1.5, 0) }}>
              <Chip
                size="small"
                label={selectedSiteOption.siteCode}
                className={classes.siteCodeChip}
              />
            </div>
            <div className={classes.siteDetailsRow}>
              <div className={classes.siteDetailsColumn}>
                <div className={classes.siteDetail}>
                  <Typography variant="subtitle2">Location</Typography>
                  <div className={classes.startFlex} style={{ alignItems: 'center' }}>
                    <div style={{ marginRight: '10px' }}>
                      <LocationIcon />
                    </div>
                    <Typography
                      variant="caption"
                      aria-label="Latitude / Longitude"
                      style={{ fontFamily: 'monospace', textAlign: 'right', fontSize: '0.85rem' }}
                    >
                      {selectedSiteOption.siteLatitude}
                      <br />
                      {selectedSiteOption.siteLongitude}
                    </Typography>
                  </div>
                </div>
              </div>
              <div className={classes.siteDetailsColumn}>
                <div className={classes.siteDetail}>
                  <Typography variant="subtitle2">State</Typography>
                  <Typography variant="body2">{selectedSiteOption.stateName}</Typography>
                </div>
                <div className={classes.siteDetail}>
                  <Typography variant="subtitle2">Domain</Typography>
                  <Typography variant="body2">
                    {`${selectedSiteOption.domainCode} - ${selectedSiteOption.domainName}`}
                  </Typography>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div id="site-select" className={classes.section}>
      <FormControl fullWidth>
        <Typography variant="h5" component="h3" className={classes.sectionTitle}>
          Site
        </Typography>
        {renderSiteSelect()}
      </FormControl>
      <div className={classes.infoCallout}>
        {renderSelectedSite()}
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
