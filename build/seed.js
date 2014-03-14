/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 14 15:44
*/
/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 14 15:43
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
         * NOTICE: '20140314154337' will replace with current timestamp when compressing.
         * @private
         * @type {String}
         */
        __BUILD_TIME: '20140314154337',

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
            fns: {}
        },

        /**
         * The version of the library.
         * NOTICE: '1.50' will replace with current version when compressing.
         * @type {String}
         */
        version: '1.50',

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
                S.each(configName, function (configValue, p) {
                    fn = configFns[p];
                    if (fn) {
                        fn.call(self, configValue);
                    } else {
                        Config[p] = configValue;
                    }
                });
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
        },

        // stub for uri and path
        add: function (fn) {
            fn(S);
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

    S.mix = function (to, from) {
        for (var i in from) {
            to[i] = from[i];
        }
        return to;
    };

    return S;
})();(function (S) {
    var logger = S.getLogger('s/lang');
    var SEP = '&',
        EMPTY = '',
        EQ = '=',
        toString = ({}).toString,
        TRUE = true;
    var RE_TRIM = /^[\s\xa0]+|[\s\xa0]+$/g,
        trim = String.prototype.trim;
    // error in native ie678, not in simulated ie9
    var hasEnumBug = !({toString: 1}.propertyIsEnumerable('toString')),
        enumProperties = [
            'constructor',
            'hasOwnProperty',
            'isPrototypeOf',
            'propertyIsEnumerable',
            'toString',
            'toLocaleString',
            'valueOf'
        ];

    function isValidParamValue(val) {
        var t = typeof val;
        // If the type of val is null, undefined, number, string, boolean, return TRUE.
        return val == null || (t !== 'object' && t !== 'function');
    }

    S.mix(S, {
        /**
         * Checks to see if an object is empty.
         * @member KISSY
         */
        isEmptyObject: function (o) {
            for (var p in o) {
                if (p !== undefined) {
                    return false;
                }
            }
            return true;
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
        trim: trim ?
            function (str) {
                return str == null ? EMPTY : trim.call(str);
            } :
            function (str) {
                return str == null ? EMPTY : (str + '').replace(RE_TRIM, EMPTY);
            },
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
                var key,
                    val,
                    keys,
                    i = 0,
                    length = object && object.length,
                // do not use typeof obj == 'function': bug in phantomjs
                    isObj = length === undefined || toString.call(object) === '[object Function]';

                context = context || null;

                if (isObj) {
                    keys = S.keys(object);
                    for (; i < keys.length; i++) {
                        key = keys[i];
                        // can not use hasOwnProperty
                        if (fn.call(context, object[key], key, object) === false) {
                            break;
                        }
                    }
                } else {
                    for (val = object[0];
                         i < length; val = object[++i]) {
                        if (fn.call(context, val, i, object) === false) {
                            break;
                        }
                    }
                }
            }
            return object;
        },

        /**
         * Creates a serialized string of an array or object.
         *
         * for example:
         *     @example
         *     {foo: 1, bar: 2}    // -> 'foo=1&bar=2'
         *     {foo: 1, bar: [2, 3]}    // -> 'foo=1&bar=2&bar=3'
         *     {foo: '', bar: 2}    // -> 'foo=&bar=2'
         *     {foo: undefined, bar: 2}    // -> 'foo=undefined&bar=2'
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
            if (serializeArray === undefined) {
                serializeArray = TRUE;
            }
            var buf = [], key, i, v, len, val,
                encode = S.urlEncode;
            for (key in o) {

                val = o[key];
                key = encode(key);

                // val is valid non-array value
                if (isValidParamValue(val)) {
                    buf.push(key);
                    if (val !== undefined) {
                        buf.push(eq, encode(val + EMPTY));
                    }
                    buf.push(sep);
                } else if (S.isArray(val) && val.length) {
                    // val is not empty array
                    for (i = 0, len = val.length; i < len; ++i) {
                        v = val[i];
                        if (isValidParamValue(v)) {
                            buf.push(key, (serializeArray ? encode('[]') : EMPTY));
                            if (v !== undefined) {
                                buf.push(eq, encode(v + EMPTY));
                            }
                            buf.push(sep);
                        }
                    }
                }
                // ignore other cases, including empty array, Function, RegExp, Date etc.

            }
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
            var ret = {},
                eqIndex,
                decode = S.urlDecode,
                pairs = str.split(sep),
                key, val,
                i = 0, len = pairs.length;

            for (; i < len; ++i) {
                eqIndex = pairs[i].indexOf(eq);
                if (eqIndex === -1) {
                    key = decode(pairs[i]);
                    val = undefined;
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
                        ret[key] = [ret[key], val];
                    }
                } else {
                    ret[key] = val;
                }
            }
            return ret;
        }
    });
})(KISSY);/**
 * @ignore
 * Port Node Utils For KISSY.
 * Note: Only posix mode.
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S) {
    // [root, dir, basename, ext]
    var splitPathRe = /^(\/?)([\s\S]+\/(?!$)|\/)?((?:\.{1,2}$|[\s\S]+?)?(\.[^.\/]*)?)$/;

    function filter(arr, fn, context) {
        var ret = [];
        S.each(arr, function (item, i, arr) {
            if (fn.call(context || this, item, i, arr)) {
                ret.push(item);
            }
        });
        return ret;
    }

    // Remove .. and . in path array
    function normalizeArray(parts, allowAboveRoot) {
        // level above root
        var up = 0,
            i = parts.length - 1,
        // splice costs a lot in ie
        // use new array instead
            newParts = [],
            last;

        for (; i >= 0; i--) {
            last = parts[i];
            if (last !== '.') {
                if (last === '..') {
                    up++;
                } else if (up) {
                    up--;
                } else {
                    newParts[newParts.length] = last;
                }
            }
        }

        // if allow above root, has to add ..
        if (allowAboveRoot) {
            for (; up--; up) {
                newParts[newParts.length] = '..';
            }
        }

        newParts = newParts.reverse();

        return newParts;
    }

    /**
     * Path Utils For KISSY.
     * @class KISSY.Path
     * @singleton
     */
    var Path = S.Path = {
        /**
         * resolve([from ...], to)
         * @return {String} Resolved path.
         */
        resolve: function () {
            var resolvedPath = '',
                resolvedPathStr,
                i,
                args = (arguments),
                path,
                absolute = 0;

            for (i = args.length - 1; i >= 0 && !absolute; i--) {
                path = args[i];
                if (typeof path !== 'string' || !path) {
                    continue;
                }
                resolvedPath = path + '/' + resolvedPath;
                absolute = path.charAt(0) === '/';
            }

            resolvedPathStr = normalizeArray(filter(resolvedPath.split('/'), function (p) {
                return !!p;
            }), !absolute).join('/');

            return ((absolute ? '/' : '') + resolvedPathStr) || '.';
        },

        /**
         * normalize .. and . in path
         * @param {String} path Path tobe normalized
         *
         *
         *      'x/y/../z' => 'x/z'
         *      'x/y/z/../' => 'x/y/'
         *
         * @return {String}
         */
        normalize: function (path) {
            var absolute = path.charAt(0) === '/',
                trailingSlash = path.slice(0 - 1) === '/';

            path = normalizeArray(filter(path.split('/'), function (p) {
                return !!p;
            }), !absolute).join('/');

            if (!path && !absolute) {
                path = '.';
            }

            if (path && trailingSlash) {
                path += '/';
            }

            return (absolute ? '/' : '') + path;
        },

        /**
         * join([path ...]) and normalize
         * @return {String}
         */
        join: function () {
            var args = Array.prototype.slice.call(arguments);
            return Path.normalize(filter(args,function (p) {
                return p && (typeof p === 'string');
            }).join('/'));
        },

        /**
         * Get string which is to relative to from
         * @param {String} from
         * @param {String} to
         *
         *
         *      relative('x/','x/y/z') => 'y/z'
         *      relative('x/t/z','x/') => '../../'
         *
         * @return {String}
         */
        relative: function (from, to) {
            from = Path.normalize(from);
            to = Path.normalize(to);

            var fromParts = filter(from.split('/'), function (p) {
                    return !!p;
                }),
                path = [],
                sameIndex,
                sameIndex2,
                toParts = filter(to.split('/'), function (p) {
                    return !!p;
                }), commonLength = Math.min(fromParts.length, toParts.length);

            for (sameIndex = 0; sameIndex < commonLength; sameIndex++) {
                if (fromParts[sameIndex] !== toParts[sameIndex]) {
                    break;
                }
            }

            sameIndex2 = sameIndex;

            while (sameIndex < fromParts.length) {
                path.push('..');
                sameIndex++;
            }

            path = path.concat(toParts.slice(sameIndex2));

            path = path.join('/');

            return /**@type String  @ignore*/path;
        },

        /**
         * Get base name of path
         * @param {String} path
         * @param {String} [ext] ext to be stripped from result returned.
         * @return {String}
         */
        basename: function (path, ext) {
            var result = path.match(splitPathRe) || [],
                basename;
            basename = result[3] || '';
            if (ext && basename && basename.slice(ext.length * -1) === ext) {
                basename = basename.slice(0, -1 * ext.length);
            }
            return basename;
        },

        /**
         * Get dirname of path
         * @param {String} path
         * @return {String}
         */
        dirname: function (path) {
            var result = path.match(splitPathRe) || [],
                root = result[1] || '',
                dir = result[2] || '';

            if (!root && !dir) {
                // No dirname
                return '.';
            }

            if (dir) {
                // It has a dirname, strip trailing slash
                dir = dir.substring(0, dir.length - 1);
            }

            return root + dir;
        },

        /**
         * Get extension name of file in path
         * @param {String} path
         * @return {String}
         */
        extname: function (path) {
            return (path.match(splitPathRe) || [])[4] || '';
        }
    };

    return Path;
});
/*
 Refer
 - https://github.com/joyent/node/blob/master/lib/path.js
 *//**
 * @ignore
 * Uri class for KISSY.
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    // if combined into loader
    var Path = require ? require('path') : S.Path;
    var logger = S.getLogger('s/uri');
    var reDisallowedInSchemeOrUserInfo = /[#\/\?@]/g,
        reDisallowedInPathName = /[#\?]/g,

    // ?? combo of taobao
        reDisallowedInQuery = /[#@]/g,
        reDisallowedInFragment = /#/g,

        URI_SPLIT_REG = new RegExp(
            '^' +
                /*
                 Scheme names consist of a sequence of characters beginning with a
                 letter and followed by any combination of letters, digits, plus
                 ('+'), period ('.'), or hyphen ('-').
                 */
                '(?:([\\w\\d+.-]+):)?' + // scheme

                '(?://' +
                /*
                 The authority component is preceded by a double slash ('//') and is
                 terminated by the next slash ('/'), question mark ('?'), or number
                 sign ('#') character, or by the end of the URI.
                 */
                '(?:([^/?#@]*)@)?' + // userInfo

                '(' +
                '[\\w\\d\\-\\u0100-\\uffff.+%]*' +
                '|' +
                // ipv6
                '\\[[^\\]]+\\]' +
                ')' + // hostname - restrict to letters,
                // digits, dashes, dots, percent
                // escapes, and unicode characters.
                '(?::([0-9]+))?' + // port
                ')?' +
                /*
                 The path is terminated
                 by the first question mark ('?') or number sign ('#') character, or
                 by the end of the URI.
                 */
                '([^?#]+)?' + // path. hierarchical part
                /*
                 The query component is indicated by the first question
                 mark ('?') character and terminated by a number sign ('#') character
                 or by the end of the URI.
                 */
                '(?:\\?([^#]*))?' + // query. non-hierarchical data
                /*
                 The fragment identifier component of a URI allows indirect
                 identification of a secondary resource by reference to a primary
                 resource and additional identifying information.

                 A
                 fragment identifier component is indicated by the presence of a
                 number sign ('#') character and terminated by the end of the URI.
                 */
                '(?:#(.*))?' + // fragment
                '$'),

        REG_INFO = {
            scheme: 1,
            userInfo: 2,
            hostname: 3,
            port: 4,
            path: 5,
            query: 6,
            fragment: 7
        };

    function parseQuery(self) {
        if (!self._queryMap) {
            self._queryMap = S.unparam(self._query);
        }
    }

    /**
     * @class KISSY.Uri.Query
     * Query data structure.
     * @param {String} [query] encoded query string(without question mask).
     */
    function Query(query) {
        this._query = query || '';
    }

    Query.prototype = {
        constructor: Query,

        /**
         * Cloned new instance.
         * @return {KISSY.Uri.Query}
         */
        clone: function () {
            return new Query(this.toString());
        },

        /**
         * reset to a new query string
         * @param {String} query
         * @chainable
         */
        reset: function (query) {
            var self = this;
            self._query = query || '';
            self._queryMap = null;
            return self;
        },

        /**
         * Parameter count.
         * @return {Number}
         */
        count: function () {
            var self = this,
                count = 0,
                _queryMap,
                k;
            parseQuery(self);
            _queryMap = self._queryMap;
            for (k in _queryMap) {

                if (S.isArray(_queryMap[k])) {
                    count += _queryMap[k].length;
                } else {
                    count++;
                }

            }
            return count;
        },

        /**
         * judge whether has query parameter
         * @param {String} [key]
         */
        has: function (key) {
            var self = this, _queryMap;
            parseQuery(self);
            _queryMap = self._queryMap;
            if (key) {
                return key in _queryMap;
            } else {
                return !S.isEmptyObject(_queryMap);
            }
        },

        /**
         * Return parameter value corresponding to current key
         * @param {String} [key]
         */
        get: function (key) {
            var self = this, _queryMap;
            parseQuery(self);
            _queryMap = self._queryMap;
            if (key) {
                return _queryMap[key];
            } else {
                return _queryMap;
            }
        },

        /**
         * Parameter names.
         * @return {String[]}
         */
        keys: function () {
            var self = this;
            parseQuery(self);
            return S.keys(self._queryMap);
        },

        /**
         * Set parameter value corresponding to current key
         * @param {String} key
         * @param value
         * @chainable
         */
        set: function (key, value) {
            var self = this, _queryMap;
            parseQuery(self);
            _queryMap = self._queryMap;
            if (typeof key === 'string') {
                self._queryMap[key] = value;
            } else {
                if (key instanceof Query) {
                    key = key.get();
                }
                S.each(key, function (v, k) {
                    _queryMap[k] = v;
                });
            }
            return self;
        },

        /**
         * Remove parameter with specified name.
         * @param {String} key
         * @chainable
         */
        remove: function (key) {
            var self = this;
            parseQuery(self);
            if (key) {
                delete self._queryMap[key];
            } else {
                self._queryMap = {};
            }
            return self;

        },

        /**
         * Add parameter value corresponding to current key
         * @param {String} key
         * @param value
         * @chainable
         */
        add: function (key, value) {
            var self = this,
                _queryMap,
                currentValue;
            if (typeof key === 'string') {
                parseQuery(self);
                _queryMap = self._queryMap;
                currentValue = _queryMap[key];
                if (currentValue === undefined) {
                    currentValue = value;
                } else {
                    currentValue = [].concat(currentValue).concat(value);
                }
                _queryMap[key] = currentValue;
            } else {
                if (key instanceof Query) {
                    key = key.get();
                }
                for (var k in key) {
                    self.add(k, key[k]);
                }
            }
            return self;
        },

        /**
         * Serialize query to string.
         * @param {Boolean} [serializeArray=true]
         * whether append [] to key name when value 's type is array
         */
        toString: function (serializeArray) {
            var self = this;
            parseQuery(self);
            return S.param(self._queryMap, undefined, undefined, serializeArray);
        }
    };

    function padding2(str) {
        return str.length === 1 ? '0' + str : str;
    }

    function equalsIgnoreCase(str1, str2) {
        return str1.toLowerCase() === str2.toLowerCase();
    }

    // www.ta#bao.com // => www.ta.com/#bao.com
    // www.ta%23bao.com
    // Percent-Encoding
    function encodeSpecialChars(str, specialCharsReg) {
        // encodeURI( ) is intended to encode complete URIs,
        // the following ASCII punctuation characters,
        // which have special meaning in URIs, are not escaped either:
        // ; / ? : @ & = + $ , #
        return encodeURI(str).replace(specialCharsReg, function (m) {
            return '%' + padding2(m.charCodeAt(0).toString(16));
        });
    }

    /**
     * @class KISSY.Uri
     * Uri class for KISSY.
     * Most of its interfaces are same with window.location.
     * @param {String|KISSY.Uri} [uriStr] Encoded uri string.
     */
    function Uri(uriStr) {

        if (uriStr instanceof  Uri) {
            return uriStr.clone();
        }

        var components,
            self = this;

        S.mix(self,
            {
                /**
                 * scheme such as 'http:'. aka protocol without colon
                 * @type {String}
                 */
                scheme: '',
                /**
                 * User credentials such as 'yiminghe:gmail'
                 * @type {String}
                 */
                userInfo: '',
                /**
                 * hostname such as 'docs.kissyui.com'. aka domain
                 * @type {String}
                 */
                hostname: '',
                /**
                 * Port such as '8080'
                 * @type {String}
                 */
                port: '',
                /**
                 * path such as '/index.htm'. aka pathname
                 * @type {String}
                 */
                path: '',
                /**
                 * Query object for search string. aka search
                 * @type {KISSY.Uri.Query}
                 */
                query: '',
                /**
                 * fragment such as '#!/test/2'. aka hash
                 */
                fragment: ''
            });

        components = Uri.getComponents(uriStr);

        S.each(components, function (v, key) {
            v = v || '';
            if (key === 'query') {
                // need encoded content
                self.query = new Query(v);
            } else {
                // https://github.com/kissyteam/kissy/issues/298
                try {
                    v = S.urlDecode(v);
                } catch (e) {
                    logger.error(e + 'urlDecode error : ' + v);
                }
                // need to decode to get data structure in memory
                self[key] = v;
            }
        });

        return self;
    }

    Uri.prototype = {
        constructor: Uri,

        /**
         * Return a cloned new instance.
         * @return {KISSY.Uri}
         */
        clone: function () {
            var uri = new Uri(), self = this;
            S.each(REG_INFO, function (index, key) {
                uri[key] = self[key];
            });
            uri.query = uri.query.clone();
            return uri;
        },

        /**
         * The reference resolution algorithm.rfc 5.2
         * return a resolved uri corresponding to current uri
         * @param {KISSY.Uri|String} relativeUri
         *
         * for example:
         *      @example
         *      this: 'http://y/yy/z.com?t=1#v=2'
         *      'https:/y/' => 'https:/y/'
         *      '//foo' => 'http://foo'
         *      'foo' => 'http://y/yy/foo'
         *      '/foo' => 'http://y/foo'
         *      '?foo' => 'http://y/yy/z.com?foo'
         *      '#foo' => http://y/yy/z.com?t=1#foo'
         *
         * @return {KISSY.Uri}
         */
        resolve: function (relativeUri) {

            if (typeof relativeUri === 'string') {
                relativeUri = new Uri(relativeUri);
            }

            var self = this,
                override = 0,
                lastSlashIndex,
                order = ['scheme', 'userInfo', 'hostname', 'port', 'path', 'query', 'fragment'],
                target = self.clone();

            S.each(order, function (o) {
                if (o === 'path') {
                    // relativeUri does not set for scheme/userInfo/hostname/port
                    if (override) {
                        target[o] = relativeUri[o];
                    } else {
                        var path = relativeUri.path;
                        if (path) {
                            // force to override target 's query with relative
                            override = 1;
                            if (!S.startsWith(path, '/')) {
                                if (target.hostname && !target.path) {
                                    // RFC 3986, section 5.2.3, case 1
                                    path = '/' + path;
                                } else if (target.path) {
                                    // RFC 3986, section 5.2.3, case 2
                                    lastSlashIndex = target.path.lastIndexOf('/');
                                    if (lastSlashIndex !== -1) {
                                        path = target.path.slice(0, lastSlashIndex + 1) + path;
                                    }
                                }
                            }
                            // remove .. / .  as part of the resolution process
                            target.path = Path.normalize(path);
                        }
                    }
                } else if (o === 'query') {
                    if (override || relativeUri.query.toString()) {
                        target.query = relativeUri.query.clone();
                        override = 1;
                    }
                } else if (override || relativeUri[o]) {
                    target[o] = relativeUri[o];
                    override = 1;
                }
            });

            return target;

        },

        /**
         * Get scheme part
         */
        getScheme: function () {
            return this.scheme;
        },

        /**
         * Set scheme part
         * @param {String} scheme
         * @chainable
         */
        setScheme: function (scheme) {
            this.scheme = scheme;
            return this;
        },

        /**
         * Return hostname
         * @return {String}
         */
        getHostname: function () {
            return this.hostname;
        },

        /**
         * Set hostname
         * @param {String} hostname
         * @chainable
         */
        setHostname: function (hostname) {
            this.hostname = hostname;
            return this;
        },

        /**
         * Set user info
         * @param {String} userInfo
         * @chainable
         */
        setUserInfo: function (userInfo) {
            this.userInfo = userInfo;
            return this;
        },

        /**
         * Get user info
         * @return {String}
         */
        getUserInfo: function () {
            return this.userInfo;
        },

        /**
         * Set port
         * @param {String} port
         * @chainable
         */
        setPort: function (port) {
            this.port = port;
            return this;
        },

        /**
         * Get port
         * @return {String}
         */
        getPort: function () {
            return this.port;
        },

        /**
         * Set path
         * @param {string} path
         * @chainable
         */
        setPath: function (path) {
            this.path = path;
            return this;
        },

        /**
         * Get path
         * @return {String}
         */
        getPath: function () {
            return this.path;
        },

        /**
         * Set query
         * @param {String|KISSY.Uri.Query} query
         * @chainable
         */
        setQuery: function (query) {
            if (typeof query === 'string') {
                if (S.startsWith(query, '?')) {
                    query = query.slice(1);
                }
                query = new Query(encodeSpecialChars(query, reDisallowedInQuery));
            }
            this.query = query;
            return this;
        },

        /**
         * Get query
         * @return {KISSY.Uri.Query}
         */
        getQuery: function () {
            return this.query;
        },

        /**
         * Get fragment
         * @return {String}
         */
        getFragment: function () {
            return this.fragment;
        },

        /**
         * Set fragment
         * @param {String} fragment
         * @chainable
         */
        setFragment: function (fragment) {
            var self = this;
            if (S.startsWith(fragment, '#')) {
                fragment = fragment.slice(1);
            }
            self.fragment = fragment;
            return self;
        },

        /**
         * Judge whether two uri has same domain.
         * @param {KISSY.Uri} other
         * @return {Boolean}
         */
        isSameOriginAs: function (other) {
            var self = this;
            // port and hostname has to be same
            return equalsIgnoreCase(self.hostname, other.hostname) &&
                equalsIgnoreCase(self.scheme, other.scheme) &&
                equalsIgnoreCase(self.port, other.port);
        },

        /**
         * Serialize to string.
         * See rfc 5.3 Component Recomposition.
         * But kissy does not differentiate between undefined and empty.
         * @param {Boolean} [serializeArray=true]
         * whether append [] to key name when value 's type is array
         * @return {String}
         */
        toString: function (serializeArray) {
            var out = [],
                self = this,
                scheme,
                hostname,
                path,
                port,
                fragment,
                query,
                userInfo;

            if ((scheme = self.scheme)) {
                out.push(encodeSpecialChars(scheme, reDisallowedInSchemeOrUserInfo));
                out.push(':');
            }

            if ((hostname = self.hostname)) {
                out.push('//');
                if ((userInfo = self.userInfo)) {
                    out.push(encodeSpecialChars(userInfo, reDisallowedInSchemeOrUserInfo));
                    out.push('@');
                }

                out.push(encodeURIComponent(hostname));

                if ((port = self.port)) {
                    out.push(':');
                    out.push(port);
                }
            }

            if ((path = self.path)) {
                if (hostname && !S.startsWith(path, '/')) {
                    path = '/' + path;
                }
                path = Path.normalize(path);
                out.push(encodeSpecialChars(path, reDisallowedInPathName));
            }

            if ((query = (self.query.toString(serializeArray)))) {
                out.push('?');
                out.push(query);
            }

            if ((fragment = self.fragment)) {
                out.push('#');
                out.push(encodeSpecialChars(fragment, reDisallowedInFragment));
            }

            return out.join('');
        }
    };

    Uri.Query = Query;

    Uri.getComponents = function (url) {
        url = url || '';
        var m = url.match(URI_SPLIT_REG) || [],
            ret = {};
        S.each(REG_INFO, function (index, key) {
            ret[key] = m[index];
        });
        return ret;
    };

    S.Uri = Uri;

    return Uri;
});
/*
 Refer
 - application/x-www-form-urlencoded
 - http://www.ietf.org/rfc/rfc3986.txt
 - http://en.wikipedia.org/wiki/URI_scheme
 - http://unixpapa.com/js/querystring.html
 - http://code.stephenmorley.org/javascript/parsing-query-strings-for-get-data/
 - same origin: http://tools.ietf.org/html/rfc6454
 *//**
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
        /**dependencies are loaded or attached*/
        READY_TO_ATTACH: 3,
        /** attaching */
        ATTACHING: 4,
        /** attached */
        ATTACHED: 5
    };
})(KISSY);/**
 * @ignore
 * Utils for kissy loader
 * @author yiminghe@gmail.com
 */
