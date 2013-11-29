/**
 * @ignore
 * utils for event
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S) {
    var splitAndRun, getGroupsRe;

    function getTypedGroups(type) {
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
    }

    return {
        splitAndRun: splitAndRun = function (type, fn) {
            if (S.isArray(type)) {
                S.each(type, fn);
                return;
            }
            type = S.trim(type);
            if (type.indexOf(' ') === -1) {
                fn(type);
            } else {
                S.each(type.split(/\s+/), fn);
            }
        },

        normalizeParam: function (type, fn, context) {
            var cfg = fn || {};

            if (typeof fn === 'function') {
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
            // in case null
            if (types && typeof types === 'object') {
                S.each(types, function (value, type) {
                    var args2 = [].concat(args);
                    args2.splice(0, 2);
                    args2[num] = type;
                    args2[num + 1] = value;
                    fn.apply(null, args2);
                });
            } else {
                splitAndRun(types, function (type) {
                    var args2 = [].concat(args);
                    args2.splice(0, 2);
                    args2[num] = type;
                    fn.apply(null, args2);
                });
            }
        },

        fillGroupsForEvent: function (type, eventData) {
            var typedGroups = getTypedGroups(type),
                _ksGroups = typedGroups[1];

            if (_ksGroups) {
                _ksGroups = getGroupsRe(_ksGroups);
                eventData._ksGroups = _ksGroups;
            }

            eventData.type = typedGroups[0];
        },

        getGroupsRe: getGroupsRe = function (groups) {
            return new RegExp(groups.split('.').join('.*\\.') + '(?:\\.|$)');
        }
    };
});