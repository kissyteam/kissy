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
D:\code\kissy_git\kissy\src\event\keycodes.js
D:\code\kissy_git\kissy\src\event\object.js
D:\code\kissy_git\kissy\src\event\base.js
D:\code\kissy_git\kissy\src\event\target.js
D:\code\kissy_git\kissy\src\event\focusin.js
D:\code\kissy_git\kissy\src\event\hashchange.js
D:\code\kissy_git\kissy\src\event\valuechange.js
D:\code\kissy_git\kissy\src\event\delegate.js
D:\code\kissy_git\kissy\src\event\mouseenter.js
D:\code\kissy_git\kissy\src\event\submit.js
D:\code\kissy_git\kissy\src\event\change.js
D:\code\kissy_git\kissy\src\event\mousewheel.js
D:\code\kissy_git\kissy\src\event.js
D:\code\kissy_git\kissy\src\node\base.js
D:\code\kissy_git\kissy\src\node\attach.js
D:\code\kissy_git\kissy\src\node\override.js
D:\code\kissy_git\kissy\src\anim\easing.js
D:\code\kissy_git\kissy\src\anim\manager.js
D:\code\kissy_git\kissy\src\anim\fx.js
D:\code\kissy_git\kissy\src\anim\queue.js
D:\code\kissy_git\kissy\src\anim\base.js
D:\code\kissy_git\kissy\src\anim\color.js
D:\code\kissy_git\kissy\src\anim.js
D:\code\kissy_git\kissy\src\node\anim.js
D:\code\kissy_git\kissy\src\node.js
D:\code\kissy_git\kissy\src\json\json2.js
D:\code\kissy_git\kissy\src\json.js
D:\code\kissy_git\kissy\src\ajax\form-serializer.js
D:\code\kissy_git\kissy\src\ajax\xhrobject.js
D:\code\kissy_git\kissy\src\ajax\base.js
D:\code\kissy_git\kissy\src\ajax\xhrbase.js
D:\code\kissy_git\kissy\src\ajax\subdomain.js
D:\code\kissy_git\kissy\src\ajax\xdr.js
D:\code\kissy_git\kissy\src\ajax\xhr.js
D:\code\kissy_git\kissy\src\ajax\script.js
D:\code\kissy_git\kissy\src\ajax\jsonp.js
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
        IE_DETECT_RANGE = [6, 9], v, end,
        VERSION_PLACEHOLDER = '{{version}}',
        IE_DETECT_TPL = '<!--[if IE ' + VERSION_PLACEHOLDER + ']><s></s><![endif]-->',
        div = document.createElement('div'), s,
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

    // try to use IE-Conditional-Comment detect IE more accurately
    // IE10 doesn't support this method, @ref: http://blogs.msdn.com/b/ie/archive/2011/07/06/html5-parsing-in-ie10.aspx
    div.innerHTML = IE_DETECT_TPL.replace(VERSION_PLACEHOLDER, '');
    s = div.getElementsByTagName('s');

    if (s.length > 0) {

        shell = 'ie';
        o[core = 'trident'] = 0.1; // Trident detected, look for revision

        // Get the Trident's accurate version
        if ((m = ua.match(/Trident\/([\d.]*)/)) && m[1]) {
            o[core] = numberify(m[1]);
        }

        // Detect the accurate version
        // 注意：
        //  o.shell = ie, 表示外壳是 ie
        //  但 o.ie = 7, 并不代表外壳是 ie7, 还有可能是 ie8 的兼容模式
        //  对于 ie8 的兼容模式，还要通过 documentMode 去判断。但此处不能让 o.ie = 8, 否则
        //  很多脚本判断会失误。因为 ie8 的兼容模式表现行为和 ie7 相同，而不是和 ie8 相同
        for (v = IE_DETECT_RANGE[0],end = IE_DETECT_RANGE[1]; v <= end; v++) {
            div.innerHTML = IE_DETECT_TPL.replace(VERSION_PLACEHOLDER, v);
            if (s.length > 0) {
                o[shell] = v;
                break;
            }
        }

    } else {

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
                    else if ((m = ua.match(/Opera Mobi[^;]*/)) && m) {
                        o[MOBILE] = m[0];
                    }
                }

                // NOT WebKit or Presto
            } else {
                // MSIE
                // 由于最开始已经使用了 IE 条件注释判断，因此落到这里的唯一可能性只有 IE10+
                if ((m = ua.match(/MSIE\s([^;]*)/)) && m[1]) {
                    o[core = 'trident'] = 0.1; // Trident detected, look for revision
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
    }

    o.core = core;
    o.shell = shell;
    o._numberify = numberify;
    return o;
});

/**
 * NOTES:
 *
 * 2011.11.08
 *  - ie < 10 使用条件注释判断内核，更精确 by gonghaocn@gmail.com
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
 * @author  yiminghe@gmail.com,lifesinger@gmail.com
 */
KISSY.add('dom/base', function(S, UA, undefined) {

    function nodeTypeIs(node, val) {
        return node && node.nodeType === val;
    }


    var NODE_TYPE = {
        /**
         * enumeration of dom node type
         * @type Number
         */
        ELEMENT_NODE : 1,
        ATTRIBUTE_NODE : 2,
        TEXT_NODE:3,
        CDATA_SECTION_NODE : 4,
        ENTITY_REFERENCE_NODE: 5,
        ENTITY_NODE : 6,
        PROCESSING_INSTRUCTION_NODE :7,
        COMMENT_NODE : 8,
        DOCUMENT_NODE : 9,
        DOCUMENT_TYPE_NODE : 10,
        DOCUMENT_FRAGMENT_NODE : 11,
        NOTATION_NODE : 12
    };
    var DOM = {

        _isCustomDomain :function (win) {
            win = win || window;
            var domain = win.document.domain,
                hostname = win.location.hostname;
            return domain != hostname &&
                domain != ( '[' + hostname + ']' );	// IPv6 IP support
        },

        _genEmptyIframeSrc:function(win) {
            win = win || window;
            if (UA['ie'] && DOM._isCustomDomain(win)) {
                return  'javascript:void(function(){' + encodeURIComponent("" +
                    "document.open();" +
                    "document.domain='" +
                    win.document.domain
                    + "';" +
                    "document.close();") + "}())";
            }
        },

        _NODE_TYPE:NODE_TYPE,


        /**
         * 是不是 element node
         */
        _isElementNode: function(elem) {
            return nodeTypeIs(elem, DOM.ELEMENT_NODE);
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
                nodeTypeIs(elem, DOM.DOCUMENT_NODE) ?
                    elem.defaultView || elem.parentWindow :
                    (elem === undefined || elem === null) ?
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
        },

        _nodeName:function(e, name) {
            return e && e.nodeName.toLowerCase() === name.toLowerCase();
        }
    };

    S.mix(DOM, NODE_TYPE);

    return DOM;

}, {
    requires:['ua']
});

/**
 * 2011-08
 *  - 添加键盘枚举值，方便依赖程序清晰
 */

/**
 * @module  dom-attr
 * @author  yiminghe@gmail.com,lifesinger@gmail.com
 */
