/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Feb 17 17:29
*/
/**
 * font formatting for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/font-size/index", function (S, Editor, ui, cmd) {

    function FontSizePlugin(config) {
        this.config = config || {};
    }

    S.augment(FontSizePlugin, {
        pluginRenderUI:function (editor) {

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

            var fontSizeConfig = this.config;

            fontSizeConfig.menu = S.mix({
                children:wrapFont([
                    "8px", "10px", "12px",
                    "14px", "18px", "24px",
                    "36px", "48px", "60px",
                    "72px", "84px", "96px"
                ])
            }, fontSizeConfig.menu);

            editor.addSelect("fontSize", S.mix({
                cmdType:"fontSize",
                defaultCaption:"大小",
                width:"70px",
                mode:Editor.WYSIWYG_MODE
            }, fontSizeConfig), ui.Select);
        }
    });

    return FontSizePlugin;
}, {
    requires:['editor', '../font/ui', './cmd']
});
