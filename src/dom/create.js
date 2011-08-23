/**
 * @module  dom-create
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
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
                if (nodeTypeIs(html, DOM.ELEMENT_NODE)
                    || nodeTypeIs(html, DOM.TEXT_NODE)) {
                    return DOM.clone(html);
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
                    html = html.replace(rxhtmlTag, "<$1><" + "/$2>");

                    if ((m = RE_TAG.exec(html)) && (k = m[1])) {
                        tag = k.toLowerCase();
                    }

                    nodes = (creators[tag] || creators[DIV])(html, ownerDoc).childNodes;

                    if (nodes.length === 1) {
                        // return single node, breaking parentNode ref from "fragment"
                        ret = nodes[0][PARENT_NODE].removeChild(nodes[0]);
                    }
                    else if (nodes.length) {
                        // return multiple nodes as a fragment
                        ret = nl2frag(nodes, ownerDoc || doc);
                    } else {
                        S.error(html + " : create node error");
                    }
                }

                return attachProps(ret, props);
            },

            _creators: {
                div: function(html, ownerDoc) {
                    var frag = ownerDoc ? ownerDoc.createElement(DIV) : DEFAULT_DIV;
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
                // getter
                if (val === undefined) {
                    // supports css selector/Node/NodeList
                    var el = DOM.get(selector);

                    // only gets value on element nodes
                    if (isElementNode(el)) {
                        return el['innerHTML'];
                    }
                }
                // setter
                else {
                    DOM.query(selector).each(function(elem) {
                        if (isElementNode(elem)) {
                            setHTML(elem, val, loadScripts, callback);
                        }
                    });
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
                    if (!keepData && el.nodeType == DOM.ELEMENT_NODE) {
                        // 清楚事件
                        var Event = S.require("event");
                        if (Event) {
                            Event.detach(el.getElementsByTagName("*"));
                            Event.detach(el);
                        }
                        DOM.removeData(el.getElementsByTagName("*"));
                        DOM.removeData(el);
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

                if (elem.nodeType == DOM.ELEMENT_NODE ||
                    elem.nodeType == DOM.DOCUMENT_FRAGMENT_NODE) {
                    // IE copies events bound via attachEvent when using cloneNode.
                    // Calling detachEvent on the clone will also remove the events
                    // from the original. In order to get around this, we use some
                    // proprietary methods to clear the events. Thanks to MooTools
                    // guys for this hotness.
                    if (elem.nodeType == DOM.ELEMENT_NODE) {
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

            _nl2frag:nl2frag
        });

        function processAll(fn, elem, clone) {
            var elemChildren = elem.getElementsByTagName("*"),
                cloneChildren = clone.getElementsByTagName("*"),
                cindex = 0;
            while (elemChildren[cindex]) {
                if (cloneChildren[cindex]) {
                    fn(elemChildren[cindex], cloneChildren[cindex]);
                }
                cindex++;
            }
        }


        // 克隆除了事件的 data
        function cloneWidthDataAndEvent(src, dest) {
            var Event = S.require('event');

            if (dest.nodeType !== DOM.ELEMENT_NODE && !DOM.hasData(src)) {
                return;
            }

            var srcData = DOM.data(src);

            // 浅克隆，data 也放在克隆节点上
            for (var d in srcData) {
                DOM.data(dest, d, srcData[d]);
            }

            // 事件要特殊点
            if (Event) {
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

            var nodeName = dest.nodeName.toLowerCase();

            // IE6-8 fail to clone children inside object elements that use
            // the proprietary classid attribute value (rather than the type
            // attribute) to identify the type of content to display
            if (nodeName === "object" && !dest.childNodes.length) {
                S.each(src.childNodes, function(c) {
                    dest.appendChild(c);
                });
                // dest.outerHTML = src.outerHTML;
            } else if (nodeName === "input" && (src.type === "checkbox" || src.type === "radio")) {
                // IE6-8 fails to persist the checked state of a cloned checkbox
                // or radio button. Worse, IE6-7 fail to give the cloned element
                // a checked appearance if the defaultChecked value isn't also set
                if (src.checked) {
                    dest.defaultChecked = dest.checked = src.checked;
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
                else if (elem.nodeType == DOM.DOCUMENT_FRAGMENT_NODE) {
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


        // 直接通过 innerHTML 设置 html
        function setHTMLSimple(elem, html) {
            html = (html + '').replace(RE_SCRIPT, ''); // 过滤掉所有 script
            try {
                elem['innerHTML'] = html;
            }
            catch(ex) {
                S.log("set innerHTML error : ");
                S.log(ex);
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

            html += '<span id="' + id + '"><' + '/span>';

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

        // only for gecko and ie
        // 2010-10-22: 发现 chrome 也与 gecko 的处理一致了
        if (ie || UA['gecko'] || UA['webkit']) {
            // 定义 creators, 处理浏览器兼容
            var creators = DOM._creators,
                create = DOM.create,
                TABLE_OPEN = '<table>',
                TABLE_CLOSE = '<' + '/table>',
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
    },
    {
        requires:["./base","ua"]
    });

/**
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
