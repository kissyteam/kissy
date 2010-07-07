/*
Copyright 2010, KISSY UI Library v1.0.8
MIT Licensed
build: 810 Jul 7 14:46
*/
/**
 * @module kissy
 * @author lifesinger@gmail.com
 */
(function(win, S, undefined) {

    // If KISSY is already defined, the existing KISSY object will not
    // be overwritten so that defined namespaces are preserved.
    if (win[S] === undefined) win[S] = {};
    S = win[S]; // shortcut

    var doc = win.document,

        // Copies all the properties of s to r
        mix = function(r, s, ov, wl) {
            if (!s || !r) return r;
            if (ov === undefined) ov = true;
            var i, p, l;

            if (wl && (l = wl.length)) {
                for (i = 0; i < l; i++) {
                    p = wl[i];
                    if (p in s) {
                        if (ov || !(p in r)) {
                            r[p] = s[p];
                        }
                    }
                }
            } else {
                for (p in s) {
                    if (ov || !(p in r)) {
                        r[p] = s[p];
                    }
                }
            }
            return r;
        },

        // Is the DOM ready to be used? Set to true once it occurs.
        isReady = false,

        // The functions to execute on DOM ready.
        readyList = [],

        // Has the ready events already been bound?
        readyBound = false;

    mix(S, {

        /**
         * The version of the library.
         * @type {String}
         */
        version: '1.0.8',

        /**
         * Initializes KISSY object.
         * @private
         */
        _init: function() {
            // Env 对象目前仅用于内部，为模块动态加载预留接口
            this.Env = { mods: {} };
        },

        /**
         * Registers a module.
         * @param name {String} module name
         * @param fn {Function} entry point into the module that is used to bind module to KISSY
         * <code>
         * KISSY.add('module-name', function(S){ });
         * </code>
         * @return {KISSY}
         */
        add: function(name, fn) {
            var self = this;

            // override mode
            self.Env.mods[name] = {
                name: name,
                fn: fn
            };

            // call entry point immediately
            fn(self);

            // chain support
            return self;
        },

        /**
         * Specify a function to execute when the DOM is fully loaded.
         * @param fn {Function} A function to execute after the DOM is ready
         * <code>
         * KISSY.ready(function(S){ });
         * </code>
         * @return {KISSY}
         */
        ready: function(fn) {
            // Attach the listeners
            if (!readyBound) this._bindReady();

            // If the DOM is already ready
            if (isReady) {
                // Execute the function immediately
                fn.call(win, this);
            } else {
                // Remember the function for later
                readyList.push(fn);
            }

            return this;
        },

        /**
         * Binds ready events.
         */
        _bindReady: function() {
            var self = this,
                doScroll = doc.documentElement.doScroll,
                eventType = doScroll ? 'onreadystatechange' : 'DOMContentLoaded',
                COMPLETE = 'complete',
                fire = function() {
                    self._fireReady();
                };

            // Set to true once it runs
            readyBound = true;

            // Catch cases where ready() is called after the
            // browser event has already occurred.
            if (doc.readyState === COMPLETE) {
                return fire();
            }

            // w3c mode
            if (doc.addEventListener) {
                function domReady() {
                    doc.removeEventListener(eventType, domReady, false);
                    fire();
                }
                doc.addEventListener(eventType, domReady, false);
            }
            // IE event model is used
            else {
                function stateChange() {
                    if (doc.readyState === COMPLETE) {
                        doc.detachEvent(eventType, stateChange);
                        fire();
                    }
                }

                // ensure firing before onload, maybe late but safe also for iframes
                doc.attachEvent(eventType, stateChange);

                // A fallback to window.onload, that will always work.
                win.attachEvent('onload', fire);

                if (win == win.top) { // not an iframe
                    function readyScroll() {
                        try {
                            // Ref: http://javascript.nwbox.com/IEContentLoaded/
                            doScroll('left');
                            fire();
                        } catch(ex) {
                            setTimeout(readyScroll, 1);
                        }
                    }
                    readyScroll();
                }
            }
        },

        /**
         * Executes functions bound to ready event.
         */
        _fireReady: function() {
            if(isReady) return;
            
            // Remember that the DOM is ready
            isReady = true;

            // If there are functions bound, to execute
            if (readyList) {
                // Execute all of them
                var fn, i = 0;
                while (fn = readyList[i++]) {
                    fn.call(win, this);
                }

                // Reset the list of functions
                readyList = null;
            }
        },

        /**
         * Copies all the properties of s to r.
         * @return {Object} the augmented object
         */
        mix: mix,

        /**
         * Returns a new object containing all of the properties of
         * all the supplied objects. The properties from later objects
         * will overwrite those in earlier objects. Passing in a
         * single object will create a shallow copy of it.
         * @return {Object} the new merged object
         */
        merge: function() {
            var o = {}, i, l = arguments.length;
            for (i = 0; i < l; ++i) {
                mix(o, arguments[i]);
            }
            return o;
        },

        /**
         * Applies prototype properties from the supplier to the receiver.
         * @return {Object} the augmented object
         */
        augment: function(/*r, s1, s2, ..., ov, wl*/) {
            var args = arguments, len = args.length - 2,
                r = args[0], ov = args[len], wl = args[len + 1],
                i = 1;
            
            if(!S.isArray(wl)) {
                ov = wl;
                wl = undefined;
                len++;
            }

            if(!S.isBoolean(ov)) {
                ov = undefined;
                len++;
            }

            for(; i < len; i++) {
                mix(r.prototype, args[i].prototype || args[i], ov, wl);
            }

            return r;
        },

        /**
         * Utility to set up the prototype, constructor and superclass properties to
         * support an inheritance strategy that can chain constructors and methods.
         * Static members will not be inherited.
         * @param r {Function} the object to modify
         * @param s {Function} the object to inherit
         * @param px {Object} prototype properties to add/override
         * @param sx {Object} static properties to add/override
         * @return r {Object}
         */
        extend: function(r, s, px, sx) {
            if (!s || !r) return r;

            var OP = Object.prototype,
                O = function (o) {
                        function F() {}
                        F.prototype = o;
                        return new F();
                    },
                sp = s.prototype,
                rp = O(sp);

            r.prototype = rp;
            rp.constructor = r;
            r.superclass = sp;

            // assign constructor property
            if (s !== Object && sp.constructor === OP.constructor) {
                sp.constructor = s;
            }

            // add prototype overrides
            if (px) {
                mix(rp, px);
            }

            // add object overrides
            if (sx) {
                mix(r, sx);
            }

            return r;
        },

        /**
         * Returns the namespace specified and creates it if it doesn't exist. Be careful
         * when naming packages. Reserved words may work in some browsers and not others.
         * <code>
         * S.namespace('KISSY.app'); // returns KISSY.app
         * S.namespace('app.Shop'); // returns KISSY.app.Shop
         * </code>
         * @return {Object}  A reference to the last namespace object created
         */
        namespace: function() {
            var l = arguments.length, o = null, i, j, p;

            for (i = 0; i < l; ++i) {
                p = ('' + arguments[i]).split('.');
                o = this;
                for (j = (win[p[0]] === o) ? 1 : 0; j < p.length; ++j) {
                    o = o[p[j]] = o[p[j]] || {};
                }
            }
            return o;
        },

        /**
         * create app based on KISSY.
         * @param name {String} the app name
         * @param sx {Object} static properties to add/override
         * <code>
         * S.app('TB');
         * TB.namespace('app'); // returns TB.app
         * </code>
         * @return {Object}  A reference to the app global object
         */
        app: function(name, sx) {
            var O = win[name] || {};

            mix(O, this, true, ['_init', 'add', 'namespace']);
            O._init();

            return mix((win[name] = O), typeof sx === 'function' ? sx() : sx);
        },

        /**
         * Prints debug info.
         * @param msg {String} the message to log.
         * @param cat {String} the log category for the message. Default
         *        categories are "info", "warn", "error", "time" etc.
         * @param src {String} the source of the the message (opt)
         * @return {KISSY}
         */
        log: function(msg, cat, src) {
            if (this.Config.debug) {
                if(src) {
                    msg = src + ': ' + msg;
                }
                if (win['console'] !== undefined && console.log) {
                    console[cat && console[cat] ? cat : 'log'](msg);
                }
            }
            return this;
        },

        /**
         * Throws error message.
         */
        error: function(msg) {
            if(this.Config.debug) {
                throw msg;
            }
        }
    });

    S._init();

    // build 时，会将 @DEBUG@ 替换为空
    S.Config = { debug: '@DEBUG@' };

})(window, 'KISSY');

