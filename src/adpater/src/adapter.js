/**
 * adapter to transform kissy5 to kissy 1.4.x
 * @author yiminghe@gmail.com
 */
(function (S) {
    // --no-module-wrap--
    S.use('util,querystring', function (S, util, querystring) {
        util.mix(S, util);
        S.param = querystring.stringify;
        S.unparam = querystring.parse;
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
        io: 'IO',
        'anim/timer': 'Anim',
        'anim/transition': 'Anim',
        base: 'Base'
    };

    var configs = {
        node: {
            afterAttach: function (v) {
                S.one = v.one;
                S.all = v.all;
            }
        }
    };

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