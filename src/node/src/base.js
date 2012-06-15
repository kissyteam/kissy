/**
 * @fileOverview definition for node and nodelist
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 */
KISSY.add("node/base", function (S, DOM, undefined) {

    var AP = Array.prototype,
        slice = AP.slice,
        push = AP.push,
        makeArray = S.makeArray,
        isNodeList = DOM._isNodeList;

    /**
     * @class The NodeList class provides a wrapper for manipulating DOM Node.
     * use KISSY.all/one to retrieve NodeList instances
     * @name NodeList
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
                push.apply(this, makeArray(domNode.childNodes));
                return undefined;
            }
        }

        else if (S.isArray(html) || isNodeList(html)) {
            push.apply(self, makeArray(html));
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

    S.augment(NodeList,
        /**
         * @lends NodeList#
         */
        {

            /**
             * length of nodelist
             * @type Number
             */
            length:0,


            /**
             * Get one node at index
             * @param {Number} index Index position.
             * @return {NodeList}
             */
            item:function (index) {
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

            /**
             * Add existing node list.
             * @param {String|HTMLElement[]|NodeList} selector Selector string or html string or common dom node.
             * @param {String|Array<HTMLElement>|NodeList|HTMLElement|Document} [context] Search context for selector
             * @param {Number} [index] Insert position.
             * @return {NodeList}
             */
            add:function (selector, context, index) {
                if (S.isNumber(context)) {
                    index = context;
                    context = undefined;
                }
                var list = NodeList.all(selector, context).getDOMNodes(),
                    ret = new NodeList(this);
                if (index === undefined) {
                    push.apply(ret, list);
                } else {
                    var args = [index, 0];
                    args.push.apply(args, list);
                    AP.splice.apply(ret, args);
                }
                return ret;
            },

            /**
             * Get part of node list.
             * @param {Number} start Start position.
             * @param {number} end End position.
             * @return {NodeList}
             */
            slice:function (start, end) {
                // ie<9 : [1,2].slice(-2,undefined) => []
                // ie<9 : [1,2].slice(-2) => []
                // fix #85
                return new NodeList(slice.apply(this, arguments));
            },

            /**
             * Retrieves the DOMNodes.
             */
            getDOMNodes:function () {
                return slice.call(this);
            },

            /**
             * Applies the given function to each Node in the NodeList.
             * @param fn The function to apply. It receives 3 arguments: the current node instance, the node's index, and the NodeList instance
             * @param [context] An optional context to apply the function with Default context is the current NodeList instance
             */
            each:function (fn, context) {
                var self = this;

                S.each(self, function (n, i) {
                    n = new NodeList(n);
                    return fn.call(context || n, n, i, self);
                });

                return self;
            },
            /**
             * Retrieves the DOMNode.
             */
            getDOMNode:function () {
                return this[0];
            },

            /**
             * return last stack node list.
             * @return {NodeList}
             */
            end:function () {
                var self = this;
                return self.__parent || self;
            },

            /**
             * Get node list which are descendants of current node list.
             * @param {String} selector Selector string
             * @return {NodeList}
             */
            all:function (selector) {
                var ret, self = this;
                if (self.length > 0) {
                    ret = NodeList.all(selector, self);
                } else {
                    ret = new NodeList();
                }
                ret.__parent = self;
                return ret;
            },

            one:function (selector) {
                var self = this, all = self.all(selector),
                    ret = all.length ? all.slice(0, 1) : null;
                if (ret) {
                    ret.__parent = self;
                }
                return ret;
            }
        });

    S.mix(NodeList,
        /**
         * @lends NodeList
         */
        {
            /**
             * Get node list from selector or construct new node list from html string.
             * Can also called from KISSY.all
             * @param {String|HTMLElement[]|NodeList} selector Selector string or html string or common dom node.
             * @param {String|Array<HTMLElement>|NodeList|HTMLElement|Document} [context] Search context for selector
             * @returns {NodeList}
             */
            all:function (selector, context) {
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
            one:function (selector, context) {
                var all = NodeList.all(selector, context);
                return all.length ? all.slice(0, 1) : null;
            }
        });

    S.mix(NodeList, DOM.NodeTypes);

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
