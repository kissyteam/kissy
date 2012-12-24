/*
Copyright 2012, KISSY UI Library v1.30
MIT Licensed
build time: Dec 20 22:27
*/
/**
 * @ignore
 * @fileOverview  change bubble and checkbox/radio fix patch for ie<9
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/ie/change', function (S, Event, DOM) {
    var special = Event._Special,
        R_FORM_EL = /^(?:textarea|input|select)$/i;

    function isFormElement(n) {
        return R_FORM_EL.test(n.nodeName);
    }

    function isCheckBoxOrRadio(el) {
        var type = el.type;
        return type == 'checkbox' || type == 'radio';
    }

    special['change'] = {
        setup: function () {
            var el = this;
            if (isFormElement(el)) {
                // checkbox/radio only fires change when blur in ie<9
                // so use another technique from jquery
                if (isCheckBoxOrRadio(el)) {
                    // change in ie<9
                    // change = propertychange -> click
                    Event.on(el, 'propertychange', propertyChange);
                    Event.on(el, 'click', onClick);
                } else {
                    // other form elements use native , do not bubble
                    return false;
                }
            } else {
                // if bind on parentNode ,lazy bind change event to its form elements
                // note event order : beforeactivate -> change
                // note 2: checkbox/radio is exceptional
                Event.on(el, 'beforeactivate', beforeActivate);
            }
        },
        tearDown: function () {
            var el = this;
            if (isFormElement(el)) {
                if (isCheckBoxOrRadio(el)) {
                    Event.remove(el, 'propertychange', propertyChange);
                    Event.remove(el, 'click', onClick);
                } else {
                    return false;
                }
            } else {
                Event.remove(el, 'beforeactivate', beforeActivate);
                S.each(DOM.query('textarea,input,select', el), function (fel) {
                    if (fel.__changeHandler) {
                        fel.__changeHandler = 0;
                        Event.remove(fel, 'change', {fn: changeHandler, last: 1});
                    }
                });
            }
        }
    };

    function propertyChange(e) {
        // if only checked property 's value is changed
        if (e.originalEvent.propertyName == 'checked') {
            this.__changed = 1;
        }
    }

    function onClick(e) {
        // only fire change after click and checked is changed
        // (only fire change after click on previous unchecked radio)
        if (this.__changed) {
            this.__changed = 0;
            // fire from itself
            Event.fire(this, 'change', e);
        }
    }

    function beforeActivate(e) {
        var t = e.target;
        if (isFormElement(t) && !t.__changeHandler) {
            t.__changeHandler = 1;
            // lazy bind change , always as last handler among user's handlers
            Event.on(t, 'change', {fn: changeHandler, last: 1});
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
        if (p = fel.parentNode) {
            // fire from parent , itself is handled natively
            Event.fire(p, 'change', e);
        }
    }
}, {
    requires: ['event/dom/base', 'dom']
});/**
 * patch collection for ie<9
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/ie', function () {

}, {
    requires: ['./ie/change', './ie/submit']
});/**
 * @ignore
 * @fileOverview patch for ie<9 submit: does not bubble !
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/ie/submit', function (S, Event, DOM) {

    var special = Event._Special,
        getNodeName = DOM.nodeName;

    special['submit'] = {
        setup: function () {
            var el = this;
            // form use native
            if (getNodeName(el) == 'form') {
                return false;
            }
            // lazy add submit for inside forms
            // note event order : click/keypress -> submit
            // key point : find the forms
            Event.on(el, 'click keypress', detector);
        },
        tearDown: function () {
            var el = this;
            // form use native
            if (getNodeName(el) == 'form') {
                return false;
            }
            Event.remove(el, 'click keypress', detector);
            S.each(DOM.query('form', el), function (form) {
                if (form.__submit__fix) {
                    form.__submit__fix = 0;
                    Event.remove(form, 'submit', {
                        fn: submitBubble,
                        last: 1
                    });
                }
            });
        }
    };


    function detector(e) {
        var t = e.target,
            nodeName = getNodeName(t),
            form = (nodeName == 'input' || nodeName == 'button') ? t.form : null;

        if (form && !form.__submit__fix) {
            form.__submit__fix = 1;
            Event.on(form, 'submit', {
                fn: submitBubble,
                last: 1
            });
        }
    }

    function submitBubble(e) {
        var form = this;
        if (form.parentNode &&
            // it is stopped by user callback
            !e.isPropagationStopped() &&
            // it is not fired manually
            !e.synthetic) {
            // simulated bubble for submit
            // fire from parentNode. if form.on('submit') , this logic is never run!
            Event.fire(form.parentNode, 'submit', e);
        }
    }

}, {
    requires: ['event/dom/base', 'dom']
});
/*
 modified from jq, fix submit in ie<9
 - http://bugs.jquery.com/ticket/11049
 */
