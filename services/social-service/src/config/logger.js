class LoggerSingleton {
  constructor() {
    if (LoggerSingleton.instance) {
      return LoggerSingleton.instance;
    }

    this.levels = {
      INFO: 'INFO',
      DEBUG: 'DEBUG',
      WARNING: 'WARNING',
      ERROR: 'ERROR',
      CRITICAL: 'CRITICAL'
    };

    LoggerSingleton.instance = this;
  }

  _formatMessage(level, message, meta) {
    const timestamp = new Date().toISOString();
    let msg = `[${timestamp}] [${level}] ${message}`;
    if (meta) {
      if (meta instanceof Error) {
        msg += ` | Stack: ${meta.stack}`;
      } else {
        msg += ` | Meta: ${JSON.stringify(meta)}`;
      }
    }
    return msg;
  }

  info(message, meta = null) {
    console.log(this._formatMessage(this.levels.INFO, message, meta));
  }

  debug(message, meta = null) {
    // Podría deshabilitarse en producción
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this._formatMessage(this.levels.DEBUG, message, meta));
    }
  }

  warning(message, meta = null) {
    console.warn(this._formatMessage(this.levels.WARNING, message, meta));
  }

  error(message, errorOrMeta = null) {
    console.error(this._formatMessage(this.levels.ERROR, message, errorOrMeta));
  }

  critical(message, errorOrMeta = null) {
    // Aquí se podrían añadir alertas por correo, slack, etc.
    console.error(this._formatMessage(this.levels.CRITICAL, ` CRITICAL  - ${message}`, errorOrMeta));
  }
}

const logger = new LoggerSingleton();

module.exports = logger;
