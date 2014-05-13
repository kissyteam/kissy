/**
 * @ignore
 * utils for kison.
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var doubleReg = /"/g, single = /'/g, escapeString;
    var util = require('util');
    /**
     * utils for kison
     * @class KISSY.Kison.Utils
     * @singleton
     */
    return {
        escapeString: escapeString = function (str, quote) {
            var regexp = single;
            if (quote === '"') {
                regexp = doubleReg;
            } else {
                quote = '\'';
            }
            return str.replace(/\\/g, '\\\\')
                .replace(/\r/g, '\\r')
                .replace(/\n/g, '\\n')
                .replace(/\t/g, '\\t')
                .replace(regexp, '\\' + quote);
        },

        serializeObject: function serializeObject(obj, excludeReg) {
            var r;

            if (excludeReg &&
                (typeof excludeReg === 'function') &&
                (r = excludeReg(obj)) === false) {
                return false;
            }

            if (r !== undefined) {
                obj = r;
            }

            var ret = [];

            if (typeof obj === 'string') {
                return '\'' + escapeString(obj) + '\'';
            } else if (typeof obj === 'number') {
                return obj + '';
            } else if (util.isRegExp(obj)) {
                return '/' +
                    obj.source + '/' +
                    (obj.global ? 'g' : '') +
                    (obj.ignoreCase ? 'i' : '') +
                    (obj.multiline ? 'm' : '');
            } else if (util.isArray(obj)) {
                ret.push('[');
                var sub = [];
                util.each(obj, function (v) {
                    var t = serializeObject(v, excludeReg);
                    if (t !== false) {
                        sub.push(t);
                    }
                });
                ret.push(sub.join(', '));
                ret.push(']');
                return ret.join('');
            } else if (typeof obj === 'object') {
                ret = [];
                ret[0] = '{';
                var start = 1;
                for (var i in obj) {
                    var v = obj[i];
                    if (excludeReg && util.isRegExp(excludeReg) && i.match(excludeReg)) {
                        continue;
                    }
                    var t = serializeObject(v, excludeReg);
                    if (t === false) {
                        continue;
                    }
                    /*jshint quotmark:false*/
                    var key = "'" + escapeString(i) + "'";
                    ret.push((start ? '' : ',') + key + ': ' + t);
                    start = 0;
                }
                ret.push('}');
                return ret.join('\n');
            } else {
                return obj + '';
            }
        }
    };

});