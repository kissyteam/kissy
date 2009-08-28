
KISSY.Editor.add("plugins~blockquote", function(E) {

    var TYPE = E.PLUGIN_TYPE;

    E.addPlugin("blockquote", {
        /**
         * 种类：普通按钮
         */
        type: TYPE.TOOLBAR_BUTTON,

        /**
         * 响应函数
         */
        exec: function() {
            alert("todo");
        }
    });

 });
