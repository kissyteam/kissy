/**
 * close extension for kissy dialog
 * @author:yiminghe@gmail.com
 */
KISSY.add("ext-overlay-close", function(S) {
    S.namespace("Ext");
    var CLS_PREFIX = 'ks-dialog-',Node = S.Node;

    function CloseExt() {
         S.log("close init");
        var self = this;
        self.on("renderUI", self._rendUICloseExt, self);
        self.on("bindUI", self._bindUICloseExt, self);
        self.on("syncUI", self._syncUICloseExt, self);
    }

    CloseExt.ATTRS = {
        closeBtnCls: {          // 关闭按钮的 class
            value: CLS_PREFIX + 'close'
        },
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
                el = self.get("el");

            if (!closeBtn &&
                el) {
                closeBtn = new Node("<div class='" + self.get("closeBtnCls") + "'>")
                    .appendTo(el);
                self.set("closeBtn", closeBtn);
            }
        },
        _bindUICloseExt:function() {
            S.log("_bindUICloseExt");
            var self = this,
                closeBtn = self.get("closeBtn");
            closeBtn && closeBtn.on("click", function() {
                self.hide();
            });
        },

        __destructor:function() {
            S.log("close-ext __destructor");
            var self = this,
                closeBtn = self.get("closeBtn");
            closeBtn&&closeBtn.detach();
        }
    };
    S.Ext.Close = CloseExt;

});