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
            renderData.elAttrs.role = 'menuitem';
        },

        // do not set highlighted on mousedown for touch device!
        // only set active in component/control

        /**
         * Perform default action when click on enter on this menuitem.
         * @protected
         */
        handleClickInternal: function (ev) {
            var self = this;
            self.callSuper(ev);
            // combobox menu tap penetration
            // https://github.com/kissyteam/kissy/issues/533
            ev.preventDefault();
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

        /**
         * Check whether this menu item contains specified element.
         * @param {KISSY.Node} element Element to be tested.
         * @protected
         */
        containsElement: function (element) {
            var $el = this.$el;
            return $el && ($el[0] === element || $el.contains(element));
        }
    }, {
        ATTRS: {
            focusable: {
                value: false
            },

            handleGestureEvents: {
                value: false
            }
        },
        xclass: 'menuitem'
    });
});