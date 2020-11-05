const request = require('request');
require('dotenv').config

const db = require("../actions/database");
const timeout_ms = 30000;
/**
 * Gets the summary of a stock using the gurufocus api
 * @param {String} symbol The stock symbol
 */
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

/**
 * Gets the financials of a stock using the gurufocus api
 * @param {String} symbol The stock symbol
 */
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
 * @param {Boolean} username name of the user
 */
const update_prices = async (list, username) => {
    for (i in list){
        let timer;
        let currentStock = {};
        let summary = await summaryAPI(list[i].symbol)
        timer = setTimeout(() => {
            throw 'Timeout';
        }, timeout_ms);
        try{
            if (summary.summary){
                currentStock.company = summary.summary.general.company;
                currentStock.sector = summary.summary.general.sector;
                currentStock.current_price = parseFloat(summary.summary.general.price);
                currentStock.gfrating = summary.summary.general.rating;
                currentStock.predictability = summary.summary.company_data.rank_predictability;
                currentStock.financialStrength = summary.summary.company_data.rank_financial_strength;
            }
            else{
                throw 'no Api response'
            }
            //console.log(currentStock)
        }
        catch (err) {
            console.log(err)
        }
        await db.updatePrices(list[i].symbol, username, currentStock.sector, currentStock.current_price, currentStock.gfrating, currentStock.predictability, currentStock.financialStrength);
        clearTimeout(timer);
    }
    return;
}

/**
 * Accepts list of stock symbols, does a gurufocus search on them, and returns a list of objects with stock data.
 * @param {Array} list List of stock symbols
 * @param {Boolean} summary_call Whether summary call should be used.
 */
