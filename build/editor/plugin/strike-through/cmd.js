/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Feb 17 17:29
*/
/**
 * strike-through command
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/strike-through/cmd", function (S, Editor, Cmd) {

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
