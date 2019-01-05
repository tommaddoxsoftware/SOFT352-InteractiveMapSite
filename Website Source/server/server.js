//Require Modules
var http        = require('http');
var url         = require("url");
var express     = require("express");
var bodyParser  = require("body-parser");
var app         = express();

//require database
var databases = require("db.js");


//Define Port
var port = 9000;

app.listen(port, function() {
    console.log("Server started on port " + port);
});

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//Handle Login
app.post('/login', function(req, res) {
    var response = {};
    var loginCode = req.body.loginCode;

    //Check that loginCode is 4 digits long
    if(loginCode.length != 4) {
        response = {
            "status": "error",
            "reason": "Login Code isn't 4 digits long."
        }
    }
    else if(loginCode == "" || loginCode == null) {
        response = {
            "status": "error",
            "reason": "No Login Code was receieved by the server. Please try again."
        }
    }
    //We have a login code, it's 4 digits, let's find it in the db
    else {

    }


    res.writeHead(200, {"Access-Control-Allow-Origin": "*", 'Content-Type': 'text/html'});
    res.write(JSON.stringify(response));
    res.end("")
});
