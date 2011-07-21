/**
 combined files : 

D:\code\kissy_git\kissy\src\ua\base.js
D:\code\kissy_git\kissy\src\ua\extra.js
D:\code\kissy_git\kissy\src\ua.js
D:\code\kissy_git\kissy\src\dom\base.js
D:\code\kissy_git\kissy\src\dom\attr.js
D:\code\kissy_git\kissy\src\dom\class.js
D:\code\kissy_git\kissy\src\dom\create.js
D:\code\kissy_git\kissy\src\dom\data.js
D:\code\kissy_git\kissy\src\dom\insertion.js
D:\code\kissy_git\kissy\src\dom\offset.js
D:\code\kissy_git\kissy\src\dom\style.js
D:\code\kissy_git\kissy\src\dom\selector.js
D:\code\kissy_git\kissy\src\dom\style-ie.js
D:\code\kissy_git\kissy\src\dom\traversal.js
D:\code\kissy_git\kissy\src\dom.js
D:\code\kissy_git\kissy\src\event\object.js
D:\code\kissy_git\kissy\src\event\base.js
D:\code\kissy_git\kissy\src\event\target.js
D:\code\kissy_git\kissy\src\event\focusin.js
D:\code\kissy_git\kissy\src\event\hashchange.js
D:\code\kissy_git\kissy\src\event\valuechange.js
D:\code\kissy_git\kissy\src\event\delegate.js
D:\code\kissy_git\kissy\src\event\mouseenter.js
D:\code\kissy_git\kissy\src\event.js
D:\code\kissy_git\kissy\src\node\base.js
D:\code\kissy_git\kissy\src\node\attach.js
D:\code\kissy_git\kissy\src\node\override.js
D:\code\kissy_git\kissy\src\anim\easing.js
D:\code\kissy_git\kissy\src\anim\manager.js
D:\code\kissy_git\kissy\src\anim\base.js
D:\code\kissy_git\kissy\src\anim\color.js
D:\code\kissy_git\kissy\src\anim\scroll.js
D:\code\kissy_git\kissy\src\anim.js
D:\code\kissy_git\kissy\src\node\anim-plugin.js
D:\code\kissy_git\kissy\src\node.js
D:\code\kissy_git\kissy\src\json\json2.js
D:\code\kissy_git\kissy\src\json.js
D:\code\kissy_git\kissy\src\ajax\xhrobject.js
D:\code\kissy_git\kissy\src\ajax\base.js
D:\code\kissy_git\kissy\src\ajax\xhr.js
D:\code\kissy_git\kissy\src\ajax\script.js
D:\code\kissy_git\kissy\src\ajax\jsonp.js
D:\code\kissy_git\kissy\src\ajax\form-serializer.js
D:\code\kissy_git\kissy\src\ajax\form.js
D:\code\kissy_git\kissy\src\ajax\iframe-upload.js
D:\code\kissy_git\kissy\src\ajax.js
D:\code\kissy_git\kissy\src\base\attribute.js
D:\code\kissy_git\kissy\src\base\base.js
D:\code\kissy_git\kissy\src\base.js
D:\code\kissy_git\kissy\src\cookie\base.js
D:\code\kissy_git\kissy\src\cookie.js
D:\code\kissy_git\kissy\src\core.js
**/

/**
 * @module  ua
 * @author  lifesinger@gmail.com
 */
KISSY.add('ua/base', function() {

    var ua = navigator.userAgent,
        EMPTY = '', MOBILE = 'mobile',
        core = EMPTY, shell = EMPTY, m,
        o = {
            // browser core type
            //webkit: 0,
            //trident: 0,
            //gecko: 0,
            //presto: 0,

            // browser type
            //chrome: 0,
            //safari: 0,
            //firefox:  0,
            //ie: 0,
            //opera: 0

            //mobile: '',
            //core: '',
            //shell: ''
        },
        numberify = function(s) {
            var c = 0;
            // convert '1.2.3.4' to 1.234
            return parseFloat(s.replace(/\./g, function() {
                return (c++ === 0) ? '.' : '';
            }));
        };

    // WebKit
    if ((m = ua.match(/AppleWebKit\/([\d.]*)/)) && m[1]) {
        o[core = 'webkit'] = numberify(m[1]);

        // Chrome
        if ((m = ua.match(/Chrome\/([\d.]*)/)) && m[1]) {
            o[shell = 'chrome'] = numberify(m[1]);
        }
        // Safari
        else if ((m = ua.match(/\/([\d.]*) Safari/)) && m[1]) {
            o[shell = 'safari'] = numberify(m[1]);
        }

        // Apple Mobile
        if (/ Mobile\//.test(ua)) {
            o[MOBILE] = 'apple'; // iPad, iPhone or iPod Touch
        }
        // Other WebKit Mobile Browsers
        else if ((m = ua.match(/NokiaN[^\/]*|Android \d\.\d|webOS\/\d\.\d/))) {
            o[MOBILE] = m[0].toLowerCase(); // Nokia N-series, Android, webOS, ex: NokiaN95
        }
    }
    // NOT WebKit
    else {
        // Presto
        // ref: http://www.useragentstring.com/pages/useragentstring.php
        if ((m = ua.match(/Presto\/([\d.]*)/)) && m[1]) {
            o[core = 'presto'] = numberify(m[1]);
            
            // Opera
            if ((m = ua.match(/Opera\/([\d.]*)/)) && m[1]) {
                o[shell = 'opera'] = numberify(m[1]); // Opera detected, look for revision

                if ((m = ua.match(/Opera\/.* Version\/([\d.]*)/)) && m[1]) {
                    o[shell] = numberify(m[1]);
                }

                // Opera Mini
                if ((m = ua.match(/Opera Mini[^;]*/)) && m) {
                    o[MOBILE] = m[0].toLowerCase(); // ex: Opera Mini/2.0.4509/1316
                }
                // Opera Mobile
                // ex: Opera/9.80 (Windows NT 6.1; Opera Mobi/49; U; en) Presto/2.4.18 Version/10.00
                // issue: 由于 Opera Mobile 有 Version/ 字段，可能会与 Opera 混淆，同时对于 Opera Mobile 的版本号也比较混乱
                else if ((m = ua.match(/Opera Mobi[^;]*/)) && m){
                    o[MOBILE] = m[0];
                }
            }
            
        // NOT WebKit or Presto
        } else {
            // MSIE
            if ((m = ua.match(/MSIE\s([^;]*)/)) && m[1]) {
                o[core = 'trident'] = 0.1; // Trident detected, look for revision
                // 注意：
                //  o.shell = ie, 表示外壳是 ie
                //  但 o.ie = 7, 并不代表外壳是 ie7, 还有可能是 ie8 的兼容模式
                //  对于 ie8 的兼容模式，还要通过 documentMode 去判断。但此处不能让 o.ie = 8, 否则
                //  很多脚本判断会失误。因为 ie8 的兼容模式表现行为和 ie7 相同，而不是和 ie8 相同
                o[shell = 'ie'] = numberify(m[1]);

                // Get the Trident's accurate version
                if ((m = ua.match(/Trident\/([\d.]*)/)) && m[1]) {
                    o[core] = numberify(m[1]);
                }

            // NOT WebKit, Presto or IE
            } else {
                // Gecko
                if ((m = ua.match(/Gecko/))) {
                    o[core = 'gecko'] = 0.1; // Gecko detected, look for revision
                    if ((m = ua.match(/rv:([\d.]*)/)) && m[1]) {
                        o[core] = numberify(m[1]);
                    }

                    // Firefox
                    if ((m = ua.match(/Firefox\/([\d.]*)/)) && m[1]) {
                        o[shell = 'firefox'] = numberify(m[1]);
                    }
                }
            }
        }
    }

    o.core = core;
    o.shell = shell;
    o._numberify = numberify;
    return o;
});

/**
 * NOTES:
 *
 * 2010.03
 *  - jQuery, YUI 等类库都推荐用特性探测替代浏览器嗅探。特性探测的好处是能自动适应未来设备和未知设备，比如
 *    if(document.addEventListener) 假设 IE9 支持标准事件，则代码不用修改，就自适应了“未来浏览器”。
 *    对于未知浏览器也是如此。但是，这并不意味着浏览器嗅探就得彻底抛弃。当代码很明确就是针对已知特定浏览器的，
 *    同时并非是某个特性探测可以解决时，用浏览器嗅探反而能带来代码的简洁，同时也也不会有什么后患。总之，一切
 *    皆权衡。
 *  - UA.ie && UA.ie < 8 并不意味着浏览器就不是 IE8, 有可能是 IE8 的兼容模式。进一步的判断需要使用 documentMode.
 *
 * TODO:
 *  - test mobile
 *  - 3Q 大战后，360 去掉了 UA 信息中的 360 信息，需采用 res 方法去判断
 *
 */

/**
 * @module  ua-extra
 * @author  gonghao<gonghao@ghsky.com>
 */
KISSY.add('ua/extra', function(S, UA) {
    var ua = navigator.userAgent,
        m, external, shell,
        o = { },
        numberify = UA._numberify;

    /**
     * 说明：
     * @子涯总结的各国产浏览器的判断依据: http://spreadsheets0.google.com/ccc?key=tluod2VGe60_ceDrAaMrfMw&hl=zh_CN#gid=0
     * 根据 CNZZ 2009 年度浏览器占用率报告，优化了判断顺序：http://www.tanmi360.com/post/230.htm
     * 如果检测出浏览器，但是具体版本号未知用 0.1 作为标识
     * 世界之窗 & 360 浏览器，在 3.x 以下的版本都无法通过 UA 或者特性检测进行判断，所以目前只要检测到 UA 关键字就认为起版本号为 3
     */

    // 360Browser
    if (m = ua.match(/360SE/)) {
        o[shell = 'se360'] = 3; // issue: 360Browser 2.x cannot be recognised, so if recognised default set verstion number to 3
    }
    // Maxthon
    else if ((m = ua.match(/Maxthon/)) && (external = window.external)) {
        // issue: Maxthon 3.x in IE-Core cannot be recognised and it doesn't have exact version number
        // but other maxthon versions all have exact version number
        shell = 'maxthon';
        try {
            o[shell] = numberify(external['max_version']);
        } catch(ex) {
            o[shell] = 0.1;
        }
    }
    // TT
    else if (m = ua.match(/TencentTraveler\s([\d.]*)/)) {
        o[shell = 'tt'] = m[1] ? numberify(m[1]) : 0.1;
    }
    // TheWorld
    else if (m = ua.match(/TheWorld/)) {
        o[shell = 'theworld'] = 3; // issue: TheWorld 2.x cannot be recognised, so if recognised default set verstion number to 3
    }
    // Sougou
    else if (m = ua.match(/SE\s([\d.]*)/)) {
        o[shell = 'sougou'] = m[1] ? numberify(m[1]) : 0.1;
    }

    // If the browser has shell(no matter IE-core or Webkit-core or others), set the shell key
    shell && (o.shell = shell);

    S.mix(UA, o);
    return UA;
}, {
    requires:["ua/base"]
});

KISSY.add("ua", function(S,UA) {
    return UA;
}, {
    requires:["ua/extra"]
});

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
                // 节点上关联键值也可以
                key = elem[EXPANDO] = S.guid();
            }
            var cache = dataCache[key];
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
        // note : 普通对象不要定义 nodeType 这种特殊属性!
        return elem && elem.nodeType;
    }

    return DOM;

}, {
    requires:["./base"]
});
/**
 * 承玉：2011-05-31
 *  - 分层 ，节点和普通对象分开粗合理
 **/

/**
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

/**
 * @module  EventObject
 * @author  lifesinger@gmail.com
 */
KISSY.add('event/object', function(S, undefined) {

    var doc = document,
        props = ('altKey attrChange attrName bubbles button cancelable ' +
            'charCode clientX clientY ctrlKey currentTarget data detail ' +
            'eventPhase fromElement handler keyCode layerX layerY metaKey ' +
            'newValue offsetX offsetY originalTarget pageX pageY prevValue ' +
            'relatedNode relatedTarget screenX screenY shiftKey srcElement ' +
            'target toElement view wheelDelta which').split(' ');

    /**
     * KISSY's event system normalizes the event object according to
     * W3C standards. The event object is guaranteed to be passed to
     * the event handler. Most properties from the original event are
     * copied over and normalized to the new event object.
     */
    function EventObject(currentTarget, domEvent, type) {
        var self = this;
        self.currentTarget = currentTarget;
        self.originalEvent = domEvent || { };

        if (domEvent) { // html element
            self.type = domEvent.type;
            self._fix();
        }
        else { // custom
            self.type = type;
            self.target = currentTarget;
        }

        // bug fix: in _fix() method, ie maybe reset currentTarget to undefined.
        self.currentTarget = currentTarget;
        self.fixed = true;
    }

    S.augment(EventObject, {

        _fix: function() {
            var self = this,
                originalEvent = self.originalEvent,
                l = props.length, prop,
                ct = self.currentTarget,
                ownerDoc = (ct.nodeType === 9) ? ct : (ct.ownerDocument || doc); // support iframe

            // clone properties of the original event object
            while (l) {
                prop = props[--l];
                self[prop] = originalEvent[prop];
            }

            // fix target property, if necessary
            if (!self.target) {
                self.target = self.srcElement || doc; // srcElement might not be defined either
            }

            // check if target is a textnode (safari)
            if (self.target.nodeType === 3) {
                self.target = self.target.parentNode;
            }

            // add relatedTarget, if necessary
            if (!self.relatedTarget && self.fromElement) {
                self.relatedTarget = (self.fromElement === self.target) ? self.toElement : self.fromElement;
            }

            // calculate pageX/Y if missing and clientX/Y available
            if (self.pageX === undefined && self.clientX !== undefined) {
                var docEl = ownerDoc.documentElement, bd = ownerDoc.body;
                self.pageX = self.clientX + (docEl && docEl.scrollLeft || bd && bd.scrollLeft || 0) - (docEl && docEl.clientLeft || bd && bd.clientLeft || 0);
                self.pageY = self.clientY + (docEl && docEl.scrollTop || bd && bd.scrollTop || 0) - (docEl && docEl.clientTop || bd && bd.clientTop || 0);
            }

            // add which for key events
            if (self.which === undefined) {
                self.which = (self.charCode !== undefined) ? self.charCode : self.keyCode;
            }

            // add metaKey to non-Mac browsers (use ctrl for PC's and Meta for Macs)
            if (self.metaKey === undefined) {
                self.metaKey = self.ctrlKey;
            }

            // add which for click: 1 === left; 2 === middle; 3 === right
            // Note: button is not normalized, so don't use it
            if (!self.which && self.button !== undefined) {
                self.which = (self.button & 1 ? 1 : (self.button & 2 ? 3 : ( self.button & 4 ? 2 : 0)));
            }
        },

        /**
         * Prevents the event's default behavior
         */
        preventDefault: function() {
            var e = this.originalEvent;

            // if preventDefault exists run it on the original event
            if (e.preventDefault) {
                e.preventDefault();
            }
            // otherwise set the returnValue property of the original event to false (IE)
            else {
                e.returnValue = false;
            }

            this.isDefaultPrevented = true;
        },

        /**
         * Stops the propagation to the next bubble target
         */
        stopPropagation: function() {
            var e = this.originalEvent;

            // if stopPropagation exists run it on the original event
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            // otherwise set the cancelBubble property of the original event to true (IE)
            else {
                e.cancelBubble = true;
            }

            this.isPropagationStopped = true;
        },



        /**
         * Stops the propagation to the next bubble target and
         * prevents any additional listeners from being exectued
         * on the current target.
         */
        stopImmediatePropagation: function() {
            var e = this.originalEvent;

            if (e.stopImmediatePropagation) {
                e.stopImmediatePropagation();
            } else {
                this.stopPropagation();
            }

            this.isImmediatePropagationStopped = true;
        },

        /**
         * Stops the event propagation and prevents the default
         * event behavior.
         * @param immediate {boolean} if true additional listeners
         * on the current target will not be executed
         */
        halt: function(immediate) {
            if (immediate) {
                this.stopImmediatePropagation();
            } else {
                this.stopPropagation();
            }

            this.preventDefault();
        }
    });

    return EventObject;

});

