/*** Node Modules ***/
require("dotenv").config();
const express = require("express");
const request = require("request");
const hbs = require("hbs");
const bodyParser = require("body-parser");
const session = require("client-sessions");
const app = express();
var schedule = require('node-schedule');
const multer = require('multer');
const upload = multer({ dest: './uploads/' });
const fs = require("fs");
const _ = require("lodash")

hbs.registerHelper('json', function (context) {
    return JSON.stringify(context);
});

/*** Project Scripts ***/
const api_calls = require("./actions/api_calls");
const auth = require("./actions/auth");
const csv_parse = require("./actions/csv_parse");
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
        duration: 30 * 60 * 1000,
        activeDuration: 5 * 60 * 1000
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

/*** HTTP Requests ***/

/** GET **/

app.get("/", sessionCheck, (request, response) => {
    response.render("index.hbs", { i: true });
});

app.get("/register", (request, response) => {
    response.render("register.hbs");
});

app.get("/login", (request, response) => {
    response.render("login.hbs");
});

app.get("/collection", sessionCheck, (request, response) => {
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
                })
            })

            response.render("collection.hbs", {
                dbdata: res,
                c: true
            })
        });
});

app.get("/documentation", sessionCheck, (request, response) => {
    response.render("documentation.hbs", { d: true });
});

app.get("/settings", sessionCheck, (request, response) => {
    response.render("settings.hbs", { s: true });
});

/** POST **/

/* Login */
app.post("/login", (request, response) => {
    auth.login(request.body.username, request.body.password)
        .then(() => {
            request.session.user = request.body.username;
            response.redirect("/");
        })
        .catch(err => {
            console.log(error);
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
        response.redirect("/");
    });
});

/* File Upload */
app.post('/upload', upload.single('myfile'), sessionCheck, (request, response) => {
    if ("action" in request.body != true) {
        var csvdata;
        csv_parse.csvjson(`./uploads/${request.file.filename}`).then((resolved) => {
            csvdata = JSON.parse(resolved);
            db.showstocks(request.session.user).then((resolved2) => {
                let dbdata = resolved2;
                for (i = 0; i < dbdata.length; i++) {
                    _.remove(csvdata, function (e) {
                        return e.Ticker == dbdata[i].symbol;
                    });
                }
                response.render('compare.hbs', { data: csvdata, dbdata: dbdata, i: true });
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
app.post('/collection', (request, response) => {
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
                let Promises = [];
                db.showstocks(request.session.user)
                .then((resolve) => {
                    for(let i in resolve){
                        Promises.push(api_calls.gurufocus_update(resolve[i]))
                    }
                    Promise.all(Promises)
                    .then((returned) => {
                        db.updateStocks(returned, request.session.user);
                    })
                })
            break;
    }
})

/* Logout */
app.post("/logout", (request, response) => {
    request.session.reset();
    response.redirect("/");
});

//Graph temporary page
app.get('/graph', (request, response) => {
    db.showstocks(request.session.user)
        .then((stocks) => {
            response.render('graph.hbs', {
                stockdata: stocks
            })
        })
})

/*** Start Server ***/
app.listen(port, () => {
    console.log(`Server is up on port: ${port}, with PID: ${process.pid}`);
});

/*** Sends an email update on the 15th of everymonth ***/
var quarter_updates = schedule.scheduleJob('* * * 15 * *', () => {
    email.send_email();
})
quarter_updates;
