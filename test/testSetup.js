const mongoose = require('mongoose');
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
const userModel = mongoose.model('User', userSchema, 'User');

module.exports = {
  userSchema,
  userModel
};