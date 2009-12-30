/*
Copyright (c) 2009, Kissy UI Library. All rights reserved.
MIT Licensed.
http://kissy.googlecode.com/

Date: 2009-12-30 12:18:29
Revision: 380
*/
/**
 * @module kissy
 * @creator lifesinger@gmail.com
 */

if (typeof KISSY === "undefined" || !KISSY) {
    /**
     * The KISSY global object.
     * @constructor
     * @global
     */
    function KISSY(c) {
        var o = this;
        // allow instantiation without the new operator
        if (!(o instanceof arguments.callee)) {
            return new arguments.callee(c);
        }

        // init the core environment
        o._init();
        o._config(c);

        // bind the specified additional modules for this instance
        o._setup();

        return o;
    }
}

(function(S) {

    var win = window, UNDEFINED = "undefined", slice = Array.prototype.slice,
        mix = function(r, s, ov, wl) {
            if (!s || !r) return r;
            if (typeof ov === UNDEFINED) ov = true;
            var i, p, l;

            if (wl && (l = wl.length)) {
                for (i = 0; i < l; i++) {
                    p = wl[i];
                    if (p in s) {
                        if (ov || !(p in r)) {
                            r[p] = s[p];
                        }
                    }
                }
            } else {
                for (p in s) {
                    if (ov || !(p in r)) {
                        r[p] = s[p];
                    }
                }
            }

            return r;
        };

    mix(S.prototype, {

        /**
         * Register a module
         * @param name {string} module name
         * @param fn {function} entry point into the module that is used to bind module to the KISSY instance
         * @param version {string} version string
         * @param details optional config data:
         * submodules - sub modules
         * requires - features that should be present before loading
         * optional - optional features that should be present if load optional defined
         * use - features that should be attached automatically
         * @return {KISSY} the KISSY instance
         */
        add: function(name, fn, version, details) {
            S.Env.mods[name] = {
                name: name,
                fn: fn,
                version: version,
                details: details || {}
            };
            return this; // chain support
        },

        /**
         * Initialize this KISSY instance
         * @private
         */
        _init: function() {
            var o = this;
            o.version = "@VERSION@";

            o.Env = {
                mods: {},
                _used: {},
                _attached: {}
            };

            o.config = {
                debug: true
            };
        },

        /**
         * Initialize this config
         * @private
         */
        _config: function(c) {
            mix(this.config, c);
        },

        /**
         * Attaches whatever modules were defined when the instance was created.
         * @private
         */
        _setup: function() {
            this.use("kissy-core");
        },

        /**
         * Bind a module to a KISSY instance
         * <pre>
         * KISSY().use("*", function(S){});
         * KISSY().use("editor", function(S){});
         * KISSY().use(function(S){});
         * </pre>
         * @return {KISSY} the KISSY instance
         */
        use: function() {
            var o = this,
                a = slice.call(arguments, 0),
                mods = S.Env.mods,
                used = o.Env._used,
                l = a.length,
                callback = a[l - 1],
                i, k, name, r = [];

            // the last argument is callback
            if (typeof callback === "function") {
                a.pop();
            } else {
                callback = null;
            }

            // bind everything available
            if (a[0] === "*") {
                a = [];
                for (k in mods) {
                    a.push(k);
                }
                if (callback) {
                    a.push(callback);
                }
                return o.use.apply(o, a);
            }

            // process each module
            function f(name) {
                // only attach a module once
                if (used[name]) return;

                var m = mods[name], j, n, subs;

                if (m) {
                    used[name] = true;
                    subs = m.details.submodules;
                }

                // add this module to full list of things to attach
                r.push(name);

                // make sure submodules are attached
                if (subs) {
                    if (typeof subs === "string") subs = [subs];
                    for (j = 0, n = subs.length; j < n; j++) {
                        f(subs[j]);
                    }
                }
            }

            for (i = 0; i < l; i++) {
                f(a[i]);
            }

            // attach available modules
            o._attach(r);

            // callback
            if (callback) {
                callback(o);
            }

            // chain support
            return o;
        },

        /**
         * Attaches modules to a KISSY instance
         */
        _attach: function(r) {
            var mods = S.Env.mods,
                attached = this.Env._attached,
                i, l = r.length, name, m;

            for (i = 0; i < l; i++) {
                name = r[i];
                m = mods[name];
                if (!attached[name] && m) {
                    attached[name] = true;
                    if (m.fn) {
                        m.fn(this);
                    }
                }
            }
        },

        /**
         * Copies all the properties of s to r. overwrite mode.
         * @return {object} the augmented object
         */
        mix: mix,

        /**
         * Returns a new object containing all of the properties of
         * all the supplied objects.  The properties from later objects
         * will overwrite those in earlier objects.  Passing in a
         * single object will create a shallow copy of it.
         * @return {object} the new merged object
         */
        merge: function() {
            var a = arguments, o = {}, i, l = a.length;
            for (i = 0; i < l; ++i) {
                mix(o, a[i], true);
            }
            return o;
        },

        /**
         * Utility to set up the prototype, constructor and superclass properties to
         * support an inheritance strategy that can chain constructors and methods.
         * Static members will not be inherited.
         *
         * @method extend
         * @param {Function} r the object to modify
         * @param {Function} s the object to inherit
         * @param {Object} px prototype properties to add/override
         * @param {Object} sx static properties to add/override
         * @return {KISSY} the KISSY instance
         */
        extend: function(r, s, px, sx) {
            if (!s || !r) return r;

            var OP = Object.prototype,
                O = function (o) {
                    function F() {
                    }

                    F.prototype = o;
                    return new F();
                },
                sp = s.prototype,
                rp = O(sp);

            r.prototype = rp;
            rp.constructor = r;
            r.superclass = sp;

            // assign constructor property
            if (s !== Object && sp.constructor === OP.constructor) {
                sp.constructor = s;
            }

            // add prototype overrides
            if (px) {
                mix(rp, px);
            }

            // add object overrides
            if (sx) {
                mix(r, sx);
            }

            return r;
        },

        /**
         * Applies prototype properties from the supplier to the receiver.
         * The receiver must be a Function.
         * @param {Function} r  the object to receive the augmentation
         * @param {Function} s  the object that supplies the properties to augment
         * @param wl {string[]} a whitelist.  If supplied, only properties in this list will be applied to the receiver.
         * @return {object} the augmented object
         */
        augment: function(r, s, ov, wl) {
            return mix(r.prototype, s.prototype, ov, wl);
        },

        /**
         * Executes the supplied function on each item in the array.
         * @method each
         * @param arr {Array} the array to iterate
         * @param fn {Function} the function to execute on each item.  The
         * function receives three arguments: the value, the index, the full array.
         * @param obj Optional context object
         */
        each: function (arr, fn, obj) {
            var l = (arr && arr.length) || 0, i;
            for (i = 0; i < l; i++) {
                fn.call(obj || this, arr[i], i, arr);
            }
            return this;
        },

        /**
         * Adds fn to domready event
         */
        ready: function(/*fn*/) {
          // TODO
        },

        /**
         * Execute the supplied method after the specified function
         * @param fn {Function} the function to execute
         * @param when {string} before or after
         * @param obj the object hosting the method to displace
         * @param sFn {string} the name of the method to displace
         */
        weave: function(fn, when, obj, sFn) {
            var arr = [obj[sFn], fn];

            if (when === "before") arr.reverse();
            obj[sFn] = function() {
                for (var i = 0, args = slice.call(arguments, 0); i < 2; i++) {
                    arr[i].apply(this, args);
                }
            };

            return this;
        },

        /**
         * Clones KISSY to another global object.
         * <pre>
         * S.cloneTo("TaoBao");
         * </pre>
         * @return {object}  A reference to the last object
         */
        cloneTo: function(name) {
            function O(c) {
                // allow instantiation without the new operator
                if (!(this instanceof O)) {
                    return new O(c);
                }
                O.superclass.constructor.call(this, c);
            }

            S.extend(O, S, null, S);
            return (win[name] = O);
        },

        /**
         * Returns the namespace specified and creates it if it doesn't exist
         * Be careful when naming packages. Reserved words may work in some browsers
         * and not others.
         * <pre>
         * S.cloneTo("TB");
         * TB.namespace("TB.app"); // returns TB.app
         * TB.namespace("app.Shop"); // returns TB.app.Shop
         * </pre>
         * @return {object}  A reference to the last namespace object created
         */
        namespace: function() {
            var a = arguments, l = a.length, o = this, i, j, p;
            // allow instance.namespace() to work fine.
            if (typeof o === "object") o = o.constructor;

            for (i = 0; i < l; i++) {
                p = ("" + a[i]).split(".");
                for (j = (win[p[0]] === o) ? 1 : 0; j < p.length; j++) {
                    o[p[j]] = o[p[j]] || {};
                    o = o[p[j]];
                }
            }
            return o;
        },

        /**
         * print debug info
         * @param {String} msg The message to log.
         * @param {String} cat The log category for the message. Default
         * categories are "info", "warn", "error", time".
         * Custom categories can be used as well. (opt)
         * @param {String} src The source of the the message (opt)
         * @return {KISSY} KISSY instance
         */
        log: function(msg, cat, src) {
            var c = this.config;

            if (c.debug) {
                src && (msg = src + ": " + msg);
                if (typeof console !== UNDEFINED && console.log) {
                    console[cat && console[cat] ? cat : "log"](msg);
                }
            }

            return this;
        }
    });

    // Give the KISSY global the same properties as an instance.
    // More importantly, the KISSY global provides global metadata,
    // so env needs to be configured.
    mix(S, S.prototype); // TODO: white list?
    S._init();

})(KISSY);
/**
 * KISSY.Editor 富文本编辑器
 * @module      editor
 * @creator     玉伯<lifesinger@gmail.com>
 * @depends     kissy-core, yahoo-dom-event
 */
