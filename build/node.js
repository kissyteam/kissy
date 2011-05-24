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
        } else if (val === null) {
            val = null;
        } else if (val.nodeType
            && !val.getDOMNode) {
            // 包装为 KISSY Node
            val = new Node(val);
        } else if (!val.getDOMNodes
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
            //里面不要修改 context ,fn,name 会影响所有 ....
            var el = this[0],args = S.makeArray(arguments);
            args = scrubNodes(args);
            args.unshift(el);
            var ctx = context || this;
            var ret = fn.apply(ctx, args);
            return normalize(ret, this);
        }
    };

    NodeList.addMethod = function(name, fn, context) {
        NLP[name] = function() {
            var ret = [],args = S.makeArray(arguments);
            args = scrubNodes(args);
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
    var excludes = [
        "_isElementNode",
        "_getWin",
        "_getComputedStyle",
        "_getComputedStyle",
        "_nodeTypeIs",
        "create",
        "get",
        "query"
    ];

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
 * 2011-05-24
 *  - 承玉：
 *  - 将 DOM 中的方法包装成 Node 方法
 *  - Node 方法调用参数中的 KISSY Node 要转换成 HTML Node
 *  - 要注意链式调用，如果 DOM 方法返回 undefined （无返回值），则 Node 对应方法返回 this
 *  - 实际上可以完全使用 Node 来代替 DOM，不和节点关联的方法如：viewportHeight 等，在 window，document 上调用
 *  - 存在 window/document 虚节点，通过 S.one(window)/new Node(window) ,S.one(document)/new Node(document) 获得
 */
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
/**
 * overrides methods in Node.prototype and build NodeList.prototype
 * @author : yiminghe@gmail.com
 */
KISSY.add("node/override", function(S, DOM, Event, Node) {

    var NodeList = Node.List,
        NP = Node.prototype;
    /**
     * Retrieves a node based on the given CSS selector.
     */
    Node.addMethod("one", function(domNode, selector) {
        return DOM.get(selector, domNode);
    });
    /**
     * Retrieves a nodeList based on the given CSS selector.
     */
    Node.addMethod("all", function(domNode, selector) {
        return DOM.query(selector, domNode);
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


    Node.addMethod("on", function(domNode, type, fn, scope) {
        var self = this;

        function wrap(ev) {
            var args = S.makeArray(arguments);
            // 防止 args 和 ev 不同步
            args.shift();
            ev.target = new Node(ev.target);
            if (ev.relatedTarget) {
                ev.relatedTarget = new Node(ev.relatedTarget);
            }
            args.unshift(ev);
            return fn.apply(scope || self, args);
        }

        Event.add(domNode, type, wrap, scope);
        tagFn(fn, wrap, domNode);
    });


    Node.addMethod("detach", function(domNode, type, fn, scope) {
        if (S.isFunction(fn)) {
            var wraps = fn.__wrap || [];
            for (var i = wraps.length - 1; i >= 0; i--) {
                var w = wraps[i];
                if (w.target == domNode) {
                    Event.remove(domNode, type, w.fn, scope);
                    wraps.splice(i, 1);
                }
            }
        } else {
            Event.remove(domNode, type, fn, scope);
        }
    });


    for (var k in NP) {
        var v = NP[k];
        if (NP.hasOwnProperty(k) && S.isFunction(v)) {
            NodeList.addMethod(k, v);
        }
    }


    /**
     * append(node ,parent) : 参数顺序反过来了
     * appendTo(parent,node) : 才是正常
     *
     */
    S.each(['append', 'prepend'], function(insertType) {
        // append 和 prepend

        Node.addMethod(insertType, function(domNode, html) {
            var newNode = html;
            // 创建
            if (S.isString(newNode)) {
                newNode = DOM.create(newNode);
            }
            DOM[insertType](newNode, domNode);
        });

        NodeList.addMethod(insertType, function(html) {
            // 每次调用 Node 单一方法前都 clone
            // html 创建 or Html Node clone
            var newNode = DOM.create(html);
            //再次调用 KISSY Node 的单一方法
            this[insertType](newNode);
        });
    });

}, {
        requires:["dom","event","./base","./attach"]
    });

/**
 * 2011-05-24
 * - 承玉：
 * - 重写 Node 的某些方法
 * - 添加 one ,all ，从当前 Node 往下开始选择节点
 * - 处理 append ,prepend 和 DOM 的参数实际上是反过来的
 * - 添加事件处理，注意 target 与 relatedTarget 现在都是 KISSY Node 类型
 * -将 Node 上的方法经过循环包装放在 NodeList 上
 * - append/prepend 参数是节点时，需要经过 clone，因为同一节点不可能被添加到多个节点中去（NodeList）
 */KISSY.add("node", function(S, Node) {
    return Node;
}, {
        requires:["node/base","node/attach","node/override"]
    });
