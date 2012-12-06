/**
 * native commands for xtemplate.
 * @author yiminghe@gmail.com
 * @ignore
 */
KISSY.add("xtemplate/runtime/commands", function (S, includeCommand, undefined) {
    var error = S.error;
    return {
        'each': function (scopes, option) {
            var params = option.params;
            if (!params || params.length != 1) {
                error('each must has one param');
            }
            var param0 = params[0];
            var buffer = '';
            var xcount;
            var single;
            if (param0 !== undefined) {
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
                    error('each can only apply to array');
                }
            }
            return buffer;
        },

        'with': function (scopes, option) {
            var params = option.params;
            if (!params || params.length != 1) {
                error('with must has one param');
            }
            var param0 = params[0];
            var opScopes = [0].concat(scopes);
            var buffer = '';
            if (param0 !== undefined) {
                if (S.isObject(param0)) {
                    opScopes[0] = param0;
                    buffer = option.fn(opScopes);
                } else {
                    S.log(param0, 'error');
                    error('with can only apply to object');
                }
            }
            return buffer;
        },

        'if': function (scopes, option) {
            var params = option.params;
            if (!params || params.length != 1) {
                error('if must has one param');
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

        'set': function (scopes, option) {
            S.mix(scopes[0], option.hash);
            return '';
        },

        'include': includeCommand.include
    };

}, {
    requires: ['./include-command']
});