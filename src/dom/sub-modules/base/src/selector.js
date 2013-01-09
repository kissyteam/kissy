/**
 * @ignore
 *  selector
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 */
KISSY.add('dom/base/selector', function (S, DOM, undefined) {

    var doc = S.Env.host.document,
        NodeType = DOM.NodeType,
        filter = S.filter,
        require = function (selector) {
            return S.require(selector);
        },
        isArray = S.isArray,
        makeArray = S.makeArray,
        isNodeList = DOM._isNodeList,
        getNodeName = DOM.nodeName,
        push = Array.prototype.push,
        SPACE = ' ',
        COMMA = ',',
        trim = S.trim,
        RE_ID = /^#[\w-]+$/,
        RE_QUERY = /^(?:#([\w-]+))?\s*([\w-]+|\*)?\.?([\w-]+)?$/;

    function query_each(f) {
        var self = this,
            el, i;
        for (i = 0; i < self.length; i++) {
            el = self[i];
            if (f(el, i) === false) {
                break;
            }
        }
    }

    function query(selector, context) {
        var ret,
            i,
            simpleContext,
            isSelectorString = typeof selector == 'string',
        // optimize common usage
        // consider context == null
            contexts = (context == undefined && (simpleContext = 1)) ?
                [doc] :
                query(context);
        // 常见的空
        if (!selector) {
            ret = [];
        }
        // 常见的选择器
        // DOM.query('#x')
        else if (isSelectorString) {
            selector = trim(selector);
            // shortcut
            if (simpleContext && selector == 'body') {
                ret = [doc.body]
            } else if (contexts.length == 1 && selector) {
                ret = quickFindBySelectorStr(selector, contexts[0]);
            }
        }
        // 不写 context，就是包装一下
        else if (simpleContext) {
            // 1.常见的单个元素
            // DOM.query(document.getElementById('xx'))
            if (selector['nodeType'] || selector['setTimeout']) {
                ret = [selector];
            }
            // 2.KISSY NodeList 特殊点直接返回，提高性能
            else if (selector['getDOMNodes']) {
                ret = selector['getDOMNodes']();
            }
            // 3.常见的数组
            // var x=DOM.query('.l');
            // DOM.css(x,'color','red');
            else if (isArray(selector)) {
                ret = selector;
            }
            // 4.selector.item
            // DOM.query(document.getElementsByTagName('a'))
            // note:
            // document.createElement('select').item 已经在 1 处理了
            // S.all().item 已经在 2 处理了
            else if (isNodeList(selector)) {
                ret = S.makeArray(selector);
            } else {
                ret = [ selector ];
            }
        }

        if (!ret) {
            ret = [];
            if (selector) {
                for (i = 0; i < contexts.length; i++) {
                    push.apply(ret, queryByContexts(selector, contexts[i]));
                }
                //必要时去重排序
                if (ret.length > 1 &&
                    // multiple contexts
                    (contexts.length > 1 ||
                        (isSelectorString &&
                            // multiple selector
                            selector.indexOf(COMMA) > -1))) {
                    DOM.unique(ret);
                }
            }
        }

        // attach each method
        ret.each = query_each;

        return ret;
    }

    function queryByContexts(selector, context) {
        var ret = [],
            isSelectorString = typeof selector == 'string';
        if (isSelectorString && selector.match(RE_QUERY) || !isSelectorString) {
            // 简单选择器自己处理
            ret = queryBySimple(selector, context);
        }
        // 如果选择器有, 分开递归一部分一部分来
        else if (isSelectorString &&
            // #255
            // [data-key='a,b']
            selector
                .replace(/"(?:(?:\\.)|[^"])*"/g, '')
                .replace(/'(?:(?:\\.)|[^'])*'/g, '').indexOf(COMMA) > -1) {
            ret = queryBySelectors(selector, context);
        }
        else {
            // 复杂了，交给 sizzle
            ret = queryBySizzle(selector, context);
        }
        return ret;
    }

    // 交给 sizzle 模块处理
    function queryBySizzle(selector, context) {
        var ret = [],
            sizzle = require('sizzle');
        if (sizzle) {
            sizzle(selector, context, ret);
        } else {
            // 原生不支持
            error(selector);
        }
        return ret;
    }

    // 处理 selector 的每个部分
    function queryBySelectors(selector, context) {
        var ret = [],
            i,
            selectors = selector.split(/\s*,\s*/);
        for (i = 0; i < selectors.length; i++) {
            push.apply(ret, queryByContexts(selectors[i], context));
        }
        // 多部分选择器可能得到重复结果
        return ret;
    }

    function quickFindBySelectorStr(selector, context) {
        var ret, t, match, id, tag, cls;
        // selector 为 #id 是最常见的情况，特殊优化处理
        if (RE_ID.test(selector)) {
            t = getElementById(selector.slice(1), context);
            // #id 无效时，返回空数组
            ret = t ? [t] : [];
        }
        // selector 为支持列表中的其它 6 种
        else {
            match = RE_QUERY.exec(selector);
            if (match) {
                // 获取匹配出的信息
                id = match[1];
                tag = match[2];
                cls = match[3];
                // 空白前只能有 id ，取出来作为 context
                context = (id ? getElementById(id, context) : context);
                if (context) {
                    // #id .cls | #id tag.cls | .cls | tag.cls | #id.cls
                    if (cls) {
                        if (!id || selector.indexOf(SPACE) != -1) { // 排除 #id.cls
                            ret = [].concat(DOM._getElementsByClassName(cls, tag, context));
                        }
                        // 处理 #id.cls
                        else {
                            t = getElementById(id, context);
                            if (hasSingleClass(t, cls)) {
                                ret = [t];
                            }
                        }
                    }
                    // #id tag | tag
                    else if (tag) { // 排除空白字符串
                        ret = makeArray(DOM._getElementsByTagName(tag, context));
                    }
                }

                ret = ret || [];
            }
        }
        return ret;
    }

    // 最简单情况了，单个选择器部分，单个上下文
    function queryBySimple(selector, context) {
        var ret,
            isSelectorString = typeof selector == 'string';
        if (isSelectorString) {
            ret = quickFindBySelectorStr(selector, context) || [];
        }
        // 传入的 selector 是 NodeList 或已是 Array
        else if (isArray(selector) || isNodeList(selector)) {
            // 只能包含在 context 里面
            // filter 会转换为 nodelist 为数组
            ret = filter(selector, function (s) {
                return testByContext(s, context);
            });
        }
        // 传入的 selector 是 HTMLNode 查看约束
        // 否则 window/document，原样返回
        else if (testByContext(selector, context)) {
            ret = [selector];
        }
        return ret;
    }

    function testByContext(element, context) {
        if (!element) {
            return false;
        }
        // 防止 element 节点还没添加到 document ，但是也可以获取到 query(element) => [element]
        // document 的上下文一律放行
        // context == doc 意味着没有提供第二个参数，到这里只是想单纯包装原生节点，则不检测
        if (context == doc) {
            return true;
        }
        // 节点受上下文约束
        return DOM._contains(context, element);
    }

    // throw exception
    function error(msg) {
        S.error('Unsupported selector: ' + msg);
    }

    // query #id
    function getElementById(id, context) {
        var contextIsDocument = context.nodeType == NodeType.DOCUMENT_NODE,
            doc = contextIsDocument ? context : context.ownerDocument;
        return DOM._getElementById(id, context, doc, contextIsDocument);
    }

    function hasSingleClass(el, cls) {
        var className = el && el.className;
        return className && (SPACE + className + SPACE).indexOf(SPACE + cls + SPACE) > -1;
    }

    function getAttr(el, name) {
        var ret = el && el.getAttributeNode(name);
        return ret && ret.nodeValue;
    }

    S.mix(DOM,
        /**
         * @override KISSY.DOM
         * @class
         * @singleton
         */
        {
            _getAttr: getAttr,
            _hasSingleClass: hasSingleClass,

            _getElementById: function (id, context, doc, contextIsDocument) {
                var el = doc.getElementById(id);
                // ie confuse name with id
                // https://github.com/kissyteam/kissy/issues/67
                // 不能直接 el.id ，否则 input shadow form attribute
                var elId = DOM._getAttr(el, 'id');
                if (!el && !contextIsDocument && !DOM._contains(doc, context)
                    || el && elId != id) {
                    return DOM.filter('*', '#' + id, context)[0] || null;
                } else if (contextIsDocument || el && DOM._contains(context, el)) {
                    return el;
                }
                return null;
            },

            _getElementsByTagName: function (tag, context) {
                return context.getElementsByTagName(tag);
            },

            _getElementsByClassName: function (cls, tag, context) {
                // ie8 return staticNodeList 对象,[].concat 会形成 [ staticNodeList ] ，手动转化为普通数组
                return  makeArray(context.querySelectorAll((tag || '') + '.' + cls));
            },

            // 貌似除了 ie 都有了...
            _compareNodeOrder: function (a, b) {
                if (!a.compareDocumentPosition || !b.compareDocumentPosition) {
                    return a.compareDocumentPosition ? -1 : 1;
                }

                return a.compareDocumentPosition(b) & 4 ? -1 : 1;
            },

            /**
             * Accepts a string containing a CSS selector which is then used to match a set of elements.
             * @param {String|HTMLElement[]} selector
             * A string containing a selector expression.
             * or
             * array of HTMLElements.
             * @param {String|HTMLElement[]|HTMLDocument|HTMLElement} [context] context under which to find elements matching selector.
             * @return {HTMLElement[]} The array of found HTMLElements
             * @method
             */
            query: query,

            /**
             * Accepts a string containing a CSS selector which is then used to match a set of elements.
             * @param {String|HTMLElement[]} selector
             * A string containing a selector expression.
             * or
             * array of HTMLElements.
             * @param {String|HTMLElement[]|HTMLDocument|HTMLElement|window} [context] context under which to find elements matching selector.
             * @return {HTMLElement} The first of found HTMLElements
             */
            get: function (selector, context) {
                return query(selector, context)[0] || null;
            },

            /**
             * Sorts an array of DOM elements, in place, with the duplicates removed.
             * Note that this only works on arrays of DOM elements, not strings or numbers.
             * @param {HTMLElement[]} The Array of DOM elements.
             * @method
             * @return {HTMLElement[]}
             * @member KISSY.DOM
             */
            unique: (function () {
                var hasDuplicate,
                    baseHasDuplicate = true;

                // Here we check if the JavaScript engine is using some sort of
                // optimization where it does not always call our comparison
                // function. If that is the case, discard the hasDuplicate value.
                // Thus far that includes Google Chrome.
                [0, 0].sort(function () {
                    baseHasDuplicate = false;
                    return 0;
                });

                function sortOrder(a, b) {
                    if (a == b) {
                        hasDuplicate = true;
                        return 0;
                    }

                    return DOM._compareNodeOrder(a, b);
                }

                // 排序去重
                return function (elements) {

                    hasDuplicate = baseHasDuplicate;
                    elements.sort(sortOrder);

                    if (hasDuplicate) {
                        var i = 1, len = elements.length;
                        while (i < len) {
                            if (elements[i] === elements[ i - 1 ]) {
                                elements.splice(i, 1);
                            } else {
                                i++;
                            }
                        }
                    }

                    return elements;
                };
            })(),

            /**
             * Reduce the set of matched elements to those that match the selector or pass the function's test.
             * @param {String|HTMLElement[]} selector Matched elements
             * @param {String|Function} filter Selector string or filter function
             * @param {String|HTMLElement[]|HTMLDocument} [context] Context under which to find matched elements
             * @return {HTMLElement[]}
             * @member KISSY.DOM
             */
            filter: function (selector, filter, context) {
                var elems = query(selector, context),
                    sizzle = require('sizzle'),
                    match,
                    tag,
                    id,
                    cls,
                    ret = [];

                // 默认仅支持最简单的 tag.cls 或 #id 形式
                if (typeof filter == 'string' &&
                    (filter = trim(filter)) &&
                    (match = RE_QUERY.exec(filter))) {
                    id = match[1];
                    tag = match[2];
                    cls = match[3];
                    if (!id) {
                        filter = function (elem) {
                            var tagRe = true, clsRe = true;

                            // 指定 tag 才进行判断
                            if (tag) {
                                tagRe = getNodeName(elem) == tag.toLowerCase();
                            }

                            // 指定 cls 才进行判断
                            if (cls) {
                                clsRe = hasSingleClass(elem, cls);
                            }

                            return clsRe && tagRe;
                        }
                    } else if (id && !tag && !cls) {
                        filter = function (elem) {
                            return getAttr(elem, 'id') == id;
                        };
                    }
                }

                if (S.isFunction(filter)) {
                    ret = S.filter(elems, filter);
                }
                // 其它复杂 filter, 采用外部选择器
                else if (filter && sizzle) {
                    ret = sizzle.matches(filter, elems);
                }
                // filter 为空或不支持的 selector
                else {
                    error(filter);
                }

                return ret;
            },

            /**
             * Returns true if the matched element(s) pass the filter test
             * @param {String|HTMLElement[]} selector Matched elements
             * @param {String|Function} filter Selector string or filter function
             * @param {String|HTMLElement[]|HTMLDocument} [context] Context under which to find matched elements
             * @return {Boolean}
             * @member KISSY.DOM
             */
            test: function (selector, filter, context) {
                var elements = query(selector, context);
                return elements.length && (DOM.filter(elements, filter, context).length === elements.length);
            }
        });

    return DOM;
}, {
    requires: ['./api']
});

