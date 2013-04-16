/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:18
*/
/**
 * italic command.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/italic/cmd", function (S, Editor, Cmd) {

    var ITALIC_STYLE = new Editor.Style({
        element:'em',
        overrides:[
            {
                element:'i'
            },
            {
                element:'span',
                attributes:{
                    style:'font-style: italic;'
                }
            }
        ]
    });
    return {
        init:function (editor) {
            Cmd.addButtonCmd(editor, "italic", ITALIC_STYLE);
        }
    }
}, {
    requires:['editor', '../font/cmd']
});
