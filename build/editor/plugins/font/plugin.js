/**
 * font formatting for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("font", function (editor) {

    editor.addPlugin("font", function () {
        function wrapFont(vs) {
            var v = [];
            for (var i = 0;
                 i < vs.length;
                 i++) {
                v.push({
                    name:vs[i],
                    value:vs[i]
                });
            }
            return v;
        }

        var S = KISSY,
            KE = S.Editor,
            KEStyle = KE.Style,
            TripleButton = KE.TripleButton,
            pluginConfig = editor.cfg.pluginConfig;

        var FONT_SIZES = pluginConfig["font-size"],
            item,
            name,
            attrs,
            controls = [];

        if (FONT_SIZES !== false) {

            FONT_SIZES = FONT_SIZES || {};

            S.mix(FONT_SIZES, {
                items:wrapFont(["8px", "10px", "12px",
                    "14px", "18px", "24px",
                    "36px", "48px", "60px", "72px", "84px", "96px"]),
                width:"55px"
            }, false);

            var FONT_SIZE_STYLES = {},
                FONT_SIZE_ITEMS = [],
                fontSize_style = {
                    element:'span',
                    styles:{ 'font-size':'#(size)' },
                    overrides:[
                        { element:'font', attributes:{ 'size':null } }
                    ]
                };

            for (i = 0; i < FONT_SIZES.items.length; i++) {
                item = FONT_SIZES.items[i];
                name = item.name;
                attrs = item.attrs;
                var size = item.value;

                FONT_SIZE_STYLES[size] = new KEStyle(fontSize_style, {
                    size:size
                });

                FONT_SIZE_ITEMS.push({
                    name:name,
                    value:size,
                    attrs:attrs
                });
            }

            pluginConfig["font-size"] = FONT_SIZES;
        }


        /*
         FONT_SIZE_STYLES["inherit"] = new KEStyle(fontSize_style, {
         size:"inherit"
         });
         */

        var FONT_FAMILIES = pluginConfig["font-family"];

        if (FONT_FAMILIES !== false) {

            FONT_FAMILIES = FONT_FAMILIES || {};

            S.mix(FONT_FAMILIES, {
                items:[
                    //ie 不认识中文？？？
                    {name:"宋体", value:"SimSun"},
                    {name:"黑体", value:"SimHei"},
                    {name:"隶书", value:"LiSu"},
                    {name:"楷体", value:"KaiTi_GB2312"},
                    {name:"微软雅黑", value:"Microsoft YaHei"},
                    {name:"Georgia", value:"Georgia"},
                    {name:"Times New Roman", value:"Times New Roman"},
                    {name:"Impact", value:"Impact"},
                    {name:"Courier New", value:"Courier New"},
                    {name:"Arial", value:"Arial"},
                    {name:"Verdana", value:"Verdana"},
                    {name:"Tahoma", value:"Tahoma"}
                ],
                width:"130px"
            }, false);


            var FONT_FAMILY_STYLES = {},
                FONT_FAMILY_ITEMS = [],
                fontFamily_style = {
                    element:'span',
                    styles:{ 'font-family':'#(family)' },
                    overrides:[
                        { element:'font', attributes:{ 'face':null } }
                    ]
                }, i;


            pluginConfig["font-family"] = FONT_FAMILIES;


            for (i = 0; i < FONT_FAMILIES.items.length; i++) {
                item = FONT_FAMILIES.items[i];
                name = item.name;
                attrs = item.attrs || {};
                var value = item.value;
                attrs.style = attrs.style || "";
                attrs.style += ";font-family:" + value;
                FONT_FAMILY_STYLES[value] = new KEStyle(fontFamily_style, {
                    family:value
                });
                FONT_FAMILY_ITEMS.push({
                    name:name,
                    value:value,
                    attrs:attrs
                });
            }
        }

        var selectTpl = {
            click:function (ev) {
                var self = this,
                    v = ev.newVal,
                    pre = ev.prevVal,
                    styles = self.cfg.styles;
                editor.focus();
                editor.fire("save");
                var style = styles[v];
                if (v == pre) {
                    // 清除,wildcard pls
                    // !TODO inherit 小问题，在中间点 inherit
                    style.remove(editor.document);
                } else {
                    style.apply(editor.document);
                }
                editor.fire("save");
            },

            selectionChange:function (ev) {
                var self = this,
                    elementPath = ev.path,
                    elements = elementPath.elements,
                    styles = self.cfg.styles;

                // For each element into the elements path.
                for (var i = 0, element; i < elements.length; i++) {
                    element = elements[i];
                    // Check if the element is removable by any of
                    // the styles.
                    for (var value in styles) {
                        if (styles.hasOwnProperty(value)) {
                            if (styles[ value ].checkElementRemovable(element, true)) {
                                //S.log(value);
                                self.btn.set("value", value);
                                return;
                            }
                        }
                    }
                }

                var defaultValue = self.cfg.defaultValue;
                if (defaultValue) {
                    self.btn.set("value", defaultValue);
                } else {
                    self.btn.reset("value");
                }
            }
        };


        if (false !== pluginConfig["font-size"]) {
            controls.push(editor.addSelect("font-size", S.mix({
                title:"大小",
                width:"30px",
                mode:KE.WYSIWYG_MODE,
                showValue:true,
                defaultValue:FONT_SIZES.defaultValue,
                popUpWidth:FONT_SIZES.width,
                items:FONT_SIZE_ITEMS,
                styles:FONT_SIZE_STYLES
            }, selectTpl)));
        }

        if (false !== pluginConfig["font-family"]) {
            controls.push(editor.addSelect("font-family", S.mix({
                title:"字体",
                width:"110px",
                mode:KE.WYSIWYG_MODE,
                defaultValue:FONT_FAMILIES.defaultValue,
                popUpWidth:FONT_FAMILIES.width,
                items:FONT_FAMILY_ITEMS,
                styles:FONT_FAMILY_STYLES
            }, selectTpl)));
        }


        var singleFontTpl = {
            mode:KE.WYSIWYG_MODE,
            offClick:function () {
                var self = this,
                    editor = self.editor,
                    style = self.cfg.style;
                editor.fire("save");
                style.apply(editor.document);
                editor.fire("save");
                editor.notifySelectionChange();
                editor.focus();
            },
            onClick:function () {
                var self = this,
                    editor = self.editor,
                    style = self.cfg.style;
                editor.fire("save");
                style.remove(editor.document);
                editor.fire("save");
                editor.notifySelectionChange();
                editor.focus();
            },
            selectionChange:function (ev) {
                var self = this,
                    style = self.cfg.style,
                    btn = self.btn,
                    elementPath = ev.path;
                if (style.checkActive(elementPath)) {
                    btn.set("state", TripleButton.ON);
                } else {
                    btn.set("state", TripleButton.OFF);
                }
            }
        };

        if (false !== pluginConfig["font-bold"]) {
            controls.push(editor.addButton("font-bold", S.mix({
                contentCls:"ke-toolbar-bold",
                title:"粗体 ",
                style:new KEStyle({
                    element:'strong',
                    overrides:[
                        { element:'b' },
                        {element:'span',
                            attributes:{ style:'font-weight: bold;' }}
                    ]
                })
            }, singleFontTpl)));
        }

        if (false !== pluginConfig["font-italic"]) {
            controls.push(editor.addButton("font-italic", S.mix({
                contentCls:"ke-toolbar-italic",
                title:"斜体 ",
                style:new KEStyle({
                    element:'em',
                    overrides:[
                        { element:'i' },
                        {element:'span',
                            attributes:{ style:'font-style: italic;' }}
                    ]
                })
            }, singleFontTpl)));
        }

        if (false !== pluginConfig["font-underline"]) {
            controls.push(editor.addButton("font-underline", S.mix({
                contentCls:"ke-toolbar-underline",
                title:"下划线 ",
                style:new KEStyle({
                    element:'u',
                    overrides:[
                        {element:'span',
                            attributes:{ style:'text-decoration: underline;' }}
                    ]
                })
            }, singleFontTpl)));
        }

        if (false !== pluginConfig["font-strikeThrough"]) {
            var strikeStyle = (pluginConfig["font-strikeThrough"] || {})["style"] || {
                element:'del',
                overrides:[
                    {element:'span',
                        attributes:{ style:'text-decoration: line-through;' }},
                    { element:'s' },
                    { element:'strike' }
                ]
            };
            controls.push(editor.addButton("font-underline", S.mix({
                contentCls:"ke-toolbar-strikeThrough",
                title:"删除线 ",
                style:new KEStyle(strikeStyle)
            }, singleFontTpl)));
        }


        this.destroy = function () {
            for (var i = 0; i < controls.length; i++) {
                var c = controls[i];
                c.destroy();
            }
        };
    });
}, {
    attach:false
});
