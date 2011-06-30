/**
 * 扩展提示类：fixed
 * @author: 常胤 <lzlu.com>
 */
KISSY.add("validation/warn/fixed", function(S, DOM, Event, Util, Define) {
    var symbol = Define.Const.enumvalidsign;

    function Fixed() {
        return {
            init: function() {
                var self = this, tg = self.target,
                    panel,label,estate;

                panel = DOM.attr(tg, "data=for");
                estate = DOM.get('.estate', panel);
                label = DOM.get('.label', panel);

                S.mix(self, {
                        panel: panel,
                        estate: estate,
                        label: label
                    });

                self._bindEvent(self.el, self.event, function(ev) {
                    var result = self.fire("valid", {event:ev.type});
                    if (S.isArray(result) && result.length == 2) {
                        self.showMessage(result[1], result[0], ev.type);
                    }
                })
            },

            showMessage: function(result, msg) {
                var self = this,
                    panel = self.panel, estate = self.estate, label = self.label;

                if (self.invalidClass) {
                    if (result == symbol.ignore && result == symbol.ok) {
                        DOM.removeClass(self.el, self.invalidClass);
                    } else {
                        DOM.addClass(self.el, self.invalidClass);
                    }
                }

                if (result == symbol.ignore) {
                    DOM.hide(panel);
                } else {
                    var est = "error";
                    if (result == symbol.error) {
                        est = "error";
                    } else if (result == symbol.ok) {
                        est = "ok";
                    } else if (result == symbol.hint) {
                        est = "tip";
                    }
                    DOM.removeClass(estate, "ok tip error");
                    DOM.addClass(estate, est);
                    DOM.html(label, msg);
                    DOM.show(panel);
                }
            },

            style: {
                text1: {
                    template: '<label class="valid-text"><span class="estate"><em class="label"></em></span></label>',
                    event: 'focus blur keyup'
                }
            }


        };
    }

    if (1 > 2) {
       symbol.text1();
    }

    return Fixed;

}, { requires: ['dom',"event","../utils","../define"] });

