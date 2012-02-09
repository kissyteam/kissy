/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Feb 9 10:58
*/
/**
 * @fileOverview   dom-attr
 * @author  yiminghe@gmail.com,lifesinger@gmail.com
 */
KISSY.add('dom/attr', function (S, DOM, UA, undefined) {

        var doc = document,
            docElement = doc.documentElement,
            oldIE = !docElement.hasAttribute,
            TEXT = docElement.textContent === undefined ?
                'innerText' : 'textContent',
            EMPTY = '',
            nodeName = DOM._nodeName,
            isElementNode = DOM._isElementNode,
            rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,
            rfocusable = /^(?:button|input|object|select|textarea)$/i,
            rclickable = /^a(?:rea)?$/i,
            rinvalidChar = /:|^on/,
            rreturn = /\r/g,
            attrFix = {
            },
            attrFn = {
                val:1,
                css:1,
                html:1,
                text:1,
                data:1,
                width:1,
                height:1,
                offset:1,
                scrollTop:1,
                scrollLeft:1
            },
            attrHooks = {
                // http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
                tabindex:{
                    get:function (el) {
                        // elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
                        var attributeNode = el.getAttributeNode("tabindex");
                        return attributeNode && attributeNode.specified ?
                            parseInt(attributeNode.value, 10) :
                            rfocusable.test(el.nodeName) || rclickable.test(el.nodeName) && el.href ?
                                0 :
                                undefined;
                    }
                },
                // 在标准浏览器下，用 getAttribute 获取 style 值
                // IE7- 下，需要用 cssText 来获取
                // 统一使用 cssText
                style:{
                    get:function (el) {
                        return el.style.cssText;
                    },
                    set:function (el, val) {
                        el.style.cssText = val;
                    }
                }
            },
            propFix = {
                "hidefocus":"hideFocus",
                tabindex:"tabIndex",
                readonly:"readOnly",
                "for":"htmlFor",
                "class":"className",
                maxlength:"maxLength",
                cellspacing:"cellSpacing",
                "cellpadding":"cellPadding",
                rowspan:"rowSpan",
                colspan:"colSpan",
                usemap:"useMap",
                frameborder:"frameBorder",
                "contenteditable":"contentEditable"
            },
            // Hook for boolean attributes
            // if bool is false
            //  - standard browser returns null
            //  - ie<8 return false
            //   - so norm to undefined
            boolHook = {
                get:function (elem, name) {
                    // 转发到 prop 方法
                    return DOM.prop(elem, name) ?
                        // 根据 w3c attribute , true 时返回属性名字符串
                        name.toLowerCase() :
                        undefined;
                },
                set:function (elem, value, name) {
                    var propName;
                    if (value === false) {
                        // Remove boolean attributes when set to false
                        DOM.removeAttr(elem, name);
                    } else {
                        // 直接设置 true,因为这是 bool 类属性
                        propName = propFix[ name ] || name;
                        if (propName in elem) {
                            // Only set the IDL specifically if it already exists on the element
                            elem[ propName ] = true;
                        }
                        elem.setAttribute(name, name.toLowerCase());
                    }
                    return name;
                }
            },
            propHooks = {},
            // get attribute value from attribute node , only for ie
            attrNodeHook = {
            },
            valHooks = {
                option:{
                    get:function (elem) {
                        // 当没有设定 value 时，标准浏览器 option.value === option.text
                        // ie7- 下，没有设定 value 时，option.value === '', 需要用 el.attributes.value 来判断是否有设定 value
                        var val = elem.attributes.value;
                        return !val || val.specified ? elem.value : elem.text;
                    }
                },
                select:{
                    // 对于 select, 特别是 multiple type, 存在很严重的兼容性问题
                    get:function (elem) {
                        var index = elem.selectedIndex,
                            options = elem.options,
                            one = elem.type === "select-one";

                        // Nothing was selected
                        if (index < 0) {
                            return null;
                        } else if (one) {
                            return DOM.val(options[index]);
                        }

                        // Loop through all the selected options
                        var ret = [], i = 0, len = options.length;
                        for (; i < len; ++i) {
                            if (options[i].selected) {
                                ret.push(DOM.val(options[i]));
                            }
                        }
                        // Multi-Selects return an array
                        return ret;
                    },

                    set:function (elem, value) {
                        var values = S.makeArray(value),
                            opts = elem.options;
                        S.each(opts, function (opt) {
                            opt.selected = S.inArray(DOM.val(opt), values);
                        });

                        if (!values.length) {
                            elem.selectedIndex = -1;
                        }
                        return values;
                    }
                }};

        function isTextNode(elem) {
            return DOM._nodeTypeIs(elem, DOM.TEXT_NODE);
        }

        if (oldIE) {

            // get attribute value from attribute node for ie
            attrNodeHook = {
                get:function (elem, name) {
                    var ret;
                    ret = elem.getAttributeNode(name);
                    // Return undefined if nodeValue is empty string
                    return ret && ret.nodeValue !== "" ?
                        ret.nodeValue :
                        undefined;
                },
                set:function (elem, value, name) {
                    // Check form objects in IE (multiple bugs related)
                    // Only use nodeValue if the attribute node exists on the form
                    var ret = elem.getAttributeNode(name);
                    if (ret) {
                        ret.nodeValue = value;
                    } else {
                        try {
                            var attr = elem.ownerDocument.createAttribute(name);
                            attr.value = value;
                            elem.setAttributeNode(attr);
                        }
                        catch (e) {
                            // It's a real failure only if setAttribute also fails.
                            // http://msdn.microsoft.com/en-us/library/ms536739(v=vs.85).aspx
                            // 0 : Match sAttrName regardless of case.
                            return elem.setAttribute(name, value, 0);
                        }
                    }
                }
            };


            // ie6,7 不区分 attribute 与 property
            attrFix = propFix;
            // http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
            attrHooks.tabIndex = attrHooks.tabindex;
            // fix ie bugs
            // 不光是 href, src, 还有 rowspan 等非 mapping 属性，也需要用第 2 个参数来获取原始值
            // 注意 colSpan rowSpan 已经由 propFix 转为大写
            S.each([ "href", "src", "width", "height", "colSpan", "rowSpan" ], function (name) {
                attrHooks[ name ] = {
                    get:function (elem) {
                        var ret = elem.getAttribute(name, 2);
                        return ret === null ? undefined : ret;
                    }
                };
            });
            // button 元素的 value 属性和其内容冲突
            // <button value='xx'>zzz</button>
            valHooks.button = attrHooks.value = attrNodeHook;
        }

        // Radios and checkboxes getter/setter

        S.each([ "radio", "checkbox" ], function (r) {
            valHooks[ r ] = {
                get:function (elem) {
                    // Handle the case where in Webkit "" is returned instead of "on" if a value isn't specified
                    return elem.getAttribute("value") === null ? "on" : elem.value;
                },
                set:function (elem, value) {
                    if (S.isArray(value)) {
                        return elem.checked = S.inArray(DOM.val(elem), value);
                    }
                }

            };
        });

        function getProp(elem, name) {
            name = propFix[ name ] || name;
            var hook = propHooks[ name ];
            if (hook && hook.get) {
                return hook.get(elem, name);

            } else {
                return elem[ name ];
            }
        }

        S.mix(DOM,
            /**
             * @lends DOM
             */
            {

                /**
                 * 读取第一个元素/设置全部元素 property，自定义属性不推荐使用，使用 .data
                 * @param {Array<HTMLElement>|String} selector 元素集合
                 * @param {String} name 属性名
                 * @param [value] 属性值
                 */
                prop:function (selector, name, value) {
                    var elems = DOM.query(selector);

                    // supports hash
                    if (S.isPlainObject(name)) {
                        for (var k in name) {
                            DOM.prop(elems, k, name[k]);
                        }
                        return;
                    }

                    // Try to normalize/fix the name
                    name = propFix[ name ] || name;
                    var hook = propHooks[ name ];
                    if (value !== undefined) {
                        for (var i = elems.length - 1; i >= 0; i--) {
                            var elem = elems[i];
                            if (hook && hook.set) {
                                hook.set(elem, value, name);
                            } else {
                                elem[ name ] = value;
                            }
                        }
                    } else {
                        if (elems.length) {
                            return getProp(elems[0], name);
                        }
                    }
                },

                /**
                 * 是否其中一个元素包含指定 property
                 * @param {Array<HTMLElement>|String} selector 元素
                 * @param {String} name 属性名
                 * @return {boolean} 元素集合中是否有一个元素存在该属性
                 */
                hasProp:function (selector, name) {
                    var elems = DOM.query(selector);
                    for (var i = 0; i < elems.length; i++) {
                        var el = elems[i];
                        if (getProp(el, name) !== undefined) {
                            return true;
                        }
                    }
                    return false;
                },

                /**
                 * 删除元素指定的 property
                 * 不推荐使用，使用 .data .removeData
                 * @param {Array<HTMLElement>|String} selector 元素集合
                 * @param {String} name 属性名
                 */
                removeProp:function (selector, name) {
                    name = propFix[ name ] || name;
                    var elems = DOM.query(selector);
                    for (var i = elems.length - 1; i >= 0; i--) {
                        var el = elems[i];
                        try {
                            el[ name ] = undefined;
                            delete el[ name ];
                        } catch (e) {
                            // S.log("delete el property error : ");
                            // S.log(e);
                        }
                    }
                },

                /**
                 * 获取元素集合第一个元素的属性值或者设置全部元素对应属性名的属性值
                 * @param {HTMLElement[]|HTMLElement|String|Element} selector 元素集合
                 * @param {String|Object} name 属性名或属性键值对
                 * @param [val] 属性值
                 */
                attr:function (selector, name, val, pass) {
                    /*
                     Hazards From Caja Note:

                     - In IE[67], el.setAttribute doesn't work for attributes like
                     'class' or 'for'.  IE[67] expects you to set 'className' or
                     'htmlFor'.  Caja use setAttributeNode solves this problem.

                     - In IE[67], <input> elements can shadow attributes.  If el is a
                     form that contains an <input> named x, then el.setAttribute(x, y)
                     will set x's value rather than setting el's attribute.  Using
                     setAttributeNode solves this problem.

                     - In IE[67], the style attribute can only be modified by setting
                     el.style.cssText.  Neither setAttribute nor setAttributeNode will
                     work.  el.style.cssText isn't bullet-proof, since it can be
                     shadowed by <input> elements.

                     - In IE[67], you can never change the type of an <button> element.
                     setAttribute('type') silently fails, but setAttributeNode
                     throws an exception.  caja : the silent failure. KISSY throws error.

                     - In IE[67], you can never change the type of an <input> element.
                     setAttribute('type') throws an exception.  We want the exception.

                     - In IE[67], setAttribute is case-sensitive, unless you pass 0 as a
                     3rd argument.  setAttributeNode is case-insensitive.

                     - Trying to set an invalid name like ":" is supposed to throw an
                     error.  In IE[678] and Opera 10, it fails without an error.
                     */

                    var els = DOM.query(selector);

                    // supports hash
                    if (S.isPlainObject(name)) {
                        pass = val;
                        for (var k in name) {
                            if (name.hasOwnProperty(k)) {
                                DOM.attr(els, k, name[k], pass);
                            }
                        }
                        return;
                    }

                    if (!(name = S.trim(name))) {
                        return;
                    }

                    // attr functions
                    if (pass && attrFn[name]) {
                        return DOM[name](selector, val);
                    }

                    // scrollLeft
                    name = name.toLowerCase();

                    if (pass && attrFn[name]) {
                        return DOM[name](selector, val);
                    }

                    // custom attrs
                    name = attrFix[name] || name;

                    var attrNormalizer,
                        el = els[0],
                        ret;

                    if (rboolean.test(name)) {
                        attrNormalizer = boolHook;
                    }
                    // only old ie?
                    else if (rinvalidChar.test(name)) {
                        attrNormalizer = attrNodeHook;
                    } else {
                        attrNormalizer = attrHooks[name];
                    }


                    if (val === undefined) {
                        if (el && el.nodeType === DOM.ELEMENT_NODE) {
                            // browsers index elements by id/name on forms, give priority to attributes.
                            if (nodeName(el, "form")) {
                                attrNormalizer = attrNodeHook;
                            }
                            if (attrNormalizer && attrNormalizer.get) {
                                return attrNormalizer.get(el, name);
                            }

                            ret = el.getAttribute(name);

                            // standard browser non-existing attribute return null
                            // ie<8 will return undefined , because it return property
                            // so norm to undefined
                            return ret === null ? undefined : ret;
                        }
                    } else {
                        for (var i = els.length - 1; i >= 0; i--) {
                            el = els[i];
                            if (el && el.nodeType === DOM.ELEMENT_NODE) {
                                if (nodeName(el, "form")) {
                                    attrNormalizer = attrNodeHook;
                                }
                                if (attrNormalizer && attrNormalizer.set) {
                                    attrNormalizer.set(el, val, name);
                                } else {
                                    // convert the value to a string (all browsers do this but IE)
                                    el.setAttribute(name, EMPTY + val);
                                }
                            }
                        }
                    }
                },

                /**
                 * 删除元素的指定属性
                 * @param {Array<HTMLElement>|String} selector 元素集合
                 * @param {String} name 属性名
                 */
                removeAttr:function (selector, name) {
                    name = name.toLowerCase();
                    name = attrFix[name] || name;
                    var els = DOM.query(selector), el, i;
                    for (i = els.length - 1; i >= 0; i--) {
                        el = els[i];
                        if (isElementNode(el)) {
                            var propName;
                            el.removeAttribute(name);
                            // Set corresponding property to false for boolean attributes
                            if (rboolean.test(name) && (propName = propFix[ name ] || name) in el) {
                                el[ propName ] = false;
                            }
                        }
                    }
                },

                /**
                 * 是否其中一个元素包含指定属性
                 * @function
                 * @param {Array<HTMLElement>|String} selector 元素集合
                 * @param {String} name 属性名
                 */
                hasAttr:oldIE ?
                    function (selector, name) {
                        name = name.toLowerCase();
                        var elems = DOM.query(selector);
                        // from ppk :http://www.quirksmode.org/dom/w3c_core.html
                        // IE5-7 doesn't return the value of a style attribute.
                        // var $attr = el.attributes[name];
                        for (var i = 0; i < elems.length; i++) {
                            var el = elems[i];
                            var $attr = el.getAttributeNode(name);
                            if ($attr && $attr.specified) {
                                return true;
                            }
                        }
                        return false;
                    }
                    :
                    function (selector, name) {
                        var elems = DOM.query(selector);
                        for (var i = 0; i < elems.length; i++) {
                            var el = elems[i];
                            //使用原生实现
                            if (el.hasAttribute(name)) {
                                return true;
                            }
                        }
                        return false;
                    },

                /**
                 * 获取元素集合第一个元素的值或者设置全部元素的值
                 * @param {Array<HTMLElement>|String} selector 元素集合
                 * @param [value] 设置值
                 */
                val:function (selector, value) {
                    var hook, ret;

                    //getter
                    if (value === undefined) {

                        var elem = DOM.get(selector);

                        if (elem) {
                            hook = valHooks[ elem.nodeName.toLowerCase() ] || valHooks[ elem.type ];

                            if (hook && "get" in hook && (ret = hook.get(elem, "value")) !== undefined) {
                                return ret;
                            }

                            ret = elem.value;

                            return typeof ret === "string" ?
                                // handle most common string cases
                                ret.replace(rreturn, "") :
                                // handle cases where value is null/undefined or number
                                ret == null ? "" : ret;
                        }

                        return;
                    }

                    var els = DOM.query(selector), i;
                    for (i = els.length - 1; i >= 0; i--) {
                        elem = els[i];
                        if (elem.nodeType !== 1) {
                            return;
                        }

                        var val = value;

                        // Treat null/undefined as ""; convert numbers to string
                        if (val == null) {
                            val = "";
                        } else if (typeof val === "number") {
                            val += "";
                        } else if (S.isArray(val)) {
                            val = S.map(val, function (value) {
                                return value == null ? "" : value + "";
                            });
                        }

                        hook = valHooks[ elem.nodeName.toLowerCase() ] || valHooks[ elem.type ];

                        // If set returns undefined, fall back to normal setting
                        if (!hook || !("set" in hook) || hook.set(elem, val, "value") === undefined) {
                            elem.value = val;
                        }
                    }
                },

                /**
                 * 获取元素集合第一个元素的文本值或者设置全部元素的文本值
                 * @param {HTMLElement[]|HTMLElement|String} selector 元素集合
                 * @param [val] 设置值
                 */
                text:function (selector, val) {
                    // getter
                    if (val === undefined) {
                        // supports css selector/Node/NodeList
                        var el = DOM.get(selector);

                        // only gets value on supported nodes
                        if (isElementNode(el)) {
                            return el[TEXT] || EMPTY;
                        }
                        else if (isTextNode(el)) {
                            return el.nodeValue;
                        }
                        return undefined;
                    }
                    // setter
                    else {
                        var els = DOM.query(selector), i;
                        for (i = els.length - 1; i >= 0; i--) {
                            el = els[i];
                            if (isElementNode(el)) {
                                el[TEXT] = val;
                            }
                            else if (isTextNode(el)) {
                                el.nodeValue = val;
                            }
                        }
                    }
                }
            });
        return DOM;
    }, {
        requires:["./base", "ua"]
    }
);

