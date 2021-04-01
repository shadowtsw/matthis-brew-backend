import path from 'path';
import fs from 'fs';
const callerPath = require('caller-path');

interface Options {
  FileName?: string | boolean;
  Path?: string | boolean;
  error?: boolean;
  FunctionName?: string | null;
  Seperator?: string;
  dateTime?: boolean;
  Time?: boolean;
  DevOnly?: boolean;
  CallerFunction?: boolean | string;
}

type AllowedConsoleLogs =
  | typeof console.log
  | typeof console.warn
  | typeof console.error
  | typeof console.table
  | typeof Error
  | 'browser'
  | 'error'
  | 'iterate';

export const log = console.log;
export const warn = console.warn;
export const _err = console.error;
export const _error = 'error';
export const browser = 'browser';
export const iterate = 'iterate';

interface ConsoleSettings {
  default: {
    [index: string]: any;
  };
  get: (arg: string) => any;
  set: (arg: string, value: string | boolean | null) => void;
}

export const consoleSettings: ConsoleSettings = {
  default: {
    FileName: true,
    Path: false,
    error: true,
    FunctionName: null,
    Seperator: '*- |',
    dateTime: true,
    Time: true,
    DevOnly: true,
  },
  get: (arg: string) => {
    return consoleSettings.default[arg];
  },
  set: (arg: string, value: any) => {
    consoleSettings.default[arg] = value;
  },
};

