/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 7 15:13
*/
KISSY.add("editor/plugin/italic/index", function (S, Editor, ui,cmd) {
    return {
        init:function (editor) {
            cmd.init(editor);
            editor.addButton("italic",{
                cmdType:'italic',
                tooltip:"斜体 "
            }, undefined, ui.Button);
        }
    };
}, {
    requires:['editor', '../font/ui','./cmd']
});
