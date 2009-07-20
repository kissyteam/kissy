
KISSY.Editor.add("toolbar", function(E) {

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang,
        isIE = YAHOO.env.ua.ie;

    E.Toolbar = {

        /**
         * 根据传入的编辑器实例，初始化实例的工具条
         * @param {KISSY.Editor} editor
         */
        init: function(editor) {
            var toolbar = editor.toolbar,
                config = editor.config,
                lang = editor.lang[editor.lang],
                items = config.toolbar,
                i, len;

            for(i = 0, len = items.length; i < len; ++i) {
                
            }
        }


    };

});
