/*
Copyright 2013, KISSY UI Library v1.31
MIT Licensed
build time: Aug 15 16:16
*/
/**
 * Add indent button.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/indent/index", function (S, Editor, indexCmd) {

    function Indent() {

    }

    S.augment(Indent, {
        pluginRenderUI:function (editor) {
            indexCmd.init(editor);
            editor.addButton("indent", {
                tooltip:"增加缩进量 ",
                listeners:{
                    click:function () {
                        editor.execCommand("indent");
                        editor.focus();
                    }
                },
                mode:Editor.WYSIWYG_MODE
            });
        }
    });

    return Indent;

}, {
    requires:['editor', './cmd']
});
