//Required Modules
var express = require('express');
var passport = require('passport');
var session = require('express-session');
var DeskcomStrategy = require('passport-oauth1').Strategy;
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();
var jsonParser = bodyParser.json();
var sleep = require('sleep');
//Heroku Set Port
var port = process.env.PORT || 8080;

var counter = 0;
var total = 0;
//Global Keys
var consumerKey = "7reGJXZ8Bb3bkQn5NE2w";
var consumerSecret = "csAf6M4mtSw4Ou5CDrb5AyUKWfl1lSHfJyzu2jty";
// FIXME: This should be stored as part of the session so user tokens aren't mixed up.
// We'll figure out how to do that later.
var userToken = "bHh44cKHT7JrWM0x5gdM";
var userTokenSecret = "pjSvpbAYaRmN3rWnIdNYbUVxxqH1OIeUc6hqhqIY";


//Change!!!!!
var siteName = "zzz-leaflet";

app.use(express.static('public'));

var deskStrat = new DeskcomStrategy({
  requestTokenURL: 'https://zzz-leaflet.desk.com/oauth/request_token',
  accessTokenURL: 'https://zzz-leaflet.desk.com/oauth/access_token',
  userAuthorizationURL: 'https://zzz-leaflet.desk.com/oauth/authorize',
  consumerKey: consumerKey,
  consumerSecret: consumerSecret,
  callbackURL: "https://f7b4f9f5.ngrok.io/callback",
  signatureMethod: "HMAC-SHA1",
  param: 'site'
},
//Verify Callback after granted user access
function(token, tokenSecret, profile, cb) {
  //console.log('arguments',arguments);
  // userToken = token;
  // userTokenSecret = tokenSecret;
  cb(null,{"User":"Eric Park", token: token, tokenSecret: tokenSecret});
}
);

passport.use('desk', deskStrat);


// app.use(express.logger());
app.use(cookieParser());
app.use(bodyParser.json({limit: '100mb'}));
// app.use(express.bodyParser());
// app.use(express.methodOverride());
app.use(session({ secret: 'SECRET' }));
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
// app.use(app.router);


//Global Routes
//Routes that activate the /desk to begin oauth
app.get('/desk', function(req, res) {
  deskStrat._oauth._requestUrl = 'https://' + req.query.site + '.desk.com/oauth/request_token';
  deskStrat._oauth._accessUrl = 'https://' + req.query.site + '.desk.com/oauth/access_token';
  deskStrat._userAuthorizationURL = 'https://' + req.query.site + '.desk.com/oauth/authorize';

  passport.authenticate('desk').call(app, req, res);
});

//Defined by Desk.com to set the call back url
app.get('/callback', passport.authenticate('desk', { successRedirect: '/upload.html', failureRedirect: '/login' }));



//Setting the user model in the database, by converting JSON to a database object
passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

/******************************** COMPANY UPLOAD ********************************/


//Receiving the file from the front-end for the company
app.post('/company', jsonParser, function (req, res){
  if (!req.body) return res.sendStatus(400);
  var oauth = {
    consumer_key: consumerKey,
    consumer_secret: consumerSecret,
    token: userToken,
    token_secret: userTokenSecret
  }

  //Variable List
  var companyURL = "https://"+siteName+".desk.com/api/v2/companies";
  var customFieldURL = "https://"+siteName+".desk.com/api/v2/custom_fields"
  var customFieldBody = {
    "name": "data_import_company_id",
    "label": "Data Import Company Id",
    "type": "company",
    "active": true,
    "data": {
      "type": "integer"
    }
  }

  //Create a custom field to hold the company ID
  request.post({url:customFieldURL, oauth:oauth, json:true, body: customFieldBody}, function (error, response, body) {
    if (!error && response.statusCode == 201) {
      console.log('Custom field successfully created.');
    } else {
      if (body.message === "Validation failed: Key has already been taken.") {
        console.log("Custom field already exists.");
      } else {
        console.log("Error: ", error);
        //console.log("Response: ", response);
      }
    }
  });
  counter = 0;
  total = req.body.data.length;
  //Looping through each object of the array, and posting to the Desk.com server
  for(var i = 0; i < total; i++) {
    var companyObject = req.body.data[i];
    //Convert domain property into an array
    var domainArray = companyObject.domains.split(',');
    companyObject.domains = domainArray;

    // //Set company import id to the custom field (Data Import Company ID)
    // var dataImportCompanyId =  companyObject.company_import_id;
    // //Append last companyID field to the object
    // companyObject.custom_fields = {"data_import_company_id": dataImportCompanyId};
    // //Remove this property within the object
    // delete companyObject.company_import_id;

    companyObject.custom_fields = {};
    //Flip through the object to check for any other custom field
    //console.log('companyObject',companyObject)
    for (var prop in companyObject) {
      //Variable to hold the custom field indicator
      var CUSTOM  = "custom_";
      //Check for any non "standard" properties that contain a 'custom_'
      if(prop.indexOf(CUSTOM) != -1 && prop !== 'custom_fields') {
        //Remove the 'custom_' indicator from the property
        console.log("prop before custom_removal: " + prop);
        var newprop = prop.slice(7);
        console.log("prop after custom_removal: " + newprop);

        companyObject.custom_fields[newprop] = companyObject[prop]

        //companyObject.custom_fields[prop] = companyObject[prop];
        //Remove this property within the object
        delete companyObject[prop];

      }
    }

    //Post this object into the Desk.com environment
    request.post({url:companyURL, oauth:oauth, json: true, body: companyObject}, function (error, response, body) {

      //console.log("Response:", response);
      if (!error && response.statusCode == 201) {
        console.log("Success");
      } else {
        console.log("Error from Company Posting: ", error);
        console.log("Response body from creating company: ", response.body);

        console.log("Complete response: ", response);
      }
    });

    //Increase counter for progress bar
    //counter++;
  }
  var testSetInterval = setInterval(function(){
    if(counter >= total){
      clearInterval(testSetInterval);
    } else {
      counter++;
      console.log(counter);
    }
  }, 5000)
  res.sendStatus(200)
});

