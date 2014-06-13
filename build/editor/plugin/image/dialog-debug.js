/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:46
*/
/*
combined modules:
editor/plugin/image/dialog
editor/plugin/image/dialog/dialog-xtpl
*/
KISSY.add('editor/plugin/image/dialog', [
    'util',
    'editor',
    'io',
    '../dialog',
    'xtemplate/runtime',
    'tabs',
    '../menubutton',
    './dialog/dialog-xtpl',
    'ua',
    'node'
], function (S, require, exports, module) {
    /**
 * @ignore
 * image dialog (support upload and remote)
 * @author yiminghe@gmail.com
 */
    /*global alert*/
    var util = require('util');
    var Editor = require('editor');
    var IO = require('io');
    var Dialog4E = require('../dialog');
    var XTemplate = require('xtemplate/runtime');
    var Tabs = require('tabs');
    var MenuButton = require('../menubutton');
    var bodyXTpl = require('./dialog/dialog-xtpl');
    var dtd = Editor.XHTML_DTD, UA = require('ua'), $ = require('node'), HTTP_TIP = 'http://', AUTOMATIC_TIP = '\u81EA\u52A8', MARGIN_DEFAULT = 10, IMAGE_DIALOG_FOOT_HTML = '<div style="padding:5px 20px 20px;">' + '<a ' + 'href="javascript:void(\'\u786E\u5B9A\')" ' + 'class="{prefixCls}img-insert {prefixCls}button ks-inline-block" ' + 'style="margin-right:30px;">\u786E\u5B9A</a> ' + '<a  ' + 'href="javascript:void(\'\u53D6\u6D88\')" ' + 'class="{prefixCls}img-cancel {prefixCls}button ks-inline-block">\u53D6\u6D88</a></div>', warning = '\u8BF7\u70B9\u51FB\u6D4F\u89C8\u4E0A\u4F20\u56FE\u7247', valInput = Editor.Utils.valInput;
    function findAWithImg(img) {
        var ret = img;
        while (ret) {
            var name = ret.nodeName();
            if (name === 'a') {
                return ret;
            }
            if (dtd.$block[name] || dtd.$blockLimit[name]) {
                return null;
            }
            ret = ret.parent();
        }
        return null;
    }
    function ImageDialog(editor, config) {
        var self = this;
        self.editor = editor;
        self.imageCfg = config || {};
        self.cfg = self.imageCfg.upload || null;
        self.suffix = self.cfg && self.cfg.suffix || 'png,jpg,jpeg,gif';    // 不要加g：http://yiminghe.javaeye.com/blog/581347
        // 不要加g：http://yiminghe.javaeye.com/blog/581347
        self.suffixReg = new RegExp(self.suffix.split(/,/).join('|') + '$', 'i');
        self.suffixWarning = '\u53EA\u5141\u8BB8\u540E\u7F00\u540D\u4E3A' + self.suffix + '\u7684\u56FE\u7247';
    }
    ImageDialog.prototype = {
        _prepare: function () {
            var self = this;
            var editor = self.editor, prefixCls = editor.get('prefixCls') + 'editor-';
            self.dialog = self.d = new Dialog4E({
                width: 500,
                headerContent: '\u56FE\u7247',
                bodyContent: new XTemplate(bodyXTpl).render({ prefixCls: prefixCls }),
                footerContent: util.substitute(IMAGE_DIALOG_FOOT_HTML, { prefixCls: prefixCls }),
                mask: true
            }).render();
            var content = self.d.get('el'), cancel = content.one('.' + prefixCls + 'img-cancel'), ok = content.one('.' + prefixCls + 'img-insert'), verifyInputs = Editor.Utils.verifyInputs, commonSettingTable = content.one('.' + prefixCls + 'img-setting');
            self.uploadForm = content.one('.' + prefixCls + 'img-upload-form');
            self.imgLocalUrl = content.one('.' + prefixCls + 'img-local-url');
            self.tab = new Tabs({
                'srcNode': self.d.get('body').one('.' + prefixCls + 'img-tabs'),
                prefixCls: prefixCls + 'img-'
            }).render();
            self.imgLocalUrl.val(warning);
            self.imgUrl = content.one('.' + prefixCls + 'img-url');
            self.imgHeight = content.one('.' + prefixCls + 'img-height');
            self.imgWidth = content.one('.' + prefixCls + 'img-width');
            self.imgRatio = content.one('.' + prefixCls + 'img-ratio');
            self.imgAlign = MenuButton.Select.decorate(content.one('.' + prefixCls + 'img-align'), {
                prefixCls: prefixCls + 'big-',
                width: 80,
                menuCfg: {
                    prefixCls: prefixCls + '',
                    render: content
                }
            });
            self.imgMargin = content.one('.' + prefixCls + 'img-margin');
            self.imgLink = content.one('.' + prefixCls + 'img-link');
            self.imgLinkBlank = content.one('.' + prefixCls + 'img-link-blank');
            var placeholder = Editor.Utils.placeholder;
            placeholder(self.imgUrl, HTTP_TIP);
            placeholder(self.imgHeight, AUTOMATIC_TIP);
            placeholder(self.imgWidth, AUTOMATIC_TIP);
            placeholder(self.imgLink, 'http://');
            self.imgHeight.on('keyup', function () {
                var v = parseInt(valInput(self.imgHeight), 10);
                if (!v || !self.imgRatio[0].checked || self.imgRatio[0].disabled || !self.imgRatioValue) {
                    return;
                }
                valInput(self.imgWidth, Math.floor(v * self.imgRatioValue));
            });
            self.imgWidth.on('keyup', function () {
                var v = parseInt(valInput(self.imgWidth), 10);
                if (!v || !self.imgRatio[0].checked || self.imgRatio[0].disabled || !self.imgRatioValue) {
                    return;
                }
                valInput(self.imgHeight, Math.floor(v / self.imgRatioValue));
            });
            cancel.on('click', function (ev) {
                self.d.hide();
                ev.halt();
            });
            var loadingCancel = $('<a class="' + prefixCls + 'button ks-inline-block" ' + 'style="position:absolute;' + 'z-index:' + Editor.baseZIndex(Editor.ZIndexManager.LOADING_CANCEL) + ';' + 'left:-9999px;' + 'top:-9999px;' + '">\u53D6\u6D88\u4E0A\u4F20</a>').appendTo(document.body, undefined);
            self.loadingCancel = loadingCancel;
            function getFileSize(file) {
                if (file.files) {
                    return file.files[0].size;
                }    //ie 会安全警告
                     //                    try {
                     //                        var fso = new window.ActiveXObject('Scripting.FileSystemObject'),
                     //                            file2 = fso.GetFile(file.value);
                     //                        return file2.size;
                     //                    } catch (e) {
                     //                    }
                //ie 会安全警告
                //                    try {
                //                        var fso = new window.ActiveXObject('Scripting.FileSystemObject'),
                //                            file2 = fso.GetFile(file.value);
                //                        return file2.size;
                //                    } catch (e) {
                //                    }
                return 0;
            }
            ok.on('click', function (ev) {
                ev.halt();
                if ((self.imageCfg.remote === false || util.indexOf(self.tab.getSelectedTab(), self.tab.getTabs()) === 1) && self.cfg) {
                    if (!verifyInputs(commonSettingTable.all('input'))) {
                        return;
                    }
                    if (self.imgLocalUrl.val() === warning) {
                        alert('\u8BF7\u5148\u9009\u62E9\u6587\u4EF6!');
                        return;
                    }
                    if (!self.suffixReg.test(self.imgLocalUrl.val())) {
                        alert(self.suffixWarning);    // 清除已选文件 ie 不能使用 val('')
                        // 清除已选文件 ie 不能使用 val('')
                        self.uploadForm[0].reset();
                        self.imgLocalUrl.val(warning);
                        return;
                    }
                    var size = getFileSize(self.fileInput[0]);
                    if (sizeLimit && sizeLimit < size / 1000) {
                        alert('\u4E0A\u4F20\u56FE\u7247\u6700\u5927\uFF1A' + sizeLimit / 1000 + 'M');
                        return;
                    }
                    self.d.loading();    // 取消当前iframe的上传
                    // 取消当前iframe的上传
                    loadingCancel.on('click', function (ev) {
                        ev.halt();
                        uploadIO.abort();
                    });
                    var serverParams = Editor.Utils.normParams(self.cfg.serverParams) || {};    // 后端返回设置 domain 的 script，每次都传，防止 domain 中途变化
                    // 后端返回设置 domain 的 script，每次都传，防止 domain 中途变化
                    serverParams['document-domain'] = document.domain;
                    var uploadIO = IO({
                            data: serverParams,
                            url: self.cfg.serverUrl,
                            form: self.uploadForm[0],
                            dataType: 'json',
                            type: 'post',
                            complete: function (data, status) {
                                loadingCancel.css({
                                    left: -9999,
                                    top: -9999
                                });
                                self.d.unloading();
                                if (status === 'abort') {
                                    return;
                                }
                                if (!data) {
                                    data = { error: '\u670D\u52A1\u5668\u51FA\u9519\uFF0C\u8BF7\u91CD\u8BD5' };
                                }
                                if (data.error) {
                                    alert(data.error);
                                    return;
                                }
                                valInput(self.imgUrl, data.imgUrl);    // chrome 中空 iframe 的 img 请求 header 中没有 refer
                                                                       // 在主页面先请求一次，带入 header
                                // chrome 中空 iframe 的 img 请求 header 中没有 refer
                                // 在主页面先请求一次，带入 header
                                new Image().src = data.imgUrl;
                                self._insert();
                            }
                        });
                    var loadingMaskEl = self.d.get('el'), offset = loadingMaskEl.offset(), width = loadingMaskEl[0].offsetWidth, height = loadingMaskEl[0].offsetHeight;
                    loadingCancel.css({
                        left: offset.left + width / 2.5,
                        top: offset.top + height / 1.5
                    });
                } else {
                    if (!verifyInputs(content.all('input'))) {
                        return;
                    }
                    self._insert();
                }
            });
            if (self.cfg) {
                if (self.cfg.extraHTML) {
                    content.one('.' + prefixCls + 'img-up-extraHTML').html(self.cfg.extraHTML);
                }
                var imageUp = content.one('.' + prefixCls + 'image-up'), sizeLimit = self.cfg && self.cfg.sizeLimit;
                self.fileInput = $('<input ' + 'type="file" ' + 'style="position:absolute;' + 'cursor:pointer;' + 'left:' + (UA.ie ? '360' : UA.chrome ? '319' : '369') + 'px;' + 'z-index:2;' + 'top:0px;' + 'height:26px;" ' + 'size="1" ' + 'name="' + (self.cfg.fileInput || 'Filedata') + '"/>').insertAfter(self.imgLocalUrl);
                if (sizeLimit) {
                    warning = '\u5355\u5F20\u56FE\u7247\u5BB9\u91CF\u4E0D\u8D85\u8FC7 ' + sizeLimit / 1000 + ' M';
                }
                self.imgLocalUrl.val(warning);
                self.fileInput.css('opacity', 0);
                self.fileInput.on('mouseenter', function () {
                    imageUp.addClass('' + prefixCls + 'button-hover');
                });
                self.fileInput.on('mouseleave', function () {
                    imageUp.removeClass('' + prefixCls + 'button-hover');
                });
                self.fileInput.on('change', function () {
                    var file = self.fileInput.val();    //去除路径
                    //去除路径
                    self.imgLocalUrl.val(file.replace(/.+[\/\\]/, ''));
                });
                if (self.imageCfg.remote === false) {
                    self.tab.removeItemAt(0, 1);
                }
            } else {
                self.tab.removeItemAt(1, 1);
            }
            self._prepare = util.noop;
        },
        _insert: function () {
            var self = this, url = valInput(self.imgUrl), img, height = parseInt(valInput(self.imgHeight), 10), width = parseInt(valInput(self.imgWidth), 10), align = self.imgAlign.get('value'), margin = parseInt(self.imgMargin.val(), 10), style = '';
            if (height) {
                style += 'height:' + height + 'px;';
            }
            if (width) {
                style += 'width:' + width + 'px;';
            }
            if (align !== 'none') {
                style += 'float:' + align + ';';
            }
            if (!isNaN(margin) && margin !== 0) {
                style += 'margin:' + margin + 'px;';
            }
            self.d.hide();    /*
         2011-01-05
         <a><img></a> 这种结构，a不要设成 position:absolute
         否则img select 不到？!!: editor.getSelection().selectElement(img) 选择不到
         */
            /*
         2011-01-05
         <a><img></a> 这种结构，a不要设成 position:absolute
         否则img select 不到？!!: editor.getSelection().selectElement(img) 选择不到
         */
            if (self.selectedEl) {
                img = self.selectedEl;
                self.editor.execCommand('save');
                self.selectedEl.attr({
                    'src': url,
                    //注意设置，取的话要从 _ke_saved_src 里取
                    '_ke_saved_src': url,
                    'style': style
                });
            } else {
                img = $('<img ' + (style ? 'style="' + style + '"' : '') + ' src="' + url + '" ' + '_ke_saved_src="' + url + '" alt="" />', self.editor.get('document')[0]);
                self.editor.insertElement(img);
            }    // need a breath for firefox
                 // else insertElement(img); img[0].parentNode==null
            // need a breath for firefox
            // else insertElement(img); img[0].parentNode==null
            setTimeout(function () {
                var link = findAWithImg(img), linkVal = util.trim(valInput(self.imgLink)), sel = self.editor.getSelection(), target = self.imgLinkBlank.attr('checked') ? '_blank' : '_self', linkTarget, skip = 0, prev, next, bs;
                if (link) {
                    linkTarget = link.attr('target') || '_self';
                    if (linkVal !== link.attr('href') || linkTarget !== target) {
                        img._4eBreakParent(link);
                        if ((prev = img.prev()) && prev.nodeName() === 'a' && !prev[0].childNodes.length) {
                            prev.remove();
                        }
                        if ((next = img.next()) && next.nodeName() === 'a' && !next[0].childNodes.length) {
                            next.remove();
                        }
                    } else {
                        skip = 1;
                    }
                }
                if (!skip && linkVal) {
                    // 新增需要 bookmark，标记
                    if (!self.selectedEl) {
                        bs = sel.createBookmarks();
                    }
                    link = $('<a>');
                    link.attr('_ke_saved_href', linkVal).attr('href', linkVal).attr('target', target);
                    var t = img[0];
                    t.parentNode.replaceChild(link[0], t);
                    link.append(t);
                }
                if (bs) {
                    sel.selectBookmarks(bs);
                } else if (self.selectedEl) {
                    self.editor.getSelection().selectElement(self.selectedEl);
                }
                if (!skip) {
                    self.editor.execCommand('save');
                }
            }, 100);
        },
        _update: function (selectedEl) {
            var self = this, active = 0, link, resetInput = Editor.Utils.resetInput;
            self.selectedEl = selectedEl;
            if (selectedEl && self.imageCfg.remote !== false) {
                valInput(self.imgUrl, selectedEl.attr('src'));
                var w = parseInt(selectedEl.style('width'), 10), h = parseInt(selectedEl.style('height'), 10);
                if (h) {
                    valInput(self.imgHeight, h);
                } else {
                    resetInput(self.imgHeight);
                }
                if (w) {
                    valInput(self.imgWidth, w);
                } else {
                    resetInput(self.imgWidth);
                }
                self.imgAlign.set('value', selectedEl.style('float') || 'none');
                var margin = parseInt(selectedEl.style('margin'), 10) || 0;
                self.imgMargin.val(margin);
                self.imgRatio[0].disabled = false;
                self.imgRatioValue = w / h;
                link = findAWithImg(selectedEl);
            } else {
                var editor = self.editor;
                var editorSelection = editor.getSelection();
                var inElement = editorSelection && editorSelection.getCommonAncestor();
                if (inElement) {
                    link = findAWithImg(inElement);
                }
                var defaultMargin = self.imageCfg.defaultMargin;
                if (defaultMargin === undefined) {
                    defaultMargin = MARGIN_DEFAULT;
                }
                if (self.tab.get('bar').get('children').length === 2) {
                    active = 1;
                }
                self.imgLinkBlank.attr('checked', true);
                resetInput(self.imgUrl);
                resetInput(self.imgLink);
                resetInput(self.imgHeight);
                resetInput(self.imgWidth);
                self.imgAlign.set('value', 'none');
                self.imgMargin.val(defaultMargin);
                self.imgRatio[0].disabled = true;
                self.imgRatioValue = null;
            }
            if (link) {
                valInput(self.imgLink, link.attr('_ke_saved_href') || link.attr('href'));
                self.imgLinkBlank.attr('checked', link.attr('target') === '_blank');
            } else {
                resetInput(self.imgLink);
                self.imgLinkBlank.attr('checked', true);
            }
            self.uploadForm[0].reset();
            self.imgLocalUrl.val(warning);
            var tab = self.tab;
            tab.setSelectedTab(tab.getTabAt(active));
        },
        show: function (_selectedEl) {
            var self = this;
            self._prepare();
            self._update(_selectedEl);
            self.d.show();
        },
        destroy: function () {
            var self = this;
            self.d.destroy();
            self.tab.destroy();
            if (self.loadingCancel) {
                self.loadingCancel.remove();
            }
            if (self.imgAlign) {
                self.imgAlign.destroy();
            }
        }
    };
    module.exports = ImageDialog;
});







