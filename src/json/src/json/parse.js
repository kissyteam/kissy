/**
 * @ignore
 * Json.parse for KISSY
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var parser = require('./parser'),
        Quote = require('./quote');
    parser.yy = {
        unQuote: Quote.unQuote
    };

    function walk(holder, name, reviver) {
        var val = holder[name],
            i, len, newElement;

        if (typeof val === 'object') {
            if (S.isArray(val)) {
                i = 0;
                len = val.length;
                var newVal = [];
                while (i < len) {
                    newElement = walk(val, String(i), reviver);
                    if (newElement !== undefined) {
                        newVal[newVal.length] = newElement;
                    }
                }
                val = newVal;
            } else {
                var keys = S.keys(val);
                for (i = 0, len = keys.length; i < len; i++) {
                    var p = keys[i];
                    newElement = walk(val, p, reviver);
                    if (newElement === undefined) {
                        delete val[p];
                    } else {
                        val[p] = newElement;
                    }
                }
            }
        }

        return reviver.call(holder, name, val);
    }

    return function (str, reviver) {
        var root = parser.parse(String(str));
        if (reviver) {
            return walk({
                '': root
            }, '', reviver);
        } else {
            return root;
        }
    };

});
/**
 * @ignore
 * refer:
 *  - kison
 *  - http://www.ecma-international.org/publications/standards/Ecma-262.htm
 *  - https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Json/stringify
 *  - http://www.json.org/
 *  - http://www.ietf.org/rfc/rfc4627.txt
 */