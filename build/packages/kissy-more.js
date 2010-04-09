/*
Copyright 2010, KISSY UI Library v1.0.5
MIT Licensed
build: 524 Apr 6 09:10
*/
/**
 * @module  cookie
 * @author  lifesinger@gmail.com
 * @depends kissy
 */

KISSY.add('cookie', function(S) {

    var doc = document,
        encode = encodeURIComponent,
        decode = decodeURIComponent;

    S.Cookie = {

        /**
         * 获取 cookie 值
         * @return {string} 如果 name 不存在，返回 undefined
         */
        get: function(name) {
            var ret, m;

            if (isNotEmptyString(name)) {
                if ((m = doc.cookie.match('(?:^| )' + name + '(?:(?:=([^;]*))|;|$)'))) {
                    ret = m[1] ? decode(m[1]) : '';
                }
            }
            return ret;
        },

        set: function(name, val, expires, domain, path, secure) {
            var text = encode(val), date = expires;

            // 从当前时间开始，多少天后过期
            if (typeof date === 'number') {
                date = new Date();
                date.setTime(date.getTime() + expires * 86400000);
            }
            // expiration date
            if (date instanceof Date) {
                text += '; expires=' + date.toUTCString();
            }

            // domain
            if (isNotEmptyString(domain)) {
                text += '; domain=' + domain;
            }

            // path
            if (isNotEmptyString(path)) {
                text += '; path=' + path;
            }

            // secure
            if (secure) {
                text += '; secure';
            }

            doc.cookie = name + '=' + text;
        },

        remove: function(name) {
            // 立刻过期
            this.set(name, '', 0);
        }
    };

    function isNotEmptyString(val) {
        return typeof val === 'string' && val !== '';
    }

});

/**
 * Notes:
 *
 *  2010.04
 *   - get 方法要考虑 ie 下，
 *     值为空的 cookie 为 'test3; test3=3; test3tt=2; test1=t1test3; test3', 没有等于号。
 *     除了正则获取，还可以 split 字符串的方式来获取。
 *   - api 设计上，原本想借鉴 jQuery 的简明风格：S.cookie(name, ...), 但考虑到可扩展性，目前
 *     独立成静态工具类的方式更优。
 *
 *//*
Copyright 2010, KISSY UI Library v1.0.5
MIT Licensed
build: 545 Apr 9 13:24
*/
/**
 * from http://www.JSON.org/json2.js
 * 2010-03-20
 */

KISSY.add('json', function (S) {

    var JSON = S.JSON = window.JSON || { };

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                   this.getUTCFullYear() + '-' +
                   f(this.getUTCMonth() + 1) + '-' +
                   f(this.getUTCDate()) + 'T' +
                   f(this.getUTCHours()) + ':' +
                   f(this.getUTCMinutes()) + ':' +
                   f(this.getUTCSeconds()) + 'Z' : null;
        };

        String.prototype.toJSON =
        Number.prototype.toJSON =
        Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

        // If the string contains no control characters, no quote characters, and no
        // backslash characters, then we can safely slap some quotes around it.
        // Otherwise we must also replace the offending characters with safe escape
        // sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ?
               '"' + string.replace(escapable, function (a) {
                   var c = meta[a];
                   return typeof c === 'string' ? c :
                          '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
               }) + '"' :
               '"' + string + '"';
    }


    function str(key, holder) {

        // Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

        // If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
            typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

        // If we were called with a replacer function, then call the replacer to
        // obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

        // What happens next depends on the value's type.

        switch (typeof value) {
            case 'string':
                return quote(value);

            case 'number':

                // JSON numbers must be finite. Encode non-finite numbers as null.

                return isFinite(value) ? String(value) : 'null';

            case 'boolean':
            case 'null':

                // If the value is a boolean or null, convert it to a string. Note:
                // typeof null does not produce 'null'. The case is included here in
                // the remote chance that this gets fixed someday.

                return String(value);

            // If the type is 'object', we might be dealing with an object or an array or
            // null.

            case 'object':

                // Due to a specification blunder in ECMAScript, typeof null is 'object',
                // so watch out for that case.

                if (!value) {
                    return 'null';
                }

                // Make an array to hold the partial results of stringifying this object value.

                gap += indent;
                partial = [];

                // Is the value an array?

                if (Object.prototype.toString.apply(value) === '[object Array]') {

                    // The value is an array. Stringify every element. Use null as a placeholder
                    // for non-JSON values.

                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || 'null';
                    }

                    // Join all of the elements together, separated with commas, and wrap them in
                    // brackets.

                    v = partial.length === 0 ? '[]' :
                        gap ? '[\n' + gap +
                              partial.join(',\n' + gap) + '\n' +
                              mind + ']' :
                        '[' + partial.join(',') + ']';
                    gap = mind;
                    return v;
                }

                // If the replacer is an array, use it to select the members to be stringified.

                if (rep && typeof rep === 'object') {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        k = rep[i];
                        if (typeof k === 'string') {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                } else {

                    // Otherwise, iterate through all of the keys in the object.

                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                }

                // Join all of the member texts together, separated with commas,
                // and wrap them in braces.

                v = partial.length === 0 ? '{}' :
                    gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                          mind + '}' : '{' + partial.join(',') + '}';
                gap = mind;
                return v;
        }
    }

    // If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

            // The stringify method takes a value and an optional replacer, and an optional
            // space parameter, and returns a JSON text. The replacer can be a function
            // that can replace values, or an array of strings that will select the keys.
            // A default replacer method can be provided. Use of the space parameter can
            // produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

            // If the space parameter is a number, make an indent string containing that
            // many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

                // If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

            // If there is a replacer, it must be a function or an array.
            // Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                (typeof replacer !== 'object' ||
                 typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

            // Make a fake root object containing our value under the key of ''.
            // Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


    // If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

            // The parse method takes a text and an optional reviver function, and returns
            // a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

                // The walk method is used to recursively walk the resulting structure so
                // that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


            // Parsing happens in four stages. In the first stage, we replace certain
            // Unicode characters with escape sequences. JavaScript handles many characters
            // incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                           ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

            // In the second stage, we run the text against regular expressions that look
            // for non-JSON patterns. We are especially concerned with '()' and 'new'
            // because they can cause invocation, and '=' because it can cause mutation.
            // But just to be safe, we want to reject all unexpected forms.

            // We split the second stage into 4 regexp operations in order to work around
            // crippling inefficiencies in IE's and Safari's regexp engines. First we
            // replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
            // replace all simple value tokens with ']' characters. Third, we delete all
            // open brackets that follow a colon or comma or that begin the text. Finally,
            // we look to see that the remaining characters are only whitespace or ']' or
            // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/.
                test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
                replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
                replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

                // In the third stage we use the eval function to compile the text into a
                // JavaScript structure. The '{' operator is subject to a syntactic ambiguity
                // in JavaScript: it can begin a block or an object literal. We wrap the text
                // in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

                // In the optional fourth stage, we recursively walk the new structure, passing
                // each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                       walk({'': j}, '') : j;
            }

            // If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
});
/*
Copyright 2010, KISSY UI Library v1.0.5
MIT Licensed
build: 524 Apr 6 09:10
*/
/**
 * @module  ajax
 * @author  lifesinger@gmail.com
 * @depends kissy
 */

KISSY.add('ajax', function(S) {

    var doc = document,
        UA = S.UA;
    
    S.Ajax = {

        /**
         * Sends an HTTP request to a remote server.
         */
        request: function(/*url, options*/) {
            S.error('not implemented'); // TODO
        },

        /**
         * Load a JavaScript file from the server using a GET HTTP request, then execute it.
         */
        getScript: function(url, callback, charset) {
            var head = doc.getElementsByTagName('head')[0] || doc.documentElement,
                node = doc.createElement('script');

            node.src = url;
            if(charset) node.charset = charset;
            node.async = true;

            if (S.isFunction(callback)) {
                if (UA.ie) {
                    node.onreadystatechange = function() {
                        var rs = node.readyState;
                        if (rs === 'loaded' || rs === 'complete') {
                            // handle memory leak in IE
                            node.onreadystatechange = null;
                            callback();
                        }
                    };
                } else {
                    node.onload = callback;
                }
            }

            head.appendChild(node);
        }
    };

});

/**
 * Notes:
 *
 *  2010.04
 *   - api 考虑：jQuery 的全耦合在 jQuery 对象上，ajaxComplete 等方法显得不优雅。
 *         YUI2 的 YAHOO.util.Connect.Get.script 层级太深，YUI3 的 io 则野心
 *         过大，KISSY 借鉴 ExtJS, 部分方法借鉴 jQuery.
 *
 *//*
Copyright 2010, KISSY UI Library v1.0.5
MIT Licensed
build: 543 Apr 9 08:13
*/
/**
 * SWF UA info
 * author: lifesinger@gmail.com
 */

KISSY.add('swf-ua', function(S) {

    var UA = S.UA,
        version = 0, sF = 'ShockwaveFlash',
        ax6, mF, eP;

    if (UA.ie) {
        try {
            ax6 = new ActiveXObject(sF + '.' + sF + '.6');
            ax6.AllowScriptAccess = 'always';
        } catch(e) {
            if (ax6 !== null) {
                version = 6.0;
            }
        }

        if (version === 0) {
            try {
                version = numerify(
                    new ActiveXObject(sF + '.' + sF)
                        .GetVariable('$version')
                        .replace(/[A-Za-z\s]+/g, '')
                        .split(',')
                    );

            } catch (e) {
            }
        }
    } else {
        if ((mF = navigator.mimeTypes['application/x-shockwave-flash'])) {
            if ((eP = mF.enabledPlugin)) {
                version = numerify(
                    eP.description
                        .replace(/\s[rd]/g, '.')
                        .replace(/[a-z\s]+/ig, '')
                        .split('.')
                    );
            }
        }
    }

    function numerify(arr) {
        var ret = arr[0] + '.';
        switch (arr[2].toString().length) {
            case 1:
                ret += '00';
                break;
            case 2:
                ret += '0';
                break;
        }
        return (ret += arr[2]);
    }

    UA.flash = parseFloat(version);
});
/**
 * The SWF utility is a tool for embedding Flash applications in HTML pages.
 * author: lifesinger@gmail.com
 */

