/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 30 21:24
*/
KISSY.add("editor/plugin/italic/index", function (S, Editor, ui,cmd) {
    return {
        init:function (editor) {
            cmd.init(editor);
            editor.addButton({
                cmdType:'italic',
                contentCls:"ks-editor-toolbar-italic",
                title:"斜体 "
            }, undefined, ui.Button);
        }
    };
}, {
    requires:['editor', '../font/ui','./cmd']
});
