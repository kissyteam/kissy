/**
 * JSON.stringify for KISSY
 * @author yiminghe@gmail.com
 */
KISSY.add('json/parse', function (S,parser, ast) {
    parser.yy = ast;

    return function (str) {
        var root = parser.parse(str);
        S.log(root);
    };

}, {
    requires: ['./parser', './ast']
});
/**
 * refer:
 *  - kison
 *  - http://www.ecma-international.org/publications/standards/Ecma-262.htm
 *  - https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/JSON/stringify
 *  - http://www.json.org/
 *  - http://www.ietf.org/rfc/rfc4627.txt
 */