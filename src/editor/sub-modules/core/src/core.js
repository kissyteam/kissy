/**
 * New Editor For KISSY
 * @preserve thanks to CKSource's intelligent work on CKEditor
 * @author yiminghe@gmail.com
 */
KISSY.add('editor/core', function (S, Editor, Utils, focusManager, Styles, zIndexManger, clipboard, enterKey, htmlDataProcessor, selectionFix) {
    var TRUE = true,

        undefined = undefined,

        $ = S.all,

        FALSE = false,

        NULL = null,

        DOC = document,

        UA = S.UA,

        IS_IE = UA['ie'],

        DOM = S.DOM,

        NodeType = DOM.NodeType,

        Node = S.Node,

        Event = S.Event,

        DISPLAY = 'display',

        WIDTH = 'width',

        HEIGHT = 'height',

        NONE = 'none',

        tryThese = Utils.tryThese,

        HTML5_DTD = '<!doctype html>',

        KE_TEXTAREA_WRAP_CLASS = '.{prefixCls}editor-textarea-wrap',

        KE_TOOLBAR_CLASS = '.{prefixCls}editor-tools',

        KE_STATUSBAR_CLASS = '.{prefixCls}editor-status',

        IFRAME_HTML_TPL = HTML5_DTD + '<html>' +
            '<head>{doctype}' +
            '<title>{title}</title>' +
            '<link href="' + '{href}" rel="stylesheet" />' +
            '<style>' +
            '{style}' +
            '</style>' +
            '{links}' +
            '</head>' +
            '<body class="ks-editor" ' +
            '>' +
            '{data}' +
            '{script}' +
            '</body>' +
            '</html>',

        IFRAME_TPL = '<iframe' +
            ' style="width:100%;height:100%;border:none;'
            + '" ' +
            ' frameborder="0" ' +
            ' title="kissy-editor" ' +
            ' allowTransparency="true" ' +
            ' {iframeSrc} ' +
            '>' +
            '</iframe>' ,

        EMPTY_CONTENT_REG = /^(?:<(p)>)?(?:(?:&nbsp;)|\s)*(?:<\/\1>)?$/i,

        EDITOR_TPL = '<div class="' + KE_TOOLBAR_CLASS.substring(1) + '"></div>' +
            '<div class="' + KE_TEXTAREA_WRAP_CLASS.substring(1) + '" ' +
            // http://johanbrook.com/browsers/native-momentum-scrolling-ios-5/
            // ios 不能放在 iframe 上！
            (UA.mobile ? 'style="overflow:scroll;-webkit-overflow-scrolling:touch;"' : '') +
            '>' +
            '</div>' +
            '<div class="' + KE_STATUSBAR_CLASS.substring(1) + '"></div>';

    Editor.Mode = {
        SOURCE_MODE: 0,
        WYSIWYG_MODE: 1
    };

    var WYSIWYG_MODE = 1;

    S.augment(Editor,

        /**
         * @lends Editor#
         */
        {
            createDom: function () {
                var self = this,
                    wrap,
                    prefixCls = self.get('prefixCls'),
                    textarea = self.get('textarea'),
                    editorEl;

                if (!textarea) {
                    // data 只有在非 srcNode 模式下设置有效
                    var data = self.get('data');
                    self.set('textarea',
                        textarea = $('<textarea class="' + prefixCls +
                            '-editor-textarea"></textarea>'));
                    textarea.val(data);
                } else {
                    self.set('textarea', textarea = $(textarea));
                    // in ie, textarea lose value when parent.innerHTML='xx';
                    if (textarea[0].parentNode) {
                        textarea.remove();
                    }
                }

                editorEl = self.get('el');

                editorEl.html(S.substitute(EDITOR_TPL, {
                    prefixCls: prefixCls
                }));

                wrap = editorEl.one(S.substitute(KE_TEXTAREA_WRAP_CLASS, {
                    prefixCls: prefixCls
                }));

                self._UUID = S.guid();

                self.set({
                    toolBarEl: editorEl.one(S.substitute(KE_TOOLBAR_CLASS, {
                        prefixCls: prefixCls
                    })),
                    statusBarEl: editorEl.one(S.substitute(KE_STATUSBAR_CLASS, {
                        prefixCls: prefixCls
                    }))
                }, {
                    silent: 1
                });

                // 标准浏览器编辑器内焦点不失去,firefox?
                // 标准浏览器实际上不需要！range在iframe内保存着呢，选择高亮变灰而已
                // 2011-11-19 启用封装 preventFocus
                // 点击工具栏内任何东西都不会使得焦点转移
                // 支持 select 键盘 : 2012-03-16
                // Utils.preventFocus(self.toolBarEl);

                textarea.css(WIDTH, '100%');
                textarea.css(DISPLAY, NONE);

                wrap.append(textarea);

                // 实例集中管理
                focusManager.register(self);
            },
            // 在插件运行前,运行核心兼容
            renderUI: function () {
                var self = this;
                clipboard.init(self);
                enterKey.init(self);
                htmlDataProcessor.init(self);
                selectionFix.init(self);
            },

            bindUI: function () {
                var self = this,
                    form,
                    prefixCls = self.get('prefixCls'),
                    textarea = self.get('textarea');

                if (self.get('attachForm') && (form = textarea[0].form)) {
                    Event.on(form, 'submit', self.sync, self);
                }

                function docReady() {
                    self.detach('docReady', docReady);
                    // 是否自动focus
                    if (self.get('focused')) {
                        self.focus();
                    }
                    //否则清空选择区域
                    else {
                        var sel = self.getSelection();
                        sel && sel.removeAllRanges();
                    }
                }

                self.on('docReady', docReady);

                self.on('blur', function () {
                    self.get('el').removeClass(prefixCls + 'editor-focused');
                });

                self.on('focus', function () {
                    self.get('el').addClass(prefixCls + 'editor-focused');
                });
            },

            /**
             * Synchronize textarea value with editor data.
             */
            syncUI: function () {
                var self = this;
                if (self.get('rendered')) {
                    self.get('textarea').val(self.get('data'));
                }
            },

            /**
             * 高度不在 el 上设置，设置 iframeWrap 以及 textarea（for ie）.
             * width 依然在 el 上设置
             */
            _onSetHeight: function (v) {
                var self = this,
                    textareaEl = self.get('textarea'),
                    toolBarEl = self.get("toolBarEl"),
                    statusBarEl = self.get("statusBarEl");
                v = parseInt(v, 10);
                // 减去顶部和底部工具条高度
                v -= (toolBarEl && toolBarEl.outerHeight() || 0) +
                    (statusBarEl && statusBarEl.outerHeight() || 0);
                textareaEl.parent().css(HEIGHT, v);
                textareaEl.css(HEIGHT, v);
            },

            _onSetMode: function (v) {
                var self = this,
                    rendered = self.get("rendered"),
                    iframe = self.get('iframe'),
                    textarea = self.get('textarea');
                if (v == WYSIWYG_MODE) {
                    self._setData(textarea.val());
                    textarea.hide();
                    self.fire("wysiwygMode");
                } else {
                    // 刚开始就配置 mode 为 sourcecode
                    if (iframe) {
                        textarea.val(self._getData(1, WYSIWYG_MODE));
                        iframe.hide();
                    }
                    textarea.show();
                    self.fire("sourceMode");
                }
            },

            // 覆盖 controller
            _onSetFocused: function (v) {
                var self = this;
                // docReady 后才能调用
                if (v && self.__docReady) {
                    self.focus();
                }
            },

            '_onSetData': function (v) {
                // 首次，交由 _onSetMode 调用
                if (this.get('rendered')) {
                    this._setData(v);
                }
            },

            destructor: function () {
                var self = this,
                    form,
                    textarea = self.get('textarea'),
                    doc = self.get('document')[0],
                    win = self.get('window');

                if (self.get('attachForm') && (form = textarea[0].form)) {
                    Event.detach(form, "submit", self.sync, self);
                }

                focusManager.remove(self);

                Event.remove([doc, doc.documentElement, doc.body, win[0]]);

                S.each(self.__controls, function (control) {
                    if (control.destroy) {
                        control.destroy();
                    }
                });

                self.__commands = {};
                self.__controls = {};
            },

            /**
             * Retrieve control by id.
             */
            getControl: function (id) {
                return this.__controls[id];
            },

            /**
             * Retrieve all controls.
             * @return {*}
             */
            getControls: function () {
                return this.__controls;
            },

            /**
             * Register a control to editor by id.
             * @private
             */
            addControl: function (id, control) {
                this.__controls[id] = control;
            },

            /**
             * Show dialog
             * @param {String} name Dialog name
             * @param args Arguments passed to show
             */
            showDialog: function (name, args) {
                name += '/dialog';
                var self = this,
                    d = self.__controls[name];
                d.show(args);
                self.fire('dialogShow', {
                    dialog: d.dialog,
                    "pluginDialog": d,
                    "dialogName": name
                });
            },

            /**
             * Add a command object to current editor.
             * @param name {string} Command name.
             * @param obj {Object} Command object.
             */
            addCommand: function (name, obj) {
                this.__commands[name] = obj;
            },

            /**
             * Whether current editor has specified command instance.
             * @param name {string}
             */
            hasCommand: function (name) {
                return this.__commands[name];
            },

            /**
             * Whether current editor has specified command.
             * Refer: https://developer.mozilla.org/en/Rich-Text_Editing_in_Mozilla
             * @param name {string} Command name.
             */
            execCommand: function (name) {
                var self = this,
                    cmd = self.__commands[name],
                    args = S.makeArray(arguments);
                args.shift();
                args.unshift(self);
                if (cmd) {
                    return cmd.exec.apply(cmd, args);
                } else {
                    S.log(name + ': command not found');
                    return undefined;
                }
            },

            /**
             * Return editor's value corresponding to command name.
             * @param {String} name Command name.
             * @return {*}
             */
            queryCommandValue: function (name) {
                return this.execCommand(Utils.getQueryCmd(name));
            },

            _getData: function (format, mode) {
                var self = this,
                    htmlDataProcessor = self.htmlDataProcessor,
                    html;
                if (!self.get('rendered')) {
                    return undefined;
                }
                if (mode == undefined) {
                    mode = self.get('mode');
                }
                if (mode == WYSIWYG_MODE && self.isDocReady()) {
                    html = self.get('document')[0].body.innerHTML;
                } else {
                    html = htmlDataProcessor.toDataFormat(self.get('textarea').val());
                }
                //如果不需要要格式化，例如提交数据给服务器
                if (format) {
                    html = htmlDataProcessor.toHTML(html);
                } else {
                    html = htmlDataProcessor.toServer(html);
                }
                html = S.trim(html);
                /*
                 如果内容为空，对 parser 自动加的空行滤掉
                 */
                if (EMPTY_CONTENT_REG.test(html)) {
                    html = '';
                }
                return html;
            },

            _setData: function (data) {
                var self = this,
                    htmlDataProcessor,
                    afterData = data;
                if (self.get('mode') != WYSIWYG_MODE) {
                    // 代码模式下不需过滤
                    self.get('textarea').val(data);
                    return;
                }
                if (htmlDataProcessor = self.htmlDataProcessor) {
                    afterData = htmlDataProcessor.toDataFormat(data);
                }
                // https://github.com/kissyteam/kissy-editor/issues/17, 重建最保险
                clearIframeDocContent(self);
                createIframe(self, afterData);
            },

            /**
             * Get full html content of editor 's iframe.
             */
            getDocHTML: function () {
                var self = this;
                return prepareIFrameHTML(0, self.get('customStyle'),
                    self.get('customLink'), self.get('formatData'));
            },

            /**
             * @deprecated
             */
            'getDocHtml': function () {
                return this.getDocHTML();
            },

            /**
             * Get selection instance of current editor.
             */
            getSelection: function () {
                return Editor.Selection.getSelection(this.get('document')[0]);
            },

            /**
             * Get selected html content of current editor
             * @return {undefined|String}
             */
            'getSelectedHTML': function () {
                var self = this,
                    range = self.getSelection().getRanges()[0],
                    contents,
                    html;
                if (range) {
                    contents = range.cloneContents();
                    html = self.get('document')[0].createElement('div');
                    html.appendChild(contents);
                    html = html.innerHTML;
                }
                return html;
            },

            /**
             * Make current editor has focus
             */
            focus: function () {
                var self = this, win = self.get('window');
                // 刚开始就配置 mode 为 sourcecode
                if (!win) {
                    return;
                }
                var doc = self.get('document')[0];
                win = win[0];
                // firefox7 need this
                if (!UA['ie']) {
                    // note : 2011-11-17 report by 石霸
                    // ie 的 parent 不能 focus ，否则会使得 iframe 内的编辑器光标回到开头
                    win && win.parent && win.parent.focus();
                }
                // yiminghe note:webkit need win.focus
                // firefox 7 needs also?
                win && win.focus();
                // ie and firefox need body focus
                try {
                    doc.body.focus();
                } catch (e) {

                }
                self.notifySelectionChange();
            },

            /**
             * Make current editor lose focus
             */
            blur: function () {
                var self = this,
                    win = self.get('window')[0];
                win.blur();
                self.get('document')[0].body.blur();
            },

            /**
             * Add style text to current editor
             * @param {String} cssText
             * @param {String} id
             */
            addCustomStyle: function (cssText, id) {
                var self = this,
                    win = self.get('window'),
                    customStyle = self.get('customStyle') || '';
                customStyle += "\n" + cssText;
                self.set('customStyle', customStyle);
                if (win) {
                    DOM.addStyleSheet(win, cssText, id);
                }
            },

            /**
             * Remove style text with specified id from current editor
             * @param id
             */
            removeCustomStyle: function (id) {
                DOM.remove(DOM.get('#' + id, this.get('window')[0]));
            },

            /**
             * Add css link to current editor
             * @param {String} link
             */
            addCustomLink: function (link) {
                var self = this,
                    customLink = self.get('customLink') || [],
                    doc = self.get('document')[0];
                customLink.push(link);
                self.set('customLink', customLink);
                var elem = doc.createElement('link');
                elem.rel = 'stylesheet';
                doc.getElementsByTagName('head')[0].appendChild(elem);
                elem.href = link;
            },

            /**
             * Remove css link from current editor.
             * @param {String} link
             */
            removeCustomLink: function (link) {
                var self = this,
                    doc = self.get('document')[0],
                    links = DOM.query('link', doc);
                for (var i = 0; i < links.length; i++) {
                    if (DOM.attr(links[i], 'href') == link) {
                        DOM.remove(links[i]);
                    }
                }
                var cls = self.get('customLink') || [],
                    ind = S.indexOf(link, cls);
                if (ind != -1) {
                    cls.splice(ind, 1);
                }
            },

            /**
             * Add callback which will called when editor document is ready
             * (fire when editor is renderer from textarea/source)
             * @param {Function} func
             */
            docReady: function (func) {
                var self = this;
                self.on('docReady', func);
                if (self.__docReady) {
                    func.call(self);
                }
            },

            isDocReady: function () {
                return  this.__docReady;
            },

            /**
             * Check whether selection has changed since last check point.
             */
            checkSelectionChange: function () {
                var self = this;
                if (self.__checkSelectionChangeId) {
                    clearTimeout(self.__checkSelectionChangeId);
                }

                self.__checkSelectionChangeId = setTimeout(function () {
                    var selection = self.getSelection();
                    if (selection && !selection.isInvalid) {
                        var startElement = selection.getStartElement(),
                            currentPath = new Editor.ElementPath(startElement);
                        if (!self.__previousPath || !self.__previousPath.compare(currentPath)) {
                            self.__previousPath = currentPath;
                            self.fire('selectionChange', {
                                selection: selection,
                                path: currentPath,
                                element: startElement
                            });
                        }
                    }
                }, 100);
            },

            /**
             * Fire selectionChange manually.
             */
            notifySelectionChange: function () {
                var self = this;
                self.__previousPath = NULL;
                self.checkSelectionChange();
            },

            /**
             * Insert a element into current editor.
             * @param {KISSY.NodeList} element
             */
            insertElement: function (element) {
                var self = this;

                if (self.get('mode') !== WYSIWYG_MODE) {
                    return undefined;
                }

                self.focus();

                var clone,
                    elementName = element['nodeName'](),
                    xhtml_dtd = Editor.XHTML_DTD,
                    isBlock = xhtml_dtd['$block'][ elementName ],
                    KER = Editor.RANGE,
                    selection = self.getSelection(),
                    ranges = selection && selection.getRanges(),
                    range,
                    notWhitespaceEval,
                    i,
                    next,
                    nextName,
                    lastElement;

                if (!ranges || ranges.length == 0) {
                    return undefined;
                }

                self.execCommand('save');

                for (i = ranges.length - 1; i >= 0; i--) {
                    range = ranges[ i ];
                    // Remove the original contents.

                    clone = !i && element || element['clone'](TRUE);
                    range.insertNodeByDtd(clone);
                    // Save the last element reference so we can make the
                    // selection later.
                    if (!lastElement) {
                        lastElement = clone;
                    }
                }

                if (!lastElement) {
                    return undefined;
                }

                range.moveToPosition(lastElement, KER.POSITION_AFTER_END);
                // If we're inserting a block element immediately followed by
                // another block element, the selection must move there. (#3100,#5436)
                if (isBlock) {
                    notWhitespaceEval = Editor.Walker.whitespaces(true);
                    next = lastElement.next(notWhitespaceEval, 1);
                    nextName = next && next[0].nodeType == NodeType.ELEMENT_NODE
                        && next.nodeName();
                    // Check if it's a block element that accepts text.
                    if (nextName &&
                        xhtml_dtd.$block[ nextName ] &&
                        xhtml_dtd[ nextName ]['#text']) {
                        range.moveToElementEditablePosition(next);
                    }
                }
                selection.selectRanges([ range ]);
                self.focus();
                // http://code.google.com/p/kissy/issues/detail?can=1&start=100&id=121
                // only tag can scroll
                if (clone && clone[0].nodeType == 1) {
                    clone.scrollIntoView(undefined, {
                        alignWithTop: false,
                        allowHorizontalScroll: true,
                        onlyScrollIfNeeded: true
                    });
                }
                saveLater.call(self);
                return clone;
            },

            /**
             * insert html string into current editor.
             * @param {String} data
             * @param [dataFilter]
             */
            insertHTML: function (data, dataFilter) {
                var self = this,
                    htmlDataProcessor,
                    editorDoc = self.get('document')[0];

                if (self.get('mode') !== WYSIWYG_MODE) {
                    return;
                }

                if (htmlDataProcessor = self.htmlDataProcessor) {
                    data = htmlDataProcessor.toDataFormat(data, dataFilter);
                }

                self.focus();
                self.execCommand('save');

                // ie9 仍然需要这样！
                // ie9 标准 selection 有问题，连续插入不能定位光标到插入内容后面
                if (IS_IE) {
                    var $sel = editorDoc.selection;
                    if ($sel.type == 'Control') {
                        $sel.clear();
                    }
                    try {
                        $sel.createRange().pasteHTML(data);
                    } catch (e) {
                        S.log('insertHTML error in ie');
                    }
                } else {
                    // ie9 仍然没有
                    // 1.webkit insert html 有问题！会把标签去掉，算了直接用 insertElement.
                    // 10.0 修复？？
                    // firefox 初始编辑器无焦点报异常
                    try {
                        editorDoc.execCommand('inserthtml', FALSE, data);
                    } catch (e) {
                        setTimeout(function () {
                            // still not ok in ff!
                            // 手动选择 body 的第一个节点
                            if (self.getSelection().getRanges().length == 0) {
                                var r = new Editor.Range(editorDoc),
                                    node = DOM.first(editorDoc.body, function (el) {
                                        return el.nodeType == 1 && DOM.nodeName(el) != 'br';
                                    });
                                if (!node) {
                                    node = new Node(editorDoc.createElement('p'));
                                    node._4e_appendBogus(undefined);
                                    editorDoc.body.appendChild(node[0]);
                                }
                                r.setStartAt(node, Editor.RANGE.POSITION_AFTER_START);
                                r.select();
                            }
                            editorDoc.execCommand('inserthtml', FALSE, data);
                        }, 50);
                    }
                }
                // bug by zjw2004112@163.com :
                // 有的浏览器 ： chrome , ie67 貌似不会自动滚动到粘贴后的位置
                setTimeout(function () {
                    self.getSelection().scrollIntoView();
                }, 50);
                saveLater.call(self);
            },

            /**
             * @deprecated
             */
            'insertHtml': function (a, b) {
                this.insertHTML(a, b);
            }
        });

    /**
     * 初始化iframe内容以及浏览器间兼容性处理，
     * 必须等待iframe内的脚本向父窗口通知
     *
     * @param id {string}
     */
    Editor["_initIFrame"] = function (id) {

        var self = focusManager.getInstance(id),
            doc = self.get('document')[0],
        // Remove bootstrap script from the DOM.
            script = doc.getElementById('ke_active_script');

        DOM.remove(script);

        fixByBindIframeDoc(self);

        var body = doc.body;

        /**
         * from kissy editor 1.0
         *
         * // 注1：在 tinymce 里，designMode = "on" 放在 try catch 里。
         //     原因是在 firefox 下，当iframe 在 display: none 的容器里，会导致错误。
         //     但经过我测试，firefox 3+ 以上已无此现象。
         // 注2： ie 用 contentEditable = true.
         //     原因是在 ie 下，IE needs to use contentEditable or
         // it will display non secure items for HTTPS
         // Ref:
         //   - Differences between designMode and contentEditable
         //     http://74.125.153.132/search?q=cache:5LveNs1yHyMJ:nagoon97.wordpress.com/2008/04/20/differences-between-designmode-and-contenteditable/+ie+contentEditable+designMode+different&cd=6&hl=en&ct=clnk
         */

        // 这里对主流浏览器全部使用 contenteditable
        // 那么不同于 kissy editor 1.0
        // 在body范围外右键，不会出现 复制，粘贴等菜单
        // 因为这时右键作用在document而不是body
        // 1.0 document.designMode='on' 是编辑模式
        // 2.0 body.contentEditable=true body外不是编辑模式
        if (IS_IE) {
            // Don't display the focus border.
            body['hideFocus'] = TRUE;
            // Disable and re-enable the body to avoid IE from
            // taking the editing focus at startup. (#141 / #523)
            body.disabled = TRUE;
            body['contentEditable'] = TRUE;
            body.removeAttribute('disabled');
        } else {
            // Avoid opening design mode in a frame window thread,
            // which will cause host page scrolling.(#4397)
            setTimeout(function () {
                // Prefer 'contentEditable' instead of 'designMode'. (#3593)
                if (UA['gecko'] || UA['opera']) {
                    body['contentEditable'] = TRUE;
                }
                else if (UA['webkit'])
                    body.parentNode['contentEditable'] = TRUE;
                else
                    doc['designMode'] = 'on';
            }, 0);
        }

        // IE standard compliant in editing frame doesn't focus the editor when
        // clicking outside actual content, manually apply the focus. (#1659)

        if (
        // ie6,7 点击滚动条失效
        // IS_IE
        // && doc.compatMode == 'CSS1Compat'
        // wierd ,sometimes ie9 break
        // ||
        // 2012-01-11 ie 处理装移到 selection.js :
        // IE has an issue where you can't select/move the caret by clicking outside the body if the document is in standards mode
        // doc['documentMode']
            UA['gecko']
                || UA['opera']) {
            var htmlElement = doc.documentElement;
            Event.on(htmlElement, 'mousedown', function (evt) {
                // Setting focus directly on editor doesn't work, we
                // have to use here a temporary element to 'redirect'
                // the focus.
                // firefox 不能直接设置，需要先失去焦点
                // return;
                // 左键激活
                var t = evt.target;
                if (t == htmlElement) {
                    //S.log("click");
                    //self.focus();
                    //return;
                    if (UA['gecko']) {
                        blinkCursor(doc, FALSE);
                    }
                    //setTimeout(function() {
                    //这种：html mousedown -> body beforedeactivate
                    //    self.focus();
                    //}, 30);
                    //这种：body beforedeactivate -> html mousedown
                    self.activateGecko();
                }
            });
        }

        // Adds the document body as a context menu target.
        setTimeout(function () {
            /*
             * IE BUG: IE might have rendered the iframe with invisible contents.
             * (#3623). Push some inconsequential CSS style changes to force IE to
             * refresh it.
             *
             * Also, for some unknown reasons, short timeouts (e.g. 100ms) do not
             * fix the problem. :(
             */
            if (IS_IE) {
                setTimeout(function () {
                    if (doc) {
                        body.runtimeStyle['marginBottom'] = '0px';
                        body.runtimeStyle['marginBottom'] = '';
                    }
                }, 1000);
            }
        }, 0);


        setTimeout(function () {
            self.__docReady = 1;
            self.fire('docReady');
            /*
             some break for firefox ，不能立即设置
             */
            var disableObjectResizing = self.get('disableObjectResizing'),
                disableInlineTableEditing = self.get('disableInlineTableEditing');
            if (disableObjectResizing || disableInlineTableEditing) {
                // IE, Opera and Safari may not support it and throw errors.
                try {
                    doc.execCommand('enableObjectResizing', FALSE, !disableObjectResizing);
                    doc.execCommand('enableInlineTableEditing', FALSE, !disableInlineTableEditing);
                }
                catch (e) {
                    // 只能ie能用？，目前只有 firefox,ie 支持图片缩放
                    // For browsers which don't support the above methods,
                    // we can use the the resize event or resizestart for IE (#4208)
                    Event.on(body, IS_IE ? 'resizestart' : 'resize', function (evt) {
                        var t = new Node(evt.target);
                        if (
                            disableObjectResizing ||
                                (
                                    t.nodeName() === 'table'
                                        &&
                                        disableInlineTableEditing )
                            ) {
                            evt.preventDefault();
                        }
                    });
                }
            }
        }, 10);
    };

    // ---------------------------------------------------------------------- start private


    function blinkCursor(doc, retry) {
        var body = doc.body;
        tryThese(
            function () {
                doc['designMode'] = 'on';
                //异步引起时序问题，尽可能小间隔
                setTimeout(function () {
                    doc['designMode'] = 'off';
                    body.focus();
                    // Try it again once..
                    if (!arguments.callee.retry) {
                        arguments.callee.retry = TRUE;
                        //arguments.callee();
                    }
                }, 50);
            },
            function () {
                // The above call is known to fail when parent DOM
                // tree layout changes may break design mode. (#5782)
                // Refresh the 'contentEditable' is a cue to this.
                doc['designMode'] = 'off';
                DOM.attr(body, 'contentEditable', FALSE);
                DOM.attr(body, 'contentEditable', TRUE);
                // Try it again once..
                !retry && blinkCursor(doc, 1);
            }
        );
    }

    function fixByBindIframeDoc(self) {
        var iframe = self.get('iframe'),
            textarea = self.get('textarea')[0],
            win = self.get('window')[0],
            doc = self.get('document')[0];

        // Gecko need a key event to 'wake up' the editing
        // ability when document is empty.(#3864)
        // activateEditing 删掉，初始引起屏幕滚动了
        // Webkit: avoid from editing form control elements content.
        if (UA['webkit']) {
            Event.on(doc, 'click', function (ev) {
                var control = new Node(ev.target);
                if (S.inArray(control.nodeName(), ['input', 'select'])) {
                    ev.preventDefault();
                }
            });
            // Prevent from editing textfield/textarea value.
            Event.on(doc, 'mouseup', function (ev) {
                var control = new Node(ev.target);
                if (S.inArray(control.nodeName(), ['input', 'textarea'])) {
                    ev.preventDefault();
                }
            });
        }


        // Create an invisible element to grab focus.
        if (UA['gecko'] || IS_IE || UA['opera']) {
            var focusGrabber;
            focusGrabber = new Node(
                // Use 'span' instead of anything else to fly under the screen-reader radar. (#5049)
                '<span ' +
                    'tabindex="-1" ' +
                    'style="position:absolute; left:-10000"' +
                    ' role="presentation"' +
                    '></span>').insertAfter(textarea);
            focusGrabber.on('focus', function () {
                self.focus();
            });
            self.activateGecko = function () {
                if (UA['gecko'] && self.__iframeFocus)
                    focusGrabber[0].focus();
            };
            self.on('destroy', function () {
                focusGrabber.detach();
                focusGrabber.remove();
            });
        }


        Event.on(win, 'focus', function () {
            /**
             * yiminghe特别注意：firefox光标丢失bug
             * blink后光标出现在最后，这就需要实现保存range
             * focus后再恢复range
             */
            if (UA['gecko']) {
                blinkCursor(doc, FALSE);
            }
            else if (UA['opera']) {
                doc.body.focus();
            }
            // focus 后强制刷新自己状态
            self.notifySelectionChange();
        });


        if (UA['gecko']) {
            /**
             * firefox 焦点丢失后，再点编辑器区域焦点会移不过来，要点两下
             */
            Event.on(doc, 'mousedown', function () {
                if (!self.__iframeFocus) {
                    blinkCursor(doc, FALSE);
                }
            });
        }

        if (IS_IE) {
            // Override keystrokes which should have deletion behavior
            // on control types in IE . (#4047)
            /**
             * 选择img，出现缩放框后不能直接删除
             */
            Event.on(doc, 'keydown', function (evt) {
                var keyCode = evt.keyCode;
                // Backspace OR Delete.
                if (keyCode in { 8: 1, 46: 1 }) {
                    var sel = self.getSelection(),
                        control = sel.getSelectedElement();
                    if (control) {
                        // Make undo snapshot.
                        self.execCommand('save');
                        // Delete any element that 'hasLayout' (e.g. hr,table) in IE8 will
                        // break up the selection, safely manage it here. (#4795)
                        var bookmark = sel.getRanges()[ 0 ].createBookmark();
                        // Remove the control manually.
                        control.remove();
                        sel.selectBookmarks([ bookmark ]);
                        self.execCommand('save');
                        evt.preventDefault();
                    }
                }
            });

            // PageUp/PageDown scrolling is broken in document
            // with standard doctype, manually fix it. (#4736)
            // ie8 主窗口滚动？？
            if (doc.compatMode == 'CSS1Compat') {
                var pageUpDownKeys = { 33: 1, 34: 1 };
                Event.on(doc, 'keydown', function (evt) {
                    if (evt.keyCode in pageUpDownKeys) {
                        setTimeout(function () {
                            self.getSelection().scrollIntoView();
                        }, 0);
                    }
                });
            }
        }

        // Gecko/Webkit need some help when selecting control type elements. (#3448)
        if (UA['webkit']) {
            Event.on(doc, 'mousedown', function (ev) {
                var control = new Node(ev.target);
                if (S.inArray(control.nodeName(), ['img', 'hr', 'input', 'textarea', 'select'])) {
                    self.getSelection().selectElement(control);
                }
            });
        }


        if (UA['gecko']) {
            Event.on(doc, 'dragstart', function (ev) {
                var control = new Node(ev.target);
                if (control.nodeName() === 'img' && /ke_/.test(control[0].className)) {
                    // firefox禁止拖放
                    ev.preventDefault();
                }
            });
        }
        //注意：必须放在这个位置，等iframe加载好再开始运行
        //加入焦点管理，和其他实例联系起来
        focusManager.add(self);

    }

    function prepareIFrameHTML(id, customStyle, customLink, data) {
        var links = '',
            i,
            innerCssFile = Utils.debugUrl('theme/editor-iframe.css');

        for (i = 0; i < customLink.length; i++) {
            links += S.substitute('<link href="' + '{href}" rel="stylesheet" />', {
                href: customLink[i]
            });
        }

        return S.substitute(IFRAME_HTML_TPL, {
            // kissy-editor #12
            // IE8 doesn't support carets behind images(empty content after image's block)
            // setting ie7 compatible mode would force IE8+ to run in IE7 compat mode.
            doctype: DOC.documentMode === 8 ?
                '<meta http-equiv="X-UA-Compatible" content="IE=7" />' :
                '',
            title: '${title}',
            href: innerCssFile,
            style: customStyle,
            // firefox 必须里面有东西，否则编辑前不能删除!
            data: data || '&nbsp;',
            script: id ?
                // The script that launches the bootstrap logic on 'domReady', so the document
                // is fully editable even before the editing iframe is fully loaded (#4455).
                // 确保iframe确实载入成功,过早的话 document.domain 会出现无法访问
                ('<script id="ke_active_script">' +
                    // ie 特有，即使自己创建的空 iframe 也要设置 domain （如果外层设置了）
                    // 否则下面的 parent.KISSY.Editor._initIFrame 不能执行
                    ( DOM.isCustomDomain() ? ( 'document.domain="' + DOC.domain + '";' ) : '' ) +
                    'parent.KISSY.Editor._initIFrame("' + id + '");' +
                    '</script>') :
                ''
        });
    }

    var saveLater = S.buffer(function () {
        this.execCommand('save');
    }, 50);

    function setUpIFrame(self, data) {
        var iframe = self.get('iframe'),
            html = prepareIFrameHTML(self._UUID,
                self.get('customStyle'),
                self.get('customLink'), data),
            iframeDom = iframe[0],
            win = iframeDom.contentWindow,
            doc;
        iframe.__loaded = 1;
        try {
            // In IE, with custom document.domain, it may happen that
            // the iframe is not yet available, resulting in "Access
            // Denied" for the following property access.
            //ie 设置domain 有问题：yui也有
            //http://yuilibrary.com/projects/yui2/ticket/2052000
            //http://waelchatila.com/2007/10/31/1193851500000.html
            //http://nagoon97.wordpress.com/tag/designmode/
            doc = win.document;
        } catch (e) {
            // Trick to solve this issue, forcing the iframe to get ready
            // by simply setting its "src" property.
            //noinspection SillyAssignmentJS
            iframeDom.src = iframeDom.src;
            // In IE6 though, the above is not enough, so we must pause the
            // execution for a while, giving it time to think.
            if (IS_IE < 7) {
                setTimeout(run, 10);
                return;
            }
        }
        run();
        function run() {
            doc = win.document;
            self.setInternal('document', new Node(doc));
            self.setInternal('window', new Node(win));
            iframe.detach();
            // Don't leave any history log in IE. (#5657)
            doc['open']('text/html', 'replace');
            doc.write(html);
            doc.close();
        }
    }

    function createIframe(self, afterData) {
        // With IE, the custom domain has to be taken care at first,
        // for other browsers, the 'src' attribute should be left empty to
        // trigger iframe 's 'load' event.
        var iframeSrc = DOM.getEmptyIframeSrc() || '';
        if (iframeSrc) {
            iframeSrc = ' src="' + iframeSrc + '" ';
        }
        var iframe = new Node(S.substitute(IFRAME_TPL, {
                iframeSrc: iframeSrc
            })),
            textarea = self.get('textarea');
        if (textarea.hasAttr('tabindex')) {
            iframe.attr('tabindex', UA['webkit'] ? -1 : textarea.attr('tabindex'));
        }
        textarea.parent().prepend(iframe);
        self.set('iframe', iframe);
        self.__docReady = 0;
        // With FF, it's better to load the data on iframe.load. (#3894,#4058)
        if (UA['gecko'] && !iframe.__loaded) {
            iframe.on('load', function () {
                setUpIFrame(self, afterData);
            }, self);
        } else {
            // webkit(chrome) load等不来！
            setUpIFrame(self, afterData);
        }
    }

    function clearIframeDocContent(self) {
        if (!self.get('iframe')) {
            return;
        }
        var iframe = self.get('iframe'),
            win = self.get('window')[0],
            doc = self.get('document')[0],
            documentElement = doc.documentElement,
            body = doc.body;
        Event.remove([doc, documentElement, body, win]);
        iframe.remove();
    }

    // ------------------------------------------------------------------- end private

    return Editor;
}, {
    requires: [
        'editor/core/base',
        'editor/core/utils',
        'editor/core/focusManager',
        'editor/core/styles',
        'editor/core/zIndexManager',
        'editor/core/clipboard',
        'editor/core/enterKey',
        'editor/core/htmlDataProcessor',
        'editor/core/selectionFix'
    ]
});
/**
 * 2012-07-06 yiminghe@gmail.com note ie 的怪异:
 *
 *  -   如果一开始主页面设置了 domain
 *
 *      -   那么自己创建的 iframe src 要设置 getEmptyIframeSrc，
 *          否则 load 后取不到 iframe.contentWindow 的 document.
 *
 *      -   自己创建的 iframe 里面 write 的内容要再次写 document.domain，
 *          否则 iframe 内的脚本不能通知外边编辑器控制层 ready.
 *
 *  -   如果页面中途突然设置了 domain
 *
 *      - iframe 内的 document 仍然还可以被外层 editor 控制层使用.
 *
 *      - iframe 内的 window 的一些属性 (frameElement) 都不能访问了， 但是 focus 还是可以的.
 *
 *  因此 DOM.getEmptyIframeSrc 要用时再取不能缓存.
 *
 *  ie 不能访问 window 的属性（ ie 也不需要，还好 document 是可以的）
 *
 *
 * 2012-03-05 重构 by yiminghe@gmail.com
 *  - core
 *  - plugins
 *
 * refer
 *  - http://html5.org/specs/dom-range.html
 */