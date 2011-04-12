/**
 * render base class for kissy
 * @author:yiminghe@gmail.com
 */
KISSY.add("component/render", function(S, UIBase) {
    return UIBase.create([UIBase.Box.Render], {

    }, {
        ATTRS:{
            //从 maskup 中渲染
            srcNode:{},
            prefixCls:{
                value:""
            },
            //是否禁用
            disabled:{
                value:false
            }
        }
    });
}, {
    requires:['uibase']
});