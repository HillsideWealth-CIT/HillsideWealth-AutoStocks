const request = require('request');
require('dotenv').config

const db = require("../actions/database");

const summaryAPI = (symbol) => {
    return new Promise((resolve, reject) => {
        //apiTimer().then(() => reject('Timeout'))
        request({ url: `https://api.gurufocus.com/public/user/${process.env.GURU_API}/stock/${symbol}/summary`, json: true }, (err, res, body) => {
            if (err) reject(err)
            if (body.summary == undefined) reject('No Stock Retrieved')
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

const apiTimer = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, 15000)
    })
}

/**
 * Accepts list of stock symbols, does a gurufocus search on them, and returns a list of objects with stock data.
 * @param {Array} list List of stock symbols
 * @param {Boolean} summary_call Whether summary call should be used.
 */
const gurufocusAdd = async (list, username, summaryCall = true, shared = false) => {
    for (i in list) {
        let timer;
        let currentStock = {
            symbol: list[i].symbol,
            comment: list[i].comment,
            data: []
        }
        if (summaryCall) {
            try {
                let summary = await summaryAPI(list[i].symbol)
                timer = setTimeout(() => {
                    throw 'Timeout'
                }, 10000)

                if (summary.summary) {
                    currentStock.company = summary.summary.general.company
                    var currentprice = summary.summary.general.price
                } else {
                    throw 'Error: No API Response'
                }


            }
            catch (err) {
                console.log(err)
                currentStock.company = 'Failed to get company name'
            }
            finally {
                clearTimeout(timer)
                summary = null
            }

        }
        try {
            let financials = await financialsAPI(list[i].symbol)
            let annuals = financials.financials.annuals
            for (f in annuals["Fiscal Year"]) {
                let currentData = {
                    ttm: annuals["Fiscal Year"][f] === "TTM",
                    date: (annuals["Fiscal Year"][f] === "TTM") ? new Date() : new Date(annuals["Fiscal Year"][f].slice(0, 4), annuals["Fiscal Year"][f].slice(6, 8)),
                    symbol: list[i].symbol,
                    //price: parseFloat(annuals.valuation_and_quality["Month End Stock Price"][f]),
                    price: currentprice,
                    net_debt: parseFloat(annuals.balance_sheet["Long-Term Debt"][f]) + parseFloat(annuals.balance_sheet["Current Portion of Long-Term Debt"][f]) + parseFloat(annuals.balance_sheet["Minority Interest"][f]) - parseFloat(annuals.balance_sheet["Cash And Cash Equivalents"][f]) - parseFloat(annuals.balance_sheet["Marketable Securities"][f]),
                    market_cap: parseFloat(annuals.valuation_and_quality["Market Cap"][f]),
                    //roe: parseFloat(annuals.common_size_ratios["ROE %"][f]),
                    yield: parseFloat(annuals.valuation_ratios["Dividend Yield %"][f]),
                    dividend: parseFloat(annuals.common_size_ratios["Dividend Payout Ratio"][f]),
                    asset_turnover: parseFloat(annuals.common_size_ratios["Asset Turnover"][f]),
                    revenue: parseFloat(annuals.income_statement.Revenue[f]),
                    enterprise_value: parseFloat(annuals.valuation_and_quality["Enterprise Value"][f]),
                    effective_tax: parseFloat(annuals.income_statement["Tax Rate %"][f]),
                    shares_outstanding: parseFloat(annuals.valuation_and_quality["Shares Outstanding (EOP)"][f]),
                    aebitda: Math.round(parseFloat(annuals.cashflow_statement["Stock Based Compensation"][f]) + parseFloat(annuals.income_statement.EBITDA[f])),
                    fcf: parseFloat(annuals.cashflow_statement["Free Cash Flow"][f])
                }
                    try{
                        currentData.roe = parseFloat(annuals.common_size_ratios["ROE %"][f])
                    }
                    catch{
                        currentData.roe = parseFloat(annuals.common_size_ratios["ROA %"][f])
                    }
                //console.log(currentData)
                currentStock.data.push(currentData)
            }
        } catch (err) {
            console.log(err)
        } finally {
            currentData = []
        }



        try {
            var stocks = await db.addStocks(currentStock.symbol, currentStock.company, username, currentStock.comment, shared)
        }
        catch (err) { var stocks = await db.runQuery('SELECT stock_id FROM stocks WHERE symbol = $1 AND username = $2', [currentStock.symbol, username]) }

        //console.log(stocksList[i].data)
        for (d in currentStock.data) {
            currentStock.data[d].stock_id = stocks.rows[0].stock_id
        }
        await db.arrayAddStockData(currentStock.data)
    }
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

module.exports = {
    gurufocusAdd
}
