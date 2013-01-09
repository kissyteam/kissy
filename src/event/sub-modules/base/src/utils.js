/**
 * @ignore
 *  utils for event
 * @author yiminghe@gmail.com
 */
KISSY.add('event/base/utils', function (S) {

    var getTypedGroups, splitAndRun;

    return {

        splitAndRun: splitAndRun = function (type, fn) {
            type = S.trim(type);
            if (type.indexOf(' ') == -1) {
                fn(type);
            } else {
                S.each(type.split(/\s+/), fn);
            }
        },

        normalizeParam: function (type, fn, context) {
            var cfg = fn || {};

            if (S.isFunction(fn)) {
                cfg = {
                    fn: fn,
                    context: context
                };
            } else {
                // copy
                cfg = S.merge(cfg);
            }

            var typedGroups = getTypedGroups(type);

            type = typedGroups[0];

            cfg.groups = typedGroups[1];

            cfg.type = type;

            return cfg;
        },

        batchForType: function (fn, num) {
            var args = S.makeArray(arguments),
                types = args[2 + num];
            splitAndRun(types, function (type) {
                var args2 = [].concat(args);
                args2.splice(0, 2);
                args2[num] = type;
                fn.apply(null, args2);
            });
        },

        getTypedGroups: getTypedGroups = function (type) {
            if (type.indexOf('.') < 0) {
                return [type, ''];
            }
            var m = type.match(/([^.]+)?(\..+)?$/),
                t = m[1],
                ret = [t],
                gs = m[2];
            if (gs) {
                gs = gs.split('.').sort();
                ret.push(gs.join('.'));
            } else {
                ret.push('');
            }
            return ret;
        },

        getGroupsRe: function (groups) {
            return new RegExp(groups.split('.').join('.*\\.') + '(?:\\.|$)');
        }

    };

});