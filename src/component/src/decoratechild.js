/**
 * @fileOverview decorate its children from one element
 * @author yiminghe@gmail.com
 */
KISSY.add("component/decoratechild", function (S, DecorateChildren) {
    function DecorateChild() {

    }

    S.augment(DecorateChild, DecorateChildren, {
        decorateInternal:function (element) {
            var self = this;
            // 不用 __set , 通知 view 更新
            self.set("el", element);
            var ui = self.get("decorateChildCls"),
                prefixCls = self.get("prefixCls"),
                child = element.one("." + self.getCls(ui));
            // 可以装饰?
            if (child) {
                var UI = self._findUIByClass(child);
                if (UI) {
                    // 可以直接装饰
                    self.decorateChildrenInternal(UI, child, prefixCls);
                } else {
                    // 装饰其子节点集合
                    self.decorateChildren(child);
                }
            }
        }
    });

    return DecorateChild;
}, {
    requires:['./decoratechildren']
});