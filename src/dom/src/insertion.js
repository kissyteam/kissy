/**
 * @fileOverview   dom-insertion
 * @author  yiminghe@gmail.com,lifesinger@gmail.com
 */
KISSY.add('dom/insertion', function (S, UA, DOM) {

    var PARENT_NODE = 'parentNode',
        rformEls = /^(?:button|input|object|select|textarea)$/i,
        nodeName = DOM._nodeName,
        makeArray = S.makeArray,
        splice = [].splice,
        _isElementNode = DOM._isElementNode,
        NEXT_SIBLING = 'nextSibling';

    /**
     ie 6,7 lose checked status when append to dom
     var c=S.all("<input />");
     c.attr("type","radio");
     c.attr("checked",true);
     S.all("#t").append(c);
     alert(c[0].checked);
     */
    function fixChecked(ret) {
        for (var i = 0; i < ret.length; i++) {
            var el = ret[i];
            if (el.nodeType == DOM.DOCUMENT_FRAGMENT_NODE) {
                fixChecked(el.childNodes);
            } else if (nodeName(el, "input")) {
                fixCheckedInternal(el);
            } else if (_isElementNode(el)) {
                var cs = el.getElementsByTagName("input");
                for (var j = 0; j < cs.length; j++) {
                    fixChecked(cs[j]);
                }
            }
        }
    }

    function fixCheckedInternal(el) {
        if (el.type === "checkbox" || el.type === "radio") {
            // after insert , in ie6/7 checked is decided by defaultChecked !
            el.defaultChecked = el.checked;
        }
    }

    var rscriptType = /\/(java|ecma)script/i;

    function isJs(el) {
        return !el.type || rscriptType.test(el.type);
    }

    // extract script nodes and execute alone later
    function filterScripts(nodes, scripts) {
        var ret = [], i, el, nodeName;
        for (i = 0; nodes[i]; i++) {
            el = nodes[i];
            nodeName = el.nodeName.toLowerCase();
            if (el.nodeType == DOM.DOCUMENT_FRAGMENT_NODE) {
                ret.push.apply(ret, filterScripts(makeArray(el.childNodes), scripts));
            } else if (nodeName === "script" && isJs(el)) {
                // remove script to make sure ie9 does not invoke when append
                if (el.parentNode) {
                    el.parentNode.removeChild(el)
                }
                if (scripts) {
                    scripts.push(el);
                }
            } else {
                if (_isElementNode(el) &&
                    // ie checkbox getElementsByTagName 后造成 checked 丢失
                    !rformEls.test(nodeName)) {
                    var tmp = [],
                        s,
                        j,
                        ss = el.getElementsByTagName("script");
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
            var code = S.trim(el.text || el.textContent || el.innerHTML || "");
            if (code) {
                S.globalEval(code);
            }
        }
    }

    // fragment is easier than nodelist
    function insertion(newNodes, refNodes, fn, scripts) {
        newNodes = DOM.query(newNodes);

        if (scripts) {
            scripts = [];
        }

        // filter script nodes ,process script separately if needed
        newNodes = filterScripts(newNodes, scripts);

        // Resets defaultChecked for any radios and checkboxes
        // about to be appended to the DOM in IE 6/7
        if (UA['ie'] < 8) {
            fixChecked(newNodes);
        }
        refNodes = DOM.query(refNodes);
        var newNodesLength = newNodes.length,
            refNodesLength = refNodes.length;
        if ((!newNodesLength &&
            (!scripts || !scripts.length)) ||
            !refNodesLength) {
            return;
        }
        // fragment 插入速度快点
        // 而且能够一个操作达到批量插入
        // refer: http://www.w3.org/TR/REC-DOM-Level-1/level-one-core.html#ID-B63ED1A3
        var newNode = DOM._nl2frag(newNodes),
            clonedNode;
        //fragment 一旦插入里面就空了，先复制下
        if (refNodesLength > 1) {
            clonedNode = DOM.clone(newNode, true);
            refNodes = S.makeArray(refNodes)
        }
        for (var i = 0; i < refNodesLength; i++) {
            var refNode = refNodes[i];
            if (newNodesLength) {
                //refNodes 超过一个，clone
                var node = i > 0 ? DOM.clone(clonedNode, true) : newNode;
                fn(node, refNode);
            }
            if (scripts && scripts.length) {
                S.each(scripts, evalScript);
            }
        }
    }

    // loadScripts default to false to prevent xss
    S.mix(DOM,
        /**
         * @lends DOM
         */
        {

            /**
             * Insert every element in the set of newNodes before every element in the set of refNodes.
             * @param {HTMLElement|HTMLElement[]} newNodes Nodes to be inserted
             * @param {HTMLElement|HTMLElement[]|String} refNodes Nodes to be referred
             */
            insertBefore:function (newNodes, refNodes, loadScripts) {
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
             */
            insertAfter:function (newNodes, refNodes, loadScripts) {
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
             */
            appendTo:function (newNodes, parents, loadScripts) {
                insertion(newNodes, parents, function (newNode, parent) {
                    parent.appendChild(newNode);
                }, loadScripts);
            },

            /**
             * Insert every element in the set of newNodes to the beginning of every element in the set of parents.
             * @param {HTMLElement|HTMLElement[]} newNodes Nodes to be inserted
             * @param {HTMLElement|HTMLElement[]|String} parents Nodes to be referred as parentNode
             */
            prependTo:function (newNodes, parents, loadScripts) {
                insertion(newNodes, parents, function (newNode, parent) {
                    parent.insertBefore(newNode, parent.firstChild);
                }, loadScripts);
            },

            /**
             * Wrap a node around all elements in the set of matched elements
             * @param {HTMLElement|HTMLElement[]|String} wrappedNodes set of matched elements
             * @param {HTMLElement|String} wrapperNode html node or selector to get the node wrapper
             */
            wrapAll:function (wrappedNodes, wrapperNode) {
                // deep clone
                wrapperNode = DOM.clone(DOM.get(wrapperNode), true);
                wrappedNodes = DOM.query(wrappedNodes);
                if (wrappedNodes[0].parentNode) {
                    DOM.insertBefore(wrapperNode, wrappedNodes[0]);
                }
                var c;
                while ((c = wrapperNode.firstChild) && c.nodeType == 1) {
                    wrapperNode = c;
                }
                DOM.appendTo(wrappedNodes, wrapperNode);
            },

            /**
             * Wrap a node around each element in the set of matched elements
             * @param {HTMLElement|HTMLElement[]|String} wrappedNodes set of matched elements
             * @param {HTMLElement|String} wrapperNode html node or selector to get the node wrapper
             */
            wrap:function (wrappedNodes, wrapperNode) {
                wrappedNodes = DOM.query(wrappedNodes);
                wrapperNode = DOM.get(wrapperNode);
                S.each(wrappedNodes, function (w) {
                    DOM.wrapAll(w, wrapperNode);
                });
            },

            /**
             * Wrap a node around the childNodes of each element in the set of matched elements.
             * @param {HTMLElement|HTMLElement[]|String} wrappedNodes set of matched elements
             * @param {HTMLElement|String} wrapperNode html node or selector to get the node wrapper
             */
            wrapInner:function (wrappedNodes, wrapperNode) {
                wrappedNodes = DOM.query(wrappedNodes);
                wrapperNode = DOM.get(wrapperNode);
                S.each(wrappedNodes, function (w) {
                    var contents = w.childNodes;
                    if (contents.length) {
                        DOM.wrapAll(contents, wrapperNode);
                    } else {
                        w.appendChild(wrapperNode);
                    }
                });
            },

            /**
             * Remove the parents of the set of matched elements from the DOM,
             * leaving the matched elements in their place.
             * @param {HTMLElement|HTMLElement[]|String} wrappedNodes set of matched elements
             */
            unwrap:function (wrappedNodes) {
                wrappedNodes = DOM.query(wrappedNodes);
                S.each(wrappedNodes, function (w) {
                    var p = w.parentNode;
                    DOM.replaceWith(p, p.childNodes);
                });
            },

            /**
             * Replace each element in the set of matched elements with the provided newNodes.
             * @param {HTMLElement|HTMLElement[]|String} selector set of matched elements
             * @param {HTMLElement|HTMLElement[]|String} newNodes new nodes to replace the matched elements
             */
            replaceWith:function (selector, newNodes) {
                var nodes = DOM.query(selector);
                newNodes = DOM.query(newNodes);
                DOM.remove(newNodes, true);
                DOM.insertBefore(newNodes, nodes);
                DOM.remove(nodes);
            }
        });
    var alias = {
        "prepend":"prependTo",
        "append":"appendTo",
        "before":"insertBefore",
        "after":"insertAfter"
    };
    for (var a in alias) {
        DOM[a] = DOM[alias[a]];
    }
    return DOM;
}, {
    requires:["ua", "./create"]
});

/**
 * 2012-04-05 yiminghe@gmail.com
 *  - 增加 replaceWith/wrap/wrapAll/wrapInner/unwrap
 *
 * 2011-05-25
 *  - 承玉：参考 jquery 处理多对多的情形 :http://api.jquery.com/append/
 *      DOM.append(".multi1",".multi2");
 *
 */
