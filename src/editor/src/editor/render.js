/**
 * @ignore
 * render for editor
 * @author yiminghe@gmail.com
 */
KISSY.add(function(S,require){
    var Control=require('component/control');
    var RenderTpl=require('./render-xtpl');
    return Control.getDefaultRender().extend({
        beforeCreateDom:function(renderData,childrenElSelectors){
            S.mix(renderData,{
                mobile: S.UA.mobile
            });

            S.mix(childrenElSelectors,{
                textarea:'#ks-editor-textarea-{id}',
                toolBarEl:'#ks-editor-tools-{id}',
                statusBarEl:'#ks-editor-status-{id}'
            });
        }
    },{
        ATTRS:{
            contentTpl:{
                value:RenderTpl
            }
        }
    });
});