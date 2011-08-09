/**
 * @module  lang
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 * @description this code can run in any ecmascript compliant environment
 */
(function(S, undefined) {

    var host = S.__HOST,
        OP = Object.prototype,
        toString = OP.toString,
        hasOwnProperty = OP.hasOwnProperty,
        AP = Array.prototype,
        indexOf = AP.indexOf,
        lastIndexOf = AP.lastIndexOf,
        filter = AP.filter,
        //reduce = AP.reduce,
        trim = String.prototype.trim,
        map = AP.map,
        EMPTY = '',
        HEX_BASE = 16,
        CLONE_MARKER = '__~ks_cloned',
        COMPARE_MARKER = '__~ks_compared',
        RE_TRIM = /^\s+|\s+$/g,
        encode = encodeURIComponent,
        decode = decodeURIComponent,
        SEP = '&',
        EQ = '=',
        // [[Class]] -> type pairs
        class2type = {},
        htmlEntities = {
            '&amp;': '&',
            '&gt;': '>',
            '&lt;': '<',
            '&quot;': '"'
        },
        reverseEntities = {},
        escapeReg,
        unEscapeReg;

    for (var k in htmlEntities) {
        reverseEntities[htmlEntities[k]] = k;
    }

    function getEscapeReg() {
        if (escapeReg) {
            return escapeReg
        }
        var str = EMPTY;
        S.each(htmlEntities, function(entity) {
            str += entity + '|';
        });
        str = str.slice(0, -1);
        return escapeReg = new RegExp(str, "g");
    }

    function getUnEscapeReg() {
        if (unEscapeReg) {
            return unEscapeReg
        }
        var str = EMPTY;
        S.each(reverseEntities, function(entity) {
            str += entity + '|';
        });
        str += '&#(\\d{1,5});';
        return unEscapeReg = new RegExp(str, "g");
    }


    function isValidParamValue(val) {
        var t = typeof val;
        // If the type of val is null, undefined, number, string, boolean, return true.
        return nullOrUndefined(val) || (t !== 'object' && t !== 'function');
    }

    S.mix(S, {
        noop:function() {
        },

        /**
         * Determine the internal JavaScript [[Class]] of an object.
         */
        type: function(o) {
            return nullOrUndefined(o) ?
                String(o) :
                class2type[toString.call(o)] || 'object';
        },

        isNullOrUndefined:nullOrUndefined,

        isNull: function(o) {
            return o === null;
        },

        isUndefined: function(o) {
            return o === undefined;
        },

        /**
         * Checks to see if an object is empty.
         */
        isEmptyObject: function(o) {
            for (var p in o) {
                if (p !== undefined) {
                    return false;
                }
            }
            return true;
        },

        /**
         * Checks to see if an object is a plain object (created using "{}"
         * or "new Object()" or "new FunctionClass()").
         * Ref: http://lifesinger.org/blog/2010/12/thinking-of-isplainobject/
         */
        isPlainObject: function(o) {
            /**
             * note by yiminghe
             * isPlainObject(node=document.getElementById("xx")) -> false
             * toString.call(node) : ie678 == '[object Object]',other =='[object HTMLElement]'
             * 'isPrototypeOf' in node : ie678 === false ,other === true
             */

            return o && toString.call(o) === '[object Object]' && 'isPrototypeOf' in o;
        },



        /**
         * 两个目标是否内容相同
         *
         * @param a 比较目标1
         * @param b 比较目标2
         * @param [mismatchKeys] internal use
         * @param [mismatchValues] internal use
         */
        equals : function(a, b, /*internal use*/mismatchKeys, /*internal use*/mismatchValues) {
            // inspired by jasmine
            mismatchKeys = mismatchKeys || [];
            mismatchValues = mismatchValues || [];

            if (a === b) {
                return true;
            }
            if (a === undefined || a === null || b === undefined || b === null) {
                // need type coercion
                return nullOrUndefined(a) && nullOrUndefined(b);
            }
            if (a instanceof Date && b instanceof Date) {
                return a.getTime() == b.getTime();
            }
            if (S.isString(a) && S.isString(b)) {
                return (a == b);
            }
            if (S.isNumber(a) && S.isNumber(b)) {
                return (a == b);
            }
            if (typeof a === "object" && typeof b === "object") {
                return compareObjects(a, b, mismatchKeys, mismatchValues);
            }
            // Straight check
            return (a === b);
        },

        /**
         * Creates a deep copy of a plain object or array. Others are returned untouched.
         */
        clone: function(o, f) {
            var marked = {},
                ret = cloneInternal(o, f, marked);
            S.each(marked, function(v) {
                // 清理在源对象上做的标记
                v = v.o;
                if (v[CLONE_MARKER]) {
                    try {
                        delete v[CLONE_MARKER];
                    } catch (e) {
                        S.log("delete CLONE_MARKER error : ");
                        S.log(e);
                        v[CLONE_MARKER] = undefined;
                    }
                }
            });
            marked = undefined;
            return ret;
        },

        /**
         * Removes the whitespace from the beginning and end of a string.
         */
        trim: trim ?
            function(str) {
                return nullOrUndefined(str) ? EMPTY : trim.call(str);
            } :
            function(str) {
                return nullOrUndefined(str) ? EMPTY : str.toString().replace(RE_TRIM, EMPTY);
            },

        /**
         * Substitutes keywords in a string using an object/array.
         * Removes undefined keywords and ignores escaped keywords.
         */
        substitute: function(str, o, regexp) {
            if (!S.isString(str)
                || !S.isPlainObject(o)) {
                return str;
            }

            return str.replace(regexp || /\\?\{([^{}]+)\}/g, function(match, name) {
                if (match.charAt(0) === '\\') {
                    return match.slice(1);
                }
                return (o[name] === undefined) ? EMPTY : o[name];
            });
        },

        /**
         * Executes the supplied function on each item in the array.
         * @param object {Object} the object to iterate
         * @param fn {Function} the function to execute on each item. The function
         *        receives three arguments: the value, the index, the full array.
         * @param context {Object} (opt)
         */
        each: function(object, fn, context) {
            var key,
                val,
                i = 0,
                length = object && object.length,
                isObj = length === undefined || S.type(object) === 'function';
            context = context || host;

            if (isObj) {
                for (key in object) {
                    if (fn.call(context, object[key], key, object) === false) {
                        break;
                    }
                }
            } else {
                for (val = object[0];
                     i < length && fn.call(context, val, i, object) !== false; val = object[++i]) {
                }
            }

            return object;
        },

        /**
         * Search for a specified value within an array.
         */
        indexOf: indexOf ?
            function(item, arr) {
                return indexOf.call(arr, item);
            } :
            function(item, arr) {
                for (var i = 0, len = arr.length; i < len; ++i) {
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
         */
        lastIndexOf: (lastIndexOf) ?
            function(item, arr) {
                return lastIndexOf.call(arr, item);
            } :
            function(item, arr) {
                for (var i = arr.length - 1; i >= 0; i--) {
                    if (arr[i] === item) {
                        break;
                    }
                }
                return i;
            },

        /**
         * Returns a copy of the array with the duplicate entries removed
         * @param a {Array} the array to find the subset of uniques for
         * @param override {Boolean}
         *        if override is true, S.unique([a, b, a]) => [b, a]
         *        if override is false, S.unique([a, b, a]) => [a, b]
         * @return {Array} a copy of the array with duplicate entries removed
         */
        unique: function(a, override) {
            var b = a.slice();
            if (override) {
                b.reverse();
            }
            var i = 0,
                n,
                item;

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
         */
        inArray: function(item, arr) {
            return S.indexOf(item, arr) > -1;
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
                return filter.call(arr, fn, context || this);
            } :
            function(arr, fn, context) {
                var ret = [];
                S.each(arr, function(item, i, arr) {
                    if (fn.call(context || this, item, i, arr)) {
                        ret.push(item);
                    }
                });
                return ret;
            },
        // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/map
        map:map ?
            function(arr, fn, context) {
                return map.call(arr, fn, context || this);
            } :
            function(arr, fn, context) {
                var len = arr.length,
                    res = new Array(len);
                for (var i = 0; i < len; i++) {
                    var el = S.isString(arr) ? arr.charAt(i) : arr[i];
                    if (el
                        ||
                        //ie<9 in invalid when typeof arr == string
                        i in arr) {
                        res[i] = fn.call(context || this, el, i, arr);
                    }
                }
                return res;
            },

        /**
         * @refer  https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/reduce
         */
        reduce:/*
         NaN ?
         reduce ? function(arr, callback, initialValue) {
         return arr.reduce(callback, initialValue);
         } : */function(arr, callback, initialValue) {
            var len = arr.length;
            if (typeof callback !== "function") {
                throw new TypeError("callback is not function!");
            }

            // no value to return if no initial value and an empty array
            if (len === 0 && arguments.length == 2) {
                throw new TypeError("arguments invalid");
            }

            var k = 0;
            var accumulator;
            if (arguments.length >= 3) {
                accumulator = arguments[2];
            }
            else {
                do {
                    if (k in arr) {
                        accumulator = arr[k++];
                        break;
                    }

                    // if array contains no values, no initial value to return
                    k += 1;
                    if (k >= len) {
                        throw new TypeError();
                    }
                }
                while (true);
            }

            while (k < len) {
                if (k in arr) {
                    accumulator = callback.call(undefined, accumulator, arr[k], k, arr);
                }
                k++;
            }

            return accumulator;
        },

        /**
         * it is not same with native bind
         * @refer https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
         */
        bind:function(fn, obj) {
            var slice = [].slice,
                args = slice.call(arguments, 2),
                fNOP = function () {
                },
                bound = function () {
                    return fn.apply(this instanceof fNOP ? this : obj,
                        args.concat(slice.call(arguments)));
                };
            fNOP.prototype = fn.prototype;
            bound.prototype = new fNOP();
            return bound;
        },

        /**
         * Gets current date in milliseconds.
         * @refer  https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Date/now
         * http://j-query.blogspot.com/2011/02/timing-ecmascript-5-datenow-function.html
         * http://kangax.github.com/es5-compat-table/
         */
        now: Date.now || function() {
            return +new Date();
        },
        /**
         * frequently used in taobao cookie about nick
         */
        fromUnicode:function(str) {
            return str.replace(/\\u([a-f\d]{4})/ig, function(m, u) {
                return  String.fromCharCode(parseInt(u, HEX_BASE));
            });
        },
        /**
         * escape string to html
         * @refer http://yiminghe.javaeye.com/blog/788929
         * @param str {string} text2html show
         */
        escapeHTML:function(str) {
            return str.replace(getEscapeReg(), function(m) {
                return reverseEntities[m];
            });
        },

        /**
         * unescape html to string
         * @param str {string} html2text
         */
        unEscapeHTML:function(str) {
            return str.replace(getUnEscapeReg(), function(m, n) {
                return htmlEntities[m] || String.fromCharCode(+n);
            });
        },
        /**
         * Converts object to a true array.
         * @param o {object|Array} array like object or array
         * @return {Array}
         */
        makeArray: function(o) {
            if (nullOrUndefined(o)) {
                return [];
            }
            if (S.isArray(o)) {
                return o;
            }

            // The strings and functions also have 'length'
            if (typeof o.length !== 'number' || S.isString(o) || S.isFunction(o)) {
                return [o];
            }
            var ret = [];
            for (var i = 0,l = o.length; i < l; i++) {
                ret[i] = o[i];
            }
            return ret;
        },
        /**
         * Creates a serialized string of an array or object.
         * @return {String}
         * <code>
         * {foo: 1, bar: 2}    // -> 'foo=1&bar=2'
         * {foo: 1, bar: [2, 3]}    // -> 'foo=1&bar=2&bar=3'
         * {foo: '', bar: 2}    // -> 'foo=&bar=2'
         * {foo: undefined, bar: 2}    // -> 'foo=undefined&bar=2'
         * {foo: true, bar: 2}    // -> 'foo=true&bar=2'
         * </code>
         */
        param: function(o, sep, eq, arr) {
            if (!S.isPlainObject(o)) {
                return EMPTY;
            }
            sep = sep || SEP;
            eq = eq || EQ;
            if (S.isUndefined(arr)) {
                arr = true;
            }
            var buf = [], key, val;
            for (key in o) {
                val = o[key];
                key = encode(key);

                // val is valid non-array value
                if (isValidParamValue(val)) {
                    buf.push(key, eq, encode(val + EMPTY), sep);
                }
                // val is not empty array
                else if (S.isArray(val) && val.length) {
                    for (var i = 0, len = val.length; i < len; ++i) {
                        if (isValidParamValue(val[i])) {
                            buf.push(key,
                                (arr ? encode("[]") : EMPTY),
                                eq, encode(val[i] + EMPTY), sep);
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
         * <code>
         * 'section=blog&id=45'        // -> {section: 'blog', id: '45'}
         * 'section=blog&tag=js&tag=doc' // -> {section: 'blog', tag: ['js', 'doc']}
         * 'tag=ruby%20on%20rails'        // -> {tag: 'ruby on rails'}
         * 'id=45&raw'        // -> {id: '45', raw: ''}
         * </code>
         */
        unparam: function(str, sep, eq) {
            if (typeof str !== 'string'
                || (str = S.trim(str)).length === 0) {
                return {};
            }
            sep = sep || SEP;
            eq = eq || EQ;
            var ret = {},
                pairs = str.split(sep),
                pair, key, val,
                i = 0, len = pairs.length;

            for (; i < len; ++i) {
                pair = pairs[i].split(eq);
                key = decode(pair[0]);
                try {
                    val = decode(pair[1] || EMPTY);
                } catch(e) {
                    S.log(e + "decodeURIComponent error : " + pair[1], "error");
                    val = pair[1] || EMPTY;
                }
                if (S.endsWith(key, "[]")) {
                    key = key.substring(0, key.length - 2);
                }
                if (hasOwnProperty.call(ret, key)) {
                    if (S.isArray(ret[key])) {
                        ret[key].push(val);
                    } else {
                        ret[key] = [ret[key],val];
                    }
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

            if (S.isString(fn)) {
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

        startsWith:function(str, prefix) {
            return str.lastIndexOf(prefix, 0) === 0;
        },

        endsWith:function(str, suffix) {
            var ind = str.length - suffix.length;
            return ind >= 0 && str.indexOf(suffix, ind) == ind;
        }

    });

    // for idea ..... auto-hint
    S.mix(S, {
        isBoolean:isValidParamValue,
        isNumber:isValidParamValue,
        isString:isValidParamValue,
        isFunction:isValidParamValue,
        isArray:isValidParamValue,
        isDate:isValidParamValue,
        isRegExp:isValidParamValue,
        isObject:isValidParamValue
    });

    S.each('Boolean Number String Function Array Date RegExp Object'.split(' '),
        function(name, lc) {
            // populate the class2type map
            class2type['[object ' + name + ']'] = (lc = name.toLowerCase());

            // add isBoolean/isNumber/...
            S['is' + name] = function(o) {
                return S.type(o) == lc;
            }
        });

    function nullOrUndefined(o) {
        return S.isNull(o) || S.isUndefined(o);
    }


    function cloneInternal(o, f, marked) {
        var ret = o, isArray, k, stamp;
        // 引用类型要先记录
        if (o &&
            ((isArray = S.isArray(o)) ||
                S.isPlainObject(o) ||
                S.isDate(o) ||
                S.isRegExp(o)
                )) {
            if (o[CLONE_MARKER]) {
                // 对应的克隆后对象
                return marked[o[CLONE_MARKER]].r;
            }
            // 做标记
            o[CLONE_MARKER] = (stamp = S.guid());

            // 先把对象建立起来
            if (isArray) {
                ret = f ? S.filter(o, f) : o.concat();
            } else if (S.isDate(o)) {
                ret = new Date(+o);
            } else if (S.isRegExp(o)) {
                ret = new RegExp(o);
            } else {
                ret = {};
            }

            // 存储源对象以及克隆后的对象
            marked[stamp] = {r:ret,o:o};
        }


        // array or plain object need to be copied recursively
        if (o && (isArray || S.isPlainObject(o))) {
            // clone it
            if (isArray) {
                for (var i = 0; i < ret.length; i++) {
                    ret[i] = cloneInternal(ret[i], f, marked);
                }
            } else {
                for (k in o) {
                    if (k !== CLONE_MARKER &&
                        o.hasOwnProperty(k) &&
                        (!f || (f.call(o, o[k], k, o) !== false))) {
                        ret[k] = cloneInternal(o[k], f, marked);
                    }
                }
            }
        }

        return ret;
    }

    function compareObjects(a, b, mismatchKeys, mismatchValues) {
        // 两个比较过了，无需再比较，防止循环比较
        if (a[COMPARE_MARKER] === b && b[COMPARE_MARKER] === a) {
            return true;
        }
        a[COMPARE_MARKER] = b;
        b[COMPARE_MARKER] = a;
        var hasKey = function(obj, keyName) {
            return (obj !== null && obj !== undefined) && obj[keyName] !== undefined;
        };
        for (var property in b) {
            if (!hasKey(a, property) && hasKey(b, property)) {
                mismatchKeys.push("expected has key '" + property + "', but missing from actual.");
            }
        }
        for (property in a) {
            if (!hasKey(b, property) && hasKey(a, property)) {
                mismatchKeys.push("expected missing key '" + property + "', but present in actual.");
            }
        }
        for (property in b) {
            if (property == COMPARE_MARKER) {
                continue;
            }
            if (!S.equals(a[property], b[property], mismatchKeys, mismatchValues)) {
                mismatchValues.push("'" + property + "' was '" + (b[property] ? (b[property].toString()) : b[property])
                    + "' in expected, but was '" +
                    (a[property] ? (a[property].toString()) : a[property]) + "' in actual.");
            }
        }
        if (S.isArray(a) && S.isArray(b) && a.length != b.length) {
            mismatchValues.push("arrays were not the same length");
        }
        delete a[COMPARE_MARKER];
        delete b[COMPARE_MARKER];
        return (mismatchKeys.length === 0 && mismatchValues.length === 0);
    }

    S.isNullOrUndefined = nullOrUndefined;

})(KISSY, undefined);
