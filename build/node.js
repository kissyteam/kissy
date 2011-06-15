/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: ${build.time}
*/
/**
 * @module  anim-node-plugin
 * @author  lifesinger@gmail.com, qiaohua@taobao.com
 */
KISSY.add('node/anim-plugin', function(S, DOM, Anim, N, undefined) {

    var NLP = N.prototype,
        ANIM_KEY = "ksAnims" + S.now(),
        DISPLAY = 'display',
        NONE = 'none',
        OVERFLOW = 'overflow',
        HIDDEN = 'hidden',
        OPCACITY = 'opacity',
        HEIGHT = 'height', WIDTH = 'width',
        FX = {
            show: [OVERFLOW, OPCACITY, HEIGHT, WIDTH],
            fade: [OPCACITY],
            slide: [OVERFLOW, HEIGHT]
        };

    (function(P) {

        function attachAnim(elem, anim) {
            var anims = DOM.data(elem, ANIM_KEY);
            if (!anims) {
                DOM.data(elem, ANIM_KEY, anims = []);
            }
            anim.on("complete", function() {
                var anims = DOM.data(elem, ANIM_KEY);
                if (anims) {
                    // 结束后从关联的动画队列中删除当前动画
                    var index = S.indexOf(anim, anims);
                    if (index >= 0) {
                        anims.splice(index, 1);
                    }
                    if (!anims.length) {
                        DOM.removeData(elem, ANIM_KEY);
                    }
                }
            });
            // 当前节点的所有动画队列
            anims.push(anim);
        }

        P.animate = function() {
            var self = this,
                args = S.makeArray(arguments);
            S.each(self, function(elem) {
                var anim = Anim.apply(undefined, [elem].concat(args)).run();
                attachAnim(elem, anim);
            });
            return this;
        };

        P.stop = function(finish) {
            S.each(this, function(elem) {
                var anims = DOM.data(elem, ANIM_KEY);
                if (anims) {
                    S.each(anims, function(anim) {
                        anim.stop(finish);
                    });
                    DOM.removeData(elem, ANIM_KEY);
                }
            });
        };

        S.each({
                show: ['show', 1],
                hide: ['show', 0],
                toggle: ['toggle'],
                fadeIn: ['fade', 1],
                fadeOut: ['fade', 0],
                slideDown: ['slide', 1],
                slideUp: ['slide', 0]
            },
            function(v, k) {

                P[k] = function(speed, callback, easing, nativeSupport) {
                    var self = this;

                    // 没有参数时，调用 DOM 中的对应方法
                    if (DOM[k] && arguments.length === 0) {
                        DOM[k](self);
                    }
                    else {
                        S.each(this, function(elem) {
                            var anim = fx(elem, v[0], speed, callback,
                                v[1], easing, nativeSupport);
                            attachAnim(elem, anim);
                        });
                    }
                    return self;
                };
            });
    })(NLP);

    function fx(elem, which, speed, callback, visible, easing, nativeSupport) {
        if (which === 'toggle') {
            visible = DOM.css(elem, DISPLAY) === NONE ? 1 : 0;
            which = 'show';
        }

        if (visible) {
            DOM.css(elem, DISPLAY, DOM.data(elem, DISPLAY) || '');
        }

        // 根据不同类型设置初始 css 属性, 并设置动画参数
        var originalStyle = {}, style = {};
        S.each(FX[which], function(prop) {
            if (prop === OVERFLOW) {
                originalStyle[OVERFLOW] = DOM.css(elem, OVERFLOW);
                DOM.css(elem, OVERFLOW, HIDDEN);
            }
            else if (prop === OPCACITY) {
                originalStyle[OPCACITY] = DOM.css(elem, OPCACITY);
                style.opacity = visible ? 1 : 0;
                if (visible) {
                    DOM.css(elem, OPCACITY, 0);
                }
            }
            else if (prop === HEIGHT) {
                originalStyle[HEIGHT] = DOM.css(elem, HEIGHT);
                //http://arunprasad.wordpress.com/2008/08/26/naturalwidth-and-naturalheight-for-image-element-in-internet-explorer/
                style.height = (visible ? DOM.css(elem, HEIGHT) || elem.naturalHeight : 0);

                if (visible) {
                    DOM.css(elem, HEIGHT, 0);
                }
            }
            else if (prop === WIDTH) {
                originalStyle[WIDTH] = DOM.css(elem, WIDTH);
                style.width = (visible ? DOM.css(elem, WIDTH) || elem.naturalWidth : 0);
                if (visible) {
                    DOM.css(elem, WIDTH, 0);
                }
            }
        });

        // 开始动画
        return new Anim(elem, style, speed, easing || 'easeOut', function() {
            // 如果是隐藏, 需要还原一些 css 属性
            if (!visible) {
                // 保留原有值
                var currStyle = elem.style, oldVal = currStyle[DISPLAY];
                if (oldVal !== NONE) {
                    if (oldVal) {
                        DOM.data(elem, DISPLAY, oldVal);
                    }
                    currStyle[DISPLAY] = NONE;
                }

                // 还原样式
                if (originalStyle[HEIGHT]) {
                    DOM.css(elem, { height: originalStyle[HEIGHT] });
                }
                if (originalStyle[WIDTH]) {
                    DOM.css(elem, { width: originalStyle[WIDTH] });
                }
                if (originalStyle[OPCACITY]) {
                    DOM.css(elem, { opacity: originalStyle[OPCACITY] });
                }
                if (originalStyle[OVERFLOW]) {
                    DOM.css(elem, { overflow: originalStyle[OVERFLOW] });
                }

            }

            if (callback && S.isFunction(callback)) {
                callback();
            }

        }, nativeSupport).run();
    }

}, {
        requires:["dom","anim","./base"]
    });
/**
 * 2011-05-17
 *  - 承玉：添加 stop ，随时停止动画
 */
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
            // anim override
//            "show",
//            "hide",
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
        EVENT_INCLUDES = ["on","detach","fire","delegate","undelegate"];


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
/**
 * definition for node and nodelist
 * @author: lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add("node/base", function(S, DOM, undefined) {

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

    S.augment(NodeList, {

            /**
             * 默认长度为 0
             */
            length: 0,


            item: function(index) {
                if (S.isNumber(index)) {
                    if (index >= this.length) return null;
                    return new NodeList(this[index], undefined, undefined);
                } else
                    return new NodeList(index, undefined, undefined);
            },

            add:function(selector, context, index) {
                if (S.isNumber(context)) {
                    index = context;
                    context = undefined;
                }
                var list = S.makeArray(NodeList.all(selector, context)),
                    ret = new NodeList(this, undefined, undefined);
                if (index === undefined) {
                    AP.push.apply(ret, list);
                } else {
                    var args = [index,0];
                    args.push.apply(args, list);
                    AP.splice.apply(ret, args);
                }
                return ret;
            },

            slice:function(start, end) {
                return new NodeList(AP.slice.call(this, start, end), undefined, undefined);
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
    if (1 > 2) {
        NodeList.getDOMNodes();
    }
    return NodeList;
}, {
        requires:["dom"]
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
    S.each(['append', 'prepend','before','after'], function(insertType) {
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
        requires:["node/base","node/attach","node/override","node/anim-plugin"]
    });
