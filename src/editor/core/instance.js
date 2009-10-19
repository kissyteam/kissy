
KISSY.Editor.add("core~instance", function(E) {

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang,
        UA = YAHOO.env.ua,
        isIE = UA.ie,
        EDITOR_CLASSNAME = "ks-editor",

        EDITOR_TMPL  =  '<div class="ks-editor-toolbar"></div>' +
                        '<div class="ks-editor-content"><iframe frameborder="0" allowtransparency="1"></iframe></div>' +
                        '<div class="ks-editor-statusbar"></div>',

        CONTENT_TMPL =  '<!DOCTYPE html>' +
                        '<html>' +
                        '<head>' +
                        '<title>Rich Text Area</title>' +
                        '<meta http-equiv="content-type" content="text/html; charset=gb18030" />' +
                        '<link type="text/css" href="{CONTENT_CSS}" rel="stylesheet" />' +
                        '</head>' +
                        '<body spellcheck="false" class="ks-editor-post">{CONTENT}</body>' +
                        '</html>',

        THEMES_DIR = "themes";

    /**
     * 编辑器的实例类
     */
    E.Instance = function(textarea, config) {
        /**
         * 相关联的 textarea 元素
         */
        this.textarea = Dom.get(textarea);

        /**
         * 配置项
         */
        this.config = Lang.merge(E.config, config || {});

        /**
         * 以下在 renderUI 中赋值
         * @property container
         * @property contentWin
         * @property contentDoc
         * @property statusbar
         */

        /**
         * 与该实例相关的插件
         */
        //this.plugins = [];

        /**
         * 是否处于源码编辑状态
         */
        this.sourceMode = false;

        /**
         * 工具栏
         */
        this.toolbar = new E.Toolbar(this);

        /**
         * 状态栏
         */
        this.statusbar = new E.Statusbar(this);

        // init
        this._init();
    };

    Lang.augmentObject(E.Instance.prototype, {
        /**
         * 初始化方法
         */
        _init: function() {
            this._renderUI();
            this._initPlugins();
            this.config.autoFocus && this._focusToEnd();
        },

        _renderUI: function() {
            this._renderContainer();
            this._setupContentPanel();
        },

        /**
         * 初始化所有插件
         */
        _initPlugins: function() {
            var key, p,
                staticPlugins = E.plugins,
                plugins = [];

            // 每个实例，拥有一份自己的 plugins 列表
            for(key in staticPlugins) {
                plugins[key] = staticPlugins[key];
            }
            this.plugins = plugins;

            // 工具栏上的插件
            this.toolbar.init();

            // 状态栏上的插件
            this.statusbar.init();
            
            // 其它插件
            for(key in plugins) {
                p = plugins[key];
                if(p.inited) continue;

                p.editor = this; // 给 p 增加 editor 属性
                if(p.init) {
                    p.init();
                }
                p.inited = true;
            }
        },

        /**
         * 生成 DOM 结构
         */
        _renderContainer: function() {
            var textarea = this.textarea,
                region = Dom.getRegion(textarea),
                width = (region.right - region.left - 2) + "px", // YUI 的 getRegion 有 2px 偏差
                height = (region.bottom - region.top - 2) + "px",
                container = document.createElement("div"),
                content, iframe;

            container.className = EDITOR_CLASSNAME;
            container.style.width = width;
            container.innerHTML = EDITOR_TMPL;

            content = container.childNodes[1];
            content.style.width = "100%";
            content.style.height = height;

            iframe = content.childNodes[0];
            iframe.style.width = "100%";
            iframe.style.height = "100%"; // 使得 resize 插件能正常工作
            iframe.setAttribute("frameBorder", 0);

            textarea.style.display = "none";
            Dom.insertBefore(container, textarea);

            this.container = container;
            this.toolbar.domEl = container.childNodes[0];
            this.contentWin = iframe.contentWindow;
            this.contentDoc = iframe.contentWindow.document;
            
            this.statusbar.domEl = container.childNodes[2];

            // TODO 目前是根据 textatea 的宽度来设定 editor 的宽度。可以考虑 config 里指定宽度
        },

        _setupContentPanel: function() {
            var doc = this.contentDoc,
                config = this.config,
                contentCSS = "content" + (config.debug ? "" : "-min") + ".css",
                contentCSSUrl = config.base + THEMES_DIR + "/" + config.theme + "/" + contentCSS,
                self = this;

            // 初始化 iframe 的内容
            doc.open();
            doc.write(CONTENT_TMPL
                    .replace("{CONTENT_CSS}", contentCSSUrl)
                    .replace("{CONTENT}", this.textarea.value));
            doc.close();

            if (isIE) {
                // 用 contentEditable 开启，否则 ie 下选区为黑底白字
                doc.body.contentEditable = "true";
            } else {
                // firefox 对 designMode 的支持更好
                doc.designMode = "on";
            }

            // 注1：在 tinymce 里，designMode = "on" 放在 try catch 里。
            //     原因是在 firefox 下，当iframe 在 display: none 的容器里，会导致错误。
            //     但经过我测试，firefox 3+ 以上已无此现象。
            // 注2： ie 用 contentEditable = true.
            //     原因是在 ie 下，IE needs to use contentEditable or it will display non secure items for HTTPS
            // Ref:
            //   - Differences between designMode and contentEditable
            //     http://74.125.153.132/search?q=cache:5LveNs1yHyMJ:nagoon97.wordpress.com/2008/04/20/differences-between-designmode-and-contenteditable/+ie+contentEditable+designMode+different&cd=6&hl=en&ct=clnk

            // 让初始输入文字始终在 p 标签内
            if (Lang.trim(E.Dom.getText(doc.body)).length === 0) {
                if(UA.gecko) {
                    doc.body.innerHTML = '<p><br _moz_editor_bogus_node="TRUE" _moz_dirty=""/></p>';
                } else {
                    doc.body.innerHTML = '<p></p>';
                }
            }

            if(isIE) {
                // 点击的 iframe doc 非 body 区域时，还原焦点位置
                Event.on(doc, "click", function() {
                    if (doc.activeElement.parentNode.nodeType === 9) { // 点击在 doc 上
                        self._focusToEnd();
                    }
                });
            }
        },

        /**
         * 将光标定位到最后一个元素
         */
        _focusToEnd: function() {
            this.contentWin.focus();

            var lastChild = this.contentDoc.body.lastChild,
                range = E.Range.getSelectionRange(this.contentWin);

            if (UA.ie) {
                try { // 有时会报错：编辑器 ie 下，切换源代码，再切换回去，点击编辑器框内，有无效指针的JS错误
                    range.moveToElementText(lastChild);
                } catch(ex) { }
                range.collapse(false);
                range.select();

            } else {
                try {
                    range.setEnd(lastChild, lastChild.childNodes.length);
                } catch(ex) { }
                range.collapse(false);
            }
        },

        /**
         * 获取焦点
         */
        focus: function() {
          this._focusToEnd();
        },

        /**
         * 执行 execCommand
         */
        execCommand: function(commandName, val, styleWithCSS) {
            this.contentWin.focus(); // 还原焦点
            E.Command.exec(this.contentDoc, commandName, val, styleWithCSS);
        },

        /**
         * 获取数据
         */
        getData: function() {
            if(this.sourceMode) {
                return this.textarea.value;
            }
            return this.getContentDocData();
        },

        /**
         * 获取 contentDoc 中的数据
         */
        getContentDocData: function() {
            var bd = this.contentDoc.body,
                data = "", p = E.plugins["save"];

            // Firefox 下，_moz_editor_bogus_node, _moz_dirty 等特有属性
            // 这些特有属性，在用 innerHTML 获取时，自动过滤了

           data = bd.innerHTML;
            if(p && p.filterData) {
                data = p.filterData(data);
            }

            return data;
        },

        /**
         * 获取选中区域的 Range 对象
         */
        getSelectionRange: function() {
            return E.Range.getSelectionRange(this.contentWin);
        }
    });

});

/**
 * NOTES:
 *   - iframe body 的高宽需要和 iframe 一致，否则点击非 body 处，ie 下无法获取焦点
 */