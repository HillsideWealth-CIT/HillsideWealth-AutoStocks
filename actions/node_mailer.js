//const nodemailer = require('nodemailer');
require('dotenv').config;

/*
    Configured to be used with gmail
    Requires an app password from google
*/

var reciever = '';
var subject = '';
var message = '';

function send_email(){
    var transporter = nodemailer.createTransport({
        service: process.env.EMAILSERVICE,
        auth: {
            user: process.env.SENDER,
            pass:process.env.PASSWORD
        }
    });
    var mailOptions = {
        from: process.env.SENDER,
        to: reciever,
        subject:subject,
        text: message,
    };

    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
        }
        else{
            console.log("emai sent: " + info.response);
        }
    })
}


module.exports = {
    send_email,
}
