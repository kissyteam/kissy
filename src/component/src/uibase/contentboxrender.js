/**
 * @fileOverview 里层包裹层定义， 适合mask以及shim
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase/contentboxrender", function (S, Node, BoxRender, DOM) {

    function ContentBoxRender() {
    }

    ContentBoxRender.ATTRS = {
        contentEl: {
            // 不写 valueFn, 留待 createDom 处理
        }
    };

    /*
     ! contentEl 只能由组件动态生成
     */
    ContentBoxRender.prototype = {
        __createDom: function () {
            var self = this,
                contentEl,
                el = self.get("el");

            var childNodes = el[0].childNodes,
                c = childNodes.length && DOM.nodeListToFragment(childNodes);

            // 产生新的 contentEl
            contentEl = Node.all("<div class='" + self.get('prefixCls') + "contentbox'>" +
                "</div>").append(c);

            el.append(contentEl);

            self.setInternal("contentEl", contentEl);
        }
    };

    return ContentBoxRender;
}, {
    requires: ["node", "./boxrender", 'dom']
});