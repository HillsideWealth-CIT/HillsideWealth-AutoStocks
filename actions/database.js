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
    //console.log(stocks)
    let stockdata = await runQuery(`SELECT * FROM stockdata ORDER BY date DESC`)
    for (i in stocks.rows) {

        stockAndData.push({
            stock_id: stocks.rows[i].stock_id,
            symbol: stocks.rows[i].symbol,
            stock_name: stocks.rows[i].stock_name,
            note: stocks.rows[i].note,
            enabled: stocks.rows[i].enabled,
            stockdata: stockdata.rows.filter(data => data.stock_id == stocks.rows[i].stock_id)
        })
    }
    return stockAndData
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
            if (i == 0) { columns.push('ttm') }
            placeholders.push(`$${params.push(data[i].ttm)}`)
        }
        params.forEach((num) => {
            if (num === NaN) {
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
        await runQuery(`DELETE FROM stockdata WHERE ttm = TRUE AND stock_id = $1`, [data[0].stock_id])
        return await runQuery(query, params)
    }
}
/* runQuery('update stockdata set date = $1 WHERE date= $2', [new Date(new Date().setDate(new Date().getDate()-1)), new Date()])
 */



const addStocks = async (symbol, stock_name, username, note) => {
    return await runQuery(`INSERT INTO stocks (symbol, stock_name, username, note) VALUES ($1, $2, $3, $4) RETURNING stock_id`, [symbol, stock_name, username, note])
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

const editNote = async (note, username, stock_id) => {
    return await runQuery(`UPDATE stocks SET note = $1 WHERE username = $2 AND stock_id = $3`, [note, username, stock_id])
}


module.exports = {
    addUser,
    usernameAvailable,
    retrieveUser,
    showstocks,
    addStocks,
    removeStocks,
    runQuery,
    arrayAddStockData,
    retrieveCodes,
    changeStatus,
    retrieveAllUsers,
    changeCode,
    toggleStock,
    editNote
}
