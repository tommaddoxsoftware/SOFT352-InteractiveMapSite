//Require Modules
var http        = require('http');
var url         = require("url");
var express     = require("express");
var bodyParser  = require("body-parser");
var app         = express();


//Define Port
var port = 9000;

app.listen(port, function() {
    console.log("Server started on port " + port);

    //Run DB Functions
    Create();
    Populate();
});

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//Handle Login
app.post('/login', function(req, res) {
    res.writeHead(200, {"Access-Control-Allow-Origin": "*", 'Content-Type': 'text/html'});

    var response = {};
    var loginCode = req.body.loginCode;
    var promiseMade = false;
    var promise;

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
        promiseMade = true;
        //Search every doc in the employee DB, include the doc objects
        promise = employee_db.allDocs({
            include_docs: true
        }).then(function(result) {
            console.log("Yikes");
            //Setup response for if we don't find the pin
            response = {
                "status": "error",
                "reason": "Login not found"
            }

            //Loop through each doc to see if the login code is found
            for(var i = 0; i<result.total_rows; i++) {
                var tmpLoginCode = result.rows[i].doc.login_code;

                //Change our response to success
                if(loginCode == tmpLoginCode) {
                    response = {
                        "status": "success"
                    }

                    //Exit the loop
                    break;
                }

                else {
                    console.log("Found PIN: " + tmpLoginCode + " but this failed");
                    console.log(result.rows[i].doc);
                }
            }
        }).catch(function(err) {
            console.log("DB Error occured. Error: " + err);
        });
    }

    if(promiseMade) {
        Promise.all([promise]).then(function() {
            //Write our response
            res.write(JSON.stringify(response));
            res.end("");
        });
    }
    else {
        //Write our response
        res.write(JSON.stringify(response));
        res.end("");

    }
});

app.post('/GetLocations', function(req, res) {
    res.writeHead(200, {"Access-Control-Allow-Origin": "*", 'Content-Type': 'text/html'});
    var locations   = [];
    var trees       = [];
    var cust        = [];

    tree_db.allDocs({include_docs:true}).then(function(allTrees){
        var tempTrees = [];
        for(var i=0; i<allTrees.total_rows; i++) {
            tempTrees.push(allTrees.rows[i].doc);
        }

        trees = tempTrees;
    }).then(function(){
        customer_db.allDocs({include_docs:true}).then(function(allCust) {
            var tempCust = []
            for(var j=0; j<allCust.total_rows; j++) {
                tempCust.push(allCust.rows[j].doc);
            }
            cust = tempCust;
        }).then(function(){
            //Loop through each tree, match to customer
            for(var k=0; k<trees.length; k++) {
                var tempDoc;
                var custFound = false;
                var tempID = trees[k].customer_id;

                //Loop through each customer
                for(var m=0; m<cust.length; m++) {
                    //If ID of the customer matches the ID of the tree
                    if(tempID == cust[m]._id) {
                        custFound = true;
                        tempDoc = {
                            "tree": trees[k],
                            "customer": cust[m]
                        }
                    }
                } //End customers for loop
                if(custFound) {
                    //Place in return array
                    locations.push(tempDoc);
                }
                else{
                    console.log("Tree Found with no customer. Tree info dump:");
                    console.log(trees[k]);
                }
            } // End trees for loop
            res.write(JSON.stringify(locations));
            res.end();
        }).catch(function(err){
            console.log("Database Error! Dumping vars:");
            console.log(err);
        });
    }).catch(function(err){
        console.log("Database Error! Dumping vars:");
        console.log(err);
    });
});

/*===================================/*/
/*============  DATABASE  ==========/*/
/*==================================/*/
var PouchDB = require('PouchDB');

var tree_db;
var customer_db;
var employee_db;


function Create() {
    //Create required databases
    tree_db = new PouchDB('trees');
    customer_db = new PouchDB('customers');
    employee_db = new PouchDB('employees');
    console.log("Databases created");
}

function Populate() {
    //Create or Update tree db with default test vals
    tree_db.put(testTree).then(function(){
    }).catch(function(err) {
        if(err.name == "conflict") {
            tree_db.get(testTree._id).then(function(doc){

                //Update
                var newDoc = testTree;
                newDoc._rev = doc._rev;

                console.log("Updated Test Tree to default in tree_db");
                return tree_db.put(newDoc);
            });
        }
        else {
            console.log("An error occurred: " + err);
        }
    });

    //Create or Update customer db with default test vals
    customer_db.put(testCustomer).then(function(){
    }).catch(function(err) {
        if(err.name == "conflict") {
            customer_db.get(testCustomer._id).then(function(doc){

                //Update
                var newDoc = testCustomer;
                newDoc._rev = doc._rev;

                console.log("Updated Test Customer to default in tree_db");
                return customer_db.put(newDoc);
            });
        }
        else {
            console.log("An error occurred: " + err);
        }
    });

    //Create or Update customer db with default test vals
    employee_db.put(testEmployee).then(function(){
    }).catch(function(err) {
        if(err.name == "conflict") {
            employee_db.get(testEmployee._id).then(function(doc){

                //Update
                var newDoc = testEmployee;
                newDoc._rev = doc._rev;

                console.log("Updated Test Employee to default in tree_db");
                return employee_db.put(newDoc);
            });
        }
        else {
            console.log("An error occurred: " + err);
        }
    });

    console.log("Databases populated");
}


//Create some test data
var testCustomer = {
    "_id": "1",
    "first_name": "Tom",
    "last_name": "Maddox",
    "addr_1": "1 Skardon Place",
    "addr_2": "",
    "postcode": "PL4 8HA",
    "town": "Plymouth",
    "email": "tommaddox1997uk@gmail.com",
    "delivery": 0,
    "payment_info": {
        "paid": 1,
        "date": "2018-12-14",
        "tree_cost": "44.99",
        "delivery_cost": "15.00",
        "total": "59.99",
        "unit" : "GBP"
    }
}

var testTree = {
    "_id": "1",
    "customer_id": "1",
    "location": {
        "lat": "50.452956",
        "long": "-3.602662"
    },
    "tree": {
        "size": "6",
        "species": "Nordmann",
        "label_colour": "white",
        "id": "010767"
    },
    "cutting_info": {
        "cut_date"      : "2018-12-14",
        "has_been_cut"  : 1
    },
    "shipping_date": "2018-12-16"
}

var testEmployee = {
    "_id": "1",
    "first_name": "Tom",
    "last_name": "Maddox",
    "login_code": "1000",
    "registration_date": "2019/01/05"
}
