/**
 * @ignore
 * traversal ie hack
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S,require) {
    var Dom = require('dom/base');
    Dom._contains = function (a, b) {
        if (a.nodeType === Dom.NodeType.DOCUMENT_NODE) {
            a = a.documentElement;
        }
        // !a.contains => a===document || text
        // 注意原生 contains 判断时 a===b 也返回 true
        b = b.parentNode;

        if (a === b) {
            return true;
        }

        // when b is document, a.contains(b) 不支持的接口 in ie
        if (b && b.nodeType === Dom.NodeType.ELEMENT_NODE) {
            return a.contains && a.contains(b);
        } else {
            return false;
        }
    };

    var div = document.createElement('div');
    div.appendChild(document.createComment(''));

    var getElementsByTagName;

    if (div.getElementsByTagName('*').length) {
        getElementsByTagName = function (name, context) {
            var nodes = context.getElementsByTagName(name),
                needsFilter = name === '*';
            // <input id='length'>
            if (needsFilter || typeof nodes.length !== 'number') {
                var ret = [],
                    i = 0,
                    el;
                while ((el = nodes[i++])) {
                    if (!needsFilter || el.nodeType === 1) {
                        ret.push(el);
                    }
                }
                return ret;
            } else {
                return nodes;
            }
        };
    } else {
        getElementsByTagName = function (name, context) {
            return context.getElementsByTagName(name);
        };
    }

    Dom._getElementsByTagName = getElementsByTagName;

    var getAttr = Dom._getSimpleAttr;
    Dom._getElementById = function (id, doc) {
        var el = doc.getElementById(id);
        if (el && getAttr(el, 'id') !== id) {
            var children = getElementsByTagName('*', doc);
            for (var i = 0, l = children.length; i < l; i++) {
                if (getAttr(children[i], 'id') === id) {
                    return children[i];
                }
            }
        }
        return el;
    };
});