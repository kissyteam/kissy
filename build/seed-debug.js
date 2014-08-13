/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Aug 13 18:33
*/
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
         * NOTICE: '20140813183328' will replace with current timestamp when compressing.
         * @private
         * @type {String}
         */
        __BUILD_TIME: '20140813183328',

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
         * NOTICE: '5.0.0' will replace with current version when compressing.
         * @type {String}
         */
        version: '5.0.0',

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
})();/**
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
})(KISSY);/**
 * @ignore
 * Utils for kissy loader
 * @author yiminghe@gmail.com
 */
(function (S) {
    // --no-module-wrap--
    var Loader = S.Loader,
        Env = S.Env,
        mods = Env.mods,
        map = Array.prototype.map,
        host = Env.host,
        /**
         * @class KISSY.Loader.Utils
         * Utils for KISSY Loader
         * @singleton
         * @private
         */
        Utils = Loader.Utils = {},
        doc = host.document;

    function numberify(s) {
        var c = 0;
        // convert '1.2.3.4' to 1.234
        return parseFloat(s.replace(/\./g, function () {
            return (c++ === 0) ? '.' : '';
        }));
    }

    function splitSlash(str) {
        var parts = str.split(/\//);
        if (str.charAt(0) === '/' && parts[0]) {
            parts.unshift('');
        }
        if (str.charAt(str.length - 1) === '/' && str.length > 1 && parts[parts.length - 1]) {
            parts.push('');
        }
        return parts;
    }

    var m, v,
        ua = (host.navigator || {}).userAgent || '';

    // https://github.com/kissyteam/kissy/issues/545
    if (((m = ua.match(/AppleWebKit\/([\d.]*)/)) || (m = ua.match(/Safari\/([\d.]*)/))) && m[1]) {
        Utils.webkit = numberify(m[1]);
    }
    if ((m = ua.match(/Trident\/([\d.]*)/))) {
        Utils.trident = numberify(m[1]);
    }
    if ((m = ua.match(/Gecko/))) {
        Utils.gecko = 0.1; // Gecko detected, look for revision
        if ((m = ua.match(/rv:([\d.]*)/)) && m[1]) {
            Utils.gecko = numberify(m[1]);
        }
    }
    if ((m = ua.match(/MSIE ([^;]*)|Trident.*; rv(?:\s|:)?([0-9.]+)/)) &&
        (v = (m[1] || m[2]))) {
        Utils.ie = numberify(v);
        Utils.ieMode = doc.documentMode || Utils.ie;
        Utils.trident = Utils.trident || 1;
    }

    var urlReg = /http(s)?:\/\/([^/]+)(?::(\d+))?/,
        commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg,
        requireRegExp = /[^.'"]\s*require\s*\((['"])([^)]+)\1\)/g;

    function normalizeName(name) {
        // 'x/' 'x/y/z/'
        if (name.charAt(name.length - 1) === '/') {
            name += 'index';
        }
        // x.js === x
        if (Utils.endsWith(name, '.js')) {
            name = name.slice(0, -3);
        }
        return name;
    }

    function each(obj, fn) {
        var i = 0,
            myKeys, l;
        if (isArray(obj)) {
            l = obj.length;
            for (; i < l; i++) {
                if (fn(obj[i], i, obj) === false) {
                    break;
                }
            }
        } else {
            myKeys = keys(obj);
            l = myKeys.length;
            for (; i < l; i++) {
                if (fn(obj[myKeys[i]], myKeys[i], obj) === false) {
                    break;
                }
            }
        }
    }

    function keys(obj) {
        var ret = [];
        for (var key in obj) {
            ret.push(key);
        }
        return ret;
    }

    var isArray = Array.isArray || function (obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    };

    function mix(to, from) {
        for (var i in from) {
            to[i] = from[i];
        }
        return to;
    }

    mix(Utils, {
        mix: mix,

        noop: function () {
        },

        map: map ?
            function (arr, fn, context) {
                return map.call(arr, fn, context || this);
            } :
            function (arr, fn, context) {
                var len = arr.length,
                    res = new Array(len);
                for (var i = 0; i < len; i++) {
                    var el = typeof arr === 'string' ? arr.charAt(i) : arr[i];
                    if (el ||
                        //ie<9 in invalid when typeof arr == string
                        i in arr) {
                        res[i] = fn.call(context || this, el, i, arr);
                    }
                }
                return res;
            },

        startsWith: function (str, prefix) {
            return str.lastIndexOf(prefix, 0) === 0;
        },

        isEmptyObject: function (o) {
            for (var p in o) {
                if (p !== undefined) {
                    return false;
                }
            }
            return true;
        },

        endsWith: function (str, suffix) {
            var ind = str.length - suffix.length;
            return ind >= 0 && str.indexOf(suffix, ind) === ind;
        },

        now: Date.now || function () {
            return +new Date();
        },

        each: each,

        keys: keys,

        isArray: isArray,

        indexOf: function (item, arr) {
            for (var i = 0, l = arr.length; i < l; i++) {
                if (arr[i] === item) {
                    return i;
                }
            }
            return -1;
        },

        normalizeSlash: function (str) {
            return str.replace(/\\/g, '/');
        },

        normalizePath: function (parentPath, subPath) {
            var firstChar = subPath.charAt(0);
            if (firstChar !== '.') {
                return subPath;
            }
            var parts = splitSlash(parentPath);
            var subParts = splitSlash(subPath);
            parts.pop();
            for (var i = 0, l = subParts.length; i < l; i++) {
                var subPart = subParts[i];
                if (subPart === '.') {
                } else if (subPart === '..') {
                    parts.pop();
                } else {
                    parts.push(subPart);
                }
            }
            return parts.join('/').replace(/\/+/, '/');
        },

        isSameOriginAs: function (url1, url2) {
            var urlParts1 = url1.match(urlReg);
            var urlParts2 = url2.match(urlReg);
            return urlParts1[0] === urlParts2[0];
        },

        /**
         * get document head
         * @return {HTMLElement}
         */
        docHead: function () {
            return doc.getElementsByTagName('head')[0] || doc.documentElement;
        },

        /**
         * Returns hash code of a string djb2 algorithm
         * @param {String} str
         * @returns {String} hash code
         */
        getHash: function (str) {
            var hash = 5381,
                i;
            for (i = str.length; --i > -1;) {
                hash = ((hash << 5) + hash) + str.charCodeAt(i);
                /* hash * 33 + char */
            }
            return hash + '';
        },

        // ---------------------------------- for modules

        getRequiresFromFn: function (fn) {
            var requires = [];
            // Remove comments from the callback string,
            // look for require calls, and pull them into the dependencies,
            // but only if there are function args.
            fn.toString()
                .replace(commentRegExp, '')
                .replace(requireRegExp, function (match, _, dep) {
                    requires.push(dep);
                });
            return requires;
        },

        // get a module from cache or create a module instance
        createModule: function (name, cfg) {
            var module = mods[name];

            if (!module) {
                name = normalizeName(name);
                module = mods[name];
            }

            if (module) {
                if (cfg) {
                    mix(module, cfg);
                    // module definition changes requires
                    if (cfg.requires) {
                        module.setRequiresModules(cfg.requires);
                    }
                }
                return module;
            }

            // 防止 cfg 里有 tag，构建 fullpath 需要
            mods[name] = module = new Loader.Module(mix({
                name: name
            }, cfg));

            return module;
        },

        createModules: function (names) {
            return Utils.map(names, function (name) {
                return Utils.createModule(name);
            });
        },

        attachModules: function (mods) {
            var l = mods.length, i;
            for (i = 0; i < l; i++) {
                mods[i].attachRecursive();
            }
        },

        getModulesExports: function (mods) {
            var l = mods.length, i,
                ret = [];
            for (i = 0; i < l; i++) {
                ret.push(mods[i].getExports());
            }
            return ret;
        },

        addModule: function (name, factory, config) {
            var module = mods[name];
            if (module && module.factory !== undefined) {
                S.log(name + ' is defined more than once', 'warn');
                return;
            }
            Utils.createModule(name, mix({
                name: name,
                status: Loader.Status.LOADED,
                factory: factory
            }, config));

        }
    });
})
(KISSY);
/**
 * @ignore
 * setup data structure for kissy loader
 * @author yiminghe@gmail.com
 */
(function (S) {
    // --no-module-wrap--
    var Loader = S.Loader,
        Config = S.Config,
        Status = Loader.Status,
        ATTACHED = Status.ATTACHED,
        ATTACHING = Status.ATTACHING,
        Utils = Loader.Utils,
        startsWith = Utils.startsWith,
        createModule = Utils.createModule,
        mix = Utils.mix;

    function makeArray(arr) {
        var ret = [];
        for (var i = 0; i < arr.length; i++) {
            ret[i] = arr[i];
        }
        return ret;
    }

    function wrapUse(fn) {
        if (typeof fn === 'function') {
            return function () {
                fn.apply(this, makeArray(arguments).slice(1));
            };
        } else if (fn && fn.success) {
            var original = fn.success;
            fn.success = function () {
                original.apply(this, makeArray(arguments).slice(1));
            };
            return fn;
        }
    }

    function checkGlobalIfNotExist(self, property) {
        return property in self ? self[property] : Config[property];
    }

    /**
     * @class KISSY.Loader.Package
     * @private
     * This class should not be instantiated manually.
     */
    function Package(cfg) {
        mix(this, cfg);
    }

    Package.prototype = {
        constructor: Package,

        reset: function (cfg) {
            mix(this, cfg);
        },

        getFilter: function () {
            return checkGlobalIfNotExist(this, 'filter');
        },

        /**
         * Tag for package.
         * tag can not contain ".", eg: Math.random() !
         * @return {String}
         */
        getTag: function () {
            return checkGlobalIfNotExist(this, 'tag');
        },

        /**
         * get package url
         */
        getBase: function () {
            return this.base;
        },

        /**
         * Get charset for package.
         * @return {String}
         */
        getCharset: function () {
            return checkGlobalIfNotExist(this, 'charset');
        },

        /**
         * Whether modules are combined for this package.
         * @return {Boolean}
         */
        isCombine: function () {
            return checkGlobalIfNotExist(this, 'combine');
        },

        /**
         * Get package group (for combo).
         * @returns {String}
         */
        getGroup: function () {
            return checkGlobalIfNotExist(this, 'group');
        }
    };

    Loader.Package = Package;

    /**
     * @class KISSY.Loader.Module
     * @private
     * This class should not be instantiated manually.
     */
    function Module(cfg) {
        var self = this;
        /**
         * exports of this module
         */
        self.exports = undefined;

        /**
         * status of current modules
         */
        self.status = Status.INIT;

        /**
         * name of this module
         */
        self.name = undefined;

        /**
         * factory of this module
         */
        self.factory = undefined;

        // lazy initialize and commonjs module format
        self.cjs = 1;

        mix(self, cfg);

        self.waits = {};

        var require = self._require = function (moduleName) {
            if (typeof moduleName === 'string') {
                var requiresModule = self.resolve(moduleName);
                Utils.attachModules(requiresModule.getNormalizedModules());
                return requiresModule.getExports();
            } else {
                require.async.apply(require, arguments);
            }
        };

        require.async = function (mods) {
            for (var i = 0; i < mods.length; i++) {
                mods[i] = self.resolve(mods[i]).name;
            }
            var args = makeArray(arguments);
            args[0] = mods;
            args[1] = wrapUse(args[1]);
            S.use.apply(S, args);
        };

        require.resolve = function (relativeName) {
            return self.resolve(relativeName).getUrl();
        };

        require.toUrl = function (path) {
            var url = self.getUrl();
            var pathIndex = url.indexOf('//');
            if (pathIndex === -1) {
                pathIndex = 0;
            } else {
                pathIndex = url.indexOf('/', pathIndex + 2);
                if (pathIndex === -1) {
                    pathIndex = 0;
                }
            }
            var rest = url.substring(pathIndex);
            path = Utils.normalizePath(rest, path);
            return url.substring(0, pathIndex) + path;
        };

        require.load = S.getScript;
//      relative name resolve cache
//      self.resolveCache = {};
    }

    Module.prototype = {
        kissy: 1,

        constructor: Module,

        require: function (moduleName) {
            return this.resolve(moduleName).getExports();
        },

        resolve: function (relativeName) {
            return createModule(Utils.normalizePath(this.name, relativeName));
        },

        add: function (loader) {
            this.waits[loader.id] = loader;
        },

        remove: function (loader) {
            delete this.waits[loader.id];
        },

        contains: function (loader) {
            return this.waits[loader.id];
        },

        flush: function () {
            Utils.each(this.waits, function (loader) {
                loader.flush();
            });
            this.waits = {};
        },

        /**
         * Get the type if current Module
         * @return {String} css or js
         */
        getType: function () {
            var self = this,
                v = self.type;
            if (!v) {
                if (Utils.endsWith(self.name, '.css')) {
                    v = 'css';
                } else {
                    v = 'js';
                }
                self.type = v;
            }
            return v;
        },

        getExports: function () {
            return this.getNormalizedModules()[0].exports;
        },

        getAlias: function () {
            var self = this,
                name = self.name;
            if (self.normalizedAlias) {
                return self.normalizedAlias;
            }
            var alias = getShallowAlias(self);
            var ret = [];
            if (alias[0] === name) {
                ret = alias;
            } else {
                for (var i = 0, l = alias.length; i < l; i++) {
                    var aliasItem = alias[i];
                    if (aliasItem && aliasItem !== name) {
                        var mod = createModule(aliasItem);
                        var normalAlias = mod.getAlias();
                        if (normalAlias) {
                            ret.push.apply(ret, normalAlias);
                        } else {
                            ret.push(aliasItem);
                        }
                    }
                }
            }
            self.normalizedAlias = ret;
            return ret;
        },

        getNormalizedModules: function () {
            var self = this;
            if (self.normalizedModules) {
                return self.normalizedModules;
            }
            self.normalizedModules = Utils.map(self.getAlias(), function (alias) {
                return createModule(alias);
            });
            return self.normalizedModules;
        },

        /**
         * Get the path url of current module if load dynamically
         * @return {String}
         */
        getUrl: function () {
            var self = this;
            if (!self.url) {
                self.url = Utils.normalizeSlash(S.Config.resolveModFn(self));
            }
            return self.url;
        },

        /**
         * Get the package which current module belongs to.
         * @return {KISSY.Loader.Package}
         */
        getPackage: function () {
            var self = this;
            if (!('packageInfo' in self)) {
                var name = self.name;
                // absolute path
                if (startsWith(name, '/') ||
                    startsWith(name, 'http://') ||
                    startsWith(name, 'https://') ||
                    startsWith(name, 'file://')) {
                    self.packageInfo = null;
                    return;
                }
                var packages = Config.packages,
                    modNameSlash = self.name + '/',
                    pName = '',
                    p;
                for (p in packages) {
                    if (startsWith(modNameSlash, p + '/') && p.length > pName.length) {
                        pName = p;
                    }
                }
                self.packageInfo = packages[pName] || packages.core;
            }
            return self.packageInfo;
        },

        /**
         * Get the tag of current module.
         * tag can not contain ".", eg: Math.random() !
         * @return {String}
         */
        getTag: function () {
            var self = this;
            return self.tag || self.getPackage() && self.getPackage().getTag();
        },

        /**
         * Get the charset of current module
         * @return {String}
         */
        getCharset: function () {
            var self = this;
            return self.charset || self.getPackage() && self.getPackage().getCharset();
        },

        setRequiresModules: function (requires) {
            var self = this;
            var requiredModules = self.requiredModules = Utils.map(normalizeRequires(requires, self), function (m) {
                return createModule(m);
            });
            var normalizedRequiredModules = [];
            Utils.each(requiredModules, function (mod) {
                normalizedRequiredModules.push.apply(normalizedRequiredModules, mod.getNormalizedModules());
            });
            self.normalizedRequiredModules = normalizedRequiredModules;
        },

        getNormalizedRequiredModules: function () {
            var self = this;
            if (self.normalizedRequiredModules) {
                return self.normalizedRequiredModules;
            }
            self.setRequiresModules(self.requires);
            return self.normalizedRequiredModules;
        },

        getRequiredModules: function () {
            var self = this;
            if (self.requiredModules) {
                return self.requiredModules;
            }
            self.setRequiresModules(self.requires);
            return self.requiredModules;
        },

        attachSelf: function () {
            var self = this,
                status = self.status,
                factory = self.factory,
                exports;

            if (status === Status.ATTACHED || status < Status.LOADED) {
                return true;
            }

            if (typeof factory === 'function') {
                self.exports = {};
                // compatible and efficiency
                // KISSY.add(function(S,undefined){})
                // 需要解开 index，相对路径
                // 但是需要保留 alias，防止值不对应
                //noinspection JSUnresolvedFunction
                exports = factory.apply(self,
                    // KISSY.add(function(S){module.require}) lazy initialize
                    (
                        self.cjs ?
                            [S, self._require, self.exports, self] :
                            [S].concat(Utils.map(self.getRequiredModules(), function (m) {
                                return m.getExports();
                            }))
                        )
                );
                if (exports !== undefined) {
                    // noinspection JSUndefinedPropertyAssignment
                    self.exports = exports;
                }
            } else {
                //noinspection JSUndefinedPropertyAssignment
                self.exports = factory;
            }

            self.status = ATTACHED;
            if (self.afterAttach) {
                self.afterAttach(self.exports);
            }
        },

        attachRecursive: function () {
            var self = this,
                status;
            status = self.status;
            // attached or circular dependency
            if (status >= ATTACHING || status < Status.LOADED) {
                return self;
            }
            self.status = ATTACHING;
            if (self.cjs) {
                // commonjs format will call require in module code again
                self.attachSelf();
            } else {
                Utils.each(self.getNormalizedRequiredModules(), function (m) {
                    m.attachRecursive();
                });
                self.attachSelf();
            }
            return self;
        },

        undef: function () {
            this.status = Status.INIT;
            delete this.factory;
            delete this.exports;
        }
    };

    function pluginAlias(name) {
        var index = name.indexOf('!');
        if (index !== -1) {
            var pluginName = name.substring(0, index);
            name = name.substring(index + 1);
            var Plugin = createModule(pluginName).attachRecursive().exports || {};
            if (Plugin.alias) {
                name = Plugin.alias(S, name, pluginName);
            }
        }
        return name;
    }

    function normalizeRequires(requires, self) {
        requires = requires || [];
        var l = requires.length;
        for (var i = 0; i < l; i++) {
            requires[i] = self.resolve(requires[i]).name;
        }
        return requires;
    }

    function getShallowAlias(mod) {
        var name = mod.name,
            packageInfo,
            alias = mod.alias;
        if (typeof alias === 'string') {
            mod.alias = alias = [alias];
        }
        if (alias) {
            return alias;
        }
        packageInfo = mod.getPackage();
        if (packageInfo && packageInfo.alias) {
            alias = packageInfo.alias(name);
        }
        alias = mod.alias = alias || [
            pluginAlias(name)
        ];
        return alias;
    }

    Loader.Module = Module;
})(KISSY);
/**
 * @ignore
 * script/css load across browser
 * @author yiminghe@gmail.com
 */
(function (S) {
    // --no-module-wrap--
    var   logger = S.getLogger('s/loader/getScript');

    var CSS_POLL_INTERVAL = 30,
        Utils = S.Loader.Utils,
    // central poll for link node
        timer = 0,
    // node.id:{callback:callback,node:node}
        monitors = {};

    function startCssTimer() {
        if (!timer) {
            logger.debug('start css poll timer');
            cssPoll();
        }
    }

    function isCssLoaded(node, url) {
        var loaded = 0;
        if (Utils.webkit) {
            // http://www.w3.org/TR/Dom-Level-2-Style/stylesheets.html
            if (node.sheet) {
                logger.debug('webkit css poll loaded: ' + url);
                loaded = 1;
            }
        } else if (node.sheet) {
            try {
                var cssRules = node.sheet.cssRules;
                if (cssRules) {
                    logger.debug('same domain css poll loaded: ' + url);
                    loaded = 1;
                }
            } catch (ex) {
                var exName = ex.name;
                logger.debug('css poll exception: ' + exName + ' ' + ex.code + ' ' + url);
                // http://www.w3.org/TR/dom/#dom-domexception-code
                if (// exName == 'SecurityError' ||
                // for old firefox
                    exName === 'NS_ERROR_DOM_SECURITY_ERR') {
                    logger.debug('css poll exception: ' + exName + 'loaded : ' + url);
                    loaded = 1;
                }
            }
        }
        return loaded;
    }

    // single thread is ok
    function cssPoll() {
        for (var url in monitors) {
            var callbackObj = monitors[url],
                node = callbackObj.node;
            if (isCssLoaded(node, url)) {
                if (callbackObj.callback) {
                    callbackObj.callback.call(node);
                }
                delete monitors[url];
            }
        }

        if (Utils.isEmptyObject(monitors)) {
            logger.debug('clear css poll timer');
            timer = 0;
        } else {
            timer = setTimeout(cssPoll, CSS_POLL_INTERVAL);
        }
    }

    // refer : http://lifesinger.org/lab/2011/load-js-css/css-preload.html
    // 暂时不考虑如何判断失败，如 404 等
    Utils.pollCss = function (node, callback) {
        var href = node.href,
            arr;
        arr = monitors[href] = {};
        arr.node = node;
        arr.callback = callback;
        startCssTimer();
    };

    Utils.isCssLoaded = isCssLoaded;
})(KISSY);
/*
 References:
 - http://unixpapa.com/js/dyna.html
 - http://www.blaze.io/technical/ies-premature-execution-problem/

 `onload` event is supported in WebKit since 535.23
 - https://bugs.webkit.org/show_activity.cgi?id=38995
 `onload/onerror` event is supported since Firefox 9.0
 - https://bugzilla.mozilla.org/show_bug.cgi?id=185236
 - https://developer.mozilla.org/en/HTML/Element/link#Stylesheet_load_events

 monitor css onload across browsers.issue about 404 failure.
 - firefox not ok（4 is wrong）：
 - http://yearofmoo.com/2011/03/cross-browser-stylesheet-preloading/
 - all is ok
 - http://lifesinger.org/lab/2011/load-js-css/css-preload.html
 - others
 - http://www.zachleat.com/web/load-css-dynamically/
 *//**
 * @ignore
 * getScript support for css and js callback after load
 * @author yiminghe@gmail.com
 */
(function (S) {
    // --no-module-wrap--
    var MILLISECONDS_OF_SECOND = 1000,
        win = S.Env.host,
        doc = win.document,
        Utils = S.Loader.Utils,
    // solve concurrent requesting same script file
        jsCssCallbacks = {},
        webkit = Utils.webkit,
        headNode;

    /**
     * Load a javascript/css file from the server using a GET HTTP request,
     * then execute it.
     *
     * for example:
     *      @example
     *      getScript(url, success, charset);
     *      // or
     *      getScript(url, {
     *          charset: string
     *          success: fn,
     *          error: fn,
     *          timeout: number
     *      });
     *
     * Note 404/500 status in ie<9 will trigger success callback.
     * If you want a jsonp operation, please use {@link KISSY.IO} instead.
     *
     * @param {String} url resource's url
     * @param {Function|Object} [success] success callback or config
     * @param {Function} [success.success] success callback
     * @param {Function} [success.error] error callback
     * @param {Number} [success.timeout] timeout (s)
     * @param {String} [success.charset] charset of current resource
     * @param {String} [charset] charset of current resource
     * @return {HTMLElement} script/style node
     * @member KISSY
     */
    S.getScript = function (url, success, charset) {
        // can not use KISSY.Uri, url can not be encoded for some url
        // eg: /??dom.js,event.js , ? , should not be encoded
        var config = success,
            css = Utils.endsWith(url, '.css'),
            error, timeout, attrs, callbacks, timer;

        if (typeof config === 'object') {
            success = config.success;
            error = config.error;
            timeout = config.timeout;
            charset = config.charset;
            attrs = config.attrs;
        }

        if (css && Utils.ieMode < 10) {
            if (doc.getElementsByTagName('style').length + doc.getElementsByTagName('link').length >= 31) {
                if (win.console) {
                    win.console.error('style and link\'s number is more than 31.' +
                        'ie < 10 can not insert link: ' + url);
                }
                if (error) {
                    error();
                }
                return;
            }
        }

        callbacks = jsCssCallbacks[url] = jsCssCallbacks[url] || [];

        callbacks.push([success, error]);

        if (callbacks.length > 1) {
            return callbacks.node;
        }

        var node = doc.createElement(css ? 'link' : 'script'),
            clearTimer = function () {
                if (timer) {
                    clearTimeout(timer);
                    timer = undefined;
                }
            };

        if (attrs) {
            Utils.each(attrs, function (v, n) {
                node.setAttribute(n, v);
            });
        }

        if (charset) {
            node.charset = charset;
        }

        if (css) {
            node.href = url;
            node.rel = 'stylesheet';
            // set media to something non-matching to ensure it'll fetch without blocking render
            // can not pass test
            //node.media = 'async';
        } else {
            node.src = url;
            node.async = true;
        }

        callbacks.node = node;

        var end = function (error) {
            var index = error,
                fn;
            clearTimer();
            Utils.each(jsCssCallbacks[url], function (callback) {
                if ((fn = callback[index])) {
                    fn.call(node);
                }
            });
            delete jsCssCallbacks[url];
        };

        var useNative = 'onload' in node;
        // onload for webkit 535.23  Firefox 9.0
        // https://bugs.webkit.org/show_activity.cgi?id=38995
        // https://bugzilla.mozilla.org/show_bug.cgi?id=185236
        // https://developer.mozilla.org/en/HTML/Element/link#Stylesheet_load_events
        // phantomjs 1.7 == webkit 534.34
        var forceCssPoll = S.Config.forceCssPoll ||
            (webkit && webkit < 536) ||
            // unknown browser defaults to css poll
            // https://github.com/kissyteam/kissy/issues/607
            (!webkit && !Utils.trident && !Utils.gecko);

        if (css && forceCssPoll && useNative) {
            useNative = false;
        }

        function onload() {
            var readyState = node.readyState;
            if (!readyState ||
                readyState === 'loaded' ||
                readyState === 'complete') {
                node.onreadystatechange = node.onload = null;
                end(0);
            }
        }

        //标准浏览器 css and all script
        if (useNative) {
            node.onload = onload;
            node.onerror = function () {
                node.onerror = null;
                end(1);
            };
        } else if (css) {
            // old chrome/firefox for css
            Utils.pollCss(node, function () {
                end(0);
            });
        } else {
            node.onreadystatechange = onload;
        }

        if (timeout) {
            timer = setTimeout(function () {
                end(1);
            }, timeout * MILLISECONDS_OF_SECOND);
        }
        if (!headNode) {
            headNode = Utils.docHead();
        }
        if (css) {
            // css order matters
            // so can not use css in head
            headNode.appendChild(node);
        } else {
            // can use js in head
            headNode.insertBefore(node, headNode.firstChild);
        }
        return node;
    };
})(KISSY);
/*
 yiminghe@gmail.com refactor@2012-03-29
 - 考虑连续重复请求单个 script 的情况，内部排队

 yiminghe@gmail.com 2012-03-13
 - getScript
 - 404 in ie<9 trigger success , others trigger error
 - syntax error in all trigger success
 */
/**
 * @ignore
 * Declare config info for KISSY.
 * @author yiminghe@gmail.com
 */
(function (S) {
    // --no-module-wrap--
    var Loader = S.Loader,
        Package = Loader.Package,
        Utils = Loader.Utils,
        host = S.Env.host,
        Config = S.Config,
        location = host.location,
        configFns = Config.fns;

    // how to load mods by path
    Config.loadModsFn = function (rs, config) {
        S.getScript(rs.url, config);
    };

    // how to get mod url
    Config.resolveModFn = function (mod) {
        var name = mod.name,
            filter, t, url,
        // deprecated! do not use path config
            subPath = mod.path;
        var packageInfo = mod.getPackage();

        if (!packageInfo) {
            return name;
        }

        var packageBase = packageInfo.getBase();
        var packageName = packageInfo.name;
        var extname = mod.getType();
        var suffix = '.' + extname;

        if (!subPath) {
            // special for css module
            name = name.replace(/\.css$/, '');
            filter = packageInfo.getFilter() || '';

            if (typeof filter === 'function') {
                subPath = filter(name, extname);
            } else if (typeof filter === 'string') {
                if (filter) {
                    filter = '-' + filter;
                }
                subPath = name + filter + suffix;
            }
        }

        // core package
        if (packageName === 'core') {
            url = packageBase + subPath;
        } else if (name === packageName) {
            // packageName: a/y use('a/y');
            // do not use this on production, can not be combo ed with other modules from same package
            url = packageBase.substring(0, packageBase.length - 1) + filter + suffix;
        } else {
            subPath = subPath.substring(packageName.length + 1);
            url = packageBase + subPath;
        }

        if ((t = mod.getTag())) {
            t += suffix;
            url += '?t=' + t;
        }
        return url;
    };

    configFns.requires = shortcut('requires');

    configFns.alias = shortcut('alias');

    configFns.packages = function (config) {
        var Config = this.Config,
            packages = Config.packages;
        if (config) {
            Utils.each(config, function (cfg, key) {
                // object type
                var name = cfg.name = cfg.name || key;
                var base = cfg.base || cfg.path;
                if (base) {
                    cfg.base = normalizePath(base, true);
                }
                if (packages[name]) {
                    packages[name].reset(cfg);
                } else {
                    packages[name] = new Package(cfg);
                }
            });
            return undefined;
        } else if (config === false) {
            Config.packages = {
                core: packages.core
            };
            return undefined;
        } else {
            return packages;
        }
    };

    configFns.modules = function (modules) {
        if (modules) {
            Utils.each(modules, function (modCfg, modName) {
                var url = modCfg.url;
                if (url) {
                    modCfg.url = normalizePath(url);
                }
                var mod = Utils.createModule(modName, modCfg);
                // #485, invalid after add
                if (mod.status === Loader.Status.INIT) {
                    Utils.mix(mod, modCfg);
                }
            });
        }
    };

    configFns.base = function (base) {
        var self = this,
            corePackage = Config.packages.core;

        if (!base) {
            return corePackage && corePackage.getBase();
        }

        self.config('packages', {
            core: {
                base: base
            }
        });

        return undefined;
    };

    function shortcut(attr) {
        return function (config) {
            var newCfg = {};
            for (var name in config) {
                newCfg[name] = {};
                newCfg[name][attr] = config[name];
            }
            S.config('modules', newCfg);
        };
    }

    function normalizePath(base, isDirectory) {
        base = Utils.normalizeSlash(base);
        if (isDirectory && base.charAt(base.length - 1) !== '/') {
            base += '/';
        }
        if (location) {
            if (Utils.startsWith(base, 'http:') ||
                Utils.startsWith(base, 'https:') ||
                Utils.startsWith(base, 'file:')) {
                return base;
            }
            base = location.protocol + '//' + location.host + Utils.normalizePath(location.pathname, base);
        }
        return base;
    }
})(KISSY);
/**
 * combo loader for KISSY. using combo to load module files.
 * @ignore
 * @author yiminghe@gmail.com
 */
(function (S, undefined) {
    // --no-module-wrap--
    var logger = S.getLogger('s/loader');

    var Loader = S.Loader,
        Config = S.Config,
        Status = Loader.Status,
        Utils = Loader.Utils,
        addModule = Utils.addModule,
        each = Utils.each,
        getHash = Utils.getHash,
        LOADING = Status.LOADING,
        LOADED = Status.LOADED,
        ERROR = Status.ERROR,
        oldIE = Utils.ieMode && Utils.ieMode < 10;

    function loadScripts(rss, callback, timeout) {
        var count = rss && rss.length,
            errorList = [],
            successList = [];

        function complete() {
            if (!(--count)) {
                callback(successList, errorList);
            }
        }

        each(rss, function (rs) {
            var mod;
            var config = {
                timeout: timeout,
                success: function () {
                    successList.push(rs);
                    if (mod && currentMod) {
                        // standard browser(except ie9) fire load after KISSY.add immediately
                        logger.debug('standard browser get mod name after load: ' + mod.name);
                        addModule(mod.name, currentMod.factory, currentMod.config);
                        currentMod = undefined;
                    }
                    complete();
                },
                error: function () {
                    errorList.push(rs);
                    complete();
                },
                charset: rs.charset
            };
            if (!rs.combine) {
                mod = rs.mods[0];
                if (mod.getType() === 'css') {
                    mod = undefined;
                } else if (oldIE) {
                    startLoadModName = mod.name;
                    if ('@DEBUG@') {
                        startLoadModTime = +new Date();
                    }
                    config.attrs = {
                        'data-mod-name': mod.name
                    };
                }
            }
            Config.loadModsFn(rs, config);
        });
    }

    var loaderId = 0;

    /**
     * @class KISSY.Loader.ComboLoader
     * using combo to load module files
     * @param callback
     * @private
     */
    function ComboLoader(callback) {
        this.callback = callback;
        this.head = this.tail = undefined;
        this.id = 'loader' + (++loaderId);
    }

    var currentMod;
    var startLoadModName;
    var startLoadModTime;

    function checkKISSYRequire(config, factory) {
        // use require primitive statement
        // function(S, require){ require('node') }
        if (!config && typeof factory === 'function' && factory.length > 1) {
            var requires = Utils.getRequiresFromFn(factory);
            if (requires.length) {
                config = config || {};
                config.requires = requires;
            }
        } else {
            // KISSY.add(function(){},{requires:[]})
            if (config && config.requires && !config.cjs) {
                config.cjs = 0;
            }
        }
        return config;
    }

    ComboLoader.add = function (name, factory, config, argsLen) {
        // KISSY.add('xx',[],function(){});
        if (argsLen === 3 && Utils.isArray(factory)) {
            var tmp = factory;
            factory = config;
            config = {
                requires: tmp,
                cjs: 1
            };
        }
        // KISSY.add(function(){}), KISSY.add('a'), KISSY.add(function(){},{requires:[]})
        if (typeof name === 'function' || argsLen === 1) {
            config = factory;
            factory = name;
            config = checkKISSYRequire(config, factory);
            if (oldIE) {
                // http://groups.google.com/group/commonjs/browse_thread/thread/5a3358ece35e688e/43145ceccfb1dc02#43145ceccfb1dc02
                name = findModuleNameByInteractive();
                // S.log('oldIE get modName by interactive: ' + name);
                addModule(name, factory, config);
                startLoadModName = null;
                startLoadModTime = 0;
            } else {
                // standard browser associates name with definition when onload
                currentMod = {
                    factory: factory,
                    config: config
                };
            }
        } else {
            // KISSY.add('x',function(){},{requires:[]})
            if (oldIE) {
                startLoadModName = null;
                startLoadModTime = 0;
            } else {
                currentMod = undefined;
            }
            config = checkKISSYRequire(config, factory);
            addModule(name, factory, config);
        }
    };

    function findModuleNameByInteractive() {
        var scripts = document.getElementsByTagName('script'),
            re, i, name, script;

        for (i = scripts.length - 1; i >= 0; i--) {
            script = scripts[i];
            if (script.readyState === 'interactive') {
                re = script;
                break;
            }
        }

        if (re) {
            name = re.getAttribute('data-mod-name');
        } else {
            // sometimes when read module file from cache,
            // interactive status is not triggered
            // module code is executed right after inserting into dom
            // i has to preserve module name before insert module script into dom,
            // then get it back here
            logger.debug('can not find interactive script,time diff : ' + (+new Date() - startLoadModTime));
            logger.debug('old_ie get mod name from cache : ' + startLoadModName);
            name = startLoadModName;
        }
        return name;
    }

    var debugRemoteModules;

    if ('@DEBUG@') {
        debugRemoteModules = function (rss) {
            each(rss, function (rs) {
                var ms = [];
                each(rs.mods, function (m) {
                    if (m.status === LOADED) {
                        ms.push(m.name);
                    }
                });
                if (ms.length) {
                    logger.info('load remote modules: "' + ms.join(', ') + '" from: "' + rs.url + '"');
                }
            });
        };
    }

    function getCommonPathPrefix(str1, str2) {
        // ie bug
        // 'a//b'.split(/\//) => [a,b]
        var protocolIndex = str1.indexOf('//');
        var prefix = '';
        if (protocolIndex !== -1) {
            prefix = str1.substring(0, str1.indexOf('//') + 2);
        }
        str1 = str1.substring(prefix.length).split(/\//);
        str2 = str2.substring(prefix.length).split(/\//);
        var l = Math.min(str1.length, str2.length);
        for (var i = 0; i < l; i++) {
            if (str1[i] !== str2[i]) {
                break;
            }
        }
        return prefix + str1.slice(0, i).join('/') + '/';
    }

    // ??editor/plugin/x,editor/plugin/b
    // =>
    // editor/plugin/??x,b
    function getUrlConsiderCommonPrefix(commonPrefix, currentComboUrls, basePrefix, comboPrefix, comboSep, suffix) {
        if (commonPrefix && currentComboUrls.length > 1) {
            var commonPrefixLen = commonPrefix.length;
            var currentUrls = [];
            for (var i = 0; i < currentComboUrls.length; i++) {
                currentUrls[i] = currentComboUrls[i].substring(commonPrefixLen);
            }
            return basePrefix + commonPrefix + comboPrefix + currentUrls.join(comboSep) + suffix;
        } else {
            return basePrefix + comboPrefix + currentComboUrls.join(comboSep) + suffix;
        }
    }

    Utils.mix(ComboLoader.prototype, {
        /**
         * load modules asynchronously
         */
        use: function (allMods) {
            var self = this,
                comboUrls,
                timeout = Config.timeout;

            comboUrls = self.getComboUrls(allMods);

            // load css first to avoid page blink
            if (comboUrls.css) {
                loadScripts(comboUrls.css, function (success, error) {
                    if ('@DEBUG@') {
                        debugRemoteModules(success);
                    }

                    each(success, function (one) {
                        each(one.mods, function (mod) {
                            addModule(mod.name, Utils.noop);
                            // notify all loader instance
                            mod.flush();
                        });
                    });

                    each(error, function (one) {
                        each(one.mods, function (mod) {
                            var msg = mod.name + ' is not loaded! can not find module in url: ' + one.url;
                            S.log(msg, 'error');
                            mod.status = ERROR;
                            // notify all loader instance
                            mod.flush();
                        });
                    });
                }, timeout);
            }

            // jss css download in parallel
            if (comboUrls.js) {
                loadScripts(comboUrls.js, function (success) {
                    if ('@DEBUG@') {
                        debugRemoteModules(success);
                    }

                    each(comboUrls.js, function (one) {
                        each(one.mods, function (mod) {
                            // fix #111
                            // https://github.com/kissyteam/kissy/issues/111
                            if (!mod.factory) {
                                var msg = mod.name +
                                    ' is not loaded! can not find module in url: ' +
                                    one.url;
                                S.log(msg, 'error');
                                mod.status = ERROR;
                            }
                            // notify all loader instance
                            mod.flush();
                        });
                    });
                }, timeout);
            }
        },

        /**
         * calculate dependency
         */
        calculate: function (unloadedMods, errorList, stack, cache, ret) {
            var i, m, mod, modStatus,
                stackDepth,
                self = this;

            if ('@DEBUG@') {
                stack = stack || [];
            }
            ret = ret || [];
            // 提高性能，不用每个模块都再次全部依赖计算
            // 做个缓存，每个模块对应的待动态加载模块
            cache = cache || {};

            for (i = 0; i < unloadedMods.length; i++) {
                mod = unloadedMods[i];
                m = mod.name;

                if (cache[m]) {
                    continue;
                }

                if ('@DEBUG@') {
                    stackDepth = stack.length;
                }

                modStatus = mod.status;
                if (modStatus === ERROR) {
                    errorList.push(mod);
                    cache[m] = 1;
                    continue;
                }
                if (modStatus > LOADED) {
                    cache[m] = 1;
                    continue;
                } else if (modStatus !== LOADED && !mod.contains(self)) {
                    if (modStatus !== LOADING) {
                        mod.status = LOADING;
                        ret.push(mod);
                    }
                    mod.add(self);
                    self.wait(mod);
                }

                if ('@DEBUG@') {
                    // do not use indexOf, poor performance in ie8
                    if (stack[m]) {
                        S.log('find cyclic dependency between mods: ' + stack, 'warn');
                        cache[m] = 1;
                        continue;
                    } else {
                        stack[m] = 1;
                        stack.push(m);
                    }
                }

                self.calculate(mod.getNormalizedRequiredModules(), errorList, stack, cache, ret);
                cache[m] = 1;
                if ('@DEBUG@') {
                    for (var si = stackDepth; si < stack.length; si++) {
                        stack[stack[si]] = 0;
                    }
                    stack.length = stackDepth;
                }
            }

            return ret;
        },

        /**
         * get combo mods for modNames
         */
        getComboMods: function (mods) {
            var i, l = mods.length,
                tmpMods, mod, packageInfo, type,
                tag, charset, packageBase,
                packageName, group, modUrl;
            var groups = {
                /*
                 js: {
                 'groupA-gbk':{
                 'http://x.com':[m1,m2]
                 }
                 }
                 */
            };
            var normals = {
                /*
                 js:{
                 'http://x.com':[m1,m2]
                 }
                 */
            };
            for (i = 0; i < l; ++i) {
                mod = mods[i];
                type = mod.getType();
                modUrl = mod.getUrl();
                packageInfo = mod.getPackage();

                if (packageInfo) {
                    packageBase = packageInfo.getBase();
                    packageName = packageInfo.name;
                    charset = packageInfo.getCharset();
                    tag = packageInfo.getTag();
                    group = packageInfo.getGroup();
                } else {
                    packageBase = mod.name;
                }

                if (packageInfo && packageInfo.isCombine() && group) {
                    var typeGroups = groups[type] || (groups[type] = {});
                    group = group + '-' + charset;
                    var typeGroup = typeGroups[group] || (typeGroups[group] = {});
                    var find = 0;
                    /*jshint loopfunc:true*/
                    Utils.each(typeGroup, function (tmpMods, prefix) {
                        if (Utils.isSameOriginAs(prefix, packageBase)) {
                            var newPrefix = getCommonPathPrefix(prefix, packageBase);
                            tmpMods.push(mod);
                            if (tag && tag !== tmpMods.tag) {
                                tmpMods.tag = getHash(tmpMods.tag + tag);
                            }
                            delete typeGroup[prefix];
                            typeGroup[newPrefix] = tmpMods;
                            find = 1;
                        }
                    });
                    if (!find) {
                        tmpMods = typeGroup[packageBase] = [mod];
                        tmpMods.charset = charset;
                        tmpMods.tag = tag || '';
                    }
                } else {
                    var normalTypes = normals[type] || (normals[type] = {});
                    if (!(tmpMods = normalTypes[packageBase])) {
                        tmpMods = normalTypes[packageBase] = [];
                        tmpMods.charset = charset;
                        tmpMods.tag = tag || '';
                    } else {
                        if (tag && tag !== tmpMods.tag) {
                            tmpMods.tag = getHash(tmpMods.tag + tag);
                        }
                    }
                    tmpMods.push(mod);
                }
            }

            return {
                groups: groups,
                normals: normals
            };
        },

        /**
         * Get combo urls
         */
        getComboUrls: function (mods) {
            var comboPrefix = Config.comboPrefix,
                comboSep = Config.comboSep,
                comboRes = {},
                maxFileNum = Config.comboMaxFileNum,
                maxUrlLength = Config.comboMaxUrlLength;

            var comboMods = this.getComboMods(mods);

            function processSamePrefixUrlMods(type, basePrefix, sendMods) {
                var currentComboUrls = [];
                var currentComboMods = [];
                var tag = sendMods.tag;
                var charset = sendMods.charset;
                var suffix = (tag ? '?t=' + encodeURIComponent(tag) + '.' + type : '');

                var baseLen = basePrefix.length,
                    commonPrefix,
                    res = [];

                /*jshint loopfunc:true*/
                function pushComboUrl(sentUrl) {
                    //noinspection JSReferencingMutableVariableFromClosure
                    res.push({
                        combine: 1,
                        url: sentUrl,
                        charset: charset,
                        mods: currentComboMods
                    });
                }

                function getSentUrl() {
                    return getUrlConsiderCommonPrefix(commonPrefix, currentComboUrls,
                        basePrefix, comboPrefix, comboSep, suffix);
                }

                for (var i = 0; i < sendMods.length; i++) {
                    var currentMod = sendMods[i];
                    var url = currentMod.getUrl();
                    if (!currentMod.getPackage() || !currentMod.getPackage().isCombine() ||
                        // use(x/y) packageName: x/y ...
                        !Utils.startsWith(url, basePrefix)) {
                        res.push({
                            combine: 0,
                            url: url,
                            charset: charset,
                            mods: [currentMod]
                        });
                        continue;
                    }

                    // ignore query parameter
                    var subPath = url.slice(baseLen).replace(/\?.*$/, '');
                    currentComboUrls.push(subPath);
                    currentComboMods.push(currentMod);

                    if (commonPrefix === undefined) {
                        commonPrefix = subPath.indexOf('/') !== -1 ? subPath : '';
                    } else if (commonPrefix !== '') {
                        commonPrefix = getCommonPathPrefix(commonPrefix, subPath);
                        if (commonPrefix === '/') {
                            commonPrefix = '';
                        }
                    }

                    if (currentComboUrls.length > maxFileNum || getSentUrl().length > maxUrlLength) {
                        currentComboUrls.pop();
                        currentComboMods.pop();
                        pushComboUrl(getSentUrl());
                        currentComboUrls = [];
                        currentComboMods = [];
                        commonPrefix = undefined;
                        i--;
                    }
                }
                if (currentComboUrls.length) {
                    pushComboUrl(getSentUrl());
                }

                comboRes[type].push.apply(comboRes[type], res);
            }

            var type, prefix;
            var normals = comboMods.normals;
            var groups = comboMods.groups;
            var group;

            // generate combo urls
            for (type in normals) {
                comboRes[type] = comboRes[type] || [];
                for (prefix in normals[type]) {
                    processSamePrefixUrlMods(type, prefix, normals[type][prefix]);
                }
            }
            for (type in groups) {
                comboRes[type] = comboRes[type] || [];
                for (group in groups[type]) {
                    for (prefix in groups[type][group]) {
                        processSamePrefixUrlMods(type, prefix, groups[type][group][prefix]);
                    }
                }
            }
            return comboRes;
        },

        flush: function () {
            if (!this.callback) {
                return;
            }
            var self = this,
                head = self.head,
                callback = self.callback;
            while (head) {
                var node = head.node,
                    status = node.status;
                if (status >= LOADED || status === ERROR) {
                    node.remove(self);
                    head = self.head = head.next;
                } else {
                    return;
                }
            }
            self.callback = null;
            callback();
        },

        isCompleteLoading: function () {
            return !this.head;
        },

        wait: function (mod) {
            var self = this;
            if (!self.head) {
                self.tail = self.head = {
                    node: mod
                };
            } else {
                var newNode = {
                    node: mod
                };
                self.tail.next = newNode;
                self.tail = newNode;
            }
        }
    });

    Loader.ComboLoader = ComboLoader;
})(KISSY);
/*
 2014-03-24 yiminghe@gmail.com
 - refactor group combo logic

 2014-01-14 yiminghe@gmail.com
 - support System.ondemand from es6

 2013-09-11 yiminghe@gmail.com
 - unify simple loader and combo loader

 2013-07-25 阿古, yiminghe@gmail.com
 - support group combo for packages

 2013-06-04 yiminghe@gmail.com
 - refactor merge combo loader and simple loader
 - support error callback

 2012-02-20 yiminghe@gmail.com
 - three status
 0: initialized
 LOADED: load into page
 ATTACHED: factory executed
 *//**
 * @ignore
 * mix loader into KISSY and infer KISSY baseUrl if not set
 * @author yiminghe@gmail.com
 */
(function (S) {
    // --no-module-wrap--
    var Loader = S.Loader,
        Utils = Loader.Utils,
        createModule = Utils.createModule,
        ComboLoader = Loader.ComboLoader;
    var logger = S.getLogger('s/loader');

    Utils.mix(S, {
        // internal usage
        getModule: function (modName) {
            return createModule(modName);
        },

        // internal usage
        getPackage: function (packageName) {
            return S.Config.packages[packageName];
        },

        /**
         * Registers a module with the KISSY global.
         * @param {String} name module name.
         * it must be set if combine is true in {@link KISSY#config}
         * @param {Function} factory module definition function that is used to return
         * exports of this module
         * @param {KISSY} factory.S KISSY global instance
         * @param {Object} [cfg] module optional config data
         * @param {String[]} cfg.requires this module's required module name list
         * @member KISSY
         *
         *
         *      // dom module's definition
         *      KISSY.add('dom', function(S, xx){
         *          return {css: function(el, name, val){}};
         *      },{
         *          requires:['xx']
         *      });
         */
        add: function (name, factory, cfg) {
            ComboLoader.add(name, factory, cfg, arguments.length);
        },
        /**
         * Attached one or more modules to global KISSY instance.
         * @param {String|String[]} modNames moduleNames. 1-n modules to bind(use comma to separate)
         * @param {Function} success callback function executed
         * when KISSY has the required functionality.
         * @param {KISSY} success.S KISSY instance
         * @param success.x... modules exports
         * @member KISSY
         *
         *
         *      // loads and attached overlay,dd and its dependencies
         *      KISSY.use('overlay,dd', function(S, Overlay){});
         */
        use: function (modNames, success) {
            var loader,
                error,
                tryCount = 0;

            if (typeof modNames === 'string') {
                S.log('KISSY.use\'s first argument should be Array, but now: ' + modNames, 'warning');
                modNames = modNames.replace(/\s+/g, '').split(',');
            }

            if (typeof success === 'object') {
                //noinspection JSUnresolvedVariable
                error = success.error;
                //noinspection JSUnresolvedVariable
                success = success.success;
            }

            var mods = Utils.createModules(modNames);

            var unloadedMods = [];

            Utils.each(mods, function (mod) {
                unloadedMods.push.apply(unloadedMods, mod.getNormalizedModules());
            });

            var normalizedMods = unloadedMods;

            function loadReady() {
                ++tryCount;
                var errorList = [],
                    start;

                if ('@DEBUG@') {
                    start = +new Date();
                }

                unloadedMods = loader.calculate(unloadedMods, errorList);
                var unloadModsLen = unloadedMods.length;
                logger.debug(tryCount + ' check duration ' + (+new Date() - start));
                if (errorList.length) {
                    S.log(errorList, 'error');
                    S.log('loader: load above modules error', 'error');
                    if (error) {
                        if ('@DEBUG@') {
                            error.apply(S, errorList);
                        } else {
                            try {
                                error.apply(S, errorList);
                            } catch (e) {
                                /*jshint loopfunc:true*/
                                setTimeout(function () {
                                    throw e;
                                }, 0);
                            }
                        }
                    }
                } else if (loader.isCompleteLoading()) {
                    Utils.attachModules(normalizedMods);
                    if (success) {
                        if ('@DEBUG@') {
                            success.apply(S, [S].concat(Utils.getModulesExports(mods)));
                        } else {
                            try {
                                success.apply(S, [S].concat(Utils.getModulesExports(mods)));
                            } catch (e) {
                                /*jshint loopfunc:true*/
                                setTimeout(function () {
                                    throw e;
                                }, 0);
                            }
                        }
                    }
                } else {
                    // in case all of its required mods is loading by other loaders
                    loader.callback = loadReady;
                    if (unloadModsLen) {
                        logger.debug(tryCount + ' reload ');
                        loader.use(unloadedMods);
                    }
                }
            }

            loader = new ComboLoader(loadReady);

            // in case modules is loaded statically
            // synchronous check
            // but always async for loader
            loadReady();
            return S;
        },

        /**
         * get module exports from KISSY module cache
         * @param {String} moduleName module name
         * @member KISSY
         * @return {*} exports of specified module
         */
        require: function (moduleName) {
            var requiresModule = createModule(moduleName);
            return requiresModule.getExports();
        },

        /**
         * undefine a module
         * @param {String} moduleName module name
         * @member KISSY
         */
        undef: function (moduleName) {
            var requiresModule = createModule(moduleName);
            var mods = requiresModule.getNormalizedModules();
            Utils.each(mods, function (m) {
                m.undef();
            });
        }
    });
})(KISSY);

/*
 2013-06-04 yiminghe@gmail.com
 - refactor merge combo loader and simple loader
 - support error callback
 *//**
 * @ignore
 * i18n plugin for kissy loader
 * @author yiminghe@gmail.com
 */
KISSY.add('i18n', {
    alias: function (S, name) {
        return name + '/i18n/' + S.Config.lang;
    }
});/**
 * @ignore
 * init loader, set config
 * @author yiminghe@gmail.com
 */
(function (S) {
    // --no-module-wrap--
    var doc = S.Env.host && S.Env.host.document;
    // var logger = S.getLogger('s/loader');
    var Utils = S.Loader.Utils;
    var TIMESTAMP = '20140813183328';
    var defaultComboPrefix = '??';
    var defaultComboSep = ',';

    function returnJson(s) {
        /*jshint evil:true*/
        return (new Function('return ' + s))();
    }

    var baseReg = /^(.*)(seed|loader)(?:-debug|-coverage)?\.js[^/]*/i,
        baseTestReg = /(seed|loader)(?:-debug|-coverage)?\.js/i;

    function getBaseInfoFromOneScript(script) {
        // can not use KISSY.Uri
        // /??x.js,dom.js for tbcdn
        var src = script.src || '';
        if (!src.match(baseTestReg)) {
            return 0;
        }

        var baseInfo = script.getAttribute('data-config');

        if (baseInfo) {
            baseInfo = returnJson(baseInfo);
        } else {
            baseInfo = {};
        }

        var comboPrefix = baseInfo.comboPrefix || defaultComboPrefix;
        var comboSep = baseInfo.comboSep || defaultComboSep;

        var parts,
            base,
            index = src.indexOf(comboPrefix);

        // no combo
        if (index === -1) {
            base = src.replace(baseReg, '$1');
        } else {
            base = src.substring(0, index);
            // a.tbcdn.cn??y.js, ie does not insert / after host
            // a.tbcdn.cn/combo? comboPrefix=/combo?
            if (base.charAt(base.length - 1) !== '/') {
                base += '/';
            }
            parts = src.substring(index + comboPrefix.length).split(comboSep);
            Utils.each(parts, function (part) {
                if (part.match(baseTestReg)) {
                    base += part.replace(baseReg, '$1');
                    return false;
                }
                return undefined;
            });
        }

        if (!('tag' in baseInfo)) {
            var queryIndex = src.lastIndexOf('?t=');
            if (queryIndex !== -1) {
                var query = src.substring(queryIndex + 1);
                // kissy 's tag will be determined by build time and user specified tag
                baseInfo.tag = Utils.getHash(TIMESTAMP + query);
            }
        }

        baseInfo.base = baseInfo.base || base;

        return baseInfo;
    }

    /**
     * get base from seed-debug.js
     * @return {Object} base for kissy
     * @ignore
     *
     * for example:
     *      @example
     *      http://a.tbcdn.cn/??s/kissy/x.y.z/seed-min.js,p/global/global.js
     *      note about custom combo rules, such as yui3:
     *      combo-prefix='combo?' combo-sep='&'
     */
    function getBaseInfo() {
        // get base from current script file path
        // notice: timestamp
        var scripts = doc.getElementsByTagName('script'),
            i,
            info;

        for (i = scripts.length - 1; i >= 0; i--) {
            if ((info = getBaseInfoFromOneScript(scripts[i]))) {
                return info;
            }
        }

        var msg = 'must load kissy by file name in browser environment: ' +
            'seed-debug.js or seed.js loader.js or loader-debug.js';

        S.log(msg, 'error');
        return null;
    }

    S.config({
        comboPrefix: defaultComboPrefix,
        comboSep: defaultComboSep,
        charset: 'utf-8',
        filter: '',
        lang: 'zh-cn'
    });
    S.config('packages', {
        core: {
            filter: S.Config.debug ? 'debug' : ''
        }
    });
    // ejecta
    if (doc && doc.getElementsByTagName) {
        // will transform base to absolute path
        S.config(Utils.mix({
            // 2k(2048) url length
            comboMaxUrlLength: 2000,
            // file limit number for a single combo url
            comboMaxFileNum: 40
        }, getBaseInfo()));
    }

    S.add('logger-manager', function () {
        return S.LoggerMangaer;
    });
})(KISSY);
/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 14:05
*/
/*
combined modules:
ua
*/
KISSY.add('ua', [], function (S, require, exports, module) {
    /**
 * @ignore
 * ua
 */
    /*global process*/
    var win = typeof window !== 'undefined' ? window : {}, undef, doc = win.document, ua = win.navigator && win.navigator.userAgent || '';
    function numberify(s) {
        var c = 0;    // convert '1.2.3.4' to 1.234
        // convert '1.2.3.4' to 1.234
        return parseFloat(s.replace(/\./g, function () {
            return c++ === 0 ? '.' : '';
        }));
    }
    function setTridentVersion(ua, UA) {
        var core, m;
        UA[core = 'trident'] = 0.1;    // Trident detected, look for revision
                                       // Get the Trident's accurate version
        // Trident detected, look for revision
        // Get the Trident's accurate version
        if ((m = ua.match(/Trident\/([\d.]*)/)) && m[1]) {
            UA[core] = numberify(m[1]);
        }
        UA.core = core;
    }
    function getIEVersion(ua) {
        var m, v;
        if ((m = ua.match(/MSIE ([^;]*)|Trident.*; rv(?:\s|:)?([0-9.]+)/)) && (v = m[1] || m[2])) {
            return numberify(v);
        }
        return 0;
    }
    function getDescriptorFromUserAgent(ua) {
        var EMPTY = '', os, core = EMPTY, shell = EMPTY, m, IE_DETECT_RANGE = [
                6,
                9
            ], ieVersion, v, end, VERSION_PLACEHOLDER = '{{version}}', IE_DETECT_TPL = '<!--[if IE ' + VERSION_PLACEHOLDER + ']><' + 's></s><![endif]-->', div = doc && doc.createElement('div'), s = [];    /**
     * KISSY UA
     * @class KISSY.UA
     * @singleton
     */
        /**
     * KISSY UA
     * @class KISSY.UA
     * @singleton
     */
        var UA = {
                /**
         * webkit version
         * @type undef|Number
         * @member KISSY.UA
         */
                webkit: undef,
                /**
         * trident version
         * @type undef|Number
         * @member KISSY.UA
         */
                trident: undef,
                /**
         * gecko version
         * @type undef|Number
         * @member KISSY.UA
         */
                gecko: undef,
                /**
         * presto version
         * @type undef|Number
         * @member KISSY.UA
         */
                presto: undef,
                /**
         * chrome version
         * @type undef|Number
         * @member KISSY.UA
         */
                chrome: undef,
                /**
         * safari version
         * @type undef|Number
         * @member KISSY.UA
         */
                safari: undef,
                /**
         * firefox version
         * @type undef|Number
         * @member KISSY.UA
         */
                firefox: undef,
                /**
         * ie version
         * @type undef|Number
         * @member KISSY.UA
         */
                ie: undef,
                /**
         * ie document mode
         * @type undef|Number
         * @member KISSY.UA
         */
                ieMode: undef,
                /**
         * opera version
         * @type undef|Number
         * @member KISSY.UA
         */
                opera: undef,
                /**
         * mobile browser. apple, android.
         * @type String
         * @member KISSY.UA
         */
                mobile: undef,
                /**
         * browser render engine name. webkit, trident
         * @type String
         * @member KISSY.UA
         */
                core: undef,
                /**
         * browser shell name. ie, chrome, firefox
         * @type String
         * @member KISSY.UA
         */
                shell: undef,
                /**
         * PhantomJS version number
         * @type undef|Number
         * @member KISSY.UA
         */
                phantomjs: undef,
                /**
         * operating system. android, ios, linux, windows
         * @type string
         * @member KISSY.UA
         */
                os: undef,
                /**
         * ipad ios version
         * @type Number
         * @member KISSY.UA
         */
                ipad: undef,
                /**
         * iphone ios version
         * @type Number
         * @member KISSY.UA
         */
                iphone: undef,
                /**
         * ipod ios
         * @type Number
         * @member KISSY.UA
         */
                ipod: undef,
                /**
         * ios version
         * @type Number
         * @member KISSY.UA
         */
                ios: undef,
                /**
         * android version
         * @type Number
         * @member KISSY.UA
         */
                android: undef,
                /**
         * nodejs version
         * @type Number
         * @member KISSY.UA
         */
                nodejs: undef
            };    // ejecta
        // ejecta
        if (div && div.getElementsByTagName) {
            // try to use IE-Conditional-Comment detect IE more accurately
            // IE10 doesn't support this method, @ref: http://blogs.msdn.com/b/ie/archive/2011/07/06/html5-parsing-in-ie10.aspx
            div.innerHTML = IE_DETECT_TPL.replace(VERSION_PLACEHOLDER, '');
            s = div.getElementsByTagName('s');
        }
        if (s.length > 0) {
            setTridentVersion(ua, UA);    // Detect the accurate version
                                          // 注意：
                                          //  UA.shell = ie, 表示外壳是 ie
                                          //  但 UA.ie = 7, 并不代表外壳是 ie7, 还有可能是 ie8 的兼容模式
                                          //  对于 ie8 的兼容模式，还要通过 documentMode 去判断。但此处不能让 UA.ie = 8, 否则
                                          //  很多脚本判断会失误。因为 ie8 的兼容模式表现行为和 ie7 相同，而不是和 ie8 相同
            // Detect the accurate version
            // 注意：
            //  UA.shell = ie, 表示外壳是 ie
            //  但 UA.ie = 7, 并不代表外壳是 ie7, 还有可能是 ie8 的兼容模式
            //  对于 ie8 的兼容模式，还要通过 documentMode 去判断。但此处不能让 UA.ie = 8, 否则
            //  很多脚本判断会失误。因为 ie8 的兼容模式表现行为和 ie7 相同，而不是和 ie8 相同
            for (v = IE_DETECT_RANGE[0], end = IE_DETECT_RANGE[1]; v <= end; v++) {
                div.innerHTML = IE_DETECT_TPL.replace(VERSION_PLACEHOLDER, v);
                if (s.length > 0) {
                    UA[shell = 'ie'] = v;
                    break;
                }
            }    // https://github.com/kissyteam/kissy/issues/321
                 // win8 embed app
            // https://github.com/kissyteam/kissy/issues/321
            // win8 embed app
            if (!UA.ie && (ieVersion = getIEVersion(ua))) {
                UA[shell = 'ie'] = ieVersion;
            }
        } else {
            // WebKit
            // https://github.com/kissyteam/kissy/issues/545
            if (((m = ua.match(/AppleWebKit\/([\d.]*)/)) || (m = ua.match(/Safari\/([\d.]*)/))) && m[1]) {
                UA[core = 'webkit'] = numberify(m[1]);
                if ((m = ua.match(/OPR\/(\d+\.\d+)/)) && m[1]) {
                    UA[shell = 'opera'] = numberify(m[1]);
                } else if ((m = ua.match(/Chrome\/([\d.]*)/)) && m[1]) {
                    UA[shell = 'chrome'] = numberify(m[1]);
                } else if ((m = ua.match(/\/([\d.]*) Safari/)) && m[1]) {
                    UA[shell = 'safari'] = numberify(m[1]);
                } else {
                    // default to mobile safari
                    UA.safari = UA.webkit;
                }    // Apple Mobile
                // Apple Mobile
                if (/ Mobile\//.test(ua) && ua.match(/iPad|iPod|iPhone/)) {
                    UA.mobile = 'apple';    // iPad, iPhone or iPod Touch
                    // iPad, iPhone or iPod Touch
                    m = ua.match(/OS ([^\s]*)/);
                    if (m && m[1]) {
                        UA.ios = numberify(m[1].replace('_', '.'));
                    }
                    os = 'ios';
                    m = ua.match(/iPad|iPod|iPhone/);
                    if (m && m[0]) {
                        UA[m[0].toLowerCase()] = UA.ios;
                    }
                } else if (/ Android/i.test(ua)) {
                    if (/Mobile/.test(ua)) {
                        os = UA.mobile = 'android';
                    }
                    m = ua.match(/Android ([^\s]*);/);
                    if (m && m[1]) {
                        UA.android = numberify(m[1]);
                    }
                } else if (m = ua.match(/NokiaN[^\/]*|Android \d\.\d|webOS\/\d\.\d/)) {
                    UA.mobile = m[0].toLowerCase();    // Nokia N-series, Android, webOS, ex: NokiaN95
                }
                // Nokia N-series, Android, webOS, ex: NokiaN95
                if ((m = ua.match(/PhantomJS\/([^\s]*)/)) && m[1]) {
                    UA.phantomjs = numberify(m[1]);
                }
            } else {
                // Presto
                // ref: http://www.useragentstring.com/pages/useragentstring.php
                if ((m = ua.match(/Presto\/([\d.]*)/)) && m[1]) {
                    UA[core = 'presto'] = numberify(m[1]);    // Opera
                    // Opera
                    if ((m = ua.match(/Opera\/([\d.]*)/)) && m[1]) {
                        UA[shell = 'opera'] = numberify(m[1]);    // Opera detected, look for revision
                        // Opera detected, look for revision
                        if ((m = ua.match(/Opera\/.* Version\/([\d.]*)/)) && m[1]) {
                            UA[shell] = numberify(m[1]);
                        }    // Opera Mini
                        // Opera Mini
                        if ((m = ua.match(/Opera Mini[^;]*/)) && m) {
                            UA.mobile = m[0].toLowerCase();    // ex: Opera Mini/2.0.4509/1316
                        } else // ex: Opera Mini/2.0.4509/1316
                        if ((m = ua.match(/Opera Mobi[^;]*/)) && m) {
                            // Opera Mobile
                            // ex: Opera/9.80 (Windows NT 6.1; Opera Mobi/49; U; en) Presto/2.4.18 Version/10.00
                            // issue: 由于 Opera Mobile 有 Version/ 字段，可能会与 Opera 混淆，同时对于 Opera Mobile 的版本号也比较混乱
                            UA.mobile = m[0];
                        }
                    }    // NOT WebKit or Presto
                } else
                    // NOT WebKit or Presto
                    {
                        // MSIE
                        // 由于最开始已经使用了 IE 条件注释判断，因此落到这里的唯一可能性只有 IE10+
                        // and analysis tools in nodejs
                        if (ieVersion = getIEVersion(ua)) {
                            UA[shell = 'ie'] = ieVersion;
                            setTridentVersion(ua, UA);    // NOT WebKit, Presto or IE
                        } else
                            // NOT WebKit, Presto or IE
                            {
                                // Gecko
                                if (m = ua.match(/Gecko/)) {
                                    UA[core = 'gecko'] = 0.1;    // Gecko detected, look for revision
                                    // Gecko detected, look for revision
                                    if ((m = ua.match(/rv:([\d.]*)/)) && m[1]) {
                                        UA[core] = numberify(m[1]);
                                        if (/Mobile|Tablet/.test(ua)) {
                                            UA.mobile = 'firefox';
                                        }
                                    }    // Firefox
                                    // Firefox
                                    if ((m = ua.match(/Firefox\/([\d.]*)/)) && m[1]) {
                                        UA[shell = 'firefox'] = numberify(m[1]);
                                    }
                                }
                            }
                    }
            }
        }
        if (!os) {
            if (/windows|win32/i.test(ua)) {
                os = 'windows';
            } else if (/macintosh|mac_powerpc/i.test(ua)) {
                os = 'macintosh';
            } else if (/linux/i.test(ua)) {
                os = 'linux';
            } else if (/rhino/i.test(ua)) {
                os = 'rhino';
            }
        }
        UA.os = os;
        UA.core = UA.core || core;
        UA.shell = shell;
        UA.ieMode = UA.ie && doc.documentMode || UA.ie;
        return UA;
    }
    var UA = module.exports = getDescriptorFromUserAgent(ua);    // nodejs
    // nodejs
    if (typeof process === 'object') {
        var versions, nodeVersion;
        if ((versions = process.versions) && (nodeVersion = versions.node)) {
            UA.os = process.platform;
            UA.nodejs = numberify(nodeVersion);
        }
    }    // use by analysis tools in nodejs
    // use by analysis tools in nodejs
    UA.getDescriptorFromUserAgent = getDescriptorFromUserAgent;
    var browsers = [
            // browser core type
            'webkit',
            'trident',
            'gecko',
            'presto',
            // browser type
            'chrome',
            'safari',
            'firefox',
            'ie',
            'opera'
        ], documentElement = doc && doc.documentElement, className = '';
    if (documentElement) {
        for (var i = 0; i < browsers.length; i++) {
            var key = browsers[i];
            var v = UA[key];
            if (v) {
                className += ' ks-' + key + (parseInt(v, 10) + '');
                className += ' ks-' + key;
            }
        }
        if (className) {
            documentElement.className = (documentElement.className + className).replace(/^[\s\xa0]+|[\s\xa0]+$/g, '');
        }
    }    /*
 NOTES:
 2013.07.08 yiminghe@gmail.com
 - support ie11 and opera(using blink)

 2013.01.17 yiminghe@gmail.com
 - expose getDescriptorFromUserAgent for analysis tool in nodejs

 2012.11.27 yiminghe@gmail.com
 - moved to seed for conditional loading and better code share

 2012.11.21 yiminghe@gmail.com
 - touch and os support

 2011.11.08 gonghaocn@gmail.com
 - ie < 10 使用条件注释判断内核，更精确

 2010.03
 - jQuery, YUI 等类库都推荐用特性探测替代浏览器嗅探。特性探测的好处是能自动适应未来设备和未知设备，比如
 if(document.addEventListener) 假设 IE9 支持标准事件，则代码不用修改，就自适应了“未来浏览器”。
 对于未知浏览器也是如此。但是，这并不意味着浏览器嗅探就得彻底抛弃。当代码很明确就是针对已知特定浏览器的，
 同时并非是某个特性探测可以解决时，用浏览器嗅探反而能带来代码的简洁，同时也也不会有什么后患。总之，一切
 皆权衡。
 - UA.ie && UA.ie < 8 并不意味着浏览器就不是 IE8, 有可能是 IE8 的兼容模式。进一步的判断需要使用 documentMode.
 */
});
/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 14:03
*/
/*
combined modules:
feature
*/
KISSY.add('feature', ['ua'], function (S, require, exports, module) {
    /**
 * @ignore
 * detect if current browser supports various features.
 * @author yiminghe@gmail.com
 */
    var win = window, UA = require('ua'), propertyPrefixes = [
            'Webkit',
            'Moz',
            'O',
            // ms is special .... !
            'ms'
        ], propertyPrefixesLength = propertyPrefixes.length,
        // for nodejs
        doc = win.document || {}, isMsPointerSupported,
        // ie11
        isPointerSupported, isTransform3dSupported,
        // nodejs
        documentElement = doc && doc.documentElement, documentElementStyle, isClassListSupportedState = true, isQuerySelectorSupportedState = false,
        // phantomjs issue: http://code.google.com/p/phantomjs/issues/detail?id=375
        isTouchEventSupportedState = 'ontouchstart' in doc && !UA.phantomjs, vendorInfos = {}, ie = UA.ieMode;
    if (documentElement) {
        // broken ie8
        if (documentElement.querySelector && ie !== 8) {
            isQuerySelectorSupportedState = true;
        }
        documentElementStyle = documentElement.style;
        isClassListSupportedState = 'classList' in documentElement;
        isMsPointerSupported = 'msPointerEnabled' in navigator;
        isPointerSupported = 'pointerEnabled' in navigator;
    }
    var RE_DASH = /-([a-z])/gi;
    function upperCase() {
        return arguments[1].toUpperCase();
    }    // return prefixed css prefix name
    // return prefixed css prefix name
    function getVendorInfo(name) {
        if (name.indexOf('-') !== -1) {
            name = name.replace(RE_DASH, upperCase);
        }
        if (name in vendorInfos) {
            return vendorInfos[name];
        }    // if already prefixed or need not to prefix
        // if already prefixed or need not to prefix
        if (!documentElementStyle || name in documentElementStyle) {
            vendorInfos[name] = {
                propertyName: name,
                propertyNamePrefix: ''
            };
        } else {
            var upperFirstName = name.charAt(0).toUpperCase() + name.slice(1), vendorName;
            for (var i = 0; i < propertyPrefixesLength; i++) {
                var propertyNamePrefix = propertyPrefixes[i];
                vendorName = propertyNamePrefix + upperFirstName;
                if (vendorName in documentElementStyle) {
                    vendorInfos[name] = {
                        propertyName: vendorName,
                        propertyNamePrefix: propertyNamePrefix
                    };
                }
            }
            vendorInfos[name] = vendorInfos[name] || null;
        }
        return vendorInfos[name];
    }    /**
 * browser features detection
 * @class KISSY.Feature
 * @private
 * @singleton
 */
    /**
 * browser features detection
 * @class KISSY.Feature
 * @private
 * @singleton
 */
    module.exports = {
        // http://blogs.msdn.com/b/ie/archive/2011/09/20/touch-input-for-ie10-and-metro-style-apps.aspx
        /**
     * whether support microsoft pointer event.
     * @type {Boolean}
     */
        isMsPointerSupported: function () {
            // ie11 onMSPointerDown but e.type==pointerdown
            return isMsPointerSupported;
        },
        /**
     * whether support microsoft pointer event (ie11).
     * @type {Boolean}
     */
        isPointerSupported: function () {
            // ie11
            return isPointerSupported;
        },
        /**
     * whether support touch event.
     * @return {Boolean}
     */
        isTouchEventSupported: function () {
            return isTouchEventSupportedState;
        },
        isTouchGestureSupported: function () {
            return isTouchEventSupportedState || isPointerSupported || isMsPointerSupported;
        },
        /**
     * whether support device motion event
     * @returns {boolean}
     */
        isDeviceMotionSupported: function () {
            return !!win.DeviceMotionEvent;
        },
        /**
     * whether support hashchange event
     * @returns {boolean}
     */
        isHashChangeSupported: function () {
            // ie8 支持 hashchange
            // 但 ie8 以上切换浏览器模式到 ie7（兼容模式），
            // 会导致 'onhashchange' in window === true，但是不触发事件
            return 'onhashchange' in win && (!ie || ie > 7);
        },
        isInputEventSupported: function () {
            return 'oninput' in win && (!ie || ie > 9);
        },
        /**
     * whether support css transform 3d
     * @returns {boolean}
     */
        isTransform3dSupported: function () {
            if (isTransform3dSupported !== undefined) {
                return isTransform3dSupported;
            }
            if (!documentElement || !getVendorInfo('transform')) {
                isTransform3dSupported = false;
            } else {
                // https://gist.github.com/lorenzopolidori/3794226
                // ie9 does not support 3d transform
                // http://msdn.microsoft.com/en-us/ie/ff468705
                try {
                    var el = doc.createElement('p');
                    var transformProperty = getVendorInfo('transform').propertyName;
                    documentElement.insertBefore(el, documentElement.firstChild);
                    el.style[transformProperty] = 'translate3d(1px,1px,1px)';
                    var computedStyle = win.getComputedStyle(el);
                    var has3d = computedStyle.getPropertyValue(transformProperty) || computedStyle[transformProperty];
                    documentElement.removeChild(el);
                    isTransform3dSupported = has3d !== undefined && has3d.length > 0 && has3d !== 'none';
                } catch (e) {
                    // https://github.com/kissyteam/kissy/issues/563
                    isTransform3dSupported = true;
                }
            }
            return isTransform3dSupported;
        },
        /**
     * whether support class list api
     * @returns {boolean}
     */
        isClassListSupported: function () {
            return isClassListSupportedState;
        },
        /**
     * whether support querySelectorAll
     * @returns {boolean}
     */
        isQuerySelectorSupported: function () {
            // force to use js selector engine
            return isQuerySelectorSupportedState;
        },
        getCssVendorInfo: function (name) {
            return getVendorInfo(name);
        }
    };
});
/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Aug 11 10:12
*/
/**
 * @ignore
 * Default KISSY Gallery and core alias.
 * @author yiminghe@gmail.com
 */

// --no-module-wrap--
KISSY.config({
    packages: {
        gallery: {
            base: location.protocol === 'https' ?
                'https://s.tbcdn.cn/s/kissy/gallery' : 'http://a.tbcdn.cn/s/kissy/gallery'
        }
    }
});/*jshint indent:false, quotmark:false*/
KISSY.use(['ua', 'feature'], function(S, UA, Feature){
S.config("requires",{
    "anim/base": [
        "dom",
        "querystring",
        "promise"
    ],
    "anim/timer": [
        "anim/base",
        "feature"
    ],
    "anim/transition": [
        "anim/base",
        "feature"
    ],
    "attribute": [
        "event/custom"
    ],
    "base": [
        "attribute"
    ],
    "button": [
        "component/control"
    ],
    "color": [
        "attribute"
    ],
    "combobox": [
        "menu",
        "io"
    ],
    "combobox/multi-word": [
        "combobox"
    ],
    "component/container": [
        "component/control"
    ],
    "component/control": [
        "node",
        "event/gesture/basic",
        "event/gesture/tap",
        "base",
        "xtemplate/runtime"
    ],
    "component/extension/align": [
        "node",
        "ua"
    ],
    "component/extension/delegate-children": [
        "component/control"
    ],
    "component/extension/shim": [
        "ua"
    ],
    "component/plugin/drag": [
        "dd"
    ],
    "component/plugin/resize": [
        "resizable"
    ],
    "cookie": [
        "util"
    ],
    "date/format": [
        "date/gregorian"
    ],
    "date/gregorian": [
        "util",
        "i18n!date"
    ],
    "date/picker": [
        "i18n!date/picker",
        "component/control",
        "date/format",
        "date/picker-xtpl"
    ],
    "date/popup-picker": [
        "date/picker",
        "component/extension/shim",
        "component/extension/align"
    ],
    "dd": [
        "base",
        "node",
        "event/gesture/basic",
        "event/gesture/pan"
    ],
    "dd/plugin/constrain": [
        "base",
        "node"
    ],
    "dd/plugin/proxy": [
        "dd"
    ],
    "dd/plugin/scroll": [
        "dd"
    ],
    "dom/base": [
        "util",
        "feature"
    ],
    "dom/class-list": [
        "dom/base"
    ],
    "dom/ie": [
        "dom/base"
    ],
    "dom/selector": [
        "util",
        "dom/basic"
    ],
    "editor": [
        "html-parser",
        "component/control"
    ],
    "event": [
        "event/dom",
        "event/custom"
    ],
    "event/base": [
        "util"
    ],
    "event/custom": [
        "event/base"
    ],
    "event/dom/base": [
        "event/base",
        "dom",
        "ua"
    ],
    "event/dom/focusin": [
        "event/dom/base"
    ],
    "event/dom/hashchange": [
        "event/dom/base"
    ],
    "event/dom/ie": [
        "event/dom/base"
    ],
    "event/dom/input": [
        "event/dom/base"
    ],
    "event/gesture/basic": [
        "event/gesture/util"
    ],
    "event/gesture/edge-pan": [
        "event/gesture/util"
    ],
    "event/gesture/pan": [
        "event/gesture/util"
    ],
    "event/gesture/pinch": [
        "event/gesture/util"
    ],
    "event/gesture/rotate": [
        "event/gesture/util"
    ],
    "event/gesture/shake": [
        "event/dom/base"
    ],
    "event/gesture/swipe": [
        "event/gesture/util"
    ],
    "event/gesture/tap": [
        "event/gesture/util"
    ],
    "event/gesture/util": [
        "event/dom/base",
        "feature"
    ],
    "feature": [
        "ua"
    ],
    "filter-menu": [
        "menu"
    ],
    "html-parser": [
        "util"
    ],
    "io": [
        "dom",
        "event/custom",
        "promise",
        "url",
        "ua",
        "event/dom"
    ],
    "json": [
        "util"
    ],
    "menu": [
        "component/container",
        "component/extension/delegate-children",
        "component/extension/content-box",
        "component/extension/align",
        "component/extension/shim"
    ],
    "menubutton": [
        "button",
        "menu"
    ],
    "navigation-view": [
        "component/container",
        "component/extension/content-box"
    ],
    "navigation-view/bar": [
        "button"
    ],
    "node": [
        "util",
        "dom",
        "event/dom",
        "anim"
    ],
    "overlay": [
        "component/container",
        "component/extension/shim",
        "component/extension/align",
        "component/extension/content-box"
    ],
    "promise": [
        "util"
    ],
    "querystring": [
        "logger-manager"
    ],
    "resizable": [
        "dd"
    ],
    "resizable/plugin/proxy": [
        "base",
        "node"
    ],
    "router": [
        "url",
        "event/dom",
        "event/custom",
        "feature"
    ],
    "scroll-view/base": [
        "anim/timer",
        "component/container",
        "component/extension/content-box"
    ],
    "scroll-view/plugin/pull-to-refresh": [
        "base",
        "node",
        "feature"
    ],
    "scroll-view/plugin/scrollbar": [
        "component/control",
        "event/gesture/pan"
    ],
    "scroll-view/touch": [
        "scroll-view/base",
        "event/gesture/pan"
    ],
    "separator": [
        "component/control"
    ],
    "split-button": [
        "menubutton"
    ],
    "stylesheet": [
        "dom"
    ],
    "swf": [
        "dom",
        "json",
        "attribute"
    ],
    "tabs": [
        "toolbar",
        "button",
        "component/extension/content-box"
    ],
    "toolbar": [
        "component/container",
        "component/extension/delegate-children"
    ],
    "tree": [
        "component/container",
        "component/extension/content-box",
        "component/extension/delegate-children"
    ],
    "url": [
        "querystring",
        "path"
    ],
    "util": [
        "logger-manager"
    ],
    "xtemplate": [
        "xtemplate/runtime"
    ],
    "xtemplate/runtime": [
        "util"
    ]
});
var win = window,
    isTouchGestureSupported = Feature.isTouchGestureSupported(),
    add = S.add,
    emptyObject = {};

function alias(name, aliasName) {
   var cfg;
   if(typeof name ==="string") {
       cfg = {};
       cfg[name] = aliasName;
   } else {
       cfg = name;
   }
   S.config("alias", cfg);
}

alias('anim', Feature.getCssVendorInfo('transition') ? 'anim/transition' : 'anim/timer');
alias({
    'dom/basic': [
        'dom/base',
        UA.ieMode < 9 ? 'dom/ie' : '',
        Feature.isClassListSupported() ? '' : 'dom/class-list'
    ],
    dom: [
        'dom/basic',
        Feature.isQuerySelectorSupported() ? '' : 'dom/selector'
    ]
});
alias('event/dom', [
    'event/dom/base',
    Feature.isHashChangeSupported() ? '' : 'event/dom/hashchange',
        UA.ieMode < 9 ? 'event/dom/ie' : '',
    Feature.isInputEventSupported() ? '' : 'event/dom/input',
    UA.ie ? '' : 'event/dom/focusin'
]);
if (!isTouchGestureSupported) {
    add('event/gesture/edge-pan', emptyObject);
}

if (!isTouchGestureSupported) {
    add('event/gesture/pinch', emptyObject);
}

if (!isTouchGestureSupported) {
    add('event/gesture/rotate', emptyObject);
}

if (!win.DeviceMotionEvent) {
    add('event/gesture/shake', emptyObject);
}

if (!isTouchGestureSupported) {
    add('event/gesture/swipe', emptyObject);
}

alias('ajax','io');
alias('scroll-view', Feature.isTouchGestureSupported() ? 'scroll-view/touch' : 'scroll-view/base');
});
