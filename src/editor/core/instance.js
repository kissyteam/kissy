/**
 * module: instance
 */

(function(editor) {
    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang,
        isIE = YAHOO.env.ua.ie,

        EDITOR_CLASSNAME = "kissy-editor",
        EDITOR_TMPL = '<div class="kissy-editor-toolbar"></div><iframe frameborder="0"></iframe><div class="kissy-editor-statusbar"></div>',
        CONTENT_TMPL = '<!DOCTYPE html><html><head><title>Rich Text Area</title><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><link type="text/css" href="{CONTENT_CSS}" rel="stylesheet" /></head><body>{CONTENT}</body></html>',

        LANG_DIR = "lang",
        PLUGINS_DIR = "plugins",
        THEMES_DIR = "themes",
        //EDITOR_CSS = "editor.css", TODO
        CONTENT_CSS =  "content.css";

    /**
     * 编辑器的实例类
     */
    editor.Instance = function(textarea, config) {
        /**
         * 相关联的 textarea 元素
         */
        this.textarea = Dom.get(textarea);

        /**
         * 以下在 renderUI 中赋值
         */
        //this.container
        //this.toolbar
        //this.content
        //this.contentDoc
        //this.statusbar

        /**
         * 配置项
         */
        this.config = Lang.merge(editor.config, config || {});

        // init
        this._init();
    };

    editor.Instance.prototype = {
        /**
         * 初始化方法
         * @protected
         */
        _init: function() {
            this._renderUI();
            this._bindUI();
            this._syncUI();
        },

        _renderUI: function() {
            this._renderContainer();
            this._setupContentPanel();
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
            this.content = iframe;
            this.contentDoc = iframe.contentWindow.document;
            this.statusbar = container.childNodes[2];
        },

        _setupContentPanel: function() {
            var doc = this.contentDoc,
                config = this.config,
                contentCSSUrl = config.base + THEMES_DIR + "/" + config.theme + "/" + CONTENT_CSS;

            // 初始化 iframe 的内容
            doc.open();
            doc.write(CONTENT_TMPL.replace("{CONTENT_CSS}", contentCSSUrl).replace("{CONTENT}", this.textarea.value));
            doc.close();

            // 关闭 firefox 默认打开的 spellcheck
            doc.body.setAttribute("spellcheck", "false");

            doc.designMode = "on";
            // 注1：在 tinymce 里，designMode = "on" 放在 try catch 里。
            //     原因是在 firefox 下，当iframe 在 display: none 的容器里，会导致错误。
            //     但经过我测试，firefox 3+ 以上已无此现象。
            // 注2：在 tinymce 里，还针对 ie 开启了 contentEditable = true.
            //     原因是在 ie 下，IE needs to use contentEditable or it will display non secure items for HTTPS
            //     这个暂时不添加，等以后遇到此问题时再加上。
        },

        _bindUI: function() {

        },

        _syncUI: function() {

        }
    };

})(KISSY.Editor);
