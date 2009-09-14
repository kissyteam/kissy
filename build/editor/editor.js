/*
Copyright (c) 2009, Kissy UI Library. All rights reserved.
MIT Licensed.
http://kissy.googlecode.com/

Date: 2009-09-07 22:43:06
Revision: 138
*/
/**
 * KISSY.Editor 富文本编辑器
 *
 * @creator     玉伯<lifesinger@gmail.com>
 * @depends     yahoo-dom-event
 */

var KISSY = window.KISSY || {};

/**
 * @class Editor
 * @constructor
 * @param {string|HTMLElement} textarea
 * @param {object} config
 */
KISSY.Editor = function(textarea, config) {
    var E = KISSY.Editor;

    if (!(this instanceof E)) {
        return new E(textarea, config);
    } else {
        if (!E._isReady) {
            E._setup();
        }
        return new E.Instance(textarea, config);
    }
};

(function(E) {
    var Lang = YAHOO.lang;

    Lang.augmentObject(E, {
        /**
         * 版本号
         */
        version: "0.1",

        /**
         * 语言配置，在 lang 目录添加
         */
        lang: {},

        /**
         * 所有添加的模块
         * 注：mod = { name: modName, fn: initFn, details: {...} }
         */
        mods: {},

        /**
         * 所有注册的插件
         * 注：plugin = { name: pluginName, type: pluginType, init: initFn, ... }
         */
        plugins: {},

        /**
         * 添加模块
         */
        add: function(name, fn, details) {

            this.mods[name] = {
                name: name,
                fn: fn,
                details: details || {}
            };

            return this; // chain support
        },

        /**
         * 添加插件
         * @param {string|Array} name
         */
        addPlugin: function(name, p) {
            var arr = typeof name == "string" ? [name] : name,
                plugins = this.plugins,
                key, i, len;

            for (i = 0,len = arr.length; i < len; ++i) {
                key = arr[i];

                if (!plugins[key]) { // 不允许覆盖
                    plugins[key] = Lang.merge(p, {
                        name: key
                    });
                }
            }
        },

        /**
         * 是否已完成 setup
         */
        _isReady: false,

        /**
         * setup to use
         */
        _setup: function() {
            this._loadModules();
            this._isReady = true;
        },

        /**
         * 已加载的模块
         */
        _attached: {},

        /**
         * 加载注册的所有模块
         */
        _loadModules: function() {
            var mods = this.mods,
                attached = this._attached,
                name, m;

            for (name in mods) {
                m = mods[name];

                if (!attached[name] && m) { // 不允许覆盖
                    attached[name] = m;

                    if (m.fn) {
                        m.fn(this);
                    }
                }

                // 注意：m.details 暂时没用到，仅是预留的扩展接口
            }

            // TODO
            // lang 的加载可以延迟到实例化时，只加载当前 lang
        }
    });

})(KISSY.Editor);

// TODO
// 1. 自动替换页面中的 textarea ? 约定有特殊 class 的不替换

KISSY.Editor.add("config", function(E) {

    E.config = {
        /**
         * 基本路径
         */
        base: "",

        /**
         * 语言
         */
        language: "en",

        /**
         * 主题
         */
        theme: "default",

        /**
         * Toolbar 上功能插件
         */
        toolbar: [
            "source", "undo", "redo",
            "fontName", "fontSize", "bold", "italic", "underline", "strikeThrough", "foreColor", "backColor",
            "",
            "link", "smiley", "image", "blockquote", 
            "",
            "insertOrderedList", "insertUnorderedList", "outdent", "indent", "justifyLeft", "justifyCenter", "justifyRight",
            "",
            "maximize"
        ]
    };

});

KISSY.Editor.add("lang~en", function(E) {

    E.lang["en"] = {

        // Toolbar buttons
        source: {
          text            : "Source",
          title           : "Source"
        },
        undo: {
          text            : "Undo",
          title           : "Undo (Ctrl+Z)"
        },
        redo: {
          text            : "Redo",
          title           : "Redo (Ctrl+Y)"
        },
        fontName: {
          text            : "Font Name",  
          title           : "Font",
          options         : {
              "Default"         : "Arial",
              "Arial"           : "Arial",
              "Times New Roman" : "Times New Roman",
              "Arial Black"     : "Arial Black",
              "Arial Narrow"    : "Arial Narrow",
              "Comic Sans MS"   : "Comic Sans MS",
              "Courier New"     : "Courier New",
              "Garamond"        : "Garamond",
              "Georgia"         : "Georgia",
              "Tahoma"          : "Tahoma",
              "Trebuchet MS"    : "Trebuchet MS",
              "Verdana"         : "Verdana"
          }
        },
        fontSize: {
          text            : "Font Size",  
          title           : "Font size",
          options         : {
              "Default"         : "2",
              "8"               : "1",
              "10"              : "2",
              "12"              : "3",
              "14"              : "4",
              "18"              : "5",
              "24"              : "6",
              "36"              : "7"
          }
        },
        bold: {
            text          : "Bold",
            title         : "Bold (Ctrl+B)"
        },
        italic: {
            text          : "Italic",
            title         : "Italick (Ctrl+I)"
        },
        underline: {
            text          : "Underline",
            title         : "Underline (Ctrl+U)"
        },
        strikeThrough: {
            text          : "Strikeout",
            title         : "Strikeout"
        },
        link: {
            href          : "URL:",
            text          : "Text:",
            target        : "Open link in new window",
            remove        : "Remove link"
        },
        blockquote: {
            text          : "Blockquote",
            title         : "Insert blockquote"
        },
        smiley: {
            text          : "Smiley",
            title         : "Insert smiley"
        },
        image: {
            text          : "Image",
            title         : "Insert or modify image..."
        },
        insertOrderedList: {
            text          : "Numbered List",
            title         : "Numbered List (Ctrl+7)"
        },
        insertUnorderedList: {
            text          : "Bullet List",
            title         : "Bullet List (Ctrl+8)"
        },
        outdent: {
            text          : "Decrease Indent",
            title         : "Decrease Indent"
        },
        indent: {
            text          : "Increase Indent",
            title         : "Increase Indent"
        },
        justifyLeft: {
            text          : "Left Justify",
            title         : "Left Justify (Ctrl+L)"
        },
        justifyCenter: {
            text          : "Center Justify",
            title         : "Center Justify (Ctrl+E)"
        },
        justifyRight: {
            text          : "Right Justify",
            title         : "Right Justify (Ctrl+R)"
        },
        foreColor: {
            text          : "Text Color",
            title         : "Text Color"
        },
        backColor: {
            text          : "Text Background Color",
            title         : "Text Background Color"
        },
        maximize: {
          text            : "Maximize",
          title           : "Maximize"
        },

        // Common messages and labels
        common: {
            ok            : "OK",
            cancel        : "Cancel"
        }
    };

});

