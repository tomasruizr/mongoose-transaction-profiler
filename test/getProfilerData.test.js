// The library
const MongooseProfiler = require('../index');
const assert = require('chai').assert;
let logFileName = require('path').resolve('./test/profilerLog.log');
const fs = require('fs');

describe('getProfilerData', function () {
  before(() => {
    fs.writeFileSync(logFileName, '{"message":{"operation":"find","conditions":{},"options":{"name":{}},"transactionDate":"Tuesday, June 12, 2018 12:45 PM","duration":"0.012s"},"level":"info"}');
  });
  after((done) => {
    fs.truncate(logFileName, done);
  });
  it('should return an array with the profile data as json', async function () {
    let report;
    try {
      report = await MongooseProfiler.getProfilerData(logFileName);
    } catch (e) {
      assert(false, e.message);
    }
    assert.typeOf(report, 'array');
    assert.equal(report.length, 1);
    assert.exists(report[0].message);
    assert.exists(report[0].level);
    assert.exists(report[0].message.operation);
    assert.exists(report[0].message.conditions);
    assert.exists(report[0].message.options);
    assert.exists(report[0].message.transactionDate);
    assert.exists(report[0].message.duration);
  });
});