/**
 * @fileOverview menu separator def
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/separator", function (S, Component, SeparatorRender) {

    var Separator = Component.Controller.extend({
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
    }, {
        xclass:'menuseparator',
        priority:20
    });

    return Separator;

}, {
    requires:['component', './separatorRender']
});