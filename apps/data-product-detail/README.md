# Data Product Detail

This is a [Next.js](https://nextjs.org) project.

The Data Product Detail page allows a user to browse all information pertinent to a single data
product. It affords the ability to viisualize data (if applicable), view all meta data including
all documentation and the full issue log history, as well as download data.

## Current Production Example

[https://data.neonscience.org/data-products/{productCode}](https://data.neonscience.org/data-products/DP1.00001.001)

Where `{productCode}` is any valid data product code, e.g. `DP1.00001.001`.

## Development

Clone this repository and run `yarn run start` or `npm run start` to spin up a local instance
running on `http://localhost:3000`

### Scripts

Various yarn/npm scripts are available for working with the build/compile side of the app. Invoke
each one with `yarn run <script>` or `npm run <script>`.

* **`start`**  
  Build and run a local instance of the Data Product Detail page on `http://localhost:3000`. As
  this page requires a product code to work it is necessary to manually add a valid product code
  path to the URL; e.g.: `http://localhost:3012/data-products/DP1.00001.001`

* **`build`**  
  Generate a build of the app. Performed automatically as a part of the `start` step.

* **`lint`**  
  Run an eslint check.

* **`checks:docker`**  
    Run all tasks related to this application and library, within a Docker runtime environment.
    - Executes any required portal core components scripts
    - Runs linter
    - Builds application
