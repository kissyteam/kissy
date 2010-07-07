/**
 * @module  dom-create
 * @author  lifesinger@gmail.com
 */
KISSY.add('dom-create', function(S, undefined) {

    var doc = document,
        DOM = S.DOM, UA = S.UA, ie = UA.ie,
        isElementNode = DOM._isElementNode,
        DIV = 'div',
        PARENT_NODE = 'parentNode',
        DEFAULT_DIV = doc.createElement(DIV),
        RE_TAG = /<(\w+)/,
        RE_SIMPLE_TAG = /^<(\w+)\s*\/?>(?:<\/\1>)?$/;

    S.mix(DOM, {

        /**
         * Creates a new HTMLElement using the provided html string.
         */
        create: function(html, props, ownerDoc) {
            if(isElementNode(html)) return html;
            if (!(html = S.trim(html))) return null;

            var ret = null, creators = DOM._creators,
                m, tag = DIV, k, nodes;

            // 简单 tag, 比如 DOM.create('<p>')
            if ((m = RE_SIMPLE_TAG.exec(html))) {
                ret = (ownerDoc || doc).createElement(m[1]);
            }
            // 复杂情况，比如 DOM.create('<img src="sprite.png" />')
            else {
                if ((m = RE_TAG.exec(html)) && (k = m[1]) && S.isFunction(creators[(k = k.toLowerCase())])) {
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
                frag.innerHTML = html;
                return frag;
            }
        },

        /**
         * Gets/Sets the HTML contents of the HTMLElement.
         */
        html: function(selector, val) {
            // getter
            if (val === undefined) {
                // supports css selector/Node/NodeList
                var el = S.get(selector);

                // only gets value on element nodes
                if (isElementNode(el)) {
                    return el.innerHTML;
                }
            }
            // setter
            else {
                S.each(S.query(selector), function(el) {
                   if(isElementNode(el)) {
                       el.innerHTML = '';
                       // 排除掉 val == '' 的情况
                       if(val) el.appendChild(DOM.create(val));
                   }
                });
            }
        },

        /**
         * Remove the set of matched elements from the DOM.
         */
        remove: function(selector) {
            S.each(S.query(selector), function(el) {
                if (isElementNode(el) && el.parentNode) {
                    el.parentNode.removeChild(el);
                }
            });
        }
    });

    // 添加成员到元素中
    function attachProps(elem, props) {
        if (isElementNode(elem) && props) {
            for (var p in props) {
                DOM.attr(elem, p, props[p]);
            }
        }
        return elem;
    }

    // 将 nodeList 转换为 fragment
    function nl2frag(nodes, ownerDoc) {
        var ret = null, i, len;

        if (nodes && (nodes.push || nodes.item) && nodes[0]) {
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

    if (UA.gecko || ie) {
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
});

/**
 * TODO:
 *  - 研究 jQuery 的 buildFragment 和 clean
 *  - 增加 cache, 完善 test cases
 *  - 支持更多 props
 */
