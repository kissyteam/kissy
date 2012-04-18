/**
 * font formatting for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/fontFamily/index", function (S, KE, ui, cmd) {

    return {
        init:function (editor) {
            cmd.init(editor);
            var pluginConfig = editor.get("pluginConfig"),
                fontFamilies = pluginConfig["fontFamily"];
            fontFamilies = fontFamilies || {};
            S.mix(fontFamilies, {
                items:[
                    //ie 不认识中文？？？
                    {
                        name:"宋体",
                        value:"SimSun"
                    },
                    {
                        name:"黑体",
                        value:"SimHei"
                    },
                    {
                        name:"隶书",
                        value:"LiSu"
                    },
                    {
                        name:"楷体",
                        value:"KaiTi_GB2312"
                    },
                    {
                        name:"微软雅黑",
                        value:"Microsoft YaHei"
                    },
                    {
                        name:"Georgia",
                        value:"Georgia"
                    },
                    {
                        name:"Times New Roman",
                        value:"Times New Roman"
                    },
                    {
                        name:"Impact",
                        value:"Impact"
                    },
                    {
                        name:"Courier New",
                        value:"Courier New"
                    },
                    {
                        name:"Arial",
                        value:"Arial"
                    },
                    {
                        name:"Verdana",
                        value:"Verdana"
                    },
                    {
                        name:"Tahoma",
                        value:"Tahoma"
                    }
                ],
                width:"130px"
            }, false);

            S.each(fontFamilies.items, function (item) {
                var attrs = item.attrs || {},
                    value = item.value;
                attrs.style = attrs.style || "";
                attrs.style += ";font-family:" + value;
                item.attrs = attrs;
            });

            editor.addSelect({
                cmdType:"fontFamily",
                title:"字体",
                width:"110px",
                defaultValue:fontFamilies.defaultValue,
                popUpWidth:fontFamilies.width,
                items:fontFamilies.items
            }, undefined, ui.Select);
        }};
}, {
    requires:['editor', '../font/ui', './cmd']
});
