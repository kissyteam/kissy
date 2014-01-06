/**
 * @ignore
 * common utils for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Node = require('node');
    var Editor = require('./base');
    var TRUE = true,
        FALSE = false,
        NULL = null,
        Dom = S.DOM,
        UA = S.UA,

        /**
         * Utilities for Editor.
         * @class KISSY.Editor.Utils
         * @singleton
         */
            Utils = {
            debugUrl: function (url) {
                var Config = S.Config;
                if (!Config.debug) {
                    url = url.replace(/\.(js|css)/i, '-min.$1');
                }
                if (url.indexOf('?t') === -1) {
                    if (url.indexOf('?') !== -1) {
                        url += '&';
                    } else {
                        url += '?';
                    }
                    url += 't=' + encodeURIComponent(Config.tag);
                }
                return S.config('base') + 'editor/' + url;
            },

            lazyRun: function (obj, before, after) {
                var b = obj[before], a = obj[after];
                obj[before] = function () {
                    b.apply(this, arguments);
                    obj[before] = obj[after];
                    return a.apply(this, arguments);
                };
            },

            getXY: function (offset, editor) {
                var x = offset.left,
                    y = offset.top,
                    currentWindow = editor.get('window')[0];
                //x,y相对于当前iframe文档,防止当前iframe有滚动条
                x -= Dom.scrollLeft(currentWindow);
                y -= Dom.scrollTop(currentWindow);

                //note:when iframe is static ,still some mistake
                var iframePosition = editor.get('iframe').offset();
                x += iframePosition.left;
                y += iframePosition.top;

                return {left: x, top: y};
            },

            tryThese: function () {
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

            clearAllMarkers: function (database) {
                for (var i in database) {
                    database[i]._4eClearMarkers(database, TRUE, undefined);
                }
            },

            ltrim: function (str) {
                return str.replace(/^\s+/, '');
            },

            rtrim: function (str) {
                return str.replace(/\s+$/, '');
            },

            isNumber: function (n) {
                return (/^\d+(.\d+)?$/).test(S.trim(n));
            },

            verifyInputs: function (inputs) {
                for (var i = 0; i < inputs.length; i++) {
                    var input = new Node(inputs[i]),
                        v = S.trim(Utils.valInput(input)),
                        verify = input.attr('data-verify'),
                        warning = input.attr('data-warning');
                    if (verify && !new RegExp(verify).test(v)) {
                        /*global alert*/
                        alert(warning);
                        return FALSE;
                    }
                }
                return TRUE;
            },

            sourceDisable: function (editor, plugin) {
                editor.on('sourceMode', plugin.disable, plugin);
                editor.on('wysiwygMode', plugin.enable, plugin);
            },

            resetInput: function (inp) {
                var placeholder = inp.attr('placeholder');
                if (placeholder && UA.ie) {
                    inp.addClass('ks-editor-input-tip');
                    inp.val(placeholder);
                } else if (!UA.ie) {
                    inp.val('');
                }
            },

            valInput: function (inp, val) {
                if (val === undefined) {
                    if (inp.hasClass('ks-editor-input-tip')) {
                        return '';
                    } else {
                        return inp.val();
                    }
                } else {
                    inp.removeClass('ks-editor-input-tip');
                    inp.val(val);
                }
                return undefined;
            },

            placeholder: function (inp, tip) {
                inp.attr('placeholder', tip);
                if (!UA.ie) {
                    return;
                }
                inp.on('blur', function () {
                    if (!S.trim(inp.val())) {
                        inp.addClass('ks-editor-input-tip');
                        inp.val(tip);
                    }
                });
                inp.on('focus', function () {
                    inp.removeClass('ks-editor-input-tip');
                    if (S.trim(inp.val()) === tip) {
                        inp.val('');
                    }
                });
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
                    if (typeof v === 'function') {
                        params[p] = v();
                    }

                }
                return params;
            },

            /**
             * 点击 el 或者 el 内的元素，不会使得焦点转移
             * @param el
             */
            preventFocus: function (el) {
                if (UA.ie) {
                    //ie 点击按钮不丢失焦点
                    el.unselectable();
                } else {
                    el.attr('onmousedown', 'return false;');
                }
            },

            injectDom: function (editorDom) {
                S.mix(Dom, editorDom);
                for (var dm in editorDom) {
                    /*jshint loopfunc:true*/
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

            addRes: function () {
                this.__res = this.__res || [];
                var res = this.__res;
                res.push.apply(res, S.makeArray(arguments));
            },

            destroyRes: function () {
                var res = this.__res || [];
                for (var i = 0; i < res.length; i++) {
                    var r = res[i];
                    if (typeof r === 'function') {
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

            getQueryCmd: function (cmd) {
                return 'query' + ('-' + cmd).replace(/-(\w)/g, function (m, m1) {
                    return m1.toUpperCase();
                }) + 'Value';
            }
        };

    Editor.Utils = Utils;

    return Utils;
});
