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
                            null;
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
        boolHook = {
            get: function(elem, name) {
                // 转发到 prop 方法
                return DOM.prop(elem, name) ?
                    // 根据 w3c attribute , true 时返回属性名字符串
                    name.toLowerCase() :
                    null;
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
        // get attribute value from attribute node
        attrNodeHook = {
            get: function(elem, name) {
                var ret;
                ret = elem.getAttributeNode(name);
                // Return undefined if nodeValue is empty string
                return ret && ret.nodeValue !== "" ?
                    ret.nodeValue :
                    null;
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
                    return ret === undefined ? null : ret;
                }
            };
        });
        // button 元素的 value 属性和其内容冲突
        // <button value='xx'>zzz</button>
        valHooks.button = attrHooks.value = attrNodeHook;
    } else if (UA.safari) {
        //safari option selected not work ?
        propHooks.selected = {
            get: function(elem) {
                var ret,parent = elem.parentNode;
                if (parent) {
                    ret = parent.selectedIndex;
                    // optgroups works too
                    if (ret === undefined && parent.parentNode) {
                        ret = parent.parentNode.selectedIndex;
                    }
                    return ret === undefined ? null : ret;
                }
            }
        }
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
                }
                else {
                    var elem = elems[0];
                    if (!elem) return null;
                    if (hook && hook.get) {
                        return  hook.get(elem, name);

                    } else {
                        return elem[ name ];
                    }
                }
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
                } else if (rinvalidChar.test(name)) {
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
                        return null;
                    }

                    // browsers index elements by id/name on forms, give priority to attributes.
                    if (el.nodeName.toLowerCase() == "form") {
                        attrNormalizer = attrNodeHook;
                    }
                    if (attrNormalizer && attrNormalizer.get) {
                        return attrNormalizer.get(el, name);
                    }

                    var ret = el.getAttribute(name);

                    /**
                     * undefined 会形成链状，so 不能
                     */
                    return ret === undefined ? null : ret;
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
                            // handle cases where value is null/undef or number
                            ret == null ? "" : ret;
                    }

                    return null;
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
                    //prevent chain in Node
                    return null;
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
        DOM.removeProp();
    }
    return DOM;
}, {
        requires:["dom/base","ua"]
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
