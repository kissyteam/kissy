/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 28 20:23
*/
/**
 * fontFamily command.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/fontFamily/cmd", function (S, Editor, Cmd) {
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
