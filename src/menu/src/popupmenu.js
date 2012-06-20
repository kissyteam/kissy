/**
 * @fileOverview positionable and not focusable menu
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/popupmenu", function (S, Component, Menu, PopupMenuRender) {

    var autoHideOnMouseLeave = "autoHideOnMouseLeave";

    var UIBase = Component.UIBase;


    /**
     * @name PopupMenu
     * @memberOf Menu
     * @class
     * Popup Menu.
     * xclass: 'popupmenu'.
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
            }
        }, {
            ATTRS:/**
             * @lends Menu.PopupMenu#
             */
            {
                // 弹出菜单一般不可聚焦，焦点在使它弹出的元素上
                /**
                 * Whether the popup menu is focusable.
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