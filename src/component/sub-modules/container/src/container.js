/**
 * @ignore
 * component hierarchy management
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Control = require('component/control');
    var ContainerRender = require('./container/render');

    function defAddChild(e) {
        var self = this;
        if (e.target !== self) {
            return;
        }
        var c = e.component,
            children = self.get('children'),
            index = e.index;

        children.splice(index, 0, c);

        // construct
        children = self.get('children');

        c = children[index];

        c.setInternal('parent', self);

        if (self.get('rendered')) {
            self.renderChild(index);
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
            cDOMParentEl,
            cDOMEl,
            destroy = e.destroy,
            children = self.get('children'),
            index = e.index;

        if (index !== -1) {
            children.splice(index, 1);
        }

        c.setInternal('parent', null);

        if (destroy) {
            // c is still json
            if (c.destroy) {
                c.destroy();
            }
        } else {
            if (c.get && (cDOMEl = c.el)) {
                if ((cDOMParentEl = cDOMEl.parentNode)) {
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
     * @extends KISSY.Component.Control
     * @class KISSY.Component.Container
     */
    return Control.extend({
        isContainer: true,

        initializer: function () {
            var self = this,
                prefixCls = self.get('prefixCls'),
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
                children = self.get('children');
            for (i = 0; i < children.length; i++) {
                self.renderChild(i);
            }
        },

        createChildren: function () {
            var i,
                self = this,
                children = self.get('children');
            for (i = 0; i < children.length; i++) {
                self.createChild(i);
            }
        },

        /**
         * Add the specified component as a child of current component
         * at the given 0-based index.
         * @param {KISSY.Component.Control|Object} c
         * Child component instance to be added
         * or
         * Object describe child component
         * @param {String} [c.xclass] When c is a object, specify its child class.
         * @param {Number} [index]  0-based index at which
         * the new child component is to be inserted;
         * If not specified , the new child component will be inserted at last position.
         */
        addChild: function (c, index) {
            var self = this,
                children = self.get('children');
            if (index === undefined) {
                index = children.length;
            }
            self.fire('beforeAddChild', {
                component: c,
                index: index
            });
        },

        renderChild: function (childIndex) {
            var self = this,
                children = self.get('children');

            self.createChild(childIndex).render();

            self.fire('afterRenderChild', {
                component: children[childIndex],
                index: childIndex
            });
        },

        createChild: function (childIndex) {
            var self = this,
                c,
                elBefore,
                domContentEl,
                children = self.get('children'),
                cEl,
                contentEl;
            c = children[childIndex];
            contentEl = self.view.getChildrenContainerEl();
            domContentEl = contentEl[0];
            elBefore = domContentEl.children[childIndex] || null;
            if (c.get('rendered')) {
                cEl = c.el;
                if (cEl.parentNode !== domContentEl) {
                    domContentEl.insertBefore(cEl, elBefore);
                }
            } else {
                if (elBefore) {
                    c.set('elBefore', elBefore);
                } else {
                    c.set('render', contentEl);
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
         * and subsequently detaches the child's Dom from the document.
         * Otherwise it is the caller's responsibility to
         * clean up the child component's Dom.
         *
         * @param {KISSY.Component.Control} c The child component to be removed.
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
         * see {@link KISSY.Component.Container#removeChild}
         * @param {Boolean} [destroy] If true,
         * calls ``destroy()`` on the removed child component.
         * @chainable
         */
        removeChildren: function (destroy) {
            var self = this,
                i,
                t = [].concat(self.get('children'));
            for (i = 0; i < t.length; i++) {
                self.removeChild(t[i], destroy);
            }
            return self;
        },

        /**
         * Returns the child at the given index, or null if the index is out of bounds.
         * @param {Number} index 0-based index.
         * @return {KISSY.Component.Control} The child at the given index; null if none.
         */
        getChildAt: function (index) {
            var children = this.get('children');
            return children[index] || null;
        },

        /**
         * destroy children
         * @protected
         */
        destructor: function () {
            var i,
                children = this.get('children');
            for (i = 0; i < children.length; i++) {
                if (children[i].destroy) {
                    children[i].destroy();
                }
            }
        }
    }, {
        ATTRS: {
            /**
             * Array of child components
             * @cfg {KISSY.Component.Control[]} children
             */
            /**
             * @ignore
             */
            children: {
                value: [],
                getter: function (v) {
                    var defaultChildCfg = null,
                        i,
                        c,
                        self = this;
                    for (i = 0; i < v.length; i++) {
                        c = v[i];
                        if (!c.isControl) {
                            defaultChildCfg = defaultChildCfg || self.get('defaultChildCfg');
                            S.mix(c, defaultChildCfg, false);
                            v[i] = this.createComponent(c);
                        }
                    }
                    return v;
                },
                setter: function (v) {
                    var
                        i,
                        c;
                    for (i = 0; i < v.length; i++) {
                        c = v[i];
                        if (c.isControl) {
                            c.setInternal('parent', this);
                        }
                    }
                }
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
});