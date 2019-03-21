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
const list_actions = require("./actions/list_actions");

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
    response.render("index.hbs", {i: true});
});

app.get("/register", (request, response) => {
    response.render("register.hbs");
});

app.get("/login", (request, response) => {
    response.render("login.hbs");
});

app.get("/collection", sessionCheck, (request, response) => {
    db.showstocks()
    .then(res => response.render("collection.hbs", {
        dbdata: res,
        c: true
    }));
});

app.get("/documentation", sessionCheck, (request, response) => {
    response.render("documentation.hbs",{d: true});
});

app.get("/settings", sessionCheck, (request, response) => {
    response.render("settings.hbs");
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
    if("action" in request.body != true){
        var csvdata;
        csv_parse.csvjson(`./uploads/${request.file.filename}`).then((resolved) => {
            csvdata = JSON.parse(resolved);
            db.showstocks().then((resolved2) => {
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
    else{
        switch (request.body.action) {
            case 'Append':
                api_calls.gurufocusAdd(request.body.stocks)
                    .then((resolve) => {
                               response.send(JSON.stringify({stocks: resolve, action: 'Append'}));
                    })
                    .catch((reason) => console.log(reason));
                break;

            case 'Remove':
                list_actions.remove(request, response);
                break;
        }
    }

});

// update DB
app.post('/collection', (request, response) => {
    //api_calls.gurufocus_update()
    //console.log(request.body);
    switch(request.body.action){
        case 'append':
        api_calls.gurufocusAdd(request.body.stocks)
            .then((resolve) => {
                       response.send(JSON.stringify({stocks: resolve, action: 'Append'}));
            })
            .catch((reason) => console.log(reason));
            break;

        case 'remove':
            list_actions.remove(request, response);
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
    db.showstocks()
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
var quarter_updates = schedule.scheduleJob('* * * 15 * *', ()=>{
    email.send_email();
})
quarter_updates;
