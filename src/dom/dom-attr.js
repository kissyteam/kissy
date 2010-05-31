/**
 * @module  dom-attr
 * @author  lifesinger@gmail.com
 */
KISSY.add('dom-attr', function(S, undefined) {

    var UA = S.UA,
        ie = UA.ie,
        oldIE = ie && ie < 8,

        RE_SPECIAL_ATTRS = /href|src|style/,
        RE_NORMALIZED_ATTRS = /href|src|colspan|rowspan/,

        CUSTOM_ATTRS = {
            readonly: 'readOnly'
        };

    if(oldIE) {
        S.mix(CUSTOM_ATTRS, {
            'for': 'htmlFor',
            'class': 'className'
        });
    }

    S.mix(S.DOM, {

        /**
         * Gets or sets the attribute of the HTMLElement.
         */
        attr: function(el, name, val) {
            if(!(name = S.trim(name))) return;

            name = name.toLowerCase();
            name = CUSTOM_ATTRS[name] || name;

            // get attribute
            if (val === undefined) {
                // supports css selector/Node/NodeList
                el = S.get(el);

                // only get attributes on element nodes
                if (!el || el.nodeType !== 1) {
                    return undefined;
                }

                var ret;

                // 优先用 el[name] 获取 mapping 属性值：
                //  - 可以正确获取 readonly, checked, selected 等特殊 mapping 属性值
                //  - 可以获取用 getAttribute 不一定能获取到的值，比如 tabindex 默认值
                //  - href, src 直接获取的是 normalized 后的值，排除掉
                //  - style 需要用 getAttribute 来获取字符串值，也排除掉
                if(!RE_SPECIAL_ATTRS.test(name)) {
                    ret = el[name];
                }
                
                // 用 getAttribute 获取非 mapping 属性和 href/src/style 的值：
                if(ret === undefined) {
                    ret = el.getAttribute(name);
                }

                // fix ie bugs
                if (oldIE) {
                    // 不光是 href, src, 还有 rowspan 等非 mapping 属性，也需要用第 2 个参数来获取原始值
                    if(RE_NORMALIZED_ATTRS.test(name)) {
                        ret = el.getAttribute(name, 2);
                    }
                    // 在标准浏览器下，用 getAttribute 获取 style 值
                    // IE7- 下，需要用 cssText 来获取
                    else if(name === 'style') {
                        ret = el.style.cssText;
                    }
                }

                // 对于不存在的属性，统一返回 undefined
                return ret === null ? undefined : ret;
            }

            // set attribute
            S.each(S.query(el), function(elem) {
                // only set attributes on element nodes
                if (!elem || elem.nodeType !== 1) {
                    return;
                }

                if (oldIE && name === 'style') {
                    elem.style.cssText = val;
                }
                else {
                    // convert the value to a string (all browsers do this but IE)
                    elem.setAttribute(name, '' + val);
                }
            });
        },

        /**
         * Removes the attribute of the HTMLElement.
         */
        removeAttr: function(el, name) {
            S.each(S.query(el), function(elem) {
                if (elem && elem.nodeType === 1) {
                    elem.removeAttribute(name);
                }
            });
        }
    });
});

/**
 * NOTES:
 *
 * 2010.03
 *  - 在 jquery/support.js 中，special attrs 里还有 maxlength, cellspacing,
 *    rowspan, colspan, useap, frameboder, 但测试发现，在 Grade-A 级浏览器中
 *    并无兼容性问题。
 *  - 当 colspan/rowspan 属性值设置有误时，ie7- 会自动纠正，和 href 一样，需要传递
 *    第 2 个参数来解决。jQuery 未考虑，存在兼容性 bug.
 *  - jQuery 考虑了未显式设定 tabindex 时引发的兼容问题，kissy 里忽略（太不常用了）
 *  - jquery/attributes.js: Safari mis-reports the default selected
 *    property of an option 在 Safari 4 中已修复
 *
 */
