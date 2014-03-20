/**
 * native commands for xtemplate.
 * @author yiminghe@gmail.com
 * @ignore
 */
KISSY.add(function (S, require) {
    var commands;
    var Scope = require('./scope');

    function getSubNameFromParentName(parentName, subName) {
        var parts = parentName.split('/');
        var subParts = subName.split('/');
        parts.pop();
        for (var i = 0, l = subParts.length; i < l; i++) {
            var subPart = subParts[i];
            if (subPart === '.') {
            } else if (subPart === '..') {
                parts.pop();
            } else {
                parts.push(subPart);
            }
        }
        return parts.join('/');
    }

    commands = {
        'each': function (scope, option, buffer) {
            var params = option.params;
            var param0 = params[0];
            var xindexName = params[2] || 'xindex';
            var valueName = params[1];
            var xcount;
            var opScope;
            var affix;
            // if undefined, will emit warning by compiler
            if (param0) {
                if (S.isArray(param0)) {
                    xcount = param0.length;
                    opScope = new Scope();
                    affix = opScope.affix = {
                        xcount: xcount
                    };
                    for (var xindex = 0; xindex < xcount; xindex++) {
                        // two more variable scope for array looping
                        opScope.data = param0[xindex];
                        affix[xindexName] = xindex;
                        if (valueName) {
                            affix[valueName] = param0[xindex];
                        }
                        opScope.setParent(scope);
                        buffer = option.fn(opScope, buffer);
                    }
                } else {
                    opScope = new Scope();
                    affix = opScope.affix = {};
                    for (var name in param0) {
                        opScope.data = param0[name];
                        affix[xindexName] = name;
                        if (valueName) {
                            affix[valueName] = param0[name];
                        }
                        opScope.setParent(scope);
                        buffer = option.fn(opScope, buffer);
                    }
                }
            } else if (option.inverse) {
                buffer = option.inverse(scope, buffer);
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
            } else if (option.inverse) {
                buffer = option.inverse(scope, buffer);
            }
            return buffer;
        },

        'if': function (scope, option, buffer) {
            var params = option.params;
            var param0 = params[0];
            if (param0) {
                if (option.fn) {
                    buffer = option.fn(scope, buffer);
                }
            } else if (option.inverse) {
                buffer = option.inverse(scope, buffer);
            }
            return buffer;
        },

        'set': function (scope, option, buffer) {
            scope.mix(option.hash);
            return buffer;
        },

        include: function (scope, option, buffer, payload) {
            var params = option.params;
            var self = this;
            // sub template scope
            if (option.hash) {
                var newScope = new Scope(option.hash);
                newScope.setParent(scope);
                scope = newScope;
            }

            var myName = self.name;
            var subTplName = params[0];

            if (subTplName.charAt(0) === '.') {
                if (!myName) {
                    var error = 'parent template does not have name' + ' for relative sub tpl name: ' + subTplName;
                    S.error(error);
                    return buffer;
                }
                subTplName = getSubNameFromParentName(myName, subTplName);
            }

            return self.load(subTplName).render(scope, undefined, buffer, payload);
        },

        parse: function (scope, option, buffer, payload) {
            // abandon scope
            return commands.include.call(this, new Scope(), option, buffer, payload);
        },

        extend: function (scope, option, buffer, payload) {
            payload.extendTplName = option.params[0];
            return buffer;
        },

        block: function (scope, option, buffer, payload) {
            var self = this;
            var params = option.params;
            var blockName = params[0];
            var type;
            if (params.length === 2) {
                type = params[0];
                blockName = params[1];
            }
            var blocks = payload.blocks = payload.blocks || {};
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

            if (!payload.extendTplName) {
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

        'macro': function (scope, option, buffer, payload) {
            var params = option.params;
            var macroName = params[0];
            var params1 = params.slice(1);
            var self = this;
            var macros = payload.macros = payload.macros || {};
            // definition
            if (option.fn) {
                macros[macroName] = {
                    paramNames: params1,
                    fn: option.fn
                };
            } else {
                var paramValues = {};
                var macro = macros[macroName];
                var paramNames;
                if (macro && (paramNames = macro.paramNames)) {
                    for (var i = 0, len = paramNames.length; i < len; i++) {
                        var p = paramNames[i];
                        paramValues[p] = params1[i];
                    }
                    var newScope = new Scope(paramValues);
                    // no caller Scope
                    buffer = macro.fn.call(self, newScope, buffer);
                } else {
                    var error = 'can not find macro:' + name;
                    S.error(error);
                }
            }
            return buffer;
        }
    };

    if ('@DEBUG@') {
        commands['debugger'] = function (scope, option, buffer) {
            S.globalEval('debugger');
            return buffer;
        };
    }

    return commands;
});