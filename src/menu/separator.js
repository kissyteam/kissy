/**
 * menu separator def
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/separator", function(S, UIBase, Component, SeparatorRender) {

    var Separator = UIBase.create(Component.ModelControl, {
    }, {
        ATTRS:{
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