const api_calls = require("./api_calls");
const db = require('./database');

function Append(request, response){
    api_calls.gurufocus_add(request.body.stocks)
    .then((resolve) => {
        let promises = [];
        console.log(resolve);
        for (let i = 0; i < resolve.length; i++){
            promises.push(db.addStocks(resolve[i].symbol, resolve[i]. company))
        }
        promises.all(promises)
        .then((returned) => {
            response.send(JSON.stringify({stocks: resolve, action: 'Append'}))
        })
    })
    .catch((reason) => {return reason})
}

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
    Append,
    remove
}