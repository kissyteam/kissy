KISSY.add("ext-mask", function(S) {
    S.namespace("Ext");
    /**
     * 多 position 共享一个遮罩
     */
    var mask,
        UA = S.UA,
        num = 0;


    function initMask() {
        mask = new S.Node("<div class='ks-ext-mask'>").prependTo(document.body);
        mask.css({
            "position":"absolute",
            left:0,
            top:0,
            width:"100%",
            "height": S.DOM.docHeight()
        });
        if (UA.ie == 6) {
            mask.append("<iframe style='width:100%;" +
                "height:expression(this.parentNode.offsetHeight);" +
                "filter:alpha(opacity=0);" +
                "z-index:-1;'>");
        }
    }

    function MaskExt() {
        S.log("mask init");
        var self = this;
        self.on("bindUI", self._bindUIMask, self);
        self.on("renderUI", self._renderUIMask, self);
        self.on("syncUI", self._syncUIMask, self);
    }

    MaskExt.ATTRS = {
        mask:{
            value:false
        }
    };

    MaskExt.prototype = {
        _bindUIMask:function() {
            S.log("_bindUIMask");
        },

        _renderUIMask:function() {
            S.log("_renderUIMask");
        },

        _syncUIMask:function() {
            S.log("_syncUIMask");
        },
        _uiSetMask:function(v) {
            S.log("_uiSetMask");
            var self = this;
            if (v) {
                self.on("show", self._maskExtShow, self);
                self.on("hide", self._maskExtHide, self);
            } else {
                self.detach("show", self._maskExtShow, self);
                self.detach("hide", self._maskExtHide, self);
            }
        },

        _maskExtShow:function() {
            if (!mask) {
                initMask();
            }
            mask.css({
                "z-index":this.get("zIndex") - 1
            });
            num++;
            mask.show();
        },

        _maskExtHide:function() {
            num--;
            if (num <= 0) num = 0;
            if (!num)
                mask && mask.hide();
        },

        __destructor:function() {
            S.log("mask __destructor");
        }

    };

    S.Ext.Mask = MaskExt;
});