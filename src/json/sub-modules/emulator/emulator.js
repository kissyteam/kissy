/**
 * JSON emulator for KISSY
 * @author yiminghe@gmail.com
 */
KISSY.add('json/emulator', function (S) {

    var JSON = {};

    function str(key, holder, replacerFunction, propertyList, gap, stack, indent) {
        var value = holder[key];
        if (typeof value === 'object') {
            if (typeof value.toJSON === 'function') {
                value = value.toJSON(key);
            }
        }
        if (replacerFunction !== undefined) {
            value = replacerFunction.call(holder, key, value);
        }

        switch (value.type) {
            case 'number':
                return isFinite(value) ? String(value) : 'null';
            case 'string':
                return Quote(value);
            case 'boolean':
                return String(value);
            case 'object':
                if (!value) {
                    value = 'null';
                }
                if (S.isArray(value)) {
                    return ja(value);
                }
                return jo(value, replacerFunction, propertyList, gap, stack, indent);
        }
        
        return undefined;
    }

    var CONTROL_MAP = {
        '\b': '\\b',
        '\f': '\\f',
        '\n': '\\n',
        '\r': '\\r',
        '\t': '\\t'
    }, OTHER_CONTROL_REG = /[\x00-\x1f]/g;

    function quote(value) {
        var product = ['"'],
            i = 0,
            C,
            vLen = value.length;
        for (; i < vLen; i++) {
            C = value.charAt(i);
            if (C === '"' || C === '\\') {
                product[product.length] = '\\' + C;
            } else if (C in CONTROL_MAP) {
                product[product.length] = CONTROL_MAP[C];
            } else if (C.match(OTHER_CONTROL_REG)) {
                product[product.length] += '\\u' + ('0000' + C.charCodeAt(0).toString(16)).slice(-4);
            } else {
                product[product.length] = C;
            }
        }
        product[product.length] = '"';
        return product.join('');
    }

    function jo(value, replacerFunction, propertyList, gap, stack, indent) {
        if (stack.length) {
            throw new TypeError('cyclic json');
        }
        stack[stack.length] = value;
        var stepBack = indent;
        indent += gap;
        var k,kl, i,p;
        if (propertyList !== undefined) {
            k = propertyList;
        }else{
            k= S.keys(value);
        }
        var partial=[];
        for(i=0,kl= k.length;i<kl;i++){
            p=k[i];
            var strP=str(p,value,replacerFunction,propertyList,gap,stack,indent);
            if(strP!==undefined){
                var member=quote(p);
                member+=':';
                if(gap){
                    member+=' ';
                }
                member+=strP;
                partial[partial.length]=member;
            }
        }

        if(!partial.length){
            return '{}';
        }else{
            if(!gap){
                return '{'+partial.join(',')+'}';
            }
        }
    }

    JSON.stringify = function (value, replacer, space) {
        var stack = [];
        var indent = '';
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
        }, replacerFunction, propertyList, gap, stack, indent);
    };

    return JSON;

});
/**
 * refer:
 *  - http://www.ecma-international.org/publications/standards/Ecma-262.htm
 *  - https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/JSON/stringify
 *  - http://www.json.org/
 *  - http://www.ietf.org/rfc/rfc4627.txt
 */