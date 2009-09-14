
KISSY.Editor.add("plugins~link", function(E) {

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang,
        isIE = YAHOO.env.ua.ie,
        TYPE = E.PLUGIN_TYPE, Range = E.Range,
        timeStamp = new Date().getTime(),
        HREF_REG = /^\w+:\/\/.*$/,

        DIALOG_CLS = "kissy-link-dialog",
        NEW_LINK_CLS = "kissy-link-dialog-newlink-mode",
        BTN_OK_CLS = "kissy-link-dialog-ok",
        BTN_CANCEL_CLS = "kissy-link-dialog-cancel",
        BTN_REMOVE_CLS = "kissy-link-dialog-remove",
        DEFAULT_HREF = "http://",

        DIALOG_TMPL = ['<form onsubmit="return false"><ul>',
                          '<li class="kissy-link-dialog-href"><label>{href}</label><input name="href" size="40" value="http://" type="text" /></li>',
                          '<li class="kissy-link-dialog-text"><label>{text}</label><input name="text" size="40" type="text" /></li>',
                          '<li class="kissy-link-dialog-target"><input name="target" id="target_"', timeStamp ,' type="checkbox" /> <label for="target_"', timeStamp ,'>{target}</label></li>',
                          '<li class="kissy-link-dialog-actions">',
                              '<button name="ok" class="', BTN_OK_CLS, '">{ok}</button>',
                              '<button name="cancel" class="', BTN_CANCEL_CLS ,'">{cancel}</button>',
                              '<span class="', BTN_REMOVE_CLS ,'">{remove}</span>',
                          '</li>',
                      '</ul></form>'].join("");

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
         * 关联的表单
         */
        form: null,

        /**
         * 初始化函数
         */
        init: function() {
            this._renderUI();
            this._bindUI();
        },

        /**
         * 初始化对话框界面
         */
        _renderUI: function() {
            var dialog = E.Menu.generateDropMenu(this.editor, this.domEl, [1, 0]),
                lang = this.lang;

            dialog.className += " " + DIALOG_CLS;
            dialog.innerHTML = DIALOG_TMPL.replace(/\{([^}]+)\}/g, function(match, key) {
                return lang[key] ? lang[key] : key;
            });

            this.dialog = dialog;
            this.form = dialog.getElementsByTagName("form")[0];
        },

        /**
         * 绑定事件
         */
        _bindUI: function() {
            var form = this.form, self = this;

            // 显示/隐藏对话框时的事件
            Event.on(this.domEl, "click", function() {
                // TODO：仅在显示时更新
                self._syncUI();
            });

            // 注册表单按钮点击事件
            Event.on(this.dialog, "click", function(ev) {
                var target = Event.getTarget(ev);

                switch(target.className) {
                    case BTN_OK_CLS:
                        self._createLink(form.href.value, form.text.value, form.target.checked);
                        break;
                    case BTN_CANCEL_CLS: // 直接往上冒泡，关闭对话框
                        break;
                    case BTN_REMOVE_CLS:
                        self._unLink();
                        break;
                    default: // 点击在非按钮处，停止冒泡，保留对话框
                        Event.stopPropagation(ev);
                }
            });
        },

        /**
         * 更新界面上的表单值
         */
        _syncUI: function() {
            var editor = this.editor,
                form = this.form,
                range = editor.getSelectionRange(),
                container = Range.getStartContainer(range),
                parentEl;

            // 修改链接界面
            if (container.nodeType == 3) { // TextNode
                parentEl = container.parentNode;
                if (parentEl.nodeName == "A") {
                    form.href.value = parentEl.href;
                    form.text.value = E.Dom.getText(parentEl);
                    form.target.checked = parentEl.target === "_blank";
                    Dom.removeClass(form, NEW_LINK_CLS);
                    return;
                }
            }

            // 新建链接界面
            form.href.value = DEFAULT_HREF;
            form.text.value = Range.getSelectedText(range);
            Dom.addClass(form, NEW_LINK_CLS);
        },

        /**
         * 创建/修改链接
         */
        _createLink: function(href, text, target) {
            href = this._getValidLink(href);

            // href 为空时，移除链接
            if (href.length === 0) {
                this._unLink();
                return;
            }

            var editor = this.editor,
                range = editor.getSelectionRange(),
                container = Range.getStartContainer(range),
                parentEl = container.parentNode;

            // text 为空时，自动设为 href 的值
            if (!text && container.nodeType == 3) { // TextNode
                text = href;
            }

            // 修改链接
            if (parentEl.nodeName == "A") {
                parentEl.href = href;
                parentEl.innerHTML = text;
                if (target) {
                    parentEl.setAttribute("target", "_blank");
                } else {
                    parentEl.removeAttribute("target");
                }
                return;
            }

            // 创建链接
            var selectedText = Range.getSelectedText(range);
            if (text && !selectedText) { // 有 text 时，表示是文本链接，不是图片等元素
                if (!isIE) {
                    var a = document.createElement("A");
                    a.innerHTML = text;
                    range.insertNode(a);
                } else {
                    range.pasteHTML('<a href="' + href + '">' + text + '</a>');
                }
            } else {
                editor.execCommand("createLink", href);
            }
        },

        _getValidLink: function(href) {
            href = Lang.trim(href);
            if(href && !HREF_REG.test(href)) { // 不为空 或 不符合标准模式 abcd://efg
               href = DEFAULT_HREF + href; // 添加默认前缀
            }
            return href;
        },

        /**
         * 移除链接
         */
        _unLink: function() {
            var editor = this.editor,
                range = editor.getSelectionRange(),
                selectedText = Range.getSelectedText(range),
                container = Range.getStartContainer(range),
                parentEl;

            // 没有选中文字时
            if (!selectedText && container.nodeType == 3) {
                parentEl = container.parentNode;
                if (parentEl.nodeName == "A") {
                    parentEl.parentNode.replaceChild(container, parentEl);
                }
            } else {
                editor.execCommand("unLink");
            }
        }
    });

 });

// TODO:
// 当选区包含链接/一部分包含链接时，生成的链接内容的调优处理。
// 目前只有 Google Docs 做了优化，其它编辑器都采用浏览器默认的处理方式。
// 先记于此，等以后优化。