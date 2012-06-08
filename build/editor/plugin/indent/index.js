/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 8 00:39
*/
/**
 * Add indent button.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/indent/index", function (S, Editor, indexCmd) {

    return {
        init:function (editor) {
            indexCmd.init(editor);
            editor.addButton("indent",{
                tooltip:"增加缩进量 ",
                listeners:{
                    click:{
                        fn:function () {
                            editor.execCommand("indent");
                            editor.focus();
                        }
                    }
                },
                mode:Editor.WYSIWYG_MODE
            });
        }
    };

}, {
    requires:['editor', './cmd']
});
