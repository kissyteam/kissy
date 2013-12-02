/**
 * @ignore
 * A seed where KISSY grows up from, KISS Yeah !
 * @author https://github.com/kissyteam/kissy/contributors
 */

/**
 * The KISSY global namespace object. you can use
 *
 *
 *      KISSY.each/mix
 *
 * to do basic operation. or
 *
 *
 *      KISSY.use('overlay,node', function(S, Overlay, Node){
 *          //
 *      });
 *
 * to do complex task with modules.
 * @singleton
 * @class KISSY
 */
/* exported KISSY */
/*jshint -W079 */
var KISSY = (function (undefined) {
    var host = this,
        S,
        guid = 0,
        EMPTY = '';

    /**
     * Log class for specified logger
     * @class KISSY.Logger
     * @private
     */

    /**
     * print debug log
     * @method
     * @param {String} str log str
     */

    /**
     * print info log
     * @method
     * @param {String} str log str
     */

    /**
     * print warn log
     * @method
     * @param {String} str log str
     */

    /**
     * print error log
     * @method
     * @param {String} str log str
     */

    function getLogger(logger) {
        var obj = {};
        for (var cat in loggerLevel) {
            /*jshint loopfunc: true*/
            (function (obj, cat) {
                obj[cat] = function (msg) {
                    return S.log(msg, cat, logger);
                };
            })(obj, cat);
        }
        return obj;
    }

    var loggerLevel = {
        'debug': 10,
        'info': 20,
        'warn': 30,
        'error': 40
    };

    S = {
        /**
         * The build time of the library.
         * NOTICE: '@TIMESTAMP@' will replace with current timestamp when compressing.
         * @private
         * @type {String}
         */
        __BUILD_TIME: '@TIMESTAMP@',

        /**
         * KISSY Environment.
         * @private
         * @type {Object}
         */
        Env: {
            host: host
        },

        /**
         * KISSY Config.
         * If load kissy.js, Config.debug defaults to true.
         * Else If load kissy-min.js, Config.debug defaults to false.
         * @private
         * @property {Object} Config
         * @property {Boolean} Config.debug
         * @member KISSY
         */
        Config: {
            debug: '@DEBUG@',
            fns: {}
        },

        /**
         * The version of the library.
         * NOTICE: '@VERSION@' will replace with current version when compressing.
         * @type {String}
         */
        version: '@VERSION@',

        /**
         * set KISSY configuration
         * @param {Object|String} configName Config object or config key.
         * @param {String} configName.base KISSY 's base path. Default: get from kissy(-min).js or seed(-min).js
         * @param {String} configName.tag KISSY 's timestamp for native module. Default: KISSY 's build time.
         * @param {Boolean} configName.debug whether to enable debug mod.
         * @param {Boolean} configName.combine whether to enable combo.
         * @param {Object} configName.logger logger config
         * @param {Object[]} configName.logger.excludes  exclude configs
         * @param {Object} configName.logger.excludes.0 a single exclude config
         * @param {RegExp} configName.logger.excludes.0.logger  matched logger will be excluded from logging
         * @param {KISSY.Logger.Level} configName.logger.excludes.0.minLevel  minimum logger level
         * @param {KISSY.Logger.Level} configName.logger.excludes.0.maxLevel  maximum logger level
         * @param {Object[]} configName.logger.includes include configs
         * @param {Object} configName.logger.includes.0 a single include config
         * @param {RegExp} configName.logger.includes.0.logger  matched logger will be included from logging
         * @param {KISSY.Logger.Level} configName.logger.excludes.0.minLevel  minimum logger level
         * @param {KISSY.Logger.Level} configName.logger.excludes.0.maxLevel  maximum logger level
         * @param {Object} configName.packages Packages definition with package name as the key.
         * @param {String} configName.packages.base Package base path.
         * @param {String} configName.packages.tag  Timestamp for this package's module file.
         * @param {String} configName.packages.debug Whether force debug mode for current package.
         * @param {String} configName.packages.combine Whether allow combine for current package modules.
         * @param {String} [configName.packages.ignorePackageNameInUri=false] whether remove packageName from module request uri,
         * can only be used in production mode.
         * @param [configValue] config value.
         *
         * for example:
         *     @example
         *     KISSY.config({
         *      combine: true,
         *      base: '',
         *      packages: {
         *          'gallery': {
         *              base: 'http://a.tbcdn.cn/s/kissy/gallery/'
         *          }
         *      },
         *      modules: {
         *          'gallery/x/y': {
         *              requires: ['gallery/x/z']
         *          }
         *      }
         *     });
         */
        config: function (configName, configValue) {
            var cfg,
                r,
                self = this,
                fn,
                Config = S.Config,
                configFns = Config.fns;
            if (S.isObject(configName)) {
                S.each(configName, function (configValue, p) {
                    fn = configFns[p];
                    if (fn) {
                        fn.call(self, configValue);
                    } else {
                        Config[p] = configValue;
                    }
                });
            } else {
                cfg = configFns[configName];
                if (configValue === undefined) {
                    if (cfg) {
                        r = cfg.call(self);
                    } else {
                        r = Config[configName];
                    }
                } else {
                    if (cfg) {
                        r = cfg.call(self, configValue);
                    } else {
                        Config[configName] = configValue;
                    }
                }
            }
            return r;
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
                    var loggerCfg = S.Config.logger || {},
                        list, i, l, level, minLevel, maxLevel, reg;
                    cat = cat || 'debug';
                    level = loggerLevel[cat] || loggerLevel.debug;
                    if ((list = loggerCfg.includes)) {
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
                    } else if ((list = loggerCfg.excludes)) {
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
                if (typeof console !== 'undefined' && console.log && matched) {
                    console[cat && console[cat] ? cat : 'log'](msg);
                    return msg;
                }
            }
            return undefined;
        },

        /**
         * get log instance for specified logger
         * @param {String} logger logger name
         * @returns {KISSY.Logger} log instance
         */
        'getLogger': function (logger) {
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
        },

        /*
         * Generate a global unique id.
         * @param {String} [pre] guid prefix
         * @return {String} the guid
         */
        guid: function (pre) {
            return (pre || EMPTY) + guid++;
        }
    };

    if ('@DEBUG@') {
        S.Config.logger = {
            excludes: [
                {
                    logger: /^s\/.*/,
                    maxLevel: 'info',
                    minLevel: 'debug'
                }
            ]
        };
    }

    /**
     * Logger level enum
     * @enum {String} KISSY.Logger.Level
     */
    S.Logger = /**@type Function
     @ignore */{};
    S.Logger.Level = {
        /**
         * debug level
         */
        'DEBUG': 'debug',
        /**
         * info level
         */
        INFO: 'info',
        /**
         * warn level
         */
        WARN: 'warn',
        /**
         * error level
         */
        ERROR: 'error'
    };

    return S;
})();