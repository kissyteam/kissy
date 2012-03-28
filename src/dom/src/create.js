/**
 * @fileOverview   dom-create
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add('dom/create', function (S, DOM, UA, undefined) {

        var doc = S.Env.host.document,
            ie = UA['ie'],
            nodeTypeIs = DOM._nodeTypeIs,
            isElementNode = DOM._isElementNode,
            isString = S.isString,
            DIV = 'div',
            PARENT_NODE = 'parentNode',
            DEFAULT_DIV = doc.createElement(DIV),
            rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
            RE_TAG = /<([\w:]+)/,
            rtbody = /<tbody/i,
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

        S.mix(DOM,
            /**
             * @lends DOM
             */
            {

                /**
                 * Creates DOM elements on the fly from the provided string of raw HTML.
                 * @param {String} html A string of HTML to create on the fly. Note that this parses HTML, not XML.
                 * @param {Object} [props] An map of attributes on the newly-created element.
                 * @param {Document} [ownerDoc] A document in which the new elements will be created
                 * @returns {DocumentFragment|HTMLElement}
                 */
                create:function (html, props, ownerDoc, _trim/*internal*/) {

                    var ret = null;

                    if (!html) {
                        return ret;
                    }

                    if (html.nodeType) {
                        return DOM.clone(html);
                    }


                    if (!isString(html)) {
                        return ret;
                    }

                    if (_trim === undefined) {
                        _trim = true;
                    }

                    if (_trim) {
                        html = S.trim(html);
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

                _creators:{
                    div:function (html, ownerDoc) {
                        var frag = ownerDoc && ownerDoc != doc ? ownerDoc.createElement(DIV) : DEFAULT_DIV;
                        // html 为 <style></style> 时不行，必须有其他元素？
                        frag['innerHTML'] = "m<div>" + html + "<" + "/div>";
                        return frag.lastChild;
                    }
                },

                /**
                 * Get the HTML contents of the first element in the set of matched elements.
                 * or
                 * Set the HTML contents of each element in the set of matched elements.
                 * @param {HTMLElement|String|HTMLElement[]} [selector] matched elements
                 * @param {String} htmlString  A string of HTML to set as the content of each matched element.
                 * @param {Boolean} [loadScripts=false] True to look for and process scripts
                 */
                html:function (selector, htmlString, loadScripts, callback) {
                    // supports css selector/Node/NodeList
                    var els = DOM.query(selector),
                        el = els[0];
                    if (!el) {
                        return
                    }
                    // getter
                    if (htmlString === undefined) {
                        // only gets value on the first of element nodes
                        if (isElementNode(el)) {
                            return el['innerHTML'];
                        } else {
                            return null;
                        }
                    }
                    // setter
                    else {

                        var success = false, i, elem;
                        htmlString += "";

                        // faster
                        // fix #103,some html element can not be set through innerHTML
                        if (!htmlString.match(/<(?:script|style|link)/i) &&
                            (!lostLeadingWhitespace || !htmlString.match(rleadingWhitespace)) &&
                            !creatorsMap[ (htmlString.match(RE_TAG) || ["", ""])[1].toLowerCase() ]) {

                            try {
                                for (i = els.length - 1; i >= 0; i--) {
                                    elem = els[i];
                                    if (isElementNode(elem)) {
                                        cleanData(getElementsByTagName(elem, "*"));
                                        elem.innerHTML = htmlString;
                                    }
                                }
                                success = true;
                            } catch (e) {
                                // a <= "<a>"
                                // a.innerHTML='<p>1</p>';
                            }

                        }

                        if (!success) {
                            var valNode = DOM.create(htmlString, 0, el.ownerDocument, 0);
                            for (i = els.length - 1; i >= 0; i--) {
                                elem = els[i];
                                if (isElementNode(elem)) {
                                    DOM.empty(elem);
                                    DOM.append(valNode, elem, loadScripts);
                                }
                            }
                        }
                        callback && callback();
                    }
                },

                /**
                 * Remove the set of matched elements from the DOM.
                 * @param {HTMLElement|String|HTMLElement[]} [selector] matched elements
                 * @param {Boolean} [keepData=false] whether keep bound events and jQuery data associated with the elements from removed.
                 */
                remove:function (selector, keepData) {
                    var el, els = DOM.query(selector), i;
                    for (i = els.length - 1; i >= 0; i--) {
                        el = els[i];
                        if (!keepData && isElementNode(el)) {
                            // 清理数据
                            var elChildren = getElementsByTagName(el, "*");
                            cleanData(elChildren);
                            cleanData(el);
                        }

                        if (el.parentNode) {
                            el.parentNode.removeChild(el);
                        }
                    }
                },

                /**
                 * Create a deep copy of the first of matched elements.
                 * @param {HTMLElement|String|HTMLElement[]} [selector] matched elements
                 * @param {Boolean} [deep=false] whether perform deep copy
                 * @param {Boolean} [withDataAndEvent=false] A Boolean indicating
                 * whether event handlers and data should be copied along with the elements.
                 * @param {Boolean} [deepWithDataAndEvent=false]
                 * A Boolean indicating whether event handlers and data for all children of the cloned element should be copied.
                 * if set true then deep argument must be set true as well.
                 * @see https://developer.mozilla.org/En/DOM/Node.cloneNode
                 * @returns {HTMLElement}
                 */
                clone:function (selector, deep, withDataAndEvent, deepWithDataAndEvent) {
                    var elem = DOM.get(selector);

                    if (!elem) {
                        return null;
                    }

                    // TODO
                    // ie bug :
                    // 1. ie<9 <script>xx</script> => <script></script>
                    // 2. ie will execute external script
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

                /**
                 * Remove(include data and event handlers) all child nodes of the set of matched elements from the DOM.
                 * @param {HTMLElement|String|HTMLElement[]} [selector] matched elements
                 */
                empty:function (selector) {
                    var els = DOM.query(selector), el, i;
                    for (i = els.length - 1; i >= 0; i--) {
                        el = els[i];
                        DOM.remove(el.childNodes);
                    }
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
                for (i = 0, len = nodes.length; i < len; i++) {
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
        // if (ie || UA['gecko'] || UA['webkit']) {
        // 定义 creators, 处理浏览器兼容
        var creators = DOM._creators,
            create = DOM.create,
            creatorsMap = {
                option:'select',
                optgroup:'select',
                area:'map',
                thead:'table',
                td:'tr',
                th:'tr',
                tr:'tbody',
                tbody:'table',
                tfoot:'table',
                caption:'table',
                colgroup:'table',
                col:'colgroup',
                legend:'fieldset' // ie 支持，但 gecko 不支持
            };

        for (var p in creatorsMap) {
            (function (tag) {
                creators[p] = function (html, ownerDoc) {
                    return create('<' + tag + '>' + html + '<' + '/' + tag + '>', null, ownerDoc);
                };
            })(creatorsMap[p]);
        }


        // IE7- adds TBODY when creating thead/tfoot/caption/col/colgroup elements
        if (ie < 8) {
            // fix #88
            // https://github.com/kissyteam/kissy/issues/88 : spurious tbody in ie<8
            creators.table = function (html, ownerDoc) {
                var frag = creators[DIV](html, ownerDoc),
                    hasTBody = rtbody.test(html);
                if (hasTBody) {
                    return frag;
                }
                var table = frag.firstChild,
                    tableChildren = S.makeArray(table.childNodes);
                S.each(tableChildren, function (c) {
                    if (DOM._nodeName(c, "tbody") && !c.childNodes.length) {
                        table.removeChild(c);
                    }
                });
                return frag;
            };
        }
        //}
        return DOM;
    },
    {
        requires:["./base", "ua"]
    });

/**
 * 2012-01-31
 * remove spurious tbody
 *
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
