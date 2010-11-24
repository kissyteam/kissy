/**
 * close extension for kissy dialog
 * @author:yiminghe@gmail.com
 */
KISSY.add("ext-overlay-close", function(S) {
    S.namespace("Ext");
    var CLS_PREFIX = 'ks-ext-',Node = S.Node;

    function CloseExt() {
        S.log("close init");
        var self = this;
        self.on("renderUI", self._rendUICloseExt, self);
        self.on("bindUI", self._bindUICloseExt, self);
        self.on("syncUI", self._syncUICloseExt, self);
    }

    CloseExt.ATTRS = {
        closable: {             // 是否需要关闭按钮
            value: true
        },
        closeBtn:{}
    };

    CloseExt.HTML_PARSER = {
        closeBtn:"." + CLS_PREFIX + 'close'
    };

    CloseExt.prototype = {
        _syncUICloseExt:function() {
            S.log("_syncUICloseExt");
        },
        _uiSetClosable:function(v) {
            S.log("_uiSetClosable");
            var self = this,
                closeBtn = self.get("closeBtn");
            if (closeBtn) {
                if (v) {
                    closeBtn.show();
                } else {
                    closeBtn.hide();
                }
            }
        },
        _rendUICloseExt:function() {
            S.log("_rendUICloseExt");
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
        _bindUICloseExt:function() {
            S.log("_bindUICloseExt");
            var self = this,
                closeBtn = self.get("closeBtn");
            closeBtn && closeBtn.on("click", function(ev) {
                self.hide();
                ev.halt();
            });
        },

        __destructor:function() {
            S.log("close-ext __destructor");
            var self = this,
                closeBtn = self.get("closeBtn");
            closeBtn && closeBtn.detach();
        }
    };
    S.Ext.Close = CloseExt;

});