/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Mar 11 10:34
*/
/**
 * strikeThrough button
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/strike-through/index", function (S, Editor, ui, cmd) {

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
    requires:['editor', '../font/ui', './cmd']
});
