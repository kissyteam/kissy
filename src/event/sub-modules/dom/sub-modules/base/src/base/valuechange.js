/**
 * @ignore
 * inspired by yui3
 * Synthetic event that fires when the <code>value</code> property of an input
 * field or textarea changes as a result of a keystroke, mouse operation, or
 * input method editor (IME) input event.
 *
 * Unlike the <code>onchange</code> event, this event fires when the value
 * actually changes and not when the element loses focus. This event also
 * reports IME and multi-stroke input more reliably than <code>oninput</code> or
 * the various key events across browsers.
 *
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Dom = require('dom');
    var DomEvent = require('./dom-event');
    var Special = require('./special');

    var VALUE_CHANGE = 'valuechange',
        getNodeName = Dom.nodeName,
        KEY = 'event/valuechange',
        HISTORY_KEY = KEY + '/history',
        POLL_KEY = KEY + '/poll',
        interval = 50;

    function clearPollTimer(target) {
        if (Dom.hasData(target, POLL_KEY)) {
            var poll = Dom.data(target, POLL_KEY);
            clearTimeout(poll);
            Dom.removeData(target, POLL_KEY);
        }
    }

    function stopPoll(target) {
        Dom.removeData(target, HISTORY_KEY);
        clearPollTimer(target);
    }

    function stopPollHandler(ev) {
        clearPollTimer(ev.target);
    }

    function checkChange(target) {
        var v = target.value,
            h = Dom.data(target, HISTORY_KEY);
        if (v !== h) {
            // allow delegate
            DomEvent.fireHandler(target, VALUE_CHANGE, {
                prevVal: h,
                newVal: v
            });
            Dom.data(target, HISTORY_KEY, v);
        }
    }

    function startPoll(target) {
        if (Dom.hasData(target, POLL_KEY)) {
            return;
        }
        Dom.data(target, POLL_KEY, setTimeout(function check() {
            checkChange(target);
            Dom.data(target, POLL_KEY, setTimeout(check, interval));
        }, interval));
    }

    function startPollHandler(ev) {
        var target = ev.target;
        // when focus ,record its current value immediately
        if (ev.type === 'focus') {
            Dom.data(target, HISTORY_KEY, target.value);
        }
        startPoll(target);
    }

    function webkitSpeechChangeHandler(e) {
        checkChange(e.target);
    }

    function monitor(target) {
        unmonitored(target);
        DomEvent.on(target, 'blur', stopPollHandler);
        // fix #94
        // see note 2012-02-08
        DomEvent.on(target, 'webkitspeechchange', webkitSpeechChangeHandler);
        DomEvent.on(target, 'mousedown keyup keydown focus', startPollHandler);
    }

    function unmonitored(target) {
        stopPoll(target);
        DomEvent.detach(target, 'blur', stopPollHandler);
        DomEvent.detach(target, 'webkitspeechchange', webkitSpeechChangeHandler);
        DomEvent.detach(target, 'mousedown keyup keydown focus', startPollHandler);
    }

    Special[VALUE_CHANGE] = {
        setup: function () {
            var target = this, nodeName = getNodeName(target);
            if (nodeName === 'input' || nodeName === 'textarea') {
                monitor(target);
            }
        },
        tearDown: function () {
            var target = this;
            unmonitored(target);
        }
    };
    return DomEvent;
});

/*
 2012-02-08 yiminghe@gmail.com note about webkitspeechchange :
 当 input 没焦点立即点击语音
 -> mousedown -> blur -> focus -> blur -> webkitspeechchange -> focus
 第二次：
 -> mousedown -> blur -> webkitspeechchange -> focus
 */