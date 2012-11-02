/**
 * @preserve Constructor for kissy editor,dependency moved to independent module
 *      thanks to CKSource's intelligent work on CKEditor
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 * @version: 2
 * @buildtime: 2012-10-29 15:53:12
 */

/**
 * ugly declartion
 */
KISSY.add("editor/export", function(S) {
    var DOM = S.DOM,
        TRUE = true,
        FALSE = false;

    /**
     * 初始化编辑器
     * @constructor
     * @param textarea {(string)} 将要替换的 textarea
     * @param cfg {Object} 编辑器配置
     * @return {Editor} 返回编辑器实例
     */
    function Editor(textarea, cfg) {
        var self = this;

        if (!(self instanceof Editor)) {
            return new Editor(textarea, cfg);
        }

        if (S.isString(textarea)) {
            textarea = S.one(textarea);
        }
        textarea = DOM._4e_wrap(textarea);
        cfg = cfg || {};
        cfg.pluginConfig = cfg["pluginConfig"] || {};
        self.cfg = cfg;
        //export for closure compiler
        cfg["pluginConfig"] = cfg.pluginConfig;
        self["cfg"] = cfg;
        S.app(self, S.EventTarget);

        var BASIC = ["htmldataprocessor", "enterkey", "clipboard"],
            initial = FALSE;
        /**
         * 存在问题：
         * use 涉及动态加载时
         * 1.相同的模块名不会重复 attach
         * 2.不同模块名相同 js 路径也不会重复 attach
         * @param mods {Array.<string>} ，模块名可以重复
         * @param callback {function()} ，插件载入后回调
         */
        self.use = function(mods, callback) {
            mods = mods.split(",");
            if (!initial) {
                for (var i = 0; i < BASIC.length; i++) {
                    var b = BASIC[i];
                    if (!S.inArray(b, mods)) {
                        mods.unshift(b);
                    }
                }
            }

            //编辑器实例 use 时会进行编辑器 ui 操作而不单单是功能定义，必须 ready

            self.ready(function() {
                //通过 add 里面的又一层 addPlugin 保证
                //use : 下载，非图形为乱序并行
                //plugin 的attach（按钮）为串行
                S.Editor.use("button,select", function() {
                    S.use.call(self, mods.join(","), function() {
                        //载入了插件的attach功能，现在按照顺序一个个attach
                        for (var i = 0; i < mods.length; i++) {
                            self.usePlugin(mods[i]);
                        }
                        callback && callback.call(self);
                        //也用在窗口按需加载，只有在初始化时才进行内容设置
                        if (!initial) {
                            self.setData(textarea.val());
                            //是否自动focus
                            if (cfg["focus"]) {
                                self.focus();
                            }
                            //否则清空选择区域
                            else {
                                var sel = self.getSelection();
                                sel && sel.removeAllRanges();
                            }
                            initial = TRUE;
                        }
                    }, { "global":  Editor });
                });

            });

            return self;
        };
        self["use"] = self.use;
        //配置内部组件载入基路径
        self["Config"]["base"] = Editor["Config"]["base"];
        self["Config"]["debug"] = Editor["Config"]["debug"];
        //配置内部组件载入文件名
        self["Config"]['componentJsName'] = getJSName;
        self.init(textarea);
    }

    var getJSName;
    if (parseFloat(S.version) < 1.2) {
        getJSName = function () {
            return "plugin-min.js?t=" +
                encodeURIComponent("2012-10-29 15:53:12");
        };
    } else {
        getJSName = function (m, tag) {
            return m + '/plugin-min.js' + (tag ? tag : '?t=' +
                encodeURIComponent('2012-10-29 15:53:12'));
        };
    }

    S.app(Editor, S.EventTarget);
    //配置内部组件载入基路径
    Editor["Config"]["base"] = S["Config"]["base"] + "editor/plugins/";
    Editor["Config"]["debug"] = S["Config"]["debug"];
    //配置内部组件载入文件名
    Editor["Config"]['componentJsName'] = getJSName;

    /**
     * @constructor
     */
    S.Editor = Editor;
    /**
     * @constructor
     */
    S["Editor"] = Editor;
});

KISSY.add("editor", function(S) {
    return S.Editor;
}, {
    requires:['dd','overlay']
});
/**
 * 目标：分离，解耦，模块化，去除重复代码
 * 分裂为三个部分
 * 1.纯粹 UI 模块 ：overlay,bubbleview
 * 2.编辑器功能模块 : TableUI
 * 3.编辑器attach功能模块 : table
 * 4.使用新loader，不提前注册内部模块以及依赖
 * 5.ui 根据是否首屏需要，分为 ui/core 以及 plugins
 *//**
 * common utils for kissy editor
 * @author <yiminghe@gmail.com>
 */
KISSY.Editor.add("utils", function(KE) {

    var
        TRUE = true,
        FALSE = false,
        NULL = null,
        S = KISSY,
        Node = S.Node,
        DOM = S.DOM,
        UA = S.UA,
        Event = S.Event,
        Utils = {
            debugUrl:function(url) {
                url = url.replace(/-min\.(js|css)/i, ".$1");
                if (!KE["Config"]['debug']) {
                    url = url.replace(/\.(js|css)/i, "-min.$1");
                }
                if (url.indexOf("?t") == -1) {
                    if (url.indexOf("?") != -1) {
                        url += "&";
                    } else {
                        url += "?";
                    }
                    url += "t=" + encodeURIComponent("2012-01-11 13:45:11");
                }
                return KE["Config"].base + url;
            },
            /**
             * 懒惰一下
             * @param obj {Object} 包含方法的对象
             * @param before {string} 准备方法
             * @param after {string} 真正方法
             */
            lazyRun:function(obj, before, after) {
                var b = obj[before],a = obj[after];
                obj[before] = function() {
                    b.apply(this, arguments);
                    obj[before] = obj[after];
                    return a.apply(this, arguments);
                };
            }
            ,

            /**
             * srcDoc 中的位置在 destDoc 的对应位置
             * @param x {number}
             * @param y {number}
             * @param srcDoc {Document}
             * @param destDoc {Document}
             * @return 在最终文档中的位置
             */
            getXY:function(x, y, srcDoc, destDoc) {
                var currentWindow = srcDoc.defaultView || srcDoc.parentWindow;

                //x,y相对于当前iframe文档,防止当前iframe有滚动条
                x -= DOM.scrollLeft(currentWindow);
                y -= DOM.scrollTop(currentWindow);
                if (destDoc) {
                    var refWindow = destDoc.defaultView || destDoc.parentWindow;
                    if (currentWindow != refWindow && currentWindow['frameElement']) {
                        //note:when iframe is static ,still some mistake
                        var iframePosition = DOM._4e_getOffset(currentWindow['frameElement'],
                            destDoc);
                        x += iframePosition.left;
                        y += iframePosition.top;
                    }
                }
                return {left:x,top:y};
            }
            ,
            /**
             * 执行一系列函数
             * @param var_args {...function()}
             * @return {*} 得到成功的返回
             */
            tryThese : function(var_args) {
                var returnValue;
                for (var i = 0, length = arguments.length; i < length; i++) {
                    var lambda = arguments[i];
                    try {
                        returnValue = lambda();
                        break;
                    }
                    catch (e) {
                    }
                }
                return returnValue;
            },

            /**
             * 是否两个数组完全相同
             * @param arrayA {Array}
             * @param arrayB {Array}
             * @return {boolean}
             */
            arrayCompare: function(arrayA, arrayB) {
                if (!arrayA && !arrayB)
                    return TRUE;

                if (!arrayA || !arrayB || arrayA.length != arrayB.length)
                    return FALSE;

                for (var i = 0; i < arrayA.length; i++) {
                    if (arrayA[ i ] !== arrayB[ i ])
                        return FALSE;
                }

                return TRUE;
            }
            ,

            /**
             * 根据dom路径得到某个节点
             * @param doc {Document}
             * @param address {Array.<number>}
             * @param normalized {boolean}
             * @return {KISSY.Node}
             */
            getByAddress : function(doc, address, normalized) {
                var $ = doc.documentElement;

                for (var i = 0; $ && i < address.length; i++) {
                    var target = address[ i ];

                    if (!normalized) {
                        $ = $.childNodes[ target ];
                        continue;
                    }

                    var currentIndex = -1;

                    for (var j = 0; j < $.childNodes.length; j++) {
                        var candidate = $.childNodes[ j ];

                        if (normalized === TRUE &&
                            candidate.nodeType == 3 &&
                            candidate.previousSibling &&
                            candidate.previousSibling.nodeType == 3) {
                            continue;
                        }

                        currentIndex++;

                        if (currentIndex == target) {
                            $ = candidate;
                            break;
                        }
                    }
                }

                return $ ? new Node($) : NULL;
            }
            ,
            /**
             * @param database {Object}
             */
            clearAllMarkers:function(database) {
                for (var i in database)
                    database[i]._4e_clearMarkers(database, TRUE);
            }
            ,
            /**
             *
             * @param text {string}
             * @return {string}
             */
            htmlEncodeAttr : function(text) {
                return text.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/, '&gt;');
            }
            ,
            /**
             *
             * @param str {string}
             * @return {string}
             */
            ltrim:function(str) {
                return str.replace(/^\s+/, "");
            }
            ,
            /**
             *
             * @param str {string}
             * @return {string}
             */
            rtrim:function(str) {
                return str.replace(/\s+$/, "");
            }
            ,
            /**
             *
             * @param str {string}
             * @return {string}
             */
            trim:function(str) {
                return this.ltrim(this.rtrim(str));
            }
            ,
            /**
             *
             * @param var_args {...Object}
             * @return {Object}
             */
            mix:function(var_args) {
                var r = {};
                for (var i = 0; i < arguments.length; i++) {
                    var ob = arguments[i];
                    r = S.mix(r, ob);
                }
                return r;
            }
            ,
            isCustomDomain : function() {
                if (!UA['ie'])
                    return FALSE;

                var domain = document.domain,
                    hostname = window.location.hostname;

                return domain != hostname &&
                    domain != ( '[' + hostname + ']' );	// IPv6 IP support (#5434)
            },
            /**
             *
             * @param fn {function()}
             * @param scope {Object}
             * @param ms {number}
             * @return {function()}
             */
            buffer : function(fn, scope, ms) {
                ms = ms || 0;
                var timer = NULL;
                return (function() {
                    timer && clearTimeout(timer);
                    var args = arguments;
                    timer = setTimeout(function() {
                        return fn.apply(scope, args);
                    }, ms);
                });
            },

            isNumber:function(n) {
                return /^\d+(.\d+)?$/.test(S.trim(n));
            },

            /**
             *
             * @param inputs {Array.<Node>}
             * @param warn {string}
             * @return {boolean} 是否验证成功
             */
            verifyInputs:function(inputs, warn) {
                for (var i = 0; i < inputs.length; i++) {
                    var input = DOM._4e_wrap(inputs[i]),
                        v = S.trim(Utils.valInput(input)),
                        verify = input.attr("data-verify"),
                        warning = input.attr("data-warning");
                    if (verify &&
                        !new RegExp(verify).test(v)) {
                        alert(warning);
                        return FALSE;
                    }
                }
                return TRUE;
            },
            /**
             *
             * @param editor {KISSY.Editor}
             * @param plugin {Object}
             */
            sourceDisable:function(editor, plugin) {
                editor.on("sourcemode", plugin.disable, plugin);
                editor.on("wysiwygmode", plugin.enable, plugin);
            },

            /**
             *
             * @param inp {Node}
             */
            resetInput:function(inp) {
                var placeholder = inp.attr("placeholder");
                if (placeholder && UA['ie']) {
                    inp.addClass("ke-input-tip");
                    inp.val(placeholder);
                } else if (!UA['ie']) {
                    inp.val("");
                }
            },

            valInput:function(inp, val) {
                if (val === undefined) {
                    if (inp.hasClass("ke-input-tip")) {
                        return "";
                    } else {
                        return inp.val();
                    }
                } else {
                    inp.removeClass("ke-input-tip");
                    inp.val(val);
                }
            },

            /**
             *
             * @param inp {Node}
             * @param tip {string}
             */
            placeholder:function(inp, tip) {
                inp.attr("placeholder", tip);
                if (!UA['ie']) {
                    return;
                }
                inp.on("blur", function() {
                    if (!S.trim(inp.val())) {
                        inp.addClass("ke-input-tip");
                        inp.val(tip);
                    }
                });
                inp.on("focus", function() {
                    inp.removeClass("ke-input-tip");
                    if (S.trim(inp.val()) == tip) {
                        inp.val("");
                    }
                });
            },
            /**
             * Convert certain characters (&, <, >, and ') to their HTML character equivalents
             *  for literal display in web pages.
             * @param {string} value The string to encode
             * @return {string} The encoded text
             */
            htmlEncode : function(value) {
                return !value ? value : String(value).replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
            },
            /**
             *
             * @param params {Object}
             * @return {Object}
             */
            normParams:function (params) {
                params = S.clone(params);
                for (var p in params) {
                    if (params.hasOwnProperty(p)) {
                        var v = params[p];
                        if (S.isFunction(v)) {
                            params[p] = v();
                        }
                    }
                }
                return params;
            },

            /**
             *
             * @param o {Object} 提交 form 配置
             * @param ps {Object} 动态参数
             * @param url {string} 目的地 url
             */
            doFormUpload : function(o, ps, url) {
                var id = S.guid("form-upload-");
                var frame = document.createElement('iframe');
                frame.id = id;
                frame.name = id;
                frame.className = 'ke-hidden';

                var srcScript = 'document.open();' +
                    // The document domain must be set any time we
                    // call document.open().
                    ( Utils.isCustomDomain() ? ( 'document.domain="' + document.domain + '";' ) : '' ) +
                    'document.close();';
                if (UA['ie']) {
                    frame.src = UA['ie'] ? 'javascript:void(function(){' + encodeURIComponent(srcScript) + '}())' : '';
                }
                S.log("doFormUpload : " + frame.src);
                document.body.appendChild(frame);

                if (UA['ie']) {
                    document['frames'][id].name = id;
                }

                var form = DOM._4e_unwrap(o.form),
                    buf = {
                        target: DOM.attr(form, "target"),
                        method:DOM.attr(form, "method"),
                        encoding: DOM.attr(form, "encoding"),
                        enctype: DOM.attr(form, "enctype"),
                        "action": DOM.attr(form, "action")
                    };
                DOM.attr(form, {
                    target:id,
                    "method":"post",
                    enctype:'multipart/form-data',
                    encoding:   'multipart/form-data'
                });
                if (url) {
                    DOM.attr(form, "action", url);
                }
                var hiddens, hd;
                if (ps) { // add dynamic params
                    hiddens = [];
                    ps = KE.Utils.normParams(ps);
                    for (var k in ps) {
                        if (ps.hasOwnProperty(k)) {
                            hd = document.createElement('input');
                            hd.type = 'hidden';
                            hd.name = k;
                            hd.value = ps[k];
                            form.appendChild(hd);
                            hiddens.push(hd);
                        }
                    }
                }

                function cb() {
                    var r = {  // bogus response object
                        responseText : '',
                        responseXML : NULL
                    };

                    r.argument = o ? o.argument : NULL;

                    try { //
                        var doc;
                        if (UA['ie']) {
                            doc = frame.contentWindow.document;
                        } else {
                            doc = (frame.contentDocument || window.frames[id].document);
                        }

                        if (doc && doc.body) {
                            r.responseText = S.trim(DOM.text(doc.body));
                        }
                        if (doc && doc['XMLDocument']) {
                            r.responseXML = doc['XMLDocument'];
                        } else {
                            r.responseXML = doc;
                        }

                    }
                    catch(e) {
                        // ignore
                        // 2010-11-15 由于外边设置了document.domain导致读不到数据抛异常
                        S.log("after data returns error ,maybe domain problem:");
                        S.log(e, "error");
                    }

                    Event.remove(frame, 'load', cb);
                    o.callback && o.callback(r);

                    setTimeout(function() {
                        DOM._4e_remove(frame);
                    }, 100);

                }

                Event.on(frame, 'load', cb);

                form.submit();

                DOM.attr(form, buf);

                if (hiddens) { // remove dynamic params
                    for (var i = 0, len = hiddens.length; i < len; i++) {
                        DOM._4e_remove(hiddens[i]);
                    }
                }
                return frame;
            },
//            /**
//             * extern for closure compiler
//             */
//            extern:function(obj, cfg) {
//                for (var i in cfg) {
//                    obj[i] = cfg[i];
//                }
//            },
            map:function(arr, callback) {
                for (var i = 0; i < arr.length; i++) {
                    arr[i] = callback(arr[i]);
                }
                return arr;
            },
            //直接判断引擎，防止兼容性模式影响
            ieEngine:(function() {
                if (!UA['ie']) return;
                return document['documentMode'] || UA['ie'];
            })(),

            /**
             * 点击 el 或者 el 内的元素，不会使得焦点转移
             * @param el
             */
            preventFocus:function(el) {
                if (UA['ie']) {
                    //ie 点击按钮不丢失焦点
                    el._4e_unselectable();
                } else {
                    el.attr("onmousedown", "return false;");
                }
            },

            isFlashEmbed:function(element) {
                var attributes = element.attributes;
                return (
                    attributes.type == 'application/x-shockwave-flash'
                        ||
                        /\.swf(?:$|\?)/i.test(attributes.src || '')
                    );
            },

            addRes:function() {
                this.__res = this.__res || [];
                var res = this.__res;
                res.push.apply(res, S.makeArray(arguments));
            },

            destroyRes:function() {
                var res = this.__res || [];
                for (var i = 0; i < res.length; i++) {
                    var r = res[i];
                    if (S.isFunction(r)) {
                        r();
                    } else {
                        if (r.detach)
                            r.detach();
                        if (r.destroy) {
                            r.destroy();
                        }
                        if (r.nodeType && r.remove) {
                            r.remove();
                        }
                    }
                }
                this.__res = [];
            }
        };

    KE.Utils = Utils;

    return Utils;
});
/**
 * dom utils for kissy editor,mainly from ckeditor
 * @author <yiminghe@gmail.com>
 */
/*
 Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.html or http://ckeditor.com/license
 */
KISSY.Editor.add("dom", function (KE) {

    var TRUE = true,
        FALSE = false,
        NULL = null,
        S = KISSY,
        DOM = S.DOM,
        UA = S.UA,
        doc = document,
        Node = S.Node,
        Utils = KE.Utils,
        GET_BOUNDING_CLIENT_RECT = 'getBoundingClientRect',
        REMOVE_EMPTY = {
            "abbr":1,
            "acronym":1,
            "address":1,
            "b":1,
            "bdo":1,
            "big":1,
            "cite":1,
            "code":1,
            "del":1,
            "dfn":1,
            "em":1,
            "font":1,
            "i":1,
            "ins":1,
            "label":1,
            "kbd":1,
            "q":1,
            "s":1,
            "samp":1,
            "small":1,
            "span":1,
            "strike":1,
            "strong":1,
            "sub":1,
            "sup":1,
            "tt":1,
            "u":1,
            'var':1
        };
    /**
     * Enum for node type
     * @enum {number}
     */
    KE.NODE = {
        NODE_ELEMENT:1,
        NODE_TEXT:3,
        NODE_COMMENT:8,
        NODE_DOCUMENT_FRAGMENT:11
    };
    KE["NODE"] = KE.NODE;
    /**
     * Enum for node position
     * @enum {number}
     */
    KE.POSITION = {
        POSITION_IDENTICAL:0,
        POSITION_DISCONNECTED:1,
        POSITION_FOLLOWING:2,
        POSITION_PRECEDING:4,
        POSITION_IS_CONTAINED:8,
        POSITION_CONTAINS:16
    };
    KE["POSITION"] = KE.POSITION;
    var KEN = KE.NODE, KEP = KE.POSITION;

    /*
     * Anything whose display computed style is block, list-item, table,
     * table-row-group, table-header-group, table-footer-group, table-row,
     * table-column-group, table-column, table-cell, table-caption, or whose node
     * name is hr, br (when enterMode is br only) is a block boundary.
     */
    var blockBoundaryDisplayMatch = {
        "block":1,
        'list-item':1,
        "table":1,
        'table-row-group':1,
        'table-header-group':1,
        'table-footer-group':1,
        'table-row':1,
        'table-column-group':1,
        'table-column':1,
        'table-cell':1,
        'table-caption':1
    },
        blockBoundaryNodeNameMatch = { "hr":1 },
        /**
         * @param el {(Node)}
         */
            normalElDom = function (el) {
            return   el[0] || el;
        },
        /**
         * @param el {(Node)}
         */
            normalEl = function (el) {
            if (el && !el[0]) return new Node(el);
            return el;
        },
        editorDom = {
            _4e_wrap:normalEl,
            _4e_unwrap:normalElDom,
            /**
             *
             * @param e1 {(Node)}
             * @param e2 {(Node)}
             */
            _4e_equals:function (e1, e2) {
                //全部为空
                if (!e1 && !e2)return TRUE;
                //一个为空，一个不为空
                if (!e1 || !e2)return FALSE;
                e1 = normalElDom(e1);
                e2 = normalElDom(e2);
                return e1 === e2;
            },
            /**
             *
             * @param el {(Node)}
             * @param customNodeNames {Object}
             */
            _4e_isBlockBoundary:function (el, customNodeNames) {
                el = normalEl(el);
                var nodeNameMatches = S.mix(S.mix({}, blockBoundaryNodeNameMatch), customNodeNames || {});

                return blockBoundaryDisplayMatch[ el.css('display') ] ||
                    nodeNameMatches[ el._4e_name() ];
            },

            /**
             *
             * @param elem {Node|Document}
             */
            _4e_getWin:function (elem) {
                return (elem && ('scrollTo' in elem) && elem["document"]) ?
                    elem :
                    elem && elem.nodeType === 9 ?
                        elem.defaultView || elem.parentWindow :
                        FALSE;
            },
            /**
             *
             * @param el {(Node)}
             */
            _4e_index:function (el) {
                el = normalElDom(el);
                var siblings = el.parentNode.childNodes;
                for (var i = 0; i < siblings.length; i++) {
                    if (siblings[i] === el) return i;
                }
                return -1;
            },
            /**
             *
             * @param el {(Node)}
             * @param evaluator {function(KISSY.Node)}
             */
            _4e_first:function (el, evaluator) {
                el = normalElDom(el);
                var first = el.firstChild,
                    retval = first && new Node(first);
                if (retval && evaluator && !evaluator(retval))
                    retval = retval._4e_next(evaluator);

                return retval;
            },
            /**
             *
             * @param thisElement {(Node)}
             * @param target {(Node)}
             * @param toStart {boolean}
             */
            _4e_move:function (thisElement, target, toStart) {
                thisElement = normalElDom(thisElement);
                DOM._4e_remove(thisElement);
                target = normalElDom(target);
                if (toStart) {
                    target.insertBefore(thisElement, target.firstChild);
                }
                else {
                    target.appendChild(thisElement);
                }
            },

            /**
             *
             * @param [thisElement] {Node}
             */
            _4e_name:function (thisElement) {
                thisElement = normalElDom(thisElement);
                var nodeName = thisElement.nodeName.toLowerCase();
                //note by yiminghe:http://msdn.microsoft.com/en-us/library/ms534388(VS.85).aspx
                if (UA['ie']) {
                    var scopeName = thisElement['scopeName'];
                    if (scopeName && scopeName != 'HTML')
                        nodeName = scopeName.toLowerCase() + ':' + nodeName;
                }
                return nodeName;
            },
            /**
             *
             * @param thisElement {(Node)}
             * @param otherElement {(Node)}
             */
            _4e_isIdentical:function (thisElement, otherElement) {
                if (thisElement._4e_name() != otherElement._4e_name())
                    return FALSE;

                var thisAttributes = thisElement[0].attributes,
                    otherAttributes = otherElement[0].attributes,
                    thisLength = thisAttributes.length,
                    otherLength = otherAttributes.length;

                if (thisLength != otherLength)
                    return FALSE;

                for (var i = 0; i < thisLength; i++) {
                    var attribute = thisAttributes[i],
                        name = attribute.name;
                    if (attribute.specified
                        &&
                        thisElement.attr(name) != otherElement.attr(name))
                        return FALSE;
                }

                // For IE, we have to for both elements, because it's difficult to
                // know how the atttibutes collection is organized in its DOM.
                // ie 使用版本 < 8
                if (Utils.ieEngine < 8) {
                    for (i = 0; i < otherLength; i++) {
                        attribute = otherAttributes[ i ];
                        name = attribute.name;
                        if (attribute.specified
                            &&
                            thisElement.attr(name) != otherElement.attr(name))
                            return FALSE;
                    }
                }

                return TRUE;
            },

            /**
             *
             * @param thisElement {(Node)}
             */
            _4e_isEmptyInlineRemoveable:function (thisElement) {
                var children = normalElDom(thisElement).childNodes;
                for (var i = 0, count = children.length; i < count; i++) {
                    var child = children[i],
                        nodeType = child.nodeType;

                    if (nodeType == KEN.NODE_ELEMENT && child.getAttribute('_ke_bookmark'))
                        continue;

                    if (nodeType == KEN.NODE_ELEMENT && !editorDom._4e_isEmptyInlineRemoveable(child)
                        || nodeType == KEN.NODE_TEXT && S.trim(child.nodeValue)) {
                        return FALSE;
                    }
                }
                return TRUE;
            },

            /**
             *
             * @param thisElement {(Node)}
             * @param target {(Node)}
             * @param toStart {boolean}
             */
            _4e_moveChildren:function (thisElement, target, toStart) {
                var $ = normalElDom(thisElement);
                target = target[0] || target;
                if ($ == target)
                    return;

                var child;

                if (toStart) {
                    while (( child = $.lastChild ))
                        target.insertBefore($.removeChild(child), target.firstChild);
                }
                else {
                    while (( child = $.firstChild ))
                        target.appendChild($.removeChild(child));
                }
            },

            /**
             *
             * @param elem {(Node)}
             */
            _4e_mergeSiblings:( function () {

                /**
                 *
                 * @param element {(Node)}
                 * @param sibling {(Node)}
                 * @param  {boolean=} isNext
                 */
                function mergeElements(element, sibling, isNext) {
                    if (sibling[0] && sibling[0].nodeType == KEN.NODE_ELEMENT) {
                        // Jumping over bookmark nodes and empty inline elements, e.g. <b><i></i></b>,
                        // queuing them to be moved later. (#5567)
                        var pendingNodes = [];

                        while (sibling.attr('_ke_bookmark')
                            || sibling._4e_isEmptyInlineRemoveable()) {
                            pendingNodes.push(sibling);
                            sibling = isNext ? new Node(sibling[0].nextSibling) : new Node(sibling[0].previousSibling);
                            if (!sibling[0] || sibling[0].nodeType != KEN.NODE_ELEMENT)
                                return;
                        }

                        if (element._4e_isIdentical(sibling)) {
                            // Save the last child to be checked too, to merge things like
                            // <b><i></i></b><b><i></i></b> => <b><i></i></b>
                            var innerSibling = isNext ? element[0].lastChild : element[0].firstChild;

                            // Move pending nodes first into the target element.
                            while (pendingNodes.length)
                                pendingNodes.shift()._4e_move(element, !isNext);

                            sibling._4e_moveChildren(element, !isNext);
                            sibling._4e_remove();

                            // Now check the last inner child (see two comments above).
                            if (innerSibling[0] && innerSibling[0].nodeType == KEN.NODE_ELEMENT)
                                innerSibling._4e_mergeSiblings();
                        }
                    }
                }

                return function (thisElement) {
                    if (!thisElement[0]) return;
                    //note by yiminghe,why not just merge whatever
                    // Merge empty links and anchors also. (#5567)
                    if (!
                        ( REMOVE_EMPTY[ thisElement._4e_name() ]
                            ||
                            thisElement._4e_name() == "a" )
                        )
                        return;

                    mergeElements(thisElement, new Node(thisElement[0].nextSibling), TRUE);
                    mergeElements(thisElement, new Node(thisElement[0].previousSibling));
                };
            } )(),

            /**
             *
             * @param elem {(Node)}
             */
            _4e_unselectable:UA.gecko ?
                function (el) {
                    el = normalElDom(el);
                    el.style['MozUserSelect'] = 'none';
                }
                : UA['webkit'] ?
                function (el) {
                    el = normalElDom(el);
                    el.style['KhtmlUserSelect'] = 'none';
                }
                :
                function (el) {
                    el = normalElDom(el);
                    if (UA['ie'] || UA.opera) {
                        var
                            e,
                            i = 0;

                        //el.unselectable='on';
                        el.setAttribute("unselectable", 'on');
                        var els = el.getElementsByTagName("*");
                        while (( e = els[ i++ ] )) {
                            switch (e.tagName.toLowerCase()) {
                                case 'iframe' :
                                case 'textarea' :
                                case 'input' :
                                case 'select' :
                                    /* Ignore the above tags */
                                    break;
                                default :
                                    //e.unselectable='on';
                                    //ie9 使用 setAttribute才可以
                                    e.setAttribute("unselectable", 'on');
                            }
                        }
                    }
                },

            /**
             *
             * @param elem {(Node)}
             * @param [refDocument] {Document}
             */
            _4e_getOffset:function (elem, refDocument) {
                elem = normalElDom(elem);
                var box,
                    x = 0,
                    y = 0,
                    currentWindow = elem.ownerDocument.defaultView || elem.ownerDocument.parentWindow,
                    currentDoc = elem.ownerDocument,
                    currentDocElem = currentDoc.documentElement;
                refDocument = refDocument || currentDoc;
                //same with DOM.offset
                if (elem[GET_BOUNDING_CLIENT_RECT]) {
                    if (elem !== currentDoc.body && currentDocElem !== elem) {
                        box = elem[GET_BOUNDING_CLIENT_RECT]();
                        //相对于refDocument，里层iframe的滚动不计
                        x = box.left + (refDocument === currentDoc ? DOM["scrollLeft"](currentWindow) : 0);
                        y = box.top + (refDocument === currentDoc ? DOM["scrollTop"](currentWindow) : 0);
                    }
                    if (refDocument) {
                        var refWindow = refDocument.defaultView || refDocument.parentWindow;
                        if (currentWindow != refWindow && currentWindow['frameElement']) {
                            //note:when iframe is static ,still some mistake
                            var iframePosition = editorDom._4e_getOffset(currentWindow['frameElement'], refDocument);
                            x += iframePosition.left;
                            y += iframePosition.top;
                        }
                    }
                }
                return { left:x, top:y };
            },

            /**
             *
             * @param el {(Node)}
             * @param offset {number}
             */
            _4e_splitText:function (el, offset) {
                el = normalElDom(el);
                var doc = el.ownerDocument;
                if (!el || el.nodeType != KEN.NODE_TEXT) return;
                // If the offset is after the last char, IE creates the text node
                // on split, but don't include it into the DOM. So, we have to do
                // that manually here.
                if (UA['ie'] && offset == el.nodeValue.length) {
                    var next = doc.createTextNode("");
                    DOM.insertAfter(next, el);
                    return new Node(next);
                }


                var retval = new Node(el.splitText(offset));

                // IE BUG: IE8 does not update the childNodes array in DOM after splitText(),
                // we need to make some DOM changes to make it update. (#3436)
                //我靠！UA['ie']==8 不对，
                //判断不出来:UA['ie']==7 && doc.documentMode==7
                //浏览器模式：当ie8处于兼容视图以及ie7时，UA['ie']==7
                //文本模式: mode=5 ,mode=7, mode=8
                //alert("ua:"+UA['ie']);
                //alert("mode:"+doc.documentMode);
                //ie8 浏览器有问题，而不在于是否哪个模式
                if (!!doc['documentMode']) {
                    var workaround = doc.createTextNode("");
                    DOM.insertAfter(workaround, retval[0]);
                    DOM._4e_remove(workaround);
                }

                return retval;
            },

            /**
             *
             * @param node {(Node)}
             * @param closerFirst {boolean}
             */
            _4e_parents:function (node, closerFirst) {
                node = normalEl(node);
                var parents = [];
                do {
                    parents[  closerFirst ? 'push' : 'unshift' ](node);
                } while (( node = node.parent() ));

                return parents;
            },

            /**
             *
             * @param el {(Node)}
             * @param includeChildren {boolean}
             * @param [cloneId] {string}
             */
            _4e_clone:function (el, includeChildren, cloneId) {
                el = normalElDom(el);
                var $clone = el.cloneNode(includeChildren);

                if (!cloneId) {
                    var removeIds = function (node) {
                        if (node.nodeType != KEN.NODE_ELEMENT)
                            return;

                        node.removeAttribute('id');

                        var childs = node.childNodes;
                        for (var i = 0; i < childs.length; i++)
                            removeIds(childs[ i ]);
                    };

                    // The "id" attribute should never be cloned to avoid duplication.
                    removeIds($clone);
                }
                return new Node($clone);
            },
            /**
             * 深度优先遍历获取下一结点
             * @param el {(Node)}
             * @param startFromSibling {boolean}
             * @param nodeType {number}
             * @param guard {function(KISSY.Node)}
             */
            _4e_nextSourceNode:function (el, startFromSibling, nodeType, guard) {
                el = normalElDom(el);
                // If "guard" is a node, transform it in a function.
                if (guard && !guard.call) {
                    var guardNode = guard[0] || guard;
                    guard = function (node) {
                        node = node[0] || node;
                        return node !== guardNode;
                    };
                }

                var node = !startFromSibling && el.firstChild ,
                    parent = new Node(el);

                // Guarding when we're skipping the current element( no children or 'startFromSibling' ).
                // send the 'moving out' signal even we don't actually dive into.
                if (!node) {
                    if (el.nodeType == KEN.NODE_ELEMENT && guard && guard(el, TRUE) === FALSE)
                        return NULL;
                    node = el.nextSibling;
                }

                while (!node && ( parent = parent.parent())) {
                    // The guard check sends the "TRUE" paramenter to indicate that
                    // we are moving "out" of the element.
                    if (guard && guard(parent, TRUE) === FALSE)
                        return NULL;

                    node = parent[0].nextSibling;
                }

                if (!node)
                    return NULL;
                node = DOM._4e_wrap(node);
                if (guard && guard(node) === FALSE)
                    return NULL;

                if (nodeType && nodeType != node[0].nodeType)
                    return node._4e_nextSourceNode(FALSE, nodeType, guard);

                return node;
            },

            /**
             *
             * @param el {(Node)}
             * @param startFromSibling {boolean}
             * @param nodeType {number}
             * @param guard {function(KISSY.Node)}
             */
            _4e_previousSourceNode:function (el, startFromSibling, nodeType, guard) {
                el = normalElDom(el);
                if (guard && !guard.call) {
                    var guardNode = guard[0] || guard;
                    guard = function (node) {
                        node = node[0] || node;
                        return node !== guardNode;
                    };
                }

                var node = ( !startFromSibling && el.lastChild),
                    parent = new Node(el);

                // Guarding when we're skipping the current element( no children or 'startFromSibling' ).
                // send the 'moving out' signal even we don't actually dive into.
                if (!node) {
                    if (el.nodeType == KEN.NODE_ELEMENT && guard && guard(el, TRUE) === FALSE)
                        return NULL;
                    node = el.previousSibling;
                }

                while (!node && ( parent = parent.parent() )) {
                    // The guard check sends the "TRUE" paramenter to indicate that
                    // we are moving "out" of the element.
                    if (guard && guard(parent, TRUE) === FALSE)
                        return NULL;
                    node = parent[0].previousSibling;
                }

                if (!node)
                    return NULL;
                node = DOM._4e_wrap(node);
                if (guard && guard(node) === FALSE)
                    return NULL;

                if (nodeType && node[0].nodeType != nodeType)
                    return node._4e_previousSourceNode(FALSE, nodeType, guard);

                return node;
            },

            /**
             *
             * @param el {(Node)}
             * @param node {(Node)}
             */
            _4e_commonAncestor:function (el, node) {
                if (el._4e_equals(node))
                    return el;

                if (node[0].nodeType != KEN.NODE_TEXT && node.contains(el))
                    return node;

                var start = el[0].nodeType == KEN.NODE_TEXT ? el.parent() : el;

                do {
                    if (start[0].nodeType != KEN.NODE_TEXT && start.contains(node))
                        return start;
                } while (( start = start.parent() ));

                return NULL;
            },

            /**
             *
             * @param el {(Node)}
             * @param name {string}
             * @param includeSelf {boolean}
             */
            _4e_ascendant:function (el, name, includeSelf) {
                var $ = normalElDom(el);

                if (!includeSelf)
                    $ = $.parentNode;
                if (name && !S.isFunction(name)) {
                    var n = name;
                    name = function (node) {
                        return node._4e_name() == n;
                    };
                }
                //到document就完了
                while ($ && $.nodeType != 9) {
                    if (!name || name(new Node($)) === TRUE)
                        return new Node($);

                    $ = $.parentNode;
                }
                return NULL;
            },

            /**
             *
             * @param el {(Node)}
             * @param name {string}
             */
            _4e_hasAttribute:Utils.ieEngine < 9 ?
                function (el, name) {
                    el = normalElDom(el);
                    // from ppk :http://www.quirksmode.org/dom/w3c_core.html
                    // IE5-7 doesn't return the value of a style attribute.
                    // var $attr = el.attributes[name];
                    // http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
                    // try name=tabindex
                    var $attr = el.getAttributeNode(name);
                    return !!( $attr && $attr.specified );
                }
                :
                function (el, name) {
                    el = normalElDom(el);
                    //使用原生实现
                    return el.hasAttribute(name);
                },
            /**
             * 统一的属性处理方式
             * @param el {(Node)}
             * @param otherNode {(Node)}
             */
            _4e_hasAttributes:Utils.ieEngine < 9 ?
                function (el) {
                    el = normalElDom(el);
                    var attributes = el.attributes;
                    for (var i = 0; i < attributes.length; i++) {
                        var attribute = attributes[i];
                        switch (attribute.name) {
                            case 'class' :
                                // IE has a strange bug. If calling removeAttribute('className'),
                                // the attributes collection will still contain the "class"
                                // attribute, which will be marked as "specified", even if the
                                // outerHTML of the element is not displaying the class attribute.
                                // Note : I was not able to reproduce it outside the editor,
                                // but I've faced it while working on the TC of #1391.
                                if (el.getAttribute('class'))
                                    return TRUE;
                                break;
                            /*jsl:fallthru*/
                            default :
                                if (attribute.specified)
                                    return TRUE;
                        }
                    }
                    return FALSE;
                }
                :
                function (el) {
                    el = normalElDom(el);
                    //删除firefox自己添加的标志
                    UA.gecko && el.removeAttribute("_moz_dirty");
                    //使用原生
                    //ie8 莫名其妙多个shape？？specified为false
                    return el.hasAttributes();
                },

            /**
             *
             * @param el {(Node)}
             * @param otherNode {(Node)}
             */
            _4e_position:function (el, otherNode) {
                var $ = normalElDom(el), $other = normalElDom(otherNode);


                if ($.compareDocumentPosition)
                    return $.compareDocumentPosition($other);

                // IE and Safari have no support for compareDocumentPosition.

                if ($ == $other)
                    return KEP.POSITION_IDENTICAL;

                // Only element nodes support contains and sourceIndex.
                if ($.nodeType == KEN.NODE_ELEMENT && $other.nodeType == KEN.NODE_ELEMENT) {
                    if ($.contains) {
                        if ($.contains($other))
                            return KEP.POSITION_CONTAINS + KEP.POSITION_PRECEDING;

                        if ($other.contains($))
                            return KEP.POSITION_IS_CONTAINED + KEP.POSITION_FOLLOWING;
                    }

                    if ('sourceIndex' in $) {
                        return ( $.sourceIndex < 0 || $other.sourceIndex < 0 ) ? KEP.POSITION_DISCONNECTED :
                            ( $.sourceIndex < $other.sourceIndex ) ? KEP.POSITION_PRECEDING :
                                KEP.POSITION_FOLLOWING;
                    }
                }

                // For nodes that don't support compareDocumentPosition, contains
                // or sourceIndex, their "address" is compared.

                var addressOfThis = el._4e_address(),
                    addressOfOther = otherNode._4e_address(),
                    minLevel = Math.min(addressOfThis.length, addressOfOther.length);

                // Determinate preceed/follow relationship.
                for (var i = 0; i <= minLevel - 1; i++) {
                    if (addressOfThis[ i ] != addressOfOther[ i ]) {
                        if (i < minLevel) {
                            return addressOfThis[ i ] < addressOfOther[ i ] ?
                                KEP.POSITION_PRECEDING : KEP.POSITION_FOLLOWING;
                        }
                        break;
                    }
                }

                // Determinate contains/contained relationship.
                return ( addressOfThis.length < addressOfOther.length ) ?
                    KEP.POSITION_CONTAINS + KEP.POSITION_PRECEDING :
                    KEP.POSITION_IS_CONTAINED + KEP.POSITION_FOLLOWING;
            },

            /**
             *
             * @param el {(Node)}
             * @param normalized {boolean}
             */
            _4e_address:function (el, normalized) {
                el = normalElDom(el);
                var address = [],

                    $documentElement = el.ownerDocument.documentElement,
                    node = el;

                while (node && node != $documentElement) {
                    var parentNode = node.parentNode,
                        currentIndex = -1;

                    if (parentNode) {
                        for (var i = 0; i < parentNode.childNodes.length; i++) {
                            var candidate = parentNode.childNodes[i];

                            if (normalized &&
                                candidate.nodeType == 3 &&
                                candidate.previousSibling &&
                                candidate.previousSibling.nodeType == 3) {
                                continue;
                            }

                            currentIndex++;

                            if (candidate == node)
                                break;
                        }

                        address.unshift(currentIndex);
                    }

                    node = parentNode;
                }
                return address;
            },

            /**
             *
             * @param el {(Node)}
             * @param parent {(Node)}
             */
            _4e_breakParent:function (el, parent) {
                var KERange = KE.Range, range = new KERange(el[0].ownerDocument);

                // We'll be extracting part of this element, so let's use our
                // range to get the correct piece.
                range.setStartAfter(el);
                range.setEndAfter(parent);

                // Extract it.
                var docFrag = range.extractContents();

                // Move the element outside the broken element.
                range.insertNode(el._4e_remove());

                // Re-insert the extracted piece after the element.
                el[0].parentNode.insertBefore(docFrag, el[0].nextSibling);
            },

            /**
             *
             * @param el {(Node)}
             * @param {string} [styleName]
             * @param {string} [val]
             */
            _4e_style:function (el, styleName, val) {
                if (val !== undefined) {
                    el = normalEl(el);
                    el.css(styleName, val);
                    var style = el[0].style;
                    // kissy #80 fix,font-family
                    if (val == "" && style.removeAttribute) {
                        style.removeAttribute(styleName);
                    }
                    if (!style.cssText) {
                        el[0].removeAttribute('style');
                    }
                } else {
                    el = normalElDom(el);
                    return el.style[normalizeStyle(styleName)];
                }
            },

            /**
             *
             * @param el {(Node)}
             * @param [preserveChildren] {boolean}
             */
            _4e_remove:function (el, preserveChildren) {
                var $ = normalElDom(el), parent = $.parentNode;
                if (parent) {
                    if (preserveChildren) {
                        // Move all children before the node.
                        for (var child; ( child = $.firstChild );) {
                            parent.insertBefore($.removeChild(child), $);
                        }
                    }
                    parent.removeChild($);
                }
                return el;
            },
            /**
             *
             * @param el {(Node)}
             */
            _4e_trim:function (el) {
                DOM._4e_ltrim(el);
                DOM._4e_rtrim(el);
            },

            /**
             *
             * @param el {(Node)}
             */
            _4e_ltrim:function (el) {
                el = normalElDom(el);
                var child;
                while (( child = el.firstChild )) {
                    if (child.nodeType == KEN.NODE_TEXT) {
                        var trimmed = Utils.ltrim(child.nodeValue),
                            originalLength = child.nodeValue.length;

                        if (!trimmed) {
                            el.removeChild(child);
                            continue;
                        }
                        else if (trimmed.length < originalLength) {
                            new Node(child)._4e_splitText(originalLength - trimmed.length);
                            // IE BUG: child.remove() may raise JavaScript errors here. (#81)
                            el.removeChild(el.firstChild);
                        }
                    }
                    break;
                }
            },

            /**
             *
             * @param el {(Node)}
             */
            _4e_rtrim:function (el) {
                el = normalElDom(el);
                var child;
                while (( child = el.lastChild )) {
                    if (child.type == KEN.NODE_TEXT) {
                        var trimmed = Utils.rtrim(child.nodeValue),
                            originalLength = child.nodeValue.length;

                        if (!trimmed) {
                            el.removeChild(child);
                            continue;
                        } else if (trimmed.length < originalLength) {
                            new Node(child)._4e_splitText(trimmed.length);
                            // IE BUG: child.getNext().remove() may raise JavaScript errors here.
                            // (#81)
                            el.removeChild(el.lastChild);
                        }
                    }
                    break;
                }

                if (!UA['ie'] && !UA.opera) {
                    child = el.lastChild;
                    if (child && child.nodeType == 1 && child.nodeName.toLowerCase() == 'br') {
                        // Use "eChildNode.parentNode" instead of "node" to avoid IE bug (#324).
                        child.parentNode.removeChild(child);
                    }
                }
            },

            /**
             *
             * @param el {(Node)}
             */
            _4e_appendBogus:function (el) {
                el = normalElDom(el);
                var lastChild = el.lastChild;

                // Ignore empty/spaces text.
                while (lastChild &&
                    lastChild.nodeType == KEN.NODE_TEXT &&
                    !S.trim(lastChild.nodeValue))
                    lastChild = lastChild.previousSibling;
                if (!lastChild ||
                    lastChild.nodeType == KEN.NODE_TEXT ||
                    DOM._4e_name(lastChild) !== 'br') {
                    var bogus = UA.opera ?
                        el.ownerDocument.createTextNode('') :
                        el.ownerDocument.createElement('br');

                    UA.gecko && bogus.setAttribute('type', '_moz');
                    el.appendChild(bogus);
                }
            },

            _4e_getBogus:function (el) {
                return KE.Walker.getBogus(normalEl(el));
            },

            /**
             *
             * @param el {(Node)}
             * @param evaluator {function(KISSY.Node)}
             */
            _4e_previous:function (el, evaluator) {
                var previous = normalElDom(el), retval;
                do {
                    previous = previous.previousSibling;
                    retval = previous && new Node(previous);
                } while (retval && evaluator && !evaluator(retval));
                return retval;
            },

            /**
             *
             * @param el {(Node)}
             * @param evaluator {function(KISSY.Node)}
             */
            _4e_last:function (el, evaluator) {
                el = DOM._4e_wrap(el);
                var last = el[0].lastChild,
                    retval = last && new Node(last);
                if (retval && evaluator && !evaluator(retval))
                    retval = retval._4e_previous(evaluator);

                return retval;
            },
            /**
             *
             * @param el {(Node)}
             * @param evaluator {function(KISSY.Node)}
             */
            _4e_next:function (el, evaluator) {
                var next = normalElDom(el), retval;
                do {
                    next = next.nextSibling;
                    retval = next && new Node(next);
                } while (retval && evaluator && !evaluator(retval));
                return retval;
            },
            /**
             *
             * @param el {(Node)}
             */
            _4e_outerHtml:function (el) {
                el = normalElDom(el);
                if (el.outerHTML) {
                    // IE includes the <?xml:namespace> tag in the outerHTML of
                    // namespaced element. So, we must strip it here. (#3341)
                    return el.outerHTML.replace(/<\?[^>]*>/, '');
                }

                var tmpDiv = el.ownerDocument.createElement('div');
                tmpDiv.appendChild(el.cloneNode(TRUE));
                return tmpDiv.innerHTML;
            },

            /**
             *
             * @param element {(Node)}
             * @param database {Object}
             * @param name {string}
             * @param value {string}
             */
            _4e_setMarker:function (element, database, name, value) {
                element = DOM._4e_wrap(element);
                var id = element.data('list_marker_id') ||
                    ( element.data('list_marker_id', S.guid()).data('list_marker_id')),
                    markerNames = element.data('list_marker_names') ||
                        ( element.data('list_marker_names', {}).data('list_marker_names'));
                database[id] = element;
                markerNames[name] = 1;
                return element.data(name, value);
            },

            /**
             *
             * @param element {(Node)}
             * @param database {Object}
             * @param removeFromDatabase {boolean}
             */
            _4e_clearMarkers:function (element, database, removeFromDatabase) {
                element = normalEl(element);
                var names = element.data('list_marker_names'),
                    id = element.data('list_marker_id');
                for (var i in names)
                    element.removeData(i);
                element.removeData('list_marker_names');
                if (removeFromDatabase) {
                    element.removeData('list_marker_id');
                    delete database[id];
                }
            },

            /**
             *
             * @param el {(Node)}
             * @param dest  {(Node)}
             * @param skipAttributes {Object}
             */
            _4e_copyAttributes:function (el, dest, skipAttributes) {
                el = normalElDom(el);
                dest = normalEl(dest);
                var attributes = el.attributes;
                skipAttributes = skipAttributes || {};

                for (var n = 0; n < attributes.length; n++) {
                    // Lowercase attribute name hard rule is broken for
                    // some attribute on IE, e.g. CHECKED.
                    var attribute = attributes[n],
                        attrName = attribute.name.toLowerCase(),
                        attrValue;

                    // We can set the type only once, so do it with the proper value, not copying it.
                    if (attrName in skipAttributes)
                        continue;

                    if (attrName == 'checked' && ( attrValue = DOM.attr(el, attrName) ))
                        dest.attr(attrName, attrValue);
                    // IE BUG: value attribute is never specified even if it exists.
                    else if (attribute.specified ||
                        ( UA['ie'] && attribute.value && attrName == 'value' )) {
                        attrValue = DOM.attr(el, attrName);
                        if (attrValue === NULL)
                            attrValue = attribute.nodeValue;
                        dest.attr(attrName, attrValue);
                    }
                }

                // The style:
                if (el.style.cssText !== '')
                    dest[0].style.cssText = el.style.cssText;
            },

            /**
             *
             * @param el {(Node)}
             */
            _4e_isEditable:function (el) {

                // Get the element DTD (defaults to span for unknown elements).
                var name = DOM._4e_name(el),
                    xhtml_dtd = KE.XHTML_DTD,
                    dtd = !xhtml_dtd.$nonEditable[ name ]
                        && ( xhtml_dtd[ name ] || xhtml_dtd["span"] );

                // In the DTD # == text node.
                return ( dtd && dtd['#'] );
            },
            /**
             * 修正scrollIntoView在可视区域内不需要滚动
             * @param {Node} [elem]
             */
            _4e_scrollIntoView:function (elem) {
                elem = normalEl(elem);
                var doc = elem[0].ownerDocument;
                // 底部对齐
                elem.scrollIntoView(doc, false);
            },

            /**
             *
             * @param elem {(Node)}
             * @param tag {string}
             * @param namespace {string=}
             * @return {Array.<KISSY.Node>}
             */
            _4e_getElementsByTagName:function (elem, tag, namespace) {
                elem = normalElDom(elem);
                if (!UA['ie'] && namespace) {
                    tag = namespace + ":" + tag
                }
                var re = [], els = elem.getElementsByTagName(tag);
                for (var i = 0; i < els.length; i++)
                    re.push(new Node(els[i]));
                return re;
            }
        };

    /**
     *
     * @param styleName {string}
     */
    function normalizeStyle(styleName) {
        return styleName.replace(/-(\w)/g, function (m, g1) {
            return g1.toUpperCase();
        })
    }

    /**
     *
     * @param editorDom {Object}
     */
    var _4e_inject = function (editorDom) {
        S.mix(DOM, editorDom);
        for (var dm in editorDom) {
            if (editorDom.hasOwnProperty(dm))
                (function (dm) {
                    Node.prototype[dm] = function () {
                        var args = [].slice.call(arguments, 0);
                        args.unshift(this);
                        return editorDom[dm].apply(NULL, args);
                    };
                })(dm);
        }
    };


    _4e_inject(editorDom);
});
/**
 * 多实例的管理，主要是焦点控制，主要是为了
 * 1.firefox 焦点失去 bug，记录当前状态
 * 2.窗口隐藏后能够恢复焦点
 * @author <yiminghe@gmail.com>
 */
KISSY.Editor.add("focusmanager", function(KE) {
    var S = KISSY,
        DOM = S.DOM,
        Event = S.Event,
        INSTANCES = {},
        timer,
        //当前焦点所在处
        currentInstance,
        focusManager = {
            /**
             * 刷新全部实例
             */
            refreshAll:function() {
                for (var i in INSTANCES) {
                    var e = INSTANCES[i];
                    e.document.designMode = "off";
                    e.document['designMode'] = "on";
                }
            },
            /**
             * 得到当前获得焦点的实例
             */
            currentInstance :function() {
                return currentInstance;
            },
            /**
             *
             * @param id {string}
             */
            getInstance : function(id) {
                return INSTANCES[id];
            },
            /**
             *
             * @param editor {KISSY.Editor}
             */
            add : function(editor) {
                var win = DOM._4e_getWin(editor.document);
                Event.on(win, "focus", focus, editor);
                Event.on(win, "blur", blur, editor);
            },
            /**
             *
             * @param editor {KISSY.Editor}
             */
            register : function(editor) {
                INSTANCES[editor._UUID] = editor;
            },
            /**
             *
             * @param editor {KISSY.Editor}
             */
            remove : function(editor) {
                delete INSTANCES[editor._UUID];
                var win = DOM._4e_getWin(editor.document);
                Event.remove(win, "focus", focus, editor);
                Event.remove(win, "blur", blur, editor);
            }
        },
        TRUE = true,
        FALSE = false,
        NULL = null;

    /**
     * @this {KISSY.Editor}
     */
    function focus() {
        var editor = this;
        editor.iframeFocus = TRUE;
        currentInstance = editor;
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(function() {
            editor.fire("focus");
        }, 100);
        //S.log(editor._UUID + " focus");
    }

    /**
     * @this {KISSY.Editor}
     */
    function blur() {
        var editor = this;
        editor.iframeFocus = FALSE;
        currentInstance = NULL;
        if (timer) {
            clearTimeout(timer);
        }
        /*
         Note that this functions acts asynchronously with a delay of 100ms to
         avoid subsequent blur/focus effects.
         */
        timer = setTimeout(function() {
            editor.fire("blur");
        }, 100);
        //S.log(editor._UUID + " blur");
    }

    focusManager['refreshAll'] = focusManager.refreshAll;
    KE.focusManager = focusManager;
    KE["focusManager"] = focusManager;
    KE['getInstances'] = function() {
        return INSTANCES;
    };
    KE["getInstances"] = KE.getInstances;
});
/**
 * definition of editor class for kissy editor
 * @author <yiminghe@gmail.com>
 */
KISSY.Editor.add("definition", function (KE) {
    var
        TRUE = true,
        FALSE = false,
        Utils = KE.Utils,
        NULL = null,
        DOC = document,
        S = KISSY,
        /**
         * @const
         */
            UA = S.UA,
        IS_IE = UA['ie'],
        /**
         * @const
         */
            DOM = S.DOM,
        /**
         * @const
         */
            Node = S.Node,
        //OLD_IE = !window.getSelection,
        /**
         * @const
         */
            Event = S.Event,
        /**
         * @const
         */
            DISPLAY = "display",
        /**
         * @const
         */
            WIDTH = "width",
        /**
         * @const
         */
            HEIGHT = "height",
        /**
         * @const
         */
            NONE = "none",
        focusManager = KE.focusManager,
        tryThese = Utils.tryThese,
        /**
         * @const
         */
            HTML5_DTD = '<!doctype html>',
        /**
         * @const
         */
            DTD = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" ' +
            '"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
        /**
         * @const
         */
            ke_textarea_wrap = ".ke-textarea-wrap",
        /**
         * @const
         */
            ke_editor_tools = ".ke-editor-tools",
        /**
         * @const
         */
            ke_editor_status = ".ke-editor-status";

    /**
     *
     * @param id {string}
     * @param customStyle {string}
     */
    function prepareIFrameHtml(id, customStyle, customLink) {
        var links = "";
        var CSS_FILE = KE.Utils.debugUrl("../theme/editor-iframe.css");
        if (customLink) {
            for (var i = 0; i < customLink.length; i++) {
                links += '<link ' +
                    'href="' +
                    customLink[i]
                    + '" rel="stylesheet"/>';
            }
        }
        return HTML5_DTD
            + "<html>"
            + "<head>"
            // kissy-editor #12
            // IE8 doesn't support carets behind images(empty content after image's block) setting ie7 compatible mode would force IE8+ to run in IE7 compat mode.
            + (DOC.documentMode === 8 ? '<meta http-equiv="X-UA-Compatible" content="IE=7" />' : "")
            + "<title>${title}</title>"
            + "<link "
            + "href='"
            + CSS_FILE
            + "'" +
            " rel='stylesheet'/>"
            + "<style>"
            + (customStyle || "")
            + "</style>"
            + links
            + "</head>"
            + "<body class='ke-editor'>"
            //firefox 必须里面有东西，否则编辑前不能删除!
            + "&nbsp;"
            //使用 setData 加强安全性
            // + (textarea.value || "")
            + (id ?
            // The script that launches the bootstrap logic on 'domReady', so the document
            // is fully editable even before the editing iframe is fully loaded (#4455).
            //确保iframe确实载入成功,过早的话 document.domain 会出现无法访问
            '<script id="ke_actscript" type="text/javascript">' +
                ( Utils.isCustomDomain() ? ( 'document.domain="' + DOC.domain + '";' ) : '' ) +
                'window.parent.KISSY.Editor._initIFrame("' + id + '");' +
                '</script>' : ''
            )
            + "</body>"
            + "</html>";

    }

    var INSTANCE_ID = 1,

        srcScript = 'document.open();' +
            // The document domain must be set any time we
            // call document.open().
            ( Utils.isCustomDomain() ? ( 'document.domain="' + DOC.domain + '";' ) : '' ) +
            'document.close();',

        editorHtml = "<div " +
            " class='ke-editor-wrap' " +
            " > " +
            "<div class='" + ke_editor_tools.substring(1) + "'" +
            " ></div>" +
            "<div class='" + ke_textarea_wrap.substring(1) + "'><" + "iframe " +
            ' style="' + WIDTH + ':100%;' + HEIGHT + ':100%;border:none;" ' +
            ' ' + WIDTH + '="100%" ' +
            ' ' + HEIGHT + '="100%" ' +
            ' frameborder="0" ' +
            ' title="' + "kissy-editor" + '" ' +
            // With IE, the custom domain has to be taken care at first,
            // for other browsers, the 'src' attribute should be left empty to
            // trigger iframe's 'load' event.
            (IS_IE ? (' src="' + 'javascript:void(function(){' + encodeURIComponent(srcScript) + '}())"') : '') +
            //' tabIndex="' + ( UA['webkit'] ? -1 : "$(tabIndex)" ) + '" ' +
            ' allowTransparency="true" ' +
            '></iframe></div>' +
            "<div class='" + ke_editor_status.substring(1) + "'></div>" +
            "</div>";

    //所有link,flash,music的悬浮小提示
    //KE.Tips = {};

    var SOURCE_MODE, WYSIWYG_MODE;
    SOURCE_MODE = KE.SOURCE_MODE = 0;
    WYSIWYG_MODE = KE.WYSIWYG_MODE = 1;
    KE["SOURCE_MODE"] = SOURCE_MODE;
    KE["WYSIWYG_MODE"] = WYSIWYG_MODE;

    S.augment(KE, {
        /**
         *
         * @param textarea
         */
        init:function (textarea) {
            var self = this, editorWrap;
            /**
             * 内部存储声明
             */
            self.__commands = {};
            self.__dialogs = {};
            self.__plugins = {};

            if (IS_IE) {
                DOM.addClass(DOC.body, "ke-ie" + IS_IE);
            }
            if (UA['trident']) {
                DOM.addClass(DOC.body, "ke-trident" + UA.trident);
            }
            else if (UA['gecko']) {
                DOM.addClass(DOC.body, "ke-gecko");
            }
            else if (UA['webkit']) {
                DOM.addClass(DOC.body, "ke-webkit");
            }
            editorWrap = new Node(editorHtml);

            self.editorWrap = editorWrap;
            self._UUID = INSTANCE_ID++;
            //实例集中管理
            focusManager.register(self);
            self.wrap = editorWrap.one(ke_textarea_wrap);
            self.iframe = self.wrap.one("iframe");
            self.toolBarDiv = editorWrap.one(ke_editor_tools);
            self.textarea = textarea;
            self.statusDiv = editorWrap.one(ke_editor_status);

            //标准浏览器编辑器内焦点不失去,firefox?
            //标准浏览器实际上不需要！range在iframe内保存着呢，选择高亮变灰而已
            //2011-11-19 启用封装 preventFocus
            //点击工具栏内任何东西都不会使得焦点转移
            Utils.preventFocus(self.toolBarDiv);

            /*
             if (IS_IE) {
             //ie 点击按钮不丢失焦点
             self.toolBarDiv._4e_unselectable();
             } else {
             self.toolBarDiv.on("mousedown", function(ev) {
             if (UA['webkit']) {
             //chrome select 弹不出来
             var n = DOM._4e_name(ev.target);
             if (n == "select" || n == "option")return TRUE;
             }
             ev.halt();
             });
             }

             //由于上面的 mousedown 阻止，这里使得 textarea 上的事件不被阻止，可以被编辑 - firefox
             //2010-11-19 注册到工具栏就可以了
             textarea.on("mousedown", function(ev) {
             ev.stopPropagation();
             });
             */


            var tw = textarea._4e_style(WIDTH),
                th = textarea._4e_style(HEIGHT);
            if (tw) {
                editorWrap.css(WIDTH, tw);
                textarea.css(WIDTH, "100%");
            }
            self.textarea.css(DISPLAY, NONE);
            editorWrap.insertAfter(textarea);
            self.wrap[0].appendChild(textarea[0]);

            if (th) {
                self.wrap.css(HEIGHT, th);
                textarea.css(HEIGHT, "100%");
            }

            var iframe = self.iframe;

            if (textarea._4e_hasAttribute("tabindex")) {
                iframe[0].tabIndex = UA['webkit'] ? -1 : textarea[0].tabIndex;
            }

            self.on("dataReady", function () {
                self._ready = TRUE;
                KE.fire("instanceCreated", {editor:self});
            });
            // With FF, it's better to load the data on iframe.load. (#3894,#4058)
            if (UA['gecko']) {
                iframe.on('load', self._setUpIFrame, self);
            } else {
                //webkit(chrome) load等不来！
                self._setUpIFrame();
            }
            if (self.cfg['attachForm'] && textarea[0].form)
                self._attachForm();
        },

        destroy:function () {
            if (this.__destroyed) {
                return;
            }
            var self = this,
                editorWrap = self.editorWrap,
                textarea = self.textarea,
                doc = self.document,
                win = self.iframe[0].contentWindow;
            self.sync();
            KE.focusManager.remove(self);
            Event.remove(doc);
            Event.remove(doc.documentElement);
            Event.remove(doc.body);
            Event.remove(win);
            self.iframe.detach();
            var plugins = self.__plugins;
            //清除插件
            for (var i in plugins) {
                if (plugins.hasOwnProperty(i)) {
                    var p = plugins[i];
                    if (p.destroy) {
                        p.destroy();
                    }
                }
            }
            //其他可能处理
            self.fire("destroy");
            textarea.insertBefore(editorWrap);

            editorWrap.remove();

            textarea.css({
                width:editorWrap[0].style.width,
                height:self.wrap.css("height")
            });
            textarea.show();
            self.__commands = self.__dialogs = self.__plugins = null;
            self.detach();
            self.__destroyed = true;
        },
        /**
         *
         */
        _attachForm:function () {
            var self = this,
                textarea = self.textarea,
                form = new Node(textarea[0].form);
            form.on("submit", self.sync, self);
            self.on("destroy", function () {
                form.detach("submit", self.sync, self);
            });
        },
        /**
         *
         * @param name {string}
         * @param callback {function(Object)}
         */
        useDialog:function (name, callback) {
            var self = this,
                Overlay = KE.Overlay;
            Overlay && Overlay.loading();
            self.use(name, function () {
                var dialog = self.getDialog(name);
                /**
                 * 可能窗口在等待其他模块载入，不能立即获取
                 */
                if (!dialog) {
                    S.later(arguments.callee, 50, false, self);
                    return;
                }
                callback(dialog);
                Overlay && Overlay.unloading();
            });
        },

        showDialog:function (name, args, fn) {
            var self = this;
            args = args || [];
            self.useDialog(name, function (dialog) {
                dialog.show.apply(dialog, args);
                fn && fn(dialog);
                self.fire("dialogShow", {
                    dialog:dialog.dialog,
                    pluginDialog:dialog,
                    dialogName:name
                });
            });
        },
        /**
         *
         * @param name {string}
         * @param obj {Object}
         */
        addDialog:function (name, obj) {
            this.__dialogs[name] = obj;
        },
        /**
         *
         * @param name {string}
         */
        getDialog:function (name) {
            return this.__dialogs[name];
        },
        destroyDialog:function (name) {
            var d = this.__dialogs[name];
            d && d.destroy();
            this.__dialogs[name] = null;
        },
        /**
         *
         * @param name {string}
         * @param obj {Object}
         */
        addCommand:function (name, obj) {
            this.__commands[name] = obj;
        },
        /**
         *
         * @param name {string}
         */
        hasCommand:function (name) {
            return this.__commands[name];
        },
        /**
         *
         * @param name {string}
         */
        execCommand:function (name) {
            var self = this,
                cmd = self.__commands[name],
                args = S.makeArray(arguments);
            args.shift();
            args.unshift(self);
            return cmd.exec.apply(cmd, args);
        },
        /**
         *
         * @return {number}
         */
        getMode:function () {
            return this.textarea.css("display") == "none" ?
                WYSIWYG_MODE :
                SOURCE_MODE;
        },
        /**
         *
         * @param [format] {boolean}
         */
        getData:function (format) {
            var self = this,
                html;
            if (self.getMode() == WYSIWYG_MODE) {
                if (self.document && self.document.body)
                    html = self.document.body.innerHTML;
                else
                    html = "";
            } else {
                //代码模式下不需过滤
                html = self.textarea.val();
            }
            //如果不需要要格式化，例如提交数据给服务器
            if (self["htmlDataProcessor"]) {
                if (format) {
                    html = self["htmlDataProcessor"]["toHtml"](html, "p");
                } else {
                    html = self["htmlDataProcessor"]["toServer"](html, "p");
                }
            }
            html = S.trim(html);
            /*
             如果内容为空，对 parser 自动加的空行滤掉
             */
            if (/^<p>((&nbsp;)|\s)*<\/p>$/.test(html)) html = "";
            return html;
        },

        /**
         *
         * @param data {string}
         */
        setData:function (data) {

            var self = this,
                afterData = data;

            if (self["htmlDataProcessor"])
                afterData = self["htmlDataProcessor"]["toDataFormat"](data, "p");

            self.document.body.innerHTML = afterData;
            // 空值时需要设两次 firefox??
            if (!afterData) {
                self.document.body.innerHTML = afterData;
            }
            if (self.getMode() == WYSIWYG_MODE) {
            } else {
                //代码模式下不需过滤
                self.textarea.val(data);
            }
        },
        /**
         *
         */
        sync:function () {
            this.textarea.val(this.getData());
        },

        /**
         * 撤销重做时，不需要格式化代码，直接取自身
         */
        _getRawData:function () {
            return this.document.body.innerHTML;
        },


        /**
         * 撤销重做时，不需要格式化代码，直接取自身
         *
         * @param data {string}
         */
        _setRawData:function (data) {
            this.document.body.innerHTML = data;
        },

        _prepareIFrameHtml:function (id) {
            var cfg = this.cfg;
            return prepareIFrameHtml(id, cfg.customStyle, cfg.customLink);
        },

        getSelection:function () {
            return KE.Selection.getSelection(this.document);
        },

        focus:function () {
            var self = this,
                doc = self.document,
                win = DOM._4e_getWin(doc);
            // firefox7 need this
            if (!UA['ie']) {
                // note : 2011-11-17 report by 石霸
                // ie 的 parent 不能 focus ，否则会使得 iframe 内的编辑器光标回到开头
                win && win.parent && win.parent.focus();
            }
            // yiminghe note:webkit need win.focus
            // firefox 7 needs also?
            win && win.focus();
            //ie and firefox need body focus
            doc && doc.body.focus();
            self.notifySelectionChange();
        },

        blur:function () {
            var self = this,
                win = DOM._4e_getWin(self.document);
            win.blur();
            self.document && self.document.body.blur();
        },

        /**
         * @param cssText {string}
         */
        addCustomStyle:function (cssText) {
            var self = this,
                cfg = self.cfg,
                doc = self.document;
            cfg.customStyle = cfg.customStyle || "";
            cfg.customStyle += "\n" + cssText;

            var elem = doc.createElement("style");
            // 先添加到 DOM 树中，再给 cssText 赋值，否则 css hack 会失效
            doc.getElementsByTagName("head")[0].appendChild(elem);
            if (elem.styleSheet) { // IE
                elem.styleSheet.cssText = cssText;
            } else { // W3C
                elem.appendChild(doc.createTextNode(cssText));
            }
        },

        addCustomLink:function (link) {
            var self = this,
                cfg = self.cfg,
                doc = self.document;
            cfg.customLink = cfg.customLink || [];
            cfg.customLink.push(link);
            var elem = doc.createElement("link");
            elem.rel = "stylesheet";
            doc.getElementsByTagName("head")[0].appendChild(elem);
            elem.href = link;
        },

        removeCustomLink:function (link) {
            var self = this,
                cfg = self.cfg,
                doc = self.document;
            var links = S.makeArray(doc.getElementsByTagName("link"));
            for (var i = 0; i < links.length; i++) {
                if (links[i].href == link) {
                    DOM._4e_remove(links[i]);
                }
            }
            cfg.customLink = cfg.customLink || [];
            var cls = cfg.customLink;
            var ind = S.indexOf(link, cls);
            if (ind != -1) {
                cls.splice(ind, 1);
            }
        },
        /**
         *
         */
        _setUpIFrame:function () {
            var self = this,
                iframe = self.iframe,
                //KES = KE.SELECTION,
                //textarea = self.textarea[0],
                //cfg = self.cfg,
                data = self._prepareIFrameHtml(self._UUID),
                win = iframe[0].contentWindow, doc;

            try {
                // In IE, with custom document.domain, it may happen that
                // the iframe is not yet available, resulting in "Access
                // Denied" for the following property access.
                //ie 设置domain 有问题：yui也有
                //http://yuilibrary.com/projects/yui2/ticket/2052000
                //http://waelchatila.com/2007/10/31/1193851500000.html
                //http://nagoon97.wordpress.com/tag/designmode/
                doc = win.document;
            } catch (e) {
                // Trick to solve this issue, forcing the iframe to get ready
                // by simply setting its "src" property.
                //noinspection SillyAssignmentJS
                iframe[0].src = iframe[0].src;
                // In IE6 though, the above is not enough, so we must pause the
                // execution for a while, giving it time to think.
                if (IS_IE < 7) {
                    setTimeout(run, 10);
                    return;
                }
            }
            run();
            function run() {
                doc = win.document;
                self.document = doc;
                iframe.detach();
                // Don't leave any history log in IE. (#5657)
                doc.open("text/html", "replace");
                doc.write(data);
                doc.close();
            }
        },
        ready:function (func) {
            var self = this;
            if (self._ready)func();
            else {
                self.on("dataReady", func);
            }
        },
        addPlugin:function (name, func, cfg) {
            var self = this;
            self.__plugins = self.__plugins;
            cfg = cfg || {};
            cfg.func = func;
            self.__plugins[name] = cfg;
        },
        usePlugin:function (name) {
            var plugin = this.__plugins[name];
            //只 use 一次
            if (!plugin) return;
            if (plugin.status && !plugin.duplicate) return;
            var requires = this['Env']['mods'][name]["requires"] || [];
            for (var i = 0; i < requires.length; i++) {
                this.usePlugin(requires[i]);
            }
            plugin.func.call(plugin);
            plugin.status = 1;
        },
        /**
         *
         */
        _monitor:function () {
            var self = this;
            if (self._monitorId) {
                clearTimeout(self._monitorId);
            }

            self._monitorId = setTimeout(function () {
                var selection = self.getSelection();
                if (selection && !selection.isInvalid) {
                    var startElement = selection.getStartElement(),
                        currentPath = new KE.ElementPath(startElement);
                    if (!self.previousPath || !self.previousPath.compare(currentPath)) {
                        self.previousPath = currentPath;

                        self.fire("selectionChange", { selection:selection, path:currentPath, element:startElement });
                    }
                }
            }, 100);
        },
        /**
         * 强制通知插件更新状态，防止插件修改编辑器内容，自己反而得不到通知
         *
         */
        notifySelectionChange:function () {
            var self = this;
            self.previousPath = NULL;
            //S.log("notifySelectionChange");
            self._monitor();
        },

        /**
         *
         * @param element
         * @param init {function()}
         */
        insertElement:function (element, init, callback) {

            var self = this;

            if (self.getMode() !== WYSIWYG_MODE) {
                return;
            }

            self.focus();

            var clone,
                elementName = element._4e_name(),
                xhtml_dtd = KE.XHTML_DTD,
                KER = KE.RANGE,
                KEN = KE.NODE,
                isBlock = xhtml_dtd.$block[ elementName ],
                selection = self.getSelection(),
                ranges = selection && selection.getRanges(),
                range,
                lastElement,
                current, dtd;
            //give sometime to breath
            if (!ranges
                ||
                ranges.length == 0) {
                var args = arguments, fn = args.callee;
                setTimeout(function () {
                    fn.apply(self, args);
                }, 30);
                return;
            }

            self.fire("save");
            for (var i = ranges.length - 1; i >= 0; i--) {
                range = ranges[ i ];
                // Remove the original contents.
                range.deleteContents();
                clone = !i && element || element._4e_clone(TRUE);
                init && init(clone);
                // If we're inserting a block at dtd-violated position, split
                // the parent blocks until we reach blockLimit.
                if (isBlock) {
                    while (( current = range.getCommonAncestor(FALSE, TRUE) )
                        && ( dtd = xhtml_dtd[ current._4e_name() ] )
                        && !( dtd && dtd [ elementName ] )) {
                        // Split up inline elements.
                        if (current._4e_name() in xhtml_dtd["span"])
                            range.splitElement(current);
                        // If we're in an empty block which indicate a new paragraph,
                        // simply replace it with the inserting block.(#3664)
                        else if (range.checkStartOfBlock()
                            && range.checkEndOfBlock()) {
                            range.setStartBefore(current);
                            range.collapse(TRUE);
                            current._4e_remove();
                        }
                        else {
                            range.splitBlock();
                        }
                    }
                }

                // Insert the new node.
                range.insertNode(clone);
                // Save the last element reference so we can make the
                // selection later.
                if (!lastElement)
                    lastElement = clone;
            }
            if (!lastElement) return;

            var next = lastElement._4e_nextSourceNode(TRUE), p,
                doc = self.document;
            dtd = KE.XHTML_DTD;

            //行内元素不用加换行
            if (!dtd.$inline[clone._4e_name()]) {
                //末尾时 ie 不会自动产生br，手动产生
                if (!next) {
                    p = new Node("<p>&nbsp;</p>", NULL, doc);
                    p.insertAfter(lastElement);
                    next = p;
                }
                //firefox,replace br with p，和编辑器整体换行保持一致
                else if (next._4e_name() == "br"
                    &&
                    //必须符合嵌套规则
                    dtd[next.parent()._4e_name()]["p"]
                    ) {
                    p = new Node("<p>&nbsp;</p>", NULL, doc);
                    next[0].parentNode.replaceChild(p[0], next[0]);
                    next = p;
                }
            } else {
                //qc #3803 ，插入行内后给个位置放置光标
                next = new Node(doc.createTextNode(" "));
                next.insertAfter(lastElement);
            }
            range.moveToPosition(lastElement, KER.POSITION_AFTER_END);
            if (next && next[0].nodeType == KEN.NODE_ELEMENT)
                range.moveToElementEditablePosition(next);

            selection.selectRanges([ range ]);
            self.focus();
            //http://code.google.com/p/kissy/issues/detail?can=1&start=100&id=121
            clone && clone._4e_scrollIntoView();
            self._saveLater();
            callback && callback(clone);
        },

        /**
         *
         * @param data {string}
         * @param dataFilter 是否采用特定的 dataFilter
         */
        insertHtml:function (data, dataFilter) {
            var self = this;
            if (self.getMode() !== WYSIWYG_MODE) {
                return;
            }

            if (self["htmlDataProcessor"]) {
                data = self["htmlDataProcessor"]["toDataFormat"](data, null, dataFilter);//, "p");
            }

            self.focus();
            self.fire("save");

            var editorDoc = self.document,
                saveInterval = 0;
            // ie9 仍然需要这样！
            // ie9 标准 selection 有问题，连续插入不能定位光标到插入内容后面
            if (IS_IE) {
                var $sel = editorDoc.selection;
                if ($sel.type == 'Control') {
                    $sel.clear();
                }
                try {
                    $sel.createRange().pasteHTML(data);
                } catch (e) {
                    S.log("insertHtml error in ie");
                }
            } else {
                // ie9 仍然没有
                // 1.webkit insert html 有问题！会把标签去掉，算了直接用 insertElement.
                // 10.0 修复？？
                // firefox 初始编辑器无焦点报异常
                try {
                    editorDoc.execCommand('inserthtml', FALSE, data);
                } catch (e) {
                    setTimeout(function () {
                        // still not ok in ff!
                        // 手动选择 body 的第一个节点
                        if (self.getSelection().getRanges().length == 0) {
                            var r = new KE.Range(editorDoc);
                            var node = DOM._4e_first(editorDoc.body, function (el) {
                                return el[0].nodeType == 1 && el._4e_name() != "br";
                            });
                            if (!node) {
                                node = new Node(editorDoc.createElement("p"));
                                editorDoc.body.appendChild(node[0]);
                            }
                            r.setStartAt(node, KE.RANGE.POSITION_AFTER_START);
                            r.select();
                        }
                        editorDoc.execCommand('inserthtml', FALSE, data);
                    }, saveInterval = 100);
                }
            }
            // bug by zjw2004112@163.com :
            // 有的浏览器 ： chrome , ie67 貌似不会自动滚动到粘贴后的位置
            setTimeout(function () {
                self.getSelection().scrollIntoView();
            }, saveInterval);
            self._saveLater(saveInterval);
        },

        _saveLater:function (saveInterval) {
            var self = this;
            if (self.__saveTimer) {
                clearTimeout(self.__saveTimer);
                self.__saveTimer = null;
            }
            self.__saveTimer = setTimeout(function () {
                self.fire("save");
            }, saveInterval || 0);
        }
    });
    /**
     * 初始化iframe内容以及浏览器间兼容性处理，
     * 必须等待iframe内的脚本向父窗口通知
     *
     * @param id {string}
     */
    KE["_initIFrame"] = function (id) {

        var self = focusManager.getInstance(id),
            iframe = self.iframe,
            textarea = self.textarea[0],
            win = iframe[0].contentWindow,
            doc = self.document,
            cfg = self.cfg,
            // Remove bootstrap script from the DOM.
            script = doc.getElementById("ke_actscript");
        DOM._4e_remove(script);

        var body = doc.body;

        /**
         * from kissy editor 1.0
         *
         * // 注1：在 tinymce 里，designMode = "on" 放在 try catch 里。
         //     原因是在 firefox 下，当iframe 在 display: none 的容器里，会导致错误。
         //     但经过我测试，firefox 3+ 以上已无此现象。
         // 注2： ie 用 contentEditable = true.
         //     原因是在 ie 下，IE needs to use contentEditable or
         // it will display non secure items for HTTPS
         // Ref:
         //   - Differences between designMode and contentEditable
         //     http://74.125.153.132/search?q=cache:5LveNs1yHyMJ:nagoon97.wordpress.com/2008/04/20/differences-between-designmode-and-contenteditable/+ie+contentEditable+designMode+different&cd=6&hl=en&ct=clnk
         */

        //这里对主流浏览器全部使用 contenteditable
        //那么不同于 kissy editor 1.0
        //在body范围外右键，不会出现 复制，粘贴等菜单
        //因为这时右键作用在document而不是body
        //1.0 document.designMode='on' 是编辑模式
        //2.0 body.contentEditable=true body外不是编辑模式
        if (IS_IE) {
            // Don't display the focus border.
            body['hideFocus'] = TRUE;
            // Disable and re-enable the body to avoid IE from
            // taking the editing focus at startup. (#141 / #523)
            body.disabled = TRUE;
            body['contentEditable'] = TRUE;
            body.removeAttribute('disabled');
        } else {
            // Avoid opening design mode in a frame window thread,
            // which will cause host page scrolling.(#4397)
            setTimeout(function () {
                // Prefer 'contentEditable' instead of 'designMode'. (#3593)
                if (UA['gecko'] || UA['opera']) {
                    body['contentEditable'] = TRUE;
                }
                else if (UA['webkit'])
                    body.parentNode['contentEditable'] = TRUE;
                else
                    doc['designMode'] = 'on';
            }, 0);
        }

        // Gecko need a key event to 'wake up' the editing
        // ability when document is empty.(#3864)
        //activateEditing 删掉，初始引起屏幕滚动了


        // Webkit: avoid from editing form control elements content.
        if (UA['webkit']) {
            Event.on(doc, "click", function (ev) {
                var control = new Node(ev.target);
                if (S.inArray(control._4e_name(), ['input', 'select'])) {
                    ev.preventDefault();
                }
            });
            // Prevent from editig textfield/textarea value.
            Event.on(doc, "mouseup", function (ev) {
                var control = new Node(ev.target);
                if (S.inArray(control._4e_name(), ['input', 'textarea'])) {
                    ev.preventDefault();
                }
            });
        }

        function blinkCursor(retry) {
            tryThese(
                function () {
                    doc['designMode'] = 'on';
                    //异步引起时序问题，尽可能小间隔
                    setTimeout(function () {
                        doc['designMode'] = 'off';

                        body.focus();
                        // Try it again once..
                        if (!arguments.callee.retry) {
                            arguments.callee.retry = TRUE;
                            //arguments.callee();
                        }
                    }, 50);
                },
                function () {
                    // The above call is known to fail when parent DOM
                    // tree layout changes may break design mode. (#5782)
                    // Refresh the 'contentEditable' is a cue to this.
                    doc['designMode'] = 'off';

                    DOM.attr(body, 'contentEditable', FALSE);
                    DOM.attr(body, 'contentEditable', TRUE);
                    // Try it again once..
                    !retry && blinkCursor(1);

                });
        }

        // Create an invisible element to grab focus.
        if (UA['gecko'] || IS_IE || UA['opera']) {
            var focusGrabber;
            focusGrabber = new Node(
                // Use 'span' instead of anything else to fly under the screen-reader radar. (#5049)
                '<span ' +
                    'tabindex="-1" ' +
                    'style="position:absolute; left:-10000"' +
                    ' role="presentation"' +
                    '></span>').insertAfter(textarea);
            focusGrabber.on('focus', function () {
                self.focus();
            });
            self.activateGecko = function () {
                if (UA['gecko'] && self.iframeFocus)
                    focusGrabber[0].focus();
            };
            self.on('destroy', function () {
                focusGrabber.detach();
                focusGrabber.remove();
            });
        }

        // IE standard compliant in editing frame doesn't focus the editor when
        // clicking outside actual content, manually apply the focus. (#1659)

        if (
        // ie6,7 点击滚动条失效
        // IS_IE
        // && doc.compatMode == 'CSS1Compat'
        // wierd ,sometimes ie9 break
        // ||
        // 2012-01-11 ie 处理装移到 selection.js :
        // IE has an issue where you can't select/move the caret by clicking outside the body if the document is in standards mode
        // doc['documentMode']
            UA['gecko']
                || UA['opera']) {
            var htmlElement = doc.documentElement;
            Event.on(htmlElement, 'mousedown', function (evt) {
                // Setting focus directly on editor doesn't work, we
                // have to use here a temporary element to 'redirect'
                // the focus.
                // firefox 不能直接设置，需要先失去焦点
                // return;
                // 左键激活
                var t = evt.target;
                if (t == htmlElement) {
                    //S.log("click");
                    //self.focus();
                    //return;
                    if (UA['gecko'])
                        blinkCursor(FALSE);
                    //setTimeout(function() {
                    //这种：html mousedown -> body beforedeactivate
                    //    self.focus();
                    //}, 30);
                    //这种：body beforedeactivate -> html mousedown
                    focusGrabber[0].focus();
                }
            });
        }

        Event.on(win, 'focus', function () {

            /**
             * yiminghe特别注意：firefox光标丢失bug
             * blink后光标出现在最后，这就需要实现保存range
             * focus后再恢复range
             */
            if (UA['gecko'])
                blinkCursor(FALSE);
            else if (UA['opera'])
                body.focus();

            // focus 后强制刷新自己状态
            self.notifySelectionChange();
        });


        if (UA['gecko']) {
            /**
             * firefox 焦点丢失后，再点编辑器区域焦点会移不过来，要点两下
             */
            Event.on(self.document, "mousedown", function () {
                if (!self.iframeFocus) {

                    blinkCursor(FALSE);
                }
            });
        }

        if (IS_IE) {
            //DOM.addClass(doc.documentElement, doc.compatMode);
            // Override keystrokes which should have deletion behavior
            //  on control types in IE . (#4047)
            /**
             * 选择img，出现缩放框后不能直接删除
             */
            Event.on(doc, 'keydown', function (evt) {
                var keyCode = evt.keyCode;
                // Backspace OR Delete.
                if (keyCode in { 8:1, 46:1 }) {
                    //debugger
                    var sel = self.getSelection(),
                        control = sel.getSelectedElement();
                    if (control) {
                        // Make undo snapshot.
                        self.fire('save');
                        // Delete any element that 'hasLayout' (e.g. hr,table) in IE8 will
                        // break up the selection, safely manage it here. (#4795)
                        var bookmark = sel.getRanges()[ 0 ].createBookmark();
                        // Remove the control manually.
                        control._4e_remove();
                        sel.selectBookmarks([ bookmark ]);
                        self.fire('save');
                        evt.preventDefault();
                    }
                }
            });

            // PageUp/PageDown scrolling is broken in document
            // with standard doctype, manually fix it. (#4736)
            // ie8 主窗口滚动？？
            if (doc.compatMode == 'CSS1Compat') {
                var pageUpDownKeys = { 33:1, 34:1 };
                Event.on(doc, 'keydown', function (evt) {
                    if (evt.keyCode in pageUpDownKeys) {
                        setTimeout(function () {
                            self.getSelection().scrollIntoView();
                        }, 0);
                    }
                });
            }
        }

        // Adds the document body as a context menu target.

        setTimeout(function () {
            /*
             * IE BUG: IE might have rendered the iframe with invisible contents.
             * (#3623). Push some inconsequential CSS style changes to force IE to
             * refresh it.
             *
             * Also, for some unknown reasons, short timeouts (e.g. 100ms) do not
             * fix the problem. :(
             */
            if (IS_IE) {
                setTimeout(function () {
                    if (doc) {
                        body.runtimeStyle['marginBottom'] = '0px';
                        body.runtimeStyle['marginBottom'] = '';
                    }
                }, 1000);
            }
        }, 0);


        setTimeout(function () {
            self.fire("dataReady");
            /*
             some break for firefox ，不能立即设置
             */
            var disableObjectResizing = cfg['disableObjectResizing'],
                disableInlineTableEditing = cfg['disableInlineTableEditing'];
            if (disableObjectResizing || disableInlineTableEditing) {
                // IE, Opera and Safari may not support it and throw errors.
                try {
                    doc.execCommand('enableObjectResizing', FALSE, !disableObjectResizing);
                    doc.execCommand('enableInlineTableEditing', FALSE, !disableInlineTableEditing);
                }
                catch (e) {
                    // 只能ie能用？，目前只有 firefox,ie 支持图片缩放
                    // For browsers which don't support the above methods,
                    // we can use the the resize event or resizestart for IE (#4208)
                    Event.on(body, IS_IE ? 'resizestart' : 'resize', function (evt) {
                        var t = new Node(evt.target);
                        if (
                            disableObjectResizing ||
                                (
                                    t._4e_name() === 'table'
                                        &&
                                        disableInlineTableEditing )
                            )
                            evt.preventDefault();
                    });
                }
            }
        }, 10);


        // Gecko/Webkit need some help when selecting control type elements. (#3448)
        //if (!( IS_IE || UA['opera'])) {
        if (UA['webkit']) {
            Event.on(doc, "mousedown", function (ev) {
                var control = new Node(ev.target);
                if (S.inArray(control._4e_name(), ['img', 'hr', 'input', 'textarea', 'select'])) {
                    self.getSelection().selectElement(control);
                }
            });
        }


        if (UA['gecko']) {
            Event.on(doc, "dragstart", function (ev) {
                var control = new Node(ev.target);
                if (control._4e_name() === 'img' &&
                    /ke_/.test(control[0].className)
                    ) {
                    //firefox禁止拖放
                    ev.preventDefault();
                }
            });
        }

        //注意：必须放在这个位置，等iframe加载好再开始运行
        //加入焦点管理，和其他实例联系起来
        focusManager.add(self);
    };

    // Fixing Firefox 'Back-Forward Cache' break design mode. (#4514)
    //不知道为什么
    /*
     if (UA['gecko']) {
     ( function () {
     var body = document.body;
     if (!body)
     window.addEventListener('load', arguments.callee, false);
     else {
     var currentHandler = body.getAttribute('onpageshow');
     body.setAttribute('onpageshow', ( currentHandler ? currentHandler + ';' : '') +
     'event.persisted && KISSY.Editor.focusManager.refreshAll();');
     }
     } )();
     }
     */


    /**
     * patch for browser mode = ie7 ,document mode=ie8/9 : 条件注释导致mhtml 引入但是不能处理
     */
    if (DOC['documentMode'] > 7) {
        (function () {
            var links = S.all("link");
            for (var i = 0; i < links.length; i++) {
                var link = new Node(links[i]), href = link.attr("href");
                if (href.indexOf("editor-pkg-min-mhtml.css") != -1) {
                    link.attr("href", href.replace(/editor-pkg-min-mhtml\.css/g,
                        "editor-pkg-min-datauri.css"));
                }
            }
        })();
    }


    if (1 > 2) {
        S.removeCustomLink().addCustomLink();
    }
});/**
 * 集中管理各个z-index
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("zindex", function() {
    var S = KISSY,KE = S.Editor;

    if (KE.zIndexManager) return;

    /**
     * z-index manager
     *@enum {number}
     */
    KE.zIndexManager = {
        BUBBLE_VIEW:(1100),
        POPUP_MENU:(1200),
        //拖动垫片要最最高
        DD_PG: (99999),
        // flash 存储设置最高
        STORE_FLASH_SHOW:(99999),
        MAXIMIZE:(900),
        OVERLAY:(9999),
        LOADING:(11000),
        LOADING_CANCEL:12000,
        SELECT:(1200)
    };


    /**
     * 获得全局最大值
     */
    KE.baseZIndex = function(z) {
        return (KE['Config'].baseZIndex || 10000) + z;
    };

    KE["baseZIndex"] = KE.baseZIndex;
    KE["zIndexManager"] = KE.zIndexManager;
});/**
 * modified from ckeditor ,xhtml1.1 transitional dtd translation
 * @author <yiminghe@gmail.com>
 */
/*
 Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.html or http://ckeditor.com/license
 */
KISSY.Editor.add("dtd", function(KE) {
    /**
     * Holds and object representation of the HTML DTD to be used by the editor in
     * its internal operations.
     *
     * Each element in the DTD is represented by a
     * property in this object. Each property contains the list of elements that
     * can be contained by the element. Text is represented by the "#" property.
     *
     * Several special grouping properties are also available. Their names start
     * with the "$" character.
     * @namespace
     * @example
     * // Check if "div" can be contained in a "p" element.
     * alert( !!dtd[ 'p' ][ 'div' ] );  "false"
     * @example
     * // Check if "p" can be contained in a "div" element.
     * alert( !!dtd[ 'div' ][ 'p' ] );  "true"
     * @example
     * // Check if "p" is a block element.
     * alert( !!dtd.$block[ 'p' ] );  "true"
     */
    KE.XHTML_DTD = (function() {
        /**
         *
         * @param {...Object} r
         */
        function X() {
            var r=arguments[0],
                i = arguments.length - 1;
            while (i > 0) {
                KISSY.mix(r, arguments[i--]);
            }
            return r;
        }

        var A = {"isindex":1,"fieldset":1},
            B = {"input":1,"button":1,"select":1,"textarea":1,"label":1},
            C = X({"a":1}, B),
            D = X({"iframe":1}, C),
            E = {"hr":1,"ul":1,"menu":1,"div":1,
                "blockquote":1,"noscript":1,"table":1,
                "center":1,"address":1,"dir":1,"pre":1,"h5":1,
                "dl":1,"h4":1,"noframes":1,"h6":1,
                "ol":1,"h1":1,"h3":1,"h2":1},
            F = {"ins":1,"del":1,"script":1,"style":1},
            G = X({"b":1,"acronym":1,"bdo":1,'var':1,'#':1,
                "abbr":1,"code":1,
                "br":1,"i":1,"cite":1,
                "kbd":1,
                "u":1,
                "strike":1,
                "s":1,
                "tt":1,
                "strong":1,
                "q":1,
                "samp":1,
                "em":1,
                "dfn":1,
                "span":1}, F),
            H = X({"sub":1,
                "img":1,
                "object":1,
                "sup":1,
                "basefont":1,
                "map":1,
                "applet":1,
                "font":1,
                "big":1,
                "small":1
            }, G),
            I = X({"p":1}, H),
            J = X({"iframe":1}, H, B),
            K = {"img":1,"noscript":1,"br":1,"kbd":1,"center":1,"button":1,
                "basefont":1,"h5":1,"h4":1,"samp":1,"h6":1,"ol":1,
                "h1":1,"h3":1,"h2":1,
                "form":1,
                "font":1,
                '#':1,
                "select":1,
                "menu":1,
                "ins":1,
                "abbr":1,
                "label":1,
                "code":1,
                "table":1,
                "script":1,"cite":1,"input":1,"iframe":1,"strong":1,"textarea":1,"noframes":1,"big":1,"small":1,"span":1,"hr":1,"sub":1,"bdo":1,
                'var':1,"div":1,"object":1,"sup":1,"strike":1,"dir":1,"map":1,"dl":1,"applet":1,"del":1,"isindex":1,"fieldset":1,"ul":1,"b":1,"acronym":1,"a":1,"blockquote":1,"i":1,"u":1,"s":1,"tt":1,"address":1,"q":1,"pre":1,"p":1,"em":1,"dfn":1},

            L = X({"a":1}, J),
            M = {"tr":1},
            N = {'#':1},
            O = X({"param":1}, K),
            P = X({"form":1}, A, D, E, I),
            Q = {"li":1},
            R = {"style":1,"script":1},
            S = {"base":1,"link":1,"meta":1,"title":1},
            T = X(S, R),
            U = {"head":1,"body":1},
            V = {"html":1};

        var block = {"address":1,"blockquote":1,"center":1,"dir":1,"div":1,"dl":1,"fieldset":1,"form":1,"h1":1,"h2":1,"h3":1,"h4":1,"h5":1,"h6":1,"hr":1,"isindex":1,"menu":1,"noframes":1,"ol":1,"p":1,"pre":1,"table":1,"ul":1};

        return  {

            // The "$" items have been added manually.

            // List of elements living outside body.
            $nonBodyContent: X(V, U, S),

            /**
             * List of block elements, like "p" or "div".
             * @type {Object}
             * @example
             */
            $block : block,

            /**
             * List of block limit elements.
             * @type {Object}
             * @example
             */
            $blockLimit : {"body":1,"div":1,"td":1,"th":1,"caption":1,"form":1 },

            $inline : L,    // Just like span.

            $body : X({"script":1,"style":1}, block),

            $cdata : {"script":1,"style":1},

            /**
             * List of empty (self-closing) elements, like "br" or "img".
             * @type {Object}
             * @example
             */
            $empty : {"area":1,"base":1,"br":1,"col":1,"hr":1,"img":1,"input":1,"link":1,"meta":1,"param":1,"bgsound":1},

            /**
             * List of list item elements, like "li" or "dd".
             * @type {Object}
             * @example
             */
            $listItem : {"dd":1,"dt":1,"li":1},

            /**
             * List of list root elements.
             * @type {Object}
             * @example
             */
            $list: {"ul":1,"ol":1,"dl":1},

            /**
             * Elements that accept text nodes, but are not possible to edit into
             * the browser.
             * @type {Object}
             * @example
             */
            $nonEditable : {"applet":1,"button":1,"embed":1,"iframe":1,"map":1,"object":1,"option":1,"script":1,"textarea":1,"param":1},

            /**
             * List of elements that can be ignored if empty, like "b" or "span".
             * @type {Object}
             * @example
             */
            $removeEmpty : {"abbr":1,"acronym":1,"address":1,"b":1,"bdo":1,"big":1,"cite":1,"code":1,"del":1,"dfn":1,"em":1,"font":1,"i":1,"ins":1,"label":1,"kbd":1,"q":1,"s":1,"samp":1,"small":1,"span":1,"strike":1,"strong":1,"sub":1,"sup":1,"tt":1,"u":1,'var':1},

            /**
             * List of elements that have tabindex set to zero by default.
             * @type {Object}
             * @example
             */
            $tabIndex : {"a":1,"area":1,"button":1,"input":1,"object":1,"select":1,"textarea":1},

            /**
             * List of elements used inside the "table" element, like "tbody" or "td".
             * @type {Object}
             * @example
             */
            $tableContent : {"caption":1,"col":1,"colgroup":1,
                "tbody":1,"td":1,"tfoot":1,"th":1,"thead":1,"tr":1},
            "html": U,
            "head": T,
            "style": N,
            "body": P,
            "base": {},
            "link": {},
            "meta": {},
            "title": N,
            "col": {},
            "tr": {"td":1,"th":1},
            "img": {},
            "colgroup": {"col":1},
            "noscript": P,
            "td": P,
            "br": {},
            "th": P,
            "center": P,
            "kbd": L,
            "button": X(I, E),
            "basefont": {},
            "h5": L,
            "h4": L,
            "samp": L,
            "h6": L,
            "ol": Q,
            "h1": L,
            "h3": L,
            "option": N,
            "h2": L,
            "form" : X(A, D, E, I),
            "select" : {"optgroup":1,"option":1},
            "font" : L,
            "ins": L,
            "menu" : Q,
            "abbr": L,
            "label": L,
            "table": {"thead":1,"col":1,"tbody":1,"tr":1,"colgroup":1,"caption":1,"tfoot":1},
            "code": L,
            "script": N,
            "tfoot": M,
            "cite": L,
            "li": P,
            "input": {},
            "iframe": P,
            "strong": L,
            "textarea": N,
            "noframes": P,
            "big": L,
            "small": L,
            "span": L,
            "hr": {},
            "dt": L,
            "sub": L,
            "optgroup": {"option":1},
            "param": {},
            "bdo": L,
            'var' : L,
            "div": P,
            "object": O,
            "sup": L,
            "dd": P,
            "strike": L,
            "area": {},
            "dir": Q,
            "map": X({"area":1,"form":1,"p":1}, A, F, E),
            "applet": O,
            "dl": {"dt":1,"dd":1},
            "del": L,
            "isindex": {},
            "fieldset": X({
                legend:1
            }, K),
            "thead": M,
            "ul": Q,
            "acronym": L,
            "b": L,
            "a": J,
            "blockquote": P,
            "caption": L,
            "i": L,
            "u": L,
            "tbody": M,
            "s": L,
            "address": X(D, I),
            "tt": L,
            "legend": L,
            "q": L,
            "pre": X(G, C),
            "p": L,
            "em": L,
            "dfn": L
        };
    })();
    KE["XHTML_DTD"] = KE.XHTML_DTD;
});
/**
 * modified from ckeditor ,elementpath represents element's tree path from body
 * @author <yiminghe@gmail.com>
 */
/*
 Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.html or http://ckeditor.com/license
 */
KISSY.Editor.add("elementpath", function(KE) {
    var S = KISSY,
        DOM = S.DOM,
        dtd = KE.XHTML_DTD,
        KEN = KE.NODE,
        TRUE = true,
        FALSE = false,
        NULL = null,
        // Elements that may be considered the "Block boundary" in an element path.
        pathBlockElements = {
            "address":1,
            "blockquote":1,
            "dl":1,
            "h1":1,
            "h2":1,
            "h3":1,
            "h4":1,
            "h5":1,
            "h6":1,
            "p":1,
            "pre":1,
            "li":1,
            "dt":1,
            "dd":1
        },
        // Elements that may be considered the "Block limit" in an element path.
        // 特别注意：不带 p 元素
        pathBlockLimitElements = {
            "body":1,
            "div":1,
            "table":1,
            "tbody":1,
            "tr":1,
            "td":1,
            "th":1,
            "caption":1,
            "form":1
        },
        // Check if an element contains any block element.
        checkHasBlock = function(element) {
            element = DOM._4e_unwrap(element);
            var childNodes = element.childNodes;
            for (var i = 0, count = childNodes.length; i < count; i++) {
                var child = childNodes[i];
                if (child.nodeType == KEN.NODE_ELEMENT
                    && dtd.$block[ child.nodeName.toLowerCase() ])
                    return TRUE;
            }
            return FALSE;
        };

    /**
     * @constructor
     * @param lastNode {KISSY.Node}
     */
    function ElementPath(lastNode) {
        var self = this,
            block = NULL,
            blockLimit = NULL,
            elements = [],
            e = lastNode;

        while (e) {
            if (e[0].nodeType == KEN.NODE_ELEMENT) {
                if (!this.lastElement)
                    this.lastElement = e;

                var elementName = e._4e_name();

                if (!blockLimit) {
                    if (!block && pathBlockElements[ elementName ]) {
                        block = e;
                    }
                    if (pathBlockLimitElements[ elementName ]) {
                        // DIV is considered the Block, if no block is available (#525)
                        // and if it doesn't contain other blocks.
                        if (!block && elementName == 'div' && !checkHasBlock(e))
                            block = e;
                        else
                            blockLimit = e;
                    }
                }

                elements.push(e);
                if (elementName == 'body') {
                    break;
                }
            }
            e = e.parent();
        }

        self.block = block;
        self.blockLimit = blockLimit;
        self.elements = elements;
    }

    ElementPath.prototype = {
        /**
         * Compares this element path with another one.
         * @param otherPath ElementPath The elementPath object to be
         * compared with this one.
         * @return {boolean} "TRUE" if the paths are equal, containing the same
         * number of elements and the same elements in the same order.
         */
        compare : function(otherPath) {
            var thisElements = this.elements;
            var otherElements = otherPath && otherPath.elements;

            if (!otherElements || thisElements.length != otherElements.length)
                return FALSE;

            for (var i = 0; i < thisElements.length; i++) {
                if (!DOM._4e_equals(thisElements[ i ], otherElements[ i ]))
                    return FALSE;
            }

            return TRUE;
        },

        contains : function(tagNames) {
            var elements = this.elements;
            for (var i = 0; i < elements.length; i++) {
                if (elements[ i ]._4e_name() in tagNames)
                    return elements[ i ];
            }
            return NULL;
        },
        toString:function() {
            var elements = this.elements,i,elNames = [];
            for (i = 0; i < elements.length; i++) {
                elNames.push(elements[i]._4e_name());
            }
            return elNames.toString();
        }
    };
    KE.ElementPath = ElementPath;
});
/**
 * modified from ckeditor for kissy editor ,walker implementation
 * refer: http://www.w3.org/TR/DOM-Level-2-Traversal-Range/traversal#TreeWalker
 * @author <yiminghe@gmail.com>
 */
/*
 Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.html or http://ckeditor.com/license
 */
KISSY.Editor.add("walker", function (KE) {

    var TRUE = true,
        FALSE = false,
        NULL = null,
        S = KISSY,
        UA = S.UA,
        KEN = KE.NODE,
        DOM = S.DOM,
        dtd = KE.XHTML_DTD,
        Node = S.Node;

    /**
     *
     * @param  {boolean=} rtl
     * @param  {boolean=} breakOnFalse
     *
     */
    function iterate(rtl, breakOnFalse) {
        var self = this;
        // Return NULL if we have reached the end.
        if (this._.end)
            return NULL;

        var node,
            range = self.range,
            guard,
            userGuard = self.guard,
            type = self.type,
            getSourceNodeFn = ( rtl ? '_4e_previousSourceNode' : '_4e_nextSourceNode' );

        // This is the first call. Initialize it.
        if (!self._.start) {
            self._.start = 1;

            // Trim text nodes and optmize the range boundaries. DOM changes
            // may happen at this point.
            range.trim();

            // A collapsed range must return NULL at first call.
            if (range.collapsed) {
                self.end();
                return NULL;
            }
        }

        // Create the LTR guard function, if necessary.
        if (!rtl && !self._.guardLTR) {
            // Gets the node that stops the walker when going LTR.
            var limitLTR = range.endContainer,
                blockerLTR = new Node(limitLTR[0].childNodes[range.endOffset]);
            //从左到右保证在 range 区间内获取 nextSourceNode
            this._.guardLTR = function (node, movingOut) {
                node = DOM._4e_wrap(node);
                //从endContainer移出去，失败返回false
                return (
                    node
                        && node[0]
                        &&
                        (!movingOut
                            ||
                            !DOM._4e_equals(limitLTR, node)
                            )
                        //到达深度遍历的最后一个节点，结束
                        &&

                        (!blockerLTR[0] || !node._4e_equals(blockerLTR))

                        //从body移出也结束
                        && ( node[0].nodeType != KEN.NODE_ELEMENT
                        || !movingOut
                        || node._4e_name() != 'body' )
                    );
            };
        }

        // Create the RTL guard function, if necessary.
        if (rtl && !self._.guardRTL) {
            // Gets the node that stops the walker when going LTR.
            var limitRTL = range.startContainer,
                blockerRTL = ( range.startOffset > 0 ) && new Node(limitRTL[0].childNodes[range.startOffset - 1]);

            self._.guardRTL = function (node, movingOut) {
                node = DOM._4e_wrap(node);
                return (
                    node
                        && node[0]
                        && ( !movingOut || !node._4e_equals(limitRTL)  )
                        && ( !blockerRTL[0] || !node._4e_equals(blockerRTL) )
                        && ( node[0].nodeType != KEN.NODE_ELEMENT || !movingOut || node._4e_name() != 'body' )
                    );
            };
        }

        // Define which guard function to use.
        var stopGuard = rtl ? self._.guardRTL : self._.guardLTR;

        // Make the user defined guard function participate in the process,
        // otherwise simply use the boundary guard.
        if (userGuard) {
            guard = function (node, movingOut) {
                if (stopGuard(node, movingOut) === FALSE)
                    return FALSE;

                return userGuard(node, movingOut);
            };
        }
        else {
            guard = stopGuard;
        }

        if (self.current)
            node = this.current[ getSourceNodeFn ](FALSE, type, guard);
        else {
            // Get the first node to be returned.

            if (rtl) {
                node = range.endContainer;

                if (range.endOffset > 0) {
                    node = new Node(node[0].childNodes[range.endOffset - 1]);
                    if (guard(node) === FALSE)
                        node = NULL;
                }
                else
                    node = ( guard(node, TRUE) === FALSE ) ?
                        NULL : node._4e_previousSourceNode(TRUE, type, guard);
            }
            else {
                node = range.startContainer;
                node = new Node(node[0].childNodes[range.startOffset]);

                if (node && node[0]) {
                    if (guard(node) === FALSE)
                        node = NULL;
                }
                else
                    node = ( guard(range.startContainer, TRUE) === FALSE ) ?
                        NULL : range.startContainer._4e_nextSourceNode(TRUE, type, guard);
            }
        }

        while (node && node[0] && !self._.end) {
            self.current = node;

            if (!self.evaluator || self.evaluator(node) !== FALSE) {
                if (!breakOnFalse)
                    return node;
            }
            else if (breakOnFalse && self.evaluator)
                return FALSE;

            node = node[ getSourceNodeFn ](FALSE, type, guard);
        }

        self.end();
        return self.current = NULL;
    }

    /**
     *
     * @param  {boolean=} rtl
     * @return {(boolean)}
     */
    function iterateToLast(rtl) {
        var node, last = NULL;

        while (( node = iterate.call(this, rtl) ))
            last = node;

        return last;
    }

    /**
     * @constructor
     * @name Walker
     */
    function Walker(range) {
        this.range = range;

        /**
         * A function executed for every matched node, to check whether
         * it's to be considered into the walk or not. If not provided, all
         * matched nodes are considered good.
         * If the function returns "FALSE" the node is ignored.
         * @name CKEDITOR.dom.walker.prototype.evaluator
         * @property
         * @type Function
         */
        // this.evaluator = NULL;

        /**
         * A function executed for every node the walk pass by to check
         * whether the walk is to be finished. It's called when both
         * entering and exiting nodes, as well as for the matched nodes.
         * If this function returns "FALSE", the walking ends and no more
         * nodes are evaluated.
         * @name CKEDITOR.dom.walker.prototype.guard
         * @property
         * @type Function
         */
        // this.guard = NULL;

        /** @private */
        this._ = {};
    }


    S.augment(Walker, {
        /**
         * Stop walking. No more nodes are retrieved if this function gets
         * called.
         */
        end:function () {
            this._.end = 1;
        },

        /**
         * Retrieves the next node (at right).
         * @returns {(boolean)} The next node or NULL if no more
         *        nodes are available.
         */
        next:function () {
            return iterate.call(this);
        },

        /**
         * Retrieves the previous node (at left).
         * @returns {(boolean)} The previous node or NULL if no more
         *        nodes are available.
         */
        previous:function () {
            return iterate.call(this, TRUE);
        },

        /**
         * Check all nodes at right, executing the evaluation fuction.
         * @returns {boolean} "FALSE" if the evaluator function returned
         *        "FALSE" for any of the matched nodes. Otherwise "TRUE".
         */
        checkForward:function () {
            return iterate.call(this, FALSE, TRUE) !== FALSE;
        },

        /**
         * Check all nodes at left, executing the evaluation fuction.
         * 是不是 (不能后退了)
         * @returns {boolean} "FALSE" if the evaluator function returned
         *        "FALSE" for any of the matched nodes. Otherwise "TRUE".
         */
        checkBackward:function () {
            return iterate.call(this, TRUE, TRUE) !== FALSE;
        },

        /**
         * Executes a full walk forward (to the right), until no more nodes
         * are available, returning the last valid node.
         * @returns {(boolean)} The last node at the right or NULL
         *        if no valid nodes are available.
         */
        lastForward:function () {
            return iterateToLast.call(this);
        },

        /**
         * Executes a full walk backwards (to the left), until no more nodes
         * are available, returning the last valid node.
         * @returns {(boolean)} The last node at the left or NULL
         *        if no valid nodes are available.
         */
        lastBackward:function () {
            return iterateToLast.call(this, TRUE);
        },

        reset:function () {
            delete this.current;
            this._ = {};
        }

    });


    Walker.blockBoundary = function (customNodeNames) {
        return function (node) {
            node = DOM._4e_wrap(node);
            return !( node && node[0].nodeType == KEN.NODE_ELEMENT
                && node._4e_isBlockBoundary(customNodeNames) );
        };
    };

    if (0) {
        Walker.blockBoundary = 0;
    }
    /**
     * Whether the node is a bookmark node's inner text node.
     */
    //Walker.bookmarkContents = function(node) {
    // },

    /**
     * Whether the to-be-evaluated node is a bookmark node OR bookmark node
     * inner contents.
     * @param {boolean} contentOnly Whether only test againt the text content of
     * bookmark node instead of the element itself(default).
     * @param {boolean} isReject Whether should return 'FALSE' for the bookmark
     * node instead of 'TRUE'(default).
     */
    Walker.bookmark = function (contentOnly, isReject) {
        function isBookmarkNode(node) {
            return ( node && node[0]
                && node._4e_name() == 'span'
                && node.attr('_ke_bookmark') );
        }

        return function (node) {
            var isBookmark, parent;
            // Is bookmark inner text node?
            isBookmark = ( node &&
                node[0] &&
                node[0].nodeType == KEN.NODE_TEXT &&
                ( parent = node.parent() )
                && isBookmarkNode(parent) );
            // Is bookmark node?
            isBookmark = contentOnly ? isBookmark : isBookmark || isBookmarkNode(node);
            return isReject ^ isBookmark;
        };
    };

    /**
     * Whether the node is a text node() containing only whitespaces characters.
     * @param {boolean=} isReject
     */
    Walker.whitespaces = function (isReject) {
        return function (node) {
            node = node[0] || node;
            var isWhitespace = node && ( node.nodeType == KEN.NODE_TEXT )
                && !S.trim(node.nodeValue);
            return isReject ^ isWhitespace;
        };
    };

    /**
     * Whether the node is invisible in wysiwyg mode.
     * @param isReject
     */
    Walker.invisible = function (isReject) {
        var whitespace = Walker.whitespaces();
        return function (node) {
            // Nodes that take no spaces in wysiwyg:
            // 1. White-spaces but not including NBSP;
            // 2. Empty inline elements, e.g. <b></b> we're checking here
            // 'offsetHeight' instead of 'offsetWidth' for properly excluding
            // all sorts of empty paragraph, e.g. <br />.
            var isInvisible = whitespace(node) || node[0].nodeType == KEN.NODE_ELEMENT && !node[0].offsetHeight;
            return isReject ^ isInvisible;
        };
    };

    var tailNbspRegex = /^[\t\r\n ]*(?:&nbsp;|\xa0)$/,
        isWhitespaces = Walker.whitespaces(),
        isBookmark = Walker.bookmark(),
        toSkip = function (node) {
            return isBookmark(node)
                || isWhitespaces(node)
                || node[0].nodeType == 1
                && node._4e_name() in dtd.$inline
                && !( node._4e_name() in dtd.$empty );
        };

    // Check if there's a filler node at the end of an element, and return it.
    Walker.getBogus = function (tail) {
        // Bogus are not always at the end, e.g. <p><a>text<br /></a></p>
        do {
            tail = tail._4e_previousSourceNode();
        } while (toSkip(tail));

        if (tail && ( !UA.ie ? tail._4e_name() == "br"
            : tail[0].nodeType == 3 && tailNbspRegex.test(tail.text()) )) {
            return tail;
        }
        return false;
    };


    KE.Walker = Walker;
});
/**
 * modified from ckeditor,range implementation across browsers for kissy editor
 * @author <yiminghe@gmail.com>
 */
/*
 Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.html or http://ckeditor.com/license
 */
KISSY.Editor.add("range", function (KE) {

    /**
     * Enum for range
     * @enum {number}
     */
    KE.RANGE = {
        POSITION_AFTER_START:1, // <element>^contents</element>		"^text"
        POSITION_BEFORE_END:2, // <element>contents^</element>		"text^"
        POSITION_BEFORE_START:3, // ^<element>contents</element>		^"text"
        POSITION_AFTER_END:4, // <element>contents</element>^		"text"
        ENLARGE_ELEMENT:1,
        ENLARGE_BLOCK_CONTENTS:2,
        ENLARGE_LIST_ITEM_CONTENTS:3,
        START:1,
        END:2,
        //STARTEND:3,
        SHRINK_ELEMENT:1,
        SHRINK_TEXT:2
    };
    KE["RANGE"] = KE.RANGE;

    var TRUE = true,
        FALSE = false,
        NULL = null,
        //OLD_IE = !window.getSelection,
        S = KISSY,
        KEN = KE.NODE,
        KER = KE.RANGE,
        KEP = KE.POSITION,
        Walker = KE.Walker,
        DOM = S.DOM,
        getByAddress = KE.Utils.getByAddress,
        UA = S.UA,
        dtd = KE.XHTML_DTD,
        ElementPath = KE.ElementPath,
        Node = S.Node,
        EMPTY = {"area":1, "base":1, "br":1, "col":1, "hr":1, "img":1, "input":1, "link":1, "meta":1, "param":1};

    /**
     * @constructor
     * @param document {Document}
     */
    function KERange(document) {
        var self = this;
        self.startContainer = NULL;
        self.startOffset = NULL;
        self.endContainer = NULL;
        self.endOffset = NULL;
        self.collapsed = TRUE;
        self.document = document;
    }

    KERange.prototype.toString = function () {
        var s = [], self = this;
        s.push((self.startContainer[0].id || self.startContainer[0].nodeName) + ":" + self.startOffset);
        s.push((self.endContainer[0].id || self.endContainer[0].nodeName) + ":" + self.endOffset);
        return s.join("<br/>");
    };
    S.augment(KERange, {

        updateCollapsed:function () {
            var self = this;
            self.collapsed = (
                self.startContainer &&
                    self.endContainer &&
                    DOM._4e_equals(self.startContainer, self.endContainer) &&
                    self.startOffset == self.endOffset );
        },
        /**
         * Transforms the startContainer and endContainer properties from text
         * nodes to element nodes, whenever possible. This is actually possible
         * if either of the boundary containers point to a text node, and its
         * offset is set to zero, or after the last char in the node.
         */
        optimize:function () {
            var self = this, container = self.startContainer, offset = self.startOffset;

            if (container[0].nodeType != KEN.NODE_ELEMENT) {
                if (!offset)
                    self.setStartBefore(container);
                else if (offset >= container[0].nodeValue.length)
                    self.setStartAfter(container);
            }

            container = self.endContainer;
            offset = self.endOffset;

            if (container[0].nodeType != KEN.NODE_ELEMENT) {
                if (!offset)
                    self.setEndBefore(container);
                else if (offset >= container[0].nodeValue.length)
                    self.setEndAfter(container);
            }
        },
        setStartAfter:function (node) {
            this.setStart(node.parent(), node._4e_index() + 1);
        },

        setStartBefore:function (node) {
            this.setStart(node.parent(), node._4e_index());
        },

        setEndAfter:function (node) {
            this.setEnd(node.parent(), node._4e_index() + 1);
        },

        setEndBefore:function (node) {
            this.setEnd(node.parent(), node._4e_index());
        },
        optimizeBookmark:function () {
            var self = this, startNode = self.startContainer,
                endNode = self.endContainer;

            if (startNode && startNode._4e_name() == 'span'
                && startNode.attr('_ke_bookmark'))
                self.setStartAt(startNode, KER.POSITION_BEFORE_START);
            if (endNode && endNode._4e_name() == 'span'
                && endNode.attr('_ke_bookmark'))
                self.setEndAt(endNode, KER.POSITION_AFTER_END);
        },
        /**
         * Sets the start position of a Range.
         * @param {Node} startNode The node to start the range.
         * @param {Number} startOffset An integer greater than or equal to zero
         *        representing the offset for the start of the range from the start
         *        of startNode.
         */
        setStart:function (startNode, startOffset) {
            // W3C requires a check for the new position. If it is after the end
            // boundary, the range should be collapsed to the new start. It seams
            // we will not need this check for our use of this class so we can
            // ignore it for now.

            // Fixing invalid range start inside dtd empty elements.
            var self = this;
            if (startNode[0].nodeType == KEN.NODE_ELEMENT
                && EMPTY[ startNode._4e_name() ])
                startNode = startNode.parent(), startOffset = startNode._4e_index();

            self.startContainer = startNode;
            self.startOffset = startOffset;

            if (!self.endContainer) {
                self.endContainer = startNode;
                self.endOffset = startOffset;
            }

            self.updateCollapsed();
        },

        /**
         * Sets the end position of a Range.
         * @param {Node} endNode The node to end the range.
         * @param {Number} endOffset An integer greater than or equal to zero
         *        representing the offset for the end of the range from the start
         *        of endNode.
         */
        setEnd:function (endNode, endOffset) {
            // W3C requires a check for the new position. If it is before the start
            // boundary, the range should be collapsed to the new end. It seams we
            // will not need this check for our use of this class so we can ignore
            // it for now.

            // Fixing invalid range end inside dtd empty elements.
            var self = this;
            if (endNode[0].nodeType == KEN.NODE_ELEMENT
                && EMPTY[ endNode._4e_name() ])
                endNode = endNode.parent(), endOffset = endNode._4e_index() + 1;

            self.endContainer = endNode;
            self.endOffset = endOffset;

            if (!self.startContainer) {
                self.startContainer = endNode;
                self.startOffset = endOffset;
            }

            self.updateCollapsed();
        },
        setStartAt:function (node, position) {
            var self = this;
            switch (position) {
                case KER.POSITION_AFTER_START :
                    self.setStart(node, 0);
                    break;

                case KER.POSITION_BEFORE_END :
                    if (node[0].nodeType == KEN.NODE_TEXT)
                        self.setStart(node, node[0].nodeValue.length);
                    else
                        self.setStart(node, node[0].childNodes.length);
                    break;

                case KER.POSITION_BEFORE_START :
                    self.setStartBefore(node);
                    break;

                case KER.POSITION_AFTER_END :
                    self.setStartAfter(node);
            }

            self.updateCollapsed();
        },

        setEndAt:function (node, position) {
            var self = this;
            switch (position) {
                case KER.POSITION_AFTER_START :
                    self.setEnd(node, 0);
                    break;

                case KER.POSITION_BEFORE_END :
                    if (node[0].nodeType == KEN.NODE_TEXT)
                        self.setEnd(node, node[0].nodeValue.length);
                    else
                        self.setEnd(node, node[0].childNodes.length);
                    break;

                case KER.POSITION_BEFORE_START :
                    self.setEndBefore(node);
                    break;

                case KER.POSITION_AFTER_END :
                    self.setEndAfter(node);
            }

            self.updateCollapsed();
        },
        execContentsAction:function (action, docFrag) {
            var self = this,
                startNode = self.startContainer,
                endNode = self.endContainer,
                startOffset = self.startOffset,
                endOffset = self.endOffset,
                removeStartNode,
                t,
                doc = self.document,
                removeEndNode;
            self.optimizeBookmark();
            // For text containers, we must simply split the node and point to the
            // second part. The removal will be handled by the rest of the code .
            //最关键：一般起始都是在文字节点中，得到起点选择右边的文字节点，只对节点处理！
            if (endNode[0].nodeType == KEN.NODE_TEXT)
                endNode = endNode._4e_splitText(endOffset);
            else {
                // If the end container has children and the offset is pointing
                // to a child, then we should start from it.
                if (endNode[0].childNodes.length > 0) {
                    // If the offset points after the last node.
                    if (endOffset >= endNode[0].childNodes.length) {
                        // Let's create a temporary node and mark it for removal.
                        endNode = new Node(
                            endNode[0].appendChild(doc.createTextNode(""))
                        );
                        removeEndNode = TRUE;
                    }
                    else
                        endNode = new Node(endNode[0].childNodes[endOffset]);
                }
            }

            // For text containers, we must simply split the node. The removal will
            // be handled by the rest of the code .
            if (startNode[0].nodeType == KEN.NODE_TEXT) {
                startNode._4e_splitText(startOffset);
                // In cases the end node is the same as the start node, the above
                // splitting will also split the end, so me must move the end to
                // the second part of the split.
                if (startNode._4e_equals(endNode))
                    endNode = new Node(startNode[0].nextSibling);
            }
            else {
                // If the start container has children and the offset is pointing
                // to a child, then we should start from its previous sibling.

                // If the offset points to the first node, we don't have a
                // sibling, so let's use the first one, but mark it for removal.
                if (!startOffset) {
                    // Let's create a temporary node and mark it for removal.
                    t = new Node(doc.createTextNode(""));
                    startNode.prepend(t);
                    startNode = t;
                    removeStartNode = TRUE;
                }
                else if (startOffset >= startNode[0].childNodes.length) {
                    // Let's create a temporary node and mark it for removal.
                    //startNode = startNode[0].appendChild(self.document.createTextNode(''));
                    t = new Node(doc.createTextNode(""));
                    startNode.append(t);
                    startNode = t;
                    removeStartNode = TRUE;
                } else
                    startNode = new Node(
                        startNode[0].childNodes[startOffset].previousSibling
                    );
            }

            // Get the parent nodes tree for the start and end boundaries.
            //从根到自己
            var startParents = startNode._4e_parents(),
                endParents = endNode._4e_parents();

            // Compare them, to find the top most siblings.
            var i, topStart, topEnd;

            for (i = 0; i < startParents.length; i++) {
                topStart = startParents[ i ];
                topEnd = endParents[ i ];

                // The compared nodes will match until we find the top most
                // siblings (different nodes that have the same parent).
                // "i" will hold the index in the parents array for the top
                // most element.
                if (!topStart._4e_equals(topEnd))
                    break;
            }

            var clone = docFrag,
                levelStartNode,
                levelClone,
                currentNode,
                currentSibling;

            // Remove all successive sibling nodes for every node in the
            // startParents tree.
            for (var j = i; j < startParents.length; j++) {
                levelStartNode = startParents[j];

                // For Extract and Clone, we must clone this level.
                if (
                    clone
                        &&
                        !levelStartNode._4e_equals(startNode)
                    ) {
                    // action = 0 = Delete
                    levelClone = clone.appendChild(levelStartNode._4e_clone()[0]);
                }
                else {
                    levelClone = null;
                }
                currentNode = levelStartNode[0].nextSibling;

                while (currentNode) {
                    // Stop processing when the current node matches a node in the
                    // endParents tree or if it is the endNode.
                    if (DOM._4e_equals(endParents[ j ], currentNode)
                        ||
                        DOM._4e_equals(endNode, currentNode))
                        break;

                    // Cache the next sibling.
                    currentSibling = currentNode.nextSibling;

                    // If cloning, just clone it.
                    if (action == 2)    // 2 = Clone
                        clone.appendChild(currentNode.cloneNode(TRUE));
                    else {
                        // Both Delete and Extract will remove the node.
                        DOM._4e_remove(currentNode);

                        // When Extracting, move the removed node to the docFrag.
                        if (action == 1)    // 1 = Extract
                            clone.appendChild(currentNode);
                    }

                    currentNode = currentSibling;
                }
                //ckeditor这里错了，当前节点的路径所在父节点不能clone(TRUE)，要在后面深入子节点处理
                if (levelClone)
                    clone = levelClone;
            }

            clone = docFrag;

            // Remove all previous sibling nodes for every node in the
            // endParents tree.
            for (var k = i; k < endParents.length; k++) {
                levelStartNode = endParents[ k ];

                // For Extract and Clone, we must clone this level.
                if (
                    clone
                        &&
                        action > 0
                        &&
                        !levelStartNode._4e_equals(endNode)
                    ) {
                    // action = 0 = Delete
                    levelClone = clone.appendChild(levelStartNode._4e_clone()[0]);
                } else {
                    levelClone = null;
                }

                // The processing of siblings may have already been done by the parent.
                if (
                    !startParents[ k ]
                        ||
                        !levelStartNode.parent()._4e_equals(startParents[ k ].parent())
                    ) {
                    currentNode = levelStartNode[0].previousSibling;
                    while (currentNode) {
                        // Stop processing when the current node matches a node in the
                        // startParents tree or if it is the startNode.
                        if (DOM._4e_equals(startParents[ k ], currentNode)
                            ||
                            DOM._4e_equals(startNode, currentNode))
                            break;

                        // Cache the next sibling.
                        currentSibling = currentNode.previousSibling;

                        // If cloning, just clone it.
                        if (action == 2) {    // 2 = Clone
                            clone.insertBefore(currentNode.cloneNode(TRUE),
                                clone.firstChild);
                        } else {
                            // Both Delete and Extract will remove the node.
                            DOM._4e_remove(currentNode);

                            // When Extracting, mode the removed node to the docFrag.
                            if (action == 1)    // 1 = Extract
                                clone.insertBefore(currentNode, clone.firstChild);
                        }

                        currentNode = currentSibling;
                    }
                }

                if (levelClone)
                    clone = levelClone;
            }

            if (action == 2) {   // 2 = Clone.

                // No changes in the DOM should be done, so fix the split text (if any).

                var startTextNode = self.startContainer[0];
                if (startTextNode.nodeType == KEN.NODE_TEXT
                    && startTextNode.nextSibling
                    //yiminghe note:careful,nextsilbling should be text node
                    && startTextNode.nextSibling.nodeType == KEN.NODE_TEXT) {
                    startTextNode.data += startTextNode.nextSibling.data;
                    startTextNode.parentNode.removeChild(startTextNode.nextSibling);
                }

                var endTextNode = self.endContainer[0];
                if (endTextNode.nodeType == KEN.NODE_TEXT &&
                    endTextNode.nextSibling &&
                    endTextNode.nextSibling.nodeType == KEN.NODE_TEXT) {
                    endTextNode.data += endTextNode.nextSibling.data;
                    endTextNode.parentNode.removeChild(endTextNode.nextSibling);
                }
            }
            else {
                // Collapse the range.

                // If a node has been partially selected, collapse the range between
                // topStart and topEnd. Otherwise, simply collapse it to the start. (W3C specs).
                if (
                    topStart && topEnd
                        &&
                        (
                            !startNode.parent()._4e_equals(topStart.parent())
                                ||
                                !endNode.parent()._4e_equals(topEnd.parent())
                            )
                    ) {
                    var endIndex = topEnd._4e_index();

                    // If the start node is to be removed, we must correct the
                    // index to reflect the removal.
                    if (removeStartNode &&
                        topEnd.parent()._4e_equals(startNode.parent()))
                        endIndex--;

                    self.setStart(topEnd.parent(), endIndex);
                }

                // Collapse it to the start.
                self.collapse(TRUE);
            }

            // Cleanup any marked node.
            if (removeStartNode)
                startNode._4e_remove();

            if (removeEndNode && endNode[0].parentNode)
            //不能使用remove()
                endNode._4e_remove();
        },

        collapse:function (toStart) {
            var self = this;
            if (toStart) {
                self.endContainer = self.startContainer;
                self.endOffset = self.startOffset;
            } else {
                self.startContainer = self.endContainer;
                self.startOffset = self.endOffset;
            }
            self.collapsed = TRUE;
        },

        clone:function () {
            var self = this,
                clone = new KERange(self.document);

            clone.startContainer = self.startContainer;
            clone.startOffset = self.startOffset;
            clone.endContainer = self.endContainer;
            clone.endOffset = self.endOffset;
            clone.collapsed = self.collapsed;

            return clone;
        },
        getEnclosedNode:function () {
            var walkerRange = this.clone();
            // Optimize and analyze the range to avoid DOM destructive nature of walker.
            walkerRange.optimize();
            if (walkerRange.startContainer[0].nodeType != KEN.NODE_ELEMENT
                || walkerRange.endContainer[0].nodeType != KEN.NODE_ELEMENT)
                return NULL;
            //var current = walkerRange.startContainer[0].childNodes[walkerRange.startOffset];
            var walker = new KE.Walker(walkerRange),
                isNotBookmarks = bookmark(TRUE, undefined),
                isNotWhitespaces = whitespaces(TRUE), node, pre;
            walkerRange.evaluator = function (node) {
                return isNotWhitespaces(node) && isNotBookmarks(node);
            };

            //深度优先遍历的第一个元素
            //        x
            //     y     z
            // x->y ,return y
            node = walker.next();
            walker.reset();
            pre = walker.previous();
            //前后相等，则脱一层皮 :)
            return node && node._4e_equals(pre) ? node : NULL;
        },
        shrink:function (mode, selectContents) {
            // Unable to shrink a collapsed range.
            var self = this;
            if (!self.collapsed) {
                mode = mode || KER.SHRINK_TEXT;

                var walkerRange = self.clone(),
                    startContainer = self.startContainer,
                    endContainer = self.endContainer,
                    startOffset = self.startOffset,
                    endOffset = self.endOffset;
                //collapsed = self.collapsed;

                // Whether the start/end boundary is moveable.
                var moveStart = 1,
                    moveEnd = 1;

                if (startContainer && startContainer[0].nodeType == KEN.NODE_TEXT) {
                    if (!startOffset)
                        walkerRange.setStartBefore(startContainer);
                    else if (startOffset >= startContainer[0].nodeValue.length)
                        walkerRange.setStartAfter(startContainer);
                    else {
                        // Enlarge the range properly to avoid walker making
                        // DOM changes caused by triming the text nodes later.
                        walkerRange.setStartBefore(startContainer);
                        moveStart = 0;
                    }
                }

                if (endContainer && endContainer[0].nodeType == KEN.NODE_TEXT) {
                    if (!endOffset)
                        walkerRange.setEndBefore(endContainer);
                    else if (endOffset >= endContainer[0].nodeValue.length)
                        walkerRange.setEndAfter(endContainer);
                    else {
                        walkerRange.setEndAfter(endContainer);
                        moveEnd = 0;
                    }
                }

                var walker = new Walker(walkerRange);

                walker.evaluator = function (node) {
                    node = node[0] || node;
                    return node.nodeType == ( mode == KER.SHRINK_ELEMENT ?
                        KEN.NODE_ELEMENT : KEN.NODE_TEXT );
                };

                var currentElement;
                walker.guard = function (node, movingOut) {

                    node = node[0] || node;
                    // Stop when we're shrink in element mode while encountering a text node.
                    if (mode == KER.SHRINK_ELEMENT && node.nodeType == KEN.NODE_TEXT)
                        return FALSE;

                    // Stop when we've already walked "through" an element.
                    if (movingOut && node == currentElement)
                        return FALSE;

                    if (!movingOut && node.nodeType == KEN.NODE_ELEMENT)
                        currentElement = node;

                    return TRUE;
                };

                if (moveStart) {
                    var textStart = walker[ mode == KER.SHRINK_ELEMENT ? 'lastForward' : 'next']();
                    textStart && self.setStartAt(textStart, selectContents ? KER.POSITION_AFTER_START : KER.POSITION_BEFORE_START);
                }

                if (moveEnd) {
                    walker.reset();
                    var textEnd = walker[ mode == KER.SHRINK_ELEMENT ? 'lastBackward' : 'previous']();
                    textEnd && self.setEndAt(textEnd, selectContents ? KER.POSITION_BEFORE_END : KER.POSITION_AFTER_END);
                }

                return !!( moveStart || moveEnd );
            }
        },
//        getTouchedStartNode : function() {
//            var self = this,container = self.startContainer;
//
//            if (self.collapsed || container[0].nodeType != KEN.NODE_ELEMENT)
//                return container;
//
//            return container.childNodes[self.startOffset] || container;
//        },
        createBookmark2:function (normalized) {
            //debugger;
            var self = this, startContainer = self.startContainer,
                endContainer = self.endContainer,
                startOffset = self.startOffset,
                endOffset = self.endOffset,
                child, previous;

            // If there is no range then get out of here.
            // It happens on initial load in Safari #962 and if the editor it's
            // hidden also in Firefox
            if (!startContainer || !endContainer)
                return { start:0, end:0 };

            if (normalized) {
                // Find out if the start is pointing to a text node that will
                // be normalized.
                if (startContainer[0].nodeType == KEN.NODE_ELEMENT) {
                    child = new Node(startContainer[0].childNodes[startOffset]);

                    // In this case, move the start information to that text
                    // node.

                    //ie 有时 invalid argument？？
                    if (child && child[0] && child[0].nodeType == KEN.NODE_TEXT
                        && startOffset > 0 && child[0].previousSibling.nodeType == KEN.NODE_TEXT) {
                        startContainer = child;
                        startOffset = 0;
                    }

                }

                // Normalize the start.
                while (startContainer[0].nodeType == KEN.NODE_TEXT
                    && ( previous = startContainer._4e_previous() )
                    && previous[0].nodeType == KEN.NODE_TEXT) {
                    startContainer = previous;
                    startOffset += previous[0].nodeValue.length;
                }

                // Process the end only if not normalized.
                if (!self.collapsed) {
                    // Find out if the start is pointing to a text node that
                    // will be normalized.
                    if (endContainer[0].nodeType == KEN.NODE_ELEMENT) {
                        child = new Node(endContainer[0].childNodes[endOffset]);

                        // In this case, move the start information to that
                        // text node.
                        if (child && child[0] && child[0].nodeType == KEN.NODE_TEXT
                            && endOffset > 0 && child[0].previousSibling.nodeType == KEN.NODE_TEXT) {
                            endContainer = child;
                            endOffset = 0;
                        }
                    }

                    // Normalize the end.
                    while (endContainer[0].nodeType == KEN.NODE_TEXT
                        && ( previous = endContainer._4e_previous() )
                        && previous[0].nodeType == KEN.NODE_TEXT) {
                        endContainer = previous;
                        endOffset += previous[0].nodeValue.length;
                    }
                }
            }

            return {
                start:startContainer._4e_address(normalized),
                end:self.collapsed ? NULL : endContainer._4e_address(normalized),
                startOffset:startOffset,
                endOffset:endOffset,
                normalized:normalized,
                is2:TRUE        // It's a createBookmark2 bookmark.
            };
        },
        createBookmark:function (serializable) {
            var startNode,
                endNode,
                baseId,
                clone,
                self = this,
                collapsed = self.collapsed;
            startNode = new Node("<span>", NULL, self.document);
            startNode.attr('_ke_bookmark', 1);
            startNode.css('display', 'none');

            // For IE, it must have something inside, otherwise it may be
            // removed during DOM operations.
            startNode.html('&nbsp;');

            if (serializable) {
                baseId = S.guid('ke_bm_');
                startNode.attr('id', baseId + 'S');
            }

            // If collapsed, the endNode will not be created.
            if (!collapsed) {
                endNode = startNode._4e_clone();
                endNode.html('&nbsp;');

                if (serializable)
                    endNode.attr('id', baseId + 'E');

                clone = self.clone();
                clone.collapse();
                //S.log(clone.endContainer[0].nodeType);
                //S.log(clone.endOffset);
                clone.insertNode(endNode);
            }
            //S.log(endNode[0].parentNode.outerHTML);
            clone = self.clone();
            clone.collapse(TRUE);
            clone.insertNode(startNode);

            // Update the range position.
            if (endNode) {
                self.setStartAfter(startNode);
                self.setEndBefore(endNode);
            }
            else
                self.moveToPosition(startNode, KER.POSITION_AFTER_END);

            return {
                startNode:serializable ? baseId + 'S' : startNode,
                endNode:serializable ? baseId + 'E' : endNode,
                serializable:serializable,
                collapsed:collapsed
            };
        },
        moveToPosition:function (node, position) {
            var self = this;
            self.setStartAt(node, position);
            self.collapse(TRUE);
        },
        trim:function (ignoreStart, ignoreEnd) {
            var self = this,
                startContainer = self.startContainer,
                startOffset = self.startOffset,
                collapsed = self.collapsed;
            if (( !ignoreStart || collapsed )
                && startContainer[0] && startContainer[0].nodeType == KEN.NODE_TEXT) {
                // If the offset is zero, we just insert the new node before
                // the start.
                if (!startOffset) {
                    startOffset = startContainer._4e_index();
                    startContainer = startContainer.parent();
                }
                // If the offset is at the end, we'll insert it after the text
                // node.
                else if (startOffset >= startContainer[0].nodeValue.length) {
                    startOffset = startContainer._4e_index() + 1;
                    startContainer = startContainer.parent();
                }
                // In other case, we split the text node and insert the new
                // node at the split point.
                else {
                    var nextText = startContainer._4e_splitText(startOffset);

                    startOffset = startContainer._4e_index() + 1;
                    startContainer = startContainer.parent();

                    // Check all necessity of updating the end boundary.
                    if (DOM._4e_equals(self.startContainer, self.endContainer))
                        self.setEnd(nextText, self.endOffset - self.startOffset);
                    else if (DOM._4e_equals(startContainer, self.endContainer))
                        self.endOffset += 1;
                }

                self.setStart(startContainer, startOffset);

                if (collapsed) {
                    self.collapse(TRUE);
                    return;
                }
            }

            var endContainer = self.endContainer, endOffset = self.endOffset;

            if (!( ignoreEnd || collapsed )
                && endContainer[0] && endContainer[0].nodeType == KEN.NODE_TEXT) {
                // If the offset is zero, we just insert the new node before
                // the start.
                if (!endOffset) {
                    endOffset = endContainer._4e_index();
                    endContainer = endContainer.parent();
                }
                // If the offset is at the end, we'll insert it after the text
                // node.
                else if (endOffset >= endContainer.nodeValue.length) {
                    endOffset = endContainer._4e_index() + 1;
                    endContainer = endContainer.parent();
                }
                // In other case, we split the text node and insert the new
                // node at the split point.
                else {
                    endContainer._4e_splitText(endOffset);

                    endOffset = endContainer._4e_index() + 1;
                    endContainer = endContainer.parent();
                }

                self.setEnd(endContainer, endOffset);
            }
        },

        insertNode:function (node) {
            var self = this;
            self.optimizeBookmark();
            self.trim(FALSE, TRUE);
            var startContainer = self.startContainer,
                startOffset = self.startOffset,
                nextNode = startContainer[0].childNodes[startOffset] || null;

            startContainer[0].insertBefore(node[0] || node, nextNode);
            // Check if we need to update the end boundary.
            if (DOM._4e_equals(node.parent(), self.endContainer))
                self.endOffset++;

            // Expand the range to embrace the new node.
            self.setStartBefore(node);
        },

        moveToBookmark:function (bookmark) {
            // Created with createBookmark2().
            var self = this;
            if (bookmark.is2) {
                // Get the start information.
                var startContainer = getByAddress(self.document, bookmark.start, bookmark.normalized),
                    startOffset = bookmark.startOffset,
                    endContainer = bookmark.end && getByAddress(self.document, bookmark.end, bookmark.normalized),
                    endOffset = bookmark.endOffset;

                // Set the start boundary.
                self.setStart(startContainer, startOffset);

                // Set the end boundary. If not available, collapse it.
                if (endContainer)
                    self.setEnd(endContainer, endOffset);
                else
                    self.collapse(TRUE);
            } else {
                // Created with createBookmark().
                var serializable = bookmark.serializable,
                    startNode = serializable ? S.one("#" + bookmark.startNode, self.document) : bookmark.startNode,
                    endNode = serializable ? S.one("#" + bookmark.endNode, self.document) : bookmark.endNode;

                // Set the range start at the bookmark start node position.
                self.setStartBefore(startNode);

                // Remove it, because it may interfere in the setEndBefore call.
                startNode._4e_remove();

                // Set the range end at the bookmark end node position, or simply
                // collapse it if it is not available.
                if (endNode && endNode[0]) {
                    self.setEndBefore(endNode);
                    endNode._4e_remove();
                }
                else
                    self.collapse(TRUE);
            }
        },
        getCommonAncestor:function (includeSelf, ignoreTextNode) {
            var self = this, start = self.startContainer,
                end = self.endContainer,
                ancestor;

            if (DOM._4e_equals(start, end)) {
                if (includeSelf
                    && start[0].nodeType == KEN.NODE_ELEMENT
                    && self.startOffset == self.endOffset - 1)
                    ancestor = new Node(start[0].childNodes[self.startOffset]);
                else
                    ancestor = start;
            }
            else
                ancestor = start._4e_commonAncestor(end);

            return ignoreTextNode && ancestor[0].nodeType == KEN.NODE_TEXT
                ? ancestor.parent() : ancestor;
        },
        enlarge:function (unit) {
            var self = this;
            switch (unit) {
                case KER.ENLARGE_ELEMENT :

                    if (self.collapsed)
                        return;

                    // Get the common ancestor.
                    var commonAncestor = self.getCommonAncestor(), body = new Node(self.document.body),
                        // For each boundary
                        //		a. Depending on its position, find out the first node to be checked (a sibling) or, if not available, to be enlarge.
                        //		b. Go ahead checking siblings and enlarging the boundary as much as possible until the common ancestor is not reached. After reaching the common ancestor, just save the enlargeable node to be used later.

                        startTop, endTop,
                        enlargeable, sibling, commonReached,

                        // Indicates that the node can be added only if whitespace
                        // is available before it.
                        needsWhiteSpace = FALSE, isWhiteSpace, siblingText,

                        // Process the start boundary.

                        container = self.startContainer,
                        offset = self.startOffset;

                    if (container[0].nodeType == KEN.NODE_TEXT) {
                        if (offset) {
                            // Check if there is any non-space text before the
                            // offset. Otherwise, container is NULL.
                            container = !S.trim(container[0].nodeValue.substring(0, offset)).length && container;

                            // If we found only whitespace in the node, it
                            // means that we'll need more whitespace to be able
                            // to expand. For example, <i> can be expanded in
                            // "A <i> [B]</i>", but not in "A<i> [B]</i>".
                            needsWhiteSpace = !!container;
                        }

                        if (container) {
                            if (!( sibling = container[0].previousSibling ))
                                enlargeable = container.parent();
                        }
                    }
                    else {
                        // If we have offset, get the node preceeding it as the
                        // first sibling to be checked.
                        if (offset)
                            sibling = container[0].childNodes[offset - 1] || container[0].lastChild;

                        // If there is no sibling, mark the container to be
                        // enlarged.
                        if (!sibling)
                            enlargeable = container;
                    }

                    while (enlargeable || sibling) {
                        if (enlargeable && !sibling) {
                            // If we reached the common ancestor, mark the flag
                            // for it.
                            if (!commonReached && DOM._4e_equals(enlargeable, commonAncestor))
                                commonReached = TRUE;

                            if (!body.contains(enlargeable))
                                break;

                            // If we don't need space or this element breaks
                            // the line, then enlarge it.
                            if (!needsWhiteSpace || enlargeable.css('display') != 'inline') {
                                needsWhiteSpace = FALSE;

                                // If the common ancestor has been reached,
                                // we'll not enlarge it immediately, but just
                                // mark it to be enlarged later if the end
                                // boundary also enlarges it.
                                if (commonReached)
                                    startTop = enlargeable;
                                else
                                    self.setStartBefore(enlargeable);
                            }

                            sibling = enlargeable[0].previousSibling;
                        }

                        // Check all sibling nodes preceeding the enlargeable
                        // node. The node wil lbe enlarged only if none of them
                        // blocks it.
                        while (sibling) {
                            // This flag indicates that this node has
                            // whitespaces at the end.
                            isWhiteSpace = FALSE;

                            if (sibling.nodeType == KEN.NODE_TEXT) {
                                siblingText = sibling.nodeValue;

                                if (/[^\s\ufeff]/.test(siblingText))
                                    sibling = NULL;

                                isWhiteSpace = /[\s\ufeff]$/.test(siblingText);
                            }
                            else {
                                // If this is a visible element.
                                // We need to check for the bookmark attribute because IE insists on
                                // rendering the display:none nodes we use for bookmarks. (#3363)
                                // Line-breaks (br) are rendered with zero width, which we don't want to include. (#7041)
                                if ((sibling.offsetWidth > 0 || DOM._4e_name(sibling) == "br") && !sibling.getAttribute('_ke_bookmark')) {
                                    // We'll accept it only if we need
                                    // whitespace, and this is an inline
                                    // element with whitespace only.
                                    if (needsWhiteSpace && dtd.$removeEmpty[ sibling.nodeName.toLowerCase() ]) {
                                        // It must contains spaces and inline elements only.

                                        siblingText = DOM.text(sibling);

                                        if ((/[^\s\ufeff]/).test(siblingText))    // Spaces + Zero Width No-Break Space (U+FEFF)
                                            sibling = NULL;
                                        else {
                                            var allChildren = sibling.all || sibling.getElementsByTagName('*');
                                            for (var i = 0, child; child = allChildren[ i++ ];) {
                                                if (!dtd.$removeEmpty[ child.nodeName.toLowerCase() ]) {
                                                    sibling = NULL;
                                                    break;
                                                }
                                            }
                                        }

                                        if (sibling)
                                            isWhiteSpace = !!siblingText.length;
                                    }
                                    else
                                        sibling = NULL;
                                }
                            }

                            // A node with whitespaces has been found.
                            if (isWhiteSpace) {
                                // Enlarge the last enlargeable node, if we
                                // were waiting for spaces.
                                if (needsWhiteSpace) {
                                    if (commonReached)
                                        startTop = enlargeable;
                                    else if (enlargeable)
                                        self.setStartBefore(enlargeable);
                                }
                                else
                                    needsWhiteSpace = TRUE;
                            }

                            if (sibling) {
                                var next = sibling.previousSibling;

                                if (!enlargeable && !next) {
                                    // Set the sibling as enlargeable, so it's
                                    // parent will be get later outside this while.
                                    enlargeable = new Node(sibling);
                                    sibling = NULL;
                                    break;
                                }

                                sibling = next;
                            }
                            else {
                                // If sibling has been set to NULL, then we
                                // need to stop enlarging.
                                enlargeable = NULL;
                            }
                        }

                        if (enlargeable)
                            enlargeable = enlargeable.parent();
                    }

                    // Process the end boundary. This is basically the same
                    // code used for the start boundary, with small changes to
                    // make it work in the opposite side (to the right). This
                    // makes it difficult to reuse the code here. So, fixes to
                    // the above code are likely to be replicated here.

                    container = self.endContainer;
                    offset = self.endOffset;

                    // Reset the common variables.
                    enlargeable = sibling = NULL;
                    commonReached = needsWhiteSpace = FALSE;

                    if (container[0].nodeType == KEN.NODE_TEXT) {
                        // Check if there is any non-space text after the
                        // offset. Otherwise, container is NULL.
                        container = !S.trim(container[0].nodeValue.substring(offset)).length && container;

                        // If we found only whitespace in the node, it
                        // means that we'll need more whitespace to be able
                        // to expand. For example, <i> can be expanded in
                        // "A <i> [B]</i>", but not in "A<i> [B]</i>".
                        needsWhiteSpace = !( container && container[0].nodeValue.length );

                        if (container) {
                            if (!( sibling = container[0].nextSibling ))
                                enlargeable = container.parent();
                        }
                    }
                    else {
                        // Get the node right after the boudary to be checked
                        // first.
                        sibling = container[0].childNodes[offset];

                        if (!sibling)
                            enlargeable = container;
                    }

                    while (enlargeable || sibling) {
                        if (enlargeable && !sibling) {
                            if (!commonReached && DOM._4e_equals(enlargeable, commonAncestor))
                                commonReached = TRUE;

                            if (!body.contains(enlargeable))
                                break;

                            if (!needsWhiteSpace || enlargeable.css('display') != 'inline') {
                                needsWhiteSpace = FALSE;

                                if (commonReached)
                                    endTop = enlargeable;
                                else if (enlargeable)
                                    self.setEndAfter(enlargeable);
                            }

                            sibling = enlargeable[0].nextSibling;
                        }

                        while (sibling) {
                            isWhiteSpace = FALSE;

                            if (sibling.nodeType == KEN.NODE_TEXT) {
                                siblingText = sibling.nodeValue;

                                if (/[^\s\ufeff]/.test(siblingText))
                                    sibling = NULL;

                                isWhiteSpace = /^[\s\ufeff]/.test(siblingText);
                            }
                            else {
                                // If this is a visible element.
                                // We need to check for the bookmark attribute because IE insists on
                                // rendering the display:none nodes we use for bookmarks. (#3363)
                                if ((sibling.offsetWidth > 0
                                    // <p>^xx^<br/></p> -> ^<p>xx<br/></p> : wrong
                                    // bug report@2012-05-08
                                    || DOM._4e_name(sibling) == "br"
                                    )
                                    && !sibling.getAttribute('_ke_bookmark')) {
                                    // We'll accept it only if we need
                                    // whitespace, and this is an inline
                                    // element with whitespace only.
                                    if (needsWhiteSpace && dtd.$removeEmpty[ sibling.nodeName.toLowerCase() ]) {
                                        // It must contains spaces and inline elements only.

                                        siblingText = DOM.text(sibling);

                                        if ((/[^\s\ufeff]/).test(siblingText))
                                            sibling = NULL;
                                        else {
                                            allChildren = sibling.all || sibling.getElementsByTagName('*');
                                            for (i = 0; child = allChildren[ i++ ];) {
                                                if (!dtd.$removeEmpty[ child.nodeName.toLowerCase() ]) {
                                                    sibling = NULL;
                                                    break;
                                                }
                                            }
                                        }

                                        if (sibling)
                                            isWhiteSpace = !!siblingText.length;
                                    }
                                    else
                                        sibling = NULL;
                                }
                            }

                            if (isWhiteSpace) {
                                if (needsWhiteSpace) {
                                    if (commonReached)
                                        endTop = enlargeable;
                                    else
                                        self.setEndAfter(enlargeable);
                                }
                            }

                            if (sibling) {
                                next = sibling.nextSibling;

                                if (!enlargeable && !next) {
                                    enlargeable = new Node(sibling);
                                    sibling = NULL;
                                    break;
                                }

                                sibling = next;
                            }
                            else {
                                // If sibling has been set to NULL, then we
                                // need to stop enlarging.
                                enlargeable = NULL;
                            }
                        }

                        if (enlargeable)
                            enlargeable = enlargeable.parent();
                    }

                    // If the common ancestor can be enlarged by both boundaries, then include it also.
                    if (startTop && endTop) {
                        commonAncestor = startTop.contains(endTop) ? endTop : startTop;
                        self.setStartBefore(commonAncestor);
                        self.setEndAfter(commonAncestor);
                    }
                    break;

                case KER.ENLARGE_BLOCK_CONTENTS:
                case KER.ENLARGE_LIST_ITEM_CONTENTS:

                    // Enlarging the start boundary.
                    var walkerRange = new KERange(self.document);
                    body = new Node(self.document.body);

                    walkerRange.setStartAt(body, KER.POSITION_AFTER_START);
                    walkerRange.setEnd(self.startContainer, self.startOffset);

                    var walker = new Walker(walkerRange),
                        blockBoundary, // The node on which the enlarging should stop.
                        tailBr, //
                        defaultGuard = Walker.blockBoundary(
                            ( unit == KER.ENLARGE_LIST_ITEM_CONTENTS ) ?
                            { br:1 } : NULL),
                        // Record the encountered 'blockBoundary' for later use.
                        boundaryGuard = function (node) {
                            var retval = defaultGuard(node);
                            if (!retval)
                                blockBoundary = node;
                            return retval;
                        },
                        // Record the encounted 'tailBr' for later use.
                        tailBrGuard = function (node) {
                            var retval = boundaryGuard(node);
                            if (!retval && node[0] && node._4e_name() == 'br')
                                tailBr = node;
                            return retval;
                        };

                    walker.guard = boundaryGuard;

                    enlargeable = walker.lastBackward();

                    // It's the body which stop the enlarging if no block boundary found.
                    blockBoundary = blockBoundary || body;

                    // Start the range at different position by comparing
                    // the document position of it with 'enlargeable' node.
                    self.setStartAt(
                        blockBoundary,
                        blockBoundary._4e_name() != 'br' &&
                            ( !enlargeable && self.checkStartOfBlock()
                                || enlargeable && blockBoundary.contains(enlargeable) ) ?
                            KER.POSITION_AFTER_START :
                            KER.POSITION_AFTER_END);

                    // Enlarging the end boundary.
                    walkerRange = self.clone();
                    walkerRange.collapse();
                    walkerRange.setEndAt(body, KER.POSITION_BEFORE_END);
                    walker = new Walker(walkerRange);

                    // tailBrGuard only used for on range end.
                    walker.guard = ( unit == KER.ENLARGE_LIST_ITEM_CONTENTS ) ?
                        tailBrGuard : boundaryGuard;
                    blockBoundary = NULL;
                    // End the range right before the block boundary node.

                    enlargeable = walker.lastForward();

                    // It's the body which stop the enlarging if no block boundary found.
                    blockBoundary = blockBoundary || body;

                    // Start the range at different position by comparing
                    // the document position of it with 'enlargeable' node.
                    self.setEndAt(
                        blockBoundary,
                        ( !enlargeable && self.checkEndOfBlock()
                            || enlargeable && blockBoundary.contains(enlargeable) ) ?
                            KER.POSITION_BEFORE_END :
                            KER.POSITION_BEFORE_START);
                    // We must include the <br> at the end of range if there's
                    // one and we're expanding list item contents
                    if (tailBr)
                        self.setEndAfter(tailBr);
            }
        },
        checkStartOfBlock:function () {
            var self = this, startContainer = self.startContainer,
                startOffset = self.startOffset;

            // If the starting node is a text node, and non-empty before the offset,
            // then we're surely not at the start of block.
            if (startOffset && startContainer[0].nodeType == KEN.NODE_TEXT) {
                var textBefore = S.trim(startContainer[0].nodeValue.substring(0, startOffset));
                if (textBefore.length)
                    return FALSE;
            }

            // Antecipate the trim() call here, so the walker will not make
            // changes to the DOM, which would not get reflected into this
            // range otherwise.
            self.trim();

            // We need to grab the block element holding the start boundary, so
            // let's use an element path for it.
            var path = new ElementPath(self.startContainer);

            // Creates a range starting at the block start until the range start.
            var walkerRange = self.clone();
            walkerRange.collapse(TRUE);
            walkerRange.setStartAt(path.block || path.blockLimit, KER.POSITION_AFTER_START);

            var walker = new Walker(walkerRange);
            walker.evaluator = getCheckStartEndBlockEvalFunction(TRUE);

            return walker.checkBackward();
        },

        checkEndOfBlock:function () {
            var self = this, endContainer = self.endContainer,
                endOffset = self.endOffset;

            // If the ending node is a text node, and non-empty after the offset,
            // then we're surely not at the end of block.
            if (endContainer[0].nodeType == KEN.NODE_TEXT) {
                var textAfter = S.trim(endContainer[0].nodeValue.substring(endOffset));
                if (textAfter.length)
                    return FALSE;
            }

            // Antecipate the trim() call here, so the walker will not make
            // changes to the DOM, which would not get reflected into this
            // range otherwise.
            self.trim();

            // We need to grab the block element holding the start boundary, so
            // let's use an element path for it.
            var path = new ElementPath(self.endContainer);

            // Creates a range starting at the block start until the range start.
            var walkerRange = self.clone();
            walkerRange.collapse(FALSE);
            walkerRange.setEndAt(path.block || path.blockLimit, KER.POSITION_BEFORE_END);

            var walker = new Walker(walkerRange);
            walker.evaluator = getCheckStartEndBlockEvalFunction(FALSE);

            return walker.checkForward();
        },
        deleteContents:function () {
            var self = this;
            if (self.collapsed)
                return;
            self.execContentsAction(0);
        },
        extractContents:function () {
            var self = this, docFrag = self.document.createDocumentFragment();
            if (!self.collapsed)
                self.execContentsAction(1, docFrag);
            return docFrag;
        },
        /**
         * Check whether current range is on the inner edge of the specified element.
         * @param {Number} checkType ( CKEDITOR.START | CKEDITOR.END ) The checking side.
         * @param {Node} element The target element to check.
         */
        checkBoundaryOfElement:function (element, checkType) {
            var walkerRange = this.clone();
            // Expand the range to element boundary.
            walkerRange[ checkType == KER.START ?
                'setStartAt' : 'setEndAt' ]
                (element, checkType == KER.START ?
                    KER.POSITION_AFTER_START
                    : KER.POSITION_BEFORE_END);

            var walker = new Walker(walkerRange);

            walker.evaluator = elementBoundaryEval;
            return walker[ checkType == KER.START ?
                'checkBackward' : 'checkForward' ]();
        },

        getBoundaryNodes:function () {
            var self = this, startNode = self.startContainer,
                endNode = self.endContainer,
                startOffset = self.startOffset,
                endOffset = self.endOffset,
                childCount;

            if (startNode[0].nodeType == KEN.NODE_ELEMENT) {
                childCount = startNode[0].childNodes.length;
                if (childCount > startOffset)
                    startNode = new Node(startNode[0].childNodes[startOffset]);
                else if (childCount < 1)
                    startNode = startNode._4e_previousSourceNode();
                else        // startOffset > childCount but childCount is not 0
                {
                    // Try to take the node just after the current position.
                    startNode = startNode[0];
                    while (startNode.lastChild)
                        startNode = startNode.lastChild;
                    startNode = new Node(startNode);

                    // Normally we should take the next node in DFS order. But it
                    // is also possible that we've already reached the end of
                    // document.
                    startNode = startNode._4e_nextSourceNode() || startNode;
                }
            }

            if (endNode[0].nodeType == KEN.NODE_ELEMENT) {
                childCount = endNode[0].childNodes.length;
                if (childCount > endOffset)
                    endNode = new Node(endNode[0].childNodes[endOffset])._4e_previousSourceNode(TRUE);
                else if (childCount < 1)
                    endNode = endNode._4e_previousSourceNode();
                else        // endOffset > childCount but childCount is not 0
                {
                    // Try to take the node just before the current position.
                    endNode = endNode[0];
                    while (endNode.lastChild)
                        endNode = endNode.lastChild;
                    endNode = new Node(endNode);
                }
            }

            // Sometimes the endNode will come right before startNode for collapsed
            // ranges. Fix it. (#3780)
            if (startNode._4e_position(endNode) & KEP.POSITION_FOLLOWING)
                startNode = endNode;

            return { startNode:startNode, endNode:endNode };
        },
        fixBlock:function (isStart, blockTag) {
            var self = this,
                bookmark = self.createBookmark(),
                fixedBlock = new Node(self.document.createElement(blockTag));
            self.collapse(isStart);
            self.enlarge(KER.ENLARGE_BLOCK_CONTENTS);
            fixedBlock[0].appendChild(self.extractContents());
            fixedBlock._4e_trim();
            if (!UA['ie']) {
                fixedBlock._4e_appendBogus();
            }
            self.insertNode(fixedBlock);
            self.moveToBookmark(bookmark);
            return fixedBlock;
        },
        splitBlock:function (blockTag) {
            var self = this, startPath = new ElementPath(self.startContainer),
                endPath = new ElementPath(self.endContainer),
                startBlockLimit = startPath.blockLimit,
                endBlockLimit = endPath.blockLimit,
                startBlock = startPath.block,
                endBlock = endPath.block,
                elementPath = NULL;
            // Do nothing if the boundaries are in different block limits.
            if (!startBlockLimit._4e_equals(endBlockLimit))
                return NULL;

            // Get or fix current blocks.
            if (blockTag != 'br') {
                if (!startBlock) {
                    startBlock = self.fixBlock(TRUE, blockTag);
                    endBlock = new ElementPath(self.endContainer).block;
                }

                if (!endBlock)
                    endBlock = self.fixBlock(FALSE, blockTag);
            }

            // Get the range position.
            var isStartOfBlock = startBlock && self.checkStartOfBlock(),
                isEndOfBlock = endBlock && self.checkEndOfBlock();

            // Delete the current contents.
            // Why is 2.x doing CheckIsEmpty()?
            self.deleteContents();

            if (startBlock && DOM._4e_equals(startBlock, endBlock)) {
                if (isEndOfBlock) {
                    elementPath = new ElementPath(self.startContainer);
                    self.moveToPosition(endBlock, KER.POSITION_AFTER_END);
                    endBlock = NULL;
                }
                else if (isStartOfBlock) {
                    elementPath = new ElementPath(self.startContainer);
                    self.moveToPosition(startBlock, KER.POSITION_BEFORE_START);
                    startBlock = NULL;
                }
                else {
                    endBlock = self.splitElement(startBlock);

                    // In Gecko, the last child node must be a bogus <br>.
                    // Note: bogus <br> added under <ul> or <ol> would cause
                    // lists to be incorrectly rendered.
                    if (!UA['ie'] && !S.inArray(startBlock._4e_name(), ['ul', 'ol']))
                        startBlock._4e_appendBogus();
                }
            }

            return {
                previousBlock:startBlock,
                nextBlock:endBlock,
                wasStartOfBlock:isStartOfBlock,
                wasEndOfBlock:isEndOfBlock,
                elementPath:elementPath
            };
        },
        splitElement:function (toSplit) {
            var self = this;
            if (!self.collapsed)
                return NULL;

            // Extract the contents of the block from the selection point to the end
            // of its contents.
            self.setEndAt(toSplit, KER.POSITION_BEFORE_END);
            var documentFragment = self.extractContents(),
                // Duplicate the element after it.
                clone = toSplit._4e_clone(FALSE);

            // Place the extracted contents into the duplicated element.
            clone[0].appendChild(documentFragment);
            clone.insertAfter(toSplit);
            self.moveToPosition(toSplit, KER.POSITION_AFTER_END);
            return clone;
        },
        moveToElementEditablePosition:function (el, isMoveToEnd) {
            var self = this, isEditable, xhtml_dtd = KE.XHTML_DTD;

            // Empty elements are rejected.
            if (xhtml_dtd.$empty[ el._4e_name() ])
                return FALSE;

            while (el && el[0].nodeType == KEN.NODE_ELEMENT) {
                isEditable = el._4e_isEditable();

                // If an editable element is found, move inside it.
                if (isEditable) {
                    self.moveToPosition(el, isMoveToEnd ?
                        KER.POSITION_BEFORE_END :
                        KER.POSITION_AFTER_START);
                    // 不要返回，继续找可能的文字位置
                }
                // Stop immediately if we've found a non editable inline element (e.g <img>).
                else if (xhtml_dtd.$inline[ el._4e_name() ]) {
                    self.moveToPosition(el, isMoveToEnd ?
                        KER.POSITION_AFTER_END :
                        KER.POSITION_BEFORE_START);
                    return TRUE;
                }

                // Non-editable non-inline elements are to be bypassed, getting the next one.
                if (xhtml_dtd.$empty[ el._4e_name() ])
                    el = el[ isMoveToEnd ? '_4e_previous' : '_4e_next' ](nonWhitespaceOrBookmarkEval);
                else {
                    if (isMoveToEnd) {
                        el = el._4e_last(nonWhitespaceOrBookmarkEval);
                    } else {
                        el = el._4e_first(nonWhitespaceOrBookmarkEval);
                    }
                }
                // Stop immediately if we've found a text node.
                if (el && el[0].nodeType == KEN.NODE_TEXT) {
                    self.moveToPosition(el, isMoveToEnd ?
                        KER.POSITION_AFTER_END :
                        KER.POSITION_BEFORE_START);
                    return TRUE;
                }
            }

            return isEditable;
        },

        selectNodeContents:function (node) {
            this.setStart(node, 0);
            this.setEnd(node, node[0].nodeType == KEN.NODE_TEXT ?
                node[0].nodeValue.length :
                node[0].childNodes.length);
        }
    });
    var inlineChildReqElements = { "abbr":1, "acronym":1, "b":1, "bdo":1,
        "big":1, "cite":1, "code":1, "del":1, "dfn":1,
        "em":1, "font":1, "i":1, "ins":1, "label":1,
        "kbd":1, "q":1, "samp":1, "small":1, "span":1,
        "strike":1, "strong":1, "sub":1, "sup":1, "tt":1, "u":1, 'var':1 };

    // Evaluator for CKEDITOR.dom.element::checkBoundaryOfElement, reject any
    // text node and non-empty elements unless it's being bookmark text.
    function elementBoundaryEval(node) {
        // Reject any text node unless it's being bookmark
        // OR it's spaces. (#3883)
        //如果不是文本节点并且是空的，可以继续取下一个判断边界
        var c1 = node[0].nodeType != KEN.NODE_TEXT
            && node._4e_name() in dtd.$removeEmpty,
            //文本为空，可以继续取下一个判断边界
            c2 = !S.trim(node[0].nodeValue),
            //恩，进去了书签，可以继续取下一个判断边界
            c3 = !!node.parent().attr('_ke_bookmark');
        return c1 || c2 || c3;
    }

    var whitespaceEval = new Walker.whitespaces(),
        bookmarkEval = new Walker.bookmark();

    function nonWhitespaceOrBookmarkEval(node) {
        // Whitespaces and bookmark nodes are to be ignored.
        return !whitespaceEval(node) && !bookmarkEval(node);
    }

    function getCheckStartEndBlockEvalFunction(isStart) {
        var hadBr = FALSE, bookmarkEvaluator = Walker.bookmark(TRUE);
        return function (node) {
            // First ignore bookmark nodes.
            if (bookmarkEvaluator(node))
                return TRUE;

            if (node[0].nodeType == KEN.NODE_TEXT) {
                // If there's any visible text, then we're not at the start.
                if (S.trim(node[0].nodeValue).length)
                    return FALSE;
            }
            else if (node[0].nodeType == KEN.NODE_ELEMENT) {
                // If there are non-empty inline elements (e.g. <img />), then we're not
                // at the start.
                if (!inlineChildReqElements[ node._4e_name() ]) {
                    // If we're working at the end-of-block, forgive the first <br /> in non-IE
                    // browsers.
                    if (!isStart && !UA['ie'] && node._4e_name() == 'br' && !hadBr)
                        hadBr = TRUE;
                    else
                        return FALSE;
                }
            }
            return TRUE;
        };
    }

    function bookmark(contentOnly, isReject) {
        function isBookmarkNode(node) {
            return ( node && node.nodeName == 'span'
                && node.getAttribute('_ke_bookmark') );
        }

        return function (node) {
            var isBookmark, parent;
            // Is bookmark inner text node?
            isBookmark = ( node && !node.nodeName && ( parent = node.parentNode )
                && isBookmarkNode(parent) );
            // Is bookmark node?
            isBookmark = contentOnly ? isBookmark : isBookmark || isBookmarkNode(node);
            return isReject ^ isBookmark;
        };
    }

    function whitespaces(isReject) {
        return function (node) {
            node = node[0] || node;
            var isWhitespace = node && ( node.nodeType == KEN.NODE_TEXT )
                && !S.trim(node.nodeValue);
            return isReject ^ isWhitespace;
        };
    }


    KE.Range = KERange;
});
/**
 * modified from ckeditor ,dom iterator implementation using walker and nextSourceNode
 * @author <yiminghe@gmail.com>
 */
/*
Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
*/
KISSY.Editor.add("domiterator", function(KE) {
    var

        TRUE = true,
        FALSE = false,
        NULL = null,
        S = KISSY,
        UA = S.UA,
        Walker = KE.Walker,
        KERange = KE.Range,
        KER = KE.RANGE,
        KEN = KE.NODE,
        ElementPath = KE.ElementPath,
        Node = S.Node,
        DOM = S.DOM;

    /**
     * @constructor
     * @param range {KISSY.Editor.Range}
     */
    function Iterator(range) {
        if (arguments.length < 1)
            return;
        var self = this;
        self.range = range;
        self.forceBrBreak = FALSE;

        // Whether include <br>s into the enlarged range.(#3730).
        self.enlargeBr = TRUE;
        self.enforceRealBlocks = FALSE;

        self._ || ( self._ = {} );
    }

    var beginWhitespaceRegex = /^[\r\n\t ]*$/;///^[\r\n\t ]+$/,//+:*??不匹配空串

    S.augment(Iterator, {
        //奇怪点：
        //<ul>
        // <li>
        // x
        // </li>
        // <li>
        // y
        // </li>
        // </ul>
        //会返回两次 li,li,而不是一次 ul ，
        // 可能只是返回包含文字的段落概念？
        getNextParagraph : function(blockTag) {
            // The block element to be returned.
            var block,self = this;

            // The range object used to identify the paragraph contents.
            var range;

            // Indicats that the current element in the loop is the last one.
            var isLast;

            // Instructs to cleanup remaining BRs.
            var removePreviousBr, removeLastBr;

            // self is the first iteration. Let's initialize it.
            if (!self._.lastNode) {
                range = self.range.clone();

                //2010-09-30 shrink
                //3.4.2 新增，
                // Shrink the range to exclude harmful "noises" (#4087, #4450, #5435).
                range.shrink(KER.SHRINK_ELEMENT, TRUE);

                range.enlarge(self.forceBrBreak || !self.enlargeBr ?
                    KER.ENLARGE_LIST_ITEM_CONTENTS : KER.ENLARGE_BLOCK_CONTENTS);

                var walker = new Walker(range),
                    ignoreBookmarkTextEvaluator = Walker.bookmark(TRUE, TRUE);
                // Avoid anchor inside bookmark inner text.
                walker.evaluator = ignoreBookmarkTextEvaluator;
                self._.nextNode = walker.next();
                // TODO: It's better to have walker.reset() used here.
                walker = new Walker(range);
                walker.evaluator = ignoreBookmarkTextEvaluator;
                var lastNode = walker.previous();
                self._.lastNode = lastNode._4e_nextSourceNode(TRUE);

                // We may have an empty text node at the end of block due to [3770].
                // If that node is the lastNode, it would cause our logic to leak to the
                // next block.(#3887)
                if (self._.lastNode &&
                    self._.lastNode[0].nodeType == KEN.NODE_TEXT &&
                    !S.trim(self._.lastNode[0].nodeValue) &&
                    self._.lastNode.parent()._4e_isBlockBoundary()) {
                    var testRange = new KERange(range.document);
                    testRange.moveToPosition(self._.lastNode, KER.POSITION_AFTER_END);
                    if (testRange.checkEndOfBlock()) {
                        var path = new ElementPath(testRange.endContainer);
                        var lastBlock = path.block || path.blockLimit;
                        self._.lastNode = lastBlock._4e_nextSourceNode(TRUE);
                    }
                }

                // Probably the document end is reached, we need a marker node.
                if (!self._.lastNode) {
                    self._.lastNode = self._.docEndMarker = new Node(range.document.createTextNode(''));
                    DOM.insertAfter(self._.lastNode[0], lastNode[0]);
                }

                // Let's reuse self variable.
                range = NULL;
            }

            var currentNode = self._.nextNode;
            lastNode = self._.lastNode;

            self._.nextNode = NULL;
            while (currentNode) {
                // closeRange indicates that a paragraph boundary has been found,
                // so the range can be closed.
                var closeRange = FALSE;

                // includeNode indicates that the current node is good to be part
                // of the range. By default, any non-element node is ok for it.
                var includeNode = ( currentNode[0].nodeType != KEN.NODE_ELEMENT ),
                    continueFromSibling = FALSE;

                // If it is an element node, let's check if it can be part of the
                // range.
                if (!includeNode) {
                    var nodeName = currentNode._4e_name();

                    if (currentNode._4e_isBlockBoundary(self.forceBrBreak && { br : 1 })) {
                        // <br> boundaries must be part of the range. It will
                        // happen only if ForceBrBreak.
                        if (nodeName == 'br')
                            includeNode = TRUE;
                        else if (!range && !currentNode[0].childNodes.length && nodeName != 'hr') {
                            // If we have found an empty block, and haven't started
                            // the range yet, it means we must return self block.
                            block = currentNode;
                            isLast = currentNode._4e_equals(lastNode);
                            break;
                        }

                        // The range must finish right before the boundary,
                        // including possibly skipped empty spaces. (#1603)
                        if (range) {
                            range.setEndAt(currentNode, KER.POSITION_BEFORE_START);

                            // The found boundary must be set as the next one at self
                            // point. (#1717)
                            if (nodeName != 'br')
                                self._.nextNode = currentNode;
                        }

                        closeRange = TRUE;
                    } else {
                        // If we have child nodes, let's check them.
                        if (currentNode[0].firstChild) {
                            // If we don't have a range yet, let's start it.
                            if (!range) {
                                range = new KERange(self.range.document);
                                range.setStartAt(currentNode, KER.POSITION_BEFORE_START);
                            }

                            currentNode = new Node(currentNode[0].firstChild);
                            continue;
                        }
                        includeNode = TRUE;
                    }
                }
                else if (currentNode[0].nodeType == KEN.NODE_TEXT) {
                    // Ignore normal whitespaces (i.e. not including &nbsp; or
                    // other unicode whitespaces) before/after a block node.
                    if (beginWhitespaceRegex.test(currentNode[0].nodeValue))
                        includeNode = FALSE;
                }

                // The current node is good to be part of the range and we are
                // starting a new range, initialize it first.
                if (includeNode && !range) {
                    range = new KERange(self.range.document);
                    range.setStartAt(currentNode, KER.POSITION_BEFORE_START);
                }

                // The last node has been found.
                isLast = ( !closeRange || includeNode ) && currentNode._4e_equals(lastNode);

                // If we are in an element boundary, let's check if it is time
                // to close the range, otherwise we include the parent within it.
                if (range && !closeRange) {
                    while (!currentNode[0].nextSibling && !isLast) {
                        var parentNode = currentNode.parent();

                        if (parentNode._4e_isBlockBoundary(self.forceBrBreak && { br : 1 })) {
                            closeRange = TRUE;
                            isLast = isLast || parentNode._4e_equals(lastNode);
                            break;
                        }

                        currentNode = parentNode;
                        includeNode = TRUE;
                        isLast = currentNode._4e_equals(lastNode);
                        continueFromSibling = TRUE;
                    }
                }

                // Now finally include the node.
                if (includeNode)
                    range.setEndAt(currentNode, KER.POSITION_AFTER_END);

                currentNode = currentNode._4e_nextSourceNode(continueFromSibling, NULL, lastNode);
                isLast = !currentNode;

                // We have found a block boundary. Let's close the range and move out of the
                // loop.
                if (isLast || ( closeRange && range ))
                    break;

                //3.4.2 中被去掉了！不要了，改作一开始就shrink，参见开头 2010-09-30 shrink 注释 
                ////qc #3879 ，选择td内所有问题，这里被出发了
                //禁止，只有td内全部为空时才会略过
                /*
                 if (FALSE) {
                 if (( closeRange || isLast ) && range) {
                 var boundaryNodes = range.getBoundaryNodes(),
                 startPath = new ElementPath(range.startContainer);

                 // Drop the range if it only contains bookmark nodes, and is
                 // not because of the original collapsed range. (#4087,#4450)
                 if (boundaryNodes.startNode.parent()._4e_equals(startPath.blockLimit)
                 && isBookmark(boundaryNodes.startNode)
                 && isBookmark(boundaryNodes.endNode)
                 ) {
                 range = NULL;
                 self._.nextNode = NULL;
                 }
                 else
                 break;
                 }
                 if (isLast)
                 break;
                 }*/


            }

            // Now, based on the processed range, look for (or create) the block to be returned.
            if (!block) {
                // If no range has been found, self is the end.
                if (!range) {
                    self._.docEndMarker && self._.docEndMarker._4e_remove();
                    self._.nextNode = NULL;
                    return NULL;
                }

                var startPath = new ElementPath(range.startContainer);
                var startBlockLimit = startPath.blockLimit,
                    checkLimits = { div : 1, th : 1, td : 1 };
                block = startPath.block;

                if ((!block || !block[0])
                    && !self.enforceRealBlocks
                    && checkLimits[ startBlockLimit._4e_name() ]
                    && range.checkStartOfBlock()
                    && range.checkEndOfBlock())
                    block = startBlockLimit;
                else if (!block || ( self.enforceRealBlocks && block._4e_name() == 'li' )) {
                    // Create the fixed block.
                    block = new Node(self.range.document.createElement(blockTag || 'p'));
                    // Move the contents of the temporary range to the fixed block.
                    block[0].appendChild(range.extractContents());
                    block._4e_trim();
                    // Insert the fixed block into the DOM.
                    range.insertNode(block);
                    removePreviousBr = removeLastBr = TRUE;
                }
                else if (block._4e_name() != 'li') {
                    // If the range doesn't includes the entire contents of the
                    // block, we must split it, isolating the range in a dedicated
                    // block.
                    if (!range.checkStartOfBlock() || !range.checkEndOfBlock()) {
                        // The resulting block will be a clone of the current one.
                        block = block._4e_clone(FALSE);

                        // Extract the range contents, moving it to the new block.
                        block[0].appendChild(range.extractContents());
                        block._4e_trim();

                        // Split the block. At self point, the range will be in the
                        // right position for our intents.
                        var splitInfo = range.splitBlock();

                        removePreviousBr = !splitInfo.wasStartOfBlock;
                        removeLastBr = !splitInfo.wasEndOfBlock;

                        // Insert the new block into the DOM.
                        range.insertNode(block);
                    }
                }
                else if (!isLast) {
                    // LIs are returned as is, with all their children (due to the
                    // nested lists). But, the next node is the node right after
                    // the current range, which could be an <li> child (nested
                    // lists) or the next sibling <li>.

                    self._.nextNode = ( block._4e_equals(lastNode) ? NULL :
                        range.getBoundaryNodes().endNode._4e_nextSourceNode(TRUE, NULL, lastNode) );
                }
            }

            if (removePreviousBr) {
                var previousSibling = new Node(block[0].previousSibling);
                if (previousSibling[0] && previousSibling[0].nodeType == KEN.NODE_ELEMENT) {
                    if (previousSibling._4e_name() == 'br')
                        previousSibling._4e_remove();
                    else if (previousSibling[0].lastChild && DOM._4e_name(previousSibling[0].lastChild) == 'br')
                        DOM._4e_remove(previousSibling[0].lastChild);
                }
            }

            if (removeLastBr) {
                // Ignore bookmark nodes.(#3783)
                var bookmarkGuard = Walker.bookmark(FALSE, TRUE);

                var lastChild = new Node(block[0].lastChild);
                if (lastChild[0] && lastChild[0].nodeType == KEN.NODE_ELEMENT && lastChild._4e_name() == 'br') {
                    // Take care not to remove the block expanding <br> in non-IE browsers.
                    if (UA['ie']
                        || lastChild._4e_previous(bookmarkGuard)
                        || lastChild._4e_next(bookmarkGuard))
                        lastChild._4e_remove();
                }
            }

            // Get a reference for the next element. self is important because the
            // above block can be removed or changed, so we can rely on it for the
            // next interation.
            if (!self._.nextNode) {
                self._.nextNode = ( isLast || block._4e_equals(lastNode) ) ? NULL :
                    block._4e_nextSourceNode(TRUE, NULL, lastNode);
            }

            return block;
        }
    });

    KERange.prototype.createIterator = function() {
        return new Iterator(this);
    };
});
/**
 * modified from ckeditor core plugin - selection
 * @author <yiminghe@gmail.com>
 */
/*
 Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.html or http://ckeditor.com/license
 */
KISSY.Editor.add("selection", function (KE) {
    /**
     * selection type enum
     * @enum {number}
     */
    KE.SELECTION = {
        SELECTION_NONE:1,
        SELECTION_TEXT:2,
        SELECTION_ELEMENT:3

    };
    var
        TRUE = true,
        FALSE = false,
        NULL = null,
        S = KISSY,
        UA = S.UA,
        DOM = S.DOM,
        Event = S.Event,
    //tryThese = KE.Utils.tryThese,
        Node = S.Node,
        KES = KE.SELECTION,
        KER = KE.RANGE,
        KEN = KE.NODE,
    // ie9 仍然采用老的 range api，发现新的不稳定
        OLD_IE = UA['ie'], //!window.getSelection,
    //EventTarget = S.EventTarget,
        Walker = KE.Walker,
    //ElementPath = KE.ElementPath,
        KERange = KE.Range;

    /**
     * @constructor
     * @param document {Document}
     */
    function KESelection(document) {
        var self = this;
        self["document"] = self.document = document;
        self._ = {
            cache:{}
        };

        /**
         * IE BUG: The selection's document may be a different document than the
         * editor document. Return NULL if that's the case.
         */
        if (OLD_IE) {

            try {
                var range = self.getNative().createRange();
                if (!range
                    || ( range.item && range.item(0).ownerDocument != document )
                    || ( range.parentElement && range.parentElement().ownerDocument != document )) {
                    self.isInvalid = TRUE;
                }
            }
                // 2012-06-13 焦点在跨域的 iframe 中，当前页面获取不到 range
            catch (e) {
                self.isInvalid = TRUE;
            }


        }
    }

    var styleObjectElements = {
        "img":1, "hr":1, "li":1, "table":1, "tr":1, "td":1, "th":1, "embed":1, "object":1, "ol":1, "ul":1,
        "a":1, "input":1, "form":1, "select":1, "textarea":1, "button":1, "fieldset":1, "thead":1, "tfoot":1
    };

    S.augment(KESelection, {


        /**
         * Gets the native selection object from the browser.
         * @returns {Object} The native selection object.
         * @example
         * var selection = editor.getSelection().<b>getNative()</b>;
         */
        getNative:!OLD_IE ?
            function () {
                var self = this,
                    cache = self._.cache;
                return cache.nativeSel || ( cache.nativeSel = DOM._4e_getWin(self.document).getSelection() );
            }
            :
            function () {
                var self = this, cache = self._.cache;
                return cache.nativeSel || ( cache.nativeSel = self.document.selection );
            },

        /**
         * Gets the type of the current selection. The following values are
         * available:
         * <ul>
         *        <li> SELECTION_NONE (1): No selection.</li>
         *        <li> SELECTION_TEXT (2): Text is selected or
         *            collapsed selection.</li>
         *        <li> SELECTION_ELEMENT (3): A element
         *            selection.</li>
         * </ul>
         * @returns {number} One of the following constant values:
         *         SELECTION_NONE,  SELECTION_TEXT or
         *         SELECTION_ELEMENT.
         * @example
         * if ( editor.getSelection().<b>getType()</b> == SELECTION_TEXT )
         *     alert( 'Text is selected' );
         */
        getType:!OLD_IE ?
            function () {
                var self = this, cache = self._.cache;
                if (cache.type)
                    return cache.type;

                var type = KES.SELECTION_TEXT,
                    sel = self.getNative();

                if (!sel)
                    type = KES.SELECTION_NONE;
                else if (sel.rangeCount == 1) {
                    // Check if the actual selection is a control (IMG,
                    // TABLE, HR, etc...).

                    var range = sel.getRangeAt(0),
                        startContainer = range.startContainer;

                    if (startContainer == range.endContainer
                        && startContainer.nodeType == KEN.NODE_ELEMENT
                        && Number(range.endOffset - range.startOffset) == 1
                        && styleObjectElements[ startContainer.childNodes[ range.startOffset ].nodeName.toLowerCase() ]) {
                        type = KES.SELECTION_ELEMENT;
                    }
                }

                return ( cache.type = type );
            } :
            function () {
                var self = this, cache = self._.cache;
                if (cache.type)
                    return cache.type;

                var type = KES.SELECTION_NONE;

                try {
                    var sel = self.getNative(),
                        ieType = sel.type;

                    if (ieType == 'Text')
                        type = KES.SELECTION_TEXT;

                    if (ieType == 'Control')
                        type = KES.SELECTION_ELEMENT;

                    // It is possible that we can still get a text range
                    // object even when type == 'None' is returned by IE.
                    // So we'd better check the object returned by
                    // createRange() rather than by looking at the type.
                    //当前一个操作选中文本，后一个操作右键点了字串中间就会出现了
                    if (sel.createRange().parentElement)
                        type = KES.SELECTION_TEXT;
                }
                catch (e) {
                }

                return ( cache.type = type );
            },

        getRanges:OLD_IE ?
            (function () {
                // Finds the container and offset for a specific boundary
                // of an IE range.
                /**
                 *
                 * @param {TextRange} range
                 * @param {boolean=} start
                 */
                var getBoundaryInformation = function (range, start) {
                    // Creates a collapsed range at the requested boundary.
                    range = range.duplicate();
                    range.collapse(start);

                    // Gets the element that encloses the range entirely.
                    var parent = range.parentElement(), siblings = parent.childNodes,
                        testRange;

                    for (var i = 0; i < siblings.length; i++) {
                        var child = siblings[ i ];

                        if (child.nodeType == KEN.NODE_ELEMENT) {
                            testRange = range.duplicate();

                            testRange.moveToElementText(child);

                            var comparisonStart = testRange.compareEndPoints('StartToStart', range),
                                comparisonEnd = testRange.compareEndPoints('EndToStart', range);

                            testRange.collapse();
                            //中间有其他标签
                            if (comparisonStart > 0)
                                break;
                            // When selection stay at the side of certain self-closing elements, e.g. BR,
                            // our comparison will never shows an equality. (#4824)
                            else if (!comparisonStart
                                || comparisonEnd == 1 && comparisonStart == -1)
                                return { container:parent, offset:i };
                            else if (!comparisonEnd)
                                return { container:parent, offset:i + 1 };

                            testRange = NULL;
                        }
                    }

                    if (!testRange) {
                        testRange = range.duplicate();
                        testRange.moveToElementText(parent);
                        testRange.collapse(FALSE);
                    }

                    testRange.setEndPoint('StartToStart', range);
                    // IE report line break as CRLF with range.text but
                    // only LF with textnode.nodeValue, normalize them to avoid
                    // breaking character counting logic below. (#3949)
                    var distance = String(testRange.text)
                        .replace(/\r\n|\r/g, '\n').length;

                    try {
                        while (distance > 0)
                            //bug? 可能不是文本节点 nodeValue undefined
                            //永远不会出现 textnode<img/>textnode
                            //停止时，前面一定为textnode
                            distance -= siblings[ --i ].nodeValue.length;
                    }
                        // Measurement in IE could be somtimes wrong because of <select> element. (#4611)
                    catch (e) {
                        distance = 0;
                    }


                    if (distance === 0) {
                        return {
                            container:parent,
                            offset:i
                        };
                    }
                    else {
                        return {
                            container:siblings[ i ],
                            offset:-distance
                        };
                    }
                };

                return function (force) {
                    var self = this, cache = self._.cache;
                    if (cache.ranges && !force)
                        return cache.ranges;

                    // IE doesn't have range support (in the W3C way), so we
                    // need to do some magic to transform selections into
                    // CKEDITOR.dom.range instances.

                    var sel = self.getNative(),
                        nativeRange = sel && sel.createRange(),
                        type = self.getType(),
                        range;

                    if (!sel)
                        return [];

                    if (type == KES.SELECTION_TEXT) {
                        range = new KERange(self.document);
                        var boundaryInfo = getBoundaryInformation(nativeRange, TRUE);
                        range.setStart(new Node(boundaryInfo.container), boundaryInfo.offset);
                        boundaryInfo = getBoundaryInformation(nativeRange);
                        range.setEnd(new Node(boundaryInfo.container), boundaryInfo.offset);
                        return ( cache.ranges = [ range ] );
                    } else if (type == KES.SELECTION_ELEMENT) {
                        var retval = cache.ranges = [];

                        for (var i = 0; i < nativeRange.length; i++) {
                            var element = nativeRange.item(i),
                                parentElement = element.parentNode,
                                j = 0;

                            range = new KERange(self.document);

                            for (; j < parentElement.childNodes.length && parentElement.childNodes[j] != element; j++) { /*jsl:pass*/
                            }

                            range.setStart(new Node(parentElement), j);
                            range.setEnd(new Node(parentElement), j + 1);
                            retval.push(range);
                        }

                        return retval;
                    }

                    return ( cache.ranges = [] );
                };
            })()
            :
            function (force) {
                var self = this, cache = self._.cache;
                if (cache.ranges && !force)
                    return cache.ranges;

                // On browsers implementing the W3C range, we simply
                // tranform the native ranges in CKEDITOR.dom.range
                // instances.

                var ranges = [], sel = self.getNative();

                if (!sel)
                    return [];

                for (var i = 0; i < sel.rangeCount; i++) {
                    var nativeRange = sel.getRangeAt(i), range = new KERange(self.document);

                    range.setStart(new Node(nativeRange.startContainer), nativeRange.startOffset);
                    range.setEnd(new Node(nativeRange.endContainer), nativeRange.endOffset);
                    ranges.push(range);
                }

                return ( cache.ranges = ranges );
            },

        /**
         * Gets the DOM element in which the selection starts.
         * @returns The element at the beginning of the
         *        selection.
         * @example
         * var element = editor.getSelection().<b>getStartElement()</b>;
         * alert( element._4e_name() );
         */
        getStartElement:function () {
            var self = this, cache = self._.cache;
            if (cache.startElement !== undefined)
                return cache.startElement;

            var node,
                sel = self.getNative();

            switch (self.getType()) {
                case KES.SELECTION_ELEMENT :
                    return this.getSelectedElement();

                case KES.SELECTION_TEXT :

                    var range = self.getRanges()[0];

                    if (range) {
                        if (!range.collapsed) {
                            range.optimize();

                            // Decrease the range content to exclude particial
                            // selected node on the start which doesn't have
                            // visual impact. ( #3231 )
                            while (TRUE) {
                                var startContainer = range.startContainer,
                                    startOffset = range.startOffset;
                                // Limit the fix only to non-block elements.(#3950)
                                if (startOffset == ( startContainer[0].nodeType === KEN.NODE_ELEMENT ?
                                    startContainer[0].childNodes.length : startContainer[0].nodeValue.length )
                                    && !startContainer._4e_isBlockBoundary())
                                    range.setStartAfter(startContainer);
                                else break;
                            }

                            node = range.startContainer;

                            if (node[0].nodeType != KEN.NODE_ELEMENT)
                                return node.parent();

                            node = new Node(node[0].childNodes[range.startOffset]);

                            if (!node[0] || node[0].nodeType != KEN.NODE_ELEMENT)
                                return range.startContainer;

                            var child = node[0].firstChild;
                            while (child && child.nodeType == KEN.NODE_ELEMENT) {
                                node = new Node(child);
                                child = child.firstChild;
                            }
                            return node;
                        }
                    }

                    if (OLD_IE) {
                        range = sel.createRange();
                        range.collapse(TRUE);
                        node = range.parentElement();
                    }
                    else {
                        node = sel.anchorNode;
                        if (node && node.nodeType != KEN.NODE_ELEMENT)
                            node = node.parentNode;
                    }
            }

            return cache.startElement = ( node ? DOM._4e_wrap(node) : NULL );
        },

        /**
         * Gets the current selected element.
         * @returns The selected element. Null if no
         *        selection is available or the selection type is not
         *       SELECTION_ELEMENT.
         * @example
         * var element = editor.getSelection().<b>getSelectedElement()</b>;
         * alert( element._4e_name() );
         */
        getSelectedElement:function () {
            var self = this,
                node,
                cache = self._.cache;
            if (cache.selectedElement !== undefined)
                return cache.selectedElement;


            // Is it native IE control type selection?

            if (OLD_IE) {
                var range = self.getNative().createRange();
                node = range.item && range.item(0);

            }// Figure it out by checking if there's a single enclosed
            // node of the range.
            if (!node) {
                node = (function () {
                    var range = self.getRanges()[ 0 ],
                        enclosed,
                        selected;

                    // Check first any enclosed element, e.g. <ul>[<li><a href="#">item</a></li>]</ul>
                    //脱两层？？2是啥意思？
                    for (var i = 2;
                         i && !
                             (
                                 ( enclosed = range.getEnclosedNode() )
                                     && ( enclosed[0].nodeType == KEN.NODE_ELEMENT )
                                     //某些值得这么多的元素？？
                                     && styleObjectElements[ enclosed._4e_name() ]
                                     && ( selected = enclosed )
                                 ); i--) {
                        // Then check any deep wrapped element, e.g. [<b><i><img /></i></b>]
                        //一下子退到底  ^<a><span><span><img/></span></span></a>^
                        // ->
                        //<a><span><span>^<img/>^</span></span></a>
                        range.shrink(KER.SHRINK_ELEMENT);
                    }

                    return  selected && selected[0];
                })();
            }

            return cache.selectedElement = DOM._4e_wrap(node);
        },


        reset:function () {
            this._.cache = {};
        },

        selectElement:function (element) {
            var range,
                self = this,
                doc = self.document;
            if (OLD_IE) {
                //do not use empty()，编辑器内滚动条重置了
                //选择的 img 内容前后莫名被清除
                //self.getNative().empty();
                try {
                    // Try to select the node as a control.
                    range = doc.body['createControlRange']();
                    range['addElement'](element[0]);
                    range.select();
                } catch (e) {
                    // If failed, select it as a text range.
                    range = doc.body.createTextRange();
                    range.moveToElementText(element[0]);
                    range.select();
                } finally {
                    //this.document.fire('selectionchange');
                }
                self.reset();
            } else {
                // Create the range for the element.
                range = doc.createRange();
                range.selectNode(element[0]);
                // Select the range.
                var sel = self.getNative();
                sel.removeAllRanges();
                sel.addRange(range);
                self.reset();
            }
        },

        selectRanges:function (ranges) {
            var self = this;
            if (OLD_IE) {
                if (ranges.length > 1) {
                    // IE doesn't accept multiple ranges selection, so we join all into one.
                    var last = ranges[ ranges.length - 1 ];
                    ranges[ 0 ].setEnd(last.endContainer, last.endOffset);
                    ranges.length = 1;
                }

                // IE doesn't accept multiple ranges selection, so we just
                // select the first one.
                if (ranges[ 0 ])
                    ranges[ 0 ].select();

                self.reset();
            }
            else {
                var sel = self.getNative();
                if (!sel) {
                    return;
                }
                sel.removeAllRanges();
                for (var i = 0; i < ranges.length; i++) {
                    var range = ranges[ i ],
                        nativeRange = self.document.createRange(),
                        startContainer = range.startContainer;

                    // In FF2, if we have a collapsed range, inside an empty
                    // element, we must add something to it otherwise the caret
                    // will not be visible.
                    // opera move out of this element
                    if (range.collapsed &&
                        (( UA.gecko && UA.gecko < 1.0900 ) || UA.opera || UA['webkit']) &&
                        startContainer[0].nodeType == KEN.NODE_ELEMENT &&
                        !startContainer[0].childNodes.length) {
                        // webkit 光标停留不到在空元素内，要fill char，之后范围定在 fillchar 之后
                        startContainer[0].appendChild(self.document.createTextNode(UA['webkit'] ? "\u200b" : ""));
                        range.startOffset++;
                        range.endOffset++;
                    }

                    nativeRange.setStart(startContainer[0], range.startOffset);
                    nativeRange.setEnd(range.endContainer[0], range.endOffset);
                    // Select the range.
                    sel.addRange(nativeRange);
                }
                self.reset();
            }
        },
        createBookmarks2:function (normalized) {
            var bookmarks = [],
                ranges = this.getRanges();

            for (var i = 0; i < ranges.length; i++)
                bookmarks.push(ranges[i].createBookmark2(normalized));

            return bookmarks;
        },
        createBookmarks:function (serializable, ranges) {
            var self = this,
                retval = [],
                doc = self.document,
                bookmark;
            ranges = ranges || self.getRanges();
            var length = ranges.length;
            for (var i = 0; i < length; i++) {
                retval.push(bookmark = ranges[ i ].createBookmark(serializable, TRUE));
                serializable = bookmark.serializable;

                var bookmarkStart = serializable ? S.one("#" + bookmark.startNode, doc) : bookmark.startNode,
                    bookmarkEnd = serializable ? S.one("#" + bookmark.endNode, doc) : bookmark.endNode;

                // Updating the offset values for rest of ranges which have been mangled(#3256).
                for (var j = i + 1; j < length; j++) {
                    var dirtyRange = ranges[ j ],
                        rangeStart = dirtyRange.startContainer,
                        rangeEnd = dirtyRange.endContainer;

                    DOM._4e_equals(rangeStart, bookmarkStart.parent()) && dirtyRange.startOffset++;
                    DOM._4e_equals(rangeStart, bookmarkEnd.parent()) && dirtyRange.startOffset++;
                    DOM._4e_equals(rangeEnd, bookmarkStart.parent()) && dirtyRange.endOffset++;
                    DOM._4e_equals(rangeEnd, bookmarkEnd.parent()) && dirtyRange.endOffset++;
                }
            }

            return retval;
        },

        selectBookmarks:function (bookmarks) {
            var self = this, ranges = [];
            for (var i = 0; i < bookmarks.length; i++) {
                var range = new KERange(self.document);
                range.moveToBookmark(bookmarks[i]);
                ranges.push(range);
            }
            self.selectRanges(ranges);
            return self;
        },

        getCommonAncestor:function () {
            var ranges = this.getRanges(),
                startNode = ranges[ 0 ].startContainer,
                endNode = ranges[ ranges.length - 1 ].endContainer;
            return startNode._4e_commonAncestor(endNode);
        },

        // Moving scroll bar to the current selection's start position.
        scrollIntoView:function () {
            // If we have split the block, adds a temporary span at the
            // range position and scroll relatively to it.
            var start = this.getStartElement();
            start && start._4e_scrollIntoView();
        },
        removeAllRanges:function () {
            var sel = this.getNative();
            if (!OLD_IE) {
                sel && sel.removeAllRanges();
            } else {
                sel && sel.clear();
            }
        }
    });


    var nonCells = { "table":1, "tbody":1, "tr":1 }, notWhitespaces = Walker.whitespaces(TRUE),
        fillerTextRegex = /\ufeff|\u00a0/;
    KERange.prototype["select"] =
        KERange.prototype.select =
            !OLD_IE ? function () {
                var self = this, startContainer = self.startContainer;

                // If we have a collapsed range, inside an empty element, we must add
                // something to it, otherwise the caret will not be visible.
                if (self.collapsed && startContainer[0].nodeType == KEN.NODE_ELEMENT && !startContainer[0].childNodes.length)
                    startContainer[0].appendChild(self.document.createTextNode(""));

                var nativeRange = self.document.createRange();
                nativeRange.setStart(startContainer[0], self.startOffset);

                try {
                    nativeRange.setEnd(self.endContainer[0], self.endOffset);
                } catch (e) {
                    // There is a bug in Firefox implementation (it would be too easy
                    // otherwise). The new start can't be after the end (W3C says it can).
                    // So, let's create a new range and collapse it to the desired point.
                    if (e.toString().indexOf('NS_ERROR_ILLEGAL_VALUE') >= 0) {
                        self.collapse(TRUE);
                        nativeRange.setEnd(self.endContainer[0], self.endOffset);
                    }
                    else
                        throw( e );
                }

                var selection = getSelection(self.document).getNative();
                selection.removeAllRanges();
                selection.addRange(nativeRange);
            } : // V2
                function (forceExpand) {

                    var self = this,
                        collapsed = self.collapsed,
                        isStartMarkerAlone,
                        dummySpan;
                    //选的是元素，直接使用selectElement
                    //还是有差异的，特别是img选择框问题
                    if (
                    //ie8 有问题？？
                    //UA['ie']Engine!=8 &&
                        self.startContainer[0] === self.endContainer[0]
                            && self.endOffset - self.startOffset == 1) {
                        var selEl = self.startContainer[0].childNodes[self.startOffset];
                        if (selEl.nodeType == KEN.NODE_ELEMENT) {
                            new KESelection(self.document).selectElement(new Node(selEl));
                            return;
                        }
                    }
                    // IE doesn't support selecting the entire table row/cell, move the selection into cells, e.g.
                    // <table><tbody><tr>[<td>cell</b></td>... => <table><tbody><tr><td>[cell</td>...
                    if (self.startContainer[0].nodeType == KEN.NODE_ELEMENT &&
                        self.startContainer._4e_name() in nonCells
                        || self.endContainer[0].nodeType == KEN.NODE_ELEMENT &&
                        self.endContainer._4e_name() in nonCells) {
                        self.shrink(KER.SHRINK_ELEMENT, TRUE);
                    }

                    var bookmark = self.createBookmark(),
                    // Create marker tags for the start and end boundaries.
                        startNode = bookmark.startNode,
                        endNode;
                    if (!collapsed)
                        endNode = bookmark.endNode;

                    // Create the main range which will be used for the selection.
                    var ieRange = self.document.body.createTextRange();

                    // Position the range at the start boundary.
                    ieRange.moveToElementText(startNode[0]);
                    //跳过开始 bookmark 标签
                    ieRange.moveStart('character', 1);

                    if (endNode) {
                        // Create a tool range for the end.
                        var ieRangeEnd = self.document.body.createTextRange();
                        // Position the tool range at the end.
                        ieRangeEnd.moveToElementText(endNode[0]);
                        // Move the end boundary of the main range to match the tool range.
                        ieRange.setEndPoint('EndToEnd', ieRangeEnd);
                        ieRange.moveEnd('character', -1);
                    }
                    else {
                        // The isStartMarkerAlone logic comes from V2. It guarantees that the lines
                        // will expand and that the cursor will be blinking on the right place.
                        // Actually, we are using this flag just to avoid using this hack in all
                        // situations, but just on those needed.
                        var next = startNode[0].nextSibling;
                        while (next && !notWhitespaces(next)) {
                            next = next.nextSibling;
                        }
                        isStartMarkerAlone =
                            (
                                !( next && next.nodeValue && next.nodeValue.match(fillerTextRegex) )     // already a filler there?
                                    && ( forceExpand
                                    ||
                                    !startNode[0].previousSibling
                                    ||
                                    (
                                        startNode[0].previousSibling &&
                                            DOM._4e_name(startNode[0].previousSibling) == 'br'
                                        )
                                    )
                                );

                        // Append a temporary <span>&#65279;</span> before the selection.
                        // This is needed to avoid IE destroying selections inside empty
                        // inline elements, like <b></b> (#253).
                        // It is also needed when placing the selection right after an inline
                        // element to avoid the selection moving inside of it.
                        dummySpan = new Node(self.document.createElement('span'));
                        dummySpan.html('&#65279;');	// Zero Width No-Break Space (U+FEFF). See #1359.
                        dummySpan.insertBefore(startNode);
                        if (isStartMarkerAlone) {
                            // To expand empty blocks or line spaces after <br>, we need
                            // instead to have any char, which will be later deleted using the
                            // selection.
                            // \ufeff = Zero Width No-Break Space (U+FEFF). (#1359)
                            DOM.insertBefore(self.document.createTextNode('\ufeff'), startNode[0] || startNode);
                        }
                    }

                    // Remove the markers (reset the position, because of the changes in the DOM tree).
                    self.setStartBefore(startNode);
                    startNode._4e_remove();

                    if (collapsed) {
                        if (isStartMarkerAlone) {
                            // Move the selection start to include the temporary \ufeff.
                            ieRange.moveStart('character', -1);
                            ieRange.select();
                            // Remove our temporary stuff.
                            self.document.selection.clear();
                        } else
                            ieRange.select();
                        if (dummySpan) {
                            self.moveToPosition(dummySpan, KER.POSITION_BEFORE_START);
                            dummySpan._4e_remove();
                        }
                    }
                    else {
                        self.setEndBefore(endNode);
                        endNode._4e_remove();
                        ieRange.select();
                    }
                    // this.document.fire('selectionchange');
                };


    function getSelection(doc) {
        var sel = new KESelection(doc);
        return ( !sel || sel.isInvalid ) ? NULL : sel;
    }

    KESelection.getSelection = getSelection;

    /**
     * 监控选择区域变化
     * @param editor
     */
    function monitorAndFix(editor) {
        var doc = editor.document,
            win = DOM._4e_getWin(doc),
            body = new Node(doc.body),
            html = new Node(doc.documentElement);

        if (UA['ie']) {
            //ie 焦点管理不行 (ie9 也不行) ,编辑器 iframe 失去焦点，选择区域/光标位置也丢失了
            //ie中事件都是同步，focus();xx(); 会立即触发事件处理函数，然后再运行xx();

            // In IE6/7 the blinking cursor appears, but contents are
            // not editable. (#5634)
            // 终于和ck同步了，我也发现了这个bug，ck3.3.2解决
            if (//ie8 的 7 兼容模式
                KE.Utils.ieEngine < 8) {
                // The 'click' event is not fired when clicking the
                // scrollbars, so we can use it to check whether
                // the empty space following <body> has been clicked.
                html.on('click', function (evt) {
                    var t = new Node(evt.target);
                    if (t._4e_name() === "html") {
                        editor.getSelection().getNative().createRange().select();
                    }
                });
            }

            /**
             * 2012-01-11 借鉴 tinymce
             * 解决：ie 没有滚动条时，点击窗口空白区域，光标不能正确定位
             */
            (function () {
                var started,
                    bodyElem = body[0],
                    startRng;

                // Make HTML element unselectable since we are going to handle selection by hand
                doc.documentElement.unselectable = true;

                // Return range from point or null if it failed
                function rngFromPoint(x, y) {
                    var rng = bodyElem.createTextRange();

                    try {
                        rng['moveToPoint'](x, y);
                    } catch (ex) {
                        // IE sometimes throws and exception, so lets just ignore it
                        rng = null;
                    }

                    return rng;
                }

                // Removes listeners
                function endSelection() {
                    var rng = doc.selection.createRange();

                    // If the range is collapsed then use the last start range
                    if (startRng && !rng.item && rng.compareEndPoints('StartToEnd', rng) === 0) {
                        startRng.select();
                    }
                    Event.remove(doc, 'mouseup', endSelection);
                    Event.remove(doc, 'mousemove', selectionChange);
                    startRng = started = 0;
                    saveSelection(TRUE);
                }

                // Fires while the selection is changing
                function selectionChange(e) {
                    var pointRng;

                    // Check if the button is down or not
                    if (e.button) {
                        // Create range from mouse position
                        pointRng = rngFromPoint(e.pageX, e.pageY);

                        if (pointRng) {
                            // Check if pointRange is before/after selection then change the endPoint
                            if (pointRng.compareEndPoints('StartToStart', startRng) > 0)
                                pointRng.setEndPoint('StartToStart', startRng);
                            else
                                pointRng.setEndPoint('EndToEnd', startRng);

                            pointRng.select();
                        }
                    } else {
                        endSelection();
                    }
                }

                // ie 点击空白处光标不能定位到末尾
                // IE has an issue where you can't select/move the caret by clicking outside the body if the document is in standards mode
                Event.on(doc, "mousedown contextmenu", function (e) {
                    if (e.target === html[0]) {

                        if (started) {
                            endSelection();
                        }
                        // Detect vertical scrollbar, since IE will fire a mousedown on the scrollbar and have target set as HTML
                        if (html[0].scrollHeight > html[0].clientHeight) {
                            return;
                        }
                        S.log("fix ie cursor");
                        started = 1;
                        // Setup start position
                        startRng = rngFromPoint(e.pageX, e.pageY);
                        if (startRng) {
                            // Listen for selection change events
                            Event.on(doc, 'mouseup', endSelection);
                            Event.on(doc, 'mousemove', selectionChange);

                            win.focus();
                            startRng.select();
                        }
                    }
                });
            })();


            // Other browsers don't loose the selection if the
            // editor document loose the focus. In IE, we don't
            // have support for it, so we reproduce it here, other
            // than firing the selection change event.

            var savedRange,
                saveEnabled,
            // 2010-10-08 import from ckeditor 3.4.1
            // 点击(mousedown-focus-mouseup)，不保留原有的 selection
                restoreEnabled = TRUE;

            // Listening on document element ensures that
            // scrollbar is included. (#5280)
            // or body.on('mousedown')
            html.on('mousedown', function () {
                // Lock restore selection now, as we have
                // a followed 'click' event which introduce
                // new selection. (#5735)
                //点击时不要恢复了，点击就意味着原来的选择区域作废
                restoreEnabled = FALSE;
            });

            html.on('mouseup', function () {
                restoreEnabled = TRUE;
            });

            //事件顺序
            // 1.body mousedown
            // 2.html mousedown
            // body  blur
            // window blur
            // 3.body focusin
            // 4.body focus
            // 5.window focus
            // 6.body mouseup
            // 7.body mousedown
            // 8.body click
            // 9.html click
            // 10.doc click

            // "onfocusin" is fired before "onfocus". It makes it
            // possible to restore the selection before click
            // events get executed.
            body.on('focusin', function (evt) {
                var t = new Node(evt.target);
                // If there are elements with layout they fire this event but
                // it must be ignored to allow edit its contents #4682
                if (t._4e_name() != 'body')
                    return;

                // If we have saved a range, restore it at this
                // point.
                if (savedRange) {
                    // Well not break because of this.
                    try {
                        // S.log("body focusin");
                        // 如果不是 mousedown 引起的 focus
                        if (restoreEnabled) {
                            savedRange.select();
                        }
                    }
                    catch (e) {
                    }

                    savedRange = NULL;
                }
            });

            body.on('focus', function () {
                // S.log("body focus");
                // Enable selections to be saved.
                saveEnabled = TRUE;
                saveSelection();
            });

            body.on('beforedeactivate', function (evt) {
                // Ignore this event if it's caused by focus switch between
                // internal editable control type elements, e.g. layouted paragraph. (#4682)
                if (evt.relatedTarget)
                    return;

                // S.log("beforedeactivate");
                // Disable selections from being saved.
                saveEnabled = FALSE;
                restoreEnabled = TRUE;
            });

            // IE before version 8 will leave cursor blinking inside the document after
            // editor blurred unless we clean up the selection. (#4716)
            // if (UA['ie'] < 8) {
            editor.on('blur', function () {
                // 把选择区域与光标清除
                // Try/Catch to avoid errors if the editor is hidden. (#6375)
                // S.log("blur");
                try {
                    var el = document.documentElement || document.body;
                    var top = el.scrollTop, left = el.scrollLeft;
                    doc && doc.selection.empty();
                    //in case if window scroll to editor
                    el.scrollTop = top;
                    el.scrollLeft = left;
                } catch (e) {
                }
            });
            /*
             Event.on(body, 'blur', function() {
             S.log("body blur");
             });

             Event.on(DOM._4e_getWin(doc), 'focus', function() {
             S.log("win focus");
             });
             Event.on(doc, 'click', function() {
             S.log("doc click");
             });
             body.on('click', function() {
             S.log("body click");
             });
             html.on('click', function() {
             S.log("html click");
             });*/
            //}

            // IE fires the "selectionchange" event when clicking
            // inside a selection. We don't want to capture that.
            body.on('mousedown', function () {
                // S.log("body mousedown");
                saveEnabled = FALSE;
            });
            body.on('mouseup', function () {
                // S.log("body mouseup");
                saveEnabled = TRUE;
                setTimeout(function () {
                    saveSelection(TRUE);
                }, 0);
            });

            /**
             *
             * @param {boolean=} testIt
             */
            function saveSelection(testIt) {
                //S.log("saveSelection");
                if (saveEnabled) {
                    var doc = editor.document,
                        sel = editor.getSelection(),
                        type = sel && sel.getType(),
                        nativeSel = sel && doc.selection;

                    // There is a very specific case, when clicking
                    // inside a text selection. In that case, the
                    // selection collapses at the clicking point,
                    // but the selection object remains in an
                    // unknown state, making createRange return a
                    // range at the very start of the document. In
                    // such situation we have to test the range, to
                    // be sure it's valid.
                    // 右键时，若前一个操作选中，则该次一直为None
                    if (testIt && nativeSel && type == KES.SELECTION_NONE) {
                        // The "InsertImage" command can be used to
                        // test whether the selection is good or not.
                        // If not, it's enough to give some time to
                        // IE to put things in order for us.
                        if (!doc['queryCommandEnabled']('InsertImage')) {
                            setTimeout(function () {
                                //S.log("retry");
                                saveSelection(TRUE);
                            }, 50);
                            return;
                        }
                    }

                    // Avoid saving selection from within text input. (#5747)
                    var parentTag;
                    if (nativeSel && nativeSel.type && nativeSel.type != 'Control'
                        && ( parentTag = nativeSel.createRange() )
                        && ( parentTag = parentTag.parentElement() )
                        && ( parentTag = parentTag.nodeName )
                        && parentTag.toLowerCase() in { input:1, textarea:1 }) {
                        return;
                    }
                    savedRange = nativeSel && sel.getRanges()[ 0 ];
                    // 同时检测，不同则 editor 触发 selectionChange
                    editor._monitor();
                }
            }

            body.on('keydown', function () {
                saveEnabled = FALSE;
            });
            body.on('keyup', function () {
                saveEnabled = TRUE;
                setTimeout(function () {
                    saveSelection();
                }, 0);
            });
        } else {
            // In other browsers, we make the selection change
            // check based on other events, like clicks or keys
            // press.
            Event.on(doc, 'mouseup', editor._monitor, editor);
            Event.on(doc, 'keyup', editor._monitor, editor);
        }

        // Matching an empty paragraph at the end of document.
        // 注释也要排除掉
        var emptyParagraphRegexp =
            /\s*<(p|div|address|h\d|center)[^>]*>\s*(?:<br[^>]*>|&nbsp;|\u00A0|&#160;|(<!--[\s\S]*?-->))?\s*(:?<\/\1>)?(?=\s*$|<\/body>)/gi;


        function isBlankParagraph(block) {
            return block._4e_outerHtml().match(emptyParagraphRegexp);
        }

        var isNotWhitespace = KE.Walker.whitespaces(TRUE),
            isNotBookmark = KE.Walker.bookmark(FALSE, TRUE);
        //除去注释和空格的下一个有效元素
        var nextValidEl = function (node) {
            return isNotWhitespace(node) && node && node[0].nodeType != 8
        };

        // 光标可以不能放在里面
        function cannotCursorPlaced(element) {
            var dtd = KE.XHTML_DTD;
            return element._4e_isBlockBoundary() && dtd.$empty[ element._4e_name() ];
        }

        function isNotEmpty(node) {
            return isNotWhitespace(node) && isNotBookmark(node);
        }

        /**
         * 如果选择了body下面的直接inline元素，则新建p
         */
        editor.on("selectionChange", function (ev) {
            var path = ev.path,
                selection = ev.selection,
                range = selection && selection.getRanges()[0],
                blockLimit = path.blockLimit;

            // Fix gecko link bug, when a link is placed at the end of block elements there is
            // no way to move the caret behind the link. This fix adds a bogus br element after the link
            // kissy-editor #12
            if (UA['gecko']) {
                var pathBlock = path.block || path.blockLimit,
                    lastNode = pathBlock && pathBlock._4e_last(isNotEmpty);
                if (pathBlock
                    // style as block
                    && pathBlock._4e_isBlockBoundary()
                    // lastNode is not block
                    && !( lastNode && lastNode[0].nodeType == 1 && lastNode._4e_isBlockBoundary() )
                    // not pre
                    && pathBlock._4e_name() != 'pre'
                    // does not have bogus
                    && !pathBlock._4e_getBogus()) {
                    pathBlock._4e_appendBogus();
                }
            }

            if (!range ||
                !range.collapsed ||
                path.block) {
                return;
            }

            // 裸的光标出现在 body 里面
            if (blockLimit._4e_name() == "body") {
                var fixedBlock = range.fixBlock(TRUE, "p");
                if (fixedBlock &&
                    // https://dev.ckeditor.com/ticket/8550
                    // 新加的 p 在 body 最后，那么不要删除
                    // <table><td/></table>^ => <table><td/></table><p>^</p>
                    fixedBlock[0] != body[0].lastChild) {
                    // firefox选择区域变化时自动添加空行，不要出现裸的text
                    if (isBlankParagraph(fixedBlock)) {
                        var element = fixedBlock._4e_next(nextValidEl);
                        if (element &&
                            element[0].nodeType == KEN.NODE_ELEMENT &&
                            !cannotCursorPlaced[ element ]) {
                            range.moveToElementEditablePosition(element);
                            fixedBlock._4e_remove();
                        } else {
                            element = fixedBlock._4e_previous(nextValidEl);
                            if (element &&
                                element[0].nodeType == KEN.NODE_ELEMENT &&
                                !cannotCursorPlaced[element]) {
                                range.moveToElementEditablePosition(element,
                                    // 空行的话还是要移到开头的
                                    isBlankParagraph(element) ? FALSE : TRUE);
                                fixedBlock._4e_remove();
                            } else {
                                // 否则的话，就在文章中间添加空行了！
                            }
                        }
                    }
                }
                range.select();
                // 选择区域变了，通知其他插件更新状态
                editor.notifySelectionChange();
            }

            /**
             *  当 table pre div 是 body 最后一个元素时，鼠标没法移到后面添加内容了
             *  解决：增加新的 p
             */
            var lastRange = new KE.Range(doc),
                lastPath, editBlock;
            // 最后的编辑地方
            lastRange
                .moveToElementEditablePosition(body,
                TRUE);
            lastPath = new KE.ElementPath(lastRange.startContainer);
            // 不位于 <body><p>^</p></body>
            if (lastPath.blockLimit._4e_name() !== 'body') {
                editBlock = new Node(doc.createElement('p')).appendTo(body);
                if (!UA['ie']) {
                    editBlock._4e_appendBogus();
                }
            }
        });
    }

    KE.Selection = KESelection;

    KE.on("instanceCreated", function (ev) {
        var editor = ev.editor;
        // 1. 选择区域变化时各个浏览器的奇怪修复
        // 2. 触发 selectionChange 事件
        monitorAndFix(editor);
    });
});
/**
 * modified from ckeditor for kissy editor,use style to gen element and wrap range's elements
 * @author <yiminghe@gmail.com>
 */
/*
 Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.html or http://ckeditor.com/license
 */
KISSY.Editor.add("styles", function (KE) {

    var TRUE = true,
        FALSE = false,
        NULL = null,
        S = KISSY,
        Utils = KE.Utils,
        DOM = S.DOM,
        /**
         * enum for style type
         * @enum {number}
         */
            KEST = {
            STYLE_BLOCK:1,
            STYLE_INLINE:2,
            STYLE_OBJECT:3
        },
        KER = KE.RANGE,
        KESelection = KE.Selection,
        KEN = KE.NODE,
        KEP = KE.POSITION,
        KERange = KE.Range,
        //Walker = KE.Walker,
        Node = S.Node,
        UA = S.UA,
        ElementPath = KE.ElementPath,
        blockElements = {
            "address":1,
            "div":1,
            "h1":1,
            "h2":1,
            "h3":1,
            "h4":1,
            "h5":1,
            "h6":1,
            "p":1,
            "pre":1
        },
        objectElements = {
            //why? a should be same to inline? 但是不能互相嵌套
            //a:1,
            "embed":1,
            "hr":1,
            "img":1,
            "li":1,
            "object":1,
            "ol":1,
            "table":1,
            "td":1,
            "tr":1,
            "th":1,
            "ul":1,
            "dl":1,
            "dt":1,
            "dd":1,
            "form":1
        },
        semicolonFixRegex = /\s*(?:;\s*|$)/g,
        varRegex = /#\((.+?)\)/g;

    KE['STYLE'] = KEST;

    function notBookmark(node) {
        //only get attributes on element nodes by kissy
        //when textnode attr() return undefined ,wonderful !!!
        return !node.attr("_ke_bookmark");
    }

    function replaceVariables(list, variablesValues) {
        for (var item in list) {
            if (!list.hasOwnProperty(item)) continue;
            if (S.isString(list[ item ])) {
                list[ item ] = list[ item ].replace(varRegex, function (match, varName) {
                    return variablesValues[ varName ];
                });
            } else {
                replaceVariables(list[ item ], variablesValues);
            }
        }
    }

    /**
     * @constructor
     * @param styleDefinition {Object}
     * @param variablesValues {Object}
     */
    function KEStyle(styleDefinition, variablesValues) {
        if (variablesValues) {
            styleDefinition = S.clone(styleDefinition);
            replaceVariables(styleDefinition, variablesValues);
        }

        var element = this["element"] = this.element = ( styleDefinition["element"] || '*' ).toLowerCase();

        this["type"] = this.type = ( element == '#' || blockElements[ element ] ) ?
            KEST.STYLE_BLOCK
            : objectElements[ element ] ?
            KEST.STYLE_OBJECT : KEST.STYLE_INLINE;

        this._ = {
            "definition":styleDefinition
        };
    }

    /**
     *
     * @param {Document} document
     * @param {boolean=} remove
     */
    function applyStyle(document, remove) {
        // Get all ranges from the selection.
        var self = this,
            func = remove ? self.removeFromRange : self.applyToRange;
        // Apply the style to the ranges.
        //ie select 选中期间document得不到range
        document.body.focus();

        var selection = new KESelection(document);
        // Bookmark the range so we can re-select it after processing.
        var ranges = selection.getRanges();
        for (var i = 0; i < ranges.length; i++) {
            //格式化后，range进入格式标签内
            func.call(self, ranges[ i ]);
        }
        selection.selectRanges(ranges);
    }

    KEStyle.prototype = {
        apply:function (document) {
            applyStyle.call(this, document, FALSE);
        },

        remove:function (document) {
            applyStyle.call(this, document, TRUE);
        },

        applyToRange:function (range) {
            var self = this;
            return ( self.applyToRange =
                this.type == KEST.STYLE_INLINE ?
                    applyInlineStyle
                    : self.type == KEST.STYLE_BLOCK ?
                    applyBlockStyle
                    : self.type == KEST.STYLE_OBJECT ?
                    NULL
                    //yiminghe note:no need!
                    //applyObjectStyle
                    : NULL ).call(self, range);
        },

        removeFromRange:function (range) {
            var self = this;
            return ( self.removeFromRange =
                self.type == KEST.STYLE_INLINE ?
                    removeInlineStyle
                    : NULL ).call(self, range);
        },

//        applyToObject : function(element) {
//            setupElement(element, this);
//        },
        // Checks if an element, or any of its attributes, is removable by the
        // current style definition.
        checkElementRemovable:function (element, fullMatch) {
            if (!element)
                return FALSE;

            var def = this._.definition,
                attribs, styles;

            // If the element name is the same as the style name.
            if (element._4e_name() == this.element) {
                // If no attributes are defined in the element.
                if (!fullMatch && !element._4e_hasAttributes())
                    return TRUE;

                attribs = getAttributesForComparison(def);

                if (attribs["_length"]) {
                    for (var attName in attribs) {

                        if (attName == '_length')
                            continue;

                        if (attribs.hasOwnProperty(attName)) {

                            var elementAttr = element.attr(attName) || '';
                            if (attName == 'style' ?
                                compareCssText(attribs[ attName ],
                                    normalizeCssText(elementAttr, FALSE))
                                : attribs[ attName ] == elementAttr) {
                                if (!fullMatch)
                                    return TRUE;
                            }
                            else if (fullMatch)
                                return FALSE;
                        }


                    }
                    if (fullMatch)
                        return TRUE;
                }
                else
                    return TRUE;
            }

            // Check if the element can be somehow overriden.
            var overrides = getOverrides(this),
                override = overrides[ element._4e_name() ] || overrides["*"];

            if (override) {
                // If no attributes have been defined, remove the element.
                if (!( attribs = override.attributes )
                    &&
                    !( styles = override.styles)
                    )
                    return TRUE;
                if (attribs) {
                    for (var i = 0; i < attribs.length; i++) {
                        attName = attribs[i][0];
                        var actualAttrValue = element.attr(attName);
                        if (actualAttrValue) {
                            var attValue = attribs[i][1];
                            // Remove the attribute if:
                            //    - The override definition value is NULL;
                            //    - The override definition value is a string that
                            //      matches the attribute value exactly.
                            //    - The override definition value is a regex that
                            //      has matches in the attribute value.
                            if (attValue === NULL ||
                                ( typeof attValue == 'string'
                                    && actualAttrValue == attValue ) ||
                                attValue.test && attValue.test(actualAttrValue))
                                return TRUE;
                        }
                    }
                }
                if (styles) {
                    for (i = 0; i < styles.length; i++) {
                        var styleName = styles[i][0];
                        var actualStyleValue = element.css(styleName);
                        if (actualStyleValue) {
                            var styleValue = styles[i][1];
                            if (styleValue === NULL
                                //inherit wildcard !
                                //|| styleValue == "inherit"
                                || ( typeof styleValue == 'string'
                                && actualStyleValue == styleValue ) ||
                                styleValue.test && styleValue.test(actualStyleValue))
                                return TRUE;
                        }
                    }
                }
            }
            return FALSE;
        },

        /**
         * Get the style state inside an element path. Returns "TRUE" if the
         * element is active in the path.
         */
        checkActive:function (elementPath) {
            switch (this.type) {
                case KEST.STYLE_BLOCK :
                    return this.checkElementRemovable(elementPath.block
                        || elementPath.blockLimit, TRUE);

                case KEST.STYLE_OBJECT :
                case KEST.STYLE_INLINE :

                    var elements = elementPath.elements;

                    for (var i = 0, element; i < elements.length; i++) {
                        element = elements[ i ];

                        if (this.type == KEST.STYLE_INLINE
                            && ( DOM._4e_equals(element, elementPath.block)
                            || DOM._4e_equals(element, elementPath.blockLimit) ))
                            continue;

                        if (this.type == KEST.STYLE_OBJECT
                            && !( element._4e_name() in objectElements ))
                            continue;

                        if (this.checkElementRemovable(element, TRUE))
                            return TRUE;
                    }
            }
            return FALSE;
        }

    };

    KEStyle.getStyleText = function (styleDefinition) {
        // If we have already computed it, just return it.
        var stylesDef = styleDefinition._ST;
        if (stylesDef)
            return stylesDef;

        stylesDef = styleDefinition["styles"];

        // Builds the StyleText.
        var stylesText = ( styleDefinition["attributes"]
            && styleDefinition["attributes"][ 'style' ] ) || '',
            specialStylesText = '';

        if (stylesText.length)
            stylesText = stylesText.replace(semicolonFixRegex, ';');

        for (var style in stylesDef) {

            if (stylesDef.hasOwnProperty(style)) {

                var styleVal = stylesDef[ style ],
                    text = ( style + ':' + styleVal ).replace(semicolonFixRegex, ';');

                // Some browsers don't support 'inherit' property value, leave them intact. (#5242)
                if (styleVal == 'inherit')
                    specialStylesText += text;
                else
                    stylesText += text;
            }
        }

        // Browsers make some changes to the style when applying them. So, here
        // we normalize it to the browser format.
        if (stylesText.length)
            stylesText = normalizeCssText(stylesText);

        stylesText += specialStylesText;

        // Return it, saving it to the next request.
        return ( styleDefinition._ST = stylesText );
    };

    function getElement(style, targetDocument, element) {
        var el,
            //def = style._.definition,
            elementName = style["element"];

        // The "*" element name will always be a span for this function.
        if (elementName == '*')
            elementName = 'span';

        // Create the element.
        el = new Node(targetDocument.createElement(elementName));

        // #6226: attributes should be copied before the new ones are applied
        if (element)
            element._4e_copyAttributes(el);

        return setupElement(el, style);
    }

    function setupElement(el, style) {
        var def = style._["definition"],
            attributes = def["attributes"],
            styles = KEStyle.getStyleText(def);

        // Assign all defined attributes.
        if (attributes) {
            for (var att in attributes) {
                if (attributes.hasOwnProperty(att)) {
                    el.attr(att, attributes[ att ]);
                }
            }
        }

        // Assign all defined styles.

        if (styles)
            el[0].style.cssText = styles;

        return el;
    }

    function applyBlockStyle(range) {
        // Serializible bookmarks is needed here since
        // elements may be merged.
        var bookmark = range.createBookmark(TRUE),
            iterator = range.createIterator();
        iterator.enforceRealBlocks = TRUE;

        // make recognize <br /> tag as a separator in ENTER_BR mode (#5121)
        //if (this._.enterMode)
        iterator.enlargeBr = TRUE;//( this._.enterMode != CKEDITOR.ENTER_BR );

        var block, doc = range.document;
        // Only one =
        while (( block = iterator.getNextParagraph() )) {
            var newBlock = getElement(this, doc, block);
            replaceBlock(block, newBlock);
        }
        range.moveToBookmark(bookmark);
    }

    // Wrapper function of String::replace without considering of head/tail bookmarks nodes.
    function replace(str, regexp, replacement) {
        var headBookmark = '',
            tailBookmark = '';

        str = str.replace(/(^<span[^>]+_ke_bookmark.*?\/span>)|(<span[^>]+_ke_bookmark.*?\/span>$)/gi,
            function (str, m1, m2) {
                m1 && ( headBookmark = m1 );
                m2 && ( tailBookmark = m2 );
                return '';
            });
        return headBookmark + str.replace(regexp, replacement) + tailBookmark;
    }

    /**
     * Converting from a non-PRE block to a PRE block in formatting operations.
     */
    function toPre(block, newBlock) {
        // First trim the block content.
        var preHtml = block.html();

        // 1. Trim head/tail spaces, they're not visible.
        preHtml = replace(preHtml, /(?:^[ \t\n\r]+)|(?:[ \t\n\r]+$)/g, '');
        // 2. Delete ANSI whitespaces immediately before and after <BR> because
        //    they are not visible.
        preHtml = preHtml.replace(/[ \t\r\n]*(<br[^>]*>)[ \t\r\n]*/gi, '$1');
        // 3. Compress other ANSI whitespaces since they're only visible as one
        //    single space previously.
        // 4. Convert &nbsp; to spaces since &nbsp; is no longer needed in <PRE>.
        preHtml = preHtml.replace(/([ \t\n\r]+|&nbsp;)/g, ' ');
        // 5. Convert any <BR /> to \n. This must not be done earlier because
        //    the \n would then get compressed.
        preHtml = preHtml.replace(/<br\b[^>]*>/gi, '\n');

        // Krugle: IE normalizes innerHTML to <pre>, breaking whitespaces.
        if (UA['ie']) {
            var temp = block[0].ownerDocument.createElement('div');
            temp.appendChild(newBlock[0]);
            newBlock[0].outerHTML = '<pre>' + preHtml + '</pre>';
            newBlock = new Node(temp.firstChild);
            newBlock._4e_remove();
        }
        else
            newBlock.html(preHtml);

        return newBlock;
    }

    /**
     * Split into multiple <pre> blocks separated by double line-break.
     * @param preBlock
     */
    function splitIntoPres(preBlock) {
        // Exclude the ones at header OR at tail,
        // and ignore bookmark content between them.
        var duoBrRegex = /(\S\s*)\n(?:\s|(<span[^>]+_ck_bookmark.*?\/span>))*\n(?!$)/gi,
            //blockName = preBlock._4e_name(),
            splittedHtml = replace(preBlock._4e_outerHtml(),
                duoBrRegex,
                function (match, charBefore, bookmark) {
                    return charBefore + '</pre>' + bookmark + '<pre>';
                });

        var pres = [];
        splittedHtml.replace(/<pre\b.*?>([\s\S]*?)<\/pre>/gi,
            function (match, preContent) {
                pres.push(preContent);
            });
        return pres;
    }

    // Replace the original block with new one, with special treatment
    // for <pre> blocks to make sure content format is well preserved, and merging/splitting adjacent
    // when necessary.(#3188)
    function replaceBlock(block, newBlock) {
        var newBlockIsPre = newBlock._4e_name == ('pre'),
            blockIsPre = block._4e_name == ('pre'),
            isToPre = newBlockIsPre && !blockIsPre,
            isFromPre = !newBlockIsPre && blockIsPre;

        if (isToPre)
            newBlock = toPre(block, newBlock);
        else if (isFromPre)
        // Split big <pre> into pieces before start to convert.
            newBlock = fromPres(splitIntoPres(block), newBlock);
        else
            block._4e_moveChildren(newBlock);

        block[0].parentNode.replaceChild(newBlock[0], block[0]);
        if (newBlockIsPre) {
            // Merge previous <pre> blocks.
            mergePre(newBlock);
        }
    }

    /**
     * Merge a <pre> block with a previous sibling if available.
     */
    function mergePre(preBlock) {
        var previousBlock;
        if (!( ( previousBlock = preBlock._4e_previousSourceNode(TRUE, KEN.NODE_ELEMENT) )
            && previousBlock._4e_name() == 'pre' ))
            return;

        // Merge the previous <pre> block contents into the current <pre>
        // block.
        //
        // Another thing to be careful here is that currentBlock might contain
        // a '\n' at the beginning, and previousBlock might contain a '\n'
        // towards the end. These new lines are not normally displayed but they
        // become visible after merging.
        var mergedHtml = replace(previousBlock.html(), /\n$/, '') + '\n\n' +
            replace(preBlock.html(), /^\n/, '');

        // Krugle: IE normalizes innerHTML from <pre>, breaking whitespaces.
        if (UA['ie'])
            preBlock[0].outerHTML = '<pre>' + mergedHtml + '</pre>';
        else
            preBlock.html(mergedHtml);

        previousBlock._4e_remove();
    }

    /**
     * Converting a list of <pre> into blocks with format well preserved.
     */
    function fromPres(preHtmls, newBlock) {
        var docFrag = newBlock[0].ownerDocument.createDocumentFragment();
        for (var i = 0; i < preHtmls.length; i++) {
            var blockHtml = preHtmls[ i ];

            // 1. Trim the first and last line-breaks immediately after and before <pre>,
            // they're not visible.
            blockHtml = blockHtml.replace(/(\r\n|\r)/g, '\n');
            blockHtml = replace(blockHtml, /^[ \t]*\n/, '');
            blockHtml = replace(blockHtml, /\n$/, '');
            // 2. Convert spaces or tabs at the beginning or at the end to &nbsp;
            blockHtml = replace(blockHtml, /^[ \t]+|[ \t]+$/g, function (match, offset) {
                if (match.length == 1)    // one space, preserve it
                    return '&nbsp;';
                else if (!offset)        // beginning of block
                    return new Array(match.length).join('&nbsp;') + ' ';
                else                // end of block
                    return ' ' + new Array(match.length).join('&nbsp;');
            });

            // 3. Convert \n to <BR>.
            // 4. Convert contiguous (i.e. non-singular) spaces or tabs to &nbsp;
            blockHtml = blockHtml.replace(/\n/g, '<br>');
            blockHtml = blockHtml.replace(/[ \t]{2,}/g,
                function (match) {
                    return new Array(match.length).join('&nbsp;') + ' ';
                });

            var newBlockClone = newBlock._4e_clone();
            newBlockClone.html(blockHtml);
            docFrag.appendChild(newBlockClone[0]);
        }
        return docFrag;
    }

    /**
     *
     * @param range
     */
    function applyInlineStyle(range) {
        var self = this,
            document = range.document;

        if (range.collapsed) {
            // Create the element to be inserted in the DOM.
            var collapsedElement = getElement(this, document, undefined);
            // Insert the empty element into the DOM at the range position.
            range.insertNode(collapsedElement);
            // Place the selection right inside the empty element.
            range.moveToPosition(collapsedElement, KER.POSITION_BEFORE_END);
            return;
        }
        var elementName = this["element"],
            def = this._["definition"],
            isUnknownElement,
            // Get the DTD definition for the element. Defaults to "span".
            dtd = KE.XHTML_DTD[ elementName ];
        if (!dtd) {
            isUnknownElement = TRUE;
            dtd = KE.XHTML_DTD["span"];
        }

        // Bookmark the range so we can re-select it after processing.
        var bookmark = range.createBookmark();

        // Expand the range.

        range.enlarge(KER.ENLARGE_ELEMENT);
        range.trim();
        // Get the first node to be processed and the last, which concludes the
        // processing.
        var boundaryNodes = range.createBookmark(),
            firstNode = boundaryNodes.startNode,
            lastNode = boundaryNodes.endNode,
            currentNode = firstNode,
            styleRange;

        while (currentNode && currentNode[0]) {
            var applyStyle = FALSE;

            if (DOM._4e_equals(currentNode, lastNode)) {
                currentNode = NULL;
                applyStyle = TRUE;
            }
            else {
                var nodeType = currentNode[0].nodeType,
                    nodeName = nodeType == KEN.NODE_ELEMENT ?
                        currentNode._4e_name() : NULL;

                if (nodeName && currentNode.attr('_ke_bookmark')) {
                    currentNode = currentNode._4e_nextSourceNode(TRUE);
                    continue;
                }

                // Check if the current node can be a child of the style element.
                if (!nodeName || ( dtd[ nodeName ]
                    && ( currentNode._4e_position(lastNode) |
                    ( KEP.POSITION_PRECEDING |
                        KEP.POSITION_IDENTICAL |
                        KEP.POSITION_IS_CONTAINED) )
                    == ( KEP.POSITION_PRECEDING +
                    KEP.POSITION_IDENTICAL +
                    KEP.POSITION_IS_CONTAINED )
                    && ( !def["childRule"] || def["childRule"](currentNode) ) )) {
                    var currentParent = currentNode.parent();


                    // hack for
                    // 1<a href='http://www.taobao.com'>2</a>3
                    // select all ,set link to http://www.ckeditor.com
                    // expect => <a href='http://www.ckeditor.com'>123</a> (same with tinymce)
                    // but now => <a href="http://www.ckeditor.com">1</a>
                    // <a href="http://www.taobao.com">2</a>
                    // <a href="http://www.ckeditor.com">3</a>
                    // http://dev.ckeditor.com/ticket/8470
                    if (currentParent &&
                        elementName == "a" &&
                        currentParent._4e_name() == elementName) {
                        var tmpANode = getElement(self, document, undefined);
                        currentParent._4e_moveChildren(tmpANode);
                        currentParent[0].parentNode.replaceChild(tmpANode[0], currentParent[0]);
                        tmpANode._4e_mergeSiblings();
                    }

                    // Check if the style element can be a child of the current
                    // node parent or if the element is not defined in the DTD.
                    else if (currentParent && currentParent[0]
                        && ( ( KE.XHTML_DTD[currentParent._4e_name()] ||
                        KE.XHTML_DTD["span"] )[ elementName ] ||
                        isUnknownElement )
                        && ( !def["parentRule"] || def["parentRule"](currentParent) )) {
                        // This node will be part of our range, so if it has not
                        // been started, place its start right before the node.
                        // In the case of an element node, it will be included
                        // only if it is entirely inside the range.
                        if (!styleRange &&
                            ( !nodeName
                                || !KE.XHTML_DTD.$removeEmpty[ nodeName ]
                                || ( currentNode._4e_position(lastNode) |
                                ( KEP.POSITION_PRECEDING |
                                    KEP.POSITION_IDENTICAL |
                                    KEP.POSITION_IS_CONTAINED ))
                                ==
                                ( KEP.POSITION_PRECEDING +
                                    KEP.POSITION_IDENTICAL +
                                    KEP.POSITION_IS_CONTAINED )
                                )) {
                            styleRange = new KERange(document);
                            styleRange.setStartBefore(currentNode);
                        }

                        // Non element nodes, or empty elements can be added
                        // completely to the range.
                        if (nodeType == KEN.NODE_TEXT ||
                            ( nodeType == KEN.NODE_ELEMENT &&
                                !currentNode[0].childNodes.length )) {
                            var includedNode = currentNode,
                                parentNode = null;

                            // This node is about to be included completelly, but,
                            // if this is the last node in its parent, we must also
                            // check if the parent itself can be added completelly
                            // to the range.
                            //2010-11-18 fix ; http://dev.ckeditor.com/ticket/6687
                            //<span><book/>123<book/></span> 直接越过末尾 <book/>

                            // If the included node still is the last node in its
                            // parent, it means that the parent can't be included
                            // in this style DTD, so apply the style immediately.
                            while (
                                (applyStyle = !includedNode._4e_next(notBookmark))
                                    && ( (parentNode = includedNode.parent()) &&
                                    dtd[ parentNode._4e_name() ] )
                                    && ( parentNode._4e_position(firstNode) |
                                    KEP.POSITION_FOLLOWING |
                                    KEP.POSITION_IDENTICAL |
                                    KEP.POSITION_IS_CONTAINED) ==
                                    ( KEP.POSITION_FOLLOWING +
                                        KEP.POSITION_IDENTICAL +
                                        KEP.POSITION_IS_CONTAINED )
                                    && ( !def["childRule"] || def["childRule"](parentNode) )) {
                                includedNode = parentNode;
                            }

                            styleRange.setEndAfter(includedNode);

                        }
                    }
                    else
                        applyStyle = TRUE;
                }
                else
                    applyStyle = TRUE;

                // Get the next node to be processed.
                currentNode = currentNode._4e_nextSourceNode();
            }

            // Apply the style if we have something to which apply it.
            if (applyStyle && styleRange && !styleRange.collapsed) {
                // Build the style element, based on the style object definition.
                var styleNode = getElement(self, document, undefined),

                    // Get the element that holds the entire range.
                    parent = styleRange.getCommonAncestor();


                var removeList = {
                    styles:{},
                    attrs:{},
                    // Styles cannot be removed.
                    blockedStyles:{},
                    // Attrs cannot be removed.
                    blockedAttrs:{}
                };

                var attName, styleName = null, value;

                // Loop through the parents, removing the redundant attributes
                // from the element to be applied.
                while (styleNode && parent && styleNode[0] && parent[0]) {
                    if (parent._4e_name() == elementName) {
                        for (attName in def.attributes) {

                            if (def.attributes.hasOwnProperty(attName)) {


                                if (removeList.blockedAttrs[ attName ]
                                    || !( value = parent.attr(styleName) ))
                                    continue;

                                if (styleNode.attr(attName) == value) {
                                    //removeList.attrs[ attName ] = 1;
                                    styleNode.removeAttr(attName);
                                }
                                else
                                    removeList.blockedAttrs[ attName ] = 1;
                            }


                        }
                        //bug notice add by yiminghe@gmail.com
                        //<span style="font-size:70px"><span style="font-size:30px">xcxx</span></span>
                        //下一次格式xxx为70px
                        //var exit = FALSE;
                        for (styleName in def.styles) {
                            if (def.styles.hasOwnProperty(styleName)) {

                                if (removeList.blockedStyles[ styleName ]
                                    || !( value = parent._4e_style(styleName) ))
                                    continue;

                                if (styleNode._4e_style(styleName) == value) {
                                    //removeList.styles[ styleName ] = 1;
                                    styleNode._4e_style(styleName, "");
                                }
                                else
                                    removeList.blockedStyles[ styleName ] = 1;
                            }

                        }

                        if (!styleNode._4e_hasAttributes()) {
                            styleNode = NULL;
                            break;
                        }
                    }

                    parent = parent.parent();
                }

                if (styleNode) {
                    // Move the contents of the range to the style element.
                    styleNode[0].appendChild(styleRange.extractContents());

                    // Here we do some cleanup, removing all duplicated
                    // elements from the style element.
                    removeFromInsideElement(self, styleNode);

                    // Insert it into the range position (it is collapsed after
                    // extractContents.
                    styleRange.insertNode(styleNode);

                    // Let's merge our new style with its neighbors, if possible.
                    styleNode._4e_mergeSiblings();

                    // As the style system breaks text nodes constantly, let's normalize
                    // things for performance.
                    // With IE, some paragraphs get broken when calling normalize()
                    // repeatedly. Also, for IE, we must normalize body, not documentElement.
                    // IE is also known for having a "crash effect" with normalize().
                    // We should try to normalize with IE too in some way, somewhere.
                    if (!UA['ie'])
                        styleNode[0].normalize();
                }
                // Style already inherit from parents, left just to clear up any internal overrides. (#5931)
                /**
                 * from koubei
                 *1.输入ab
                 2.ctrl-a 设置字体大小 x
                 3.选中b设置字体大小 y
                 4.保持选中b,设置字体大小 x
                 exptected: b 大小为 x
                 actual: b 大小为 y
                 */
                else {
                    styleNode = new Node(document.createElement("span"));
                    styleNode[0].appendChild(styleRange.extractContents());
                    styleRange.insertNode(styleNode);
                    removeFromInsideElement(self, styleNode);
                    styleNode._4e_remove(true);
                }

                // Style applied, let's release the range, so it gets
                // re-initialization in the next loop.
                styleRange = NULL;
            }
        }

        firstNode._4e_remove();
        lastNode._4e_remove();
        range.moveToBookmark(bookmark);
        // Minimize the result range to exclude empty text nodes. (#5374)
        range.shrink(KER.SHRINK_TEXT);

    }

    /**
     *
     * @param range
     */
    function removeInlineStyle(range) {
        /*
         * Make sure our range has included all "collpased" parent inline nodes so
         * that our operation logic can be simpler.
         */
        range.enlarge(KER.ENLARGE_ELEMENT);

        var bookmark = range.createBookmark(),
            startNode = bookmark.startNode;

        if (range.collapsed) {

            var startPath = new ElementPath(startNode.parent()),
                // The topmost element in elementspatch which we should jump out of.
                boundaryElement;


            for (var i = 0, element; i < startPath.elements.length
                && ( element = startPath.elements[i] ); i++) {
                /*
                 * 1. If it's collaped inside text nodes, try to remove the style from the whole element.
                 *
                 * 2. Otherwise if it's collapsed on element boundaries, moving the selection
                 *  outside the styles instead of removing the whole tag,
                 *  also make sure other inner styles were well preserverd.(#3309)
                 */
                if (element == startPath.block ||
                    element == startPath.blockLimit)
                    break;
                if (this.checkElementRemovable(element)) {
                    var endOfElement = range.checkBoundaryOfElement(element, KER.END),
                        startOfElement = !endOfElement &&
                            range.checkBoundaryOfElement(element, KER.START);
                    if (startOfElement || endOfElement) {
                        boundaryElement = element;
                        boundaryElement.match = startOfElement ? 'start' : 'end';
                    } else {
                        /*
                         * Before removing the style node, there may be a sibling to the style node
                         * that's exactly the same to the one to be removed. To the user, it makes
                         * no difference that they're separate entities in the DOM tree. So, merge
                         * them before removal.
                         */
                        element._4e_mergeSiblings();
                        //yiminghe:note,bug for ckeditor
                        //qc #3700 for chengyu(yiminghe)
                        //从word复制过来的已编辑文本无法使用粗体和斜体等功能取消
                        if (element._4e_name() != this.element) {
                            var _overrides = getOverrides(this);
                            removeOverrides(element,
                                _overrides[ element._4e_name() ] || _overrides["*"]);
                        } else {
                            removeFromElement(this, element);
                        }

                    }
                }
            }

            // Re-create the style tree after/before the boundary element,
            // the replication start from bookmark start node to define the
            // new range.
            if (boundaryElement && boundaryElement[0]) {
                var clonedElement = startNode;
                for (i = 0; ; i++) {
                    var newElement = startPath.elements[ i ];
                    if (DOM._4e_equals(newElement, boundaryElement))
                        break;
                    // Avoid copying any matched element.
                    else if (newElement.match)
                        continue;
                    else
                        newElement = newElement._4e_clone();
                    newElement[0].appendChild(clonedElement[0]);
                    clonedElement = newElement;
                }
                //脱离当前的元素，将 bookmark 插入到当前元素后面
                //<strong>xx|</strong>  ->
                //<strong>xx<strong>|
                DOM[ boundaryElement.match == 'start' ?
                    'insertBefore' : 'insertAfter' ](
                    DOM._4e_unwrap(clonedElement),
                    DOM._4e_unwrap(boundaryElement)
                );
            }
        } else {
            /*
             * Now our range isn't collapsed. Lets walk from the start node to the end
             * node via DFS and remove the styles one-by-one.
             */
            var endNode = bookmark.endNode,
                me = this;

            /*
             * Find out the style ancestor that needs to be broken down at startNode
             * and endNode.
             */
            function breakNodes() {
                var startPath = new ElementPath(startNode.parent()),
                    endPath = new ElementPath(endNode.parent()),
                    breakStart = NULL,
                    breakEnd = NULL;
                for (var i = 0; i < startPath.elements.length; i++) {
                    var element = startPath.elements[ i ];

                    if (element == startPath.block ||
                        element == startPath.blockLimit)
                        break;

                    if (me.checkElementRemovable(element))
                        breakStart = element;
                }
                for (i = 0; i < endPath.elements.length; i++) {
                    element = endPath.elements[ i ];

                    if (element == endPath.block ||
                        element == endPath.blockLimit)
                        break;

                    if (me.checkElementRemovable(element))
                        breakEnd = element;
                }

                if (breakEnd)
                    endNode._4e_breakParent(breakEnd);
                if (breakStart)
                    startNode._4e_breakParent(breakStart);
            }

            breakNodes();

            // Now, do the DFS walk.
            var currentNode = new Node(startNode[0].nextSibling);
            while (currentNode[0] !== endNode[0]) {
                /*
                 * Need to get the next node first because removeFromElement() can remove
                 * the current node from DOM tree.
                 */
                var nextNode = currentNode._4e_nextSourceNode();
                if (currentNode[0] &&
                    currentNode[0].nodeType == KEN.NODE_ELEMENT &&
                    this.checkElementRemovable(currentNode)) {
                    // Remove style from element or overriding element.
                    if (currentNode._4e_name() == this["element"])
                        removeFromElement(this, currentNode);
                    else {
                        var overrides = getOverrides(this);
                        removeOverrides(currentNode,
                            overrides[ currentNode._4e_name() ] || overrides["*"]);

                    }

                    /*
                     * removeFromElement() may have merged the next node with something before
                     * the startNode via mergeSiblings(). In that case, the nextNode would
                     * contain startNode and we'll have to call breakNodes() again and also
                     * reassign the nextNode to something after startNode.
                     */
                    if (nextNode[0].nodeType == KEN.NODE_ELEMENT &&
                        nextNode.contains(startNode)) {
                        breakNodes();
                        nextNode = new Node(startNode[0].nextSibling);
                    }
                }
                currentNode = nextNode;
            }
        }
        range.moveToBookmark(bookmark);
    }

    // Turn inline style text properties into one hash.
    /**
     *
     * @param {string} styleText
     */
    function parseStyleText(styleText) {
        styleText = String(styleText);
        var retval = {};
        styleText.replace(/&quot;/g, '"')
            .replace(/\s*([^ :;]+)\s*:\s*([^;]+)\s*(?=;|$)/g,
            function (match, name, value) {
                retval[ name ] = value;
            });
        return retval;
    }

    function compareCssText(source, target) {
        typeof source == 'string' && ( source = parseStyleText(source) );
        typeof target == 'string' && ( target = parseStyleText(target) );
        for (var name in source) {
            if (source.hasOwnProperty(name)) {
                // Value 'inherit'  is treated as a wildcard,
                // which will match any value.
                if (!( name in target &&
                    ( target[ name ] == source[ name ]
                        || source[ name ] == 'inherit'
                        || target[ name ] == 'inherit' ) )) {
                    return FALSE;
                }
            }
        }
        return TRUE;
    }

    /**
     *
     * @param {string} unparsedCssText
     * @param {boolean=} nativeNormalize
     */
    function normalizeCssText(unparsedCssText, nativeNormalize) {
        var styleText = "";
        if (nativeNormalize !== FALSE) {
            // Injects the style in a temporary span object, so the browser parses it,
            // retrieving its final format.
            var temp = document.createElement('span');
            temp.style.cssText = unparsedCssText;
            //temp.setAttribute('style', unparsedCssText);
            styleText = temp.style.cssText || '';
        }
        else
            styleText = unparsedCssText;

        // Shrinking white-spaces around colon and semi-colon (#4147).
        // Compensate tail semi-colon.
        return styleText.replace(/\s*([;:])\s*/, '$1')
            .replace(/([^\s;])$/, "$1;")
            .replace(/,\s+/g, ',')// Trimming spaces after comma (e.g. font-family name)(#4107).
            .toLowerCase();
    }

    /**
     * 把 styles(css配置) 作为 属性 style 统一看待
     * 注意对 inherit 的处理
     * @param styleDefinition
     */
    function getAttributesForComparison(styleDefinition) {
        // If we have already computed it, just return it.
        var attribs = styleDefinition._AC;
        if (attribs)
            return attribs;

        attribs = {};

        var length = 0,

            // Loop through all defined attributes.
            styleAttribs = styleDefinition["attributes"];
        if (styleAttribs) {
            for (var styleAtt in styleAttribs) {
                if (styleAttribs.hasOwnProperty(styleAtt)) {
                    length++;
                    attribs[ styleAtt ] = styleAttribs[ styleAtt ];
                }
            }
        }

        // Includes the style definitions.
        var styleText = KEStyle.getStyleText(styleDefinition);
        if (styleText) {
            if (!attribs[ 'style' ])
                length++;
            attribs[ 'style' ] = styleText;
        }

        // Appends the "length" information to the object.
        //防止被compiler优化
        attribs["_length"] = length;

        // Return it, saving it to the next request.
        return ( styleDefinition._AC = attribs );
    }


    /**
     * Get the the collection used to compare the elements and attributes,
     * defined in this style overrides, with other element. All information in
     * it is lowercased.
     * @param  style
     */
    function getOverrides(style) {
        if (style._.overrides)
            return style._.overrides;

        var overrides = ( style._.overrides = {} ),
            definition = style._.definition["overrides"];

        if (definition) {
            // The override description can be a string, object or array.
            // Internally, well handle arrays only, so transform it if needed.
            if (!S.isArray(definition))
                definition = [ definition ];

            // Loop through all override definitions.
            for (var i = 0; i < definition.length; i++) {
                var override = definition[i];
                var elementName;
                var overrideEl;
                var attrs, styles;

                // If can be a string with the element name.
                if (typeof override == 'string')
                    elementName = override.toLowerCase();
                // Or an object.
                else {
                    elementName = override["element"] ?
                        override["element"].toLowerCase() :
                        style.element;
                    attrs = override["attributes"];
                    styles = override["styles"];
                }

                // We can have more than one override definition for the same
                // element name, so we attempt to simply append information to
                // it if it already exists.
                overrideEl = overrides[ elementName ] ||
                    ( overrides[ elementName ] = {} );

                if (attrs) {
                    // The returning attributes list is an array, because we
                    // could have different override definitions for the same
                    // attribute name.
                    var overrideAttrs = ( overrideEl["attributes"] =
                        overrideEl["attributes"] || new Array() );
                    for (var attName in attrs) {
                        // Each item in the attributes array is also an array,
                        // where [0] is the attribute name and [1] is the
                        // override value.
                        if (attrs.hasOwnProperty(attName))
                            overrideAttrs.push([ attName.toLowerCase(), attrs[ attName ] ]);
                    }
                }


                if (styles) {
                    // The returning attributes list is an array, because we
                    // could have different override definitions for the same
                    // attribute name.
                    var overrideStyles = ( overrideEl["styles"] =
                        overrideEl["styles"] || new Array() );
                    for (var styleName in styles) {
                        // Each item in the styles array is also an array,
                        // where [0] is the style name and [1] is the
                        // override value.
                        if (styles.hasOwnProperty(styleName))
                            overrideStyles.push([ styleName.toLowerCase(),
                                styles[ styleName ] ]);
                    }
                }
            }
        }

        return overrides;
    }


    // Removes a style from an element itself, don't care about its subtree.
    function removeFromElement(style, element) {
        var def = style._.definition,
            overrides = getOverrides(style),
            attributes = Utils.mix(def["attributes"],
                (overrides[ element._4e_name()] || overrides["*"] || {})["attributes"]),
            styles = Utils.mix(def["styles"],
                (overrides[ element._4e_name()] || overrides["*"] || {})["styles"]),
            // If the style is only about the element itself, we have to remove the element.
            removeEmpty = S.isEmptyObject(attributes) &&
                S.isEmptyObject(styles);

        // Remove definition attributes/style from the element.
        for (var attName in attributes) {
            if (attributes.hasOwnProperty(attName)) {
                // The 'class' element value must match (#1318).
                if (( attName == 'class' || style._.definition["fullMatch"] )
                    && element.attr(attName) != normalizeProperty(attName,
                    attributes[ attName ]))
                    continue;
                removeEmpty = removeEmpty || !!element._4e_hasAttribute(attName);
                element.removeAttr(attName);
            }
        }

        for (var styleName in styles) {
            if (styles.hasOwnProperty(styleName)) {
                // Full match style insist on having fully equivalence. (#5018)
                if (style._.definition["fullMatch"]
                    && element._4e_style(styleName)
                    != normalizeProperty(styleName, styles[ styleName ], TRUE))
                    continue;

                removeEmpty = removeEmpty || !!element._4e_style(styleName);
                //设置空即为：清除样式
                element._4e_style(styleName, "");
            }
        }

        //removeEmpty &&
        //始终检查
        removeNoAttribsElement(element);
    }

    /**
     *
     * @param {string} name
     * @param {string} value
     * @param {boolean=} isStyle
     */
    function normalizeProperty(name, value, isStyle) {
        var temp = new Node('<span>');
        temp [ isStyle ? '_4e_style' : 'attr' ](name, value);
        return temp[ isStyle ? '_4e_style' : 'attr' ](name);
    }


    // Removes a style from inside an element.
    function removeFromInsideElement(style, element) {
        var //def = style._.definition,
            //attribs = def.attributes,
            //styles = def.styles,
            overrides = getOverrides(style),
            innerElements = element.all(style["element"]);

        for (var i = innerElements.length; --i >= 0;)
            removeFromElement(style, new Node(innerElements[i]));

        // Now remove any other element with different name that is
        // defined to be overriden.
        for (var overrideElement in overrides) {
            if (overrides.hasOwnProperty(overrideElement)) {
                if (overrideElement != style["element"]) {
                    innerElements = element.all(overrideElement);
                    for (i = innerElements.length - 1; i >= 0; i--) {
                        var innerElement = new Node(innerElements[i]);
                        removeOverrides(innerElement,
                            overrides[ overrideElement ]);
                    }
                }
            }
        }

    }

    /**
     *  Remove overriding styles/attributes from the specific element.
     *  Note: Remove the element if no attributes remain.
     * @param {Object} element
     * @param {Object} overrides
     */
    function removeOverrides(element, overrides) {
        var i, attributes = overrides && overrides["attributes"];

        if (attributes) {
            for (i = 0; i < attributes.length; i++) {
                var attName = attributes[i][0], actualAttrValue;

                if (( actualAttrValue = element.attr(attName) )) {
                    var attValue = attributes[i][1];

                    // Remove the attribute if:
                    //    - The override definition value is NULL ;
                    //    - The override definition valie is a string that
                    //      matches the attribute value exactly.
                    //    - The override definition value is a regex that
                    //      has matches in the attribute value.
                    if (attValue === NULL ||
                        ( attValue.test && attValue.test(actualAttrValue) ) ||
                        ( typeof attValue == 'string' && actualAttrValue == attValue ))
                        element[0].removeAttribute(attName);
                }
            }
        }


        var styles = overrides && overrides["styles"];

        if (styles) {
            for (i = 0; i < styles.length; i++) {
                var styleName = styles[i][0], actualStyleValue;

                if (( actualStyleValue = element.css(styleName) )) {
                    var styleValue = styles[i][1];
                    if (styleValue === NULL ||
                        //styleValue === "inherit" ||
                        ( styleValue.test && styleValue.test(actualAttrValue) ) ||
                        ( typeof styleValue == 'string' && actualStyleValue == styleValue ))
                        element.css(styleName, "");
                }
            }
        }

        removeNoAttribsElement(element);
    }

    // If the element has no more attributes, remove it.
    function removeNoAttribsElement(element) {
        // If no more attributes remained in the element, remove it,
        // leaving its children.
        if (!element._4e_hasAttributes()) {
            // Removing elements may open points where merging is possible,
            // so let's cache the first and last nodes for later checking.
            var firstChild = element[0].firstChild,
                lastChild = element[0].lastChild;

            element._4e_remove(TRUE);

            if (firstChild) {
                // Check the cached nodes for merging.
                firstChild.nodeType == KEN.NODE_ELEMENT &&
                DOM._4e_mergeSiblings(firstChild);

                if (lastChild && firstChild != lastChild
                    && lastChild.nodeType == KEN.NODE_ELEMENT)
                    DOM._4e_mergeSiblings(lastChild);
            }
        }
    }

    KE.Style = KEStyle;
});/**
 * modified from ckeditor,htmlparser for malform html string
 * @author yiminghe@gmail.com
 */
/*
Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
*/
KISSY.Editor.add("htmlparser", function(
    // editor
    ) {

    var S = KISSY,
        NULL = null,
        emptyFunc = function() {
        },
        KE = S.Editor;
    //if (KE.HtmlParser) return;
    var attribsRegex = /([\w\-:.]+)(?:(?:\s*=\s*(?:(?:"([^"]*)")|(?:'([^']*)')|([^\s>]+)))|(?=\s|$))/g,
        emptyAttribs = {
            "checked":1,
            "compact":1,
            "declare":1,
            "defer":1,
            "disabled":1,
            "ismap":1,
            "multiple":1,
            "nohref":1,
            "noresize":1,
            "noshade":1,
            "nowrap":1,
            "readonly":1,
            "selected":1
        },
        XHTML_DTD = KE.XHTML_DTD;

    /**
     * @constructor
     */
    function HtmlParser() {
        this._ = {
            htmlPartsRegex :new RegExp('<(?:(?:\\/([^>]+)>)|(?:!--([\\S|\\s]*?)-->)|(?:([^\\s>]+)\\s*((?:(?:[^"\'>]+)|(?:"[^"]*")|(?:\'[^\']*\'))*)\\/?>))', 'g')
        };
    }


    S.augment(HtmlParser, {
        /**
         * Function to be fired when a tag opener is found. This function
         * should be overriden when using this class.
         *  {string} tagName The tag name. The name is guarantted to be
         *        lowercased.
         *  {Object} attributes An object containing all tag attributes. Each
         *        property in this object represent and attribute name and its
         *        value is the attribute value.
         * {boolean} selfClosing TRUE if the tag closes itself, FALSE if the
         *         tag doesn't.
         * @example
         * var parser = new HtmlParser();
         * parser.onTagOpen = function( tagName, attributes, selfClosing )
         *     {
         *         alert( tagName );  // e.g. "b"
         *     });
         * parser.parse( "&lt;!-- Example --&gt;&lt;b&gt;Hello&lt;/b&gt;" );
         */
        onTagOpen    : emptyFunc,

        /**
         * Function to be fired when a tag closer is found. This function
         * should be overriden when using this class.

         * @example
         * var parser = new HtmlParser();
         * parser.onTagClose = function( tagName )
         *     {
         *         alert( tagName );  // e.g. "b"
         *     });
         * parser.parse( "&lt;!-- Example --&gt;&lt;b&gt;Hello&lt;/b&gt;" );
         */
        onTagClose    : emptyFunc,

        /**
         * Function to be fired when text is found. This function
         * should be overriden when using this class.

         * @example
         * var parser = new HtmlParser();
         * parser.onText = function( text )
         *     {
         *         alert( text );  // e.g. "Hello"
         *     });
         * parser.parse( "&lt;!-- Example --&gt;&lt;b&gt;Hello&lt;/b&gt;" );
         */
        onText        : emptyFunc,

        /**
         * Function to be fired when CDATA section is found. This function
         * should be overriden when using this class.

         */
        onCDATA        : emptyFunc,

        /**
         * Function to be fired when a commend is found. This function
         * should be overriden when using this class.


         */
        onComment :emptyFunc,

        /**
         * Parses text, looking for HTML tokens, like tag openers or closers,
         * or comments. This function fires the onTagOpen, onTagClose, onText
         * and onComment function during its execution.
         * @param {string} html The HTML to be parsed.

         */
        parse : function(html) {
            var parts,
                tagName,

                nextIndex = 0,
                cdata;	// The collected data inside a CDATA section.

            while (( parts = this._.htmlPartsRegex.exec(html) )) {

                var tagIndex = parts.index;
                if (tagIndex > nextIndex) {
                    var text = html.substring(nextIndex, tagIndex);

                    if (cdata)
                        cdata.push(text);
                    else
                        this.onText(text);
                }

                nextIndex = this._.htmlPartsRegex.lastIndex;

                /*
                 "parts" is an array with the following items:
                 0 : The entire match for opening/closing tags and comments.
                 1 : Group filled with the tag name for closing tags.
                 2 : Group filled with the comment text.
                 3 : Group filled with the tag name for opening tags.
                 4 : Group filled with the attributes part of opening tags.
                 */

                // Closing tag
                if (( tagName = parts[ 1 ] )) {
                    tagName = tagName.toLowerCase();

                    if (cdata && XHTML_DTD.$cdata[ tagName ]) {
                        // Send the CDATA data.
                        this.onCDATA(cdata.join(''));
                        cdata = NULL;
                    }

                    if (!cdata) {
                        this.onTagClose(tagName);
                        continue;
                    }
                }

                // If CDATA is enabled, just save the raw match.
                if (cdata) {
                    cdata.push(parts[ 0 ]);
                    continue;
                }

                // Opening tag
                if (( tagName = parts[ 3 ] )) {
                    tagName = tagName.toLowerCase();

                    // There are some tag names that can break things, so let's
                    // simply ignore them when parsing. (#5224)
                    if (/="/.test(tagName))
                        continue;

                    var attribs = {},
                        attribMatch,
                        attribsPart = parts[ 4 ],
                        selfClosing = !!( attribsPart && attribsPart.charAt(attribsPart.length - 1) == '/' );

                    if (attribsPart) {
                        while (( attribMatch = attribsRegex.exec(attribsPart) )) {
                            var attName = attribMatch[1].toLowerCase(),
                                attValue = attribMatch[2] || attribMatch[3] || attribMatch[4] || '';

                            if (!attValue && emptyAttribs[ attName ])
                                attribs[ attName ] = attName;
                            else
                                attribs[ attName ] = attValue;
                        }
                    }

                    this.onTagOpen(tagName, attribs, selfClosing);

                    // Open CDATA mode when finding the appropriate tags.
                    if (!cdata && XHTML_DTD.$cdata[ tagName ])
                        cdata = [];

                    continue;
                }

                // Comment
                if (( tagName = parts[ 2 ] ))
                    this.onComment(tagName);
            }

            if (html.length > nextIndex)
                this.onText(html.substring(nextIndex, html.length));
        }
    });

    KE.HtmlParser = HtmlParser;
    KE["HtmlParser"] = HtmlParser;
});
/**
 * modified from ckeditor,html generator for kissy editor
 * @author <yiminghe@gmail.com>
 */
/*
Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
*/
KISSY.Editor.add("htmlparser-basicwriter", function() {
    var S = KISSY,KE = S.Editor,Utils = KE.Utils,
        FALSE = false;

    /**
     * @constructor
     */
    function BasicWriter() {
        this._ = {
            output : []
        };
    }

    S.augment(BasicWriter, {
        /**
         * Writes the tag opening part for a opener tag.
         * @param {string} tagName The element name for this tag.
         * param {Object=} attributes The attributes defined for this tag. The
         *        attributes could be used to inspect the tag.
         * @example
         * // Writes "&lt;p".
         * writer.openTag( 'p', { class : 'MyClass', id : 'MyId' } );
         */
        openTag : function(tagName/*, attributes*/) {
            this._.output.push('<', tagName);
        },

        /**
         * Writes the tag closing part for a opener tag.
         * @param {string} tagName The element name for this tag.
         * @param {boolean=} isSelfClose Indicates that this is a self-closing tag,
         *        like "br" or "img".
         * @example
         * // Writes "&gt;".
         * writer.openTagClose( 'p', FALSE );
         * @example
         * // Writes " /&gt;".
         * writer.openTagClose( 'br', TRUE );
         */
        openTagClose : function(tagName, isSelfClose) {
            if (isSelfClose)
                this._.output.push(' />');
            else
                this._.output.push('>');
        },

        /**
         * Writes an attribute. This function should be called after opening the
         * tag with {@link #openTagClose}.
         * @param {string} attName The attribute name.
         * @param {string} attValue The attribute value.
         * @example
         * // Writes ' class="MyClass"'.
         * writer.attribute( 'class', 'MyClass' );
         */
        attribute : function(attName, attValue) {
            // Browsers don't always escape special character in attribute values. (#4683, #4719).
            if (typeof attValue == 'string')
                attValue = Utils.htmlEncodeAttr(attValue);

            this._.output.push(' ', attName, '="', attValue, '"');
        },

        /**
         * Writes a closer tag.
         * @param {string} tagName The element name for this tag.
         * @example
         * // Writes "&lt;/p&gt;".
         * writer.closeTag( 'p' );
         */
        closeTag : function(tagName) {
            this._.output.push('</', tagName, '>');
        },

        /**
         * Writes text.
         * @param {string} text The text value
         * @example
         * // Writes "Hello Word".
         * writer.text( 'Hello Word' );
         */
        text : function(text) {
            this._.output.push(text);
        },

        /**
         * Writes a comment.
         * @param {string} comment The comment text.
         * @example
         * // Writes "&lt;!-- My comment --&gt;".
         * writer.comment( ' My comment ' );
         */
        comment : function(comment) {
            this._.output.push('<!--', comment, '-->');
        },

        /**
         * Writes any kind of data to the ouput.
         * @example
         * writer.write( 'This is an &lt;b&gt;example&lt;/b&gt;.' );
         */
        write : function(data) {
            this._.output.push(data);
        },

        /**
         * Empties the current output buffer.
         * @example
         * writer.reset();
         */
        reset : function() {
            this._.output = [];
            this._.indent = FALSE;
        },

        /**
         * Empties the current output buffer.
         * @param {boolean} reset Indicates that the { reset} function is to
         *        be automatically called after retrieving the HTML.
         * @returns {string} The HTML written to the writer so far.
         * @example
         * var html = writer.getHtml();
         */
        getHtml : function(reset) {
            var html = this._.output.join('');

            if (reset)
                this.reset();

            return html;
        }
    });

    KE.HtmlParser.BasicWriter = BasicWriter;
});
/**
 * modified from ckeditor
 * @author <yiminghe@gmail.com>
 */
/*
Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
*/
KISSY.Editor.add("htmlparser-htmlwriter", function(
    ) {
    var S = KISSY,
        KE = S.Editor,
        Utils = KE.Utils,
        TRUE = true,
        FALSE = false;

    /**
     * @constructor
     */
    function HtmlWriter() {
        // Call the base contructor.

        HtmlWriter['superclass'].constructor.call(this);

        /**
         * The characters to be used for each identation step.
         * @type {string}
         * @default "\t" (tab)
         * @example
         * // Use two spaces for indentation.
         * editorInstance.dataProcessor.writer.indentationChars = '  ';
         */
        this.indentationChars = '\t';

        /**
         * The characters to be used to close "self-closing" elements, like "br" or
         * "img".
         * @type {string}
         * @default " /&gt;"
         * @example
         * // Use HTML4 notation for self-closing elements.
         * editorInstance.dataProcessor.writer.selfClosingEnd = '>';
         */
        this.selfClosingEnd = ' />';

        /**
         * The characters to be used for line breaks.
         * @type {string}
         * @default "\n" (LF)
         * @example
         * // Use CRLF for line breaks.
         * editorInstance.dataProcessor.writer.lineBreakChars = '\r\n';
         */
        this.lineBreakChars = '\n';

        this.forceSimpleAmpersand = FALSE;

        this.sortAttributes = TRUE;

        this._.indent = FALSE;
        this._.indentation = '';
        this._.rules = {};

        var dtd = KE.XHTML_DTD;

        for (var e in Utils.mix({},
            dtd.$nonBodyContent,
            dtd.$block, dtd.$listItem,
            dtd.$tableContent)) {
            this.setRules(e, {
                indent : TRUE,
                breakBeforeOpen : TRUE,
                breakAfterOpen : TRUE,
                breakBeforeClose : !dtd[ e ][ '#' ],
                breakAfterClose : TRUE
            });
        }

        this.setRules('br',
        {
            breakAfterOpen : TRUE
        });

        this.setRules('title',
        {
            indent : FALSE,
            breakAfterOpen : FALSE
        });

        this.setRules('style',
        {
            indent : FALSE,
            breakBeforeClose : TRUE
        });

        // Disable indentation on <pre>.
        this.setRules('pre',
        {
            indent: FALSE
        });
    }

    S.extend(HtmlWriter, KE.HtmlParser.BasicWriter, {
        /**
         * Writes the tag opening part for a opener tag.
         * @param {String} tagName The element name for this tag.
         * param {Object} attributes The attributes defined for this tag. The
         *        attributes could be used to inspect the tag.
         * @example
         * // Writes "&lt;p".
         * writer.openTag( 'p', { class : 'MyClass', id : 'MyId' } );
         */
        openTag : function(tagName/*, attributes*/) {
            var rules = this._.rules[ tagName ];

            if (this._.indent)
                this.indentation();
            // Do not break if indenting.
            else if (rules && rules.breakBeforeOpen) {
                this.lineBreak();
                this.indentation();
            }

            this._.output.push('<', tagName);
        },

        /**
         * Writes the tag closing part for a opener tag.
         * @param {String} tagName The element name for this tag.
         * @param {Boolean} isSelfClose Indicates that this is a self-closing tag,
         *        like "br" or "img".
         * @example
         * // Writes "&gt;".
         * writer.openTagClose( 'p', FALSE );
         * @example
         * // Writes " /&gt;".
         * writer.openTagClose( 'br', TRUE );
         */
        openTagClose : function(tagName, isSelfClose) {
            var rules = this._.rules[ tagName ];

            if (isSelfClose)
                this._.output.push(this.selfClosingEnd);
            else {
                this._.output.push('>');
                if (rules && rules.indent)
                    this._.indentation += this.indentationChars;
            }

            if (rules && rules.breakAfterOpen)
                this.lineBreak();
        },

        /**
         * Writes an attribute. This function should be called after opening the
         * tag with {@link #openTagClose}.
         * @param {String} attName The attribute name.
         * @param {String} attValue The attribute value.
         * @example
         * // Writes ' class="MyClass"'.
         * writer.attribute( 'class', 'MyClass' );
         */
        attribute : function(attName, attValue) {

            if (typeof attValue == 'string') {
                this.forceSimpleAmpersand && ( attValue = attValue.replace(/&amp;/g, '&') );
                // Browsers don't always escape special character in attribute values. (#4683, #4719).
                attValue = Utils.htmlEncodeAttr(attValue);
            }

            this._.output.push(' ', attName, '="', attValue, '"');
        },

        /**
         * Writes a closer tag.
         * @param {String} tagName The element name for this tag.
         * @example
         * // Writes "&lt;/p&gt;".
         * writer.closeTag( 'p' );
         */
        closeTag : function(tagName) {
            var rules = this._.rules[ tagName ];

            if (rules && rules.indent)
                this._.indentation = this._.indentation.substr(this.indentationChars.length);

            if (this._.indent)
                this.indentation();
            // Do not break if indenting.
            else if (rules && rules.breakBeforeClose) {
                this.lineBreak();
                this.indentation();
            }

            this._.output.push('</', tagName, '>');

            if (rules && rules.breakAfterClose)
                this.lineBreak();
        },

        /**
         * Writes text.
         * @param {String} text The text value
         * @example
         * // Writes "Hello Word".
         * writer.text( 'Hello Word' );
         */
        text : function(text) {
            if (this._.indent) {
                this.indentation();
                text = Utils.ltrim(text);
            }

            this._.output.push(text);
        },

        /**
         * Writes a comment.
         * @param {String} comment The comment text.
         * @example
         * // Writes "&lt;!-- My comment --&gt;".
         * writer.comment( ' My comment ' );
         */
        comment : function(comment) {
            if (this._.indent)
                this.indentation();

            this._.output.push('<!--', comment, '-->');
        },

        /**
         * Writes a line break. It uses the { #lineBreakChars} property for it.
         * @example
         * // Writes "\n" (e.g.).
         * writer.lineBreak();
         */
        lineBreak : function() {
            if (this._.output.length > 0)
                this._.output.push(this.lineBreakChars);
            this._.indent = TRUE;
        },

        /**
         * Writes the current indentation chars. It uses the
         * { #indentationChars} property, repeating it for the current
         * indentation steps.
         * @example
         * // Writes "\t" (e.g.).
         * writer.indentation();
         */
        indentation : function() {
            this._.output.push(this._.indentation);
            this._.indent = FALSE;
        },

        /**
         * Sets formatting rules for a give element. The possible rules are:
         * <ul>
         *    <li><b>indent</b>: indent the element contents.</li>
         *    <li><b>breakBeforeOpen</b>: break line before the opener tag for this element.</li>
         *    <li><b>breakAfterOpen</b>: break line after the opener tag for this element.</li>
         *    <li><b>breakBeforeClose</b>: break line before the closer tag for this element.</li>
         *    <li><b>breakAfterClose</b>: break line after the closer tag for this element.</li>
         * </ul>
         *
         * All rules default to "FALSE". Each call to the function overrides
         * already present rules, leaving the undefined untouched.
         *
         * By default, all elements available in the { XHTML_DTD.$block),
         * { XHTML_DTD.$listItem} and { XHTML_DTD.$tableContent}
         * lists have all the above rules set to "TRUE". Additionaly, the "br"
         * element has the "breakAfterOpen" set to "TRUE".
         * @param {String} tagName The element name to which set the rules.
         * @param {Object} rules An object containing the element rules.
         * @example
         * // Break line before and after "img" tags.
         * writer.setRules( 'img',
         *     {
         *         breakBeforeOpen : TRUE
         *         breakAfterOpen : TRUE
         *     });
         * @example
         * // Reset the rules for the "h1" tag.
         * writer.setRules( 'h1', {} );
         */
        setRules : function(tagName, rules) {
            var currentRules = this._.rules[ tagName ];

            if (currentRules)
                currentRules = Utils.mix(currentRules, rules);
            else
                this._.rules[ tagName ] = rules;
        }
    });

    KE.HtmlParser.HtmlWriter = HtmlWriter;
});
/**
 * modified from ckeditor
 * @author <yiminghe@gmail.com>
 */
/*
 Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.html or http://ckeditor.com/license
 */
KISSY.Editor.add("htmlparser-fragment", function() {
    var
        TRUE = true,
        FALSE = false,
        NULL = null,
        KE = KISSY.Editor;

    /**
     * A lightweight representation of an HTML DOM structure.
     * @constructor
     * @example
     */
    function Fragment() {
        /**
         * The nodes contained in the root of this fragment.
         * @type Array
         * @example
         * var fragment = Fragment.fromHtml( '<b>Sample</b> Text' );
         * alert( fragment.children.length );  "2"
         */
        this.children = [];

        /**
         * Get the fragment parent. Should always be NULL.
         * @type Object
         * @default NULL
         * @example
         */
        this.parent = NULL;

        /** @private */
        this._ = {
            isBlockLike : TRUE,
            hasInlineStarted : FALSE
        };
    }

    // Elements which the end tag is marked as optional in the HTML 4.01 DTD
    // (expect empty elements).
    var optionalClose = {"colgroup":1,"dd":1,"dt":1,"li":1,"option":1,"p":1,"td":1,"tfoot":1,"th":1,"thead":1,"tr":1};

    // Block-level elements whose internal structure should be respected during
    // parser fixing.
    var S = KISSY,
        Utils = KE.Utils,
        KEN = KE.NODE,
        XHTML_DTD = KE.XHTML_DTD,
        nonBreakingBlocks = Utils.mix({"table":1,"ul":1,"ol":1,"dl":1},
            XHTML_DTD["table"], XHTML_DTD["ul"], XHTML_DTD["ol"], XHTML_DTD["dl"]),
        listBlocks = XHTML_DTD.$list,
        listItems = XHTML_DTD.$listItem;

    /**
     * Creates a  Fragment from an HTML string.
     * @param {String} fragmentHtml The HTML to be parsed, filling the fragment.
     * @param {boolean|string|undefined} [fixForBody=FALSE] Wrap body with specified element if needed.
     * @returns Fragment The fragment created.
     * @example
     * var fragment = Fragment.fromHtml( '<b>Sample</b> Text' );
     * alert( fragment.children[0].name );  "b"
     * alert( fragment.children[1].value );  " Text"
     * 特例：
     * 自动加p，自动处理标签嵌套规则
     * "<img src='xx'><span>5<div>6</div>7</span>"
     * ="<p><img><span>5</span></p><div><span>6</span></div><p><span>7</span></p>"
     * 自动处理ul嵌套，以及li ie不闭合
     * "<ul><ul><li>xxx</ul><li>1<li>2<ul>");
     */
    Fragment.FromHtml = function(fragmentHtml, fixForBody) {

        var parser = new KE.HtmlParser(),
            //html = [],
            fragment = new Fragment(),
            pendingInline = [],
            pendingBRs = [],
            currentNode = fragment,
            // Indicate we're inside a <pre> element, spaces should be touched differently.
            inPre = FALSE,
            returnPoint;

        /**
         *
         * @param {boolean|undefined|string=} newTagName
         */
        function checkPending(newTagName) {
            var pendingBRsSent;

            if (pendingInline.length > 0) {
                for (var i = 0; i < pendingInline.length; i++) {
                    var pendingElement = pendingInline[ i ],
                        pendingName = pendingElement.name,
                        pendingDtd = XHTML_DTD[ pendingName ],
                        currentDtd = currentNode.name && XHTML_DTD[ currentNode.name ];

                    if (( !currentDtd || currentDtd[ pendingName ] ) && ( !newTagName || !pendingDtd || pendingDtd[ newTagName ] || !XHTML_DTD[ newTagName ] )) {
                        if (!pendingBRsSent) {
                            sendPendingBRs();
                            pendingBRsSent = 1;
                        }

                        // Get a clone for the pending element.
                        pendingElement = pendingElement.clone();

                        // Add it to the current node and make it the current,
                        // so the new element will be added inside of it.
                        pendingElement.parent = currentNode;
                        currentNode = pendingElement;

                        // Remove the pending element (back the index by one
                        // to properly process the next entry).
                        pendingInline.splice(i, 1);
                        i--;
                    }
                }
            }
        }

        function sendPendingBRs() {
            while (pendingBRs.length)
                currentNode.add(pendingBRs.shift());
        }

        /**
         *
         * @param  element
         * @param  {*=} target
         * @param {boolean=} enforceCurrent
         */
        function addElement(element, target, enforceCurrent) {
            target = target || currentNode || fragment;

            // If the target is the fragment and this element can't go inside
            // body
            if (fixForBody && !target.type) {
                var elementName, realElementName;
                if (element.attributes
                    && ( realElementName =
                    element.attributes[ '_ke_real_element_type' ] ))
                    elementName = realElementName;
                else
                    elementName = element.name;
                if (elementName
                    && !( elementName in XHTML_DTD.$body )
                    && !( elementName in XHTML_DTD.$nonBodyContent )) {
                    var savedCurrent = currentNode;

                    // Create a <p> in the fragment.
                    currentNode = target;
                    /**
                     * notice : 2011-01-13
                     * bug
                     * <li>1</li> ->
                     * <p><li>1</li></p>
                     *
                     * should be <ul><li>1</li></ul>
                     */
                    var meta = {
                        li:"ul",
                        dt:"dl",
                        dd:"dl"
                    };
                    parser.onTagOpen(meta[elementName] || fixForBody, {});

                    // The new target now is the <p>.
                    target = currentNode;

                    if (enforceCurrent)
                        currentNode = savedCurrent;
                }
            }

            // Rtrim empty spaces on block end boundary. (#3585)
            if (element._.isBlockLike
                && element.name != 'pre') {

                var length = element.children.length,
                    lastChild = element.children[ length - 1 ],
                    text;
                if (lastChild && lastChild.type == KEN.NODE_TEXT) {
                    if (!( text = Utils.rtrim(lastChild.value) ))
                        element.children.length = length - 1;
                    else
                        lastChild.value = text;
                }
            }

            target.add(element);

            //<ul><ul></ul></ul> -> <ul><li><ul></ul></li></ul>
            //跳过隐形添加的li直接到ul
            if (element.returnPoint) {
                currentNode = element.returnPoint;
                delete element.returnPoint;
            }
        }

        /**
         * 遇到标签开始建立节点和父亲关联 ==  node.parent=parent
         * @param {string|boolean|undefined} tagName
         * @param {Object} attributes
         * @param {boolean=} selfClosing
         */
        parser.onTagOpen = function(tagName, attributes, selfClosing) {
            var element = new KE.HtmlParser.Element(tagName, attributes);

            // "isEmpty" will be always "FALSE" for unknown elements, so we
            // must force it if the parser has identified it as a selfClosing tag.
            if (element.isUnknown && selfClosing)
                element.isEmpty = TRUE;

            // This is a tag to be removed if empty, so do not add it immediately.
            if (XHTML_DTD.$removeEmpty[ tagName ] &&
                S.isEmptyObject(attributes)) {
                pendingInline.push(element);
                return;
            }
            else if (String(tagName) === 'pre')
                inPre = TRUE;
            else if (String(tagName) === 'br' && inPre) {
                currentNode.add(new KE.HtmlParser.Text('\n'));
                return;
            }

            if (String(tagName) === 'br') {
                pendingBRs.push(element);
                return;
            }

            var currentName = currentNode.name;

            var currentDtd = currentName
                && ( XHTML_DTD[ currentName ]
                || ( currentNode._.isBlockLike ? XHTML_DTD["div"] : XHTML_DTD["span"] ) );

            // If the element cannot be child of the current element.
            if (currentDtd   // Fragment could receive any elements.
                && !element.isUnknown && !currentNode.isUnknown && !currentDtd[ tagName ]) {

                var reApply = FALSE,
                    addPoint;   // New position to start adding nodes.

                // Fixing malformed nested lists by moving it into a previous list item. (#3828)
                if (tagName in listBlocks
                    && currentName in listBlocks) {
                    var children = currentNode.children,
                        lastChild = children[ children.length - 1 ];

                    // Establish the list item if it's not existed.
                    if (!( lastChild && lastChild.name in listItems ))
                    //直接添加到父亲
                        addElement(( lastChild = new KE.HtmlParser.Element('li') ), currentNode);
                    //以后直接跳到父亲不用再向父亲添加
                    returnPoint = currentNode,addPoint = lastChild;
                }
                // If the element name is the same as the current element name,
                // then just close the current one and append the new one to the
                // parent. This situation usually happens with <p>, <li>, <dt> and
                // <dd>, specially in IE. Do not enter in this if block in this case.
                else if (tagName == currentName) {
                    //直接把上一个<p>,<li>结束掉，不要再等待</p>,</li>执行此项操作了
                    addElement(currentNode, currentNode.parent);
                }
                else {
                    if (false && nonBreakingBlocks[ currentName ]) {
                        if (!returnPoint)
                            returnPoint = currentNode;
                    }
                    else {
                        //拆分，闭合掉
                        addElement(currentNode, currentNode.parent, TRUE);
                        //li,p等现在就闭合，以后都不用再管了
                        if (!optionalClose[ currentName ] && currentName in XHTML_DTD.$inline) {
                            // The current element is an inline element, which
                            // cannot hold the new one. Put it in the pending list,
                            // and try adding the new one after it.
                            pendingInline.unshift(currentNode);
                        }
                    }

                    reApply = TRUE;
                }

                if (addPoint)
                    currentNode = addPoint;
                // Try adding it to the return point, or the parent element.
                else
                //前面都调用 addElement 将当前节点闭合了，只能往 parent 添加了
                    currentNode = currentNode.returnPoint || currentNode.parent;

                if (reApply) {
                    parser.onTagOpen.apply(this, arguments);
                    return;
                }
            }

            checkPending(tagName);
            sendPendingBRs();

            element.parent = currentNode;
            element.returnPoint = returnPoint;
            returnPoint = 0;

            //自闭合的，不等结束标签，立即加到父亲
            if (element.isEmpty)
                addElement(element);
            else
                currentNode = element;
        };

        /**
         * 遇到标签结束，将open生成的节点添加到dom树中 == 父亲接纳自己 node.parent.add(node)
         * @param tagName
         */
        parser.onTagClose = function(tagName) {
            // Check if there is any pending tag to be closed.
            for (var i = pendingInline.length - 1; i >= 0; i--) {
                // If found, just remove it from the list.
                if (tagName == pendingInline[ i ].name) {
                    pendingInline.splice(i, 1);
                    return;
                }
            }

            var pendingAdd = [],
                newPendingInline = [],
                candidate = currentNode;

            while (candidate.type && candidate.name != tagName) {
                // If this is an inline element, add it to the pending list, if we're
                // really closing one of the parents element later, they will continue
                // after it.
                if (!candidate._.isBlockLike)
                    newPendingInline.unshift(candidate);

                // This node should be added to it's parent at this point. But,
                // it should happen only if the closing tag is really closing
                // one of the nodes. So, for now, we just cache it.
                pendingAdd.push(candidate);

                candidate = candidate.parent;
            }

            if (candidate.type) {
                // Add all elements that have been found in the above loop.
                for (i = 0; i < pendingAdd.length; i++) {
                    var node = pendingAdd[ i ];
                    addElement(node, node.parent);
                }

                currentNode = candidate;

                if (currentNode.name == 'pre')
                    inPre = FALSE;

                if (candidate._.isBlockLike)
                    sendPendingBRs();

                addElement(candidate, candidate.parent);

                // The parent should start receiving new nodes now, except if
                // addElement changed the currentNode.
                if (candidate == currentNode)
                    currentNode = currentNode.parent;

                pendingInline = pendingInline.concat(newPendingInline);
            }

            if (tagName == 'body')
                fixForBody = FALSE;
        };

        parser.onText = function(text) {
            // Trim empty spaces at beginning of element contents except <pre>.
            if (!currentNode._.hasInlineStarted && !inPre) {
                text = Utils.ltrim(text);

                if (text.length === 0)
                    return;
            }

            sendPendingBRs();
            checkPending();

            if (fixForBody
                && ( !currentNode.type || currentNode.name == 'body' )
                && Utils.trim(text)) {
                this.onTagOpen(fixForBody, {});
            }

            // Shrinking consequential spaces into one single for all elements
            // text contents.
            if (!inPre)
                text = text.replace(/[\t\r\n ]{2,}|[\t\r\n]/g, ' ');

            currentNode.add(new KE.HtmlParser.Text(text));
        };

        parser.onCDATA = function(cdata) {
            currentNode.add(new KE.HtmlParser.cdata(cdata));
        };

        parser.onComment = function(comment) {
            currentNode.add(new KE.HtmlParser.Comment(comment));
        };

        // Parse it.
        parser.parse(fragmentHtml);

        sendPendingBRs();

        // Close all pending nodes.
        //<p>xxxxxxxxxxxxx
        //到最后也灭有结束标签
        while (currentNode.type) {
            var parent = currentNode.parent,
                node = currentNode;

            if (fixForBody
                && ( !parent.type || parent.name == 'body' )
                && !XHTML_DTD.$body[ node.name ]) {
                currentNode = parent;
                parser.onTagOpen(fixForBody, {});
                parent = currentNode;
            }

            parent.add(node);
            currentNode = parent;
        }

        return fragment;
    };

    S.augment(Fragment, {
        /**
         * Adds a node to this fragment.
         * @param {Object} node The node to be added. It can be any of of the
         *        following types: {@link Element},
         *        {@link Text}
         * @example
         */
        add : function(node) {
            var len = this.children.length,
                previous = len > 0 && this.children[ len - 1 ] || NULL;

            if (previous) {
                // If the block to be appended is following text, trim spaces at
                // the right of it.
                if (node._.isBlockLike && previous.type == KEN.NODE_TEXT) {
                    previous.value = Utils.rtrim(previous.value);
                    // If we have completely cleared the previous node.
                    if (previous.value.length === 0) {
                        // Remove it from the list and add the node again.
                        this.children.pop();
                        this.add(node);
                        return;
                    }
                }

                previous.next = node;
            }

            node.previous = previous;
            node.parent = this;

            this.children.push(node);
            this._.hasInlineStarted = node.type == KEN.NODE_TEXT || ( node.type == KEN.NODE_ELEMENT && !node._.isBlockLike );
        },

        /**
         * Writes the fragment HTML to a CKEDITOR.htmlWriter.
         * @param writer The writer to which write the HTML.
         * @example
         * var writer = new HtmlWriter();
         * var fragment = Fragment.fromHtml( '&lt;P&gt;&lt;B&gt;Example' );
         * fragment.writeHtml( writer )
         * alert( writer.getHtml() );  "&lt;p&gt;&lt;b&gt;Example&lt;/b&gt;&lt;/p&gt;"
         */
        writeHtml : function(writer, filter) {
            var isChildrenFiltered;
            this.filterChildren = function() {
                var writer = new KE.HtmlParser.BasicWriter();
                this.writeChildrenHtml.call(this, writer, filter, TRUE);
                var html = writer.getHtml();
                this.children = new Fragment.FromHtml(html).children;
                isChildrenFiltered = 1;
            };
            this["filterChildren"] = this.filterChildren;
            // Filtering the root fragment before anything else.
            !this.name && filter && filter.onFragment(this);

            this.writeChildrenHtml(writer, isChildrenFiltered ? NULL : filter);
        },

        writeChildrenHtml : function(writer, filter) {
            for (var i = 0; i < this.children.length; i++)
                this.children[i].writeHtml(writer, filter);
        }
    });

    KE.HtmlParser.Fragment = Fragment;
});
/**
 * modified from ckeditor
 * @author <yiminghe@gmail.com>
 */
/*
Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
*/
KISSY.Editor.add("htmlparser-element", function() {
    var KE = KISSY.Editor,
        TRUE = true,
        FALSE = false,
        NULL = null;

    /**
     * A lightweight representation of an HTML element.
     * @constructor
     * @param {!String} name The element name.
     * @param {Object} attributes And object holding all attributes defined for
     *        this element.
     * @example
     */
    function MElement(name, attributes) {
        /**
         * The element name.
         * @type String
         * @example
         */
        this.name = name;

        /**
         * Holds the attributes defined for this element.
         * @type Object
         * @example
         */
        this.attributes = attributes || ( attributes = {} );

        /**
         * The nodes that are direct children of this element.
         * @type Array
         * @example
         */
        this.children = [];

        var tagName = attributes._ke_real_element_type || name;

        var dtd = KE.XHTML_DTD,
            isBlockLike = !!( dtd.$nonBodyContent[ tagName ] || dtd.$block[ tagName ] || dtd.$listItem[ tagName ] || dtd.$tableContent[ tagName ] || dtd.$nonEditable[ tagName ] || tagName == 'br' ),
            isEmpty = !!dtd.$empty[ name ];

        this.isEmpty = isEmpty;
        this.isUnknown = !dtd[ name ];

        /** @private */
        this._ =
        {
            isBlockLike : isBlockLike,
            hasInlineStarted : isEmpty || !isBlockLike
        };
    }

    // Used to sort attribute entries in an array, where the first element of
    // each object is the attribute name.
    var S = KISSY,
        KEN = KE.NODE,
        sortAttribs = function(a, b) {
            a = a[0];
            b = b[0];
            return a < b ? -1 : a > b ? 1 : 0;
        };
    S.augment(MElement, {
        /**
         * The node type. This is a constant value set to { KEN.NODE_ELEMENT}.
         * @type Number
         * @example
         */
        type : KEN.NODE_ELEMENT,

        /**
         * Adds a node to the element children list.
         * @param {Object} node The node to be added.
         * @function
         * @example
         */
        add : KE.HtmlParser.Fragment.prototype.add,

        /**
         * Clone this element.
         * @returns  The element clone.
         * @example
         */
        clone : function() {
            return new MElement(this.name, this.attributes);
        },

        /**
         * Writes the element HTML to a CKEDITOR.htmlWriter.
         * @param  writer The writer to which write the HTML.
         * @example
         */
        writeHtml : function(writer, filter) {
            var attributes = this.attributes;

            // Ignore cke: prefixes when writing HTML.
            var element = this,
                writeName = element.name,
                a, newAttrName, value;

            var isChildrenFiltered;

            /**
             * Providing an option for bottom-up filtering order ( element
             * children to be pre-filtered before the element itself ).
             */
            element.filterChildren = function() {
                if (!isChildrenFiltered) {
                    var writer = new KE.HtmlParser.BasicWriter();
                    KE.HtmlParser.Fragment.prototype.writeChildrenHtml.call(element, writer, filter);
                    element.children = new KE.HtmlParser.Fragment.FromHtml(writer.getHtml()).children;
                    isChildrenFiltered = 1;
                }
            };
            element["filterChildren"] = element.filterChildren;
            if (filter) {
                while (TRUE) {
                    if (!( writeName = filter.onElementName(writeName) ))
                        return;

                    element.name = writeName;

                    if (!( element = filter.onElement(element) ))
                        return;

                    element.parent = this.parent;

                    if (element.name == writeName)
                        break;

                    // If the element has been replaced with something of a
                    // different type, then make the replacement write itself.
                    if (element.type != KEN.NODE_ELEMENT) {
                        element.writeHtml(writer, filter);
                        return;
                    }

                    writeName = element.name;

                    // This indicate that the element has been dropped by
                    // filter but not the children.
                    if (!writeName) {
                        this.writeChildrenHtml.call(element, writer, isChildrenFiltered ? NULL : filter);
                        return;
                    }
                }

                // The element may have been changed, so update the local
                // references.
                attributes = element.attributes;
            }

            // Open element tag.
            writer.openTag(writeName, attributes);

            // Copy all attributes to an array.
            var attribsArray = [];
            // Iterate over the attributes twice since filters may alter
            // other attributes.
            for (var i = 0; i < 2; i++) {
                for (a in attributes) {
                    newAttrName = a;
                    value = attributes[ a ];
                    if (i == 1)
                        attribsArray.push([ a, value ]);
                    else if (filter) {
                        while (TRUE) {
                            if (!( newAttrName = filter.onAttributeName(a) )) {
                                delete attributes[ a ];
                                break;
                            }
                            else if (newAttrName != a) {
                                delete attributes[ a ];
                                a = newAttrName;
                                //continue;
                            }
                            else
                                break;
                        }
                        if (newAttrName) {
                            if (( value = filter.onAttribute(element, newAttrName, value) ) === FALSE)
                                delete attributes[ newAttrName ];
                            else
                                attributes [ newAttrName ] = value;
                        }
                    }
                }
            }
            // Sort the attributes by name.
            if (writer.sortAttributes)
                attribsArray.sort(sortAttribs);

            // Send the attributes.
            var len = attribsArray.length;
            for (i = 0; i < len; i++) {
                var attrib = attribsArray[ i ];
                writer.attribute(attrib[0], attrib[1]);
            }

            // Close the tag.
            writer.openTagClose(writeName, element.isEmpty);

            if (!element.isEmpty) {
                this.writeChildrenHtml.call(element, writer, isChildrenFiltered ? NULL : filter);
                // Close the element.
                writer.closeTag(writeName);
            }
        },

        writeChildrenHtml : function(writer, filter) {
            // Send children.
            KE.HtmlParser.Fragment.prototype.writeChildrenHtml.apply(this, arguments);
        }
    });
    /**
     * @constructor
     */
    KE.HtmlParser.Element = MElement;
});
/**
 * modified from ckeditor
 * @author <yiminghe@gmail.com>
 */
/*
Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
*/
KISSY.Editor.add("htmlparser-filter", function(
    ) {
    var S = KISSY,
        KE = S.Editor,
        KEN = KE.NODE,
        FALSE = false,
        NULL = null;

    /**
     * @constructor
     * @param rules {Object}
     */
    function Filter(rules) {
        this._ = {
            elementNames : [],
            attributeNames : [],
            elements : { $length : 0 },
            attributes : { $length : 0 }
        };

        if (rules)
            this.addRules(rules, 10);
    }

    S.augment(Filter, {
        addRules : function(rules, priority) {
            if (typeof priority != 'number')
                priority = 10;

            // Add the elementNames.
            addItemsToList(this._.elementNames, rules.elementNames, priority);

            // Add the attributeNames.
            addItemsToList(this._.attributeNames, rules.attributeNames, priority);

            // Add the elements.
            addNamedItems(this._.elements, rules.elements, priority);

            // Add the attributes.
            addNamedItems(this._.attributes, rules.attributes, priority);

            // Add the text.
            this._.text = transformNamedItem(this._.text, rules.text, priority) || this._.text;

            // Add the comment.
            this._.comment = transformNamedItem(this._.comment, rules.comment, priority) || this._.comment;

            // Add root fragment.
            this._.root = transformNamedItem(this._.root, rules.root, priority) || this._.root;
        },

        onElementName : function(name) {
            return filterName(name, this._.elementNames);
        },

        onAttributeName : function(name) {
            return filterName(name, this._.attributeNames);
        },

        onText : function(text) {
            var textFilter = this._.text;
            return textFilter ? textFilter.filter(text) : text;
        },

        onComment : function(commentText, comment) {
            var textFilter = this._.comment;
            return textFilter ? textFilter.filter(commentText, comment) : commentText;
        },

        onFragment : function(element) {
            var rootFilter = this._.root;
            return rootFilter ? rootFilter.filter(element) : element;
        },

        onElement : function(element) {
            // We must apply filters set to the specific element name as
            // well as those set to the generic $ name. So, add both to an
            // array and process them in a small loop.
            var filters = [ this._.elements[ '^' ], this._.elements[ element.name ], this._.elements.$ ],
                filter, ret;

            for (var i = 0; i < 3; i++) {
                filter = filters[ i ];
                if (filter) {
                    ret = filter.filter(element, this);

                    if (ret === FALSE)
                        return NULL;

                    if (ret && ret != element)
                        return this.onNode(ret);

                    // The non-root element has been dismissed by one of the filters.
                    if (element.parent && !element.name)
                        break;
                }
            }

            return element;
        },

        onNode : function(node) {
            var type = node.type;

            return type == KEN.NODE_ELEMENT ? this.onElement(node) :
                type == KEN.NODE_TEXT ? new KE.HtmlParser.Text(this.onText(node.value)) :
                    NULL;
        },

        onAttribute : function(element, name, value) {
            var filter = this._.attributes[ name ];

            if (filter) {
                var ret = filter.filter(value, element, this);

                if (ret === FALSE)
                    return FALSE;

                if (typeof ret != 'undefined')
                    return ret;
            }

            return value;
        }
    });
    function filterName(name, filters) {
        for (var i = 0; name && i < filters.length; i++) {
            var filter = filters[ i ];
            name = name.replace(filter[ 0 ], filter[ 1 ]);
        }
        return name;
    }

    function addItemsToList(list, items, priority) {
        if (typeof items == 'function')
            items = [ items ];

        var i, j,
            listLength = list.length,
            itemsLength = items && items.length;

        if (itemsLength) {
            // Find the index to insert the items at.
            for (i = 0; i < listLength && list[ i ].pri < priority; i++) { /*jsl:pass*/
            }

            // Add all new items to the list at the specific index.
            for (j = itemsLength - 1; j >= 0; j--) {
                var item = items[ j ];
                if (item) {
                    item.pri = priority;
                    list.splice(i, 0, item);
                }
            }
        }
    }

    function addNamedItems(hashTable, items, priority) {
        if (items) {
            for (var name in items) {
                var current = hashTable[ name ];

                hashTable[ name ] =
                    transformNamedItem(
                        current,
                        items[ name ],
                        priority);

                if (!current)
                    hashTable.$length++;
            }
        }
    }

    function transformNamedItem(current, item, priority) {
        if (item) {
            item.pri = priority;

            if (current) {
                // If the current item is not an Array, transform it.
                if (!current.splice) {
                    if (current.pri > priority)
                        current = [ item, current ];
                    else
                        current = [ current, item ];

                    current.filter = callItems;
                }
                else
                    addItemsToList(current, item, priority);

                return current;
            }
            else {
                item.filter = item;
                return item;
            }
        }
        return undefined;
    }

    // Invoke filters sequentially on the array, break the iteration
    // when it doesn't make sense to continue anymore.
    function callItems(currentEntry) {
        var isNode = currentEntry.type
            || currentEntry instanceof KE.HtmlParser.Fragment;

        for (var i = 0; i < this.length; i++) {
            // Backup the node info before filtering.
            if (isNode) {
                var orgType = currentEntry.type,
                    orgName = currentEntry.name;
            }

            var item = this[ i ],
                ret = item.apply(window, arguments);

            if (ret === FALSE)
                return ret;

            // We're filtering node (element/fragment).
            if (isNode) {
                // No further filtering if it's not anymore
                // fitable for the subsequent filters.
                if (ret && ( ret.name != orgName
                    || ret.type != orgType )) {
                    return ret;
                }
            }
            // Filtering value (nodeName/textValue/attrValue).
            else {
                // No further filtering if it's not
                // any more values.
                if (typeof ret != 'string')
                    return ret;
            }

            ret != undefined && ( currentEntry = ret );
        }
        return currentEntry;
    }

    KE.HtmlParser.Filter = Filter;
});
/**
 * modified from ckeditor
 * @author <yiminghe@gmail.com>
 */
/*
Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
*/
KISSY.Editor.add("htmlparser-text", function() {
    var S = KISSY,
        KE = S.Editor,
        KEN = KE.NODE,
        FALSE = false;

    /**
     * A lightweight representation of HTML text.
     * @constructor
     * @example
     */
    function MText(value) {
        /**
         * The text value.
         * @type String
         * @example
         */
        this.value = value;

        /** @private */
        this._ = {
            isBlockLike : FALSE
        };
    }

    S.augment(MText, {
        /**
         * The node type. This is a constant value set to { KEN.NODE_TEXT}.
         * @type Number
         * @example
         */
        type : KEN.NODE_TEXT,

        /**
         * Writes the HTML representation of this text to a HtmlWriter.
         *  {HtmlWriter} writer The writer to which write the HTML.
         * @example
         */
        writeHtml : function(writer, filter) {
            var text = this.value;

            if (filter && !( text = filter.onText(text, this) ))
                return;

            writer.text(text);
        }
    });

    KE.HtmlParser.Text = MText;
    KE.HtmlParser["Text"] = MText;
});
/**
 * modified from ckeditor
 * @author <yiminghe@gmail.com>
 */
/*
 Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.html or http://ckeditor.com/license
 */
KISSY.Editor.add("htmlparser-cdata", function(KE) {
    /**
     * A lightweight representation of HTML text.
     * @constructor
     * @example
     */
    KE.HtmlParser.cdata = function(value) {
        /**
         * The CDATA value.
         * @type String
         * @example
         */
        this.value = value;
    };

    KE.HtmlParser.cdata.prototype = {
        /**
         * CDATA has the same type as .htmlParser.text This is
         * a constant value set to NODE_TEXT.
         * @type Number
         * @example
         */
        type : KE.NODE.NODE_TEXT,

        /**
         * Writes write the CDATA with no special manipulations.
         * @param  writer The writer to which write the HTML.
         */
        writeHtml : function(writer) {
            writer.write(this.value);
        }
    };
});/**
 * modified from ckeditor
 * @author <yiminghe@gmail.com>
 */
/*
 Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.html or http://ckeditor.com/license
 */
KISSY.Editor.add("htmlparser-comment", function() {
    var KE = KISSY.Editor,KEN = KE.NODE;

    /**
     * @constructor
     * @param value
     */
    function MComment(value) {
        /**
         * The comment text.
         * @type String
         * @example
         */
        this.value = value;

        /** @private */
        this._ =
        {
            isBlockLike : false
        };
    }

    KE.HtmlParser.Comment = MComment;
    KE.HtmlParser["Comment"] = MComment;
    MComment.prototype = {
        constructor:MComment,
        /**
         * The node type. This is a constant value set to  NODE_COMMENT.
         * @type Number
         * @example
         */
        type : KEN.NODE_COMMENT,

        /**
         * Writes the HTML representation of this comment to a CKEDITOR.htmlWriter.
         * @param  writer The writer to which write the HTML.
         * @example
         */
        writeHtml : function(writer, filter) {
            var comment = this.value;

            if (filter) {
                if (!( comment = filter.onComment(comment, this) ))
                    return;

                if (typeof comment != 'string') {
                    comment.parent = this.parent;
                    comment.writeHtml(writer, filter);
                    return;
                }
            }

            writer.comment(comment);
        }
    };
});
/**
 * triple state button for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("button", function () {
    var S = KISSY,
        KE = S.Editor,
        ON = "on",
        OFF = "off",
        UIBase=S.require("uibase"),
        DISABLED = "disabled",
        BUTTON_CLASS = "ke-triplebutton",
        ON_CLASS = "ke-triplebutton-on",
        OFF_CLASS = "ke-triplebutton-off",
        ACTIVE_CLASS = "ke-triplebutton-active",
        DISABLED_CLASS = "ke-triplebutton-disabled";

    if (KE.TripleButton) {
        S.log("TripleButton attach twice", "warn");
        return;
    }

    function getTipText(str) {
        if (str && str.indexOf("<") == -1) {
            return str;
        }
        return 0;
    }

    var TripleButton = UIBase.create([UIBase['Box']['Render']
        || UIBase['Box']
    ], {
        _updateHref:function () {
            var self = this;
            self.get("el").attr("href", "javascript:void('" +
                (getTipText(self.get("text")) || getTipText(self.get("title")) ) + "')");
        },
        bindUI:function () {
            var self = this, el = self.get("el");
            el.on("click", self['_action'], self);
            //添加鼠标点击视觉效果
            el.on("mousedown", function () {
                if (self.get("state") == OFF) {
                    el.addClass(ACTIVE_CLASS);
                }
            });
            el.on("mouseup mouseleave", function () {
                if (self.get("state") == OFF &&
                    el.hasClass(ACTIVE_CLASS)) {
                    //click 后出发
                    setTimeout(function () {
                        el.removeClass(ACTIVE_CLASS);
                    }, 300);
                }
            });
        },
        _uiSetTitle:function () {
            var self = this;
            self.get("el").attr("title", self.get("title"));
            self._updateHref();
        },
        _uiSetContentCls:function (contentCls) {
            var self = this,
                el = self.get("el");
            if (contentCls !== undefined) {
                el.html("<span class='ke-toolbar-item " + contentCls + "' />");
                //ie 失去焦点
                el._4e_unselectable();
            }
        },
        _uiSetText:function (text) {
            var self = this,
                el = self.get("el");
            el.html(text);
            self._updateHref();
        },
        _uiSetState:function (n) {
            this["_" + n]();
        },
        disable:function () {
            var self = this;
            self._savedState = self.get("state");
            self.set("state", DISABLED);
        },
        enable:function () {
            var self = this;
            if (self.get("state") == DISABLED)
                self.set("state", self._savedState);
        },
        _action:function (ev) {
            var self = this;
            self.fire(self.get("state") + "Click", {
                TripleEvent:ev
            });
            self.fire("click", {
                TripleClickType:self.get("state") + "Click"
            });
            ev && ev.preventDefault();
        },
        bon:function () {
            this.set("state", ON);
        },
        boff:function () {
            this.set("state", OFF);
        },
        _on:function () {
            var el = this.get("el");
            el.removeClass(OFF_CLASS + " " + DISABLED_CLASS);
            el.addClass(ON_CLASS);
        },
        _off:function () {
            var el = this.get("el");
            el.removeClass(ON_CLASS + " " + DISABLED_CLASS);
            el.addClass(OFF_CLASS);
        },
        _disabled:function () {
            var el = this.get("el");
            el.removeClass(OFF_CLASS + " " + ON_CLASS);
            el.addClass(DISABLED_CLASS);
        }
    }, {
        ATTRS:{
            state:{value:OFF},
            elCls:{value:[BUTTON_CLASS, OFF_CLASS].join(" ")},
//            elAttrs:{
//                value:{
//                    // can trigger keyboard click
//                    // href:"#",
//                    // onclick:"return false;"
//                    //可以被 tab 定位
//                    // tabIndex:0
//                }
//            },
            elTagName:{value:"a"},
            title:{},
            contentCls:{},
            text:{}
        }
    });

    TripleButton.ON = ON;
    TripleButton.OFF = OFF;
    TripleButton.DISABLED = DISABLED;
    TripleButton.ON_CLASS = ON_CLASS;
    TripleButton.OFF_CLASS = OFF_CLASS;
    TripleButton.DISABLED_CLASS = DISABLED_CLASS;


    KE.TripleButton = TripleButton;
    /**
     * 将button ui 和点击功能分离
     * 按钮必须立刻显示出来，功能可以慢慢加载
     * @param name
     * @param btnCfg
     */
    KE.prototype.addButton = function (name, btnCfg) {
        var self = this,
            editor = self,
            b = new TripleButton({
                render:self.toolBarDiv,
                autoRender:true,
                title:btnCfg.title,
                text:btnCfg.text,
                contentCls:btnCfg.contentCls
            }),
            context = {
                name:name,
                btn:b,
                editor:self,
                cfg:btnCfg,
                call:function () {
                    var args = S.makeArray(arguments),
                        method = args.shift();
                    return btnCfg[method].apply(context, args);
                },
                /**
                 * 依赖于其他模块，先出来占位！
                 * @param cfg
                 */
                reload:function (cfg) {
                    S.mix(btnCfg, cfg);
                    b.enable();
                    self.on("selectionChange", function () {
                        if (self.getMode() == KE.SOURCE_MODE) return;
                        btnCfg.selectionChange && btnCfg.selectionChange.apply(context, arguments);
                    });
                    b.on("click", function (ev) {
                        var t = ev.TripleClickType;
                        if (btnCfg[t]) btnCfg[t].apply(context, arguments);
                        ev && ev.halt();
                    });
                    if (btnCfg.mode == KE.WYSIWYG_MODE) {
                        editor.on("wysiwygmode", b.enable, b);
                        editor.on("sourcemode", b.disable, b);
                    }
                    btnCfg.init && btnCfg.init.call(context);
                },
                destroy:function () {
                    if (btnCfg['destroy']) btnCfg['destroy'].call(context);
                    b.destroy();
                }
            };
        if (btnCfg.loading) {
            b.disable();
        } else {
            //否则立即初始化，开始作用
            context.reload(undefined);
        }
        return context;
    };
}, {
    attach:false
});
/**
 * select component for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("select", function () {
    var S = KISSY,
        //UA = S.UA,
        Node = S.Node,
        Event = S.Event,
        DOM = S.DOM,
        KE = S.Editor,
        TITLE = "title",
        ke_select_active = "ke-select-active",
        ke_menu_selected = "ke-menu-selected",
        markup = "<span class='ke-select-wrap'>" +
            "<a class='ke-select'>" +
            "<span class='ke-select-text'><span class='ke-select-text-inner'></span></span>" +
            "<span class='ke-select-drop-wrap'>" +
            "<span class='ke-select-drop'></span>" +
            "</span>" +
            "</a></span>",
        menu_markup = "<div>";

    if (KE.Select) {
        S.log("ke select attach more");
        return;
    }
    /**
     * @constructor
     * @param cfg
     */
    function Select(cfg) {
        var self = this;
        Select['superclass'].constructor.call(self, cfg);
        self._init();
    }

    var DISABLED_CLASS = "ke-select-disabled",
        ENABLED = 1,
        DISABLED = 0;
    Select.DISABLED = DISABLED;
    Select.ENABLED = ENABLED;
    var dtd = KE.XHTML_DTD;

    Select.ATTRS = {
        //title标题栏显示值value还是name
        //默认false，显示name
        showValue:{},
        el:{},
        cls:{},
        container:{},
        doc:{},
        value:{},
        width:{},
        title:{},
        items:{},
        emptyText:{},
        //下拉框优先和select左左对齐，上下对齐
        //可以改作右右对齐，下上对齐
        align:{value:["l", "b"]},
        menuContainer:{
            valueFn:function () {
                //chrome 需要添加在能够真正包含div的地方
                var c = this.el.parent();
                while (c) {
                    var n = c._4e_name();
                    if (dtd[n] && dtd[n]["div"])
                        return c;
                    c = c.parent();
                }
                return new Node(document.body);
            }
        },
        state:{value:ENABLED}
    };
    Select.decorate = function (el) {
        var width = el.width() ,
            items = [],
            options = el.all("option");
        for (var i = 0; i < options.length; i++) {
            var opt = options[i];
            items.push({
                name:DOM.html(opt),
                value:DOM.attr(opt, "value")
            });
        }
        return new Select({
            width:width + "px",
            title:el.attr("title"),
            el:el,
            items:items,
            cls:"ke-combox",
            value:el.val()
        });

    };
    var addRes = KE.Utils.addRes, destroyRes = KE.Utils.destroyRes;

    function getTipText(str) {
        if (str && str.indexOf("<") == -1) {
            return str;
        }
        return 0;
    }

    S.extend(Select, S.Base, {
        _init:function () {
            var self = this,
                container = self.get("container"),
                fakeEl = self.get("el"),
                el = new Node(markup),
                titleA = el.one("a"),
                title = self.get(TITLE) || "",
                cls = self.get("cls"),
                text = el.one(".ke-select-text"),
                innerText = el.one(".ke-select-text-inner"),
                drop = el.one(".ke-select-drop");

            if (self.get("value") !== undefined) {
                innerText.html(self._findNameByV(self.get("value")));
            } else {
                innerText.html(title);
            }

            text.css("width", self.get("width"));
            //ie6,7 不失去焦点
            el._4e_unselectable();
            if (title) {
                el.attr(TITLE, title);
            }
            titleA.attr("href", "javascript:void('" + getTipText(title) + "')");
            if (cls) {
                el.addClass(cls);
            }
            if (fakeEl) {
                fakeEl[0].parentNode.replaceChild(el[0], fakeEl[0]);
            } else if (container) {
                el.appendTo(container);
            }
            el.on("click", self._click, self);
            self.el = el;
            self.title = innerText;
            self._focusA = el.one("a.ke-select");
            KE.Utils.lazyRun(this, "_prepare", "_real");
            self.on("afterValueChange", self._valueChange, self);
            self.on("afterStateChange", self._stateChange, self);
        },
        _findNameByV:function (v) {
            var self = this,
                name = self.get(TITLE) || "",
                items = self.get("items");
            //显示值，防止下拉描述过多
            if (self.get("showValue")) {
                return v || name;
            }
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (item.value == v) {
                    name = item.name;
                    break;
                }
            }
            return name;
        },

        /**
         * 当逻辑值变化时，更新select的显示值
         * @param ev
         */
        _valueChange:function (ev) {
            var v = ev.newVal,
                self = this,
                name = self._findNameByV(v);
            self.title.html(name);
        },

        _itemsChange:function (ev) {
            var self = this,
                empty,
                items = ev.newVal,
                _selectList = self._selectList;
            _selectList.html("");
            if (items && items.length) {
                for (var i = 0; i < items.length; i++) {
                    var item = items[i], a = new Node("<a " +
                        "class='ke-select-menu-item' " +
                        "href='javascript:void(\"" + getTipText(item.name) + "\")' data-value='" + item.value + "'>"
                        + item.name + "</a>", item.attrs)
                        .appendTo(_selectList)
                        ._4e_unselectable();
                }
            } else if (empty = self.get("emptyText")) {
                new Node("<a " +
                    "class='ke-select-menu-item' " +
                    "href='javascript:void(\"" + getTipText(empty) + "\")'>"
                    + empty + "</a>")
                    .appendTo(_selectList)
                    ._4e_unselectable();
            }
            self.as = _selectList.all("a");
        },
        val:function (v) {
            var self = this;
            if (v !== undefined) {
                self.set("value", v);
                return self;
            }
            else return self.get("value");
        },
        _resize:function () {
            var self = this,
                menu = self.menu;
            if (menu.get("visible")) {
                self._real();
            }
        },
        _prepare:function () {
            var self = this,
                el = self.el,
                popUpWidth = self.get("popUpWidth"),
                focusA = self._focusA,
                menuNode;
            //要在适当位置插入 !!!
            var menu = new KE.Overlay({
                autoRender:true,
                render:self.get("menuContainer"),
                content:menu_markup,
                focus4e:false,
                elCls:"ke-menu",
                width:popUpWidth ? popUpWidth : el.width(),
                zIndex:KE.baseZIndex(KE.zIndexManager.SELECT),
                focusMgr:false
            }),
                items = self.get("items");
            addRes.call(self, menu);
            menuNode = menu.get("contentEl").one("div");
            self.menu = menu;
            //缩放，下拉框跟随
            Event.on(window, "resize", self._resize, self);

            addRes.call(self, function () {
                Event.remove(window, "resize", self._resize, self);
            });

            if (self.get(TITLE)) {
                new Node("<div class='ke-menu-title ke-select-menu-item' " +
                    "style='" +
                    "margin-top:-6px;" +
                    "' " +
                    ">" + self.get("title") + "</div>").appendTo(menuNode);
            }
            self._selectList = new Node("<div>").appendTo(menuNode);

            self._itemsChange({newVal:items});


            menu.on("show", function () {
                focusA.addClass(ke_select_active);
            });
            menu.on("hide", function () {
                focusA.removeClass(ke_select_active);
            });
            function deactivate(ev) {
                //ev && ev.halt();
                var t = new Node(ev.target);
                if (el.contains(t) || el._4e_equals(t)) return;
                menu.hide();
            }

            Event.on(document, "click", deactivate);
            addRes.call(self, function () {
                Event.remove(document, "click", deactivate);
            });
            if (self.get("doc"))
                Event.on(self.get("doc"), "click", deactivate);

            menuNode.on("click", self._select, self);
            self.as = self._selectList.all("a");

            //mouseenter kissy core bug
            Event.on(menuNode[0], 'mouseenter', function () {
                self.as.removeClass(ke_menu_selected);
            });
            addRes.call(self, menuNode);
            self.on("afterItemsChange", self._itemsChange, self);
            self.menuNode = menuNode;
        },
        _stateChange:function (ev) {
            var v = ev.newVal, el = this.el;
            if (v == ENABLED) {
                el.removeClass(DISABLED_CLASS);
            } else {
                el.addClass(DISABLED_CLASS);
            }
        },
        enable:function () {
            this.set("state", ENABLED);
        },
        disable:function () {
            this.set("state", DISABLED);
        },
        _select:function (ev) {
            ev && ev.halt();
            var self = this,
                menu = self.menu,
                menuNode = self.menuNode,
                t = new Node(ev.target),
                a = t._4e_ascendant(function (n) {
                    return menuNode.contains(n) && n._4e_name() == "a";
                }, true);

            if (!a || !a._4e_hasAttribute("data-value")) return;

            var preVal = self.get("value"),
                newVal = a.attr("data-value");
            //更新逻辑值
            self.set("value", newVal);

            //触发 click 事件，必要时可监听 afterValueChange
            self.fire("click", {
                newVal:newVal,
                prevVal:preVal,
                name:a.html()
            });

            menu.hide();
        },
        _real:function () {
            var self = this,
                el = self.el,
                xy = el.offset(),
                orixy = S.clone(xy),
                menuHeight = self.menu.get("el").height(),
                menuWidth = self.menu.get("el").width(),
                wt = DOM.scrollTop(),
                wl = DOM.scrollLeft(),
                wh = DOM.viewportHeight() ,
                ww = DOM.viewportWidth(),
                //右边界坐标,60 is buffer
                wr = wl + ww - 60,
                //下边界坐标
                wb = wt + wh,
                //下拉框向下弹出的y坐标
                sb = xy.top + (el.height() - 2),
                //下拉框右对齐的最右边x坐标
                sr = xy.left + el.width() - 2,
                align = self.get("align"),
                xAlign = align[0],
                yAlign = align[1];


            if (yAlign == "b") {
                //向下弹出优先
                xy.top = sb;
                if (
                    (
                        //不能显示完全
                        (xy.top + menuHeight) > wb
                        )
                        &&
                        (   //向上弹能显示更多
                            (orixy.top - wt) > (wb - sb)
                            )
                    ) {
                    xy.top = orixy.top - menuHeight;
                }
            } else {
                //向上弹出优先
                xy.top = orixy.top - menuHeight;

                if (
                //不能显示完全
                    xy.top < wt
                        &&
                        //向下弹能显示更多
                        (orixy.top - wt) < (wb - sb)
                    ) {
                    xy.top = sb;
                }
            }

            if (xAlign == "l") {
                //左对其优先
                if (
                //左对齐不行
                    (xy.left + menuWidth > wr)
                        &&
                        //右对齐可以弹出更多
                        (
                            (sr - wl) > (wr - orixy.left)
                            )

                    ) {
                    xy.left = sr - menuWidth;
                }
            } else {
                //右对齐优先
                xy.left = sr - menuWidth;
                if (
                //右对齐不行
                    xy.left < wl
                        &&
                        //左对齐可以弹出更多
                        (sr - wl) < (wr - orixy.left)
                    ) {
                    xy.left = orixy.left;
                }
            }
            self.menu.set("xy", [xy.left, xy.top]);
            self.menu.show();
        },
        _click:function (ev) {
            if (this.loading) return;
            ev && ev.preventDefault();

            var self = this,
                el = self.el,
                v = self.get("value");

            if (el.hasClass(DISABLED_CLASS)) {
                return;
            }

            if (self._focusA.hasClass(ke_select_active)) {
                self.menu && self.menu.hide();
                return;
            }

            self.loading = true;
            KE.use("overlay", function () {
                self.loading = false;
                self.fire("select");
                self._prepare();

                //可能的话当显示层时，高亮当前值对应option
                if (v && self.menu) {
                    var as = self.as;
                    as.each(function (a) {
                        if (a.attr("data-value") == v) {
                            a.addClass(ke_menu_selected);
                        } else {
                            a.removeClass(ke_menu_selected);
                        }
                    });
                }
            });
        },
        destroy:function () {
            destroyRes.call(this);
            this.el.detach();
            this.el.remove();
        }
    });

    KE.Select = Select;


    /**
     * 将button ui 和点击功能分离
     * 按钮必须立刻显示出来，功能可以慢慢加载
     * @param name
     * @param btnCfg
     */
    KE.prototype.addSelect = function (name, btnCfg) {
        var self = this,
            editor = self;
        btnCfg = S.mix({
            container:self.toolBarDiv,
            doc:editor.document,
            menuContainer:new Node(document.body)
        }, btnCfg);

        var b = new Select(btnCfg),
            context = {
                name:name,
                btn:b,
                editor:self,
                cfg:btnCfg,
                call:function () {
                    var args = S.makeArray(arguments),
                        method = args.shift();
                    return btnCfg[method].apply(context, args);
                },
                /**
                 * 依赖于其他模块，先出来占位！
                 * @param cfg
                 */
                reload:function (cfg) {
                    S.mix(btnCfg, cfg);
                    b.enable();
                    self.on("selectionChange", function () {
                        if (self.getMode() == KE.SOURCE_MODE) return;
                        btnCfg.selectionChange && btnCfg.selectionChange.apply(context, arguments);
                    });
                    b.on("click", function (ev) {
                        var t = ev.type;
                        if (btnCfg[t]) btnCfg[t].apply(context, arguments);
                        ev && ev.halt();
                    });
                    if (btnCfg.mode == KE.WYSIWYG_MODE) {
                        editor.on("wysiwygmode", b.enable, b);
                        editor.on("sourcemode", b.disable, b);
                    }
                    btnCfg.init && btnCfg.init.call(context);

                },
                destroy:function () {
                    if (btnCfg.destroy) {
                        btnCfg.destroy.call(context);
                    }
                    b.destroy();
                }
            };
        if (btnCfg.loading) {
            b.disable();
        } else {
            //否则立即初始化，开始作用
            context.reload(undefined);
        }
        return context;
    };
}, {
    attach:false
});/**
 * bubble or tip view for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("bubbleview", function () {
    var S = KISSY,
        UA = S.UA,
        KE = S.Editor,
        Event = S.Event,
        DOM = S.DOM;

    if (KE.BubbleView) {
        S.log("attach bubbleview more", "warn");
        return;
    }

    var BubbleView = S.require("uibase").create(KE.Overlay, [], {
        renderUI:function () {
            var el = this.get("el");
            el.addClass("ke-bubbleview-bubble");
        },
        show:function () {
            var el = this.get("el");
            el.css("visibility", "hidden");
            el.stop(1);
            el.css("display", 'none');
            this.set("visible", true);
            el.fadeIn(0.3);
        },
        hide:function () {
            var el = this.get("el");
            el.css("visibility", "hidden");
            el.stop(1);
            this.set("visible", false);
        },
        destructor:function () {
            KE.Utils.destroyRes.call(this);
        }
    }, {
        ATTRS:{
            focus4e:{
                value:false
            },
            "zIndex":{
                value:KE.baseZIndex(KE.zIndexManager.BUBBLE_VIEW)
            }
        }
    });

    var holder = {};

    function inRange(t, b, r) {
        return t <= r && b >= r;
    }

    /**
     * 是否两个bubble上下重叠？
     * @param b1
     * @param b2
     */
    function overlap(b1, b2) {
        var b1_top = b1.get("y"), b1_bottom = b1_top + b1.get("el")[0].offsetHeight;

        var b2_top = b2.get("y"), b2_bottom = b2_top + b2.get("el")[0].offsetHeight;

        return inRange(b1_top, b1_bottom, b2_bottom) || inRange(b1_top, b1_bottom, b2_top);
    }

    /**
     * 得到依附在同一个节点上的所有bubbleview中的最下面一个
     * @param self
     */
    function getTopPosition(self) {
        var archor = null;
        for (var p in holder) {
            if (holder.hasOwnProperty(p)) {
                var h = holder[p];
                if (h.bubble) {
                    if (self != h.bubble
                        && h.bubble.get("visible")
                        && overlap(self, h.bubble)
                        ) {
                        if (!archor) {
                            archor = h.bubble;
                        } else if (archor.get("y") < h.bubble.get("y")) {
                            archor = h.bubble;
                        }
                    }
                }
            }
        }
        return archor;
    }

    function getXy(bubble, editor) {

        var el = bubble._selectedEl;

        if (!el) {
            //S.log("bubble already detached from el");
            return undefined;
        }

        var editorWin = editor.iframe[0].contentWindow;

        var iframeXY = editor.iframe.offset(),
            top = iframeXY.top,
            left = iframeXY.left,
            right = left + DOM.width(editorWin),
            bottom = top + DOM.height(editorWin),
            elXY = el._4e_getOffset(document),
            elTop = elXY.top,
            elLeft = elXY.left,
            elRight = elLeft + el.width(),
            elBottom = elTop + el.height();

        var x, y;

        // ie 图片缩放框大于编辑区域底部，bubble 点击不了了，干脆不显示
        if (S.UA.ie &&
            el[0].nodeName.toLowerCase() == 'img' &&
            elBottom > bottom) {
            return undefined;
        }

        // 对其下边
        // el 位于编辑区域，下边界超了编辑区域下边界
        if (elBottom > bottom && elTop < bottom) {
            // 别挡着滚动条
            y = bottom - 30;
        }
        // el bottom 在编辑区域内
        else if (elBottom > top && elBottom < bottom) {
            y = elBottom;
        }

        // 同上，对齐左边
        if (elRight > left && elLeft < left) {
            x = left;
        } else if (elLeft > left && elLeft < right) {
            x = elLeft;
        }

        if (x !== undefined && y !== undefined) {
            return [x, y];
        }
        return undefined;
    }

    function getInstance(pluginName) {
        var h = holder[pluginName];
        if (!h.bubble) {
            h.bubble = new BubbleView();
            h.bubble.render();
            if (h.cfg.init) {
                h.cfg.init.call(h.bubble);
            }
        }
        return h.bubble;
    }


    BubbleView.destroy = function (pluginName) {
        var h = holder[pluginName];
        if (h && h.bubble) {
            h.bubble.destroy();
            h.bubble = null;
        }
    };

    BubbleView.attach = function (cfg) {
        var pluginName = cfg.pluginName,
            cfgDef = holder[pluginName];
        S.mix(cfg, cfgDef.cfg, false);
        var pluginContext = cfg.pluginContext,
            func = cfg.func,
            editor = cfg.editor,
            bubble = cfg.bubble;
        // 借鉴google doc tip提示显示
        editor.on("selectionChange", function (ev) {
            var elementPath = ev.path,
                elements = elementPath.elements,
                a,
                lastElement;
            if (elementPath && elements) {
                lastElement = elementPath.lastElement;
                if (!lastElement) {
                    return;
                }
                a = func(lastElement);
                if (a) {
                    bubble = getInstance(pluginName);
                    bubble._selectedEl = a;
                    bubble._plugin = pluginContext;
                    // 重新触发 bubble show事件
                    bubble.hide();
                    // 等所有bubble hide 再show
                    S.later(onShow, 10);
                } else if (bubble) {
                    bubble._selectedEl = bubble._plugin = null;
                    onHide();
                }
            }
        });
        //代码模式下就消失
        //!TODO 耦合---
        function onHide() {
            if (bubble) {
                bubble.hide();
                Event.remove(editorWin, "scroll", onScroll);
            }
        }

        editor.on("sourcemode", onHide);

        var editorWin = editor.iframe[0].contentWindow;

        function showImmediately() {

            var xy = getXy(bubble, editor);
            if (xy) {
                bubble.set("xy", xy);
                var archor = getTopPosition(bubble);
                if (!archor) {
                } else {
                    xy[1] = archor.get("y") + archor.get("el")[0].offsetHeight;
                    bubble.set("xy", xy);
                }
                if (!bubble.get("visible")) {
                    bubble.show();
                } else {
                    S.log("already show by selectionChange");
                }
            }
        }

        var bufferScroll = KE.Utils.buffer(showImmediately, undefined, 350);


        function onScroll() {
            if (!bubble._selectedEl) {
                return;
            }
            if (bubble) {
                var el = bubble.get("el");
                bubble.hide();
            }
            bufferScroll();
        }

        function onShow() {
            Event.on(editorWin, "scroll", onScroll);
            showImmediately();
        }
    };

    BubbleView.register = function (cfg) {
        var pluginName = cfg.pluginName;
        holder[pluginName] = holder[pluginName] || {
            cfg:cfg
        };
        if (cfg.editor) {
            BubbleView.attach(cfg);
        }
    };

    KE.BubbleView = BubbleView;
}, {
    attach:false,
    requires:["overlay"]
});/**
 * monitor user's paste key ,clear user input,modified from ckeditor
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("clipboard", function (editor) {
    var S = KISSY,
        KE = S.Editor,
        Node = S.Node,
        UA = S.UA,
        KERange = KE.Range,
        KER = KE.RANGE,
        Event = S.Event;
    if (!KE.Paste) {
        (function () {

            function Paste(editor) {
                var self = this;
                self.editor = editor;
                self._init();
            }

            S.augment(Paste, {
                _init:function () {
                    var self = this,
                        editor = self.editor;
                    // Event.on(editor.document.body, UA['ie'] ? "beforepaste" : "keydown", self._paste, self);
                    // beforepaste not fire on webkit and firefox
                    // paste fire too later in ie ,cause error
                    // 奇怪哦
                    // refer : http://stackoverflow.com/questions/2176861/javascript-get-clipboard-data-on-paste-event-cross-browser
                    Event.on(editor.document.body,
                        UA['webkit'] ? 'paste' : (UA.gecko ? 'paste' : 'beforepaste'),
                        self._paste, self);

                    // Dismiss the (wrong) 'beforepaste' event fired on context menu open. (#7953)
                    Event.on(editor.document.body, 'contextmenu', function () {
                        depressBeforeEvent = 1;
                        setTimeout(function () {
                            depressBeforeEvent = 0;
                        }, 10);
                    });
                    editor.addCommand("copy", new cutCopyCmd("copy"));
                    editor.addCommand("cut", new cutCopyCmd("cut"));
                    editor.addCommand("paste", new cutCopyCmd("paste"));

                },
                _paste:function (ev) {

                    if (depressBeforeEvent) {
                        return;
                    }

                    // ie beforepaste 会触发两次，第一次 pastebin 为锚点内容，奇怪
                    // chrome keydown 也会两次
                    S.log(ev.type + " : " + " paste event happen");

                    var self = this,
                        editor = self.editor,
                        doc = editor.document;

                    // Avoid recursions on 'paste' event or consequent paste too fast. (#5730)
                    if (doc.getElementById('ke_pastebin')) {
                        // ie beforepaste 会重复触发
                        // chrome keydown 也会重复触发
                        // 第一次 bms 是对的，但是 pasterbin 内容是错的
                        // 第二次 bms 是错的，但是内容是对的
                        // 这样返回刚好，用同一个 pastebin 得到最后的正确内容
                        // bms 第一次时创建成功
                        S.log(ev.type + " : trigger more than once ...");
                        return;
                    }

                    var sel = editor.getSelection(),
                        range = new KERange(doc);

                    // Create container to paste into
                    var pastebin = new Node(UA['webkit'] ? '<body></body>' : '<div></div>', null, doc);
                    pastebin.attr('id', 'ke_pastebin');
                    // Safari requires a filler node inside the div to have the content pasted into it. (#4882)
                    UA['webkit'] && pastebin[0].appendChild(doc.createTextNode('\xa0'));
                    doc.body.appendChild(pastebin[0]);

                    pastebin.css({
                        position:'absolute',
                        // Position the bin exactly at the position of the selected element
                        // to avoid any subsequent document scroll.
                        top:sel.getStartElement().offset().top + 'px',
                        width:'1px',
                        height:'1px',
                        overflow:'hidden'
                    });

                    // It's definitely a better user experience if we make the paste-bin pretty unnoticed
                    // by pulling it off the screen.
                    pastebin.css('left', '-1000px');

                    var bms = sel.createBookmarks();

                    // Turn off design mode temporarily before give focus to the paste bin.
                    range.setStartAt(pastebin, KER.POSITION_AFTER_START);
                    range.setEndAt(pastebin, KER.POSITION_BEFORE_END);
                    range.select(true);
                    //self._running = true;
                    // Wait a while and grab the pasted contents
                    setTimeout(function () {

                        //self._running = false;
                        pastebin._4e_remove();

                        // Grab the HTML contents.
                        // We need to look for a apple style wrapper on webkit it also adds
                        // a div wrapper if you copy/paste the body of the editor.
                        // Remove hidden div and restore selection.
                        var bogusSpan;

                        pastebin = ( UA['webkit']
                            && ( bogusSpan = pastebin._4e_first() )
                            && (bogusSpan.hasClass('Apple-style-span') ) ?
                            bogusSpan : pastebin );

                        sel.selectBookmarks(bms);

                        var html = pastebin.html();

                        //S.log("paster " + html);

                        //莫名其妙会有这个东西！，不知道
                        //去掉
                        if (!( html = S.trim(html.replace(/<span[^>]+_ke_bookmark[^<]*?<\/span>(&nbsp;)*/ig, '')) )) {
                            // ie 第2次触发 beforepaste 会报错！
                            // 第一次 bms 是对的，但是 pasterbin 内容是错的
                            // 第二次 bms 是错的，但是内容是对的
                            return;
                        }

                        S.log("paster " + html);

                        var re = editor.fire("paste", {
                            html:html,
                            holder:pastebin
                        });

                        if (re !== undefined) {
                            html = re;
                        }

                        var dataFilter = null;

                        // MS-WORD format sniffing.
                        if (/(class="?Mso|style="[^"]*\bmso\-|w:WordDocument)/.test(html)) {
                            dataFilter = editor.htmlDataProcessor.wordFilter;
                        }

                        editor.insertHtml(html, dataFilter);

                    }, 0);
                }
            });
            KE.Paste = Paste;


            // Tries to execute any of the paste, cut or copy commands in IE. Returns a
            // boolean indicating that the operation succeeded.
            var execIECommand = function (editor, command) {
                var doc = editor.document,
                    body = new Node(doc.body);

                var enabled = false;
                var onExec = function () {
                    enabled = true;
                };

                // The following seems to be the only reliable way to detect that
                // clipboard commands are enabled in IE. It will fire the
                // onpaste/oncut/oncopy events only if the security settings allowed
                // the command to execute.
                body.on(command, onExec);

                // IE6/7: document.execCommand has problem to paste into positioned element.
                ( UA['ie'] > 7 ? doc : doc.selection.createRange() ) [ 'execCommand' ](command);

                body.detach(command, onExec);

                return enabled;
            };

            // Attempts to execute the Cut and Copy operations.
            var tryToCutCopy =
                UA['ie'] ?
                    function (editor, type) {
                        return execIECommand(editor, type);
                    }
                    : // !IE.
                    function (editor, type) {
                        try {
                            // Other browsers throw an error if the command is disabled.
                            return editor.document.execCommand(type);
                        }
                        catch (e) {
                            return false;
                        }
                    };

            var error_types = {
                "cut":"您的浏览器安全设置不允许编辑器自动执行剪切操作，请使用键盘快捷键(Ctrl/Cmd+X)来完成",
                "copy":"您的浏览器安全设置不允许编辑器自动执行复制操作，请使用键盘快捷键(Ctrl/Cmd+C)来完成",
                "paste":"您的浏览器安全设置不允许编辑器自动执行粘贴操作，请使用键盘快捷键(Ctrl/Cmd+V)来完成"
            };

            // A class that represents one of the cut or copy commands.
            var cutCopyCmd = function (type) {
                this.type = type;
                this.canUndo = ( this.type == 'cut' );		// We can't undo copy to clipboard.
            };

            cutCopyCmd.prototype =
            {
                exec:function (editor) {
                    this.type == 'cut' && fixCut(editor);

                    var success = tryToCutCopy(editor, this.type);

                    if (!success)
                        alert(error_types[this.type]);		// Show cutError or copyError.

                    return success;
                }
            };
            var KES = KE.Selection;
            // Cutting off control type element in IE standards breaks the selection entirely. (#4881)
            function fixCut(editor) {
                if (!UA['ie'] ||
                    editor.document.compatMode == 'BackCompat')
                    return;

                var sel = editor.getSelection();
                var control;
                if (( sel.getType() == KES.SELECTION_ELEMENT ) && ( control = sel.getSelectedElement() )) {
                    var range = sel.getRanges()[ 0 ];
                    var dummy = new Node(editor.document.createTextNode(''));
                    dummy.insertBefore(control);
                    range.setStartBefore(dummy);
                    range.setEndAfter(control);
                    sel.selectRanges([ range ]);

                    // Clear up the fix if the paste wasn't succeeded.
                    setTimeout(function () {
                        // Element still online?
                        if (control.parent()) {
                            dummy.remove();
                            sel.selectElement(control);
                        }
                    }, 0);
                }
            }

            var lang = {
                "copy":"复制",
                "paste":"粘贴",
                "cut":"剪切"
            };

            var depressBeforeEvent;

            function stateFromNamedCommand(command, doc) {
                // IE queryCommandEnabled('paste') 触发 beforepaste , 前面监控 beforepaste 生成 bin 了
                depressBeforeEvent = 1;
                var ret = true;
                try {
                    ret = doc['queryCommandEnabled'](command) ?
                        true :
                        false;
                } catch (e) {
                }
                depressBeforeEvent = 0;
                return ret;
            }

            /**
             * 给所有右键都加入复制粘贴
             */
            KE.on("contextmenu", function (ev) {
                //debugger
                var contextmenu = ev.contextmenu,
                    editor = contextmenu.cfg["editor"],
                    //原始内容
                    el = contextmenu.elDom,
                    pastes = {"copy":0, "cut":0, "paste":0},
                    tips = {
                        "copy":"Ctrl/Cmd+C",
                        "cut":"Ctrl/Cmd+X",
                        "paste":"Ctrl/Cmd+V"
                    };
                for (var i in pastes) {
                    if (pastes.hasOwnProperty(i)) {
                        pastes[i] = el.one(".ke-paste-" + i);
                        (function (cmd) {
                            var cmdObj = pastes[cmd];
                            if (!cmdObj) {
                                cmdObj = new Node("<a href='#'" +
                                    "class='ke-paste-" + cmd + "'>"
                                    + lang[cmd]
                                    + "</a>").appendTo(el);
                                cmdObj.on("click", function (ev) {
                                    ev.halt();
                                    contextmenu.hide();
                                    //给 ie 一点 hide() 中的事件触发 handler 运行机会，
                                    // 原编辑器获得焦点后再进行下步操作
                                    setTimeout(function () {
                                        editor.execCommand(cmd);
                                    }, 30);
                                });
                                pastes[cmd] = cmdObj;
                            }

                        })(i);
                    }
                }
            });
        })();
    }
    editor.ready(function () {
        new KE.Paste(editor);
    });
}, {
    attach:false
});
KISSY.Editor.add("color", function (editor) {
    editor.addPlugin("color", function () {
        var S = KISSY,
            KE = S.Editor;
        var pluginConfig = editor.cfg.pluginConfig;
        var destroys = [];
        if (false !== pluginConfig["forecolor"]) {
            (function () {
                var COLOR_STYLES = {
                    element:'span',
                    styles:{ 'color':'#(color)' },
                    overrides:[
                        { element:'font', attributes:{ 'color':null } }
                    ],
                    childRule:function (el) {
                        // <span style='color:red'><a href='g.cn'>abcdefg</a></span>
                        // 不起作用
                        return !(el._4e_name() == "a" || el.all("a").length);
                    }
                },
                    context = editor.addButton("color", {
                        styles:COLOR_STYLES,
                        mode:KE.WYSIWYG_MODE,
                        title:"文本颜色",
                        loading:true,
                        contentCls:"ke-toolbar-color"
                    });
                /**
                 * 注意：use 可同时在模块以及实例上 use
                 */
                KE.use("colorsupport", function () {
                    context.reload(KE.ColorSupport);
                });
                destroys.push(function () {
                    context.destroy();
                });
            })();
        }
        if (false !== pluginConfig["bgcolor"]) {
            (function () {
                var colorButton_backStyle = {
                    element:'span',
                    styles:{ 'background-color':'#(color)' },
                    overrides:[
                        { element:'*', styles:{ 'background-color':null } }
                    ],
                    childRule:function () {
                        // 强制最里面
                        // <span style='bgcolor:red'><span style='font-size:100px'>123434</span></span>
                        return false;
                    }
                };
                var context = editor.addButton("bgcolor", {
                    styles:colorButton_backStyle,
                    title:"背景颜色",
                    mode:KE.WYSIWYG_MODE,
                    loading:true,
                    contentCls:"ke-toolbar-bgcolor"
                });
                KE.use("colorsupport", function () {
                    context.reload(KE.ColorSupport);
                });
                destroys.push(function () {
                    context.destroy();
                });
            })();
        }


        this.destroy = function () {
            for (var i = 0; i < destroys.length; i++) {
                destroys[i]();
            }
        }
    });
}, {
    attach:false
});/**
 * color support for kissy editor
 * @author : yiminghe@gmail.com
 */
KISSY.Editor.add("colorsupport", function() {
    var S = KISSY,
        KE = S.Editor,
        Node = S.Node,
        Event = S.Event,
        DOM = S.DOM;

    DOM.addStyleSheet(".ke-color-panel a {" +
        "display: block;" +
        "color:black;" +
        "text-decoration: none;" +
        "}" +
        "" +
        ".ke-color-panel a:hover {" +
        "color:black;" +
        "text-decoration: none;" +
        "}" +
        ".ke-color-panel a:active {" +
        "color:black;" +
        "}" +

        ".ke-color-palette {" +
        "    margin: 5px 8px 8px;" +
        "}" +

        ".ke-color-palette table {" +
        "    border: 1px solid #666666;" +
        "    border-collapse: collapse;" +
        "}" +

        ".ke-color-palette td {" +
        "    border-right: 1px solid #666666;" +
        "    height: 18px;" +
        "    width: 18px;" +
        "}" +

        "a.ke-color-a {" +
        "    height: 18px;" +
        "    width: 18px;" +
        "}" +

        "a.ke-color-a:hover {" +
        "    border: 1px solid #ffffff;" +
        "    height: 16px;" +
        "    width: 16px;" +
        "}" +
        "a.ke-color-remove {" +
        "  padding:3px 8px;" +
        "  margin:2px 0 3px 0;" +
        "}" +
        "a.ke-color-remove:hover {" +
        "    background-color: #D6E9F8;" +
        "}", "ke-color-plugin");

    var COLORS = [
        ["000", "444", "666", "999", "CCC", "EEE", "F3F3F3", "FFF"],
        ["F00", "F90", "FF0", "0F0", "0FF", "00F", "90F", "F0F"],
        [
            "F4CCCC", "FCE5CD", "FFF2CC", "D9EAD3", "D0E0E3", "CFE2F3", "D9D2E9", "EAD1DC",
            "EA9999", "F9CB9C", "FFE599", "B6D7A8", "A2C4C9", "9FC5E8", "B4A7D6", "D5A6BD",
            "E06666", "F6B26B", "FFD966", "93C47D", "76A5AF", "6FA8DC", "8E7CC3", "C27BAD",
            "CC0000", "E69138", "F1C232", "6AA84F", "45818E", "3D85C6", "674EA7", "A64D79",
            "990000", "B45F06", "BF9000", "38761D", "134F5C", "0B5394", "351C75", "741B47",
            "660000", "783F04", "7F6000", "274E13", "0C343D", "073763", "20124D", "4C1130"
        ]
    ],html;


    function initHtml() {
        if (html) return;
        html = "<div class='ke-color-panel'>" +
            "<a class='ke-color-remove' " +
            "href=\"javascript:void('清除');\">" +
            "清除" +
            "</a>";
        for (var i = 0; i < 3; i++) {
            html += "<div class='ke-color-palette'><table>";
            var c = COLORS[i],l = c.length / 8;
            for (var k = 0; k < l; k++) {
                html += "<tr>";
                for (var j = 0; j < 8; j++) {
                    var currentColor = "#" + (c[8 * k + j]);
                    html += "<td>";
                    html += "<a href='javascript:void(0);' " +
                        "class='ke-color-a' " +
                        "style='background-color:"
                        + currentColor
                        + "'" +
                        "></a>";
                    html += "</td>";
                }
                html += "</tr>";
            }
            html += "</table></div>";
        }
        html += "" +
            "<div>" +
            "<a class='ke-button ke-color-others'>其他颜色</a>" +
            "</div>" +
            "</div>";
    }

    var addRes = KE.Utils.addRes,destroyRes = KE.Utils.destroyRes;
    KE.ColorSupport = {
        offClick:function(ev) {
            var self = this,
                cfg = self.cfg;
            KE.use("overlay", function() {
                cfg._prepare.call(self, ev);
            });
        },
        onClick:function() {
            this.colorWin && this.colorWin.hide();
        },
        _prepare:function() {
            var self = this,
                cfg = self.cfg,
                doc = document,
                el = self.btn,
                editor = self.editor,
                colorPanel;
            initHtml();
            self.colorWin = new KE.Overlay({
                elCls:"ks-popup",
                content:html,
                focus4e:false,
                autoRender:true,
                width:"170px",
                zIndex:KE.baseZIndex(KE.zIndexManager.POPUP_MENU)
            });

            var colorWin = self.colorWin;
            colorPanel = colorWin.get("contentEl");
            colorPanel.on("click", cfg._selectColor, self);
            Event.on(doc, "click", cfg._hidePanel, self);
            Event.on(editor.document, "click", cfg._hidePanel, self);
            colorWin.on("show", el.bon, el);
            colorWin.on("hide", el.boff, el);
            var others = colorPanel.one(".ke-color-others");
            others.on("click", function(ev) {
                ev.halt();
                colorWin.hide();
                editor.showDialog("color/dialog", [self]);
            });
            cfg._prepare = cfg._show;
            cfg._show.call(self);

            addRes.call(self, colorPanel, colorWin, others);

        },
        _show:function() {
            var self = this,
                el = self.btn.get("el"),
                colorWin = self.colorWin,
                panelWidth = parseInt(colorWin.get("width")),
                margin = 30,
                viewWidth = DOM.viewportWidth();
            colorWin.align(el, ["bl","tl"], [0,2]);
            if (colorWin.get("x") + panelWidth
                > viewWidth - margin) {
                colorWin.set("x", viewWidth - margin - panelWidth);
            }
            colorWin.show();
        },
        _hidePanel : function(ev) {
            var self = this,
                el = self.btn.get("el"),
                t = new Node(ev.target),
                colorWin = self.colorWin;
            //当前按钮点击无效
            if (el._4e_equals(t)
                || el.contains(t)) {
                return;
            }
            colorWin.hide();
        },
        _selectColor : function(ev) {
            ev.halt();
            var self = this,
                cfg = self.cfg,
                t = new Node(ev.target);
            if (t._4e_name() == "a" && !t.hasClass("ke-button")) {
                cfg._applyColor.call(self, t._4e_style("background-color"));
                self.colorWin.hide();
            }
        },
        _applyColor : function(c) {
            var self = this,
                editor = self.editor,
                doc = editor.document,
                styles = self.cfg.styles;

            editor.fire("save");
            if (c) {
                new KE.Style(styles, {
                    color:c
                }).apply(doc);
            } else {
                // Value 'inherit'  is treated as a wildcard,
                // which will match any value.
                //清除已设格式
                new KE.Style(styles, {
                    color:"inherit"
                }).remove(doc);
            }
            editor.fire("save");
        },

        destroy:function() {
            destroyRes.call(this);
            var self = this,
                editor = self.editor,
                cfg = self.cfg,
                doc = document;
            Event.remove(doc, "click", cfg._hidePanel, self);
            editor.destroyDialog("color/dialog")
        }
    };
}, {
    attach:false
});
/**
 * contextmenu for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("contextmenu", function() {
    var S = KISSY,
        KE = S.Editor,
        Node = S.Node,
        DOM = S.DOM,
        Event = S.Event,
        HTML = "<div>";
    if (KE.ContextMenu) {
        S.log("attach ContextMenu twice", "warn");
        return;
    }

    /**
     * 组合使用 overlay
     * @param config
     */
    function ContextMenu(config) {
        this.cfg = config;
        //editor太复杂，防止循环引用
        //S.clone(config);
        KE.Utils.lazyRun(this, "_prepareShow", "_realShow");
    }

    //暂时将 editor 同 右键关联。
    ContextMenu.ATTRS = {
        editor:{}
    };

    var global_rules = [];
    /**
     * 多菜单管理
     */
    ContextMenu.register = function(cfg) {

        var cm = new ContextMenu(cfg),
            editor = cfg.editor,
            doc = editor.document;

        global_rules.push({
            doc:doc,
            rules:cfg.rules || [],
            instance:cm
        });

        if (!doc.ke_contextmenu) {
            doc.ke_contextmenu = 1;
            Event.on(doc, "mousedown", ContextMenu.hide);
            editor.on("sourcemode", ContextMenu.hide, doc);
            /*
             Event.on(doc, "contextmenu", function(ev) {
             ev.preventDefault();
             });*/
            Event.on(doc.body,
                //"mouseup"
                "contextmenu",
                function(ev) {
                    /*
                     if (ev.which != 3)
                     return;
                     */
                    ContextMenu.hide.call(this);
                    var t = new Node(ev.target);
                    while (t) {
                        var name = t._4e_name(),
                            stop = false;
                        if (name == "body") {
                            break;
                        }
                        for (var i = 0; i < global_rules.length; i++) {
                            var instance = global_rules[i].instance,
                                rules = global_rules[i].rules,
                                doc2 = global_rules[i].doc;
                            if (doc === doc2 &&
                                applyRules(t[0], rules)) {
                                ev.preventDefault();
                                stop = true;
                                //ie 右键作用中，不会发生焦点转移，光标移动
                                //只能右键作用完后才能，才会发生光标移动,range变化
                                //异步右键操作
                                //qc #3764,#3767
                                var x = ev.pageX,
                                    y = ev.pageY;
                                //ie9 没有pageX,pageY,clientX,clientY
                                if (!x) {
                                    var xy = t._4e_getOffset();
                                    x = xy.left;
                                    y = xy.top;
                                }
                                setTimeout(function() {
                                    instance.show(KE.Utils.getXY(x, y, doc,
                                        document));
                                }, 30);

                                break;
                            }
                        }
                        if (stop) {
                            break;
                        }
                        t = t.parent();
                    }
                });
        }
        return cm;
    };

    function applyRules(elem, rules) {
        for (var i = 0;
             i < rules.length;
             i++) {
            var rule = rules[i];
            //增加函数判断
            if (S.isFunction(rule)) {
                if (rule(new Node(elem))) return true;
            }
            else if (DOM.test(elem, rule))return true;
        }
        return false;
    }

    ContextMenu.hide = function() {
        var doc = this;
        for (var i = 0;
             i < global_rules.length;
             i++) {
            var instance = global_rules[i].instance,
                doc2 = global_rules[i].doc;
            if (doc === doc2)
                instance.hide();
        }
    };

    var Overlay = KE.Overlay;
    S.augment(ContextMenu, {
        /**
         * 根据配置构造右键菜单内容
         */
        _init:function() {
            var self = this,
                cfg = self.cfg,
                funcs = cfg.funcs;
            self.el = new Overlay({
                content:HTML,
                autoRender:true,
                width:cfg.width,
                elCls:"ke-menu"
            });
            self.elDom = self.el.get("contentEl").one("div");
            var el = self.elDom;
            for (var f in funcs) {
                var a = new Node("<a href='#'>" + f + "</a>");
                el[0].appendChild(a[0]);
                (function(a, func) {
                    a._4e_unselectable();
                    a.on("click", function(ev) {
                        ev.halt();
                        if (a.hasClass("ke-menuitem-disable")) {
                            return;
                        }
                        //先 hide 还原编辑器内焦点
                        self.hide();

                        //给 ie 一点 hide() 中的事件触发 handler 运行机会，原编辑器获得焦点后再进行下步操作
                        setTimeout(func, 30);
                    });
                })(a, funcs[f]);
            }

        },
        destroy:function() {
            var self = this;
            if (self.el) {
                self.elDom.children().detach();
                self.el.destroy();
            }
        },
        hide : function() {
            this.el && this.el.hide();
        },
        _realShow:function(offset) {
            var self = this;
            //防止ie 失去焦点，取不到复制等状态
            KE.fire("contextmenu", {
                contextmenu:self
            });
            this.el.set("xy", [offset.left,offset.top]);
            var cfg = self.cfg,statusChecker = cfg.statusChecker;
            if (statusChecker) {
                var as = self.elDom.children("a");
                for (var i = 0; i < as.length; i++) {
                    var a = new Node(as[i]);
                    var func = statusChecker[S.trim(a.text())];
                    if (func) {
                        if (func(cfg.editor)) {
                            a.removeClass("ke-menuitem-disable");
                        } else {
                            a.addClass("ke-menuitem-disable");
                        }
                    }
                }
            }
            this.el.show();
        },
        _prepareShow:function() {
            this._init();
        },
        show:function(offset) {
            this._prepareShow(offset);
        }
    });

    KE.ContextMenu = ContextMenu;
}, {
    attach:false,
    requires:["overlay"]
});
/**
 * draft support for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("draft", function(editor) {
    var S = KISSY,KE = S.Editor;
    editor.addPlugin("draft", function() {
        var self = this;
        KE.use("draft/support", function() {
            KE.storeReady(function() {
                var d = new KE.Draft(editor);
                self.destroy = function() {
                    d.destroy();
                };
            });
        });
    });
}, {
    attach:false
});/**
 * draft for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("draft/support", function () {
    var S = KISSY,
        KE = S.Editor,
        Node = S.Node,
        LIMIT = 5,
        Event = S.Event,
        INTERVAL = 5,
        JSON = S['JSON'],
        DRAFT_SAVE = "ke-draft-save20110503";

    function padding(n, l, p) {
        n += "";
        while (n.length < l) {
            n = p + n;
        }
        return n;
    }

    function date(d) {
        if (S.isNumber(d)) {
            d = new Date(d);
        }
        if (d instanceof Date)
            return [
                d.getFullYear(),
                "-",
                padding(d.getMonth() + 1, 2, "0"),
                "-",
                padding(d.getDate(), 2, "0"),
                " ",
                //"&nbsp;",
                padding(d.getHours(), 2, "0"),
                ":",
                padding(d.getMinutes(), 2, "0"),
                ":",
                padding(d.getSeconds(), 2, "0")
                //"&nbsp;",
                //"&nbsp;"
            ].join("");
        else
            return d;
    }

    function Draft(editor) {
        this.editor = editor;
        this._init();
    }

    var addRes = KE.Utils.addRes, destroyRes = KE.Utils.destroyRes;
    S.augment(Draft, {

        _getSaveKey:function () {
            var self = this,
                editor = self.editor,
                cfg = editor.cfg.pluginConfig;
            return cfg.draft && cfg.draft['saveKey'] || DRAFT_SAVE;
        },

        /**
         * parse 历史记录延后，点击 select 时才开始 parse
         */
        _getDrafts:function () {
            var localStorage = KE.localStorage;
            var self = this;
            if (!self.drafts) {
                var str = localStorage.getItem(self._getSaveKey()),
                    drafts = [];

                if (str) {
                    /**
                     * 原生 localStorage 必须串行化
                     */
                    drafts = (localStorage == window.localStorage) ?
                        JSON.parse(decodeURIComponent(str)) : str;
                }
                self.drafts = drafts;
                //S.log("parse drafts", drafts);
            }
            return self.drafts;
        },
        _init:function () {

            var self = this,
                editor = self.editor,
                statusbar = editor.statusDiv,
                cfg = editor.cfg.pluginConfig;
            cfg.draft = cfg.draft || {};
            self.draftInterval = cfg.draft.interval
                = cfg.draft.interval || INTERVAL;
            self.draftLimit = cfg.draft.limit
                = cfg.draft.limit || LIMIT;
            var holder = new Node(
                "<div class='ke-draft'>" +
                    "<span class='ke-draft-title'>" +
                    "内容正文每" +
                    cfg.draft.interval
                    + "分钟自动保存一次。" +
                    "</span>" +
                    "</div>").appendTo(statusbar);
            self.timeTip = new Node("<span class='ke-draft-time'/>")
                .appendTo(holder);

            var save = new Node(
                "<a href='#' " +
                    "onclick='return false;' " +
                    "class='ke-button ke-draft-save-btn' " +
                    "style='" +
                    "vertical-align:middle;" +
                    "padding:1px 9px;" +
                    "'>" +
                    "<span class='ke-draft-mansave'>" +
                    "</span>" +
                    "<span>立即保存</span>" +
                    "</a>"
            ).appendTo(holder),
                versions = new KE.Select({
                    container:holder,
                    menuContainer:document.body,
                    doc:editor.document,
                    width:"85px",
                    popUpWidth:"225px",
                    align:["r", "t"],
                    emptyText:"&nbsp;&nbsp;&nbsp;尚无编辑器历史存在",
                    title:"恢复编辑历史"
                });
            self.versions = versions;
            //点击才开始 parse
            versions.on("select", function () {
                versions.detach("select", arguments.callee);
                self.sync();
            });
            save._4e_unselectable();
            save.on("click", function (ev) {
                self.save(false);
                //如果不阻止，部分页面在ie6下会莫名奇妙把其他input的值丢掉！
                ev.halt();
            });

            addRes.call(self, save);


            /*
             监控form提交，每次提交前保存一次，防止出错
             */
            if (editor.textarea[0].form) {
                (function () {
                    var textarea = editor.textarea,
                        form = textarea[0].form;

                    function saveF() {
                        self.save(true);
                    }

                    Event.on(form, "submit", saveF);
                    addRes.call(self, function () {
                        Event.remove(form, "submit", saveF);
                    });

                })();
            }

            var timer = setInterval(function () {
                self.save(true);
            }, self.draftInterval * 60 * 1000);

            addRes.call(self, function () {
                clearInterval(timer);
            });

            versions.on("click", self.recover, self);
            addRes.call(self, versions);
            self.holder = holder;
            //KE.Utils.sourceDisable(editor, self);

            if (cfg.draft['helpHtml']) {

                var help = new KE.TripleButton({
                    elCls:"ke-draft-help",
                    title:"点击查看帮助",
                    text:"点击查看帮助",
                    render:holder
                });

                help.render();

                help.on("click", function (ev) {
                    if (self._help && self._help.get("visible")) {
                        self._help.hide();
                    } else {
                        self._prepareHelp();
                    }
                    ev && ev.halt();
                });
                addRes.call(self, help);
                KE.Utils.lazyRun(self, "_prepareHelp", "_realHelp");
                self.helpBtn = help.get("el");
            }
            addRes.call(self, holder);
        },
        _prepareHelp:function () {
            var self = this,
                editor = self.editor,
                cfg = editor.cfg.pluginConfig,
                draftCfg = cfg.draft,
                helpBtn = self.helpBtn,
                help = new Node(draftCfg['helpHtml'] || "");
            var arrowCss = "height:0;" +
                "position:absolute;" +
                "font-size:0;" +
                "width:0;" +
                "border:8px #000 solid;" +
                "border-color:#000 transparent transparent transparent;" +
                "border-style:solid dashed dashed dashed;";
            var arrow = new Node("<div style='" +
                arrowCss +
                "border-top-color:#CED5E0;" +
                "'>" +
                "<div style='" +
                arrowCss +
                "left:-8px;" +
                "top:-10px;" +
                "border-top-color:white;" +
                "'>" +
                "</div>" +
                "</div>");
            help.append(arrow);
            help.css({
                border:"1px solid #ACB4BE",
                "text-align":"left"
            });
            self._help = new (S.require("overlay"))({
                content:help,
                autoRender:true,
                width:help.width() + "px",
                mask:false
            });
            self._help.get("el").css("border", "none");
            self._help.arrow = arrow;
            function hideHelp(ev) {
                ev && ev.halt();
                var t = new Node(ev.target);
                if (t[0] == helpBtn[0] || helpBtn.contains(t))
                    return;
                self._help.hide();
            }

            Event.on([document, editor.document], "click", hideHelp);

            addRes.call(self, self._help, function () {
                Event.remove([document, editor.document], "click", hideHelp);
            });

        },
        _realHelp:function () {
            var win = this._help,
                helpBtn = this.helpBtn,
                arrow = win.arrow;
            win.show();
            var off = helpBtn.offset();
            win.get("el").offset({
                left:(off.left - win.get("el").width()) + 17,
                top:(off.top - win.get("el").height()) - 7
            });
            arrow.offset({
                left:off.left - 2,
                top:off.top - 8
            });
        },
        disable:function () {
            this.holder.css("visibility", "hidden");
        },
        enable:function () {
            this.holder.css("visibility", "");
        },
        sync:function () {
            var localStorage = KE.localStorage;
            var self = this,
                draftLimit = self.draftLimit,
                timeTip = self.timeTip,
                versions = self.versions,
                drafts = self._getDrafts();
            if (drafts.length > draftLimit)
                drafts.splice(0, drafts.length - draftLimit);
            var items = [], draft, tip;
            for (var i = 0; i < drafts.length; i++) {
                draft = drafts[i];
                tip = (draft.auto ? "自动" : "手动") + "保存于 : "
                    + date(draft.date);
                items.push({
                    name:tip,
                    value:i
                });
            }
            versions.set("items", items.reverse());
            timeTip.html(tip);
            localStorage.setItem(self._getSaveKey(),
                (localStorage == window.localStorage) ?
                    encodeURIComponent(JSON.stringify(drafts))
                    : drafts);
        },

        save:function (auto) {
            var self = this,
                drafts = self._getDrafts(),
                editor = self.editor,
                //不使用rawdata
                //undo 只需获得可视区域内代码
                //可视区域内代码！= 最终代码
                //代码模式也要支持草稿功能
                //统一获得最终代码
                data = editor.getData(true);

            //如果当前内容为空，不保存版本
            if (!data) return;

            if (drafts[drafts.length - 1] &&
                data == drafts[drafts.length - 1].content) {
                drafts.length -= 1;
            }
            self.drafts = drafts.concat({
                content:data,
                date:new Date().getTime(),
                auto:auto
            });
            self.sync();
        },

        recover:function (ev) {
            var self = this,
                editor = self.editor,
                versions = self.versions,
                drafts = self._getDrafts(),
                v = ev.newVal;
            versions.reset("value");
            if (confirm("确认恢复 " + date(drafts[v].date) + " 的编辑历史？")) {
                editor.fire("save");
                editor.setData(drafts[v].content);
                editor.fire("save");
            }
            ev && ev.halt();
        },
        destroy:function () {
            destroyRes.call(this);
        }
    });
    KE.Draft = Draft;
}, {
    attach:false,
    "requires":["localstorage"]
});/**
 * drag file support for html5 file&dd
 * @author yiminghe@gmail.com
 * @refer: http://www.html5rocks.com/tutorials/file/filesystem/
 *         http://yiminghe.iteye.com/blog/848613
 */
KISSY.Editor.add("dragupload", function(editor) {
    var S = KISSY,
        KE = S.Editor,
        Node = S.Node,
        Event = S.Event,
        UA = S.UA,
        DOM = S.DOM,
        cfg = editor.cfg.pluginConfig['dragupload'] || {},
        fileInput = cfg['fileInput'] || "Filedata",
        sizeLimit = cfg['sizeLimit'] || Number.MAX_VALUE,
        serverParams = cfg['serverParams'] || {},
        serverUrl = cfg['serverUrl'] || "",
        suffix = cfg['suffix'] || "png,jpg,jpeg,gif",
        suffix_reg = new RegExp(suffix.split(/,/).join("|") + "$", "i"),
        document = editor.document;
    if (UA['ie']) return;

    var inserted = {},startMonitor = false;

    function nodeInsert(ev) {
        var oe = ev['originalEvent'];
        var t = oe.target;
        if (DOM._4e_name(t) == "img" && t.src.match(/^file:\/\//)) {
            inserted[t.src] = t;
        }
    }

    Event.on(document, "dragenter", function() {
        //firefox 会插入伪数据
        if (!startMonitor) {
            Event.on(document, "DOMNodeInserted", nodeInsert);
            startMonitor = true;
        }
    });
//    Event.on(document, "dragenter dragover", function(ev) {
//        ev.halt();
//        ev = ev['originalEvent'];
//        //var dt = ev['dataTransfer'];
//    });
    Event.on(document, "drop", function(ev) {
        Event.remove(document, "DOMNodeInserted", nodeInsert);
        startMonitor = false;
        ev.halt();
        ev = ev['originalEvent'];
        S.log(ev);
        var archor,ap;
        /**
         * firefox 会自动添加节点
         */
        if (!S.isEmptyObject(inserted)) {

            S.each(inserted, function(el) {
                if (DOM._4e_name(el) == "img") {
                    archor = el.nextSibling;
                    ap = el.parentNode;
                    DOM._4e_remove(el);
                }
            });
            inserted = {};
        } else {
            //空行里拖放肯定没问题，其他在文字中间可能不准确
            ap = document.elementFromPoint(ev.clientX, ev.clientY);
            archor = ap.lastChild;
        }

        var dt = ev['dataTransfer'];
        dt.dropEffect = "copy";
        var files = dt['files'];
        if (!files) return;
        for (var i = 0; i < files.length; i++) {
            var file = files[i],name = file.name,size = file.size;
            if (!name.match(suffix_reg)) {
                continue;
            }
            if (size / 1000 > sizeLimit) {
                continue;
            }
            var img = new Node("<img " +
                "src='" +
                (KE['Config'].base + "../theme/loading.gif") + "'" +
                "/>");
            var nakeImg = img[0];
            ap.insertBefore(nakeImg, archor);
            var np = nakeImg.parentNode,np_name = DOM._4e_name(np);
            // 防止拖放导致插入到 body 以外
            if (np_name == "head"
                || np_name == "html") {
                DOM.insertBefore(nakeImg, document.body.firstChild);
            }

            fileUpload(file, img);
        }
    });

    if (window['XMLHttpRequest'] && !XMLHttpRequest.prototype.sendAsBinary) {
        XMLHttpRequest.prototype.sendAsBinary = function(datastr, contentType) {
            // chrome12 引入 WebKitBlobBuilder
            var bb = new (window['BlobBuilder'] || window['WebKitBlobBuilder'])();
            var len = datastr.length;
            var data = new window['Uint8Array'](len);
            for (var i = 0; i < len; i++) {
                data[i] = datastr.charCodeAt(i);
            }
            bb.append(data.buffer);
            this.send(bb['getBlob'](contentType));
        }
    }

    /**
     *
     * @param img loading 占位图片
     * @param file 真实数据
     */
    function fileUpload(file, img) {

        var reader = new window['FileReader']();
        //chrome 不支持 addEventListener("load")
        reader.onload = function(ev) {
            // Please report improvements to: marco.buratto at tiscali.it
            var fileName = file.name,
                fileData = ev.target['result'],
                boundary = "----kissy-editor-2.1",
                xhr = new XMLHttpRequest();

            xhr.open("POST", serverUrl, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {

                    if ((xhr.status == 200)
                        ||
                        xhr.status == 304) {
                        if (xhr.responseText != "") {
                            var info = window['JSON'].parse(xhr.responseText);
                            img[0].src = info['imgUrl'];
                        }
                    } else {
                        alert("服务器端出错！");
                        img._4e_remove();
                        S.log(xhr);
                    }

                    xhr.onreadystatechange = null;
                }
            };

            var body = "\r\n--" + boundary + "\r\n";
            body += "Content-Disposition: form-data; name=\"" +
                fileInput + "\"; filename=\"" + encodeURIComponent(fileName) + "\"\r\n";
            body += "Content-Type: " + (file.type || "application/octet-stream") + "\r\n\r\n";
            body += fileData + "\r\n";

            serverParams = KE.Utils.normParams(serverParams);
            for (var p in serverParams) {
                if (serverParams.hasOwnProperty(p)) {
                    body += "--" + boundary + "\r\n";
                    body += "Content-Disposition: form-data; name=\"" +
                        p + "\"\r\n\r\n";
                    body += serverParams[p] + "\r\n";
                }
            }
            body += "--" + boundary + "--";

            xhr.setRequestHeader("Content-Type",
                "multipart/form-data, boundary=" + boundary); // simulate a file MIME POST request.
            /*xhr.setRequestHeader("Content-Length", body.length);
             */
            xhr.sendAsBinary("Content-Type: multipart/form-data; boundary=" +
                boundary + "\r\nContent-Length: " + body.length
                + "\r\n" + body + "\r\n");
            reader.onload = null;
        };
        reader['readAsBinaryString'](file);
    }
}, {
    attach:false
});/**
 * element path shown in status bar,modified from ckeditor
 * @modifier yiminghe@gmail.com
 */
KISSY.Editor.add("elementpaths", function(editor) {
    var KE = KISSY.Editor,S = KISSY,Node = S.Node,DOM = S.DOM;
    if (!KE.ElementPaths) {

        (function() {

            DOM.addStyleSheet(".elementpath {" +
                "   padding: 0 5px;" +
                "    text-decoration: none;" +
                "}" +
                ".elementpath:hover {" +
                "    background: #CCFFFF;" +
                "    text-decoration: none;" +
                "}", "ke-ElementPaths");
            function ElementPaths(cfg) {
                this.cfg = cfg;
                this._cache = [];
                this._init();
            }

            S.augment(ElementPaths, {
                _init:function() {
                    var self = this,cfg = self.cfg,
                        editor = cfg.editor;
                    self.holder = new Node("<span>");
                    self.holder.appendTo(editor.statusDiv);
                    editor.on("selectionChange", self._selectionChange, self);
                    KE.Utils.sourceDisable(editor, self);
                },
                disable:function() {
                    this.holder.css("visibility", "hidden");
                },
                enable:function() {
                    this.holder.css("visibility", "");
                },
                _selectionChange:function(ev) {

                    var self = this,
                        cfg = self.cfg,
                        editor = cfg.editor,
                        statusDom = self.holder;
                    var elementPath = ev.path,
                        elements = elementPath.elements,
                        element,i,
                        cache = self._cache;

                    for (i = 0; i < cache.length; i++) {
                        cache[i].detach("click");
                        cache[i]._4e_remove();
                    }
                    self._cache = [];
                    // For each element into the elements path.
                    for (i = 0; i < elements.length; i++) {
                        element = elements[i];

                        var a = new Node("<a href='#' class='elementpath'>" +
                            //考虑 fake objects
                            (element.attr("_ke_real_element_type") || element._4e_name())
                            + "</a>");
                        self._cache.push(a);
                        (function(element) {
                            a.on("click", function(ev2) {
                                ev2.halt();
                                editor.focus();
                                setTimeout(function() {
                                    editor.getSelection().selectElement(element);
                                }, 50);
                            });
                        })(element);
                        statusDom.prepend(a);
                    }

                },
                destroy:function() {
                    this.holder.remove();
                }
            });
            KE.ElementPaths = ElementPaths;
        })();
    }

    editor.addPlugin("elementpaths", function() {
        var ep = new KE.ElementPaths({
            editor:editor
        });
        this.destroy = function() {
            ep.destroy();
        };
    });

}, {
    attach:false
});
/**
 * monitor user's enter and shift enter keydown,modified from ckeditor
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("enterkey", function (editor) {
    var S = KISSY,
        KE = S.Editor,
        //DOM = S.DOM,
        UA = S.UA,
        headerTagRegex = /^h[1-6]$/,
        dtd = KE.XHTML_DTD,
        Node = S.Node,
        Event = S.Event,
        Walker = KE.Walker,
        ElementPath = KE.ElementPath;
    if (!KE.enterBlock) {

        (function () {

            function getRange(editor) {
                // Get the selection ranges.
                var ranges = editor.getSelection().getRanges();
                // Delete the contents of all ranges except the first one.
                for (var i = ranges.length - 1; i > 0; i--) {
                    ranges[ i ].deleteContents();
                }
                // Return the first range.
                return ranges[ 0 ];
            }

            function enterBlock(editor) {
                //debugger;
                // Get the range for the current selection.
                var range = getRange(editor);
                var doc = range.document;
                // Exit the list when we're inside an empty list item block. (#5376)
                if (range.checkStartOfBlock() && range.checkEndOfBlock()) {
                    var path = new ElementPath(range.startContainer),
                        block = path.block;
                    //只有两层？
                    if (block &&
                        ( block._4e_name() == 'li' || block.parent()._4e_name() == 'li' )

                        ) {
                        if (editor.hasCommand('outdent')) {
                            editor.fire("save");
                            editor.execCommand('outdent');
                            editor.fire("save");
                            return true;
                        } else {
                            return false;
                        }
                    }
                }

                // Determine the block element to be used.
                var blockTag = "p";

                // Split the range.
                var splitInfo = range.splitBlock(blockTag);

                if (!splitInfo)
                    return true;

                // Get the current blocks.
                var previousBlock = splitInfo.previousBlock,
                    nextBlock = splitInfo.nextBlock;

                var isStartOfBlock = splitInfo.wasStartOfBlock,
                    isEndOfBlock = splitInfo.wasEndOfBlock;

                var node;

                // If this is a block under a list item, split it as well. (#1647)
                if (nextBlock) {
                    node = nextBlock.parent();
                    if (node._4e_name() == 'li') {
                        nextBlock._4e_breakParent(node);
                        nextBlock._4e_move(nextBlock._4e_next(), true);
                    }
                }
                else if (previousBlock && ( node = previousBlock.parent() ) && node._4e_name() == 'li') {
                    previousBlock._4e_breakParent(node);
                    range.moveToElementEditablePosition(previousBlock._4e_next());
                    previousBlock._4e_move(previousBlock._4e_previous());
                }

                // If we have both the previous and next blocks, it means that the
                // boundaries were on separated blocks, or none of them where on the
                // block limits (start/end).
                if (!isStartOfBlock && !isEndOfBlock) {
                    // If the next block is an <li> with another list tree as the first
                    // child, we'll need to append a filler (<br>/NBSP) or the list item
                    // wouldn't be editable. (#1420)
                    if (nextBlock._4e_name() == 'li'
                        &&
                        ( node = nextBlock._4e_first(Walker.invisible(true)) )
                        && S.inArray(node._4e_name(), ['ul', 'ol']))
                        (UA['ie'] ? new Node(doc.createTextNode('\xa0')) : new Node(doc.createElement('br'))).insertBefore(node);

                    // Move the selection to the end block.
                    if (nextBlock)
                        range.moveToElementEditablePosition(nextBlock);
                }
                else {
                    var newBlock;

                    if (previousBlock) {
                        // Do not enter this block if it's a header tag, or we are in
                        // a Shift+Enter (#77). Create a new block element instead
                        // (later in the code).
                        if (previousBlock._4e_name() == 'li' || !headerTagRegex.test(previousBlock._4e_name())) {
                            // Otherwise, duplicate the previous block.
                            newBlock = previousBlock._4e_clone();
                        }
                    }
                    else if (nextBlock)
                        newBlock = nextBlock._4e_clone();

                    if (!newBlock)
                        newBlock = new Node("<" + blockTag + ">", null, doc);

                    // Recreate the inline elements tree, which was available
                    // before hitting enter, so the same styles will be available in
                    // the new block.
                    var elementPath = splitInfo.elementPath;
                    if (elementPath) {
                        for (var i = 0, len = elementPath.elements.length; i < len; i++) {
                            var element = elementPath.elements[ i ];

                            if (element._4e_equals(elementPath.block) || element._4e_equals(elementPath.blockLimit))
                                break;
                            //<li><strong>^</strong></li>
                            if (dtd.$removeEmpty[ element._4e_name() ]) {
                                element = element._4e_clone();
                                newBlock._4e_moveChildren(element);
                                newBlock.append(element);
                            }
                        }
                    }

                    if (!UA['ie'])
                        newBlock._4e_appendBogus();

                    range.insertNode(newBlock);

                    // This is tricky, but to make the new block visible correctly
                    // we must select it.
                    // The previousBlock check has been included because it may be
                    // empty if we have fixed a block-less space (like ENTER into an
                    // empty table cell).
                    if (UA['ie'] && isStartOfBlock && ( !isEndOfBlock || !previousBlock[0].childNodes.length )) {
                        // Move the selection to the new block.
                        range.moveToElementEditablePosition(isEndOfBlock ? previousBlock : newBlock);
                        range.select();
                    }

                    // Move the selection to the new block.
                    range.moveToElementEditablePosition(isStartOfBlock && !isEndOfBlock ? nextBlock : newBlock);
                }

                if (!UA['ie']) {
                    if (nextBlock) {
                        // If we have split the block, adds a temporary span at the
                        // range position and scroll relatively to it.
                        var tmpNode = new Node(doc.createElement('span'));

                        // We need some content for Safari.
                        tmpNode.html('&nbsp;');

                        range.insertNode(tmpNode);
                        tmpNode._4e_scrollIntoView();
                        range.deleteContents();
                    }
                    else {
                        // We may use the above scroll logic for the new block case
                        // too, but it gives some weird result with Opera.
                        newBlock._4e_scrollIntoView();
                    }
                }
                range.select();
                return true;
            }

            function EnterKey(editor) {
                var doc = editor.document;
                Event.on(doc, "keydown", function (ev) {
                    var keyCode = ev.keyCode;
                    if (keyCode === 13) {
                        if (ev.shiftKey || ev.ctrlKey || ev.metaKey) {
                        } else {
                            editor.fire("save");
                            var re = editor.execCommand("enterBlock");
                            editor.fire("save");
                            if (re !== false) {
                                ev.preventDefault();
                            }
                        }
                    }
                });
            }

            EnterKey.enterBlock = enterBlock;
            KE.EnterKey = EnterKey;
        })();
    }


    editor.addCommand("enterBlock", {
        exec:KE.EnterKey.enterBlock
    });
    KE.EnterKey(editor);

}, {
    attach:false
});
/**
 * fakeobjects for music ,video,flash
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("fakeobjects", function(editor) {
    var KE = KISSY.Editor,
        S = KISSY,
        Node = S.Node,
        KEN = KE.NODE,
        SPACER_GIF = KE['Config'].base + '../theme/spacer.gif',
        HtmlParser = KE.HtmlParser,
        Editor = S.Editor,
        dataProcessor = editor.htmlDataProcessor,
        htmlFilter = dataProcessor && dataProcessor.htmlFilter;

    var htmlFilterRules = {
        elements : {
            /**
             * 生成最终html时，从编辑器html转化把fake替换为真实，并将style的width,height搞到属性上去
             * @param element
             */
            $ : function(element) {
                var attributes = element.attributes,
                    realHtml = attributes && attributes._ke_realelement,
                    realFragment = realHtml && new HtmlParser.Fragment.FromHtml(decodeURIComponent(realHtml)),
                    realElement = realFragment && realFragment.children[ 0 ];

                // If we have width/height in the element, we must move it into
                // the real element.
                if (realElement && element.attributes._ke_resizable) {
                    var style = element.attributes.style;
                    if (style) {
                        // Get the width from the style.
                        var match = /(?:^|\s)width\s*:\s*(\d+)/i.exec(style),
                            width = match && match[1];
                        // Get the height from the style.
                        match = /(?:^|\s)height\s*:\s*(\d+)/i.exec(style);
                        var height = match && match[1];

                        if (width)
                            realElement.attributes.width = width;

                        if (height)
                            realElement.attributes.height = height;
                    }
                }
                return realElement;
            }
        }
    };


    if (htmlFilter)
        htmlFilter.addRules(htmlFilterRules);


    if (dataProcessor) {
        S.mix(dataProcessor, {

            /**
             * 从外边真实的html，转为为编辑器代码支持的替换元素
             * @param realElement
             * @param className
             * @param realElementType
             * @param isResizable
             */
            createFakeParserElement:function(realElement, className, realElementType, isResizable, attrs) {
                var html,
                    writer = new HtmlParser.BasicWriter();
                realElement.writeHtml(writer);
                html = writer.getHtml();
                var style = realElement.attributes.style || '';
                if (realElement.attributes.width) {
                    style = "width:" + realElement.attributes.width + "px;" + style;
                }
                if (realElement.attributes.height) {
                    style = "height:" + realElement.attributes.height + "px;" + style;
                }
                // add current class to fake element
                var existClass = S.trim(realElement.attributes['class']),
                    attributes = {
                        'class' : className + " " + existClass,
                        src : SPACER_GIF,
                        _ke_realelement : encodeURIComponent(html),
                        _ke_real_node_type : realElement.type,
                        style:style,
                        align : realElement.attributes.align || ''
                    };
                attrs && delete attrs.width;
                attrs && delete attrs.height;

                attrs && S.mix(attributes, attrs, false);

                if (realElementType) {
                    attributes._ke_real_element_type = realElementType;
                }
                if (isResizable) {
                    attributes._ke_resizable = isResizable;
                }
                return new HtmlParser.Element('img', attributes);
            }
        });
    }
    if (!editor.createFakeElement) {
        S.augment(Editor, {
            //ie6 ,object outHTML error
            createFakeElement:function(realElement, className, realElementType, isResizable, outerHTML, attrs) {
                var style = realElement.attr("style") || '';
                if (realElement.attr("width")) {
                    style = "width:" + realElement.attr("width") + "px;" + style;
                }
                if (realElement.attr("height")) {
                    style = "height:" + realElement.attr("height") + "px;" + style;
                }
                var self = this,
                    // add current class to fake element
                    existClass = S.trim(realElement.attr('class')),
                    attributes = {
                        'class' : className + " " + existClass,
                        src : SPACER_GIF,
                        _ke_realelement : encodeURIComponent(outerHTML || realElement._4e_outerHtml()),
                        _ke_real_node_type : realElement[0].nodeType,
                        //align : realElement.attr("align") || '',
                        style:style
                    };
                attrs && delete attrs.width;
                attrs && delete attrs.height;

                attrs && S.mix(attributes, attrs, false);
                if (realElementType)
                    attributes._ke_real_element_type = realElementType;

                if (isResizable)
                    attributes._ke_resizable = isResizable;
                return new Node("<img/>", attributes, self.document);
            },

            restoreRealElement:function(fakeElement) {
                if (fakeElement.attr('_ke_real_node_type') != KEN.NODE_ELEMENT)
                    return null;
                var html = (decodeURIComponent(fakeElement.attr('_ke_realelement')));

                var temp = new Node('<div>', null, this.document);
                temp.html(html);
                // When returning the node, remove it from its parent to detach it.
                return temp._4e_first(
                    function(n) {
                        return n[0].nodeType == KEN.NODE_ELEMENT;
                    })._4e_remove();
            }
        });
    }

}, {
    attach:false,
    requires:["htmldataprocessor"]
});
KISSY.Editor.add("flash", function(editor) {

    var S = KISSY,
        KE = S.Editor,
        CLS_FLASH = 'ke_flash',
        TYPE_FLASH = 'flash',
        dataProcessor = editor.htmlDataProcessor,
        pluginConfig = editor.cfg.pluginConfig,
        dataFilter = dataProcessor && dataProcessor.dataFilter;

    dataFilter && dataFilter.addRules({
        elements : {
            'object' : function(element) {
                var attributes = element.attributes,i,
                    classId = attributes['classid'] && String(attributes['classid']).toLowerCase();
                if (!classId) {
                    // Look for the inner <embed>
                    for (i = 0; i < element.children.length; i++) {
                        if (element.children[ i ].name == 'embed') {
                            if (!KE.Utils.isFlashEmbed(element.children[ i ]))
                                return null;
                            return dataProcessor.createFakeParserElement(element, CLS_FLASH, TYPE_FLASH, true);
                        }
                    }
                    return null;
                }
                return dataProcessor.createFakeParserElement(element, CLS_FLASH, TYPE_FLASH, true);
            },

            'embed' : function(element) {
                if (!KE.Utils.isFlashEmbed(element))
                    return null;
                return dataProcessor.createFakeParserElement(element, CLS_FLASH, TYPE_FLASH, true);
            }
        }}, 5);

    editor.addPlugin("flash", function() {
        var context;
        if (!pluginConfig["flash"] ||
            pluginConfig["flash"].btn !== false) {
            context = editor.addButton("flash", {
                contentCls:"ke-toolbar-flash",
                title:"插入Flash" ,
                mode:KE.WYSIWYG_MODE,
                loading:true
            });
        }
        KE.use("flash/support", function() {
            var flash = new KE.Flash(editor);
            context && context.reload({
                offClick:function() {
                    flash.show();
                },
                destroy:function() {
                    flash.destroy();
                }
            })
        });

        this.destroy = function() {
            context.destroy();
        };
    });

}, {
    attach:false,
    requires:["fakeobjects"]
});
/**
 * flash base for all flash-based plugin
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("flash/support", function () {
    var S = KISSY,
        KE = S.Editor,
        UA = S.UA,
        Event = S.Event,
        ContextMenu = KE.ContextMenu,
        Node = S.Node,
        BubbleView = KE.BubbleView,
        CLS_FLASH = 'ke_flash',
        TYPE_FLASH = 'flash',
        flashUtils = KE.Utils.flash;

    /**
     * 写成类的形式而不是一个简单的button命令配置，为了可以override
     * 所有基于 flash 的插件基类，使用 template 模式抽象
     * @param editor
     */
    function Flash(editor) {
        var self = this;
        self.editor = editor;
        self._init();
    }

    S.augment(Flash, {

        /**
         * 配置信息，用于子类覆盖
         * @override
         */
        _config:function () {
            var self = this;
            self._cls = CLS_FLASH;
            self._type = TYPE_FLASH;
            self._contextMenu = contextMenu;
            self._flashRules = ["img." + CLS_FLASH];
        },
        _init:function () {
            this._config();
            var self = this,
                editor = self.editor,
                myContexts = {},
                contextMenu = self._contextMenu;
            //右键功能关联到编辑器实例
            if (contextMenu) {
                for (var f in contextMenu) {
                    (function (f) {
                        myContexts[f] = function () {
                            contextMenu[f](self);
                        }
                    })(f);
                }
            }
            //注册右键，contextmenu时检测
            self._contextMenu = ContextMenu.register({
                editor:editor,
                rules:self._flashRules,
                width:"120px",
                funcs:myContexts
            });

            //注册泡泡，selectionChange时检测
            BubbleView.attach({
                pluginName:self._type,
                editor:self.editor,
                pluginContext:self
            });
            //注册双击，双击时检测
            Event.on(editor.document, "dblclick", self._dbclick, self);
        },

        /**
         * 子类覆盖，如何从flash url得到合适的应用表示地址
         * @override
         * @param r flash 元素
         */
        _getFlashUrl:function (r) {
            return flashUtils.getUrl(r);
        },
        /**
         * 更新泡泡弹出的界面，子类覆盖
         * @override
         * @param tipurl
         * @param selectedFlash
         */
        _updateTip:function (tipurl, selectedFlash) {
            var self = this,
                editor = self.editor,
                r = editor.restoreRealElement(selectedFlash);
            if (!r) return;
            var url = self._getFlashUrl(r);
            //tipurl.html(url);
            tipurl.attr("href", url);
        },

        //根据图片标志触发本插件应用
        _dbclick:function (ev) {
            var self = this, t = new Node(ev.target);
            if (t._4e_name() === "img" && t.hasClass(self._cls)) {
                self.show(null, t);
                ev.halt();
            }
        },

        show:function (ev, selected) {
            var self = this,
                editor = self.editor;
            editor.showDialog(self._type + "/dialog", [selected]);
        },

        destroy:function () {
            var self = this,
                editor = self.editor;
            self._contextMenu.destroy();
            BubbleView.destroy(self._type);
            Event.remove(editor.document, "dblclick", self._dbclick, self);
            editor.destroyDialog(self._type + "/dialog");
        }
    });

    KE.Flash = Flash;

    /**
     * tip初始化，所有共享一个tip
     */
    var tipHtml = ' <a ' +
        'class="ke-bubbleview-url" ' +
        'target="_blank" ' +
        'href="#">{label}</a>   |   '
        + ' <span class="ke-bubbleview-link ke-bubbleview-change">编辑</span>   |   '
        + ' <span class="ke-bubbleview-link ke-bubbleview-remove">删除</span>';

    /**
     * 泡泡判断是否选择元素符合
     * @param node
     */
    function checkFlash(node) {
        return node._4e_name() === 'img' &&
            (!!node.hasClass(CLS_FLASH)) &&
            node;
    }

    /**
     * 注册一个泡泡
     * @param pluginName
     * @param label
     * @param checkFlash
     */
    Flash.registerBubble = function (pluginName, label, checkFlash) {

        BubbleView.register({
            pluginName:pluginName,
            func:checkFlash,
            init:function () {
                var bubble = this,
                    el = bubble.get("contentEl");
                el.html(S.substitute(tipHtml, {
                    label:label
                }));
                var tipurl = el.one(".ke-bubbleview-url"),
                    tipchange = el.one(".ke-bubbleview-change"),
                    tipremove = el.one(".ke-bubbleview-remove");
                //ie focus not lose
                KE.Utils.preventFocus(el);

                tipchange.on("click", function (ev) {
                    //回调show，传入选中元素
                    bubble._plugin.show(null, bubble._selectedEl);
                    ev.halt();
                });

                tipremove.on("click", function (ev) {
                    var flash = bubble._plugin;
                    //chrome remove 后会没有焦点
                    if (UA['webkit']) {
                        var r = flash.editor.getSelection().getRanges();
                        r && r[0] && (r[0].collapse(true) || true) && r[0].select();
                    }
                    bubble._selectedEl._4e_remove();
                    bubble.hide();
                    flash.editor.notifySelectionChange();
                    ev.halt();
                });
                KE.Utils.addRes.call(bubble, tipchange, tipremove);

                /*
                 位置变化，在显示前就设置内容，防止ie6 iframe遮罩不能正确大小
                 */
                bubble.on("show", function () {

                    var a = bubble._selectedEl,
                        flash = bubble._plugin;
                    if (!a)return;
                    flash._updateTip(tipurl, a);
                });
            }
        });
    };


    Flash.registerBubble("flash", "在新窗口查看", checkFlash);
    Flash.checkFlash = checkFlash;

    //右键功能列表
    var contextMenu = {
        "Flash属性":function (cmd) {
            var editor = cmd.editor,
                selection = editor.getSelection(),
                startElement = selection && selection.getStartElement(),
                flash = checkFlash(startElement);
            if (flash) {
                cmd.show(null, flash);
            }
        }
    };

    Flash.CLS_FLASH = CLS_FLASH;
    Flash.TYPE_FLASH = TYPE_FLASH;

    Flash.Insert = function (editor, src, attrs, _cls, _type, callback) {
        var nodeInfo = flashUtils.createSWF(src, {
            attrs:attrs
        }, editor.document),
            real = nodeInfo.el,
            substitute = editor.createFakeElement ?
                editor.createFakeElement(real,
                    _cls || 'ke_flash',
                    _type || 'flash',
                    true,
                    nodeInfo.html,
                    attrs) :
                real;
        editor.insertElement(substitute, null, callback);
    };

    KE.Flash = Flash;

}, {
    attach:false,
    requires:["bubbleview", "contextmenu", "flashutils"]
});/**
 * simplified flash bridge for yui swf
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("flashbridge", function() {
    var S = KISSY,KE = S.Editor;
    if (KE.FlashBridge) {
        S.log("KE.FlashBridge attach more", "warn");
        return;
    }

    var instances = {};

    function FlashBridge(cfg) {
        this._init(cfg);
    }

    S.augment(FlashBridge, S.EventTarget, {
        _init:function(cfg) {
            var self = this,
                id = S.guid("flashbridge-"),
                callback = "KISSY.Editor.FlashBridge.EventHandler";
            cfg.flashVars = cfg.flashVars || {};
            cfg.attrs = cfg.attrs || {};
            cfg.params = cfg.params || {};
            var flashVars = cfg.flashVars,
                attrs = cfg.attrs,
                params = cfg.params;
            S.mix(attrs, {
                id:id,
                //http://yiminghe.javaeye.com/blog/764872
                //firefox 必须使创建的flash以及容器可见，才会触发contentReady
                //默认给flash自身很大的宽高，容器小点就可以了，
                width:'100%',
                height:'100%'
            }, false);
            //这几个要放在 param 里面，主要是允许 flash js沟通
            S.mix(params, {
                allowScriptAccess:'always',
                allowNetworking:'all',
                scale:'noScale'
            }, false);
            S.mix(flashVars, {
                shareData: false,
                useCompression:false
            }, false);
            var swfCore = {
                YUISwfId:id,
                YUIBridgeCallback:callback
            };
            if (cfg.ajbridge) {
                swfCore = {
                    swfID:id,
                    jsEntry:callback
                };
            }
            S.mix(flashVars, swfCore);
            instances[id] = self;
            self.id = id;
            self.swf = KE.Utils.flash.createSWFRuntime(cfg.movie, cfg);
            self._expose(cfg.methods);
        },
        _expose:function(methods) {
            var self = this;
            for (var i = 0; i < methods.length; i++) {
                var m = methods[i];
                (function(m) {
                    self[m] = function() {
                        return self._callSWF(m, S.makeArray(arguments));
                    };
                })(m);
            }
        },
        /**
         * Calls a specific function exposed by the SWF's ExternalInterface.
         * @param func {String} the name of the function to call
         * @param args {Array} the set of arguments to pass to the function.
         */
        _callSWF: function (func, args) {
            var self = this;
            args = args || [];
            try {
                if (self.swf[func]) {
                    return self.swf[func].apply(self.swf, args);
                }
            }
                // some version flash function is odd in ie: property or method not supported by object
            catch(e) {
                var params = "";
                if (args.length !== 0) {
                    params = "'" + args.join("', '") + "'";
                }
                //avoid eval for compressiong
                return (new Function('self', 'return self.swf.' + func + '(' + params + ');'))(self);
            }
        },
        _eventHandler:function(event) {
            var self = this,
                type = event.type;

            if (type === 'log') {
                S.log(event.message);
            } else if (type) {
                self.fire(type, event);
            }
        },
        _destroy:function() {
            delete instances[this.id];
        }
    });

    FlashBridge.EventHandler = function(id, event) {
        S.log("flash fire event : " + event.type);
        var instance = instances[id];
        if (instance) {
            //防止ie同步触发事件，后面还没on呢，另外给 swf 喘息机会
            //否则同步后触发事件，立即调用swf方法会出错
            setTimeout(function() {
                instance._eventHandler.call(instance, event);
            }, 100);
        }
    };

    KE.FlashBridge = FlashBridge;


    /**
     * @module   Flash UA 探测
     * @author   kingfo<oicuicu@gmail.com>
     */

    var UA = S.UA, fpv, fpvF, firstRun = true;

    /**
     * 获取 Flash 版本号
     * 返回数据 [M, S, R] 若未安装，则返回 undefined
     */
    function getFlashVersion() {
        var ver, SF = 'ShockwaveFlash';

        // for NPAPI see: http://en.wikipedia.org/wiki/NPAPI
        if (navigator.plugins && navigator.mimeTypes.length) {
            ver = (navigator.plugins['Shockwave Flash'] || {})['description'];
        }
        // for ActiveX see:	http://en.wikipedia.org/wiki/ActiveX
        else if (window.ActiveXObject) {
            try {
                ver = new ActiveXObject(SF + '.' + SF)['GetVariable']('$version');
            } catch(ex) {
                //S.log('getFlashVersion failed via ActiveXObject');
                // nothing to do, just return undefined
            }
        }

        // 插件没安装或有问题时，ver 为 undefined
        if (!ver) return undefined;

        // 插件安装正常时，ver 为 "Shockwave Flash 10.1 r53" or "WIN 10,1,53,64"
        return arrify(ver);
    }

    /**
     * arrify("10.1.r53") => ["10", "1", "53"]
     */
    function arrify(ver) {
        return ver.match(/(\d)+/g);
    }

    /**
     * 格式：主版本号Major.次版本号Minor(小数点后3位，占3位)修正版本号Revision(小数点后第4至第8位，占5位)
     * ver 参数不符合预期时，返回 0
     * numerify("10.1 r53") => 10.00100053
     * numerify(["10", "1", "53"]) => 10.00100053
     * numerify(12.2) => 12.2
     */
    function numerify(ver) {
        var arr = S.isString(ver) ? arrify(ver) : ver, ret = ver;
        if (S.isArray(arr)) {
            ret = parseFloat(arr[0] + '.' + pad(arr[1], 3) + pad(arr[2], 5));
        }
        return ret || 0;
    }

    /**
     * pad(12, 5) => "00012"
     * ref: http://lifesinger.org/blog/2009/08/the-harm-of-tricky-code/
     */
    function pad(num, n) {
        var len = (num + '').length;
        while (len++ < n) {
            num = '0' + num;
        }
        return num;
    }

    /**
     * 返回数据 [M, S, R] 若未安装，则返回 undefined
     * fpv 全称是 flash player version
     */
    UA.fpv = function(force) {
        // 考虑 new ActiveX 和 try catch 的 性能损耗，延迟初始化到第一次调用时
        if (force || firstRun) {
            firstRun = false;
            fpv = getFlashVersion();
            fpvF = numerify(fpv);
        }
        return fpv;
    };

    /**
     * Checks fpv is greater than or equal the specific version.
     * 普通的 flash 版本检测推荐使用该方法
     * @param ver eg. "10.1.53"
     * <code>
     *    if(S.UA.fpvGEQ('9.9.2')) { ... }
     * </code>
     */
    UA.fpvGEQ = function(ver, force) {
        if (firstRun) UA.fpv(force);
        return !!fpvF && (fpvF >= numerify(ver));
    };

    /*
     if (!UA.fpvGEQ("11.0.0")) {

     var alertWin = new KE.SimpleOverlay({
     focusMgr:false,
     mask:true,
     title:"Flash 警告"
     });

     alertWin.body.html("您的Flash插件版本过低，" +
     "可能不能支持上传功能，" +
     "<a href='http://get.adobe.com/cn/flashplayer/' " +
     "target='_blank'>请点击此处更新</a>");

     }
     */

}, {
    attach:false
});/**
 * flash utilities
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("flashutils", function() {
    var S = KISSY,KE = S.Editor,flashUtils = KE.Utils.flash;
    if (flashUtils) {
        S.log("flashUtils attach more");
        return;
    }
    var DOM = S.DOM,Node = S.Node,UA = S.UA;
    flashUtils = {
        getUrl: function (r) {
            var url = "",KEN = KE.NODE;
            if (r._4e_name() == "object") {
                var params = r[0].childNodes;
                for (var i = 0; i < params.length; i++) {
                    if (params[i].nodeType != KEN.NODE_ELEMENT)continue;
                    if ((DOM.attr(params[i], "name") || "").toLowerCase() == "movie") {
                        url = DOM.attr(params[i], "value");
                    } else if (DOM._4e_name(params[i]) == "embed") {
                        url = DOM.attr(params[i], "src");
                    } else if (DOM._4e_name(params[i]) == "object") {
                        url = DOM.attr(params[i], "data");
                    }
                }
            } else if (r._4e_name() == "embed") {
                url = r.attr("src");
            }
            return url;
        },
        createSWF:function(movie, cfg, doc) {
            var attrs = cfg.attrs || {},
                flashVars = cfg.flashVars,
                attrs_str = "",
                params_str = "",
                params = cfg.params || {},
                vars_str = "";
            doc = doc || document;
            S.mix(attrs, {
                wmode:"transparent"
            });
            for (var a in attrs) {
                if (attrs.hasOwnProperty(a))
                    attrs_str += a + "='" + attrs[a] + "' ";
            }

            S.mix(params, {
                quality:"high",
                movie:movie,
                wmode:"transparent"
            });
            for (var p in params) {
                if (params.hasOwnProperty(p))
                    params_str += "<param name='" + p + "' value='" + params[p] + "'/>";
            }


            if (flashVars) {
                for (var f in flashVars) {
                    if (flashVars.hasOwnProperty(f))
                        vars_str += "&" + f + "=" + encodeURIComponent(flashVars[f]);
                }
                vars_str = vars_str.substring(1);
            }

            var outerHTML = '<object ' +
                attrs_str +
                ' classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" >' +
                params_str +
                (vars_str ? '<param name="flashVars" value="' + vars_str + '"/>' : '') +
                /*
                 "<object type='application/x-shockwave-flash'" +
                 " data='" + movie + "'" +
                 " " + attrs_str +
                 ">"
                 +
                 (vars_str ? '<param name="flashVars" value="' + vars_str + '"/>' : '') +
                 */
                '<embed ' +
                attrs_str +
                " " +
                (vars_str ? ( 'FlashVars="' + vars_str + '"') : "") +
                ' pluginspage="http://www.macromedia.com/go/getflashplayer" ' +
                ' quality="high" ' +
                ' src="' + movie + '" ' +
                ' type="application/x-shockwave-flash"/>' +
                // + '</object>' +
                '</object>';
            return {
                el:new Node(outerHTML, null, doc),
                html:outerHTML
            };
        },
        createSWFRuntime2:function(movie, cfg, doc) {
            doc = doc || document;
            var holder = new Node(
                "<div " +
                    "style='" +
                    "width:0;" +
                    "height:0;" +
                    "overflow:hidden;" +
                    "'>", null, doc).appendTo(doc.body)
                , el = flashUtils.createSWF.apply(this, arguments).el.appendTo(holder);
            if (!UA['ie'])
                el = el.one("object");
            return el[0];

        },
        createSWFRuntime:function(movie, cfg, doc) {
            var attrs = cfg.attrs || {},
                flashVars = cfg.flashVars || {},
                params = cfg.params || {},
                attrs_str = "",
                params_str = "",
                vars_str = "";
            doc = doc || document;
            attrs.id = attrs.id || S.guid("ke-runtimeflash-");
            for (var a in attrs) {
                if (attrs.hasOwnProperty(a))
                    attrs_str += a + "='" + attrs[a] + "' ";
            }
            for (var p in params) {
                if (params.hasOwnProperty(p))
                    params_str += "<param name='" + p + "' value='" + params[p] + "'/>";
            }
            for (var f in flashVars) {
                if (flashVars.hasOwnProperty(f))
                    vars_str += "&" + f + "=" + encodeURIComponent(flashVars[f]);
            }
            vars_str = vars_str.substring(1);

            if (UA['ie']) {
                var outerHTML = '<object ' +
                    attrs_str +
                    ' classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" >' +
                    params_str +
                    '<param name="movie" value="' + movie + '" />' +
                    (vars_str ? '<param name="flashVars" value="' + vars_str + '" />' : '') +
                    '</object>';
            }
            else {
                /*!TODO 截止 firefix3.6 ，会发生 flash 请求两次问题，
                 想改成 embed， 再等等吧
                 */
                outerHTML = "<object " +
                    "type='application/x-shockwave-flash'" +
                    " data='" + movie + "'" +
                    " " + attrs_str +
                    ">" +
                    params_str +
                    (vars_str ? '<param name="flashVars" value="' + vars_str + '"/>' : '')
                    + '</object>';
            }


            var holder = cfg.holder;
            if (!holder) {
                holder = new Node(
                    "<div " +
                        "style='" + (
                        cfg.style ? cfg.style : (
                            //http://yiminghe.javaeye.com/blog/764872
                            //firefox 必须使创建的flash以及容器可见，才会触发contentReady
                            "width:1px;" +
                                "height:1px;" +
                                "position:absolute;" +
                                //"left:" + DOM.scrollLeft() + "px;" +
                                //"top:" + DOM.scrollTop() + "px;"
                                + "overflow:hidden;"
                            ))
                        +
                        "'>", null, doc
                    ).
                    appendTo(doc.body);
                //不能初始化时设置，防止刷新,scrollLeft 一开始为0，等会,wait is virtue
                setTimeout(function() {
                    holder.offset({left:DOM.scrollLeft(),top:DOM.scrollTop()})
                }, 100);
            }
            holder.html(outerHTML);
            return doc.getElementById(attrs.id);
        }

    };
    KE.Utils.flash = flashUtils;
},{
    attach:false
});/**
 * font formatting for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("font", function (editor) {

    editor.addPlugin("font", function () {
        function wrapFont(vs) {
            var v = [];
            for (var i = 0;
                 i < vs.length;
                 i++) {
                v.push({
                    name:vs[i],
                    value:vs[i]
                });
            }
            return v;
        }

        var S = KISSY,
            KE = S.Editor,
            KEStyle = KE.Style,
            TripleButton = KE.TripleButton,
            pluginConfig = editor.cfg.pluginConfig;

        var FONT_SIZES = pluginConfig["font-size"],
            item,
            name,
            attrs,
            controls = [];

        if (FONT_SIZES !== false) {

            FONT_SIZES = FONT_SIZES || {};

            S.mix(FONT_SIZES, {
                items:wrapFont(["8px", "10px", "12px",
                    "14px", "18px", "24px",
                    "36px", "48px", "60px", "72px", "84px", "96px"]),
                width:"55px"
            }, false);

            var FONT_SIZE_STYLES = {},
                FONT_SIZE_ITEMS = [],
                fontSize_style = {
                    element:'span',
                    styles:{ 'font-size':'#(size)' },
                    overrides:[
                        { element:'font', attributes:{ 'size':null } }
                    ]
                };

            for (i = 0; i < FONT_SIZES.items.length; i++) {
                item = FONT_SIZES.items[i];
                name = item.name;
                attrs = item.attrs;
                var size = item.value;

                FONT_SIZE_STYLES[size] = new KEStyle(fontSize_style, {
                    size:size
                });

                FONT_SIZE_ITEMS.push({
                    name:name,
                    value:size,
                    attrs:attrs
                });
            }

            pluginConfig["font-size"] = FONT_SIZES;
        }


        /*
         FONT_SIZE_STYLES["inherit"] = new KEStyle(fontSize_style, {
         size:"inherit"
         });
         */

        var FONT_FAMILIES = pluginConfig["font-family"];

        if (FONT_FAMILIES !== false) {

            FONT_FAMILIES = FONT_FAMILIES || {};

            S.mix(FONT_FAMILIES, {
                items:[
                    //ie 不认识中文？？？
                    {name:"宋体", value:"SimSun"},
                    {name:"黑体", value:"SimHei"},
                    {name:"隶书", value:"LiSu"},
                    {name:"楷体", value:"KaiTi_GB2312"},
                    {name:"微软雅黑", value:"Microsoft YaHei"},
                    {name:"Georgia", value:"Georgia"},
                    {name:"Times New Roman", value:"Times New Roman"},
                    {name:"Impact", value:"Impact"},
                    {name:"Courier New", value:"Courier New"},
                    {name:"Arial", value:"Arial"},
                    {name:"Verdana", value:"Verdana"},
                    {name:"Tahoma", value:"Tahoma"}
                ],
                width:"130px"
            }, false);


            var FONT_FAMILY_STYLES = {},
                FONT_FAMILY_ITEMS = [],
                fontFamily_style = {
                    element:'span',
                    styles:{ 'font-family':'#(family)' },
                    overrides:[
                        { element:'font', attributes:{ 'face':null } }
                    ]
                }, i;


            pluginConfig["font-family"] = FONT_FAMILIES;


            for (i = 0; i < FONT_FAMILIES.items.length; i++) {
                item = FONT_FAMILIES.items[i];
                name = item.name;
                attrs = item.attrs || {};
                var value = item.value;
                attrs.style = attrs.style || "";
                attrs.style += ";font-family:" + value;
                FONT_FAMILY_STYLES[value] = new KEStyle(fontFamily_style, {
                    family:value
                });
                FONT_FAMILY_ITEMS.push({
                    name:name,
                    value:value,
                    attrs:attrs
                });
            }
        }

        var selectTpl = {
            click:function (ev) {
                var self = this,
                    v = ev.newVal,
                    pre = ev.prevVal,
                    styles = self.cfg.styles;
                editor.focus();
                editor.fire("save");
                var style = styles[v];
                if (v == pre) {
                    // 清除,wildcard pls
                    // !TODO inherit 小问题，在中间点 inherit
                    style.remove(editor.document);
                } else {
                    style.apply(editor.document);
                }
                editor.fire("save");
            },

            selectionChange:function (ev) {
                var self = this,
                    elementPath = ev.path,
                    elements = elementPath.elements,
                    styles = self.cfg.styles;

                // For each element into the elements path.
                for (var i = 0, element; i < elements.length; i++) {
                    element = elements[i];
                    // Check if the element is removable by any of
                    // the styles.
                    for (var value in styles) {
                        if (styles.hasOwnProperty(value)) {
                            if (styles[ value ].checkElementRemovable(element, true)) {
                                //S.log(value);
                                self.btn.set("value", value);
                                return;
                            }
                        }
                    }
                }

                var defaultValue = self.cfg.defaultValue;
                if (defaultValue) {
                    self.btn.set("value", defaultValue);
                } else {
                    self.btn.reset("value");
                }
            }
        };


        if (false !== pluginConfig["font-size"]) {
            controls.push(editor.addSelect("font-size", S.mix({
                title:"大小",
                width:"30px",
                mode:KE.WYSIWYG_MODE,
                showValue:true,
                defaultValue:FONT_SIZES.defaultValue,
                popUpWidth:FONT_SIZES.width,
                items:FONT_SIZE_ITEMS,
                styles:FONT_SIZE_STYLES
            }, selectTpl)));
        }

        if (false !== pluginConfig["font-family"]) {
            controls.push(editor.addSelect("font-family", S.mix({
                title:"字体",
                width:"110px",
                mode:KE.WYSIWYG_MODE,
                defaultValue:FONT_FAMILIES.defaultValue,
                popUpWidth:FONT_FAMILIES.width,
                items:FONT_FAMILY_ITEMS,
                styles:FONT_FAMILY_STYLES
            }, selectTpl)));
        }


        var singleFontTpl = {
            mode:KE.WYSIWYG_MODE,
            offClick:function () {
                var self = this,
                    editor = self.editor,
                    style = self.cfg.style;
                editor.fire("save");
                style.apply(editor.document);
                editor.fire("save");
                editor.notifySelectionChange();
                editor.focus();
            },
            onClick:function () {
                var self = this,
                    editor = self.editor,
                    style = self.cfg.style;
                editor.fire("save");
                style.remove(editor.document);
                editor.fire("save");
                editor.notifySelectionChange();
                editor.focus();
            },
            selectionChange:function (ev) {
                var self = this,
                    style = self.cfg.style,
                    btn = self.btn,
                    elementPath = ev.path;
                if (style.checkActive(elementPath)) {
                    btn.set("state", TripleButton.ON);
                } else {
                    btn.set("state", TripleButton.OFF);
                }
            }
        };

        if (false !== pluginConfig["font-bold"]) {
            controls.push(editor.addButton("font-bold", S.mix({
                contentCls:"ke-toolbar-bold",
                title:"粗体 ",
                style:new KEStyle({
                    element:'strong',
                    overrides:[
                        { element:'b' },
                        {element:'span',
                            attributes:{ style:'font-weight: bold;' }}
                    ]
                })
            }, singleFontTpl)));
        }

        if (false !== pluginConfig["font-italic"]) {
            controls.push(editor.addButton("font-italic", S.mix({
                contentCls:"ke-toolbar-italic",
                title:"斜体 ",
                style:new KEStyle({
                    element:'em',
                    overrides:[
                        { element:'i' },
                        {element:'span',
                            attributes:{ style:'font-style: italic;' }}
                    ]
                })
            }, singleFontTpl)));
        }

        if (false !== pluginConfig["font-underline"]) {
            controls.push(editor.addButton("font-underline", S.mix({
                contentCls:"ke-toolbar-underline",
                title:"下划线 ",
                style:new KEStyle({
                    element:'u',
                    overrides:[
                        {element:'span',
                            attributes:{ style:'text-decoration: underline;' }}
                    ]
                })
            }, singleFontTpl)));
        }

        if (false !== pluginConfig["font-strikeThrough"]) {
            var strikeStyle = (pluginConfig["font-strikeThrough"] || {})["style"] || {
                element:'del',
                overrides:[
                    {element:'span',
                        attributes:{ style:'text-decoration: line-through;' }},
                    { element:'s' },
                    { element:'strike' }
                ]
            };
            controls.push(editor.addButton("font-underline", S.mix({
                contentCls:"ke-toolbar-strikeThrough",
                title:"删除线 ",
                style:new KEStyle(strikeStyle)
            }, singleFontTpl)));
        }


        this.destroy = function () {
            for (var i = 0; i < controls.length; i++) {
                var c = controls[i];
                c.destroy();
            }
        };
    });
}, {
    attach:false
});
/**
 * format formatting,modified from ckeditor
 * @modifier yiminghe@gmail.com
 */
KISSY.Editor.add("format", function(editor) {
    editor.addPlugin("format", function() {
        var S = KISSY,
            KE = S.Editor,
            FORMAT_SELECTION_ITEMS = [],
            FORMATS = {
                "普通文本":"p",
                "标题1":"h1",
                "标题2":"h2",
                "标题3":"h3",
                "标题4":"h4",
                "标题5":"h5",
                "标题6":"h6"
            },
            FORMAT_SIZES = {
                p:"1em",
                h1:"2em",
                h2:"1.5em",
                h3:"1.17em",
                h4:"1em",
                h5:"0.83em",
                h6:"0.67em"
            },
            FORMAT_STYLES = {},
            KEStyle = KE.Style;

        for (var p in FORMATS) {
            if (FORMATS[p]) {
                FORMAT_STYLES[FORMATS[p]] = new KEStyle({
                    element:FORMATS[p]
                });
                FORMAT_SELECTION_ITEMS.push({
                    name:p,
                    value:FORMATS[p],
                    attrs:{
                        style:"font-size:" + FORMAT_SIZES[FORMATS[p]]
                    }
                });

            }
        }

        var context = editor.addSelect("font-family", {
            items:FORMAT_SELECTION_ITEMS,
            title:"标题",
            width:"100px",
            mode:KE.WYSIWYG_MODE,
            popUpWidth:"120px",
            click:function(ev) {
                var self = this,
                    v = ev.newVal,
                    pre = ev.prevVal;
                editor.fire("save");
                if (v != pre) {
                    FORMAT_STYLES[v].apply(editor.document);
                } else {
                    FORMAT_STYLES["p"].apply(editor.document);
                    self.btn.set("value", "p");
                }
                editor.fire("save");
            },
            selectionChange:function(ev) {
                var self = this,
                    elementPath = ev.path;
                // For each element into the elements path.
                // Check if the element is removable by any of
                // the styles.
                for (var value in FORMAT_STYLES) {
                    if (FORMAT_STYLES[ value ].checkActive(elementPath)) {
                        self.btn.set("value", value);
                        return;
                    }
                }
            }
        });


        this.destroy = function() {
            context.destroy();
        };
    });
}, {
    attach:false
});
/**
 * modified from ckeditor,process malform html and ms-word copy for kissyeditor
 * @modifier yiminghe@gmail.com
 */
/*
 Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.html or http://ckeditor.com/license
 */
KISSY.Editor.add("htmldataprocessor", function (editor) {
    var undefined = undefined,
        S = KISSY,
        KE = S.Editor,
        Node = S.Node,
        UA = S.UA,
        KEN = KE.NODE,
        HtmlParser = KE.HtmlParser,
        htmlFilter = new HtmlParser.Filter(),
        dataFilter = new HtmlParser.Filter(),
        wordFilter = new HtmlParser.Filter(),
        dtd = KE.XHTML_DTD;
    //每个编辑器的规则独立
    if (editor.htmlDataProcessor) return;

    /**
     * 给 fragment,Element,Dtd 加一些常用功能
     */
    (function () {

        var fragmentPrototype = KE.HtmlParser.Fragment.prototype,
            elementPrototype = KE.HtmlParser.Element.prototype;

        fragmentPrototype['onlyChild'] =
            elementPrototype.onlyChild = function () {
                var children = this.children,
                    count = children.length,
                    firstChild = ( count == 1 ) && children[ 0 ];
                return firstChild || null;
            };

        elementPrototype.removeAnyChildWithName = function (tagName) {
            var children = this.children,
                childs = [],
                child;

            for (var i = 0; i < children.length; i++) {
                child = children[ i ];
                if (!child.name)
                    continue;

                if (child.name == tagName) {
                    childs.push(child);
                    children.splice(i--, 1);
                }
                childs = childs.concat(child.removeAnyChildWithName(tagName));
            }
            return childs;
        };

        elementPrototype['getAncestor'] = function (tagNameRegex) {
            var parent = this.parent;
            while (parent && !( parent.name && parent.name.match(tagNameRegex) )) {
                parent = parent.parent;
            }
            return parent;
        };

        fragmentPrototype.firstChild = elementPrototype.firstChild = function (evaluator) {
            var child;

            for (var i = 0; i < this.children.length; i++) {
                child = this.children[ i ];
                if (evaluator(child))
                    return child;
                else if (child.name) {
                    child = child.firstChild(evaluator);
                    if (child)
                        return child;
                }
            }

            return null;
        };

        // Adding a (set) of styles to the element's 'style' attributes.
        elementPrototype.addStyle = function (name, value, isPrepend) {
            var styleText, addingStyleText = '';
            // name/value pair.
            if (typeof value == 'string')
                addingStyleText += name + ':' + value + ';';
            else {
                // style literal.
                if (typeof name == 'object') {
                    for (var style in name) {
                        if (name.hasOwnProperty(style))
                            addingStyleText += style + ':' + name[ style ] + ';';
                    }
                }
                // raw style text form.
                else
                    addingStyleText += name;

                isPrepend = value;
            }

            if (!this.attributes)
                this.attributes = {};

            styleText = this.attributes.style || '';

            styleText = ( isPrepend ?
                [ addingStyleText, styleText ]
                : [ styleText, addingStyleText ] ).join(';');

            this.attributes.style = styleText.replace(/^;|;(?=;)/, '');
        };

        /**
         * Return the DTD-valid parent tag names of the specified one.
         * @param tagName
         */
        dtd.parentOf = function (tagName) {
            var result = {};
            for (var tag in this) {
                if (this.hasOwnProperty(tag)) {
                    if (tag.indexOf('$') == -1 && this[ tag ][ tagName ])
                        result[ tag ] = 1;
                }
            }
            return result;
        };
    })();

    /**
     * 常用的规则：
     * 1。过滤一些常见东西
     * 2。处理 word 复制过来的列表
     */
    (function () {
        var //equalsIgnoreCase = KE.Utils.equalsIgnoreCase,
            filterStyle = stylesFilter([
                // word 自有属性名去除
                [/mso/i],
                [/w:WordDocument/i],
                // ie 自有属性名[/mso/i],
                [/^-ms/i],
                // firefox 自有属性名
                [/^-moz/i],
                // webkit 自有属性名
                [/^-webkit/i]//,
                //qc 3711，只能出现我们规定的字体
                /*
                 [ /font-size/i,'',function(v) {
                 var fontSizes = editor.cfg.pluginConfig["font-size"],
                 fonts = fontSizes.items;
                 for (var i = 0; i < fonts.length; i++) {
                 if (equalsIgnoreCase(v, fonts[i].value)) return v;
                 }
                 return false;
                 },'font-size'],
                 */

                //限制字体
                /*
                 [ /font-family/i,'',function(v) {
                 var fontFamilies = editor.cfg.pluginConfig["font-family"],
                 fams = fontFamilies.items;
                 for (var i = 0; i < fams.length; i++) {
                 var v2 = fams[i].value.toLowerCase();
                 if (equalsIgnoreCase(v, v2)
                 ||
                 equalsIgnoreCase(v, fams[i].name))
                 return v2;
                 }
                 return false;
                 } ,'font-family'],
                 */

                // qc 3701，去除行高，防止乱掉
                // beily_cn 报告需要去掉
                // [/line-height/i],

                // 旺铺编辑 html ，幻灯片切换 html
                // [/display/i,/none/i]
            ], undefined);

        function isListBulletIndicator(element) {
            var styleText = element.attributes && element.attributes.style || "";
            if (/mso-list\s*:\s*Ignore/i.test(styleText))
                return true;
            return undefined;
        }

        // Create a <ke:listbullet> which indicate an list item type.
        function createListBulletMarker(bulletStyle, bulletText) {
            var marker = new KE.HtmlParser.Element('ke:listbullet'),
                listType;

            // TODO: Support more list style type from MS-Word.
            if (!bulletStyle) {
                bulletStyle = 'decimal';
                listType = 'ol';
            } else if (bulletStyle[ 2 ]) {
                if (!isNaN(bulletStyle[ 1 ]))
                    bulletStyle = 'decimal';
                // No way to distinguish between Roman numerals and Alphas,
                // detect them as a whole.
                else if (/^[a-z]+$/.test(bulletStyle[ 1 ]))
                    bulletStyle = 'lower-alpha';
                else if (/^[A-Z]+$/.test(bulletStyle[ 1 ]))
                    bulletStyle = 'upper-alpha';
                // Simply use decimal for the rest forms of unrepresentable
                // numerals, e.g. Chinese...
                else
                    bulletStyle = 'decimal';

                listType = 'ol';
            } else {
                if (/[l\u00B7\u2002]/.test(bulletStyle[ 1 ]))
                    bulletStyle = 'disc';
                else if (/[\u006F\u00D8]/.test(bulletStyle[ 1 ]))
                    bulletStyle = 'circle';
                else if (/[\u006E\u25C6]/.test(bulletStyle[ 1 ]))
                    bulletStyle = 'square';
                else
                    bulletStyle = 'disc';

                listType = 'ul';
            }

            // Represent list type as CSS style.
            marker.attributes = {
                'ke:listtype': listType,
                'style': 'list-style-type:' + bulletStyle + ';'
            };
            marker.add(new KE.HtmlParser.Text(bulletText));
            return marker;
        }

        function resolveList(element) {
            // <ke:listbullet> indicate a list item.
            var attrs = element.attributes,
                listMarker;

            if (( listMarker = element.removeAnyChildWithName('ke:listbullet') )
                && listMarker.length
                && ( listMarker = listMarker[ 0 ] )) {
                element.name = 'ke:li';

                if (attrs.style) {
                    attrs.style = stylesFilter(
                        [
                            // Text-indent is not representing list item level any more.
                            [ 'text-indent' ],
                            [ 'line-height' ],
                            // Resolve indent level from 'margin-left' value.
                            [ ( /^margin(:?-left)?$/ ), null, function (margin) {
                                // Be able to deal with component/short-hand form style.
                                var values = margin.split(' ');
                                margin = values[ 3 ] || values[ 1 ] || values [ 0 ];
                                margin = parseInt(margin, 10);

                                // Figure out the indent unit by looking at the first increament.
                                if (!listBaseIndent && previousListItemMargin && margin > previousListItemMargin)
                                    listBaseIndent = margin - previousListItemMargin;

                                attrs[ 'ke:margin' ] = previousListItemMargin = margin;
                            } ]
                        ], undefined)(attrs.style, element) || '';
                }

                // Inherit list-type-style from bullet.
                var listBulletAttrs = listMarker.attributes,
                    listBulletStyle = listBulletAttrs.style;
                element.addStyle(listBulletStyle);
                S.mix(attrs, listBulletAttrs);
                return true;
            }

            return false;
        }

        function stylesFilter(styles, whitelist) {
            return function (styleText, element) {
                var rules = [];
                // html-encoded quote might be introduced by 'font-family'
                // from MS-Word which confused the following regexp. e.g.
                //'font-family: &quot;Lucida, Console&quot;'
                String(styleText)
                    .replace(/&quot;/g, '"')
                    .replace(/\s*([^ :;]+)\s*:\s*([^;]+)\s*(?=;|$)/g,
                    function (match, name, value) {
                        name = name.toLowerCase();
                        name == 'font-family' && ( value = value.replace(/["']/g, '') );

                        var namePattern,
                            valuePattern,
                            newValue,
                            newName;
                        for (var i = 0; i < styles.length; i++) {
                            if (styles[ i ]) {
                                namePattern = styles[ i ][ 0 ];
                                valuePattern = styles[ i ][ 1 ];
                                newValue = styles[ i ][ 2 ];
                                newName = styles[ i ][ 3 ];

                                if (name.match(namePattern)
                                    && ( !valuePattern || value.match(valuePattern) )) {
                                    name = newName || name;
                                    whitelist && ( newValue = newValue || value );

                                    if (typeof newValue == 'function')
                                        newValue = newValue(value, element, name);

                                    // Return an couple indicate both name and value
                                    // changed.
                                    if (newValue && newValue.push) {
                                        name = newValue[ 0 ];
                                        newValue = newValue[ 1 ];
                                    }

                                    if (typeof newValue == 'string')
                                        rules.push([ name, newValue ]);
                                    return;
                                }
                            }
                        }

                        !whitelist && rules.push([ name, value ]);

                    });

                for (var i = 0; i < rules.length; i++) {
                    rules[ i ] = rules[ i ].join(':');
                }

                return rules.length ?
                    ( rules.join(';') + ';' ) : false;
            };
        }

        function assembleList(element) {
            var children = element.children, child,
                listItem, // The current processing ke:li element.
                listItemAttrs,
                listType, // Determine the root type of the list.
                listItemIndent, // Indent level of current list item.
                lastListItem, // The previous one just been added to the list.
                list,
            //parentList, // Current staging list and it's parent list if any.
                indent;

            for (var i = 0; i < children.length; i++) {
                child = children[ i ];

                if ('ke:li' == child.name) {
                    child.name = 'li';
                    listItem = child;
                    listItemAttrs = listItem.attributes;
                    listType = listItem.attributes[ 'ke:listtype' ];

                    // List item indent level might come from a real list indentation or
                    // been resolved from a pseudo list item's margin value, even get
                    // no indentation at all.
                    listItemIndent = parseInt(listItemAttrs[ 'ke:indent' ], 10)
                        || listBaseIndent && ( Math.ceil(listItemAttrs[ 'ke:margin' ] / listBaseIndent) )
                        || 1;

                    // Ignore the 'list-style-type' attribute if it's matched with
                    // the list root element's default style type.
                    listItemAttrs.style && ( listItemAttrs.style =
                        stylesFilter([
                            [ 'list-style-type', listType == 'ol' ? 'decimal' : 'disc' ]
                        ], undefined)(listItemAttrs.style)
                            || '' );

                    if (!list) {
                        list = new KE.HtmlParser.Element(listType);
                        list.add(listItem);
                        children[ i ] = list;
                    }
                    else {
                        if (listItemIndent > indent) {
                            list = new KE.HtmlParser.Element(listType);
                            list.add(listItem);
                            lastListItem.add(list);
                        }
                        else if (listItemIndent < indent) {
                            // There might be a negative gap between two list levels. (#4944)
                            var diff = indent - listItemIndent,
                                parent;
                            while (diff-- && ( parent = list.parent )) {
                                list = parent.parent;
                            }

                            list.add(listItem);
                        }
                        else
                            list.add(listItem);

                        children.splice(i--, 1);
                    }

                    lastListItem = listItem;
                    indent = listItemIndent;
                }
                else
                    list = null;
            }

            listBaseIndent = 0;
        }

        var listBaseIndent,
            previousListItemMargin = 0,
        //protectElementNamesRegex = /(<\/?)((?:object|embed|param|html|body|head|title)[^>]*>)/gi,
            listDtdParents = dtd.parentOf('ol');

        //过滤外边来的 html
        var defaultDataFilterRules = {
            elementNames: [
                // Remove script,iframe style,link,meta
                [  /^script$/i , '' ],
                [  /^bgsound/i , '' ],
                [  /^iframe$/i , '' ],
                [  /^style$/i , '' ],
                [  /^link$/i , '' ],
                [  /^meta$/i , '' ],
                [/^\?xml.*$/i, ''],
                [/^.*namespace.*$/i, '']
            ],
            //根节点伪列表进行处理
            root: function (element) {
                element.filterChildren();
                assembleList(element);
            },
            elements: {
                /*
                 宝贝发布兼容性考虑，不要去除
                 font:function(el) {
                 delete el.name;
                 },
                 */
                p: function (element) {
                    element.filterChildren();
                    // Is the paragraph actually a list item?
                    if (resolveList(element))
                        return undefined;
                },
                $: function (el) {
                    var tagName = el.name || "";
                    //ms world <o:p> 保留内容
                    if (tagName.indexOf(':') != -1 && !/^ke/.test(tagName)) {
                        //先处理子孙节点，防止delete el.name后，子孙得不到处理?
                        //el.filterChildren();

                        // 和 firefox 一样处理，把 imagedata 转换成 image 标签
                        // note : webkit 自己处理了
                        if (tagName == 'v:imagedata') {
                            var href = el.attributes[ 'o:href' ];
                            if (href) {
                                el.attributes.src = el.attributes[ 'o:href' ];
                                delete el.attributes[ 'o:href' ];
                            }
                            var title = el.attributes[ 'o:title' ];
                            if (title) {
                                el.attributes.title = title;
                                delete el.attributes[ 'o:title' ];
                            }
                            el.name = 'img';
                            return;
                        }

                        delete el.name;
                    }

                    /*
                     太激进，只做span*/
                    //span也不做了，可能设置class，模板用来占位展示
//                    var style = el.attributes.style;
//                    //没有属性的inline去掉了
//                    if (//tagName in dtd.$inline
//                        tagName == "span"
//                            && (!style || !filterStyle(style))
//                        ) {
//                        //el.filterChildren();
//                        delete el.name;
//                    }

                    // Assembling list items into a whole list.
                    if (tagName in listDtdParents) {
                        el.filterChildren();
                        assembleList(el);
                    }
                },
                /**
                 * ul,li 从 ms word 重建
                 * @param element
                 */
                span: function (element) {
                    // IE/Safari: remove the span if it comes from list bullet text.
                    if (!UA.gecko &&
                        isListBulletIndicator(element.parent)
                        )
                        return false;

                    // For IE/Safari: List item bullet type is supposed to be indicated by
                    // the text of a span with style 'mso-list : Ignore' or an image.
                    if (!UA.gecko &&
                        isListBulletIndicator(element)) {
                        var listSymbolNode = element.firstChild(function (node) {
                            return node.value || node.name == 'img';
                        });
                        var listSymbol = listSymbolNode && ( listSymbolNode.value || 'l.' ),
                            listType = listSymbol && listSymbol.match(/^([^\s]+?)([.)]?)$/);
                        if (listType) {
                            return createListBulletMarker(listType, listSymbol);
                        }
                    }
                }
            },

            attributes: {
                //防止word的垃圾class，
                //全部杀掉算了，除了以ke_开头的编辑器内置class
                //不要全部杀掉，可能其他应用有需要
                'class': function (value
                                   // , element
                    ) {
                    if (
                        !value ||
                            /(^|\s+)Mso/.test(value)
                        ) {
                        return false;
                    }
                    return value;
                },
                'style': function (value) {
                    //去除<i style="mso-bidi-font-style: normal">微软垃圾
                    var re = filterStyle(value);
                    if (!re) {
                        return false;
                    }
                    return re;
                }
            },
            attributeNames: [
                // Event attributes (onXYZ) must not be directly set. They can become
                // active in the editing area (IE|WebKit).
                [ ( /^on/ ), 'ke_on' ],
                [/^lang$/, '']
            ]};


        /**
         * word 的注释对非 ie 浏览器很特殊
         */
        var wordRules = {
            comment: !UA['ie'] ?
                function (value, node) {
                    var imageInfo = value.match(/<img.*?>/),
                        listInfo = value.match(/^\[if !supportLists\]([\s\S]*?)\[endif\]$/);
                    // Seek for list bullet indicator.
                    if (listInfo) {
                        // Bullet symbol could be either text or an image.
                        var listSymbol = listInfo[ 1 ] || ( imageInfo && 'l.' ),
                            listType = listSymbol && listSymbol.match(/>([^\s]+?)([.)]?)</);
                        return createListBulletMarker(listType, listSymbol);
                    }

                    // Reveal the <img> element in conditional comments for Firefox.
                    if (UA.gecko && imageInfo) {
                        var img = KE.HtmlParser.Fragment.FromHtml(imageInfo[0]).children[ 0 ],
                            previousComment = node.previous,
                        // Try to dig the real image link from vml markup from previous comment text.
                            imgSrcInfo = previousComment && previousComment.value.match(/<v:imagedata[^>]*o:href=['"](.*?)['"]/),
                            imgSrc = imgSrcInfo && imgSrcInfo[ 1 ];
                        // Is there a real 'src' url to be used?
                        imgSrc && ( img.attributes.src = imgSrc );
                        return img;
                    }
                    return false;
                } :
                function () {
                    return false;
                }
        };
        // 将编辑区生成 html 最终化
        var defaultHtmlFilterRules = {
            elementNames: [
                // Remove the "ke:" namespace prefix.
                [ ( /^ke:/ ), '' ],
                // Ignore <?xml:namespace> tags.
                [ ( /^\?xml:namespace$/ ), '' ]
            ],
            elements: {
                $: function (element) {
                    var attribs = element.attributes;

                    if (attribs) {
                        // 先把真正属性去掉，后面会把_ke_saved后缀去掉的！
                        // Remove duplicated attributes - #3789.
                        var attributeNames = [ 'name', 'href', 'src' ],
                            savedAttributeName;
                        for (var i = 0; i < attributeNames.length; i++) {
                            savedAttributeName = '_ke_saved_' + attributeNames[ i ];
                            savedAttributeName in attribs && ( delete attribs[ attributeNames[ i ] ] );
                        }
                    }

                    return element;
                },
                embed: function (element) {
                    var parent = element.parent;
                    // If the <embed> is child of a <object>, copy the width
                    // and height attributes from it.
                    if (parent && parent.name == 'object') {
                        var parentWidth = parent.attributes.width,
                            parentHeight = parent.attributes.height;
                        parentWidth && ( element.attributes.width = parentWidth );
                        parentHeight && ( element.attributes.height = parentHeight );
                    }
                },
                // Restore param elements into self-closing.
                param: function (param) {
                    param.children = [];
                    param.isEmpty = true;
                    return param;
                },
                // Remove empty link but not empty anchor.(#3829)
                a: function (element) {
                    if (!element.children.length && S.isEmptyObject(element.attributes)) {
                        return false;
                    }
                },
                span: function (element) {
                    if (!element.children.length && S.isEmptyObject(element.attributes)) {
                        return false;
                    }
                }
            },
            attributes: {
                // 清除空style
                style: function (v) {
                    if (!S.trim(v)) {
                        return false;
                    }
                }
            },
            attributeNames: [
                // 把保存的作为真正的属性，替换掉原来的
                // replace(/^_ke_saved_/,"")
                // _ke_saved_href -> href
                [ ( /^_ke_saved_/ ), '' ],
                [ ( /^ke_on/ ), 'on' ],
                [ ( /^_ke.*/ ), '' ],
                //!TODO 不知道怎么回事会引入
                [ ( /^_ks.*/ ), '' ],
                [ ( /^ke:.*$/ ), '' ]
            ],

            comment: function (contents) {
                // If this is a comment for protected source.
                if (contents.substr(0, protectedSourceMarker.length) == protectedSourceMarker) {
                    // Remove the extra marker for real comments from it.
                    if (contents.substr(protectedSourceMarker.length, 3) == '{C}')
                        contents = contents.substr(protectedSourceMarker.length + 3);
                    else
                        contents = contents.substr(protectedSourceMarker.length);

                    return new KE.HtmlParser.cdata(decodeURIComponent(contents));
                }

                return contents;
            }
        };
        if (UA['ie']) {
            // IE outputs style attribute in capital letters. We should convert
            // them back to lower case.
            // bug: style='background:url(www.G.cn)' =>  style='background:url(www.g.cn)'
            // 只对 propertyName 小写
            defaultHtmlFilterRules.attributes.style = function (value // , element
                ) {
                return value.replace(/(^|;)([^:]+)/g, function (match) {
                    return match.toLowerCase();
                });
            };
        }

        htmlFilter.addRules(defaultHtmlFilterRules);
        dataFilter.addRules(defaultDataFilterRules);
        wordFilter.addRules(defaultDataFilterRules);
        wordFilter.addRules(wordRules);
    })();


    /**
     * 去除firefox代码末尾自动添加的 <br/>
     * 以及ie下自动添加的 &nbsp;
     * 以及其他浏览器段落末尾添加的占位符
     */
    (function () {
        // Regex to scan for &nbsp; at the end of blocks, which are actually placeholders.
        // Safari transforms the &nbsp; to \xa0. (#4172)
        var tailNbspRegex = /^[\t\r\n ]*(?:&nbsp;|\xa0)$/;

        // Return the last non-space child node of the block (#4344).
        function lastNoneSpaceChild(block) {
            var lastIndex = block.children.length,
                last = block.children[ lastIndex - 1 ];
            while (last && last.type == KEN.NODE_TEXT &&
                !S.trim(last.value)) {
                last = block.children[ --lastIndex ];
            }
            return last;
        }

        function blockNeedsExtension(block) {
            var lastChild = lastNoneSpaceChild(block);

            return !lastChild
                || lastChild.type == KEN.NODE_ELEMENT &&
                lastChild.name == 'br'
                // Some of the controls in form needs extension too,
                // to move cursor at the end of the form. (#4791)
                || block.name == 'form' &&
                lastChild.name == 'input';
        }

        /**
         *
         * @param block
         * @param {boolean=} fromSource
         */
        function trimFillers(block, fromSource) {
            // If the current node is a block, and if we're converting from source or
            // we're not in IE then search for and remove any tailing BR node.
            // Also, any &nbsp; at the end of blocks are fillers, remove them as well.
            // (#2886)
            var children = block.children,
                lastChild = lastNoneSpaceChild(block);
            if (lastChild) {
                if (( fromSource || !UA['ie'] ) &&
                    lastChild.type == KEN.NODE_ELEMENT &&
                    lastChild.name == 'br') {
                    children.pop();
                }
                if (lastChild.type == KEN.NODE_TEXT &&
                    tailNbspRegex.test(lastChild.value)) {
                    children.pop();
                }
            }
        }

        function extendBlockForDisplay(block) {
            trimFillers(block, true);

            if (blockNeedsExtension(block)) {
                //任何浏览器都要加空格！，否则空表格可能间隙太小，不能容下光标
                if (UA['ie']) {
                    block.add(new KE.HtmlParser.Text('\xa0'));
                } else {
                    //其他浏览器需要加空格??
                    block.add(new KE.HtmlParser.Text('&nbsp;'));
                    block.add(new KE.HtmlParser.Element('br', {}));
                }

            }
        }

        function extendBlockForOutput(block) {
            trimFillers(block, false);
            if (blockNeedsExtension(block)) {
                block.add(new KE.HtmlParser.Text('\xa0'));
            }
        }

        // Find out the list of block-like tags that can contain <br>.
        var dtd = KE.XHTML_DTD;
        var blockLikeTags = KE.Utils.mix({},
            dtd.$block,
            dtd.$listItem,
            dtd.$tableContent), i;
        for (i in blockLikeTags) {
            if (blockLikeTags.hasOwnProperty(i)) {
                if (!( 'br' in dtd[i] )) {
                    delete blockLikeTags[i];
                }
            }
        }

        // table 布局需要，不要自动往 td 中加东西
        delete blockLikeTags.td;

        // We just avoid filler in <pre> right now.
        // TODO: Support filler for <pre>, line break is also occupy line height.
        delete blockLikeTags.pre;
        var defaultDataBlockFilterRules = { elements: {} };
        var defaultHtmlBlockFilterRules = { elements: {} };
        for (i in blockLikeTags) {
            if (blockLikeTags.hasOwnProperty(i)) {
                defaultDataBlockFilterRules.elements[ i ] = extendBlockForDisplay;
                defaultHtmlBlockFilterRules.elements[ i ] = extendBlockForOutput;
            }
        }
        dataFilter.addRules(defaultDataBlockFilterRules);
        htmlFilter.addRules(defaultHtmlBlockFilterRules);
        wordFilter.addRules(defaultDataBlockFilterRules);
    })();


    // htmlparser fragment 中的 entities 处理
    // el.innerHTML="&nbsp;"
    // http://yiminghe.javaeye.com/blog/788929
    (function () {
        htmlFilter.addRules({
            text: function (text) {
                return text
                    //.replace(/&nbsp;/g, "\xa0")
                    .replace(/\xa0/g, "&nbsp;");
            }
        });
    })();


    var protectElementRegex = /<(a|area|img|input)\b([^>]*)>/gi,
        protectAttributeRegex = /\b(href|src|name)\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|(?:[^ "'>]+))/gi;
    // ie 6-7 会将 关于 url 的 content value 替换为 dom value
    // #a -> http://xxx/#a
    // ../x.html -> http://xx/x.html
    function protectAttributes(html) {
        return html.replace(protectElementRegex, function (element, tag, attributes) {
            return '<' + tag + attributes.replace(protectAttributeRegex, function (fullAttr, attrName) {
                // We should not rewrite the existed protected attributes,
                // e.g. clipboard content from editor. (#5218)
                if (attributes.indexOf('_ke_saved_' + attrName) == -1)
                    return ' _ke_saved_' + fullAttr + ' ' + fullAttr;

                return fullAttr;
            }) + '>';
        });
    }

    var protectedSourceMarker = '{ke_protected}';

//    function protectRealComments(html) {
//        return html.replace(/<!--(?!{ke_protected})[\s\S]+?-->/g, function(match) {
//            return '<!--' + protectedSourceMarker +
//                '{C}' +
//                encodeURIComponent(match).replace(/--/g, '%2D%2D') +
//                '-->';
//        });
//    }
//
//    function unprotectRealComments(html) {
//        return html.replace(/<!--\{ke_protected\}\{C\}([\s\S]+?)-->/g, function(match, data) {
//            return decodeURIComponent(data);
//        });
//    }


    editor.htmlDataProcessor = {
        //过滤 ms-word
        wordFilter: wordFilter,
        dataFilter: dataFilter,
        htmlFilter: htmlFilter,
        //编辑器 html 到外部 html
        toHtml: function (html, fixForBody) {

            //fixForBody = fixForBody || "p";
            // Now use our parser to make further fixes to the structure, as
            // well as apply the filter.
            //使用htmlwriter界面美观，加入额外文字节点\n,\t空白等

            var writer = new HtmlParser.HtmlWriter(),
                fragment = HtmlParser.Fragment.FromHtml(html, fixForBody);

            fragment.writeHtml(writer, htmlFilter);
            return writer.getHtml(true);
        },
        //外部html进入编辑器
        toDataFormat: function (html, fixForBody, _dataFilter) {

            //可以传 wordFilter 或 dataFilter
            _dataFilter = _dataFilter || dataFilter;
            // Firefox will be confused by those downlevel-revealed IE conditional
            // comments, fixing them first( convert it to upperlevel-revealed one ).
            // e.g. <![if !vml]>...<![endif]>
            //<!--[if !supportLists]-->
            // <span style=\"font-family: Wingdings;\" lang=\"EN-US\">
            // <span style=\"\">l<span style=\"font: 7pt &quot;Times New Roman&quot;;\">&nbsp;
            // </span></span></span>
            // <!--[endif]-->

            //变成：

            //<!--[if !supportLists]
            // <span style=\"font-family: Wingdings;\" lang=\"EN-US\">
            // <span style=\"\">l<span style=\"font: 7pt &quot;Times New Roman&quot;;\">&nbsp;
            // </span></span></span>
            // [endif]-->
            if (UA.gecko) {
                html = html.replace(/(<!--\[if[^<]*?\])-->([\S\s]*?)<!--(\[endif\]-->)/gi,
                    '$1$2$3');
            }

            html = protectAttributes(html);

            //标签不合法可能parser出错，这里先用浏览器帮我们建立棵合法的dom树的html
            // Call the browser to help us fixing a possibly invalid HTML
            // structure.
            var div = new Node("<div>");
            // Add fake character to workaround IE comments bug. (#3801)
            div.html('a' + html);
            html = div.html().substr(1);

            // Restore the comments that have been protected, in this way they
            // can be properly filtered.
            //html = unprotectRealComments(html);

            // Certain elements has problem to go through DOM operation, protect
            // them by prefixing 'ke' namespace. (#3591)
            //html = html.replace(protectElementNamesRegex, '$1ke:$2');
            //fixForBody = fixForBody || "p";
            //bug:qc #3710:使用basicwriter，去除无用的文字节点，标签间连续\n空白等

            var writer = new HtmlParser.BasicWriter(),
                fragment = HtmlParser.Fragment.FromHtml(html, fixForBody);

            writer.reset();
            fragment.writeHtml(writer, _dataFilter);
            html = writer.getHtml(true);
            // Protect the real comments again.
            //html = protectRealComments(html);

            return html;
        },
        /*
         最精简html传送到server
         */
        toServer: function (html, fixForBody) {
            var writer = new HtmlParser.BasicWriter(),
                fragment = HtmlParser.Fragment.FromHtml(html, fixForBody);
            fragment.writeHtml(writer, htmlFilter);
            return writer.getHtml(true);
        }
    };
}, {
    attach: false
});
/**
 * insert image for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("image", function (editor) {
    editor.addPlugin("image", function () {
        var S = KISSY,
            KE = S.Editor,
            UA = S.UA,
            Node = S.Node,
            Event = S.Event,
            checkImg = function (node) {
                return node._4e_name() === 'img' &&
                    (!/(^|\s+)ke_/.test(node[0].className)) &&
                    node;
            },
            controls = {},
            addRes = KE.Utils.addRes,
            destroyRes = KE.Utils.destroyRes,
            tipHtml = ' '
                + '<a class="ke-bubbleview-url" target="_blank" href="#">在新窗口查看</a>  |  '
                + '<a class="ke-bubbleview-link ke-bubbleview-change" href="#">编辑</a>  |  '
                + '<a class="ke-bubbleview-link ke-bubbleview-remove" href="#">删除</a>'
                + '',

            //重新采用form提交，不采用flash，国产浏览器很多问题
            context = editor.addButton("image", {
                contentCls:"ke-toolbar-image",
                title:"插入图片",
                mode:KE.WYSIWYG_MODE,
                offClick:function () {
                    this.call("show");
                },
                _updateTip:function (tipurl, img) {
                    var src = img.attr("_ke_saved_src") || img.attr("src");
                    //tipurl.html(src);
                    tipurl.attr("href", src);
                },
                show:function (ev, _selectedEl) {
                    var editor = this.editor;
                    editor.showDialog("image/dialog", [_selectedEl]);
                }
            });

        addRes.call(controls, context, function () {
            editor.destroyDialog("image/dialog");
        });


        KE.use("contextmenu", function () {
            var contextMenu = {
                "图片属性":function (editor) {
                    var selection = editor.getSelection(),
                        startElement = selection && selection.getStartElement(),
                        img = checkImg(startElement);
                    if (img) {
                        context.call("show", null, img);
                    }
                },
                "插入新行":function (editor) {
                    var selection = editor.getSelection(),
                        startElement = selection && selection.getStartElement();
                    if (!startElement) {
                        return;
                    }
                    var doc = editor.document,
                        p = new Node(doc.createElement("p"));
                    if (!UA['ie']) {
                        p._4e_appendBogus();
                    }
                    var r = new KE.Range(doc);
                    r.setStartAfter(startElement);
                    r.select();
                    editor.insertElement(p);
                    r.moveToElementEditablePosition(p, 1);
                    r.select();
                }
            };


            var myContexts = {};
            for (var f in contextMenu) {
                if (contextMenu.hasOwnProperty(f)) {
                    (function (f) {
                        myContexts[f] = function () {
                            contextMenu[f](editor);
                        }
                    })(f);
                }
            }
            var menu = KE.ContextMenu.register({
                editor:editor,
                rules:[checkImg],
                width:"120px",
                funcs:myContexts
            });
            addRes.call(controls, menu);
        });


        function dblshow(ev) {
            var t = new Node(ev.target);
            ev.halt();
            if (checkImg(t)) {
                context.call("show", null, t);
            }
        }

        Event.on(editor.document, "dblclick", dblshow);

        addRes.call(controls, function () {
            Event.remove(editor.document,
                "dblclick",
                dblshow);
        });

        KE.use("bubbleview", function () {
            KE.BubbleView.register({
                pluginName:'image',
                pluginContext:context,
                editor:editor,
                func:checkImg,
                init:function () {
                    var bubble = this,
                        el = bubble.get("contentEl");
                    el.html(tipHtml);
                    var tipurl = el.one(".ke-bubbleview-url"),
                        tipchange = el.one(".ke-bubbleview-change"),
                        tipremove = el.one(".ke-bubbleview-remove");
                    //ie focus not lose
                    KE.Utils.preventFocus(el);
                    tipchange.on("click", function (ev) {
                        bubble._plugin.call("show", null, bubble._selectedEl);
                        ev.halt();
                    });
                    tipremove.on("click", function (ev) {
                        var flash = bubble._plugin;
                        if (UA['webkit']) {
                            var r = flash.editor.getSelection().getRanges();
                            r && r[0] && (r[0].collapse(true) || true) && r[0].select();
                        }
                        bubble._selectedEl._4e_remove();
                        bubble.hide();
                        flash.editor.notifySelectionChange();
                        ev.halt();
                    });
                    KE.Utils.addRes.call(bubble, tipchange, tipremove);
                    /*
                     位置变化
                     */
                    bubble.on("show", function () {
                        var a = bubble._selectedEl,
                            b = bubble._plugin;
                        if (!a)return;
                        b.call("_updateTip", tipurl, a);
                    });
                }
            });

            addRes.call(controls, function () {
                KE.BubbleView.destroy("image")
            });
        });


        this.destroy = function () {
            destroyRes.call(controls);
        };
    });
}, {
    attach:false
});/**
 * indent formatting
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("indent", function(editor) {
    editor.addPlugin("indent", function() {
        var KE = KISSY.Editor;

        var outdent = editor.addButton("outdent", {
            title:"减少缩进量 ",
            mode:KE.WYSIWYG_MODE,
            contentCls:"ke-toolbar-outdent",
            type:"outdent",
            loading:true
        });

        var indent = editor.addButton("indent", {
            title:"增加缩进量 ",
            mode:KE.WYSIWYG_MODE,
            contentCls:"ke-toolbar-indent",
            type:"indent",
            loading:true
        });

        KE.use("indent/support", function() {
            outdent.reload(KE.IndentSupport);
            indent.reload(KE.IndentSupport);
        });

        editor.addCommand("indent", {
            exec:function() {
                indent.call("offClick");
            }
        });

        editor.addCommand("outdent", {
            exec:function() {
                outdent.call("offClick");
            }
        });

        this.destroy = function() {
            outdent.destroy();
            indent.destroy();
        };
    });
}, {
    attach:false
});
/*
 Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.html or http://ckeditor.com/license
 */
KISSY.Editor.add("indent/support", function() {
    var KE = KISSY.Editor,
        listNodeNames = {ol:1,ul:1},
        S = KISSY,
        Walker = KE.Walker,
        DOM = S.DOM,
        Node = S.Node,
        UA = S.UA,
        KEN = KE.NODE;
    var isNotWhitespaces = Walker.whitespaces(true),
        isNotBookmark = Walker.bookmark(false, true);

    function IndentCommand(type) {
        this.type = type;
        this.indentCssProperty = "margin-left";
        this.indentOffset = 40;
        this.indentUnit = "px";
    }

    function isListItem(node) {
        return node[0].nodeType == KEN.NODE_ELEMENT && node._4e_name() == 'li';
    }

    function indentList(range, listNode) {
        // Our starting and ending points of the range might be inside some blocks under a list item...
        // So before playing with the iterator, we need to expand the block to include the list items.

        var startContainer = range.startContainer,
            endContainer = range.endContainer;
        while (startContainer &&
            !startContainer.parent()._4e_equals(listNode))
            startContainer = startContainer.parent();
        while (endContainer &&
            !endContainer.parent()._4e_equals(listNode))
            endContainer = endContainer.parent();

        if (!startContainer || !endContainer)
            return;

        // Now we can iterate over the individual items on the same tree depth.
        var block = startContainer,
            itemsToMove = [],
            stopFlag = false;
        while (!stopFlag) {
            if (block._4e_equals(endContainer))
                stopFlag = true;
            itemsToMove.push(block);
            block = block.next();
        }
        if (itemsToMove.length < 1)
            return;

        // Do indent or outdent operations on the array model of the list, not the
        // list's DOM tree itself. The array model demands that it knows as much as
        // possible about the surrounding lists, we need to feed it the further
        // ancestor node that is still a list.
        var listParents = listNode._4e_parents(true);
        for (var i = 0; i < listParents.length; i++) {
            if (listNodeNames[ listParents[i]._4e_name() ]) {
                listNode = listParents[i];
                break;
            }
        }
        var indentOffset = this.type == 'indent' ? 1 : -1,
            startItem = itemsToMove[0],
            lastItem = itemsToMove[ itemsToMove.length - 1 ],
            database = {};

        // Convert the list DOM tree into a one dimensional array.
        var listArray = KE.ListUtils.listToArray(listNode, database);

        // Apply indenting or outdenting on the array.
        // listarray_index 为 item 在数组中的下标，方便计算
        var baseIndent = listArray[ lastItem.data('listarray_index') ].indent;
        for (i = startItem.data('listarray_index');
             i <= lastItem.data('listarray_index'); i++) {
            listArray[ i ].indent += indentOffset;
            // Make sure the newly created sublist get a brand-new element of the same type. (#5372)
            var listRoot = listArray[ i ].parent;
            listArray[ i ].parent =
                new Node(listRoot[0].ownerDocument.createElement(listRoot._4e_name()));
        }
        /*
         嵌到下层的li
         <li>鼠标所在开始</li>
         <li>ss鼠标所在结束ss
         <ul>
         <li></li>
         <li></li>
         </ul>
         </li>
         baseIndent 为鼠标所在结束的嵌套层次，
         如果下面的比结束li的indent大，那么证明是嵌在结束li里面的，也要缩进
         一直处理到大于或等于，跳出了当前嵌套
         */
        for (i = lastItem.data('listarray_index') + 1;
             i < listArray.length && listArray[i].indent > baseIndent; i++)
            listArray[i].indent += indentOffset;

        // Convert the array back to a DOM forest (yes we might have a few subtrees now).
        // And replace the old list with the new forest.
        var newList = KE.ListUtils.arrayToList(listArray,
            database, null,
            "p",
            0);

        // Avoid nested <li> after outdent even they're visually same,
        // recording them for later refactoring.(#3982)
        var pendingList = [];
        if (this.type == 'outdent') {
            var parentLiElement;
            if (( parentLiElement = listNode.parent() ) &&
                parentLiElement._4e_name() == 'li') {
                var children = newList.listNode.childNodes
                    ,count = children.length,
                    child;

                for (i = count - 1; i >= 0; i--) {
                    if (( child = new Node(children[i]) ) &&
                        child._4e_name() == 'li')
                        pendingList.push(child);
                }
            }
        }

        if (newList) {
            DOM.insertBefore(newList.listNode[0]||newList.listNode,
                listNode[0]||listNode);
            listNode._4e_remove();
        }
        // Move the nested <li> to be appeared after the parent.
        if (pendingList && pendingList.length) {
            for (i = 0; i < pendingList.length; i++) {
                var li = pendingList[ i ],
                    followingList = li;

                // Nest preceding <ul>/<ol> inside current <li> if any.
                while (( followingList = followingList.next() ) &&

                    followingList._4e_name() in listNodeNames) {
                    // IE requires a filler NBSP for nested list inside empty list item,
                    // otherwise the list item will be inaccessiable. (#4476)
                    if (UA['ie'] && !li._4e_first(function(node) {
                        return isNotWhitespaces(node) && isNotBookmark(node);
                    }))
                        li[0].appendChild(range.document.createTextNode('\u00a0'));

                    li[0].appendChild(followingList[0]);
                }
                DOM.insertAfter(li[0], parentLiElement[0]);
            }
        }

        // Clean up the markers.
        KE.Utils.clearAllMarkers(database);
    }

    function indentBlock(range) {
        var iterator = range.createIterator();
        //  enterMode = "p";
        iterator.enforceRealBlocks = true;
        iterator.enlargeBr = true;
        var block;
        while (( block = iterator.getNextParagraph() ))
            indentElement.call(this, block);
    }

    function indentElement(element) {

        var currentOffset = parseInt(element._4e_style(this.indentCssProperty), 10);
        if (isNaN(currentOffset))
            currentOffset = 0;
        currentOffset += ( this.type == 'indent' ? 1 : -1 ) * this.indentOffset;

        if (currentOffset < 0)
            return false;

        currentOffset = Math.max(currentOffset, 0);
        currentOffset = Math.ceil(currentOffset / this.indentOffset,undefined) * this.indentOffset;
        element.css(this.indentCssProperty, currentOffset ? currentOffset + this.indentUnit : '');
        if (element[0].style.cssText === '')
            element.removeAttr('style');

        return true;
    }

    S.augment(IndentCommand, {
        exec:function(editor) {

            var selection = editor.getSelection(),
                range = selection && selection.getRanges()[0];
            var startContainer = range.startContainer,
                endContainer = range.endContainer,
                rangeRoot = range.getCommonAncestor(),
                nearestListBlock = rangeRoot;

            while (nearestListBlock && !( nearestListBlock[0].nodeType == KEN.NODE_ELEMENT &&
                listNodeNames[ nearestListBlock._4e_name() ] ))
                nearestListBlock = nearestListBlock.parent();

            // Avoid selection anchors under list root.
            // <ul>[<li>...</li>]</ul> =>	<ul><li>[...]</li></ul>
            //注：firefox 永远不会出现
            //注2：哪种情况会出现？
            if (nearestListBlock
                && startContainer[0].nodeType == KEN.NODE_ELEMENT
                && startContainer._4e_name() in listNodeNames) {
                //S.log("indent from ul/ol");
                var walker = new Walker(range);
                walker.evaluator = isListItem;
                range.startContainer = walker.next();
            }

            if (nearestListBlock
                && endContainer[0].nodeType == KEN.NODE_ELEMENT
                && endContainer._4e_name() in listNodeNames) {
                walker = new Walker(range);
                walker.evaluator = isListItem;
                range.endContainer = walker.previous();
            }

            var bookmarks = selection.createBookmarks(true);

            if (nearestListBlock) {
                var firstListItem = nearestListBlock._4e_first();
                while (firstListItem
                    &&
                    firstListItem._4e_name() != "li") {
                    firstListItem = firstListItem.next();
                }
                var rangeStart = range.startContainer,
                    indentWholeList = firstListItem[0] == rangeStart[0]
                        || firstListItem.contains(rangeStart);

                // Indent the entire list if  cursor is inside the first list item. (#3893)
                if (!( indentWholeList
                    &&
                    indentElement.call(this, nearestListBlock) ))
                    indentList.call(this, range, nearestListBlock);
            }
            else
                indentBlock.call(this, range);
            selection.selectBookmarks(bookmarks);
        }
    });

    KE.IndentSupport = {
        init:function() {
            var self = this,
                cfg = self.cfg;
            self.indentCommand = new IndentCommand(cfg.type);
        },
        offClick:function() {
            var self = this,
                editor = self.editor;
            //ie要等会才能获得焦点窗口的选择区域
            editor.fire("save");
            setTimeout(function() {
                self.indentCommand.exec(editor);
                editor.fire("save");
                editor.notifySelectionChange();
            }, 10);
        },
        selectionChange:function(ev) {
            var self = this,
                cfg = self.cfg;
            if (cfg.type != "outdent") return;

            var elementPath = ev.path,
                blockLimit = elementPath.blockLimit,
                el = self.btn;

            if (elementPath.contains(listNodeNames)) {
                el.boff();
            } else {
                var block = elementPath.block || blockLimit;
                if (block && block._4e_style(self.indentCommand.indentCssProperty)) {
                    el.boff();
                } else {
                    el.disable();
                }
            }
        }
    };
},{
    attach:false
});/**
 * align support for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("justify", function(editor) {

    editor.addPlugin("justify", function() {
        var S = KISSY,
            KE = S.Editor,
            TripleButton = KE.TripleButton;
        var alignRemoveRegex = /(-moz-|-webkit-|start|auto)/gi,
            default_align = "left";

        var JustifyTpl = {
            mode:KE.WYSIWYG_MODE,
            offClick:function() {
                this.call("_change");
            },
            onClick:function() {
                this.call("_change");
            },
            _change:function() {
                var self = this,
                    editor = self.editor,
                    selection = editor.getSelection(),
                    state = self.btn.get("state");

                if (!selection)
                    return;

                var bookmarks = selection.createBookmarks(),
                    ranges = selection.getRanges(),
                    iterator,
                    block;
                editor.fire("save");
                for (var i = ranges.length - 1;
                     i >= 0;
                     i--) {
                    iterator = ranges[ i ].createIterator();
                    iterator.enlargeBr = true;
                    while (( block = iterator.getNextParagraph() )) {
                        block.removeAttr('align');
                        if (state == TripleButton.OFF)
                            block.css('text-align', self.cfg.v);
                        else
                            block.css('text-align', '');
                    }
                }
                editor.notifySelectionChange();
                selection.selectBookmarks(bookmarks);
                editor.fire("save");
            },
            selectionChange:function(ev) {
                var self = this,
                    el = self.btn,
                    path = ev.path,
                    //elements = path.elements,
                    block = path.block || path.blockLimit;
                //如果block是body，就不要设置，
                // <body>
                // <ul>
                // <li style='text-align:center'>
                // </li>
                // </ul>
                // </body>
                //gecko ctrl-a 为直接得到 container : body
                //其他浏览器 ctrl-a 得到 container : li
                if (!block || block._4e_name() === "body") {
                    el.boff();
                    return;
                }
                var align = block.css("text-align")
                    .replace(alignRemoveRegex, "")
                    //默认值，没有设置
                    || default_align;

                if (align == self.cfg.v) {
                    el.bon();
                } else {
                    el.boff();
                }
            }
        };
        var alignleft = editor.addButton("alignleft", S.mix({
            contentCls:"ke-toolbar-alignleft",
            title:"左对齐",
            v:"left"
        }, JustifyTpl));

        var aligncenter = editor.addButton("aligncenter", S.mix({
            contentCls:"ke-toolbar-aligncenter",
            title:"居中对齐",
            v:"center"
        }, JustifyTpl));

        var alignright = editor.addButton("alignright", S.mix({
            contentCls:"ke-toolbar-alignright",
            title:"右对齐",
            v:"right"
        }, JustifyTpl));

        this.destroy = function() {
            alignleft.destroy();
            aligncenter.destroy();
            alignright.destroy();
        };
    });

}, {
    attach:false
});
/**
 * link editor support for kissy editor ,innovation from google doc and ckeditor
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("link", function (editor) {
    editor.addPlugin("link", function () {
        var S = KISSY,
            UA = S.UA,
            KE = S.Editor,
            DTD = KE.XHTML_DTD,
            Node = S.Node,
            KEStyle = KE.Style,
            _ke_saved_href = "_ke_saved_href",
            link_Style = {
                element:'a',
                attributes:{
                    "href":"#(href)",
                    "title":"#(title)",
                    // ie < 8 会把锚点地址修改，以及相对地址改为绝对地址
                    // 1. 编辑器位于 http://x.com/edit.htm
                    // 2. 用户输入 ./a.htm
                    // 3. 生成为 <a href='http://x.com/a.htm'>
                    // 另一个问题 refer: http://stackoverflow.com/questions/687552/prevent-tinymce-internet-explorer-from-converting-urls-to-links
                    "_ke_saved_href":"#(_ke_saved_href)",
                    target:"#(target)"
                }
            },
            /**
             * bubbleview/tip 初始化，所有共享一个 tip
             */
                tipHtml = '<a ' +
                'href="" '
                + ' target="_blank" ' +
                'class="ke-bubbleview-url">' +
                '在新窗口查看' +
                '</a>  –  '
                + ' <span ' +
                'class="ke-bubbleview-link ke-bubbleview-change">' +
                '编辑' +
                '</span>   |   '
                + ' <span ' +
                'class="ke-bubbleview-link ke-bubbleview-remove">' +
                '去除' +
                '</span>';

        function checkLink(lastElement) {
            return lastElement._4e_ascendant(function (node) {
                return node._4e_name() === 'a';
                // <a><img></a> 不能嵌套 a
                // && (!!node.attr("href"));
            }, true);
        }

        function getAttributes(el) {
            var attributes = el.attributes, re = {};
            for (var i = 0; i < attributes.length; i++) {
                var a = attributes[i];
                if (a.specified) {
                    re[a.name] = a.value;
                }
            }
            if (el.style.cssText) {
                re.style = el.style.cssText;
            }
            return re;
        }

        var controls = {}, addRes = KE.Utils.addRes,
            destroyRes = KE.Utils.destroyRes;


        var context = editor.addButton("link", {
            contentCls:"ke-toolbar-link",
            title:"插入链接",
            mode:KE.WYSIWYG_MODE,
            //得到当前选中的 link a
            _getSelectedLink:function () {
                var self = this,
                    editor = self.editor,
                    //ie焦点很容易丢失,tipwin没了
                    selection = editor.getSelection(),
                    common = selection && selection.getStartElement();
                if (common) {
                    common = checkLink(common);
                }
                return common;
            },
            _getSelectionLinkUrl:function () {
                var self = this, cfg = self.cfg, link = cfg._getSelectedLink.call(self);
                if (link) return link.attr(_ke_saved_href) || link.attr("href");
            },
            _removeLink:function (a) {
                var self = this,
                    editor = self.editor;
                editor.fire("save");
                var sel = editor.getSelection(),
                    range = sel.getRanges()[0];
                if (range && range.collapsed) {
                    var bs = sel.createBookmarks();
                    //不使用核心 styles ，直接清除元素标记即可。
                    a._4e_remove(true);
                    sel.selectBookmarks(bs);
                } else if (range) {
                    var attrs = getAttributes(a[0]);
                    new KEStyle(link_Style, attrs).remove(editor.document);
                }
                editor.fire("save");
                editor.notifySelectionChange();
            },
            _link:function (attr, _selectedEl) {
                var self = this,
                    link,
                    p,
                    editor = self.editor;
                //注意同步，取的话要从 _ke_saved_href 取原始值的
                attr[_ke_saved_href] = attr.href;
                //是修改行为
                if (_selectedEl) {
                    editor.fire("save");
                    _selectedEl.attr(attr);
                    link = _selectedEl;
                } else {
                    var sel = editor.getSelection(),
                        range = sel && sel.getRanges()[0];
                    //编辑器没有焦点或没有选择区域时直接插入链接地址
                    if (!range || range.collapsed) {

                        var a = new Node("<a>" + attr.href + "</a>",
                            attr, editor.document);
                        editor.insertElement(a);
                        link = a;
                    } else {
                        editor.fire("save");
                        var linkStyle = new KEStyle(link_Style, attr);
                        linkStyle.apply(editor.document);
                        UA['gecko'] && (link = editor.getSelection().getStartElement());
                    }
                }
                editor.fire("save");
                editor.notifySelectionChange();
            },
            offClick:function () {
                var self = this;
                self.editor.showDialog("link/dialog", [self]);
            },
            destroy:function () {
                this.editor.destroyDialog("link/dialog");
            }
        });

        addRes.call(controls, context);

        KE.use("bubbleview", function () {
            KE.BubbleView.register({
                pluginName:"link",
                editor:editor,
                pluginContext:context,
                func:checkLink,
                init:function () {
                    var bubble = this,
                        el = bubble.get("contentEl");
                    el.html(tipHtml);
                    var tipurl = el.one(".ke-bubbleview-url"),
                        tipchange = el.one(".ke-bubbleview-change"),
                        tipremove = el.one(".ke-bubbleview-remove");
                    //ie focus not lose
                    KE.Utils.preventFocus(el);
                    tipchange.on("click", function (ev) {
                        var link = bubble._plugin;
                        link.call("offClick");
                        ev.halt();
                    });

                    tipremove.on("click", function (ev) {
                        var link = bubble._plugin;
                        link.call("_removeLink", bubble._selectedEl);
                        ev.halt();
                    });

                    addRes.call(bubble, tipchange, tipremove);

                    bubble.on("show", function () {
                        var a = bubble._selectedEl;
                        if (!a)return;
                        var href = a.attr(_ke_saved_href) ||
                            a.attr("href");
                        tipurl.html(href);
                        tipurl.attr("href", href);
                    });
                }
            });

            addRes.call(controls, function () {
                KE.BubbleView.destroy("link");
            });
        });

        this.destroy = function () {
            destroyRes.call(controls);
        };
    });
}, {
    attach:false
});/**
 * list formatting
 * @modifier yiminghe@gmail.com
 */
KISSY.Editor.add("list", function(editor) {
    editor.addPlugin("list", function() {
        var KE = KISSY.Editor;

        var context = editor.addButton("ul", {
            title:"项目列表",
            mode:KE.WYSIWYG_MODE,
            contentCls:"ke-toolbar-ul",
            loading:true,
            type:"ul"
        });
        var contextOl = editor.addButton("ol", {
            title:"编号列表",
            mode:KE.WYSIWYG_MODE,
            contentCls:"ke-toolbar-ol",
            loading:true,
            type:"ol"
        });
        KE.use("list/support", function() {
            context.reload(KE.ListSupport);
            contextOl.reload(KE.ListSupport);
        });

        this.destroy = function() {
            context.destroy();
            contextOl.destroy();
        };
    });

}, {
    attach:false
});
/*
 Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.html or http://ckeditor.com/license
 */
KISSY.Editor.add("list/support", function() {
    var KE = KISSY.Editor,
        listNodeNames = {"ol":1,"ul":1},
        listNodeNames_arr = ["ol","ul"],
        S = KISSY,
        KER = KE.RANGE,
        //KEP = KE.POSITION,
        ElementPath = KE.ElementPath,
        Walker = KE.Walker,
        KEN = KE.NODE,
        UA = S.UA,
        Node = S.Node,
        DOM = S.DOM;
    var list = {
        /*
         * Convert a DOM list tree into a data structure that is easier to
         * manipulate. This operation should be non-intrusive in the sense that it
         * does not change the DOM tree, with the exception that it may add some
         * markers to the list item nodes when database is specified.
         * 扁平化处理，深度遍历，利用 indent 和顺序来表示一棵树
         */
        listToArray : function(listNode, database, baseArray, baseIndentLevel, grandparentNode) {
            if (!listNodeNames[ listNode._4e_name() ])
                return [];

            if (!baseIndentLevel)
                baseIndentLevel = 0;
            if (!baseArray)
                baseArray = [];

            // Iterate over all list items to and look for inner lists.
            for (var i = 0, count = listNode[0].childNodes.length;
                 i < count; i++) {
                var listItem = new Node(listNode[0].childNodes[i]);

                // It may be a text node or some funny stuff.
                if (listItem._4e_name() != 'li')
                    continue;

                var itemObj = { 'parent' : listNode,
                    indent : baseIndentLevel,
                    element : listItem, contents : [] };
                if (!grandparentNode) {
                    itemObj.grandparent = listNode.parent();
                    if (itemObj.grandparent && itemObj.grandparent._4e_name() == 'li')
                        itemObj.grandparent = itemObj.grandparent.parent();
                }
                else
                    itemObj.grandparent = grandparentNode;

                if (database)
                    listItem._4e_setMarker(database,
                        'listarray_index',
                        baseArray.length);
                baseArray.push(itemObj);

                for (var j = 0, itemChildCount = listItem[0].childNodes.length, child;
                     j < itemChildCount; j++) {
                    child = new Node(listItem[0].childNodes[j]);
                    if (child[0].nodeType == KEN.NODE_ELEMENT &&
                        listNodeNames[ child._4e_name() ])
                    // Note the recursion here, it pushes inner list items with
                    // +1 indentation in the correct order.
                        list.listToArray(child, database, baseArray,
                            baseIndentLevel + 1, itemObj.grandparent);
                    else
                        itemObj.contents.push(child);
                }
            }
            return baseArray;
        },

        // Convert our internal representation of a list back to a DOM forest.
        //根据包含indent属性的元素数组来生成树
        arrayToList : function(listArray, database, baseIndex, paragraphMode) {
            if (!baseIndex)
                baseIndex = 0;
            if (!listArray || listArray.length < baseIndex + 1)
                return null;
            var doc = listArray[ baseIndex ].parent[0].ownerDocument,
                retval = doc.createDocumentFragment(),
                rootNode = null,
                currentIndex = baseIndex,
                indentLevel = Math.max(listArray[ baseIndex ].indent, 0),
                currentListItem = null;
            //,paragraphName = paragraphMode;

            while (true) {
                var item = listArray[ currentIndex ];
                if (item.indent == indentLevel) {
                    if (!rootNode
                        ||
                        //用于替换标签,ul->ol ,ol->ul
                        listArray[ currentIndex ].parent._4e_name() != rootNode._4e_name()) {

                        rootNode = listArray[ currentIndex ].parent._4e_clone(false, true);
                        retval.appendChild(rootNode[0]);
                    }
                    currentListItem = rootNode[0].appendChild(item.element._4e_clone(false, true)[0]);
                    for (var i = 0; i < item.contents.length; i++)
                        currentListItem.appendChild(item.contents[i]._4e_clone(true, true)[0]);
                    currentIndex++;
                } else if (item.indent == Math.max(indentLevel, 0) + 1) {
                    //进入一个li里面，里面的嵌套li递归构造父亲ul/ol
                    var listData = list.arrayToList(listArray, null,
                        currentIndex, paragraphMode);
                    currentListItem.appendChild(listData.listNode);
                    currentIndex = listData.nextIndex;
                } else if (item.indent == -1 && !baseIndex &&
                    item.grandparent) {

                    if (listNodeNames[ item.grandparent._4e_name() ]) {
                        currentListItem = item.element._4e_clone(false, true)[0];
                    } else {
                        // Create completely new blocks here, attributes are dropped.
                        //为什么要把属性去掉？？？#3857
                        if (item.grandparent._4e_name() != 'td') {
                            currentListItem = doc.createElement(paragraphMode);
                            item.element._4e_copyAttributes(new Node(currentListItem));
                        }
                        else
                            currentListItem = doc.createDocumentFragment();
                    }

                    for (i = 0; i < item.contents.length; i++) {
                        var ic = item.contents[i]._4e_clone(true, true);
                        //如果是list中，应该只退出ul，保留margin-left
                        if (currentListItem.nodeType == KEN.NODE_DOCUMENT_FRAGMENT) {
                            item.element._4e_copyAttributes(new Node(ic));
                        }
                        currentListItem.appendChild(ic[0]);
                    }

                    if (currentListItem.nodeType == KEN.NODE_DOCUMENT_FRAGMENT
                        && currentIndex != listArray.length - 1) {
                        if (currentListItem.lastChild
                            && currentListItem.lastChild.nodeType == KEN.NODE_ELEMENT
                            && currentListItem.lastChild.getAttribute('type') == '_moz')
                            DOM._4e_remove(currentListItem.lastChild);
                        DOM._4e_appendBogus(currentListItem);
                    }

                    if (currentListItem.nodeType == KEN.NODE_ELEMENT &&
                        DOM._4e_name(currentListItem) == paragraphMode &&
                        currentListItem.firstChild) {
                        DOM._4e_trim(currentListItem);
                        var firstChild = currentListItem.firstChild;
                        if (firstChild.nodeType == KEN.NODE_ELEMENT &&
                            DOM._4e_isBlockBoundary(firstChild)
                            ) {
                            var tmp = doc.createDocumentFragment();
                            DOM._4e_moveChildren(currentListItem, tmp);
                            currentListItem = tmp;
                        }
                    }

                    var currentListItemName = DOM._4e_name(currentListItem);
                    if (!UA['ie'] && ( currentListItemName == 'div' ||
                        currentListItemName == 'p' ))
                        DOM._4e_appendBogus(currentListItem);
                    retval.appendChild(currentListItem);
                    rootNode = null;
                    currentIndex++;
                }
                else
                    return null;

                if (listArray.length <= currentIndex ||
                    Math.max(listArray[ currentIndex ].indent, 0) < indentLevel)
                    break;
            }

            // Clear marker attributes for the new list tree made of cloned nodes, if any.
            if (database) {
                var currentNode = new Node(retval.firstChild);
                while (currentNode && currentNode[0]) {
                    if (currentNode[0].nodeType == KEN.NODE_ELEMENT) {
                        currentNode._4e_clearMarkers(database, true);
                    }
                    currentNode = currentNode._4e_nextSourceNode();
                }
            }

            return { listNode : retval, nextIndex : currentIndex };
        }
    };


    var headerTagRegex = /^h[1-6]$/;


    function ListCommand(type) {
        this.type = type;
    }

    ListCommand.prototype = {
        changeListType:function(editor, groupObj, database, listsCreated) {
            // This case is easy...
            // 1. Convert the whole list into a one-dimensional array.
            // 2. Change the list type by modifying the array.
            // 3. Recreate the whole list by converting the array to a list.
            // 4. Replace the original list with the recreated list.
            var listArray = list.listToArray(groupObj.root, database,
                undefined, undefined, undefined),
                selectedListItems = [];

            for (var i = 0; i < groupObj.contents.length; i++) {
                var itemNode = groupObj.contents[i];
                itemNode = itemNode._4e_ascendant('li', true);
                if ((!itemNode || !itemNode[0]) ||
                    itemNode.data('list_item_processed'))
                    continue;
                selectedListItems.push(itemNode);
                itemNode._4e_setMarker(database, 'list_item_processed', true);
            }

            var fakeParent = new Node(groupObj.root[0].ownerDocument.createElement(this.type));
            for (i = 0; i < selectedListItems.length; i++) {
                var listIndex = selectedListItems[i].data('listarray_index');
                listArray[listIndex].parent = fakeParent;
            }
            var newList = list.arrayToList(listArray, database, null, "p");
            var child, length = newList.listNode.childNodes.length;
            for (i = 0; i < length &&
                ( child = new Node(newList.listNode.childNodes[i]) ); i++) {
                if (child._4e_name() == this.type)
                    listsCreated.push(child);
            }
            DOM.insertBefore(DOM._4e_unwrap(newList.listNode), DOM._4e_unwrap(groupObj.root));
            groupObj.root._4e_remove();
        },
        createList:function(editor, groupObj, listsCreated) {
            var contents = groupObj.contents,
                doc = groupObj.root[0].ownerDocument,
                listContents = [];

            // It is possible to have the contents returned by DomRangeIterator to be the same as the root.
            // e.g. when we're running into table cells.
            // In such a case, enclose the childNodes of contents[0] into a <div>.
            if (contents.length == 1
                && contents[0][0] === groupObj.root[0]) {
                var divBlock = new Node(doc.createElement('div'));
                contents[0][0].nodeType != KEN.NODE_TEXT &&
                contents[0]._4e_moveChildren(divBlock);
                contents[0][0].appendChild(divBlock[0]);
                contents[0] = divBlock;
            }

            // Calculate the common parent node of all content blocks.
            var commonParent = groupObj.contents[0].parent();
            for (var i = 0; i < contents.length; i++)
                commonParent = commonParent._4e_commonAncestor(contents[i].parent());

            // We want to insert things that are in the same tree level only,
            // so calculate the contents again
            // by expanding the selected blocks to the same tree level.
            for (i = 0; i < contents.length; i++) {
                var contentNode = contents[i],
                    parentNode;
                while (( parentNode = contentNode.parent() )) {
                    if (parentNode[0] === commonParent[0]) {
                        listContents.push(contentNode);
                        break;
                    }
                    contentNode = parentNode;
                }
            }

            if (listContents.length < 1)
                return;

            // Insert the list to the DOM tree.
            var insertAnchor = new Node(
                listContents[ listContents.length - 1 ][0].nextSibling),
                listNode = new Node(doc.createElement(this.type));

            listsCreated.push(listNode);
            while (listContents.length) {
                var contentBlock = listContents.shift(),
                    listItem = new Node(doc.createElement('li'));

                // Preserve heading structure when converting to list item. (#5271)
                if (headerTagRegex.test(contentBlock._4e_name())) {
                    listItem[0].appendChild(contentBlock[0]);
                } else {
                    contentBlock._4e_copyAttributes(listItem);
                    contentBlock._4e_moveChildren(listItem);
                    contentBlock._4e_remove();
                }
                listNode[0].appendChild(listItem[0]);

                // Append a bogus BR to force the LI to render at full height
                if (!UA['ie'])
                    listItem._4e_appendBogus();
            }
            if (insertAnchor[0])
                listNode.insertBefore(insertAnchor);
            else
                commonParent.append(listNode);
        },
        removeList:function(editor, groupObj, database) {
            // This is very much like the change list type operation.
            // Except that we're changing the selected items' indent to -1 in the list array.
            var listArray = list.listToArray(groupObj.root, database,
                undefined, undefined, undefined),
                selectedListItems = [];

            for (var i = 0; i < groupObj.contents.length; i++) {
                var itemNode = groupObj.contents[i];
                itemNode = itemNode._4e_ascendant('li', true);
                if (!itemNode || itemNode.data('list_item_processed'))
                    continue;
                selectedListItems.push(itemNode);
                itemNode._4e_setMarker(database, 'list_item_processed', true);
            }

            var lastListIndex = null;
            for (i = 0; i < selectedListItems.length; i++) {
                var listIndex = selectedListItems[i].data('listarray_index');
                listArray[listIndex].indent = -1;
                lastListIndex = listIndex;
            }

            // After cutting parts of the list out with indent=-1, we still have to maintain the array list
            // model's nextItem.indent <= currentItem.indent + 1 invariant. Otherwise the array model of the
            // list cannot be converted back to a real DOM list.
            for (i = lastListIndex + 1; i < listArray.length; i++) {
                //if (listArray[i].indent > listArray[i - 1].indent + 1) {
                //modified by yiminghe
                if (listArray[i].indent > Math.max(listArray[i - 1].indent, 0)) {
                    var indentOffset = listArray[i - 1].indent + 1 -
                        listArray[i].indent;
                    var oldIndent = listArray[i].indent;
                    while (listArray[i]
                        && listArray[i].indent >= oldIndent) {
                        listArray[i].indent += indentOffset;
                        i++;
                    }
                    i--;
                }
            }

            var newList = list.arrayToList(listArray, database, null, "p");

            // Compensate <br> before/after the list node if the surrounds are non-blocks.(#3836)
            var docFragment = newList.listNode, boundaryNode, siblingNode;

            function compensateBrs(isStart) {
                if (( boundaryNode = new Node(docFragment[ isStart ? 'firstChild' : 'lastChild' ]) )
                    && !( boundaryNode[0].nodeType == KEN.NODE_ELEMENT &&
                    boundaryNode._4e_isBlockBoundary() )
                    && ( siblingNode = groupObj.root[ isStart ? '_4e_previous' : '_4e_next' ]
                    (Walker.whitespaces(true)) )
                    && !( boundaryNode[0].nodeType == KEN.NODE_ELEMENT &&
                    siblingNode._4e_isBlockBoundary({ br : 1 }) ))

                    DOM[ isStart ? 'insertBefore' : 'insertAfter' ](editor.document.createElement('br'),
                        DOM._4e_unwrap(boundaryNode));
            }

            compensateBrs(true);
            compensateBrs(undefined);

            DOM.insertBefore(DOM._4e_unwrap(docFragment),
                DOM._4e_unwrap(groupObj.root));
            groupObj.root._4e_remove();
        },

        exec : function(editor) {
            var //doc = editor.document,
                selection = editor.getSelection(),
                ranges = selection && selection.getRanges();

            // There should be at least one selected range.
            if (!ranges || ranges.length < 1)
                return;

            var bookmarks = selection.createBookmarks(true);

            // Group the blocks up because there are many cases where multiple lists have to be created,
            // or multiple lists have to be cancelled.
            var listGroups = [],
                database = {};
            while (ranges.length > 0) {
                var range = ranges.shift();

                var boundaryNodes = range.getBoundaryNodes(),
                    startNode = boundaryNodes.startNode,
                    endNode = boundaryNodes.endNode;

                if (startNode[0].nodeType == KEN.NODE_ELEMENT && startNode._4e_name() == 'td')
                    range.setStartAt(boundaryNodes.startNode, KER.POSITION_AFTER_START);

                if (endNode[0].nodeType == KEN.NODE_ELEMENT && endNode._4e_name() == 'td')
                    range.setEndAt(boundaryNodes.endNode, KER.POSITION_BEFORE_END);

                var iterator = range.createIterator(),
                    block;

                iterator.forceBrBreak = false;

                while (( block = iterator.getNextParagraph() )) {

                    // Avoid duplicate blocks get processed across ranges.
                    if (block.data('list_block'))
                        continue;
                    else
                        block._4e_setMarker(database, 'list_block', 1);


                    var path = new ElementPath(block),
                        pathElements = path.elements,
                        pathElementsCount = pathElements.length,
                        listNode = null,
                        processedFlag = false,
                        blockLimit = path.blockLimit,
                        element;

                    // First, try to group by a list ancestor.
                    //2010-11-17 :
                    //注意从上往下，从body开始找到最早的list祖先，从那里开始重建!!!
                    for (var i = pathElementsCount - 1; i >= 0 &&
                        ( element = pathElements[ i ] ); i--) {
                        if (listNodeNames[ element._4e_name() ]
                            && blockLimit.contains(element))     // Don't leak outside block limit (#3940).
                        {
                            // If we've encountered a list inside a block limit
                            // The last group object of the block limit element should
                            // no longer be valid. Since paragraphs after the list
                            // should belong to a different group of paragraphs before
                            // the list. (Bug #1309)
                            blockLimit.removeData('list_group_object');

                            var groupObj = element.data('list_group_object');
                            if (groupObj)
                                groupObj.contents.push(block);
                            else {
                                groupObj = { root : element, contents : [ block ] };
                                listGroups.push(groupObj);
                                element._4e_setMarker(database, 'list_group_object', groupObj);
                            }
                            processedFlag = true;
                            break;
                        }
                    }

                    if (processedFlag)
                        continue;

                    // No list ancestor? Group by block limit.
                    var root = blockLimit || path.block;
                    if (root.data('list_group_object'))
                        root.data('list_group_object').contents.push(block);
                    else {
                        groupObj = { root : root, contents : [ block ] };
                        root._4e_setMarker(database, 'list_group_object', groupObj);
                        listGroups.push(groupObj);
                    }
                }
            }

            // Now we have two kinds of list groups, groups rooted at a list, and groups rooted at a block limit element.
            // We either have to build lists or remove lists, for removing a list does not makes sense when we are looking
            // at the group that's not rooted at lists. So we have three cases to handle.
            var listsCreated = [];
            while (listGroups.length > 0) {
                groupObj = listGroups.shift();
                if (this.state == "off") {

                    if (listNodeNames[ groupObj.root._4e_name() ])
                        this.changeListType(editor, groupObj, database, listsCreated);
                    else {
                        //2010-11-17
                        //先将之前原来元素的 expando 去除，
                        //防止 ie li 复制原来标签属性带来的输出代码多余
                        KE.Utils.clearAllMarkers(database);
                        this.createList(editor, groupObj, listsCreated);
                    }
                }
                else if (this.state == "on"
                    &&
                    listNodeNames[ groupObj.root._4e_name() ])
                    this.removeList(editor, groupObj, database);
            }

            // For all new lists created, merge adjacent, same type lists.
            for (i = 0; i < listsCreated.length; i++) {
                listNode = listsCreated[i];
                //note by yiminghe,why not use merge sibling directly
                //listNode._4e_mergeSiblings();

                var listCommand = this;

                function mergeSibling(rtl) {

                    var sibling = listNode[ rtl ?
                        '_4e_previous' : '_4e_next' ](Walker.whitespaces(true));
                    if (sibling && sibling[0] &&
                        sibling._4e_name() == listCommand.type) {
                        sibling._4e_remove();
                        // Move children order by merge direction.(#3820)
                        sibling._4e_moveChildren(listNode, rtl ? true : false);
                    }
                }

                mergeSibling(undefined);
                mergeSibling(true);

            }

            // Clean up, restore selection and update toolbar button states.
            KE.Utils.clearAllMarkers(database);
            selection.selectBookmarks(bookmarks);
        }
    };


    var listSupport = {
        init:function() {
            var self = this,
                cfg = self.cfg;
            self.listCommand = new ListCommand(cfg.type);
        },
        selectionChange:function(ev) {
            var self = this,
                cfg = self.cfg,
                type = cfg.type,
                elementPath = ev.path,
                element,
                el = self.btn,
                blockLimit = elementPath.blockLimit,
                elements = elementPath.elements;
            if (!blockLimit)return;
            // Grouping should only happen under blockLimit.(#3940).
            if (elements) {
                for (var i = 0;
                     i < elements.length && ( element = elements[ i ] )
                         && element[0] !== blockLimit[0]; i++) {
                    var ind = S.indexOf(elements[i]._4e_name(),
                        listNodeNames_arr);
                    //ul,ol一个生效后，另一个就失效
                    if (ind !== -1) {
                        if (listNodeNames_arr[ind] === type) {
                            el.bon();
                            return;
                        } else {
                            break;
                        }

                    }
                }
            }
            el.boff();
        },
        offClick:function() {
            this.call("_change");
        },
        onClick:function() {
            this.call("_change");
        },
        _change:function() {
            var self = this,
                editor = self.editor,
                el = self.btn;
            editor.fire("save");
            self.listCommand.state = el.get("state");
            self.listCommand.exec(editor);
            editor.fire("save");
            editor.notifySelectionChange();
        }
    };
    KE.ListUtils = list;
    KE.ListSupport = listSupport
}, {
        attach:false
    });/**
 * localStorage support for ie<8
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("localstorage", function() {
    var S = KISSY,
        KE = S.Editor;

    if (!KE['storeReady']) {
        KE.storeReady = function(run) {
            KE.on("storeReady", run);
        };
        function rewrite() {
            KE.storeReady = function(run) {
                run();
            };
            KE.detach("storeReady");
        }

        KE.on("storeReady", rewrite);
    } else {
        S.log("localstorage attach more", "warn");
        return;
    }

    function complete() {
        KE.fire("storeReady");
    }

    //原生或者已经定义过立即返回
    //ie 使用 flash 模拟的 localStorage，序列化性能不行
    //firefox 使用原生
    if (!S.UA['ie'] && window.localStorage) {
        //原生的立即可用
        KE.localStorage = window.localStorage;
        complete();
        return;
    }

    //国产浏览器用随机数/时间戳试试 ! 是可以的
    var movie = KE.Utils.debugUrl("localstorage/swfstore.swf?t=" + (+new Date()));

    //龙藏
    //var movie = KE.Utils.debugUrl("localstorage/store.swf");

    var store = new KE.FlashBridge({
        movie:movie,
        //ajbridge:true,
        flashVars:{
            useCompression :true
        },
        methods:["setItem","removeItem","getItem","setMinDiskSpace","getValueOf"]
    });

    S.use("overlay", function() {

        store.swf.height = 138;
        //Dialog 不行
        var o = new (S.require("overlay"))({
            headerContent:"请点允许",
            width:"0px",
            //mask:true,
            elStyle:{
                overflow:'hidden'
            },
            content:"<h1 style='border:1px solid black;" +
                "border-bottom:none;" +
                "background:white;" +
                "text-align:center;'>请点击允许</h1>",
            zIndex:KE.baseZIndex(KE.zIndexManager.STORE_FLASH_SHOW)
        });
        o.render();
        o.get("contentEl").append(store.swf);
        // 必须在视窗范围内才可以初始化，触发 contentReady 事件
        o.center();
        o.show();

        store.on("pending", function() {
            o.set("width", 215);
            o.center();
            o.show();
            // 轮训，直到用户允许
            setTimeout(function() {
                store.retrySave();
            }, 1000);
        });

        store.on("save", function() {
            o.set("width", 0);
        });
    });

    var oldSet = store.setItem;

    S.mix(store, {
        _ke:1,
        getItem:function(k) {
            return this['getValueOf'](k);
        },
        retrySave:function() {
            this.setItem(this.lastSave.k, this.lastSave.v);
        },
        setItem:function(k, v) {
            this.lastSave = {k:k,v:v};
            oldSet.call(this, k, v);
        }
    });

    //非原生，等待flash通知
    store.on("contentReady", function() {
        KE.localStorage = store;
        complete();
    });

    /*
     "quotaExceededError"
     "error"
     "save"
     "inadequateDimensions"
     */

}, {
    //important
    //不能立即运行，ie6 可能会没有 domready 添加 flash 节点
    //导致：operation aborted
    attach:false,
    "requires":["flashutils","flashbridge"]
});/**
 * maximize editor
 * @author yiminghe@gmail.com
 * @note:firefox 焦点完全完蛋了，这里全是针对firefox
 */
KISSY.Editor.add("maximize", function (editor) {
    editor.addPlugin("maximize", function () {
        var S = KISSY,
            KE = S.Editor,
            UA = S.UA,
            MAXIMIZE_CLASS = "ke-toolbar-maximize";
        //firefox 3.5 不支持，有bug
        if (UA.gecko < 1.92)
            return;


        var context = editor.addButton("maximize", {
            title:"全屏",
            contentCls:MAXIMIZE_CLASS,
            loading:true
        });

        KE.use("maximize/support", function () {
            context.reload(KE.Maximize);
            editor.addCommand("maximizeWindow", {
                exec:function () {
                    context.call("offClick");
                }
            });
            editor.addCommand("restoreWindow", {
                exec:function () {
                    context.call("onClick");
                }
            });
        });
        this.destroy = function () {
            context.destroy();
        };
    });
}, {
    attach:false
});/**
 * maximize functionality
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("maximize/support", function () {

    var S = KISSY,
        KE = S.Editor,
        UA = S.UA,
        ie = UA['ie'],
        Node = S.Node,
        Event = S.Event,
        DOM = S.DOM,
        iframe,
        MAXIMIZE_CLASS = "ke-toolbar-maximize",
        RESTORE_CLASS = "ke-toolbar-restore",
        MAXIMIZE_TIP = "全屏",
        MAXIMIZE_TOOLBAR_CLASS = "ke-toolbar-padding",
        RESTORE_TIP = "取消全屏",
        Maximize = {},
        init = function () {
            if (!iframe) {
                iframe = new Node("<" + "iframe " +
                    " class='ke-maximize-shim'" +
                    " style='" +
                    "position:absolute;" +
                    "top:-9999px;" +
                    "left:-9999px;" +
                    "'" +
                    " frameborder='0'>").prependTo(document.body);
            }
        };

    DOM.addStyleSheet(".ke-toolbar-padding {" +
        "padding:5px;" +
        "}",
        "ke-maximize");

    S.mix(Maximize, {

        onClick:function () {
            var self = this,
                editor = self.editor;

            if (editor.fire("beforeRestoreWindow") === false) {
                return;
            }

            if (self._resize) {
                Event.remove(window, "resize", self._resize);
                self._resize = 0;
            } else {
                return;
            }

            //body overflow 变化也会引起 resize 变化！！！！先去除
            self.call("_saveEditorStatus");
            self.call("_restoreState");
            self.btn.boff();

            //firefox 必须timeout
            setTimeout(function () {
                self.call("_restoreEditorStatus");
                editor.notifySelectionChange();
                editor.fire("restoreWindow");
            }, 30);
        },

        /**
         * 从内存恢复最大化前的外围状态信息到编辑器实际动作，
         * 包括编辑器位置以及周围元素，浏览器窗口
         */
        _restoreState:function () {
            var self = this,
                doc = document,
                editor = self.editor,
                //恢复父节点的position原状态 bugfix:最大化被父元素限制
                _savedParents = self._savedParents;
            if (_savedParents) {
                for (var i = 0; i < _savedParents.length; i++) {
                    var po = _savedParents[i];
                    po.el.css("position", po.position);
                }
                self._savedParents = null;
            }
            //如果没有失去焦点，重新获得当前选取元素
            //self._saveEditorStatus();
            editor.wrap.css({
                height:self.iframeHeight
            });
            DOM.css(doc.body, {
                width:"",
                height:"",
                overflow:""
            });
            //documentElement 设置宽高，ie崩溃
            doc.documentElement.style.overflow = "";

            var editorWrapStyle = editor.editorWrap[0].style;
            editorWrapStyle.position = "static";
            editorWrapStyle.width = self.editorWrapWidth;

            /*
             iframe 中时假死！
             editor.editorWrap.css({
             position:"static",
             width:self.editorWrapWidth
             });*/

            iframe.css({
                left:"-99999px",
                top:"-99999px"
            });

            window.scrollTo(self.scrollLeft, self.scrollTop);
            var bel = self.btn.get("el");

            bel.one("span")
                .removeClass(RESTORE_CLASS)
                .addClass(MAXIMIZE_CLASS)
                .attr("title", MAXIMIZE_TIP);

            ie < 8 && self.editor.toolBarDiv.removeClass(MAXIMIZE_TOOLBAR_CLASS);
        },
        /**
         * 保存最大化前的外围状态信息到内存，
         * 包括编辑器位置以及周围元素，浏览器窗口
         */
        _saveSate:function () {
            var self = this,
                editor = self.editor,
                _savedParents = [],
                editorWrap = editor.editorWrap;
            self.iframeHeight = editor.wrap._4e_style("height");
            self.editorWrapWidth = editorWrap._4e_style("width");
            //主窗口滚动条也要保存哦
            self.scrollLeft = DOM.scrollLeft();
            self.scrollTop = DOM.scrollTop();
            window.scrollTo(0, 0);

            //将父节点的position都改成static并保存原状态 bugfix:最大化被父元素限制
            var p = editorWrap.parent();

            while (p) {
                var pre = p.css("position");
                if (pre != "static") {
                    _savedParents.push({
                        el:p,
                        position:pre
                    });
                    p.css("position", "static");
                }
                p = p.parent();
            }
            self._savedParents = _savedParents;
            var bel = self.btn.get("el");
            bel.one("span")
                .removeClass(MAXIMIZE_CLASS)
                .addClass(RESTORE_CLASS);
            bel.attr("title", RESTORE_TIP);
            //ie6,7 图标到了窗口边界，不可点击，给个padding
            ie < 8 && self.editor.toolBarDiv.addClass(MAXIMIZE_TOOLBAR_CLASS);
        },

        /**
         *  编辑器自身核心状态保存，每次最大化最小化都要save,restore，
         *  firefox修正，iframe layout变化时，range丢了
         */
        _saveEditorStatus:function () {
            var self = this,
                editor = self.editor;
            self.savedRanges = null;
            if (!UA['gecko'] || !editor.iframeFocus) return;
            var sel = editor.getSelection();
            //firefox 光标丢失bug,位置丢失，所以这里保存下
            self.savedRanges = sel && sel.getRanges();
        },

        /**
         * 编辑器自身核心状态恢复，每次最大化最小化都要save,restore，
         * 维持编辑器核心状态不变
         */
        _restoreEditorStatus:function () {
            var self = this,
                editor = self.editor,
                sel = editor.getSelection(),
                savedRanges = self.savedRanges;

            //firefox焦点bug

            //原来是聚焦，现在刷新designmode
            //firefox 先失去焦点才行
            if (UA['gecko']) {
                editor.activateGecko();
            }

            if (savedRanges && sel) {
                sel.selectRanges(savedRanges);
            }

            //firefox 有焦点时才重新聚焦
            if (editor.iframeFocus && sel) {
                var element = sel.getStartElement();
                //使用原生不行的，会使主窗口滚动
                //element[0] && element[0].scrollIntoView(true);
                element && element[0] && element._4e_scrollIntoView();
            }
        },

        /**
         * 将编辑器最大化-实际动作
         * 必须做两次，何解？？
         */
        _maximize:function (stop) {
            var self = this,
                doc = document,
                editor = self.editor,
                editorWrap = editor.editorWrap,
                viewportHeight = DOM.viewportHeight(),
                viewportWidth = DOM.viewportWidth(),
                statusHeight = editor.statusDiv ?
                    editor.statusDiv[0].offsetHeight : 0,
                toolHeight = editor.toolBarDiv[0].offsetHeight;

            if (!ie) {
                DOM.css(doc.body, {
                    width:0,
                    height:0,
                    overflow:"hidden"
                });
            } else {
                doc.body.style.overflow = "hidden";
            }
            doc.documentElement.style.overflow = "hidden";

            editorWrap.css({
                position:"absolute",
                zIndex:KE.baseZIndex(KE.zIndexManager.MAXIMIZE),
                width:viewportWidth + "px"
            });
            iframe.css({
                zIndex:KE.baseZIndex(KE.zIndexManager.MAXIMIZE - 5),
                height:viewportHeight + "px",
                width:viewportWidth + "px"
            });
            editorWrap.offset({
                left:0,
                top:0
            });
            iframe.css({
                left:0,
                top:0
            });

            editor.wrap.css({
                height:(viewportHeight - statusHeight - toolHeight ) + "px"
            });
            if (stop !== true) {
                arguments.callee.call(self, true);
            }
        },
        _real:function () {
            var self = this,
                editor = self.editor;
            if (self._resize) {
                return;
            }

            self.call("_saveEditorStatus");
            self.call("_saveSate");
            self.call("_maximize");
            if (!self._resize) {
                var cfgMaximize = self.cfg._maximize;
                self['_resize'] = KE.Utils.buffer(function () {
                    cfgMaximize.call(self);
                    editor.fire("maximizeWindow");
                }, self, 100);
            }

            Event.on(window, "resize", self._resize);

            self.btn.bon();
            setTimeout(function () {
                self.call("_restoreEditorStatus");
                editor.notifySelectionChange();
                editor.fire("maximizeWindow");
            }, 30);
        },
        offClick:function () {
            var self = this,
                editor = self.editor;
            if (editor.fire("beforeMaximizeWindow") === false) {
                return;
            }
            init();
            self.call("_real");
        },
        destroy:function () {
            var self = this;
            if (self._resize) {
                Event.remove(window, "resize", self._resize);
                self._resize = 0;
            }
        }
    });

    KE.Maximize = Maximize;
}, {
    attach:false
});/**
 * insert music for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("music", function(editor) {
    editor.addPlugin("music", function() {
        var S = KISSY,
            KE = S.Editor,
            MUSIC_PLAYER = "niftyplayer.swf",
            dataProcessor = editor.htmlDataProcessor,
            dataFilter = dataProcessor && dataProcessor.dataFilter;


        function music(src) {
            src=src||"";
            return src.indexOf(MUSIC_PLAYER) != -1;
        }

        var CLS_MUSIC = "ke_music",
            TYPE_MUSIC = 'music';


        dataFilter && dataFilter.addRules({
            elements : {
                'object' : function(element) {
                    var attributes = element.attributes,i,
                        classId = attributes['classid'] &&
                            String(attributes['classid']).toLowerCase();
                    if (!classId) {
                        // Look for the inner <embed>
                        for (i = 0; i < element.children.length; i++) {
                            if (element.children[ i ].name== 'embed') {
                                if (!KE.Utils.isFlashEmbed(element.children[ i ]))
                                    return null;
                                if (music(element.children[ i ].attributes.src)) {
                                    return dataProcessor.createFakeParserElement(element,
                                        CLS_MUSIC, TYPE_MUSIC, true);
                                }
                            }
                        }
                        return null;
                    }
                    for (i = 0; i < element.children.length; i++) {
                        var c = element.children[ i ];
                        if (c.name == 'param'
                            && c.attributes.name.toLowerCase() == "movie") {
                            if (music(c.attributes.value)) {
                                return dataProcessor.createFakeParserElement(element,
                                    CLS_MUSIC, TYPE_MUSIC, true);
                            }
                        }
                    }

                },
                'embed' : function(element) {
                    if (!KE.Utils.isFlashEmbed(element))
                        return null;
                    if (music(element.attributes.src)) {
                        return dataProcessor.createFakeParserElement(element,
                            CLS_MUSIC, TYPE_MUSIC, true);
                    }
                }
                //4 比 flash 的优先级 5 高！
            }}, 4);


        var context = editor.addButton("music", {
            contentCls:"ke-toolbar-music",
            title:"插入音乐" ,
            mode:KE.WYSIWYG_MODE,
            loading:true
        });
        KE.use("music/support", function() {
            var musicInserter = new KE.MusicInserter(editor);
            context.reload({
                offClick:function() {
                    musicInserter.show();
                },
                destroy:function(){
                    musicInserter.destroy();
                }
            });
        });

        this.destroy = function() {
            context.destroy();
        };
    });
}, {
    attach:false,
    "requires":["fakeobjects"]
});/**
 * music button
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("music/support", function() {
    var S = KISSY,
        KE = S.Editor,
        Event = S.Event,
        Flash = KE.Flash,
        UA = S.UA;
    var CLS_MUSIC = "ke_music",
        TYPE_MUSIC = 'music';
    var flashRules = ["img." + CLS_MUSIC];

    function MusicInserter(editor) {
        MusicInserter['superclass'].constructor.apply(this, arguments);
        //只能ie能用？，目前只有firefox,ie支持图片缩放
        var disableObjectResizing = editor.cfg['disableObjectResizing'];
        if (!disableObjectResizing) {
            Event.on(editor.document.body,
                UA['ie'] ? 'resizestart' : 'resize',
                    function(evt) {
                        var t = new S.Node(evt.target);
                        if (t.hasClass(CLS_MUSIC))
                            evt.preventDefault();
                    });
        }
    }

    function checkMusic(node) {
        return  node._4e_name() === 'img' &&
            (!!node.hasClass(CLS_MUSIC)) && node;
    }

    function getMusicUrl(url) {
        return url.replace(/^.+niftyplayer\.swf\?file=/, "");
    }

    S.extend(MusicInserter, Flash, {
        _config:function() {
            var self = this;
            self._cls = CLS_MUSIC;
            self._type = TYPE_MUSIC;
            self._contextMenu = contextMenu;
            self._flashRules = flashRules;
        },
        _getFlashUrl:function() {
            return getMusicUrl(MusicInserter['superclass']._getFlashUrl.apply(this, arguments));
        }
    });


    Flash.registerBubble("music", "在新窗口查看", checkMusic);
    KE.MusicInserter = MusicInserter;
    var contextMenu = {
        "音乐属性":function(cmd) {
            var editor = cmd.editor,
                selection = editor.getSelection(),
                startElement = selection && selection.getStartElement(),
                flash = startElement && checkMusic(startElement);
            if (flash) {
                cmd.show(null, flash);
            }
        }
    };
}, {
    attach:false,
    "requires":["flash/support"]
});/**
 * save and restore focus when overlay shows or hides
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("overlay/focus", function() {
    var S = KISSY,
        UA = S.UA,
        KE = S.Editor,
        focusManager = KE.focusManager;
    KE.namespace("UIBase");
    if (KE['UIBase'].Focus) {
        S.log("ke uibase focus attach more", "warn");
        return;
    }

    function FocusExt() {
        //S.log("FocusExt init");
    }

    FocusExt.ATTRS = {
        focus4e:{
            value:true
        }
    };

    FocusExt.prototype = {
        _uiSetFocus4e:function(v) {
            var self = this;
            if (v) {
                self.on("show", self._show4FocusExt, self);
                self.on("hide", self._hide4FocusExt, self);
            } else {
                self.detach("show", self._show4FocusExt, self);
                self.detach("hide", self._hide4FocusExt, self);
            }
        },
        __syncUI:function() {
            //S.log("_syncUIFocusExt");
        },
        __renderUI:function() {
            //S.log("_renderUIFocusExt");
        },
        __bindUI:function() {
            var self = this;
            self._focus4e = new S.Node("<a " +
                "href='#' " +
                "class='ke-focus' " +
                "style='" +
                "width:0;" +
                "height:0;" +
                "margin:0;" +
                "padding:0;" +
                "overflow:hidden;" +
                "outline:none;" +
                "font-size:0;'" +
                "></a>").appendTo(self.get("el"));
        },
        _show4FocusExt:function() {
            var self = this;
            //保存当前焦点editor
            self._focusEditor = focusManager.currentInstance();
            var editor = self._focusEditor;
            /*
             * IE BUG: If the initial focus went into a non-text element (e.g. button,image),
             * then IE would still leave the caret inside the editing area.
             */
            //ie9 图片resize框，仍然会突出
            if (UA['ie'] && editor) {

                //聚焦到当前窗口
                //使得编辑器失去焦点，促使ie保存当前选择区域（位置）
                //chrome 需要下面两句
                window['focus']();
                document.body.focus();

                //firefox 需要下面一句
                self._focus4e[0].focus();

                var $selection = editor.document.selection,
                    $range = $selection.createRange();
                if ($range) {
                    if (
                    //修改ckeditor，如果单纯选择文字就不用管了
                    //$range.parentElement &&
                    //$range.parentElement().ownerDocument == editor.document
                    //||
                    //缩放图片那个框在ie下会突出浮动层来
                        $range.item
                            && $range.item(0).ownerDocument == editor.document) {
                        var $myRange = document.body.createTextRange();
                        $myRange.moveToElementText(self.get("el")._4e_first()[0]);
                        $myRange.collapse(true);
                        $myRange.select();
                    }
                }
            }


        },
        _hide4FocusExt:function() {
            var editor = this._focusEditor;
            editor && editor.focus();
        }
    };
    KE['UIBase'].Focus = FocusExt;

}, {
    attach:false
});/**
 * custom overlay  for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("overlay", function () {

    var S = KISSY,
        UIBase = S.require("uibase"),
        KE = S.Editor;


    if (KE.Overlay) {
        S.log("ke overlay attach more");
        return;
    }

    S.use("overlay");
    /**
     * 2010-11-18 重构，使用 S.Ext 以及 Base 组件周期
     */
    var Overlay4E = UIBase.create((S.require("overlay")), [KE['UIBase'].Focus], {

        syncUI:function () {
            //S.log("_syncUIOverlay4E");
            var self = this;
            //编辑器 overlay 中的全部点击都不会使得失去焦点
            KE.Utils.preventFocus(self.get("contentEl"));
        }
    }, {
        ATTRS:{
            //指定zIndex默认值
            "zIndex":{value:KE.baseZIndex(KE.zIndexManager.OVERLAY)}
        }
    });

    var Dialog4E = UIBase.create(S.require("overlay").Dialog, [KE['UIBase'].Focus], {
        show:function () {
            //在 show 之前调用
            this.center();
            var y = this.get("y");
            //居中有点偏下
            if (y - S.DOM.scrollTop() > 200) {
                y = S.DOM.scrollTop() + 200;
                this.set("y", y);
            }
            Dialog4E['superclass'].show.call(this);
        }
    }, {
        ATTRS:{
            constrain:{value:true},
            //指定zIndex默认值
            "zIndex":{value:KE.baseZIndex(KE.zIndexManager.OVERLAY)}
        }
    });

    KE.Overlay = Overlay4E;
    KE.Dialog = Dialog4E;


    var globalMask;

    KE.Overlay.loading = function () {
        if (!globalMask) {
            globalMask = new KE.Overlay({
                x:0,
                focus4e:false,
                width:S.UA['ie'] == 6 ? S.DOM.docWidth() : "100%",
                y:0,
                //指定全局 loading zIndex 值
                "zIndex":KE.baseZIndex(KE.zIndexManager.LOADING),
                elCls:"ke-global-loading"
            });
        }
        globalMask.set("height", S.DOM.docHeight());
        globalMask.show();
        globalMask.loading();
    };

    KE.Overlay.unloading = function () {
        globalMask && globalMask.hide();
    };
}, {
    requires:['overlay/focus']
});/**
 * pagebreak functionality
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("pagebreak", function(editor) {
    editor.addPlugin("pagebreak", function() {
        var S = KISSY,
            KE = S.Editor,
            Node = S.Node,
            dataProcessor = editor.htmlDataProcessor,
            dataFilter = dataProcessor && dataProcessor.dataFilter,
            CLS = "ke_pagebreak",
            TYPE = "div";
        if (dataFilter) {
            dataFilter.addRules({
                elements :
                {
                    div : function(element) {
                        var attributes = element.attributes,
                            style = attributes && attributes.style,
                            child = style && element.children.length == 1
                                && element.children[ 0 ],
                            childStyle = child && ( child.name == 'span' )
                                && child.attributes.style;

                        if (childStyle
                            && ( /page-break-after\s*:\s*always/i ).test(style)
                            && ( /display\s*:\s*none/i ).test(childStyle))
                            return dataProcessor.createFakeParserElement(element,
                                CLS,
                                TYPE);
                    }
                }
            });
        }

        var mark_up = '<div' +
            ' style="page-break-after: always; ">' +
            '<span style="DISPLAY:none">&nbsp;</span></div>';
        var context = editor.addButton("page-break", {
            title:"分页",
            mode:KE.WYSIWYG_MODE,
            contentCls:"ke-toolbar-pagebreak",
            offClick:function() {
                var editor = this.editor,
                    real = new Node(mark_up, null, editor.document),
                    substitute = editor.createFakeElement ?
                        editor.createFakeElement(real,
                            CLS,
                            TYPE,
                            //不可缩放，也不用
                            false,
                            mark_up) :
                        real;
                var sel = editor.getSelection(),
                    range = sel && sel.getRanges()[0];
                if (!range) return;
                editor.fire("save");
                var start = range.startContainer,pre = start;
                while (start._4e_name() !== "body") {
                    pre = start;
                    start = start.parent();
                }
                range.collapse(true);
                range.splitElement(pre);
                substitute.insertAfter(pre);
                editor.fire("save");
            }
        });


        this.destroy = function() {
            context.destroy();
        };
    });
}, {
    attach:false,
    "requires":["fakeobjects"]
});/**
 * preview for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("preview", function(editor) {

    editor.addPlugin("preview", function() {
        var context = editor.addButton("preview", {
            title:"预览",
            contentCls:"ke-toolbar-preview",
            offClick:function() {
                var self = this,
                    editor = self.editor,
                    iWidth = 640,    // 800 * 0.8,
                    iHeight = 420,    // 600 * 0.7,
                    iLeft = 80;	// (800 - 0.8 * 800) /2 = 800 * 0.1.
                try {
                    var screen = window.screen;
                    iWidth = Math.round(screen.width * 0.8);
                    iHeight = Math.round(screen.height * 0.7);
                    iLeft = Math.round(screen.width * 0.1);
                } catch (e) {
                }
                var sHTML = editor._prepareIFrameHtml()
                    .replace(/<body[^>]+>.+<\/body>/,
                    "<body>\n"
                        + editor.getData(true)
                        + "\n</body>")
                    .replace(/\${title}/, "预览"),
                    sOpenUrl = '',
                    oWindow = window.open(sOpenUrl,
                        //每次都弹出新窗口
                        '',
                        'toolbar=yes,' +
                            'location=no,' +
                            'status=yes,' +
                            'menubar=yes,' +
                            'scrollbars=yes,' +
                            'resizable=yes,' +
                            'width=' +
                            iWidth +
                            ',height='
                            + iHeight
                            + ',left='
                            + iLeft),winDoc = oWindow.document;
                winDoc.open();
                winDoc.write(sHTML);
                winDoc.close();
                //ie 重新显示
                oWindow.focus();
            }
        });


        this.destroy = function() {
            context.destroy();
        };
    });
}, {
    attach:false
});
/**
 * progressbar ui
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("progressbar", function() {
    var S = KISSY,
        KE = S.Editor;
    if (KE.ProgressBar) return;


    var DOM = S.DOM,Node = S.Node;
    DOM.addStyleSheet("" +
        "" +
        ".ke-progressbar {" +
        "border:1px solid #D6DEE6;" +
        "position:relative;" +
        "margin-left:auto;margin-right:auto;" +
        "background-color: #EAEFF4;" +
        "background: -webkit-gradient(linear, left top, left bottom, from(#EAEFF4), " +
        ".to(#EBF0F3));" +
        " background: -moz-linear-gradient(top, #EAEFF4, #EBF0F3);" +
        "filter: progid:DXImageTransform.Microsoft.gradient(startColorstr = '#EAEFF4'," +
        " endColorstr = '#EBF0F3');" +
        "}" +
        "" +
        ".ke-progressbar-inner {" +
        "border:1px solid #3571B4;" +
        "background-color:#6FA5DB;" +
        "padding:1px;" +
        "}" +

        ".ke-progressbar-inner-bg {" +
        "height:100%;" +
        "background-color: #73B1E9;" +
        "background: -webkit-gradient(linear, left top, left bottom, from(#73B1E9), " +
        ".to(#3F81C8));" +
        " background: -moz-linear-gradient(top, #73B1E9, #3F81C8);" +
        "filter: progid:DXImageTransform.Microsoft.gradient(startColorstr = '#73B1E9', " +
        "endColorstr = '#3F81C8');" +
        "}" +
        "" +
        "" +
        ".ke-progressbar-title {" +
        "width:30px;" +
        "top:0;" +
        "left:40%;" +
        "line-height:1.2;" +
        "position:absolute;" +
        "}" +
        "", "ke_progressbar");
    function ProgressBar() {
        ProgressBar['superclass'].constructor.apply(this, arguments);
        this._init();
    }

    ProgressBar.ATTRS = {
        container:{},
        width:{},
        height:{},
        //0-100
        progress:{value:0}
    };
    S.extend(ProgressBar, S.Base, {
        destroy:function() {
            var self = this;
            self.detach();
            self.el.remove();
        },
        _init:function() {
            var self = this,
                h = self.get("height"),
                el = new Node("<div" +
                    " class='ke-progressbar' " +
                    " style='width:" +
                    self.get("width") +
                    ";" +
                    "height:" +
                    h +
                    ";'" +
                    "></div>"),
                container = self.get("container"),
                p = new Node(
                    "<div style='overflow:hidden;'>" +
                        "<div class='ke-progressbar-inner' style='height:" + (parseInt(h) - 4) + "px'>" +
                        "<div class='ke-progressbar-inner-bg'></div>" +
                        "</div>" +
                        "</div>"
                    ).appendTo(el),
                title = new Node("<span class='ke-progressbar-title'></span>").appendTo(el);
            if (container)
                el.appendTo(container);
            self.el = el;
            self._title = title;
            self._p = p;
            self.on("afterProgressChange", self._progressChange, self);
            self._progressChange({newVal:self.get("progress")});
        },

        _progressChange:function(ev) {
            var self = this,
                v = ev.newVal;
            self._p.css("width", v + "%");
            self._title.html(v + "%");
        }
    });
    KE.ProgressBar = ProgressBar;
},{
    attach:false
});/**
 * remove inline-style format for kissy editor,modified from ckeditor
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("removeformat", function (editor) {

    editor.addPlugin("removeformat", function () {
        var S = KISSY,
            KE = S.Editor,
            KER = KE.RANGE,
            ElementPath = KE.ElementPath,
            KEN = KE.NODE,
            /**
             * A comma separated list of elements to be removed
             * when executing the "remove format" command.
             * Note that only inline elements are allowed.
             * @type String
             * @default 'b,big,code,del,dfn,em,font,i,ins,kbd,q,samp,small,span,strike,strong,sub,sup,tt,u,var'
             * @example
             */
                removeFormatTags = 'b,big,code,del,dfn,em,font,i,ins,kbd,' +
                'q,samp,small,span,strike,strong,sub,sup,tt,u,var,s',
            /**
             * A comma separated list of elements attributes to be removed
             * when executing the "remove format" command.
             * @type String
             * @default 'class,style,lang,width,height,align,hspace,valign'
             * @example
             */
                removeFormatAttributes = ('class,style,lang,width,height,' +
                'align,hspace,valign').split(/,/),
            tagsRegex = new RegExp('^(?:' +
                removeFormatTags.replace(/,/g, '|') +
                ')$', 'i');


        function removeAttrs(el, attrs) {
            for (var i = 0; i < attrs.length; i++) {
                el.removeAttr(attrs[i]);
            }
        }


        var context = editor.addButton("removeformat", {
            title:"清除格式",
            mode:KE.WYSIWYG_MODE,
            contentCls:"ke-toolbar-removeformat",
            offClick:function () {
                var self = this,
                    editor = self.editor;
                editor.focus();
                tagsRegex['lastIndex'] = 0;
                var ranges = editor.getSelection().getRanges();
                editor.fire("save");
                for (var i = 0, range;
                     range = ranges[ i ];
                     i++) {
                    if (range.collapsed)
                        continue;

                    range.enlarge(KER.ENLARGE_ELEMENT);

                    // Bookmark the range so we can re-select it after processing.
                    var bookmark = range.createBookmark(),
                    // The style will be applied within the bookmark boundaries.
                        startNode = bookmark.startNode,
                        endNode = bookmark.endNode;

                    // We need to check the selection boundaries (bookmark spans) to break
                    // the code in a way that we can properly remove partially selected nodes.
                    // For example, removing a <b> style from
                    //		<b>This is [some text</b> to show <b>the] problem</b>
                    // ... where [ and ] represent the selection, must result:
                    //		<b>This is </b>[some text to show the]<b> problem</b>
                    // The strategy is simple, we just break the partial nodes before the
                    // removal logic, having something that could be represented this way:
                    //		<b>This is </b>[<b>some text</b> to show <b>the</b>]<b> problem</b>

                    var breakParent = function (node) {
                        // Let's start checking the start boundary.
                        var path = new ElementPath(node),
                            pathElements = path.elements;

                        for (var i = 1, pathElement;
                             pathElement = pathElements[ i ];
                             i++) {
                            if (pathElement._4e_equals(path.block)
                                || pathElement._4e_equals(path.blockLimit))
                                break;

                            // If this element can be removed (even partially).
                            if (tagsRegex.test(pathElement._4e_name()))
                                node._4e_breakParent(pathElement);
                        }
                    };

                    breakParent(startNode);
                    breakParent(endNode);

                    // Navigate through all nodes between the bookmarks.
                    var currentNode = startNode._4e_nextSourceNode(true, KEN.NODE_ELEMENT);

                    while (currentNode) {
                        // If we have reached the end of the selection, stop looping.
                        if (currentNode._4e_equals(endNode))
                            break;

                        // Cache the next node to be processed. Do it now, because
                        // currentNode may be removed.
                        var nextNode = currentNode._4e_nextSourceNode(false,
                            KEN.NODE_ELEMENT);

                        // This node must not be a fake element.
                        if (!( currentNode._4e_name() == 'img'
                            && (
                            currentNode.attr('_ke_realelement') ||
                                // 占位符
                                /\bke_/.test(currentNode[0].className)
                            ) )
                            ) {
                            // Remove elements nodes that match with this style rules.
                            if (tagsRegex.test(currentNode._4e_name()))
                                currentNode._4e_remove(true);
                            else {
                                removeAttrs(currentNode, removeFormatAttributes);
                            }
                        }
                        currentNode = nextNode;
                    }
                    range.moveToBookmark(bookmark);
                }
                editor.getSelection().selectRanges(ranges);
                editor.fire("save");
            }
        });

        this.destroy = function () {
            context.destroy();
        };
    });


}, {
    attach:false
});/**
 * resize functionality
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("resize", function (editor) {
    var S = KISSY,
        Node = S.Node;


    S.use("dd", function (S, DD) {
        var Draggable = S['Draggable'] || DD['Draggable'],
            statusDiv = editor.statusDiv,
            textarea = editor.textarea,
            resizer = new Node("<div class='ke-resizer'>"),
            cfg = editor.cfg["pluginConfig"]["resize"] || {};
        cfg = cfg["direction"] || ["x", "y"];
        resizer.appendTo(statusDiv);
        //最大化时就不能缩放了
        editor.on("maximizeWindow", function () {
            resizer.css("display", "none");
        });
        editor.on("restoreWindow", function () {
            resizer.css("display", "");
        });
        resizer._4e_unselectable();
        var d = new Draggable({
            node:resizer,
            cursor:'se-resize'
        }),
            height = 0,
            width = 0,
            t_height = 0,
            t_width = 0,
            heightEl = editor.wrap,
            widthEl = editor.editorWrap;
        d.on("dragstart", function () {
            height = heightEl.height();
            width = widthEl.width();
            // may get wrong height : 100% => viewport height
            t_height = textarea.height();
            t_width = textarea.width();
            editor.fire("resizeStart");
        });
        d.on("drag", function (ev) {
            var self = this,
                diffX = ev.left - self['startNodePos'].left,
                diffY = ev.top - self['startNodePos'].top;
            if (S.inArray("y", cfg)) {
                heightEl.height(height + diffY);
                textarea.height(t_height + diffY);
            }
            if (S.inArray("x", cfg)) {
                widthEl.width(width + diffX);
                textarea.width(t_width + diffX);
            }
            editor.fire("resize");
        });

        editor.on("destroy", function () {
            d.destroy();
            resizer.remove();
        });
    });
}, {
    attach:false
});/**
 * separator for button
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("separator", function(editor) {
    editor.addPlugin("separator", function() {
        var s = new KISSY.Node('<span ' +
            'class="ke-toolbar-separator">&nbsp;' +
            '</span>')
            .appendTo(editor.toolBarDiv);
        editor.on("destroy", function() {
            s.remove();
        });
    }, {
        duplicate:true
    });
}, {
    attach:false
});/**
 * smiley icon from wangwang for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("smiley", function(editor) {
    editor.addPlugin("smiley", function() {
        var KE = KISSY.Editor;
        var context = editor.addButton("smiley", {
            contentCls:"ke-toolbar-smiley",
            title:"插入表情",
            mode:KE.WYSIWYG_MODE,
            loading:true
        });
        KE.use("smiley/support", function() {
            context.reload(KE.SmileySupport);
        });
        this.destroy=function(){
          context.destroy();
        };
    });
},{
    attach:false
});
/**
 * emotion icon from wangwang
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("smiley/support", function() {
    var S = KISSY,
        Event = S.Event,
        KE = S.Editor,
        DOM = S.DOM;

    DOM.addStyleSheet('.ke-smiley-sprite {'
        + ' background: url("http://a.tbcdn.cn/sys/wangwang/smiley/sprite.png") no-repeat scroll -1px 0 transparent;'
        + ' height: 235px;'
        + ' width: 288px;'
        + ' margin: 5px;'
        + 'zoom: 1;'
        + ' overflow: hidden;'
        + '}'
        + '.ke-smiley-sprite a {'
        + '   width: 24px;'
        + 'height: 24px;'
        + ' border: 1px solid white;'
        + ' float: left;'
        + '}'
        + '.ke-smiley-sprite a:hover {'
        + ' border: 1px solid #808080;'
        + '}'
        , "smiley");

    var smiley_markup;

    function initMarkup() {
        if (smiley_markup) return smiley_markup;
        smiley_markup = "<div class='ke-smiley-sprite'>";
        for (var i = 0; i <= 98; i++) {
            smiley_markup += "<a href='#' " +
                "data-icon='http://a.tbcdn.cn/sys/wangwang/smiley/48x48/" + i + ".gif'>" +
                "</a>"
        }
        smiley_markup += "</div>";
        return smiley_markup;
    }

    var addRes = KE.Utils.addRes,
        destroyRes = KE.Utils.destroyRes;

    KE.SmileySupport = {
        _selectSmiley:function(ev) {
            ev.halt();
            var self = this,editor = self.editor;
            var t = new S.Node(ev.target),
                icon;
            if (t._4e_name() == "a"
                && (icon = t.attr("data-icon"))) {
                var img = new S.Node("<img " +
                    "alt='' src='" +
                    icon + "'/>", null,
                    editor.document);
                editor.insertElement(img);
                this.smileyWin.hide();
            }
        },
        _hidePanel:function(ev) {
            var self = this,
                el = self.btn.get("el"),
                t = new S.Node(ev.target),
                smileyWin = self.smileyWin;
            //当前按钮点击无效
            if (el._4e_equals(t) || el.contains(t)) {
                return;
            }
            smileyWin.hide();
        },
        _prepare:function() {
            var self = this,
                cfg = self.cfg,
                el = self.btn,
                editor = self.editor;
            var smiley_markup = initMarkup();
            self.smileyWin = new KE.Overlay({
                content:smiley_markup,
                focus4e:false,
                width:"297px",
                autoRender:true,
                elCls:"ks-popup",
                zIndex:KE.baseZIndex(KE.zIndexManager.POPUP_MENU),
                mask:false
            });
            var smileyWin = self.smileyWin;
            self.smileyPanel = smileyWin.get("contentEl");
            smileyWin.on("show", el.bon, el);
            smileyWin.on("hide", el.boff, el);
            self.smileyPanel.on("click", cfg._selectSmiley, self);
            Event.on(document, "click", cfg._hidePanel, self);
            Event.on(editor.document, "click", cfg._hidePanel, self);
            self.cfg._prepare = self.cfg._real;
            addRes.call(self, self.smileyWin, self.smileyPanel, function() {
                Event.remove(document, "click", cfg._hidePanel, self);
                Event.remove(editor.document, "click", cfg._hidePanel, self);
            });
            self.call("_real");
        },
        _real:function() {
            var self = this,
                el = self.btn.get("el"),
                xy = el.offset();
            xy.top += el.height() + 5;
            if (xy.left + self.smileyPanel.width() > DOM.viewportWidth() - 60) {
                xy.left = DOM.viewportWidth() - self.smileyPanel.width() - 60;
            }
            self.smileyWin.set("xy", [xy.left,xy.top]);
            self.smileyWin.show();
        },
        offClick:function() {
            var self = this;
            KE.use("overlay", function() {
                self.call("_prepare");
            });
        },
        onClick:function() {
            this.smileyWin && this.smileyWin.hide();
        },
        destroy:function() {
            var self = this;
            destroyRes.call(self);
        }
    };
}, {
    attach:false
});/**
 * source editor for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("sourcearea", function(editor) {
    editor.addPlugin("sourcearea", function() {
        var S = KISSY,
            KE = S.Editor,
            UA = S.UA;
        //firefox 3.5 不支持，有bug
        if (UA.gecko < 1.92) return;


        var SOURCE_MODE = KE.SOURCE_MODE ,
            WYSIWYG_MODE = KE.WYSIWYG_MODE,
            context = editor.addButton("sourcearea", {
            title:"源码",
            contentCls:"ke-toolbar-source",
            loading:true
        });

        KE.use("sourcearea/support", function() {
            context.reload({
                init:function() {
                    var self = this,
                        btn = self.btn,
                        editor = self.editor;
                    editor.on("wysiwygmode", btn.boff, btn);
                    editor.on("sourcemode", btn.bon, btn);
                },
                offClick:function() {
                    var self = this,
                        editor = self.editor;
                    editor.execCommand("sourceAreaSupport", SOURCE_MODE);
                },
                onClick:function() {
                    var self = this,
                        editor = self.editor;
                    editor.execCommand("sourceAreaSupport", WYSIWYG_MODE);
                }
            });
            editor.addCommand("sourceAreaSupport", KE.SourceAreaSupport);
        });

        this.destroy = function() {
            context.destroy();
        };


        //support wrap : http://www.w3.org/TR/2011/WD-html-markup-20110113/textarea.html

        function initWrap() {
            var textarea = editor.textarea;
            //textarea.attr("cols", 100);
            textarea.on("keydown", function(ev) {
                //ctrl+w
                if (ev.ctrlKey &&
                    ev.keyCode == 87) {
                    ev.halt();
                    var next = textarea.attr("wrap") == "off" ? "soft" : "off";
                    if (!UA['ie']) {
                        textarea.detach();
                        var newTextarea = textarea._4e_clone();
                        editor.textarea = newTextarea;
                        newTextarea.attr("wrap", next);
                        newTextarea.val(textarea.val());
                        textarea[0].parentNode.replaceChild(newTextarea[0], textarea[0]);
                        initWrap();
                        textarea = null;
                    } else {
                        textarea.attr("wrap", next);
                    }
                }
            });
        }

        initWrap();

    });
}, {
    attach:false
});
/**
 * switch between code and wysiwyg mode
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("sourcearea/support", function() {
    var S = KISSY,
        KE = S.Editor,
        UA = S.UA,
        SOURCE_MODE = KE.SOURCE_MODE ,
        WYSIWYG_MODE = KE.WYSIWYG_MODE;

    function SourceAreaSupport() {
        var self = this;
        self.mapper = {};
        var m = self.mapper;
        m[SOURCE_MODE] = self._show;
        m[WYSIWYG_MODE] = self._hide;
    }

    S.augment(SourceAreaSupport, {
        exec:function(editor, mode) {
            var m = this.mapper;
            m[mode] && m[mode].call(this, editor);
        },

        _show:function(editor) {
            var textarea = editor.textarea;
            //还没等 textarea 隐掉就先获取
            textarea.val(editor.getData(true));
            this._showSource(editor);
            editor.fire("sourcemode");
        },
        _showSource:function(editor) {
            var textarea = editor.textarea,
                iframe = editor.iframe;
            textarea.css("display", "");
            iframe.css("display", "none");
            // ie textarea height:100%不起作用
            // resize also modify height wrongly
            textarea.css({
                "height": editor.wrap.css("height"),
                "width":"100%"
            });
            //ie6 光标透出
            textarea[0].focus();
        },
        _hideSource:function(editor) {
            var textarea = editor.textarea,
                iframe = editor.iframe;
            iframe.css("display", "");
            textarea.css("display", "none");
        },
        _hide:function(editor) {
            var textarea = editor.textarea;
            this._hideSource(editor);
            //等 textarea 隐掉了再设置
            //debugger
            editor.fire("save");
            editor.setData(textarea.val());

            editor.fire("wysiwygmode");
            //debugger
            //在切换到可视模式后再进行，否则一旦wysiwygmode在最后，撤销又恢复为原来状态
            editor.fire("save");

            //firefox 光标激活，强迫刷新
            if (UA.gecko) {
                editor.activateGecko();
            }
        }
    });
    KE.SourceAreaSupport = new SourceAreaSupport();
}, {
    attach:false
});/**
 * table edit plugin for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("table", function(editor) {
    editor.addPlugin("table", function() {
        var S = KISSY,
            KE = S.Editor,
            UA = S.UA,
            trim = S.trim;

        /**
         * table 编辑模式下显示虚线边框便于编辑
         */
        var showBorderClassName = 'ke_show_border',
            cssTemplate =
                // IE6 don't have child selector support,
                // where nested table cells could be incorrect.
                ( UA['ie'] === 6 ?
                    [
                        'table.%2,',
                        'table.%2 td, table.%2 th,',
                        '{',
                        'border : #d3d3d3 1px dotted',
                        '}'
                    ] :
                    [
                        ' table.%2,',
                        ' table.%2 > tr > td,  table.%2 > tr > th,',
                        ' table.%2 > tbody > tr > td,  table.%2 > tbody > tr > th,',
                        ' table.%2 > thead > tr > td,  table.%2 > thead > tr > th,',
                        ' table.%2 > tfoot > tr > td,  table.%2 > tfoot > tr > th',
                        '{',
                        'border : #d3d3d3 1px dotted',
                        '}'
                    ] ).join(''),
            cssStyleText = cssTemplate.replace(/%2/g, showBorderClassName);
        var dataProcessor = editor.htmlDataProcessor,
            dataFilter = dataProcessor && dataProcessor.dataFilter,
            htmlFilter = dataProcessor && dataProcessor.htmlFilter;
        if (dataFilter) {
            dataFilter.addRules({
                elements :  {
                    'table' : function(element) {
                        var attributes = element.attributes,
                            cssClass = attributes[ 'class' ],
                            border = parseInt(attributes.border, 10);

                        if (!border || border <= 0)
                            attributes[ 'class' ] = ( cssClass || '' ) + ' ' +
                                showBorderClassName;
                    }
                }
            });
        }

        if (htmlFilter) {
            htmlFilter.addRules({
                elements :            {
                    'table' : function(table) {
                        var attributes = table.attributes,
                            cssClass = attributes[ 'class' ];

                        if (cssClass) {
                            attributes[ 'class' ] =
                                trim(cssClass.replace(showBorderClassName, "").replace(/\s{2}/, " "));
                        }
                    }

                }
            });
        }


        var context = editor.addButton("table", {
            contentCls:"ke-toolbar-table",
            mode:KE.WYSIWYG_MODE,
            title:"插入表格",
            loading:true
        });
        KE.use("table/support", function() {
            var tableUI = new KE.TableUI(editor);
            context.reload({
                offClick:function() {
                    tableUI._tableShow();
                },
                destroy:function() {
                    tableUI.destroy();
                }
            });
        });
        this.destroy = function() {
            context.destroy();
        };
        /**
         * 动态加入显表格border css，便于编辑
         */
        editor.addCustomStyle(cssStyleText);
    });
}, {
    attach:false
});
/**
 * table base functionality
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("table/support", function() {
    var S = KISSY,
        UA = S.UA,
        Node = S.Node,
        KE = S.Editor,
        KEN = KE.NODE,
        tableRules = ["tr","th","td","tbody","table"];
    var addRes = KE.Utils.addRes,
        destroyRes = KE.Utils.destroyRes;

    function TableUI(editor) {
        var self = this,
            myContexts = {};
        for (var f in contextMenu) {
            (function(f) {
                myContexts[f] = function() {
                    editor.fire("save");
                    contextMenu[f](self);
                    editor.fire("save");
                }
            })(f);
        }
        var c = KE.ContextMenu.register({
            editor:editor,
            statusChecker:statusChecker,
            rules:tableRules,
            width:"120px",
            funcs:myContexts
        });
        addRes.call(self, c);
        self.editor = editor;
    }

    S.augment(TableUI, {
        _tableShow:function(ev, selectedTable, td) {
            var editor = this.editor;
            editor.showDialog("table/dialog", [selectedTable, td]);
        },
        destroy:function() {
            destroyRes.call(this);
            this.editor.destroyDialog("table/dialog");
        }
    });


    var cellNodeRegex = /^(?:td|th)$/;

    function getSelectedCells(selection) {
        // Walker will try to split text nodes, which will make the current selection
        // invalid. So save bookmarks before doing anything.
        var bookmarks = selection.createBookmarks(),
            ranges = selection.getRanges(),
            retval = [],
            database = {};

        function moveOutOfCellGuard(node) {
            // Apply to the first cell only.
            if (retval.length > 0)
                return;

            // If we are exiting from the first </td>, then the td should definitely be
            // included.
            if (node[0].nodeType == KEN.NODE_ELEMENT &&
                cellNodeRegex.test(node._4e_name())
                && !node.data('selected_cell')) {
                node._4e_setMarker(database, 'selected_cell', true);
                retval.push(node);
            }
        }

        for (var i = 0; i < ranges.length; i++) {
            var range = ranges[ i ];

            if (range.collapsed) {
                // Walker does not handle collapsed ranges yet - fall back to old API.
                var startNode = range.getCommonAncestor(),
                    nearestCell = startNode._4e_ascendant('td', true) ||
                        startNode._4e_ascendant('th', true);
                if (nearestCell)
                    retval.push(nearestCell);
            } else {
                var walker = new Walker(range),
                    node;
                walker.guard = moveOutOfCellGuard;

                while (( node = walker.next() )) {
                    // If may be possible for us to have a range like this:
                    // <td>^1</td><td>^2</td>
                    // The 2nd td shouldn't be included.
                    //
                    // So we have to take care to include a td we've entered only when we've
                    // walked into its children.

                    var parent = node.parent();
                    if (parent && cellNodeRegex.test(parent._4e_name()) &&
                        !parent.data('selected_cell')) {
                        parent._4e_setMarker(database, 'selected_cell', true);
                        retval.push(parent);
                    }
                }
            }
        }

        KE.Utils.clearAllMarkers(database);
        // Restore selection position.
        selection.selectBookmarks(bookmarks);

        return retval;
    }

    function clearRow($tr) {
        // Get the array of row's cells.
        var $cells = $tr.cells;
        // Empty all cells.
        for (var i = 0; i < $cells.length; i++) {
            $cells[ i ].innerHTML = '';
            if (!UA['ie'])
                ( new Node($cells[ i ]) )._4e_appendBogus();
        }
    }

    function insertRow(selection, insertBefore) {
        // Get the row where the selection is placed in.
        var row = selection.getStartElement()._4e_ascendant('tr');
        if (!row)
            return;

        // Create a clone of the row.
        var newRow = row._4e_clone(true);
        // Insert the new row before of it.
        newRow.insertBefore(row);
        // Clean one of the rows to produce the illusion of
        // inserting an empty row
        // before or after.
        clearRow(insertBefore ? newRow[0] : row[0]);
    }

    function deleteRows(selectionOrRow) {
        if (selectionOrRow instanceof KE.Selection) {
            var cells = getSelectedCells(selectionOrRow),
                cellsCount = cells.length,
                rowsToDelete = [],
                cursorPosition,
                previousRowIndex,
                nextRowIndex;

            // Queue up the rows - it's possible and
            // likely that we have duplicates.
            for (var i = 0; i < cellsCount; i++) {
                var row = cells[ i ].parent(),
                    rowIndex = row[0].rowIndex;

                !i && ( previousRowIndex = rowIndex - 1 );
                rowsToDelete[ rowIndex ] = row;
                i == cellsCount - 1 && ( nextRowIndex = rowIndex + 1 );
            }

            var table = row._4e_ascendant('table'),
                rows = table[0].rows,
                rowCount = rows.length;

            // Where to put the cursor after rows been deleted?
            // 1. Into next sibling row if any;
            // 2. Into previous sibling row if any;
            // 3. Into table's parent element if it's the very last row.
            cursorPosition = new Node(
                nextRowIndex < rowCount && table[0].rows[ nextRowIndex ] ||
                    previousRowIndex > 0 && table[0].rows[ previousRowIndex ] ||
                    table[0].parentNode);

            for (i = rowsToDelete.length; i >= 0; i--) {
                if (rowsToDelete[ i ])
                    deleteRows(rowsToDelete[ i ]);
            }

            return cursorPosition;
        }
        else if (selectionOrRow instanceof Node) {
            table = selectionOrRow._4e_ascendant('table');

            if (table[0].rows.length == 1)
                table._4e_remove();
            else
                selectionOrRow._4e_remove();
        }

        return 0;
    }

    function insertColumn(selection, insertBefore) {
        // Get the cell where the selection is placed in.
        var startElement = selection.getStartElement(),
            cell = startElement._4e_ascendant('td', true) ||
                startElement._4e_ascendant('th', true);
        if (!cell)
            return;
        // Get the cell's table.
        var table = cell._4e_ascendant('table'),
            cellIndex = cell[0].cellIndex;
        // Loop through all rows available in the table.
        for (var i = 0; i < table[0].rows.length; i++) {
            var $row = table[0].rows[ i ];
            // If the row doesn't have enough cells, ignore it.
            if ($row.cells.length < ( cellIndex + 1 ))
                continue;
            cell = new Node($row.cells[ cellIndex ].cloneNode(false));

            if (!UA['ie'])
                cell._4e_appendBogus();
            // Get back the currently selected cell.
            var baseCell = new Node($row.cells[ cellIndex ]);
            if (insertBefore)
                cell.insertBefore(baseCell);
            else
                cell.insertAfter(baseCell);
        }
    }

    function getFocusElementAfterDelCols(cells) {
        var cellIndexList = [],
            table = cells[ 0 ] && cells[ 0 ]._4e_ascendant('table'),
            i,length,
            targetIndex,targetCell;

        // get the cellIndex list of delete cells
        for (i = 0,length = cells.length; i < length; i++)
            cellIndexList.push(cells[i][0].cellIndex);

        // get the focusable column index
        cellIndexList.sort();
        for (i = 1,length = cellIndexList.length;
             i < length; i++) {
            if (cellIndexList[ i ] - cellIndexList[ i - 1 ] > 1) {
                targetIndex = cellIndexList[ i - 1 ] + 1;
                break;
            }
        }

        if (!targetIndex)
            targetIndex = cellIndexList[ 0 ] > 0 ? ( cellIndexList[ 0 ] - 1 )
                : ( cellIndexList[ cellIndexList.length - 1 ] + 1 );

        // scan row by row to get the target cell
        var rows = table[0].rows;
        for (i = 0,length = rows.length;
             i < length; i++) {
            targetCell = rows[ i ].cells[ targetIndex ];
            if (targetCell)
                break;
        }

        return targetCell ? new Node(targetCell) : table._4e_previous();
    }

    function deleteColumns(selectionOrCell) {
        if (selectionOrCell instanceof KE.Selection) {
            var colsToDelete = getSelectedCells(selectionOrCell),
                elementToFocus = getFocusElementAfterDelCols(colsToDelete);

            for (var i = colsToDelete.length - 1; i >= 0; i--) {
                //某一列已经删除？？这一列的cell再做？ !table判断处理
                if (colsToDelete[ i ])
                    deleteColumns(colsToDelete[i]);
            }

            return elementToFocus;
        }
        else if (selectionOrCell instanceof Node) {
            // Get the cell's table.
            var table = selectionOrCell._4e_ascendant('table');

            //该单元格所属的列已经被删除了
            if (!table)
                return null;

            // Get the cell index.
            var cellIndex = selectionOrCell[0].cellIndex;

            /*
             * Loop through all rows from down to up,
             *  coz it's possible that some rows
             * will be deleted.
             */
            for (i = table[0].rows.length - 1; i >= 0; i--) {
                // Get the row.
                var row = new Node(table[0].rows[ i ]);

                // If the cell to be removed is the first one and
                //  the row has just one cell.
                if (!cellIndex && row[0].cells.length == 1) {
                    deleteRows(row);
                    continue;
                }

                // Else, just delete the cell.
                if (row[0].cells[ cellIndex ])
                    row[0].removeChild(row[0].cells[ cellIndex ]);
            }
        }

        return null;
    }

    function placeCursorInCell(cell, placeAtEnd) {
        var range = new KE.Range(cell[0].ownerDocument);
        if (!range['moveToElementEditablePosition'](cell,
            placeAtEnd ? true : undefined)) {
            range.selectNodeContents(cell);
            range.collapse(placeAtEnd ? false : true);
        }
        range.select(true);
    }

    function getSel(editor) {
        var selection = editor.getSelection(),
            startElement = selection && selection.getStartElement(),
            table = startElement && startElement._4e_ascendant('table', true);
        if (!table)
            return undefined;
        var td = startElement._4e_ascendant(function(n) {
            var name = n._4e_name();
            return table.contains(n) && (name == "td" || name == "th");
        }, true);
        var tr = startElement._4e_ascendant(function(n) {
            var name = n._4e_name();
            return table.contains(n) && name == "tr";
        }, true);
        return {
            table:table,
            td:td,
            tr:tr
        };
    }

    function ensureTd(editor) {
        var info = getSel(editor);
        return info && info.td;

    }


    function ensureTr(editor) {
        var info = getSel(editor);
        return info && info.tr;

    }

    var statusChecker = {
        "表格属性" :getSel,
        "删除表格" :ensureTd,
        "删除列" :ensureTd,
        "删除行" :ensureTr,
        '在上方插入行': ensureTr,
        '在下方插入行' : ensureTr,
        '在左侧插入列' : ensureTd,
        '在右侧插入列' : ensureTd
    };

    var contextMenu = {

        "表格属性" : function(cmd) {
            var editor = cmd.editor,info = getSel(editor);
            if (!info) return;
            cmd._tableShow(null, info.table, info.td);
        },

        "删除表格" : function(cmd) {
            var editor = cmd.editor,
                selection = editor.getSelection(),
                startElement = selection &&
                    selection.getStartElement(),
                table = startElement &&
                    startElement._4e_ascendant('table', true);
            if (!table)
                return;
            // Maintain the selection point at where the table was deleted.
            selection.selectElement(table);
            var range = selection.getRanges()[0];
            range.collapse();
            selection.selectRanges([ range ]);

            // If the table's parent has only one child,
            // remove it,except body,as well.( #5416 )
            var parent = table.parent();
            if (parent[0].childNodes.length == 1 &&
                parent._4e_name() != 'body' &&
                parent._4e_name() != 'td')
                parent._4e_remove();
            else
                table._4e_remove();
        },

        '删除行 ': function(cmd) {
            var selection = cmd.editor.getSelection();
            placeCursorInCell(deleteRows(selection), undefined);
        },

        '删除列 ' : function(cmd) {
            var selection = cmd.editor.getSelection(),
                element = deleteColumns(selection);
            element && placeCursorInCell(element, true);
        },

        '在上方插入行': function(cmd) {
            var selection = cmd.editor.getSelection();
            insertRow(selection, true);
        },

        '在下方插入行' : function(cmd) {
            var selection = cmd.editor.getSelection();
            insertRow(selection, undefined);
        },

        '在左侧插入列' : function(cmd) {
            var selection = cmd.editor.getSelection();
            insertColumn(selection, true);
        },

        '在右侧插入列' : function(cmd) {
            var selection = cmd.editor.getSelection();
            insertColumn(selection, undefined);
        }
    };

    KE.TableUI = TableUI;
}, {
    attach:false,
    "requires": ["contextmenu"]
});/**
 * tabs ui
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("tabs", function() {
    var S = KISSY,
        KE = S.Editor,
        Node = S.Node,
        LI = "li",
        DIV = "div",
        REL = "rel",
        SELECTED = "ke-tab-selected";
    if (KE.Tabs) {
        S.log("ke tabs attach more", "warn");
        return;
    }

    function Tabs(cfg) {
        this.cfg = cfg;
        this._init();
    }

    S.augment(Tabs, S.EventTarget, {
        _init:function() {
            var self = this,
                cfg = self.cfg,
                tabs = cfg.tabs,
                contents = cfg.contents,
                divs = contents.children(DIV),
                lis = tabs.children(LI);

            tabs.on("click", function(ev) {
                ev && ev.preventDefault();
                var li = new Node(ev.target);
                if (li = li._4e_ascendant(function(n) {
                    return n._4e_name() === LI && tabs.contains(n);
                }, true)) {
                    lis.removeClass(SELECTED);
                    var rel = li.attr(REL);
                    li.addClass(SELECTED);
                    divs.hide();

                    divs.item(S.indexOf(li[0], lis)).show();
                    self.fire(rel);
                }
            });
        },
        getTab:function(n) {
            var self = this,
                cfg = self.cfg,
                tabs = cfg.tabs,
                contents = cfg.contents,
                divs = contents.children(DIV),
                lis = tabs.children(LI);
            for (var i = 0; i < lis.length; i++) {
                var li = new Node(lis[i]),
                    div = new Node(divs[i]);
                if (S.isNumber(n) && n == i
                    ||
                    S.isString(n) && n == li.attr(REL)
                    ) {
                    return {
                        tab:li,
                        content:div
                    };
                }
            }
        },
        remove:function(n) {
            var info = this.getTab(n);
            info.tab.remove();
            info.content.remove();
        },
        _getActivate:function() {
            var self = this,
                cfg = self.cfg,
                tabs = cfg.tabs,
                lis = tabs.children(LI);
            for (var i = 0; i < lis.length; i++) {
                var li = new Node(lis[i]);
                if (li.hasClass(SELECTED)) return li.attr(REL);
            }
        },
        activate:function(n) {
            if (arguments.length == 0) return this._getActivate();
            var self = this,
                cfg = self.cfg,
                tabs = cfg.tabs,
                contents = cfg.contents,
                divs = contents.children(DIV),
                lis = tabs.children(LI);
            lis.removeClass(SELECTED);
            divs.hide();
            var info = this.getTab(n);
            info.tab.addClass(SELECTED);
            info.content.show();
        },
        destroy:function() {
            var self = this,
                cfg = self.cfg,
                tabs = cfg.tabs;
            tabs.detach();
            tabs.remove();
        }
    });
    KE.Tabs = Tabs;
}, {
    attach:false
});/**
 * templates support for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("templates", function(editor) {

    editor.addPlugin("templates", function() {
        var S = KISSY,
            KE = S.Editor,
            Node = S.Node,
            DOM = S.DOM;

        DOM.addStyleSheet(
            ".ke-tpl {" +
                "    border: 2px solid #EEEEEE;" +
                "    width: 95%;" +
                "    margin: 20px auto;" +
                "}" +

                ".ke-tpl-list {" +
                "    border: 1px solid #EEEEEE;" +
                "    margin: 5px;" +
                "    padding: 7px;" +
                "    display: block;" +
                "    text-decoration: none;" +
                "    zoom: 1;" +
                "}" +

                ".ke-tpl-list:hover, .ke-tpl-selected {" +
                "    background-color: #FFFACD;" +
                "    text-decoration: none;" +
                "    border: 1px solid #FF9933;" +
                "}"
            , "ke-templates");


        var context = editor.addButton("templates", {
            contentCls:"ke-toolbar-template",
            title:"模板",
            mode:KE.WYSIWYG_MODE,
            offClick:function() {
                var self = this;
                KE.use("overlay", function() {
                    self.cfg._prepare.call(self);
                });
            },
            _prepare:function() {
                var self = this,
                    editor = self.editor,
                    templates = editor.cfg.pluginConfig['templates'] || [],
                    HTML = "<div class='ke-tpl'>";
                for (var i = 0; i < templates.length; i++) {
                    var t = templates[i];
                    HTML += "<a " +
                        "href='javascript:void(0)' " +
                        "class='ke-tpl-list' " +
                        "tabIndex='-1'>" +
                        t['demo'] +
                        "</a>";
                }
                HTML += "</div>";

                var ui = new KE.Dialog({
                    width:500,
                    mask:true,
                    autoRender:true,
                    headerContent:"内容模板",
                    bodyContent:HTML
                }),
                    list = ui.get("el").all(".ke-tpl-list");
                list.on("click", function(ev) {
                    ev.halt();
                    var t = new Node(ev.target);
                    var index = t._4e_index();
                    if (index != -1) {
                        editor.insertHtml(templates[index].html);
                    }
                    ui.hide();
                });
                self.ui = ui;
                self.cfg.show.call(self);
                self.cfg._prepare = self.cfg.show;
            },
            show:function() {
                this.ui.show();
            }
        });


        this.destroy = function() {
            context.destroy();
        };
    });


}, {
    attach:false
});
/**
 * undo,redo manager for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("undo", function(editor) {
    var S = KISSY,
        KE = S.Editor;


    var RedoMap = {
        "redo":1,
        "undo":-1
    },
        tplCfg = {
            mode:KE.WYSIWYG_MODE,
            init:function() {
                var self = this,
                    editor = self.editor;
                /**
                 * save,restore完，更新工具栏状态
                 */
                editor.on("afterSave afterRestore",
                    self.cfg._respond,
                    self);
                self.btn.disable();
            },
            offClick:function() {
                var self = this;
                self.editor.fire("restore", {
                    d:RedoMap[self.cfg.flag]
                });
            }
        },
        undoCfg = S.mix({
            flag:"undo",
            _respond:function(ev) {
                var self = this,
                    index = ev.index,
                    btn = self.btn;

                //有状态可退
                if (index > 0) {
                    btn.boff();
                } else {
                    btn.disable();
                }
            }
        }, tplCfg, false),
        redoCfg = S.mix({
            flag:"redo",
            _respond:function(ev) {
                //debugger
                var self = this,
                    history = ev.history,
                    index = ev.index,
                    btn = self.btn;
                //有状态可前进
                if (index < history.length - 1) {
                    btn.boff();
                } else {
                    btn.disable();
                }
            }
        }, tplCfg, false);

    editor.addPlugin("undo", function() {
        /**
         * 撤销工具栏按钮
         */
        var b1 = editor.addButton("undo", {
            title:"撤销",
            loading:true,
            contentCls:"ke-toolbar-undo"
        });

        /**
         * 重做工具栏按钮
         */
        var b2 = editor.addButton("undo", {
            title:"重做",
            loading:true,
            contentCls:"ke-toolbar-redo"
        });
        KE.use("undo/support", function() {
            /**
             * 编辑器历史中央管理
             */
            new KE.UndoManager(editor);
            b1.reload(undoCfg);
            b2.reload(redoCfg);
        });

        this.destroy = function() {
            b1.destroy();
            b2.destroy();
        };
    });

}, {
    attach:false
});
/**
 * undo,redo manager for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("undo/support", function() {
    var S = KISSY,
        KE = S.Editor,
        arrayCompare = KE.Utils.arrayCompare,
        UA = S.UA,
        Event = S.Event,
        LIMIT = 30;

    /**
     * 当前编辑区域状态，包括 html 与选择区域(光标位置)
     * @param editor
     */
    function Snapshot(editor) {
        var contents = editor._getRawData(),
            self = this,
            selection;
        if (contents) {
            selection = editor.getSelection();
        }
        //内容html
        self.contents = contents;
        //选择区域书签标志
        self.bookmarks = selection && selection.createBookmarks2(true);
    }


    S.augment(Snapshot, {
        /**
         * 编辑状态间是否相等
         * @param otherImage
         */
        equals:function(otherImage) {
            var self = this,
                thisContents = self.contents,
                otherContents = otherImage.contents;
            if (thisContents != otherContents)
                return false;
            var bookmarksA = self.bookmarks,
                bookmarksB = otherImage.bookmarks;

            if (bookmarksA || bookmarksB) {
                if (!bookmarksA || !bookmarksB || bookmarksA.length != bookmarksB.length)
                    return false;

                for (var i = 0; i < bookmarksA.length; i++) {
                    var bookmarkA = bookmarksA[ i ],
                        bookmarkB = bookmarksB[ i ];

                    if (
                        bookmarkA.startOffset != bookmarkB.startOffset ||
                            bookmarkA.endOffset != bookmarkB.endOffset ||
                            !arrayCompare(bookmarkA.start, bookmarkB.start) ||
                            !arrayCompare(bookmarkA.end, bookmarkB.end)) {
                        return false;
                    }
                }
            }

            return true;
        }
    });

    /**
     * 通过编辑器的save与restore事件，编辑器实例的历史栈管理，与键盘监控
     * @param editor
     */
    function UndoManager(editor) {
        //redo undo history stack
        /**
         * 编辑器状态历史保存
         */
        var self = this;
        self.history = [];
        //当前所处状态对应的历史栈内下标
        self.index = -1;
        self.editor = editor;
        //键盘输入做延迟处理
        self.bufferRunner = KE.Utils.buffer(self.save, self, 500);
        self._init();
    }

    var //editingKeyCodes = { /*Backspace*/ 8:1, /*Delete*/ 46:1 },
        modifierKeyCodes = { /*Shift*/ 16:1, /*Ctrl*/ 17:1, /*Alt*/ 18:1 },
        // Arrows: L, T, R, B
        navigationKeyCodes = { 37:1, 38:1, 39:1, 40:1,33:1,34:1 },
        zKeyCode = 90,
        yKeyCode = 89;


    S.augment(UndoManager, {
        /**
         * 监控键盘输入，buffer处理
         */
        _keyMonitor:function() {
            var self = this,
                editor = self.editor,
                doc = editor.document;
            //也要监控源码下的按键，便于实时统计
            Event.on([doc,editor.textarea], "keydown", function(ev) {
                var keycode = ev.keyCode;
                if (keycode in navigationKeyCodes
                    || keycode in modifierKeyCodes
                    )
                    return;
                //ctrl+z，撤销
                if (keycode === zKeyCode && (ev.ctrlKey || ev.metaKey)) {
                    editor.fire("restore", {d:-1});
                    ev.halt();
                    return;
                }
                //ctrl+y，重做
                if (keycode === yKeyCode && (ev.ctrlKey || ev.metaKey)) {
                    editor.fire("restore", {d:1});
                    ev.halt();
                    return;
                }
                editor.fire("save", {buffer:1});
            });
        },

        _init:function() {
            var self = this,
                editor = self.editor;
            //外部通过editor触发save|restore,管理器捕获事件处理
            editor.on("save", function(ev) {
                //代码模式下不和可视模式下混在一起
                if (editor.getMode() != KE.WYSIWYG_MODE) return;
                if (ev.buffer) {
                    //键盘操作需要缓存
                    self.bufferRunner();
                } else {
                    //其他立即save
                    self.save();
                }
            });
            editor.on("restore", function(ev) {
                //代码模式下不和可视模式下混在一起
                if (editor.getMode() != KE.WYSIWYG_MODE) return;
                self.restore(ev);
            });

            self._keyMonitor();
            //先save一下,why??
            //初始状态保存，异步，必须等use中已经 set 了编辑器中初始代码
            //必须在从 textarea 复制到编辑区域前，use所有plugin，为了过滤插件生效
            //而这段代码必须在从 textarea 复制到编辑区域后运行，所以设个延迟
            setTimeout(function() {
                self.save();
            }, 0);
        },

        /**
         * 保存历史
         */
        save:function() {
            var self = this,
                history = self.history,
                index = self.index;
            //debugger
            //前面的历史抛弃
            if (history.length > index + 1)
                history.splice(index + 1, history.length - index - 1);

            var editor = self.editor,
                last = history[history.length - 1],
                current = new Snapshot(editor);

            if (!last || !last.equals(current)) {
                if (history.length === LIMIT) {
                    history.shift();
                }
                history.push(current);
                self.index = index = history.length - 1;
                editor.fire("afterSave", {history:history,index:index});
            }
        },

        /**
         *
         * @param ev
         * ev.d ：1.向前撤销 ，-1.向后重做
         */
        restore:function(ev) {
            var d = ev.d,
                self = this,
                history = self.history,
                editor = self.editor,
                snapshot = history[self.index + d];
            if (snapshot) {
                editor._setRawData(snapshot.contents);
                if (snapshot.bookmarks)
                    editor.getSelection().selectBookmarks(snapshot.bookmarks);
                else if (UA['ie']) {
                    // IE BUG: If I don't set the selection to *somewhere* after setting
                    // document contents, then IE would create an empty paragraph at the bottom
                    // the next time the document is modified.
                    var $range = editor.document.body.createTextRange();
                    $range.collapse(true);
                    $range.select();
                }
                var selection = editor.getSelection();
                //将当前光标，选择区域滚动到可视区域
                if (selection) {
                    selection.scrollIntoView();
                }
                self.index += d;
                editor.fire("afterRestore", {
                    history:history,
                    index:self.index
                });
                editor.notifySelectionChange();
            }
        }
    });
    KE.UndoManager = UndoManager;
},{
    attach:false
});