KISSY.Editor.add("core~plugin", function(E) {

    /**
     * 插件种类
     */
    E.PLUGIN_TYPE = {
        CUSTOM: 0,
        TOOLBAR_SEPARATOR: 1,
        TOOLBAR_BUTTON: 2,
        TOOLBAR_MENU_BUTTON: 4,
        TOOLBAR_SELECT: 8,
        FUNC: 16 // 纯功能性质插件，无 UI
    };

});

KISSY.Editor.add("core~dom", function(E) {

    var UA = YAHOO.env.ua;

    E.Dom = {

        /**
         * 获取元素的文本内容
         */
        getText: function(el) {
            return el ? (el.textContent || '') : '';
        },

        /**
         * 让元素不可选，解决 ie 下 selection 丢失的问题
         */
        setItemUnselectable: function(el) {
            var arr, i, len, n, a;

            arr = el.getElementsByTagName("*");
            for (i = -1, len = arr.length; i < len; ++i) {
                a = (i == -1) ? el : arr[i];

                n = a.nodeName;
                if (n && n != "INPUT") {
                    a.setAttribute("unselectable", "on");
                }
            }

            return el;
        }
    };

    // for ie
    if (UA.ie) {
        E.Dom.getText = function(el) {
            return el ? (el.innerText || '') : '';
        };
    }

});

KISSY.Editor.add("core~color", function(E) {

    var TO_STRING = "toString",
        PARSE_INT = parseInt,
        RE = RegExp;

    E.Color = {
        KEYWORDS: {
            black: "000",
            silver: "c0c0c0",
            gray: "808080",
            white: "fff",
            maroon: "800000",
            red: "f00",
            purple: "800080",
            fuchsia: "f0f",
            green: "008000",
            lime: "0f0",
            olive: "808000",
            yellow: "ff0",
            navy: "000080",
            blue: "00f",
            teal: "008080",
            aqua: "0ff"
        },

        re_RGB: /^rgb\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\)$/i,
        re_hex: /^#?([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i,
        re_hex3: /([0-9A-F])/gi,

        toRGB: function(val) {
            if (!this.re_RGB.test(val)) {
                val = this.toHex(val);
            }

            if(this.re_hex.exec(val)) {
                val = "rgb(" + [
                    PARSE_INT(RE.$1, 16),
                    PARSE_INT(RE.$2, 16),
                    PARSE_INT(RE.$3, 16)
                ].join(", ") + ")";
            }
            return val;
        },

        toHex: function(val) {
            val = this.KEYWORDS[val] || val;

            if (this.re_RGB.exec(val)) {
                var r = (RE.$1 >> 0)[TO_STRING](16),
                    g = (RE.$2 >> 0)[TO_STRING](16),
                    b = (RE.$3 >> 0)[TO_STRING](16);

                val = [
                    r.length == 1 ? "0" + r : r,
                    g.length == 1 ? "0" + g : g,
                    b.length == 1 ? "0" + b : b
                ].join("");
            }

            if (val.length < 6) {
                val = val.replace(this.re_hex3, "$1$1");
            }

            if (val !== "transparent" && val.indexOf("#") < 0) {
                val = "#" + val;
            }

            return val.toLowerCase();
        }
    };

});

