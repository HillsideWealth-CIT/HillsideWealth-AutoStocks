const api_calls = require("./api_calls");
const db = require('./database');

function remove(request, response){
    let promises = [];
    for (let i = 0; i < request.body.stocks.length; i++) {
        promises.push(db.removeStocks(request.body.stocks[i].symbol, request.session.user));
    }
    Promise.all(promises)
        .then((returned) => {
            response.send(JSON.stringify(request.body));
        })
}

function update(request, response, user){
    let promises = [];
    db.showstocks(user).then((resolve) => {
        for(let i in resolve){
            promises.push(api_calls.gurufocus_update(resolve[i]['symbol'], user));
        }
        Promise.all(promises)
        .then((returned) => {
            console.log('done');
        })
    }).catch((error) => {
        console.log(error)
    })
}

module.exports = {
    remove,
    update
}