/**
 * @fileOverview mask extension for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase/maskrender", function (S, UA, Node) {

    /**
     * 每组相同 prefixCls 的 position 共享一个遮罩
     */
    var maskMap = {
            /**
             * {
             *  node:
             *  num:
             * }
             */

        },
        ie6 = (UA['ie'] === 6),
        $ = Node.all;

    function getMaskCls(self) {
        return self.get("prefixCls") + "ext-mask";
    }

    function docWidth() {
        return  ie6 ? ("expression(KISSY.DOM.docWidth())") : "100%";
    }

    function docHeight() {
        return ie6 ? ("expression(KISSY.DOM.docHeight())") : "100%";
    }

    function initMask(maskCls) {
        var mask = $("<div " +
            " style='width:" + docWidth() + ";" +
            "left:0;" +
            "top:0;" +
            "height:" + docHeight() + ";" +
            "position:" + (ie6 ? "absolute" : "fixed") + ";'" +
            " class='" +
            maskCls +
            "'>" +
            (ie6 ? "<" + "iframe " +
                "style='position:absolute;" +
                "left:" + "0" + ";" +
                "top:" + "0" + ";" +
                "background:red;" +
                "width: expression(this.parentNode.offsetWidth);" +
                "height: expression(this.parentNode.offsetHeight);" +
                "filter:alpha(opacity=0);" +
                "z-index:-1;'></iframe>" : "") +
            "</div>")
            .prependTo("body");
        /**
         * 点 mask 焦点不转移
         */
        mask.unselectable();
        mask.on("mousedown click", function (e) {
            e.halt();
        });
        return mask;
    }

    function Mask() {
    }

    Mask.prototype = {

        _maskExtShow:function () {
            var self = this,
                maskCls = getMaskCls(self),
                maskDesc = maskMap[maskCls],
                maskShared = self.get("maskShared"),
                mask = self.get("maskNode");
            if (!mask) {
                if (maskShared) {
                    if (maskDesc) {
                        mask = maskDesc.node;
                    } else {
                        mask = initMask(maskCls);
                        maskDesc = maskMap[maskCls] = {
                            num:0,
                            node:mask
                        };
                    }
                } else {
                    mask = initMask(maskCls);
                }
                self.__set("maskNode", mask);
            }
            mask.css("z-index", self.get("zIndex") - 1);
            if (maskShared) {
                maskDesc.num++;
            }
            if (!maskShared || maskDesc.num == 1) {
                mask.show();
            }
        },

        _maskExtHide:function () {
            var self = this,
                maskCls = getMaskCls(self),
                maskDesc = maskMap[maskCls],
                maskShared = self.get("maskShared"),
                mask = self.get("maskNode");
            if (maskShared && maskDesc) {
                maskDesc.num = Math.max(maskDesc.num - 1, 0);
                if (maskDesc.num == 0) {
                    mask.hide();
                }
            } else {
                mask.hide();
            }
        },

        __destructor:function () {
            var self = this,
                maskShared = self.get("maskShared"),
                mask = self.get("maskNode");
            if (maskShared) {
                self._maskExtHide();
            } else {
                mask.remove();
            }
        }

    };

    return Mask;
}, {
    requires:["ua", "node"]
});

/**
 * TODO
 *  - mask index 隐藏时不会恢复 z-index，需要业务架构自己实现 DialogManager
 **/