KISSY.Editor.add("core~command", function(E) {

    var ua = YAHOO.env.ua,

        CUSTOM_COMMANDS = {
            backColor: ua.gecko ? "hiliteColor" : "backColor"
        },
        TAG_COMMANDS = "bold,italic,underline,strikeThrough",
        STYLE_WITH_CSS = "styleWithCSS",
        EXEC_COMMAND = "execCommand";
    
    E.Command = {

        /**
         * 执行 doc.execCommand
         */
        exec: function(doc, cmdName, val) {
            cmdName = CUSTOM_COMMANDS[cmdName] || cmdName;

            this._preExec(doc, cmdName);
            doc[EXEC_COMMAND](cmdName, false, val);
        },

        _preExec: function(doc, cmdName) {

            // 关闭 gecko 浏览器的 styleWithCSS 特性，使得产生的内容和 ie 一致
            if (ua.gecko) {
                var val = TAG_COMMANDS.indexOf(cmdName) === -1;
                doc[EXEC_COMMAND](STYLE_WITH_CSS, false, val);
            }
        }
    };

});
KISSY.Editor.add("core~range", function(E) {

    E.Range = {

        /**
         * 获取选中区域对象
         */
        getSelectionRange: function(win) {
            var doc = win.document,
                selection, range;

            if (win.getSelection) { // W3C
                selection = win.getSelection();

                if (selection.getRangeAt)
                    range = selection.getRangeAt(0);

                else { // Safari! TODO: 待测试
                    range = doc.createRange();
                    range.setStart(selection.anchorNode, selection.anchorOffset);
                    range.setEnd(selection.focusNode, selection.focusOffset);
                }

            } else if (doc.selection) { // IE
                range = doc.selection.createRange();
            }

            return range;
        },

        /**
         * 获取起始点所在容器
         */
        getStartContainer: function(range) {
            return range.startContainer || range.parentElement();
        },

        /**
         * 获取选中文本
         */
        getSelectedText: function(range) {
            if("text" in range) return range.text;
            return range.toString();
        }
    };

});

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
                        '<meta http-equiv="Content-Type" content="text/html; charset=GBK18030" />' +
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
            this.toolbar.domEl = container.childNodes[0];
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
                data = '', p = E.plugins["save"];

            // Firefox 下，_moz_editor_bogus_node, _moz_dirty 等特有属性
            // 这些特有属性，在用 innerHTML 获取时，自动过滤了

            // 只有标签没文本内容时，保留内容为空
            if(E.Dom.getText(bd)) {
               data = bd.innerHTML;

                if(p && p.filterData) {
                    data = p.filterData(data);
                }
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

KISSY.Editor.add("core~toolbar", function(E) {

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang,
        isIE = YAHOO.env.ua.ie,
        TYPE = E.PLUGIN_TYPE,
        TOOLBAR_SEPARATOR_TMPL = '<div class="kissy-toolbar-separator kissy-inline-block"></div>',

        TOOLBAR_BUTTON_TMPL = '' +
'<div class="kissy-toolbar-button kissy-inline-block" title="{TITLE}">' +
    '<div class="kissy-toolbar-button-outer-box">' +
        '<div class="kissy-toolbar-button-inner-box">' +
            '<span class="kissy-toolbar-item kissy-toolbar-{NAME}">{TEXT}</span>' +
        '</div>' +
    '</div>' +
'</div>',

        TOOLBAR_MENU_BUTTON_TMPL = '' +
'<div class="kissy-toolbar-menu-button-caption kissy-inline-block">' +
    '<span class="kissy-toolbar-item kissy-toolbar-{NAME}">{TEXT}</span>' +
'</div>' +
'<div class="kissy-toolbar-menu-button-dropdown kissy-inline-block"></div>',

        TOOLBAR_MENU_BUTTON = 'kissy-toolbar-menu-button',
        TOOLBAR_SELECT = 'kissy-toolbar-select',
        TOOLBAR_BUTTON_ACTIVE = "kissy-toolbar-button-active",

        div = document.createElement("div"); // 通用 el 容器


    E.Toolbar = function(editor) {

        /**
         * 相关联的编辑器实例
         */
        this.editor = editor;

        /**
         * 相关联的配置
         */
        this.config = editor.config;

        /**
         * 当前语言
         */
        this.lang = E.lang[this.config.language];
    };
    
    Lang.augmentObject(E.Toolbar.prototype, {

        /**
         * 初始化工具条
         */
        init: function() {
            var items = this.config.toolbar,
                plugins = this.editor.plugins,
                key;

            // 遍历配置项，找到相关插件项，并添加到工具栏上
            for (var i = 0, len = items.length; i < len; ++i) {
                key = items[i];
                if (key) {
                    if (!(key in plugins)) continue; // 配置项里有，但加载的插件里无，直接忽略

                    // 添加插件项
                    this._addItem(plugins[key]);

                } else { // 添加分隔线
                    this._addSeparator();
                }
            }
        },

        /**
         * 添加工具栏项
         */
        _addItem: function(p) {
            var el, type = p.type, lang = this.lang;

            // 当 plugin 没有设置 lang 时，采用默认语言配置
            // TODO: 考虑重构到 instance 模块里，因为 lang 仅跟实例相关
            if (!p.lang) p.lang = Lang.merge(lang["common"], this.lang[p.name] || {});

            // 根据模板构建 DOM
            div.innerHTML = TOOLBAR_BUTTON_TMPL
                    .replace("{TITLE}", p.lang.title || "")
                    .replace("{NAME}", p.name)
                    .replace("{TEXT}", p.lang.text || "");

            // 得到 domEl
            p.domEl = el = div.firstChild;

            // 根据插件类型，调整 DOM 结构
            if (type == TYPE.TOOLBAR_MENU_BUTTON || type == TYPE.TOOLBAR_SELECT) {
                // 注：select 是一种特殊的 menu button
                this._renderMenuButton(p);

                if(type == TYPE.TOOLBAR_SELECT) {
                    this._renderSelect(p);
                }
            }

            // 绑定事件
            this._bindItemUI(p);

            // 添加到工具栏
            this._addToToolbar(el);

            // 调用插件自己的初始化函数，这是插件的个性化接口
            // init 放在添加到工具栏后面，可以保证 DOM 操作比如取 region 等操作的正确性
            p.editor = this.editor; // 给 p 增加 editor 属性
            if (p.init) {
                p.init();
            }

            // 标记为已初始化完成
            p.inited = true;
        },

        /**
         * 初始化下拉按钮的 DOM
         */
        _renderMenuButton: function(p) {
            var el = p.domEl,
                innerBox = el.getElementsByTagName("span")[0].parentNode;

            Dom.addClass(el, TOOLBAR_MENU_BUTTON);
            innerBox.innerHTML = TOOLBAR_MENU_BUTTON_TMPL
                    .replace("{NAME}", p.name)
                    .replace("{TEXT}", p.lang.text || "");
        },

        /**
         * 初始化 selectBox 的 DOM
         */
        _renderSelect: function(p) {
            Dom.addClass(p.domEl, TOOLBAR_SELECT);
        },

        /**
         * 给工具栏项绑定事件
         */
        _bindItemUI: function(p) {
            var el = p.domEl;

            // 1. 注册点击时的响应函数
            if (p.exec) {
                Event.on(el, "click", function() {
                    p.exec();
                });
            }

            // 2. 添加鼠标点击时，按钮按下的效果
            Event.on(el, "mousedown", function() {
                Dom.addClass(el, TOOLBAR_BUTTON_ACTIVE);
            });
            Event.on(el, "mouseup", function() {
                Dom.removeClass(el, TOOLBAR_BUTTON_ACTIVE);
            });
            // TODO 完善效果：在鼠标左键按下状态，将鼠标移出和移入按钮时，按钮状态的切换
            // 注：firefox 下，按住左键，将鼠标移出和移入按钮时，不会触发 mouseout. 需要研究下 google 是如何实现的
            Event.on(el, "mouseout", function(e) {
                var toElement = Event.getRelatedTarget(e), isChild;

                try {
                    if (el.contains) {
                        isChild = el.contains(toElement);
                    } else if (el.compareDocumentPosition) {
                        isChild = el.compareDocumentPosition(toElement) & 8;
                    }
                } catch(e) {
                    isChild = false; // 已经移动到 iframe 里
                }
                if (isChild) return;

                Dom.removeClass(el, TOOLBAR_BUTTON_ACTIVE);
            });
        },

        /**
         * 添加分隔线
         */
        _addSeparator: function() {
            div.innerHTML = TOOLBAR_SEPARATOR_TMPL;
            this._addToToolbar(div.firstChild);
        },

        /**
         * 将 item 或 分隔线 添加到工具栏
         */
        _addToToolbar: function(el) {
            if(isIE) el = E.Dom.setItemUnselectable(el);
            this.domEl.appendChild(el);
        }
    });

});

KISSY.Editor.add("core~menu", function(E) {

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event,

        VISIBILITY = "visibility",
        DROP_MENU_CLASS = "kissy-drop-menu";
    
    E.Menu = {

        /**
         * 生成下拉框
         * @param {KISSY.Editor} editor dropMenu 所属的编辑器实例
         * @param {HTMLElement} trigger
         * @param {Array} offset dropMenu 位置的偏移量
         * @return {HTMLElement} dropMenu
         */
        generateDropMenu: function(editor, trigger, offset) {
            var dropMenu = document.createElement("div"),
                 self = this;

            // 生成 DOM
            dropMenu.className = DROP_MENU_CLASS;
            dropMenu.style[VISIBILITY] = "hidden";
            document.body.appendChild(dropMenu);

            // 点击触点时，显示下拉框
            // 注：一个编辑器实例，最多只能有一个激活的下拉框
            Event.on(trigger, "click", function(ev) {
                // 不向上传播，自己控制
                // 否则 document 上监控点击后，会关闭刚打开的 dropMenu
                Event.stopPropagation(ev);

                // 隐藏当前激活的下拉框
                self._hide(editor.activeDropMenu);

                // 打开当前 trigger 的 dropMenu
                if(editor.activeDropMenu != dropMenu) {
                    self._setDropMenuPosition(trigger, dropMenu, offset); // 延迟到显示时调整位置
                    self._show(dropMenu);
                    editor.activeDropMenu = dropMenu;

                } else { // 第二次点击在 trigger 上，关闭 activeDropMenu, 并置为 null. 否则会导致第三次点击打不开
                    editor.activeDropMenu = null;                   
                }
            });

            // document 捕获到点击时，关闭当前激活的下拉框
            Event.on([document, editor.contentDoc], "click", function() {
                self._hide(editor.activeDropMenu);
                editor.activeDropMenu = null;
            });

            // 改变窗口大小时，动态调整位置
            this._initResizeEvent(trigger, dropMenu, offset);

            // 返回
            return dropMenu;
        },

        /**
         * 设置 dropMenu 的位置
         */
        _setDropMenuPosition: function(trigger, dropMenu, offset) {
            var r = Dom.getRegion(trigger),
                left = r.left, top = r.bottom;

            if(offset) {
                left += offset[0];
                top += offset[1];
            }

            dropMenu.style.left = left + "px";
            dropMenu.style.top = top + "px";
        },

        _isVisible: function(el) {
            if(!el) return false;
            return el.style[VISIBILITY] != "hidden";
        },

        _hide: function(el) {
            if(el) {
                el.style[VISIBILITY] = "hidden";
            }
        },

        _show: function(el) {
            if(el) {
                el.style[VISIBILITY] = "visible";
            }
        },

        /**
         * window.onresize 时，重新调整 dropMenu 的位置
         */
        _initResizeEvent: function(trigger, dropMenu, offset) {
            var self = this, resizeTimer;

            Event.on(window, "resize", function() {
                if (resizeTimer) {
                    clearTimeout(resizeTimer);
                }

                resizeTimer = setTimeout(function() {
                    if(self._isVisible(dropMenu)) { // 仅在显示时，需要动态调整
                        self._setDropMenuPosition(trigger, dropMenu, offset);
                    }
                }, 50);
            });
        }
    };

});

KISSY.Editor.add("plugins~base", function(E) {

    var TYPE = E.PLUGIN_TYPE,
        buttons  = "bold,italic,underline,strikeThrough," +
                   "insertOrderedList,insertUnorderedList";

    E.addPlugin(buttons.split(","), {
        /**
         * 种类：普通按钮
         */
        type: TYPE.TOOLBAR_BUTTON,

        /**
         * 响应函数
         */
        exec: function() {
            this.editor.execCommand(this.name);
        }
    });

 });

KISSY.Editor.add("plugins~font", function(E) {

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event,
        isIE = YAHOO.env.ua.ie,
        TYPE = E.PLUGIN_TYPE,

        SELECT_TMPL = '<ul class="kissy-select-list">{LI}</ul>',
        OPTION_TMPL = '<li class="kissy-option" data-value="{VALUE}">' +
                          '<span class="kissy-option-checkbox"></span>' +
                          '<span style="{STYLE}">{KEY}</span>' +
                      '</li>',
        OPTION_SELECTED = "kissy-option-selected",
        DEFAULT = "Default";

    E.addPlugin(["fontName", "fontSize"], {
        /**
         * 种类：菜单按钮
         */
        type: TYPE.TOOLBAR_SELECT,

        /**
         * 当前选中值
         */
        selectedValue: "",

        /**
         * 选择框头部
         */
        selectHead: null,

        /**
         * 关联的下拉选择列表
         */
        selectList: null,

        /**
         * 下拉框里的所有选项值
         */
        options: [],

        /**
         * 初始化
         */
        init: function() {
            var el = this.domEl;

            this.options = this.lang.options;
            this.selectHead = el.getElementsByTagName("span")[0];

            this._initSelectList(el);

            // 选中当前值
            this._setSelectedOption(this.options[DEFAULT]);
        },

        /**
         * 初始化下拉选择框
         */
        _initSelectList: function(trigger) {
            this.selectList = E.Menu.generateDropMenu(this.editor, trigger, [1, 0]);

            // 初始化下拉框 DOM
            this._renderSelectList();

            // 注册选取事件
            this._bindPickEvent();
        },

        /**
         * 初始化下拉框 DOM
         */
        _renderSelectList: function() {
            var htmlCode = "", options = this.options,
                key, val;

            for(key in options) {
                if(key == DEFAULT) continue;
                val = options[key];

                htmlCode += OPTION_TMPL
                        .replace("{VALUE}", val)
                        .replace("{STYLE}", this._getOptionStyle(key, val))
                        .replace("{KEY}", key);
            }

            // 添加到 DOM 中
            this.selectList.innerHTML = SELECT_TMPL.replace("{LI}", htmlCode);

            // 添加个性化 class
            Dom.addClass(this.selectList, "kissy-drop-menu-" + this.name);

            // 针对 ie，设置不可选择
            if (isIE) E.Dom.setItemUnselectable(this.selectList);
        },

        /**
         * 绑定取色事件
         */
        _bindPickEvent: function() {
            var self = this;

            Event.on(this.selectList, "click", function(ev) {
                var target = Event.getTarget(ev), val;

                if(target.nodeName != "LI") {
                    target = Dom.getAncestorByTagName(target, "li");
                }
                if(!target) return;

                val = target.getAttribute("data-value");
                //console.log(val);

                if(val) {
                    // 更新当前值
                    self._setSelectedOption(val);

                    // 执行命令
                    self.editor.execCommand(self.name, self.selectedValue);
                }
            });
        },

        /**
         * 选中某一项
         */
        _setSelectedOption: function(val) {
            this.selectedValue = val;

            // 更新 head
            this.selectHead.innerHTML = this._getOptionKey(val);

            // 更新 selectList 中的选中项
            this._updateSelectedOption(val);
        },

        _getOptionStyle: function(key, val) {
          if(this.name == "fontName") {
              return "font-family:" + val;
          } else { // font size
              return "font-size:" + key + "px";
          }
        },

        _getOptionKey: function(val) {
            var options = this.options, key;

            for(key in options) {
                if(key == DEFAULT) continue;
                
                if(options[key] == val) {
                    return key;
                }
            }
        },

        /**
         * 更新下拉框的选中项
         */
        _updateSelectedOption: function(val) {
            var items = this.selectList.getElementsByTagName("li"),
                i, len = items.length, item;

            for(i = 0; i < len; ++i) {
                item = items[i];

                if(item.getAttribute("data-value") == val) {
                    Dom.addClass(item, OPTION_SELECTED);
                } else {
                    Dom.removeClass(item, OPTION_SELECTED);
                }
            }
        }
    });

});

// TODO
//  1. 仿 google, 对键盘事件的支持

KISSY.Editor.add("plugins~color", function(E) {

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event,
        isIE = YAHOO.env.ua.ie,
        TYPE = E.PLUGIN_TYPE,

        PALETTE_TABLE_TMPL = '<table class="kissy-palette-table"><tbody>{TR}</tbody></table>',
        PALETTE_CELL_TMPL = '<td class="kissy-palette-cell"><div class="kissy-palette-colorswatch" title="{COLOR}" style="background-color:{COLOR}"></div></td>',

        COLOR_GRAY = ["000", "444", "666", "999", "CCC", "EEE", "F3F3F3", "FFF"],
        COLOR_NORMAL = ["F00", "F90", "FF0", "0F0", "0FF", "00F", "90F", "F0F"],
        COLOR_DETAIL = [
                "F4CCCC", "FCE5CD", "FFF2CC", "D9EAD3", "D0E0E3", "CFE2F3", "D9D2E9", "EAD1DC",
                "EA9999", "F9CB9C", "FFE599", "B6D7A8", "A2C4C9", "9FC5E8", "B4A7D6", "D5A6BD",
                "E06666", "F6B26B", "FFD966", "93C47D", "76A5AF", "6FA8DC", "8E7CC3", "C27BAD",
                "CC0000", "E69138", "F1C232", "6AA84F", "45818E", "3D85C6", "674EA7", "A64D79",
                "990000", "B45F06", "BF9000", "38761D", "134F5C", "0B5394", "351C75", "741B47",
                "660000", "783F04", "7F6000", "274E13", "0C343D", "073763", "20124D", "4C1130"
        ],

        PALETTE_CELL_SELECTED = "kissy-palette-cell-selected";

    E.addPlugin(["foreColor", "backColor"], {
        /**
         * 种类：菜单按钮
         */
        type: TYPE.TOOLBAR_MENU_BUTTON,

        /**
         * 当前选取色
         */
        color: "",

        /**
         * 当前颜色指示条
         */
        _indicator: null,

        /**
         * 关联的下拉菜单框
         */
        dropMenu: null,

        /**
         * 初始化
         */
        init: function() {
            var el = this.domEl,
                caption = el.getElementsByTagName("span")[0].parentNode;

            this.color = (this.name == "foreColor") ? "#000000" : "#ffffff";

            Dom.addClass(el, "kissy-toolbar-color-button");
            caption.innerHTML = '<div class="kissy-toolbar-color-button-indicator" style="border-bottom-color:' + this.color + '">'
                               + caption.innerHTML
                               + '</div>';

            this._indicator = caption.firstChild;

            // 有两种方案：
            //  1. 仿照 MS Office 2007, 仅当点击下拉箭头时，才弹出下拉框。点击 caption 时，直接设置颜色。
            //  2. 仿照 Google Docs, 不区分 caption 和 dropdown，让每次点击都弹出下拉框。
            // 从逻辑上讲，方案1不错。但是，考虑 web 页面上，按钮比较小，方案2这样反而能增加易用性。
            // 这里采用方案2
            this._initDropMenu(el);
        },

        /**
         * 初始化下拉菜单
         */
        _initDropMenu: function(trigger) {
            this.dropMenu = E.Menu.generateDropMenu(this.editor, trigger, [1, 0]);

            // 生成下拉框内的内容
            this._generatePalettes();

            // 针对 ie，设置不可选择
            if (isIE) E.Dom.setItemUnselectable(this.dropMenu);

            // 注册点击事件
            this._bindPickEvent();

            // 选中当前色
            this._updateSelectedColor(this.color);

        },

        /**
         * 生成取色板
         */
        _generatePalettes: function() {
            var htmlCode = "";

            // 黑白色板
            htmlCode += this._getPaletteTable(COLOR_GRAY);

            // 常用色板
            htmlCode += this._getPaletteTable(COLOR_NORMAL);

            // 详细色板
            htmlCode += this._getPaletteTable(COLOR_DETAIL);

            // 添加到 DOM 中
            this.dropMenu.innerHTML = htmlCode;
        },

        _getPaletteTable: function(colors) {
            var i, len = colors.length, color,
                trs = "<tr>";

            for(i = 0, len = colors.length; i < len; ++i) {
                if(i != 0 && i % 8 == 0) {
                    trs += "</tr><tr>";
                }

                color = E.Color.toRGB("#" + colors[i]).toUpperCase();
                //console.log("color = " + color);
                trs += PALETTE_CELL_TMPL.replace(/{COLOR}/g, color);
            }
            trs += "</tr>";

            return PALETTE_TABLE_TMPL.replace("{TR}", trs);
        },

        /**
         * 绑定取色事件
         */
        _bindPickEvent: function() {
            var self = this;

            Event.on(this.dropMenu, "click", function(ev) {
                var target = Event.getTarget(ev),
                    attr = target.getAttribute("title");

                if(attr && attr.indexOf("RGB") === 0) {
                    // 更新当前值
                    self.setColor(E.Color.toHex(attr));

                    // 执行命令
                    self.editor.execCommand(self.name, self.color);
                }
            });
        },

        /**
         * 设置颜色
         * @param {string} val 格式 #RRGGBB or #RGB
         */
        setColor: function(val) {
            this.color = val;

            // 更新 indicator
            this._indicator.style.borderBottomColor = val;

            // 更新 dropMenu 里对应的选中项
            this._updateSelectedColor(val);
        },

        /**
         * 更新下拉菜单中选中的颜色
         * @param {string} val 格式 #RRGGBB or #RGB
         */
        _updateSelectedColor: function(val) {
            var i, len, swatch,
                swatches = this.dropMenu.getElementsByTagName("div");

            for(i = 0, len = swatches.length; i < len; ++i) {
                swatch = swatches[i];

                // 获取的 backgroundColor 在不同浏览器下，格式有差异，需要统一转换后再比较
                if(E.Color.toHex(swatch.style.backgroundColor) == val) {
                    Dom.addClass(swatch.parentNode, PALETTE_CELL_SELECTED);
                } else {
                    Dom.removeClass(swatch.parentNode, PALETTE_CELL_SELECTED);
                }
            }
        }
    });

});

// TODO
//  1. 仿 google, 对键盘事件的支持

KISSY.Editor.add("plugins~link", function(E) {

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang,
        isIE = YAHOO.env.ua.ie,
        TYPE = E.PLUGIN_TYPE, Range = E.Range,
        timeStamp = new Date().getTime(),

        DIALOG_CLS = "kissy-link-dialog",
        NEW_LINK_CLS = "kissy-link-dialog-newlink-mode",
        BTN_OK_CLS = "kissy-link-dialog-ok",
        BTN_CANCEL_CLS = "kissy-link-dialog-cancel",
        BTN_REMOVE_CLS = "kissy-link-dialog-remove",
        DEFAULT_HREF = "http://",

        DIALOG_TMPL = ['<form onsubmit="return false"><ul>',
                          '<li class="kissy-link-dialog-href"><label>{href}</label><input name="href" size="40" value="http://" type="text" /></li>',
                          '<li class="kissy-link-dialog-text"><label>{text}</label><input name="text" size="40" type="text" /></li>',
                          '<li class="kissy-link-dialog-target"><input name="target" id="target_"', timeStamp ,' type="checkbox" /> <label for="target_"', timeStamp ,'>{target}</label></li>',
                          '<li class="kissy-link-dialog-actions">',
                              '<button name="ok" class="', BTN_OK_CLS, '">{ok}</button>',
                              '<button name="cancel" class="', BTN_CANCEL_CLS ,'">{cancel}</button>',
                              '<span class="', BTN_REMOVE_CLS ,'">{remove}</span>',
                          '</li>',
                      '</ul></form>'].join("");

    E.addPlugin("link", {
        /**
         * 种类：普通按钮
         */
        type: TYPE.TOOLBAR_BUTTON,

        /**
         * 关联的对话框
         */
        dialog: null,

        /**
         * 关联的表单
         */
        form: null,

        /**
         * 初始化函数
         */
        init: function() {
            this._renderUI();
            this._bindUI();
        },

        /**
         * 初始化对话框界面
         */
        _renderUI: function() {
            var dialog = E.Menu.generateDropMenu(this.editor, this.domEl, [1, 0]),
                lang = this.lang;

            dialog.className += " " + DIALOG_CLS;
            dialog.innerHTML = DIALOG_TMPL.replace(/\{([^}]+)\}/g, function(match, key) {
                return lang[key] ? lang[key] : key;
            });

            this.dialog = dialog;
            this.form = dialog.getElementsByTagName("form")[0];
        },

        /**
         * 绑定事件
         */
        _bindUI: function() {
            var form = this.form, self = this;

            // 显示/隐藏对话框时的事件
            Event.on(this.domEl, "click", function() {
                // TODO：仅在显示时更新
                self._syncUI();
            });

            // 注册表单按钮点击事件
            Event.on(this.dialog, "click", function(ev) {
                var target = Event.getTarget(ev);

                switch(target.className) {
                    case BTN_OK_CLS:
                        self._createLink(form.href.value, form.text.value, form.target.checked);
                        break;
                    case BTN_CANCEL_CLS: // 直接往上冒泡，关闭对话框
                        break;
                    case BTN_REMOVE_CLS:
                        self._unLink();
                        break;
                    default: // 点击在非按钮处，停止冒泡，保留对话框
                        Event.stopPropagation(ev);
                }
            });
        },

        /**
         * 更新界面上的表单值
         */
        _syncUI: function() {
            var editor = this.editor,
                form = this.form,
                range = editor.getSelectionRange(),
                container = Range.getStartContainer(range),
                parentEl;

            // 修改链接
            if (container.nodeType == 3) { // TextNode
                parentEl = container.parentNode;
                if (parentEl.nodeName == "A") {
                    form.href.value = parentEl.href;
                    form.text.value = E.Dom.getText(parentEl);
                    form.target.checked = parentEl.target === "_blank";
                    Dom.removeClass(form, NEW_LINK_CLS);
                    return;
                }
            }

            // 新建链接
            form.href.value = DEFAULT_HREF;
            form.text.value = Range.getSelectedText(range);
            Dom.addClass(form, NEW_LINK_CLS);
        },

        /**
         * 创建/修改链接
         */
        _createLink: function(href, text, target) {
            // href 为空时，移除链接。 TODO: 自动添加 http 等细节操作的完善
            if (href.length < 7) {
                this._unLink();
                return;
            }

            // text 为空时，自动设为 href 的值
            if (!text) text = href;

            var editor = this.editor,
                range = editor.getSelectionRange(),
                container = Range.getStartContainer(range),
                parentEl;

            // 修改链接
            if (container.nodeType == 3) { // TextNode
                parentEl = container.parentNode;
                if (parentEl.nodeName == "A") {
                    parentEl.href = href;
                    parentEl.innerHTML = text;
                    if (target) {
                        parentEl.setAttribute("target", "_blank");
                    } else {
                        parentEl.removeAttribute("target");
                    }
                    return;
                }
            }

            // 创建链接
            var selectedText = Range.getSelectedText(range);
            if (!selectedText) {
                if (!isIE) {
                    var a = document.createElement("A");
                    a.innerHTML = text;
                    range.insertNode(a);
                } else {
                    range.pasteHTML('<a href="' + href + '">' + text + '</a>');
                }
            }
            editor.execCommand("createLink", href);
        },

        _unLink: function() {
            this.editor.execCommand("unLink");
        }
    });

 });

