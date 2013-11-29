/**
 * @ignore
 *  change bubble and checkbox/radio fix patch for ie<9
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var DomEvent = require('event/dom/base');
    var Dom = require('dom');
    var Special = DomEvent.Special,
        R_FORM_EL = /^(?:textarea|input|select)$/i;

    function isFormElement(n) {
        return R_FORM_EL.test(n.nodeName);
    }

    function isCheckBoxOrRadio(el) {
        var type = el.type;
        return type === 'checkbox' || type === 'radio';
    }

    Special.change = {
        setup: function () {
            var el = this;
            if (isFormElement(el)) {
                // checkbox/radio only fires change when blur in ie<9
                // so use another technique from jquery
                if (isCheckBoxOrRadio(el)) {
                    // change in ie<9
                    // change = propertychange -> click
                    DomEvent.on(el, 'propertychange', propertyChange);
                    // click may not cause change! (eg: radio)
                    DomEvent.on(el, 'click', onClick);
                } else {
                    // other form elements use native , do not bubble
                    return false;
                }
            } else {
                // if bind on parentNode ,lazy bind change event to its form elements
                // note event order : beforeactivate -> change
                // note 2: checkbox/radio is exceptional
                DomEvent.on(el, 'beforeactivate', beforeActivate);
            }
        },
        tearDown: function () {
            var el = this;
            if (isFormElement(el)) {
                if (isCheckBoxOrRadio(el)) {
                    DomEvent.remove(el, 'propertychange', propertyChange);
                    DomEvent.remove(el, 'click', onClick);
                } else {
                    return false;
                }
            } else {
                DomEvent.remove(el, 'beforeactivate', beforeActivate);
                S.each(Dom.query('textarea,input,select', el), function (fel) {
                    if (fel.__changeHandler) {
                        fel.__changeHandler = 0;
                        DomEvent.remove(fel, 'change', {fn: changeHandler, last: 1});
                    }
                });
            }
        }
    };

    function propertyChange(e) {
        // if only checked property 's value is changed
        if (e.originalEvent.propertyName === 'checked') {
            this.__changed = 1;
        }
    }

    function onClick(e) {
        // only fire change after click and checked is changed
        // (only fire change after click on previous unchecked radio)
        if (this.__changed) {
            this.__changed = 0;
            // fire from itself
            DomEvent.fire(this, 'change', e);
        }
    }

    function beforeActivate(e) {
        var t = e.target;
        if (isFormElement(t) && !t.__changeHandler) {
            t.__changeHandler = 1;
            // lazy bind change , always as last handler among user's handlers
            DomEvent.on(t, 'change', {fn: changeHandler, last: 1});
        }
    }

    function changeHandler(e) {
        var fel = this;

        if (
        // in case stopped by user's callback,same with submit
        // http://bugs.jquery.com/ticket/11049
        // see : test/change/bubble.html
            e.isPropagationStopped() ||
                // checkbox/radio already bubble using another technique
                isCheckBoxOrRadio(fel)) {
            return;
        }
        var p;
        if ((p = fel.parentNode)) {
            // fire from parent , itself is handled natively
            DomEvent.fire(p, 'change', e);
        }
    }
});