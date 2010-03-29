/**
 * @module  dom-base
 * @author  lifesinger@gmail.com
 * @depends kissy, selector
 */

KISSY.add('dom-base', function(S, undefined) {

    var doc = document,
        docElement = doc.documentElement,
        TEXT = docElement.textContent !== undefined ? 'textContent' : 'innerText',
        ie = S.UA.ie,
        oldIE = ie && ie < 8,
        CUSTOM_ATTRS = {
            readonly: 'readOnly'
        },
        REG_SPECIAL_ATTRS = /href|src|style/,
        REG_NORMALIZED_ATTRS = /href|src|colspan|rowspan/,
        REG_RETURN = /\r/g;

    if(oldIE) {
        S.mix(CUSTOM_ATTRS, {
            'for': 'htmlFor',
            'class': 'className'
        });
    }

    S.DOM = {

        /**
         * Returns a NodeList that matches the selector.
         */
        query: S.query,

        /**
         * Returns the first element that matches the selector.
         */
        get: S.get,

        /**
         * Gets or sets the attribute of the HTMLElement.
         */
        attr: function(el, name, val) {
            // don't set attributes on element nodes
            if (!el || el.nodeType !== 1) {
                return undefined;
            }

            var ret;
            name = name.toLowerCase();
            name = CUSTOM_ATTRS[name] || name;

            // get attribute
            if (val === undefined) {
                // 优先用 el[name] 获取 mapping 属性值：
                //  - 可以正确获取 readonly, checked, selected 等特殊 mapping 属性值
                //  - 可以获取用 getAttribute 不一定能获取到的值，比如 tabindex 默认值
                //  - href, src 直接获取的是 normalized 后的值，排除掉
                if(!REG_SPECIAL_ATTRS.test(name)) {
                    ret = el[name];
                }
                // get style
                else if(name === 'style') {
                    ret = el.style.cssText;
                }
                
                // 用 getAttribute 获取非 mapping 属性和 href, src 的值：
                if(ret === undefined) {
                    ret = el.getAttribute(name);
                }

                // fix ie bugs:
                if (oldIE && REG_NORMALIZED_ATTRS.test(name)) {
                    // 不光是 href, src, 还有 rowspan 等非 mapping 属性，也需要用第 2 个参数来获取原始值
                    ret = el.getAttribute(name, 2);
                }

                // 对于不存在的属性，统一返回 undefined
                return ret === null ? undefined : ret;
            }

            // set attribute
            if(name === 'style') {
                el.style.cssText = val;
            }
            else {
                // convert the value to a string (all browsers do this but IE)
                el.setAttribute(name, '' + val);
            }
        },

        /**
         * Removes the attribute of the HTMLElement.
         */
        removeAttr: function(el, name) {
            if(el && el.nodeType === 1) {
                el.removeAttribute(name);
            }
        },

        /**
         * Get the current value of the HTMLElement.
         */
        val: function(el, value) {
            if(!el || el.nodeType !== 1) {
                return undefined;
            }

            // get value
            if(value === undefined) {

                // 当没有设定 value 时，标准浏览器 option.value == option.text
                // ie7- 下 optinos.value == '', 需要用 el.attributes.value 来判断是否有设定 value
                if(nodeNameIs('option', el)) {
                    return (el.attributes.value || {}).specified ? el.value : el.text;
                }
                // 对于 select, 特别是 multiple type, 存在很严重的兼容性问题
                else if(nodeNameIs('select', el)) {
                    var index = el.selectedIndex,
                        options = el.options;

                    if (index < 0) {
                        return null;
                    }
                    else if(el.type === 'select-one') {
                        return S.DOM.val(options[index]);
                    }

                    // Loop through all the selected options
                    var ret = [], i = 0, len = options.length;
                    for (; i < len; ++i) {
                        if (options[i].selected) {
                            ret.push(S.DOM.val(options[i]));
                        }
                    }
                    // Multi-Selects return an array
                    return ret;
                }

                // 普通元素的 value, 归一化掉 \r
                return (el.value || '').replace(REG_RETURN, '');
            }

            // set value
            el.value = value;
        },

        /**
         * Gets or sets styles on the HTMLElement.
         */
        css: function(/*el, prop, val*/) {
            // TODO
        },

        /**
         * Gets or sets the the text content of the HTMLElement.
         */
        text: function(el, val) {
            // getText
            if (val === undefined) {
                return (el || {})[TEXT] || '';
            }

            // setText
            if (el) {
                el[TEXT] = val;
            }
        },

        /**
         * Get the HTML contents of the HTMLElement.
         */
        html: function(/*el, htmlString*/) {
            // TODO
        },

        /**
         * Creates a new HTMLElement using the provided html string.
         */
        create: function(/*htmlString, ownerDocument*/) {
            // TODO
            S.error('not implemented');
        }
    };

    function nodeNameIs(val, el) {
        return el && el.nodeName.toUpperCase() === val.toUpperCase();
    }
});

/**
 * Notes:
 *
 * 2010.03
 *  ~ attr:
 *    - 在 jquery/support.js 中，special attrs 里还有 maxlength, cellspacing,
 *      rowspan, colspan, useap, frameboder, 但测试发现，在 Grade-A 级浏览器中
 *      并无兼容性问题。
 *    - 当 colspan/rowspan 属性值设置有误时，ie7- 会自动纠正，和 href 一样，需要传递
 *      第 2 个参数来解决。jQuery 未考虑，存在兼容性 bug.
 *    - jQuery 考虑了未显式设定 tabindex 时引发的兼容问题，kissy 里忽略（太不常用了）
 *    - jquery/attributes.js: Safari mis-reports the default selected
 *      property of an option 在 Safari 4 中已修复
 *
 *  ~ val:
 *
 */