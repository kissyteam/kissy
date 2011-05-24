/**
 * @module  dom-insertion
 * @author  lifesinger@gmail.com
 */
KISSY.add('dom/insertion', function(S, DOM) {

    var PARENT_NODE = 'parentNode',
        NEXT_SIBLING = 'nextSibling';

    S.mix(DOM, {

            /**
             * Inserts the new node as the previous sibling of the reference node.
             * @return {HTMLElement} The node that was inserted (or null if insert fails)
             */
            insertBefore: function(newNodes, refNode) {
                newNodes = DOM.query(newNodes);
                if (refNode = DOM.get(refNode) && refNode[PARENT_NODE]) {
                    newNodes.each(function(newNode) {
                        refNode[PARENT_NODE].insertBefore(newNode, refNode);
                    });
                }
            },

            /**
             * Inserts the new node as the next sibling of the reference node.
             * @return {HTMLElement} The node that was inserted (or null if insert fails)
             */
            insertAfter: function(newNodes, refNode) {
                newNodes = DOM.query(newNodes);
                if (refNode = DOM.get(refNode) && refNode[PARENT_NODE]) {
                    newNodes.each(function(newNode) {
                        refNode[PARENT_NODE].insertBefore(newNode, refNode[NEXT_SIBLING]);
                    });
                }
            },

            /**
             * Inserts the new node as the last child.
             */
            append: function(nodes, parent) {
                nodes = DOM.query(nodes);
                if (parent = DOM.get(parent)) {
                    if (parent.appendChild) {
                        nodes.each(function(node) {
                            parent.appendChild(node);
                        });
                    }
                }
            },

            /**
             * Inserts the new node as the first child.
             */
            prepend:function(nodes, parent) {
                nodes = DOM.query(nodes);
                if (parent = DOM.get(parent)) {
                    nodes.each(function(node) {
                        parent.insertBefore(node, parent.firstChild);
                    });
                }
            }
        });
    DOM.prependTo = DOM.prepend;
    DOM.appendTo = DOM.append;
    return DOM;
}, {
        requires:["dom/base"]
    });

/**
 * NOTES:
 *  - appendChild/removeChild/replaceChild 直接用原生的
 *  - append/appendTo, prepend/prependTo, wrap/unwrap 放在 Node 里
 *
 */
