/*
Copyright 2012, KISSY UI Library v1.30rc
MIT Licensed
build time: Aug 22 23:28
*/
/**
 * Add justifyCenter command identifier for Editor.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/justify-right/cmd", function (S, justifyUtils) {

    return {
        init:function (editor) {
            justifyUtils.addCommand(editor, "justifyRight", "right");
        }
    };

}, {
    requires:['../justify-utils/cmd']
});
