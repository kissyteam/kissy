/**
 * @fileOverview 里层包裹层定义， 适合mask以及shim
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase/contentboxrender", function (S, Node, BoxRender, DOM) {

    function ContentBoxRender() {
    }

    ContentBoxRender.ATTRS = {
        contentEl:{},
        contentElAttrs:{},
        contentElCls:{},
        contentElStyle:{},
        contentTagName:{
            value:"div"
        }
    };

    /*
     ! contentEl 只能由组件动态生成
     */
    var constructEl = BoxRender.construct;

    ContentBoxRender.prototype = {

        // no need ,shift create work to __createDom
        __renderUI:function () {
        },

        __createDom:function () {
            var self = this,
                contentEl,
                c = self.get("content"),
                el = self.get("el");

            // 从已有节点生成
            if (self.get("srcNode")) {
                // 用户没有设置 content，直接把 el 的所有子节点移过去
                if (c == el.html()) {
                    c = DOM.nodeListToFragment(el[0].childNodes);
                } else {
                    // 用户设置了 content，清空原来 el 的子节点
                    el.empty();
                }
            }

            // 产生新的 contentEl
            contentEl = constructEl("ks-contentbox "
                + (self.get("contentElCls") || ""),
                self.get("contentElStyle"),
                undefined,
                undefined,
                self.get("contentTagName"),
                self.get("contentElAttrs"), c);

            contentEl.appendTo(el);

            self.__set("contentEl", contentEl);
        },

        _uiSetContentElCls:function (cls) {
            this.get("contentEl").addClass(cls);
        },

        _uiSetContentElAttrs:function (attrs) {
            this.get("contentEl").attr(attrs);
        },

        _uiSetContentElStyle:function (v) {
            this.get("contentEl").css(v);
        },

        _uiSetContent:function (c) {
            var contentEl = this.get("contentEl");
            if (typeof c == "string") {
                contentEl.html(c);
            } else {
                contentEl.empty().append(c);
            }
        }
    };

    return ContentBoxRender;
}, {
    requires:["node", "./boxrender", 'dom']
});