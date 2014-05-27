/**
 * @ignore
 * dom/style
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 */
KISSY.add(function (S, require) {
    var RE_DASH = /-([a-z])/ig;

    function upperCase() {
        return arguments[1].toUpperCase();
    }

    function camelCase(name){
        return name.replace(RE_DASH, upperCase);
    }

    // return prefixed css prefix name
    function getCssVendorInfo(name) {
        if (name.indexOf('-') !== -1) {
            name = name.replace(RE_DASH, upperCase);
        }
        if (name in vendorInfos) {
            return vendorInfos[name];
        }
        // if already prefixed or need not to prefix
        if (!documentElementStyle || name in documentElementStyle) {
            vendorInfos[name] = {
                propertyName: name,
                propertyNamePrefix: ''
            };
        } else {
            var upperFirstName = name.charAt(0).toUpperCase() + name.slice(1),
                vendorName;

            for (var i = 0; i < propertyPrefixesLength; i++) {
                var propertyNamePrefix = propertyPrefixes[i];
                vendorName = propertyNamePrefix + upperFirstName;
                if (vendorName in documentElementStyle) {
                    vendorInfos[name] = {
                        propertyName: vendorName,
                        propertyNamePrefix: propertyNamePrefix
                    };
                }
            }

            vendorInfos[name] = vendorInfos[name] || null;
        }
        return  vendorInfos[name];
    }

    var util = S;
    var logger = S.getLogger('s/dom');
    var Dom = require('./api');
    var globalWindow = S.Env.host,
        vendorInfos = {},
        propertyPrefixes = [
            'Webkit',
            'Moz',
            'O',
            // ms is special .... !
            'ms'
        ],
        propertyPrefixesLength = propertyPrefixes.length,
        doc = globalWindow.document || {},
        documentElement = doc && doc.documentElement,
        documentElementStyle = documentElement.style,
        UA = require('ua'),
        BOX_MODELS = ['margin', 'border', 'padding'],
        CONTENT_INDEX = -1,
        PADDING_INDEX = 2,
        BORDER_INDEX = 1,
        MARGIN_INDEX = 0,
        getNodeName = Dom.nodeName,
        RE_MARGIN = /^margin/,
        WIDTH = 'width',
        HEIGHT = 'height',
        DISPLAY = 'display',
        OLD_DISPLAY = DISPLAY + util.now(),
        NONE = 'none',
        cssNumber = {
            fillOpacity: 1,
            fontWeight: 1,
            lineHeight: 1,
            opacity: 1,
            orphans: 1,
            widows: 1,
            zIndex: 1,
            zoom: 1
        },
        EMPTY = '',
        DEFAULT_UNIT = 'px',
        NO_PX_REG = /\d(?!px)[a-z%]+$/i,
        cssHooks = {},
        cssProps = {},
        defaultDisplay = {},
        userSelectVendorInfo = getCssVendorInfo('userSelect'),
        userSelectProperty = userSelectVendorInfo && userSelectVendorInfo.propertyName;

    cssProps['float'] = 'cssFloat';

    function normalizeCssPropName(name) {
        if (cssProps[name]) {
            return cssProps[name];
        }
        var vendor = getCssVendorInfo(name);
        return vendor && vendor.propertyName || name;
    }

    function getDefaultDisplay(tagName) {
        var body,
            oldDisplay = defaultDisplay[ tagName ],
            elem;
        if (!defaultDisplay[ tagName ]) {
            body = doc.body || doc.documentElement;
            elem = doc.createElement(tagName);
            // note: do not change default tag display!
            Dom.prepend(elem, body);
            oldDisplay = Dom.css(elem, 'display');
            body.removeChild(elem);
            // Store the correct default display
            defaultDisplay[ tagName ] = oldDisplay;
        }
        return oldDisplay;
    }

    util.mix(Dom,
        /**
         * @override KISSY.DOM
         * @class
         * @singleton
         */
        {
            _cssHooks: cssHooks,

            _cssProps: cssProps,

            _getComputedStyle: function (elem, name, computedStyle) {
                var val = '',
                    width,
                    minWidth,
                    maxWidth,
                    style,
                    d = elem.ownerDocument;

                name = normalizeCssPropName(name);

                // https://github.com/kissyteam/kissy/issues/61
                if ((computedStyle = (computedStyle || d.defaultView.getComputedStyle(elem, null)))) {
                    val = computedStyle.getPropertyValue(name) || computedStyle[name];
                }

                // 还没有加入到 document，就取行内
                if (val === '' && !Dom.contains(d, elem)) {
                    val = elem.style[name];
                }

                // Safari 5.1 returns percentage for margin
                if (Dom._RE_NUM_NO_PX.test(val) && RE_MARGIN.test(name)) {
                    style = elem.style;
                    width = style.width;
                    minWidth = style.minWidth;
                    maxWidth = style.maxWidth;

                    style.minWidth = style.maxWidth = style.width = val;
                    val = computedStyle.width;

                    style.width = width;
                    style.minWidth = minWidth;
                    style.maxWidth = maxWidth;
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
             *  @return {undefined|String}
             */
            style: function (selector, name, val) {
                var els = Dom.query(selector),
                    k,
                    ret,
                    elem = els[0], i;
                // supports hash
                if (util.isPlainObject(name)) {
                    for (k in name) {
                        for (i = els.length - 1; i >= 0; i--) {
                            style(els[i], k, name[k]);
                        }
                    }
                    return undefined;
                }
                if (val === undefined) {
                    ret = '';
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
             * @param {HTMLElement[]|String|HTMLElement} selector 选择器或节点或节点数组
             * @param {String|Object} name A CSS property. or A map of property-value pairs to set.
             * @param [val] A value to set for the property.
             * @return {undefined|String}
             */
            css: function (selector, name, val) {
                var els = Dom.query(selector),
                    elem = els[0],
                    k,
                    hook,
                    ret,
                    i;
                // supports hash
                if (util.isPlainObject(name)) {
                    for (k in name) {
                        for (i = els.length - 1; i >= 0; i--) {
                            style(els[i], k, name[k]);
                        }
                    }
                    return undefined;
                }

                name = camelCase(name);
                hook = cssHooks[name];
                // getter
                if (val === undefined) {
                    // supports css selector/Node/NodeList
                    ret = '';
                    if (elem) {
                        // If a hook was provided get the computed value from there
                        if (!(hook && 'get' in hook &&
                            (ret = hook.get(elem, true)) !== undefined)) {

                            ret = Dom._getComputedStyle(elem, name);
                        }
                    }
                    return (typeof ret === 'undefined') ? '' : ret;
                } else {
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
            show: function (selector) {
                var els = Dom.query(selector),
                    tagName,
                    old,
                    elem, i;
                for (i = els.length - 1; i >= 0; i--) {
                    elem = els[i];
                    elem.style[DISPLAY] = Dom.data(elem, OLD_DISPLAY) || EMPTY;
                    // 可能元素还处于隐藏状态，比如 css 里设置了 display: none
                    if (Dom.css(elem, DISPLAY) === NONE) {
                        tagName = elem.tagName.toLowerCase();
                        old = getDefaultDisplay(tagName);
                        Dom.data(elem, OLD_DISPLAY, old);
                        elem.style[DISPLAY] = old;
                    }
                }
            },

            /**
             * Hide the matched elements.
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements.
             */
            hide: function (selector) {
                var els = Dom.query(selector),
                    elem, i;
                for (i = els.length - 1; i >= 0; i--) {
                    elem = els[i];
                    var style = elem.style,
                        old = style[DISPLAY];
                    if (old !== NONE) {
                        if (old) {
                            Dom.data(elem, OLD_DISPLAY, old);
                        }
                        style[DISPLAY] = NONE;
                    }
                }
            },

            /**
             * Display or hide the matched elements.
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements.
             */
            toggle: function (selector) {
                var els = Dom.query(selector),
                    elem, i;
                for (i = els.length - 1; i >= 0; i--) {
                    elem = els[i];
                    if (Dom.css(elem, DISPLAY) === NONE) {
                        Dom.show(elem);
                    } else {
                        Dom.hide(elem);
                    }
                }
            },

            /**
             * Creates a stylesheet from a text blob of rules.
             * These rules will be wrapped in a style tag and appended to the HEAD of the document.
             * if cssText does not contain css hacks, u can just use Dom.create('<style>xx</style>')
             * @param {Window} [refWin=window] Window which will accept this stylesheet
             * @param {String} [cssText] The text containing the css rules
             * @param {String} [id] An id to add to the stylesheet for later removal
             */
            addStyleSheet: function (refWin, cssText, id) {
                if (typeof refWin === 'string') {
                    id = cssText;
                    cssText = /**@type String
                     @ignore*/refWin;
                    refWin = globalWindow;
                }

                var doc = Dom.getDocument(refWin),
                    elem;

                if (id && (id = id.replace('#', EMPTY))) {
                    elem = Dom.get('#' + id, doc);
                }

                // 仅添加一次，不重复添加
                if (elem) {
                    return;
                }

                elem = Dom.create('<style>', {id: id}, doc);

                // 先添加到 Dom 树中，再给 cssText 赋值，否则 css hack 会失效
                Dom.get('head', doc).appendChild(elem);

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
            unselectable: !userSelectProperty ? function (selector) {
                var _els = Dom.query(selector),
                    elem,
                    j,
                    e,
                    i = 0,
                    excludes,
                    style,
                    els;
                for (j = _els.length - 1; j >= 0; j--) {
                    elem = _els[j];
                    style = elem.style;
                    els = elem.getElementsByTagName('*');
                    elem.setAttribute('unselectable', 'on');
                    excludes = ['iframe', 'textarea', 'input', 'select'];
                    while ((e = els[i++])) {
                        if (!util.inArray(getNodeName(e), excludes)) {
                            e.setAttribute('unselectable', 'on');
                        }
                    }
                }
            } : function (selector) {
                var els = Dom.query(selector);
                for (var j = els.length - 1; j >= 0; j--) {
                    els[j].style[userSelectProperty] = 'none';
                }
            },

            /**
             * Get the current computed width for the first element in the set of matched elements, including padding but not border.
             * @method
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @return {Number}
             */
            innerWidth: 0,
            /**
             * Get the current computed height for the first element in the set of matched elements, including padding but not border.
             * @method
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @return {Number}
             */
            innerHeight: 0,
            /**
             *  Get the current computed width for the first element in the set of matched elements, including padding and border, and optionally margin.
             * @method
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {Boolean} [includeMargin] A Boolean indicating whether to include the element's margin in the calculation.
             * @return {Number}
             */
            outerWidth: 0,
            /**
             * Get the current computed height for the first element in the set of matched elements, including padding, border, and optionally margin.
             * @method
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {Boolean} [includeMargin] A Boolean indicating whether to include the element's margin in the calculation.
             * @return {Number}
             */
            outerHeight: 0,
            /**
             * Get the current computed width for the first element in the set of matched elements.
             * or
             * Set the CSS width of each element in the set of matched elements.
             * @method
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {String|Number} [value]
             * An integer representing the number of pixels, or an integer along with an optional unit of measure appended (as a string).
             * @return {Number|undefined}
             */
            width: 0,
            /**
             * Get the current computed height for the first element in the set of matched elements.
             * or
             * Set the CSS height of each element in the set of matched elements.
             * @method
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {String|Number} [value]
             * An integer representing the number of pixels, or an integer along with an optional unit of measure appended (as a string).
             * @return {Number|undefined}
             */
            height: 0
        });

    util.each([WIDTH, HEIGHT], function (name) {
        Dom['inner' + util.ucfirst(name)] = function (selector) {
            var el = Dom.get(selector);
            return el && getWHIgnoreDisplay(el, name, PADDING_INDEX);
        };

        Dom['outer' + util.ucfirst(name)] = function (selector, includeMargin) {
            var el = Dom.get(selector);
            return el && getWHIgnoreDisplay(el, name, includeMargin ? MARGIN_INDEX : BORDER_INDEX);
        };
        var which = name === WIDTH ? ['Left', 'Right'] : ['Top', 'Bottom'];

        Dom[name] = function (selector, val) {
            var elem = Dom.get(selector);
            if (val !== undefined) {
                if (elem) {
                    var computedStyle = getComputedStyle(elem);
                    var isBorderBox = isBorderBoxFn(elem, computedStyle);
                    if (isBorderBox) {
                        val += getPBMWidth(elem, ['padding', 'border'], which, computedStyle);
                    }
                    return Dom.css(elem, name, val);
                }
                return undefined;
            }
            return elem && getWHIgnoreDisplay(elem, name, CONTENT_INDEX);
        };

        /**
         * @ignore
         */
        cssHooks[ name ] = {
            /**
             * @ignore
             */
            get: function (elem, computed) {
                var val;
                if (computed) {
                    val = getWHIgnoreDisplay(elem, name) + 'px';
                }
                return val;
            }
        };
    });

    var cssShow = {position: 'absolute', visibility: 'hidden', display: 'block'};

    util.each(['left', 'top'], function (name) {
        cssHooks[ name ] = {
            get: function (el, computed) {
                var val,
                    isAutoPosition,
                    position;
                if (computed) {
                    position = Dom.css(el, 'position');
                    if (position === 'static') {
                        return 'auto';
                    }
                    val = Dom._getComputedStyle(el, name);
                    isAutoPosition = val === 'auto';
                    if (isAutoPosition && position === 'relative') {
                        return '0px';
                    }
                    // https://github.com/kissyteam/kissy/issues/493
                    if (isAutoPosition || NO_PX_REG.test(val)) {
                        val = getPosition(el)[name] + 'px';
                    }
                }
                return val;
            }
        };
    });

    function swap(elem, options, callback) {
        var old = {},
            style = elem.style,
            name;

        // Remember the old values, and insert the new ones
        for (name in options) {
            old[ name ] = style[ name ];
            style[ name ] = options[ name ];
        }

        callback.call(elem);

        // Revert the old values
        for (name in options) {
            style[ name ] = old[ name ];
        }
    }

    function style(elem, name, val) {
        var elStyle,
            ret,
            hook;
        if (elem.nodeType === 3 ||
            elem.nodeType === 8 || !(elStyle = elem.style)) {
            return undefined;
        }
        name = camelCase(name);
        hook = cssHooks[name];
        name = normalizeCssPropName(name);
        // setter
        if (val !== undefined) {
            // normalize unset
            if (val === null || val === EMPTY) {
                val = EMPTY;
            } else if (!isNaN(Number(val)) && !cssNumber[name]) {
                // number values may need a unit
                val += DEFAULT_UNIT;
            }
            if (hook && hook.set) {
                val = hook.set(elem, val);
            }
            if (val !== undefined) {
                // ie 无效值报错
                try {
                    // EMPTY will unset style!
                    elStyle[name] = val;
                } catch (e) {
                    logger.warn('css set error:' + e);
                }
                // #80 fix,font-family
                if (val === EMPTY && elStyle.removeAttribute) {
                    elStyle.removeAttribute(name);
                }
            }
            if (!elStyle.cssText) {
                // weird for chrome, safari is ok?
                // https://github.com/kissyteam/kissy/issues/231
                if (UA.webkit) {
                    elStyle = elem.outerHTML;
                }
                elem.removeAttribute('style');
            }
            return undefined;
        } else {
            // If a hook was provided get the non-computed value from there
            if (!(hook && 'get' in hook &&
                (ret = hook.get(elem, false)) !== undefined)) {
                // Otherwise just get the value from the style object
                ret = elStyle[ name ];
            }
            return ret === undefined ? '' : ret;
        }
    }

    // fix #119 : https://github.com/kissyteam/kissy/issues/119
    function getWHIgnoreDisplay(elem) {
        var val, args = arguments;
        // in case elem is window
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

    function getPBMWidth(elem, props, which, computedStyle) {
        var value = 0, prop, j, i;
        for (j = 0; j < props.length; j++) {
            prop = props[j];
            if (prop) {
                for (i = 0; i < which.length; i++) {
                    var cssProp;
                    if (prop === 'border') {
                        cssProp = prop + which[i] + 'Width';
                    } else {
                        cssProp = prop + which[i];
                    }
                    value += parseFloat(Dom._getComputedStyle(elem, cssProp, computedStyle)) || 0;
                }
            }
        }
        return value;
    }

    function isBorderBoxFn(elem, computedStyle) {
        return Dom._getComputedStyle(elem, 'boxSizing', computedStyle) === 'border-box';
    }

    function getComputedStyle(elem) {
        var doc = elem.ownerDocument,
            computedStyle;
        if (doc.defaultView) {
            // cache style
            computedStyle = doc.defaultView.getComputedStyle(elem, null);
        }
        return computedStyle;
    }

    /*
     得到元素的大小信息
     @param elem
     @param name
     @param {String} [extra]  'padding' : (css width) + padding
     'border' : (css width) + padding + border
     'margin' : (css width) + padding + border + margin
     */
    function getWH(elem, name, extra) {
        if (util.isWindow(elem)) {
            return name === WIDTH ? Dom.viewportWidth(elem) : Dom.viewportHeight(elem);
        } else if (elem.nodeType === 9) {
            return name === WIDTH ? Dom.docWidth(elem) : Dom.docHeight(elem);
        }
        var which = name === WIDTH ? ['Left', 'Right'] : ['Top', 'Bottom'],
            borderBoxValue = name === WIDTH ? elem.offsetWidth : elem.offsetHeight;
        var computedStyle = getComputedStyle(elem);
        var isBorderBox = isBorderBoxFn(elem, computedStyle);
        var cssBoxValue = 0;
        if (borderBoxValue == null || borderBoxValue <= 0) {
            borderBoxValue = undefined;
            // Fall back to computed then un computed css if necessary
            cssBoxValue = Dom._getComputedStyle(elem, name, computedStyle);
            if (cssBoxValue == null || (Number(cssBoxValue)) < 0) {
                cssBoxValue = elem.style[ name ] || 0;
            }
            // Normalize '', auto, and prepare for extra
            cssBoxValue = parseFloat(cssBoxValue) || 0;
        }
        if (extra === undefined) {
            extra = isBorderBox ? BORDER_INDEX : CONTENT_INDEX;
        }
        var borderBoxValueOrIsBorderBox = borderBoxValue !== undefined || isBorderBox;
        var val = borderBoxValue || cssBoxValue;
        if (extra === CONTENT_INDEX) {
            if (borderBoxValueOrIsBorderBox) {
                return val - getPBMWidth(elem, ['border', 'padding'],
                    which, computedStyle);
            } else {
                return cssBoxValue;
            }
        } else if (borderBoxValueOrIsBorderBox) {
            return val + (extra === BORDER_INDEX ? 0 :
                (extra === PADDING_INDEX ?
                    -getPBMWidth(elem, ['border'], which, computedStyle) :
                    getPBMWidth(elem, ['margin'], which, computedStyle)));
        } else {
            return cssBoxValue + getPBMWidth(elem, BOX_MODELS.slice(extra),
                which, computedStyle);
        }
    }

    var ROOT_REG = /^(?:body|html)$/i;

    function getPosition(el) {
        var offsetParent,
            offset,
            parentOffset = {top: 0, left: 0};

        if (Dom.css(el, 'position') === 'fixed') {
            offset = el.getBoundingClientRect();
        } else {
            // if offsetParent is body and body has margin
            // then all browsers are different
            // make sure set html,body {margin:0;padding:0;border:0;}
            offsetParent = getOffsetParent(el);
            offset = Dom.offset(el);
            parentOffset = Dom.offset(offsetParent);
            parentOffset.top += parseFloat(Dom.css(offsetParent, 'borderTopWidth')) || 0;
            parentOffset.left += parseFloat(Dom.css(offsetParent, 'borderLeftWidth')) || 0;
        }

        offset.top -= parseFloat(Dom.css(el, 'marginTop')) || 0;
        offset.left -= parseFloat(Dom.css(el, 'marginLeft')) || 0;

        // known bug: if el is relative && offsetParent is document.body, left %
        // should - document.body.paddingLeft
        return {
            top: offset.top - parentOffset.top,
            left: offset.left - parentOffset.left
        };
    }

    function getOffsetParent(el) {
        var offsetParent = el.offsetParent || (el.ownerDocument || doc).body;
        while (offsetParent && !ROOT_REG.test(offsetParent.nodeName) &&
            Dom.css(offsetParent, 'position') === 'static') {
            offsetParent = offsetParent.offsetParent;
        }
        return offsetParent;
    }

    return Dom;
});

/*
 2011-12-21
 - backgroundPositionX, backgroundPositionY firefox/w3c 不支持
 - w3c 为准，这里不 fix 了

 2011-08-19
 - 调整结构，减少耦合
 - fix css('height') === auto
 */
