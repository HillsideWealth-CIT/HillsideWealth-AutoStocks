/* Pool Setup */
const { Pool } = require('pg')
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
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
                placeholders.push(`$${params.push(parseFloat(data[i].dividend))}`)
            }
            if (data[i].yield != null) {
                if (i == 0) columns.push('yield')
                placeholders.push(`$${params.push(parseFloat(data[i].yield))}`)
            }
            if (data[i].price != null) {
                if (i == 0) columns.push('price')
                placeholders.push(`$${params.push(parseFloat(data[i].price))}`)
            }
            if (data[i].shares_outstanding != null) {
                if (i == 0) columns.push('shares_outstanding')
                placeholders.push(`$${params.push(parseFloat(data[i].shares_outstanding))}`)
            }
            if (data[i].market_cap != null) {
                if (i == 0) columns.push('market_cap')
                placeholders.push(`$${params.push(parseFloat(data[i].market_cap))}`)
            }
            if (data[i].net_debt != null) {
                if (i == 0) columns.push('net_debt')
                placeholders.push(`$${params.push(parseFloat(data[i].net_debt))}`)

            }
            if (data[i].enterprise_value != null) {
                if (i == 0) columns.push('enterprise_value')
                placeholders.push(`$${params.push(parseFloat(data[i].enterprise_value))}`)
            }
            if (data[i].revenue != null) {
                if (i == 0) columns.push('revenue')
                placeholders.push(`$${params.push(parseFloat(data[i].revenue))}`)
            }
            if (data[i].aebitda != null) {
                if (i == 0) columns.push('aebitda')
                placeholders.push(`$${params.push(parseFloat(data[i].aebitda))}`)
            }
            if (data[i].asset_turnover != null) {
                if (i == 0) columns.push('asset_turnover')
                placeholders.push(`$${params.push(parseFloat(data[i].asset_turnover))}`)
            }
            if (data[i].roe != null) {
                if (i == 0) columns.push('roe')
                placeholders.push(`$${params.push(parseFloat(data[i].roe))}`)
            }
            if (data[i].effective_tax != null) {
                if (i == 0) columns.push('effective_tax')
                placeholders.push(`$${params.push(parseFloat(data[i].effective_tax))}`)
            }
            if (data[i].fcf != null) {
                if (i == 0) columns.push('fcf')
                placeholders.push(`$${params.push(parseFloat(data[i].fcf))}`)
            }
            if (data[i].roic != null) {
                if (i == 0) columns.push('roic')
                placeholders.push(`$${params.push(parseFloat(data[i].roic))}`)
            }
            if (data[i].wacc != null) {
                if (i == 0) columns.push('wacc')
                placeholders.push(`$${params.push(parseFloat(data[i].wacc))}`)
            }
            if (data[i].capex != null) {
                if (i == 0) columns.push('capex')
                placeholders.push(`$${params.push(parseFloat(data[i].capex))}`)
            }
            if (data[i].eps_basic != null) {
                if (i == 0) columns.push('eps_basic')
                placeholders.push(`$${params.push(parseFloat(data[i].eps_basic))}`)
            }
            if (data[i].eps_without_nri != null) {
                if (i == 0) columns.push('eps_without_nri')
                placeholders.push(`$${params.push(parseFloat(data[i].eps_without_nri))}`)
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

const updatePrices = async(stock, username, sector, current_price, gfrating) => {
    return await runQuery(`UPDATE stocks SET sector = '${sector}', current_price = ${current_price}, gfrating = '${gfrating}' where username = '${username}' and symbol = '${stock}'`)
}

const addStocks = async (symbol, stock_name, stock_sector, current_price,username, note, gfrating ,shared = false) => {
    return await runQuery(`INSERT INTO stocks (symbol, stock_name, sector, current_price, username, note, gfrating,shared) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING stock_id`, [symbol, stock_name, stock_sector, current_price, username, note, gfrating,shared])
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
    return await runQuery(`UPDATE stocks SET NOTE = $1, moat = $2, fairvalue = $3, fivestar = $4, onestar = $5, emoticons = $6, jdv = $7, current_price = $8 where stock_id = $9`, [edit.comment, edit.ms_moat, edit.ms_fair_value, edit.ms_5_star, edit.ms_1_star, edit.emoticon, edit.jdv, edit.price ,edit.id])
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


module.exports = {
    addUser,
    usernameAvailable,
    retrieveUser,
    showstocks,
    showshared,
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
}

function getdata(stocks, stockdata){
    let stockAndData = []
    for (i in stocks.rows) {
        stockAndData.push({
            stock_id: stocks.rows[i].stock_id,
            symbol: stocks.rows[i].symbol,
            stock_name: stocks.rows[i].stock_name,
            stocksector:stocks.rows[i].sector,
            stock_current_price: `${stocks.rows[i].current_price}`,
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
            categories: `${stocks.rows[i].categories}`
        })
    }
    return stockAndData
}