/**
 * @ignore
 * type judgement
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 */
var util = require('./base');
// [[Class]] -> type pairs
var class2type = {},
    FALSE = false,
    undef,
    noop = util.noop,
    OP = Object.prototype,
    toString = OP.toString;

function hasOwnProperty(o, p) {
    return OP.hasOwnProperty.call(o, p);
}

util.mix(util, {
    /**
     * Determine the internal JavaScript [[Class]] of an object.
     * @member KISSY
     */
    type: function (o) {
        return o == null ?
            String(o) :
            class2type[toString.call(o)] || 'object';
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
        if (!obj || util.type(obj) !== 'object' || obj.nodeType ||
            /*jshint eqeqeq:false*/
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
        }

        // Own properties are enumerated firstly, so to speed up,
        // if last one is own, then all properties are own.
        /*jshint noempty:false*/
        for (key in obj) {
        }

        return ((key === undef) || hasOwnProperty(obj, key));
    }
});

if ('@DEBUG@') {
    util.mix(util, {
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
        class2type['[object ' + name + ']'] = (lc = name.toLowerCase());

        // add isBoolean/isNumber/...
        util['is' + name] = function (o) {
            return util.type(o) === lc;
        };
    })(types[i], i);
}

util.isArray = Array.isArray || util.isArray;