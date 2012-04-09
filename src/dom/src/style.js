/**
 * @fileOverview   dom/style
 * @author  yiminghe@gmail.com,lifesinger@gmail.com
 */
KISSY.add('dom/style', function (S, DOM, UA, undefined) {
    "use strict";
    var WINDOW = S.Env.host,
        doc = WINDOW.document,
        docElem = doc.documentElement,
        isIE = UA['ie'],
        STYLE = 'style',
        FLOAT = 'float',
        CSS_FLOAT = 'cssFloat',
        STYLE_FLOAT = 'styleFloat',
        WIDTH = 'width',
        HEIGHT = 'height',
        AUTO = 'auto',
        DISPLAY = 'display',
        OLD_DISPLAY = DISPLAY + S.now(),
        NONE = 'none',
        PARSEINT = parseInt,
        RE_NUMPX = /^-?\d+(?:px)?$/i,
        cssNumber = {
            "fillOpacity":1,
            "fontWeight":1,
            "lineHeight":1,
            "opacity":1,
            "orphans":1,
            "widows":1,
            "zIndex":1,
            "zoom":1
        },
        rmsPrefix = /^-ms-/,
        RE_DASH = /-([a-z])/ig,
        CAMELCASE_FN = function (all, letter) {
            return letter.toUpperCase();
        },
        // 考虑 ie9 ...
        rupper = /([A-Z]|^ms)/g,
        EMPTY = '',
        DEFAULT_UNIT = 'px',
        CUSTOM_STYLES = {},
        cssProps = {},
        defaultDisplay = {};

    // normalize reserved word float alternatives ("cssFloat" or "styleFloat")
    if (docElem[STYLE][CSS_FLOAT] !== undefined) {
        cssProps[FLOAT] = CSS_FLOAT;
    }
    else if (docElem[STYLE][STYLE_FLOAT] !== undefined) {
        cssProps[FLOAT] = STYLE_FLOAT;
    }

    function camelCase(name) {
        // fix #92, ms!
        return name.replace(rmsPrefix, "ms-").replace(RE_DASH, CAMELCASE_FN);
    }

    var defaultDisplayDetectIframe,
        defaultDisplayDetectIframeDoc;

    // modified from jquery : bullet-proof method of getting default display
    // fix domain problem in ie>6 , ie6 still access denied
    function getDefaultDisplay(tagName) {
        var body,
            elem;
        if (!defaultDisplay[ tagName ]) {
            body = doc.body || doc.documentElement;
            elem = doc.createElement(tagName);
            DOM.prepend(elem, body);
            var oldDisplay = DOM.css(elem, "display");
            body.removeChild(elem);
            // If the simple way fails,
            // get element's real default display by attaching it to a temp iframe
            if (oldDisplay === "none" || oldDisplay === "") {
                // No iframe to use yet, so create it
                if (!defaultDisplayDetectIframe) {
                    defaultDisplayDetectIframe = doc.createElement("iframe");

                    defaultDisplayDetectIframe.frameBorder =
                        defaultDisplayDetectIframe.width =
                            defaultDisplayDetectIframe.height = 0;

                    DOM.prepend(defaultDisplayDetectIframe, body);
                    var iframeSrc;
                    if (iframeSrc = DOM._genEmptyIframeSrc()) {
                        defaultDisplayDetectIframe.src = iframeSrc;
                    }
                } else {
                    DOM.prepend(defaultDisplayDetectIframe, body);
                }

                // Create a cacheable copy of the iframe document on first call.
                // IE and Opera will allow us to reuse the iframeDoc without re-writing the fake HTML
                // document to it; WebKit & Firefox won't allow reusing the iframe document.
                if (!defaultDisplayDetectIframeDoc || !defaultDisplayDetectIframe.createElement) {

                    try {
                        defaultDisplayDetectIframeDoc = defaultDisplayDetectIframe.contentWindow.document;
                        defaultDisplayDetectIframeDoc.write(( doc.compatMode === "CSS1Compat" ? "<!doctype html>" : "" )
                            + "<html><head>" +
                            (UA['ie'] && DOM._isCustomDomain() ?
                                "<script>document.domain = '" +
                                    doc.domain
                                    + "';</script>" : "")
                            +
                            "</head><body>");
                        defaultDisplayDetectIframeDoc.close();
                    } catch (e) {
                        // ie6 need a breath , such as alert(8) or setTimeout;
                        // 同时需要同步，所以无解，勉强返回
                        return "block";
                    }
                }

                elem = defaultDisplayDetectIframeDoc.createElement(tagName);

                defaultDisplayDetectIframeDoc.body.appendChild(elem);

                oldDisplay = DOM.css(elem, "display");

                body.removeChild(defaultDisplayDetectIframe);
            }

            // Store the correct default display
            defaultDisplay[ tagName ] = oldDisplay;
        }

        return defaultDisplay[ tagName ];
    }

    S.mix(DOM,
        /**
         * @lends DOM
         */
        {
            _camelCase:camelCase,
            // _cssNumber:cssNumber,
            _CUSTOM_STYLES:CUSTOM_STYLES,
            _cssProps:cssProps,
            _getComputedStyle:function (elem, name) {
                var val = "",
                    computedStyle,
                    d = elem.ownerDocument;

                name = name.replace(rupper, "-$1").toLowerCase();

                // https://github.com/kissyteam/kissy/issues/61
                if (computedStyle = d.defaultView.getComputedStyle(elem, null)) {
                    val = computedStyle.getPropertyValue(name) || computedStyle[name];
                }

                // 还没有加入到 document，就取行内
                if (val == "" && !DOM.contains(d.documentElement, elem)) {
                    name = cssProps[name] || name;
                    val = elem[STYLE][name];
                }

                return val;
            },

            /**
             *  Get inline style property from the first element of matched elements
             *  or
             *  Set one or more CSS properties for the set of matched elements.
             *  @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             *  @param {String|Object} name A CSS property. or A map of property-value pairs to set.
             *  @param [val] A value to set for the property.
             *  @returns {undefined|String}
             */
            style:function (selector, name, val) {
                var els = DOM.query(selector), elem = els[0], i;
                // supports hash
                if (S.isPlainObject(name)) {
                    for (var k in name) {
                        for (i = els.length - 1; i >= 0; i--) {
                            style(els[i], k, name[k]);
                        }
                    }
                    return undefined;
                }
                if (val === undefined) {
                    var ret = '';
                    if (elem) {
                        ret = style(elem, name, val);
                    }
                    return ret;
                } else {
                    for (i = els.length - 1; i >= 0; i--) {
                        style(els[i], name, val);
                    }
                }
                return undefined;
            },

            /**
             * Get the computed value of a style property for the first element in the set of matched elements.
             * or
             * Set one or more CSS properties for the set of matched elements.
             * @param {HTMLElement[]|String|HTMLElement|Element} selector 选择器或节点或节点数组
             * @param {String|Object} name A CSS property. or A map of property-value pairs to set.
             * @param [val] A value to set for the property.
             * @returns {undefined|String}
             */
            css:function (selector, name, val) {
                var els = DOM.query(selector),
                    elem = els[0],
                    i;
                // supports hash
                if (S.isPlainObject(name)) {
                    for (var k in name) {
                        for (i = els.length - 1; i >= 0; i--) {
                            style(els[i], k, name[k]);
                        }
                    }
                    return undefined;
                }

                name = camelCase(name);
                var hook = CUSTOM_STYLES[name];
                // getter
                if (val === undefined) {
                    // supports css selector/Node/NodeList
                    var ret = '';
                    if (elem) {
                        // If a hook was provided get the computed value from there
                        if (hook && "get" in hook && (ret = hook.get(elem, true)) !== undefined) {
                        } else {
                            ret = DOM._getComputedStyle(elem, name);
                        }
                    }
                    return ret === undefined ? '' : ret;
                }
                // setter
                else {
                    for (i = els.length - 1; i >= 0; i--) {
                        style(els[i], name, val);
                    }
                }
                return undefined;
            },

            /**
             * Display the matched elements.
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements.
             */
            show:function (selector) {
                var els = DOM.query(selector), elem, i;
                for (i = els.length - 1; i >= 0; i--) {
                    elem = els[i];
                    elem[STYLE][DISPLAY] = DOM.data(elem, OLD_DISPLAY) || EMPTY;

                    // 可能元素还处于隐藏状态，比如 css 里设置了 display: none
                    if (DOM.css(elem, DISPLAY) === NONE) {
                        var tagName = elem.tagName.toLowerCase(),
                            old = getDefaultDisplay(tagName);
                        DOM.data(elem, OLD_DISPLAY, old);
                        elem[STYLE][DISPLAY] = old;
                    }
                }
            },

            /**
             * Hide the matched elements.
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements.
             */
            hide:function (selector) {
                var els = DOM.query(selector), elem, i;
                for (i = els.length - 1; i >= 0; i--) {
                    elem = els[i];
                    var style = elem[STYLE], old = style[DISPLAY];
                    if (old !== NONE) {
                        if (old) {
                            DOM.data(elem, OLD_DISPLAY, old);
                        }
                        style[DISPLAY] = NONE;
                    }
                }
            },

            /**
             * Display or hide the matched elements.
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements.
             */
            toggle:function (selector) {
                var els = DOM.query(selector), elem, i;
                for (i = els.length - 1; i >= 0; i--) {
                    elem = els[i];
                    if (DOM.css(elem, DISPLAY) === NONE) {
                        DOM.show(elem);
                    } else {
                        DOM.hide(elem);
                    }
                }
            },

            /**
             * Creates a stylesheet from a text blob of rules.
             * These rules will be wrapped in a STYLE tag and appended to the HEAD of the document.
             * @param {window} [refWin=window] Window which will accept this stylesheet
             * @param {String} cssText The text containing the css rules
             * @param {String} [id] An id to add to the stylesheet for later removal
             */
            addStyleSheet:function (refWin, cssText, id) {
                refWin = refWin || WINDOW;
                if (S.isString(refWin)) {
                    id = cssText;
                    cssText = refWin;
                    refWin = WINDOW;
                }
                refWin = DOM.get(refWin);
                var win = DOM._getWin(refWin),
                    doc = win.document,
                    elem;

                if (id && (id = id.replace('#', EMPTY))) {
                    elem = DOM.get('#' + id, doc);
                }

                // 仅添加一次，不重复添加
                if (elem) {
                    return;
                }

                elem = DOM.create('<style>', { id:id }, doc);

                // 先添加到 DOM 树中，再给 cssText 赋值，否则 css hack 会失效
                DOM.get('head', doc).appendChild(elem);

                if (elem.styleSheet) { // IE
                    elem.styleSheet.cssText = cssText;
                } else { // W3C
                    elem.appendChild(doc.createTextNode(cssText));
                }
            },

            /**
             * Make matched elements unselectable
             * @param {HTMLElement[]|String|HTMLElement} selector  Matched elements.
             */
            unselectable:function (selector) {
                var _els = DOM.query(selector), elem, j;
                for (j = _els.length - 1; j >= 0; j--) {
                    elem = _els[j];
                    if (UA['gecko']) {
                        elem[STYLE]['MozUserSelect'] = 'none';
                    }
                    else if (UA['webkit']) {
                        elem[STYLE]['KhtmlUserSelect'] = 'none';
                    } else {
                        if (UA['ie'] || UA['opera']) {
                            var e, i = 0,
                                els = elem.getElementsByTagName("*");
                            elem.setAttribute("unselectable", 'on');
                            while (( e = els[ i++ ] )) {
                                switch (e.tagName.toLowerCase()) {
                                    case 'iframe' :
                                    case 'textarea' :
                                    case 'input' :
                                    case 'select' :
                                        /* Ignore the above tags */
                                        break;
                                    default :
                                        e.setAttribute("unselectable", 'on');
                                }
                            }
                        }
                    }
                }
            },

            /**
             * Get the current computed width for the first element in the set of matched elements, including padding but not border.
             * @function
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @returns {Number}
             */
            innerWidth:0,
            /**
             * Get the current computed height for the first element in the set of matched elements, including padding but not border.
             * @function
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @returns {Number}
             */
            innerHeight:0,
            /**
             *  Get the current computed width for the first element in the set of matched elements, including padding and border, and optionally margin.
             * @function
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {Boolean} [includeMargin] A Boolean indicating whether to include the element's margin in the calculation.
             * @returns {Number}
             */
            outerWidth:0,
            /**
             * Get the current computed height for the first element in the set of matched elements, including padding, border, and optionally margin.
             * @function
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {Boolean} [includeMargin] A Boolean indicating whether to include the element's margin in the calculation.
             * @returns {Number}
             */
            outerHeight:0,
            /**
             * Get the current computed width for the first element in the set of matched elements.
             * or
             * Set the CSS width of each element in the set of matched elements.
             * @function
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {String|Number} [value]
             * An integer representing the number of pixels, or an integer along with an optional unit of measure appended (as a string).
             * @returns {Number|undefined}
             */
            width:0,
            /**
             * Get the current computed height for the first element in the set of matched elements.
             * or
             * Set the CSS height of each element in the set of matched elements.
             * @function
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {String|Number} [value]
             * An integer representing the number of pixels, or an integer along with an optional unit of measure appended (as a string).
             * @returns {Number|undefined}
             */
            height:0
        });

    function capital(str) {
        return str.charAt(0).toUpperCase() + str.substring(1);
    }

    S.each([WIDTH, HEIGHT], function (name) {
        DOM["inner" + capital(name)] = function (selector) {
            var el = DOM.get(selector);
            return el && getWHIgnoreDisplay(el, name, "padding");
        };

        DOM["outer" + capital(name)] = function (selector, includeMargin) {
            var el = DOM.get(selector);
            return el && getWHIgnoreDisplay(el, name, includeMargin ? "margin" : "border");
        };

        DOM[name] = function (selector, val) {
            var ret = DOM.css(selector, name, val);
            if (ret) {
                ret = parseFloat(ret);
            }
            return ret;
        };
    });

    var cssShow = { position:"absolute", visibility:"hidden", display:"block" };

    /*
     css height,width 永远都是计算值
     */
    S.each(["height", "width"], function (name) {
        /**
         * @ignore
         */
        CUSTOM_STYLES[ name ] = {
            /**
             * @ignore
             */
            get:function (elem, computed) {
                if (computed) {
                    return getWHIgnoreDisplay(elem, name) + "px";
                }
            },
            set:function (elem, value) {
                if (RE_NUMPX.test(value)) {
                    value = parseFloat(value);
                    if (value >= 0) {
                        return value + "px";
                    }
                } else {
                    return value;
                }
            }
        };
    });

    S.each(["left", "top"], function (name) {
        /**
         * @ignore
         */
        CUSTOM_STYLES[ name ] = {
            get:function (elem, computed) {
                if (computed) {
                    var val = DOM._getComputedStyle(elem, name), offset;

                    // 1. 当没有设置 style.left 时，getComputedStyle 在不同浏览器下，返回值不同
                    //    比如：firefox 返回 0, webkit/ie 返回 auto
                    // 2. style.left 设置为百分比时，返回值为百分比
                    // 对于第一种情况，如果是 relative 元素，值为 0. 如果是 absolute 元素，值为 offsetLeft - marginLeft
                    // 对于第二种情况，大部分类库都未做处理，属于“明之而不 fix”的保留 bug
                    if (val === AUTO) {
                        val = 0;
                        if (S.inArray(DOM.css(elem, 'position'), ['absolute', 'fixed'])) {
                            offset = elem[name === 'left' ? 'offsetLeft' : 'offsetTop'];

                            // old-ie 下，elem.offsetLeft 包含 offsetParent 的 border 宽度，需要减掉
                            if (isIE && doc['documentMode'] != 9 || UA['opera']) {
                                // 类似 offset ie 下的边框处理
                                // 如果 offsetParent 为 html ，需要减去默认 2 px == documentElement.clientTop
                                // 否则减去 borderTop 其实也是 clientTop
                                // http://msdn.microsoft.com/en-us/library/aa752288%28v=vs.85%29.aspx
                                // ie<9 注意有时候 elem.offsetParent 为 null ...
                                // 比如 DOM.append(DOM.create("<div class='position:absolute'></div>"),document.body)
                                offset -= elem.offsetParent && elem.offsetParent['client' + (name == 'left' ? 'Left' : 'Top')]
                                    || 0;
                            }
                            val = offset - (PARSEINT(DOM.css(elem, 'margin-' + name)) || 0);
                        }
                        val += "px";
                    }
                    return val;
                }
            }
        };
    });

    function swap(elem, options, callback) {
        var old = {};

        // Remember the old values, and insert the new ones
        for (var name in options) {
            old[ name ] = elem[STYLE][ name ];
            elem[STYLE][ name ] = options[ name ];
        }

        callback.call(elem);

        // Revert the old values
        for (name in options) {
            elem[STYLE][ name ] = old[ name ];
        }
    }

    function style(elem, name, val) {
        var style;
        if (elem.nodeType === 3 || elem.nodeType === 8 || !(style = elem[STYLE])) {
            return undefined;
        }
        name = camelCase(name);
        var ret, hook = CUSTOM_STYLES[name];
        name = cssProps[name] || name;
        // setter
        if (val !== undefined) {
            // normalize unsetting
            if (val === null || val === EMPTY) {
                val = EMPTY;
            }
            // number values may need a unit
            else if (!isNaN(Number(val)) && !cssNumber[name]) {
                val += DEFAULT_UNIT;
            }
            if (hook && hook.set) {
                val = hook.set(elem, val);
            }
            if (val !== undefined) {
                // ie 无效值报错
                try {
                    style[name] = val;
                } catch (e) {
                    S.log("css set error :" + e);
                }
                // #80 fix,font-family
                if (val === EMPTY && style.removeAttribute) {
                    style.removeAttribute(name);
                }
            }
            if (!style.cssText) {
                elem.removeAttribute('style');
            }
            return undefined;
        }
        //getter
        else {
            // If a hook was provided get the non-computed value from there
            if (hook && "get" in hook && (ret = hook.get(elem, false)) !== undefined) {

            } else {
                // Otherwise just get the value from the style object
                ret = style[ name ];
            }
            return ret === undefined ? "" : ret;
        }
    }

    // fix #119 : https://github.com/kissyteam/kissy/issues/119
    function getWHIgnoreDisplay(elem) {
        var val, args = arguments;
        // incase elem is window
        // elem.offsetWidth === undefined
        if (elem.offsetWidth !== 0) {
            val = getWH.apply(undefined, args);
        } else {
            swap(elem, cssShow, function () {
                val = getWH.apply(undefined, args);
            });
        }
        return val;
    }


    /**
     * 得到元素的大小信息
     * @param elem
     * @param name
     * @param {String} [extra]  "padding" : (css width) + padding
     *                          "border" : (css width) + padding + border
     *                          "margin" : (css width) + padding + border + margin
     */
    function getWH(elem, name, extra) {
        if (S.isWindow(elem)) {
            return name == WIDTH ? DOM.viewportWidth(elem) : DOM.viewportHeight(elem);
        } else if (elem.nodeType == 9) {
            return name == WIDTH ? DOM.docWidth(elem) : DOM.docHeight(elem);
        }
        var which = name === WIDTH ? ['Left', 'Right'] : ['Top', 'Bottom'],
            val = name === WIDTH ? elem.offsetWidth : elem.offsetHeight;

        if (val > 0) {
            if (extra !== "border") {
                S.each(which, function (w) {
                    if (!extra) {
                        val -= parseFloat(DOM.css(elem, "padding" + w)) || 0;
                    }
                    if (extra === "margin") {
                        val += parseFloat(DOM.css(elem, extra + w)) || 0;
                    } else {
                        val -= parseFloat(DOM.css(elem, "border" + w + "Width")) || 0;
                    }
                });
            }

            return val;
        }

        // Fall back to computed then uncomputed css if necessary
        val = DOM._getComputedStyle(elem, name);
        if (val == null || (Number(val)) < 0) {
            val = elem.style[ name ] || 0;
        }
        // Normalize "", auto, and prepare for extra
        val = parseFloat(val) || 0;

        // Add padding, border, margin
        if (extra) {
            S.each(which, function (w) {
                val += parseFloat(DOM.css(elem, "padding" + w)) || 0;
                if (extra !== "padding") {
                    val += parseFloat(DOM.css(elem, "border" + w + "Width")) || 0;
                }
                if (extra === "margin") {
                    val += parseFloat(DOM.css(elem, extra + w)) || 0;
                }
            });
        }

        return val;
    }

    return DOM;
}, {
    requires:["dom/base", "ua"]
});

/**
 * 2011-12-21
 *  - backgroundPositionX, backgroundPositionY firefox/w3c 不支持
 *  - w3c 为准，这里不 fix 了
 *
 *
 * 2011-08-19
 *  - 调整结构，减少耦合
 *  - fix css("height") == auto
 *
 * NOTES:
 *  - Opera 下，color 默认返回 #XXYYZZ, 非 rgb(). 目前 jQuery 等类库均忽略此差异，KISSY 也忽略。
 *  - Safari 低版本，transparent 会返回为 rgba(0, 0, 0, 0), 考虑低版本才有此 bug, 亦忽略。
 *
 *
 *  - getComputedStyle 在 webkit 下，会舍弃小数部分，ie 下会四舍五入，gecko 下直接输出 float 值。
 *
 *  - color: blue 继承值，getComputedStyle, 在 ie 下返回 blue, opera 返回 #0000ff, 其它浏览器
 *    返回 rgb(0, 0, 255)
 *
 *  - 总之：要使得返回值完全一致是不大可能的，jQuery/ExtJS/KISSY 未“追求完美”。YUI3 做了部分完美处理，但
 *    依旧存在浏览器差异。
 */
