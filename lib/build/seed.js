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
    var self = this,
        S,
        guid = 0,
        EMPTY = '';

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
        debug: 10,
        info: 20,
        warn: 30,
        error: 40
    };

    S = {
        /**
         * The build time of the library.
         * NOTICE: '20140429151359' will replace with current timestamp when compressing.
         * @private
         * @type {String}
         */
        __BUILD_TIME: '20140429151359',

        /**
         * KISSY Environment.
         * @private
         * @type {Object}
         */
        Env: {
            host: self
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
         * @returns {KISSY.Logger} log instance
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
        /**
         * Log class for specified logger
         * @class KISSY.Logger
         * @private
         */
        /**
         * print debug log
         * @method debug
         * @member KISSY.Logger
         * @param {String} str log str
         */

        /**
         * print info log
         * @method info
         * @member KISSY.Logger
         * @param {String} str log str
         */

        /**
         * print warn log
         * @method log
         * @member KISSY.Logger
         * @param {String} str log str
         */

        /**
         * print error log
         * @method error
         * @member KISSY.Logger
         * @param {String} str log str
         */
    }

    return S;
})();/**
 * @ignore
 * setup data structure for kissy loader
 * @author yiminghe@gmail.com
 */
(function (S) {
    var Loader = S.Loader = {};

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
})(KISSY);/**
 * @ignore
 * Utils for kissy loader
 * @author yiminghe@gmail.com
 */