/** Compiled By kissy-xtemplate */
/*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
KISSY.add('editor/plugin/image/dialog/dialog-xtpl', [], function (S, require, exports, module) {
    var dialogXtplHtml = function (scope, buffer, undefined) {
        var tpl = this, nativeCommands = tpl.root.nativeCommands, utils = tpl.root.utils;
        var callFnUtil = utils['callFn'], callCommandUtil = utils['callCommand'], rangeCommand = nativeCommands['range'], eachCommand = nativeCommands['each'], withCommand = nativeCommands['with'], ifCommand = nativeCommands['if'], setCommand = nativeCommands['set'], includeCommand = nativeCommands['include'], parseCommand = nativeCommands['parse'], extendCommand = nativeCommands['extend'], blockCommand = nativeCommands['block'], macroCommand = nativeCommands['macro'], debuggerCommand = nativeCommands['debugger'];
        buffer.write('<div class=\'', 0);
        var id0 = scope.resolve(['prefixCls'], 0);
        buffer.write(id0, false);
        buffer.write('img-tabs\'>\r\n    <div class=\'', 0);
        var id1 = scope.resolve(['prefixCls'], 0);
        buffer.write(id1, false);
        buffer.write('img-tabs-bar ks-clear\'>\r\n        <div\r\n                class=\'', 0);
        var id2 = scope.resolve(['prefixCls'], 0);
        buffer.write(id2, false);
        buffer.write('img-tabs-tab-selected ', 0);
        var id3 = scope.resolve(['prefixCls'], 0);
        buffer.write(id3, false);
        buffer.write('img-tabs-tab\'\r\n\r\n                hidefocus=\'hidefocus\'>\r\n            \u7F51\u7EDC\u56FE\u7247\r\n        </div>\r\n        <div\r\n                class=\'', 0);
        var id4 = scope.resolve(['prefixCls'], 0);
        buffer.write(id4, false);
        buffer.write('img-tabs-tab\'\r\n                hidefocus=\'hide\r\n    focus\'>\r\n            \u672C\u5730\u4E0A\u4F20\r\n        </div>\r\n    </div>\r\n    <div class=\'', 0);
        var id5 = scope.resolve(['prefixCls'], 0);
        buffer.write(id5, false);
        buffer.write('img-tabs-body\'>\r\n        <div class=\'', 0);
        var id6 = scope.resolve(['prefixCls'], 0);
        buffer.write(id6, false);
        buffer.write('img-tabs-panel ', 0);
        var id7 = scope.resolve(['prefixCls'], 0);
        buffer.write(id7, false);
        buffer.write('img-tabs-panel-selected\'>\r\n            <label>\r\n        <span class=\'', 0);
        var id8 = scope.resolve(['prefixCls'], 0);
        buffer.write(id8, false);
        buffer.write('image-title\'>\r\n        \u56FE\u7247\u5730\u5740\uFF1A\r\n        </span>\r\n                <input\r\n                        data-verify=\'^(https?:/)?/[^\\\\s]\'\r\n                        data-warning=\'\u7F51\u5740\u683C\u5F0F\u4E3A\uFF1Ahttp:// \u6216 /\'\r\n                        class=\'', 0);
        var id9 = scope.resolve(['prefixCls'], 0);
        buffer.write(id9, false);
        buffer.write('img-url ', 0);
        var id10 = scope.resolve(['prefixCls'], 0);
        buffer.write(id10, false);
        buffer.write('input\'\r\n                        style=\'width:390px;vertical-align:middle;\'\r\n                        />\r\n            </label>\r\n        </div>\r\n        <div class=\'', 0);
        var id11 = scope.resolve(['prefixCls'], 0);
        buffer.write(id11, false);
        buffer.write('img-tabs-panel\'>\r\n            <form class=\'', 0);
        var id12 = scope.resolve(['prefixCls'], 0);
        buffer.write(id12, false);
        buffer.write('img-upload-form\' enctype=\'multipart/form-data\'>\r\n                <p style=\'zoom:1;\'>\r\n                    <input class=\'', 0);
        var id13 = scope.resolve(['prefixCls'], 0);
        buffer.write(id13, false);
        buffer.write('input ', 0);
        var id14 = scope.resolve(['prefixCls'], 0);
        buffer.write(id14, false);
        buffer.write('img-local-url\'\r\n                           readonly=\'readonly\'\r\n                           style=\'margin-right: 15px;\r\n            vertical-align: middle;\r\n            width: 368px;\r\n            color:#969696;\'/>\r\n                    <a\r\n                            style=\'padding:3px 11px;\r\n            position:absolute;\r\n            left:390px;\r\n            top:0;\r\n            z-index:1;\'\r\n                            class=\'', 0);
        var id15 = scope.resolve(['prefixCls'], 0);
        buffer.write(id15, false);
        buffer.write('image-up ', 0);
        var id16 = scope.resolve(['prefixCls'], 0);
        buffer.write(id16, false);
        buffer.write('button ks-inline-block\'>\u6D4F\u89C8...</a>\r\n                </p>\r\n\r\n                <div class=\'', 0);
        var id17 = scope.resolve(['prefixCls'], 0);
        buffer.write(id17, false);
        buffer.write('img-up-extraHTML\'>\r\n                </div>\r\n            </form>\r\n        </div>\r\n    </div>\r\n</div>\r\n<div style=\'\r\n            padding:0 20px 5px 20px;\'>\r\n    <table\r\n            style=\'width:100%;margin-top:8px;\'\r\n            class=\'', 0);
        var id18 = scope.resolve(['prefixCls'], 0);
        buffer.write(id18, false);
        buffer.write('img-setting\'>\r\n        <tr>\r\n            <td>\r\n                <label>\r\n                    \u5BBD\u5EA6\uFF1A\r\n                </label>\r\n                <input\r\n                        data-verify=\'^(\u81EA\u52A8|((?!0$)\\\\d+))?$\'\r\n                        data-warning=\'\u5BBD\u5EA6\u8BF7\u8F93\u5165\u6B63\u6574\u6570\'\r\n                        class=\'', 0);
        var id19 = scope.resolve(['prefixCls'], 0);
        buffer.write(id19, false);
        buffer.write('img-width ', 0);
        var id20 = scope.resolve(['prefixCls'], 0);
        buffer.write(id20, false);
        buffer.write('input\'\r\n                        style=\'vertical-align:middle;width:60px\'\r\n                        /> \u50CF\u7D20\r\n\r\n            </td>\r\n            <td>\r\n                <label>\r\n                    \u9AD8\u5EA6\uFF1A\r\n                    <label>\r\n                        <input\r\n                                data-verify=\'^(\u81EA\u52A8|((?!0$)\\\\d+))?$\'\r\n                                data-warning=\'\u9AD8\u5EA6\u8BF7\u8F93\u5165\u6B63\u6574\u6570\'\r\n                                class=\'', 0);
        var id21 = scope.resolve(['prefixCls'], 0);
        buffer.write(id21, false);
        buffer.write('img-height ', 0);
        var id22 = scope.resolve(['prefixCls'], 0);
        buffer.write(id22, false);
        buffer.write('input\'\r\n                                style=\'vertical-align:middle;width:60px\'\r\n                                /> \u50CF\u7D20 </label>\r\n\r\n                    <input\r\n                            type=\'checkbox\'\r\n                            class=\'', 0);
        var id23 = scope.resolve(['prefixCls'], 0);
        buffer.write(id23, false);
        buffer.write('img-ratio\'\r\n                            style=\'vertical-align:middle;margin-left:5px;\'\r\n                            checked=\'checked\'/>\r\n                    \u9501\u5B9A\u9AD8\u5BBD\u6BD4\r\n                </label>\r\n            </td>\r\n        </tr>\r\n        <tr>\r\n            <td>\r\n                <label>\r\n                    \u5BF9\u9F50\uFF1A\r\n                </label>\r\n                <select class=\'', 0);
        var id24 = scope.resolve(['prefixCls'], 0);
        buffer.write(id24, false);
        buffer.write('img-align\' title=\'\u5BF9\u9F50\'>\r\n                    <option value=\'none\'>\u65E0</option>\r\n                    <option value=\'left\'>\u5DE6\u5BF9\u9F50</option>\r\n                    <option value=\'right\'>\u53F3\u5BF9\u9F50</option>\r\n                </select>\r\n\r\n            </td>\r\n            <td><label>\r\n                \u95F4\u8DDD\uFF1A\r\n            </label>\r\n                <input\r\n                        data-verify=\'^\\\\d+$\'\r\n                        data-warning=\'\u95F4\u8DDD\u8BF7\u8F93\u5165\u975E\u8D1F\u6574\u6570\'\r\n                        class=\'', 0);
        var id25 = scope.resolve(['prefixCls'], 0);
        buffer.write(id25, false);
        buffer.write('img-margin ', 0);
        var id26 = scope.resolve(['prefixCls'], 0);
        buffer.write(id26, false);
        buffer.write('input\'\r\n                        style=\'width:60px\'/> \u50CF\u7D20\r\n\r\n            </td>\r\n        </tr>\r\n        <tr>\r\n            <td colspan=\'2\' style=\'padding-top: 6px\'>\r\n                <label>\r\n                    \u94FE\u63A5\u7F51\u5740\uFF1A\r\n                </label>\r\n                <input\r\n                        class=\'', 0);
        var id27 = scope.resolve(['prefixCls'], 0);
        buffer.write(id27, false);
        buffer.write('img-link ', 0);
        var id28 = scope.resolve(['prefixCls'], 0);
        buffer.write(id28, false);
        buffer.write('input\'\r\n                        style=\'width:235px;vertical-align:middle;\'\r\n                        data-verify=\'^(?:(?:\\\\s*)|(?:https?://[^\\\\s]+)|(?:#.+))$\'\r\n                        data-warning=\'\u8BF7\u8F93\u5165\u5408\u9002\u7684\u7F51\u5740\u683C\u5F0F\'\r\n                        />\r\n\r\n                <label>\r\n                    <input\r\n                            class=\'', 0);
        var id29 = scope.resolve(['prefixCls'], 0);
        buffer.write(id29, false);
        buffer.write('img-link-blank\'\r\n                            style=\'vertical-align:middle;\r\n                margin-left:5px;\'\r\n                            type=\'checkbox\'/>\r\n                    &nbsp; \u5728\u65B0\u7A97\u53E3\u6253\u5F00\u94FE\u63A5\r\n                </label>\r\n            </td>\r\n        </tr>\r\n    </table>\r\n</div>\r\n', 0);
        return buffer;
    };
    dialogXtplHtml.TPL_NAME = module.name;
    dialogXtplHtml.version = '5.0.0';
    module.exports = dialogXtplHtml;
});

