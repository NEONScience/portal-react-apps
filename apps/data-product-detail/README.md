# Data Product Detail

The Data Product Detail page allows a user to browse all information pertinent to a single data
product. It affords the ability to viisualize data (if applicable), view all meta data including
all documentation and the full issue log history, as well as download data.

## Current Production Example

[https://data.neonscience.org/data-products/{productCode}](https://data.neonscience.org/data-products/DP1.00001.001)

Where `{productCode}` is any valid data product code, e.g. `DP1.00001.001`.

## Composition

This app was originally generated using [Create React App](https://create-react-app.dev/). It has been
expanded with [React App Rewired](https://github.com/timarney/react-app-rewired#readme) to customize
some of the build chain, including using lint rules from the [AirBnB JavaScript Style Guide](https://github.com/airbnb/javascript).

The app itself consists mainly of a single page: [DataProductPage.jsx](https://github.com/NEONScience/portal-react-apps/blob/master/apps/data-product-detail/src/components/DataProductPage.jsx).
The page is broken into [Sections](https://github.com/NEONScience/portal-react-apps/tree/master/apps/data-product-detail/src/components/Sections),
each expressed by its own component, and each containing one or more [Details](https://github.com/NEONScience/portal-react-apps/tree/master/apps/data-product-detail/src/components/Details).
A detail is a component containing a piece of information that can range in scope from a short string
(e.g. the Product Code) to a table with paging and sorting (the Issue Log).

## Development

Clone this repository and run `yarn run start` or `npm run start` to spin up a local instance
running on `http://localhost:3012` with a watcher to recompile when changes are made.

### Scripts

Various yarn/npm scripts are available for working with the build/compile side of the app. Invoke
each one with `yarn run <script>` or `npm run <script>`.

* **`start`**  
  Build and run a local instance of the Data Product Detail page on `http://localhost:3012`. As
  this page requires a product code to work it is necessary to manually add a valid product code
  path to the URL; e.g.: `http://localhost:3012/data-products/DP1.00001.001`

* **`build`**  
  Generate a build of the app. Performed automatically as a part of the `start` step.

* **`test`**  
  Run all automated tests.

* **`lint`**  
  Run an eslint check. Performed automatically as a part of the `build` step.

* **`lint:fix`**  
  Run an eslint check that automatically fixes many basic types of link issues.

* **`eject`**  
  Remove the single build dependency. **Cannot be undone.**
  See [Create React App Documentation](https://create-react-app.dev/docs/available-scripts/#npm-run-eject)
  for details.