(function (S) {
    var Loader = S.Loader,
        Env = S.Env,
        host = Env.host,
        data = Loader.Status,
        ATTACHED = data.ATTACHED,
        LOADED = data.LOADED,
        ATTACHING = data.ATTACHING,
        /**
         * @class KISSY.Loader.Utils
         * Utils for KISSY Loader
         * @singleton
         * @private
         */
        Utils = Loader.Utils = {},
        doc = host.document;

    // http://wiki.commonjs.org/wiki/Packages/Mappings/A
    // 如果模块名以 / 结尾，自动加 index
    function addIndexAndRemoveJsExt(s) {
        if (typeof s === 'string') {
            return addIndexAndRemoveJsExtFromName(s);
        } else {
            var ret = [],
                i = 0,
                l = s.length;
            for (; i < l; i++) {
                ret[i] = addIndexAndRemoveJsExtFromName(s[i]);
            }
            return ret;
        }
    }

    function addIndexAndRemoveJsExtFromName(name) {
        // 'x/' 'x/y/z/'
        if (name.charAt(name.length - 1) === '/') {
            name += 'index';
        }
        if (Utils.endsWith(name, '.js')) {
            name = name.slice(0, -3);
        }
        return name;
    }

    function pluginAlias(name) {
        var index = name.indexOf('!');
        if (index !== -1) {
            var pluginName = name.substring(0, index);
            name = name.substring(index + 1);
            var Plugin = S.require(pluginName);
            if (Plugin.alias) {
                //noinspection JSReferencingMutableVariableFromClosure
                name = Plugin.alias(S, name, pluginName);
            }
        }
        return name;
    }

    function numberify(s) {
        var c = 0;
        // convert '1.2.3.4' to 1.234
        return parseFloat(s.replace(/\./g, function () {
            return (c++ === 0) ? '.' : '';
        }));
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
        Utils.trident = Utils.trident || 1;
    }

    var urlReg = /http(s)?:\/\/([^/]+)(?::(\d+))?/;

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

        normalizeSlash: function (str) {
            return str.replace(/\\/g, '/');
        },

        normalizePath: function (parentPath, subPath) {
            var firstChar = subPath.charAt(0);
            if (firstChar !== '.') {
                return subPath;
            }
            var parts = parentPath.split('/');
            var subParts = subPath.split('/');
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
            return parts.join('/');
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
         * Get absolute path of dep module.similar to {@link KISSY.Path#resolve}
         * @param {String} moduleName current module 's name
         * @param {String|String[]} depName dependency module 's name
         * @return {String|String[]} normalized dependency module 's name
         */
        normalDepModuleName: function (moduleName, depName) {
            if (typeof depName === 'string') {
                return Utils.normalizePath(moduleName, depName);
            }

            var i = 0, l;

            for (l = depName.length; i < l; i++) {
                depName[i] = Utils.normalizePath(moduleName, depName[i]);
            }
            return depName;
        },

        /**
         * create modules info
         * @param {String[]} modNames to be created module names
         */
        getOrCreateModulesInfo: function (modNames) {
            var ret = [];
            Utils.each(modNames, function (m, i) {
                ret[i] = Utils.getOrCreateModuleInfo(m);
            });
            return ret;
        },

        /**
         * create single module info
         * @param {String} modName to be created module name
         * @param {Object} [cfg] module config
         * @return {KISSY.Loader.Module}
         */
        getOrCreateModuleInfo: function (modName, cfg) {
            modName = addIndexAndRemoveJsExtFromName(modName);

            var mods = Env.mods,
                module = mods[modName];

            if (module) {
                return module;
            }

            // 防止 cfg 里有 tag，构建 fullpath 需要
            mods[modName] = module = new Loader.Module(mix({
                name: modName
            }, cfg));

            return module;
        },

        /**
         * Get modules exports
         * @param {String[]} modNames module names
         * @return {Array} modules exports
         */
        getModules: function (modNames) {
            var mods = [S], module,
                unalias,
                allOk,
                m,
                runtimeMods = Env.mods;

            Utils.each(modNames, function (modName) {
                module = runtimeMods[modName];
                if (module && module.getType() !== 'css') {
                    unalias = module.getNormalizedAlias();
                    allOk = true;
                    for (var i = 0; allOk && i < unalias.length; i++) {
                        m = runtimeMods[unalias[i]];
                        // allow partial module (circular dependency)
                        allOk = m && m.status >= ATTACHING;
                    }
                    if (allOk) {
                        mods.push(runtimeMods[unalias[0]].exports);
                    } else {
                        mods.push(null);
                    }
                } else {
                    mods.push(undefined);
                }
            });

            return mods;
        },

        /**
         * attach modules and their dependency modules recursively
         * @param {String[]} modNames module names
         */
        attachModsRecursively: function (modNames) {
            var i,
                l = modNames.length;
            for (i = 0; i < l; i++) {
                Utils.attachModRecursively(modNames[i]);
            }
        },

        /**
         * attach module and its dependency modules recursively
         * @param {String} modName module name
         */
        attachModRecursively: function (modName) {
            var mods = Env.mods,
                status,
                m = mods[modName];
            status = m.status;
            // attached or circular dependency
            if (status >= ATTACHING) {
                return;
            }
            m.status = ATTACHING;
            if (m.cjs) {
                // commonjs format will call require in module code again
                Utils.attachMod(m);
            } else {
                Utils.attachModsRecursively(m.getNormalizedRequires());
                Utils.attachMod(m);
            }
        },

        /**
         * Attach specified module.
         * @param {KISSY.Loader.Module} module module instance
         */
        attachMod: function (module) {
            var factory = module.factory,
                exports;

            if (typeof factory === 'function') {
                // compatible and efficiency
                // KISSY.add(function(S,undefined){})
                // 需要解开 index，相对路径
                // 但是需要保留 alias，防止值不对应
                //noinspection JSUnresolvedFunction
                var requires = module.requires;
                exports = factory.apply(module,
                    // KISSY.add(function(S){module.require}) lazy initialize
                    (module.cjs ? [S,
                            requires && requires.length ? module.require : undefined,
                        module.exports,
                        module] :
                        Utils.getModules(module.getRequiresWithAlias())));
                if (exports !== undefined) {
                    //noinspection JSUndefinedPropertyAssignment
                    module.exports = exports;
                }
            } else {
                //noinspection JSUndefinedPropertyAssignment
                module.exports = factory;
            }

            module.status = ATTACHED;
        },

        /**
         * Get module names as array.
         * @param {String|String[]} modNames module names array or  module names string separated by ','
         * @return {String[]}
         */
        getModNamesAsArray: function (modNames) {
            if (typeof modNames === 'string') {
                modNames = modNames.replace(/\s+/g, '').split(',');
            }
            return modNames;
        },

        /**
         * normalize module names
         * 1. add index : / => /index
         * 2. unalias : core => dom,event,ua
         * 3. relative to absolute : ./x => y/x
         * @param {String|String[]} modNames Array of module names
         *  or module names string separated by comma
         * @param {String} [refModName]
         * @return {String[]} normalized module names
         */
        normalizeModNames: function (modNames, refModName) {
            return Utils.unalias(Utils.normalizeModNamesWithAlias(modNames, refModName));
        },

        unalias: function (modNames) {
            var ret = [];
            for (var i = 0; i < modNames.length; i++) {
                var mod = Utils.getOrCreateModuleInfo(modNames[i]);
                ret.push.apply(ret, mod.getNormalizedAlias());
            }
            return ret;
        },

        /**
         * normalize module names with alias
         * @param {String[]} modNames module names
         * @param [refModName] module to be referred if module name path is relative
         * @return {String[]} normalize module names with alias
         */
        normalizeModNamesWithAlias: function (modNames, refModName) {
            var ret = [],
                i, l;
            if (modNames) {
                // 1. index map
                for (i = 0, l = modNames.length; i < l; i++) {
                    // conditional loader
                    // requires:[window.localStorage?"local-storage":""]
                    if (modNames[i]) {
                        ret.push(pluginAlias(addIndexAndRemoveJsExt(modNames[i])));
                    }
                }
            }
            // 2. relative to absolute (optional)
            if (refModName) {
                ret = Utils.normalDepModuleName(refModName, ret);
            }
            return ret;
        },

        /**
         * register module with factory
         * @param {String} name module name
         * @param {Function|*} factory module's factory or exports
         * @param [config] module config, such as dependency
         */
        registerModule: function (name, factory, config) {
            name = addIndexAndRemoveJsExtFromName(name);

            var mods = Env.mods,
                module = mods[name];

            if (module && module.factory !== undefined) {
                S.log(name + ' is defined more than once', 'warn');
                return;
            }

            // 没有 use，静态载入的 add 可能执行
            Utils.getOrCreateModuleInfo(name);

            module = mods[name];

            // 注意：通过 S.add(name[, factory[, config]]) 注册的代码，无论是页面中的代码，
            // 还是 js 文件里的代码，add 执行时，都意味着该模块已经 LOADED
            mix(module, {
                name: name,
                status: LOADED,
                factory: factory
            });

            mix(module, config);
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

        getRequiresFromFn: function (fn) {
            var requires = [];
            // Remove comments from the callback string,
            // look for require calls, and pull them into the dependencies,
            // but only if there are function args.
            fn.toString()
                .replace(commentRegExp, '')
                .replace(requireRegExp, function (match, dep) {
                    requires.push(getRequireVal(dep));
                });
            return requires;
        }
    });

    var commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg,
        requireRegExp = /[^.'"]\s*require\s*\(([^)]+)\)/g;

    function getRequireVal(str) {
        var m;
        // simple string
        if (!(m = str.match(/^\s*["']([^'"\s]+)["']\s*$/))) {
            S.error('can not find required mod in require call: ' + str);
        }
        return  m[1];
    }
})(KISSY);/**
 * @ignore
 * setup data structure for kissy loader
 * @author yiminghe@gmail.com
 */
(function (S) {
    var Loader = S.Loader,
        Config = S.Config,
        Utils = Loader.Utils,
        mix = Utils.mix;

    function checkGlobalIfNotExist(self, property) {
        return property in self ?
            self[property] :
            Config[property];
    }

    /**
     * @class KISSY.Loader.Package
     * @private
     * This class should not be instantiated manually.
     */
    function Package(cfg) {
        this.filter = '';
        mix(this, cfg);
    }

    Package.prototype = {
        constructor: Package,

        reset: function (cfg) {
            mix(this, cfg);
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
         * Get package name.
         * @return {String}
         */
        getName: function () {
            return this.name;
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
        self.exports = {};

        /**
         * status of current modules
         */
        self.status = Loader.Status.INIT;

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

        self.require = function (moduleName) {
            return S.require(moduleName, self.name);
        };

        self.require.resolve = function (relativeName) {
            return self.resolve(relativeName);
        };
    }

    Module.prototype = {
        kissy: 1,

        constructor: Module,

        resolve: function (relativeName) {
            return Utils.normalizePath(this.name, relativeName);
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

        getAlias: function () {
            var self = this,
                name = self.name,
                packageInfo,
                alias = self.alias;
            if (alias) {
                return alias;
            }
            packageInfo = self.getPackage();
            if (packageInfo.alias) {
                alias = packageInfo.alias(name);
            }
            alias = self.alias = alias || [];
            return alias;
        },

        getNormalizedAlias: function () {
            var self = this;
            if (self.normalizedAlias) {
                return self.normalizedAlias;
            }
            var alias = self.getAlias();
            if (typeof alias === 'string') {
                alias = [alias];
            }
            var ret = [];
            for (var i = 0, l = alias.length; i < l; i++) {
                if (alias[i]) {
                    var mod = Utils.getOrCreateModuleInfo(alias[i]);
                    var normalAlias = mod.getNormalizedAlias();
                    if (normalAlias) {
                        ret.push.apply(ret, normalAlias);
                    } else {
                        ret.push(alias[i]);
                    }
                }
            }
            if (!ret.length) {
                ret.push(self.name);
            }
            self.normalizedAlias = ret;
            return ret;
        },

        /**
         * Get the path url of current module if load dynamically
         * @return {String}
         */
        getUrl: function () {
            var self = this;
            if (!self.url) {
                self.url = S.Config.resolveModFn(self);
            }
            return self.url;
        },

        /**
         * Get the name of current module
         * @return {String}
         */
        getName: function () {
            return this.name;
        },

        /**
         * Get the package which current module belongs to.
         * @return {KISSY.Loader.Package}
         */
        getPackage: function () {
            var self = this;
            if (!self.packageInfo) {
                var packages = Config.packages,
                    modNameSlash = self.name + '/',
                    pName = '',
                    p;
                for (p in packages) {
                    if (Utils.startsWith(modNameSlash, p + '/') && p.length > pName.length) {
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
            return self.tag || self.getPackage().getTag();
        },

        /**
         * Get the charset of current module
         * @return {String}
         */
        getCharset: function () {
            var self = this;
            return self.charset || self.getPackage().getCharset();
        },

        /**
         * get alias required module names
         * @returns {String[]} alias required module names
         */
        getRequiresWithAlias: function () {
            var self = this,
                requiresWithAlias = self.requiresWithAlias,
                requires = self.requires;
            if (!requires || requires.length === 0) {
                return requires || [];
            } else if (!requiresWithAlias) {
                self.requiresWithAlias = requiresWithAlias =
                    Utils.normalizeModNamesWithAlias(requires, self.name);
            }
            return requiresWithAlias;
        },

        /**
         * Get module objects required by this module
         * @return {KISSY.Loader.Module[]}
         */
        getRequiredMods: function () {
            return Utils.getOrCreateModulesInfo(this.getNormalizedRequires());
        },

        /**
         * Get module names required by this module
         * @return {String[]}
         */
        getNormalizedRequires: function () {
            var self = this,
                normalizedRequires,
                normalizedRequiresStatus = self.normalizedRequiresStatus,
                status = self.status,
                requires = self.requires;
            if (!requires || requires.length === 0) {
                return requires || [];
            } else if ((normalizedRequires = self.normalizedRequires) &&
                // 事先声明的依赖不能当做 loaded 状态下真正的依赖
                (normalizedRequiresStatus === status)) {
                return normalizedRequires;
            } else {
                self.normalizedRequiresStatus = status;
                self.normalizedRequires = Utils.normalizeModNames(requires, self.name);
                return self.normalizedRequires;
            }
        }
    };

    Loader.Module = Module;
})(KISSY);/**
 * @ignore
 * script/css load across browser
 * @author yiminghe@gmail.com
 */
(function (S) {
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
    var MILLISECONDS_OF_SECOND = 1000,
        doc = S.Env.host.document,
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
            error,
            timeout,
            attrs,
            callbacks,
            timer;

        if (typeof config === 'object') {
            success = config.success;
            error = config.error;
            timeout = config.timeout;
            charset = config.charset;
            attrs = config.attrs;
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
 *//**
 * @ignore
 * Declare config info for KISSY.
 * @author yiminghe@gmail.com
 */
(function (S) {
    var Loader = S.Loader,
        Package = Loader.Package,
        Utils = Loader.Utils,
        host = S.Env.host,
        Config = S.Config,
        location = host.location,
        locationPath = '',
        configFns = Config.fns;

    if (location) {
        locationPath = location.protocol + '//' + location.host + location.pathname;
    }

    // how to load mods by path
    Config.loadModsFn = function (rs, config) {
        S.getScript(rs.url, config);
    };

    // how to get mod url
    Config.resolveModFn = function (mod) {
        var name = mod.name,
            filter, t, url, subPath;
        var packageInfo = mod.getPackage();
        var packageBase = packageInfo.getBase();
        var packageName = packageInfo.getName();
        var extname = '.' + mod.getType();
        // special for css module
        name = name.replace(/\.css$/, '');
        filter = packageInfo.filter;

        if (filter) {
            filter = '-' + filter;
        }

        // packageName: a/y use('a/y');
        if (name === packageName) {
            url = packageBase.substring(0, packageBase.length - 1) + filter + extname;
        } else {
            subPath = name + filter + extname;
            if (Utils.startsWith(name, packageName + '/')) {
                subPath = subPath.substring(packageName.length + 1);
            }
            url = packageBase + subPath;
        }

        if ((t = mod.getTag())) {
            t += '.' + mod.getType();
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
                var mod = Utils.getOrCreateModuleInfo(modName, modCfg);
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
        if (locationPath) {
            if (base.charAt(0) === '/') {
                base = location.protocol + '//' + location.host + base;
            } else {
                base = Utils.normalizePath(locationPath, base);
            }
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
    var logger = S.getLogger('s/loader');

    // ie11 is a new one!
    var Loader = S.Loader,
        Config = S.Config,
        Status = Loader.Status,
        Utils = Loader.Utils,
        each = Utils.each,
        getHash = Utils.getHash,
        LOADING = Status.LOADING,
        LOADED = Status.LOADED,
        ERROR = Status.ERROR,
        oldIE = Utils.ie < 10;

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
                        Utils.registerModule(mod.name, currentMod.factory, currentMod.config);
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
                Utils.registerModule(name, factory, config);
                startLoadModName = null;
                startLoadModTime = 0;
            } else {
                // 其他浏览器 onload 时，关联模块名与模块定义
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
            Utils.registerModule(name, factory, config);
        }
    };

    // oldIE 特有，找到当前正在交互的脚本，根据脚本名确定模块名
    // 如果找不到，返回发送前那个脚本
    function findModuleNameByInteractive() {
        var scripts = document.getElementsByTagName('script'),
            re,
            i,
            name,
            script;

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
                            Utils.registerModule(mod.name, Utils.noop);
                            // notify all loader instance
                            mod.flush();
                        });
                    });

                    each(error, function (one) {
                        each(one.mods, function (mod) {
                            var msg = mod.name + ' is not loaded! can not find module in url : ' + one.url;
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
                                    ' is not loaded! can not find module in url : ' +
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
        calculate: function (modNames, errorList, stack, cache, ret) {
            if (!modNames.length) {
                return [];
            }

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
            if ('@DEBUG@') {
                stackDepth = stack.length;
            }
            for (i = 0; i < modNames.length; i++) {
                m = modNames[i];
                if (cache[m]) {
                    continue;
                }
                mod = Utils.getOrCreateModuleInfo(m);
                modStatus = mod.status;
                if (modStatus === Status.ERROR) {
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

                if ('@DEBUG@' && stack.indexOf) {
                    if (stack.indexOf(m) !== -1) {
                        S.log('find cyclic dependency between mods: ' + stack, 'warn');
                        cache[m] = 1;
                        continue;
                    } else {
                        stack.push(m);
                    }
                }

                self.calculate(mod.getNormalizedRequires(), errorList, stack, cache, ret);
                cache[m] = 1;
            }

            if ('@DEBUG@') {
                stack.length = stackDepth;
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
                packageBase = packageInfo.getBase();
                packageName = packageInfo.name;
                charset = packageInfo.getCharset();
                tag = packageInfo.getTag();
                group = packageInfo.getGroup();

                if (packageInfo.isCombine() && group) {
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
                maxFileNum = Config.comboMaxFileNum,
                maxUrlLength = Config.comboMaxUrlLength;

            var comboMods = this.getComboMods(mods);

            var comboRes = {};

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
                    if (!currentMod.getPackage().isCombine() ||
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
                if (status >= Status.LOADED || status === Status.ERROR) {
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
    var Loader = S.Loader,
        Env = S.Env,
        Utils = Loader.Utils,
        ComboLoader = Loader.ComboLoader;
    var logger = S.getLogger('s/loader');
    var mods = Env.mods = {};

    Utils.mix(S, {
        getModule: function (modName) {
            return Utils.getOrCreateModuleInfo(modName);
        },

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
            var normalizedModNames,
                loader,
                error,
                tryCount = 0;

            if (typeof success === 'object') {
                //noinspection JSUnresolvedVariable
                error = success.error;
                //noinspection JSUnresolvedVariable
                success = success.success;
            }

            modNames = Utils.getModNamesAsArray(modNames);
            modNames = Utils.normalizeModNamesWithAlias(modNames);

            normalizedModNames = Utils.unalias(modNames);

            var unloadedModNames = normalizedModNames;

            function loadReady() {
                ++tryCount;
                var errorList = [],
                    start;

                if ('@DEBUG@') {
                    start = +new Date();
                }

                var unloadedMods = loader.calculate(unloadedModNames, errorList);
                var unloadModsLen = unloadedMods.length;
                logger.debug(tryCount + ' check duration ' + (+new Date() - start));
                if (errorList.length) {
                    if (error) {
                        try {
                            error.apply(S, errorList);
                        } catch (e) {
                            S.log(e.stack || e, 'error');
                            /*jshint loopfunc:true*/
                            setTimeout(function () {
                                throw e;
                            }, 0);
                        }
                    }
                    S.log(errorList, 'error');
                    S.log('loader: load above modules error', 'error');
                } else if (loader.isCompleteLoading()) {
                    Utils.attachModsRecursively(normalizedModNames);
                    if (success) {
                        try {
                            success.apply(S, Utils.getModules(modNames));
                        } catch (e) {
                            S.log(e.stack || e, 'error');
                            /*jshint loopfunc:true*/
                            setTimeout(function () {
                                throw e;
                            }, 0);
                        }
                    }
                } else {
                    // in case all of its required mods is loading by other loaders
                    loader.callback = loadReady;
                    if (unloadModsLen) {
                        logger.debug(tryCount + ' reload ');
                        unloadedModNames = [];
                        for (var i = 0; i < unloadModsLen; i++) {
                            unloadedModNames.push(unloadedMods[i].name);
                        }
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
         * @param {String} refName internal usage
         * @member KISSY
         * @return {*} exports of specified module
         */
        require: function (moduleName, refName) {
            moduleName = Utils.normalizePath(refName, moduleName);
            // cache module read
            if (mods[moduleName] && mods[moduleName].status === Loader.Status.ATTACHED) {
                return mods[moduleName].exports;
            }
            var moduleNames = Utils.normalizeModNames([moduleName], refName);
            Utils.attachModsRecursively(moduleNames);
            return Utils.getModules(moduleNames)[1];
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
    var doc = S.Env.host && S.Env.host.document;
    // var logger = S.getLogger('s/loader');
    var Utils = S.Loader.Utils;
    var TIMESTAMP = '20140429151359';
    var defaultComboPrefix = '??';
    var defaultComboSep = ',';

    function returnJson(s) {
        /*jshint evil:true*/
        return (new Function('return ' + s))();
    }

    var baseReg = /^(.*)(seed|loader)(?:-debug)?\.js[^/]*/i,
        baseTestReg = /(seed|loader)(?:-debug)?\.js/i;

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
        lang: 'zh-cn'
    });
    S.config('packages', {
        core: {
            filter: '@DEBUG@' ? 'debug' : ''
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
})(KISSY);/**
 * @ignore
 * implement getScript for nodejs synchronously.
 * so loader need not to be changed.
 * @author yiminghe@gmail.com
 */
(function (S) {
    /*global require*/
    var fs = require('fs'),
        Utils = S.Loader.Utils,
        vm = require('vm');

    S.getScript = function (url, success, charset) {
        var error;

        if (typeof success === 'object') {
            charset = success.charset;
            error = success.error;
            success = success.success;
        }

        if (Utils.endsWith(url, '.css')) {
            S.log('node js can not load css: ' + url, 'warn');
            if (success) {
                success();
            }
            return;
        }

        try {
            // async is controlled by async option in use
            // sync load in getScript, same as cached load in browser environment
            var mod = fs.readFileSync(url, charset);
            // code in runInThisContext unlike eval can not access local scope
            //noinspection JSUnresolvedFunction
            // use path, or else use url will error in nodejs debug mode
            var factory = vm.runInThisContext('(function(KISSY,requireNode){' + mod + '})', url);

            factory(S, function (moduleName) {
                return require(Utils.normalizePath(url, moduleName));
            });

            if (success) {
                success();
            }
        } catch (e) {
            S.log('in file: ' + url, 'error');
            S.log(e.stack, 'error');
            if (error) {
                error(e);
            }
        }
    };

    S.KISSY = S;

    /*global module*/
    if (typeof module !== 'undefined') {
        module.exports = S;
    }

    S.config({
        charset: 'utf-8',
        /*global __dirname*/
        base: __dirname.replace(/\\/g, '/').replace(/\/$/, '') + '/'
    });

    // require synchronously in node js
    S.nodeRequire = function (modName) {
        var ret = [];
        if (typeof modName === 'string' && modName.indexOf(',') !== -1) {
            modName = modName.split(',');
        }
        S.use(modName, {
            success: function () {
                ret = [].slice.call(arguments, 1);
            },
            sync: true
        });
        return typeof modName === 'string' ? ret[0] : ret;
    };

    S.config('packages', {
        core: {
            filter: ''
        }
    });
})(KISSY);/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 29 15:14
*/
/*
combined modules:
util
util/array
util/escape
util/function
util/object
util/string
util/type
util/web
*/
/**
 * @ignore
 * lang
 * @author  yiminghe@gmail.com
 *
 */
KISSY.add('util', [
    'util/array',
    'util/escape',
    'util/function',
    'util/object',
    'util/string',
    'util/type',
    'util/web'
], function (S, require) {
    var FALSE = false, CLONE_MARKER = '__~ks_cloned';
    S.mix = function (to, from) {
        for (var i in from) {
            to[i] = from[i];
        }
        return to;
    };
    require('util/array');
    require('util/escape');
    require('util/function');
    require('util/object');
    require('util/string');
    require('util/type');
    require('util/web');
    S.mix(S, {
        /**
         * Creates a deep copy of a plain object or array. Others are returned untouched.
         * @param input
         * @member KISSY
         * @param {Function} [filter] filter function
         * @return {Object} the new cloned object
         * refer: http://www.w3.org/TR/html5/common-dom-interfaces.html#safe-passing-of-structured-data
         */
        clone: function (input, filter) {
            // 稍微改改就和规范一样了 :)
            // Let memory be an association list of pairs of objects,
            // initially empty. This is used to handle duplicate references.
            // In each pair of objects, one is called the source object
            // and the other the destination object.
            var memory = {}, ret = cloneInternal(input, filter, memory);
            S.each(memory, function (v) {
                // 清理在源对象上做的标记
                v = v.input;
                if (v[CLONE_MARKER]) {
                    try {
                        delete v[CLONE_MARKER];
                    } catch (e) {
                        v[CLONE_MARKER] = undefined;
                    }
                }
            });
            memory = null;
            return ret;
        }
    });
    function cloneInternal(input, f, memory) {
        var destination = input, isArray, isPlainObject, k, stamp;
        if (!input) {
            return destination;
        }    // If input is the source object of a pair of objects in memory,
             // then return the destination object in that pair of objects .
             // and abort these steps.
        // If input is the source object of a pair of objects in memory,
        // then return the destination object in that pair of objects .
        // and abort these steps.
        if (input[CLONE_MARKER]) {
            // 对应的克隆后对象
            return memory[input[CLONE_MARKER]].destination;
        } else if (typeof input === 'object') {
            // 引用类型要先记录
            var Constructor = input.constructor;
            if (S.inArray(Constructor, [
                    Boolean,
                    String,
                    Number,
                    Date,
                    RegExp
                ])) {
                destination = new Constructor(input.valueOf());
            } else if (isArray = S.isArray(input)) {
                // ImageData , File, Blob , FileList .. etc
                destination = f ? S.filter(input, f) : input.concat();
            } else if (isPlainObject = S.isPlainObject(input)) {
                destination = {};
            }    // Add a mapping from input (the source object)
                 // to output (the destination object) to memory.
                 // 做标记
                 // stamp can not be
            // Add a mapping from input (the source object)
            // to output (the destination object) to memory.
            // 做标记
            // stamp can not be
            input[CLONE_MARKER] = stamp = S.guid('c');    // 存储源对象以及克隆后的对象
            // 存储源对象以及克隆后的对象
            memory[stamp] = {
                destination: destination,
                input: input
            };
        }    // If input is an Array object or an Object object,
             // then, for each enumerable property in input,
             // add a new property to output having the same name,
             // and having a value created from invoking the internal structured cloning algorithm recursively
             // with the value of the property as the 'input' argument and memory as the 'memory' argument.
             // The order of the properties in the input and output objects must be the same.
             // clone it
        // If input is an Array object or an Object object,
        // then, for each enumerable property in input,
        // add a new property to output having the same name,
        // and having a value created from invoking the internal structured cloning algorithm recursively
        // with the value of the property as the 'input' argument and memory as the 'memory' argument.
        // The order of the properties in the input and output objects must be the same.
        // clone it
        if (isArray) {
            for (var i = 0; i < destination.length; i++) {
                destination[i] = cloneInternal(destination[i], f, memory);
            }
        } else if (isPlainObject) {
            for (k in input) {
                if (k !== CLONE_MARKER && (!f || f.call(input, input[k], k, input) !== FALSE)) {
                    destination[k] = cloneInternal(input[k], f, memory);
                }
            }
        }
        return destination;
    }
    return S;
});
/**
 * @ignore
 * array utilities of lang
 * @author yiminghe@gmail.com
 *
 */
KISSY.add('util/array', [], function (S) {
    var TRUE = true, undef, AP = Array.prototype, indexOf = AP.indexOf, lastIndexOf = AP.lastIndexOf, filter = AP.filter, every = AP.every, some = AP.some, map = AP.map, FALSE = false;
    S.mix(S, {
        /**
         * Search for a specified value within an array.
         * @param item individual item to be searched
         * @method
         * @member KISSY
         * @param {Array} arr the array of items where item will be search
         * @return {number} item's index in array
         */
        indexOf: indexOf ? function (item, arr, fromIndex) {
            return fromIndex === undef ? indexOf.call(arr, item) : indexOf.call(arr, item, fromIndex);
        } : function (item, arr, fromIndex) {
            for (var i = fromIndex || 0, len = arr.length; i < len; ++i) {
                if (arr[i] === item) {
                    return i;
                }
            }
            return -1;
        },
        /**
         * Returns the index of the last item in the array
         * that contains the specified value, -1 if the
         * value isn't found.
         * @method
         * @param item individual item to be searched
         * @param {Array} arr the array of items where item will be search
         * @return {number} item's last index in array
         * @member KISSY
         */
        lastIndexOf: lastIndexOf ? function (item, arr, fromIndex) {
            return fromIndex === undef ? lastIndexOf.call(arr, item) : lastIndexOf.call(arr, item, fromIndex);
        } : function (item, arr, fromIndex) {
            if (fromIndex === undef) {
                fromIndex = arr.length - 1;
            }
            for (var i = fromIndex; i >= 0; i--) {
                if (arr[i] === item) {
                    break;
                }
            }
            return i;
        },
        /**
         * Returns a copy of the array with the duplicate entries removed
         * @param a {Array} the array to find the subset of unique for
         * @param [override] {Boolean} if override is TRUE, S.unique([a, b, a]) => [b, a].
         * if override is FALSE, S.unique([a, b, a]) => [a, b]
         * @return {Array} a copy of the array with duplicate entries removed
         * @member KISSY
         */
        unique: function (a, override) {
            var b = a.slice();
            if (override) {
                b.reverse();
            }
            var i = 0, n, item;
            while (i < b.length) {
                item = b[i];
                while ((n = S.lastIndexOf(item, b)) !== i) {
                    b.splice(n, 1);
                }
                i += 1;
            }
            if (override) {
                b.reverse();
            }
            return b;
        },
        /**
         * Search for a specified value index within an array.
         * @param item individual item to be searched
         * @param {Array} arr the array of items where item will be search
         * @return {Boolean} the item exists in arr
         * @member KISSY
         */
        inArray: function (item, arr) {
            return S.indexOf(item, arr) > -1;
        },
        /**
         * Executes the supplied function on each item in the array.
         * Returns a new array containing the items that the supplied
         * function returned TRUE for.
         * @member KISSY
         * @method
         * @param arr {Array} the array to iterate
         * @param fn {Function} the function to execute on each item
         * @param [context] {Object} optional context object
         * @return {Array} The items on which the supplied function returned TRUE.
         * If no items matched an empty array is returned.
         */
        filter: filter ? function (arr, fn, context) {
            return filter.call(arr, fn, context || this);
        } : function (arr, fn, context) {
            var ret = [];
            S.each(arr, function (item, i, arr) {
                if (fn.call(context || this, item, i, arr)) {
                    ret.push(item);
                }
            });
            return ret;
        },
        /**
         * Executes the supplied function on each item in the array.
         * Returns a new array containing the items that the supplied
         * function returned for.
         * @method
         * @param arr {Array} the array to iterate
         * @param fn {Function} the function to execute on each item
         * @param [context] {Object} optional context object
         * refer: https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/map
         * @return {Array} The items on which the supplied function returned
         * @member KISSY
         */
        map: map ? function (arr, fn, context) {
            return map.call(arr, fn, context || this);
        } : function (arr, fn, context) {
            var len = arr.length, res = new Array(len);
            for (var i = 0; i < len; i++) {
                var el = typeof arr === 'string' ? arr.charAt(i) : arr[i];
                if (el || //ie<9 in invalid when typeof arr == string
                    i in arr) {
                    res[i] = fn.call(context || this, el, i, arr);
                }
            }
            return res;
        },
        /**
         * Executes the supplied function on each item in the array.
         * Returns a value which is accumulation of the value that the supplied
         * function returned.
         *
         * @param arr {Array} the array to iterate
         * @param callback {Function} the function to execute on each item
         * @param initialValue {number} optional context object
         * refer: https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/reduce
         * @return {Array} The items on which the supplied function returned
         * @member KISSY
         */
        reduce: function (arr, callback, initialValue) {
            var len = arr.length;
            if (typeof callback !== 'function') {
                throw new TypeError('callback is not function!');
            }    // no value to return if no initial value and an empty array
            // no value to return if no initial value and an empty array
            if (len === 0 && arguments.length === 2) {
                throw new TypeError('arguments invalid');
            }
            var k = 0;
            var accumulator;
            if (arguments.length >= 3) {
                accumulator = initialValue;
            } else {
                do {
                    if (k in arr) {
                        accumulator = arr[k++];
                        break;
                    }    // if array contains no values, no initial value to return
                    // if array contains no values, no initial value to return
                    k += 1;
                    if (k >= len) {
                        throw new TypeError();
                    }
                } while (TRUE);
            }
            while (k < len) {
                if (k in arr) {
                    accumulator = callback.call(undef, accumulator, arr[k], k, arr);
                }
                k++;
            }
            return accumulator;
        },
        /**
         * Tests whether all elements in the array pass the test implemented by the provided function.
         * @method
         * @param arr {Array} the array to iterate
         * @param callback {Function} the function to execute on each item
         * @param [context] {Object} optional context object
         * @member KISSY
         * @return {Boolean} whether all elements in the array pass the test implemented by the provided function.
         */
        every: every ? function (arr, fn, context) {
            return every.call(arr, fn, context || this);
        } : function (arr, fn, context) {
            var len = arr && arr.length || 0;
            for (var i = 0; i < len; i++) {
                if (i in arr && !fn.call(context, arr[i], i, arr)) {
                    return FALSE;
                }
            }
            return TRUE;
        },
        /**
         * Tests whether some element in the array passes the test implemented by the provided function.
         * @method
         * @param arr {Array} the array to iterate
         * @param callback {Function} the function to execute on each item
         * @param [context] {Object} optional context object
         * @member KISSY
         * @return {Boolean} whether some element in the array passes the test implemented by the provided function.
         */
        some: some ? function (arr, fn, context) {
            return some.call(arr, fn, context || this);
        } : function (arr, fn, context) {
            var len = arr && arr.length || 0;
            for (var i = 0; i < len; i++) {
                if (i in arr && fn.call(context, arr[i], i, arr)) {
                    return TRUE;
                }
            }
            return FALSE;
        },
        /**
         * Converts object to a TRUE array.
         * // do not pass form.elements to this function ie678 bug
         * @param o {object|Array} array like object or array
         * @return {Array} native Array
         * @member KISSY
         */
        makeArray: function (o) {
            if (o == null) {
                return [];
            }
            if (S.isArray(o)) {
                return o;
            }
            var lengthType = typeof o.length, oType = typeof o;    // The strings and functions also have 'length'
            // The strings and functions also have 'length'
            if (lengthType !== 'number' || // select element
                // https://github.com/kissyteam/kissy/issues/537
                typeof o.nodeName === 'string' || // window
                /*jshint eqeqeq:false*/
                o != null && o == o.window || oType === 'string' || // https://github.com/ariya/phantomjs/issues/11478
                oType === 'function' && !('item' in o && lengthType === 'number')) {
                return [o];
            }
            var ret = [];
            for (var i = 0, l = o.length; i < l; i++) {
                ret[i] = o[i];
            }
            return ret;
        }
    });
});
/**
 * @ignore
 * escape of lang
 * @author yiminghe@gmail.com
 *
 */
KISSY.add('util/escape', [], function (S) {
    // IE doesn't include non-breaking-space (0xa0) in their \s character
    // class (as required by section 7.2 of the ECMAScript spec), we explicitly
    // include it in the regexp to enforce consistent cross-browser behavior.
    var EMPTY = '',
        // FALSE = false,
        // http://www.owasp.org/index.php/XSS_(Cross_Site_Scripting)_Prevention_Cheat_Sheet
        // http://wonko.com/post/html-escaping
        htmlEntities = {
            '&amp;': '&',
            '&gt;': '>',
            '&lt;': '<',
            '&#x60;': '`',
            '&#x2F;': '/',
            '&quot;': '"',
            /*jshint quotmark:false*/
            '&#x27;': '\''
        }, reverseEntities = {}, escapeHtmlReg, unEscapeHtmlReg, possibleEscapeHtmlReg = /[&<>"'`]/,
        // - # $ ^ * ( ) + [ ] { } | \ , . ?
        escapeRegExp = /[\-#$\^*()+\[\]{}|\\,.?\s]/g;
    (function () {
        for (var k in htmlEntities) {
            reverseEntities[htmlEntities[k]] = k;
        }
    }());
    escapeHtmlReg = getEscapeReg();
    unEscapeHtmlReg = getUnEscapeReg();
    function getEscapeReg() {
        var str = EMPTY;
        for (var e in htmlEntities) {
            var entity = htmlEntities[e];
            str += entity + '|';
        }
        str = str.slice(0, -1);
        escapeHtmlReg = new RegExp(str, 'g');
        return escapeHtmlReg;
    }
    function getUnEscapeReg() {
        var str = EMPTY;
        for (var e in reverseEntities) {
            var entity = reverseEntities[e];
            str += entity + '|';
        }
        str += '&#(\\d{1,5});';
        unEscapeHtmlReg = new RegExp(str, 'g');
        return unEscapeHtmlReg;
    }
    S.mix(S, {
        /**
         * get escaped string from html.
         * only escape
         *      & > < ` / " '
         * refer:
         *
         * [http://yiminghe.javaeye.com/blog/788929](http://yiminghe.javaeye.com/blog/788929)
         *
         * [http://wonko.com/post/html-escaping](http://wonko.com/post/html-escaping)
         * @param str {string} text2html show
         * @member KISSY
         * @return {String} escaped html
         */
        escapeHtml: function (str) {
            if (!str && str !== 0) {
                return '';
            }
            str = '' + str;
            if (!possibleEscapeHtmlReg.test(str)) {
                return str;
            }
            return (str + '').replace(escapeHtmlReg, function (m) {
                return reverseEntities[m];
            });
        },
        /**
         * get escaped regexp string for construct regexp.
         * @param str
         * @member KISSY
         * @return {String} escaped regexp
         */
        escapeRegExp: function (str) {
            return str.replace(escapeRegExp, '\\$&');
        },
        /**
         * un-escape html to string.
         * only unescape
         *      &amp; &lt; &gt; &#x60; &#x2F; &quot; &#x27; &#\d{1,5}
         * @param str {string} html2text
         * @member KISSY
         * @return {String} un-escaped html
         */
        unEscapeHtml: function (str) {
            return str.replace(unEscapeHtmlReg, function (m, n) {
                return htmlEntities[m] || String.fromCharCode(+n);
            });
        }
    });
    S.escapeHTML = S.escapeHtml;
    S.unEscapeHTML = S.unEscapeHtml;
});
/**
 * @ignore
 * function utilities of lang
 * @author yiminghe@gmail.com
 *
 */
KISSY.add('util/function', [], function (S) {
    // ios Function.prototype.bind === undefine
    function bindFn(r, fn, obj) {
        function FNOP() {
        }
        var slice = [].slice, args = slice.call(arguments, 3), bound = function () {
                var inArgs = slice.call(arguments);
                return fn.apply(this instanceof FNOP ? this : // fix: y.x=S.bind(fn);
                obj || this, r ? inArgs.concat(args) : args.concat(inArgs));
            };
        FNOP.prototype = fn.prototype;
        bound.prototype = new FNOP();
        return bound;
    }
    S.mix(S, {
        /**
         * empty function
         * @member KISSY
         */
        noop: function () {
        },
        /**
         * Creates a new function that, when called, itself calls this function in the context of the provided this value,
         * with a given sequence of arguments preceding any provided when the new function was called.
         * refer: https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
         * @param {Function} fn internal called function
         * @param {Object} obj context in which fn runs
         * @param {*...} var_args extra arguments
         * @member KISSY
         * @return {Function} new function with context and arguments
         */
        bind: bindFn(0, bindFn, null, 0),
        /**
         * Creates a new function that, when called, itself calls this function in the context of the provided this value,
         * with a given sequence of arguments preceding any provided when the new function was called.
         * refer: https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
         * @param {Function} fn internal called function
         * @param {Object} obj context in which fn runs
         * @param {*...} var_args extra arguments
         * @member KISSY
         * @return {Function} new function with context and arguments
         */
        rbind: bindFn(0, bindFn, null, 1),
        /**
         * Executes the supplied function in the context of the supplied
         * object 'when' milliseconds later. Executes the function a
         * single time unless periodic is set to true.
         *
         * @param fn {Function|String} the function to execute or the name of the method in
         * the 'o' object to execute.
         *
         * @param [when=0] {Number} the number of milliseconds to wait until the fn is executed.
         *
         * @param {Boolean} [periodic] if true, executes continuously at supplied interval
         * until canceled.
         *
         * @param {Object} [context] the context object.
         *
         * @param [data] that is provided to the function. This accepts either a single
         * item or an array. If an array is provided, the function is executed with
         * one parameter for each array item. If you need to pass a single array
         * parameter, it needs to be wrapped in an array.
         *
         * @return {Object} a timer object. Call the cancel() method on this object to stop
         * the timer.
         *
         * @member KISSY
         */
        later: function (fn, when, periodic, context, data) {
            when = when || 0;
            var m = fn, d = S.makeArray(data), f, r;
            if (typeof fn === 'string') {
                m = context[fn];
            }
            if (!m) {
                S.error('method undefine');
            }
            f = function () {
                m.apply(context, d);
            };
            r = periodic ? setInterval(f, when) : setTimeout(f, when);
            return {
                id: r,
                interval: periodic,
                cancel: function () {
                    if (this.interval) {
                        clearInterval(r);
                    } else {
                        clearTimeout(r);
                    }
                }
            };
        },
        /**
         * Throttles a call to a method based on the time between calls.
         * @param {Function} fn The function call to throttle.
         * @param {Object} [context] context fn to run
         * @param {Number} [ms] The number of milliseconds to throttle the method call.
         * Passing a -1 will disable the throttle. Defaults to 150.
         * @return {Function} Returns a wrapped function that calls fn throttled.
         * @member KISSY
         */
        throttle: function (fn, ms, context) {
            ms = ms || 150;
            if (ms === -1) {
                return function () {
                    fn.apply(context || this, arguments);
                };
            }
            var last = S.now();
            return function () {
                var now = S.now();
                if (now - last > ms) {
                    last = now;
                    fn.apply(context || this, arguments);
                }
            };
        },
        /**
         * buffers a call between a fixed time
         * @param {Function} fn
         * @param {Number} ms
         * @param {Object} [context]
         * @return {Function} Returns a wrapped function that calls fn buffered.
         * @member KISSY
         */
        buffer: function (fn, ms, context) {
            ms = ms || 150;
            if (ms === -1) {
                return function () {
                    fn.apply(context || this, arguments);
                };
            }
            var bufferTimer = null;
            function f() {
                f.stop();
                bufferTimer = S.later(fn, ms, 0, context || this, arguments);
            }
            f.stop = function () {
                if (bufferTimer) {
                    bufferTimer.cancel();
                    bufferTimer = 0;
                }
            };
            return f;
        }
    });
});
/**
 * @ignore
 * object utilities of lang
 * @author yiminghe@gmail.com
 *
 */
KISSY.add('util/object', [], function (S) {
    var undef;
    var logger = S.getLogger('s/util');
    var MIX_CIRCULAR_DETECTION = '__MIX_CIRCULAR', STAMP_MARKER = '__~ks_stamped', host = S.Env.host, TRUE = true, EMPTY = '', toString = {}.toString, Obj = Object, objectCreate = Obj.create;    // error in native ie678, not in simulated ie9
    // error in native ie678, not in simulated ie9
    var hasEnumBug = !{ toString: 1 }.propertyIsEnumerable('toString'), enumProperties = [
            'constructor',
            'hasOwnProperty',
            'isPrototypeOf',
            'propertyIsEnumerable',
            'toString',
            'toLocaleString',
            'valueOf'
        ];
    mix(S, {
        /**
         * Get all the property names of o as array
         * @param {Object} o
         * @return {Array}
         * @member KISSY
         */
        keys: Object.keys || function (o) {
            var result = [], p, i;
            for (p in o) {
                // S.keys(new XX())
                if (o.hasOwnProperty(p)) {
                    result.push(p);
                }
            }
            if (hasEnumBug) {
                for (i = enumProperties.length - 1; i >= 0; i--) {
                    p = enumProperties[i];
                    if (o.hasOwnProperty(p)) {
                        result.push(p);
                    }
                }
            }
            return result;
        },
        /**
         * Executes the supplied function on each item in the array.
         * @param object {Object} the object to iterate
         * @param fn {Function} the function to execute on each item. The function
         *        receives three arguments: the value, the index, the full array.
         * @param {Object} [context]
         * @member KISSY
         */
        each: function (object, fn, context) {
            if (object) {
                var key, val, keys, i = 0, length = object && object.length,
                    // do not use typeof obj == 'function': bug in phantomjs
                    isObj = length === undef || toString.call(object) === '[object Function]';
                context = context || null;
                if (isObj) {
                    keys = S.keys(object);
                    for (; i < keys.length; i++) {
                        key = keys[i];    // can not use hasOwnProperty
                        // can not use hasOwnProperty
                        if (fn.call(context, object[key], key, object) === false) {
                            break;
                        }
                    }
                } else {
                    for (val = object[0]; i < length; val = object[++i]) {
                        if (fn.call(context, val, i, object) === false) {
                            break;
                        }
                    }
                }
            }
            return object;
        },
        /**
         * Gets current date in milliseconds.
         * @method
         * refer:  https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Date/now
         * http://j-query.blogspot.com/2011/02/timing-ecmascript-5-datenow-function.html
         * http://kangax.github.com/es5-compat-table/
         * @member KISSY
         * @return {Number} current time
         */
        now: Date.now || function () {
            return +new Date();
        },
        isArray: function (obj) {
            return toString.call(obj) === '[object Array]';
        },
        /**
         * Checks to see if an object is empty.
         * @member KISSY
         */
        isEmptyObject: function (o) {
            for (var p in o) {
                if (p !== undef) {
                    return false;
                }
            }
            return true;
        },
        /**
         * stamp a object by guid
         * @param {Object} o object needed to be stamped
         * @param {Boolean} [readOnly] while set marker on o if marker does not exist
         * @param {String} [marker] the marker will be set on Object
         * @return {String} guid associated with this object
         * @member KISSY
         */
        stamp: function (o, readOnly, marker) {
            marker = marker || STAMP_MARKER;
            var guid = o[marker];
            if (guid) {
                return guid;
            } else if (!readOnly) {
                try {
                    guid = o[marker] = S.guid(marker);
                } catch (e) {
                    guid = undef;
                }
            }
            return guid;
        },
        /**
         * Copies all the properties of s to r.
         * @method
         * @param {Object} r the augmented object
         * @param {Object} s the object need to augment
         * @param {Boolean|Object} [ov=true] whether overwrite existing property or config.
         * @param {Boolean} [ov.overwrite=true] whether overwrite existing property.
         * @param {String[]|Function} [ov.whitelist] array of white-list properties
         * @param {Boolean}[ov.deep=false] whether recursive mix if encounter object.
         * @param {String[]|Function} [wl] array of white-list properties
         * @param [deep=false] {Boolean} whether recursive mix if encounter object.
         * @return {Object} the augmented object
         * @member KISSY
         *
         * for example:
         *     @example
         *     var t = {};
         *     S.mix({x: {y: 2, z: 4}}, {x: {y: 3, a: t}}, {deep: TRUE}) => {x: {y: 3, z: 4, a: {}}}, a !== t
         *     S.mix({x: {y: 2, z: 4}}, {x: {y: 3, a: t}}, {deep: TRUE, overwrite: false}) => {x: {y: 2, z: 4, a: {}}}, a !== t
         *     S.mix({x: {y: 2, z: 4}}, {x: {y: 3, a: t}}, 1) => {x: {y: 3, a: t}}
         */
        mix: function (r, s, ov, wl, deep) {
            if (typeof ov === 'object') {
                wl = /**
                 @ignore
                 @type {String[]|Function}
                 */
                ov.whitelist;
                deep = ov.deep;
                ov = ov.overwrite;
            }
            if (wl && typeof wl !== 'function') {
                var originalWl = wl;
                wl = function (name, val) {
                    return S.inArray(name, originalWl) ? val : undef;
                };
            }
            if (ov === undef) {
                ov = TRUE;
            }
            var cache = [], c, i = 0;
            mixInternal(r, s, ov, wl, deep, cache);
            while (c = cache[i++]) {
                delete c[MIX_CIRCULAR_DETECTION];
            }
            return r;
        },
        /**
         * Returns a new object containing all of the properties of
         * all the supplied objects. The properties from later objects
         * will overwrite those in earlier objects. Passing in a
         * single object will create a shallow copy of it.
         * @param {...Object} varArgs objects need to be merged
         * @return {Object} the new merged object
         * @member KISSY
         */
        merge: function (varArgs) {
            varArgs = S.makeArray(arguments);
            var o = {}, i, l = varArgs.length;
            for (i = 0; i < l; i++) {
                S.mix(o, varArgs[i]);
            }
            return o;
        },
        /**
         * Applies prototype properties from the supplier to the receiver.
         * @param   {Object} r received object
         * @param   {...Object} varArgs object need to  augment
         *          {Boolean} [ov=TRUE] whether overwrite existing property
         *          {String[]} [wl] array of white-list properties
         * @return  {Object} the augmented object
         * @member KISSY
         */
        augment: function (r, varArgs) {
            var args = S.makeArray(arguments), len = args.length - 2, i = 1, proto, arg, ov = args[len], wl = args[len + 1];
            args[1] = varArgs;
            if (!S.isArray(wl)) {
                ov = wl;
                wl = undef;
                len++;
            }
            if (typeof ov !== 'boolean') {
                ov = undef;
                len++;
            }
            for (; i < len; i++) {
                arg = args[i];
                if (proto = arg.prototype) {
                    arg = S.mix({}, proto, true, removeConstructor);
                }
                S.mix(r.prototype, arg, ov, wl);
            }
            return r;
        },
        /**
         * Utility to set up the prototype, constructor and superclass properties to
         * support an inheritance strategy that can chain constructors and methods.
         * Static members will not be inherited.
         * @param r {Function} the object to modify
         * @param s {Function} the object to inherit
         * @param {Object} [px] prototype properties to add/override
         * @param {Object} [sx] static properties to add/override
         * @return r {Object}
         * @member KISSY
         */
        extend: function (r, s, px, sx) {
            if ('@DEBUG@') {
                if (!r) {
                    logger.error('extend r is null');
                }
                if (!s) {
                    logger.error('extend s is null');
                }
                if (!s || !r) {
                    return r;
                }
            }
            var sp = s.prototype, rp;    // in case parent does not set constructor
                                         // eg: parent.prototype={};
            // in case parent does not set constructor
            // eg: parent.prototype={};
            sp.constructor = s;    // add prototype chain
            // add prototype chain
            rp = createObject(sp, r);
            r.prototype = S.mix(rp, r.prototype);
            r.superclass = sp;    // add prototype overrides
            // add prototype overrides
            if (px) {
                S.mix(rp, px);
            }    // add object overrides
            // add object overrides
            if (sx) {
                S.mix(r, sx);
            }
            return r;
        },
        /**
         * Returns the namespace specified and creates it if it doesn't exist. Be careful
         * when naming packages. Reserved words may work in some browsers and not others.
         *
         * for example:
         *      @example
         *      S.namespace('KISSY.app'); // returns KISSY.app
         *      S.namespace('app.Shop'); // returns KISSY.app.Shop
         *      S.namespace('TB.app.Shop', TRUE); // returns TB.app.Shop
         *
         * @return {Object}  A reference to the last namespace object created
         * @member KISSY
         */
        namespace: function () {
            var args = S.makeArray(arguments), l = args.length, o = null, i, j, p, global = args[l - 1] === TRUE && l--;
            for (i = 0; i < l; i++) {
                p = (EMPTY + args[i]).split('.');
                o = global ? host : this;
                for (j = host[p[0]] === o ? 1 : 0; j < p.length; ++j) {
                    o = o[p[j]] = o[p[j]] || {};
                }
            }
            return o;
        }
    });
    function Empty() {
    }
    function createObject(proto, constructor) {
        var newProto;
        if (objectCreate) {
            newProto = objectCreate(proto);
        } else {
            Empty.prototype = proto;
            newProto = new Empty();
        }
        newProto.constructor = constructor;
        return newProto;
    }
    function mix(r, s) {
        for (var i in s) {
            r[i] = s[i];
        }
    }
    function mixInternal(r, s, ov, wl, deep, cache) {
        if (!s || !r) {
            return r;
        }
        var i, p, keys, len;    // 记录循环标志
        // 记录循环标志
        s[MIX_CIRCULAR_DETECTION] = r;    // 记录被记录了循环标志的对像
        // 记录被记录了循环标志的对像
        cache.push(s);    // mix all properties
        // mix all properties
        keys = S.keys(s);
        len = keys.length;
        for (i = 0; i < len; i++) {
            p = keys[i];
            if (p !== MIX_CIRCULAR_DETECTION) {
                // no hasOwnProperty judge!
                _mix(p, r, s, ov, wl, deep, cache);
            }
        }
        return r;
    }
    function removeConstructor(k, v) {
        return k === 'constructor' ? undef : v;
    }
    function _mix(p, r, s, ov, wl, deep, cache) {
        // 要求覆盖
        // 或者目的不存在
        // 或者深度mix
        if (ov || !(p in r) || deep) {
            var target = r[p], src = s[p];    // prevent never-end loop
            // prevent never-end loop
            if (target === src) {
                // S.mix({},{x:undef})
                if (target === undef) {
                    r[p] = target;
                }
                return;
            }
            if (wl) {
                src = wl.call(s, p, src);
            }    // 来源是数组和对象，并且要求深度 mix
            // 来源是数组和对象，并且要求深度 mix
            if (deep && src && (S.isArray(src) || S.isPlainObject(src))) {
                if (src[MIX_CIRCULAR_DETECTION]) {
                    r[p] = src[MIX_CIRCULAR_DETECTION];
                } else {
                    // 目标值为对象或数组，直接 mix
                    // 否则 新建一个和源值类型一样的空数组/对象，递归 mix
                    var clone = target && (S.isArray(target) || S.isPlainObject(target)) ? target : S.isArray(src) ? [] : {};
                    r[p] = clone;
                    mixInternal(clone, src, ov, wl, TRUE, cache);
                }
            } else if (src !== undef && (ov || !(p in r))) {
                r[p] = src;
            }
        }
    }
});
/**
 * @ignore
 * string utilities of lang
 * @author yiminghe@gmail.com
 *
 */
KISSY.add('util/string', [], function (S) {
    var undef;
    var logger = S.getLogger('s/util');    // IE doesn't include non-breaking-space (0xa0) in their \s character
                                           // class (as required by section 7.2 of the ECMAScript spec), we explicitly
                                           // include it in the regexp to enforce consistent cross-browser behavior.
    // IE doesn't include non-breaking-space (0xa0) in their \s character
    // class (as required by section 7.2 of the ECMAScript spec), we explicitly
    // include it in the regexp to enforce consistent cross-browser behavior.
    var SUBSTITUTE_REG = /\\?\{([^{}]+)\}/g, EMPTY = '';
    var RE_DASH = /-([a-z])/gi;
    var RE_TRIM = /^[\s\xa0]+|[\s\xa0]+$/g, trim = String.prototype.trim;
    var SEP = '&', EQ = '=', TRUE = true;
    function isValidParamValue(val) {
        var t = typeof val;    // If the type of val is null, undef, number, string, boolean, return TRUE.
        // If the type of val is null, undef, number, string, boolean, return TRUE.
        return val == null || t !== 'object' && t !== 'function';
    }
    function upperCase() {
        return arguments[1].toUpperCase();
    }
    S.mix(S, {
        /**
         * Creates a serialized string of an array or object.
         *
         * for example:
         *     @example
         *     {foo: 1, bar: 2}    // -> 'foo=1&bar=2'
         *     {foo: 1, bar: [2, 3]}    // -> 'foo=1&bar=2&bar=3'
         *     {foo: '', bar: 2}    // -> 'foo=&bar=2'
         *     {foo: undef, bar: 2}    // -> 'foo=undef&bar=2'
         *     {foo: TRUE, bar: 2}    // -> 'foo=TRUE&bar=2'
         *
         * @param {Object} o json data
         * @param {String} [sep='&'] separator between each pair of data
         * @param {String} [eq='='] separator between key and value of data
         * @param {Boolean} [serializeArray=true] whether add '[]' to array key of data
         * @return {String}
         * @member KISSY
         */
        param: function (o, sep, eq, serializeArray) {
            sep = sep || SEP;
            eq = eq || EQ;
            if (serializeArray === undef) {
                serializeArray = TRUE;
            }
            var buf = [], key, i, v, len, val, encode = S.urlEncode;
            for (key in o) {
                val = o[key];
                key = encode(key);    // val is valid non-array value
                // val is valid non-array value
                if (isValidParamValue(val)) {
                    buf.push(key);
                    if (val !== undef) {
                        buf.push(eq, encode(val + EMPTY));
                    }
                    buf.push(sep);
                } else if (S.isArray(val) && val.length) {
                    // val is not empty array
                    for (i = 0, len = val.length; i < len; ++i) {
                        v = val[i];
                        if (isValidParamValue(v)) {
                            buf.push(key, serializeArray ? encode('[]') : EMPTY);
                            if (v !== undef) {
                                buf.push(eq, encode(v + EMPTY));
                            }
                            buf.push(sep);
                        }
                    }
                }    // ignore other cases, including empty array, Function, RegExp, Date etc.
            }
            // ignore other cases, including empty array, Function, RegExp, Date etc.
            buf.pop();
            return buf.join(EMPTY);
        },
        /**
         * Parses a URI-like query string and returns an object composed of parameter/value pairs.
         *
         * for example:
         *      @example
         *      'section=blog&id=45'        // -> {section: 'blog', id: '45'}
         *      'section=blog&tag=js&tag=doc' // -> {section: 'blog', tag: ['js', 'doc']}
         *      'tag=ruby%20on%20rails'        // -> {tag: 'ruby on rails'}
         *      'id=45&raw'        // -> {id: '45', raw: ''}
         * @param {String} str param string
         * @param {String} [sep='&'] separator between each pair of data
         * @param {String} [eq='='] separator between key and value of data
         * @return {Object} json data
         * @member KISSY
         */
        unparam: function (str, sep, eq) {
            if (typeof str !== 'string' || !(str = S.trim(str))) {
                return {};
            }
            sep = sep || SEP;
            eq = eq || EQ;
            var ret = {}, eqIndex, decode = S.urlDecode, pairs = str.split(sep), key, val, i = 0, len = pairs.length;
            for (; i < len; ++i) {
                eqIndex = pairs[i].indexOf(eq);
                if (eqIndex === -1) {
                    key = decode(pairs[i]);
                    val = undef;
                } else {
                    // remember to decode key!
                    key = decode(pairs[i].substring(0, eqIndex));
                    val = pairs[i].substring(eqIndex + 1);
                    try {
                        val = decode(val);
                    } catch (e) {
                        logger.error('decodeURIComponent error : ' + val);
                        logger.error(e);
                    }
                    if (S.endsWith(key, '[]')) {
                        key = key.substring(0, key.length - 2);
                    }
                }
                if (key in ret) {
                    if (S.isArray(ret[key])) {
                        ret[key].push(val);
                    } else {
                        ret[key] = [
                            ret[key],
                            val
                        ];
                    }
                } else {
                    ret[key] = val;
                }
            }
            return ret;
        },
        /**
         * test whether a string start with a specified substring
         * @param {String} str the whole string
         * @param {String} prefix a specified substring
         * @return {Boolean} whether str start with prefix
         * @member KISSY
         */
        startsWith: function (str, prefix) {
            return str.lastIndexOf(prefix, 0) === 0;
        },
        /**
         * test whether a string end with a specified substring
         * @param {String} str the whole string
         * @param {String} suffix a specified substring
         * @return {Boolean} whether str end with suffix
         * @member KISSY
         */
        endsWith: function (str, suffix) {
            var ind = str.length - suffix.length;
            return ind >= 0 && str.indexOf(suffix, ind) === ind;
        },
        /**
         * Removes the whitespace from the beginning and end of a string.
         * @method
         * @member KISSY
         */
        trim: trim ? function (str) {
            return str == null ? EMPTY : trim.call(str);
        } : function (str) {
            return str == null ? EMPTY : (str + '').replace(RE_TRIM, EMPTY);
        },
        /**
         * Call encodeURIComponent to encode a url component
         * @param {String} s part of url to be encoded.
         * @return {String} encoded url part string.
         * @member KISSY
         */
        urlEncode: function (s) {
            return encodeURIComponent(String(s));
        },
        /**
         * Call decodeURIComponent to decode a url component
         * and replace '+' with space.
         * @param {String} s part of url to be decoded.
         * @return {String} decoded url part string.
         * @member KISSY
         */
        urlDecode: function (s) {
            return decodeURIComponent(s.replace(/\+/g, ' '));
        },
        camelCase: function (name) {
            return name.replace(RE_DASH, upperCase);
        },
        /**
         * Substitutes keywords in a string using an object/array.
         * Removes undef keywords and ignores escaped keywords.
         * @param {String} str template string
         * @param {Object} o json data
         * @member KISSY
         * @param {RegExp} [regexp] to match a piece of template string
         */
        substitute: function (str, o, regexp) {
            if (typeof str !== 'string' || !o) {
                return str;
            }
            return str.replace(regexp || SUBSTITUTE_REG, function (match, name) {
                if (match.charAt(0) === '\\') {
                    return match.slice(1);
                }
                return o[name] === undef ? EMPTY : o[name];
            });
        },
        /** uppercase first character.
         * @member KISSY
         * @param s
         * @return {String}
         */
        ucfirst: function (s) {
            s += '';
            return s.charAt(0).toUpperCase() + s.substring(1);
        }
    });
});
/**
 * @ignore
 * type judgement
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 *
 */
KISSY.add('util/type', [], function (S) {
    // [[Class]] -> type pairs
    var class2type = {}, FALSE = false, undef, noop = S.noop, OP = Object.prototype, toString = OP.toString;
    function hasOwnProperty(o, p) {
        return OP.hasOwnProperty.call(o, p);
    }
    S.mix(S, {
        /**
         * Determine the internal JavaScript [[Class]] of an object.
         * @member KISSY
         */
        type: function (o) {
            return o == null ? String(o) : class2type[toString.call(o)] || 'object';
        },
        /**
         * Checks to see if an object is a plain object (created using '{}'
         * or 'new Object()' but not 'new FunctionClass()').
         * @member KISSY
         */
        isPlainObject: function (obj) {
            // Must be an Object.
            // Because of IE, we also have to check the presence of the constructor property.
            // Make sure that Dom nodes and window objects don't pass through, as well
            if (!obj || S.type(obj) !== 'object' || obj.nodeType || /*jshint eqeqeq:false*/
                // must == for ie8
                obj.window == obj) {
                return FALSE;
            }
            var key, objConstructor;
            try {
                // Not own constructor property must be Object
                if ((objConstructor = obj.constructor) && !hasOwnProperty(obj, 'constructor') && !hasOwnProperty(objConstructor.prototype, 'isPrototypeOf')) {
                    return FALSE;
                }
            } catch (e) {
                // IE8,9 Will throw exceptions on certain host objects
                return FALSE;
            }    // Own properties are enumerated firstly, so to speed up,
                 // if last one is own, then all properties are own.
                 /*jshint noempty:false*/
            // Own properties are enumerated firstly, so to speed up,
            // if last one is own, then all properties are own.
            /*jshint noempty:false*/
            for (key in obj) {
            }
            return key === undef || hasOwnProperty(obj, key);
        }
    });
    if ('@DEBUG@') {
        S.mix(S, {
            /**
             * test whether o is boolean
             * @method
             * @param  o
             * @return {Boolean}
             * @member KISSY
             */
            isBoolean: noop,
            /**
             * test whether o is number
             * @method
             * @param  o
             * @return {Boolean}
             * @member KISSY
             */
            isNumber: noop,
            /**
             * test whether o is String
             * @method
             * @param  o
             * @return {Boolean}
             * @member KISSY
             */
            isString: noop,
            /**
             * test whether o is function
             * @method
             * @param  o
             * @return {Boolean}
             * @member KISSY
             */
            isFunction: noop,
            /**
             * test whether o is Array
             * @method
             * @param  o
             * @return {Boolean}
             * @member KISSY
             */
            isArray: noop,
            /**
             * test whether o is Date
             * @method
             * @param  o
             * @return {Boolean}
             * @member KISSY
             */
            isDate: noop,
            /**
             * test whether o is RegExp
             * @method
             * @param  o
             * @return {Boolean}
             * @member KISSY
             */
            isRegExp: noop,
            /**
             * test whether o is Object
             * @method
             * @param  o
             * @return {Boolean}
             * @member KISSY
             */
            isObject: noop
        });
    }
    var types = 'Boolean Number String Function Date RegExp Object Array'.split(' ');
    for (var i = 0; i < types.length; i++) {
        /*jshint loopfunc:true*/
        (function (name, lc) {
            // populate the class2type map
            class2type['[object ' + name + ']'] = lc = name.toLowerCase();    // add isBoolean/isNumber/...
            // add isBoolean/isNumber/...
            S['is' + name] = function (o) {
                return S.type(o) === lc;
            };
        }(types[i], i));
    }
    S.isArray = Array.isArray || S.isArray;
});
/**
 * this code can only run at browser environment
 * @ignore
 * @author lifesinger@gmail.com, yiminghe@gmail.com
 */
KISSY.add('util/web', [], function (S) {
    var logger = S.getLogger('s/web');
    var win = S.Env.host, undef, doc = win.document || {}, docElem = doc.documentElement, EMPTY = '', domReady = 0, callbacks = [],
        // The number of poll times.
        POLL_RETIRES = 500,
        // The poll interval in milliseconds.
        POLL_INTERVAL = 40,
        // #id or id
        RE_ID_STR = /^#?([\w-]+)$/, RE_NOT_WHITESPACE = /\S/, standardEventModel = doc.addEventListener, supportEvent = doc.attachEvent || standardEventModel, DOM_READY_EVENT = 'DOMContentLoaded', READY_STATE_CHANGE_EVENT = 'readystatechange', LOAD_EVENT = 'load', COMPLETE = 'complete', addEventListener = standardEventModel ? function (el, type, fn) {
            el.addEventListener(type, fn, false);
        } : function (el, type, fn) {
            el.attachEvent('on' + type, fn);
        }, removeEventListener = standardEventModel ? function (el, type, fn) {
            el.removeEventListener(type, fn, false);
        } : function (el, type, fn) {
            el.detachEvent('on' + type, fn);
        };
    S.mix(S, {
        /**
         * A crude way of determining if an object is a window
         * @member KISSY
         */
        isWindow: function (obj) {
            // must use == for ie8
            /*jshint eqeqeq:false*/
            return obj != null && obj == obj.window;
        },
        /**
         * get xml representation of data
         * @param {String} data
         * @member KISSY
         */
        parseXML: function (data) {
            // already a xml
            if (data.documentElement) {
                return data;
            }
            var xml;
            try {
                // Standard
                if (win.DOMParser) {
                    xml = new DOMParser().parseFromString(data, 'text/xml');
                } else {
                    // IE
                    /*global ActiveXObject*/
                    xml = new ActiveXObject('Microsoft.XMLDOM');
                    xml.async = false;
                    xml.loadXML(data);
                }
            } catch (e) {
                logger.error('parseXML error :');
                logger.error(e);
                xml = undef;
            }
            if (!xml || !xml.documentElement || xml.getElementsByTagName('parsererror').length) {
                S.error('Invalid XML: ' + data);
            }
            return xml;
        },
        /**
         * Evaluates a script in a global context.
         * @member KISSY
         */
        globalEval: function (data) {
            if (data && RE_NOT_WHITESPACE.test(data)) {
                // http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
                // http://msdn.microsoft.com/en-us/library/ie/ms536420(v=vs.85).aspx always return null
                /*jshint evil:true*/
                if (win.execScript) {
                    win.execScript(data);
                } else {
                    (function (data) {
                        win['eval'].call(win, data);
                    }(data));
                }
            }
        },
        /**
         * Specify a function to execute when the Dom is fully loaded.
         * @param fn {Function} A function to execute after the Dom is ready
         * @chainable
         * @member KISSY
         */
        ready: function (fn) {
            if (domReady) {
                try {
                    fn(S);
                } catch (e) {
                    S.log(e.stack || e, 'error');
                    setTimeout(function () {
                        throw e;
                    }, 0);
                }
            } else {
                callbacks.push(fn);
            }
            return this;
        },
        /**
         * Executes the supplied callback when the item with the supplied id is found.
         * @param id {String} The id of the element, or an array of ids to look for.
         * @param fn {Function} What to execute when the element is found.
         * @member KISSY
         */
        available: function (id, fn) {
            id = (id + EMPTY).match(RE_ID_STR)[1];
            var retryCount = 1;
            var timer = S.later(function () {
                    if (++retryCount > POLL_RETIRES) {
                        timer.cancel();
                        return;
                    }
                    var node = doc.getElementById(id);
                    if (node) {
                        fn(node);
                        timer.cancel();
                    }
                }, POLL_INTERVAL, true);
        }
    });
    function fireReady() {
        if (domReady) {
            return;
        }    // nodejs
        // nodejs
        if (win && win.setTimeout) {
            removeEventListener(win, LOAD_EVENT, fireReady);
        }
        domReady = 1;
        for (var i = 0; i < callbacks.length; i++) {
            try {
                callbacks[i](S);
            } catch (e) {
                S.log(e.stack || e, 'error');    /*jshint loopfunc:true*/
                /*jshint loopfunc:true*/
                setTimeout(function () {
                    throw e;
                }, 0);
            }
        }
    }    //  Binds ready events.
    //  Binds ready events.
    function bindReady() {
        // Catch cases where ready() is called after the
        // browser event has already occurred.
        if (!doc || doc.readyState === COMPLETE) {
            fireReady();
            return;
        }    // A fallback to window.onload, that will always work
        // A fallback to window.onload, that will always work
        addEventListener(win, LOAD_EVENT, fireReady);    // w3c mode
        // w3c mode
        if (standardEventModel) {
            var domReady = function () {
                removeEventListener(doc, DOM_READY_EVENT, domReady);
                fireReady();
            };
            addEventListener(doc, DOM_READY_EVENT, domReady);
        } else {
            var stateChange = function () {
                if (doc.readyState === COMPLETE) {
                    removeEventListener(doc, READY_STATE_CHANGE_EVENT, stateChange);
                    fireReady();
                }
            };    // ensure firing before onload (but completed after all inner iframes is loaded)
                  // maybe late but safe also for iframes
            // ensure firing before onload (but completed after all inner iframes is loaded)
            // maybe late but safe also for iframes
            addEventListener(doc, READY_STATE_CHANGE_EVENT, stateChange);    // If IE and not a frame
                                                                             // continually check to see if the document is ready
            // If IE and not a frame
            // continually check to see if the document is ready
            var notframe, doScroll = docElem && docElem.doScroll;
            try {
                notframe = win.frameElement === null;
            } catch (e) {
                notframe = false;
            }    // can not use in iframe,parent window is dom ready so doScroll is ready too
            // can not use in iframe,parent window is dom ready so doScroll is ready too
            if (doScroll && notframe) {
                var readyScroll = function () {
                    try {
                        // Ref: http://javascript.nwbox.com/IEContentLoaded/
                        doScroll('left');
                        fireReady();
                    } catch (ex) {
                        setTimeout(readyScroll, POLL_INTERVAL);
                    }
                };
                readyScroll();
            }
        }
    }    // bind on start
         // in case when you bind but the DOMContentLoaded has triggered
         // then you has to wait onload
         // worst case no callback at all
    // bind on start
    // in case when you bind but the DOMContentLoaded has triggered
    // then you has to wait onload
    // worst case no callback at all
    if (supportEvent) {
        bindReady();
    }
    try {
        doc.execCommand('BackgroundImageCache', false, true);
    } catch (e) {
    }
});
/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 29 15:14
*/
/*
combined modules:
ua
*/
/**
 * @ignore
 * ua
 */
KISSY.add('ua', [], function (S) {
    /*global process*/
    var win = S.Env.host, undef, doc = win.document, navigator = win.navigator, ua = navigator && navigator.userAgent || '';
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
    var UA = S.UA = getDescriptorFromUserAgent(ua);    // nodejs
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
    }
    return UA;
});    /*
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
KISSY.use('ua, util');/**
 * @ignore
 * 1. export KISSY 's functionality to module system
 * 2. export light-weighted json parse
 */
(function (S) {
    var doc = S.Env.host.document,
        documentMode = doc && doc.documentMode,
        nativeJson = typeof JSON === 'undefined' ? null : JSON;

    // ie 8.0.7600.16315@win7 json bug!
    if (documentMode && documentMode < 9) {
        nativeJson = null;
    }

    if (nativeJson) {
        S.add('json', function () {
            S.JSON = nativeJson;
            return nativeJson;
        });
        // light weight json parse
        S.parseJson = function (data) {
            return nativeJson.parse(data);
        };
    } else {
        // Json RegExp
        var INVALID_CHARS_REG = /^[\],:{}\s]*$/,
            INVALID_BRACES_REG = /(?:^|:|,)(?:\s*\[)+/g,
            INVALID_ESCAPES_REG = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,
            INVALID_TOKENS_REG = /"[^"\\\r\n]*"|true|false|null|-?(?:\d+\.|)\d+(?:[eE][+-]?\d+|)/g;
        S.parseJson = function (data) {
            if (data === null) {
                return data;
            }
            if (typeof data === 'string') {
                // for ie
                data = S.trim(data);
                if (data) {
                    // from json2
                    if (INVALID_CHARS_REG.test(data.replace(INVALID_ESCAPES_REG, '@')
                        .replace(INVALID_TOKENS_REG, ']')
                        .replace(INVALID_BRACES_REG, ''))) {
                        /*jshint evil:true*/
                        return (new Function('return ' + data))();
                    }
                }
            }
            return S.error('Invalid Json: ' + data);
        };
    }
})(KISSY);