KISSY.add('swf', function(S) {

    var UA = S.UA,
        uid = S.now(),

        VERSION = 10.22,
        CID = 'clsid:d27cdb6e-ae6d-11cf-96b8-444553540000',
        TYPE = 'application/x-shockwave-flash',
        EXPRESS_INSTALL_URL = 'http://fpdownload.macromedia.com/pub/flashplayer/update/current/swf/autoUpdater.swf?' + uid,
        EVENT_HANDLER = 'KISSY.SWF.eventHandler',

        possibleAttributes = {align:'', allowNetworking:'', allowScriptAccess:'', base:'', bgcolor:'', menu:'', name:'', quality:'', salign:'', scale:'', tabindex:'', wmode:''};


    /**
     * Creates the SWF instance and keeps the configuration data
     *
     * @constructor
     * @param {String|HTMLElement} el The id of the element, or the element itself that the SWF will be inserted into.
     *        The width and height of the SWF will be set to the width and height of this container element.
     * @param {Object} params (optional) Configuration parameters for the Flash application and values for Flashvars
     *        to be passed to the SWF.
     */
    function SWF(el, swfUrl, params) {
        var self = this,
            id = 'ks-swf-' + uid++,
            flashVersion = parseFloat(params.version) || VERSION,
            isFlashVersionRight = UA.flash >= flashVersion,
            canExpressInstall = UA.flash >= 8.0,
            shouldExpressInstall = canExpressInstall && params.useExpressInstall && !isFlashVersionRight,
            flashUrl = (shouldExpressInstall) ? EXPRESS_INSTALL_URL : swfUrl,
            // TODO: rename
            flashvars = 'YUISwfId=' + id + '&YUIBridgeCallback=' + EVENT_HANDLER,
            ret = '<object ';

        self.id = id;
        SWF.instances[id] = self;

        if ((el = S.get(el)) && (isFlashVersionRight || shouldExpressInstall) && flashUrl) {
            ret += 'id="' + id + '" ';

            if (UA.ie) {
                ret += 'classid="' + CID + '" '
            } else {
                ret += 'type="' + TYPE + '" data="' + flashUrl + '" ';
            }

            ret += 'width="100%" height="100%">';

            if (UA.ie) {
                ret += '<param name="movie" value="' + flashUrl + '"/>';
            }

            for (var attr in params.fixedAttributes) {
                if (possibleAttributes.hasOwnProperty(attr)) {
                    ret += '<param name="' + attr + '" value="' + params.fixedAttributes[attr] + '"/>';
                }
            }

            for (var flashvar in params.flashVars) {
                var fvar = params.flashVars[flashvar];
                if (typeof fvar === 'string') {
                    flashvars += "&" + flashvar + "=" + encodeURIComponent(fvar);
                }
            }

            ret += '<param name="flashVars" value="' + flashvars + '"/>';
            ret += "</object>";

            el.innerHTML = ret;
            self.swf = S.get('#' + id);
        }
    }

    /**
     * The static collection of all instances of the SWFs on the page.
     * @static
     */
    SWF.instances = (S.SWF || { }).instances || { };

    /**
     * Handles an event coming from within the SWF and delegate it to a specific instance of SWF.
     * @static
     */
    SWF.eventHandler = function(swfId, event) {
        SWF.instances[swfId]._eventHandler(event);
    };

    S.augment(SWF, S.EventTarget);
    S.augment(SWF, {

        _eventHandler: function(event) {
            var self = this,
                type = event.type;

            if (type === 'log') {
                S.log(event.message);
            } else if(type) {
                self.fire(type, event);
            }
        },

        /**
         * Calls a specific function exposed by the SWF's ExternalInterface.
         * @param func {string} the name of the function to call
         * @param args {array} the set of arguments to pass to the function.
         */
        callSWF: function (func, args) {
            var self = this;
            if (self.swf[func]) {
                return self.swf[func].apply(self.swf, args || []);
            }
        }
    });

    S.SWF = SWF;
});
/**
 * Provides a swf based storage implementation.
 */

KISSY.add('swfstore', function(S, undefined) {

    var UA = S.UA, Cookie = S.Cookie,
        SWFSTORE = 'swfstore',
        doc = document;

    /**
     * Class for the YUI SWFStore util.
     * @constructor
     * @param el {String|HTMLElement} Container element for the Flash Player instance.
     * @param {String} swfUrl The URL of the SWF to be embedded into the page.
     * @param shareData {Boolean} Whether or not data should be shared across browsers
     * @param useCompression {Boolean} Container element for the Flash Player instance.
     */
    function SWFStore(el, swfUrl, shareData, useCompression) {
        var browser = 'other',
            cookie = Cookie.get(SWFSTORE),
            params,
            self = this;

        // convert booleans to strings for flashvars compatibility
        shareData = (shareData !== undefined ? shareData : true) + '';
        useCompression = (useCompression !== undefined ? useCompression : true) + '';

        // browser detection
        if (UA.ie) browser = 'ie';
        else if (UA.gecko) browser = 'gecko';
        else if (UA.webkit) browser = 'webkit';
        else if (UA.opera) browser = 'opera';

        // set cookie
        if (!cookie || cookie === 'null') {
            Cookie.set(SWFSTORE, (cookie = Math.round(Math.random() * Math.PI * 100000)));
        }

        params = {
            version: 9.115,
            useExpressInstall: false,
            fixedAttributes: {
                allowScriptAccess:'always',
                allowNetworking:'all',
                scale:'noScale'
            },
            flashVars: {
                allowedDomain : doc.location.hostname,
                shareData: shareData,
                browser: cookie,
                useCompression: useCompression
            }
        };

        self.embeddedSWF = new S.SWF(el, swfUrl || 'swfstore.swf', params);

        // 让 flash fired events 能通知到 swfstore
        self.embeddedSWF._eventHandler = function(event) {
            S.SWF.prototype._eventHandler.call(self, event);
        }
    }

    // events support
    S.augment(SWFStore, S.EventTarget);

    // methods
    S.augment(SWFStore, {
        /**
         * Saves data to local storage. It returns a String that can
         * be one of three values: 'true' if the storage succeeded; 'false' if the user
         * has denied storage on their machine or storage space allotted is not sufficient.
         * <p>The size limit for the passed parameters is ~40Kb.</p>
         * @param data {Object} The data to store
         * @param location {String} The name of the 'cookie' or store
         * @return {Boolean} Whether or not the save was successful
         */
        setItem: function(location, data) {
            if (typeof data === 'string') { // 快速通道
                // double encode strings to prevent parsing error
                // http://yuilibrary.com/projects/yui2/ticket/2528593
                data = data.replace(/\\/g, '\\\\');
            } else {
                data = S.JSON.stringify(data) + ''; // 比如：stringify(undefined) = undefined, 强制转换为字符串
            }

            // 当 name 为空值时，目前会触发 swf 的内部异常，此处不允许空键值
            if ((location = S.trim(location + ''))) {
                try {
                    return this.embeddedSWF.callSWF('setItem', [location, data]);
                }
                catch(e) { // 当 swf 异常时，进一步捕获信息
                    this.fire('error', { message: e });
                }
            }
        }
    });

    S.each([
        'getValueAt', 'getNameAt', 'getTypeAt',
        'getValueOf', 'getTypeOf',
        'getItems', 'getLength',
        'removeItem', 'removeItemAt', 'clear',
        'getShareData', 'setShareData',
        'getUseCompression', 'setUseCompression',
        'calculateCurrentSize', 'hasAdequateDimensions', 'setSize',
        'getModificationDate', 'displaySettings'
    ], function(methodName) {
        SWFStore.prototype[methodName] = function() {
            try {
                return this.embeddedSWF.callSWF(methodName, S.makeArray(arguments));
            }
            catch(e) { // 当 swf 异常时，进一步捕获信息
                this.fire('error', { message: e });
            }
        }
    });

    S.SWFStore = SWFStore;
});

/**
 * TODO:
 *   - 广播功能：当数据有变化时，自动通知各个页面
 *
 *   - Bug: 点击 Remove, 当 name 不存在时，会将最后一条删除
 */
/*
Copyright 2010, KISSY UI Library v1.0.5
MIT Licensed
build: 537 Apr 8 19:58
*/
/**
 * 数据延迟加载组件
 * 包括 img, textarea, 以及特定元素即将出现时的回调函数
 * @module      datalazyload
 * @creator     玉伯<lifesinger@gmail.com>
 * @depends     kissy-core, yahoo-dom-event
 */
