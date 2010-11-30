/**
 * UIBase.Box
 * @author: 承玉<yiminghe@gmail.com>
 */
KISSY.add('uibase-box', function(S) {
    S.namespace("UIBase");
    var doc = document,
        Node = S.Node;

    function Box() {
        S.log("box init");
    }

    S.mix(Box, {
        APPEND:1,
        INSERT:0
    });

    Box.ATTRS = {
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
        elTagName:{
            //生成标签名字
            value:"div"
        },
        elAttrs:{
            //其他属性
        },
        elOrder:{
            //插入容器位置
            //0 : prepend
            //1 : append
            value:1
        },
        html: {
            // 内容, 默认为 undefined, 不设置
            value: false
        }
    };

    Box.HTML_PARSER = {
        el:function(srcNode) {
            return srcNode;
        }
    };

    Box.prototype = {
        __syncUI:function() {
            S.log("_syncUIBoxExt");
        },
        __bindUI:function() {
            S.log("_bindUIBoxExt");
        },
        __renderUI:function() {
            S.log("_renderUIBoxExt");
            var self = this,
                render = self.get("render"),
                el = self.get("el");
            render = new Node(render);
            if (!el) {
                el = new Node("<" + self.get("elTagName") + ">");
                if (self.get("elOrder")) {
                    render.append(el);
                } else {
                    render.prepend(el);
                }
                self.set("el", el);
            }
        },
        _uiSetElAttrs:function(attrs) {
            S.log("_uiSetElAttrs");
            if (attrs) {
                this.get("el").attr(attrs);
            }
        },
        _uiSetElCls:function(cls) {
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
            if (c !== false) {
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

    S.UIBase.Box = Box;
});
