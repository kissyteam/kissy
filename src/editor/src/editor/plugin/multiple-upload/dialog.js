/**
 * multiple-upload dialog
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/multiple-upload/dialog", function (S, Editor, DragPlugin,
                                                            ProgressBar, Overlay4E,
                                                            FlashBridge, localStorage,
                                                            SWF, undefined) {

    var UA = S.UA,
        DOM = S.DOM,
        $ = S.all,
        JSON = S.JSON,
        PIC_NUM_LIMIT = 15,
        PIC_NUM_LIMIT_WARNING = "系统将只保留 n 张",
        PIC_SIZE_LIMIT = 1000,
        PIC_SIZE_LIMIT_WARNING = "图片太大，请压缩至 n M以下",
        Dialog = Overlay4E.Dialog,
        KEY = "Multiple-Upload-Save",
        swfSrc = Editor.Utils.debugUrl("plugin/uploader/uploader.longzang.swf"),
        name = "ks-editor-multipleUpload",
        FLASH_VERSION_REQUIRED = "10.0.0";

    function MultiUploadDialog(editor, config) {
        this.editor = editor;
        this.progressBars = {};
        this.config = config;
        Editor.Utils.lazyRun(this, "_prepareShow", "_realShow");
    }

    function replacePrefix(str, prefix) {
        return S.substitute(str, {
            prefixCls: prefix
        });
    }

    //定义通用的函数交换两个结点的位置
    function swapNode(node1, node2) {
        //获取父结点
        var _parent = node1.parentNode;
        //获取两个结点的相对位置
        var _t1 = node1.nextSibling;
        var _t2 = node2.nextSibling;
        //将node2插入到原来node1的位置
        _parent.insertBefore(node2, _t1);
        //将node1插入到原来node2的位置
        _parent.insertBefore(node1, _t2);
    }


    S.augment(MultiUploadDialog, {
        addRes: Editor.Utils.addRes,
        destroy: Editor.Utils.destroyRes,
        _prepareShow: function () {
            var self = this,
                editor = self.editor,
                prefixCls = editor.get('prefixCls'),
                uploadCfg = self.config;

            self.addRes(function () {
                var progressBars = self.progressBars;
                for (var p in progressBars) {

                    progressBars[p].destroy();

                }
            });

            self.dialog = new Dialog({
                headerContent: "批量上传",
                mask: false,
                plugins: [
                    new DragPlugin({
                        handlers: ['.ks-editor-stdmod-header']
                    })
                ],
                focus4e: false,
                width: "600px"
            }).render();
            var d = self.dialog;

            // ie 6,7,8 upload swf 的容器如果设计了 visibility hidden 又 visible ，
            // 那个 swf 似乎就出事了
            // 所以不设置 visibility ，漂移大法
            d.on("beforeVisibleChange", function (ev) {
                if (!ev.newVal) {
                    d.set("xy", [-9999, -9999]);
                    return false;
                }
            });

            self.addRes(d);

            var multipleUploaderHolder = d.get("body"),
                btnHolder = $(
                    replacePrefix("<div class='{prefixCls}editor-upload-btn-wrap'>" +
                        "<span " +
                        "style='" +
                        "margin:0 15px 0 0px;" +
                        "color:#969696;" +
                        "display:inline-block;" +
                        "vertical-align:middle;" +
                        "width:450px;" +
                        "'></span>" +
                        "</div>", prefixCls)).appendTo(multipleUploaderHolder, undefined),
                listWrap = $("<div style='display:none'>")
                    .appendTo(multipleUploaderHolder, undefined),
                btn = $(replacePrefix("<a class='{prefixCls}editor-button ks-inline-block'>" +
                    "浏&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;览</a>", prefixCls))
                    .appendTo(btnHolder, undefined),

                listTableWrap = $(replacePrefix("<div>" +
                    "<table class='{prefixCls}editor-upload-list'>" +
                    "<thead>" +
                    "<tr>" +
                    "<th style='width:30px;'>" +
                    "序号" +
                    "</th>" +
                    "<th>" +
                    "图片" +
                    "</th>" +
                    "<th>" +
                    "大小" +
                    "</th>" +
                    "<th style='width:30%'>" +
                    "上传进度" +
                    "</th>" +
                    "<th>" +
                    "图片操作" +
                    "</th>" +
                    "</tr>" +
                    "</thead>" +
                    "<tbody>" +
                    "</tbody>" +
                    "</table>" +
                    "</div>", prefixCls)).appendTo(listWrap, undefined),
                list = listTableWrap.one("tbody"),
                upHolder = $(replacePrefix("<p " +
                    "style='" +
                    "margin:15px 15px 30px 6px;" +
                    "'>" +
                    "<a class='{prefixCls}editor-multiple-upload-delall'" +
                    " style='" +
                    "margin-right:20px;" +
                    "cursor:pointer;" +
                    "margin-left:40px;" +
                    "'>清空列表</a>" +
                    "<a class='{prefixCls}editor-button {prefixCls}editor-multiple-upload-ok ks-inline-block'>确定上传</a>" +
                    "<a class='{prefixCls}editor-button {prefixCls}editor-multiple-upload-insertall ks-inline-block'" +
                    " style='margin-left:20px;'>全部插入</a>" +
                    "</p>", prefixCls))
                    .appendTo(listWrap, undefined),
                up = upHolder.one(replacePrefix(".{prefixCls}editor-multiple-upload-ok", prefixCls)),
                insertAll = upHolder.one(replacePrefix(".{prefixCls}editor-multiple-upload-insertall", prefixCls)),
                delAll = upHolder.one(replacePrefix(".{prefixCls}editor-multiple-upload-delall", prefixCls)),
                fid = S.guid(name),
                statusText = $("<span>").prependTo(upHolder, undefined);


            self._sizeLimit = uploadCfg['sizeLimit'] || PIC_SIZE_LIMIT;
            self._numberLimit = uploadCfg['numberLimit'] || PIC_NUM_LIMIT;

            var TIP = "允许用户同时上传" +
                self._numberLimit
                + "张图片，单张图片容量不超过" +
                self._sizeLimit / 1000
                + "M";

            if (!SWF.fpvGTE(FLASH_VERSION_REQUIRED)) {
                TIP = "您的flash插件版本过低，该功能不可用，" +
                    "请<a href='http://get.adobe.com/cn/flashplayer/'" +
                    " target='_blank'>点此升级</a>";
            }

            btn.addClass(replacePrefix("{prefixCls}editor-button-disabled", prefixCls), undefined);
            self.tipSpan = btnHolder.one("span");
            self.tipSpan.html(TIP);
            if (!SWF.fpvGTE(FLASH_VERSION_REQUIRED)) {
                return;
            }
            if (uploadCfg['extraHtml']) {
                listTableWrap.append(uploadCfg['extraHtml']);
            }

            self._list = list;
            self['_listTable'] = list.parent("table");
            self._listWrap = listWrap;
            self._ds = uploadCfg['serverUrl'];
            self._dsp = uploadCfg['serverParams'] || {};
            self._fileInput = uploadCfg['fileInput'] || "Filedata";
            self.statusText = statusText;
            self.btn = btn;
            self.up = up;


            var bel = btn,
                boffset = bel.offset(),
                fwidth = bel.width() * 2,
                fheight = bel.height() * 1.5,
                flashPos = $("<div style='" +
                    ("position:absolute;" +
                        "width:" + fwidth + "px;" +
                        "height:" + fheight + "px;" +
                        "z-index:" + Editor.baseZIndex(9999) + ";")
                    + "'>").appendTo(btnHolder, undefined);

            //swfready 要求可见
            flashPos.offset(boffset);
            self.flashPos = flashPos;
            var uploader = new FlashBridge({
                src: swfSrc,
                ajbridge: true,
                methods: [
                    "getReady",
                    //"cancel",
                    "removeFile",
                    "lock",
                    "unlock",
                    "setAllowMultipleFiles",
                    "setFileFilters",
                    "uploadAll"],
                render: flashPos,
                attrs: {
                    width: fwidth,
                    height: fheight
                },
                params: {
                    wmode: "transparent",
                    flashVars: {
                        "allowedDomain": location.hostname,
                        btn: true,
                        "hand": true
                    }
                }
            });

            self.uploader = uploader;

            uploader.on("mouseOver", function () {
                bel.addClass(replacePrefix("{prefixCls}editor-button-hover", prefixCls), undefined);
            });
            uploader.on("mouseOut", function () {
                bel.removeClass(replacePrefix("{prefixCls}editor-button-hover", prefixCls), undefined);
            });
            self.addRes(uploader);

            var editorDoc = editor.get("document")[0];

            insertAll.on("click", function (ev) {
                var trs = list.all("tr");
                for (var i = 0; i < trs.length; i++) {
                    var tr = $(trs[i]),
                        url = tr.attr("url");
                    if (url) {
                        // chrome refer empty in empty src iframe
                        new Image().src = url;
                        editor.insertElement($("<p>&nbsp;<img src='" +
                            url + "'/>&nbsp;</p>", editorDoc));
                        self._removeTrFile(tr);
                    }
                }
                if (url) {
                    listWrap.hide();
                    d.hide();
                }
                ev.halt();
            });
            self.addRes(insertAll);

            delAll.on("click", function (ev) {
                var trs = list.all("tr");
                for (var i = 0; i < trs.length; i++) {
                    var tr = $(trs[i]);
                    self._removeTrFile(tr);
                }
                listWrap.hide();
                ev.halt();
            });
            self.addRes(delAll);

            list.on("click", function (ev) {
                var target = $(ev.target), tr;
                ev.halt();
                if (target.hasClass(replacePrefix("{prefixCls}editor-upload-insert", prefixCls), undefined)) {
                    tr = target.parent("tr");
                    var url = tr.attr("url");
                    new Image().src = url;
                    editor.insertElement($("<img src='" +
                        url + "'/>", null, editor.get("document")[0]));
                }
                if (
                    target.hasClass(replacePrefix("{prefixCls}editor-upload-delete", prefixCls), undefined)
                        ||
                        target.hasClass(replacePrefix("{prefixCls}editor-upload-insert", prefixCls), undefined
                        )
                    ) {
                    tr = target.parent("tr");
                    self._removeTrFile(tr);
                }

                /**
                 * 支持排序
                 */
                if (target.hasClass(replacePrefix("{prefixCls}editor-upload-moveup", prefixCls), undefined)) {
                    tr = target.parent("tr");
                    tr.css("backgroundColor", "#eef4f9");
                    tr['animate']({
                        backgroundColor: "#FBFBFB"
                    }, 1, null, function () {
                        tr.css("backgroundColor", "");
                    });

                    var pre = tr.prev(undefined, undefined);
                    if (pre) {
                        swapNode(tr[0], pre[0]);
                        self._syncStatus();
                    }

                } else if (target.hasClass(replacePrefix("{prefixCls}editor-upload-movedown", prefixCls), undefined)) {
                    tr = target.parent("tr");
                    tr.css("backgroundColor", "#eef4f9");
                    tr['animate']({
                        backgroundColor: "#FBFBFB"
                    }, 1, null, function () {
                        tr.css("backgroundColor", "");
                    });
                    var next = tr.next();
                    if (next) {
                        swapNode(tr[0], next[0]);
                        self._syncStatus();
                    }
                }
                ev.halt();
            });

            self.addRes(list);

            uploader.on("fileSelect", self._onSelect, self);
            uploader.on("uploadStart", self._onUploadStart, self);
            uploader.on("uploadProgress", self._onProgress, self);
            uploader.on("uploadCompleteData", self._onUploadCompleteData, self);
            uploader.on("contentReady", self._ready, self);
            uploader.on("uploadError", self._uploadError, self);

            //从本地恢复已上传记录
            if (localStorage.ready) {
                localStorage.ready(function () {
                    self._restore();
                });
            } else {
                self._restore();
            }

            //上传后：缩略图预览
            var previewWidth = uploadCfg['previewWidth'];
            var previewSuffix = uploadCfg['previewSuffix'];
            if (previewWidth) {

                var previewWin = new (S.require("overlay"))({
                    mask: false,
                    prefixCls: replacePrefix('{prefixCls}editor-', prefixCls),
                    width: previewWidth,
                    render: listWrap
                }).render();
                self.addRes(previewWin);
                var preview = previewWin.get("contentEl");
                preview.css("border", "none");

                var currentFid = 0;
                listWrap.on("mouseover", function (ev) {
                    var t = $(ev.target),
                        td = t.parent(replacePrefix(".{prefixCls}editor-upload-filename", prefixCls));
                    if (td) {
                        var tr = td.parent("tr");
                        if (tr.hasClass(replacePrefix("{prefixCls}editor-upload-complete", prefixCls),
                            undefined)) {
                            var url = tr.attr("url"),
                                fid = tr.attr("fid");
                            if (!url) return;
                            if (fid == currentFid) {
                            } else {
                                currentFid = fid;
                                if (previewSuffix) {
                                    url = url.replace(/(\.\w+$)/, previewSuffix);
                                }
                                preview.html("<img " +
                                    "style='display:block;' " +
                                    "src='" +
                                    url + "' />")
                            }
                            var offset = DOM.offset(td);
                            offset.left += td[0].offsetWidth;
                            previewWin.set("xy", [offset.left, offset.top]);
                            previewWin.show();
                        }
                    } else {
                        previewWin.hide();
                    }
                });
                self.addRes(listWrap);
            }

            //webkit 一旦整个可被选择就会导致点击事件没有
            //因为拖放要求mousedown被阻止,ie9 也是奇怪了！
            if (!UA['webkit'] && Editor.Utils.ieEngine != 9) {
                d.set("handlers", [d.get("el")]);
            }
        },
        _removeTrFile: function (tr) {
            var self = this,
                progressBars = self.progressBars,
                fid = tr.attr("fid"),
                uploader = self.uploader;
            if (fid) {
                try {
                    uploader['removeFile'](fid);
                } catch (e) {
                }
            }
            if (progressBars[fid]) {
                progressBars[fid].destroy();
                delete progressBars[fid];
            }
            tr.remove();
            self.denable();
            self._syncStatus();
        },

        _realShow: function () {
            this.dialog.center();
            this.dialog.show();
        },
        show: function () {
            this._prepareShow();
        },
        _uploadError: function (ev) {
            var self = this,
                prefixCls = self.editor.get('prefixCls'),
                progressBars = self.progressBars,
                uploader = self.uploader,
                id = ev.id || (ev['file'] && ev['file'].id);
            if (!id) {
                S.log(ev);
                return;
            }
            var tr = self._getFileTr(id),
                bar = progressBars[id],
                status = ev.status;

            uploader['removeFile'](id);
            if (!ev._custom) {
                S.log(status);
                status = "服务器出错或格式不正确";
            }
            if (tr) {
                bar && bar.destroy();
                delete progressBars[id];
                tr.one(replacePrefix(".{prefixCls}editor-upload-progress", prefixCls)).html("<div " +
                    "style='color:red;'>" +
                    status +
                    "</div>");
            }
        },
        _getFileTr: function (id) {
            var self = this,
                list = self._list,
                trs = list.all("tr");
            for (var i = 0; i < trs.length; i++) {
                var tr = $(trs[i]);
                if (tr.attr("fid") == id) {
                    return tr;
                }
            }
        },
        _onUploadStart: function (ev) {
            var self = this,
                id = ev.id || (ev['file'] && ev['file'].id);
            var tr = this._getFileTr(id);
            var prefixCls = self.editor.get('prefixCls');
            tr[0].className = replacePrefix("{prefixCls}editor-upload-uploading", prefixCls);
        },
        _onUploadCompleteData: function (ev) {
            var self = this,
                uploader = self.uploader,
                prefixCls = self.editor.get('prefixCls'),
                data = S.trim(ev.data).replace(/\r|\n/g, ""),
                id = ev['file'].id;
            //S.log(data);

            //成功后不会自动清除列表，自己清除
            if (id) {
                try {
                    uploader['removeFile'](id);
                } catch (e) {
                }
            }

            if (!data) return;
            try {
                data = JSON.parse(data);
            } catch (ex) {
                S.log("multiUpload _onUploadCompleteData error :");
                S.log(ex);
                throw ex;
            }
            if (data.error) {
                self._uploadError({
                    id: id,
                    _custom: 1,
                    status: data.error
                });
                return;
            }
            var tr = self._getFileTr(id);
            if (tr) {
                tr.one(replacePrefix(".{prefixCls}editor-upload-insert", prefixCls)).show();
                self._tagComplete(tr, data['imgUrl']);
            }

            self._syncStatus();

        },
        _onProgress: function (ev) {
            var fid = ev['file'].id,
                progressBars = this.progressBars,
                progess = Math.floor(ev['bytesLoaded'] * 100 / ev['bytesTotal']),
                bar = progressBars[fid];
            bar && bar.set("progress", progess);

        },
        ddisable: function () {
            var self = this;
            var prefixCls = self.editor.get('prefixCls');
            self.uploader['lock']();
            self.btn.addClass(replacePrefix("{prefixCls}editor-button-disabled", prefixCls), undefined);
            self.flashPos.offset({
                left: -9999,
                top: -9999
            });
        },
        denable: function () {
            var self = this;
            var prefixCls = self.editor.get('prefixCls');
            self.uploader['unlock']();
            self.btn.removeClass(replacePrefix("{prefixCls}editor-button-disabled", prefixCls), undefined);
            self.flashPos.offset(self.btn.offset());
        },
        _syncStatus: function () {
            var self = this,
                list = self._list,
                seq = 1,
                trs = list.all("tr");
            var prefixCls = self.editor.get('prefixCls');
            if (trs.length == 0) {
                self._listWrap.hide();
            } else {
                list.all(replacePrefix(".{prefixCls}editor-upload-seq", prefixCls)).each(function (n) {
                    n.html(seq++);
                });
                var wait = 0;
                for (var i = 0; i < trs.length; i++) {
                    var tr = $(trs[i]);
                    if (!tr.attr("url")) wait++;
                }
                self.statusText.html("队列中剩余" + wait + "张图片"
                    + "，点击确定上传，开始上传。 "
                );
            }
            //当前已上传的文件同步到本地
            self._save();
        },
        //当前已上传的图片保存下来
        _restore: function () {
            var self = this,
                data = localStorage.getItem(KEY),
                tbl = self._list[0];
            if (!data) return;
            data = JSON.parse(S.urlDecode(data));
            for (var i = 0; i < data.length; i++) {
                var d = data[i];
                d.complete = 1;
                d.fid = "restore_" + i;
                var r = self._createFileTr(tbl, d);
                self._tagComplete(r, d.url);
            }
            if (d) {
                self._listWrap.show();
                self._syncStatus();
            }
        },
        _tagComplete: function (tr, url) {
            var self = this;
            var prefixCls = self.editor.get('prefixCls');
            tr.attr("url", url);
            tr[0].className = replacePrefix("{prefixCls}editor-upload-complete", prefixCls);
        },
        _save: function () {
            var self = this,
                list = self._list,
                trs = list.all("tr"),
                data = [];
            var prefixCls = self.editor.get('prefixCls');
            for (var i = 0; i < trs.length; i++) {
                var tr = $(trs[i]),
                    url = tr.attr("url");
                if (url) {
                    var size = tr.one(replacePrefix(".{prefixCls}editor-upload-filesize", prefixCls)).html(),
                        name = tr.one(replacePrefix(".{prefixCls}editor-upload-filename", prefixCls)).text();
                    data.push({
                        name: name,
                        size: size,
                        url: url
                    });
                }
            }

            localStorage.setItem(KEY, encodeURIComponent(JSON.stringify(data)));

        },
        _getFilesSize: function (files) {
            var n = 0;
            for (var i in files) {

                n++;
            }
            return n;
        },
        _createFileTr: function (tbl, f) {

            /*
             chrome not work !
             kissy bug?
             var row = $("<tr fid='" + id + "'>"
             + "<td class='{prefixCls}editor-upload-seq'>"
             + "</td>"
             + "<td>"
             + f.name
             + "</td>"
             + "<td>"
             + size
             + "k</td>" +
             "<td class='{prefixCls}editor-upload-progress'>" +
             "</td>" +
             "<td>" +
             "<a href='#' " +
             "class='{prefixCls}editor-upload-insert' " +
             "style='display:none'>" +
             "[插入]</a> &nbsp; " +
             "<a href='#' class='{prefixCls}editor-upload-delete'>[删除]</a> &nbsp; "
             +
             "</td>"
             + "</tr>").appendTo(list);
             */


            var self = this,
                editor = self.editor,
                progressBars = self.progressBars,
                id = f.fid,
                row = tbl.insertRow(-1);
            var prefixCls = self.editor.get('prefixCls');
            DOM.attr(row, "fid", id);
            var cell = row.insertCell(-1);
            DOM.attr(cell, "class", replacePrefix('{prefixCls}editor-upload-seq', prefixCls));
            cell = row.insertCell(-1);
            if (f.name.length > 18) {
                f.name = f.name.substring(0, 18) + "...";
            }
            DOM.html(cell, "<div style='width:160px;overflow:hidden;'><div style='width:9999px;text-align:left;'>" + f.name + "</div></div>");
            DOM.attr(cell, "class", replacePrefix('{prefixCls}editor-upload-filename', prefixCls));
            cell = row.insertCell(-1);
            DOM.html(cell, f.size);
            DOM.attr(cell, "class", replacePrefix('{prefixCls}editor-upload-filesize', prefixCls));
            cell = row.insertCell(-1);
            DOM.attr(cell, "class", replacePrefix('{prefixCls}editor-upload-progress', prefixCls));
            cell = row.insertCell(-1);
            DOM.html(cell, replacePrefix("<a class='{prefixCls}editor-upload-moveup' href='#'>[上移]</a> &nbsp; " +
                "<a class='{prefixCls}editor-upload-movedown' href='#'>[下移]</a> &nbsp; " +
                "<a href='#' class='{prefixCls}editor-upload-insert' style='" +
                (f.complete ? "" : "display:none;") +
                "' " +

                ">" +
                "[插入]</a> &nbsp; " +
                "<a href='#' class='{prefixCls}editor-upload-delete'>" +
                "[删除]" +
                "</a> &nbsp;", prefixCls));

            var rowNode = $(row);

            if (parseInt(f.size) > self._sizeLimit) {
                self._uploadError({
                    id: id,
                    _custom: 1,
                    status: PIC_SIZE_LIMIT_WARNING
                        .replace(/n/, self._sizeLimit / 1000)
                });
                self.uploader['removeFile'](id);

            } else {
                progressBars[id] = new ProgressBar({
                    container: rowNode.one(replacePrefix(".{prefixCls}editor-upload-progress", prefixCls)),
                    width: "100px",
                    height: "15px",
                    prefixCls: editor.get('prefixCls')
                });
                if (f.complete) {
                    progressBars[id].set("progress", 100);
                }
            }

            return rowNode;
        },
        _onSelect: function (ev) {
            var self = this,
                uploader = self.uploader,
                list = self._list,
                curNum = 0,
            //当前队列的所有文件，连续选择的话累计！！！
                files = ev['fileList'],
                available = self._numberLimit, i;

            if (files) {
                //去除已经 ui 显示出来的
                var trs = list.children("tr");
                for (i = 0; i < trs.length; i++) {
                    var tr = trs[i], fid = DOM.attr(tr, "fid");
                    fid && files[fid] && (delete files[fid]);
                }
                //限额-目前ui的
                available = self._numberLimit - trs.length;

                var l = self._getFilesSize(files);

                if (l > available) {
                    alert(PIC_NUM_LIMIT_WARNING.replace(/n/, self._numberLimit));
                }

                if (l >= available) {
                    self.ddisable();
                }

                self._listWrap.show();
                var tbl = self._list[0];
                //files 是这次新选择的啦！
                //新选择的随即删除一些
                for (i in files) {

                    curNum++;
                    var f = files[i],
                        size = Math.floor(f.size / 1000),
                        id = f.id;

                    if (curNum > available) {

                        uploader['removeFile'](id);
                        continue;
                    }
                    self._createFileTr(tbl, {
                        size: size + "k",
                        fid: id,
                        name: f.name
                    });
                }
                self._syncStatus();
            }
        },

        _ready: function () {
            var self = this,
                uploader = self.uploader,
                up = self.up,
                btn = self.btn,
                flashPos = self.flashPos,
                normParams = Editor.Utils.normParams;
            var prefixCls = self.editor.get('prefixCls');
            if ("ready" != uploader['getReady']()) {
                self.tipSpan.html("您的浏览器不支持该功能，" +
                    "请升级当前浏览器，" +
                    "并同时 <a href='http://get.adobe.com/cn/flashplayer/'" +
                    " target='_blank'>点此升级</a> flash 插件");
                flashPos.offset({
                    left: -9999,
                    top: -9999
                });
                return;
            }
            btn.removeClass(replacePrefix("{prefixCls}editor-button-disabled", prefixCls), undefined);
            flashPos.offset(btn.offset());
            uploader['setAllowMultipleFiles'](true);
            uploader['setFileFilters']([
                {
                    ext: "*.jpeg;*.jpg;*.png;*.gif",
                    "desc": "图片文件( png,jpg,jpeg,gif )"
                }
            ]);
            up.detach();
            up.on("click", function (ev) {
                uploader['uploadAll'](self._ds,
                    "POST",
                    normParams(self._dsp),
                    self._fileInput);
                ev.halt();
            });
            self.addRes(up);
        }
    });

    return MultiUploadDialog;
}, {
    requires: ['editor',
        'component/plugin/drag',
        '../progressbar/',
        '../overlay/',
        '../flash-bridge/',
        '../local-storage/',
        'swf']
});