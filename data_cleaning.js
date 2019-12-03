const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const csvWriter = createCsvWriter({
    path: 'starbucks_count_country.csv',
    header: [{
            id: 'code2',
            title: 'code2'
        },
        {
            id: 'code3',
            title: 'code3'
        },
        {
            id: 'count',
            title: 'count'
        },
    ]
});

let csvData = []
let codeToCount = {}
let code2ToCode3 = {}

fs.createReadStream('countries_codes_and_coordinates.csv')
    .pipe(csv())
    .on('data', (row) => {
        row['Alpha-2 code'] = row['Alpha-2 code'].trim().replace(/"/g, "")
        row['Alpha-3 code'] = row['Alpha-3 code'].trim().replace(/"/g, "")
        code2ToCode3[row['Alpha-2 code']] = row['Alpha-3 code']
    })
    .on('end', () => {
        fs.createReadStream('starbucks.csv')
            .pipe(csv())
            .on('data', (row) => {
                let count = codeToCount[row.Country]
                count ? codeToCount[row.Country] = count + 1 : codeToCount[row.Country] = 1
            })
            .on('end', () => {
                const keys = Object.keys(codeToCount)
                keys.forEach((code => {
                    let count = codeToCount[code]
                    let d = {
                        code2: code,
                        code3: code2ToCode3[code],
                        count: count
                    }
                    csvData.push(d)
                }))
                csvWriter
                    .writeRecords(csvData)
                    .then(() => console.log('The CSV file was written successfully'))
            })
    })