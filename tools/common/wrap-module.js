var esprima = require('esprima');
var util = require('../common/util');

/*jshint quotmark:false */
function clearRange(ast) {
    if (!ast) {
        return {};
    }
    for (var i in ast) {
        // can not delete computed
        if (i === 'range') {
            delete ast[i];
        } else if (typeof ast[i] === 'object') {
            clearRange(ast[i]);
        }
    }
    return ast;
}

function clearRangeAndComputed(ast) {
    if (!ast) {
        return {};
    }
    ast = util.clone(ast);
    for (var i in ast) {
        // can not delete computed
        if (i === 'range' || i === 'computed') {
            delete ast[i];
        } else if (typeof ast[i] === 'object') {
            clearRange(ast[i]);
        }
    }
    return ast;
}

var calleeExpression = {
    "type": "MemberExpression",
    "object": {
        "type": "Identifier",
        "name": "KISSY"
    },
    "property": {
        "type": "Identifier",
        "name": "add"
    }
};

exports.needModuleWrapAst = function (ast) {
    if (!ast) {
        return false;
    }

    if (ast.body.length !== 1) {
        return true;
    }

    ast = ast.body[0];

    if (!ast.expression) {
        return true;
    }

    return !util.equals(clearRangeAndComputed(ast.expression.callee), calleeExpression);
};

exports.needModuleWrap = function (code) {
    var ast = esprima.parse(code, {
        attachComment: false
    });
    return exports.needModuleWrapAst(ast);
};

exports.wrapModule = function (code) {
    if (exports.needModuleWrap(code)) {
        return ['KISSY.add(function(S, require, exports, module){ ' + code, '});'].join('\n');
    }
    return code;
};

exports.wrapModuleAst = function (ast) {
    if (exports.needModuleWrapAst(ast)) {
        var wrapBody = {
            "type": "BlockStatement",
            "body": []
        };
        var wrapAst = {
            "type": "Program",
            "body": [
                {
                    "type": "ExpressionStatement",
                    "expression": {
                        "type": "CallExpression",
                        "callee": {
                            "type": "MemberExpression",
                            "computed": false,
                            "object": {
                                "type": "Identifier",
                                "name": "KISSY"
                            },
                            "property": {
                                "type": "Identifier",
                                "name": "add"
                            }
                        },
                        "arguments": [
                            {
                                "type": "FunctionExpression",
                                "id": null,
                                "params": [
                                    {
                                        "type": "Identifier",
                                        "name": "S"
                                    },
                                    {
                                        "type": "Identifier",
                                        "name": "require"
                                    },
                                    {
                                        "type": "Identifier",
                                        "name": "exports"
                                    },
                                    {
                                        "type": "Identifier",
                                        "name": "module"
                                    }
                                ],
                                "defaults": [],
                                "body": wrapBody,
                                "rest": null,
                                "generator": false,
                                "expression": false
                            }
                        ]
                    }
                }
            ]
        };

        wrapBody.body = ast.body;
        return wrapAst;
    }
    return ast;
};
