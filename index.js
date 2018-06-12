var mongoose = require("mongoose");
const moment = require("moment");
const winston = require("winston");
const preOperation = function (context, timers, next) {
    let timer = {};
    let key =
    JSON.stringify(context.op) +
    JSON.stringify(context.options) +
    JSON.stringify(context._conditions);
    timer.operation = context.op;
    timer.conditions = context.options;
    timer.options = context._conditions;
    timer.transactionStart = Date.now();
    timers[key] = timer;
    next();
    return timers;
}
const postOperation = function (context, timers, logger) {
    let key =
    JSON.stringify(context.op) +
    JSON.stringify(context.options) +
    JSON.stringify(context._conditions);
    let report = timers[key];
    report.transactionEnd = Date.now();
    report.transactionDate = moment(report.transactionStart).format('LLLL')
    report.duration = (report.transactionEnd - report.transactionStart) / 1000 + "s",
    delete report.transactionEnd
    delete report.transactionStart
    delete timers[key];
    // info, warnin, critic, alert
    logger.info(report);
    return timers;
}
const profiler = function(options) {
    if (!options || (!options.filename && !options.logger)){
        throw new Error('Mongo Profiler Error: you should provide a "filename" or a winston "logger" for the profiler to work');
    }
    if (options.filename && options.logger){
        throw new Error('Mongo Profiler Error: you should provide either a winston logger in the logger property or a filename for the log. Not Both');
    }
    const logger = options.logger || winston.createLogger({
        level: "silly",
        format: 
        // winston.format.combine(
            winston.format.json(),
            // winston.format.prettyPrint()
        // ),
        transports: [
            new winston.transports.File(options)
        ]
    });
    
    let timers = {};
    const middleware = function(schema) {
        [
            "count",
            "find",
            "findOne",
            "findOneAndRemove",
            "findOneAndUpdate",
            "insertMany",
            "update"
        ].forEach(function(m) {
            schema.pre(m, function(next) {
                timers = preOperation(this, timers, next);
            });
            schema.post(m, function() {
                timers = postOperation(this, timers, logger);
            });
        });
    };
        
    mongoose.plugin(middleware);
    
};
module.exports = {
    profiler,
    preOperation,
    postOperation
}