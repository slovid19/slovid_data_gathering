#!/bin/bash
MAX_RETRY=2
mkdir -p browser_downloads

echo "Downloading age data..."
n=0
until [ "$n" -ge "$MAX_RETRY" ]; do
    node download_age_data.js && break
    n=$((n+1))
    echo "Failed! Retrying ($n/$(( MAX_RETRY - 1 )))..."
done
if [ "$n" -ge "$MAX_RETRY" ]; then
    echo "Failed! Max retries exceeded!"
    exit 1
fi
mv browser_downloads/data.csv browser_downloads/ageTimeData.csv

echo "Downloading time data..."
n=0
until [ "$n" -ge "$MAX_RETRY" ]; do
    node download_town_data.js && break
    n=$((n+1))
    echo "Failed! Retrying ($n/$(( MAX_RETRY - 1 )))..."
done
if [ "$n" -ge "$MAX_RETRY" ]; then
    echo "Failed! No more retries!"
    exit 1
fi
mv browser_downloads/data.csv browser_downloads/townTimeData.csv
