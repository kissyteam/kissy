/**
 * @ignore
 * quote and unQuote for json
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S) {
    /**
     * @ignore
     * quote and unQuote for json
     * @author yiminghe@gmail.com
     */
    var util = S;
    var CONTROL_MAP = {
            '\b': '\\b',
            '\f': '\\f',
            '\n': '\\n',
            '\r': '\\r',
            '\t': '\\t',
            '"': '\\"'
        },
        REVERSE_CONTROL_MAP = {},
        QUOTE_REG = /["\b\f\n\r\t\x00-\x1f]/g,
        UN_QUOTE_REG = /\\\\|\\\/|\\b|\\f|\\n|\\r|\\t|\\"|\\u[0-9a-zA-Z]{4}/g;

    util.each(CONTROL_MAP, function (original, encoded) {
        REVERSE_CONTROL_MAP[original] = encoded;
    });

    REVERSE_CONTROL_MAP['\\/'] = '/';
    REVERSE_CONTROL_MAP['\\\\'] = '\\';

    return {
        quote: function (value) {
            return '"' + value.replace(QUOTE_REG, function (m) {
                var v;
                if (!(v = CONTROL_MAP[m])) {
                    v = '\\u' + ('0000' + m.charCodeAt(0).toString(16)).slice(0 - 4);
                }
                return v;
            }) + '"';
        },
        unQuote: function (value) {
            return value.slice(1, value.length - 1).replace(UN_QUOTE_REG, function (m) {
                var v;
                if (!(v = REVERSE_CONTROL_MAP[m])) {
                    v = String.fromCharCode(parseInt(m.slice(2), 16));
                }
                return v;
            });
        }
    };

});