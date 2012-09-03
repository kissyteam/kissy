/**
 * utils for kison.
 * @author yiminghe@gmail.com
 */
KISSY.add("kison/utils", function (S) {

    return {
        serializeObject: function serializeObject(obj, excludeReg) {
            var ret = [];
            if (S.isString(obj)) {
                return '"' + obj + '"';
            } else if (S.isNumber(obj)) {
                return obj + "";
            } else if (S.isRegExp(obj)) {
                return '/' +
                    obj.source + '/' +
                    (obj.global ? 'g' : '') +
                    (obj.ignoreCase ? 'i' : '') +
                    (obj.multiline ? 'm' : '');
            } else if (S.isArray(obj)) {
                ret.push('[');
                S.each(obj, function (v, i) {
                    ret.push((i ? ',' : '') + serializeObject(v));
                });
                ret.push(']');
                return ret.join("\n");
            } else if (S.isObject(obj)) {
                ret = ['{'];
                var start = true;
                for (var i in obj) {
                    if (obj.hasOwnProperty(i) && (!excludeReg || !(i.match(excludeReg)))) {
                        var v = obj[i];
                        ret.push((start ? '' : ',') +
                            '"' + i + '": ' + serializeObject(v, excludeReg));
                        start = false;
                    }
                }
                ret.push('}');
                return ret.join('\n');
            } else {
                return obj+'';
            }
        }
    };

});