
KISSY.Editor.add("plugins~keystroke", function(E) {

    var Y = YAHOO.util, Event = Y.Event,
        UA = YAHOO.env.ua,
        TYPE = E.PLUGIN_TYPE;


    E.addPlugin("keystroke", {
        /**
         * 种类
         */
        type: TYPE.FUNC,

        /**
         * 初始化
         */
        init: function() {
            var editor = this.editor;

            // [bug fix] ie7- 下，按下 Tab 键后，光标还在编辑器中闪烁，并且回车提交无效
            if (UA.ie < 8) {
                Event.on(editor.contentDoc, "keydown", function(ev) {
                    if(ev.keyCode == 9) {
                        this.selection.empty();
                    }
                });
            }
        }

    });
 });
