#!/bin/bash
mkdir -p export

echo "Downloading data..."
cd data_scraping
./download_all.sh

echo "Moving data to processing..."
cd ..
cp data_scraping/browser_downloads/* data_processing/import

echo "Processing age data..."
cd data_processing
./convert_ageTimeCsv_to_json.js

echo "Processing town data..."
./convert_townTimeCsv_to_json.js

echo "Exporting..."
cd ..
cp data_processing/export/* export

upload_date=$(date +"%m-%d-%y")
#git add .
#git commit -m "(AUTOMATIC) Update data $date"
#git push
