const xlsxj = require("xlsx-to-json");
const csv = require("csv-parser");
const fs = require("fs");

const csvjson = async (csv_file) => {
    return new Promise (( resolve, reject) => {
        xlsxj({
            input: csv_file, 
            output: "stocks.json"
          }, function(err, result) {
            if(err) {
              console.error(err);
            }else {
            resolve (JSON.stringify(result))
            }
          });
        // fs.createReadStream(csv_file.toString())
        // .pipe(csv({skipLines: 9}))
        // .on("data", line => {
        //     results.push(line);
        // })
        // .on("end", () => {
        //     //console.log(results);
        //     fs.writeFile("stocks.json", JSON.stringify(results), function(err) {
        //         if (err) throw err;
        //     });
        //     resolve (JSON.stringify(results))
        // });
    })
}
module.exports = {
    csvjson
}


