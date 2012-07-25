/*
Copyright 2012, KISSY UI Library v1.30rc
MIT Licensed
build time: Jul 26 02:09
*/
/**
 * Add justifyCenter command identifier for Editor.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/justifyRight/cmd", function (S, justifyUtils) {

    return {
        init:function (editor) {
            justifyUtils.addCommand(editor, "justifyRight", "right");
        }
    };

}, {
    requires:['../justifyUtils/cmd']
});
