# browse-refactor
Refactoring the browse data, data product catalog, and data availability page

browse TODO (*must have*)
- theme
  - change "Land Use, Land Cover, and Land Processes" to "Land Cover & Processes"
    - this will involve: ensuring the database THME table is updated, theme enum in portalDataAccessLayer, regen cache

browse TODO (*nice to have*)
- (partially done for main app state) unify error handling for api calls (embarrassing if it fails, but it will usually work)
- size estimation / manifest generation / package download
  - improve performance by utilizing cache and not presigning URL's upon manifest generation / size estimation
    - memory is important to consider here, the cache that would be utilized is heavy, consider only implementing this
    if cache layer is moved to a separate VM
    - perhaps a POST to the public API describing the request to estimate, as it already houses the cache needed 
  - move presigning to download stream step, avoids possible expiration collisions
- allow filters to be rolled back up, in addition to being expanded
- show summary of filters currently selected
- add product sorting
- unit testing
- Paging for number of products displayed
- Paging for number of filters displayed


Install:

1. node (latest version) from download https://nodejs.org/en/download/
2. npm install (this should pick up the contents of the package.json)
3. Dygraphs currently delivers its npm package with ES6 source files targeted by default. We need to modify the package.json contents to point at the ES5 source so that "npm run build" will utilize the ES5 source files for building. This is necessary as transpiling ES6 is not yet supported by the UglifyJs package utilized by react-scripts. This should be improved as time permits, as a workaround, modify the package.json "module" property as follows:
    - package.json location: ./node_modules/dygraphs/package.json
    - package.json => "module": "index.es5"
    - verification: from code folder, "npm run build", ensure no errors stemming from dygraphs src files
4. For chrome, install React Developer Tools extension
5. VSCode is a good editor that links directly with chrome tools https://medium.com/@auchenberg/live-edit-and-debug-your-react-apps-directly-from-vs-code-without-leaving-the-editor-3da489ed905f
6. From code folder, "npm start" to run dev server, "npm run build" to generate servable output

Reading the code:

1. Redux store is generated in /index.js, from a public API call
2. /App.js is the top level component that contains the structure for all the other components.
3. Reducers modify the store.  Check in /reducers/index.js.
4. Actions are used in calls to reducers.  Check in /actions/actions.js
5. /containers/TopContainer.js binds the store to the components
6. Events are bound to the filter components, see /Filters/FilterTheme.js for examples


Comments/TODO:

1. Integration with Liferay as the primary server.
    1. package.json has a homepage attribute that needs to be set during build, that handles the target page location
    2. May want to statically serve the page directly from tomcat, rather than thorugh liferay
2. Integration with the new cache system.
    1. Recommend an analysis to see about where the cache should be hosted... may want it server independent
3. Remaining features
    1. Data download - link to ECS and zip capability
    2. Metadata download - link to ECS
    3. Icons
    4. Filters - many possible, word and time range will take some thought
    5. Cosmetics
        1. Compressing display of descriptions
        2. CSS everywhere... recommend switching to a full flow or grid layout
        3. Paging for number of products displayed
        4. Paging for number of filters displayed
    6. Menu
    7. Data product sorting
    8. Clear all filters
4. Other ideas
    1. Switch from a subtractive filter method to: if no filters selected, show everything.  When filters selected, show just those items additively.  This may need to be: logical OR within groups, logical AND between groups.  So, selecting Atmospheric and Land Use with Available ends up as showing the group meeting the criteria (Atmospheric || Land Use) && (Available). 
5. Performance/bug fixes
    1. State is carrying too much information.  Re-assessing what state is in which components could speed things up.
    1. Flattening state: hierarchies are painful when working with non-mutational copies.  Page size could be slimmed down quite a bit.
