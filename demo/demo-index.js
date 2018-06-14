const mongoose = require('mongoose');

//the module
require('../index').profiler({filename: './thelog.log'});


const userSchema = new mongoose.Schema({
  age: {
      type: Number,
      required: false
  },
  name: {
      type: String
  },
  lastName: {
      type: String
  }
});

var userModel = mongoose.model('User', userSchema, 'User');
mongoose.connect(
  'mongodb://localhost:27017',
  function (err) {
    if (err) {
      return done(err);
    }
  let rand= Math.floor(Math.random()*500);
  let user = new userModel({
    age: rand,
    name: `Tomas ${rand}`,
    lastName: `Ruiz ${rand}`
  });
  user.save((err) => {
    if (err){
      return console.log(err);
    }
    userModel.find({name:/^Tomas/}).exec((err) => {
      if (err){
        return console.log(err);
      }
      mongoose.disconnect();
    });
  });
});
mongoose.connection.on('open', () => {
  console.log('Mongo connected');
});
mongoose.connection.on('close', () => {
  console.log('bye...');
  process.exit();
});