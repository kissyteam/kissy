/**
 * menu separator def
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/separator", function(S, UIBase, Component, SeparatorRender) {

    return UIBase.create(Component.ModelControl, {
    }, {
        ATTRS:{
            focusable:{
                value:false
            },
            handleMouseEvents:{
                value:false
            },
            // 分隔线禁用，不可以被键盘访问
            disabled:{
                value:true
            }
        },

        DefaultRender:SeparatorRender
    });

}, {
    requires:['uibase','component','./separatorrender']
});