const bcrypt = require('bcrypt');
const db = require('./database');


/* Constants */
const saltRounds = 12

/*** Functions ***/

/* Signup */
const signup = async (username, password, passwordConfirm) => {
    let usernameAvailable = await db.usernameAvailable(username)

    if (username.length < 3 || username.length > 32) { //Username too short/long
        throw `Username must be between 3-32 characters`
    } else if (!usernameAvailable) { //Username not available
        throw `${username} already in use.`
    } else if (password != passwordConfirm) {//Passwords do not match
        throw `Passwords do not match.`
    } else if (password.length < 8) {//Passwords too short
        throw `Password must be at least 8 characters`
    } else { //Success
        let hash = await generateHash(password)
        db.addUser(username, hash)
        return `${username}'s account added!`
    }
}


/* Login */
const login = async (username, password) => {
    const user = await db.retrieveUser(username)
    const match = await bcrypt.compare(password, user.password);
    if (match) {
        return true
    } else {
        throw `Username or Password does not match.`
    }
}

/* Uses bcrypt to return a salted hash */
const generateHash = async (password) => {
    const hashedPass = await new Promise((resolve, reject) => {
        bcrypt.hash(password, saltRounds, (err, hash) => {
            if (err) reject(err)
            resolve(hash)
        })
    })
    return hashedPass
}


module.exports = {
    signup,
    login
}





