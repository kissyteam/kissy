﻿/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 3 13:52
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/font-family/cmd
*/

/**
 * fontFamily command.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/font-family/cmd", function (S, Editor, Cmd) {
    var fontFamilyStyle = {
        element:'span',
        styles:{
            'font-family':'#(value)'
        },
        overrides:[
            {
                element:'font',
                attributes:{
                    'face':null
                }
            }
        ]
    };

    return {
        init:function (editor) {
            Cmd.addSelectCmd(editor, "fontFamily", fontFamilyStyle);
        }
    };

}, {
    requires:['editor', '../font/cmd']
});