KISSY.add("editor", function(S) {

    /**
     * @constructor
     * @param {string|HTMLElement} textarea
     * @param {object} config
     */
    function Editor(textarea, config) {
        var E = Editor;
        // allow instantiation without the new operator
        if (!(this instanceof E)) {
            return new E(textarea, config);
        }

        if (!E._isReady) {
            E._setup();
        }
        return new E.Instance(textarea, config);
    }

    S.mix(Editor, {
        /**
         * 版本号
         */
        version: "1.0",

        /**
         * 语言配置，在 lang 目录添加
         */
        lang: {},

        /**
         * 所有注册的插件
         * 注：plugin = { name: pluginName, type: pluginType, init: initFn, ... }
         */
        plugins: {},

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
                    plugins[key] = S.merge(p, {
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
            var mods = KISSY.Editor.Env.mods,
                attached = this._attached,
                name, m;

            for (name in mods) {
                m = mods[name];
                if (m) {
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

    S.Editor = Editor;
});

KISSY.Editor = {
    /**
     * 全局环境变量
     */
    Env: {
        /**
         * 所有添加的模块
         * 注：mod = { name: modName, fn: initFn, details: {...} }
         */
        mods: {}
    },

    /**
     * 添加模块
     */
    add: function(name, fn, details) {

        this.Env.mods[name] = {
            name: name,
            fn: fn,
            details: details || {}
        };

        return this; // chain support
    }
};

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
        language: "zh-cn",

        /**
         * 主题
         */
        theme: "default",

        /**
         * Toolbar 上功能插件
         */
        toolbar: [
            "source",
            "",
            /*"undo", "redo",
            "",*/
            "fontName", "fontSize", "bold", "italic", "underline", "strikeThrough", "foreColor", "backColor",
            "",
            "link", "smiley", "image",
            "",
            "insertOrderedList", "insertUnorderedList", "outdent", "indent", "justifyLeft", "justifyCenter", "justifyRight"
            //"",
            //"removeformat"
        ],

        /**
         * Statusbar 上的插件
         */
        statusbar: [
            "wordcount",
            "resize"
        ],

        /**
         * 插件的配置
         */
        pluginsConfig: { }

        /**
         * 自动聚焦
         */
        // autoFocus: false
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
          title           : "Font Name",
          options         : {
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
          text            : "Size",
          title           : "Font size",
          options         : {
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
            text          : "Link",
            title         : "Insert/Edit link",
            href          : "URL:",
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
            title         : "Insert image",
            tab_link      : "Web Image",
            tab_local     : "Local Image",
            tab_album     : "Album Image",
            label_link    : "Enter image web address:",
            label_local   : "Browse your computer for the image file to upload:",
            label_album   : "Select the image from your album:",
            uploading     : "Uploading...",
            upload_error  : "Exception occurs when uploading file.",
            upload_filter : "Only allow PNG, GIF, JPG image type.",
            ok            : "Insert"
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
        removeformat: {
          text            : "Remove Format",
          title           : "Remove Format"
        },
        wordcount: {
          tmpl            : "Remain %remain% words (include html code)"
        },
        resize: {
            larger_text   : "Larger",
            larger_title  : "Enlarge the editor",
            smaller_text  : "Smaller",
            smaller_title : "Shrink the editor"
        },

        // Common messages and labels
        common: {
            ok            : "OK",
            cancel        : "Cancel"
        }
    };

});

KISSY.Editor.add("lang~zh-cn", function(E) {

    E.lang["zh-cn"] = {

        // Toolbar buttons
        source: {
          text            : "源码",
          title           : "源码"
        },
        undo: {
          text            : "撤销",
          title           : "撤销"
        },
        redo: {
          text            : "重做",
          title           : "重做"
        },
        fontName: {
          text            : "字体",
          title           : "字体",
          options         : {
              "宋体"             : "宋体",
              "黑体"             : "黑体",
              "隶书"             : "隶书",
              "楷体"             : "楷体_GB2312",
              //"幼圆"             : "幼圆",
              "微软雅黑"          : "微软雅黑",
              "Georgia"         : "Georgia",
              //"Garamond"        : "Garamond",
              "Times New Roman" : "Times New Roman",
              "Impact"          : "Impact",
              "Courier New"     : "Courier New",
              "Arial"           : "Arial",
              "Verdana"         : "Verdana",
              "Tahoma"          : "Tahoma"
          }
        },
        fontSize: {
          text            : "大小",
          title           : "大小",
          options         : {
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
            text          : "粗体",
            title         : "粗体"
        },
        italic: {
            text          : "斜体",
            title         : "斜体"
        },
        underline: {
            text          : "下划线",
            title         : "下划线"
        },
        strikeThrough: {
            text          : "删除线",
            title         : "删除线"
        },
        link: {
            text          : "链接",
            title         : "插入/编辑链接",
            href          : "URL:",
            target        : "在新窗口打开链接",
            remove        : "移除链接"
        },
        blockquote: {
            text          : "引用",
            title         : "引用"
        },
        smiley: {
            text          : "表情",
            title         : "插入表情"
        },
        image: {
            text          : "图片",
            title         : "插入图片",
            tab_link      : "网络图片",
            tab_local     : "本地上传",
            tab_album     : "我的相册",
            label_link    : "请输入图片地址：",
            label_local   : "请选择本地图片：",
            label_album   : "请选择相册图片：",
            uploading     : "正在上传...",
            upload_error  : "对不起，上传文件时发生了错误：",
            upload_filter : "仅支持 JPG, PNG 和 GIF 图片，请重新选择。",
            ok            : "插入"
        },
        insertOrderedList: {
            text          : "有序列表",
            title         : "有序列表"
        },
        insertUnorderedList: {
            text          : "无序列表",
            title         : "无序列表"
        },
        outdent: {
            text          : "减少缩进",
            title         : "减少缩进"
        },
        indent: {
            text          : "增加缩进",
            title         : "增加缩进"
        },
        justifyLeft: {
            text          : "左对齐",
            title         : "左对齐"
        },
        justifyCenter: {
            text          : "居中对齐",
            title         : "居中对齐"
        },
        justifyRight: {
            text          : "右对齐",
            title         : "右对齐"
        },
        foreColor: {
            text          : "文本颜色",
            title         : "文本颜色"
        },
        backColor: {
            text          : "背景颜色",
            title         : "背景颜色"
        },
        maximize: {
          text            : "全屏编辑",
          title           : "全屏编辑"
        },
        removeformat: {
          text            : "清除格式",
          title           : "清除格式"
        },
        wordcount: {
          tmpl            : "还可以输入 %remain% 字（含 html 代码）"
        },
        resize: {
            larger_text   : "增大",
            larger_title  : "增大编辑区域",
            smaller_text  : "缩小",
            smaller_title : "缩小编辑区域"
        },

        // Common messages and labels
        common: {
            ok            : "确定",
            cancel        : "取消"
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
        STATUSBAR_ITEM: 16,
        FUNC: 32 // 纯功能性质插件，无 UI
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
        },

        // Ref: CKEditor - core/dom/elementpath.js
        BLOCK_ELEMENTS: {

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
        },

        /**
         * Convert the custom integer (B G R) format to hex format.
         */
        int2hex: function(val) {
            var red, green, blue;

            val = val >> 0;
            red = val & 255;
            green = (val >> 8) & 255;
            blue = (val >> 16) & 255;

            return this.toHex("rgb(" + red + "," + green +"," + blue + ")");
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
        exec: function(doc, cmdName, val, styleWithCSS) {
            cmdName = CUSTOM_COMMANDS[cmdName] || cmdName;

            this._preExec(doc, cmdName, styleWithCSS);
            doc[EXEC_COMMAND](cmdName, false, val);
        },

        _preExec: function(doc, cmdName, styleWithCSS) {

            // 关闭 gecko 浏览器的 styleWithCSS 特性，使得产生的内容和 ie 一致
            if (ua.gecko) {
                var val = typeof styleWithCSS === "undefined" ? (TAG_COMMANDS.indexOf(cmdName) === -1) : styleWithCSS;
                doc[EXEC_COMMAND](STYLE_WITH_CSS, false, val);
            }
        }
    };

});
KISSY.Editor.add("core~range", function(E) {

    var isIE = YAHOO.env.ua.ie;

    E.Range = {

        /**
         * 获取选中区域对象
         */
        getSelectionRange: function(win) {
            var doc = win.document,
                selection, range;

            if (win.getSelection) { // W3C
                selection = win.getSelection();

                if (selection.getRangeAt) {
                    range = selection.getRangeAt(0);

                } else { // for Old Webkit! 高版本的已经支持 getRangeAt
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
         * 获取容器
         */
        getCommonAncestor: function(range) {
            return range.startContainer || // w3c
                   (range.parentElement && range.parentElement()) || // ms TextRange
                   (range.commonParentElement && range.commonParentElement()); // ms IHTMLControlRange
        },

        /**
         * 获取选中文本
         */
        getSelectedText: function(range) {
            if("text" in range) return range.text;
            return range.toString ? range.toString() : ""; // ms IHTMLControlRange 无 toString 方法
        },

        /**
         * 保存选区 for ie
         */
        saveRange: function(editor) {
            // 1. 保存 range, 以便还原
            isIE && editor.contentWin.focus(); // 确保下面这行 range 是编辑区域的，否则 [Issue 39]

            // 2. 聚集到按钮上，隐藏光标，否则 ie 下光标会显示在层上面
            // 通过 blur / focus 等方式在 ie7- 下无效
            // 注意：2 和 1 冲突。权衡考虑，还是取消2
            //isIE && editor.contentDoc.selection.empty();

            return editor.getSelectionRange();
        }
    };

});

KISSY.Editor.add("core~instance", function(E) {

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang,
        UA = YAHOO.env.ua,
        ie = UA.ie,
        EDITOR_CLASSNAME = "ks-editor",

        EDITOR_TMPL  =  '<div class="ks-editor-toolbar"></div>' +
                        '<div class="ks-editor-content"><iframe frameborder="0" allowtransparency="1"></iframe></div>' +
                        '<div class="ks-editor-statusbar"></div>',

        CONTENT_TMPL =  '<!doctype html>' +
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
            this._initAutoFocus();
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
                plugins[key] = Lang.merge(staticPlugins[key]);
            }
            this.plugins = plugins;

            // 工具栏上的插件
            this.toolbar.init();

            // 状态栏上的插件
            this.statusbar.init();
            
            // 其它功能性插件
            for (key in plugins) {
                p = plugins[key];
                if (p.inited) continue;

                if (p.type === E.PLUGIN_TYPE.FUNC) {
                    p.editor = this; // 给 p 增加 editor 属性
                    if (p.init) {
                        p.init();
                    }
                    p.inited = true;
                }
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

            if (ie) {
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

            // TODO: 让初始输入文字始终在 p 标签内
            // 下面的处理办法不妥当
//            if (Lang.trim(doc.body.innerHTML).length === 0) {
//                if(UA.gecko) {
//                    doc.body.innerHTML = '<p><br _moz_editor_bogus_node="TRUE" _moz_dirty=""/></p>';
//                } else {
//                    doc.body.innerHTML = '<p></p>';
//                }
//            }

            if(ie) {
                // 点击的 iframe doc 非 body 区域时，还原焦点位置
                Event.on(doc, "click", function() {
                    if (doc.activeElement.parentNode.nodeType === 9) { // 点击在 doc 上
                        self._focusToEnd();
                    }
                });
            }
        },

        _initAutoFocus: function() {
            if (this.config.autoFocus) {
                this._focusToEnd();
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
            if(data == "<br>") data = ""; // firefox 下会自动生成一个 br

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

KISSY.Editor.add("core~toolbar", function(E) {

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang,
        isIE = YAHOO.env.ua.ie,
        isIE6 = isIE === 6,
        TYPE = E.PLUGIN_TYPE,
        TOOLBAR_SEPARATOR_TMPL = '<div class="ks-editor-stripbar-sep ks-inline-block"></div>',

        TOOLBAR_BUTTON_TMPL = '' +
'<div class="ks-editor-toolbar-button ks-inline-block" title="{TITLE}">' +
    '<div class="ks-editor-toolbar-button-outer-box">' +
        '<div class="ks-editor-toolbar-button-inner-box">' +
            '<span class="ks-editor-toolbar-item ks-editor-toolbar-{NAME}">{TEXT}</span>' +
        '</div>' +
    '</div>' +
'</div>',

        TOOLBAR_MENU_BUTTON_TMPL = '' +
'<div class="ks-editor-toolbar-menu-button-caption ks-inline-block">' +
    '<span class="ks-editor-toolbar-item ks-editor-toolbar-{NAME}">{TEXT}</span>' +
'</div>' +
'<div class="ks-editor-toolbar-menu-button-dropdown ks-inline-block"></div>',

        TOOLBAR_MENU_BUTTON = "ks-editor-toolbar-menu-button",
        TOOLBAR_SELECT = "ks-editor-toolbar-select",
        TOOLBAR_BUTTON_ACTIVE = "ks-editor-toolbar-button-active",
        TOOLBAR_BUTTON_HOVER = "ks-editor-toolbar-button-hover",
        TOOLBAR_BUTTON_SELECTED = "ks-editor-toolbar-button-selected",
    
        STATE_CMDS = "fontName,fontSize,bold,italic,underline,strikeThrough"
                     + "insertOrderedList,insertUnorderedList"
                     + "justifyLeft,justifyCenter,justifyRight",

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

        /**
         * 所有加载的工具栏插件
         */
        this.items = [];

        /**
         * 所有需要动态更新状态的工具栏插件项
         */
        this.stateItems = [];
    };
    
    Lang.augmentObject(E.Toolbar.prototype, {

        /**
         * 初始化工具条
         */
        init: function() {
            var items = this.config.toolbar,
                plugins = this.editor.plugins,
                key, p;

            // 遍历配置项，找到相关插件项，并添加到工具栏上
            for (var i = 0, len = items.length; i < len; ++i) {
                key = items[i];
                if (key) {
                    if (!(key in plugins)) continue; // 配置项里有，但加载的插件里无，直接忽略

                    // 添加插件项
                    p = plugins[key];
                    this._addItem(p);

                    this.items.push(p);
                    if(STATE_CMDS.indexOf(p.name) !== -1) {
                        this.stateItems.push(p);
                    }

                } else { // 添加分隔线
                    this._addSeparator();
                }
            }

            // 状态更新
            this._initUpdateState();
        },

        /**
         * 添加工具栏项
         */
        _addItem: function(p) {
            var el, type = p.type, lang = this.lang, html;

            // 当 plugin 没有设置 lang 时，采用默认语言配置
            // TODO: 考虑重构到 instance 模块里，因为 lang 仅跟实例相关
            if (!p.lang) p.lang = Lang.merge(lang["common"], this.lang[p.name] || {});

            // 根据模板构建 DOM
            html = TOOLBAR_BUTTON_TMPL
                    .replace("{TITLE}", p.lang.title || "")
                    .replace("{NAME}", p.name)
                    .replace("{TEXT}", p.lang.text || "");
            if (isIE6) {
                html = html
                        .replace("outer-box", "outer-box ks-inline-block")
                        .replace("inner-box", "inner-box ks-inline-block");
            }
            div.innerHTML = html;

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

            // 3. ie6 下，模拟 hover
            if(isIE6) {
                Event.on(el, "mouseenter", function() {
                    Dom.addClass(el, TOOLBAR_BUTTON_HOVER);
                });
                Event.on(el, "mouseleave", function() {
                    Dom.removeClass(el, TOOLBAR_BUTTON_HOVER);
                });
            }
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
        },

        /**
         * 初始化按钮状态的动态更新
         */
        _initUpdateState: function() {
            var doc = this.editor.contentDoc,
                self = this;

            Event.on(doc, "click", function() { self.updateState(); });
            Event.on(doc, "keyup", function(ev) {
                var keyCode = ev.keyCode;

                // PGUP,PGDN,END,HOME: 33 - 36
                // LEFT,UP,RIGHT,DOWN：37 - 40
                // BACKSPACE: 8
                // ENTER: 13
                // DEL: 46
                if((keyCode >= 33 && keyCode <= 40)
                    || keyCode === 8
                    || keyCode === 13
                    || keyCode === 46) {
                    self.updateState();
                }
            });

            // TODO: 监控粘贴时的事件，粘贴后需要更新按钮状态
        },

        /**
         * 按钮状态的动态更新（包括按钮选中状态的更新、字体字号的更新、颜色的动态更新等）
         * 遵守 Google Docs 的原则，让所有按钮始终可点击，只更新状态，不禁用按钮
         */
        updateState: function(filterNames) {
            var items = this.stateItems, p;
            filterNames = filterNames ? filterNames.join("|") : "";

            for(var i = 0, len = items.length; i < len; i++) {
                p = items[i];
                
                if(filterNames && filterNames.indexOf(p.name) === -1)
                    continue;

                // 调用插件自己的状态更新函数
                if(p.updateState) {
                    p.updateState();
                    continue;
                }

                // 默认的状态更新函数
                this.updateItemState(p);
            }

            // TODO: webkit 下，对齐的状态没获取到
        },

        updateItemState: function(p) {
            var doc = this.editor.contentDoc;

            // 默认的状态更新函数
            try {
                if (doc.queryCommandEnabled(p.name)) {
                    if (doc.queryCommandState(p.name)) {
                        Dom.addClass(p.domEl, TOOLBAR_BUTTON_SELECTED);
                    } else {
                        Dom.removeClass(p.domEl, TOOLBAR_BUTTON_SELECTED);
                    }
                }
            } catch(ex) {
            }
        }
    });

});

KISSY.Editor.add("core~statusbar", function(E) {

    var Y = YAHOO.util, Lang = YAHOO.lang,
        isIE = YAHOO.env.ua.ie,

        SEP_TMPL = '<div class="ks-editor-stripbar-sep kissy-inline-block"></div>',
        ITEM_TMPL = '<div class="ks-editor-statusbar-item ks-editor-{NAME} ks-inline-block"></div>',

        div = document.createElement("div"); // 通用 el 容器

    E.Statusbar = function(editor) {

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
    
    Lang.augmentObject(E.Statusbar.prototype, {

        /**
         * 初始化
         */
        init: function() {
            var items = this.config.statusbar,
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
                    this._addSep();
                }
            }
        },

        /**
         * 添加工具栏项
         */
        _addItem: function(p) {
            var el, lang = this.lang;

            // 当 plugin 没有设置 lang 时，采用默认语言配置
            // TODO: 考虑重构到 instance 模块里，因为 lang 仅跟实例相关
            if (!p.lang) p.lang = Lang.merge(lang["common"], this.lang[p.name] || {});

            // 根据模板构建 DOM
            div.innerHTML = ITEM_TMPL.replace("{NAME}", p.name);

            // 得到 domEl
            p.domEl = el = div.firstChild;

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
         * 添加分隔线
         */
        _addSep: function() {
            div.innerHTML = SEP_TMPL;
            this._addToToolbar(div.firstChild);
        },

        /**
         * 将 item 或 分隔线 添加到状态栏
         */
        _addToToolbar: function(el) {
            if(isIE) el = E.Dom.setItemUnselectable(el);
            this.domEl.appendChild(el);
        }
    });

});

KISSY.Editor.add("core~menu", function(E) {

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event,
        UA = YAHOO.env.ua,

        DISPLAY = "display",
        NONE = "none",
        EMPTY = "",
        DROP_MENU_CLASS = "ks-editor-drop-menu",
        SHADOW_CLASS = "ks-editor-drop-menu-shadow",
        CONTENT_CLASS = "ks-editor-drop-menu-content",
        SELECTED_CLASS = "ks-editor-toolbar-button-selected",
        SHIM_CLASS = DROP_MENU_CLASS + "-shim", //  // iframe shim 的 class
        shim; // 共用一个 shim 即可
    
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

            // 添加阴影层
            dropMenu.innerHTML = '<div class="' + SHADOW_CLASS + '"></div>'
                               + '<div class="' + CONTENT_CLASS + '"></div>';
            
            // 生成 DOM
            dropMenu.className = DROP_MENU_CLASS;
            dropMenu.style[DISPLAY] = NONE;
            document.body.appendChild(dropMenu);

            // 点击触点时，显示下拉框
            // 注：一个编辑器实例，最多只能有一个激活的下拉框
            Event.on(trigger, "click", function(ev) {
                // 不向上传播，自己控制
                // 否则 document 上监控点击后，会关闭刚打开的 dropMenu
                Event.stopPropagation(ev);

                // 隐藏当前激活的下拉框
                editor.activeDropMenu && self._hide(editor);

                // 打开当前 trigger 的 dropMenu
                if(editor.activeDropMenu != dropMenu) {
                    self._setDropMenuPosition(trigger, dropMenu, offset); // 延迟到显示时调整位置
                    editor.activeDropMenu = dropMenu;
                    editor.activeDropButton = trigger;
                    self._show(editor);

                } else { // 第二次点击在 trigger 上，关闭 activeDropMenu, 并置为 null. 否则会导致第三次点击打不开
                    editor.activeDropMenu = null;
                    editor.activeDropButton = null;
                }
            });

            // document 捕获到点击时，关闭当前激活的下拉框
            Event.on([document, editor.contentDoc], "click", function() {
                if(editor.activeDropMenu) {
                    self.hideActiveDropMenu(editor);

                    // 还原选区和焦点
                    if (this == editor.contentDoc) {
                        // TODO: [bug 58]  需要重写一个 focusmanager 来统一管理焦点
//                        if (UA.ie) {
//                            var range = editor.getSelectionRange();
//                            range.select();
//                        }
                        editor.contentWin.focus();
                    }
                }
            });

            // 改变窗口大小时，动态调整位置
            this._initResizeEvent(trigger, dropMenu, offset);

            // 返回
            return dropMenu.childNodes[1]; // 返回 content 部分
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
            return el.style[DISPLAY] != NONE;
        },

        /**
         * 隐藏编辑器当前打开的下拉框
         */
        hideActiveDropMenu: function(editor) {
            this._hide(editor);
            editor.activeDropMenu = null;
            editor.activeDropButton = null;
        },

        _hide: function(editor) {
            var dropMenu = editor.activeDropMenu,
                dropButton = editor.activeDropButton;

            if(dropMenu) {
                shim && (shim.style[DISPLAY] = NONE);

                dropMenu.style[DISPLAY] = NONE;
                //dropMenu.style.visibility = "hidden";
                // 注：visibilty 方式会导致ie下，上传并插入文件（选择了选取文件框）后，编辑区域焦点丢失
            }

            dropButton && (Dom.removeClass(dropButton, SELECTED_CLASS));
        },

        _show: function(editor) {
            var dropMenu = editor.activeDropMenu,
                dropButton = editor.activeDropButton;

            if (dropMenu) {
                dropMenu.style[DISPLAY] = EMPTY;

                if (UA.ie === 6) {
                    this._updateShimRegion(dropMenu);
                    shim.style[DISPLAY] = EMPTY;
                }
            }

            dropButton && (Dom.addClass(dropButton, SELECTED_CLASS));
        },

        _updateShimRegion: function(el) {
            if(el) {
                if(UA.ie === 6) {
                    if(!shim) this._initShim();
                    this._setShimRegion(el);
                }
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
        },

        _initShim: function() {
            shim = document.createElement("iframe");
            shim.src = "about:blank";
            shim.className = SHIM_CLASS;
            shim.style.position = "absolute";
            shim.style[DISPLAY] = NONE;
            shim.style.border = NONE;
            document.body.appendChild(shim);
        },

        /**
         * 设置 shim 的 region
         * @protected
         */
        _setShimRegion: function(el) {
            if (shim && this._isVisible(el)) {
                var r = Dom.getRegion(el);
                if (r.width > 0) {
                    shim.style.left = r.left + "px";
                    shim.style.top = r.top + "px";
                    shim.style.width = (r.width - 1) + "px"; // 少一像素，否则 ie6 下会露出一像素
                    shim.style.height = (r.height - 1) + "px";
                }
            }
        }
    };

});


KISSY.Editor.add("smilies~config~default", function(E) {

    E.Smilies = E.Smilies || {};

    E.Smilies["default"] = {

        name: "default",

        mode: "icons",

        cols: 5,
        
        fileNames: [
                "smile",  "confused",  "cool",      "cry",   "eek",
                "angry",  "wink",      "sweat",     "lol",   "stun",
                "razz",   "shy",       "rolleyes",  "sad",   "happy",
                "yes",    "no",        "heart",     "idea",  "rose"
        ],

        fileExt: "gif"
    };

});

KISSY.Editor.add("smilies~config~wangwang", function(E) {

    E.Smilies = E.Smilies || {};

    E.Smilies["wangwang"] = {

        name: "wangwang",

        mode: "sprite",

		base: "http://a.tbcdn.cn/sys/wangwang/smiley/48x48/",

		spriteStyle: "background: url(http://a.tbcdn.cn/sys/wangwang/smiley/sprite.png) no-repeat -1px 0; width: 288px; height: 235px",

        unitStyle: "width: 24px; height: 24px",

		filePattern: {
			start : 0,
			end   : 98,
		    step  : 1	
		},

        fileExt: "gif"
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
            // 执行命令
            this.editor.execCommand(this.name);

            // 更新状态
            this.editor.toolbar.updateState();
        }
    });

 });

KISSY.Editor.add("plugins~color", function(E) {

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event,
        UA = YAHOO.env.ua,
        isIE = UA.ie,
        TYPE = E.PLUGIN_TYPE,

        PALETTE_TABLE_TMPL = '<div class="ks-editor-palette-table"><table><tbody>{TR}</tbody></table></div>',
        PALETTE_CELL_TMPL = '<td class="ks-editor-palette-cell"><div class="ks-editor-palette-colorswatch" title="{COLOR}" style="background-color:{COLOR}"></div></td>',

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

        PALETTE_CELL_CLS = "ks-editor-palette-colorswatch",
        PALETTE_CELL_SELECTED = "ks-editor-palette-cell-selected";

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
         * 取色块
         */
        swatches: null,

        /**
         * 关联的下拉菜单框
         */
        dropMenu: null,

        range: null,

        /**
         * 初始化
         */
        init: function() {
            var el = this.domEl,
                caption = el.getElementsByTagName("span")[0].parentNode;

            this.color = this._getDefaultColor();

            Dom.addClass(el, "ks-editor-toolbar-color-button");
            caption.innerHTML = '<div class="ks-editor-toolbar-color-button-indicator" style="border-bottom-color:' + this.color + '">'
                               + caption.innerHTML
                               + '</div>';

            this._indicator = caption.firstChild;

            this._renderUI();
            this._bindUI();

            this.swatches = Dom.getElementsByClassName(PALETTE_CELL_CLS, "div", this.dropMenu);
        },

        _renderUI: function() {
            // 有两种方案：
            //  1. 仿照 MS Office 2007, 仅当点击下拉箭头时，才弹出下拉框。点击 caption 时，直接设置颜色。
            //  2. 仿照 Google Docs, 不区分 caption 和 dropdown，让每次点击都弹出下拉框。
            // 从逻辑上讲，方案1不错。但是，考虑 web 页面上，按钮比较小，方案2这样反而能增加易用性。
            // 这里采用方案2

            this.dropMenu = E.Menu.generateDropMenu(this.editor, this.domEl, [1, 0]);

            // 生成下拉框内的内容
            this._generatePalettes();

            // 针对 ie，设置不可选择
            if (isIE) E.Dom.setItemUnselectable(this.dropMenu);
        },

        _bindUI: function() {
            // 注册选取事件
            this._bindPickEvent();

            Event.on(this.domEl, "click", function() {
                // 保存 range, 以便还原
                this.range = this.editor.getSelectionRange();

                // 聚集到按钮上，隐藏光标，否则 ie 下光标会显示在层上面
                // 注：通过 blur / focus 等方式在 ie7- 下无效
                isIE && this.editor.contentDoc.selection.empty();

                // 更新选中色
                this._updateSelectedColor(this.color);
            }, this, true);
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
                    self._doAction(attr);
                }

                // 关闭悬浮框
                Event.stopPropagation(ev);
                E.Menu.hideActiveDropMenu(self.editor);
                // 注：在这里阻止掉事件冒泡，自己处理对话框的关闭，是因为
                // 在 Firefox 下，当执行 doAction 后，doc 获取到 click
                // 触发 updateState 时，还获取不到当前的颜色值。
                // 这样做，对性能也有好处，这种情况下不需要更新 updateState
            });
        },

        /**
         * 执行操作
         */
        _doAction: function(val) {
            if (!val) return;

            // 更新当前值
            this.setColor(E.Color.toHex(val));

            // 还原选区
            var range = this.range;
            if (isIE && range.select) range.select();

            // 执行命令
            this.editor.execCommand(this.name, this.color);
        },
        
        /**
         * 设置颜色
         * @param {string} val 格式 #RRGGBB or #RGB
         */
        setColor: function(val) {
            this.color = val;

            this._updateIndicatorColor(val);
            this._updateSelectedColor(val);
        },

        /**
         * 更新指示器的颜色
         * @param val HEX 格式
         */
        _updateIndicatorColor: function(val) {
            // 更新 indicator
            this._indicator.style.borderBottomColor = val;
        },

        /**
         * 更新下拉菜单中选中的颜色
         * @param {string} val 格式 #RRGGBB or #RGB
         */
        _updateSelectedColor: function(val) {
            var i, len, swatch, swatches = this.swatches;

            for(i = 0, len = swatches.length; i < len; ++i) {
                swatch = swatches[i];

                // 获取的 backgroundColor 在不同浏览器下，格式有差异，需要统一转换后再比较
                if(E.Color.toHex(swatch.style.backgroundColor) == val) {
                    Dom.addClass(swatch.parentNode, PALETTE_CELL_SELECTED);
                } else {
                    Dom.removeClass(swatch.parentNode, PALETTE_CELL_SELECTED);
                }
            }
        },

        /**
         * 更新按钮状态
         */
        // ie 下，queryCommandValue 无法正确获取到 backColor 的值
        // 干脆禁用此功能，模仿 Office2007 的处理，显示最后的选取色
//        updateState: function() {
//            var doc = this.editor.contentDoc,
//                name = this.name, t, val;
//
//            if(name == "backColor" && UA.gecko) name = "hiliteColor";
//
//            try {
//                if (doc.queryCommandEnabled(name)) {
//                    t = doc.queryCommandValue(name);
//
//                    if(isIE && typeof t == "number") { // ie下，对于 backColor, 有时返回 int 格式，有时又会直接返回 hex 格式
//                        t = E.Color.int2hex(t);
//                    }
//                    if (t === "transparent") t = ""; // 背景色为透明色时，取默认色
//                    if(t === "rgba(0, 0, 0, 0)") t = ""; // webkit 的背景色是 rgba 的
//
//                    val = t ? E.Color.toHex(t) : this._getDefaultColor(); // t 为空字符串时，表示点击在空行或尚未设置样式的地方
//                    if (val && val != this.color) {
//                        this.color = val;
//                        this._updateIndicatorColor(val);
//                    }
//                }
//            } catch(ex) {
//            }
//        },

        _getDefaultColor: function() {
            return (this.name == "foreColor") ? "#000000" : "#ffffff";
        }
    });

});

// TODO
//  1. 仿 google, 对键盘事件的支持

KISSY.Editor.add("plugins~font", function(E) {

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event,
        UA = YAHOO.env.ua,
        TYPE = E.PLUGIN_TYPE,

        OPTION_ITEM_HOVER_CLS = "ks-editor-option-hover",
        SELECT_TMPL = '<ul class="ks-editor-select-list">{LI}</ul>',
        OPTION_TMPL = '<li class="ks-editor-option" data-value="{VALUE}">' +
                          '<span class="ks-editor-option-checkbox"></span>' +
                          '<span style="{STYLE}">{KEY}</span>' +
                      '</li>',
        OPTION_SELECTED = "ks-editor-option-selected",
        WEBKIT_FONT_SIZE = {
            "10px" : 1,
            "13px" : 2,
            "16px" : 3,
            "18px" : 4,
            "24px" : 5,
            "32px" : 6,
            "48px" : 7
        };

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
         * 下拉列表项
         */
        items: null,

        /**
         * 选中的项
         */
        selectedItem: null,

        /**
         * 选中区域对象
         */
        range: null,

        /**
         * 初始化
         */
        init: function() {
            this.options = this.lang.options;
            this.selectHead = this.domEl.getElementsByTagName("span")[0];

            this._renderUI();
            this._bindUI();
        },

        _renderUI: function() {
            // 初始化下拉框 DOM
            this.selectList = E.Menu.generateDropMenu(this.editor, this.domEl, [1, 0]);
            this._renderSelectList();
            this.items = this.selectList.getElementsByTagName("li");
        },

        _bindUI: function() {
            // 注册选取事件
            this._bindPickEvent();

            Event.on(this.domEl, "click", function() {
                // 保存 range, 以便还原
                this.range = this.editor.getSelectionRange();

                // 聚集到按钮上，隐藏光标，否则 ie 下光标会显示在层上面
                // 注：通过 blur / focus 等方式在 ie7- 下无效
                UA.ie && this.editor.contentDoc.selection.empty();

                // 更新下拉框中的选中项
                if(this.selectedValue) {
                    this._updateSelectedOption(this.selectedValue);
                } else if(this.selectedItem) {
                    Dom.removeClass(this.selectedItem, OPTION_SELECTED);
                    this.selectedItem = null;
                }
                
            }, this, true);
        },

        /**
         * 初始化下拉框 DOM
         */
        _renderSelectList: function() {
            var htmlCode = "", options = this.options,
                key, val;

            for(key in options) {
                val = options[key];

                htmlCode += OPTION_TMPL
                        .replace("{VALUE}", val)
                        .replace("{STYLE}", this._getOptionStyle(key, val))
                        .replace("{KEY}", key);
            }

            // 添加到 DOM 中
            this.selectList.innerHTML = SELECT_TMPL.replace("{LI}", htmlCode);

            // 添加个性化 class
            Dom.addClass(this.selectList, "ks-editor-drop-menu-" + this.name);
        },

        /**
         * 绑定取色事件
         */
        _bindPickEvent: function() {
            var self = this;

            Event.on(this.selectList, "click", function(ev) {
                var target = Event.getTarget(ev);

                if(target.nodeName != "LI") {
                    target = Dom.getAncestorByTagName(target, "li");
                }
                if(!target) return;

                self._doAction(target.getAttribute("data-value"));

                // 关闭悬浮框
                Event.stopPropagation(ev);
                E.Menu.hideActiveDropMenu(self.editor);
                // 注：在这里阻止掉事件冒泡，自己处理对话框的关闭，是因为
                // 在 Firefox 下，当执行 doAction 后，doc 获取到 click
                // 触发 updateState 时，还获取不到当前的颜色值。
                // 这样做，对性能也有好处，这种情况下不需要更新 updateState
            });

            // ie6 下，模拟 hover
            if(UA.ie === 6) {
                Event.on(this.items, "mouseenter", function() {
                    Dom.addClass(this, OPTION_ITEM_HOVER_CLS);
                });
                Event.on(this.items, "mouseleave", function() {
                    Dom.removeClass(this, OPTION_ITEM_HOVER_CLS);
                });
            }
        },

        /**
         * 执行操作
         */
        _doAction: function(val) {
            if(!val) return;

            this.selectedValue = val;

            // 更新当前值
            this._setOption(val);

            // 还原选区
            var range = this.range;
            if(UA.ie && range.select) range.select();

            // 执行命令
            this.editor.execCommand(this.name, this.selectedValue);
        },

        /**
         * 选中某一项
         */
        _setOption: function(val) {
            // 更新头部
            this._updateHeadText(this._getOptionKey(val));

            // 更新列表选中项
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
                if(options[key] == val) {
                    return key;
                }
            }
            return null;
        },

        _updateHeadText: function(val) {
            this.selectHead.innerHTML = val;
        },

        /**
         * 更新下拉框的选中项
         */
        _updateSelectedOption: function(val) {
            var items = this.items,
                i, len = items.length, item;

            for(i = 0; i < len; ++i) {
                item = items[i];

                if(item.getAttribute("data-value") == val) {
                    Dom.addClass(item, OPTION_SELECTED);
                    this.selectedItem = item;
                } else {
                    Dom.removeClass(item, OPTION_SELECTED);
                }
            }
        },

        /**
         * 更新按钮状态
         */
        updateState: function() {
            var doc = this.editor.contentDoc,
                options = this.options,
                name = this.name, key, val;

            try {
                if (doc.queryCommandEnabled(name)) {
                    val = doc.queryCommandValue(name);

                    if(UA.webkit && name == "fontSize") {
                        val = this._getWebkitFontSize(val);
                    }
                    
                    val && (key = this._getOptionKey(val));
                    //console.log(key + " : " + val);

                    if (key in options) {
                        if(val != this.selectedValue) {
                            this.selectedValue = val;
                            this._updateHeadText(key);
                        }
                    } else {
                        this.selectedValue = "";
                        this._updateHeadText(this.lang.text);
                    }
                }

            } catch(ex) {
            }
        },

        _getWebkitFontSize: function(val) {
            if(val in WEBKIT_FONT_SIZE) return WEBKIT_FONT_SIZE[val];
            return null;
        }
    });

});

// TODO
//  1. 仿 google, 对键盘事件的支持
//  3. ie 下接管，否则光标处于某标签内，改变字体时，改变的是整段标签的字体

KISSY.Editor.add("plugins~image", function(E) {

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Connect = Y.Connect, Lang = YAHOO.lang,
        UA = YAHOO.env.ua,
        isIE = UA.ie,
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
                              '<input type="file" size="40" name="imgFile" unselectable="on" />',
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
                filter: "png|gif|jpg|jpeg",
                filterMsg: "", // 默认为 this.lang.upload_filter
                enableXdr: false,
                connectionSwf: "http://a.tbcdn.cn/yui/2.8.0r4/build/connection/connection.swf",
                formatResponse: function(data) {
                    var ret = [];
                    for (var key in data) ret.push(data[key]);
                    return ret;
                },
                extraCode: ""
            }
        };

    E.addPlugin("image", {

        /**
         * 种类：按钮
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
            defaultConfig.upload.filterMsg = this.lang["upload_filter"];
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
                return (key in lang) ? lang[key] : key;
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
                return (key in lang) ? lang[key] : key;
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

                // ie6 下，需更新 iframe shim
                if(UA.ie === 6) E.Menu._updateShimRegion(self.dialog);

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
                if(UA.ie === 6) E.Menu._updateShimRegion(this.dialog); // ie6 下，还需更新 iframe shim

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

            // 还原焦点
            this.editor.contentWin.focus();
        },

        /**
         * 更新界面上的表单值
         */
        _syncUI: function() {
            // 保存 range, 以便还原
            this.range = E.Range.saveRange(this.editor);

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
        _insertImage: function(url, alt) {
            url = Lang.trim(url);

            // url 为空时，不处理
            if (url.length === 0) {
                return;
            }

            var editor = this.editor,
                range = this.range;

            // 插入图片
            if (window.getSelection) { // W3C
                var img = editor.contentDoc.createElement("img");
                img.src = url;
                if(alt) img.setAttribute("alt", alt);

                range.deleteContents(); // 清空选中内容
                range.insertNode(img); // 插入图片

                // 使得连续插入图片时，添加在后面
                if(UA.webkit) {
                    var selection = editor.contentWin.getSelection();
                    selection.addRange(range);
                    selection.collapseToEnd();
                } else {
                    range.setStartAfter(img);
                }

                editor.contentWin.focus(); // 显示光标

            } else if(document.selection) { // IE
                // 还原焦点
                editor.contentWin.focus();

                if("text" in range) { // TextRange
                    range.select(); // 还原选区

                    var html = '<img src="' + url + '"';
                    alt && (html += ' "alt="' + alt + '"');
                    html += '>';
                    range.pasteHTML(html);

                } else { // ControlRange
                    range.execCommand("insertImage", false, url);
                }
            }
        }
    });

 });

/**
 * NOTES:
 *   - <input type="file" unselectable="on" /> 这一行，折腾了一下午。如果不加 unselectable, 会导致 IE 下
 *     焦点丢失（range.select() 和 contentDoc.focus() 不管用）。加上后，顺利解决。同时还自动使得 IE7- 下不可
 *     输入。
 *
 * TODO:
 *   - 跨域支持
 */

KISSY.Editor.add("plugins~indent", function(E) {

    var //Y = YAHOO.util, Dom = Y.Dom, Lang = YAHOO.lang,
        TYPE = E.PLUGIN_TYPE,
        //UA = YAHOO.env.ua,

//        INDENT_ELEMENTS = Lang.merge(E.Dom.BLOCK_ELEMENTS, {
//            li: 0 // 取消 li 元素的单独缩进，让 ol/ul 整体缩进
//        }),
//        INDENT_STEP = "40",
//        INDENT_UNIT = "px",

        plugin = {
            /**
             * 种类：普通按钮
             */
            type: TYPE.TOOLBAR_BUTTON,

            /**
             * 响应函数
             */
            exec: function() {
                // 执行命令
                this.editor.execCommand(this.name);

                // 更新状态
                // 缩进时，可能会干掉 list 等状态
                this.editor.toolbar.updateState();
            }
        };

    // 注：ie 下，默认使用 blockquote 元素来实现缩进
    // 下面采用自主操作 range 的方式来实现，以保持和其它浏览器一致
    // ie 下，暂时依旧用默认的
//    if (UA.ie) {
//
//        plugin.exec = function() {
//            var range = this.editor.getSelectionRange(),
//                parentEl, indentableAncestor;
//
//            if(range.parentElement) { // TextRange
//                parentEl = range.parentElement();
//            } else if(range.item) { // ControlRange
//                parentEl = range.item(0);
//            } else { // 不做任何处理
//                return;
//            }
//
//            // TODO: 和 CKEditor 一样，完全实现多区域的 iterator
//            // 下面用 blockquote 临时解决最常见的选区的多个块的父级元素刚好是body的情景
//            // 注意：要求 blockquote 的样式为缩进样式
//            if(parentEl === this.editor.contentDoc.body) {
//                this.editor.execCommand(this.name);
//                return;
//            }
//            // end of 临时解决方案
//
//            // 获取可缩进的父元素
//            if (isIndentableElement(parentEl)) {
//                 indentableAncestor = parentEl;
//            } else {
//                 indentableAncestor = getIndentableAncestor(parentEl);
//            }
//
//            // 设置 margin-left
//            if (indentableAncestor) {
//                var val = parseInt(indentableAncestor.style.marginLeft) >> 0;
//                val += (this.name === "indent" ? +1 : -1) * INDENT_STEP;
//
//                indentableAncestor.style.marginLeft = val + INDENT_UNIT;
//            }
//
//            /**
//             * 获取可缩进的父元素
//             */
//            function getIndentableAncestor(el) {
//                return Dom.getAncestorBy(el, function(elem) {
//                    return isIndentableElement(elem);
//                });
//            }
//
//            /**
//             * 判断是否可缩进元素
//             */
//            function isIndentableElement(el) {
//                return INDENT_ELEMENTS[el.nodeName.toLowerCase()];
//            }
//        };
//    }

    // 注册插件
    E.addPlugin(["indent", "outdent"], plugin);
 });

/**
 * NOTES:
 * 
 *  - 要想完全接管 ie 的默认实现，需要考虑的因素很多。比如：
 *     1. range 只含 inline 元素，上面的代码已实现
 *     2. range 含多个完整的块元素，这个需要实现一个 blockIterator
 *     3. range 含块元素和另一个块元素的部分，这个得需要实现一个 html parser 来协助
 *
 */

KISSY.Editor.add("plugins~justify", function(E) {

    var //Y = YAHOO.util, Dom = Y.Dom,
        TYPE = E.PLUGIN_TYPE,
        NAMES = ["justifyLeft", "justifyCenter", "justifyRight"],
        //UA = YAHOO.env.ua,

        //JUSTIFY_ELEMENTS = E.Dom.BLOCK_ELEMENTS,

        plugin = {
            /**
             * 种类：普通按钮
             */
            type: TYPE.TOOLBAR_BUTTON,

            /**
             * 响应函数
             */
            exec: function() {
                // 执行命令
                this.editor.execCommand(this.name);

                // 更新状态
                this.editor.toolbar.updateState(NAMES);
            }
        };

    // 注：ie 下，默认使用 align 属性来实现对齐
    // 下面采用自主操作 range 的方式来实现，以保持和其它浏览器一致
    // 注：选择区域有多个块时，下面的代码有问题 [Issue 4]
    // 暂时依旧用默认的浏览器命令
//    if (UA.ie) {
//
//        plugin.exec = function() {
//            var range = this.editor.getSelectionRange(),
//                parentEl, justifyAncestor;
//
//            if(range.parentElement) { // TextRange
//                parentEl = range.parentElement();
//            } else if(range.item) { // ControlRange
//                parentEl = range.item(0);
//            } else { // 不做任何处理
//                return;
//            }
//
//            // 获取可对齐的父元素
//            if (isJustifyElement(parentEl)) {
//                justifyAncestor = parentEl;
//            } else {
//                justifyAncestor = getJustifyAncestor(parentEl);
//            }
//
//            // 设置 text-align
//            if (justifyAncestor) {
//                justifyAncestor.style.textAlign = this.name.substring(7).toLowerCase();
//            }
//
//            /**
//             * 获取可设置对齐的父元素
//             */
//            function getJustifyAncestor(el) {
//                return Dom.getAncestorBy(el, function(elem) {
//                    return isJustifyElement(elem);
//                });
//            }
//
//            /**
//             * 判断是否可对齐元素
//             */
//            function isJustifyElement(el) {
//                return JUSTIFY_ELEMENTS[el.nodeName.toLowerCase()];
//            }
//        };
//    }


    // 注册插件
    E.addPlugin(NAMES, plugin);

});

KISSY.Editor.add("plugins~keystroke", function(E) {

    var Y = YAHOO.util, Event = Y.Event,
        UA = YAHOO.env.ua,
        TYPE = E.PLUGIN_TYPE;


    E.addPlugin("keystroke", {
        /**
         * 种类
         */
        type: TYPE.FUNC,

        /**
         * 初始化
         */
        init: function() {
            var editor = this.editor;

            // [bug fix] ie7- 下，按下 Tab 键后，光标还在编辑器中闪烁，并且回车提交无效
            if (UA.ie && UA.ie < 8) {
                Event.on(editor.contentDoc, "keydown", function(ev) {
                    if(ev.keyCode == 9) {
                        this.selection.empty();
                    }
                });
            }

            // Ctrl + Enter 提交
            var form = editor.textarea.form;
            if (form) {
                new YAHOO.util.KeyListener(
                        editor.contentDoc,
                        { ctrl: true, keys: 13 },
                        {
                            fn: function() {
                                    if (!editor.sourceMode) {
                                        editor.textarea.value = editor.getData();
                                    }
                                    form.submit();
                                }
                        }
                ).enable();
            }
        }

    });
 });

KISSY.Editor.add("plugins~link", function(E) {

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang,
        UA = YAHOO.env.ua, isIE = UA.ie,
        TYPE = E.PLUGIN_TYPE, Range = E.Range,
        timeStamp = new Date().getTime(),
        HREF_REG = /^\w+:\/\/.*|#.*$/,

        DIALOG_CLS = "ks-editor-link",
        NEW_LINK_CLS = "ks-editor-link-newlink-mode",
        BTN_OK_CLS = "ks-editor-btn-ok",
        BTN_CANCEL_CLS = "ks-editor-btn-cancel",
        BTN_REMOVE_CLS = "ks-editor-link-remove",
        DEFAULT_HREF = "http://",

        DIALOG_TMPL = ['<form onsubmit="return false"><ul>',
                          '<li class="ks-editor-link-href"><label>{href}</label><input name="href" style="width: 220px" value="http://" type="text" /></li>',
                          '<li class="ks-editor-link-target"><input name="target" id="target_"', timeStamp ,' type="checkbox" /> <label for="target_"', timeStamp ,'>{target}</label></li>',
                          '<li class="ks-editor-dialog-actions">',
                              '<button name="ok" class="', BTN_OK_CLS, '">{ok}</button>',
                              '<span class="', BTN_CANCEL_CLS ,'">{cancel}</span>',
                              '<span class="', BTN_REMOVE_CLS ,'">{remove}</span>',
                          '</li>',
                      '</ul></form>'].join("");

    E.addPlugin("link", {
        /**
         * 种类：按钮
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
         * 关联的 range 对象
         */
        range: null,

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

            // webkit 调用默认的 exeCommand, 需隐藏 target 设置
            UA.webkit && (this.form.target.parentNode.style.display = "none");

            isIE && E.Dom.setItemUnselectable(dialog);
        },

        /**
         * 绑定事件
         */
        _bindUI: function() {
            var form = this.form, self = this;

            // 显示/隐藏对话框时的事件
            Event.on(this.domEl, "click", function() {
                // 仅在显示时更新
                if(self.dialog.style.visibility === isIE ? "hidden" : "visible") { // 事件的触发顺序不同
                    self._syncUI();
                }
            });

            // 注册表单按钮点击事件
            Event.on(this.dialog, "click", function(ev) {
                var target = Event.getTarget(ev);

                switch(target.className) {
                    case BTN_OK_CLS:
                        self._createLink(form.href.value, form.target.checked);
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
            // 保存 range, 以便还原
            this.range = E.Range.saveRange(this.editor);

            var form = this.form, container, a;

            container = Range.getCommonAncestor(this.range);
            a = (container.nodeName == "A") ? container : Dom.getAncestorByTagName(container, "A");

            // 修改链接界面
            if(a) {
                form.href.value = a.href;
                form.target.checked = a.target === "_blank";
                Dom.removeClass(form, NEW_LINK_CLS);

            } else { // 新建链接界面
                form.href.value = DEFAULT_HREF;
                form.target.checked = false;
                Dom.addClass(form, NEW_LINK_CLS);
            }

            // 放在 setTimout 里，是 for ie
            setTimeout(function() {
                form.href.select();
            }, 50);
        },

        /**
         * 创建/修改链接
         */
        _createLink: function(href, target) {
            href = this._getValidHref(href);

            // href 为空时，移除链接
            if (href.length === 0) {
                this._unLink();
                return;
            }

            var range = this.range,
                div = document.createElement("div"),
                a, container, fragment;

            // 修改链接
            container = Range.getCommonAncestor(range);
            a = (container.nodeName == "A") ? container : Dom.getAncestorByTagName(container, "A");
            if (a) {
                a.href = href;
                if (target) a.setAttribute("target", "_blank");
                else a.removeAttribute("target");
                return;
            }

            // 创建链接
            a = document.createElement("a");
            a.href = href;
            if (target) a.setAttribute("target", "_blank");

            if (isIE) {
                if (range.select) range.select();
                
                if("text" in range) { // TextRange
                    a.innerHTML = range.htmlText || href;
                    div.innerHTML = "";
                    div.appendChild(a);
                    range.pasteHTML(div.innerHTML);
                } else { // ControlRange
                    // TODO: ControlRange 链接的 target 实现
                    this.editor.execCommand("createLink", href);
                }

            } else if(UA.webkit) { // TODO: https://bugs.webkit.org/show_bug.cgi?id=16867
                this.editor.execCommand("createLink", href);

            } else { // W3C
                if(range.collapsed) {
                    a.innerHTML = href;
                } else {
                    fragment = range.cloneContents();
                    while(fragment.firstChild) {
                        a.appendChild(fragment.firstChild);
                    }
                }
                range.deleteContents(); // 删除原内容
                range.insertNode(a); // 插入链接
                range.selectNode(a); // 选中链接
            }
        },

        _getValidHref: function(href) {
            href = Lang.trim(href);
            if(href && !HREF_REG.test(href)) { // 不为空 或 不符合标准模式 abcd://efg
               href = DEFAULT_HREF + href; // 添加默认前缀
            }
            return href;
        },

        /**
         * 移除链接
         */
        _unLink: function() {
            var editor = this.editor,
                range = this.range,
                selectedText = Range.getSelectedText(range),
                container = Range.getCommonAncestor(range),
                parentEl;

            // 没有选中文字时
            if (!selectedText && container.nodeType == 3) {
                parentEl = container.parentNode;
                if (parentEl.nodeName == "A") {
                    parentEl.parentNode.replaceChild(container, parentEl);
                }
            } else {
                if(range.select) range.select();
                editor.execCommand("unLink", null);
            }
        }
    });

 });

// TODO:
// 当选区包含链接/一部分包含链接时，生成的链接内容的调优处理。
// 目前只有 Google Docs 做了优化，其它编辑器都采用浏览器默认的处理方式。
// 先记于此，等以后优化。

/**
 * Notes:
 *  1. 在 ie 下，点击工具栏上的按钮时，会导致 iframe 编辑区域的 range 选区丢失。解决办法是：
 *     对所有元素添加 unselectable 属性。但是，对于 text input 框，为了能输入，不能有 unselectable
 *     属性。这就导致了矛盾。因此，权衡之后的解决办法是：在对话框弹出前，将 range 对象保存起来，
 *     丢失后，再通过 range.select() 选择回来。这基本上已经满足需求。
 *  2. 目前只有 CKEditor 和 TinyMCE 等完全接管命名的编辑器处理得很完美。但 1 的解决方案，目前已经
 *     够用，成本也很低。
 */
KISSY.Editor.add("plugins~resize", function(E) {

    var Y = YAHOO.util, Event = Y.Event,
        UA = YAHOO.env.ua,
        TYPE = E.PLUGIN_TYPE,

        TMPL = '<span class="ks-editor-resize-larger" title="{larger_title}">{larger_text}</span>'
             + '<span class="ks-editor-resize-smaller" title="{smaller_title}">{smaller_text}</span>';


    E.addPlugin("resize", {

        /**
         * 种类：状态栏插件
         */
        type: TYPE.STATUSBAR_ITEM,

        contentEl: null,

        currentHeight: 0,

        /**
         * 初始化
         */
        init: function() {
            this.contentEl = this.editor.container.childNodes[1];
            this.currentHeight = parseInt(this.contentEl.style.height);

            this.renderUI();
            this.bindUI();
        },

        renderUI: function() {
            var lang = this.lang;

            this.domEl.innerHTML = TMPL.replace(/\{([^}]+)\}/g, function(match, key) {
                            return lang[key] ? lang[key] : key;
                        });
        },

        bindUI: function() {
            var spans = this.domEl.getElementsByTagName("span"),
                largerEl = spans[0],
                smallerEl = spans[1],
                contentEl = this.contentEl;

            Event.on(largerEl, "click", function() {
                this.currentHeight += 100;
                this._doResize();
            }, this, true);

            Event.on(smallerEl, "click", function() {

                // 不能小于 0
                if (this.currentHeight < 100) {
                    this.currentHeight = 0;
                } else {
                    this.currentHeight -= 100;
                }

                this._doResize();
            }, this, true);
        },

        _doResize: function() {
            this.contentEl.style.height = this.currentHeight + "px";

            // 本来通过设置 textarea 的 height: 100% 自动就适应高度了
            // 但 ie7- 纯 css 方案有问题，因此干脆用下面这行 js 搞定
            this.editor.textarea.style.height = this.currentHeight + "px";
        }

    });

 });

/**
 * TODO:
 *   - 将全屏编辑也放入此处
 */
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
                        //var val = editor.getData();
                        // 统一样式  由后台控制
//                        if(val && val.indexOf('<div class="ks-editor-post">') !== 0) {
//                            val = '<div class="ks-editor-post">' + val + '</div>';
//                        }
                        textarea.value = editor.getData();
                    }
                });
            }
        },

        /**
         * 过滤数据
         */
        filterData: function(data) {

            data = data.replace(/<(\/?)([^>\s]+)([^>]*)>/g, function(m, slash, tag, attr) {

                // 将 ie 的大写标签转换为小写
                tag = tag.toLowerCase();

                // 让标签语义化
                var map = TAG_MAP[tag],
                    ret = tag;

                // 仅针对 <tag> 这种不含属性的标签做进一步处理
                if(map && !attr) {
                    ret = map["tag"];
                    if(!slash && map["style"]) {
                        ret += ' style="' + map["style"] + '"';
                    }
                }

                return "<" + slash + ret + attr + ">";
            });

            // 过滤 word 的垃圾数据
            if(data.indexOf("mso") > 0) {
                data = this.filterWord(data);
            }

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
        },

        /**
         * 过滤 word 粘贴过来的垃圾数据
         * Ref: CKEditor - pastefromword plugin
         */
        filterWord: function(html) {

            // Remove onmouseover and onmouseout events (from MS Word comments effect)
            html = html.replace(/<(\w[^>]*) onmouseover="([^\"]*)"([^>]*)/gi, "<$1$3");
            html = html.replace(/<(\w[^>]*) onmouseout="([^\"]*)"([^>]*)/gi, "<$1$3");

            // The original <Hn> tag send from Word is something like this: <Hn style="margin-top:0px;margin-bottom:0px">
            html = html.replace(/<H(\d)([^>]*)>/gi, "<h$1>");

            // Word likes to insert extra <font> tags, when using MSIE. (Wierd).
            html = html.replace(/<(H\d)><FONT[^>]*>([\s\S]*?)<\/FONT><\/\1>/gi, "<$1>$2<\/$1>");
            html = html.replace(/<(H\d)><EM>([\s\S]*?)<\/EM><\/\1>/gi, "<$1>$2<\/$1>");

            // Remove <meta xx...>
            html = html.replace(/<meta[^>]*>/ig, "");

            // Remove <link rel="xx" href="file:///...">
            html = html.replace(/<link rel="\S+" href="file:[^>]*">/ig, "");

            // Remove <!--[if gte mso 9|10]>...<![endif]-->
            html = html.replace(/<!--\[if gte mso [0-9]{1,2}\]>[\s\S]*?<!\[endif\]-->/ig, "");

            // Remove <style> ...mso...</style>
            html = html.replace(/<style>[\s\S]*?mso[\s\S]*?<\/style>/ig, "");

            // Remove lang="..."
            html = html.replace(/ lang=".+?"/ig, "");

            // Remove <o:p></o:p>
            html = html.replace(/<o:p><\/o:p>/ig, "");

            // Remove class="MsoNormal"
            html = html.replace(/ class="Mso.+?"/ig, "");

            return html;
        }

    });
 });