KISSY.add('datalazyload', function(S, undefined) {

    var DOM = S.DOM, Event = S.Event, YDOM = YAHOO.util.Dom,
        win = window, doc = document,
        IMG_DATA_SRC = 'data-lazyload-src',
        TEXTAREA_DATA_CLS = 'ks-datalazyload',
        CUSTOM_IMG_DATA_SRC = IMG_DATA_SRC + '-custom',
        CUSTOM_TEXTAREA_DATA_CLS = TEXTAREA_DATA_CLS + '-custom',
        MOD = { AUTO: 'auto', MANUAL: 'manual' },
        DEFAULT = 'default', NONE = 'none',

        defaultConfig = {

            /**
             * 懒处理模式
             *   auto   - 自动化。html 输出时，不对 img.src 做任何处理
             *   manual - 输出 html 时，已经将需要延迟加载的图片的 src 属性替换为 IMG_DATA_SRC
             * 注：对于 textarea 数据，只有手动模式
             */
            mod: MOD.MANUAL,

            /**
             * 当前视窗往下，diff px 外的 img/textarea 延迟加载
             * 适当设置此值，可以让用户在拖动时感觉数据已经加载好
             * 默认为当前视窗高度（两屏以外的才延迟加载）
             */
            diff: DEFAULT,

            /**
             * 图像的占位图
             */
            placeholder: 'http://a.tbcdn.cn/kissy/1.0.4/build/datalazyload/dot.gif'
        },
        DP = DataLazyload.prototype;

    /**
     * 延迟加载组件
     * @constructor
     */
    function DataLazyload(containers, config) {
        var self = this;

        // factory or constructor
        if (!(self instanceof DataLazyload)) {
            return new DataLazyload(containers, config);
        }

        // 允许仅传递 config 一个参数
        if (config === undefined) {
            config = containers;
            containers = [doc];
        }

        // containers 是一个 HTMLElement 时
        if (!S.isArray(containers)) {
            containers = [S.get(containers) || doc];
        }

        /**
         * 图片所在容器（可以多个），默认为 [doc]
         * @type Array
         */
        self.containers = containers;

        /**
         * 配置参数
         * @type Object
         */
        self.config = S.merge(defaultConfig, config || {});

        /**
         * 需要延迟下载的图片
         * @type Array
         */
        //self.images

        /**
         * 需要延迟处理的 textarea
         * @type Array
         */
        //self.areaes

        /**
         * 和延迟项绑定的回调函数
         * @type object
         */
        self.callbacks = {els: [], fns: []};

        /**
         * 开始延迟的 Y 坐标
         * @type number
         */
        //self.threshold

        self._init();
    }

    S.mix(DP, {

        /**
         * 初始化
         * @protected
         */
        _init: function() {
            var self = this;

            self.threshold = self._getThreshold();
            self._filterItems();

            if (self._getItemsLength()) {
                self._initLoadEvent();
            }
        },

        /**
         * 初始化加载事件
         * @protected
         */
        _initLoadEvent: function() {
            var timer, self = this;

            // scroll 和 resize 时，加载图片
            Event.on(win, 'scroll', loader);
            Event.on(win, 'resize', function() {
                self.threshold = self._getThreshold();
                loader();
            });

            // 需要立即加载一次，以保证第一屏的延迟项可见
            if (self._getItemsLength()) {
                S.ready(function() {
                    loadItems();
                });
            }

            // 加载函数
            function loader() {
                if (timer) return;
                timer = setTimeout(function() {
                    loadItems();
                    timer = null;
                }, 100); // 0.1s 内，用户感觉流畅
            }

            // 加载延迟项
            function loadItems() {
                self._loadItems();

                if (self._getItemsLength() === 0) {
                    Event.remove(win, 'scroll', loader);
                    Event.remove(win, 'resize', loader);
                }
            }
        },

        /**
         * 获取并初始化需要延迟的 img 和 textarea
         * @protected
         */
        _filterItems: function() {
            var self = this,
                containers = self.containers,
                threshold = self.threshold,
                placeholder = self.config.placeholder,
                isManualMod = self.config.mod === MOD.MANUAL,
                n, N, imgs, areaes, i, len, img, area, data_src,
                lazyImgs = [], lazyAreaes = [];

            for (n = 0,N = containers.length; n < N; ++n) {
                imgs = S.query('img', containers[n]);

                for (i = 0,len = imgs.length; i < len; ++i) {
                    img = imgs[i];
                    data_src = img.getAttribute(IMG_DATA_SRC);

                    if (isManualMod) { // 手工模式，只处理有 data-src 的图片
                        if (data_src) {
                            img.src = placeholder;
                            lazyImgs.push(img);
                        }
                    } else { // 自动模式，只处理 threshold 外无 data-src 的图片
                        // 注意：已有 data-src 的项，可能已有其它实例处理过，重复处理
                        // 会导致 data-src 变成 placeholder
                        if (YDOM.getY(img) > threshold && !data_src) {
                            img.setAttribute(IMG_DATA_SRC, img.src);
                            img.src = placeholder;
                            lazyImgs.push(img);
                        }
                    }
                }

                // 处理 textarea
                areaes = S.query('textarea', containers[n]);
                for (i = 0,len = areaes.length; i < len; ++i) {
                    area = areaes[i];
                    if (DOM.hasClass(area, TEXTAREA_DATA_CLS)) {
                        lazyAreaes.push(area);
                    }
                }
            }

            self.images = lazyImgs;
            self.areaes = lazyAreaes;
        },

        /**
         * 加载延迟项
         */
        _loadItems: function() {
            var self = this;

            self._loadImgs();
            self._loadAreaes();
            self._fireCallbacks();
        },

        /**
         * 加载图片
         * @protected
         */
        _loadImgs: function() {
            var self = this,
                imgs = self.images,
                scrollTop = YDOM.getDocumentScrollTop(),
                threshold = self.threshold + scrollTop,
                i, img, data_src, remain = [];

            for (i = 0; img = imgs[i++];) {
                if (YDOM.getY(img) <= threshold) {
                    self._loadImgSrc(img);
                } else {
                    remain.push(img);
                }
            }

            self.images = remain;
        },

        /**
         * 加载图片 src
         * @static
         */
        _loadImgSrc: function(img, flag) {
            flag = flag || IMG_DATA_SRC;
            var data_src = img.getAttribute(flag);

            if (data_src && img.src != data_src) {
                img.src = data_src;
                img.removeAttribute(flag);
            }
        },

        /**
         * 加载 textarea 数据
         * @protected
         */
        _loadAreaes: function() {
            var self = this,
                areaes = self.areaes,
                scrollTop = YDOM.getDocumentScrollTop(),
                threshold = self.threshold + scrollTop,
                i, area, el, remain = [];

            for (i = 0; area = areaes[i++];) {
                el = area;

                // 注：area 可能处于 display: none 状态，Dom.getY(area) 返回 undefined
                //    这种情况下用 area.parentNode 的 Y 值来判断
                if(YDOM.getY(el) === undefined) {
                    el = area.parentNode;
                }

                if (YDOM.getY(el) <= threshold) {
                    self._loadDataFromArea(area.parentNode, area);
                } else {
                    remain.push(area);
                }
            }

            self.areaes = remain;
        },

        /**
         * 从 textarea 中加载数据
         * @static
         */
        _loadDataFromArea: function(container, area) {
            //container.innerHTML = area.value; // 这种方式会导致 chrome 缓存 bug

            // 采用隐藏不去除方式
            var content = DOM.create(area.value);
            area.style.display = NONE;
            //area.value = ''; // clear content  不能清空，否则 F5 刷新，会丢内容
            area.className = ''; // clear hook
            container.insertBefore(content, area);

            // 执行里面的脚本
            if(!S.UA.gecko) { // firefox 会自动执行 TODO: feature test
                S.query('script', content).each(function(script) {
                    S.globalEval(script.text);
                });
            }
        },

        /**
         * 触发回调
         * @protected
         */
        _fireCallbacks: function() {
            var self = this,
                callbacks = self.callbacks,
                els = callbacks.els, fns = callbacks.fns,
                scrollTop = YDOM.getDocumentScrollTop(),
                threshold = self.threshold + scrollTop,
                i, el, fn, remainEls = [], remainFns = [];

            for (i = 0; (el = els[i]) && (fn = fns[i++]);) {
                if (YDOM.getY(el) <= threshold) {
                    fn.call(el);
                } else {
                    remainEls.push(el);
                    remainFns.push(fn);
                }

            }

            callbacks.els = remainEls;
            callbacks.fns = remainFns;
        },

        /**
         * 添加回调函数。当 el 即将出现在视图中时，触发 fn
         */
        addCallback: function(el, fn) {
            el = S.get(el);
            if (el && typeof fn === 'function') {
                this.callbacks.els.push(el);
                this.callbacks.fns.push(fn);
            }
        },

        /**
         * 获取阈值
         * @protected
         */
        _getThreshold: function() {
            var diff = this.config.diff,
                ret = YDOM.getViewportHeight();

            if (diff === DEFAULT) return 2 * ret; // diff 默认为当前视窗高度（两屏以外的才延迟加载）
            else return ret + diff;
        },

        /**
         * 获取当前延迟项的数量
         * @protected
         */
        _getItemsLength: function() {
            var self = this;
            return self.images.length + self.areaes.length + self.callbacks.els.length;
        },

        /**
         * 加载自定义延迟数据
         * @static
         */
        loadCustomLazyData: function(containers, type, flag) {
            var self = this, area, imgs;


            // 支持数组
            if (!S.isArray(containers)) {
                containers = [S.get(containers)];
            }

            // 遍历处理
            S.each(containers, function(container) {
                switch (type) {
                    case 'textarea-data':
                        area = S.get('textarea', container);
                        if (area && DOM.hasClass(area, flag || CUSTOM_TEXTAREA_DATA_CLS)) {
                            self._loadDataFromArea(container, area);
                        }
                        break;
                    //case 'img-src':
                    default:
                        //S.log('loadCustomLazyData container = ' + container.src);
                        if (container.nodeName === 'IMG') { // 本身就是图片
                            imgs = [container];
                        } else {
                            imgs = S.query('img', container);
                        }
                        for (var i = 0, len = imgs.length; i < len; i++) {
                            self._loadImgSrc(imgs[i], flag || CUSTOM_IMG_DATA_SRC);
                        }
                }
            });
        }
    });

    // attach static methods
    S.mix(DataLazyload, DP, true, ['loadCustomLazyData', '_loadImgSrc', '_loadDataFromArea']);

    S.DataLazyload = DataLazyload;
});

/**
 * NOTES:
 *
 * 模式为 auto 时：
 *  1. 在 Firefox 下非常完美。脚本运行时，还没有任何图片开始下载，能真正做到延迟加载。
 *  2. 在 IE 下不尽完美。脚本运行时，有部分图片已经与服务器建立链接，这部分 abort 掉，
 *     再在滚动时延迟加载，反而增加了链接数。
 *  3. 在 Safari 和 Chrome 下，因为 webkit 内核 bug，导致无法 abort 掉下载。该
 *     脚本完全无用。
 *  4. 在 Opera 下，和 Firefox 一致，完美。
 *
 * 模式为 manual 时：（要延迟加载的图片，src 属性替换为 data-lazyload-src, 并将 src 的值赋为 placeholder ）
 *  1. 在任何浏览器下都可以完美实现。
 *  2. 缺点是不渐进增强，无 JS 时，图片不能展示。
 *
 * 缺点：
 *  1. 对于大部分情况下，需要拖动查看内容的页面（比如搜索结果页），快速滚动时加载有损用
 *     户体验（用户期望所滚即所得），特别是网速不好时。
 *  2. auto 模式不支持 Webkit 内核浏览器；IE 下，有可能导致 HTTP 链接数的增加。
 *
 * 优点：
 *  1. 可以很好的提高页面初始加载速度。
 *  2. 第一屏就跳转，延迟加载图片可以减少流量。
 *
 * 参考资料：
 *  1. http://davidwalsh.name/lazyload MooTools 的图片延迟插件
 *  2. http://vip.qq.com/ 模板输出时，就替换掉图片的 src
 *  3. http://www.appelsiini.net/projects/lazyload jQuery Lazyload
 *  4. http://www.dynamixlabs.com/2008/01/17/a-quick-look-add-a-loading-icon-to-your-larger-images/
 *  5. http://www.nczonline.net/blog/2009/11/30/empty-image-src-can-destroy-your-site/
 *
 * 特别要注意的测试用例:
 *  1. 初始窗口很小，拉大窗口时，图片加载正常
 *  2. 页面有滚动位置时，刷新页面，图片加载正常
 *  3. 手动模式，第一屏有延迟图片时，加载正常
 *
 * 2009-12-17 补充：
 *  1. textarea 延迟加载约定：页面中需要延迟的 dom 节点，放在
 *       <textarea class='ks-datalazysrc invisible'>dom code</textarea>
 *     里。可以添加 hidden 等 class, 但建议用 invisible, 并设定 height = '实际高度'.
 *     这样可以保证滚动时，diff 更真实有效。
 *     注意：textarea 加载后，会替换掉父容器中的所有内容。
 *  2. 延迟 callback 约定：dataLazyload.addCallback(el, fn) 表示当 el 即将出现时，触发 fn.
 *  3. 所有操作都是最多触发一次，比如 callback. 来回拖动滚动条时，只有 el 第一次出现时会触发 fn 回调。
 */

/**
 * TODO:
 *   - [取消] 背景图片的延迟加载（对于 css 里的背景图片和 sprite 很难处理）
 *   - [取消] 加载时的 loading 图（对于未设定大小的图片，很难完美处理[参考资料 4]）
 */

/**
 * UPDATE LOG:
 *   - 2010-04-05 yubo 重构，使得对 YUI 的依赖仅限于 YDOM
 *   - 2009-12-17 yubo 将 imglazyload 升级为 datalazyload, 支持 textarea 方式延迟和特定元素即将出现时的回调函数
 */
/*
Copyright 2010, KISSY UI Library v1.0.5
MIT Licensed
build: 527 Apr 6 22:48
*/
/**
 * 提示补全组件
 * @module      suggest
 * @creator     玉伯<lifesinger@gmail.com>
 * @depends     kissy-core, yahoo-dom-event
 */
