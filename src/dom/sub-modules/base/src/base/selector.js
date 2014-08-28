/**
 * @ignore
 * simple selector for dom
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 */
KISSY.add(function (S, require) {
    var Dom = require('./api');
    var doc = S.Env.host.document,
        docElem = doc.documentElement,
        matches = docElem.matches ||
            docElem.webkitMatchesSelector ||
            docElem.mozMatchesSelector ||
            docElem.oMatchesSelector ||
            docElem.msMatchesSelector,
        supportGetElementsByClassName = 'getElementsByClassName' in doc,
        getElementsByClassName,
        isArray = S.isArray,
        makeArray = S.makeArray,
        isDomNodeList = Dom.isDomNodeList,
        SPACE = ' ',
        push = Array.prototype.push,
        rClassSelector = /^\.([\w-]+)$/,
        rIdSelector = /^#([\w-]+)$/,
        rTagSelector = /^([\w-])+$/,
        rTagIdSelector = /^([\w-]+)#([\w-]+)$/,
        rSimpleSelector = /^(?:#([\w-]+))?\s*([\w-]+|\*)?\.?([\w-]+)?$/,
        trim = S.trim;

    if (!supportGetElementsByClassName) {
        getElementsByClassName = function (el, match) {
            var result = [],
                elements = el.getElementsByTagName('*'),
                i, elem;
            match = ' ' + match + ' ';
            for (i = 0; i < elements.length; i++) {
                elem = elements[i];
                if ((' ' + (elem.className || elem.getAttribute('class')) + ' ').indexOf(match) > -1) {
                    result.push(elem);
                }
            }
            return result;
        };
    } else {
        getElementsByClassName = function (el, match) {
            return el.getElementsByClassName(match);
        };
    }

    function queryEach(f) {
        var self = this,
            l = self.length,
            i;
        for (i = 0; i < l; i++) {
            if (f(self[i], i) === false) {
                break;
            }
        }
    }

    function checkSelectorAndReturn(selector) {
        var name = selector.substr(1);
        if (!name) {
            throw new Error('An invalid or illegal string was specified for selector.');
        }
        return name;
    }

    function makeMatch(selector) {
        var s = selector.charAt(0);
        if (s === '#') {
            return makeIdMatch(checkSelectorAndReturn(selector));
        } else if (s === '.') {
            return makeClassMatch(checkSelectorAndReturn(selector));
        } else {
            return makeTagMatch(selector);
        }
    }

    function makeIdMatch(id) {
        return function (elem) {
            var match = Dom._getElementById(id, doc);
            return match && Dom._contains(elem, match) ? [match] : [];
        };
    }

    function makeClassMatch(className) {
        return function (elem) {
            return getElementsByClassName(elem, className);
        };
    }

    function makeTagMatch(tagName) {
        return function (elem) {
            return elem.getElementsByTagName(tagName);
        };
    }

    // 只涉及#id,.cls,tag的逐级选择
    function isSimpleSelector(selector) {
        var complexReg = /,|\+|=|~|\[|\]|:|>|\||\$|\^|\*|\(|\)|[\w-]+\.[\w-]+|[\w-]+#[\w-]+/;
        return !selector.match(complexReg);
    }

    function query(selector, context) {
        var ret,
            i,
            el,
            simpleContext,
            isSelectorString = typeof selector === 'string',
            contexts = context !== undefined ? query(context) : (simpleContext = 1) && [doc],
            contextsLen = contexts.length;

        // 常见的空
        if (!selector) {
            ret = [];
        } else if (isSelectorString) {
            selector = trim(selector);

            if (simpleContext) {
                // shortcut
                if (selector === 'body') {
                    ret = [doc.body];
                } else if (rClassSelector.test(selector)) {
                    // .cls
                    ret = makeArray(getElementsByClassName(doc, RegExp.$1));
                } else if (rTagIdSelector.test(selector)) {
                    // tag#id
                    el = Dom._getElementById(RegExp.$2, doc);
                    ret = el && el.nodeName.toLowerCase() === RegExp.$1 ? [el] : [];
                } else if (rIdSelector.test(selector)) {
                    // #id
                    el = Dom._getElementById(selector.substr(1), doc);
                    ret = el ? [el] : [];
                } else if (rTagSelector.test(selector)) {
                    // tag
                    ret = makeArray(doc.getElementsByTagName(selector));
                } else if (isSimpleSelector(selector)) {
                    // #id tag, #id .cls...
                    var parts = selector.split(/\s+/),
                        partsLen,
                        parents = contexts,
                        parentIndex,
                        parentsLen;

                    for (i = 0, partsLen = parts.length; i < partsLen; i++) {
                        parts[i] = makeMatch(parts[i]);
                    }

                    for (i = 0, partsLen = parts.length; i < partsLen; i++) {
                        var part = parts[i],
                            newParents = [],
                            matches;

                        for (parentIndex = 0, parentsLen = parents.length;
                             parentIndex < parentsLen;
                             parentIndex++) {
                            matches = part(parents[parentIndex]);
                            newParents.push.apply(newParents, makeArray(matches));
                        }

                        parents = newParents;
                        if (!parents.length) {
                            break;
                        }
                    }
                    ret = parents && parents.length > 1 ? Dom.unique(parents) : parents;
                }
            }

            if (!ret) {
                ret = [];
                for (i = 0; i < contextsLen; i++) {
                    push.apply(ret, Dom._selectInternal(selector, contexts[i]));
                }
                // multiple contexts unique
                if (ret.length > 1 && contextsLen > 1) {
                    Dom.unique(ret);
                }
            }
        } else {
            // 不写 context，就是包装一下
            // 1.常见的单个元素
            // Dom.query(document.getElementById('xx'))
            // do not pass form.elements to this function ie678 bug
            if (selector.nodeType || S.isWindow(selector)) {
                ret = [selector];
            } else if (selector.getDOMNodes) {
                // 2.KISSY NodeList 特殊点直接返回，提高性能
                ret = selector.getDOMNodes();
            } else if (isArray(selector)) {
                // 3.常见的数组
                // var x=Dom.query('.l');
                // Dom.css(x,'color','red');
                ret = selector;
            } else if (isDomNodeList(selector)) {
                // 4.selector.item
                // Dom.query(document.getElementsByTagName('a'))
                // note:
                // document.createElement('select').item 已经在 1 处理了
                // S.all().item 已经在 2 处理了
                ret = makeArray(selector);
            } else {
                ret = [selector];
            }

            if (!simpleContext) {
                var tmp = ret,
                    ci,
                    len = tmp.length;
                ret = [];
                for (i = 0; i < len; i++) {
                    for (ci = 0; ci < contextsLen; ci++) {
                        if (Dom._contains(contexts[ci], tmp[i])) {
                            ret.push(tmp[i]);
                            break;
                        }
                    }
                }
            }
        }

        // attach each method
        ret.each = queryEach;

        return ret;
    }

    function hasSingleClass(el, cls) {
        // consider xml
        // https://github.com/kissyteam/kissy/issues/532
        var className = el && getAttr(el, 'class');
        return className && (className = className.replace(/[\r\t\n]/g, SPACE)) &&
            (SPACE + className + SPACE).indexOf(SPACE + cls + SPACE) > -1;
    }

    function getAttr(el, name) {
        var ret = el && el.getAttributeNode(name);
        if (ret && ret.specified) {
            return ret.nodeValue;
        }
        return undefined;
    }

    function isTag(el, value) {
        return value === '*' || el.nodeName.toLowerCase() === value.toLowerCase();
    }

    S.mix(Dom,
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
                var bit = a.compareDocumentPosition(b) & 4;
                return bit ? -1 : 1;
            },

            _getElementsByTagName: function (name, context) {
                // can not use getElementsByTagName for fragment
                return makeArray(context.querySelectorAll(name));
            },

            _getElementById: function (id, doc) {
                return doc.getElementById(id);
            },

            _getSimpleAttr: getAttr,

            _isTag: isTag,

            _hasSingleClass: hasSingleClass,

            _matchesInternal: function (str, seeds) {
                var ret = [],
                    i = 0,
                    n,
                    len = seeds.length;
                for (; i < len; i++) {
                    n = seeds[i];
                    if (matches.call(n, str)) {
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
             * Note: do not pass form.elements to this function
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
             * @param {String|HTMLElement[]|HTMLDocument|HTMLElement|Window} [context] context under which to find elements matching selector.
             * @return {HTMLElement} The first of found HTMLElements
             */
            get: function (selector, context) {
                return query(selector, context)[0] || null;
            },

            /**
             * Sorts an array of Dom elements, in place, with the duplicates removed.
             * Note that this only works on arrays of Dom elements, not strings or numbers.
             * @param {HTMLElement[]} The Array of Dom elements.
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
                    if (a === b) {
                        hasDuplicate = true;
                        return 0;
                    }

                    return Dom._compareNodeOrder(a, b);
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

                if (typeof filter === 'string' &&
                    (filter = trim(filter)) &&
                    (match = rSimpleSelector.exec(filter))) {
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
                        };
                    } else if (id && !tag && !cls) {
                        filter = function (elem) {
                            return getAttr(elem, 'id') === id;
                        };
                    }
                }

                if (typeof filter === 'function') {
                    ret = S.filter(elems, filter);
                } else {
                    ret = Dom._matchesInternal(filter, elems);
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
                return elements.length && (Dom.filter(elements, filter, context).length === elements.length);
            }
        });

    return Dom;
});
/**
 * @ignore
 * bachi selector optimize - 2013-07-17
 * - http://jsperf.com/queryselctor-vs-getelementbyclassname2
 * yiminghe@gmail.com - 2013-03-26
 * - refactor to use own css3 selector engine
 */