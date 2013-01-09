/**
 * @ignore
 * decorate its children from one element
 * @author yiminghe@gmail.com
 */
KISSY.add("component/base/decorate-child", function (S, DecorateChildren) {
    function DecorateChild() {

    }

    S.augment(DecorateChild, DecorateChildren, {
        decorateInternal: function (element) {
            var self = this;
            // 不用 setInternal , 通知 view 更新
            self.set("el", element);
            var ui = self.get("decorateChildCls"),
                prefixCls = self.get('prefixCls'),
                child = element.one("." + ui);
            // 可以装饰?
            if (child) {
                var UI = self.findUIConstructorByNode(prefixCls, child, 1);
                if (UI) {
                    // 可以直接装饰
                    self.decorateChildrenInternal(UI, child);
                } else {
                    // 装饰其子节点集合
                    self.decorateChildren(child);
                }
            }
        }
    });

    return DecorateChild;
}, {
    requires: ['./decorate-children']
});