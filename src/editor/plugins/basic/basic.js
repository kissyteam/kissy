
KISSY.Editor.add("basic", function(E) {

    var //Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang,
        //isIE = YAHOO.env.ua.ie,
        buttons;

    buttons  = "bold,italic,underline,";
    buttons += "insertOrderedList,insertUnorderedList,";
    buttons += "outdent,indent,";
    buttons += "justifyLeft,justifyCenter,justifyRight";

    E.plugins[buttons] = {
        /**
         * 插件种类
         */
        type: E.PLUGIN_TYPE.TOOLBAR_BUTTON,

        /**
         * 响应函数
         * @param {object} item
         * @param {KISSY.Editor} editor
         */
        fn: function(item, editor) {
            editor.exec(item.name);
        }
    };

});
