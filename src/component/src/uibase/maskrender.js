/**
 * @fileOverview mask extension for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase/maskrender", function (S, UA, Node) {

    var ie6 = (UA['ie'] === 6),
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
        mask.on("mousedown", function (e) {
            e.preventDefault();
        });
        return mask;
    }

    function Mask() {
    }

    Mask.ATTRS = {

        mask: {
            value: false
        },
        maskNode: {

        }

    };

    Mask.prototype = {

        __renderUI: function () {
            var self = this;
            if (self.get('mask')) {
                self.set('maskNode', initMask(getMaskCls(self)));
            }
        },

        __destructor: function () {
            var self = this, mask;
            if (mask = self.get("maskNode")) {
                mask.remove();
            }
        }

    };

    return Mask;
}, {
    requires: ["ua", "node"]
});

/**
 * TODO
 *  - mask index 隐藏时不会恢复 z-index，需要业务架构自己实现 DialogManager
 **/