/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Feb 17 17:29
*/
/**
 * backColor command.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/back-color/cmd", function (S, cmd) {

    var BACK_COLOR_STYLE = {
        element:'span',
        styles:{ 'background-color':'#(color)' },
        overrides:[
            { element:'*', styles:{ 'background-color':null } }
        ],
        childRule:function () {
            // 强制最里面
            // <span style='bgcolor:red'><span style='fontSize:100px'>123434</span></span>
            return false;
        }
    };

    return {
        init:function (editor) {
            if (!editor.hasCommand("backColor")) {
                editor.addCommand("backColor", {
                    exec:function (editor, c) {
                        editor.execCommand("save");
                        cmd.applyColor(editor, c, BACK_COLOR_STYLE);
                        editor.execCommand("save");
                    }
                });
            }
        }
    };

}, {
    requires:['../color/cmd']
});
