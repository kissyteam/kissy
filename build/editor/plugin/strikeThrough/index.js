/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 7 00:48
*/
KISSY.add("editor/plugin/strikeThrough/index", function (S, Editor, ui,cmd) {
    return {
        init:function (editor) {
            cmd.init(editor);
            editor.addButton("strikeThrough",{
                cmdType:"strikeThrough",
                tooltip:"删除线 "
            }, undefined, ui.Button);
        }
    };
}, {
    requires:['editor', '../font/ui','./cmd']
});
