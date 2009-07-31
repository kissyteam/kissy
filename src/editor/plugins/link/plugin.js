
KISSY.Editor.add("plugins~link", function(E) {

    var TYPE = E.PLUGIN_TYPE;

    E.addPlugin("link", {
        /**
         * 种类：普通按钮
         */
        type: TYPE.TOOLBAR_BUTTON,

        /**
         * 响应函数
         * @param {KISSY.Editor} editor
         */
        fn: function(editor) {
            var lang = this.lang, val;

            // TODO
            // 完善细节
            val = window.prompt(lang.dialogMessage, "http://");
            editor.execCommand("createLink", val);
        }
    });

 });
