/*** Node Modules ***/
require("dotenv").config();
const express = require("express");
const request = require("request");
const hbs = require("hbs");
const bodyParser = require("body-parser");
const session = require("client-sessions");
const app = express();
//var schedule = require('node-schedule');
const multer = require('multer');
const upload = multer({ dest: './uploads/' });
const fs = require("fs");
const _ = require("lodash")
const moment = require("moment")

hbs.registerHelper('json', function (context) {
    return JSON.stringify(context);
});

/*** Project Scripts ***/
const api_calls = require("./actions/api_calls");
const auth = require("./actions/auth");
const xlsx_parse = require("./actions/xlsx_parse");
const db = require("./actions/database");
const email = require('./actions/node_mailer');
const calc = require('./actions/calculations')

/*** Constants ***/
const port = process.env.PORT || 8080;

/*** Middlewares ***/

app.set("view engine", "hbs");
app.use(express.static(`${__dirname}/public`));
hbs.registerPartials(`${__dirname}/views/partials`);

/* Bodyparser Middlewares */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/* Session Middleware */
app.use(
    session({
        cookieName: "session",
        secret: process.env.SESSION_SECRET,
        duration: 3154000000000
    })
);

/* Checks session */
const sessionCheck = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect("/login");
    }
};

const statusCheck = (req, res, next) => {
    if (req.session.status) {
        next();
    } else {
        res.redirect("/entercode");
    }
};


/*** HTTP Requests ***/

/** GET **/

app.get("/", sessionCheck, statusCheck, (request, response) => {
    response.render("index.hbs", { i: true, admin: (request.session.status == 'admin') });
});

app.get("/register", (request, response) => {
    response.render("register.hbs");
});

app.get("/login", (request, response) => {
    response.render("login.hbs");
});

app.get("/collection", sessionCheck, statusCheck, (request, response) => {
        db.showstocks(request.session.user)
        .then(res => {
            // Calculates data before rendering
            res.forEach((stock) => {
               format_data(stock)
            })

            //console.log(res)
            //fs.writeFileSync('test.json', JSON.stringify(res));
            response.render("collection.hbs", {
                //dbdata: res,
                c: true,
                admin: (request.session.status == 'admin')
            })
        });
});
/***
 * Things that need to be changed when copying collection
 * 1. get link
 * 2. showstocks -> showshared
 * 3. collection.hbs -> sharedcollection.hbs
 * 4. c -> sc
 */
app.get("/shared", sessionCheck, statusCheck, (request, response) => {
    db.showshared(request.session.user)
    .then(res => {
        // Calculates data before rendering
        res.forEach((stock) => {
            format_data(stock)
            })
            //console.log(res)
            //fs.writeFileSync('test.json', JSON.stringify(res));
            response.render("collection.hbs", {
                dbdata: res,
                user: request.session.user,
                sc: true,
                admin: (request.session.status == 'admin')
            })
        });
});

app.get("/documentation", sessionCheck, statusCheck, (request, response) => {
    response.render("documentation.hbs", { d: true, admin: (request.session.status == 'admin') });
});

app.get("/settings", sessionCheck, statusCheck, (request, response) => {
    response.render("settings.hbs", { s: true, admin: (request.session.status == 'admin') });
});

/* Account validation page */
app.get('/entercode', sessionCheck, (request, response) => {
    response.render("entercode", { user: request.session.user })
})

app.get('/admin', sessionCheck, (request, response) => {
    if (request.session.status != 'admin') {
        response.redirect('/')
    } else {
        admin = true;
        db.retrieveCodes().then((r) => {
            let codes = r.rows
            console.log(codes)
            response.render('admin.hbs', { codes: codes, a: true })

        })
    }
})


/** POST **/

app.post('/editNote', sessionCheck, (request, response) => {
    db.editNote(request.body.note, request.session.user, request.body.stock_id)
        .then(() => response.send(true))
        .catch(() => response.send(false))
})

/* New Code */
app.post("/newCode", sessionCheck, (request, response) => {
    console.log(request.body)
    db.changeCode(request.body.newCode, request.body.code_id)
        .then((r) => {
            response.send(request.body)
        })


})


