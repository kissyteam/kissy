/**
 * @ignore
 * positionable and not focusable menu
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/popupmenu", function (S,
                                      extension,
                                      Menu, PopupMenuRender) {

    /**
     * Popup Menu.
     * xclass: 'popupmenu'.
     * @class KISSY.Menu.PopupMenu
     * @extends KISSY.Menu
     * @mixins KISSY.Component.Extension.Position
     * @mixins KISSY.Component.Extension.Align
     */
    var PopupMenu = Menu.extend([
        extension.ContentBox,
        extension.Position,
        extension.Align
    ],
        {
            /**
             * Suppose it has focus (as a context menu), then it must hide when lose focus.
             * Protected, should only be overridden by subclasses.
             * @protected
             */
            handleBlur:function () {
                var self = this;
                PopupMenu.superclass.handleBlur.apply(self, arguments);
                self.hide();
            }
        }, {
            ATTRS: {
                // 弹出菜单一般不可聚焦，焦点在使它弹出的元素上
                /**
                 * Whether the popup menu is focusable.
                 * Defaults to: false.
                 * @type {Boolean}
                 * @ignore
                 */
                focusable:{
                    value:false
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
    requires:['component/extension',
        './base', './popupmenu-render']
});