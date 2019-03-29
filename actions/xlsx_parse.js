const xlsxj = require("xlsx-to-json"); // npm package that converts XLSX files to JSON files
const fs = require("fs"); // npm package that simplified the file system
const path = require("path") // npm package that locate path
/**
 * This function converts XLSX files to JSON files
 * Requirements: xlsx-to-json, fs, path
 * @param {XLSX} xlsx_file 
 */
const xlsxjson = async (xlsx_file) => {
    return new Promise((resolve, reject) => {
        xlsxj({
            input: xlsx_file,
            output: "stocks.json" // stock.json is not being used
        }, function (err, result) {
            if (err) {
                console.error(err);
            } else {
                // Delete the uploaded files from the /upload folder
                fs.readdir('./uploads', (err, files) => {
                    if (err) throw err;

                    for (const file of files) {
                      fs.unlink(path.join('./uploads', file), err => {
                        if (err) throw err;
                      });
                    }
                  });
                  /**
                   * Returns a stringified json 
                   * Example:
                   * [
                        {
                            "Exchange": "NAS",
                            "Ticker": "AAON",
                            "Current Price": "$45.2",
                            "'Market Cap ($M)'>750": "TRUE",
                            "'ROE % (5y Median)'": "25.91",
                            "(((('EBITDA'+'Stock Based Compensation')/'Revenue')*100)*('Revenue' /'Total Assets'))": "25.678929",
                            "'3 Year Total Revenue Growth Rate'>5": "TRUE",
                            "Market Cap ($M)": "2349.33",
                            "Company": "AAON Inc",
                            "ROE % (5y Median)": "25.91",
                            "3-Year Total Revenue Growth Rate": "6.60",
                            "Currency": "USD"
                        }
                    ]
                   */
                resolve(JSON.stringify(result))
            }
        });
    })
}
module.exports = {
    xlsxjson
}


