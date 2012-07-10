/*
Copyright 2012, KISSY UI Library v1.30rc
MIT Licensed
build time: Jul 10 11:05
*/
/**
 * fontSize command.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/fontSize/cmd", function (S, Editor, Cmd) {
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
