/**
 * UIBase.Box
 * @author: 承玉<yiminghe@gmail.com>
 */
KISSY.add('uibase/boxrender', function(S, Node) {


    function Box() {
    }

    Box.ATTRS = {
        el: {
            //容器元素
            setter:function(v) {
                if (S.isString(v))
                    return Node.one(v);
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
        elBefore:{
            //插入到该元素前
            value:null
        },
        html: {}
    };

    Box.construct = constructEl;

    function constructEl(cls, style, width, height, tag, attrs) {
        style = style || {};

        if (width) {
            style.width = width;
        }

        if (height) {
            style.height = height;
        }

        var styleStr = '';

        for (var s in style) {
            if (style.hasOwnProperty(s)) {
                styleStr += s + ":" + style[s] + ";";
            }
        }

        var attrStr = '';

        for (var a in attrs) {
            if (attrs.hasOwnProperty(a)) {
                attrStr += " " + a + "='" + attrs[a] + "'" + " ";
            }
        }

        return "<" + tag + (styleStr ? (" style='" + styleStr + "' ") : "")
            + attrStr + (cls ? (" class='" + cls + "' ") : "")
            + "><" + "/" + tag + ">";
        //return ret;
    }

    Box.HTML_PARSER = {
        el:function(srcNode) {
            return srcNode;
        }
    };

    Box.prototype = {


        __renderUI:function() {
            var self = this;
            // 新建的节点才需要摆放定位
            if (self.__boxRenderNew) {
                var render = self.get("render"),
                    el = self.get("el");
                var elBefore = self.get("elBefore");
                elBefore = elBefore && elBefore[0];
                render[0].insertBefore(el[0], elBefore || null);
            }
        },

        __createDom:function() {
            var self = this,
                el = self.get("el");
            if (!el) {
                self.__boxRenderNew = true;
                el = new Node(constructEl(self.get("elCls"),
                    self.get("elStyle"),
                    self.get("width"),
                    self.get("height"),
                    self.get("elTagName"),
                    self.get("elAttrs")));
                self.set("el", el);
            }
        },

        _uiSetElAttrs:function(attrs) {
            this.get("el").attr(attrs);
        },
        _uiSetElCls:function(cls) {
            this.get("el").addClass(cls);
        },

        _uiSetElStyle:function(style) {
            this.get("el").css(style);
        },

        _uiSetWidth:function(w) {
            this.get("el").width(w);
        },

        _uiSetHeight:function(h) {
            //S.log("_uiSetHeight");
            var self = this;
            self.get("el").height(h);
        },

        _uiSetHtml:function(c) {
            this.get("el").html(c);
        },

        __destructor:function() {
            //S.log("box __destructor");
            var el = this.get("el");
            if (el) {
                el.detach();
                el.remove();
            }
        }
    };

    return Box;
}, {
    requires:['node']
});
