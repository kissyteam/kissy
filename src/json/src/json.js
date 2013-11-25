/**
 * @ignore
 * Json emulator for KISSY
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var stringify = require('./json/stringify'),
        parse = require('./json/parse');
    /**
     * The Json object contains methods for converting values to JavaScript Object Notation (Json)
     * and for converting Json to values.
     * @class KISSY.JSON
     * @singleton
     */
    return S.JSON = {
        /**
         * Convert a value to Json, optionally replacing values if a replacer function is specified,
         * or optionally including only the specified properties if a replacer array is specified.
         * @method
         * @param value The value to convert to a Json string.
         * @param [replacer]
         * The replacer parameter can be either a function or an array. As a function, it takes two parameters, the key and the value being stringified. Initially it gets called with an empty key representing the object being stringified, and it then gets called for each property on the object or array being stringified. It should return the value that should be added to the Json string, as follows:

         * - If you return a Number, the string corresponding to that number is used as the value for the property when added to the Json string.
         * - If you return a String, that string is used as the property's value when adding it to the Json string.
         * - If you return a Boolean, "true" or "false" is used as the property's value, as appropriate, when adding it to the Json string.
         * - If you return any other object, the object is recursively stringified into the Json string, calling the replacer function on each property, unless the object is a function, in which case nothing is added to the Json string.
         * - If you return undefined, the property is not included in the output Json string.
         *
         * **Note:** You cannot use the replacer function to remove values from an array. If you return undefined or a function then null is used instead.
         *
         * @param [space] space Causes the resulting string to be pretty-printed.
         * The space argument may be used to control spacing in the final string.
         * If it is a number, successive levels in the stringification will each be indented by this many space characters (up to 10).
         * If it is a string, successive levels will indented by this string (or the first ten characters of it).
         * @return {String}
         */
        stringify: stringify,
        /**
         * Parse a string as Json, optionally transforming the value produced by parsing.
         * @param {String} text The string to parse as Json.
         * @param {Function} [reviver] If a function, prescribes how the value originally produced by parsing is transformed,
         * before being returned.
         */
        parse: parse
    };
});