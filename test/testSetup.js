const mongoose = require('mongoose');
let connString = {
    protocol: 'mongodb',
    slashes: true,
    port: 27017,
    hostname: 'http://localhost:27017',
    pathname: 'demoDB'
}
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


module.exports = {
  userSchema,
  userModel
}