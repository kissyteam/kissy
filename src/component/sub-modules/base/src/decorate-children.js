/**
 * @ignore
 * @fileOverview decorate function for children render from markup
 * @author yiminghe@gmail.com
 */
KISSY.add("component/base/decorate-children", function (S, Manager) {


    function DecorateChildren() {

    }

    S.augment(DecorateChildren, {
        /**
         * Generate child component from root element.
         * @protected
         * @member KISSY.Component.Container
         * @param {KISSY.NodeList} el Root element of current component.
         */
        decorateInternal: function (el) {
            var self = this;
            // 不用 setInternal , 通知 view 更新
            self.set("el", el);
            self.decorateChildren(el);
        },

        /**
         * Get component's constructor from KISSY Node.
         * @member KISSY.Component.Container
         * @protected
         * @param {KISSY.NodeList} childNode Child component's root node.
         */
        findUIConstructorByNode: function (childNode, ignoreError) {
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
        decorateChildrenInternal: function (UI, c) {
            var self = this;
            self.addChild(new UI({
                srcNode: c,
                prefixCls: self.get("prefixCls")
            }));
        },

        /**
         * decorate child element from parent component's root element.
         * @private
         * @member KISSY.Component.Container
         * @param {KISSY.NodeList} el component's root element.
         */
        decorateChildren: function (el) {
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
    requires: ['./manager']
});