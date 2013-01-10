KISSY.add('event/dom/touch/utils', function (S, Event, Gesture) {
    function prevent(e) {
        e.preventDefault();
    }

    return {
        preventDefaultMove: function (el) {
            Event.on(el, Gesture.move, prevent);
        },
        allowDefaultMove: function (el) {
            Event.detach(el, Gesture.move, prevent);
        },
        preventDefaultStart: function (el) {
            Event.on(el, Gesture.start, prevent);
        },
        allowDefaultStart: function (el) {
            Event.detach(el, Gesture.start, prevent);
        }
    };
}, {
    requires: ['event/dom/base', './gesture']
});