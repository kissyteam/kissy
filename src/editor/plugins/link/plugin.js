
KISSY.Editor.add("plugins~link", function(E) {

    var TYPE = E.PLUGIN_TYPE,
        Lang = YAHOO.lang,
        ua = YAHOO.env.ua, isIE = ua.ie;

    E.addPlugin("link", {
        /**
         * 种类：普通按钮
         */
        type: TYPE.TOOLBAR_BUTTON,

        /**
         * 响应函数
         * @param {KISSY.Editor} editor
         */
        fn: function(editor) {
            var msg = this.lang.dialogMessage,
                url = "http://",
                range = editor.getSelectionRange(),
                container = range.startContainer,
                parentEl;

           if(container.nodeType == 3) { // TextNode
               parentEl = container.parentNode;
               if(parentEl.nodeName == "A") {
                   url = parentEl.href;
               }
           }

            url = Lang.trim(window.prompt(msg, url));

            if(url) {
                editor.execCommand("createLink", url);
            } else {
                editor.execCommand("unLink", url);
            }

            // TODO:
            // 当选区包含链接/一部分包含链接时，生成的链接内容的调优处理。
            // 目前只有 Google Docs 做了优化，其它编辑器都采用浏览器默认的处理方式。
            // 先记于此，等以后优化。
        }
    });

 });
