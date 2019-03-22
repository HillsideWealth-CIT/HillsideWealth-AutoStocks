const request = require('request');
require('dotenv').config

const db = require("../actions/database");

const summaryAPI = (symbol) => {
    return new Promise((resolve, reject) => {
        request({ url: `https://api.gurufocus.com/public/user/${process.env.GURU_API}/stock/${symbol}/summary`, json: true }, (err, res, body) => {
            if (err) reject(err)
            resolve(body)
        })
    })
}

const financialsAPI = (symbol) => {
    return new Promise((resolve, reject) => {
        request({ url: `https://api.gurufocus.com/public/user/${process.env.GURU_API}/stock/${symbol}/financials`, json: true }, (err, res, body) => {
            if (err) reject(err)
            resolve(body)
        })
    })
}

/**
 * Accepts list of stock symbols, does a gurufocus search on them, and returns a list of objects with stock data.
 * @param {Array} list List of stock symbols
 * @param {Boolean} summary_call Whether summary call should be used.
 * @param {Boolean} financials_call Whether fincancials call should be used.
 */
const gurufocusAdd = async (list, summaryCall = true, financialsCall = true) => {
    var stocksList = [];
    for (i in list) {
        let currentStock = {
            symbol: list[i].symbol,
            comment: list[i].comment,
            data: []
        }
        if (summaryCall) {
            let summary = await summaryAPI(list[i].symbol)
            currentStock.company = summary.summary.general.company
        }
        if (financialsCall) {
            let financials = await financialsAPI(list[i].symbol)
            let annuals = financials.financials.annuals

            for (f in annuals["Fiscal Year"]) {
                let currentData = {
                    date: (annuals["Fiscal Year"][f] === "TTM") ? new Date() : new Date(annuals["Fiscal Year"][f].slice(0,4), annuals["Fiscal Year"][f].slice(6, 8)),
                    symbol: list[i].symbol,
                    price: annuals.valuation_and_quality["Month End Stock Price"][f],
                    market_cap: annuals.valuation_and_quality["Market Cap"][f],
                    roe: annuals.common_size_ratios["ROE %"][f],
                    yield: annuals.valuation_ratios["Dividend Yield %"][f],
                    dividend: annuals.common_size_ratios["Dividend Payout Ratio"][f],
                    asset_turnover: annuals.common_size_ratios["Asset Turnover"][f],
                    revenue: annuals.income_statement.Revenue[f],
                    enterprise_value: annuals.valuation_and_quality["Enterprise Value"][f],
                    aebitda: Math.round(Number(annuals.cashflow_statement["Stock Based Compensation"][f]) + Number(annuals.income_statement.EBITDA[f])),
                }
                //console.log(currentData)
                currentStock.data.push(currentData)
            }

        }
        stocksList.push(currentStock)
    }
    for (i in stocksList) {
        try {
            await db.addStocks(stocksList[i].symbol, stocksList[i].company)
        }
        catch (err){ /* Do nothing. This happens when stock already exists */ }
        try {
            console.log(stocksList[i].data)
            for (d in stocksList[i].data) {
                let currentData = stocksList[i].data[d]
                await db.addStockData(currentData)
            }
        }
        catch (err) {
            console.log(err)
        }
    }

    return stocksList
}

/*
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
            url: `https://api.gurufocus.com/public/user/${process.env.GURU_API}/stock/${symbol}/summary`,
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
        	url: `https://api.gurufocus.com/public/user/${process.env.GURU_API}/stock/${symbol}/financials`,
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

 */
const gurufocus_update = () => {
    console.log(db.showstocks());
}


module.exports = {
    gurufocus_update,
    gurufocusAdd
}
