var pouchDB     = require('PouchDB');



function Create() {
    //Create required databases
    var tree_db = new PouchDB('trees');
    var customer_db = new PouchDB('customers');
    var employee_db = new PouchDB('employees');
    console.log("Databases created");
}

function Populate() {
    tree_db.put(testTree);
    customer_db.put(testCustomer);
    employee_db.put(testEmployee);
    console.log("Databases populated");
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


var testEmployee = {
    "_id": 1,
    "first_name": "Tom",
    "last_name": "Maddox",
    "login_code": null,
    "registration_date": "2019/01/05"
}
