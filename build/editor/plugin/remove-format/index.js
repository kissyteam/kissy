/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Nov 28 00:46
*/
/**
 * removeFormat for selection.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/remove-format/index", function (S, Editor, formatCmd) {

    function removeFormat() {
    }

    S.augment(removeFormat, {
        renderUI:function (editor) {
            formatCmd.init(editor);
            editor.addButton("removeFormat", {
                tooltip:"清除格式",
                listeners:{
                    click:function () {
                        editor.execCommand("removeFormat");
                    }
                },
                mode:Editor.WYSIWYG_MODE
            });
        }
    });

    return removeFormat;
}, {
    requires:['editor', './cmd', '../button/']
});