/**
 * NOTES:
 *
 *  2010.04
 *   - http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
 *
 * TODO:
 *   - pageX, clientX, scrollLeft, clientLeft 的详细测试
 */

/**
 * @module  event
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add('event/base', function(S, DOM, EventObject, undefined) {

    var doc = document,
        simpleAdd = doc.addEventListener ?
            function(el, type, fn, capture) {
                if (el.addEventListener) {
                    el.addEventListener(type, fn, !!capture);
                }
            } :
            function(el, type, fn) {
                if (el.attachEvent) {
                    el.attachEvent('on' + type, fn);
                }
            },
        simpleRemove = doc.removeEventListener ?
            function(el, type, fn, capture) {
                if (el.removeEventListener) {
                    el.removeEventListener(type, fn, !!capture);
                }
            } :
            function(el, type, fn) {
                if (el.detachEvent) {
                    el.detachEvent('on' + type, fn);
                }
            },
        SPACE = " ",
        // 记录手工 fire(domElement,type) 时的 type
        // 再在浏览器通知的系统 eventHandler 中检查
        // 如果相同，那么证明已经 fire 过了，不要再次触发了
        Event_Triggered = "",
        TRIGGERED_NONE = "trigger-none-" + S.now(),
        // 事件存储位置 key
        // { handler: eventHandler, events:  {type:[{scope:scope,fn:fn}]}  } }
        EVENT_GUID = 'ksEventTargetId' + S.now();

    var Event = {
        _data:function(elem) {
            var args = S.makeArray(arguments);
            args.splice(1, 0, EVENT_GUID);
            return DOM.data.apply(DOM, args);
        },
        _removeData:function(elem) {
            var args = S.makeArray(arguments);
            args.splice(1, 0, EVENT_GUID);
            return DOM.removeData.apply(DOM, args);
        },

        // such as: { 'mouseenter' : { setup:fn ,tearDown:fn} }
        special: { },

        /**
         * Adds an event listener.
         * @param targets KISSY selector
         * @param type {String} The type of event to append.
         * @param fn {Function} The event handler.
         * @param scope {Object} (optional) The scope (this reference) in which the handler function is executed.
         */
            // data : 附加在回调后面的数据，delegate 检查使用
            // remove 时 data 相等(指向同一对象或者定义了 equals 比较函数)
        add: function(targets, type, fn, scope /* optional */, data/*internal usage*/) {
            if (batchForType('add', targets, type, fn, scope, data)) {
                return targets;
            }

            DOM.query(targets).each(function(target) {
                var isNativeEventTarget = !target.isCustomEventTarget,
                    eventDesc;

                // 不是有效的 target 或 参数不对
                if (!target ||
                    !type ||
                    !S.isFunction(fn) ||
                    (isNativeEventTarget && !isValidTarget(target))) {
                    return;
                }
                // 获取事件描述
                eventDesc = Event._data(target);
                if (!eventDesc) {
                    Event._data(target, eventDesc = {});
                }
                //事件 listeners
                var events = eventDesc.events = eventDesc.events || {},
                    handlers = events[type] = events[type] || [],
                    handleObj = {fn: fn, scope: scope || target,data:data},
                    eventHandler = eventDesc.handler;
                // 该元素没有 handler ，并且该元素是 dom 节点时才需要注册 dom 事件
                if (!eventHandler) {
                    eventHandler = eventDesc.handler = function(event, data) {
                        // 是经过 fire 手动调用而导致的，就不要再次触发了，已经在 fire 中 bubble 过一次了
                        if (event && event.type == Event_Triggered) {
                            return;
                        }
                        var target = eventHandler.target;
                        if (!event || !event.fixed) {
                            event = new EventObject(target, event);
                        }
                        if (S.isPlainObject(data)) {
                            S.mix(event, data);
                        }
                        return Event._handle(target, event);
                    };
                    eventHandler.target = target;
                }
                if (isNativeEventTarget) {
                    addDomEvent(target, type, eventHandler, handlers, handleObj);
                    //nullify to prevent memory leak in ie ?
                    target = null;
                }
                // 增加 listener
                handlers.push(handleObj);
            });
            return targets;
        },

        __getListeners:function(target, type) {
            var events = Event.__getEvents(target) || {};
            return events[type] || [];
        },

        __getEvents:function(target) {
            // 获取事件描述
            var eventDesc = Event._data(target);
            return eventDesc && eventDesc.events;
        },

        /**
         * Detach an event or set of events from an element.
         */
        remove: function(targets, type /* optional */, fn /* optional */, scope /* optional */, data/*internal usage*/) {
            if (batchForType('remove', targets, type, fn, scope)) {
                return targets;
            }

            DOM.query(targets).each(function(target) {
                var eventDesc = Event._data(target),
                    events = eventDesc && eventDesc.events,
                    listeners,
                    len,
                    i,
                    j,
                    t,
                    isNativeEventTarget = !target.isCustomEventTarget,
                    special = (isNativeEventTarget && Event.special[type]) || { };
                if (!target ||
                    (!isNativeEventTarget && !isValidTarget(target)) ||
                    !events) {
                    return;
                }
                // remove all types of event
                if (type === undefined) {
                    for (type in events) {
                        Event.remove.call(Event, target, type);
                    }
                    return;
                }

                scope = scope || target;

                if ((listeners = events[type])) {
                    len = listeners.length;
                    // 移除 fn
                    if (fn && len) {
                        for (i = 0,j = 0,t = []; i < len; ++i) {
                            var reserve = false,listener = listeners[i];
                            if (fn !== listener.fn
                                || scope !== listener.scope) {
                                t[j++] = listener;
                                reserve = true;
                            } else if (data !== data2) {
                                var data2 = listener.data;
                                // undelgate 不能 remove 普通 on 的 handler
                                // remove 不能 remove delegate 的 handler
                                if (!data && data2
                                    || data2 && !data
                                    ) {
                                    t[j++] = listener;
                                    reserve = true;
                                } else if (data && data2) {
                                    if (!data.equals || !data2.equals) {
                                        S.error("no equals in data");
                                    } else if (!data2.equals(data)) {
                                        t[j++] = listener;
                                        reserve = true;
                                    }
                                }
                            }
                            if (!reserve && special.remove) {
                                special.remove.call(target, listener);
                            }
                        }
                        events[type] = t;
                        len = t.length;
                    }

                    // remove(el, type) or fn 已移除光
                    if (fn === undefined || len === 0) {
                        // dom node need to detach handler from dom node
                        if (isNativeEventTarget &&
                            (!special['tearDown'] ||
                                special['tearDown'].call(target) === false)) {
                            simpleRemove(target, type, eventDesc.handler);
                        }
                        // remove target's single event description
                        delete events[type];
                    }
                }

                // remove target's  all events description
                if (S.isEmptyObject(events)) {
                    eventDesc.handler.target = null;
                    delete eventDesc.handler;
                    delete eventDesc.events;
                    Event._removeData(target);
                }
            });
            return targets;
        },

        _handle: function(target, event) {
            /* As some listeners may remove themselves from the
             event, the original array length is dynamic. So,
             let's make a copy of all listeners, so we are
             sure we'll call all of them.*/
            var listeners = Event.__getListeners(target, event.type).slice(0),
                ret,
                gRet,
                i = 0,
                len = listeners.length,
                listener;

            for (; i < len; ++i) {
                listener = listeners[i];
                ret = listener.fn.call(listener.scope, event, listener.data);
                // 和 jQuery 逻辑保持一致

                if (ret !== undefined) {

                    // 有一个 false，最终结果就是 false
                    // 否则等于最后一个返回值
                    if (gRet !== false) {
                        gRet = ret;
                    }

                    // return false 等价 preventDefault + stopProgation
                    if (ret === false) {
                        event.halt();
                    }
                }
                if (event.isImmediatePropagationStopped) {
                    break;
                }
            }

            return gRet;
        },

        /**
         * fire event , simulate bubble in browser
         */
        fire:function(targets, eventType, eventData, onlyHandlers) {
            if (batchForType("fire", targets, eventType, eventData)) {
                return;
            }

            var ret;

            DOM.query(targets).each(function(target) {
                var isNativeEventTarget = !target.isCustomEventTarget;
                // 自定义事件很简单，不需要冒泡，不需要默认事件处理
                eventData = eventData || {};
                eventData.type = eventType;
                if (!isNativeEventTarget) {
                    var eventDesc = Event._data(target);
                    if (eventDesc && S.isFunction(eventDesc.handler)) {
                        ret = eventDesc.handler(undefined, eventData);
                    }
                } else {
                    var r = fireDOMEvent(target, eventType, eventData, onlyHandlers);
                    if (r !== undefined) {
                        ret = r;
                    }
                }
            });
            return ret;
        },
        _batchForType:batchForType,
        _simpleAdd: simpleAdd,
        _simpleRemove: simpleRemove
    };

    // shorthand
    Event.on = Event.add;
    Event.detach = Event.remove;

    function batchForType(methodName, targets, types) {
        // on(target, 'click focus', fn)
        if ((types = S.trim(types)) && types.indexOf(SPACE) > 0) {
            var args = S.makeArray(arguments);
            S.each(types.split(SPACE), function(type) {
                var args2 = S.clone(args);
                args2.splice(0, 3, targets, type);
                Event[methodName].apply(Event, args2);
            });
            return true;
        }
        return undefined;
    }

    function isValidTarget(target) {
        // 3 - is text node
        // 8 - is comment node
        return target && target.nodeType !== 3 && target.nodeType !== 8;
    }

    /**
     * dom node need eventHandler attached to dom node
     */
    function addDomEvent(target, type, eventHandler, handlers, handleObj) {
        var special = Event.special[type] || {};
        // 第一次注册该事件，dom 节点才需要注册 dom 事件
        if (!handlers.length && (!special.setup || special.setup.call(target) === false)) {
            simpleAdd(target, type, eventHandler)
        }
        if (special.add) {
            special.add.call(target, handleObj);
        }
    }


    /**
     * fire dom event from bottom to up
     */
    function fireDOMEvent(target, eventType, eventData, onlyHandlers) {
        var ret;
        if (!isValidTarget(target)) {
            return ret;
        }
        var event = new EventObject(target);
        S.mix(event, eventData);
        // 只运行自己的绑定函数，不冒泡也不触发默认行为
        if (onlyHandlers) {
            event.stopPropagation();
            event.preventDefault();
        }
        event.target = target;
        var cur = target,
            ontype = "on" + eventType;
        //bubble up dom tree
        do{
            var handler = (Event._data(cur) || {}).handler;
            event.currentTarget = cur;
            if (handler) {
                handler.call(cur, event);
            }
            // Trigger an inline bound script
            if (cur[ ontype ] && cur[ ontype ].call(cur) === false) {
                ret = false;
                event.preventDefault();
            }
            // Bubble up to document, then to window
            cur = cur.parentNode ||
                cur.ownerDocument ||
                cur === target.ownerDocument && window;
        } while (cur && !event.isPropagationStopped);

        if (!event.isDefaultPrevented) {
            if (!(eventType === "click" && target.nodeName.toLowerCase() == "a")) {
                var old;
                try {
                    if (ontype && target[ eventType ]) {
                        // Don't re-trigger an onFOO event when we call its FOO() method
                        old = target[ ontype ];

                        if (old) {
                            target[ ontype ] = null;
                        }
                        // 记录当前 trigger 触发
                        Event_Triggered = eventType;
                        // 只触发默认事件，而不要执行绑定的用户回调
                        // 同步触发
                        target[ eventType ]();
                    }
                } catch (ieError) {
                }

                if (old) {
                    target[ ontype ] = old;
                }

                Event_Triggered = TRIGGERED_NONE;
            }
        }
        return ret;
    }

    if (1 > 2) {
        Event._simpleAdd()._simpleRemove();
    }

    return Event;
}, {
    requires:["dom","event/object"]
});

/**
 * 承玉：2011-06-07
 *  - eventHandler 一个元素一个而不是一个元素一个事件一个，节省内存
 *  - 减少闭包使用，prevent ie 内存泄露？
 *  - 增加 fire ，模拟冒泡处理 dom 事件
 *  - TODO: 自定义事件和 dom 事件操作彻底分离?
 *
 */

/**
 * @module  EventTarget
 * @author  lifesinger@gmail.com , yiminghe@gmail.com
 */
KISSY.add('event/target', function(S, Event, DOM, undefined) {

    /**
     * EventTarget provides the implementation for any object to publish,
     * subscribe and fire to custom events.
     */
    return {

        isCustomEventTarget: true,

        fire: function(type, eventData) {
            // no chain ,need data returned
            return Event.fire(this, type, eventData);
        },

        on: function(type, fn, scope) {
            Event.add(this, type, fn, scope);
            return this; // chain
        },

        detach: function(type, fn, scope) {
            Event.remove(this, type, fn, scope);
            return this; // chain
        }
    };
}, {
        /*
         实际上只需要 dom/data ，但是不要跨模块引用另一模块的子模块，
         否则会导致build打包文件 dom 和 dom-data 重复载入
         */
        requires:["./base","dom"]
    });

/**
 * NOTES:
 *
 *  2010.04
 *   - 初始设想 api: publish, fire, on, detach. 实际实现时发现，publish 不是必须
 *     的，on 时能自动 publish. api 简化为：触发/订阅/反订阅
 *
 *   - detach 命名是因为 removeEventListener 太长，remove 则太容易冲突
 */

/**
 * @module  event-focusin
 * @author  yiminghe@gmail.com
 */
KISSY.add('event/focusin', function(S, UA, Event) {

    // 让非 IE 浏览器支持 focusin/focusout
    if (!UA.ie) {
        S.each([
            { name: 'focusin', fix: 'focus' },
            { name: 'focusout', fix: 'blur' }
        ], function(o) {
            var attaches = 0;
            Event.special[o.name] = {
                // 统一在 document 上 capture focus/blur 事件，然后模拟冒泡 fire 出来
                // 达到和 focusin 一样的效果 focusin -> focus
                // refer: http://yiminghe.iteye.com/blog/813255
                setup: function() {
                    if (attaches++ === 0) {
                        document.addEventListener(o.fix, handler, true);
                    }
                },

                tearDown:function() {
                    if (--attaches === 0) {
                        document.removeEventListener(o.fix, handler, true);
                    }
                }
            };

            function handler(event) {
                var target = event.target;
                return Event.fire(target, o.name);
            }

        });
    }
    return Event;
}, {
    requires:["ua","./base"]
});

/**
 * 承玉:2011-06-07
 * - refactor to jquery , 更加合理的模拟冒泡顺序，子元素先出触发，父元素后触发
 *
 * NOTES:
 *  - webkit 和 opera 已支持 DOMFocusIn/DOMFocusOut 事件，但上面的写法已经能达到预期效果，暂时不考虑原生支持。
 */

/**
 * @module  event-hashchange
 * @author  yiminghe@gmail.com , xiaomacji@gmail.com
 */
