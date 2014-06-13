/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:49
*/
/*
combined modules:
editor/plugin/video/dialog
*/
KISSY.add('editor/plugin/video/dialog', [
    'util',
    'editor',
    'io',
    '../flash/dialog',
    '../menubutton'
], function (S, require, exports, module) {
    /**
 * @ignore
 * video dialog
 * @author yiminghe@gmail.com
 */
    var util = require('util');
    var Editor = require('editor');
    var io = require('io');
    var FlashDialog = require('../flash/dialog');
    var MenuButton = require('../menubutton');
    var CLS_VIDEO = 'ke_video', TYPE_VIDEO = 'video', DTIP = '\u81EA\u52A8', MARGIN_DEFAULT = 0, bodyHTML = '<div style="padding:20px 20px 0 20px">' + '<p>' + '<label>' + '\u94FE\u63A5\uFF1A ' + '' + '<input ' + 'class="{prefixCls}editor-video-url {prefixCls}editor-input" style="width:410px;' + '"/>' + '</label>' + '</p>' + '<table ' + 'style="margin:10px 0 5px  40px;width:400px;">' + '<tr><td>' + '<label>\u5BBD\u5EA6\uFF1A ' + ' ' + '<input ' + ' data-verify="^(' + DTIP + '|((?!0$)\\d+))?$" ' + ' data-warning="\u5BBD\u5EA6\u8BF7\u8F93\u5165\u6B63\u6574\u6570" ' + 'class="{prefixCls}editor-video-width {prefixCls}editor-input" ' + 'style="width:60px;' + '" ' + '/> \u50CF\u7D20' + '</label>' + '</td>' + '<td>' + '<label> \u9AD8\u5EA6\uFF1A ' + '' + ' <input ' + ' data-verify="^(' + DTIP + '|((?!0$)\\d+))?$" ' + ' data-warning="\u9AD8\u5EA6\u8BF7\u8F93\u5165\u6B63\u6574\u6570" ' + 'class="{prefixCls}editor-video-height {prefixCls}editor-input" style="width:60px;' + '"/> \u50CF\u7D20' + '</label>' + '</td></tr>' + '<tr>' + '<td>' + '<label>\u5BF9\u9F50\uFF1A ' + '<select class="{prefixCls}editor-video-align" title="\u5BF9\u9F50">' + '<option value="none">\u65E0</option>' + '<option value="left">\u5DE6\u5BF9\u9F50</option>' + '<option value="right">\u53F3\u5BF9\u9F50</option>' + '</select>' + '</td>' + '<td>' + '<label>\u95F4\u8DDD\uFF1A ' + '<input ' + '' + ' data-verify="^\\d+$" ' + ' data-warning="\u95F4\u8DDD\u8BF7\u8F93\u5165\u975E\u8D1F\u6574\u6570" ' + 'class="{prefixCls}editor-video-margin {prefixCls}editor-input" style="width:60px;' + '" value="' + MARGIN_DEFAULT + '"/> \u50CF\u7D20' + '</label>' + '</td></tr>' + '</table>' + '</div>', footHTML = '<div style="padding:10px 0 35px 20px;"><a ' + 'class="{prefixCls}editor-video-ok {prefixCls}editor-button ks-inline-block" ' + 'style="margin-left:40px;margin-right:20px;">\u786E\u5B9A</button> ' + '<a class="{prefixCls}editor-video-cancel {prefixCls}editor-button ks-inline-block">\u53D6\u6D88</a></div>';
    function VideoDialog() {
        VideoDialog.superclass.constructor.apply(this, arguments);
    }
    util.extend(VideoDialog, FlashDialog, {
        _config: function () {
            var self = this, editor = self.editor, prefixCls = editor.get('prefixCls'), cfg = self.config;
            self._cls = CLS_VIDEO;
            self._type = TYPE_VIDEO;
            self._title = '\u89C6\u9891';    //属性';
            //属性';
            self._bodyHTML = util.substitute(bodyHTML, { prefixCls: prefixCls });
            self._footHTML = util.substitute(footHTML, { prefixCls: prefixCls });
            self.urlCfg = cfg.urlCfg;
            self._urlTip = cfg.urlTip || '\u8BF7\u8F93\u5165\u89C6\u9891\u64AD\u653E\u94FE\u63A5...';
        },
        _initD: function () {
            var self = this, d = self.dialog, editor = self.editor, prefixCls = editor.get('prefixCls'), el = d.get('el');
            self.dUrl = el.one('.' + prefixCls + 'editor-video-url');
            self.dAlign = MenuButton.Select.decorate(el.one('.' + prefixCls + 'editor-video-align'), {
                prefixCls: prefixCls + 'editor-big-',
                width: 80,
                menuCfg: {
                    prefixCls: prefixCls + 'editor-',
                    render: el
                }
            });
            self.dMargin = el.one('.' + prefixCls + 'editor-video-margin');
            self.dWidth = el.one('.' + prefixCls + 'editor-video-width');
            self.dHeight = el.one('.' + prefixCls + 'editor-video-height');
            var action = el.one('.' + prefixCls + 'editor-video-ok'), cancel = el.one('.' + prefixCls + 'editor-video-cancel');
            action.on('click', self._gen, self);
            cancel.on('click', function (ev) {
                d.hide();
                ev.halt();
            });
            Editor.Utils.placeholder(self.dUrl, self._urlTip);
            Editor.Utils.placeholder(self.dWidth, DTIP);
            Editor.Utils.placeholder(self.dHeight, DTIP);
            self.addRes(self.dAlign);
        },
        _getDInfo: function () {
            var self = this, url = self.dUrl.val();
            var videoCfg = self.config, p = videoCfg.getProvider(url);
            if (!p) {
                window.alert('\u4E0D\u652F\u6301\u8BE5\u94FE\u63A5\u6765\u6E90!');
            } else {
                var re = p.detect(url);
                if (!re) {
                    window.alert('\u4E0D\u652F\u6301\u8BE5\u94FE\u63A5\uFF0C\u8BF7\u76F4\u63A5\u8F93\u5165\u8BE5\u89C6\u9891\u63D0\u4F9B\u7684\u5206\u4EAB\u94FE\u63A5');
                    return undefined;
                }
                return {
                    url: re,
                    attrs: {
                        height: parseInt(self.dHeight.val(), 10) || p.height,
                        width: parseInt(self.dWidth.val(), 10) || p.width,
                        style: 'margin:' + (parseInt(self.dMargin.val(), 10) || 0) + 'px;' + 'float:' + self.dAlign.get('value') + ';'
                    }
                };
            }
            return undefined;
        },
        _gen: function (ev) {
            var self = this, url = self.dUrl.val(), urlCfg = self.urlCfg;
            if (urlCfg) {
                for (var i = 0; i < urlCfg.length; i++) {
                    var c = urlCfg[i];
                    if (c.reg.test(url)) {
                        self.dialog.loading();
                        var data = {};
                        data[c.paramName || 'url'] = url;
                        io({
                            url: c.url,
                            data: data,
                            dataType: 'jsonp',
                            /*jshint loopfunc:true*/
                            success: function (data) {
                                self._dynamicUrlPrepare(data[1]);
                            }
                        });
                        return;
                    }
                }
            }
            VideoDialog.superclass._gen.call(self, ev);
            if (ev) {
                ev.halt();
            }
        },
        _dynamicUrlPrepare: function (re) {
            var self = this;
            self.dUrl.val(re);
            self.dialog.unloading();
            VideoDialog.superclass._gen.call(self);
        },
        _updateD: function () {
            var self = this, editor = self.editor, f = self.selectedFlash;
            if (f) {
                var r = editor.restoreRealElement(f);
                Editor.Utils.valInput(self.dUrl, self._getFlashUrl(r));
                self.dAlign.set('value', f.css('float'));
                self.dMargin.val(parseInt(r.style('margin'), 10) || 0);
                Editor.Utils.valInput(self.dWidth, parseInt(f.css('width'), 10));
                Editor.Utils.valInput(self.dHeight, parseInt(f.css('height'), 10));
            } else {
                Editor.Utils.resetInput(self.dUrl);
                self.dAlign.set('value', 'none');
                self.dMargin.val(MARGIN_DEFAULT);
                Editor.Utils.resetInput(self.dWidth);
                Editor.Utils.resetInput(self.dHeight);
            }
        }
    });
    module.exports = VideoDialog;
});




