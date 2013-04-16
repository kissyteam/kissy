/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:15
*/
/**
 * Set up editor constructor
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/core/base", function (S, HTMLParser, Component) {

    /**
     * @class
     * KISSY Editor.
     * xclass: 'editor'.
     * @extends KISSY.Component.Controller
     * @name Editor
     */
    var Editor = Component.Controller.extend(
        /**
         * @lends Editor#
         */
        {
            initializer: function () {
                var self = this;
                self.__commands = {};
                self.__controls = {};
            }
        },

        {
            Config: {},
            XHTML_DTD: HTMLParser['DTD'],
            ATTRS: /**
             * @lends Editor#
             */
            {
                /**
                 * textarea
                 * @type {KISSY.NodeList}
                 */
                textarea: {},
                /**
                 * iframe
                 * @type {KISSY.NodeList}
                 */
                iframe: {},
                /**
                 * iframe 's contentWindow.
                 * @type {KISSY.NodeList}
                 */
                window: {
                    // ie6 一旦中途设置了 domain
                    // 那么就不能从 document getWindow 获取对应的 window
                    // 所以一开始设置下，和 document 有一定的信息冗余

                },
                /**
                 * iframe 's document
                 * @type {KISSY.NodeList}
                 */
                document: {},
                /**
                 * toolbar element
                 * @type {KISSY.NodeList}
                 */
                toolBarEl: {},
                /**
                 * status bar element
                 * @type {KISSY.NodeList}
                 */
                statusBarEl: {},
                handleMouseEvents: {
                    value: false
                },
                focusable: {
                    value: false
                },
                /**
                 * editor mode.
                 * wysiswyg mode:1
                 * source mode:0
                 * Defaults to: wysiswyg mode
                 */
                mode: {
                    value: 1
                },
                /**
                 * Current editor's content
                 * @type {String}
                 */
                data: {
                    getter: function (v) {
                        var d = this._getData();
                        if (d === undefined) {
                            return v;
                        }
                        return d;
                    }
                },
                /**
                 *  Current editor's format content
                 * @type {String}
                 * @readonly
                 */
                formatData: {
                    getter: function () {
                        return this._getData(1);
                    }
                },

                /**
                 * Custom style for editor.
                 * @type {String}
                 */
                customStyle: {
                    value: ""
                },

                /**
                 * Custom css link url for editor.
                 * @type {String[]}
                 */
                customLink: {
                    value: []
                }
            }
        }, {
            xclass: 'editor'
        });


    Editor.HTML_PARSER = {

        textarea: function (el) {
            return el.one("." + this.get('prefixCls') + "editor-textarea");
        },
        data: function (el) {
            return el.one("." + this.get('prefixCls') + "editor-textarea").val();
        }

    };

    S.mix(Editor, S.EventTarget);

    KISSY.Editor = Editor;

    return Editor;
}, {
    requires: ['htmlparser', 'component/base', 'core']
});/**
 * monitor user's paste key ,clear user input,modified from ckeditor
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/core/clipboard", function (S, Editor, KERange, KES) {
    var $ = S.all,
        UA = S.UA,
        KER = Editor.RANGE,
        Event = S.Event;

    function Paste(editor) {
        var self = this;
        self.editor = editor;
        self._init();
    }

    S.augment(Paste, {
        _init: function () {
            var self = this,
                editor = self.editor,
                editorBody = editor.get("document")[0].body;
            // Event.on(editor.document.body, UA['ie'] ? "beforepaste" : "keydown", self._paste, self);
            // beforepaste not fire on webkit and firefox
            // paste fire too later in ie ,cause error
            // 奇怪哦
            // http://help.dottoro.com/ljxqbxkf.php
            // refer : http://stackoverflow.com/questions/2176861/javascript-get-clipboard-data-on-paste-event-cross-browser
            Event.on(editorBody,
                (UA.ie ? 'beforepaste' : 'paste'),
                self._paste, self);

            // Dismiss the (wrong) 'beforepaste' event fired on context menu open. (#7953)
            // Note: IE Bug: queryCommandEnabled('paste') fires also 'beforepaste(copy/cut)'
            Event.on(editorBody, 'contextmenu', function () {
                depressBeforeEvent = 1;
                setTimeout(function () {
                    depressBeforeEvent = 0;
                }, 10);
            });
            editor.addCommand("copy", new cutCopyCmd("copy"));
            editor.addCommand("cut", new cutCopyCmd("cut"));
            editor.addCommand("paste", new cutCopyCmd("paste"));

        },
        _paste: function (ev) {

            if (depressBeforeEvent) {
                return;
            }

            // ie beforepaste 会触发两次，第一次 pastebin 为锚点内容，奇怪
            // chrome keydown 也会两次


            var self = this,
                editor = self.editor,
                doc = editor.get("document")[0];

            // Avoid recursions on 'paste' event or consequent paste too fast. (#5730)
            if (doc.getElementById('ke_pastebin')) {
                // ie beforepaste 会重复触发
                // chrome keydown 也会重复触发
                // 第一次 bms 是对的，但是 pasterbin 内容是错的
                // 第二次 bms 是错的，但是内容是对的
                // 这样返回刚好，用同一个 pastebin 得到最后的正确内容
                // bms 第一次时创建成功

                return;
            }

            var sel = editor.getSelection(),
                range = new KERange(doc);

            // Create container to paste into
            var pastebin = $(UA['webkit'] ? '<body></body>' :
                // ie6 must use create ...
                doc.createElement('div'), null, doc);
            pastebin.attr('id', 'ke_pastebin');
            // Safari requires a filler node inside the div to have the content pasted into it. (#4882)
            UA['webkit'] && pastebin[0].appendChild(doc.createTextNode('\xa0'));

            doc.body.appendChild(pastebin[0]);

            pastebin.css({
                position: 'absolute',
                // Position the bin exactly at the position of the selected element
                // to avoid any subsequent document scroll.
                top: sel.getStartElement().offset().top + 'px',
                width: '1px',
                height: '1px',
                overflow: 'hidden'
            });

            // It's definitely a better user experience if we make the paste-bin pretty unnoticed
            // by pulling it off the screen.
            pastebin.css('left', '-1000px');

            var bms = sel.createBookmarks();

            // Turn off design mode temporarily before give focus to the paste bin.
            range.setStartAt(pastebin, KER.POSITION_AFTER_START);
            range.setEndAt(pastebin, KER.POSITION_BEFORE_END);
            range.select(true);
            // Wait a while and grab the pasted contents
            setTimeout(function () {

                // Grab the HTML contents.
                // We need to look for a apple style wrapper on webkit it also adds
                // a div wrapper if you copy/paste the body of the editor.
                // Remove hidden div and restore selection.
                var bogusSpan;

                pastebin = ( UA['webkit']
                    && ( bogusSpan = pastebin.first() )
                    && (bogusSpan.hasClass('Apple-style-span') ) ?
                    bogusSpan : pastebin );

                sel.selectBookmarks(bms);

                pastebin.remove();

                var html = pastebin.html();

                //S.log("paster " + html);

                //莫名其妙会有这个东西！，不知道
                //去掉
                if (!( html = S.trim(html.replace(/<span[^>]+_ke_bookmark[^<]*?<\/span>(&nbsp;)*/ig, '')) )) {
                    // ie 第2次触发 beforepaste 会报错！
                    // 第一次 bms 是对的，但是 pasterbin 内容是错的
                    // 第二次 bms 是错的，但是内容是对的
                    return;
                }



                var re = editor.fire("paste", {
                    html: html,
                    holder: pastebin
                });

                if (re !== undefined) {
                    html = re;
                }


                // MS-WORD format sniffing.
                if (/(class="?Mso|style="[^"]*\bmso\-|w:WordDocument)/.test(html)) {
                    // 动态载入 word 过滤规则
                    S.use("editor/plugin/word-filter", function (S, wordFilter) {
                        editor.insertHTML(wordFilter.toDataFormat(html, editor));
                    });
                } else {
                    editor.insertHTML(html);
                }

            }, 0);
        }
    });

    // Tries to execute any of the paste, cut or copy commands in IE. Returns a
    // boolean indicating that the operation succeeded.
    var execIECommand = function (editor, command) {
        var doc = editor.get("document")[0],
            body = $(doc.body);

        var enabled = false;
        var onExec = function () {
            enabled = true;
        };

        // The following seems to be the only reliable way to detect that
        // clipboard commands are enabled in IE. It will fire the
        // onpaste/oncut/oncopy events only if the security settings allowed
        // the command to execute.
        body.on(command, onExec);

        // IE6/7: document.execCommand has problem to paste into positioned element.
        ( UA['ie'] > 7 ? doc : doc.selection.createRange() ) [ 'execCommand' ](command);

        body.detach(command, onExec);

        return enabled;
    };

    // Attempts to execute the Cut and Copy operations.
    var tryToCutCopy = UA['ie'] ?
        function (editor, type) {
            return execIECommand(editor, type);
        }
        : // !IE.
        function (editor, type) {
            try {
                // Other browsers throw an error if the command is disabled.
                return editor.get("document")[0].execCommand(type);
            }
            catch (e) {
                return false;
            }
        };

    var error_types = {
        "cut": "您的浏览器安全设置不允许编辑器自动执行剪切操作，请使用键盘快捷键(Ctrl/Cmd+X)来完成",
        "copy": "您的浏览器安全设置不允许编辑器自动执行复制操作，请使用键盘快捷键(Ctrl/Cmd+C)来完成",
        "paste": "您的浏览器安全设置不允许编辑器自动执行粘贴操作，请使用键盘快捷键(Ctrl/Cmd+V)来完成"
    };

    // A class that represents one of the cut or copy commands.
    var cutCopyCmd = function (type) {
        this.type = type;
    };

    cutCopyCmd.prototype = {
        constructor:cutCopyCmd,
        exec: function (editor) {
            this.type == 'cut' && fixCut(editor);

            var success = tryToCutCopy(editor, this.type);

            if (!success)
                alert(error_types[this.type]);		// Show cutError or copyError.

            return success;
        }
    };

    // Cutting off control type element in IE standards breaks the selection entirely. (#4881)
    function fixCut(editor) {
        if (!UA['ie'] || editor.get("document")[0].compatMode == 'BackCompat')
            return;

        var sel = editor.getSelection();
        var control;
        if (( sel.getType() == KES.SELECTION_ELEMENT ) && ( control = sel.getSelectedElement() )) {
            var range = sel.getRanges()[ 0 ];
            var dummy = $(editor.get("document")[0].createTextNode(''));
            dummy.insertBefore(control);
            range.setStartBefore(dummy);
            range.setEndAfter(control);
            sel.selectRanges([ range ]);

            // Clear up the fix if the paste wasn't succeeded.
            setTimeout(function () {
                // Element still online?
                if (control.parent()) {
                    dummy.remove();
                    sel.selectElement(control);
                }
            }, 0);
        }
    }

    var lang = {
        "copy": "复制",
        "paste": "粘贴",
        "cut": "剪切"
    };

    var depressBeforeEvent;

    return {
        init: function (editor) {
            editor.docReady(function () {
                new Paste(editor);
            });

            var pastes = {"copy": 1, "cut": 1, "paste": 1};

            /**
             * 给所有右键都加入复制粘贴
             */
            editor.on("contextmenu", function (ev) {
                var contextmenu = ev.contextmenu;

                if (contextmenu.__copy_fix) {
                    return;
                }

                contextmenu.__copy_fix = 1;

                for (var i in pastes) {
                    contextmenu.addChild({
                        content: lang[i],
                        value: i
                    });
                }

                contextmenu.on('click', function (e) {
                    var value = e.target.get("value");
                    if (pastes[value]) {
                        this.hide();
                        // 给 ie 一点 hide() 中的事件触发 handler 运行机会，
                        // 原编辑器获得焦点后再进行下步操作
                        setTimeout(function () {
                            editor.execCommand(value);
                        }, 30);
                    }
                });
            });
        }
    };
}, {
    requires: ['./base', './range', './selection']
});
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

    Editor.Mode={
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
 *//**
 * dom utils for kissy editor,mainly from ckeditor
 * @author yiminghe@gmail.com
 */
/*
 Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.html or http://ckeditor.com/license
 */
KISSY.add("editor/core/dom", function (S, Editor, Utils) {

    var TRUE = true,
        undefined = undefined,
        FALSE = false,
        NULL = null,
        xhtml_dtd = Editor.XHTML_DTD,
        DOM = S.DOM,
        NodeType = DOM.NodeType,
        UA = S.UA,
        Node = S.Node,
        REMOVE_EMPTY = {
            "a": 1,
            "abbr": 1,
            "acronym": 1,
            "address": 1,
            "b": 1,
            "bdo": 1,
            "big": 1,
            "cite": 1,
            "code": 1,
            "del": 1,
            "dfn": 1,
            "em": 1,
            "font": 1,
            "i": 1,
            "ins": 1,
            "label": 1,
            "kbd": 1,
            "q": 1,
            "s": 1,
            "samp": 1,
            "small": 1,
            "span": 1,
            "strike": 1,
            "strong": 1,
            "sub": 1,
            "sup": 1,
            "tt": 1,
            "u": 1,
            'var': 1
        };
    /**
     * Enum for node position
     * @enum {number}
     */
    Editor.POSITION = {
        POSITION_IDENTICAL: 0,
        POSITION_DISCONNECTED: 1,
        POSITION_FOLLOWING: 2,
        POSITION_PRECEDING: 4,
        POSITION_IS_CONTAINED: 8,
        POSITION_CONTAINS: 16
    };
    var KEP = Editor.POSITION;

    /*
     * Anything whose display computed style is block, list-item, table,
     * table-row-group, table-header-group, table-footer-group, table-row,
     * table-column-group, table-column, table-cell, table-caption, or whose node
     * name is hr, br (when enterMode is br only) is a block boundary.
     */
    var blockBoundaryDisplayMatch = {
            "block": 1,
            'list-item': 1,
            "table": 1,
            'table-row-group': 1,
            'table-header-group': 1,
            'table-footer-group': 1,
            'table-row': 1,
            'table-column-group': 1,
            'table-column': 1,
            'table-cell': 1,
            'table-caption': 1
        },
        blockBoundaryNodeNameMatch = { "hr": 1 },
        /**
         * @param el {(Node)}
         */
            normalElDom = function (el) {
            return el && (el[0] || el);
        },
        /**
         * @param el {(Node)}
         */
            normalEl = function (el) {
            return new Node(el);
        },
        editorDom = {

            /**
             * Whether two nodes are on the same level.
             * @param el1
             * @param [el2]
             * @return {Boolean}
             * @private
             */
            _4e_sameLevel: function (el1, el2) {
                el2 = normalElDom(el2);
                var e1p = el1.parentNode;
                return e1p && e1p == el2.parentNode;
            },

            /**
             * 是否是块状元素或块状元素边界
             * @param el
             * @param [customNodeNames]
             */
            _4e_isBlockBoundary: function (el, customNodeNames) {
                var nodeNameMatches = S.merge(blockBoundaryNodeNameMatch, customNodeNames);
                return !!(blockBoundaryDisplayMatch[ DOM.css(el, 'display') ] || nodeNameMatches[ DOM.nodeName(el) ]);
            },

            /**
             * 返回当前元素在父元素中所有儿子节点中的序号
             * @param [el]
             * @param [normalized]
             */
            _4e_index: function (el, normalized) {
                var siblings = el.parentNode.childNodes,
                    candidate,
                    currentIndex = -1;

                for (var i = 0; i < siblings.length; i++) {
                    candidate = siblings[i];

                    // 连续的字符串节点合并
                    if (normalized &&
                        candidate.nodeType == 3 &&
                        candidate.previousSibling &&
                        candidate.previousSibling.nodeType == 3) {
                        continue;
                    }

                    currentIndex++;

                    if (candidate === el) {
                        return currentIndex;
                    }
                }
                return -1;
            },

            /**
             * 把 thisElement 移到 target 的前面或后面
             * @param thisElement
             * @param target
             * @param toStart
             */
            _4e_move: function (thisElement, target, toStart) {
                target = normalElDom(target);
                if (toStart) {
                    target.insertBefore(thisElement, target.firstChild);
                } else {
                    target.appendChild(thisElement);
                }
            },

            /**
             * 两个元素是否名称和属性都相同
             * @param thisElement
             * @param otherElement
             */
            _4e_isIdentical: function (thisElement, otherElement) {
                if (!otherElement) {
                    return FALSE;
                }

                otherElement = normalElDom(otherElement);

                if (DOM.nodeName(thisElement) != DOM.nodeName(otherElement)) {
                    return FALSE;
                }

                var thisAttributes = thisElement.attributes,
                    otherAttributes = otherElement.attributes;

                var thisLength = thisAttributes.length,
                    otherLength = otherAttributes.length;

                if (thisLength != otherLength) {
                    return FALSE;
                }

                for (var i = 0; i < thisLength; i++) {
                    var attribute = thisAttributes[i],
                        name = attribute.name;
                    if (attribute.specified &&
                        DOM.attr(thisElement, name) != DOM.attr(otherElement, name)) {
                        return FALSE;
                    }
                }

                // For IE, we have to for both elements, because it's difficult to
                // know how the atttibutes collection is organized in its DOM.
                // ie 使用版本 < 8
                if (Utils.ieEngine < 8) {
                    for (i = 0; i < otherLength; i++) {
                        attribute = otherAttributes[ i ];
                        name = attribute.name;
                        if (attribute.specified &&
                            DOM.attr(thisElement, name) != DOM.attr(otherElement, name)) {
                            return FALSE;
                        }
                    }
                }

                return TRUE;
            },

            /**
             * inline 元素是否没有包含有效文字内容
             * @param thisElement
             */
            _4e_isEmptyInlineRemovable: function (thisElement) {
                if (!xhtml_dtd.$removeEmpty[DOM.nodeName(thisElement)]) {
                    return false;
                }
                var children = thisElement.childNodes;
                for (var i = 0, count = children.length; i < count; i++) {
                    var child = children[i],
                        nodeType = child.nodeType;

                    if (nodeType == NodeType.ELEMENT_NODE &&
                        child.getAttribute('_ke_bookmark')) {
                        continue;
                    }

                    if (nodeType == NodeType.ELEMENT_NODE && !DOM._4e_isEmptyInlineRemovable(child) ||
                        nodeType == DOM.NodeType.TEXT_NODE && S.trim(child.nodeValue)) {
                        return FALSE;
                    }
                }
                return TRUE;
            },

            /**
             * 把 thisElement 的所有儿子节点都插入到 target 节点的前面或后面
             * @param thisElement
             * @param target
             * @param toStart
             */
            _4e_moveChildren: function (thisElement, target, toStart) {
                target = normalElDom(target);

                if (thisElement == target) {
                    return;
                }

                var child;

                if (toStart) {
                    while (child = thisElement.lastChild) {
                        target.insertBefore(thisElement.removeChild(child), target.firstChild);
                    }
                } else {
                    while (child = thisElement.firstChild) {
                        target.appendChild(thisElement.removeChild(child));
                    }
                }
            },

            /**
             * 将当前元素和周围的元素合并
             * @example
             * <code>
             * <b><i>1</i></b><b><i>3</i></b>
             * =>
             * <b><i>13</i></b>
             * </code>
             */
            _4e_mergeSiblings: function (thisElement) {
                thisElement = normalEl(thisElement);
                // 只合并空元素不占用空间的标签
                if (REMOVE_EMPTY[thisElement.nodeName()]) {
                    mergeElements(thisElement, TRUE);
                    mergeElements(thisElement);
                }
            },

            /**
             * 将一个字符串节点拆散为两个字符串节点，并返回最后一个。
             * 如果 offset 为 0，仍然拆成两个！第一个字符串为空文字节点。
             * @param el
             * @param offset
             */
            _4e_splitText: function (el, offset) {
                var doc = el.ownerDocument;

                if (el.nodeType != DOM.NodeType.TEXT_NODE) {
                    return;
                }
                // If the offset is after the last char, IE creates the text node
                // on split, but don't include it into the DOM. So, we have to do
                // that manually here.
                if (UA['ie'] && offset == el.nodeValue.length) {
                    var next = doc.createTextNode("");
                    DOM.insertAfter(next, el);
                    return next;
                }

                var ret = el.splitText(offset);

                // IE BUG: IE8 does not update the childNodes array in DOM after splitText(),
                // we need to make some DOM changes to make it update. (#3436)
                // UA['ie']==8 不对，
                // 判断不出来:UA['ie']==7 && doc.documentMode==7
                // 浏览器模式：当ie8处于兼容视图以及ie7时，UA['ie']==7
                // 文本模式: mode=5 ,mode=7, mode=8
                // ie8 浏览器有问题，而不在于是否哪个模式
                if (!!(doc.documentMode)) {
                    var workaround = doc.createTextNode("");
                    DOM.insertAfter(workaround, ret);
                    DOM.remove(workaround);
                }

                return ret;
            },

            /**
             * 得到该节点的所有附近节点集合（包括自身）
             * @param node
             * @param closerFirst
             */
            _4e_parents: function (node, closerFirst) {
                var parents = [];
                parents.__IS_NODELIST = 1;
                do {
                    parents[  closerFirst ? 'push' : 'unshift' ](node);
                } while (node = node.parentNode);
                return parents;
            },

            /**
             * 得到该节点在前序遍历下的下一个节点
             * @param el
             * @param [startFromSibling]
             * @param [nodeType]
             * @param [guard]
             */
            _4e_nextSourceNode: function (el, startFromSibling, nodeType, guard) {
                // If "guard" is a node, transform it in a function.
                if (guard && !guard.call) {
                    var guardNode = normalElDom(guard);
                    guard = function (node) {
                        return node !== guardNode;
                    };
                }

                var node = !startFromSibling && el.firstChild ,
                    parent = el;

                // Guarding when we're skipping the current element( no children or 'startFromSibling' ).
                // send the 'moving out' signal even we don't actually dive into.
                if (!node) {
                    if (el.nodeType == NodeType.ELEMENT_NODE &&
                        guard && guard(el, TRUE) === FALSE) {
                        return NULL;
                    }
                    node = el.nextSibling;
                }

                while (!node && ( parent = parent.parentNode)) {
                    // The guard check sends the "TRUE" parameter to indicate that
                    // we are moving "out" of the element.
                    if (guard && guard(parent, TRUE) === FALSE) {
                        return NULL;
                    }
                    node = parent.nextSibling;
                }

                if (!node) {
                    return NULL;
                }

                if (guard && guard(node) === FALSE) {
                    return NULL;
                }

                if (nodeType && nodeType != node.nodeType) {
                    return DOM._4e_nextSourceNode(node, FALSE, nodeType, guard);
                }

                return node;
            },

            /**
             * 得到该节点在从右向左前序遍历下的下一个节点( rtl 情况)
             * @param el
             * @param startFromSibling
             * @param nodeType
             * @param guard
             */
            _4e_previousSourceNode: function (el, startFromSibling, nodeType, guard) {
                if (guard && !guard.call) {
                    var guardNode = normalElDom(guard);
                    guard = function (node) {
                        return node !== guardNode;
                    };
                }

                var node = !startFromSibling && el.lastChild,
                    parent = el;

                // Guarding when we're skipping the current element( no children or 'startFromSibling' ).
                // send the 'moving out' signal even we don't actually dive into.
                if (!node) {
                    if (el.nodeType == NodeType.ELEMENT_NODE &&
                        guard && guard(el, TRUE) === FALSE) {
                        return NULL;
                    }
                    node = el.previousSibling;
                }

                while (!node && ( parent = parent.parentNode )) {
                    // The guard check sends the "TRUE" parameter to indicate that
                    // we are moving "out" of the element.
                    if (guard && guard(parent, TRUE) === FALSE)
                        return NULL;
                    node = parent.previousSibling;
                }

                if (!node) {
                    return NULL;
                }

                if (guard && guard(node) === FALSE) {
                    return NULL;
                }

                if (nodeType && node.nodeType != nodeType) {
                    return DOM._4e_previousSourceNode(node, FALSE, nodeType, guard);
                }

                return node;
            },

            /**
             * 得到两个节点的公共祖先节点
             * @param el
             * @param node
             */
            _4e_commonAncestor: function (el, node) {

                node = normalElDom(node);

                if (el === node) {
                    return el;
                }

                if (DOM.contains(node, el)) {
                    return node;
                }

                var start = el;

                do {
                    if (DOM.contains(start, node)) {
                        return start;
                    }
                } while (start = start.parentNode);

                return NULL;
            },

            /**
             * 判断当前元素是否有设置过属性
             */
            _4e_hasAttributes: Utils.ieEngine < 9 ?
                function (el) {
                    var attributes = el.attributes;
                    for (var i = 0; i < attributes.length; i++) {
                        var attribute = attributes[i];
                        switch (attribute.name) {
                            case 'class' :
                                // IE has a strange bug. If calling removeAttribute('className'),
                                // the attributes collection will still contain the "class"
                                // attribute, which will be marked as "specified", even if the
                                // outerHTML of the element is not displaying the class attribute.
                                if (el.getAttribute('class')) {
                                    return TRUE;
                                }
                                break;
                            default :
                                if (attribute.specified) {
                                    return TRUE;
                                }
                        }
                    }
                    return FALSE;
                } : function (el) {
                // 删除firefox自己添加的标志
                if (UA.gecko) {
                    el.removeAttribute("_moz_dirty");
                }
                // 使用原生
                // ie8 莫名其妙多个shape？？specified为false
                return el.hasAttributes();
            },

            /**
             * 得到两个元素的位置关系，参见
             * <a href='https://developer.mozilla.org/en/DOM/Node.compareDocumentPosition'>
             *     compareDocumentPosition
             * </a>
             * 注意：这里的 following 和 preceding 和 mdc 相反！
             * @param el
             * @param otherNode
             */
            _4e_position: function (el, otherNode) {
                var $other = normalElDom(otherNode);

                if (el.compareDocumentPosition) {
                    return el.compareDocumentPosition($other);
                }

                // IE and Safari have no support for compareDocumentPosition.

                if (el == $other) {
                    return KEP.POSITION_IDENTICAL;
                }

                // Only element nodes support contains and sourceIndex.
                if (el.nodeType == NodeType.ELEMENT_NODE &&
                    $other.nodeType == NodeType.ELEMENT_NODE) {
                    if (DOM.contains(el, $other)) {
                        return KEP.POSITION_CONTAINS + KEP.POSITION_PRECEDING;
                    }

                    if (DOM.contains($other, el)) {
                        return KEP.POSITION_IS_CONTAINED + KEP.POSITION_FOLLOWING;
                    }

                    if ('sourceIndex' in el) {
                        return ( el.sourceIndex < 0 || $other.sourceIndex < 0 ) ?
                            KEP.POSITION_DISCONNECTED :
                            ( el.sourceIndex < $other.sourceIndex ) ?
                                KEP.POSITION_PRECEDING :
                                KEP.POSITION_FOLLOWING;
                    }
                }

                // For nodes that don't support compareDocumentPosition, contains
                // or sourceIndex, their "address" is compared.
                var addressOfThis = DOM._4e_address(el),
                    addressOfOther = DOM._4e_address($other),
                    minLevel = Math.min(addressOfThis.length, addressOfOther.length);

                // Determinate preceed/follow relationship.
                for (var i = 0; i <= minLevel - 1; i++) {
                    if (addressOfThis[ i ] != addressOfOther[ i ]) {
                        return addressOfThis[ i ] < addressOfOther[ i ] ?
                            KEP.POSITION_PRECEDING : KEP.POSITION_FOLLOWING;
                    }
                }

                // Determinate contains/contained relationship.
                return ( addressOfThis.length < addressOfOther.length ) ?
                    KEP.POSITION_CONTAINS + KEP.POSITION_PRECEDING :
                    KEP.POSITION_IS_CONTAINED + KEP.POSITION_FOLLOWING;
            },

            /**
             * 得到元素及其所有祖先元素在其兄弟节点中的序号。
             * @param el
             * @param [normalized]
             */
            _4e_address: function (el, normalized) {
                var address = [],
                    $documentElement = el.ownerDocument.documentElement,
                    node = el;

                while (node && node != $documentElement) {
                    address.unshift(DOM._4e_index(node, normalized));
                    node = node.parentNode;
                }

                return address;
            },

            /**
             * 删除一个元素
             * @param el
             * @param preserveChildren 是否保留其子元素（将子元素插入到当前元素之前）
             */
            _4e_remove: function (el, preserveChildren) {
                var parent = el.parentNode;
                if (parent) {
                    if (preserveChildren) {
                        // Move all children before the node.
                        for (var child; child = el.firstChild;) {
                            parent.insertBefore(el.removeChild(child), el);
                        }
                    }
                    parent.removeChild(el);
                }
                return el;
            },

            /**
             * 清除左右空的字符串节点
             * @param el
             */
            _4e_trim: function (el) {
                DOM._4e_ltrim(el);
                DOM._4e_rtrim(el);
            },

            /**
             * 清除左边空的字符串节点
             * @param el
             */
            _4e_ltrim: function (el) {
                var child;
                while (child = el.firstChild) {
                    if (child.nodeType == DOM.NodeType.TEXT_NODE) {
                        var trimmed = Utils.ltrim(child.nodeValue),
                            originalLength = child.nodeValue.length;

                        if (!trimmed) {
                            el.removeChild(child);
                            continue;
                        }
                        else if (trimmed.length < originalLength) {
                            DOM._4e_splitText(child, originalLength - trimmed.length);
                            // IE BUG: child.remove() may raise JavaScript errors here. (#81)
                            el.removeChild(el.firstChild);
                        }
                    }
                    break;
                }
            },

            /**
             * 清除右边空的字符串节点
             * @param el
             */
            _4e_rtrim: function (el) {
                var child;
                while (child = el.lastChild) {
                    if (child.type == DOM.NodeType.TEXT_NODE) {
                        var trimmed = Utils.rtrim(child.nodeValue),
                            originalLength = child.nodeValue.length;
                        if (!trimmed) {
                            el.removeChild(child);
                            continue;
                        } else if (trimmed.length < originalLength) {
                            DOM._4e_splitText(child, trimmed.length);
                            // IE BUG: child.getNext().remove() may raise JavaScript errors here.
                            // (#81)
                            el.removeChild(el.lastChild);
                        }
                    }
                    break;
                }

                if (!UA['ie'] && !UA.opera) {
                    child = el.lastChild;
                    if (child &&
                        child.nodeType == 1 &&
                        DOM.nodeName(child) == 'br') {
                        el.removeChild(child);
                    }
                }
            },

            /**
             * 将一个 bogus 元素添加到元素末尾
             * @param el
             */
            _4e_appendBogus: function (el) {
                var lastChild = el.lastChild, bogus;

                // Ignore empty/spaces text.
                while (lastChild &&
                    lastChild.nodeType == DOM.NodeType.TEXT_NODE &&
                    !S.trim(lastChild.nodeValue)) {
                    lastChild = lastChild.previousSibling;
                }

                if (!lastChild ||
                    lastChild.nodeType == DOM.NodeType.TEXT_NODE ||
                    DOM.nodeName(lastChild) !== 'br') {
                    bogus = UA.opera ?
                        el.ownerDocument.createTextNode('') :
                        el.ownerDocument.createElement('br');
                    if (UA.gecko) {
                        bogus.setAttribute('type', '_moz');
                    }
                    el.appendChild(bogus);
                }
            },

            /**
             * 设置元素的自定义 data 值，并记录
             * @param element
             * @param database
             * @param name
             * @param value
             */
            _4e_setMarker: function (element, database, name, value) {
                element = normalEl(element);
                var id = element.data('list_marker_id') ||
                        ( element.data('list_marker_id', S.guid()).data('list_marker_id')),
                    markerNames = element.data('list_marker_names') ||
                        ( element.data('list_marker_names', {}).data('list_marker_names'));
                database[id] = element;
                markerNames[name] = 1;
                return element.data(name, value);
            },

            /**
             * 清除元素设置的自定义 data 值。
             * @param element
             * @param database
             * @param removeFromDatabase
             */
            _4e_clearMarkers: function (element, database, removeFromDatabase) {
                element = normalEl(element);
                var names = element.data('list_marker_names'),
                    id = element.data('list_marker_id');
                for (var i in names) {
                    element.removeData(i);
                }
                element.removeData('list_marker_names');
                if (removeFromDatabase) {
                    element.removeData('list_marker_id');
                    delete database[id];
                }
            },

            /**
             * 把属性从 target 复制到 el 上.
             * @param el
             * @param target
             * @param skipAttributes
             */
            _4e_copyAttributes: function (el, target, skipAttributes) {
                target = normalEl(target);
                var attributes = el.attributes;
                skipAttributes = skipAttributes || {};

                for (var n = 0; n < attributes.length; n++) {
                    // Lowercase attribute name hard rule is broken for
                    // some attribute on IE, e.g. CHECKED.
                    var attribute = attributes[n],
                        attrName = attribute.name.toLowerCase(),
                        attrValue;

                    // We can set the type only once, so do it with the proper value, not copying it.
                    if (attrName in skipAttributes) {
                        continue;
                    }

                    if (attrName == 'checked' && ( attrValue = DOM.attr(el, attrName) )) {
                        target.attr(attrName, attrValue);
                    }
                    // IE BUG: value attribute is never specified even if it exists.
                    else if (attribute.specified ||
                        ( UA['ie'] && attribute.value && attrName == 'value' )) {
                        attrValue = DOM.attr(el, attrName);
                        if (attrValue === NULL) {
                            attrValue = attribute.nodeValue;
                        }
                        target.attr(attrName, attrValue);
                    }
                }

                // The style:
                if (el.style.cssText !== '') {
                    target[0].style.cssText = el.style.cssText;
                }
            },

            /**
             * 当前元素是否可以被编辑
             * @param el
             */
            _4e_isEditable: function (el) {
                // Get the element DTD (defaults to span for unknown elements).
                var name = DOM.nodeName(el),
                    dtd = !xhtml_dtd.$nonEditable[ name ] &&
                        ( xhtml_dtd[ name ] || xhtml_dtd["span"] );
                // In the DTD # == text node.
                return dtd && dtd['#text'];
            },

            /**
             * 根据dom路径得到某个节点
             * @param doc
             * @param address
             * @param [normalized]
             * @return {KISSY.NodeList}
             */
            _4e_getByAddress: function (doc, address, normalized) {
                var $ = doc.documentElement;

                for (var i = 0; $ && i < address.length; i++) {
                    var target = address[ i ];

                    if (!normalized) {
                        $ = $.childNodes[ target ];
                        continue;
                    }

                    var currentIndex = -1;

                    for (var j = 0; j < $.childNodes.length; j++) {
                        var candidate = $.childNodes[ j ];

                        if (normalized === TRUE &&
                            candidate.nodeType == 3 &&
                            candidate.previousSibling &&
                            candidate.previousSibling.nodeType == 3) {
                            continue;
                        }

                        currentIndex++;

                        if (currentIndex == target) {
                            $ = candidate;
                            break;
                        }
                    }
                }

                return $;
            }
        };


    function mergeElements(element, isNext) {
        var sibling = element[isNext ? "next" : "prev"](undefined, 1);

        if (sibling && sibling[0].nodeType == NodeType.ELEMENT_NODE) {

            // Jumping over bookmark nodes and empty inline elements, e.g. <b><i></i></b>,
            // queuing them to be moved later. (#5567)
            var pendingNodes = [];

            while (sibling.attr('_ke_bookmark') || sibling._4e_isEmptyInlineRemovable(undefined)) {
                pendingNodes.push(sibling);
                sibling = isNext ? sibling.next(undefined, 1) : sibling.prev(undefined, 1);
                if (!sibling) {
                    return;
                }
            }

            if (element._4e_isIdentical(sibling, undefined)) {
                // Save the last child to be checked too, to merge things like
                // <b><i></i></b><b><i></i></b> => <b><i></i></b>
                var innerSibling = new Node(isNext ? element[0].lastChild : element[0].firstChild);

                // Move pending nodes first into the target element.
                while (pendingNodes.length) {
                    pendingNodes.shift()._4e_move(element, !isNext, undefined);
                }

                sibling._4e_moveChildren(element, !isNext, undefined);
                sibling.remove();

                // Now check the last inner child (see two comments above).
                if (innerSibling[0] && innerSibling[0].nodeType == NodeType.ELEMENT_NODE) {
                    innerSibling._4e_mergeSiblings();
                }
            }
        }
    }

    Utils.injectDom(editorDom);
}, {
    requires: ['./base', './utils']
});
/**
 * modified from ckeditor ,dom iterator implementation using walker and nextSourceNode
 * @author yiminghe@gmail.com
 */
/*
 Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.html or http://ckeditor.com/license
 */
KISSY.add("editor/core/domIterator", function (S) {
    var TRUE = true,
        FALSE = false,
        NULL = null,
        Editor = S.Editor,
        UA = S.UA,
        Walker = Editor.Walker,
        KERange = Editor.Range,
        KER = Editor.RANGE,
        ElementPath = Editor.ElementPath,
        Node = S.Node,
        DOM = S.DOM;

    /**
     * @constructor
     * @param range {KISSY.Editor.Range}
     */
    function Iterator(range) {
        if (arguments.length < 1)
            return;
        var self = this;
        self.range = range;
        self.forceBrBreak = FALSE;

        // Whether include <br>s into the enlarged range.(#3730).
        self.enlargeBr = TRUE;
        self.enforceRealBlocks = FALSE;

        self._ || ( self._ = {} );
    }

    var beginWhitespaceRegex = /^[\r\n\t ]*$/;///^[\r\n\t ]+$/,//+:*??不匹配空串

    S.augment(Iterator, {
        //奇怪点：
        //<ul>
        // <li>
        // x
        // </li>
        // <li>
        // y
        // </li>
        // </ul>
        //会返回两次 li,li,而不是一次 ul ，
        // 可能只是返回包含文字的段落概念？
        getNextParagraph:function (blockTag) {
            // The block element to be returned.
            var block, self = this;

            // The range object used to identify the paragraph contents.
            var range;

            // Indicats that the current element in the loop is the last one.
            var isLast;

            // Instructs to cleanup remaining BRs.
            var removePreviousBr, removeLastBr;

            // self is the first iteration. Let's initialize it.
            if (!self._.lastNode) {
                range = self.range.clone();

                // 2010-09-30 shrink
                // 3.4.2 新增，
                // Shrink the range to exclude harmful "noises" (#4087, #4450, #5435).
                range.shrink(KER.SHRINK_ELEMENT, TRUE);

                range.enlarge(self.forceBrBreak || !self.enlargeBr ?
                    KER.ENLARGE_LIST_ITEM_CONTENTS : KER.ENLARGE_BLOCK_CONTENTS);

                var walker = new Walker(range),
                    ignoreBookmarkTextEvaluator = Walker.bookmark(TRUE, TRUE);
                // Avoid anchor inside bookmark inner text.
                walker.evaluator = ignoreBookmarkTextEvaluator;
                self._.nextNode = walker.next();
                // TODO: It's better to have walker.reset() used here.
                walker = new Walker(range);
                walker.evaluator = ignoreBookmarkTextEvaluator;
                var lastNode = walker.previous();
                self._.lastNode = lastNode._4e_nextSourceNode(TRUE);

                // We may have an empty text node at the end of block due to [3770].
                // If that node is the lastNode, it would cause our logic to leak to the
                // next block.(#3887)
                if (self._.lastNode &&
                    self._.lastNode[0].nodeType == DOM.NodeType.TEXT_NODE &&
                    !S.trim(self._.lastNode[0].nodeValue) &&
                    self._.lastNode.parent()._4e_isBlockBoundary()) {
                    var testRange = new KERange(range.document);
                    testRange.moveToPosition(self._.lastNode, KER.POSITION_AFTER_END);
                    if (testRange.checkEndOfBlock()) {
                        var path = new ElementPath(testRange.endContainer);
                        var lastBlock = path.block || path.blockLimit;
                        self._.lastNode = lastBlock._4e_nextSourceNode(TRUE);
                    }
                }

                // Probably the document end is reached, we need a marker node.
                if (!self._.lastNode) {
                    self._.lastNode = self._.docEndMarker = new Node(range.document.createTextNode(''));
                    DOM.insertAfter(self._.lastNode[0], lastNode[0]);
                }

                // Let's reuse self variable.
                range = NULL;
            }

            var currentNode = self._.nextNode;
            lastNode = self._.lastNode;

            self._.nextNode = NULL;
            while (currentNode) {
                // closeRange indicates that a paragraph boundary has been found,
                // so the range can be closed.
                var closeRange = FALSE;

                // includeNode indicates that the current node is good to be part
                // of the range. By default, any non-element node is ok for it.
                var includeNode = ( currentNode[0].nodeType != DOM.NodeType.ELEMENT_NODE ),
                    continueFromSibling = FALSE;

                // If it is an element node, let's check if it can be part of the
                // range.
                if (!includeNode) {
                    var nodeName = currentNode.nodeName();

                    if (currentNode._4e_isBlockBoundary(self.forceBrBreak && { br:1 })) {
                        // <br> boundaries must be part of the range. It will
                        // happen only if ForceBrBreak.
                        if (nodeName == 'br')
                            includeNode = TRUE;
                        else if (!range && !currentNode[0].childNodes.length && nodeName != 'hr') {
                            // If we have found an empty block, and haven't started
                            // the range yet, it means we must return self block.
                            block = currentNode;
                            isLast = currentNode.equals(lastNode);
                            break;
                        }

                        // The range must finish right before the boundary,
                        // including possibly skipped empty spaces. (#1603)
                        if (range) {
                            range.setEndAt(currentNode, KER.POSITION_BEFORE_START);

                            // The found boundary must be set as the next one at self
                            // point. (#1717)
                            if (nodeName != 'br')
                                self._.nextNode = currentNode;
                        }

                        closeRange = TRUE;
                    } else {
                        // If we have child nodes, let's check them.
                        if (currentNode[0].firstChild) {
                            // If we don't have a range yet, let's start it.
                            if (!range) {
                                range = new KERange(self.range.document);
                                range.setStartAt(currentNode, KER.POSITION_BEFORE_START);
                            }

                            currentNode = new Node(currentNode[0].firstChild);
                            continue;
                        }
                        includeNode = TRUE;
                    }
                }
                else if (currentNode[0].nodeType == DOM.NodeType.TEXT_NODE) {
                    // Ignore normal whitespaces (i.e. not including &nbsp; or
                    // other unicode whitespaces) before/after a block node.
                    if (beginWhitespaceRegex.test(currentNode[0].nodeValue))
                        includeNode = FALSE;
                }

                // The current node is good to be part of the range and we are
                // starting a new range, initialize it first.
                if (includeNode && !range) {
                    range = new KERange(self.range.document);
                    range.setStartAt(currentNode, KER.POSITION_BEFORE_START);
                }

                // The last node has been found.
                isLast = ( !closeRange || includeNode ) && currentNode.equals(lastNode);

                // If we are in an element boundary, let's check if it is time
                // to close the range, otherwise we include the parent within it.
                if (range && !closeRange) {
                    while (!currentNode[0].nextSibling && !isLast) {
                        var parentNode = currentNode.parent();

                        if (parentNode._4e_isBlockBoundary(self.forceBrBreak && { br:1 })) {
                            closeRange = TRUE;
                            isLast = isLast || parentNode.equals(lastNode);
                            break;
                        }

                        currentNode = parentNode;
                        includeNode = TRUE;
                        isLast = currentNode.equals(lastNode);
                        continueFromSibling = TRUE;
                    }
                }

                // Now finally include the node.
                if (includeNode)
                    range.setEndAt(currentNode, KER.POSITION_AFTER_END);

                currentNode = currentNode._4e_nextSourceNode(continueFromSibling, NULL, lastNode);
                isLast = !currentNode;

                // We have found a block boundary. Let's close the range and move out of the
                // loop.
                if (isLast || ( closeRange && range ))
                    break;
            }

            // Now, based on the processed range, look for (or create) the block to be returned.
            if (!block) {
                // If no range has been found, self is the end.
                if (!range) {
                    self._.docEndMarker && self._.docEndMarker._4e_remove();
                    self._.nextNode = NULL;
                    return NULL;
                }

                var startPath = new ElementPath(range.startContainer);
                var startBlockLimit = startPath.blockLimit,
                    checkLimits = { div:1, th:1, td:1 };
                block = startPath.block;

                if ((!block || !block[0])
                    && !self.enforceRealBlocks
                    && checkLimits[ startBlockLimit.nodeName() ]
                    && range.checkStartOfBlock()
                    && range.checkEndOfBlock())
                    block = startBlockLimit;
                else if (!block || ( self.enforceRealBlocks && block.nodeName() == 'li' )) {
                    // Create the fixed block.
                    block = new Node(self.range.document.createElement(blockTag || 'p'));
                    // Move the contents of the temporary range to the fixed block.
                    block[0].appendChild(range.extractContents());
                    block._4e_trim();
                    // Insert the fixed block into the DOM.
                    range.insertNode(block);
                    removePreviousBr = removeLastBr = TRUE;
                }
                else if (block.nodeName() != 'li') {
                    // If the range doesn't includes the entire contents of the
                    // block, we must split it, isolating the range in a dedicated
                    // block.
                    if (!range.checkStartOfBlock() || !range.checkEndOfBlock()) {
                        // The resulting block will be a clone of the current one.
                        block = block.clone(FALSE);

                        // Extract the range contents, moving it to the new block.
                        block[0].appendChild(range.extractContents());
                        block._4e_trim();

                        // Split the block. At self point, the range will be in the
                        // right position for our intents.
                        var splitInfo = range.splitBlock();

                        removePreviousBr = !splitInfo.wasStartOfBlock;
                        removeLastBr = !splitInfo.wasEndOfBlock;

                        // Insert the new block into the DOM.
                        range.insertNode(block);
                    }
                }
                else if (!isLast) {
                    // LIs are returned as is, with all their children (due to the
                    // nested lists). But, the next node is the node right after
                    // the current range, which could be an <li> child (nested
                    // lists) or the next sibling <li>.

                    self._.nextNode = ( block.equals(lastNode) ? NULL :
                        range.getBoundaryNodes().endNode._4e_nextSourceNode(TRUE, NULL, lastNode) );
                }
            }

            if (removePreviousBr) {
                var previousSibling = new Node(block[0].previousSibling);
                if (previousSibling[0] && previousSibling[0].nodeType == DOM.NodeType.ELEMENT_NODE) {
                    if (previousSibling.nodeName() == 'br')
                        previousSibling._4e_remove();
                    else if (previousSibling[0].lastChild && DOM.nodeName(previousSibling[0].lastChild) == 'br')
                        DOM._4e_remove(previousSibling[0].lastChild);
                }
            }

            if (removeLastBr) {
                // Ignore bookmark nodes.(#3783)
                var bookmarkGuard = Walker.bookmark(FALSE, TRUE);

                var lastChild = new Node(block[0].lastChild);
                if (lastChild[0] && lastChild[0].nodeType == DOM.NodeType.ELEMENT_NODE && lastChild.nodeName() == 'br') {
                    // Take care not to remove the block expanding <br> in non-IE browsers.
                    if (UA['ie']
                        || lastChild.prev(bookmarkGuard, 1)
                        || lastChild.next(bookmarkGuard, 1))
                        lastChild.remove();
                }
            }

            // Get a reference for the next element. self is important because the
            // above block can be removed or changed, so we can rely on it for the
            // next interation.
            if (!self._.nextNode) {
                self._.nextNode = ( isLast || block.equals(lastNode) ) ? NULL :
                    block._4e_nextSourceNode(TRUE, NULL, lastNode);
            }

            return block;
        }
    });

    KERange.prototype.createIterator = function () {
        return new Iterator(this);
    };

    return Iterator;
}, {
    requires:['./base', './range', './elementPath', './walker']
});
/**
 * modified from ckeditor ,elementPath represents element's tree path from body
 * @author yiminghe@gmail.com
 */
/*
 Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.html or http://ckeditor.com/license
 */
KISSY.add("editor/core/elementPath", function (S) {
    var Editor = S.Editor,
        DOM = S.DOM,
        dtd = Editor.XHTML_DTD,
        TRUE = true,
        FALSE = false,
        NULL = null,
        // Elements that may be considered the "Block boundary" in an element path.
        pathBlockElements = {
            "address":1,
            "blockquote":1,
            "dl":1,
            "h1":1,
            "h2":1,
            "h3":1,
            "h4":1,
            "h5":1,
            "h6":1,
            "p":1,
            "pre":1,
            "li":1,
            "dt":1,
            "dd":1
        },
        // Elements that may be considered the "Block limit" in an element path.
        // 特别注意：不带 p 元素
        pathBlockLimitElements = {
            "body":1,
            "div":1,
            "table":1,
            "tbody":1,
            "tr":1,
            "td":1,
            "th":1,
            "caption":1,
            "form":1
        },
        // Check if an element contains any block element.
        checkHasBlock = function (element) {
            var childNodes = element[0].childNodes;
            for (var i = 0, count = childNodes.length; i < count; i++) {
                var child = childNodes[i];
                if (child.nodeType == DOM.NodeType.ELEMENT_NODE
                    && dtd.$block[ child.nodeName.toLowerCase() ])
                    return TRUE;
            }
            return FALSE;
        };

    /**
     * @constructor
     * @param lastNode {KISSY.NodeList}
     */
    function ElementPath(lastNode) {
        var self = this,
            block = NULL,
            blockLimit = NULL,
            elements = [],
            e = lastNode;

        while (e) {
            if (e[0].nodeType == DOM.NodeType.ELEMENT_NODE) {
                if (!this.lastElement)
                    this.lastElement = e;

                var elementName = e.nodeName();

                if (!blockLimit) {
                    if (!block && pathBlockElements[ elementName ]) {
                        block = e;
                    }
                    if (pathBlockLimitElements[ elementName ]) {
                        // DIV is considered the Block, if no block is available (#525)
                        // and if it doesn't contain other blocks.
                        if (!block && elementName == 'div' && !checkHasBlock(e))
                            block = e;
                        else
                            blockLimit = e;
                    }
                }

                elements.push(e);
                if (elementName == 'body') {
                    break;
                }
            }
            e = e.parent();
        }

        self.block = block;
        self.blockLimit = blockLimit;
        self.elements = elements;
    }

    ElementPath.prototype = {
        constructor:ElementPath,
        /**
         * Compares this element path with another one.
         * @param otherPath ElementPath The elementPath object to be
         * compared with this one.
         * @return {Boolean} "TRUE" if the paths are equal, containing the same
         * number of elements and the same elements in the same order.
         */
        compare:function (otherPath) {
            var thisElements = this.elements;
            var otherElements = otherPath && otherPath.elements;

            if (!otherElements || thisElements.length != otherElements.length)
                return FALSE;

            for (var i = 0; i < thisElements.length; i++) {
                if (!DOM.equals(thisElements[ i ], otherElements[ i ]))
                    return FALSE;
            }

            return TRUE;
        },

        contains:function (tagNames) {
            var elements = this.elements;
            for (var i = 0; i < elements.length; i++) {
                if (elements[ i ].nodeName() in tagNames)
                    return elements[ i ];
            }
            return NULL;
        },
        toString:function () {
            var elements = this.elements, i, elNames = [];
            for (i = 0; i < elements.length; i++) {
                elNames.push(elements[i].nodeName());
            }
            return elNames.toString();
        }
    };
    Editor.ElementPath = ElementPath;

    return ElementPath;
}, {
    requires:['./base', './dom']
});
/**
 * monitor user's enter and shift enter keydown,modified from ckeditor
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/core/enterKey", function (S,Editor,Walker,ElementPath) {
    var UA = S.UA,
        headerTagRegex = /^h[1-6]$/,
        dtd = Editor.XHTML_DTD,
        Node = S.Node,
        Event = S.Event;


    function getRange(editor) {
        // Get the selection ranges.
        var ranges = editor.getSelection().getRanges();
        // Delete the contents of all ranges except the first one.
        for (var i = ranges.length - 1; i > 0; i--) {
            ranges[ i ].deleteContents();
        }
        // Return the first range.
        return ranges[ 0 ];
    }

    function enterBlock(editor) {
        // Get the range for the current selection.
        var range = getRange(editor);
        var doc = range.document;
        // Exit the list when we're inside an empty list item block. (#5376)
        if (range.checkStartOfBlock() && range.checkEndOfBlock()) {
            var path = new ElementPath(range.startContainer),
                block = path.block;
            //只有两层？
            if (block &&
                ( block.nodeName() == 'li' || block.parent().nodeName() == 'li' )

                ) {
                if (editor.hasCommand('outdent')) {
                    editor.execCommand("save");
                    editor.execCommand('outdent');
                    editor.execCommand("save");
                    return true;
                } else {
                    return false;
                }
            }
        }

        // Determine the block element to be used.
        var blockTag = "p";

        // Split the range.
        var splitInfo = range.splitBlock(blockTag);

        if (!splitInfo)
            return true;

        // Get the current blocks.
        var previousBlock = splitInfo.previousBlock,
            nextBlock = splitInfo.nextBlock;

        var isStartOfBlock = splitInfo.wasStartOfBlock,
            isEndOfBlock = splitInfo.wasEndOfBlock;

        var node;

        // If this is a block under a list item, split it as well. (#1647)
        if (nextBlock) {
            node = nextBlock.parent();
            if (node.nodeName() == 'li') {
                nextBlock._4e_breakParent(node);
                nextBlock._4e_move(nextBlock.next(), true);
            }
        }
        else if (previousBlock && ( node = previousBlock.parent() ) && node.nodeName() == 'li') {
            previousBlock._4e_breakParent(node);
            range.moveToElementEditablePosition(previousBlock.next());
            previousBlock._4e_move(previousBlock.prev());
        }

        // If we have both the previous and next blocks, it means that the
        // boundaries were on separated blocks, or none of them where on the
        // block limits (start/end).
        if (!isStartOfBlock && !isEndOfBlock) {
            // If the next block is an <li> with another list tree as the first
            // child, we'll need to append a filler (<br>/NBSP) or the list item
            // wouldn't be editable. (#1420)
            if (nextBlock.nodeName() == 'li' &&
                ( node = nextBlock.first(Walker.invisible(true)) ) &&
                S.inArray(node.nodeName(), ['ul', 'ol']))
                (UA['ie'] ? new Node(doc.createTextNode('\xa0')) :
                    new Node(doc.createElement('br'))).insertBefore(node);

            // Move the selection to the end block.
            if (nextBlock)
                range.moveToElementEditablePosition(nextBlock);
        }
        else {
            var newBlock;

            if (previousBlock) {
                // Do not enter this block if it's a header tag, or we are in
                // a Shift+Enter (#77). Create a new block element instead
                // (later in the code).
                if (previousBlock.nodeName() == 'li' || !headerTagRegex.test(previousBlock.nodeName())) {
                    // Otherwise, duplicate the previous block.
                    newBlock = previousBlock.clone();
                }
            }
            else if (nextBlock)
                newBlock = nextBlock.clone();

            if (!newBlock)
                newBlock = new Node("<" + blockTag + ">", null, doc);

            // Recreate the inline elements tree, which was available
            // before hitting enter, so the same styles will be available in
            // the new block.
            var elementPath = splitInfo.elementPath;
            if (elementPath) {
                for (var i = 0, len = elementPath.elements.length; i < len; i++) {
                    var element = elementPath.elements[ i ];

                    if (element.equals(elementPath.block) || element.equals(elementPath.blockLimit))
                        break;
                    //<li><strong>^</strong></li>
                    if (dtd.$removeEmpty[ element.nodeName() ]) {
                        element = element.clone();
                        newBlock._4e_moveChildren(element);
                        newBlock.append(element);
                    }
                }
            }

            if (!UA['ie'])
                newBlock._4e_appendBogus();

            range.insertNode(newBlock);

            // This is tricky, but to make the new block visible correctly
            // we must select it.
            // The previousBlock check has been included because it may be
            // empty if we have fixed a block-less space (like ENTER into an
            // empty table cell).
            if (UA['ie'] && isStartOfBlock && ( !isEndOfBlock || !previousBlock[0].childNodes.length )) {
                // Move the selection to the new block.
                range.moveToElementEditablePosition(isEndOfBlock ? previousBlock : newBlock);
                range.select();
            }

            // Move the selection to the new block.
            range.moveToElementEditablePosition(isStartOfBlock && !isEndOfBlock ? nextBlock : newBlock);
        }

        if (!UA['ie']) {
            if (nextBlock) {
                // If we have split the block, adds a temporary span at the
                // range position and scroll relatively to it.
                var tmpNode = new Node(doc.createElement('span'));

                // We need some content for Safari.
                tmpNode.html('&nbsp;');

                range.insertNode(tmpNode);
                tmpNode.scrollIntoView(undefined,{
                    alignWithTop:false,
                    allowHorizontalScroll:true,
                    onlyScrollIfNeeded:true
                });
                range.deleteContents();
            }
            else {
                // We may use the above scroll logic for the new block case
                // too, but it gives some weird result with Opera.
                newBlock.scrollIntoView(undefined,{
                    alignWithTop:false,
                    allowHorizontalScroll:true,
                    onlyScrollIfNeeded:true
                });
            }
        }
        range.select();
        return true;
    }

    function EnterKey(editor) {
        var doc = editor.get("document")[0];
        Event.on(doc, "keydown", function (ev) {
            var keyCode = ev.keyCode;
            if (keyCode === 13) {
                if (ev.shiftKey || ev.ctrlKey || ev.metaKey) {
                } else {
                    editor.execCommand("save");
                    var re = editor.execCommand("enterBlock");
                    editor.execCommand("save");
                    if (re !== false) {
                        ev.preventDefault();
                    }
                }
            }
        });
    }

    return {
        init:function (editor) {
            editor.addCommand("enterBlock", {
                exec:enterBlock
            });
            editor.docReady(function () {
                EnterKey(editor);
            });
        }
    };
}, {
    requires:['./base','./walker','./elementPath']
});
/**
 * 多实例的管理，主要是焦点控制，主要是为了
 * 1.firefox 焦点失去 bug，记录当前状态
 * 2.窗口隐藏后能够恢复焦点
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/core/focusManager", function (S) {
    var Editor = S.Editor,
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
            refreshAll: function () {
                for (var i in INSTANCES) {
                    var e = INSTANCES[i], doc = e.get("document")[0];
                    doc.designMode = "off";
                    doc.designMode = "on";
                }
            },
            /**
             * 得到当前获得焦点的实例
             */
            currentInstance: function () {
                return currentInstance;
            },
            /**
             *
             * @param id {string}
             */
            getInstance: function (id) {
                return INSTANCES[id];
            },
            add: function (editor) {
                var win = editor.get("window")[0];
                Event.on(win, "focus", focus, editor);
                Event.on(win, "blur", blur, editor);
            },
            register: function (editor) {
                INSTANCES[editor._UUID] = editor;
            },
            remove: function (editor) {
                delete INSTANCES[editor._UUID];
                var win = editor.get("window")[0];
                Event.remove(win, "focus", focus, editor);
                Event.remove(win, "blur", blur, editor);
            }
        },
        TRUE = true,
        FALSE = false,
        NULL = null;

    function focus() {
        var editor = this;
        editor.__iframeFocus = TRUE;
        currentInstance = editor;
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(function () {
            editor.fire("focus");
        }, 100);
    }

    function blur() {
        var editor = this;
        editor.__iframeFocus = FALSE;
        currentInstance = NULL;
        if (timer) {
            clearTimeout(timer);
        }
        /*
         Note that this functions acts asynchronously with a delay of 100ms to
         avoid subsequent blur/focus effects.
         */
        timer = setTimeout(function () {
            editor.fire("blur");
        }, 100);
    }

    focusManager['refreshAll'] = focusManager.refreshAll;
    Editor.focusManager = focusManager;
    Editor.getInstances = function () {
        return INSTANCES;
    };

    return focusManager;
}, {
    requires: ['./base', './dom']
});
/**
 * Modified from ckeditor. Process malformed html for kissy editor.
 * @author yiminghe@gmail.com
 */
