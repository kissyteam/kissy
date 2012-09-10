/**
 * Ast node class for xtemplate
 * @author yiminghe@gmail.com
 */
KISSY.add("xtemplate/ast", function (S) {

    var ast = {};

    ast.ProgramNode = function (lineNumber, statements, inverse) {
        this.lineNumber = lineNumber;
        this.statements = statements;
        this.inverse = inverse;
    };

    ast.ProgramNode.prototype.type = 'program';

    ast.BlockNode = function (lineNumber, tpl, program, close) {
        // 开始没有结束
        if (!S.equals(tpl.path.parts, close.parts)) {
            S.error("parse error at line " + lineNumber +
                ":\n" + "expect {{/" + tpl.path.parts +
                "}} not {{/" + close.parts + "}}");
        }
        this.lineNumber = lineNumber;
        this.tpl = tpl;
        this.program = program;
    };

    ast.BlockNode.prototype.type = 'block';

    ast.TplNode = function (lineNumber, path, params, hash) {
        this.lineNumber = lineNumber;
        this.path = path;
        this.params = params;
        this.hash = hash;
        this.escaped = true;
    };

    ast.TplNode.prototype.type = 'tpl';

    ast.ContentNode = function (lineNumber, value) {
        this.lineNumber = lineNumber;
        this.value = value;
    };

    ast.ContentNode.prototype.type = 'content';

    ast.StringNode = function (lineNumber, value) {
        this.lineNumber = lineNumber;
        this.value = value;
    };

    ast.StringNode.prototype.type = 'string';

    ast.NumberNode = function (lineNumber, value) {
        this.lineNumber = lineNumber;
        this.value = value;
    };

    ast.NumberNode.prototype.type = 'integer';

    ast.BooleanNode = function (lineNumber, value) {
        this.lineNumber = lineNumber;
        this.value = value;
    };

    ast.BooleanNode.prototype.type = 'boolean';

    ast.HashNode = function (lineNumber, raw) {
        this.lineNumber = lineNumber;
        var value = {};
        S.each(raw, function (r) {
            value[r[0]] = r[1];
        });
        this.value = value;
    };

    ast.HashNode.prototype.type = 'hash';

    ast.IdNode = function (lineNumber, raw) {
        this.lineNumber = lineNumber;
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