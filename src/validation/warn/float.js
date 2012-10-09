/**
 * @fileOverview 扩展提示类：float
 * @author 常胤 <lzlu.com>
 */
KISSY.add("validation/warn/float", function (S, DOM, Event, Util, Define) {
    var symbol = Define.Const.enumvalidsign;

    function Float() {
        return {
            //出错标记
            invalidCls:"J_Invalid",

            //重写init
            init:function () {
                var self = this, tg = self.target,
                    panel = DOM.create(self.template),
                    msg = DOM.get('div.msg', panel);


                S.ready(function () {
                    S.Env.host.document.body.appendChild(panel);
                });
                S.mix(self, {
                    panel:S.one(panel),
                    msg:S.one(msg)
                });

                //绑定对象的focus,blur事件来显示隐藏消息面板
                Event.on(self.el, "focus", function (ev) {
                    if (DOM.hasClass(tg, self.invalidCls)) {
                        self._toggleError(true, ev.target);
                    }
                });

                Event.on(self.el, "blur", function () {
                    self._toggleError(false);
                });
            },

            //处理校验结果
            showMessage:function (result, msg, evttype, target) {
                var self = this, tg = self.target,
                    div = self.msg;

                if (symbol.ok == result) {
                    DOM.removeClass(tg, self.invalidClass);
                    div.html('OK');
                } else {
                    if (evttype != "submit") {
                        self._toggleError(true, target);
                    }
                    DOM.addClass(tg, self.invalidClass);
                    div.html(msg);
                }
            },

            //定位
            _pos:function (target) {
                var self = this, offset = DOM.offset(target || self.target),
                    ph = self.panel.height(),
                    pl = offset.left - 10, pt = offset.top - ph - 20;
                self.panel.css('left', pl).css('top', pt);
            },

            //显示错误
            _toggleError:function (show, target) {
                var self = this, panel = self.panel;
                if (show) {
                    DOM.show(panel);
                    self._pos(target);
                } else {
                    DOM.hide(panel);
                }
            },

            style:{
                "float":{
                    template:'<div class="valid-float" style="display:none;"><div class="msg">&nbsp;</div><' + 's>◥◤</s></div>',
                    event:'focus blur',
                    invalidClass:'vailInvalid'
                }
            }
        }
    }

    return Float;

}, { requires:['dom', "event", "../utils", "../define"] });
























	
	
	

