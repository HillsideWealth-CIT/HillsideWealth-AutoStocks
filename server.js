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

/*** Functions ***/

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
                stock.stockdata.forEach((data) => {
                    data.aebitda_at = Math.round(data.aebitda / data.revenue * data.asset_turnover * 1000) / 10
                    data.nd_aebitda = Math.round(data.net_debt / data.aebitda * 100) / 100
                    data.aebitda_percent = Math.round(data.aebitda / data.revenue * 1000) / 10 + '%'
                    data.ev_aebitda = Math.round(data.enterprise_value / data.aebitda * 100) / 100
                    data.spice = data.aebitda / data.revenue * data.asset_turnover * 100 / (data.enterprise_value / data.aebitda)
                    data.datestring = moment(data.date).format('MMM DD, YYYY')
                })

                // Calculates metric growth rates
                const end_date = stock.stockdata[0].date.getFullYear(),
                    end_price = stock.stockdata[0].price,
                    end_roe = stock.stockdata[0].roe
                var price_10 = null,
                    price_5 = null,
                    price_3 = null,
                    price_1 = null,
                    roe_10 = null,
                    roe_5 = null,
                    roe_3 = null,
                    roe_1 = null
                for (var i = 1; i < stock.stockdata.length; i++) {
                    if (end_date - stock.stockdata[i].date.getFullYear() == 10) {
                        price_10 = stock.stockdata[i].price
                        roe_10 = stock.stockdata[i].roe
                    } if (end_date - stock.stockdata[i].date.getFullYear() == 5) {
                        price_5 = stock.stockdata[i].price
                        roe_5 = stock.stockdata[i].roe
                    } if (end_date - stock.stockdata[i].date.getFullYear() == 3) {
                        price_3 = stock.stockdata[i].price
                        roe_3 = stock.stockdata[i].roe
                    } if (end_date - stock.stockdata[i].date.getFullYear() == 1) {
                        price_1 = stock.stockdata[i].price
                        roe_1 = stock.stockdata[i].roe
                    }
                }
                // console.log(stock.symbol, 'PRICE', '10y:'+price_10, '5y:'+price_5, '3y:'+price_3, '1y:'+price_1)
                stock.price_growth_10 = Math.round((Math.pow(end_price / price_10, 1 / 10) - 1) * 10000) / 10000 + '%'
                stock.price_growth_5 = Math.round((Math.pow(end_price / price_5, 1 / 5) - 1) * 10000) / 10000 + '%'
                stock.price_growth_3 = Math.round((Math.pow(end_price / price_3, 1 / 3) - 1) * 10000) / 10000 + '%'
                stock.price_growth_1 = Math.round((Math.pow(end_price / price_1, 1 / 1) - 1) * 10000) / 10000 + '%'
                // console.log(stock.symbol, 'ROE', '10y:'+roe_10, '5y:'+roe_5, '3y:'+roe_3, '1y:'+roe_1)
                // NaN% signifies a negative ROE at 10y
                stock.roe_growth_10 = Math.round((Math.pow(end_roe / roe_10, 1 / 10) - 1) * 10000) / 10000 + '%'
                stock.roe_growth_5 = Math.round((Math.pow(end_roe / roe_5, 1 / 5) - 1) * 10000) / 10000 + '%'
                stock.roe_growth_3 = Math.round((Math.pow(end_roe / roe_3, 1 / 3) - 1) * 10000) / 10000 + '%'
                stock.roe_growth_1 = Math.round((Math.pow(end_roe / roe_1, 1 / 1) - 1) * 10000) / 10000 + '%'
            })


            response.render("collection.hbs", {
                dbdata: res,
                c: true,
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
            response.render('admin.hbs', { codes: codes, a: true})

        })
    }
})


/** POST **/


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
                        return e.Ticker == dbdata[i].symbol;
                    });
                }
                response.render('compare.hbs', { data: xlsxdata, dbdata: dbdata, i: true });
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

// update DB
app.post('/collection', sessionCheck, statusCheck, (request, response) => {
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

        case 'Update':
            api_calls.gurufocusAdd(request.body.stocks, request.session.user, summaryCall = false)
                .then((r) => {
                    response.send(JSON.stringify(request.body))
                })



            /* db.showstocks(request.session.user)
            .then((resolve) => {
                for(let i in resolve){
                    Promises.push(db.removeStocks(resolve[i], request.session.user));
                    Promises_add.push({symbol: resolve[i].symbol, comment: '', company: '', exchange: ''});
                }
                Promise.all(Promises)
                .then((returned) => {
                    api_calls.gurufocusAdd(Promises_add, request.session.user);
                    response.send(JSON.stringify({'Status': 'Complete'}))
                });
            }); */
            break;
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
