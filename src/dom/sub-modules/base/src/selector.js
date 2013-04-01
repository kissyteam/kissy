/**
 * @ignore
 * selector
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 */
KISSY.add('dom/base/selector', function (S, DOM) {

    var doc = S.Env.host.document,
        isArray = S.isArray,
        makeArray = S.makeArray,
        isNodeList = DOM._isNodeList,
        SPACE = ' ',
        push = Array.prototype.push,
        RE_QUERY = /^(?:#([\w-]+))?\s*([\w-]+|\*)?\.?([\w-]+)?$/,
        trim = S.trim;

    function query_each(f) {
        var els = this,
            l = els.length,
            i;
        for (i = 0; i < l; i++) {
            if (f(els[i], i) === false) {
                break;
            }
        }
    }

    function query(selector, context) {

        var ret,
            i,
            simpleContext,
            isSelectorString = typeof selector == 'string',
            contexts = context ? query(context) : (simpleContext = 1) && [doc],
            contextsLen = contexts.length;

        // 常见的空
        if (!selector) {
            ret = [];
        } else if (isSelectorString) {
            selector = trim(selector);
            // shortcut
            if (simpleContext && selector == 'body') {
                ret = [ doc.body ]
            } else {
                ret = [];
                for (i = 0; i < contextsLen; i++) {
                    push.apply(ret, DOM._selectInternal(selector, contexts[i]));
                }
                // multiple contexts unique
                if (ret.length > 1 && contextsLen > 1) {
                    DOM.unique(ret);
                }
            }
        }
        // 不写 context，就是包装一下
        else {
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
                ret = makeArray(selector);
            } else {
                ret = [ selector ];
            }

            if (!simpleContext) {
                var tmp = ret,
                    ci,
                    len = tmp.length;
                ret = [];
                for (i = 0; i < len; i++) {
                    for (ci = 0; ci < contextsLen; ci++) {
                        if (DOM._contains(contexts[ci], tmp[i])) {
                            ret.push(tmp[i]);
                            break;
                        }
                    }
                }
            }
        }

        // attach each method
        ret.each = query_each;

        return ret;
    }

    function hasSingleClass(el, cls) {
        // consider xml
        var className = el && (el.className || getAttr(el, 'class'));
        return className && (SPACE + className + SPACE).indexOf(SPACE + cls + SPACE) > -1;
    }

    function getAttr(el, name) {
        var ret = el && el.getAttributeNode(name);
        if (ret && ret.specified) {
            return ret.nodeValue;
        }
        return undefined;
    }

    function isTag(el, value) {
        return value == '*' || el.nodeName.toLowerCase() === value.toLowerCase();
    }

    S.mix(DOM,
        /**
         * @override KISSY.DOM
         * @class
         * @singleton
         */
        {
            _compareNodeOrder: function (a, b) {
                if (!a.compareDocumentPosition || !b.compareDocumentPosition) {
                    return a.compareDocumentPosition ? -1 : 1;
                }

                return a.compareDocumentPosition(b) & 4 ? -1 : 1;
            },

            _isTag: isTag,

            _getAttr: getAttr,

            _hasSingleClass: hasSingleClass,

            _matchesInternal: function (str, seeds) {
                var ret = [],
                    i = 0,
                    matches = makeArray(doc.querySelectorAll(str)),
                    n,
                    len = seeds.length;
                for (; i < len; i++) {
                    n = seeds[i];
                    if (matches.indexOf(n) != -1) {
                        ret.push(n);
                    }
                }
                return ret;
            },

            _selectInternal: function (str, context) {
                return makeArray(context.querySelectorAll(str));
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
                                --len;
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
                    id,
                    tag,
                    match,
                    cls,
                    ret = [];

                if (typeof filter == 'string' && (filter = trim(filter)) &&
                    (match = RE_QUERY.exec(filter))) {
                    id = match[1];
                    tag = match[2];
                    cls = match[3];
                    if (!id) {
                        filter = function (elem) {
                            var tagRe = true,
                                clsRe = true;

                            // 指定 tag 才进行判断
                            if (tag) {
                                tagRe = isTag(elem, tag);
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
                } else {
                    ret = DOM._matchesInternal(filter, elems);
                }

                return ret;
            },

            /**
             * Returns true if the matched element(s) pass the filter test
             * @param {String|HTMLElement[]} selector Matched elements
             * @param {String|Function} filter Selector string or filter function
             * @param {String|HTMLElement[]|HTMLDocument} [context] Context under which to find matched elements
             * @member KISSY.DOM
             * @return {Boolean}
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
/**
 * yiminghe@gmail.com - 2013-03-26
 * - refactor to use own css3 selector engine
 */

