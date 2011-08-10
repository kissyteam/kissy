/**
 * 提示类：Static
 * @author: 常胤 <lzlu.com>
 */
KISSY.add("validation/warn/static", function(S, DOM, Event, Util, Define) {
    var symbol = Define.Const.enumvalidsign;

    function Static() {
        return {
            init: function() {
                var self = this, tg = self.target,
                    panel,label,estate;

                if(DOM.attr("data-messagebox")){
                   panel = DOM.get(DOM.attr("data-messagebox"));
                }else if(self.messagebox){
                    panel = DOM.get(self.messagebox);
                }else{
                    panel = DOM.create(self.template);
                    tg.parentNode.appendChild(panel);
                }
                estate = DOM.get('.estate', panel),label = DOM.get('.label', panel);
                if(!estate || !label) return;
                DOM.hide(panel);

                S.mix(self, {
                        panel: panel,
                        estate: estate,
                        label: label
                    });
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
                text: {
                    template: '<label class="valid-text"><span class="estate"><em class="label"></em></span></label>',
                    event: 'focus blur keyup'
                },
                siderr: {
                    template: '<div class="valid-siderr"><p class="estate"><' + 's></s><span class="label"></span></p></div>',
                    event: 'focus blur keyup'
                },
                under: {
                    template: '<div class="valid-under"><p class="estate"><span class="label"></span></p></div>',
                    event: 'focus blur keyup'
                },
                sidebd: {
                    template: '<div class="valid-sidebd"><p class="estate"><span class="label"></span></p></div>',
                    event: 'focus blur'
                }
            }


        };
    }

    if (1 > 2) {
        Static.sidebd();
    }
    return Static;

}, { requires: ['dom',"event","../utils","../define"] });

