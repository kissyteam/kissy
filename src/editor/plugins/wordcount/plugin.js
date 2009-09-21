
KISSY.Editor.add("plugins~wordcount", function(E) {

    var TYPE = E.PLUGIN_TYPE;

    E.addPlugin("wordcount", {
        /**
         * 种类：状态栏插件
         */
        type: TYPE.STATUSBAR_ITEM,

        /**
         * 响应函数
         */
        exec: function() {
            alert("haha");
        }
    });

 });
