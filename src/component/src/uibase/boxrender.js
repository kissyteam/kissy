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

        visibleMode:{
            value:"display"
        },
        // content 设置的内容节点,默认根节点
        contentEl:{
            valueFn:function () {
                return this.get("el");
            }
        }
    };

    BoxRender.HTML_PARSER = {
        content:function (el) {
            // 从 contentElCls 的标志中读取
            var contentElCls = this.get("contentElCls");
            return (contentElCls ? el.one("." + contentElCls) : el).html();
        }
    };

    BoxRender.constructEl = constructEl;

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

        if (typeof html != 'string') {
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
                    el.insertBefore(elBefore, undefined);
                } else if (render) {
                    el.appendTo(render, undefined);
                } else {
                    el.appendTo(doc.body, undefined);
                }
            }
        },

        /**
         * 只负责建立节点，如果是 decorate 过来的，甚至内容会丢失
         * 通过 render 来重建原有的内容
         */
        __createDom:function () {
            var self = this;
            if (!self.get("srcNode")) {
                var elCls = self.get("elCls"),
                    elStyle = self.get("elStyle"),
                    width = self.get("width"),
                    height = self.get("height"),
                    content = self.get("content"),
                    elAttrs = self.get("elAttrs"),
                    el,
                    contentEl = self.get("contentEl");

                // 内容容器，content 需要设置到的容器
                if (contentEl) {
                    contentEl.html(content);
                    content = "";
                }
                el = constructEl(elCls,
                    elStyle,
                    width,
                    height,
                    self.get("elTagName"),
                    elAttrs,
                    content);
                if (contentEl) {
                    el.append(contentEl);
                }
                self.__set("el", el);
                if (!contentEl) {
                    // 没取到,这里设下值, uiSet 时可以 set("content")  取到
                    self.__set("contentEl", el);
                }
            }
        },

        __syncUI:function () {
            var self = this;
            // 通过 srcNode 过来的，最后调整，防止 plugin render 又改过!
            if (self.get("srcNode")) {
                var el = self.get("el"),
                    content = self.get("content"),
                    attrs = [
                        "elCls",
                        "elStyle",
                        "width",
                        "height",
                        "elAttrs"
                    ];
                S.each(attrs, function (attr) {
                    var v;
                    if (v = self.get(attr)) {
                        self["_uiSet" + S.ucfirst(attr)](v);
                    }
                });
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

        _uiSetContent:function (c) {
            var self = this,
                el = self.get("contentEl");
            if (typeof c == "string") {
                el.html(c);
            } else if (c) {
                el.empty().append(c);
            }
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

        __destructor:function () {
            var el = this.get("el");
            if (el) {
                el.remove();
            }
        }
    };

    return BoxRender;
}, {
    requires:['node']
});