// TODO:
// 当选区包含链接/一部分包含链接时，生成的链接内容的调优处理。
// 目前只有 Google Docs 做了优化，其它编辑器都采用浏览器默认的处理方式。
// 先记于此，等以后优化。
KISSY.Editor.add("plugins~blockquote", function(E) {

    var TYPE = E.PLUGIN_TYPE;

    E.addPlugin("blockquote", {
        /**
         * 种类：普通按钮
         */
        type: TYPE.TOOLBAR_BUTTON,

        /**
         * 响应函数
         */
        exec: function() {
            alert("todo");
        }
    });

 });

KISSY.Editor.add("plugins~image", function(E) {

    var TYPE = E.PLUGIN_TYPE;

    E.addPlugin("image", {
        /**
         * 种类：普通按钮
         */
        type: TYPE.TOOLBAR_BUTTON,

        /**
         * 响应函数
         */
        exec: function() {
            alert("todo");
        }
    });

 });

KISSY.Editor.add("plugins~smiley", function(E) {

    var TYPE = E.PLUGIN_TYPE;

    E.addPlugin("smiley", {
        /**
         * 种类：普通按钮
         */
        type: TYPE.TOOLBAR_BUTTON,

        /**
         * 响应函数
         */
        exec: function() {
            alert("todo");
        }
    });

 });

