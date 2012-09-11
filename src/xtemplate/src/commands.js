/**
 * native commands for xtemplate.
 * @author yiminghe@gmail.com
 */
KISSY.add("xtemplate/commands", function (S, XTemplate) {

    var commands = {
        'each': function (scopes, option) {
            var params = option.params;
            if (!params || params.length != 1) {
                throw new Error('each must has one param');
            }
            var param0 = params[0];
            var buffer = '';
            var xcount;
            var single;
            var singleRet;
            if (S.isArray(param0)) {
                var opScopes = [0].concat(scopes);
                xcount = param0.length;
                for (var xindex = 0; xindex < xcount; xindex++) {
                    var holder = {};
                    single = param0[xindex];
                    holder['this'] = single;
                    holder.xcount = xcount;
                    holder.xindex = xindex;
                    if (S.isObject(single)) {
                        S.mix(holder, single);
                    }
                    opScopes[0] = holder;
                    buffer += option.fn(opScopes);
                }
            } else {
                S.log(param0, 'error');
                throw new Error('each can only apply to array');
            }
            return buffer;
        },

        'with': function (scopes, option) {
            var params = option.params;
            if (!params || params.length != 1) {
                throw new Error('with must has one param');
            }
            var param0 = params[0];
            var opScopes = [0].concat(scopes);
            var buffer = '';
            if (S.isObject(param0)) {
                opScopes[0] = param0;
                buffer = option.fn(opScopes);
            } else {
                S.log(param0, 'error');
                throw new Error('with can only apply to object');
            }
            return buffer;
        },

        'if': function (scopes, option) {
            var params = option.params;
            if (!params || params.length != 1) {
                throw new Error('if must has one param');
            }
            var param0 = params[0];
            var buffer = '';
            if (param0) {
                buffer = option.fn(scopes);
            } else if (option.inverse) {
                buffer = option.inverse(scopes);
            }
            return buffer;
        },

        'ifeq': function (scopes, option) {
            var params = option.params;
            if (!params || params.length != 2) {
                throw new Error('if must has two param');
            }
            var param0 = params[0];
            var param1 = params[1];
            var buffer = '';
            if (param0 === param1) {
                buffer = option.fn(scopes);
            } else if (option.inverse) {
                buffer = option.inverse(scopes);
            }
            return buffer;
        },

        'iflt': function (scopes, option) {
            var params = option.params;
            if (!params || params.length != 2) {
                throw new Error('if must has two param');
            }
            var param0 = params[0];
            var param1 = params[1];
            var buffer = '';
            if (param0 < param1) {
                buffer = option.fn(scopes);
            } else if (option.inverse) {
                buffer = option.inverse(scopes);
            }
            return buffer;
        },

        'iflte': function (scopes, option) {
            var params = option.params;
            if (!params || params.length != 2) {
                throw new Error('if must has two param');
            }
            var param0 = params[0];
            var param1 = params[1];
            var buffer = '';
            if (param0 <= param1) {
                buffer = option.fn(scopes);
            } else if (option.inverse) {
                buffer = option.inverse(scopes);
            }
            return buffer;
        },

        'include': function (scopes, option) {
            var params = option.params;
            if (!params || params.length != 1) {
                throw new Error('include must has one param');
            }
            var param0 = params[0], tpl;
            var subTpls = option.subTpls;
            if (!(tpl = subTpls[param0])) {
                throw new Error('does not include sub template "' + param0 + '"');
            }
            return new XTemplate(tpl, {
                commands: option.commands,
                subTpls: option.subTpls
            }).render(scopes);
        }
    };

    XTemplate.addCommand = function (commandName, fn) {
        commands[commandName] = fn;
    };

    XTemplate.commands = commands;

    return commands;

}, {
    requires: ['./base']
});