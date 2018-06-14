let mongoose = require('mongoose');
const assert = require('chai').assert;
const path = require('path');
const fs = require('fs');

let logFileName = path.resolve('./test/profilerLog.log');

const getProfilerData = require('../index').getProfilerData;
require('../index').profiler({filename: logFileName});
const setup = require('./testSetup');

mongoose.connection.on('open', () => {
  console.log('Mongo connected');
});
mongoose.connection.on('close', () => {
  console.log('bye...');
  // process.exit(0);
});

describe('profiling single transacction', function () {
  before(function (done) {
    let rand, user;
    mongoose.connect(
      'mongodb://localhost:27017',
      function (err) {
        if (err) {
          return done(err);
        }
        rand = Math.floor(Math.random() * 500);
        user = new setup.userModel({
          age: rand,
          name: `Tomas ${rand}`,
          lastName: `Ruiz ${rand}`
        });
        user.save((err) => {
          if (err) {
            console.log(err);
            return done(err);
          }
          done();
        });
      }
    );
  });
  after(() => {
    mongoose.disconnect();
  });
  beforeEach((done) => {
    fs.truncate(logFileName, done);
  });
  it(`profiles a single transaction with no conditions and no options with level info`, function (done) {
    setup.userModel.find().exec(async (err) => {
      if (err) {
        done(err);
      }
      // Use of the get profilerData without parameters
      let report = await getProfilerData(logFileName);
      assert.exists(report, 'Does not exist');
      assert.typeOf(report, 'array', 1);
      assert.isTrue(report.length > 0);
      assert.equal(report[0].message.operation, 'find');
      assert.equal(report[0].level, 'info');
      assert.isEmpty(report[0].message.options);
      assert.isEmpty(report[0].message.conditions);
      done();
    });
  });
  it('profiles a single transaction with conditions and no options with level info', function (done) {
    setup.userModel.find({name: /^Tomas/}).exec(async (err) => {
      if (err) {
        done(err);
      }
      // Use of the get profilerData without parameters
      let report = await getProfilerData(logFileName);
      assert.exists(report, 'Does not exist');
      assert.typeOf(report, 'array', 1);
      assert.isTrue(report.length > 0);
      assert.equal(report[0].message.operation, 'find');
      assert.equal(report[0].level, 'info');
      assert.isEmpty(report[0].message.options);
      assert.typeOf(report[0].message.conditions, 'object');
      assert.equal(report[0].message.conditions.name, '/^Tomas/');
      done();
    });
  }
  );
  it('profiles a single transaction with no conditions and options with level info', function (done) {
    setup.userModel.find({},[],{ sort:{name : -1} } ).exec(async (err, data) => {
      if (err) {
        done(err);
      }
      // Use of the get profilerData without parameters
      let report = await getProfilerData(logFileName);
      assert.exists(report, 'Does not exist');
      assert.typeOf(report, 'array', 1);
      assert.isTrue(report.length > 0);
      assert.equal(report[0].message.operation, 'find');
      assert.equal(report[0].level, 'info');
      assert.isEmpty(report[0].message.conditions);
      assert.typeOf(report[0].message.options, 'object');
      assert.typeOf(report[0].message.options.sort, 'object');
      assert.equal(report[0].message.options.sort.name, -1);
      done();
    });
  });
  it('profiles a single transaction with the conditions and options and fields with level info', function (done) {
    setup.userModel.find({name: /^Tomas/},['name'],{ sort:{name : -1} } ).exec(async (err, data) => {
      if (err) {
        done(err);
      }
      // Use of the get profilerData without parameters
      let report = await getProfilerData(logFileName);
      assert.exists(report, 'Does not exist');
      assert.typeOf(report, 'array', 1);
      assert.isTrue(report.length > 0);
      assert.equal(report[0].message.operation, 'find');
      assert.equal(report[0].level, 'info');
      assert.typeOf(report[0].message.conditions, 'object');
      assert.equal(report[0].message.conditions.name, '/^Tomas/');
      assert.typeOf(report[0].message.fields, 'object');
      assert.equal(report[0].message.fields.name, 1);
      assert.typeOf(report[0].message.options, 'object');
      assert.equal(report[0].message.options.sort.name, -1);
      done();
    });
  }
  );
});