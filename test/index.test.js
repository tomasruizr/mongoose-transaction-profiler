// The library
const MongooseProfiler = require('../index').profiler;
const mongoose = require('mongoose');
var Mockgoose = require('mockgoose').Mockgoose;
var mockgoose = new Mockgoose(mongoose);
{ userSchema, userModel, getProfilerData } = require("./testSetup");
const fs = require('fs');
let logFileName = './profilerLog.log';
mongoose.connection.on('open', () => {
  console.log('Mongo connected');
})
mongoose.connection.on('close', () => {
  console.log('bye...');
  process.exit()
})
// The profiler
const profiler
const logger = winston.createLogger({
  level: "silly",
  // format: winston.format.json(),
  format: winston.format.prettyPrint(),
  transports: [
      new winston.transports.File({ filename: logFileName })
  ]
});
describe('mongo transaction profiler', function() {
  before((done) => {
    mockgoose.prepareStorage().then(function() {
      mongoose.connect('mongodb://localhost:27017', function(err) {
        done(err);
      });
    });
  })
  after(() => {
    mongoose.disconnect();
  })
  it('returns an error if no options');
  it('returns an error if no filename or logger defined in options');
  let configurations = {filename: {filename: logFileName}, logger: logger};
  Object.keys(configurations)
  .forEach(function (option) {
    describe(`with option ${option}`, function () {
      before(() => {
        profiler = MongooseProfiler(configurations[option]);
      })
      describe('profiling single transacction', function () {
        let rand, user;
        beforeEach(() => {
          rand = Math.floor(Math.random() * 500);
          user = createMockModel(userModel, {
            age: rand,
            name: `Tomas ${rand}`,
            lastName: `Ruiz ${rand}`
          });
        });
        afterEach(() => {
          fs.unlinkSync('./profilerLog.log')
        })
        it('profiles a single transaction with no conditions and no options with level info', (done) => {
          user.save((err, res) => {
            if (err) {
              done(err);
            }
            userModel.find({
              'name': /^Tomas/
            }).exec((err, data) => {
              if (err) {
                done(err);
              }
              getProfilerData(logFileName).then((data) => {
                
              })
            })
          })
        });
        it('profiles a single transaction with conditions and no options with level info', (done) => {
          user.save((err, res) => {
            if (err) {
              done(err);
            }
            userModel.find({
              'name': /^Tomas/
            }).exec((err, data) => {
              if (err) {
                done(err);
              }
              getProfilerData(logFileName).then((data) => {
                
              })
            })
          })
        });
        it('profiles a single transaction with no conditions and options with level info', (done) => {
          user.save((err, res) => {
            if (err) {
              done(err);
            }
            userModel.find({
              'name': /^Tomas/
            }).exec((err, data) => {
              if (err) {
                done(err);
              }
              getProfilerData(logFileName).then((data) => {
                
              })
            })
          })
        });
        it('profiles a single transaction with the conditions and options with level info', (done) => {
          user.save((err, res) => {
            if (err) {
              done(err);
            }
            userModel.find({
              'name': /^Tomas/
            }).exec((err, data) => {
              if (err) {
                done(err);
              }
              getProfilerData(logFileName).then((data) => {
                
              })
            })
          })
        });
      });
      
      describe.skip('logs levels of warning as specified in the options', function() {
        it('profiles a single transaction with the conditions and options with level info', (done) => {
          
        });
        it('profiles a single transaction with the conditions and options with level warning', (done) => {
          
        });
        it('profiles a single transaction with the conditions and options with level critic', (done) => {
          
        });
      });
      
      describe.skip('Alerts retigger transactions', function () {
        it('profiles a transaction if it is recalled after finished with level alert', function (done) {

        });

      });


    });
  })
});