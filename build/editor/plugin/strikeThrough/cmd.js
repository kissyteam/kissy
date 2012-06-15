/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 15 12:07
*/
/**
 * strikeThrough command
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/strikeThrough/cmd", function (S, Editor, Cmd) {

    var STRIKE_STYLE = new Editor.Style({
        element:'del',
        overrides:[
            {
                element:'span',
                attributes:{
                    style:'text-decoration: line-through;'
                }
            },
            {
                element:'s'
            },
            {
                element:'strike'
            }
        ]
    });
    return {
        init:function (editor) {
            Cmd.addButtonCmd(editor, "strikeThrough", STRIKE_STYLE);
        }
    }
}, {
    requires:['editor', '../font/cmd']
});
