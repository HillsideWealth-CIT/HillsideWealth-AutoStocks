/* Pool Setup */
const { Pool } = require('pg')
const pool = new Pool({
    connectionString: process.env.SECOND_DATABASE_URL,
    ssl: true
})

const _ = require('lodash')

/* Runs a query */
const runQuery = async (query, param) => {
    const client = await pool.connect()
    try {
        const res = await client.query(query, param)
        return res
    } finally {
        client.release()
    }
}


/* Adds user to database */
const addUser = async (username, password) => {
    return await runQuery('INSERT INTO users (username, password) VALUES ($1, $2)', [username, password])
}


/* Checks if username exists in the database.
** Return true if username is not in use, and return false if username is already used*/
const usernameAvailable = async (username) => {
    const match = await runQuery('SELECT username FROM users WHERE username = $1', [username])
    if (match.rows.length === 0) {
        return true
    } else {
        return false
    }
}

/* Returns user object with matching username
** Throws 'user does not exist!' warning if user is not found.*/
const retrieveUser = async (username) => {
    const match = await runQuery('SELECT * FROM users WHERE username = $1', [username])
    if (match.rows.length != 0) {
        return match.rows[0]
    } else {
        throw `${username} does not exist!`
    }
}


/* Shows stocks and all the data for that stock
** Will return an array wih this format:
**  [
    {
        stock_name: Apple Inc:
        symbol: APPL
        stockdata: [{
            stockdata_id: 1
            date: <timestamp>
            <etc>
        },
        stockdata_id: 2
            date: <timestamp>
            <etc>
        }]
    },
    {<etc>},
    {<etc>}
    ]
*/

const showstocks = async (username) => {
    let stocks = await runQuery('SELECT * FROM stocks WHERE username = $1', [username])
    //console.log(stocks)
    let stockdata = await runQuery(`SELECT * FROM stockdata ORDER BY date DESC`)
    return getdata(stocks, stockdata)
}

const showshared = async (username) => {
    let stocks = await runQuery("SELECT * FROM stocks WHERE shared ='t'")
    //console.log(stocks)
    let stockdata = await runQuery(`SELECT * FROM stockdata ORDER BY date DESC`)
    return getdata(stocks, stockdata)
}

const showSpecial = async (username) => {
    let stocks = await runQuery("SELECT * FROM STOCKS WHERE USERNAME = $1 AND special = true", [username]);
    let stockdata = await runQuery(`SELECT * FROM stockdata ORDER BY date DESC`);
    return getdata(stocks, stockdata);
}

const get_added = async (symbol, username) => {
    let stocks = await runQuery('SELECT * from stocks WHERE symbol = $1 AND username = $2', [symbol, username])
    let stockdata = await runQuery(`SELECT * FROM stockdata ORDER BY date DESC`)
    return getdata(stocks, stockdata)
}

const get_by_id = async (id) => {
    let stocks = await runQuery('SELECT * from stocks WHERE stock_id= $1', [id])
    let stockdata = await runQuery(`SELECT * FROM stockdata ORDER BY date DESC`)
    return getdata(stocks, stockdata)
}

const sharestock = async(id_string) => {
    // console.log(id_string)
    await runQuery(`UPDATE stocks SET shared='True' where ${id_string};`);
    return
}

const unsharestock = async(symbol, user) => {
    await runQuery(`UPDATE stocks SET shared='False' where symbol='${symbol}' and username='${user}';`);
    return symbol
}

const setSpecial = async(id_string) => {
    console.log(id_string)
    await runQuery(`UPDATE stocks SET special=true WHERE ${id_string};`);
    return
}

const unsetSpecial = async(symbol, user) => {
    await runQuery(`UPDATE stocks SET special=false WHERE symbol='${symbol}'`);
    return symbol
}