KISSY.add("suggest", function(S, undefined) {

    var YDOM = YAHOO.util.Dom, DOM = S.DOM, Event = S.Event,
        win = window, doc = document,
        head = doc.getElementsByTagName("head")[0],
        ie = YAHOO.env.ua.ie, ie6 = (ie === 6),

        CALLBACK_STR = "g_ks_suggest_callback", // 约定的全局回调函数
        STYLE_ID = "ks-suggest-style", // 样式 style 元素的 id

        CONTAINER_CLASS = "ks-suggest-container",
        KEY_EL_CLASS = "ks-suggest-key", // 提示层中，key 元素的 class
        RESULT_EL_CLASS = "ks-suggest-result", // 提示层中，result 元素的 class
        SELECTED_ITEM_CLASS = "selected", // 提示层中，选中项的 class
        ODD_ITEM_CLASS = "odd", // 提示层中，奇数项的 class
        EVEN_ITEM_CLASS = "even", // 提示层中，偶数项的 class
        BOTTOM_CLASS = "ks-suggest-bottom",
        CLOSE_BTN_CLASS = "ks-suggest-close-btn",
        SHIM_CLASS = "ks-suggest-shim", // iframe shim 的 class

        EVENT_DATA_REQUEST = "dataRequest",
        EVENT_DATA_RETURN = "dataReturn",
        EVENT_SHOW = "show",
        EVENT_ITEM_SELECT = "itemSelect",

        /**
         * Suggest的默认配置
         */
        defaultConfig = {
            /**
             * 用户附加给悬浮提示层的 class
             *
             * 提示层的默认结构如下：
             * <div class="suggest-container [container-class]">
             *     <ol>
             *         <li>
             *             <span class="suggest-key">...</span>
             *             <span class="suggest-result">...</span>
             *         </li>
             *     </ol>
             *     <div class="suggest-bottom">
             *         <a class="suggest-close-btn">...</a>
             *     </div>
             * </div>
             * @type String
             */
            containerCls: "",

            /**
             * 提示层的宽度
             * 注意：默认情况下，提示层的宽度和input输入框的宽度保持一致
             * 示范取值："200px", "10%"等，必须带单位
             * @type String
             */
            containerWidth: "auto",

            /**
             * result的格式
             * @type String
             */
            resultFormat: "约%result%条结果",

            /**
             * 是否显示关闭按钮
             * @type Boolean
             */
            showCloseBtn: false,

            /**
             * 关闭按钮上的文字
             * @type String
             */
            closeBtnText: "关闭",

            /**
             * 是否需要iframe shim
             * @type Boolean
             */
            useShim: ie6,

            /**
             * 定时器的延时
             * @type Number
             */
            timerDelay: 200,

            /**
             * 初始化后，自动激活
             * @type Boolean
             */
            autoFocus: false,

            /**
             * 鼠标点击完成选择时，是否自动提交表单
             * @type Boolean
             */
            submitFormOnClickSelect: true
        };

    /**
     * 提示补全组件
     * @class Suggest
     * @constructor
     * @param {String|HTMLElement} textInput
     * @param {String} dataSource
     * @param {Object} config
     */
    function Suggest(textInput, dataSource, config) {
        var self = this;

        // allow instantiation without the new operator
        if (!(self instanceof Suggest)) {
            return new Suggest(textInput, dataSource, config);
        }

        /**
         * 文本输入框
         * @type HTMLElement
         */
        self.textInput = S.get(textInput);

        /**
         * 获取数据的URL 或 JSON格式的静态数据
         * @type {String|Object}
         */
        self.dataSource = dataSource;

        /**
         * JSON静态数据源
         * @type Object 格式为 {"query1" : [["key1", "result1"], []], "query2" : [[], []]}
         */
        self.JSONDataSource = S.isPlainObject(dataSource) ? dataSource : null;

        /**
         * 通过jsonp返回的数据
         * @type Object
         */
        self.returnedData = null;

        /**
         * 配置参数
         * @type Object
         */
        self.config = S.merge(defaultConfig, config || { });

        /**
         * 存放提示信息的容器
         * @type HTMLElement
         */
        self.container = null;

        /**
         * 输入框的值
         * @type String
         */
        self.query = "";

        /**
         * 获取数据时的参数
         * @type String
         */
        self.queryParams = "";

        /**
         * 内部定时器
         * @private
         * @type Object
         */
        self._timer = null;

        /**
         * 计时器是否处于运行状态
         * @private
         * @type Boolean
         */
        self._isRunning = false;

        /**
         * 获取数据的script元素
         * @type HTMLElement
         */
        self.dataScript = null;

        /**
         * 数据缓存
         * @private
         * @type Object
         */
        self._dataCache = {};

        /**
         * 最新script的时间戳
         * @type String
         */
        self._latestScriptTime = "";

        /**
         * script返回的数据是否已经过期
         * @type Boolean
         */
        self._scriptDataIsOut = false;

        /**
         * 是否处于键盘选择状态
         * @private
         * @type Boolean
         */
        self._onKeyboardSelecting = false;

        /**
         * 提示层的当前选中项
         * @type Boolean
         */
        self.selectedItem = null;

        // init
        self._init();
    }

    S.mix(Suggest.prototype, {
        /**
         * 初始化方法
         * @protected
         */
        _init: function() {
            var self = this;
            
            // init DOM
            self._initTextInput();
            self._initContainer();
            if (self.config.useShim) self._initShim();
            self._initStyle();

            // window resize event
            self._initResizeEvent();
        },

        /**
         * 初始化输入框
         * @protected
         */
        _initTextInput: function() {
            var self = this;

            // turn off autocomplete
            self.textInput.setAttribute("autocomplete", "off");

            // focus
            // 2009-12-10 yubo: 延迟到 keydown 中 start
            //            Event.on(this.textInput, "focus", function() {
            //                instance.start();
            //            });

            // blur
            Event.on(self.textInput, "blur", function() {
                self.stop();
                self.hide();
            });

            // auto focus
            if (self.config.autoFocus) self.textInput.focus();

            // keydown
            // 注：截至目前，在Opera9.64中，输入法开启时，依旧不会触发任何键盘事件
            var pressingCount = 0; // 持续按住某键时，连续触发的keydown次数。注意Opera只会触发一次。
            Event.on(self.textInput, "keydown", function(ev) {
                var keyCode = ev.keyCode;
                //console.log("keydown " + keyCode);

                switch (keyCode) {
                    case 27: // ESC键，隐藏提示层并还原初始输入
                        self.hide();
                        self.textInput.value = self.query;

                        // 当输入框为空时，按下 ESC 键，输入框失去焦点
                        if(self.query.length === 0) {
                            self.textInput.blur();
                        }
                        break;
                    case 13: // ENTER键
                        // 提交表单前，先隐藏提示层并停止计时器
                        self.textInput.blur(); // 这一句还可以阻止掉浏览器的默认提交事件

                        // 如果是键盘选中某项后回车，触发onItemSelect事件
                        if (self._onKeyboardSelecting) {
                            if (self.textInput.value == self._getSelectedItemKey()) { // 确保值匹配
                                self.fire(EVENT_ITEM_SELECT);
                            }
                        }

                        // 提交表单
                        self._submitForm();
                        break;
                    case 40: // DOWN键
                    case 38: // UP键
                        // 按住键不动时，延时处理
                        if (pressingCount++ == 0) {
                            if (self._isRunning) self.stop();
                            self._onKeyboardSelecting = true;
                            self.selectItem(keyCode === 40);

                        } else if (pressingCount == 3) {
                            pressingCount = 0;
                        }
                        break;
                }

                // 非 DOWN/UP 键时，开启计时器
                if (keyCode != 40 && keyCode != 38) {
                    if (!self._isRunning) {
                        // 1. 当网速较慢，js还未下载完时，用户可能就已经开始输入
                        //    这时，focus事件已经不会触发，需要在keyup里触发定时器
                        // 2. 非DOWN/UP键时，需要激活定时器
                        self.start();
                    }
                    self._onKeyboardSelecting = false;
                }
            });

            // reset pressingCount
            Event.on(self.textInput, "keyup", function() {
                //console.log("keyup");
                pressingCount = 0;
            });
        },

        /**
         * 初始化提示层容器
         * @protected
         */
        _initContainer: function() {
            // create
            var container = doc.createElement("div"),
                customContainerClass = this.config.containerCls;

            container.className = CONTAINER_CLASS;
            if (customContainerClass) {
                container.className += " " + customContainerClass;
            }
            container.style.position = "absolute";
            container.style.visibility = "hidden";
            this.container = container;

            this._setContainerRegion();
            this._initContainerEvent();

            // append
            doc.body.insertBefore(container, doc.body.firstChild);
        },

        /**
         * 设置容器的left, top, width
         * @protected
         */
        _setContainerRegion: function() {
            var self = this,
                r = YDOM.getRegion(self.textInput),
                left = r.left,
                w = r.right - left - 2;  // 减去border的2px

            // bug fix: w 应该判断下是否大于 0, 后边设置 width 的时候如果小于 0, ie 下会报参数无效的错误
            w = w > 0 ? w : 0;

            // ie8 兼容模式
            // document.documentMode:
            // 5 - Quirks Mode
            // 7 - IE7 Standards
            // 8 - IE8 Standards
            var docMode = doc.documentMode;
            if (docMode === 7 && (ie === 7 || ie === 8)) {
                left -= 2;
            } else if (S.UA.gecko) { // firefox下左偏一像素 注：当 input 所在的父级容器有 margin: auto 时会出现
                left++;
            }

            self.container.style.left = left + "px";
            self.container.style.top = r.bottom + "px";

            if (self.config.containerWidth == "auto") {
                self.container.style.width = w + "px";
            } else {
                self.container.style.width = self.config.containerWidth;
            }
        },

        /**
         * 初始化容器事件
         * 子元素都不用设置事件，冒泡到这里统一处理
         * @protected
         */
        _initContainerEvent: function() {
            var self = this;

            // 鼠标事件
            Event.on(self.container, "mousemove", function(ev) {
                //console.log("mouse move");
                var target = ev.target;

                if (target.nodeName != "LI") {
                    target = YDOM.getAncestorByTagName(target, "li");
                }
                if (YDOM.isAncestor(self.container, target)) {
                    if (target != self.selectedItem) {
                        // 移除老的
                        self._removeSelectedItem();
                        // 设置新的
                        self._setSelectedItem(target);
                    }
                }
            });

            var mouseDownItem = null;
            self.container.onmousedown = function(e) {
                // 鼠标按下处的item
                mouseDownItem = e.target;

                // 鼠标按下时，让输入框不会失去焦点
                // 1. for IE
                self.textInput.onbeforedeactivate = function() {
                    win.event.returnValue = false;
                    self.textInput.onbeforedeactivate = null;
                };
                // 2. for W3C
                return false;
            };

            // mouseup事件
            Event.on(self.container, "mouseup", function(ev) {
                // 当mousedown在提示层，但mouseup在提示层外时，点击无效
                if (!self._isInContainer([ev.pageX, ev.pageY])) return;

                var target = ev.target;
                // 在提示层A项处按下鼠标，移动到B处释放，不触发onItemSelect
                if (target != mouseDownItem) return;

                // 点击在关闭按钮上
                if (target.className == CLOSE_BTN_CLASS) {
                    self.hide();
                    return;
                }

                // 可能点击在li的子元素上
                if (target.nodeName != "LI") {
                    target = YDOM.getAncestorByTagName(target, "li");
                }
                // 必须点击在container内部的li上
                if (YDOM.isAncestor(self.container, target)) {
                    self._updateInputFromSelectItem(target);

                    // 触发选中事件
                    //console.log("on item select");
                    self.fire(EVENT_ITEM_SELECT);

                    // 提交表单前，先隐藏提示层并停止计时器
                    self.textInput.blur();

                    // 提交表单
                    self._submitForm();
                }
            });
        },

        /**
         * click选择 or enter后，提交表单
         */
        _submitForm: function() {
            // 注：对于键盘控制enter选择的情况，由html自身决定是否提交。否则会导致某些输入法下，用enter选择英文时也触发提交
            if (this.config.submitFormOnClickSelect) {
                var form = this.textInput.form;
                if (!form) return;

                // 通过js提交表单时，不会触发onsubmit事件
                // 需要js自己触发
                if (doc.createEvent) { // w3c
                    var evObj = doc.createEvent("MouseEvents");
                    evObj.initEvent("submit", true, false);
                    form.dispatchEvent(evObj);
                }
                else if (doc.createEventObject) { // ie
                    form.fireEvent("onsubmit");
                }

                form.submit();
            }
        },

        /**
         * 判断p是否在提示层内
         * @param {Array} p [x, y]
         */
        _isInContainer: function(p) {
            var r = YDOM.getRegion(this.container);
            return p[0] >= r.left && p[0] <= r.right && p[1] >= r.top && p[1] <= r.bottom;
        },

        /**
         * 给容器添加iframe shim层
         * @protected
         */
        _initShim: function() {
            var iframe = doc.createElement("iframe");
            iframe.src = "about:blank";
            iframe.className = SHIM_CLASS;
            iframe.style.position = "absolute";
            iframe.style.visibility = "hidden";
            iframe.style.border = "none";
            this.container.shim = iframe;

            this._setShimRegion();
            doc.body.insertBefore(iframe, doc.body.firstChild);
        },

        /**
         * 设置shim的left, top, width
         * @protected
         */
        _setShimRegion: function() {
            var container = this.container, shim = container.shim;
            if (shim) {
                shim.style.left = (parseInt(container.style.left) - 2) + "px"; // 解决吞边线bug
                shim.style.top = container.style.top;
                shim.style.width = (parseInt(container.style.width) + 2) + "px";
            }
        },

        /**
         * 初始化样式
         * @protected
         */
        _initStyle: function() {
            var styleEl = S.get('#' + STYLE_ID);
            if (styleEl) return; // 防止多个实例时重复添加

            var style = ".ks-suggest-container{background:white;border:1px solid #999;z-index:99999}"
                + ".ks-suggest-shim{z-index:99998}"
                + ".ks-suggest-container li{color:#404040;padding:1px 0 2px;font-size:12px;line-height:18px;float:left;width:100%}"
                + ".ks-suggest-container li.selected{background-color:#39F;cursor:default}"
                + ".ks-suggest-key{float:left;text-align:left;padding-left:5px}"
                + ".ks-suggest-result{float:right;text-align:right;padding-right:5px;color:green}"
                + ".ks-suggest-container li.selected span{color:#FFF;cursor:default}"
                // + ".ks-suggest-container li.selected .suggest-result{color:green}"
                + ".ks-suggest-bottom{padding:0 5px 5px}"
                + ".ks-suggest-close-btn{float:right}"
                + ".ks-suggest-container li,.suggest-bottom{overflow:hidden;zoom:1;clear:both}"
                /* hacks */
                + ".ks-suggest-container{*margin-left:2px;_margin-left:-2px;_margin-top:-3px}";

            styleEl = doc.createElement("style");
            styleEl.id = STYLE_ID;
            head.appendChild(styleEl); // 先添加到DOM树中，都在cssText里的hack会失效

            if (styleEl.styleSheet) { // IE
                styleEl.styleSheet.cssText = style;
            } else { // W3C
                styleEl.appendChild(doc.createTextNode(style));
            }
        },

        /**
         * window.onresize时，调整提示层的位置
         * @protected
         */
        _initResizeEvent: function() {
            var self = this, resizeTimer;

            Event.on(win, "resize", function() {
                if (resizeTimer) {
                    clearTimeout(resizeTimer);
                }

                resizeTimer = setTimeout(function() {
                    self._setContainerRegion();
                    self._setShimRegion();
                }, 50);
            });
        },

        /**
         * 启动计时器，开始监听用户输入
         */
        start: function() {
            var self = this;
            
            Suggest.focusInstance = self;
            self._timer = setTimeout(function() {
                self.updateContent();
                self._timer = setTimeout(arguments.callee, self.config.timerDelay);
            }, self.config.timerDelay);

            self._isRunning = true;
        },

        /**
         * 停止计时器
         */
        stop: function() {
            Suggest.focusInstance = null;
            clearTimeout(this._timer);
            this._isRunning = false;
        },

        /**
         * 显示提示层
         */
        show: function() {
            if (this.isVisible()) return;
            var container = this.container, shim = container.shim;

            container.style.visibility = "";

            if (shim) {
                if (!shim.style.height) { // 第一次显示时，需要设定高度
                    var r = YDOM.getRegion(container);
                    shim.style.height = (r.bottom - r.top - 2) + "px";
                }
                shim.style.visibility = "";
            }
        },

        /**
         * 隐藏提示层
         */
        hide: function() {
            if (!this.isVisible()) return;
            var container = this.container, shim = container.shim;
            //console.log("hide");

            if (shim) shim.style.visibility = "hidden";
            container.style.visibility = "hidden";
        },

        /**
         * 提示层是否显示
         */
        isVisible: function() {
            return this.container.style.visibility != "hidden";
        },

        /**
         * 更新提示层的数据
         */
        updateContent: function() {
            var self = this;
            if (!self._needUpdate()) return;
            //console.log("update data");

            self._updateQueryValueFromInput();
            var q = self.query;

            // 1. 输入为空时，隐藏提示层
            if (!S.trim(q).length) {
                self._fillContainer("");
                self.hide();
                return;
            }

            if (self._dataCache[q] !== undefined) { // 2. 使用缓存数据
                //console.log("use cache");
                self.returnedData = "using cache";
                self._fillContainer(self._dataCache[q]);
                self._displayContainer();

            } else if (self.JSONDataSource) { // 3. 使用JSON静态数据源
                self.handleResponse(self.JSONDataSource[q]);

            } else { // 4. 请求服务器数据
                self.requestData();
            }
        },

        /**
         * 是否需要更新数据
         * @protected
         * @return Boolean
         */
        _needUpdate: function() {
            // 注意：加入空格也算有变化
            return this.textInput.value != this.query;
        },

        /**
         * 通过script元素加载数据
         */
        requestData: function() {
            var self = this;
            
            //console.log("request data via script");
            if (!ie) self.dataScript = null; // IE不需要重新创建script元素

            if (!self.dataScript) {
                var script = doc.createElement("script");
                script.charset = "utf-8";

                // jQuery ajax.js line 275:
                // Use insertBefore instead of appendChild  to circumvent an IE6 bug.
                // This arises when a base node is used.
                head.insertBefore(script, head.firstChild);
                self.dataScript = script;

                if (!ie) {
                    var t = new Date().getTime();
                    self._latestScriptTime = t;
                    script.setAttribute("time", t);

                    Event.on(script, "load", function() {
                        //console.log("on load");
                        // 判断返回的数据是否已经过期
                        self._scriptDataIsOut = script.getAttribute("time") != self._latestScriptTime;
                    });
                }
            }

            // 注意：没必要加时间戳，是否缓存由服务器返回的Header头控制
            self.queryParams = "q=" + encodeURIComponent(self.query) + "&code=utf-8&callback=" + CALLBACK_STR;
            self.fire(EVENT_DATA_REQUEST);
            self.dataScript.src = self.dataSource + "?" + self.queryParams;
        },

        /**
         * 处理获取的数据
         * @param {Object} data
         */
        handleResponse: function(data) {
            var self = this;
            
            //console.log("handle response");
            if (self._scriptDataIsOut) return; // 抛弃过期数据，否则会导致bug：1. 缓存key值不对； 2. 过期数据导致的闪屏

            self.returnedData = data;
            self.fire(EVENT_DATA_RETURN);

            // 格式化数据
            self.returnedData = self.formatData(self.returnedData);

            // 填充数据
            var content = "";
            var len = self.returnedData.length;
            if (len > 0) {
                var list = doc.createElement("ol");
                for (var i = 0; i < len; ++i) {
                    var itemData = self.returnedData[i];
                    var li = self.formatItem(itemData["key"], itemData["result"]);
                    // 缓存key值到attribute上
                    li.setAttribute("key", itemData["key"]);
                    // 添加奇偶 class
                    DOM.addClass(li, i % 2 ? EVEN_ITEM_CLASS : ODD_ITEM_CLASS);
                    list.appendChild(li);
                }
                content = list;
            }
            self._fillContainer(content);

            // 有内容时才添加底部
            if (len > 0) self.appendBottom();

            // fire event
            if (S.trim(self.container.innerHTML)) {
                // 实际上是beforeCache，但从用户的角度看，是beforeShow
                self.fire(EVENT_SHOW);
            }

            // cache
            self._dataCache[self.query] = self.container.innerHTML;

            // 显示容器
            self._displayContainer();
        },

        /**
         * 格式化输入的数据对象为标准格式
         * @param {Object} data 格式可以有3种：
         *  1. {"result" : [["key1", "result1"], ["key2", "result2"], ...]}
         *  2. {"result" : ["key1", "key2", ...]}
         *  3. 1和2的组合
         *  4. 标准格式
         *  5. 上面1-4中，直接取o["result"]的值
         * @return Object 标准格式的数据：
         *  [{"key" : "key1", "result" : "result1"}, {"key" : "key2", "result" : "result2"}, ...]
         */
        formatData: function(data) {
            var arr = [];
            if (!data) return arr;
            if (S.isArray(data["result"])) data = data["result"];
            var len = data.length;
            if (!len) return arr;

            var item;
            for (var i = 0; i < len; ++i) {
                item = data[i];

                if (typeof item === "string") { // 只有key值时
                    arr[i] = {"key" : item};
                } else if (S.isArray(item) && item.length >= 2) { // ["key", "result"] 取数组前2个
                    arr[i] = {"key" : item[0], "result" : item[1]};
                } else {
                    arr[i] = item;
                }
            }
            return arr;
        },

        /**
         * 格式化输出项
         * @param {String} key 查询字符串
         * @param {Number} result 结果 可不设
         * @return {HTMLElement}
         */
        formatItem: function(key, result) {
            var li = doc.createElement("li");
            var keyEl = doc.createElement("span");
            keyEl.className = KEY_EL_CLASS;
            keyEl.appendChild(doc.createTextNode(key));
            li.appendChild(keyEl);

            if (result !== undefined) { // 可以没有
                var resultText = this.config.resultFormat.replace("%result%", result);
                if (S.trim(resultText)) { // 有值时才创建
                    var resultEl = doc.createElement("span");
                    resultEl.className = RESULT_EL_CLASS;
                    resultEl.appendChild(doc.createTextNode(resultText));
                    li.appendChild(resultEl);
                }
            }

            return li;
        },

        /**
         * 添加提示层底部
         */
        appendBottom: function() {
            var bottom = doc.createElement("div");
            bottom.className = BOTTOM_CLASS;

            if (this.config.showCloseBtn) {
                var closeBtn = doc.createElement("a");
                closeBtn.href = "javascript: void(0)";
                closeBtn.setAttribute("target", "_self"); // bug fix: 覆盖<base target="_blank" />，否则会弹出空白页面
                closeBtn.className = CLOSE_BTN_CLASS;
                closeBtn.appendChild(doc.createTextNode(this.config.closeBtnText));

                bottom.appendChild(closeBtn);
            }

            // 仅当有内容时才添加
            if (S.trim(bottom.innerHTML)) {
                this.container.appendChild(bottom);
            }
        },

        /**
         * 填充提示层
         * @protected
         * @param {String|HTMLElement} content innerHTML or Child Node
         */
        _fillContainer: function(content) {
            if (content.nodeType == 1) {
                this.container.innerHTML = "";
                this.container.appendChild(content);
            } else {
                this.container.innerHTML = content;
            }

            // 一旦重新填充了，selectedItem就没了，需要重置
            this.selectedItem = null;
        },

        /**
         * 根据contanier的内容，显示或隐藏容器
         */
        _displayContainer: function() {
            if (S.trim(this.container.innerHTML)) {
                this.show();
            } else {
                this.hide();
            }
        },

        /**
         * 选中提示层中的上/下一个条
         * @param {Boolean} down true表示down，false表示up
         */
        selectItem: function(down) {
            var self = this;
            
            //console.log("select item " + down);
            var items = self.container.getElementsByTagName("li");
            if (items.length == 0) return;

            // 有可能用ESC隐藏了，直接显示即可
            if (!self.isVisible()) {
                self.show();
                return; // 保留原来的选中状态
            }
            var newSelectedItem;

            // 没有选中项时，选中第一/最后项
            if (!self.selectedItem) {
                newSelectedItem = items[down ? 0 : items.length - 1];
            } else {
                // 选中下/上一项
                newSelectedItem = YDOM[down ? "getNextSibling" : "getPreviousSibling"](self.selectedItem);
                // 已经到了最后/前一项时，归位到输入框，并还原输入值
                if (!newSelectedItem) {
                    self.textInput.value = self.query;
                }
            }

            // 移除当前选中项
            self._removeSelectedItem();

            // 选中新项
            if (newSelectedItem) {
                self._setSelectedItem(newSelectedItem);
                self._updateInputFromSelectItem();
            }
        },

        /**
         * 移除选中项
         * @protected
         */
        _removeSelectedItem: function() {
            //console.log("remove selected item");
            DOM.removeClass(this.selectedItem, SELECTED_ITEM_CLASS);
            this.selectedItem = null;
        },

        /**
         * 设置当前选中项
         * @protected
         * @param {HTMLElement} item
         */
        _setSelectedItem: function(item) {
            //console.log("set selected item");
            DOM.addClass(item, SELECTED_ITEM_CLASS);
            this.selectedItem = item;
        },

        /**
         * 获取提示层中选中项的key字符串
         * @protected
         */
        _getSelectedItemKey: function() {
            if (!this.selectedItem) return "";

            // getElementsByClassName比较损耗性能，改用缓存数据到attribute上方法
            //var keyEl = Dom.getElementsByClassName(KEY_EL_CLASS, "*", this.selectedItem)[0];
            //return keyEl.innerHTML;

            return this.selectedItem.getAttribute("key");
        },

        /**
         * 将textInput的值更新到this.query
         * @protected
         */
        _updateQueryValueFromInput: function() {
            this.query = this.textInput.value;
        },

        /**
         * 将选中项的值更新到textInput
         * @protected
         */
        _updateInputFromSelectItem: function() {
            this.textInput.value = this._getSelectedItemKey(this.selectedItem);
        }

    });

    S.mix(Suggest.prototype, S.EventTarget);

    /**
     * 约定的全局回调函数
     */
    win[CALLBACK_STR] = function(data) {
        if (!Suggest.focusInstance) return;
        // 使得先运行 script.onload 事件，然后再执行 callback 函数
        setTimeout(function() {
            Suggest.focusInstance.handleResponse(data);
        }, 0);
    };

    S.Suggest = Suggest;
});


