/*
Copyright 2013, KISSY v1.40dev
MIT Licensed
build time: Aug 27 21:57
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/separator
*/

/**
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

