/**
 * @fileOverview menu separator def
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/separator", function(S, UIBase, Component, SeparatorRender) {

    var Separator = UIBase.create(Component.Controller, {
    }, {
        ATTRS:{
            focusable:{
                value:false
            },
            // 分隔线禁用，不可以被键盘访问
            disabled:{
                value:true
            },
            handleMouseEvents:{
                value:false
            }
        },
        DefaultRender:SeparatorRender
    });

    Component.UIStore.setUIByClass("menuseparator", {
        priority:Component.UIStore.PRIORITY.LEVEL2,
        ui:Separator
    });

    return Separator;

}, {
    requires:['uibase','component','./separatorrender']
});