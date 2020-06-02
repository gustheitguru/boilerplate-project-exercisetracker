const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const dotenv = require('dotenv').config();
const cors = require('cors')

const mongoose = require('mongoose');
let uri = process.env.MONGO_URI;
mongoose.connect(uri, { 
  useUnifiedTopology: true, 
  useNewUrlParser: true 
});

app.use(cors());

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// MongoDB Schema for User creation
let userSchema = new mongoose.Schema({
  username: String
});
// User for mongoDB call
let User = mongoose.model('User', userSchema);

// MongoDB Schema for Exercise
let exerciseSchema = new mongoose.Schema({
  userId: {type: String, required: true}, // string is required
  description: {type: String, required: true}, // string is required for description
  duration: {type: Number, required: true}, // Number of duration is required for duration
  date: {type: Date, default: Date.now } //Enter in date || enter in todays date by default
});

// Exercise for mongoDB Call
let Exercise = mongoose.model('Exercise', exerciseSchema);

// Rules to follow for the project

// 1) I can create a user by posting form data username to 
//   /api/exercise/new-user and returned will be an object with username and _id.

app.post('/api/exercise/new-user', (req, res) => {
  let user = req.body.username; // with out username it will return a JSON {'username': nameEntered}
  // console.log(user); // console test
  // res.json(user); // page print test
  User.findOne({'username': user}, (err, storedUsername) => { // search mongoDB for User name
    
    if (err) return; // return error
    
    if (storedUsername) { // if it does return string to page
      
    res.send('User name' + user + 'already taken.'); // name taken string
      
  } else { // add string to db and return new JSON with user name and ID
    
    let newUser = new User({'username': user}); //use new function to create the user from User Object
    
    newUser.save((err, createdUser) => { // mongoose save function to create user in  mongoDB
        if (err) return; // return error
        res.json({ username: user, _id: createdUser._id }); //return newly created user and MongoDB ID
      });
  }
  });
});


// 2) I can get an array of all users by getting '/api/exercise/users' 
//   with the same info as when creating a user.

app.get('/api/exercise/users', (req, res) => { 
  User.find({},'username', (err, users) => { //find function on mongoose {Empty to return all}, 
                                            //find all objects that have User as a key, Function to execute
    let output = []; // put all objects into an array  
    
    users.map((user) => { // map users to output array
      output.push(user); //push to array
    });
    
    res.send(output); //send to page
  });
});

// 3) I can add an exercise to any user by posting form data userId(_id), description, duration, 
//   and optionally date to /api/exercise/add. If no date supplied it will use current date. 
//   App will return the user object with the exercise fields added.
app.post('/api/exercise/add', (req, res) => {
  console.log(req.body);
  // { userId: '5ed31407943edf20675a3e0e',
  // description: 'burpee',
  // duration: '15',
  // date: '' }
 res.json(req.body);
});


// 4) I can retrieve a full exercise log of any user by getting 
//   /api/exercise/log with a parameter of userId(_id). App will return the user 
//   object with added array log and count (total exercise count).



// 5) I can retrieve part of the log of any user by also passing along 
//   optional parameters of from & to or limit. (Date format yyyy-mm-dd, limit = int)



// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
