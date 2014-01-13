/**
 * @ignore
 * BaseClass for Flash Based plugin.
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var flashUtils = require('./utils');
    var Base = require('base');
    var Editor = require('editor');
    var Node = S.Node;
    var DialogLoader = require('../dialog-loader');
    require('../bubble');
    require('../contextmenu');

    var tipHTML = ' <a ' +
        'class="{prefixCls}editor-bubble-url" ' +
        'target="_blank" ' +
        'href="#">{label}</a>   |   ' +
        ' <span class="{prefixCls}editor-bubble-link {prefixCls}editor-bubble-change">编辑</span>   |   ' +
        ' <span class="{prefixCls}editor-bubble-link {prefixCls}editor-bubble-remove">删除</span>';

    return Base.extend({
        initializer: function () {
            var self = this,
                cls = self.get('cls'),
                editor = self.get('editor'),
                prefixCls = editor.get('prefixCls'),
                children = [],
                bubbleId = self.get('bubbleId'),
                contextMenuId = self.get('contextMenuId'),
                contextMenuHandlers = self.get('contextMenuHandlers');

            S.each(contextMenuHandlers, function (h, content) {
                children.push({
                    content: content
                });
            });

            editor.addContextMenu(contextMenuId, '.' + cls, {
                width: '120px',
                children: children,
                listeners: {
                    click: function (e) {
                        var content = e.target.get('content');
                        if (contextMenuHandlers[content]) {
                            contextMenuHandlers[content].call(this);
                        }
                    }
                }
            });

            editor.addBubble(bubbleId, function (el) {
                return el.hasClass(cls, undefined) && el;
            }, {
                listeners: {
                    afterRenderUI:// 注册泡泡，selectionChange时检测
                        function () {
                            var bubble = this,
                                el = bubble.get('contentEl');
                            el.html(S.substitute(tipHTML, {
                                label: self.get('label'),
                                prefixCls: prefixCls
                            }));
                            var tipUrlEl = el.one('.' + prefixCls + 'editor-bubble-url'),
                                tipChangeEl = el.one('.' + prefixCls + 'editor-bubble-change'),
                                tipRemoveEl = el.one('.' + prefixCls + 'editor-bubble-remove');

                            // ie focus not lose
                            Editor.Utils.preventFocus(el);

                            tipChangeEl.on('click', function (ev) {
                                // 回调show，传入选中元素
                                self.show(bubble.get('editorSelectedEl'));
                                ev.halt();
                            });

                            tipRemoveEl.on('click', function (ev) {
                                // chrome remove 后会没有焦点
                                if (S.UA.webkit) {
                                    var r = editor.getSelection().getRanges(),
                                        r0 = r && r[0];
                                    if (r0) {
                                        r0.collapse(true);
                                        r0.select();
                                    }
                                }
                                bubble.get('editorSelectedEl').remove();
                                bubble.hide();
                                editor.notifySelectionChange();
                                ev.halt();
                            });

                            /*
                             位置变化，在显示前就设置内容，防止ie6 iframe遮罩不能正确大小
                             */
                            bubble.on('show', function () {
                                var a = bubble.get('editorSelectedEl');
                                if (a) {
                                    self._updateTip(tipUrlEl, a);
                                }
                            });
                        }
                }
            });


            editor.docReady(function () {
                //注册双击，双击时检测
                editor.get('document').on('dblclick', self._dbClick, self);
            });
        },

        _getFlashUrl: function (r) {
            return flashUtils.getUrl(r);
        },

        // 更新泡泡弹出的界面，子类覆盖
        _updateTip: function (tipUrlElEl, selectedFlash) {
            var self = this,
                editor = self.get('editor'),
                r = editor.restoreRealElement(selectedFlash);
            if (!r) {
                return;
            }
            var url = self._getFlashUrl(r);
            tipUrlElEl.attr('href', url);
        },

        //根据图片标志触发本插件应用
        _dbClick: function (ev) {
            var self = this,
                t = new Node(ev.target);
            if (t.nodeName() === 'img' && t.hasClass(self.get('cls'), undefined)) {
                self.show(t);
                ev.halt();
            }
        },

        show: function (selectedEl) {
            var self = this,
                editor = self.get('editor');
            DialogLoader.useDialog(editor, self.get('type'),
                self.get('pluginConfig'),
                selectedEl);
        }
    }, {
        ATTRS: {
            cls: {},
            type: {},
            label: {
                value: '在新窗口查看'
            },
            bubbleId: {},
            contextMenuId: {},
            contextMenuHandlers: {}
        }
    });
});