/**
 * NOTES:
 * 承玉：2011-06-03
 *  - 借鉴 jquery 1.6,理清 attribute 与 property
 *
 * 承玉：2011-01-28
 *  - 处理 tabindex，顺便重构
 *
 * 2010.03
 *  - 在 jquery/support.js 中，special attrs 里还有 maxlength, cellspacing,
 *    rowspan, colspan, useap, frameboder, 但测试发现，在 Grade-A 级浏览器中
 *    并无兼容性问题。
 *  - 当 colspan/rowspan 属性值设置有误时，ie7- 会自动纠正，和 href 一样，需要传递
 *    第 2 个参数来解决。jQuery 未考虑，存在兼容性 bug.
 *  - jQuery 考虑了未显式设定 tabindex 时引发的兼容问题，kissy 里忽略（太不常用了）
 *  - jquery/attributes.js: Safari mis-reports the default selected
 *    property of an option 在 Safari 4 中已修复。
 *
 */
/**
 * @fileOverview   dom
 * @author  yiminghe@gmail.com,lifesinger@gmail.com
 */
KISSY.add('dom/base', function (S, UA, undefined) {

    function nodeTypeIs(node, val) {
        return node && node.nodeType === val;
    }


    var NODE_TYPE =
    /**
     * @lends DOM
     */
    {
        ELEMENT_NODE:1,
        "ATTRIBUTE_NODE":2,
        TEXT_NODE:3,
        "CDATA_SECTION_NODE":4,
        "ENTITY_REFERENCE_NODE":5,
        "ENTITY_NODE":6,
        "PROCESSING_INSTRUCTION_NODE":7,
        COMMENT_NODE:8,
        DOCUMENT_NODE:9,
        "DOCUMENT_TYPE_NODE":10,
        DOCUMENT_FRAGMENT_NODE:11,
        "NOTATION_NODE":12
    };
    var DOM = {

        _isCustomDomain:function (win) {
            win = win || window;
            var domain = win.document.domain,
                hostname = win.location.hostname;
            return domain != hostname &&
                domain != ( '[' + hostname + ']' );	// IPv6 IP support
        },

        _genEmptyIframeSrc:function (win) {
            win = win || window;
            if (UA['ie'] && DOM._isCustomDomain(win)) {
                return  'javascript:void(function(){' + encodeURIComponent("" +
                    "document.open();" +
                    "document.domain='" +
                    win.document.domain
                    + "';" +
                    "document.close();") + "}())";
            }
        },

        _NODE_TYPE:NODE_TYPE,


        /**
         * 是不是 element node
         */
        _isElementNode:function (elem) {
            return nodeTypeIs(elem, DOM.ELEMENT_NODE);
        },

        /**
         * elem 为 window 时，直接返回
         * elem 为 document 时，返回关联的 window
         * elem 为 undefined 时，返回当前 window
         * 其它值，返回 false
         */
        _getWin:function (elem) {
            return (elem && ('scrollTo' in elem) && elem['document']) ?
                elem :
                nodeTypeIs(elem, DOM.DOCUMENT_NODE) ?
                    elem.defaultView || elem.parentWindow :
                    (elem === undefined || elem === null) ?
                        window : false;
        },

        _nodeTypeIs:nodeTypeIs,

        // Ref: http://lifesinger.github.com/lab/2010/nodelist.html
        _isNodeList:function (o) {
            // 注1：ie 下，有 window.item, typeof node.item 在 ie 不同版本下，返回值不同
            // 注2：select 等元素也有 item, 要用 !node.nodeType 排除掉
            // 注3：通过 namedItem 来判断不可靠
            // 注4：getElementsByTagName 和 querySelectorAll 返回的集合不同
            // 注5: 考虑 iframe.contentWindow
            return o && !o.nodeType && o.item && !o.setTimeout;
        },

        _nodeName:function (e, name) {
            return e && e.nodeName.toLowerCase() === name.toLowerCase();
        }
    };

    S.mix(DOM, NODE_TYPE);

    return DOM;

}, {
    requires:['ua']
});

/**
 * 2011-08
 *  - 添加键盘枚举值，方便依赖程序清晰
 */
/**
 * @fileOverview   dom-class
 * @author  lifesinger@gmail.com
 */
KISSY.add('dom/class', function (S, DOM, undefined) {

    var SPACE = ' ',
        REG_SPLIT = /[\.\s]\s*\.?/,
        REG_CLASS = /[\n\t]/g;

    function norm(elemClass) {
        return (SPACE + elemClass + SPACE).replace(REG_CLASS, SPACE);
    }

    S.mix(DOM,

        /**
         * @lends DOM
         */
        {
            /**
             * Determine whether any of the matched elements are assigned the given class.
             * @param {HTMLElement|String|HTMLElement[]} selector 节点元素结合
             * @param value 样式名，多个样式以空格区分
             * @return {boolean} 当前元素集合是否有元素包含样式名
             */
            hasClass:function (selector, value) {
                return batch(selector, value, function (elem, classNames, cl) {
                    var elemClass = elem.className;
                    if (elemClass) {
                        var className = norm(elemClass),
                            j = 0,
                            ret = true;
                        for (; j < cl; j++) {
                            if (className.indexOf(SPACE + classNames[j] + SPACE) < 0) {
                                ret = false;
                                break;
                            }
                        }
                        if (ret) {
                            return true;
                        }
                    }
                }, true);
            },

            /**
             * Adds the specified class(es) to each of the set of matched elements.
             * @param {HTMLElement|String|HTMLElement[]} selector 节点元素结合
             * @param value 样式名，多个样式以空格区分
             */
            addClass:function (selector, value) {
                batch(selector, value, function (elem, classNames, cl) {
                    var elemClass = elem.className;
                    if (!elemClass) {
                        elem.className = value;
                    } else {
                        var className = norm(elemClass),
                            setClass = elemClass,
                            j = 0;
                        for (; j < cl; j++) {
                            if (className.indexOf(SPACE + classNames[j] + SPACE) < 0) {
                                setClass += SPACE + classNames[j];
                            }
                        }
                        elem.className = S.trim(setClass);
                    }
                }, undefined);
            },

            /**
             * Remove a single class, multiple classes, or all classes from each element in the set of matched elements.
             * @param {HTMLElement|String|HTMLElement[]} selector 节点元素结合
             * @param value 样式名，多个样式以空格区分
             */
            removeClass:function (selector, value) {
                batch(selector, value, function (elem, classNames, cl) {
                    var elemClass = elem.className;
                    if (elemClass) {
                        if (!cl) {
                            elem.className = '';
                        } else {
                            var className = norm(elemClass),
                                j = 0,
                                needle;
                            for (; j < cl; j++) {
                                needle = SPACE + classNames[j] + SPACE;
                                // 一个 cls 有可能多次出现：'link link2 link link3 link'
                                while (className.indexOf(needle) >= 0) {
                                    className = className.replace(needle, SPACE);
                                }
                            }
                            elem.className = S.trim(className);
                        }
                    }
                }, undefined);
            },

            /**
             * Replace a class with another class for matched elements.
             * If no oldClassName is present, the newClassName is simply added.
             * @param {HTMLElement|String|HTMLElement[]} selector 节点元素结合
             * @param oldClassName 原有样式名，多个样式以空格区分
             * @param newClassName 新样式名，多个样式以空格区分
             */
            replaceClass:function (selector, oldClassName, newClassName) {
                DOM.removeClass(selector, oldClassName);
                DOM.addClass(selector, newClassName);
            },

            /**
             * Add or remove one or more classes from each element in the set of
             * matched elements, depending on either the class's presence or the
             * value of the switch argument.
             * @param {HTMLElement|String|HTMLElement[]} selector 节点元素结合
             * @param value 样式名，多个样式以空格区分
             * @param [state] {Boolean} optional boolean to indicate whether class
             *        should be added or removed regardless of current state.
             */
            toggleClass:function (selector, value, state) {
                var isBool = S.isBoolean(state), has;

                batch(selector, value, function (elem, classNames, cl) {
                    var j = 0, className;
                    for (; j < cl; j++) {
                        className = classNames[j];
                        has = isBool ? !state : DOM.hasClass(elem, className);
                        DOM[has ? 'removeClass' : 'addClass'](elem, className);
                    }
                }, undefined);
            }
        });

    function batch(selector, value, fn, resultIsBool) {
        if (!(value = S.trim(value))) {
            return resultIsBool ? false : undefined;
        }

        var elems = DOM.query(selector),
            len = elems.length,
            tmp = value.split(REG_SPLIT),
            elem,
            ret;

        var classNames = [];
        for (var i = 0; i < tmp.length; i++) {
            var t = S.trim(tmp[i]);
            if (t) {
                classNames.push(t);
            }
        }
        for (i = 0; i < len; i++) {
            elem = elems[i];
            if (DOM._isElementNode(elem)) {
                ret = fn(elem, classNames, classNames.length);
                if (ret !== undefined) {
                    return ret;
                }
            }
        }

        if (resultIsBool) {
            return false;
        }
        return undefined;
    }

    return DOM;
}, {
    requires:["dom/base"]
});

/**
 * NOTES:
 *   - hasClass/addClass/removeClass 的逻辑和 jQuery 保持一致
 *   - toggleClass 不支持 value 为 undefined 的情形（jQuery 支持）
 */
