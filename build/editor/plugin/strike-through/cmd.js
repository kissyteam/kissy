﻿/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 3 13:54
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/strike-through/cmd
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

