/**
 * @ignore
 * decorate its children from one element
 * @author yiminghe@gmail.com
 */
KISSY.add("component/extension/decorate-child", function (S, DecorateChildren) {
    
    function DecorateChild() {
    }

    S.augment(DecorateChild, DecorateChildren, {
        decorateInternal: function (element) {
            var self = this,
                prefixCls = self.get('defaultChildCfg').prefixCls,
                child = element.one("." + (prefixCls + self.get("decorateChildCls")));
            // 可以装饰?
            if (child) {
                var ChildUI = self.findChildConstructorFromNode(prefixCls, child);
                if (ChildUI) {
                    // 可以直接装饰
                    self.decorateChildrenInternal(ChildUI, child);
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