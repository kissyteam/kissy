/**
 * @ignore
 *  mask extension for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/extension/mask-render", function (S, Node) {

    var UA = S.UA,
        ie6 = (UA['ie'] === 6),
        $ = Node.all;

    function docWidth() {
        return  ie6 ? ("expression(KISSY.DOM.docWidth())") : "100%";
    }

    function docHeight() {
        return ie6 ? ("expression(KISSY.DOM.docHeight())") : "100%";
    }

    function initMask(self) {
        var maskCls = self.get("prefixCls") + "ext-mask " + self.getCssClassWithState('-mask'),
            mask = $("<div " +
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
        /*
         点 mask 焦点不转移
         */
        mask['unselectable']();
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
                self.set('maskNode', initMask(self));
            }
        },

        __syncUI: function () {
            var self = this;
            if (self.get('mask')) {
                self.ksSetMaskVisible(self.get('visible'), 1);
            }
        },

        ksSetMaskVisible: function (shown, hideInline) {
            var self = this,
                shownCls = self.getCssClassWithState('-mask-shown'),
                maskNode = self.get('maskNode'),
                hiddenCls = self.getCssClassWithState('-mask-hidden');
            if (shown) {
                maskNode.removeClass(hiddenCls).addClass(shownCls);
            } else {
                maskNode.removeClass(shownCls).addClass(hiddenCls);

            }
            if (!hideInline) {
                maskNode.css('visibility', shown ? 'visible' : 'hidden');
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
    requires: ["node"]
});