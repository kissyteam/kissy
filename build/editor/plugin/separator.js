/*
Copyright 2013, KISSY v1.40dev
MIT Licensed
build time: Sep 16 15:14
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/separator
*/

/**
 * @ignore
 * separator for button
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/separator", function (S) {
    function Separator() {
    }

    S.augment(Separator, {
        pluginRenderUI:function (editor) {
            S.all('<span ' +
                'class="'+editor.get('prefixCls')+'editor-toolbar-separator">&nbsp;' +
                '</span>')
                .appendTo(editor.get("toolBarEl"));
        }
    });

    return Separator;
}, {
    requires:['editor']
});

