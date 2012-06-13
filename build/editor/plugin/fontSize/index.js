/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 13 14:40
*/
/**
 * font formatting for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/fontSize/index", function (S, Editor, ui, cmd) {


    return {
        init:function (editor) {

            cmd.init(editor);

            function wrapFont(vs) {
                var v = [];
                S.each(vs, function (n) {
                    v.push({
                        content:n,
                        value:n
                    });
                });
                return v;
            }

            var pluginConfig = editor.get("pluginConfig"),
                fontSizes = pluginConfig["fontSize"];

            fontSizes = fontSizes || {};

            S.mix(fontSizes, {
                children:wrapFont([
                    "8px", "10px", "12px",
                    "14px", "18px", "24px",
                    "36px", "48px", "60px",
                    "72px", "84px", "96px"
                ]),
                width:"55px"
            }, false);

            editor.addSelect("fontSize", {
                cmdType:"fontSize",
                defaultCaption:"大小",
                width:"55px",
                mode:Editor.WYSIWYG_MODE,
                menu:{
                    width:fontSizes.width,
                    children:fontSizes.children
                }
            }, ui.Select);
        }};
}, {
    requires:['editor', '../font/ui', './cmd']
});
