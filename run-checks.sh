#!/bin/bash

echo;
echo 'Linting...';
cd ./apps/data-availability
yarn run lint
cd ../data-product-detail
yarn run lint
cd ../explore-data-products
yarn run lint
cd ../prototype-data
yarn run lint
cd ../sample-explorer
yarn run lint
cd ../taxonomic-lists
yarn run lint

cd ../../
echo;
echo 'Building...';
cd ./apps/data-availability
yarn run build
cd ../data-product-detail
yarn run build
cd ../explore-data-products
yarn run build
cd ../prototype-data
yarn run build
cd ../sample-explorer
yarn run build
cd ../taxonomic-lists
yarn run build

echo 'Done';
echo;
