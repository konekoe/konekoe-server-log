const fs = require('fs');
const path = require('path');
const { addColors, createLogger, format, transports } = require('winston');

const logFileStamp = () => {
  var date = new Date;
  return date.getDate().toString()+"."+(date.getMonth() + 1).toString()+"."+date.getFullYear().toString();
}

const loggingLevels = {
    levels: {
      serverError: 0,
      daemonError: 1,
      serverInfo: 2,
      daemonInfo: 3,
      verbose: 4,
      debug: 5
    },
    colors: {
      serverError: 'red',
      daemonError: 'orange',
      serverInfo: 'white',
      daemonInfo: 'blue',
      verbose: 'green',
      debug: 'yellow'
    }
  };

  const myFormat = format.printf(({ level, message, timestamp }) => {
    return `${level} [${timestamp}] : ${message}`;
  });


const createDirectory = (dir) => {
  let dirs = dir.split('/');
  let currentPath = '';

  for (let someDir of dirs) {
    try {
      currentPath = path.join(currentPath, someDir);
      fs.mkdirSync(currentPath, 0777);
    } catch (err) {
      if (err.code !== 'EEXIST') throw err
    }

  }
}

const Logger = (filename, inputPath) => {

  let loggingPath = inputPath || ( 'log' );

  createDirectory(loggingPath);

  let name = path.join(loggingPath, filename);

  let myTransports = [
    new transports.File({ level: 'verbose', filename: name, json: false, timestamp: function() {return (new Date).toString('utf8')},
    handleExceptions: true,
    humanReadableUnhandledException: true})
  ];

  //TODO: Add hanlding for different builds.
  myTransports.push(new transports.Console({level: 'debug'}));
  addColors(loggingLevels.colors);

  var result = createLogger({
    levels: loggingLevels.levels,
    format: format.combine(
      format.timestamp(),
      format.colorize(),
      myFormat
    ),
    transports: myTransports,
    exitOnError: false
  });

  return result;
}

module.exports = Logger;
