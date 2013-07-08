﻿/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 3 13:50
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/bold/cmd
*/

/**
 * bold command.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/bold/cmd", function (S, Editor, Cmd) {
    var BOLD_STYLE = new Editor.Style({
        element:'strong',
        overrides:[
            {
                element:'b'
            },
            {
                element:'span',
                attributes:{
                    style:'font-weight: bold;'
                }
            }
        ]
    });
    return {
        init:function (editor) {
            Cmd.addButtonCmd(editor, "bold", BOLD_STYLE);
        }
    }
}, {
    requires:['editor', '../font/cmd']
});

