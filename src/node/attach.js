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
