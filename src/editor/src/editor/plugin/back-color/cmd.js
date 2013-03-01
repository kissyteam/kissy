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
        childRule:function (currentNode) {
            // 除了嵌套背景，其他强制最里面
            // <span style='bgcolor:red'><span style='fontSize:100px'>123434</span></span>
            return !!currentNode.style('background-color');

            // 不完美
            // 1. 123456 背景变黄
            // 2. 345 字体变大
            // or
            // current 有 font-size 的孙子
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