KISSY.Editor.add("plugins~smiley", function(E) {

    var Y = YAHOO.util, Event = Y.Event, Lang = YAHOO.lang,
        UA = YAHOO.env.ua,
        TYPE = E.PLUGIN_TYPE,

        DIALOG_CLS = "ks-editor-smiley-dialog",
        ICONS_CLS = "ks-editor-smiley-icons",
        SPRITE_CLS = "ks-editor-smiley-sprite",

        defaultConfig = {
                tabs: ["default"]
            };

    E.addPlugin("smiley", {
        /**
         * 种类：按钮
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
         * 关联的 range 对象
         */
        range: null,

        /**
         * 初始化函数
         */
        init: function() {
            this.config = Lang.merge(defaultConfig, this.editor.config.pluginsConfig[this.name] || {});

            this._renderUI();
            this._bindUI();
        },

        /**
         * 初始化对话框界面
         */
        _renderUI: function() {
            var dialog = E.Menu.generateDropMenu(this.editor, this.domEl, [1, 0]);

            dialog.className += " " + DIALOG_CLS;
            this.dialog = dialog;
            this._renderDialog();

            if(UA.ie) E.Dom.setItemUnselectable(dialog);
        },

        _renderDialog: function() {
            var smileyConfig = E.Smilies[this.config["tabs"][0]], // TODO: 支持多个 tab
                mode = smileyConfig["mode"];

            if(mode === "icons") this._renderIcons(smileyConfig);
            else if(mode === "sprite") this._renderSprite(smileyConfig);

        },

        _renderIcons: function(config) {
            var base = this.editor.config.base + "smilies/" + config["name"] + "/",
                fileNames = config["fileNames"],
                fileExt = "." + config["fileExt"],
                cols = config["cols"],
                htmlCode = [],
                i, len = fileNames.length, name;

            htmlCode.push('<div class="' + ICONS_CLS + '">');
            for(i = 0; i < len; i++) {
                name = fileNames[i];

                htmlCode.push(
                        '<img src="' + base +  name + fileExt
                        + '" alt="' + name
                        + '" title="' + name
                        + '" />');

                if(i % cols === cols - 1) htmlCode.push("<br />");
            }
            htmlCode.push('</div');

            this.dialog.innerHTML = htmlCode.join("");
        },

        _renderSprite: function(config) {
            var base = config.base,
                filePattern = config["filePattern"],
                fileExt = "." + config["fileExt"],
                len = filePattern.end + 1,
                step = filePattern.step,
                i, code = [];

            code.push('<div class="' + SPRITE_CLS + ' ks-clearfix" style="' + config["spriteStyle"] + '">');
            for(i = 0; i < len; i += step) {
                code.push(
                        '<span data-icon="' + base +  i + fileExt
                        + '" style="' + config["unitStyle"] + '"></span>');
            }
            code.push('</div');

            this.dialog.innerHTML = code.join("");
        },

        /**
         * 绑定事件
         */
        _bindUI: function() {
            var self = this;

            // range 处理
            Event.on(this.domEl, "click", function() {
                self.range = E.Range.saveRange(self.editor);
            });

            // 注册表单按钮点击事件
            Event.on(this.dialog, "click", function(ev) {
                var target = Event.getTarget(ev);

                switch(target.nodeName) {
                    case "IMG":
                        self._insertImage(target.src, target.getAttribute("alt"));
                        break;
                    case "SPAN":
                        self._insertImage(target.getAttribute("data-icon"), "");
                        break;
                    default: // 点击在非按钮处，停止冒泡，保留对话框
                        Event.stopPropagation(ev);
                }
            });
        },

        /**
         * 插入图片
         */
        _insertImage: function(url, alt) {
            url = Lang.trim(url);

            // url 为空时，不处理
            if (url.length === 0) {
                return;
            }

            var editor = this.editor,
                range = this.range;

            // 插入图片
            if (window.getSelection) { // W3C
                var img = editor.contentDoc.createElement("img");
                img.src = url;
                img.setAttribute("alt", alt);

                range.deleteContents(); // 清空选中内容
                range.insertNode(img); // 插入图片

                // 使得连续插入图片时，添加在后面
                if(UA.webkit) {
                    var selection = editor.contentWin.getSelection();
                    selection.addRange(range);
                    selection.collapseToEnd();
                } else {
                    range.setStartAfter(img);
                }

                editor.contentWin.focus(); // 显示光标

            } else if(document.selection) { // IE
                if("text" in range) { // TextRange
                    range.pasteHTML('<img src="' + url + '" alt="' + alt + '" />');

                } else { // ControlRange
                    editor.execCommand("insertImage", url);
                }
            }
        }
    });

 });

