  // The library
  const MongooseProfiler = require('../index').profiler;
  const assert = require('chai').assert;

  describe('initialization errors', function () {
    it('returns an error if no options', () => {
      try {
        MongooseProfiler();
      } catch (e) {
        assert.equal(e.message, 'Mongo Profiler Error: you should provide a "filename" or a winston "logger" for the profiler to work');
      }
    });
    it('returns an error if no filename or logger defined in options', () => {
      try {
        MongooseProfiler({
          name: 'this should not be here'
        });
      } catch (e) {
        assert.equal(e.message, 'Mongo Profiler Error: you should provide a "filename" or a winston "logger" for the profiler to work');
      }
    });
    it('returns an error if filename and logger are defined at the same time in the options', () => {
      try {
        MongooseProfiler({
          filename: 'asdf',
          logger: {}
        });
      } catch (e) {
        assert.equal(e.message, 'Mongo Profiler Error: you should provide either a winston logger in the logger property or a filename for the log. Not Both');
      }
    });

  });