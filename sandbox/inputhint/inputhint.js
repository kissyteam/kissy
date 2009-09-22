/**
 * KISSY.InputHint ×é¼þ
 *
 * @creator     Óñ²®<lifesinger@gmail.com>
 * @depends     yahoo-dom-event
 */

var KISSY = window.KISSY || {};

(function() {
    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event;

    KISSY.InputHint = {
        init: function(el, hintCls, hintText) {
            el = Dom.get(el);

            this.renderUI(el, hintCls, hintText);
            this.bindUI(el, hintCls, hintText);
        },

        renderUI: function(el, hintCls, hintText) {
            Dom.addClass(hintCls);
            el.value = hintText;
        },

        bindUI: function(el, hintCls, hintText) {
            Event.on(el, "focus", function() {
                if (Dom.hasClass(this, hintCls)) {
                    this.value = "";
                    Dom.removeClass(this, hintCls);
                }
            });
            Event.on(el, "blur", function() {
                if (this.value == "") {
                    this.value = hintText;
                    Dom.addClass(this, hintCls);
                }
            });
        }
    };
})();


