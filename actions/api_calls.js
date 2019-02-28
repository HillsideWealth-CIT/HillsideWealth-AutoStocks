const request = require('request');
require('dotenv').config

function summary_call(item) {
    let nitem = {};
    //let link =
    console.log(`item: ${JSON.stringify(item)}`)
    return new Promise((resolve, reject) => {
        request({
            url: `https://api.gurufocus.com/public/user/${process.env.GURU_API}/stock/${item.symbol}/financials`,
            json: true
        }, (err, resp, body) => {
            if (err) reject(err)

            nitem["symbol"] = item.symbol;
            nitem["company"] = item.company
            nitem["comment"] = item.comment;
            resolve(nitem);

        })
    })
}

function gurufocus_add(list) {
    var promises = [];
    for (let i = 0; i < list.length; i++) {
        //console.log(list[i])
        promises.push(summary_call(list[i]))
    }

    return new Promise((resolve, reject) => {
        Promise.all(promises)
            .then((returned) => {
                resolve(returned)
            })
            .catch((err) => reject(err));
    })
}


module.exports = {
    gurufocus_add
}
