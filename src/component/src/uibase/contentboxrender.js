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
                el = self.get("el"),
                childNodes = el[0].childNodes,
                c = childNodes.length && DOM.nodeListToFragment(childNodes);

            // 产生新的 contentEl
            contentEl = constructEl("ks-contentbox "
                + (self.get("contentElCls") || ""),
                self.get("contentElStyle"),
                undefined,
                undefined,
                self.get("contentTagName"),
                self.get("contentElAttrs"), c);

            el.append(contentEl);

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
            } else if (c) {
                contentEl.empty().append(c);
            }
        }
    };

    return ContentBoxRender;
}, {
    requires:["node", "./boxrender", 'dom']
});