/* Enter Code */
app.post("/entercode", sessionCheck, (request, response) => {
    auth.validateCode(request.body.code)
        .then((r) => {
            db.changeStatus(request.session.user, r.trim())
                .then(() => {
                    request.session.status = r.trim()
                    console.log(r)
                    response.redirect('/')
                })
        })
        .catch((err) => {
            console.log(err)
            response.render("entercode", {
                user: request.session.user,
                error: err
            })
        })
})

app.post('/toggleStock', sessionCheck, (request, response) => {
    console.log(request.body)
    db.toggleStock(request.body.stock_id, request.session.user).then((res) => {console.log(res);response.send(res.rows[0].enabled)}).catch(err => console.log(err))
})

/* Login */
app.post("/login", (request, response) => {
    auth.login(request.body.username, request.body.password)

        .then((r) => {
            request.session.user = r.username;
            if (r.status) { request.session.status = r.status.trim() }
            response.send(JSON.stringify({ 'status': 'authorized' }));

        })
        .catch(err => {
            response.send(JSON.stringify({ 'status': err }));
        });
});

/* Register */
app.post("/register", (request, response) => {
    auth.signup(
        request.body.username,
        request.body.password,
        request.body.confirmPassword
    ).then(() => {
        request.session.user = request.body.username;
        request.session.status = null
        response.send(JSON.stringify({ 'status': 'authorized' }));
    }).catch((err) => {
        response.send(JSON.stringify({ 'status': err }));
    });
});

/* File Upload */
app.post('/upload', upload.single('myfile'), sessionCheck, statusCheck, (request, response) => {
    if ("action" in request.body != true) {
        var xlsxdata;
        xlsx_parse.xlsxjson(`./uploads/${request.file.filename}`).then((resolved) => {
            xlsxdata = JSON.parse(resolved);
            db.showstocks(request.session.user).then((resolved2) => {
                let dbdata = resolved2;
                for (i = 0; i < dbdata.length; i++) {
                    _.remove(xlsxdata, function (e) {
                        return true == dbdata[i].symbol.includes(e.Ticker);
                    });
                }
                response.render('compare.hbs', { data: xlsxdata, dbdata: dbdata, i: true, admin: (request.session.status == 'admin') });
            }).catch(err => {
                console.error(err);
            })
        }).catch(err => {
            console.error(err);
        });
    }
    else {
        switch (request.body.action) {
            case 'Append':
                api_calls.gurufocusAdd(request.body.stocks, request.session.user)
                    .then((resolve) => {
                        response.send(JSON.stringify({ stocks: resolve, action: 'Append' }));
                    })
                    .catch((reason) => console.log(reason));
                break;

            case 'Remove':
                let promises = [];
                for (let i = 0; i < request.body.stocks.length; i++) {
                    promises.push(db.removeStocks(request.body.stocks[i].symbol, request.session.user));
                }
                Promise.all(promises)
                    .then((returned) => {
                        response.send(JSON.stringify(request.body));
                    })
                break;
        }
    }

});

//Initialize Table
app.post('/init_table', sessionCheck, statusCheck, (request, response) => {
    //console.log(request.body.action)
    if(request.body.action == "init_user"){
        db.showstocks(request.session.user).then(resolve => {
            resolve.forEach((stock) => {
                format_data(stock)
            })
            response.send({data: resolve})
        })
    }
    else if(request.body.action == "init_shared"){
        db.showshared(request.session.user).then(resolve => {
            resolve.forEach((stock) => {
                format_data(stock)
            })
            response.send({data: resolve})
        })
    }
})

app.post('/edits', sessionCheck, statusCheck, (request, response) => {
    // console.log(request.body)
    db.edits(request.body.action).then(() => {
        response.send({status:'OK'})
    })
})

app.post('/append', sessionCheck, statusCheck, (request, response) => {
            // console.log(request.body)
            api_calls.gurufocusAdd(request.body.action, request.session.user)
                .then((resolve) => {
                    db.get_added(request.body.action[0].symbol, request.session.user)
                    .then((res) => {
                        res.forEach((stock) => {
                            format_data(stock)
                            })
                        //fs.writeFileSync('test.json', JSON.stringify(res))
                        response.send({data: res})
                    })
                })
                .catch((reason) => console.log(reason));
})

