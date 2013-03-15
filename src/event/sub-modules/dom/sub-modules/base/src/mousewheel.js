/**
 * @ignore
 * normalize mousewheel in gecko
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/base/mousewheel', function (S, special) {

    var UA = S.UA, MOUSE_WHEEL = UA.gecko ? 'DOMMouseScroll' : 'mousewheel';

    special['mousewheel'] = {
        typeFix: MOUSE_WHEEL
    };

}, {
    requires: ['./special']
});