const Logger = require('./src/Logger.js');
const generalLogger = Logger("konekoe-server-%DATE%.log", null, { datePattern: "DD-MM-YYYY" });

module.exports = { Logger, generalLogger };