/**
 * NOTES:
 *
 * 2010.04
 *  - 移除掉 weave 方法，尚未考虑周全。
 *
 * 2010.01
 *  - add 方法决定内部代码的基本组织方式（用 module 和 submodule 来组织代码）。
 *  - ready 方法决定外部代码的基本调用方式，提供了一个简单的弱沙箱。
 *  - mix, merge, augment, extend 方法，决定了类库代码的基本实现方式，充分利用 mixin 特性和 prototype 方式来实现代码。
 *  - namespace, app 方法，决定子库的实现和代码的整体组织。
 *  - log, error 方法，简单的调试工具和报错机制。
 *  - 考虑简单够用和 2/8 原则，去掉对 YUI3 沙箱的模拟。（archives/2009 r402）
 *
 * TODO:
 *  - 模块动态加载 require 方法的实现。
 * 
 */
/**
 * @module  kissy-lang
 * @author  lifesinger@gmail.com
 */
KISSY.add('kissy-lang', function(S, undefined) {

    var win = window, doc = document, loc = location,
        AP = Array.prototype,
        indexOf = AP.indexOf, filter = AP.filter,
        trim = String.prototype.trim,
        toString = Object.prototype.toString,
        encode = encodeURIComponent,
        decode = decodeURIComponent,
        REG_TRIM = /^\s+|\s+$/g,
        REG_ARR_KEY = /^(\w+)\[\]$/,
        REG_NOT_WHITE = /\S/;

    S.mix(S, {

        /**
         * Determines whether or not the provided object is undefined.
         */
        isUndefined: function(o) {
            return o === undefined;
        },

        /**
         * Determines whether or not the provided object is a boolean.
         */
        isBoolean: function(o) {
            return typeof o === 'boolean';
        },

        /**
         * Determines whether or not the provided object is a string.
         */
        isString: function(o) {
            return typeof o === 'string';
        },

        /**
         * Determines whether or not the provided item is a legal number.
         * NOTICE: Infinity and NaN return false.
         */
        isNumber: function(o) {
            return typeof o === 'number' && isFinite(o);
        },

        /**
         * Checks to see if an object is a plain object (created using "{}" or "new Object").
         */
        isPlainObject: function(o) {
            // Make sure that DOM nodes and window objects don't pass through.
            return o && toString.call(o) === '[object Object]' && !o['nodeType'] && !o['setInterval'];
        },

        /**
         * Checks to see if an object is empty.
         */
        isEmptyObject: function(o) {
            for (var p in o) {
                return false;
            }
            return true;
        },

        /**
         * Determines whether or not the provided object is a function.
         * NOTICE: DOM methods and functions like alert aren't supported. They return false on IE.
         */
        isFunction: function(o) {
            //return typeof o === 'function';
            // Safari 下，typeof NodeList 也返回 function
            return toString.call(o) === '[object Function]';
        },

        /**
         * Determines whether or not the provided object is an array.
         */
        isArray: function(o) {
            return toString.call(o) === '[object Array]';
        },

        /**
         * Removes the whitespace from the beginning and end of a string.
         */
        trim: trim ?
              function(str) {
                  return (str == undefined) ? '' : trim.call(str);
              } :
              function(str) {
                  return (str == undefined) ? '' : str.toString().replace(REG_TRIM, '');
              },

        /**
         * Executes the supplied function on each item in the array.
         * @param arr {Array} the array to iterate
         * @param fn {Function} the function to execute on each item. The function
         *        receives three arguments: the value, the index, the full array.
         * @param context {Object} (opt)
         */
        each: function(arr, fn, context) {
            var l = (arr && arr.length) || 0, i = 0;
            for (; i < l; ++i) {
                fn.call(context || win, arr[i], i, arr);
            }
        },

        /**
         * Search for a specified value within an array.
         */
        indexOf: indexOf ?
                 function(elem, arr) {
                     return indexOf.call(arr, elem);
                 } :
                 function(elem, arr) {
                     for (var i = 0, len = arr.length; i < len; ++i) {
                         if (arr[i] === elem) {
                             return i;
                         }
                     }
                     return -1;
                 },

        /**
         * Search for a specified value index within an array.
         */
        inArray: function(elem, arr) {
            return S.indexOf(elem, arr) > -1;
        },

        /**
         * Converts object to a true array.
         */
        makeArray: function(o) {
            if (o === null || o === undefined) return [];
            if (S.isArray(o)) return o;

            // The strings and functions also have 'length'
            if (typeof o.length !== 'number' || typeof o === 'string' || S.isFunction(o)) {
                return [o];
            }

            // ie 不支持用 slice 转换 NodeList, 降级到普通方法
            if (o.item && S.UA.ie) {
                var ret = [], i = 0, len = o.length;
                for (; i < len; ++i) {
                    ret[i] = o[i];
                }
                return ret;
            }

            // array-like
            return AP.slice.call(o);
        },
        /**
        * Executes the supplied function on each item in the array.
        * Returns a new array containing the items that the supplied
        * function returned true for.
        * @param arr {Array} the array to iterate
        * @param fn {Function} the function to execute on each item
        * @param context {Object} optional context object
        * @return {Array} The items on which the supplied function
        *         returned true. If no items matched an empty array is
        *         returned.
        */
        filter: filter ?
            function(arr, fn, context) {
                return filter.call(arr, fn, context);
            } :
            function(arr, fn, context) {
                var ret = [];
                S.each(arr, function(item, i, arr) {
                    if (fn.call(context, item, i, arr)) {
                        ret.push(item);
                    }
                });
                return ret;
            },

        /**
         * Creates a serialized string of an array or object.
         * <code>
         * {foo: 1, bar: 2}    // -> 'foo=1&bar=2'
         * {foo: 1, bar: [2, 3]}    // -> 'foo=1&bar[]=2&bar[]=3'
         * {foo: '', bar: 2}    // -> 'foo=&bar=2'
         * {foo: undefined, bar: 2}    // -> 'foo=undefined&bar=2'
         * {foo: true, bar: 2}    // -> 'foo=true&bar=2'
         * </code>
         */
        param: function(o) {
            // 非 plain object, 直接返回空
            if (!S.isPlainObject(o)) return '';

            var buf = [], key, val;
            for (key in o) {
                val = o[key];
                key = encode(key);

                // val 为有效的非数组值
                if (isValidParamValue(val)) {
                    buf.push(key, '=', encode(val + ''), '&');
                }
                // val 为非空数组
                else if (S.isArray(val) && val.length) {
                    for (var i = 0, len = val.length; i < len; ++i) {
                        if (isValidParamValue(val[i])) {
                            buf.push(key, '[]=', encode(val[i] + ''), '&');
                        }
                    }
                }
                // 其它情况：包括空数组、不是数组的 object（包括 Function, RegExp, Date etc.），直接丢弃
            }
            buf.pop();
            return buf.join('');
        },

        /**
         * Parses a URI-like query string and returns an object composed of parameter/value pairs.
         * <code>
         * 'section=blog&id=45'        // -> {section: 'blog', id: '45'}
         * 'section=blog&tag[]=js&tag[]=doc' // -> {section: 'blog', tag: ['js', 'doc']}
         * 'tag=ruby%20on%20rails'        // -> {tag: 'ruby on rails'}
         * 'id=45&raw'        // -> {id: '45', raw: ''}
         * </code>
         */
        unparam: function(str, sep) {
            if (typeof str !== 'string' || (str = S.trim(str)).length === 0) return {};

            var ret = {},
                pairs = str.split(sep || '&'),
                pair, key, val, m,
                i = 0, len = pairs.length;

            for (; i < len; ++i) {
                pair = pairs[i].split('=');
                key = decode(pair[0]);

                // pair[1] 可能包含 gbk 编码的中文，而 decodeURIComponent 仅能处理 utf-8 编码的中文，否则报错
                try {
                    val = decode(pair[1] || '');
                } catch (ex) {
                    val = pair[1] || '';
                }

                if ((m = key.match(REG_ARR_KEY)) && m[1]) {
                    ret[m[1]] = ret[m[1]] || [];
                    ret[m[1]].push(val);
                } else {
                    ret[key] = val;
                }
            }
            return ret;
        },

        /**
         * Executes the supplied function in the context of the supplied
         * object 'when' milliseconds later. Executes the function a
         * single time unless periodic is set to true.
         * @param fn {Function|String} the function to execute or the name of the method in
         *        the 'o' object to execute.
         * @param when {Number} the number of milliseconds to wait until the fn is executed.
         * @param periodic {Boolean} if true, executes continuously at supplied interval
         *        until canceled.
         * @param o {Object} the context object.
         * @param data [Array] that is provided to the function. This accepts either a single
         *        item or an array. If an array is provided, the function is executed with
         *        one parameter for each array item. If you need to pass a single array
         *        parameter, it needs to be wrapped in an array [myarray].
         * @return {Object} a timer object. Call the cancel() method on this object to stop
         *         the timer.
         */
        later: function(fn, when, periodic, o, data) {
            when = when || 0;
            o = o || { };
            var m = fn, d = S.makeArray(data), f, r;

            if (typeof fn === 'string') {
                m = o[fn];
            }

            if (!m) {
                S.error('method undefined');
            }

            f = function() {
                m.apply(o, d);
            };

            r = (periodic) ? setInterval(f, when) : setTimeout(f, when);

            return {
                id: r,
                interval: periodic,
                cancel: function() {
                    if (this.interval) {
                        clearInterval(r);
                    } else {
                        clearTimeout(r);
                    }
                }
            };
        },

        /**
         * Gets current date in milliseconds.
         */
        now: function() {
            return new Date().getTime();
        },

        /**
         * Evalulates a script in a global context.
         */
        globalEval: function(data) {
            if (data && REG_NOT_WHITE.test(data)) {
                // Inspired by code by Andrea Giammarchi
                // http://webreflection.blogspot.com/2007/08/global-scope-evaluation-and-dom.html
                var head = doc.getElementsByTagName('head')[0] || doc.documentElement,
                    script = doc.createElement('script');

                // It works! All browsers support!
                script.text = data;

                // Use insertBefore instead of appendChild to circumvent an IE6 bug.
                // This arises when a base node is used.
                head.insertBefore(script, head.firstChild);
                head.removeChild(script);
            }
        }
    });

    function isValidParamValue(val) {
        var t = typeof val;
        // val 为 null, undefined, number, string, boolean 时，返回 true
        return val === null || (t !== 'object' && t !== 'function');
    }

    // 可以通过在 url 上加 ?ks-debug 来开启 debug 模式
    if(loc && loc.search && loc.search.indexOf('ks-debug') !== -1){
        S.Config.debug = true;
    }
});

