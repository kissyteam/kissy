/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 4 20:40
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
