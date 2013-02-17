/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Feb 17 17:29
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
