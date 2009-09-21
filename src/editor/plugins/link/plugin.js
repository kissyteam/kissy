
KISSY.Editor.add("plugins~link", function(E) {

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang,
        isIE = YAHOO.env.ua.ie,
        TYPE = E.PLUGIN_TYPE, Range = E.Range,
        timeStamp = new Date().getTime(),
        HREF_REG = /^\w+:\/\/.*|#.*$/,

        DIALOG_CLS = "ks-editor-link-dialog",
        NEW_LINK_CLS = "ks-editor-link-dialog-newlink-mode",
        BTN_OK_CLS = "ks-editor-link-dialog-ok",
        BTN_CANCEL_CLS = "ks-editor-link-dialog-cancel",
        BTN_REMOVE_CLS = "ks-editor-link-dialog-remove",
        DEFAULT_HREF = "http://",

        DIALOG_TMPL = ['<form onsubmit="return false"><ul>',
                          '<li class="ks-editor-link-dialog-href"><label>{href}</label><input name="href" size="40" value="http://" type="text" /></li>',
                          '<li class="ks-editor-link-dialog-target"><input name="target" id="target_"', timeStamp ,' type="checkbox" /> <label for="target_"', timeStamp ,'>{target}</label></li>',
                          '<li class="ks-editor-link-dialog-actions">',
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
         * 关联的 range 对象
         */
        range: null,

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

            if(isIE) {
                E.Dom.setItemUnselectable(dialog);
            }
        },

        /**
         * 绑定事件
         */
        _bindUI: function() {
            var form = this.form, self = this;

            // 显示/隐藏对话框时的事件
            Event.on(this.domEl, "click", function() {
                // 仅在显示时更新
                if(self.dialog.style.visibility === isIE ? "hidden" : "visible") { // 事件的触发顺序不同
                    self._syncUI();
                }
            });

            // 注册表单按钮点击事件
            Event.on(this.dialog, "click", function(ev) {
                var target = Event.getTarget(ev);

                switch(target.className) {
                    case BTN_OK_CLS:
                        self._createLink(form.href.value, form.target.checked);
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
            this.range = this.editor.getSelectionRange();

            var form = this.form,
                container = Range.getContainer(this.range),
                containerIsA = container.nodeName === "A", // 图片等链接
                parentEl = container.parentNode,
                parentIsA = parentEl && (parentEl.nodeName === "A"), // 文字链接
                a;

            // 修改链接界面
            if (containerIsA || parentIsA) {
                a = containerIsA ? container : parentEl;
                form.href.value = a.href;
                form.target.checked = a.target === "_blank";
                Dom.removeClass(form, NEW_LINK_CLS);
                return;
            }

            // 新建链接界面
            form.href.value = DEFAULT_HREF;
            form.target.checked = false;
            Dom.addClass(form, NEW_LINK_CLS);
        },

        /**
         * 创建/修改链接
         */
        _createLink: function(href, target) {
            href = this._getValidHref(href);

            // href 为空时，移除链接
            if (href.length === 0) {
                this._unLink();
                return;
            }

            var editor = this.editor,
                range = this.range,
                container = Range.getContainer(range),
                containerIsA = container.nodeName === "A", // 是图片等链接
                parentEl = container.parentNode,
                parentIsA = parentEl && (parentEl.nodeName === "A"), // 文字链接
                a;

            // 修改链接
            if (containerIsA || parentIsA) {
                a = containerIsA ? container : parentEl;
                a.href = href;
                if (target) {
                    a.setAttribute("target", "_blank");
                } else {
                    a.removeAttribute("target");
                }
                return;
            }

            // 创建链接
            var selectedText = Range.getSelectedText(range);
            if (container.nodeType == 3 && !selectedText) { // 文本链接
                if (!isIE) {
                    a = document.createElement("A");
                    a.innerHTML = href;
                    range.insertNode(a);
                } else {
                    range.pasteHTML('<a href="' + href + '">' + href + '</a>');
                }
            } else {
                if(range.select) range.select();
                editor.execCommand("createLink", href);
            }
        },

        _getValidHref: function(href) {
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
                range = this.range,
                selectedText = Range.getSelectedText(range),
                container = Range.getContainer(range),
                parentEl;

            // 没有选中文字时
            if (!selectedText && container.nodeType == 3) {
                parentEl = container.parentNode;
                if (parentEl.nodeName == "A") {
                    parentEl.parentNode.replaceChild(container, parentEl);
                }
            } else {
                if(range.select) range.select();
                editor.execCommand("unLink", null);
            }
        }
    });

 });

// TODO:
// 当选区包含链接/一部分包含链接时，生成的链接内容的调优处理。
// 目前只有 Google Docs 做了优化，其它编辑器都采用浏览器默认的处理方式。
// 先记于此，等以后优化。

/**
 * Notes:
 *  1. 在 ie 下，点击工具栏上的按钮时，会导致 iframe 编辑区域的 range 选区丢失。解决办法是：
 *     对所有元素添加 unselectable 属性。但是，对于 text input 框，为了能输入，不能有 unselectable
 *     属性。这就导致了矛盾。因此，权衡之后的解决办法是：在对话框弹出前，将 range 对象保存起来，
 *     丢失后，再通过 range.select() 选择回来。这基本上已经满足需求。
 *  2. 目前只有 CKEditor 和 TinyMCE 等完全接管命名的编辑器处理得很完美。但 1 的解决方案，目前已经
 *     够用，成本也很低。
 */