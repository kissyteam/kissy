/**
 * module: toolbar
 */

(function(editor) {
    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang,
        isIE = YAHOO.env.ua.ie;

    editor.Toolbar = {

        /**
         * 根据传入的编辑器实例，初始化实例的工具条
         * @param {KISSY.Editor} instance
         */
        init: function(instance) {
            var toolbar = instance.toolbar,
                config = instance.config,
                lang = editor.lang[instance.lang],
                items = config.toolbar,
                i, len;

            for(i = 0, len = items.length; i < len; ++i) {
                
            }
        }


    };

})(KISSY.Editor);
