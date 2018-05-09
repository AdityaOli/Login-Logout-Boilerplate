"use strict";
var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
var session = require('express-session');
var MongoClient = require("mongodb").MongoClient;
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(session({secret: "Shh, its a secret!"}));
app.use(express.static('public'));


function indexLoader(loggedIn, emailId, messageType, message, name)
{
  this.loggedIn = loggedIn;
  this.emailId = emailId;
  this.messageType = messageType;
  this.message = message;
  this.name = name;
  this.getInfo = function()
    {
            var temp = 
            {
                loggedIn : this.loggedIn, 
                emailId : this.emailId,
                messageType : this.messageType,
                message : this.message,
                name : this.name
            };
            return temp;
          };
    }

app.get("/", function (request, response) {
  var indexLoaderVariable = new indexLoader(false, null,null,null);
  response.render('index', {indexLoaderVariable:indexLoaderVariable});
});

app.post("/login", function(request, response){
   var indexLoaderVariable = new indexLoader(false, null,null,null);
   checkIfUserExists(request.body.email).then( function(fulfilledData)
   {  
     if(fulfilledData==null)
     {
       indexLoaderVariable.messageType="failure";
       indexLoaderVariable.message="Oops! the user does not exist";
       response.render('index', {indexLoaderVariable:indexLoaderVariable});
     }
     else
     {
       checkLoginInfo
       checkLoginInfo(request.body.email, request.body.password).then( function(fulfilledData)
       {  
         if(fulfilledData==null)
         {
            indexLoaderVariable.messageType="failure";
            indexLoaderVariable.message="Oops! Please check the Email and Password you've entered!";
            response.render('index', {indexLoaderVariable:indexLoaderVariable});
         }
         else
         {
           indexLoaderVariable.loggedIn = true;
           indexLoaderVariable.messageType="success";
           indexLoaderVariable.message="Welcome back "+fulfilledData.name;
           indexLoaderVariable.name=fulfilledData.name;
           response.render('index', {indexLoaderVariable:indexLoaderVariable});
         }
       }, function (error)
       {
       });
     }
     
   }, function (error)
   {
   });
});
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.post("/addNewUser", function(request, response){
    var indexLoaderVariable = new indexLoader(false, null,null,null);
  
    checkIfUserExists(request.body.email).then( function(fulfilledData)
    {
      if(fulfilledData==null)
      {
        registerNewUser(request.body).then(function (fulfilledData) 
        {
          indexLoaderVariable.messageType="success";
          indexLoaderVariable.message="Congratulations on beginning your journey with us!!!";
          response.render('index',{indexLoaderVariable:indexLoaderVariable});
        }, function (error) 
        {
          indexLoaderVariable.messageType="failure";
          indexLoaderVariable.message="Oops! Could not register you at the moment, please try again later!!";
          response.render('index',{indexLoaderVariable:indexLoaderVariable});
        });
      }
      else
      {
          indexLoaderVariable.messageType="failure";
          indexLoaderVariable.message="Oops! Seems like you have already registered!!";
          response.render('index',{indexLoaderVariable:indexLoaderVariable});
      }
    }, function (error)
    {
    });
});

var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});


function registerNewUser(newRecord)
{
  return new Promise(
      function(resolve, reject)
      {
            MongoClient.connect(process.env.MONGODB_URL,function(error, database)
            {
              if(error) throw error;
              else
              {
                var databaseObject = database.db("nightlife-coordination-application");
                databaseObject.collection("LoginInfo").insertOne(newRecord, function(err, result)
                {
                  if(err) reject(err);
                  else
                  {
                    database.close();
                    resolve(newRecord);
                  }
                });
              }
            });
      }
    );
}


function checkIfUserExists(emailId)
{
  return new Promise(
      function(resolve, reject)
      {
            MongoClient.connect(process.env.MONGODB_URL,function(error, database)
            {
              if(error) throw error;
              else
              {
                var databaseObject = database.db("nightlife-coordination-application");
                databaseObject.collection("LoginInfo").findOne({email: emailId}, function(err, result)
                {
                  if(err) reject(err);
                  else
                  {
                    database.close();
                    resolve(result);
                  }
                });
              }
            });
      }
    );
}

function checkLoginInfo(emailId,password)
{
  return new Promise(
      function(resolve, reject)
      {
            MongoClient.connect(process.env.MONGODB_URL,function(error, database)
            {
              if(error) throw error;
              else
              {
                var databaseObject = database.db("nightlife-coordination-application");
                databaseObject.collection("LoginInfo").findOne({email: emailId, password:password}, function(err, result)
                {
                  if(err) reject(err);
                  else
                  {
                    database.close();
                    resolve(result);
                  }
                });
              }
            });
      }
    );
}