
KISSY.Editor.add("plugins~justify", function(E) {

    var TYPE = E.PLUGIN_TYPE,
        isIE = YAHOO.env.ua.ie;

    E.addPlugin(["justifyLeft", "justifyCenter", "justifyRight"], {
        /**
         * 种类：普通按钮
         */
        type: TYPE.TOOLBAR_BUTTON,

        /**
         * 响应函数
         * @param {KISSY.Editor} editor
         */
        fn: function(editor) {
            if(isIE) {
                _ieFn(editor);
            } else {
                editor.execCommand(this.name);
            }
        },

        /**
         * ie 的响应函数
         */
        _ieFn: function(editor) {
            
        }
    });

 });