/**
 * 小结：
 *
 * 整个组件代码，由两大部分组成：数据处理 + 事件处理
 *
 * 一、数据处理很core，但相对来说是简单的，由 requestData + handleResponse + formatData等辅助方法组成
 * 需要注意两点：
 *  a. IE中，改变script.src, 会自动取消掉之前的请求，并发送新请求。非IE中，必须新创建script才行。这是
 *     requestData方法中存在两种处理方式的原因。
 *  b. 当网速很慢，数据返回时，用户的输入可能已改变，已经有请求发送出去，需要抛弃过期数据。目前采用加时间戳
 *     的解决方案。更好的解决方案是，调整API，使得返回的数据中，带有query值。
 *
 * 二、事件处理看似简单，实际上有不少陷阱，分2部分：
 *  1. 输入框的focus/blur事件 + 键盘控制事件
 *  2. 提示层上的鼠标悬浮和点击事件
 * 需要注意以下几点：
 *  a. 因为点击提示层时，首先会触发输入框的blur事件，blur事件中调用hide方法，提示层一旦隐藏后，就捕获不到
 *     点击事件了。因此有了 this._mouseHovering 来排除这种情况，使得blur时不会触发hide，在提示层的点击
 *     事件中自行处理。（2009-06-18更新：采用mouseup来替代click事件，代码清晰简单了很多）
 *  b. 当鼠标移动到某项或通过上下键选中某项时，给this.selectedItem赋值；当提示层的数据重新填充时，重置
 *     this.selectedItem. 这种处理方式和google的一致，可以使得选中某项，隐藏，再次打开时，依旧选中原来
 *     的选中项。
 *  c. 在ie等浏览器中，输入框中输入ENTER键时，会自动提交表单。如果form.target="_blank", 自动提交和JS提交
 *     会打开两个提交页面。因此这里采取了在JS中不提交的策略，ENTER键是否提交表单，完全由HTML代码自身决定。这
 *     样也能使得组件很容易应用在不需要提交表单的场景中。（2009-06-18更新：可以通过blur()取消掉浏览器的默认
 *     Enter响应，这样能使得代码逻辑和mouseup的一致）
 *  d. onItemSelect 仅在鼠标点击选择某项 和 键盘选中某项回车 后触发。
 *  e. 当textInput会触发表单提交时，在enter keydown 和 keyup之间，就会触发提交。因此在keydown中捕捉事件。
 *     并且在keydown中能捕捉到持续DOWN/UP，在keyup中就不行了。
 *
 * 【得到的一些编程经验】：
 *  1. 职责单一原则。方法的职责要单一，比如hide方法和show方法，除了改变visibility, 就不要拥有其它功能。这
 *     看似简单，真要做到却并不容易。保持职责单一，保持简单的好处是，代码的整体逻辑更清晰，方法的可复用性也提
 *     高了。
 *  2. 小心事件处理。当事件之间有关联时，要仔细想清楚，设计好后再写代码。比如输入框的blur和提示层的click事件。
 *  3. 测试的重要性。目前是列出Test Cases，以后要尝试自动化。保证每次改动后，都不影响原有功能。
 *  4. 挑选正确的事件做正确的事，太重要了，能省去很多很多烦恼。
 *
 */

