KISSY.add("ext-mask", function(S) {
    S.namespace("Ext");
    var mask,num = 0;


    function initMask() {
        
    }

    function MaskExt() {
        var self = this;
    }

    MaskExt.ATTRS = {
        mask:{
            value:false
        }
    };

    MaskExt.prototype = {
        _uiSetMask:function(v) {
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
                mask = new S.Node("<div class='ks-ext-mask'>");
                var b = document.body,c = b.firstChild;
                if (c) mask.insertBefore(c);
                else mask.appendTo(b);
            }
            mask.css({
                "position":"absolute",
                "z-index":this.get("zIndex"),
                width:"100%",
                "height": S.DOM.docHeight()
            });
            mask.show();
        },

        _maskExtHide:function() {
            mask && mask.hide();
        }

    };

    S.Ext.Mask = MaskExt;
});