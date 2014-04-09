/**
 * @ignore
 * menu item ,child component for menu
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Control = require('component/control');
    var $ = require('node').all;

    /**
     * @class KISSY.Menu.Item
     * A menu item component which menu is consisted of.
     * xclass: 'menuitem'.
     * @extends KISSY.Component.Control
     */
    return Control.extend({
        isMenuItem: 1,

        beforeCreateDom: function (renderData) {
            renderData.elAttrs.role = renderData.selectable ?
                'menuitemradio' : 'menuitem';
            if (renderData.selected) {
                renderData.elCls.push(this.getBaseCssClasses('selected'));
            }
        },

        // do not set highlighted on mousedown for touch device!
        // only set active in component/control

        /**
         * Perform default action when click on enter on this menuitem.
         * If selectable, then make it selected.
         * Finally fire click on its parent menu.
         * @protected
         */
        handleClickInternal: function (ev) {
            var self = this;
            self.callSuper(ev);
            // combobox menu tap penetration
            // https://github.com/kissyteam/kissy/issues/533
            ev.preventDefault();
            // 可选
            if (self.get('selectable')) {
                self.set('selected', true);
            }
            self.fire('click');
            return true;
        },

        // 只允许调用 menuItem 的 set('highlighted')
        // 不允许调用 menu 的 set('highlightedItem')
        _onSetHighlighted: function (v, e) {
            var self = this,
                parent = self.get('parent');
            self.callSuper(v, e);
            if (!(e && e.byPassSetHighlightedItem)) {
                if (self.get('rendered')) {
                    parent.set('highlightedItem', v ? self : null);
                } else {
                    if (v) {
                        // do not set null on initializer
                        parent.set('highlightedItem', self);
                    }
                }
            }
            // 是否要滚动到当前菜单项(横向，纵向)
            if (v) {
                var el = self.$el,
                // 找到向上路径上第一个可以滚动的容器，直到父组件节点（包括）
                // 找不到就放弃，为效率考虑不考虑 parent 的嵌套可滚动 div
                    p = el.parent(function (e) {
                        return $(e).css('overflow') !== 'visible';
                    }, parent.get('el').parent());
                if (!p) {
                    return;
                }
                el.scrollIntoView(p, {
                    alignWithTop: true,
                    allowHorizontalScroll: true,
                    onlyScrollIfNeeded: true
                });
            }
        },

        _onSetSelected: function (v) {
            var self = this,
                cls = self.getBaseCssClasses('selected');
            self.$el[v ? 'addClass' : 'removeClass'](cls);
        },

        /**
         * Check whether this menu item contains specified element.
         * @param {KISSY.NodeList} element Element to be tested.
         * @protected
         */
        containsElement: function (element) {
            var $el = this.$el;
            return $el && ($el[0] === element || $el.contains(element));
        }
    }, {
        HTML_PARSER: {
            selectable: function (el) {
                return el.hasClass(this.getBaseCssClass('selectable'));
            }
        },
        ATTRS: {
            focusable: {
                value: false
            },

            handleGestureEvents: {
                value: false
            },

            /**
             * Whether the menu item is selectable or not.
             * Set to true for option.
             * @cfg {Boolean} selectable
             */
            /**
             * @ignore
             */
            selectable: {
                sync: 0,
                view: 1
            },

            /**
             * The value associated with the menu item.
             * @cfg {*} value
             */
            /**
             * The value associated with the menu item.
             * @property value
             * @type {*}
             */
            /**
             * @ignore
             */
            value: {},

            /**
             * Whether the menu item is checked.
             * @type {Boolean}
             * @property checked
             */

            /**
             * Whether the menu item is selected.
             * @type {Boolean}
             * @property selected
             */
            /**
             * Whether the menu item is selected.
             * @cfg {Boolean} selected
             */
            /**
             * @ignore
             */
            selected: {
                sync: 0,
                view: 1
            }
        },
        xclass: 'menuitem'
    });
});