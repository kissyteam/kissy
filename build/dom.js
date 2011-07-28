/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: Jul 20 18:42
*/
/**
 * @module  dom-attr
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add('dom/attr', function(S, DOM, UA, undefined) {

    var doc = document,
        docElement = doc.documentElement,
        oldIE = !docElement.hasAttribute,
        TEXT = docElement.textContent !== undefined ?
            'textContent' : 'innerText',
        EMPTY = '',
        isElementNode = DOM._isElementNode,
        isTextNode = function(elem) {
            return DOM._nodeTypeIs(elem, 3);
        },
        rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,
        rfocusable = /^(?:button|input|object|select|textarea)$/i,
        rclickable = /^a(?:rea)?$/i,
        rinvalidChar = /:|^on/,
        rreturn = /\r/g,
        attrFix = {
        },
        attrFn = {
            val: 1,
            css: 1,
            html: 1,
            text: 1,
            data: 1,
            width: 1,
            height: 1,
            offset: 1
        },
        attrHooks = {
            // http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
            tabindex:{
                get:function(el) {
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
                get:function(el) {
                    return el.style.cssText;
                },
                set:function(el, val) {
                    el.style.cssText = val;
                }
            }
        },
        propFix = {
            tabindex: "tabIndex",
            readonly: "readOnly",
            "for": "htmlFor",
            "class": "className",
            maxlength: "maxLength",
            cellspacing: "cellSpacing",
            "cellpadding": "cellPadding",
            rowspan: "rowSpan",
            colspan: "colSpan",
            usemap: "useMap",
            frameborder: "frameBorder",
            "contenteditable": "contentEditable"
        },
        // Hook for boolean attributes
        // if bool is false
        //  - standard browser returns null
        //  - ie<8 return false
        //   - so norm to undefined
        boolHook = {
            get: function(elem, name) {
                // 转发到 prop 方法
                return DOM.prop(elem, name) ?
                    // 根据 w3c attribute , true 时返回属性名字符串
                    name.toLowerCase() :
                    undefined;
            },
            set: function(elem, value, name) {
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
            option: {
                get: function(elem) {
                    // 当没有设定 value 时，标准浏览器 option.value === option.text
                    // ie7- 下，没有设定 value 时，option.value === '', 需要用 el.attributes.value 来判断是否有设定 value
                    var val = elem.attributes.value;
                    return !val || val.specified ? elem.value : elem.text;
                }
            },
            select: {
                // 对于 select, 特别是 multiple type, 存在很严重的兼容性问题
                get: function(elem) {
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

                set: function(elem, value) {
                    var values = S.makeArray(value),
                        opts = elem.options;
                    S.each(opts, function(opt) {
                        opt.selected = S.inArray(DOM.val(opt), values);
                    });

                    if (!values.length) {
                        elem.selectedIndex = -1;
                    }
                    return values;
                }
            }};

    if (oldIE) {

        // get attribute value from attribute node for ie
        attrNodeHook = {
            get: function(elem, name) {
                var ret;
                ret = elem.getAttributeNode(name);
                // Return undefined if nodeValue is empty string
                return ret && ret.nodeValue !== "" ?
                    ret.nodeValue :
                    undefined;
            },
            set: function(elem, value, name) {
                // Check form objects in IE (multiple bugs related)
                // Only use nodeValue if the attribute node exists on the form
                var ret = elem.getAttributeNode(name);
                if (ret) {
                    ret.nodeValue = value;
                }
            }
        },


            // ie6,7 不区分 attribute 与 property
            attrFix = propFix;
        // http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
        attrHooks.tabIndex = attrHooks.tabindex;
        // fix ie bugs
        // 不光是 href, src, 还有 rowspan 等非 mapping 属性，也需要用第 2 个参数来获取原始值
        // 注意 colSpan rowSpan 已经由 propFix 转为大写
        S.each([ "href", "src", "width", "height","colSpan","rowSpan" ], function(name) {
            attrHooks[ name ] = {
                get: function(elem) {
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

    S.each([ "radio", "checkbox" ], function(r) {
        valHooks[ r ] = {
            get: function(elem) {
                // Handle the case where in Webkit "" is returned instead of "on" if a value isn't specified
                return elem.getAttribute("value") === null ? "on" : elem.value;
            },
            set: function(elem, value) {
                if (S.isArray(value)) {
                    return elem.checked = S.inArray(DOM.val(elem), value);
                }
            }

        };
    });

    function getProp(elem, name) {
        name = propFix[ name ] || name;
        var hook = propHooks[ name ];
        if (!elem) return undefined;
        if (hook && hook.get) {
            return hook.get(elem, name);

        } else {
            return elem[ name ];
        }
    }

    S.mix(DOM, {

        /**
         * 自定义属性不推荐使用，使用 .data
         * @param selector
         * @param name
         * @param value
         */
        prop: function(selector, name, value) {
            // suports hash
            if (S.isPlainObject(name)) {
                for (var k in name) {
                    DOM.prop(selector, k, name[k]);
                }
                return;
            }
            var elems = DOM.query(selector);
            // Try to normalize/fix the name
            name = propFix[ name ] || name;
            var hook = propHooks[ name ];
            if (value !== undefined) {
                S.each(elems, function(elem) {
                    if (hook && hook.set) {
                        hook.set(elem, value, name);
                    } else {
                        elem[ name ] = value;
                    }
                });
            } else {
                var elem = elems[0];
                if (!elem) return;
                return getProp(elem, name);
            }
        },
        hasProp:function(selector, name) {
            return getProp(selector, name) !== undefined;
        },

        /**
         * 不推荐使用，使用 .data .removeData
         * @param selector
         * @param name
         */
        removeProp:function(selector, name) {
            name = propFix[ name ] || name;
            DOM.query(selector).each(function(el) {
                try {
                    el[ name ] = undefined;
                    delete el[ name ];
                } catch(e) {
                }
            });
        },

        /**
         * Gets the value of an attribute for the first element in the set of matched elements or
         * Sets an attribute for the set of matched elements.
         */
        attr:function(selector, name, val, pass) {
            // suports hash
            if (S.isPlainObject(name)) {
                pass = val; // 塌缩参数
                for (var k in name) {
                    DOM.attr(selector, k, name[k], pass);
                }
                return;
            }

            if (!(name = S.trim(name))) return;

            name = name.toLowerCase();

            // attr functions
            if (pass && attrFn[name]) {
                return DOM[name](selector, val);
            }

            // custom attrs
            name = attrFix[name] || name;

            var attrNormalizer;

            if (rboolean.test(name)) {
                attrNormalizer = boolHook;
            }
            // only old ie?
            else if (rinvalidChar.test(name)) {
                attrNormalizer = attrNodeHook;
            } else {
                attrNormalizer = attrHooks[name];
            }

            // getter
            if (val === undefined) {
                // supports css selector/Node/NodeList
                var el = DOM.get(selector);
                // only get attributes on element nodes
                if (!isElementNode(el)) {
                    return;
                }

                // browsers index elements by id/name on forms, give priority to attributes.
                if (el.nodeName.toLowerCase() == "form") {
                    attrNormalizer = attrNodeHook;
                }
                if (attrNormalizer && attrNormalizer.get) {
                    return attrNormalizer.get(el, name);
                }

                var ret = el.getAttribute(name);

                // standard browser non-existing attribute return null
                // ie<8 will return undefined , because it return property
                // so norm to undefined
                return ret === null ? undefined : ret;
            } else {
                // setter
                S.each(DOM.query(selector), function(el) {
                    // only set attributes on element nodes
                    if (!isElementNode(el)) {
                        return;
                    }

                    if (attrNormalizer && attrNormalizer.set) {
                        attrNormalizer.set(el, val, name);
                    } else {
                        // convert the value to a string (all browsers do this but IE)
                        el.setAttribute(name, EMPTY + val);
                    }
                });
            }
        },

        /**
         * Removes the attribute of the matched elements.
         */
        removeAttr: function(selector, name) {
            name = name.toLowerCase();
            name = attrFix[name] || name;
            S.each(DOM.query(selector), function(el) {
                if (isElementNode(el)) {
                    var propName;
                    el.removeAttribute(name);
                    // Set corresponding property to false for boolean attributes
                    if (rboolean.test(name) && (propName = propFix[ name ] || name) in el) {
                        el[ propName ] = false;
                    }
                }
            });
        },

        hasAttr: oldIE ?
            function(selector, name) {
                name = name.toLowerCase();
                var el = DOM.get(selector);
                // from ppk :http://www.quirksmode.org/dom/w3c_core.html
                // IE5-7 doesn't return the value of a style attribute.
                // var $attr = el.attributes[name];
                var $attr = el.getAttributeNode(name);
                return !!( $attr && $attr.specified );
            }
            :
            function(selector, name) {
                name = name.toLowerCase();
                var el = DOM.get(selector);
                //使用原生实现
                return el.hasAttribute(name);
            },

        /**
         * Gets the current value of the first element in the set of matched or
         * Sets the value of each element in the set of matched elements.
         */
        val : function(selector, value) {
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

            DOM.query(selector).each(function(elem) {

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
            });
        },

        /**
         * Gets the text context of the first element in the set of matched elements or
         * Sets the text content of the matched elements.
         */
        text: function(selector, val) {
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
                S.each(DOM.query(selector), function(el) {
                    if (isElementNode(el)) {
                        el[TEXT] = val;
                    }
                    else if (isTextNode(el)) {
                        el.nodeValue = val;
                    }
                });
            }
        }
    });
    if (1 > 2) {
        DOM.removeProp().hasProp();
    }
    return DOM;
}, {
    requires:["./base","ua"]
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
 * @module  dom
 * @author  lifesinger@gmail.com
 */
KISSY.add('dom/base', function(S, undefined) {

    function nodeTypeIs(node, val) {
        return node && node.nodeType === val;
    }

    return {

        /**
         * 是不是 element node
         */
        _isElementNode: function(elem) {
            return nodeTypeIs(elem, 1);
        },

        /**
         * elem 为 window 时，直接返回
         * elem 为 document 时，返回关联的 window
         * elem 为 undefined 时，返回当前 window
         * 其它值，返回 false
         */
        _getWin: function(elem) {
            return (elem && ('scrollTo' in elem) && elem['document']) ?
                elem :
                nodeTypeIs(elem, 9) ?
                    elem.defaultView || elem.parentWindow :
                    elem == undefined ?
                        window : false;
        },

        _nodeTypeIs: nodeTypeIs,

        // Ref: http://lifesinger.github.com/lab/2010/nodelist.html
        _isNodeList:function(o) {
            // 注1：ie 下，有 window.item, typeof node.item 在 ie 不同版本下，返回值不同
            // 注2：select 等元素也有 item, 要用 !node.nodeType 排除掉
            // 注3：通过 namedItem 来判断不可靠
            // 注4：getElementsByTagName 和 querySelectorAll 返回的集合不同
            // 注5: 考虑 iframe.contentWindow
            return o && !o.nodeType && o.item && !o.setTimeout;
        }
    };

});
/**
 * @module  dom-class
 * @author  lifesinger@gmail.com
 */
KISSY.add('dom/class', function(S, DOM, undefined) {

    var SPACE = ' ',
        REG_SPLIT = /[\.\s]\s*\.?/,
        REG_CLASS = /[\n\t]/g;

    function norm(elemClass) {
        return (SPACE + elemClass + SPACE).replace(REG_CLASS, SPACE);
    }

    S.mix(DOM, {

            /**
             * Determine whether any of the matched elements are assigned the given class.
             */
            hasClass: function(selector, value) {
                return batch(selector, value, function(elem, classNames, cl) {
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
                        if (ret) return true;
                    }
                }, true);
            },

            /**
             * Adds the specified class(es) to each of the set of matched elements.
             */
            addClass: function(selector, value) {
                batch(selector, value, function(elem, classNames, cl) {
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
             */
            removeClass: function(selector, value) {
                batch(selector, value, function(elem, classNames, cl) {
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
             */
            replaceClass: function(selector, oldClassName, newClassName) {
                DOM.removeClass(selector, oldClassName);
                DOM.addClass(selector, newClassName);
            },

            /**
             * Add or remove one or more classes from each element in the set of
             * matched elements, depending on either the class's presence or the
             * value of the switch argument.
             * @param state {Boolean} optional boolean to indicate whether class
             *        should be added or removed regardless of current state.
             */
            toggleClass: function(selector, value, state) {
                var isBool = S.isBoolean(state), has;

                batch(selector, value, function(elem, classNames, cl) {
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
            i = 0,
            len = elems.length,
            tmp = value.split(REG_SPLIT),
            elem,
            ret;

        var classNames = [];
        for (; i < tmp.length; i++) {
            var t = S.trim(tmp[i]);
            if (t) {
                classNames.push(t);
            }
        }
        i = 0;
        for (; i < len; i++) {
            elem = elems[i];
            if (DOM._isElementNode(elem)) {
                ret = fn(elem, classNames, classNames.length);
                if (ret !== undefined) return ret;
            }
        }

        if (resultIsBool) return false;
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
 * @module  dom-create
 * @author  lifesinger@gmail.com
 */
KISSY.add('dom/create', function(S, DOM, UA, undefined) {

    var doc = document,
        ie = UA['ie'],
        nodeTypeIs = DOM._nodeTypeIs,
        isElementNode = DOM._isElementNode,
        DIV = 'div',
        PARENT_NODE = 'parentNode',
        DEFAULT_DIV = doc.createElement(DIV),
        rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
        RE_TAG = /<(\w+)/,
        // Ref: http://jmrware.com/articles/2010/jqueryregex/jQueryRegexes.html#note_05
        RE_SCRIPT = /<script([^>]*)>([^<]*(?:(?!<\/script>)<[^<]*)*)<\/script>/ig,
        RE_SIMPLE_TAG = /^<(\w+)\s*\/?>(?:<\/\1>)?$/,
        RE_SCRIPT_SRC = /\ssrc=(['"])(.*?)\1/i,
        RE_SCRIPT_CHARSET = /\scharset=(['"])(.*?)\1/i;

    S.mix(DOM, {

            /**
             * Creates a new HTMLElement using the provided html string.
             */
            create: function(html, props, ownerDoc) {
                if (nodeTypeIs(html, 1) || nodeTypeIs(html, 3)) {
                    return cloneNode(html);
                }

                if (!(html = S.trim(html))) {
                    return null;
                }

                var ret = null,
                    creators = DOM._creators,
                    m,
                    tag = DIV,
                    k,
                    nodes;

                // 简单 tag, 比如 DOM.create('<p>')
                if ((m = RE_SIMPLE_TAG.exec(html))) {
                    ret = (ownerDoc || doc).createElement(m[1]);
                }
                // 复杂情况，比如 DOM.create('<img src="sprite.png" />')
                else {
                    // Fix "XHTML"-style tags in all browsers
                    html = html.replace(rxhtmlTag, "<$1></$2>");
                    
                    if ((m = RE_TAG.exec(html))
                        && (k = m[1])
                        && S.isFunction(creators[(k = k.toLowerCase())])) {
                        tag = k;
                    }

                    nodes = creators[tag](html, ownerDoc).childNodes;

                    if (nodes.length === 1) {
                        // return single node, breaking parentNode ref from "fragment"
                        ret = nodes[0][PARENT_NODE].removeChild(nodes[0]);
                    }
                    else {
                        // return multiple nodes as a fragment
                        ret = nl2frag(nodes, ownerDoc || doc);
                    }
                }

                return attachProps(ret, props);
            },

            _creators: {
                div: function(html, ownerDoc) {
                    var frag = ownerDoc ? ownerDoc.createElement(DIV) : DEFAULT_DIV;
                    // html 为 <style></style> 时不行，必须有其他元素？
                    frag.innerHTML = "w<div>" + html + "</div>";
                    return frag.lastChild;
                }
            },

            /**
             * Gets/Sets the HTML contents of the HTMLElement.
             * @param {Boolean} loadScripts (optional) True to look for and process scripts (defaults to false).
             * @param {Function} callback (optional) For async script loading you can be notified when the update completes.
             */
            html: function(selector, val, loadScripts, callback) {
                // getter
                if (val === undefined) {
                    // supports css selector/Node/NodeList
                    var el = DOM.get(selector);

                    // only gets value on element nodes
                    if (isElementNode(el)) {
                        return el.innerHTML;
                    }
                    return;
                }
                // setter
                else {
                    S.each(DOM.query(selector), function(elem) {
                        if (isElementNode(elem)) {
                            setHTML(elem, val, loadScripts, callback);
                        }
                    });
                }
            },

            /**
             * Remove the set of matched elements from the DOM.
             */
            remove: function(selector) {
                S.each(DOM.query(selector), function(el) {
                    if (el.parentNode) {
                        el.parentNode.removeChild(el);
                    }
                });
            },
            _nl2frag:nl2frag
        });

    // 添加成员到元素中
    function attachProps(elem, props) {
        if (S.isPlainObject(props)) {
            if (isElementNode(elem)) {
                DOM.attr(elem, props, true);
            }
            // document fragment
            else if (elem.nodeType == 11) {
                S.each(elem.childNodes, function(child) {
                    DOM.attr(child, props, true);
                });
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

            if (nodes.item) { // convert live list to static array
                nodes = S.makeArray(nodes);
            }

            for (i = 0,len = nodes.length; i < len; i++) {
                ret.appendChild(nodes[i]);
            }
        }
        else {
            S.log('Unable to convert ' + nodes + ' to fragment.');
        }

        return ret;
    }

    function cloneNode(elem) {
        var ret = elem.cloneNode(true);
        /**
         * if this is MSIE 6/7, then we need to copy the innerHTML to
         * fix a bug related to some form field elements
         */
        if (UA['ie'] < 8) {
            ret.innerHTML = elem.innerHTML;
        }
        return ret;
    }

    /**
     * Update the innerHTML of this element, optionally searching for and processing scripts.
     * @refer http://www.sencha.com/deploy/dev/docs/source/Element-more.html#method-Ext.Element-update
     *        http://lifesinger.googlecode.com/svn/trunk/lab/2010/innerhtml-and-script-tags.html
     */
    function setHTML(elem, html, loadScripts, callback) {
        if (!loadScripts) {
            setHTMLSimple(elem, html);
            S.isFunction(callback) && callback();
            return;
        }

        var id = S.guid('ks-tmp-'),
            re_script = new RegExp(RE_SCRIPT); // 防止

        html += '<span id="' + id + '"></span>';

        // 确保脚本执行时，相关联的 DOM 元素已经准备好
        // 不依赖于浏览器特性，正则表达式自己分析
        S.available(id, function() {
            var hd = DOM.get('head'),
                match,
                attrs,
                srcMatch,
                charsetMatch,
                t,
                s,
                text;

            re_script['lastIndex'] = 0;
            while ((match = re_script.exec(html))) {
                attrs = match[1];
                srcMatch = attrs ? attrs.match(RE_SCRIPT_SRC) : false;
                // script via src
                if (srcMatch && srcMatch[2]) {
                    s = doc.createElement('script');
                    s.src = srcMatch[2];
                    // set charset
                    if ((charsetMatch = attrs.match(RE_SCRIPT_CHARSET)) && charsetMatch[2]) {
                        s.charset = charsetMatch[2];
                    }
                    s.async = true; // make sure async in gecko
                    hd.appendChild(s);
                }
                // inline script
                else if ((text = match[2]) && text.length > 0) {
                    // sync , 同步
                    S.globalEval(text);
                }
            }

            // 删除探测节点
            (t = doc.getElementById(id)) && DOM.remove(t);

            // 回调
            S.isFunction(callback) && callback();
        });

        setHTMLSimple(elem, html);
    }

    // 直接通过 innerHTML 设置 html
    function setHTMLSimple(elem, html) {
        html = (html + '').replace(RE_SCRIPT, ''); // 过滤掉所有 script
        try {
            //if(UA.ie) {
            elem.innerHTML = html;
            //} else {
            // Ref:
            //  - http://blog.stevenlevithan.com/archives/faster-than-innerhtml
            //  - http://fins.javaeye.com/blog/183373
            //var tEl = elem.cloneNode(false);
            //tEl.innerHTML = html;
            //elem.parentNode.replaceChild(elem, tEl);
            // 注：上面的方式会丢失掉 elem 上注册的事件，放类库里不妥当
            //}
        }
            // table.innerHTML = html will throw error in ie.
        catch(ex) {
            // remove any remaining nodes
            while (elem.firstChild) {
                elem.removeChild(elem.firstChild);
            }
            // html == '' 时，无需再 appendChild
            if (html) {
                elem.appendChild(DOM.create(html));
            }
        }
    }

    // only for gecko and ie
    // 2010-10-22: 发现 chrome 也与 gecko 的处理一致了
    if (ie || UA['gecko'] || UA['webkit']) {
        // 定义 creators, 处理浏览器兼容
        var creators = DOM._creators,
            create = DOM.create,
            TABLE_OPEN = '<table>',
            TABLE_CLOSE = '</table>',
            RE_TBODY = /(?:\/(?:thead|tfoot|caption|col|colgroup)>)+\s*<tbody/,
            creatorsMap = {
                option: 'select',
                td: 'tr',
                tr: 'tbody',
                tbody: 'table',
                col: 'colgroup',
                legend: 'fieldset' // ie 支持，但 gecko 不支持
            };

        for (var p in creatorsMap) {
            (function(tag) {
                creators[p] = function(html, ownerDoc) {
                    return create('<' + tag + '>' + html + '</' + tag + '>', null, ownerDoc);
                }
            })(creatorsMap[p]);
        }

        if (ie) {
            // IE 下不能单独添加 script 元素
            creators.script = function(html, ownerDoc) {
                var frag = ownerDoc ? ownerDoc.createElement(DIV) : DEFAULT_DIV;
                frag.innerHTML = '-' + html;
                frag.removeChild(frag.firstChild);
                return frag;
            };

            // IE7- adds TBODY when creating thead/tfoot/caption/col/colgroup elements
            if (ie < 8) {
                creators.tbody = function(html, ownerDoc) {
                    var frag = create(TABLE_OPEN + html + TABLE_CLOSE, null, ownerDoc),
                        tbody = frag.children['tags']('tbody')[0];

                    if (frag.children.length > 1 && tbody && !RE_TBODY.test(html)) {
                        tbody[PARENT_NODE].removeChild(tbody); // strip extraneous tbody
                    }
                    return frag;
                };
            }
        }

        S.mix(creators, {
                optgroup: creators.option, // gecko 支持，但 ie 不支持
                th: creators.td,
                thead: creators.tbody,
                tfoot: creators.tbody,
                caption: creators.tbody,
                colgroup: creators.tbody
            });
    }
    return DOM;
}, {
        requires:["./base","ua"]
    });

/**
 * TODO:
 *  - 研究 jQuery 的 buildFragment 和 clean
 *  - 增加 cache, 完善 test cases
 *  - 支持更多 props
 *  - remove 时，是否需要移除事件，以避免内存泄漏？需要详细的测试。
 */
/**
 * @module  dom-data
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add('dom/data', function(S, DOM, undefined) {

    var win = window,
        EXPANDO = '_ks_data_' + S.now(), // 让每一份 kissy 的 expando 都不同
        dataCache = { },       // 存储 node 节点的 data
        winDataCache = { };    // 避免污染全局


    // The following elements throw uncatchable exceptions if you
    // attempt to add expando properties to them.
    var noData = {
    };
    noData['applet'] = 1;
    noData['object'] = 1;
    noData['embed'] = 1;

    var commonOps = {

        hasData:function(cache, name) {
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
        hasData:function(ob, name) {
            if (ob == win) {
                return objectOps.hasData(winDataCache, name);
            }
            // 直接建立在对象内
            var thisCache = ob[EXPANDO];
            return commonOps.hasData(thisCache, name);
        },

        data:function(ob, name, value) {
            if (ob == win) {
                return objectOps.data(winDataCache, name, value);
            }
            var cache = ob[EXPANDO] = ob[EXPANDO] || {};
            if (value !== undefined) {
                cache[name] = value;
            } else {
                if (name !== undefined) {
                    return cache[name];
                } else {
                    return cache;
                }
            }
        },
        removeData:function(ob, name) {
            if (ob == win) {
                return objectOps.removeData(winDataCache, name);
            }
            var cache = ob[EXPANDO];
            if (!cache) return;
            if (name !== undefined) {
                delete cache[name];
                if (S.isEmptyObject(cache)) {
                    objectOps.removeData(ob, undefined);
                }
            } else {
                delete ob[EXPANDO];
            }
        }
    };

    var domOps = {
        hasData:function(elem, name) {

            var key = elem[EXPANDO];
            if (!key) {
                return false;
            }
            var thisCache = dataCache[key];
            return commonOps.hasData(thisCache, name);
        },
        data:function(elem, name, value) {

            if (noData[elem.nodeName.toLowerCase()]) {
                return;
            }
            var key = elem[EXPANDO];
            if (!key) {
                key = elem[EXPANDO] = S.guid();
            }
            var cache = dataCache[key] = dataCache[key] || {};
            if (value !== undefined) {
                cache[name] = value;
            } else {
                if (name !== undefined) {
                    return cache[name] ;
                } else {
                    return cache;
                }
            }
        },
        removeData:function(elem, name) {
            var key = elem[EXPANDO];
            if (!key) {
                return;
            }
            var cache = dataCache[key];
            if (!cache) {
                return;
            }
            if (name !== undefined) {
                delete cache[name];
                if (S.isEmptyObject(cache)) {
                    domOps.removeData(elem, undefined);
                }
            } else {
                delete dataCache[key];
                try {
                    delete elem[EXPANDO];
                } catch(e) {
                }
                if (elem.removeAttribute) {
                    elem.removeAttribute(EXPANDO);
                }
            }
        }
    };


    S.mix(DOM, {

            hasData:function(selector, name) {
                var ret = false;
                DOM.query(selector).each(function(elem) {
                    if (checkIsNode(elem)) {
                        ret = ret || domOps.hasData(elem, name);
                    } else {
                        ret = ret || objectOps.hasData(elem, name);
                    }
                });
                return ret;
            },

            /**
             * Store arbitrary data associated with the matched elements.
             */
            data: function(selector, name, data) {
                // suports hash
                if (S.isPlainObject(name)) {
                    for (var k in name) {
                        DOM.data(selector, k, name[k]);
                    }
                    return;
                }

                // getter
                if (data === undefined) {
                    var elem = DOM.get(selector);
                    if (checkIsNode(elem)) {
                        return domOps.data(elem, name, data);
                    } else {
                        return objectOps.data(elem, name, data);
                    }
                }
                // setter
                else {
                    DOM.query(selector).each(function(elem) {
                        if (checkIsNode(elem)) {
                            domOps.data(elem, name, data);
                        } else {
                            objectOps.data(elem, name, data);
                        }
                    });
                }
            },

            /**
             * Remove a previously-stored piece of data.
             */
            removeData: function(selector, name) {
                DOM.query(selector).each(function(elem) {
                    if (checkIsNode(elem)) {
                        domOps.removeData(elem, name);
                    } else {
                        objectOps.removeData(elem, name);
                    }
                });
            }
        });

    function checkIsNode(elem) {
        return elem && elem.nodeType;
    }

    return DOM;

}, {
        requires:["./base"]
    });
/**
 * 承玉：2011-05-31
 *  - 分层 ，节点和普通对象分开粗合理
 **//**
 * @module  dom-insertion
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add('dom/insertion', function(S, DOM) {

    var PARENT_NODE = 'parentNode',
        NEXT_SIBLING = 'nextSibling';

    var nl2frag = DOM._nl2frag;


    // fragment is easier than nodelist
    function insertion(newNodes, refNodes, fn) {
        newNodes = DOM.query(newNodes);
        refNodes = DOM.query(refNodes);
        var newNode = nl2frag(newNodes);
        if (!newNode) return;
        var cloneNode;
        //fragment 一旦插入里面就空了，先复制下
        if (refNodes.length > 1) {
            cloneNode = newNode.cloneNode(true);
        }
        for (var i = 0; i < refNodes.length; i++) {
            var refNode = refNodes[i];
            //refNodes 超过一个，clone
            var node = i > 0 ? cloneNode.cloneNode(true) : newNode;
            fn(node, refNode);
        }
    }

    S.mix(DOM, {

            /**
             * Inserts the new node as the previous sibling of the reference node.
             */
            insertBefore: function(newNodes, refNodes) {
                insertion(newNodes, refNodes, function(newNode, refNode) {
                    if (refNode[PARENT_NODE]) {
                        refNode[PARENT_NODE].insertBefore(newNode, refNode);
                    }
                });
            },

            /**
             * Inserts the new node as the next sibling of the reference node.
             */
            insertAfter: function(newNodes, refNodes) {
                insertion(newNodes, refNodes, function(newNode, refNode) {
                    if (refNode[PARENT_NODE]) {
                        refNode[PARENT_NODE].insertBefore(newNode, refNode[NEXT_SIBLING]);
                    }
                });
            },

            /**
             * Inserts the new node as the last child.
             */
            appendTo: function(newNodes, parents) {
                insertion(newNodes, parents, function(newNode, parent) {
                    parent.appendChild(newNode);
                });
            },

            /**
             * Inserts the new node as the first child.
             */
            prependTo:function(newNodes, parents) {
                insertion(newNodes, parents, function(newNode, parent) {
                    parent.insertBefore(newNode, parent.firstChild);
                });
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
        requires:["./create"]
    });

/**
 * 2011-05-25
 *  - 承玉：参考 jquery 处理多对多的情形 :http://api.jquery.com/append/
 *      DOM.append(".multi1",".multi2");
 *
 */
/**
 * @module  dom-offset
 * @author  lifesinger@gmail.com
 */
KISSY.add('dom/offset', function(S, DOM, UA, undefined) {

    var win = window,
        doc = document,
        isIE = UA['ie'],
        docElem = doc.documentElement,
        isElementNode = DOM._isElementNode,
        nodeTypeIs = DOM._nodeTypeIs,
        getWin = DOM._getWin,
        isStrict = doc.compatMode === 'CSS1Compat',
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
        SCROLL_LEFT = SCROLL + 'Left',
        SCROLL_TOP = SCROLL + 'Top',
        GET_BOUNDING_CLIENT_RECT = 'getBoundingClientRect';

    S.mix(DOM, {


        /**
         * Gets the current coordinates of the element, relative to the document.
         * @param relativeWin The window to measure relative to. If relativeWin
         *     is not in the ancestor frame chain of the element, we measure relative to
         *     the top-most window.
         */
        offset: function(elem, val, relativeWin) {
            // ownerDocument 的判断可以保证 elem 没有游离在 document 之外（比如 fragment）
            if (!(elem = DOM.get(elem)) || !elem[OWNER_DOCUMENT]) return;

            // getter
            if (val === undefined) {
                return getOffset(elem, relativeWin);
            }

            // setter
            setOffset(elem, val);
        },

        /**
         * Makes elem visible in the container
         * @refer http://www.w3.org/TR/2009/WD-html5-20090423/editing.html#scrollIntoView
         *        http://www.sencha.com/deploy/dev/docs/source/Element.scroll-more.html#scrollIntoView
         *        http://yiminghe.javaeye.com/blog/390732
         */
        scrollIntoView: function(elem, container, top, hscroll) {
            if (!(elem = DOM.get(elem)) || !elem[OWNER_DOCUMENT]) {
                return;
            }

            hscroll = hscroll === undefined ? true : !!hscroll;
            top = top === undefined ? true : !!top;

            // default current window, use native for scrollIntoView(elem, top)
            if (!container ||
                (container = DOM.get(container)) === win) {
                // 注意：
                // 1. Opera 不支持 top 参数
                // 2. 当 container 已经在视窗中时，也会重新定位
                elem.scrollIntoView(top);
                return;
            }

            // document 归一化到 window
            if (nodeTypeIs(container, 9)) {
                container = getWin(container);
            }

            var isWin = !!getWin(container),
                elemOffset = DOM.offset(elem),
                containerOffset = isWin ? {
                    left: DOM.scrollLeft(container),
                    top: DOM.scrollTop(container) }
                    : DOM.offset(container),

                // elem 相对 container 视窗的坐标
                diff = {
                    left: elemOffset[LEFT] - containerOffset[LEFT],
                    top: elemOffset[TOP] - containerOffset[TOP]
                },

                // container 视窗的高宽
                ch = isWin ? DOM['viewportHeight'](container) : container.clientHeight,
                cw = isWin ? DOM['viewportWidth'](container) : container.clientWidth,

                // container 视窗相对 container 元素的坐标
                cl = DOM[SCROLL_LEFT](container),
                ct = DOM[SCROLL_TOP](container),
                cr = cl + cw,
                cb = ct + ch,

                // elem 的高宽
                eh = elem.offsetHeight,
                ew = elem.offsetWidth,

                // elem 相对 container 元素的坐标
                // 注：diff.left 含 border, cl 也含 border, 因此要减去一个
                l = diff.left + cl - (PARSEINT(DOM.css(container, 'borderLeftWidth')) || 0),
                t = diff.top + ct - (PARSEINT(DOM.css(container, 'borderTopWidth')) || 0),
                r = l + ew,
                b = t + eh,

                t2, l2;

            // 根据情况将 elem 定位到 container 视窗中
            // 1. 当 eh > ch 时，优先显示 elem 的顶部，对用户来说，这样更合理
            // 2. 当 t < ct 时，elem 在 container 视窗上方，优先顶部对齐
            // 3. 当 b > cb 时，elem 在 container 视窗下方，优先底部对齐
            // 4. 其它情况下，elem 已经在 container 视窗中，无需任何操作
            if (eh > ch || t < ct || top) {
                t2 = t;
            } else if (b > cb) {
                t2 = b - ch;
            }

            // 水平方向与上面同理
            if (hscroll) {
                if (ew > cw || l < cl || top) {
                    l2 = l;
                } else if (r > cr) {
                    l2 = r - cw;
                }
            }

            // go
            DOM[SCROLL_TOP](container, t2);
            DOM[SCROLL_LEFT](container, l2);
        },
        /**
         * for idea autocomplete
         */
        docWidth:0,
        docHeight:0,
        viewportHeight:0,
        viewportWidth:0
    });

    // http://old.jr.pl/www.quirksmode.org/viewport/compatibility.html
    // http://www.quirksmode.org/dom/w3c_cssom.html
    // add ScrollLeft/ScrollTop getter/setter methods
    S.each(['Left', 'Top'], function(name, i) {
        var method = SCROLL + name;

        DOM[method] = function(elem, v) {
            if (S.isNumber(elem)) {
                arguments.callee(win, elem);
                return;
            }
            elem = DOM.get(elem);
            var ret = 0,
                w = getWin(elem),
                d;

            if (w) {
                if (v !== undefined) {
                    // 注意多 windw 情况，不能简单取 win
                    var left = name == "Left" ? v : DOM.scrollLeft(w);
                    var top = name == "Top" ? v : DOM.scrollTop(w);
                    w['scrollTo'](left, top);
                }
                d = w[DOCUMENT];
                ret =
                    //标准
                    //chrome == body.scrollTop
                    //firefox/ie9 == documentElement.scrollTop
                    w[i ? 'pageYOffset' : 'pageXOffset']
                        //ie6,7,8 standard mode
                        || d[DOC_ELEMENT][method]
                        //quirks mode
                        || d[BODY][method]

            } else if (isElementNode((elem = DOM.get(elem)))) {
                ret = v !== undefined ? elem[method] = v : elem[method];
            }
            return v === undefined ? ret : undefined;
        }
    });

    // add docWidth/Height, viewportWidth/Height getter methods
    S.each(['Width', 'Height'], function(name) {
        DOM['doc' + name] = function(refWin) {
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

        DOM[VIEWPORT + name] = function(refWin) {
            refWin = DOM.get(refWin);
            var prop = 'inner' + name,
                w = getWin(refWin),
                d = w[DOCUMENT];
            return (prop in w) ?
                // 标准 = documentElement.clientHeight
                w[prop] :
                // ie 标准 documentElement.clientHeight , 在 documentElement.clientHeight 上滚动？
                // ie quirks body.clientHeight: 在 body 上？
                (isStrict ? d[DOC_ELEMENT][CLIENT + name] : d[BODY][CLIENT + name]);
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

        return { left: x, top: y };
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
        var position = {left:0,top:0};

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
    requires:["./base","ua"]
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
 * @module  selector
 * @author  lifesinger@gmail.com
 */
KISSY.add('dom/selector', function(S, DOM, undefined) {

    var doc = document,
        isNodeList = DOM._isNodeList,
        SPACE = ' ',
        ANY = '*',
        REG_ID = /^#[\w-]+$/,
        REG_QUERY = /^(?:#([\w-]+))?\s*([\w-]+|\*)?\.?([\w-]+)?$/;

    /**
     * Retrieves an Array of HTMLElement based on the given CSS selector.
     * @param {String|Array} selector
     * @param {String|HTMLElement} context An #id string or a HTMLElement used as context
     * @return {Array} The array of found HTMLElement
     */
    function query(selector, context) {
        var match, t,
            ret = [],
            id,
            tag,
            sizzle = S.require("sizzle"),
            cls;
        context = tuneContext(context);

        // Ref: http://ejohn.org/blog/selectors-that-people-actually-use/
        // 考虑 2/8 原则，仅支持以下选择器：
        // #id
        // tag
        // .cls
        // #id tag
        // #id .cls
        // tag.cls
        // #id tag.cls
        // 注 1：REG_QUERY 还会匹配 #id.cls
        // 注 2：tag 可以为 * 字符
        // 注 3: 支持 , 号分组
        // 返回值为数组
        // 选择器不支持时，抛出异常

        // selector 为字符串是最常见的情况，优先考虑
        // 注：空白字符串无需判断，运行下去自动能返回空数组
        if (S.isString(selector)) {

            if (selector.indexOf(",") != -1) {
                var selectors = selector.split(",");
                S.each(selectors, function(s) {
                    ret.push.apply(ret, S.makeArray(query(s, context)));
                });
            } else {


                selector = S.trim(selector);

                // selector 为 #id 是最常见的情况，特殊优化处理
                if (REG_ID.test(selector)) {
                    t = getElementById(selector.slice(1), context);
                    if (t) ret = [t]; // #id 无效时，返回空数组
                }
                // selector 为支持列表中的其它 6 种
                else if ((match = REG_QUERY.exec(String(selector)))) {
                    // 获取匹配出的信息
                    id = match[1];
                    tag = match[2];
                    cls = match[3];

                    if (context = (id ? getElementById(id, context) : context)) {
                        // #id .cls | #id tag.cls | .cls | tag.cls
                        if (cls) {
                            if (!id || selector.indexOf(SPACE) !== -1) { // 排除 #id.cls
                                ret = S.makeArray(getElementsByClassName(cls, tag, context));
                            }
                            // 处理 #id.cls
                            else {
                                t = getElementById(id, context);
                                if (t && DOM.hasClass(t, cls)) {
                                    ret = [t];
                                }
                            }
                        }
                        // #id tag | tag
                        else if (tag) { // 排除空白字符串
                            ret = getElementsByTagName(tag, context);
                        }
                    }
                }
                // 采用外部选择器
                else if (sizzle) {
                    ret = sizzle(selector, context);
                }
                // 依旧不支持，抛异常
                else {
                    error(selector);
                }
            }
        }
        // 传入的 selector 是 NodeList 或已是 Array
        else if (selector && (S.isArray(selector) || isNodeList(selector))) {
            ret = selector;
        }
        // 传入的 selector 是 Node 等非字符串对象，原样返回
        else if (selector) {
            ret = [selector];
        }
        // 传入的 selector 是其它值时，返回空数组

        // 将 NodeList 转换为普通数组
        if (isNodeList(ret)) {
            ret = S.makeArray(ret);
        }

        // attach each method
        ret.each = function(fn, context) {
            return S.each(ret, fn, context);
        };

        return ret;
    }


    // 调整 context 为合理值
    function tuneContext(context) {
        // 1). context 为 undefined 是最常见的情况，优先考虑
        if (context === undefined) {
            context = doc;
        }
        // 2). context 的第二使用场景是传入 #id
        else if (S.isString(context) && REG_ID.test(context)) {
            context = getElementById(context.slice(1), doc);
            // 注：#id 可能无效，这时获取的 context 为 null
        }
        // 3). nodelist 取第一个元素
        else if (S.isArray(context) || isNodeList(context)) {
            context = context[0] || null;
        }
        // 4). context 还可以传入 HTMLElement, 此时无需处理
        // 5). 经历 1 - 4, 如果 context 还不是 HTMLElement, 赋值为 null
        else if (context && context.nodeType !== 1 && context.nodeType !== 9) {
            context = null;
        }
        return context;
    }

    // query #id
    function getElementById(id, context) {
        if (!context) {
            return null;
        }
        if (context.nodeType !== 9) {
            context = context.ownerDocument;
        }
        return context.getElementById(id);
    }

    // query tag
    function getElementsByTagName(tag, context) {
        return context.getElementsByTagName(tag);
    }

    (function() {
        // Check to see if the browser returns only elements
        // when doing getElementsByTagName('*')

        // Create a fake element
        var div = doc.createElement('div');
        div.appendChild(doc.createComment(''));

        // Make sure no comments are found
        if (div.getElementsByTagName(ANY).length > 0) {
            getElementsByTagName = function(tag, context) {
                var ret = S.makeArray(context.getElementsByTagName(tag));

                if (tag === ANY) {
                    var t = [], i = 0, j = 0, node;
                    while ((node = ret[i++])) {
                        // Filter out possible comments
                        if (node.nodeType === 1) {
                            t[j++] = node;
                        }
                    }
                    ret = t;
                }
                return ret;
            };
        }
    })();

    // query .cls
    var getElementsByClassName = doc.getElementsByClassName ? function(cls, tag, context) {
        var els = S.makeArray(context.getElementsByClassName(cls)),
            ret = els, i = 0, j = 0, len = els.length, el;

        if (tag && tag !== ANY) {
            ret = [];
            tag = tag.toUpperCase();
            for (; i < len; ++i) {
                el = els[i];
                if (el.tagName === tag) {
                    ret[j++] = el;
                }
            }
        }
        return ret;
    } : ( doc.querySelectorAll ? function(cls, tag, context) {
        return context.querySelectorAll((tag ? tag : '') + '.' + cls);
    } : function(cls, tag, context) {
        var els = context.getElementsByTagName(tag || ANY),
            ret = [], i = 0, j = 0, len = els.length, el, t;

        cls = SPACE + cls + SPACE;
        for (; i < len; ++i) {
            el = els[i];
            t = el.className;
            if (t && (SPACE + t + SPACE).indexOf(cls) > -1) {
                ret[j++] = el;
            }
        }
        return ret;
    });


    // throw exception
    function error(msg) {
        S.error('Unsupported selector: ' + msg);
    }

    S.mix(DOM, {

            query: query,

            get: function(selector, context) {
                return query(selector, context)[0] || null;
            },

            /**
             * Filters an array of elements to only include matches of a filter.
             * @param filter selector or fn
             */
            filter: function(selector, filter, context) {
                var elems = query(selector, context),
                    sizzle = S.require("sizzle"),
                    match, tag, cls, ret = [];

                // 默认仅支持最简单的 tag.cls 形式
                if (S.isString(filter) && (match = REG_QUERY.exec(filter)) && !match[1]) {
                    tag = match[2];
                    cls = match[3];
                    filter = function(elem) {
                        return !(
                            (tag && elem.tagName.toLowerCase() !== tag.toLowerCase())
                                || (cls && !DOM.hasClass(elem, cls))
                            );
                    }
                }

                if (S.isFunction(filter)) {
                    ret = S.filter(elems, filter);
                }
                // 其它复杂 filter, 采用外部选择器
                else if (filter && sizzle) {
                    ret = sizzle._filter(selector, filter, context);
                }
                // filter 为空或不支持的 selector
                else {
                    error(filter);
                }

                return ret;
            },

            /**
             * Returns true if the passed element(s) match the passed filter
             */
            test: function(selector, filter, context) {
                var elems = query(selector, context);
                return elems.length && (DOM.filter(elems, filter, context).length === elems.length);
            }
        });
    return DOM;
}, {
        requires:["dom/base"]
    });

/**
 * NOTES:
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
 * @module  dom
 * @author  lifesinger@gmail.com
 */
KISSY.add('dom/style-ie', function(S, DOM, UA, Style, undefined) {

    // only for ie
    if (!UA['ie']) return DOM;

    var doc = document,
        docElem = doc.documentElement,
        OPACITY = 'opacity',
        FILTER = 'filter',
        FILTERS = 'filters',
        CURRENT_STYLE = 'currentStyle',
        RUNTIME_STYLE = 'runtimeStyle',
        LEFT = 'left',
        PX = 'px',
        CUSTOM_STYLES = DOM._CUSTOM_STYLES,
        RE_NUMPX = /^-?\d+(?:px)?$/i,
        RE_NUM = /^-?\d/,
        RE_WH = /^(?:width|height)$/;

    // use alpha filter for IE opacity
    try {
        if (docElem.style[OPACITY] == undefined
            && docElem[FILTERS]) {

            CUSTOM_STYLES[OPACITY] = {

                get: function(elem) {

                    var val = 100;

                    try { // will error if no DXImageTransform
                        val = elem[FILTERS]['DXImageTransform.Microsoft.Alpha'][OPACITY];
                    }
                    catch(e) {
                        try {
                            val = elem[FILTERS]('alpha')[OPACITY];
                        } catch(ex) {
                            // 没有设置过 opacity 时会报错，这时返回 1 即可
                            //如果该节点没有添加到 dom ，取不到 filters 结构

                            var currentFilter = (elem.currentStyle || 0).filter || '';
                            var m;
                            if (m = currentFilter.match(/alpha\(opacity[=:]([^)]+)\)/)) {
                                val = parseInt(S.trim(m[1]));
                            }

                        }
                    }

                    // 和其他浏览器保持一致，转换为字符串类型
                    return val / 100 + '';
                },

                set: function(elem, val) {
                    var style = elem.style,
                        currentFilter = (elem.currentStyle || 0).filter || '';

                    // IE has trouble with opacity if it does not have layout
                    // Force it by setting the zoom level
                    style.zoom = 1;
                    //S.log(currentFilter + " : "+val);
                    // keep existed filters, and remove opacity filter
                    if (currentFilter) {
                        //出现 alpha(opacity:0), alpha(opacity=0) ?
                        currentFilter = S.trim(currentFilter.replace(
                            /alpha\(opacity[^=]*=[^)]+\),?/ig, ''));
                    }

                    if (currentFilter && val != 1) {
                        currentFilter += ', ';
                    }

                    // Set the alpha filter to set the opacity when really needed
                    style[FILTER] = currentFilter + (val != 1 ? 'alpha(' + OPACITY + '=' + val * 100 + ')' : '');
                    //S.log( style[FILTER]);
                }
            };
        }
    }
    catch(ex) {
        S.log('IE filters ActiveX is disabled. ex = ' + ex);
    }

    /**
     * border fix
     * ie 不返回数值，只返回 thick? medium ...
     */
    var IE8 = UA['ie'] == 8,
        BORDER_MAP = {
        },
        BORDERS = ["","Top","Left","Right","Bottom"],
        BORDER_FIX = {
            get: function(elem, property) {
                var currentStyle = elem.currentStyle,
                    current = currentStyle[property] + "";
                // look up keywords if a border exists
                if (current.indexOf("px") < 0) {
                    if (BORDER_MAP[current]) {
                        current = BORDER_MAP[current];
                    } else {
                        // otherwise no border (default is "medium")
                        current = 0;
                    }
                }
                return current;
            }
        };
    BORDER_MAP['thin'] = IE8 ? '1px' : '2px';
    BORDER_MAP['medium'] = IE8 ? '3px' : '4px';
    BORDER_MAP['thick'] = IE8 ? '5px' : '6px';
    S.each(BORDERS, function(b) {
        CUSTOM_STYLES["border" + b + "Width"] = BORDER_FIX;
    });

    // getComputedStyle for IE
    if (!(doc.defaultView || { }).getComputedStyle && docElem[CURRENT_STYLE]) {

        DOM._getComputedStyle = function(elem, name) {
            var style = elem.style,
                ret = elem[CURRENT_STYLE][name];

            // 当 width/height 设置为百分比时，通过 pixelLeft 方式转换的 width/height 值
            // 在 ie 下不对，需要直接用 offset 方式
            // borderWidth 等值也有问题，但考虑到 borderWidth 设为百分比的概率很小，这里就不考虑了
            if (RE_WH.test(name)) {
                ret = DOM[name](elem) + PX;
            }
            // From the awesome hack by Dean Edwards
            // http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291
            // If we're not dealing with a regular pixel number
            // but a number that has a weird ending, we need to convert it to pixels
            else if ((!RE_NUMPX.test(ret) && RE_NUM.test(ret))) {
                // Remember the original values
                var left = style[LEFT], rsLeft = elem[RUNTIME_STYLE][LEFT];

                // Put in the new values to get a computed value out
                elem[RUNTIME_STYLE][LEFT] = elem[CURRENT_STYLE][LEFT];
                style[LEFT] = name === 'fontSize' ? '1em' : (ret || 0);
                ret = style['pixelLeft'] + PX;

                // Revert the changed values
                style[LEFT] = left;
                elem[RUNTIME_STYLE][LEFT] = rsLeft;
            }

            return ret;
        }
    }
    return DOM;
}, {
        requires:["./base","ua","./style"]
    });
/**
 * NOTES:
 * 承玉： 2011.05.19 opacity in ie
 *  - 如果节点是动态创建，设置opacity，没有加到 dom 前，取不到 opacity 值
 *  - 兼容：border-width 值，ie 下有可能返回 medium/thin/thick 等值，其它浏览器返回 px 值。
 *
 *  - opacity 的实现，还可以用 progid:DXImageTransform.Microsoft.BasicImage(opacity=.2) 来实现，但考虑
 *    主流类库都是用 DXImageTransform.Microsoft.Alpha 来实现的，为了保证多类库混合使用时不会出现问题，kissy 里
 *    依旧采用 Alpha 来实现。
 *
 */
/**
 * @module  dom
 * @author  lifesinger@gmail.com
 */
KISSY.add('dom/style', function(S, DOM, UA, undefined) {

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
        NONE = 'none',
        PARSEINT = parseInt,
        RE_LT = /^(?:left|top)/,
        RE_NEED_UNIT = /^(?:width|height|top|left|right|bottom|margin|padding)/i,
        RE_DASH = /-([a-z])/ig,
        CAMELCASE_FN = function(all, letter) {
            return letter.toUpperCase();
        },
        EMPTY = '',
        DEFAULT_UNIT = 'px',
        CUSTOM_STYLES = { },
        defaultDisplay = { };

    S.mix(DOM, {

            _CUSTOM_STYLES: CUSTOM_STYLES,

            _getComputedStyle: function(elem, name) {
                var val = '', d = elem.ownerDocument;

                if (elem[STYLE]) {
                    val = d.defaultView.getComputedStyle(elem, null)[name];
                }
                return val;
            },

            /**
             * Gets or sets styles on the matches elements.
             */
            css: function(selector, name, val) {
                // suports hash
                if (S.isPlainObject(name)) {
                    for (var k in name) {
                        DOM.css(selector, k, name[k]);
                    }
                    return;
                }

                if (name.indexOf('-') > 0) {
                    // webkit 认识 camel-case, 其它内核只认识 cameCase
                    name = name.replace(RE_DASH, CAMELCASE_FN);
                }

                var name_str = name;

                name = CUSTOM_STYLES[name] || name;

                // getter
                if (val === undefined) {
                    // supports css selector/Node/NodeList
                    var elem = DOM.get(selector), ret = '';

                    if (elem && elem[STYLE]) {
                        ret = name.get ?
                            name.get(elem, name_str) :
                            elem[STYLE][name];

                        // 有 get 的直接用自定义函数的返回值
                        if (ret === '' && !name.get) {
                            ret = fixComputedStyle(elem,
                                name,
                                DOM._getComputedStyle(elem, name));
                        }
                    }

                    return ret === undefined ? '' : ret;
                }
                // setter
                else {
                    // normalize unsetting
                    if (val === null || val === EMPTY) {
                        val = EMPTY;
                    }
                    // number values may need a unit
                    else if (!isNaN(new Number(val)) && RE_NEED_UNIT.test(name)) {
                        val += DEFAULT_UNIT;
                    }

                    // ignore negative width and height values
                    if ((name === WIDTH || name === HEIGHT) && parseFloat(val) < 0) {
                        return;
                    }

                    S.each(DOM.query(selector), function(elem) {
                        if (elem && elem[STYLE]) {
                            name.set ? name.set(elem, val) : (elem[STYLE][name] = val);
                            if (val === EMPTY) {
                                if (!elem[STYLE].cssText)
                                    elem.removeAttribute(STYLE);
                            }
                        }
                    });
                }
            },

            /**
             * Get the current computed width for the first element in the set of matched elements or
             * set the CSS width of each element in the set of matched elements.
             */
            width: function(selector, value) {
                // getter
                if (value === undefined) {
                    return getWH(selector, WIDTH);
                }
                // setter
                else {
                    DOM.css(selector, WIDTH, value);
                }
            },

            /**
             * Get the current computed height for the first element in the set of matched elements or
             * set the CSS height of each element in the set of matched elements.
             */
            height: function(selector, value) {
                // getter
                if (value === undefined) {
                    return getWH(selector, HEIGHT);
                }
                // setter
                else {
                    DOM.css(selector, HEIGHT, value);
                }
            },

            /**
             * Show the matched elements.
             */
            show: function(selector) {

                DOM.query(selector).each(function(elem) {
                    if (!elem) return;

                    elem.style[DISPLAY] = DOM.data(elem, DISPLAY) || EMPTY;

                    // 可能元素还处于隐藏状态，比如 css 里设置了 display: none
                    if (DOM.css(elem, DISPLAY) === NONE) {
                        var tagName = elem.tagName,
                            old = defaultDisplay[tagName], tmp;

                        if (!old) {
                            tmp = doc.createElement(tagName);
                            doc.body.appendChild(tmp);
                            old = DOM.css(tmp, DISPLAY);
                            DOM.remove(tmp);
                            defaultDisplay[tagName] = old;
                        }

                        DOM.data(elem, DISPLAY, old);
                        elem.style[DISPLAY] = old;
                    }
                });
            },

            /**
             * Hide the matched elements.
             */
            hide: function(selector) {
                DOM.query(selector).each(function(elem) {
                    if (!elem) return;

                    var style = elem.style, old = style[DISPLAY];
                    if (old !== NONE) {
                        if (old) {
                            DOM.data(elem, DISPLAY, old);
                        }
                        style[DISPLAY] = NONE;
                    }
                });
            },

            /**
             * Display or hide the matched elements.
             */
            toggle: function(selector) {
                DOM.query(selector).each(function(elem) {
                    if (elem) {
                        if (DOM.css(elem, DISPLAY) === NONE) {
                            DOM.show(elem);
                        } else {
                            DOM.hide(elem);
                        }
                    }
                });
            },

            /**
             * Creates a stylesheet from a text blob of rules.
             * These rules will be wrapped in a STYLE tag and appended to the HEAD of the document.
             * @param {String} cssText The text containing the css rules
             * @param {String} id An id to add to the stylesheet for later removal
             */
            addStyleSheet: function(refWin, cssText, id) {
                if (S.isString(refWin)) {
                    id = cssText;
                    cssText = refWin;
                    refWin = window;
                }
                refWin = DOM.get(refWin);
                var win = DOM._getWin(refWin),doc = win.document;
                var elem;

                if (id && (id = id.replace('#', EMPTY))) {
                    elem = DOM.get('#' + id, doc);
                }

                // 仅添加一次，不重复添加
                if (elem) {
                    return;
                }

                elem = DOM.create('<style>', { id: id }, doc);

                // 先添加到 DOM 树中，再给 cssText 赋值，否则 css hack 会失效
                DOM.get('head', doc).appendChild(elem);

                if (elem.styleSheet) { // IE
                    elem.styleSheet.cssText = cssText;
                } else { // W3C
                    elem.appendChild(doc.createTextNode(cssText));
                }
            },

            unselectable:function(selector) {
                DOM.query(selector).each(function(elem) {
                    if (elem) {
                        if (UA['gecko']) {
                            elem.style['MozUserSelect'] = 'none';
                        }
                        else if (UA['webkit']) {
                            elem.style['KhtmlUserSelect'] = 'none';
                        } else {
                            if (UA['ie'] || UA['opera']) {
                                var e,i = 0,
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
                });
            }
        });

    // normalize reserved word float alternatives ("cssFloat" or "styleFloat")
    if (docElem[STYLE][CSS_FLOAT] !== undefined) {
        CUSTOM_STYLES[FLOAT] = CSS_FLOAT;
    }
    else if (docElem[STYLE][STYLE_FLOAT] !== undefined) {
        CUSTOM_STYLES[FLOAT] = STYLE_FLOAT;
    }

    function getWH(selector, name) {
        var elem = DOM.get(selector);
        if (S.isWindow(elem)) {
            return name == WIDTH ? DOM.viewportWidth(elem) : DOM.viewportHeight(elem);
        } else if (elem.nodeType == 9) {
            return name == WIDTH ? DOM.docWidth(elem) : DOM.docHeight(elem);
        }
        var which = name === WIDTH ? ['Left', 'Right'] : ['Top', 'Bottom'],
            val = name === WIDTH ? elem.offsetWidth : elem.offsetHeight;

        S.each(which, function(direction) {
            val -= parseFloat(DOM._getComputedStyle(elem, 'padding' + direction)) || 0;
            val -= parseFloat(DOM._getComputedStyle(elem, 'border' + direction + 'Width')) || 0;
        });

        return val;
    }

    // 修正 getComputedStyle 返回值的部分浏览器兼容性问题
    function fixComputedStyle(elem, name, val) {
        var offset, ret = val;

        // 1. 当没有设置 style.left 时，getComputedStyle 在不同浏览器下，返回值不同
        //    比如：firefox 返回 0, webkit/ie 返回 auto
        // 2. style.left 设置为百分比时，返回值为百分比
        // 对于第一种情况，如果是 relative 元素，值为 0. 如果是 absolute 元素，值为 offsetLeft - marginLeft
        // 对于第二种情况，大部分类库都未做处理，属于“明之而不 fix”的保留 bug
        if (val === AUTO && RE_LT.test(name)) {
            ret = 0;
            if (S.inArray(DOM.css(elem, 'position'), ['absolute','fixed'])) {
                offset = elem[name === 'left' ? 'offsetLeft' : 'offsetTop'];

                // old-ie 下，elem.offsetLeft 包含 offsetParent 的 border 宽度，需要减掉
                if (isIE && document['documentMode'] != 9 || UA['opera']) {
                    // 类似 offset ie 下的边框处理
                    // 如果 offsetParent 为 html ，需要减去默认 2 px == documentElement.clientTop
                    // 否则减去 borderTop 其实也是 clientTop
                    offset -= elem.offsetParent['client' + (name == 'left' ? 'Left' : 'Top')]
                        || 0;
                }

                ret = offset - (PARSEINT(DOM.css(elem, 'margin-' + name)) || 0);
            }
        }

        return ret;
    }

    return DOM;
}, {
        requires:["dom/base","ua"]
    });

/**
 * NOTES:
 *  - Opera 下，color 默认返回 #XXYYZZ, 非 rgb(). 目前 jQuery 等类库均忽略此差异，KISSY 也忽略。
 *  - Safari 低版本，transparent 会返回为 rgba(0, 0, 0, 0), 考虑低版本才有此 bug, 亦忽略。
 *
 *  - 非 webkit 下，jQuery.css paddingLeft 返回 style 值， padding-left 返回 computedStyle 值，
 *    返回的值不同。KISSY 做了统一，更符合预期。
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
 * @module  dom-traversal
 * @author  lifesinger@gmail.com
 */
KISSY.add('dom/traversal', function(S, DOM, undefined) {

    var isElementNode = DOM._isElementNode;

    S.mix(DOM, {

            closest:function(selector, filter, context) {
                return nth(selector, filter, 'parentNode', function(elem) {
                    return elem.nodeType != 11;
                }, context, true);
            },

            /**
             * Gets the parent node of the first matched element.
             */
            parent: function(selector, filter, context) {
                return nth(selector, filter, 'parentNode', function(elem) {
                    return elem.nodeType != 11;
                }, context);
            },

            /**
             * Gets the following sibling of the first matched element.
             */
            next: function(selector, filter) {
                return nth(selector, filter, 'nextSibling', undefined);
            },

            /**
             * Gets the preceding sibling of the first matched element.
             */
            prev: function(selector, filter) {
                return nth(selector, filter, 'previousSibling', undefined);
            },

            /**
             * Gets the siblings of the first matched element.
             */
            siblings: function(selector, filter) {
                return getSiblings(selector, filter, true);
            },

            /**
             * Gets the children of the first matched element.
             */
            children: function(selector, filter) {
                return getSiblings(selector, filter, undefined);
            },

            /**
             * Check to see if a DOM node is within another DOM node.
             */
            contains: document.documentElement.contains ?
                function(a, b) {
                    a = DOM.get(a);
                    b = DOM.get(b);
                    if (a.nodeType == 3) {
                        return false;
                    }
                    var precondition;
                    if (b.nodeType == 3) {
                        b = b.parentNode;
                        // a 和 b父亲相等也就是返回 true
                        precondition = true;
                    } else if (b.nodeType == 9) {
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
                    function(a, b) {
                        a = DOM.get(a);
                        b = DOM.get(b);
                        return !!(a.compareDocumentPosition(b) & 16);
                    } :
                    // it can not be true , pathetic browser
                    0
                ),

            equals:function(n1, n2) {
                n1 = DOM.query(n1);
                n2 = DOM.query(n2);
                if (n1.length != n2.length) return false;
                for (var i = n1.length; i >= 0; i--) {
                    if (n1[i] != n2[i]) return false;
                }
                return true;
            }
        });

    // 获取元素 elem 在 direction 方向上满足 filter 的第一个元素
    // filter 可为 number, selector, fn array ，为数组时返回多个
    // direction 可为 parentNode, nextSibling, previousSibling
    // util : 到某个阶段不再查找直接返回
    function nth(elem, filter, direction, extraFilter, until, includeSef) {
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
        until = (until && DOM.get(until)) || null;

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
            filter = function() {
                return ++fi === flen;
            };
        }

        do {
            if (isElementNode(elem)
                && testFilter(elem, filter)
                && (!extraFilter || extraFilter(elem))) {
                ret.push(elem);
                if (!isArray) {
                    break;
                }
            }
        } while (elem != until && (elem = elem[direction]));

        return isArray ? ret : ret[0] || null;
    }

    function testFilter(elem, filter) {
        if (!filter) return true;
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
            for (j = 0,next = parentNode.firstChild;
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
 * NOTES:
 * - jquery does not return null ,it only returns empty array , but kissy does.
 *
 *  - api 的设计上，没有跟随 jQuery. 一是为了和其他 api 一致，保持 first-all 原则。二是
 *    遵循 8/2 原则，用尽可能少的代码满足用户最常用的功能。
 *
 */
KISSY.add("dom", function(S,DOM) {
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
});