KISSY.add('event/hashchange', function(S, Event, DOM, UA) {

    var ie = docMode || UA['ie'],
        HASH_CHANGE = 'hashchange';

    // IE8以上切换浏览器模式到IE7，会导致 'onhashchange' in window === true
    // 1. 不支持 hashchange 事件，支持 hash 导航(opera??)：定时器监控
    // 2. 不支持 hashchange 事件，不支持 hash 导航(ie67) : iframe + 定时器
    if ((!( 'on' + HASH_CHANGE in window)) || ie < 8) {

        var POLL_INTERVAL = 50,
            doc = document,
            win = window,
            docMode = doc['documentMode'],
            getHash = function() {
                // ie 返回 "" ，其他返回 "#"
                // return location.hash ?
                var url = location.href;
                return '#' + url.replace(/^[^#]*#?(.*)$/, '$1');
            },
            timer,

            lastHash = getHash(),

            poll = function () {
                var hash = getHash();
                if (hash !== lastHash) {
                    hashChange(hash);
                    lastHash = hash;
                }
                timer = setTimeout(poll, POLL_INTERVAL);
            },

            hashChange = ie < 8 ? function(hash) {
                //debugger
                var html = '<html><body>' + hash + '</body></html>',
                    doc = iframe.contentWindow.document;
                try {
                    // 写入历史 hash
                    doc.open();
                    doc.write(html);
                    doc.close();
                    return true;
                } catch (e) {
                    return false;
                }
            } : function (hash) {
                notifyHashChange(hash);
            },

            notifyHashChange = function (hash) {
                S.log("hash changed : " + hash);
                Event.fire(win, HASH_CHANGE);
            },
            setup = function () {
                if (!timer) {
                    poll();
                }
            },
            tearDown = function () {
                timer && clearTimeout(timer);
                timer = null;
            },
            iframe;

        // ie6, 7, 覆盖一些function
        if (ie < 8) {

            /**
             * 前进后退 : start -> notifyHashChange
             * 直接输入 : poll -> hashChange -> start
             * iframe 内容和 url 同步
             */
            setup = function() {
                if (!iframe) {
                    //http://www.paciellogroup.com/blog/?p=604
                    iframe = DOM.create('<iframe ' +
                        //'src="#" ' +
                        'style="display: none" ' +
                        'height="0" ' +
                        'width="0" ' +
                        'tabindex="-1" ' +
                        'title="empty"/>');
                    // Append the iframe to the documentElement rather than the body.
                    // Keeping it outside the body prevents scrolling on the initial
                    // page load
                    DOM.prepend(iframe, document.documentElement);

                    // init，第一次触发，以后都是 start
                    Event.add(iframe, "load", function() {
                        Event.remove(iframe, "load");
                        // Update the iframe with the initial location hash, if any. This
                        // will create an initial history entry that the user can return to
                        // after the state has changed.
                        hashChange(getHash());
                        Event.add(iframe, "load", start);
                        poll();
                    });

                    /**
                     * 前进后退 ： start -> 触发
                     * 直接输入 : timer -> hashChange -> start -> 触发
                     * 触发统一在 start(load)
                     * iframe 内容和 url 同步
                     */
                        //后退触发点
                        //或addHistory 调用
                        //只有 start 来通知应用程序
                    function start() {
                        // S.log('iframe start load..');
                        //debugger
                        var c = S.trim(iframe.contentWindow.document.body.innerHTML);
                        var ch = getHash();

                        //后退时不等
                        //改变location则相等
                        if (c != ch) {
                            location.hash = c;
                            // 使lasthash为iframe历史， 不然重新写iframe， 会导致最新状态（丢失前进状态）
                            lastHash = c;
                        }
                        notifyHashChange(c);
                    }
                }
            };

            tearDown = function() {
                timer && clearTimeout(timer);
                timer = null;
                Event.detach(iframe);
                DOM.remove(iframe);
                iframe = null;
            };
        }

        Event.special[HASH_CHANGE] = {
            setup: function() {
                if (this !== win) {
                    return;
                }
                // 不用注册 dom 事件
                setup();
            },
            tearDown: function() {
                if (this !== win) {
                    return;
                }
                tearDown();
            }
        };
    }
}, {
    requires:["./base","dom","ua"]
});

/**
 * v1 : 2010-12-29
 * v1.1: 支持非IE，但不支持onhashchange事件的浏览器(例如低版本的firefox、safari)
 * refer : http://yiminghe.javaeye.com/blog/377867
 *         https://github.com/cowboy/jquery-hashchange
 */

/**
 * inspired by yui3 :
 *
 * Synthetic event that fires when the <code>value</code> property of an input
 * field or textarea changes as a result of a keystroke, mouse operation, or
 * input method editor (IME) input event.
 *
 * Unlike the <code>onchange</code> event, this event fires when the value
 * actually changes and not when the element loses focus. This event also
 * reports IME and multi-stroke input more reliably than <code>oninput</code> or
 * the various key events across browsers.
 *
 * @author yiminghe@gmail.com
 */
KISSY.add('event/valuechange', function(S, Event, DOM) {
    var VALUE_CHANGE = "valuechange",
        KEY = "event/valuechange",
        HISTORY_KEY = KEY + "/history",
        POLL_KEY = KEY + "/poll",
        interval = 50;

    function stopPoll(target) {
        DOM.removeData(target, HISTORY_KEY);
        if (DOM.hasData(target, POLL_KEY)) {
            var poll = DOM.data(target, POLL_KEY);
            clearTimeout(poll);
            DOM.removeData(target, POLL_KEY);
        }
    }

    function stopPollHandler(ev) {
        var target = ev.target;
        stopPoll(target);
    }

    function startPoll(target) {
        if (DOM.hasData(target, POLL_KEY)) return;
        DOM.data(target, POLL_KEY, setTimeout(function() {
            var v = target.value,h = DOM.data(target, HISTORY_KEY);
            if (v !== h) {
                // 只触发自己绑定的 handler
                Event.fire(target, VALUE_CHANGE, {
                    prevVal:h,
                    newVal:v
                }, true);
                DOM.data(target, HISTORY_KEY, v);
            }
            DOM.data(target, POLL_KEY, setTimeout(arguments.callee, interval));
        }, interval));
    }

    function startPollHandler(ev) {
        var target = ev.target;
        // when focus ,record its current value immediately
        if (ev.type == "focus") {
            DOM.data(target, HISTORY_KEY, target.value);
        }
        startPoll(target);
    }

    function monitor(target) {
        unmonitored(target);
        Event.on(target, "blur", stopPollHandler);
        Event.on(target, "mousedown keyup keydown focus", startPollHandler);
    }

    function unmonitored(target) {
        stopPoll(target);
        Event.remove(target, "blur", stopPollHandler);
        Event.remove(target, "mousedown keyup keydown focus", startPollHandler);
    }

    Event.special[VALUE_CHANGE] = {
        setup: function() {
            var target = this,
                nodeName = target.nodeName.toLowerCase();
            if ("input" == nodeName
                || "textarea" == nodeName) {
                monitor(target);
            }
        },
        tearDown: function() {
            var target = this;
            unmonitored(target);
        }
    };
    return Event;
}, {
    requires:["./base","dom"]
});

/**
 * kissy delegate for event module
 * @author yiminghe@gmail.com
 */
KISSY.add("event/delegate", function(S, DOM, Event) {
    var batchForType = Event._batchForType,
        delegateMap = {
            focus:"focusin",
            blur:"focusout"
        };

    S.mix(Event, {
            delegate:function(targets, type, selector, fn, scope) {
                if (batchForType('delegate', targets, type, selector, fn, scope)) {
                    return targets;
                }
                DOM.query(targets).each(function(target) {
                    // 自定义事件 delegate 无意义
                    if (target.isCustomEventTarget) {
                        return;
                    }
                    type = delegateMap[type] || type;
                    Event.on(target, type, delegateHandler, target, {
                            fn:fn,
                            selector:selector,
                            // type:type,
                            scope:scope,
                            equals:equals
                        });
                });
                return targets;
            },

            undelegate:function(targets, type, selector, fn, scope) {
                if (batchForType('undelegate', targets, type, selector, fn, scope)) {
                    return targets;
                }
                DOM.query(targets).each(function(target) {
                    // 自定义事件 delegate 无意义
                    if (target.isCustomEventTarget) {
                        return;
                    }
                    type = delegateMap[type] || type;
                    Event.remove(target, type, delegateHandler, target, {
                            fn:fn,
                            selector:selector,
                            // type:type,
                            scope:scope,
                            equals:equals
                        });
                });
                return targets;
            }
        });

    // 比较函数，两个 delegate 描述对象比较
    function equals(d) {
        if (d.fn === undefined && d.selector === undefined) {
            return true;
        } else if (d.fn === undefined) {
            return this.selector == d.selector;
        } else {
            return this.fn == d.fn && this.selector == d.selector && this.scope == d.scope;
        }
    }

    function eq(d1, d2) {
        return (d1 == d2 || (!d1 && d2) || (!d1 && d2));
    }

    // 根据 selector ，从事件源得到对应节点
    function delegateHandler(event, data) {
        var delegateTarget = this,
            gret,
            target = event.target,
            invokeds = DOM.closest(target, [data.selector], delegateTarget);
        // 找到了符合 selector 的元素，可能并不是事件源
        if (invokeds) {
            for (var i = 0; i < invokeds.length; i++) {
                event.currentTarget = invokeds[i];
                var ret = data.fn.call(data.scope || delegateTarget, event);
                if (ret === false ||
                    event.isPropagationStopped ||
                    event.isImmediatePropagationStopped) {
                    if (ret === false) {
                        gret = ret;
                    }
                    if (event.isPropagationStopped ||
                        event.isImmediatePropagationStopped) {
                        break;
                    }
                }
            }
        }
        return gret;
    }

    return Event;
}, {
        requires:["dom","./base"]
    });

/**
 * focusin/out 的特殊之处 , delegate 只能在容器上注册 focusin/out ，
 * 1.其实非 ie 都是注册 focus capture=true，然后注册到 focusin 对应 handlers
 *   1.1 当 Event.fire("focus")，没有 focus 对应的 handlers 数组，然后调用元素 focus 方法，
 *   focusin.js 调用 Event.fire("focusin") 进而执行 focusin 对应的 handlers 数组
 *   1.2 当调用 Event.fire("focusin")，直接执行 focusin 对应的 handlers 数组，但不会真正聚焦
 *
 * 2.ie 直接注册 focusin , focusin handlers 也有对应用户回调
 *   2.1 当 Event.fire("focus") , 同 1.1
 *   2.2 当 Event.fire("focusin"),直接执行 focusin 对应的 handlers 数组，但不会真正聚焦
 *
 * TODO:
 * mouseenter/leave delegate??
 *
 **/

/**
 * @module  event-mouseenter
 * @author  lifesinger@gmail.com , yiminghe@gmail.com
 */
KISSY.add('event/mouseenter', function(S, Event, DOM, UA) {

    if (!UA['ie']) {
        S.each([
            { name: 'mouseenter', fix: 'mouseover' },
            { name: 'mouseleave', fix: 'mouseout' }
        ], function(o) {


            // 元素内触发的 mouseover/out 不能算 mouseenter/leave
            function withinElement(event) {

                var self = this,
                    parent = event.relatedTarget;

                // 设置用户实际注册的事件名，触发该事件所对应的 listener 数组
                event.type = o.name;

                // Firefox sometimes assigns relatedTarget a XUL element
                // which we cannot access the parentNode property of
                try {

                    // Chrome does something similar, the parentNode property
                    // can be accessed but is null.
                    if (parent && parent !== document && !parent.parentNode) {
                        return;
                    }

                    // Traverse up the tree
                    parent = DOM.closest(parent, function(item) {
                        return item == self;
                    });

                    if (parent !== self) {
                        // handle event if we actually just moused on to a non sub-element
                        Event._handle(self, event);
                    }

                    // assuming we've left the element since we most likely mousedover a xul element
                } catch(e) {
                    S.log("withinElement :" + e);
                }
            }


            Event.special[o.name] = {

                // 第一次 mouseenter 时注册下
                // 以后都直接放到 listener 数组里， 由 mouseover 读取触发
                setup: function() {
                    Event.add(this, o.fix, withinElement);
                },

                //当 listener 数组为空时，也清掉 mouseover 注册，不再读取
                tearDown:function() {
                    Event.remove(this, o.fix, withinElement);
                }
            }
        });
    }

    return Event;
}, {
        requires:["./base","dom","ua"]
    });

/**
 * 承玉：2011-06-07
 * - 根据新结构，调整 mouseenter 兼容处理
 * - fire('mouseenter') 可以的，直接执行 mouseenter 的 handlers 用户回调数组
 *
 *
 * TODO:
 *  - ie6 下，原生的 mouseenter/leave 貌似也有 bug, 比如 <div><div /><div /><div /></div>
 *    jQuery 也异常，需要进一步研究
 */

KISSY.add("event", function(S, Event, Target,Object) {
    Event.Target = Target;
    Event.Object=Object;
    return Event;
}, {
    requires:[
        "event/base",
        "event/target",
        "event/object",
        "event/focusin",
        "event/hashchange",
        "event/valuechange",
        "event/delegate",
        "event/mouseenter"]
});

/**
 * definition for node and nodelist
 * @author lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add("node/base", function(S, DOM, undefined) {

    var AP = Array.prototype;

    var isNodeList = DOM._isNodeList;

    /**
     * The NodeList class provides a wrapper for manipulating DOM Node.
     */
    function NodeList(html, props, ownerDocument) {
        var self = this,domNode;

        if (!(self instanceof NodeList)) {
            return new NodeList(html, props, ownerDocument);
        }

        // handle NodeList(''), NodeList(null), or NodeList(undefined)
        if (!html) {
            return undefined;
        }


        else if (S.isString(html)) {
            // create from html
            domNode = DOM.create(html, props, ownerDocument);
            // ('<p>1</p><p>2</p>') 转换为 NodeList
            if (domNode.nodeType === 11) { // fragment
                AP.push.apply(this, S.makeArray(domNode.childNodes));
                return undefined;
            }
        }

        else if (S.isArray(html) || isNodeList(html)) {
            AP.push.apply(this, S.makeArray(html));
            return undefined;
        }


        else {
            // node, document, window
            domNode = html;
        }


        self[0] = domNode;
        self.length = 1;
        return undefined;
    }

    S.augment(NodeList, {

            /**
             * 默认长度为 0
             */
            length: 0,


            item: function(index) {
                if (S.isNumber(index)) {
                    if (index >= this.length) return null;
                    return new NodeList(this[index], undefined, undefined);
                } else
                    return new NodeList(index, undefined, undefined);
            },

            add:function(selector, context, index) {
                if (S.isNumber(context)) {
                    index = context;
                    context = undefined;
                }
                var list = S.makeArray(NodeList.all(selector, context)),
                    ret = new NodeList(this, undefined, undefined);
                if (index === undefined) {
                    AP.push.apply(ret, list);
                } else {
                    var args = [index,0];
                    args.push.apply(args, list);
                    AP.splice.apply(ret, args);
                }
                return ret;
            },

            slice:function(start, end) {
                return new NodeList(AP.slice.call(this, start, end), undefined, undefined);
            },

            /**
             * Retrieves the DOMNodes.
             */
            getDOMNodes: function() {
                return AP.slice.call(this);
            },

            /**
             * Applies the given function to each Node in the NodeList.
             * @param fn The function to apply. It receives 3 arguments: the current node instance, the node's index, and the NodeList instance
             * @param context An optional context to apply the function with Default context is the current NodeList instance
             */
            each: function(fn, context) {
                var self = this,len = self.length, i = 0, node;

                for (node = new NodeList(self[0], undefined, undefined);
                     i < len && fn.call(context || node, node, i, this) !== false;
                     node = new NodeList(self[++i], undefined, undefined)) {
                }

                return this;
            },
            /**
             * Retrieves the DOMNode.
             */
            getDOMNode: function() {
                return this[0];
            },

            all:function(selector) {
                if (this.length > 0) {
                    return NodeList.all(selector, this[0]);
                }
                return new NodeList(undefined, undefined, undefined);
            }
        });

    NodeList.prototype.one = function(selector) {
        var all = this.all(selector);
        return all.length ? all : null;
    };

    // query api
    NodeList.all = function(selector, context) {
        // are we dealing with html string ?
        // TextNode 仍需要自己 new Node

        if (S.isString(selector)
            && (selector = S.trim(selector))
            && selector.length >= 3
            && S.startsWith(selector, "<")
            && S.endsWith(selector, ">")
            ) {
            if (context) {
                if (context.getDOMNode) {
                    context = context.getDOMNode();
                }
                if (context.ownerDocument) {
                    context = context.ownerDocument;
                }
            }
            return new NodeList(selector, undefined, context);
        }
        return new NodeList(DOM.query(selector, context), undefined, undefined);
    };

    NodeList.one = function(selector, context) {
        var all = NodeList.all(selector, context);
        return all.length ? all : null;
    };
    if (1 > 2) {
        NodeList.getDOMNodes();
    }
    return NodeList;
}, {
        requires:["dom"]
    });


