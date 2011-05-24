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
