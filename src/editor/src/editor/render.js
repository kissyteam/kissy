/**
 * render for editor
 * @author yiminghe@gmail.com
 */
KISSY.add('editor/render',function(S,Controller,RenderTpl){

    return Controller.ATTRS.xrender.value.extend({

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

},{
    requires:['component/controller','./render-tpl']
});