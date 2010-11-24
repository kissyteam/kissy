/**
 * basic box support for component
 * @author:yiminghe@gmail.com
 */
KISSY.add("ext-box", function(S) {
    S.namespace("Ext");

    var doc = document,Node = S.Node;

    function BoxExt() {
        S.log("box init");
        var self = this;
        self.on("renderUI", self._renderUIBoxExt, self);
        self.on("syncUI", self._syncUIBoxExt, self);
        self.on("bindUI", self._bindUIBoxExt, self);

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
        },
        elStyle:{
            //容器的行内样式
        },
        width: {
            // 宽度           
        },
        height: {
            // 高度
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
        _syncUIBoxExt:function() {
            S.log("_syncUIBoxExt");
        },
        _bindUIBoxExt:function() {
            S.log("_bindUIBoxExt");
        },
        _renderUIBoxExt:function() {
            S.log("_renderUIBoxExt");
            var self = this,
                render = self.get("render") || S.one(doc.body),
                el = self.get("el");
            render = new Node(render);
            if (!el) {
                el = new Node("<div>");
                render.prepend(el);
                self.set("el", el);
            }
        },

        _uiSetElCls:function(cls) {
            S.log("_uiSetElCls");
            if (cls) {
                this.get("el").addClass(cls);
            }
        },

        _uiSetElStyle:function(style) {
            S.log("_uiSetElStyle");
            if (style) {
                this.get("el").css(style);
            }
        },

        _uiSetWidth:function(w) {
            S.log("_uiSetWidth");
            var self = this;
            if (w) {
                self.get("el").width(w);
            }
        },

        _uiSetHeight:function(h) {
            S.log("_uiSetHeight");
            var self = this;
            if (h) {
                self.get("el").height(h);
            }
        },

        _uiSetHtml:function(c) {
            S.log("_uiSetHtml");
            if (c !== false){
                this.get("el").html(c);
            }

        },

        __destructor:function() {
            S.log("box __destructor");
            var el = this.get("el");
            if (el) {
                el.detach();
                el.remove();
            }
        }
    };

    S.Ext.Box = BoxExt;
});