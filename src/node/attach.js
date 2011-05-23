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
