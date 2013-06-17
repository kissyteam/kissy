/**
 * Ast node class for xtemplate
 * @author yiminghe@gmail.com
 * @ignore
 */

var S = KISSY;

var ast = {};

/**
 * @ignore
 * @param lineNumber
 * @param statements
 * @param [inverse]
 * @constructor
 */
ast.ProgramNode = function (lineNumber, statements, inverse) {
    var self = this;
    self.lineNumber = lineNumber;
    self.statements = statements;
    self.inverse = inverse;
};

ast.ProgramNode.prototype.type = 'program';

ast.BlockNode = function (lineNumber, tpl, program, close) {
    var closeParts = close['parts'], self = this, e;
    // no close tag
    if (!S.equals(tpl.path['parts'], closeParts)) {
        e = ("Syntax error at line " +
            lineNumber +
            ":\n" + "expect {{/" +
            tpl.path['parts'] +
            "}} not {{/" +
            closeParts + "}}");
        S.error(e);
    }
    self.lineNumber = lineNumber;
    self.tpl = tpl;
    self.program = program;
};

ast.BlockNode.prototype.type = 'block';

/**
 * @ignore
 * @param lineNumber
 * @param path
 * @param [params]
 * @param [hash]
 * @constructor
 */
ast.TplNode = function (lineNumber, path, params, hash) {
    var self = this;
    self.lineNumber = lineNumber;
    self.path = path;
    self.params = params;
    self.hash = hash;
    self.escaped = true;
    // inside {{^}}
    // default: inside {{#}}
    self.isInverted = false;
};

ast.TplNode.prototype.type = 'tpl';


ast.TplExpressionNode = function (lineNumber, expression) {
    var self = this;
    self.lineNumber = lineNumber;
    self.expression = expression;
    self.escaped = true;
};

ast.TplExpressionNode.prototype.type = 'tplExpression';

ast.ContentNode = function (lineNumber, value) {
    var self = this;
    self.lineNumber = lineNumber;
    self.value = value;
};

ast.ContentNode.prototype.type = 'content';

ast.UnaryExpression = function (v) {
    this.value = v;
};

ast.UnaryExpression.prototype.type = 'unaryExpression';

ast.MultiplicativeExpression = function (op1, opType, op2) {
    var self = this;
    self.op1 = op1;
    self.opType = opType;
    self.op2 = op2;
};

ast.MultiplicativeExpression.prototype.type = 'multiplicativeExpression';

ast.AdditiveExpression = function (op1, opType, op2) {
    var self = this;
    self.op1 = op1;
    self.opType = opType;
    self.op2 = op2;
};

ast.AdditiveExpression.prototype.type = 'additiveExpression';

ast.RelationalExpression = function (op1, opType, op2) {
    var self = this;
    self.op1 = op1;
    self.opType = opType;
    self.op2 = op2;
};

ast.RelationalExpression.prototype.type = 'relationalExpression';

ast.EqualityExpression = function (op1, opType, op2) {
    var self = this;
    self.op1 = op1;
    self.opType = opType;
    self.op2 = op2;
};

ast.EqualityExpression.prototype.type = 'equalityExpression';

ast.ConditionalAndExpression = function (op1, op2) {
    var self = this;
    self.op1 = op1;
    self.op2 = op2;
};

ast.ConditionalAndExpression.prototype.type = 'conditionalAndExpression';

ast.ConditionalOrExpression = function (op1, op2) {
    var self = this;
    self.op1 = op1;
    self.op2 = op2;
};

ast.ConditionalOrExpression.prototype.type = 'conditionalOrExpression';

ast.StringNode = function (lineNumber, value) {
    var self = this;
    self.lineNumber = lineNumber;
    self.value = value;
};

ast.StringNode.prototype.type = 'string';

ast.NumberNode = function (lineNumber, value) {
    var self = this;
    self.lineNumber = lineNumber;
    self.value = value;
};

ast.NumberNode.prototype.type = 'number';

ast.BooleanNode = function (lineNumber, value) {
    var self = this;
    self.lineNumber = lineNumber;
    self.value = value;
};

ast.BooleanNode.prototype.type = 'boolean';

ast.HashNode = function (lineNumber, raw) {
    var self = this, value = {};
    self.lineNumber = lineNumber;
    S.each(raw, function (r) {
        value[r[0]] = r[1];
    });
    self.value = value;
};

ast.HashNode.prototype.type = 'hash';

ast.IdNode = function (lineNumber, raw) {
    var self = this, parts = [], depth = 0;
    self.lineNumber = lineNumber;
    S.each(raw, function (p) {
        if (p == "..") {
            depth++;
        } else {
            parts.push(p);
        }
    });
    self.parts = parts;
    self.string = parts.join('.');
    self.depth = depth;
};

ast.IdNode.prototype.type = 'id';