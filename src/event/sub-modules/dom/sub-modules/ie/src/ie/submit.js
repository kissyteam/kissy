/**
 * @ignore
 * patch for ie<9 submit: does not bubble !
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/ie/submit', function (S, DOMEvent, DOM) {

    var Special = DOMEvent.Special,
        getNodeName = DOM.nodeName;

    Special['submit'] = {
        setup: function () {
            var el = this;
            // form use native
            if (getNodeName(el) == 'form') {
                return false;
            }
            // lazy add submit for inside forms
            // note event order : click/keypress -> submit
            // key point : find the forms
            DOMEvent.on(el, 'click keypress', detector);
        },
        tearDown: function () {
            var el = this;
            // form use native
            if (getNodeName(el) == 'form') {
                return false;
            }
            DOMEvent.remove(el, 'click keypress', detector);
            S.each(DOM.query('form', el), function (form) {
                if (form.__submit__fix) {
                    form.__submit__fix = 0;
                    DOMEvent.remove(form, 'submit', {
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
            DOMEvent.on(form, 'submit', {
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
            DOMEvent.fire(form.parentNode, 'submit', e);
        }
    }

}, {
    requires: ['event/dom/base', 'dom']
});
/*
 modified from jq, fix submit in ie<9
 - http://bugs.jquery.com/ticket/11049
 */