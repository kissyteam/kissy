/**
 * Ast node class for xtemplate
 * @author yiminghe@gmail.com
 * @ignore
 */
KISSY.add(function (S) {
    var ast = {};

    function sameArray(a1, a2) {
        var l1 = a1.length, l2 = a2.length;
        if (l1 !== l2) {
            return 0;
        }
        for (var i = 0; i < l1; i++) {
            if (a1[i] !== a2[i]) {
                return 0;
            }
        }
        return 1;
    }

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

    ast.BlockStatement = function (lineNumber, command, program, close) {
        var closeParts = close.parts,
            self = this,
            e;
        // no close tag
        if (!sameArray(command.id.parts, closeParts)) {
            e = ('Syntax error at line ' +
                lineNumber +
                ':\n' + 'expect {{/' +
                command.id.parts +
                '}} not {{/' +
                closeParts + '}}');
            S.error(e);
        }
        self.lineNumber = lineNumber;
        self.command = command;
        self.program = program;
    };

    ast.BlockStatement.prototype.type = 'blockStatement';

    ast.InlineCommandStatement = function (lineNumber, command, escape) {
        this.lineNumber = lineNumber;
        this.command = command;
        this.escape = escape;
    };

    ast.InlineCommandStatement.prototype.type = 'inlineCommandStatement';

    ast.ExpressionStatement = function (lineNumber, expression, escape) {
        var self = this;
        self.lineNumber = lineNumber;
        self.value = expression;
        self.escape = escape;
    };

    ast.ExpressionStatement.prototype.type = 'expressionStatement';

    ast.ContentStatement = function (lineNumber, value) {
        var self = this;
        self.lineNumber = lineNumber;
        self.value = value;
    };

    ast.ContentStatement.prototype.type = 'contentStatement';

    ast.UnaryExpression = function (unaryType, v) {
        this.value = v;
        this.unaryType = unaryType;
    };

    /**
     * @ignore
     * @param lineNumber
     * @param id
     * @param [params]
     * @param [hash]
     * @constructor
     */
    ast.Command = function (lineNumber, id, params, hash) {
        var self = this;
        self.lineNumber = lineNumber;
        self.id = id;
        self.params = params;
        self.hash = hash;
    };

    ast.Command.prototype.type = 'command';

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
        self.opType = '&&';
    };

    ast.ConditionalAndExpression.prototype.type = 'conditionalAndExpression';

    ast.ConditionalOrExpression = function (op1, op2) {
        var self = this;
        self.op1 = op1;
        self.op2 = op2;
        self.opType = '||';
    };

    ast.ConditionalOrExpression.prototype.type = 'conditionalOrExpression';

    ast.String = function (lineNumber, value) {
        var self = this;
        self.lineNumber = lineNumber;
        self.value = value;
    };

    ast.String.prototype.type = 'string';

    ast.Number = function (lineNumber, value) {
        var self = this;
        self.lineNumber = lineNumber;
        self.value = value;
    };

    ast.Number.prototype.type = 'number';

    ast.Boolean = function (lineNumber, value) {
        var self = this;
        self.lineNumber = lineNumber;
        self.value = value;
    };

    ast.Boolean.prototype.type = 'boolean';

    ast.Hash = function (lineNumber) {
        var self = this,
            value = {};
        self.lineNumber = lineNumber;
        self.value = value;
    };

    ast.Hash.prototype.type = 'hash';

    ast.Id = function (lineNumber, raw) {
        var self = this,
            parts = [],
            depth = 0;
        self.lineNumber = lineNumber;
        for (var i = 0, l = raw.length; i < l; i++) {
            var p = raw[i];
            if (p === '..') {
                depth++;
            } else {
                parts.push(p);
            }
        }
        self.parts = parts;
        self.string = parts.join('.');
        self.depth = depth;
    };

    ast.Id.prototype.type = 'id';

    return ast;
});