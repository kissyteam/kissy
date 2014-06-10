var util = require('./base');
// Json RegExp
var INVALID_CHARS_REG = /^[\],:{}\s]*$/,
    INVALID_BRACES_REG = /(?:^|:|,)(?:\s*\[)+/g,
    INVALID_ESCAPES_REG = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,
    INVALID_TOKENS_REG = /"[^"\\\r\n]*"|true|false|null|-?(?:\d+\.|)\d+(?:[eE][+-]?\d+|)/g;

util.parseJson = function (data) {
    if (data === null) {
        return data;
    }
    if (typeof data === 'string') {
        // for ie
        data = util.trim(data);
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
    return util.error('Invalid Json: ' + data);
};
