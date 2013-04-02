/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 2 19:14
*/
/**
 * removeFormat for selection.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/remove-format/index", function (S, Editor, formatCmd) {

    function removeFormat() {
    }

    S.augment(removeFormat, {
        pluginRenderUI:function (editor) {
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
