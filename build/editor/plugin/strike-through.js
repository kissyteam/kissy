/*
Copyright 2013, KISSY v1.40dev
MIT Licensed
build time: Sep 11 14:21
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/strike-through
*/

/**
 * @ignore
 * strikeThrough button
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/strike-through", function (S, Editor, ui, cmd) {
    function StrikeThrough() {
    }

    S.augment(StrikeThrough, {
        pluginRenderUI:function (editor) {
            cmd.init(editor);
            editor.addButton("strikeThrough", {
                cmdType:"strikeThrough",
                tooltip:"删除线 "
            }, ui.Button);
        }
    });

    return StrikeThrough;
}, {
    requires:['editor', './font/ui', './strike-through/cmd']
});

