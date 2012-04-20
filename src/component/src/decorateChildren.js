/**
 * @fileOverview decorate function for children render from markup
 * @author yiminghe@gmail.com
 */
KISSY.add("component/decorateChildren", function (S, UIStore) {


    function DecorateChildren() {

    }

    S.augment(DecorateChildren, {
        decorateInternal:function (el) {
            var self = this;
            // 不用 __set , 通知 view 更新
            self.set("el", el);
            self.decorateChildren(el);
        },

        /**
         * Get component's constructor from KISSY Node.
         * @protected
         * @param {Node} childNode Child component's root node.
         */
        findUIConstructorByNode:function (childNode) {
            var self = this,
                cls = childNode.attr("class") || "",
                prefixCls = self.get("prefixCls");
            // 过滤掉特定前缀
            cls = cls.replace(new RegExp("\\b" + prefixCls, "ig"), "");
            var UI = UIStore.getUIConstructorByCssClass(cls);
            if (!UI) {
                S.log(childNode);
                S.log("can not find ui " + cls + " from this markup");
            }
            return UI;
        },

        // 生成一个组件
        decorateChildrenInternal:function (UI, c, prefixCls) {
            this.addChild(new UI({
                srcNode:c,
                prefixCls:prefixCls
            }));
        },

        // container 需要在装饰时对儿子特殊处理，递归装饰
        decorateChildren:function (el) {
            var self = this,
                children = el.children(),
                prefixCls = self.get("prefixCls");
            children.each(function (c) {
                var UI = self.findUIConstructorByNode(c);
                self.decorateChildrenInternal(UI, c, prefixCls);
            });
        }
    });

    return DecorateChildren;

}, {
    requires:['./uistore']
});