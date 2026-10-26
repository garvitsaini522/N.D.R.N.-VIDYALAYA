import { config } from '../config/env.js';

const levels = {
  INFO: '\x1b[32m[INFO]\x1b[0m',
  WARN: '\x1b[33m[WARN]\x1b[0m',
  ERROR: '\x1b[31m[ERROR]\x1b[0m',
  DEBUG: '\x1b[36m[DEBUG]\x1b[0m',
};

function formatMessage(level, message, meta) {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
  return `${timestamp} ${level} ${message}${metaStr}`;
}

export const logger = {
  info(message, meta) {
    console.log(formatMessage(levels.INFO, message, meta));
  },
  warn(message, meta) {
    console.warn(formatMessage(levels.WARN, message, meta));
  },
  error(message, meta) {
    console.error(formatMessage(levels.ERROR, message, meta));
  },
  debug(message, meta) {
    if (config.env !== 'production') {
      console.log(formatMessage(levels.DEBUG, message, meta));
    }
  },
};
