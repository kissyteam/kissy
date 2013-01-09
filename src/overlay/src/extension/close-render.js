/**
 * @ignore
 *  close extension for kissy dialog
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/extension/close-render", function (S, Node) {

    var CLS_PREFIX = 'ext-';

    function getCloseRenderBtn(prefixCls) {
        return new Node("<a " +
            "tabindex='0' " +
            "href='javascript:void(\"关闭\")' " +
            "role='button' " +
            "style='z-index:9' " +
            "class='" + prefixCls + CLS_PREFIX + "close" + "'>" +
            "<span class='" +
            prefixCls + CLS_PREFIX + "close-x" +
            "'>关闭<" + "/span>" +
            "<" + "/a>");
    }

    function CloseRender() {
    }

    CloseRender.ATTRS = {
        closable: {
            value: true
        },
        closeBtn: {
        }
    };

    CloseRender.HTML_PARSER = {
        closeBtn: function (el) {
            return el.one("." + this.get('prefixCls') + CLS_PREFIX + 'close');
        }
    };

    CloseRender.prototype = {
        _onSetClosable: function (v) {
            var self = this,
                btn = self.get("closeBtn");
            if (v) {
                if (!btn) {
                    self.setInternal("closeBtn", btn = getCloseRenderBtn(self.get('prefixCls')));
                }
                self.get("el").prepend(btn);
            } else {
                if (btn) {
                    btn.remove();
                }
            }
        }
    };

    return CloseRender;

}, {
    requires: ["node"]
});