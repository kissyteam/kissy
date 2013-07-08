﻿/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 3 13:52
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/fore-color/cmd
*/

/**
 * foreColor command.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/fore-color/cmd", function (S, cmd) {

    var COLOR_STYLES = {
        element:'span',
        styles:{ 'color':'#(color)' },
        overrides:[
            { element:'font', attributes:{ 'color':null } }
        ],
        childRule:function (el) {
            // <span style='color:red'><a href='g.cn'>abcdefg</a></span>
            // 不起作用
            return !(el.nodeName() == "a" || el.all("a").length);
        }
    };

    return {
        init:function (editor) {
            if (!editor.hasCommand("foreColor")) {
                editor.addCommand("foreColor", {
                    exec:function (editor, c) {
                        editor.execCommand("save");
                        cmd.applyColor(editor, c, COLOR_STYLES);
                        editor.execCommand("save");
                    }
                });
            }
        }
    };

}, {
    requires:['../color/cmd']
});