/**
 * @fileOverview   dom-create
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add('dom/create', function (S, DOM, UA, undefined) {

        var doc = document,
            ie = UA['ie'],
            nodeTypeIs = DOM._nodeTypeIs,
            isElementNode = DOM._isElementNode,
            isString = S.isString,
            DIV = 'div',
            PARENT_NODE = 'parentNode',
            DEFAULT_DIV = doc.createElement(DIV),
            rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
            RE_TAG = /<([\w:]+)/,
            rtbody = /<tbody/i,
            rleadingWhitespace = /^\s+/,
            lostLeadingWhitespace = ie && ie < 9,
            rhtml = /<|&#?\w+;/,
            RE_SIMPLE_TAG = /^<(\w+)\s*\/?>(?:<\/\1>)?$/;

        // help compression
        function getElementsByTagName(el, tag) {
            return el.getElementsByTagName(tag);
        }

        function cleanData(els) {
            var Event = S.require("event");
            if (Event) {
                Event.detach(els);
            }
            DOM.removeData(els);
        }

        S.mix(DOM,
            /**
             * @lends DOM
             */
            {

                /**
                 * Creates a new HTMLElement using the provided html string.
                 * @param {String} html 将要构建的节点 html 字符串
                 * @param {Object} [props] 属性键值对
                 * @param {Document} [ownerDoc] 节点所属文档
                 * @returns {DocumentFragment|HTMLElement} 创建出的 dom 节点或碎片列表
                 */
                create:function (html, props, ownerDoc, _trim/*internal*/) {

                    var ret = null;

                    if (!html) {
                        return ret;
                    }

                    if (html.nodeType) {
                        return DOM.clone(html);
                    }


                    if (!isString(html)) {
                        return ret;
                    }

                    if (_trim === undefined) {
                        _trim = true;
                    }

                    if (_trim) {
                        html = S.trim(html);
                    }


                    var creators = DOM._creators,
                        holder,
                        whitespaceMatch,
                        context = ownerDoc || doc,
                        m,
                        tag = DIV,
                        k,
                        nodes;

                    if (!rhtml.test(html)) {
                        ret = context.createTextNode(html);
                    }
                    // 简单 tag, 比如 DOM.create('<p>')
                    else if ((m = RE_SIMPLE_TAG.exec(html))) {
                        ret = context.createElement(m[1]);
                    }
                    // 复杂情况，比如 DOM.create('<img src="sprite.png" />')
                    else {
                        // Fix "XHTML"-style tags in all browsers
                        html = html.replace(rxhtmlTag, "<$1><" + "/$2>");

                        if ((m = RE_TAG.exec(html)) && (k = m[1])) {
                            tag = k.toLowerCase();
                        }

                        holder = (creators[tag] || creators[DIV])(html, context);
                        // ie 把前缀空白吃掉了
                        if (lostLeadingWhitespace && (whitespaceMatch = html.match(rleadingWhitespace))) {
                            holder.insertBefore(context.createTextNode(whitespaceMatch[0]), holder.firstChild);
                        }
                        nodes = holder.childNodes;

                        if (nodes.length === 1) {
                            // return single node, breaking parentNode ref from "fragment"
                            ret = nodes[0][PARENT_NODE].removeChild(nodes[0]);
                        }
                        else if (nodes.length) {
                            // return multiple nodes as a fragment
                            ret = nl2frag(nodes, context);
                        } else {
                            S.error(html + " : create node error");
                        }
                    }

                    return attachProps(ret, props);
                },

                _creators:{
                    div:function (html, ownerDoc) {
                        var frag = ownerDoc && ownerDoc != doc ? ownerDoc.createElement(DIV) : DEFAULT_DIV;
                        // html 为 <style></style> 时不行，必须有其他元素？
                        frag['innerHTML'] = "m<div>" + html + "<" + "/div>";
                        return frag.lastChild;
                    }
                },

                /**
                 * Gets/Sets the HTML contents of the HTMLElement.
                 * @param {HTMLElement|String|HTMLElement[]} selector 节点元素结合
                 * @param {String} val 将要设置的 html 值
                 * @param {Boolean} loadScripts (optional) True to look for and process scripts (defaults to false).
                 */
                html:function (selector, val, loadScripts, callback) {
                    // supports css selector/Node/NodeList
                    var els = DOM.query(selector),
                        el = els[0];
                    if (!el) {
                        return
                    }
                    // getter
                    if (val === undefined) {
                        // only gets value on the first of element nodes
                        if (isElementNode(el)) {
                            return el['innerHTML'];
                        } else {
                            return null;
                        }
                    }
                    // setter
                    else {

                        var success = false, i, elem;
                        val += "";

                        // faster
                        if (!val.match(/<(?:script|style)/i) &&
                            (!lostLeadingWhitespace || !val.match(rleadingWhitespace)) &&
                            !creatorsMap[ (val.match(RE_TAG) || ["", ""])[1].toLowerCase() ]) {

                            try {
                                for (i = els.length - 1; i >= 0; i--) {
                                    elem = els[i];
                                    if (isElementNode(elem)) {
                                        cleanData(getElementsByTagName(elem, "*"));
                                        elem.innerHTML = val;
                                    }
                                }
                                success = true;
                            } catch (e) {
                                // a <= "<a>"
                                // a.innerHTML='<p>1</p>';
                            }

                        }

                        if (!success) {
                            var valNode = DOM.create(val, null, el.ownerDocument, false);
                            for (i = els.length - 1; i >= 0; i--) {
                                elem = els[i];
                                if (isElementNode(elem)) {
                                    DOM.empty(elem);
                                    DOM.append(valNode, elem, loadScripts);
                                }
                            }
                        }
                        callback && callback();
                    }
                },

                /**
                 * Remove the set of matched elements from the DOM.
                 * 不要使用 innerHTML='' 来清除元素，可能会造成内存泄露，要使用 DOM.remove()
                 * @param {HTMLElement|String|HTMLElement[]} selector 节点元素结合
                 * @param {Boolean} [keepData=false] 删除元素时是否保留其上的数据，用于离线操作，提高性能
                 */
                remove:function (selector, keepData) {
                    var el, els = DOM.query(selector), i;
                    for (i = els.length - 1; i >= 0; i--) {
                        el = els[i];
                        if (!keepData && isElementNode(el)) {
                            // 清理数据
                            var elChildren = getElementsByTagName(el, "*");
                            cleanData(elChildren);
                            cleanData(el);
                        }

                        if (el.parentNode) {
                            el.parentNode.removeChild(el);
                        }
                    }
                },

                /**
                 * clone node across browsers for the first node in selector
                 * @param {HTMLElement|String|HTMLElement[]} selector 节点元素结合
                 * @param {Boolean} deep 是否深 copy
                 * @param {Boolean} withDataAndEvent 复制节点是否包括和源节点同样的数据和事件
                 * @param {Boolean} deepWithDataAndEvent 复制节点的子孙节点是否包括和源节点子孙节点同样的数据和事件
                 * @see https://developer.mozilla.org/En/DOM/Node.cloneNode
                 * @returns {HTMLElement} 复制后的节点
                 */
                clone:function (selector, deep, withDataAndEvent, deepWithDataAndEvent) {
                    var elem = DOM.get(selector);

                    if (!elem) {
                        return null;
                    }

                    // TODO
                    // ie bug :
                    // 1. ie<9 <script>xx</script> => <script></script>
                    // 2. ie will execute external script
                    var clone = elem.cloneNode(deep);

                    if (isElementNode(elem) ||
                        nodeTypeIs(elem, DOM.DOCUMENT_FRAGMENT_NODE)) {
                        // IE copies events bound via attachEvent when using cloneNode.
                        // Calling detachEvent on the clone will also remove the events
                        // from the original. In order to get around this, we use some
                        // proprietary methods to clear the events. Thanks to MooTools
                        // guys for this hotness.
                        if (isElementNode(elem)) {
                            fixAttributes(elem, clone);
                        }

                        if (deep) {
                            processAll(fixAttributes, elem, clone);
                        }
                    }
                    // runtime 获得事件模块
                    if (withDataAndEvent) {
                        cloneWidthDataAndEvent(elem, clone);
                        if (deep && deepWithDataAndEvent) {
                            processAll(cloneWidthDataAndEvent, elem, clone);
                        }
                    }
                    return clone;
                },

                /**
                 * 清除节点的所有子孙节点以及子孙节点上的事件和 {@link DOM.data} 信息
                 * @param {HTMLElement|String|HTMLElement[]} selector 节点元素结合
                 */
                empty:function (selector) {
                    var els = DOM.query(selector), el, i;
                    for (i = els.length - 1; i >= 0; i--) {
                        el = els[i];
                        DOM.remove(el.childNodes);
                    }
                },

                _nl2frag:nl2frag
            });

        function processAll(fn, elem, clone) {
            if (nodeTypeIs(elem, DOM.DOCUMENT_FRAGMENT_NODE)) {
                var eCs = elem.childNodes,
                    cloneCs = clone.childNodes,
                    fIndex = 0;
                while (eCs[fIndex]) {
                    if (cloneCs[fIndex]) {
                        processAll(fn, eCs[fIndex], cloneCs[fIndex]);
                    }
                    fIndex++;
                }
            } else if (isElementNode(elem)) {
                var elemChildren = getElementsByTagName(elem, "*"),
                    cloneChildren = getElementsByTagName(clone, "*"),
                    cIndex = 0;
                while (elemChildren[cIndex]) {
                    if (cloneChildren[cIndex]) {
                        fn(elemChildren[cIndex], cloneChildren[cIndex]);
                    }
                    cIndex++;
                }
            }
        }


        // 克隆除了事件的 data
        function cloneWidthDataAndEvent(src, dest) {
            var Event = S.require('event');

            if (isElementNode(dest) && !DOM.hasData(src)) {
                return;
            }

            var srcData = DOM.data(src);

            // 浅克隆，data 也放在克隆节点上
            for (var d in srcData) {
                DOM.data(dest, d, srcData[d]);
            }

            // 事件要特殊点
            if (Event) {
                // _removeData 不需要？刚克隆出来本来就没
                Event._removeData(dest);
                Event._clone(src, dest);
            }
        }

        // wierd ie cloneNode fix from jq
        function fixAttributes(src, dest) {

            // clearAttributes removes the attributes, which we don't want,
            // but also removes the attachEvent events, which we *do* want
            if (dest.clearAttributes) {
                dest.clearAttributes();
            }

            // mergeAttributes, in contrast, only merges back on the
            // original attributes, not the events
            if (dest.mergeAttributes) {
                dest.mergeAttributes(src);
            }

            var nodeName = dest.nodeName.toLowerCase(),
                srcChilds = src.childNodes;

            // IE6-8 fail to clone children inside object elements that use
            // the proprietary classid attribute value (rather than the type
            // attribute) to identify the type of content to display
            if (nodeName === "object" && !dest.childNodes.length) {
                for (var i = 0; i < srcChilds.length; i++) {
                    dest.appendChild(srcChilds[i].cloneNode(true));
                }
                // dest.outerHTML = src.outerHTML;
            } else if (nodeName === "input" && (src.type === "checkbox" || src.type === "radio")) {
                // IE6-8 fails to persist the checked state of a cloned checkbox
                // or radio button. Worse, IE6-7 fail to give the cloned element
                // a checked appearance if the defaultChecked value isn't also set
                if (src.checked) {
                    dest['defaultChecked'] = dest.checked = src.checked;
                }

                // IE6-7 get confused and end up setting the value of a cloned
                // checkbox/radio button to an empty string instead of "on"
                if (dest.value !== src.value) {
                    dest.value = src.value;
                }

                // IE6-8 fails to return the selected option to the default selected
                // state when cloning options
            } else if (nodeName === "option") {
                dest.selected = src.defaultSelected;
                // IE6-8 fails to set the defaultValue to the correct value when
                // cloning other types of input fields
            } else if (nodeName === "input" || nodeName === "textarea") {
                dest.defaultValue = src.defaultValue;
            }

            // Event data gets referenced instead of copied if the expando
            // gets copied too
            // 自定义 data 根据参数特殊处理，expando 只是个用于引用的属性
            dest.removeAttribute(DOM.__EXPANDO);
        }

        // 添加成员到元素中
        function attachProps(elem, props) {
            if (S.isPlainObject(props)) {
                if (isElementNode(elem)) {
                    DOM.attr(elem, props, true);
                }
                // document fragment
                else if (nodeTypeIs(elem, DOM.DOCUMENT_FRAGMENT_NODE)) {
                    DOM.attr(elem.childNodes, props, true);
                }
            }
            return elem;
        }

        // 将 nodeList 转换为 fragment
        function nl2frag(nodes, ownerDoc) {
            var ret = null, i, len;

            if (nodes
                && (nodes.push || nodes.item)
                && nodes[0]) {
                ownerDoc = ownerDoc || nodes[0].ownerDocument;
                ret = ownerDoc.createDocumentFragment();
                nodes = S.makeArray(nodes);
                for (i = 0, len = nodes.length; i < len; i++) {
                    ret.appendChild(nodes[i]);
                }
            }
            else {
                S.log('Unable to convert ' + nodes + ' to fragment.');
            }
            return ret;
        }

        // only for gecko and ie
        // 2010-10-22: 发现 chrome 也与 gecko 的处理一致了
        // if (ie || UA['gecko'] || UA['webkit']) {
        // 定义 creators, 处理浏览器兼容
        var creators = DOM._creators,
            create = DOM.create,
            creatorsMap = {
                option:'select',
                optgroup:'select',
                area:'map',
                thead:'table',
                td:'tr',
                th:'tr',
                tr:'tbody',
                tbody:'table',
                tfoot:'table',
                caption:'table',
                colgroup:'table',
                col:'colgroup',
                legend:'fieldset' // ie 支持，但 gecko 不支持
            };

        for (var p in creatorsMap) {
            (function (tag) {
                creators[p] = function (html, ownerDoc) {
                    return create('<' + tag + '>' + html + '<' + '/' + tag + '>', null, ownerDoc);
                };
            })(creatorsMap[p]);
        }


        // IE7- adds TBODY when creating thead/tfoot/caption/col/colgroup elements
        if (ie < 8) {
            // fix #88
            // https://github.com/kissyteam/kissy/issues/88 : spurious tbody in ie<8
            creators.table = function (html, ownerDoc) {
                var frag = creators[DIV](html, ownerDoc),
                    hasTBody = rtbody.test(html);
                if (hasTBody) {
                    return frag;
                }
                var table = frag.firstChild,
                    tableChildren = S.makeArray(table.childNodes);
                S.each(tableChildren, function (c) {
                    if (DOM._nodeName(c, "tbody") && !c.childNodes.length) {
                        table.removeChild(c);
                    }
                });
                return frag;
            };
        }
        //}
        return DOM;
    },
    {
        requires:["./base", "ua"]
    });

