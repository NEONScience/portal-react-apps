# Explore Data Products

The Explore Data Products page allows a user to browse all data products in the NEON Catalog. It
affords the ability to filter and sort the catalog as well as visualize and download data products.

## Current Production Example

[https://data.neonscience.org/data-products/explore](https://data.neonscience.org/data-products/explore)

## Composition

This app was originally generated using [Create React App](https://create-react-app.dev/).

It is built using Redux with a [single primary reducer](https://github.com/NEONScience/portal-react-apps/blob/master/apps/explore-data-products/src/reducers/reducer.js)
for all page actions including filters and sorting. Default state structure can be seen [here](https://github.com/NEONScience/portal-react-apps/blob/master/apps/explore-data-products/src/store/state.js).

## Development

Clone this repository and run `yarn run start` or `npm run start` to spin up a local instance
running on `http://localhost:3011` with a watcher to recompile when changes are made.

### Scripts

Various yarn/npm scripts are available for working with the build/compile side of the app. Invoke
each one with `yarn run <script>` or `npm run <script>`.

* **`start`**  
  Build and run a local instance of the Explore Data Products page on `http://localhost:3011`.

* **`build`**  
  Generate a build of the app. Performed automatically as a part of the `start` step.

* **`test`**  
  Run all automated tests.

* **`eject`**  
  Remove the single build dependency. **Cannot be undone.**
  See [Create React App Documentation](https://create-react-app.dev/docs/available-scripts/#npm-run-eject)
  for details.
