/*
Copyright 2013, KISSY UI Library v1.32
MIT Licensed
build time: Sep 4 17:12
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
