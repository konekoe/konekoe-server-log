const { mkdirSync, copyFileSync } = require('fs');
const path = require('path');
const { addColors, createLogger, format, transports } = require('winston');

const logFileStamp = () => {
  var date = new Date;
  return date.getDate().toString()+"."+(date.getMonth() + 1).toString()+"."+date.getFullYear().toString();
};

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

const replaceOldFile = (filePath) => {
  console.log("Logger:","Replace existing file.");
  try {
    copyFileSync(filePath, filePath + '.old');
    console.log("Logger","Renamed old file to",filePath + '.old')
  }
  catch (err) {
    console.log("Logger:","An error occured:",err.message);
  }
};

const Logger = (filename, inputPath) => {
  console.log("Logger:","Instancing Logger");

  let loggingPath = inputPath || ( 'log' );

  createDirectory(loggingPath);

  let name = path.join(loggingPath, filename);

  replaceOldFile(name);

  let myTransports = [
    new transports.File({
      level: 'verbose',
      filename: name,
      format: format.combine(
        format.timestamp(),
        myFormat
      ),
      handleExceptions: true,
      humanReadableUnhandledException: true
    })
  ];

  //TODO: Add hanlding for different builds.
  console.log("Logger:","Add debug transport");
  myTransports.push(new transports.Console({
    level: 'debug',
    format: format.combine(
      format.timestamp(),
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
