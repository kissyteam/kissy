/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jun 19 14:00
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 component/container
*/

/**
 * component hierarchy management
 * @author yiminghe@gmail.com
 */
KISSY.add('component/container', function (S, Controller, Manager,ContainerRender) {

    function defAddChild(e) {
        var self = this;
        if (e.target !== self) {
            return;
        }
        var c = e.component,
            children = self.get('children'),
            index = e.index;
        children.splice(index, 0, c);
        if (self.get('rendered')) {
            c = self.renderChild(c, index);
        }
        self.fire('afterAddChild', {
            component: c,
            index: index
        });
    }

    function defRemoveChild(e) {
        var self = this;
        if (e.target !== self) {
            return;
        }
        var c = e.component,
            cEl,
            cDOMParentEl,
            cDOMEl,
            destroy = e.destroy,
            children = self.get('children'),
            index = e.index;
        if (index != -1) {
            children.splice(index, 1);
        }
        if (c.setInternal) {
            c.setInternal('parent', null);
        }
        if (destroy) {
            // c is still json
            if (c.destroy)
                c.destroy();
        } else {
            if (c.get && (cEl = c.get('el'))) {
                cDOMEl = cEl[0];
                if (cDOMParentEl = cDOMEl.parentNode) {
                    cDOMParentEl.removeChild(cDOMEl);
                }
            }
        }
        self.fire('afterRemoveChild', {
            component: c,
            index: index
        });
    }

    /**
     * Base Container class for KISSY Component.
     * @extends KISSY.Component.Controller
     * @class KISSY.Component.Container
     */
    return Controller.extend({

        isContainer: true,

        initializer: function () {
            var self = this,
                prefixCls = self.prefixCls,
                defaultChildCfg = self.get('defaultChildCfg');

            self.publish('beforeAddChild', {
                defaultFn: defAddChild
            });

            self.publish('beforeRemoveChild', {
                defaultFn: defRemoveChild
            });

            defaultChildCfg.prefixCls = defaultChildCfg.prefixCls || prefixCls;
        },

        createDom: function () {
            this.createChildren();
        },

        renderUI: function () {
            this.renderChildren();
        },

        renderChildren: function () {
            var i,
                self = this,
                children = self.get("children");
            for (i = 0; i < children.length; i++) {
                self.renderChild(children[i], i);
            }
        },

        createChildren: function () {
            var i,
                self = this,
                children = self.get("children");
            for (i = 0; i < children.length; i++) {
                self.createChild(children[i], i);
            }
        },

        /**
         * Add the specified component as a child of current component
         * at the given 0-based index.
         * @param {KISSY.Component.Controller|Object} c
         * Child component instance to be added
         * or
         * Object describe child component
         * @param {String} [c.xclass] When c is a object, specify its child class.
         * @param {Number} [index]  0-based index at which
         * the new child component is to be inserted;
         * If not specified , the new child component will be inserted at last position.
         * @return {KISSY.Component.Controller} this
         */
        addChild: function (c, index) {
            var self = this,
                children = self.get("children");
            if (index === undefined) {
                index = children.length;
            }
            c = self.createChild(c);
            self.fire('beforeAddChild', {
                component: c,
                index: index
            });
            return c;
        },

        renderChild: function (c, childIndex) {
            var self = this,
                children = self.get('children');
            if (typeof childIndex === "undefined") {
                childIndex = S.indexOf(c, children);
            }
            if (c && c.get && c.get('created')) {
                c.render();
            } else {
                c = this.createChild(c, childIndex).render();
            }
            self.fire('afterRenderChild', {
                component: c,
                index: childIndex
            });
        },

        createChild: function (c, childIndex) {
            var self = this,
                elBefore,
                domContentEl,
                children = self.get('children'),
                cEl,
                contentEl;
            if (typeof childIndex === "undefined") {
                childIndex = S.indexOf(c, children);
            }
            c = Manager.createComponent(c, self);
            children[childIndex] = c;
            contentEl = self.view.getChildrenContainerEl();
            domContentEl = contentEl[0];
            elBefore = domContentEl.children[childIndex] || null;
            if (c.get('rendered')) {
                cEl = c.get('el')[0];
                if (cEl.parentNode != domContentEl) {
                    domContentEl.insertBefore(cEl, elBefore);
                }
            } else {
                if (elBefore) {
                    c.set("elBefore", elBefore);
                } else {
                    c.set("render", contentEl);
                }
                c.create();
            }
            self.fire('afterCreateChild', {
                component: c,
                index: childIndex
            });

            return c;
        },

        /**
         * Removed the given child from this component,and returns it.
         *
         * If destroy is true, calls ``destroy()`` on the removed child component,
         * and subsequently detaches the child's DOM from the document.
         * Otherwise it is the caller's responsibility to
         * clean up the child component's DOM.
         *
         * @param {KISSY.Component.Controller} c The child component to be removed.
         * @param {Boolean} [destroy=true] If true,
         * calls ``destroy()`` on the removed child component.
         */
        removeChild: function (c, destroy) {
            if (destroy === undefined) {
                destroy = true;
            }
            this.fire('beforeRemoveChild', {
                component: c,
                index: S.indexOf(c, this.get('children')),
                destroy: destroy
            });
        },

        /**
         * Removes every child component attached to current component.
         * see {@link KISSY.Component.Controller#removeChild}
         * @param {Boolean} [destroy] If true,
         * calls ``destroy()`` on the removed child component.
         * @chainable
         */
        removeChildren: function (destroy) {
            var self = this,
                i,
                t = [].concat(self.get("children"));
            for (i = 0; i < t.length; i++) {
                self.removeChild(t[i], destroy);
            }
            return self;
        },

        /**
         * Returns the child at the given index, or null if the index is out of bounds.
         * @param {Number} index 0-based index.
         * @return {KISSY.Component.Controller} The child at the given index; null if none.
         */
        getChildAt: function (index) {
            var children = this.get("children");
            return children[index] || null;
        },

        /**
         * destroy children
         * @protected
         */
        destructor: function () {
            var i,
                children = this.get("children");
            for (i = 0; i < children.length; i++) {
                children[i].destroy && children[i].destroy();
            }
        }
    }, {
        ATTRS: {
            /**
             * Array of child components
             * @cfg {KISSY.Component.Controller[]} children
             */
            /**
             * @ignore
             */
            children: {
                value: []
            },
            /**
             * default child config
             * @protected
             * @cfg {String} defaultChildCfg
             */
            /**
             * @ignore
             */
            defaultChildCfg: {
                value: {}
            },

            xrender: {
                value: ContainerRender
            }
        },
        name: 'container'
    });
}, {
    requires: ['component/controller', 'component/manager', './container/container-render']
});

