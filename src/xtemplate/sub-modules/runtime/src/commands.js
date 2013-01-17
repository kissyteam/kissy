/**
 * native commands for xtemplate.
 * @author yiminghe@gmail.com
 * @ignore
 */
KISSY.add("xtemplate/runtime/commands", function (S, includeCommand, undefined) {
    var error = function (option, str) {
        S[option.silent ? 'log' : 'error'](str);
    };
    return {
        'each': function (scopes, option) {
            var params = option.params;
            if (!params || params.length != 1) {
                error(option, 'each must has one param');
                return '';
            }
            var param0 = params[0];
            var buffer = '';
            var xcount;
            // if undefined, will emit warning by compiler
            if (param0 !== undefined) {
                // skip array check for performance
                var opScopes = [0, 0].concat(scopes);
                xcount = param0.length;
                for (var xindex = 0; xindex < xcount; xindex++) {
                    // two more variable scope for array looping
                    opScopes[0] = param0[xindex];
                    opScopes[1] = {
                        xcount: xcount,
                        xindex: xindex
                    };
                    buffer += option.fn(opScopes);
                }
            }
            return buffer;
        },

        'with': function (scopes, option) {
            var params = option.params;
            if (!params || params.length != 1) {
                error(option, 'with must has one param');
                return '';
            }
            var param0 = params[0];
            var opScopes = [0].concat(scopes);
            var buffer = '';
            if (param0 !== undefined) {
                // skip object check for performance
                opScopes[0] = param0;
                buffer = option.fn(opScopes);
            }
            return buffer;
        },

        'if': function (scopes, option) {
            var params = option.params;
            if (!params || params.length != 1) {
                error(option, 'if must has one param');
                return '';
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
            // in case scopes[0] is not object ,{{#each}}{{set }}{{/each}}
            for (var i = scopes.length - 1; i >= 0; i--) {
                if (typeof scopes[i] == 'object') {
                    S.mix(scopes[i], option.hash);
                    break;
                }
            }
            return '';
        },

        'include': includeCommand.include
    };

}, {
    requires: ['./include-command']
});