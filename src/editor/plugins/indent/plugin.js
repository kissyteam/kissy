
KISSY.Editor.add("plugins~indent", function(E) {

    var TYPE = E.PLUGIN_TYPE;

    E.addPlugin(["indent", "outdent"], {
        /**
         * 种类：普通按钮
         */
        type: TYPE.TOOLBAR_BUTTON,

        /**
         * 响应函数
         * @param {KISSY.Editor} editor
         */
        exec: function(editor) {
            editor.execCommand(this.name);
        }
    });

 });

// TODO:
//  目前仿 Google Docs，不做特殊处理。在不同浏览器下表现不同。
//  等有时间了，可以考虑仿照 CKEditor 的实现方式。
