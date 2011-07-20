/**
 * menu separator def
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/separator", function(S, UIBase, Component, SeparatorRender) {

    return UIBase.create(Component.ModelControl, {
    }, {
        ATTRS:{
            handleMouseEvents:{
                value:false
            }
        },
        DefaultRender:SeparatorRender
    });

}, {
    requires:['uibase','component','./separatorrender']
});