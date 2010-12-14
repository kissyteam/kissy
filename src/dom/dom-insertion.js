/**
 * @module  dom-insertion
 * @author  lifesinger@gmail.com
 */
KISSY.add('dom-insertion', function(S) {

    var DOM = S.DOM,
        PARENT_NODE = 'parentNode',
        NEXT_SIBLING = 'nextSibling';

    S.mix(DOM, {

        /**
         * Inserts the new node as the previous sibling of the reference node.
         * @return {HTMLElement} The node that was inserted (or null if insert fails)
         */
        insertBefore: function(newNode, refNode) {
            if ((newNode = S.get(newNode)) && (refNode = S.get(refNode)) && refNode[PARENT_NODE]) {
                refNode[PARENT_NODE].insertBefore(newNode, refNode);
            }
            return newNode;
        },
        
        /**
         * Inserts the new node as the next sibling of the reference node.
         * @return {HTMLElement} The node that was inserted (or null if insert fails)
         */
        insertAfter: function(newNode, refNode) {
            if ((newNode = S.get(newNode)) && (refNode = S.get(refNode)) && refNode[PARENT_NODE]) {
                if (refNode[NEXT_SIBLING]) {
                    refNode[PARENT_NODE].insertBefore(newNode, refNode[NEXT_SIBLING]);
                } else {
                    refNode[PARENT_NODE].appendChild(newNode);
                }
            }
            return newNode;
        },

        /**
         * Inserts the new node as the last child.
         */
        append: function(node, parent) {
            if ((node = S.get(node)) && (parent = S.get(parent))) {
                if (parent.appendChild) {
                    parent.appendChild(node);
                }
            }
        },

        /**
         * Inserts the new node as the first child.
         */
        prepend: function(node, parent) {
            if ((node = S.get(node)) && (parent = S.get(parent))) {
                if (parent.firstChild) {
                    DOM.insertBefore(node, parent.firstChild);
                } else {
                    parent.appendChild(node);
                }
            }
        }
    });
});

/**
 * NOTES:
 *  - appendChild/removeChild/replaceChild 直接用原生的
 *  - append/appendTo, prepend/prependTo, wrap/unwrap 放在 Node 里
 *
 */
