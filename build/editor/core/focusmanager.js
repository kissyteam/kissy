/**
 * 多实例的管理，主要是焦点控制，主要是为了
 * 1.firefox 焦点失去 bug，记录当前状态
 * 2.窗口隐藏后能够恢复焦点
 * @author <yiminghe@gmail.com>
 */
KISSY.Editor.add("focusmanager", function(KE) {
    var S = KISSY,
        DOM = S.DOM,
        Event = S.Event,
        INSTANCES = {},
        timer,
        //当前焦点所在处
        currentInstance,
        focusManager = {
            /**
             * 刷新全部实例
             */
            refreshAll:function() {
                for (var i in INSTANCES) {
                    var e = INSTANCES[i];
                    e.document.designMode = "off";
                    e.document['designMode'] = "on";
                }
            },
            /**
             * 得到当前获得焦点的实例
             */
            currentInstance :function() {
                return currentInstance;
            },
            /**
             *
             * @param id {string}
             */
            getInstance : function(id) {
                return INSTANCES[id];
            },
            /**
             *
             * @param editor {KISSY.Editor}
             */
            add : function(editor) {
                var win = DOM._4e_getWin(editor.document);
                Event.on(win, "focus", focus, editor);
                Event.on(win, "blur", blur, editor);
            },
            /**
             *
             * @param editor {KISSY.Editor}
             */
            register : function(editor) {
                INSTANCES[editor._UUID] = editor;
            },
            /**
             *
             * @param editor {KISSY.Editor}
             */
            remove : function(editor) {
                delete INSTANCES[editor._UUID];
                var win = DOM._4e_getWin(editor.document);
                Event.remove(win, "focus", focus, editor);
                Event.remove(win, "blur", blur, editor);
            }
        },
        TRUE = true,
        FALSE = false,
        NULL = null;

    /**
     * @this {KISSY.Editor}
     */
    function focus() {
        var editor = this;
        editor.iframeFocus = TRUE;
        currentInstance = editor;
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(function() {
            editor.fire("focus");
        }, 100);
        //S.log(editor._UUID + " focus");
    }

    /**
     * @this {KISSY.Editor}
     */
    function blur() {
        var editor = this;
        editor.iframeFocus = FALSE;
        currentInstance = NULL;
        if (timer) {
            clearTimeout(timer);
        }
        /*
         Note that this functions acts asynchronously with a delay of 100ms to
         avoid subsequent blur/focus effects.
         */
        timer = setTimeout(function() {
            editor.fire("blur");
        }, 100);
        //S.log(editor._UUID + " blur");
    }

    focusManager['refreshAll'] = focusManager.refreshAll;
    KE.focusManager = focusManager;
    KE["focusManager"] = focusManager;
    KE['getInstances'] = function() {
        return INSTANCES;
    };
    KE["getInstances"] = KE.getInstances;
});
