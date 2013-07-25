/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 25 22:20
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/justify-right/cmd
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
    requires:['../justify-cmd']
});

