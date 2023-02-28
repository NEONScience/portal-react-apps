#!/bin/bash

echo;
echo 'Syncing assets...';
cd ./apps/data-availability
npm run build:sync-assets
cd ../data-product-detail
npm run build:sync-assets
cd ../explore-data-products
npm run build:sync-assets
cd ../prototype-data
npm run build:sync-assets
cd ../sample-explorer
npm run build:sync-assets
cd ../taxonomic-lists
npm run build:sync-assets

echo 'Done';
echo;
