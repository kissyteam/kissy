/**
 * inspired by yui3 :
 *
 * Synthetic event that fires when the <code>value</code> property of an input
 * field or textarea changes as a result of a keystroke, mouse operation, or
 * input method editor (IME) input event.
 *
 * Unlike the <code>onchange</code> event, this event fires when the value
 * actually changes and not when the element loses focus. This event also
 * reports IME and multi-stroke input more reliably than <code>oninput</code> or
 * the various key events across browsers.
 *
 * @author:yiminghe@gmail.com
 */
KISSY.add('event/valuechange', function(S, Event, DOM) {
    var VALUE_CHANGE = "valueChange",
        KEY = "event/valuechange",
        history = {},
        poll = {},
        interval = 50;

    function timestamp(node) {
        var r = DOM.data(node, KEY);
        if (!r) {
            r = (+new Date());
            DOM.data(node, KEY, r);
        }
        return r;
    }

    function untimestamp(node) {
        DOM.removeData(node, KEY);
    }

    //pre value for input monitored


    function stopPoll(target) {
        var t = timestamp(target);
        delete history[t];
        if (poll[t]) {
            clearTimeout(poll[t]);
            delete poll[t];
        }
    }

    function blur(ev) {
        var target = ev.target;
        stopPoll(target);
    }

    function startPoll(target) {
        var t = timestamp(target);
        if (poll[t]) return;

        poll[t] = setTimeout(function() {
            var v = target.value;
            if (v !== history[t]) {
                Event._handle(target, {
                        type:VALUE_CHANGE,
                        prevVal:history[t],
                        newVal:v
                    });
                history[t] = v;
            }
            poll[t] = setTimeout(arguments.callee, interval);
        }, interval);
    }

    function startPollHandler(ev) {
        var target = ev.target;
        //when focus ,record its previous value
        if (ev.type == "focus") {
            var t = timestamp(target);
            history[t] = target.value;
        }
        startPoll(target);
    }

    function monitor(target) {
        unmonitored(target);
        Event.on(target, "blur", blur);
        Event.on(target, "mousedown keyup keydown focus", startPollHandler);
    }

    function unmonitored(target) {
        stopPoll(target);
        Event.remove(target, "blur", blur);
        Event.remove(target, "mousedown keyup keydown focus", startPollHandler);
        untimestamp(target);
    }

    Event.special[VALUE_CHANGE] = {
        //no corresponding dom event needed
        fix: false,
        setup: function() {
            var target = this,
                nodeName = target.nodeName.toLowerCase();
            if ("input" == nodeName
                || "textarea" == nodeName) {
                monitor(target);
            }
        },
        tearDown: function(target) {
            target = this;
            unmonitored(target);
        }
    };

    return Event;
}, {
        requires:["./base","dom"]
    });