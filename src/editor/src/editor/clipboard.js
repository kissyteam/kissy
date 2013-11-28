/**
 * @ignore
 * monitor user's paste behavior.
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Node = require('node');
    var Editor = require('./base');
    var KERange = require('./range');
    var KES = require('./selection');
    var logger = S.getLogger('s/editor');
    var $ = Node.all,
        UA = S.UA,
        OLD_IE = UA.ieMode < 11,
        pasteEvent = OLD_IE ? 'beforepaste' : 'paste',
        KER = Editor.RangeType;

    function Paste(editor) {
        var self = this;
        self.editor = editor;
        self._init();
    }

    S.augment(Paste, {
        _init: function () {
            var self = this,
                editor = self.editor,
                editorDoc = editor.get('document'),
                editorBody = editorDoc.one('body'),
                CutCopyPasteCmd = function (type) {
                    this.type = type;
                };

            CutCopyPasteCmd.prototype = {
                exec: function (editor) {
                    var type = this.type;
                    editor.focus();
                    setTimeout(function () {
                        if (OLD_IE) {
                            if (type === 'cut') {
                                fixCut(editor);
                            } else if (type === 'paste') {
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
                            /*global alert*/
                            alert(errorTypes[type]);
                        }
                    }, 0);
                }
            };

            // beforepaste not fire on webkit and firefox
            // paste fire too later in ie, cause error
            // http://help.dottoro.com/ljxqbxkf.php
            // http://stackoverflow.com/questions/2176861/javascript-get-clipboard-data-on-paste-event-cross-browser
            editorBody.on(pasteEvent, self._getClipboardDataFromPasteBin, self);

            if (OLD_IE) {
                editorBody.on('paste', self._iePaste, self);
                editorDoc.on('keydown', self._onKeyDown, self);
                editorDoc.on('contextmenu', function () {
                    self._isPreventBeforePaste = 1;
                    setTimeout(function () {
                        self._isPreventBeforePaste = 0;
                    }, 0);
                });
            }

            editor.addCommand('copy', new CutCopyPasteCmd('copy'));
            editor.addCommand('cut', new CutCopyPasteCmd('cut'));
            editor.addCommand('paste', new CutCopyPasteCmd('paste'));
        },

        '_onKeyDown': function (e) {
            var self = this,
                editor = self.editor;
            if (editor.get('mode') !== Editor.Mode.WYSIWYG_MODE) {
                return;
            }
            // ctrl+v
            if (e.ctrlKey && e.keyCode === 86 ||
                // shift+insert
                e.shiftKey && e.keyCode === 45) {
                self._preventPasteEvent();
            }
        },

        _stateFromNamedCommand: function (command) {
            var ret;
            var self = this;
            var editor = self.editor;

            if (command === 'paste') {
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
                ret = ranges && !( ranges.length === 1 && ranges[ 0 ].collapsed );
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

            logger.debug(pasteEvent + ': ' + ' paste event happen');

            var self = this,
                editor = self.editor,
                doc = editor.get('document')[0];

            // Avoid recursions on 'paste' event or consequent paste too fast. (#5730)
            if (doc.getElementById('ke-paste-bin')) {
                logger.debug(pasteEvent + ': trigger more than once ...');
                return;
            }

            var sel = editor.getSelection(),
                range = new KERange(doc);

            // Create container to paste into
            var pasteBin = $(UA.webkit ?
                '<body></body>' :
                // ie6 must use create ...
                '<div></div>', doc);

            pasteBin.attr('id', 'ke-paste-bin');
            // Safari requires a filler node inside the div to have the content pasted into it. (#4882)
            if (UA.webkit) {
                pasteBin[0].appendChild(doc.createTextNode('\u200b'));
            }

            doc.body.appendChild(pasteBin[0]);

            pasteBin.css({
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
            pasteBin.css('left', '-1000px');

            var bms = sel.createBookmarks();

            // Turn off design mode temporarily before give focus to the paste bin.
            range.setStartAt(pasteBin, KER.POSITION_AFTER_START);
            range.setEndAt(pasteBin, KER.POSITION_BEFORE_END);
            range.select(true);
            // Wait a while and grab the pasted contents
            setTimeout(function () {
                // Grab the HTML contents.
                // We need to look for a apple style wrapper on webkit it also adds
                // a div wrapper if you copy/paste the body of the editor.
                // Remove hidden div and restore selection.
                var bogusSpan;
                var oldPasteBin = pasteBin;

                pasteBin = ( UA.webkit && ( bogusSpan = pasteBin.first() ) &&
                    (bogusSpan.hasClass('Apple-style-span') ) ?
                    bogusSpan : pasteBin );

                sel.selectBookmarks(bms);

                var html = pasteBin.html();

                oldPasteBin.remove();

                if (!( html = cleanPaste(html))) {
                    // ie 第2次触发 beforepaste 会报错！
                    // 第一次 bms 是对的，但是 pasteBin 内容是错的
                    // 第二次 bms 是错的，但是内容是对的
                    return;
                }

                logger.debug('paste ' + html);

                var re = editor.fire('paste', {
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
                    S.use('editor/plugin/word-filter', function (S, wordFilter) {
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
        var doc = editor.get('document')[0],
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
        ( UA.ieMode > 7 ? doc : doc.selection.createRange() ).execCommand(command);

        body.detach(command, onExec);

        return enabled;
    };

    // Attempts to execute the Cut and Copy operations.
    var tryToCutCopyPaste = OLD_IE ?
        function (editor, type) {
            return execIECommand(editor, type);
        }
        : // !IE.
        function (editor, type) {
            try {
                // Other browsers throw an error if the command is disabled.
                return editor.get('document')[0].execCommand(type);
            }
            catch (e) {
                return false;
            }
        };

    var errorTypes = {
        'cut': '您的浏览器安全设置不允许编辑器自动执行剪切操作，请使用键盘快捷键(Ctrl/Cmd+X)来完成',
        'copy': '您的浏览器安全设置不允许编辑器自动执行复制操作，请使用键盘快捷键(Ctrl/Cmd+C)来完成',
        'paste': '您的浏览器安全设置不允许编辑器自动执行粘贴操作，请使用键盘快捷键(Ctrl/Cmd+V)来完成'
    };

    // Cutting off control type element in IE standards breaks the selection entirely. (#4881)
    function fixCut(editor) {
        var editorDoc = editor.get('document')[0];
        var sel = editor.getSelection();
        var control;
        if (( sel.getType() === KES.SELECTION_ELEMENT ) &&
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

    function isPlainText(html) {
        if (UA.webkit) {
            // Plain text or ( <div><br></div> and text inside <div> ).
            if (!html.match(/^[^<]*$/g) && !html.match(/^(<div><br( ?\/)?><\/div>|<div>[^<]*<\/div>)*$/gi)) {
                return 0;
            }
        } else if (UA.ie) {
            // Text and <br> or ( text and <br> in <p> - paragraphs can be separated by new \r\n ).
            if (!html.match(/^([^<]|<br( ?\/)?>)*$/gi) && !html.match(/^(<p>([^<]|<br( ?\/)?>)*<\/p>|(\r\n))*$/gi)) {
                return 0;
            }
        } else if (UA.gecko || UA.opera) {
            // Text or <br>.
            if (!html.match(/^([^<]|<br( ?\/)?>)*$/gi)) {
                return 0;
            }
        } else {
            return 0;
        }

        return 1;
    }

    // plain text to html
    function plainTextToHtml(html) {
        html = html.replace(/\s+/g, ' ')
            .replace(/> +</g, '><')
            .replace(/<br ?\/>/gi, '<br>');

        // no tags
        if (html.match(/^[^<]$/)) {
            return html;
        }

        // Webkit.
        if (UA.webkit && html.indexOf('<div>') > -1) {
            // Two line breaks create one paragraph in Webkit.
            if (html.match(/<div>(?:<br>)?<\/div>/)) {
                html = html.replace(/<div>(?:<br>)?<\/div>/g, function () {
                    return '<p></p>';
                });
                html = html.replace(/<\/p><div>/g, '</p><p>').
                    replace(/<\/div><p>/g, '</p><p>')
                    .replace(/^<div>/, '<p>')
                    .replace(/^<\/div>/, '</p>');
            }

            if (html.match(/<\/div><div>/)) {
                html = html.replace(/<\/div><div>/g, '</p><p>')
                    .replace(/^<div>/, '<p>')
                    .replace(/^<\/div>/, '</p>');
            }
        }
        // Opera and Firefox and enterMode !== BR.
        else if (UA.gecko || UA.opera) {
            //  bogus <br>
            if (UA.gecko) {
                html = html.replace(/^<br><br>$/, '<br>');
            }
            if (html.indexOf('<br><br>') > -1) {
                html = '<p>' + html.replace(/<br><br>/g, function () {
                    return '</p><p>';
                }) + '</p>';
            }
        }
        return html;
    }

    function cleanPaste(html) {
        var htmlMode = 0;
        html = html.replace(/<span[^>]+_ke_bookmark[^<]*?<\/span>(&nbsp;)*/ig, '');
        if (html.indexOf('Apple-') !== -1) {
            // replace webkit space
            html = html.replace(/<span class="Apple-converted-space">&nbsp;<\/span>/gi, ' ');
            html = html.replace(/<span class="Apple-tab-span"[^>]*>([^<]*)<\/span>/gi, function (all, spaces) {
                // replace tabs with 4 spaces like firefox does.
                return spaces.replace(/\t/g, new Array(5).join('&nbsp;'));
            });
            if (html.indexOf('<br class="Apple-interchange-newline">') > -1) {
                htmlMode = 1;
                html = html.replace(/<br class="Apple-interchange-newline">/, '');
            }
            html = html.replace(/(<[^>]+) class="Apple-[^"]*"/gi, '$1');
        }

        if (!htmlMode && isPlainText(html)) {
            html = plainTextToHtml(html);
        }

        return html;
    }

    var lang = {
        'copy': '复制',
        'paste': '粘贴',
        'cut': '剪切'
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
                'copy': 1,
                'cut': 1,
                'paste': 1
            };
            var clipboardCommandsList = ['copy', 'cut', 'paste'];


            // 给所有右键都加入复制粘贴
            editor.on('contextmenu', function (ev) {
                var contextmenu = ev.contextmenu,
                    i;
                if (!contextmenu.__copyFix) {
                    contextmenu.__copyFix = 1;
                    i = 0;
                    for (; i < clipboardCommandsList.length; i++) {
                        contextmenu.addChild({
                            content: lang[clipboardCommandsList[i]],
                            value: clipboardCommandsList[i]
                        });
                    }

                    contextmenu.on('click', function (e) {
                        var value = e.target.get('value');
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
                        value = c.get('value');
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
});
/**
 * @ignore
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