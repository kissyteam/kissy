/**
 * focus management
 * @ignore
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Editor = require('./base');

    function focus() {
        var editor = this;
        editor.__iframeFocus = TRUE;
        currentInstance = editor;
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(function () {
            editor.fire('focus');
        }, 30);
    }

    function blur() {
        var editor = this;
        editor.__iframeFocus = FALSE;
        currentInstance = NULL;
        if (timer) {
            clearTimeout(timer);
        }
        /*
         Note that this functions acts asynchronously with a delay of 30ms to
         avoid subsequent blur/focus effects.
         */
        timer = setTimeout(function () {
            editor.fire('blur');
        }, 30);
    }

    var INSTANCES = {},
        timer,
        currentInstance,
        /**
         * focus management for all editor instances.
         * @class KISSY.Editor.focusManager
         * @singleton
         * @private
         */
            focusManager = {
            /**
             * get current focused editor instance
             */
            currentInstance: function () {
                return currentInstance;
            },
            /**
             * get editor instance by editor id
             * @param id {string}
             */
            getInstance: function (id) {
                return INSTANCES[id];
            },
            /**
             * register editor within focus manager
             * @param editor
             */
            register: function (editor) {
                INSTANCES[editor.get('id')] = editor;
            },
            /**
             * monitor editor focus and register editor
             * @param editor
             */
            add: function (editor) {
                this.register(editor);
                editor.get('window').on('focus', focus, editor)
                    .on('blur', blur, editor);
            },
            /**
             * remove editor from focus manager
             * @param editor
             */
            remove: function (editor) {
                delete INSTANCES[editor.get('id')];
                editor.get('window').detach('focus', focus, editor)
                    .detach('blur', blur, editor);
            }
        },
        TRUE = true,
        FALSE = false,
        NULL = null;


    Editor.focusManager = focusManager;
    Editor.getInstances = function () {
        return INSTANCES;
    };

    return focusManager;
});
