/**
 * @ignore
 * walker implementation
 * refer: http://www.w3.org/TR/Dom-Level-2-Traversal-Range/traversal#TreeWalker
 * @author yiminghe@gmail.com
 */
/*
 Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.html or http://ckeditor.com/license
 */
KISSY.add(function (S, require) {
    var Editor = require('./base');

    var TRUE = true,
        FALSE = false,
        NULL = null,
        UA = S.UA,
        Dom = S.DOM,
        dtd = Editor.XHTML_DTD,
        Node = require('node');

    function iterate(rtl, breakOnFalseRetFalse) {
        var self = this;
        // Return NULL if we have reached the end.
        if (self._.end) {
            return NULL;
        }
        var node,
            range = self.range,
            guard,
            userGuard = self.guard,
            type = self.type,
            getSourceNodeFn = ( rtl ? '_4ePreviousSourceNode' :
                '_4eNextSourceNode' );

        // This is the first call. Initialize it.
        if (!self._.start) {
            self._.start = 1;

            // Trim text nodes and optimize the range boundaries. Dom changes
            // may happen at this point.
            range.trim();

            // A collapsed range must return NULL at first call.
            if (range.collapsed) {
                self.end();
                return NULL;
            }
        }

        // Create the LTR guard function, if necessary.
        if (!rtl && !self._.guardLTR) {
            // Gets the node that stops the walker when going LTR.
            var limitLTR = range.endContainer[0],
                blockerLTR = limitLTR.childNodes[range.endOffset];
            // 从左到右保证在 range 区间内获取 nextSourceNode
            this._.guardLTR = function (node, movingOut) {
                // 从endContainer移出去，失败返回false
                if (movingOut && (limitLTR === node || Dom.nodeName(node) === 'body')) {
                    return false;
                }
                // 达到边界的下一个节点,注意 null 的情况
                // node 永远不能为 null
                return node !== blockerLTR;

            };
        }

        // Create the RTL guard function, if necessary.
        if (rtl && !self._.guardRTL) {
            // Gets the node that stops the walker when going LTR.
            var limitRTL = range.startContainer[0],
                blockerRTL = ( range.startOffset > 0 ) &&
                    limitRTL.childNodes[range.startOffset - 1] || null;

            self._.guardRTL = function (node, movingOut) {
                // 从endContainer移出去，失败返回false
                if (movingOut && (limitRTL === node || Dom.nodeName(node) === 'body')) {
                    return false;
                }
                // 达到边界的下一个节点,注意 null 的情况
                // node 永远不能为 null
                return node !== blockerRTL;
            };
        }

        // Define which guard function to use.
        var stopGuard = rtl ? self._.guardRTL : self._.guardLTR;

        // Make the user defined guard function participate in the process,
        // otherwise simply use the boundary guard.
        if (userGuard) {
            guard = function (node, movingOut) {
                if (stopGuard(node, movingOut) === FALSE) {
                    return FALSE;
                }
                return userGuard(node, movingOut);
            };
        }
        else {
            guard = stopGuard;
        }

        if (self.current) {
            node = this.current[ getSourceNodeFn ](FALSE, type, guard);
        } else {
            // Get the first node to be returned.

            if (rtl) {
                node = range.endContainer;
                if (range.endOffset > 0) {
                    node = new Node(node[0].childNodes[range.endOffset - 1]);
                    if (guard(node[0]) === FALSE) {
                        node = NULL;
                    }
                } else {
                    node = ( guard(node, TRUE) === FALSE ) ?
                        NULL : node._4ePreviousSourceNode(TRUE, type, guard, undefined);
                }
            }
            else {
                node = range.startContainer;
                node = new Node(node[0].childNodes[range.startOffset]);

                if (node.length) {
                    if (guard(node[0]) === FALSE) {
                        node = NULL;
                    }
                } else {
                    node = ( guard(range.startContainer, TRUE) === FALSE ) ?
                        NULL : range.startContainer._4eNextSourceNode(TRUE, type, guard, undefined);
                }
            }
        }

        while (node && !self._.end) {
            self.current = node;
            if (!self.evaluator || self.evaluator(node[0]) !== FALSE) {
                if (!breakOnFalseRetFalse) {
                    return node;
                }
            } else if (breakOnFalseRetFalse && self.evaluator) {
                return FALSE;
            }
            node = node[ getSourceNodeFn ](FALSE, type, guard);
        }

        self.end();
        self.current = NULL;
        return NULL;
    }

    function iterateToLast(rtl) {
        var node,
            last = NULL;
        while ((node = iterate.call(this, rtl))) {
            last = node;
        }
        return last;
    }

    /**
     * Walker for Dom.
     * @class KISSY.Editor.Walker
     * @param {KISSY.Editor.Range} range
     */
    function Walker(range) {
        this.range = range;

        /**
         * A function executed for every matched node, to check whether
         * it's to be considered into the walk or not. If not provided, all
         * matched nodes are considered good.
         * If the function returns "FALSE" the node is ignored.
         * @type {Function}
         * @member KISSY.Editor.Walker
         */
        this.evaluator = NULL;// 当前 range 范围内深度遍历的元素调用

        /**
         * A function executed for every node the walk pass by to check
         * whether the walk is to be finished. It's called when both
         * entering and exiting nodes, as well as for the matched nodes.
         * If this function returns "FALSE", the walking ends and no more
         * nodes are evaluated.
         * @type {Function}
         * @member KISSY.Editor.Walker
         */
        this.guard = NULL;// 人为缩小当前 range 范围


        /** @private */
        this._ = {};
    }


    S.augment(Walker, {
        /**
         * Stop walking. No more nodes are retrieved if this function gets
         * called.
         */
        end: function () {
            this._.end = 1;
        },

        /**
         * Retrieves the next node (at right).
         * @return {Boolean} The next node or NULL if no more
         *        nodes are available.
         */
        next: function () {
            return iterate.call(this);
        },

        /**
         * Retrieves the previous node (at left).
         * @return {Boolean} The previous node or NULL if no more
         *        nodes are available.
         */
        previous: function () {
            return iterate.call(this, TRUE);
        },

        /**
         * Check all nodes at right, executing the evaluation function.
         * @return {Boolean} "FALSE" if the evaluator function returned
         *        "FALSE" for any of the matched nodes. Otherwise "TRUE".
         */
        checkForward: function () {
            return iterate.call(this, FALSE, TRUE) !== FALSE;
        },

        /**
         * Check all nodes at left, executing the evaluation function.
         * 是不是 (不能后退了)
         * @return {Boolean} "FALSE" if the evaluator function returned
         *        "FALSE" for any of the matched nodes. Otherwise "TRUE".
         */
        checkBackward: function () {
            // 在当前 range 范围内不会出现 evaluator 返回 false 的情况
            return iterate.call(this, TRUE, TRUE) !== FALSE;
        },

        /**
         * Executes a full walk forward (to the right), until no more nodes
         * are available, returning the last valid node.
         * @return {Boolean} The last node at the right or NULL
         *        if no valid nodes are available.
         */
        lastForward: function () {
            return iterateToLast.call(this);
        },

        /**
         * Executes a full walk backwards (to the left), until no more nodes
         * are available, returning the last valid node.
         * @return {Boolean} The last node at the left or NULL
         *        if no valid nodes are available.
         */
        lastBackward: function () {
            return iterateToLast.call(this, TRUE);
        },

        reset: function () {
            delete this.current;
            this._ = {};
        },

        // for unit test
        _iterator: iterate

    });


    S.mix(Walker, {
        /**
         * Whether the to-be-evaluated node is not a block node and does not match given node name map.
         * @param {Object} customNodeNames Given node name map.
         * @return {Function} Function for evaluation.
         */
        blockBoundary: function (customNodeNames) {
            return function (node) {
                return !(node.nodeType === Dom.NodeType.ELEMENT_NODE &&
                    Dom._4eIsBlockBoundary(node, customNodeNames) );
            };
        },

        /**
         * Whether the to-be-evaluated node is a bookmark node OR bookmark node
         * inner contents.
         * @param {Boolean} [contentOnly] Whether only test againt the text content of
         * bookmark node instead of the element itself(default).
         * @param {Boolean} [isReject] Whether should return 'FALSE' for the bookmark
         * node instead of 'TRUE'(default).
         * @return {Function} Function for evaluation.
         */
        bookmark: function (contentOnly, isReject) {
            function isBookmarkNode(node) {
                return  Dom.nodeName(node) === 'span' &&
                    Dom.attr(node, '_ke_bookmark');
            }

            return function (node) {
                var isBookmark, parent;
                // Is bookmark inner text node?
                isBookmark = ( node.nodeType === Dom.NodeType.TEXT_NODE &&
                    ( parent = node.parentNode ) &&
                    isBookmarkNode(parent) );
                // Is bookmark node?
                isBookmark = contentOnly ? isBookmark : isBookmark || isBookmarkNode(node);
                // !! 2012-05-15
                // evaluator check ===false, must turn it to boolean false
                return !!(isReject ^ isBookmark);
            };
        },

        /**
         * Whether the node is a text node containing only whitespaces characters.
         * @param {Boolean} [isReject]
         */
        whitespaces: function (isReject) {
            return function (node) {
                var isWhitespace = node.nodeType === Dom.NodeType.TEXT_NODE && !S.trim(node.nodeValue);
                return !!(isReject ^ isWhitespace);
            };
        },
        /**
         * Whether the node is invisible in wysiwyg mode.
         * @param isReject
         */
        invisible: function (isReject) {
            var whitespace = Walker.whitespaces();
            return function (node) {
                // Nodes that take no spaces in wysiwyg:
                // 1. White-spaces but not including NBSP;
                // 2. Empty inline elements, e.g. <b></b> we're checking here
                // 'offsetHeight' instead of 'offsetWidth' for properly excluding
                // all sorts of empty paragraph, e.g. <br />.
                var isInvisible = whitespace(node) ||
                    node.nodeType === Dom.NodeType.ELEMENT_NODE && !node.offsetHeight;
                return !!(isReject ^ isInvisible);
            };
        }
    });

    var tailNbspRegex = /^[\t\r\n ]*(?:&nbsp;|\xa0)$/,
        isWhitespaces = Walker.whitespaces(),
        isBookmark = Walker.bookmark(),
        toSkip = function (node) {
            var name = Dom.nodeName(node);
            return isBookmark(node) ||
                isWhitespaces(node) ||
                node.nodeType === 1 &&
                    name in dtd.$inline && !( name in dtd.$empty );
        };

    // Check if there's a filler node at the end of an element, and return it.
    function getBogus(tail) {
        // Bogus are not always at the end, e.g. <p><a>text<br /></a></p>
        do {
            tail = tail._4ePreviousSourceNode();
        } while (tail && toSkip(tail[0]));

        if (tail && ( !UA.ie ? tail.nodeName() === 'br' : tail[0].nodeType === 3 && tailNbspRegex.test(tail.text()) )) {
            return tail[0];
        }
        return false;
    }

    Editor.Utils.injectDom({
        _4eGetBogus: function (el) {
            return getBogus(new Node(el));
        }
    });

    Editor.Walker = Walker;

    return Walker;
});