/**
 * 2012-01-31
 * remove spurious tbody
 *
 * 2011-10-13
 * empty , html refactor
 *
 * 2011-08-22
 * clone 实现，参考 jq
 *
 * 2011-08
 *  remove 需要对子孙节点以及自身清除事件以及自定义 data
 *  create 修改，支持 <style></style> ie 下直接创建
 *  TODO: jquery clone ,clean 实现
 *
 * TODO:
 *  - 研究 jQuery 的 buildFragment 和 clean
 *  - 增加 cache, 完善 test cases
 *  - 支持更多 props
 *  - remove 时，是否需要移除事件，以避免内存泄漏？需要详细的测试。
 */
/**
 * @fileOverview   dom-data
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add('dom/data', function (S, DOM, undefined) {

    var win = window,
        EXPANDO = '_ks_data_' + S.now(), // 让每一份 kissy 的 expando 都不同
        dataCache = { }, // 存储 node 节点的 data
        winDataCache = { };    // 避免污染全局


    // The following elements throw uncatchable exceptions if you
    // attempt to add expando properties to them.
    var noData = {
    };
    noData['applet'] = 1;
    noData['object'] = 1;
    noData['embed'] = 1;

    var commonOps = {
        hasData:function (cache, name) {
            if (cache) {
                if (name !== undefined) {
                    if (name in cache) {
                        return true;
                    }
                } else if (!S.isEmptyObject(cache)) {
                    return true;
                }
            }
            return false;
        }
    };

    var objectOps = {
        hasData:function (ob, name) {
            // 只判断当前窗口，iframe 窗口内数据直接放入全局变量
            if (ob == win) {
                return objectOps.hasData(winDataCache, name);
            }
            // 直接建立在对象内
            var thisCache = ob[EXPANDO];
            return commonOps.hasData(thisCache, name);
        },

        data:function (ob, name, value) {
            if (ob == win) {
                return objectOps.data(winDataCache, name, value);
            }
            var cache = ob[EXPANDO];
            if (value !== undefined) {
                cache = ob[EXPANDO] = ob[EXPANDO] || {};
                cache[name] = value;
            } else {
                if (name !== undefined) {
                    return cache && cache[name];
                } else {
                    cache = ob[EXPANDO] = ob[EXPANDO] || {};
                    return cache;
                }
            }
        },
        removeData:function (ob, name) {
            if (ob == win) {
                return objectOps.removeData(winDataCache, name);
            }
            var cache = ob[EXPANDO];
            if (name !== undefined) {
                delete cache[name];
                if (S.isEmptyObject(cache)) {
                    objectOps.removeData(ob);
                }
            } else {
                try {
                    // ob maybe window in iframe
                    // ie will throw error
                    delete ob[EXPANDO];
                } catch (e) {
                    ob[EXPANDO] = undefined;
                }
            }
        }
    };

    var domOps = {
        hasData:function (elem, name) {
            var key = elem[EXPANDO];
            if (!key) {
                return false;
            }
            var thisCache = dataCache[key];
            return commonOps.hasData(thisCache, name);
        },

        data:function (elem, name, value) {
            if (noData[elem.nodeName.toLowerCase()]) {
                return undefined;
            }
            var key = elem[EXPANDO], cache;
            if (!key) {
                // 根本不用附加属性
                if (name !== undefined &&
                    value === undefined) {
                    return undefined;
                }
                // 节点上关联键值也可以
                key = elem[EXPANDO] = S.guid();
            }
            cache = dataCache[key];
            if (value !== undefined) {
                // 需要新建
                cache = dataCache[key] = dataCache[key] || {};
                cache[name] = value;
            } else {
                if (name !== undefined) {
                    return cache && cache[name];
                } else {
                    // 需要新建
                    cache = dataCache[key] = dataCache[key] || {};
                    return cache;
                }
            }
        },

        removeData:function (elem, name) {
            var key = elem[EXPANDO], cache;
            if (!key) {
                return;
            }
            cache = dataCache[key];
            if (name !== undefined) {
                delete cache[name];
                if (S.isEmptyObject(cache)) {
                    domOps.removeData(elem);
                }
            } else {
                delete dataCache[key];
                try {
                    delete elem[EXPANDO];
                } catch (e) {
                    elem[EXPANDO] = undefined;
                    //S.log("delete expando error : ");
                    //S.log(e);
                }
                if (elem.removeAttribute) {
                    elem.removeAttribute(EXPANDO);
                }
            }
        }
    };


    S.mix(DOM,
        /**
         * @lends DOM
         */
        {

            __EXPANDO:EXPANDO,

            /**
             * whether any node has data
             * @param {HTMLElement[]|String|HTMLElement} selector 选择器或节点或节点数组
             * @param {String} [name] 数据键名
             * @returns {boolean} 节点是否有关联数据键名的值
             */
            hasData:function (selector, name) {
                var ret = false, elems = DOM.query(selector);
                for (var i = 0; i < elems.length; i++) {
                    var elem = elems[i];
                    if (elem.nodeType) {
                        ret = domOps.hasData(elem, name);
                    } else {
                        ret = objectOps.hasData(elem, name);
                    }
                    if (ret) {
                        return ret;
                    }
                }
                return ret;
            },

            /**
             * Store arbitrary data associated with the matched elements.
             * @param {HTMLElement[]|String|HTMLElement} selector 选择器或节点或节点数组
             * @param {String} [name] 数据键名
             * @param {String} [data] 数据键值
             * @returns {*} 当不设置 data，设置 name 那么返回： 节点是否有关联数据键名的值
             *              当不设置 data， name 那么返回： 节点的存储空间对象
             *              当设置 data， name 那么进行设置操作，返回 undefined
             */
            data:function (selector, name, data) {

                var elems = DOM.query(selector), elem = elems[0];

                // supports hash
                if (S.isPlainObject(name)) {
                    for (var k in name) {
                        DOM.data(elems, k, name[k]);
                    }
                    return undefined;
                }

                // getter
                if (data === undefined) {
                    if (elem) {
                        if (elem.nodeType) {
                            return domOps.data(elem, name, data);
                        } else {
                            return objectOps.data(elem, name, data);
                        }
                    }
                }
                // setter
                else {
                    for (var i = elems.length - 1; i >= 0; i--) {
                        elem = elems[i];
                        if (elem.nodeType) {
                            domOps.data(elem, name, data);
                        } else {
                            objectOps.data(elem, name, data);
                        }
                    }
                }
                return undefined;
            },

            /**
             * Remove a previously-stored piece of data.
             * @param {HTMLElement[]|String|HTMLElement} selector 选择器或节点或节点数组
             * @param {String} [name] 数据键名，不设置时删除关联节点的所有键值对
             */
            removeData:function (selector, name) {
                var els = DOM.query(selector), elem, i;
                for (i = els.length - 1; i >= 0; i--) {
                    elem = els[i];
                    if (elem.nodeType) {
                        domOps.removeData(elem, name);
                    } else {
                        objectOps.removeData(elem, name);
                    }
                }
            }
        });

    return DOM;

}, {
    requires:["./base"]
});
/**
 * 承玉：2011-05-31
 *  - 分层 ，节点和普通对象分开处理
 **//**
 * @fileOverview dom
 */
KISSY.add("dom", function (S, DOM) {

    /**
     * @namespace
     * @name DOM
     */

    return DOM;
}, {
    requires:["dom/attr",
        "dom/class",
        "dom/create",
        "dom/data",
        "dom/insertion",
        "dom/offset",
        "dom/style",
        "dom/selector",
        "dom/style-ie",
        "dom/traversal"]
});/**
 * @fileOverview   dom-insertion
 * @author  yiminghe@gmail.com,lifesinger@gmail.com
 */
KISSY.add('dom/insertion', function (S, UA, DOM) {

    var PARENT_NODE = 'parentNode',
        rformEls = /^(?:button|input|object|select|textarea)$/i,
        nodeName = DOM._nodeName,
        makeArray = S.makeArray,
        splice = [].splice,
        _isElementNode = DOM._isElementNode,
        NEXT_SIBLING = 'nextSibling';

    /**
     ie 6,7 lose checked status when append to dom
     var c=S.all("<input />");
     c.attr("type","radio");
     c.attr("checked",true);
     S.all("#t").append(c);
     alert(c[0].checked);
     */
    function fixChecked(ret) {
        for (var i = 0; i < ret.length; i++) {
            var el = ret[i];
            if (el.nodeType == DOM.DOCUMENT_FRAGMENT_NODE) {
                fixChecked(el.childNodes);
            } else if (nodeName(el, "input")) {
                fixCheckedInternal(el);
            } else if (_isElementNode(el)) {
                var cs = el.getElementsByTagName("input");
                for (var j = 0; j < cs.length; j++) {
                    fixChecked(cs[j]);
                }
            }
        }
    }

    function fixCheckedInternal(el) {
        if (el.type === "checkbox" || el.type === "radio") {
            // after insert , in ie6/7 checked is decided by defaultChecked !
            el.defaultChecked = el.checked;
        }
    }

    var rscriptType = /\/(java|ecma)script/i;

    function isJs(el) {
        return !el.type || rscriptType.test(el.type);
    }

    // extract script nodes and execute alone later
    function filterScripts(nodes, scripts) {
        var ret = [], i, el, nodeName;
        for (i = 0; nodes[i]; i++) {
            el = nodes[i];
            nodeName = el.nodeName.toLowerCase();
            if (el.nodeType == DOM.DOCUMENT_FRAGMENT_NODE) {
                ret.push.apply(ret, filterScripts(makeArray(el.childNodes), scripts));
            } else if (nodeName === "script" && isJs(el)) {
                // remove script to make sure ie9 does not invoke when append
                if (el.parentNode) {
                    el.parentNode.removeChild(el)
                }
                if (scripts) {
                    scripts.push(el);
                }
            } else {
                if (_isElementNode(el) &&
                    // ie checkbox getElementsByTagName 后造成 checked 丢失
                    !rformEls.test(nodeName)) {
                    var tmp = [],
                        s,
                        j,
                        ss = el.getElementsByTagName("script");
                    for (j = 0; j < ss.length; j++) {
                        s = ss[j];
                        if (isJs(s)) {
                            tmp.push(s);
                        }
                    }
                    splice.apply(nodes, [i + 1, 0].concat(tmp));
                }
                ret.push(el);
            }
        }
        return ret;
    }

    // execute script
    function evalScript(el) {
        if (el.src) {
            S.getScript(el.src);
        } else {
            var code = S.trim(el.text || el.textContent || el.innerHTML || "");
            if (code) {
                S.globalEval(code);
            }
        }
    }

    // fragment is easier than nodelist
    function insertion(newNodes, refNodes, fn, scripts) {
        newNodes = DOM.query(newNodes);

        if (scripts) {
            scripts = [];
        }

        // filter script nodes ,process script separately if needed
        newNodes = filterScripts(newNodes, scripts);

        // Resets defaultChecked for any radios and checkboxes
        // about to be appended to the DOM in IE 6/7
        if (UA['ie'] < 8) {
            fixChecked(newNodes);
        }
        refNodes = DOM.query(refNodes);
        var newNodesLength = newNodes.length,
            refNodesLength = refNodes.length;
        if ((!newNodesLength &&
            (!scripts || !scripts.length)) ||
            !refNodesLength) {
            return;
        }
        // fragment 插入速度快点
        // 而且能够一个操作达到批量插入
        // refer: http://www.w3.org/TR/REC-DOM-Level-1/level-one-core.html#ID-B63ED1A3
        var newNode = DOM._nl2frag(newNodes),
            clonedNode;
        //fragment 一旦插入里面就空了，先复制下
        if (refNodesLength > 1) {
            clonedNode = DOM.clone(newNode, true);
            refNodes = S.makeArray(refNodes)
        }
        for (var i = 0; i < refNodesLength; i++) {
            var refNode = refNodes[i];
            if (newNodesLength) {
                //refNodes 超过一个，clone
                var node = i > 0 ? DOM.clone(clonedNode, true) : newNode;
                fn(node, refNode);
            }
            if (scripts && scripts.length) {
                S.each(scripts, evalScript);
            }
        }
    }

    // loadScripts default to false to prevent xss
    S.mix(DOM,
        /**
         * @lends DOM
         */
        {

            /**
             * Inserts the new node as the previous sibling of the reference node.
             * @param {HTMLElement|HTMLElement[]} newNodes 将要插入的新节点
             * @param {HTMLElement|HTMLElement[]|String} refNodes 插入的参照节点位置
             */
            insertBefore:function (newNodes, refNodes, loadScripts) {
                insertion(newNodes, refNodes, function (newNode, refNode) {
                    if (refNode[PARENT_NODE]) {
                        refNode[PARENT_NODE].insertBefore(newNode, refNode);
                    }
                }, loadScripts);
            },

            /**
             * Inserts the new node as the next sibling of the reference node.
             * @param {HTMLElement|HTMLElement[]} newNodes 将要插入的新节点
             * @param {HTMLElement|HTMLElement[]|String} refNodes 插入的参照节点位置
             */
            insertAfter:function (newNodes, refNodes, loadScripts) {
                insertion(newNodes, refNodes, function (newNode, refNode) {
                    if (refNode[PARENT_NODE]) {
                        refNode[PARENT_NODE].insertBefore(newNode, refNode[NEXT_SIBLING]);
                    }
                }, loadScripts);
            },

            /**
             * Inserts the new node as the last child.
             * @param {HTMLElement|HTMLElement[]} newNodes 将要插入的新节点
             * @param {HTMLElement|HTMLElement[]|String} parents 插入的参照父节点位置
             */
            appendTo:function (newNodes, parents, loadScripts) {
                insertion(newNodes, parents, function (newNode, parent) {
                    parent.appendChild(newNode);
                }, loadScripts);
            },

            /**
             * Inserts the new node as the first child.
             * @param {HTMLElement|HTMLElement[]} newNodes 将要插入的新节点
             * @param {HTMLElement|HTMLElement[]|String} parents 插入的参照父节点位置
             */
            prependTo:function (newNodes, parents, loadScripts) {
                insertion(newNodes, parents, function (newNode, parent) {
                    parent.insertBefore(newNode, parent.firstChild);
                }, loadScripts);
            }
        });
    var alias = {
        "prepend":"prependTo",
        "append":"appendTo",
        "before":"insertBefore",
        "after":"insertAfter"
    };
    for (var a in alias) {
        DOM[a] = DOM[alias[a]];
    }
    return DOM;
}, {
    requires:["ua", "./create"]
});

