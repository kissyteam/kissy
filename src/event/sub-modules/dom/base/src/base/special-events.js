/**
 * @ignore
 * special house for special events
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var DomEvent = require('./dom-event');
    var Special = require('./special');
    var util = require('util');
    var UA = require('ua'),
        MOUSE_WHEEL = UA.gecko ? 'DOMMouseScroll' : 'mousewheel';

    return util.mix(Special, {
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
                var self = this;
                if (!onlyHandlers && String(self.type) === 'checkbox' &&
                    self.click && self.nodeName.toLowerCase() === 'input') {
                    self.click();
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
                var self = this;
                if (!onlyHandlers && self.ownerDocument) {
                    if (self !== self.ownerDocument.activeElement && self.focus) {
                        self.focus();
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
                var self = this;
                if (!onlyHandlers && self.ownerDocument) {
                    if (self === self.ownerDocument.activeElement && self.blur) {
                        self.blur();
                        return false;
                    }
                }
                return undefined;
            }
        }
    });
});