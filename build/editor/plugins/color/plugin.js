KISSY.Editor.add("color", function (editor) {
    editor.addPlugin("color", function () {
        var S = KISSY,
            KE = S.Editor;
        var pluginConfig = editor.cfg.pluginConfig;
        var destroys = [];
        if (false !== pluginConfig["forecolor"]) {
            (function () {
                var COLOR_STYLES = {
                    element:'span',
                    styles:{ 'color':'#(color)' },
                    overrides:[
                        { element:'font', attributes:{ 'color':null } }
                    ],
                    childRule:function (el) {
                        // <span style='color:red'><a href='g.cn'>abcdefg</a></span>
                        // 不起作用
                        return !(el._4e_name() == "a" || el.all("a").length);
                    }
                },
                    context = editor.addButton("color", {
                        styles:COLOR_STYLES,
                        mode:KE.WYSIWYG_MODE,
                        title:"文本颜色",
                        loading:true,
                        contentCls:"ke-toolbar-color"
                    });
                /**
                 * 注意：use 可同时在模块以及实例上 use
                 */
                KE.use("colorsupport", function () {
                    context.reload(KE.ColorSupport);
                });
                destroys.push(function () {
                    context.destroy();
                });
            })();
        }
        if (false !== pluginConfig["bgcolor"]) {
            (function () {
                var colorButton_backStyle = {
                    element:'span',
                    styles:{ 'background-color':'#(color)' },
                    overrides:[
                        { element:'*', styles:{ 'background-color':null } }
                    ],
                    childRule:function () {
                        // 强制最里面
                        // <span style='bgcolor:red'><span style='font-size:100px'>123434</span></span>
                        return false;
                    }
                };
                var context = editor.addButton("bgcolor", {
                    styles:colorButton_backStyle,
                    title:"背景颜色",
                    mode:KE.WYSIWYG_MODE,
                    loading:true,
                    contentCls:"ke-toolbar-bgcolor"
                });
                KE.use("colorsupport", function () {
                    context.reload(KE.ColorSupport);
                });
                destroys.push(function () {
                    context.destroy();
                });
            })();
        }


        this.destroy = function () {
            for (var i = 0; i < destroys.length; i++) {
                destroys[i]();
            }
        }
    });
}, {
    attach:false
});