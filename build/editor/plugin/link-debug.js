/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:47
*/
/*
combined modules:
editor/plugin/link
*/
KISSY.add('editor/plugin/link', [
    './button',
    './bubble',
    'util',
    'editor',
    './link/utils',
    './dialog-loader',
    'node'
], function (S, require, exports, module) {
    /**
 * @ignore
 * link editor support for kissy editor ,innovation from google doc and ckeditor
 * @author yiminghe@gmail.com
 */
    require('./button');
    require('./bubble');
    var util = require('util');
    var Editor = require('editor');
    var Utils = require('./link/utils');
    var DialogLoader = require('./dialog-loader');
    var $ = require('node'), tipHTML = '<a ' + 'href="" ' + ' target="_blank" ' + 'class="{prefixCls}editor-bubble-url">' + '\u5728\u65B0\u7A97\u53E3\u67E5\u770B' + '</a>  \u2013  ' + ' <span ' + 'class="{prefixCls}editor-bubble-link {prefixCls}editor-bubble-change">' + '\u7F16\u8F91' + '</span>   |   ' + ' <span ' + 'class="{prefixCls}editor-bubble-link {prefixCls}editor-bubble-remove">' + '\u53BB\u9664' + '</span>';
    function checkLink(lastElement) {
        lastElement = $(lastElement);
        return lastElement.closest('a', undefined);
    }
    function LinkPlugin(config) {
        this.config = config || {};
    }
    LinkPlugin.prototype = {
        pluginRenderUI: function (editor) {
            var prefixCls = editor.get('prefixCls');
            editor.addButton('link', {
                tooltip: '\u63D2\u5165\u94FE\u63A5',
                listeners: {
                    click: function () {
                        showLinkEditDialog();
                    }
                },
                mode: Editor.Mode.WYSIWYG_MODE
            });
            var self = this;
            function showLinkEditDialog(selectedEl) {
                DialogLoader.useDialog(editor, 'link', self.config, selectedEl);
            }
            editor.addBubble('link', checkLink, {
                listeners: {
                    afterRenderUI: function () {
                        var bubble = this, el = bubble.get('contentEl');
                        el.html(util.substitute(tipHTML, { prefixCls: prefixCls }));
                        var tipUrl = el.one('.' + prefixCls + 'editor-bubble-url'), tipChange = el.one('.' + prefixCls + 'editor-bubble-change'), tipRemove = el.one('.' + prefixCls + 'editor-bubble-remove');    //ie focus not lose
                        //ie focus not lose
                        Editor.Utils.preventFocus(el);
                        tipChange.on('click', function (ev) {
                            showLinkEditDialog(bubble.get('editorSelectedEl'));
                            ev.halt();
                        });
                        tipRemove.on('click', function (ev) {
                            Utils.removeLink(editor, bubble.get('editorSelectedEl'));
                            ev.halt();
                        });
                        bubble.on('show', function () {
                            var a = bubble.get('editorSelectedEl');
                            if (!a) {
                                return;
                            }
                            var href = a.attr(Utils.savedHref) || a.attr('href');
                            tipUrl.html(href);
                            tipUrl.attr('href', href);
                        });
                    }
                }
            });
        }
    };
    module.exports = LinkPlugin;
});






