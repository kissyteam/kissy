/**
 * @ignore
 * 里层包裹层定义， 适合mask以及shim
 * @author yiminghe@gmail.com
 */
KISSY.add("component/extension/content-box-render", function (S, Node, DOM) {

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
                el = self.get("el"),
                childNodes = el[0].childNodes,
                c = childNodes.length && DOM._nodeListToFragment(childNodes);

            // 产生新的 contentEl
            contentEl = Node.all("<div class='" +
                self.get('prefixCls') + "contentbox'>" +
                "</div>");

            if (c) {
                contentEl.append(c);
            }

            el.append(contentEl);

            self.setInternal("contentEl", contentEl);
        }
    };

    return ContentBoxRender;
}, {
    requires: ["node", 'dom']
});