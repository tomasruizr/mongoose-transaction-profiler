const winston = require('winston');
const path = require('path');
const fs = require('fs');
const assert = require('chai').assert;
const logFileName = path.resolve('./test/profilerLog.log');
// The library
const MongooseProfiler = require('../index');

let limits = {
  emerg: 80,
  alert: 70,
  crit: 60,
  error: 50,
  warning: 40,
  notice: 30,
  info: 20,
  debug: 10
};

describe('sortLimits', function() {
  it('should return a sorted object of limits', function() {
    let sorted = MongooseProfiler.sortLimits({
      alert: 70,
      emerg: 80,
      crit: 60,
      warning: 40,
      error: 50,
      debug: 10,
      notice: 30,
      info: 20
    });
    assert.deepEqual(Object.values(sorted), [ 10, 20, 30, 40, 50, 60, 70, 80 ]);
  });
  
});


describe('getLogLevel', function() {
  it('returns the correct method name given the limits for the duration with all levels registred', function() {
    assert.equal(MongooseProfiler.getLogLevel(85, limits, 'emerg'), 'emerg');
    assert.equal(MongooseProfiler.getLogLevel(75, limits, 'emerg'), 'emerg');
    assert.equal(MongooseProfiler.getLogLevel(65, limits, 'emerg'), 'alert');
    assert.equal(MongooseProfiler.getLogLevel(55, limits, 'emerg'), 'crit');
    assert.equal(MongooseProfiler.getLogLevel(45, limits, 'emerg'), 'error');
    assert.equal(MongooseProfiler.getLogLevel(35, limits, 'emerg'), 'warning');
    assert.equal(MongooseProfiler.getLogLevel(25, limits, 'emerg'), 'notice');
    assert.equal(MongooseProfiler.getLogLevel(15, limits, 'emerg'), 'info');
    assert.equal(MongooseProfiler.getLogLevel(5, limits, 'emerg'), 'debug');
    
  });
  it('returns the correct method name given the limits for the duration with some levels registred', function() {
    let lessLimits = Object.assign({}, limits);
    delete lessLimits.emerg;
    delete lessLimits.error;
    delete lessLimits.notice;
    delete lessLimits.debug;
    assert.equal(MongooseProfiler.getLogLevel(85, lessLimits, 'debug'), 'debug');
    assert.equal(MongooseProfiler.getLogLevel(75, lessLimits, 'debug'), 'debug');
    assert.equal(MongooseProfiler.getLogLevel(65, lessLimits, 'debug'), 'alert');
    assert.equal(MongooseProfiler.getLogLevel(55, lessLimits, 'debug'), 'crit');
    assert.equal(MongooseProfiler.getLogLevel(45, lessLimits, 'debug'), 'crit');
    assert.equal(MongooseProfiler.getLogLevel(35, lessLimits, 'debug'), 'warning');
    assert.equal(MongooseProfiler.getLogLevel(25, lessLimits, 'debug'), 'warning');
    assert.equal(MongooseProfiler.getLogLevel(15, lessLimits, 'debug'), 'info');
    assert.equal(MongooseProfiler.getLogLevel(5, lessLimits, 'debug'), 'info');
    
  });
  
});


describe('Log Levels', function() {
  beforeEach((done) => {
    fs.truncate(logFileName, done);
  });
  const logger =  winston.createLogger({
    level: 'silly',
    format: 
        winston.format.json(),
    transports: [
        new winston.transports.File({filename:logFileName})
    ]
});

  it(`profiles a single transaction with level info given the thershold`, async function () {
    let starts = {
      debug: new Date() - 65000,
      error: new Date() - 55000,
      http: new Date() - 45000,
      info: new Date() - 35000,
      silly: new Date() - 25000,
      verbose: new Date() - 15000,
      warn: new Date() - 5000
    };
    let limits = {
      debug: 70,
      error: 60,
      http: 50,
      info: 40,
      silly: 30,
      verbose: 20,
      warn: 10
    };
    MongooseProfiler.postOperation({op: 'debug', _conditions:'', options:'' }, {'"debug"""""': {conditions:{}, transactionStart: starts['debug'] }}, logger, limits);
    MongooseProfiler.postOperation({op: 'error', _conditions:'', options:'' }, {'"error"""""': {conditions:{}, transactionStart: starts['error'] }}, logger, limits);
    MongooseProfiler.postOperation({op: 'http', _conditions:'', options:'' }, {'"http"""""': {conditions:{}, transactionStart: starts['http'] }}, logger, limits);
    MongooseProfiler.postOperation({op: 'info', _conditions:'', options:'' }, {'"info"""""': {conditions:{}, transactionStart: starts['info'] }}, logger, limits);
    MongooseProfiler.postOperation({op: 'silly', _conditions:'', options:'' }, {'"silly"""""': {conditions:{}, transactionStart: starts['silly'] }}, logger, limits);
    MongooseProfiler.postOperation({op: 'verbose', _conditions:'', options:'' }, {'"verbose"""""': {conditions:{}, transactionStart: starts['verbose'] }}, logger, limits);
    MongooseProfiler.postOperation({op: 'warn', _conditions:'', options:'' }, {'"warn"""""': {conditions:{}, transactionStart: starts['warn'] }}, logger, limits);
    let report = await MongooseProfiler.getProfilerData(logFileName);
    assert.equal(report[0].level,'debug');
    assert.equal(report[1].level,'error');
    assert.equal(report[2].level,'http');
    assert.equal(report[3].level,'info');
    assert.equal(report[4].level,'silly');
    assert.equal(report[5].level,'verbose');
    assert.equal(report[6].level,'warn');
  });

  it(`logs an error when there's a function without start`, async function () {
    MongooseProfiler.postOperation({op: 'debug', _conditions:'', options:'' }, {asdf: {}}, logger, limits);
    let report = await MongooseProfiler.getProfilerData(logFileName);
    assert.equal(report[0].level,'error');
    assert.equal(report[0].message.error,'Post Operation without a transaction start.');
    assert.exists(report[0].message.key);
    assert.exists(report[0].message.operation);
  });
  it(`Alerts retigger transactions: profiles a transaction if it is recalled after finished with level alert`, async function () {
    MongooseProfiler.preOperation({op: 'debug', _conditions:'', options:'' }, {'"debug"""""': {}}, logger, limits);
    let report = await MongooseProfiler.getProfilerData(logFileName);
    assert.equal(report[0].level,'error');
    assert.equal(report[0].message.error,'The same operation is called more than one time before the first finishes. Only the first one is profiled');
    assert.exists(report[0].message.key);
    assert.exists(report[0].message.operation);
  } );
  it('define a profiler with not valid logger levels', function() {
    try{
      MongooseProfiler.profiler({filename:'asdf', limits:{asdf:39}});
    } catch(e){
      assert.equal(e.message, 'Mongo Profiler Error: the log level specified is not valid: the default ones are: debug error, http, info, silly, verbose, and warn, check winston documentation to create custom ones');
    }
    try{
      MongooseProfiler.profiler({filename:'asdf', limits:{info:'asdf'}});
    } catch(e){
      assert.equal(e.message, 'Mongo Profiler Error: The limits property should be composed of "loglevel":"seconds". Seconds is the higher boundry for the level');
    }
  });
  
});
  