/**
 * @fileOverview 提示类：Static
 * @author 常胤 <lzlu.com>
 */
KISSY.add("validation/warn/static", function(S, Node, Util, Define) {
    var symbol = Define.Const.enumvalidsign,
        $ = Node.all;

    function Static() {
        return {
            init: function(){
                var self = this, tg = $(self.target), panel;

                //伪属性配置的id
                if(tg.attr("data-message")) {
                    panel = $(tg.attr("data-messagebox"));
                }
                //配置的id
                else if(self.messagebox) {
                    panel = $(self.messagebox);
                }
                //从模版创建
                else {
                    panel = Node(self.template).appendTo(tg.parent());
                }
                
                if(panel) {
                    self.panel = panel;
					self.panelheight = panel.css("height");
                    self.estate = panel.one(".estate");
                    self.label = panel.one(".label");
                    if(!self.estate || !self.label) return;
                    panel.hide();
                }else{
                    return;
                }

            },

            showMessage: function(result, msg) {
                var self = this, tg = $(self.el),
                    panel = self.panel, estate = self.estate, label = self.label,
                    time = S.isNumber(self.anim)?self.anim:0.1;

                if (self.invalidClass) {
                    if (result == symbol.ignore && result == symbol.ok) {
                        tg.removeClass(self.invalidClass);
                    } else {
                        tg.addClass(self.invalidClass);
                    }
                }

                var display = panel.css("display")=="none"?false:true,
					ph = self.panelheight;
                if (result == symbol.ignore) {
                    display && panel.slideUp(time);
                } else {
                    estate.removeClass("ok tip error");
                    if (result == symbol.error) {
                        estate.addClass("error");
                        label.html(msg);
                        display || panel.height(ph).slideDown(time);
                    } else if (result == symbol.ok) {
                        if(self.isok===false) {
                            display && panel.slideUp(time);
                        }else{
                            display || panel.height(ph).slideDown(time);
                            estate.addClass("ok");
                            label.html(self.oktext?self.oktext:msg);
                        }
                    } else if (result == symbol.hint) {
                        estate.addClass("tip");
                        label.html(msg);
                        display || panel.height(ph).slideDown(time);
                    }
                }
            },

            style: {
                text: {
                    template: '<label class="valid-text"><span class="estate"><em class="label"></em></span></label>',
                    event: 'focus blur keyup'
                },
                under: {
                    template: '<div class="valid-under"><p class="estate"><span class="label"></span></p></div>',
                    event: 'focus blur keyup'
                }
            }
        }
    }
    return Static;

}, { requires: ['node',"../utils","../define"] });