KISSY.Editor.add("plugins~indent", function(E) {

    var TYPE = E.PLUGIN_TYPE;

    E.addPlugin(["indent", "outdent"], {
        /**
         * 种类：普通按钮
         */
        type: TYPE.TOOLBAR_BUTTON,

        /**
         * 响应函数
         */
        exec: function() {
            this.editor.execCommand(this.name);
        }
    });

 });

// TODO:
//  目前仿 Google Docs，不做特殊处理。在不同浏览器下表现不同。
//  等有时间了，可以考虑仿照 CKEditor 的实现方式。

KISSY.Editor.add("plugins~justify", function(E) {

    var Y = YAHOO.util, Dom = Y.Dom,
        TYPE = E.PLUGIN_TYPE,
        UA = YAHOO.env.ua,

        // Ref: CKEditor - core/dom/elementpath.js
        JUSTIFY_ELEMENTS = {

            /* 结构元素 */
            blockquote:1,
            div:1,
            h1:1,h2:1,h3:1,h4:1,h5:1,h6:1,
            hr:1,
            p:1,

            /* 文本格式元素 */
            address:1,
            center:1,
            pre:1,

            /* 表单元素 */
            form:1,
            fieldset:1,
            caption:1,

            /* 表格元素 */
            table:1,
            tbody:1,
            tr:1, th:1, td:1,

            /* 列表元素 */
            ul:1, ol:1, dl:1,
            dt:1, dd:1, li:1
        },

        plugin = {
            /**
             * 种类：普通按钮
             */
            type: TYPE.TOOLBAR_BUTTON,

            /**
             * 响应函数
             */
            exec: function() {
                this.editor.execCommand(this.name);
            }
        };

    // 注：ie 下，默认使用 align 属性来实现对齐
    // 下面采用自主操作 range 的方式来实现，以保持和其它浏览器一致
    if (UA.ie) {

        plugin.exec = function(editor) {
            var range = editor.getSelectionRange(),
                parentEl, justifyAncestor;

            if(range.parentElement) { // TextRange
                parentEl = range.parentElement();
            } else if(range.item) { // ControlRange
                parentEl = range.item(0);
            } else { // 不做任何处理
                return;
            }

            // 获取可对齐的父元素
            if (isJustifyElement(parentEl)) {
                justifyAncestor = parentEl;
            } else {
                justifyAncestor = getJustifyAncestor(parentEl);
            }

            // 设置 text-align
            if (justifyAncestor) {
                justifyAncestor.style.textAlign = this.name.substring(7).toLowerCase();
            }

            /**
             * 获取可设置对齐的父元素
             */
            function getJustifyAncestor(el) {
                return Dom.getAncestorBy(el, function(arg) {
                    return isJustifyElement(arg);
                });
            }

            /**
             * 判断是否可对齐元素
             */
            function isJustifyElement(el) {
                return JUSTIFY_ELEMENTS[el.nodeName.toLowerCase()];
            }
        };
    }
    
    // 注册插件
    E.addPlugin(["justifyLeft", "justifyCenter", "justifyRight"], plugin);

});