/**
 * Notes:
 * 2011-05-25
 *  - 承玉：参考 jquery，只有一个 NodeList 对象，Node 就是 NodeList 的别名
 *
 *  2010.04
 *   - each 方法传给 fn 的 this, 在 jQuery 里指向原生对象，这样可以避免性能问题。
 *     但从用户角度讲，this 的第一直觉是 $(this), kissy 和 yui3 保持一致，牺牲
 *     性能，以易用为首。
 *   - 有了 each 方法，似乎不再需要 import 所有 dom 方法，意义不大。
 *   - dom 是低级 api, node 是中级 api, 这是分层的一个原因。还有一个原因是，如果
 *     直接在 node 里实现 dom 方法，则不大好将 dom 的方法耦合到 nodelist 里。可
 *     以说，技术成本会制约 api 设计。
 */

/**
 * import methods from DOM to NodeList.prototype
 * @author  yiminghe@gmail.com
 */
KISSY.add('node/attach', function(S, DOM, Event, NodeList, undefined) {

    var NLP = NodeList.prototype,
        // DOM 添加到 NP 上的方法
        // if DOM methods return undefined , Node methods need to transform result to itself
        DOM_INCLUDES_NORM = [
            "equals",
            "contains",
            "scrollTop",
            "scrollLeft",
            "height",
            "width",
            "addStyleSheet",
            // "append" will be overridden
            "appendTo",
            // "prepend" will be overridden
            "prependTo",
            "insertBefore",
            "before",
            "after",
            "insertAfter",
            "test",
            "hasClass",
            "addClass",
            "removeClass",
            "replaceClass",
            "toggleClass",
            "removeAttr",
            "hasAttr",
            "hasProp",
            // anim override
//            "show",
//            "hide",
            "toggle",
            "scrollIntoView",
            "remove",
            "removeData",
            "hasData",
            "unselectable"
        ],
        // if return array ,need transform to nodelist
        DOM_INCLUDES_NORM_NODE_LIST = [
            "filter",
            "parent",
            "closest",
            "next",
            "prev",
            "siblings",
            "children"
        ],
        // if set return this else if get return true value ,no nodelist transform
        DOM_INCLUDES_NORM_IF = {
            // dom method : set parameter index
            "attr":1,
            "text":0,
            "css":1,
            "val":0,
            "prop":1,
            "offset":0,
            "html":0,
            "data":1
        },
        // Event 添加到 NP 上的方法
        EVENT_INCLUDES = ["on","detach","fire","delegate","undelegate"];


    function accessNorm(fn, self, args) {
        args.unshift(self);
        var ret = DOM[fn].apply(DOM, args);
        if (ret === undefined)
            return self;

        return ret;
    }

    function accessNormList(fn, self, args) {
        args.unshift(self);
        var ret = DOM[fn].apply(DOM, args);
        if (ret === undefined)
            return self;
        else if (ret === null)
            return null;
        return new NodeList(ret);
    }

    function accessNormIf(fn, self, index, args) {

        // get
        if (args[index] === undefined
            // 并且第一个参数不是对象，否则可能是批量设置写
            && !S.isObject(args[0])) {
            args.unshift(self);
            return DOM[fn].apply(DOM, args);
        }
        // set
        return accessNorm(fn, self, args);
    }

    S.each(DOM_INCLUDES_NORM, function(k) {
        NLP[k] = function() {
            var args = S.makeArray(arguments);
            return accessNorm(k, this, args);
        };
    });

    S.each(DOM_INCLUDES_NORM_NODE_LIST, function(k) {
        NLP[k] = function() {
            var args = S.makeArray(arguments);
            return accessNormList(k, this, args);
        };
    });

    S.each(DOM_INCLUDES_NORM_IF, function(index, k) {
        NLP[k] = function() {
            var args = S.makeArray(arguments);
            return accessNormIf(k, this, index, args);
        };
    });

    S.each(EVENT_INCLUDES, function(k) {
        NLP[k] = function() {
            var args = S.makeArray(arguments);
            args.unshift(this);
            return Event[k].apply(Event, args);
        }
    });

}, {
    requires:["dom","event","./base"]
});

/**
 * 2011-05-24
 *  - 承玉：
 *  - 将 DOM 中的方法包装成 NodeList 方法
 *  - Node 方法调用参数中的 KISSY NodeList 要转换成第一个 HTML Node
 *  - 要注意链式调用，如果 DOM 方法返回 undefined （无返回值），则 NodeList 对应方法返回 this
 *  - 实际上可以完全使用 NodeList 来代替 DOM，不和节点关联的方法如：viewportHeight 等，在 window，document 上调用
 *  - 存在 window/document 虚节点，通过 S.one(window)/new Node(window) ,S.one(document)/new NodeList(document) 获得
 */

/**
 * overrides methods in NodeList.prototype
 * @author yiminghe@gmail.com
 */
KISSY.add("node/override", function(S, DOM, Event, NodeList) {

    /**
     * append(node ,parent) : 参数顺序反过来了
     * appendTo(parent,node) : 才是正常
     *
     */
    S.each(['append', 'prepend','before','after'], function(insertType) {

        NodeList.prototype[insertType] = function(html) {

            var newNode = html,self = this;
            // 创建
            if (S.isString(newNode)) {
                newNode = DOM.create(newNode);
            }
            DOM[insertType](newNode, self);
            return self;

        };
    });

}, {
    requires:["dom","event","./base","./attach"]
});

/**
 * 2011-05-24
 * - 承玉：
 * - 重写 NodeList 的某些方法
 * - 添加 one ,all ，从当前 NodeList 往下开始选择节点
 * - 处理 append ,prepend 和 DOM 的参数实际上是反过来的
 * - append/prepend 参数是节点时，如果当前 NodeList 数量 > 1 需要经过 clone，因为同一节点不可能被添加到多个节点中去（NodeList）
 */

/**
 * @module anim-easing
 */
KISSY.add('anim/easing', function(S) {

    // Based on Easing Equations (c) 2003 Robert Penner, all rights reserved.
    // This work is subject to the terms in http://www.robertpenner.com/easing_terms_of_use.html
    // Preview: http://www.robertpenner.com/easing/easing_demo.html

    /**
     * 和 YUI 的 Easing 相比，S.Easing 进行了归一化处理，参数调整为：
     * @param {Number} t Time value used to compute current value  保留 0 =< t <= 1
     * @param {Number} b Starting value  b = 0
     * @param {Number} c Delta between start and end values  c = 1
     * @param {Number} d Total length of animation d = 1
     */

    var M = Math, PI = M.PI,
        pow = M.pow, sin = M.sin,
        BACK_CONST = 1.70158,

        Easing = {

            /**
             * Uniform speed between points.
             */
            easeNone: function (t) {
                return t;
            },

            /**
             * Begins slowly and accelerates towards end. (quadratic)
             */
            easeIn: function (t) {
                return t * t;
            },

            /**
             * Begins quickly and decelerates towards end.  (quadratic)
             */
            easeOut: function (t) {
                return ( 2 - t) * t;
            },

            /**
             * Begins slowly and decelerates towards end. (quadratic)
             */
            easeBoth: function (t) {
                return (t *= 2) < 1 ?
                    .5 * t * t :
                    .5 * (1 - (--t) * (t - 2));
            },

            /**
             * Begins slowly and accelerates towards end. (quartic)
             */
            easeInStrong: function (t) {
                return t * t * t * t;
            },

            /**
             * Begins quickly and decelerates towards end.  (quartic)
             */
            easeOutStrong: function (t) {
                return 1 - (--t) * t * t * t;
            },

            /**
             * Begins slowly and decelerates towards end. (quartic)
             */
            easeBothStrong: function (t) {
                return (t *= 2) < 1 ?
                    .5 * t * t * t * t :
                    .5 * (2 - (t -= 2) * t * t * t);
            },

            /**
             * Snap in elastic effect.
             */

            elasticIn: function (t) {
                var p = .3, s = p / 4;
                if (t === 0 || t === 1) return t;
                return -(pow(2, 10 * (t -= 1)) * sin((t - s) * (2 * PI) / p));
            },

            /**
             * Snap out elastic effect.
             */
            elasticOut: function (t) {
                var p = .3, s = p / 4;
                if (t === 0 || t === 1) return t;
                return pow(2, -10 * t) * sin((t - s) * (2 * PI) / p) + 1;
            },

            /**
             * Snap both elastic effect.
             */
            elasticBoth: function (t) {
                var p = .45, s = p / 4;
                if (t === 0 || (t *= 2) === 2) return t;

                if (t < 1) {
                    return -.5 * (pow(2, 10 * (t -= 1)) *
                        sin((t - s) * (2 * PI) / p));
                }
                return pow(2, -10 * (t -= 1)) *
                    sin((t - s) * (2 * PI) / p) * .5 + 1;
            },

            /**
             * Backtracks slightly, then reverses direction and moves to end.
             */
            backIn: function (t) {
                if (t === 1) t -= .001;
                return t * t * ((BACK_CONST + 1) * t - BACK_CONST);
            },

            /**
             * Overshoots end, then reverses and comes back to end.
             */
            backOut: function (t) {
                return (t -= 1) * t * ((BACK_CONST + 1) * t + BACK_CONST) + 1;
            },

            /**
             * Backtracks slightly, then reverses direction, overshoots end,
             * then reverses and comes back to end.
             */
            backBoth: function (t) {
                if ((t *= 2 ) < 1) {
                    return .5 * (t * t * (((BACK_CONST *= (1.525)) + 1) * t - BACK_CONST));
                }
                return .5 * ((t -= 2) * t * (((BACK_CONST *= (1.525)) + 1) * t + BACK_CONST) + 2);
            },

            /**
             * Bounce off of start.
             */
            bounceIn: function (t) {
                return 1 - Easing.bounceOut(1 - t);
            },

            /**
             * Bounces off end.
             */
            bounceOut: function (t) {
                var s = 7.5625, r;

                if (t < (1 / 2.75)) {
                    r = s * t * t;
                }
                else if (t < (2 / 2.75)) {
                    r = s * (t -= (1.5 / 2.75)) * t + .75;
                }
                else if (t < (2.5 / 2.75)) {
                    r = s * (t -= (2.25 / 2.75)) * t + .9375;
                }
                else {
                    r = s * (t -= (2.625 / 2.75)) * t + .984375;
                }

                return r;
            },

            /**
             * Bounces off start and end.
             */
            bounceBoth: function (t) {
                if (t < .5) {
                    return Easing.bounceIn(t * 2) * .5;
                }
                return Easing.bounceOut(t * 2 - 1) * .5 + .5;
            }
        };

    Easing.NativeTimeFunction = {
        easeNone: 'linear',
        ease: 'ease',

        easeIn: 'ease-in',
        easeOut: 'ease-out',
        easeBoth: 'ease-in-out',

        // Ref:
        //  1. http://www.w3.org/TR/css3-transitions/#transition-timing-function_tag
        //  2. http://www.robertpenner.com/easing/easing_demo.html
        //  3. assets/cubic-bezier-timing-function.html
        // 注：是模拟值，非精确推导值
        easeInStrong: 'cubic-bezier(0.9, 0.0, 0.9, 0.5)',
        easeOutStrong: 'cubic-bezier(0.1, 0.5, 0.1, 1.0)',
        easeBothStrong: 'cubic-bezier(0.9, 0.0, 0.1, 1.0)'
    };

    return Easing;
});

/**
 * TODO:
 *  - test-easing.html 详细的测试 + 曲线可视化
 *
 * NOTES:
 *  - 综合比较 jQuery UI/scripty2/YUI 的 easing 命名，还是觉得 YUI 的对用户
 *    最友好。因此这次完全照搬 YUI 的 Easing, 只是代码上做了点压缩优化。
 *
 */

/**
 * single timer for the whole anim module
 * @author: yiminghe@gmail.com
 */
KISSY.add("anim/manager", function(S) {
    var tag = S.guid("anim-"),id = 1;

    function getKv(anim) {
        anim[tag] = anim[tag] || S.guid("anim-");
        return anim[tag];
    }

    return {
        interval:20,
        runnings:{},
        timer:null,
        start:function(anim) {
            var kv = getKv(anim);
            if (this.runnings[kv]) return;
            this.runnings[kv] = anim;
            this.startTimer();
        },
        stop:function(anim) {
            this.notRun(anim);
        },
        notRun:function(anim) {
            var kv = getKv(anim);
            delete this.runnings[kv];
            if (S.isEmptyObject(this.runnings)) {
                this.stopTimer();
            }
        },
        pause:function(anim) {
            this.notRun(anim);
        },
        resume:function(anim) {
            this.start(anim);
        },
        startTimer:function() {
            var self = this;
            if (!self.timer) {
                self.timer = setTimeout(function() {
                    //S.log("running : " + (id++));
                    if (!self.runFrames()) {
                        self.timer = null;
                        self.startTimer();
                    } else {
                        self.stopTimer();
                    }
                }, self.interval);
            }
        },
        stopTimer:function() {
            var t = this.timer;
            if (t) {
                clearTimeout(t);
                this.timer = null;
                //S.log("timer stop");
            }
        },
        runFrames:function() {
            var done = true,runnings = this.runnings;
            for (var r in runnings) {
                if (runnings.hasOwnProperty(r)) {
                    done = false;
                    runnings[r]._runFrame();
                }
            }
            return done;
        }
    };
});

