/**
 * close extension for kissy dialog
 * @author 承玉<yiminghe@gmail.com>
 */
KISSY.add("uibase/closerender", function(S, Node) {

    var CLS_PREFIX = 'ext-';

    function Close() {
    }

    Close.ATTRS = {
        closable: {             // 是否需要关闭按钮
            value: true
        },
        closeBtn:{
        }
    };

    Close.HTML_PARSER = {
        closeBtn:function(el) {
            return el.one("." + this.get("prefixCls") + CLS_PREFIX + 'close');
        }
    };

    Close.prototype = {
        _uiSetClosable:function(v) {
            var self = this,
                closeBtn = self.get("closeBtn");
            if (closeBtn) {
                if (v) {
                    closeBtn.css("display", "");
                } else {
                    closeBtn.css("display", "none");
                }
            }
        },
        __renderUI:function() {
            var self = this,
                closeBtn = self.get("closeBtn"),
                el = self.get("contentEl");

            if (!closeBtn && el) {
                closeBtn = new Node("<a " +
                    "tabindex='0' " +
                    "role='button' " +
                    "class='" + this.get("prefixCls") + CLS_PREFIX + "close" + "'>" +
                    "<span class='" +
                    this.get("prefixCls") + CLS_PREFIX + "close-x" +
                    "'>关闭</span>" +
                    "</a>").appendTo(el);
                self.set("closeBtn", closeBtn);
            }
        },

        __destructor:function() {

            var self = this,
                closeBtn = self.get("closeBtn");
            closeBtn && closeBtn.detach();
        }
    };
    return Close;

}, {
        requires:["node"]
    });