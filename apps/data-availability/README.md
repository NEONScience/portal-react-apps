# Data Availability

This is a [Next.js](https://nextjs.org) project.

The Data Availability standalone application allows viewing all availability related to a product or site.

## Current Production Example

[https://data.neonscience.org/visualizations/data-availability](https://data.neonscience.org/visualizations/data-availability)

## Development

Clone this repository and run `yarn run start` or `npm run start` to spin up a local instance
running on `http://localhost:3000/visualizations/data-availability`

### Scripts

Various yarn/npm scripts are available for working with the build/compile side of the app. Invoke
each one with `yarn run <script>` or `npm run <script>`.

* **`start`**  
  Open [http://localhost:3000/visualizations/data-availability](http://localhost:3000/visualizations/data-availability) with your browser to see the result.

* **`build`**  
  Generate a build of the app. Performed automatically as a part of the `start` step.

* **`lint`**  
  Run an eslint check.

* **`checks:docker`**  
    Run all tasks related to this application and library, within a Docker runtime environment.
    - Executes any required portal core components scripts
    - Runs linter
    - Builds application
