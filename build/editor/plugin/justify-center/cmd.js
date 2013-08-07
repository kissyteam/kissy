/*
Copyright 2013, KISSY UI Library v1.31
MIT Licensed
build time: Aug 7 14:34
*/
/**
 * Add justifyCenter command identifier for Editor.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/justify-center/cmd", function (S, justifyUtils) {

    return {
        init:function (editor) {
            justifyUtils.addCommand(editor, "justifyCenter", "center");
        }
    };

}, {
    requires:['../justify-utils/cmd']
});
