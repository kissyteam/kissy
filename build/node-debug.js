/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 14:04
*/
/*
combined modules:
node
node/base
node/attach
node/override
node/anim
*/
KISSY.add('node', [
    'node/base',
    'node/attach',
    'node/override',
    'node/anim'
], function (S, require, exports, module) {
    /**
 * @ignore
 * node
 * @author yiminghe@gmail.com
 */
    module.exports = require('node/base');
    require('node/attach');
    require('node/override');
    require('node/anim');
});
KISSY.add('node/base', [
    'util',
    'dom',
    'event/dom'
], function (S, require, exports, module) {
    /**
 * @ignore
 * definition for node and nodelist
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 */
    var util = require('util');
    var Dom = require('dom');
    var Event = require('event/dom');
    var AP = Array.prototype, slice = AP.slice, NodeType = Dom.NodeType, push = AP.push, makeArray = util.makeArray, isDomNodeList = Dom.isDomNodeList;    /**
 * The Node class provides a {@link KISSY.DOM} wrapper for manipulating Dom Node.
 * use KISSY.all/one to retrieve NodeList instances.
 *
 *
 *      @example
 *      KISSY.all('a').attr('href','http://docs.kissyui.com');
 *
 * @class KISSY.Node
 */
    /**
 * The Node class provides a {@link KISSY.DOM} wrapper for manipulating Dom Node.
 * use KISSY.all/one to retrieve NodeList instances.
 *
 *
 *      @example
 *      KISSY.all('a').attr('href','http://docs.kissyui.com');
 *
 * @class KISSY.Node
 */
    function Node(html, attrs, ownerDocument) {
        var self = this, domNode;
        if (html instanceof Node && arguments.length === 1) {
            return html.slice();
        }
        if (!(self instanceof Node)) {
            return Node.all.apply(Node, arguments);
        }    // handle Node(''), Node(null), or Node(undefined)
        // handle Node(''), Node(null), or Node(undefined)
        if (!html) {
            return self;
        } else if (typeof html === 'string') {
            // create from html
            domNode = Dom.create(html, attrs, ownerDocument);    // ('<p>1</p><p>2</p>') 转换为 Node
            // ('<p>1</p><p>2</p>') 转换为 Node
            if (domNode.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE) {
                // fragment
                push.apply(this, makeArray(domNode.childNodes));
                return self;
            }
        } else if (util.isArray(html) || isDomNodeList(html)) {
            push.apply(self, makeArray(html));
            return self;
        } else {
            // node, document, window
            domNode = html;
        }
        self[0] = domNode;
        self.length = 1;
        return self;
    }
    Node.prototype = {
        constructor: Node,
        isNode: true,
        /**
     * length of Node
     * @type {Number}
     */
        length: 0,
        /**
     * Get one node at index
     * @param {Number} index Index position.
     * @return {KISSY.Node}
     */
        item: function (index) {
            var self = this;
            index = parseInt(index, 10);
            return typeof index === 'number' && !isNaN(index) && index < self.length ? new Node(self[index]) : null;
        },
        /**
     * return a new Node object which consists of current node list and parameter node list.
     * @param {KISSY.Node} selector Selector string or html string or common dom node.
     * @param {KISSY.Node|Number} [context] Search context for selector
     * @param {Number} [index] Insert position.
     * @return {KISSY.Node} a new Node
     */
        add: function (selector, context, index) {
            if (typeof context === 'number') {
                index = context;
                context = undefined;
            }
            var list = Node.all(selector, context).getDOMNodes(), ret = new Node(this);
            if (index === undefined) {
                push.apply(ret, list);
            } else {
                var args = [
                        index,
                        0
                    ];
                args.push.apply(args, list);
                AP.splice.apply(ret, args);
            }
            return ret;
        },
        /**
     * Get part of node list.
     * Arguments are same with Array.prototype.slice
     * @return {KISSY.Node}
     */
        slice: function () {
            // ie<9 : [1,2].slice(0 - 2,undefined) => []
            // ie<9 : [1,2].slice(0 - 2) => [1,2]
            // fix #85
            return new Node(slice.apply(this, arguments));
        },
        /**
     * Retrieves the DOMNodes.
     */
        getDOMNodes: function () {
            return slice.call(this);
        },
        /**
     * Applies the given function to each Node in the Node.
     * @param {Function} fn The function to apply. It receives 3 arguments:
     * the current node instance, the node's index,
     * and the Node instance
     * @param [context] An optional context to
     * apply the function with Default context is the current Node instance
     * @return {KISSY.Node}
     */
        each: function (fn, context) {
            var self = this;
            util.each(self, function (n, i) {
                n = new Node(n);
                return fn.call(context || n, n, i, self);
            });
            return self;
        },
        /**
     * Retrieves the DOMNode.
     * @return {HTMLElement}
     */
        getDOMNode: function () {
            return this[0];
        },
        /**
     * return last stack node list.
     * @return {KISSY.Node}
     */
        end: function () {
            var self = this;
            return self.__parent || self;
        },
        /**
     * return new Node which contains only nodes which passes filter
     * @param {String|Function} filter
     * @return {KISSY.Node}
     */
        filter: function (filter) {
            return new Node(Dom.filter(this, filter));
        },
        /**
     * Get node list which are descendants of current node list.
     * @param {String} selector Selector string
     * @return {KISSY.Node}
     */
        all: function (selector) {
            var ret, self = this;
            if (self.length > 0) {
                ret = Node.all(selector, self);
            } else {
                ret = new Node();
            }
            ret.__parent = self;
            return ret;
        },
        /**
     * Get node list which match selector under current node list sub tree.
     * @param {String} selector
     * @return {KISSY.Node}
     */
        one: function (selector) {
            var self = this, all = self.all(selector), ret = all.length ? all.slice(0, 1) : null;
            if (ret) {
                ret.__parent = self;
            }
            return ret;
        }
    };
    util.mix(Node, {
        /**
     * Get node list from selector or construct new node list from html string.
     * Can also called from KISSY.all
     * @param {String|KISSY.Node} selector Selector string or html string or common dom node.
     * @param {String|KISSY.Node} [context] Search context for selector
     * @return {KISSY.Node}
     * @member KISSY.Node
     * @static
     */
        all: function (selector, context) {
            // are we dealing with html string ?
            // TextNode 仍需要自己 new Node
            if (typeof selector === 'string' && (selector = util.trim(selector)) && selector.length >= 3 && util.startsWith(selector, '<') && util.endsWith(selector, '>')) {
                var attrs;
                if (context) {
                    if (context.getDOMNode) {
                        context = context[0];
                    }
                    if (!context.nodeType) {
                        attrs = context;
                        context = arguments[2];
                    }
                }
                return new Node(selector, attrs, context);
            }
            return new Node(Dom.query(selector, context));
        },
        /**
     * Get node list with length of one
     * from selector or construct new node list from html string.
     * @param {String|KISSY.Node} selector Selector string or html string or common dom node.
     * @param {String|KISSY.Node} [context] Search context for selector
     * @return {KISSY.Node}
     * @member KISSY.Node
     * @static
     */
        one: function (selector, context) {
            var all = Node.all(selector, context);
            return all.length ? all.slice(0, 1) : null;
        }
    });
    Node.Event = Event;
    Node.Dom = Dom;
    module.exports = Node;    /*
 Notes:
 2011-05-25
 - yiminghe@gmail.com：参考 jquery，只有一个 Node 对象

 2010.04
 - each 方法传给 fn 的 this, 在 jQuery 里指向原生对象，这样可以避免性能问题。
 但从用户角度讲，this 的第一直觉是 $(this), kissy 和 yui3 保持一致，牺牲
 性能，以易用为首。
 - 有了 each 方法，似乎不再需要 import 所有 dom 方法，意义不大。
 - dom 是低级 api, node 是中级 api, 这是分层的一个原因。还有一个原因是，如果
 直接在 node 里实现 dom 方法，则不大好将 dom 的方法耦合到 Node 里。可
 以说，技术成本会制约 api 设计。
 */
});



