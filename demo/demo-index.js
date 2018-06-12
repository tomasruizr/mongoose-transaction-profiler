const mongoose = require('mongoose');

//the module
const profiler = require('../index').profiler({filename: './thelog.log'});

mongoose.Promise = global.Promise;

let connString = {
    protocol: 'mongodb',
    slashes: true,
    port: 27017,
    hostname: 'http://localhost:27017',
    pathname: 'demoDB'
}

const mongo = mongoose.connect('mongodb://localhost:27017/demoDB');


/**
 * Debugging
 * - node server.js --LOG_MONGODB=true
 */
// mongoose.set('debug', true);

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

let rand= Math.floor(Math.random()*500);
// mongo.once('open', () => {
  // console.log('Connected to mongo DB')
  let user = new userModel({
    age: rand,
    name: `Tomas ${rand}`,
    lastName: `Ruiz ${rand}`
  })
  user.save((err, res) => {
    if (err){
      return console.log(err);
    }
    userModel.find({'name':/^Tomas/}).exec((err, data) => {
      if (err){
        return console.log(err);
      }
      mongoose.disconnect();
    })
  })
// });
// mongo.on('error', (err) => { if (err) throw err; });
mongoose.connection.on('open', () => {
  console.log('Mongo connected');
})
mongoose.connection.on('close', () => {
  console.log('bye...');
  process.exit()
})