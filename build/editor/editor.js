/*
Copyright 2010, KISSY UI Library v1.0.8
MIT Licensed
build: 846 Jul 11 00:09
*/
/**
 * @module kissy
 * @author lifesinger@gmail.com
 */
(function(win, S, undefined) {

    // If KISSY is already defined, the existing KISSY object will not
    // be overwritten so that defined namespaces are preserved.
    if (win[S] === undefined) win[S] = {};
    S = win[S]; // shortcut

    var doc = win.document,

        // Copies all the properties of s to r
        mix = function(r, s, ov, wl) {
            if (!s || !r) return r;
            if (ov === undefined) ov = true;
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
        },

        // Is the DOM ready to be used? Set to true once it occurs.
        isReady = false,

        // The functions to execute on DOM ready.
        readyList = [],

        // Has the ready events already been bound?
        readyBound = false,

        //global id control
        _id=0;

    mix(S, {
        /**
         * return global unique id
         */
        id:function(){
            return (_id++);
        },
        /**
         * The version of the library.
         * @type {String}
         */
        version: '1.0.8',

        /**
         * Initializes KISSY object.
         * @private
         */
        _init: function() {
            // Env 对象目前仅用于内部，为模块动态加载预留接口
            this.Env = { mods: {} };
        },

        /**
         * Registers a module.
         * @param name {String} module name
         * @param fn {Function} entry point into the module that is used to bind module to KISSY
         * <code>
         * KISSY.add('module-name', function(S){ });
         * </code>
         * @return {KISSY}
         */
        add: function(name, fn) {
            var self = this;

            // override mode
            self.Env.mods[name] = {
                name: name,
                fn: fn
            };

            // call entry point immediately
            fn(self);

            // chain support
            return self;
        },

        /**
         * Specify a function to execute when the DOM is fully loaded.
         * @param fn {Function} A function to execute after the DOM is ready
         * <code>
         * KISSY.ready(function(S){ });
         * </code>
         * @return {KISSY}
         */
        ready: function(fn) {
            // Attach the listeners
            if (!readyBound) this._bindReady();

            // If the DOM is already ready
            if (isReady) {
                // Execute the function immediately
                fn.call(win, this);
            } else {
                // Remember the function for later
                readyList.push(fn);
            }

            return this;
        },

        /**
         * Binds ready events.
         */
        _bindReady: function() {
            var self = this,
                doScroll = doc.documentElement.doScroll,
                eventType = doScroll ? 'onreadystatechange' : 'DOMContentLoaded',
                COMPLETE = 'complete',
                fire = function() {
                    self._fireReady();
                };

            // Set to true once it runs
            readyBound = true;

            // Catch cases where ready() is called after the
            // browser event has already occurred.
            if (doc.readyState === COMPLETE) {
                return fire();
            }

            // w3c mode
            if (doc.addEventListener) {
                function domReady() {
                    doc.removeEventListener(eventType, domReady, false);
                    fire();
                }
                doc.addEventListener(eventType, domReady, false);
            }
            // IE event model is used
            else {
                function stateChange() {
                    if (doc.readyState === COMPLETE) {
                        doc.detachEvent(eventType, stateChange);
                        fire();
                    }
                }

                // ensure firing before onload, maybe late but safe also for iframes
                doc.attachEvent(eventType, stateChange);

                // A fallback to window.onload, that will always work.
                win.attachEvent('onload', fire);

                if (win == win.top) { // not an iframe
                    function readyScroll() {
                        try {
                            // Ref: http://javascript.nwbox.com/IEContentLoaded/
                            doScroll('left');
                            fire();
                        } catch(ex) {
                            setTimeout(readyScroll, 1);
                        }
                    }
                    readyScroll();
                }
            }
        },

        /**
         * Executes functions bound to ready event.
         */
        _fireReady: function() {
            if(isReady) return;
            
            // Remember that the DOM is ready
            isReady = true;

            // If there are functions bound, to execute
            if (readyList) {
                // Execute all of them
                var fn, i = 0;
                while (fn = readyList[i++]) {
                    fn.call(win, this);
                }

                // Reset the list of functions
                readyList = null;
            }
        },

        /**
         * Copies all the properties of s to r.
         * @return {Object} the augmented object
         */
        mix: mix,

        /**
         * Returns a new object containing all of the properties of
         * all the supplied objects. The properties from later objects
         * will overwrite those in earlier objects. Passing in a
         * single object will create a shallow copy of it.
         * @return {Object} the new merged object
         */
        merge: function() {
            var o = {}, i, l = arguments.length;
            for (i = 0; i < l; ++i) {
                mix(o, arguments[i]);
            }
            return o;
        },

        /**
         * Applies prototype properties from the supplier to the receiver.
         * @return {Object} the augmented object
         */
        augment: function(/*r, s1, s2, ..., ov, wl*/) {
            var args = arguments, len = args.length - 2,
                r = args[0], ov = args[len], wl = args[len + 1],
                i = 1;
            
            if(!S.isArray(wl)) {
                ov = wl;
                wl = undefined;
                len++;
            }

            if(!S.isBoolean(ov)) {
                ov = undefined;
                len++;
            }

            for(; i < len; i++) {
                mix(r.prototype, args[i].prototype || args[i], ov, wl);
            }

            return r;
        },

        /**
         * Utility to set up the prototype, constructor and superclass properties to
         * support an inheritance strategy that can chain constructors and methods.
         * Static members will not be inherited.
         * @param r {Function} the object to modify
         * @param s {Function} the object to inherit
         * @param px {Object} prototype properties to add/override
         * @param sx {Object} static properties to add/override
         * @return r {Object}
         */
        extend: function(r, s, px, sx) {
            if (!s || !r) return r;

            var OP = Object.prototype,
                O = function (o) {
                        function F() {}
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
         * Returns the namespace specified and creates it if it doesn't exist. Be careful
         * when naming packages. Reserved words may work in some browsers and not others.
         * <code>
         * S.namespace('KISSY.app'); // returns KISSY.app
         * S.namespace('app.Shop'); // returns KISSY.app.Shop
         * </code>
         * @return {Object}  A reference to the last namespace object created
         */
        namespace: function() {
            var l = arguments.length, o = null, i, j, p;

            for (i = 0; i < l; ++i) {
                p = ('' + arguments[i]).split('.');
                o = this;
                for (j = (win[p[0]] === o) ? 1 : 0; j < p.length; ++j) {
                    o = o[p[j]] = o[p[j]] || {};
                }
            }
            return o;
        },

        /**
         * create app based on KISSY.
         * @param name {String} the app name
         * @param sx {Object} static properties to add/override
         * <code>
         * S.app('TB');
         * TB.namespace('app'); // returns TB.app
         * </code>
         * @return {Object}  A reference to the app global object
         */
        app: function(name, sx) {
            var O = win[name] || {};

            mix(O, this, true, ['_init', 'add', 'namespace']);
            O._init();

            return mix((win[name] = O), typeof sx === 'function' ? sx() : sx);
        },

        /**
         * Prints debug info.
         * @param msg {String} the message to log.
         * @param cat {String} the log category for the message. Default
         *        categories are "info", "warn", "error", "time" etc.
         * @param src {String} the source of the the message (opt)
         * @return {KISSY}
         */
        log: function(msg, cat, src) {
            if (this.Config.debug) {
                if(src) {
                    msg = src + ': ' + msg;
                }
                if (win['console'] !== undefined && console.log) {
                    console[cat && console[cat] ? cat : 'log'](msg);
                }
            }
            return this;
        },

        /**
         * Throws error message.
         */
        error: function(msg) {
            if(this.Config.debug) {
                throw msg;
            }
        }
    });

    S._init();

    // build 时，会将 @DEBUG@ 替换为空
    S.Config = { debug: '@DEBUG@' };

})(window, 'KISSY');

/**
 * NOTES:
 *
 * 2010.04
 *  - 移除掉 weave 方法，尚未考虑周全。
 *
 * 2010.01
 *  - add 方法决定内部代码的基本组织方式（用 module 和 submodule 来组织代码）。
 *  - ready 方法决定外部代码的基本调用方式，提供了一个简单的弱沙箱。
 *  - mix, merge, augment, extend 方法，决定了类库代码的基本实现方式，充分利用 mixin 特性和 prototype 方式来实现代码。
 *  - namespace, app 方法，决定子库的实现和代码的整体组织。
 *  - log, error 方法，简单的调试工具和报错机制。
 *  - 考虑简单够用和 2/8 原则，去掉对 YUI3 沙箱的模拟。（archives/2009 r402）
 *
 * TODO:
 *  - 模块动态加载 require 方法的实现。
 * 
 */
/**
 * KISSY.Editor ���ı��༭��
 * @module      editor
 * @creator     ��<lifesinger@gmail.com>
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
         * �汾��
         */
        version: "1.0",

        /**
         * �������ã��� lang Ŀ¼���
         */
        lang: {},

        /**
         * ����ע��Ĳ��
         * ע��plugin = { name: pluginName, type: pluginType, init: initFn, ... }
         */
        plugins: {},

        /**
         * ȫ�ֻ�������
         */
        Env: {
            /**
             * ������ӵ�ģ��
             * ע��mod = { name: modName, fn: initFn, details: {...} }
             */
            mods: { }
        },

        /**
         * ���ģ��
         */
        add: function(name, fn, details) {

            this.Env.mods[name] = {
                name: name,
                fn: fn,
                details: details || {}
            };

            return this; // chain support
        },

        /**
         * ��Ӳ��
         * @param {string|Array} name
         */
        addPlugin: function(name, p) {
            var arr = typeof name == "string" ? [name] : name,
                plugins = this.plugins,
                key, i, len;

            for (i = 0,len = arr.length; i < len; ++i) {
                key = arr[i];

                if (!plugins[key]) { // �����?��
                    plugins[key] = S.merge(p, {
                        name: key
                    });
                }
            }
        },

        /**
         * �Ƿ������ setup
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
         * �Ѽ��ص�ģ��
         */
        _attached: { },

        /**
         * ����ע�������ģ��
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
                // ע�⣺m.details ��ʱû�õ�������Ԥ������չ�ӿ�
            }

            // TODO
            // lang �ļ��ؿ����ӳٵ�ʵ��ʱ��ֻ���ص�ǰ lang
        }
    });

    S.Editor = Editor;
});

// TODO
// 1. �Զ��滻ҳ���е� textarea ? Լ�������� class �Ĳ��滻

KISSY.Editor.add("config", function(E) {

    E.config = {
        /**
         * ��·��
         */
        base: "",

        /**
         * ����
         */
        language: "zh-cn",

        /**
         * ����
         */
        theme: "default",

        /**
         * Toolbar �Ϲ��ܲ��
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
         * Statusbar �ϵĲ��
         */
        statusbar: [
            "wordcount",
            "resize"
        ],

        /**
         * ���������
         */
        pluginsConfig: { }

        /**
         * �Զ��۽�
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
            upload_linkFilter : "The image link is not in our whitelist. Please upload as local image.",
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
          text            : "Դ��",
          title           : "Դ��"
        },
        undo: {
          text            : "����",
          title           : "����"
        },
        redo: {
          text            : "����",
          title           : "����"
        },
        fontName: {
          text            : "����",
          title           : "����",
          options         : {
              "����"             : "����",
              "����"             : "����",
              "����"             : "����",
              "����"             : "����_GB2312",
              //"��Բ"             : "��Բ",
              "΢���ź�"          : "΢���ź�",
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
          text            : "��С",
          title           : "��С",
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
            text          : "����",
            title         : "����"
        },
        italic: {
            text          : "б��",
            title         : "б��"
        },
        underline: {
            text          : "�»���",
            title         : "�»���"
        },
        strikeThrough: {
            text          : "ɾ����",
            title         : "ɾ����"
        },
        link: {
            text          : "����",
            title         : "����/�༭����",
            href          : "URL:",
            target        : "���´��ڴ�����",
            remove        : "�Ƴ�����"
        },
        blockquote: {
            text          : "����",
            title         : "����"
        },
        smiley: {
            text          : "����",
            title         : "�������"
        },
        image: {
            text          : "ͼƬ",
            title         : "����ͼƬ",
            tab_link      : "����ͼƬ",
            tab_local     : "�����ϴ�",
            tab_album     : "�ҵ����",
            label_link    : "������ͼƬ��ַ��",
            label_local   : "��ѡ�񱾵�ͼƬ��",
            label_album   : "��ѡ�����ͼƬ��",
            uploading     : "�����ϴ�...",
            upload_error  : "�Բ����ϴ��ļ�ʱ�����˴���",
            upload_filter : "��֧�� JPG, PNG �� GIF ͼƬ��������ѡ��",
            upload_linkFilter : "�Բ���ͼƬ������վ�������?Χ�ڡ�\n�����ص����أ���ͨ��\"�����ϴ�\"�ϴ�ͼƬ��",
            ok            : "����"
        },
        insertOrderedList: {
            text          : "�����б�",
            title         : "�����б�"
        },
        insertUnorderedList: {
            text          : "�����б�",
            title         : "�����б�"
        },
        outdent: {
            text          : "��������",
            title         : "��������"
        },
        indent: {
            text          : "��������",
            title         : "��������"
        },
        justifyLeft: {
            text          : "�����",
            title         : "�����"
        },
        justifyCenter: {
            text          : "���ж���",
            title         : "���ж���"
        },
        justifyRight: {
            text          : "�Ҷ���",
            title         : "�Ҷ���"
        },
        foreColor: {
            text          : "�ı���ɫ",
            title         : "�ı���ɫ"
        },
        backColor: {
            text          : "������ɫ",
            title         : "������ɫ"
        },
        maximize: {
          text            : "ȫ���༭",
          title           : "ȫ���༭"
        },
        removeformat: {
          text            : "����ʽ",
          title           : "����ʽ"
        },
        wordcount: {
          tmpl            : "���������� %remain% �֣��� html ���룩"
        },
        resize: {
            larger_text   : "����",
            larger_title  : "����༭����",
            smaller_text  : "��С",
            smaller_title : "��С�༭����"
        },

        // Common messages and labels
        common: {
            ok            : "ȷ��",
            cancel        : "ȡ��"
        }
    };

});

KISSY.Editor.add("core~plugin", function(E) {

    /**
     * �������
     */
    E.PLUGIN_TYPE = {
        CUSTOM: 0,
        TOOLBAR_SEPARATOR: 1,
        TOOLBAR_BUTTON: 2,
        TOOLBAR_MENU_BUTTON: 4,
        TOOLBAR_SELECT: 8,
        STATUSBAR_ITEM: 16,
        FUNC: 32 // ���������ʲ������ UI
    };

});

