/**
 * patch for ie<9 submit : does not bubble !
 * @author yiminghe@gmail.com
 */
KISSY.add("event/submit", function(S, UA, Event, DOM) {
    var mode = document['documentMode'];
    if (UA['ie'] && (UA['ie'] < 9 || (mode && mode < 9))) {

        function nodeName(n) {
            return n.nodeName.toLowerCase();
        }

        Event.special['submit'] = {
            setup: function() {
                var el = this;
                // form use native
                if (nodeName(el) === 'form') {
                    return false;
                }
                // lazy add submit for inside forms
                // note event order : click/keypress -> submit
                // keypoint : find the forms
                Event.on(el, "click keypress", detector);
            },
            tearDown:function() {
                var el = this;
                // form use native
                if (nodeName(el) === 'form') {
                    return false;
                }
                Event.remove(el, "click keypress", detector);
                DOM.query("form", el).each(function(form) {
                    if (form.__submit__fix) {
                        form.__submit__fix = 0;
                        Event.remove(form, "submit", submitBubble);
                    }
                });
            }
        };


        function detector(e) {
            var t = e.target,
                tName = nodeName(t),
                form = tName == "input" || tName == "button" ? t.form : null;

            if (form && !form.__submit__fix) {
                form.__submit__fix = 1;
                Event.on(form, "submit", submitBubble);
            }
        }

        function submitBubble(e) {
            var form = this;
            if (form.parentNode) {
                // simulated bubble for submit
                // fire from parentNode. if form.on("submit") , this logic is never run!
                Event.fire(form.parentNode, "submit", e);
            }
        }


    }

}, {
    requires:["ua","./base","dom"]
});
/**
 * modified from jq ,fix submit in ie<9
 **/