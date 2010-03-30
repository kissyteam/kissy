/**
 * @module  json
 * @author  lifesinger@gmail.com
 * @depends kissy
 */

KISSY.add('json', function(S) {

    var nativeJSON = window.JSON;

    S.JSON = {
        parse: function(data) {
            if (typeof data !== 'string' || !data) {
                return null;
            }

            // Make sure leading/trailing whitespace is removed (IE can't handle it)
            data = S.trim(data);

            // Make sure the incoming data is actual JSON
            // Logic borrowed from http://json.org/json2.js
            if (/^[\],:{}\s]*$/.test(data.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

                // Try to use the native JSON parser first
                return (nativeJSON || {}).parse ?
                       nativeJSON.parse(data) :
                       (new Function('return ' + data))();

            } else {
                jQuery.error('Invalid JSON: ' + data);
            }
        }
    };
});

/**
 * TODO:
 *  - stringify
 *  - more unit test
 *  - why use new Function instead of eval ?
 */