KISSY.add('dom/attr', function(S, DOM, UA, undefined) {

        var doc = document,
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
                val: 1,
                css: 1,
                html: 1,
                text: 1,
                data: 1,
                width: 1,
                height: 1,
                offset: 1,
                scrollTop:1,
                scrollLeft:1
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

        function isTextNode(elem) {
            return DOM._nodeTypeIs(elem, DOM.TEXT_NODE);
        }

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
                    } else {
                        try {
                            var attr = elem.ownerDocument.createAttribute(name);
                            attr.value = value;
                            elem.setAttributeNode(attr);
                        }
                        catch (e) {
                            // It's a real failure only if setAttribute also fails.
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
                    elems.each(function(elem) {
                        if (hook && hook.set) {
                            hook.set(elem, value, name);
                        } else {
                            elem[ name ] = value;
                        }
                    });
                } else {
                    if (elems.length) {
                        return getProp(elems[0], name);
                    }
                }
            },

            /**
             * 是否其中一个元素包含指定 property
             * @param selector
             * @param name
             */
            hasProp:function(selector, name) {
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
                        S.log("delete el property error : ");
                        S.log(e);
                    }
                });
            },

            /**
             * Gets the value of an attribute for the first element in the set of matched elements or
             * Sets an attribute for the set of matched elements.
             */
            attr:function(selector, name, val, pass) {
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
                // suports hash
                if (S.isPlainObject(name)) {
                    pass = val;
                    for (var k in name) {
                        DOM.attr(selector, k, name[k], pass);
                    }
                    return;
                }

                if (!(name = S.trim(name))) {
                    return;
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
                var els = DOM.query(selector);
                if (val === undefined) {
                    return DOM.__attr(els[0], name);
                } else {
                    els.each(function(el) {
                        DOM.__attr(el, name, val);
                    });
                }
            },

            __attr:function(el, name, val) {
                if (!isElementNode(el)) {
                    return;
                }
                // custom attrs
                name = attrFix[name] || name;

                var attrNormalizer,
                    ret;

                // browsers index elements by id/name on forms, give priority to attributes.
                if (nodeName(el, "form")) {
                    attrNormalizer = attrNodeHook;
                }
                else if (rboolean.test(name)) {
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

                    if (attrNormalizer && attrNormalizer.get) {
                        return attrNormalizer.get(el, name);
                    }

                    ret = el.getAttribute(name);

                    // standard browser non-existing attribute return null
                    // ie<8 will return undefined , because it return property
                    // so norm to undefined
                    return ret === null ? undefined : ret;
                } else {

                    if (attrNormalizer && attrNormalizer.set) {
                        attrNormalizer.set(el, val, name);
                    } else {
                        // convert the value to a string (all browsers do this but IE)
                        el.setAttribute(name, EMPTY + val);
                    }
                }
            },

            /**
             * Removes the attribute of the matched elements.
             */
            removeAttr: function(selector, name) {
                name = name.toLowerCase();
                name = attrFix[name] || name;
                DOM.query(selector).each(function(el) {
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

            /**
             * 是否其中一个元素包含指定属性
             */
            hasAttr: oldIE ?
                function(selector, name) {
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
                function(selector, name) {
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
                            S.isNullOrUndefined(ret) ? "" : ret;
                    }

                    return;
                }

                DOM.query(selector).each(function(elem) {

                    if (elem.nodeType !== 1) {
                        return;
                    }

                    var val = value;

                    // Treat null/undefined as ""; convert numbers to string
                    if (S.isNullOrUndefined(val)) {
                        val = "";
                    } else if (typeof val === "number") {
                        val += "";
                    } else if (S.isArray(val)) {
                        val = S.map(val, function (value) {
                            return S.isNullOrUndefined(val) ? "" : value + "";
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
                    DOM.query(selector).each(function(el) {
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

        __hasClass:function(el, cls) {
            var className = el.className;
            if (className) {
                className = norm(className);
                return className.indexOf(SPACE + cls + SPACE) > -1;
            } else {
                return false;
            }
        },

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
                    if (ret) {
                        return true;
                    }
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
            len = elems.length,
            tmp = value.split(REG_SPLIT),
            elem,
            ret;

        var classNames = [];
        for (var i = 0; i < tmp.length; i++) {
            var t = S.trim(tmp[i]);
            if (t) {
                classNames.push(t);
            }
        }
        for (i = 0; i < len; i++) {
            elem = elems[i];
            if (DOM._isElementNode(elem)) {
                ret = fn(elem, classNames, classNames.length);
                if (ret !== undefined) {
                    return ret;
                }
            }
        }

        if (resultIsBool) {
            return false;
        }
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
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add('dom/create', function(S, DOM, UA, undefined) {

        var doc = document,
            ie = UA['ie'],
            nodeTypeIs = DOM._nodeTypeIs,
            isElementNode = DOM._isElementNode,
            isString = S.isString,
            DIV = 'div',
            PARENT_NODE = 'parentNode',
            DEFAULT_DIV = doc.createElement(DIV),
            rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
            RE_TAG = /<([\w:]+)/,
            rleadingWhitespace = /^\s+/,
            lostLeadingWhitespace = ie && ie < 9,
            rhtml = /<|&#?\w+;/,
            RE_SIMPLE_TAG = /^<(\w+)\s*\/?>(?:<\/\1>)?$/;

        // help compression
        function getElementsByTagName(el, tag) {
            return el.getElementsByTagName(tag);
        }

        function cleanData(els) {
            var Event = S.require("event");
            if (Event) {
                Event.detach(els);
            }
            DOM.removeData(els);
        }

        S.mix(DOM, {

            /**
             * Creates a new HTMLElement using the provided html string.
             */
            create: function(html, props, ownerDoc, _trim/*internal*/) {

                if (isElementNode(html)
                    || nodeTypeIs(html, DOM.TEXT_NODE)) {
                    return DOM.clone(html);
                }
                var ret = null;
                if (!isString(html)) {
                    return ret;
                }
                if (_trim === undefined) {
                    _trim = true;
                }

                if (_trim) {
                    html = S.trim(html);
                }

                if (!html) {
                    return ret;
                }

                var creators = DOM._creators,
                    holder,
                    whitespaceMatch,
                    context = ownerDoc || doc,
                    m,
                    tag = DIV,
                    k,
                    nodes;

                if (!rhtml.test(html)) {
                    ret = context.createTextNode(html);
                }
                // 简单 tag, 比如 DOM.create('<p>')
                else if ((m = RE_SIMPLE_TAG.exec(html))) {
                    ret = context.createElement(m[1]);
                }
                // 复杂情况，比如 DOM.create('<img src="sprite.png" />')
                else {
                    // Fix "XHTML"-style tags in all browsers
                    html = html.replace(rxhtmlTag, "<$1><" + "/$2>");

                    if ((m = RE_TAG.exec(html)) && (k = m[1])) {
                        tag = k.toLowerCase();
                    }

                    holder = (creators[tag] || creators[DIV])(html, context);
                    // ie 把前缀空白吃掉了
                    if (lostLeadingWhitespace && (whitespaceMatch = html.match(rleadingWhitespace))) {
                        holder.insertBefore(context.createTextNode(whitespaceMatch[0]), holder.firstChild);
                    }
                    nodes = holder.childNodes;

                    if (nodes.length === 1) {
                        // return single node, breaking parentNode ref from "fragment"
                        ret = nodes[0][PARENT_NODE].removeChild(nodes[0]);
                    }
                    else if (nodes.length) {
                        // return multiple nodes as a fragment
                        ret = nl2frag(nodes, context);
                    } else {
                        S.error(html + " : create node error");
                    }
                }

                return attachProps(ret, props);
            },

            _creators: {
                div: function(html, ownerDoc) {
                    var frag = ownerDoc && ownerDoc != doc ? ownerDoc.createElement(DIV) : DEFAULT_DIV;
                    // html 为 <style></style> 时不行，必须有其他元素？
                    frag['innerHTML'] = "m<div>" + html + "<" + "/div>";
                    return frag.lastChild;
                }
            },

            /**
             * Gets/Sets the HTML contents of the HTMLElement.
             * @param {Boolean} loadScripts (optional) True to look for and process scripts (defaults to false).
             * @param {Function} callback (optional) For async script loading you can be notified when the update completes.
             */
            html: function(selector, val, loadScripts, callback) {
                // supports css selector/Node/NodeList
                var els = DOM.query(selector),el = els[0];
                if (!el) {
                    return
                }
                // getter
                if (val === undefined) {
                    // only gets value on the first of element nodes
                    if (isElementNode(el)) {
                        return el['innerHTML'];
                    } else {
                        return null;
                    }
                }
                // setter
                else {

                    var success = false;
                    val += "";

                    // faster
                    if (! val.match(/<(?:script|style)/i) &&
                        (!lostLeadingWhitespace || !val.match(rleadingWhitespace)) &&
                        !creatorsMap[ (val.match(RE_TAG) || ["",""])[1].toLowerCase() ]) {

                        try {
                            els.each(function(elem) {
                                if (isElementNode(elem)) {
                                    cleanData(getElementsByTagName(elem, "*"));
                                    elem.innerHTML = val;
                                }
                            });
                            success = true;
                        } catch(e) {
                        }

                    }

                    if (!success) {
                        val = DOM.create(val, 0, el.ownerDocument, false);
                        els.each(function(elem) {
                            if (isElementNode(elem)) {
                                DOM.empty(elem);
                                DOM.append(val, elem, loadScripts);
                            }
                        });
                    }
                    callback && callback();
                }
            },

            /**
             * Remove the set of matched elements from the DOM.
             * 不要使用 innerHTML='' 来清除元素，可能会造成内存泄露，要使用 DOM.remove()
             * @param selector 选择器或元素集合
             * @param {Boolean} keepData 删除元素时是否保留其上的数据，用于离线操作，提高性能
             */
            remove: function(selector, keepData) {
                DOM.query(selector).each(function(el) {
                    if (!keepData && isElementNode(el)) {
                        // 清楚数据
                        var elChildren = getElementsByTagName(el, "*");
                        cleanData(elChildren);
                        cleanData(el);
                    }

                    if (el.parentNode) {
                        el.parentNode.removeChild(el);
                    }
                });
            },

            /**
             * clone node across browsers for the first node in selector
             * @param selector 选择器或单个元素
             * @param {Boolean} withDataAndEvent 复制节点是否包括和源节点同样的数据和事件
             * @param {Boolean} deepWithDataAndEvent 复制节点的子孙节点是否包括和源节点子孙节点同样的数据和事件
             * @refer https://developer.mozilla.org/En/DOM/Node.cloneNode
             * @returns 复制后的节点
             */
            clone:function(selector, deep, withDataAndEvent, deepWithDataAndEvent) {
                var elem = DOM.get(selector);

                if (!elem) {
                    return null;
                }

                var clone = elem.cloneNode(deep);

                if (isElementNode(elem) ||
                    nodeTypeIs(elem, DOM.DOCUMENT_FRAGMENT_NODE)) {
                    // IE copies events bound via attachEvent when using cloneNode.
                    // Calling detachEvent on the clone will also remove the events
                    // from the original. In order to get around this, we use some
                    // proprietary methods to clear the events. Thanks to MooTools
                    // guys for this hotness.
                    if (isElementNode(elem)) {
                        fixAttributes(elem, clone);
                    }

                    if (deep) {
                        processAll(fixAttributes, elem, clone);
                    }
                }
                // runtime 获得事件模块
                if (withDataAndEvent) {
                    cloneWidthDataAndEvent(elem, clone);
                    if (deep && deepWithDataAndEvent) {
                        processAll(cloneWidthDataAndEvent, elem, clone);
                    }
                }
                return clone;
            },

            empty:function(selector) {
                DOM.query(selector).each(function(el) {
                    DOM.remove(el.childNodes);
                });
            },

            _nl2frag:nl2frag
        });

        function processAll(fn, elem, clone) {
            if (nodeTypeIs(elem, DOM.DOCUMENT_FRAGMENT_NODE)) {
                var eCs = elem.childNodes,
                    cloneCs = clone.childNodes,
                    fIndex = 0;
                while (eCs[fIndex]) {
                    if (cloneCs[fIndex]) {
                        processAll(fn, eCs[fIndex], cloneCs[fIndex]);
                    }
                    fIndex++;
                }
            } else if (isElementNode(elem)) {
                var elemChildren = getElementsByTagName(elem, "*"),
                    cloneChildren = getElementsByTagName(clone, "*"),
                    cIndex = 0;
                while (elemChildren[cIndex]) {
                    if (cloneChildren[cIndex]) {
                        fn(elemChildren[cIndex], cloneChildren[cIndex]);
                    }
                    cIndex++;
                }
            }
        }


        // 克隆除了事件的 data
        function cloneWidthDataAndEvent(src, dest) {
            var Event = S.require('event');

            if (isElementNode(dest) && !DOM.hasData(src)) {
                return;
            }

            var srcData = DOM.data(src);

            // 浅克隆，data 也放在克隆节点上
            for (var d in srcData) {
                DOM.data(dest, d, srcData[d]);
            }

            // 事件要特殊点
            if (Event) {
                // _removeData 不需要？刚克隆出来本来就没
                Event._removeData(dest);
                Event._clone(src, dest);
            }
        }

        // wierd ie cloneNode fix from jq
        function fixAttributes(src, dest) {

            // clearAttributes removes the attributes, which we don't want,
            // but also removes the attachEvent events, which we *do* want
            if (dest.clearAttributes) {
                dest.clearAttributes();
            }

            // mergeAttributes, in contrast, only merges back on the
            // original attributes, not the events
            if (dest.mergeAttributes) {
                dest.mergeAttributes(src);
            }

            var nodeName = dest.nodeName.toLowerCase(),
                srcChilds = src.childNodes;

            // IE6-8 fail to clone children inside object elements that use
            // the proprietary classid attribute value (rather than the type
            // attribute) to identify the type of content to display
            if (nodeName === "object" && !dest.childNodes.length) {
                for (var i = 0; i < srcChilds.length; i++) {
                    dest.appendChild(srcChilds[i].cloneNode(true));
                }
                // dest.outerHTML = src.outerHTML;
            } else if (nodeName === "input" && (src.type === "checkbox" || src.type === "radio")) {
                // IE6-8 fails to persist the checked state of a cloned checkbox
                // or radio button. Worse, IE6-7 fail to give the cloned element
                // a checked appearance if the defaultChecked value isn't also set
                if (src.checked) {
                    dest['defaultChecked'] = dest.checked = src.checked;
                }

                // IE6-7 get confused and end up setting the value of a cloned
                // checkbox/radio button to an empty string instead of "on"
                if (dest.value !== src.value) {
                    dest.value = src.value;
                }

                // IE6-8 fails to return the selected option to the default selected
                // state when cloning options
            } else if (nodeName === "option") {
                dest.selected = src.defaultSelected;
                // IE6-8 fails to set the defaultValue to the correct value when
                // cloning other types of input fields
            } else if (nodeName === "input" || nodeName === "textarea") {
                dest.defaultValue = src.defaultValue;
            }

            // Event data gets referenced instead of copied if the expando
            // gets copied too
            // 自定义 data 根据参数特殊处理，expando 只是个用于引用的属性
            dest.removeAttribute(DOM.__EXPANDO);
        }

        // 添加成员到元素中
        function attachProps(elem, props) {
            if (S.isPlainObject(props)) {
                if (isElementNode(elem)) {
                    DOM.attr(elem, props, true);
                }
                // document fragment
                else if (nodeTypeIs(elem, DOM.DOCUMENT_FRAGMENT_NODE)) {
                    DOM.attr(elem.childNodes, props, true);
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
                nodes = S.makeArray(nodes);
                for (i = 0,len = nodes.length; i < len; i++) {
                    ret.appendChild(nodes[i]);
                }
            }
            else {
                S.log('Unable to convert ' + nodes + ' to fragment.');
            }
            return ret;
        }

        // only for gecko and ie
        // 2010-10-22: 发现 chrome 也与 gecko 的处理一致了
        //if (ie || UA['gecko'] || UA['webkit']) {
        // 定义 creators, 处理浏览器兼容
        var creators = DOM._creators,
            create = DOM.create,
            TABLE_OPEN = '<table>',
            TABLE_CLOSE = '<' + '/table>',
            RE_TBODY = /(?:\/(?:thead|tfoot|caption|col|colgroup)>)+\s*<tbody/,
            creatorsMap = {
                option: 'select',
                optgroup:'select',
                area:'map',
                thead:'table',
                td: 'tr',
                th:'tr',
                tr: 'tbody',
                tbody: 'table',
                tfoot:'table',
                caption:'table',
                colgroup:'table',
                col: 'colgroup',
                legend: 'fieldset' // ie 支持，但 gecko 不支持
            };

        for (var p in creatorsMap) {
            (function(tag) {
                creators[p] = function(html, ownerDoc) {
                    return create('<' + tag + '>' + html + '<' + '/' + tag + '>', null, ownerDoc);
                }
            })(creatorsMap[p]);
        }


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

        // fix table elements
        S.mix(creators, {
            thead: creators.tbody,
            tfoot: creators.tbody,
            caption: creators.tbody,
            colgroup: creators.tbody
        });
        //}
        return DOM;
    },
    {
        requires:["./base","ua"]
    });

/**
 * 2011-10-13
 * empty , html refactor
 *
 * 2011-08-22
 * clone 实现，参考 jq
 *
 * 2011-08
 *  remove 需要对子孙节点以及自身清除事件以及自定义 data
 *  create 修改，支持 <style></style> ie 下直接创建
 *  TODO: jquery clone ,clean 实现
 *
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
            // 只判断当前窗口，iframe 窗口内数据直接放入全局变量
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
            if (!cache) {
                return;
            }
            if (name !== undefined) {
                delete cache[name];
                if (S.isEmptyObject(cache)) {
                    objectOps.removeData(ob, undefined);
                }
            } else {
                try {
                    // ob maybe window in iframe
                    // ie will throw error
                    delete ob[EXPANDO];
                } catch(e) {
                    ob[EXPANDO] = null;
                }
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
                    //S.log("delete expando error : ");
                    //S.log(e);
                }
                if (elem.removeAttribute) {
                    elem.removeAttribute(EXPANDO);
                }
            }
        }
    };


    S.mix(DOM, {

        __EXPANDO:EXPANDO,

        /**
         * whether any node has data
         */
        hasData:function(selector, name) {
            var ret = false,elems = DOM.query(selector);
            for (var i = 0; i < elems.length; i++) {
                var elem = elems[i];
                if (checkIsNode(elem)) {
                    ret = domOps.hasData(elem, name);
                } else {
                    ret = objectOps.hasData(elem, name);
                }
                if (ret) {
                    return ret;
                }
            }
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
                } else if (elem) {
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
 * @author  yiminghe@gmail.com,lifesinger@gmail.com
 */
KISSY.add('dom/insertion', function(S, UA, DOM) {

    var PARENT_NODE = 'parentNode',
        rformEls = /^(?:button|input|object|select|textarea)$/i,
        nodeName = DOM._nodeName,
        makeArray = S.makeArray,
        _isElementNode = DOM._isElementNode,
        NEXT_SIBLING = 'nextSibling';

    /**
     ie 6,7 lose checked status when append to dom
     var c=S.all("<input />");
     c.attr("type","radio");
     c.attr("checked",true);
     S.all("#t").append(c);
     alert(c[0].checked);
     */
    function fixChecked(ret) {
        for (var i = 0; i < ret.length; i++) {
            var el = ret[i];
            if (el.nodeType == DOM.DOCUMENT_FRAGMENT_NODE) {
                fixChecked(el.childNodes);
            } else if (nodeName(el, "input")) {
                fixCheckedInternal(el);
            } else if (_isElementNode(el)) {
                var cs = el.getElementsByTagName("input");
                for (var j = 0; j < cs.length; j++) {
                    fixChecked(cs[j]);
                }
            }
        }
    }

    function fixCheckedInternal(el) {
        if (el.type === "checkbox" || el.type === "radio") {
            // after insert , in ie6/7 checked is decided by defaultChecked !
            el.defaultChecked = el.checked;
        }
    }

    var rscriptType = /\/(java|ecma)script/i;

    function isJs(el) {
        return !el.type || rscriptType.test(el.type);
    }

    // extract script nodes and execute alone later
    function filterScripts(nodes, scripts) {
        var ret = [];
        for (var i = 0; nodes[i]; i++) {
            var el = nodes[i],nodeName = el.nodeName.toLowerCase();
            if (el.nodeType == DOM.DOCUMENT_FRAGMENT_NODE) {
                ret.push.apply(ret, filterScripts(makeArray(el.childNodes), scripts));
            } else if (nodeName === "script" && isJs(el)) {
                if (scripts) {
                    scripts.push(el.parentNode ? el.parentNode.removeChild(el) : el);
                }
            } else {
                if (_isElementNode(el) &&
                    // ie checkbox getElementsByTagName 后造成 checked 丢失
                    !rformEls.test(nodeName)) {
                    var tmp = [],ss = el.getElementsByTagName("script");
                    for (var j = 0; j < ss.length; j++) {
                        if (isJs(ss[j])) {
                            tmp.push(ss[j]);
                        }
                    }
                    nodes.splice.apply(nodes, [i + 1,0].concat(tmp));
                }
                ret.push(el);
            }
        }
        return ret;
    }

    // execute script
    function evalScript(el) {
        if (el.src) {
            S.getScript(el.src);
        } else {
            var code = S.trim(el.text || el.textContent || el.innerHTML || "");
            if (code) {
                S.globalEval(code);
            }
        }
    }

    // fragment is easier than nodelist
    function insertion(newNodes, refNodes, fn, scripts) {
        newNodes = DOM.query(newNodes);

        if (scripts) {
            scripts = [];
        }

        // filter script nodes ,process script separately if needed
        newNodes = filterScripts(newNodes, scripts);

        // Resets defaultChecked for any radios and checkboxes
        // about to be appended to the DOM in IE 6/7
        if (UA['ie'] < 8) {
            fixChecked(newNodes);
        }
        refNodes = DOM.query(refNodes);
        var newNodesLength = newNodes.length,
            refNodesLength = refNodes.length;
        if ((!newNodesLength &&
            (!scripts || !scripts.length)) ||
            !refNodesLength) {
            return;
        }
        // fragment 插入速度快点
        var newNode = DOM._nl2frag(newNodes),
            clonedNode;
        //fragment 一旦插入里面就空了，先复制下
        if (refNodesLength > 1) {
            clonedNode = DOM.clone(newNode, true);
        }
        for (var i = 0; i < refNodesLength; i++) {
            var refNode = refNodes[i];
            if (newNodesLength) {
                //refNodes 超过一个，clone
                var node = i > 0 ? DOM.clone(clonedNode, true) : newNode;
                fn(node, refNode);
            }
            if (scripts) {
                S.each(scripts, evalScript);
            }
        }
    }

    // loadScripts default to false to prevent xss
    S.mix(DOM, {

        /**
         * Inserts the new node as the previous sibling of the reference node.
         */
        insertBefore: function(newNodes, refNodes, loadScripts) {
            insertion(newNodes, refNodes, function(newNode, refNode) {
                if (refNode[PARENT_NODE]) {
                    refNode[PARENT_NODE].insertBefore(newNode, refNode);
                }
            }, loadScripts);
        },

        /**
         * Inserts the new node as the next sibling of the reference node.
         */
        insertAfter: function(newNodes, refNodes, loadScripts) {
            insertion(newNodes, refNodes, function(newNode, refNode) {
                if (refNode[PARENT_NODE]) {
                    refNode[PARENT_NODE].insertBefore(newNode, refNode[NEXT_SIBLING]);
                }
            }, loadScripts);
        },

        /**
         * Inserts the new node as the last child.
         */
        appendTo: function(newNodes, parents, loadScripts) {
            insertion(newNodes, parents, function(newNode, parent) {
                parent.appendChild(newNode);
            }, loadScripts);
        },

        /**
         * Inserts the new node as the first child.
         */
        prependTo:function(newNodes, parents, loadScripts) {
            insertion(newNodes, parents, function(newNode, parent) {
                parent.insertBefore(newNode, parent.firstChild);
            }, loadScripts);
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
    requires:["ua","./create"]
});

/**
 * 2011-05-25
 *  - 承玉：参考 jquery 处理多对多的情形 :http://api.jquery.com/append/
 *      DOM.append(".multi1",".multi2");
 *
 */

/**
 * @module  dom-offset
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add('dom/offset', function(S, DOM, UA, undefined) {

    var win = window,
        doc = document,
        isIE = UA['ie'],
        docElem = doc.documentElement,
        isElementNode = DOM._isElementNode,
        nodeTypeIs = DOM._nodeTypeIs,
        getWin = DOM._getWin,
        CSS1Compat = "CSS1Compat",
        compatMode = "compatMode",
        isStrict = doc[compatMode] === CSS1Compat,
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
        isNumber = S.isNumber,
        SCROLL_LEFT = SCROLL + 'Left',
        SCROLL_TOP = SCROLL + 'Top',
        GET_BOUNDING_CLIENT_RECT = 'getBoundingClientRect';

//    ownerDocument 的判断不保证 elem 没有游离在 document 之外（比如 fragment）
//    function inDocument(elem) {
//        if (!elem) {
//            return 0;
//        }
//        var doc = elem.ownerDocument;
//        if (!doc) {
//            return 0;
//        }
//        var html = doc.documentElement;
//        if (html === elem) {
//            return true;
//        }
//        else if (DOM.__contains(html, elem)) {
//            return true;
//        }
//        return false;
//    }

    S.mix(DOM, {


        /**
         * Gets the current coordinates of the element, relative to the document.
         * @param relativeWin The window to measure relative to. If relativeWin
         *     is not in the ancestor frame chain of the element, we measure relative to
         *     the top-most window.
         */
        offset: function(selector, val, relativeWin) {
            // getter
            if (val === undefined) {
                var elem = DOM.get(selector),ret;
                if (elem) {
                    ret = getOffset(elem, relativeWin);
                }
                return ret;
            }
            // setter
            DOM.query(selector).each(function(elem) {
                setOffset(elem, val);
            });
        },

        /**
         * Makes elem visible in the container
         * @param elem
         * @param container
         * @param top
         * @param hscroll
         * @param {Boolean} auto whether adjust element automatically
         *                       (it only scrollIntoView when element is out of view)
         * @refer http://www.w3.org/TR/2009/WD-html5-20090423/editing.html#scrollIntoView
         *        http://www.sencha.com/deploy/dev/docs/source/Element.scroll-more.html#scrollIntoView
         *        http://yiminghe.javaeye.com/blog/390732
         */
        scrollIntoView: function(elem, container, top, hscroll, auto) {
            if (!(elem = DOM.get(elem))) {
                return;
            }

            if (container) {
                container = DOM.get(container);
            }

            if (!container) {
                container = elem.ownerDocument;
            }

            if (auto !== true) {
                hscroll = hscroll === undefined ? true : !!hscroll;
                top = top === undefined ? true : !!top;
            }

            // document 归一化到 window
            if (nodeTypeIs(container, DOM.DOCUMENT_NODE)) {
                container = getWin(container);
            }

            var isWin = !!getWin(container),
                elemOffset = DOM.offset(elem),
                eh = DOM.outerHeight(elem),
                ew = DOM.outerWidth(elem),
                containerOffset,
                ch,
                cw,
                containerScroll,
                diffTop,
                diffBottom,
                win,
                winScroll,
                ww,
                wh;

            if (isWin) {
                win = container;
                wh = DOM.height(win);
                ww = DOM.width(win);
                winScroll = {
                    left:DOM.scrollLeft(win),
                    top:DOM.scrollTop(win)
                };
                // elem 相对 container 可视视窗的距离
                diffTop = {
                    left: elemOffset[LEFT] - winScroll[LEFT],
                    top: elemOffset[TOP] - winScroll[TOP]
                };
                diffBottom = {
                    left:  elemOffset[LEFT] + ew - (winScroll[LEFT] + ww),
                    top:elemOffset[TOP] + eh - (winScroll[TOP] + wh)
                };
                containerScroll = winScroll;
            }
            else {
                containerOffset = DOM.offset(container);
                ch = container.clientHeight;
                cw = container.clientWidth;
                containerScroll = {
                    left:DOM.scrollLeft(container),
                    top:DOM.scrollTop(container)
                };
                // elem 相对 container 可视视窗的距离
                // 注意边框 , offset 是边框到根节点
                diffTop = {
                    left: elemOffset[LEFT] - containerOffset[LEFT] -
                        (PARSEINT(DOM.css(container, 'borderLeftWidth')) || 0),
                    top: elemOffset[TOP] - containerOffset[TOP] -
                        (PARSEINT(DOM.css(container, 'borderTopWidth')) || 0)
                };
                diffBottom = {
                    left:  elemOffset[LEFT] + ew -
                        (containerOffset[LEFT] + cw +
                            (PARSEINT(DOM.css(container, 'borderRightWidth')) || 0)) ,
                    top:elemOffset[TOP] + eh -
                        (containerOffset[TOP] + ch +
                            (PARSEINT(DOM.css(container, 'borderBottomWidth')) || 0))
                };
            }

            if (diffTop.top < 0 || diffBottom.top > 0) {
                // 强制向上
                if (top === true) {
                    DOM.scrollTop(container, containerScroll.top + diffTop.top);
                } else if (top === false) {
                    DOM.scrollTop(container, containerScroll.top + diffBottom.top);
                } else {
                    // 自动调整
                    if (diffTop.top < 0) {
                        DOM.scrollTop(container, containerScroll.top + diffTop.top);
                    } else {
                        DOM.scrollTop(container, containerScroll.top + diffBottom.top);
                    }
                }
            }

            if (hscroll) {
                if (diffTop.left < 0 || diffBottom.left > 0) {
                    // 强制向上
                    if (top === true) {
                        DOM.scrollLeft(container, containerScroll.left + diffTop.left);
                    } else if (top === false) {
                        DOM.scrollLeft(container, containerScroll.left + diffBottom.left);
                    } else {
                        // 自动调整
                        if (diffTop.left < 0) {
                            DOM.scrollLeft(container, containerScroll.left + diffTop.left);
                        } else {
                            DOM.scrollLeft(container, containerScroll.left + diffBottom.left);
                        }
                    }
                }
            }
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
            if (isNumber(elem)) {
                return arguments.callee(win, elem);
            }
            elem = DOM.get(elem);
            var ret,
                w = getWin(elem),
                d;
            if (w) {
                if (v !== undefined) {
                    v = parseFloat(v);
                    // 注意多 windw 情况，不能简单取 win
                    var left = name == "Left" ? v : DOM.scrollLeft(w),
                        top = name == "Top" ? v : DOM.scrollTop(w);
                    w['scrollTo'](left, top);
                } else {
                    //标准
                    //chrome == body.scrollTop
                    //firefox/ie9 == documentElement.scrollTop
                    ret = w[ 'page' + (i ? 'Y' : 'X') + 'Offset'];
                    if (!isNumber(ret)) {
                        d = w[DOCUMENT];
                        //ie6,7,8 standard mode
                        ret = d[DOC_ELEMENT][method];
                        if (!isNumber(ret)) {
                            //quirks mode
                            ret = d[BODY][method];
                        }
                    }
                }
            } else if (isElementNode(elem)) {
                if (v !== undefined) {
                    elem[method] = parseFloat(v)
                } else {
                    ret = elem[method];
                }
            }
            return ret;
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
            var prop = CLIENT + name,
                win = getWin(refWin),
                doc = win[DOCUMENT],
                body = doc[BODY],
                documentElement = doc[DOC_ELEMENT],
                documentElementProp = documentElement[prop];
            // 标准模式取 documentElement
            // backcompat 取 body
            return doc[compatMode] === CSS1Compat
                && documentElementProp ||
                body && body[ prop ] || documentElementProp;
//            return (prop in w) ?
//                // 标准 = documentElement.clientHeight
//                w[prop] :
//                // ie 标准 documentElement.clientHeight , 在 documentElement.clientHeight 上滚动？
//                // ie quirks body.clientHeight: 在 body 上？
//                (isStrict ? d[DOC_ELEMENT][CLIENT + name] : d[BODY][CLIENT + name]);
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
 * @author  yiminghe@gmail.com,lifesinger@gmail.com
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
        OLD_DISPLAY = DISPLAY + S.now(),
        NONE = 'none',
        PARSEINT = parseInt,
        RE_NUMPX = /^-?\d+(?:px)?$/i,
        cssNumber = {
            "fillOpacity": 1,
            "fontWeight": 1,
            "lineHeight": 1,
            "opacity": 1,
            "orphans": 1,
            "widows": 1,
            "zIndex": 1,
            "zoom": 1
        },
        RE_DASH = /-([a-z])/ig,
        CAMELCASE_FN = function(all, letter) {
            return letter.toUpperCase();
        },
        // 考虑 ie9 ...
        rupper = /([A-Z]|^ms)/g,
        EMPTY = '',
        DEFAULT_UNIT = 'px',
        CUSTOM_STYLES = {},
        cssProps = {},
        defaultDisplay = {};

    // normalize reserved word float alternatives ("cssFloat" or "styleFloat")
    if (docElem[STYLE][CSS_FLOAT] !== undefined) {
        cssProps[FLOAT] = CSS_FLOAT;
    }
    else if (docElem[STYLE][STYLE_FLOAT] !== undefined) {
        cssProps[FLOAT] = STYLE_FLOAT;
    }

    function camelCase(name) {
        return name.replace(RE_DASH, CAMELCASE_FN);
    }

    var defaultDisplayDetectIframe,
        defaultDisplayDetectIframeDoc;

    // modified from jquery : bullet-proof method of getting default display
    // fix domain problem in ie>6 , ie6 still access denied
    function getDefaultDisplay(tagName) {
        var body,
            elem;
        if (!defaultDisplay[ tagName ]) {
            body = doc.body || doc.documentElement;
            elem = doc.createElement(tagName);
            DOM.prepend(elem, body);
            var oldDisplay = DOM.css(elem, "display");
            body.removeChild(elem);
            // If the simple way fails,
            // get element's real default display by attaching it to a temp iframe
            if (oldDisplay === "none" || oldDisplay === "") {
                // No iframe to use yet, so create it
                if (!defaultDisplayDetectIframe) {
                    defaultDisplayDetectIframe = doc.createElement("iframe");

                    defaultDisplayDetectIframe.frameBorder =
                        defaultDisplayDetectIframe.width =
                            defaultDisplayDetectIframe.height = 0;

                    DOM.prepend(defaultDisplayDetectIframe, body);
                    var iframeSrc;
                    if (iframeSrc = DOM._genEmptyIframeSrc()) {
                        defaultDisplayDetectIframe.src = iframeSrc;
                    }
                } else {
                    DOM.prepend(defaultDisplayDetectIframe, body);
                }

                // Create a cacheable copy of the iframe document on first call.
                // IE and Opera will allow us to reuse the iframeDoc without re-writing the fake HTML
                // document to it; WebKit & Firefox won't allow reusing the iframe document.
                if (!defaultDisplayDetectIframeDoc || !defaultDisplayDetectIframe.createElement) {

                    try {
                        defaultDisplayDetectIframeDoc = defaultDisplayDetectIframe.contentWindow.document;
                        defaultDisplayDetectIframeDoc.write(( doc.compatMode === "CSS1Compat" ? "<!doctype html>" : "" )
                            + "<html><head>" +
                            (UA['ie'] && DOM._isCustomDomain() ?
                                "<script>document.domain = '" +
                                    doc.domain
                                    + "';</script>" : "")
                            +
                            "</head><body>");
                        defaultDisplayDetectIframeDoc.close();
                    } catch(e) {
                        // ie6 need a breath , such as alert(8) or setTimeout;
                        // 同时需要同步，所以无解，勉强返回
                        return "block";
                    }
                }

                elem = defaultDisplayDetectIframeDoc.createElement(tagName);

                defaultDisplayDetectIframeDoc.body.appendChild(elem);

                oldDisplay = DOM.css(elem, "display");

                body.removeChild(defaultDisplayDetectIframe);
            }

            // Store the correct default display
            defaultDisplay[ tagName ] = oldDisplay;
        }

        return defaultDisplay[ tagName ];
    }

    S.mix(DOM, {
        _camelCase:camelCase,
        _cssNumber:cssNumber,
        _CUSTOM_STYLES: CUSTOM_STYLES,
        _cssProps:cssProps,
        _getComputedStyle: function(elem, name) {
            var val = "",
                computedStyle = {},
                d = elem.ownerDocument;

            name = name.replace(rupper, "-$1").toLowerCase();

            // https://github.com/kissyteam/kissy/issues/61
            if (computedStyle = d.defaultView.getComputedStyle(elem, null)) {
                val = computedStyle.getPropertyValue(name) || computedStyle[name];
            }

            // 还没有加入到 document，就取行内
            if (val == "" && !DOM.__contains(d.documentElement, elem)) {
                name = cssProps[name] || name;
                val = elem[STYLE][name];
            }

            return val;
        },

        /**
         *  Get and set the style property on a DOM Node
         */
        style:function(selector, name, val) {
            // suports hash
            if (S.isPlainObject(name)) {
                for (var k in name) {
                    DOM.style(selector, k, name[k]);
                }
                return;
            }
            if (val === undefined) {
                var elem = DOM.get(selector),ret = '';
                if (elem) {
                    ret = style(elem, name, val);
                }
                return ret;
            } else {
                DOM.query(selector).each(function(elem) {
                    style(elem, name, val);
                });
            }
        },

        /**
         * (Gets computed style) or (sets styles) on the matches elements.
         */
        css: function(selector, name, val) {
            // suports hash
            if (S.isPlainObject(name)) {
                for (var k in name) {
                    DOM.css(selector, k, name[k]);
                }
                return;
            }

            name = camelCase(name);
            var hook = CUSTOM_STYLES[name];
            // getter
            if (val === undefined) {
                // supports css selector/Node/NodeList
                var elem = DOM.get(selector), ret = '';
                if (elem) {
                    // If a hook was provided get the computed value from there
                    if (hook && "get" in hook && (ret = hook.get(elem, true)) !== undefined) {
                    } else {
                        ret = DOM._getComputedStyle(elem, name);
                    }
                }
                return ret === undefined ? '' : ret;
            }
            // setter
            else {
                DOM.style(selector, name, val);
            }
        },

        /**
         * Show the matched elements.
         */
        show: function(selector) {

            DOM.query(selector).each(function(elem) {

                elem[STYLE][DISPLAY] = DOM.data(elem, OLD_DISPLAY) || EMPTY;

                // 可能元素还处于隐藏状态，比如 css 里设置了 display: none
                if (DOM.css(elem, DISPLAY) === NONE) {
                    var tagName = elem.tagName.toLowerCase(),
                        old = getDefaultDisplay(tagName);
                    DOM.data(elem, OLD_DISPLAY, old);
                    elem[STYLE][DISPLAY] = old;
                }
            });
        },

        /**
         * Hide the matched elements.
         */
        hide: function(selector) {
            DOM.query(selector).each(function(elem) {
                var style = elem[STYLE], old = style[DISPLAY];
                if (old !== NONE) {
                    if (old) {
                        DOM.data(elem, OLD_DISPLAY, old);
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
                if (DOM.css(elem, DISPLAY) === NONE) {
                    DOM.show(elem);
                } else {
                    DOM.hide(elem);
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
                if (UA['gecko']) {
                    elem[STYLE]['MozUserSelect'] = 'none';
                }
                else if (UA['webkit']) {
                    elem[STYLE]['KhtmlUserSelect'] = 'none';
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
            });
        },
        innerWidth:0,
        innerHeight:0,
        outerWidth:0,
        outerHeight:0,
        width:0,
        height:0
    });

    function capital(str) {
        return str.charAt(0).toUpperCase() + str.substring(1);
    }


    S.each([WIDTH,HEIGHT], function(name) {
        DOM["inner" + capital(name)] = function(selector) {
            var el = DOM.get(selector);
            if (el) {
                return getWH(el, name, "padding");
            } else {
                return null;
            }
        };


        DOM["outer" + capital(name)] = function(selector, includeMargin) {
            var el = DOM.get(selector);
            if (el) {
                return getWH(el, name, includeMargin ? "margin" : "border");
            } else {
                return null;
            }
        };

        DOM[name] = function(selector, val) {
            var ret = DOM.css(selector, name, val);
            if (ret) {
                ret = parseFloat(ret);
            }
            return ret;
        };
    });


    var cssShow = { position: "absolute", visibility: "hidden", display: "block" };

    /**
     * css height,width 永远都是计算值
     */
    S.each(["height", "width"], function(name) {
        CUSTOM_STYLES[ name ] = {
            get: function(elem, computed) {
                var val;
                if (computed) {
                    if (elem.offsetWidth !== 0) {
                        val = getWH(elem, name);
                    } else {
                        swap(elem, cssShow, function() {
                            val = getWH(elem, name);
                        });
                    }
                    return val + "px";
                }
            },
            set: function(elem, value) {
                if (RE_NUMPX.test(value)) {
                    value = parseFloat(value);
                    if (value >= 0) {
                        return value + "px";
                    }
                } else {
                    return value;
                }
            }
        };
    });

    S.each(["left", "top"], function(name) {
        CUSTOM_STYLES[ name ] = {
            get: function(elem, computed) {
                if (computed) {
                    var val = DOM._getComputedStyle(elem, name),offset;

                    // 1. 当没有设置 style.left 时，getComputedStyle 在不同浏览器下，返回值不同
                    //    比如：firefox 返回 0, webkit/ie 返回 auto
                    // 2. style.left 设置为百分比时，返回值为百分比
                    // 对于第一种情况，如果是 relative 元素，值为 0. 如果是 absolute 元素，值为 offsetLeft - marginLeft
                    // 对于第二种情况，大部分类库都未做处理，属于“明之而不 fix”的保留 bug
                    if (val === AUTO) {
                        val = 0;
                        if (S.inArray(DOM.css(elem, 'position'), ['absolute','fixed'])) {
                            offset = elem[name === 'left' ? 'offsetLeft' : 'offsetTop'];

                            // old-ie 下，elem.offsetLeft 包含 offsetParent 的 border 宽度，需要减掉
                            if (isIE && document['documentMode'] != 9 || UA['opera']) {
                                // 类似 offset ie 下的边框处理
                                // 如果 offsetParent 为 html ，需要减去默认 2 px == documentElement.clientTop
                                // 否则减去 borderTop 其实也是 clientTop
                                // http://msdn.microsoft.com/en-us/library/aa752288%28v=vs.85%29.aspx
                                // ie<9 注意有时候 elem.offsetParent 为 null ...
                                // 比如 DOM.append(DOM.create("<div class='position:absolute'></div>"),document.body)
                                offset -= elem.offsetParent && elem.offsetParent['client' + (name == 'left' ? 'Left' : 'Top')]
                                    || 0;
                            }
                            val = offset - (PARSEINT(DOM.css(elem, 'margin-' + name)) || 0);
                        }
                        val += "px";
                    }
                    return val;
                }
            }
        };
    });


    function swap(elem, options, callback) {
        var old = {};

        // Remember the old values, and insert the new ones
        for (var name in options) {
            old[ name ] = elem[STYLE][ name ];
            elem[STYLE][ name ] = options[ name ];
        }

        callback.call(elem);

        // Revert the old values
        for (name in options) {
            elem[STYLE][ name ] = old[ name ];
        }
    }


    function style(elem, name, val) {
        var style;
        if (elem.nodeType === 3 || elem.nodeType === 8 || !(style = elem[STYLE])) {
            return undefined;
        }
        name = camelCase(name);
        var ret,hook = CUSTOM_STYLES[name];
        name = cssProps[name] || name;
        // setter
        if (val !== undefined) {
            // normalize unsetting
            if (val === null || val === EMPTY) {
                val = EMPTY;
            }
            // number values may need a unit
            else if (!isNaN(Number(val)) && !cssNumber[name]) {
                val += DEFAULT_UNIT;
            }
            if (hook && hook.set) {
                val = hook.set(elem, val);
            }
            if (val !== undefined) {
                // ie 无效值报错
                try {
                    elem[STYLE][name] = val;
                } catch(e) {
                    S.log("css set error :" + e);
                }
            }
            return undefined;
        }
        //getter
        else {
            // If a hook was provided get the non-computed value from there
            if (hook && "get" in hook && (ret = hook.get(elem, false)) !== undefined) {

            } else {
                // Otherwise just get the value from the style object
                ret = style[ name ];
            }
            return ret === undefined ? "" : ret;
        }

    }


    /**
     * 得到元素的大小信息
     * @param elem
     * @param name
     * @param {String} extra    "padding" : (css width) + padding
     *                          "border" : (css width) + padding + border
     *                          "margin" : (css width) + padding + border + margin
     */
    function getWH(elem, name, extra) {
        if (S.isWindow(elem)) {
            return name == WIDTH ? DOM.viewportWidth(elem) : DOM.viewportHeight(elem);
        } else if (elem.nodeType == 9) {
            return name == WIDTH ? DOM.docWidth(elem) : DOM.docHeight(elem);
        }
        var which = name === WIDTH ? ['Left', 'Right'] : ['Top', 'Bottom'],
            val = name === WIDTH ? elem.offsetWidth : elem.offsetHeight;

        if (val > 0) {
            if (extra !== "border") {
                S.each(which, function(w) {
                    if (!extra) {
                        val -= parseFloat(DOM.css(elem, "padding" + w)) || 0;
                    }
                    if (extra === "margin") {
                        val += parseFloat(DOM.css(elem, extra + w)) || 0;
                    } else {
                        val -= parseFloat(DOM.css(elem, "border" + w + "Width")) || 0;
                    }
                });
            }

            return val
        }

        // Fall back to computed then uncomputed css if necessary
        val = DOM._getComputedStyle(elem, name);
        if (val < 0 || S.isNullOrUndefined(val)) {
            val = elem.style[ name ] || 0;
        }
        // Normalize "", auto, and prepare for extra
        val = parseFloat(val) || 0;

        // Add padding, border, margin
        if (extra) {
            S.each(which, function(w) {
                val += parseFloat(DOM.css(elem, "padding" + w)) || 0;
                if (extra !== "padding") {
                    val += parseFloat(DOM.css(elem, "border" + w + "Width")) || 0;
                }
                if (extra === "margin") {
                    val += parseFloat(DOM.css(elem, extra + w)) || 0;
                }
            });
        }

        return val;
    }

    return DOM;
}, {
    requires:["dom/base","ua"]
});

/**
 *
 * 2011-08-19
 *  - 调整结构，减少耦合
 *  - fix css("height") == auto
 *
 * NOTES:
 *  - Opera 下，color 默认返回 #XXYYZZ, 非 rgb(). 目前 jQuery 等类库均忽略此差异，KISSY 也忽略。
 *  - Safari 低版本，transparent 会返回为 rgba(0, 0, 0, 0), 考虑低版本才有此 bug, 亦忽略。
 *
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
 * @author  lifesinger@gmail.com , yiminghe@gmail.com
 */
KISSY.add('dom/selector', function(S, DOM, undefined) {

    var doc = document,
        filter = S.filter,
        require = function(selector) {
            return S.require(selector);
        },
        isArray = S.isArray,
        makeArray = S.makeArray,
        isNodeList = DOM._isNodeList,
        nodeName = DOM._nodeName,
        push = Array.prototype.push,
        SPACE = ' ',
        COMMA = ',',
        trim = S.trim,
        ANY = '*',
        REG_ID = /^#[\w-]+$/,
        REG_QUERY = /^(?:#([\w-]+))?\s*([\w-]+|\*)?\.?([\w-]+)?$/;

    /**
     * Retrieves an Array of HTMLElement based on the given CSS selector.
     * @param {String|Array} selector
     * @param {String|Array<HTMLElement>|NodeList} context find elements matching selector under context
     * @return {Array} The array of found HTMLElement
     */
    function query(selector, context) {
        var ret,
            i,
            isSelectorString = typeof selector === 'string',
            // optimize common usage
            contexts = context === undefined ? [doc] : tuneContext(context);

        if (isSelectorString) {
            selector = trim(selector);
            if (contexts.length == 1 && selector) {
                ret = quickFindBySelectorStr(selector, contexts[0]);
            }
        }
        if (!ret) {
            ret = [];
            if (selector) {
                for (i = 0; i < contexts.length; i++) {
                    push.apply(ret, queryByContexts(selector, contexts[i]));
                }

                //必要时去重排序
                if (ret.length > 1 &&
                    // multiple contexts
                    (contexts.length > 1 ||
                        (isSelectorString &&
                            // multiple selector
                            selector.indexOf(COMMA) > -1))) {
                    unique(ret);
                }
            }
        }
        // attach each method
        ret.each = function(f) {
            var self = this,el,i;
            for (i = 0; i < self.length; i++) {
                el = self[i];
                if (f(el, i) === false) {
                    break;
                }
            }
        };

        return ret;
    }

    function queryByContexts(selector, context) {
        var ret = [],
            isSelectorString = typeof selector === 'string';
        if (isSelectorString && selector.match(REG_QUERY) ||
            !isSelectorString) {
            // 简单选择器自己处理
            ret = queryBySimple(selector, context);
        }
        // 如果选择器有 , 分开递归一部分一部分来
        else if (isSelectorString && selector.indexOf(COMMA) > -1) {
            ret = queryBySelectors(selector, context);
        }
        else {
            // 复杂了，交给 sizzle
            ret = queryBySizzle(selector, context);
        }
        return ret;
    }

    // 交给 sizzle 模块处理
    function queryBySizzle(selector, context) {
        var ret = [],
            sizzle = require("sizzle");
        if (sizzle) {
            sizzle(selector, context, ret);
        } else {
            // 原生不支持
            error(selector);
        }
        return ret;
    }

    // 处理 selector 的每个部分
    function queryBySelectors(selector, context) {
        var ret = [],
            i,
            selectors = selector.split(/\s*,\s*/);
        for (i = 0; i < selectors.length; i++) {
            push.apply(ret, queryByContexts(selectors[i], context));
        }
        // 多部分选择器可能得到重复结果
        return ret;
    }

    function quickFindBySelectorStr(selector, context) {
        var ret,t,match,id,tag,cls;
        // selector 为 #id 是最常见的情况，特殊优化处理
        if (REG_ID.test(selector)) {
            t = getElementById(selector.slice(1), context);
            if (t) {
                // #id 无效时，返回空数组
                ret = [t];
            } else {
                ret = [];
            }
        }
        // selector 为支持列表中的其它 6 种
        else {
            match = REG_QUERY.exec(selector);
            if (match) {
                // 获取匹配出的信息
                id = match[1];
                tag = match[2];
                cls = match[3];
                // 空白前只能有 id ，取出来作为 context
                context = (id ? getElementById(id, context) : context);
                if (context) {
                    // #id .cls | #id tag.cls | .cls | tag.cls | #id.cls
                    if (cls) {
                        if (!id || selector.indexOf(SPACE) != -1) { // 排除 #id.cls
                            ret = [].concat(getElementsByClassName(cls, tag, context));
                        }
                        // 处理 #id.cls
                        else {
                            t = getElementById(id, context);
                            if (t && hasClass(t, cls)) {
                                ret = [t];
                            }
                        }
                    }
                    // #id tag | tag
                    else if (tag) { // 排除空白字符串
                        ret = getElementsByTagName(tag, context);
                    }
                }
                ret = ret || [];
            }
        }
        return ret;
    }

    // 最简单情况了，单个选择器部分，单个上下文
    function queryBySimple(selector, context) {
        var ret,
            isSelectorString = typeof selector === 'string';
        if (isSelectorString) {
            ret = quickFindBySelectorStr(selector, context) || [];
        }
        // 传入的 selector 是 NodeList 或已是 Array
        else if (selector && (isArray(selector) || isNodeList(selector))) {
            // 只能包含在 context 里面
            ret = filter(selector, function(s) {
                return testByContext(s, context);
            });
        }
        // 传入的 selector 是 HTMLNode 查看约束
        // 否则 window/document，原样返回
        else if (selector && testByContext(selector, context)) {
            ret = [selector];
        }
        return ret;
    }

    function testByContext(element, context) {
        if (!element) {
            return false;
        }
        // 防止 element 节点还没添加到 document ，但是也可以获取到 query(element) => [element]
        // document 的上下文一律放行

        // context == doc 意味着没有提供第二个参数，到这里只是想单纯包装原生节点，则不检测
        if (context == doc) {
            return true;
        }
        // 节点受上下文约束
        return DOM.__contains(context, element);
    }

    var unique;
    (function() {
        var sortOrder,
            t,
            hasDuplicate,
            baseHasDuplicate = true;

        // Here we check if the JavaScript engine is using some sort of
// optimization where it does not always call our comparision
// function. If that is the case, discard the hasDuplicate value.
//   Thus far that includes Google Chrome.
        [0, 0].sort(function() {
            baseHasDuplicate = false;
            return 0;
        });

        // 排序去重
        unique = function (elements) {
            if (sortOrder) {
                hasDuplicate = baseHasDuplicate;
                elements.sort(sortOrder);

                if (hasDuplicate) {
                    var i = 1,len = elements.length;
                    while (i < len) {
                        if (elements[i] === elements[ i - 1 ]) {
                            elements.splice(i, 1);
                        } else {
                            i++;
                        }
                    }
                }
            }
            return elements;
        };

        // 貌似除了 ie 都有了...
        if (doc.documentElement.compareDocumentPosition) {
            sortOrder = t = function(a, b) {
                if (a == b) {
                    hasDuplicate = true;
                    return 0;
                }

                if (!a.compareDocumentPosition || !b.compareDocumentPosition) {
                    return a.compareDocumentPosition ? -1 : 1;
                }

                return a.compareDocumentPosition(b) & 4 ? -1 : 1;
            };

        } else {
            sortOrder = t = function(a, b) {
                // The nodes are identical, we can exit early
                if (a == b) {
                    hasDuplicate = true;
                    return 0;
                    // Fallback to using sourceIndex (in IE) if it's available on both nodes
                } else if (a.sourceIndex && b.sourceIndex) {
                    return a.sourceIndex - b.sourceIndex;
                }
            };
        }
    })();


    // 调整 context 为合理值
    function tuneContext(context) {
        // context 为 undefined 是最常见的情况，优先考虑
        if (context === undefined) {
            return [doc];
        }
        // 其他直接使用 query
        return query(context, undefined);
    }

    // query #id
    function getElementById(id, context) {
        var doc = context,
            el;
        if (context.nodeType !== DOM.DOCUMENT_NODE) {
            doc = context.ownerDocument;
        }
        el = doc.getElementById(id);
        if (el && el.id === id) {
            // optimize for common usage
        }
        else if (el && el.parentNode) {
            // ie opera confuse name with id
            // https://github.com/kissyteam/kissy/issues/67
            // 不能直接 el.id ，否则 input shadow form attribute
            if (DOM.__attr(el, "id") !== id) {
                // 直接在 context 下的所有节点找
                el = DOM.filter(ANY, "#" + id, context)[0] || null;
            }
            // ie 特殊情况下以及指明在 context 下找了，不需要再判断
            // 如果指定了 context node , 还要判断 id 是否处于 context 内
            else if (!testByContext(el, context)) {
                el = null;
            }
        } else {
            el = null;
        }
        return el;
    }

    // query tag
    function getElementsByTagName(tag, context) {
        return context && makeArray(context.getElementsByTagName(tag)) || [];
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
                var ret = makeArray(context.getElementsByTagName(tag));
                if (tag === ANY) {
                    var t = [], i = 0,node;
                    while ((node = ret[i++])) {
                        // Filter out possible comments
                        if (node.nodeType === 1) {
                            t.push(node);
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
        // query("#id1 xx","#id2")
        // #id2 内没有 #id1 , context 为 null , 这里防御下
        if (!context) {
            return [];
        }
        var els = context.getElementsByClassName(cls),
            ret,
            i = 0,
            len = els.length,
            el;

        if (tag && tag !== ANY) {
            ret = [];
            for (; i < len; ++i) {
                el = els[i];
                if (nodeName(el, tag)) {
                    ret.push(el);
                }
            }
        } else {
            ret = makeArray(els);
        }
        return ret;
    } : ( doc.querySelectorAll ? function(cls, tag, context) {
        // ie8 return staticNodeList 对象,[].concat 会形成 [ staticNodeList ] ，手动转化为普通数组
        return context && makeArray(context.querySelectorAll((tag ? tag : '') + '.' + cls)) || [];
    } : function(cls, tag, context) {
        if (!context) {
            return [];
        }
        var els = context.getElementsByTagName(tag || ANY),
            ret = [],
            i = 0,
            len = els.length,
            el;
        for (; i < len; ++i) {
            el = els[i];
            if (hasClass(el, cls)) {
                ret.push(el);
            }
        }
        return ret;
    });

    function hasClass(el, cls) {
        return DOM.__hasClass(el, cls);
    }

    // throw exception
    function error(msg) {
        S.error('Unsupported selector: ' + msg);
    }

    S.mix(DOM, {

        query: query,

        get: function(selector, context) {
            return query(selector, context)[0] || null;
        },

        unique:unique,

        /**
         * Filters an array of elements to only include matches of a filter.
         * @param filter selector or fn
         */
        filter: function(selector, filter, context) {
            var elems = query(selector, context),
                sizzle = require("sizzle"),
                match,
                tag,
                id,
                cls,
                ret = [];

            // 默认仅支持最简单的 tag.cls 或 #id 形式
            if (typeof filter === 'string' &&
                (filter = trim(filter)) &&
                (match = REG_QUERY.exec(filter))) {
                id = match[1];
                tag = match[2];
                cls = match[3];
                if (!id) {
                    filter = function(elem) {
                        var tagRe = true,clsRe = true;

                        // 指定 tag 才进行判断
                        if (tag) {
                            tagRe = nodeName(elem, tag);
                        }

                        // 指定 cls 才进行判断
                        if (cls) {
                            clsRe = hasClass(elem, cls);
                        }

                        return clsRe && tagRe;
                    }
                } else if (id && !tag && !cls) {
                    filter = function(elem) {
                        return DOM.__attr(elem, "id") === id;
                    };
                }
            }

            if (S.isFunction(filter)) {
                ret = S.filter(elems, filter);
            }
            // 其它复杂 filter, 采用外部选择器
            else if (filter && sizzle) {
                ret = sizzle.matches(filter, elems);
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
            var elements = query(selector, context);
            return elements.length && (DOM.filter(elements, filter, context).length === elements.length);
        }
    });
    return DOM;
}, {
    requires:["./base"]
});

/**
 * NOTES:
 *
 * 2011.08.02
 *  - 利用 sizzle 重构选择器
 *  - 1.1.6 修正，原来 context 只支持 #id 以及 document
 *    1.2 context 支持任意，和 selector 格式一致
 *  - 简单选择器也和 jquery 保持一致 DOM.query("xx","yy") 支持
 *    - context 不提供则为当前 document ，否则通过 query 递归取得
 *    - 保证选择出来的节点（除了 document window）都是位于 context 范围内
 *
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
 * Ref: http://ejohn.org/blog/selectors-that-people-actually-use/
 * 考虑 2/8 原则，仅支持以下选择器：
 * #id
 * tag
 * .cls
 * #id tag
 * #id .cls
 * tag.cls
 * #id tag.cls
 * 注 1：REG_QUERY 还会匹配 #id.cls
 * 注 2：tag 可以为 * 字符
 * 注 3: 支持 , 号分组
 *
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
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add('dom/style-ie', function(S, DOM, UA, Style) {

        var HUNDRED = 100;

        // only for ie
        if (!UA['ie']) {
            return DOM;
        }

        var doc = document,
            docElem = doc.documentElement,
            OPACITY = 'opacity',
            STYLE = 'style',
            FILTER = "filter",
            CURRENT_STYLE = 'currentStyle',
            RUNTIME_STYLE = 'runtimeStyle',
            LEFT = 'left',
            PX = 'px',
            CUSTOM_STYLES = Style._CUSTOM_STYLES,
            RE_NUMPX = /^-?\d+(?:px)?$/i,
            RE_NUM = /^-?\d/,
            ropacity = /opacity=([^)]*)/,
            ralpha = /alpha\([^)]*\)/i;

        // use alpha filter for IE opacity
        try {
            if (S.isNullOrUndefined(docElem.style[OPACITY])) {

                CUSTOM_STYLES[OPACITY] = {

                    get: function(elem, computed) {
                        // 没有设置过 opacity 时会报错，这时返回 1 即可
                        // 如果该节点没有添加到 dom ，取不到 filters 结构
                        // val = elem[FILTERS]['DXImageTransform.Microsoft.Alpha'][OPACITY];
                        return ropacity.test((
                            computed && elem[CURRENT_STYLE] ?
                                elem[CURRENT_STYLE][FILTER] :
                                elem[STYLE][FILTER]) || "") ?
                            ( parseFloat(RegExp.$1) / HUNDRED ) + "" :
                            computed ? "1" : "";
                    },

                    set: function(elem, val) {
                        val = parseFloat(val);

                        var style = elem[STYLE],
                            currentStyle = elem[CURRENT_STYLE],
                            opacity = isNaN(val) ? "" : "alpha(" + OPACITY + "=" + val * HUNDRED + ")",
                            filter = S.trim(currentStyle && currentStyle[FILTER] || style[FILTER] || "");

                        // ie  has layout
                        style.zoom = 1;

                        // if setting opacity to 1, and no other filters exist - attempt to remove filter attribute
                        if (val >= 1 && S.trim(filter.replace(ralpha, "")) === "") {

                            // Setting style.filter to null, "" & " " still leave "filter:" in the cssText
                            // if "filter:" is present at all, clearType is disabled, we want to avoid this
                            // style.removeAttribute is IE Only, but so apparently is this code path...
                            style.removeAttribute(FILTER);

                            // if there there is no filter style applied in a css rule, we are done
                            if (currentStyle && !currentStyle[FILTER]) {
                                return;
                            }
                        }

                        // otherwise, set new filter values
                        // 如果 >=1 就不设，就不能覆盖外部样式表定义的样式，一定要设
                        style.filter = ralpha.test(filter) ?
                            filter.replace(ralpha, opacity) :
                            filter + (filter ? ", " : "") + opacity;
                    }
                };
            }
        }
        catch(ex) {
            S.log('IE filters ActiveX is disabled. ex = ' + ex);
        }

        /**
         * border fix
         * ie 不设置数值，则 computed style 不返回数值，只返回 thick? medium ...
         * (default is "medium")
         */
        var IE8 = UA['ie'] == 8,
            BORDER_MAP = {
            },
            BORDERS = ["","Top","Left","Right","Bottom"];
        BORDER_MAP['thin'] = IE8 ? '1px' : '2px';
        BORDER_MAP['medium'] = IE8 ? '3px' : '4px';
        BORDER_MAP['thick'] = IE8 ? '5px' : '6px';
        S.each(BORDERS, function(b) {
            var name = "border" + b + "Width",
                styleName = "border" + b + "Style";
            CUSTOM_STYLES[name] = {
                get: function(elem, computed) {
                    // 只有需要计算样式的时候才转换，否则取原值
                    var currentStyle = computed ? elem[CURRENT_STYLE] : 0,
                        current = currentStyle && String(currentStyle[name]) || undefined;
                    // look up keywords if a border exists
                    if (current && current.indexOf("px") < 0) {
                        // 边框没有隐藏
                        if (BORDER_MAP[current] && currentStyle[styleName] !== "none") {
                            current = BORDER_MAP[current];
                        } else {
                            // otherwise no border
                            current = 0;
                        }
                    }
                    return current;
                }
            };
        });

        // getComputedStyle for IE
        if (!(doc.defaultView || { }).getComputedStyle && docElem[CURRENT_STYLE]) {

            DOM._getComputedStyle = function(elem, name) {
                name = DOM._cssProps[name] || name;

                var ret = elem[CURRENT_STYLE] && elem[CURRENT_STYLE][name];

                // 当 width/height 设置为百分比时，通过 pixelLeft 方式转换的 width/height 值
                // 一开始就处理了! CUSTOM_STYLE["height"],CUSTOM_STYLE["width"] ,cssHook 解决@2011-08-19
                // 在 ie 下不对，需要直接用 offset 方式
                // borderWidth 等值也有问题，但考虑到 borderWidth 设为百分比的概率很小，这里就不考虑了

                // From the awesome hack by Dean Edwards
                // http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291
                // If we're not dealing with a regular pixel number
                // but a number that has a weird ending, we need to convert it to pixels
                if ((!RE_NUMPX.test(ret) && RE_NUM.test(ret))) {
                    // Remember the original values
                    var style = elem[STYLE],
                        left = style[LEFT],
                        rsLeft = elem[RUNTIME_STYLE] && elem[RUNTIME_STYLE][LEFT];

                    // Put in the new values to get a computed value out
                    if (rsLeft) {
                        elem[RUNTIME_STYLE][LEFT] = elem[CURRENT_STYLE][LEFT];
                    }
                    style[LEFT] = name === 'fontSize' ? '1em' : (ret || 0);
                    ret = style['pixelLeft'] + PX;

                    // Revert the changed values
                    style[LEFT] = left;
                    if (rsLeft) {
                        elem[RUNTIME_STYLE][LEFT] = rsLeft;
                    }
                }
                return ret === "" ? "auto" : ret;
            };
        }
        return DOM;
    },
    {
        requires:["./base","ua","./style"]
    }
);
/**
 * NOTES:
 * 承玉： 2011.05.19 opacity in ie
 *  - 如果节点是动态创建，设置opacity，没有加到 dom 前，取不到 opacity 值
 *  - 兼容：border-width 值，ie 下有可能返回 medium/thin/thick 等值，其它浏览器返回 px 值。
 *
 *  - opacity 的实现，参考自 jquery
 *
 */

/**
 * @module  dom-traversal
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add('dom/traversal', function(S, DOM, undefined) {

    var isElementNode = DOM._isElementNode,
        CONTAIN_MASK = 16;

    S.mix(DOM, {

        closest:function(selector, filter, context) {
            return nth(selector, filter, 'parentNode', function(elem) {
                return elem.nodeType != DOM.DOCUMENT_FRAGMENT_NODE;
            }, context, true);
        },

        /**
         * Gets the parent node of the first matched element.
         */
        parent: function(selector, filter, context) {
            return nth(selector, filter, 'parentNode', function(elem) {
                return elem.nodeType != DOM.DOCUMENT_FRAGMENT_NODE;
            }, context);
        },

        first:function(selector, filter) {
            var elem = DOM.get(selector);
            return nth(elem && elem.firstChild, filter, 'nextSibling',
                undefined, undefined, true);
        },

        last:function(selector, filter) {
            var elem = DOM.get(selector);
            return nth(elem && elem.lastChild, filter, 'previousSibling',
                undefined, undefined, true);
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

        __contains:document.documentElement.contains ?
            function(a, b) {
                if (a.nodeType == DOM.TEXT_NODE) {
                    return false;
                }
                var precondition;
                if (b.nodeType == DOM.TEXT_NODE) {
                    b = b.parentNode;
                    // a 和 b父亲相等也就是返回 true
                    precondition = true;
                } else if (b.nodeType == DOM.DOCUMENT_NODE) {
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
                    return !!(a.compareDocumentPosition(b) & CONTAIN_MASK);
                } :
                // it can not be true , pathetic browser
                0
            ),

        /**
         * Check to see if a DOM node is within another DOM node.
         */
        contains:
            function(a, b) {
                a = DOM.get(a);
                b = DOM.get(b);
                if (a && b) {
                    return DOM.__contains(a, b);
                }
            },

        equals:function(n1, n2) {
            n1 = DOM.query(n1);
            n2 = DOM.query(n2);
            if (n1.length != n2.length) {
                return false;
            }
            for (var i = n1.length; i >= 0; i--) {
                if (n1[i] != n2[i]) {
                    return false;
                }
            }
            return true;
        }
    });

    // 获取元素 elem 在 direction 方向上满足 filter 的第一个元素
    // filter 可为 number, selector, fn array ，为数组时返回多个
    // direction 可为 parentNode, nextSibling, previousSibling
    // context : 到某个阶段不再查找直接返回
    function nth(elem, filter, direction, extraFilter, context, includeSef) {
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
        context = (context && DOM.get(context)) || null;

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

        // 概念统一，都是 context 上下文，只过滤子孙节点，自己不管
        while (elem && elem != context) {
            if (isElementNode(elem)
                && testFilter(elem, filter)
                && (!extraFilter || extraFilter(elem))) {
                ret.push(elem);
                if (!isArray) {
                    break;
                }
            }
            elem = elem[direction];
        }

        return isArray ? ret : ret[0] || null;
    }

    function testFilter(elem, filter) {
        if (!filter) {
            return true;
        }
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
 * 2011-08
 * - 添加 closest , first ,last 完全摆脱原生属性
 *
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
 * @fileOverview some keycodes definition and utils from closure-library
 * @author yiminghe@gmail.com
 */
KISSY.add("event/keycodes", function() {
    var KeyCodes = {
        MAC_ENTER: 3,
        BACKSPACE: 8,
        TAB: 9,
        NUM_CENTER: 12,  // NUMLOCK on FF/Safari Mac
        ENTER: 13,
        SHIFT: 16,
        CTRL: 17,
        ALT: 18,
        PAUSE: 19,
        CAPS_LOCK: 20,
        ESC: 27,
        SPACE: 32,
        PAGE_UP: 33,     // also NUM_NORTH_EAST
        PAGE_DOWN: 34,   // also NUM_SOUTH_EAST
        END: 35,         // also NUM_SOUTH_WEST
        HOME: 36,        // also NUM_NORTH_WEST
        LEFT: 37,        // also NUM_WEST
        UP: 38,          // also NUM_NORTH
        RIGHT: 39,       // also NUM_EAST
        DOWN: 40,        // also NUM_SOUTH
        PRINT_SCREEN: 44,
        INSERT: 45,      // also NUM_INSERT
        DELETE: 46,      // also NUM_DELETE
        ZERO: 48,
        ONE: 49,
        TWO: 50,
        THREE: 51,
        FOUR: 52,
        FIVE: 53,
        SIX: 54,
        SEVEN: 55,
        EIGHT: 56,
        NINE: 57,
        QUESTION_MARK: 63, // needs localization
        A: 65,
        B: 66,
        C: 67,
        D: 68,
        E: 69,
        F: 70,
        G: 71,
        H: 72,
        I: 73,
        J: 74,
        K: 75,
        L: 76,
        M: 77,
        N: 78,
        O: 79,
        P: 80,
        Q: 81,
        R: 82,
        S: 83,
        T: 84,
        U: 85,
        V: 86,
        W: 87,
        X: 88,
        Y: 89,
        Z: 90,
        META: 91, // WIN_KEY_LEFT
        WIN_KEY_RIGHT: 92,
        CONTEXT_MENU: 93,
        NUM_ZERO: 96,
        NUM_ONE: 97,
        NUM_TWO: 98,
        NUM_THREE: 99,
        NUM_FOUR: 100,
        NUM_FIVE: 101,
        NUM_SIX: 102,
        NUM_SEVEN: 103,
        NUM_EIGHT: 104,
        NUM_NINE: 105,
        NUM_MULTIPLY: 106,
        NUM_PLUS: 107,
        NUM_MINUS: 109,
        NUM_PERIOD: 110,
        NUM_DIVISION: 111,
        F1: 112,
        F2: 113,
        F3: 114,
        F4: 115,
        F5: 116,
        F6: 117,
        F7: 118,
        F8: 119,
        F9: 120,
        F10: 121,
        F11: 122,
        F12: 123,
        NUMLOCK: 144,
        SEMICOLON: 186,            // needs localization
        DASH: 189,                 // needs localization
        EQUALS: 187,               // needs localization
        COMMA: 188,                // needs localization
        PERIOD: 190,               // needs localization
        SLASH: 191,                // needs localization
        APOSTROPHE: 192,           // needs localization
        SINGLE_QUOTE: 222,         // needs localization
        OPEN_SQUARE_BRACKET: 219,  // needs localization
        BACKSLASH: 220,            // needs localization
        CLOSE_SQUARE_BRACKET: 221, // needs localization
        WIN_KEY: 224,
        MAC_FF_META: 224, // Firefox (Gecko) fires this for the meta key instead of 91
        WIN_IME: 229
    };

    KeyCodes.isTextModifyingKeyEvent = function(e) {
        if (e.altKey && !e.ctrlKey ||
            e.metaKey ||
            // Function keys don't generate text
            e.keyCode >= KeyCodes.F1 &&
                e.keyCode <= KeyCodes.F12) {
            return false;
        }

        // The following keys are quite harmless, even in combination with
        // CTRL, ALT or SHIFT.
        switch (e.keyCode) {
            case KeyCodes.ALT:
            case KeyCodes.CAPS_LOCK:
            case KeyCodes.CONTEXT_MENU:
            case KeyCodes.CTRL:
            case KeyCodes.DOWN:
            case KeyCodes.END:
            case KeyCodes.ESC:
            case KeyCodes.HOME:
            case KeyCodes.INSERT:
            case KeyCodes.LEFT:
            case KeyCodes.MAC_FF_META:
            case KeyCodes.META:
            case KeyCodes.NUMLOCK:
            case KeyCodes.NUM_CENTER:
            case KeyCodes.PAGE_DOWN:
            case KeyCodes.PAGE_UP:
            case KeyCodes.PAUSE:
            case KeyCodes.PHANTOM:
            case KeyCodes.PRINT_SCREEN:
            case KeyCodes.RIGHT:
            case KeyCodes.SHIFT:
            case KeyCodes.UP:
            case KeyCodes.WIN_KEY:
            case KeyCodes.WIN_KEY_RIGHT:
                return false;
            default:
                return true;
        }
    };

    KeyCodes.isCharacterKey = function(keyCode) {
        if (keyCode >= KeyCodes.ZERO &&
            keyCode <= KeyCodes.NINE) {
            return true;
        }

        if (keyCode >= KeyCodes.NUM_ZERO &&
            keyCode <= KeyCodes.NUM_MULTIPLY) {
            return true;
        }

        if (keyCode >= KeyCodes.A &&
            keyCode <= KeyCodes.Z) {
            return true;
        }

        // Safari sends zero key code for non-latin characters.
        if (goog.userAgent.WEBKIT && keyCode == 0) {
            return true;
        }

        switch (keyCode) {
            case KeyCodes.SPACE:
            case KeyCodes.QUESTION_MARK:
            case KeyCodes.NUM_PLUS:
            case KeyCodes.NUM_MINUS:
            case KeyCodes.NUM_PERIOD:
            case KeyCodes.NUM_DIVISION:
            case KeyCodes.SEMICOLON:
            case KeyCodes.DASH:
            case KeyCodes.EQUALS:
            case KeyCodes.COMMA:
            case KeyCodes.PERIOD:
            case KeyCodes.SLASH:
            case KeyCodes.APOSTROPHE:
            case KeyCodes.SINGLE_QUOTE:
            case KeyCodes.OPEN_SQUARE_BRACKET:
            case KeyCodes.BACKSLASH:
            case KeyCodes.CLOSE_SQUARE_BRACKET:
                return true;
            default:
                return false;
        }
    };

    return KeyCodes;

});

/**
 * @module  EventObject
 * @author  lifesinger@gmail.com
 */
KISSY.add('event/object', function(S, undefined) {

    var doc = document,
        props = ('altKey attrChange attrName bubbles button cancelable ' +
            'charCode clientX clientY ctrlKey currentTarget data detail ' +
            'eventPhase fromElement handler keyCode metaKey ' +
            'newValue offsetX offsetY originalTarget pageX pageY prevValue ' +
            'relatedNode relatedTarget screenX screenY shiftKey srcElement ' +
            'target toElement view wheelDelta which axis').split(' ');

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
                self.which = (self.charCode === undefined) ? self.keyCode : self.charCode;
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
            var self = this;
            self.isImmediatePropagationStopped = true;
            // fixed 1.2
            // call stopPropagation implicitly
            self.stopPropagation();
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

    if (1 > 2) {
        alert(S.cancelBubble);
    }

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
 * @author  yiminghe@gmail.com,lifesinger@gmail.com
 */
KISSY.add('event/base', function(S, DOM, EventObject, undefined) {

    var doc = document,
        nodeName = DOM._nodeName,
        makeArray = S.makeArray,
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
        each = S.each,
        // 记录手工 fire(domElement,type) 时的 type
        // 再在浏览器通知的系统 eventHandler 中检查
        // 如果相同，那么证明已经 fire 过了，不要再次触发了
        Event_Triggered = "",
        TRIGGERED_NONE = "trigger-none-" + S.now(),
        EVENT_SPECIAL = {},
        // 事件存储位置 key
        // { handler: eventHandler, events:  {type:[{scope:scope,fn:fn}]}  } }
        EVENT_GUID = 'ksEventTargetId' + S.now();

    /**
     * @name Event
     * @namespace
     */
    var Event = {

        _clone:function(src, dest) {
            if (dest.nodeType !== DOM.ELEMENT_NODE ||
                !Event._hasData(src)) {
                return;
            }
            var eventDesc = Event._data(src),
                events = eventDesc.events;
            each(events, function(handlers, type) {
                each(handlers, function(handler) {
                    Event.on(dest, type, handler.fn, handler.scope, handler.data);
                });
            });
        },

        _hasData:function(elem) {
            return DOM.hasData(elem, EVENT_GUID);
        },

        _data:function(elem) {
            var args = makeArray(arguments);
            args.splice(1, 0, EVENT_GUID);
            return DOM.data.apply(DOM, args);
        },

        _removeData:function(elem) {
            var args = makeArray(arguments);
            args.splice(1, 0, EVENT_GUID);
            return DOM.removeData.apply(DOM, args);
        },

        // such as: { 'mouseenter' : { setup:fn ,tearDown:fn} }
        special: EVENT_SPECIAL,

        // single type , single target , fixed native
        __add:function(isNativeTarget, target, type, fn, scope, data) {
            var eventDesc;

            // 不是有效的 target 或 参数不对
            if (!target ||
                !S.isFunction(fn) ||
                (isNativeTarget && !isValidTarget(target))) {
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
                handleObj = {
                    fn: fn,
                    scope: scope,
                    data:data
                },
                eventHandler = eventDesc.handler;
            // 该元素没有 handler ，并且该元素是 dom 节点时才需要注册 dom 事件
            if (!eventHandler) {
                eventHandler = eventDesc.handler = function(event, data) {
                    // 是经过 fire 手动调用而浏览器同步触发导致的，就不要再次触发了，
                    // 已经在 fire 中 bubble 过一次了
                    if (event && event.type == Event_Triggered) {
                        return;
                    }
                    var target = eventHandler.target;
                    if (!event || !event.fixed) {
                        event = new EventObject(target, event);
                    }
                    var type = event.type;
                    if (S.isPlainObject(data)) {
                        S.mix(event, data);
                    }
                    // protect type
                    if (type) {
                        event.type = type;
                    }
                    return Event._handle(target, event);
                };
                eventHandler.target = target;
            }
            if (isNativeTarget) {
                addDomEvent(target, type, eventHandler, handlers, handleObj);
                //nullify to prevent memory leak in ie ?
                target = null;
            }
            // 增加 listener
            handlers.push(handleObj);
        },

        /**
         * Adds an event listener.
         * @param targets KISSY selector
         * @param type {String} The type of event to append.
         * @param fn {Function} The event handler.
         * @param scope {Object} (optional) The scope (this reference) in which the handler function is executed.
         */
        add: function(targets, type, fn, scope /* optional */, data/*internal usage*/) {
            // data : 附加在回调后面的数据，delegate 检查使用
            // remove 时 data 相等(指向同一对象或者定义了 equals 比较函数)
            if (batchForType('add', targets, type, fn, scope, data)) {
                return targets;
            }

            DOM.query(targets).each(function(target) {
                Event.__add(true, target, type, fn, scope, data);
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

        // single target, single type, fixed native
        __remove:function(isNativeTarget, target, type, fn, scope, data) {

            if (
                !target ||
                    (isNativeTarget && !isValidTarget(target))
                ) {
                return;
            }

            var eventDesc = Event._data(target),
                events = eventDesc && eventDesc.events,
                handlers,
                len,
                i,
                j,
                t,
                special = (isNativeTarget && EVENT_SPECIAL[type]) || { };

            if (!events) {
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

            if ((handlers = events[type])) {
                len = handlers.length;
                // 移除 fn
                if (fn && len) {
                    for (i = 0,j = 0,t = []; i < len; ++i) {
                        var reserve = false,
                            handler = handlers[i],
                            handlerScope = handler.scope || target;
                        if (fn !== handler.fn
                            || scope !== handlerScope) {
                            t[j++] = handler;
                            reserve = true;
                        } else if (data !== data2) {
                            var data2 = handler.data;
                            // undelgate 不能 remove 普通 on 的 handler
                            // remove 不能 remove delegate 的 handler
                            if (!data && data2
                                || data2 && !data
                                ) {
                                t[j++] = handler;
                                reserve = true;
                            } else if (data && data2) {
                                if (!data.equals || !data2.equals) {
                                    S.error("no equals in data");
                                } else if (!data2.equals(data)) {
                                    t[j++] = handler;
                                    reserve = true;
                                }
                            }
                        }
                        if (!reserve && special.remove) {
                            special.remove.call(target, handler);
                        }
                    }
                    events[type] = t;
                    len = t.length;
                }

                // remove(el, type) or fn 已移除光
                if (fn === undefined || len === 0) {
                    // dom node need to detach handler from dom node
                    if (isNativeTarget &&
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
        },

        /**
         * Detach an event or set of events from an element.
         */
        remove: function(targets, type /* optional */, fn /* optional */, scope /* optional */, data/*internal usage*/) {
            if (batchForType('remove', targets, type, fn, scope)) {
                return targets;
            }
            DOM.query(targets).each(function(target) {
                Event.__remove(true, target, type, fn, scope, data);
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
                // 传入附件参数data，目前用于委托
                ret = listener.fn.call(listener.scope || target,
                    event, listener.data);

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
         * @return undefined
         */
        fire: function(targets, eventType, eventData, onlyHandlers) {
            if (!batchForType("fire", targets, eventType, eventData, onlyHandlers)) {
                // custom event firing moved to target.js
                eventData = eventData || {};
                // protect event type
                eventData.type = eventType;
                DOM.query(targets).each(function(target) {
                    fireDOMEvent(target, eventType, eventData, onlyHandlers);
                });
            }
        },

        __batchForType:batchForType,
        __simpleAdd:simpleAdd,
        __simpleRemove:simpleRemove
    };

    // shorthand
    Event.on = Event.add;
    Event.detach = Event.remove;

    function batchForType(methodName, targets, types) {
        // on(target, 'click focus', fn)
        if ((types = S.trim(types)) && types.indexOf(SPACE) > 0) {
            var args = makeArray(arguments);
            each(types.split(/\s+/), function(type) {
                var args2 = [].concat(args);
                args2.splice(0, 3, targets, type);
                Event[methodName].apply(Event, args2);
            });
            return true;
        }
        return 0;
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
        var special = EVENT_SPECIAL[type] || {};
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
        if (!isValidTarget(target)) {
            return;
        }
        var event = new EventObject(target, undefined, eventType);
        S.mix(event, eventData);
        // protect type
        event.type = eventType;
        // 只运行自己的绑定函数，不冒泡也不触发默认行为
        if (onlyHandlers) {
            event.halt();
        }
        var cur = target,
            ontype = "on" + eventType;

        //bubble up dom tree
        do{
            event.currentTarget = cur;
            Event._handle(cur, event);
            // Trigger an inline bound script
            if (cur[ ontype ] && cur[ ontype ].call(cur) === false) {
                event.preventDefault();
            }
            // Bubble up to document, then to window
            cur = cur.parentNode ||
                cur.ownerDocument ||
                cur === target.ownerDocument && window;
        } while (cur && !event.isPropagationStopped);

        if (!event.isDefaultPrevented) {
            if (!(eventType === "click" && nodeName(target, "a"))) {
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
                    S.log("trigger action error : ");
                    S.log(ieError);
                }

                if (old) {
                    target[ ontype ] = old;
                }

                Event_Triggered = TRIGGERED_NONE;
            }
        }
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
 * @author  yiminghe@gmail.com
 */
KISSY.add('event/target', function(S, Event, EventObject) {
    var KS_PUBLISH = "__~ks_publish",
        KS_BUBBLE_TARGETS = "__~ks_bubble_targets",
        ALL_EVENT = "*";

    function getCustomEvent(self, type, eventData) {
        if (eventData instanceof EventObject) {
            // set currentTarget in the process of bubbling
            eventData.currentTarget = self;
            return eventData;
        }
        var customEvent = new EventObject(self, undefined, type);
        if (S.isPlainObject(eventData)) {
            S.mix(customEvent, eventData);
        }
        // protect type
        customEvent.type = type;
        return customEvent
    }

    function getEventPublishObj(self) {
        self[KS_PUBLISH] = self[KS_PUBLISH] || {};
        return self[KS_PUBLISH];
    }

    function getBubbleTargetsObj(self) {
        self[KS_BUBBLE_TARGETS] = self[KS_BUBBLE_TARGETS] || {};
        return self[KS_BUBBLE_TARGETS];
    }

    function isBubblable(self, eventType) {
        var publish = getEventPublishObj(self);
        return publish[eventType] && publish[eventType].bubbles || publish[ALL_EVENT] && publish[ALL_EVENT].bubbles
    }

    function attach(method) {
        return function(type, fn, scope) {
            var self = this;
            S.each(S.trim(type).split(/\s+/), function(t) {
                Event["__" + method](false, self, t, fn, scope);
            });
            return self; // chain
        };
    }

    /**
     * 提供事件发布和订阅机制
     * @name Target
     * @memberOf Event
     */
    var Target =
    /**
     * @lends Event.Target
     */
    {
        /**
         * 触发事件
         * @param {String} type 事件名
         * @param {Object} eventData 事件附加信息对象
         * @returns 如果一个 listener 返回false，则返回 false ，否则返回最后一个 listener 的值.
         */
        fire: function(type, eventData) {
            var self = this,
                ret,
                r2,
                customEvent = getCustomEvent(self, type, eventData);
            ret = Event._handle(self, customEvent);
            if (!customEvent.isPropagationStopped && isBubblable(self, type)) {
                r2 = self.bubble(type, customEvent);
                // false 优先返回
                if (r2 === false) {
                    ret = r2;
                }
            }
            return ret
        },

        /**
         * defined event config
         * @param type
         * @param cfg
         *        example { bubbles: true}
         *        default bubbles: false
         */
        publish: function(type, cfg) {
            var self = this,
                publish = getEventPublishObj(self);
            publish[type] = cfg;
        },

        /**
         * bubble event to its targets
         * @param type
         * @param eventData
         */
        bubble: function(type, eventData) {
            var self = this,
                ret,
                targets = getBubbleTargetsObj(self);
            S.each(targets, function(t) {
                var r2 = t.fire(type, eventData);
                if (ret !== false) {
                    ret = r2;
                }
            });
            return ret;
        },

        /**
         * add target which bubblable event bubbles towards
         * @param target another EventTarget instance
         */
        addTarget: function(target) {
            var self = this,
                targets = getBubbleTargetsObj(self);
            targets[S.stamp(target)] = target;
        },

        removeTarget:function(target) {
            var self = this,
                targets = getBubbleTargetsObj(self);
            delete targets[S.stamp(target)];
        },

        /**
         * 监听事件
         * @param {String} type 事件名
         * @param {Function} fn 事件处理器
         * @param {Object} scope 事件处理器内的 this 值，默认当前实例
         * @returns 当前实例
         */
        on: attach("add")
    };

    /**
     * 取消监听事件
     * @param {String} type 事件名
     * @param {Function} fn 事件处理器
     * @param {Object} scope 事件处理器内的 this 值，默认当前实例
     * @returns 当前实例
     */
    Target.detach = attach("remove");

    return Target;
}, {
    /*
     实际上只需要 dom/data ，但是不要跨模块引用另一模块的子模块，
     否则会导致build打包文件 dom 和 dom-data 重复载入
     */
    requires:["./base",'./object']
});
/**
 *  2011-10-17
 *    yiminghe: implement bubble for custom event
 **/

/**
 * @module  event-focusin
 * @author  yiminghe@gmail.com
 */
KISSY.add('event/focusin', function(S, UA, Event) {

    // 让非 IE 浏览器支持 focusin/focusout
    if (!UA['ie']) {
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

    var doc = document,
        docMode = doc['documentMode'],
        ie = docMode || UA['ie'],
        HASH_CHANGE = 'hashchange';

    // ie8 支持 hashchange
    // 但IE8以上切换浏览器模式到IE7（兼容模式），会导致 'onhashchange' in window === true，但是不触发事件

    // 1. 不支持 hashchange 事件，支持 hash 导航(opera??)：定时器监控
    // 2. 不支持 hashchange 事件，不支持 hash 导航(ie67) : iframe + 定时器
    if ((!( 'on' + HASH_CHANGE in window)) || ie && ie < 8) {


        function getIframeDoc(iframe) {
            return iframe.contentWindow.document;
        }

        var POLL_INTERVAL = 50,
            win = window,
            IFRAME_TEMPLATE = "<html><head><title>" + (doc.title || "") +
                " - {hash}</title>{head}</head><body>{hash}</body></html>",

            getHash = function() {
                // 不能 location.hash
                // http://xx.com/#yy?z=1
                // ie6 => location.hash = #yy
                // 其他浏览器 => location.hash = #yy?z=1
                var url = location.href;
                return '#' + url.replace(/^[^#]*#?(.*)$/, '$1');
            },

            timer,

            // 用于定时器检测，上次定时器记录的 hash 值
            lastHash,

            poll = function () {
                var hash = getHash();
                if (hash !== lastHash) {
                    // S.log("poll success :" + hash + " :" + lastHash);
                    // 通知完调用者 hashchange 事件前设置 lastHash
                    lastHash = hash;
                    // ie<8 同步 : hashChange -> onIframeLoad
                    hashChange(hash);
                }
                timer = setTimeout(poll, POLL_INTERVAL);
            },

            hashChange = ie && ie < 8 ? function(hash) {
                // S.log("set iframe html :" + hash);
                //debugger
                var html = S.substitute(IFRAME_TEMPLATE, {
                    hash: hash,
                    // 一定要加哦
                    head:DOM._isCustomDomain() ? "<script>document.domain = '" +
                        doc.domain
                        + "';</script>" : ""
                }),
                    iframeDoc = getIframeDoc(iframe);
                try {
                    // 写入历史 hash
                    iframeDoc.open();
                    // 取时要用 innerText !!
                    // 否则取 innerHtml 会因为 escapeHtml 导置 body.innerHTMl != hash
                    iframeDoc.write(html);
                    iframeDoc.close();
                    // 立刻同步调用 onIframeLoad !!!!
                } catch (e) {
                    // S.log('doc write error : ', 'error');
                    // S.log(e, 'error');
                }
            } : function () {
                notifyHashChange();
            },

            notifyHashChange = function () {
                // S.log("hash changed : " + getHash());
                Event.fire(win, HASH_CHANGE);
            },
            setup = function () {
                if (!timer) {
                    poll();
                }
            },
            tearDown = function () {
                timer && clearTimeout(timer);
                timer = 0;
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
                    var iframeSrc = DOM._genEmptyIframeSrc();
                    //http://www.paciellogroup.com/blog/?p=604
                    iframe = DOM.create('<iframe ' +
                        (iframeSrc ? 'src="' + iframeSrc + '"' : '') +
                        ' style="display: none" ' +
                        'height="0" ' +
                        'width="0" ' +
                        'tabindex="-1" ' +
                        'title="empty"/>');
                    // Append the iframe to the documentElement rather than the body.
                    // Keeping it outside the body prevents scrolling on the initial
                    // page load
                    DOM.prepend(iframe, doc.documentElement);

                    // init，第一次触发，以后都是 onIframeLoad
                    Event.add(iframe, "load", function() {
                        Event.remove(iframe, "load");
                        // Update the iframe with the initial location hash, if any. This
                        // will create an initial history entry that the user can return to
                        // after the state has changed.
                        hashChange(getHash());
                        Event.add(iframe, "load", onIframeLoad);
                        poll();
                    });

                    // Whenever `document.title` changes, update the Iframe's title to
                    // prettify the back/next history menu entries. Since IE sometimes
                    // errors with "Unspecified error" the very first time this is set
                    // (yes, very useful) wrap this with a try/catch block.
                    doc.onpropertychange = function() {
                        try {
                            if (event.propertyName === 'title') {
                                getIframeDoc(iframe).title =
                                    doc.title + " - " + getHash();
                            }
                        } catch(e) {
                        }
                    };

                    /**
                     * 前进后退 ： onIframeLoad -> 触发
                     * 直接输入 : timer -> hashChange -> onIframeLoad -> 触发
                     * 触发统一在 start(load)
                     * iframe 内容和 url 同步
                     */
                    function onIframeLoad() {
                        // S.log('iframe start load..');
                        // debugger
                        // 2011.11.02 note: 不能用 innerHtml 会自动转义！！
                        // #/x?z=1&y=2 => #/x?z=1&amp;y=2
                        var c = S.trim(getIframeDoc(iframe).body.innerText),
                            ch = getHash();

                        // 后退时不等
                        // 定时器调用 hashChange() 修改 iframe 同步调用过来的(手动改变 location)则相等
                        if (c != ch) {
                            S.log("set loc hash :" + c);
                            location.hash = c;
                            // 使lasthash为 iframe 历史， 不然重新写iframe，
                            // 会导致最新状态（丢失前进状态）

                            // 后退则立即触发 hashchange，
                            // 并更新定时器记录的上个 hash 值
                            lastHash = c;
                        }
                        notifyHashChange();
                    }
                }
            };

            tearDown = function() {
                timer && clearTimeout(timer);
                timer = 0;
                Event.detach(iframe);
                DOM.remove(iframe);
                iframe = 0;
            };
        }

        Event.special[HASH_CHANGE] = {
            setup: function() {
                if (this !== win) {
                    return;
                }
                // 第一次启动 hashchange 时取一下，不能类库载入后立即取
                // 防止类库嵌入后，手动修改过 hash，
                lastHash = getHash();
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
 * 已知 bug :
 * - ie67 有时后退后取得的 location.hash 不和地址栏一致，导致必须后退两次才能触发 hashchange
 *
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
        nodeName = DOM._nodeName,
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
            var target = this;
            if (nodeName(target, "input")
                || nodeName(target, "textarea")) {
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
    var batchForType = Event.__batchForType,
        delegateMap = {
            "focus":{
                type:"focusin"
            },
            "blur":{
                type:"focusout"
            },
            "mouseenter":{
                type:"mouseover",
                handler:mouseHandler
            },
            "mouseleave":{
                type:"mouseout",
                handler:mouseHandler
            }
        };

    S.mix(Event, {
        delegate:function(targets, type, selector, fn, scope) {
            if (batchForType('delegate', targets, type, selector, fn, scope)) {
                return targets;
            }
            DOM.query(targets).each(function(target) {
                var preType = type,handler = delegateHandler;
                if (delegateMap[type]) {
                    type = delegateMap[preType].type;
                    handler = delegateMap[preType].handler || handler;
                }
                Event.on(target, type, handler, target, {
                    fn:fn,
                    selector:selector,
                    preType:preType,
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
                var preType = type,
                    handler = delegateHandler;
                if (delegateMap[type]) {
                    type = delegateMap[preType].type;
                    handler = delegateMap[preType].handler || handler;
                }
                Event.remove(target, type, handler, target, {
                    fn:fn,
                    selector:selector,
                    preType:preType,
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

    // 根据 selector ，从事件源得到对应节点
    function delegateHandler(event, data) {
        var delegateTarget = this,
            target = event.target,
            invokeds = DOM.closest(target, [data.selector], delegateTarget);

        // 找到了符合 selector 的元素，可能并不是事件源
        return invokes.call(delegateTarget, invokeds, event, data);
    }

    // mouseenter/leave 特殊处理
    function mouseHandler(event, data) {
        var delegateTarget = this,
            ret,
            target = event.target,
            relatedTarget = event.relatedTarget;
        // 恢复为用户想要的 mouseenter/leave 类型
        event.type = data.preType;
        // mouseenter/leave 不会冒泡，只选择最近一个
        target = DOM.closest(target, data.selector, delegateTarget);
        if (target) {
            if (target !== relatedTarget &&
                (!relatedTarget || !DOM.contains(target, relatedTarget))
                ) {
                var currentTarget = event.currentTarget;
                event.currentTarget = target;
                ret = data.fn.call(data.scope || delegateTarget, event);
                event.currentTarget = currentTarget;
            }
        }
        return ret;
    }


    function invokes(invokeds, event, data) {
        var self = this;
        if (invokeds) {
            // 保护 currentTarget
            // 否则 fire 影响 delegated listener 之后正常的 listener 事件
            var currentTarget = event.currentTarget;
            for (var i = 0; i < invokeds.length; i++) {
                event.currentTarget = invokeds[i];
                var ret = data.fn.call(data.scope || self, event);
                // delegate 的 handler 操作事件和根元素本身操作事件效果一致
                if (ret === false) {
                    event.halt();
                }
                if (event.isPropagationStopped) {
                    break;
                }
            }
            event.currentTarget = currentTarget;
        }
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
 * mouseenter/leave delegate 特殊处理， mouseenter 没有冒泡的概念，只能替换为 mouseover/out
 *
 * form submit 事件 ie<9 不会冒泡
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

                    // 在自身外边就触发
                    if (parent !== self &&
                        // self==document , parent==null
                        (!parent || !DOM.contains(self, parent))
                        ) {
                        // handle event if we actually just moused on to a non sub-element
                        Event._handle(self, event);
                    }

                    // assuming we've left the element since we most likely mousedover a xul element
                } catch(e) {
                    S.log("withinElement error : ", "error");
                    S.log(e, "error");
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

/**
 * patch for ie<9 submit : does not bubble !
 * @author yiminghe@gmail.com
 */
KISSY.add("event/submit", function(S, UA, Event, DOM) {
    var mode = document['documentMode'];
    if (UA['ie'] && (UA['ie'] < 9 || (mode && mode < 9))) {
        var nodeName = DOM._nodeName;
        Event.special['submit'] = {
            setup: function() {
                var el = this;
                // form use native
                if (nodeName(el, "form")) {
                    return false;
                }
                // lazy add submit for inside forms
                // note event order : click/keypress -> submit
                // keypoint : find the forms
                Event.on(el, "click keypress", detector);
            },
            tearDown:function() {
                var el = this;
                // form use native
                if (nodeName(el, "form")) {
                    return false;
                }
                Event.remove(el, "click keypress", detector);
                DOM.query("form", el).each(function(form) {
                    if (form.__submit__fix) {
                        form.__submit__fix = 0;
                        Event.remove(form, "submit", submitBubble);
                    }
                });
            }
        };


        function detector(e) {
            var t = e.target,
                form = nodeName(t, "input") || nodeName(t, "button") ? t.form : null;

            if (form && !form.__submit__fix) {
                form.__submit__fix = 1;
                Event.on(form, "submit", submitBubble);
            }
        }

        function submitBubble(e) {
            var form = this;
            if (form.parentNode) {
                // simulated bubble for submit
                // fire from parentNode. if form.on("submit") , this logic is never run!
                Event.fire(form.parentNode, "submit", e);
            }
        }


    }

}, {
    requires:["ua","./base","dom"]
});
/**
 * modified from jq ,fix submit in ie<9
 **/

/**
 * change bubble and checkbox/radio fix patch for ie<9
 * @author yiminghe@gmail.com
 */
KISSY.add("event/change", function(S, UA, Event, DOM) {
    var mode = document['documentMode'];

    if (UA['ie'] && (UA['ie'] < 9 || (mode && mode < 9))) {

        var rformElems = /^(?:textarea|input|select)$/i;

        function isFormElement(n) {
            return rformElems.test(n.nodeName);
        }

        function isCheckBoxOrRadio(el) {
            var type = el.type;
            return type == "checkbox" || type == "radio";
        }

        Event.special['change'] = {
            setup: function() {
                var el = this;
                if (isFormElement(el)) {
                    // checkbox/radio only fires change when blur in ie<9
                    // so use another technique from jquery
                    if (isCheckBoxOrRadio(el)) {
                        // change in ie<9
                        // change = propertychange -> click
                        Event.on(el, "propertychange", propertyChange);
                        Event.on(el, "click", onClick);
                    } else {
                        // other form elements use native , do not bubble
                        return false;
                    }
                } else {
                    // if bind on parentNode ,lazy bind change event to its form elements
                    // note event order : beforeactivate -> change
                    // note 2: checkbox/radio is exceptional
                    Event.on(el, "beforeactivate", beforeActivate);
                }
            },
            tearDown:function() {
                var el = this;
                if (isFormElement(el)) {
                    if (isCheckBoxOrRadio(el)) {
                        Event.remove(el, "propertychange", propertyChange);
                        Event.remove(el, "click", onClick);
                    } else {
                        return false;
                    }
                } else {
                    Event.remove(el, "beforeactivate", beforeActivate);
                    DOM.query("textarea,input,select", el).each(function(fel) {
                        if (fel.__changeHandler) {
                            fel.__changeHandler = 0;
                            Event.remove(fel, "change", changeHandler);
                        }
                    });
                }
            }
        };

        function propertyChange(e) {
            if (e.originalEvent.propertyName == "checked") {
                this.__changed = 1;
            }
        }

        function onClick(e) {
            if (this.__changed) {
                this.__changed = 0;
                // fire from itself
                Event.fire(this, "change", e);
            }
        }

        function beforeActivate(e) {
            var t = e.target;
            if (isFormElement(t) && !t.__changeHandler) {
                t.__changeHandler = 1;
                // lazy bind change
                Event.on(t, "change", changeHandler);
            }
        }

        function changeHandler(e) {
            var fel = this;
            // checkbox/radio already bubble using another technique
            if (isCheckBoxOrRadio(fel)) {
                return;
            }
            var p;
            if (p = fel.parentNode) {
                // fire from parent , itself is handled natively
                Event.fire(p, "change", e);
            }
        }

    }
}, {
    requires:["ua","./base","dom"]
});

/**
 * normalize mousewheel in gecko
 * @author yiminghe@gmail.com
 */
KISSY.add("event/mousewheel", function(S, Event, UA) {

    var MOUSE_WHEEL = UA.gecko ? 'DOMMouseScroll' : 'mousewheel',
        mousewheelHandler = "mousewheelHandler";

    function handler(e) {
        var eventDesc = Event._data(this),
            eventHandler = eventDesc.handler,
            deltaX,
            deltaY,
            delta,
            detail = e.detail;

        if (e.wheelDelta) {
            delta = e.wheelDelta / 120;
        }
        if (e.detail) {
            // press control e.detail == 1 else e.detail == 3
            delta = -(detail % 3 == 0 ? detail / 3 : detail);
        }

        // Gecko
        if (e.axis !== undefined) {
            if (e.axis === e['HORIZONTAL_AXIS']) {
                deltaY = 0;
                deltaX = -1 * delta;
            } else if (e.axis === e['VERTICAL_AXIS']) {
                deltaX = 0;
                deltaY = delta;
            }
        }

        // Webkit
        if (e['wheelDeltaY'] !== undefined) {
            deltaY = e['wheelDeltaY'] / 120;
        }
        if (e['wheelDeltaX'] !== undefined) {
            deltaX = -1 * e['wheelDeltaX'] / 120;
        }

        // 默认 deltaY ( ie )
        if (!deltaX && !deltaY) {
            deltaY = delta;
        }

        return eventHandler(e, {
            deltaY:deltaY,
            delta:delta,
            deltaX:deltaX,
            type:'mousewheel'
        });
    }

    Event.special['mousewheel'] = {
        setup: function() {
            var el = this,
                mousewheelHandler,
                eventDesc = Event._data(el);
            // solve this in ie
            mousewheelHandler = eventDesc[mousewheelHandler] = S.bind(handler, el);
            Event.__simpleAdd(this, MOUSE_WHEEL, mousewheelHandler);
        },
        tearDown:function() {
            var el = this,
                mousewheelHandler,
                eventDesc = Event._data(el);
            mousewheelHandler = eventDesc[mousewheelHandler];
            Event.__simpleRemove(this, MOUSE_WHEEL, mousewheelHandler);
            delete eventDesc[mousewheelHandler];
        }
    };

}, {
    requires:['./base','ua','./object']
});

/**
 note:
 not perfect in osx : accelerated scroll
 refer:
 https://github.com/brandonaaron/jquery-mousewheel/blob/master/jquery.mousewheel.js
 http://www.planabc.net/2010/08/12/mousewheel_event_in_javascript/
 http://www.switchonthecode.com/tutorials/javascript-tutorial-the-scroll-wheel
 http://stackoverflow.com/questions/5527601/normalizing-mousewheel-speed-across-browsers/5542105#5542105
 http://www.javascriptkit.com/javatutors/onmousewheel.shtml
 http://www.adomas.org/javascript-mouse-wheel/
 http://plugins.jquery.com/project/mousewheel
 http://www.cnblogs.com/aiyuchen/archive/2011/04/19/2020843.html
 http://www.w3.org/TR/DOM-Level-3-Events/#events-mousewheelevents
 **/

/**
 * KISSY Scalable Event Framework
 * @author yiminghe@gmail.com
 */
KISSY.add("event", function(S, KeyCodes, Event, Target, Object) {
    Event.KeyCodes = KeyCodes;
    Event.Target = Target;
    Event.Object = Object;
    return Event;
}, {
    requires:[
        "event/keycodes",
        "event/base",
        "event/target",
        "event/object",
        "event/focusin",
        "event/hashchange",
        "event/valuechange",
        "event/delegate",
        "event/mouseenter",
        "event/submit",
        "event/change",
        "event/mousewheel"
    ]
});

/**
 * definition for node and nodelist
 * @author yiminghe@gmail.com,lifesinger@gmail.com
 */
KISSY.add("node/base", function(S, DOM, undefined) {

    var AP = Array.prototype,
        makeArray = S.makeArray,
        isNodeList = DOM._isNodeList;

    /**
     * The NodeList class provides a wrapper for manipulating DOM Node.
     * @constructor
     */
    function NodeList(html, props, ownerDocument) {
        var self = this,
            domNode;

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
            if (domNode.nodeType === DOM.DOCUMENT_FRAGMENT_NODE) { // fragment
                AP.push.apply(this, makeArray(domNode.childNodes));
                return undefined;
            }
        }

        else if (S.isArray(html) || isNodeList(html)) {
            AP.push.apply(this, makeArray(html));
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
            var self = this;
            if (S.isNumber(index)) {
                if (index >= self.length) {
                    return null;
                } else {
                    return new NodeList(self[index]);
                }
            } else {
                return new NodeList(index);
            }
        },

        add:function(selector, context, index) {
            if (S.isNumber(context)) {
                index = context;
                context = undefined;
            }
            var list = NodeList.all(selector, context).getDOMNodes(),
                ret = new NodeList(this);
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
            return new NodeList(AP.slice.call(this, start, end));
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
            var self = this;

            S.each(self, function(n, i) {
                n = new NodeList(n);
                return fn.call(context || n, n, i, self);
            });

            return self;
        },
        /**
         * Retrieves the DOMNode.
         */
        getDOMNode: function() {
            return this[0];
        },

        /**
         * stack sub query
         */
        end:function() {
            var self = this;
            return self.__parent || self;
        },

        all:function(selector) {
            var ret,self = this;
            if (self.length > 0) {
                ret = NodeList.all(selector, self);
            } else {
                ret = new NodeList();
            }
            ret.__parent = self;
            return ret;
        },

        one:function(selector) {
            var self = this,all = self.all(selector),
                ret = all.length ? all.slice(0, 1) : null;
            if (ret) {
                ret.__parent = self;
            }
            return ret;
        }
    });

    S.mix(NodeList, {
        /**
         * 查找位于上下文中并且符合选择器定义的节点列表或根据 html 生成新节点
         * @param {String|HTMLElement[]|NodeList} selector html 字符串或<a href='http://docs.kissyui.com/docs/html/api/core/dom/selector.html'>选择器</a>或节点列表
         * @param {String|Array<HTMLElement>|NodeList|HTMLElement|Document} [context] 上下文定义
         * @returns {NodeList} 节点列表对象
         */
        all:function(selector, context) {
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
            return new NodeList(DOM.query(selector, context));
        },
        one:function(selector, context) {
            var all = NodeList.all(selector, context);
            return all.length ? all.slice(0, 1) : null;
        }
    });

    S.mix(NodeList, DOM._NODE_TYPE);

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
        makeArray = S.makeArray,
        // DOM 添加到 NP 上的方法
        // if DOM methods return undefined , Node methods need to transform result to itself
        DOM_INCLUDES_NORM = [
            "equals",
            "contains",
            "scrollTop",
            "scrollLeft",
            "height",
            "width",
            "innerHeight",
            "innerWidth",
            "outerHeight",
            "outerWidth",
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
//            "toggle",
            "scrollIntoView",
            "remove",
            "empty",
            "removeData",
            "hasData",
            "unselectable"
        ],
        // if return array ,need transform to nodelist
        DOM_INCLUDES_NORM_NODE_LIST = [
            "filter",
            "first",
            "parent",
            "closest",
            "next",
            "prev",
            "clone",
            "siblings",
            "children"
        ],
        // if set return this else if get return true value ,no nodelist transform
        DOM_INCLUDES_NORM_IF = {
            // dom method : set parameter index
            "attr":1,
            "text":0,
            "css":1,
            "style":1,
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
        if (ret === undefined) {
            return self;
        }
        return ret;
    }

    function accessNormList(fn, self, args) {
        args.unshift(self);
        var ret = DOM[fn].apply(DOM, args);
        if (ret === undefined) {
            return self;
        }
        else if (ret === null) {
            return null;
        }
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
            var args = makeArray(arguments);
            return accessNorm(k, this, args);
        };
    });

    S.each(DOM_INCLUDES_NORM_NODE_LIST, function(k) {
        NLP[k] = function() {
            var args = makeArray(arguments);
            return accessNormList(k, this, args);
        };
    });

    S.each(DOM_INCLUDES_NORM_IF, function(index, k) {
        NLP[k] = function() {
            var args = makeArray(arguments);
            return accessNormIf(k, this, index, args);
        };
    });

    S.each(EVENT_INCLUDES, function(k) {
        NLP[k] = function() {
            var args = makeArray(arguments);
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
            if (newNode) {
                DOM[insertType](newNode, self);
            }
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
KISSY.add('anim/easing', function() {

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

    var PI = Math.PI,
        pow = Math.pow,
        sin = Math.sin,
        BACK_CONST = 1.70158,

        Easing = {

            swing:function(t) {
                return ( -Math.cos(t * PI) / 2 ) + 0.5;
            },

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
 * @author  yiminghe@gmail.com
 */
KISSY.add("anim/manager", function(S) {
    var stamp = S.stamp;

    return {
        interval:15,
        runnings:{},
        timer:null,
        start:function(anim) {
            var self = this,
                kv = stamp(anim);
            if (self.runnings[kv]) {
                return;
            }
            self.runnings[kv] = anim;
            self.startTimer();
        },
        stop:function(anim) {
            this.notRun(anim);
        },
        notRun:function(anim) {
            var self = this,
                kv = stamp(anim);
            delete self.runnings[kv];
            if (S.isEmptyObject(self.runnings)) {
                self.stopTimer();
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
                    if (!self.runFrames()) {
                        self.timer = 0;
                        self.startTimer();
                    } else {
                        self.stopTimer();
                    }
                }, self.interval);
            }
        },
        stopTimer:function() {
            var self = this,
                t = self.timer;
            if (t) {
                clearTimeout(t);
                self.timer = 0;
            }
        },
        runFrames:function() {
            var self = this,
                done = 1,
                runnings = self.runnings;
            for (var r in runnings) {
                if (runnings.hasOwnProperty(r)) {
                    done = 0;
                    runnings[r]._frame();
                }
            }
            return done;
        }
    };
});

/**
 * animate on single property
 * @author yiminghe@gmail.com
 */
KISSY.add("anim/fx", function(S, DOM, undefined) {

    /**
     * basic animation about single css property or element attribute
     * @param cfg
     */
    function Fx(cfg) {
        this.load(cfg);
    }

    S.augment(Fx, {

        load:function(cfg) {
            var self = this;
            S.mix(self, cfg);
            self.startTime = S.now();
            self.pos = 0;
            self.unit = self.unit || "";
        },

        frame:function(end) {
            var self = this,
                endFlag = 0,
                elapsedTime,
                t = S.now();
            if (end || t >= self.duration + self.startTime) {
                self.pos = 1;
                endFlag = 1;
            } else {
                elapsedTime = t - self.startTime;
                self.pos = self.easing(elapsedTime / self.duration);
            }
            self.update();
            return endFlag;
        },

        /**
         * 数值插值函数
         * @param {Number} from 源值
         * @param {Number} to 目的值
         * @param {Number} pos 当前位置，从 easing 得到 0~1
         * @return {Number} 当前值
         */
        interpolate:function (from, to, pos) {
            // 默认只对数字进行 easing
            if (S.isNumber(from) &&
                S.isNumber(to)) {
                return (from + (to - from) * pos).toFixed(3);
            } else {
                return undefined;
            }
        },

        update:function() {
            var self = this,
                prop = self.prop,
                elem = self.elem,
                from = self.from,
                to = self.to,
                val = self.interpolate(from, to, self.pos);

            if (val === undefined) {
                // 插值出错，直接设置为最终值
                if (!self.finished) {
                    self.finished = 1;
                    DOM.css(elem, prop, to);
                    S.log(self.prop + " update directly ! : " + val + " : " + from + " : " + to);
                }
            } else {
                val += self.unit;
                if (isAttr(elem, prop)) {
                    DOM.attr(elem, prop, val, 1);
                } else {
                    DOM.css(elem, prop, val);
                }
            }
        },

        /**
         * current value
         */
        cur:function() {
            var self = this,
                prop = self.prop,
                elem = self.elem;
            if (isAttr(elem, prop)) {
                return DOM.attr(elem, prop, undefined, 1);
            }
            var parsed,
                r = DOM.css(elem, prop);
            // Empty strings, null, undefined and "auto" are converted to 0,
            // complex values such as "rotate(1rad)" are returned as is,
            // simple values such as "10px" are parsed to Float.
            return isNaN(parsed = parseFloat(r)) ?
                !r || r === "auto" ? 0 : r
                : parsed;
        }
    });

    function isAttr(elem, prop) {
        // support scrollTop/Left now!
        if ((!elem.style || elem.style[ prop ] == null) &&
            DOM.attr(elem, prop, undefined, 1) != null) {
            return 1;
        }
        return 0;
    }

    Fx.Factories = {};

    Fx.getFx = function(cfg) {
        var Constructor = Fx.Factories[cfg.prop] || Fx;
        return new Constructor(cfg);
    };

    return Fx;

}, {
    requires:['dom']
});
/**
 * TODO
 * 支持 transform ,ie 使用 matrix
 *  - http://shawphy.com/2011/01/transformation-matrix-in-front-end.html
 *  - http://www.cnblogs.com/winter-cn/archive/2010/12/29/1919266.html
 *  - 标准：http://www.zenelements.com/blog/css3-transform/
 *  - ie: http://www.useragentman.com/IETransformsTranslator/
 *  - wiki: http://en.wikipedia.org/wiki/Transformation_matrix
 *  - jq 插件: http://plugins.jquery.com/project/2d-transform
 **/

/**
 * queue of anim objects
 * @author yiminghe@gmail.com
 */
KISSY.add("anim/queue", function(S, DOM) {

    var /*队列集合容器*/
        queueCollectionKey = S.guid("ks-queue-" + S.now() + "-"),
        /*默认队列*/
        queueKey = S.guid("ks-queue-" + S.now() + "-"),
        // 当前队列是否有动画正在执行
        processing = "...";

    function getQueue(elem, name, readOnly) {
        name = name || queueKey;

        var qu,
            quCollection = DOM.data(elem, queueCollectionKey);

        if (!quCollection && !readOnly) {
            DOM.data(elem, queueCollectionKey, quCollection = {});
        }

        if (quCollection) {
            qu = quCollection[name];
            if (!qu && !readOnly) {
                qu = quCollection[name] = [];
            }
        }

        return qu;
    }

    function removeQueue(elem, name) {
        name = name || queueKey;
        var quCollection = DOM.data(elem, queueCollectionKey);
        if (quCollection) {
            delete quCollection[name];
        }
        if (S.isEmptyObject(quCollection)) {
            DOM.removeData(elem, queueCollectionKey);
        }
    }

    var q = {

        queueCollectionKey:queueCollectionKey,

        queue:function(anim) {
            var elem = anim.elem,
                name = anim.config.queue,
                qu = getQueue(elem, name);
            qu.push(anim);
            if (qu[0] !== processing) {
                q.dequeue(anim);
            }
            return qu;
        },

        remove:function(anim) {
            var elem = anim.elem,
                name = anim.config.queue,
                qu = getQueue(elem, name, 1),index;
            if (qu) {
                index = S.indexOf(anim, qu);
                if (index > -1) {
                    qu.splice(index, 1);
                }
            }
        },

        removeQueues:function(elem) {
            DOM.removeData(elem, queueCollectionKey);
        },

        removeQueue:removeQueue,

        dequeue:function(anim) {
            var elem = anim.elem,
                name = anim.config.queue,
                qu = getQueue(elem, name, 1),
                nextAnim = qu && qu.shift();

            if (nextAnim == processing) {
                nextAnim = qu.shift();
            }

            if (nextAnim) {
                qu.unshift(processing);
                nextAnim._runInternal();
            } else {
                // remove queue data
                removeQueue(elem, name);
            }
        }

    };
    return q;
}, {
    requires:['dom']
});

/**
 * animation framework for KISSY
 * @author   yiminghe@gmail.com,lifesinger@gmail.com
 */
KISSY.add('anim/base', function(S, DOM, Event, Easing, UA, AM, Fx, Q) {

    var camelCase = DOM._camelCase,
        _isElementNode = DOM._isElementNode,
        specialVals = ["hide","show","toggle"],
        // shorthand css properties
        SHORT_HANDS = {
            border:[
                "borderBottomWidth",
                "borderLeftWidth",
                'borderRightWidth',
                // 'borderSpacing', 组合属性？
                'borderTopWidth'
            ],
            "borderBottom":["borderBottomWidth"],
            "borderLeft":["borderLeftWidth"],
            borderTop:["borderTopWidth"],
            borderRight:["borderRightWidth"],
            font:[
                'fontSize',
                'fontWeight'
            ],
            margin:[
                'marginBottom',
                'marginLeft',
                'marginRight',
                'marginTop'
            ],
            padding:[
                'paddingBottom',
                'paddingLeft',
                'paddingRight',
                'paddingTop'
            ]
        },
        defaultConfig = {
            duration: 1,
            easing: 'easeNone'
        },
        rfxnum = /^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i;

    Anim.SHORT_HANDS = SHORT_HANDS;


    /**
     * get a anim instance associate
     * @param elem 元素或者 window （ window 时只能动画 scrollTop/scrollLeft ）
     * @param props
     * @param duration
     * @param easing
     * @param callback
     */
    function Anim(elem, props, duration, easing, callback) {
        var self = this,config;

        // ignore non-exist element
        if (!(elem = DOM.get(elem))) {
            return;
        }

        // factory or constructor
        if (!(self instanceof Anim)) {
            return new Anim(elem, props, duration, easing, callback);
        }

        /**
         * the transition properties
         */
        if (S.isString(props)) {
            props = S.unparam(props, ";", ":");
        } else {
            // clone to prevent collision within multiple instance
            props = S.clone(props);
        }

        /**
         * 驼峰属性名
         */
        for (var prop in props) {
            var camelProp = camelCase(S.trim(prop));
            if (prop != camelProp) {
                props[camelProp] = props[prop];
                delete props[prop];
            }
        }

        /**
         * animation config
         */
        if (S.isPlainObject(duration)) {
            config = S.clone(duration);
        } else {
            config = {
                duration:parseFloat(duration) || undefined,
                easing:easing,
                complete:callback
            };
        }

        config = S.merge(defaultConfig, config);
        self.config = config;
        config.duration *= 1000;

        // domEl deprecated!
        self.elem = self['domEl'] = elem;
        self.props = props;

        // 实例属性
        self._backupProps = {};
        self._fxs = {};

        // register callback
        self.on("complete", onComplete);
    }


    function onComplete(e) {
        var self = this,
            _backupProps = self._backupProps,
            config = self.config;

        // only recover after complete anim
        if (!S.isEmptyObject(_backupProps = self._backupProps)) {
            DOM.css(self.elem, _backupProps);
        }

        if (config.complete) {
            config.complete.call(self, e);
        }
    }

    function runInternal() {
        var self = this,
            config = self.config,
            _backupProps = self._backupProps,
            elem = self.elem,
            hidden,
            val,
            prop,
            specialEasing = (config['specialEasing'] || {}),
            fxs = self._fxs,
            props = self.props;

        // 进入该函数即代表执行（q[0] 已经是 ...）
        saveRunning(self);

        if (self.fire("start") === false) {
            // no need to invoke complete
            self.stop(0);
            return;
        }

        if (_isElementNode(elem)) {
            hidden = DOM.css(elem, "display") == "none";
            for (prop in props) {
                val = props[prop];
                // 直接结束
                if (val == "hide" && hidden || val == 'show' && !hidden) {
                    // need to invoke complete
                    self.stop(1);
                    return;
                }
            }
        }

        // 分离 easing
        S.each(props, function(val, prop) {
            if (!props.hasOwnProperty(prop)) {
                return;
            }
            var easing;
            if (S.isArray(val)) {
                easing = specialEasing[prop] = val[1];
                props[prop] = val[0];
            } else {
                easing = specialEasing[prop] = (specialEasing[prop] || config.easing);
            }
            if (S.isString(easing)) {
                easing = specialEasing[prop] = Easing[easing];
            }
            specialEasing[prop] = easing || Easing.easeNone;
        });


        // 扩展分属性
        S.each(SHORT_HANDS, function(shortHands, p) {
            var sh,
                origin,
                val;
            if (val = props[p]) {
                origin = {};
                S.each(shortHands, function(sh) {
                    // 得到原始分属性之前值
                    origin[sh] = DOM.css(elem, sh);
                    specialEasing[sh] = specialEasing[p];
                });
                DOM.css(elem, p, val);
                for (sh in origin) {
                    // 得到期待的分属性最后值
                    props[sh] = DOM.css(elem, sh);
                    // 还原
                    DOM.css(elem, sh, origin[sh]);
                }
                // 删除复合属性
                delete props[p];
            }
        });

        // 取得单位，并对单个属性构建 Fx 对象
        for (prop in props) {
            if (!props.hasOwnProperty(prop)) {
                continue;
            }

            val = S.trim(props[prop]);

            var to,
                from,
                propCfg = {
                    elem:elem,
                    prop:prop,
                    duration:config.duration,
                    easing:specialEasing[prop]
                },
                fx = Fx.getFx(propCfg);

            // hide/show/toggle : special treat!
            if (S.inArray(val, specialVals)) {
                _backupProps[prop] = DOM.style(elem, prop);
                if (val == "toggle") {
                    val = hidden ? "show" : "hide";
                }
                if (val == "hide") {
                    to = 0;
                    from = fx.cur();
                    // 执行完后隐藏
                    _backupProps.display = 'none';
                } else {
                    DOM.show(elem);
                    from = 0;
                    to = fx.cur();
                }
                val = to;
            } else {
                to = val;
                from = fx.cur();
            }

            val += "";

            var unit = "",
                parts = val.match(rfxnum);

            if (parts) {
                to = parseFloat(parts[2]);
                unit = parts[3];

                // 有单位但单位不是 px
                if (unit && unit !== "px") {
                    DOM.css(elem, prop, val);
                    from = (to / fx.cur()) * from;
                    DOM.css(elem, prop, from + unit);
                }

                // 相对
                if (parts[1]) {
                    to = ( (parts[ 1 ] === "-=" ? -1 : 1) * to ) + from;
                }
            }

            propCfg.from = from;
            propCfg.to = to;
            propCfg.unit = unit;
            fx.load(propCfg);
            fxs[prop] = fx;
        }

        if (_isElementNode(elem) &&
            (props.width || props.height)) {
            // Make sure that nothing sneaks out
            // Record all 3 overflow attributes because IE does not
            // change the overflow attribute when overflowX and
            // overflowY are set to the same value
            S.mix(_backupProps, {
                overflow:DOM.css(elem, "overflow"),
                "overflow-x":DOM.css(elem, "overflowX"),
                "overflow-y":DOM.css(elem, "overflowY")
            });
            DOM.css(elem, "overflow", "hidden");
            // inline element should has layout/inline-block
            if (DOM.css(elem, "display") === "inline" &&
                DOM.css(elem, "float") === "none") {
                if (UA['ie']) {
                    DOM.css(elem, "zoom", 1);
                } else {
                    DOM.css(elem, "display", "inline-block");
                }
            }
        }

        AM.start(self);
    }


    S.augment(Anim, Event.Target, {

        /**
         * @type {boolean} 是否在运行
         */
        isRunning:function() {
            return isRunning(this);
        },

        _runInternal:runInternal,

        /**
         * 开始动画
         */
        run: function() {
            var self = this,
                queueName = self.config.queue;

            if (queueName === false) {
                runInternal.call(self);
            } else {
                // 当前动画对象加入队列
                Q.queue(self);
            }

            return self;
        },

        _frame:function() {

            var self = this,
                prop,
                end = 1,
                fxs = self._fxs;

            for (prop in fxs) {
                if (fxs.hasOwnProperty(prop)) {
                    end &= fxs[prop].frame();
                }
            }

            if ((self.fire("step") === false) ||
                end) {
                // complete 事件只在动画到达最后一帧时才触发
                self.stop(end);
            }
        },

        stop: function(finish) {
            var self = this,
                config = self.config,
                queueName = config.queue,
                prop,
                fxs = self._fxs;

            // already stopped
            if (!self.isRunning()) {
                // 从自己的队列中移除
                if (queueName !== false) {
                    Q.remove(self);
                }
                return;
            }

            if (finish) {
                for (prop in fxs) {
                    if (fxs.hasOwnProperty(prop)) {
                        fxs[prop].frame(1);
                    }
                }
                self.fire("complete");
            }

            AM.stop(self);

            removeRunning(self);

            if (queueName !== false) {
                // notify next anim to run in the same queue
                Q.dequeue(self);
            }

            return self;
        }
    });

    var runningKey = S.guid("ks-anim-unqueued-" + S.now() + "-");

    function saveRunning(anim) {
        var elem = anim.elem,
            allRunning = DOM.data(elem, runningKey);
        if (!allRunning) {
            DOM.data(elem, runningKey, allRunning = {});
        }
        allRunning[S.stamp(anim)] = anim;
    }

    function removeRunning(anim) {
        var elem = anim.elem,
            allRunning = DOM.data(elem, runningKey);
        if (allRunning) {
            delete allRunning[S.stamp(anim)];
            if (S.isEmptyObject(allRunning)) {
                DOM.removeData(elem, runningKey);
            }
        }
    }

    function isRunning(anim) {
        var elem = anim.elem,
            allRunning = DOM.data(elem, runningKey);
        if (allRunning) {
            return !!allRunning[S.stamp(anim)];
        }
        return 0;
    }

    /**
     * stop all the anims currently running
     * @param elem element which anim belongs to
     * @param end
     * @param clearQueue
     */
    Anim.stop = function(elem, end, clearQueue, queueName) {
        if (
        // default queue
            queueName === null ||
                // name of specified queue
                S.isString(queueName) ||
                // anims not belong to any queue
                queueName === false
            ) {
            return stopQueue.apply(undefined, arguments);
        }
        // first stop first anim in queues
        if (clearQueue) {
            Q.removeQueues(elem);
        }
        var allRunning = DOM.data(elem, runningKey),
            // can not stop in for/in , stop will modified allRunning too
            anims = S.merge(allRunning);
        for (var k in anims) {
            anims[k].stop(end);
        }
    };

    /**
     *
     * @param elem element which anim belongs to
     * @param queueName queue'name if set to false only remove
     * @param end
     * @param clearQueue
     */
    function stopQueue(elem, end, clearQueue, queueName) {
        if (clearQueue && queueName !== false) {
            Q.removeQueue(elem, queueName);
        }
        var allRunning = DOM.data(elem, runningKey),
            anims = S.merge(allRunning);
        for (var k in anims) {
            var anim = anims[k];
            if (anim.config.queue == queueName) {
                anim.stop(end);
            }
        }
    }

    /**
     * whether elem is running anim
     * @param elem
     */
    Anim['isRunning'] = function(elem) {
        var allRunning = DOM.data(elem, runningKey);
        return allRunning && !S.isEmptyObject(allRunning);
    };

    Anim.Q = Q;

    if (SHORT_HANDS) {
    }
    return Anim;
}, {
    requires:["dom","event","./easing","ua","./manager","./fx","./queue"]
});

/**
 * 2011-11
 * - 重构，抛弃 emile，优化性能，只对需要的属性进行动画
 * - 添加 stop/stopQueue/isRunning，支持队列管理
 *
 * 2011-04
 * - 借鉴 yui3 ，中央定时器，否则 ie6 内存泄露？
 * - 支持配置 scrollTop/scrollLeft
 *
 *
 * TODO:
 *  - 效率需要提升，当使用 nativeSupport 时仍做了过多动作
 *  - opera nativeSupport 存在 bug ，浏览器自身 bug ?
 *  - 实现 jQuery Effects 的 queue / specialEasing / += / 等特性
 *
 * NOTES:
 *  - 与 emile 相比，增加了 borderStyle, 使得 border: 5px solid #ccc 能从无到有，正确显示
 *  - api 借鉴了 YUI, jQuery 以及 http://www.w3.org/TR/css3-transitions/
 *  - 代码实现了借鉴了 Emile.js: http://github.com/madrobby/emile *
 */

/**
 * special patch for making color gradual change
 * @author  yiminghe@gmail.com
 */
KISSY.add("anim/color", function(S, DOM, Anim, Fx) {

    var HEX_BASE = 16,

        floor = Math.floor,

        KEYWORDS = {
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
        },
        re_RGB = /^rgb\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\)$/i,

        re_RGBA = /^rgba\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+),\s*([0-9]+)\)$/i,

        re_hex = /^#?([0-9A-F]{1,2})([0-9A-F]{1,2})([0-9A-F]{1,2})$/i,

        SHORT_HANDS = Anim.SHORT_HANDS,

        COLORS = [
            'backgroundColor' ,
            'borderBottomColor' ,
            'borderLeftColor' ,
            'borderRightColor' ,
            'borderTopColor' ,
            'color' ,
            'outlineColor'
        ];

    SHORT_HANDS['background'] = ['backgroundColor'];

    SHORT_HANDS['borderColor'] = [
        'borderBottomColor',
        'borderLeftColor',
        'borderRightColor',
        'borderTopColor'
    ];

    SHORT_HANDS['border'].push(
        'borderBottomColor',
        'borderLeftColor',
        'borderRightColor',
        'borderTopColor'
    );

    SHORT_HANDS['borderBottom'].push(
        'borderBottomColor'
    );

    SHORT_HANDS['borderLeft'].push(
        'borderLeftColor'
    );

    SHORT_HANDS['borderRight'].push(
        'borderRightColor'
    );

    SHORT_HANDS['borderTop'].push(
        'borderTopColor'
    );

    //得到颜色的数值表示，红绿蓝数字数组
    function numericColor(val) {
        val = (val + "");
        var match;
        if (match = val.match(re_RGB)) {
            return [
                parseInt(match[1]),
                parseInt(match[2]),
                parseInt(match[3])
            ];
        }
        else if (match = val.match(re_RGBA)) {
            return [
                parseInt(match[1]),
                parseInt(match[2]),
                parseInt(match[3]),
                parseInt(match[4])
            ];
        }
        else if (match = val.match(re_hex)) {
            for (var i = 1; i < match.length; i++) {
                if (match[i].length < 2) {
                    match[i] += match[i];
                }
            }
            return [
                parseInt(match[1], HEX_BASE),
                parseInt(match[2], HEX_BASE),
                parseInt(match[3], HEX_BASE)
            ];
        }
        if (KEYWORDS[val = val.toLowerCase()]) {
            return KEYWORDS[val];
        }

        //transparent 或者 颜色字符串返回
        S.log("only allow rgb or hex color string : " + val, "warn");
        return [255,255,255];
    }

    function ColorFx() {
        ColorFx.superclass.constructor.apply(this, arguments);
    }

    S.extend(ColorFx, Fx, {

        load:function() {
            var self = this;
            ColorFx.superclass.load.apply(self, arguments);
            if (self.from) {
                self.from = numericColor(self.from);
            }
            if (self.to) {
                self.to = numericColor(self.to);
            }
        },

        interpolate:function (from, to, pos) {
            var interpolate = ColorFx.superclass.interpolate;
            if (from.length == 3 && to.length == 3) {
                return 'rgb(' + [
                    floor(interpolate(from[0], to[0], pos)),
                    floor(interpolate(from[1], to[1], pos)),
                    floor(interpolate(from[2], to[2], pos))
                ].join(', ') + ')';
            } else if (from.length == 4 || to.length == 4) {
                return 'rgba(' + [
                    floor(interpolate(from[0], to[0], pos)),
                    floor(interpolate(from[1], to[1], pos)),
                    floor(interpolate(from[2], to[2], pos)),
                    // 透明度默认 1
                    floor(interpolate(from[3] || 1, to[3] || 1, pos))
                ].join(', ') + ')';
            } else {
                S.log("anim/color unknown value : " + from);
            }
        }

    });

    S.each(COLORS, function(color) {
        Fx.Factories[color] = ColorFx;
    });

    return ColorFx;

}, {
    requires:["dom","./base","./fx"]
});

/**
 * TODO
 * 支持 hsla
 *  - https://github.com/jquery/jquery-color/blob/master/jquery.color.js
 **/

KISSY.add("anim", function(S, Anim,Easing) {
    Anim.Easing=Easing;
    return Anim;
}, {
    requires:["anim/base","anim/easing","anim/color"]
});

/**
 * @module  anim-node-plugin
 * @author  yiminghe@gmail.com,
 *          lifesinger@gmail.com,
 *          qiaohua@taobao.com,
 *
 */
KISSY.add('node/anim', function(S, DOM, Anim, Node, undefined) {

    var FX = [
        // height animations
        [ "height", "marginTop", "marginBottom", "paddingTop", "paddingBottom" ],
        // width animations
        [ "width", "marginLeft", "marginRight", "paddingLeft", "paddingRight" ],
        // opacity animations
        [ "opacity" ]
    ];

    function getFxs(type, num, from) {
        var ret = [],
            obj = {};
        for (var i = from || 0; i < num; i++) {
            ret.push.apply(ret, FX[i]);
        }
        for (i = 0; i < ret.length; i++) {
            obj[ret[i]] = type;
        }
        return obj;
    }

    S.augment(Node, {
        animate:function() {
            var self = this,
                args = S.makeArray(arguments);
            S.each(self, function(elem) {
                Anim.apply(undefined, [elem].concat(args)).run();
            });
            return self;
        },
        stop:function(end, clearQueue, queue) {
            var self = this;
            S.each(self, function(elem) {
                Anim.stop(elem, end, clearQueue, queue);
            });
            return self;
        },
        isRunning:function() {
            var self = this;
            for (var i = 0; i < self.length; i++) {
                if (Anim.isRunning(self[i])) {
                    return 1;
                }
            }
            return 0;
        }
    });

    S.each({
            show: getFxs("show", 3),
            hide: getFxs("hide", 3),
            toggle:getFxs("toggle", 3),
            fadeIn: getFxs("show", 3, 2),
            fadeOut: getFxs("hide", 3, 2),
            fadeToggle:getFxs("toggle", 3, 2),
            slideDown: getFxs("show", 1),
            slideUp: getFxs("hide", 1),
            slideToggle:getFxs("toggle", 1)
        },
        function(v, k) {
            Node.prototype[k] = function(speed, callback, easing) {
                var self = this;
                // 没有参数时，调用 DOM 中的对应方法
                if (DOM[k] && !speed) {
                    DOM[k](self);
                } else {
                    S.each(self, function(elem) {
                        Anim(elem, v, speed, easing || 'easeOut', callback).run();
                    });
                }
                return self;
            };
        });

}, {
    requires:["dom","anim","./base"]
});
/**
 * 2011-11-10
 *  - 重写，逻辑放到 Anim 模块，这边只进行转发
 *
 * 2011-05-17
 *  - 承玉：添加 stop ，随时停止动画
 *
 *  TODO
 *  - anim needs queue mechanism ?
 */

KISSY.add("node", function(S, Event, Node) {
    Node.KeyCodes = Event.KeyCodes;
    return Node;
}, {
    requires:[
        "event",
        "node/base",
        "node/attach",
        "node/override",
        "node/anim"]
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
            if (S.isNullOrUndefined(text) || text === '') {
                return null;
            }
            return JSON.parse(text);
        },

        stringify: JSON.stringify
    };
}, {
    requires:["json/json2"]
});

/**
 * form data  serialization util
 * @author  yiminghe@gmail.com
 */
KISSY.add("ajax/form-serializer", function(S, DOM) {
    var rselectTextarea = /^(?:select|textarea)/i,
        rCRLF = /\r?\n/g,
        rinput = /^(?:color|date|datetime|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i;
    return {
        /**
         * 序列化表单元素
         * @param {String|HTMLElement[]|HTMLElement|Node} forms
         */
        serialize:function(forms) {
            var elements = [],data = {};
            DOM.query(forms).each(function(el) {
                // form 取其表单元素集合
                // 其他直接取自身
                var subs = el.elements ? S.makeArray(el.elements) : [el];
                elements.push.apply(elements, subs);
            });
            // 对表单元素进行过滤，具备有效值的才保留
            elements = S.filter(elements, function(el) {
                // 有名字
                return el.name &&
                    // 不被禁用
                    !el.disabled &&
                    (
                        // radio,checkbox 被选择了
                        el.checked ||
                            // select 或者 textarea
                            rselectTextarea.test(el.nodeName) ||
                            // input 类型
                            rinput.test(el.type)
                        );

                // 这样子才取值
            });
            S.each(elements, function(el) {
                var val = DOM.val(el),vs;
                // 字符串换行平台归一化
                val = S.map(S.makeArray(val), function(v) {
                    return v.replace(rCRLF, "\r\n");
                });
                // 全部搞成数组，防止同名
                vs = data[el.name] = data[el.name] || [];
                vs.push.apply(vs, val);
            });
            // 名值键值对序列化,数组元素名字前不加 []
            return S.param(data, undefined, undefined, false);
        }
    };
}, {
    requires:['dom']
});

/**
 * encapsulation of io object . as transaction object in yui3
 * @author yiminghe@gmail.com
 */
KISSY.add("ajax/xhrobject", function(S, Event) {

    var OK_CODE = 200,
        MULTIPLE_CHOICES = 300,
        NOT_MODIFIED = 304,
        // get individual response header from responseheader str
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
            if (dataType[0] == "text" && text !== undefined) {
                responseData = text;
            }
            // 有 xml 值才直接取，否则可能还要从 xml 转
            else if (dataType[0] == "xml" && xml !== undefined) {
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
                if (status >= OK_CODE && status < MULTIPLE_CHOICES || status == NOT_MODIFIED) {

                    if (status == NOT_MODIFIED) {
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
 * @author  yiminghe@gmail.com , lijing00333@163.com
 */
KISSY.add("ajax/base", function(S, JSON, Event, XhrObject) {

        var rlocalProtocol = /^(?:about|app|app\-storage|.+\-extension|file|widget):$/,
            rspace = /\s+/,
            rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/,
            mirror = function(s) {
                return s;
            },
            HTTP_PORT = 80,
            HTTPS_PORT = 443,
            rnoContent = /^(?:GET|HEAD)$/,
            curLocation,
            curLocationParts;


        try {
            curLocation = location.href;
        } catch(e) {
            S.log("ajax/base get curLocation error : ");
            S.log(e);
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
                 // 单位秒!!
                 timeout: 0,
                 data: null,
                 // 可取json | jsonp | script | xml | html | text | null | undefined
                 dataType: null,
                 username: null,
                 password: null,
                 cache: null,
                 mimeType:null,
                 xdr:{
                 subDomain:{
                 proxy:'http://xx.t.com/proxy.html'
                 }
                 },
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
            if (!S.isBoolean(c.crossDomain)) {
                var parts = rurl.exec(c.url.toLowerCase());
                c.crossDomain = !!( parts &&
                    ( parts[ 1 ] != curLocationParts[ 1 ] || parts[ 2 ] != curLocationParts[ 2 ] ||
                        ( parts[ 3 ] || ( parts[ 1 ] === "http:" ? HTTP_PORT : HTTPS_PORT ) )
                            !=
                            ( curLocationParts[ 3 ] || ( curLocationParts[ 1 ] === "http:" ? HTTP_PORT : HTTPS_PORT ) ) )
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
                    accepts[ dataType ] + (dataType === "*" ? "" : ", */*; q=0.01"  ) :
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
                }, c.timeout * 1000);
            }

            try {
                // flag as sending
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
 * base for xhr and subdomain
 * @author yiminghe@gmail.com
 */
KISSY.add("ajax/xhrbase", function(S, io) {
    var OK_CODE = 200,
        win = window,
        // http://msdn.microsoft.com/en-us/library/cc288060(v=vs.85).aspx
        _XDomainRequest = win['XDomainRequest'],
        NO_CONTENT_CODE = 204,
        NOT_FOUND_CODE = 404,
        NO_CONTENT_CODE2 = 1223,
        XhrBase = {
            proto:{}
        };

    function createStandardXHR(_, refWin) {
        try {
            return new (refWin || win)['XMLHttpRequest']();
        } catch(e) {
            //S.log("createStandardXHR error");
        }
        return undefined;
    }

    function createActiveXHR(_, refWin) {
        try {
            return new (refWin || win)['ActiveXObject']("Microsoft.XMLHTTP");
        } catch(e) {
            S.log("createActiveXHR error");
        }
        return undefined;
    }

    XhrBase.xhr = win.ActiveXObject ? function(crossDomain, refWin) {
        if (crossDomain && _XDomainRequest) {
            return new _XDomainRequest();
        }
        // ie7 XMLHttpRequest 不能访问本地文件
        return !io.isLocal && createStandardXHR(crossDomain, refWin) || createActiveXHR(crossDomain, refWin);
    } : createStandardXHR;

    function isInstanceOfXDomainRequest(xhr) {
        return _XDomainRequest && (xhr instanceof _XDomainRequest);
    }

    S.mix(XhrBase.proto, {
        sendInternal:function() {

            var self = this,
                xhrObj = self.xhrObj,
                c = xhrObj.config;

            var xhr = self.xhr,
                xhrFields,
                i;

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
                // 跨域时，不能设，否则请求变成
                // OPTIONS /xhr/r.php HTTP/1.1
                if (!c.crossDomain) {
                    for (i in xhrObj.requestHeaders) {
                        xhr.setRequestHeader(i, xhrObj.requestHeaders[ i ]);
                    }
                }
            } catch(e) {
                S.log("setRequestHeader in xhr error : ");
                S.log(e);
            }

            xhr.send(c.hasContent && c.data || null);

            if (!c.async || xhr.readyState == 4) {
                self._callback();
            } else {
                // _XDomainRequest 单独的回调机制
                if (isInstanceOfXDomainRequest(xhr)) {
                    xhr.onload = function() {
                        xhr.readyState = 4;
                        xhr.status = 200;
                        self._callback();
                    };
                    xhr.onerror = function() {
                        xhr.readyState = 4;
                        xhr.status = 500;
                        self._callback();
                    };
                } else {
                    xhr.onreadystatechange = function() {
                        self._callback();
                    };
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

                    // ie6 ActiveObject 设置不恰当属性导致出错
                    if (isInstanceOfXDomainRequest(xhr)) {
                        xhr.onerror = S.noop;
                        xhr.onload = S.noop;
                    } else {
                        // ie6 ActiveObject 只能设置，不能读取这个属性，否则出错！
                        xhr.onreadystatechange = S.noop;
                    }

                    if (abort) {
                        // 完成以后 abort 不要调用
                        if (xhr.readyState !== 4) {
                            xhr.abort();
                        }
                    } else {
                        var status = xhr.status;

                        // _XDomainRequest 不能获取响应头
                        if (!isInstanceOfXDomainRequest(xhr)) {
                            xhrObj.responseHeadersString = xhr.getAllResponseHeaders();
                        }

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
                            S.log("xhr statustext error : ");
                            S.log(e);
                            // We normalize with Webkit giving an empty statusText
                            statusText = "";
                        }

                        // Filter status for non standard behaviors
                        // If the request is local and we have data: assume a success
                        // (success with no data won't get notified, that's the best we
                        // can do given current implementations)
                        if (!status && io.isLocal && !c.crossDomain) {
                            status = xhrObj.responseText ? OK_CODE : NOT_FOUND_CODE;
                            // IE - #1450: sometimes returns 1223 when it should be 204
                        } else if (status === NO_CONTENT_CODE2) {
                            status = NO_CONTENT_CODE;
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

    return XhrBase;
}, {
    requires:['./base']
});

/**
 * solve io between sub domains using proxy page
 * @author yiminghe@gmail.com
 */
KISSY.add("ajax/subdomain", function(S, XhrBase, Event, DOM) {

    var rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/;

    var PROXY_PAGE = "/sub_domain_proxy.html";

    var doc = document;

    var iframeMap = {
        // hostname:{iframe: , ready:}
    };

    function SubDomain(xhrObj) {
        var self = this,
            c = xhrObj.config;
        self.xhrObj = xhrObj;
        var m = c.url.match(rurl);
        self.__hostname = m[2];
        self.__protocol = m[1];
        c.crossDomain = false;
    }


    S.augment(SubDomain, XhrBase.proto, {
        send:function() {
            var self = this,
                c = self.xhrObj.config,
                hostname = self.__hostname,
                iframe,
                iframeDesc = iframeMap[hostname];

            var proxy = PROXY_PAGE;

            if (c['xdr'] && c['xdr']['subDomain'] && c['xdr']['subDomain'].proxy) {
                proxy = c['xdr']['subDomain'].proxy;
            }

            if (iframeDesc && iframeDesc.ready) {
                self.xhr = XhrBase.xhr(0, iframeDesc.iframe.contentWindow);
                if (self.xhr) {
                    self.sendInternal();
                } else {
                    S.error("document.domain not set correctly!");
                }
                return;
            }
            if (!iframeDesc) {
                iframeDesc = iframeMap[hostname] = {};
                iframe = iframeDesc.iframe = document.createElement("iframe");
                DOM.css(iframe, {
                    position:'absolute',
                    left:'-9999px',
                    top:'-9999px'
                });
                DOM.prepend(iframe, doc.body || doc.documentElement);
                iframe.src = self.__protocol + "//" + hostname + proxy;
            } else {
                iframe = iframeDesc.iframe;
            }

            Event.on(iframe, "load", self._onLoad, self);

        },

        _onLoad:function() {
            var self = this,
                hostname = self.__hostname,
                iframeDesc = iframeMap[hostname];
            iframeDesc.ready = 1;
            Event.detach(iframeDesc.iframe, "load", self._onLoad, self);
            self.send();
        }
    });

    return SubDomain;

}, {
    requires:['./xhrbase','event','dom']
});

/**
 * use flash to accomplish cross domain request , usage scenario ? why not jsonp ?
 * @author yiminghe@gmail.com
 */
KISSY.add("ajax/xdr", function(S, io, DOM) {

    var // current running request instances
        maps = {},
        ID = "io_swf",
        // flash transporter
        flash,
        doc = document,
        // whether create the flash transporter
        init = false;

    // create the flash transporter
    function _swf(uri, _, uid) {
        if (init) {
            return;
        }
        init = true;
        var o = '<object id="' + ID +
            '" type="application/x-shockwave-flash" data="' +
            uri + '" width="0" height="0">' +
            '<param name="movie" value="' +
            uri + '" />' +
            '<param name="FlashVars" value="yid=' +
            _ + '&uid=' +
            uid +
            '&host=KISSY.io" />' +
            '<param name="allowScriptAccess" value="always" />' +
            '</object>',
            c = doc.createElement('div');
        DOM.prepend(c, doc.body || doc.documentElement);
        c.innerHTML = o;
    }

    function XdrTransport(xhrObj) {
        S.log("use flash xdr");
        this.xhrObj = xhrObj;
    }

    S.augment(XdrTransport, {
        // rewrite send to support flash xdr
        send:function() {
            var self = this,
                xhrObj = self.xhrObj,
                c = xhrObj.config;
            var xdr = c['xdr'] || {};
            // 不提供则使用 cdn 默认的 flash
            _swf(xdr.src || (S.Config.base + "ajax/io.swf"), 1, 1);
            // 简便起见，用轮训
            if (!flash) {
                // S.log("detect xdr flash");
                setTimeout(function() {
                    self.send();
                }, 200);
                return;
            }
            self._uid = S.guid();
            maps[self._uid] = self;

            // ie67 send 出错？
            flash.send(c.url, {
                id:self._uid,
                uid:self._uid,
                method:c.type,
                data:c.hasContent && c.data || {}
            });
        },

        abort:function() {
            flash.abort(this._uid);
        },

        _xdrResponse:function(e, o) {
            // S.log(e);
            var self = this,
                ret,
                xhrObj = self.xhrObj;

            // need decodeURI to get real value from flash returned value
            xhrObj.responseText = decodeURI(o.c.responseText);

            switch (e) {
                case 'success':
                    ret = { status: 200, statusText: "success" };
                    delete maps[o.id];
                    break;
                case 'abort':
                    delete maps[o.id];
                    break;
                case 'timeout':
                case 'transport error':
                case 'failure':
                    delete maps[o.id];
                    ret = { status: 500, statusText: e };
                    break;
            }
            if (ret) {
                xhrObj.callback(ret.status, ret.statusText);
            }
        }
    });

    /*called by flash*/
    io['applyTo'] = function(_, cmd, args) {
        // S.log(cmd + " execute");
        var cmds = cmd.split("."),
            func = S;
        S.each(cmds, function(c) {
            func = func[c];
        });
        func.apply(null, args);
    };

    // when flash is loaded
    io['xdrReady'] = function() {
        flash = doc.getElementById(ID);
    };

    /**
     * when response is returned from server
     * @param e response status
     * @param o internal data
     * @param c internal data
     */
    io['xdrResponse'] = function(e, o, c) {
        var xhr = maps[o.uid];
        xhr && xhr._xdrResponse(e, o, c);
    };

    // export io for flash to call
    S.io = io;

    return XdrTransport;

}, {
    requires:["./base",'dom']
});

/**
 * ajax xhr transport class , route subdomain , xdr
 * @author yiminghe@gmail.com
 */
KISSY.add("ajax/xhr", function(S, io, XhrBase, SubDomain, XdrTransport) {

    var rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/;

    var _XDomainRequest = window['XDomainRequest'];

    var detectXhr = XhrBase.xhr();

    if (detectXhr) {

        // slice last two pars
        // xx.taobao.com => taobao.com
        function getMainDomain(host) {
            var t = host.split('.');
            if (t.length < 2) {
                return t.join(".");
            } else {
                return t.reverse().slice(0, 2).reverse().join('.');
            }
        }

        function XhrTransport(xhrObj) {
            var c = xhrObj.config,
                xdrCfg = c['xdr'] || {};

            if (c.crossDomain) {

                var parts = c.url.match(rurl);

                // 跨子域
                if (getMainDomain(location.hostname) == getMainDomain(parts[2])) {
                    return new SubDomain(xhrObj);
                }

                /**
                 * ie>7 强制使用 flash xdr
                 */
                if (!("withCredentials" in detectXhr) &&
                    (String(xdrCfg.use) === "flash" || !_XDomainRequest)) {
                    return new XdrTransport(xhrObj);
                }
            }

            this.xhrObj = xhrObj;

            return undefined;
        }

        S.augment(XhrTransport, XhrBase.proto, {

            send:function() {
                var self = this,
                    xhrObj = self.xhrObj,
                    c = xhrObj.config;
                self.xhr = XhrBase.xhr(c.crossDomain);
                self.sendInternal();
            }

        });

        io.setupTransport("*", XhrTransport);
    }

    return io;
}, {
    requires:["./base",'./xhrbase','./subdomain',"./xdr"]
});

/**
 * 借鉴 jquery，优化使用原型替代闭包
 **/

/**
 * script transport for kissy io
 * @description: modified version of S.getScript , add abort ability
 * @author  yiminghe@gmail.com
 */
KISSY.add("ajax/script", function(S, io) {

    var doc = document;

    var OK_CODE = 200,ERROR_CODE = 500;

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
                head = doc['head'] ||
                    doc.getElementsByTagName("head")[0] ||
                    doc.documentElement;
            self.head = head;
            script = doc.createElement("script");
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

            // 防止重复调用,成功后 abort
            if (!script) {
                return;
            }

            if (abort ||
                !script.readyState ||
                /loaded|complete/.test(script.readyState)
                || event == "error"
                ) {

                script['onerror'] = script.onload = script.onreadystatechange = null;

                // Remove the script
                if (head && script.parentNode) {
                    // ie 报错载入无效 js
                    // 怎么 abort ??
                    // script.src = "#";
                    head.removeChild(script);
                }

                this.script = undefined;
                this.head = undefined;

                // Callback if not abort
                if (!abort && event != "error") {
                    xhrObj.callback(OK_CODE, "success");
                }
                // 非 ie<9 可以判断出来
                else if (event == "error") {
                    xhrObj.callback(ERROR_CODE, "scripterror");
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
 * @author  yiminghe@gmail.com
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
                // 使用数组，区别：故意调用了 jsonpCallback(undefined) 与 根本没有调用
                // jsonp 返回了数组
                if (arguments.length > 1) {
                    r = S.makeArray(arguments);
                }
                response = [r];
            };

            // cleanup whether success or failure
            xhr.on("complete", function() {
                window[ jsonpCallback ] = previous;
                if (previous === undefined) {
                    try {
                        delete window[ jsonpCallback ];
                    } catch(e) {
                        //S.log("delete window variable error : ");
                        //S.log(e);
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

KISSY.add("ajax/form", function(S, io, DOM, FormSerializer) {

    io.on("start", function(e) {
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
 * @author  yiminghe@gmail.com
 */
KISSY.add("ajax/iframe-upload", function(S, DOM, Event, io) {

    var doc = document;

    var OK_CODE = 200,ERROR_CODE = 500,BREATH_INTERVAL = 30;

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
            var isArray = S.isArray(data[d]),
                vs = S.makeArray(data[d]);
            // 数组和原生一样对待，创建多个同名输入域
            for (var i = 0; i < vs.length; i++) {
                var e = doc.createElement("input");
                e.type = 'hidden';
                e.name = d + (isArray && serializeArray ? "[]" : "");
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

        _callback:function(event
                           //, abort
            ) {
            //debugger
            var form = this.form,
                xhr = this.xhr,
                eventType = event.type,
                iframe = xhr.iframe;
            // 防止重复调用 , 成功后 abort
            if (!iframe) {
                return;
            }

            DOM.attr(form, this.attrs);

            if (eventType == "load") {
                var iframeDoc = iframe.contentWindow.document;
                xhr.responseXML = iframeDoc;
                xhr.responseText = DOM.text(iframeDoc.body);
                xhr.callback(OK_CODE, "success");
            } else if (eventType == 'error') {
                xhr.callback(ERROR_CODE, "error");
            }

            removeFieldsFromData(this.fields);


            Event.detach(iframe);

            setTimeout(function() {
                // firefox will keep loading if not settimeout
                DOM.remove(iframe);
            }, BREATH_INTERVAL);

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

KISSY.add("ajax", function(S, serializer, io) {
    var undef = undefined;
    // some shortcut
    S.mix(io, {

        /**
         * form 序列化
         * @param formElement {HTMLFormElement} 将要序列化的 form 元素
         */
        serialize:serializer.serialize,

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
    requires:[
        "ajax/form-serializer",
        "ajax/base",
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

    // atomic flag
    Attribute.INVALID = {};

    var INVALID = Attribute.INVALID;

    /**
     *
     * @param host
     * @param method
     * @return method if fn or host[method]
     */
    function normalFn(host, method) {
        if (S.isString(method)) {
            return host[method];
        }
        return method;
    }


    /**
     * fire attribute value change
     */
    function __fireAttrChange(self, when, name, prevVal, newVal, subAttrName, attrName) {
        attrName = attrName || name;
        return self.fire(when + capitalFirst(name) + 'Change', {
            attrName: attrName,
            subAttrName:subAttrName,
            prevVal: prevVal,
            newVal: newVal
        });
    }


    /**
     *
     * @param obj
     * @param name
     * @param create
     * @return non-empty property value of obj
     */
    function ensureNonEmpty(obj, name, create) {
        var ret = obj[name] || {};
        if (create) {
            obj[name] = ret;
        }
        return ret;
    }

    /**
     *
     * @param self
     * @return non-empty attr config holder
     */
    function getAttrs(self) {
        /**
         * attribute meta information
         {
         attrName: {
         getter: function,
         setter: function,
         // 注意：只能是普通对象以及系统内置类型，而不能是 new Xx()，否则用 valueFn 替代
         value: v, // default value
         valueFn: function
         }
         }
         */
        return ensureNonEmpty(self, "__attrs", true);
    }

    /**
     *
     * @param self
     * @return non-empty attr value holder
     */
    function getAttrVals(self) {
        /**
         * attribute value
         {
         attrName: attrVal
         }
         */
        return ensureNonEmpty(self, "__attrVals", true);
    }

    /**
     * o, [x,y,z] => o[x][y][z]
     * @param o
     * @param path
     */
    function getValueByPath(o, path) {
        for (var i = 0,len = path.length;
             o != undef && i < len;
             i++) {
            o = o[path[i]];
        }
        return o;
    }

    /**
     * o, [x,y,z], val => o[x][y][z]=val
     * @param o
     * @param path
     * @param val
     */
    function setValueByPath(o, path, val) {
        var rlen = path.length - 1,
            s = o;
        if (rlen >= 0) {
            for (var i = 0; i < rlen; i++) {
                o = o[path[i]];
            }
            if (o != undef) {
                o[path[i]] = val;
            } else {
                s = undef;
            }
        }
        return s;
    }

    function setInternal(self, name, value, opts, attrs) {
        var ret;
        opts = opts || {};
        var dot = ".",
            path,
            subVal,
            prevVal,
            fullName = name;

        if (name.indexOf(dot) !== -1) {
            path = name.split(dot);
            name = path.shift();
        }

        prevVal = self.get(name);

        if (path) {
            subVal = getValueByPath(prevVal, path);
        }

        // if no change, just return
        if (!path && prevVal === value) {
            return undefined;
        } else if (path && subVal === value) {
            return undefined;
        }

        if (path) {
            var tmp = S.clone(prevVal);
            setValueByPath(tmp, path, value);
            value = tmp;
        }

        // check before event
        if (!opts['silent']) {
            if (false === __fireAttrChange(self, 'before', name, prevVal, value, fullName)) {
                return false;
            }
        }
        // set it
        ret = self.__set(name, value);

        if (ret === false) {
            return ret;
        }

        // fire after event
        if (!opts['silent']) {
            value = getAttrVals(self)[name];
            __fireAttrChange(self, 'after', name, prevVal, value, fullName);
            if (!attrs) {
                __fireAttrChange(self,
                    '', '*',
                    [prevVal], [value],
                    [fullName], [name]);
            } else {
                attrs.push({
                    prevVal:prevVal,
                    newVal:value,
                    attrName:name,
                    subAttrName:fullName
                });
            }
        }
        return self;
    }

    /**
     * 提供属性管理机制
     * @name Attribute
     * @class
     */
    function Attribute() {
    }

    S.augment(Attribute,
        /**
         * @lends Attribute.prototype
         */
        {

            /**
             * @return un-cloned attr config collections
             */
            getAttrs: function() {
                return getAttrs(this);
            },

            /**
             * @return un-cloned attr value collections
             */
            getAttrVals:function() {
                var self = this,
                    o = {},
                    a,
                    attrs = getAttrs(self);
                for (a in attrs) {
                    o[a] = self.get(a);
                }
                return o;
            },

            /**
             * Adds an attribute with the provided configuration to the host object.
             * @param {String} name attrName
             * @param {Object} attrConfig The config supports the following properties:
             * {
             *     value: 'the default value', // 最好不要使用自定义类生成的对象，这时使用 valueFn
             *     valueFn: function //
             *     setter: function
             *     getter: function
             * }
             * @param {boolean} override whether override existing attribute config ,default true
             */
            addAttr: function(name, attrConfig, override) {
                var self = this,
                    attrs = getAttrs(self),
                    cfg = S.clone(attrConfig);
                if (!attrs[name]) {
                    attrs[name] = cfg;
                } else {
                    S.mix(attrs[name], cfg, override);
                }
                return self;
            },

            /**
             * Configures a group of attributes, and sets initial values.
             * @param {Object} attrConfigs  An object with attribute name/configuration pairs.
             * @param {Object} initialValues user defined initial values
             */
            addAttrs: function(attrConfigs, initialValues) {
                var self = this;
                S.each(attrConfigs, function(attrConfig, name) {
                    self.addAttr(name, attrConfig);
                });
                if (initialValues) {
                    self.set(initialValues);
                }
                return self;
            },

            /**
             * Checks if the given attribute has been added to the host.
             */
            hasAttr: function(name) {
                return name && getAttrs(this).hasOwnProperty(name);
            },

            /**
             * Removes an attribute from the host object.
             */
            removeAttr: function(name) {
                var self = this;

                if (self.hasAttr(name)) {
                    delete getAttrs(self)[name];
                    delete getAttrVals(self)[name];
                }

                return self;
            },

            /**
             * Sets the value of an attribute.
             */
            set: function(name, value, opts) {
                var ret,self = this;
                if (S.isPlainObject(name)) {
                    var all = name;
                    name = 0;
                    ret = true;
                    opts = value;
                    var attrs = [];
                    for (name in all) {
                        ret = setInternal(self, name, all[name], opts, attrs);
                        if (ret === false) {
                            break;
                        }
                    }
                    var attrNames = [],
                        prevVals = [],
                        newVals = [],
                        subAttrNames = [];
                    S.each(attrs, function(attr) {
                        prevVals.push(attr.prevVal);
                        newVals.push(attr.newVal);
                        attrNames.push(attr.attrName);
                        subAttrNames.push(attr.subAttrName);
                    });
                    if (attrNames.length) {
                        __fireAttrChange(self,
                            '',
                            '*',
                            prevVals,
                            newVals,
                            subAttrNames,
                            attrNames);
                    }
                    return ret;
                }

                return setInternal(self, name, value, opts);


            },

            /**
             * internal use, no event involved, just set.
             * @protected overriden by mvc/model
             */
            __set: function(name, value) {
                var self = this,
                    setValue,
                    // if host does not have meta info corresponding to (name,value)
                    // then register on demand in order to collect all data meta info
                    // 一定要注册属性元数据，否则其他模块通过 _attrs 不能枚举到所有有效属性
                    // 因为属性在声明注册前可以直接设置值
                    attrConfig = ensureNonEmpty(getAttrs(self), name, true),
                    validator = attrConfig['validator'],
                    setter = attrConfig['setter'];

                // validator check
                if (validator = normalFn(self, validator)) {
                    if (!validator.call(self, value, name)) {
                        return false;
                    }
                }

                // if setter has effect
                if (setter = normalFn(self, setter)) {
                    setValue = setter.call(self, value, name);
                }

                if (setValue === INVALID) {
                    return false;
                }

                if (setValue !== undef) {
                    value = setValue;
                }

                // finally set
                getAttrVals(self)[name] = value;
            },

            /**
             * Gets the current value of the attribute.
             */
            get: function(name) {
                var self = this,
                    dot = ".",
                    path,
                    attrConfig,
                    getter, ret;

                if (name.indexOf(dot) !== -1) {
                    path = name.split(dot);
                    name = path.shift();
                }

                attrConfig = ensureNonEmpty(getAttrs(self), name);
                getter = attrConfig['getter'];

                // get user-set value or default value
                //user-set value takes privilege
                ret = name in getAttrVals(self) ?
                    getAttrVals(self)[name] :
                    self.__getDefAttrVal(name);

                // invoke getter for this attribute
                if (getter = normalFn(self, getter)) {
                    ret = getter.call(self, ret, name);
                }

                if (path) {
                    ret = getValueByPath(ret, path);
                }

                return ret;
            },

            /**
             * get default attribute value from valueFn/value
             * @private
             * @param name
             */
            __getDefAttrVal: function(name) {
                var self = this,
                    attrConfig = ensureNonEmpty(getAttrs(self), name),
                    valFn,
                    val;

                if ((valFn = normalFn(self, attrConfig.valueFn))) {
                    val = valFn.call(self);
                    if (val !== undef) {
                        attrConfig.value = val;
                    }
                    delete attrConfig.valueFn;
                    getAttrs(self)[name] = attrConfig;
                }

                return attrConfig.value;
            },

            /**
             * Resets the value of an attribute.just reset what addAttr set  (not what invoker set when call new Xx(cfg))
             * @param {String} name name of attribute
             */
            reset: function (name, opts) {
                var self = this;

                if (S.isString(name)) {
                    if (self.hasAttr(name)) {
                        // if attribute does not have default value, then set to undefined.
                        return self.set(name, self.__getDefAttrVal(name), opts);
                    }
                    else {
                        return self;
                    }
                }

                opts = name;

                var attrs = getAttrs(self),
                    values = {};

                // reset all
                for (name in attrs) {
                    values[name] = self.__getDefAttrVal(name);
                }

                self.set(values, opts);
                return self;
            }
        });

    function capitalFirst(s) {
        return s.charAt(0).toUpperCase() + s.substring(1);
    }

    Attribute['__capitalFirst'] = capitalFirst;

    return Attribute;
});

/**
 *  2011-10-18
 *    get/set sub attribute value ,set("x.y",val) x 最好为 {} ，不要是 new Clz() 出来的
 *    add validator
 */

/**
 * @module  Base
 * @author  yiminghe@gmail.com,lifesinger@gmail.com
 */
KISSY.add('base/base', function (S, Attribute, Event) {

    /**
     * Base for class-based component
     * @name Base
     * @extends Event.Target
     * @extends Attribute
     * @class
     */
    function Base(config) {
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
                    // 父类后加，父类不覆盖子类的相同设置
                    // 属性对象会 merge   a: {y:{getter:fn}}, b:{y:{value:3}}, b extends a => b {y:{value:3}}
                    host.addAttr(attr, attrs[attr], false);
                }
            }
        }
    }

    function initAttrs(host, config) {
        if (config) {
            for (var attr in config) {
                if (config.hasOwnProperty(attr)) {
                    //用户设置会调用 setter/validator 的，但不会触发属性变化事件
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

KISSY.add("base", function(S, Base, Attribute) {
    Base.Attribute = Attribute;
    return Base;
}, {
    requires:["base/base","base/attribute"]
});

/**
 * @module  cookie
 * @author  lifesinger@gmail.com
 */
KISSY.add('cookie/base', function(S) {

    var doc = document,
        MILLISECONDS_OF_DAY = 24 * 60 * 60 * 1000,
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
                date.setTime(date.getTime() + expires * MILLISECONDS_OF_DAY);
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
