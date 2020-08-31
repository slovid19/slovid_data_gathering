const fs = require("fs");
const parse = require("csv-parse");

const POP_DATA_PATH = `${__dirname__}/population_data.json`;
const CAPITA_OUTPUT_PATH = `${__dirname}/../export/townTimePer1000.json`
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
    //console.log(jsonData);
}
let convertTotalToPer1000 = function(populationData)
{
    let towns = Object.keys(populationData["towns"]);

    //Remove commentary data from town array
    let maxCasesIndex = 0;
    indicesToDel = [];
    for(let i in jsonData["datasets"])
    {
        let set = jsonData["datasets"][i];
        if(set.label == "Total Cases")
        {
            set.label = "SLO County Total";
            maxCasesIndex = i;
            set.maxCases = 
                set.maxCases/populationData["towns"][set.label] * 1000;
        }
        let townIndex = towns.indexOf(set.label);
        if(townIndex == -1)
           indicesToDel.push(i); 
        else
        {
            let population = populationData["towns"][towns[townIndex]];
            for(let j in set.data)
            {
                set.data[j] = set.data[j]/population * 1000;
            }
            set["source"] = populationData["townSources"][set.label];

        }
    }
    while(indicesToDel.length > 0)
    {
        let i = indicesToDel.pop();
        jsonData["datasets"].splice(i, 1);
    }
    for(let i in jsonData["datasets"])
    {
        let set = jsonData["datasets"][i];
        if(set.maxCases != undefined)
        {
            set.maxCases = findMaxCases(jsonData);
        }
    }
    jsonData["sources"] = populationData["sources"];
    jsonData["townSources"] = populationData["townSources"];
     
    
}
let findMaxCases = function(jsonData)
{
    let maxCases = 0;
    for(let i in jsonData["datasets"])
    {
        let set = jsonData["datasets"][i];
        for(let j in set.data)
            maxCases = Math.max(maxCases, set.data[j]);
    }
    return maxCases;
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

        let populationData = fs.readFileSync(POP_DATA_PATH);
        convertTotalToPer1000(JSON.parse(populationData));
        
        jsonString = JSON.stringify(jsonData);
        fs.writeFileSync(CAPITA_OUTPUT_PATH, jsonString);
    });