/* Parses an array of JSON stockdata and adds it to the database.
Use this when there's more than one set of data and they all have the same fields.*/
const arrayAddStockData = async (data) => {
    if (data.length == 0) {
        return
    } else {
        let columns = []
        let params = []
        let placeholders = []
        for (i in data) {
            if (data[i].stock_id != null) {
                if (i == 0) columns.push('stock_id')
                placeholders.push(`$${params.push(data[i].stock_id)}`)
            }
            if (data[i].date != null) {
                if (i == 0) columns.push('date')
                placeholders.push(`$${params.push(data[i].date)}`)
            }
            if (data[i].notes != null) {
                if (i == 0) columns.push('notes')
                placeholders.push(`$${params.push(data[i].notes)}`)
            }
            if (data[i].dividend != null) {
                if (i == 0) columns.push('dividend')
                placeholders.push(`$${params.push(parseFloat(isFinite(data[i].dividend) ? data[i].dividend : 0.0))}`)
            }
            if (data[i].yield != null) {
                if (i == 0) columns.push('yield')
                placeholders.push(`$${params.push(parseFloat(isFinite(data[i].yield) ? data[i].yield : 0.0))}`)
            }
            if (data[i].price != null) {
                if (i == 0) columns.push('price')
                placeholders.push(`$${params.push(parseFloat(isFinite(data[i].price) ? data[i].price : 0.0))}`)
            }
            if (data[i].shares_outstanding != null) {
                if (i == 0) columns.push('shares_outstanding')
                placeholders.push(`$${params.push(parseFloat(isFinite(data[i].shares_outstanding) ? data[i].shares_outstanding : 0.0))}`)
            }
            if (data[i].market_cap != null) {
                if (i == 0) columns.push('market_cap')
                placeholders.push(`$${params.push(parseFloat(isFinite(data[i].market_cap) ? data[i].market_cap : 0.0))}`)
            }
            if (data[i].net_debt != null) {
                if (i == 0) columns.push('net_debt')
                placeholders.push(`$${params.push(parseFloat(isFinite(data[i].net_debt) ? data[i].net_debt : 0.0))}`)

            }
            if (data[i].enterprise_value != null) {
                if (i == 0) columns.push('enterprise_value')
                placeholders.push(`$${params.push(parseFloat(isFinite(data[i].enterprise_value) ? data[i].enterprise_value : 0.0))}`)
            }
            if (data[i].revenue != null) {
                if (i == 0) columns.push('revenue')
                placeholders.push(`$${params.push(parseFloat(isFinite(data[i].revenue) ? data[i].revenue : 0.0))}`)
            }
            if (data[i].aebitda != null) {
                if (i == 0) columns.push('aebitda')
                placeholders.push(`$${params.push(parseFloat(isFinite(data[i].aebitda) ? data[i].aebitda : 0.0))}`)
            }
            if (data[i].asset_turnover != null) {
                if (i == 0) columns.push('asset_turnover')
                placeholders.push(`$${params.push(parseFloat(isFinite(data[i].asset_turnover) ? data[i].asset_turnover : 0.0))}`)
            }
            if (data[i].roe != null) {
                if (i == 0) columns.push('roe')
                placeholders.push(`$${params.push(parseFloat(isFinite(data[i].roe) ? data[i].roe : 0.0))}`)
            }
            if (data[i].effective_tax != null) {
                if (i == 0) columns.push('effective_tax')
                placeholders.push(`$${params.push(parseFloat(isFinite(data[i].effective_tax) ? data[i].effective_tax : 0.0))}`)
            }
            if (data[i].fcf != null) {
                if (i == 0) columns.push('fcf')
                placeholders.push(`$${params.push(parseFloat(isFinite(data[i].fcf) ? data[i].fcf : 0.0))}`)
            }
            if (data[i].fcfmargin != null) {
                if (i == 0) columns.push('fcfmargin')
                placeholders.push(`$${params.push(parseFloat(isFinite(data[i].fcfmargin) ? data[i].fcfmargin : 0.0))}`)
            }
            if (data[i].roic != null) {
                if (i == 0) columns.push('roic')
                placeholders.push(`$${params.push(parseFloat(isFinite(data[i].roic) ? data[i].roic : 0.0))}`)
            }
            if (data[i].wacc != null) {
                if (i == 0) columns.push('wacc')
                placeholders.push(`$${params.push(parseFloat(isFinite(data[i].wacc) ? data[i].wacc : 0.0))}`)
            }
            if (data[i].capex != null) {
                if (i == 0) columns.push('capex')
                placeholders.push(`$${params.push(parseFloat(isFinite(data[i].capex) ? data[i].capex : 0.0))}`)
            }
            if (data[i].eps_basic != null) {
                if (i == 0) columns.push('eps_basic')
                placeholders.push(`$${params.push(parseFloat(isFinite(data[i].eps_basic) ? data[i].eps_basic : 0.0))}`)
            }
            if (data[i].eps_without_nri != null) {
                if (i == 0) columns.push('eps_without_nri')
                placeholders.push(`$${params.push(parseFloat(isFinite(data[i].eps_without_nri) ? data[i].eps_without_nri : 0.0))}`)
            }
            if(data[i].shares_outstanding_quarterly != null){
                if(i == 0) columns.push('shares_outstanding_quarterly')
                placeholders.push(`$${params.push(parseFloat(isFinite(data[i].shares_outstanding_quarterly) ? data[i].shares_outstanding_quarterly : 0.0))}`)
            }
            if(data[i].ppe != null){
                if(i == 0) columns.push('ppe')
                placeholders.push(`$${params.push(parseFloat(isFinite(data[i].ppe) ? data[i].ppe : 0.0))}`)
            }
            if(data[i].purchase_of_business != null){
                if(i == 0) columns.push('purchase_of_business')
                placeholders.push(`$${params.push(parseFloat(isFinite(data[i].purchase_of_business) ? data[i].purchase_of_business : 0.0))}`)
            }
            if(data[i].total_stockholder_equity != null){
                if(i == 0) columns.push('total_stockholder_equity')
                placeholders.push(`$${params.push(parseFloat(isFinite(data[i].total_stockholder_equity) ? data[i].total_stockholder_equity : 0.0))}`)
            }
            if(data[i].st_debt_lease_obligations != null){
                if(i == 0) columns.push('st_debt_lease_obligations')
                placeholders.push(`$${params.push(parseFloat(isFinite(data[i].st_debt_lease_obligations) ? data[i].st_debt_lease_obligations : 0.0))}`)
            }
            if(data[i].lt_debt_lease_obligations != null){
                if(i == 0) columns.push('lt_debt_lease_obligations')
                placeholders.push(`$${params.push(parseFloat(isFinite(data[i].lt_debt_lease_obligations) ? data[i].lt_debt_lease_obligations : 0.0))}`)
            }
            if(data[i].net_income != null){
                if(i == 0) columns.push('net_income')
                placeholders.push(`$${params.push(parseFloat(isFinite(data[i].net_income) ? data[i].net_income : 0.0))}`)
            }
            if(data[i].employees != null){
                if(i == 0) columns.push('employees')
                placeholders.push(`$${params.push(parseFloat(isFinite(data[i].employees) ? data[i].employees : 0.0))}`)
            }
            if(data[i].totalAssets != null){
                if(i == 0) columns.push('totalAssets')
                placeholders.push(`$${params.push(parseFloat(isFinite(data[i].totalAssets) ? data[i].totalAssets : 0.0))}`)
            }
            if(data[i].grossMargin != null){
                if(i == 0) columns.push('grossMargin')
                placeholders.push(`$${params.push(parseFloat(isFinite(data[i].grossMargin) ? data[i].grossMargin : 0.0))}`)
            }
            if(data[i].operatingMargin != null){
                if(i == 0) columns.push('operatingMargin')
                placeholders.push(`$${params.push(parseFloat(isFinite(data[i].operatingMargin) ? data[i].operatingMargin : 0.0))}`)
            }
            if(data[i].owner_earning != null){
                if(i == 0) columns.push('owner_earning')
                placeholders.push(`$${params.push(parseFloat(isFinite(data[i].owner_earning) ? data[i].owner_earning : 0.0))}`)
            }
            if(data[i].book_value_per_share != null){
                if(i == 0) columns.push('book_value_per_share')
                placeholders.push(`$${params.push(parseFloat(isFinite(data[i].book_value_per_share) ? data[i].book_value_per_share : 0.0))}`)
            }
            if(data[i].netmargin != null){
                if(i == 0) columns.push('netmargin')
                placeholders.push(`$${params.push(parseFloat(isFinite(data[i].netmargin) ? data[i].netmargin : 0.0))}`)
            }
            if(data[i].dividend_yield != null){
                if(i == 0) columns.push('dividend_yield')
                placeholders.push(`$${params.push(parseFloat(isFinite(data[i].dividend_yield) ? data[i].dividend_yield : 0.0))}`)
            }
            if(data[i].dividendspershare != null){
                if(i == 0) columns.push('dividendspershare')
                placeholders.push(`$${params.push(parseFloat(isFinite(data[i].dividendspershare) ? data[i].dividendspershare : 0.0))}`)
            }
            if(data[i].cap_lease_debt != null){
                if(i == 0) columns.push('cap_lease_debt')
                placeholders.push(`$${params.push(parseFloat(isFinite(data[i].cap_lease_debt) ? data[i].cap_lease_debt : 0.0))}`)
            }
            if(data[i].fror != null){
                if(i == 0) columns.push('fror')
                placeholders.push(`$${params.push(parseFloat(isFinite(data[i].fror) ? data[i].fror : 0.0))}`)
            }
            if(data[i].flow_ratio != null){
                if(i == 0) columns.push('flow_ratio')
                placeholders.push(`$${params.push(parseFloat(isFinite(data[i].flow_ratio) ? data[i].flow_ratio : 0.0))}`)
            }
            if(data[i].operating_cushion != null){
                if(i == 0) columns.push('operating_cushion')
                placeholders.push(`$${params.push(parseFloat(isFinite(data[i].operating_cushion) ? data[i].operating_cushion : 0.0))}`)
            }
            if(data[i].working_capital != null){
                if(i == 0) columns.push('working_capital')
                placeholders.push(`$${params.push(parseFloat(isFinite(data[i].working_capital) ? data[i].working_capital : 0.0))}`)
            }
            if(data[i].ebit != null){
                if(i == 0) columns.push('ebit')
                placeholders.push(`$${params.push(parseFloat(isFinite(data[i].ebit) ? data[i].ebit : 0.0))}`)
            }
            if(data[i].capital_employed != null){
                if(i == 0) columns.push('capital_employed')
                placeholders.push(`$${params.push(parseFloat(isFinite(data[i].capital_employed) ? data[i].capital_employed : 0.0))}`)
            }
            if(data[i].cashflow_reinvestment_rate != null){
                if(i == 0) columns.push('cashflow_reinvestment_rate')
                placeholders.push(`$${params.push(parseFloat(isFinite(data[i].cashflow_reinvestment_rate) ? data[i].cashflow_reinvestment_rate : 0.0))}`)
            }
            if(data[i].reinvested_cf_jdv != null){
                if(i == 0) columns.push('reinvested_cf_jdv')
                placeholders.push(`$${params.push(parseFloat(isFinite(data[i].reinvested_cf_jdv) ? data[i].reinvested_cf_jdv : 0.0))}`)
            }
            if(data[i].month_end_price != null){
                if(i == 0) columns.push('month_end_price')
                placeholders.push(`$${params.push(parseFloat(isFinite(data[i].month_end_price) ? data[i].month_end_price : 0.0))}`)
            }
            if(data[i].cash_conversion_cycle != null){
                if(i == 0) columns.push('cash_conversion_cycle')
                placeholders.push(`$${params.push(parseFloat(isFinite(data[i].cash_conversion_cycle) ? data[i].cash_conversion_cycle : 0.0))}`)
            }
            if(data[i].invested_capital != null){
                if(i == 0) columns.push('invested_capital')
                placeholders.push(`$${params.push(parseFloat(isFinite(data[i].invested_capital) ? data[i].invested_capital : 0.0))}`)
            }
            if (i == 0) { columns.push('ttm') }
            placeholders.push(`$${params.push(data[i].ttm)}`)
        }
        params.forEach((num) => {
            if (Number.isNaN(num)) {
                num = null
            }
        })
        let query = `INSERT INTO stockdata (${columns.join(', ')}) VALUES`
        for (let i = 0; i < ((params.length + 1) / columns.length) - 1; i++) {
            //console.log(i * columns.length, i * columns.length + columns.length)
            query += (` (${placeholders.slice(i * columns.length, i * columns.length + columns.length).join(', ')}),`)
        }
        query = _.trimEnd(query, ',')
        query += ` ON CONFLICT (stock_id, date) DO UPDATE SET stock_id = excluded.stock_id, date = excluded.date`
        //console.log(query)
        //console.log(params)
        //await runQuery(`DELETE FROM stockdata WHERE ttm = TRUE AND stock_id = $1`, [data[0].stock_id])
        await runQuery(`DELETE FROM stockdata WHERE stock_id = $1`, [data[0].stock_id])
        return await runQuery(query, params)
    }
}
/* runQuery('update stockdata set date = $1 WHERE date= $2', [new Date(new Date().setDate(new Date().getDate()-1)), new Date()])
 */

