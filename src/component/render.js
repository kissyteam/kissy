/**
 * render base class for kissy
 * @author:yiminghe@gmail.com
 */
KISSY.add("component/render", function(S, UIBase) {
    return UIBase.create([], {

    }, {
        ATTRS:{
            //是否禁用
            disabled:{}
        }
    });
}, {
    requires:['uibase']
});