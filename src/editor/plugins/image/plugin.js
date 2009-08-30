
KISSY.Editor.add("plugins~image", function(E) {

    var TYPE = E.PLUGIN_TYPE;

    E.addPlugin("image", {
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