const updatePrices = async(stock, stockName, username, sector, current_price, gfrating, predictability, financialStrength) => {
    return await runQuery(`UPDATE stocks SET sector = $1, current_price = $2, gfrating = $3, predictability = $4, financialstrength = $5, stock_name = $6 where username = $7 and symbol = $8`,
        [
            sector,
            current_price,
            gfrating,
            predictability,
            financialStrength,
            stockName,
            username,
            stock,

        ])
}

const addStocks = async (symbol, stock_name, stock_sector, current_price,username, note, gfrating, predictability, financialStrength, shared, special) => {
    return await runQuery(`INSERT INTO stocks (symbol, stock_name, sector, current_price, username, note, gfrating, predictability, financialStrength, shared, special) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING stock_id`, 
    [
        symbol,
        stock_name,
        stock_sector,
        current_price,
        username, 
        note, 
        gfrating, 
        predictability,
        financialStrength,
        shared, 
        special
    ])
}


const removeStocks = async (symbol, username) => {
    return await runQuery(`DELETE from stocks WHERE symbol=$1 AND username =$2`, [symbol, username])
}

const toggleStock = async (stock_id, username) => {
    console.log(stock_id, username)
    return await runQuery('UPDATE stocks SET enabled = NOT (SELECT enabled FROM stocks WHERE stock_id = $1) WHERE stock_id = $2 AND username = $3 RETURNING *',[stock_id,stock_id, username])
}

