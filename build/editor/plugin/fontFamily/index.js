/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 15 17:22
*/
/**
 * font formatting for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/fontFamily/index", function (S, Editor, ui, cmd) {

    function FontFamilyPlugin(config) {
this.config=config||{};
    }

    S.augment(FontFamilyPlugin, {
        renderUI:function (editor) {

            cmd.init(editor);

            var fontFamilies = this.config;

            fontFamilies = fontFamilies || {};

            S.mix(fontFamilies, {
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
            }, false);

            S.each(fontFamilies.children, function (item) {
                var attrs = item.elAttrs || {},
                    value = item.value;
                attrs.style = attrs.style || "";
                attrs.style += ";font-family:" + value;
                item.elAttrs = attrs;
            });

            editor.addSelect("fontFamily", {
                cmdType:"fontFamily",
                defaultCaption:"字体",
                width:130,
                mode:Editor.WYSIWYG_MODE,
                menu:{
                    width:fontFamilies.width,
                    children:fontFamilies.children
                }
            }, ui.Select);
        }
    });

    return FontFamilyPlugin;
}, {
    requires:['editor', '../font/ui', './cmd']
});
