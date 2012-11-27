/**
 * attr ie hack
 * @author yiminghe@gmail.com
 */
KISSY.add('dom/ie/attr', function (S, DOM) {

    var attrHooks = DOM._attrHooks,
        attrNodeHook = DOM._attrNodeHook,
        NodeType = DOM.NodeType,
        valHooks = DOM._valHooks,
        propFix = DOM._propFix,
        HREF = 'href',
        hrefFix,
        IE_VERSION = S.UA.ie;


    if (IE_VERSION < 8) {

        attrHooks['style'].set = function (el, val) {
            el.style.cssText = val;
        };

        // get attribute value from attribute node for ie
        S.mix(attrNodeHook, {
            get: function (elem, name) {
                var ret = elem.getAttributeNode(name);
                // Return undefined if attribute node specified by user
                return ret && (
                    // fix #100
                    ret.specified
                        || ret.nodeValue) ?
                    ret.nodeValue :
                    undefined;
            },
            set: function (elem, value, name) {
                // Check form objects in IE (multiple bugs related)
                // Only use nodeValue if the attribute node exists on the form
                var ret = elem.getAttributeNode(name), attr;
                if (ret) {
                    ret.nodeValue = value;
                } else {
                    try {
                        attr = elem.ownerDocument.createAttribute(name);
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
        });

        // ie6,7 不区分 attribute 与 property
        S.mix(DOM._attrFix, propFix);

        // http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
        attrHooks.tabIndex = attrHooks.tabindex;

        // 不光是 href, src, 还有 rowspan 等非 mapping 属性，也需要用第 2 个参数来获取原始值
        // 注意 colSpan rowSpan 已经由 propFix 转为大写
        S.each([ HREF, 'src', 'width', 'height', 'colSpan', 'rowSpan' ], function (name) {
            attrHooks[ name ] = {
                get: function (elem) {
                    var ret = elem.getAttribute(name, 2);
                    return ret === null ? undefined : ret;
                }
            };
        });

        // button 元素的 value 属性和其内容冲突
        // <button value='xx'>zzz</button>
        valHooks.button = attrHooks.value = attrNodeHook;

        // 当没有设定 value 时，标准浏览器 option.value === option.text
        // ie7- 下，没有设定 value 时，option.value === '',
        // 需要用 el.attributes.value 来判断是否有设定 value
        valHooks['option'] = {
            get: function (elem) {
                var val = elem.attributes.value;
                return !val || val.specified ? elem.value : elem.text;
            }
        };

    }

    // https://github.com/kissyteam/kissy/issues/198
    // http://social.msdn.microsoft.com/Forums/en-US/iewebdevelopment/thread/aa6bf9a5-0c0b-4a02-a115-c5b85783ca8c
    // http://gabriel.nagmay.com/2008/11/javascript-href-bug-in-ie/
    // https://groups.google.com/group/jquery-dev/browse_thread/thread/22029e221fe635c6?pli=1
    hrefFix = attrHooks[HREF] = attrHooks[HREF] || {};
    hrefFix.set = function (el, val, name) {
        var childNodes = el.childNodes,
            b,
            len = childNodes.length,
            allText = len > 0;
        for (len = len - 1; len >= 0; len--) {
            if (childNodes[len].nodeType != NodeType.TEXT_NODE) {
                allText = 0;
            }
        }
        if (allText) {
            b = el.ownerDocument.createElement('b');
            b.style.display = 'none';
            el.appendChild(b);
        }
        el.setAttribute(name, '' + val);
        if (b) {
            el.removeChild(b);
        }
    };

    return DOM;
}, {
    requires: ['dom/base']
});
/**
 * 2012-11-27 yiminghe@gmail.com note:
 *  no need for feature detection for old-ie!
 */