/**
 * @fileOverview positionable and not focusable menu
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/popupmenu", function (S, Component, Menu, PopupMenuRender) {

    var autoHideOnMouseLeave = "autoHideOnMouseLeave";

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

            /**
             * Handle mouseleave event.Make parent subMenu item unHighlighted.
             * Protected, should only be overridden by subclasses.
             * @protected
             * @override
             */
            handleMouseLeave:function () {
                var self = this;
                if (!self.get(autoHideOnMouseLeave)) {
                    return;
                }
                // 通知 submenu item buffer 层层检查，是否隐藏掉改子菜单以及子菜单的祖先菜单
                self.get("parent").hideParentMenusBuffer();
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
                // 防止从子菜单项移到子菜单，停止子菜单项将要隐藏子菜单的任务
                self.get("parent").clearSubMenuTimers();
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
                 * Only valid for submenu.
                 * Default : false.
                 * @type Boolean
                 */
                autoHideOnMouseLeave:{},
                /**
                 * After how much time the popup menu hides when mouseleave.
                 * Unit : second.
                 * Default : .1
                 * @type Number
                 */
                autoHideDelay:{
                    value:.1
                },
                xrender:{
                    value:PopupMenuRender
                }
            }
        }, {
            xclass:'popupmenu',
            priority:20
        });

    return PopupMenu;

}, {
    requires:['component', './base', './popupmenuRender']
});