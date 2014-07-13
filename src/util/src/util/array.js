/**
 * @ignore
 * array utilities of lang
 * @author yiminghe@gmail.com
 */

var TRUE = true,
    undef,
    AP = Array.prototype,
    indexOf = AP.indexOf,
    lastIndexOf = AP.lastIndexOf,
    filter = AP.filter,
    every = AP.every,
    some = AP.some,
    util = require('./base'),
    map = AP.map,
    FALSE = false;

util.mix(util, {
    /**
     * Search for a specified value within an array.
     * @param item individual item to be searched
     * @method
     * @member KISSY
     * @param {Array} arr the array of items where item will be search
     * @return {number} item's index in array
     */
    indexOf: indexOf ?
        function (item, arr, fromIndex) {
            return fromIndex === undef ?
                indexOf.call(arr, item) :
                indexOf.call(arr, item, fromIndex);
        } :
        function (item, arr, fromIndex) {
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
    lastIndexOf: (lastIndexOf) ?
        function (item, arr, fromIndex) {
            return fromIndex === undef ?
                lastIndexOf.call(arr, item) :
                lastIndexOf.call(arr, item, fromIndex);
        } :
        function (item, arr, fromIndex) {
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
     * @param [override] {Boolean} if override is TRUE, util.unique([a, b, a]) => [b, a].
     * if override is FALSE, util.unique([a, b, a]) => [a, b]
     * @return {Array} a copy of the array with duplicate entries removed
     * @member KISSY
     */
    unique: function (a, override) {
        var b = a.slice();
        if (override) {
            b.reverse();
        }
        var i = 0,
            n,
            item;

        while (i < b.length) {
            item = b[i];
            while ((n = util.lastIndexOf(item, b)) !== i) {
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
        return util.indexOf(item, arr) > -1;
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
    filter: filter ?
        function (arr, fn, context) {
            return filter.call(arr, fn, context || this);
        } :
        function (arr, fn, context) {
            var ret = [];
            util.each(arr, function (item, i, arr) {
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
        }

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
                }

                // if array contains no values, no initial value to return
                k += 1;
                if (k >= len) {
                    throw new TypeError();
                }
            }
            while (TRUE);
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
    every: every ?
        function (arr, fn, context) {
            return every.call(arr, fn, context || this);
        } :
        function (arr, fn, context) {
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
    some: some ?
        function (arr, fn, context) {
            return some.call(arr, fn, context || this);
        } :
        function (arr, fn, context) {
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
     * do not pass form.elements to this function ie678 bug.
     * passing arguments is not recommended.
     * https://github.com/petkaantonov/bluebird/wiki/Optimization-killers
     * @param o {object|Array} array like object or array
     * @return {Array} native Array
     * @member KISSY
     */
    makeArray: function (o) {
        if (o == null) {
            return [];
        }
        if (util.isArray(o)) {
            return o;
        }
        var lengthType = typeof o.length,
            oType = typeof o;
        // The strings and functions also have 'length'
        if (lengthType !== 'number' ||
            // select element
            // https://github.com/kissyteam/kissy/issues/537
            typeof o.nodeName === 'string' ||
            // window
            /*jshint eqeqeq:false*/
            (o != null && o == o.window) ||
            oType === 'string' ||
            // https://github.com/ariya/phantomjs/issues/11478
            (oType === 'function' && !('item' in o && lengthType === 'number'))) {
            return [o];
        }
        var ret = [];
        for (var i = 0, l = o.length; i < l; i++) {
            ret[i] = o[i];
        }
        return ret;
    }
});