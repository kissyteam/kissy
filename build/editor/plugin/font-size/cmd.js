/*
Copyright 2013, KISSY UI Library v1.31
MIT Licensed
build time: Aug 15 16:16
*/
/**
 * fontSize command.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/font-size/cmd", function (S, Editor, Cmd) {
    var fontSizeStyle = {
        element:'span',
        styles:{
            'font-size':'#(value)'
        },
        overrides:[
            {
                element:'font',
                attributes:{
                    'size':null
                }
            }
        ]
    };

    return {
        init:function (editor) {
            Cmd.addSelectCmd(editor, "fontSize", fontSizeStyle);
        }
    };

}, {
    requires:['editor', '../font/cmd']
});
