/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:50
*/
/*
combined modules:
editor/plugin/xiami-music/dialog
*/
KISSY.add('editor/plugin/xiami-music/dialog', [
    'util',
    'editor',
    '../flash/dialog',
    '../menubutton',
    'dom',
    'node'
], function (S, require, exports, module) {
    /**
 * @ignore
 * xiami-music dialog
 * @author yiminghe@gmail.com
 */
    var util = require('util');
    var Editor = require('editor');
    var FlashDialog = require('../flash/dialog');
    var MenuButton = require('../menubutton');
    var Dom = require('dom'), $ = require('node'), Utils = Editor.Utils, loading = Utils.debugUrl('theme/tao-loading.gif'), XIAMI_URL = 'http://www.xiami.com/app/nineteen/search/key/{key}/page/{page}', CLS_XIAMI = 'ke_xiami', TYPE_XIAMI = 'xiami-music', BTIP = '\u641C \u7D22', TIP = '\u8F93\u5165\u6B4C\u66F2\u540D\u3001\u4E13\u8F91\u540D\u3001\u827A\u4EBA\u540D';
    function limit(str, l) {
        if (str.length > l) {
            str = str.substring(0, l) + '...';
        }
        return str;
    }
    var MARGIN_DEFAULT = 0, bodyHTML = '<div style="padding:40px 0 70px 0;">' + '<form action="#" class="{prefixCls}editor-xiami-form" style="margin:0 20px;">' + '<p class="{prefixCls}editor-xiami-title">' + '' + '</p>' + '<p class="{prefixCls}editor-xiami-url-wrap">' + '<input class="{prefixCls}editor-xiami-url {prefixCls}editor-input" ' + 'style="width:370px;' + '"' + '/> &nbsp; ' + ' <a ' + 'class="{prefixCls}editor-xiami-submit {prefixCls}editor-button ks-inline-block"' + '>' + BTIP + '</a>' + '</p>' + '<p ' + 'style="margin:10px 0">' + '<label>\u5BF9 \u9F50\uFF1A ' + '<select ' + 'class="{prefixCls}editor-xiami-align" title="\u5BF9\u9F50">' + '<option value="none">\u65E0</option>' + '<option value="left">\u5DE6\u5BF9\u9F50</option>' + '<option value="right">\u53F3\u5BF9\u9F50</option>' + '</select>' + '</label>' + '<label style="margin-left:70px;">\u95F4\u8DDD\uFF1A ' + ' ' + '<input ' + '' + ' data-verify="^\\d+$" ' + ' data-warning="\u95F4\u8DDD\u8BF7\u8F93\u5165\u975E\u8D1F\u6574\u6570" ' + 'class="{prefixCls}editor-xiami-margin {prefixCls}editor-input" style="width:60px;' + '" value="' + MARGIN_DEFAULT + '"/> \u50CF\u7D20' + '</label>' + '</p>' + '</form>' + '<div ' + 'class="{prefixCls}editor-xiami-list">' + '</div>' + '</div>', footHTML = '<div style="padding:5px 20px 20px;"><a ' + 'class="{prefixCls}editor-xiami-ok {prefixCls}editor-button ks-inline-block" ' + 'style="margin-right:20px;">\u786E&nbsp;\u5B9A</a>' + '<a class="{prefixCls}editor-xiami-cancel {prefixCls}editor-button ks-inline-block">\u53D6&nbsp;\u6D88</a></div>';
    function XiamiMusicDialog() {
        XiamiMusicDialog.superclass.constructor.apply(this, arguments);
    }
    util.extend(XiamiMusicDialog, FlashDialog, {
        _config: function () {
            var self = this, editor = self.editor, prefixCls = editor.get('prefixCls');
            self._cls = CLS_XIAMI;
            self._type = TYPE_XIAMI;
            self._title = '\u867E\u7C73\u97F3\u4E50';    //属性';
            //属性';
            self._bodyHTML = util.substitute(bodyHTML, { prefixCls: prefixCls });
            self._footHTML = util.substitute(footHTML, { prefixCls: prefixCls });
        },
        _initD: function () {
            var self = this, editor = self.editor, prefixCls = editor.get('prefixCls'), d = self.dialog, del = d.get('el'), dfoot = d.get('footer'), input = del.one('.' + prefixCls + 'editor-xiami-url');
            self.dAlign = MenuButton.Select.decorate(del.one('.' + prefixCls + 'editor-xiami-align'), {
                prefixCls: 'ks-editor-big-',
                width: 80,
                menuCfg: {
                    prefixCls: 'ks-editor-',
                    render: del
                }
            });
            self.addRes(self.dAlign);
            self._xiamiInput = input;
            Editor.Utils.placeholder(input, TIP);
            self.addRes(input);
            self._xiamiaList = del.one('.' + prefixCls + 'editor-xiami-list');
            self._xiamiSubmit = del.one('.' + prefixCls + 'editor-xiami-submit');
            self._xiamiSubmit.on('click', function (ev) {
                if (!self._xiamiSubmit.hasClass('ks-editor-button-disabled', undefined)) {
                    loadRecordsByPage(1);
                }
                ev.halt();
            });
            self.addRes(self._xiamiSubmit);
            input.on('keydown', function (ev) {
                if (ev.keyCode === 13) {
                    loadRecordsByPage(1);
                }
            });
            self.dMargin = del.one('.' + prefixCls + 'editor-xiami-margin');
            self._xiamiUrlWrap = del.one('.' + prefixCls + 'editor-xiami-url-wrap');
            self._xiamiTitle = del.one('.' + prefixCls + 'editor-xiami-title');
            var xiamiOk = dfoot.one('.' + prefixCls + 'editor-xiami-ok');
            dfoot.one('.' + prefixCls + 'editor-xiami-cancel').on('click', function (ev) {
                d.hide();
                ev.halt();
            });
            self.addRes(dfoot);
            xiamiOk.on('click', function (ev) {
                var f = self.selectedFlash, r = editor.restoreRealElement(f);
                self._dinfo = {
                    url: self._getFlashUrl(r),
                    attrs: {
                        title: f.attr('title'),
                        //align:self.dAlign.val(),
                        style: 'margin:' + (parseInt(self.dMargin.val(), 10) || 0) + 'px;' + 'float:' + self.dAlign.get('value') + ';'
                    }
                };
                self._gen();
                ev.halt();
            }, self);
            self.addRes(xiamiOk);
            function loadRecordsByPage(page) {
                var query = input.val();
                if (query.replace(/[^\x00-\xff]/g, '@@').length > 30) {
                    window.alert('\u957F\u5EA6\u4E0A\u965030\u4E2A\u5B57\u7B26\uFF081\u4E2A\u6C49\u5B57=2\u4E2A\u5B57\u7B26\uFF09');
                    return;
                } else if (!util.trim(query) || query === TIP) {
                    window.alert('\u4E0D\u80FD\u4E3A\u7A7A\uFF01');
                    return;
                }
                self._xiamiSubmit.addClass(prefixCls + 'editor-button-disabled', undefined);
                var req = util.substitute(XIAMI_URL, {
                        key: encodeURIComponent(input.val()),
                        page: page
                    });
                self._xiamiaList.html('<img style="' + 'display:block;' + 'width:32px;' + 'height:32px;' + 'margin:5px auto 0 auto;' + '" src="' + loading + '"/>' + '<p style="width: 130px; margin: 15px auto 0; color: rgb(150, 150, 150);">\u6B63\u5728\u641C\u7D22\uFF0C\u8BF7\u7A0D\u5019......</p>');
                self._xiamiaList.show();
                require(['io'], function (IO) {
                    IO({
                        cache: false,
                        url: req,
                        dataType: 'jsonp',
                        success: function (data) {
                            data.page = page;
                            self._listSearch(data);
                        },
                        error: function () {
                            self._xiamiSubmit.removeClass(prefixCls + 'editor-button-disabled', undefined);
                            var html = '<p style="text-align:center;margin:10px 0;">' + '\u4E0D\u597D\u610F\u601D\uFF0C\u8D85\u65F6\u4E86\uFF0C\u8BF7\u91CD\u8BD5\uFF01' + '</p>';
                            self._xiamiaList.html(html);
                        }
                    });
                });
            }
            self._xiamiaList.on('click', function (ev) {
                ev.preventDefault();
                var t = $(ev.target), add = t.closest(function (node) {
                        return self._xiamiaList.contains(node) && Dom.hasClass(node, prefixCls + 'editor-xiami-add');
                    }, undefined), paging = t.closest(function (node) {
                        return self._xiamiaList.contains(node) && Dom.hasClass(node, prefixCls + 'editor-xiami-page-item');
                    }, undefined);
                if (add) {
                    self._dinfo = {
                        url: 'http://www.xiami.com/widget/' + add.attr('data-value') + '/singlePlayer.swf',
                        attrs: {
                            title: add.attr('title'),
                            //align:self.dAlign.val(),
                            style: 'margin:' + (parseInt(self.dMargin.val(), 10) || 0) + 'px;' + 'float:' + self.dAlign.get('value') + ';'
                        }
                    };
                    self._gen();
                } else if (paging) {
                    loadRecordsByPage(parseInt(paging.attr('data-value'), 10));
                }
                ev.halt();
            });
            self.addRes(self._xiamiaList);
        },
        _listSearch: function (data) {
            var self = this, i, editor = self.editor, prefixCls = editor.get('prefixCls'), re = data.results, html = '';    // xiami 返回结果自动trim了
            // xiami 返回结果自动trim了
            if (data.key === util.trim(self._xiamiInput.val())) {
                self._xiamiSubmit.removeClass(prefixCls + 'editor-button-disabled', undefined);
                if (re && re.length) {
                    html = '<ul>';
                    for (i = 0; i < re.length; i++) {
                        var r = re[i], d = getDisplayName(r);
                        html += '<li ' + 'title="' + d + '">' + '<span class="' + prefixCls + 'editor-xiami-song">' + limit(d, 35) + '</span>' + '' + '' + //album_id_song_id
                        '<a href="#" ' + 'title="' + d + '" ' + 'class="' + prefixCls + 'editor-xiami-add" data-value="' + /*jshint camelcase:false*/
                        (r.album_id + '_' + r.song_id) + '">\u6DFB\u52A0</a>' + '</li>';
                    }
                    html += '</ul>';
                    var page = data.page, totalPage = Math.floor(data.total / 8), start = page - 1, end = page + 1;
                    if (totalPage > 1) {
                        html += '<p class="' + prefixCls + 'editor-xiami-paging">';
                        if (start <= 2) {
                            end = Math.min(2 - start + end, totalPage - 1);
                            start = 2;
                        }
                        end = Math.min(end, totalPage - 1);
                        if (end === totalPage - 1) {
                            start = Math.max(2, end - 3);
                        }
                        if (page !== 1) {
                            html += getXiamiPaging(page, page - 1, '\u4E0A\u4E00\u9875');
                        }
                        html += getXiamiPaging(page, 1, '1');
                        if (start !== 2) {
                            html += '<span class="' + prefixCls + 'editor-xiami-page-more">...</span>';
                        }
                        for (i = start; i <= end; i++) {
                            html += getXiamiPaging(page, i, undefined);
                        }
                        if (end !== totalPage) {
                            if (end !== totalPage - 1) {
                                html += '<span class="' + prefixCls + 'editor-xiami-page-more">...</span>';
                            }
                            html += getXiamiPaging(page, totalPage, totalPage);
                        }
                        if (page !== totalPage) {
                            html += getXiamiPaging(page, page + 1, '\u4E0B\u4E00\u9875');
                        }
                        html += '</p>';
                    }
                } else {
                    html = '<p style="text-align:center;margin:10px 0;">' + '\u4E0D\u597D\u610F\u601D\uFF0C\u6CA1\u6709\u627E\u5230\u7ED3\u679C\uFF01' + '</p>';
                }
                self._xiamiaList.html(util.substitute(html, { prefixCls: prefixCls }));
            }
        },
        _updateD: function () {
            var self = this, editor = self.editor, prefixCls = editor.get('prefixCls'), f = self.selectedFlash;
            if (f) {
                self._xiamiInput.val(f.attr('title'));
                self._xiamiTitle.html(f.attr('title'));
                self.dAlign.set('value', f.css('float'));
                self.dMargin.val(parseInt(f.style('margin'), 10) || 0);
                self._xiamiUrlWrap.hide();
                self.dialog.get('footer').show();
                self._xiamiTitle.show();
            } else {
                Editor.Utils.resetInput(self._xiamiInput);
                self.dAlign.set('value', 'none');
                self.dMargin.val(MARGIN_DEFAULT);
                self._xiamiUrlWrap.show();
                self.dialog.get('footer').hide();
                self._xiamiTitle.hide();
                self._xiamiSubmit.removeClass(prefixCls + 'editor-button-disabled', undefined);
            }
            self._xiamiaList.hide();
            self._xiamiaList.html('');
        },
        _getDInfo: function () {
            var self = this;
            util.mix(self._dinfo.attrs, {
                width: 257,
                height: 33
            });
            return self._dinfo;
        }
    });
    function getXiamiPaging(page, i, s) {
        return '<a class="{prefixCls}editor-xiami-page-item {prefixCls}editor-button ks-inline-block' + (page === i ? ' {prefixCls}editor-xiami-curpage' : '') + '" data-value="' + i + '" href="#">' + (s || i) + '</a>';
    }
    function getDisplayName(r) {
        /*jshint camelcase:false*/
        return util.urlDecode(r.song_name) + ' - ' + util.urlDecode(r.artist_name);
    }
    module.exports = XiamiMusicDialog;
});





