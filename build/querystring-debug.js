/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 5 23:26
*/
/*
combined modules:
querystring
*/
KISSY.add('querystring', [], function (S, require, exports, module) {
    var SEP = '&', EMPTY = '', undef, urlEncode = encodeURIComponent, toString = {}.toString, EQ = '=';
    function isValidParamValue(val) {
        var t = typeof val;
        return val == null || t !== 'object' && t !== 'function';
    }
    function isArray(o) {
        return toString.apply(o) === '[object Array]';
    }
    function urlDecode(s) {
        return decodeURIComponent(s.replace(/\+/g, ' '));
    }
    module.exports = {
        stringify: function (o, sep, eq, serializeArray) {
            sep = sep || SEP;
            eq = eq || EQ;
            if (serializeArray === undef) {
                serializeArray = true;
            }
            var buf = [], key, i, v, len, val;
            for (key in o) {
                val = o[key];
                key = urlEncode(key);
                if (isValidParamValue(val)) {
                    buf.push(key);
                    if (val !== undef) {
                        buf.push(eq, urlEncode(val + EMPTY));
                    }
                    buf.push(sep);
                } else if (isArray(val)) {
                    for (i = 0, len = val.length; i < len; ++i) {
                        v = val[i];
                        if (isValidParamValue(v)) {
                            buf.push(key, serializeArray ? urlEncode('[]') : EMPTY);
                            if (v !== undef) {
                                buf.push(eq, urlEncode(v + EMPTY));
                            }
                            buf.push(sep);
                        }
                    }
                }
            }
            buf.pop();
            return buf.join(EMPTY);
        },
        parse: function (str, sep, eq) {
            sep = sep || SEP;
            eq = eq || EQ;
            var ret = {}, eqIndex, key, val, pairs = str.split(sep), i = 0, len = pairs.length;
            for (; i < len; ++i) {
                eqIndex = pairs[i].indexOf(eq);
                if (eqIndex === -1) {
                    key = urlDecode(pairs[i]);
                    val = undef;
                } else {
                    key = urlDecode(pairs[i].substring(0, eqIndex));
                    val = pairs[i].substring(eqIndex + 1);
                    try {
                        val = urlDecode(val);
                    } catch (e) {
                        S.log('decodeURIComponent error : ' + val, 'error');
                        S.log(e, 'error');
                    }
                    if (key.slice(0 - 2) === '[]') {
                        key = key.slice(0, 0 - 2);
                    }
                }
                if (key in ret) {
                    if (isArray(ret[key])) {
                        ret[key].push(val);
                    } else {
                        ret[key] = [
                            ret[key],
                            val
                        ];
                    }
                } else {
                    ret[key] = val;
                }
            }
            return ret;
        }
    };
});
