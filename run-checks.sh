#!/bin/bash

LOC=$(pwd)

echo;
echo 'Building docker images...';
npm run build:docker-all

cd $LOC
echo;
echo 'Running checks...';
cd ./apps/data-availability
pwd
npm run checks:docker
cd ../data-product-detail
pwd
npm run checks:docker
cd ../explore-data-products
pwd
npm run checks:docker
cd ../prototype-data
pwd
npm run checks:docker
cd ../sample-explorer
pwd
npm run checks:docker
cd ../taxonomic-lists
pwd
npm run checks:docker

cd $LOC

echo 'Done';
echo;
