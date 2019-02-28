const request = require('request');
require('dotenv').config

function summary_call(item){
    let nitem = {};
    //let link = 
    return new Promise((resolve, reject) => {
        request({
            url: `https://api.gurufocus.com/public/user/${process.env.GURU_API}/stock/${item.symbol}/summary`,
            json: true
        }, (err, resp, body) => {
            if("summary" in body == true){
                nitem["symbol"] = item.symbol;
                nitem["company"] = body.summary.general.company
                nitem["comment"] = item.comment;
                resolve(nitem);
            }
            else{
                reject(body);
            }
        })  
    })
}

function gurufocus_add(list){
    var promises = [];
    for(let i = 0; i < list.length; i++){
        //console.log(list[i])
        promises.push(summary_call(list[i]))
    }

    return new Promise((resolve, reject) => {
        Promise.all(promises)
            .then((returned) =>resolve(returned))
            .catch((err) => reject(err));
    })
}


module.exports = {
    gurufocus_add
}