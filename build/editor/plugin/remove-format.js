/*
Copyright 2013, KISSY v1.40dev
MIT Licensed
build time: Aug 27 21:57
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/remove-format
*/

/**
 * removeFormat for selection.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/remove-format", function (S, Editor, formatCmd) {
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
                mode:Editor.Mode.WYSIWYG_MODE
            });
        }
    });

    return removeFormat;
}, {
    requires:['editor', './remove-format/cmd', './button']
});

