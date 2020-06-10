import React, {
  useContext,
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
} from 'react';

import Stickyfill from 'stickyfilljs';

import { makeStyles } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import AppBar from '@material-ui/core/AppBar';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import Paper from '@material-ui/core/Paper';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Typography from '@material-ui/core/Typography';
import Skeleton from '@material-ui/lab/Skeleton';

import Theme from 'portal-core-components/lib/components/Theme';
import NeonPage from 'portal-core-components/lib/components/NeonPage';
import DownloadDataContext from 'portal-core-components/lib/components/DownloadDataContext';

import SkeletonSection from './Sections/SkeletonSection';
import AboutSection from './Sections/AboutSection';
import CollectionAndProcessingSection from './Sections/CollectionAndProcessingSection';
import AvailabilitySection from './Sections/AvailabilitySection';
import VisualizationsSection from './Sections/VisualizationsSection';
// import ContentsSection from './Sections/ContentsSection';
// import UsageSection from './Sections/UsageSection';

import { StoreContext } from '../Store';

const useStyles = makeStyles(theme => ({
  contents: {
    padding: theme.spacing(3),
    position: 'sticky',
    top: theme.spacing(3),
  },
  divider: {
    margin: theme.spacing(2, 0),
  },
  mdUpTab: {
    '& span': {
      alignItems: 'flex-start',
      overflow: 'hidden',
      textAlign: 'left',
    },
  },
  smDownContentsDiv: {
    flexGrow: 1,
    width: '100%',
    backgroundColor: theme.palette.background.paper,
    borderRadius: Theme.spacing(0.5),
  },
}));

const useTabsStyles = makeStyles(theme => ({
  root: {
    '& > div > span': {
      right: 'auto',
      height: theme.spacing(0.5),
    },
    '& button:hover': {
      backgroundColor: theme.palette.grey[100],
    },
  },
  /*
  scrollButtons: {
    backgroundColor: theme.palette.grey[50],
    borderRadius: Theme.spacing(0.5),
  },
  */
}));

let scrollTimeout = null;

const isAtMaxScroll = () => {
  const windowHeight = window.innerHeight
    || (document.documentElement || document.body).clientHeight;
  const documentHeight = Math.max(
    document.body.scrollHeight, document.documentElement.scrollHeight,
    document.body.offsetHeight, document.documentElement.offsetHeight,
    document.body.clientHeight, document.documentElement.clientHeight,
  );
  const scrollTop = window.pageYOffset
    || (document.documentElement || document.body.parentNode || document.body).scrollTop;
  const trackLength = documentHeight - windowHeight;
  return (scrollTop / trackLength) >= 0.99;
};