/******************************** CUSTOMER UPLOAD ********************************/

//Receiving the file from the front-end for the customer
app.post('/customer', jsonParser, function (req, res){
  if (!req.body) return res.sendStatus(400);
  var oauth = {
    consumer_key: consumerKey,
    consumer_secret: consumerSecret,
    token: userToken,
    token_secret: userTokenSecret
  }

  //Variable List
  var customerURL = "https://"+siteName+".desk.com/api/v2/customers";
  var customFieldURL = "https://"+siteName+".desk.com/api/v2/custom_fields";
  var customFieldBody = {
    "name": "data_import_customer_id",
    "label": "Data Import Customer Id",
    "type": "customer",
    "active": true,
    "data": {
      "type": "integer"
    }
  }

  //Create a custom field to hold the customer ID
  request.post({url:customFieldURL, oauth:oauth, json:true, body: customFieldBody}, function (error, response, body) {
    if (!error && response.statusCode == 201) {
      console.log(body);
      console.log(response.body);
    } else {
      if (body.message === "Validation failed: Key has already been taken.") {
        console.log("Custom field already exists.");
      } else {
        console.log("Error on creating custom field: ", error);
        console.log("Response on creating custom field: ", response);
      }
    }
  });
  counter = 0;
  total = req.body.data.length;
  // Storing customers in an object, indexed by the company id so we can create them
  // once we get the company name.
  var customersToCreate = {};
  //Looping through each object of the array, and posting to the Desk.com server
  for(var i = 0; i < req.body.data.length; i++) {
    var customerObject = req.body.data[i];
    var companyId = customerObject.data_import_company_id;
    customersToCreate[companyId] = customersToCreate[companyId] || [];
    customersToCreate[companyId].push(customerObject);
    // //Set company import id to the custom field (Data Import Company ID)
    // var dataImportCompanyId =  customerObject.company_import_id;
    // //Append last companyID field to the object
    // customerObject.custom_fields = {"data_import_company_id": dataImportCompanyId};
    // //Remove this property within the object
    // delete customerObject.company_import_id;
    //Property Creation for custom fields, emails, phone_numbers, addresses, _links
    customerObject.custom_fields = {};
    customerObject.emails = [];
    customerObject.phone_numbers= [];
    customerObject.addresses = [];
    customerObject._links = {};
    //Find the company name using the data_import_company_id
    var companyName = "";
    var companyLookupURL = "https://"+siteName+".desk.com/api/v2/companies/search?q=data_import_company_id:"+customerObject.data_import_company_id;
    request.get({url:companyLookupURL,oauth:oauth, json:true}, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var company = body._embedded.entries[0];
        console.log("Company Name from request:" + company.name);
        // Now we can create customers with this same company id
        createCustomers(company.custom_fields.data_import_company_id, company.name);
      } else {
        console.log("Error: ", error);
        console.log("Response: ", response);
      }
    });
    //Increase counter for progress bar
    //counter++;
  }
  var createCustomers = function (id,name) {
    for (let customer of customersToCreate[id]) {
      customer.company = name;
      for (var prop in customer) {
        /*****Custom Fields*****/
        //Variable to hold the custom field indicator
        var CUSTOM  = "custom_";
        //Check for any non "standard" properties that contain a 'custom_'
        if(prop.indexOf(CUSTOM) != -1 && prop !== 'custom_fields') {
          //Remove the 'custom_' indicator from the property
          var newprop = prop.slice(7);

          customer.custom_fields[newprop] = customer[prop]

          delete customer[prop];

        } else if (prop.indexOf("home") || prop.indexOf("work") || prop.indexOf("mobile") || prop.indexOf("other")) {
          var contactArray = prop.split("_");
          if (contactArray[1] == "email" && customer[prop]){
            customer.emails.push({"type": contactArray[0], "value": customer[prop]});
            delete customer[prop]
          } else if(contactArray[1] == "address" && customer[prop]){
            customer.addresses.push({"type": contactArray[0], "value": customer[prop]});
            delete customer[prop]
          } else if(contactArray[1] == "phone" && customer[prop]){
            customer.phone_numbers.push({"type": contactArray[0], "value": customer[prop]});
            delete customer[prop]
          }
        }
      }

      //Post this object into the Desk.com environment
      request.post({url:customerURL, oauth:oauth, json: true, body: customer}, function (error, response, body) {
        if (!error && response.statusCode == 201) {
          console.log("Successfully created",body);
        } else {
          if (body.message === "Validation failed: Key has already been taken.") {
            console.log("Customer already exists.");
          } else {
            console.log("Error on customer create: ", error);
            console.log("Response on customer create: ", response);
          }
        }
      })
    }

  }

  var testSetInterval = setInterval(function(){
    if(counter >= total){
      clearInterval(testSetInterval);
    } else {
      counter++;
      console.log(counter);
    }
  }, 5000)
  res.sendStatus(200)
});

app.get('/progressnumber', function(req,res){
  res.send(""+Math.ceil((counter/total)*100));
});

//Set for Heroku
app.listen(port, function() {
  console.log('Our app is running on http://localhost:' + port);
});

// app.listen(3000, function () {
//   console.log('Example app listening on port 3000!');
// });
