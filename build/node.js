/*
Copyright 2011, KISSY UI Library v1.1.7dev
MIT Licensed
build time: ${build.time}
*/
/**
 * @module  node-attach
 * @author  lifesinger@gmail.com
 */
KISSY.add('node/attach', function(S, DOM, Event, Node, NodeList, undefined) {

    var nodeTypeIs = DOM._nodeTypeIs,
        isKSNode = DOM._isKSNode,
        EventTarget = S.require("event/target"),
        NP = Node.prototype,
        NLP = NodeList.prototype,
        GET_DOM_NODE = 'getDOMNode',
        GET_DOM_NODES = GET_DOM_NODE + 's',
        HAS_NAME = 1,
        ONLY_VAL = 2,
        ALWAYS_NODE = 4;

    function normalGetterSetter(isNodeList, args, valIndex, fn) {
        var elems = this[isNodeList ? GET_DOM_NODES : GET_DOM_NODE](),
            args2 = [elems].concat(S.makeArray(args));

        if (args[valIndex] === undefined) {
            return fn.apply(DOM, args2);
        } else {
            fn.apply(DOM, args2);
            return this;
        }
    }

    function attach(methodNames, type) {
        S.each(methodNames, function(methodName) {
            S.each([NP, NLP], function(P, isNodeList) {

                P[methodName] = (function(fn) {
                    switch (type) {
                        // fn(name, value, /* other arguments */): attr, css etc.
                        case HAS_NAME:
                            return function() {
                                return normalGetterSetter.call(this, isNodeList, arguments, 1, fn);
                            };

                        // fn(value, /* other arguments */): text, html, val etc.
                        case ONLY_VAL:
                            return function() {
                                return normalGetterSetter.call(this, isNodeList, arguments, 0, fn);
                            };

                        // parent, next 等返回 Node/NodeList 的方法
                        case ALWAYS_NODE:
                            return function() {
                                var elems = this[isNodeList ? GET_DOM_NODES : GET_DOM_NODE](),
                                    ret = fn.apply(DOM, [elems].concat(S.makeArray(arguments)));
                                return ret ? new (S.isArray(ret) ? NodeList : Node)(ret) : null;
                            };

                        default:
                            return function() {
                                // 有非 undefined 返回值时，直接 return 返回值；没返回值时，return this, 以支持链式调用。
                                var elems = this[isNodeList ? GET_DOM_NODES : GET_DOM_NODE](),
                                    ret = fn.apply(DOM, [elems].concat(S.makeArray(arguments)));
                                return ret === undefined ? this : ret;
                            };
                    }
                })(DOM[methodName]);
            });
        });
    }

    // selector
    S.mix(NP, {
        /**
         * Retrieves a node based on the given CSS selector.
         */
        one: function(selector) {
            return Node.one(selector, this[0]);
        },

        /**
         * Retrieves a nodeList based on the given CSS selector.
         */
        all: function(selector) {
            return NodeList.all(selector, this[0]);
        }
    });

    // dom-data
    attach(['data', 'removeData'], HAS_NAME);

    // dom-class
    attach(['hasClass', 'addClass', 'removeClass', 'replaceClass', 'toggleClass'], undefined);

    // dom-attr
    attach(['attr', 'removeAttr'], HAS_NAME);
    attach(['val', 'text'], ONLY_VAL);

    // dom-style
    attach(['css'], HAS_NAME);
    attach(['width', 'height'], ONLY_VAL);

    // dom-offset
    attach(['offset'], ONLY_VAL);
    attach(['scrollIntoView'], undefined);

    // dom-traversal
    attach(['parent', 'next', 'prev', 'siblings', 'children'], ALWAYS_NODE);
    attach(['contains'], undefined);

    // dom-create
    attach(['html'], ONLY_VAL);
    attach(['remove'], undefined);

    // dom-insertion
    S.each(['insertBefore', 'insertAfter'], function(methodName) {
        // 目前只给 Node 添加，不考虑 NodeList（含义太复杂）
        NP[methodName] = function(refNode) {
            DOM[methodName].call(DOM, this[0], refNode);
            return this;
        };
    });
    S.each([NP, NLP], function(P, isNodeList) {
        S.each(['append', 'prepend'], function(insertType) {
            // append 和 prepend
            P[insertType] = function(html) {
                return insert.call(this, html, isNodeList, insertType);
            };
            // appendTo 和 prependTo
            P[insertType + 'To'] = function(parent) {
                return insertTo.call(this, parent, insertType);
            };
        });
    });

    function insert(html, isNodeList, insertType) {
        if (html) {
            S.each(this, function(elem) {
                var domNode;

                // 对于 NodeList, 需要 cloneNode, 因此直接调用 create
                if (isNodeList || S['isString'](html)) {
                    domNode = DOM.create(html);
                } else {
                    if (nodeTypeIs(html, 1) || nodeTypeIs(html, 3)) domNode = html;
                    if (isKSNode(html)) domNode = html[0];
                }

                DOM[insertType](domNode, elem);
            });
        }
        return this;
    }

    function insertTo(parent, insertType) {
        if ((parent = DOM.get(parent)) && parent.appendChild) {
            S.each(this, function(elem) {
                DOM[insertType](elem, parent);
            });
        }
        return this;
    }

    // event-target
    function tagFn(fn, wrap) {
        fn.__wrap = fn.__wrap || [];
        fn.__wrap.push(wrap);
    }

    S.augment(Node, EventTarget, {
        fire:null,
        on:function(type, fn, scope) {
            var self = this;

            function wrap(ev) {
                var args = S.makeArray(arguments);
                args.shift();
                ev.target = new Node(ev.target);
                if (ev.relatedTarget) {
                    ev.relatedTarget = new Node(ev.relatedTarget);
                }
                args.unshift(ev);
                return fn.apply(scope || self, args);
            }

            Event.add(this[0], type, wrap, scope);
            tagFn(fn, wrap);
            return this;
        },
        detach:function(type, fn, scope) {
            if (S.isFunction(fn)) {
                var wraps = fn.__wrap || [];
                for (var i = 0; i < wraps.length; i++) {
                    Event.remove(this[0], type, wraps[i], scope);
                }
            } else {
                Event.remove(this[0], type, fn, scope);
            }
            return this; // chain
        }
    });
    S.augment(NodeList, EventTarget, {fire:null});
    NP._supportSpecialEvent = true;

    S.each({
        on:"add",
        detach:"remove"
    }, function(v, k) {
        NLP[k] = function(type, fn, scope) {
            for (var i = 0; i < this.length; i++) {
                this.item(i).on(type, fn, scope);
            }
        };
    });

}, {
    requires:["dom","event","node/node","node/nodelist"]
});
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
        if (S['isString'](html)) {
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
/**
 * @module  nodelist
 * @author  lifesinger@gmail.com
 */
KISSY.add('node/nodelist', function(S, DOM,Node,undefined) {

    var AP = Array.prototype,
        isElementNode = DOM._isElementNode;

    /**
     * The NodeList class provides a wrapper for manipulating DOM NodeList.
     */
    function NodeList(domNodes) {
        // factory or constructor
        if (!(this instanceof NodeList)) {
            return new NodeList(domNodes);
        }

        // push nodes
        AP.push.apply(this, S.makeArray(domNodes) || []);
        return undefined;
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
            var ret = null, i, len;

            // 找到 DOMElement 对应的 index
            if (isElementNode(index)) {
                for (i = 0,len = this.length; i < len; i++) {
                    if (index === this[i]) {
                        index = i;
                        break;
                    }
                }
            }

            // 转换为 KSNode
            if (isElementNode(this[index])) {
                ret = new Node(this[index]);
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
            var len = this.length, i = 0, node;

            for (node = new Node(this[0]);
                 i < len && fn.call(context || node, node, i, this) !== false; node = new Node(this[++i])) {
            }

            return this;
        }
    });

    // query api
    NodeList.all = function(selector, context) {
        return new NodeList(DOM.query(selector, context, true));
    };

    return  NodeList;
}, {
    requires:["dom","node/node"]
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
KISSY.add("node", function(S, Node, NodeList) {
    return {
        Node:Node,
        NodeList:NodeList
    };
}, {
    requires:["node/node","node/nodelist","node/attach"]
});
