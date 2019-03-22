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
    let stockAndData = []
    let stocks = await runQuery('SELECT * FROM stocks WHERE username = $1', [username])
    let stockdata = await runQuery(`SELECT * FROM stockdata WHERE stock_id = $1 ORDER BY date DESC`, [stocks.rows[0].stock_id])
    for (i in stocks.rows) {

        stockAndData.push({
            symbol: stocks.rows[i].symbol,
            stock_name: stocks.rows[i].stock_name,
            stockdata: stockdata.rows.filter(data => data.stock_id == stocks.rows[i].stock_id)
        })
    }
    console.log(stockAndData)
    return stockAndData
}

/* Parses JSON data for stock data and adds it to the database. */
const addStockData = async (data) => {
    let columns = ``
    let params = []
    let placeholders = ''
    if (data.stock_id) {
        columns += 'stock_id,'
        placeholders += `$${params.push(data.stock_id)},`
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
    if (data.shares_outstanding) {
        columns += 'shares_outstanding,'
        placeholders += `$${params.push(data.shares_outstanding)},`
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
        columns += 'enterprise_value,'
        placeholders += `$${params.push(data.enterprise_value)},`
    }
    if (data.revenue) {
        columns += 'revenue,'
        placeholders += `$${params.push(data.revenue)},`
    }
    if (data.aebitda) {
        columns += 'aebitda,'
        placeholders += `$${params.push(data.aebitda)},`
    }
    if (data.asset_turnover) {
        columns += 'asset_turnover,'
        placeholders += `$${params.push(data.asset_turnover)},`
    }
    if (data.roe) {
        columns += 'roe,'
        placeholders += `$${params.push(data.roe)},`
    }
    if (data.effective_tax) {
        columns += 'effective_tax,'
        placeholders += `$${params.push(data.effective_tax)},`
    }

    //Creates query string
    let query = `INSERT INTO stockdata (${_.trimEnd(columns, ',')}) VALUES (${_.trimEnd(placeholders, ',')});`
    console.log(query)
    return await runQuery(query, params)
}

const addStocks = async (symbol, stock_name, username) => {
    return await runQuery(`INSERT INTO stocks (symbol, stock_name, username) VALUES ($1, $2, $3) RETURNING stock_id`, [symbol, stock_name, username])
}

const removeStocks = async (symbol, username) => {
    console.log(`DELETE from stocks WHERE symbol="${symbol}"`)
    //process.exit();
    return await runQuery(`DELETE from stocks WHERE symbol=$1 AND username =$2`, [symbol, username])
}

const update_stocks = async (symbol, values, username) => {
    value = '';
    keys = Object.keys(values);
    for (let i in values) {
        value += `${i} = '${values[i]}',`;
    }
    //let query = `UPDATE stocks SET $1 WHERE symbol=$2 AND username=$3;`, [value, symbol, username];
    await runQuery(`UPDATE stocks SET $1 WHERE symbol=$2 AND username=$3;`, [value, symbol, username])
}


module.exports = {
    addUser,
    usernameAvailable,
    retrieveUser,
    addStockData,
    showstocks,
    addStocks,
    removeStocks,
    runQuery,
    update_stocks
}
