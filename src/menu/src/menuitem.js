/**
 * @fileOverview menu item ,child component for menu
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/menuitem", function (S, UIBase, Component, MenuItemRender) {

    var $ = S.all;

    /**
     * A menu item component which menu is consisted of.
     * @class
     * @name Item
     * @memberOf Menu
     * @extends Component.Controller
     */
    var MenuItem = UIBase.create(Component.Controller, [UIBase.ContentBox],
        /**
         * @lends Menu.Item#
         */
        {

            /**
             * Handle mouseenter event. Make parent menu to highlight itself.
             * Protected, should only be overridden by subclasses.
             * @param {Event.Object} e Mouseenter event object.
             * @protected
             * @override
             */
            handleMouseEnter:function (e) {
                // 父亲不允许自己处理
                if (MenuItem.superclass.handleMouseEnter.call(this, e)) {
                    return true;
                }
                this.get("parent").set("highlightedItem", this);
            },

            /**
             * Handle mouseleave event. Make parent menu to unhighlight itself.
             * Protected, should only be overridden by subclasses.
             * @param {Event.Object} e Mouseleave event object.
             * @protected
             * @override
             */
            handleMouseLeave:function (e) {
                // 父亲不允许自己处理
                if (MenuItem.superclass.handleMouseLeave.call(this, e)) {
                    return true;
                }
                this.get("parent").set("highlightedItem", null);
            },

            /**
             * Perform default action when click on enter on this menuitem.
             * If selectable, then make it selected.
             * If checkable, then toggle it.
             * Finally fire click on its parent menu.
             * @protected
             * @override
             */
            performActionInternal:function () {
                var self = this;
                // 可选
                if (self.get("selectable")) {
                    self.set("selected", true);
                }
                // 可选中，取消选中
                if (self.get("checkable")) {
                    self.set("checked", !self.get("checked"));
                }
                self.get("parent").fire("click", {
                    target:self
                });
                return true;
            },

            _uiSetHighlighted:function (v) {
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
                    el.scrollIntoView(p, undefined, undefined, true);
                }
            },

            /**
             * Check whether this menu item contains specified element.
             * @param {Node} element Element to be tested.
             */
            containsElement:function (element) {
                return this.get('view') && this.get('view').containsElement(element);
            }

        }, {
            ATTRS:/**
             * @lends Menu.Item#
             */
            {

                focusable:{
                    value:false
                },

                visibleMode:{
                    value:"display"
                },

                handleMouseEvents:{
                    value:false
                },

                /**
                 * Whether the menu item is selectable or not.
                 * Set to true for option.
                 * @type Boolean
                 */
                selectable:{
                    view:true
                },

                /**
                 * Whether the menu item is checkable or not.
                 * Set to true for checkbox option.
                 * @type Boolean
                 */
                checkable:{
                    view:true
                },

                /**
                 * The value associated with the menu item.
                 */
                value:{},

                /**
                 * Whether the menu item is checked.
                 * @type Boolean
                 */
                checked:{
                    view:true
                },

                /**
                 * Whether the menu item is selected.
                 * @type Boolean
                 */
                selected:{
                    view:true
                }
            },

            HTML_PARSER:{
                selectable:function (el) {
                    var cls = this.getCssClassWithPrefix("menuitem-selectable");
                    return el.hasClass(cls);
                }
            }
        }, "Menu_Item");

    MenuItem.DefaultRender = MenuItemRender;

    Component.UIStore.setUIConstructorByCssClass("menuitem", {
        priority:Component.UIStore.PRIORITY.LEVEL1,
        ui:MenuItem
    });

    return MenuItem;
}, {
    requires:['uibase', 'component', './menuitemrender']
});