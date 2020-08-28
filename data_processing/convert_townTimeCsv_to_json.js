const fs = require("fs");
const parse = require("csv-parse");

const DATA_PATH = `${__dirname}/import/townTimeData.csv`;
const OUTPUT_PATH = `${__dirname}/../export/townTimeData.json`;

let csvData = [];
let jsonData = {};

let initJson = function(csvHeaders)
{
    //Setup json data from csv
    csvHeaders[0] = "Date";
    jsonData.headers = csvHeaders;
    jsonData.cases = [];
}
let pushJson = function(dataRow)
{
    let n = jsonData.cases.length;
    jsonData.cases[n] = {};
    let total = 0;
    for(let i in jsonData.headers)
    {
        //Replace null entries with 0
        if(dataRow[i] == '' || dataRow[i] == undefined)
            dataRow[i] = '0';

        //Remove quotes from around numbers
        if(!isNaN(Number(dataRow[i])))
            dataRow[i] = Number(dataRow[i]);

        //Populate json entry
        jsonData.cases[n][jsonData.headers[i]] = dataRow[i];

        //Calculate total
        if(Number(i) > 0 && Number(dataRow[i]))
            total += Number(dataRow[i]);
    }

    //Add total to json entry
    jsonData.cases[n]["total_cases"] = total;
}

let convertJsonToChartJS = function()
{
    let caseData = jsonData;
    let maxCases = 0;
    let ageTimeData = {};
    let data = [];
    let labels = [];
    let datasets = [];
    caseData.cases.forEach(
        dataObj => {
            let total_cases = dataObj["total_cases"];
            maxCases = Math.max(total_cases, maxCases);
            data.push(total_cases);
            labels.push(dataObj["Date"]);
        }
    );
    let dataLabels = Object.keys(caseData.cases[0]).slice(1);
    let colorNum = dataLabels.length;
    let dataObjects = {};
    for(let i in dataLabels)
    {
        let label = dataLabels[i];
        let labelName = (label == "total_cases") ? "Total Cases" : label;
        let color = "hsl(" + Math.round(i * (360 / colorNum) ) + ", 70%, 50%)";
        dataObjects[label] = 
        {
            "label": labelName,
            "data": [],
            "fill": false,
            "hidden": true,
            "borderColor": color,
            "lineTension": 0.1
        };
    }
    for(let i in caseData.cases)
    {
        for(let j in caseData.cases[i])
        {
            if(j == "Date")
                continue;
            dataObjects[j].data.push(caseData.cases[i][j]);
        }
    }
    dataObjects["San Luis Obispo"].hidden = false;
    dataObjects["total_cases"].maxCases = maxCases;
    for(let i in dataObjects)
    {
        datasets.push(dataObjects[i]);
    }
    ageTimeData.datasets = datasets;
    ageTimeData.labels = labels;
    
    let currTime = new Date();
    ageTimeData.lastUpdated = currTime.toLocaleString();

    jsonData = ageTimeData;
}

let line = 0;
fs.createReadStream(DATA_PATH)
    .pipe(parse({delimiter: ',', quote: '\\', relax_column_count: true}))
    .on('data', function(csvRow) {
        csvRow = csvRow.map( data => data.replace(/\"/g,'') );
        if(line++ == 0)
            initJson(csvRow);
        else
            pushJson(csvRow);
         
        csvData.push(csvRow);
    })
    .on('end', function() {
        convertJsonToChartJS();
        let jsonString = JSON.stringify(jsonData);
        fs.writeFileSync(OUTPUT_PATH, jsonString);
    });