const retrieveCodes = async () => {
    return await runQuery('SELECT * from codes')
}

const changeStatus = async (username, status) => {
    return await runQuery('UPDATE users SET status = $1 WHERE username = $2', [status, username])
}

const changeCode = async (newcode, code_id) => {
    return await runQuery(`UPDATE codes SET code = $1 WHERE code_id = $2 `, [newcode, code_id])
}

const retrieveAllUsers = async () => {
    return await runQuery('SELECT * from users')
}

const dfc_edits = async(values, list) => {
    // console.log(values)
    // console.log(list)
    return await runQuery(`Update stockdata set terminal_growth_rate = $1, discount_rate = $2, growth_years = $3, terminal_years = $4 where ${list};`, [values.tgr/100, values.dr/100, values.gy, values.ty])
}

const edits = async(edit) => {
    return await runQuery(`UPDATE stocks SET NOTE = $1, moat = $2, fairvalue = $3, fivestar = $4, onestar = $5, emoticons = $6, jdv = $7, current_price = $8, ownership = $9,ms_stock_exchange = $10, links = $11 where stock_id = $12`, [edit.comment, edit.ms_moat, 0, 0, 0, edit.emoticon, edit.jdv, edit.price, edit.ownership, 0, edit.links, edit.id])
}

const set_categories = async(category_string, conditions) => {
    return await runQuery(`UPDATE stocks set categories = '${category_string}' where ${conditions}`)
}

