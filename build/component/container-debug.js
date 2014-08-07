/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Aug 7 15:48
*/
/*
combined modules:
component/container
*/
KISSY.add('component/container', [
    'util',
    'component/control'
], function (S, require, exports, module) {
    /**
 * @ignore
 * component hierarchy management
 * @author yiminghe@gmail.com
 */
    var util = require('util');
    var Control = require('component/control');
    var Manager = Control.Manager;
    function defAddChild(e) {
        var self = this;
        var c = e.component, children = self.get('children'), index = e.index;
        children.splice(index, 0, c);    // construct
        // construct
        children = self.get('children');
        c = children[index];    // in case dom node
        // in case dom node
        if (c.setInternal) {
            c.setInternal('parent', self);
        }    // NOTE 20140618
             // child can not render into a documentFragment(parent is not in dom tree)
        // NOTE 20140618
        // child can not render into a documentFragment(parent is not in dom tree)
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
        var c = e.component, destroy = e.destroy, children = self.get('children'), index = e.index;
        if (index !== -1) {
            children.splice(index, 1);
        }
        if (c.setInternal) {
            c.setInternal('parent', null);
        }    // c is still json
        // c is still json
        if (c.destroy) {
            c.destroy(destroy);
        } else if (c.isNode) {
            if (destroy) {
                c.remove();
            }
        }
        self.fire('afterRemoveChild', {
            component: c,
            index: index
        });
    }    /**
 * Base Container class for KISSY Component.
 * @extends KISSY.Component.Control
 * @class KISSY.Component.Container
 */
    /**
 * Base Container class for KISSY Component.
 * @extends KISSY.Component.Control
 * @class KISSY.Component.Container
 */
    module.exports = Control.extend({
        isContainer: true,
        initializer: function () {
            var self = this, prefixCls = self.get('prefixCls'), defaultChildCfg = self.get('defaultChildCfg');
            self.publish('beforeAddChild', {
                defaultFn: defAddChild,
                // only process its own default function
                defaultTargetOnly: true
            });
            self.publish('beforeRemoveChild', {
                defaultFn: defRemoveChild,
                // only process its own default function
                defaultTargetOnly: true
            });
            defaultChildCfg.prefixCls = defaultChildCfg.prefixCls || prefixCls;
        },
        // decorate child element from parent component's root element.
        decorateDom: function () {
            var self = this, childrenContainerEl = self.getChildrenContainerEl(), defaultChildCfg = self.get('defaultChildCfg'), prefixCls = defaultChildCfg.prefixCls, defaultChildXClass = defaultChildCfg.xclass, childrenComponents = [], children = childrenContainerEl.children();
            children.each(function (c) {
                var ChildUI = self.getComponentConstructorByNode(prefixCls, c) || defaultChildXClass && Manager.getConstructorByXClass(defaultChildXClass);
                if (ChildUI) {
                    childrenComponents.push(new ChildUI(util.merge(defaultChildCfg, { srcNode: c })));
                } else {
                    childrenComponents.push(c);
                }
            });
            self.set('children', childrenComponents);
        },
        createDom: function () {
            this.createChildren();
        },
        renderUI: function () {
            this.renderChildren();
        },
        renderChildren: function () {
            var i, self = this, children = self.get('children');
            for (i = 0; i < children.length; i++) {
                self.renderChild(i);
            }
        },
        createChildren: function () {
            var i, self = this, children = self.get('children');
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
            var self = this, children = self.get('children');
            if (index === undefined) {
                index = children.length;
            }
            self.fire('beforeAddChild', {
                component: c,
                index: index
            });
            return children[index];
        },
        renderChild: function (childIndex) {
            var self = this;
            var children = self.get('children');
            var c = self.createChild(childIndex);
            if (!c.isNode) {
                c.render();
            }
            self.fire('afterRenderChild', {
                component: children[childIndex],
                index: childIndex
            });
        },
        createChild: function (childIndex) {
            var self = this, c, elBefore, domContentEl, children = self.get('children'), cEl, contentEl;
            c = children[childIndex];
            contentEl = self.getChildrenContainerEl();
            domContentEl = contentEl[0];
            elBefore = domContentEl.children[childIndex] || null;
            if (c.isNode) {
                cEl = c.isNode ? c[0] : c.el;
                if (cEl.parentNode !== domContentEl) {
                    domContentEl.insertBefore(cEl, elBefore);
                }
            } else {
                if (c.get('rendered')) {
                    cEl = c.isNode ? c[0] : c.el;
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
            }
            self.fire('afterCreateChild', {
                component: c,
                index: childIndex
            });
            return c;
        },
        addChildren: function (children) {
            // TODO optimize by batch insert
            var i, l = children.length;
            for (i = 0; i < l; i++) {
                this.addChild(children[i]);
            }
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
                index: util.indexOf(c, this.get('children')),
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
            var self = this, i, t = [].concat(self.get('children'));
            for (i = 0; i < t.length; i++) {
                self.removeChild(t[i], false);
            }
            if (destroy !== false && self.$el) {
                self.getChildrenContainerEl()[0].innerHTML = '';
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
        // Return the dom element into which child component to be rendered.
        getChildrenContainerEl: function () {
            return this.$el;
        },
        /**
     * destroy children
     * @protected
     */
        destructor: function (destroy) {
            this.removeChildren(destroy);
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
                valueFn: function () {
                    return [];
                },
                getter: function (v) {
                    var defaultChildCfg = null, i, c, self = this;
                    for (i = 0; i < v.length; i++) {
                        c = v[i];
                        if (!c.isControl && !c.isNode) {
                            defaultChildCfg = defaultChildCfg || self.get('defaultChildCfg');
                            util.mix(c, defaultChildCfg, false);
                            v[i] = this.createComponent(c);
                        }
                    }
                    return v;
                },
                setter: function (v) {
                    var i, c;
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
                valueFn: function () {
                    return {};
                }
            }
        },
        name: 'container'
    });    /**
 * @ignore
 * 2014-01-26 yimingnhe@gmail.com need to use innerHTML
 * - http://jsperf.com/fragment-innnerhtml
 */
});

