/*
Copyright 2013, KISSY v1.40dev
MIT Licensed
build time: Sep 17 23:03
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/justify-left/cmd
*/

/**
 * @ignore
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

