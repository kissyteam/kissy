/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 10 21:07
*/
/**
 * removeFormat for selection.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/removeFormat/index", function (S, Editor, formatCmd) {
    return {
        init:function (editor) {
            formatCmd.init(editor);
            editor.addButton("removeFormat", {
                tooltip:"清除格式",
                listeners:{
                    click:{
                        fn:function () {
                            editor.execCommand("removeFormat");
                        }
                    }
                },
                mode:Editor.WYSIWYG_MODE
            });
        }
    };
}, {
    requires:['editor', './cmd', '../button/']
});