/**
 * 2009-08-05 更新： 将 class 从配置项中移动到常量，原因是：修改默认 className 的可能性很小，仅保留一个
 *                  containerCls 作为个性化样式的接口即可
 *
 * 2009-12-10 更新： 采用 kissy module 组织代码。为了避免多个沙箱下，对全局回调函数覆盖定义引发的问题，
 *                  采用共享模式。
 *
 * 2010-03-10 更新： 去除共享模式，适应 kissy 新的代码组织方式。
 */
/*
Copyright 2010, KISSY UI Library v1.0.5
MIT Licensed
build: 543 Apr 9 08:13
*/
/**
 * Switchable
 * @creator     玉伯<lifesinger@gmail.com>
 * @depends     kissy-core, yui2-animation
 */
KISSY.add('switchable', function(S, undefined) {

    var DOM = S.DOM, Event = S.Event,
        doc = document,
        DISPLAY = 'display', BLOCK = 'block', NONE = 'none',
        FORWARD = 'forward', BACKWARD = 'backward',
        DOT = '.',
        EVENT_BEFORE_SWITCH = 'beforeSwitch', EVENT_SWITCH = 'switch',
        CLS_PREFIX = 'ks-switchable-',
        SP = Switchable.prototype;

    /**
     * Switchable Widget
     * attached members：
     *   - this.container
     *   - this.config
     *   - this.triggers  可以为空值 []
     *   - this.panels    肯定有值，且 length > 1
     *   - this.content
     *   - this.length
     *   - this.activeIndex
     *   - this.switchTimer
     */
    function Switchable(container, config) {
        var self = this;

        // 调整配置信息
        config = config || {};
        if (!('markupType' in config)) {
            if (config.panelCls) {
                config.markupType = 1;
            } else if (config.panels) {
                config.markupType = 2;
            }
        }
        config = S.merge(Switchable.Config, config);

        /**
         * the container of widget
         * @type HTMLElement
         */
        self.container = S.get(container);

        /**
         * 配置参数
         * @type object
         */
        self.config = config;

        /**
         * triggers
         * @type Array of HTMLElement
         */
        self.triggers = self.triggers || [];

        /**
         * panels
         * @type Array of HTMLElement
         */
        self.panels = self.panels || [];

        /**
         * length = panels.length / steps
         * @type number
         */
        //self.length

        /**
         * the parentNode of panels
         * @type HTMLElement
         */
        //self.content

        /**
         * 当前激活的 index
         * @type number
         */
        if (self.activeIndex === undefined) {
            self.activeIndex = config.activeIndex;
        }

        self._init();
    }

    // 默认配置
    Switchable.Config = {
        markupType: 0, // markup 的类型，取值如下：

        // 0 - 默认结构：通过 nav 和 content 来获取 triggers 和 panels
        navCls: CLS_PREFIX + 'nav',
        contentCls: CLS_PREFIX + 'content',

        // 1 - 适度灵活：通过 cls 来获取 triggers 和 panels
        triggerCls: CLS_PREFIX + 'trigger',
        panelCls: CLS_PREFIX + 'panel',

        // 2 - 完全自由：直接传入 triggers 和 panels
        triggers: [],
        panels: [],

        // 是否有触点
        hasTriggers: true,

        // 触发类型
        triggerType: 'mouse', // or 'click'
        // 触发延迟
        delay: .1, // 100ms

        activeIndex: 0, // markup 的默认激活项，应该与此 index 一致
        activeTriggerCls: 'active',

        // 可见视图内有多少个 panels
        steps: 1,

        // 可见视图区域的大小。一般不需要设定此值，仅当获取值不正确时，用于手工指定大小
        viewSize: []
    };

    // 插件
    Switchable.Plugins = [];

    S.mix(SP, {

        /**
         * init switchable
         */
        _init: function() {
            var self = this, cfg = self.config;

            // parse markup
            if (self.panels.length === 0) {
                self._parseMarkup();
            }

            // bind triggers
            if (cfg.hasTriggers) {
                self._bindTriggers();
            }

            // init plugins
            S.each(Switchable.Plugins, function(plugin) {
                if(plugin.init) {
                    plugin.init(self);
                }
            });
        },

        /**
         * 解析 markup, 获取 triggers, panels, content
         */
        _parseMarkup: function() {
            var self = this, container = self.container,
                cfg = self.config,
                hasTriggers = cfg.hasTriggers,
                nav, content, triggers = [], panels = [], i, n, m;

            switch (cfg.markupType) {
                case 0: // 默认结构
                    nav = S.get(DOT + cfg.navCls, container);
                    if (nav) {
                        triggers = DOM.children(nav);
                    }
                    content = S.get(DOT + cfg.contentCls, container);
                    panels = DOM.children(content);
                    break;
                case 1: // 适度灵活
                    triggers = S.query(DOT + cfg.triggerCls, container);
                    panels = S.query(DOT + cfg.panelCls, container);
                    break;
                case 2: // 完全自由
                    triggers = cfg.triggers;
                    panels = cfg.panels;
                    break;
            }


            // get length
            n = panels.length;
            self.length = n / cfg.steps;

            // 自动生成 triggers
            if (hasTriggers && n > 0 && triggers.length === 0) {
                triggers = self._generateTriggersMarkup(self.length);
            }

            // 将 triggers 和 panels 转换为普通数组
            self.triggers = S.makeArray(triggers);
            self.panels = S.makeArray(panels);

            // get content
            self.content = content || panels[0].parentNode;
        },

        /**
         * 自动生成 triggers 的 markup
         */
        _generateTriggersMarkup: function(len) {
            var self = this, cfg = self.config,
                ul = doc.createElement('UL'), li, i;

            ul.className = cfg.navCls;
            for (i = 0; i < len; i++) {
                li = doc.createElement('LI');
                if (i === self.activeIndex) {
                    li.className = cfg.activeTriggerCls;
                }
                li.innerHTML = i + 1;
                ul.appendChild(li);
            }

            self.container.appendChild(ul);
            return DOM.children(ul);
        },

        /**
         * 给 triggers 添加事件
         */
        _bindTriggers: function() {
            var self = this, cfg = self.config,
                triggers = self.triggers, trigger,
                i, len = triggers.length;

            for (i = 0; i < len; i++) {
                (function(index) {
                    trigger = triggers[index];

                    // 响应点击和 Tab 键
                    Event.on(trigger, 'click focus', function() {
                        self._onFocusTrigger(index);
                    });

                    // 响应鼠标悬浮
                    if (cfg.triggerType === 'mouse') {
                        Event.on(trigger, 'mouseenter', function() {
                            self._onMouseEnterTrigger(index);
                        });
                        Event.on(trigger, 'mouseleave', function() {
                            self._onMouseLeaveTrigger(index);
                        });
                    }
                })(i);
            }
        },

        /**
         * click or tab 键激活 trigger 时触发的事件
         */
        _onFocusTrigger: function(index) {
            var self = this;
            if (self.activeIndex === index) return; // 重复点击
            if (self.switchTimer) self.switchTimer.cancel(); // 比如：先悬浮，后立刻点击。这时悬浮事件可以取消掉
            self.switchTo(index);
        },

        /**
         * 鼠标悬浮在 trigger 上时触发的事件
         */
        _onMouseEnterTrigger: function(index) {
            var self = this;
            //S.log('Triggerable._onMouseEnterTrigger: index = ' + index);

            // 不重复触发。比如：已显示内容时，将鼠标快速滑出再滑进来，不必触发
            if (self.activeIndex !== index) {
                self.switchTimer = S.later(function() {
                    self.switchTo(index);
                }, self.config.delay * 1000);
            }
        },

        /**
         * 鼠标移出 trigger 时触发的事件
         */
        _onMouseLeaveTrigger: function() {
            var self = this;
            if (self.switchTimer) self.switchTimer.cancel();
        },

        /**
         * 切换操作
         */
        switchTo: function(index, direction) {
            var self = this, cfg = self.config,
                triggers = self.triggers, panels = self.panels,
                activeIndex = self.activeIndex,
                steps = cfg.steps,
                fromIndex = activeIndex * steps, toIndex = index * steps;
            //S.log('Triggerable.switchTo: index = ' + index);

            if (index === activeIndex) return self;
            if (self.fire(EVENT_BEFORE_SWITCH, {toIndex: index}) === false) return self;

            // switch active trigger
            if (cfg.hasTriggers) {
                self._switchTrigger(activeIndex > -1 ? triggers[activeIndex] : null, triggers[index]);
            }

            // switch active panels
            if (direction === undefined) {
                direction = index > activeIndex ? FORWARD : FORWARD;
            }

            self._switchView(
                panels.slice(fromIndex, fromIndex + steps),
                panels.slice(toIndex, toIndex + steps),
                index,
                direction);

            // update activeIndex
            self.activeIndex = index;

            return self; // chain
        },

        /**
         * 切换当前触点
         */
        _switchTrigger: function(fromTrigger, toTrigger/*, index*/) {
            var activeTriggerCls = this.config.activeTriggerCls;

            if (fromTrigger) DOM.removeClass(fromTrigger, activeTriggerCls);
            DOM.addClass(toTrigger, activeTriggerCls);
        },

        /**
         * 切换视图
         */
        _switchView: function(fromPanels, toPanels/*, index, direction*/) {
            // 最简单的切换效果：直接隐藏/显示
            DOM.css(fromPanels, DISPLAY, NONE);
            DOM.css(toPanels, DISPLAY, BLOCK);

            // fire onSwitch
            this.fire(EVENT_SWITCH);
        },

        /**
         * 切换到上一视图
         */
        prev: function() {
            var self = this, activeIndex = self.activeIndex;
            self.switchTo(activeIndex > 0 ? activeIndex - 1 : self.length - 1, BACKWARD);
        },

        /**
         * 切换到下一视图
         */
        next: function() {
            var self = this, activeIndex = self.activeIndex;
            self.switchTo(activeIndex < self.length - 1 ? activeIndex + 1 : 0, FORWARD);
        }
    });

    S.mix(SP, S.EventTarget);
    
    S.Switchable = Switchable;
});

