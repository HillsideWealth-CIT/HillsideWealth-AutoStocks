const xlsxj = require("xlsx-to-json");

const csvjson = async (csv_file) => {
    return new Promise (( resolve, reject) => {  
        xlsxj({
            input: csv_file, 
            output: "stocks.json"
          }, function(err, results) {
            if(err) {
              console.error(err);
            }else {
                resolve (JSON.stringify(results))
            }
          });
    });
}
module.exports = {
    csvjson
}


