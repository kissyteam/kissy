/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 30 21:24
*/
KISSY.add("editor/plugin/strikeThrough/index", function (S, Editor, ui,cmd) {
    return {
        init:function (editor) {
            cmd.init(editor);
            editor.addButton({
                cmdType:"strikeThrough",
                contentCls:"ks-editor-toolbar-strikeThrough",
                title:"删除线 "
            }, undefined, ui.Button);
        }
    };
}, {
    requires:['editor', '../font/ui','./cmd']
});
