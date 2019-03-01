/*** Node Modules ***/
require("dotenv").config();
const express = require("express");
const request = require("request");
const hbs = require("hbs");
const bodyParser = require("body-parser");
const session = require("client-sessions");
const app = express();
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
    response.render("index.hbs");
});

app.get("/register", (request, response) => {
    response.render("register.hbs");
});

app.get("/login", (request, response) => {
    response.render("login.hbs");
});

app.get("/database", sessionCheck, (request, response) => {
    db.showstocks()
    .then(response.render("database.hbs", { dbdata: dbdata}));
});

app.get("/collection", sessionCheck, (request, response) => {
    db.showstocks()
    .then(res => response.render("collection.hbs", {
        dbdata: res
    }));
});

app.get("/documentation", sessionCheck, (request, response) => {
    response.render("documentation.hbs");
});

app.get("/settings", sessionCheck, (request, response) => {
    response.render("settings.hbs");
});

/*
app.get("/compare", sessionCheck, (request, response) => {
    let dbdata = request.session.dbdata
    if (csvdata.length == 0) {
        var no_data = true;
    } else {
        for (i = 0; i < dbdata.length; i++) {
            _.remove(csvdata, function (e) {
                return e.Symbol == dbdata[i].symbol;
            });
        }
    }
    response.render('compare.hbs', { data: csvdata, dbdata: dbdata, no_data: no_data });
});
 */


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
    if("action" in request.body != true){
        var csvdata;
        csv_parse.csvjson(`./uploads/${request.file.filename}`).then((resolved) => {
            csvdata = JSON.parse(resolved);
            db.showstocks().then((resolved2) => {
                let dbdata = resolved2;
                if (csvdata.length == 0) {
                    var no_data = true;
                } else {
                    for (i = 0; i < dbdata.length; i++) {
                        _.remove(csvdata, function (e) {
                            return e.Symbol == dbdata[i].symbol;
                        });
                    }
                }
                response.render('compare.hbs', { data: csvdata, dbdata: dbdata, no_data: no_data });
            }).catch(err => {
                console.error(err);
            })
        }).catch(err => {
            console.error(err);
        });
    }
    else{
        switch (request.body.action) {
            case 'Append':
                api_calls.gurufocus_add(request.body.stocks)
                    .then((resolve) => {
                        let promises = [];
                        console.log(resolve);
                        for (let i = 0; i < resolve.length; i++) {
                            promises.push(db.addStocks(resolve[i].symbol, resolve[i].company));
                        }
                        Promise.all(promises)
                            .then((returned) => {
                               response.send(JSON.stringify({stocks: resolve, action: 'Append'}));
                            })
                    })
                    .catch((reason) => console.log(reason));
                break;
    
            case 'Remove':
                let promises = [];
                for (let i = 0; i < request.body.stocks.length; i++) {
                    promises.push(db.removeStocks(request.body.stocks[i].symbol));
                }
                Promise.all(promises)
                    .then((returned) => {
                        response.send(JSON.stringify(request.body));
                    })
                break;
        }
    }

});

/* Compare page*/
app.post('/compare', (request, response) => {
    console.log(request.body.action)
    
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
