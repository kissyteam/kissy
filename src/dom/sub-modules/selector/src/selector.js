/**
 * css3 selector engine for ie6-8
 * @author yiminghe@gmail.com
 */
KISSY.add('dom/selector', function (S, parser, DOM) {

    S.log('use KISSY css3 selector');

    // ident === identifier

    var document = S.Env.host.document,
        EXPANDO_SELECTOR_KEY = '_ks_data_selector_id_',
        caches = {},
        isContextXML,
        uuid = 0,
        subMatchesCache = {},
        getAttr = DOM._getAttr,
        hasSingleClass = DOM._hasSingleClass,
        isTag = DOM._isTag,
        aNPlusB = /^(([+-]?(?:\d+)?)?n)?([+-]?\d+)?$/;

    // CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
    var unescape = /\\([\da-fA-F]{1,6}[\x20\t\r\n\f]?|.)/g,
        unescapeFn = function (_, escaped) {
            var high = "0x" + escaped - 0x10000;
            // NaN means non-codepoint
            return isNaN(high) ?
                escaped :
                // BMP codepoint
                high < 0 ?
                    String.fromCharCode(high + 0x10000) :
                    // Supplemental Plane codepoint (surrogate pair)
                    String.fromCharCode(high >> 10 | 0xD800, high & 0x3FF | 0xDC00);
        };

    function unEscape(str) {
        return str.replace(unescape, unescapeFn);
    }

    parser.lexer.yy = {
        unEscape: unEscape,
        unEscapeStr: function (str) {
            return this.unEscape(str.slice(1, -1));
        }
    };

    function resetStatus() {
        subMatchesCache = {};
    }

    function dir(el, dir) {
        do {
            el = el[dir];
        } while (el && el.nodeType != 1);
        return el;
    }

    function getElementsByTagName(name, context) {
        var nodes = context.getElementsByTagName(name),
            needFilter = name == '*',
            ret = [],
            i = 0,
            el;
        while (el = nodes[i++]) {
            if (!needFilter || el.nodeType === 1) {
                ret.push(el);
            }
        }
        return ret;
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
        } else if (match = param.replace(/\s/g, '').match(aNPlusB)) {
            if (match[1]) {
                a = parseInt(match[2]);
                if (isNaN(a)) {
                    if (match[2] == '-') {
                        a = -1;
                    } else {
                        a = 1;
                    }
                }
            } else {
                a = 0;
            }
            b = parseInt(match[3]) || 0;
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
            lang = unEscape(lang.toLowerCase());
            do {
                if (elLang = (isContextXML ?
                    el.getAttribute("xml:lang") || el.getAttribute("lang") :
                    el.lang)) {
                    elLang = elLang.toLowerCase();
                    return elLang === lang || elLang.indexOf(lang + "-") === 0;
                }
            } while ((el = el.parentNode) && el.nodeType === 1);
            return false;
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
            return hash && hash.slice(1) === getAttr(el, 'id');
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
            if (!value || value.indexOf(' ') > -1) {
                return 0;
            }
            return (' ' + elValue + ' ').indexOf(' ' + value + ' ') != -1;
        },
        '|=': function (elValue, value) {
            return (' ' + elValue).indexOf(' ' + value + '-') != -1;
        },
        '^=': function (elValue, value) {
            return value && S.startsWith(elValue, value);
        },
        '$=': function (elValue, value) {
            return value && S.endsWith(elValue, value);
        },
        '*=': function (elValue, value) {
            return value && elValue.indexOf(value) != -1;
        },
        '=': function (elValue, value) {
            return elValue === value;
        }
    };

    var matchExpr = {
        'tag': isTag,
        'cls': hasSingleClass,
        'id': function (el, value) {
            return getAttr(el, 'id') === value;
        },
        'attrib': function (el, value) {
            var name = value.ident;
            if (!isContextXML) {
                name = name.toLowerCase();
            }
            var elValue = getAttr(el, name);
            var match = value.match;
            if (!match && elValue !== undefined) {
                return 1;
            } else if (match) {
                if (elValue === undefined) {
                    return 0;
                }
                var matchFn = attribExpr[match];
                if (matchFn) {
                    return matchFn(elValue + '', value.value + '');
                }
            }
            return 0;
        },
        'pseudo': function (el, value) {
            var fn, fnStr, ident;
            if (fnStr = value.fn) {
                if (!(fn = pseudoFnExpr[fnStr])) {
                    throw new SyntaxError('Syntax error: not support pseudo: ' + fnStr);
                }
                return fn(el, value.param)
            }
            if (ident = value.ident) {
                if (!pseudoIdentExpr[ident]) {
                    throw new SyntaxError('Syntax error: not support pseudo: ' + ident);
                }
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

    if ('sourceIndex' in document.documentElement) {
        DOM._compareNodeOrder = function (a, b) {
            return a.sourceIndex - b.sourceIndex;
        };
    }

    function matches(str, seeds) {
        return DOM._selectInternal(str, null, seeds);
    }

    DOM._matchesInternal = matches;

    function singleMatch(el, match) {
        if (!match) {
            return true;
        }
        if (!el) {
            return false;
        }

        if (el.nodeType === 9) {
            return false;
        }

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

    // match by adjacent immediate single selector match
    function matchImmediate(el, match) {
        var matched = 1,
            startEl = el,
            relativeOp,
            startMatch = match;

        do {
            matched &= singleMatch(el, match);
            if (matched) {
                // advance
                match = match && match.prev;
                if (!match) {
                    return true;
                }
                relativeOp = relativeExpr[match.nextCombinator];
                el = dir(el, relativeOp.dir);
                if (!relativeOp.immediate) {
                    return {
                        // advance for non-immediate
                        el: el,
                        match: match
                    }
                }
            } else {
                relativeOp = relativeExpr[match.nextCombinator];
                if (relativeOp.immediate) {
                    // retreat but advance startEl
                    return {
                        el: dir(startEl, relativeExpr[startMatch.nextCombinator].dir),
                        match: startMatch
                    };
                } else {
                    // advance (before immediate match + jump unmatched)
                    return {
                        el: el && dir(el, relativeOp.dir),
                        match: match
                    }
                }
            }
        } while (el);

        // only occur when match immediate
        return {
            el: dir(startEl, relativeExpr[startMatch.nextCombinator].dir),
            match: startMatch
        };
    }

    // find fixed part, fixed with seeds
    function findFixedMatchFromHead(el, head) {
        var relativeOp,
            cur = head;

        do {
            if (!singleMatch(el, cur)) {
                return null;
            }
            cur = cur.prev;
            if (!cur) {
                return true;
            }
            relativeOp = relativeExpr[cur.nextCombinator];
            el = dir(el, relativeOp.dir);
        } while (el && relativeOp.immediate);
        if (!el) {
            return null;
        }
        return {
            el: el,
            match: cur
        };
    }

    function genId(el) {
        var selectorId;

        if (isContextXML) {
            if (!(selectorId = el.getAttribute(EXPANDO_SELECTOR_KEY))) {
                el.setAttribute(EXPANDO_SELECTOR_KEY, selectorId = (+new Date() + '_' + (++uuid)));
            }
        } else {
            if (!(selectorId = el[EXPANDO_SELECTOR_KEY])) {
                selectorId = el[EXPANDO_SELECTOR_KEY] = (+new Date()) + '_' + (++uuid);
            }
        }

        return selectorId;
    }

    function matchSub(el, match) {
        var selectorId = genId(el),
            matchKey;
        matchKey = selectorId + '_' + (match.order || 0);
        if (matchKey in subMatchesCache) {
            return subMatchesCache[matchKey];
        }
        return subMatchesCache[matchKey] = matchSubInternal(el, match);
    }

    // recursive match by sub selector string from right to left grouped by immediate selectors
    function matchSubInternal(el, match) {
        var matchImmediateRet = matchImmediate(el, match);
        if (matchImmediateRet === true) {
            return true;
        } else {
            el = matchImmediateRet.el;
            match = matchImmediateRet.match;
            while (el) {
                if (matchSub(el, match)) {
                    return true;
                }
                el = dir(el, relativeExpr[match.nextCombinator].dir);
            }
            return false;
        }
    }

    function select(str, context, seeds) {
        if (!caches[str]) {
            caches[str] = parser.parse(str);
        }

        var selector = caches[str],
            groupIndex = 0,
            groupLen = selector.length,
            group,
            ret = [];

        if (seeds) {
            context = context || seeds[0].ownerDocument;
        }
        context = context || document;

        isContextXML = isXML(context);

        for (; groupIndex < groupLen; groupIndex++) {

            resetStatus();

            group = selector[groupIndex];

            var suffix = group.suffix,
                suffixIndex,
                suffixLen,
                seedsIndex,
                mySeeds = seeds,
                seedsLen,
                id = null;

            if (!mySeeds) {
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
                    var contextNotInDom = (context != document && !DOM._contains(document, context)),
                        tmp = contextNotInDom ? null : document.getElementById(id);
                    if (contextNotInDom || getAttr(tmp, 'id') != id) {
                        var tmps = getElementsByTagName('*', context),
                            tmpLen = tmps.length,
                            tmpI = 0;
                        for (; tmpI < tmpLen; tmpI++) {
                            tmp = tmps[tmpI];
                            if (getAttr(tmp, 'id') == id) {
                                mySeeds = [tmp];
                                break;
                            }
                        }
                        if (tmpI === tmpLen) {
                            mySeeds = [];
                        }
                    } else {
                        if (context !== document && tmp) {
                            tmp = DOM._contains(context, tmp) ? tmp : null;
                        }
                        if (tmp) {
                            mySeeds = [tmp];
                        } else {
                            mySeeds = [];
                        }
                    }
                } else {
                    mySeeds = getElementsByTagName(group.value || '*', context);
                }
            }

            seedsIndex = 0;
            seedsLen = mySeeds.length;

            if (!seedsLen) {
                continue;
            }

            for (; seedsIndex < seedsLen; seedsIndex++) {
                var seed = mySeeds[seedsIndex];
                var matchHead = findFixedMatchFromHead(seed, group);
                if (matchHead === true) {
                    ret.push(seed);
                } else if (matchHead) {
                    if (matchSub(matchHead.el, matchHead.match)) {
                        ret.push(seed);
                    }
                }
            }
        }

        if (groupLen > 1) {
            ret = DOM.unique(ret);
        }

        return ret;
    }

    DOM._selectInternal = select;

    return {
        select: select,
        matches: matches
    };

}, {
    requires: ['./selector/parser', 'dom/base', 'dom/ie']
});
/**
 * note 2013-03-28
 *  - use recursive call to replace backtracking algorithm
 *
 * refer
 *  - http://www.w3.org/TR/selectors/
 *  - http://www.impressivewebs.com/browser-support-css3-selectors/
 *  - http://blogs.msdn.com/ie/archive/2010/05/13/the-css-corner-css3-selectors.aspx
 *  - http://sizzlejs.com/
 */