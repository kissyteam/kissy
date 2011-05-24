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
