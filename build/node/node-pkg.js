/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: ${build.time}
*/
/**
 * import methods from DOM to NodeList.prototype
 * @author  yiminghe@gmail.com
 */
KISSY.add('node/attach', function(S, DOM, Event, NodeList, undefined) {

    var NLP = NodeList.prototype,
        isNodeList = DOM._isNodeList;

    function normalize(val, node, nodeList) {
        // 链式操作
        if (val === undefined) {
            val = node;
        } else if (val === null) {
            val = null;
        } else if (nodeList
            && (val.nodeType || isNodeList(val) || S.isArray(val))) {

//            if (val.nodeType) {
//                val = [val];
//            }
//            //返回结果和自己相同，不用新建
//            if (DOM.equals(val, node)) {
//                val = node;
//            } else {
//                val = new NodeList(val);
//            }

            // 包装为 KISSY NodeList
            val = new NodeList(val);
        }
        return val;
    }

    /**
     *
     * @param {string} name 方法名
     * @param {string} fn 实际方法
     * @param {object} context 方法执行上下文，不指定为 this
     * @param {boolean} nodeList 是否对返回对象 NodeList
     */
    NodeList.addMethod = function(name, fn, context, nodeList) {
        NLP[name] = function() {
            //里面不要修改 context ,fn,name 会影响所有 ....
            // NLP && NP
            var self = this,
                args = S.makeArray(arguments);
            args.unshift(self);
            var ctx = context || self;
            var ret = fn.apply(ctx, args);
            return  normalize(ret, self, nodeList);
        }
    };

    //不能添加到 NP 的方法
    var excludes = [
        "_isElementNode",
        "_getWin",
        "_getComputedStyle",
        "_isNodeList",
        "_nodeTypeIs",
        "_nl2frag",
        "create",
        "get",
        "query",
        "data"
    ];

    S.each(DOM, function(v, k) {
        if (DOM.hasOwnProperty(k)
            && S.isFunction(v)
            && !S.inArray(k, excludes)
            ) {
            NodeList.addMethod(k, v, DOM, true);
        }
    });

    NodeList.addMethod("data", DOM.data, DOM);

}, {
        requires:["dom","event","./base"]
    });

/**
 * 2011-05-24
 *  - 承玉：
 *  - 将 DOM 中的方法包装成 NodeList 方法
 *  - Node 方法调用参数中的 KISSY NodeList 要转换成第一个 HTML Node
 *  - 要注意链式调用，如果 DOM 方法返回 undefined （无返回值），则 NodeList 对应方法返回 this
 *  - 实际上可以完全使用 NodeList 来代替 DOM，不和节点关联的方法如：viewportHeight 等，在 window，document 上调用
 *  - 存在 window/document 虚节点，通过 S.one(window)/new Node(window) ,S.one(document)/new NodeList(document) 获得
 */
/**
 * definition for node and nodelist
 * @author: lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add("node/base", function(S, DOM, Event, undefined) {

    var AP = Array.prototype;

    var isNodeList = DOM._isNodeList;

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
                AP.push.apply(this, S.makeArray(domNode.childNodes));
                return undefined;
            }
        }


        else if (html instanceof NodeList) {
            // handle NodeList
            return html;
        }


        else if (S.isArray(html) || isNodeList(html)) {
            AP.push.apply(this, S.makeArray(html));
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

    S.augment(NodeList, Event.Target, {

            isCustomEventTarget:false,
            /**
             * 模拟事件触发，暂不实现
             */
            fire:null,
            /**
             * 默认长度为 0
             */
            length: 0,

            /**
             * 根据 index 或 DOMElement 获取对应的 KSNode
             */
            item: function(index) {
                if (S.isNumber(index)) {
                    if (index >= this.length) return null;
                    return new NodeList(this[index], undefined, undefined);
                } else
                    return new NodeList(index, undefined, undefined);
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

                for (node = new NodeList(self[0], undefined, undefined);
                     i < len && fn.call(context || node, node, i, this) !== false;
                     node = new NodeList(self[++i], undefined, undefined)) {
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
                    return NodeList.all(selector, this[0]);
                }
                return new NodeList(undefined, undefined, undefined);
            }
        });

    NodeList.prototype.one = function(selector) {
        var all = this.all(selector);
        return all.length ? all : null;
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
        return new NodeList(DOM.query(selector, context), undefined, undefined);
    };

    NodeList.one = function(selector, context) {
        var all = NodeList.all(selector, context);
        return all.length ? all : null;
    };

    NodeList.List = NodeList;

    return NodeList;
}, {
        requires:["dom","event"]
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
/**
 * overrides methods in NodeList.prototype
 * @author : yiminghe@gmail.com
 */
KISSY.add("node/override", function(S, DOM, Event, NodeList) {

    /**
     * append(node ,parent) : 参数顺序反过来了
     * appendTo(parent,node) : 才是正常
     *
     */
    S.each(['append', 'prepend'], function(insertType) {
        // append 和 prepend

        NodeList.addMethod(insertType, function(domNodes, html) {

            var newNode = html;
            // 创建
            if (S.isString(newNode)) {
                newNode = DOM.create(newNode);
            }
            DOM[insertType](newNode, domNodes);
            
        }, undefined, true);
    });

}, {
        requires:["dom","event","./base","./attach"]
    });

/**
 * 2011-05-24
 * - 承玉：
 * - 重写 NodeList 的某些方法
 * - 添加 one ,all ，从当前 NodeList 往下开始选择节点
 * - 处理 append ,prepend 和 DOM 的参数实际上是反过来的
 * - append/prepend 参数是节点时，如果当前 NodeList 数量 > 1 需要经过 clone，因为同一节点不可能被添加到多个节点中去（NodeList）
 */KISSY.add("node", function(S, Node) {
    return Node;
}, {
        requires:["node/base","node/attach","node/override"]
    });
