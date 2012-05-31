/**
 * @fileOverview positionable and not focusable menu
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/popupmenu", function (S, Component, Menu, PopupMenuRender) {

    function getParentMenu(self) {
        var subMenuItem = self.get("parent"),
            parentMenu;
        if (subMenuItem && subMenuItem.get("menu") == self) {
            parentMenu = subMenuItem.get("parent");
        }
        return parentMenu;
    }

    function getAutoHideParentMenu(self) {
        var parentMenu = getParentMenu(self);
        if (parentMenu && parentMenu.get(autoHideOnMouseLeave)) {
            return parentMenu;
        }
        return 0;
    }

    var autoHideOnMouseLeave = "autoHideOnMouseLeave";

    function clearOwn(self) {
        var l;
        if (l = self._leaveHideTimer) {
            clearTimeout(l);
            self._leaveHideTimer = 0;
        }
    }


    var UIBase = Component.UIBase;

    /**
     * Popup Menu
     * @name PopupMenu
     * @memberOf Menu
     * @constructor
     * @extends Menu
     * @extends Component.UIBase.Position
     * @extends Component.UIBase.Align
     */
    var PopupMenu = Menu.extend([
        UIBase.ContentBox,
        UIBase.Position,
        UIBase.Align
    ],
        /**
         * @lends Menu.PopupMenu#
         */
        {
            _clearLeaveHideTimers:function () {
                var self = this, i, item, menu;
                if (!self.get(autoHideOnMouseLeave)) {
                    return;
                }
                // 清除自身
                clearOwn(self);
                var cs = self.get("children");
                for (i = 0; i < cs.length; i++) {
                    item = cs[i];
                    // 递归清除子菜单
                    if ((menu = item.get("menu")) &&
                        // 不是懒加载函数
                        !S.isFunction(menu) &&
                        menu.get(autoHideOnMouseLeave)) {
                        menu._clearLeaveHideTimers();
                    }
                }
            },

            /**
             * Handle mouseleave event.Make parent subMenu item unHighlighted.
             * Protected, should only be overridden by subclasses.
             * @protected
             * @override
             */
            handleMouseLeave:function () {
                var self = this,
                    parent;
                if (!self.get(autoHideOnMouseLeave)) {
                    return;
                }
                self._leaveHideTimer = setTimeout(function () {
                    self.hide();
                    var subMenuItem = self.get("parent"), m;
                    if (subMenuItem) {
                        m = getParentMenu(self);
                        // 过段时间仍然是父亲 submenu 仍然是他的兄弟中高亮，证明已经离开
                        // 否则
                        // 1.鼠标移到 submenu 的话，submenu mouseenter clearTimers,
                        //   这个 timer 执行不了！
                        //
                        // 2.鼠标移到了 submenu 并列的其他 menuitem，
                        //   导致其他 menuitem highlighted
                        //   那么 当前所属 submenu unhighlighted
                        //   执行 clearTimers ，这个 timer 仍然不执行

                        // 那么只剩下一种情况，移除了整个嵌套的 menu，
                        // 那么执行该 timer
                        // menu hide 并且将其所属的 submenu 高亮去掉！
                        if (m && m.get("highlightedItem") === subMenuItem) {
                            m.set("highlightedItem", null);
                        }
                    }
                }, self.get("autoHideDelay"));
                parent = getAutoHideParentMenu(self);
                if (parent) {
                    parent.handleMouseLeave();
                }
            },

            /**
             * Handle mouseenter event.Make parent subMenu item highlighted.
             * Protected, should only be overridden by subclasses.
             * @protected
             * @override
             */
            handleMouseEnter:function () {
                var self = this;
                if (!self.get(autoHideOnMouseLeave)) {
                    return;
                }
                var parent = getAutoHideParentMenu(self);
                if (parent) {
                    parent.handleMouseEnter();
                }
                self._clearLeaveHideTimers();
            },


            /**
             * Suppose it has focus (as a context menu), then it must hide when lose focus.
             * Protected, should only be overridden by subclasses.
             * @protected
             * @override
             */
            handleBlur:function () {
                var self = this;
                PopupMenu.superclass.handleBlur.apply(self, arguments);
                self.hide();
            }
        }, {
            ATTRS:/**
             * @lends Menu.PopupMenu#
             */
            {
                // 弹出菜单一般不可聚焦，焦点在使它弹出的元素上
                /**
                 * Whether the popup menu is focuable.
                 * Default : false.
                 * @type Boolean
                 */
                focusable:{
                    value:false
                },
                visibleMode:{
                    value:"visibility"
                },
                /**
                 * Whether the popup menu hides when mouseleave.
                 * Default : false.
                 * @type Boolean
                 */
                autoHideOnMouseLeave:{},
                /**
                 * After how much time the popup menu hides when mouseleave.
                 * Unit : second.
                 * Default : 0.1.
                 * @type Number
                 */
                autoHideDelay:{
                    value:0.1
                }
            },
            DefaultRender:PopupMenuRender
        }, {
            xclass:'popupmenu',
            priority:20
        });

    return PopupMenu;

}, {
    requires:['component', './base', './popupmenuRender']
});