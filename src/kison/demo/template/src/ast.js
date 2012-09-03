/**
 * Ast node class for template
 * @author yiminghe@gmail.com
 */
KISSY.add("template/ast", function (S) {

    var ast = {};

    ast.ProgramNode = function (statement, inverse) {
        this.statement = statement;
        this.inverse = inverse;
    };

    ast.ProgramNode.prototype.type = 'program';

    ast.BlockNode = function (tpl, program) {
        this.tpl = tpl;
        this.program = program;
    };

    ast.BlockNode.prototype.type = 'block';

    ast.TplNode = function (path, params, hash) {
        this.path = path;
        this.params = params;
        this.hash = hash;
        this.escaped = true;
    };

    ast.TplNode.prototype.type = 'tpl';

    ast.ContentNode = function (value) {
        this.value = value;
    };

    ast.ContentNode.prototype.type = 'content';

    ast.StringNode = function (value) {
        this.value = value;
    };

    ast.StringNode.prototype.type = 'string';

    ast.IntegerNode = function (value) {
        this.value = value;
    };

    ast.IntegerNode.prototype.type = 'integer';

    ast.BooleanNode = function (value) {
        this.value = value;
    };

    ast.BooleanNode.prototype.type = 'boolean';

    ast.HashNode = function (raw) {
        var value = {};
        S.each(raw, function (r) {
            value[r[0]] = r[1];
        });
        this.value = value;
    };

    ast.HashNode.prototype.type = 'hash';

    ast.IdNode = function (raw) {
        var parts = [], depth = 0;
        S.each(raw, function (p) {
            if (p == "..") {
                depth++;
            } else {
                parts.push(p);
            }
        });
        this.parts = parts;
        this.string = parts.join('.');
        this.depth = depth;
    };

    ast.IdNode.prototype.type = 'id';

    return ast;
});