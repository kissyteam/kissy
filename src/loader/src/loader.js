/* exported KISSY */
/*jshint -W079 */
var KISSY = (function () {
    var S = {
        version: '@VERSION@'
    };

    var slice = [].slice;
    S.require = modulex.require;
    S.Env = modulex.Env;
    S.Config = modulex.Config;
    S.config = modulex.config;
    S.log = console.log;
    S.error = function (str) {
        if (modulex.Config.debug) {
            throw new Error(str);
        }
    };
    S.nodeRequire = modulex.nodeRequire;

    function wrap(fn) {
        function wrapped() {
            var args = slice.call(arguments, 0);
            args.unshift(S);
            return fn.apply(this, args);
        }

        wrapped.toString = function () {
            return fn.toString();
        };
        return wrapped;
    }

    S.add = function () {
        var args = slice.call(arguments, 0);
        for (var i = 0, l = args.length; i < l; i++) {
            if (typeof args[i] === 'function') {
                args[i] = wrap(args[i]);
            }
        }
        modulex.add.apply(this, args);
    };

    S.use = function () {
        var args = slice.call(arguments, 0);
        var callback = args[1];
        if (typeof callback === 'function') {
            args[1] = wrap(args[1]);
        } else if (callback && callback.success) {
            callback.success = wrap(callback.success);
        }
        modulex.use.apply(this, args);
        return S;
    };

    (function (S) {
        var doc = S.Env.host && S.Env.host.document;
        var defaultComboPrefix = '??';
        var defaultComboSep = ',';

        function mix(r, s) {
            for (var p in s) {
                if (!(p in r)) {
                    r[p] = s[p];
                }
            }
            return r;
        }

        function returnJson(s) {
            /*jshint evil:true*/
            return (new Function('return ' + s))();
        }

        var baseReg = /^(.*)(seed)(?:-debug|)?\.js[^/]*/i;
        var baseTestReg = /(seed)(?:-debug|)?\.js/i;

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

            var parts, base;
            var index = src.indexOf(comboPrefix);

            // no combo
            if (index === -1) {
                base = src.replace(baseReg, '$1');
            } else {
                base = src.substring(0, index);
                if (base.charAt(base.length - 1) !== '/') {
                    base += '/';
                }
                parts = src.substring(index + comboPrefix.length).split(comboSep);
                for (var i = 0, l = parts.length; i < l; i++) {
                    var part = parts[i];
                    if (part.match(baseTestReg)) {
                        base += part.replace(baseReg, '$1');
                        break;
                    }
                }
            }

            if (!('tag' in baseInfo)) {
                var queryIndex = src.lastIndexOf('?t=');
                if (queryIndex !== -1) {
                    baseInfo.tag = src.substring(queryIndex + 1);
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
            var scripts = doc.getElementsByTagName('script');
            var i, info;

            for (i = scripts.length - 1; i >= 0; i--) {
                if ((info = getBaseInfoFromOneScript(scripts[i]))) {
                    return info;
                }
            }

            var msg = 'must load kissy by file name in browser environment: ' +
                'seed-debug.js or seed.js';

            S.log(msg, 'error');
            return null;
        }

        if (typeof __dirname !== 'undefined') {
            S.config({
                charset: 'utf-8',
                /*global __dirname*/
                base: __dirname.replace(/\\/g, '/').replace(/\/$/, '') + '/'
            });
        } else if (doc && doc.getElementsByTagName) {
            // will transform base to absolute path
            S.config(mix({
                // 2k(2048) url length
                comboMaxUrlLength: 2000,
                // file limit number for a single combo url
                comboMaxFileNum: 40
            }, getBaseInfo()));
        }
    })(S);

    if (typeof module !== 'undefined') {
        module.exports = S;
    }

    if (typeof global !== 'undefined') {
        global.KISSY = S;
    }

    S.modulex = modulex;

    return S;
})();
