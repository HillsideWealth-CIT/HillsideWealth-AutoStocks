const { Pool } = require('pg')

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true
})

/* Runs a query */
const runQuery = async (query, param) => {
    const client = await pool.connect()
    try {
        const res = await client.query(query, param)
        console.log(res)
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



module.exports = {
    addUser,
    usernameAvailable,
    retrieveUser
}
