/**
 * @ignore
 * selector
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 */
KISSY.add('dom/base/selector', function (S, Dom, undefined) {

    var doc = S.Env.host.document,
        docElem = doc.documentElement,
        matches = docElem.matches ||
            docElem.webkitMatchesSelector ||
            docElem.mozMatchesSelector ||
            docElem.oMatchesSelector ||
            docElem.msMatchesSelector,
        isArray = S.isArray,
        makeArray = S.makeArray,
        isDomNodeList = Dom.isDomNodeList,
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

	// added by jayli
	// http://jsperf.com/queryselctor-vs-getelementbyclassname2
	
	function makeMatch(selector){
		if (selector.charAt(0) == '#') {
			return makeIdMatch(selector.substr(1));
		} else if (selector.charAt(0) == '.') {
			return makeClassMatch(selector.substr(1));
		} else {
			return makeTagMatch(selector.substr(0));
		}
	}

	function makeIdMatch(id) {
		return function(elem) {
			var match = document.getElementById(id);
			return match ? [ match ] : [ ];
		};
	}

	function makeClassMatch(className) {
		return function(elem) {
			return elem.getElementsByClassName(className);
		};
	}

	function makeTagMatch(tagName) {
		return function(elem) {
			return elem.getElementsByTagName(tagName);
		};
	}

	// 只涉及#id,.cls,tag的逐级选择
	// 不包括不常见的选择器语法
	// http://www.w3.org/TR/css3-selectors/#attribute-pseudo-classes
	function isSimpleSelector(selector){
		var R = /(\+|\=|\~|\[|\]|:|>|\||\$|\^|\*|\(|\)|[\w-]+\.[\w-]+|[\w-]+\#[\w-]+)/;
		if(selector.match(R)){
			return false;
		} else {
			return true;
		}
	}

    function query(selector, context) {

        var ret,
            i,
            simpleContext,
            isSelectorString = typeof selector == 'string',
            contexts = context !== undefined ? query(context) : (simpleContext = 1) && [doc],
            contextsLen = contexts.length,
			simpleSelector,
			classSelectorRE = /^\.([\w-]+)$/,
			idSelectorRE = /^#([\w-]*)$/,
			tagSelectorRE = /^([\w-])+$/,
			tagIdSelectorRE = /^[\w-]+#([\w-])+$/,
			tagClassSelectorRE = /^[\w-]+\.[\w-]+$/;

        // 常见的空
        if (!selector) {
            ret = [];
        } else if (isSelectorString) {
            selector = trim(selector);

            // shortcut
            if (simpleContext && selector == 'body') {
                ret = [ doc.body ];
			} 
			// 单层.cls
			else if (simpleContext && classSelectorRE.test(selector) && 'getElementsByClassName' in document) {
				ret = contexts[0].getElementsByClassName(RegExp.$1);
				// console.log('getElementsByClassName');
			}
			// tag.cls 情况处理
			else if (simpleContext && tagClassSelectorRE.test(selector)) {
				ret = contexts[0].querySelectorAll(selector);
				// console.log('tag.cls');
			}
			// tag#id 情况处理
			else if (simpleContext && tagIdSelectorRE.test(selector)) {
				var el = doc.getElementById(selector.replace(/^.+#/,''));
				ret = el ? [el] : [];
				// console.log('tag#id');
			}
			// 单层#id
			else if (simpleContext && idSelectorRE.test(selector)) {
				var el = doc.getElementById(selector.substr(1));
				ret = el ? [el] : [];
				// console.log('#id');
			}
			// 单层tgs
			else if (simpleContext && tagSelectorRE.test(selector) && 'getElementsByTagName' in document){
				ret = contexts[0].getElementsByTagName(selector);
				// console.log('tgs');
			}
			// 复杂的CSS3选择器
			else if(!(simpleSelector = isSimpleSelector(selector)) && 'querySelectorAll' in document && contextsLen === 1) {
				// console.log('simple querySelector');
				ret = contexts[0].querySelectorAll(selector);
			}
			// 最后进入简单选择器的多层速选,#id tgs,#id .cls...
			else if('getElementsByTagName' in document 
					&& 'getElementsByClassName' in document 
					&& simpleSelector) {
				var parts = selector.split(/\s+/);
				for (var i = 0, n = parts.length; i < n; i++) {
					parts[i] = makeMatch(parts[i]);
				}

				var parents = contexts;

				for (var i = 0, m = parts.length; i < m; i++) {
					var part = parts[i];
					var newParents = [ ];

					for (var j = 0, n = parents.length; j < n; j++) {
						var matches = part(parents[j]);
						for (var k = 0, o = matches.length; k < o; k++) {
							newParents[newParents.length++] = matches[k];
						}
					}

					parents = newParents;
				}
				// console.log('speedup');
				ret = parents ? parents : [];
				//ret = contexts[0].querySelectorAll(selector);
            } 
			// 最后降级使用KISSY 1.3.0 的做法
			else {
                ret = [];
                for (i = 0; i < contextsLen; i++) {
					if('querySelectorAll' in document){
						// console.log('chain\'s querySelector');
						ret = ret.concat(S.makeArray(contexts[i].querySelectorAll(selector)));
					} else {
						push.apply(ret, Dom._selectInternal(selector, contexts[i]));
					}
                }
                // multiple contexts unique
                if (ret.length > 1 && contextsLen > 1) {
                    Dom.unique(ret);
                }
				// console.log('normal');
            }
        }
        // 不写 context，就是包装一下
        else {
            // 1.常见的单个元素
            // Dom.query(document.getElementById('xx'))
            if (selector['nodeType'] || selector['setTimeout']) {
                ret = [selector];
            }
            // 2.KISSY NodeList 特殊点直接返回，提高性能
            else if (selector['getDOMNodes']) {
                ret = selector['getDOMNodes']();
            }
            // 3.常见的数组
            // var x=Dom.query('.l');
            // Dom.css(x,'color','red');
            else if (isArray(selector)) {
                ret = selector;
            }
            // 4.selector.item
            // Dom.query(document.getElementsByTagName('a'))
            // note:
            // document.createElement('select').item 已经在 1 处理了
            // S.all().item 已经在 2 处理了
            else if (isDomNodeList(selector)) {
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
                        if (Dom._contains(contexts[ci], tmp[i])) {
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

                return a.compareDocumentPosition(b) & 4 ? -1 : 1;
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
                    if (a == b) {
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

                if (typeof filter == 'string' &&
                    (filter = trim(filter)) &&
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
                        };
                    } else if (id && !tag && !cls) {
                        filter = function (elem) {
                            return getAttr(elem, 'id') == id;
                        };
                    }
                }

                if (S.isFunction(filter)) {
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
}, {
    requires: ['./api']
});
/**
 * yiminghe@gmail.com - 2013-03-26
 * - refactor to use own css3 selector engine
 */