const logger = (cb?: AllowedConsoleLogs, options?: Options, topic?: string) => (
  ...text: any
) => {
  const DevOnly =
    options?.DevOnly !== undefined
      ? options.DevOnly
      : consoleSettings.get('DevOnly');

  const getType = (arg: any) => {
    if (arg === null) {
      return false;
    }
    if (typeof arg === 'boolean') {
      return arg;
    }
    return typeof arg;
  };

  if (cb === undefined) {
    cb = console.log;
  }

  if (
    process.env.NODE_ENV === 'development' &&
    DevOnly &&
    cb !== 'browser' &&
    cb !== 'iterate'
  ) {
    //Check options
    const FileName =
      options?.FileName !== undefined
        ? options.FileName
        : consoleSettings.get('FileName');
    const Path =
      options?.Path !== undefined ? options.Path : consoleSettings.get('Path');
    const error =
      options?.error !== undefined
        ? options.error
        : consoleSettings.get('error');
    const FunctionName = options?.FunctionName || null;
    const Seperator =
      options?.Seperator !== undefined
        ? options.Seperator
        : consoleSettings.get('Seperator');
    const dateTime =
      options?.dateTime !== undefined
        ? options.dateTime
        : consoleSettings.get('dateTime');
    const Time =
      options?.Time !== undefined ? options.Time : consoleSettings.get('Time');
    const CallerFunction =
      options?.CallerFunction !== undefined ? options.CallerFunction : true;

    //DETECT PATH
    const stackTrace = new Error().stack;
    let callerName = stackTrace?.replace(/^Error\s+/, '');

    //Compute values
    let computedFileName: string | null = '';
    let computedPathName: string | null = '';
    let computedDateTime: string | null = '';
    let computedTime: string | null = '';
    let computedCallerName: string | null | boolean = '';
    let computedError: string | null = '';

    switch (getType(FileName)) {
      case true:
        if (callerName) {
          let _FILE_ROW = callerName.split('\n')[2];
          let _FILE_NAME = _FILE_ROW.split('\\');
          const index = _FILE_NAME.length - 1;
          let DESTINATION = _FILE_NAME[index].replace(/\)/g, '');
          DESTINATION = DESTINATION.replace(/:/, ' at ');
          DESTINATION = DESTINATION.trim();
          computedFileName = DESTINATION;
        }
        if (computedFileName?.includes('/')) {
          computedFileName = 'Internal process';
          break;
        }
        break;
      case false:
        computedFileName = null;
        break;
      case 'string':
        computedFileName = FileName;
        break;
      default:
        break;
    }

    switch (getType(Path)) {
      case true:
        const callerPathString = callerPath().split('\\');
        computedPathName = callerPathString
          .slice(0, callerPathString.length - 1)
          .toString()
          .replace(/,/g, '\\');
        break;
      case false:
        computedPathName = null;
        break;
      case 'string':
        computedPathName = FileName;
        break;
      default:
        break;
    }

    switch (getType(dateTime)) {
      case true:
        const date = new Date().toISOString().split('T')[0];
        computedDateTime = date;
        break;
      case false:
        computedDateTime = null;
        break;
      default:
        break;
    }

    switch (getType(Time)) {
      case true:
        const time = new Date().toISOString().split('T')[1].split('.')[0];
        computedTime = time;
        break;
      case false:
        computedTime = null;
        break;
      default:
        break;
    }

    switch (getType(CallerFunction)) {
      case 'string':
        computedCallerName = CallerFunction;
        break;
      case true:
        let _FUNCTION_NAME = callerName?.split('\n')[2]; // 1st item is this, 2nd item is caller
        _FUNCTION_NAME = _FUNCTION_NAME?.replace(/^\s+at Object./, '');
        _FUNCTION_NAME = _FUNCTION_NAME?.replace(/ \(.+\)$/, '');
        _FUNCTION_NAME = _FUNCTION_NAME?.replace(/\@.+/, '');
        _FUNCTION_NAME = _FUNCTION_NAME?.replace(/at/g, '');
        _FUNCTION_NAME = _FUNCTION_NAME?.trim();
        if (_FUNCTION_NAME?.includes('anonymous')) {
          computedCallerName = 'ROOT-FILE';
        } else if (_FUNCTION_NAME?.includes('\\')) {
          let detectFile = _FUNCTION_NAME.split('\\');
          _FUNCTION_NAME = detectFile[detectFile.length - 1];
          _FUNCTION_NAME = `Function not found in ${_FUNCTION_NAME}`;
          computedCallerName = _FUNCTION_NAME;
        } else {
          computedCallerName = _FUNCTION_NAME + '()';
        }
        break;
      case undefined:
      case null:
      case false:
        computedCallerName = null;
        break;
      default:
        break;
    }

    switch (getType(error)) {
      case true:
        computedError = text;
        break;
      case false:
      case null:
        computedError = null;
        break;
      case 'string':
        break;
      default:
        break;
    }

    let onlyPrimitives = true;

    const checkArray = (textObject: Array<any>) => {
      for (let object of textObject) {
        if (typeof object === 'object') {
          onlyPrimitives = false;
        }
      }
    };

    checkArray(text);

    const display = (callback: Function, textObject: Array<any>) => {
      //prettier-ignore
      callback(`-->
    ${computedDateTime ? `${computedDateTime} | ` : ``}${computedTime ? `${computedTime} | ` : ``}${`
    ${computedPathName ? `Path: ${computedPathName} ${Seperator} ` : ``}${!computedFileName ? `` : `File: ${computedFileName} ${Seperator} `}${computedCallerName ? `CallerFunction: ${computedCallerName} ${Seperator}` : ``}`}
    ------------------------`)

      for (let [index, entry] of textObject.entries()) {
        if (typeof entry !== 'object') {
          callback(`${topic ? `${topic}[${index}]:` : ''} ${entry}`);
        } else {
          callback(topic ? topic + '[' + index + ']' + ':' : '', entry);
        }
      }
      callback('<--');
    };

    //prettier-ignore
    const file = `-->
    ${computedDateTime ? `${computedDateTime} | ` : ``}${computedTime ? `${computedTime} | ` : ``}${`
    ${computedPathName ? `Path: ${computedPathName} ${Seperator} ` : ``}${!computedFileName ? `` : `File: ${computedFileName} ${Seperator} `}${computedCallerName ? `CallerFunction: ${computedCallerName} ${Seperator}` : ``}`}
    ------------------------
    ${topic ? `${topic}:` : ""} ${text}
    `;

    if (error && computedError && cb === 'error') {
      throw new Error(file);
    } else if (typeof cb !== 'string') {
      if (onlyPrimitives) {
        cb(file);
        cb('<--');
      } else {
        display(cb, text);
      }
    }
  } else if (cb === 'browser') {
    const error =
      options?.error !== undefined
        ? options.error
        : consoleSettings.get('error');
    const dateTime =
      options?.dateTime !== undefined
        ? options.dateTime
        : consoleSettings.get('dateTime');
    const Time =
      options?.Time !== undefined ? options.Time : consoleSettings.get('Time');

    //Compute values
    let computedDateTime;
    let computedTime;

    switch (getType(dateTime)) {
      case true:
        const date = new Date().toISOString().split('T')[0];
        computedDateTime = date;
        break;
      case false:
        computedDateTime = null;
        break;
      default:
        break;
    }

    switch (getType(Time)) {
      case true:
        const time = new Date().toISOString().split('T')[1].split('.')[0];
        computedTime = time;
        break;
      case false:
        computedTime = null;
        break;
      default:
        break;
    }

    //prettier-ignore
    const file = `
    ${computedDateTime ? `${computedDateTime} | ` : ``}${computedTime ? `${computedTime} | ` : ``}
    ------------------------    
    ${topic ? `${topic}:` : ""} ${text}
    ++`;
    console.log(file);
  } else if (cb === 'iterate') {
    const FileName =
      options?.FileName !== undefined
        ? options.FileName
        : consoleSettings.get('FileName');
    const Path =
      options?.Path !== undefined ? options.Path : consoleSettings.get('Path');
    const error =
      options?.error !== undefined
        ? options.error
        : consoleSettings.get('error');
    const FunctionName = options?.FunctionName || null;
    const Seperator =
      options?.Seperator !== undefined
        ? options.Seperator
        : consoleSettings.get('Seperator');
    const dateTime =
      options?.dateTime !== undefined
        ? options.dateTime
        : consoleSettings.get('dateTime');
    const Time =
      options?.Time !== undefined ? options.Time : consoleSettings.get('Time');
    const CallerFunction =
      options?.CallerFunction !== undefined ? options.CallerFunction : true;

    //DETECT PATH
    const stackTrace = new Error().stack;
    let callerName = stackTrace?.replace(/^Error\s+/, '');

    //Compute values
    let computedFileName;
    let computedPathName;
    let computedDateTime;
    let computedTime;
    let computedCallerName;
    let computedError;

    switch (getType(FileName)) {
      case true:
        if (callerName) {
          let _FILE_ROW = callerName.split('\n')[2];
          let _FILE_NAME = _FILE_ROW.split('\\');
          const index = _FILE_NAME.length - 1;
          let DESTINATION = _FILE_NAME[index].replace(/\)/g, '');
          DESTINATION = DESTINATION.replace(/:/, ' at ');
          DESTINATION = DESTINATION.trim();
          computedFileName = DESTINATION;
        }
        if (computedFileName?.includes('/')) {
          computedFileName = 'Internal process';
          break;
        }
        break;
      case false:
        computedFileName = null;
        break;
      case 'string':
        computedFileName = FileName;
        break;
      default:
        break;
    }

    switch (getType(Path)) {
      case true:
        const callerPathString = callerPath().split('\\');
        computedPathName = callerPathString
          .slice(0, callerPathString.length - 1)
          .toString()
          .replace(/,/g, '\\');
        break;
      case false:
        computedPathName = null;
        break;
      case 'string':
        computedPathName = FileName;
        break;
      default:
        break;
    }

    switch (getType(dateTime)) {
      case true:
        const date = new Date().toISOString().split('T')[0];
        computedDateTime = date;
        break;
      case false:
        computedDateTime = null;
        break;
      default:
        break;
    }

    switch (getType(Time)) {
      case true:
        const time = new Date().toISOString().split('T')[1].split('.')[0];
        computedTime = time;
        break;
      case false:
        computedTime = null;
        break;
      default:
        break;
    }

    switch (getType(CallerFunction)) {
      case 'string':
        computedCallerName = CallerFunction;
        break;
      case true:
        let _FUNCTION_NAME = callerName?.split('\n')[2]; // 1st item is this, 2nd item is caller
        _FUNCTION_NAME = _FUNCTION_NAME?.replace(/^\s+at Object./, '');
        _FUNCTION_NAME = _FUNCTION_NAME?.replace(/ \(.+\)$/, '');
        _FUNCTION_NAME = _FUNCTION_NAME?.replace(/\@.+/, '');
        _FUNCTION_NAME = _FUNCTION_NAME?.replace(/at/g, '');
        _FUNCTION_NAME = _FUNCTION_NAME?.trim();
        if (_FUNCTION_NAME?.includes('anonymous')) {
          computedCallerName = 'ROOT-FILE';
        } else if (_FUNCTION_NAME?.includes('\\')) {
          let detectFile = _FUNCTION_NAME.split('\\');
          _FUNCTION_NAME = detectFile[detectFile.length - 1];
          _FUNCTION_NAME = `Function not found in ${_FUNCTION_NAME}`;
          computedCallerName = _FUNCTION_NAME;
        } else {
          computedCallerName = _FUNCTION_NAME + '()';
        }
        break;
      case undefined:
      case null:
      case false:
        computedCallerName = null;
        break;
      default:
        break;
    }

    switch (getType(error)) {
      case true:
        computedError = text;
        break;
      case false:
      case null:
        computedError = null;
        break;
      case 'string':
        break;
      default:
        break;
    }

    //prettier-ignore
    const file = `-->
    ${computedDateTime ? `${computedDateTime} | ` : ``}${computedTime ? `${computedTime} | ` : ``}${`
    ${computedPathName ? `Path: ${computedPathName} ${Seperator} ` : ``}${!computedFileName ? `` : `File: ${computedFileName} ${Seperator} `}${computedCallerName ? `CallerFunction: ${computedCallerName} ${Seperator}` : ``}`}
    ------------------------    
    ${topic ? `${topic}:` : ""}`;

    console.log(file);
    text.forEach((object: any) => {
      console.table(object);
    });
    console.log('');
    console.log('<--');
  } else {
    console.log(text);
  }
};

export default logger;
