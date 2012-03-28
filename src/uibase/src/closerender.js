/**
 * @fileOverview close extension for kissy dialog
 * @author yiminghe@gmail.com
 */
KISSY.add("uibase/closerender", function (S, Node) {

    var CLS_PREFIX = 'ext-';

    function Close() {
    }

    Close.ATTRS = {
        closable:{             // 是否需要关闭按钮
            value:true,
            sync:false
        },
        closeBtn:{
        }
    };

    Close.HTML_PARSER = {
        closeBtn:function (el) {
            return el.one("." + this.get("prefixCls") + CLS_PREFIX + 'close');
        }
    };

    Close.prototype = {
        _uiSetClosable:function (v) {
            this.get("closeBtn")[v ? "show" : "hide"]();
        },
        __createDom:function () {
            var self = this,
                closeBtn = self.get("closeBtn"),
                closable = self.get("closable"),
                el = self.get("el");

            if (!closeBtn) {
                closeBtn = new Node("<a " +
                    "tabindex='0' " +
                    (closable ? "" : "style='display:none'") +
                    "href='javascript:void(\"关闭\")' " +
                    "role='button' " +
                    "class='" + this.get("prefixCls") + CLS_PREFIX + "close" + "'>" +
                    "<span class='" +
                    self.get("prefixCls") + CLS_PREFIX + "close-x" +
                    "'>关闭<" + "/span>" +
                    "<" + "/a>").appendTo(el);
                self.__set("closeBtn", closeBtn);
            } else {
                closeBtn[closable ? "show" : "hide"]();
            }
        },

        __destructor:function () {
            var self = this,
                closeBtn = self.get("closeBtn");
            closeBtn && closeBtn.detach();
        }
    };

    return Close;

}, {
    requires:["node"]
});