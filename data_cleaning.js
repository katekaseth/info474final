const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const csvWriter = createCsvWriter({
    path: 'usa_starbucks_count.csv',
    header: [{
            id: 'stateCode',
            title: 'stateCode',
        },
        {
            id: 'stateName',
            title: 'stateName',
        },
        {
            id: 'storeCount',
            title: 'storeCount',
        },
        {
            id: 'licensedCount',
            title: 'licensedCount'
        },
        {
            id: 'companyCount',
            title: 'companyCount'
        }
    ]
})

let codeToState = {}
let codeToCount = {}
let codeToLicense = {}
let codeToCompany = {}

fs.createReadStream('states.csv')
    .pipe(csv())
    .on('data', (row) => {
        codeToState[row.Abbreviation] = row.State
    })
    .on('end', () => {
        fs.createReadStream('starbucks.csv')
            .pipe(csv())
            .on('data', (row) => {
                if (row.Country == "US") {
                    let storeCount = codeToCount[row['State/Province']]
                    storeCount ? codeToCount[row['State/Province']] = storeCount + 1 : codeToCount[row['State/Province']] = 1

                    // count the different ownership types
                    if (row["Ownership Type"] == "Licensed") {
                        let licenseCount = codeToLicense[row['State/Province']]
                        licenseCount ? codeToLicense[row['State/Province']] = licenseCount + 1 : codeToLicense[row['State/Province']] = 1
                    } else if (row["Ownership Type"] == "Company Owned") {
                        let companyCount = codeToCompany[row['State/Province']]
                        companyCount ? codeToCompany[row['State/Province']] = companyCount + 1 : codeToCompany[row['State/Province']] = 1
                    }
                }
            })
            .on('end', () => {
                let csvData = []
                const keys = Object.keys(codeToCount)
                keys.forEach(code => {
                    let count = codeToCount[code]
                    let d = {
                        stateCode: code,
                        stateName: codeToState[code],
                        storeCount: count,
                        licensedCount: codeToLicense[code],
                        companyCount: codeToCompany[code]
                    }
                    csvData.push(d)
                })
                console.log(csvData)
                csvWriter
                    .writeRecords(csvData)
                    .then(() => console.log('The CSV file was written successfully.'))
            })
    })