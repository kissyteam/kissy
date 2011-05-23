/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: ${build.time}
*/
/**
 * import methods from DOM to Node.prototype
 * @author  yiminghe@gmail.com
 */
KISSY.add('node/attach', function(S, DOM, Event, Node, undefined) {

    var NodeList = Node.List,
        NP = Node.prototype,
        NLP = NodeList.prototype;

    function normalize(val, node) {

        // 链式操作
        if (val === undefined) {
            val = node;
        } else if (val.nodeType
            && !val.getDOMNode) {
            // 包装为 KISSY Node
            val = new Node(val);
        } else if (val === null) {
            val = null;
        } else if (val.item
            && val[0]
            && val[0].nodeType
            && !val[0].getDOMNode) {
            // 包装为 KISSY NodeList
            val = new NodeList(val);
        }
        return val;
    }

    function scrubNodes(args) {
        for (var i = 0; i < args.length; i++) {
            if (args[i].getDOMNode) {
                args[i] = args[i].getDOMNode();
            }
        }
        return args;
    }

    Node.addMethod = function(name, fn, context) {
        NP[name] = function() {
            var el = this[0],args = S.makeArray(arguments);
            args = scrubNodes(args);
            args.unshift(el);
            var ret = fn.apply(context, args);
            return normalize(ret,this);
        }
    };

    NodeList.addMethod = function(name, fn, context) {
        NLP[name] = function() {
            var ret = [],args = S.makeArray(arguments);
            this.each(function(n) {
                var ctx = context || n;
                var r = fn.apply(ctx, args);
                if (r !== n) {
                    ret.push(r);
                }
            });
            return ret.length ? ret : this;
        };
    };

    //不能添加到 NP 的方法
    var excludes = ["_isElementNode",
        "_getWin",
        "_getComputedStyle",
        "_getComputedStyle",
        "_nodeTypeIs",
        "create",
        "get",
        "query"];

    S.each(DOM, function(v, k) {
        if (DOM.hasOwnProperty(k)
            && S.isFunction(v)
            && !S.inArray(k, excludes)
            ) {
            Node.addMethod(k, v, DOM);
        }
    });

}, {
        requires:["dom","event","./base"]
    });
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
/**
 * overrides methods in Node.prototype and build NodeList.prototype
 * @author : yiminghe@gmail.com
 */
KISSY.add("node/override", function(S, DOM, Node) {

    var NodeList = Node.List,
        NP = Node.prototype;

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


    /**
     * append(node ,parent) : 参数顺序反过来了
     * appendTo(parent,node) : 才是正常
     *
     */
    S.each(['append', 'prepend'], function(insertType) {
        // append 和 prepend
        NP[insertType] = function(html) {
            var domNode;
            if (S.isString(html)) {
                domNode = DOM.create(html);
            } else {
                var nt = html.nodeType;
                if (nt == 1 || nt == 3) {
                    domNode = html;
                }
                else if (html.getDOMNode) {
                    domNode = html[0];
                }
            }
            DOM[insertType](domNode, this[0]);
        };
    });


    // 一个函数被多个节点注册
    function tagFn(fn, wrap, target) {
        fn.__wrap = fn.__wrap || [];
        fn.__wrap.push({
                // 函数
                fn:wrap,
                // 关联节点
                target:target
            });
    }

    S.mix(NP, {
            fire:null,
            on:function(type, fn, scope) {
                var self = this,el = self[0];

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

                Event.add(el, type, wrap, scope);
                tagFn(fn, wrap, el);
                return self;
            },
            detach:function(type, fn, scope) {
                var self = this,el = self[0];
                if (S.isFunction(fn)) {
                    var wraps = fn.__wrap || [];
                    for (var i = wraps.length - 1; i >= 0; i--) {
                        var w = wraps[i];
                        if (w.target == el) {
                            Event.remove(el, type, w.fn, scope);
                            wraps.splice(i, 1);
                        }
                    }
                } else {
                    Event.remove(this[0], type, fn, scope);
                }
                return self; // chain
            }
        });


    S.each(NP, function(v, k) {
        NodeList.addMethod(k, v);
    });
}, {
        requires:["dom","./base","./attach"]
    });KISSY.add("node", function(S, Node) {
    return Node;
}, {
        requires:["node/base","node/attach","node/override"]
    });