/*
 Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.html or http://ckeditor.com/license
 */
KISSY.add("editor/core/htmlDataProcessor", function (S, Editor) {

    return {
        init: function (editor) {
            var Node = S.Node,
                UA = S.UA,
                HTMLParser = S.require("htmlparser"),
                htmlFilter = new HTMLParser.Filter(),
                dataFilter = new HTMLParser.Filter();

            function filterSpan(element) {
                if (((element.getAttribute('class') + "").match(/Apple-\w+-span/)) || !(element.attributes.length)) {
                    element.setTagName(null);
                    return undefined;
                }
                if (!(element.childNodes.length) && !(element.attributes.length)) {
                    return false;
                }
                return undefined;
            }

            (function () {

                function wrapAsComment(element) {
                    var html = HTMLParser.serialize(element);
                    return new HTMLParser.Comment(protectedSourceMarker +
                        encodeURIComponent(html).replace(/--/g,
                            "%2D%2D"));
                }

                // 过滤外边来的 html
                var defaultDataFilterRules = {
                    tagNames: [
                        [/^\?xml.*$/i, ''],
                        [/^.*namespace.*$/i, '']
                    ],
                    attributeNames: [
                        // Event attributes (onXYZ) must not be directly set. They can become
                        // active in the editing area (IE|WebKit).
                        [/^on/, 'ke_on'],
                        [/^lang$/, '']
                    ],
                    tags: {
                        script: wrapAsComment,
                        noscript: wrapAsComment,
                        span: filterSpan
                    }
                };

                // 将编辑区生成 html 最终化
                var defaultHTMLFilterRules = {
                    tagNames: [
                        // Remove the "ke:" namespace prefix.
                        [ ( /^ke:/ ), '' ],
                        // Ignore <?xml:namespace> tags.
                        [ ( /^\?xml:namespace$/ ), '' ]
                    ],
                    tags: {
                        $: function (element) {
                            var attributes = element.attributes;

                            if (attributes.length) {
                                // 先把真正属性去掉，后面会把 _ke_saved 后缀去掉的！
                                // Remove duplicated attributes - #3789.
                                var attributeNames = [ 'name', 'href', 'src' ],
                                    savedAttributeName;
                                for (var i = 0; i < attributeNames.length; i++) {
                                    savedAttributeName = '_ke_saved_' + attributeNames[ i ];
                                    if (element.getAttribute(savedAttributeName)) {
                                        element.removeAttribute(attributeNames[i]);
                                    }
                                }
                            }

                            return element;
                        },
                        embed: function (element) {
                            var parent = element.parentNode;
                            // If the <embed> is child of a <object>, copy the width
                            // and height attributes from it.
                            if (parent && parent.nodeName == 'object') {
                                var parentWidth = parent.getAttribute("width"),
                                    parentHeight = parent.getAttribute("height");
                                if (parentWidth) {
                                    element.setAttribute("width", parentWidth);
                                }
                                if (parentHeight) {
                                    element.setAttribute("width", parentHeight);
                                }
                            }
                        },

                        // Remove empty link but not empty anchor.(#3829)
                        a: function (element) {
                            if (!(element.childNodes.length) && !(element.attributes.length)) {
                                return false;
                            }
                        },
                        span: filterSpan
                    },
                    attributes: {
                        // 清除空style
                        style: function (v) {
                            if (!S.trim(v)) {
                                return false;
                            }
                        }
                    },
                    attributeNames: [
                        // 把保存的作为真正的属性，替换掉原来的
                        // replace(/^_ke_saved_/,"")
                        // _ke_saved_href -> href
                        [ ( /^_ke_saved_/ ), '' ],
                        [ ( /^ke_on/ ), 'on' ],
                        [ ( /^_ke.*/ ), '' ],
                        [ ( /^ke:.*$/ ), '' ],
                        // kissy 相关
                        [ ( /^_ks.*/ ), '' ]
                    ],
                    text: function (text) {
                        // remove fill char for webkit
                        if (UA.webkit) {
                            return text.replace(/\u200b/g, "");
                        }
                    },
                    comment: function (contents) {
                        // If this is a comment for protected source.
                        if (contents.substr(0, protectedSourceMarker.length) == protectedSourceMarker) {
                            contents = S.trim(S.urlDecode(contents.substr(protectedSourceMarker.length)));
                            return HTMLParser.parse(contents).childNodes[0];
                        }
                    }
                };
                if (UA['ie']) {
                    // IE outputs style attribute in capital letters. We should convert
                    // them back to lower case.
                    // bug: style='background:url(www.G.cn)' =>  style='background:url(www.g.cn)'
                    // 只对 propertyName 小写
                    defaultHTMLFilterRules.attributes.style = function (value // , element
                        ) {
                        return value.replace(/(^|;)([^:]+)/g, function (match) {
                            return match.toLowerCase();
                        });
                    };
                }

                htmlFilter.addRules(defaultHTMLFilterRules);
                dataFilter.addRules(defaultDataFilterRules);
            })();


            /**
             * 去除firefox代码末尾自动添加的 <br/>
             * 以及ie下自动添加的 &nbsp;
             * 以及其他浏览器段落末尾添加的占位符
             */
            (function () {
                // Regex to scan for &nbsp; at the end of blocks, which are actually placeholders.
                // Safari transforms the &nbsp; to \xa0. (#4172)
                var tailNbspRegex = /^[\t\r\n ]*(?:&nbsp;|\xa0)$/;

                // Return the last non-space child node of the block (#4344).
                function lastNoneSpaceChild(block) {
                    var childNodes = block.childNodes,
                        lastIndex = childNodes.length,
                        last = childNodes[ lastIndex - 1 ];
                    while (last && last.nodeType == 3 && !S.trim(last.nodeValue)) {
                        last = childNodes[ --lastIndex ];
                    }
                    return last;
                }

                function trimFillers(block, fromSource) {
                    // If the current node is a block, and if we're converting from source or
                    // we're not in IE then search for and remove any tailing BR node.
                    // Also, any &nbsp; at the end of blocks are fillers, remove them as well.
                    // (#2886)
                    var lastChild = lastNoneSpaceChild(block);
                    if (lastChild) {
                        if (( fromSource || !UA['ie'] ) &&
                            lastChild.nodeType == 1 &&
                            lastChild.nodeName == 'br') {
                            block.removeChild(lastChild);
                        }
                        else if (lastChild.nodeType == 3 &&
                            tailNbspRegex.test(lastChild.nodeValue)) {
                            block.removeChild(lastChild);
                        }
                    }
                }

                function blockNeedsExtension(block) {
                    var lastChild = lastNoneSpaceChild(block);

                    return !lastChild
                        || lastChild.nodeType == 1 &&
                        lastChild.nodeName == 'br'
                        // Some of the controls in form needs extension too,
                        // to move cursor at the end of the form. (#4791)
                        || block.nodeName == 'form' &&
                        lastChild.nodeName == 'input';
                }

                function extendBlockForDisplay(block) {
                    trimFillers(block, true);

                    if (blockNeedsExtension(block)) {
                        // 任何浏览器都要加空格！否则空表格可能间隙太小，不能容下光标
                        if (UA['ie']) {
                            block.appendChild(new HTMLParser.Text('\xa0'));
                        } else {
                            //其他浏览器需要加空格??
                            block.appendChild(new HTMLParser.Text('&nbsp;'));
                            block.appendChild(new HTMLParser.Tag('br'));
                        }
                    }
                }

                function extendBlockForOutput(block) {
                    trimFillers(block, false);
                    if (blockNeedsExtension(block)) {
                        block.appendChild(new HTMLParser.Text('\xa0'));
                    }
                }

                // Find out the list of block-like tags that can contain <br>.
                var dtd = Editor.XHTML_DTD;
                var blockLikeTags = S.merge(
                    dtd.$block,
                    dtd.$listItem,
                    dtd.$tableContent), i;
                for (i in blockLikeTags) {
                    if (!( 'br' in dtd[i] )) {
                        delete blockLikeTags[i];
                    }
                }

                // table 布局需要，不要自动往 td 中加东西
                delete blockLikeTags.td;

                // We just avoid filler in <pre> right now.
                // TODO: Support filler for <pre>, line break is also occupy line height.
                delete blockLikeTags.pre;
                var defaultDataBlockFilterRules = { tags: {} };
                var defaultHTMLBlockFilterRules = { tags: {} };

                for (i in blockLikeTags) {
                    defaultDataBlockFilterRules.tags[ i ] = extendBlockForDisplay;
                    defaultHTMLBlockFilterRules.tags[ i ] = extendBlockForOutput;
                }

                dataFilter.addRules(defaultDataBlockFilterRules);
                htmlFilter.addRules(defaultHTMLBlockFilterRules);
            })();


            // htmlparser fragment 中的 entities 处理
            // el.innerHTML="&nbsp;"
            // http://yiminghe.javaeye.com/blog/788929
            htmlFilter.addRules({
                text: function (text) {
                    return text
                        //.replace(/&nbsp;/g, "\xa0")
                        .replace(/\xa0/g, "&nbsp;");
                }
            });


            var protectElementRegex = /<(a|area|img|input)\b([^>]*)>/gi,
                protectAttributeRegex = /\b(href|src|name)\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|(?:[^ "'>]+))/gi;
            // ie 6-7 会将 关于 url 的 content value 替换为 dom value
            // #a -> http://xxx/#a
            // ../x.html -> http://xx/x.html
            function protectAttributes(html) {
                return html.replace(protectElementRegex, function (element, tag, attributes) {
                    return '<' + tag + attributes.replace(protectAttributeRegex, function (fullAttr, attrName) {
                        // We should not rewrite the existed protected attributes,
                        // e.g. clipboard content from editor. (#5218)
                        if (attributes.indexOf('_ke_saved_' + attrName) == -1) {
                            return ' _ke_saved_' + fullAttr + ' ' + fullAttr;
                        }
                        return fullAttr;
                    }) + '>';
                });
            }

            var protectedSourceMarker = '{ke_protected}';

            var protectElementsRegex = /(?:<textarea[^>]*>[\s\S]*<\/textarea>)|(?:<style[^>]*>[\s\S]*<\/style>)|(?:<(:?link|meta|base)[^>]*>)/gi,
                encodedElementsRegex = /<ke:encoded>([^<]*)<\/ke:encoded>/gi;

            var protectElementNamesRegex = /(<\/?)((?:object|embed|param|html|body|head|title|script|noscript)[^>]*>)/gi,
                unprotectElementNamesRegex = /(<\/?)ke:((?:object|embed|param|html|body|head|title|script|noscript)[^>]*>)/gi;

            var protectSelfClosingRegex = /<ke:(param|embed)([^>]*?)\/?>(?!\s*<\/ke:\1)/gi;

            function protectSelfClosingElements(html) {
                return html.replace(protectSelfClosingRegex, '<ke:$1$2></ke:$1>');
            }

            function protectElements(html) {
                return html.replace(protectElementsRegex, function (match) {
                    return '<ke:encoded>' + encodeURIComponent(match) + '</ke:encoded>';
                });
            }

            function unprotectElements(html) {
                return html.replace(encodedElementsRegex, function (match, encoded) {
                    return S.urlDecode(encoded);
                });
            }

            function protectElementsNames(html) {
                return html.replace(protectElementNamesRegex, '$1ke:$2');
            }

            function unprotectElementNames(html) {
                return html.replace(unprotectElementNamesRegex, '$1$2');
            }

            editor.htmlDataProcessor = {
                dataFilter: dataFilter,
                htmlFilter: htmlFilter,
                // 编辑器 html 到外部 html
                // fixForBody , <body>t</body> => <body><p>t</p></body>
                toHTML: function (html) {
                    // fixForBody = fixForBody || "p";
                    // Now use our parser to make further fixes to the structure, as
                    // well as apply the filter.
                    //使用 htmlWriter 界面美观，加入额外文字节点\n,\t空白等
                    var writer = new HTMLParser.BeautifyWriter(),
                        n = new HTMLParser.Parser(html).parse();
                    n.writeHTML(writer, htmlFilter);
                    html = writer.getHTML();
                    return html;
                },
                // 外部html进入编辑器
                toDataFormat: function (html, _dataFilter) {
                    //可以传 wordFilter 或 dataFilter
                    _dataFilter = _dataFilter || dataFilter;

                    // Protect elements than can't be set inside a DIV. E.g. IE removes
                    // style tags from innerHTML. (#3710)
                    // and protect textarea, in case textarea has un-encoded html
                    html = protectElements(html);

                    html = protectAttributes(html);

                    // Certain elements has problem to go through DOM operation, protect
                    // them by prefixing 'ke' namespace. (#3591)
                    html = protectElementsNames(html);

                    // All none-IE browsers ignore self-closed custom elements,
                    // protecting them into open-close. (#3591)
                    html = protectSelfClosingElements(html);

                    // 标签不合法可能 parser 出错，这里先用浏览器帮我们建立棵合法的 dom 树的 html
                    // Call the browser to help us fixing a possibly invalid HTML
                    // structure.
                    var div = new Node("<div>");
                    // Add fake character to workaround IE comments bug. (#3801)
                    div.html('a' + html);
                    html = div.html().substr(1);

                    // Unprotect "some" of the protected elements at this point.
                    html = unprotectElementNames(html);

                    html = unprotectElements(html);

                    // fixForBody = fixForBody || "p";
                    // bug:qc #3710:使用 basicWriter ，去除无用的文字节点，标签间连续\n空白等

                    var writer = new HTMLParser.BasicWriter(),
                        n = new HTMLParser.Parser(html).parse();

                    n.writeHTML(writer, _dataFilter);

                    html = writer.getHTML();

                    return html;
                },
                /*
                 最精简html传送到server
                 */
                toServer: function (html) {
                    var writer = new HTMLParser.MinifyWriter(),
                        n = new HTMLParser.Parser(html).parse();
                    n.writeHTML(writer, htmlFilter);
                    return writer.getHTML();
                }
            };
        }
    };
}, {
    requires: ['./base']
});

(function(config,Features,UA){
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/back-color': {requires: ['editor','editor/plugin/color/btn']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/back-color/cmd': {requires: ['editor/plugin/color/cmd']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/bold': {requires: ['editor','editor/plugin/font/ui']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/bold/cmd': {requires: ['editor','editor/plugin/font/cmd']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/bubble': {requires: ['overlay','editor']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/button': {requires: ['editor','button']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/checkbox-source-area': {requires: ['editor']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/code': {requires: ['editor','editor/plugin/dialog-loader']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/code/dialog': {requires: ['editor','editor/plugin/dialog','menubutton']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/color/btn': {requires: ['editor','editor/plugin/button','editor/plugin/overlay','editor/plugin/dialog-loader']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/color/cmd': {requires: ['editor']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/color/dialog': {requires: ['editor','editor/plugin/dialog']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/contextmenu': {requires: ['editor','menu','editor/plugin/focus-fix']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/dent-cmd': {requires: ['editor','editor/plugin/list-utils']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/dialog-loader': {requires: ['overlay','editor']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/dialog': {requires: ['editor','overlay','editor/plugin/focus-fix','dd/plugin/constrain','component/plugin/drag']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/draft': {requires: ['editor','editor/plugin/local-storage','overlay','editor/plugin/menubutton']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/drag-upload': {requires: ['editor']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/element-path': {requires: ['editor']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/fake-objects': {requires: ['editor']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/flash-bridge': {requires: ['swf','editor']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/flash-common/base-class': {requires: ['editor','editor/plugin/contextmenu','editor/plugin/bubble','editor/plugin/dialog-loader','editor/plugin/flash-common/utils']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/flash-common/utils': {requires: ['swf']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/flash': {requires: ['editor','editor/plugin/flash-common/base-class','editor/plugin/flash-common/utils','editor/plugin/fake-objects']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/flash/dialog': {requires: ['editor','editor/plugin/flash-common/utils','editor/plugin/dialog','editor/plugin/menubutton']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/focus-fix': {requires: ['editor']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/font-family': {requires: ['editor','editor/plugin/font/ui']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/font-family/cmd': {requires: ['editor','editor/plugin/font/cmd']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/font-size': {requires: ['editor','editor/plugin/font/ui']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/font-size/cmd': {requires: ['editor','editor/plugin/font/cmd']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/font/cmd': {requires: ['editor']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/font/ui': {requires: ['editor','editor/plugin/button','editor/plugin/menubutton']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/fore-color': {requires: ['editor','editor/plugin/color/btn']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/fore-color/cmd': {requires: ['editor/plugin/color/cmd']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/heading': {requires: ['editor']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/heading/cmd': {requires: ['editor']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/image': {requires: ['editor','editor/plugin/button','editor/plugin/bubble','editor/plugin/contextmenu','editor/plugin/dialog-loader']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/image/dialog': {requires: ['io','editor','editor/plugin/dialog','tabs','editor/plugin/menubutton']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/indent': {requires: ['editor']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/indent/cmd': {requires: ['editor','editor/plugin/dent-cmd']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/italic': {requires: ['editor','editor/plugin/font/ui']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/italic/cmd': {requires: ['editor','editor/plugin/font/cmd']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/justify-center': {requires: ['editor']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/justify-center/cmd': {requires: ['editor/plugin/justify-cmd']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/justify-cmd': {requires: ['editor']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/justify-left': {requires: ['editor']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/justify-left/cmd': {requires: ['editor/plugin/justify-cmd']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/justify-right': {requires: ['editor']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/justify-right/cmd': {requires: ['editor/plugin/justify-cmd']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/link': {requires: ['editor','editor/plugin/bubble','editor/plugin/dialog-loader','editor/plugin/button']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/link/dialog': {requires: ['editor','editor/plugin/dialog','editor/plugin/link/utils']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/link/utils': {requires: ['editor']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/list-utils': {requires: ['editor']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/list-utils/btn': {requires: ['editor','editor/plugin/button','editor/plugin/menubutton']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/list-utils/cmd': {requires: ['editor','editor/plugin/list-utils']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/local-storage': {requires: ['editor','overlay','editor/plugin/flash-bridge']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/maximize': {requires: ['editor']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/maximize/cmd': {requires: ['editor']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/menubutton': {requires: ['editor','menubutton']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/multiple-upload': {requires: ['editor','editor/plugin/dialog-loader']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/multiple-upload/dialog': {requires: ['editor','component/plugin/drag','editor/plugin/progressbar','editor/plugin/dialog','editor/plugin/flash-bridge','editor/plugin/local-storage','swf']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/ordered-list': {requires: ['editor','editor/plugin/list-utils/btn']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/ordered-list/cmd': {requires: ['editor','editor/plugin/list-utils/cmd']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/outdent': {requires: ['editor']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/outdent/cmd': {requires: ['editor','editor/plugin/dent-cmd']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/overlay': {requires: ['editor','overlay','editor/plugin/focus-fix']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/page-break': {requires: ['editor','editor/plugin/fake-objects']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/remove-format': {requires: ['editor','editor/plugin/button']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/remove-format/cmd': {requires: ['editor']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/resize': {requires: ['editor','dd/base']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/separator': {requires: ['editor']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/smiley': {requires: ['editor','editor/plugin/overlay']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/source-area': {requires: ['editor','editor/plugin/button']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/strike-through': {requires: ['editor','editor/plugin/font/ui']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/strike-through/cmd': {requires: ['editor','editor/plugin/font/cmd']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/table': {requires: ['editor','editor/plugin/dialog-loader','editor/plugin/contextmenu']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/table/dialog': {requires: ['editor','editor/plugin/dialog','editor/plugin/menubutton']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/underline': {requires: ['editor','editor/plugin/font/ui']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/underline/cmd': {requires: ['editor','editor/plugin/font/cmd']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/undo': {requires: ['editor']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/undo/btn': {requires: ['editor','editor/plugin/button']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/undo/cmd': {requires: ['editor']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/unordered-list': {requires: ['editor','editor/plugin/list-utils/btn']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/unordered-list/cmd': {requires: ['editor','editor/plugin/list-utils/cmd']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/video': {requires: ['editor','editor/plugin/flash-common/utils','editor/plugin/flash-common/base-class','editor/plugin/fake-objects']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/video/dialog': {requires: ['editor','editor/plugin/flash/dialog','editor/plugin/menubutton']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/word-filter': {requires: ['htmlparser']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/xiami-music': {requires: ['editor','editor/plugin/flash-common/base-class','editor/plugin/flash-common/utils','editor/plugin/fake-objects']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor/plugin/xiami-music/dialog': {requires: ['editor','editor/plugin/flash/dialog','editor/plugin/menubutton']}
});

                })(function(c){
                KISSY.config('modules', c);
                },KISSY.Features,KISSY.UA);
            /**
 * Range implementation across browsers for kissy editor. Modified from CKEditor.
 * @author yiminghe@gmail.com
 */
/*
 Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.html or http://ckeditor.com/license
 */
KISSY.add("editor/core/range", function (S, Editor, Utils, Walker, ElementPath) {
    /**
     * Enum for range
     * @enum {number}
     */
    Editor.RANGE = {
        POSITION_AFTER_START:1, // <element>^contents</element>		"^text"
        POSITION_BEFORE_END:2, // <element>contents^</element>		"text^"
        POSITION_BEFORE_START:3, // ^<element>contents</element>		^"text"
        POSITION_AFTER_END:4, // <element>contents</element>^		"text"^
        ENLARGE_ELEMENT:1,
        ENLARGE_BLOCK_CONTENTS:2,
        ENLARGE_LIST_ITEM_CONTENTS:3,
        START:1,
        END:2,
        SHRINK_ELEMENT:1,
        SHRINK_TEXT:2
    };

    var TRUE = true,
        FALSE = false,
        NULL = null,
        KER = Editor.RANGE,
        KEP = Editor.POSITION,
        DOM = S.DOM,
        UA = S.UA,
        dtd = Editor.XHTML_DTD,
        Node = S.Node,
        $ = Node.all,
        EMPTY = {"area":1, "base":1, "br":1, "col":1, "hr":1, "img":1, "input":1, "link":1, "meta":1, "param":1};

    var isWhitespace = new Walker.whitespaces(),
        isBookmark = new Walker.bookmark(),
        isNotWhitespaces = Walker.whitespaces(TRUE),
        isNotBookmarks = Walker.bookmark(false, true);

    var inlineChildReqElements = { "abbr":1, "acronym":1, "b":1, "bdo":1,
        "big":1, "cite":1, "code":1, "del":1, "dfn":1,
        "em":1, "font":1, "i":1, "ins":1, "label":1,
        "kbd":1, "q":1, "samp":1, "small":1, "span":1,
        "strike":1, "strong":1, "sub":1, "sup":1, "tt":1, "u":1, 'var':1 };

    // Evaluator for checkBoundaryOfElement, reject any
    // text node and non-empty elements unless it's being bookmark text.
    function elementBoundaryEval(node) {
        // Reject any text node unless it's being bookmark
        // OR it's spaces. (#3883)
        // 如果不是文本节点并且是空的，可以继续取下一个判断边界
        var c1 = node.nodeType != DOM.NodeType.TEXT_NODE &&
                DOM.nodeName(node) in dtd.$removeEmpty,
        // 文本为空，可以继续取下一个判断边界
            c2 = node.nodeType == DOM.NodeType.TEXT_NODE && !S.trim(node.nodeValue),
        // 恩，进去了书签，可以继续取下一个判断边界
            c3 = !!node.parentNode.getAttribute('_ke_bookmark');
        return c1 || c2 || c3;
    }

    function nonWhitespaceOrIsBookmark(node) {
        // Whitespaces and bookmark nodes are to be ignored.
        return !isWhitespace(node) && !isBookmark(node);
    }

    function getCheckStartEndBlockEvalFunction(isStart) {
        var hadBr = FALSE;
        return function (node) {
            // First ignore bookmark nodes.
            if (isBookmark(node))
                return TRUE;

            if (node.nodeType == DOM.NodeType.TEXT_NODE) {
                // If there's any visible text, then we're not at the start.
                if (S.trim(node.nodeValue).length) {
                    return FALSE;
                }
            } else if (node.nodeType == DOM.NodeType.ELEMENT_NODE) {
                var nodeName = DOM.nodeName(node);
                // If there are non-empty inline elements (e.g. <img />), then we're not
                // at the start.
                if (!inlineChildReqElements[ nodeName ]) {
                    // If we're working at the end-of-block, forgive the first <br /> in non-IE
                    // browsers.
                    if (!isStart && !UA['ie'] && nodeName == 'br' && !hadBr) {
                        hadBr = TRUE;
                    } else {
                        return FALSE;
                    }
                }
            }
            return TRUE;
        };
    }


    /**
     * Extract html content within range.
     * @param {Number} action
     * 0 : delete
     * 1 : extract
     * 2 : clone
     */
    function execContentsAction(self, action) {
        var startNode = self.startContainer,
            endNode = self.endContainer,
            startOffset = self.startOffset,
            endOffset = self.endOffset,
            removeStartNode,
            hasSplitStart = FALSE,
            hasSplitEnd = FALSE,
            t,
            docFrag = undefined,
            doc = self.document,
            removeEndNode;

        if (action > 0) {
            docFrag = doc.createDocumentFragment();
        }

        if (self.collapsed) {
            return docFrag;
        }

        // 将 bookmark 包含在选区内
        self.optimizeBookmark();


        // endNode -> end guard , not included in range

        // For text containers, we must simply split the node and point to the
        // second part. The removal will be handled by the rest of the code .
        //最关键：一般起始都是在文字节点中，得到起点选择右边的文字节点，只对节点处理！
        if (endNode[0].nodeType == DOM.NodeType.TEXT_NODE) {
            hasSplitEnd = TRUE;
            endNode = endNode._4e_splitText(endOffset);
        } else {
            // If the end container has children and the offset is pointing
            // to a child, then we should start from it.
            if (endNode[0].childNodes.length > 0) {
                // If the offset points after the last node.
                if (endOffset >= endNode[0].childNodes.length) {
                    // Let's create a temporary node and mark it for removal.
                    endNode = new Node(
                        endNode[0].appendChild(doc.createTextNode(""))
                    );
                    removeEndNode = TRUE;
                } else {
                    endNode = new Node(endNode[0].childNodes[endOffset]);
                }
            }
        }

        // startNode -> start guard , not included in range

        // For text containers, we must simply split the node. The removal will
        // be handled by the rest of the code .
        if (startNode[0].nodeType == DOM.NodeType.TEXT_NODE) {
            hasSplitStart = TRUE;
            startNode._4e_splitText(startOffset);
        } else {
            // If the start container has children and the offset is pointing
            // to a child, then we should start from its previous sibling.

            // If the offset points to the first node, we don't have a
            // sibling, so let's use the first one, but mark it for removal.
            if (!startOffset) {
                // Let's create a temporary node and mark it for removal.
                t = new Node(doc.createTextNode(""));
                startNode.prepend(t);
                startNode = t;
                removeStartNode = TRUE;
            }
            else if (startOffset >= startNode[0].childNodes.length) {
                // Let's create a temporary node and mark it for removal.
                startNode = new Node(startNode[0]
                    .appendChild(doc.createTextNode('')));
                removeStartNode = TRUE;
            } else
                startNode = new Node(
                    startNode[0].childNodes[startOffset].previousSibling
                );
        }

        // Get the parent nodes tree for the start and end boundaries.
        //从根到自己
        var startParents = startNode._4e_parents(),
            endParents = endNode._4e_parents();

        startParents.each(function (n, i) {
            startParents[i] = n;
        });

        endParents.each(function (n, i) {
            endParents[i] = n;
        });


        // Compare them, to find the top most siblings.
        var i, topStart, topEnd;

        for (i = 0; i < startParents.length; i++) {
            topStart = startParents[ i ];
            topEnd = endParents[ i ];

            // The compared nodes will match until we find the top most
            // siblings (different nodes that have the same parent).
            // "i" will hold the index in the parents array for the top
            // most element.
            if (!topStart.equals(topEnd)) {
                break;
            }
        }

        var clone = docFrag,
            levelStartNode,
            levelClone,
            currentNode,
            currentSibling;

        // Remove all successive sibling nodes for every node in the
        // startParents tree.
        for (var j = i; j < startParents.length; j++) {
            levelStartNode = startParents[j];

            // For Extract and Clone, we must clone this level.
            if (action > 0 && !levelStartNode.equals(startNode)) {
                // action = 0 = Delete
                levelClone = clone.appendChild(levelStartNode.clone()[0]);
            } else {
                levelClone = null;
            }

            // 开始节点的路径所在父节点不能 clone(TRUE)，其他节点（结束节点路径左边的节点）可以直接 clone(true)
            currentNode = levelStartNode[0].nextSibling;

            var endParentJ = endParents[ j ],
                domEndNode = endNode[0],
                domEndParentJ = endParentJ && endParentJ[0];

            while (currentNode) {
                // Stop processing when the current node matches a node in the
                // endParents tree or if it is the endNode.
                if (domEndParentJ == currentNode || domEndNode == currentNode) {
                    break;
                }

                // Cache the next sibling.
                currentSibling = currentNode.nextSibling;

                // If cloning, just clone it.
                if (action == 2) {
                    // 2 = Clone
                    clone.appendChild(currentNode.cloneNode(TRUE));
                } else {
                    // Both Delete and Extract will remove the node.
                    DOM._4e_remove(currentNode);

                    // When Extracting, move the removed node to the docFrag.
                    if (action == 1) {
                        // 1 = Extract
                        clone.appendChild(currentNode);
                    }
                }

                currentNode = currentSibling;
            }
            // 开始节点的路径所在父节点不能 clone(TRUE)，要在后面深入子节点处理
            if (levelClone) {
                clone = levelClone;
            }
        }

        clone = docFrag;

        // Remove all previous sibling nodes for every node in the
        // endParents tree.
        for (var k = i; k < endParents.length; k++) {
            levelStartNode = endParents[ k ];

            // For Extract and Clone, we must clone this level.
            if (action > 0 && !levelStartNode.equals(endNode)) {
                // action = 0 = Delete
                // 浅复制
                levelClone = clone.appendChild(levelStartNode.clone()[0]);
            } else {
                levelClone = null;
            }

            // The processing of siblings may have already been done by the parent.
            if (
                !startParents[ k ] ||
                    // 前面 startParents 循环已经处理过了
                    !levelStartNode._4e_sameLevel(startParents[ k ])
                ) {
                currentNode = levelStartNode[0].previousSibling;
                while (currentNode) {
                    // Cache the next sibling.
                    currentSibling = currentNode.previousSibling;

                    // If cloning, just clone it.
                    if (action == 2) {    // 2 = Clone
                        clone.insertBefore(currentNode.cloneNode(TRUE),
                            clone.firstChild);
                    } else {
                        // Both Delete and Extract will remove the node.
                        DOM._4e_remove(currentNode);

                        // When Extracting, mode the removed node to the docFrag.
                        if (action == 1) {
                            // 1 = Extract
                            clone.insertBefore(currentNode, clone.firstChild);
                        }
                    }

                    currentNode = currentSibling;
                }
            }

            if (levelClone) {
                clone = levelClone;
            }
        }
        // 2 = Clone.
        if (action == 2) {

            // No changes in the DOM should be done, so fix the split text (if any).

            if (hasSplitStart) {
                var startTextNode = startNode[0];
                if (startTextNode.nodeType == DOM.NodeType.TEXT_NODE
                    && startTextNode.nextSibling
                    // careful, next sibling should be text node
                    && startTextNode.nextSibling.nodeType == DOM.NodeType.TEXT_NODE) {
                    startTextNode.data += startTextNode.nextSibling.data;
                    startTextNode.parentNode.removeChild(startTextNode.nextSibling);
                }
            }

            if (hasSplitEnd) {
                var endTextNode = endNode[0];
                if (endTextNode.nodeType == DOM.NodeType.TEXT_NODE &&
                    endTextNode.previousSibling &&
                    endTextNode.previousSibling.nodeType == DOM.NodeType.TEXT_NODE) {
                    endTextNode.previousSibling.data += endTextNode.data;
                    endTextNode.parentNode.removeChild(endTextNode);
                }
            }

        } else {

            // Collapse the range.
            // If a node has been partially selected, collapse the range between
            // topStart and topEnd. Otherwise, simply collapse it to the start.
            // (W3C specs).
            if (
                topStart && topEnd &&
                    (
                        !startNode._4e_sameLevel(topStart)
                            ||
                            !endNode._4e_sameLevel(topEnd)
                        )
                ) {
                var startIndex = topStart._4e_index();

                // If the start node is to be removed, we must correct the
                // index to reflect the removal.
                if (removeStartNode &&
                    // startNode 和 topStart 同级
                    (topStart._4e_sameLevel(startNode))) {
                    startIndex--;
                }

                self.setStart(topStart.parent(), startIndex + 1);
            }

            // Collapse it to the start.
            self.collapse(TRUE);

        }

        // Cleanup any marked node.
        if (removeStartNode) {
            startNode.remove();
        }

        if (removeEndNode) {
            endNode.remove();
        }

        return docFrag;
    }

    function updateCollapsed(self) {
        self.collapsed = (
            self.startContainer &&
                self.endContainer &&
                self.startContainer[0] == self.endContainer[0] &&
                self.startOffset == self.endOffset );
    }


    /**
     * @member Editor
     * @class
     * Range implementation across browsers.
     * @param document {Document}
     * @name Range
     */
    function KERange(document) {
        var self = this;
        self.startContainer = NULL;
        self.startOffset = NULL;
        self.endContainer = NULL;
        self.endOffset = NULL;
        self.collapsed = TRUE;
        self.document = document;
    }

    S.augment(KERange,
        /**
         * @lends Editor.Range
         */
        {

            /**
             * Range string representation.
             */
            toString:function () {
                var s = [],
                    self = this,
                    startContainer = self.startContainer[0],
                    endContainer = self.endContainer[0];
                s.push((startContainer.id || startContainer.nodeName) + ":" + self.startOffset);
                s.push((endContainer.id || endContainer.nodeName) + ":" + self.endOffset);
                return s.join("<br/>");
            },

            /**
             * Transforms the startContainer and endContainer properties from text
             * nodes to element nodes, whenever possible. This is actually possible
             * if either of the boundary containers point to a text node, and its
             * offset is set to zero, or after the last char in the node.
             */
            optimize:function () {
                var self = this,
                    container = self.startContainer,
                    offset = self.startOffset;

                if (container[0].nodeType != DOM.NodeType.ELEMENT_NODE) {
                    if (!offset) {
                        self.setStartBefore(container);
                    } else if (offset >= container[0].nodeValue.length) {
                        self.setStartAfter(container);
                    }
                }

                container = self.endContainer;
                offset = self.endOffset;

                if (container[0].nodeType != DOM.NodeType.ELEMENT_NODE) {
                    if (!offset) {
                        self.setEndBefore(container);
                    } else if (offset >= container[0].nodeValue.length) {
                        self.setEndAfter(container);
                    }
                }
            },

            /**
             * Set range start after node
             * @param {KISSY.NodeList} node
             */
            setStartAfter:function (node) {
                this.setStart(node.parent(), node._4e_index() + 1);
            },
            /**
             * Set range start before node
             * @param {KISSY.NodeList} node
             */
            setStartBefore:function (node) {
                this.setStart(node.parent(), node._4e_index());
            },
            /**
             * Set range end after node
             * @param {KISSY.NodeList} node
             */
            setEndAfter:function (node) {
                this.setEnd(node.parent(), node._4e_index() + 1);
            },
            /**
             * Set range end before node
             * @param {KISSY.NodeList} node
             */
            setEndBefore:function (node) {
                this.setEnd(node.parent(), node._4e_index());
            },

            /**
             * Make edge bookmarks included in current range.
             */
            optimizeBookmark:function () {
                var self = this,
                    startNode = self.startContainer,
                    endNode = self.endContainer;

                if (startNode &&
                    startNode.nodeName() == 'span' &&
                    startNode.attr('_ke_bookmark')) {
                    self.setStartBefore(startNode);
                }
                if (endNode &&
                    endNode.nodeName() == 'span' &&
                    endNode.attr('_ke_bookmark')) {
                    self.setEndAfter(endNode);
                }
            },

            /**
             * Sets the start position of a Range.
             * @param {KISSY.NodeList} startNode The node to start the range.
             * @param {Number} startOffset An integer greater than or equal to zero
             *        representing the offset for the start of the range from the start
             *        of startNode.
             */
            setStart:function (startNode, startOffset) {
                // W3C requires a check for the new position. If it is after the end
                // boundary, the range should be collapsed to the new start. It seams
                // we will not need this check for our use of this class so we can
                // ignore it for now.

                // Fixing invalid range start inside dtd empty elements.
                var self = this;
                if (startNode[0].nodeType == DOM.NodeType.ELEMENT_NODE && EMPTY[ startNode.nodeName() ]) {
                    startNode = startNode.parent();
                    startOffset = startNode._4e_index();
                }

                self.startContainer = startNode;
                self.startOffset = startOffset;

                if (!self.endContainer) {
                    self.endContainer = startNode;
                    self.endOffset = startOffset;
                }

                updateCollapsed(self);
            },

            /**
             * Sets the end position of a Range.
             * @param {KISSY.NodeList} endNode The node to end the range.
             * @param {Number} endOffset An integer greater than or equal to zero
             *        representing the offset for the end of the range from the start
             *        of endNode.
             */
            setEnd:function (endNode, endOffset) {
                // W3C requires a check for the new position. If it is before the start
                // boundary, the range should be collapsed to the new end. It seams we
                // will not need this check for our use of this class so we can ignore
                // it for now.

                // Fixing invalid range end inside dtd empty elements.
                var self = this;
                if (endNode[0].nodeType == DOM.NodeType.ELEMENT_NODE && EMPTY[ endNode.nodeName() ]) {
                    endNode = endNode.parent();
                    endOffset = endNode._4e_index() + 1;
                }

                self.endContainer = endNode;
                self.endOffset = endOffset;

                if (!self.startContainer) {
                    self.startContainer = endNode;
                    self.startOffset = endOffset;
                }

                updateCollapsed(self);
            },

            /**
             * Sets the start position of a Range by specified rules.
             * @param {KISSY.NodeList} node
             * @param {Number} position
             */
            setStartAt:function (node, position) {
                var self = this;
                switch (position) {
                    case KER.POSITION_AFTER_START :
                        self.setStart(node, 0);
                        break;

                    case KER.POSITION_BEFORE_END :
                        if (node[0].nodeType == DOM.NodeType.TEXT_NODE) {
                            self.setStart(node, node[0].nodeValue.length);
                        } else {
                            self.setStart(node, node[0].childNodes.length);
                        }
                        break;

                    case KER.POSITION_BEFORE_START :
                        self.setStartBefore(node);
                        break;

                    case KER.POSITION_AFTER_END :
                        self.setStartAfter(node);
                }

                updateCollapsed(self);
            },

            /**
             * Sets the end position of a Range by specified rules.
             * @param {KISSY.NodeList} node
             * @param {Number} position
             */
            setEndAt:function (node, position) {
                var self = this;
                switch (position) {
                    case KER.POSITION_AFTER_START :
                        self.setEnd(node, 0);
                        break;

                    case KER.POSITION_BEFORE_END :
                        if (node[0].nodeType == DOM.NodeType.TEXT_NODE) {
                            self.setEnd(node, node[0].nodeValue.length);
                        } else {
                            self.setEnd(node, node[0].childNodes.length);
                        }
                        break;

                    case KER.POSITION_BEFORE_START :
                        self.setEndBefore(node);
                        break;

                    case KER.POSITION_AFTER_END :
                        self.setEndAfter(node);
                }

                updateCollapsed(self);
            },

            /**
             * Clone html content within range
             */
            cloneContents:function () {
                return execContentsAction(this, 2);
            },

            /**
             * Remove html content within range
             */
            deleteContents:function () {
                return execContentsAction(this, 0);
            },

            /**
             * Extract html content within range.
             */
            extractContents:function () {
                return execContentsAction(this, 1);
            },

            /**
             * collapse current range
             * @param {Boolean} toStart
             */
            collapse:function (toStart) {
                var self = this;
                if (toStart) {
                    self.endContainer = self.startContainer;
                    self.endOffset = self.startOffset;
                } else {
                    self.startContainer = self.endContainer;
                    self.startOffset = self.endOffset;
                }
                self.collapsed = TRUE;
            },

            /**
             * Clone current range.
             * @return {Editor.Range}
             */
            clone:function () {
                var self = this,
                    clone = new KERange(self.document);

                clone.startContainer = self.startContainer;
                clone.startOffset = self.startOffset;
                clone.endContainer = self.endContainer;
                clone.endOffset = self.endOffset;
                clone.collapsed = self.collapsed;

                return clone;
            },

            /**
             * Get node which is enclosed by range.
             * @example
             * <code>
             * ^&lt;book/&gt;&lt;span/&gt;&lt;book/&gt;^
             * =>
             * ^&lt;span/&gt;^
             * &lt;/code&gt;
             */
            getEnclosedNode:function () {
                var walkerRange = this.clone();

                // Optimize and analyze the range to avoid DOM destructive nature of walker.
                walkerRange.optimize();

                if (walkerRange.startContainer[0].nodeType != DOM.NodeType.ELEMENT_NODE ||
                    walkerRange.endContainer[0].nodeType != DOM.NodeType.ELEMENT_NODE) {
                    return NULL;
                }

                var walker = new Walker(walkerRange),
                    node, pre;

                walker.evaluator = function (node) {
                    return isNotWhitespaces(node) && isNotBookmarks(node);
                };

                //深度优先遍历的第一个元素
                //        x
                //     y     z
                // x->y ,return y
                node = walker.next();
                walker.reset();
                pre = walker.previous();
                //前后相等，则脱一层皮 :)
                return node && node.equals(pre) ? node : NULL;
            },

            /**
             * Shrink range to its innermost element.(make sure text content is unchanged)
             * @param mode
             * @param {Boolean} [selectContents]
             */
            shrink:function (mode, selectContents) {
                // Unable to shrink a collapsed range.
                var self = this;
                if (!self.collapsed) {
                    mode = mode || KER.SHRINK_TEXT;

                    var walkerRange = self.clone(),
                        startContainer = self.startContainer,
                        endContainer = self.endContainer,
                        startOffset = self.startOffset,
                        endOffset = self.endOffset,
                    // Whether the start/end boundary is movable.
                        moveStart = TRUE,
                        currentElement,
                        walker,
                        moveEnd = TRUE;

                    if (startContainer &&
                        startContainer[0].nodeType == DOM.NodeType.TEXT_NODE) {
                        if (!startOffset) {
                            walkerRange.setStartBefore(startContainer);
                        } else if (startOffset >= startContainer[0].nodeValue.length) {
                            walkerRange.setStartAfter(startContainer);
                        } else {
                            // Enlarge the range properly to avoid walker making
                            // DOM changes caused by trimming the text nodes later.
                            walkerRange.setStartBefore(startContainer);
                            moveStart = FALSE;
                        }
                    }

                    if (endContainer &&
                        endContainer[0].nodeType == DOM.NodeType.TEXT_NODE) {
                        if (!endOffset) {
                            walkerRange.setEndBefore(endContainer);
                        } else if (endOffset >= endContainer[0].nodeValue.length) {
                            walkerRange.setEndAfter(endContainer);
                        } else {
                            walkerRange.setEndAfter(endContainer);
                            moveEnd = FALSE;
                        }
                    }

                    if (moveStart || moveEnd) {

                        walker = new Walker(walkerRange);

                        walker.evaluator = function (node) {
                            return node.nodeType == ( mode == KER.SHRINK_ELEMENT ?
                                DOM.NodeType.ELEMENT_NODE : DOM.NodeType.TEXT_NODE );
                        };

                        walker.guard = function (node, movingOut) {
                            // Stop when we're shrink in element mode while encountering a text node.
                            if (mode == KER.SHRINK_ELEMENT &&
                                node.nodeType == DOM.NodeType.TEXT_NODE) {
                                return FALSE;
                            }
                            // Stop when we've already walked "through" an element.
                            if (movingOut && node == currentElement) {
                                return FALSE;
                            }
                            if (!movingOut && node.nodeType == DOM.NodeType.ELEMENT_NODE) {
                                currentElement = node;
                            }
                            return TRUE;
                        };

                    }

                    if (moveStart) {
                        var textStart = walker[mode == KER.SHRINK_ELEMENT ? 'lastForward' : 'next']();
                        if (textStart) {
                            self.setStartAt(textStart, selectContents ? KER.POSITION_AFTER_START : KER.POSITION_BEFORE_START);
                        }
                    }

                    if (moveEnd) {
                        walker.reset();
                        var textEnd = walker[mode == KER.SHRINK_ELEMENT ? 'lastBackward' : 'previous']();
                        if (textEnd) {
                            self.setEndAt(textEnd, selectContents ? KER.POSITION_BEFORE_END : KER.POSITION_AFTER_END);
                        }
                    }

                    return moveStart || moveEnd;
                }
            },

            /**
             * Create virtual bookmark by remeber its position index.
             * @param normalized
             */
            createBookmark2:function (normalized) {

                var self = this,
                    startContainer = self.startContainer,
                    endContainer = self.endContainer,
                    startOffset = self.startOffset,
                    endOffset = self.endOffset,
                    child, previous;

                // If there is no range then get out of here.
                // It happens on initial load in Safari #962 and if the editor it's
                // hidden also in Firefox
                if (!startContainer || !endContainer) {
                    return {
                        start:0,
                        end:0
                    };
                }

                if (normalized) {
                    // Find out if the start is pointing to a text node that will
                    // be normalized.
                    if (startContainer[0].nodeType == DOM.NodeType.ELEMENT_NODE) {
                        child = new Node(startContainer[0].childNodes[startOffset]);

                        // In this case, move the start information to that text
                        // node.
                        if (child && child[0] && child[0].nodeType == DOM.NodeType.TEXT_NODE
                            && startOffset > 0 && child[0].previousSibling.nodeType == DOM.NodeType.TEXT_NODE) {
                            startContainer = child;
                            startOffset = 0;
                        }

                    }

                    // Normalize the start.
                    while (startContainer[0].nodeType == DOM.NodeType.TEXT_NODE
                        && ( previous = startContainer.prev(undefined, 1) )
                        && previous[0].nodeType == DOM.NodeType.TEXT_NODE) {
                        startContainer = previous;
                        startOffset += previous[0].nodeValue.length;
                    }

                    // Process the end only if not normalized.
                    if (!self.collapsed) {
                        // Find out if the start is pointing to a text node that
                        // will be normalized.
                        if (endContainer[0].nodeType == DOM.NodeType.ELEMENT_NODE) {
                            child = new Node(endContainer[0].childNodes[endOffset]);

                            // In this case, move the start information to that
                            // text node.
                            if (child && child[0] &&
                                child[0].nodeType == DOM.NodeType.TEXT_NODE && endOffset > 0 &&
                                child[0].previousSibling.nodeType == DOM.NodeType.TEXT_NODE) {
                                endContainer = child;
                                endOffset = 0;
                            }
                        }

                        // Normalize the end.
                        while (endContainer[0].nodeType == DOM.NodeType.TEXT_NODE
                            && ( previous = endContainer.prev(undefined, 1) )
                            && previous[0].nodeType == DOM.NodeType.TEXT_NODE) {
                            endContainer = previous;
                            endOffset += previous[0].nodeValue.length;
                        }
                    }
                }

                return {
                    start:startContainer._4e_address(normalized),
                    end:self.collapsed ? NULL : endContainer._4e_address(normalized),
                    startOffset:startOffset,
                    endOffset:endOffset,
                    normalized:normalized,
                    is2:TRUE  // It's a createBookmark2 bookmark.
                };
            },
            /**
             * Create bookmark by create bookmark node.
             * @param {Boolean} [serializable]
             */
            createBookmark:function (serializable) {
                var startNode,
                    endNode,
                    baseId,
                    clone,
                    self = this,
                    collapsed = self.collapsed;
                startNode = new Node("<span>", NULL, self.document);
                startNode.attr('_ke_bookmark', 1);
                startNode.css('display', 'none');

                // For IE, it must have something inside, otherwise it may be
                // removed during DOM operations.
                startNode.html('&nbsp;');

                if (serializable) {
                    baseId = S.guid('ke_bm_');
                    startNode.attr('id', baseId + 'S');
                }

                // If collapsed, the endNode will not be created.
                if (!collapsed) {
                    endNode = startNode.clone();
                    endNode.html('&nbsp;');

                    if (serializable) {
                        endNode.attr('id', baseId + 'E');
                    }

                    clone = self.clone();
                    clone.collapse();
                    clone.insertNode(endNode);
                }

                clone = self.clone();
                clone.collapse(TRUE);
                clone.insertNode(startNode);

                // Update the range position.
                if (endNode) {
                    self.setStartAfter(startNode);
                    self.setEndBefore(endNode);
                } else {
                    self.moveToPosition(startNode, KER.POSITION_AFTER_END);
                }

                return {
                    startNode:serializable ? baseId + 'S' : startNode,
                    endNode:serializable ? baseId + 'E' : endNode,
                    serializable:serializable,
                    collapsed:collapsed
                };
            },

            /**
             * Set the start posititon and then collapse range.
             * @param {KISSY.NodeList} node
             * @param {Number} position
             */
            moveToPosition:function (node, position) {
                var self = this;
                self.setStartAt(node, position);
                self.collapse(TRUE);
            },

            /**
             * Pull range out of text edge and split text node if range is in the middle of text node.
             * @param {Boolean} ignoreStart
             * @param {Boolean} ignoreEnd
             */
            trim:function (ignoreStart, ignoreEnd) {
                var self = this,
                    startContainer = self.startContainer,
                    startOffset = self.startOffset,
                    collapsed = self.collapsed;

                if (( !ignoreStart || collapsed ) &&
                    startContainer[0] &&
                    startContainer[0].nodeType == DOM.NodeType.TEXT_NODE) {
                    // If the offset is zero, we just insert the new node before
                    // the start.
                    if (!startOffset) {
                        startOffset = startContainer._4e_index();
                        startContainer = startContainer.parent();
                    }
                    // If the offset is at the end, we'll insert it after the text
                    // node.
                    else if (startOffset >= startContainer[0].nodeValue.length) {
                        startOffset = startContainer._4e_index() + 1;
                        startContainer = startContainer.parent();
                    }
                    // In other case, we split the text node and insert the new
                    // node at the split point.
                    else {
                        var nextText = startContainer._4e_splitText(startOffset);

                        startOffset = startContainer._4e_index() + 1;
                        startContainer = startContainer.parent();

                        // Check all necessity of updating the end boundary.
                        if (DOM.equals(self.startContainer, self.endContainer)) {
                            self.setEnd(nextText, self.endOffset - self.startOffset);
                        } else if (DOM.equals(startContainer, self.endContainer)) {
                            self.endOffset += 1;
                        }
                    }

                    self.setStart(startContainer, startOffset);

                    if (collapsed) {
                        self.collapse(TRUE);
                        return;
                    }
                }

                var endContainer = self.endContainer,
                    endOffset = self.endOffset;

                if (!( ignoreEnd || collapsed ) &&
                    endContainer[0] && endContainer[0].nodeType == DOM.NodeType.TEXT_NODE) {
                    // If the offset is zero, we just insert the new node before
                    // the start.
                    if (!endOffset) {
                        endOffset = endContainer._4e_index();
                        endContainer = endContainer.parent();
                    }
                    // If the offset is at the end, we'll insert it after the text
                    // node.
                    else if (endOffset >= endContainer[0].nodeValue.length) {
                        endOffset = endContainer._4e_index() + 1;
                        endContainer = endContainer.parent();
                    }
                    // In other case, we split the text node and insert the new
                    // node at the split point.
                    else {
                        endContainer._4e_splitText(endOffset);

                        endOffset = endContainer._4e_index() + 1;
                        endContainer = endContainer.parent();
                    }

                    self.setEnd(endContainer, endOffset);
                }
            },
            /**
             * Insert a new node at start position of current range
             * @param {KISSY.NodeList} node
             */
            insertNode:function (node) {
                var self = this;
                self.optimizeBookmark();
                self.trim(FALSE, TRUE);
                var startContainer = self.startContainer,
                    startOffset = self.startOffset,
                    nextNode = startContainer[0].childNodes[startOffset] || null;

                startContainer[0].insertBefore(node[0], nextNode);
                // Check if we need to update the end boundary.
                if (startContainer[0] == self.endContainer[0]) {
                    self.endOffset++;
                }
                // Expand the range to embrace the new node.
                self.setStartBefore(node);
            },

            /**
             * Move range to previous saved bookmark.
             * @param bookmark
             */
            moveToBookmark:function (bookmark) {
                var self = this,
                    doc = $(self.document);
                if (bookmark.is2) {
                    // Get the start information.
                    var startContainer = doc._4e_getByAddress(bookmark.start, bookmark.normalized),
                        startOffset = bookmark.startOffset,
                        endContainer = bookmark.end && doc._4e_getByAddress(bookmark.end, bookmark.normalized),
                        endOffset = bookmark.endOffset;

                    // Set the start boundary.
                    self.setStart(startContainer, startOffset);

                    // Set the end boundary. If not available, collapse it.
                    if (endContainer) {
                        self.setEnd(endContainer, endOffset);
                    } else {
                        self.collapse(TRUE);
                    }
                } else {
                    // Created with createBookmark().
                    var serializable = bookmark.serializable,
                        startNode = serializable ? S.one("#" + bookmark.startNode,
                            doc) : bookmark.startNode,
                        endNode = serializable ? S.one("#" + bookmark.endNode,
                            doc) : bookmark.endNode;

                    // Set the range start at the bookmark start node position.
                    self.setStartBefore(startNode);

                    // Remove it, because it may interfere in the setEndBefore call.
                    startNode._4e_remove();

                    // Set the range end at the bookmark end node position, or simply
                    // collapse it if it is not available.
                    if (endNode && endNode[0]) {
                        self.setEndBefore(endNode);
                        endNode._4e_remove();
                    } else {
                        self.collapse(TRUE);
                    }
                }
            },

            /**
             * Find the node which contains current range completely.
             * @param {Boolean} includeSelf whether to return the only element with in range
             * @param {Boolean} ignoreTextNode whether to return text node's parent node.
             */
            getCommonAncestor:function (includeSelf, ignoreTextNode) {
                var self = this,
                    start = self.startContainer,
                    end = self.endContainer,
                    ancestor;

                if (start[0] == end[0]) {
                    if (includeSelf &&
                        start[0].nodeType == DOM.NodeType.ELEMENT_NODE &&
                        self.startOffset == self.endOffset - 1) {
                        ancestor = new Node(start[0].childNodes[self.startOffset]);
                    } else {
                        ancestor = start;
                    }
                } else {
                    ancestor = start._4e_commonAncestor(end);
                }

                return ignoreTextNode && ancestor[0].nodeType == DOM.NodeType.TEXT_NODE
                    ? ancestor.parent() : ancestor;
            },
            /**
             * Enlarge the range as mush as possible
             * @param {Number} unit
             * @method
             * @example
             * <code>
             *      &lt;div&gt;&lt;span&gt;&lt;span&gt;^1&lt;/span&gt;2^&lt;/span&gt;x&lt;/div&gt;
             *      =>
             *      &lt;div&gt;^&lt;span&gt;&lt;span&gt;1&lt;/span&gt;2&lt;/span&gt;^x&lt;/div&gt;
             * </code>
             */
            enlarge:(function () {

                function enlargeElement(self, left, stop, commonAncestor) {
                    var container = self[left ? 'startContainer' : 'endContainer'],
                        enlarge,
                        sibling,
                        index = left ? 0 : 1,
                        commonReached = 0,
                        direction = left ? "previousSibling" : "nextSibling",
                        offset = self[left ? 'startOffset' : 'endOffset'];

                    if (container[0].nodeType == DOM.NodeType.TEXT_NODE) {
                        if (left) {
                            // 不在字的开头，立即结束
                            if (offset) {
                                return;
                            }
                        } else {
                            if (offset < container[0].nodeValue.length) {
                                return
                            }
                        }

                        // 文字节点的兄弟
                        sibling = container[0][direction];
                        // 可能会扩展到到的容器节点
                        enlarge = container[0].parentNode;
                    } else {
                        // 开始节点的兄弟节点
                        sibling = container[0].childNodes[offset + (left ? -1 : 1)] || null;
                        // 可能会扩展到到的容器节点
                        enlarge = container[0];
                    }

                    while (enlarge) {
                        // 兄弟节点是否都是空节点？
                        while (sibling) {
                            if (isWhitespace(sibling) || isBookmark(sibling)) {
                                sibling = sibling[direction];
                            } else {
                                break;
                            }
                        }

                        // 一个兄弟节点阻止了扩展
                        if (sibling) {
                            // 如果没有超过公共祖先
                            if (!commonReached) {
                                // 仅仅扩展到兄弟
                                self[left ? 'setStartAfter' : 'setEndBefore']($(sibling));
                            }
                            return;
                        }

                        // 没有兄弟节点阻止

                        // 超过了公共祖先，先记下来，最终不能 partly 选择某个节点，要完全选中

                        enlarge = $(enlarge);

                        if (enlarge.nodeName() == "body") {
                            return;
                        }

                        if (commonReached || enlarge.equals(commonAncestor)) {
                            stop[index] = enlarge;
                            commonReached = 1;
                        } else {
                            // 扩展到容器外边
                            self[left ? 'setStartBefore' : 'setEndAfter'](enlarge);
                        }

                        sibling = enlarge[0][direction];
                        enlarge = enlarge[0].parentNode;
                    }

                }

                return function (unit) {
                    var self = this;
                    switch (unit) {
                        case KER.ENLARGE_ELEMENT :

                            if (self.collapsed) {
                                return;
                            }

                            var commonAncestor = self.getCommonAncestor(),
                                stop = [];

                            enlargeElement(self, 1, stop, commonAncestor);
                            enlargeElement(self, 0, stop, commonAncestor);

                            if (stop[0] && stop[1]) {
                                var commonStop = stop[0].contains(stop[1]) ? stop[1] : stop[0];
                                self.setStartBefore(commonStop);
                                self.setEndAfter(commonStop);
                            }

                            break;

                        case KER.ENLARGE_BLOCK_CONTENTS:
                        case KER.ENLARGE_LIST_ITEM_CONTENTS:

                            // Enlarging the start boundary.
                            var walkerRange = new KERange(self.document);
                            var body = new Node(self.document.body);

                            walkerRange.setStartAt(body, KER.POSITION_AFTER_START);
                            walkerRange.setEnd(self.startContainer, self.startOffset);

                            var walker = new Walker(walkerRange),
                                blockBoundary, // The node on which the enlarging should stop.
                                tailBr, //
                                defaultGuard = Walker.blockBoundary(
                                    ( unit == KER.ENLARGE_LIST_ITEM_CONTENTS ) ?
                                    { br:1 } : NULL),
                            // Record the encountered 'blockBoundary' for later use.
                                boundaryGuard = function (node) {
                                    var retVal = defaultGuard(node);
                                    if (!retVal) {
                                        blockBoundary = $(node);
                                    }
                                    return retVal;
                                },
                            // Record the encountered 'tailBr' for later use.
                                tailBrGuard = function (node) {
                                    var retVal = boundaryGuard(node);
                                    if (!retVal && DOM.nodeName(node) == 'br') {
                                        tailBr = $(node);
                                    }
                                    return retVal;
                                };

                            walker.guard = boundaryGuard;

                            enlargeable = walker.lastBackward();

                            // It's the body which stop the enlarging if no block boundary found.
                            blockBoundary = blockBoundary || body;

                            // Start the range at different position by comparing
                            // the document position of it with 'enlargeable' node.
                            self.setStartAt(
                                blockBoundary,
                                blockBoundary.nodeName() != 'br' &&
                                    // <table></table> <span>1234^56</span> <table></table>
                                    // =>
                                    // <table></table> ^<span>123456</span>$ <table></table>

                                    // <p> <span>123^456</span> </p>
                                    // =>
                                    // <p> ^<span>123456</span>$ </p>
                                    ( !enlargeable && self.checkStartOfBlock()
                                        || enlargeable && blockBoundary.contains(enlargeable) ) ?
                                    KER.POSITION_AFTER_START :
                                    KER.POSITION_AFTER_END);

                            // Enlarging the end boundary.
                            walkerRange = self.clone();
                            walkerRange.collapse();
                            walkerRange.setEndAt(body, KER.POSITION_BEFORE_END);
                            walker = new Walker(walkerRange);

                            // tailBrGuard only used for on range end.
                            walker.guard = ( unit == KER.ENLARGE_LIST_ITEM_CONTENTS ) ?
                                tailBrGuard : boundaryGuard;
                            blockBoundary = NULL;
                            // End the range right before the block boundary node.

                            var enlargeable = walker.lastForward();

                            // It's the body which stop the enlarging if no block boundary found.
                            blockBoundary = blockBoundary || body;

                            // Start the range at different position by comparing
                            // the document position of it with 'enlargeable' node.
                            self.setEndAt(
                                blockBoundary,
                                ( !enlargeable && self.checkEndOfBlock()
                                    || enlargeable && blockBoundary.contains(enlargeable) ) ?
                                    KER.POSITION_BEFORE_END :
                                    KER.POSITION_BEFORE_START);
                            // We must include the <br> at the end of range if there's
                            // one and we're expanding list item contents
                            if (tailBr) {
                                self.setEndAfter(tailBr);
                            }
                    }
                }
            })(),

            /**
             * Check whether current range 's start position is at the start of a block (visible)
             * @return Boolean
             */
            checkStartOfBlock:function () {
                var self = this,
                    startContainer = self.startContainer,
                    startOffset = self.startOffset;

                // If the starting node is a text node, and non-empty before the offset,
                // then we're surely not at the start of block.
                if (startOffset && startContainer[0].nodeType == DOM.NodeType.TEXT_NODE) {
                    var textBefore = S.trim(startContainer[0].nodeValue.substring(0, startOffset));
                    if (textBefore.length) {
                        return FALSE;
                    }
                }

                // Anticipate the trim() call here, so the walker will not make
                // changes to the DOM, which would not get reflected into this
                // range otherwise.
                self.trim();

                // We need to grab the block element holding the start boundary, so
                // let's use an element path for it.
                var path = new ElementPath(self.startContainer);

                // Creates a range starting at the block start until the range start.
                var walkerRange = self.clone();
                walkerRange.collapse(TRUE);
                walkerRange.setStartAt(path.block || path.blockLimit, KER.POSITION_AFTER_START);

                var walker = new Walker(walkerRange);
                walker.evaluator = getCheckStartEndBlockEvalFunction(TRUE);

                return walker.checkBackward();
            },

            /**
             * Check whether current range 's end position is at the end of a block (visible)
             * @return Boolean
             */
            checkEndOfBlock:function () {
                var self = this, endContainer = self.endContainer,
                    endOffset = self.endOffset;

                // If the ending node is a text node, and non-empty after the offset,
                // then we're surely not at the end of block.
                if (endContainer[0].nodeType == DOM.NodeType.TEXT_NODE) {
                    var textAfter = S.trim(endContainer[0].nodeValue.substring(endOffset));
                    if (textAfter.length) {
                        return FALSE;
                    }
                }

                // Anticipate the trim() call here, so the walker will not make
                // changes to the DOM, which would not get reflected into this
                // range otherwise.
                self.trim();

                // We need to grab the block element holding the start boundary, so
                // let's use an element path for it.
                var path = new ElementPath(self.endContainer);

                // Creates a range starting at the block start until the range start.
                var walkerRange = self.clone();
                walkerRange.collapse(FALSE);
                walkerRange.setEndAt(path.block || path.blockLimit, KER.POSITION_BEFORE_END);

                var walker = new Walker(walkerRange);
                walker.evaluator = getCheckStartEndBlockEvalFunction(FALSE);

                return walker.checkForward();
            },

            /**
             * Check whether current range is on the inner edge of the specified element.
             * @param {Number} checkType The checking side.
             * @param {KISSY.NodeList} element The target element to check.
             */
            checkBoundaryOfElement:function (element, checkType) {
                var walkerRange = this.clone();
                // Expand the range to element boundary.
                walkerRange[ checkType == KER.START ?
                    'setStartAt' : 'setEndAt' ]
                    (element, checkType == KER.START ?
                        KER.POSITION_AFTER_START
                        : KER.POSITION_BEFORE_END);

                var walker = new Walker(walkerRange);

                walker.evaluator = elementBoundaryEval;
                return walker[ checkType == KER.START ?
                    'checkBackward' : 'checkForward' ]();
            },

            /**
             * Get two node which are at the edge of current range.
             * @return {Object} Map with startNode and endNode as key/value.
             */
            getBoundaryNodes:function () {
                var self = this,
                    startNode = self.startContainer,
                    endNode = self.endContainer,
                    startOffset = self.startOffset,
                    endOffset = self.endOffset,
                    childCount;

                if (startNode[0].nodeType == DOM.NodeType.ELEMENT_NODE) {
                    childCount = startNode[0].childNodes.length;
                    if (childCount > startOffset) {
                        startNode = $(startNode[0].childNodes[startOffset]);
                    } else if (childCount == 0) {
                        // ?? startNode
                        startNode = startNode._4e_previousSourceNode();
                    } else {
                        // startOffset >= childCount but childCount is not 0
                        // Try to take the node just after the current position.
                        startNode = startNode[0];
                        while (startNode.lastChild) {
                            startNode = startNode.lastChild;
                        }

                        startNode = $(startNode);

                        // Normally we should take the next node in DFS order. But it
                        // is also possible that we've already reached the end of
                        // document.
                        startNode = startNode._4e_nextSourceNode() || startNode;
                    }
                }

                if (endNode[0].nodeType == DOM.NodeType.ELEMENT_NODE) {
                    childCount = endNode[0].childNodes.length;
                    if (childCount > endOffset) {
                        endNode = $(endNode[0].childNodes[endOffset])
                            // in case endOffset == 0
                            ._4e_previousSourceNode(TRUE);
                    } else if (childCount == 0) {
                        endNode = endNode._4e_previousSourceNode();
                    } else {
                        // endOffset > childCount but childCount is not 0
                        // Try to take the node just before the current position.
                        endNode = endNode[0];
                        while (endNode.lastChild)
                            endNode = endNode.lastChild;
                        endNode = $(endNode);
                    }
                }

                // Sometimes the endNode will come right before startNode for collapsed
                // ranges. Fix it. (#3780)
                if (startNode._4e_position(endNode) & KEP.POSITION_FOLLOWING) {
                    startNode = endNode;
                }

                return { startNode:startNode, endNode:endNode };
            },

            /**
             * Wrap the content in range which is block-enlarged
             * at the start or end of current range into a block element.
             * @param {Boolean} isStart Start or end of current range tobe enlarged.
             * @param {String} blockTag Block element's tag name.
             * @return {KISSY.NodeList} Newly generated block element.
             */
            fixBlock:function (isStart, blockTag) {
                var self = this,
                    bookmark = self.createBookmark(),
                    fixedBlock = $(self.document.createElement(blockTag));
                self.collapse(isStart);
                self.enlarge(KER.ENLARGE_BLOCK_CONTENTS);
                fixedBlock[0].appendChild(self.extractContents());
                fixedBlock._4e_trim();
                if (!UA['ie']) {
                    fixedBlock._4e_appendBogus();
                }
                self.insertNode(fixedBlock);
                self.moveToBookmark(bookmark);
                return fixedBlock;
            },

            /**
             * Split current block which current range into two if current range is in the same block.
             * Fix block at the start and end position of range if necessary.
             * @param {String} blockTag Block tag if need fixBlock
             */
            splitBlock:function (blockTag) {
                var self = this,
                    startPath = new ElementPath(self.startContainer),
                    endPath = new ElementPath(self.endContainer),
                    startBlockLimit = startPath.blockLimit,
                    endBlockLimit = endPath.blockLimit,
                    startBlock = startPath.block,
                    endBlock = endPath.block,
                    elementPath = NULL;

                // Do nothing if the boundaries are in different block limits.
                if (!startBlockLimit.equals(endBlockLimit)) {
                    return NULL;
                }

                // Get or fix current blocks.
                if (blockTag != 'br') {
                    if (!startBlock) {
                        startBlock = self.fixBlock(TRUE, blockTag);
                        endBlock = new ElementPath(self.endContainer).block;
                    }

                    if (!endBlock) {
                        endBlock = self.fixBlock(FALSE, blockTag);
                    }
                }

                // Get the range position.
                var isStartOfBlock = startBlock && self.checkStartOfBlock(),
                    isEndOfBlock = endBlock && self.checkEndOfBlock();

                // Delete the current contents.
                self.deleteContents();

                if (startBlock && startBlock[0] == endBlock[0]) {
                    if (isEndOfBlock) {
                        elementPath = new ElementPath(self.startContainer);
                        self.moveToPosition(endBlock, KER.POSITION_AFTER_END);
                        endBlock = NULL;
                    }
                    else if (isStartOfBlock) {
                        elementPath = new ElementPath(self.startContainer);
                        self.moveToPosition(startBlock, KER.POSITION_BEFORE_START);
                        startBlock = NULL;
                    }
                    else {
                        endBlock = self.splitElement(startBlock);
                        // In Gecko, the last child node must be a bogus <br>.
                        // Note: bogus <br> added under <ul> or <ol> would cause
                        // lists to be incorrectly rendered.
                        if (!UA['ie'] && !S.inArray(startBlock.nodeName(), ['ul', 'ol'])) {
                            startBlock._4e_appendBogus();
                        }
                    }
                }

                return {
                    previousBlock:startBlock,
                    nextBlock:endBlock,
                    wasStartOfBlock:isStartOfBlock,
                    wasEndOfBlock:isEndOfBlock,
                    elementPath:elementPath
                };
            },

            /**
             * Split toSplit element into two parts at current range's start position.
             * @param {KISSY.NodeList} toSplit Element to split.
             * @return {KISSY.NodeList} The second newly generated element.
             */
            splitElement:function (toSplit) {
                var self = this;
                if (!self.collapsed)
                    return NULL;

                // Extract the contents of the block from the selection point to the end
                // of its contents.
                self.setEndAt(toSplit, KER.POSITION_BEFORE_END);
                var documentFragment = self.extractContents(),
                // Duplicate the element after it.
                    clone = toSplit.clone(FALSE);

                // Place the extracted contents into the duplicated element.
                clone[0].appendChild(documentFragment);

                clone.insertAfter(toSplit);
                self.moveToPosition(toSplit, KER.POSITION_AFTER_END);
                return clone;
            },

            /**
             * Move the range to the depth-first start/end editing point inside
             * an element.
             * @param {KISSY.NodeList} el The element to find edit point into.
             * @param {Boolean} [isMoveToEnd] Find start or end editing point.
             * Set true to find end editing point.
             * @return {Boolean} Whether find edit point
             */
            moveToElementEditablePosition:function (el, isMoveToEnd) {
                function nextDFS(node, childOnly) {
                    var next;

                    if (node[0].nodeType == DOM.NodeType.ELEMENT_NODE &&
                        node._4e_isEditable()) {
                        next = node[ isMoveToEnd ? 'last' : 'first' ](nonWhitespaceOrIsBookmark, 1);
                    }

                    if (!childOnly && !next) {
                        next = node[ isMoveToEnd ? 'prev' : 'next' ](nonWhitespaceOrIsBookmark, 1);
                    }

                    return next;
                }

                var found = 0, self = this;

                while (el) {
                    // Stop immediately if we've found a text node.
                    if (el[0].nodeType == DOM.NodeType.TEXT_NODE) {
                        self.moveToPosition(el, isMoveToEnd ?
                            KER.POSITION_AFTER_END :
                            KER.POSITION_BEFORE_START);
                        found = 1;
                        break;
                    }

                    // If an editable element is found, move inside it, but not stop the searching.
                    if (el[0].nodeType == DOM.NodeType.ELEMENT_NODE && el._4e_isEditable()) {
                        self.moveToPosition(el, isMoveToEnd ?
                            KER.POSITION_BEFORE_END :
                            KER.POSITION_AFTER_START);
                        found = 1;
                    }

                    el = nextDFS(el, found);
                }

                return !!found;
            },

            /**
             * Set range surround current node 's content.
             * @param {KISSY.NodeList} node
             */
            selectNodeContents:function (node) {
                var self = this, domNode = node[0];
                self.setStart(node, 0);
                self.setEnd(node, domNode.nodeType == DOM.NodeType.TEXT_NODE ?
                    domNode.nodeValue.length :
                    domNode.childNodes.length);
            },

            /**
             * Insert node by dtd.(not invalidate dtd convention)
             * @param {KISSY.NodeList} element
             */
            insertNodeByDtd:function (element) {
                var current,
                    self = this,
                    tmpDtd,
                    last,
                    elementName = element['nodeName'](),
                    isBlock = dtd['$block'][ elementName ];
                self.deleteContents();
                if (isBlock) {
                    current = self.getCommonAncestor(FALSE, TRUE);
                    while (( tmpDtd = dtd[ current.nodeName() ] ) &&
                        !( tmpDtd && tmpDtd [ elementName ] )) {
                        var parent = current.parent();
                        // If we're in an empty block which indicate a new paragraph,
                        // simply replace it with the inserting block.(#3664)
                        if (self.checkStartOfBlock() && self.checkEndOfBlock()) {
                            self.setStartBefore(current);
                            self.collapse(TRUE);
                            current.remove();
                        } else {
                            last = current;
                        }
                        current = parent;

                    }
                    if (last) {
                        self.splitElement(last);
                    }
                }
                // Insert the new node.
                self.insertNode(element);
            }
        });

    Utils.injectDom({
        _4e_breakParent:function (el, parent) {
            parent = $(parent);
            el = $(el);

            var KERange = Editor.Range,
                docFrag,
                range = new KERange(el[0].ownerDocument);

            // We'll be extracting part of this element, so let's use our
            // range to get the correct piece.
            range.setStartAfter(el);
            range.setEndAfter(parent);

            // Extract it.
            docFrag = range.extractContents();

            // Move the element outside the broken element.
            range.insertNode(el.remove());

            // Re-insert the extracted piece after the element.
            el.after(docFrag);
        }
    });

    Editor.Range = KERange;

    return KERange;
}, {
    requires:['./base', './utils', './walker', './elementPath', './dom']
});
/**
 * modified from ckeditor core - selection
 * @author yiminghe@gmail.com
 */
/*
 Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.html or http://ckeditor.com/license
 */
KISSY.add("editor/core/selection", function (S) {

    var Editor = S.Editor;

    /**
     * selection type enum
     * @enum {number}
     */
    Editor.SELECTION = {
        SELECTION_NONE: 1,
        SELECTION_TEXT: 2,
        SELECTION_ELEMENT: 3

    };
    var TRUE = true,
        FALSE = false,
        NULL = null,
        UA = S.UA,
        DOM = S.DOM,
    //tryThese = Editor.Utils.tryThese,
        Node = S.Node,
        KES = Editor.SELECTION,
        KER = Editor.RANGE,
    // ie9 仍然采用老的 range api，发现新的不稳定
        OLD_IE = UA['ie'], //!window.getSelection,
    //EventTarget = S.EventTarget,
        Walker = Editor.Walker,
    //ElementPath = Editor.ElementPath,
        KERange = Editor.Range;

    /**
     * @constructor
     * @param document {Document}
     */
    function KESelection(document) {
        var self = this;
        self.document = document;
        self._ = {
            cache: {}
        };

        /**
         * IE BUG: The selection's document may be a different document than the
         * editor document. Return NULL if that's the case.
         */
        if (OLD_IE) {
            try {
                var range = self.getNative().createRange();
                if (!range
                    || ( range.item && range.item(0).ownerDocument != document )
                    || ( range.parentElement && range.parentElement().ownerDocument != document )) {
                    self.isInvalid = TRUE;
                }
            }
                // 2012-06-13 发布页 bug
                // 当焦点在一个跨域的 iframe 内，调用该操作抛拒绝访问异常
            catch (e) {
                self.isInvalid = TRUE;
            }
        }
    }

    var styleObjectElements = {
        "img": 1, "hr": 1, "li": 1, "table": 1, "tr": 1, "td": 1, "th": 1, "embed": 1, "object": 1, "ol": 1, "ul": 1,
        "a": 1, "input": 1, "form": 1, "select": 1, "textarea": 1, "button": 1, "fieldset": 1, "thead": 1, "tfoot": 1
    };

    S.augment(KESelection, {


        /**
         * Gets the native selection object from the browser.
         * @return {Object} The native selection object.
         * @example
         * var selection = editor.getSelection().<b>getNative()</b>;
         */
        getNative: !OLD_IE ?
            function () {
                var self = this,
                    cache = self._.cache;
                return cache.nativeSel || ( cache.nativeSel = DOM.getWindow(self.document).getSelection() );
            }
            :
            function () {
                var self = this, cache = self._.cache;
                return cache.nativeSel || ( cache.nativeSel = self.document.selection );
            },

        /**
         * Gets the type of the current selection. The following values are
         * available:
         * <ul>
         *        <li> SELECTION_NONE (1): No selection.</li>
         *        <li> SELECTION_TEXT (2): Text is selected or
         *            collapsed selection.</li>
         *        <li> SELECTION_ELEMENT (3): A element
         *            selection.</li>
         * </ul>
         * @return {number} One of the following constant values:
         *         SELECTION_NONE,  SELECTION_TEXT or
         *         SELECTION_ELEMENT.
         * @example
         * if ( editor.getSelection().<b>getType()</b> == SELECTION_TEXT )
         *     alert( 'Text is selected' );
         */
        getType: !OLD_IE ?
            function () {
                var self = this, cache = self._.cache;
                if (cache.type)
                    return cache.type;

                var type = KES.SELECTION_TEXT,
                    sel = self.getNative();

                if (!sel)
                    type = KES.SELECTION_NONE;
                else if (sel.rangeCount == 1) {
                    // Check if the actual selection is a control (IMG,
                    // TABLE, HR, etc...).

                    var range = sel.getRangeAt(0),
                        startContainer = range.startContainer;

                    if (startContainer == range.endContainer
                        && startContainer.nodeType == DOM.NodeType.ELEMENT_NODE
                        && Number(range.endOffset - range.startOffset) == 1
                        && styleObjectElements[ startContainer.childNodes[ range.startOffset ].nodeName.toLowerCase() ]) {
                        type = KES.SELECTION_ELEMENT;
                    }
                }

                return ( cache.type = type );
            } :
            function () {
                var self = this, cache = self._.cache;
                if (cache.type)
                    return cache.type;

                var type = KES.SELECTION_NONE;

                try {
                    var sel = self.getNative(),
                        ieType = sel.type;

                    if (ieType == 'Text')
                        type = KES.SELECTION_TEXT;

                    if (ieType == 'Control')
                        type = KES.SELECTION_ELEMENT;

                    // It is possible that we can still get a text range
                    // object even when type == 'None' is returned by IE.
                    // So we'd better check the object returned by
                    // createRange() rather than by looking at the type.
                    //当前一个操作选中文本，后一个操作右键点了字串中间就会出现了
                    if (sel.createRange().parentElement)
                        type = KES.SELECTION_TEXT;
                }
                catch (e) {
                }

                return ( cache.type = type );
            },

        getRanges: OLD_IE ?
            (function () {
                // Finds the container and offset for a specific boundary
                // of an IE range.
                /**
                 *
                 * @param {TextRange} range
                 * @param {Boolean=} start
                 */
                var getBoundaryInformation = function (range, start) {
                    // Creates a collapsed range at the requested boundary.
                    range = range.duplicate();
                    range.collapse(start);

                    // Gets the element that encloses the range entirely.
                    var parent = range.parentElement(), siblings = parent.childNodes,
                        testRange;

                    for (var i = 0; i < siblings.length; i++) {
                        var child = siblings[ i ];

                        if (child.nodeType == DOM.NodeType.ELEMENT_NODE) {
                            testRange = range.duplicate();

                            testRange.moveToElementText(child);

                            var comparisonStart = testRange.compareEndPoints('StartToStart', range),
                                comparisonEnd = testRange.compareEndPoints('EndToStart', range);

                            testRange.collapse();
                            //中间有其他标签
                            if (comparisonStart > 0)
                                break;
                            // When selection stay at the side of certain self-closing elements, e.g. BR,
                            // our comparison will never shows an equality. (#4824)
                            else if (!comparisonStart
                                || comparisonEnd == 1 && comparisonStart == -1)
                                return { container: parent, offset: i };
                            else if (!comparisonEnd)
                                return { container: parent, offset: i + 1 };

                            testRange = NULL;
                        }
                    }

                    if (!testRange) {
                        testRange = range.duplicate();
                        testRange.moveToElementText(parent);
                        testRange.collapse(FALSE);
                    }

                    testRange.setEndPoint('StartToStart', range);
                    // IE report line break as CRLF with range.text but
                    // only LF with textnode.nodeValue, normalize them to avoid
                    // breaking character counting logic below. (#3949)
                    var distance = String(testRange.text)
                        .replace(/\r\n|\r/g, '\n').length;

                    try {
                        while (distance > 0)
                            //bug? 可能不是文本节点 nodeValue undefined
                            //永远不会出现 textnode<img/>textnode
                            //停止时，前面一定为textnode
                            distance -= siblings[ --i ].nodeValue.length;
                    }
                        // Measurement in IE could be somtimes wrong because of <select> element. (#4611)
                    catch (e) {
                        distance = 0;
                    }


                    if (distance === 0) {
                        return {
                            container: parent,
                            offset: i
                        };
                    }
                    else {
                        return {
                            container: siblings[ i ],
                            offset: -distance
                        };
                    }
                };

                return function (force) {
                    var self = this, cache = self._.cache;
                    if (cache.ranges && !force)
                        return cache.ranges;

                    // IE doesn't have range support (in the W3C way), so we
                    // need to do some magic to transform selections into
                    // Range instances.

                    var sel = self.getNative(),
                        nativeRange = sel && sel.createRange(),
                        type = self.getType(),
                        range;

                    if (!sel)
                        return [];

                    if (type == KES.SELECTION_TEXT) {
                        range = new KERange(self.document);
                        var boundaryInfo = getBoundaryInformation(nativeRange, TRUE);
                        range.setStart(new Node(boundaryInfo.container), boundaryInfo.offset);
                        boundaryInfo = getBoundaryInformation(nativeRange);
                        range.setEnd(new Node(boundaryInfo.container), boundaryInfo.offset);
                        return ( cache.ranges = [ range ] );
                    } else if (type == KES.SELECTION_ELEMENT) {
                        var retval = cache.ranges = [];

                        for (var i = 0; i < nativeRange.length; i++) {
                            var element = nativeRange.item(i),
                                parentElement = element.parentNode,
                                j = 0;

                            range = new KERange(self.document);

                            for (; j < parentElement.childNodes.length && parentElement.childNodes[j] != element; j++) { /*jsl:pass*/
                            }

                            range.setStart(new Node(parentElement), j);
                            range.setEnd(new Node(parentElement), j + 1);
                            retval.push(range);
                        }

                        return retval;
                    }

                    return ( cache.ranges = [] );
                };
            })()
            :
            function (force) {
                var self = this, cache = self._.cache;
                if (cache.ranges && !force)
                    return cache.ranges;

                // On browsers implementing the W3C range, we simply
                // tranform the native ranges in Range
                // instances.

                var ranges = [], sel = self.getNative();

                if (!sel)
                    return [];

                for (var i = 0; i < sel.rangeCount; i++) {
                    var nativeRange = sel.getRangeAt(i), range = new KERange(self.document);

                    range.setStart(new Node(nativeRange.startContainer), nativeRange.startOffset);
                    range.setEnd(new Node(nativeRange.endContainer), nativeRange.endOffset);
                    ranges.push(range);
                }

                return ( cache.ranges = ranges );
            },

        /**
         * Gets the DOM element in which the selection starts.
         * @return The element at the beginning of the
         *        selection.
         * @example
         * var element = editor.getSelection().<b>getStartElement()</b>;
         * alert( element.nodeName() );
         */
        getStartElement: function () {
            var self = this, cache = self._.cache;
            if (cache.startElement !== undefined)
                return cache.startElement;

            var node,
                sel = self.getNative();

            switch (self.getType()) {
                case KES.SELECTION_ELEMENT :
                    return this.getSelectedElement();

                case KES.SELECTION_TEXT :

                    var range = self.getRanges()[0];

                    if (range) {
                        if (!range.collapsed) {
                            range.optimize();

                            // Decrease the range content to exclude particial
                            // selected node on the start which doesn't have
                            // visual impact. ( #3231 )
                            while (TRUE) {
                                var startContainer = range.startContainer,
                                    startOffset = range.startOffset;
                                // Limit the fix only to non-block elements.(#3950)
                                if (startOffset == ( startContainer[0].nodeType === DOM.NodeType.ELEMENT_NODE ?
                                    startContainer[0].childNodes.length : startContainer[0].nodeValue.length )
                                    && !startContainer._4e_isBlockBoundary()) {
                                    range.setStartAfter(startContainer);
                                } else {
                                    break;
                                }
                            }

                            node = range.startContainer;

                            if (node[0].nodeType != DOM.NodeType.ELEMENT_NODE) {
                                return node.parent();
                            }

                            node = new Node(node[0].childNodes[range.startOffset]);

                            if (!node[0] || node[0].nodeType != DOM.NodeType.ELEMENT_NODE) {
                                return range.startContainer;
                            }

                            var child = node[0].firstChild;
                            while (child && child.nodeType == DOM.NodeType.ELEMENT_NODE) {
                                node = new Node(child);
                                child = child.firstChild;
                            }
                            return node;
                        }
                    }

                    if (OLD_IE) {
                        range = sel.createRange();
                        range.collapse(TRUE);
                        node = new Node(range.parentElement());
                    }
                    else {
                        node = sel.anchorNode;
                        if (node && node.nodeType != DOM.NodeType.ELEMENT_NODE) {
                            node = node.parentNode;
                        }
                        if (node) {
                            node = new Node(node);
                        }
                    }
            }

            return cache.startElement = node;
        },

        /**
         * Gets the current selected element.
         * @return The selected element. Null if no
         *        selection is available or the selection type is not
         *       SELECTION_ELEMENT.
         * @example
         * var element = editor.getSelection().<b>getSelectedElement()</b>;
         * alert( element.nodeName() );
         */
        getSelectedElement: function () {
            var self = this,
                node,
                cache = self._.cache;

            if (cache.selectedElement !== undefined) {
                return cache.selectedElement;
            }

            // Is it native IE control type selection?
            if (OLD_IE) {
                var range = self.getNative().createRange();
                node = range.item && range.item(0);
            }

            // Figure it out by checking if there's a single enclosed
            // node of the range.
            // 处理 ^  <img/>  ^
            if (!node) {
                node = (function () {
                    var range = self.getRanges()[ 0 ],
                        enclosed,
                        selected;

                    // 先检查第一层
                    // <div>^<img/>^</div>
                    // shrink 再检查
                    // <div><span>^<img/>^</span></div>
                    for (var i = 2;
                         i && !(( enclosed = range.getEnclosedNode() ) &&
                             ( enclosed[0].nodeType == DOM.NodeType.ELEMENT_NODE ) &&
                             // 某些值得这么多的元素？？
                             styleObjectElements[ enclosed.nodeName() ] &&
                             ( selected = enclosed ));
                         i--) {
                        // Then check any deep wrapped element
                        // e.g. [<b><i><img /></i></b>]
                        // 一下子退到底  ^<a><span><span><img/></span></span></a>^
                        // ->
                        //<a><span><span>^<img/>^</span></span></a>
                        range.shrink(KER.SHRINK_ELEMENT);
                    }

                    return  selected;
                })();
            } else {
                node = new Node(node);
            }

            return cache.selectedElement = node;
        },


        reset: function () {
            this._.cache = {};
        },

        selectElement: function (element) {
            var range,
                self = this,
                doc = self.document;
            if (OLD_IE) {
                //do not use empty()，编辑器内滚动条重置了
                //选择的 img 内容前后莫名被清除
                //self.getNative().empty();
                try {
                    // Try to select the node as a control.
                    range = doc.body['createControlRange']();
                    range['addElement'](element[0]);
                    range.select();
                } catch (e) {
                    // If failed, select it as a text range.
                    range = doc.body.createTextRange();
                    range.moveToElementText(element[0]);
                    range.select();
                } finally {
                    // fire('selectionChange');
                }
                self.reset();
            } else {
                // Create the range for the element.
                range = doc.createRange();
                range.selectNode(element[0]);
                // Select the range.
                var sel = self.getNative();
                sel.removeAllRanges();
                sel.addRange(range);
                self.reset();
            }
        },

        selectRanges: function (ranges) {
            var self = this;
            if (OLD_IE) {
                if (ranges.length > 1) {
                    // IE doesn't accept multiple ranges selection, so we join all into one.
                    var last = ranges[ ranges.length - 1 ];
                    ranges[ 0 ].setEnd(last.endContainer, last.endOffset);
                    ranges.length = 1;
                }

                // IE doesn't accept multiple ranges selection, so we just
                // select the first one.
                if (ranges[ 0 ])
                    ranges[ 0 ].select();

                self.reset();
            }
            else {
                var sel = self.getNative();
                if (!sel) {
                    return;
                }
                sel.removeAllRanges();
                for (var i = 0; i < ranges.length; i++) {
                    var range = ranges[ i ],
                        nativeRange = self.document.createRange(),
                        startContainer = range.startContainer;

                    // In FF2, if we have a collapsed range, inside an empty
                    // element, we must add something to it otherwise the caret
                    // will not be visible.
                    // opera move out of this element
                    if (range.collapsed &&
                        (( UA.gecko && UA.gecko < 1.0900 ) || UA.opera || UA['webkit']) &&
                        startContainer[0].nodeType == DOM.NodeType.ELEMENT_NODE && !startContainer[0].childNodes.length) {
                        // webkit 光标停留不到在空元素内，要fill char，之后范围定在 fill char 之后
                        startContainer[0].appendChild(self.document.createTextNode(UA['webkit'] ? "\u200b" : ""));
                        range.startOffset++;
                        range.endOffset++;
                    }

                    nativeRange.setStart(startContainer[0], range.startOffset);
                    nativeRange.setEnd(range.endContainer[0], range.endOffset);
                    // Select the range.
                    sel.addRange(nativeRange);
                }
                self.reset();
            }
        },
        createBookmarks2: function (normalized) {
            var bookmarks = [],
                ranges = this.getRanges();

            for (var i = 0; i < ranges.length; i++)
                bookmarks.push(ranges[i].createBookmark2(normalized));

            return bookmarks;
        },
        createBookmarks: function (serializable, ranges) {
            var self = this,
                retval = [],
                doc = self.document,
                bookmark;
            ranges = ranges || self.getRanges();
            var length = ranges.length;
            for (var i = 0; i < length; i++) {
                retval.push(bookmark = ranges[ i ].createBookmark(serializable, TRUE));
                serializable = bookmark.serializable;

                var bookmarkStart = serializable ? S.one("#" + bookmark.startNode, doc) : bookmark.startNode,
                    bookmarkEnd = serializable ? S.one("#" + bookmark.endNode, doc) : bookmark.endNode;

                // Updating the offset values for rest of ranges which have been mangled(#3256).
                for (var j = i + 1; j < length; j++) {
                    var dirtyRange = ranges[ j ],
                        rangeStart = dirtyRange.startContainer,
                        rangeEnd = dirtyRange.endContainer;

                    DOM.equals(rangeStart, bookmarkStart.parent()) && dirtyRange.startOffset++;
                    DOM.equals(rangeStart, bookmarkEnd.parent()) && dirtyRange.startOffset++;
                    DOM.equals(rangeEnd, bookmarkStart.parent()) && dirtyRange.endOffset++;
                    DOM.equals(rangeEnd, bookmarkEnd.parent()) && dirtyRange.endOffset++;
                }
            }

            return retval;
        },

        selectBookmarks: function (bookmarks) {
            var self = this, ranges = [];
            for (var i = 0; i < bookmarks.length; i++) {
                var range = new KERange(self.document);
                range.moveToBookmark(bookmarks[i]);
                ranges.push(range);
            }
            self.selectRanges(ranges);
            return self;
        },

        getCommonAncestor: function () {
            var ranges = this.getRanges(),
                startNode = ranges[ 0 ].startContainer,
                endNode = ranges[ ranges.length - 1 ].endContainer;
            return startNode._4e_commonAncestor(endNode);
        },

        // Moving scroll bar to the current selection's start position.
        scrollIntoView: function () {
            // If we have split the block, adds a temporary span at the
            // range position and scroll relatively to it.
            var start = this.getStartElement();
            start && start.scrollIntoView(undefined, {
                alignWithTop: false,
                allowHorizontalScroll: true,
                onlyScrollIfNeeded: true
            });
        },
        removeAllRanges: function () {
            var sel = this.getNative();
            if (!OLD_IE) {
                sel && sel.removeAllRanges();
            } else {
                sel && sel.clear();
            }
        }
    });


    var nonCells = { "table": 1, "tbody": 1, "tr": 1 }, notWhitespaces = Walker.whitespaces(TRUE),
        fillerTextRegex = /\ufeff|\u00a0/;
    KERange.prototype["select"] =
        KERange.prototype.select =
            !OLD_IE ? function () {
                var self = this, startContainer = self.startContainer;

                // If we have a collapsed range, inside an empty element, we must add
                // something to it, otherwise the caret will not be visible.
                if (self.collapsed && startContainer[0].nodeType == DOM.NodeType.ELEMENT_NODE && !startContainer[0].childNodes.length)
                    startContainer[0].appendChild(self.document.createTextNode(""));

                var nativeRange = self.document.createRange();
                nativeRange.setStart(startContainer[0], self.startOffset);

                try {
                    nativeRange.setEnd(self.endContainer[0], self.endOffset);
                } catch (e) {
                    // There is a bug in Firefox implementation (it would be too easy
                    // otherwise). The new start can't be after the end (W3C says it can).
                    // So, let's create a new range and collapse it to the desired point.
                    if (e.toString().indexOf('NS_ERROR_ILLEGAL_VALUE') >= 0) {
                        self.collapse(TRUE);
                        nativeRange.setEnd(self.endContainer[0], self.endOffset);
                    }
                    else
                        throw( e );
                }

                var selection = getSelection(self.document).getNative();
                selection.removeAllRanges();
                selection.addRange(nativeRange);
            } : // V2
                function (forceExpand) {

                    var self = this,
                        collapsed = self.collapsed,
                        isStartMarkerAlone,
                        dummySpan;
                    //选的是元素，直接使用selectElement
                    //还是有差异的，特别是img选择框问题
                    if (
                    //ie8 有问题？？
                    //UA['ie']Engine!=8 &&
                        self.startContainer[0] === self.endContainer[0]
                            && self.endOffset - self.startOffset == 1) {
                        var selEl = self.startContainer[0].childNodes[self.startOffset];
                        if (selEl.nodeType == DOM.NodeType.ELEMENT_NODE) {
                            new KESelection(self.document).selectElement(new Node(selEl));
                            return;
                        }
                    }
                    // IE doesn't support selecting the entire table row/cell, move the selection into cells, e.g.
                    // <table><tbody><tr>[<td>cell</b></td>... => <table><tbody><tr><td>[cell</td>...
                    if (self.startContainer[0].nodeType == DOM.NodeType.ELEMENT_NODE &&
                        self.startContainer.nodeName() in nonCells
                        || self.endContainer[0].nodeType == DOM.NodeType.ELEMENT_NODE &&
                        self.endContainer.nodeName() in nonCells) {
                        self.shrink(KER.SHRINK_ELEMENT, TRUE);
                    }

                    var bookmark = self.createBookmark(),
                    // Create marker tags for the start and end boundaries.
                        startNode = bookmark.startNode,
                        endNode;
                    if (!collapsed)
                        endNode = bookmark.endNode;

                    // Create the main range which will be used for the selection.
                    var ieRange = self.document.body.createTextRange();

                    // Position the range at the start boundary.
                    ieRange.moveToElementText(startNode[0]);
                    //跳过开始 bookmark 标签
                    ieRange.moveStart('character', 1);

                    if (endNode) {
                        // Create a tool range for the end.
                        var ieRangeEnd = self.document.body.createTextRange();
                        // Position the tool range at the end.
                        ieRangeEnd.moveToElementText(endNode[0]);
                        // Move the end boundary of the main range to match the tool range.
                        ieRange.setEndPoint('EndToEnd', ieRangeEnd);
                        ieRange.moveEnd('character', -1);
                    }
                    else {
                        // The isStartMarkerAlone logic comes from V2. It guarantees that the lines
                        // will expand and that the cursor will be blinking on the right place.
                        // Actually, we are using this flag just to avoid using this hack in all
                        // situations, but just on those needed.
                        var next = startNode[0].nextSibling;
                        while (next && !notWhitespaces(next)) {
                            next = next.nextSibling;
                        }
                        isStartMarkerAlone = (
                            !( next && next.nodeValue && next.nodeValue.match(fillerTextRegex) )
                                &&
                                // already a filler there?
                                ( forceExpand || !startNode[0].previousSibling ||
                                    (
                                        startNode[0].previousSibling &&
                                            DOM.nodeName(startNode[0].previousSibling) == 'br'
                                        )
                                    )
                            );

                        // Append a temporary <span>&#65279;</span> before the selection.
                        // This is needed to avoid IE destroying selections inside empty
                        // inline elements, like <b></b> (#253).
                        // It is also needed when placing the selection right after an inline
                        // element to avoid the selection moving inside of it.
                        dummySpan = new Node(self.document.createElement('span'));
                        dummySpan.html('&#65279;');	// Zero Width No-Break Space (U+FEFF). See #1359.
                        dummySpan.insertBefore(startNode);
                        if (isStartMarkerAlone) {
                            // To expand empty blocks or line spaces after <br>, we need
                            // instead to have any char, which will be later deleted using the
                            // selection.
                            // \ufeff = Zero Width No-Break Space (U+FEFF). (#1359)
                            DOM.insertBefore(self.document.createTextNode('\ufeff'), startNode[0] || startNode);
                        }
                    }

                    // Remove the markers (reset the position, because of the changes in the DOM tree).
                    self.setStartBefore(startNode);
                    startNode._4e_remove();

                    if (collapsed) {
                        if (isStartMarkerAlone) {
                            // Move the selection start to include the temporary \ufeff.
                            ieRange.moveStart('character', -1);
                            ieRange.select();
                            // Remove our temporary stuff.
                            self.document.selection.clear();
                        } else
                            ieRange.select();
                        if (dummySpan) {
                            self.moveToPosition(dummySpan, KER.POSITION_BEFORE_START);
                            dummySpan._4e_remove();
                        }
                    } else {
                        self.setEndBefore(endNode);
                        endNode._4e_remove();
                        ieRange.select();
                    }
                };


    function getSelection(doc) {
        var sel = new KESelection(doc);
        return ( !sel || sel.isInvalid ) ? NULL : sel;
    }

    KESelection.getSelection = getSelection;

    Editor.Selection = KESelection;

    return KESelection;
}, {
    requires: ['./base', './walker', './range', './dom']
});
/**
 * ie selection fix.
 * modified from ckeditor core
 * @author yiminghe@gmail.com
 */
/*
 Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.html or http://ckeditor.com/license
 */
KISSY.add("editor/core/selectionFix", function (S, Editor) {

    var TRUE = true,
        FALSE = false,
        NULL = null,
        UA = S.UA,
        Event = S.Event,
        DOM = S.DOM,
        Node = S.Node,
        KES = Editor.SELECTION;

    /**
     * 2012-01-11 借鉴 tinymce
     * 解决：ie 没有滚动条时，点击窗口空白区域，光标不能正确定位
     */
    function fixCursorForIE(editor) {
        var started,
            win = editor.get("window")[0],
            doc = editor.get("document")[0],
            startRng;

        // Return range from point or NULL if it failed
        function rngFromPoint(x, y) {
            var rng = doc.body.createTextRange();

            try {
                rng['moveToPoint'](x, y);
            } catch (ex) {
                // IE sometimes throws and exception, so lets just ignore it
                rng = NULL;
            }

            return rng;
        }

        // Removes listeners
        function endSelection() {
            var rng = doc.selection.createRange();

            // If the range is collapsed then use the last start range
            if (startRng &&
                !rng.item && rng.compareEndPoints('StartToEnd', rng) === 0) {
                startRng.select();
            }
            Event.remove(doc, 'mouseup', endSelection);
            Event.remove(doc, 'mousemove', selectionChange);
            startRng = started = 0;
        }

        // Fires while the selection is changing
        function selectionChange(e) {
            var pointRng;

            // Check if the button is down or not
            if (e.button) {
                // Create range from mouse position
                pointRng = rngFromPoint(e.pageX, e.pageY);

                if (pointRng) {
                    // Check if pointRange is before/after selection then change the endPoint
                    if (pointRng.compareEndPoints('StartToStart', startRng) > 0)
                        pointRng.setEndPoint('StartToStart', startRng);
                    else
                        pointRng.setEndPoint('EndToEnd', startRng);

                    pointRng.select();
                }
            } else {
                endSelection();
            }
        }

        // ie 点击空白处光标不能定位到末尾
        // IE has an issue where you can't select/move the caret by clicking outside the body if the document is in standards mode
        Event.on(doc, "mousedown contextmenu", function (e) {
            var html = doc.documentElement;
            if (e.target === html) {
                if (started) {
                    endSelection();
                }
                // Detect vertical scrollbar, since IE will fire a mousedown on the scrollbar and have target set as HTML
                if (html.scrollHeight > html.clientHeight) {
                    return;
                }
                // S.log("fix ie cursor");
                started = 1;
                // Setup start position
                startRng = rngFromPoint(e.pageX, e.pageY);
                if (startRng) {
                    // Listen for selection change events
                    Event.on(doc, 'mouseup', endSelection);
                    Event.on(doc, 'mousemove', selectionChange);

                    win.focus();
                    startRng.select();
                }
            }
        });
    }


    function fixSelectionForIEWhenDocReady(editor) {
        var doc = editor.get("document")[0],
            body = new Node(doc.body),
            html = new Node(doc.documentElement);
        //ie 焦点管理不行 (ie9 也不行) ,编辑器 iframe 失去焦点，选择区域/光标位置也丢失了
        //ie中事件都是同步，focus();xx(); 会立即触发事件处理函数，然后再运行xx();

        // In IE6/7 the blinking cursor appears, but contents are
        // not editable. (#5634)
        if (//ie8 的 7 兼容模式
            Editor.Utils.ieEngine < 8) {
            // The 'click' event is not fired when clicking the
            // scrollbars, so we can use it to check whether
            // the empty space following <body> has been clicked.
            html.on('click', function (evt) {
                var t = new Node(evt.target);
                if (t.nodeName() === "html") {
                    editor.getSelection().getNative().createRange().select();
                }
            });
        }


        // Other browsers don't loose the selection if the
        // editor document loose the focus. In IE, we don't
        // have support for it, so we reproduce it here, other
        // than firing the selection change event.

        var savedRange,
            saveEnabled,
        // 2010-10-08 import from ckeditor 3.4.1
        // 点击(mousedown-focus-mouseup)，不保留原有的 selection
            restoreEnabled = TRUE;

        // Listening on document element ensures that
        // scrollbar is included. (#5280)
        // or body.on('mousedown')
        html.on('mousedown', function () {
            // Lock restore selection now, as we have
            // a followed 'click' event which introduce
            // new selection. (#5735)
            //点击时不要恢复了，点击就意味着原来的选择区域作废
            restoreEnabled = FALSE;
        });

        html.on('mouseup', function () {
            restoreEnabled = TRUE;
        });

        //事件顺序
        // 1.body mousedown
        // 2.html mousedown
        // body  blur
        // window blur
        // 3.body focusin
        // 4.body focus
        // 5.window focus
        // 6.body mouseup
        // 7.body mousedown
        // 8.body click
        // 9.html click
        // 10.doc click

        // "onfocusin" is fired before "onfocus". It makes it
        // possible to restore the selection before click
        // events get executed.
        body.on('focusin', function (evt) {
            var t = new Node(evt.target);
            // If there are elements with layout they fire this event but
            // it must be ignored to allow edit its contents #4682
            if (t.nodeName() != 'body')
                return;

            // If we have saved a range, restore it at this
            // point.
            if (savedRange) {
                // Well not break because of this.
                try {
                    // S.log("body focusin");
                    // 如果不是 mousedown 引起的 focus
                    if (restoreEnabled) {
                        savedRange.select();
                    }
                }
                catch (e) {
                }

                savedRange = NULL;
            }
        });

        body.on('focus', function () {
            // S.log("body focus");
            // Enable selections to be saved.
            saveEnabled = TRUE;
            saveSelection();
        });

        body.on('beforedeactivate', function (evt) {
            // Ignore this event if it's caused by focus switch between
            // internal editable control type elements, e.g. layouted paragraph. (#4682)
            if (evt.relatedTarget)
                return;

            // S.log("beforedeactivate");
            // Disable selections from being saved.
            saveEnabled = FALSE;
            restoreEnabled = TRUE;
        });

        // IE before version 8 will leave cursor blinking inside the document after
        // editor blurred unless we clean up the selection. (#4716)
// http://yiminghe.github.com/lite-ext/playground/iframe_selection_ie/demo.html
// 需要第一个 hack
//            editor.on('blur', function () {
//                // 把选择区域与光标清除
//                // Try/Catch to avoid errors if the editor is hidden. (#6375)
//                // S.log("blur");
//                try {
//                    var el = document.documentElement || document.body;
//                    var top = el.scrollTop, left = el.scrollLeft;
//                    doc && doc.selection.empty();
//                    //in case if window scroll to editor
//                    el.scrollTop = top;
//                    el.scrollLeft = left;
//                } catch (e) {
//                }
//            });

        // IE fires the "selectionchange" event when clicking
        // inside a selection. We don't want to capture that.
        body.on('mousedown', function () {
            // S.log("body mousedown");
            saveEnabled = FALSE;
        });
        body.on('mouseup', function () {
            // S.log("body mouseup");
            saveEnabled = TRUE;
            setTimeout(function () {
                saveSelection(TRUE);
            }, 0);
        });

        /**
         *
         * @param {Boolean=} testIt
         */
        function saveSelection(testIt) {
            // S.log("saveSelection");
            if (saveEnabled) {
                var sel = editor.getSelection(),
                    type = sel && sel.getType(),
                    nativeSel = sel && doc.selection;

                // There is a very specific case, when clicking
                // inside a text selection. In that case, the
                // selection collapses at the clicking point,
                // but the selection object remains in an
                // unknown state, making createRange return a
                // range at the very start of the document. In
                // such situation we have to test the range, to
                // be sure it's valid.
                // 右键时，若前一个操作选中，则该次一直为None
                if (testIt && nativeSel && type == KES.SELECTION_NONE) {
                    // The "InsertImage" command can be used to
                    // test whether the selection is good or not.
                    // If not, it's enough to give some time to
                    // IE to put things in order for us.
                    if (!doc['queryCommandEnabled']('InsertImage')) {
                        setTimeout(function () {
                            //S.log("retry");
                            saveSelection(TRUE);
                        }, 50);
                        return;
                    }
                }

                // Avoid saving selection from within text input. (#5747)
                var parentTag;
                if (nativeSel && nativeSel.type && nativeSel.type != 'Control'
                    && ( parentTag = nativeSel.createRange() )
                    && ( parentTag = parentTag.parentElement() )
                    && ( parentTag = parentTag.nodeName )
                    && parentTag.toLowerCase() in { input: 1, textarea: 1 }) {
                    return;
                }
                savedRange = nativeSel && sel.getRanges()[ 0 ];
                // S.log("monitor ing...");
                // 同时检测，不同则 editor 触发 selectionChange
                editor.checkSelectionChange();
            }
        }

        body.on('keydown', function () {
            saveEnabled = FALSE;
        });
        body.on('keyup', function () {
            saveEnabled = TRUE;
            setTimeout(function () {
                saveSelection();
            }, 0);
        });
    }

    function fireSelectionChangeForNonIE(editor) {
        var doc = editor.get("document")[0];
        // In other browsers, we make the selection change
        // check based on other events, like clicks or keys
        // press.
        function monitor() {
            // S.log("fireSelectionChangeForNonIE in selection/index");
            editor.checkSelectionChange();
        }

        Event.on(doc, 'mouseup keyup ' +
            // ios does not fire mouseup/keyup ....
            // http://stackoverflow.com/questions/8442158/selection-change-event-in-contenteditable
            // https://www.w3.org/Bugs/Public/show_bug.cgi?id=13952
            // https://bugzilla.mozilla.org/show_bug.cgi?id=571294
            // firefox does not has selectionchange
            'selectionchange', monitor);
    }

    /**
     * 监控选择区域变化
     * @param editor
     */
    function monitorSelectionChange(editor) {
        // Matching an empty paragraph at the end of document.
        // 注释也要排除掉
        var emptyParagraphRegexp =
            /\s*<(p|div|address|h\d|center)[^>]*>\s*(?:<br[^>]*>|&nbsp;|\u00A0|&#160;|(<!--[\s\S]*?-->))?\s*(:?<\/\1>)?(?=\s*$|<\/body>)/gi;


        function isBlankParagraph(block) {
            return block.outerHTML().match(emptyParagraphRegexp);
        }

        var isNotWhitespace = Editor.Walker.whitespaces(TRUE),
            isNotBookmark = Editor.Walker.bookmark(FALSE, TRUE);
        //除去注释和空格的下一个有效元素
        var nextValidEl = function (node) {
            return isNotWhitespace(node) && node.nodeType != 8
        };

        // 光标可以不能放在里面
        function cannotCursorPlaced(element) {
            var dtd = Editor.XHTML_DTD;
            return element._4e_isBlockBoundary() && dtd.$empty[ element.nodeName() ];
        }

        function isNotEmpty(node) {
            return isNotWhitespace(node) && isNotBookmark(node);
        }

        /**
         * 如果选择了body下面的直接inline元素，则新建p
         */
        editor.on("selectionChange", function (ev) {
            // S.log("monitor selectionChange in selection/index.js");
            var path = ev.path,
                body = new Node(editor.get("document")[0].body),
                selection = ev.selection,
                range = selection && selection.getRanges()[0],
                blockLimit = path.blockLimit;

            // Fix gecko link bug, when a link is placed at the end of block elements there is
            // no way to move the caret behind the link. This fix adds a bogus br element after the link
            // kissy-editor #12
            if (UA['gecko']) {
                var pathBlock = path.block || path.blockLimit,
                    lastNode = pathBlock && pathBlock.last(isNotEmpty);
                if (pathBlock
                    // style as block
                    && pathBlock._4e_isBlockBoundary()
                    // lastNode is not block
                    && !( lastNode && lastNode[0].nodeType == 1 && lastNode._4e_isBlockBoundary() )
                    // not pre
                    && pathBlock.nodeName() != 'pre'
                    // does not have bogus
                    && !pathBlock._4e_getBogus()) {
                    pathBlock._4e_appendBogus();
                }
            }

            if (!range ||
                !range.collapsed ||
                path.block) {
                return;
            }

            // 裸的光标出现在 body 里面
            if (blockLimit.nodeName() == "body") {
                var fixedBlock = range.fixBlock(TRUE, "p");
                if (fixedBlock &&
                    // https://dev.ckeditor.com/ticket/8550
                    // 新加的 p 在 body 最后，那么不要删除
                    // <table><td/></table>^ => <table><td/></table><p>^</p>
                    fixedBlock[0] != body[0].lastChild) {
                    // firefox选择区域变化时自动添加空行，不要出现裸的text
                    if (isBlankParagraph(fixedBlock)) {
                        var element = fixedBlock.next(nextValidEl, 1);
                        if (element &&
                            element[0].nodeType == DOM.NodeType.ELEMENT_NODE &&
                            !cannotCursorPlaced[ element ]) {
                            range.moveToElementEditablePosition(element);
                            fixedBlock._4e_remove();
                        } else {
                            element = fixedBlock.prev(nextValidEl, 1);
                            if (element &&
                                element[0].nodeType == DOM.NodeType.ELEMENT_NODE &&
                                !cannotCursorPlaced[element]) {
                                range.moveToElementEditablePosition(element,
                                    // 空行的话还是要移到开头的
                                    isBlankParagraph(element) ? FALSE : TRUE);
                                fixedBlock._4e_remove();
                            } else {
                                // 否则的话，就在文章中间添加空行了！
                            }
                        }
                    }
                }
                range.select();
                // 选择区域变了，通知其他插件更新状态
                editor.notifySelectionChange();
            }

            /**
             *  当 table pre div 是 body 最后一个元素时，鼠标没法移到后面添加内容了
             *  解决：增加新的 p
             */
            var doc = editor.get("document")[0],
                lastRange = new Editor.Range(doc),
                lastPath, editBlock;
            // 最后的编辑地方
            lastRange
                .moveToElementEditablePosition(body,
                TRUE);
            lastPath = new Editor.ElementPath(lastRange.startContainer);
            // 不位于 <body><p>^</p></body>
            if (lastPath.blockLimit.nodeName() !== 'body') {
                editBlock = new Node(doc.createElement('p')).appendTo(body);
                if (!UA['ie']) {
                    editBlock._4e_appendBogus();
                }
            }
        });
    }

    return {
        init: function (editor) {
            editor.docReady(function () {
                // S.log("editor docReady for fix selection");
                if (UA.ie) {
                    fixCursorForIE(editor);
                    fixSelectionForIEWhenDocReady(editor);
                } else {
                    fireSelectionChangeForNonIE(editor);
                }
            });
            // 1. 选择区域变化时各个浏览器的奇怪修复
            // 2. 触发 selectionChange 事件
            monitorSelectionChange(editor);
        }
    };
}, {
    requires: ['./base', './selection']
});
/**
 * Use style to gen element and wrap range's elements.Modified from CKEditor.
 * @author yiminghe@gmail.com
 */
/*
 Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.html or http://ckeditor.com/license
 */
KISSY.add("editor/core/styles", function (S, Editor) {

    var TRUE = true,
        FALSE = false,
        NULL = null,
        $ = S.all,
        DOM = S.DOM,
        /**
         * enum for style type
         * @enum {number}
         */
            KEST = {
            STYLE_BLOCK: 1,
            STYLE_INLINE: 2,
            STYLE_OBJECT: 3
        },
        KER = Editor.RANGE,
        KESelection = Editor.Selection,
        KEP = Editor.POSITION,
        KERange = Editor.Range,
    //Walker = Editor.Walker,
        Node = S.Node,
        UA = S.UA,
        ElementPath = Editor.ElementPath,
        blockElements = {
            "address": 1,
            "div": 1,
            "h1": 1,
            "h2": 1,
            "h3": 1,
            "h4": 1,
            "h5": 1,
            "h6": 1,
            "p": 1,
            "pre": 1
        },
        DTD = Editor.XHTML_DTD,
        objectElements = {
            //why? a should be same to inline? 但是不能互相嵌套
            //a:1,
            "embed": 1,
            "hr": 1,
            "img": 1,
            "li": 1,
            "object": 1,
            "ol": 1,
            "table": 1,
            "td": 1,
            "tr": 1,
            "th": 1,
            "ul": 1,
            "dl": 1,
            "dt": 1,
            "dd": 1,
            "form": 1
        },
        semicolonFixRegex = /\s*(?:;\s*|$)/g,
        varRegex = /#\((.+?)\)/g;

    Editor.STYLE = KEST;

    function notBookmark(node) {
        //only get attributes on element nodes by kissy
        //when textnode attr() return undefined ,wonderful !!!
        return !DOM.attr(node, "_ke_bookmark");
    }

    function replaceVariables(list, variablesValues) {
        for (var item in list) {
            if (typeof (list[ item ]) == 'string') {
                list[ item ] = list[ item ].replace(varRegex, function (match, varName) {
                    return variablesValues[ varName ];
                });
            } else {
                replaceVariables(list[ item ], variablesValues);
            }
        }
    }

    /**
     * @constructor
     * @param styleDefinition {Object}
     * @param [variablesValues] {Object}
     */
    function KEStyle(styleDefinition, variablesValues) {
        if (variablesValues) {
            styleDefinition = S.clone(styleDefinition);
            replaceVariables(styleDefinition, variablesValues);
        }

        var element = this["element"] = this.element = ( styleDefinition["element"] || '*' ).toLowerCase();

        this["type"] = this.type = ( element == '#text' || blockElements[ element ] ) ?
            KEST.STYLE_BLOCK
            : objectElements[ element ] ?
            KEST.STYLE_OBJECT : KEST.STYLE_INLINE;

        this._ = {
            "definition": styleDefinition
        };
    }

    /**
     *
     * @param {Document} document
     * @param {Boolean=} remove
     */
    function applyStyle(document, remove) {
        // Get all ranges from the selection.
        var self = this,
            func = remove ? self.removeFromRange : self.applyToRange;
        // Apply the style to the ranges.
        //ie select 选中期间document得不到range
        document.body.focus();

        var selection = new KESelection(document);
        // Bookmark the range so we can re-select it after processing.
        var ranges = selection.getRanges();
        for (var i = 0; i < ranges.length; i++) {
            //格式化后，range进入格式标签内
            func.call(self, ranges[ i ]);
        }
        selection.selectRanges(ranges);
    }

    KEStyle.prototype = {

        constructor:KEStyle,

        apply: function (document) {
            applyStyle.call(this, document, FALSE);
        },

        remove: function (document) {
            applyStyle.call(this, document, TRUE);
        },

        applyToRange: function (range) {
            var self = this;
            return ( self.applyToRange =
                this.type == KEST.STYLE_INLINE ?
                    applyInlineStyle
                    : self.type == KEST.STYLE_BLOCK ?
                    applyBlockStyle
                    : self.type == KEST.STYLE_OBJECT ?
                    NULL
                    //yiminghe note:no need!
                    //applyObjectStyle
                    : NULL ).call(self, range);
        },

        removeFromRange: function (range) {
            var self = this;
            return ( self.removeFromRange =
                self.type == KEST.STYLE_INLINE ?
                    removeInlineStyle
                    : NULL ).call(self, range);
        },

//        applyToObject : function(element) {
//            setupElement(element, this);
//        },
        // Checks if an element, or any of its attributes, is removable by the
        // current style definition.
        checkElementRemovable: function (element, fullMatch) {
            if (!element)
                return FALSE;

            var def = this._.definition,
                attribs, styles;

            // If the element name is the same as the style name.
            if (element.nodeName() == this.element) {
                // If no attributes are defined in the element.
                if (!fullMatch && !element._4e_hasAttributes())
                    return TRUE;

                attribs = getAttributesForComparison(def);

                if (attribs["_length"]) {
                    for (var attName in attribs) {

                        if (attName == '_length')
                            continue;

                        var elementAttr = element.attr(attName) || '';
                        if (attName == 'style' ?
                            compareCssText(attribs[ attName ],
                                normalizeCssText(elementAttr, FALSE))
                            : attribs[ attName ] == elementAttr) {
                            if (!fullMatch)
                                return TRUE;
                        }
                        else if (fullMatch)
                            return FALSE;

                    }
                    if (fullMatch)
                        return TRUE;
                }
                else
                    return TRUE;
            }

            // Check if the element can be somehow overriden.
            var overrides = getOverrides(this),
                override = overrides[ element.nodeName() ] || overrides["*"];

            if (override) {
                // If no attributes have been defined, remove the element.
                if (!( attribs = override.attributes )
                    &&
                    !( styles = override.styles)
                    )
                    return TRUE;
                if (attribs) {
                    for (var i = 0; i < attribs.length; i++) {
                        attName = attribs[i][0];
                        var actualAttrValue = element.attr(attName);
                        if (actualAttrValue) {
                            var attValue = attribs[i][1];
                            // Remove the attribute if:
                            //    - The override definition value is NULL;
                            //    - The override definition value is a string that
                            //      matches the attribute value exactly.
                            //    - The override definition value is a regex that
                            //      has matches in the attribute value.
                            if (attValue === NULL ||
                                ( typeof attValue == 'string'
                                    && actualAttrValue == attValue ) ||
                                attValue.test && attValue.test(actualAttrValue))
                                return TRUE;
                        }
                    }
                }
                if (styles) {
                    for (i = 0; i < styles.length; i++) {
                        var styleName = styles[i][0];
                        var actualStyleValue = element.css(styleName);
                        if (actualStyleValue) {
                            var styleValue = styles[i][1];
                            if (styleValue === NULL
                                //inherit wildcard !
                                //|| styleValue == "inherit"
                                || ( typeof styleValue == 'string'
                                && actualStyleValue == styleValue ) ||
                                styleValue.test && styleValue.test(actualStyleValue))
                                return TRUE;
                        }
                    }
                }
            }
            return FALSE;
        },

        /**
         * Get the style state inside an element path. Returns "TRUE" if the
         * element is active in the path.
         */
        checkActive: function (elementPath) {
            switch (this.type) {
                case KEST.STYLE_BLOCK :
                    return this.checkElementRemovable(elementPath.block
                        || elementPath.blockLimit, TRUE);

                case KEST.STYLE_OBJECT :
                case KEST.STYLE_INLINE :

                    var elements = elementPath.elements;

                    for (var i = 0, element; i < elements.length; i++) {
                        element = elements[ i ];

                        if (this.type == KEST.STYLE_INLINE
                            && ( DOM.equals(element, elementPath.block)
                            || DOM.equals(element, elementPath.blockLimit) ))
                            continue;

                        if (this.type == KEST.STYLE_OBJECT
                            && !( element.nodeName() in objectElements ))
                            continue;

                        if (this.checkElementRemovable(element, TRUE))
                            return TRUE;
                    }
            }
            return FALSE;
        }

    };

    KEStyle.getStyleText = function (styleDefinition) {
        // If we have already computed it, just return it.
        var stylesDef = styleDefinition._ST;
        if (stylesDef)
            return stylesDef;

        stylesDef = styleDefinition["styles"];

        // Builds the StyleText.
        var stylesText = ( styleDefinition["attributes"]
                && styleDefinition["attributes"][ 'style' ] ) || '',
            specialStylesText = '';

        if (stylesText.length)
            stylesText = stylesText.replace(semicolonFixRegex, ';');

        for (var style in stylesDef) {

            var styleVal = stylesDef[ style ],
                text = ( style + ':' + styleVal ).replace(semicolonFixRegex, ';');

            // Some browsers don't support 'inherit' property value, leave them intact. (#5242)
            if (styleVal == 'inherit')
                specialStylesText += text;
            else
                stylesText += text;

        }

        // Browsers make some changes to the style when applying them. So, here
        // we normalize it to the browser format.
        if (stylesText.length)
            stylesText = normalizeCssText(stylesText);

        stylesText += specialStylesText;

        // Return it, saving it to the next request.
        return ( styleDefinition._ST = stylesText );
    };

    function getElement(style, targetDocument, element) {
        var el,
        //def = style._.definition,
            elementName = style["element"];

        // The "*" element name will always be a span for this function.
        if (elementName == '*')
            elementName = 'span';

        // Create the element.
        el = new Node(targetDocument.createElement(elementName));

        // #6226: attributes should be copied before the new ones are applied
        if (element)
            element._4e_copyAttributes(el);

        return setupElement(el, style);
    }

    function setupElement(el, style) {
        var def = style._["definition"],
            attributes = def["attributes"],
            styles = KEStyle.getStyleText(def);

        // Assign all defined attributes.
        if (attributes) {
            for (var att in attributes) {
                el.attr(att, attributes[ att ]);
            }
        }

        // Assign all defined styles.

        if (styles)
            el[0].style.cssText = styles;

        return el;
    }

    function applyBlockStyle(range) {
        // Serializible bookmarks is needed here since
        // elements may be merged.
        var bookmark = range.createBookmark(TRUE),
            iterator = range.createIterator();
        iterator.enforceRealBlocks = TRUE;

        // make recognize <br /> tag as a separator in ENTER_BR mode (#5121)
        //if (this._.enterMode)
        iterator.enlargeBr = TRUE;

        var block, doc = range.document;
        // Only one =
        while (( block = iterator.getNextParagraph() )) {
            var newBlock = getElement(this, doc, block);
            replaceBlock(block, newBlock);
        }
        range.moveToBookmark(bookmark);
    }

    // Wrapper function of String::replace without considering of head/tail bookmarks nodes.
    function replace(str, regexp, replacement) {
        var headBookmark = '',
            tailBookmark = '';

        str = str.replace(/(^<span[^>]+_ke_bookmark.*?\/span>)|(<span[^>]+_ke_bookmark.*?\/span>$)/gi,
            function (str, m1, m2) {
                m1 && ( headBookmark = m1 );
                m2 && ( tailBookmark = m2 );
                return '';
            });
        return headBookmark + str.replace(regexp, replacement) + tailBookmark;
    }

    /**
     * Converting from a non-PRE block to a PRE block in formatting operations.
     */
    function toPre(block, newBlock) {
        // First trim the block content.
        var preHTML = block.html();

        // 1. Trim head/tail spaces, they're not visible.
        preHTML = replace(preHTML, /(?:^[ \t\n\r]+)|(?:[ \t\n\r]+$)/g, '');
        // 2. Delete ANSI whitespaces immediately before and after <BR> because
        //    they are not visible.
        preHTML = preHTML.replace(/[ \t\r\n]*(<br[^>]*>)[ \t\r\n]*/gi, '$1');
        // 3. Compress other ANSI whitespaces since they're only visible as one
        //    single space previously.
        // 4. Convert &nbsp; to spaces since &nbsp; is no longer needed in <PRE>.
        preHTML = preHTML.replace(/([ \t\n\r]+|&nbsp;)/g, ' ');
        // 5. Convert any <BR /> to \n. This must not be done earlier because
        //    the \n would then get compressed.
        preHTML = preHTML.replace(/<br\b[^>]*>/gi, '\n');

        // Krugle: IE normalizes innerHTML to <pre>, breaking whitespaces.
        if (UA['ie']) {
            var temp = block[0].ownerDocument.createElement('div');
            temp.appendChild(newBlock[0]);
            newBlock[0].outerHTML = '<pre>' + preHTML + '</pre>';
            newBlock = new Node(temp.firstChild);
            newBlock._4e_remove();
        }
        else
            newBlock.html(preHTML);

        return newBlock;
    }

    /**
     * Split into multiple <pre> blocks separated by double line-break.
     * @param preBlock
     */
    function splitIntoPres(preBlock) {
        // Exclude the ones at header OR at tail,
        // and ignore bookmark content between them.
        var duoBrRegex = /(\S\s*)\n(?:\s|(<span[^>]+_ck_bookmark.*?\/span>))*\n(?!$)/gi,
        //blockName = preBlock.nodeName(),
            splittedHTML = replace(preBlock.outerHTML(),
                duoBrRegex,
                function (match, charBefore, bookmark) {
                    return charBefore + '</pre>' + bookmark + '<pre>';
                });

        var pres = [];
        splittedHTML.replace(/<pre\b.*?>([\s\S]*?)<\/pre>/gi,
            function (match, preContent) {
                pres.push(preContent);
            });
        return pres;
    }

    // Replace the original block with new one, with special treatment
    // for <pre> blocks to make sure content format is well preserved, and merging/splitting adjacent
    // when necessary.(#3188)
    function replaceBlock(block, newBlock) {
        var newBlockIsPre = newBlock.nodeName == ('pre'),
            blockIsPre = block.nodeName == ('pre'),
            isToPre = newBlockIsPre && !blockIsPre,
            isFromPre = !newBlockIsPre && blockIsPre;

        if (isToPre)
            newBlock = toPre(block, newBlock);
        else if (isFromPre)
        // Split big <pre> into pieces before start to convert.
            newBlock = fromPres(splitIntoPres(block), newBlock);
        else
            block._4e_moveChildren(newBlock);

        block[0].parentNode.replaceChild(newBlock[0], block[0]);
        if (newBlockIsPre) {
            // Merge previous <pre> blocks.
            mergePre(newBlock);
        }
    }

    /**
     * Merge a <pre> block with a previous sibling if available.
     */
    function mergePre(preBlock) {
        var previousBlock;
        if (!( ( previousBlock = preBlock._4e_previousSourceNode(TRUE, DOM.NodeType.ELEMENT_NODE) )
            && previousBlock.nodeName() == 'pre' ))
            return;

        // Merge the previous <pre> block contents into the current <pre>
        // block.
        //
        // Another thing to be careful here is that currentBlock might contain
        // a '\n' at the beginning, and previousBlock might contain a '\n'
        // towards the end. These new lines are not normally displayed but they
        // become visible after merging.
        var mergedHTML = replace(previousBlock.html(), /\n$/, '') + '\n\n' +
            replace(preBlock.html(), /^\n/, '');

        // Krugle: IE normalizes innerHTML from <pre>, breaking whitespaces.
        if (UA['ie'])
            preBlock[0].outerHTML = '<pre>' + mergedHTML + '</pre>';
        else
            preBlock.html(mergedHTML);

        previousBlock._4e_remove();
    }

    /**
     * Converting a list of <pre> into blocks with format well preserved.
     */
    function fromPres(preHTMLs, newBlock) {
        var docFrag = newBlock[0].ownerDocument.createDocumentFragment();
        for (var i = 0; i < preHTMLs.length; i++) {
            var blockHTML = preHTMLs[ i ];

            // 1. Trim the first and last line-breaks immediately after and before <pre>,
            // they're not visible.
            blockHTML = blockHTML.replace(/(\r\n|\r)/g, '\n');
            blockHTML = replace(blockHTML, /^[ \t]*\n/, '');
            blockHTML = replace(blockHTML, /\n$/, '');
            // 2. Convert spaces or tabs at the beginning or at the end to &nbsp;
            blockHTML = replace(blockHTML, /^[ \t]+|[ \t]+$/g, function (match, offset) {
                if (match.length == 1)    // one space, preserve it
                    return '&nbsp;';
                else if (!offset)        // beginning of block
                    return new Array(match.length).join('&nbsp;') + ' ';
                else                // end of block
                    return ' ' + new Array(match.length).join('&nbsp;');
            });

            // 3. Convert \n to <BR>.
            // 4. Convert contiguous (i.e. non-singular) spaces or tabs to &nbsp;
            blockHTML = blockHTML.replace(/\n/g, '<br>');
            blockHTML = blockHTML.replace(/[ \t]{2,}/g,
                function (match) {
                    return new Array(match.length).join('&nbsp;') + ' ';
                });

            var newBlockClone = newBlock.clone();
            newBlockClone.html(blockHTML);
            docFrag.appendChild(newBlockClone[0]);
        }
        return docFrag;
    }

    /**
     *
     * @param range
     */
    function applyInlineStyle(range) {
        var self = this,
            document = range.document;

        if (range.collapsed) {
            // Create the element to be inserted in the DOM.
            var collapsedElement = getElement(this, document, undefined);
            // Insert the empty element into the DOM at the range position.
            range.insertNode(collapsedElement);
            // Place the selection right inside the empty element.
            range.moveToPosition(collapsedElement, KER.POSITION_BEFORE_END);
            return;
        }
        var elementName = this["element"],
            def = this._["definition"],
            isUnknownElement,
        // Get the DTD definition for the element. Defaults to "span".
            dtd = DTD[ elementName ];
        if (!dtd) {
            isUnknownElement = TRUE;
            dtd = DTD["span"];
        }

        // Bookmark the range so we can re-select it after processing.
        var bookmark = range.createBookmark();

        // Expand the range.
        range.enlarge(KER.ENLARGE_ELEMENT);
        range.trim();

        // Get the first node to be processed and the last, which concludes the
        // processing.
        var boundaryNodes = range.createBookmark(),
            firstNode = boundaryNodes.startNode,
            lastNode = boundaryNodes.endNode,
            currentNode = firstNode,
            styleRange;

        while (currentNode && currentNode[0]) {
            var applyStyle = FALSE;

            if (DOM.equals(currentNode, lastNode)) {
                currentNode = NULL;
                applyStyle = TRUE;
            }
            else {
                var nodeType = currentNode[0].nodeType,
                    nodeName = nodeType == DOM.NodeType.ELEMENT_NODE ?
                        currentNode.nodeName() : NULL;

                if (nodeName && currentNode.attr('_ke_bookmark')) {
                    currentNode = currentNode._4e_nextSourceNode(TRUE);
                    continue;
                }

                // Check if the current node can be a child of the style element.
                if (!nodeName || (
                    dtd[ nodeName ]&&
                        ( currentNode._4e_position(lastNode) |
                            ( KEP.POSITION_PRECEDING |
                            KEP.POSITION_IDENTICAL |
                            KEP.POSITION_IS_CONTAINED) )
                            == ( KEP.POSITION_PRECEDING +
                            KEP.POSITION_IDENTICAL +
                            KEP.POSITION_IS_CONTAINED )&&
                        ( !def["childRule"] || def["childRule"](currentNode) )
                    )) {
                    var currentParent = currentNode.parent();


                    // hack for
                    // 1<a href='http://www.taobao.com'>2</a>3
                    // select all ,set link to http://www.ckeditor.com
                    // expect => <a href='http://www.ckeditor.com'>123</a> (same with tinymce)
                    // but now => <a href="http://www.ckeditor.com">1</a>
                    // <a href="http://www.taobao.com">2</a>
                    // <a href="http://www.ckeditor.com">3</a>
                    // http://dev.ckeditor.com/ticket/8470
                    if (currentParent &&
                        elementName == "a" &&
                        currentParent.nodeName() == elementName) {
                        var tmpANode = getElement(self, document, undefined);
                        currentParent._4e_moveChildren(tmpANode);
                        currentParent[0].parentNode.replaceChild(tmpANode[0], currentParent[0]);
                        tmpANode._4e_mergeSiblings();
                    }

                    // Check if the style element can be a child of the current
                    // node parent or if the element is not defined in the DTD.
                    else if (currentParent && currentParent[0]
                        && ( ( DTD[currentParent.nodeName()] ||
                        DTD["span"] )[ elementName ] ||
                        isUnknownElement )
                        && ( !def["parentRule"] || def["parentRule"](currentParent) )) {
                        // This node will be part of our range, so if it has not
                        // been started, place its start right before the node.
                        // In the case of an element node, it will be included
                        // only if it is entirely inside the range.
                        if (!styleRange &&
                            ( !nodeName
                                || !DTD.$removeEmpty[ nodeName ]
                                || ( currentNode._4e_position(lastNode) |
                                ( KEP.POSITION_PRECEDING |
                                    KEP.POSITION_IDENTICAL |
                                    KEP.POSITION_IS_CONTAINED ))
                                ==
                                ( KEP.POSITION_PRECEDING +
                                    KEP.POSITION_IDENTICAL +
                                    KEP.POSITION_IS_CONTAINED )
                                )) {
                            styleRange = new KERange(document);
                            styleRange.setStartBefore(currentNode);
                        }

                        // Non element nodes, or empty elements can be added
                        // completely to the range.
                        if (nodeType == DOM.NodeType.TEXT_NODE ||
                            ( nodeType == DOM.NodeType.ELEMENT_NODE &&
                                !currentNode[0].childNodes.length )) {
                            var includedNode = currentNode,
                                parentNode = null;

                            // This node is about to be included completelly, but,
                            // if this is the last node in its parent, we must also
                            // check if the parent itself can be added completelly
                            // to the range.
                            //2010-11-18 fix ; http://dev.ckeditor.com/ticket/6687
                            //<span><book/>123<book/></span> 直接越过末尾 <book/>

                            // If the included node still is the last node in its
                            // parent, it means that the parent can't be included
                            // in this style DTD, so apply the style immediately.
                            while (
                                (applyStyle = !includedNode.next(notBookmark, 1))
                                    && ( (parentNode = includedNode.parent()) &&
                                    dtd[ parentNode.nodeName() ] )
                                    && ( parentNode._4e_position(firstNode) |
                                    KEP.POSITION_FOLLOWING |
                                    KEP.POSITION_IDENTICAL |
                                    KEP.POSITION_IS_CONTAINED) ==
                                    ( KEP.POSITION_FOLLOWING +
                                        KEP.POSITION_IDENTICAL +
                                        KEP.POSITION_IS_CONTAINED )
                                    && ( !def["childRule"] || def["childRule"](parentNode) )) {
                                includedNode = parentNode;
                            }

                            styleRange.setEndAfter(includedNode);

                        }
                    }
                    else
                        applyStyle = TRUE;
                }
                else
                    applyStyle = TRUE;

                // Get the next node to be processed.
                currentNode = currentNode._4e_nextSourceNode();
            }

            // Apply the style if we have something to which apply it.
            if (applyStyle && styleRange && !styleRange.collapsed) {
                // Build the style element, based on the style object definition.
                var styleNode = getElement(self, document, undefined),

                // Get the element that holds the entire range.
                    parent = styleRange.getCommonAncestor();


                var removeList = {
                    styles: {},
                    attrs: {},
                    // Styles cannot be removed.
                    blockedStyles: {},
                    // Attrs cannot be removed.
                    blockedAttrs: {}
                };

                var attName, styleName = null, value;

                // Loop through the parents, removing the redundant attributes
                // from the element to be applied.
                while (styleNode && parent && styleNode[0] && parent[0]) {
                    if (parent.nodeName() == elementName) {
                        for (attName in def.attributes) {

                            if (removeList.blockedAttrs[ attName ]
                                || !( value = parent.attr(styleName) ))
                                continue;

                            if (styleNode.attr(attName) == value) {
                                //removeList.attrs[ attName ] = 1;
                                styleNode.removeAttr(attName);
                            } else
                                removeList.blockedAttrs[ attName ] = 1;

                        }
                        //bug notice add by yiminghe@gmail.com
                        //<span style="font-size:70px"><span style="font-size:30px">^xxx$</span></span>
                        //下一次格式xxx为70px
                        //var exit = FALSE;
                        for (styleName in def.styles) {

                            if (removeList.blockedStyles[ styleName ]
                                || !( value = parent.style(styleName) ))
                                continue;

                            if (styleNode.style(styleName) == value) {
                                //removeList.styles[ styleName ] = 1;
                                styleNode.style(styleName, "");
                            } else
                                removeList.blockedStyles[ styleName ] = 1;

                        }

                        if (!styleNode._4e_hasAttributes()) {
                            styleNode = NULL;
                            break;
                        }
                    }

                    parent = parent.parent();
                }

                if (styleNode) {
                    // Move the contents of the range to the style element.
                    styleNode[0].appendChild(styleRange.extractContents());

                    // Here we do some cleanup, removing all duplicated
                    // elements from the style element.
                    removeFromInsideElement(self, styleNode);

                    // Insert it into the range position (it is collapsed after
                    // extractContents.
                    styleRange.insertNode(styleNode);

                    // Let's merge our new style with its neighbors, if possible.
                    styleNode._4e_mergeSiblings();

                    // As the style system breaks text nodes constantly, let's normalize
                    // things for performance.
                    // With IE, some paragraphs get broken when calling normalize()
                    // repeatedly. Also, for IE, we must normalize body, not documentElement.
                    // IE is also known for having a "crash effect" with normalize().
                    // We should try to normalize with IE too in some way, somewhere.
                    if (!UA['ie'])
                        styleNode[0].normalize();
                }
                // Style already inherit from parents, left just to clear up any internal overrides. (#5931)
                /**
                 * from koubei
                 *1.输入ab
                 2.ctrl-a 设置字体大小 x
                 3.选中b设置字体大小 y
                 4.保持选中b,设置字体大小 x
                 expect: b 大小为 x
                 actual: b 大小为 y
                 */
                else {
                    styleNode = new Node(document.createElement("span"));
                    styleNode[0].appendChild(styleRange.extractContents());
                    styleRange.insertNode(styleNode);
                    removeFromInsideElement(self, styleNode);
                    styleNode._4e_remove(true);
                }

                // Style applied, let's release the range, so it gets
                // re-initialization in the next loop.
                styleRange = NULL;
            }
        }

        firstNode._4e_remove();
        lastNode._4e_remove();
        range.moveToBookmark(bookmark);
        // Minimize the result range to exclude empty text nodes. (#5374)
        range.shrink(KER.SHRINK_TEXT);

    }

    /**
     *
     * @param range
     */
    function removeInlineStyle(range) {
        /*
         * Make sure our range has included all "collapsed" parent inline nodes so
         * that our operation logic can be simpler.
         */
        range.enlarge(KER.ENLARGE_ELEMENT);

        var bookmark = range.createBookmark(),
            startNode = bookmark.startNode;

        if (range.collapsed) {

            var startPath = new ElementPath(startNode.parent()),
            // The topmost element in elements path which we should jump out of.
                boundaryElement;


            for (var i = 0, element; i < startPath.elements.length
                && ( element = startPath.elements[i] ); i++) {
                /*
                 * 1. If it's collapsed inside text nodes, try to remove the style from the whole element.
                 *
                 * 2. Otherwise if it's collapsed on element boundaries, moving the selection
                 *  outside the styles instead of removing the whole tag,
                 *  also make sure other inner styles were well preserved.(#3309)
                 */
                if (element == startPath.block ||
                    element == startPath.blockLimit) {
                    break;
                }
                if (this.checkElementRemovable(element)) {
                    var endOfElement = range.checkBoundaryOfElement(element, KER.END),
                        startOfElement = !endOfElement &&
                            range.checkBoundaryOfElement(element, KER.START);
                    if (startOfElement || endOfElement) {
                        boundaryElement = element;
                        boundaryElement.match = startOfElement ? 'start' : 'end';
                    } else {
                        /*
                         * Before removing the style node, there may be a sibling to the style node
                         * that's exactly the same to the one to be removed. To the user, it makes
                         * no difference that they're separate entities in the DOM tree. So, merge
                         * them before removal.
                         */
                        element._4e_mergeSiblings();
                        //yiminghe:note,bug for ckeditor
                        //qc #3700 for chengyu(yiminghe)
                        //从word复制过来的已编辑文本无法使用粗体和斜体等功能取消
                        if (element.nodeName() != this.element) {
                            var _overrides = getOverrides(this);
                            removeOverrides(element,
                                _overrides[ element.nodeName() ] || _overrides["*"]);
                        } else {
                            removeFromElement(this, element);
                        }

                    }
                }
            }

            // Re-create the style tree after/before the boundary element,
            // the replication start from bookmark start node to define the
            // new range.
            if (boundaryElement) {
                var clonedElement = startNode;
                for (i = 0; ; i++) {
                    var newElement = startPath.elements[ i ];
                    if (newElement.equals(boundaryElement))
                        break;
                    // Avoid copying any matched element.
                    else if (newElement.match)
                        continue;
                    else
                        newElement = newElement.clone();
                    newElement[0].appendChild(clonedElement[0]);
                    clonedElement = newElement;
                }
                //脱离当前的元素，将 bookmark 插入到当前元素后面
                // <strong>xx|</strong>  ->
                // <strong>xx<strong>|
                clonedElement[ boundaryElement.match == 'start' ? 'insertBefore' :
                    'insertAfter' ](boundaryElement);
                // <strong>|</strong> ->
                // <strong></strong>|
                var tmp = boundaryElement.html();
                if (!tmp ||
                    // filling char
                    tmp == '\u200b') {
                    boundaryElement.remove();
                }
                // http://code.google.com/p/chromium/issues/detail?id=149894
                else if (UA.webkit) {
                    $(range.document.createTextNode('\u200b')).insertBefore(clonedElement);
                }
            }
        } else {
            /*
             * Now our range isn't collapsed. Lets walk from the start node to the end
             * node via DFS and remove the styles one-by-one.
             */
            var endNode = bookmark.endNode,
                me = this;

            /*
             * Find out the style ancestor that needs to be broken down at startNode
             * and endNode.
             */
            function breakNodes() {
                var startPath = new ElementPath(startNode.parent()),
                    endPath = new ElementPath(endNode.parent()),
                    breakStart = NULL,
                    breakEnd = NULL;
                for (var i = 0; i < startPath.elements.length; i++) {
                    var element = startPath.elements[ i ];

                    if (element == startPath.block ||
                        element == startPath.blockLimit)
                        break;

                    if (me.checkElementRemovable(element))
                        breakStart = element;
                }
                for (i = 0; i < endPath.elements.length; i++) {
                    element = endPath.elements[ i ];

                    if (element == endPath.block ||
                        element == endPath.blockLimit)
                        break;

                    if (me.checkElementRemovable(element))
                        breakEnd = element;
                }

                if (breakEnd)
                    endNode._4e_breakParent(breakEnd);
                if (breakStart)
                    startNode._4e_breakParent(breakStart);
            }

            breakNodes();

            // Now, do the DFS walk.
            var currentNode = new Node(startNode[0].nextSibling);
            while (currentNode[0] !== endNode[0]) {
                /*
                 * Need to get the next node first because removeFromElement() can remove
                 * the current node from DOM tree.
                 */
                var nextNode = currentNode._4e_nextSourceNode();
                if (currentNode[0] &&
                    currentNode[0].nodeType == DOM.NodeType.ELEMENT_NODE &&
                    this.checkElementRemovable(currentNode)) {
                    // Remove style from element or overriding element.
                    if (currentNode.nodeName() == this["element"])
                        removeFromElement(this, currentNode);
                    else {
                        var overrides = getOverrides(this);
                        removeOverrides(currentNode,
                            overrides[ currentNode.nodeName() ] || overrides["*"]);

                    }

                    /*
                     * removeFromElement() may have merged the next node with something before
                     * the startNode via mergeSiblings(). In that case, the nextNode would
                     * contain startNode and we'll have to call breakNodes() again and also
                     * reassign the nextNode to something after startNode.
                     */
                    if (nextNode[0].nodeType == DOM.NodeType.ELEMENT_NODE &&
                        nextNode.contains(startNode)) {
                        breakNodes();
                        nextNode = new Node(startNode[0].nextSibling);
                    }
                }
                currentNode = nextNode;
            }
        }
        range.moveToBookmark(bookmark);
    }

    // Turn inline style text properties into one hash.
    /**
     *
     * @param {string} styleText
     */
    function parseStyleText(styleText) {
        styleText = String(styleText);
        var retval = {};
        styleText.replace(/&quot;/g, '"')
            .replace(/\s*([^ :;]+)\s*:\s*([^;]+)\s*(?=;|$)/g,
            function (match, name, value) {
                retval[ name ] = value;
            });
        return retval;
    }

    function compareCssText(source, target) {
        typeof source == 'string' && ( source = parseStyleText(source) );
        typeof target == 'string' && ( target = parseStyleText(target) );
        for (var name in source) {

            // Value 'inherit'  is treated as a wildcard,
            // which will match any value.
            if (!( name in target &&
                ( target[ name ] == source[ name ]
                    || source[ name ] == 'inherit'
                    || target[ name ] == 'inherit' ) )) {
                return FALSE;
            }

        }
        return TRUE;
    }

    /**
     *
     * @param {string} unparsedCssText
     * @param {Boolean=} nativeNormalize
     */
    function normalizeCssText(unparsedCssText, nativeNormalize) {
        var styleText = "";
        if (nativeNormalize !== FALSE) {
            // Injects the style in a temporary span object, so the browser parses it,
            // retrieving its final format.
            var temp = document.createElement('span');
            temp.style.cssText = unparsedCssText;
            //temp.setAttribute('style', unparsedCssText);
            styleText = temp.style.cssText || '';
        }
        else
            styleText = unparsedCssText;

        // Shrinking white-spaces around colon and semi-colon (#4147).
        // Compensate tail semi-colon.
        return styleText.replace(/\s*([;:])\s*/, '$1')
            .replace(/([^\s;])$/, "$1;")
            .replace(/,\s+/g, ',')// Trimming spaces after comma (e.g. font-family name)(#4107).
            .toLowerCase();
    }

    /**
     * 把 styles(css配置) 作为 属性 style 统一看待
     * 注意对 inherit 的处理
     * @param styleDefinition
     */
    function getAttributesForComparison(styleDefinition) {
        // If we have already computed it, just return it.
        var attribs = styleDefinition._AC;
        if (attribs) {
            return attribs;
        }
        attribs = {};

        var length = 0,

        // Loop through all defined attributes.
            styleAttribs = styleDefinition["attributes"];
        if (styleAttribs) {
            for (var styleAtt in styleAttribs) {

                length++;
                attribs[ styleAtt ] = styleAttribs[ styleAtt ];

            }
        }

        // Includes the style definitions.
        var styleText = KEStyle.getStyleText(styleDefinition);
        if (styleText) {
            if (!attribs[ 'style' ])
                length++;
            attribs[ 'style' ] = styleText;
        }

        // Appends the "length" information to the object.
        //防止被compiler优化
        attribs["_length"] = length;

        // Return it, saving it to the next request.
        return ( styleDefinition._AC = attribs );
    }


    /**
     * Get the the collection used to compare the elements and attributes,
     * defined in this style overrides, with other element. All information in
     * it is lowercased.
     * @param  style
     */
    function getOverrides(style) {
        if (style._.overrides)
            return style._.overrides;

        var overrides = ( style._.overrides = {} ),
            definition = style._.definition["overrides"];

        if (definition) {
            // The override description can be a string, object or array.
            // Internally, well handle arrays only, so transform it if needed.
            if (!S.isArray(definition))
                definition = [ definition ];

            // Loop through all override definitions.
            for (var i = 0; i < definition.length; i++) {
                var override = definition[i];
                var elementName;
                var overrideEl;
                var attrs, styles;

                // If can be a string with the element name.
                if (typeof override == 'string')
                    elementName = override.toLowerCase();
                // Or an object.
                else {
                    elementName = override["element"] ?
                        override["element"].toLowerCase() :
                        style.element;
                    attrs = override["attributes"];
                    styles = override["styles"];
                }

                // We can have more than one override definition for the same
                // element name, so we attempt to simply append information to
                // it if it already exists.
                overrideEl = overrides[ elementName ] ||
                    ( overrides[ elementName ] = {} );

                if (attrs) {
                    // The returning attributes list is an array, because we
                    // could have different override definitions for the same
                    // attribute name.
                    var overrideAttrs = ( overrideEl["attributes"] =
                        overrideEl["attributes"] || new Array() );
                    for (var attName in attrs) {
                        // Each item in the attributes array is also an array,
                        // where [0] is the attribute name and [1] is the
                        // override value.
                        overrideAttrs.push([ attName.toLowerCase(), attrs[ attName ] ]);
                    }
                }


                if (styles) {
                    // The returning attributes list is an array, because we
                    // could have different override definitions for the same
                    // attribute name.
                    var overrideStyles = ( overrideEl["styles"] =
                        overrideEl["styles"] || new Array() );
                    for (var styleName in styles) {
                        // Each item in the styles array is also an array,
                        // where [0] is the style name and [1] is the
                        // override value.
                        overrideStyles.push([ styleName.toLowerCase(),
                            styles[ styleName ] ]);
                    }
                }
            }
        }

        return overrides;
    }


    // Removes a style from an element itself, don't care about its subtree.
    function removeFromElement(style, element) {
        var def = style._.definition,
            overrides = getOverrides(style),
            attributes = S.merge(def["attributes"],
                (overrides[ element.nodeName()] || overrides["*"] || {})["attributes"]),
            styles = S.merge(def["styles"],
                (overrides[ element.nodeName()] || overrides["*"] || {})["styles"]),
        // If the style is only about the element itself, we have to remove the element.
            removeEmpty = S.isEmptyObject(attributes) &&
                S.isEmptyObject(styles);

        // Remove definition attributes/style from the element.
        for (var attName in attributes) {

            // The 'class' element value must match (#1318).
            if (( attName == 'class' || style._.definition["fullMatch"] )
                && element.attr(attName) != normalizeProperty(attName,
                attributes[ attName ]))
                continue;
            removeEmpty = removeEmpty || !!element.hasAttr(attName);
            element.removeAttr(attName);

        }

        for (var styleName in styles) {

            // Full match style insist on having fully equivalence. (#5018)
            if (style._.definition["fullMatch"]
                && element.style(styleName)
                != normalizeProperty(styleName, styles[ styleName ], TRUE))
                continue;

            removeEmpty = removeEmpty || !!element.style(styleName);
            //设置空即为：清除样式
            element.style(styleName, "");

        }

        //removeEmpty &&
        //始终检查
        removeNoAttribsElement(element);
    }

    /**
     *
     * @param {string} name
     * @param {string} value
     * @param {Boolean=} isStyle
     */
    function normalizeProperty(name, value, isStyle) {
        var temp = new Node('<span>');
        temp [ isStyle ? 'style' : 'attr' ](name, value);
        return temp[ isStyle ? 'style' : 'attr' ](name);
    }


    // Removes a style from inside an element.
    function removeFromInsideElement(style, element) {
        var //def = style._.definition,
        //attribs = def.attributes,
        //styles = def.styles,
            overrides = getOverrides(style),
            innerElements = element.all(style["element"]);

        for (var i = innerElements.length; --i >= 0;) {
            removeFromElement(style, new Node(innerElements[i]));
        }

        // Now remove any other element with different name that is
        // defined to be overridden.
        for (var overrideElement in overrides) {

            if (overrideElement != style["element"]) {
                innerElements = element.all(overrideElement);
                for (i = innerElements.length - 1; i >= 0; i--) {
                    var innerElement = new Node(innerElements[i]);
                    removeOverrides(innerElement,
                        overrides[ overrideElement ]);
                }
            }

        }

    }

    /**
     *  Remove overriding styles/attributes from the specific element.
     *  Note: Remove the element if no attributes remain.
     * @param {Object} element
     * @param {Object} overrides
     */
    function removeOverrides(element, overrides) {
        var i, attributes = overrides && overrides["attributes"];

        if (attributes) {
            for (i = 0; i < attributes.length; i++) {
                var attName = attributes[i][0], actualAttrValue;

                if (( actualAttrValue = element.attr(attName) )) {
                    var attValue = attributes[i][1];

                    // Remove the attribute if:
                    //    - The override definition value is NULL ;
                    //    - The override definition valie is a string that
                    //      matches the attribute value exactly.
                    //    - The override definition value is a regex that
                    //      has matches in the attribute value.
                    if (attValue === NULL ||
                        ( attValue.test && attValue.test(actualAttrValue) ) ||
                        ( typeof attValue == 'string' && actualAttrValue == attValue ))
                        element[0].removeAttribute(attName);
                }
            }
        }


        var styles = overrides && overrides["styles"];

        if (styles) {
            for (i = 0; i < styles.length; i++) {
                var styleName = styles[i][0], actualStyleValue;

                if (( actualStyleValue = element.css(styleName) )) {
                    var styleValue = styles[i][1];
                    if (styleValue === NULL ||
                        //styleValue === "inherit" ||
                        ( styleValue.test && styleValue.test(actualAttrValue) ) ||
                        ( typeof styleValue == 'string' && actualStyleValue == styleValue ))
                        element.css(styleName, "");
                }
            }
        }

        removeNoAttribsElement(element);
    }

    // If the element has no more attributes, remove it.
    function removeNoAttribsElement(element) {
        // If no more attributes remained in the element, remove it,
        // leaving its children.
        if (!element._4e_hasAttributes()) {
            // Removing elements may open points where merging is possible,
            // so let's cache the first and last nodes for later checking.
            var firstChild = element[0].firstChild,
                lastChild = element[0].lastChild;

            element._4e_remove(TRUE);

            if (firstChild) {
                // Check the cached nodes for merging.
                firstChild.nodeType == DOM.NodeType.ELEMENT_NODE &&
                DOM._4e_mergeSiblings(firstChild);

                if (lastChild && firstChild != lastChild
                    && lastChild.nodeType == DOM.NodeType.ELEMENT_NODE)
                    DOM._4e_mergeSiblings(lastChild);
            }
        }
    }

    Editor.Style = KEStyle;

    return KEStyle;
}, {
    requires: ['./base', './range', './selection', './domIterator', './elementPath']
});
/**
 * TODO yiminghe@gmail.com : 重构 Refer
 *  - http://dvcs.w3.org/hg/editing/raw-file/tip/editing.html
 *//**
 * common utils for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/core/utils", function (S) {

    var Editor = S.Editor,
        TRUE = true,
        FALSE = false,
        NULL = null,
        Node = S.Node,
        DOM = S.DOM,
        UA = S.UA,

        /**
         * @namespace
         * Utilities for Editor.
         * @name Utils
         * @member Editor
         */
            Utils =
        /**
         * @lends Editor.Utils
         */
        {
            /**
             *
             * @param url
             * @return {String}
             */
            debugUrl: function (url) {
                var Config = S.Config;
                if (!Config.debug) {
                    url = url.replace(/\.(js|css)/i, "-min.$1");
                }
                if (url.indexOf("?t") == -1) {
                    if (url.indexOf("?") != -1) {
                        url += "&";
                    } else {
                        url += "?";
                    }
                    url += "t=" + encodeURIComponent(Config.tag);
                }
                return Config.base + "editor/" + url;
            },

            /**
             * 懒惰一下
             * @param obj {Object} 包含方法的对象
             * @param before {string} 准备方法
             * @param after {string} 真正方法
             */
            lazyRun: function (obj, before, after) {
                var b = obj[before], a = obj[after];
                obj[before] = function () {
                    b.apply(this, arguments);
                    obj[before] = obj[after];
                    return a.apply(this, arguments);
                };
            },

            /**
             * editor 元素在主窗口的位置
             */
            getXY: function (offset, editor) {
                var x = offset.left,
                    y = offset.top,
                    currentWindow = editor.get("window")[0];
                //x,y相对于当前iframe文档,防止当前iframe有滚动条
                x -= DOM.scrollLeft(currentWindow);
                y -= DOM.scrollTop(currentWindow);

                //note:when iframe is static ,still some mistake
                var iframePosition = editor.get("iframe").offset();
                x += iframePosition.left;
                y += iframePosition.top;

                return {left: x, top: y};
            },

            /**
             * 执行一系列函数
             * @param {Function...} var_args
             * @return {*} 得到成功的返回
             */
            tryThese: function (var_args) {
                var returnValue;
                for (var i = 0, length = arguments.length; i < length; i++) {
                    var lambda = arguments[i];
                    try {
                        returnValue = lambda();
                        break;
                    }
                    catch (e) {
                    }
                }
                return returnValue;
            },

            /**
             * 是否两个数组完全相同
             * @param arrayA {Array}
             * @param arrayB {Array}
             * @return {Boolean}
             */
            arrayCompare: function (arrayA, arrayB) {
                if (!arrayA && !arrayB)
                    return TRUE;

                if (!arrayA || !arrayB || arrayA.length != arrayB.length)
                    return FALSE;

                for (var i = 0; i < arrayA.length; i++) {
                    if (arrayA[ i ] !== arrayB[ i ])
                        return FALSE;
                }

                return TRUE;
            },

            /**
             * @param database {Object}
             */
            clearAllMarkers: function (database) {
                for (var i in database) {

                    database[i]._4e_clearMarkers(database, TRUE, undefined);

                }
            },

            /**
             *
             * @param str {string}
             * @return {string}
             */
            ltrim: function (str) {
                return str.replace(/^\s+/, "");
            },

            /**
             *
             * @param str {string}
             * @return {string}
             */
            rtrim: function (str) {
                return str.replace(/\s+$/, "");
            },

            /**
             *
             */
            isNumber: function (n) {
                return /^\d+(.\d+)?$/.test(S.trim(n));
            },

            /**
             *
             * @param inputs {Array.<Node>}
             * @return {Boolean} 是否验证成功
             */
            verifyInputs: function (inputs) {
                for (var i = 0; i < inputs.length; i++) {
                    var input = new Node(inputs[i]),
                        v = S.trim(Utils.valInput(input)),
                        verify = input.attr("data-verify"),
                        warning = input.attr("data-warning");
                    if (verify && !new RegExp(verify).test(v)) {
                        alert(warning);
                        return FALSE;
                    }
                }
                return TRUE;
            },

            /**
             *
             * @param editor {KISSY.Editor}
             * @param plugin {Object}
             */
            sourceDisable: function (editor, plugin) {
                editor.on("sourceMode", plugin.disable, plugin);
                editor.on("wysiwygMode", plugin.enable, plugin);
            },

            /**
             *
             * @param inp {KISSY.NodeList}
             */
            resetInput: function (inp) {
                var placeholder = inp.attr("placeholder");
                if (placeholder && UA['ie']) {
                    inp.addClass("ks-editor-input-tip");
                    inp.val(placeholder);
                } else if (!UA['ie']) {
                    inp.val("");
                }
            },

            /**
             *
             * @param inp  {KISSY.NodeList}
             * @param [val]
             */
            valInput: function (inp, val) {
                if (val === undefined) {
                    if (inp.hasClass("ks-editor-input-tip")) {
                        return "";
                    } else {
                        return inp.val();
                    }
                } else {
                    inp.removeClass("ks-editor-input-tip");
                    inp.val(val);
                }
            },

            /**
             *
             * @param inp {KISSY.NodeList}
             * @param tip {string}
             */
            placeholder: function (inp, tip) {
                inp.attr("placeholder", tip);
                if (!UA['ie']) {
                    return;
                }
                inp.on("blur", function () {
                    if (!S.trim(inp.val())) {
                        inp.addClass("ks-editor-input-tip");
                        inp.val(tip);
                    }
                });
                inp.on("focus", function () {
                    inp.removeClass("ks-editor-input-tip");
                    if (S.trim(inp.val()) == tip) {
                        inp.val("");
                    }
                });
            },

            /**
             * Convert certain characters (&, <, >, and ') to their HTML character equivalents
             *  for literal display in web pages.
             * @param {string} value The string to encode
             * @return {string} The encoded text
             */
            htmlEncode: function (value) {
                return !value ? value : String(value).replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
            },

            /**
             *
             * @param params {Object}
             * @return {Object}
             */
            normParams: function (params) {
                params = S.clone(params);
                for (var p in params) {

                    var v = params[p];
                    if (S.isFunction(v)) {
                        params[p] = v();
                    }

                }
                return params;
            },

            /**
             *
             */
            map: function (arr, callback) {
                for (var i = 0; i < arr.length; i++) {
                    arr[i] = callback(arr[i]);
                }
                return arr;
            },

            //直接判断引擎，防止兼容性模式影响
            ieEngine: document['documentMode'] || UA['ie'],

            /**
             * 点击 el 或者 el 内的元素，不会使得焦点转移
             * @param el
             */
            preventFocus: function (el) {
                if (UA['ie']) {
                    //ie 点击按钮不丢失焦点
                    el.unselectable(undefined);
                } else {
                    el.attr("onmousedown", "return false;");
                }
            },

            /**
             *
             */
            injectDom: function (editorDom) {
                S.mix(DOM, editorDom);
                for (var dm in editorDom) {
                    (function (dm) {
                        Node.prototype[dm] = function () {
                            var args = [].slice.call(arguments, 0);
                            args.unshift(this[0]);
                            var ret = editorDom[dm].apply(NULL, args);
                            if (ret && (ret.nodeType || S.isWindow(ret))) {
                                return new Node(ret);
                            } else {
                                if (S.isArray(ret)) {
                                    if (ret.__IS_NODELIST || (ret[0] && ret[0].nodeType)) {
                                        return new Node(ret);
                                    }
                                }
                                return ret;
                            }
                        };
                    })(dm);
                }
            },

            /**
             *
             */
            addRes: function () {
                this.__res = this.__res || [];
                var res = this.__res;
                res.push.apply(res, S.makeArray(arguments));
            },

            /**
             *
             */
            destroyRes: function () {
                var res = this.__res || [];
                for (var i = 0; i < res.length; i++) {
                    var r = res[i];
                    if (S.isFunction(r)) {
                        r();
                    } else {
                        if (r.destroy) {
                            r.destroy();
                        }
                        else if (r.remove) {
                            r.remove();
                        }
                    }
                }
                this.__res = [];
            },

            /**
             *
             */
            getQueryCmd: function (cmd) {
                return "query" + ("-" + cmd).replace(/-(\w)/g, function (m, m1) {
                    return m1.toUpperCase()
                }) + "Value";
            }
        };

    Editor.Utils = Utils;

    return Utils;
}, {
    requires: ['./base']
});
/**
 * modified from ckeditor for kissy editor ,walker implementation
 * refer: http://www.w3.org/TR/DOM-Level-2-Traversal-Range/traversal#TreeWalker
 * @author yiminghe@gmail.com
 */
/*
 Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.html or http://ckeditor.com/license
 */
KISSY.add("editor/core/walker", function (S, Editor) {

    var TRUE = true,
        FALSE = false,
        NULL = null,
        UA = S.UA,
        DOM = S.DOM,
        dtd = Editor.XHTML_DTD,
        Node = S.Node;


    function iterate(rtl, breakOnFalseRetFalse) {
        var self = this;
        // Return NULL if we have reached the end.
        if (self._.end) {
            return NULL;
        }
        var node,
            range = self.range,
            guard,
            userGuard = self.guard,
            type = self.type,
            getSourceNodeFn = ( rtl ? '_4e_previousSourceNode' :
                '_4e_nextSourceNode' );

        // This is the first call. Initialize it.
        if (!self._.start) {
            self._.start = 1;

            // Trim text nodes and optimize the range boundaries. DOM changes
            // may happen at this point.
            range.trim();

            // A collapsed range must return NULL at first call.
            if (range.collapsed) {
                self.end();
                return NULL;
            }
        }

        // Create the LTR guard function, if necessary.
        if (!rtl && !self._.guardLTR) {
            // Gets the node that stops the walker when going LTR.
            var limitLTR = range.endContainer[0],
                blockerLTR = limitLTR.childNodes[range.endOffset];
            // 从左到右保证在 range 区间内获取 nextSourceNode
            this._.guardLTR = function (node, movingOut) {
                // 从endContainer移出去，失败返回false
                if (movingOut && (limitLTR == node || DOM.nodeName(node) == "body")) {
                    return false;
                }
                // 达到边界的下一个节点,注意 null 的情况
                // node 永远不能为 null
                return node != blockerLTR;

            };
        }

        // Create the RTL guard function, if necessary.
        if (rtl && !self._.guardRTL) {
            // Gets the node that stops the walker when going LTR.
            var limitRTL = range.startContainer[0],
                blockerRTL = ( range.startOffset > 0 ) &&
                    limitRTL.childNodes[range.startOffset - 1] || null;

            self._.guardRTL = function (node, movingOut) {
                // 从endContainer移出去，失败返回false
                if (movingOut && (limitRTL == node || DOM.nodeName(node) == "body")) {
                    return false;
                }
                // 达到边界的下一个节点,注意 null 的情况
                // node 永远不能为 null
                return node != blockerRTL;
            };
        }

        // Define which guard function to use.
        var stopGuard = rtl ? self._.guardRTL : self._.guardLTR;

        // Make the user defined guard function participate in the process,
        // otherwise simply use the boundary guard.
        if (userGuard) {
            guard = function (node, movingOut) {
                if (stopGuard(node, movingOut) === FALSE) {
                    return FALSE;
                }
                return userGuard(node, movingOut);
            };
        }
        else {
            guard = stopGuard;
        }

        if (self.current) {
            node = this.current[ getSourceNodeFn ](FALSE, type, guard);
        } else {
            // Get the first node to be returned.

            if (rtl) {
                node = range.endContainer;
                if (range.endOffset > 0) {
                    node = new Node(node[0].childNodes[range.endOffset - 1]);
                    if (guard(node[0]) === FALSE) {
                        node = NULL;
                    }
                } else {
                    node = ( guard(node, TRUE) === FALSE ) ?
                        NULL : node._4e_previousSourceNode(TRUE, type, guard, undefined);
                }
            }
            else {
                node = range.startContainer;
                node = new Node(node[0].childNodes[range.startOffset]);

                if (node.length) {
                    if (guard(node[0]) === FALSE) {
                        node = NULL;
                    }
                } else {
                    node = ( guard(range.startContainer, TRUE) === FALSE ) ?
                        NULL : range.startContainer._4e_nextSourceNode(TRUE, type, guard, undefined);
                }
            }
        }

        while (node && !self._.end) {
            self.current = node;
            if (!self.evaluator || self.evaluator(node[0]) !== FALSE) {
                if (!breakOnFalseRetFalse) {
                    return node;
                }
            } else if (breakOnFalseRetFalse && self.evaluator) {
                return FALSE;
            }
            node = node[ getSourceNodeFn ](FALSE, type, guard);
        }

        self.end();
        return self.current = NULL;
    }

    function iterateToLast(rtl) {
        var node,
            last = NULL;
        while (node = iterate.call(this, rtl)) {
            last = node;
        }
        return last;
    }

    /**
     * @name Walker
     * @param {Editor.Range} range
     * @class
     * Walker for DOM.
     * @member Editor
     */
    function Walker(range) {
        this.range = range;

        /**
         * A function executed for every matched node, to check whether
         * it's to be considered into the walk or not. If not provided, all
         * matched nodes are considered good.
         * If the function returns "FALSE" the node is ignored.
         * @type {Function}
         * @member Editor.Walker#
         */
        this.evaluator = NULL;// 当前 range 范围内深度遍历的元素调用

        /**
         * A function executed for every node the walk pass by to check
         * whether the walk is to be finished. It's called when both
         * entering and exiting nodes, as well as for the matched nodes.
         * If this function returns "FALSE", the walking ends and no more
         * nodes are evaluated.
         * @type {Function}
         * @member Editor.Walker#
         */
        this.guard = NULL;// 人为缩小当前 range 范围


        /** @private */
        this._ = {};
    }


    S.augment(Walker,
        /**
         * @lends Editor.Walker#
         */
        {
            /**
             * Stop walking. No more nodes are retrieved if this function gets
             * called.
             */
            end:function () {
                this._.end = 1;
            },

            /**
             * Retrieves the next node (at right).
             * @return {Boolean} The next node or NULL if no more
             *        nodes are available.
             */
            next:function () {
                return iterate.call(this);
            },

            /**
             * Retrieves the previous node (at left).
             * @return {Boolean} The previous node or NULL if no more
             *        nodes are available.
             */
            previous:function () {
                return iterate.call(this, TRUE);
            },

            /**
             * Check all nodes at right, executing the evaluation function.
             * @return {Boolean} "FALSE" if the evaluator function returned
             *        "FALSE" for any of the matched nodes. Otherwise "TRUE".
             */
            checkForward:function () {
                return iterate.call(this, FALSE, TRUE) !== FALSE;
            },

            /**
             * Check all nodes at left, executing the evaluation function.
             * 是不是 (不能后退了)
             * @return {Boolean} "FALSE" if the evaluator function returned
             *        "FALSE" for any of the matched nodes. Otherwise "TRUE".
             */
            checkBackward:function () {
                // 在当前 range 范围内不会出现 evaluator 返回 false 的情况
                return iterate.call(this, TRUE, TRUE) !== FALSE;
            },

            /**
             * Executes a full walk forward (to the right), until no more nodes
             * are available, returning the last valid node.
             * @return {Boolean} The last node at the right or NULL
             *        if no valid nodes are available.
             */
            lastForward:function () {
                return iterateToLast.call(this);
            },

            /**
             * Executes a full walk backwards (to the left), until no more nodes
             * are available, returning the last valid node.
             * @return {Boolean} The last node at the left or NULL
             *        if no valid nodes are available.
             */
            lastBackward:function () {
                return iterateToLast.call(this, TRUE);
            },

            reset:function () {
                delete this.current;
                this._ = {};
            },

            // for unit test
            _iterator:iterate

        });


    S.mix(Walker,
        /**
         * @lends Editor.Walker
         */
        {
            /**
             * Whether the to-be-evaluated node is not a block node and does not match given node name map.
             * @param {Object} customNodeNames Given node name map.
             * @return {Function} Function for evaluation.
             */
            blockBoundary:function (customNodeNames) {
                return function (node) {
                    return !(node.nodeType == DOM.NodeType.ELEMENT_NODE &&
                        DOM._4e_isBlockBoundary(node, customNodeNames) );
                };
            },

            /**
             * Whether the to-be-evaluated node is a bookmark node OR bookmark node
             * inner contents.
             * @param {Boolean} [contentOnly] Whether only test againt the text content of
             * bookmark node instead of the element itself(default).
             * @param {Boolean} [isReject] Whether should return 'FALSE' for the bookmark
             * node instead of 'TRUE'(default).
             * @return {Function} Function for evaluation.
             */
            bookmark:function (contentOnly, isReject) {
                function isBookmarkNode(node) {
                    return  DOM.nodeName(node) == 'span' &&
                        DOM.attr(node, '_ke_bookmark');
                }

                return function (node) {
                    var isBookmark, parent;
                    // Is bookmark inner text node?
                    isBookmark = ( node.nodeType == DOM.NodeType.TEXT_NODE &&
                        ( parent = node.parentNode ) &&
                        isBookmarkNode(parent) );
                    // Is bookmark node?
                    isBookmark = contentOnly ? isBookmark : isBookmark || isBookmarkNode(node);
                    // !! 2012-05-15
                    // evaluator check ===false, must turn it to boolean false
                    return !!(isReject ^ isBookmark);
                };
            },

            /**
             * Whether the node is a text node containing only whitespaces characters.
             * @param {Boolean} [isReject]
             */
            whitespaces:function (isReject) {
                return function (node) {
                    var isWhitespace = node.nodeType == DOM.NodeType.TEXT_NODE &&
                        !S.trim(node.nodeValue);
                    return !!(isReject ^ isWhitespace);
                };
            },
            /**
             * Whether the node is invisible in wysiwyg mode.
             * @param isReject
             */
            invisible:function (isReject) {
                var whitespace = Walker.whitespaces();
                return function (node) {
                    // Nodes that take no spaces in wysiwyg:
                    // 1. White-spaces but not including NBSP;
                    // 2. Empty inline elements, e.g. <b></b> we're checking here
                    // 'offsetHeight' instead of 'offsetWidth' for properly excluding
                    // all sorts of empty paragraph, e.g. <br />.
                    var isInvisible = whitespace(node) ||
                        node.nodeType == DOM.NodeType.ELEMENT_NODE && !node.offsetHeight;
                    return !!(isReject ^ isInvisible);
                };
            }
        });

    var tailNbspRegex = /^[\t\r\n ]*(?:&nbsp;|\xa0)$/,
        isWhitespaces = Walker.whitespaces(),
        isBookmark = Walker.bookmark(),
        toSkip = function (node) {
            var name = DOM.nodeName(node);
            return isBookmark(node) ||
                isWhitespaces(node) ||
                node.nodeType == 1 &&
                    name in dtd.$inline &&
                    !( name in dtd.$empty );
        };

    // Check if there's a filler node at the end of an element, and return it.
    function getBogus(tail) {
        // Bogus are not always at the end, e.g. <p><a>text<br /></a></p>
        do {
            tail = tail._4e_previousSourceNode();
        } while (tail && toSkip(tail[0]));

        if (tail && ( !UA.ie ? tail.nodeName() == "br"
            : tail[0].nodeType == 3 && tailNbspRegex.test(tail.text()) )) {
            return tail[0];
        }
        return false;
    }

    Editor.Utils.injectDom({
        _4e_getBogus:function (el) {
            return getBogus(new Node(el));
        }
    });

    Editor.Walker = Walker;

    return Walker;
}, {
    requires:['./base', './utils', './dom']
});
/**
 * 集中管理各个z-index
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/core/zIndexManager", function (S) {
    var Editor = S.Editor;

    /**
     * z-index manager
     *@enum {number}
     */
    var zIndexManager = Editor.zIndexManager = {
        BUBBLE_VIEW:(1100),
        POPUP_MENU:(1200),
        // flash 存储设置最高
        STORE_FLASH_SHOW:(99999),
        MAXIMIZE:(900),
        OVERLAY:(9999),
        LOADING:(11000),
        LOADING_CANCEL:12000,
        SELECT:(1200)
    };

    /**
     * 获得全局最大值
     */
    Editor.baseZIndex = function (z) {
        return (Editor['Config'].baseZIndex || 10000) + z;
    };

    return zIndexManager;
}, {
    requires:['./base']
});
