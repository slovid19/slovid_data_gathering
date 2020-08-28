#!/bin/bash
set -e

mkdir -p export

echo "Downloading data..."
./data_scraping/download_all.sh

echo "Moving data to processing..."
mkdir -p data_processing/import
mv data_scraping/browser_downloads/* data_processing/import

echo "Processing age data..."
node data_processing/convert_ageTimeCsv_to_json.js

echo "Processing town data..."
node data_processing/convert_townTimeCsv_to_json.js
