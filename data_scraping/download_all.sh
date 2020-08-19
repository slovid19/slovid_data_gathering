#!/bin/bash
mkdir -p browser_downloads

echo "Downloading age data..."
node download_age_data.js
mv browser_downloads/data.csv browser_downloads/ageTimeData.csv

echo "Downloading time data..."
node download_town_data.js
mv browser_downloads/data.csv browser_downloads/townTimeData.csv
