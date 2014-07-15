/**
 * native commands for xtemplate.
 * @author yiminghe@gmail.com
 * @ignore
 */

var Scope = require('./scope');
var util = require('util');
var commands = {
    // range(start, stop, [step])
    range: function (scope, option) {
        var params = option.params;
        var start = params[0];
        var end = params[1];
        var step = params[2];
        if (!step) {
            step = start > end ? -1 : 1;
        } else if (start > end && step > 0 || start < end && step < 0) {
            step = -step;
        }
        var ret = [];
        for (var i = start; start < end ? i < end : i > end; i += step) {
            ret.push(i);
        }
        return ret;
    },

    each: function (scope, option, buffer) {
        var params = option.params;
        var param0 = params[0];
        var xindexName = params[2] || 'xindex';
        var valueName = params[1];
        var xcount;
        var opScope;
        var affix;
        // if undefined, will emit warning by compiler
        if (param0) {
            if (util.isArray(param0)) {
                xcount = param0.length;
                for (var xindex = 0; xindex < xcount; xindex++) {
                    opScope = new Scope(param0[xindex]);
                    affix = opScope.affix = {
                        xcount: xcount
                    };
                    affix[xindexName] = xindex;
                    if (valueName) {
                        affix[valueName] = param0[xindex];
                    }
                    opScope.setParent(scope);
                    buffer = option.fn(opScope, buffer);
                }
            } else {
                for (var name in param0) {
                    opScope = new Scope(param0[name]);
                    affix = opScope.affix = {};
                    affix[xindexName] = name;
                    if (valueName) {
                        affix[valueName] = param0[name];
                    }
                    opScope.setParent(scope);
                    buffer = option.fn(opScope, buffer);
                }
            }
        }
        return buffer;
    },

    'with': function (scope, option, buffer) {
        var params = option.params;
        var param0 = params[0];
        if (param0) {
            // skip object check for performance
            var opScope = new Scope(param0);
            opScope.setParent(scope);
            buffer = option.fn(opScope, buffer);
        }
        return buffer;
    },

    'if': function (scope, option, buffer) {
        var params = option.params;
        var param0 = params[0];
        if (param0) {
            var fn = option.fn;
            if (fn) {
                buffer = fn(scope, buffer);
            }
        } else {
            var matchElseIf = false;
            var elseIfs = option.elseIfs;
            var inverse = option.inverse;
            if (elseIfs) {
                for (var i = 0, len = elseIfs.length; i < len; i++) {
                    var elseIf = elseIfs[i];
                    matchElseIf = elseIf.test(scope);
                    if (matchElseIf) {
                        buffer = elseIf.fn(scope, buffer);
                        break;
                    }
                }
            }
            if (!matchElseIf && inverse) {
                buffer = inverse(scope, buffer);
            }
        }
        return buffer;
    },

    // lhs does not support property reference
    // only create or set at current scope
    // {{set( x[1] = 2 )}}
    set: function (scope, option, buffer) {
        scope.mix(option.hash);
        return buffer;
    },

    include: function (scope, option, buffer) {
        var params = option.params,
            i, newScope,
            l = params.length;

        newScope = scope;
        // sub template scope
        if (option.hash) {
            newScope = new Scope(option.hash);
            newScope.setParent(scope);
        }

        for (i = 0; i < l; i++) {
            buffer = this.root.include(params[i], this, newScope, option, buffer);
        }

        return buffer;
    },

    parse: function (scope, option, buffer) {
        // abandon scope
        return commands.include.call(this, new Scope(), option, buffer);
    },

    extend: function (scope, option, buffer) {
        this.runtime.extendTplName = option.params[0];
        return buffer;
    },

    block: function (scope, option, buffer) {
        var self = this;
        var runtime = self.runtime;
        var params = option.params;
        var blockName = params[0];
        var type;
        if (params.length === 2) {
            type = params[0];
            blockName = params[1];
        }
        var blocks = runtime.blocks = runtime.blocks || {};
        var head = blocks[blockName],
            cursor;
        var current = {
            fn: option.fn,
            type: type
        };
        if (!head) {
            blocks[blockName] = current;
        } else if (head.type) {
            if (head.type === 'append') {
                current.next = head;
                blocks[blockName] = current;
            } else if (head.type === 'prepend') {
                var prev;
                cursor = head;
                while (cursor && cursor.type === 'prepend') {
                    prev = cursor;
                    cursor = cursor.next;
                }
                current.next = cursor;
                prev.next = current;
            }
        }

        if (!runtime.extendTplName) {
            cursor = blocks[blockName];
            while (cursor) {
                if (cursor.fn) {
                    buffer = cursor.fn.call(self, scope, buffer);
                }
                cursor = cursor.next;
            }
        }

        return buffer;
    },

    macro: function (scope, option, buffer, lineNumber) {
        var hash = option.hash;
        var params = option.params;
        var macroName = params[0];
        var params1 = params.slice(1);
        var self = this;
        var runtime = self.runtime;
        var macros = runtime.macros = runtime.macros || {};
        // definition
        if (option.fn) {
            macros[macroName] = {
                paramNames: params1,
                hash: hash,
                fn: option.fn
            };
        } else {
            var macro = macros[macroName];
            var paramValues = macro.hash || {};
            var paramNames;
            if (macro && (paramNames = macro.paramNames)) {
                for (var i = 0, len = paramNames.length; i < len; i++) {
                    var p = paramNames[i];
                    paramValues[p] = params1[i];
                }
                if (hash) {
                    for (var h in hash) {
                        paramValues[h] = hash[h];
                    }
                }
                var newScope = new Scope(paramValues);
                // no caller Scope
                buffer = macro.fn.call(self, newScope, buffer);
            } else {
                var error = 'in file: ' + self.name + ' can not find macro: ' + name + '" at line ' + lineNumber;
                throw new Error(error);
            }
        }
        return buffer;
    }
};

if ('@DEBUG@') {
    commands['debugger'] = function () {
        util.globalEval('debugger');
    };
}

module.exports = commands;