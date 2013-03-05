/**
 * ast for json format
 * @author yiminghe@gmail.com
 */
KISSY.add('json/ast', function () {

    var ast = {};

    ast.StringNode = function (v) {
        this.value = eval(v);
    };

    ast.StringNode.prototype.isString = 1;

    ast.NumberNode = function (v) {
        this.value = parseFloat(v);
    };

    ast.NumberNode.prototype.isNumber = 1;


    ast.BooleanNode = function (v) {
        this.value = v === 'true';
    };

    ast.BooleanNode.prototype.isBoolean = 1;


    ast.ObjectNode = function (v) {
        this.value = v;
    };

    ast.ObjectNode.prototype.isObject = 1;


    ast.ArrayNode = function (v) {
        this.value = v;
    };

    ast.ArrayNode.prototype.isArray = 1;

    ast.PairNode = function (key, value) {
        this.key = key;
        this.value = value;
    };

    ast.PairNode.prototype.isPair = 1;

    return ast;

});