/**
 * @module   anim
 * @author   lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add('anim/base', function(S, DOM, Event, Easing, UA, AM, undefined) {

    var EventTarget,
        PROPS,
        CUSTOM_ATTRS,
        OPACITY,NONE,
        PROPERTY,EVENT_START,
        EVENT_STEP,
        EVENT_COMPLETE,
        defaultConfig,
        TRANSITION_NAME;

    EventTarget = Event.Target;

    //支持的有效的 css 分属性，数字则动画，否则直接设最终结果
    PROPS = (

        'borderBottomWidth ' +
            'borderBottomStyle ' +

            'borderLeftWidth ' +
            'borderLeftStyle ' +
            // 同 font
            //'borderColor ' +

            'borderRightWidth ' +
            'borderRightStyle ' +
            'borderSpacing ' +

            'borderTopWidth ' +
            'borderTopStyle ' +
            'bottom ' +

            // shorthand 属性去掉，取分解属性
            //'font ' +
            'fontFamily ' +
            'fontSize ' +
            'fontWeight ' +
            'height ' +
            'left ' +
            'letterSpacing ' +
            'lineHeight ' +
            'marginBottom ' +
            'marginLeft ' +
            'marginRight ' +
            'marginTop ' +
            'maxHeight ' +
            'maxWidth ' +
            'minHeight ' +
            'minWidth ' +
            'opacity ' +

            'outlineOffset ' +
            'outlineWidth ' +
            'paddingBottom ' +
            'paddingLeft ' +
            'paddingRight ' +
            'paddingTop ' +
            'right ' +
            'textIndent ' +
            'top ' +
            'width ' +
            'wordSpacing ' +
            'zIndex').split(' ');

    //支持的元素属性
    CUSTOM_ATTRS = [];

    OPACITY = 'opacity';
    NONE = 'none';
    PROPERTY = 'Property';
    EVENT_START = 'start';
    EVENT_STEP = 'step';
    EVENT_COMPLETE = 'complete';
    defaultConfig = {
        duration: 1,
        easing: 'easeNone',
        nativeSupport: true // 优先使用原生 css3 transition
    };

    /**
     * Anim Class
     * @constructor
     */
    function Anim(elem, props, duration, easing, callback, nativeSupport) {



        // ignore non-exist element
        if (!(elem = DOM.get(elem))) return;

        // factory or constructor
        if (!(this instanceof Anim)) {
            return new Anim(elem, props, duration, easing, callback, nativeSupport);
        }

        var self = this,
            isConfig = S.isPlainObject(duration),
            style = props,
            config;

        /**
         * the related dom element
         */
        self.domEl = elem;

        /**
         * the transition properties
         * 可以是 "width: 200px; color: #ccc" 字符串形式
         * 也可以是 { width: '200px', color: '#ccc' } 对象形式
         */
        if (S.isPlainObject(style)) {
            style = String(S.param(style, ';'))
                .replace(/=/g, ':')
                .replace(/%23/g, '#')// 还原颜色值中的 #
                //注意：这里自定义属性也被 - 了，后面从字符串中取值时需要考虑
                .replace(/([a-z])([A-Z])/g, '$1-$2')
                .toLowerCase(); // backgroundColor => background-color
        }

        //正则化，并且将shorthand属性分解成各个属性统一单独处理
        //border:1px solid #fff =>
        //borderLeftWidth:1px
        //borderLeftColor:#fff
        self.props = normalize(style, elem);
        // normalize 后：
        // props = {
        //          width: { v: 200, unit: 'px', f: interpolate }
        //          color: { v: '#ccc', unit: '', f: color }
        //         }

        self.targetStyle = style;

        /**
         * animation config
         */
        if (isConfig) {
            config = S.merge(defaultConfig, duration);
        } else {
            config = S.clone(defaultConfig);
            if (duration) (config.duration = parseFloat(duration) || 1);
            if (S.isString(easing) || S.isFunction(easing)) config.easing = easing;
            if (S.isFunction(callback)) config.complete = callback;
            if (nativeSupport !== undefined) {
                config.nativeSupport = nativeSupport;
            }
        }

        //如果设定了元素属性的动画，则不能启动 css3 transition
        if (!S.isEmptyObject(getCustomAttrs(style))) {
            config.nativeSupport = false;
        }
        self.config = config;

        /**
         * detect browser native animation(CSS3 transition) support
         */
        if (config.nativeSupport
            && getNativeTransitionName()
            && S.isString((easing = config.easing))) {
            // 当 easing 是支持的字串时，才激活 native transition
            if (/cubic-bezier\([\s\d.,]+\)/.test(easing) ||
                (easing = Easing.NativeTimeFunction[easing])) {
                config.easing = easing;
                self.transitionName = getNativeTransitionName();
            }
        }

        // register callback
        if (S.isFunction(callback)) {
            self.callback = callback;
            //不要这样注册了，常用方式(new 完就扔)会忘记 detach，造成内存不断增加
            //self.on(EVENT_COMPLETE, callback);
        }
    }

    Anim.PROPS = PROPS;
    Anim.CUSTOM_ATTRS = CUSTOM_ATTRS;

    // 不能插值的直接返回终值，没有动画插值过程
    function mirror(source, target) {
        source = null;
        return target;
    }

    /**
     * 相应属性的读取设置操作，需要转化为动画模块格式
     */
    Anim.PROP_OPS = {
        "*":{
            getter:function(elem, prop) {
                var val = DOM.css(elem, prop),
                    num = parseFloat(val),
                    unit = (val + '').replace(/^[-\d.]+/, '');
                if (isNaN(num)) {
                    return {v:unit,u:'',f:mirror};
                }
                return {v:num,u:unit,f:this.interpolate};
            },
            setter:function(elem, prop, val) {
                return DOM.css(elem, prop, val);
            },
            /**
             * 数值插值函数
             * @param {Number} source 源值
             * @param {Number} target 目的值
             * @param {Number} pos 当前位置，从 easing 得到 0~1
             * @return {Number} 当前值
             */
            interpolate:function(source, target, pos) {
                return (source + (target - source) * pos).toFixed(3);
            },

            eq:function(tp, sp) {
                return tp.v == sp.v && tp.u == sp.u;
            }
        }
    };

    var PROP_OPS = Anim.PROP_OPS;


    S.augment(Anim, EventTarget, {
            /**
             * @type {boolean} 是否在运行
             */
            isRunning:false,
            /**
             * 动画开始到现在逝去的时间
             */
            elapsedTime:0,
            /**
             * 动画开始的时间
             */
            start:0,
            /**
             * 动画结束的时间
             */
            finish:0,
            /**
             * 动画持续时间，不间断的话 = finish-start
             */
            duration:0,

            run: function() {

                var self = this,
                    config = self.config,
                    elem = self.domEl,
                    duration, easing,
                    start,
                    finish,
                    target = self.props,
                    source = {},
                    prop;

                // already running,please stop first
                if (self.isRunning) {
                    return;
                }
                if (self.fire(EVENT_START) === false) return;

                self.stop(); // 先停止掉正在运行的动画
                duration = config.duration * 1000;
                self.duration = duration;
                if (self.transitionName) {
                    // !important firefox 如果结束样式对应的初始样式没有，则不会产生动画
                    // <div> -> <div 'left=100px'>
                    // 则初始 div 要设置行内 left=getComputed("left")
//                    for (prop in target) {
//                        var av = getAnimValue(elem, prop);// :)
//                        setAnimValue(elem, prop, av.v + av.u);
//                    }
                    self._nativeRun();
                } else {
                    for (prop in target) {
                        source[prop] = getAnimValue(elem, prop);
                    }

                    self.source = source;

                    start = S.now();
                    finish = start + duration;
                    easing = config.easing;

                    if (S.isString(easing)) {
                        easing = Easing[easing] || Easing.easeNone;
                    }


                    self.start = start;
                    self.finish = finish;
                    self.easing = easing;

                    AM.start(self);
                }

                self.isRunning = true;

                return self;
            },

            _complete:function() {
                var self = this;
                self.fire(EVENT_COMPLETE);
                self.callback && self.callback();
            },

            _runFrame:function() {

                var self = this,
                    elem = self.domEl,
                    finish = self.finish,
                    start = self.start,
                    duration = self.duration,
                    time = S.now(),
                    source = self.source,
                    easing = self.easing,
                    target = self.props,
                    prop,
                    elapsedTime;
                elapsedTime = time - start;
                var t = time > finish ? 1 : elapsedTime / duration,
                    sp, tp, b;

                self.elapsedTime = elapsedTime;

                //S.log("********************************  _runFrame");

                for (prop in target) {

                    sp = source[prop];
                    tp = target[prop];

                    // 没有发生变化的，直接略过
                    if (eqAnimValue(prop, tp, sp)) continue;

                    //S.log(prop);
                    //S.log(tp.v + " : " + sp.v + " : " + sp.u + " : " + tp.u);

                    // 比如 sp = { v: 0, u: 'pt'} ( width: 0 时，默认单位是 pt )
                    // 这时要把 sp 的单位调整为和 tp 的一致
                    if (tp.v == 0) {
                        tp.u = sp.u;
                    }

                    // 单位不一样时，以 tp.u 的为主，同时 sp 从 0 开始
                    // 比如：ie 下 border-width 默认为 medium
                    if (sp.u !== tp.u) {
                        //S.log(prop + " : " + sp.v + " : " + sp.u);
                        //S.log(prop + " : " + tp.v + " : " + tp.u);
                        //S.log(tp.f);
                        sp.v = 0;
                        sp.u = tp.u;
                    }

                    setAnimValue(elem, prop, tp.f(sp.v, tp.v, easing(t)) + tp.u);
                    /**
                     * 不能动画的量，直接设成最终值，下次不用动画，设置 dom 了
                     */
                    if (tp.f == mirror) {
                        sp.v = tp.v;
                        sp.u = tp.u;
                    }
                }

                if ((self.fire(EVENT_STEP) === false) || (b = time > finish)) {
                    self.stop();
                    // complete 事件只在动画到达最后一帧时才触发
                    if (b) {
                        self._complete();
                    }
                }
            },

            _nativeRun: function() {
                var self = this,
                    config = self.config,
                    elem = self.domEl,
                    duration = self.duration,
                    easing = config.easing,
                    prefix = self.transitionName,
                    transition = {};

                // using CSS transition process
                transition[prefix + 'Property'] = 'all';
                transition[prefix + 'Duration'] = duration + 'ms';
                transition[prefix + 'TimingFunction'] = easing;

                // set the CSS transition style
                DOM.css(elem, transition);

                // set the final style value (need some hack for opera)
                S.later(function() {
                    setToFinal(elem,
                        // target,
                        self.targetStyle);
                }, 0);

                // after duration time, fire the stop function
                S.later(function() {
                    self.stop(true);
                }, duration);
            },

            stop: function(finish) {
                var self = this;
                // already stopped
                if (!self.isRunning) {
                    return;
                }

                if (self.transitionName) {
                    self._nativeStop(finish);
                } else {
                    // 直接设置到最终样式
                    if (finish) {
                        setToFinal(self.domEl,
                            //self.props,
                            self.targetStyle);
                        self._complete();
                    }
                    AM.stop(self);
                }

                self.isRunning = false;

                return self;
            },

            _nativeStop: function(finish) {
                var self = this,
                    elem = self.domEl,
                    prefix = self.transitionName,
                    props = self.props,
                    prop;

                // handle for the CSS transition
                if (finish) {
                    // CSS transition value remove should come first
                    DOM.css(elem, prefix + PROPERTY, NONE);
                    self._complete();
                } else {
                    // if want to stop the CSS transition, should set the current computed style value to the final CSS value
                    for (prop in props) {
                        DOM.css(elem, prop, DOM._getComputedStyle(elem, prop));
                    }
                    // CSS transition value remove should come last
                    DOM.css(elem, prefix + PROPERTY, NONE);
                }
            }
        });

    Anim.supportTransition = function() {
        if (TRANSITION_NAME) return TRANSITION_NAME;
        var name = 'transition', transitionName;
        var el = document.documentElement;
        if (el.style[name] !== undefined) {
            transitionName = name;
        } else {
            S.each(['Webkit', 'Moz', 'O'], function(item) {
                if (el.style[(name = item + 'Transition')] !== undefined) {
                    transitionName = name;
                    return false;
                }
            });
        }
        TRANSITION_NAME = transitionName;
        return transitionName;
    };


    var getNativeTransitionName = Anim.supportTransition;

    function setToFinal(elem, style) {
        setAnimStyleText(elem, style);
    }

    function getAnimValue(el, prop) {
        return (PROP_OPS[prop] || PROP_OPS["*"]).getter(el, prop);
    }


    function setAnimValue(el, prop, v) {
        return (PROP_OPS[prop] || PROP_OPS["*"]).setter(el, prop, v);
    }

    function eqAnimValue(prop, tp, sp) {
        var propSpecial = PROP_OPS[prop];
        if (propSpecial && propSpecial.eq) {
            return propSpecial.eq(tp, sp);
        }
        return PROP_OPS["*"].eq(tp, sp);
    }

    /**
     * 建一个尽量相同的 dom 节点在相同的位置（不单行内，获得相同的 css 选择器样式定义），从中取值
     */
    function normalize(style, elem) {
        var css,
            rules = {},
            i = PROPS.length,
            v;
        var el = elem.cloneNode(true);

        DOM.insertAfter(el, elem);

        css = el.style;
        setAnimStyleText(el, style);
        while (i--) {
            var prop = PROPS[i];
            // !important 只对行内样式得到计算当前真实值
            if (v = css[prop]) {
                rules[prop] = getAnimValue(el, prop);
            }
        }
        //自定义属性混入
        var customAttrs = getCustomAttrs(style);
        for (var a in customAttrs) {
            rules[a] = getAnimValue(el, a);
        }
        DOM.remove(el);
        return rules;
    }

    /**
     * 直接设置 cssText 以及属性字符串，注意 ie 的 opacity
     * @param style
     * @param elem
     */
    function setAnimStyleText(elem, style) {
        if (UA['ie'] && style.indexOf(OPACITY) > -1) {
            var reg = /opacity\s*:\s*([^;]+)(;|$)/;
            var match = style.match(reg);
            if (match) {
                DOM.css(elem, OPACITY, parseFloat(match[1]));
            }
            //不要把它清除了
            //ie style.opacity 要能取！
        }
        elem.style.cssText += ';' + style;
        //设置自定义属性
        var attrs = getCustomAttrs(style);
        for (var a in attrs) {
            elem[a] = attrs[a];
        }
    }

    /**
     * 从自定义属性和样式字符串中解出属性值
     * @param style
     */
    function getCustomAttrs(style) {

        var ret = {};
        for (var i = 0; i < CUSTOM_ATTRS.length; i++) {
            var attr = CUSTOM_ATTRS[i]
                .replace(/([a-z])([A-Z])/g, '$1-$2')
                .toLowerCase();
            var reg = new RegExp(attr + "\\s*:([^;]+)(;|$)");
            var m = style.match(reg);
            if (m) {
                ret[CUSTOM_ATTRS[i]] = S.trim(m[1]);
            }
        }
        return ret;
    }

    return Anim;
}, {
        requires:["dom","event","./easing","ua","./manager"]
    });

/**
 * TODO:
 *  - 实现 jQuery Effects 的 queue / specialEasing / += / 等特性
 *
 * NOTES:
 *  - 与 emile 相比，增加了 borderStyle, 使得 border: 5px solid #ccc 能从无到有，正确显示
 *  - api 借鉴了 YUI, jQuery 以及 http://www.w3.org/TR/css3-transitions/
 *  - 代码实现了借鉴了 Emile.js: http://github.com/madrobby/emile
 *  - 借鉴 yui3 ，中央定时器，否则 ie6 内存泄露？
 */

/**
 * special patch for making color gradual change
 * @author: yiminghe@gmail.com
 */
KISSY.add("anim/color", function(S, DOM, Anim) {

    var KEYWORDS = {
        "black":[0,0,0],
        "silver":[192,192,192],
        "gray":[128,128,128],
        "white":[255,255,255],
        "maroon":[128,0,0],
        "red":[255,0,0],
        "purple":[128,0,128],
        "fuchsia":[255,0,255],
        "green":[0,128,0],
        "lime":[0,255,0],
        "olive":[128,128,0],
        "yellow":[255,255,0],
        "navy":[0,0,128],
        "blue":[0,0,255],
        "teal":[0,128,128],
        "aqua":[0,255,255]
    };
    var re_RGB = /^rgb\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\)$/i,
        re_hex = /^#?([0-9A-F]{1,2})([0-9A-F]{1,2})([0-9A-F]{1,2})$/i;


    //颜色 css 属性
    var colors = ('backgroundColor ' +
        'borderBottomColor ' +
        'borderLeftColor ' +
        'borderRightColor ' +
        'borderTopColor ' +
        'color ' +
        'outlineColor').split(' ');

    var OPS = Anim.PROP_OPS,
        PROPS = Anim.PROPS;

    //添加到支持集
    PROPS.push.apply(PROPS, colors);


    //得到颜色的数值表示，红绿蓝数字数组
    function numericColor(val) {
        val = val.toLowerCase();
        var match;
        if (match = val.match(re_RGB)) {
            return [
                parseInt(match[1]),
                parseInt(match[2]),
                parseInt(match[3])
            ];
        } else if (match = val.match(re_hex)) {
            for (var i = 1; i < match.length; i++) {
                if (match[i].length < 2) {
                    match[i] = match[i] + match[i];
                }
            }
            return [
                parseInt(match[1], 16),
                parseInt(match[2], 16),
                parseInt(match[3], 16)
            ];
        }
        if (KEYWORDS[val]) return KEYWORDS[val];
        //transparent 或者 颜色字符串返回
        S.log("only allow rgb or hex color string : " + val, "warn");
        return [255,255,255];
    }


    OPS["color"] = {
        getter:function(elem, prop) {
            return {
                v:numericColor(DOM.css(elem, prop)),
                u:'',
                f:this.interpolate
            };
        },
        setter:OPS["*"].setter,
        /**
         * 根据颜色的数值表示，执行数组插值
         * @param source {Array.<Number>} 颜色源值表示
         * @param target {Array.<Number>} 颜色目的值表示
         * @param pos {Number} 当前进度
         * @return {String} 可设置css属性的格式值 : rgb
         */
        interpolate:function(source, target, pos) {
            var interpolate = OPS["*"].interpolate;
            return 'rgb(' + [
                Math.floor(interpolate(source[0], target[0], pos)),
                Math.floor(interpolate(source[1], target[1], pos)),
                Math.floor(interpolate(source[2], target[2], pos))
            ].join(', ') + ')';
        },
        eq:function(tp, sp) {
            return (tp.v + "") == (sp.v + "");
        }
    };

    S.each(colors, function(prop) {
        OPS[prop] = OPS['color'];
    });
}, {
        requires:["dom","./base"]
    });

/**
 * special patch for animate scroll property of element
 * @author: yiminghe@gmail.com
 */
