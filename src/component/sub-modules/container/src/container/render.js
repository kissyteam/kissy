/**
 * render for container
 * @author yiminghe@gmail.com
 */
KISSY.add('component/container/render', function (S, Controller, Manager) {

    return Controller.ATTRS.xrender.value.extend([], {

        /**
         * decorate child element from parent component's root element.
         */
        decorateDom: function () {
            var self = this,
                childrenContainerEl = self.getChildrenContainerEl(),
                controller = self.controller,
                defaultChildCfg = controller.get('defaultChildCfg'),
                prefixCls = defaultChildCfg.prefixCls,
                defaultChildXClass = defaultChildCfg.xclass,
                childrenComponents = [],
                children = childrenContainerEl.children();
            children.each(function (c) {
                var ChildUI = self.getComponentConstructorByNode(prefixCls, c) ||
                    defaultChildXClass &&
                        Manager.getConstructorByXClass(defaultChildXClass);
                if (ChildUI) {
                    childrenComponents.push(new ChildUI(S.merge(defaultChildCfg, {
                        srcNode: c
                    })));
                }
            });
            controller.set('children', childrenComponents);
        },
        /**
         * Return the dom element into which child component to be rendered.
         * @return {KISSY.NodeList}
         */
        getChildrenContainerEl: function () {
            return this.el;
        }
    }, {
        name: 'ContainerRender'
    });

}, {
    requires: ['component/controller', 'component/manager']
});