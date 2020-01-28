const email = document.getElementById('email');
const password = document.getElementById('password');
const form = document.getElementById('form');
const error = document.getElementById('error');
var userModel = require("./models/user.js");


var db = require("./config/connection");
form.addEventListener('submit', (e) =>{

    console.log("IN FORM SUBMIT");
    db.sync().then(function(){
        return userModel.findOne({
          where:{
            email : email.value
          }
        })
      }).then(function(res, err){
        if(res)
        {
          var user = new userModel(
            {
            firstName: res.firstName,
            lastName: res.lastName,
            email : res.email,
            password : res.password,
            company : res.company
            }
          )
       
          console.log(JSON.stringify(user));
        }
        else{
          e.preventDefault();
          error.innerText("EMAIL PASS ERROR");
          console.log("NO USER");
        }
      });
    
});
