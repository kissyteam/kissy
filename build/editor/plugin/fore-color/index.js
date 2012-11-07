/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Nov 7 17:23
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
        renderUI: function (editor) {
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
