/**
 * decorate its children from one element
 * @author yiminghe@gmail.com
 */
KISSY.add("component/decoratechild", function(S, DecorateChildren) {
    function DecorateChild() {

    }

    S.augment(DecorateChild, DecorateChildren, {
        decorateInternal:function(element) {
            var self = this,
                ui = self.get("decorateChildCls"),
                prefixCls = self.get("prefixCls"),
                child = element.one("." + self.getCls(ui)),
                UI = self._findUIByClass(child);
            self.set("el", element);
            // 可以直接装饰
            self.decorateChildrenInternal(new UI({
                srcNode:child,
                prefixCls:prefixCls
            }));
        }
    });

    return DecorateChild;
}, {
    requires:['./decoratechildren']
});