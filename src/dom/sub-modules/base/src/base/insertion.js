/**
 * @ignore
 * dom-insertion
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 */
KISSY.add(function (S,require) {
    var Dom = require('./api');
    var PARENT_NODE = 'parentNode',
        NodeType = Dom.NodeType,
        RE_FORM_EL = /^(?:button|input|object|select|textarea)$/i,
        getNodeName = Dom.nodeName,
        makeArray = S.makeArray,
        splice = [].splice,
        NEXT_SIBLING = 'nextSibling',
        R_SCRIPT_TYPE = /\/(java|ecma)script/i;

    function isJs(el) {
        return !el.type || R_SCRIPT_TYPE.test(el.type);
    }

    // extract script nodes and execute alone later
    function filterScripts(nodes, scripts) {
        var ret = [], i, el, nodeName;
        for (i = 0; nodes[i]; i++) {
            el = nodes[i];
            nodeName = getNodeName(el);
            if (el.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE) {
                ret.push.apply(ret, filterScripts(makeArray(el.childNodes), scripts));
            } else if (nodeName === 'script' && isJs(el)) {
                // remove script to make sure ie9 does not invoke when append
                if (el.parentNode) {
                    el.parentNode.removeChild(el);
                }
                if (scripts) {
                    scripts.push(el);
                }
            } else {
                if (el.nodeType === NodeType.ELEMENT_NODE &&
                    // ie checkbox getElementsByTagName 后造成 checked 丢失
                    !RE_FORM_EL.test(nodeName)) {
                    var tmp = [],
                        s,
                        j,
                        ss = el.getElementsByTagName('script');
                    for (j = 0; j < ss.length; j++) {
                        s = ss[j];
                        if (isJs(s)) {
                            tmp.push(s);
                        }
                    }
                    splice.apply(nodes, [i + 1, 0].concat(tmp));
                }
                ret.push(el);
            }
        }
        return ret;
    }

    // execute script
    function evalScript(el) {
        if (el.src) {
            S.getScript(el.src);
        } else {
            var code = S.trim(el.text || el.textContent || el.innerHTML || '');
            if (code) {
                S.globalEval(code);
            }
        }
    }

    // fragment is easier than nodelist
    function insertion(newNodes, refNodes, fn, scripts) {
        newNodes = Dom.query(newNodes);

        if (scripts) {
            scripts = [];
        }

        // filter script nodes ,process script separately if needed
        newNodes = filterScripts(newNodes, scripts);

        // Resets defaultChecked for any radios and checkboxes
        // about to be appended to the Dom in IE 6/7
        if (Dom._fixInsertionChecked) {
            Dom._fixInsertionChecked(newNodes);
        }

        refNodes = Dom.query(refNodes);

        var newNodesLength = newNodes.length,
            newNode,
            i,
            refNode,
            node,
            clonedNode,
            refNodesLength = refNodes.length;

        if ((!newNodesLength && (!scripts || !scripts.length)) || !refNodesLength) {
            return;
        }

        // fragment 插入速度快点
        // 而且能够一个操作达到批量插入
        // refer: http://www.w3.org/TR/REC-Dom-Level-1/level-one-core.html#ID-B63ED1A3
        newNode = Dom._nodeListToFragment(newNodes);
        //fragment 一旦插入里面就空了，先复制下
        if (refNodesLength > 1) {
            clonedNode = Dom.clone(newNode, true);
            refNodes = S.makeArray(refNodes);
        }

        for (i = 0; i < refNodesLength; i++) {
            refNode = refNodes[i];
            if (newNode) {
                //refNodes 超过一个，clone
                node = i > 0 ? Dom.clone(clonedNode, true) : newNode;
                fn(node, refNode);
            }
            if (scripts && scripts.length) {
                S.each(scripts, evalScript);
            }
        }
    }

    // loadScripts default to false to prevent xss
    S.mix(Dom,
        /**
         * @override KISSY.DOM
         * @class
         * @singleton
         */
        {

            _fixInsertionChecked: null,

            /**
             * Insert every element in the set of newNodes before every element in the set of refNodes.
             * @param {HTMLElement|HTMLElement[]} newNodes Nodes to be inserted
             * @param {HTMLElement|HTMLElement[]|String} refNodes Nodes to be referred
             * @param {Boolean} [loadScripts] whether execute script node
             */
            insertBefore: function (newNodes, refNodes, loadScripts) {
                insertion(newNodes, refNodes, function (newNode, refNode) {
                    if (refNode[PARENT_NODE]) {
                        refNode[PARENT_NODE].insertBefore(newNode, refNode);
                    }
                }, loadScripts);
            },

            /**
             * Insert every element in the set of newNodes after every element in the set of refNodes.
             * @param {HTMLElement|HTMLElement[]} newNodes Nodes to be inserted
             * @param {HTMLElement|HTMLElement[]|String} refNodes Nodes to be referred
             * @param {Boolean} [loadScripts] whether execute script node
             */
            insertAfter: function (newNodes, refNodes, loadScripts) {
                insertion(newNodes, refNodes, function (newNode, refNode) {
                    if (refNode[PARENT_NODE]) {
                        refNode[PARENT_NODE].insertBefore(newNode, refNode[NEXT_SIBLING]);
                    }
                }, loadScripts);
            },

            /**
             * Insert every element in the set of newNodes to the end of every element in the set of parents.
             * @param {HTMLElement|HTMLElement[]} newNodes Nodes to be inserted
             * @param {HTMLElement|HTMLElement[]|String} parents Nodes to be referred as parentNode
             * @param {Boolean} [loadScripts] whether execute script node
             */
            appendTo: function (newNodes, parents, loadScripts) {
                insertion(newNodes, parents, function (newNode, parent) {
                    parent.appendChild(newNode);
                }, loadScripts);
            },

            /**
             * Insert every element in the set of newNodes to the beginning of every element in the set of parents.
             * @param {HTMLElement|HTMLElement[]} newNodes Nodes to be inserted
             * @param {HTMLElement|HTMLElement[]|String} parents Nodes to be referred as parentNode
             * @param {Boolean} [loadScripts] whether execute script node
             */
            prependTo: function (newNodes, parents, loadScripts) {
                insertion(newNodes, parents, function (newNode, parent) {
                    parent.insertBefore(newNode, parent.firstChild);
                }, loadScripts);
            },

            /**
             * Wrap a node around all elements in the set of matched elements
             * @param {HTMLElement|HTMLElement[]|String} wrappedNodes set of matched elements
             * @param {HTMLElement|String} wrapperNode html node or selector to get the node wrapper
             */
            wrapAll: function (wrappedNodes, wrapperNode) {
                // deep clone
                wrapperNode = Dom.clone(Dom.get(wrapperNode), true);
                wrappedNodes = Dom.query(wrappedNodes);
                if (wrappedNodes[0].parentNode) {
                    Dom.insertBefore(wrapperNode, wrappedNodes[0]);
                }
                var c;
                while ((c = wrapperNode.firstChild) && c.nodeType === 1) {
                    wrapperNode = c;
                }
                Dom.appendTo(wrappedNodes, wrapperNode);
            },

            /**
             * Wrap a node around each element in the set of matched elements
             * @param {HTMLElement|HTMLElement[]|String} wrappedNodes set of matched elements
             * @param {HTMLElement|String} wrapperNode html node or selector to get the node wrapper
             */
            wrap: function (wrappedNodes, wrapperNode) {
                wrappedNodes = Dom.query(wrappedNodes);
                wrapperNode = Dom.get(wrapperNode);
                S.each(wrappedNodes, function (w) {
                    Dom.wrapAll(w, wrapperNode);
                });
            },

            /**
             * Wrap a node around the childNodes of each element in the set of matched elements.
             * @param {HTMLElement|HTMLElement[]|String} wrappedNodes set of matched elements
             * @param {HTMLElement|String} wrapperNode html node or selector to get the node wrapper
             */
            wrapInner: function (wrappedNodes, wrapperNode) {
                wrappedNodes = Dom.query(wrappedNodes);
                wrapperNode = Dom.get(wrapperNode);
                S.each(wrappedNodes, function (w) {
                    var contents = w.childNodes;
                    if (contents.length) {
                        Dom.wrapAll(contents, wrapperNode);
                    } else {
                        w.appendChild(wrapperNode);
                    }
                });
            },

            /**
             * Remove the parents of the set of matched elements from the Dom,
             * leaving the matched elements in their place.
             * @param {HTMLElement|HTMLElement[]|String} wrappedNodes set of matched elements
             */
            unwrap: function (wrappedNodes) {
                wrappedNodes = Dom.query(wrappedNodes);
                S.each(wrappedNodes, function (w) {
                    var p = w.parentNode;
                    Dom.replaceWith(p, p.childNodes);
                });
            },

            /**
             * Replace each element in the set of matched elements with the provided newNodes.
             * @param {HTMLElement|HTMLElement[]|String} selector set of matched elements
             * @param {HTMLElement|HTMLElement[]|String} newNodes new nodes to replace the matched elements
             */
            replaceWith: function (selector, newNodes) {
                var nodes = Dom.query(selector);
                newNodes = Dom.query(newNodes);
                Dom.remove(newNodes, true);
                Dom.insertBefore(newNodes, nodes);
                Dom.remove(nodes);
            }
        });
    S.each({
        'prepend': 'prependTo',
        'append': 'appendTo',
        'before': 'insertBefore',
        'after': 'insertAfter'
    }, function (value, key) {
        Dom[key] = Dom[value];
    });
    return Dom;
});

/*
 2012-04-05 yiminghe@gmail.com
 - 增加 replaceWith/wrap/wrapAll/wrapInner/unwrap

 2011-05-25
 - yiminghe@gmail.com：参考 jquery 处理多对多的情形 :http://api.jquery.com/append/
 Dom.append('.multi1','.multi2');

 */