/**
 * 2011-05-25
 *  - 承玉：参考 jquery 处理多对多的情形 :http://api.jquery.com/append/
 *      DOM.append(".multi1",".multi2");
 *
 */
/**
 * @fileOverview   dom-offset
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add('dom/offset', function (S, DOM, UA, undefined) {

    var win = window,
        doc = document,
        isIE = UA['ie'],
        docElem = doc.documentElement,
        isElementNode = DOM._isElementNode,
        nodeTypeIs = DOM._nodeTypeIs,
        getWin = DOM._getWin,
        CSS1Compat = "CSS1Compat",
        compatMode = "compatMode",
        isStrict = doc[compatMode] === CSS1Compat,
        MAX = Math.max,
        PARSEINT = parseInt,
        POSITION = 'position',
        RELATIVE = 'relative',
        DOCUMENT = 'document',
        BODY = 'body',
        DOC_ELEMENT = 'documentElement',
        OWNER_DOCUMENT = 'ownerDocument',
        VIEWPORT = 'viewport',
        SCROLL = 'scroll',
        CLIENT = 'client',
        LEFT = 'left',
        TOP = 'top',
        isNumber = S.isNumber,
        SCROLL_LEFT = SCROLL + 'Left',
        SCROLL_TOP = SCROLL + 'Top',
        GET_BOUNDING_CLIENT_RECT = 'getBoundingClientRect';

    S.mix(DOM,
        /**
         * @lends DOM
         */
        {

            /**
             * Get or set the current coordinates of the element, relative to the document.
             * @param {HTMLElement[]|String|HTMLElement} selector 选择器或节点或节点数组
             * @param {Object} [val] 偏移对象,包括两个属性 left ,top,格式同获取偏移的返回值.
             * @param {window} [relativeWin] The window to measure relative to. If relativeWin
             *     is not in the ancestor frame chain of the element, we measure relative to
             *     the top-most window.
             * @returns {Object} 格式同 val
             */
            offset:function (selector, val, relativeWin) {
                // getter
                if (val === undefined) {
                    var elem = DOM.get(selector), ret;
                    if (elem) {
                        ret = getOffset(elem, relativeWin);
                    }
                    return ret;
                }
                // setter
                var els = DOM.query(selector), i;
                for (i = els.length - 1; i >= 0; i--) {
                    elem = els[i];
                    setOffset(elem, val);
                }
                return undefined;
            },

            /**
             * Makes the first elem matched selector visible in the container
             * @param {HTMLElement[]|String|HTMLElement} elem 选择器或节点或节点数组
             * @param {String|HTMLElement} [container] 容器节点，默认当前窗口
             * @param {Boolean} [top] 是否顶部对齐
             * @param {Boolean} [hscroll] 是否触发横向滚动
             * @param {Boolean} [auto] whether adjust element automatically
             *                         (it only scrollIntoView when element is out of view)
             * @see http://www.w3.org/TR/2009/WD-html5-20090423/editing.html#scrollIntoView
             *        http://www.sencha.com/deploy/dev/docs/source/Element.scroll-more.html#scrollIntoView
             *        http://yiminghe.javaeye.com/blog/390732
             */
            scrollIntoView:function (elem, container, top, hscroll, auto) {
                if (!(elem = DOM.get(elem))) {
                    return;
                }

                if (container) {
                    container = DOM.get(container);
                }

                if (!container) {
                    container = elem.ownerDocument;
                }

                if (auto !== true) {
                    hscroll = hscroll === undefined ? true : !!hscroll;
                    top = top === undefined ? true : !!top;
                }

                // document 归一化到 window
                if (nodeTypeIs(container, DOM.DOCUMENT_NODE)) {
                    container = getWin(container);
                }

                var isWin = !!getWin(container),
                    elemOffset = DOM.offset(elem),
                    eh = DOM.outerHeight(elem),
                    ew = DOM.outerWidth(elem),
                    containerOffset,
                    ch,
                    cw,
                    containerScroll,
                    diffTop,
                    diffBottom,
                    win,
                    winScroll,
                    ww,
                    wh;

                if (isWin) {
                    win = container;
                    wh = DOM.height(win);
                    ww = DOM.width(win);
                    winScroll = {
                        left:DOM.scrollLeft(win),
                        top:DOM.scrollTop(win)
                    };
                    // elem 相对 container 可视视窗的距离
                    diffTop = {
                        left:elemOffset[LEFT] - winScroll[LEFT],
                        top:elemOffset[TOP] - winScroll[TOP]
                    };
                    diffBottom = {
                        left:elemOffset[LEFT] + ew - (winScroll[LEFT] + ww),
                        top:elemOffset[TOP] + eh - (winScroll[TOP] + wh)
                    };
                    containerScroll = winScroll;
                }
                else {
                    containerOffset = DOM.offset(container);
                    ch = container.clientHeight;
                    cw = container.clientWidth;
                    containerScroll = {
                        left:DOM.scrollLeft(container),
                        top:DOM.scrollTop(container)
                    };
                    // elem 相对 container 可视视窗的距离
                    // 注意边框 , offset 是边框到根节点
                    diffTop = {
                        left:elemOffset[LEFT] - containerOffset[LEFT] -
                            (PARSEINT(DOM.css(container, 'borderLeftWidth')) || 0),
                        top:elemOffset[TOP] - containerOffset[TOP] -
                            (PARSEINT(DOM.css(container, 'borderTopWidth')) || 0)
                    };
                    diffBottom = {
                        left:elemOffset[LEFT] + ew -
                            (containerOffset[LEFT] + cw +
                                (PARSEINT(DOM.css(container, 'borderRightWidth')) || 0)),
                        top:elemOffset[TOP] + eh -
                            (containerOffset[TOP] + ch +
                                (PARSEINT(DOM.css(container, 'borderBottomWidth')) || 0))
                    };
                }

                if (diffTop.top < 0 || diffBottom.top > 0) {
                    // 强制向上
                    if (top === true) {
                        DOM.scrollTop(container, containerScroll.top + diffTop.top);
                    } else if (top === false) {
                        DOM.scrollTop(container, containerScroll.top + diffBottom.top);
                    } else {
                        // 自动调整
                        if (diffTop.top < 0) {
                            DOM.scrollTop(container, containerScroll.top + diffTop.top);
                        } else {
                            DOM.scrollTop(container, containerScroll.top + diffBottom.top);
                        }
                    }
                }

                if (hscroll) {
                    if (diffTop.left < 0 || diffBottom.left > 0) {
                        // 强制向上
                        if (top === true) {
                            DOM.scrollLeft(container, containerScroll.left + diffTop.left);
                        } else if (top === false) {
                            DOM.scrollLeft(container, containerScroll.left + diffBottom.left);
                        } else {
                            // 自动调整
                            if (diffTop.left < 0) {
                                DOM.scrollLeft(container, containerScroll.left + diffTop.left);
                            } else {
                                DOM.scrollLeft(container, containerScroll.left + diffBottom.left);
                            }
                        }
                    }
                }
            },
            /**
             * 取得当前文档宽度
             * @param {window} [win] 当前视窗
             * @function
             */
            docWidth:0,
            /**
             * 取得当前文档高度
             * @param {window} [win] 当前视窗
             * @function
             */
            docHeight:0,
            /**
             * 取得当前视窗高度
             * @param {window} [win] 当前视窗
             * @function
             */
            viewportHeight:0,
            /**
             * 取得当前视窗宽度
             * @param {window} [win] 当前视窗
             * @function
             */
            viewportWidth:0
        });

    // http://old.jr.pl/www.quirksmode.org/viewport/compatibility.html
    // http://www.quirksmode.org/dom/w3c_cssom.html
    // add ScrollLeft/ScrollTop getter/setter methods
    S.each(['Left', 'Top'], function (name, i) {
        var method = SCROLL + name;

        DOM[method] = function (elem, v) {
            if (isNumber(elem)) {
                return arguments.callee(win, elem);
            }
            elem = DOM.get(elem);
            var ret,
                w = getWin(elem),
                d;
            if (w) {
                if (v !== undefined) {
                    v = parseFloat(v);
                    // 注意多 windw 情况，不能简单取 win
                    var left = name == "Left" ? v : DOM.scrollLeft(w),
                        top = name == "Top" ? v : DOM.scrollTop(w);
                    w['scrollTo'](left, top);
                } else {
                    //标准
                    //chrome == body.scrollTop
                    //firefox/ie9 == documentElement.scrollTop
                    ret = w[ 'page' + (i ? 'Y' : 'X') + 'Offset'];
                    if (!isNumber(ret)) {
                        d = w[DOCUMENT];
                        //ie6,7,8 standard mode
                        ret = d[DOC_ELEMENT][method];
                        if (!isNumber(ret)) {
                            //quirks mode
                            ret = d[BODY][method];
                        }
                    }
                }
            } else if (isElementNode(elem)) {
                if (v !== undefined) {
                    elem[method] = parseFloat(v)
                } else {
                    ret = elem[method];
                }
            }
            return ret;
        }
    });

    // add docWidth/Height, viewportWidth/Height getter methods
    S.each(['Width', 'Height'], function (name) {
        DOM['doc' + name] = function (refWin) {
            refWin = DOM.get(refWin);
            var w = getWin(refWin),
                d = w[DOCUMENT];
            return MAX(
                //firefox chrome documentElement.scrollHeight< body.scrollHeight
                //ie standard mode : documentElement.scrollHeight> body.scrollHeight
                d[DOC_ELEMENT][SCROLL + name],
                //quirks : documentElement.scrollHeight 最大等于可视窗口多一点？
                d[BODY][SCROLL + name],
                DOM[VIEWPORT + name](d));
        };

        DOM[VIEWPORT + name] = function (refWin) {
            refWin = DOM.get(refWin);
            var prop = CLIENT + name,
                win = getWin(refWin),
                doc = win[DOCUMENT],
                body = doc[BODY],
                documentElement = doc[DOC_ELEMENT],
                documentElementProp = documentElement[prop];
            // 标准模式取 documentElement
            // backcompat 取 body
            return doc[compatMode] === CSS1Compat
                && documentElementProp ||
                body && body[ prop ] || documentElementProp;
//            return (prop in w) ?
//                // 标准 = documentElement.clientHeight
//                w[prop] :
//                // ie 标准 documentElement.clientHeight , 在 documentElement.clientHeight 上滚动？
//                // ie quirks body.clientHeight: 在 body 上？
//                (isStrict ? d[DOC_ELEMENT][CLIENT + name] : d[BODY][CLIENT + name]);
        }
    });

    function getClientPosition(elem) {
        var box, x = 0, y = 0,
            body = doc.body,
            w = getWin(elem[OWNER_DOCUMENT]);

        // 根据 GBS 最新数据，A-Grade Browsers 都已支持 getBoundingClientRect 方法，不用再考虑传统的实现方式
        if (elem[GET_BOUNDING_CLIENT_RECT]) {
            box = elem[GET_BOUNDING_CLIENT_RECT]();

            // 注：jQuery 还考虑减去 docElem.clientLeft/clientTop
            // 但测试发现，这样反而会导致当 html 和 body 有边距/边框样式时，获取的值不正确
            // 此外，ie6 会忽略 html 的 margin 值，幸运地是没有谁会去设置 html 的 margin

            x = box[LEFT];
            y = box[TOP];

            // ie 下应该减去窗口的边框吧，毕竟默认 absolute 都是相对窗口定位的
            // 窗口边框标准是设 documentElement ,quirks 时设置 body
            // 最好禁止在 body 和 html 上边框 ，但 ie < 9 html 默认有 2px ，减去
            // 但是非 ie 不可能设置窗口边框，body html 也不是窗口 ,ie 可以通过 html,body 设置
            // 标准 ie 下 docElem.clientTop 就是 border-top
            // ie7 html 即窗口边框改变不了。永远为 2

            // 但标准 firefox/chrome/ie9 下 docElem.clientTop 是窗口边框，即使设了 border-top 也为 0
            var clientTop = isIE && doc['documentMode'] != 9
                && (isStrict ? docElem.clientTop : body.clientTop)
                || 0,
                clientLeft = isIE && doc['documentMode'] != 9
                    && (isStrict ? docElem.clientLeft : body.clientLeft)
                    || 0;
            if (1 > 2) {
            }
            x -= clientLeft;
            y -= clientTop;

            // iphone/ipad/itouch 下的 Safari 获取 getBoundingClientRect 时，已经加入 scrollTop
            if (UA.mobile == 'apple') {
                x -= DOM[SCROLL_LEFT](w);
                y -= DOM[SCROLL_TOP](w);
            }
        }

        return { left:x, top:y };
    }


    function getPageOffset(el) {
        var pos = getClientPosition(el);
        var w = getWin(el[OWNER_DOCUMENT]);
        pos.left += DOM[SCROLL_LEFT](w);
        pos.top += DOM[SCROLL_TOP](w);
        return pos;
    }

    // 获取 elem 相对 elem.ownerDocument 的坐标
    function getOffset(el, relativeWin) {
        var position = {left:0, top:0};

        // Iterate up the ancestor frame chain, keeping track of the current window
        // and the current element in that window.
        var currentWin = getWin(el[OWNER_DOCUMENT]);
        var currentEl = el;
        relativeWin = relativeWin || currentWin;
        do {
            // if we're at the top window, we want to get the page offset.
            // if we're at an inner frame, we only want to get the window position
            // so that we can determine the actual page offset in the context of
            // the outer window.
            var offset = currentWin == relativeWin ?
                getPageOffset(currentEl) :
                getClientPosition(currentEl);
            position.left += offset.left;
            position.top += offset.top;
        } while (currentWin && currentWin != relativeWin &&
            (currentEl = currentWin['frameElement']) &&
            (currentWin = currentWin.parent));

        return position;
    }

    // 设置 elem 相对 elem.ownerDocument 的坐标
    function setOffset(elem, offset) {
        // set position first, in-case top/left are set even on static elem
        if (DOM.css(elem, POSITION) === 'static') {
            elem.style[POSITION] = RELATIVE;
        }
        var old = getOffset(elem), ret = { }, current, key;

        for (key in offset) {
            current = PARSEINT(DOM.css(elem, key), 10) || 0;
            ret[key] = current + offset[key] - old[key];
        }
        DOM.css(elem, ret);
    }

    return DOM;
}, {
    requires:["./base", "ua"]
});

