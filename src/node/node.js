/**
 * @module  node
 * @author  lifesinger@gmail.com
 */
KISSY.add('node/node', function(S, DOM, undefined) {

    /**
     * The Node class provides a wrapper for manipulating DOM Node.
     */
    function Node(html, props, ownerDocument) {
        var self = this, domNode;

        // factory or constructor
        if (!(self instanceof Node)) {
            return new Node(html, props, ownerDocument);
        }

        // handle Node(''), Node(null), or Node(undefined)
        if (!html) {
            self.length = 0;
            return undefined;
        }

        // create from html
        if (S.isString(html)) {
            domNode = DOM.create(html, props, ownerDocument);
            // 将 S.Node('<p>1</p><p>2</p>') 转换为 NodeList
            if (domNode.nodeType === 11) { // fragment
                return new (S.require("node/nodelist"))(domNode.childNodes);
            }
        }
        // handle Node
        else if (html instanceof Node) {
            return html;
        }
        // node, document, window 等等，由使用者保证正确性
        else {
            domNode = html;
        }

        self[0] = domNode;
        return undefined;
    }

    Node.TYPE = '-ks-Node';

    S.augment(Node, {

        /**
         * 长度为 1
         */
        length: 1,

        /**
         * Retrieves the DOMNode.
         */
        getDOMNode: function() {
            return this[0];
        },

        nodeType: Node.TYPE
    });

    // query api
    Node.one = function(selector, context) {
        var elem = DOM.get(selector, context);
        return elem ? new Node(elem, undefined, undefined) : null;
    };

    return Node;
}, {
    requires:["dom"]
});
