/**
 * @fileOverview 里层包裹层定义， 适合mask以及shim
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase/contentboxrender", function (S, Node, BoxRender, DOM) {

    function ContentBoxRender() {
    }

    ContentBoxRender.ATTRS = {
        contentEl:{
            // 不写 valueFn,留待 createDom 处理
        },
        contentElAttrs:{},
        contentElStyle:{},
        contentTagName:{
            value:"div"
        }
    };

    /*
     ! contentEl 只能由组件动态生成
     */
    var constructEl = BoxRender.constructEl;

    ContentBoxRender.prototype = {

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
        }
    };

    return ContentBoxRender;
}, {
    requires:["node", "./boxrender", 'dom']
});