app.post('/append/shared', sessionCheck, statusCheck, (request, response) => {
    // console.log("test")
    // console.log(request.body.action)
    api_calls.gurufocusAdd(request.body.action, request.session.user, true, true)
        .then((resolve) => {
            db.get_added(request.body.action[0].symbol, request.session.user)
                .then((res) => {
                    res.forEach((stock)=> {
                        format_data(stock)
                    })
                    response.send({data: res})
                })
        })

})

app.post('/remove', sessionCheck, statusCheck, (request, response) => {
    console.log(request.body.action)
    let promises = [];
        for (let i = 0; i < request.body.action.length; i++) {
            promises.push(db.removeStocks(request.body.action[i], request.session.user));
        }
        Promise.all(promises)
            .then((returned) => {
                response.send({status: 'OK'});
            })
})

app.post('/remove/shared', sessionCheck, statusCheck, (request, response) => {
    let promises = [];
    for(let i =0; i < request.body.action.length; i++) {
        promises.push(db.unsharestock(request.body.action[i], request.session.user))
    }
    Promise.all(promises)
        .then((returned) => {
            response.send({status: 'OK'})
        })
})

app.post('/share', sessionCheck, statusCheck, (request, response) => {
    // console.log(request.body)
    // console.log(calc.multi_dfc_string(request.body.action))
    db.sharestock(calc.multi_dfc_string(request.body.action), request.session.user)
                .then((resolve) => {
                    response.send({status: 'OK'});
                })
})

app.post('/update_financials', sessionCheck, statusCheck, (request, response) => {
    console.log(request.body)
    api_calls.gurufocusAdd(request.body.action, request.session.user, summaryCall = false)
                .then((r) => {
                    db.get_added(request.body.action[0].symbol, request.session.user)
                    .then((res) => {
                        res.forEach((stock) => {
                            format_data(stock)
                            })
                        //fs.writeFileSync('test.json', JSON.stringify(res))
                        response.send({data: res})
                    })
                });
})

app.post('/update_prices', sessionCheck, statusCheck, (request, response) => {
    console.log(request.body);
        api_calls.update_prices(request.body.action, request.session.user)
        .then((resolve) => {
                db.get_added(request.body.action[0].symbol, request.session.user)
                .then((res) => {
                    res.forEach((stock) => {
                    format_data(stock)
                    })
                response.send({data:res})
                })
        }).catch(function(err) {
            console.log(err)
            response.send(JSON.stringify({'Error': `${request.body.action[0].symbol}`}))
    })
})

app.post("/shared", (request, response) => {
    //console.log(request.body.stocks)
    switch(request.body.action){
        case 'Remove':
        let promises = [];
        for (let i = 0; i < request.body.stocks.length; i++) {
            promises.push(db.unsharestock(request.body.stocks[i].symbol, request.session.user));
        }
        Promise.all(promises)
            .then((returned) => {
                response.send(JSON.stringify(request.body));
            })
        break;

        // case 'Append':
        // //console.log(request.body.stocks)
        // api_calls.gurufocusAdd(request.body.stocks, request.session.user, true, true)
        //     .then((resolve) => {
        //         response.send(JSON.stringify({ stocks: resolve, action: 'Append' }));
        //     })
        //     .catch((reason) => console.log(reason))
        //     break;
    }
})

/* Logout */
app.post("/logout", (request, response) => {
    request.session.reset();
    response.redirect("/");
});

/*** Start Server ***/
app.listen(port, () => {
    console.log(`Server is up on port: ${port}, with PID: ${process.pid}`);
});

/*** Sends an email update on the 15th of everymonth ***/
/* var quarter_updates = schedule.scheduleJob('* * * 15 * *', () => {
    email.send_email();
})
quarter_updates;
 */




/*** HBS HELPERS ***/
hbs.registerHelper('Averages', function(data, column, years){
    return calculate_average(data,column,years)
})


 /*** Functions ***/

