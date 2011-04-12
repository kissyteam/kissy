/**
 * @module  dom-attr
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add('dom/attr', function(S, DOM, UA, undefined) {

    var doc = document,
        docElement = doc.documentElement,
        oldIE = !docElement.hasAttribute,
        TEXT = docElement.textContent !== undefined ? 'textContent' : 'innerText',
        SELECT = 'select',
        EMPTY = '',
        isElementNode = DOM._isElementNode,
        isTextNode = function(elem) {
            return DOM._nodeTypeIs(elem, 3);
        },

        RE_SPECIAL_ATTRS = /^(?:href|src|style)/,
        RE_NORMALIZED_ATTRS = /^(?:href|src|colspan|rowspan)/,
        RE_RETURN = /\r/g,
        RE_RADIO_CHECK = /^(?:radio|checkbox)/,

        CUSTOM_ATTRS = {
            readonly: 'readOnly'
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
        };

    var attrNormalizers = {
        tabindex:{
            getter:function(el) {
                return el.tabIndex;
            },
            setter:function(el, val) {
                // http://www.w3.org/TR/html5/editing.html#sequential-focus-navigation-and-the-tabindex-attribute
                // 简化，和不填一样处理！
                if (isNaN(parseInt(val))) {
                    el.removeAttribute("tabindex");
                    el.removeAttribute("tabIndex");
                } else {
                    el.tabIndex = val;
                }
            }
        },
        // 在标准浏览器下，用 getAttribute 获取 style 值
        // IE7- 下，需要用 cssText 来获取
        // 统一使用 cssText
        style:{
            getter:function(el) {
                return el.style.cssText;
            },
            setter:function(el, val) {
                el.style.cssText = val;
            }
        },
        checked:{
            // checked 属性值，需要通过直接设置才能生效
            setter:function(el, val) {
                el.checked = !!val;
            }
        },
        disabled:{
            // disabled 属性值，需要通过直接设置才能生效
            //true 然后 false，false失效
            setter:function(el, val) {
                el.disabled = !!val;
            }
        }
    };

    if (oldIE) {
        S.mix(CUSTOM_ATTRS, {
            'for': 'htmlFor',
            'class': 'className'
        });
    }

    var attrNormalizers = {
        tabindex:{
            getter:function(el) {
                return el.tabIndex;
            },
            setter:function(el, val) {
                // http://www.w3.org/TR/html5/editing.html#sequential-focus-navigation-and-the-tabindex-attribute
                // 简化，和不填一样处理！
                if (isNaN(parseInt(val))) {
                    el.removeAttribute("tabindex");
                    el.removeAttribute("tabIndex");
                } else {
                    el.tabIndex = val;
                }
            }
        },
        // 在标准浏览器下，用 getAttribute 获取 style 值
        // IE7- 下，需要用 cssText 来获取
        // 统一使用 cssText
        style:{
            getter:function(el) {
                return el.style.cssText;
            },
            setter:function(el, val) {
                el.style.cssText = val;
            }
        },
        checked:{
            // checked 属性值，需要通过直接设置才能生效
            setter:function(el, val) {
                el.checked = !!val;
            }
        },
        disabled:{
            // disabled 属性值，需要通过直接设置才能生效
            //true 然后 false，false失效
            setter:function(el, val) {
                el.disabled = !!val;
            }
        }
    };

    S.mix(DOM, {

        /**
         * Gets the value of an attribute for the first element in the set of matched elements or
         * Sets an attribute for the set of matched elements.
         */
        attr: function(selector, name, val, pass) {
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
            name = CUSTOM_ATTRS[name] || name;

            var attrNormalizer = attrNormalizers[name];

            // getter
            if (val === undefined) {
                // supports css selector/Node/NodeList
                var el = DOM.get(selector);

                // only get attributes on element nodes
                if (!isElementNode(el)) {
                    return undefined;
                }
                if (attrNormalizer && attrNormalizer.getter) {
                    return attrNormalizer.getter(el);
                }

                var ret;

                // 优先用 el[name] 获取 mapping 属性值：
                // - 可以正确获取 readonly, checked, selected 等特殊 mapping 属性值
                // - 可以获取用 getAttribute 不一定能获取到的值，比如 tabindex 默认值
                // - href, src 直接获取的是 normalized 后的值，排除掉
                // - style 需要用 getAttribute 来获取字符串值，也排除掉
                if (!RE_SPECIAL_ATTRS.test(name)) {
                    ret = el[name];
                }

                // 用 getAttribute 获取非 mapping 属性和 href/src/style 的值：
                if (ret === undefined) {
                    ret = el.getAttribute(name);
                }

                // fix ie bugs
                if (oldIE) {
                    // 不光是 href, src, 还有 rowspan 等非 mapping 属性，也需要用第 2 个参数来获取原始值
                    if (RE_NORMALIZED_ATTRS.test(name)) {
                        ret = el.getAttribute(name, 2);
                    }
                }

                // 对于不存在的属性，统一返回 undefined
                return ret === null ? undefined : ret;
            }

            // setter
            S.each(DOM.query(selector), function(el) {
                // only set attributes on element nodes
                if (!isElementNode(el)) {
                    return;
                }

                if (attrNormalizer && attrNormalizer.setter) {
                    attrNormalizer.setter(el, val);
                } else {
                    // convert the value to a string (all browsers do this but IE)
                    el.setAttribute(name, EMPTY + val);
                }
            });
        },

        /**
         * Removes the attribute of the matched elements.
         */
        removeAttr: function(selector, name) {
            name = name.toLowerCase();
            S.each(DOM.query(selector), function(el) {
                if (isElementNode(el)) {
                    DOM.attr(el, name, EMPTY); // 先置空
                    el.removeAttribute(name); // 再移除
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
                // http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
                // try name=tabindex
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
        val: function(selector, value) {
            // getter
            if (value === undefined) {
                // supports css selector/Node/NodeList
                var el = DOM.get(selector);

                // only gets value on element nodes
                if (!isElementNode(el)) {
                    return undefined;
                }

                // 当没有设定 value 时，标准浏览器 option.value === option.text
                // ie7- 下，没有设定 value 时，option.value === '', 需要用 el.attributes.value 来判断是否有设定 value
                if (nodeNameIs('option', el)) {
                    return (el.attributes.value || {}).specified ? el.value : el.text;
                }

                // 对于 select, 特别是 multiple type, 存在很严重的兼容性问题
                if (nodeNameIs(SELECT, el)) {
                    var index = el.selectedIndex,
                        options = el.options;

                    if (index < 0) {
                        return null;
                    }
                    else if (el.type === 'select-one') {
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
                }

                // Handle the case where in Webkit "" is returned instead of "on" if a value isn't specified
                if (UA['webkit'] && RE_RADIO_CHECK.test(el.type)) {
                    return el.getAttribute('value') === null ? 'on' : el.value;
                }

                // 普通元素的 value, 归一化掉 \r
                return (el.value || EMPTY).replace(RE_RETURN, EMPTY);
            }

            // setter
            S.each(DOM.query(selector), function(el) {
                if (nodeNameIs(SELECT, el)) {
                    // 强制转换数值为字符串，以保证下面的 inArray 正常工作
                    if (S['isNumber'](value)) {
                        value += EMPTY;
                    }

                    var vals = S.makeArray(value),
                        opts = el.options, opt;

                    for (i = 0,len = opts.length; i < len; ++i) {
                        opt = opts[i];
                        opt.selected = S.inArray(DOM.val(opt), vals);
                    }

                    if (!vals.length) {
                        el.selectedIndex = -1;
                    }
                }
                else if (isElementNode(el)) {
                    el.value = value;
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

    // 判断 el 的 nodeName 是否指定值
    function nodeNameIs(val, el) {
        return el && el.nodeName.toUpperCase() === val.toUpperCase();
    }

    return DOM;
}, {
    requires:["dom/base","ua"]
});

/**
 * NOTES:
 * 2011-01-28
 *
 * 处理 tabindex，顺便重构
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
