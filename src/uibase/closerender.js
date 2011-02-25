/**
 * close extension for kissy dialog
 * @author: 承玉<yiminghe@gmail.com>
 */
KISSY.add("uibase/closerender", function(S) {

    var CLS_PREFIX = 'ks-ext-';

    function Close() {
        //S.log("close init");
    }

    Close.ATTRS = {
        closable: {             // 是否需要关闭按钮
            value: true
        },
        closeBtn:{}
    };

    Close.HTML_PARSER = {
        closeBtn:"." + CLS_PREFIX + 'close'
    };

    Close.prototype = {
        _uiSetClosable:function(v) {
            //S.log("_uiSetClosable");
            var self = this,
                closeBtn = self.get("closeBtn");
            if (closeBtn) {
                if (v) {
                    closeBtn.css("display","");
                } else {
                    closeBtn.css("display","none");
                }
            }
        },
        __renderUI:function() {
            var Node = S.require("node/node");
            var self = this,
                closeBtn = self.get("closeBtn"),
                el = self.get("contentEl");

            if (!closeBtn &&
                el) {
                closeBtn = new Node("<a " +
                    "href='#' " +
                    "class='" + CLS_PREFIX + "close" + "'>" +
                    "<span class='" +
                    CLS_PREFIX + "close-x" +
                    "'>X</span>" +
                    "</a>")
                    .appendTo(el);
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

});