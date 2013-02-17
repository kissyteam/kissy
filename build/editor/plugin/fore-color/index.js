/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Feb 17 17:29
*/
/**
 * foreColor button.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/fore-color/index", function (S, Editor, Button, cmd) {

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
    requires: ['editor', '../color/btn', './cmd']
});
