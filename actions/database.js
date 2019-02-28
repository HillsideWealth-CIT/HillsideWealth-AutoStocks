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
const showstocks = async () => {
    let stockAndData = []
    let stocks = await runQuery('SELECT * FROM stocks;')
    for (i in stocks.rows) {
        let currentData = await runQuery(`SELECT * FROM stockdata WHERE symbol = $1`, [stocks.rows[i].symbol])
        stockAndData.push({
            symbol: stocks.rows[i].symbol,
            stock_name: stocks.rows[i].stock_name,
            stockdata: currentData.rows
        })
    }
    return stockAndData
}

/* Parses JSON data for stock data and adds it to the database. */
const addStockData = async (data) => {
    let columns = ``
    let params = []
    let placeholders = ''
    if (data.symbol) {
        columns += 'symbol,'
        placeholders += `$${params.push(data.symbol)},`
    }
    if (data.date) {
        columns += 'date,'
        placeholders += `$${params.push(data.date)},`
    }
    if (data.notes) {
        columns += 'notes,'
        placeholders += `$${params.push(data.notes)},`
    }
    if (data.dividend) {
        columns += 'dividend,'
        placeholders += `$${params.push(data.dividend)},`
    }
    if (data.yield) {
        columns += 'yield,'
        placeholders += `$${params.push(data.yield)},`
    }
    if (data.price) {
        columns += 'price,'
        placeholders += `$${params.push(data.price)},`
    }
    if (data.sales_order) {
        columns += 'sales_order,'
        placeholders += `$${params.push(data.sales_order)},`
    }
    if (data.market_cap) {
        columns += 'market_cap,'
        placeholders += `$${params.push(data.market_cap)},`
    }
    if (data.net_debt) {
        columns += 'net_debt,'
        placeholders += `$${params.push(data.net_debt)},`
    }
    if (data.enterprise_value) {
        columns += 'enterprice_value,'
        placeholders += `$${params.push(data.enterprise_value)},`
    }
    if (data.nd_aebitda) {
        columns += 'nd_aebitda,'
        placeholders += `$${params.push(data.nd_aebitda)},`
    }
    if (data.revenue) {
        columns += 'revenue,'
        placeholders += `$${params.push(data.revenue)},`
    }
    if (data.aebitda) {
        columns += 'aebitda,'
        placeholders += `$${params.push(data.aebitda)},`
    }
    if (data.aebitda_percent) {
        columns += 'aebitda_percent,'
        placeholders += `$${params.push(data.aebitda_percent)},`
    }
    if (data.asset_turnover) {
        columns += 'asset_turnover,'
        placeholders += `$${params.push(data.asset_turnover)},`
    }
    if (data.aebitda_at) {
        columns += 'aebitda_at,'
        placeholders += `$${params.push(data.aebitda_at)},`
    }
    if (data.roe) {
        columns += 'roe,'
        placeholders += `$${params.push(data.roe)},`
    }
    if (data.effective_tax) {
        columns += 'effective_tax,'
        placeholders += `$${params.push(data.effective_tax)},`
    }
    if (data.ev_aebitda) {
        columns += 'ev_aebitda,'
        placeholders += `$${params.push(data.ev_aebitda)},`
    }
    if (data.spice) {
        columns += 'spice,'
        placeholders += `$${params.push(data.spice)},`
    }
    if (data.roe_mult) {
        columns += 'roe_mult,'
        placeholders += `$${params.push(data.roe_mult)},`
    }
    //Creates query string
    let query = `INSERT INTO stockdata (${_.trimEnd(columns, ',')}) VALUES (${_.trimEnd(placeholders, ',')});`
    return await runQuery(query, params)
}

const addStocks = async (symbol, stock_name) => {
    return await runQuery(`INSERT INTO stocks (symbol, stock_name) VALUES ($1, $2);`, [symbol, stock_name])
}


module.exports = {
    addUser,
    usernameAvailable,
    retrieveUser,
    addStockData,
    showstocks,
    addStocks
}
