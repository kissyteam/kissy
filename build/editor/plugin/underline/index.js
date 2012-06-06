/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 5 21:37
*/
KISSY.add("editor/plugin/underline/index", function (S, Editor, ui, cmd) {
    return {
        init:function (editor) {
            cmd.init(editor);
            editor.addButton({
                cmdType:"underline",
                contentCls:"ks-editor-toolbar-underline",
                title:"下划线 "
            }, undefined, ui.Button);
        }
    };
}, {
    requires:['editor', '../font/ui', './cmd']
});