/*
 NOTES:

 2012.12.26
 - 尽量用原生方法提高性能

 2011.08.02
 - 利用 sizzle 重构选择器
 - 1.1.6 修正，原来 context 只支持 #id 以及 document
 1.2 context 支持任意，和 selector 格式一致
 - 简单选择器也和 jquery 保持一致 DOM.query('xx','yy') 支持
 - context 不提供则为当前 document ，否则通过 query 递归取得
 - 保证选择出来的节点（除了 document window）都是位于 context 范围内


 2010.01
 - 对 reg exec 的结果(id, tag, className)做 cache, 发现对性能影响很小，去掉。
 - getElementById 使用频率最高，使用直达通道优化。
 - getElementsByClassName 性能优于 querySelectorAll, 但 IE 系列不支持。
 - instanceof 对性能有影响。
 - 内部方法的参数，比如 cls, context 等的异常情况，已经在 query 方法中有保证，无需冗余“防卫”。
 - query 方法中的条件判断考虑了“频率优先”原则。最有可能出现的情况放在前面。
 - Array 的 push 方法可以用 j++ 来替代，性能有提升。
 - 返回值策略和 Sizzle 一致，正常时，返回数组；其它所有情况，返回空数组。

 - 从压缩角度考虑，还可以将 getElementsByTagName 和 getElementsByClassName 定义为常量，
 不过感觉这样做太“压缩控”，还是保留不替换的好。

 - 调整 getElementsByClassName 的降级写法，性能最差的放最后。

 2010.02
 - 添加对分组选择器的支持（主要参考 Sizzle 的代码，代去除了对非 Grade A 级浏览器的支持）

 2010.03
 - 基于原生 dom 的两个 api: S.query 返回数组; S.get 返回第一个。
 基于 Node 的 api: S.one, 在 Node 中实现。
 基于 NodeList 的 api: S.all, 在 NodeList 中实现。
 通过 api 的分层，同时满足初级用户和高级用户的需求。

 2010.05
 - 去掉给 S.query 返回值默认添加的 each 方法，保持纯净。
 - 对于不支持的 selector, 采用外部耦合进来的 Selector.

 2010.06
 - 增加 filter 和 test 方法

 2010.07
 - 取消对 , 分组的支持，group 直接用 Sizzle

 2010.08
 - 给 S.query 的结果 attach each 方法

 2011.05
 - yiminghe@gmail.com：恢复对简单分组支持

 Ref: http://ejohn.org/blog/selectors-that-people-actually-use/
 考虑 2/8 原则，仅支持以下选择器：
 #id
 tag
 .cls
 #id tag
 #id .cls
 tag.cls
 #id tag.cls
 注 1：RE_QUERY 还会匹配 #id.cls
 注 2：tag 可以为 * 字符
 注 3: 支持 , 号分组


 Bugs:
 - S.query('#test-data *') 等带 * 号的选择器，在 IE6 下返回的值不对。jQuery 等类库也有此 bug, 诡异。

 References:
 - http://ejohn.org/blog/selectors-that-people-actually-use/
 - http://ejohn.org/blog/thoughts-on-queryselectorall/
 - MDC: querySelector, querySelectorAll, getElementsByClassName
 - Sizzle: http://github.com/jeresig/sizzle
 - MINI: http://james.padolsey.com/javascript/mini/
 - Peppy: http://jamesdonaghue.com/?p=40
 - Sly: http://github.com/digitarald/sly
 - XPath, TreeWalker：http://www.cnblogs.com/rubylouvre/archive/2009/07/24/1529640.html

 - http://www.quirksmode.org/blog/archives/2006/01/contains_for_mo.html
 - http://www.quirksmode.org/dom/getElementsByTagNames.html
 - http://ejohn.org/blog/comparing-document-position/
 - http://github.com/jeresig/sizzle/blob/master/sizzle.js
 */