// Add comma separator to numbers in thousands
function formatNumber(num) {
    try{
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }
    catch {
        return "Missing Required information to format"
    }
}

function calculate_average(data, column, years){
    try{
        let total = 0;
        for(let i = 0; i < years; i++){
            total += parseFloat(data[i][`${column}`])
        }
        return Math.round((total/years)*1000)/1000
        }
        catch{
            return 'Missing Values'
        }
}

hbs.registerHelper('calculate_default_growth', function(years, ttm, eps){
    return calculate_default_growth_func(years, ttm, eps)
})

function initial_values_calc(years, id, ttm, prev_eps, terminal_growth, discount, growth_years, terminal_years){
        // console.log(`${years} ${id} ${ttm} ${prev_eps} ${terminal_growth} ${discount} ${growth_years} ${terminal_years} `)
        let growth_rate = (calculate_default_growth_func(years, ttm, prev_eps))/100
        // console.log(growth_rate)
        let calculated = calc.dcf(ttm, growth_rate, terminal_growth, discount, growth_years, terminal_years)
        //console.log(calculated)
        return calculated
}

function calculate_default_growth_func(years, ttm, eps){
    let part1 = parseFloat(ttm) / parseFloat(eps)
    let part2 = (Math.pow(part1, 1/years)-1) * 100
    // console.log(`${years}, ${ttm}, ${epi}`)
    // console.log(math.nthRoot(part1, years)-1)
    return Math.round((part2) * 100) / 100
}

