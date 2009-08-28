
KISSY.Editor.add("plugins~link", function(E) {

    var TYPE = E.PLUGIN_TYPE,
        Lang = YAHOO.lang,

        DIALOG_CLS = "kissy-drop-menu-linkDialog",
        DIALOG_TMPL = '<ul>' +
                          '<li><label>{lang.href}<label><input class="kissy-linkDialog-href" onclick="this.select()" value="http://" type="text" /></li>' +
                          '<li><label>{lang.text}<label><input class="kissy-linkDialog-text" type="text" /></li>' +
                          '<li><input class="kissy-linkDialog-target" type="checkbox" /><label>{lang.target}</label></li>' +
                          '<li><button </li>' +
                      '</ul>'
            ;

    E.addPlugin("link", {
        /**
         * 种类：普通按钮
         */
        type: TYPE.TOOLBAR_BUTTON,

        /**
         * 关联的对话框
         */
        dialog: null,

        /**
         * 初始化函数
         */
        init: function() {
            this._initDialog();
        },

        /**
         * 初始化对话框
         */
        _initDialog: function() {
            var dialog = E.Menu.generateDropMenu(this.editor, this.domEl, [1, 0]),
                lang = this.lang;

            dialog.className += " " + DIALOG_CLS;
            dialog.innerHTML = DIALOG_TMPL
                    .replace("{lang.href}", lang.href)
                    .replace("{lang.text}", lang.text)
                    .replace("{lang.target}", lang.target);

            this.dialog = dialog;
        },

        /**
         * 响应函数
         */
        exec2: function() {
            var editor = this.editor,
                msg = this.lang.dialogMessage,
                url = "http://",
                range = editor.getSelectionRange(),
                container = range.startContainer || range.parentElement(),
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
