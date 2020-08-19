#!/bin/bash
mkdir -p occupation_data
filename=occupation_$(node download_occupation_data.js).csv
mv browser_downloads/data.csv occupation_data/$filename
