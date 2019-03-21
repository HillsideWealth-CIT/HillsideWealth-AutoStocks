const api_calls = require("./api_calls");
const db = require('./database');

function remove(request, response){
    let promises = [];
    for(let i = 0; i < request.body.stocks.length; i++){
        promises.push(db.removeStocks(request.body.stocks[i].symbol));
    }
    Promise.all(promises)
    .then((returned) => {
        response.send(JSON.stringify(request.body))
    })
}

function update(request, response){
}

module.exports = {
    remove
}