const gurufocusAdd = async (list, username, summaryCall = true, shared = false, special = false) => {
    await update_prices(list, username);
    console.log(1)
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
                }, timeout_ms)

                if (summary.summary) {
                    currentStock.company = summary.summary.general.company;
                    currentStock.sector = summary.summary.general.sector;
                    currentStock.current_price = parseFloat(summary.summary.general.price);
                    currentStock.gfrating = summary.summary.general.rating;
                    currentStock.predictability = summary.summary.company_data.rank_predictability;
                    currentStock.financialStrength = summary.summary.company_data.rank_financial_strength;
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
            let financials = await financialsAPI(list[i].symbol);
            let annuals = financials.financials.annuals;
            let quarterly = financials.financials.quarterly;
            for (f in annuals["Fiscal Year"]) {
                let currentData = {
                    ttm: annuals["Fiscal Year"][f] === "TTM",
                    date: (annuals["Fiscal Year"][f] === "TTM") ? new Date() : new Date(annuals["Fiscal Year"][f].slice(0, 4), annuals["Fiscal Year"][f].slice(6, 8)),
                    symbol: list[i].symbol,
                    }

                    try{
                        let qSharesOutstanding = quarterly.valuation_and_quality["Shares Outstanding (EOP)"]
                        let current_quarter_so = Object.keys(qSharesOutstanding).splice(-1)[0]
                        currentData.shares_outstanding_quarterly = qSharesOutstanding[current_quarter_so]
                    }
                    catch{currentData.shares_outstanding_quarterly = null;}

                    try{currentData.price =  parseFloat(annuals.valuation_and_quality["Month End Stock Price"][f])}
                        catch{currentData.price =  null}
                    try{ currentData.net_debt =  parseFloat(annuals.balance_sheet["Long-Term Debt"][f]) + parseFloat(annuals.balance_sheet["Short-Term Debt & Capital Lease Obligation"][f]) + parseFloat(annuals.balance_sheet["Minority Interest"][f]) - parseFloat(annuals.balance_sheet["Cash And Cash Equivalents"][f]) - parseFloat(annuals.balance_sheet["Marketable Securities"][f])}
                        catch{currentData.net_debt = null}
                    try{currentData.market_cap =  parseFloat(annuals.valuation_and_quality["Market Cap"][f])}
                        catch{currentData.market_cap = null}
                    try{ currentData.yield =  parseFloat(annuals.valuation_ratios["Dividend Yield %"][f])}
                        catch{ currentData.yield = null}
                    try{currentData.dividend =  parseFloat(annuals.common_size_ratios["Dividend Payout Ratio"][f])}
                        catch{currentData.dividend = null}
                    try{currentData.asset_turnover =  parseFloat(annuals.common_size_ratios["Asset Turnover"][f])}
                        catch{currentData.asset_turnover = null}
                    try{currentData.revenue =  parseFloat(annuals.income_statement.Revenue[f])}
                        catch{currentData.revenue = null}
                    try{ currentData.enterprise_value =  parseFloat(annuals.valuation_and_quality["Enterprise Value ($M)"][f])}
                        catch{ currentData.enterprise_value =  null}
                    try{currentData.effective_tax =  parseFloat(annuals.income_statement["Tax Rate %"][f])}
                        catch{currentData.effective_tax = null}
                    try{currentData.shares_outstanding =  parseFloat(annuals.valuation_and_quality["Shares Outstanding (EOP)"][f])}
                        catch{currentData.shares_outstanding = null}
                    try{currentData.aebitda =  Math.round(parseFloat(annuals.cashflow_statement["Stock Based Compensation"][f]) + parseFloat(annuals.income_statement.EBITDA[f]))}
                        catch{currentData.aebitda = Math.round( 0 + parseFloat(annuals.income_statement.EBITDA[f]))}
                    try{ currentData.wacc =  parseFloat(annuals.common_size_ratios["WACC %"][f])}
                        catch{ currentData.wacc = null}
                    try{currentData.capex =  parseFloat(annuals.cashflow_statement["Capital Expenditure"][f])}
                        catch{currentData.capex = null}
                    try{currentData.eps_basic =  parseFloat(annuals.income_statement["EPS (Basic)"][f])}
                        catch{currentData.eps_basic =  null}
                    try{currentData.eps_without_nri =  parseFloat(annuals.per_share_data_array["EPS without NRI"][f])}
                        catch{currentData.eps_without_nri = null}
                    try { currentData.roe = parseFloat(annuals.common_size_ratios["ROE %"][f]); }
                        catch { currentData.roe = "Does not exist" }
                    try{ currentData.roic = parseFloat(annuals.common_size_ratios["ROIC %"][f]); }
                        catch{ currentData.roic = NaN; }
                    try { currentData.fcf = parseFloat(annuals.cashflow_statement["Free Cash Flow"][f]); }
                        catch { currentData.fcf = NaN; }
                    try { currentData.fcfmargin = parseFloat(annuals.common_size_ratios["FCF Margin %"][f]); }
                        catch { currentData.fcfmargin = NaN; }
                    try { currentData.ppe = parseFloat(annuals.balance_sheet["Property, Plant and Equipment"][f]); }
                        catch{ currentData.ppe = NaN; }
                    try { currentData.purchase_of_business = parseFloat(annuals.cashflow_statement["Purchase Of Business"][f]); }
                        catch{ currentData.purchase_of_business = NaN; }
                    try { currentData.total_stockholder_equity = parseFloat(annuals.balance_sheet["Total Stockholders Equity"][f]); }
                        catch{ currentData.total_stockholder_equity = NaN; }
                    try { currentData.st_debt_lease_obligations = parseFloat(annuals.balance_sheet["Short-Term Debt & Capital Lease Obligation"][f]); }
                        catch{ currentData.st_debt_lease_obligations = NaN; }
                    try { currentData.lt_debt_lease_obligations = parseFloat(annuals.balance_sheet["Long-Term Debt & Capital Lease Obligation"][f]); }
                        catch{ currentData.lt_debt_lease_obligations = NaN; }
                    try { currentData.net_income = parseFloat(annuals.income_statement["Net Income"][f]); }
                        catch{ currentData.net_income = NaN; }
                    try { currentData.employees = Number(annuals.valuation_and_quality["Number of Employees"][f]); }
                        catch{ currentData.employees = NaN; }
                    try { currentData.totalAssets = Number(annuals.balance_sheet["Total Assets"][f]); }
                        catch{ currentData.totalAssets = NaN; }
                    try { currentData.grossMargin = Number(annuals.income_statement["Gross Margin %"][f]); }
                        catch{ currentData.grossMargin = NaN; }
                    try { currentData.operatingMargin = Number(annuals.income_statement["Operating Margin %"][f]); }
                        catch{ currentData.operatingMargin = NaN; }
                    try { currentData.owner_earning = Number(annuals.per_share_data_array["Owner Earnings per Share (TTM)"][f]); }
                        catch{ currentData.owner_earning = NaN; }
                    try { currentData.book_value_per_share = Number(annuals.per_share_data_array["Book Value per Share"][f]); }
                        catch{ currentData.dividend_payout_ratio = NaN; }
                    try { currentData.netmargin = Number(annuals.common_size_ratios["Net Margin %"][f]); }
                        catch{ currentData.netmargin = NaN; }
                    try { currentData.dividend_yield = Number(annuals.valuation_ratios["Dividend Yield %"][f]); }
                        catch{ currentData.dividend_yield = NaN; }
                currentStock.data.push(currentData)
            }
        } catch (err) {
            console.log(err)
        } finally {
            currentData = []
        }
        try {
            console.log(currentStock.data.length)
            if(currentStock.company != 'Failed to get company name' && currentStock.data.length != 0){
                var stocks = await db.addStocks(
                    currentStock.symbol, 
                    currentStock.company, 
                    currentStock.sector, 
                    currentStock.current_price, 
                    username, 
                    currentStock.comment, 
                    currentStock.gfrating, 
                    currentStock.predictability,
                    currentStock.financialStrength,
                    shared, 
                    special)
            }
        }
        catch (err) { var stocks = await db.runQuery('SELECT stock_id FROM stocks WHERE symbol = $1 AND username = $2', [currentStock.symbol, username]) }

        console.log(stocks.rows[0])
        for (d in currentStock.data) {
            currentStock.data[d].stock_id = stocks.rows[0].stock_id
        }
        await db.arrayAddStockData(currentStock.data)
    }
}

module.exports = {
    gurufocusAdd,
    update_prices,
    financialsAPI
}
