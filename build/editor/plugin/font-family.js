/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:17
*/
/**
 * font formatting for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/font-family", function (S, Editor, ui, cmd) {

    function FontFamilyPlugin(config) {
        this.config = config || {};
    }

    S.augment(FontFamilyPlugin, {
        pluginRenderUI:function (editor) {

            cmd.init(editor);

            var fontFamilies = this.config;

            var menu = {};


            S.mix(menu, {
                children:[
                    //ie 不认识中文？？？
                    {
                        content:"宋体",
                        value:"SimSun"
                    },
                    {
                        content:"黑体",
                        value:"SimHei"
                    },
                    {
                        content:"隶书",
                        value:"LiSu"
                    },
                    {
                        content:"楷体",
                        value:"KaiTi_GB2312"
                    },
                    {
                        content:"微软雅黑",
                        value:"Microsoft YaHei"
                    },
                    {
                        content:"Georgia",
                        value:"Georgia"
                    },
                    {
                        content:"Times New Roman",
                        value:"Times New Roman"
                    },
                    {
                        content:"Impact",
                        value:"Impact"
                    },
                    {
                        content:"Courier New",
                        value:"Courier New"
                    },
                    {
                        content:"Arial",
                        value:"Arial"
                    },
                    {
                        content:"Verdana",
                        value:"Verdana"
                    },
                    {
                        content:"Tahoma",
                        value:"Tahoma"
                    }
                ],
                width:"130px"
            });

            S.each(menu.children, function (item) {
                var attrs = item.elAttrs || {},
                    value = item.value;
                attrs.style = attrs.style || "";
                attrs.style += ";font-family:" + value;
                item.elAttrs = attrs;
            });

            fontFamilies.menu = S.mix(menu, fontFamilies.menu);

            editor.addSelect("fontFamily", S.mix({
                cmdType:"fontFamily",
                defaultCaption:"字体",
                width:130,
                mode:Editor.Mode.WYSIWYG_MODE
            }, fontFamilies), ui.Select);
        }
    });

    return FontFamilyPlugin;
}, {
    requires:['editor', './font/ui', './font-family/cmd']
});
