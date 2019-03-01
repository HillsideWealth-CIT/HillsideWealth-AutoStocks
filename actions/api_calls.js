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

var symbols = ['AAPL', 'GOOGL', 'AMZN', 'TSX:ATZ', 'TSX:CP', 'TSX:DOL']

const financials_call = (symbol, callback) => {

	//Net debt = Long term debt + current portion of long term debt + minority interest - cash& cash equivalents - market securities
    //aEBITDA = EBITDA + Stock Based Compensation
    //ND aEBITDA = Net dept / aEBITDA
    //aEBITDA % = aEBITDA / Revenue
    //aEBITDA x AT = aEBITDA % * Asset Turnover
    //EV/aEBITDA = Enterprise value / aEBITDA
    //Spice = (aEBITA x AT * 100)/(EV/aEBITDA)
    //ROE/Mult = ROE/EVaEBITDA

	let data = {};
        request({
            url: `https://api.gurufocus.com/public/user/49791c4074556510da66a0296e8c672b:8850a7457029e3e220a7c15bf06be9ea/stock/${symbol}/summary`,
            json: true
        }, (error, response, body) => {
            	if(error) {
            		reject(error)
            	}else{
	            	data['Symbol'] = symbol;
	            	data['Company'] = body.summary.general['company']
	            	data['Price'] = parseFloat(body.summary.general['price'])
            	}
            });
        request({
        	url: `https://api.gurufocus.com/public/user/49791c4074556510da66a0296e8c672b:8850a7457029e3e220a7c15bf06be9ea/stock/${symbol}/financials`,
        	json: true
        }, (error, response, body) => {
	        	if(error) {
	        		reject(error)
	        	}else{
	        		var longTermDebt = parseFloat(body.financials.quarterly.balance_sheet['Long-Term Debt'].pop()),
	        			currentLTB = parseFloat(body.financials.quarterly.balance_sheet['Current Portion of Long-Term Debt'].pop()),
	        			minoriInt = parseFloat(body.financials.quarterly.balance_sheet['Minority Interest'].pop()),
	        			cashACE = parseFloat(body.financials.quarterly.balance_sheet['Cash And Cash Equivalents'].pop()),
	        			marketSec = parseFloat(body.financials.quarterly.balance_sheet['Marketable Securities'].pop());
	        			netDebt = longTermDebt + currentLTB + minoriInt - cashACE - marketSec;
	        		data["Net Debt"] = parseFloat(netDebt.toFixed(2));

	        		var EBITDA = parseFloat(body.financials.quarterly.income_statement['EBITDA'].pop()),
	        			stockComp = parseFloat(body.financials.quarterly.cashflow_statement['Stock Based Compensation'].pop()),
	        			aEBITDA = EBITDA + stockComp;
	        		data["aEBITDA"] = parseFloat(aEBITDA.toFixed(2));

	        		var NDaEBITDA = netDebt/aEBITDA;
	        		data["ND/aEBITDA"] = parseFloat(NDaEBITDA.toFixed(2));

	        		var aEBITDAPer = aEBITDA / parseFloat(body.financials.quarterly.income_statement['Revenue'].pop()) * 100
	        		data["Revenue"] = parseFloat(body.financials.quarterly.income_statement['Revenue'].pop())
	        		data["aEBITDA %"] = parseFloat(aEBITDAPer.toFixed(2));

	        		var aEBITDAxAT = aEBITDAPer * parseFloat(body.financials.quarterly.common_size_ratios['Asset Turnover'].pop())
	        		data["aEBITDA x AT"] = parseFloat(aEBITDAxAT.toFixed(2));
	        		data["Asset Turnover"] = parseFloat(body.financials.quarterly.common_size_ratios['Asset Turnover'].pop())

	        		var EVaEBITDA = parseFloat(body.financials.quarterly.valuation_and_quality['Enterprise Value'].pop())/aEBITDA
	        		data["EV/aEBITDA"] = parseFloat(EVaEBITDA.toFixed(2));

	        		var spice = aEBITDAxAT/ EVaEBITDA;
	        		data["Spice"] = parseFloat(spice.toFixed(2));

	        		data['Yield'] = parseFloat(body.financials.quarterly.valuation_ratios['Dividend Yield %'].pop());
	        		data['Market Cap'] = parseFloat(parseFloat(body.financials.quarterly.valuation_and_quality["Market Cap"].pop()).toFixed(2));
	        		data['Enterprise Value'] = parseFloat(parseFloat(body.financials.quarterly.valuation_and_quality["Enterprise Value"].pop()).toFixed(2));
	        		data['ROE'] = parseFloat(parseFloat(body.financials.quarterly.common_size_ratios["ROE %"].pop()).toFixed(2));

	        		var ROEMult = parseFloat(body.financials.quarterly.common_size_ratios["ROE %"].pop())/EVaEBITDA;
	        		data["ROE/Mult"] = parseFloat(ROEMult.toFixed(2));
	        		console.log(data);
	        		console.log();
	        	}
        });
 };


 function gurufocus_update(){
 	for(item in symbols) {
 		financials_call(symbols[item]);
 	}
 }


module.exports = {
    gurufocus_add,
    gurufocus_update
}
