/**
 * logger utils
 * @author yiminghe@gmail.com
 */
(function (S) {
    function getLogger(logger) {
        var obj = {};
        for (var cat in loggerLevel) {
            /*jshint loopfunc: true*/
            (function (obj, cat) {
                obj[cat] = function (msg) {
                    return LoggerManager.log(msg, cat, logger);
                };
            })(obj, cat);
        }
        return obj;
    }

    var config = {};
    if ('@DEBUG@') {
        config = {
            excludes: [
                {
                    logger: /^s\/.*/,
                    maxLevel: 'info',
                    minLevel: 'debug'
                }
            ]
        };
    }

    var loggerLevel = {
        debug: 10,
        info: 20,
        warn: 30,
        error: 40
    };

    var LoggerManager = {
        config: function (cfg) {
            config = cfg || config;
            return config;
        },
        /**
         * Prints debug info.
         * @param msg {String} the message to log.
         * @param {String} [cat] the log category for the message. Default
         *        categories are 'info', 'warn', 'error', 'time' etc.
         * @param {String} [logger] the logger of the the message (opt)
         */
        log: function (msg, cat, logger) {
            if ('@DEBUG@') {
                var matched = 1;
                if (logger) {
                    var list, i, l, level, minLevel, maxLevel, reg;
                    cat = cat || 'debug';
                    level = loggerLevel[cat] || loggerLevel.debug;
                    if ((list = config.includes)) {
                        matched = 0;
                        for (i = 0; i < list.length; i++) {
                            l = list[i];
                            reg = l.logger;
                            maxLevel = loggerLevel[l.maxLevel] || loggerLevel.error;
                            minLevel = loggerLevel[l.minLevel] || loggerLevel.debug;
                            if (minLevel <= level && maxLevel >= level && logger.match(reg)) {
                                matched = 1;
                                break;
                            }
                        }
                    } else if ((list = config.excludes)) {
                        matched = 1;
                        for (i = 0; i < list.length; i++) {
                            l = list[i];
                            reg = l.logger;
                            maxLevel = loggerLevel[l.maxLevel] || loggerLevel.error;
                            minLevel = loggerLevel[l.minLevel] || loggerLevel.debug;
                            if (minLevel <= level && maxLevel >= level && logger.match(reg)) {
                                matched = 0;
                                break;
                            }
                        }
                    }
                    if (matched) {
                        msg = logger + ': ' + msg;
                    }
                }
                /*global console*/
                if (matched) {
                    if (typeof console !== 'undefined' && console.log) {
                        console[cat && console[cat] ? cat : 'log'](msg);
                    }
                    return msg;
                }
            }
            return undefined;
        },

        /**
         * get log instance for specified logger
         * @param {String} logger logger name
         * @returns {KISSY.LoggerManager} log instance
         */
        getLogger: function (logger) {
            return getLogger(logger);
        },

        /**
         * Throws error message.
         */
        error: function (msg) {
            if ('@DEBUG@') {
                // with stack info!
                throw msg instanceof  Error ? msg : new Error(msg);
            }
        }
    };

    /**
     * Log class for specified logger
     * @class KISSY.LoggerManager
     * @private
     */
    /**
     * print debug log
     * @method debug
     * @member KISSY.LoggerManager
     * @param {String} str log str
     */

    /**
     * print info log
     * @method info
     * @member KISSY.LoggerManager
     * @param {String} str log str
     */

    /**
     * print warn log
     * @method log
     * @member KISSY.LoggerManager
     * @param {String} str log str
     */

    /**
     * print error log
     * @method error
     * @member KISSY.LoggerManager
     * @param {String} str log str
     */

    S.LoggerMangaer = LoggerManager;
    S.getLogger = LoggerManager.getLogger;
    S.log = LoggerManager.log;
    S.error = LoggerManager.error;
    S.Config.fns.logger = LoggerManager.config;
})(KISSY);