/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 29 14:44
*/
KISSY.add("editor/plugin/foreColor/index", function (S, Editor, Button, cmd) {

    return {
        init:function (editor) {
            cmd.init(editor);
            editor.addButton({
                cmdType:'foreColor',
                title:"文本颜色",
                contentCls:"ke-toolbar-fore-color"
            }, undefined, Button);
        }
    };
}, {
    requires:['editor', '../color/btn', './cmd']
});
