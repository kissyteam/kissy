/**
 * @ignore
 * patch for ie<9 submit: does not bubble !
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var DomEvent = require('event/dom/base');
    var Dom = require('dom');
    var Special = DomEvent.Special,
        getNodeName = Dom.nodeName;

    Special.submit = {
        setup: function () {
            var el = this;
            // form use native
            if (getNodeName(el) === 'form') {
                return false;
            }
            // lazy add submit for inside forms
            // note event order : click/keypress -> submit
            // key point : find the forms
            DomEvent.on(el, 'click keypress', detector);
        },
        tearDown: function () {
            var el = this;
            // form use native
            if (getNodeName(el) === 'form') {
                return false;
            }
            DomEvent.remove(el, 'click keypress', detector);
            S.each(Dom.query('form', el), function (form) {
                if (form.__submitFix) {
                    form.__submitFix = 0;
                    DomEvent.remove(form, 'submit', {
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
            form = (nodeName === 'input' || nodeName === 'button') ? t.form : null;

        if (form && !form.__submitFix) {
            form.__submitFix = 1;
            DomEvent.on(form, 'submit', {
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
            DomEvent.fire(form.parentNode, 'submit', e);
        }
    }
});
/*
 modified from jq, fix submit in ie<9
 - http://bugs.jquery.com/ticket/11049
 */