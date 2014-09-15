/**
 * @ignore
 * definition for node and nodelist
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 */

var util = require('util');
var Dom = require('dom');
var DomEvent = require('event-dom');
var AP = Array.prototype,
    slice = AP.slice,
    NodeType = Dom.NodeType,
    push = AP.push,
    makeArray = util.makeArray,
    isDomNodeList = Dom.isDomNodeList;

/**
 * The Node class provides a {@link KISSY.DOM} wrapper for manipulating Dom Node.
 * use KISSY.all/one to retrieve NodeList instances.
 *
 *
 *      @example
 *      KISSY.all('a').attr('href','http://docs.kissyui.com');
 *
 * @class KISSY.Node
 */
function Node(html, attrs, ownerDocument) {
    var self = this,
        domNode;

    if (html instanceof Node && arguments.length === 1) {
        return html.slice();
    }

    if (!(self instanceof Node)) {
        return Node.all.apply(Node, arguments);
    }

    // handle Node(''), Node(null), or Node(undefined)
    if (!html) {
        return self;
    } else if (typeof html === 'string') {
        // create from html
        domNode = Dom.create(html, attrs, ownerDocument);
        // ('<p>1</p><p>2</p>') 转换为 Node
        if (domNode.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE) { // fragment
            push.apply(this, makeArray(domNode.childNodes));
            return self;
        }
    } else if (util.isArray(html) || isDomNodeList(html)) {
        push.apply(self, makeArray(html));
        return self;
    } else {
        // node, document, window
        domNode = html;
    }

    self[0] = domNode;
    self.length = 1;
    return self;
}

Node.prototype = {
    constructor: Node,

    isNode: true,

    /**
     * length of Node
     * @type {Number}
     */
    length: 0,

    /**
     * Get one node at index
     * @param {Number} index Index position.
     * @return {KISSY.Node}
     */
    item: function (index) {
        var self = this;
        index = parseInt(index, 10);
        return typeof index === 'number' && !isNaN(index) && index < self.length ? new Node(self[index]) : null;
    },

    /**
     * return a new Node object which consists of current node list and parameter node list.
     * @param {KISSY.Node} selector Selector string or html string or common dom node.
     * @param {KISSY.Node|Number} [context] Search context for selector
     * @param {Number} [index] Insert position.
     * @return {KISSY.Node} a new Node
     */
    add: function (selector, context, index) {
        if (typeof context === 'number') {
            index = context;
            context = undefined;
        }
        var list = Node.all(selector, context).getDOMNodes(),
            ret = new Node(this);
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
     * Arguments are same with Array.prototype.slice
     * @return {KISSY.Node}
     */
    slice: function () {
        // ie<9 : [1,2].slice(0 - 2,undefined) => []
        // ie<9 : [1,2].slice(0 - 2) => [1,2]
        // fix #85
        return new Node(slice.apply(this, arguments));
    },

    /**
     * Retrieves the DOMNodes.
     */
    getDOMNodes: function () {
        return slice.call(this);
    },

    /**
     * Applies the given function to each Node in the Node.
     * @param {Function} fn The function to apply. It receives 3 arguments:
     * the current node instance, the node's index,
     * and the Node instance
     * @param [context] An optional context to
     * apply the function with Default context is the current Node instance
     * @return {KISSY.Node}
     */
    each: function (fn, context) {
        var self = this;

        util.each(self, function (n, i) {
            n = new Node(n);
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
     * @return {KISSY.Node}
     */
    end: function () {
        var self = this;
        return self.__parent || self;
    },

    /**
     * return new Node which contains only nodes which passes filter
     * @param {String|Function} filter
     * @return {KISSY.Node}
     */
    filter: function (filter) {
        return new Node(Dom.filter(this, filter));
    },

    /**
     * Get node list which are descendants of current node list.
     * @param {String} selector Selector string
     * @return {KISSY.Node}
     */
    all: function (selector) {
        var ret,
            self = this;
        if (self.length > 0) {
            ret = Node.all(selector, self);
        } else {
            ret = new Node();
        }
        ret.__parent = self;
        return ret;
    },

    /**
     * Get node list which match selector under current node list sub tree.
     * @param {String} selector
     * @return {KISSY.Node}
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

util.mix(Node, {
    /**
     * Get node list from selector or construct new node list from html string.
     * Can also called from KISSY.all
     * @param {String|KISSY.Node} selector Selector string or html string or common dom node.
     * @param {String|KISSY.Node} [context] Search context for selector
     * @return {KISSY.Node}
     * @member KISSY.Node
     * @static
     */
    all: function (selector, context) {
        // are we dealing with html string ?
        // TextNode 仍需要自己 new Node
        if (typeof selector === 'string' &&
            (selector = util.trim(selector)) &&
            selector.length >= 3 &&
            util.startsWith(selector, '<') &&
            util.endsWith(selector, '>')) {
            var attrs;
            if (context) {
                if (context.getDOMNode) {
                    context = context[0];
                }
                if (!context.nodeType) {
                    attrs = context;
                    context = arguments[2];
                }
            }
            return new Node(selector, attrs, context);
        }
        return new Node(Dom.query(selector, context));
    },

    /**
     * Get node list with length of one
     * from selector or construct new node list from html string.
     * @param {String|KISSY.Node} selector Selector string or html string or common dom node.
     * @param {String|KISSY.Node} [context] Search context for selector
     * @return {KISSY.Node}
     * @member KISSY.Node
     * @static
     */
    one: function (selector, context) {
        var all = Node.all(selector, context);
        return all.length ? all.slice(0, 1) : null;
    }
});

Node.Event = DomEvent;

Node.Dom = Dom;

module.exports = Node;

/*
 Notes:
 2011-05-25
 - yiminghe@gmail.com：参考 jquery，只有一个 Node 对象

 2010.04
 - each 方法传给 fn 的 this, 在 jQuery 里指向原生对象，这样可以避免性能问题。
 但从用户角度讲，this 的第一直觉是 $(this), kissy 和 yui3 保持一致，牺牲
 性能，以易用为首。
 - 有了 each 方法，似乎不再需要 import 所有 dom 方法，意义不大。
 - dom 是低级 api, node 是中级 api, 这是分层的一个原因。还有一个原因是，如果
 直接在 node 里实现 dom 方法，则不大好将 dom 的方法耦合到 Node 里。可
 以说，技术成本会制约 api 设计。
 */
