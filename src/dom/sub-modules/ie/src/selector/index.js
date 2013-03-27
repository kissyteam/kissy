/**
 * css3 selector engine for ie6-8
 * @author yiminghe@gmail.com
 */
KISSY.add('dom/ie/selector/index', function (S, parser, DOM) {

    // ident === identifier

    var document = S.Env.host.document,
        caches = {},
        aNPlusB = /^(?:([+-]?\d+)n)?([+-]?\d+)$/;

    function getAttrValue(el, attr) {
        var node = el.getAttributeNode(attr);
        if (!node || !node.specified) {
            return null;
        } else {
            return node.nodeValue;
        }
    }

    function getElementsByTagName(name, context) {
        var nodes = context.getElementsByTagName(name);
        if (name === '*') {
            var ret = [],
                len = nodes.length,
                n,
                index = 0,
                i = 0;
            for (; i < len; i++) {
                n = nodes[i];
                if (n.nodeType == 1) {
                    ret[index++] = n;
                }
            }
            return ret;
        } else {
            return nodes;
        }
    }

    function getAb(param) {
        var a = 0,
            match,
            b = 0;
        if (typeof param == 'number') {
            b = param;
        }
        else if (param == 'odd') {
            a = 2;
            b = 1;
        } else if (param == 'even') {
            a = 2;
            b = 0;
        } else if (match = param.match(aNPlusB)) {
            a = parseInt(match[1]) || 0;
            b = parseInt(match[2]) || 0;
        }
        return {
            a: a,
            b: b
        };
    }

    function matchIndexByAb(index, a, b, eq) {
        if (a == 0) {
            if (index == b) {
                return eq;
            }
        } else {
            if ((index - b) / a >= 0 && (index - b) % a == 0 && eq) {
                return 1;
            }
        }
        return undefined;
    }

    function isXML(elem) {
        var documentElement = elem && (elem.ownerDocument || elem).documentElement;
        return documentElement ? documentElement.nodeName.toLowerCase() !== "html" : false;
    }

    var pseudoFnExpr = {
        'nth-child': function (el, param) {
            var ab = getAb(param),
                a = ab.a,
                b = ab.b;
            if (a == 0 && b == 0) {
                return 0;
            }
            var index = 0,
                parent = el.parentNode;
            if (parent) {
                var childNodes = parent.childNodes,
                    count = 0,
                    child,
                    ret,
                    len = childNodes.length;
                for (; count < len; count++) {
                    child = childNodes[count];
                    if (child.nodeType == 1) {
                        index++;
                    }
                    ret = matchIndexByAb(index, a, b, child === el);
                    if (ret !== undefined) {
                        return ret;
                    }
                }
            }
            return 0;
        },
        'nth-last-child': function (el, param) {
            var ab = getAb(param),
                a = ab.a,
                b = ab.b;
            if (a == 0 && b == 0) {
                return 0;
            }
            var index = 0,
                parent = el.parentNode;
            if (parent) {
                var childNodes = parent.childNodes,
                    len = childNodes.length,
                    count = len - 1,
                    child,
                    ret;
                for (; count >= 0; count--) {
                    child = childNodes[count];
                    if (child.nodeType == 1) {
                        index++;
                    }
                    ret = matchIndexByAb(index, a, b, child === el);
                    if (ret !== undefined) {
                        return ret;
                    }
                }
            }
            return 0;
        },
        'nth-of-type': function (el, param) {
            var ab = getAb(param),
                a = ab.a,
                b = ab.b;
            if (a == 0 && b == 0) {
                return 0;
            }
            var index = 0,
                parent = el.parentNode;
            if (parent) {
                var childNodes = parent.childNodes,
                    elType = el.tagName,
                    count = 0,
                    child,
                    ret,
                    len = childNodes.length;
                for (; count < len; count++) {
                    child = childNodes[count];
                    if (child.tagName == elType) {
                        index++;
                    }
                    ret = matchIndexByAb(index, a, b, child === el);
                    if (ret !== undefined) {
                        return ret;
                    }
                }
            }
            return 0;
        },
        'nth-last-of-type': function (el, param) {
            var ab = getAb(param),
                a = ab.a,
                b = ab.b;
            if (a == 0 && b == 0) {
                return 0;
            }
            var index = 0,
                parent = el.parentNode;
            if (parent) {
                var childNodes = parent.childNodes,
                    len = childNodes.length,
                    elType = el.tagName,
                    count = len - 1,
                    child,
                    ret;
                for (; count >= 0; count--) {
                    child = childNodes[count];
                    if (child.tagName == elType) {
                        index++;
                    }
                    ret = matchIndexByAb(index, a, b, child === el);
                    if (ret !== undefined) {
                        return ret;
                    }
                }
            }
            return 0;
        },
        'lang': function (el, lang) {
            var elLang;
            do {
                if (elLang = el.lang) {
                    elLang = elLang.toLowerCase();
                    return elLang === lang || elLang.indexOf(lang + "-") === 0;
                }
            } while ((el = el.parentNode) && el.nodeType === 1);
            return 0;
        },
        'not': function (el, negation_arg) {
            return !matchExpr[negation_arg.t](el, negation_arg.value);
        }
    };

    var pseudoIdentExpr = {
        'empty': function (el) {
            var childNodes = el.childNodes,
                index = 0,
                len = childNodes.length - 1,
                child,
                nodeType;
            for (; index < len; index++) {
                child = childNodes[index];
                nodeType = child.nodeType;
                // only element nodes and content nodes
                // (such as DOM [DOM-LEVEL-3-CORE] text nodes, CDATA nodes, and entity references
                if (nodeType == 1 || nodeType == 3 || nodeType == 4 || nodeType == 5) {
                    return 0;
                }
            }
            return 1;
        },
        'root': function (el) {
            return el === el.ownerDocument.documentElement;
        },
        'first-child': function (el) {
            return pseudoFnExpr['nth-child'](el, 1);
        },
        'last-child': function (el) {
            return pseudoFnExpr['nth-last-child'](el, 1);
        },
        'first-of-type': function (el) {
            return pseudoFnExpr['nth-of-type'](el, 1);
        },
        'last-of-type': function (el) {
            return pseudoFnExpr['nth-last-of-type'](el, 1);
        },
        'only-child': function (el) {
            return pseudoIdentExpr['first-child'](el) && pseudoIdentExpr['last-child'](el);
        },
        'only-of-type': function (el) {
            return pseudoIdentExpr['first-of-type'](el) && pseudoIdentExpr['last-of-type'](el);
        },
        'focus': function (el) {
            var doc = el.ownerDocument;
            return el === doc.activeElement &&
                (!doc['hasFocus'] || doc['hasFocus']()) && !!(el.type || el.href || el.tabIndex >= 0);
        },
        'target': function (el) {
            var hash = location.hash;
            return hash && hash.slice(1) === getAttrValue(el, 'id');
        },
        'enabled': function (el) {
            return !el.disabled;
        },
        'disabled': function (el) {
            return el.disabled;
        },
        'checked': function (el) {
            var nodeName = el.nodeName.toLowerCase();
            return (nodeName === "input" && el.checked) || (nodeName === "option" && el.selected);
        }
    };

    var attribExpr = {
        '~=': function (elValue, value) {
            return (' ' + elValue + ' ').indexOf(' ' + value + ' ') != -1;
        },
        '|=': function (elValue, value) {
            return (' ' + elValue).indexOf(' ' + value + '-') != -1;
        },
        '^=': function (elValue, value) {
            return S.startsWith(elValue, value);
        },
        '$=': function (elValue, value) {
            return S.endsWith(elValue, value);
        },
        '*=': function (elValue, value) {
            return elValue.indexOf(value) != -1;
        },
        '=': function (elValue, value) {
            return elValue === value;
        }
    };

    var matchExpr = {
        'tag': function (el, value) {
            return value == '*' || el.nodeName.toLowerCase() == value.toLowerCase();
        },
        'cls': function (el, value) {
            return (' ' + el.className + ' ').indexOf(' ' + value + ' ') != -1;
        },
        'id': function (el, value) {
            return getAttrValue(el, 'id') === value;
        },
        'attrib': function (el, value) {
            var elValue = getAttrValue(el, value.ident);
            var match = value.match;
            if (!match && elValue !== null) {
                return 1;
            } else if (match) {
                if (elValue === null) {
                    return 0;
                }
                var matchFn = attribExpr[match];
                if (matchFn) {
                    return matchFn(elValue, value);
                }
            }
            return 0;
        },
        'pseudo': function (el, value) {
            var fn, ident;
            if (fn = value.fn) {
                return pseudoFnExpr[fn](el, value.param)
            }
            if (ident = value.ident) {
                return pseudoIdentExpr[ident](el);
            }
            return 0;
        }
    };

    var relativeExpr = {
        '>': {
            dir: 'parentNode',
            immediate: 1
        },
        ' ': {
            dir: 'parentNode'
        },
        '+': {
            dir: 'previousSibling',
            immediate: 1
        },
        '~': {
            dir: 'previousSibling'
        }
    };

    DOM._compareNodeOrder = function (a, b) {
        return a.sourceIndex - b.sourceIndex;
    };

    function matches(str, seeds) {
        return DOM._selectInternal(str, null, seeds);
    }

    DOM._matchesInternal = matches;

    function singleMatch(el, match) {
        var matched = 1,
            matchSuffix = match.suffix,
            matchSuffixLen,
            matchSuffixIndex;

        if (match.t == 'tag') {
            matched &= matchExpr['tag'](el, match.value);
        }

        if (matched && matchSuffix) {
            matchSuffixLen = matchSuffix.length;
            matchSuffixIndex = 0;
            for (; matched && matchSuffixIndex < matchSuffixLen; matchSuffixIndex++) {
                var singleMatchSuffix = matchSuffix[matchSuffixIndex],
                    singleMatchSuffixType = singleMatchSuffix.t;
                if (matchExpr[singleMatchSuffixType]) {
                    matched &= matchExpr[singleMatchSuffixType](el, singleMatchSuffix.value);
                }
            }
        }

        return matched;
    }

    // x y y z
    // x > y z

    // ---------------

    // x q y q y z
    // x y > q y > z

    // ---------------

    // x y q y q y z
    // x > y > q y > z


    // --------------------------
    // x > y + q y+q y>z
    // x>y+q y>z
    function foundMatchFromHead(el, head, limitMatch) {
        // no need to match head
        var curMatch = head.prev;
        var originalLimitMatch = limitMatch;
        // x y y z
        // x y > z
        // ------------
        // x y q y q y z
        // x>y>q y>z
        while (curMatch && relativeExpr[curMatch.nextCombinator].immediate) {
            curMatch = curMatch.prev;
        }
        while (limitMatch && relativeExpr[limitMatch.nextCombinator].immediate) {
            limitMatch = limitMatch.next;
        }
        if (!limitMatch || !curMatch) {
            return 0;
        }
        if (limitMatch.order > curMatch.order) {
            return 0;
        }
        if (limitMatch != originalLimitMatch) {
            limitMatch = limitMatch.prev;
        }
        //  dichotomy algorithm?
        while (curMatch && curMatch != limitMatch) {
            if (singleMatch(el, curMatch)) {
                return curMatch.prev;
            }
            curMatch = curMatch.prev;
        }
        return 0;
    }

    function select(str, context, seeds) {

        if (!caches[str]) {
            caches[str] = parser.parse(str);
        }

        var selector = caches[str],
            groupIndex = 0,
            groupLen = selector.length,
            group,
            isContextXML,
            ret = [];

        context = context || document;

        isContextXML = isXML(context);

        for (; groupIndex < groupLen; groupIndex++) {

            group = selector[groupIndex];

            var suffix = group.suffix,
                suffixIndex,
                suffixLen,
                seedsIndex,
                seedsLen,
                id = null;

            if (!seeds) {
                if (suffix && !isContextXML) {
                    suffixIndex = 0;
                    suffixLen = suffix.length;
                    for (; suffixIndex < suffixLen; suffixIndex++) {
                        var singleSuffix = suffix[suffixIndex];
                        if (singleSuffix.t == 'id') {
                            id = singleSuffix.value;
                            break;
                        }
                    }
                }

                if (id) {
                    // id bug
                    // https://github.com/kissyteam/kissy/issues/67
                    var contextNotInDom = (context != document && !document.contains(context)),
                        tmp = contextNotInDom ? null : document.getElementById(id);
                    if (contextNotInDom || getAttrValue(tmp, 'id') != id) {
                        var tmps = getElementsByTagName('*', context),
                            tmpLen = tmps.length,
                            tmpI = 0;
                        for (; tmpI < tmpLen; tmpI++) {
                            tmp = tmps[tmpI];
                            if (getAttrValue(tmp, 'id') == id) {
                                seeds = [tmp];
                                break;
                            }
                        }
                        if (tmpI === tmpLen) {
                            seeds = [];
                        }
                    } else {
                        if (context !== document && tmp) {
                            tmp = context.contains(tmp) ? tmp : null;
                        }
                        if (tmp) {
                            seeds = [tmp];
                        } else {
                            seeds = [];
                        }
                    }
                } else {
                    seeds = getElementsByTagName(group.value || '*', context);
                }
            }

            seedsIndex = 0;
            seedsLen = seeds.length;

            if (!seedsLen) {
                continue;
            }

            for (; seedsIndex < seedsLen; seedsIndex++) {
                var el = seeds[seedsIndex],
                    seed = el,
                    match = group;

                while (el) {
                    var matched = singleMatch(el, match);

                    var nextRelativeOp = relativeExpr[match.nextCombinator];

                    // seed == original === !nextRelativeOp
                    if (el == seed && !matched) {
                        break;
                    }

                    if (matched) {
                        match = match.prev;
                        if (match) {
                            el = el[relativeExpr[match.nextCombinator].dir];
                        } else {
                            break;
                        }
                    } else {
                        // retreat
                        if (nextRelativeOp.immediate) {
                            var nextMatch = foundMatchFromHead(el, group, match);
                            // x y q n n y q y z
                            // x>y>q y>z
                            if (nextMatch === 0) {
                                // has to continue
                                el = el[nextRelativeOp.dir];
                            } else {
                                // x y y z
                                // x>y z
                                match = nextMatch;
                                el = el[relativeExpr[match.nextCombinator].dir];
                            }
                        } else {
                            el = el[nextRelativeOp.dir];
                        }
                    }
                }

                // no match remains
                if (!match) {
                    ret.push(seed);
                }
            }
        }

        return ret;
    }

    DOM._selectInternal = select;

    return {
        select: select,
        matches: matches
    };

}, {
    requires: ['./parser', 'dom/base']
});
/**
 * refer
 *  - http://www.w3.org/TR/selectors/
 *  - http://www.impressivewebs.com/browser-support-css3-selectors/
 *  - http://blogs.msdn.com/ie/archive/2010/05/13/the-css-corner-css3-selectors.aspx
 *  - http://sizzlejs.com/
 */