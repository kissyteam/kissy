KISSY.Editor.add("multi-upload/dialog/support", function () {

    var S = KISSY,
        KE = S.Editor,
        UA = S.UA;

    KE.namespace("MultiUpload");

    var DOM = S.DOM,
        JSON = S['JSON'],
        PIC_NUM_LIMIT = 15,
        PIC_NUM_LIMIT_WARNING = "系统将只保留 n 张",
        PIC_SIZE_LIMIT = 1000,
        PIC_SIZE_LIMIT_WARNING = "图片太大，请压缩至 n M以下",
        Node = S.Node,
        Dialog = KE.Dialog,
        KEY = "Multi-Upload-Save",
        movie = KE.Utils.debugUrl("uploader/uploader.longzang.swf"),
        name = "ke-multi-upload",
        FLASH_VERSION_REQUIRED = "10.0.0";

    DOM.addStyleSheet(
        ".ke-upload-btn-wrap {" +
            "position:relative;" +
            "padding:15px 20px 15px 10px;" +
            "zoom:1;" +
            "}" +

            ".ke-upload-list {" +
            "width:100%;" +
            "}" +

            ".ke-upload-list th {" +
            "border-top:1px solid #c1c8d1;" +
            "background-color: #E7E9ED;" +
            "background: -webkit-gradient(linear, left top, left bottom, from(#E7E9ED), to(#F1F4F7));" +
            "background: -moz-linear-gradient(top, #E7E9ED, #F1F4F7);" +
            "}" +

            ".ke-upload-list td,.ke-upload-list th {" +
            "padding:0em;" +
            "height:26px;" +
            "line-height:26px;" +
            "text-align:center;" +
            "border-bottom:1px solid #c1c8d1;" +
            "}" +
            "" +
            "" +
            ".ke-upload-complete .ke-upload-filename {" +
            "text-decoration:underline;" +

            "cursor:pointer;" +
            "}", "ke-MultiUpload");

    function MultiUploadDialog(editor) {
        this.editor = editor;
        this.progressBars = {};
        KE.Utils.lazyRun(this, "_prepareShow", "_realShow");
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
        addRes:KE.Utils.addRes,
        destroy:KE.Utils.destroyRes,
        _prepareShow:function () {
            var self = this,
                editor = self.editor,
                bangpaiCfg = editor.cfg["pluginConfig"]["multi-upload"];

            self.addRes(function () {
                var progressBars = self.progressBars;
                for (var p in progressBars) {
                    if (progressBars.hasOwnProperty(p)) {
                        progressBars[p].destroy();
                    }
                }
            });

            self.dialog = new Dialog({
                headerContent:"批量上传",
                mask:false,
                constrain:false,
                autoRender:true,
                focus4e:false,
                width:"600px"
            });
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

            var bangpaiUploaderHolder = d.get("body"),
                btnHolder = new Node(
                    "<div class='ke-upload-btn-wrap'>" +
                        "<span " +
                        "style='" +
                        "margin:0 15px 0 0px;" +
                        "color:#969696;" +
                        "display:inline-block;" +
                        "vertical-align:middle;" +
                        "width:450px;" +
                        "'></span>" +
                        "</div>").appendTo(bangpaiUploaderHolder),
                listWrap = new Node("<div style='display:none'>")
                    .appendTo(bangpaiUploaderHolder),
                btn = new Node("<a class='ke-button'>浏&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;览</a>")
                    .appendTo(btnHolder),

                listTableWrap = new Node("<div>" +
                    "<table class='ke-upload-list'>" +
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
                    "</div>").appendTo(listWrap),
                list = listTableWrap.one("tbody"),
                upHolder = new Node("<p " +
                    "style='" +
                    "margin:15px 15px 30px 6px;" +
                    "'>" +
                    "<a class='ke-bangpaiupload-delall'" +
                    " style='" +
                    "margin-right:20px;" +
                    "cursor:pointer;" +
                    "margin-left:40px;" +
                    "'>清空列表</a>" +
                    "<a class='ke-button ke-bangpaiupload-ok'>确定上传</a>" +
                    "<a class='ke-button ke-bangpaiupload-insertall'" +
                    " style='margin-left:20px;'>全部插入</a>" +
                    "</p>")
                    .appendTo(listWrap),
                up = upHolder.one(".ke-bangpaiupload-ok"),
                insertAll = upHolder.one(".ke-bangpaiupload-insertall"),
                delAll = upHolder.one(".ke-bangpaiupload-delall"),
                fid = S.guid(name),
                statusText = new Node("<span>")
                    .prependTo(upHolder);


            self._sizeLimit = bangpaiCfg['sizeLimit'] || PIC_SIZE_LIMIT;
            self._numberLimit = bangpaiCfg['numberLimit'] || PIC_NUM_LIMIT;

            var TIP = "允许用户同时上传" +
                self._numberLimit
                + "张图片，单张图片容量不超过" +
                self._sizeLimit / 1000
                + "M";

            if (!UA.fpvGEQ(FLASH_VERSION_REQUIRED)) {
                TIP = "您的flash插件版本过低，该功能不可用，" +
                    "请<a href='http://get.adobe.com/cn/flashplayer/'" +
                    " target='_blank'>点此升级</a>";
            }

            btn.addClass("ke-triplebutton-disabled");
            self.tipSpan = btnHolder.one("span");
            self.tipSpan.html(TIP);
            if (!UA.fpvGEQ(FLASH_VERSION_REQUIRED)) {
                return;
            }
            if (bangpaiCfg['extraHtml']) {
                listTableWrap.append(bangpaiCfg['extraHtml']);
            }

            self._list = list;
            self['_listTable'] = list.parent("table");
            self._listWrap = listWrap;
            self._ds = bangpaiCfg['serverUrl'];
            self._dsp = bangpaiCfg['serverParams'] || {};
            self._fileInput = bangpaiCfg['fileInput'] || "Filedata";
            self.statusText = statusText;
            self.btn = btn;
            self.up = up;


            var bel = btn,
                boffset = bel.offset(),
                fwidth = bel.width() * 2,
                fheight = bel.height() * 1.5,
                flashPos = new Node("<div style='" +
                    ("position:absolute;" +
                        "width:" + fwidth + "px;" +
                        "height:" + fheight + "px;" +
                        "z-index:" + KE.baseZIndex(9999) + ";")
                    + "'>").appendTo(btnHolder);
            //swfready 要求可见
            flashPos.offset(boffset);
            self.flashPos = flashPos;
            var uploader = new KE.FlashBridge({
                movie:movie,
                ajbridge:true,
                methods:[
                    "getReady",
                    //"cancel",
                    "removeFile",
                    "lock",
                    "unlock",
                    "setAllowMultipleFiles",
                    "setFileFilters",
                    "uploadAll"],
                holder:flashPos,
                attrs:{
                    width:fwidth,
                    height:fheight
                },
                params:{
                    wmode:"transparent"
                },
                flashVars:{
                    allowedDomain:location.hostname,
                    btn:true,
                    hand:true
                    //menu:true
                }
            });

            self.uploader = uploader;

            uploader.on("mouseOver", function () {
                bel.addClass("ke-button-hover");
            });
            uploader.on("mouseOut", function () {
                bel.removeClass("ke-button-hover");
            });
            self.addRes(uploader);
            insertAll.on("click", function (ev) {
                var trs = list.all("tr");
                for (var i = 0; i < trs.length; i++) {
                    var tr = new Node(trs[i]),
                        url = tr.attr("url");
                    if (url) {
                        // chrome refer empty in empty src iframe
                        new Image().src = url;
                        editor.insertElement(new Node("<p>&nbsp;<img src='" +
                            url + "'/>&nbsp;</p>", null, editor.document));
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
                    var tr = new Node(trs[i]);
                    self._removeTrFile(tr);
                }
                listWrap.hide();
                ev.halt();
            });
            self.addRes(delAll);

            list.on("click", function (ev) {
                var target = new Node(ev.target), tr;
                ev.halt();
                if (target.hasClass("ke-upload-insert")) {
                    tr = target.parent("tr");
                    var url = tr.attr("url");
                    new Image().src = url;
                    editor.insertElement(new Node("<img src='" +
                        url + "'/>", null, editor.document));
                }
                if (
                    target.hasClass("ke-upload-delete")
                        ||
                        target.hasClass("ke-upload-insert")
                    ) {
                    tr = target.parent("tr");
                    self._removeTrFile(tr);
                }

                /**
                 * 支持排序
                 */
                if (target.hasClass("ke-upload-moveup")) {
                    tr = target.parent("tr");
                    tr.css("backgroundColor", "#eef4f9");
                    tr['animate']({
                        backgroundColor:"#FBFBFB"
                    }, 1, null, function () {
                        tr.css("backgroundColor", "");
                    });

                    var pre = tr.prev();
                    if (pre) {
                        swapNode(tr[0], pre[0]);
                        self._syncStatus();
                    }

                } else if (target.hasClass("ke-upload-movedown")) {
                    tr = target.parent("tr");
                    tr.css("backgroundColor", "#eef4f9");
                    tr['animate']({
                        backgroundColor:"#FBFBFB"
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
            KE.storeReady(function () {
                self._restore();
            });


            //上传后：缩略图预览

            var previewWidth = bangpaiCfg['previewWidth'];
            var previewSuffix = bangpaiCfg['previewSuffix'];
            if (previewWidth) {

                var previewWin = new (S.require("overlay"))({
                    mask:false,
                    autoRender:true,
                    width:previewWidth,
                    render:listWrap
                });
                self.addRes(previewWin);
                var preview = previewWin.get("contentEl");
                preview.css("border", "none");

                var currentFid = 0;
                listWrap.on("mouseover", function (ev) {
                    var t = new Node(ev.target),
                        td = t.parent(".ke-upload-filename");
                    if (td) {
                        var tr = td._4e_ascendant("tr");
                        if (tr.hasClass("ke-upload-complete")) {
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
            if (!UA['webkit'] && KE.Utils.ieEngine != 9) {
                d.set("handlers", [d.get("el")]);
            }
        },
        _removeTrFile:function (tr) {
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
            tr._4e_remove();
            self.denable();
            self._syncStatus();
        },

        _realShow:function () {
            this.dialog.center();
            this.dialog.show();
        },
        show:function () {
            this._prepareShow();
        },
        _uploadError:function (ev) {
            var self = this,
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
                tr.one(".ke-upload-progress").html("<div " +
                    "style='color:red;'>" +
                    status +
                    "</div>");
            }
        },
        _getFileTr:function (id) {
            var self = this,
                list = self._list,
                trs = list.all("tr");
            for (var i = 0; i < trs.length; i++) {
                var tr = new Node(trs[i]);
                if (tr.attr("fid") == id) {
                    return tr;
                }
            }
        },
        _onUploadStart:function (ev) {
            var id = ev.id || (ev['file'] && ev['file'].id);
            var tr = this._getFileTr(id);
            tr[0].className = "ke-upload-uploading";
        },
        _onComplete:function () {

        },
        _onUploadCompleteData:function (ev) {
            var self = this,
                uploader = self.uploader,
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
                S.log("multi-upload _onUploadCompleteData error :");
                S.log(ex);
                throw ex;
            }
            if (data.error) {
                self._uploadError({
                    id:id,
                    _custom:1,
                    status:data.error
                });
                return;
            }
            var tr = self._getFileTr(id);
            if (tr) {
                tr.one(".ke-upload-insert").show();
                self._tagComplete(tr, data['imgUrl']);
            }

            self._syncStatus();

        },
        _onProgress:function (ev) {
            var fid = ev['file'].id,
                progressBars = this.progressBars,
                progess = Math.floor(ev['bytesLoaded'] * 100 / ev['bytesTotal']),
                bar = progressBars[fid];
            bar && bar.set("progress", progess);

        },
        ddisable:function () {
            var self = this;
            self.uploader['lock']();
            self.btn.addClass("ke-triplebutton-disabled");
            self.flashPos.offset({
                left:-9999,
                top:-9999
            });
        },
        denable:function () {
            var self = this;
            self.uploader['unlock']();
            self.btn.removeClass("ke-triplebutton-disabled");
            self.flashPos.offset(self.btn.offset());
        },
        _syncStatus:function () {
            var self = this,
                list = self._list,
                seq = 1,
                trs = list.all("tr");
            if (trs.length == 0) {
                self._listWrap.hide();
            } else {
                list.all(".ke-upload-seq").each(function (n) {
                    n.html(seq++);
                });
                var wait = 0;
                for (var i = 0; i < trs.length; i++) {
                    var tr = new Node(trs[i]);
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
        _restore:function () {
            var self = this,
                store = KE.localStorage,
                data = store.getItem(KEY),
                tbl = self._list[0];
            if (!data) return;
            data = JSON.parse(decodeURIComponent(data));
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
        _tagComplete:function (tr, url) {
            tr.attr("url", url);
            tr[0].className = "ke-upload-complete";
        },
        _save:function () {
            var self = this,
                store = KE.localStorage,
                list = self._list,
                trs = list.all("tr"),
                data = [];
            for (var i = 0; i < trs.length; i++) {
                var tr = new Node(trs[i]),
                    url = tr.attr("url");
                if (url) {
                    var size = tr.one(".ke-upload-filesize").html(),
                        name = tr.one(".ke-upload-filename").text();
                    data.push({
                        name:name,
                        size:size,
                        url:url
                    });
                }
            }
            if (store) {
                store.setItem(KEY, encodeURIComponent(JSON.stringify(data)));
            }
        },
        _getFilesSize:function (files) {
            var n = 0;
            for (var i in files) {
                if (files.hasOwnProperty(i))
                    n++;
            }
            return n;
        },
        _createFileTr:function (tbl, f) {

            /*
             chrome not work !
             kissy bug?
             var row = new Node("<tr fid='" + id + "'>"
             + "<td class='ke-upload-seq'>"
             + "</td>"
             + "<td>"
             + f.name
             + "</td>"
             + "<td>"
             + size
             + "k</td>" +
             "<td class='ke-upload-progress'>" +
             "</td>" +
             "<td>" +
             "<a href='#' " +
             "class='ke-upload-insert' " +
             "style='display:none'>" +
             "[插入]</a> &nbsp; " +
             "<a href='#' class='ke-upload-delete'>[删除]</a> &nbsp; "
             +
             "</td>"
             + "</tr>").appendTo(list);
             */


            var self = this,
                progressBars = self.progressBars,
                id = f.fid,
                row = tbl.insertRow(-1);
            DOM.attr(row, "fid", id);
            var cell = row.insertCell(-1);
            DOM.attr(cell, "class", 'ke-upload-seq');
            cell = row.insertCell(-1);
            if (f.name.length > 18) {
                f.name = f.name.substring(0, 18) + "...";
            }
            DOM.html(cell, "<div style='width:160px;overflow:hidden;'><div style='width:9999px;text-align:left;'>" + f.name + "</div></div>");
            DOM.attr(cell, "class", 'ke-upload-filename');
            cell = row.insertCell(-1);
            DOM.html(cell, f.size);
            DOM.attr(cell, "class", 'ke-upload-filesize');
            cell = row.insertCell(-1);
            DOM.attr(cell, "class", 'ke-upload-progress');
            cell = row.insertCell(-1);
            DOM.html(cell, "" +
                "<a class='ke-upload-moveup' href='#'>[上移]</a> &nbsp; " +
                "<a class='ke-upload-movedown' href='#'>[下移]</a> &nbsp; " +
                "<a href='#' class='ke-upload-insert' style='" +
                (f.complete ? "" : "display:none;") +
                "' " +

                ">" +
                "[插入]</a> &nbsp; " +
                "<a href='#' class='ke-upload-delete'>" +
                "[删除]" +
                "</a> &nbsp;");
            var rowNode = new Node(row);

            var prog = rowNode.one(".ke-upload-progress");
            if (parseInt(f.size) > self._sizeLimit) {
                self._uploadError({
                    id:id,
                    _custom:1,
                    status:PIC_SIZE_LIMIT_WARNING
                        .replace(/n/, self._sizeLimit / 1000)
                });
                self.uploader['removeFile'](id);

            } else {
                progressBars[id] = new KE.ProgressBar({
                    container:rowNode.one(".ke-upload-progress"),
                    width:"100px",
                    height:"15px"
                });
                if (f.complete) {
                    progressBars[id].set("progress", 100);
                }
            }

            return rowNode;
        },
        _onSelect:function (ev) {
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
                    if (!files.hasOwnProperty(i)) continue;
                    curNum++;
                    var f = files[i],
                        size = Math.floor(f.size / 1000),
                        id = f.id;

                    if (curNum > available) {

                        uploader['removeFile'](id);
                        continue;
                    }
                    self._createFileTr(tbl, {
                        size:size + "k",
                        fid:id,
                        name:f.name
                    });
                }
                self._syncStatus();
            }
        },

        _ready:function () {
            var self = this,
                uploader = self.uploader,
                up = self.up,
                btn = self.btn,
                flashPos = self.flashPos,
                normParams = KE.Utils.normParams;
            if ("ready" != uploader['getReady']()) {
                self.tipSpan.html("您的浏览器不支持该功能，" +
                    "请升级当前浏览器，" +
                    "并同时 <a href='http://get.adobe.com/cn/flashplayer/'" +
                    " target='_blank'>点此升级</a> flash 插件");
                flashPos.offset({
                    left:-9999,
                    top:-9999
                });
                return;
            }
            btn.removeClass("ke-triplebutton-disabled");
            flashPos.offset(btn.offset());
            uploader['setAllowMultipleFiles'](true);
            uploader['setFileFilters']([
                {
                    ext:"*.jpeg;*.jpg;*.png;*.gif",
                    desc:"图片文件( png,jpg,jpeg,gif )"
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

    KE['MultiUpload'].Dialog = MultiUploadDialog;
}, {
    attach:false
});