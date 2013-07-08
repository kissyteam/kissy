/**
 * @ignore
 * definition for node and nodelist
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 */
KISSY.add('node/base', function (S, Dom, Event, undefined) {

    var AP = Array.prototype,
        slice = AP.slice,
        NodeType = Dom.NodeType,
        push = AP.push,
        makeArray = S.makeArray,
        isNodeList = Dom.isDomNodeList;

    /**
     * The NodeList class provides a {@link KISSY.DOM} wrapper for manipulating Dom Node.
     * use KISSY.all/one to retrieve NodeList instances.
     *
     *  for example:
     *      @example
     *      KISSY.all('a').attr('href','http://docs.kissyui.com');
     *
     * is equal to
     *      @example
     *      KISSY.DOM.attr('a','href','http://docs.kissyui.com');
     *
     * @class KISSY.NodeList
     */
    function NodeList(html, props, ownerDocument) {
        var self = this,
            domNode;

        if (!(self instanceof NodeList)) {
            return new NodeList(html, props, ownerDocument);
        }

        // handle NodeList(''), NodeList(null), or NodeList(undefined)
        if (!html) {
            return self;
        }

        else if (typeof html == 'string') {
            // create from html
            domNode = Dom.create(html, props, ownerDocument);
            // ('<p>1</p><p>2</p>') 转换为 NodeList
            if (domNode.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE) { // fragment
                push.apply(this, makeArray(domNode.childNodes));
                return self;
            }
        }

        else if (S.isArray(html) || isNodeList(html)) {
            push.apply(self, makeArray(html));
            return self;
        }

        else {
            // node, document, window
            domNode = html;
        }

        self[0] = domNode;
        self.length = 1;
        return self;
    }

    NodeList.prototype = {

        constructor: NodeList,

        isNodeList: true,

        /**
         * length of nodelist
         * @type {Number}
         */
        length: 0,


        /**
         * Get one node at index
         * @param {Number} index Index position.
         * @return {KISSY.NodeList}
         */
        item: function (index) {
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
         * return a new NodeList object which consists of current node list and parameter node list.
         * @param {KISSY.NodeList} selector Selector string or html string or common dom node.
         * @param {KISSY.NodeList|Number} [context] Search context for selector
         * @param {Number} [index] Insert position.
         * @return {KISSY.NodeList} a new nodelist
         */
        add: function (selector, context, index) {
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
         * @return {KISSY.NodeList}
         */
        slice: function (start, end) {
            // ie<9 : [1,2].slice(-2,undefined) => []
            // ie<9 : [1,2].slice(-2) => [1,2]
            // fix #85
            return new NodeList(slice.apply(this, arguments));
        },

        /**
         * Retrieves the DOMNodes.
         */
        getDOMNodes: function () {
            return slice.call(this);
        },

        /**
         * Applies the given function to each Node in the NodeList.
         * @param {Function} fn The function to apply. It receives 3 arguments:
         * the current node instance, the node's index,
         * and the NodeList instance
         * @param [context] An optional context to
         * apply the function with Default context is the current NodeList instance
         * @return {KISSY.NodeList}
         */
        each: function (fn, context) {
            var self = this;

            S.each(self, function (n, i) {
                n = new NodeList(n);
                return fn.call(context || n, n, i, self);
            });

            return self;
        },
        /**
         * Retrieves the DOMNode.
         * @return {HTMLElement}
         */
        getDOMNode: function () {
            return this[0];
        },

        /**
         * return last stack node list.
         * @return {KISSY.NodeList}
         */
        end: function () {
            var self = this;
            return self.__parent || self;
        },

        /**
         * return new NodeList which contains only nodes which passes filter
         * @param {String|Function} filter
         * @return {KISSY.NodeList}
         */
        filter: function (filter) {
            return new NodeList(Dom.filter(this, filter));
        },

        /**
         * Get node list which are descendants of current node list.
         * @param {String} selector Selector string
         * @return {KISSY.NodeList}
         */
        all: function (selector) {
            var ret,
                self = this;
            if (self.length > 0) {
                ret = NodeList.all(selector, self);
            } else {
                ret = new NodeList();
            }
            ret.__parent = self;
            return ret;
        },

        /**
         * Get node list which match selector under current node list sub tree.
         * @param {String} selector
         * @return {KISSY.NodeList}
         */
        one: function (selector) {
            var self = this,
                all = self.all(selector),
                ret = all.length ? all.slice(0, 1) : null;
            if (ret) {
                ret.__parent = self;
            }
            return ret;
        }
    };

    S.mix(NodeList, {
        /**
         * Get node list from selector or construct new node list from html string.
         * Can also called from KISSY.all
         * @param {String|KISSY.NodeList} selector Selector string or html string or common dom node.
         * @param {String|KISSY.NodeList} [context] Search context for selector
         * @return {KISSY.NodeList}
         * @member KISSY.NodeList
         * @static
         */
        all: function (selector, context) {
            // are we dealing with html string ?
            // TextNode 仍需要自己 new Node
            if (typeof selector == 'string' &&
                (selector = S.trim(selector)) &&
                selector.length >= 3 &&
                S.startsWith(selector, '<') &&
                S.endsWith(selector, '>')) {
                if (context) {
                    if (context['getDOMNode']) {
                        context = context[0];
                    }
                    context = context['ownerDocument'] || context;
                }
                return new NodeList(selector, undefined, context);
            }
            return new NodeList(Dom.query(selector, context));
        },

        /**
         * Get node list with length of one
         * from selector or construct new node list from html string.
         * @param {String|KISSY.NodeList} selector Selector string or html string or common dom node.
         * @param {String|KISSY.NodeList} [context] Search context for selector
         * @return {KISSY.NodeList}
         * @member KISSY.NodeList
         * @static
         */
        one: function (selector, context) {
            var all = NodeList.all(selector, context);
            return all.length ? all.slice(0, 1) : null;
        }
    });

    /**
     * Same with {@link KISSY.DOM.NodeType}
     * @member KISSY.NodeList
     * @property NodeType
     * @static
     */
    NodeList.NodeType = NodeType;

    NodeList.KeyCode = Event.KeyCode;

    NodeList.Gesture = Event.Gesture;

    NodeList.REPLACE_HISTORY = Event.REPLACE_HISTORY;

    return NodeList;
}, {
    requires: ['dom', 'event/dom']
});


/*
 Notes:
 2011-05-25
 - yiminghe@gmail.com：参考 jquery，只有一个 NodeList 对象，Node 就是 NodeList 的别名

 2010.04
 - each 方法传给 fn 的 this, 在 jQuery 里指向原生对象，这样可以避免性能问题。
 但从用户角度讲，this 的第一直觉是 $(this), kissy 和 yui3 保持一致，牺牲
 性能，以易用为首。
 - 有了 each 方法，似乎不再需要 import 所有 dom 方法，意义不大。
 - dom 是低级 api, node 是中级 api, 这是分层的一个原因。还有一个原因是，如果
 直接在 node 里实现 dom 方法，则不大好将 dom 的方法耦合到 nodelist 里。可
 以说，技术成本会制约 api 设计。
 */
