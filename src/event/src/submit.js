/**
 * @fileOverview patch for ie<9 submit : does not bubble !
 * @author yiminghe@gmail.com
 */
KISSY.add("event/submit", function (S, UA, Event, DOM, special) {
    var mode = S.Env.host.document['documentMode'];
    if (UA['ie'] && (UA['ie'] < 9 || (mode && mode < 9))) {
        var nodeName = DOM._nodeName;
        special['submit'] = {
            setup:function () {
                var el = this;
                // form use native
                if (nodeName(el, "form")) {
                    return false;
                }
                // lazy add submit for inside forms
                // note event order : click/keypress -> submit
                // keypoint : find the forms
                Event.on(el, "click keypress", detector);
            },
            tearDown:function () {
                var el = this;
                // form use native
                if (nodeName(el, "form")) {
                    return false;
                }
                Event.remove(el, "click keypress", detector);
                S.each(DOM.query("form", el),function (form) {
                    if (form.__submit__fix) {
                        form.__submit__fix = 0;
                        Event.remove(form, "submit", {
                            fn:submitBubble,
                            last:1
                        });
                    }
                });
            }
        };


        function detector(e) {
            var t = e.target,
                form = nodeName(t, "input") || nodeName(t, "button") ? t.form : null;

            if (form && !form.__submit__fix) {
                form.__submit__fix = 1;
                Event.on(form, "submit", {
                    fn:submitBubble,
                    last:1
                });
            }
        }

        function submitBubble(e) {
            var form = this;
            if (form.parentNode &&
                // it is stopped by user callback
                !e.isPropagationStopped &&
                // it is not fired manually
                !e._ks_fired) {
                // simulated bubble for submit
                // fire from parentNode. if form.on("submit") , this logic is never run!
                Event.fire(form.parentNode, "submit", e);
            }
        }
    }

}, {
    requires:["ua", "./base", "dom", "./special"]
});
/**
 * modified from jq ,fix submit in ie<9
 *  - http://bugs.jquery.com/ticket/11049
 **/