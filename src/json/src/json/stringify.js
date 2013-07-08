/**
 * @ignore
 * Json.stringify for KISSY
 * @author yiminghe@gmail.com
 */
KISSY.add('json/stringify', function (S, Quote) {

    function padding2(n) {
        return n < 10 ? '0' + n : n;
    }

    function str(key, holder, replacerFunction, propertyList, gap, stack, indent) {
        var value = holder[key];
        if (value && typeof value === 'object') {
            if (typeof value.toJSON === 'function') {
                value = value.toJSON(key);
            } else if (value instanceof Date) {
                value = isFinite(value.valueOf()) ?
                    value.getUTCFullYear() + '-' +
                        padding2(value.getUTCMonth() + 1) + '-' +
                        padding2(value.getUTCDate()) + 'T' +
                        padding2(value.getUTCHours()) + ':' +
                        padding2(value.getUTCMinutes()) + ':' +
                        padding2(value.getUTCSeconds()) + 'Z' : null;
            } else if (value instanceof  String || value instanceof  Number || value instanceof Boolean) {
                value = value.valueOf();
            }
        }
        if (replacerFunction !== undefined) {
            value = replacerFunction.call(holder, key, value);
        }

        switch (typeof value) {
            case 'number':
                return isFinite(value) ? String(value) : 'null';
            case 'string':
                return Quote.quote(value);
            case 'boolean':
                return String(value);
            case 'object':
                if (!value) {
                    return 'null';
                }
                if (S.isArray(value)) {
                    return ja(value, replacerFunction, propertyList, gap, stack, indent);
                }
                return jo(value, replacerFunction, propertyList, gap, stack, indent);
        }

        return undefined;
    }

    function jo(value, replacerFunction, propertyList, gap, stack, indent) {
        if ('@debug@') {
            if (S.inArray(value, stack)) {
                throw new TypeError('cyclic json');
            }
            stack[stack.length] = value;
        }

        var stepBack = indent;
        indent += gap;
        var k, kl, i, p;
        if (propertyList !== undefined) {
            k = propertyList;
        } else {
            k = S.keys(value);
        }
        var partial = [];
        for (i = 0, kl = k.length; i < kl; i++) {
            p = k[i];
            var strP = str(p, value, replacerFunction, propertyList, gap, stack, indent);
            if (strP !== undefined) {
                var member = Quote.quote(p);
                member += ':';
                if (gap) {
                    member += ' ';
                }
                member += strP;
                partial[partial.length] = member;
            }
        }
        var ret;
        if (!partial.length) {
            ret = '{}';
        } else {
            if (!gap) {
                ret = '{' + partial.join(',') + '}';
            } else {
                var separator = ",\n" + indent;
                var properties = partial.join(separator);
                ret = '{\n' + indent + properties + '\n' + stepBack + '}';
            }
        }
        if ('@debug@') {
            stack.pop();
        }
        return ret;
    }

    function ja(value, replacerFunction, propertyList, gap, stack, indent) {
        if ('@debug@') {
            if (S.inArray(value, stack)) {
                throw new TypeError('cyclic json');
            }
            stack[stack.length] = value;
        }
        var stepBack = indent;
        indent += gap;
        var partial = [];
        var len = value.length;
        var index = 0;
        while (index < len) {
            var strP = str(String(index), value, replacerFunction, propertyList, gap, stack, indent);
            if (strP === undefined) {
                partial[partial.length] = 'null';
            } else {
                partial[partial.length] = strP;
            }
            ++index;
        }
        var ret;
        if (!partial.length) {
            ret = '[]';
        } else {
            if (!gap) {
                ret = '[' + partial.join(',') + ']';
            } else {
                var separator = '\n,' + indent;
                var properties = partial.join(separator);
                ret = '[\n' + indent + properties + '\n' + stepBack + ']';
            }
        }
        if ('@debug@') {
            stack.pop();
        }

        return ret;
    }

    function stringify(value, replacer, space) {
        var gap = '';
        var propertyList, replacerFunction;
        if (replacer) {
            if (typeof replacer === 'function') {
                replacerFunction = replacer;
            } else if (S.isArray(replacer)) {
                propertyList = replacer
            }
        }

        if (typeof space === 'number') {
            space = Math.min(10, space);
            gap = new Array(space + 1).join(' ');
        } else if (typeof space === 'string') {
            gap = space.slice(0, 10);
        }

        return str('', {
            '': value
        }, replacerFunction, propertyList, gap, [], '');
    }

    return stringify;

}, {
    requires: ['./quote']
});
/**
 * @ignore
 * refer:
 *  - http://www.ecma-international.org/publications/standards/Ecma-262.htm
 *  - https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Json/stringify
 *  - http://www.json.org/
 *  - http://www.ietf.org/rfc/rfc4627.txt
 */