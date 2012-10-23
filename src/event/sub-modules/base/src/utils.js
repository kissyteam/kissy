/**
 * @ignore
 * @fileOverview utils for event
 * @author yiminghe@gmail.com
 */
KISSY.add('event/base/utils', function () {

    return {

        splitAndRun: function (type, fn) {
            S.each(type.split(/\s+/), fn);
        },

        batchForType: function (fn, targets, types) {
            // on(target, 'click focus', fn)
            if (types && types.indexOf(' ') > 0) {
                var args = S.makeArray(arguments);
                S.each(types.split(/\s+/), function (type) {
                    var args2 = [].concat(args);
                    args2.splice(0, 3, targets, type);
                    fn.apply(null, args2);
                });
                return true;
            }
            return 0;
        },

        getTypedGroups: function (type) {
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

}, {
    requires: ['dom']
});