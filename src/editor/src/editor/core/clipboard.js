/**
 * monitor user's paste behavior.
 * modified from CKEditor.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/core/clipboard", function (S, Editor, KERange, KES) {
    var $ = S.all,
        UA = S.UA,
        pasteEvent = UA.ie ? 'beforepaste' : 'paste',
        KER = Editor.RANGE;

    function Paste(editor) {
        var self = this;
        self.editor = editor;
        self._init();
    }

    S.augment(Paste, {

        _init: function () {
            var self = this,
                editor = self.editor,
                editorDoc = editor.get("document"),
                editorBody = editorDoc.one('body'),
                CutCopyPasteCmd = function (type) {
                    this.type = type;
                };

            CutCopyPasteCmd.prototype = {
                exec: function (editor) {
                    var type = this.type;
                    editor.focus();
                    setTimeout(function () {
                        if (UA.ie) {
                            if (type == 'cut') {
                                fixCut(editor);
                            } else if (type == 'paste') {
                                // ie prepares to get clipboard data
                                // ie only can get data from beforepaste
                                // non-ie paste
                                self._preventPasteEvent();
                                self._getClipboardDataFromPasteBin();
                            }
                        }
                        // will trigger paste for all browsers
                        // disable handle for ie
                        if (!tryToCutCopyPaste(editor, type)) {
                            alert(error_types[type]);
                        }
                    }, 0);
                }
            };

            // beforepaste not fire on webkit and firefox
            // paste fire too later in ie, cause error
            // http://help.dottoro.com/ljxqbxkf.php
            // http://stackoverflow.com/questions/2176861/javascript-get-clipboard-data-on-paste-event-cross-browser
            editorBody.on(pasteEvent, self._getClipboardDataFromPasteBin, self);

            if (UA.ie) {
                editorBody.on('paste', self._iePaste, self);
                editorDoc.on('keydown', self._onKeyDown, self);
                editorDoc.on('contextmenu', function () {
                    self._isPreventBeforePaste = 1;
                    setTimeout(function () {
                        self._isPreventBeforePaste = 0;
                    }, 0);
                })
            }

            editor.addCommand("copy", new CutCopyPasteCmd("copy"));
            editor.addCommand("cut", new CutCopyPasteCmd("cut"));
            editor.addCommand("paste", new CutCopyPasteCmd("paste"));
        },

        '_onKeyDown': function (e) {
            var self = this,
                editor = self.editor;
            if (editor.get('mode') != Editor.WYSIWYG_MODE) {
                return;
            }
            // ctrl+v
            if (e.ctrlKey && e.keyCode == 86 ||
                // shift+insert
                e.shiftKey && e.keyCode == 45) {
                self._preventPasteEvent();
            }
        },

        _stateFromNamedCommand: function (command) {
            var ret;
            var self = this;
            var editor = self.editor;

            if (command == 'paste') {
                // IE Bug: queryCommandEnabled('paste') fires also 'beforepaste(copy/cut)',
                // guard to distinguish from the ordinary sources (either
                // keyboard paste or execCommand) (#4874).
                self._isPreventBeforePaste = 1;
                try {
                    ret = editor.get('document')[0].queryCommandEnabled(command);
                } catch (e) {
                }
                self._isPreventBeforePaste = 0;
            }
            // Cut, Copy - check if the selection is not empty
            else {
                var sel = editor.getSelection(),
                    ranges = sel && sel.getRanges();
                ret = ranges && !( ranges.length == 1 && ranges[ 0 ].collapsed );
            }

            return ret;
        },

        '_preventPasteEvent': function () {
            var self = this;
            if (self._preventPasteTimer) {
                clearTimeout(self._preventPasteTimer);
            }
            self._isPreventPaste = 1;
            self._preventPasteTimer = setTimeout(function () {
                self._isPreventPaste = 0;
                // wait beforepaste event handler done
            }, 70);
        },

        // in case ie select paste from native menubar
        // ie will not fire beforePaste but only paste
        _iePaste: function (e) {
            var self = this,
                editor = self.editor;
            if (self._isPreventPaste) {
                // allow user content pasted into pastebin

                // impossible case
                // quick enough ( in 70 ms)
                // when pastebin is deleted and content is inserted in to editor and _isPreventPaste is still 1
                return;
            }
            // prevent default paste action in ie
            e.preventDefault();
            editor.execCommand('paste');
        },

        _getClipboardDataFromPasteBin: function () {
            if (this._isPreventBeforePaste) {
                return;
            }

            S.log(pasteEvent + ": " + " paste event happen");

            var self = this,
                editor = self.editor,
                doc = editor.get("document")[0];

            // Avoid recursions on 'paste' event or consequent paste too fast. (#5730)
            if (doc.getElementById('ke_pastebin')) {
                S.log(pasteEvent + ": trigger more than once ...");
                return;
            }

            var sel = editor.getSelection(),
                range = new KERange(doc);

            // Create container to paste into
            var pastebin = $(UA['webkit'] ?
                '<body></body>' :
                // ie6 must use create ...
                '<div></div>', doc);

            pastebin.attr('id', 'ke_pastebin');
            // Safari requires a filler node inside the div to have the content pasted into it. (#4882)
            if (UA['webkit']) {
                pastebin[0].appendChild(doc.createTextNode('\u200b'));
            }

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
                var oldPastebin = pastebin;

                pastebin = ( UA['webkit']
                    && ( bogusSpan = pastebin.first() )
                    && (bogusSpan.hasClass('Apple-style-span') ) ?
                    bogusSpan : pastebin );

                sel.selectBookmarks(bms);

                var html = pastebin.html();

                oldPastebin.remove();

                //莫名其妙会有这个东西！，不知道
                //去掉
                if (!( html = S.trim(html
                    .replace(/<span[^>]+_ke_bookmark[^<]*?<\/span>(&nbsp;)*/ig, '')) )) {
                    // ie 第2次触发 beforepaste 会报错！
                    // 第一次 bms 是对的，但是 pastebin 内容是错的
                    // 第二次 bms 是错的，但是内容是对的
                    return;
                }

                S.log("paste " + html);

                var re = editor.fire("paste", {
                    html: html
                });

                // cancel
                if (re === false) {
                    return;
                }

                if (re !== undefined) {
                    html = re;
                }

                // MS-WORD format sniffing.
                if (/(class="?Mso|style="[^"]*\bmso\-|w:WordDocument)/.test(html)) {
                    // 动态载入 word 过滤规则
                    S.use("editor/plugin/word-filter/dynamic/", function (S, wordFilter) {
                        editor.insertHtml(wordFilter.toDataFormat(html, editor));
                    });
                } else {
                    editor.insertHtml(html);
                }
            }, 0);
        }
    });

    // Tries to execute any of the paste, cut or copy commands in IE. Returns a
    // boolean indicating that the operation succeeded.
    var execIECommand = function (editor, command) {
        var doc = editor.get("document")[0],
            body = $(doc.body),
            enabled = false,
            onExec = function () {
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
    var tryToCutCopyPaste = UA['ie'] ?
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

    // Cutting off control type element in IE standards breaks the selection entirely. (#4881)
    function fixCut(editor) {
        var editorDoc = editor.get("document")[0];
        var sel = editor.getSelection();
        var control;
        if (( sel.getType() == KES.SELECTION_ELEMENT ) &&
            ( control = sel.getSelectedElement() )) {
            var range = sel.getRanges()[ 0 ];
            var dummy = $(editorDoc.createTextNode(''));
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

    return {
        init: function (editor) {

            var currentPaste;

            editor.docReady(function () {
                currentPaste = new Paste(editor);
            });

            // emulated context menu
            if (0) {
                var defaultContextMenuFn;

                // add default context menu
                editor.docReady(defaultContextMenuFn = function () {
                    editor.detach('docReady', defaultContextMenuFn);
                    var firstFn;
                    editor.get('document').on('contextmenu', firstFn = function (e) {
                        e.preventDefault();
                        editor.get('document').detach('contextmenu', firstFn);
                        S.use('editor/plugin/contextmenu', function () {
                            editor.addContextMenu('default', function () {
                                return 1;
                            }, {
                                event: e
                            });
                        });
                    });
                });
            }

            var clipboardCommands = {
                "copy": 1,
                "cut": 1,
                "paste": 1
            };
            var clipboardCommandsList = ["copy", "cut", "paste"];

            /**
             * 给所有右键都加入复制粘贴
             */
            editor.on("contextmenu", function (ev) {
                var contextmenu = ev.contextmenu;

                if (!contextmenu.__copy_fix) {

                    contextmenu.__copy_fix = 1;
                    var i = 0;
                    for (; i < clipboardCommandsList.length; i++) {
                        contextmenu.addChild({
                            content: lang[clipboardCommandsList[i]],
                            value: clipboardCommandsList[i]
                        });
                    }

                    contextmenu.on('click', function (e) {
                        var value = e.target.get("value");
                        if (clipboardCommands[value]) {
                            contextmenu.hide();
                            // 给 ie 一点 hide() 中的事件触发 handler 运行机会，
                            // 原编辑器获得焦点后再进行下步操作
                            setTimeout(function () {
                                editor.execCommand('save');
                                editor.execCommand(value);
                                setTimeout(function () {
                                    editor.execCommand('save');
                                }, 10);
                            }, 30);
                        }
                    });
                }

                var menuChildren = contextmenu.get('children');

                // must query paste first ...
                for (i = menuChildren.length - 1; i--; i >= 0) {
                    var c = menuChildren[i];
                    var value;
                    if (c.get) {
                        value = c.get("value");
                    } else {
                        value = c.value;
                    }
                    var v;
                    if (clipboardCommands[value]) {
                        v = !currentPaste._stateFromNamedCommand(value);
                        if (c.set) {
                            c.set('disabled', v);
                        } else {
                            c.disabled = v;
                        }

                    }
                }
            });
        }
    };
}, {
    requires: ['./base', './range', './selection','node']
});
/**
 * yiminghe@gmail.com note:
 *
 * 1. chrome/ff 只会触发 paste 且不可阻止默认黏贴行为(ff 可以)
 * ie 会触发 beforepaste 以及 paste 事件，paste 事件可以阻止默认黏贴行为
 * 如果想改变 paste 的容器，ie 下只能用 beforepaste
 *
 * 2. ie 下 bug: queryCommandEnable 以及 contextmenu 会触发 beforepaste 事件
 *
 * 3. ie 下 menubar 的原生编辑菜单打开也会触发 beforepaste 事件，点击 paste 命令不会触发 beforepaste 命令，
 * 而会直接触发 paste 命令
 *
 * ie 黏贴的四个方式以及 hack：
 * 1. 右键菜单  => 原生可以同 menubar 处理，需要在 contextmenu 打开时不处理 beforepaste 事件。
 *    模拟 fire beforepaste and exeCommand
 * 2. menubar => 在 paste 处理事件中处理，禁用默认黏贴行为, fire beforepaste and exeCommand
 * 3. ctrl v => 系统处理（fire beforepaste and exeCommand）
 *
 * 其他浏览器：
 * 1.  右键菜单  => 原生会走系统处理(fire beforepaste and exeCommand)，模拟安全因素不可用（fire beforepaste and exeCommand）
 * 2.
 */