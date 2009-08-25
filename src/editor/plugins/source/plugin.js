
KISSY.Editor.add("plugins~source", function(E) {

    var TYPE = E.PLUGIN_TYPE,
        iframe, iframeBd, textarea;

    E.addPlugin("source", {
        /**
         * 种类：普通按钮
         */
        type: TYPE.TOOLBAR_BUTTON,

        /**
         * 初始化函数
         * @param  {KISSY.Editor} editor
         */
        init: function(editor) {
            iframe = editor.contentWin.frameElement;
            iframeBd = editor.contentDoc.body;
            textarea = editor.textarea;

            // 将 textarea 放入 iframe 下面
            iframe.parentNode.appendChild(textarea);
        },

        /**
         * 响应函数
         * @param {KISSY.Editor} editor
         */
        exec: function(editor) {
            var srcOn = editor.sourceMode;

            // 同步数据
            if(srcOn) {
                iframeBd.innerHTML = textarea.value;
            } else {
                textarea.value = editor.getContentDocData();
            }

            // 显示/隐藏
            textarea.style.display = srcOn ? "none" : "";
            iframe.style.display = srcOn ? "" : "none";

            editor.sourceMode = !srcOn;
        }
    });

 });

/**
 * TODO:
 *  1. 多个编辑器实例时，感觉会有问题，可能要更改设计。
 */