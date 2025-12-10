const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const isDevelopment = process.env.NODE_ENV !== 'production';

class Logger {
  static formatMessage(level, message, color) {
    const timestamp = new Date().toISOString();
    const levelTag = `[${level}]`.padEnd(8);
    return `${color}${levelTag}${colors.reset} ${colors.dim}${timestamp}${colors.reset} ${message}`;
  }

  static info(message) {
    console.log(this.formatMessage('INFO', message, colors.cyan));
  }

  static success(message) {
    console.log(this.formatMessage('SUCCESS', message, colors.green));
  }

  static warn(message) {
    console.warn(this.formatMessage('WARN', message, colors.yellow));
  }

  static error(message, error = null) {
    const errorMessage = error ? `${message}: ${error.message || error}` : message;
    console.error(this.formatMessage('ERROR', errorMessage, colors.red));
    if (error && isDevelopment && error.stack) {
      console.error(colors.dim + error.stack + colors.reset);
    }
  }

  static debug(message) {
    if (isDevelopment) {
      console.log(this.formatMessage('DEBUG', message, colors.magenta));
    }
  }

  static startup(message) {
    console.log(colors.green + colors.bright + '✓' + colors.reset + ' ' + message);
  }
}

module.exports = Logger;

