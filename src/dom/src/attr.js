/**
 * @fileOverview   dom-attr
 * @author  yiminghe@gmail.com,lifesinger@gmail.com
 */
KISSY.add('dom/attr', function (S, DOM, UA, undefined) {

        var doc = S.Env.host.document,
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
                "cellspacing":"cellSpacing",
                "cellpadding":"cellPadding",
                rowspan:"rowSpan",
                colspan:"colSpan",
                usemap:"useMap",
                "frameborder":"frameBorder",
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
                    // Return undefined if attribute node specified by user
                    return ret && (
                        // fix #100
                        ret.specified
                            // input.attr("value")
                            || ret.nodeValue) ?
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
                 * Get the value of a property for the first element in the set of matched elements.
                 * or
                 * Set one or more properties for the set of matched elements.
                 * @param {Array<HTMLElement>|String|HTMLElement} selector matched elements
                 * @param {String|Object} name
                 * The name of the property to set.
                 * or
                 * A map of property-value pairs to set.
                 * @param [value] A value to set for the property.
                 * @returns {String|undefined|boolean}
                 */
                prop:function (selector, name, value) {
                    var elems = DOM.query(selector);

                    // supports hash
                    if (S.isPlainObject(name)) {
                        for (var k in name) {
                            DOM.prop(elems, k, name[k]);
                        }
                        return undefined;
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
                    return undefined;
                },

                /**
                 * Whether one of the matched elements has specified property name
                 * @param {Array<HTMLElement>|String|HTMLElement} selector 元素
                 * @param {String} name The name of property to test
                 * @return {boolean}
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
                 * Remove a property for the set of matched elements.
                 * @param {Array<HTMLElement>|String|HTMLElement} selector matched elements
                 * @param {String} name The name of the property to remove.
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
                 * Get the value of an attribute for the first element in the set of matched elements.
                 * or
                 * Set one or more attributes for the set of matched elements.
                 * @param {HTMLElement[]|HTMLElement|String|Element} selector matched elements
                 * @param {String|Object} name The name of the attribute to set. or A map of attribute-value pairs to set.
                 * @param [val] A value to set for the attribute.
                 * @returns {String}
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
                        return undefined;
                    }

                    if (!(name = S.trim(name))) {
                        return undefined;
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
                    return undefined;
                },

                /**
                 * Remove an attribute from each element in the set of matched elements.
                 * @param {Array<HTMLElement>|String} selector matched elements
                 * @param {String} name An attribute to remove
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
                 * Whether one of the matched elements has specified attribute
                 * @function
                 * @param {Array<HTMLElement>|String} selector matched elements
                 * @param {String} name The attribute to be tested
                 * @returns {Boolean}
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
                 * Get the current value of the first element in the set of matched elements.
                 * or
                 * Set the value of each element in the set of matched elements.
                 * @param {Array<HTMLElement>|String} selector matched elements
                 * @param {String|Array<String>} [value] A string of text or an array of strings corresponding to the value of each matched element to set as selected/checked.
                 * @returns {undefined|String|Array<String>|Number}
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

                        return undefined;
                    }

                    var els = DOM.query(selector), i;
                    for (i = els.length - 1; i >= 0; i--) {
                        elem = els[i];
                        if (elem.nodeType !== 1) {
                            return undefined;
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
                    return undefined;
                },

                _propHooks:propHooks,

                /**
                 * Get the combined text contents of each element in the set of matched elements, including their descendants.
                 * or
                 * Set the content of each element in the set of matched elements to the specified text.
                 * @param {HTMLElement[]|HTMLElement|String} selector matched elements
                 * @param {String} [val] A string of text to set as the content of each matched element.
                 * @returns {String|undefined}
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
                    return undefined;
                }
            });
        if (1 > 2) {
            DOM.removeProp("j", "1");
        }
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
