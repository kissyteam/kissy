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
 */