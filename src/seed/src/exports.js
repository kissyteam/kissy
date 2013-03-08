/**
 * @ignore
 * 1. export KISSY 's functionality to module system
 * 2. export light-weighted json parse
 */
(function (S) {

    // empty mod for conditional loading
    S.add('empty', S.noop);

    S.add('promise', function () {
        return S.Promise;
    });

    S.add('ua', function () {
        return S.UA;
    });

    S.add('uri', function () {
        return S.Uri;
    });

    S.add('path', function () {
        return S.Path
    });

    var UA = S.UA,
        Env = S.Env,
        win = Env.host,
        doc = win.document || {},
        documentMode = doc.documentMode,
        nativeJSON = ((UA.nodejs && typeof global === 'object') ? global : win).JSON;

    // ie 8.0.7600.16315@win7 json bug!
    if (documentMode && documentMode < 9) {
        nativeJSON = null;
    }

    if (nativeJSON) {
        S.add('json', function () {
            return S.JSON = nativeJSON;
        });
        // light weight json parse
        S.parseJSON = function (data) {
            return nativeJSON.parse(data);
        };
    } else {
        // JSON RegExp
        var INVALID_CHARS_REG = /^[\],:{}\s]*$/,
            INVALID_BRACES_REG = /(?:^|:|,)(?:\s*\[)+/g,
            INVALID_ESCAPES_REG = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,
            INVALID_TOKENS_REG = /"[^"\\\r\n]*"|true|false|null|-?(?:\d+\.|)\d+(?:[eE][+-]?\d+|)/g;
        S.parseJSON = function (data) {
            if (data === null) {
                return data;
            }
            if (typeof data === "string") {
                // for ie
                data = S.trim(data);
                if (data) {
                    // from json2
                    if (INVALID_CHARS_REG.test(data.replace(INVALID_ESCAPES_REG, "@")
                        .replace(INVALID_TOKENS_REG, "]")
                        .replace(INVALID_BRACES_REG, ""))) {

                        return ( new Function("return " + data) )();
                    }
                }
            }
            return S.error("Invalid JSON: " + data);
        };
    }

    // exports for nodejs
    if (S.UA.nodejs) {
        S.KISSY = S;
        module.exports = S;
    }

})(KISSY);