/**
 * NOTES:
 *
 *  2010.06
 *   - unparam 里的 try catch 让人很难受，但为了顺应国情，决定还是留着。
 *
 *  2010.05
 *   - 增加 filter 方法。
 *   - globalEval 中，直接采用 text 赋值，去掉 appendChild 方式。
 *
 *  2010.04
 *   - param 和 unparam 应该放在什么地方合适？有点纠结，目前暂放此处。
 *   - param 和 unparam 是不完全可逆的。对空值的处理和 cookie 保持一致。
 *
 * TODO:
 *   - 分析 jq 的 isPlainObject 对 constructor 等细节处理
 *
 */
/**
 * @module  kissy-ua
 * @author  lifesinger@gmail.com
 */
KISSY.add('kissy-ua', function(S) {

    var ua = navigator.userAgent,
        m,
        o = {
            webkit: 0,
            chrome: 0,
            safari: 0,
            gecko: 0,
            firefox:  0,
            ie: 0,
            opera: 0,
            mobile: ''
        },
        numberify = function(s) {
            var c = 0;
            // convert '1.2.3.4' to 1.234
            return parseFloat(s.replace(/\./g, function() {
                return (c++ === 0) ? '.' : '';
            }));
        };

    // WebKit
    if ((m = ua.match(/AppleWebKit\/([\d.]*)/)) && m[1]) {
        o.webkit = numberify(m[1]);

        // Chrome
        if ((m = ua.match(/Chrome\/([\d.]*)/)) && m[1]) {
            o.chrome = numberify(m[1]);
        }
        // Safari
        else if ((m = ua.match(/\/([\d.]*) Safari/)) && m[1]) {
            o.safari = numberify(m[1]);
        }

        // Apple Mobile
        if (/ Mobile\//.test(ua)) {
            o.mobile = 'Apple'; // iPad, iPhone or iPod Touch
        }
        // Other WebKit Mobile Browsers
        else if ((m = ua.match(/NokiaN[^\/]*|Android \d\.\d|webOS\/\d\.\d/))) {
            o.mobile = m[0]; // Nokia N-series, Android, webOS, ex: NokiaN95
        }
    }
    // NOT WebKit
    else {
        // Opera
        if ((m = ua.match(/Opera\/.* Version\/([\d.]*)/)) && m[1]) {
            o.opera = numberify(m[1]);

            // Opera Mini
            if ((ua.match(/Opera Mini[^;]*/))) {
                o.mobile = m[0]; // ex: Opera Mini/2.0.4509/1316
            }

        // NOT WebKit or Opera
        } else {
            // MSIE
            if ((m = ua.match(/MSIE\s([^;]*)/)) && m[1]) {
                o.ie = numberify(m[1]);

            // NOT WebKit, Opera or IE
            } else {
                // Gecko
                if ((m = ua.match(/Gecko/))) {
                    o.gecko = 1; // Gecko detected, look for revision
                    if ((m = ua.match(/rv:([\d.]*)/)) && m[1]) {
                        o.gecko = numberify(m[1]);
                    }

                    // Firefox
                    if ((m = ua.match(/Firefox\/([\d.]*)/)) && m[1]) {
                        o.firefox = numberify(m[1]);
                    }
                }
            }
        }
    }

    S.UA = o;
});

/**
 * NOTES:
 *
 * 2010.03
 *  - jQuery, YUI 等类库都推荐用特性探测替代浏览器嗅探。特性探测的好处是能自动适应未来设备和未知设备，比如
 *    if(document.addEventListener) 假设 IE9 支持标准事件，则代码不用修改，就自适应了“未来浏览器”。
 *    对于未知浏览器也是如此。但是，这并不意味着浏览器嗅探就得彻底抛弃。当代码很明确就是针对已知特定浏览器的，
 *    同时并非是某个特性探测可以解决时，用浏览器嗅探反而能带来代码的简洁，同时也也不会有什么后患。总之，一切
 *    皆权衡。
 *  - UA.ie && UA.ie < 8 并不意味着浏览器就不是 IE8, 有可能是 IE8 的兼容模式。进一步的判断需要使用 documentMode.
 *
 * TODO:
 *  - test mobile
 *  - 是否需要加入 maxthon 等国内浏览器嗅探？
 * 
 */
