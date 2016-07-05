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
app.get('/desk',function(req,res) {
  //Set-up access to the Desk.com Server to gain access
  passport.use(new DeskcomStrategy({
      requestTokenURL: 'https://'+req.query.site+'.desk.com/oauth/request_token',
      accessTokenURL: 'https://'+req.query.site+'.desk.com/oauth/access_token',
      userAuthorizationURL: 'https://'+req.query.site+'.desk.com/oauth/authorize',
      consumerKey: consumerKey,
      consumerSecret: consumerSecret,
      callbackURL: "https://33d95014.ngrok.io/callback",
      signatureMethod: "HMAC-SHA1"
    },
    //Verify Callback after granted user access
    function(token, tokenSecret, profile, cb) {
      console.log('arguments',arguments);
      // userToken = token;
      // userTokenSecret = tokenSecret;
      cb(null,{"User":"Eric Park", token: token, tokenSecret: tokenSecret});
    }
  ));
  passport.authenticate('oauth').apply(this,arguments);
});

//Defined by Desk.com to set the call back url
app.get('/callback',
  passport.authenticate('oauth', { failureRedirect: '/login' }),
  function(req, res) {
    console.log("Request:" + req);
    res.redirect('/upload.html');
  });



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

var url = "https://zzz-leaflet.desk.com/api/v2/companies";

//Looping through each object of the array, and posting to the Desk.com server
for(var i = 0; i <= req.body.data.length; i++) {
  request.post({url:url, oauth:oauth, json: true, body: req.body.data[i]}, function (error, response, body) {
    //console.log("Response:", response);
    if (!error && response.statusCode == 200) {
      console.log(body);
    } else {
      console.log("Error: ", error);
      //console.log("Response: ", response);
    }
  })
}
res.sendStatus(200)
});



app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
