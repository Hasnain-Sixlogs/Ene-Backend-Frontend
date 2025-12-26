const chalk = require('chalk');

/**
 * Logger utility with chalk styling for better console output
 */
const logger = {
  /**
   * Info logs - blue color
   */
  info: (...args) => {
    const timestamp = new Date().toISOString();
    console.log(chalk.blue(`[INFO]`), chalk.gray(`[${timestamp}]`), ...args);
  },

  /**
   * Success logs - green color
   */
  success: (...args) => {
    const timestamp = new Date().toISOString();
    console.log(chalk.green(`[SUCCESS]`), chalk.gray(`[${timestamp}]`), ...args);
  },

  /**
   * Error logs - red color
   */
  error: (...args) => {
    const timestamp = new Date().toISOString();
    console.error(chalk.red(`[ERROR]`), chalk.gray(`[${timestamp}]`), ...args);
  },

  /**
   * Warning logs - yellow color
   */
  warn: (...args) => {
    const timestamp = new Date().toISOString();
    console.warn(chalk.yellow(`[WARN]`), chalk.gray(`[${timestamp}]`), ...args);
  },

  /**
   * Debug logs - cyan color
   */
  debug: (...args) => {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString();
      console.log(chalk.cyan(`[DEBUG]`), chalk.gray(`[${timestamp}]`), ...args);
    }
  },

  /**
   * HTTP request logs - magenta color
   */
  http: (method, path, status, time) => {
    const timestamp = new Date().toISOString();
    const statusColor = status >= 500 ? chalk.red : status >= 400 ? chalk.yellow : status >= 300 ? chalk.blue : chalk.green;
    console.log(
      chalk.magenta(`[HTTP]`),
      chalk.gray(`[${timestamp}]`),
      chalk.white(method),
      path,
      statusColor(status),
      chalk.gray(`${time}ms`)
    );
  },

  /**
   * Database logs - cyan color
   */
  db: (...args) => {
    const timestamp = new Date().toISOString();
    console.log(chalk.cyan(`[DB]`), chalk.gray(`[${timestamp}]`), ...args);
  },

  /**
   * Socket.IO logs - magenta color
   */
  socket: (...args) => {
    const timestamp = new Date().toISOString();
    console.log(chalk.magenta(`[SOCKET]`), chalk.gray(`[${timestamp}]`), ...args);
  },

  /**
   * Plain log without styling (for special cases)
   */
  log: (...args) => {
    console.log(...args);
  }
};

module.exports = logger;

