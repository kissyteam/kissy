/**
 * @fileOverview decorate function for children render from markup
 * @author yiminghe@gmail.com
 */
KISSY.add("component/decorateChildren", function (S, Manager) {


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
         * @param {NodeList} childNode Child component's root node.
         */
        findUIConstructorByNode:function (childNode, ignoreError) {
            var self = this,
                cls = childNode.attr("class") || "",
                prefixCls = self.get("prefixCls");
            // 过滤掉特定前缀
            cls = cls.replace(new RegExp("\\b" + prefixCls, "ig"), "");
            var UI = Manager.getConstructorByXClass(cls);
            if (!UI && !ignoreError) {
                S.log(childNode);
                S.error("can not find ui " + cls + " from this markup");
            }
            return UI;
        },

        // 生成一个组件
        decorateChildrenInternal:function (UI, c) {
            var self = this;
            self.addChild(new UI({
                srcNode:c,
                prefixCls:self.get("prefixCls")
            }));
        },

        // container 需要在装饰时对儿子特殊处理，递归装饰
        decorateChildren:function (el) {
            var self = this,
                children = el.children();
            children.each(function (c) {
                var UI = self.findUIConstructorByNode(c);
                self.decorateChildrenInternal(UI, c);
            });
        }
    });

    return DecorateChildren;

}, {
    requires:['./manager']
});