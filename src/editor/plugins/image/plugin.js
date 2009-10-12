
KISSY.Editor.add("plugins~image", function(E) {

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Connect = Y.Connect, Lang = YAHOO.lang,
        isIE = YAHOO.env.ua.ie,
        TYPE = E.PLUGIN_TYPE,

        DIALOG_CLS = "ks-editor-image",
        BTN_OK_CLS = "ks-editor-btn-ok",
        BTN_CANCEL_CLS = "ks-editor-btn-cancel",
        TAB_CLS = "ks-editor-image-tabs",
        TAB_CONTENT_CLS = "ks-editor-image-tab-content",
        UPLOADING_CLS = "ks-editor-image-uploading",
        ACTIONS_CLS = "ks-editor-dialog-actions",
        NO_TAB_CLS = "ks-editor-image-no-tab",
        SELECTED_TAB_CLS = "ks-editor-image-tab-selected",

        TABS_TMPL = { local: '<li rel="local" class="' + SELECTED_TAB_CLS  + '">{tab_local}</li>',
                      link: '<li rel="link">{tab_link}</li>',
                      album: '<li rel="album">{tab_album}</li>'
                    },

        DIALOG_TMPL = ['<form action="javascript: void(0)">',
                          '<ul class="', TAB_CLS ,' ks-clearfix">',
                          '</ul>',
                          '<div class="', TAB_CONTENT_CLS, '" rel="local" style="display: none">',
                              '<label>{label_local}</label>',
                              '<input type="file" size="40" name="imgFile" />',
                              '{local_extraCode}',
                          '</div>',
                          '<div class="', TAB_CONTENT_CLS, '" rel="link">',
                              '<label>{label_link}</label>',
                              '<input name="imgUrl" size="50" />',
                          '</div>',
                          '<div class="', TAB_CONTENT_CLS, '" rel="album" style="display: none">',
                              '<label>{label_album}</label>',
                              '<p style="width: 300px">尚未实现...</p>', // TODO: 从相册中选择图片
                          '</div>',
                          '<div class="', UPLOADING_CLS, '" style="display: none">',
                              '<p style="width: 300px">{uploading}</p>',
                          '</div>',
                          '<div class="', ACTIONS_CLS ,'">',
                              '<button name="ok" class="', BTN_OK_CLS, '">{ok}</button>',
                              '<span class="', BTN_CANCEL_CLS ,'">{cancel}</span>',
                          '</div>',
                      '</form>'].join(""),

        defaultConfig = {
            tabs: ["link"],
            upload: {
                actionUrl: "",
                filter: "*",
                filterMsg: "",
                enableXdr: false,
                connectionSwf: "http://a.tbcdn.cn/yui/2.8.0r4/build/connection/connection.swf",
                formatResponse: function(data) { return data; },
                extraCode: ""
            }
        };

    E.addPlugin("image", {
        /**
         * 种类：普通按钮
         */
        type: TYPE.TOOLBAR_BUTTON,

        /**
         * 配置项
         */
        config: {},

        /**
         * 关联的对话框
         */
        dialog: null,

        /**
         * 关联的表单
         */
        form: null,

        /**
         * 关联的 range 对象
         */
        range: null,

        currentTab: null,
        currentPanel: null,
        uploadingPanel: null,
        actionsBar: null,

        /**
         * 初始化函数
         */
        init: function() {
            var pluginConfig = this.editor.config.pluginsConfig[this.name] || {};
            this.config = Lang.merge(defaultConfig, pluginConfig);
            this.config.upload = Lang.merge(defaultConfig.upload, pluginConfig.upload || {});

            this._renderUI();
            this._bindUI();

            this.actionsBar = Dom.getElementsByClassName(ACTIONS_CLS, "div", this.dialog)[0];
            this.uploadingPanel = Dom.getElementsByClassName(UPLOADING_CLS, "div", this.dialog)[0];
            this.config.upload.enableXdr && this._initXdrUpload();
        },

        /**
         * 初始化对话框界面
         */
        _renderUI: function() {
            var dialog = E.Menu.generateDropMenu(this.editor, this.domEl, [1, 0]),
                lang = this.lang;

            // 添加自定义项
            lang["local_extraCode"] = this.config.upload.extraCode;

            dialog.className += " " + DIALOG_CLS;
            dialog.innerHTML = DIALOG_TMPL.replace(/\{([^}]+)\}/g, function(match, key) {
                return lang[key] ? lang[key] : key;
            });

            this.dialog = dialog;
            this.form = dialog.getElementsByTagName("form")[0];
            if(isIE) E.Dom.setItemUnselectable(dialog);

            this._renderTabs();
        },

        _renderTabs: function() {
            var lang = this.lang, self = this,
                ul = Dom.getElementsByClassName(TAB_CLS, "ul", this.dialog)[0],
                panels = Dom.getElementsByClassName(TAB_CONTENT_CLS, "div", this.dialog);

            // 根据配置添加 tabs
            var keys = this.config["tabs"], html = "";
            for(var k = 0, l = keys.length; k < l; k++) {
                html += TABS_TMPL[keys[k]];
            }

            // 文案
            ul.innerHTML = html.replace(/\{([^}]+)\}/g, function(match, key) {
                return lang[key] ? lang[key] : key;
            });

            // 只有一个 tabs 时不显示
            var tabs = ul.childNodes, len = panels.length;
            if(tabs.length === 1) {
                Dom.addClass(this.dialog, NO_TAB_CLS);
            }

            // 切换
            switchTab(tabs[0]); // 默认选中第一个Tab
            Event.on(tabs, "click", function() {
                switchTab(this);
            });

            function switchTab(trigger) {
                var j = 0, rel = trigger.getAttribute("rel");
                for (var i = 0; i < len; i++) {
                    if(tabs[i]) Dom.removeClass(tabs[i], SELECTED_TAB_CLS);
                    panels[i].style.display = "none";

                    if (panels[i].getAttribute("rel") == rel) {
                        j = i;
                    }
                }

                Dom.addClass(trigger, SELECTED_TAB_CLS);
                panels[j].style.display = "";

                self.currentTab = trigger.getAttribute("rel");
                self.currentPanel = panels[j];
            }
        },

        /**
         * 绑定事件
         */
        _bindUI: function() {
            var self = this;

            // 显示/隐藏对话框时的事件
            Event.on(this.domEl, "click", function() {
                // 仅在显示时更新
                if (self.dialog.style.visibility === isIE ? "hidden" : "visible") { // 事件的触发顺序不同
                    self._syncUI();
                }
            });

            // 注册表单按钮点击事件
            Event.on(this.dialog, "click", function(ev) {
                var target = Event.getTarget(ev),
                    currentTab = self.currentTab;

                switch(target.className) {
                    case BTN_OK_CLS:
                        if(currentTab === "local") {
                            Event.stopPropagation(ev);
                            self._insertLocalImage();
                        } else {
                            self._insertWebImage();
                        }
                        break;
                    case BTN_CANCEL_CLS: // 直接往上冒泡，关闭对话框
                        break;
                    default: // 点击在非按钮处，停止冒泡，保留对话框
                        Event.stopPropagation(ev);
                }
            });
        },

        /**
         * 初始化跨域上传
         */
        _initXdrUpload: function() {
            var tabs = this.config["tabs"];

            for(var i = 0, len = tabs.length; i < len; i++) {
                if(tabs[i] === "local") { // 有上传 tab 时才进行以下操作
                    Connect.transport(this.config.upload.connectionSwf);
                    //Connect.xdrReadyEvent.subscribe(function(){ alert("xdr ready"); });
                    break;
                }
            }
        },

        _insertLocalImage: function() {
            var form = this.form,
                uploadConfig = this.config.upload,
                imgFile = form["imgFile"].value,
                actionUrl = uploadConfig.actionUrl,
                self = this, ext;

            if (imgFile && actionUrl) {

                // 检查文件类型是否正确
                if(uploadConfig.filter !== "*") {
                    ext = imgFile.substring(imgFile.lastIndexOf(".") + 1).toLowerCase();
                    if(uploadConfig.filter.indexOf(ext) == -1) {
                        alert(uploadConfig.filterMsg);
                        self.form.reset();
                        return;
                    }
                }

                // 显示上传滚动条
                this.uploadingPanel.style.display = "";
                this.currentPanel.style.display = "none";
                this.actionsBar.style.display = "none";

                // 发送 XHR
                Connect.setForm(form, true);
                Connect.asyncRequest("post", actionUrl, {
                    upload: function(o) {
                        try {
                            // 标准格式如下：
                            // 成功时，返回 ["0", "图片地址"]
                            // 失败时，返回 ["1", "错误信息"]
                            var data = uploadConfig.formatResponse(Lang.JSON.parse(o.responseText));
                            if (data[0] == "0") {
                                self._insertImage(data[1]);
                                self._hideDialog();
                            } else {
                                self._onUploadError(data[1]);
                            }
                        }
                        catch(ex) {
                            self._onUploadError(
                                    Lang.dump(ex) +
                                    "\no = " + Lang.dump(o) +
                                    "\n[from upload catch code]");
                        }
                    },
                    xdr: uploadConfig.enableXdr
                });
            } else {
                self._hideDialog();
            }
        },

        _onUploadError: function(msg) {
            alert(this.lang["upload_error"] + "\n\n" + msg);
            this._hideDialog();

            // 测试了以下错误类型：
            //   - json parse 异常，包括 actionUrl 不存在、未登录、跨域等各种因素
            //   - 服务器端返回错误信息 ["1", "error msg"]
        },

        _insertWebImage: function() {
            var imgUrl = this.form["imgUrl"].value;
            imgUrl && this._insertImage(imgUrl);
        },

        /**
         * 隐藏对话框
         */
        _hideDialog: function() {
            var activeDropMenu = this.editor.activeDropMenu;
            if(activeDropMenu && Dom.isAncestor(activeDropMenu, this.dialog)) {
                E.Menu.hideActiveDropMenu(this.editor);
            }
        },

        /**
         * 更新界面上的表单值
         */
        _syncUI: function() {
            this.range = this.editor.getSelectionRange(); // 保存 range

            // reset
            this.form.reset();

            // restore
            this.uploadingPanel.style.display = "none";
            this.currentPanel.style.display = "";
            this.actionsBar.style.display = "";
        },

        /**
         * 插入图片
         */
        _insertImage: function(imgUrl) {
            imgUrl = Lang.trim(imgUrl);

            // url 为空时，不处理
            if (imgUrl.length === 0) {
                return;
            }

            var editor = this.editor,
                range = this.range,
                img;

            // 插入图片
            if (!isIE) {
                img = document.createElement("img");
                img.src = imgUrl;
                img.setAttribute("title", "");
                range.insertNode(img);
            } else {
                range.select();
                editor.execCommand("insertImage", imgUrl);
            }
        }
    });

 });

/**
 * TODO:
 *   - 跨域支持
 */