KISSY.Editor.add("plugins~undo", function(E) {

    var TYPE = E.PLUGIN_TYPE;

    E.addPlugin(["undo", "redo"], {
        /**
         * 种类：普通按钮
         */
        type: TYPE.TOOLBAR_BUTTON,

        /**
         * 响应函数
         */
        exec: function() {
            // TODO 完善细节
            this.editor.execCommand(this.name);
        }
    });

 });

KISSY.Editor.add("plugins~save", function(E) {

    var Y = YAHOO.util, Event = Y.Event,
        TYPE = E.PLUGIN_TYPE,

        TAG_MAP = {
            b: { tag: "strong" },
            i: { tag: "em" },
            u: { tag: "span", style: "text-decoration:underline" },
            strike: { tag: "span", style: "text-decoration:line-through" }
        };


    E.addPlugin("save", {
        /**
         * 种类
         */
        type: TYPE.FUNC,

        /**
         * 初始化
         */
        init: function() {
            var editor = this.editor,
                textarea = editor.textarea,
                form = textarea.form;

            if(form) {
                Event.on(form, "submit", function() {
                    if(!editor.sourceMode) {
                        textarea.value = editor.getData();
                    }
                });
            }
        },

        /**
         * 过滤数据
         */
        filterData: function(data) {

            data = data.replace(/<(\/?)([^>]+)>/g, function(m, slash, tag) {

                // 将 ie 的大写标签和 style 等属性值转换为小写
                tag = tag.toLowerCase();

                // 让标签语义化
                var map = TAG_MAP[tag],
                    ret = tag;

                // 仅针对 <tag> 这种不含属性的标签做进一步处理
                if(tag.indexOf(" ") == -1 && map) {
                    ret = map["tag"];
                    if(!slash && map["style"]) {
                        ret += ' style="' + map["style"] + '"';
                    }
                }

                return "<" + slash + ret + ">";
            });

            return data;

            // 注:
            //  1. 当 data 很大时，上面的 replace 可能会有性能问题。
            //    （更新：已经将多个 replace 合并成了一个，正常情况下，不会有性能问题）
            //
            //  2. 尽量语义化，google 的实用，但未必对
            // TODO: 进一步优化，比如 <span style="..."><span style="..."> 两个span可以合并为一个

            // FCKEditor 实现了部分语义化
            // Google Docs 采用是实用主义
            // KISSY Editor 的原则是：在保证实用的基础上，尽量语义化
        }
    });
 });

