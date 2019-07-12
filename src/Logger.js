const { mkdirSync, copyFileSync, unlinkSync } = require('fs');
const path = require('path');
const { addColors, createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');

const loggingLevels = {
    levels: {
      serverError: 0,
      serverInfo: 1,
      error: 2,
      daemon_info: 3,
      daemon_warning: 4,
      daemon_error: 5,
      daemon_critical: 6,
      verbose: 7,
      debug: 8,
    },
    colors: {
      serverError: 'red',
      serverInfo: 'white',
      daemon_info: 'whiteBG black',
      daemon_warning: 'whiteBG orange',
      daemon_error: 'whiteBG red',
      daemon_critical: 'bold redBG black',
      error: 'redBG black',
      verbose: 'green',
      debug: 'yellow'
    }
  };

  const myFormat = format.printf(({ level, message }) => {
    return `${ level } [${ new Date() }] : ${ message }`;
  });


const createDirectory = (dir) => {
  console.log("Logger:","Creating directory", dir);
  let dirs = dir.split('/');
  let currentPath = '';

  for (let someDir of dirs) {
    try {
      currentPath = path.join(currentPath, someDir);
      mkdirSync(currentPath, 0777);
    } catch (err) {
      if (err.code !== 'EEXIST') throw err
    }

  }
  console.log("Logger:",'Finished creating directory');
};

const Logger = (filename, inputPath, rotationOptions) => {
  console.log("Logger:","Instancing Logger");

  let loggingPath = inputPath || ( 'log' );

  createDirectory(loggingPath);

  let name = path.join(loggingPath, filename);

  let myTransports = [ ];

  const fileTransportOptions = {
    level: 'verbose',
    filename: name,
    format: format.combine(
      format.timestamp(),
      myFormat
    )
  };

  if (rotationOptions) {
    myTransports.push(
      new (transports.DailyRotateFile)({
        ...fileTransportOptions,
        ...rotationOptions
      })
    );
  }
  else {
    myTransports.push(new transports.File(fileTransportOptions));
  }

  //TODO: Add hanlding for different builds.
  console.log("Logger:","Add debug transport");
  myTransports.push(new transports.Console({
    level: 'debug',
    format: format.combine(
      format.colorize(),
      myFormat
    )
  }));
  addColors(loggingLevels.colors);

  console.log("Logger:","Create logger");
  var result = createLogger({
    levels: loggingLevels.levels,
    transports: myTransports,
    exitOnError: false
  });

  console.log("Logger:","Init logger");
  result.serverInfo("Init");
  return result;
};

module.exports = Logger;
