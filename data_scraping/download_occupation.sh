#!/bin/bash
MAX_RETRY=2

mkdir -p occupation_data
n=0
until [ "$n" -ge "$MAX_RETRY" ]; do
    update_date=$(node download_occupation_data.js) && break
    filename=occupation_$update_date.csv
    n=$((n+1))
    echo "Failed! Retrying ($n/$(( MAX_RETRY - 1 )))..."
done
if [ "$n" -ge "$MAX_RETRY" ]; then
    echo "Failed! Max retries exceeded!"
    exit 1
fi

mv browser_downloads/data.csv occupation_data/$filename
