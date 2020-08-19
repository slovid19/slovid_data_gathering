#!/bin/bash
mkdir -p export

echo "Downloading data..."
cd data_scraping
./download_all.sh

echo "Moving data to processing..."
cd ..
mv data_scraping/browser_downloads/* data_processing/import

echo "Processing age data..."
cd data_processing
./convert_ageTimeCsv_to_json.js

echo "Processing town data..."
./convert_townTimeCsv_to_json.js

echo "Exporting..."
cd ..
mv data_processing/export/* export
