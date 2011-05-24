/**
 * definition for node and nodelist
 * @author: lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add("node/base", function(S, DOM) {

    /**
     * The Node class provides a wrapper for manipulating DOM Node.
     */
    function Node(html, props, ownerDocument) {
        var self = this, domNode;

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
                return new NodeList(domNode.childNodes);
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
        // return if node
        if (selector.getDOMNode) {
            return selector;
        }
        var elem = DOM.get(selector, context);
        return elem ? new Node(elem, undefined, undefined) : null;
    };

    var AP = Array.prototype,
        isElementNode = DOM._isElementNode;

    /**
     * The NodeList class provides a wrapper for manipulating DOM NodeList.
     */
    function NodeList(domNodes) {
        // push nodes
        AP.push.apply(this, S.makeArray(domNodes));
    }

    S.mix(NodeList.prototype, {

            /**
             * 默认长度为 0
             */
            length: 0,

            /**
             * 根据 index 或 DOMElement 获取对应的 KSNode
             */
            item: function(index) {
                var self = this, ret = null, i, len;

                // 找到 DOMElement 对应的 index
                if (isElementNode(index)) {
                    for (i = 0,len = self.length; i < len; i++) {
                        if (index === self[i]) {
                            index = i;
                            break;
                        }
                    }
                }

                // 转换为 KSNode
                if (isElementNode(self[index])) {
                    ret = new Node(self[index], undefined, undefined);
                }

                return ret;
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
             * @param context An optional context to apply the function with Default context is the current Node instance
             */
            each: function(fn, context) {
                var self = this,len = self.length, i = 0, node;

                for (node = new Node(self[0], undefined, undefined);
                     i < len && fn.call(context || node, node, i, this) !== false;
                     node = new Node(self[++i], undefined, undefined)) {
                }

                return this;
            }
        });

    // query api
    NodeList.all = function(selector, context) {
        // return if node or nodelist
        if (selector.getDOMNode) {
            return new NodeList(selector);
        } else if (selector.getDOMNodes) {
            return selector;
        }
        return new NodeList(DOM.query(selector, context, true));
    };

    Node.List = NodeList;

    return Node;
}, {
        requires:["dom"]
    });


/**
 * Notes:
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
