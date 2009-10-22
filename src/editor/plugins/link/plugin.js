
KISSY.Editor.add("plugins~link", function(E) {

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang,
        UA = YAHOO.env.ua, isIE = UA.ie,
        TYPE = E.PLUGIN_TYPE, Range = E.Range,
        timeStamp = new Date().getTime(),
        HREF_REG = /^\w+:\/\/.*|#.*$/,

        DIALOG_CLS = "ks-editor-link",
        NEW_LINK_CLS = "ks-editor-link-newlink-mode",
        BTN_OK_CLS = "ks-editor-btn-ok",
        BTN_CANCEL_CLS = "ks-editor-btn-cancel",
        BTN_REMOVE_CLS = "ks-editor-link-remove",
        DEFAULT_HREF = "http://",

        DIALOG_TMPL = ['<form onsubmit="return false"><ul>',
                          '<li class="ks-editor-link-href"><label>{href}</label><input name="href" style="width: 220px" value="http://" type="text" /></li>',
                          '<li class="ks-editor-link-target"><input name="target" id="target_"', timeStamp ,' type="checkbox" /> <label for="target_"', timeStamp ,'>{target}</label></li>',
                          '<li class="ks-editor-dialog-actions">',
                              '<button name="ok" class="', BTN_OK_CLS, '">{ok}</button>',
                              '<span class="', BTN_CANCEL_CLS ,'">{cancel}</span>',
                              '<span class="', BTN_REMOVE_CLS ,'">{remove}</span>',
                          '</li>',
                      '</ul></form>'].join("");

    E.addPlugin("link", {
        /**
         * 种类：按钮
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

            // webkit 调用默认的 exeCommand, 需隐藏 target 设置
            UA.webkit && (this.form.target.parentNode.style.display = "none");

            isIE && E.Dom.setItemUnselectable(dialog);
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
            // 保存 range, 以便还原
            this.range = E.Range.saveRange(this.editor);

            var form = this.form,
                container = Range.getCommonAncestor(this.range),
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

            var range = this.range,
                container = Range.getCommonAncestor(range),
                containerIsA = container.nodeName === "A", // 是图片等链接
                parentEl = container.parentNode,
                parentIsA = parentEl && (parentEl.nodeName === "A"), // 文字链接
                a, div = document.createElement("div"), fragment;

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
            a = document.createElement("a");
            a.href = href;
            if (target) a.setAttribute("target", "_blank");

            if (isIE) {
                if("text" in range) { // TextRange
                    if (range.select) range.select();

                    a.innerHTML = range.htmlText || href;
                    div.innerHTML = "";
                    div.appendChild(a);
                    range.pasteHTML(div.innerHTML);

                } else { // ControlRange
                    // TODO: ControlRange 链接的 target 实现
                    this.editor.execCommand("createLink", href);
                }

            } else if(UA.webkit) { // TODO: https://bugs.webkit.org/show_bug.cgi?id=16867
                this.editor.execCommand("createLink", href);

            } else { // W3C
                if(range.collapsed) {
                    a.innerHTML = href;
                } else {
                    fragment = range.cloneContents();
                    while(fragment.firstChild) {
                        a.appendChild(fragment.firstChild);
                    }
                }
                range.deleteContents(); // 删除原内容
                range.insertNode(a); // 插入链接
                range.selectNode(a); // 选中链接
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
                container = Range.getCommonAncestor(range),
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