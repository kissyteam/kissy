/**
 * @ignore
 * render for container
 * @author yiminghe@gmail.com
 */
KISSY.add('component/container/render', function (S, Control, Manager) {
    /**
     * User KISSY.Component.Container.getDefaultRender() to get this class
     * @class KISSY.Component.Container.Render
     */
    return Control.getDefaultRender().extend([], {
        /**
         * decorate child element from parent component's root element.
         * @protected
         */
        decorateDom: function () {
            var self = this,
                childrenContainerEl = self.getChildrenContainerEl(),
                control = self.control,
                defaultChildCfg = control.get('defaultChildCfg'),
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
            control.set('children', childrenComponents);
        },
        /**
         * Return the dom element into which child component to be rendered.
         * @protected
         * @return {KISSY.NodeList}
         */
        getChildrenContainerEl: function () {
            return this.$el;
        }
    }, {
        name: 'ContainerRender'
    });
}, {
    requires: ['component/control', 'component/manager']
});