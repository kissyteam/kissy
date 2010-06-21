/**
 * @module  dom
 * @author  lifesinger@gmail.com
 */
KISSY.add('dom-style', function(S, undefined) {

    var DOM = S.DOM,
        doc = document, docElem = doc.documentElement,
        STYLE = 'style', FLOAT = 'float',
        CSS_FLOAT = 'cssFloat', STYLE_FLOAT = 'styleFloat',
        RE_NEED_UNIT = /width|height|top|left|right|bottom|margin|padding/i,
        RE_DASH = /-([a-z])/ig,
        CAMELCASE_FN = function(all, letter) {
            return letter.toUpperCase();
        },
        EMPTY = '',
        DEFAULT_UNIT = 'px',
        CUSTOM_STYLES = { };

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
            name = CUSTOM_STYLES[name] || name;
            if(name.indexOf('-') > 0) {
                // webkit 认识 camel-case, 其它内核只认识 cameCase
                name = name.replace(RE_DASH, CAMELCASE_FN);
            }

            // getter
            if (val === undefined) {
                // supports css selector/Node/NodeList
                var elem = S.get(selector), ret = '';

                if (elem && elem.style) {
                    ret = name.get ? name.get(elem) : elem.style[name];

                    // 有 get 的直接用自定义函数的返回值
                    if(ret === '' && !name.get) {
                        ret = DOM._getComputedStyle(elem, name);
                    }
                }

                return ret === undefined ? '' : ret;
            }
            // setter
            else {
                // suports hash
                if(S.isPlainObject(val)) {
                    for(var v in val) {
                        DOM.css(selector, name, v);
                    }
                    return;
                }

                // normalize unsetting
                if (val === null || val === EMPTY) {
                    val = EMPTY;
                }
                // number values may need a unit
                else if (S.isNumber(new Number(val)) && RE_NEED_UNIT.test(name)) {
                    val += DEFAULT_UNIT;
                }

                // ignore negative width and height values
                if ((name === 'width' || name === 'height') && parseFloat(val) < 0) {
                    name.set = function(){};
                }

                S.each(S.query(selector), function(elem) {
                    if (elem && elem.style) {
                        name.set ? name.set(elem, val) : (elem.style[name] = val);
                    }
                });
            }
        },

        /**
         * Creates a stylesheet from a text blob of rules.
         * These rules will be wrapped in a STYLE tag and appended to the HEAD of the document.
         * @param {String} cssText The text containing the css rules
         * @param {String} id An id to add to the stylesheet for later removal
         */
        addStyleSheet: function(cssText, id) {
            var head = doc.getElementsByTagName('head')[0],
                elem = doc.createElement('style');

            id && (elem.id = id);
            head.appendChild(elem); // 先添加到 DOM 树中，否则在 cssText 里的 hack 会失效

            elem.styleSheet.cssText = cssText;
        }
    });

    // normalize reserved word float alternatives ("cssFloat" or "styleFloat")
    if (docElem[STYLE][CSS_FLOAT] !== undefined) {
        CUSTOM_STYLES[FLOAT] = CSS_FLOAT;
    }
    else if(docElem[STYLE][STYLE_FLOAT] !== undefined) {
        CUSTOM_STYLES[FLOAT] = STYLE_FLOAT;
    }
});

/**
 * NOTES:
 *  - Opera 下，color 默认返回 #XXYYZZ, 非 rgb(). 目前 jQuery 等类库均忽略此差异，KISSY 也忽略。
 *  - Safari 低版本，transparent 会返回为 rgba(0, 0, 0, 0), 考虑低版本才有此 bug, 亦忽略。
 *  - opacity 未设置时，默认返回 1. jQuery 防卫过当？可能是 fix 某个低版本浏览器的 bug.
 *  - Firefox 下，jQuery 的 css paddingLeft 和 padding-left, 返回的值不同，应该统一，更符合预期。
 */
