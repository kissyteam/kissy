/**
 * common utils for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/core/utils", function (S) {

    var KE = S.Editor,
        TRUE = true,
        FALSE = false,
        NULL = null,
        Node = S.Node,
        DOM = S.DOM,
        UA = S.UA,
        Event = S.Event,
        Utils = {
            debugUrl:function (url) {
                url = url.replace(/-min\.(js|css)/i, ".$1");
                if (!S["Config"]['debug']) {
                    url = url.replace(/\.(js|css)/i, "-min.$1");
                }
                if (url.indexOf("?t") == -1) {
                    if (url.indexOf("?") != -1) {
                        url += "&";
                    } else {
                        url += "?";
                    }
                    url += "t=" + encodeURIComponent("@TIMESTAMP@");
                }
                if (S.startsWith(url, "/")) {
                    url = url.substring(1);
                }
                return KE["Config"].base + url;
            },
            /**
             * 懒惰一下
             * @param obj {Object} 包含方法的对象
             * @param before {string} 准备方法
             * @param after {string} 真正方法
             */
            lazyRun:function (obj, before, after) {
                var b = obj[before], a = obj[after];
                obj[before] = function () {
                    b.apply(this, arguments);
                    obj[before] = obj[after];
                    return a.apply(this, arguments);
                };
            },

            /**
             * srcDoc 中的位置在 destDoc 的对应位置
             * @param x {number}
             * @param y {number}
             * @param srcDoc {Document}
             * @param destDoc {Document}
             * @return 在最终文档中的位置
             */
            getXY:function (x, y, srcDoc, destDoc) {
                var currentWindow = srcDoc.defaultView || srcDoc.parentWindow;

                //x,y相对于当前iframe文档,防止当前iframe有滚动条
                x -= DOM.scrollLeft(currentWindow);
                y -= DOM.scrollTop(currentWindow);
                if (destDoc) {
                    var refWindow = destDoc.defaultView || destDoc.parentWindow;
                    if (currentWindow != refWindow && currentWindow['frameElement']) {
                        //note:when iframe is static ,still some mistake
                        var iframePosition = DOM.offset(currentWindow['frameElement'], undefined, refWindow);
                        x += iframePosition.left;
                        y += iframePosition.top;
                    }
                }
                return {left:x, top:y};
            },
            /**
             * 执行一系列函数
             * @param var_args {...function()}
             * @return {*} 得到成功的返回
             */
            tryThese:function (var_args) {
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
            arrayCompare:function (arrayA, arrayB) {
                if (!arrayA && !arrayB)
                    return TRUE;

                if (!arrayA || !arrayB || arrayA.length != arrayB.length)
                    return FALSE;

                for (var i = 0; i < arrayA.length; i++) {
                    if (arrayA[ i ] !== arrayB[ i ])
                        return FALSE;
                }

                return TRUE;
            },

            /**
             * 根据dom路径得到某个节点
             * @param doc {Document}
             * @param address {Array.<number>}
             * @param normalized {boolean}
             * @return {Node}
             */
            getByAddress:function (doc, address, normalized) {
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
            },
            /**
             * @param database {Object}
             */
            clearAllMarkers:function (database) {
                for (var i in database) {
                    if (database.hasOwnProperty(i)) {
                        database[i]._4e_clearMarkers(database, TRUE);
                    }
                }
            },
            /**
             *
             * @param str {string}
             * @return {string}
             */
            ltrim:function (str) {
                return str.replace(/^\s+/, "");
            },
            /**
             *
             * @param str {string}
             * @return {string}
             */
            rtrim:function (str) {
                return str.replace(/\s+$/, "");
            },
            /**
             *
             * @param var_args {...Object}
             * @return {Object}
             */
            mix:function (var_args) {
                var r = {};
                for (var i = 0; i < arguments.length; i++) {
                    var ob = arguments[i];
                    r = S.mix(r, ob);
                }
                return r;
            },
            isCustomDomain:function () {
                if (!UA['ie'])
                    return FALSE;

                var domain = document.domain,
                    hostname = window.location.hostname;

                return domain != hostname &&
                    domain != ( '[' + hostname + ']' );	// IPv6 IP support (#5434)
            },

            isNumber:function (n) {
                return /^\d+(.\d+)?$/.test(S.trim(n));
            },

            /**
             *
             * @param inputs {Array.<Node>}
             * @param [warn] {string}
             * @return {boolean} 是否验证成功
             */
            verifyInputs:function (inputs, warn) {
                for (var i = 0; i < inputs.length; i++) {
                    var input = new Node(inputs[i]),
                        v = S.trim(Utils.valInput(input)),
                        verify = input.attr("data-verify"),
                        warning = input.attr("data-warning");
                    if (verify && !new RegExp(verify).test(v)) {
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
            sourceDisable:function (editor, plugin) {
                editor.on("sourceMode", plugin.disable, plugin);
                editor.on("wysiwygMode", plugin.enable, plugin);
            },

            /**
             *
             * @param inp {Node}
             */
            resetInput:function (inp) {
                var placeholder = inp.attr("placeholder");
                if (placeholder && UA['ie']) {
                    inp.addClass("ke-input-tip");
                    inp.val(placeholder);
                } else if (!UA['ie']) {
                    inp.val("");
                }
            },

            /**
             *
             * @param inp  {Node}
             * @param [val]
             */
            valInput:function (inp, val) {
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
            placeholder:function (inp, tip) {
                inp.attr("placeholder", tip);
                if (!UA['ie']) {
                    return;
                }
                inp.on("blur", function () {
                    if (!S.trim(inp.val())) {
                        inp.addClass("ke-input-tip");
                        inp.val(tip);
                    }
                });
                inp.on("focus", function () {
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
            htmlEncode:function (value) {
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
            doFormUpload:function (o, ps, url) {
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

                var form =o.form,
                    buf = {
                        target:DOM.attr(form, "target"),
                        method:DOM.attr(form, "method"),
                        encoding:DOM.attr(form, "encoding"),
                        enctype:DOM.attr(form, "enctype"),
                        "action":DOM.attr(form, "action")
                    };
                DOM.attr(form, {
                    target:id,
                    "method":"post",
                    enctype:'multipart/form-data',
                    encoding:'multipart/form-data'
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
                        responseText:'',
                        responseXML:NULL
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
                    catch (e) {
                        // ignore
                        // 2010-11-15 由于外边设置了document.domain导致读不到数据抛异常
                        S.log("after data returns error ,maybe domain problem:");
                        S.log(e, "error");
                    }

                    Event.remove(frame, 'load', cb);
                    o.callback && o.callback(r);

                    setTimeout(function () {
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

            map:function (arr, callback) {
                for (var i = 0; i < arr.length; i++) {
                    arr[i] = callback(arr[i]);
                }
                return arr;
            },

            //直接判断引擎，防止兼容性模式影响
            ieEngine:document['documentMode'] || UA['ie'],

            /**
             * 点击 el 或者 el 内的元素，不会使得焦点转移
             * @param el
             */
            preventFocus:function (el) {
                if (UA['ie']) {
                    //ie 点击按钮不丢失焦点
                    el.unselectable();
                } else {
                    el.attr("onmousedown", "return false;");
                }
            },

            injectDom:function (editorDom) {
                S.mix(DOM, editorDom);
                for (var dm in editorDom) {
                    if (editorDom.hasOwnProperty(dm))
                        (function (dm) {
                            Node.prototype[dm] = function () {
                                var args = [].slice.call(arguments, 0);
                                args.unshift(this[0]);
                                var ret = editorDom[dm].apply(NULL, args);
                                if (ret && (ret.nodeType || S.isWindow(ret))) {
                                    return new Node(ret);
                                } else {
                                    if (S.isArray(ret)) {
                                        if (ret.__IS_NODELIST || (ret[0] && ret[0].nodeType)) {
                                            return new Node(ret);
                                        }
                                    }
                                    return ret;
                                }
                            };
                        })(dm);
                }
            },

            addRes:function () {
                this.__res = this.__res || [];
                var res = this.__res;
                res.push.apply(res, S.makeArray(arguments));
            },

            destroyRes:function () {
                var res = this.__res || [];
                for (var i = 0; i < res.length; i++) {
                    var r = res[i];
                    if (S.isFunction(r)) {
                        r();
                    } else {
                        if (r.destroy) {
                            r.destroy();
                        }
                        if (r.remove) {
                            r.remove();
                        }
                    }
                }
                this.__res = [];
            },

            getQueryCmd:function (cmd) {
                return "query" + ("-" + cmd).replace(/-(\w)/g, function (m, m1) {
                    return m1.toUpperCase()
                }) + "Active";
            }
        };

    KE.Utils = Utils;

    return Utils;
}, {
    requires:['./base']
});
