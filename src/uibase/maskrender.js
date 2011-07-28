/**
 * mask extension for kissy
 * @author 承玉<yiminghe@gmail.com>
 */
KISSY.add("uibase/maskrender", function(S,UA,DOM,Node) {

    /**
     * 多 position 共享一个遮罩
     */
    var mask,
        iframe,
        num = 0;


    function initMask() {
        mask = new Node("<div " +
            //"tabindex='-1' " +
            "class='" +
            this.get("prefixCls") + "ext-mask'/>").prependTo(document.body);
        mask.css({
                "position":"absolute",
                left:0,
                top:0,
                width:UA['ie'] == 6 ? DOM['docWidth']() : "100%",
                "height": DOM['docHeight']()
            });
        if (UA['ie'] == 6) {
            //ie6 下最好和 mask 平行
            iframe = new Node("<" + "iframe " +
                //"tabindex='-1' " +
                "style='position:absolute;" +
                "left:0;" +
                "top:0;" +
                "background:red;" +
                "width:" + DOM['docWidth']() + "px;" +
                "height:" + DOM['docHeight']() + "px;" +
                "filter:alpha(opacity=0);" +
                "z-index:-1;'/>").insertBefore(mask)
        }

        S.Event.on(window, "resize", function() {
            var o = {
                width:UA['ie'] == 6 ? DOM['docWidth']() : "100%",
                "height": DOM['docHeight']()
            };
            if (iframe) {
                iframe.css(o);
            }
            mask.css(o);
        });

        /**
         * 点 mask 焦点不转移
         */
        mask.unselectable();
        mask.on("mousedown click", function(e) {
            e.halt();
        });
    }

    function Mask() {
        //S.log("mask init");
    }


    Mask.prototype = {

        _maskExtShow:function() {
            var self = this;
            if (!mask) {
                initMask.call(self);
            }
            var zIndex = self.get("zIndex") - 1;
            mask.css("z-index", zIndex);
            iframe && iframe.css("z-index", zIndex);
            num++;
            mask.css("display", "");
            iframe && iframe.css("display", "");
        },

        _maskExtHide:function() {
            num--;
            if (num <= 0) num = 0;
            if (!num) {
                mask && mask.css("display", "none");
                iframe && iframe.css("display", "none");
            }
        },

        __destructor:function() {
            this._maskExtHide();
        }

    };

    return Mask;
}, {requires:["ua","dom","node"]});