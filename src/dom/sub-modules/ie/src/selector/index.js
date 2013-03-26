/**
 * css3 selector engine for ie6-8
 * @author yiminghe@gmail.com
 */
KISSY.add('dom/ie/selector/index', function (S, parser) {

    // ident === identifier

    var document = S.Env.host.document;

    function getAttrValue(el, attr) {
        var node = el.getAttributeNode(attr);
        if (!node || !node.specified) {
            return null;
        } else {
            return node.nodeValue;
        }
    }

    var n_reg = /^(?:([+-]?\d+)n)?([+-]?\d+)$/;

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
        } else if (match = param.match(n_reg)) {
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
                // only element nodes and content nodes (such as DOM [DOM-LEVEL-3-CORE] text nodes, CDATA nodes, and entity references
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
            return el === doc.activeElement && (!doc.hasFocus || doc.hasFocus()) && !!(el.type || el.href || ~el.tabIndex);
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


    return  function (str) {
        var selector = parser.parse(str),
            groupIndex = 0,
            groupLen = selector.length,
            group;

        var ret = [];


        for (; groupIndex < groupLen; groupIndex++) {

            group = selector[groupIndex];
            var suffix = group.suffix;
            var id = null;
            if (suffix) {
                var suffixIndex = 0, suffixLen = suffix.length;
                for (; suffixIndex < suffixLen; suffixIndex++) {
                    var singleSuffix = suffix[suffixIndex];
                    if (singleSuffix.t == 'id') {
                        id = singleSuffix.value;
                        break;
                    }
                }
            }

            var seeds;
            if (id) {
                seeds = [document.getElementById(id)];
            } else {
                seeds = document.getElementsByTagName(group.value || '*');
            }

            var seedsIndex = 0, seedsLen = seeds.length;

            for (; seedsIndex < seedsLen; seedsIndex++) {
                var seed = seeds[seedsIndex],
                    original = seed;
                var match = group;
                while (seed && match) {
                    var matched = 1;
                    if (match.t == 'tag') {
                        matched &= match.value == '*' || seed.nodeName.toLowerCase() == match.value.toLowerCase();
                    }

                    var matchSuffix = match.suffix;
                    if (matched && matchSuffix) {
                        var matchSuffixLen = matchSuffix.length,
                            matchSuffixIndex = 0;

                        for (; matched && matchSuffixIndex < matchSuffixLen; matchSuffixIndex++) {
                            var singleMatchSuffix = matchSuffix[matchSuffixIndex],
                                singleMatchSuffixType = singleMatchSuffix.t;
                            if (matchExpr[singleMatchSuffixType]) {
                                matched &= matchExpr[singleMatchSuffixType](seed, singleMatchSuffix.value);
                            }
                        }
                    }

                    if ((seed == original || match.nextCombinator == '>') && !matched) {
                        break;
                    }

                    seed = seed.parentNode;
                    if (matched) {
                        match = match.prev;
                    }
                }

                if (!match) {
                    ret.push(original);
                }
            }
        }
        return ret;
    };

}, {
    requires: ['./parser']
});
/**
 * refer
 *  - http://www.w3.org/TR/selectors/
 *  - http://www.impressivewebs.com/browser-support-css3-selectors/
 *  - http://blogs.msdn.com/ie/archive/2010/05/13/the-css-corner-css3-selectors.aspx
 *  - http://sizzlejs.com/
 */