KISSY.add('node/attach', [
    'util',
    'dom',
    'event/dom',
    './base'
], function (S, require, exports, module) {
    /**
 * @ignore
 * import methods from Dom to Node.prototype
 * @author yiminghe@gmail.com
 */
    var util = require('util');
    var Dom = require('dom');
    var Event = require('event/dom');    /*global Node:true*/
    /*global Node:true*/
    var Node = require('./base');
    var NLP = Node.prototype, makeArray = util.makeArray,
        // Dom 添加到 NP 上的方法
        // if Dom methods return undefined , Node methods need to transform result to itself
        DOM_INCLUDES_NORM = [
            'nodeName',
            'isCustomDomain',
            'getEmptyIframeSrc',
            'equals',
            'contains',
            'index',
            'scrollTop',
            'scrollLeft',
            'height',
            'width',
            'innerHeight',
            'innerWidth',
            'outerHeight',
            'outerWidth',
            'addStyleSheet',
            // 'append' will be overridden
            'appendTo',
            // 'prepend' will be overridden
            'prependTo',
            'insertBefore',
            'before',
            'after',
            'insertAfter',
            'test',
            'hasClass',
            'addClass',
            'removeClass',
            'replaceClass',
            'toggleClass',
            'removeAttr',
            'hasAttr',
            'hasProp',
            // anim override
            //            'show',
            //            'hide',
            //            'toggle',
            'scrollIntoView',
            'remove',
            'empty',
            'removeData',
            'hasData',
            'unselectable',
            'wrap',
            'wrapAll',
            'replaceWith',
            'wrapInner',
            'unwrap'
        ],
        // if return array ,need transform to nodelist
        DOM_INCLUDES_NORM_NODE_LIST = [
            'getWindow',
            'getDocument',
            'filter',
            'first',
            'last',
            'parent',
            'closest',
            'next',
            'prev',
            'clone',
            'siblings',
            'contents',
            'children'
        ],
        // if set return this else if get return true value ,no nodelist transform
        DOM_INCLUDES_NORM_IF = {
            // dom method : set parameter index
            attr: 1,
            text: 0,
            css: 1,
            style: 1,
            val: 0,
            prop: 1,
            offset: 0,
            html: 0,
            outerHTML: 0,
            outerHtml: 0,
            data: 1
        },
        // Event 添加到 NP 上的方法
        EVENT_INCLUDES_SELF = [
            'on',
            'detach',
            'delegate',
            'undelegate'
        ], EVENT_INCLUDES_RET = [
            'fire',
            'fireHandler'
        ];
    Node.KeyCode = Event.KeyCode;
    function accessNorm(fn, self, args) {
        args.unshift(self);
        var ret = Dom[fn].apply(Dom, args);
        if (ret === undefined) {
            return self;
        }
        return ret;
    }
    function accessNormList(fn, self, args) {
        args.unshift(self);
        var ret = Dom[fn].apply(Dom, args);
        if (ret === undefined) {
            return self;
        } else if (ret === null) {
            return null;
        }
        return new Node(ret);
    }
    function accessNormIf(fn, self, index, args) {
        // get
        if (args[index] === undefined && !util.isObject(args[0])) {
            args.unshift(self);
            return Dom[fn].apply(Dom, args);
        }    // set
        // set
        return accessNorm(fn, self, args);
    }
    util.each(DOM_INCLUDES_NORM, function (k) {
        NLP[k] = function () {
            var args = makeArray(arguments);
            return accessNorm(k, this, args);
        };
    });
    util.each(DOM_INCLUDES_NORM_NODE_LIST, function (k) {
        NLP[k] = function () {
            var args = makeArray(arguments);
            return accessNormList(k, this, args);
        };
    });
    util.each(DOM_INCLUDES_NORM_IF, function (index, k) {
        NLP[k] = function () {
            var args = makeArray(arguments);
            return accessNormIf(k, this, index, args);
        };
    });
    util.each(EVENT_INCLUDES_SELF, function (k) {
        NLP[k] = function () {
            var self = this, args = makeArray(arguments);
            args.unshift(self);
            Event[k].apply(Event, args);
            return self;
        };
    });
    util.each(EVENT_INCLUDES_RET, function (k) {
        NLP[k] = function () {
            var self = this, args = makeArray(arguments);
            args.unshift(self);
            return Event[k].apply(Event, args);
        };
    });    /*
 2011-05-24
 - yiminghe@gmail.com：
 - 将 Dom 中的方法包装成 Node 方法
 - Node 方法调用参数中的 KISSY Node 要转换成第一个 HTML Node
 - 要注意链式调用，如果 Dom 方法返回 undefined （无返回值），则 Node 对应方法返回 this
 - 实际上可以完全使用 Node 来代替 Dom，不和节点关联的方法如：viewportHeight 等，在 window，document 上调用
 - 存在 window/document 虚节点，通过 $(window), $(document) 获得
 */
});
KISSY.add('node/override', [
    'util',
    'dom',
    './base',
    './attach'
], function (S, require, exports, module) {
    /**
 * @ignore
 * overrides methods in Node.prototype
 * @author yiminghe@gmail.com
 */
    var util = require('util');
    var Dom = require('dom');    /*global Node:true*/
    /*global Node:true*/
    var Node = require('./base');
    require('./attach');
    var NLP = Node.prototype;    /**
 * Insert every element in the set of newNodes to the end of every element in the set of current node list.
 * @param {KISSY.Node} newNodes Nodes to be inserted
 * @return {KISSY.Node} this
 * @method append
 * @member KISSY.Node
 */
                                 /**
 * Insert every element in the set of newNodes to the beginning of every element in the set of current node list.
 * @param {KISSY.Node} newNodes Nodes to be inserted
 * @return {KISSY.Node} this
 * @method prepend
 * @member KISSY.Node
 */
                                 // append(node ,parent): reverse param order
                                 // appendTo(parent,node): normal
    /**
 * Insert every element in the set of newNodes to the end of every element in the set of current node list.
 * @param {KISSY.Node} newNodes Nodes to be inserted
 * @return {KISSY.Node} this
 * @method append
 * @member KISSY.Node
 */
    /**
 * Insert every element in the set of newNodes to the beginning of every element in the set of current node list.
 * @param {KISSY.Node} newNodes Nodes to be inserted
 * @return {KISSY.Node} this
 * @method prepend
 * @member KISSY.Node
 */
    // append(node ,parent): reverse param order
    // appendTo(parent,node): normal
    util.each([
        'append',
        'prepend',
        'before',
        'after'
    ], function (insertType) {
        NLP[insertType] = function (html) {
            var newNode = html, self = this;    // create
            // create
            if (typeof newNode !== 'object') {
                newNode = Dom.create(newNode + '');
            }
            if (newNode) {
                Dom[insertType](newNode, self);
            }
            return self;
        };
    });
    util.each([
        'wrap',
        'wrapAll',
        'replaceWith',
        'wrapInner'
    ], function (fixType) {
        var orig = NLP[fixType];
        NLP[fixType] = function (others) {
            var self = this;
            if (typeof others === 'string') {
                others = Node.all(others, self[0].ownerDocument);
            }
            return orig.call(self, others);
        };
    });    /*
 2011-04-05 yiminghe@gmail.com
 - 增加 wrap/wrapAll/replaceWith/wrapInner/unwrap/contents

 2011-05-24
 - yiminghe@gmail.com：
 - 重写 Node 的某些方法
 - 添加 one ,all ，从当前 Node 往下开始选择节点
 - 处理 append ,prepend 和 Dom 的参数实际上是反过来的
 - append/prepend 参数是节点时，如果当前 Node 数量 > 1 需要经过 clone，因为同一节点不可能被添加到多个节点中去（Node）
 */
});
KISSY.add('node/anim', [
    './base',
    'dom',
    'anim',
    'util'
], function (S, require, exports, module) {
    /**
 * @ignore
 * anim-node-plugin
 * @author yiminghe@gmail.com,
 *         lifesinger@gmail.com,
 *         qiaohua@taobao.com,
 */
    /*global Node:true*/
    var Node = require('./base');
    var Dom = require('dom');
    var Anim = require('anim');
    var util = require('util');
    var FX = [
            // height animations
            [
                'height',
                'margin-top',
                'margin-bottom',
                'padding-top',
                'padding-bottom'
            ],
            // width animations
            [
                'width',
                'margin-left',
                'margin-right',
                'padding-left',
                'padding-right'
            ],
            // opacity animations
            ['opacity']
        ];
    function getFxs(type, num, from) {
        var ret = [], obj = {};
        for (var i = from || 0; i < num; i++) {
            ret.push.apply(ret, FX[i]);
        }
        for (i = 0; i < ret.length; i++) {
            obj[ret[i]] = type;
        }
        return obj;
    }
    util.augment(Node, {
        /**
     * animate for current node list.
     * @chainable
     * @member KISSY.Node
     */
        animate: function () {
            var self = this, l = self.length, needClone = self.length > 1, originArgs = util.makeArray(arguments);
            var cfg = originArgs[0];
            var AnimConstructor = Anim;
            if (cfg.to) {
                AnimConstructor = cfg.Anim || Anim;
            } else {
                cfg = originArgs[1];
                if (cfg) {
                    AnimConstructor = cfg.Anim || Anim;
                }
            }
            for (var i = 0; i < l; i++) {
                var elem = self[i];
                var args = needClone ? util.clone(originArgs) : originArgs, arg0 = args[0];
                if (arg0.to) {
                    arg0.node = elem;
                    new AnimConstructor(arg0).run();
                } else {
                    AnimConstructor.apply(undefined, [elem].concat(args)).run();
                }
            }
            return self;
        },
        /**
     * stop anim of current node list.
     * @param {Boolean} [end] see {@link KISSY.Anim#static-method-stop}
     * @param [clearQueue]
     * @param [queue]
     * @chainable
     * @member KISSY.Node
     */
        stop: function (end, clearQueue, queue) {
            var self = this;
            util.each(self, function (elem) {
                Anim.stop(elem, end, clearQueue, queue);
            });
            return self;
        },
        /**
     * pause anim of current node list.
     * @param {Boolean} end see {@link KISSY.Anim#static-method-pause}
     * @param queue
     * @chainable
     * @member KISSY.Node
     */
        pause: function (end, queue) {
            var self = this;
            util.each(self, function (elem) {
                Anim.pause(elem, queue);
            });
            return self;
        },
        /**
     * resume anim of current node list.
     * @param {Boolean} end see {@link KISSY.Anim#static-method-resume}
     * @param queue
     * @chainable
     * @member KISSY.Node
     */
        resume: function (end, queue) {
            var self = this;
            util.each(self, function (elem) {
                Anim.resume(elem, queue);
            });
            return self;
        },
        /**
     * whether one of current node list is animating.
     * @return {Boolean}
     * @member KISSY.Node
     */
        isRunning: function () {
            var self = this;
            for (var i = 0; i < self.length; i++) {
                if (Anim.isRunning(self[i])) {
                    return true;
                }
            }
            return false;
        },
        /**
     * whether one of current node list 's animation is paused.
     * @return {Boolean}
     * @member KISSY.Node
     */
        isPaused: function () {
            var self = this;
            for (var i = 0; i < self.length; i++) {
                if (Anim.isPaused(self[i])) {
                    return true;
                }
            }
            return false;
        }
    });    /**
 * animate show effect for current node list.
 * @param {Number} duration duration of effect
 * @param {Function} [complete] callback function on anim complete.
 * @param {String|Function} [easing] easing type or custom function.
 * @chainable
 * @member KISSY.Node
 * @method show
 */
           /**
 * animate hide effect for current node list.
 * @param {Number} duration duration of effect
 * @param {Function} [complete] callback function on anim complete.
 * @param {String|Function} [easing] easing type or custom function.
 * @chainable
 * @member KISSY.Node
 * @method hide
 */
           /**
 * toggle show and hide effect for current node list.
 * @param {Number} duration duration of effect
 * @param {Function} [complete] callback function on anim complete.
 * @param {String|Function} [easing] easing type or custom function.
 * @chainable
 * @member KISSY.Node
 * @method toggle
 */
           /**
 * animate fadeIn effect for current node list.
 * @param {Number} duration duration of effect
 * @param {Function} [complete] callback function on anim complete.
 * @param {String|Function} [easing] easing type or custom function.
 * @chainable
 * @member KISSY.Node
 * @method fadeIn
 */
           /**
 * animate fadeOut effect for current node list.
 * @param {Number} duration duration of effect
 * @param {Function} [complete] callback function on anim complete.
 * @param {String|Function} [easing] easing type or custom function.
 * @chainable
 * @member KISSY.Node
 * @method fadeOut
 */
           /**
 * toggle fadeIn and fadeOut effect for current node list.
 * @param {Number} duration duration of effect
 * @param {Function} [complete] callback function on anim complete.
 * @param {String|Function} [easing] easing type or custom function.
 * @chainable
 * @member KISSY.Node
 * @method fadeToggle
 */
           /**
 * animate slideUp effect for current node list.
 * @param {Number} duration duration of effect
 * @param {Function} [complete] callback function on anim complete.
 * @param {String|Function} [easing] easing type or custom function.
 * @chainable
 * @member KISSY.Node
 * @method slideUp
 */
           /**
 * animate slideDown effect for current node list.
 * @param {Number} duration duration of effect
 * @param {Function} [complete] callback function on anim complete.
 * @param {String|Function} [easing] easing type or custom function.
 * @chainable
 * @member KISSY.Node
 * @method slideDown
 */
           /**
 * toggle slideUp and slideDown effect for current node list.
 * @param {Number} duration duration of effect
 * @param {Function} [complete] callback function on anim complete.
 * @param {String|Function} [easing] easing type or custom function.
 * @chainable
 * @member KISSY.Node
 * @method slideToggle
 */
    /**
 * animate show effect for current node list.
 * @param {Number} duration duration of effect
 * @param {Function} [complete] callback function on anim complete.
 * @param {String|Function} [easing] easing type or custom function.
 * @chainable
 * @member KISSY.Node
 * @method show
 */
    /**
 * animate hide effect for current node list.
 * @param {Number} duration duration of effect
 * @param {Function} [complete] callback function on anim complete.
 * @param {String|Function} [easing] easing type or custom function.
 * @chainable
 * @member KISSY.Node
 * @method hide
 */
    /**
 * toggle show and hide effect for current node list.
 * @param {Number} duration duration of effect
 * @param {Function} [complete] callback function on anim complete.
 * @param {String|Function} [easing] easing type or custom function.
 * @chainable
 * @member KISSY.Node
 * @method toggle
 */
    /**
 * animate fadeIn effect for current node list.
 * @param {Number} duration duration of effect
 * @param {Function} [complete] callback function on anim complete.
 * @param {String|Function} [easing] easing type or custom function.
 * @chainable
 * @member KISSY.Node
 * @method fadeIn
 */
    /**
 * animate fadeOut effect for current node list.
 * @param {Number} duration duration of effect
 * @param {Function} [complete] callback function on anim complete.
 * @param {String|Function} [easing] easing type or custom function.
 * @chainable
 * @member KISSY.Node
 * @method fadeOut
 */
    /**
 * toggle fadeIn and fadeOut effect for current node list.
 * @param {Number} duration duration of effect
 * @param {Function} [complete] callback function on anim complete.
 * @param {String|Function} [easing] easing type or custom function.
 * @chainable
 * @member KISSY.Node
 * @method fadeToggle
 */
    /**
 * animate slideUp effect for current node list.
 * @param {Number} duration duration of effect
 * @param {Function} [complete] callback function on anim complete.
 * @param {String|Function} [easing] easing type or custom function.
 * @chainable
 * @member KISSY.Node
 * @method slideUp
 */
    /**
 * animate slideDown effect for current node list.
 * @param {Number} duration duration of effect
 * @param {Function} [complete] callback function on anim complete.
 * @param {String|Function} [easing] easing type or custom function.
 * @chainable
 * @member KISSY.Node
 * @method slideDown
 */
    /**
 * toggle slideUp and slideDown effect for current node list.
 * @param {Number} duration duration of effect
 * @param {Function} [complete] callback function on anim complete.
 * @param {String|Function} [easing] easing type or custom function.
 * @chainable
 * @member KISSY.Node
 * @method slideToggle
 */
    util.each({
        show: getFxs('show', 3),
        hide: getFxs('hide', 3),
        toggle: getFxs('toggle', 3),
        fadeIn: getFxs('show', 3, 2),
        fadeOut: getFxs('hide', 3, 2),
        fadeToggle: getFxs('toggle', 3, 2),
        slideDown: getFxs('show', 1),
        slideUp: getFxs('hide', 1),
        slideToggle: getFxs('toggle', 1)
    }, function (v, k) {
        Node.prototype[k] = function (duration, complete, easing) {
            var self = this;    // 没有参数时，调用 Dom 中的对应方法
            // 没有参数时，调用 Dom 中的对应方法
            if (Dom[k] && !duration) {
                Dom[k](self);
            } else {
                var AnimConstructor = Anim;
                if (typeof duration === 'object') {
                    AnimConstructor = duration.Anim || Anim;
                }
                util.each(self, function (elem) {
                    new AnimConstructor(elem, v, duration, easing, complete).run();
                });
            }
            return self;
        };
    });    /*
 2011-11-10
 - 重写，逻辑放到 Anim 模块，这边只进行转发

 2011-05-17
 - yiminghe@gmail.com：添加 stop ，随时停止动画
 */
});
