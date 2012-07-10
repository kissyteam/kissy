/*
Copyright 2012, KISSY UI Library v1.30rc
MIT Licensed
build time: Jul 10 10:47
*/
/**
 * strikeThrough button
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/strikeThrough/index", function (S, Editor, ui, cmd) {

    function StrikeThrough() {
    }

    S.augment(StrikeThrough, {
        renderUI:function (editor) {
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
