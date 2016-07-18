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


//Global Keys
var consumerKey = "7reGJXZ8Bb3bkQn5NE2w";
var consumerSecret = "csAf6M4mtSw4Ou5CDrb5AyUKWfl1lSHfJyzu2jty";
// FIXME: This should be stored as part of the session so user tokens aren't mixed up.
// We'll figure out how to do that later.
var userToken = "bHh44cKHT7JrWM0x5gdM";
var userTokenSecret = "pjSvpbAYaRmN3rWnIdNYbUVxxqH1OIeUc6hqhqIY";


//Change!!!!!
var siteName = "zzz-leaflet";

var deskStrat = new DeskcomStrategy({
    requestTokenURL: 'https://zzz-leaflet.desk.com/oauth/request_token',
    accessTokenURL: 'https://zzz-leaflet.desk.com/oauth/access_token',
    userAuthorizationURL: 'https://zzz-leaflet.desk.com/oauth/authorize',
    consumerKey: consumerKey,
    consumerSecret: consumerSecret,
    callbackURL: "https://87d3e774.ngrok.io/callback",
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
app.use(express.static('public'));

//Global Routes
//Routes that activate the /desk to begin oauth
app.get('/desk', function(req, res) {
  console.log(deskStrat);
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

//Receiving the file from the front-end
app.post('/file', jsonParser, function (req, res){
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
    if (!error && response.statusCode == 200) {
      console.log(body);
      console.log(response.body);
    } else {
      console.log("Error: ", error);
      //console.log("Response: ", response);
    }
  });

  //Looping through each object of the array, and posting to the Desk.com server
  for(var i = 0; i < req.body.data.length; i++) {
    //Convert domain property into an array
    var domainArray = req.body.data[i].domains.split(',');
    req.body.data[i].domains = domainArray;

    //Set company import id to the custom field (Data Import Company ID)
    var dataImportCompanyId =  req.body.data[i].company_import_id;
    //Append last companyID field to the object
    req.body.data[i].custom_fields = {"data_import_company_id": dataImportCompanyId};
    //Remove this property within the object
    delete req.body.data[i].company_import_id;
    console.log(req.body.data[i]);

    //Flip through the object to check for any other custom field
    for (var prop in req.body.data[i]) {
      //Check for any non "standard" properties other than name, domains, created_at, updated_at
      if( ["name","domains","created_at","updated_at","custom_fields","company_import_id"].indexOf(prop) === -1) {
        req.body.data[i].custom_fields[prop] = req.body.data[i][prop];
        //Remove this property within the object
        delete req.body.data[i][prop];
      }
    }

    //Post this object into the Desk.com environment
    request.post({url:companyURL, oauth:oauth, json: true, body: req.body.data[i]}, function (error, response, body) {

      //console.log("Response:", response);
      if (!error && response.statusCode == 200) {
        console.log("Success");
      } else {
        console.log("Error from Company Posting: ", error);
        console.log("Response body: ", response.body);

        console.log("Response: ", response);
      }
    })
  }
  res.sendStatus(200)
});



app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
