/**
 * mask extension for kissy
 * @author 承玉<yiminghe@gmail.com>
 */
KISSY.add("uibase/maskrender", function(S, UA, Node) {

    /**
     * 多 position 共享一个遮罩
     */
    var mask,
        $ = Node.all,
        win = $(window),
        doc = $(document),
        iframe,
        num = 0;

    function docWidth() {
        return  doc.width() + "px";
    }

    function docHeight() {
        return doc.height() + "px";
    }

    function initMask() {
        mask = $("<div " +
            //"tabindex='-1' " +
            "class='" +
            this.get("prefixCls") + "ext-mask'/>")
            .prependTo("body");
        mask.css({
            "position":"absolute",
            left:0,
            top:0,
            width: docWidth(),
            "height": docHeight()
        });
        if (UA['ie'] == 6) {
            //ie6 下最好和 mask 平行
            iframe = $("<" + "iframe " +
                //"tabindex='-1' " +
                "style='position:absolute;" +
                "left:" + "0px" + ";" +
                "top:" + "0px" + ";" +
                "background:red;" +
                "width:" + docWidth() + ";" +
                "height:" + docHeight() + ";" +
                "filter:alpha(opacity=0);" +
                "z-index:-1;'/>").insertBefore(mask)
        }

        /**
         * 点 mask 焦点不转移
         */
        mask.unselectable();
        mask.on("mousedown click", function(e) {
            e.halt();
        });
    }

    function Mask() {
    }

    var resizeMask = S.buffer(function() {
        var v = {
            width : docWidth(),
            height : docHeight()
        };
        mask.css(v);
        iframe && iframe.css(v);
    }, 50);


    Mask.prototype = {

        _maskExtShow:function() {
            var self = this;
            if (!mask) {
                initMask.call(self);
            }
            var zIndex = {
                "z-index": self.get("zIndex") - 1
            },
                display = {
                    "display":""
                };
            mask.css(zIndex);
            iframe && iframe.css(zIndex);
            num++;
            if (num == 1) {
                mask.css(display);
                iframe && iframe.css(display);
                win.on("resize", resizeMask);
            }
        },

        _maskExtHide:function() {
            num--;
            if (num <= 0) {
                num = 0;
            }
            if (!num) {
                var display = {
                    "display":"none"
                };
                mask && mask.css(display);
                iframe && iframe.css(display);
                win.detach("resize", resizeMask);
            }
        },

        __destructor:function() {
            this._maskExtHide();
        }

    };

    return Mask;
}, {
    requires:["ua","node"]
});