/**
 * 2011-05-24
 *  - 承玉：
 *  - 调整 docWidth , docHeight ,
 *      viewportHeight , viewportWidth ,scrollLeft,scrollTop 参数，
 *      便于放置到 Node 中去，可以完全摆脱 DOM，完全使用 Node
 *
 *
 *
 * TODO:
 *  - 考虑是否实现 jQuery 的 position, offsetParent 等功能
 *  - 更详细的测试用例（比如：测试 position 为 fixed 的情况）
 */
/**
 * @fileOverview   selector
 * @author  lifesinger@gmail.com , yiminghe@gmail.com
 */
KISSY.add('dom/selector', function (S, DOM, undefined) {

    var doc = document,
        filter = S.filter,
        require = function (selector) {
            return S.require(selector);
        },
        isArray = S.isArray,
        isString = S.isString,
        makeArray = S.makeArray,
        isNodeList = DOM._isNodeList,
        nodeName = DOM._nodeName,
        push = Array.prototype.push,
        SPACE = ' ',
        COMMA = ',',
        trim = S.trim,
        ANY = '*',
        REG_ID = /^#[\w-]+$/,
        REG_QUERY = /^(?:#([\w-]+))?\s*([\w-]+|\*)?\.?([\w-]+)?$/;

    function query_each(f) {
        var self = this, el, i;
        for (i = 0; i < self.length; i++) {
            el = self[i];
            if (f(el, i) === false) {
                break;
            }
        }
    }

    /**
     * Retrieves an Array of HTMLElement based on the given CSS selector.
     * @param {String|HTMLElement[]} selector
     * @param {String|HTMLElement[]} [context] find elements matching selector under context
     * @return {HTMLElement[]} The array of found HTMLElement
     */
    function query(selector, context) {
        var ret,
            i,
            simpleContext,
            isSelectorString = isString(selector),
            // optimize common usage
            contexts = (context === undefined && (simpleContext = 1)) ?
                [doc] :
                tuneContext(context);
        // 常见的空
        if (!selector) {
            ret = [];
        }
        // 常见的选择器
        // DOM.query("#x")
        else if (isSelectorString) {
            selector = trim(selector);
            if (contexts.length == 1 && selector) {
                ret = quickFindBySelectorStr(selector, contexts[0]);
            }
        }
        // 不写 context，就是包装一下
        else if (simpleContext) {
            // 1.常见的单个元素
            // DOM.query(document.getElementById("xx"))
            if (selector.nodeType || selector.setTimeout) {
                ret = [selector];
            }
            // 2.KISSY NodeList 特殊点直接返回，提高性能
            else if (selector.getDOMNodes) {
                return selector;
            }
            // 3.常见的数组
            // var x=DOM.query(".l");
            // DOM.css(x,"color","red");
            else if (isArray(selector)) {
                ret = selector;
            }
            // 4.selector.item
            // DOM.query(document.getElementsByTagName("a"))
            // note:
            // document.createElement("select").item 已经在 1 处理了
            // S.all().item 已经在 2 处理了
            else if (isNodeList(selector)) {
                ret = S.makeArray(selector);
            } else {
                ret = [ selector ];
            }
        }

        if (!ret) {
            ret = [];
            if (selector) {
                for (i = 0; i < contexts.length; i++) {
                    push.apply(ret, queryByContexts(selector, contexts[i]));
                }
                //必要时去重排序
                if (ret.length > 1 &&
                    // multiple contexts
                    (contexts.length > 1 ||
                        (isSelectorString &&
                            // multiple selector
                            selector.indexOf(COMMA) > -1))) {
                    unique(ret);
                }
            }
        }

        // attach each method
        ret.each = query_each;

        return ret;
    }

    function queryByContexts(selector, context) {
        var ret = [],
            isSelectorString = isString(selector);
        if (isSelectorString && selector.match(REG_QUERY) ||
            !isSelectorString) {
            // 简单选择器自己处理
            ret = queryBySimple(selector, context);
        }
        // 如果选择器有 , 分开递归一部分一部分来
        else if (isSelectorString && selector.indexOf(COMMA) > -1) {
            ret = queryBySelectors(selector, context);
        }
        else {
            // 复杂了，交给 sizzle
            ret = queryBySizzle(selector, context);
        }
        return ret;
    }

    // 交给 sizzle 模块处理
    function queryBySizzle(selector, context) {
        var ret = [],
            sizzle = require("sizzle");
        if (sizzle) {
            sizzle(selector, context, ret);
        } else {
            // 原生不支持
            error(selector);
        }
        return ret;
    }

    // 处理 selector 的每个部分
    function queryBySelectors(selector, context) {
        var ret = [],
            i,
            selectors = selector.split(/\s*,\s*/);
        for (i = 0; i < selectors.length; i++) {
            push.apply(ret, queryByContexts(selectors[i], context));
        }
        // 多部分选择器可能得到重复结果
        return ret;
    }

    function quickFindBySelectorStr(selector, context) {
        var ret, t, match, id, tag, cls;
        // selector 为 #id 是最常见的情况，特殊优化处理
        if (REG_ID.test(selector)) {
            t = getElementById(selector.slice(1), context);
            if (t) {
                // #id 无效时，返回空数组
                ret = [t];
            } else {
                ret = [];
            }
        }
        // selector 为支持列表中的其它 6 种
        else {
            match = REG_QUERY.exec(selector);
            if (match) {
                // 获取匹配出的信息
                id = match[1];
                tag = match[2];
                cls = match[3];
                // 空白前只能有 id ，取出来作为 context
                context = (id ? getElementById(id, context) : context);
                if (context) {
                    // #id .cls | #id tag.cls | .cls | tag.cls | #id.cls
                    if (cls) {
                        if (!id || selector.indexOf(SPACE) != -1) { // 排除 #id.cls
                            ret = [].concat(getElementsByClassName(cls, tag, context));
                        }
                        // 处理 #id.cls
                        else {
                            t = getElementById(id, context);
                            if (t && hasClass(t, cls)) {
                                ret = [t];
                            }
                        }
                    }
                    // #id tag | tag
                    else if (tag) { // 排除空白字符串
                        ret = getElementsByTagName(tag, context);
                    }
                }
                ret = ret || [];
            }
        }
        return ret;
    }

    // 最简单情况了，单个选择器部分，单个上下文
    function queryBySimple(selector, context) {
        var ret,
            isSelectorString = isString(selector);
        if (isSelectorString) {
            ret = quickFindBySelectorStr(selector, context) || [];
        }
        // 传入的 selector 是 NodeList 或已是 Array
        else if (isArray(selector) || isNodeList(selector)) {
            // 只能包含在 context 里面
            // filter 会转换为 nodelist 为数组
            ret = filter(selector, function (s) {
                return testByContext(s, context);
            });
        }
        // 传入的 selector 是 HTMLNode 查看约束
        // 否则 window/document，原样返回
        else if (testByContext(selector, context)) {
            ret = [selector];
        }
        return ret;
    }

    function testByContext(element, context) {
        if (!element) {
            return false;
        }
        // 防止 element 节点还没添加到 document ，但是也可以获取到 query(element) => [element]
        // document 的上下文一律放行
        // context == doc 意味着没有提供第二个参数，到这里只是想单纯包装原生节点，则不检测
        if (context == doc) {
            return true;
        }
        // 节点受上下文约束
        return DOM.contains(context, element);
    }

    var unique = S.noop;
    (function () {
        var sortOrder,
            hasDuplicate,
            baseHasDuplicate = true;

        // Here we check if the JavaScript engine is using some sort of
// optimization where it does not always call our comparision
// function. If that is the case, discard the hasDuplicate value.
//   Thus far that includes Google Chrome.
        [0, 0].sort(function () {
            baseHasDuplicate = false;
            return 0;
        });

        // 排序去重
        unique = function (elements) {
            if (sortOrder) {
                hasDuplicate = baseHasDuplicate;
                elements.sort(sortOrder);

                if (hasDuplicate) {
                    var i = 1, len = elements.length;
                    while (i < len) {
                        if (elements[i] === elements[ i - 1 ]) {
                            elements.splice(i, 1);
                        } else {
                            i++;
                        }
                    }
                }
            }
            return elements;
        };

        // 貌似除了 ie 都有了...
        if (doc.documentElement.compareDocumentPosition) {
            sortOrder = function (a, b) {
                if (a == b) {
                    hasDuplicate = true;
                    return 0;
                }

                if (!a.compareDocumentPosition || !b.compareDocumentPosition) {
                    return a.compareDocumentPosition ? -1 : 1;
                }

                return a.compareDocumentPosition(b) & 4 ? -1 : 1;
            };

        } else {
            sortOrder = function (a, b) {
                // The nodes are identical, we can exit early
                if (a == b) {
                    hasDuplicate = true;
                    return 0;
                    // Fallback to using sourceIndex (in IE) if it's available on both nodes
                } else if (a.sourceIndex && b.sourceIndex) {
                    return a.sourceIndex - b.sourceIndex;
                }
            };
        }
    })();


    // 调整 context 为合理值
    function tuneContext(context) {
        return query(context, undefined);
    }

    // query #id
    function getElementById(id, context) {
        var doc = context,
            el;
        if (context.nodeType !== DOM.DOCUMENT_NODE) {
            doc = context.ownerDocument;
        }
        el = doc.getElementById(id);
        if (el && el.id === id) {
            // optimize for common usage
        }
        else if (el && el.parentNode) {
            // ie opera confuse name with id
            // https://github.com/kissyteam/kissy/issues/67
            // 不能直接 el.id ，否则 input shadow form attribute
            if (!idEq(el, id)) {
                // 直接在 context 下的所有节点找
                el = DOM.filter(ANY, "#" + id, context)[0] || null;
            }
            // ie 特殊情况下以及指明在 context 下找了，不需要再判断
            // 如果指定了 context node , 还要判断 id 是否处于 context 内
            else if (!testByContext(el, context)) {
                el = null;
            }
        } else {
            el = null;
        }
        return el;
    }

    // query tag
    function getElementsByTagName(tag, context) {
        return context && makeArray(context.getElementsByTagName(tag)) || [];
    }

    (function () {
        // Check to see if the browser returns only elements
        // when doing getElementsByTagName('*')

        // Create a fake element
        var div = doc.createElement('div');
        div.appendChild(doc.createComment(''));

        // Make sure no comments are found
        if (div.getElementsByTagName(ANY).length > 0) {
            getElementsByTagName = function (tag, context) {
                var ret = makeArray(context.getElementsByTagName(tag));
                if (tag === ANY) {
                    var t = [], i = 0, node;
                    while ((node = ret[i++])) {
                        // Filter out possible comments
                        if (node.nodeType === 1) {
                            t.push(node);
                        }
                    }
                    ret = t;
                }
                return ret;
            };
        }
    })();

    // query .cls
    var getElementsByClassName = doc.getElementsByClassName ? function (cls, tag, context) {
        // query("#id1 xx","#id2")
        // #id2 内没有 #id1 , context 为 null , 这里防御下
        if (!context) {
            return [];
        }
        var els = context.getElementsByClassName(cls),
            ret,
            i = 0,
            len = els.length,
            el;

        if (tag && tag !== ANY) {
            ret = [];
            for (; i < len; ++i) {
                el = els[i];
                if (nodeName(el, tag)) {
                    ret.push(el);
                }
            }
        } else {
            ret = makeArray(els);
        }
        return ret;
    } : ( doc.querySelectorAll ? function (cls, tag, context) {
        // ie8 return staticNodeList 对象,[].concat 会形成 [ staticNodeList ] ，手动转化为普通数组
        return context && makeArray(context.querySelectorAll((tag ? tag : '') + '.' + cls)) || [];
    } : function (cls, tag, context) {
        if (!context) {
            return [];
        }
        var els = context.getElementsByTagName(tag || ANY),
            ret = [],
            i = 0,
            len = els.length,
            el;
        for (; i < len; ++i) {
            el = els[i];
            if (hasClass(el, cls)) {
                ret.push(el);
            }
        }
        return ret;
    });

    function hasClass(el, cls) {
        var className;
        return (className = el.className) && (" " + className + " ").indexOf(" " + cls + " ") !== -1;
    }

    // throw exception
    function error(msg) {
        S.error('Unsupported selector: ' + msg);
    }

    S.mix(DOM,
        /**
         * @lends DOM
         */
        {

            /**
             * Retrieves an Array of HTMLElement based on the given CSS selector.
             * @param {String|HTMLElement[]} selector
             * @function
             * @param {String|HTMLElement[]} [context] find elements matching selector under context
             * @return {HTMLElement[]} The array of found HTMLElement
             */
            query:query,

            /**
             * Retrieves an Array of HTMLElement based on the given CSS selector.
             * @param {String|HTMLElement[]|HTMLElement} selector
             * @param {String|HTMLElement[]|HTMLElement} [context] find elements matching selector under context
             * @return {HTMLElement} the first element of array of found HTMLElement
             */
            get:function (selector, context) {
                return query(selector, context)[0] || null;
            },

            /**
             * 对一批元素集合去重
             * @param {HTMLElement[]} elements
             * @function
             * @return {HTMLElement[]} 去重后的元素集合
             */
            unique:unique,

            /**
             * Filters an array of elements to only include matches of a filter.
             * @param {String|HTMLElement[]} selector
             * @param {String|Function} filter filter selector or filter function
             * @param {String|HTMLElement[]} [context] find elements matching selector under context
             * @return {HTMLElement[]} 过滤后的元素集合
             */
            filter:function (selector, filter, context) {
                var elems = query(selector, context),
                    sizzle = require("sizzle"),
                    match,
                    tag,
                    id,
                    cls,
                    ret = [];

                // 默认仅支持最简单的 tag.cls 或 #id 形式
                if (isString(filter) &&
                    (filter = trim(filter)) &&
                    (match = REG_QUERY.exec(filter))) {
                    id = match[1];
                    tag = match[2];
                    cls = match[3];
                    if (!id) {
                        filter = function (elem) {
                            var tagRe = true, clsRe = true;

                            // 指定 tag 才进行判断
                            if (tag) {
                                tagRe = nodeName(elem, tag);
                            }

                            // 指定 cls 才进行判断
                            if (cls) {
                                clsRe = hasClass(elem, cls);
                            }

                            return clsRe && tagRe;
                        }
                    } else if (id && !tag && !cls) {
                        filter = function (elem) {
                            return idEq(elem, id);
                        };
                    }
                }

                if (S.isFunction(filter)) {
                    ret = S.filter(elems, filter);
                }
                // 其它复杂 filter, 采用外部选择器
                else if (filter && sizzle) {
                    ret = sizzle.matches(filter, elems);
                }
                // filter 为空或不支持的 selector
                else {
                    error(filter);
                }

                return ret;
            },

            /**
             * Returns true if the passed element(s) match the passed filter
             * @param {String|HTMLElement[]} selector
             * @param {String|Function} filter filter selector or filter function
             * @param {String|HTMLElement[]} [context] find elements matching selector under context
             * @returns {Boolean}
             */
            test:function (selector, filter, context) {
                var elements = query(selector, context);
                return elements.length && (DOM.filter(elements, filter, context).length === elements.length);
            }
        });


    function idEq(elem, id) {
        // form !
        var idNode = elem.getAttributeNode("id");
        return idNode && idNode.nodeValue === id;
    }

    return DOM;
}, {
    requires:["./base"]
});

/**
 * NOTES:
 *
 * 2011.08.02
 *  - 利用 sizzle 重构选择器
 *  - 1.1.6 修正，原来 context 只支持 #id 以及 document
 *    1.2 context 支持任意，和 selector 格式一致
 *  - 简单选择器也和 jquery 保持一致 DOM.query("xx","yy") 支持
 *    - context 不提供则为当前 document ，否则通过 query 递归取得
 *    - 保证选择出来的节点（除了 document window）都是位于 context 范围内
 *
 *
 * 2010.01
 *  - 对 reg exec 的结果(id, tag, className)做 cache, 发现对性能影响很小，去掉。
 *  - getElementById 使用频率最高，使用直达通道优化。
 *  - getElementsByClassName 性能优于 querySelectorAll, 但 IE 系列不支持。
 *  - instanceof 对性能有影响。
 *  - 内部方法的参数，比如 cls, context 等的异常情况，已经在 query 方法中有保证，无需冗余“防卫”。
 *  - query 方法中的条件判断考虑了“频率优先”原则。最有可能出现的情况放在前面。
 *  - Array 的 push 方法可以用 j++ 来替代，性能有提升。
 *  - 返回值策略和 Sizzle 一致，正常时，返回数组；其它所有情况，返回空数组。
 *
 *  - 从压缩角度考虑，还可以将 getElmentsByTagName 和 getElementsByClassName 定义为常量，
 *    不过感觉这样做太“压缩控”，还是保留不替换的好。
 *
 *  - 调整 getElementsByClassName 的降级写法，性能最差的放最后。
 *
 * 2010.02
 *  - 添加对分组选择器的支持（主要参考 Sizzle 的代码，代去除了对非 Grade A 级浏览器的支持）
 *
 * 2010.03
 *  - 基于原生 dom 的两个 api: S.query 返回数组; S.get 返回第一个。
 *    基于 Node 的 api: S.one, 在 Node 中实现。
 *    基于 NodeList 的 api: S.all, 在 NodeList 中实现。
 *    通过 api 的分层，同时满足初级用户和高级用户的需求。
 *
 * 2010.05
 *  - 去掉给 S.query 返回值默认添加的 each 方法，保持纯净。
 *  - 对于不支持的 selector, 采用外部耦合进来的 Selector.
 *
 * 2010.06
 *  - 增加 filter 和 test 方法
 *
 * 2010.07
 *  - 取消对 , 分组的支持，group 直接用 Sizzle
 *
 * 2010.08
 *  - 给 S.query 的结果 attach each 方法
 *
 * 2011.05
 *  - 承玉：恢复对简单分组支持
 *
 * Ref: http://ejohn.org/blog/selectors-that-people-actually-use/
 * 考虑 2/8 原则，仅支持以下选择器：
 * #id
 * tag
 * .cls
 * #id tag
 * #id .cls
 * tag.cls
 * #id tag.cls
 * 注 1：REG_QUERY 还会匹配 #id.cls
 * 注 2：tag 可以为 * 字符
 * 注 3: 支持 , 号分组
 *
 *
 * Bugs:
 *  - S.query('#test-data *') 等带 * 号的选择器，在 IE6 下返回的值不对。jQuery 等类库也有此 bug, 诡异。
 *
 * References:
 *  - http://ejohn.org/blog/selectors-that-people-actually-use/
 *  - http://ejohn.org/blog/thoughts-on-queryselectorall/
 *  - MDC: querySelector, querySelectorAll, getElementsByClassName
 *  - Sizzle: http://github.com/jeresig/sizzle
 *  - MINI: http://james.padolsey.com/javascript/mini/
 *  - Peppy: http://jamesdonaghue.com/?p=40
 *  - Sly: http://github.com/digitarald/sly
 *  - XPath, TreeWalker：http://www.cnblogs.com/rubylouvre/archive/2009/07/24/1529640.html
 *
 *  - http://www.quirksmode.org/blog/archives/2006/01/contains_for_mo.html
 *  - http://www.quirksmode.org/dom/getElementsByTagNames.html
 *  - http://ejohn.org/blog/comparing-document-position/
 *  - http://github.com/jeresig/sizzle/blob/master/sizzle.js
 */
/**
 * @fileOverview style for ie
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add('dom/style-ie', function (S, DOM, UA, Style) {

    var HUNDRED = 100;

    // only for ie
    if (!UA['ie']) {
        return DOM;
    }

    var doc = document,
        docElem = doc.documentElement,
        OPACITY = 'opacity',
        STYLE = 'style',
        FILTER = "filter",
        CURRENT_STYLE = 'currentStyle',
        RUNTIME_STYLE = 'runtimeStyle',
        LEFT = 'left',
        PX = 'px',
        CUSTOM_STYLES = Style._CUSTOM_STYLES,
        RE_NUMPX = /^-?\d+(?:px)?$/i,
        RE_NUM = /^-?\d/,
        backgroundPosition = "backgroundPosition",
        ropacity = /opacity=([^)]*)/,
        ralpha = /alpha\([^)]*\)/i;

    // odd backgroundPosition
    CUSTOM_STYLES[backgroundPosition] = {
        get:function (elem, computed) {
            if (computed) {
                return elem[CURRENT_STYLE][backgroundPosition + "X"] +
                    " " +
                    elem[CURRENT_STYLE][backgroundPosition + "Y"];
            } else {
                return elem[STYLE][backgroundPosition];
            }
        }
    };

    // use alpha filter for IE opacity
    try {
        if (docElem.style[OPACITY] == null) {

            CUSTOM_STYLES[OPACITY] = {

                get:function (elem, computed) {
                    // 没有设置过 opacity 时会报错，这时返回 1 即可
                    // 如果该节点没有添加到 dom ，取不到 filters 结构
                    // val = elem[FILTERS]['DXImageTransform.Microsoft.Alpha'][OPACITY];
                    return ropacity.test((
                        computed && elem[CURRENT_STYLE] ?
                            elem[CURRENT_STYLE][FILTER] :
                            elem[STYLE][FILTER]) || "") ?
                        ( parseFloat(RegExp.$1) / HUNDRED ) + "" :
                        computed ? "1" : "";
                },

                set:function (elem, val) {
                    val = parseFloat(val);

                    var style = elem[STYLE],
                        currentStyle = elem[CURRENT_STYLE],
                        opacity = isNaN(val) ? "" : "alpha(" + OPACITY + "=" + val * HUNDRED + ")",
                        filter = S.trim(currentStyle && currentStyle[FILTER] || style[FILTER] || "");

                    // ie  has layout
                    style.zoom = 1;

                    // if setting opacity to 1, and no other filters exist - attempt to remove filter attribute
                    if (val >= 1 && S.trim(filter.replace(ralpha, "")) === "") {

                        // Setting style.filter to null, "" & " " still leave "filter:" in the cssText
                        // if "filter:" is present at all, clearType is disabled, we want to avoid this
                        // style.removeAttribute is IE Only, but so apparently is this code path...
                        style.removeAttribute(FILTER);

                        // if there there is no filter style applied in a css rule, we are done
                        if (currentStyle && !currentStyle[FILTER]) {
                            return;
                        }
                    }

                    // otherwise, set new filter values
                    // 如果 >=1 就不设，就不能覆盖外部样式表定义的样式，一定要设
                    style.filter = ralpha.test(filter) ?
                        filter.replace(ralpha, opacity) :
                        filter + (filter ? ", " : "") + opacity;
                }
            };
        }
    }
    catch (ex) {
        S.log('IE filters ActiveX is disabled. ex = ' + ex);
    }

    /*
     border fix
     ie 不设置数值，则 computed style 不返回数值，只返回 thick? medium ...
     (default is "medium")
     */
    var IE8 = UA['ie'] == 8,
        BORDER_MAP = {
        },
        BORDERS = ["", "Top", "Left", "Right", "Bottom"];
    BORDER_MAP['thin'] = IE8 ? '1px' : '2px';
    BORDER_MAP['medium'] = IE8 ? '3px' : '4px';
    BORDER_MAP['thick'] = IE8 ? '5px' : '6px';

    S.each(BORDERS, function (b) {
        var name = "border" + b + "Width",
            styleName = "border" + b + "Style";

        /**
         * @ignore
         */
        CUSTOM_STYLES[name] = {
            get:function (elem, computed) {
                // 只有需要计算样式的时候才转换，否则取原值
                var currentStyle = computed ? elem[CURRENT_STYLE] : 0,
                    current = currentStyle && String(currentStyle[name]) || undefined;
                // look up keywords if a border exists
                if (current && current.indexOf("px") < 0) {
                    // 边框没有隐藏
                    if (BORDER_MAP[current] && currentStyle[styleName] !== "none") {
                        current = BORDER_MAP[current];
                    } else {
                        // otherwise no border
                        current = 0;
                    }
                }
                return current;
            }
        };
    });

    // getComputedStyle for IE
    if (!(doc.defaultView || { }).getComputedStyle && docElem[CURRENT_STYLE]) {

        DOM._getComputedStyle = function (elem, name) {
            name = DOM._cssProps[name] || name;

            var ret = elem[CURRENT_STYLE] && elem[CURRENT_STYLE][name];

            // 当 width/height 设置为百分比时，通过 pixelLeft 方式转换的 width/height 值
            // 一开始就处理了! CUSTOM_STYLE["height"],CUSTOM_STYLE["width"] ,cssHook 解决@2011-08-19
            // 在 ie 下不对，需要直接用 offset 方式
            // borderWidth 等值也有问题，但考虑到 borderWidth 设为百分比的概率很小，这里就不考虑了

            // From the awesome hack by Dean Edwards
            // http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291
            // If we're not dealing with a regular pixel number
            // but a number that has a weird ending, we need to convert it to pixels
            if ((!RE_NUMPX.test(ret) && RE_NUM.test(ret))) {
                // Remember the original values
                var style = elem[STYLE],
                    left = style[LEFT],
                    rsLeft = elem[RUNTIME_STYLE] && elem[RUNTIME_STYLE][LEFT];

                // Put in the new values to get a computed value out
                if (rsLeft) {
                    elem[RUNTIME_STYLE][LEFT] = elem[CURRENT_STYLE][LEFT];
                }
                style[LEFT] = name === 'fontSize' ? '1em' : (ret || 0);
                ret = style['pixelLeft'] + PX;

                // Revert the changed values
                style[LEFT] = left;
                if (rsLeft) {
                    elem[RUNTIME_STYLE][LEFT] = rsLeft;
                }
            }
            return ret === "" ? "auto" : ret;
        };
    }
    return DOM;
}, {
    requires:["./base", "ua", "./style"]
});
/**
 * NOTES:
 *
 * yiminghe@gmail.com: 2011.12.21 backgroundPosition in ie
 *  - currentStyle['backgroundPosition'] undefined
 *  - currentStyle['backgroundPositionX'] ok
 *  - currentStyle['backgroundPositionY'] ok
 *
 *
 * yiminghe@gmail.com： 2011.05.19 opacity in ie
 *  - 如果节点是动态创建，设置opacity，没有加到 dom 前，取不到 opacity 值
 *  - 兼容：border-width 值，ie 下有可能返回 medium/thin/thick 等值，其它浏览器返回 px 值。
 *
 *  - opacity 的实现，参考自 jquery
 *
 */