const get_indicators = async(username) => {
    return await runQuery(`select * from indicators where username = '${username}'`)
}

const addIndicators = async(username, values) => {
    await runQuery('INSERT INTO indicators(username, indicators, leadtime, months_since_peak, recession_level, current_level, links) values($1, $2, $3, $4, $5, $6, $7)', [username, values.indicator, values.leadTime, values.monthsSince, values.recessionLevel, values.currentLevel, values.link])
    return await runQuery(`SELECT * FROM indicators WHERE indicators = $1 AND username=$2 ORDER BY indicator_id DESC`, [values.indicator, username])
}

const editIndicators = async (values) => {
    await runQuery(`update indicators set indicators=$1, leadtime=$2, months_since_peak=$3, recession_level=$4, current_level=$5, links=$6  where indicator_id = $7`, [values.indicator, values.leadTime, values.monthsSince, values.recessionLevel, values.currentLevel, values.link, values.indicator_id])
    return await runQuery(`SELECT * FROM indicators WHERE indicator_id = $1`, [values.indicator_id])
}

const deleteIndicator = async (values) => {
    return await runQuery(`delete from indicators where indicator_id = $1`, [values.indicatorId])
}

const createAggregation = async(username, aggString, name) => {
    return await runQuery(`INSERT INTO aggregation(username, aggregate_string, name) values($1, $2, $3)`, [username, aggString, name])
}

