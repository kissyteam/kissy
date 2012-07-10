/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 10 10:41
*/
/**
 * foreColor button.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/foreColor/index", function (S, Editor, Button, cmd) {

    function ForeColorPlugin(config) {
        this.config = config || {};
    }

    S.augment(ForeColorPlugin, {
        renderUI:function (editor) {
            cmd.init(editor);
            editor.addButton("foreColor", {
                cmdType:'foreColor',
                tooltip:"文本颜色",
                pluginConfig:this.config
            }, Button);
        }
    });

    return ForeColorPlugin;
}, {
    requires:['editor', '../color/btn', './cmd']
});
