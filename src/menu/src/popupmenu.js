/**
 * @fileOverview positionable and not focusable menu
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/popupmenu", function (S,
                                      extension,
                                      Menu, PopupMenuRender) {

    var autoHideOnMouseLeave = "autoHideOnMouseLeave";


    /**
     * @name PopupMenu
     * @memberOf Menu
     * @class
     * Popup Menu.
     * xclass: 'popupmenu'.
     * @extends Menu
     * @extends KISSY.Component.UIBase.Position
     * @extends KISSY.Component.UIBase.Align
     */
    var PopupMenu = Menu.extend([
        extension.ContentBox,
        extension.Position,
        extension.Align
    ],
        /**
         * @lends Menu.PopupMenu#
         */
        {
            /**
             * Handle mouseleave event.Make parent subMenu item unHighlighted.
             * Protected, should only be overridden by subclasses.
             * @protected
             *
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
             * Suppose it has focus (as a context menu), then it must hide when lose focus.
             * Protected, should only be overridden by subclasses.
             * @protected
             *
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
                 * Whether the popup menu is focusable.
                 * @default false.
                 * @type {Boolean}
                 */
                focusable:{
                    value:false
                },
                /**
                 * Whether the popup menu hides when mouseleave.
                 * Only valid for submenu.
                 * @default false.
                 * @type {Boolean}
                 */
                autoHideOnMouseLeave:{},
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
    requires:['component/extension',
        './base', './popupmenuRender']
});