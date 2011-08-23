/**
 * @module  dom-insertion
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add('dom/insertion', function(S, DOM) {

    var PARENT_NODE = 'parentNode',
        NEXT_SIBLING = 'nextSibling';

    var nl2frag = DOM._nl2frag;


    // fragment is easier than nodelist
    function insertion(newNodes, refNodes, fn) {
        newNodes = DOM.query(newNodes);
        refNodes = DOM.query(refNodes);
        if (!newNodes.length || !refNodes.length) {
            return;
        }
        var newNode = nl2frag(newNodes),
            cloneNode;
        //fragment 一旦插入里面就空了，先复制下
        if (refNodes.length > 1) {
            cloneNode = newNode.cloneNode(true);
        }
        for (var i = 0; i < refNodes.length; i++) {
            var refNode = refNodes[i];
            //refNodes 超过一个，clone
            var node = i > 0 ? DOM.clone(cloneNode, true) : newNode;
            fn(node, refNode);
        }
    }

    S.mix(DOM, {

        /**
         * Inserts the new node as the previous sibling of the reference node.
         */
        insertBefore: function(newNodes, refNodes) {
            insertion(newNodes, refNodes, function(newNode, refNode) {
                if (refNode[PARENT_NODE]) {
                    refNode[PARENT_NODE].insertBefore(newNode, refNode);
                }
            });
        },

        /**
         * Inserts the new node as the next sibling of the reference node.
         */
        insertAfter: function(newNodes, refNodes) {
            insertion(newNodes, refNodes, function(newNode, refNode) {
                if (refNode[PARENT_NODE]) {
                    refNode[PARENT_NODE].insertBefore(newNode, refNode[NEXT_SIBLING]);
                }
            });
        },

        /**
         * Inserts the new node as the last child.
         */
        appendTo: function(newNodes, parents) {
            insertion(newNodes, parents, function(newNode, parent) {
                parent.appendChild(newNode);
            });
        },

        /**
         * Inserts the new node as the first child.
         */
        prependTo:function(newNodes, parents) {
            insertion(newNodes, parents, function(newNode, parent) {
                parent.insertBefore(newNode, parent.firstChild);
            });
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
    requires:["./create"]
});

/**
 * 2011-05-25
 *  - 承玉：参考 jquery 处理多对多的情形 :http://api.jquery.com/append/
 *      DOM.append(".multi1",".multi2");
 *
 */
