/**
 * @ignore
 * dom-create
 * @author lifesinger@gmail.com, yiminghe@gmail.com
 */
KISSY.add('dom/base/create', function (S, Dom, undefined) {
    var doc = S.Env.host.document,
        NodeType = Dom.NodeType,
        UA = S.UA,
        ie = UA['ie'],
        DIV = 'div',
        PARENT_NODE = 'parentNode',
        DEFAULT_DIV = doc && doc.createElement(DIV),
        R_XHTML_TAG = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
        RE_TAG = /<([\w:]+)/,
        R_LEADING_WHITESPACE = /^\s+/,
        R_TAIL_WHITESPACE = /\s+$/,
        lostLeadingTailWhitespace = ie && ie < 9,
        R_HTML = /<|&#?\w+;/,
        supportOuterHTML = doc && 'outerHTML' in doc.documentElement,
        RE_SIMPLE_TAG = /^<(\w+)\s*\/?>(?:<\/\1>)?$/;

    // help compression
    function getElementsByTagName(el, tag) {
        return el.getElementsByTagName(tag);
    }

    function cleanData(els) {
        var DOMEvent = S.require('event/dom');
        if (DOMEvent) {
            DOMEvent.detach(els);
        }
        Dom.removeData(els);
    }

    function getHolderDiv(ownerDoc) {
        var holder = ownerDoc && ownerDoc != doc ?
            ownerDoc.createElement(DIV) :
            DEFAULT_DIV;
        if (holder === DEFAULT_DIV) {
            holder.innerHTML = '';
        }
        return holder;
    }

    function defaultCreator(html, ownerDoc) {
        var frag = getHolderDiv(ownerDoc);
        // html 为 <style></style> 时不行，必须有其他元素？
        frag.innerHTML = 'm<div>' + html + '<' + '/div>';
        return frag.lastChild;
    }

    S.mix(Dom,
        /**
         * @override KISSY.DOM
         * @class
         * @singleton
         */
        {

            /**
             * Creates Dom elements on the fly from the provided string of raw HTML.
             * @param {String} html A string of HTML to create on the fly. Note that this parses HTML, not XML.
             * @param {Object} [props] An map of attributes on the newly-created element.
             * @param {HTMLDocument} [ownerDoc] A document in which the new elements will be created
             * @param {Boolean} [_trim]
             * @return {DocumentFragment|HTMLElement}
             */
            create: function (html, props, ownerDoc, _trim/*internal*/) {
                var ret = null;

                if (!html) {
                    return ret;
                }

                if (html.nodeType) {
                    return Dom.clone(html);
                }


                if (typeof html != 'string') {
                    return ret;
                }

                if (_trim === undefined) {
                    _trim = true;
                }

                if (_trim) {
                    html = S.trim(html);
                }

                var creators = Dom._creators,
                    holder,
                    whitespaceMatch,
                    context = ownerDoc || doc,
                    m,
                    tag = DIV,
                    k,
                    nodes;

                if (!R_HTML.test(html)) {
                    ret = context.createTextNode(html);
                }
                // 简单 tag, 比如 Dom.create('<p>')
                else if ((m = RE_SIMPLE_TAG.exec(html))) {
                    ret = context.createElement(m[1]);
                }
                // 复杂情况，比如 Dom.create('<img src='sprite.png' />')
                else {
                    // Fix 'XHTML'-style tags in all browsers
                    html = html.replace(R_XHTML_TAG, '<$1><' + '/$2>');

                    if ((m = RE_TAG.exec(html)) && (k = m[1])) {
                        tag = k.toLowerCase();
                    }

                    holder = (creators[tag] || defaultCreator)(html, context);
                    // ie 把前缀空白吃掉了
                    if (lostLeadingTailWhitespace &&
                        (whitespaceMatch = html.match(R_LEADING_WHITESPACE))) {
                        holder.insertBefore(context.createTextNode(whitespaceMatch[0]),
                            holder.firstChild);
                    }
                    if (lostLeadingTailWhitespace && /\S/.test(html) &&
                        (whitespaceMatch = html.match(R_TAIL_WHITESPACE))) {
                        holder.appendChild(context.createTextNode(whitespaceMatch[0]));
                    }

                    nodes = holder.childNodes;

                    if (nodes.length === 1) {
                        // return single node, breaking parentNode ref from 'fragment'
                        ret = nodes[0][PARENT_NODE].removeChild(nodes[0]);
                    } else if (nodes.length) {
                        // return multiple nodes as a fragment
                        ret = nodeListToFragment(nodes);
                    } else {
                        S.error(html + ' : create node error');
                    }
                }

                return attachProps(ret, props);
            },

            _fixCloneAttributes: function (src, dest) {
                // value of textarea can not be clone in chrome/firefox??
                if (Dom.nodeName(src) === 'textarea') {
                    dest.defaultValue = src.defaultValue;
                    dest.value = src.value;
                }
            },

            _creators: {
                div: defaultCreator
            },

            _defaultCreator: defaultCreator,

            /**
             * Get the HTML contents of the first element in the set of matched elements.
             * or
             * Set the HTML contents of each element in the set of matched elements.
             * @param {HTMLElement|String|HTMLElement[]} selector matched elements
             * @param {String} [htmlString]  A string of HTML to set as the content of each matched element.
             * @param {Boolean} [loadScripts=false] True to look for and process scripts
             */
            html: function (selector, htmlString, loadScripts) {
                // supports css selector/Node/NodeList
                var els = Dom.query(selector),
                    el = els[0],
                    success = false,
                    valNode,
                    i, elem;
                if (!el) {
                    return null;
                }
                // getter
                if (htmlString === undefined) {
                    // only gets value on the first of element nodes
                    if (el.nodeType == NodeType.ELEMENT_NODE) {
                        return el.innerHTML;
                    } else if (el.nodeType == NodeType.DOCUMENT_FRAGMENT_NODE) {
                        var holder = getHolderDiv(el.ownerDocument);
                        holder.appendChild(el);
                        return holder.innerHTML;
                    } else {
                        return null;
                    }
                }
                // setter
                else {
                    htmlString += '';

                    // faster
                    // fix #103,some html element can not be set through innerHTML
                    if (!htmlString.match(/<(?:script|style|link)/i) &&
                        (!lostLeadingTailWhitespace || !htmlString.match(R_LEADING_WHITESPACE)) && !creatorsMap[ (htmlString.match(RE_TAG) || ['', ''])[1].toLowerCase() ]) {

                        try {
                            for (i = els.length - 1; i >= 0; i--) {
                                elem = els[i];
                                if (elem.nodeType == NodeType.ELEMENT_NODE) {
                                    cleanData(getElementsByTagName(elem, '*'));
                                    elem.innerHTML = htmlString;
                                }
                            }
                            success = true;
                        } catch (e) {
                            // a <= '<a>'
                            // a.innerHTML='<p>1</p>';
                        }

                    }

                    if (!success) {
                        valNode = Dom.create(htmlString, 0, el.ownerDocument, 0);
                        Dom.empty(els);
                        Dom.append(valNode, els, loadScripts);
                    }
                }
                return undefined;
            },

            /**
             * Get the outerHTML of the first element in the set of matched elements.
             * or
             * Set the outerHTML of each element in the set of matched elements.
             * @param {HTMLElement|String|HTMLElement[]} selector matched elements
             * @param {String} [htmlString]  A string of HTML to set as outerHTML of each matched element.
             * @param {Boolean} [loadScripts=false] True to look for and process scripts
             */
            outerHtml: function (selector, htmlString, loadScripts) {
                var els = Dom.query(selector),
                    holder,
                    i,
                    valNode,
                    length = els.length,
                    el = els[0];
                if (!el) {
                    return null;
                }
                // getter
                if (htmlString === undefined) {
                    if (supportOuterHTML && el.nodeType != Dom.DOCUMENT_FRAGMENT_NODE) {
                        return el.outerHTML
                    } else {
                        holder = getHolderDiv(el.ownerDocument);
                        holder.appendChild(Dom.clone(el, true));
                        return holder.innerHTML;
                    }
                } else {
                    htmlString += '';
                    if (!htmlString.match(/<(?:script|style|link)/i) && supportOuterHTML) {
                        for (i = length - 1; i >= 0; i--) {
                            el = els[i];
                            if (el.nodeType == NodeType.ELEMENT_NODE) {
                                cleanData(el);
                                cleanData(getElementsByTagName(el, '*'));
                                el.outerHTML = htmlString;
                            }
                        }
                    } else {
                        valNode = Dom.create(htmlString, 0, el.ownerDocument, 0);
                        Dom.insertBefore(valNode, els, loadScripts);
                        Dom.remove(els);
                    }
                }
                return undefined;
            },

            /**
             * Remove the set of matched elements from the Dom.
             * @param {HTMLElement|String|HTMLElement[]} selector matched elements
             * @param {Boolean} [keepData=false] whether keep bound events and jQuery data associated with the elements from removed.
             */
            remove: function (selector, keepData) {
                var el,
                    els = Dom.query(selector),
                    all,
                    parent,
                    DOMEvent = S.require('event/dom'),
                    i;
                for (i = els.length - 1; i >= 0; i--) {
                    el = els[i];
                    if (!keepData && el.nodeType == NodeType.ELEMENT_NODE) {
                        all = S.makeArray(getElementsByTagName(el, '*'));
                        all.push(el);
                        Dom.removeData(all);
                        if (DOMEvent) {
                            DOMEvent.detach(all);
                        }
                    }
                    if (parent = el.parentNode) {
                        parent.removeChild(el);
                    }
                }
            },

            /**
             * Create a deep copy of the first of matched elements.
             * @param {HTMLElement|String|HTMLElement[]} selector matched elements
             * @param {Boolean|Object} [deep=false] whether perform deep copy or copy config.
             * @param {Boolean} [deep.deep] whether perform deep copy
             * @param {Boolean} [deep.withDataAndEvent=false] A Boolean indicating
             * whether event handlers and data should be copied along with the elements.
             * @param {Boolean} [deep.deepWithDataAndEvent=false]
             * A Boolean indicating whether event handlers and data for all children of the cloned element should be copied.
             * if set true then deep argument must be set true as well.
             * @param {Boolean} [withDataAndEvent=false] A Boolean indicating
             * whether event handlers and data should be copied along with the elements.
             * @param {Boolean} [deepWithDataAndEvent=false]
             * A Boolean indicating whether event handlers and data for all children of the cloned element should be copied.
             * if set true then deep argument must be set true as well.
             * refer: https://developer.mozilla.org/En/Dom/Node.cloneNode
             * @return {HTMLElement}
             * @member KISSY.DOM
             */
            clone: function (selector, deep, withDataAndEvent, deepWithDataAndEvent) {
                if (typeof deep === 'object') {
                    deepWithDataAndEvent = deep['deepWithDataAndEvent'];
                    withDataAndEvent = deep['withDataAndEvent'];
                    deep = deep['deep'];
                }

                var elem = Dom.get(selector),
                    clone,
                    _fixCloneAttributes = Dom._fixCloneAttributes,
                    elemNodeType;

                if (!elem) {
                    return null;
                }

                elemNodeType = elem.nodeType;

                // TODO
                // ie bug :
                // 1. ie<9 <script>xx</script> => <script></script>
                // 2. ie will execute external script
                clone = /**
                 @type HTMLElement
                 @ignore*/elem.cloneNode(deep);

                if (elemNodeType == NodeType.ELEMENT_NODE ||
                    elemNodeType == NodeType.DOCUMENT_FRAGMENT_NODE) {
                    // IE copies events bound via attachEvent when using cloneNode.
                    // Calling detachEvent on the clone will also remove the events
                    // from the original. In order to get around this, we use some
                    // proprietary methods to clear the events. Thanks to MooTools
                    // guys for this hotness.
                    if (_fixCloneAttributes && elemNodeType == NodeType.ELEMENT_NODE) {
                        _fixCloneAttributes(elem, clone);
                    }

                    if (deep && _fixCloneAttributes) {
                        processAll(_fixCloneAttributes, elem, clone);
                    }
                }
                // runtime 获得事件模块
                if (withDataAndEvent) {
                    cloneWithDataAndEvent(elem, clone);
                    if (deep && deepWithDataAndEvent) {
                        processAll(cloneWithDataAndEvent, elem, clone);
                    }
                }
                return clone;
            },

            /**
             * Remove(include data and event handlers) all child nodes of the set of matched elements from the Dom.
             * @param {HTMLElement|String|HTMLElement[]} selector matched elements
             */
            empty: function (selector) {
                var els = Dom.query(selector),
                    el, i;
                for (i = els.length - 1; i >= 0; i--) {
                    el = els[i];
                    Dom.remove(el.childNodes);
                }
            },

            _nodeListToFragment: nodeListToFragment
        });

    // compatibility
    Dom.outerHTML = Dom.outerHtml;

    function processAll(fn, elem, clone) {
        var elemNodeType = elem.nodeType;
        if (elemNodeType == NodeType.DOCUMENT_FRAGMENT_NODE) {
            var eCs = elem.childNodes,
                cloneCs = clone.childNodes,
                fIndex = 0;
            while (eCs[fIndex]) {
                if (cloneCs[fIndex]) {
                    processAll(fn, eCs[fIndex], cloneCs[fIndex]);
                }
                fIndex++;
            }
        } else if (elemNodeType == NodeType.ELEMENT_NODE) {
            var elemChildren = getElementsByTagName(elem, '*'),
                cloneChildren = getElementsByTagName(clone, '*'),
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
    function cloneWithDataAndEvent(src, dest) {
        var DOMEvent = S.require('event/dom'),
            srcData,
            d;

        if (dest.nodeType == NodeType.ELEMENT_NODE && !Dom.hasData(src)) {
            return;
        }

        srcData = Dom.data(src);

        // 浅克隆，data 也放在克隆节点上
        for (d in srcData) {
            Dom.data(dest, d, srcData[d]);
        }

        // 事件要特殊点
        if (DOMEvent) {
            // attach src 's event data and dom attached listener to dest
            DOMEvent.clone(src, dest);
        }
    }

    // 添加成员到元素中
    function attachProps(elem, props) {
        if (S.isPlainObject(props)) {
            if (elem.nodeType == NodeType.ELEMENT_NODE) {
                Dom.attr(elem, props, true);
            }
            // document fragment
            else if (elem.nodeType == NodeType.DOCUMENT_FRAGMENT_NODE) {
                Dom.attr(elem.childNodes, props, true);
            }
        }
        return elem;
    }

    // 将 nodeList 转换为 fragment
    function nodeListToFragment(nodes) {
        var ret = null,
            i,
            ownerDoc,
            len;
        if (nodes && (nodes.push || nodes.item) && nodes[0]) {
            ownerDoc = nodes[0].ownerDocument;
            ret = ownerDoc.createDocumentFragment();
            nodes = S.makeArray(nodes);
            for (i = 0, len = nodes.length; i < len; i++) {
                ret.appendChild(nodes[i]);
            }
        } else {
            S.log('Unable to convert ' + nodes + ' to fragment.');
        }
        return ret;
    }

    // 残缺元素处理
    var creators = Dom._creators,
        create = Dom.create,
        creatorsMap = {
            area: 'map',
            thead: 'table',
            td: 'tr',
            th: 'tr',
            tr: 'tbody',
            tbody: 'table',
            tfoot: 'table',
            caption: 'table',
            colgroup: 'table',
            col: 'colgroup',
            legend: 'fieldset'
        }, p;

    for (p in creatorsMap) {
        (function (tag) {
            creators[p] = function (html, ownerDoc) {
                return create('<' + tag + '>' +
                    html + '<' + '/' + tag + '>',
                    undefined, ownerDoc);
            };
        })(creatorsMap[p]);
    }

    // https://github.com/kissyteam/kissy/issues/422
    creatorsMap['option'] = creatorsMap['optgroup'] = function (html, ownerDoc) {
        return create('<select multiple="multiple">' + html + '</select>', undefined, ownerDoc);
    };

    return Dom;
}, {
    requires: ['./api']
});

/*
 2012-01-31
 remove spurious tbody

 2011-10-13
 empty , html refactor

 2011-08-22
 clone 实现，参考 jq

 2011-08
 remove 需要对子孙节点以及自身清除事件以及自定义 data
 create 修改，支持 <style></style> ie 下直接创建
 */
