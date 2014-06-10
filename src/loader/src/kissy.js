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
    // --no-module-wrap--
    var self = this,
        S;

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
            host: self,
            mods: {}
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
            packages: {},
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
         * @param {String} configName.base KISSY 's base path. Default: get from loader(-min).js or seed(-min).js
         * @param {String} configName.tag KISSY 's timestamp for native module. Default: KISSY 's build time.
         * @param {Boolean} configName.debug whether to enable debug mod.
         * @param {Boolean} configName.combine whether to enable combo.
         * @param {Object} configName.logger logger config
         * @param {Object[]} configName.logger.excludes  exclude configs
         * @param {Object} configName.logger.excludes.0 a single exclude config
         * @param {RegExp} configName.logger.excludes.0.logger  matched logger will be excluded from logging
         * @param {String} configName.logger.excludes.0.minLevel  minimum logger level (enum of debug info warn error)
         * @param {String} configName.logger.excludes.0.maxLevel  maximum logger level (enum of debug info warn error)
         * @param {Object[]} configName.logger.includes include configs
         * @param {Object} configName.logger.includes.0 a single include config
         * @param {RegExp} configName.logger.includes.0.logger  matched logger will be included from logging
         * @param {String} configName.logger.excludes.0.minLevel  minimum logger level (enum of debug info warn error)
         * @param {String} configName.logger.excludes.0.maxLevel  maximum logger level (enum of debug info warn error)
         * @param {Object} configName.packages Packages definition with package name as the key.
         * @param {String} configName.packages.base Package base path.
         * @param {String} configName.packages.tag  Timestamp for this package's module file.
         * @param {String} configName.packages.debug Whether force debug mode for current package.
         * @param {String} configName.packages.combine Whether allow combine for current package modules.
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
            if (typeof configName === 'string') {
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
            } else {
                for (var p in configName) {
                    configValue = configName[p];
                    fn = configFns[p];
                    if (fn) {
                        fn.call(self, configValue);
                    } else {
                        Config[p] = configValue;
                    }
                }
            }
            return r;
        }
    };

    var Loader = S.Loader = {};

    if (typeof location !== 'undefined') {
        if (location.search.indexOf('ks-debug') !== -1) {
            S.Config.debug = true;
        }
    }

    /**
     * Loader Status Enum
     * @enum {Number} KISSY.Loader.Status
     */
    Loader.Status = {
        /** error */
        ERROR: -1,
        /** init */
        INIT: 0,
        /** loading */
        LOADING: 1,
        /** loaded */
        LOADED: 2,
        /** attaching */
        ATTACHING: 3,
        /** attached */
        ATTACHED: 4
    };

    return S;
})();