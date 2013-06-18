/**
 * render for container
 * @author yiminghe@gmail.com
 */
KISSY.add('component/base/container-render', function (S, Render, Manager) {

    return Render.extend([], {

        createDom: function () {
            var self = this,
                controller = self.controller;
            if (self.get('srcNode')) {
                controller.decorateChildren(self.getChildrenContainerEl());
            }
        },

        /**
         * Get component's constructor from KISSY Node.
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
            var self = this,
                controller = self.controller;
            childConfig = S.merge(controller.get('defaultChildCfg'), childConfig, {
                srcNode: childNode
            });
            delete childConfig.xclass;
            return controller.addChild(new ChildUI(childConfig));
        },

        /**
         * decorate child element from parent component's root element.
         * @param {KISSY.NodeList} el component's root element.
         */
        decorateChildren: function (el) {
            var self = this,
                controller = self.controller,
                defaultChildCfg = controller.get('defaultChildCfg'),
                prefixCls = defaultChildCfg.prefixCls,
                defaultChildXClass = controller.get('defaultChildCfg').xclass,
                children = el.children();
            children.each(function (c) {
                var ChildUI = self.findChildConstructorFromNode(prefixCls, c) ||
                    defaultChildXClass &&
                        Manager.getConstructorByXClass(defaultChildXClass);
                if (ChildUI) {
                    self.decorateChildrenInternal(ChildUI, c);
                }
            });
        },
        /**
         * Return the dom element into which child component to be rendered.
         * @return {KISSY.NodeList}
         */
        getChildrenContainerEl: function () {
            return this.el;
        }
    },{
        name:'ContainerRender'
    });

}, {
    requires: ['./render', './manager']
});