KISSY.add("anim/scroll", function(S, DOM, Anim) {

    var OPS = Anim.PROP_OPS;

    //添加到支持集
    Anim.CUSTOM_ATTRS.push("scrollLeft", "scrollTop");

    // 不从 css  中读取，从元素属性中得到值
    OPS["scrollLeft"] = OPS["scrollTop"] = {
        getter:function(elem, prop) {

            return {
                v:elem[prop],
                u:'',
                f:OPS["*"].interpolate
            };
        },
        setter:function(elem, prop, val) {
            elem[prop] = val;
        }
    };
}, {
    requires:["dom","./base"]
});

KISSY.add("anim", function(S, Anim,Easing) {
    Anim.Easing=Easing;
    return Anim;
}, {
    requires:["anim/base","anim/easing","anim/color","anim/scroll"]
});

/**
 * @module  anim-node-plugin
 * @author  lifesinger@gmail.com, qiaohua@taobao.com
 */
KISSY.add('node/anim-plugin', function(S, DOM, Anim, N, undefined) {

    var NLP = N.prototype,
        ANIM_KEY = "ksAnims" + S.now(),
        DISPLAY = 'display',
        NONE = 'none',
        OVERFLOW = 'overflow',
        HIDDEN = 'hidden',
        OPCACITY = 'opacity',
        HEIGHT = 'height', WIDTH = 'width',
        FX = {
            show: [OVERFLOW, OPCACITY, HEIGHT, WIDTH],
            fade: [OPCACITY],
            slide: [OVERFLOW, HEIGHT]
        };

    N.__ANIM_KEY = ANIM_KEY;

    (function(P) {

        function attachAnim(elem, anim) {
            var anims = DOM.data(elem, ANIM_KEY);
            if (!anims) {
                DOM.data(elem, ANIM_KEY, anims = []);
            }
            anim.on("complete", function() {
                var anims = DOM.data(elem, ANIM_KEY);
                if (anims) {
                    // 结束后从关联的动画队列中删除当前动画
                    var index = S.indexOf(anim, anims);
                    if (index >= 0) {
                        anims.splice(index, 1);
                    }
                    if (!anims.length) {
                        DOM.removeData(elem, ANIM_KEY);
                    }
                }
            });
            // 当前节点的所有动画队列
            anims.push(anim);
        }

        P.animate = function() {
            var self = this,
                args = S.makeArray(arguments);
            S.each(self, function(elem) {
                var anim = Anim.apply(undefined, [elem].concat(args)).run();
                attachAnim(elem, anim);
            });
            return self;
        };

        P.stop = function(finish) {
            var self = this;
            S.each(self, function(elem) {
                var anims = DOM.data(elem, ANIM_KEY);
                if (anims) {
                    S.each(anims, function(anim) {
                        anim.stop(finish);
                    });
                    DOM.removeData(elem, ANIM_KEY);
                }
            });
            return self;
        };

        S.each({
            show: ['show', 1],
            hide: ['show', 0],
            toggle: ['toggle'],
            fadeIn: ['fade', 1],
            fadeOut: ['fade', 0],
            slideDown: ['slide', 1],
            slideUp: ['slide', 0]
        },
            function(v, k) {

                P[k] = function(speed, callback, easing, nativeSupport) {
                    var self = this;

                    // 没有参数时，调用 DOM 中的对应方法
                    if (DOM[k] && arguments.length === 0) {
                        DOM[k](self);
                    }
                    else {
                        S.each(this, function(elem) {
                            var anim = fx(elem, v[0], speed, callback,
                                v[1], easing, nativeSupport);
                            attachAnim(elem, anim);
                        });
                    }
                    return self;
                };
            });
    })(NLP);

    function fx(elem, which, speed, callback, visible, easing, nativeSupport) {
        if (which === 'toggle') {
            visible = DOM.css(elem, DISPLAY) === NONE ? 1 : 0;
            which = 'show';
        }

        if (visible) {
            DOM.css(elem, DISPLAY, DOM.data(elem, DISPLAY) || '');
        }

        // 根据不同类型设置初始 css 属性, 并设置动画参数
        var originalStyle = {}, style = {};
        S.each(FX[which], function(prop) {
            if (prop === OVERFLOW) {
                originalStyle[OVERFLOW] = DOM.css(elem, OVERFLOW);
                DOM.css(elem, OVERFLOW, HIDDEN);
            }
            else if (prop === OPCACITY) {
                originalStyle[OPCACITY] = DOM.css(elem, OPCACITY);
                style.opacity = visible ? 1 : 0;
                if (visible) {
                    DOM.css(elem, OPCACITY, 0);
                }
            }
            else if (prop === HEIGHT) {
                originalStyle[HEIGHT] = DOM.css(elem, HEIGHT);
                //http://arunprasad.wordpress.com/2008/08/26/naturalwidth-and-naturalheight-for-image-element-in-internet-explorer/
                style.height = (visible ? DOM.css(elem, HEIGHT) || elem.naturalHeight : 0);

                if (visible) {
                    DOM.css(elem, HEIGHT, 0);
                }
            }
            else if (prop === WIDTH) {
                originalStyle[WIDTH] = DOM.css(elem, WIDTH);
                style.width = (visible ? DOM.css(elem, WIDTH) || elem.naturalWidth : 0);
                if (visible) {
                    DOM.css(elem, WIDTH, 0);
                }
            }
        });

        // 开始动画
        return new Anim(elem, style, speed, easing || 'easeOut', function() {
            // 如果是隐藏, 需要还原一些 css 属性
            if (!visible) {
                // 保留原有值
                var currStyle = elem.style, oldVal = currStyle[DISPLAY];
                if (oldVal !== NONE) {
                    if (oldVal) {
                        DOM.data(elem, DISPLAY, oldVal);
                    }
                    currStyle[DISPLAY] = NONE;
                }

                // 还原样式
                if (originalStyle[HEIGHT]) {
                    DOM.css(elem, { height: originalStyle[HEIGHT] });
                }
                if (originalStyle[WIDTH]) {
                    DOM.css(elem, { width: originalStyle[WIDTH] });
                }
                if (originalStyle[OPCACITY]) {
                    DOM.css(elem, { opacity: originalStyle[OPCACITY] });
                }
                if (originalStyle[OVERFLOW]) {
                    DOM.css(elem, { overflow: originalStyle[OVERFLOW] });
                }

            }

            if (callback && S.isFunction(callback)) {
                callback();
            }

        }, nativeSupport).run();
    }

}, {
    requires:["dom","anim","./base"]
});
/**
 * 2011-05-17
 *  - 承玉：添加 stop ，随时停止动画
 *
 *  TODO
 *  - anim needs queue mechanism ?
 */

KISSY.add("node", function(S, Node) {
    return Node;
}, {
        requires:["node/base","node/attach","node/override","node/anim-plugin"]
    });

/*
 http://www.JSON.org/json2.js
 2010-08-25

 Public Domain.

 NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

 See http://www.JSON.org/js.html


 This code should be minified before deployment.
 See http://javascript.crockford.com/jsmin.html

 USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
 NOT CONTROL.


 This file creates a global JSON object containing two methods: stringify
 and parse.

 JSON.stringify(value, replacer, space)
 value       any JavaScript value, usually an object or array.

 replacer    an optional parameter that determines how object
 values are stringified for objects. It can be a
 function or an array of strings.

 space       an optional parameter that specifies the indentation
 of nested structures. If it is omitted, the text will
 be packed without extra whitespace. If it is a number,
 it will specify the number of spaces to indent at each
 level. If it is a string (such as '\t' or '&nbsp;'),
 it contains the characters used to indent at each level.

 This method produces a JSON text from a JavaScript value.

 When an object value is found, if the object contains a toJSON
 method, its toJSON method will be called and the result will be
 stringified. A toJSON method does not serialize: it returns the
 value represented by the name/value pair that should be serialized,
 or undefined if nothing should be serialized. The toJSON method
 will be passed the key associated with the value, and this will be
 bound to the value

 For example, this would serialize Dates as ISO strings.

 Date.prototype.toJSON = function (key) {
 function f(n) {
 // Format integers to have at least two digits.
 return n < 10 ? '0' + n : n;
 }

 return this.getUTCFullYear()   + '-' +
 f(this.getUTCMonth() + 1) + '-' +
 f(this.getUTCDate())      + 'T' +
 f(this.getUTCHours())     + ':' +
 f(this.getUTCMinutes())   + ':' +
 f(this.getUTCSeconds())   + 'Z';
 };

 You can provide an optional replacer method. It will be passed the
 key and value of each member, with this bound to the containing
 object. The value that is returned from your method will be
 serialized. If your method returns undefined, then the member will
 be excluded from the serialization.

 If the replacer parameter is an array of strings, then it will be
 used to select the members to be serialized. It filters the results
 such that only members with keys listed in the replacer array are
 stringified.

 Values that do not have JSON representations, such as undefined or
 functions, will not be serialized. Such values in objects will be
 dropped; in arrays they will be replaced with null. You can use
 a replacer function to replace those with JSON values.
 JSON.stringify(undefined) returns undefined.

 The optional space parameter produces a stringification of the
 value that is filled with line breaks and indentation to make it
 easier to read.

 If the space parameter is a non-empty string, then that string will
 be used for indentation. If the space parameter is a number, then
 the indentation will be that many spaces.

 Example:

 text = JSON.stringify(['e', {pluribus: 'unum'}]);
 // text is '["e",{"pluribus":"unum"}]'


 text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
 // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

 text = JSON.stringify([new Date()], function (key, value) {
 return this[key] instanceof Date ?
 'Date(' + this[key] + ')' : value;
 });
 // text is '["Date(---current time---)"]'


 JSON.parse(text, reviver)
 This method parses a JSON text to produce an object or array.
 It can throw a SyntaxError exception.

 The optional reviver parameter is a function that can filter and
 transform the results. It receives each of the keys and values,
 and its return value is used instead of the original value.
 If it returns what it received, then the structure is not modified.
 If it returns undefined then the member is deleted.

 Example:

 // Parse the text. Values that look like ISO date strings will
 // be converted to Date objects.

 myData = JSON.parse(text, function (key, value) {
 var a;
 if (typeof value === 'string') {
 a =
 /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
 if (a) {
 return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
 +a[5], +a[6]));
 }
 }
 return value;
 });

 myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
 var d;
 if (typeof value === 'string' &&
 value.slice(0, 5) === 'Date(' &&
 value.slice(-1) === ')') {
 d = new Date(value.slice(5, -1));
 if (d) {
 return d;
 }
 }
 return value;
 });


 This is a reference implementation. You are free to copy, modify, or
 redistribute.
 */

/*jslint evil: true, strict: false */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
 call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
 getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
 lastIndex, length, parse, prototype, push, replace, slice, stringify,
 test, toJSON, toString, valueOf
 */


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

KISSY.add("json/json2", function(S, UA) {
    var win = window,JSON = win.JSON;
    // ie 8.0.7600.16315@win7 json 有问题
    if (!JSON || UA['ie'] < 9) {
        JSON = win.JSON = {};
    }

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                this.getUTCFullYear() + '-' +
                    f(this.getUTCMonth() + 1) + '-' +
                    f(this.getUTCDate()) + 'T' +
                    f(this.getUTCHours()) + ':' +
                    f(this.getUTCMinutes()) + ':' +
                    f(this.getUTCSeconds()) + 'Z' : null;
        };

        String.prototype.toJSON =
            Number.prototype.toJSON =
                Boolean.prototype.toJSON = function (key) {
                    return this.valueOf();
                };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable['lastIndex'] = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
            typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
            case 'string':
                return quote(value);

            case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

                return isFinite(value) ? String(value) : 'null';

            case 'boolean':
            case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

                return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

            case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

                if (!value) {
                    return 'null';
                }

// Make an array to hold the partial results of stringifying this object value.

                gap += indent;
                partial = [];

// Is the value an array?

                if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || 'null';
                    }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                    v = partial.length === 0 ? '[]' :
                        gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                            mind + ']' :
                            '[' + partial.join(',') + ']';
                    gap = mind;
                    return v;
                }

// If the replacer is an array, use it to select the members to be stringified.

                if (rep && typeof rep === 'object') {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        k = rep[i];
                        if (typeof k === 'string') {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                } else {

// Otherwise, iterate through all of the keys in the object.

                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

                v = partial.length === 0 ? '{}' :
                    gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
                gap = mind;
                return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx['lastIndex'] = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
    return JSON;
}, {requires:['ua']});

/**
 * adapt json2 to kissy
 * @author lifesinger@gmail.com
 */
KISSY.add('json', function (S, JSON) {

    return {

        parse: function(text) {
            // 当输入为 undefined / null / '' 时，返回 null
            if (text == null || text === '') return null;
            return JSON.parse(text);
        },

        stringify: JSON.stringify
    };
}, {
    requires:["json/json2"]
});

/**
 * encapsulation of io object . as transaction object in yui3
 * @author: yiminghe@gmail.com
 */
KISSY.add("ajax/xhrobject", function(S, Event) {

    var // get individual response header from responseheader str
        rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg;

    function handleResponseData(xhr) {

        // text xml 是否原生转化支持
        var text = xhr.responseText,
            xml = xhr.responseXML,
            c = xhr.config,
            cConverts = c.converters,
            xConverts = xhr.converters || {},
            type,
            responseData,
            contents = c.contents,
            dataType = c.dataType;

        // 例如 script 直接是js引擎执行，没有返回值，不需要自己处理初始返回值
        // jsonp 时还需要把 script 转换成 json，后面还得自己来
        if (text || xml) {

            var contentType = xhr.mimeType || xhr.getResponseHeader("Content-Type");

            // 去除无用的通用格式
            while (dataType[0] == "*") {
                dataType.shift();
            }

            if (!dataType.length) {
                // 获取源数据格式，放在第一个
                for (type in contents) {
                    if (contents[type].test(contentType)) {
                        if (dataType[0] != type) {
                            dataType.unshift(type);
                        }
                        break;
                    }
                }
            }
            // 服务器端没有告知（并且客户端没有mimetype）默认 text 类型
            dataType[0] = dataType[0] || "text";

            //获得合适的初始数据
            if (dataType[0] == "text" && text != undefined) {
                responseData = text;
            }
            // 有 xml 值才直接取，否则可能还要从 xml 转
            else if (dataType[0] == "xml" && xml != undefined) {
                responseData = xml;
            } else {
                // 看能否从 text xml 转换到合适数据
                S.each(["text","xml"], function(prevType) {
                    var type = dataType[0],
                        converter = xConverts[prevType] && xConverts[prevType][type] ||
                            cConverts[prevType] && cConverts[prevType][type];
                    if (converter) {
                        dataType.unshift(prevType);
                        responseData = prevType == "text" ? text : xml;
                        return false;
                    }
                });
            }
        }
        var prevType = dataType[0];

        // 按照转化链把初始数据转换成我们想要的数据类型
        for (var i = 1; i < dataType.length; i++) {
            type = dataType[i];

            var converter = xConverts[prevType] && xConverts[prevType][type] ||
                cConverts[prevType] && cConverts[prevType][type];

            if (!converter) {
                throw "no covert for " + prevType + " => " + type;
            }
            responseData = converter(responseData);

            prevType = type;
        }

        xhr.responseData = responseData;
    }

    function XhrObject(c) {
        S.mix(this, {
                // 结构化数据，如 json
                responseData:null,
                config:c || {},
                timeoutTimer:null,
                responseText:null,
                responseXML:null,
                responseHeadersString:"",
                responseHeaders:null,
                requestHeaders:{},
                readyState:0,
                //internal state
                state:0,
                statusText:null,
                status:0,
                transport:null
            });
    }

    S.augment(XhrObject, Event.Target, {
            // Caches the header
            setRequestHeader: function(name, value) {
                this.requestHeaders[ name ] = value;
                return this;
            },

            // Raw string
            getAllResponseHeaders: function() {
                return this.state === 2 ? this.responseHeadersString : null;
            },

            // Builds headers hashtable if needed
            getResponseHeader: function(key) {
                var match;
                if (this.state === 2) {
                    if (!this.responseHeaders) {
                        this.responseHeaders = {};
                        while (( match = rheaders.exec(this.responseHeadersString) )) {
                            this.responseHeaders[ match[1] ] = match[ 2 ];
                        }
                    }
                    match = this.responseHeaders[ key];
                }
                return match === undefined ? null : match;
            },

            // Overrides response content-type header
            overrideMimeType: function(type) {
                if (!this.state) {
                    this.mimeType = type;
                }
                return this;
            },

            // Cancel the request
            abort: function(statusText) {
                statusText = statusText || "abort";
                if (this.transport) {
                    this.transport.abort(statusText);
                }
                this.callback(0, statusText);
                return this;
            },

            callback:function(status, statusText) {
                //debugger
                var xhr = this;
                // 只能执行一次，防止重复执行
                // 例如完成后，调用 abort

                // 到这要么成功，调用success
                // 要么失败，调用 error
                // 最终都会调用 complete
                if (xhr.state == 2) {
                    return;
                }
                xhr.state = 2;
                xhr.readyState = 4;
                var isSuccess;
                if (status >= 200 && status < 300 || status == 304) {

                    if (status == 304) {
                        statusText = "notmodified";
                        isSuccess = true;
                    } else {
                        try {
                            handleResponseData(xhr);
                            statusText = "success";
                            isSuccess = true;
                        } catch(e) {
                            statusText = "parsererror : " + e;
                        }
                    }

                } else {
                    if (status < 0) {
                        status = 0;
                    }
                }

                xhr.status = status;
                xhr.statusText = statusText;

                if (isSuccess) {
                    xhr.fire("success");
                } else {
                    xhr.fire("error");
                }
                xhr.fire("complete");
                xhr.transport = undefined;
            }
        }
    );

    return XhrObject;
}, {
        requires:["event"]
    });

