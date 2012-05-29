/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 29 14:44
*/
KISSY.add("editor/plugin/italic/index", function (S, Editor, ui,cmd) {
    return {
        init:function (editor) {
            cmd.init(editor);
            editor.addButton({
                cmdType:'italic',
                contentCls:"ke-toolbar-italic",
                title:"斜体 "
            }, undefined, ui.Button);
        }
    };
}, {
    requires:['editor', '../font/ui','./cmd']
});
