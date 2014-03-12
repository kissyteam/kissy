/**
 * @ignore
 * special house for special events
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var DomEvent = require('./dom-event');
    var Special = require('./special');

    var UA = S.UA,
        MOUSE_WHEEL = UA.gecko ? 'DOMMouseScroll' : 'mousewheel';

    return S.mix(Special, {
        mousewheel: {
            typeFix: MOUSE_WHEEL
        },

        load: {
            // defaults to bubbles as custom event
            bubbles: false
        },
        click: {
            // use native click for correct check state order
            fire: function (onlyHandlers) {
                var target = this;
                if (!onlyHandlers && String(target.type) === 'checkbox' &&
                    target.click && target.nodeName.toLowerCase() === 'input') {
                    target.click();
                    return false;
                }
                return undefined;
            }
        },
        focus: {
            bubbles: false,
            // guarantee fire focusin first
            preFire: function (event, onlyHandlers) {
                if (!onlyHandlers) {
                    return DomEvent.fire(this, 'focusin');
                }
            },
            // guarantee fire blur first
            fire: function (onlyHandlers) {
                var target = this;
                if (!onlyHandlers && target.ownerDocument) {
                    if (target !== target.ownerDocument.activeElement && target.focus) {
                        target.focus();
                        return false;
                    }
                }
                return undefined;
            }
        },
        blur: {
            bubbles: false,
            // guarantee fire focusout first
            preFire: function (event, onlyHandlers) {
                if (!onlyHandlers) {
                    return DomEvent.fire(this, 'focusout');
                }
            },
            // guarantee fire blur first
            fire: function (onlyHandlers) {
                var target = this;
                if (!onlyHandlers && target.ownerDocument) {
                    if (target === target.ownerDocument.activeElement && target.blur) {
                        target.blur();
                        return false;
                    }
                }
                return undefined;
            }
        }
    });
});