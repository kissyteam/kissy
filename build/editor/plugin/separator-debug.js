/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 15 17:50
*/
/*
combined files : 

editor/plugin/separator

*/
/**
 * @ignore
 * separator for button
 * @author yiminghe@gmail.com
 */
KISSY.add('editor/plugin/separator',function (S) {
    function Separator() {
    }

    S.augment(Separator, {
        pluginRenderUI:function (editor) {
            S.all('<span ' +
                'class="'+editor.get('prefixCls')+'editor-toolbar-separator">&nbsp;' +
                '</span>')
                .appendTo(editor.get('toolBarEl'));
        }
    });

    return Separator;
});
