/**
 * @ignore
 * menu item ,child component for menu
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/menuitem", function (S, Component, MenuItemRender) {

    var $ = S.all;

    /**
     * @class KISSY.Menu.Item
     * A menu item component which menu is consisted of.
     * xclass: 'menuitem'.
     * @extends KISSY.Component.Controller
     */
    var MenuItem = Component.Controller.extend({

            /**
             * Handle mouseenter event. Make parent menu to highlight itself.
             * Protected, should only be overridden by subclasses.
             * @param {KISSY.Event.DOMEventObject} e Mouseenter event object.
             * @protected
             */
            handleMouseEnter: function (e) {
                // 父亲不允许自己处理
                if (MenuItem.superclass.handleMouseEnter.call(this, e)) {
                    return true;
                }
                this.get("parent").set("highlightedItem", this);
            },

            /**
             * Handle mouseleave event. Make parent menu to unhighlight itself.
             * Protected, should only be overridden by subclasses.
             * @param {KISSY.Event.DOMEventObject} e Mouseleave event object.
             * @protected
             *
             */
            handleMouseLeave: function (e) {
                // 父亲不允许自己处理
                if (MenuItem.superclass.handleMouseLeave.call(this, e)) {
                    return true;
                }
                this.get("parent").set("highlightedItem", null);
            },

            // for ios, ios only has touchdown
            handleMouseDown: function (e) {
                // 父亲不允许自己处理
                if (MenuItem.superclass.handleMouseDown.call(this, e)) {
                    return true;
                }
                this.get("parent").set("highlightedItem", this);
            },

            /**
             * Perform default action when click on enter on this menuitem.
             * If selectable, then make it selected.
             * If checkable, then toggle it.
             * Finally fire click on its parent menu.
             * @protected
             */
            performActionInternal: function () {
                var self = this;
                // 可选
                if (self.get("selectable")) {
                    self.set("selected", true);
                }
                // 可选中，取消选中
                if (self.get("checkable")) {
                    self.set("checked", !self.get("checked"));
                }
                self.fire("click");
                return true;
            },

            _onSetHighlighted: function (v) {
                // 是否要滚动到当前菜单项(横向，纵向)
                if (v) {
                    var el = this.get("el"),
                    // 找到向上路径上第一个可以滚动的容器，直到父组件节点（包括）
                    // 找不到就放弃，为效率考虑不考虑 parent 的嵌套可滚动 div
                        p = el.parent(function (e) {
                            return $(e).css("overflow") != "visible";
                        }, this.get("parent").get("el").parent());
                    if (!p) {
                        return;
                    }
                    el.scrollIntoView(p,{
                        alignWithTop:true,
                        allowHorizontalScroll:true,
                        onlyScrollIfNeeded:true
                    });
                }
            },

            /**
             * Check whether this menu item contains specified element.
             * @param {KISSY.NodeList} element Element to be tested.
             * @protected
             */
            containsElement: function (element) {
                return this.get('view') && this.get('view').containsElement(element);
            }

        }, {
            ATTRS: {

                focusable: {
                    value: false
                },

                handleMouseEvents: {
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
                    view: 1
                },

                /**
                 * Whether the menu item is checkable or not.
                 * Set to true for checkbox option.
                 * @cfg {Boolean} checkable
                 */
                /**
                 * @ignore
                 */
                checkable: {
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
                 * Whether the menu item is checked.
                 * @cfg {Boolean} checked
                 */
                /**
                 * @ignore
                 */
                checked: {
                    view: 1
                },

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
                    view: 1
                },

                xrender: {
                    value: MenuItemRender
                }
            }
        }, {
            xclass: "menuitem",
            priority: 10
        });

    return MenuItem;
}, {
    requires: ['component/base', './menuitem-render']
});