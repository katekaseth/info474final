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
    ]
})

let codeToState = {}
let codeToCount = {}

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
                    }
                    csvData.push(d)
                })
                console.log(csvData)
                csvWriter
                    .writeRecords(csvData)
                    .then(() => console.log('The CSV file was written successfully'))
            })
    })


// const csvWriter = createCsvWriter({
//     path: 'starbucks_count_country.csv',
//     header: [{
//             id: 'code2',
//             title: 'code2'
//         },
//         {
//             id: 'code3',
//             title: 'code3'
//         },
//         {
//             id: 'count',
//             title: 'count'
//         },
//         {
//             id: 'licensedCount',
//             title: 'licensedCount'
//         },
//         {
//             id: 'companyCount',
//             title: 'companyCount'
//         },
//         {
//             id: 'otherCount',
//             title: 'otherCount'
//         },
//     ]
// });

// let csvData = []
// let codeToCount = {}
// let codeToLicense = {}
// let codeToCompany = {}
// let codeToOther = {}
// let code2ToCode3 = {}

// fs.createReadStream('countries_codes_and_coordinates.csv')
//     .pipe(csv())
//     .on('data', (row) => {
//         row['Alpha-2 code'] = row['Alpha-2 code'].trim().replace(/"/g, "")
//         row['Alpha-3 code'] = row['Alpha-3 code'].trim().replace(/"/g, "")
//         code2ToCode3[row['Alpha-2 code']] = row['Alpha-3 code']
//     })
//     .on('end', () => {
//         fs.createReadStream('starbucks.csv')
//             .pipe(csv())
//             .on('data', (row) => {
//                 let count = codeToCount[row.Country]
//                 count ? codeToCount[row.Country] = count + 1 : codeToCount[row.Country] = 1
                
//                 if (row["Ownership Type"] == "Licensed") {
//                     let licenseCount = codeToLicense[row.Country]
//                     licenseCount ? codeToLicense[row.Country] = licenseCount + 1 : codeToLicense[row.Country] = 1
//                 } else if (row["Ownership Type"] == "Company Owned") {
//                     let companyCount = codeToCompany[row.Country]
//                     companyCount ? codeToCompany[row.Country] = companyCount + 1 : codeToCompany[row.Country] = 1
//                 } else {  // ownership type is other
//                     let otherCount = codeToOther[row.Country]
//                     otherCount ? codeToOther[row.Country] = otherCount + 1 : codeToOther[row.Country] = 1
//                 }
//             })
//             .on('end', () => {
//                 const keys = Object.keys(codeToCount)
//                 keys.forEach((code => {
//                     let count = codeToCount[code]
//                     let licenseCount = codeToLicense[code] ? codeToLicense[code] : 0
//                     let companyCount = codeToCompany[code] ? codeToCompany[code] : 0
//                     let otherCount = codeToOther[code] ? codeToOther[code] : 0
//                     let d = {
//                         code2: code,
//                         code3: code2ToCode3[code],
//                         count: count,
//                         licenseCount: licenseCount,
//                         companyCount: companyCount,
//                         otherCount: otherCount
//                     }
//                     csvData.push(d)
//                 }))
//                 console.log(csvData)
//                 csvWriter
//                     .writeRecords(csvData)
//                     .then(() => console.log('The CSV file was written successfully'))
//             })
//     })