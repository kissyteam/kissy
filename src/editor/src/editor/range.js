/**
 * @ignore
 * Range implementation across browsers for kissy editor.
 * @author yiminghe@gmail.com
 */
/*
 Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.html or http://ckeditor.com/license
 */
KISSY.add(function (S, require) {
    require('./dom');
    var Node = require('node');
    var Utils = require('./utils');
    var Walker = require('./walker');
    var Editor = require('./base');
    var ElementPath = require('./elementPath');
    /**
     * Enum for range
     * @enum {number} KISSY.Editor.RangeType
     */
    Editor.RangeType = {
        POSITION_AFTER_START: 1, // <element>^contents</element>		'^text'
        POSITION_BEFORE_END: 2, // <element>contents^</element>		'text^'
        POSITION_BEFORE_START: 3, // ^<element>contents</element>		^'text'
        POSITION_AFTER_END: 4, // <element>contents</element>^		'text'^
        ENLARGE_ELEMENT: 1,
        ENLARGE_BLOCK_CONTENTS: 2,
        ENLARGE_LIST_ITEM_CONTENTS: 3,
        START: 1,
        END: 2,
        SHRINK_ELEMENT: 1,
        SHRINK_TEXT: 2
    };

    var TRUE = true,
        FALSE = false,
        NULL = null,
        KER = Editor.RangeType,
        KEP = Editor.PositionType,
        Dom = S.DOM,
        UA = S.UA,
        dtd = Editor.XHTML_DTD,
        $ = Node.all,
        UN_REMOVABLE = {
            'td': 1
        },
        EMPTY = {
            'area': 1,
            'base': 1,
            'br': 1,
            'col': 1,
            'hr': 1,
            'img': 1,
            'input': 1,
            'link': 1,
            'meta': 1,
            'param': 1
        };

    var isWhitespace = new Walker.whitespaces(),
        isBookmark = new Walker.bookmark(),
        isNotWhitespaces = Walker.whitespaces(TRUE),
        isNotBookmarks = Walker.bookmark(false, true);

    var inlineChildReqElements = {
        'abbr': 1,
        'acronym': 1,
        'b': 1,
        'bdo': 1,
        'big': 1,
        'cite': 1,
        'code': 1,
        'del': 1,
        'dfn': 1,
        'em': 1,
        'font': 1,
        'i': 1,
        'ins': 1,
        'label': 1,
        'kbd': 1,
        'q': 1,
        'samp': 1,
        'small': 1,
        'span': 1,
        'strike': 1,
        'strong': 1,
        'sub': 1,
        'sup': 1,
        'tt': 1,
        'u': 1,
        'var': 1
    };

    // Evaluator for checkBoundaryOfElement, reject any
    // text node and non-empty elements unless it's being bookmark text.
    function elementBoundaryEval(node) {
        // Reject any text node unless it's being bookmark
        // OR it's spaces. (#3883)
        // 如果不是文本节点并且是空的，可以继续取下一个判断边界
        var c1 = node.nodeType !== Dom.NodeType.TEXT_NODE &&
                Dom.nodeName(node) in dtd.$removeEmpty,
        // 文本为空，可以继续取下一个判断边界
            c2 = node.nodeType === Dom.NodeType.TEXT_NODE && !S.trim(node.nodeValue),
        // 恩，进去了书签，可以继续取下一个判断边界
            c3 = !!node.parentNode.getAttribute('_ke_bookmark');
        return c1 || c2 || c3;
    }

    function nonWhitespaceOrIsBookmark(node) {
        // Whitespaces and bookmark nodes are to be ignored.
        return !isWhitespace(node) && !isBookmark(node);
    }

    function getCheckStartEndBlockEvalFunction(isStart) {
        var hadBr = FALSE;
        return function (node) {
            // First ignore bookmark nodes.
            if (isBookmark(node)) {
                return TRUE;
            }

            if (node.nodeType === Dom.NodeType.TEXT_NODE) {
                // If there's any visible text, then we're not at the start.
                if (S.trim(node.nodeValue).length) {
                    return FALSE;
                }
            } else if (node.nodeType === Dom.NodeType.ELEMENT_NODE) {
                var nodeName = Dom.nodeName(node);
                // If there are non-empty inline elements (e.g. <img />), then we're not
                // at the start.
                if (!inlineChildReqElements[ nodeName ]) {
                    // If we're working at the end-of-block, forgive the first <br /> in non-IE
                    // browsers.
                    if (!isStart && !UA.ie && nodeName === 'br' && !hadBr) {
                        hadBr = TRUE;
                    } else {
                        return FALSE;
                    }
                }
            }
            return TRUE;
        };
    }


    /*
     Extract html content within range.
     0 : delete
     1 : extract
     2 : clone
     */
    function execContentsAction(self, action) {
        var startNode = self.startContainer,
            endNode = self.endContainer,
            startOffset = self.startOffset,
            endOffset = self.endOffset,
            removeStartNode,
            hasSplitStart = FALSE,
            hasSplitEnd = FALSE,
            t,
            docFrag,
            doc = self.document,
            removeEndNode;

        if (action > 0) {
            docFrag = doc.createDocumentFragment();
        }

        if (self.collapsed) {
            return docFrag;
        }

        // 将 bookmark 包含在选区内
        self.optimizeBookmark();


        // endNode -> end guard , not included in range

        // For text containers, we must simply split the node and point to the
        // second part. The removal will be handled by the rest of the code .
        //最关键：一般起始都是在文字节点中，得到起点选择右边的文字节点，只对节点处理！
        if (endNode[0].nodeType === Dom.NodeType.TEXT_NODE) {
            hasSplitEnd = TRUE;
            endNode = endNode._4eSplitText(endOffset);
        } else {
            // If the end container has children and the offset is pointing
            // to a child, then we should start from it.
            if (endNode[0].childNodes.length > 0) {
                // If the offset points after the last node.
                if (endOffset >= endNode[0].childNodes.length) {
                    // Let's create a temporary node and mark it for removal.
                    endNode = new Node(
                        endNode[0].appendChild(doc.createTextNode(''))
                    );
                    removeEndNode = TRUE;
                } else {
                    endNode = new Node(endNode[0].childNodes[endOffset]);
                }
            }
        }

        // startNode -> start guard , not included in range

        // For text containers, we must simply split the node. The removal will
        // be handled by the rest of the code .
        if (startNode[0].nodeType === Dom.NodeType.TEXT_NODE) {
            hasSplitStart = TRUE;
            startNode._4eSplitText(startOffset);
        } else {
            // If the start container has children and the offset is pointing
            // to a child, then we should start from its previous sibling.

            // If the offset points to the first node, we don't have a
            // sibling, so let's use the first one, but mark it for removal.
            if (!startOffset) {
                // Let's create a temporary node and mark it for removal.
                t = new Node(doc.createTextNode(''));
                startNode.prepend(t);
                startNode = t;
                removeStartNode = TRUE;
            }
            else if (startOffset >= startNode[0].childNodes.length) {
                // Let's create a temporary node and mark it for removal.
                startNode = new Node(startNode[0]
                    .appendChild(doc.createTextNode('')));
                removeStartNode = TRUE;
            } else {
                startNode = new Node(
                    startNode[0].childNodes[startOffset].previousSibling
                );
            }
        }

        // Get the parent nodes tree for the start and end boundaries.
        //从根到自己
        var startParents = startNode._4eParents(),
            endParents = endNode._4eParents();

        startParents.each(function (n, i) {
            startParents[i] = n;
        });

        endParents.each(function (n, i) {
            endParents[i] = n;
        });


        // Compare them, to find the top most siblings.
        var i, topStart, topEnd;

        for (i = 0; i < startParents.length; i++) {
            topStart = startParents[ i ];
            topEnd = endParents[ i ];

            // The compared nodes will match until we find the top most
            // siblings (different nodes that have the same parent).
            // 'i' will hold the index in the parents array for the top
            // most element.
            if (!topStart.equals(topEnd)) {
                break;
            }
        }

        var clone = docFrag,
            levelStartNode,
            levelClone,
            currentNode,
            currentSibling;

        // Remove all successive sibling nodes for every node in the
        // startParents tree.
        for (var j = i; j < startParents.length; j++) {
            levelStartNode = startParents[j];

            // For Extract and Clone, we must clone this level.
            if (action > 0 && !levelStartNode.equals(startNode)) {
                // action = 0 = Delete
                levelClone = clone.appendChild(levelStartNode.clone()[0]);
            } else {
                levelClone = null;
            }

            // 开始节点的路径所在父节点不能 clone(TRUE)，其他节点（结束节点路径左边的节点）可以直接 clone(true)
            currentNode = levelStartNode[0].nextSibling;

            var endParentJ = endParents[ j ],
                domEndNode = endNode[0],
                domEndParentJ = endParentJ && endParentJ[0];

            while (currentNode) {
                // Stop processing when the current node matches a node in the
                // endParents tree or if it is the endNode.
                if (domEndParentJ === currentNode || domEndNode === currentNode) {
                    break;
                }

                // Cache the next sibling.
                currentSibling = currentNode.nextSibling;

                // If cloning, just clone it.
                if (action === 2) {
                    // 2 = Clone
                    clone.appendChild(currentNode.cloneNode(TRUE));
                } else {

                    // https://github.com/kissyteam/kissy/issues/418
                    // in case table structure is destroyed
                    if (UN_REMOVABLE[currentNode.nodeName.toLowerCase()]) {
                        var tmp = currentNode.cloneNode(TRUE);
                        currentNode.innerHTML = '';
                        currentNode = tmp;
                    } else {
                        // Both Delete and Extract will remove the node.
                        Dom._4eRemove(currentNode);
                    }

                    // When Extracting, move the removed node to the docFrag.
                    if (action === 1) {
                        // 1 = Extract
                        clone.appendChild(currentNode);
                    }
                }

                currentNode = currentSibling;
            }
            // 开始节点的路径所在父节点不能 clone(TRUE)，要在后面深入子节点处理
            if (levelClone) {
                clone = levelClone;
            }
        }

        clone = docFrag;

        // Remove all previous sibling nodes for every node in the
        // endParents tree.
        for (var k = i; k < endParents.length; k++) {
            levelStartNode = endParents[ k ];

            // For Extract and Clone, we must clone this level.
            if (action > 0 && !levelStartNode.equals(endNode)) {
                // action = 0 = Delete
                // 浅复制
                levelClone = clone.appendChild(levelStartNode.clone()[0]);
            } else {
                levelClone = null;
            }

            // The processing of siblings may have already been done by the parent.
            if (
                !startParents[ k ] ||
                    // 前面 startParents 循环已经处理过了
                    !levelStartNode._4eSameLevel(startParents[ k ])
                ) {
                currentNode = levelStartNode[0].previousSibling;
                while (currentNode) {
                    // Cache the next sibling.
                    currentSibling = currentNode.previousSibling;

                    // If cloning, just clone it.
                    if (action === 2) {    // 2 = Clone
                        clone.insertBefore(currentNode.cloneNode(TRUE),
                            clone.firstChild);
                    } else {
                        // Both Delete and Extract will remove the node.
                        Dom._4eRemove(currentNode);

                        // When Extracting, mode the removed node to the docFrag.
                        if (action === 1) {
                            // 1 = Extract
                            clone.insertBefore(currentNode, clone.firstChild);
                        }
                    }

                    currentNode = currentSibling;
                }
            }

            if (levelClone) {
                clone = levelClone;
            }
        }
        // 2 = Clone.
        if (action === 2) {

            // No changes in the Dom should be done, so fix the split text (if any).

            if (hasSplitStart) {
                var startTextNode = startNode[0];
                if (startTextNode.nodeType === Dom.NodeType.TEXT_NODE && startTextNode.nextSibling &&
                    // careful, next sibling should be text node
                    startTextNode.nextSibling.nodeType === Dom.NodeType.TEXT_NODE) {
                    startTextNode.data += startTextNode.nextSibling.data;
                    startTextNode.parentNode.removeChild(startTextNode.nextSibling);
                }
            }

            if (hasSplitEnd) {
                var endTextNode = endNode[0];
                if (endTextNode.nodeType === Dom.NodeType.TEXT_NODE &&
                    endTextNode.previousSibling &&
                    endTextNode.previousSibling.nodeType === Dom.NodeType.TEXT_NODE) {
                    endTextNode.previousSibling.data += endTextNode.data;
                    endTextNode.parentNode.removeChild(endTextNode);
                }
            }

        } else {

            // Collapse the range.
            // If a node has been partially selected, collapse the range between
            // topStart and topEnd. Otherwise, simply collapse it to the start.
            // (W3C specs).
            if (
                topStart && topEnd &&
                    (
                        !startNode._4eSameLevel(topStart) || !endNode._4eSameLevel(topEnd)
                        )
                ) {
                var startIndex = topStart._4eIndex();

                // If the start node is to be removed, we must correct the
                // index to reflect the removal.
                if (removeStartNode &&
                    // startNode 和 topStart 同级
                    (topStart._4eSameLevel(startNode))) {
                    startIndex--;
                }

                self.setStart(topStart.parent(), startIndex + 1);
            }

            // Collapse it to the start.
            self.collapse(TRUE);

        }

        // Cleanup any marked node.
        if (removeStartNode) {
            startNode.remove();
        }

        if (removeEndNode) {
            endNode.remove();
        }

        return docFrag;
    }

    function updateCollapsed(self) {
        self.collapsed = (
            self.startContainer &&
                self.endContainer &&
                self.startContainer[0] === self.endContainer[0] &&
                self.startOffset === self.endOffset );
    }


    /**
     * Range implementation across browsers.
     * @class KISSY.Editor.Range
     * @param document {Document}
     */
    function KERange(document) {
        var self = this;
        self.startContainer = NULL;
        self.startOffset = NULL;
        self.endContainer = NULL;
        self.endOffset = NULL;
        self.collapsed = TRUE;
        self.document = document;
    }

    S.augment(KERange, {

        /**
         * Range string representation.
         */
        toString: function () {
            var s = [],
                self = this,
                startContainer = self.startContainer[0],
                endContainer = self.endContainer[0];
            s.push((startContainer.id || startContainer.nodeName) + ':' + self.startOffset);
            s.push((endContainer.id || endContainer.nodeName) + ':' + self.endOffset);
            return s.join('<br/>');
        },

        /**
         * Transforms the startContainer and endContainer properties from text
         * nodes to element nodes, whenever possible. This is actually possible
         * if either of the boundary containers point to a text node, and its
         * offset is set to zero, or after the last char in the node.
         */
        optimize: function () {
            var self = this,
                container = self.startContainer,
                offset = self.startOffset;

            if (container[0].nodeType !== Dom.NodeType.ELEMENT_NODE) {
                if (!offset) {
                    self.setStartBefore(container);
                } else if (offset >= container[0].nodeValue.length) {
                    self.setStartAfter(container);
                }
            }

            container = self.endContainer;
            offset = self.endOffset;

            if (container[0].nodeType !== Dom.NodeType.ELEMENT_NODE) {
                if (!offset) {
                    self.setEndBefore(container);
                } else if (offset >= container[0].nodeValue.length) {
                    self.setEndAfter(container);
                }
            }
        },

        /**
         * Set range start after node
         * @param {KISSY.NodeList} node
         */
        setStartAfter: function (node) {
            this.setStart(node.parent(), node._4eIndex() + 1);
        },
        /**
         * Set range start before node
         * @param {KISSY.NodeList} node
         */
        setStartBefore: function (node) {
            this.setStart(node.parent(), node._4eIndex());
        },
        /**
         * Set range end after node
         * @param {KISSY.NodeList} node
         */
        setEndAfter: function (node) {
            this.setEnd(node.parent(), node._4eIndex() + 1);
        },
        /**
         * Set range end before node
         * @param {KISSY.NodeList} node
         */
        setEndBefore: function (node) {
            this.setEnd(node.parent(), node._4eIndex());
        },

        /**
         * Make edge bookmarks included in current range.
         */
        optimizeBookmark: function () {
            var self = this,
                startNode = self.startContainer,
                endNode = self.endContainer;

            if (startNode &&
                startNode.nodeName() === 'span' &&
                startNode.attr('_ke_bookmark')) {
                self.setStartBefore(startNode);
            }
            if (endNode &&
                endNode.nodeName() === 'span' &&
                endNode.attr('_ke_bookmark')) {
                self.setEndAfter(endNode);
            }
        },

        /**
         * Sets the start position of a Range.
         * @param {KISSY.NodeList} startNode The node to start the range.
         * @param {Number} startOffset An integer greater than or equal to zero
         *        representing the offset for the start of the range from the start
         *        of startNode.
         */
        setStart: function (startNode, startOffset) {
            // W3C requires a check for the new position. If it is after the end
            // boundary, the range should be collapsed to the new start. It seams
            // we will not need this check for our use of this class so we can
            // ignore it for now.

            // Fixing invalid range start inside dtd empty elements.
            var self = this;
            if (startNode[0].nodeType === Dom.NodeType.ELEMENT_NODE && EMPTY[ startNode.nodeName() ]) {
                startNode = startNode.parent();
                startOffset = startNode._4eIndex();
            }

            self.startContainer = startNode;
            self.startOffset = startOffset;

            if (!self.endContainer) {
                self.endContainer = startNode;
                self.endOffset = startOffset;
            }

            updateCollapsed(self);
        },

        /**
         * Sets the end position of a Range.
         * @param {KISSY.NodeList} endNode The node to end the range.
         * @param {Number} endOffset An integer greater than or equal to zero
         *        representing the offset for the end of the range from the start
         *        of endNode.
         */
        setEnd: function (endNode, endOffset) {
            // W3C requires a check for the new position. If it is before the start
            // boundary, the range should be collapsed to the new end. It seams we
            // will not need this check for our use of this class so we can ignore
            // it for now.

            // Fixing invalid range end inside dtd empty elements.
            var self = this;
            if (endNode[0].nodeType === Dom.NodeType.ELEMENT_NODE && EMPTY[ endNode.nodeName() ]) {
                endNode = endNode.parent();
                endOffset = endNode._4eIndex() + 1;
            }

            self.endContainer = endNode;
            self.endOffset = endOffset;

            if (!self.startContainer) {
                self.startContainer = endNode;
                self.startOffset = endOffset;
            }

            updateCollapsed(self);
        },

        /**
         * Sets the start position of a Range by specified rules.
         * @param {KISSY.NodeList} node
         * @param {Number} position
         */
        setStartAt: function (node, position) {
            var self = this;
            switch (position) {
                case KER.POSITION_AFTER_START :
                    self.setStart(node, 0);
                    break;

                case KER.POSITION_BEFORE_END :
                    if (node[0].nodeType === Dom.NodeType.TEXT_NODE) {
                        self.setStart(node, node[0].nodeValue.length);
                    } else {
                        self.setStart(node, node[0].childNodes.length);
                    }
                    break;

                case KER.POSITION_BEFORE_START :
                    self.setStartBefore(node);
                    break;

                case KER.POSITION_AFTER_END :
                    self.setStartAfter(node);
            }

            updateCollapsed(self);
        },

        /**
         * Sets the end position of a Range by specified rules.
         * @param {KISSY.NodeList} node
         * @param {Number} position
         */
        setEndAt: function (node, position) {
            var self = this;
            switch (position) {
                case KER.POSITION_AFTER_START :
                    self.setEnd(node, 0);
                    break;

                case KER.POSITION_BEFORE_END :
                    if (node[0].nodeType === Dom.NodeType.TEXT_NODE) {
                        self.setEnd(node, node[0].nodeValue.length);
                    } else {
                        self.setEnd(node, node[0].childNodes.length);
                    }
                    break;

                case KER.POSITION_BEFORE_START :
                    self.setEndBefore(node);
                    break;

                case KER.POSITION_AFTER_END :
                    self.setEndAfter(node);
            }

            updateCollapsed(self);
        },

        /**
         * Clone html content within range
         */
        cloneContents: function () {
            return execContentsAction(this, 2);
        },

        /**
         * Remove html content within range
         */
        deleteContents: function () {
            return execContentsAction(this, 0);
        },

        /**
         * Extract html content within range.
         */
        extractContents: function () {
            return execContentsAction(this, 1);
        },

        /**
         * collapse current range
         * @param {Boolean} toStart
         */
        collapse: function (toStart) {
            var self = this;
            if (toStart) {
                self.endContainer = self.startContainer;
                self.endOffset = self.startOffset;
            } else {
                self.startContainer = self.endContainer;
                self.startOffset = self.endOffset;
            }
            self.collapsed = TRUE;
        },

        /**
         * Clone current range.
         * @return {KISSY.Editor.Range}
         */
        clone: function () {
            var self = this,
                clone = new KERange(self.document);

            clone.startContainer = self.startContainer;
            clone.startOffset = self.startOffset;
            clone.endContainer = self.endContainer;
            clone.endOffset = self.endOffset;
            clone.collapsed = self.collapsed;

            return clone;
        },

        /**
         * Get node which is enclosed by range.
         *
         *      @example
         *      ^<book/><span/><book/>^
         *      <!-- => -->
         *      ^<span/>^
         */
        getEnclosedNode: function () {
            var walkerRange = this.clone();

            // Optimize and analyze the range to avoid Dom destructive nature of walker.
            walkerRange.optimize();

            if (walkerRange.startContainer[0].nodeType !== Dom.NodeType.ELEMENT_NODE ||
                walkerRange.endContainer[0].nodeType !== Dom.NodeType.ELEMENT_NODE) {
                return NULL;
            }

            var walker = new Walker(walkerRange),
                node, pre;

            walker.evaluator = function (node) {
                return isNotWhitespaces(node) && isNotBookmarks(node);
            };

            //深度优先遍历的第一个元素
            //        x
            //     y     z
            // x->y ,return y
            node = walker.next();
            walker.reset();
            pre = walker.previous();
            //前后相等，则脱一层皮 :)
            return node && node.equals(pre) ? node : NULL;
        },

        /**
         * Shrink range to its innermost element.(make sure text content is unchanged)
         * @param mode
         * @param {Boolean} [selectContents]
         */
        shrink: function (mode, selectContents) {
            // Unable to shrink a collapsed range.
            var self = this;
            if (!self.collapsed) {
                mode = mode || KER.SHRINK_TEXT;

                var walkerRange = self.clone(),
                    startContainer = self.startContainer,
                    endContainer = self.endContainer,
                    startOffset = self.startOffset,
                    endOffset = self.endOffset,
                // Whether the start/end boundary is movable.
                    moveStart = TRUE,
                    currentElement,
                    walker,
                    moveEnd = TRUE;

                if (startContainer &&
                    startContainer[0].nodeType === Dom.NodeType.TEXT_NODE) {
                    if (!startOffset) {
                        walkerRange.setStartBefore(startContainer);
                    } else if (startOffset >= startContainer[0].nodeValue.length) {
                        walkerRange.setStartAfter(startContainer);
                    } else {
                        // Enlarge the range properly to avoid walker making
                        // Dom changes caused by trimming the text nodes later.
                        walkerRange.setStartBefore(startContainer);
                        moveStart = FALSE;
                    }
                }

                if (endContainer &&
                    endContainer[0].nodeType === Dom.NodeType.TEXT_NODE) {
                    if (!endOffset) {
                        walkerRange.setEndBefore(endContainer);
                    } else if (endOffset >= endContainer[0].nodeValue.length) {
                        walkerRange.setEndAfter(endContainer);
                    } else {
                        walkerRange.setEndAfter(endContainer);
                        moveEnd = FALSE;
                    }
                }

                if (moveStart || moveEnd) {

                    walker = new Walker(walkerRange);

                    walker.evaluator = function (node) {
                        return node.nodeType === ( mode === KER.SHRINK_ELEMENT ?
                            Dom.NodeType.ELEMENT_NODE : Dom.NodeType.TEXT_NODE );
                    };

                    walker.guard = function (node, movingOut) {
                        // Stop when we're shrink in element mode while encountering a text node.
                        if (mode === KER.SHRINK_ELEMENT &&
                            node.nodeType === Dom.NodeType.TEXT_NODE) {
                            return FALSE;
                        }
                        // Stop when we've already walked 'through' an element.
                        if (movingOut && node === currentElement) {
                            return FALSE;
                        }
                        if (!movingOut && node.nodeType === Dom.NodeType.ELEMENT_NODE) {
                            currentElement = node;
                        }
                        return TRUE;
                    };

                }

                if (moveStart) {
                    var textStart = walker[mode === KER.SHRINK_ELEMENT ? 'lastForward' : 'next']();
                    if (textStart) {
                        self.setStartAt(textStart, selectContents ? KER.POSITION_AFTER_START : KER.POSITION_BEFORE_START);
                    }
                }

                if (moveEnd) {
                    walker.reset();
                    var textEnd = walker[mode === KER.SHRINK_ELEMENT ? 'lastBackward' : 'previous']();
                    if (textEnd) {
                        self.setEndAt(textEnd, selectContents ? KER.POSITION_BEFORE_END : KER.POSITION_AFTER_END);
                    }
                }

                return moveStart || moveEnd;
            }
        },

        /**
         * Create virtual bookmark by remeber its position index.
         * @param normalized
         */
        createBookmark2: function (normalized) {

            var self = this,
                startContainer = self.startContainer,
                endContainer = self.endContainer,
                startOffset = self.startOffset,
                endOffset = self.endOffset,
                child, previous;

            // If there is no range then get out of here.
            // It happens on initial load in Safari #962 and if the editor it's
            // hidden also in Firefox
            if (!startContainer || !endContainer) {
                return {
                    start: 0,
                    end: 0
                };
            }

            if (normalized) {
                // Find out if the start is pointing to a text node that will
                // be normalized.
                if (startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE) {
                    child = new Node(startContainer[0].childNodes[startOffset]);

                    // In this case, move the start information to that text
                    // node.
                    if (child && child[0] && child[0].nodeType === Dom.NodeType.TEXT_NODE &&
                        startOffset > 0 && child[0].previousSibling.nodeType === Dom.NodeType.TEXT_NODE) {
                        startContainer = child;
                        startOffset = 0;
                    }

                }

                // Normalize the start.
                while (startContainer[0].nodeType === Dom.NodeType.TEXT_NODE &&
                    ( previous = startContainer.prev(undefined, 1) ) &&
                    previous[0].nodeType === Dom.NodeType.TEXT_NODE) {
                    startContainer = previous;
                    startOffset += previous[0].nodeValue.length;
                }

                // Process the end only if not normalized.
                if (!self.collapsed) {
                    // Find out if the start is pointing to a text node that
                    // will be normalized.
                    if (endContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE) {
                        child = new Node(endContainer[0].childNodes[endOffset]);

                        // In this case, move the start information to that
                        // text node.
                        if (child && child[0] &&
                            child[0].nodeType === Dom.NodeType.TEXT_NODE && endOffset > 0 &&
                            child[0].previousSibling.nodeType === Dom.NodeType.TEXT_NODE) {
                            endContainer = child;
                            endOffset = 0;
                        }
                    }

                    // Normalize the end.
                    while (endContainer[0].nodeType === Dom.NodeType.TEXT_NODE &&
                        ( previous = endContainer.prev(undefined, 1) ) &&
                        previous[0].nodeType === Dom.NodeType.TEXT_NODE) {
                        endContainer = previous;
                        endOffset += previous[0].nodeValue.length;
                    }
                }
            }

            return {
                start: startContainer._4eAddress(normalized),
                end: self.collapsed ? NULL : endContainer._4eAddress(normalized),
                startOffset: startOffset,
                endOffset: endOffset,
                normalized: normalized,
                is2: TRUE  // It's a createBookmark2 bookmark.
            };
        },
        /**
         * Create bookmark by create bookmark node.
         * @param {Boolean} [serializable]
         */
        createBookmark: function (serializable) {
            var startNode,
                endNode,
                baseId,
                clone,
                self = this,
                collapsed = self.collapsed;
            startNode = new Node('<span>', NULL, self.document);
            startNode.attr('_ke_bookmark', 1);
            startNode.css('display', 'none');

            // For IE, it must have something inside, otherwise it may be
            // removed during Dom operations.
            startNode.html('&nbsp;');

            if (serializable) {
                baseId = S.guid('ke_bm_');
                startNode.attr('id', baseId + 'S');
            }

            // If collapsed, the endNode will not be created.
            if (!collapsed) {
                endNode = startNode.clone();
                endNode.html('&nbsp;');

                if (serializable) {
                    endNode.attr('id', baseId + 'E');
                }

                clone = self.clone();
                clone.collapse();
                clone.insertNode(endNode);
            }

            clone = self.clone();
            clone.collapse(TRUE);
            clone.insertNode(startNode);

            // Update the range position.
            if (endNode) {
                self.setStartAfter(startNode);
                self.setEndBefore(endNode);
            } else {
                self.moveToPosition(startNode, KER.POSITION_AFTER_END);
            }

            return {
                startNode: serializable ? baseId + 'S' : startNode,
                endNode: serializable ? baseId + 'E' : endNode,
                serializable: serializable,
                collapsed: collapsed
            };
        },

        /**
         * Set the start position and then collapse range.
         * @param {KISSY.NodeList} node
         * @param {Number} position
         */
        moveToPosition: function (node, position) {
            var self = this;
            self.setStartAt(node, position);
            self.collapse(TRUE);
        },

        /**
         * Pull range out of text edge and split text node if range is in the middle of text node.
         * @param {Boolean} ignoreStart
         * @param {Boolean} ignoreEnd
         */
        trim: function (ignoreStart, ignoreEnd) {
            var self = this,
                startContainer = self.startContainer,
                startOffset = self.startOffset,
                collapsed = self.collapsed;

            if (( !ignoreStart || collapsed ) &&
                startContainer[0] &&
                startContainer[0].nodeType === Dom.NodeType.TEXT_NODE) {
                // If the offset is zero, we just insert the new node before
                // the start.
                if (!startOffset) {
                    startOffset = startContainer._4eIndex();
                    startContainer = startContainer.parent();
                }
                // If the offset is at the end, we'll insert it after the text
                // node.
                else if (startOffset >= startContainer[0].nodeValue.length) {
                    startOffset = startContainer._4eIndex() + 1;
                    startContainer = startContainer.parent();
                }
                // In other case, we split the text node and insert the new
                // node at the split point.
                else {
                    var nextText = startContainer._4eSplitText(startOffset);

                    startOffset = startContainer._4eIndex() + 1;
                    startContainer = startContainer.parent();

                    // Check all necessity of updating the end boundary.
                    if (Dom.equals(self.startContainer, self.endContainer)) {
                        self.setEnd(nextText, self.endOffset - self.startOffset);
                    } else if (Dom.equals(startContainer, self.endContainer)) {
                        self.endOffset += 1;
                    }
                }

                self.setStart(startContainer, startOffset);

                if (collapsed) {
                    self.collapse(TRUE);
                    return;
                }
            }

            var endContainer = self.endContainer,
                endOffset = self.endOffset;

            if (!( ignoreEnd || collapsed ) &&
                endContainer[0] && endContainer[0].nodeType === Dom.NodeType.TEXT_NODE) {
                // If the offset is zero, we just insert the new node before
                // the start.
                if (!endOffset) {
                    endOffset = endContainer._4eIndex();
                    endContainer = endContainer.parent();
                }
                // If the offset is at the end, we'll insert it after the text
                // node.
                else if (endOffset >= endContainer[0].nodeValue.length) {
                    endOffset = endContainer._4eIndex() + 1;
                    endContainer = endContainer.parent();
                }
                // In other case, we split the text node and insert the new
                // node at the split point.
                else {
                    endContainer._4eSplitText(endOffset);

                    endOffset = endContainer._4eIndex() + 1;
                    endContainer = endContainer.parent();
                }

                self.setEnd(endContainer, endOffset);
            }
        },
        /**
         * Insert a new node at start position of current range
         * @param {KISSY.NodeList} node
         */
        insertNode: function (node) {
            var self = this;
            self.optimizeBookmark();
            self.trim(FALSE, TRUE);
            var startContainer = self.startContainer,
                startOffset = self.startOffset,
                nextNode = startContainer[0].childNodes[startOffset] || null;

            startContainer[0].insertBefore(node[0], nextNode);
            // Check if we need to update the end boundary.
            if (startContainer[0] === self.endContainer[0]) {
                self.endOffset++;
            }
            // Expand the range to embrace the new node.
            self.setStartBefore(node);
        },

        /**
         * Move range to previous saved bookmark.
         * @param bookmark
         */
        moveToBookmark: function (bookmark) {
            var self = this,
                doc = $(self.document);
            if (bookmark.is2) {
                // Get the start information.
                var startContainer = doc._4eGetByAddress(bookmark.start, bookmark.normalized),
                    startOffset = bookmark.startOffset,
                    endContainer = bookmark.end && doc._4eGetByAddress(bookmark.end, bookmark.normalized),
                    endOffset = bookmark.endOffset;

                // Set the start boundary.
                self.setStart(startContainer, startOffset);

                // Set the end boundary. If not available, collapse it.
                if (endContainer) {
                    self.setEnd(endContainer, endOffset);
                } else {
                    self.collapse(TRUE);
                }
            } else {
                // Created with createBookmark().
                var serializable = bookmark.serializable,
                    startNode = serializable ? S.one('#' + bookmark.startNode,
                        doc) : bookmark.startNode,
                    endNode = serializable ? S.one('#' + bookmark.endNode,
                        doc) : bookmark.endNode;

                // Set the range start at the bookmark start node position.
                self.setStartBefore(startNode);

                // Remove it, because it may interfere in the setEndBefore call.
                startNode._4eRemove();

                // Set the range end at the bookmark end node position, or simply
                // collapse it if it is not available.
                if (endNode && endNode[0]) {
                    self.setEndBefore(endNode);
                    endNode._4eRemove();
                } else {
                    self.collapse(TRUE);
                }
            }
        },

        /**
         * Find the node which contains current range completely.
         * @param {Boolean} includeSelf whether to return the only element with in range
         * @param {Boolean} ignoreTextNode whether to return text node's parent node.
         */
        getCommonAncestor: function (includeSelf, ignoreTextNode) {
            var self = this,
                start = self.startContainer,
                end = self.endContainer,
                ancestor;

            if (start[0] === end[0]) {
                if (includeSelf &&
                    start[0].nodeType === Dom.NodeType.ELEMENT_NODE &&
                    self.startOffset === self.endOffset - 1) {
                    ancestor = new Node(start[0].childNodes[self.startOffset]);
                } else {
                    ancestor = start;
                }
            } else {
                ancestor = start._4eCommonAncestor(end);
            }

            return ignoreTextNode && ancestor[0].nodeType === Dom.NodeType.TEXT_NODE ? ancestor.parent() : ancestor;
        },
        /**
         * Enlarge the range as mush as possible
         * @param {Number} unit
         * @method
         *
         *
         *      <div><span><span>^1</span>2^</span>x</div>
         *      =>
         *      <div>^<span&gt;<span>1</span>2</span>^x</div>
         */
        enlarge: (function () {
            function enlargeElement(self, left, stop, commonAncestor) {
                var container = self[left ? 'startContainer' : 'endContainer'],
                    enlarge,
                    sibling,
                    index = left ? 0 : 1,
                    commonReached = 0,
                    direction = left ? 'previousSibling' : 'nextSibling',
                    offset = self[left ? 'startOffset' : 'endOffset'];

                if (container[0].nodeType === Dom.NodeType.TEXT_NODE) {
                    if (left) {
                        // 不在字的开头，立即结束
                        if (offset) {
                            return;
                        }
                    } else {
                        if (offset < container[0].nodeValue.length) {
                            return;
                        }
                    }

                    // 文字节点的兄弟
                    sibling = container[0][direction];
                    // 可能会扩展到到的容器节点
                    enlarge = container[0].parentNode;
                } else {
                    // 开始节点的兄弟节点
                    sibling = container[0].childNodes[offset + (left ? -1 : 1)] || null;
                    // 可能会扩展到到的容器节点
                    enlarge = container[0];
                }

                while (enlarge) {
                    // 兄弟节点是否都是空节点？
                    while (sibling) {
                        if (isWhitespace(sibling) || isBookmark(sibling)) {
                            sibling = sibling[direction];
                        } else {
                            break;
                        }
                    }

                    // 一个兄弟节点阻止了扩展
                    if (sibling) {
                        // 如果没有超过公共祖先
                        if (!commonReached) {
                            // 仅仅扩展到兄弟
                            self[left ? 'setStartAfter' : 'setEndBefore']($(sibling));
                        }
                        return;
                    }

                    // 没有兄弟节点阻止

                    // 超过了公共祖先，先记下来，最终不能 partly 选择某个节点，要完全选中

                    enlarge = $(enlarge);

                    if (enlarge.nodeName() === 'body') {
                        return;
                    }

                    if (commonReached || enlarge.equals(commonAncestor)) {
                        stop[index] = enlarge;
                        commonReached = 1;
                    } else {
                        // 扩展到容器外边
                        self[left ? 'setStartBefore' : 'setEndAfter'](enlarge);
                    }

                    sibling = enlarge[0][direction];
                    enlarge = enlarge[0].parentNode;
                }

            }

            return function (unit) {
                var self = this, enlargeable;
                switch (unit) {
                    case KER.ENLARGE_ELEMENT :

                        if (self.collapsed) {
                            return;
                        }

                        var commonAncestor = self.getCommonAncestor(),
                            stop = [];

                        enlargeElement(self, 1, stop, commonAncestor);
                        enlargeElement(self, 0, stop, commonAncestor);

                        if (stop[0] && stop[1]) {
                            var commonStop = stop[0].contains(stop[1]) ? stop[1] : stop[0];
                            self.setStartBefore(commonStop);
                            self.setEndAfter(commonStop);
                        }

                        break;

                    case KER.ENLARGE_BLOCK_CONTENTS:
                    case KER.ENLARGE_LIST_ITEM_CONTENTS:

                        // Enlarging the start boundary.
                        var walkerRange = new KERange(self.document);
                        var body = new Node(self.document.body);

                        walkerRange.setStartAt(body, KER.POSITION_AFTER_START);
                        walkerRange.setEnd(self.startContainer, self.startOffset);

                        var walker = new Walker(walkerRange),
                            blockBoundary, // The node on which the enlarging should stop.
                            tailBr, //
                            defaultGuard = Walker.blockBoundary(
                                ( unit === KER.ENLARGE_LIST_ITEM_CONTENTS ) ?
                                { br: 1 } : NULL),
                        // Record the encountered 'blockBoundary' for later use.
                            boundaryGuard = function (node) {
                                var retVal = defaultGuard(node);
                                if (!retVal) {
                                    blockBoundary = $(node);
                                }
                                return retVal;
                            },
                        // Record the encountered 'tailBr' for later use.
                            tailBrGuard = function (node) {
                                var retVal = boundaryGuard(node);
                                if (!retVal && Dom.nodeName(node) === 'br') {
                                    tailBr = $(node);
                                }
                                return retVal;
                            };

                        walker.guard = boundaryGuard;

                        enlargeable = walker.lastBackward();

                        // It's the body which stop the enlarging if no block boundary found.
                        blockBoundary = blockBoundary || body;

                        // Start the range at different position by comparing
                        // the document position of it with 'enlargeable' node.
                        self.setStartAt(
                            blockBoundary,
                            blockBoundary.nodeName() !== 'br' &&
                                // <table></table> <span>1234^56</span> <table></table>
                                // =>
                                // <table></table> ^<span>123456</span>$ <table></table>

                                // <p> <span>123^456</span> </p>
                                // =>
                                // <p> ^<span>123456</span>$ </p>
                                ( !enlargeable && self.checkStartOfBlock() || enlargeable && blockBoundary.contains(enlargeable) ) ?
                                KER.POSITION_AFTER_START :
                                KER.POSITION_AFTER_END);

                        // Enlarging the end boundary.
                        walkerRange = self.clone();
                        walkerRange.collapse();
                        walkerRange.setEndAt(body, KER.POSITION_BEFORE_END);
                        walker = new Walker(walkerRange);

                        // tailBrGuard only used for on range end.
                        walker.guard = ( unit === KER.ENLARGE_LIST_ITEM_CONTENTS ) ?
                            tailBrGuard : boundaryGuard;
                        blockBoundary = NULL;
                        // End the range right before the block boundary node.

                        enlargeable = walker.lastForward();

                        // It's the body which stop the enlarging if no block boundary found.
                        blockBoundary = blockBoundary || body;

                        // Start the range at different position by comparing
                        // the document position of it with 'enlargeable' node.
                        self.setEndAt(
                            blockBoundary,
                            ( !enlargeable && self.checkEndOfBlock() || enlargeable && blockBoundary.contains(enlargeable) ) ?
                                KER.POSITION_BEFORE_END :
                                KER.POSITION_BEFORE_START);
                        // We must include the <br> at the end of range if there's
                        // one and we're expanding list item contents
                        if (tailBr) {
                            self.setEndAfter(tailBr);
                        }
                }
            };
        })(),

        /**
         * Check whether current range 's start position is at the start of a block (visible)
         * @return Boolean
         */
        checkStartOfBlock: function () {
            var self = this,
                startContainer = self.startContainer,
                startOffset = self.startOffset;

            // If the starting node is a text node, and non-empty before the offset,
            // then we're surely not at the start of block.
            if (startOffset && startContainer[0].nodeType === Dom.NodeType.TEXT_NODE) {
                var textBefore = S.trim(startContainer[0].nodeValue.substring(0, startOffset));
                if (textBefore.length) {
                    return FALSE;
                }
            }

            // Anticipate the trim() call here, so the walker will not make
            // changes to the Dom, which would not get reflected into this
            // range otherwise.
            self.trim();

            // We need to grab the block element holding the start boundary, so
            // let's use an element path for it.
            var path = new ElementPath(self.startContainer);

            // Creates a range starting at the block start until the range start.
            var walkerRange = self.clone();
            walkerRange.collapse(TRUE);
            walkerRange.setStartAt(path.block || path.blockLimit, KER.POSITION_AFTER_START);

            var walker = new Walker(walkerRange);
            walker.evaluator = getCheckStartEndBlockEvalFunction(TRUE);

            return walker.checkBackward();
        },

        /**
         * Check whether current range 's end position is at the end of a block (visible)
         * @return Boolean
         */
        checkEndOfBlock: function () {
            var self = this, endContainer = self.endContainer,
                endOffset = self.endOffset;

            // If the ending node is a text node, and non-empty after the offset,
            // then we're surely not at the end of block.
            if (endContainer[0].nodeType === Dom.NodeType.TEXT_NODE) {
                var textAfter = S.trim(endContainer[0].nodeValue.substring(endOffset));
                if (textAfter.length) {
                    return FALSE;
                }
            }

            // Anticipate the trim() call here, so the walker will not make
            // changes to the Dom, which would not get reflected into this
            // range otherwise.
            self.trim();

            // We need to grab the block element holding the start boundary, so
            // let's use an element path for it.
            var path = new ElementPath(self.endContainer);

            // Creates a range starting at the block start until the range start.
            var walkerRange = self.clone();
            walkerRange.collapse(FALSE);
            walkerRange.setEndAt(path.block || path.blockLimit, KER.POSITION_BEFORE_END);

            var walker = new Walker(walkerRange);
            walker.evaluator = getCheckStartEndBlockEvalFunction(FALSE);

            return walker.checkForward();
        },

        /**
         * Check whether current range is on the inner edge of the specified element.
         * @param {Number} checkType The checking side.
         * @param {KISSY.NodeList} element The target element to check.
         */
        checkBoundaryOfElement: function (element, checkType) {
            var walkerRange = this.clone();
            // Expand the range to element boundary.
            walkerRange[ checkType === KER.START ?
                'setStartAt' : 'setEndAt' ]
                (element, checkType === KER.START ?
                    KER.POSITION_AFTER_START
                    : KER.POSITION_BEFORE_END);

            var walker = new Walker(walkerRange);

            walker.evaluator = elementBoundaryEval;
            return walker[ checkType === KER.START ?
                'checkBackward' : 'checkForward' ]();
        },

        /**
         * Get two node which are at the edge of current range.
         * @return {Object} Map with startNode and endNode as key/value.
         */
        getBoundaryNodes: function () {
            var self = this,
                startNode = self.startContainer,
                endNode = self.endContainer,
                startOffset = self.startOffset,
                endOffset = self.endOffset,
                childCount;

            if (startNode[0].nodeType === Dom.NodeType.ELEMENT_NODE) {
                childCount = startNode[0].childNodes.length;
                if (childCount > startOffset) {
                    startNode = $(startNode[0].childNodes[startOffset]);
                } else if (childCount === 0) {
                    // ?? startNode
                    startNode = startNode._4ePreviousSourceNode();
                } else {
                    // startOffset >= childCount but childCount is not 0
                    // Try to take the node just after the current position.
                    startNode = startNode[0];
                    while (startNode.lastChild) {
                        startNode = startNode.lastChild;
                    }

                    startNode = $(startNode);

                    // Normally we should take the next node in DFS order. But it
                    // is also possible that we've already reached the end of
                    // document.
                    startNode = startNode._4eNextSourceNode() || startNode;
                }
            }

            if (endNode[0].nodeType === Dom.NodeType.ELEMENT_NODE) {
                childCount = endNode[0].childNodes.length;
                if (childCount > endOffset) {
                    endNode = $(endNode[0].childNodes[endOffset])
                        // in case endOffset === 0
                        ._4ePreviousSourceNode(TRUE);
                } else if (childCount === 0) {
                    endNode = endNode._4ePreviousSourceNode();
                } else {
                    // endOffset > childCount but childCount is not 0
                    // Try to take the node just before the current position.
                    endNode = endNode[0];
                    while (endNode.lastChild) {
                        endNode = endNode.lastChild;
                    }
                    endNode = $(endNode);
                }
            }

            // Sometimes the endNode will come right before startNode for collapsed
            // ranges. Fix it. (#3780)
            if (startNode._4ePosition(endNode) & KEP.POSITION_FOLLOWING) {
                startNode = endNode;
            }

            return { startNode: startNode, endNode: endNode };
        },

        /**
         * Wrap the content in range which is block-enlarged
         * at the start or end of current range into a block element.
         * @param {Boolean} isStart Start or end of current range tobe enlarged.
         * @param {String} blockTag Block element's tag name.
         * @return {KISSY.NodeList} Newly generated block element.
         */
        fixBlock: function (isStart, blockTag) {
            var self = this,
                bookmark = self.createBookmark(),
                fixedBlock = $(self.document.createElement(blockTag));
            self.collapse(isStart);
            self.enlarge(KER.ENLARGE_BLOCK_CONTENTS);
            fixedBlock[0].appendChild(self.extractContents());
            fixedBlock._4eTrim();
            if (!UA.ie) {
                fixedBlock._4eAppendBogus();
            }
            self.insertNode(fixedBlock);
            self.moveToBookmark(bookmark);
            return fixedBlock;
        },

        /**
         * Split current block which current range into two if current range is in the same block.
         * Fix block at the start and end position of range if necessary.
         * @param {String} blockTag Block tag if need fixBlock
         */
        splitBlock: function (blockTag) {
            var self = this,
                startPath = new ElementPath(self.startContainer),
                endPath = new ElementPath(self.endContainer),
                startBlockLimit = startPath.blockLimit,
                endBlockLimit = endPath.blockLimit,
                startBlock = startPath.block,
                endBlock = endPath.block,
                elementPath = NULL;

            // Do nothing if the boundaries are in different block limits.
            if (!startBlockLimit.equals(endBlockLimit)) {
                return NULL;
            }

            // Get or fix current blocks.
            if (blockTag !== 'br') {
                if (!startBlock) {
                    startBlock = self.fixBlock(TRUE, blockTag);
                    endBlock = new ElementPath(self.endContainer).block;
                }

                if (!endBlock) {
                    endBlock = self.fixBlock(FALSE, blockTag);
                }
            }

            // Get the range position.
            var isStartOfBlock = startBlock && self.checkStartOfBlock(),
                isEndOfBlock = endBlock && self.checkEndOfBlock();

            // Delete the current contents.
            self.deleteContents();

            if (startBlock && startBlock[0] === endBlock[0]) {
                if (isEndOfBlock) {
                    elementPath = new ElementPath(self.startContainer);
                    self.moveToPosition(endBlock, KER.POSITION_AFTER_END);
                    endBlock = NULL;
                }
                else if (isStartOfBlock) {
                    elementPath = new ElementPath(self.startContainer);
                    self.moveToPosition(startBlock, KER.POSITION_BEFORE_START);
                    startBlock = NULL;
                }
                else {
                    endBlock = self.splitElement(startBlock);
                    // In Gecko, the last child node must be a bogus <br>.
                    // Note: bogus <br> added under <ul> or <ol> would cause
                    // lists to be incorrectly rendered.
                    if (!UA.ie && !S.inArray(startBlock.nodeName(), ['ul', 'ol'])) {
                        startBlock._4eAppendBogus();
                    }
                }
            }

            return {
                previousBlock: startBlock,
                nextBlock: endBlock,
                wasStartOfBlock: isStartOfBlock,
                wasEndOfBlock: isEndOfBlock,
                elementPath: elementPath
            };
        },

        /**
         * Split toSplit element into two parts at current range's start position.
         * @param {KISSY.NodeList} toSplit Element to split.
         * @return {KISSY.NodeList} The second newly generated element.
         */
        splitElement: function (toSplit) {
            var self = this;
            if (!self.collapsed) {
                return NULL;
            }

            // Extract the contents of the block from the selection point to the end
            // of its contents.
            self.setEndAt(toSplit, KER.POSITION_BEFORE_END);
            var documentFragment = self.extractContents(),
            // Duplicate the element after it.
                clone = toSplit.clone(FALSE);

            // Place the extracted contents into the duplicated element.
            clone[0].appendChild(documentFragment);

            clone.insertAfter(toSplit);
            self.moveToPosition(toSplit, KER.POSITION_AFTER_END);
            return clone;
        },

        /**
         * Move the range to the depth-first start/end editing point inside
         * an element.
         * @param {KISSY.NodeList} el The element to find edit point into.
         * @param {Boolean} [isMoveToEnd] Find start or end editing point.
         * Set true to find end editing point.
         * @return {Boolean} Whether find edit point
         */
        moveToElementEditablePosition: function (el, isMoveToEnd) {
            function nextDFS(node, childOnly) {
                var next;

                if (node[0].nodeType === Dom.NodeType.ELEMENT_NODE &&
                    node._4eIsEditable()) {
                    next = node[ isMoveToEnd ? 'last' : 'first' ](nonWhitespaceOrIsBookmark, 1);
                }

                if (!childOnly && !next) {
                    next = node[ isMoveToEnd ? 'prev' : 'next' ](nonWhitespaceOrIsBookmark, 1);
                }

                return next;
            }

            var found = 0, self = this;

            while (el) {
                // Stop immediately if we've found a text node.
                if (el[0].nodeType === Dom.NodeType.TEXT_NODE) {
                    self.moveToPosition(el, isMoveToEnd ?
                        KER.POSITION_AFTER_END :
                        KER.POSITION_BEFORE_START);
                    found = 1;
                    break;
                }

                // If an editable element is found, move inside it, but not stop the searching.
                if (el[0].nodeType === Dom.NodeType.ELEMENT_NODE && el._4eIsEditable()) {
                    self.moveToPosition(el, isMoveToEnd ?
                        KER.POSITION_BEFORE_END :
                        KER.POSITION_AFTER_START);
                    found = 1;
                }

                el = nextDFS(el, found);
            }

            return !!found;
        },

        /**
         * Set range surround current node 's content.
         * @param {KISSY.NodeList} node
         */
        selectNodeContents: function (node) {
            var self = this, domNode = node[0];
            self.setStart(node, 0);
            self.setEnd(node, domNode.nodeType === Dom.NodeType.TEXT_NODE ?
                domNode.nodeValue.length :
                domNode.childNodes.length);
        },

        /**
         * Insert node by dtd.(not invalidate dtd convention)
         * @param {KISSY.NodeList} element
         */
        insertNodeByDtd: function (element) {
            var current,
                self = this,
                tmpDtd,
                last,
                elementName = element.nodeName(),
                isBlock = dtd.$block[ elementName ];
            self.deleteContents();
            if (isBlock) {
                current = self.getCommonAncestor(FALSE, TRUE);
                while (( tmpDtd = dtd[ current.nodeName() ] ) && !( tmpDtd && tmpDtd [ elementName ] )) {
                    var parent = current.parent();
                    // If we're in an empty block which indicate a new paragraph,
                    // simply replace it with the inserting block.(#3664)
                    if (self.checkStartOfBlock() && self.checkEndOfBlock()) {
                        self.setStartBefore(current);
                        self.collapse(TRUE);
                        current.remove();
                    } else {
                        last = current;
                    }
                    current = parent;

                }
                if (last) {
                    self.splitElement(last);
                }
            }
            // Insert the new node.
            self.insertNode(element);
        }
    });

    Utils.injectDom({
        _4eBreakParent: function (el, parent) {
            parent = $(parent);
            el = $(el);

            var KERange = Editor.Range,
                docFrag,
                range = new KERange(el[0].ownerDocument);

            // We'll be extracting part of this element, so let's use our
            // range to get the correct piece.
            range.setStartAfter(el);
            range.setEndAfter(parent);

            // Extract it.
            docFrag = range.extractContents();

            // Move the element outside the broken element.
            range.insertNode(el.remove());

            // Re-insert the extracted piece after the element.
            el.after(docFrag);
        }
    });

    Editor.Range = KERange;

    return KERange;
});
