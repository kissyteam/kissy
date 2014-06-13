/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:47
*/
/*
combined modules:
editor/plugin/link/dialog
*/
KISSY.add('editor/plugin/link/dialog', [
    'util',
    'editor',
    '../dialog',
    './utils'
], function (S, require, exports, module) {
    /**
 * @ignore
 * link dialog
 * @author yiminghe@gmail.com
 */
    var util = require('util');
    var Editor = require('editor');
    var Dialog4E = require('../dialog');
    var Utils = require('./utils');
    var savedHref = Utils.savedHref, bodyHTML = '<div style="padding:20px 20px 0 20px">' + '<p>' + '<label>' + '\u94FE\u63A5\u7F51\u5740\uFF1A ' + '<input ' + ' data-verify="^(https?://[^\\s]+)|(#.+)$" ' + ' data-warning="\u8BF7\u8F93\u5165\u5408\u9002\u7684\u7F51\u5740\u683C\u5F0F" ' + 'class="{prefixCls}editor-link-url {prefixCls}editor-input" ' + 'style="width:390px;' + '"' + ' />' + '</label>' + '</p>' + '<p ' + 'style="margin: 15px 0 10px 0px;">' + '<label>' + '\u94FE\u63A5\u540D\u79F0\uFF1A ' + '<input class="{prefixCls}editor-link-title {prefixCls}editor-input" style="width:100px;' + '">' + '</label> ' + '<label>' + '<input ' + 'class="{prefixCls}editor-link-blank" ' + 'style="vertical-align: middle; margin-left: 21px;" ' + 'type="checkbox"/>' + ' &nbsp; \u5728\u65B0\u7A97\u53E3\u6253\u5F00\u94FE\u63A5' + '</label>' + '</p>' + '</div>', footHTML = '<div style="padding:5px 20px 20px;">' + '<a ' + 'href="javascript:void(\'\u786E\u5B9A\')" ' + 'class="{prefixCls}editor-link-ok {prefixCls}editor-button ks-inline-block" ' + 'style="margin-left:65px;margin-right:20px;">\u786E\u5B9A</a> ' + '<a ' + 'href="javascript:void(\'\u53D6\u6D88\')" ' + 'class="{prefixCls}editor-link-cancel {prefixCls}editor-button ks-inline-block">\u53D6\u6D88</a>' + '</div>';
    function LinkDialog(editor, config) {
        var self = this;
        self.editor = editor;
        self.config = config || {};
        Editor.Utils.lazyRun(self, '_prepareShow', '_real');
    }
    util.augment(LinkDialog, {
        _prepareShow: function () {
            var self = this, editor = self.editor, prefixCls = editor.get('prefixCls'), d = new Dialog4E({
                    width: 500,
                    headerContent: '\u94FE\u63A5',
                    bodyContent: util.substitute(bodyHTML, { prefixCls: prefixCls }),
                    footerContent: util.substitute(footHTML, { prefixCls: prefixCls }),
                    mask: true
                }).render();
            self.dialog = d;
            var body = d.get('body'), foot = d.get('footer');
            d.urlEl = body.one('.' + prefixCls + 'editor-link-url');
            d.urlTitle = body.one('.' + prefixCls + 'editor-link-title');
            d.targetEl = body.one('.' + prefixCls + 'editor-link-blank');
            var cancel = foot.one('.' + prefixCls + 'editor-link-cancel'), ok = foot.one('.' + prefixCls + 'editor-link-ok');
            ok.on('click', self._link, self);
            cancel.on('click', function (ev) {
                ev.halt();
                d.hide();
            });
            Editor.Utils.placeholder(d.urlEl, 'http://');
        },
        _link: function (ev) {
            ev.halt();
            var self = this, d = self.dialog, url = d.urlEl.val();
            if (!Editor.Utils.verifyInputs(d.get('el').all('input'))) {
                return;
            }
            d.hide();
            var attr = {
                    href: url,
                    target: d.targetEl[0].checked ? '_blank' : '_self',
                    title: util.trim(d.urlTitle.val())
                };    // ie9 focus 不同步，hide后等会才能恢复焦点
            // ie9 focus 不同步，hide后等会才能恢复焦点
            setTimeout(function () {
                Utils.applyLink(self.editor, attr, self._selectedEl);
            }, 0);
        },
        _real: function () {
            var self = this, cfg = self.config, d = self.dialog, _selectedEl = self._selectedEl;    //是修改行为
            //是修改行为
            if (_selectedEl) {
                var url = _selectedEl.attr(savedHref) || _selectedEl.attr('href');
                Editor.Utils.valInput(d.urlEl, url);
                d.urlTitle.val(_selectedEl.attr('title') || '');
                d.targetEl[0].checked = _selectedEl.attr('target') === '_blank';
            } else {
                Editor.Utils.resetInput(d.urlEl);
                d.urlTitle.val('');
                if (cfg.target) {
                    d.targetEl[0].checked = true;
                }
            }
            d.show();
        },
        show: function (_selectedEl) {
            var self = this;
            self._selectedEl = _selectedEl;
            self._prepareShow();
        }
    });
    module.exports = LinkDialog;
});



