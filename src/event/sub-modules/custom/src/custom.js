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

    var Custom = S.mix({
        _ObservableCustomEvent: ObservableCustomEvent,
        Target: Target
    }, api);

    S.mix(Event, {
        Target: Target,
        Custom: Custom
    });

    // compatibility
    S.EventTarget = Target;

    return Custom;
}, {
    requires: ['./base', './custom/api-impl', './custom/observable']
});