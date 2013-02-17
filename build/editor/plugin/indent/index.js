/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Feb 17 17:29
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
