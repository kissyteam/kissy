/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 31 22:01
*/
KISSY.add("editor/plugin/bold/index", function (S, Editor, ui,cmd) {
    return {
        init:function (editor) {
            cmd.init(editor);
            editor.addButton({
                cmdType:'bold',
                contentCls:"ks-editor-toolbar-bold",
                title:"粗体 "
            }, undefined, ui.Button);
        }
    };
}, {
    requires:['editor', '../font/ui','./cmd']
});
