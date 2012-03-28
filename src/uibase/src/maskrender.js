/**
 * @fileOverview mask extension for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add("uibase/maskrender", function (S, UA, Node) {

    /**
     * 多 position 共享一个遮罩
     */
    var mask,
        ie6 = (UA['ie'] === 6),
        px = "px",
        $ = Node.all,
        WINDOW = S.Env.host,
        doc = $(WINDOW.document),
        iframe,
        num = 0;

    function docWidth() {
        return  ie6 ? ("expression(KISSY.DOM.docWidth())") : "100%";
    }

    function docHeight() {
        return ie6 ? ("expression(KISSY.DOM.docHeight())") : "100%";
    }

    function initMask() {
        mask = $("<div " +
            " style='width:" + docWidth() + ";height:" + docHeight() + ";' " +
            "class='" +
            this.get("prefixCls") + "ext-mask'/>")
            .prependTo(WINDOW.document.body);
        mask.css({
            "position":ie6 ? "absolute" : "fixed", // mask 不会撑大 docWidth
            left:0,
            top:0
        });
        if (ie6) {
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
        mask.on("mousedown click", function (e) {
            e.halt();
        });
    }

    function Mask() {
    }


    Mask.prototype = {

        _maskExtShow:function () {
            var self = this;
            if (!mask) {
                initMask.call(self);
            }
            var zIndex = {
                "z-index":self.get("zIndex") - 1
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
            }
        },

        _maskExtHide:function () {
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
            }
        },

        __destructor:function () {
            this._maskExtHide();
        }

    };

    return Mask;
}, {
    requires:["ua", "node"]
});