(function (S) {
    var Loader = S.Loader,
        Path = S.Path,
        Env = S.Env,
        host = Env.host,
        TRUE = !0,
        FALSE = !1,
        mix = S.mix,
        startsWith = S.startsWith,
        data = Loader.Status,
        ATTACHED = data.ATTACHED,
        READY_TO_ATTACH = data.READY_TO_ATTACH,
        LOADED = data.LOADED,
        ATTACHING = data.ATTACHING,
        ERROR = data.ERROR,
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
        if (S.endsWith(name, '.js')) {
            name = name.slice(0, -3);
        }
        return name;
    }

    function pluginAlias(name) {
        var index = name.indexOf('!');
        if (index !== -1) {
            var pluginName = name.substring(0, index);
            name = name.substring(index + 1);
            S.use(pluginName, {
                sync: true,
                success: function (S, Plugin) {
                    if (Plugin.alias) {
                        //noinspection JSReferencingMutableVariableFromClosure
                        name = Plugin.alias(S, name, pluginName);
                    }
                }
            });
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

    function getIEVersion() {
        var m, v;
        if ((m = ua.match(/MSIE ([^;]*)|Trident.*; rv(?:\s|:)?([0-9.]+)/)) &&
            (v = (m[1] || m[2]))) {
            return numberify(v);
        }
        return undefined;
    }

    function bind(fn, context) {
        return function () {
            return fn.apply(context, arguments);
        };
    }

    var m,
        ua = (host.navigator || {}).userAgent || '';

    // https://github.com/kissyteam/kissy/issues/545
    if (((m = ua.match(/AppleWebKit\/([\d.]*)/)) || (m = ua.match(/Safari\/([\d.]*)/))) && m[1]) {
        Utils.webkit = numberify(m[1]);
    }

    mix(Utils, {

        ie: getIEVersion(),

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
            var i = 0, l;

            if (!depName) {
                return depName;
            }

            if (typeof depName === 'string') {
                if (startsWith(depName, '../') || startsWith(depName, './')) {
                    // x/y/z -> x/y/
                    return Path.resolve(Path.dirname(moduleName), depName);
                }

                return Path.normalize(depName);
            }

            for (l = depName.length; i < l; i++) {
                depName[i] = Utils.normalDepModuleName(moduleName, depName[i]);
            }
            return depName;
        },

        /**
         * create modules info
         * @param {String[]} modNames to be created module names
         */
        createModulesInfo: function (modNames) {
            S.each(modNames, function (m) {
                Utils.createModuleInfo(m);
            });
        },

        /**
         * create single module info
         * @param {String} modName to be created module name
         * @param {Object} [cfg] module config
         * @return {KISSY.Loader.Module}
         */
        createModuleInfo: function (modName, cfg) {
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

            S.each(modNames, function (modName) {
                module = runtimeMods[modName];
                if (!module || module.getType() !== 'css') {
                    unalias = Utils.unalias(modName);
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

        checkModsLoadRecursively: function (modNames, stack, errorList, cache) {
            // for debug. prevent circular dependency
            stack = stack || [];
            // for efficiency. avoid duplicate non-attach check
            cache = cache || {};
            var i,
                s = 1,
                l = modNames.length,
                stackDepth = stack.length;
            for (i = 0; i < l; i++) {
                if (!s) {
                    return !!s;
                }
                s = Utils.checkModLoadRecursively(modNames[i], stack, errorList, cache);
                stack.length = stackDepth;
            }
            return !!s;
        },

        checkModLoadRecursively: function (modName, stack, errorList, cache) {
            var mods = Env.mods,
                status,
                m = mods[modName];
            if (modName in cache) {
                return cache[modName];
            }
            if (!m) {
                cache[modName] = FALSE;
                return FALSE;
            }
            status = m.status;
            if (status === ERROR) {
                errorList.push(m);
                cache[modName] = FALSE;
                return FALSE;
            }
            if (status >= READY_TO_ATTACH) {
                cache[modName] = TRUE;
                return TRUE;
            }
            if (status !== LOADED) {
                cache[modName] = FALSE;
                return FALSE;
            }
            if ('@DEBUG@') {
                if (stack[modName]) {
                    S.log('find cyclic dependency between mods: ' + stack, 'warn');
                } else {
                    stack.push(modName);
                }
            }
            if (stack[modName]) {
                cache[modName] = TRUE;
                return TRUE;
            } else {
                // tracking module name
                stack[modName] = 1;
            }

            if (Utils.checkModsLoadRecursively(m.getNormalizedRequires(), stack, errorList, cache)) {
                m.status = READY_TO_ATTACH;
                cache[modName] = TRUE;
                return TRUE;
            }

            cache[modName] = FALSE;
            return FALSE;
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
                var require;
                if (module.requires && module.requires.length && module.cjs) {
                    require = bind(module.require, module);
                }
                // 需要解开 index，相对路径
                // 但是需要保留 alias，防止值不对应
                //noinspection JSUnresolvedFunction
                exports = factory.apply(module,
                    // KISSY.add(function(S){module.require}) lazy initialize
                    (module.cjs ? [S, require, module.exports, module] :
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

        /**
         * unalias module name.
         * @param {String|String[]} names moduleNames
         * @return {String[]} unalias module names
         */
        unalias: function (names) {
            var ret = [].concat(names),
                i,
                m,
                alias,
                ok = 0,
                j;
            while (!ok) {
                ok = 1;
                for (i = ret.length - 1; i >= 0; i--) {
                    if ((m = Utils.createModuleInfo(ret[i])) && ((alias = m.getAlias()) !== undefined)) {
                        ok = 0;
                        if (typeof alias === 'string') {
                            alias = [alias];
                        }
                        for (j = alias.length - 1; j >= 0; j--) {
                            if (!alias[j]) {
                                alias.splice(j, 1);
                            }
                        }
                        ret.splice.apply(ret, [i, 1].concat(addIndexAndRemoveJsExt(alias)));
                    }
                }
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
            var ret = [], i, l;
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
            Utils.createModuleInfo(name);

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
})(KISSY);/*
 setImmediate polyfill inspired by Q
 @author yiminghe@gmail.com
 */
(function (S) {
    /*global setImmediate*/
    /*global process */
    /*global MessageChannel */

    var queue = [];

    var flushing = 0;

    function flush() {
        var i = 0, item;
        while ((item = queue[i++])) {
            try {
                item();
            } catch (e) {
                S.log(e.stack || e, 'error');
                /*jshint loopfunc:true*/
                setTimeout(function () {
                    throw e;
                }, 0);
            }
        }
        if (i > 1) {
            queue = [];
        }
        flushing = 0;
    }

    /*
     setImmediate for loader and promise
     @param {Function} fn async function to call
     @private
     */
    S.setImmediate = function (fn) {
        queue.push(fn);
        if (!flushing) {
            flushing = 1;
            requestFlush();
        }
    };

    var requestFlush;
    if (typeof setImmediate === 'function') {
        requestFlush = function () {

            setImmediate(flush);
        };
    } else if (typeof process !== 'undefined' && typeof  process.nextTick === 'function') {
        requestFlush = function () {
            process.nextTick(flush);
        };
    } else if (typeof MessageChannel !== 'undefined') {
        // modern browsers
        // http://msdn.microsoft.com/en-us/library/windows/apps/hh441303.aspx
        var channel = new MessageChannel();
        // At least Safari Version 6.0.5 (8536.30.1) intermittently cannot create
        // working message ports the first time a page loads.
        channel.port1.onmessage = function () {
            requestFlush = realRequestFlush;
            channel.port1.onmessage = flush;
            flush();
        };
        var realRequestFlush = function () {
            // Opera requires us to provide a message payload, regardless of
            // whether we use it.
            channel.port2.postMessage(0);
        };
        requestFlush = function () {
            setTimeout(flush, 0);
            realRequestFlush();
        };

    } else {
        // old browsers
        requestFlush = function () {
            setTimeout(flush, 0);
        };
    }
})(KISSY);/**
 * @ignore
 * setup data structure for kissy loader
 * @author yiminghe@gmail.com
 */
(function (S) {
    var Loader = S.Loader,
        Path = S.Path,
        Config = S.Config,
        Env= S.Env,
        Utils = Loader.Utils,
        mix = S.mix;

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

        getPath: function () {
            return this.path || (this.path = this.getUri().toString());
        },

        /**
         * get package uri
         */
        getUri: function () {
            return this.uri;
        },

        /**
         * Whether is debug for this package.
         * @return {Boolean}
         */
        isDebug: function () {
            return checkGlobalIfNotExist(this, 'debug');
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
        self.waitedCallbacks = [];
    }

    Module.prototype = {
        kissy: 1,

        constructor: Module,

        /**
         * resolve module by name.
         * @param {String|String[]} relativeName relative module's name
         * @param {Function|Object} fn KISSY.use callback
         * @returns {String} resolved module name
         */
        use: function (relativeName, fn) {
            relativeName = Utils.getModNamesAsArray(relativeName);
            return KISSY.use(Utils.normalDepModuleName(this.name, relativeName), fn);
        },

        /**
         * resolve path
         * @param {String} relativePath relative path
         * @returns {KISSY.Uri} resolve uri
         */
        resolve: function (relativePath) {
            return this.getUri().resolve(relativePath);
        },

        // use by xtemplate include
        resolveByName: function (relativeName) {
            return Utils.normalDepModuleName(this.name, relativeName);
        },

        /**
         * require other modules from current modules
         * @param {String} moduleName name of module to be required
         * @returns {*} required module exports
         */
        require: function (moduleName) {
            return S.require(moduleName, this.name);
        },

        wait: function (callback) {
            this.waitedCallbacks.push(callback);
        },

        notifyAll: function () {
            var callback;
            var len = this.waitedCallbacks.length,
                i = 0;
            for (; i < len; i++) {
                callback = this.waitedCallbacks[i];
                try {
                    callback(this);
                } catch (e) {
                    S.log(e.stack || e, 'error');
                    /*jshint loopfunc:true*/
                    setTimeout(function () {
                        throw e;
                    }, 0);
                }
            }
            this.waitedCallbacks = [];
        },

        /**
         * Get the type if current Module
         * @return {String} css or js
         */
        getType: function () {
            var self = this,
                v = self.type;
            if (!v) {
                if (Path.extname(self.name).toLowerCase() === '.css') {
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
                aliasFn,
                packageInfo,
                alias = self.alias;
            if (!('alias' in self)) {
                packageInfo = self.getPackage();
                if (packageInfo.alias) {
                    alias = packageInfo.alias(name);
                }
                if (!alias && (aliasFn = Config.alias)) {
                    alias = aliasFn(name);
                }
            }
            return alias;
        },

        /**
         * Get the path uri of current module if load dynamically
         * @return {KISSY.Uri}
         */
        getUri: function () {
            var self = this, uri;
            if (!self.uri) {
                // path can be specified
                if (self.path) {
                    uri = new S.Uri(self.path);
                } else {
                    uri = S.Config.resolveModFn(self);
                }
                self.uri = uri;
            }
            return self.uri;
        },

        /**
         * Get the path of current module if load dynamically
         * @return {String}
         */
        getPath: function () {
            var self = this;
            return self.path || (self.path = self.getUri().toString());
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
            return self.packageInfo ||
                (self.packageInfo = getPackage(self.name));
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
            var self = this;
            return S.map(self.getNormalizedRequires(), function (r) {
                return Utils.createModuleInfo(r);
            });
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

    function getPackage(modName) {
        var packages = Config.packages || {},
            modNameSlash = modName + '/',
            pName = '',
            p;
        for (p in packages) {
            if (S.startsWith(modNameSlash, p + '/') && p.length > pName.length) {
                pName = p;
            }
        }
        return packages[pName] || Env.corePackage;
    }
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

        if (S.isEmptyObject(monitors)) {
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
        Path = S.Path,
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
            css = 0,
            error,
            timeout,
            attrs,
            callbacks,
            timer;

        if (S.startsWith(Path.extname(url).toLowerCase(), '.css')) {
            css = 1;
        }

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
            S.each(attrs, function (v, n) {
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
            S.each(jsCssCallbacks[url], function (callback) {
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
        var forceCssPoll = S.Config.forceCssPoll || (webkit && webkit < 536);

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
        Path = S.Path,
        Package = Loader.Package,
        Utils = Loader.Utils,
        host = S.Env.host,
        Config = S.Config,
        location = host.location,
        simulatedLocation,
        locationHref,
        configFns = Config.fns;

    if (location && (locationHref = location.href)) {
        simulatedLocation = new S.Uri(locationHref);
    }

    // how to load mods by path
    Config.loadModsFn = function (rs, config) {
        S.getScript(rs.path, config);
    };

    // how to get mod uri
    Config.resolveModFn = function (mod) {
        var name = mod.name,
            min = '-min',
            t, subPath;

        var packageInfo = mod.getPackage();
        var packageUri = packageInfo.getUri();
        var packageName = packageInfo.getName();
        var extname = '.' + mod.getType();

        name = Path.join(Path.dirname(name), Path.basename(name, extname));

        if (packageInfo.isDebug()) {
            min = '';
        }

        subPath = name + min + extname;
        if (packageName) {
            subPath = Path.relative(packageName, subPath);
        }
        var uri = packageUri.resolve(subPath);
        if ((t = mod.getTag())) {
            t += '.' + mod.getType();
            uri.query.set('t', t);
        }
        return uri;
    };

    var PACKAGE_MEMBERS = ['alias', 'debug', 'tag', 'group', 'combine', 'charset'];

    configFns.core = function (cfg) {
        var base = cfg.base;
        if (base) {
            cfg.uri = normalizePath(base, true);
            delete cfg.base;
        }
        this.Env.corePackage.reset(cfg);
    };

    configFns.packages = function (config) {
        var name,
            Config = this.Config,
            ps = Config.packages = Config.packages || {};
        if (config) {
            S.each(config, function (cfg, key) {
                // 兼容数组方式
                name = cfg.name || key;
                var path = cfg.base || cfg.path;
                var newConfig = {
                    name: name
                };
                S.each(PACKAGE_MEMBERS, function (m) {
                    if (m in cfg) {
                        newConfig[m] = cfg[m];
                    }
                });
                if (path) {
                    path += '/';
                    if (!cfg.ignorePackageNameInUri) {
                        path += name + '/';
                    }
                    newConfig.uri = normalizePath(path, true);
                }
                if (ps[name]) {
                    ps[name].reset(newConfig);
                } else {
                    ps[name] = new Package(newConfig);
                }
            });
            return undefined;
        } else if (config === false) {
            Config.packages = {};
            return undefined;
        } else {
            return ps;
        }
    };

    configFns.modules = function (modules) {
        if (modules) {
            S.each(modules, function (modCfg, modName) {
                var path = modCfg.path;
                if (path) {
                    modCfg.uri = normalizePath(path);
                    delete modCfg.path;
                }
                var mod = Utils.createModuleInfo(modName, modCfg);
                // #485, invalid after add
                if (mod.status === Loader.Status.INIT) {
                    S.mix(mod, modCfg);
                }
            });
        }
    };

    configFns.base = function (base) {
        var self = this,
            Config = self.Config,
            baseUri;

        if (!base) {
            return Config.baseUri.toString();
        }

        baseUri = normalizePath(base, true);
        Config.baseUri = baseUri;

        var corePackage = self.Env.corePackage;

        if (!corePackage) {
            corePackage = self.Env.corePackage = new Package({
                name: ''
            });
        }

        corePackage.uri = baseUri;

        return undefined;
    };

    function normalizePath(base, isDirectory) {
        var baseUri;
        base = base.replace(/\\/g, '/');
        if (isDirectory && base.charAt(base.length - 1) !== '/') {
            base += '/';
        }
        if (simulatedLocation) {
            baseUri = simulatedLocation.resolve(base);
        } else {
            // add scheme for S.Uri
            // currently only for nodejs
            if (!S.startsWith(base, 'file:')) {
                base = 'file:' + base;
            }
            baseUri = new S.Uri(base);
        }
        return baseUri;
    }
})(KISSY);
/**
 * combo loader for KISSY. using combo to load module files.
 * @ignore
 * @author yiminghe@gmail.com
 */
(function (S, undefined) {
    var logger = S.getLogger('s/loader');

    var Loader = S.Loader,
        Config = S.Config,
        each = S.each,
        Status = Loader.Status,
        Utils = Loader.Utils,
        getHash = Utils.getHash,
        LOADING = Status.LOADING,
        LOADED = Status.LOADED,
        READY_TO_ATTACH = Status.READY_TO_ATTACH,
        ERROR = Status.ERROR,
        groupTag = S.now();

    // ie11 is a new one!
    var oldIE = Utils.ie < 10;

    function loadScripts(rss, callback, charset, timeout) {
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
                charset: charset
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

    ComboLoader.groupTag = groupTag;

    /**
     * @class KISSY.Loader.ComboLoader
     * using combo to load module files
     * @param waitingModules
     * @private
     */
    function ComboLoader(waitingModules) {
        this.waitingModules = waitingModules;
    }

    var currentMod;
    var startLoadModName;
    var startLoadModTime;

    function checkKISSYRequire(config, factory) {
        // use require primitive statement
        // function(S,require){require('node')}
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
        if (argsLen === 3 && S.isArray(factory)) {
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
                    logger.info('load remote modules: "' + ms.join(', ') + '" from: "' + rs.modPath + '"');
                }
            });
        };
    }

    function getCommonPrefix(str1, str2) {
        str1 = str1.split(/\//);
        str2 = str2.split(/\//);
        var l = Math.min(str1.length, str2.length);
        for (var i = 0; i < l; i++) {
            if (str1[i] !== str2[i]) {
                break;
            }
        }
        return str1.slice(0, i).join('/') + '/';
    }

    S.mix(ComboLoader.prototype, {
        /**
         * load modules asynchronously
         */
        use: function (normalizedModNames) {
            var self = this,
                allModNames,
                comboUrls,
                timeout = Config.timeout;

            allModNames = S.keys(self.calculate(normalizedModNames));

            Utils.createModulesInfo(allModNames);

            comboUrls = self.getComboUrls(allModNames);

            // load css first to avoid page blink
            each(comboUrls.css, function (cssOne) {
                loadScripts(cssOne, function (success, error) {
                    if ('@DEBUG@') {
                        debugRemoteModules(success);
                    }

                    each(success, function (one) {
                        each(one.mods, function (mod) {
                            Utils.registerModule(mod.name, S.noop);
                            // notify all loader instance
                            mod.notifyAll();
                        });
                    });

                    each(error, function (one) {
                        each(one.mods, function (mod) {
                            var msg = mod.name +
                                ' is not loaded! can not find module in path : ' +
                                one.path;
                            S.log(msg, 'error');
                            mod.status = ERROR;
                            // notify all loader instance
                            mod.notifyAll();
                        });
                    });
                }, cssOne.charset, timeout);
            });

            // jss css download in parallel
            each(comboUrls.js, function (jsOne) {
                loadScripts(jsOne, function (success) {
                    if ('@DEBUG@') {
                        debugRemoteModules(success);
                    }

                    each(jsOne, function (one) {
                        each(one.mods, function (mod) {
                            // fix #111
                            // https://github.com/kissyteam/kissy/issues/111
                            if (!mod.factory) {
                                var msg = mod.name +
                                    ' is not loaded! can not find module in path : ' +
                                    one.path;
                                S.log(msg, 'error');
                                mod.status = ERROR;
                            }
                            // notify all loader instance
                            mod.notifyAll();
                        });
                    });
                }, jsOne.charset, timeout);
            });
        },

        /**
         * calculate dependency
         */
        calculate: function (modNames, cache, ret) {
            var i,
                m,
                mod,
                modStatus,
                self = this,
                waitingModules = self.waitingModules;

            ret = ret || {};
            // 提高性能，不用每个模块都再次全部依赖计算
            // 做个缓存，每个模块对应的待动态加载模块
            cache = cache || {};

            for (i = 0; i < modNames.length; i++) {
                m = modNames[i];
                if (cache[m]) {
                    continue;
                }
                cache[m] = 1;
                mod = Utils.createModuleInfo(m);
                modStatus = mod.status;
                if (modStatus >= READY_TO_ATTACH) {
                    continue;
                }
                if (modStatus !== LOADED) {
                    if (!waitingModules.contains(m)) {
                        if (modStatus !== LOADING) {
                            mod.status = LOADING;
                            ret[m] = 1;
                        }
                        /*jshint loopfunc:true*/
                        mod.wait(function (mod) {
                            waitingModules.remove(mod.name);
                            // notify current loader instance
                            waitingModules.notifyAll();
                        });
                        waitingModules.add(m);
                    }
                }
                self.calculate(mod.getNormalizedRequires(), cache, ret);
            }

            return ret;
        },

        /**
         * get combo mods for modNames
         */
        getComboMods: function (modNames, comboPrefixes) {
            var comboMods = {},
                packageUri,
                i = 0,
                l = modNames.length,
                modName, mod, packageInfo, type, typedCombos, mods,
                tag, charset, packagePath, groupPrefixUri, comboName,
                packageName, group, modPath;

            for (; i < l; ++i) {
                modName = modNames[i];
                mod = Utils.createModuleInfo(modName);
                type = mod.getType();
                modPath = mod.getPath();
                packageInfo = mod.getPackage();
                packageName = packageInfo.name;
                charset = packageInfo.getCharset();
                tag = packageInfo.getTag();
                group = packageInfo.getGroup();
                packagePath = packageInfo.getPath();
                packageUri = packageInfo.getUri();
                comboName = packageName;
                // whether group packages can be combined (except default package and non-combo modules)
                if ((mod.canBeCombined = packageInfo.isCombine() &&
                    S.startsWith(modPath, packagePath)) && group) {
                    // combined package name
                    comboName = group + '_' + charset + '_' + groupTag;
                    if ((groupPrefixUri = comboPrefixes[comboName])) {
                        if (groupPrefixUri.isSameOriginAs(packageUri)) {
                            groupPrefixUri.setPath(
                                getCommonPrefix(groupPrefixUri.getPath(), packageUri.getPath())
                            );
                        } else {
                            comboName = packageName;
                            comboPrefixes[packageName] = packageUri;
                        }
                    } else {
                        comboPrefixes[comboName] = packageUri.clone();
                    }
                } else {
                    comboPrefixes[packageName] = packageUri;
                }

                typedCombos = comboMods[type] = comboMods[type] || {};
                if (!(mods = typedCombos[comboName])) {
                    mods = typedCombos[comboName] = [];
                    mods.charset = charset;
                    mods.tags = [tag]; // [package tag]
                } else {
                    if (!(mods.tags.length === 1 && mods.tags[0] === tag)) {
                        mods.tags.push(tag);
                    }
                }
                mods.push(mod);
            }

            return comboMods;
        },

        /**
         * Get combo urls
         */
        getComboUrls: function (modNames) {
            var comboPrefix = Config.comboPrefix,
                comboSep = Config.comboSep,
                maxFileNum = Config.comboMaxFileNum,
                maxUrlLength = Config.comboMaxUrlLength;

            var comboPrefixes = {};
            // {type, {comboName, [modInfo]}}}
            var comboMods = this.getComboMods(modNames, comboPrefixes);
            // {type, {comboName, [url]}}}
            var comboRes = {};

            // generate combo urls
            for (var type in comboMods) {
                comboRes[type] = {};
                for (var comboName in comboMods[type]) {
                    var currentComboUrls = [];
                    var currentComboMods = [];
                    var mods = comboMods[type][comboName];
                    var tags = mods.tags;
                    var tag = tags.length > 1 ? getHash(tags.join('')) : tags[0];

                    var suffix = (tag ? '?t=' + encodeURIComponent(tag) + '.' + type : ''),
                        suffixLength = suffix.length,
                        basePrefix = comboPrefixes[comboName].toString(),
                        baseLen = basePrefix.length,
                        prefix = basePrefix + comboPrefix,
                        res = comboRes[type][comboName] = [];

                    var l = prefix.length;
                    res.charset = mods.charset;
                    res.mods = [];

                    /*jshint loopfunc:true*/
                    var pushComboUrl = function () {
                        //noinspection JSReferencingMutableVariableFromClosure
                        res.push({
                            combine: 1,
                            path: prefix + currentComboUrls.join(comboSep) + suffix,
                            mods: currentComboMods
                        });
                    };

                    for (var i = 0; i < mods.length; i++) {
                        var currentMod = mods[i];
                        res.mods.push(currentMod);
                        var path = currentMod.getPath();
                        if (!currentMod.canBeCombined) {
                            res.push({
                                combine: 0,
                                path: path,
                                mods: [currentMod]
                            });
                            continue;
                        }
                        // ignore query parameter
                        var subPath = path.slice(baseLen).replace(/\?.*$/, '');
                        currentComboUrls.push(subPath);
                        currentComboMods.push(currentMod);

                        if (currentComboUrls.length > maxFileNum ||
                            (l + currentComboUrls.join(comboSep).length + suffixLength > maxUrlLength)) {
                            currentComboUrls.pop();
                            currentComboMods.pop();
                            pushComboUrl();
                            currentComboUrls = [];
                            currentComboMods = [];
                            i--;
                        }
                    }
                    if (currentComboUrls.length) {
                        pushComboUrl();
                    }
                }
            }
            return comboRes;
        }
    });

    Loader.ComboLoader = ComboLoader;
})(KISSY);
/*
 2014-01-14 yiminghe
 - support System.ondemand from es6

 2013-09-11 yiminghe
 - unify simple loader and combo loader

 2013-07-25 阿古, yiminghe
 - support group combo for packages

 2013-06-04 yiminghe@gmail.com
 - refactor merge combo loader and simple loader
 - support error callback

 2012-02-20 yiminghe note:
 - three status
 0: initialized
 LOADED: load into page
 ATTACHED: factory executed
 *//**
 * @ignore
 * mix loader into KISSY and infer KISSY baseUrl if not set
 * @author yiminghe@gmail.com
 */
(function (S, undefined) {
    var logger = S.getLogger('s/loader');
    var Loader = S.Loader,
        Env = S.Env,
        Utils = Loader.Utils,
        processImmediate = S.setImmediate,
        ComboLoader = Loader.ComboLoader;

    function WaitingModules(fn) {
        this.fn = fn;
        this.waitMods = {};
    }

    WaitingModules.prototype = {
        constructor: WaitingModules,

        notifyAll: function () {
            var self = this,
                fn = self.fn;
            if (fn && S.isEmptyObject(self.waitMods)) {
                self.fn = null;
                fn();
            }
        },

        add: function (modName) {
            this.waitMods[modName] = 1;
        },

        remove: function (modName) {
            delete this.waitMods[modName];
        },

        contains: function (modName) {
            return this.waitMods[modName];
        }
    };

    Loader.WaitingModules = WaitingModules;

    S.mix(S, {
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
                sync,
                tryCount = 0,
                finalSuccess,
                waitingModules = new WaitingModules(loadReady);

            if (typeof success === 'object') {
                //noinspection JSUnresolvedVariable
                sync = success.sync;
                //noinspection JSUnresolvedVariable
                error = success.error;
                //noinspection JSUnresolvedVariable
                success = success.success;
            }

            finalSuccess = function () {
                success.apply(S, Utils.getModules(modNames));
            };

            modNames = Utils.getModNamesAsArray(modNames);
            modNames = Utils.normalizeModNamesWithAlias(modNames);

            normalizedModNames = Utils.unalias(modNames);

            function loadReady() {
                ++tryCount;
                var errorList = [],
                    start,
                    ret;

                if ('@DEBUG@') {
                    start = +new Date();
                }

                ret = Utils.checkModsLoadRecursively(normalizedModNames, undefined, errorList);
                logger.debug(tryCount + ' check duration ' + (+new Date() - start));
                if (ret) {
                    Utils.attachModsRecursively(normalizedModNames);
                    if (success) {
                        if (sync) {
                            finalSuccess();
                        } else {
                            // standalone error trace
                            processImmediate(finalSuccess);
                        }
                    }
                } else if (errorList.length) {
                    if (error) {
                        if (sync) {
                            error.apply(S, errorList);
                        } else {
                            processImmediate(function () {
                                error.apply(S, errorList);
                            });
                        }
                    }
                    S.log(errorList, 'error');
                    S.log('loader: load above modules error', 'error');
                } else {
                    logger.debug(tryCount + ' reload ' + modNames);
                    waitingModules.fn = loadReady;
                    loader.use(normalizedModNames);
                }
            }

            loader = new ComboLoader(waitingModules);

            // in case modules is loaded statically
            // synchronous check
            // but always async for loader
            if (sync) {
                waitingModules.notifyAll();
            } else {
                processImmediate(function () {
                    waitingModules.notifyAll();
                });
            }
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
            if (moduleName) {
                var moduleNames = Utils.unalias(Utils.normalizeModNamesWithAlias([moduleName], refName));
                Utils.attachModsRecursively(moduleNames);
                return Utils.getModules(moduleNames)[1];
            }
        }
    });

    Env.mods = {}; // all added mods
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
    var TIMESTAMP = '20140314154337';
    var defaultComboPrefix = '??';
    var defaultComboSep = ',';

    function returnJson(s) {
        /*jshint evil:true*/
        return (new Function('return ' + s))();
    }

    var baseReg = /^(.*)(seed|loader)(?:-min)?\.js[^/]*/i,
        baseTestReg = /(seed|loader)(?:-min)?\.js/i;

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
            S.each(parts, function (part) {
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
     * get base from seed.js
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
            'seed.js or seed-min.js loader.js or loader-min.js';

        S.log(msg, 'error');
        return null;
    }

    S.config({
        comboPrefix: defaultComboPrefix,
        comboSep: defaultComboSep,
        charset: 'utf-8',
        lang: 'zh-cn'
    });
        // ejecta
    if (doc && doc.getElementsByTagName) {
        // will transform base to absolute path
        S.config(S.mix({
            // 2k(2048) url length
            comboMaxUrlLength: 2000,
            // file limit number for a single combo url
            comboMaxFileNum: 40
        }, getBaseInfo()));
    }

    S.add('uri', function () {
        return S.Uri;
    });

    S.add('path', function () {
        return S.Path;
    });
})(KISSY);
/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 14 15:44
*/
/*
 Combined modules by KISSY Module Compiler: 

 util/array
 util/escape
 util/function
 util/object
 util/string
 util/type
 util/web
 util
*/

KISSY.add("util/array", [], function(S, undefined) {
  var TRUE = true, AP = Array.prototype, indexOf = AP.indexOf, lastIndexOf = AP.lastIndexOf, filter = AP.filter, every = AP.every, some = AP.some, map = AP.map, FALSE = false;
  S.mix(S, {indexOf:indexOf ? function(item, arr, fromIndex) {
    return fromIndex === undefined ? indexOf.call(arr, item) : indexOf.call(arr, item, fromIndex)
  } : function(item, arr, fromIndex) {
    for(var i = fromIndex || 0, len = arr.length;i < len;++i) {
      if(arr[i] === item) {
        return i
      }
    }
    return-1
  }, lastIndexOf:lastIndexOf ? function(item, arr, fromIndex) {
    return fromIndex === undefined ? lastIndexOf.call(arr, item) : lastIndexOf.call(arr, item, fromIndex)
  } : function(item, arr, fromIndex) {
    if(fromIndex === undefined) {
      fromIndex = arr.length - 1
    }
    for(var i = fromIndex;i >= 0;i--) {
      if(arr[i] === item) {
        break
      }
    }
    return i
  }, unique:function(a, override) {
    var b = a.slice();
    if(override) {
      b.reverse()
    }
    var i = 0, n, item;
    while(i < b.length) {
      item = b[i];
      while((n = S.lastIndexOf(item, b)) !== i) {
        b.splice(n, 1)
      }
      i += 1
    }
    if(override) {
      b.reverse()
    }
    return b
  }, inArray:function(item, arr) {
    return S.indexOf(item, arr) > -1
  }, filter:filter ? function(arr, fn, context) {
    return filter.call(arr, fn, context || this)
  } : function(arr, fn, context) {
    var ret = [];
    S.each(arr, function(item, i, arr) {
      if(fn.call(context || this, item, i, arr)) {
        ret.push(item)
      }
    });
    return ret
  }, map:map ? function(arr, fn, context) {
    return map.call(arr, fn, context || this)
  } : function(arr, fn, context) {
    var len = arr.length, res = new Array(len);
    for(var i = 0;i < len;i++) {
      var el = typeof arr === "string" ? arr.charAt(i) : arr[i];
      if(el || i in arr) {
        res[i] = fn.call(context || this, el, i, arr)
      }
    }
    return res
  }, reduce:function(arr, callback, initialValue) {
    var len = arr.length;
    if(typeof callback !== "function") {
      throw new TypeError("callback is not function!");
    }
    if(len === 0 && arguments.length === 2) {
      throw new TypeError("arguments invalid");
    }
    var k = 0;
    var accumulator;
    if(arguments.length >= 3) {
      accumulator = initialValue
    }else {
      do {
        if(k in arr) {
          accumulator = arr[k++];
          break
        }
        k += 1;
        if(k >= len) {
          throw new TypeError;
        }
      }while(TRUE)
    }
    while(k < len) {
      if(k in arr) {
        accumulator = callback.call(undefined, accumulator, arr[k], k, arr)
      }
      k++
    }
    return accumulator
  }, every:every ? function(arr, fn, context) {
    return every.call(arr, fn, context || this)
  } : function(arr, fn, context) {
    var len = arr && arr.length || 0;
    for(var i = 0;i < len;i++) {
      if(i in arr && !fn.call(context, arr[i], i, arr)) {
        return FALSE
      }
    }
    return TRUE
  }, some:some ? function(arr, fn, context) {
    return some.call(arr, fn, context || this)
  } : function(arr, fn, context) {
    var len = arr && arr.length || 0;
    for(var i = 0;i < len;i++) {
      if(i in arr && fn.call(context, arr[i], i, arr)) {
        return TRUE
      }
    }
    return FALSE
  }, makeArray:function(o) {
    if(o == null) {
      return[]
    }
    if(S.isArray(o)) {
      return o
    }
    var lengthType = typeof o.length, oType = typeof o;
    if(lengthType !== "number" || typeof o.nodeName === "string" || o != null && o == o.window || oType === "string" || oType === "function" && !("item" in o && lengthType === "number")) {
      return[o]
    }
    var ret = [];
    for(var i = 0, l = o.length;i < l;i++) {
      ret[i] = o[i]
    }
    return ret
  }})
});
KISSY.add("util/escape", [], function(S) {
  var EMPTY = "", htmlEntities = {"&amp;":"&", "&gt;":">", "&lt;":"<", "&#x60;":"`", "&#x2F;":"/", "&quot;":'"', "&#x27;":"'"}, reverseEntities = {}, escapeHtmlReg, unEscapeHtmlReg, possibleEscapeHtmlReg = /[&<>"'`]/, escapeRegExp = /[\-#$\^*()+\[\]{}|\\,.?\s]/g;
  (function() {
    for(var k in htmlEntities) {
      reverseEntities[htmlEntities[k]] = k
    }
  })();
  escapeHtmlReg = getEscapeReg();
  unEscapeHtmlReg = getUnEscapeReg();
  function getEscapeReg() {
    var str = EMPTY;
    S.each(htmlEntities, function(entity) {
      str += entity + "|"
    });
    str = str.slice(0, -1);
    escapeHtmlReg = new RegExp(str, "g");
    return escapeHtmlReg
  }
  function getUnEscapeReg() {
    var str = EMPTY;
    S.each(reverseEntities, function(entity) {
      str += entity + "|"
    });
    str += "&#(\\d{1,5});";
    unEscapeHtmlReg = new RegExp(str, "g");
    return unEscapeHtmlReg
  }
  S.mix(S, {escapeHtml:function(str) {
    if(!str && str !== 0) {
      return""
    }
    str = "" + str;
    if(!possibleEscapeHtmlReg.test(str)) {
      return str
    }
    return(str + "").replace(escapeHtmlReg, function(m) {
      return reverseEntities[m]
    })
  }, escapeRegExp:function(str) {
    return str.replace(escapeRegExp, "\\$&")
  }, unEscapeHtml:function(str) {
    return str.replace(unEscapeHtmlReg, function(m, n) {
      return htmlEntities[m] || String.fromCharCode(+n)
    })
  }});
  S.escapeHTML = S.escapeHtml;
  S.unEscapeHTML = S.unEscapeHtml
});
KISSY.add("util/function", [], function(S, undefined) {
  function bindFn(r, fn, obj) {
    function FNOP() {
    }
    var slice = [].slice, args = slice.call(arguments, 3), bound = function() {
      var inArgs = slice.call(arguments);
      return fn.apply(this instanceof FNOP ? this : obj || this, r ? inArgs.concat(args) : args.concat(inArgs))
    };
    FNOP.prototype = fn.prototype;
    bound.prototype = new FNOP;
    return bound
  }
  S.mix(S, {noop:function() {
  }, bind:bindFn(0, bindFn, null, 0), rbind:bindFn(0, bindFn, null, 1), later:function(fn, when, periodic, context, data) {
    when = when || 0;
    var m = fn, d = S.makeArray(data), f, r;
    if(typeof fn === "string") {
      m = context[fn]
    }
    if(!m) {
      S.error("method undefined")
    }
    f = function() {
      m.apply(context, d)
    };
    r = periodic ? setInterval(f, when) : setTimeout(f, when);
    return{id:r, interval:periodic, cancel:function() {
      if(this.interval) {
        clearInterval(r)
      }else {
        clearTimeout(r)
      }
    }}
  }, throttle:function(fn, ms, context) {
    ms = ms || 150;
    if(ms === -1) {
      return function() {
        fn.apply(context || this, arguments)
      }
    }
    var last = S.now();
    return function() {
      var now = S.now();
      if(now - last > ms) {
        last = now;
        fn.apply(context || this, arguments)
      }
    }
  }, buffer:function(fn, ms, context) {
    ms = ms || 150;
    if(ms === -1) {
      return function() {
        fn.apply(context || this, arguments)
      }
    }
    var bufferTimer = null;
    function f() {
      f.stop();
      bufferTimer = S.later(fn, ms, 0, context || this, arguments)
    }
    f.stop = function() {
      if(bufferTimer) {
        bufferTimer.cancel();
        bufferTimer = 0
      }
    };
    return f
  }})
});
KISSY.add("util/object", [], function(S, undefined) {
  var logger = S.getLogger("s/util");
  var MIX_CIRCULAR_DETECTION = "__MIX_CIRCULAR", STAMP_MARKER = "__~ks_stamped", host = S.Env.host, TRUE = true, EMPTY = "", Obj = Object, objectCreate = Obj.create;
  mix(S, {stamp:function(o, readOnly, marker) {
    marker = marker || STAMP_MARKER;
    var guid = o[marker];
    if(guid) {
      return guid
    }else {
      if(!readOnly) {
        try {
          guid = o[marker] = S.guid(marker)
        }catch(e) {
          guid = undefined
        }
      }
    }
    return guid
  }, mix:function(r, s, ov, wl, deep) {
    if(typeof ov === "object") {
      wl = ov.whitelist;
      deep = ov.deep;
      ov = ov.overwrite
    }
    if(wl && typeof wl !== "function") {
      var originalWl = wl;
      wl = function(name, val) {
        return S.inArray(name, originalWl) ? val : undefined
      }
    }
    if(ov === undefined) {
      ov = TRUE
    }
    var cache = [], c, i = 0;
    mixInternal(r, s, ov, wl, deep, cache);
    while(c = cache[i++]) {
      delete c[MIX_CIRCULAR_DETECTION]
    }
    return r
  }, merge:function(varArgs) {
    varArgs = S.makeArray(arguments);
    var o = {}, i, l = varArgs.length;
    for(i = 0;i < l;i++) {
      S.mix(o, varArgs[i])
    }
    return o
  }, augment:function(r, varArgs) {
    var args = S.makeArray(arguments), len = args.length - 2, i = 1, proto, arg, ov = args[len], wl = args[len + 1];
    args[1] = varArgs;
    if(!S.isArray(wl)) {
      ov = wl;
      wl = undefined;
      len++
    }
    if(typeof ov !== "boolean") {
      ov = undefined;
      len++
    }
    for(;i < len;i++) {
      arg = args[i];
      if(proto = arg.prototype) {
        arg = S.mix({}, proto, true, removeConstructor)
      }
      S.mix(r.prototype, arg, ov, wl)
    }
    return r
  }, extend:function(r, s, px, sx) {
    if("@DEBUG@") {
      if(!r) {
        logger.error("extend r is null")
      }
      if(!s) {
        logger.error("extend s is null")
      }
      if(!s || !r) {
        return r
      }
    }
    var sp = s.prototype, rp;
    sp.constructor = s;
    rp = createObject(sp, r);
    r.prototype = S.mix(rp, r.prototype);
    r.superclass = sp;
    if(px) {
      S.mix(rp, px)
    }
    if(sx) {
      S.mix(r, sx)
    }
    return r
  }, namespace:function() {
    var args = S.makeArray(arguments), l = args.length, o = null, i, j, p, global = args[l - 1] === TRUE && l--;
    for(i = 0;i < l;i++) {
      p = (EMPTY + args[i]).split(".");
      o = global ? host : this;
      for(j = host[p[0]] === o ? 1 : 0;j < p.length;++j) {
        o = o[p[j]] = o[p[j]] || {}
      }
    }
    return o
  }});
  function Empty() {
  }
  function createObject(proto, constructor) {
    var newProto;
    if(objectCreate) {
      newProto = objectCreate(proto)
    }else {
      Empty.prototype = proto;
      newProto = new Empty
    }
    newProto.constructor = constructor;
    return newProto
  }
  function mix(r, s) {
    for(var i in s) {
      r[i] = s[i]
    }
  }
  function mixInternal(r, s, ov, wl, deep, cache) {
    if(!s || !r) {
      return r
    }
    var i, p, keys, len;
    s[MIX_CIRCULAR_DETECTION] = r;
    cache.push(s);
    keys = S.keys(s);
    len = keys.length;
    for(i = 0;i < len;i++) {
      p = keys[i];
      if(p !== MIX_CIRCULAR_DETECTION) {
        _mix(p, r, s, ov, wl, deep, cache)
      }
    }
    return r
  }
  function removeConstructor(k, v) {
    return k === "constructor" ? undefined : v
  }
  function _mix(p, r, s, ov, wl, deep, cache) {
    if(ov || !(p in r) || deep) {
      var target = r[p], src = s[p];
      if(target === src) {
        if(target === undefined) {
          r[p] = target
        }
        return
      }
      if(wl) {
        src = wl.call(s, p, src)
      }
      if(deep && src && (S.isArray(src) || S.isPlainObject(src))) {
        if(src[MIX_CIRCULAR_DETECTION]) {
          r[p] = src[MIX_CIRCULAR_DETECTION]
        }else {
          var clone = target && (S.isArray(target) || S.isPlainObject(target)) ? target : S.isArray(src) ? [] : {};
          r[p] = clone;
          mixInternal(clone, src, ov, wl, TRUE, cache)
        }
      }else {
        if(src !== undefined && (ov || !(p in r))) {
          r[p] = src
        }
      }
    }
  }
});
KISSY.add("util/string", [], function(S, undefined) {
  var SUBSTITUTE_REG = /\\?\{([^{}]+)\}/g, EMPTY = "";
  var RE_DASH = /-([a-z])/ig;
  function upperCase() {
    return arguments[1].toUpperCase()
  }
  S.mix(S, {camelCase:function(name) {
    return name.replace(RE_DASH, upperCase)
  }, substitute:function(str, o, regexp) {
    if(typeof str !== "string" || !o) {
      return str
    }
    return str.replace(regexp || SUBSTITUTE_REG, function(match, name) {
      if(match.charAt(0) === "\\") {
        return match.slice(1)
      }
      return o[name] === undefined ? EMPTY : o[name]
    })
  }, ucfirst:function(s) {
    s += "";
    return s.charAt(0).toUpperCase() + s.substring(1)
  }})
});
KISSY.add("util/type", [], function(S, undefined) {
  var class2type = {}, FALSE = false, noop = S.noop, OP = Object.prototype, toString = OP.toString;
  function hasOwnProperty(o, p) {
    return OP.hasOwnProperty.call(o, p)
  }
  S.mix(S, {type:function(o) {
    return o == null ? String(o) : class2type[toString.call(o)] || "object"
  }, isPlainObject:function(obj) {
    if(!obj || S.type(obj) !== "object" || obj.nodeType || obj.window == obj) {
      return FALSE
    }
    var key, objConstructor;
    try {
      if((objConstructor = obj.constructor) && !hasOwnProperty(obj, "constructor") && !hasOwnProperty(objConstructor.prototype, "isPrototypeOf")) {
        return FALSE
      }
    }catch(e) {
      return FALSE
    }
    for(key in obj) {
    }
    return key === undefined || hasOwnProperty(obj, key)
  }});
  if("@DEBUG@") {
    S.mix(S, {isBoolean:noop, isNumber:noop, isString:noop, isFunction:noop, isArray:noop, isDate:noop, isRegExp:noop, isObject:noop})
  }
  S.each("Boolean Number String Function Date RegExp Object Array".split(" "), function(name, lc) {
    class2type["[object " + name + "]"] = lc = name.toLowerCase();
    S["is" + name] = function(o) {
      return S.type(o) === lc
    }
  });
  S.isArray = Array.isArray || S.isArray
});
KISSY.add("util/web", [], function(S, undefined) {
  var logger = S.getLogger("s/web");
  var win = S.Env.host, doc = win.document || {}, docElem = doc.documentElement, location = win.location, EMPTY = "", domReady = 0, callbacks = [], POLL_RETIRES = 500, POLL_INTERVAL = 40, RE_ID_STR = /^#?([\w-]+)$/, RE_NOT_WHITESPACE = /\S/, standardEventModel = doc.addEventListener, supportEvent = doc.attachEvent || standardEventModel, DOM_READY_EVENT = "DOMContentLoaded", READY_STATE_CHANGE_EVENT = "readystatechange", LOAD_EVENT = "load", COMPLETE = "complete", addEventListener = standardEventModel ? 
  function(el, type, fn) {
    el.addEventListener(type, fn, false)
  } : function(el, type, fn) {
    el.attachEvent("on" + type, fn)
  }, removeEventListener = standardEventModel ? function(el, type, fn) {
    el.removeEventListener(type, fn, false)
  } : function(el, type, fn) {
    el.detachEvent("on" + type, fn)
  };
  S.mix(S, {isWindow:function(obj) {
    return obj != null && obj == obj.window
  }, parseXML:function(data) {
    if(data.documentElement) {
      return data
    }
    var xml;
    try {
      if(win.DOMParser) {
        xml = (new DOMParser).parseFromString(data, "text/xml")
      }else {
        xml = new ActiveXObject("Microsoft.XMLDOM");
        xml.async = false;
        xml.loadXML(data)
      }
    }catch(e) {
      logger.error("parseXML error :");
      logger.error(e);
      xml = undefined
    }
    if(!xml || !xml.documentElement || xml.getElementsByTagName("parsererror").length) {
      S.error("Invalid XML: " + data)
    }
    return xml
  }, globalEval:function(data) {
    if(data && RE_NOT_WHITESPACE.test(data)) {
      if(win.execScript) {
        win.execScript(data)
      }else {
        (function(data) {
          win["eval"].call(win, data)
        })(data)
      }
    }
  }, ready:function(fn) {
    if(domReady) {
      try {
        fn(S)
      }catch(e) {
        S.log(e.stack || e, "error");
        setTimeout(function() {
          throw e;
        }, 0)
      }
    }else {
      callbacks.push(fn)
    }
    return this
  }, available:function(id, fn) {
    id = (id + EMPTY).match(RE_ID_STR)[1];
    var retryCount = 1;
    var timer = S.later(function() {
      if(++retryCount > POLL_RETIRES) {
        timer.cancel();
        return
      }
      var node = doc.getElementById(id);
      if(node) {
        fn(node);
        timer.cancel()
      }
    }, POLL_INTERVAL, true)
  }});
  function fireReady() {
    if(domReady) {
      return
    }
    if(win && win.setTimeout) {
      removeEventListener(win, LOAD_EVENT, fireReady)
    }
    domReady = 1;
    for(var i = 0;i < callbacks.length;i++) {
      try {
        callbacks[i](S)
      }catch(e) {
        S.log(e.stack || e, "error");
        setTimeout(function() {
          throw e;
        }, 0)
      }
    }
  }
  function bindReady() {
    if(!doc || doc.readyState === COMPLETE) {
      fireReady();
      return
    }
    addEventListener(win, LOAD_EVENT, fireReady);
    if(standardEventModel) {
      var domReady = function() {
        removeEventListener(doc, DOM_READY_EVENT, domReady);
        fireReady()
      };
      addEventListener(doc, DOM_READY_EVENT, domReady)
    }else {
      var stateChange = function() {
        if(doc.readyState === COMPLETE) {
          removeEventListener(doc, READY_STATE_CHANGE_EVENT, stateChange);
          fireReady()
        }
      };
      addEventListener(doc, READY_STATE_CHANGE_EVENT, stateChange);
      var notframe, doScroll = docElem && docElem.doScroll;
      try {
        notframe = win.frameElement === null
      }catch(e) {
        notframe = false
      }
      if(doScroll && notframe) {
        var readyScroll = function() {
          try {
            doScroll("left");
            fireReady()
          }catch(ex) {
            setTimeout(readyScroll, POLL_INTERVAL)
          }
        };
        readyScroll()
      }
    }
  }
  if(location && (location.search || EMPTY).indexOf("ks-debug") !== -1) {
    S.Config.debug = true
  }
  if(supportEvent) {
    bindReady()
  }
  try {
    doc.execCommand("BackgroundImageCache", false, true)
  }catch(e) {
  }
});
KISSY.add("util", ["util/array", "util/escape", "util/function", "util/object", "util/string", "util/type", "util/web"], function(S, require) {
  var FALSE = false, CLONE_MARKER = "__~ks_cloned";
  require("util/array");
  require("util/escape");
  require("util/function");
  require("util/object");
  require("util/string");
  require("util/type");
  require("util/web");
  S.mix(S, {clone:function(input, filter) {
    var memory = {}, ret = cloneInternal(input, filter, memory);
    S.each(memory, function(v) {
      v = v.input;
      if(v[CLONE_MARKER]) {
        try {
          delete v[CLONE_MARKER]
        }catch(e) {
          v[CLONE_MARKER] = undefined
        }
      }
    });
    memory = null;
    return ret
  }});
  function cloneInternal(input, f, memory) {
    var destination = input, isArray, isPlainObject, k, stamp;
    if(!input) {
      return destination
    }
    if(input[CLONE_MARKER]) {
      return memory[input[CLONE_MARKER]].destination
    }else {
      if(typeof input === "object") {
        var Constructor = input.constructor;
        if(S.inArray(Constructor, [Boolean, String, Number, Date, RegExp])) {
          destination = new Constructor(input.valueOf())
        }else {
          if(isArray = S.isArray(input)) {
            destination = f ? S.filter(input, f) : input.concat()
          }else {
            if(isPlainObject = S.isPlainObject(input)) {
              destination = {}
            }
          }
        }
        input[CLONE_MARKER] = stamp = S.guid("c");
        memory[stamp] = {destination:destination, input:input}
      }
    }
    if(isArray) {
      for(var i = 0;i < destination.length;i++) {
        destination[i] = cloneInternal(destination[i], f, memory)
      }
    }else {
      if(isPlainObject) {
        for(k in input) {
          if(k !== CLONE_MARKER && (!f || f.call(input, input[k], k, input) !== FALSE)) {
            destination[k] = cloneInternal(input[k], f, memory)
          }
        }
      }
    }
    return destination
  }
  return S
});

/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 14 15:44
*/
/*
 Combined modules by KISSY Module Compiler: 

 ua
*/

KISSY.add("ua", [], function(S, undefined) {
  var win = S.Env.host, doc = win.document, navigator = win.navigator, ua = navigator && navigator.userAgent || "";
  function numberify(s) {
    var c = 0;
    return parseFloat(s.replace(/\./g, function() {
      return c++ === 0 ? "." : ""
    }))
  }
  function setTridentVersion(ua, UA) {
    var core, m;
    UA[core = "trident"] = 0.1;
    if((m = ua.match(/Trident\/([\d.]*)/)) && m[1]) {
      UA[core] = numberify(m[1])
    }
    UA.core = core
  }
  function getIEVersion(ua) {
    var m, v;
    if((m = ua.match(/MSIE ([^;]*)|Trident.*; rv(?:\s|:)?([0-9.]+)/)) && (v = m[1] || m[2])) {
      return numberify(v)
    }
    return 0
  }
  function getDescriptorFromUserAgent(ua) {
    var EMPTY = "", os, core = EMPTY, shell = EMPTY, m, IE_DETECT_RANGE = [6, 9], ieVersion, v, end, VERSION_PLACEHOLDER = "{{version}}", IE_DETECT_TPL = "<!--[if IE " + VERSION_PLACEHOLDER + "]><" + "s></s><![endif]--\>", div = doc && doc.createElement("div"), s = [];
    var UA = {webkit:undefined, trident:undefined, gecko:undefined, presto:undefined, chrome:undefined, safari:undefined, firefox:undefined, ie:undefined, ieMode:undefined, opera:undefined, mobile:undefined, core:undefined, shell:undefined, phantomjs:undefined, os:undefined, ipad:undefined, iphone:undefined, ipod:undefined, ios:undefined, android:undefined, nodejs:undefined};
    if(div && div.getElementsByTagName) {
      div.innerHTML = IE_DETECT_TPL.replace(VERSION_PLACEHOLDER, "");
      s = div.getElementsByTagName("s")
    }
    if(s.length > 0) {
      setTridentVersion(ua, UA);
      for(v = IE_DETECT_RANGE[0], end = IE_DETECT_RANGE[1];v <= end;v++) {
        div.innerHTML = IE_DETECT_TPL.replace(VERSION_PLACEHOLDER, v);
        if(s.length > 0) {
          UA[shell = "ie"] = v;
          break
        }
      }
      if(!UA.ie && (ieVersion = getIEVersion(ua))) {
        UA[shell = "ie"] = ieVersion
      }
    }else {
      if(((m = ua.match(/AppleWebKit\/([\d.]*)/)) || (m = ua.match(/Safari\/([\d.]*)/))) && m[1]) {
        UA[core = "webkit"] = numberify(m[1]);
        if((m = ua.match(/OPR\/(\d+\.\d+)/)) && m[1]) {
          UA[shell = "opera"] = numberify(m[1])
        }else {
          if((m = ua.match(/Chrome\/([\d.]*)/)) && m[1]) {
            UA[shell = "chrome"] = numberify(m[1])
          }else {
            if((m = ua.match(/\/([\d.]*) Safari/)) && m[1]) {
              UA[shell = "safari"] = numberify(m[1])
            }else {
              UA.safari = UA.webkit
            }
          }
        }
        if(/ Mobile\//.test(ua) && ua.match(/iPad|iPod|iPhone/)) {
          UA.mobile = "apple";
          m = ua.match(/OS ([^\s]*)/);
          if(m && m[1]) {
            UA.ios = numberify(m[1].replace("_", "."))
          }
          os = "ios";
          m = ua.match(/iPad|iPod|iPhone/);
          if(m && m[0]) {
            UA[m[0].toLowerCase()] = UA.ios
          }
        }else {
          if(/ Android/i.test(ua)) {
            if(/Mobile/.test(ua)) {
              os = UA.mobile = "android"
            }
            m = ua.match(/Android ([^\s]*);/);
            if(m && m[1]) {
              UA.android = numberify(m[1])
            }
          }else {
            if(m = ua.match(/NokiaN[^\/]*|Android \d\.\d|webOS\/\d\.\d/)) {
              UA.mobile = m[0].toLowerCase()
            }
          }
        }
        if((m = ua.match(/PhantomJS\/([^\s]*)/)) && m[1]) {
          UA.phantomjs = numberify(m[1])
        }
      }else {
        if((m = ua.match(/Presto\/([\d.]*)/)) && m[1]) {
          UA[core = "presto"] = numberify(m[1]);
          if((m = ua.match(/Opera\/([\d.]*)/)) && m[1]) {
            UA[shell = "opera"] = numberify(m[1]);
            if((m = ua.match(/Opera\/.* Version\/([\d.]*)/)) && m[1]) {
              UA[shell] = numberify(m[1])
            }
            if((m = ua.match(/Opera Mini[^;]*/)) && m) {
              UA.mobile = m[0].toLowerCase()
            }else {
              if((m = ua.match(/Opera Mobi[^;]*/)) && m) {
                UA.mobile = m[0]
              }
            }
          }
        }else {
          if(ieVersion = getIEVersion(ua)) {
            UA[shell = "ie"] = ieVersion;
            setTridentVersion(ua, UA)
          }else {
            if(m = ua.match(/Gecko/)) {
              UA[core = "gecko"] = 0.1;
              if((m = ua.match(/rv:([\d.]*)/)) && m[1]) {
                UA[core] = numberify(m[1]);
                if(/Mobile|Tablet/.test(ua)) {
                  UA.mobile = "firefox"
                }
              }
              if((m = ua.match(/Firefox\/([\d.]*)/)) && m[1]) {
                UA[shell = "firefox"] = numberify(m[1])
              }
            }
          }
        }
      }
    }
    if(!os) {
      if(/windows|win32/i.test(ua)) {
        os = "windows"
      }else {
        if(/macintosh|mac_powerpc/i.test(ua)) {
          os = "macintosh"
        }else {
          if(/linux/i.test(ua)) {
            os = "linux"
          }else {
            if(/rhino/i.test(ua)) {
              os = "rhino"
            }
          }
        }
      }
    }
    UA.os = os;
    UA.core = UA.core || core;
    UA.shell = shell;
    UA.ieMode = UA.ie && doc.documentMode || UA.ie;
    return UA
  }
  var UA = S.UA = getDescriptorFromUserAgent(ua);
  if(typeof process === "object") {
    var versions, nodeVersion;
    if((versions = process.versions) && (nodeVersion = versions.node)) {
      UA.os = process.platform;
      UA.nodejs = numberify(nodeVersion)
    }
  }
  UA.getDescriptorFromUserAgent = getDescriptorFromUserAgent;
  var browsers = ["webkit", "trident", "gecko", "presto", "chrome", "safari", "firefox", "ie", "opera"], documentElement = doc && doc.documentElement, className = "";
  if(documentElement) {
    S.each(browsers, function(key) {
      var v = UA[key];
      if(v) {
        className += " ks-" + key + (parseInt(v, 10) + "");
        className += " ks-" + key
      }
    });
    if(S.trim(className)) {
      documentElement.className = S.trim(documentElement.className + className)
    }
  }
  return UA
});

/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 14 15:44
*/
/*
 Combined modules by KISSY Module Compiler: 

 feature
*/

KISSY.add("feature", ["ua"], function(S, require) {
  var win = S.Env.host, Config = S.Config, UA = require("ua"), propertyPrefixes = ["Webkit", "Moz", "O", "ms"], propertyPrefixesLength = propertyPrefixes.length, doc = win.document || {}, isMsPointerSupported, isPointerSupported, isTransform3dSupported, documentElement = doc && doc.documentElement, navigator, documentElementStyle, isClassListSupportedState = true, isQuerySelectorSupportedState = false, isTouchEventSupportedState = "ontouchstart" in doc && !UA.phantomjs, vendorInfos = {}, ie = UA.ieMode;
  if(documentElement) {
    if(documentElement.querySelector && ie !== 8) {
      isQuerySelectorSupportedState = true
    }
    documentElementStyle = documentElement.style;
    isClassListSupportedState = "classList" in documentElement;
    navigator = win.navigator || {};
    isMsPointerSupported = "msPointerEnabled" in navigator;
    isPointerSupported = "pointerEnabled" in navigator
  }
  function getVendorInfo(name) {
    if(name.indexOf("-") !== -1) {
      name = S.camelCase(name)
    }
    if(name in vendorInfos) {
      return vendorInfos[name]
    }
    if(!documentElementStyle || name in documentElementStyle) {
      vendorInfos[name] = {propertyName:name, propertyNamePrefix:""}
    }else {
      var upperFirstName = name.charAt(0).toUpperCase() + name.slice(1), vendorName;
      for(var i = 0;i < propertyPrefixesLength;i++) {
        var propertyNamePrefix = propertyPrefixes[i];
        vendorName = propertyNamePrefix + upperFirstName;
        if(vendorName in documentElementStyle) {
          vendorInfos[name] = {propertyName:vendorName, propertyNamePrefix:propertyNamePrefix}
        }
      }
      vendorInfos[name] = vendorInfos[name] || null
    }
    return vendorInfos[name]
  }
  S.Feature = {isMsPointerSupported:function() {
    return isMsPointerSupported
  }, isPointerSupported:function() {
    return isPointerSupported
  }, isTouchEventSupported:function() {
    return isTouchEventSupportedState
  }, isTouchGestureSupported:function() {
    return isTouchEventSupportedState || isPointerSupported || isMsPointerSupported
  }, isDeviceMotionSupported:function() {
    return!!win.DeviceMotionEvent
  }, isHashChangeSupported:function() {
    return"onhashchange" in win && (!ie || ie > 7)
  }, isInputEventSupported:function() {
    return!Config.simulateInputEvent && "oninput" in win && (!ie || ie > 9)
  }, isTransform3dSupported:function() {
    if(isTransform3dSupported !== undefined) {
      return isTransform3dSupported
    }
    if(!documentElement || getVendorInfo("transform").prefix === false) {
      isTransform3dSupported = false
    }else {
      var el = doc.createElement("p");
      var transformProperty = getVendorInfo("transform").name;
      documentElement.insertBefore(el, documentElement.firstChild);
      el.style[transformProperty] = "translate3d(1px,1px,1px)";
      var computedStyle = win.getComputedStyle(el);
      var has3d = computedStyle.getPropertyValue(transformProperty) || computedStyle[transformProperty];
      documentElement.removeChild(el);
      isTransform3dSupported = has3d !== undefined && has3d.length > 0 && has3d !== "none"
    }
    return isTransform3dSupported
  }, isClassListSupported:function() {
    return isClassListSupportedState
  }, isQuerySelectorSupported:function() {
    return!Config.simulateCss3Selector && isQuerySelectorSupportedState
  }, getCssVendorInfo:function(name) {
    return getVendorInfo(name)
  }};
  return S.Feature
});

/**
 * @ignore
 * Default KISSY Gallery and core alias.
 * @author yiminghe@gmail.com
 */
(function (S) {
    // compatibility
    S.config({
        modules: {
            ajax: {
                alias: 'io'
            }
        }
    });

    if (typeof location !== 'undefined') {
        var https = S.startsWith(location.href, 'https');
        var prefix = https ? 'https://s.tbcdn.cn/s/kissy/' : 'http://a.tbcdn.cn/s/kissy/';
        S.config({
            packages: {
                gallery: {
                    base: prefix
                },
                mobile: {
                    base: prefix
                }
            }
        });
    }

    S.use('ua,feature,util', {sync: true});
})(KISSY);
/**
 * @ignore
 * 1. export KISSY 's functionality to module system
 * 2. export light-weighted json parse
 */
(function (S) {
    var UA = S.UA,
        Env = S.Env,
        win = Env.host,
    /*global global*/
        nativeJson = ((UA.nodejs && typeof global === 'object') ? global : win).JSON;

    // ie 8.0.7600.16315@win7 json bug!
    if (UA.ieMode < 9) {
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
/*jshint indent:false*/
(function (config, Feature, UA) {
config({
    'anim': {
        alias: KISSY.Feature.getCssVendorInfo('transition') ? 'anim/transition' : 'anim/timer'
    }
});/*Generated By KISSY Module Compiler*/
config({
'anim/base': {requires: ['dom','promise']}
});
/*Generated By KISSY Module Compiler*/
config({
'anim/timer': {requires: ['dom','anim/base']}
});
/*Generated By KISSY Module Compiler*/
config({
'anim/transition': {requires: ['dom','anim/base']}
});
/*Generated By KISSY Module Compiler*/
config({
attribute: {requires: ['event/custom']}
});
/*Generated By KISSY Module Compiler*/
config({
base: {requires: ['attribute']}
});
/*Generated By KISSY Module Compiler*/
config({
button: {requires: ['node','component/control']}
});
/*Generated By KISSY Module Compiler*/
config({
color: {requires: ['attribute']}
});
/*Generated By KISSY Module Compiler*/
config({
combobox: {requires: ['node','component/control','menu','attribute','io']}
});
/*Generated By KISSY Module Compiler*/
config({
'component/container': {requires: ['component/control','component/manager']}
});
/*Generated By KISSY Module Compiler*/
config({
'component/control': {requires: ['node','base','component/manager','xtemplate/runtime']}
});
/*Generated By KISSY Module Compiler*/
config({
'component/extension/align': {requires: ['node']}
});
/*Generated By KISSY Module Compiler*/
config({
'component/extension/content-render': {requires: ['component/extension/content-xtpl']}
});
/*Generated By KISSY Module Compiler*/
config({
'component/extension/delegate-children': {requires: ['node','component/manager']}
});
/*Generated By KISSY Module Compiler*/
config({
'component/plugin/drag': {requires: ['dd']}
});
/*Generated By KISSY Module Compiler*/
config({
'component/plugin/resize': {requires: ['resizable']}
});
/*Generated By KISSY Module Compiler*/
config({
'date/format': {requires: ['date/gregorian','i18n!date']}
});
/*Generated By KISSY Module Compiler*/
config({
'date/gregorian': {requires: ['i18n!date']}
});
/*Generated By KISSY Module Compiler*/
config({
'date/picker': {requires: ['node','date/gregorian','i18n!date/picker','component/control','date/format','date/picker-xtpl']}
});
/*Generated By KISSY Module Compiler*/
config({
'date/popup-picker': {requires: ['date/picker-xtpl','date/picker','component/extension/shim','component/extension/align']}
});
/*Generated By KISSY Module Compiler*/
config({
dd: {requires: ['node','base','event/gesture/drag']}
});
/*Generated By KISSY Module Compiler*/
config({
'dd/plugin/constrain': {requires: ['node','base']}
});
/*Generated By KISSY Module Compiler*/
config({
'dd/plugin/proxy': {requires: ['node','dd','base']}
});
/*Generated By KISSY Module Compiler*/
config({
'dd/plugin/scroll': {requires: ['node','dd','base']}
});
config({
    'dom/basic': {
        alias: [
            'dom/base',
            UA.ieMode < 9 ? 'dom/ie' : '',
            Feature.isClassListSupported() ? '' : 'dom/class-list'
        ]
    },
    dom: {
        alias: [
            'dom/basic',
            !Feature.isQuerySelectorSupported() ? 'dom/selector' : ''
        ]
    }
});/*Generated By KISSY Module Compiler*/
config({
'dom/class-list': {requires: ['dom/base']}
});
/*Generated By KISSY Module Compiler*/
config({
'dom/ie': {requires: ['dom/base']}
});
/*Generated By KISSY Module Compiler*/
config({
'dom/selector': {requires: ['dom/basic']}
});
/*Generated By KISSY Module Compiler*/
config({
editor: {requires: ['node','html-parser','component/control']}
});
config({
    'event/dom': {
        alias: [
            'event/dom/base',
            Feature.isHashChangeSupported() ? '' : 'event/dom/hashchange',
            UA.ieMode < 9 ? 'event/dom/ie' : '',
            Feature.isInputEventSupported() ? '' : 'event/dom/input',
            UA.ie ? '' : 'event/dom/focusin'
        ]
    },
    'event/gesture': {
        alias: [
            'event/gesture/base',
            Feature.isTouchGestureSupported() ? 'event/gesture/touch' : ''
        ]
    }
});/*Generated By KISSY Module Compiler*/
config({
event: {requires: ['event/dom','event/custom','event/gesture']}
});
/*Generated By KISSY Module Compiler*/
config({
'event/custom': {requires: ['event/base']}
});
/*Generated By KISSY Module Compiler*/
config({
'event/dom/base': {requires: ['event/base','dom']}
});
/*Generated By KISSY Module Compiler*/
config({
'event/dom/focusin': {requires: ['event/dom/base']}
});
/*Generated By KISSY Module Compiler*/
config({
'event/dom/hashchange': {requires: ['event/dom/base','dom']}
});
/*Generated By KISSY Module Compiler*/
config({
'event/dom/ie': {requires: ['event/dom/base','dom']}
});
/*Generated By KISSY Module Compiler*/
config({
'event/dom/input': {requires: ['event/dom/base','dom']}
});
/*Generated By KISSY Module Compiler*/
config({
'event/gesture/base': {requires: ['event/dom/base','dom']}
});
/*Generated By KISSY Module Compiler*/
config({
'event/gesture/drag': {requires: ['event/gesture/base','event/dom/base']}
});
/*Generated By KISSY Module Compiler*/
config({
'event/gesture/shake': {requires: ['event/dom/base']}
});
/*Generated By KISSY Module Compiler*/
config({
'event/gesture/touch': {requires: ['event/gesture/base','event/dom/base','dom']}
});
/*Generated By KISSY Module Compiler*/
config({
feature: {requires: ['ua']}
});
/*Generated By KISSY Module Compiler*/
config({
'filter-menu': {requires: ['menu','component/extension/content-xtpl','component/extension/content-render']}
});
/*Generated By KISSY Module Compiler*/
config({
io: {requires: ['dom','event/custom','promise','event/dom']}
});
/*Generated By KISSY Module Compiler*/
config({
menu: {requires: ['node','component/container','component/extension/delegate-children','component/control','component/extension/content-render','component/extension/content-xtpl','component/extension/align','component/extension/shim']}
});
/*Generated By KISSY Module Compiler*/
config({
menubutton: {requires: ['node','button','component/extension/content-xtpl','component/extension/content-render','menu']}
});
/*Generated By KISSY Module Compiler*/
config({
'navigation-view': {requires: ['component/container','component/control','component/extension/content-xtpl','component/extension/content-render']}
});
/*Generated By KISSY Module Compiler*/
config({
'navigation-view/bar': {requires: ['component/control','button']}
});
/*Generated By KISSY Module Compiler*/
config({
node: {requires: ['dom','event/dom','event/gesture','anim']}
});
/*Generated By KISSY Module Compiler*/
config({
overlay: {requires: ['component/container','component/extension/shim','component/extension/align','node','component/extension/content-render']}
});
/*Generated By KISSY Module Compiler*/
config({
resizable: {requires: ['node','base','dd']}
});
/*Generated By KISSY Module Compiler*/
config({
'resizable/plugin/proxy': {requires: ['node','base']}
});
/*Generated By KISSY Module Compiler*/
config({
router: {requires: ['event/dom','uri','event/custom']}
});
config({
    'scroll-view': {
        alias: Feature.isTouchGestureSupported() ? 'scroll-view/touch' : 'scroll-view/base'
    }
});/*Generated By KISSY Module Compiler*/
config({
'scroll-view/base': {requires: ['node','anim/timer','component/container','component/extension/content-render']}
});
/*Generated By KISSY Module Compiler*/
config({
'scroll-view/plugin/pull-to-refresh': {requires: ['base']}
});
/*Generated By KISSY Module Compiler*/
config({
'scroll-view/plugin/scrollbar': {requires: ['base','node','component/control','event/gesture/drag']}
});
/*Generated By KISSY Module Compiler*/
config({
'scroll-view/touch': {requires: ['scroll-view/base','node','anim/timer']}
});
/*Generated By KISSY Module Compiler*/
config({
separator: {requires: ['component/control']}
});
/*Generated By KISSY Module Compiler*/
config({
'split-button': {requires: ['component/container','button','menubutton']}
});
/*Generated By KISSY Module Compiler*/
config({
stylesheet: {requires: ['dom']}
});
/*Generated By KISSY Module Compiler*/
config({
swf: {requires: ['dom','json','attribute']}
});
/*Generated By KISSY Module Compiler*/
config({
tabs: {requires: ['component/container','toolbar','button']}
});
/*Generated By KISSY Module Compiler*/
config({
toolbar: {requires: ['component/container','component/extension/delegate-children','node']}
});
/*Generated By KISSY Module Compiler*/
config({
tree: {requires: ['node','component/container','component/extension/content-xtpl','component/extension/content-render','component/extension/delegate-children']}
});
/*Generated By KISSY Module Compiler*/
config({
uri: {requires: ['path']}
});
/*Generated By KISSY Module Compiler*/
config({
xtemplate: {requires: ['xtemplate/runtime','xtemplate/compiler']}
});
/*Generated By KISSY Module Compiler*/
config({
'xtemplate/compiler': {requires: ['xtemplate/runtime']}
});
/*Generated By KISSY Module Compiler*/
config({
'xtemplate/runtime': {requires: ['path']}
});

                })(function (c) {
                KISSY.config('modules', c);
                },KISSY.Feature, KISSY.UA);
            
