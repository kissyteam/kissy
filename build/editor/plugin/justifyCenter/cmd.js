/*
Copyright 2012, KISSY UI Library v1.30rc
MIT Licensed
build time: Jul 10 10:47
*/
/**
 * Add justifyCenter command identifier for Editor.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/justifyCenter/cmd", function (S, justifyUtils) {

    return {
        init:function (editor) {
            justifyUtils.addCommand(editor, "justifyCenter", "center");
        }
    };

}, {
    requires:['../justifyUtils/cmd']
});
