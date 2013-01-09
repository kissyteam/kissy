/**
 * @ignore
 *  import methods from DOM to NodeList.prototype
 * @author yiminghe@gmail.com
 */
KISSY.add('node/attach', function (S, DOM, Event, NodeList, undefined) {

    var NLP = NodeList.prototype,
        makeArray = S.makeArray,
    // DOM 添加到 NP 上的方法
    // if DOM methods return undefined , Node methods need to transform result to itself
        DOM_INCLUDES_NORM = [
            'nodeName',
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
            'attr': 1,
            'text': 0,
            'css': 1,
            'style': 1,
            'val': 0,
            'prop': 1,
            'offset': 0,
            'html': 0,
            'outerHTML': 0,
            'data': 1
        },
    // Event 添加到 NP 上的方法
        EVENT_INCLUDES = [
            'on',
            'detach',
            'fire',
            'fireHandler',
            'delegate',
            'undelegate'
        ];

    NodeList.KeyCodes = Event.KeyCodes;

    function accessNorm(fn, self, args) {
        args.unshift(self);
        var ret = DOM[fn].apply(DOM, args);
        if (ret === undefined) {
            return self;
        }
        return ret;
    }

    function accessNormList(fn, self, args) {
        args.unshift(self);
        var ret = DOM[fn].apply(DOM, args);
        if (ret === undefined) {
            return self;
        }
        else if (ret === null) {
            return null;
        }
        return new NodeList(ret);
    }

    function accessNormIf(fn, self, index, args) {

        // get
        if (args[index] === undefined
            // 并且第一个参数不是对象，否则可能是批量设置写
            && !S.isObject(args[0])) {
            args.unshift(self);
            return DOM[fn].apply(DOM, args);
        }
        // set
        return accessNorm(fn, self, args);
    }

    S.each(DOM_INCLUDES_NORM, function (k) {
        NLP[k] = function () {
            var args = makeArray(arguments);
            return accessNorm(k, this, args);
        };
    });

    S.each(DOM_INCLUDES_NORM_NODE_LIST, function (k) {
        NLP[k] = function () {
            var args = makeArray(arguments);
            return accessNormList(k, this, args);
        };
    });

    S.each(DOM_INCLUDES_NORM_IF, function (index, k) {
        NLP[k] = function () {
            var args = makeArray(arguments);
            return accessNormIf(k, this, index, args);
        };
    });

    S.each(EVENT_INCLUDES, function (k) {
        NLP[k] = function () {
            var self = this,
                args = makeArray(arguments);
            args.unshift(self);
            Event[k].apply(Event, args);
            return self;
        }
    });

}, {
    requires: ['dom', 'event/dom', './base']
});

/*
 2011-05-24
 - yiminghe@gmail.com：
 - 将 DOM 中的方法包装成 NodeList 方法
 - Node 方法调用参数中的 KISSY NodeList 要转换成第一个 HTML Node
 - 要注意链式调用，如果 DOM 方法返回 undefined （无返回值），则 NodeList 对应方法返回 this
 - 实际上可以完全使用 NodeList 来代替 DOM，不和节点关联的方法如：viewportHeight 等，在 window，document 上调用
 - 存在 window/document 虚节点，通过 S.one(window)/new Node(window) ,S.one(document)/new NodeList(document) 获得
 */
