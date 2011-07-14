/**
 * positionable and not focusable menu
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/popupmenu", function(S, UIBase, Component, Menu, PopupMenuRender) {
    return UIBase.create(Menu, [
        UIBase.Position,
        UIBase.Align
    ], {
    }, {
        ATTRS:{
            // 弹出菜单一般不可聚焦，焦点在使它弹出的元素上
            focusable:{
                value:false
            },

            visibleMode:{
                value:"visibility"
            }
        },
        DefaultRender:PopupMenuRender
    });
}, {
    requires:['uibase','component','./menu','./popupmenurender']
});