KISSY.Editor.add("core~dom", function(E) {

    var UA = YAHOO.env.ua;

    E.Dom = {

        /**
         * ��ȡԪ�ص��ı�����
         */
        getText: function(el) {
            return el ? (el.textContent || '') : '';
        },

        /**
         * ��Ԫ�ز���ѡ����� ie �� selection ��ʧ������
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

            /* �ṹԪ�� */
            blockquote:1,
            div:1,
            h1:1,h2:1,h3:1,h4:1,h5:1,h6:1,
            hr:1,
            p:1,

            /* �ı���ʽԪ�� */
            address:1,
            center:1,
            pre:1,

            /* �?Ԫ�� */
            form:1,
            fieldset:1,
            caption:1,

            /* ���Ԫ�� */
            table:1,
            tbody:1,
            tr:1, th:1, td:1,

            /* �б�Ԫ�� */
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
         * ִ�� doc.execCommand
         */
        exec: function(doc, cmdName, val, styleWithCSS) {
            cmdName = CUSTOM_COMMANDS[cmdName] || cmdName;

            this._preExec(doc, cmdName, styleWithCSS);
            doc[EXEC_COMMAND](cmdName, false, val);
        },

        _preExec: function(doc, cmdName, styleWithCSS) {

            // �ر� gecko ������� styleWithCSS ���ԣ�ʹ�ò�������ݺ� ie һ��
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
         * ��ȡѡ���������
         */
        getSelectionRange: function(win) {
            var doc = win.document,
                selection, range;

            if (win.getSelection) { // W3C
                selection = win.getSelection();

                if (selection.getRangeAt) {
                    range = selection.getRangeAt(0);

                } else { // for Old Webkit! �߰汾���Ѿ�֧�� getRangeAt
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
         * ��ȡ����
         */
        getCommonAncestor: function(range) {
            return range.startContainer || // w3c
                   (range.parentElement && range.parentElement()) || // ms TextRange
                   (range.commonParentElement && range.commonParentElement()); // ms IHTMLControlRange
        },

        /**
         * ��ȡѡ���ı�
         */
        getSelectedText: function(range) {
            if("text" in range) return range.text;
            return range.toString ? range.toString() : ""; // ms IHTMLControlRange �� toString ����
        },

        /**
         * ����ѡ�� for ie
         */
        saveRange: function(editor) {
            // 1. ���� range, �Ա㻹ԭ
            isIE && editor.contentWin.focus(); // ȷ���������� range �Ǳ༭����ģ����� [Issue 39]

            // 2. �ۼ�����ť�ϣ����ع�꣬���� ie �¹�����ʾ�ڲ�����
            // ͨ�� blur / focus �ȷ�ʽ�� ie7- ����Ч
            // ע�⣺2 �� 1 ��ͻ��Ȩ�⿼�ǣ�����ȡ��2
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
                        '<meta charset="charset=gbk" />' +
                        '<link href="{CONTENT_CSS}" rel="stylesheet" />' +
                        '</head>' +
                        '<body spellcheck="false" class="ks-editor-post">{CONTENT}</body>' +
                        '</html>',

        THEMES_DIR = "themes";

    /**
     * �༭����ʵ����
     */
    E.Instance = function(textarea, config) {
        /**
         * ������� textarea Ԫ��
         */
        this.textarea = Dom.get(textarea);

        /**
         * ������
         */
        this.config = Lang.merge(E.config, config || {});

        /**
         * ������ renderUI �и�ֵ
         * @property container
         * @property contentWin
         * @property contentDoc
         * @property statusbar
         */

        /**
         * ���ʵ����صĲ��
         */
        //this.plugins = [];

        /**
         * �Ƿ���Դ��༭״̬
         */
        this.sourceMode = false;

        /**
         * ������
         */
        this.toolbar = new E.Toolbar(this);

        /**
         * ״̬��
         */
        this.statusbar = new E.Statusbar(this);

        // init
        this._init();
    };

    Lang.augmentObject(E.Instance.prototype, {
        /**
         * ��ʼ������
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
         * ��ʼ�����в��
         */
        _initPlugins: function() {
            var key, p,
                staticPlugins = E.plugins,
                plugins = [];

            // ÿ��ʵ��ӵ��һ���Լ��� plugins �б�
            for(key in staticPlugins) {
                plugins[key] = Lang.merge(staticPlugins[key]);
            }
            this.plugins = plugins;

            // �������ϵĲ��
            this.toolbar.init();

            // ״̬���ϵĲ��
            this.statusbar.init();
            
            // �������Բ��
            for (key in plugins) {
                p = plugins[key];
                if (p.inited) continue;

                if (p.type === E.PLUGIN_TYPE.FUNC) {
                    p.editor = this; // �� p ���� editor ����
                    if (p.init) {
                        p.init();
                    }
                    p.inited = true;
                }
            }
        },

        /**
         * ��� DOM �ṹ
         */
        _renderContainer: function() {
            var textarea = this.textarea,
                region = Dom.getRegion(textarea),
                width = (region.right - region.left - 2) + "px", // YUI �� getRegion �� 2px ƫ��
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
            iframe.style.height = "100%"; // ʹ�� resize ���������
            iframe.setAttribute("frameBorder", 0);

            textarea.style.display = "none";
            Dom.insertBefore(container, textarea);

            this.container = container;
            this.toolbar.domEl = container.childNodes[0];
            this.contentWin = iframe.contentWindow;
            this.contentDoc = iframe.contentWindow.document;

            this.statusbar.domEl = container.childNodes[2];

            // TODO Ŀǰ�Ǹ�� textatea �Ŀ�����趨 editor �Ŀ�ȡ����Կ��� config ��ָ�����
        },

        _setupContentPanel: function() {
            var doc = this.contentDoc,
                config = this.config,
                contentCSS = "content" + (config.debug ? "" : "-min") + ".css",
                contentCSSUrl = config.base + THEMES_DIR + "/" + config.theme + "/" + contentCSS,
                self = this;

            // ��ʼ�� iframe ������
            doc.open();
            doc.write(CONTENT_TMPL
                    .replace("{CONTENT_CSS}", contentCSSUrl)
                    .replace("{CONTENT}", this.textarea.value));
            doc.close();

            if (ie) {
                // �� contentEditable ���������� ie ��ѡ��Ϊ�ڵװ���
                doc.body.contentEditable = "true";
            } else {
                // firefox �� designMode ��֧�ָ��
                doc.designMode = "on";
            }

            // ע1���� tinymce �designMode = "on" ���� try catch �
            //     ԭ������ firefox �£���iframe �� display: none ��������ᵼ�´���
            //     �������Ҳ��ԣ�firefox 3+ �������޴�����
            // ע2�� ie �� contentEditable = true.
            //     ԭ������ ie �£�IE needs to use contentEditable or it will display non secure items for HTTPS
            // Ref:
            //   - Differences between designMode and contentEditable
            //     http://74.125.153.132/search?q=cache:5LveNs1yHyMJ:nagoon97.wordpress.com/2008/04/20/differences-between-designmode-and-contenteditable/+ie+contentEditable+designMode+different&cd=6&hl=en&ct=clnk

            // TODO: �ó�ʼ��������ʼ���� p ��ǩ��
            // ����Ĵ���취���׵�
//            if (Lang.trim(doc.body.innerHTML).length === 0) {
//                if(UA.gecko) {
//                    doc.body.innerHTML = '<p><br _moz_editor_bogus_node="TRUE" _moz_dirty=""/></p>';
//                } else {
//                    doc.body.innerHTML = '<p></p>';
//                }
//            }

            if(ie) {
                // ����� iframe doc �� body ����ʱ����ԭ����λ��
                Event.on(doc, "click", function() {
                    if (doc.activeElement.parentNode.nodeType === 9) { // ����� doc ��
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
         * ����궨λ�����һ��Ԫ��
         */
        _focusToEnd: function() {
            this.contentWin.focus();

            var lastChild = this.contentDoc.body.lastChild,
                range = E.Range.getSelectionRange(this.contentWin);

            if (UA.ie) {
                try { // ��ʱ�ᱨ�?�༭�� ie �£��л�Դ���룬���л���ȥ������༭�����ڣ�����Чָ���JS����
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
         * ��ȡ����
         */
        focus: function() {
          this._focusToEnd();
        },

        /**
         * ִ�� execCommand
         */
        execCommand: function(commandName, val, styleWithCSS) {
            this.contentWin.focus(); // ��ԭ����
            E.Command.exec(this.contentDoc, commandName, val, styleWithCSS);
        },

        /**
         * ��ȡ���
         */
        getData: function() {
            if(this.sourceMode) {
                return this.textarea.value;
            }
            return this.getContentDocData();
        },

        /**
         * ��ȡ contentDoc �е����
         */
        getContentDocData: function() {
            var bd = this.contentDoc.body,
                data = "", p = E.plugins["save"];

            // Firefox �£�_moz_editor_bogus_node, _moz_dirty ����������
            // ��Щ�������ԣ����� innerHTML ��ȡʱ���Զ�������

            data = bd.innerHTML;
            if(data == "<br>") data = ""; // firefox �»��Զ����һ�� br

            if(p && p.filterData) {
                data = p.filterData(data);
            }

            return data;
        },

        /**
         * ��ȡѡ������� Range ����
         */
        getSelectionRange: function() {
            return E.Range.getSelectionRange(this.contentWin);
        }
    });

});

// TODO:
//  - Ŀǰͨ�� html, body { height: 100% } ʹ�� ie ������ iframe ������Ҽ�����ȷ��ʾ�༭�˵���
//    ȱ���Ǳ༭����� padding �������ã�������ֹ�������������Ҫ�Ӳ����Ͻ��иĽ����ź���հס�

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

        div = document.createElement("div"); // ͨ�� el ����


    E.Toolbar = function(editor) {

        /**
         * ������ı༭��ʵ��
         */
        this.editor = editor;

        /**
         * �����������
         */
        this.config = editor.config;

        /**
         * ��ǰ����
         */
        this.lang = E.lang[this.config.language];

        /**
         * ���м��صĹ��������
         */
        this.items = [];

        /**
         * ������Ҫ��̬����״̬�Ĺ����������
         */
        this.stateItems = [];
    };
    
    Lang.augmentObject(E.Toolbar.prototype, {

        /**
         * ��ʼ��������
         */
        init: function() {
            var items = this.config.toolbar,
                plugins = this.editor.plugins,
                key, p;

            // ����������ҵ���ز�������ӵ���������
            for (var i = 0, len = items.length; i < len; ++i) {
                key = items[i];
                if (key) {
                    if (!(key in plugins)) continue; // ���������У������صĲ�����ޣ�ֱ�Ӻ���

                    // ��Ӳ����
                    p = plugins[key];
                    this._addItem(p);

                    this.items.push(p);
                    if(STATE_CMDS.indexOf(p.name) !== -1) {
                        this.stateItems.push(p);
                    }

                } else { // ��ӷָ���
                    this._addSeparator();
                }
            }

            // ״̬����
            this._initUpdateState();
        },

        /**
         * ��ӹ�������
         */
        _addItem: function(p) {
            var el, type = p.type, lang = this.lang, html;

            // �� plugin û������ lang ʱ������Ĭ����������
            // TODO: �����ع��� instance ģ�����Ϊ lang ����ʵ�����
            if (!p.lang) p.lang = Lang.merge(lang["common"], this.lang[p.name] || {});

            // ���ģ�幹�� DOM
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

            // �õ� domEl
            p.domEl = el = div.firstChild;

            // ��ݲ�����ͣ����� DOM �ṹ
            if (type == TYPE.TOOLBAR_MENU_BUTTON || type == TYPE.TOOLBAR_SELECT) {
                // ע��select ��һ������� menu button
                this._renderMenuButton(p);

                if(type == TYPE.TOOLBAR_SELECT) {
                    this._renderSelect(p);
                }
            }

            // ���¼�
            this._bindItemUI(p);

            // ��ӵ�������
            this._addToToolbar(el);

            // ���ò���Լ��ĳ�ʼ���������ǲ���ĸ��Ի��ӿ�
            // init ������ӵ����������棬���Ա�֤ DOM ��������ȡ region �Ȳ�������ȷ��
            p.editor = this.editor; // �� p ���� editor ����
            if (p.init) {
                p.init();
            }

            // ���Ϊ�ѳ�ʼ�����
            p.inited = true;
        },

        /**
         * ��ʼ��������ť�� DOM
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
         * ��ʼ�� selectBox �� DOM
         */
        _renderSelect: function(p) {
            Dom.addClass(p.domEl, TOOLBAR_SELECT);
        },

        /**
         * ���������¼�
         */
        _bindItemUI: function(p) {
            var el = p.domEl;

            // 1. ע����ʱ����Ӧ����
            if (p.exec) {
                Event.on(el, "click", function() {
                    p.exec();
                });
            }

            // 2. ��������ʱ����ť���µ�Ч��
            Event.on(el, "mousedown", function() {
                Dom.addClass(el, TOOLBAR_BUTTON_ACTIVE);
            });
            Event.on(el, "mouseup", function() {
                Dom.removeClass(el, TOOLBAR_BUTTON_ACTIVE);
            });
            // TODO ����Ч������������״̬��������Ƴ������밴ťʱ����ť״̬���л�
            // ע��firefox �£���ס�������Ƴ������밴ťʱ�����ᴥ�� mouseout. ��Ҫ�о��� google �����ʵ�ֵ�
            Event.on(el, "mouseout", function(e) {
                var toElement = Event.getRelatedTarget(e), isChild;

                try {
                    if (el.contains) {
                        isChild = el.contains(toElement);
                    } else if (el.compareDocumentPosition) {
                        isChild = el.compareDocumentPosition(toElement) & 8;
                    }
                } catch(e) {
                    isChild = false; // �Ѿ��ƶ��� iframe ��
                }
                if (isChild) return;

                Dom.removeClass(el, TOOLBAR_BUTTON_ACTIVE);
            });

            // 3. ie6 �£�ģ�� hover
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
         * ��ӷָ���
         */
        _addSeparator: function() {
            div.innerHTML = TOOLBAR_SEPARATOR_TMPL;
            this._addToToolbar(div.firstChild);
        },

        /**
         * �� item �� �ָ��� ��ӵ�������
         */
        _addToToolbar: function(el) {
            if(isIE) el = E.Dom.setItemUnselectable(el);
            this.domEl.appendChild(el);
        },

        /**
         * ��ʼ����ť״̬�Ķ�̬����
         */
        _initUpdateState: function() {
            var doc = this.editor.contentDoc,
                self = this;

            Event.on(doc, "click", function() { self.updateState(); });
            Event.on(doc, "keyup", function(ev) {
                var keyCode = ev.keyCode;

                // PGUP,PGDN,END,HOME: 33 - 36
                // LEFT,UP,RIGHT,DOWN��37 - 40
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

            // TODO: ���ճ��ʱ���¼���ճ�����Ҫ���°�ť״̬
        },

        /**
         * ��ť״̬�Ķ�̬���£�������ťѡ��״̬�ĸ��¡������ֺŵĸ��¡���ɫ�Ķ�̬���µȣ�
         * ���� Google Docs ��ԭ�������а�ťʼ�տɵ����ֻ����״̬�������ð�ť
         */
        updateState: function(filterNames) {
            var items = this.stateItems, p;
            filterNames = filterNames ? filterNames.join("|") : "";

            for(var i = 0, len = items.length; i < len; i++) {
                p = items[i];
                
                if(filterNames && filterNames.indexOf(p.name) === -1)
                    continue;

                // ���ò���Լ���״̬���º���
                if(p.updateState) {
                    p.updateState();
                    continue;
                }

                // Ĭ�ϵ�״̬���º���
                this.updateItemState(p);
            }

            // TODO: webkit �£������״̬û��ȡ��
        },

        updateItemState: function(p) {
            var doc = this.editor.contentDoc;

            // Ĭ�ϵ�״̬���º���
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

        div = document.createElement("div"); // ͨ�� el ����

    E.Statusbar = function(editor) {

        /**
         * ������ı༭��ʵ��
         */
        this.editor = editor;

        /**
         * �����������
         */
        this.config = editor.config;

        /**
         * ��ǰ����
         */
        this.lang = E.lang[this.config.language];
    };
    
    Lang.augmentObject(E.Statusbar.prototype, {

        /**
         * ��ʼ��
         */
        init: function() {
            var items = this.config.statusbar,
                plugins = this.editor.plugins,
                key;

            // ����������ҵ���ز�������ӵ���������
            for (var i = 0, len = items.length; i < len; ++i) {
                key = items[i];
                if (key) {
                    if (!(key in plugins)) continue; // ���������У������صĲ�����ޣ�ֱ�Ӻ���

                    // ��Ӳ����
                    this._addItem(plugins[key]);

                } else { // ��ӷָ���
                    this._addSep();
                }
            }
        },

        /**
         * ��ӹ�������
         */
        _addItem: function(p) {
            var el, lang = this.lang;

            // �� plugin û������ lang ʱ������Ĭ����������
            // TODO: �����ع��� instance ģ�����Ϊ lang ����ʵ�����
            if (!p.lang) p.lang = Lang.merge(lang["common"], this.lang[p.name] || {});

            // ���ģ�幹�� DOM
            div.innerHTML = ITEM_TMPL.replace("{NAME}", p.name);

            // �õ� domEl
            p.domEl = el = div.firstChild;

            // ��ӵ�������
            this._addToToolbar(el);

            // ���ò���Լ��ĳ�ʼ���������ǲ���ĸ��Ի��ӿ�
            // init ������ӵ����������棬���Ա�֤ DOM ��������ȡ region �Ȳ�������ȷ��
            p.editor = this.editor; // �� p ���� editor ����
            if (p.init) {
                p.init();
            }

            // ���Ϊ�ѳ�ʼ�����
            p.inited = true;
        },

        /**
         * ��ӷָ���
         */
        _addSep: function() {
            div.innerHTML = SEP_TMPL;
            this._addToToolbar(div.firstChild);
        },

        /**
         * �� item �� �ָ��� ��ӵ�״̬��
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
        SHIM_CLASS = DROP_MENU_CLASS + "-shim", //  // iframe shim �� class
        shim; // ����һ�� shim ����
    
    E.Menu = {

        /**
         * ���������
         * @param {KISSY.Editor} editor dropMenu �����ı༭��ʵ��
         * @param {HTMLElement} trigger
         * @param {Array} offset dropMenu λ�õ�ƫ����
         * @return {HTMLElement} dropMenu
         */
        generateDropMenu: function(editor, trigger, offset) {
            var dropMenu = document.createElement("div"),
                 self = this;

            // �����Ӱ��
            dropMenu.innerHTML = '<div class="' + SHADOW_CLASS + '"></div>'
                               + '<div class="' + CONTENT_CLASS + '"></div>';
            
            // ��� DOM
            dropMenu.className = DROP_MENU_CLASS;
            dropMenu.style[DISPLAY] = NONE;
            document.body.appendChild(dropMenu);

            // �������ʱ����ʾ������
            // ע��һ���༭��ʵ�����ֻ����һ�������������
            Event.on(trigger, "click", function(ev) {
                // �����ϴ������Լ�����
                // ���� document �ϼ�ص���󣬻�رոմ򿪵� dropMenu
                Event.stopPropagation(ev);

                // ���ص�ǰ�����������
                editor.activeDropMenu && self._hide(editor);

                // �򿪵�ǰ trigger �� dropMenu
                if(editor.activeDropMenu != dropMenu) {
                    self._setDropMenuPosition(trigger, dropMenu, offset); // �ӳٵ���ʾʱ����λ��
                    editor.activeDropMenu = dropMenu;
                    editor.activeDropButton = trigger;
                    self._show(editor);

                } else { // �ڶ��ε���� trigger �ϣ��ر� activeDropMenu, ����Ϊ null. ����ᵼ�µ���ε���򲻿�
                    editor.activeDropMenu = null;
                    editor.activeDropButton = null;
                }
            });

            // document ���񵽵��ʱ���رյ�ǰ�����������
            Event.on([document, editor.contentDoc], "click", function() {
                if(editor.activeDropMenu) {
                    self.hideActiveDropMenu(editor);

                    // ��ԭѡ��ͽ���
                    if (this == editor.contentDoc) {
                        // TODO: [bug 58]  ��Ҫ��дһ�� focusmanager ��ͳһ���?��
//                        if (UA.ie) {
//                            var range = editor.getSelectionRange();
//                            range.select();
//                        }
                        editor.contentWin.focus();
                    }
                }
            });

            // �ı䴰�ڴ�Сʱ����̬����λ��
            this._initResizeEvent(trigger, dropMenu, offset);

            // ����
            return dropMenu.childNodes[1]; // ���� content ����
        },

        /**
         * ���� dropMenu ��λ��
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
         * ���ر༭����ǰ�򿪵�������
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
                // ע��visibilty ��ʽ�ᵼ��ie�£��ϴ��������ļ���ѡ����ѡȡ�ļ��򣩺󣬱༭���򽹵㶪ʧ
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
         * window.onresize ʱ�����µ��� dropMenu ��λ��
         */
        _initResizeEvent: function(trigger, dropMenu, offset) {
            var self = this, resizeTimer;

            Event.on(window, "resize", function() {
                if (resizeTimer) {
                    clearTimeout(resizeTimer);
                }

                resizeTimer = setTimeout(function() {
                    if(self._isVisible(dropMenu)) { // ������ʾʱ����Ҫ��̬����
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
         * ���� shim �� region
         * @protected
         */
        _setShimRegion: function(el) {
            if (shim && this._isVisible(el)) {
                var r = Dom.getRegion(el);
                if (r.width > 0) {
                    shim.style.left = r.left + "px";
                    shim.style.top = r.top + "px";
                    shim.style.width = (r.width - 1) + "px"; // ��һ���أ����� ie6 �»�¶��һ����
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
         * ���ࣺ��ͨ��ť
         */
        type: TYPE.TOOLBAR_BUTTON,

        /**
         * ��Ӧ����
         */
        exec: function() {
            // ִ������
            this.editor.execCommand(this.name);

            // ����״̬
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
         * ���ࣺ�˵���ť
         */
        type: TYPE.TOOLBAR_MENU_BUTTON,

        /**
         * ��ǰѡȡɫ
         */
        color: "",

        /**
         * ��ǰ��ɫָʾ��
         */
        _indicator: null,

        /**
         * ȡɫ��
         */
        swatches: null,

        /**
         * �����������˵���
         */
        dropMenu: null,

        range: null,

        /**
         * ��ʼ��
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
            // �����ַ�����
            //  1. ���� MS Office 2007, �������������ͷʱ���ŵ��������򡣵�� caption ʱ��ֱ��������ɫ��
            //  2. ���� Google Docs, ����� caption �� dropdown����ÿ�ε��������������
            // ���߼��Ͻ�������1���?���ǣ����� web ҳ���ϣ���ť�Ƚ�С������2����������������ԡ�
            // ������÷���2

            this.dropMenu = E.Menu.generateDropMenu(this.editor, this.domEl, [1, 0]);

            // ����������ڵ�����
            this._generatePalettes();

            // ��� ie�����ò���ѡ��
            if (isIE) E.Dom.setItemUnselectable(this.dropMenu);
        },

        _bindUI: function() {
            // ע��ѡȡ�¼�
            this._bindPickEvent();

            Event.on(this.domEl, "click", function() {
                // ���� range, �Ա㻹ԭ
                this.range = this.editor.getSelectionRange();

                // �ۼ�����ť�ϣ����ع�꣬���� ie �¹�����ʾ�ڲ�����
                // ע��ͨ�� blur / focus �ȷ�ʽ�� ie7- ����Ч
                isIE && this.editor.contentDoc.selection.empty();

                // ����ѡ��ɫ
                this._updateSelectedColor(this.color);
            }, this, true);
        },

        /**
         * ���ȡɫ��
         */
        _generatePalettes: function() {
            var htmlCode = "";

            // �ڰ�ɫ��
            htmlCode += this._getPaletteTable(COLOR_GRAY);

            // ����ɫ��
            htmlCode += this._getPaletteTable(COLOR_NORMAL);

            // ��ϸɫ��
            htmlCode += this._getPaletteTable(COLOR_DETAIL);

            // ��ӵ� DOM ��
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
         * ��ȡɫ�¼�
         */
        _bindPickEvent: function() {
            var self = this;

            Event.on(this.dropMenu, "click", function(ev) {
                var target = Event.getTarget(ev),
                    attr = target.getAttribute("title");

                if(attr && attr.indexOf("RGB") === 0) {
                    self._doAction(attr);
                }

                // �ر����
                Event.stopPropagation(ev);
                E.Menu.hideActiveDropMenu(self.editor);
                // ע����������ֹ���¼�ð�ݣ��Լ�����Ի���Ĺرգ�����Ϊ
                // �� Firefox �£���ִ�� doAction ��doc ��ȡ�� click
                // ���� updateState ʱ������ȡ������ǰ����ɫֵ��
                // ��������������Ҳ�кô�����������²���Ҫ���� updateState
            });
        },

        /**
         * ִ�в���
         */
        _doAction: function(val) {
            if (!val) return;

            // ���µ�ǰֵ
            this.setColor(E.Color.toHex(val));

            // ��ԭѡ��
            var range = this.range;
            if (isIE && range.select) range.select();

            // ִ������
            this.editor.execCommand(this.name, this.color);
        },
        
        /**
         * ������ɫ
         * @param {string} val ��ʽ #RRGGBB or #RGB
         */
        setColor: function(val) {
            this.color = val;

            this._updateIndicatorColor(val);
            this._updateSelectedColor(val);
        },

        /**
         * ����ָʾ������ɫ
         * @param val HEX ��ʽ
         */
        _updateIndicatorColor: function(val) {
            // ���� indicator
            this._indicator.style.borderBottomColor = val;
        },

        /**
         * ���������˵���ѡ�е���ɫ
         * @param {string} val ��ʽ #RRGGBB or #RGB
         */
        _updateSelectedColor: function(val) {
            var i, len, swatch, swatches = this.swatches;

            for(i = 0, len = swatches.length; i < len; ++i) {
                swatch = swatches[i];

                // ��ȡ�� backgroundColor �ڲ�ͬ������£���ʽ�в��죬��Ҫͳһת�����ٱȽ�
                if(E.Color.toHex(swatch.style.backgroundColor) == val) {
                    Dom.addClass(swatch.parentNode, PALETTE_CELL_SELECTED);
                } else {
                    Dom.removeClass(swatch.parentNode, PALETTE_CELL_SELECTED);
                }
            }
        },

        /**
         * ���°�ť״̬
         */
        // ie �£�queryCommandValue �޷���ȷ��ȡ�� backColor ��ֵ
        // �ɴ���ô˹��ܣ�ģ�� Office2007 �Ĵ��?��ʾ����ѡȡɫ
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
//                    if(isIE && typeof t == "number") { // ie�£����� backColor, ��ʱ���� int ��ʽ����ʱ�ֻ�ֱ�ӷ��� hex ��ʽ
//                        t = E.Color.int2hex(t);
//                    }
//                    if (t === "transparent") t = ""; // ����ɫΪ͸��ɫʱ��ȡĬ��ɫ
//                    if(t === "rgba(0, 0, 0, 0)") t = ""; // webkit �ı���ɫ�� rgba ��
//
//                    val = t ? E.Color.toHex(t) : this._getDefaultColor(); // t Ϊ���ַ�ʱ����ʾ����ڿ��л���δ������ʽ�ĵط�
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
//  1. �� google, �Լ����¼���֧��

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
         * ���ࣺ�˵���ť
         */
        type: TYPE.TOOLBAR_SELECT,

        /**
         * ��ǰѡ��ֵ
         */
        selectedValue: "",

        /**
         * ѡ���ͷ��
         */
        selectHead: null,

        /**
         * ����������ѡ���б�
         */
        selectList: null,

        /**
         * �������������ѡ��ֵ
         */
        options: [],

        /**
         * �����б���
         */
        items: null,

        /**
         * ѡ�е���
         */
        selectedItem: null,

        /**
         * ѡ���������
         */
        range: null,

        /**
         * ��ʼ��
         */
        init: function() {
            this.options = this.lang.options;
            this.selectHead = this.domEl.getElementsByTagName("span")[0];

            this._renderUI();
            this._bindUI();
        },

        _renderUI: function() {
            // ��ʼ�������� DOM
            this.selectList = E.Menu.generateDropMenu(this.editor, this.domEl, [1, 0]);
            this._renderSelectList();
            this.items = this.selectList.getElementsByTagName("li");
        },

        _bindUI: function() {
            // ע��ѡȡ�¼�
            this._bindPickEvent();

            Event.on(this.domEl, "click", function() {
                // ���� range, �Ա㻹ԭ
                this.range = this.editor.getSelectionRange();

                // �ۼ�����ť�ϣ����ع�꣬���� ie �¹�����ʾ�ڲ�����
                // ע��ͨ�� blur / focus �ȷ�ʽ�� ie7- ����Ч
                UA.ie && this.editor.contentDoc.selection.empty();

                // �����������е�ѡ����
                if(this.selectedValue) {
                    this._updateSelectedOption(this.selectedValue);
                } else if(this.selectedItem) {
                    Dom.removeClass(this.selectedItem, OPTION_SELECTED);
                    this.selectedItem = null;
                }
                
            }, this, true);
        },

        /**
         * ��ʼ�������� DOM
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

            // ��ӵ� DOM ��
            this.selectList.innerHTML = SELECT_TMPL.replace("{LI}", htmlCode);

            // ��Ӹ��Ի� class
            Dom.addClass(this.selectList, "ks-editor-drop-menu-" + this.name);
        },

        /**
         * ��ȡɫ�¼�
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

                // �ر����
                Event.stopPropagation(ev);
                E.Menu.hideActiveDropMenu(self.editor);
                // ע����������ֹ���¼�ð�ݣ��Լ�����Ի���Ĺرգ�����Ϊ
                // �� Firefox �£���ִ�� doAction ��doc ��ȡ�� click
                // ���� updateState ʱ������ȡ������ǰ����ɫֵ��
                // ��������������Ҳ�кô�����������²���Ҫ���� updateState
            });

            // ie6 �£�ģ�� hover
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
         * ִ�в���
         */
        _doAction: function(val) {
            if(!val) return;

            this.selectedValue = val;

            // ���µ�ǰֵ
            this._setOption(val);

            // ��ԭѡ��
            var range = this.range;
            if(UA.ie && range.select) range.select();

            // ִ������
            this.editor.execCommand(this.name, this.selectedValue);
        },

        /**
         * ѡ��ĳһ��
         */
        _setOption: function(val) {
            // ����ͷ��
            this._updateHeadText(this._getOptionKey(val));

            // �����б�ѡ����
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
         * �����������ѡ����
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
         * ���°�ť״̬
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
//  1. �� google, �Լ����¼���֧��
//  3. ie �½ӹܣ������괦��ĳ��ǩ�ڣ��ı�����ʱ���ı������α�ǩ������

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

        REG_LINK_FILTER = /^(?:.*?:\/\/)?(.*?)\/.*$/,

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
                              '<p style="width: 300px">��δʵ��...</p>', // TODO: �������ѡ��ͼƬ
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
                filterMsg: "", // Ĭ��Ϊ this.lang.upload_filter
                linkFilter: "",
                linkFilterMsg: "", // Ĭ��Ϊ this.lang.upload_linkFilter
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
         * ���ࣺ��ť
         */
        type: TYPE.TOOLBAR_BUTTON,

        /**
         * ������
         */
        config: {},

        /**
         * �����ĶԻ���
         */
        dialog: null,

        /**
         * �����ı?
         */
        form: null,

        /**
         * ������ range ����
         */
        range: null,

        currentTab: null,
        currentPanel: null,
        uploadingPanel: null,
        actionsBar: null,

        /**
         * ��ʼ������
         */
        init: function() {
            var pluginConfig = this.editor.config.pluginsConfig[this.name] || {};
            defaultConfig.upload.filterMsg = this.lang["upload_filter"];
            defaultConfig.upload.linkFilterMsg = this.lang["upload_linkFilter"];
            this.config = Lang.merge(defaultConfig, pluginConfig);
            this.config.upload = Lang.merge(defaultConfig.upload, pluginConfig.upload || {});

            this._renderUI();
            this._bindUI();

            this.actionsBar = Dom.getElementsByClassName(ACTIONS_CLS, "div", this.dialog)[0];
            this.uploadingPanel = Dom.getElementsByClassName(UPLOADING_CLS, "div", this.dialog)[0];
            this.config.upload.enableXdr && this._initXdrUpload();
        },

        /**
         * ��ʼ���Ի������
         */
        _renderUI: function() {
            var dialog = E.Menu.generateDropMenu(this.editor, this.domEl, [1, 0]),
                lang = this.lang;

            // ����Զ�����
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

            // ���������� tabs
            var keys = this.config["tabs"], html = "";
            for(var k = 0, l = keys.length; k < l; k++) {
                html += TABS_TMPL[keys[k]];
            }

            // �İ�
            ul.innerHTML = html.replace(/\{([^}]+)\}/g, function(match, key) {
                return (key in lang) ? lang[key] : key;
            });

            // ֻ��һ�� tabs ʱ����ʾ
            var tabs = ul.childNodes, len = panels.length;
            if(tabs.length === 1) {
                Dom.addClass(this.dialog, NO_TAB_CLS);
            }

            // �л�
            switchTab(tabs[0]); // Ĭ��ѡ�е�һ��Tab
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

                // ie6 �£������ iframe shim
                if(UA.ie === 6) E.Menu._updateShimRegion(self.dialog);

                Dom.addClass(trigger, SELECTED_TAB_CLS);
                panels[j].style.display = "";

                self.currentTab = trigger.getAttribute("rel");
                self.currentPanel = panels[j];
            }
        },

        /**
         * ���¼�
         */
        _bindUI: function() {
            var self = this;

            // ��ʾ/���ضԻ���ʱ���¼�
            Event.on(this.domEl, "click", function() {
                // ������ʾʱ����
                if (self.dialog.style.visibility === isIE ? "hidden" : "visible") { // �¼��Ĵ���˳��ͬ
                    self._syncUI();
                }
            });

            // ע��?��ť����¼�
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
                    case BTN_CANCEL_CLS: // ֱ������ð�ݣ��رնԻ���
                        break;
                    default: // ����ڷǰ�ť����ֹͣð�ݣ������Ի���
                        Event.stopPropagation(ev);
                }
            });
        },

        /**
         * ��ʼ�������ϴ�
         */
        _initXdrUpload: function() {
            var tabs = this.config["tabs"];

            for(var i = 0, len = tabs.length; i < len; i++) {
                if(tabs[i] === "local") { // ���ϴ� tab ʱ�Ž������²���
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

                // ����ļ������Ƿ���ȷ
                if(uploadConfig.filter !== "*") {
                    ext = imgFile.substring(imgFile.lastIndexOf(".") + 1).toLowerCase();
                    if(uploadConfig.filter.indexOf(ext) == -1) {
                        alert(uploadConfig.filterMsg);
                        self.form.reset();
                        return;
                    }
                }

                // ��ʾ�ϴ�������
                this.uploadingPanel.style.display = "";
                this.currentPanel.style.display = "none";
                this.actionsBar.style.display = "none";
                if(UA.ie === 6) E.Menu._updateShimRegion(this.dialog); // ie6 �£�������� iframe shim

                // ���� XHR
                Connect.setForm(form, true);
                Connect.asyncRequest("post", actionUrl, {
                    upload: function(o) {
                        try {
                            // ��׼��ʽ���£�
                            // �ɹ�ʱ������ ["0", "ͼƬ��ַ"]
                            // ʧ��ʱ������ ["1", "������Ϣ"]
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

            // ���������´������ͣ�
            //   - json parse �쳣������ actionUrl �����ڡ�δ��¼������ȸ�������
            //   - �������˷��ش�����Ϣ ["1", "error msg"]
        },

        _insertWebImage: function() {
            var imgUrl = this.form["imgUrl"].value || '',
                cfg = this.config.upload,
                filter = cfg.linkFilter,
                SEP = '|',
                match, hostname;

            // ��ȡ hostname
            if(match = REG_LINK_FILTER.exec(imgUrl)) {
               hostname = match[1];
            }
            if(!imgUrl || !hostname) return;

            // �����ַ�Ƿ��ڰ�����
            if (filter && filter !== "*") {
                if ((SEP + filter.toLowerCase() + SEP).indexOf(SEP + hostname.toLowerCase() + SEP) === -1) {
                    alert(cfg.linkFilterMsg);
                    return;
                }
            }

            this._insertImage(imgUrl);
        },

        /**
         * ���ضԻ���
         */
        _hideDialog: function() {
            var activeDropMenu = this.editor.activeDropMenu;
            if(activeDropMenu && Dom.isAncestor(activeDropMenu, this.dialog)) {
                E.Menu.hideActiveDropMenu(this.editor);
            }

            // ��ԭ����
            this.editor.contentWin.focus();
        },

        /**
         * ���½����ϵı?ֵ
         */
        _syncUI: function() {
            // ���� range, �Ա㻹ԭ
            this.range = E.Range.saveRange(this.editor);

            // reset
            this.form.reset();

            // restore
            this.uploadingPanel.style.display = "none";
            this.currentPanel.style.display = "";
            this.actionsBar.style.display = "";
        },

        /**
         * ����ͼƬ
         */
        _insertImage: function(url, alt) {
            url = Lang.trim(url);

            // url Ϊ��ʱ��������
            if (url.length === 0) {
                return;
            }

            var editor = this.editor,
                range = this.range;

            // ����ͼƬ
            if (window.getSelection) { // W3C
                var img = editor.contentDoc.createElement("img");
                img.src = url;
                if(alt) img.setAttribute("alt", alt);

                range.deleteContents(); // ���ѡ������
                range.insertNode(img); // ����ͼƬ

                // ʹ���������ͼƬʱ������ں���
                if(UA.webkit) {
                    var selection = editor.contentWin.getSelection();
                    selection.addRange(range);
                    selection.collapseToEnd();
                } else {
                    range.setStartAfter(img);
                }

                editor.contentWin.focus(); // ��ʾ���

            } else if(document.selection) { // IE
                // ��ԭ����
                editor.contentWin.focus();

                if("text" in range) { // TextRange
                    range.select(); // ��ԭѡ��

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
 *   - <input type="file" unselectable="on" /> ��һ�У�������һ���硣���� unselectable, �ᵼ�� IE ��
 *     ���㶪ʧ��range.select() �� contentDoc.focus() �����ã������Ϻ�˳������ͬʱ���Զ�ʹ�� IE7- �²���
 *     ���롣
 *
 * TODO:
 *   - ����֧��
 */

KISSY.Editor.add("plugins~indent", function(E) {

    var //Y = YAHOO.util, Dom = Y.Dom, Lang = YAHOO.lang,
        TYPE = E.PLUGIN_TYPE,
        //UA = YAHOO.env.ua,

//        INDENT_ELEMENTS = Lang.merge(E.Dom.BLOCK_ELEMENTS, {
//            li: 0 // ȡ�� li Ԫ�صĵ��������� ol/ul ��������
//        }),
//        INDENT_STEP = "40",
//        INDENT_UNIT = "px",

        plugin = {
            /**
             * ���ࣺ��ͨ��ť
             */
            type: TYPE.TOOLBAR_BUTTON,

            /**
             * ��Ӧ����
             */
            exec: function() {
                // ִ������
                this.editor.execCommand(this.name);

                // ����״̬
                // ����ʱ�����ܻ�ɵ� list ��״̬
                this.editor.toolbar.updateState();
            }
        };

    // ע��ie �£�Ĭ��ʹ�� blockquote Ԫ����ʵ������
    // ��������������� range �ķ�ʽ��ʵ�֣��Ա��ֺ����������һ��
    // ie �£���ʱ������Ĭ�ϵ�
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
//            } else { // �����κδ���
//                return;
//            }
//
//            // TODO: �� CKEditor һ����ȫʵ�ֶ������ iterator
//            // ������ blockquote ��ʱ�������ѡ��Ķ����ĸ���Ԫ�ظպ���body���龰
//            // ע�⣺Ҫ�� blockquote ����ʽΪ������ʽ
//            if(parentEl === this.editor.contentDoc.body) {
//                this.editor.execCommand(this.name);
//                return;
//            }
//            // end of ��ʱ�������
//
//            // ��ȡ������ĸ�Ԫ��
//            if (isIndentableElement(parentEl)) {
//                 indentableAncestor = parentEl;
//            } else {
//                 indentableAncestor = getIndentableAncestor(parentEl);
//            }
//
//            // ���� margin-left
//            if (indentableAncestor) {
//                var val = parseInt(indentableAncestor.style.marginLeft) >> 0;
//                val += (this.name === "indent" ? +1 : -1) * INDENT_STEP;
//
//                indentableAncestor.style.marginLeft = val + INDENT_UNIT;
//            }
//
//            /**
//             * ��ȡ������ĸ�Ԫ��
//             */
//            function getIndentableAncestor(el) {
//                return Dom.getAncestorBy(el, function(elem) {
//                    return isIndentableElement(elem);
//                });
//            }
//
//            /**
//             * �ж��Ƿ������Ԫ��
//             */
//            function isIndentableElement(el) {
//                return INDENT_ELEMENTS[el.nodeName.toLowerCase()];
//            }
//        };
//    }

    // ע����
    E.addPlugin(["indent", "outdent"], plugin);
 });

/**
 * NOTES:
 * 
 *  - Ҫ����ȫ�ӹ� ie ��Ĭ��ʵ�֣���Ҫ���ǵ����غܶࡣ���磺
 *     1. range ֻ�� inline Ԫ�أ�����Ĵ�����ʵ��
 *     2. range ���������Ŀ�Ԫ�أ������Ҫʵ��һ�� blockIterator
 *     3. range ����Ԫ�غ���һ����Ԫ�صĲ��֣��������Ҫʵ��һ�� html parser ��Э��
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
             * ���ࣺ��ͨ��ť
             */
            type: TYPE.TOOLBAR_BUTTON,

            /**
             * ��Ӧ����
             */
            exec: function() {
                // ִ������
                this.editor.execCommand(this.name);

                // ����״̬
                this.editor.toolbar.updateState(NAMES);
            }
        };

    // ע��ie �£�Ĭ��ʹ�� align ������ʵ�ֶ���
    // ��������������� range �ķ�ʽ��ʵ�֣��Ա��ֺ����������һ��
    // ע��ѡ�������ж����ʱ������Ĵ��������� [Issue 4]
    // ��ʱ������Ĭ�ϵ����������
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
//            } else { // �����κδ���
//                return;
//            }
//
//            // ��ȡ�ɶ���ĸ�Ԫ��
//            if (isJustifyElement(parentEl)) {
//                justifyAncestor = parentEl;
//            } else {
//                justifyAncestor = getJustifyAncestor(parentEl);
//            }
//
//            // ���� text-align
//            if (justifyAncestor) {
//                justifyAncestor.style.textAlign = this.name.substring(7).toLowerCase();
//            }
//
//            /**
//             * ��ȡ�����ö���ĸ�Ԫ��
//             */
//            function getJustifyAncestor(el) {
//                return Dom.getAncestorBy(el, function(elem) {
//                    return isJustifyElement(elem);
//                });
//            }
//
//            /**
//             * �ж��Ƿ�ɶ���Ԫ��
//             */
//            function isJustifyElement(el) {
//                return JUSTIFY_ELEMENTS[el.nodeName.toLowerCase()];
//            }
//        };
//    }


    // ע����
    E.addPlugin(NAMES, plugin);

});

KISSY.Editor.add("plugins~keystroke", function(E) {

    var Y = YAHOO.util, Event = Y.Event,
        UA = YAHOO.env.ua,
        TYPE = E.PLUGIN_TYPE;


    E.addPlugin("keystroke", {
        /**
         * ����
         */
        type: TYPE.FUNC,

        /**
         * ��ʼ��
         */
        init: function() {
            var editor = this.editor;

            // [bug fix] ie7- �£����� Tab ��󣬹�껹�ڱ༭������˸�����һس��ύ��Ч
            if (UA.ie && UA.ie < 8) {
                Event.on(editor.contentDoc, "keydown", function(ev) {
                    if(ev.keyCode == 9) {
                        this.selection.empty();
                    }
                });
            }

            // Ctrl + Enter �ύ
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
         * ���ࣺ��ť
         */
        type: TYPE.TOOLBAR_BUTTON,

        /**
         * �����ĶԻ���
         */
        dialog: null,

        /**
         * �����ı?
         */
        form: null,

        /**
         * ������ range ����
         */
        range: null,

        /**
         * ��ʼ������
         */
        init: function() {
            this._renderUI();
            this._bindUI();
        },

        /**
         * ��ʼ���Ի������
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

            // webkit ����Ĭ�ϵ� exeCommand, ������ target ����
            UA.webkit && (this.form.target.parentNode.style.display = "none");

            isIE && E.Dom.setItemUnselectable(dialog);
        },

        /**
         * ���¼�
         */
        _bindUI: function() {
            var form = this.form, self = this;

            // ��ʾ/���ضԻ���ʱ���¼�
            Event.on(this.domEl, "click", function() {
                // ������ʾʱ����
                if(self.dialog.style.visibility === isIE ? "hidden" : "visible") { // �¼��Ĵ���˳��ͬ
                    self._syncUI();
                }
            });

            // ע��?��ť����¼�
            Event.on(this.dialog, "click", function(ev) {
                var target = Event.getTarget(ev);

                switch(target.className) {
                    case BTN_OK_CLS:
                        self._createLink(form.href.value, form.target.checked);
                        break;
                    case BTN_CANCEL_CLS: // ֱ������ð�ݣ��رնԻ���
                        break;
                    case BTN_REMOVE_CLS:
                        self._unLink();
                        break;
                    default: // ����ڷǰ�ť����ֹͣð�ݣ������Ի���
                        Event.stopPropagation(ev);
                }
            });
        },

        /**
         * ���½����ϵı?ֵ
         */
        _syncUI: function() {
            // ���� range, �Ա㻹ԭ
            this.range = E.Range.saveRange(this.editor);

            var form = this.form, container, a;

            container = Range.getCommonAncestor(this.range);
            a = (container.nodeName == "A") ? container : Dom.getAncestorByTagName(container, "A");

            // �޸����ӽ���
            if(a) {
                form.href.value = a.href;
                form.target.checked = a.target === "_blank";
                Dom.removeClass(form, NEW_LINK_CLS);

            } else { // �½����ӽ���
                form.href.value = DEFAULT_HREF;
                form.target.checked = false;
                Dom.addClass(form, NEW_LINK_CLS);
            }

            // ���� setTimout ��� for ie
            setTimeout(function() {
                form.href.select();
            }, 50);
        },

        /**
         * ����/�޸�����
         */
        _createLink: function(href, target) {
            href = this._getValidHref(href);

            // href Ϊ��ʱ���Ƴ�����
            if (href.length === 0) {
                this._unLink();
                return;
            }

            var range = this.range,
                div = document.createElement("div"),
                a, container, fragment;

            // �޸�����
            container = Range.getCommonAncestor(range);
            a = (container.nodeName == "A") ? container : Dom.getAncestorByTagName(container, "A");
            if (a) {
                a.href = href;
                if (target) a.setAttribute("target", "_blank");
                else a.removeAttribute("target");
                return;
            }

            // ��������
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
                    // TODO: ControlRange ���ӵ� target ʵ��
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
                range.deleteContents(); // ɾ��ԭ����
                range.insertNode(a); // ��������
                range.selectNode(a); // ѡ������
            }
        },

        _getValidHref: function(href) {
            href = Lang.trim(href);
            if(href && !HREF_REG.test(href)) { // ��Ϊ�� �� ����ϱ�׼ģʽ abcd://efg
               href = DEFAULT_HREF + href; // ���Ĭ��ǰ׺
            }
            return href;
        },

        /**
         * �Ƴ�����
         */
        _unLink: function() {
            var editor = this.editor,
                range = this.range,
                selectedText = Range.getSelectedText(range),
                container = Range.getCommonAncestor(range),
                parentEl;

            // û��ѡ������ʱ
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
// ��ѡ�������/һ���ְ�����ʱ����ɵ��������ݵĵ��Ŵ��?
// Ŀǰֻ�� Google Docs �����Ż�������༭�������������Ĭ�ϵĴ��?ʽ��
// �ȼ��ڴˣ����Ժ��Ż���

/**
 * Notes:
 *  1. �� ie �£�����������ϵİ�ťʱ���ᵼ�� iframe �༭����� range ѡ��ʧ������취�ǣ�
 *     ������Ԫ����� unselectable ���ԡ����ǣ����� text input ��Ϊ�������룬������ unselectable
 *     ���ԡ���͵�����ì�ܡ���ˣ�Ȩ��֮��Ľ���취�ǣ��ڶԻ��򵯳�ǰ���� range ���󱣴�������
 *     ��ʧ����ͨ�� range.select() ѡ�������������Ѿ���������
 *  2. Ŀǰֻ�� CKEditor �� TinyMCE ����ȫ�ӹ�����ı༭������ú��������� 1 �Ľ��������Ŀǰ�Ѿ�
 *     ���ã��ɱ�Ҳ�ܵ͡�
 */
KISSY.Editor.add("plugins~resize", function(E) {

    var Y = YAHOO.util, Event = Y.Event,
        UA = YAHOO.env.ua,
        TYPE = E.PLUGIN_TYPE,

        TMPL = '<span class="ks-editor-resize-larger" title="{larger_title}">{larger_text}</span>'
             + '<span class="ks-editor-resize-smaller" title="{smaller_title}">{smaller_text}</span>';


    E.addPlugin("resize", {

        /**
         * ���ࣺ״̬�����
         */
        type: TYPE.STATUSBAR_ITEM,

        contentEl: null,

        currentHeight: 0,

        /**
         * ��ʼ��
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

                // ����С�� 0
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

            // ����ͨ������ textarea �� height: 100% �Զ�����Ӧ�߶���
            // �� ie7- �� css ���������⣬��˸ɴ����������� js �㶨
            this.editor.textarea.style.height = this.currentHeight + "px";
        }

    });

 });

/**
 * TODO:
 *   - ��ȫ���༭Ҳ����˴�
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
         * ����
         */
        type: TYPE.FUNC,

        /**
         * ��ʼ��
         */
        init: function() {
            var editor = this.editor,
                textarea = editor.textarea,
                form = textarea.form;

            if(form) {
                Event.on(form, "submit", function() {
                    if(!editor.sourceMode) {
                        //var val = editor.getData();
                        // ͳһ��ʽ  �ɺ�̨����
//                        if(val && val.indexOf('<div class="ks-editor-post">') !== 0) {
//                            val = '<div class="ks-editor-post">' + val + '</div>';
//                        }
                        textarea.value = editor.getData();
                    }
                });
            }
        },

        /**
         * �������
         */
        filterData: function(data) {

            data = data.replace(/<(\/?)([^>\s]+)([^>]*)>/g, function(m, slash, tag, attr) {

                // �� ie �Ĵ�д��ǩת��ΪСд
                tag = tag.toLowerCase();

                // �ñ�ǩ���廯
                var map = TAG_MAP[tag],
                    ret = tag;

                // ����� <tag> ���ֲ������Եı�ǩ����һ������
                if(map && !attr) {
                    ret = map["tag"];
                    if(!slash && map["style"]) {
                        ret += ' style="' + map["style"] + '"';
                    }
                }

                return "<" + slash + ret + attr + ">";
            });

            // ���� word ���������
            if(data.indexOf("mso") > 0) {
                data = this.filterWord(data);
            }

            return data;

            // ע:
            //  1. �� data �ܴ�ʱ������� replace ���ܻ����������⡣
            //    �����£��Ѿ������ replace �ϲ�����һ����������£��������������⣩
            //
            //  2. �������廯��google ��ʵ�ã���δ�ض�
            // TODO: ��һ���Ż������� <span style="..."><span style="..."> ����span���Ժϲ�Ϊһ��

            // FCKEditor ʵ���˲������廯
            // Google Docs ������ʵ������
            // KISSY Editor ��ԭ���ǣ��ڱ�֤ʵ�õĻ��ϣ��������廯
        },

        /**
         * ���� word ճ��������������
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

            // Remove XML elements and declarations
            html = html.replace(/<\\?\?xml[^>]*>/ig, "") ;

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
         * ���ࣺ��ť
         */
        type: TYPE.TOOLBAR_BUTTON,

        /**
         * ������
         */
        config: {},

        /**
         * �����ĶԻ���
         */
        dialog: null,

        /**
         * ������ range ����
         */
        range: null,

        /**
         * ��ʼ������
         */
        init: function() {
            this.config = Lang.merge(defaultConfig, this.editor.config.pluginsConfig[this.name] || {});

            this._renderUI();
            this._bindUI();
        },

        /**
         * ��ʼ���Ի������
         */
        _renderUI: function() {
            var dialog = E.Menu.generateDropMenu(this.editor, this.domEl, [1, 0]);

            dialog.className += " " + DIALOG_CLS;
            this.dialog = dialog;
            this._renderDialog();

            if(UA.ie) E.Dom.setItemUnselectable(dialog);
        },

        _renderDialog: function() {
            var smileyConfig = E.Smilies[this.config["tabs"][0]], // TODO: ֧�ֶ�� tab
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
         * ���¼�
         */
        _bindUI: function() {
            var self = this;

            // range ����
            Event.on(this.domEl, "click", function() {
                self.range = E.Range.saveRange(self.editor);
            });

            // ע��?��ť����¼�
            Event.on(this.dialog, "click", function(ev) {
                var target = Event.getTarget(ev);

                switch(target.nodeName) {
                    case "IMG":
                        self._insertImage(target.src, target.getAttribute("alt"));
                        break;
                    case "SPAN":
                        self._insertImage(target.getAttribute("data-icon"), "");
                        break;
                    default: // ����ڷǰ�ť����ֹͣð�ݣ������Ի���
                        Event.stopPropagation(ev);
                }
            });
        },

        /**
         * ����ͼƬ
         */
        _insertImage: function(url, alt) {
            url = Lang.trim(url);

            // url Ϊ��ʱ��������
            if (url.length === 0) {
                return;
            }

            var editor = this.editor,
                range = this.range;

            // ����ͼƬ
            if (window.getSelection) { // W3C
                var img = editor.contentDoc.createElement("img");
                img.src = url;
                img.setAttribute("alt", alt);

                range.deleteContents(); // ���ѡ������
                range.insertNode(img); // ����ͼƬ

                // ʹ���������ͼƬʱ������ں���
                if(UA.webkit) {
                    var selection = editor.contentWin.getSelection();
                    selection.addRange(range);
                    selection.collapseToEnd();
                } else {
                    range.setStartAfter(img);
                }

                editor.contentWin.focus(); // ��ʾ���

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
 *   - Webkit �£����ܽ�һ�� document �ڴ����� dom �ڵ��ƶ�����һ�� document
 *     http://www.codingforums.com/archive/index.php/t-153219.html 
 */
// TODO:
//  1. ���ױ���֧��
//  2. ����Ķ������֧�֣����� alt �� title ��Ϣ

KISSY.Editor.add("plugins~source", function(E) {

    var Y = YAHOO.util, Dom = Y.Dom,
        UA = YAHOO.env.ua,
        TYPE = E.PLUGIN_TYPE,

        TOOLBAR_BUTTON_SELECTED = "ks-editor-toolbar-button-selected",
        SRC_MODE_CLS = "ks-editor-src-mode";

    /**
     * �鿴Դ������
     */
    E.addPlugin("source", {
        /**
         * ���ࣺ��ͨ��ť
         */
        type: TYPE.TOOLBAR_BUTTON,

        /**
         * ��ʼ������
         */
        init: function() {
            var editor = this.editor;

            this.iframe = editor.contentWin.frameElement;
            this.textarea = editor.textarea;

            // �� textarea ���� iframe ����
            this.iframe.parentNode.appendChild(editor.textarea);

            // ��� class
            Dom.addClass(this.domEl, "ks-editor-toolbar-source-button");
        },

        /**
         * ��Ӧ����
         */
        exec: function() {
            var editor = this.editor,
                srcOn = editor.sourceMode;

            // ͬ�����
            if(srcOn) {
                editor.contentDoc.body.innerHTML = this.textarea.value;
            } else {
                this.textarea.value = editor.getContentDocData();
            }

            // [bug fix] ie7-�£��л���Դ��ʱ��iframe �Ĺ�껹�ɼ������ص�
            if(UA.ie && UA.ie < 8) {
                editor.contentDoc.selection.empty();
            }

            // �л���ʾ
            this.textarea.style.display = srcOn ? "none" : "";
            this.iframe.style.display = srcOn ? "" : "none";

            // ����״̬
            editor.sourceMode = !srcOn;

            // ���°�ť״̬
            this._updateButtonState();
        },

        /**
         * ���°�ť״̬
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
         * ���ࣺ��ͨ��ť
         */
        type: TYPE.TOOLBAR_BUTTON,

        /**
         * ��Ӧ����
         */
        exec: function() {
            // TODO �ӹ�
            this.editor.execCommand(this.name);
        }
    });

 });

/**
 * TODO:
 *   - ie �£�ֻҪ�� dom ������undo �� redo �ͻ�ʧЧ��
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
         * ���ࣺ״̬�����
         */
        type: TYPE.STATUSBAR_ITEM,

        total: Infinity,

        remain: Infinity,

        threshold: 0,

        remainEl: null,

        /**
         * ��ʼ��
         */
        init: function() {
            var config = Lang.merge(defaultConfig, this.editor.config.pluginsConfig[this.name] || {});
            this.total = config["total"];
            this.threshold = config["threshold"];

            this.renderUI();
            this.bindUI();

            // ȷ���������������ݼ�����ɺ�
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
            // TODO: ��������/�����������
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
 *   - ���� GBK �����£�һ�������ַ��Ϊ 2
 */