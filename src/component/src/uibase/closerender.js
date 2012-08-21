/**
 * @fileOverview close extension for kissy dialog
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase/closerender", function (S, Node) {

    var CLS_PREFIX = 'ks-ext-';

    function getCloseRenderBtn() {
        return new Node("<a " +
            "tabindex='0' " +
            "href='javascript:void(\"关闭\")' " +
            "role='button' " +
            "class='" + CLS_PREFIX + "close" + "'>" +
            "<span class='" +
            CLS_PREFIX + "close-x" +
            "'>关闭<" + "/span>" +
            "<" + "/a>");
    }

    function CloseRender() {
    }

    CloseRender.ATTRS = {
        closable:{
            value:true
        },
        closeBtn:{
        }
    };

    CloseRender.HTML_PARSER = {
        closeBtn:function (el) {
            return el.one("." + CLS_PREFIX + 'close');
        }
    };

    CloseRender.prototype = {
        _uiSetClosable:function (v) {
            var self = this,
                btn = self.get("closeBtn");
            if (v) {
                if (!btn) {
                    self.setInternal("closeBtn", btn = getCloseRenderBtn());
                }
                btn.appendTo(self.get("el"), undefined);
            } else {
                if (btn) {
                    btn.remove();
                }
            }
        }
    };

    return CloseRender;

}, {
    requires:["node"]
});