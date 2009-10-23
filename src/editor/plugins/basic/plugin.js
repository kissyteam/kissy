
KISSY.Editor.add("plugins~base", function(E) {

    var TYPE = E.PLUGIN_TYPE,
        buttons  = "bold,italic,underline,strikeThrough," +
                   "insertOrderedList,insertUnorderedList";

    E.addPlugin(buttons.split(","), {
        /**
         * 种类：普通按钮
         */
        type: TYPE.TOOLBAR_BUTTON,

        /**
         * 响应函数
         */
        exec: function() {
            // 执行命令
            this.editor.execCommand(this.name);

            // 更新状态
            this.editor.toolbar.updateState();
        }
    });

 });
