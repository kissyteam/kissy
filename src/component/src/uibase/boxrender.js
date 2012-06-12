/**
 * @fileOverview UIBase.Box
 * @author yiminghe@gmail.com
 */
KISSY.add('component/uibase/boxrender', function (S) {

    var $ = S.all, doc = S.Env.host.document;


    function BoxRender() {
    }

    BoxRender.ATTRS = {
        el:{
            //容器元素
            setter:function (v) {
                return $(v);
            }
        },
        // 构建时批量生成，不需要执行单个
        elCls:{
            sync:false
        },
        elStyle:{
            sync:false
        },
        width:{
            sync:false
        },
        height:{
            sync:false
        },
        elTagName:{
            sync:false,
            // 生成标签名字
            value:"div"
        },
        elAttrs:{
            sync:false
        },

        content:{
            sync:false
        },
        elBefore:{},
        render:{},
        visible:{},
        visibleMode:{}
    };

    BoxRender.construct = constructEl;

    function wrapWH(v) {
        return typeof v == "number" ? (v + "px") : v;
    }

    function constructEl(cls, style, width, height, tag, attrs, html) {
        style = style || {};

        if (width) {
            style.width = wrapWH(width);
        }

        if (height) {
            style.height = wrapWH(height);
        }

        var htmlStr = html || "", styleStr = '';

        if (!S.isString(html)) {
            htmlStr = '';
        }

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

        var node = $("<" + tag + (styleStr ? (" style='" + styleStr + "' ") : "")
            + attrStr + (cls ? (" class='" + cls + "' ") : "")
            + ">" + htmlStr + "<" + "/" + tag + ">");

        if (html && !S.isString(html)) {
            node.append(html);
        }

        return node;
    }

    BoxRender.HTML_PARSER =
    /**
     * @ignore
     */
    {
        content:function (el) {
            return el.html();
        }
    };

    BoxRender.prototype =
    /**
     * @lends Component.UIBase.Box.Render#
     */
    {

        __renderUI:function () {
            var self = this;
            // 新建的节点才需要摆放定位
            if (!self.get("srcNode")) {
                var render = self.get("render"),
                    el = self.get("el"),
                    elBefore = self.get("elBefore");
                if (elBefore) {
                    el.insertBefore(elBefore);
                } else if (render) {
                    el.appendTo(render);
                } else {
                    el.appendTo(doc.body);
                }
            }
        },

        /**
         * 只负责建立节点，如果是 decorate 过来的，甚至内容会丢失
         * 通过 render 来重建原有的内容
         */
        __createDom:function () {
            var self = this,
                elCls = self.get("elCls"),
                elStyle = self.get("elStyle"),
                width = self.get("width"),
                height = self.get("height"),
                content = self.get("content"),
                elAttrs = self.get("elAttrs"),
                el = self.get("el");
            if (!el) {
                el = constructEl(elCls,
                    elStyle,
                    width,
                    height,
                    self.get("elTagName"),
                    elAttrs,
                    content);
                self.__set("el", el);
            }
            // 通过 srcNode 过来的
            else {
                if (elCls) {
                    el.addClass(elCls);
                }
                if (elStyle) {
                    el.css(elStyle);
                }
                if (width !== undefined) {
                    el.width(width);
                }
                if (height !== undefined) {
                    el.height(height);
                }

                // 防止冲掉 el 原来的子元素引用 !!
                if (content !== el.html()) {
                    _uiSetContent.call(self, content);
                }

                if (elAttrs) {
                    el.attr(elAttrs);
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
            var self = this;
            self.get("el").height(h);
        },

        _uiSetContent:_uiSetContent,

        _uiSetVisible:function (isVisible) {
            var el = this.get("el"),
                visibleMode = this.get("visibleMode");
            if (visibleMode == "visibility") {
                el.css("visibility", isVisible ? "visible" : "hidden");
            } else {
                el.css("display", isVisible ? "" : "none");
            }
        },

        __destructor:function () {
            var el = this.get("el");
            if (el) {
                el.remove();
            }
        }
    };

    function _uiSetContent(c) {
        var el = this.get("el");
        if (S.isString(c)) {
            el.html(c);
        } else if (c) {
            el.empty();
            el.append(c);
        }
    }

    return BoxRender;
}, {
    requires:['node']
});