function format_data(stock){
    stock.stockdata.forEach((data) => {
        data.yield_format = data.yield + '%'
        data.price_format = '$' + formatNumber(data.price)
        data.shares_outstanding_format = formatNumber(Math.round(data.shares_outstanding * 100) / 100)
        data.market_cap_format = formatNumber(Math.round(data.market_cap))
        data.net_debt_format = formatNumber(Math.round(data.net_debt))
        data.enterprise_value_format = formatNumber(Math.round(data.enterprise_value * 10) / 10)
        data.revenue_format = formatNumber(Math.round(data.revenue))
        data.aebitda_format = formatNumber(data.aebitda)
        data.roe_format = Math.round(data.roe * 10) / 10
        data.effective_tax_format = Math.round(data.effective_tax * 10) / 10 + '%'
        data.fcf_format = formatNumber(Math.round(data.fcf))

        data.roic_format = formatNumber(data.roic);
        data.wacc_format = formatNumber(data.wacc);
        data.roicwacc_format = formatNumber(Math.round((data.roic - data.wacc) * 100) / 100)
        data.capex_format = formatNumber(data.capex * -1)
        data.capeXae_format = formatNumber(Math.round((data.capex/data.aebitda) * 100) / 100)
        data.aeXsho_format = formatNumber(Math.round((data.aebitda/data.shares_outstanding) * 100) / 100)
        data.capeXfcf_format = formatNumber(Math.round((data.capex/data.fcf) * 100) / 100)
        data.fcfXae_format = formatNumber(Math.round((data.fcf/data.aebitda) * 100) / 100)

        // if(data.eps_without_nri<= 1) {
        //     data.eps_without_nri_format = (data.eps_without_nri/10);
        // } 
        // else {
        //     data.eps_without_nri_format = (data.eps_without_nri/100);
        // }
        data.eps_without_nri_format = data.eps_without_nri;
        data.eps_growth_rate = Math.round((data.eps_basic)*100)/100;
        data.growth_years_format = data.growth_years;
        data.terminal_years_format = data.terminal_years;
        data.terminal_growth_rate_format = (data.terminal_growth_rate);
        data.discount_rate_format = (data.discount_rate);
        
        // let dcf_calc5 = calc.dcf(data.eps_without_nri, data.terminal_growth_rate, data.discount_rate, data.growth_years,data.terminal_years)
        // data.dcf_growth = formatNumber(Math.round((dcf_calc.growth_value)*100) / 100)
        // data.dcf_terminal = formatNumber(Math.round((dcf_calc.terminal_value)*100) / 100)
        // data.dcf_fair_5y = '$' + formatNumber(dcf_calc.fair_value)

        data.aebitda_at = Math.round(data.aebitda / data.revenue * data.asset_turnover * 1000) / 10 + '%'
        data.nd_aebitda = formatNumber(Math.round(data.net_debt / data.aebitda * 100) / 100)
        data.aebitda_percent = Math.round(data.aebitda / data.revenue * 1000) / 10 + '%'
        data.ev_aebitda = Math.round(data.enterprise_value / data.aebitda * 100) / 100
        data.aebitda_spice = Math.round(data.aebitda / data.revenue * data.asset_turnover * 100 / (data.enterprise_value / data.aebitda) * 100) /100
        data.roe_spice = Math.round(data.roe / (data.enterprise_value / data.aebitda) * 100) / 100
        data.datestring = moment(data.date).format('MMM DD, YYYY')
        data.fcf_yield = Math.round(data.fcf / data.market_cap * 100)
    })

    try{
        stock.growth_rate_5y = calculate_default_growth_func(5, stock.stockdata[0].eps_without_nri_format, stock.stockdata[4].eps_without_nri_format)
        stock.dcf_values_5y = initial_values_calc( 5, stock.stock_id, 
            stock.stockdata[0].eps_without_nri_format,
            stock.stockdata[4].eps_without_nri,
            stock.stockdata[0].terminal_growth_rate,
            stock.stockdata[0].discount_rate,
            stock.stockdata[0].growth_years,
            stock.stockdata[0].terminal_years
            );
    }
    catch{
        stock.growth_rate_5y = null
        stock.dcf_values_5y = {fair_value: null, growth_value: null, terminal_value: null}
    }      

    try{
        stock.growth_rate_10y = calculate_default_growth_func(10, stock.stockdata[0].eps_without_nri_format, stock.stockdata[9].eps_without_nri_format)
        stock.dcf_values_10y = initial_values_calc( 10, stock.stock_id, 
            stock.stockdata[0].eps_without_nri_format,
            stock.stockdata[9].eps_without_nri,
            stock.stockdata[0].terminal_growth_rate,
            stock.stockdata[0].discount_rate,
            stock.stockdata[0].growth_years,
            stock.stockdata[0].terminal_years
            );
    }
    catch(err){
        //console.log(err)
        stock.growth_rate_10y = null
        stock.dcf_values_10y = {fair_value: null, growth_value: null, terminal_value: null}
    }

    try{
        stock.growth_rate_15y = calculate_default_growth_func(15, stock.stockdata[0].eps_without_nri_format, stock.stockdata[14].eps_without_nri_format)
        stock.dcf_values_15y = initial_values_calc( 15, stock.stock_id, 
            stock.stockdata[0].eps_without_nri_format,
            stock.stockdata[14].eps_without_nri,
            stock.stockdata[0].terminal_growth_rate,
            stock.stockdata[0].discount_rate,
            stock.stockdata[0].growth_years,
            stock.stockdata[0].terminal_years
            );
    }
    catch(err){
        //console.log(err)
        stock.growth_rate_15y = null
        stock.dcf_values_15y = {fair_value: null, growth_value: null, terminal_value: null}
    }

    // Calculates metric growth rates
    try {
        const end_date = stock.stockdata[0].date.getFullYear(),
            end_price = stock.stockdata[0].price,
            end_revenue = stock.stockdata[0].revenue,
            end_aebitda = stock.stockdata[0].aebitda,
            end_fcf = stock.stockdata[0].fcf,
            end_so = stock.stockdata[0].shares_outstanding
        var price_10 = null,
            price_5 = null,
            price_3 = null,
            price_1 = null,
            revenue_10 = null,
            revenue_5 = null,
            revenue_3 = null,
            revenue_1 = null,
            aebitda_10 = null,
            aebitda_5 = null,
            aebitda_3 = null,
            aebitda_1 = null
        fcf_10 = null,
            fcf_5 = null,
            fcf_3 = null,
            fcf_1 = null,
            so_10 = null,
            so_5 = null,
            so_3 = null,
            so_1 = null
        for (var i = 1; i < stock.stockdata.length; i++) {
            if (end_date - stock.stockdata[i].date.getFullYear() == 10) {
                price_10 = stock.stockdata[i].price
                revenue_10 = stock.stockdata[i].revenue
                aebitda_10 = stock.stockdata[i].aebitda
                fcf_10 = stock.stockdata[i].fcf
                so_10 = stock.stockdata[i].shares_outstanding
            } if (end_date - stock.stockdata[i].date.getFullYear() == 5) {
                price_5 = stock.stockdata[i].price
                revenue_5 = stock.stockdata[i].revenue
                aebitda_5 = stock.stockdata[i].aebitda
                fcf_5 = stock.stockdata[i].fcf
                so_5 = stock.stockdata[i].shares_outstanding
            } if (end_date - stock.stockdata[i].date.getFullYear() == 3) {
                price_3 = stock.stockdata[i].price
                revenue_3 = stock.stockdata[i].revenue
                aebitda_3 = stock.stockdata[i].aebitda
                fcf_3 = stock.stockdata[i].fcf
                so_3 = stock.stockdata[i].shares_outstanding
            } if (end_date - stock.stockdata[i].date.getFullYear() == 1) {
                price_1 = stock.stockdata[i].price
                revenue_1 = stock.stockdata[i].revenue
                aebitda_1 = stock.stockdata[i].aebitda
                fcf_1 = stock.stockdata[i].fcf
                so_1 = stock.stockdata[i].shares_outstanding
            }
        }
        // console.log(stock.symbol, 'PRICE', '10y:'+price_10, '5y:'+price_5, '3y:'+price_3, '1y:'+price_1)
        // Only 1 decimal required for price growth
        stock.price_growth_10 = Math.round((Math.pow(end_price / price_10, 1 / 10) - 1) * 100)
        stock.price_growth_5 = Math.round((Math.pow(end_price / price_5, 1 / 5) - 1) * 100)
        stock.price_growth_3 = Math.round((Math.pow(end_price / price_3, 1 / 3) - 1) * 100)
        stock.price_growth_1 = Math.round((Math.pow(end_price / price_1, 1 / 1) - 1) * 100)

        stock.revenue_growth_10 = Math.round((Math.pow(end_revenue / revenue_10, 1 / 10) - 1) * 100)
        stock.revenue_growth_5 = Math.round((Math.pow(end_revenue / revenue_5, 1 / 5) - 1) * 100)
        stock.revenue_growth_3 = Math.round((Math.pow(end_revenue / revenue_3, 1 / 3) - 1) * 100)
        stock.revenue_growth_1 = Math.round((Math.pow(end_revenue / revenue_1, 1 / 1) - 1) * 100)

        stock.aebitda_growth_10 = Math.round((Math.pow(end_aebitda / aebitda_10, 1 / 10) - 1) * 100)
        stock.aebitda_growth_5 = Math.round((Math.pow(end_aebitda / aebitda_5, 1 / 5) - 1) * 100)
        stock.aebitda_growth_3 = Math.round((Math.pow(end_aebitda / aebitda_3, 1 / 3) - 1) * 100)
        stock.aebitda_growth_1 = Math.round((Math.pow(end_aebitda / aebitda_1, 1 / 1) - 1) * 100)

        stock.fcf_growth_10 = Math.round((Math.pow(end_fcf / fcf_10, 1 / 10) - 1) * 100)
        stock.fcf_growth_5 = Math.round((Math.pow(end_fcf / fcf_5, 1 / 5) - 1) * 100)
        stock.fcf_growth_3 = Math.round((Math.pow(end_fcf / fcf_3, 1 / 3) - 1) * 100)
        stock.fcf_growth_1 = Math.round((Math.pow(end_fcf / fcf_1, 1 / 1) - 1) * 100)

        stock.so_change_10 = formatNumber(Math.round((end_so - so_10) * 10) / 10)
        stock.so_change_5 = formatNumber(Math.round((end_so - so_5) * 10) / 10)
        stock.so_change_3 = formatNumber(Math.round((end_so - so_3) * 10) / 10)
        stock.so_change_1 = formatNumber(Math.round((end_so - so_1) * 10) / 10)

    }
    catch (err) {
        ///
    }
}