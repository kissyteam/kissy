/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jun 5 22:33
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
                'class="'+editor.prefixCls+'editor-toolbar-separator">&nbsp;' +
                '</span>')
                .appendTo(editor.get("toolBarEl"));
        }
    });

    return Separator;
}, {
    requires:['editor']
});

