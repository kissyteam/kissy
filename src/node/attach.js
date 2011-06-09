/**
 * import methods from DOM to NodeList.prototype
 * @author  yiminghe@gmail.com
 */
KISSY.add('node/attach', function(S, DOM, Event, NodeList, undefined) {

    var NLP = NodeList.prototype,
        isNodeList = DOM._isNodeList,
        // DOM 添加到 NP 上的方法
        DOM_INCLUDES = [
            "equals",
            "contains",
            "scrollTop",
            "scrollLeft",
            "height",
            "width",
            "addStyleSheet",
            "append",
            "appendTo",
            "prepend",
            "prependTo",
            "insertBefore",
            "before",
            "after",
            "insertAfter",
            "filter",
            "test",
            "hasClass",
            "addClass",
            "removeClass",
            "replaceClass",
            "toggleClass",
            "removeAttr",
            "attr",
            "hasAttr",
            "prop",
            "hasProp",
            "val",
            "text",
            "css",
            "show",
            "hide",
            "toggle",
            "offset",
            "scrollIntoView",
            "parent",
            "closest",
            "next",
            "prev",
            "siblings",
            "children",
            "html",
            "remove",
            "removeData",
            "hasData",
            // 返回值不一定是 nodelist ，特殊处理
            // "data",
            "unselectable"
        ],
        // Event 添加到 NP 上的方法
        EVENT_INCLUDES = ["on","detach","fire"];


    function normalize(val, node, nodeList) {
        // 链式操作
        if (val === undefined) {
            val = node;
        } else if (val === null) {
            val = null;
        } else if (nodeList
            && (val.nodeType || isNodeList(val) || S.isArray(val))) {
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

    S.each(DOM_INCLUDES, function(k) {
        var v = DOM[k];
        NodeList.addMethod(k, v, DOM, true);
    });

    // data 不需要对返回结果转换 nodelist
    NodeList.addMethod("data", DOM.data, DOM);

    S.each(EVENT_INCLUDES, function(k) {
        NLP[k] = function() {
            var args = S.makeArray(arguments);
            args.unshift(this);
            return Event[k].apply(Event, args);
        }
    });

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
