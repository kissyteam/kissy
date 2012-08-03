/**
 * modified from ckeditor for kissy editor ,walker implementation
 * refer: http://www.w3.org/TR/DOM-Level-2-Traversal-Range/traversal#TreeWalker
 * @author <yiminghe@gmail.com>
 */
/*
 Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.html or http://ckeditor.com/license
 */
KISSY.Editor.add("walker", function (KE) {

    var TRUE = true,
        FALSE = false,
        NULL = null,
        S = KISSY,
        UA = S.UA,
        KEN = KE.NODE,
        DOM = S.DOM,
        dtd = KE.XHTML_DTD,
        Node = S.Node;

    /**
     *
     * @param  {boolean=} rtl
     * @param  {boolean=} breakOnFalse
     *
     */
    function iterate(rtl, breakOnFalse) {
        var self = this;
        // Return NULL if we have reached the end.
        if (this._.end)
            return NULL;

        var node,
            range = self.range,
            guard,
            userGuard = self.guard,
            type = self.type,
            getSourceNodeFn = ( rtl ? '_4e_previousSourceNode' : '_4e_nextSourceNode' );

        // This is the first call. Initialize it.
        if (!self._.start) {
            self._.start = 1;

            // Trim text nodes and optmize the range boundaries. DOM changes
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
            var limitLTR = range.endContainer,
                blockerLTR = new Node(limitLTR[0].childNodes[range.endOffset]);
            //从左到右保证在 range 区间内获取 nextSourceNode
            this._.guardLTR = function (node, movingOut) {
                node = DOM._4e_wrap(node);
                //从endContainer移出去，失败返回false
                return (
                    node
                        && node[0]
                        &&
                        (!movingOut
                            ||
                            !DOM._4e_equals(limitLTR, node)
                            )
                        //到达深度遍历的最后一个节点，结束
                        &&

                        (!blockerLTR[0] || !node._4e_equals(blockerLTR))

                        //从body移出也结束
                        && ( node[0].nodeType != KEN.NODE_ELEMENT
                        || !movingOut
                        || node._4e_name() != 'body' )
                    );
            };
        }

        // Create the RTL guard function, if necessary.
        if (rtl && !self._.guardRTL) {
            // Gets the node that stops the walker when going LTR.
            var limitRTL = range.startContainer,
                blockerRTL = ( range.startOffset > 0 ) && new Node(limitRTL[0].childNodes[range.startOffset - 1]);

            self._.guardRTL = function (node, movingOut) {
                node = DOM._4e_wrap(node);
                return (
                    node
                        && node[0]
                        && ( !movingOut || !node._4e_equals(limitRTL)  )
                        && ( !blockerRTL[0] || !node._4e_equals(blockerRTL) )
                        && ( node[0].nodeType != KEN.NODE_ELEMENT || !movingOut || node._4e_name() != 'body' )
                    );
            };
        }

        // Define which guard function to use.
        var stopGuard = rtl ? self._.guardRTL : self._.guardLTR;

        // Make the user defined guard function participate in the process,
        // otherwise simply use the boundary guard.
        if (userGuard) {
            guard = function (node, movingOut) {
                if (stopGuard(node, movingOut) === FALSE)
                    return FALSE;

                return userGuard(node, movingOut);
            };
        }
        else {
            guard = stopGuard;
        }

        if (self.current)
            node = this.current[ getSourceNodeFn ](FALSE, type, guard);
        else {
            // Get the first node to be returned.

            if (rtl) {
                node = range.endContainer;

                if (range.endOffset > 0) {
                    node = new Node(node[0].childNodes[range.endOffset - 1]);
                    if (guard(node) === FALSE)
                        node = NULL;
                }
                else
                    node = ( guard(node, TRUE) === FALSE ) ?
                        NULL : node._4e_previousSourceNode(TRUE, type, guard);
            }
            else {
                node = range.startContainer;
                node = new Node(node[0].childNodes[range.startOffset]);

                if (node && node[0]) {
                    if (guard(node) === FALSE)
                        node = NULL;
                }
                else
                    node = ( guard(range.startContainer, TRUE) === FALSE ) ?
                        NULL : range.startContainer._4e_nextSourceNode(TRUE, type, guard);
            }
        }

        while (node && node[0] && !self._.end) {
            self.current = node;

            if (!self.evaluator || self.evaluator(node) !== FALSE) {
                if (!breakOnFalse)
                    return node;
            }
            else if (breakOnFalse && self.evaluator)
                return FALSE;

            node = node[ getSourceNodeFn ](FALSE, type, guard);
        }

        self.end();
        return self.current = NULL;
    }

    /**
     *
     * @param  {boolean=} rtl
     * @return {(boolean)}
     */
    function iterateToLast(rtl) {
        var node, last = NULL;

        while (( node = iterate.call(this, rtl) ))
            last = node;

        return last;
    }

    /**
     * @constructor
     * @name Walker
     */
    function Walker(range) {
        this.range = range;

        /**
         * A function executed for every matched node, to check whether
         * it's to be considered into the walk or not. If not provided, all
         * matched nodes are considered good.
         * If the function returns "FALSE" the node is ignored.
         * @name CKEDITOR.dom.walker.prototype.evaluator
         * @property
         * @type Function
         */
        // this.evaluator = NULL;

        /**
         * A function executed for every node the walk pass by to check
         * whether the walk is to be finished. It's called when both
         * entering and exiting nodes, as well as for the matched nodes.
         * If this function returns "FALSE", the walking ends and no more
         * nodes are evaluated.
         * @name CKEDITOR.dom.walker.prototype.guard
         * @property
         * @type Function
         */
        // this.guard = NULL;

        /** @private */
        this._ = {};
    }


    S.augment(Walker, {
        /**
         * Stop walking. No more nodes are retrieved if this function gets
         * called.
         */
        end:function () {
            this._.end = 1;
        },

        /**
         * Retrieves the next node (at right).
         * @returns {(boolean)} The next node or NULL if no more
         *        nodes are available.
         */
        next:function () {
            return iterate.call(this);
        },

        /**
         * Retrieves the previous node (at left).
         * @returns {(boolean)} The previous node or NULL if no more
         *        nodes are available.
         */
        previous:function () {
            return iterate.call(this, TRUE);
        },

        /**
         * Check all nodes at right, executing the evaluation fuction.
         * @returns {boolean} "FALSE" if the evaluator function returned
         *        "FALSE" for any of the matched nodes. Otherwise "TRUE".
         */
        checkForward:function () {
            return iterate.call(this, FALSE, TRUE) !== FALSE;
        },

        /**
         * Check all nodes at left, executing the evaluation fuction.
         * 是不是 (不能后退了)
         * @returns {boolean} "FALSE" if the evaluator function returned
         *        "FALSE" for any of the matched nodes. Otherwise "TRUE".
         */
        checkBackward:function () {
            return iterate.call(this, TRUE, TRUE) !== FALSE;
        },

        /**
         * Executes a full walk forward (to the right), until no more nodes
         * are available, returning the last valid node.
         * @returns {(boolean)} The last node at the right or NULL
         *        if no valid nodes are available.
         */
        lastForward:function () {
            return iterateToLast.call(this);
        },

        /**
         * Executes a full walk backwards (to the left), until no more nodes
         * are available, returning the last valid node.
         * @returns {(boolean)} The last node at the left or NULL
         *        if no valid nodes are available.
         */
        lastBackward:function () {
            return iterateToLast.call(this, TRUE);
        },

        reset:function () {
            delete this.current;
            this._ = {};
        }

    });


    Walker.blockBoundary = function (customNodeNames) {
        return function (node) {
            node = DOM._4e_wrap(node);
            return !( node && node[0].nodeType == KEN.NODE_ELEMENT
                && node._4e_isBlockBoundary(customNodeNames) );
        };
    };

    if (0) {
        Walker.blockBoundary = 0;
    }
    /**
     * Whether the node is a bookmark node's inner text node.
     */
    //Walker.bookmarkContents = function(node) {
    // },

    /**
     * Whether the to-be-evaluated node is a bookmark node OR bookmark node
     * inner contents.
     * @param {boolean} contentOnly Whether only test againt the text content of
     * bookmark node instead of the element itself(default).
     * @param {boolean} isReject Whether should return 'FALSE' for the bookmark
     * node instead of 'TRUE'(default).
     */
    Walker.bookmark = function (contentOnly, isReject) {
        function isBookmarkNode(node) {
            return ( node && node[0]
                && node._4e_name() == 'span'
                && node.attr('_ke_bookmark') );
        }

        return function (node) {
            var isBookmark, parent;
            // Is bookmark inner text node?
            isBookmark = ( node &&
                node[0] &&
                node[0].nodeType == KEN.NODE_TEXT &&
                ( parent = node.parent() )
                && isBookmarkNode(parent) );
            // Is bookmark node?
            isBookmark = contentOnly ? isBookmark : isBookmark || isBookmarkNode(node);
            return isReject ^ isBookmark;
        };
    };

    /**
     * Whether the node is a text node() containing only whitespaces characters.
     * @param {boolean=} isReject
     */
    Walker.whitespaces = function (isReject) {
        return function (node) {
            node = node[0] || node;
            var isWhitespace = node && ( node.nodeType == KEN.NODE_TEXT )
                && !S.trim(node.nodeValue);
            return isReject ^ isWhitespace;
        };
    };

    /**
     * Whether the node is invisible in wysiwyg mode.
     * @param isReject
     */
    Walker.invisible = function (isReject) {
        var whitespace = Walker.whitespaces();
        return function (node) {
            // Nodes that take no spaces in wysiwyg:
            // 1. White-spaces but not including NBSP;
            // 2. Empty inline elements, e.g. <b></b> we're checking here
            // 'offsetHeight' instead of 'offsetWidth' for properly excluding
            // all sorts of empty paragraph, e.g. <br />.
            var isInvisible = whitespace(node) || node[0].nodeType == KEN.NODE_ELEMENT && !node[0].offsetHeight;
            return isReject ^ isInvisible;
        };
    };

    var tailNbspRegex = /^[\t\r\n ]*(?:&nbsp;|\xa0)$/,
        isWhitespaces = Walker.whitespaces(),
        isBookmark = Walker.bookmark(),
        toSkip = function (node) {
            return isBookmark(node)
                || isWhitespaces(node)
                || node[0].nodeType == 1
                && node._4e_name() in dtd.$inline
                && !( node._4e_name() in dtd.$empty );
        };

    // Check if there's a filler node at the end of an element, and return it.
    Walker.getBogus = function (tail) {
        // Bogus are not always at the end, e.g. <p><a>text<br /></a></p>
        do {
            tail = tail._4e_previousSourceNode();
        } while (toSkip(tail));

        if (tail && ( !UA.ie ? tail._4e_name() == "br"
            : tail[0].nodeType == 3 && tailNbspRegex.test(tail.text()) )) {
            return tail;
        }
        return false;
    };


    KE.Walker = Walker;
});
