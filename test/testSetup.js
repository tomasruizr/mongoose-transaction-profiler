const fs = require('fs');
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
const userModel = mongoose.model('User', userSchema, 'User');

async function getProfilerData(filename) {
    let file = await fs.readFile(filename, 'utf8');
    file = '[' + file.replace(/\}\s*\{/mig, "},{") + ']';
    return JSON.parse(file);
}


module.exports = {
  userSchema,
  userModel
}