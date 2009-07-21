
KISSY.Editor.add("basic", function(E) {

    var //Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang,
        //isIE = YAHOO.env.ua.ie,
        TYPE = E.PLUGIN_TYPE,
        buttons;

    buttons  = "bold,italic,underline,";
    buttons += "insertOrderedList,insertUnorderedList,";
    buttons += "outdent,indent,";
    buttons += "justifyLeft,justifyCenter,justifyRight";

    E.plugins[buttons] = {
        /**
         * 种类：普通按钮
         */
        type: TYPE.TOOLBAR_BUTTON,

        /**
         * 响应函数
         * @param {object} p
         * @param {KISSY.Editor} editor
         */
        fn: function(p, editor) {
            editor.exec(p.name);
        }
    };


    E.plugins["foreColor,backColor"] = {
        /**
         * 种类：普通按钮 + 菜单按钮
         */
        type: TYPE.TOOLBAR_BUTTON | TYPE.TOOLBAR_MENU_BUTTON,

        /**
         * 点击时的响应函数
         */
        fn: function(p, editor) {
            editor.exec(p.name);
        },

        /**
         * 插件自己的初始化函数
         */
        init: function(p, editor) {
            var el = p.domEl,
                span = el.getElementsByTagName("span")[0],
                caption = span.parentNode;

            
            
            
        }
    };

});