/**
 * a scalable client io framework
 * @author: yiminghe@gmail.com , lijing00333@163.com
 */
KISSY.add("ajax/base", function(S, JSON, Event, XhrObject) {

    var rlocalProtocol = /^(?:about|app|app\-storage|.+\-extension|file|widget):$/,
        rspace = /\s+/,
        rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/,
        mirror = function(s) {
            return s;
        },
        rnoContent = /^(?:GET|HEAD)$/,
        curLocation,
        curLocationParts;


    try {
        curLocation = location.href;
    } catch(e) {
        // Use the href attribute of an A element
        // since IE will modify it given document.location
        curLocation = document.createElement("a");
        curLocation.href = "";
        curLocation = curLocation.href;
    }

    curLocationParts = rurl.exec(curLocation);

    var isLocal = rlocalProtocol.test(curLocationParts[1]),
        transports = {},
        defaultConfig = {
            // isLocal:isLocal,
            type:"GET",
            // only support utf-8 when post, encoding can not be changed actually
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
            async:true,
            // whether add []
            serializeArray:true,
            // whether param data
            processData:true,
            /*
             url:"",
             context:null,
             timeout: 0,
             data: null,

             // 可取json | jsonp | script | xml | html | text | null | undefined
             dataType: null,

             username: null,
             password: null,
             cache: null,
             mimeType:null,
             headers: {},
             xhrFields:{},
             // jsonp script charset
             scriptCharset:null,
             crossdomain:false,
             forceScript:false,
             */

            accepts: {
                xml: "application/xml, text/xml",
                html: "text/html",
                text: "text/plain",
                json: "application/json, text/javascript",
                "*": "*/*"
            },
            converters:{
                text:{
                    json:JSON.parse,
                    html:mirror,
                    text:mirror,
                    xml:S.parseXML
                }
            },
            contents:{
                xml:/xml/,
                html:/html/,
                json:/json/
            }
        };

    defaultConfig.converters.html = defaultConfig.converters.text;

    function setUpConfig(c) {
        // deep mix
        c = S.mix(S.clone(defaultConfig), c || {}, undefined, undefined, true);
        if (c.crossDomain == null) {
            var parts = rurl.exec(c.url.toLowerCase());
            c.crossDomain = !!( parts &&
                ( parts[ 1 ] != curLocationParts[ 1 ] || parts[ 2 ] != curLocationParts[ 2 ] ||
                    ( parts[ 3 ] || ( parts[ 1 ] === "http:" ? 80 : 443 ) ) !=
                        ( curLocationParts[ 3 ] || ( curLocationParts[ 1 ] === "http:" ? 80 : 443 ) ) )
                );
        }

        if (c.processData && c.data && !S.isString(c.data)) {
            // 必须 encodeURIComponent 编码 utf-8
            c.data = S.param(c.data, undefined, undefined, c.serializeArray);
        }

        c.type = c.type.toUpperCase();
        c.hasContent = !rnoContent.test(c.type);

        if (!c.hasContent) {
            if (c.data) {
                c.url += ( /\?/.test(c.url) ? "&" : "?" ) + c.data;
            }
            if (c.cache === false) {
                c.url += ( /\?/.test(c.url) ? "&" : "?" ) + "_ksTS=" + (S.now() + "_" + S.guid());
            }
        }

        // 数据类型处理链，一步步将前面的数据类型转化成最后一个
        c.dataType = S.trim(c.dataType || "*").split(rspace);

        c.context = c.context || c;
        return c;
    }

    function fire(eventType, xhr) {
        io.fire(eventType, { ajaxConfig: xhr.config ,xhr:xhr});
    }

    function handleXhrEvent(e) {
        var xhr = this,
            c = xhr.config,
            type = e.type;
        if (this.timeoutTimer) {
            clearTimeout(this.timeoutTimer);
        }
        if (c[type]) {
            c[type].call(c.context, xhr.responseData, xhr.statusText, xhr);
        }
        fire(type, xhr);
    }

    function io(c) {
        if (!c.url) {
            return undefined;
        }
        c = setUpConfig(c);
        var xhr = new XhrObject(c);
        fire("start", xhr);
        var transportContructor = transports[c.dataType[0]] || transports["*"],
            transport = new transportContructor(xhr);
        xhr.transport = transport;

        if (c.contentType) {
            xhr.setRequestHeader("Content-Type", c.contentType);
        }
        var dataType = c.dataType[0],
            accepts = c.accepts;
        // Set the Accepts header for the server, depending on the dataType
        xhr.setRequestHeader(
            "Accept",
            dataType && accepts[dataType] ?
                accepts[ dataType ] + (dataType !== "*" ? ", */*; q=0.01" : "" ) :
                accepts[ "*" ]
        );

        // Check for headers option
        for (var i in c.headers) {
            xhr.setRequestHeader(i, c.headers[ i ]);
        }

        xhr.on("complete success error", handleXhrEvent);

        xhr.readyState = 1;

        fire("send", xhr);

        // Timeout
        if (c.async && c.timeout > 0) {
            xhr.timeoutTimer = setTimeout(function() {
                xhr.abort("timeout");
            }, c.timeout);
        }

        try {
            xhr.state = 1;
            transport.send();
        } catch (e) {
            // Propagate exception as error if not done
            if (xhr.status < 2) {
                xhr.callback(-1, e);
                // Simply rethrow otherwise
            } else {
                S.error(e);
            }
        }

        return xhr;
    }

    S.mix(io, Event.Target);
    S.mix(io, {
            isLocal:isLocal,
            setupConfig:function(setting) {
                S.mix(defaultConfig, setting, undefined, undefined, true);
            },
            setupTransport:function(name, fn) {
                transports[name] = fn;
            },
            getTransport:function(name) {
                return transports[name];
            },
            getConfig:function() {
                return defaultConfig;
            }
        });


    return io;
},
    {
        requires:["json","event","./xhrobject"]
    });

/**
 * 借鉴 jquery，优化减少闭包使用
 *
 * TODO:
 *  ifModified mode 是否需要？
 *  优点：
 *      不依赖浏览器处理，ajax 请求浏览不会自动加 If-Modified-Since If-None-Match ??
 *  缺点：
 *      内存占用
 **/

/**
 * ajax xhr transport class
 * @author yiminghe@gmail.com
 */
KISSY.add("ajax/xhr", function(S, io) {

    function createStandardXHR() {
        try {
            return new window.XMLHttpRequest();
        } catch(e) {
        }
        return undefined;
    }

    function createActiveXHR() {
        try {
            return new window.ActiveXObject("Microsoft.XMLHTTP");
        } catch(e) {
        }
        return undefined;
    }

    io.xhr = window.ActiveXObject ? function() {
        // ie7 XMLHttpRequest 不能访问本地文件
        return !io.isLocal && createStandardXHR() || createActiveXHR();
    } : createStandardXHR;

    var detectXhr = io.xhr(),
        allowCrossDomain = false;

    if (detectXhr) {

        if ("withCredentials" in detectXhr) {
            allowCrossDomain = true;
        }

        function XhrTransport(xhrObj) {
            this.xhrObj = xhrObj;
        }

        S.augment(XhrTransport, {
            send:function() {
                var self = this,
                    xhrObj = self.xhrObj,
                    c = xhrObj.config;

                if (c.crossDomain && !allowCrossDomain) {
                    S.error("do not allow crossdomain xhr !");
                    return;
                }

                var xhr = io.xhr(),
                    xhrFields,
                    i;

                self.xhr = xhr;

                if (c['username']) {
                    xhr.open(c.type, c.url, c.async, c['username'], c.password)
                } else {
                    xhr.open(c.type, c.url, c.async);
                }

                if (xhrFields = c['xhrFields']) {
                    for (i in xhrFields) {
                        xhr[ i ] = xhrFields[ i ];
                    }
                }

                // Override mime type if supported
                if (xhrObj.mimeType && xhr.overrideMimeType) {
                    xhr.overrideMimeType(xhrObj.mimeType);
                }
                // yui3 and jquery both have
                if (!c.crossDomain && !xhrObj.requestHeaders["X-Requested-With"]) {
                    xhrObj.requestHeaders[ "X-Requested-With" ] = "XMLHttpRequest";
                }
                try {

                    for (i in xhrObj.requestHeaders) {
                        xhr.setRequestHeader(i, xhrObj.requestHeaders[ i ]);
                    }
                } catch(e) {
                }

                xhr.send(c.hasContent && c.data || null);

                if (!c.async || xhr.readyState == 4) {
                    self._callback();
                } else {
                    xhr.onreadystatechange = function() {
                        self._callback();
                    }
                }
            },
            // 由 xhrObj.abort 调用，自己不可以调用 xhrObj.abort
            abort:function() {
                this._callback(0, 1);
            },

            _callback:function(event, abort) {

                // Firefox throws exceptions when accessing properties
                // of an xhr when a network error occured
                // http://helpful.knobs-dials.com/index.php/Component_returned_failure_code:_0x80040111_(NS_ERROR_NOT_AVAILABLE)
                try {
                    var self = this,
                        xhr = self.xhr,
                        xhrObj = self.xhrObj,
                        c = xhrObj.config;
                    //abort or complete
                    if (abort || xhr.readyState == 4) {
                        xhr.onreadystatechange = S.noop;


                        if (abort) {
                            // 完成以后 abort 不要调用
                            if (xhr.readyState !== 4) {
                                xhr.abort();
                            }
                        } else {
                            var status = xhr.status;
                            xhrObj.responseHeadersString = xhr.getAllResponseHeaders();

                            var xml = xhr.responseXML;

                            // Construct response list
                            if (xml && xml.documentElement /* #4958 */) {
                                xhrObj.responseXML = xml;
                            }
                            xhrObj.responseText = xhr.responseText;

                            // Firefox throws an exception when accessing
                            // statusText for faulty cross-domain requests
                            try {
                                var statusText = xhr.statusText;
                            } catch(e) {
                                // We normalize with Webkit giving an empty statusText
                                statusText = "";
                            }

                            // Filter status for non standard behaviors
                            // If the request is local and we have data: assume a success
                            // (success with no data won't get notified, that's the best we
                            // can do given current implementations)
                            if (!status && io.isLocal && !c.crossDomain) {
                                status = xhrObj.responseText ? 200 : 404;
                                // IE - #1450: sometimes returns 1223 when it should be 204
                            } else if (status === 1223) {
                                status = 204;
                            }

                            xhrObj.callback(status, statusText);
                        }
                    }
                } catch (firefoxAccessException) {
                    xhr.onreadystatechange = S.noop;
                    if (!abort) {
                        xhrObj.callback(-1, firefoxAccessException);
                    }
                }
            }


        });

        io.setupTransport("*", XhrTransport);

        return io;
    }
}, {
    requires:["./base"]
});

/**
 * 借鉴 jquery，优化使用原型替代闭包
 **/

/**
 * script transport for kissy io
 * @description: modified version of S.getScript , add abort ability
 * @author: yiminghe@gmail.com
 */
KISSY.add("ajax/script", function(S, io) {

    io.setupConfig({
            accepts:{
                script:"text/javascript, " +
                    "application/javascript, " +
                    "application/ecmascript, " +
                    "application/x-ecmascript"
            },

            contents:{
                script:/javascript|ecmascript/
            },
            converters:{
                text:{
                    // 如果以 xhr+eval 需要下面的，
                    // 否则直接 script node 不需要，引擎自己执行了，
                    // 不需要手动 eval
                    script:function(text) {
                        S.globalEval(text);
                        return text;
                    }
                }
            }
        });

    function ScriptTransport(xhrObj) {
        // 优先使用 xhr+eval 来执行脚本, ie 下可以探测到（更多）失败状态
        if (!xhrObj.config.crossDomain &&
            !xhrObj.config['forceScript']) {
            return new (io.getTransport("*"))(xhrObj);
        }
        this.xhrObj = xhrObj;
        return 0;
    }

    S.augment(ScriptTransport, {
            send:function() {
                var self = this,
                    script,
                    xhrObj = this.xhrObj,
                    c = xhrObj.config,
                    head = document['head'] ||
                        document.getElementsByTagName("head")[0] ||
                        document.documentElement;
                self.head = head;
                script = document.createElement("script");
                self.script = script;
                script.async = "async";

                if (c['scriptCharset']) {
                    script.charset = c['scriptCharset'];
                }

                script.src = c.url;

                script.onerror =
                    script.onload =
                        script.onreadystatechange = function(e) {
                            e = e || window.event;
                            // firefox onerror 没有 type ?!
                            self._callback((e.type || "error").toLowerCase());
                        };

                head.insertBefore(script, head.firstChild);
            },

            _callback:function(event, abort) {
                var script = this.script,
                    xhrObj = this.xhrObj,
                    head = this.head;

                if (abort ||
                    !script.readyState ||
                    /loaded|complete/.test(script.readyState)
                    || event == "error"
                    ) {

                    script['onerror'] = script.onload = script.onreadystatechange = null;

                    // Remove the script
                    if (head && script.parentNode) {
                        head.removeChild(script);
                    }

                    this.script = undefined;
                    this.head = undefined;

                    // Callback if not abort
                    if (!abort && event != "error") {
                        xhrObj.callback(200, "success");
                    }
                    // 非 ie<9 可以判断出来
                    else if (event == "error") {
                        xhrObj.callback(500, "scripterror");
                    }
                }
            },

            abort:function() {
                this._callback(0, 1);
            }
        });

    io.setupTransport("script", ScriptTransport);

    return io;

}, {
        requires:['./base','./xhr']
    });

/**
 * jsonp transport based on script transport
 * @author: yiminghe@gmail.com
 */
KISSY.add("ajax/jsonp", function(S, io) {

    io.setupConfig({
            jsonp:"callback",
            jsonpCallback:function() {
                //不使用 now() ，极端情况下可能重复
                return S.guid("jsonp");
            }
        });

    io.on("start", function(e) {
        var xhr = e.xhr,c = xhr.config;
        if (c.dataType[0] == "jsonp") {
            var response,
                cJsonpCallback = c.jsonpCallback,
                jsonpCallback = S.isFunction(cJsonpCallback) ?
                    cJsonpCallback() :
                    cJsonpCallback,
                previous = window[ jsonpCallback ];

            c.url += ( /\?/.test(c.url) ? "&" : "?" ) + c.jsonp + "=" + jsonpCallback;

            // build temporary JSONP function
            window[jsonpCallback] = function(r) {
                //debugger
                // 使用数组，区别：故意调用了 jsonpCallback(undefined) 与 根本没有调用
                response = [r];
            };

            // cleanup whether success or failure
            xhr.on("complete", function() {
                window[ jsonpCallback ] = previous;
                if (previous === undefined) {
                    try {
                        delete window[ jsonpCallback ];
                    } catch(e) {
                    }
                } else if (response) {
                    // after io success handler called
                    // then call original existed jsonpcallback
                    previous(response[0]);
                }
            });

            xhr.converters = xhr.converters || {};
            xhr.converters.script = xhr.converters.script || {};

            // script -> jsonp ,jsonp need to see json not as script
            xhr.converters.script.json = function() {
                if (!response) {
                    S.error(" not call jsonpCallback : " + jsonpCallback)
                }
                return response[0];
            };

            c.dataType.length = 2;
            // 利用 script transport 发送 script 请求
            c.dataType[0] = 'script';
            c.dataType[1] = 'json';
        }
    });

    return io;
}, {
        requires:['./base']
    });

