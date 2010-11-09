/**
 * basic box support for component
 * @author:yiminghe@gmail.com
 */
KISSY.add("ext-box", function(S) {
    S.namespace("Ext");

    var doc = document,Node=S.Node;

    function BoxExt() {
        var self = this;
        self.on("renderUI", self._renderUIBoxExt, self);
        var oriDdestroy = self.destroy;
        self.destroy = function() {
            var el = self.get("el");
            el.detach();
            el.remove();
            oriDdestroy.call(self);
        };
    }

    BoxExt.ATTRS = {
        el: {
            //容器元素
            setter:function(v) {
                if (S.isString(v))
                    return S.one(v);
            }
        },
        elCls: {
            // 容器的 class
            value: "ks-box-el"
        },
        width: {
            // 宽度
            setter: function(v) {
                return parseInt(v) || 0;
            }
        },
        height: {
            // 高度
            setter: function(v) {
                return parseInt(v) || 0;
            }
        },

        html: {
            // 内容, 默认为 undefined, 不设置
            value: false
        }
    };

    BoxExt.HTML_PARSER = {
        el:function(srcNode) {
            return srcNode;
        }
    };

    BoxExt.prototype = {

        _renderUIBoxExt:function() {
            var self = this,
                render = self.get("render") || S.one(doc.body),
                el = self.get("el");

            if (!el) {
                el = new Node("<div>");
                var b = render[0];
                if (b.firstChild) {
                    el.insertBefore(b.firstChild);
                } else {
                    el.appendTo(b);
                }
                self.set("el", el);
            }
        },

        _uiSetElCls:function(cls) {
            if (cls) {
                this.get("el")[0].className = cls;
            }
        },

        _uiSetWidth:function(w) {
            var self = this;
            if (w) {
                self.get("el").width(w);
            }
        },

        _uiSetHeight:function(h) {
            var self = this;
            if (h) {
                self.get("el").height(h);
            }
        },

        _uiSetHtml:function(c) {
            if (c !== false)
                this.get("el").html(c);
        }
    };

    S.Ext.Box = BoxExt;


});