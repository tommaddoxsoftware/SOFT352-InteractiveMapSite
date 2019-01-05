//Require Modules
var http = require('http');
var url = require("url");
const { parse } = require('querystring');

//Define Port
var port = 9000;


//Create Server
var server = http.createServer(function (req, res) {
    var txt = "";
    var reqData;

    if (req.method === 'POST') {
        collectRequestData(req, result => {
            console.log(result);
            reqData = result;
        });
    }
    else {
        console.log("not a post req");
        console.log(req.method);
    }

    //Do different things depending on what url was requested
    switch(req.url) {
        case "/login":
        console.log("Login was the URL");
        console.log("Req Data: \n" + reqData);

        break;
        case "/createuser":
            CreateUser();
        break;
        case "/getlocations":
            GetLocations();
        break;
    }

    res.writeHead(200, {"Access-Control-Allow-Origin": "*", 'Content-Type': 'text/html'});
    res.write(txt);
    res.end();

});

//Log server port to console
server.listen(port, function(){
    console.log("Server listening on port " + port);
});

function collectRequestData(request, callback) {
    const FORM_URLENCODED = 'application/x-www-form-urlencoded; charset=UTF-8';
    if(request.headers['content-type'] === FORM_URLENCODED) {
        let body = '';
        request.on('data', chunk => {
    //        body += chunk.toString();
            console.log(body);
            console.log(chunk);
            body = chunk.toString();
        });
        request.on('end', () => {
            callback(parse(body));
        });
    }
    else {
        callback(null);
    }
}


function HandleLogin(pin) {
    //We want to return a json, initialise the JSON
    var response = {};

}

function CreateUser() {

}

function GetLocations() {

}
