/**
 * overrides methods in Node.prototype and build NodeList.prototype
 * @author : yiminghe@gmail.com
 */
KISSY.add("node/override", function(S, DOM, Node) {

    var NodeList = Node.List,
        NLP = NodeList.prototype,
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

    S.each([NP,NLP], function(P, isNodeList) {
        /**
         * append(node ,parent) : 参数顺序反过来了
         * appendTo(parent,node) : 才是正常
         *
         */
        S.each(['append', 'prepend'], function(insertType) {
            // append 和 prepend
            P[insertType] = function(html) {
                S.each(this, function(self) {
                    var domNode;
                    /**
                     * 如果是nodelist 并且新加项是已构建的节点，则需要 clone
                     */
                    if (isNodeList || S.isString(html)) {
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
                    DOM[insertType](domNode, self[0]);
                });

            };
        });
    });

}, {
        requires:["dom","./base","./attach"]
    });