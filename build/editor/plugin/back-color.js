﻿/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 3 13:50
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/back-color
*/

/**
 * backColor button.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/back-color", function (S, Editor, Button, cmd) {

    function backColor(config) {
        this.config = config || {};
    }

    S.augment(backColor, {
        pluginRenderUI: function (editor) {
            cmd.init(editor);
            Button.init(editor, {
                defaultColor: 'rgb(255, 217, 102)',
                cmdType: "backColor",
                tooltip: "背景颜色"
            });
        }
    });

    return backColor;

}, {
    requires: ['editor', './color/btn', './back-color/cmd']
});

