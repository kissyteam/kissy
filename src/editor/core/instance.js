
KISSY.Editor.add("core~instance", function(E) {

    var Y = YAHOO.util, Dom = Y.Dom, Lang = YAHOO.lang,
        EDITOR_CLASSNAME = "kissy-editor",

        EDITOR_TMPL  =  '<div class="kissy-editor-toolbar"></div>' +
                        '<iframe frameborder="0"></iframe>' +
                        '<div class="kissy-editor-statusbar"></div>',

        CONTENT_TMPL =  '<!DOCTYPE html>' +
                        '<html>' +
                        '<head>' +
                        '<title>Rich Text Area</title>' +
                        '<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />' +
                        '<link type="text/css" href="{CONTENT_CSS}" rel="stylesheet" />' +
                        '</head>' +
                        '<body>{CONTENT}</body>' +
                        '</html>',

        THEMES_DIR = "themes",
        //EDITOR_CSS = "editor.css", TODO: 动态加载 editor.css
        CONTENT_CSS =  "content.css";

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
         * @property toolbar
         * @property contentWin
         * @property contentDoc
         * @property statusbar
         */

        // init
        this._init();
    };

    E.Instance.prototype = {
        /**
         * 初始化方法
         */
        _init: function() {
            this._renderUI();
            this._initPlugins();
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
                plugins = E.plugins;

            // 工具栏上的插件
            E.Toolbar.init(this);

            // 其它插件
            for(key in plugins) {
                p = plugins[key];
                if(p.inited) continue;

                if(p.init) {
                    p.init(this);
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
                width = (region.right - region.left) + "px",
                height = (region.bottom - region.top) + "px",
                container = document.createElement("div"),
                iframe;

            container.className = EDITOR_CLASSNAME;
            container.style.width = width;
            container.innerHTML = EDITOR_TMPL;

            iframe = container.childNodes[1];
            iframe.style.width = width;
            iframe.style.height = height;
            iframe.setAttribute("frameBorder", 0);

            textarea.style.display = "none";
            Dom.insertBefore(container, textarea);

            this.container = container;
            this.toolbar = container.childNodes[0];
            this.contentWin = iframe.contentWindow;
            this.contentDoc = iframe.contentWindow.document;
            this.statusbar = container.childNodes[2];

            // TODO 目前是根据 textatea 的宽度来设定 editor 的宽度。可以考虑 config 里指定宽度
        },

        _setupContentPanel: function() {
            var doc = this.contentDoc,
                config = this.config,
                contentCSSUrl = config.base + THEMES_DIR + "/" + config.theme + "/" + CONTENT_CSS;

            // 初始化 iframe 的内容
            doc.open();
            doc.write(CONTENT_TMPL
                    .replace("{CONTENT_CSS}", contentCSSUrl)
                    .replace("{CONTENT}", this.textarea.value));
            doc.close();

            doc.designMode = "on";
            // 注1：在 tinymce 里，designMode = "on" 放在 try catch 里。
            //     原因是在 firefox 下，当iframe 在 display: none 的容器里，会导致错误。
            //     但经过我测试，firefox 3+ 以上已无此现象。
            // 注2：在 tinymce 里，还针对 ie 开启了 contentEditable = true.
            //     原因是在 ie 下，IE needs to use contentEditable or it will display non secure items for HTTPS
            //     这个暂时不添加，等以后遇到此问题时再加上。

            // 关闭 firefox 默认打开的 spellcheck
            //doc.body.setAttribute("spellcheck", "false");

            // TODO 让 ie 下选择背景色为 蓝底白字
        },

        /**
         * 执行 execCommand
         */
        execCommand: function(commandName, val) {
            this.contentWin.focus(); // 还原焦点
            E.Command.exec(this.contentDoc, commandName, val);
        },

        /**
         * 得到数据
         */
        getData: function() {
            var bd = this.contentDoc.body,
                data = '';

            // Firefox 下，_moz_editor_bogus_node, _moz_dirty 等特有属性
            // 这些特有属性，在用 innerHTML 获取时，自动过滤了

            // 只有标签没文本内容时，将内容置为空
            if(E.Dom.getText(bd)) {
               data = bd.innerHTML;
            }

            return data;
        }
    };

});
