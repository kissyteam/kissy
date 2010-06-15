/**
 * @module  dom-create
 * @author  lifesinger@gmail.com
 */
KISSY.add('dom-create', function(S) {

    var doc = document,
        DOM = S.DOM, UA = S.UA,
        DIV = 'div',
        PARENT_NODE = 'parentNode',
        DEFAULT_DIV = doc.createElement(DIV),
        RE_TAG = /<([a-z]+)/i,
        RE_SIMPLE_TAG = /^[a-z]+$/i;

    S.mix(DOM, {

        /**
         * Creates a new HTMLElement using the provided html string.
         */
        create: function(html, ownerDoc) {
            if (!(html = S.trim(html))) return null;

            // simple tag, such as DOM.create('p')
            if (RE_SIMPLE_TAG.test(html)) {
                return (ownerDoc || doc).createElement(html);
            }

            var ret = null,
                creators = DOM._creators,
                m = RE_TAG.exec(html),
                tag = DIV, k, nodes;

            if (m && (k = m[1]) && S.isFunction(creators[(k = k.toLowerCase())])) {
                tag = k;
            }
            nodes = creators[tag](html, ownerDoc);

            if (nodes.length === 1) {
                // return single node, breaking parentNode ref from "fragment"
                ret = nodes[0].parentNode.removeChild(nodes[0]);
            }
            else {
                // return multiple nodes as a fragment
                ret = nl2frag(nodes, ownerDoc || doc);
            }

            return ret;
        },

        _creators: {
            'div': function(html, ownerDoc) {
                var div = ownerDoc ? ownerDoc.createElement(DIV) : DEFAULT_DIV;
                div.innerHTML = html;
                return div.childNodes;
            }
        }
    });

    // 将 nodeList 转换为 fragment
    function nl2frag(nodes, ownerDoc) {
        var ret = null, i, len;

        if (nodes && (nodes.push || nodes.item) && nodes[0]) {
            ownerDoc = ownerDoc || nodes[0].ownerDocument;
            ret = ownerDoc.createDocumentFragment();

            if (nodes.item) { // convert live list to static array
                nodes = S.makeArray(nodes);
            }

            for (i = 0, len = nodes.length; i < len; i++) {
                ret.appendChild(nodes[i]);
            }
        }
        else {
            S.error('Unable to convert ' + nodes + ' to fragment.');
        }

        return ret;
    }

    // 定义 creators, 处理浏览器兼容
    var creators = DOM._creators,
        create = DOM.create,
        RE_TBODY = /(?:\/(?:thead|tfoot|tbody|caption|col|colgroup)>)+\s*<tbody/;

    if (UA.ie && UA.ie < 8) {
        S.mix(creators, {
            // IE adds TBODY when creating TABLE elements (which may share this impl)
            tbody: function(html, ownerDoc) {
                var table = create('<table>' + html + '</table>', ownerDoc),
                    tbody = table.children.tags('tbody')[0];

                if (table.children.length > 1 && tbody && !RE_TBODY.test(html)) {
                    tbody[PARENT_NODE].removeChild(tbody); // strip extraneous tbody
                }
                return frag;
            },

            script: function(html, doc) {
                var frag = doc.createElement('div');

                frag.innerHTML = '-' + html;
                frag.removeChild(frag[FIRST_CHILD]);
                return frag;
            }
        });
    }

    if (UA.gecko || UA.ie) {
        S.mix(creators, {
            option: function(html, doc) {
                return create('<select>' + html + '</select>', doc);
            },

            tr: function(html, doc) {
                return create('<tbody>' + html + '</tbody>', doc);
            },

            td: function(html, doc) {
                return create('<tr>' + html + '</tr>', doc);
            },

            tbody: function(html, doc) {
                return create(TABLE_OPEN + html + TABLE_CLOSE, doc);
            }
        });

        S.mix(creators, {
            legend: 'fieldset',
            th: creators.td,
            thead: creators.tbody,
            tfoot: creators.tbody,
            caption: creators.tbody,
            colgroup: creators.tbody,
            col: creators.tbody,
            optgroup: creators.option
        });
    }
});

/**
 * TODO:
 *  - 研究 jQuery 的 buildFragment 和 clean
 *  - 增加 cache, 完善 test cases
 */
