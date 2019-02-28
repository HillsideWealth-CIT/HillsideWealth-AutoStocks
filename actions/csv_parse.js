const csv = require("csv-parser");
const fs = require("fs");

const csvjson = async (csv_file) => {
    const results = [];
    return new Promise (( resolve, reject) => {
        fs.createReadStream(csv_file.toString())
        .pipe(csv({skipLines: 9}))
        .on("data", line => {
            results.push(line);
        })
        .on("end", () => {
            //console.log(results);
            fs.writeFile("stocks.json", JSON.stringify(results), function(err) {
                if (err) throw err;
            });
            resolve (JSON.stringify(results))
        });})
}
module.exports = {
    csvjson
}