/**
 * NOTES:
 *
 * 2010.04
 *  - 重构，脱离对 yahoo-dom-event 的依赖
 *
 * 2010.03
 *  - 重构，去掉 Widget, 部分代码直接采用 kissy 基础库
 *  - 插件机制从 weave 织入法改成 hook 钩子法
 *
 * TODO:
 *  - http://malsup.com/jquery/cycle/
 *  - http://www.mall.taobao.com/go/chn/mall_chl/flagship.php
 * 
 * References:
 *  - jQuery Scrollable http://flowplayer.org/tools/scrollable.html
 *
 */
/**
 * Switchable Autoplay Plugin
 * @creator     玉伯<lifesinger@gmail.com>
 */
KISSY.add('switchable-autoplay', function(S) {

    var Event = S.Event,
        Switchable = S.Switchable;

    /**
     * 添加默认配置
     */
    S.mix(Switchable.Config, {
        autoplay: false,
        interval: 5, // 自动播放间隔时间
        pauseOnHover: true  // triggerType 为 mouse 时，鼠标悬停在 slide 上是否暂停自动播放
    });

    /**
     * 添加插件
     * attached members:
     *   - this.paused
     *   - this.autoplayTimer
     */
    Switchable.Plugins.push({
        name: 'autoplay',

        init: function(host) {
            var cfg = host.config;
            if (!cfg.autoplay) return;

            // 鼠标悬停，停止自动播放
            if (cfg.pauseOnHover) {
                Event.on(host.container, 'mouseenter', function() {
                    host.paused = true;
                });
                Event.on(host.container, 'mouseleave', function() {
                    // 假设 interval 为 10s
                    // 在 8s 时，通过 focus 主动触发切换，停留 1s 后，鼠标移出
                    // 这时如果不 setTimeout, 再过 1s 后，主动触发的 panel 将被替换掉
                    // 为了保证每个 panel 的显示时间都不小于 interval, 此处加上 setTimeout
                    setTimeout(function() {
                        host.paused = false;
                    }, cfg.interval * 1000);
                });
            }

            // 设置自动播放
            host.autoplayTimer = S.later(function() {
                if (host.paused) return;
                host.switchTo(host.activeIndex < host.length - 1 ? host.activeIndex + 1 : 0);
            }, cfg.interval * 1000, true);
        }
    });
});

/**
 * TODO:
 *  - 是否需要提供 play / pause / stop API ?
 *  - autoplayTimer 和 switchTimer 的关联？
 */
/**
 * Switchable Effect Plugin
 * @creator     玉伯<lifesinger@gmail.com>
 */
KISSY.add('switchable-effect', function(S) {

    var Y = YAHOO.util, DOM = S.DOM, YDOM = Y.Dom,
        DISPLAY = 'display', BLOCK = 'block', NONE = 'none',
        OPACITY = 'opacity', Z_INDEX = 'z-index',
        RELATIVE = 'relative', ABSOLUTE = 'absolute',
        SCROLLX = 'scrollx', SCROLLY = 'scrolly', FADE = 'fade',
        Switchable = S.Switchable, Effects;

    /**
     * 添加默认配置
     */
    S.mix(Switchable.Config, {
        effect: NONE, // 'scrollx', 'scrolly', 'fade' 或者直接传入 custom effect fn
        duration: .5, // 动画的时长
        easing: Y.Easing.easeNone // easing method
    });

    /**
     * 定义效果集
     */
    Switchable.Effects = {

        // 最朴素的显示/隐藏效果
        none: function(fromEls, toEls, callback) {
            DOM.css(fromEls, DISPLAY, NONE);
            DOM.css(toEls, DISPLAY, BLOCK);
            callback();
        },

        // 淡隐淡现效果
        fade: function(fromEls, toEls, callback) {
            if(fromEls.length !== 1) {
                S.error('fade effect only supports steps == 1.');
            }
            var self = this, cfg = self.config,
                fromEl = fromEls[0], toEl = toEls[0];
            if (self.anim) self.anim.stop();

            // 首先显示下一张
            YDOM.setStyle(toEl, OPACITY, 1);

            // 动画切换
            self.anim = new Y.Anim(fromEl, {opacity: {to: 0}}, cfg.duration, cfg.easing);
            self.anim.onComplete.subscribe(function() {
                self.anim = null; // free

                // 切换 z-index
                YDOM.setStyle(toEl, Z_INDEX, 9);
                YDOM.setStyle(fromEl, Z_INDEX, 1);

                callback();
            });
            self.anim.animate();
        },

        // 水平/垂直滚动效果
        scroll: function(fromEls, toEls, callback, index) {
            var self = this, cfg = self.config,
                isX = cfg.effect === SCROLLX,
                diff = self.viewSize[isX ? 0 : 1] * index,
                attributes = {};

            attributes[isX ? 'left' : 'top'] = { to: -diff };

            if (self.anim) self.anim.stop();
            self.anim = new Y.Anim(self.content, attributes, cfg.duration, cfg.easing);
            self.anim.onComplete.subscribe(function() {
                self.anim = null; // free
                callback();
            });
            self.anim.animate();
        }
    };
    Effects = Switchable.Effects;
    Effects[SCROLLX] = Effects[SCROLLY] = Effects.scroll;

    /**
     * 添加插件
     * attached members:
     *   - this.viewSize
     */
    Switchable.Plugins.push({
        name: 'effect',

        /**
         * 根据 effect, 调整初始状态
         */
        init: function(host) {
            var cfg = host.config,
                effect = cfg.effect,
                panels = host.panels,
                steps = cfg.steps,
                activeIndex = host.activeIndex,
                fromIndex = activeIndex * steps,
                toIndex = fromIndex + steps - 1,
                i, len = panels.length;

            // 1. 获取高宽
            host.viewSize = [
                cfg.viewSize[0] || panels[0].offsetWidth * steps,
                cfg.viewSize[0] || panels[0].offsetHeight * steps
            ];
            // 注：所有 panel 的尺寸应该相同
            //    最好指定第一个 panel 的 width 和 height，因为 Safari 下，图片未加载时，读取的 offsetHeight 等值会不对

            // 2. 初始化 panels 样式
            if (effect !== NONE) { // effect = scrollx, scrolly, fade
                // 这些特效需要将 panels 都显示出来
                for (i = 0; i < len; i++) {
                    panels[i].style.display = BLOCK;
                }

                switch (effect) {
                    // 如果是滚动效果
                    case SCROLLX:
                    case SCROLLY:
                        // 设置定位信息，为滚动效果做铺垫
                        host.content.style.position = ABSOLUTE;
                        host.content.parentNode.style.position = RELATIVE; // 注：content 的父级不一定是 container

                        // 水平排列
                        if (effect === SCROLLX) {
                            YDOM.setStyle(panels, 'float', 'left');

                            // 设置最大宽度，以保证有空间让 panels 水平排布
                            host.content.style.width = host.viewSize[0] * (len / steps) + 'px';
                        }
                        break;

                    // 如果是透明效果，则初始化透明
                    case FADE:
                        for (i = 0; i < len; i++) {
                            YDOM.setStyle(panels[i], OPACITY, (i >= fromIndex && i <= toIndex) ? 1 : 0);
                            panels[i].style.position = ABSOLUTE;
                            panels[i].style.zIndex = (i >= fromIndex && i <= toIndex) ? 9 : 1;
                        }
                        break;
                }
            }

            // 3. 在 CSS 里，需要给 container 设定高宽和 overflow: hidden
            //    nav 的 cls 由 CSS 指定
        }
    });

    /**
     * 覆盖切换方法
     */
    S.mix(Switchable.prototype, {
        /**
         * 切换视图
         */
        _switchView: function(fromEls, toEls, index, direction) {
            var self = this, cfg = self.config,
                effect = cfg.effect,
                fn = S.isFunction(effect) ? effect : Effects[effect];

            fn.call(self, fromEls, toEls, function() {
                self.fire('switch');
            }, index, direction);
        }
    });
});

/**
 * TODO:
 *  - apple 翻页效果
 */
/**
 * Switchable Circular Plugin
 * @creator     玉伯<lifesinger@gmail.com>
 */
