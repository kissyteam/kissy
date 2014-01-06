/**
 * @ignore
 * image dialog (support upload and remote)
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    /*global alert*/
    var Editor = require('editor');
    var IO = require('io');
    var Dialog4E = require('../dialog');
    var Tabs = require('tabs');
    var MenuButton = require('../menubutton');
    var bodyTpl = require('./dialog/dialog-tpl');
    var dtd = Editor.XHTML_DTD,
        UA = S.UA,
        Node = KISSY.NodeList,
        HTTP_TIP = 'http://',
        AUTOMATIC_TIP = '自动',
        MARGIN_DEFAULT = 10,
        IMAGE_DIALOG_BODY_HTML = bodyTpl,

        IMAGE_DIALOG_FOOT_HTML = '<div style="padding:5px 20px 20px;">' +
            '<a ' +
            'href="javascript:void(\'确定\')" ' +
            'class="{prefixCls}img-insert {prefixCls}button ks-inline-block" ' +
            'style="margin-right:30px;">确定</a> ' +
            '<a  ' +
            'href="javascript:void(\'取消\')" ' +
            'class="{prefixCls}img-cancel {prefixCls}button ks-inline-block">取消</a></div>',

        warning = '请点击浏览上传图片',

        valInput = Editor.Utils.valInput;

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
        self.suffix = self.cfg && self.cfg.suffix || 'png,jpg,jpeg,gif';
        // 不要加g：http://yiminghe.javaeye.com/blog/581347
        self.suffixReg = new RegExp(self.suffix.split(/,/).join('|') + '$', 'i');
        self.suffixWarning = '只允许后缀名为' + self.suffix + '的图片';
    }

    S.augment(ImageDialog, {
        _prepare: function () {
            var self = this;
            var editor = self.editor,
                prefixCls = editor.get('prefixCls') + 'editor-';
            self.dialog = self.d = new Dialog4E({
                width: 500,
                headerContent: '图片',
                bodyContent: S.substitute(IMAGE_DIALOG_BODY_HTML, {
                    prefixCls: prefixCls
                }),
                footerContent: S.substitute(IMAGE_DIALOG_FOOT_HTML, {
                    prefixCls: prefixCls
                }),
                mask: true
            }).render();

            var content = self.d.get('el'),
                cancel = content.one('.' + prefixCls + 'img-cancel'),
                ok = content.one('.' + prefixCls + 'img-insert'),
                verifyInputs = Editor.Utils.verifyInputs,
                commonSettingTable = content.one('.' + prefixCls + 'img-setting');
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
                var v = parseInt(valInput(self.imgHeight),10);
                if (!v || !self.imgRatio[0].checked ||
                    self.imgRatio[0].disabled || !self.imgRatioValue) {
                    return;
                }
                valInput(self.imgWidth, Math.floor(v * self.imgRatioValue));
            });

            self.imgWidth.on('keyup', function () {
                var v = parseInt(valInput(self.imgWidth),10);
                if (!v || !self.imgRatio[0].checked ||
                    self.imgRatio[0].disabled || !self.imgRatioValue) {
                    return;
                }
                valInput(self.imgHeight, Math.floor(v / self.imgRatioValue));
            });

            cancel.on('click', function (ev) {
                self.d.hide();
                ev.halt();
            });

            var loadingCancel = new Node('<a class="' + prefixCls + 'button ks-inline-block" ' +
                'style="position:absolute;' +
                'z-index:' +
                Editor.baseZIndex(Editor.ZIndexManager.LOADING_CANCEL) + ';' +
                'left:-9999px;' +
                'top:-9999px;' +
                '">取消上传</a>').appendTo(document.body, undefined);

            self.loadingCancel = loadingCancel;

            function getFileSize(file) {
                if (file.files) {
                    return file.files[0].size;
                } else if (1 > 2) {
                    //ie 会安全警告
                    try {
                        var fso = new window.ActiveXObject('Scripting.FileSystemObject'),
                            file2 = fso.GetFile(file.value);
                        return file2.size;
                    } catch (e) {
                    }
                }
                return 0;
            }

            ok.on('click', function (ev) {
                ev.halt();
                if ((self.imageCfg.remote === false ||
                    S.indexOf(self.tab.getSelectedTab(), self.tab.getTabs()) === 1) &&
                    self.cfg) {

                    if (!verifyInputs(commonSettingTable.all('input'))) {
                        return;
                    }

                    if (self.imgLocalUrl.val() === warning) {
                        alert('请先选择文件!');
                        return;
                    }

                    if (!self.suffixReg.test(self.imgLocalUrl.val())) {
                        alert(self.suffixWarning);
                        // 清除已选文件 ie 不能使用 val('')
                        self.uploadForm[0].reset();
                        self.imgLocalUrl.val(warning);
                        return;
                    }

                    var size = (getFileSize(self.fileInput[0]));

                    if (sizeLimit && sizeLimit < (size / 1000)) {
                        alert('上传图片最大：' + sizeLimit / 1000 + 'M');
                        return;
                    }

                    self.d.loading();

                    // 取消当前iframe的上传
                    loadingCancel.on('click', function (ev) {
                        ev.halt();
                        uploadIO.abort();
                    });

                    var serverParams = Editor.Utils.normParams(self.cfg.serverParams) || {};

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
                                data = {error: '服务器出错，请重试'};
                            }
                            if (data.error) {
                                alert(data.error);
                                return;
                            }
                            valInput(self.imgUrl, data.imgUrl);
                            // chrome 中空 iframe 的 img 请求 header 中没有 refer
                            // 在主页面先请求一次，带入 header
                            new Image().src = data.imgUrl;
                            self._insert();
                        }
                    });

                    var loadingMaskEl = self.d.get('el'),
                        offset = loadingMaskEl.offset(),
                        width = loadingMaskEl[0].offsetWidth,
                        height = loadingMaskEl[0].offsetHeight;

                    loadingCancel.css({
                        left: (offset.left + width / 2.5),
                        top: (offset.top + height / 1.5)
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
                    content.one('.' + prefixCls + 'img-up-extraHTML')
                        .html(self.cfg.extraHTML);
                }
                var imageUp = content.one('.' + prefixCls + 'image-up'),
                    sizeLimit = self.cfg && self.cfg.sizeLimit;

                self.fileInput = new Node('<input ' +
                    'type="file" ' +
                    'style="position:absolute;' +
                    'cursor:pointer;' +
                    'left:' +
                    (UA.ie ? '360' : (UA.chrome ? '319' : '369')) +
                    'px;' +
                    'z-index:2;' +
                    'top:0px;' +
                    'height:26px;" ' +
                    'size="1" ' +
                    'name="' + (self.cfg.fileInput || 'Filedata') + '"/>')
                    .insertAfter(self.imgLocalUrl);
                if (sizeLimit) {
                    warning = '单张图片容量不超过 ' + (sizeLimit / 1000) + ' M';
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
                    var file = self.fileInput.val();
                    //去除路径
                    self.imgLocalUrl.val(file.replace(/.+[\/\\]/, ''));
                });

                if (self.imageCfg.remote === false) {
                    self.tab.removeItemAt(0, 1);
                }
            }
            else {
                self.tab.removeItemAt(1, 1);
            }

            self._prepare = S.noop;
        },

        _insert: function () {
            var self = this,
                url = valInput(self.imgUrl),
                img,
                height = parseInt(valInput(self.imgHeight),10),
                width = parseInt(valInput(self.imgWidth),10),
                align = self.imgAlign.get('value'),
                margin = parseInt(self.imgMargin.val(),10),
                style = '';

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

            self.d.hide();

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
                img = new Node('<img ' +
                    (style ? ('style="' +
                        style +
                        '"') : '') +
                    ' src="' +
                    url +
                    '" ' +
                    '_ke_saved_src="' +
                    url +
                    '" alt="" />', null, self.editor.get('document')[0]);
                self.editor.insertElement(img);
            }

            // need a breath for firefox
            // else insertElement(img); img[0].parentNode==null
            setTimeout(function () {
                var link = findAWithImg(img),
                    linkVal = S.trim(valInput(self.imgLink)),
                    sel = self.editor.getSelection(),
                    target = self.imgLinkBlank.attr('checked') ? '_blank' : '_self',
                    linkTarget,
                    skip = 0,
                    prev,
                    next,
                    bs;

                if (link) {
                    linkTarget = link.attr('target') || '_self';
                    if (linkVal !== link.attr('href') || linkTarget !== target) {
                        img._4eBreakParent(link);
                        if ((prev = img.prev()) && (prev.nodeName() === 'a') && !(prev[0].childNodes.length)) {
                            prev.remove();
                        }

                        if ((next = img.next()) && (next.nodeName() === 'a') && !(next[0].childNodes.length)) {
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
                    link = new Node('<a></a>');
                    link.attr('_ke_saved_href', linkVal)
                        .attr('href', linkVal)
                        .attr('target', target);
                    var t = img[0];
                    t.parentNode.replaceChild(link[0], t);
                    link.append(t);
                }

                if (bs) {
                    sel.selectBookmarks(bs);
                }
                else if (self.selectedEl) {
                    self.editor.getSelection().selectElement(self.selectedEl);
                }
                if (!skip) {
                    self.editor.execCommand('save');
                }
            }, 100);
        },

        _update: function (selectedEl) {
            var self = this,
                active = 0,
                link,
                resetInput = Editor.Utils.resetInput;
            self.selectedEl = selectedEl;
            if (selectedEl && self.imageCfg.remote !== false) {
                valInput(self.imgUrl, selectedEl.attr('src'));
                var w = parseInt(selectedEl.style('width'),10),
                    h = parseInt(selectedEl.style('height'),10);
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
                var margin = parseInt(selectedEl.style('margin'),10) || 0;
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
    });

    return ImageDialog;
});
