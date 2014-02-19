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
        for (var i = 0; i < subParts.length; i++) {
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
        'each': function (scope, config) {
            var params = config.params;
            var param0 = params[0];
            var xindexName = params[2] || 'xindex';
            var valueName = params[1];
            var buffer = '';
            var xcount;
            var opScope;
            var affix;
            // if undefined, will emit warning by compiler
            if (param0) {
                opScope = new Scope();
                if (S.isArray(param0)) {
                    xcount = param0.length;
                    for (var xindex = 0; xindex < xcount; xindex++) {
                        // two more variable scope for array looping
                        opScope.data = param0[xindex];
                        affix = opScope.affix = {
                            xcount: xcount
                        };
                        affix[xindexName] = xindex;
                        if (valueName) {
                            affix[valueName] = param0[xindex];
                        }
                        opScope.setParent(scope);
                        buffer += config.fn(opScope);
                    }
                } else {
                    for (var name in param0) {
                        opScope.data = param0[name];
                        affix = opScope.affix = {};
                        affix[xindexName] = name;
                        if (valueName) {
                            affix[valueName] = param0[name];
                        }
                        opScope.setParent(scope);
                        buffer += config.fn(opScope);
                    }
                }

            } else if (config.inverse) {
                buffer = config.inverse(scope);
            }
            return buffer;
        },

        'with': function (scope, config) {
            var params = config.params;
            var param0 = params[0];
            var buffer = '';
            if (param0) {
                // skip object check for performance
                var opScope = new Scope(param0);
                opScope.setParent(scope);
                buffer = config.fn(opScope);
            } else if (config.inverse) {
                buffer = config.inverse(scope);
            }
            return buffer;
        },

        'if': function (scope, config) {
            var params = config.params;
            var param0 = params[0];
            var buffer = '';
            if (param0) {
                if (config.fn) {
                    buffer = config.fn(scope);
                }
            } else if (config.inverse) {
                buffer = config.inverse(scope);
            }
            return buffer;
        },

        'set': function (scope, config) {
            scope.mix(config.hash);
            return '';
        },

        include: function (scope, config) {
            var params = config.params;
            var self = this;
            var selfConfig = self.config;

            // sub template scope
            if (config.hash) {
                var newScope = new Scope(config.hash);
                newScope.setParent(scope);
                scope = newScope;
            }

            var myName = selfConfig.name;
            var subTplName = params[0];

            if (subTplName.charAt(0) === '.') {
                if (myName === 'unspecified') {
                    S.error('parent template does not have name' + ' for relative sub tpl name: ' + subTplName);
                    return '';
                }
                subTplName = getSubNameFromParentName(myName, subTplName);
            }

            var tpl = selfConfig.loader.call(this, subTplName);
            var subConfig = S.merge(selfConfig);
            // template file name
            subConfig.name = subTplName;
            return self.invokeEngine(tpl, scope, subConfig);
        },
        parse: function (scope, config) {
            // abandon scope
            return commands.include.call(this, new Scope(), config);
        },

        extend: function (scope, config) {
            this._extendTplName = config.params[0];
        },

        block: function (scope, config) {
            var self = this;
            var params = config.params;
            var blockName = params[0];
            var type;
            if (params.length === 2) {
                type = params[0];
                blockName = params[1];
            }
            var blocks = self.config.blocks;
            var head = blocks[blockName],
                cursor;
            var current = {
                fn: config.fn,
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
            var ret = '';
            if (!self._extendTplName) {
                cursor = blocks[blockName];
                while (cursor) {
                    if (cursor.fn) {
                        ret += cursor.fn.call(self, scope);
                    }
                    cursor = cursor.next;
                }

            }
            return ret;
        },

        'macro': function (scope, config) {
            var params = config.params;
            var macroName = params[0];
            var params1 = params.slice(1);
            var self = this;
            var macros = self.config.macros;
            // definition
            if (config.fn) {
                macros[macroName] = {
                    paramNames: params1,
                    fn: config.fn
                };
            } else {
                var paramValues = {};
                var macro = macros[macroName];
                if (macro) {
                    S.each(macro.paramNames, function (p, i) {
                        paramValues[p] = params1[i];
                    });
                    var newScope = new Scope(paramValues);
                    // no caller Scope
                    return macro.fn.call(self, newScope);
                } else {
                    S.error('can not find macro:' + name);
                }
            }
            return '';
        }
    };

    return commands;
});