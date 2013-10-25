/*
Copyright 2013, KISSY v1.40dev
MIT Licensed
build time: Oct 25 16:43
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/fore-color
*/

/**
 * @ignore
 * foreColor button.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/fore-color", function (S, Editor, Button, cmd) {
    function ForeColorPlugin(config) {
        this.config = config || {};
    }

    S.augment(ForeColorPlugin, {
        pluginRenderUI: function (editor) {
            cmd.init(editor);
            Button.init(editor, {
                cmdType: 'foreColor',
                defaultColor: 'rgb(204, 0, 0)',
                tooltip: "文本颜色"
            });
        }
    });

    return ForeColorPlugin;
}, {
    requires: ['editor', './color/btn', './fore-color/cmd']
});

