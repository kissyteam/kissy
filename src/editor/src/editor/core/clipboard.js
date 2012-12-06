/**
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
            S.log(ev.type + " : " + " paste event happen");

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
                S.log(ev.type + " : trigger more than once ...");
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

                S.log("paste " + html);

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
