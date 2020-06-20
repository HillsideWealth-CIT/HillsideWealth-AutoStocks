#!/usr/bin/env node

require("dotenv").config();
const db = require('./actions/database');
const api_calls = require('./actions/api_calls');
const date = new Date();
const currentDay = date.getDay();

autoUpdate = async (user) => {
    let test = await db.showstocks(user);
    for(let i=0; i < test.length; i++){
        let temp = [{
            symbol: test[i].symbol,
            stock_id: test[i].stock_id,
        }]
        await api_calls.gurufocusAdd(temp, user, summaryCall=false);
        // Exits Process when Complete
        if(i == test.length - 1) process.exit();
    }
}

if(currentDay === 6) autoUpdate('vicario');
else process.exit();
