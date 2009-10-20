
KISSY.Editor.add("plugins~source", function(E) {

    var UA = YAHOO.env.ua,
        TYPE = E.PLUGIN_TYPE;

    /**
     * 查看源代码插件
     */
    E.addPlugin("source", {
        /**
         * 种类：普通按钮
         */
        type: TYPE.TOOLBAR_BUTTON,

        /**
         * 初始化函数
         */
        init: function() {
            var editor = this.editor;

            this.iframe = editor.contentWin.frameElement;
            this.textarea = editor.textarea;

            // 将 textarea 放入 iframe 下面
            this.iframe.parentNode.appendChild(editor.textarea);
        },

        /**
         * 响应函数
         */
        exec: function() {
            var editor = this.editor,
                srcOn = editor.sourceMode;

            // 同步数据
            if(srcOn) {
                editor.contentDoc.body.innerHTML = this.textarea.value;
            } else {
                this.textarea.value = editor.getContentDocData();
            }

            // [bug fix] ie7-下，切换到源码时，iframe 的光标还可见，需隐藏掉
            if(UA.ie && UA.ie < 8) {
                editor.contentDoc.selection.empty();
            }

            // 切换显示
            this.textarea.style.display = srcOn ? "none" : "";
            this.iframe.style.display = srcOn ? "" : "none";

            // 更新状态
            editor.sourceMode = !srcOn;
        }
    });

 });