const retrieveAggregates = async(username) => {
    return await runQuery('SELECT * from aggregation where username = $1', [username])
}

const getAggregateSingle = async(aggString, username) => {
    return await runQuery(`SELECT * FROM aggregation WHERE aggregate_string = $1 AND username= $2;`, [aggString, username])
}

const editAggregate = async(username, aggregate_string, name) => {
    return await runQuery(`update aggregation set aggregate_string = $1 where username = $2 and name=$3;`, [aggregate_string.trim(), username, name])
}

const deleteAggregate = async(id) => {
    return await runQuery(`DELETE FROM aggregation where aggregation_id = $1`, [id])
}

const getTableConfig = async(username, table_type) => {
    let returnedData;
    if(table_type === "historic") returnedData = await runQuery(`SELECT * from tableconfig where username = $1 and set_historical = true;`, [username]);
    else if(table_type === "custom") returnedData = await runQuery(`SELECT * from tableconfig where username = $1 and set_custom = true;`, [username])
    else returnedData = await runQuery(`SELECT * from tableconfig where username = $1 and set_custom = true;`, [username]);

    if (returnedData.rows.length !== 0) return returnedData;
    else return await runQuery(`Select * from tableconfig where fallback=true`);
}

const customTableSettings = async(data, action) => {
    console.log(data)
    if(action === "getConfigs") return await runQuery(`SELECT id, name FROM tableconfig where username = $1`, [data.username]);
    else if (action === "edit") return await runQuery(`Update tableconfig set config_string = $1, name = $2 where id = $3;`, [data.configString, data.name, data.id]);
    else if (action === "add") return await runQuery(`INSERT INTO tableconfig (username, table_type, config_string, name) VALUES ($1, $2, $3, $4);`, [data.username, data.table, data.configString, data.configName])
    else if (action === "switchCustom"){ 
        await runQuery(`UPDATE tableconfig SET set_custom = false where username = $1`, [data.username])
        return await runQuery(`UPDATE tableconfig SET set_custom = true where id = $1`, [data.id])
    }
    else if (action === "switchHistorical"){ 
        await runQuery(`UPDATE tableconfig SET set_historical = false where username = $1`, [data.username])
        return await runQuery(`UPDATE tableconfig SET set_historical = true where id = $1`, [data.id])
    }
    else if (action === "delete") return await runQuery(`DELETE FROM tableconfig where id=$1`,[data.id])
}

