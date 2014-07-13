/**
 * adapter to transform kissy5 to kissy 1.4.x
 * @author yiminghe@gmail.com
 */
(function (S) {
    // --no-module-wrap--
    S.use(['util', 'querystring'], function (S, util, querystring) {
        util.mix(S, util);
        S.param = querystring.stringify;
        S.unparam = querystring.parse;
    });

    S.add('event', ['util', 'event/dom', 'event/custom'], function (S, require) {
        var Event = S.Event = {};
        var util = require('util');
        util.mix(Event, require('event/dom'));
        S.EventTarget = Event.Target = require('event/custom').Target;
        S.log('event module is deprecated! please use \'event/dom\' or \'event/custom\' module instead.');
        return Event;
    });

    var mods = {
        ua: 'UA',
        json: 'JSON',
        cookie: 'Cookie',
        'dom/base': 'DOM',
        'anim/timer': 'Anim',
        'anim/transition': 'Anim',
        base: 'Base'
    };

    var configs = {
        core: {
            alias: ['dom', 'event', 'io', 'anim', 'base', 'node', 'json', 'ua', 'cookie']
        },
        io: {
            afterAttach: function (v) {
                S.ajax = S.Ajax = S.io = S.IO = v;
            }
        },
        node: {
            afterAttach: function (v) {
                S.Node = S.NodeList = v;
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

    S.namespace = function () {
        var args = S.makeArray(arguments),
            l = args.length,
            o = null,
            i, j, p,
            global = (args[l - 1] === true && l--);

        for (i = 0; i < l; i++) {
            p = ('' + args[i]).split('.');
            o = global ? window : this;
            for (j = (window[p[0]] === o) ? 1 : 0; j < p.length; ++j) {
                o = o[p[j]] = o[p[j]] || {};
            }
        }
        return o;
    };

    KISSY.use('UA', function (S, UA) {
        S.UA = UA;
    });
})(KISSY);