const DataProductPage = (props) => {
  const { loading, error } = props;
  const skeleton = loading || error;

  const { state } = useContext(StoreContext);
  const classes = useStyles(Theme);
  const tabsClasses = useTabsStyles(Theme);
  const belowMd = useMediaQuery(Theme.breakpoints.down('sm'));
  const breakOffset = belowMd ? parseInt(Theme.spacing(7), 10) : 0;

  const breadcrumbs = [
    { name: 'Data Products', href: '/data-products/explore' },
  ];
  if (state.product) {
    breadcrumbs.push({ name: state.product.productCode });
  }

  const title = state.product ? state.product.productName : null;

  const [currentSection, setCurrentSection] = useState('about');
  const sections = {
    about: {
      title: 'About',
      tag: AboutSection,
      ref: useRef(null),
      visible: true,
    },
    collection: {
      title: 'Collection and Processing',
      tag: CollectionAndProcessingSection,
      ref: useRef(null),
      visible: true,
    },
    availability: {
      title: 'Availability and Download',
      tag: AvailabilitySection,
      ref: useRef(null),
      visible: true,
    },
    visualizations: {
      title: 'Visualizations',
      tag: VisualizationsSection,
      ref: useRef(null),
    },
  };

  // Track expanded as state for all sections
  [sections.about.expanded, sections.about.setExpanded] = useState(true);
  [sections.collection.expanded, sections.collection.setExpanded] = useState(true);
  [sections.availability.expanded, sections.availability.setExpanded] = useState(true);
  [sections.visualizations.expanded, sections.visualizations.setExpanded] = useState(true);

  // Track visible as state for all sections that are not always visible
  [sections.visualizations.visible, sections.visualizations.setVisible] = useState(false);

  const handleTabChange = (event, newTab) => {
    const getScrollPosition = section => (
      sections[section].ref.current
        ? sections[section].ref.current.offsetTop - Theme.spacing(1) - breakOffset
        : 0
    );
    if (newTab === currentSection) { return; }
    sections[newTab].setExpanded(true);
    if (scrollTimeout) { window.clearTimeout(scrollTimeout); }
    scrollTimeout = window.setTimeout(() => {
      window.location.hash = newTab;
      window.scrollTo(0, getScrollPosition(newTab));
    }, 50);
    setCurrentSection(newTab);
  };

  /*
    If the page has loaded successfully then append the product name to to the page title
    and handle a tab change from the URL hash, if present
  */
  useLayoutEffect(() => {
    if (loading || error || !state.product) { return; }
    document.title = `NEON | ${state.product.productName}`;
    const hash = window.location.hash ? window.location.hash.slice(1) : null;
    if (hash && Object.keys(sections).includes(hash)) {
      handleTabChange({}, hash);
    }
  }, [loading, error]); // eslint-disable-line react-hooks/exhaustive-deps

  /*
    CSS "position: sticky" polyfill implementation for Contents paper on IE 11.
    This is gross. Not only is the need for the CSS polyfill annoying, but React
    behaves unexpectedly when passing a ref as a dependency to an effect like this.
    The ref doesn't _actually_ get populated with a DOM node until after useEffect
    runs on load, and the dependency array isn't smart enough to see it needs to
    be run again. No known workarounds other then to give the render loop time to
    "really" finish with a one second timeout. /barf
    Note that this only matters for IE 11. All other browsers do this with one line of CSS.
  */
  const contentsRef = useRef(null);
  useEffect(() => {
    setTimeout(() => {
      if (contentsRef.current) {
        Stickyfill.add(contentsRef.current);
      }
    }, 1000);
  }, [contentsRef]);

  useLayoutEffect(() => {
    // If only one section is expanded make sure currentSection is set to it
    const expandedSections = Object.keys(sections).filter(section => sections[section].expanded);
    if (expandedSections.length === 1 && expandedSections[0] !== currentSection) {
      setCurrentSection(expandedSections[0]);
    }
    // Update the highlighted tab as the window is scrolled
    const getScrollBreak = section => (
      sections[section].ref.current.offsetTop - Theme.spacing(16) - breakOffset
    );
    const handleScroll = () => {
      const scrollBreaks = [];
      Object.keys(sections)
        .filter(section => sections[section].visible && sections[section].expanded)
        .forEach((section) => {
          scrollBreaks.push({
            y: getScrollBreak(section),
            section,
          });
        });
      // Determine the current scrolled-to section. If at the max scroll always
      // go to the last expanded section. Otherwise choose from scroll position
      // relative to scroll breakpoints.
      const scrollToSection = isAtMaxScroll()
        ? scrollBreaks[scrollBreaks.length - 1].section
        : scrollBreaks.reduce((acc, curr) => (
          window.scrollY >= curr.y ? curr.section : acc
        ), 'about');
      if (scrollToSection !== currentSection) {
        setCurrentSection(scrollToSection);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [sections, currentSection, setCurrentSection, breakOffset]);

  const renderSections = () => Object.keys(sections).map((section) => {
    const SectionTag = skeleton && sections[section].visible
      ? SkeletonSection
      : sections[section].tag;
    const sectionProps = {
      sectionRef: sections[section].ref,
      title: sections[section].title,
      expanded: sections[section].expanded,
      setExpanded: sections[section].setExpanded,
      setVisible: sections[section].setVisible || null,
    };
    return (
      <SectionTag
        key={section}
        data-selenium={`data-product-page.section.${section}`}
        {...sectionProps}
      />
    );
  });

  const renderMdUpContents = () => (
    <Paper
      ref={contentsRef}
      className={classes.contents}
      data-selenium="data-product-page.contents"
    >
      { skeleton ? (
        <Skeleton width="80%" height={24} />
      ) : (
        <Typography variant="h5">Contents</Typography>
      )}
      <Divider className={classes.divider} />
      <Tabs
        orientation="vertical"
        aria-label="Contents"
        indicatorColor="primary"
        value={currentSection}
        onChange={handleTabChange}
        classes={tabsClasses}
      >
        {Object.keys(sections)
          .filter(section => sections[section].visible)
          .map(section => (
            <Tab
              key={section}
              value={section}
              label={skeleton
                ? <Skeleton width="80%" height={16} />
                : sections[section].title
              }
              className={classes.mdUpTab}
              data-selenium={`data-product-page.contents.${section}`}
            />
          ))}
      </Tabs>
    </Paper>
  );

  const renderSmDownContents = () => (
    <AppBar
      position="sticky"
      color="default"
      ref={contentsRef}
      className={classes.smDownContentsDiv}
      data-selenium="data-product-page.contents"
    >
      <Tabs
        variant="scrollable"
        scrollButtons="on"
        indicatorColor="primary"
        aria-label="Contents"
        value={currentSection}
        onChange={handleTabChange}
        classes={tabsClasses}
      >
        {Object.keys(sections)
          .filter(section => sections[section].visible)
          .map(section => (
            <Tab
              key={section}
              value={section}
              label={sections[section].title}
              data-selenium={`data-product-page.contents.${section}`}
            />
          ))}
      </Tabs>
    </AppBar>
  );

  const renderPageContents = () => (belowMd ? (
    <React.Fragment>
      {renderSmDownContents()}
      {renderSections()}
    </React.Fragment>
  ) : (
    <Grid container spacing={3}>
      <Grid item md={9}>
        {renderSections()}
      </Grid>
      <Hidden smDown>
        <Grid item md={3}>
          {renderMdUpContents()}
        </Grid>
      </Hidden>
    </Grid>
  ));

  const downloadContextProductData = state.bundleParent ? state.bundleParent : state.product;
  return (
    <NeonPage
      {...props}
      title={title}
      breadcrumbs={breadcrumbs}
    >
      {skeleton ? renderPageContents() : (
        <DownloadDataContext.Provider
          productData={downloadContextProductData}
          availabilityView="sites"
        >
          {renderPageContents()}
        </DownloadDataContext.Provider>
      )}
    </NeonPage>
  );
};

DataProductPage.propTypes = NeonPage.propTypes;
DataProductPage.defaultProps = NeonPage.defaultProps;

export default DataProductPage;
