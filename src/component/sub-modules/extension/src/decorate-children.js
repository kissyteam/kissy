/**
 * @ignore
 * decorate function for children render from markup
 * @author yiminghe@gmail.com
 */
KISSY.add("component/extension/decorate-children", function (S, Component) {

    var Manager = Component.Manager;

    function DecorateChildren() {

    }

    S.augment(DecorateChildren, {
        /**
         * Generate child component from root element.
         * @protected
         * @param {KISSY.NodeList} el Root element of current component.
         */
        decorateInternal: function (el) {
            var self = this;
            self.decorateChildren(el);
        },

        /**
         * Get component's constructor from KISSY Node.
         * @protected
         * @param prefixCls
         * @param {KISSY.NodeList} childNode Child component's root node.
         */
        findChildConstructorFromNode: function (prefixCls, childNode) {
            var cls = childNode[0].className || "";
            // 过滤掉特定前缀
            if (cls) {
                cls = cls.replace(new RegExp("\\b" + prefixCls, "ig"), "");
                return Manager.getConstructorByXClass(cls);
            }
            return null;
        },

        // 生成一个子组件
        decorateChildrenInternal: function (ChildUI, childNode, childConfig) {
            var self = this;
            // html_parser 值优先
            childConfig = S.merge(self.get('defaultChildCfg'), childConfig, {
                srcNode: childNode
            });
            delete childConfig.xclass;
            return self.addChild(new ChildUI(childConfig));
        },

        /**
         * decorate child element from parent component's root element.
         * @private
         * @param {KISSY.NodeList} el component's root element.
         */
        decorateChildren: function (el) {
            var self = this,
                defaultChildCfg = self.get('defaultChildCfg'),
                prefixCls = defaultChildCfg.prefixCls,
                defaultChildXClass = self.get('defaultChildCfg').xclass,
                children = el.children();
            children.each(function (c) {
                var ChildUI = self.findChildConstructorFromNode(prefixCls, c) ||
                    defaultChildXClass && Manager.getConstructorByXClass(defaultChildXClass);
                self.decorateChildrenInternal(ChildUI, c);
            });
        }
    });

    return DecorateChildren;

}, {
    requires: ['component/base']
});