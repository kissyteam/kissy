/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 9 12:04
*/
/**
 * adapter to transform kissy5 to kissy 1.4.x
 * @author yiminghe@gmail.com
 */
(function (S) {
    S.use('util', function (S, util) {
        util.mix(S, util);
    });

    S.add('event', ['util', 'event/dom', 'event/custom'], function (S, require) {
        var Event = S.Event = {};
        var util = require('util');
        util.mix(Event, require('event/dom'));
        Event.Target = require('event/custom').Target;
        S.log('event module is deprecated! please use \'event/dom\' or \'event/custom\' module instead.');
        return Event;
    });

    var mods = {
        ua: 'UA',
        json: 'JSON',
        cookie: 'Cookie',
        'dom/base': 'DOM',
        event: 'Event',
        node: 'Node',
        io: 'IO',
        'anim/timer': 'Anim',
        'anim/transition': 'Anim',
        base: 'Base'
    };

    var configs = {};

    for (var m in mods) {
        /*jshint loopfunc:true*/
        (function (m, p) {
            configs[m] = {
                afterAttach: function (v) {
                    S[p] = S[p] || v;
                }
            };
        })(m, mods[m]);
    }

    S.config('modules', configs);
})(KISSY);
