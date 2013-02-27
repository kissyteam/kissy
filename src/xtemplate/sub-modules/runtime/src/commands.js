/**
 * native commands for xtemplate.
 * @author yiminghe@gmail.com
 * @ignore
 */
KISSY.add("xtemplate/runtime/commands", function (S, includeCommand) {
    return {
        'each': function (scopes, option) {
            var params = option.params;
            var param0 = params[0];
            var buffer = '';
            var xcount;
            // if undefined, will emit warning by compiler
            if (param0) {
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
            } else if (option.inverse) {
                buffer = option.inverse(scopes);
            }
            return buffer;
        },

        'with': function (scopes, option) {
            var params = option.params;
            var param0 = params[0];
            var opScopes = [0].concat(scopes);
            var buffer = '';
            if (param0) {
                // skip object check for performance
                opScopes[0] = param0;
                buffer = option.fn(opScopes);
            } else if (option.inverse) {
                buffer = option.inverse(scopes);
            }
            return buffer;
        },

        'if': function (scopes, option) {
            var params = option.params;
            var param0 = params[0];
            var buffer = '';
            if (param0) {
                if (option.fn) {
                    buffer = option.fn(scopes);
                }
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