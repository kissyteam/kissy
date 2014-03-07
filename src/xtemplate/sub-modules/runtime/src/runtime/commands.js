/**
 * native commands for xtemplate.
 * @author yiminghe@gmail.com
 * @ignore
 */
KISSY.add(function (S, require) {
    var commands;
    var Path = require('path');
    var Scope = require('./scope');

    commands = {
        'debugger': S.noop,

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

            if (!params || params.length !== 1) {
                S.error('include must has one param');
                return '';
            }

            // sub template scope
            if (config.hash) {
                var newScope = new Scope(config.hash);
                newScope.setParent(scope);
                scope = newScope;
            }

            var myName = this.config.name;
            var subTplName = params[0];

            if (subTplName.charAt(0) === '.') {
                if (myName === 'unspecified') {
                    S.error('parent template does not have name' + ' for relative sub tpl name: ' + subTplName);
                    return '';
                }
                subTplName = Path.resolve(myName, '../', subTplName);
            }

            var tpl = this.config.loader.call(this, subTplName);

            config = S.merge(this.config);
            // template file name
            config.name = subTplName;
            // pass commands to sub template
            config.commands = this.config.commands;
            // share macros with parent template and sub template
            config.macros = this.config.macros;
            return this.invokeEngine(tpl, scope, config);
        },

        'macro': function (scope, config) {
            var params = config.params;
            var macroName = params[0];
            var params1 = params.slice(1);
            var macros = this.config.macros;
            // definition
            if (config.fn) {
                // parent template override child template
                if (!macros[macroName]) {
                    macros[macroName] = {
                        paramNames: params1,
                        fn: config.fn
                    };
                }
            } else {
                var paramValues = {};
                var macro = macros[macroName];

                if (!macro) {
                    S.error('can not find macro:' + name);
                }

                S.each(macro.paramNames, function (p, i) {
                    paramValues[p] = params1[i];
                });
                var newScope = new Scope(paramValues);
                // no caller scope
                return macro.fn.call(this, newScope);
            }
            return '';
        },

        parse: function (scope, config) {
            // abandon scope
            return commands.include.call(this, new Scope(), config);
        }
    };

    if ('@DEBUG@') {
        commands['debugger'] = function () {
            S.globalEval('debugger');
        };
    }

    return commands;
});