/**
 * @fileOverview   dom/style
 * @author  yiminghe@gmail.com,lifesinger@gmail.com
 */
KISSY.add('dom/style', function (S, DOM, UA, undefined) {
    "use strict";
    var doc = document,
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
             *  Get style property from the first element of matched elements
             *  or set the style property on all matched elements
             *  @param {HTMLElement[]|String|HTMLElement} selector 选择器或节点或节点数组
             *  @param {String} name 样式名称
             *  @param [val] 样式值
             *  @returns 当不设置 val 时返回指定样式名对应的值
             *           设置 val 时返回 undefined
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
             * Gets computed style from the first element of matched elements
             * or sets styles on the matches elements.
             * @param {HTMLElement[]|String|HTMLElement|Element} selector 选择器或节点或节点数组
             * @param {String|Object} name 样式名称或样式键值对
             * @param [val] 样式值
             * @returns {*} 当不设置 val 时返回指定样式名对应的值
             *          设置 val 时返回 undefined
             */
            css:function (selector, name, val) {
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
             * Show the matched elements.
             * @param {HTMLElement[]|String|HTMLElement} selector 选择器或节点或节点数组
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
             * @param {HTMLElement[]|String|HTMLElement} selector 选择器或节点或节点数组
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
             * @param {HTMLElement[]|String|HTMLElement} selector 选择器或节点或节点数组
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
             * @param [refWin] Window which will accept this stylesheet
             * @param {String} cssText The text containing the css rules
             * @param {String} id An id to add to the stylesheet for later removal
             */
            addStyleSheet:function (refWin, cssText, id) {
                refWin = refWin || window;
                if (S.isString(refWin)) {
                    id = cssText;
                    cssText = refWin;
                    refWin = window;
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
             * make matched elements unselectable
             * @param {HTMLElement[]|String|HTMLElement} selector 选择器或节点或节点数组
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
             * Get innerWidth (css width + padding) from the first element of matched elements
             * @function
             * @param {HTMLElement[]|String|HTMLElement} selector 选择器或节点或节点数组
             * @returns {Number}
             */
            innerWidth:0,
            /**
             * Get innerHeight (css height + padding) from the first element of matched elements
             * @function
             * @param {HTMLElement[]|String|HTMLElement} selector 选择器或节点或节点数组
             * @returns {Number}
             */
            innerHeight:0,
            /**
             * Get outerWidth (css width + padding + border + margin?) from the first element of matched elements
             * @function
             * @param {HTMLElement[]|String|HTMLElement} selector 选择器或节点或节点数组
             * @param {Boolean} includeMargin whether include margin
             * @returns {Number}
             */
            outerWidth:0,
            /**
             * Get outerHeight (css height + padding + border + margin?) from the first element of matched elements
             * @function
             * @param {HTMLElement[]|String|HTMLElement} selector 选择器或节点或节点数组
             * @param {Boolean} includeMargin whether include margin
             * @returns {Number}
             */
            outerHeight:0,
            /**
             * Get css width from the first element of matched elements
             * @function
             * @param {HTMLElement[]|String|HTMLElement} selector 选择器或节点或节点数组
             * @returns {Number}
             */
            width:0,
            /**
             * Get css height from the first element of matched elements
             * @function
             * @param {HTMLElement[]|String|HTMLElement} selector 选择器或节点或节点数组
             * @returns {Number}
             */
            height:0
        });

    function capital(str) {
        return str.charAt(0).toUpperCase() + str.substring(1);
    }


    S.each([WIDTH, HEIGHT], function (name) {
        DOM["inner" + capital(name)] = function (selector) {
            var el = DOM.get(selector);
            return el && getWH(el, name, "padding");
        };


        DOM["outer" + capital(name)] = function (selector, includeMargin) {
            var el = DOM.get(selector);
            if (el) {
                return getWH(el, name, includeMargin ? "margin" : "border");
            } else {
                return null;
            }
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
                var val;
                if (computed) {
                    if (elem.offsetWidth !== 0) {
                        val = getWH(elem, name);
                    } else {
                        swap(elem, cssShow, function () {
                            val = getWH(elem, name);
                        });
                    }
                    return val + "px";
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
                            if (isIE && document['documentMode'] != 9 || UA['opera']) {
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

            return val
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
/**
 * @fileOverview   dom-traversal
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add('dom/traversal', function (S, DOM, undefined) {

    var isElementNode = DOM._isElementNode,
        CONTAIN_MASK = 16,
        __contains = document.documentElement.contains ?
            function (a, b) {
                if (a.nodeType == DOM.TEXT_NODE) {
                    return false;
                }
                var precondition;
                if (b.nodeType == DOM.TEXT_NODE) {
                    b = b.parentNode;
                    // a 和 b父亲相等也就是返回 true
                    precondition = true;
                } else if (b.nodeType == DOM.DOCUMENT_NODE) {
                    // b === document
                    // 没有任何元素能包含 document
                    return false;
                } else {
                    // a 和 b 相等返回 false
                    precondition = a !== b;
                }
                // !a.contains => a===document
                // 注意原生 contains 判断时 a===b 也返回 true
                return precondition && (a.contains ? a.contains(b) : true);
            } : (
            document.documentElement.compareDocumentPosition ?
                function (a, b) {
                    return !!(a.compareDocumentPosition(b) & CONTAIN_MASK);
                } :
                // it can not be true , pathetic browser
                0
            );


    S.mix(DOM,
        /**
         * @lends DOM
         */
        {

            /**
             * Get the matched node which is ancestor or is the first matched element.
             * @param {HTMLElement[]|String|HTMLElement} selector 选择器或节点或节点数组
             * @param {String|Function} filter filter function or string
             * @param {HTMLElement|String} context dom node bounded for search
             * @returns {HTMLElement}
             */
            closest:function (selector, filter, context) {
                return nth(selector, filter, 'parentNode', function (elem) {
                    return elem.nodeType != DOM.DOCUMENT_FRAGMENT_NODE;
                }, context, true);
            },

            /**
             * Gets the ancestor of the first matched element.
             * @param {HTMLElement[]|String|HTMLElement} selector 选择器或节点或节点数组
             * @param {String|Function} filter filter function or string
             * @param {HTMLElement|String} context dom node bounded for search
             * @returns {HTMLElement}
             */
            parent:function (selector, filter, context) {
                return nth(selector, filter, 'parentNode', function (elem) {
                    return elem.nodeType != DOM.DOCUMENT_FRAGMENT_NODE;
                }, context);
            },

            /**
             * Get the first child of the first matched element
             * @param {HTMLElement[]|String|HTMLElement} selector 选择器或节点或节点数组
             * @param {String|Function} filter filter function or string
             * @returns {HTMLElement}
             */
            first:function (selector, filter) {
                var elem = DOM.get(selector);
                return nth(elem && elem.firstChild, filter, 'nextSibling',
                    undefined, undefined, true);
            },

            /**
             * Get the last child of the first matched element
             * @param {HTMLElement[]|String|HTMLElement} selector 选择器或节点或节点数组
             * @param {String|Function} filter filter function or string
             * @returns {HTMLElement}
             */
            last:function (selector, filter) {
                var elem = DOM.get(selector);
                return nth(elem && elem.lastChild, filter, 'previousSibling',
                    undefined, undefined, true);
            },

            /**
             * Gets the following sibling of the first matched element.
             * @param {HTMLElement[]|String|HTMLElement} selector 选择器或节点或节点数组
             * @param {String|Function} filter filter function or string
             * @returns {HTMLElement}
             */
            next:function (selector, filter) {
                return nth(selector, filter, 'nextSibling', undefined);
            },

            /**
             * Gets the preceding sibling of the first matched element.
             * @param {HTMLElement[]|String|HTMLElement} selector 选择器或节点或节点数组
             * @param {String|Function} filter filter function or string
             * @returns {HTMLElement}
             */
            prev:function (selector, filter) {
                return nth(selector, filter, 'previousSibling', undefined);
            },

            /**
             * Gets the siblings of the first matched element.
             * @param {HTMLElement[]|String|HTMLElement} selector 选择器或节点或节点数组
             * @param {String|Function} filter filter function or string
             * @returns {HTMLElement[]}
             */
            siblings:function (selector, filter) {
                return getSiblings(selector, filter, true);
            },

            /**
             * Gets the children of the first matched element.
             * @param {HTMLElement[]|String|HTMLElement} selector 选择器或节点或节点数组
             * @param {String|Function} filter filter function or string
             * @returns {HTMLElement[]}
             */
            children:function (selector, filter) {
                return getSiblings(selector, filter, undefined);
            },

            /**
             * Check to see if a DOM node is within another DOM node.
             * @param {HTMLElement|String|Element} a dom node or the first matched elements by selector
             * @param {HTMLElement|String|Element} b dom node or the first matched elements by selector
             * @returns {Boolean} whether a contains b , note if a===b return false.
             */
            contains:function (a, b) {
                a = DOM.get(a);
                b = DOM.get(b);
                if (a && b) {
                    return __contains(a, b);
                }
                return false;
            },

            /**
             * whether a dom node or dom nodes is same as another dom node or dom nodes
             * @param {HTMLElement|String|HTMLElement[]} n1
             * @param {HTMLElement|String|HTMLElement[]} n2
             * @returns {Boolean} whether n1 is equal as n2
             */
            equals:function (n1, n2) {
                n1 = DOM.query(n1);
                n2 = DOM.query(n2);
                if (n1.length != n2.length) {
                    return false;
                }
                for (var i = n1.length; i >= 0; i--) {
                    if (n1[i] != n2[i]) {
                        return false;
                    }
                }
                return true;
            }
        });

    // 获取元素 elem 在 direction 方向上满足 filter 的第一个元素
    // filter 可为 number, selector, fn array ，为数组时返回多个
    // direction 可为 parentNode, nextSibling, previousSibling
    // context : 到某个阶段不再查找直接返回
    function nth(elem, filter, direction, extraFilter, context, includeSef) {
        if (!(elem = DOM.get(elem))) {
            return null;
        }
        if (filter === 0) {
            return elem;
        }
        if (!includeSef) {
            elem = elem[direction];
        }
        if (!elem) {
            return null;
        }
        context = (context && DOM.get(context)) || null;

        if (filter === undefined) {
            // 默认取 1
            filter = 1;
        }
        var ret = [],
            isArray = S.isArray(filter),
            fi,
            flen;

        if (S.isNumber(filter)) {
            fi = 0;
            flen = filter;
            filter = function () {
                return ++fi === flen;
            };
        }

        // 概念统一，都是 context 上下文，只过滤子孙节点，自己不管
        while (elem && elem != context) {
            if (isElementNode(elem)
                && testFilter(elem, filter)
                && (!extraFilter || extraFilter(elem))) {
                ret.push(elem);
                if (!isArray) {
                    break;
                }
            }
            elem = elem[direction];
        }

        return isArray ? ret : ret[0] || null;
    }

    function testFilter(elem, filter) {
        if (!filter) {
            return true;
        }
        if (S.isArray(filter)) {
            for (var i = 0; i < filter.length; i++) {
                if (DOM.test(elem, filter[i])) {
                    return true;
                }
            }
        } else if (DOM.test(elem, filter)) {
            return true;
        }
        return false;
    }

    // 获取元素 elem 的 siblings, 不包括自身
    function getSiblings(selector, filter, parent) {
        var ret = [],
            elem = DOM.get(selector),
            j,
            parentNode = elem,
            next;
        if (elem && parent) {
            parentNode = elem.parentNode;
        }

        if (parentNode) {
            for (j = 0, next = parentNode.firstChild;
                 next;
                 next = next.nextSibling) {
                if (isElementNode(next)
                    && next !== elem
                    && (!filter || DOM.test(next, filter))) {
                    ret[j++] = next;
                }
            }
        }

        return ret;
    }

    return DOM;
}, {
    requires:["./base"]
});

/**
 * 2011-08
 * - 添加 closest , first ,last 完全摆脱原生属性
 *
 * NOTES:
 * - jquery does not return null ,it only returns empty array , but kissy does.
 *
 *  - api 的设计上，没有跟随 jQuery. 一是为了和其他 api 一致，保持 first-all 原则。二是
 *    遵循 8/2 原则，用尽可能少的代码满足用户最常用的功能。
 *
 */