const comments = async(data) => {
    console.log(data)
    if(data.action === "get"){
        return await runQuery(`
            SELECT 
            inside_ownership,
            institutional_ownership,
            link,
            founder_run_board,
            competitors,
            competative_position,
            source_of_moats,
            insider_activity,
            mgmt_comp,
            funds,
            articles
            from stocks where stock_id = $1;`
            , [data.id])
    }
    else if(data.action === "set"){
        let format = [];
        for(let key in data.data){
            format.push(JSON.stringify(data.data[key]))
        }
        return await runQuery(`
            UPDATE stocks SET
                inside_ownership = $1,
                institutional_ownership = $2,
                link = $3,
                founder_run_board = $4,
                competitors = $5,
                competative_position = $6,
                source_of_moats = $7,
                insider_activity = $8,
                mgmt_comp = $9,
                funds = $10,
                articles = $11
                WHERE stock_id = $12;
        `, [...format, data.id])
    }
}

module.exports = {
    addUser,
    usernameAvailable,
    retrieveUser,
    showstocks,
    showshared,
    showSpecial,
    addStocks,
    removeStocks,
    runQuery,
    arrayAddStockData,
    retrieveCodes,
    changeStatus,
    retrieveAllUsers,
    changeCode,
    toggleStock,
    sharestock,
    unsharestock,
    setSpecial,
    unsetSpecial,
    updatePrices,
    get_added,
    get_by_id,
    dfc_edits,
    edits,
    set_categories,
    get_indicators,
    addIndicators,
    editIndicators,
    deleteIndicator,
    createAggregation,
    retrieveAggregates,
    getAggregateSingle,
    editAggregate,
    deleteAggregate,
    getTableConfig,
    customTableSettings,
    comments,
}

function getdata(stocks, stockdata){
    let stockAndData = []
    for (i in stocks.rows) {
        stockAndData.push({
            stock_id: stocks.rows[i].stock_id,
            symbol: stocks.rows[i].symbol,
            stock_name: stocks.rows[i].stock_name,
            stocksector:stocks.rows[i].sector,
            stock_current_price: `$${stocks.rows[i].current_price}`,
            note: stocks.rows[i].note,
            enabled: stocks.rows[i].enabled,
            stockdata: stockdata.rows.filter(data => data.stock_id == stocks.rows[i].stock_id),
            gfrating: stocks.rows[i].gfrating,
            onestar: `${stocks.rows[i].onestar}`,
            fivestar: `${stocks.rows[i].fivestar}`,
            moat: stocks.rows[i].moat,
            fairvalue: `${stocks.rows[i].fairvalue}`,
            jdv: stocks.rows[i].jdv,
            emoticon: stocks.rows[i].emoticons,
            username: stocks.rows[i].username,
            categories: `${stocks.rows[i].categories}`,
            ownership: stocks.rows[i].ownership,
            msse: stocks.rows[i].ms_stock_exchange,
            links: stocks.rows[i].links,
            predictability: stocks.rows[i].predictability,
            financialStrength: stocks.rows[i].financialstrength,
            special: stocks.rows[i].special,
            shared: stocks.rows[i].shared
        })
    }
    return stockAndData
}