KISSY.Editor.add("plugins~source", function(E) {

    var TYPE = E.PLUGIN_TYPE;

    /**
     * 查看源代码插件
     */
    E.addPlugin("source", {
        /**
         * 种类：普通按钮
         */
        type: TYPE.TOOLBAR_BUTTON,

        /**
         * 初始化函数
         */
        init: function() {
            var editor = this.editor;

            this.iframe = editor.contentWin.frameElement;
            this.textarea = editor.textarea;

            // 将 textarea 放入 iframe 下面
            this.iframe.parentNode.appendChild(editor.textarea);
        },

        /**
         * 响应函数
         */
        exec: function() {
            var editor = this.editor,
                srcOn = editor.sourceMode;

            // 同步数据
            if(srcOn) {
                editor.contentDoc.body.innerHTML = this.textarea.value;
            } else {
                this.textarea.value = editor.getContentDocData();
            }

            // 切换显示
            this.textarea.style.display = srcOn ? "none" : "";
            this.iframe.style.display = srcOn ? "" : "none";

            // 更新状态
            editor.sourceMode = !srcOn;
        }
    });

 });

KISSY.Editor.add("plugins~maximize", function(E) {

    var TYPE = E.PLUGIN_TYPE;

    E.addPlugin("maximize", {
        /**
         * 种类：普通按钮
         */
        type: TYPE.TOOLBAR_BUTTON,

        /**
         * 响应函数
         */
        exec: function() {
            alert("todo");
        }
    });

 });
