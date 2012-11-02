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
});