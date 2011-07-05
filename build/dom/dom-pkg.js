/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: ${build.time}
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
            // ?ï¿½ï¿½????ï¿??ï¿????getAttribute ?ï¿½ï¿½? style ??            // IE7- ï¿???????cssText ?ï¿½ï¿½???            // ï¿??ä½¿ï¿½? cssText
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
                // ï¿????prop ?ï¿½ï¿½?
                return DOM.prop(elem, name) ?
                    // ?ï¿½ï¿½? w3c attribute , true ?ï¿½ï¿½?????ï¿½ï¿½?ï¿??ï¿?                    name.toLowerCase() :
                    undefined;
            },
            set: function(elem, value, name) {
                var propName;
                if (value === false) {
                    // Remove boolean attributes when set to false
                    DOM.removeAttr(elem, name);
                } else {
                    // ?ï¿½ï¿½?è®¾ç½® true,??ï¿½ï¿½ï¿?? bool ç±»ï¿½???                    propName = propFix[ name ] || name;
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
                    // ï¿?ï¿½ï¿½???ï¿?value ?ï¿½ï¿½????ï¿????option.value === option.text
                    // ie7- ï¿??æ²¡ï¿½?è®¾ï¿½? value ?ï¿½ï¿½?option.value === '', ?????el.attributes.value ?ï¿½ï¿½???????è®¾ï¿½? value
                    var val = elem.attributes.value;
                    return !val || val.specified ? elem.value : elem.text;
                }
            },
            select: {
                // å¯¹ï¿½? select, ?ï¿½ï¿½???multiple type, ï¿??ï¿?ï¿½ï¿½????ï¿½ï¿½??ï¿½ï¿½?ï¿?                get: function(elem) {
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


            // ie6,7 ï¿????attribute ï¿?property
            attrFix = propFix;
        // http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
        attrHooks.tabIndex = attrHooks.tabindex;
        // fix ie bugs
        // ï¿????href, src, ï¿?? rowspan ï¿?? mapping ï¿??ï¿??????ï¿½ï¿½? 2 ï¿???ï¿½ï¿½??ï¿½ï¿½??????        // æ³?¿½? colSpan rowSpan å·²ï¿½???propFix ï¿?ï¿½ï¿½å¤§ï¿½?
        S.each([ "href", "src", "width", "height","colSpan","rowSpan" ], function(name) {
            attrHooks[ name ] = {
                get: function(elem) {
                    var ret = elem.getAttribute(name, 2);
                    return ret === null ? undefined : ret;
                }
            };
        });
        // button ?????value ï¿?????????ï¿½ï¿½?
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
         * ???ï¿???ï¿½ï¿½??ï¿½ï¿½?ä½¿ï¿½?ï¿?ï¿½ï¿½??.data
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
         * ï¿????ï¿½ï¿½???ä½¿ï¿½? .data .removeData
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
                pass = val; // ï¿?ï¿½ï¿½???
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
                //ä½¿ï¿½????ï¿??
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
 * ?ï¿½ï¿½?ï¿?011-06-03
 *  - ??? jquery 1.6,??? attribute ï¿?property
 *
 * ?ï¿½ï¿½?ï¿?011-01-28
 *  - ï¿?? tabindexï¿?ï¿½ï¿½ä¾¿ï¿½??? *
 * 2010.03
 *  - ??jquery/support.js ï¿??special attrs ?????maxlength, cellspacing,
 *    rowspan, colspan, useap, frameboder, ï¿??ï¿???ï¿½ï¿½???Grade-A çº§ï¿½?ï¿??ï¿? *    å¹¶ï¿½??ï¿½ï¿½??ï¿½ï¿½?ï¿??
 *  - ï¿?colspan/rowspan ï¿???ï¿½ï¿½?ï¿??ï¿??ï¿?e7- ï¿???ï¿½ï¿½?æ­£ï¿½???href ï¿??ï¿??ï¿???? *    ï¿?2 ï¿???ï¿½ï¿½?è§£ï¿½???Query ??????ï¿???ï¿½ï¿½???bug.
 *  - jQuery ???ï¿???ï¿½ï¿½?è®¾ï¿½? tabindex ?ï¿½ï¿½?????ï¿½ï¿½????ï¿?issy ??ï¿½ï¿½?ï¿½ï¿½?ï¿??å¸¸ï¿½?ï¿??
 *  - jquery/attributes.js: Safari mis-reports the default selected
 *    property of an option ??Safari 4 ï¿?ï¿½ï¿½ï¿???? *
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
         * ?????element node
         */
        _isElementNode: function(elem) {
            return nodeTypeIs(elem, 1);
        },

        /**
         * elem ï¿?window ?ï¿½ï¿½??ï¿½ï¿½?ï¿??
         * elem ï¿?document ?ï¿½ï¿½?ï¿???ï¿½ï¿½???window
         * elem ï¿?undefined ?ï¿½ï¿½?ï¿??ï¿?? window
         * ?ï¿½ï¿½??ï¿½ï¿½?ï¿?? false
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
            // ï¿?ï¿?e ï¿????window.item, typeof node.item ??ie ï¿?????ï¿??ï¿???ï¿½ï¿½???            // ï¿?ï¿?elect ï¿??ï¿????item, ï¿?? !node.nodeType ?????            // ï¿?ï¿??ï¿?namedItem ?ï¿½ï¿½???????
            // ï¿?ï¿?etElementsByTagName ??querySelectorAll ï¿??????????            // ï¿?: ??? iframe.contentWindow
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
                                // ï¿?ï¿½ï¿½ cls ????ï¿½ï¿½?æ¬¡ï¿½??ï¿½ï¿½?'link link2 link link3 link'
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
 *   - hasClass/addClass/removeClass ???ï¿?? jQuery ï¿??ï¿??
 *   - toggleClass ï¿????value ï¿?undefined ???ï¿??jQuery ???ï¿? */
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

                // ï¿?? tag, ï¿?? DOM.create('<p>')
                if ((m = RE_SIMPLE_TAG.exec(html))) {
                    ret = (ownerDoc || doc).createElement(m[1]);
                }
                // ï¿?????ï¿??ï¿?DOM.create('<img src="sprite.png" />')
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
                    // html ï¿?<style></style> ?ï¿½ï¿½?ï¿??ï¿?ï¿½ï¿½???ï¿??ï¿??
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

    // æ·»ï¿½?????ï¿½ï¿½?ï¿?ï¿½ï¿½
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

    // ï¿?nodeList ï¿??ï¿?fragment
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
            re_script = new RegExp(RE_SCRIPT); // ?ï¿½ï¿½?

        html += '<span id="' + id + '"></span>';

        // ï¿??????ï¿½ï¿½??ï¿½ï¿½??ï¿½ï¿½???? DOM ???å·²ï¿½????ï¿?        // ï¿??ï¿??ï¿???ï¿½ï¿½??ï¿½ï¿½?æ­£ï¿½?è¡¨è¾¾ï¿??å·±ï¿½???        S.available(id, function() {
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
                    // sync , ???
                    S.globalEval(text);
                }
            }

            // ????ï¿½ï¿½????
            (t = doc.getElementById(id)) && DOM.remove(t);

            // ???
            S.isFunction(callback) && callback();
        });

        setHTMLSimple(elem, html);
    }

    // ?ï¿½ï¿½???? innerHTML è®¾ç½® html
    function setHTMLSimple(elem, html) {
        html = (html + '').replace(RE_SCRIPT, ''); // ï¿?ï¿½ï¿½?????script
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
            // ï¿??ï¿?????ï¿??ä¸¢å¤±??elem ï¿?ï¿½ï¿½???ï¿?ï¿½ï¿½ï¿??ç±»ï¿½????å¦¥ï¿½?
            //}
        }
            // table.innerHTML = html will throw error in ie.
        catch(ex) {
            // remove any remaining nodes
            while (elem.firstChild) {
                elem.removeChild(elem.firstChild);
            }
            // html == '' ?ï¿½ï¿½??????appendChild
            if (html) {
                elem.appendChild(DOM.create(html));
            }
        }
    }

    // only for gecko and ie
    // 2010-10-22: ??? chrome ï¿?? gecko ???????ï¿½ï¿½?
    if (ie || UA['gecko'] || UA['webkit']) {
        // ï¿?? creators, ï¿??ï¿???ï¿½ï¿½?ï¿?        var creators = DOM._creators,
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
                legend: 'fieldset' // ie ???ï¿?? gecko ï¿????            };

        for (var p in creatorsMap) {
            (function(tag) {
                creators[p] = function(html, ownerDoc) {
                    return create('<' + tag + '>' + html + '</' + tag + '>', null, ownerDoc);
                }
            })(creatorsMap[p]);
        }

        if (ie) {
            // IE ï¿???ï¿½ï¿½???ï¿½ï¿½??script ???
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
                optgroup: creators.option, // gecko ???ï¿?? ie ï¿????                th: creators.td,
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
 *  - ??ï¿½ï¿½ jQuery ??buildFragment ??clean
 *  - ï¿?? cache, ï¿?? test cases
 *  - ????ï¿½ï¿½? props
 *  - remove ?ï¿½ï¿½???????ç§»ï¿½?ï¿?ï¿½ï¿½ï¿?ï¿½ï¿½?ï¿½ï¿½????ï¿??ï¿??ï¿??ï¿??ï¿???? */
/**
 * @module  dom-data
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add('dom/data', function(S, DOM, undefined) {

    var win = window,
        EXPANDO = '_ks_data_' + S.now(), // è®©ï¿½?ï¿?ï¿½ï¿½ kissy ??expando ?ï¿½ï¿½???        dataCache = { },       // ï¿?? node ?????data
        winDataCache = { };    // ?ï¿½ï¿½?æ±¡ï¿½??ï¿½ï¿½?


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
            // ?ï¿½ï¿½?å»ºï¿½??ï¿½ï¿½?è±¡ï¿½?
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
 * ?ï¿½ï¿½?ï¿?011-05-31
 *  - ??? ï¿???ï¿½ï¿½????å¯¹è±¡???ï¿???? **//**
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
        //fragment ï¿????????å°±ç©ºï¿??????ï¿½ï¿½?
        if (refNodes.length > 1) {
            cloneNode = newNode.cloneNode(true);
        }
        for (var i = 0; i < refNodes.length; i++) {
            var refNode = refNodes[i];
            //refNodes ï¿??ï¿?ï¿½ï¿½ï¿?lone
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
 *  - ?ï¿½ï¿½?ï¿????jquery ï¿??ï¿??ï¿????ï¿½ï¿½ :http://api.jquery.com/append/
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
             */
            offset: function(elem, val) {
                // ownerDocument ??????ä»¥ï¿½?ï¿?elem æ²¡ï¿½?æ¸¸ï¿½???document ï¿??ï¿??ï¿?fragmentï¿?                if (!(elem = DOM.get(elem)) || !elem[OWNER_DOCUMENT]) return;

                // getter
                if (val === undefined) {
                    return getOffset(elem);
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
                    // æ³?¿½?ï¿?                    // 1. Opera ï¿????top ???
                    // 2. ï¿?container å·²ï¿½??ï¿½ï¿½?ï¿?ï¿½ï¿½?ï¿½ï¿½?ï¿?????ï¿??
                    elem.scrollIntoView(top);
                    return;
                }

                // document ï¿????? window
                if (nodeTypeIs(container, 9)) {
                    container = getWin(container);
                }

                var isWin = !!getWin(container),
                    elemOffset = DOM.offset(elem),
                    containerOffset = isWin ? {
                        left: DOM.scrollLeft(container),
                        top: DOM.scrollTop(container) }
                        : DOM.offset(container),

                    // elem ?ï¿½ï¿½? container ï¿???????                    diff = {
                        left: elemOffset[LEFT] - containerOffset[LEFT],
                        top: elemOffset[TOP] - containerOffset[TOP]
                    },

                    // container ï¿?????ï¿?                    ch = isWin ? DOM['viewportHeight'](container) : container.clientHeight,
                    cw = isWin ? DOM['viewportWidth'](container) : container.clientWidth,

                    // container ï¿???ï¿½ï¿½? container ????????                    cl = DOM[SCROLL_LEFT](container),
                    ct = DOM[SCROLL_TOP](container),
                    cr = cl + cw,
                    cb = ct + ch,

                    // elem ???ï¿?                    eh = elem.offsetHeight,
                    ew = elem.offsetWidth,

                    // elem ?ï¿½ï¿½? container ????????                    // ï¿??diff.left ??border, cl ï¿?? border, ???ï¿???ï¿½ï¿½?ï¿?                    l = diff.left + cl - (PARSEINT(DOM.css(container, 'borderLeftWidth')) || 0),
                    t = diff.top + ct - (PARSEINT(DOM.css(container, 'borderTopWidth')) || 0),
                    r = l + ew,
                    b = t + eh,

                    t2, l2;

                // ?ï¿½ï¿½????ï¿?elem ï¿????container ï¿??ï¿?                // 1. ï¿?eh > ch ?ï¿½ï¿½?ï¿???ï¿½ç¤º elem ??ï¿½ï¿½???å¯¹ï¿½??ï¿½ï¿½?è¯´ï¿½?ï¿???ï¿½ï¿½???                // 2. ï¿?t < ct ?ï¿½ï¿½?elem ??container ï¿??ï¿??ï¿????ï¿½ï¿½?ï¿½ï¿½?ï¿?                // 3. ï¿?b > cb ?ï¿½ï¿½?elem ??container ï¿??ï¿??ï¿??????ï¿½ï¿½?ï¿?                // 4. ?ï¿½ï¿½????ï¿??elem å·²ï¿½???container ï¿??ï¿?????ä»»ï¿½????
                if (eh > ch || t < ct || top) {
                    t2 = t;
                } else if (b > cb) {
                    t2 = b - ch;
                }

                // æ°´å¹³?ï¿½ï¿½?ï¿???ï¿½ï¿½???                if (hscroll) {
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
                    // æ³?¿½?ï¿?windw ???ï¿???ï¿½ï¿½???? win
                    var left = name == "Left" ? v : DOM.scrollLeft(w);
                    var top = name == "Top" ? v : DOM.scrollTop(w);
                    w['scrollTo'](left, top);
                }
                d = w[DOCUMENT];
                ret =
                    //???
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
                //quirks : documentElement.scrollHeight ??ï¿½ï¿½ï¿?????ï¿??ï¿???ï¿½ï¿½?
                d[BODY][SCROLL + name],
                DOM[VIEWPORT + name](d));
        };

        DOM[VIEWPORT + name] = function(refWin) {
            refWin = DOM.get(refWin);
            var prop = 'inner' + name,
                w = getWin(refWin),
                d = w[DOCUMENT];
            return (prop in w) ?
                // ??? = documentElement.clientHeight
                w[prop] :
                // ie ??? documentElement.clientHeight , ??documentElement.clientHeight ï¿?????
                // ie quirks body.clientHeight: ??body ï¿??
                (isStrict ? d[DOC_ELEMENT][CLIENT + name] : d[BODY][CLIENT + name]);
        }
    });

    // ?ï¿½ï¿½? elem ?ï¿½ï¿½? elem.ownerDocument ?????    function getOffset(elem) {
        var box, x = 0, y = 0,
            body = doc.body,
            w = getWin(elem[OWNER_DOCUMENT]);

        // ?ï¿½ï¿½? GBS ????ï¿½ï¿½?ï¿?-Grade Browsers ?ï¿½å·²??? getBoundingClientRect ?ï¿½ï¿½?ï¿???ï¿½ï¿½????ï¿??????ï¿½ï¿½?ï¿?        if (elem[GET_BOUNDING_CLIENT_RECT]) {
            box = elem[GET_BOUNDING_CLIENT_RECT]();

            // ï¿??jQuery ï¿???????docElem.clientLeft/clientTop
            // ï¿??ï¿???ï¿½ï¿½?ï¿?????ï¿???ï¿½ï¿½? html ??body ??ï¿½ï¿½ï¿?è¾¹ï¿½??ï¿½ï¿½??ï¿½ï¿½??ï¿½ï¿½????ï¿??ï¿?            // æ­¤ï¿½?ï¿?e6 ï¿?ï¿½ï¿½??html ??margin ?ï¿½ï¿½?å¹¸ï¿½??ï¿½ï¿½?æ²¡ï¿½?ï¿???ï¿½ï¿½?ï¿?html ??margin

            x = box[LEFT];
            y = box[TOP];

            // ie ï¿??è¯¥ï¿½??ï¿½ï¿½??ï¿½ï¿½?è¾¹ï¿½??ï¿½ï¿½?ï¿??ï¿?? absolute ?ï¿½ï¿½??ï¿½ï¿½?ï¿??ï¿????            // ï¿??è¾¹ï¿½??????? documentElement ,quirks ?ï¿½ï¿½?ï¿?body
            // ??ï¿½ï¿½ï¿????body ??html ï¿?ï¿½ï¿½ï¿?ï¿?? ie < 9 html ï¿????2px ï¿????            // ï¿????ie ï¿???ï¿½ï¿½?ï¿???ï¿½è¾¹ï¿??body html ï¿???????,ie ??ï¿½ï¿½??? html,body è®¾ç½®
            // ??? ie ï¿?docElem.clientTop å°±ï¿½? border-top
            // ie7 html ?ï¿½ï¿½??ï¿½è¾¹ï¿?????ï¿??æ°¸ï¿½?ï¿?2

            // ï¿????firefox/chrome/ie9 ï¿?docElem.clientTop ????ï¿½è¾¹ï¿???ï¿½ä½¿è®¾ï¿½? border-top ï¿?ï¿½ï¿½ 0
            var clientTop = isIE && doc['documentMode'] != 9 && (isStrict ? docElem.clientTop : body.clientTop) || 0,
                clientLeft = isIE && doc['documentMode'] != 9 && (isStrict ? docElem.clientLeft : body.clientLeft) || 0;

            x -= clientLeft;
            y -= clientTop;

            // iphone/ipad/itouch ï¿?? Safari ?ï¿½ï¿½? getBoundingClientRect ?ï¿½ï¿½?å·²ï¿½???? scrollTop
            if (UA.mobile !== 'apple') {
                x += DOM[SCROLL_LEFT](w);
                y += DOM[SCROLL_TOP](w);
            }
        }

        return { left: x, top: y };
    }

    // è®¾ç½® elem ?ï¿½ï¿½? elem.ownerDocument ?????    function setOffset(elem, offset) {
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
 *  - ?ï¿½ï¿½?ï¿? *  - ï¿?? docWidth , docHeight ,
 *      viewportHeight , viewportWidth ,scrollLeft,scrollTop ???ï¿? *      ä¾¿ï¿½??ï¿½ç½®??Node ï¿??ï¿??ä»¥ï¿½??ï¿½ï¿½???DOMï¿???ï¿½ä½¿??Node
 *
 *
 *
 * TODO:
 *  - ??????ï¿?? jQuery ??position, offsetParent ï¿???? *  - ?ï¿½ï¿½?ï¿??ï¿???ï¿½ï¿½?ï¿??ï¿??ï¿?? position ï¿?fixed ????ï¿½ï¿½?
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
        // ??? 2/8 ???ï¿?????ä»¥ï¿½???????
        // #id
        // tag
        // .cls
        // #id tag
        // #id .cls
        // tag.cls
        // #id tag.cls
        // ï¿?1ï¿?EG_QUERY ï¿???ï¿½ï¿½? #id.cls
        // ï¿?2ï¿?ag ??ï¿½ï¿½ï¿?* ï¿??
        // ï¿?3: ??? , ?ï¿½ï¿½?ï¿?        // ï¿???ï¿½ä¸º?ï¿½ï¿½?
        // ????ï¿½ï¿½?????ï¿½ï¿½????ï¿?ï¿½ï¿½

        // selector ä¸ºï¿½?ï¿?ï¿½ï¿½???å¸¸ï¿½?????ï¿½ï¿½?ï¿?????
        // ï¿??ç©ºï¿½?ï¿??ä¸²ï¿½???????ï¿??ï¿??????ï¿½ï¿½???ï¿½ï¿½?ï¿½ï¿½?
        if (S.isString(selector)) {

            if (selector.indexOf(",") != -1) {
                var selectors = selector.split(",");
                S.each(selectors, function(s) {
                    ret.push.apply(ret, S.makeArray(query(s, context)));
                });
            } else {


                selector = S.trim(selector);

                // selector ï¿?#id ???å¸¸ï¿½?????ï¿½ï¿½??ï¿½ï¿½?ï¿??ï¿??
                if (REG_ID.test(selector)) {
                    t = getElementById(selector.slice(1), context);
                    if (t) ret = [t]; // #id ????ï¿½ï¿½?ï¿??ç©ºï¿½?ï¿?                }
                // selector ä¸ºï¿½????è¡¨ä¸­???ï¿?6 ï¿?                else if ((match = REG_QUERY.exec(String(selector)))) {
                    // ?ï¿½ï¿½??ï¿½ï¿½??ï¿½ï¿½?ä¿¡ï¿½?
                    id = match[1];
                    tag = match[2];
                    cls = match[3];

                    if (context = (id ? getElementById(id, context) : context)) {
                        // #id .cls | #id tag.cls | .cls | tag.cls
                        if (cls) {
                            if (!id || selector.indexOf(SPACE) !== -1) { // ??? #id.cls
                                ret = S.makeArray(getElementsByClassName(cls, tag, context));
                            }
                            // ï¿?? #id.cls
                            else {
                                t = getElementById(id, context);
                                if (t && DOM.hasClass(t, cls)) {
                                    ret = [t];
                                }
                            }
                        }
                        // #id tag | tag
                        else if (tag) { // ???ç©ºï¿½?ï¿??ï¿?                            ret = getElementsByTagName(tag, context);
                        }
                    }
                }
                // ???ï¿???????                else if (sizzle) {
                    ret = sizzle(selector, context);
                }
                // ï¿??ï¿????????ï¿?                else {
                    error(selector);
                }
            }
        }
        // ï¿????selector ??NodeList ??ï¿½ï¿½??Array
        else if (selector && (S.isArray(selector) || isNodeList(selector))) {
            ret = selector;
        }
        // ï¿????selector ??Node ï¿??ï¿??ä¸²ï¿½?è±¡ï¿½????ï¿??
        else if (selector) {
            ret = [selector];
        }
        // ï¿????selector ???ï¿???ï¿½ï¿½?ï¿??ç©ºï¿½?ï¿?
        // ï¿?NodeList ï¿??ä¸ºï¿½????ï¿?        if (isNodeList(ret)) {
            ret = S.makeArray(ret);
        }

        // attach each method
        ret.each = function(fn, context) {
            return S.each(ret, fn, context);
        };

        return ret;
    }


    // ï¿?? context ä¸ºï¿½????
    function tuneContext(context) {
        // 1). context ï¿?undefined ???å¸¸ï¿½?????ï¿½ï¿½?ï¿?????
        if (context === undefined) {
            context = doc;
        }
        // 2). context ???ï¿?ï¿½ï¿½?ï¿½ï¿½????ï¿?? #id
        else if (S.isString(context) && REG_ID.test(context)) {
            context = getElementById(context.slice(1), doc);
            // ï¿??#id ??????ï¿???ï¿½ï¿½???? context ï¿?null
        }
        // 3). nodelist ???ï¿?ï¿½ï¿½???
        else if (S.isArray(context) || isNodeList(context)) {
            context = context[0] || null;
        }
        // 4). context ï¿??ä»¥ï¿½???HTMLElement, æ­¤ï¿½????ï¿??
        // 5). ï¿?? 1 - 4, ï¿?? context ï¿????HTMLElement, ï¿??ï¿?null
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

                // ï¿??ï¿?????ï¿????tag.cls å½?¿½?
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
                // ?ï¿½ï¿½?ï¿?? filter, ???ï¿???????                else if (filter && sizzle) {
                    ret = sizzle._filter(selector, filter, context);
                }
                // filter ä¸ºç©º????????selector
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
 *  - ï¿?reg exec ?????id, tag, className)??cache, ???å¯¹ï¿½??ï¿½å½±???ï¿???ï¿½ï¿½??? *  - getElementById ä½¿ï¿½?ï¿?????ï¿?ï¿½ï¿½?ï¿½ï¿½?è¾¾ï¿½???????
 *  - getElementsByClassName ?ï¿½ï¿½?ï¿?? querySelectorAll, ï¿?IE ç³»ï¿½?ï¿?????
 *  - instanceof å¯¹ï¿½??ï¿½ï¿½?å½±ï¿½??? *  - ????ï¿½ï¿½?????ï¿½ï¿½?ï¿?? cls, context ï¿??ï¿?ï¿½ï¿½???ï¿?ï¿½ï¿½ï¿?? query ?ï¿½ï¿½?ï¿??ï¿??ï¿?????ï¿???ï¿½ï¿½????
 *  - query ?ï¿½ï¿½?ï¿???ï¿½ä»¶?ï¿½ï¿½????ï¿??ï¿??ï¿???????????????ï¿½ï¿½?????ï¿½ï¿½??ï¿½ï¿½????
 *  - Array ??push ?ï¿½ï¿½???ï¿½ï¿½??j++ ?ï¿½ï¿½?ä»£ï¿½??ï¿½ï¿½???????
 *  - ï¿???ï¿½ï¿½??ï¿½ï¿½? Sizzle ï¿??ï¿??å¸¸ï¿½?ï¿?????ï¿???ï¿½ï¿½???????ï¿????ï¿½ï¿½?ï¿½ï¿½??? *
 *  - ï¿??ç¼©ï¿½?ï¿?????ï¿??ä»¥ï¿½? getElmentsByTagName ??getElementsByClassName ï¿??ä¸ºå¸¸???
 *    ï¿?????ï¿????ï¿½ï¿½???ç¼©ï¿½????ï¿??ï¿??ï¿???ï¿½ï¿½?å¥½ï¿½?
 *
 *  - ï¿?? getElementsByClassName ???çº§ï¿½?ï¿???ï¿½ï¿½???ï¿½ï¿½???????? *
 * 2010.02
 *  - æ·»ï¿½?å¯¹ï¿½?ï¿???ï¿½ï¿½???????ä¸»ï¿½???? Sizzle ??ï¿½ï¿½???ä»£ï¿½??ï¿½ï¿½?å¯¹ï¿½? Grade A çº§ï¿½?ï¿????????
 *
 * 2010.03
 *  - ?ï¿½ï¿½???? dom ??ï¿½ï¿½ï¿?api: S.query ï¿???ï¿½ï¿½?; S.get ï¿??ï¿??ï¿??
 *    ?ï¿½ï¿½? Node ??api: S.one, ??Node ï¿???ï¿½ï¿½?
 *    ?ï¿½ï¿½? NodeList ??api: S.all, ??NodeList ï¿???ï¿½ï¿½?
 *    ??? api ???ï¿?????æ»¡è¶³??ï¿½ï¿½?ï¿½ï¿½????çº§ï¿½??ï¿½ï¿½?????? *
 * 2010.05
 *  - ?ï¿½ï¿½?ï¿?S.query ï¿???ï¿½ï¿½?è®¤æ·»??? each ?ï¿½ï¿½?ï¿????ï¿½ï¿½???
 *  - å¯¹ï¿½?ï¿????? selector, ???ï¿?????ï¿????Selector.
 *
 * 2010.06
 *  - ï¿?? filter ??test ?ï¿½ï¿½?
 *
 * 2010.07
 *  - ???ï¿?, ?????????group ?ï¿½ï¿½???Sizzle
 *
 * 2010.08
 *  - ï¿?S.query ?????attach each ?ï¿½ï¿½?
 *
 * 2011.05
 *  - ?ï¿½ï¿½?ï¿??ï¿??ï¿????????
 *
 * Bugs:
 *  - S.query('#test-data *') ï¿?ï¿½ï¿½ * ?ï¿½ï¿½?????????IE6 ï¿??????ï¿½ï¿½?å¯¹ï¿½?jQuery ï¿?ï¿½ï¿½ï¿????? bug, è¯¡ï¿½??? *
 * References:
 *  - http://ejohn.org/blog/selectors-that-people-actually-use/
 *  - http://ejohn.org/blog/thoughts-on-queryselectorall/
 *  - MDC: querySelector, querySelectorAll, getElementsByClassName
 *  - Sizzle: http://github.com/jeresig/sizzle
 *  - MINI: http://james.padolsey.com/javascript/mini/
 *  - Peppy: http://jamesdonaghue.com/?p=40
 *  - Sly: http://github.com/digitarald/sly
 *  - XPath, TreeWalkerï¿?ttp://www.cnblogs.com/rubylouvre/archive/2009/07/24/1529640.html
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
                            // æ²¡ï¿½?è®¾ç½®ï¿?opacity ?ï¿½ï¿½??ï¿½ï¿½?ï¿???ï¿½ï¿½???1 ?ï¿½ï¿½?
                            //ï¿??è¯¥ï¿½??ï¿½æ²¡??ï¿½ï¿½??? dom ï¿??ï¿?? filters ï¿??

                            var currentFilter = (elem.currentStyle || 0).filter || '';
                            var m;
                            if (m = currentFilter.match(/alpha\(opacity[=:]([^)]+)\)/)) {
                                val = parseInt(S.trim(m[1]));
                            }

                        }
                    }

                    // ???ï¿??ï¿??ï¿??ï¿??ï¿?ï¿½ï¿½??ï¿½ï¿½ï¿??ä¸²ç±»??                    return val / 100 + '';
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
                        //?ï¿½ï¿½? alpha(opacity:0), alpha(opacity=0) ?
                        currentFilter = S.trim(currentFilter.replace(/alpha\(opacity[=:][^)]+\),?/ig, ''));
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
     * ie ï¿??????ï¿½ï¿½??????thick? medium ...
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

            // ï¿?width/height è®¾ç½®ä¸ºï¿½?????ï¿½ï¿½???? pixelLeft ?ï¿½ï¿½?ï¿????width/height ??            // ??ie ï¿??å¯¹ï¿½?????ï¿½ï¿½???offset ?ï¿½ï¿½?
            // borderWidth ï¿??ï¿?????ï¿???????borderWidth è®¾ä¸º?ï¿½ï¿½?ï¿??ï¿??ï¿??ï¿????ï¿½ï¿½ï¿?????
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
 * ?ï¿½ï¿½?ï¿?2011.05.19 opacity in ie
 *  - ï¿???????????å»ºï¿½?è®¾ç½®opacityï¿?ï¿½ï¿½?????dom ????????opacity ?? *  - ?ï¿½ï¿½?ï¿?order-width ?ï¿½ï¿½?ie ï¿?????ï¿?? medium/thin/thick ï¿??ï¿??ï¿??ï¿??ï¿?? px ?ï¿½ï¿½?
 *
 *  - opacity ????ï¿½ï¿½?ï¿??ä»¥ï¿½? progid:DXImageTransform.Microsoft.BasicImage(opacity=.2) ?ï¿½ï¿½??ï¿½ï¿½?ï¿???? *    ä¸»ï¿½?ç±»ï¿½??ï¿½ï¿½???DXImageTransform.Microsoft.Alpha ?ï¿½ï¿½??ï¿½ï¿½?ï¿?ï¿½ï¿½ï¿??ï¿??ç±»ï¿½?æ··ï¿½?ä½¿ï¿½??ï¿½ï¿½?ï¿???ï¿½ï¿½?ï¿??kissy ?? *    ï¿????? Alpha ?ï¿½ï¿½??ï¿½ï¿½?
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
                    // webkit è®¤ï¿½? camel-case, ?ï¿½ï¿½???????ï¿?cameCase
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

                        // ??get ????ï¿½ï¿½????ï¿???ï¿½ï¿½?ï¿????                        if (ret === '' && !name.get) {
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

                    // ??????ï¿??ï¿????????ï¿?? css ???ï¿?? display: none
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

                // ï¿?ï¿½ï¿½???æ¬¡ï¿½?ï¿??ï¿?ï¿½ï¿½??                if (elem) {
                    return;
                }

                elem = DOM.create('<style>', { id: id }, doc);

                // ??ï¿½ï¿½??? DOM ??ï¿½ï¿½ï¿??ï¿?cssText ï¿??ï¿????css hack ï¿?ï¿½ï¿½??                DOM.get('head', doc).appendChild(elem);

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

    // ï¿?? getComputedStyle ï¿???ï¿½ï¿½??ï¿½ï¿½?ï¿???ï¿½ï¿½?å®¹ï¿½????
    function fixComputedStyle(elem, name, val) {
        var offset, ret = val;

        // 1. ï¿?ï¿½ï¿½???ï¿?style.left ?ï¿½ï¿½?getComputedStyle ?ï¿½ï¿½????ï¿??ï¿??ï¿???ï¿½ï¿½???        //    ï¿??ï¿?irefox ï¿?? 0, webkit/ie ï¿?? auto
        // 2. style.left è®¾ç½®ä¸ºï¿½?????ï¿½ï¿½?ï¿???ï¿½ä¸º?ï¿½ï¿½?ï¿?        // å¯¹ï¿½?ï¿??ï¿???ï¿½ï¿½?ï¿????relative ???ï¿??ï¿?0. ï¿????absolute ???ï¿??ï¿?offsetLeft - marginLeft
        // å¯¹ï¿½?ï¿??ï¿???ï¿½ï¿½?å¤§ï¿½???ï¿½ï¿½ï¿?????ï¿??ï¿??ï¿???????? fix???ï¿?? bug
        if (val === AUTO && RE_LT.test(name)) {
            ret = 0;
            if (S.inArray(DOM.css(elem, 'position'), ['absolute','fixed'])) {
                offset = elem[name === 'left' ? 'offsetLeft' : 'offsetTop'];

                // old-ie ï¿??elem.offsetLeft ??? offsetParent ??border å®½åº¦ï¿??ï¿????                if (isIE && document['documentMode'] != 9 || UA['opera']) {
                    // ç±»ä¼¼ offset ie ï¿??è¾¹ï¿½?ï¿??
                    // ï¿?? offsetParent ï¿?html ï¿??ï¿???ï¿½ï¿½?ï¿?2 px == documentElement.clientTop
                    // ?????? borderTop ?ï¿½ï¿½?ï¿?? clientTop
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
 *  - Opera ï¿??color ï¿??ï¿?? #XXYYZZ, ??rgb(). ??? jQuery ï¿?ï¿½ï¿½ï¿??å¿½ï¿½?æ­¤å·®ï¿??KISSY ï¿?ï¿½ï¿½?ï¿½ï¿½?
 *  - Safari ï¿?????transparent ï¿????ï¿½ï¿½ rgba(0, 0, 0, 0), ???ï¿???????? bug, ï¿?ï¿½ï¿½?ï¿½ï¿½?
 *
 *  - ??webkit ï¿??jQuery.css paddingLeft ï¿?? style ?ï¿½ï¿½? padding-left ï¿?? computedStyle ?ï¿½ï¿½?
 *    ï¿?????ï¿????ISSY ???ï¿??ï¿??ï¿??ï¿???? *
 *  - getComputedStyle ??webkit ï¿??ï¿??ï¿???ï¿½ï¿½????ie ï¿?????ï¿??ï¿?ecko ï¿???ï¿½ï¿½???float ?ï¿½ï¿½?
 *
 *  - color: blue ç»§ï¿½??ï¿½ï¿½?getComputedStyle, ??ie ï¿????blue, opera ï¿?? #0000ff, ?ï¿½ï¿½?ï¿???? *    ï¿?? rgb(0, 0, 255)
 *
 *  - ?ï¿½ï¿½?ï¿??ä½¿ï¿½?ï¿???ï¿½ï¿½??ï¿½ï¿½??ï¿½ï¿½?ï¿?ï¿½ï¿½??????jQuery/ExtJS/KISSY ???è¿½ï¿½?ï¿?????YUI3 ????ï¿½ï¿½?ï¿??ï¿??ï¿??
 *    ï¿??ï¿??ï¿???ï¿½å·®ï¿??
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
                        // a ??b?ï¿½äº²?ï¿½ï¿½?ï¿?ï¿½ï¿½?????true
                        precondition = true;
                    } else if (b.nodeType == 9) {
                        // b === document
                        // æ²¡ï¿½?ä»»ï¿½?????ï¿½ï¿½???document
                        return false;
                    } else {
                        // a ??b ?ï¿½ï¿½?ï¿?? false
                        precondition = a !== b;
                    }
                    // !a.contains => a===document
                    // æ³?¿½???? contains ?ï¿½ï¿½???a===b ï¿????true
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

    // ?ï¿½ï¿½???? elem ??direction ?ï¿½ï¿½?ï¿?ï¿½ï¿½ï¿?filter ???ï¿?ï¿½ï¿½???
    // filter ??ï¿½ï¿½ number, selector, fn array ï¿?ï¿½ï¿½?ï¿½ï¿½??ï¿½ï¿½????ï¿?    // direction ??ï¿½ï¿½ parentNode, nextSibling, previousSibling
    // util : ?ï¿½ï¿½?ï¿??æ®µï¿½?????ï¿½ï¿½??ï¿½ï¿½???    function nth(elem, filter, direction, extraFilter, until, includeSef) {
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
            // ï¿????1
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

    // ?ï¿½ï¿½???? elem ??siblings, ï¿?????ï¿?    function getSiblings(selector, filter, parent) {
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
 *  - api ???è®¡ï¿½?ï¿?ï¿½ï¿½?????jQuery. ï¿??ä¸ºï¿½????ï¿?api ï¿??ï¿????first-all ???????? *    ?ï¿½å¾ª 8/2 ???ï¿??å°½ï¿½??ï¿½ï¿½???ï¿½ï¿½??ï¿½ï¿½è¶³ï¿½??ï¿½ï¿½?å¸¸ï¿½?????ï¿½ï¿½?
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
