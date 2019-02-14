const csv = require("csv-parser");
const fs = require("fs");

function csv_to_json(csv_file) {
    const results = [];
    fs.createReadStream(csv_file.toString())
        .pipe(csv({ skipline: 11 }))
        .on("data", line => {
            results.push(line);
        })
        .on("end", () => {
            console.log(results);
            fs.writeFile("stocks.json", JSON.stringify(results), function(err) {
                if (err) throw err;
            });
        });
}
