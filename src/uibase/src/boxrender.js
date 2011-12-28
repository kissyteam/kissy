/**
 * @fileOverview UIBase.Box
 * @author 承玉<yiminghe@gmail.com>
 */
KISSY.add('uibase/boxrender', function (S, Node) {

    var $ = S.all;

    /**
     * @class
     * @memberOf UIBase.Box
     */
    function BoxRender() {
    }

    BoxRender.ATTRS =
    /**
     * @lends UIBase.Box.Render#
     */
    {
        el:{
            //容器元素
            setter:function (v) {
                return $(v);
            }
        },
        elCls:{},
        elStyle:{},
        width:{},
        height:{},
        elTagName:{
            // 生成标签名字
            value:"div"
        },
        elAttrs:{},
        elBefore:{},
        render:{},
        html:{
            sync:false
        },
        visible:{},
        visibleMode:{}
    };

    BoxRender.construct = constructEl;

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

    BoxRender.HTML_PARSER =
    /**
     * @ignore
     */
    {
        html:function (el) {
            return el.html();
        }
    };

    BoxRender.prototype =
    /**
     * @lends UIBase.Box.Render#
     */
    {


        __renderUI:function () {
            var self = this;
            // 新建的节点才需要摆放定位
            if (self.__boxRenderNew) {
                var render = self.get("render"),
                    el = self.get("el"),
                    elBefore = self.get("elBefore");
                if (elBefore) {
                    el.insertBefore(elBefore);
                }
                else if (render) {
                    el.appendTo(render);
                }
                else {
                    el.appendTo("body");
                }
            }
        },

        /**
         * 只负责建立节点，如果是 decorate 过来的，甚至内容会丢失
         * 通过 render 来重建原有的内容
         */
        __createDom:function () {

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
                if (self.get("html")) {
                    el.html(self.get("html"));
                }
            }
        },

        _uiSetElAttrs:function (attrs) {
            this.get("el").attr(attrs);
        },

        _uiSetElCls:function (cls) {
            this.get("el").addClass(cls);
        },

        _uiSetElStyle:function (style) {

            this.get("el").css(style);
        },

        _uiSetWidth:function (w) {
            this.get("el").width(w);
        },

        _uiSetHeight:function (h) {
            //S.log("_uiSetHeight");
            var self = this;
            self.get("el").height(h);
        },

        _uiSetHtml:function (c) {
            this.get("el").html(c);
        },

        _uiSetVisible:function (isVisible) {
            var el = this.get("el"),
                visibleMode = this.get("visibleMode");
            if (visibleMode == "visibility") {
                el.css("visibility", isVisible ? "visible" : "hidden");
            } else {
                el.css("display", isVisible ? "" : "none");
            }
        },

        show:function () {
            var self = this;
            self.render();
            self.set("visible", true);
        },
        hide:function () {
            this.set("visible", false);
        },

        __destructor:function () {
            //S.log("box __destructor");
            var el = this.get("el");
            if (el) {
                el.detach();
                el.remove();
            }
        }
    };

    return BoxRender;
}, {
    requires:['node']
});
