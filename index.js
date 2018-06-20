const moment = require('moment');
const winston = require('winston');
const util = require('util');
const fs = require('fs');
let timers = {};
function sanitizeRegex(conditions) {
    Object.keys(conditions).forEach((prop) => {
        if (conditions[prop].constructor === RegExp) {
            conditions[prop] = conditions[prop].toString();
        }
    });
    return conditions;
}

function sortLimits(limits = {}) {
    const mapToObject = (map => {
        const obj = {};
        map.forEach((item) => {
            obj[item[0]] = item[1];
        });
        return obj;
    });
    let limitsMap = new Map(Object.entries(limits));
    limitsMap = [...limitsMap.entries()].sort((a, b) => a[1] > b[1]);
    return mapToObject(limitsMap);
}

async function getProfilerData(filename) {
    let file = await util.promisify(fs.readFile)(filename, 'utf8');
    file = '[' + file.replace(/\}\s*\{/mig, '},{') + ']';
    return JSON.parse(file);
}

function getLogLevel(duration, limits = {
    debug: 1,
    info: 3,
    warn: 7
}, defaultMethod = 'info') {

    let method = defaultMethod;
    let logLevels = Object.keys(limits);
    for (let index = 0; index < logLevels.length; index++) {
        if (limits[logLevels[index]]) {
            if (duration < limits[logLevels[index]]) {
                method = logLevels[index];
                break;
            }
        }
    }
    return method;
}


const preOperation = function (context, logger, next) {
    context._conditions = sanitizeRegex(context._conditions);
    let timer = {};
    let key =
        JSON.stringify(context.op) +
        JSON.stringify(context.options) +
        JSON.stringify(context._conditions);
    timer.operation = context.op;
    timer.conditions = sanitizeRegex(context._conditions);
    timer.fields = context._fields;
    timer.options = context.options;
    timer.transactionStart = Date.now();
    if (timers[key]) {
        logger.error({
            message: {
                error: 'The same operation is called more than one time before the first finishes. Only the first one is profiled',
                operation: context.op,
                options: context.options,
                conditions: context._conditions,
                tramsactionDate: moment().format('l, h:mm:ss'),
                key
            }
        });
    } else {
        timers[key] = timer;
    }
    next();
};
const postOperation = function (context, logger, limits) {
    context._conditions = sanitizeRegex(context._conditions);
    let key =
        JSON.stringify(context.op) +
        JSON.stringify(context.options) +
        JSON.stringify(context._conditions);
    if (!timers[key]) {
        logger.error({
            message: {
                error: 'Post Operation without a transaction start.',
                operation: context.op,
                options: context.options,
                conditions: context._conditions,
                tramsactionDate: moment().format('l, h:mm:ss'),
                key
            }
        });
        return;
    }
    let report = timers[key];
    report.conditions = sanitizeRegex(report.conditions);
    report.transactionEnd = Date.now();
    report.transactionDate = moment(report.transactionStart).format('l, h:mm:ss');
    let duration = (report.transactionEnd - report.transactionStart) / 1000;
    report.duration = duration + 's';
    delete report.transactionEnd;
    delete report.transactionStart;
    delete timers[key];
    let method = getLogLevel(duration, limits);
    logger[method](report);
};
const profiler = function (options) {
    if (!options || (!options.filename && !options.logger)) {
        throw new Error('Mongo Profiler Error: you should provide a "filename" or a winston "logger" for the profiler to work');
    }
    if (options.filename && options.logger) {
        throw new Error('Mongo Profiler Error: you should provide either a winston logger in the logger property or a filename for the log. Not Both');
    }
    const logger = options.logger || winston.createLogger({
        level: 'silly',
        format: winston.format.json(),
        transports: [new winston.transports.File(options)]
    });
    // log levels
    let logLevels = Object.keys(logger.levels);
    if (options.limits) {
        Object.keys(options.limits).forEach((level) => {
            if (!logLevels.includes(level)) {
                throw new Error('Mongo Profiler Error: the log level specified is not valid: the default ones are: debug error, http, info, silly, verbose, and warn, check winston documentation to create custom ones');
            }
            if (typeof options.limits[level] !== 'number') {
                throw new Error('Mongo Profiler Error: The limits property should be composed of "loglevel":"seconds". Seconds is the higher boundry for the level');
            }
        });
    }
    options.limits = sortLimits(options.limits) ? sortLimits(options.limits) : {
        debug: 1,
        info: 3,
        warn: 7
    };
    // Default log level for biggest transaction
    options.exceeded = options.exceeded || 'info';

    
    const middleware = function mongooseProfiler(schema) {
        [
            'count',
            'find',
            'findOne',
            'findOneAndRemove',
            'findOneAndUpdate',
            'insertMany',
            'update'
        ].forEach(function (m) {
            schema.pre(m, function (next) {
                preOperation(this, logger, next);
            });
            schema.post(m, function () {
                postOperation(this, logger, options.limits);
            });
        });
    };
    return middleware;
};


module.exports = {
    profiler,
    preOperation,
    postOperation,
    getLogLevel,
    getProfilerData,
    sortLimits
};