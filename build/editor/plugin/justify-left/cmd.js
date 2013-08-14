/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Aug 14 23:56
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/justify-left/cmd
*/

/**
 * Add justifyCenter command identifier for Editor.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/justify-left/cmd", function (S, justifyUtils) {

    return {
        init:function (editor) {
            justifyUtils.addCommand(editor, "justifyLeft", "left");
        }
    };

}, {
    requires:['../justify-cmd']
});