/**
 * form data  serialization util
 * @author: yiminghe@gmail.com
 */
KISSY.add("ajax/form-serializer", function(S, DOM) {
    var enc = encodeURIComponent;
    return {
        serialize:function(form) {
            form = DOM.get(form);
            var data = {};
            S.each(form.elements, function(e) {
                var d = e.disabled;
                //必须编码
                if (!d) {
                    data[e.name] = DOM.val(e);
                }
            });
            return S.param(data, undefined, undefined, false);
        }
    };
}, {
        requires:['dom']
    });

KISSY.add("ajax/form", function(S, io, DOM, FormSerializer) {

    io.on("start", function(e) {
        //debugger
        var xhr = e.xhr,
            c = xhr.config;
        // serialize form if needed
        if (c.form) {
            var form = DOM.get(c.form),
                enctype = form['encoding'] || form.enctype;
            // 上传有其他方法
            if (enctype.toLowerCase() != "multipart/form-data") {
                // when get need encode
                var formParam = FormSerializer.serialize(form);

                if (formParam) {
                    if (c.hasContent) {
                        // post 加到 data 中
                        c.data = c.data || "";
                        if (c.data) {
                            c.data += "&";
                        }
                        c.data += formParam;
                    } else {
                        // get 直接加到 url
                        c.url += ( /\?/.test(c.url) ? "&" : "?" ) + formParam;
                    }
                }
            } else {
                var d = c.dataType[0];
                if (d == "*") {
                    d = "text";
                }
                c.dataType.length = 2;
                c.dataType[0] = "iframe";
                c.dataType[1] = d;
            }
        }
    });

    return io;

}, {
        requires:['./base',"dom","./form-serializer"]
    });

/**
 * non-refresh upload file with form by iframe
 * @author: yiminghe@gmail.com
 */
KISSY.add("ajax/iframe-upload", function(S, DOM, Event, io) {

    var doc = document;
    // iframe 内的内容就是 body.innerText
    io.setupConfig({
            converters:{
                // iframe 到其他类型的转化和 text 一样
                iframe:io.getConfig().converters.text,
                text:{
                    iframe:function(text) {
                        return text;
                    }
                }}});

    function createIframe(xhr) {
        var id = S.guid("ajax-iframe");
        xhr.iframe = DOM.create("<iframe " +
            " id='" + id + "'" +
            // need name for target of form
            " name='" + id + "'" +
            " style='position:absolute;left:-9999px;top:-9999px;'/>");
        xhr.iframeId = id;
        DOM.prepend(xhr.iframe, doc.body || doc.documentElement);
    }

    function addDataToForm(data, form, serializeArray) {
        data = S.unparam(data);
        var ret = [];
        for (var d in data) {
            var vs = S.makeArray(data[d]);
            // 数组和原生一样对待，创建多个同名输入域
            for (var i = 0; i < vs.length; i++) {
                var e = doc.createElement("input");
                e.type = 'hidden';
                e.name = d + (serializeArray ? "[]" : "");
                e.value = vs[i];
                DOM.append(e, form);
                ret.push(e);
            }
        }
        return ret;
    }


    function removeFieldsFromData(fields) {
        DOM.remove(fields);
    }

    function IframeTransport(xhr) {
        this.xhr = xhr;
    }

    S.augment(IframeTransport, {
            send:function() {
                //debugger
                var xhr = this.xhr,
                    c = xhr.config,
                    fields,
                    form = DOM.get(c.form);

                this.attrs = {
                    target:DOM.attr(form, "target") || "",
                    action:DOM.attr(form, "action") || ""
                };
                this.form = form;

                createIframe(xhr);

                // set target to iframe to avoid main page refresh
                DOM.attr(form, {"target": xhr.iframeId,"action": c.url});

                if (c.data) {
                    fields = addDataToForm(c.data, form, c.serializeArray);
                }

                this.fields = fields;

                var iframe = xhr.iframe;

                Event.on(iframe, "load error", this._callback, this);

                form.submit();

            },

            _callback:function(event, abort) {
                //debugger
                var form = this.form,
                    xhr = this.xhr,
                    eventType = event.type,
                    iframe = xhr.iframe;

                DOM.attr(form, this.attrs);

                if (eventType == "load") {
                    var iframeDoc = iframe.contentWindow.document;
                    xhr.responseXML = iframeDoc;
                    xhr.responseText = DOM.text(iframeDoc.body);
                    xhr.callback(200, "success");
                } else if (eventType == 'error') {
                    xhr.callback(500, "error");
                }

                removeFieldsFromData(this.fields);


                Event.detach(iframe);

                setTimeout(function() {
                    // firefox will keep loading if not settimeout
                    DOM.remove(iframe);
                }, 30);

                // nullify to prevent memory leak?
                xhr.iframe = null;
            },

            abort:function() {
                this._callback(0, 1);
            }
        });

    io.setupTransport("iframe", IframeTransport);

    return io;

}, {
        requires:["dom","event","./base"]
    });

KISSY.add("ajax", function(S, io) {
    var undef = undefined;
    // some shortcut
    S.mix(io, {
        get: function(url, data, callback, dataType, _t) {
            // data 参数可省略
            if (S.isFunction(data)) {
                dataType = callback;
                callback = data;
                data = undef;
            }

            return io({
                type: _t || "get",
                url: url,
                data: data,
                success: callback,
                dataType: dataType
            });
        },

        post: function(url, data, callback, dataType) {
            if (S.isFunction(data)) {
                dataType = callback;
                callback = data;
                data = undef;
            }
            return io.get(url, data, callback, dataType, "post");
        },

        jsonp: function(url, data, callback) {
            if (S.isFunction(data)) {
                callback = data;
                data = undef;
            }
            return io.get(url, data, callback, "jsonp");
        },

        // 和 S.getScript 保持一致
        // 更好的 getScript 可以用
        /*
         io({
         dataType:'script'
         });
         */
        getScript:S.getScript,

        getJSON: function(url, data, callback) {
            if (S.isFunction(data)) {
                callback = data;
                data = undef;
            }
            return io.get(url, data, callback, "json");
        },

        upload:function(url, form, data, callback, dataType) {
            if (S.isFunction(data)) {
                dataType = callback;
                callback = data;
                data = undef;
            }
            return io({
                url:url,
                type:'post',
                dataType:dataType,
                form:form,
                data:data,
                success:callback
            });
        }
    });

    return io;
}, {
    requires:["ajax/base",
        "ajax/xhrobject",
        "ajax/xhr",
        "ajax/script",
        "ajax/jsonp",
        "ajax/form",
        "ajax/iframe-upload"]
});

/**
 * @module  Attribute
 * @author  yiminghe@gmail.com, lifesinger@gmail.com
 */
KISSY.add('base/attribute', function(S, undef) {

    /**
     * Attribute provides the implementation for any object
     * to deal with its attribute in aop ways.
     */
    function Attribute() {
        /**
         * attribute meta information
         {
         attrName: {
         getter: function,
         setter: function,
         value: v, // default value
         valueFn: function
         }
         }
         */
        this.__attrs = {};

        /**
         * attribute value
         {
         attrName: attrVal
         }
         */
        this.__attrVals = {};
    }

    S.augment(Attribute, {

        __getDefAttrs: function() {
            return S.clone(this.__attrs);
        },

        /**
         * Adds an attribute with the provided configuration to the host object.
         * The config supports the following properties:
         * {
         *     value: 'the default value',
         *     valueFn: function
         *     setter: function
         *     getter: function
         * }
         * @param {boolean} override whether override existing attribute config ,default true
         */
        addAttr: function(name, attrConfig, override) {
            var host = this;
            if (!host.__attrs[name]) {
                host.__attrs[name] = S.clone(attrConfig || {});
            } else {
                S.mix(host.__attrs[name], attrConfig, override);
            }
            return host;
        },

        /**
         * Checks if the given attribute has been added to the host.
         */
        hasAttr: function(name) {
            return name && this.__attrs.hasOwnProperty(name);
        },

        /**
         * Removes an attribute from the host object.
         */
        removeAttr: function(name) {
            var host = this;

            if (host.hasAttr(name)) {
                delete host.__attrs[name];
                delete host.__attrVals[name];
            }

            return host;
        },

        /**
         * Sets the value of an attribute.
         */
        set: function(name, value) {
            var host = this,
                prevVal = host.get(name);

            // if no change, just return
            if (prevVal === value) return;

            // check before event
            if (false === host.__fireAttrChange('before', name, prevVal, value)) return;

            // set it
            host.__set(name, value);

            // fire after event
            host.__fireAttrChange('after', name, prevVal, host.__attrVals[name]);

            return host;
        },

        __fireAttrChange: function(when, name, prevVal, newVal) {
            return this.fire(when + capitalFirst(name) + 'Change', {
                attrName: name,
                prevVal: prevVal,
                newVal: newVal
            });
        },

        /**
         * internal use, no event involved, just set.
         */
        __set: function(name, value) {
            var host = this,
                setValue,
                // if host does not have meta info corresponding to (name,value)
                // then register on demand in order to collect all data meta info
                // 一定要注册属性元数据，否则其他模块通过 _attrs 不能枚举到所有有效属性
                // 因为属性在声明注册前可以直接设置值
                attrConfig = host.__attrs[name] = host.__attrs[name] || {},
                setter = attrConfig['setter'];

            // if setter has effect
            if (setter) {
                setValue = setter.call(host, value);
            }
            if (setValue !== undef) {
                value = setValue;
            }

            // finally set
            host.__attrVals[name] = value;
        },

        /**
         * Gets the current value of the attribute.
         */
        get: function(name) {
            var host = this, attrConfig, getter, ret;

            attrConfig = host.__attrs[name];
            getter = attrConfig && attrConfig['getter'];

            // get user-set value or default value
            //user-set value takes privilege
            ret = name in host.__attrVals ?
                host.__attrVals[name] :
                host.__getDefAttrVal(name);

            // invoke getter for this attribute
            if (getter) ret = getter.call(host, ret);

            return ret;
        },

        __getDefAttrVal: function(name) {
            var host = this,
                attrConfig = host.__attrs[name],
                valFn, val;

            if (!attrConfig) return;

            if ((valFn = attrConfig.valueFn)) {
                val = valFn.call(host);
                if (val !== undef) {
                    attrConfig.value = val;
                }
                delete attrConfig.valueFn;
            }

            return attrConfig.value;
        },

        /**
         * Resets the value of an attribute.
         * @note just reset what addAttr set  (not what invoker set when call new Xx(cfg))
         */
        reset: function (name) {
            var host = this;

            if (host.hasAttr(name)) {
                // if attribute does not have default value, then set to undefined.
                return host.set(name, host.__getDefAttrVal(name));
            }

            // reset all
            for (name in host.__attrs) {
                if (host.hasAttr(name)) {
                    host.reset(name);
                }
            }

            return host;
        }
    });

    function capitalFirst(s) {
        s = s + '';
        return s.charAt(0).toUpperCase() + s.substring(1);
    }

    Attribute['__capitalFirst'] = capitalFirst;

    return Attribute;
});

/**
 * @module  Base
 * @author  yiminghe@gmail.com,lifesinger@gmail.com
 */
KISSY.add('base/base', function (S, Attribute, Event) {

    /*
     * Base for class-based component
     */
    function Base(config) {
        Attribute.call(this);
        var c = this.constructor;

        // define
        while (c) {
            addAttrs(this, c['ATTRS']);
            c = c.superclass ? c.superclass.constructor : null;
        }

        // initial
        initAttrs(this, config);
    }

    function addAttrs(host, attrs) {
        if (attrs) {
            for (var attr in attrs) {
                // 子类上的 ATTRS 配置优先
                if (attrs.hasOwnProperty(attr)) {
                    //父类后加，父类不覆盖子类的相同设置
                    host.addAttr(attr, attrs[attr], false);
                }
            }
        }
    }

    function initAttrs(host, config) {
        if (config) {
            for (var attr in config) {
                if (config.hasOwnProperty(attr)) {
                    //用户设置会调用 setter 的，但不会触发属性变化事件
                    host.__set(attr, config[attr]);
                }

            }
        }
    }

    S.augment(Base, Event.Target, Attribute);
    return Base;
}, {
        requires:["./attribute","event"]
    });

KISSY.add("base", function(S, Base) {
    return Base;
}, {
    requires:["base/base"]
});

/**
 * @module  cookie
 * @author  lifesinger@gmail.com
 */
KISSY.add('cookie/base', function(S) {

    var doc = document,
        encode = encodeURIComponent,
        decode = decodeURIComponent;


    function isNotEmptyString(val) {
        return S.isString(val) && val !== '';
    }

    return {

        /**
         * 获取 cookie 值
         * @return {string} 如果 name 不存在，返回 undefined
         */
        get: function(name) {
            var ret, m;

            if (isNotEmptyString(name)) {
                if ((m = String(doc.cookie).match(
                    new RegExp('(?:^| )' + name + '(?:(?:=([^;]*))|;|$)')))) {
                    ret = m[1] ? decode(m[1]) : '';
                }
            }
            return ret;
        },

        set: function(name, val, expires, domain, path, secure) {
            var text = String(encode(val)), date = expires;

            // 从当前时间开始，多少天后过期
            if (typeof date === 'number') {
                date = new Date();
                date.setTime(date.getTime() + expires * 86400000);
            }
            // expiration date
            if (date instanceof Date) {
                text += '; expires=' + date.toUTCString();
            }

            // domain
            if (isNotEmptyString(domain)) {
                text += '; domain=' + domain;
            }

            // path
            if (isNotEmptyString(path)) {
                text += '; path=' + path;
            }

            // secure
            if (secure) {
                text += '; secure';
            }

            //S.log(text);
            doc.cookie = name + '=' + text;
        },

        remove: function(name, domain, path, secure) {
            // 置空，并立刻过期
            this.set(name, '', -1, domain, path, secure);
        }
    };

});

/**
 * NOTES:
 *
 *  2010.04
 *   - get 方法要考虑 ie 下，
 *     值为空的 cookie 为 'test3; test3=3; test3tt=2; test1=t1test3; test3', 没有等于号。
 *     除了正则获取，还可以 split 字符串的方式来获取。
 *   - api 设计上，原本想借鉴 jQuery 的简明风格：S.cookie(name, ...), 但考虑到可扩展性，目前
 *     独立成静态工具类的方式更优。
 */

KISSY.add("cookie", function(S,C) {
    return C;
}, {
    requires:["cookie/base"]
});

KISSY.add("core", function(S, UA, DOM, Event, Node, JSON, Ajax, Anim, Base, Cookie) {
    Ajax.getScript=S.getScript;
    var re = {
        UA:UA,
        DOM:DOM,
        Event:Event,
        EventTarget:Event.Target,
        EventObject:Event.Object,
        Node:Node,
        NodeList:Node,
        JSON:JSON,
        Ajax:Ajax,
        IO:Ajax,
        ajax:Ajax,
        io:Ajax,
        jsonp:Ajax.jsonp,
        Anim:Anim,
        Easing:Anim.Easing,
        Base:Base,
        Cookie:Cookie,
        one:Node.one,
        all:Node.all,
        get:DOM.get,
        query:DOM.query
    };
    S.mix(S, re);
    return re;
}, {
    requires:[
        "ua",
        "dom",
        "event",
        "node",
        "json",
        "ajax",
        "anim",
        "base",
        "cookie"
    ]
});



KISSY.use('core');
