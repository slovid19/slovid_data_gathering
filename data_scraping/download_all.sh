#!/bin/bash
set -e

MAX_RETRY=2
SCRIPT_DIR=$(dirname "$0")

mkdir -p "${SCRIPT_DIR}"/browser_downloads

echo "Downloading age data..."
n=0
until [ "$n" -ge "$MAX_RETRY" ]; do
    node "${SCRIPT_DIR}"/download_age_data.js && break
    n=$((n+1))
    echo "Failed! Retrying ($n/$(( MAX_RETRY - 1 )))..."
done
if [ "$n" -ge "$MAX_RETRY" ]; then
    echo "Failed! Max retries exceeded!"
    exit 1
fi
mv "${SCRIPT_DIR}"/browser_downloads/data.csv "${SCRIPT_DIR}"/browser_downloads/ageTimeData.csv

echo "Downloading time data..."
n=0
until [ "$n" -ge "$MAX_RETRY" ]; do
    node "${SCRIPT_DIR}"/download_town_data.js && break
    n=$((n+1))
    echo "Failed! Retrying ($n/$(( MAX_RETRY - 1 )))..."
done
if [ "$n" -ge "$MAX_RETRY" ]; then
    echo "Failed! No more retries!"
    exit 1
fi
mv "${SCRIPT_DIR}"/browser_downloads/data.csv "${SCRIPT_DIR}"/browser_downloads/townTimeData.csv
