/**
 * definition for node and nodelist
 * @author lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add("node/base", function(S, DOM, undefined) {

    var AP = Array.prototype,
        makeArray = S.makeArray,
        isNodeList = DOM._isNodeList;

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
            if (S.isNumber(index)) {
                if (index >= this.length) return null;
                return new NodeList(this[index]);
            } else
                return new NodeList(index);
        },

        add:function(selector, context, index) {
            if (S.isNumber(context)) {
                index = context;
                context = undefined;
            }
            var list = NodeList.all(selector, context),
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
            var self = this,len = self.length, i = 0, node;

            for (node = new NodeList(self[0]);
                 i < len && fn.call(context || node, node, i, this) !== false;
                 node = new NodeList(self[++i])) {
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
                return NodeList.all(selector, this);
            }
            return new NodeList();
        }
    });

    NodeList.prototype.one = function(selector) {
        var all = this.all(selector);
        return all.length ? all.slice(0, 1) : null;
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
        return new NodeList(DOM.query(selector, context));
    };

    NodeList.one = function(selector, context) {
        var all = NodeList.all(selector, context);
        return all.length ? all.slice(0, 1) : null;
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