/**
 * NOTES:
 *   - Webkit 下，不能将一个 document 内创建的 dom 节点移动到另一个 document
 *     http://www.codingforums.com/archive/index.php/t-153219.html 
 */
// TODO:
//  1. 多套表情支持
//  2. 表情的多国语言支持，包括 alt 和 title 信息

KISSY.Editor.add("plugins~source", function(E) {

    var Y = YAHOO.util, Dom = Y.Dom,
        UA = YAHOO.env.ua,
        TYPE = E.PLUGIN_TYPE,

        TOOLBAR_BUTTON_SELECTED = "ks-editor-toolbar-button-selected",
        SRC_MODE_CLS = "ks-editor-src-mode";

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

            // 添加 class
            Dom.addClass(this.domEl, "ks-editor-toolbar-source-button");
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

            // [bug fix] ie7-下，切换到源码时，iframe 的光标还可见，需隐藏掉
            if(UA.ie && UA.ie < 8) {
                editor.contentDoc.selection.empty();
            }

            // 切换显示
            this.textarea.style.display = srcOn ? "none" : "";
            this.iframe.style.display = srcOn ? "" : "none";

            // 更新状态
            editor.sourceMode = !srcOn;

            // 更新按钮状态
            this._updateButtonState();
        },

        /**
         * 更新按钮状态
         */
        _updateButtonState: function() {
            var editor = this.editor,
                srcOn = editor.sourceMode;

            if(srcOn) {
                Dom.addClass(editor.container, SRC_MODE_CLS);
                Dom.addClass(this.domEl, TOOLBAR_BUTTON_SELECTED);
            } else {
                Dom.removeClass(editor.container, SRC_MODE_CLS);
                Dom.removeClass(this.domEl, TOOLBAR_BUTTON_SELECTED);
            }
        }

    });

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
            // TODO 接管
            this.editor.execCommand(this.name);
        }
    });

 });

