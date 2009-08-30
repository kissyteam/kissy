
KISSY.Editor.add("plugins~maximize", function(E) {

    var TYPE = E.PLUGIN_TYPE;

    E.addPlugin("maximize", {
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