KISSY.add('switchable-circular', function(S) {

    var RELATIVE = 'relative',
        LEFT = 'left', TOP = 'top',
        PX = 'px', EMPTY = '',
        FORWARD = 'forward', BACKWARD = 'backward',
        SCROLLX = 'scrollx', SCROLLY = 'scrolly',
        Switchable = S.Switchable;

    /**
     * 添加默认配置
     */
    S.mix(Switchable.Config, {
        circular: false
    });

    /**
     * 循环滚动效果函数
     */
    function circularScroll(fromEls, toEls, callback, index, direction) {
        var self = this, cfg = self.config,
            len = self.length,
            activeIndex = self.activeIndex,
            isX = cfg.scrollType === SCROLLX,
            prop = isX ? LEFT : TOP,
            viewDiff = self.viewSize[isX ? 0 : 1],
            diff = -viewDiff * index,
            attributes = {},
            isCritical,
            isBackward = direction === BACKWARD;

        // 从第一个反向滚动到最后一个 or 从最后一个正向滚动到第一个
        isCritical = (isBackward && activeIndex === 0 && index === len - 1)
                     || (direction === FORWARD && activeIndex === len - 1 && index === 0);

        if(isCritical) {
            // 调整位置并获取 diff
            diff = adjustPosition.call(self, self.panels, index, isBackward, prop, viewDiff);
        }
        attributes[prop] = { to: diff };

        // 开始动画
        if (self.anim) self.anim.stop();
        self.anim = new YAHOO.util.Anim(self.content, attributes, cfg.duration, cfg.easing);
        self.anim.onComplete.subscribe(function() {
            if(isCritical) {
                // 复原位置
                resetPosition.call(self, self.panels, index, isBackward, prop, viewDiff);
            }
            // free
            self.anim = null;
            callback();
        });
        self.anim.animate();
    }

    /**
     * 调整位置
     */
    function adjustPosition(panels, index, isBackward, prop, viewDiff) {
        var self = this, cfg = self.config,
            steps = cfg.steps,
            len = self.length,
            start = isBackward ? len - 1 : 0,
            from = start * steps,
            to = (start + 1) * steps,
            i;

        // 调整 panels 到下一个视图中
        for (i = from; i < to; i++) {
            panels[i].style.position = RELATIVE;
            panels[i].style[prop] = (isBackward ? '-' : EMPTY) + viewDiff * len + PX;
        }

        // 偏移量
        return isBackward ? viewDiff : -viewDiff * len;
    }

    /**
     * 复原位置
     */
    function resetPosition(panels, index, isBackward, prop, viewDiff) {
        var self = this, cfg = self.config,
            steps = cfg.steps,
            len = self.length,
            start = isBackward ? len - 1 : 0,
            from = start * steps,
            to = (start + 1) * steps,
            i;

        // 滚动完成后，复位到正常状态
        for (i = from; i < to; i++) {
            panels[i].style.position = EMPTY;
            panels[i].style[prop] = EMPTY;
        }

        // 瞬移到正常位置
        self.content.style[prop] = isBackward ? -viewDiff * (len - 1) + PX : EMPTY;
    }

    /**
     * 添加插件
     */
    Switchable.Plugins.push({
        name: 'circular',

        /**
         * 根据 effect, 调整初始状态
         */
        init: function(host) {
            var cfg = host.config;

            // 仅有滚动效果需要下面的调整
            if (cfg.circular && (cfg.effect === SCROLLX || cfg.effect === SCROLLY)) {
                // 覆盖滚动效果函数
                cfg.scrollType = cfg.effect; // 保存到 scrollType 中
                cfg.effect = circularScroll;
            }
        }
    });
});

/**
 * TODO:
 *   - 是否需要考虑从 0 到 2（非最后一个） 的 backward 滚动？需要更灵活
 */
/**
 * Switchable Lazyload Plugin
 * @creator     玉伯<lifesinger@gmail.com>
 */
KISSY.add('switchable-lazyload', function(S) {

    var DOM = S.DOM,
        EVENT_BEFORE_SWITCH = 'beforeSwitch',
        IMG_SRC = 'img-src',
        TEXTAREA_DATA = 'textarea-data',
        FLAGS = { },
        Switchable = S.Switchable,
        DataLazyload = S.DataLazyload;

    FLAGS[IMG_SRC] = 'data-lazyload-src-custom';
    FLAGS[TEXTAREA_DATA] = 'ks-datalazyload-custom';

    /**
     * 添加默认配置
     */
    S.mix(Switchable.Config, {
        lazyDataType: '', // 'img-src' or 'textarea-data'
        lazyDataFlag: ''  // 'data-lazyload-src-custom' or 'ks-datalazyload-custom'
    });

    /**
     * 织入初始化函数
     */
    Switchable.Plugins.push({
        name: 'autoplay',

        init: function(host) {
            var cfg = host.config,
                type = cfg.lazyDataType, flag = cfg.lazyDataFlag || FLAGS[type];
            if (!DataLazyload || !type || !flag) return; // 没有延迟项

            host.on(EVENT_BEFORE_SWITCH, loadLazyData);

            /**
             * 加载延迟数据
             */
            function loadLazyData(ev) {
                var steps = cfg.steps,
                    from = ev.toIndex * steps ,
                    to = from + steps;

                DataLazyload.loadCustomLazyData(host.panels.slice(from, to), type, flag);
                if (isAllDone()) {
                    host.detach(EVENT_BEFORE_SWITCH, loadLazyData);
                }
            }

            /**
             * 是否都已加载完成
             */
            function isAllDone() {
                var imgs, textareas, i, len;

                if (type === IMG_SRC) {
                    imgs = S.query('img', host.container);
                    for (i = 0,len = imgs.length; i < len; i++) {
                        if (DOM.attr(imgs[i], flag)) return false;
                    }
                } else if (type === TEXTAREA_DATA) {
                    textareas = S.query('textarea', host.container);
                    for (i = 0,len = textareas.length; i < len; i++) {
                        if (DOM.hasClass(textareas[i], flag)) return false;
                    }
                }

                return true;
            }

        }
    });
});
/**
 * Tabs Widget
 * @creator     玉伯<lifesinger@gmail.com>
 */
KISSY.add('tabs', function(S) {

    /**
     * Tabs Class
     * @constructor
     */
    function Tabs(container, config) {
        var self = this;

        // factory or constructor
        if (!(self instanceof Tabs)) {
            return new Tabs(container, config);
        }

        Tabs.superclass.constructor.call(self, container, config);
    }

    S.extend(Tabs, S.Switchable);
    S.Tabs = Tabs;
});
/**
 * Tabs Widget
 * @creator     玉伯<lifesinger@gmail.com>
 */
KISSY.add('slide', function(S) {

    /**
     * 默认配置，和 Switchable 相同的部分此处未列出
     */
    var defaultConfig = {
        autoplay: true,
        circular: true
    };

    /**
     * Slide Class
     * @constructor
     */
    function Slide(container, config) {
        var self = this;

        // factory or constructor
        if (!(self instanceof Slide)) {
            return new Slide(container, config);
        }

        config = S.merge(defaultConfig, config || { });
        Slide.superclass.constructor.call(self, container, config);
    }

    S.extend(Slide, S.Switchable);
    S.Slide = Slide;
});
/**
 * Carousel Widget
 * @creator     玉伯<lifesinger@gmail.com>
 */
KISSY.add('carousel', function(S) {

        /**
         * 默认配置，和 Switchable 相同的部分此处未列出
         */
        var defaultConfig = {
            circular: true
        };

    /**
     * Carousel Class
     * @constructor
     */
    function Carousel(container, config) {
        var self = this;

        // factory or constructor
        if (!(self instanceof Carousel)) {
            return new Carousel(container, config);
        }

        config = S.merge(defaultConfig, config || { });
        Carousel.superclass.constructor.call(self, container, config);
    }

    S.extend(Carousel, S.Switchable);
    S.Carousel = Carousel;
});
// vim: set et sw=4 ts=4 sts=4 fdm=marker ff=unix fenc=gbk nobomb:
/**
 * CoversFlow
 * @author mingcheng<i.feelinglucky#gmail.com> - http://www.gracecode.com/
 * @update log:
 *    [2010-04-08] yubo: 精简 & 优化部分代码
 */

KISSY.add('coversflow', function(S) {
    var Y = YAHOO.util, YDOM = Y.Dom, DOM = S.DOM, Event = S.Event,
        VISIBILITY = 'visibility', CLICK = 'click',
        MAGIC_NUMBER = 90,
        MAGIC_DIVISOR = 1.25,
        EVENT_BEFORE_SWITCH = 'beforeSwitch',
        EVENT_ON_CURRENT = 'onCurrent',
        EVENT_TWEEN = 'tween',
        EVENT_FINISHED = 'finished',

        /**
         * 默认配置
         */
        defaultConfig = {
            flowLength: 4, // Max number of images on each side of the focused one
            aspectRatio: 1.964, // Aspect ratio of the ImageFlow container (width divided by height)
            step: 150, // 步长，通常不用更改
            width: 500, // 最大封面的宽
            height: 350, // 最大封面的高
            offset: 0, // 误差
            animSpeed: 50,  // 动画间隔（毫秒）
            autoSwitchToMiddle: true, // 自动切换到中间
            hasTriggers: false, // 触点就是 panels
            circular: true
        };

    function CoversFlow(container, config) {
        var self = this;

        if (!(self instanceof CoversFlow)) {
            return new CoversFlow(container, config);
        }

        config = S.merge(defaultConfig, config || {});
        CoversFlow.superclass.constructor.call(self, container, config);

        self._initFlow();
    }

    S.extend(CoversFlow, S.Switchable);

    S.augment(CoversFlow, {

        _initFlow: function() {
            var self = this, config = self.config;
            
            self.busy = false;             // 运行状态
            self.curFrame = 0;             // 当前运行帧
            self.targetFrame = 0;          // 目标滚动帧
            self.zIndex = self.length;     // 最大 zIndex 值
            self.region = YDOM.getRegion(self.container); // 容器的坐标和大小

            self.maxFocus = config.flowLength * config.step;
            self.maxHeight = self.region.height + Math.round(self.region.height / config.aspectRatio); // 最大高度
            self.middleLine = self.region.width / 2; // 中间线

            // 事件注入
            self.on(EVENT_BEFORE_SWITCH, function(ev) {
                var index = ev.toIndex;

                self.perIndex = index; // 预保存滚动目标
                self.targetFrame = -index * self.config.step;
                return !self.busy;
            });

            // 自动切换到中间
            if (config.autoSwitchToMiddle) {
                self.switchTo(Math.floor(self.length / 2));
            } else {
                self._frame(0);
            }
        },

        _switchView: function() {
            var self = this, cfg = self.config;

            if (self.targetFrame < self.curFrame - 1 || self.targetFrame > self.curFrame + 1) {
                // fire onSwitch
                self._frame(self.curFrame + (self.targetFrame - self.curFrame) / 3);
                self._timer = S.later(self._switchView, cfg.animSpeed, false, self);
                self.busy = true;
            } else {
                self.fire(EVENT_FINISHED);
                self.busy = false; // 动画完成
            }
        },

        /**
         * 运行每帧动画
         */
        _frame: function(frame) {
            var self = this, cfg = self.config, panels = self.panels,
                region = self.region, middleLine = self.middleLine - cfg.offset, curPanel, curImgPos;

            self.curFrame = frame; // 标记当前帧

            for (var index = 0, len = panels.length; index < len; index++) {
                curPanel = self.panels[index];
                curImgPos = index * -cfg.step;
                if ((curImgPos + self.maxFocus) < self.targetFrame || (curImgPos - self.maxFocus) > self.targetFrame) {
                    // 隐藏多余的封面
                    DOM.css(curPanel, VISIBILITY, 'hidden');
                } else {
                    // 动画曲线因子
                    var x = (Math.sqrt(10000 + frame * frame) + 100), xs = frame / x * middleLine + middleLine;
                    var height = (cfg.width / cfg.height * MAGIC_NUMBER) / x * middleLine, width = 0;

                    if (height > self.maxHeight) {
                        height = self.maxHeight;
                    }
                    width = cfg.width / cfg.height * height;

                    // 计算并设置当前位置
                    DOM.css(curPanel, 'left', xs - (MAGIC_NUMBER / MAGIC_DIVISOR) / x * middleLine + 'px');
                    if (height && width) {
                        DOM.css(curPanel, 'height', height + 'px');
                        DOM.css(curPanel, 'width', width + 'px');
                        DOM.css(curPanel, 'top', region.height / 2 - height / 2 + 'px');
                    }
                    DOM.css(curPanel, 'zIndex', self.zIndex * 100 - Math.ceil(x));
                    DOM.css(curPanel, VISIBILITY, 'visible');

                    // 绑定点击事件
                    self._bindPanel(curPanel, index);
                }

                self.fire(EVENT_TWEEN, { panel: curPanel, index: index });
                frame += cfg.step;
            }
        },

        /**
         * 绑定事件
         */
        _bindPanel: function(curPanel, index) {
            var self = this;

            Event.remove(curPanel);

            if (self.perIndex === index) {
                Event.add(curPanel, CLICK, function() {
                    return self.fire(EVENT_ON_CURRENT, { panel: curPanel, index: index });
                });
            } else {
                Event.add(curPanel, CLICK, function(ev) {
                    ev.preventDefault();
                    self.switchTo(index);
                });
            }
        }
    });

    S.CoversFlow = CoversFlow;

});

/**
 * TODO:
 *   - 进一步优化算法和部分 api
 */
