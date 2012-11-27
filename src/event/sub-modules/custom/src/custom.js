/**
 * @ignore
 * custom facade
 * @author yiminghe@gmail.com
 */
KISSY.add('event/custom', function (S, Event, api, ObservableCustomEvent) {
    var Target = {};

    S.each(api, function (fn, name) {
        Target[name] = function () {
            var args = S.makeArray(arguments);
            args.unshift(this);
            return fn.apply(null, args);
        }
    });

    var custom = S.mix({
        _ObservableCustomEvent: ObservableCustomEvent,
        Target: Target
    }, api);

    S.mix(Event, {
        Target: Target,
        custom: custom
    });

    // compatibility
    S.EventTarget = Target;

    return custom;
}, {
    requires: ['./base', './custom/api-impl', './custom/observable']
});