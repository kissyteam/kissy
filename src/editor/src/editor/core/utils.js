/**
 * common utils for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/core/utils", function (S) {

    var Editor = S.Editor,
        TRUE = true,
        FALSE = false,
        NULL = null,
        Node = S.Node,
        DOM = S.DOM,
        UA = S.UA,

        /**
         * @namespace
         * Utilities for Editor.
         * @name Utils
         * @member Editor
         */
            Utils =
        /**
         * @lends Editor.Utils
         */
        {
            /**
             *
             * @param url
             * @return {String}
             */
            debugUrl: function (url) {
                var Config = S.Config;
                if (!Config.debug) {
                    url = url.replace(/\.(js|css)/i, "-min.$1");
                }
                if (url.indexOf("?t") == -1) {
                    if (url.indexOf("?") != -1) {
                        url += "&";
                    } else {
                        url += "?";
                    }
                    url += "t=" + encodeURIComponent(Config.tag);
                }
                return Config.base + "editor/" + url;
            },

            /**
             * 懒惰一下
             * @param obj {Object} 包含方法的对象
             * @param before {string} 准备方法
             * @param after {string} 真正方法
             */
            lazyRun: function (obj, before, after) {
                var b = obj[before], a = obj[after];
                obj[before] = function () {
                    b.apply(this, arguments);
                    obj[before] = obj[after];
                    return a.apply(this, arguments);
                };
            },

            /**
             * editor 元素在主窗口的位置
             */
            getXY: function (offset, editor) {
                var x = offset.left,
                    y = offset.top,
                    currentWindow = editor.get("window")[0];
                //x,y相对于当前iframe文档,防止当前iframe有滚动条
                x -= DOM.scrollLeft(currentWindow);
                y -= DOM.scrollTop(currentWindow);

                //note:when iframe is static ,still some mistake
                var iframePosition = editor.get("iframe").offset();
                x += iframePosition.left;
                y += iframePosition.top;

                return {left: x, top: y};
            },

            /**
             * 执行一系列函数
             * @param var_args {...function()}
             * @return {*} 得到成功的返回
             */
            tryThese: function (var_args) {
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
             * @return {Boolean}
             */
            arrayCompare: function (arrayA, arrayB) {
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
             * @param database {Object}
             */
            clearAllMarkers: function (database) {
                for (var i in database) {

                    database[i]._4e_clearMarkers(database, TRUE, undefined);

                }
            },

            /**
             *
             * @param str {string}
             * @return {string}
             */
            ltrim: function (str) {
                return str.replace(/^\s+/, "");
            },

            /**
             *
             * @param str {string}
             * @return {string}
             */
            rtrim: function (str) {
                return str.replace(/\s+$/, "");
            },

            /**
             *
             */
            isNumber: function (n) {
                return /^\d+(.\d+)?$/.test(S.trim(n));
            },

            /**
             *
             * @param inputs {Array.<Node>}
             * @return {Boolean} 是否验证成功
             */
            verifyInputs: function (inputs) {
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
            sourceDisable: function (editor, plugin) {
                editor.on("sourceMode", plugin.disable, plugin);
                editor.on("wysiwygMode", plugin.enable, plugin);
            },

            /**
             *
             * @param inp {KISSY.NodeList}
             */
            resetInput: function (inp) {
                var placeholder = inp.attr("placeholder");
                if (placeholder && UA['ie']) {
                    inp.addClass("ks-editor-input-tip");
                    inp.val(placeholder);
                } else if (!UA['ie']) {
                    inp.val("");
                }
            },

            /**
             *
             * @param inp  {KISSY.NodeList}
             * @param [val]
             */
            valInput: function (inp, val) {
                if (val === undefined) {
                    if (inp.hasClass("ks-editor-input-tip")) {
                        return "";
                    } else {
                        return inp.val();
                    }
                } else {
                    inp.removeClass("ks-editor-input-tip");
                    inp.val(val);
                }
            },

            /**
             *
             * @param inp {KISSY.NodeList}
             * @param tip {string}
             */
            placeholder: function (inp, tip) {
                inp.attr("placeholder", tip);
                if (!UA['ie']) {
                    return;
                }
                inp.on("blur", function () {
                    if (!S.trim(inp.val())) {
                        inp.addClass("ks-editor-input-tip");
                        inp.val(tip);
                    }
                });
                inp.on("focus", function () {
                    inp.removeClass("ks-editor-input-tip");
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
            htmlEncode: function (value) {
                return !value ? value : String(value).replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
            },

            /**
             *
             * @param params {Object}
             * @return {Object}
             */
            normParams: function (params) {
                params = S.clone(params);
                for (var p in params) {

                    var v = params[p];
                    if (S.isFunction(v)) {
                        params[p] = v();
                    }

                }
                return params;
            },

            /**
             *
             */
            map: function (arr, callback) {
                for (var i = 0; i < arr.length; i++) {
                    arr[i] = callback(arr[i]);
                }
                return arr;
            },

            //直接判断引擎，防止兼容性模式影响
            ieEngine: document['documentMode'] || UA['ie'],

            /**
             * 点击 el 或者 el 内的元素，不会使得焦点转移
             * @param el
             */
            preventFocus: function (el) {
                if (UA['ie']) {
                    //ie 点击按钮不丢失焦点
                    el.unselectable(undefined);
                } else {
                    el.attr("onmousedown", "return false;");
                }
            },

            /**
             *
             */
            injectDom: function (editorDom) {
                S.mix(DOM, editorDom);
                for (var dm in editorDom) {
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

            /**
             *
             */
            addRes: function () {
                this.__res = this.__res || [];
                var res = this.__res;
                res.push.apply(res, S.makeArray(arguments));
            },

            /**
             *
             */
            destroyRes: function () {
                var res = this.__res || [];
                for (var i = 0; i < res.length; i++) {
                    var r = res[i];
                    if (S.isFunction(r)) {
                        r();
                    } else {
                        if (r.destroy) {
                            r.destroy();
                        }
                        else if (r.remove) {
                            r.remove();
                        }
                    }
                }
                this.__res = [];
            },

            /**
             *
             */
            getQueryCmd: function (cmd) {
                return "query" + ("-" + cmd).replace(/-(\w)/g, function (m, m1) {
                    return m1.toUpperCase()
                }) + "Value";
            }
        };

    Editor.Utils = Utils;

    return Utils;
}, {
    requires: ['./base']
});
