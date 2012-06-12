/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 13 00:29
*/
/**
 * backColor button.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/backColor/index", function (S, Editor, Button, cmd) {

    return {
        init:function (editor) {
            cmd.init(editor);
            editor.addButton("backColor",{
                cmdType:'backColor',
                tooltip:"背景颜色"
            }, Button);
        }
    };
}, {
    requires:['editor', '../color/btn', './cmd']
});
