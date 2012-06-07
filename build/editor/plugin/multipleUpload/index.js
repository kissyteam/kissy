/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 8 00:39
*/
/**
 * multipleUpload button
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/multipleUpload/index", function (S, Editor, DialogLoader) {

    return {
        init:function (editor) {
            editor.addButton("multipleUpload", {
                tooltip:"批量插图",
                listeners:{
                    click:{
                        fn:function () {
                            DialogLoader.useDialog(editor, "multipleUpload/dialog");
                        }
                    }
                },
                mode:Editor.WYSIWYG_MODE
            });
        }
    };

}, {
    requires:['editor', '../dialogLoader/']
});
