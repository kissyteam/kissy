/**
 * mask extension for kissy
 * @author: 承玉<yiminghe@gmail.com>
 */
KISSY.add("uibase/mask", function(S) {

    /**
     * 多 position 共享一个遮罩
     */
    var mask,
        num = 0;


    function initMask() {
        var UA = S.require("ua"),Node = S.require("node/node"),DOM = S.require("dom");
        mask = new Node("<div class='ks-ext-mask'>").prependTo(document.body);
        mask.css({
            "position":"absolute",
            left:0,
            top:0,
            width:UA['ie'] == 6 ? DOM['docWidth']() : "100%",
            "height": DOM['docHeight']()
        });
        if (UA['ie'] == 6) {
            mask.append("<" + "iframe style='width:100%;" +
                "height:expression(this.parentNode.offsetHeight);" +
                "filter:alpha(opacity=0);" +
                "z-index:-1;'>");
        }
    }

    function Mask() {
        //S.log("mask init");
    }

    Mask.ATTRS = {
        mask:{
            value:false
        }
    };

    Mask.prototype = {
        __bindUI:function() {
            //S.log("_bindUIMask");
        },

        __renderUI:function() {
            //S.log("_renderUIMask");
        },

        __syncUI:function() {
            //S.log("_syncUIMask");
        },
        _uiSetMask:function(v) {
            //S.log("_uiSetMask");
            var self = this;
            if (v) {
                self.on("show", self._maskExtShow);
                self.on("hide", self._maskExtHide);
            } else {
                self.detach("show", self._maskExtShow);
                self.detach("hide", self._maskExtHide);
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
            mask.css("display", "");
        },

        _maskExtHide:function() {
            num--;
            if (num <= 0) num = 0;
            if (!num)
                mask && mask.css("display", "none");
        },

        __destructor:function() {
            //S.log("mask __destructor");
        }

    };

    return Mask;
}, {requires:["ua"]});