/**
 * TODO:
 *   - ie 下，只要有 dom 操作，undo 和 redo 就会失效。
 *     http://swik.net/qooxdoo/qooxdoo+news/Clashed+with+IE%E2%80%99s+execCommand/cj7g7
 */
KISSY.Editor.add("plugins~wordcount", function(E) {

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang,
        TYPE = E.PLUGIN_TYPE,
        ALARM_CLS = "ks-editor-wordcount-alarm",

        defaultConfig = {
            total       : 50000,
            threshold   : 100
        };

    E.addPlugin("wordcount", {

        /**
         * 种类：状态栏插件
         */
        type: TYPE.STATUSBAR_ITEM,

        total: Infinity,

        remain: Infinity,

        threshold: 0,

        remainEl: null,

        /**
         * 初始化
         */
        init: function() {
            var config = Lang.merge(defaultConfig, this.editor.config.pluginsConfig[this.name] || {});
            this.total = config["total"];
            this.threshold = config["threshold"];

            this.renderUI();
            this.bindUI();

            // 确保更新字数在内容加载完成后
            var self = this;
            setTimeout(function() {
                self.syncUI();
            }, 50);
        },

        renderUI: function() {
            this.domEl.innerHTML = this.lang["tmpl"]
                    .replace("%remain%", "<em>" + this.total + "</em>");

            this.remainEl = this.domEl.getElementsByTagName("em")[0];
        },

        bindUI: function() {
            var editor = this.editor;

            Event.on(editor.textarea, "keyup", this.syncUI, this, true);

            Event.on(editor.contentDoc, "keyup", this.syncUI, this, true);
            // TODO: 插入链接/表情等有问题
            Event.on(editor.container, "click", this.syncUI, this, true);
        },

        syncUI: function() {
            this.remain = this.total - this.editor.getData().length;
            this.remainEl.innerHTML = this.remain;

            if(this.remain <= this.threshold) {
                Dom.addClass(this.domEl, ALARM_CLS);
            } else {
                Dom.removeClass(this.domEl, ALARM_CLS);
            }
        }
    });

 });

/**
 * TODO:
 *   - 考虑 GBK 编码下，一个中文字符长度为 2
 */