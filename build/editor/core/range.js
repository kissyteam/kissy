/**
 * modified from ckeditor,range implementation across browsers for kissy editor
 * @author <yiminghe@gmail.com>
 */
/*
 Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.html or http://ckeditor.com/license
 */
KISSY.Editor.add("range", function (KE) {

    /**
     * Enum for range
     * @enum {number}
     */
    KE.RANGE = {
        POSITION_AFTER_START:1, // <element>^contents</element>		"^text"
        POSITION_BEFORE_END:2, // <element>contents^</element>		"text^"
        POSITION_BEFORE_START:3, // ^<element>contents</element>		^"text"
        POSITION_AFTER_END:4, // <element>contents</element>^		"text"
        ENLARGE_ELEMENT:1,
        ENLARGE_BLOCK_CONTENTS:2,
        ENLARGE_LIST_ITEM_CONTENTS:3,
        START:1,
        END:2,
        //STARTEND:3,
        SHRINK_ELEMENT:1,
        SHRINK_TEXT:2
    };
    KE["RANGE"] = KE.RANGE;

    var TRUE = true,
        FALSE = false,
        NULL = null,
        //OLD_IE = !window.getSelection,
        S = KISSY,
        KEN = KE.NODE,
        KER = KE.RANGE,
        KEP = KE.POSITION,
        Walker = KE.Walker,
        DOM = S.DOM,
        getByAddress = KE.Utils.getByAddress,
        UA = S.UA,
        dtd = KE.XHTML_DTD,
        ElementPath = KE.ElementPath,
        Node = S.Node,
        EMPTY = {"area":1, "base":1, "br":1, "col":1, "hr":1, "img":1, "input":1, "link":1, "meta":1, "param":1};

    /**
     * @constructor
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

    KERange.prototype.toString = function () {
        var s = [], self = this;
        s.push((self.startContainer[0].id || self.startContainer[0].nodeName) + ":" + self.startOffset);
        s.push((self.endContainer[0].id || self.endContainer[0].nodeName) + ":" + self.endOffset);
        return s.join("<br/>");
    };
    S.augment(KERange, {

        updateCollapsed:function () {
            var self = this;
            self.collapsed = (
                self.startContainer &&
                    self.endContainer &&
                    DOM._4e_equals(self.startContainer, self.endContainer) &&
                    self.startOffset == self.endOffset );
        },
        /**
         * Transforms the startContainer and endContainer properties from text
         * nodes to element nodes, whenever possible. This is actually possible
         * if either of the boundary containers point to a text node, and its
         * offset is set to zero, or after the last char in the node.
         */
        optimize:function () {
            var self = this, container = self.startContainer, offset = self.startOffset;

            if (container[0].nodeType != KEN.NODE_ELEMENT) {
                if (!offset)
                    self.setStartBefore(container);
                else if (offset >= container[0].nodeValue.length)
                    self.setStartAfter(container);
            }

            container = self.endContainer;
            offset = self.endOffset;

            if (container[0].nodeType != KEN.NODE_ELEMENT) {
                if (!offset)
                    self.setEndBefore(container);
                else if (offset >= container[0].nodeValue.length)
                    self.setEndAfter(container);
            }
        },
        setStartAfter:function (node) {
            this.setStart(node.parent(), node._4e_index() + 1);
        },

        setStartBefore:function (node) {
            this.setStart(node.parent(), node._4e_index());
        },

        setEndAfter:function (node) {
            this.setEnd(node.parent(), node._4e_index() + 1);
        },

        setEndBefore:function (node) {
            this.setEnd(node.parent(), node._4e_index());
        },
        optimizeBookmark:function () {
            var self = this, startNode = self.startContainer,
                endNode = self.endContainer;

            if (startNode && startNode._4e_name() == 'span'
                && startNode.attr('_ke_bookmark'))
                self.setStartAt(startNode, KER.POSITION_BEFORE_START);
            if (endNode && endNode._4e_name() == 'span'
                && endNode.attr('_ke_bookmark'))
                self.setEndAt(endNode, KER.POSITION_AFTER_END);
        },
        /**
         * Sets the start position of a Range.
         * @param {Node} startNode The node to start the range.
         * @param {Number} startOffset An integer greater than or equal to zero
         *        representing the offset for the start of the range from the start
         *        of startNode.
         */
        setStart:function (startNode, startOffset) {
            // W3C requires a check for the new position. If it is after the end
            // boundary, the range should be collapsed to the new start. It seams
            // we will not need this check for our use of this class so we can
            // ignore it for now.

            // Fixing invalid range start inside dtd empty elements.
            var self = this;
            if (startNode[0].nodeType == KEN.NODE_ELEMENT
                && EMPTY[ startNode._4e_name() ])
                startNode = startNode.parent(), startOffset = startNode._4e_index();

            self.startContainer = startNode;
            self.startOffset = startOffset;

            if (!self.endContainer) {
                self.endContainer = startNode;
                self.endOffset = startOffset;
            }

            self.updateCollapsed();
        },

        /**
         * Sets the end position of a Range.
         * @param {Node} endNode The node to end the range.
         * @param {Number} endOffset An integer greater than or equal to zero
         *        representing the offset for the end of the range from the start
         *        of endNode.
         */
        setEnd:function (endNode, endOffset) {
            // W3C requires a check for the new position. If it is before the start
            // boundary, the range should be collapsed to the new end. It seams we
            // will not need this check for our use of this class so we can ignore
            // it for now.

            // Fixing invalid range end inside dtd empty elements.
            var self = this;
            if (endNode[0].nodeType == KEN.NODE_ELEMENT
                && EMPTY[ endNode._4e_name() ])
                endNode = endNode.parent(), endOffset = endNode._4e_index() + 1;

            self.endContainer = endNode;
            self.endOffset = endOffset;

            if (!self.startContainer) {
                self.startContainer = endNode;
                self.startOffset = endOffset;
            }

            self.updateCollapsed();
        },
        setStartAt:function (node, position) {
            var self = this;
            switch (position) {
                case KER.POSITION_AFTER_START :
                    self.setStart(node, 0);
                    break;

                case KER.POSITION_BEFORE_END :
                    if (node[0].nodeType == KEN.NODE_TEXT)
                        self.setStart(node, node[0].nodeValue.length);
                    else
                        self.setStart(node, node[0].childNodes.length);
                    break;

                case KER.POSITION_BEFORE_START :
                    self.setStartBefore(node);
                    break;

                case KER.POSITION_AFTER_END :
                    self.setStartAfter(node);
            }

            self.updateCollapsed();
        },

        setEndAt:function (node, position) {
            var self = this;
            switch (position) {
                case KER.POSITION_AFTER_START :
                    self.setEnd(node, 0);
                    break;

                case KER.POSITION_BEFORE_END :
                    if (node[0].nodeType == KEN.NODE_TEXT)
                        self.setEnd(node, node[0].nodeValue.length);
                    else
                        self.setEnd(node, node[0].childNodes.length);
                    break;

                case KER.POSITION_BEFORE_START :
                    self.setEndBefore(node);
                    break;

                case KER.POSITION_AFTER_END :
                    self.setEndAfter(node);
            }

            self.updateCollapsed();
        },
        execContentsAction:function (action, docFrag) {
            var self = this,
                startNode = self.startContainer,
                endNode = self.endContainer,
                startOffset = self.startOffset,
                endOffset = self.endOffset,
                removeStartNode,
                t,
                doc = self.document,
                removeEndNode;
            self.optimizeBookmark();
            // For text containers, we must simply split the node and point to the
            // second part. The removal will be handled by the rest of the code .
            //最关键：一般起始都是在文字节点中，得到起点选择右边的文字节点，只对节点处理！
            if (endNode[0].nodeType == KEN.NODE_TEXT)
                endNode = endNode._4e_splitText(endOffset);
            else {
                // If the end container has children and the offset is pointing
                // to a child, then we should start from it.
                if (endNode[0].childNodes.length > 0) {
                    // If the offset points after the last node.
                    if (endOffset >= endNode[0].childNodes.length) {
                        // Let's create a temporary node and mark it for removal.
                        endNode = new Node(
                            endNode[0].appendChild(doc.createTextNode(""))
                        );
                        removeEndNode = TRUE;
                    }
                    else
                        endNode = new Node(endNode[0].childNodes[endOffset]);
                }
            }

            // For text containers, we must simply split the node. The removal will
            // be handled by the rest of the code .
            if (startNode[0].nodeType == KEN.NODE_TEXT) {
                startNode._4e_splitText(startOffset);
                // In cases the end node is the same as the start node, the above
                // splitting will also split the end, so me must move the end to
                // the second part of the split.
                if (startNode._4e_equals(endNode))
                    endNode = new Node(startNode[0].nextSibling);
            }
            else {
                // If the start container has children and the offset is pointing
                // to a child, then we should start from its previous sibling.

                // If the offset points to the first node, we don't have a
                // sibling, so let's use the first one, but mark it for removal.
                if (!startOffset) {
                    // Let's create a temporary node and mark it for removal.
                    t = new Node(doc.createTextNode(""));
                    startNode.prepend(t);
                    startNode = t;
                    removeStartNode = TRUE;
                }
                else if (startOffset >= startNode[0].childNodes.length) {
                    // Let's create a temporary node and mark it for removal.
                    //startNode = startNode[0].appendChild(self.document.createTextNode(''));
                    t = new Node(doc.createTextNode(""));
                    startNode.append(t);
                    startNode = t;
                    removeStartNode = TRUE;
                } else
                    startNode = new Node(
                        startNode[0].childNodes[startOffset].previousSibling
                    );
            }

            // Get the parent nodes tree for the start and end boundaries.
            //从根到自己
            var startParents = startNode._4e_parents(),
                endParents = endNode._4e_parents();

            // Compare them, to find the top most siblings.
            var i, topStart, topEnd;

            for (i = 0; i < startParents.length; i++) {
                topStart = startParents[ i ];
                topEnd = endParents[ i ];

                // The compared nodes will match until we find the top most
                // siblings (different nodes that have the same parent).
                // "i" will hold the index in the parents array for the top
                // most element.
                if (!topStart._4e_equals(topEnd))
                    break;
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
                if (
                    clone
                        &&
                        !levelStartNode._4e_equals(startNode)
                    ) {
                    // action = 0 = Delete
                    levelClone = clone.appendChild(levelStartNode._4e_clone()[0]);
                }
                else {
                    levelClone = null;
                }
                currentNode = levelStartNode[0].nextSibling;

                while (currentNode) {
                    // Stop processing when the current node matches a node in the
                    // endParents tree or if it is the endNode.
                    if (DOM._4e_equals(endParents[ j ], currentNode)
                        ||
                        DOM._4e_equals(endNode, currentNode))
                        break;

                    // Cache the next sibling.
                    currentSibling = currentNode.nextSibling;

                    // If cloning, just clone it.
                    if (action == 2)    // 2 = Clone
                        clone.appendChild(currentNode.cloneNode(TRUE));
                    else {
                        // Both Delete and Extract will remove the node.
                        DOM._4e_remove(currentNode);

                        // When Extracting, move the removed node to the docFrag.
                        if (action == 1)    // 1 = Extract
                            clone.appendChild(currentNode);
                    }

                    currentNode = currentSibling;
                }
                //ckeditor这里错了，当前节点的路径所在父节点不能clone(TRUE)，要在后面深入子节点处理
                if (levelClone)
                    clone = levelClone;
            }

            clone = docFrag;

            // Remove all previous sibling nodes for every node in the
            // endParents tree.
            for (var k = i; k < endParents.length; k++) {
                levelStartNode = endParents[ k ];

                // For Extract and Clone, we must clone this level.
                if (
                    clone
                        &&
                        action > 0
                        &&
                        !levelStartNode._4e_equals(endNode)
                    ) {
                    // action = 0 = Delete
                    levelClone = clone.appendChild(levelStartNode._4e_clone()[0]);
                } else {
                    levelClone = null;
                }

                // The processing of siblings may have already been done by the parent.
                if (
                    !startParents[ k ]
                        ||
                        !levelStartNode.parent()._4e_equals(startParents[ k ].parent())
                    ) {
                    currentNode = levelStartNode[0].previousSibling;
                    while (currentNode) {
                        // Stop processing when the current node matches a node in the
                        // startParents tree or if it is the startNode.
                        if (DOM._4e_equals(startParents[ k ], currentNode)
                            ||
                            DOM._4e_equals(startNode, currentNode))
                            break;

                        // Cache the next sibling.
                        currentSibling = currentNode.previousSibling;

                        // If cloning, just clone it.
                        if (action == 2) {    // 2 = Clone
                            clone.insertBefore(currentNode.cloneNode(TRUE),
                                clone.firstChild);
                        } else {
                            // Both Delete and Extract will remove the node.
                            DOM._4e_remove(currentNode);

                            // When Extracting, mode the removed node to the docFrag.
                            if (action == 1)    // 1 = Extract
                                clone.insertBefore(currentNode, clone.firstChild);
                        }

                        currentNode = currentSibling;
                    }
                }

                if (levelClone)
                    clone = levelClone;
            }

            if (action == 2) {   // 2 = Clone.

                // No changes in the DOM should be done, so fix the split text (if any).

                var startTextNode = self.startContainer[0];
                if (startTextNode.nodeType == KEN.NODE_TEXT
                    && startTextNode.nextSibling
                    //yiminghe note:careful,nextsilbling should be text node
                    && startTextNode.nextSibling.nodeType == KEN.NODE_TEXT) {
                    startTextNode.data += startTextNode.nextSibling.data;
                    startTextNode.parentNode.removeChild(startTextNode.nextSibling);
                }

                var endTextNode = self.endContainer[0];
                if (endTextNode.nodeType == KEN.NODE_TEXT &&
                    endTextNode.nextSibling &&
                    endTextNode.nextSibling.nodeType == KEN.NODE_TEXT) {
                    endTextNode.data += endTextNode.nextSibling.data;
                    endTextNode.parentNode.removeChild(endTextNode.nextSibling);
                }
            }
            else {
                // Collapse the range.

                // If a node has been partially selected, collapse the range between
                // topStart and topEnd. Otherwise, simply collapse it to the start. (W3C specs).
                if (
                    topStart && topEnd
                        &&
                        (
                            !startNode.parent()._4e_equals(topStart.parent())
                                ||
                                !endNode.parent()._4e_equals(topEnd.parent())
                            )
                    ) {
                    var endIndex = topEnd._4e_index();

                    // If the start node is to be removed, we must correct the
                    // index to reflect the removal.
                    if (removeStartNode &&
                        topEnd.parent()._4e_equals(startNode.parent()))
                        endIndex--;

                    self.setStart(topEnd.parent(), endIndex);
                }

                // Collapse it to the start.
                self.collapse(TRUE);
            }

            // Cleanup any marked node.
            if (removeStartNode)
                startNode._4e_remove();

            if (removeEndNode && endNode[0].parentNode)
            //不能使用remove()
                endNode._4e_remove();
        },

        collapse:function (toStart) {
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

        clone:function () {
            var self = this,
                clone = new KERange(self.document);

            clone.startContainer = self.startContainer;
            clone.startOffset = self.startOffset;
            clone.endContainer = self.endContainer;
            clone.endOffset = self.endOffset;
            clone.collapsed = self.collapsed;

            return clone;
        },
        getEnclosedNode:function () {
            var walkerRange = this.clone();
            // Optimize and analyze the range to avoid DOM destructive nature of walker.
            walkerRange.optimize();
            if (walkerRange.startContainer[0].nodeType != KEN.NODE_ELEMENT
                || walkerRange.endContainer[0].nodeType != KEN.NODE_ELEMENT)
                return NULL;
            //var current = walkerRange.startContainer[0].childNodes[walkerRange.startOffset];
            var walker = new KE.Walker(walkerRange),
                isNotBookmarks = bookmark(TRUE, undefined),
                isNotWhitespaces = whitespaces(TRUE), node, pre;
            walkerRange.evaluator = function (node) {
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
            return node && node._4e_equals(pre) ? node : NULL;
        },
        shrink:function (mode, selectContents) {
            // Unable to shrink a collapsed range.
            var self = this;
            if (!self.collapsed) {
                mode = mode || KER.SHRINK_TEXT;

                var walkerRange = self.clone(),
                    startContainer = self.startContainer,
                    endContainer = self.endContainer,
                    startOffset = self.startOffset,
                    endOffset = self.endOffset;
                //collapsed = self.collapsed;

                // Whether the start/end boundary is moveable.
                var moveStart = 1,
                    moveEnd = 1;

                if (startContainer && startContainer[0].nodeType == KEN.NODE_TEXT) {
                    if (!startOffset)
                        walkerRange.setStartBefore(startContainer);
                    else if (startOffset >= startContainer[0].nodeValue.length)
                        walkerRange.setStartAfter(startContainer);
                    else {
                        // Enlarge the range properly to avoid walker making
                        // DOM changes caused by triming the text nodes later.
                        walkerRange.setStartBefore(startContainer);
                        moveStart = 0;
                    }
                }

                if (endContainer && endContainer[0].nodeType == KEN.NODE_TEXT) {
                    if (!endOffset)
                        walkerRange.setEndBefore(endContainer);
                    else if (endOffset >= endContainer[0].nodeValue.length)
                        walkerRange.setEndAfter(endContainer);
                    else {
                        walkerRange.setEndAfter(endContainer);
                        moveEnd = 0;
                    }
                }

                var walker = new Walker(walkerRange);

                walker.evaluator = function (node) {
                    node = node[0] || node;
                    return node.nodeType == ( mode == KER.SHRINK_ELEMENT ?
                        KEN.NODE_ELEMENT : KEN.NODE_TEXT );
                };

                var currentElement;
                walker.guard = function (node, movingOut) {

                    node = node[0] || node;
                    // Stop when we're shrink in element mode while encountering a text node.
                    if (mode == KER.SHRINK_ELEMENT && node.nodeType == KEN.NODE_TEXT)
                        return FALSE;

                    // Stop when we've already walked "through" an element.
                    if (movingOut && node == currentElement)
                        return FALSE;

                    if (!movingOut && node.nodeType == KEN.NODE_ELEMENT)
                        currentElement = node;

                    return TRUE;
                };

                if (moveStart) {
                    var textStart = walker[ mode == KER.SHRINK_ELEMENT ? 'lastForward' : 'next']();
                    textStart && self.setStartAt(textStart, selectContents ? KER.POSITION_AFTER_START : KER.POSITION_BEFORE_START);
                }

                if (moveEnd) {
                    walker.reset();
                    var textEnd = walker[ mode == KER.SHRINK_ELEMENT ? 'lastBackward' : 'previous']();
                    textEnd && self.setEndAt(textEnd, selectContents ? KER.POSITION_BEFORE_END : KER.POSITION_AFTER_END);
                }

                return !!( moveStart || moveEnd );
            }
        },
//        getTouchedStartNode : function() {
//            var self = this,container = self.startContainer;
//
//            if (self.collapsed || container[0].nodeType != KEN.NODE_ELEMENT)
//                return container;
//
//            return container.childNodes[self.startOffset] || container;
//        },
        createBookmark2:function (normalized) {
            //debugger;
            var self = this, startContainer = self.startContainer,
                endContainer = self.endContainer,
                startOffset = self.startOffset,
                endOffset = self.endOffset,
                child, previous;

            // If there is no range then get out of here.
            // It happens on initial load in Safari #962 and if the editor it's
            // hidden also in Firefox
            if (!startContainer || !endContainer)
                return { start:0, end:0 };

            if (normalized) {
                // Find out if the start is pointing to a text node that will
                // be normalized.
                if (startContainer[0].nodeType == KEN.NODE_ELEMENT) {
                    child = new Node(startContainer[0].childNodes[startOffset]);

                    // In this case, move the start information to that text
                    // node.

                    //ie 有时 invalid argument？？
                    if (child && child[0] && child[0].nodeType == KEN.NODE_TEXT
                        && startOffset > 0 && child[0].previousSibling.nodeType == KEN.NODE_TEXT) {
                        startContainer = child;
                        startOffset = 0;
                    }

                }

                // Normalize the start.
                while (startContainer[0].nodeType == KEN.NODE_TEXT
                    && ( previous = startContainer._4e_previous() )
                    && previous[0].nodeType == KEN.NODE_TEXT) {
                    startContainer = previous;
                    startOffset += previous[0].nodeValue.length;
                }

                // Process the end only if not normalized.
                if (!self.collapsed) {
                    // Find out if the start is pointing to a text node that
                    // will be normalized.
                    if (endContainer[0].nodeType == KEN.NODE_ELEMENT) {
                        child = new Node(endContainer[0].childNodes[endOffset]);

                        // In this case, move the start information to that
                        // text node.
                        if (child && child[0] && child[0].nodeType == KEN.NODE_TEXT
                            && endOffset > 0 && child[0].previousSibling.nodeType == KEN.NODE_TEXT) {
                            endContainer = child;
                            endOffset = 0;
                        }
                    }

                    // Normalize the end.
                    while (endContainer[0].nodeType == KEN.NODE_TEXT
                        && ( previous = endContainer._4e_previous() )
                        && previous[0].nodeType == KEN.NODE_TEXT) {
                        endContainer = previous;
                        endOffset += previous[0].nodeValue.length;
                    }
                }
            }

            return {
                start:startContainer._4e_address(normalized),
                end:self.collapsed ? NULL : endContainer._4e_address(normalized),
                startOffset:startOffset,
                endOffset:endOffset,
                normalized:normalized,
                is2:TRUE        // It's a createBookmark2 bookmark.
            };
        },
        createBookmark:function (serializable) {
            var startNode,
                endNode,
                baseId,
                clone,
                self = this,
                collapsed = self.collapsed;
            startNode = new Node("<span>", NULL, self.document);
            startNode.attr('_ke_bookmark', 1);
            startNode.css('display', 'none');

            // For IE, it must have something inside, otherwise it may be
            // removed during DOM operations.
            startNode.html('&nbsp;');

            if (serializable) {
                baseId = S.guid('ke_bm_');
                startNode.attr('id', baseId + 'S');
            }

            // If collapsed, the endNode will not be created.
            if (!collapsed) {
                endNode = startNode._4e_clone();
                endNode.html('&nbsp;');

                if (serializable)
                    endNode.attr('id', baseId + 'E');

                clone = self.clone();
                clone.collapse();
                //S.log(clone.endContainer[0].nodeType);
                //S.log(clone.endOffset);
                clone.insertNode(endNode);
            }
            //S.log(endNode[0].parentNode.outerHTML);
            clone = self.clone();
            clone.collapse(TRUE);
            clone.insertNode(startNode);

            // Update the range position.
            if (endNode) {
                self.setStartAfter(startNode);
                self.setEndBefore(endNode);
            }
            else
                self.moveToPosition(startNode, KER.POSITION_AFTER_END);

            return {
                startNode:serializable ? baseId + 'S' : startNode,
                endNode:serializable ? baseId + 'E' : endNode,
                serializable:serializable,
                collapsed:collapsed
            };
        },
        moveToPosition:function (node, position) {
            var self = this;
            self.setStartAt(node, position);
            self.collapse(TRUE);
        },
        trim:function (ignoreStart, ignoreEnd) {
            var self = this,
                startContainer = self.startContainer,
                startOffset = self.startOffset,
                collapsed = self.collapsed;
            if (( !ignoreStart || collapsed )
                && startContainer[0] && startContainer[0].nodeType == KEN.NODE_TEXT) {
                // If the offset is zero, we just insert the new node before
                // the start.
                if (!startOffset) {
                    startOffset = startContainer._4e_index();
                    startContainer = startContainer.parent();
                }
                // If the offset is at the end, we'll insert it after the text
                // node.
                else if (startOffset >= startContainer[0].nodeValue.length) {
                    startOffset = startContainer._4e_index() + 1;
                    startContainer = startContainer.parent();
                }
                // In other case, we split the text node and insert the new
                // node at the split point.
                else {
                    var nextText = startContainer._4e_splitText(startOffset);

                    startOffset = startContainer._4e_index() + 1;
                    startContainer = startContainer.parent();

                    // Check all necessity of updating the end boundary.
                    if (DOM._4e_equals(self.startContainer, self.endContainer))
                        self.setEnd(nextText, self.endOffset - self.startOffset);
                    else if (DOM._4e_equals(startContainer, self.endContainer))
                        self.endOffset += 1;
                }

                self.setStart(startContainer, startOffset);

                if (collapsed) {
                    self.collapse(TRUE);
                    return;
                }
            }

            var endContainer = self.endContainer, endOffset = self.endOffset;

            if (!( ignoreEnd || collapsed )
                && endContainer[0] && endContainer[0].nodeType == KEN.NODE_TEXT) {
                // If the offset is zero, we just insert the new node before
                // the start.
                if (!endOffset) {
                    endOffset = endContainer._4e_index();
                    endContainer = endContainer.parent();
                }
                // If the offset is at the end, we'll insert it after the text
                // node.
                else if (endOffset >= endContainer.nodeValue.length) {
                    endOffset = endContainer._4e_index() + 1;
                    endContainer = endContainer.parent();
                }
                // In other case, we split the text node and insert the new
                // node at the split point.
                else {
                    endContainer._4e_splitText(endOffset);

                    endOffset = endContainer._4e_index() + 1;
                    endContainer = endContainer.parent();
                }

                self.setEnd(endContainer, endOffset);
            }
        },

        insertNode:function (node) {
            var self = this;
            self.optimizeBookmark();
            self.trim(FALSE, TRUE);
            var startContainer = self.startContainer,
                startOffset = self.startOffset,
                nextNode = startContainer[0].childNodes[startOffset] || null;

            startContainer[0].insertBefore(node[0] || node, nextNode);
            // Check if we need to update the end boundary.
            if (DOM._4e_equals(node.parent(), self.endContainer))
                self.endOffset++;

            // Expand the range to embrace the new node.
            self.setStartBefore(node);
        },

        moveToBookmark:function (bookmark) {
            // Created with createBookmark2().
            var self = this;
            if (bookmark.is2) {
                // Get the start information.
                var startContainer = getByAddress(self.document, bookmark.start, bookmark.normalized),
                    startOffset = bookmark.startOffset,
                    endContainer = bookmark.end && getByAddress(self.document, bookmark.end, bookmark.normalized),
                    endOffset = bookmark.endOffset;

                // Set the start boundary.
                self.setStart(startContainer, startOffset);

                // Set the end boundary. If not available, collapse it.
                if (endContainer)
                    self.setEnd(endContainer, endOffset);
                else
                    self.collapse(TRUE);
            } else {
                // Created with createBookmark().
                var serializable = bookmark.serializable,
                    startNode = serializable ? S.one("#" + bookmark.startNode, self.document) : bookmark.startNode,
                    endNode = serializable ? S.one("#" + bookmark.endNode, self.document) : bookmark.endNode;

                // Set the range start at the bookmark start node position.
                self.setStartBefore(startNode);

                // Remove it, because it may interfere in the setEndBefore call.
                startNode._4e_remove();

                // Set the range end at the bookmark end node position, or simply
                // collapse it if it is not available.
                if (endNode && endNode[0]) {
                    self.setEndBefore(endNode);
                    endNode._4e_remove();
                }
                else
                    self.collapse(TRUE);
            }
        },
        getCommonAncestor:function (includeSelf, ignoreTextNode) {
            var self = this, start = self.startContainer,
                end = self.endContainer,
                ancestor;

            if (DOM._4e_equals(start, end)) {
                if (includeSelf
                    && start[0].nodeType == KEN.NODE_ELEMENT
                    && self.startOffset == self.endOffset - 1)
                    ancestor = new Node(start[0].childNodes[self.startOffset]);
                else
                    ancestor = start;
            }
            else
                ancestor = start._4e_commonAncestor(end);

            return ignoreTextNode && ancestor[0].nodeType == KEN.NODE_TEXT
                ? ancestor.parent() : ancestor;
        },
        enlarge:function (unit) {
            var self = this;
            switch (unit) {
                case KER.ENLARGE_ELEMENT :

                    if (self.collapsed)
                        return;

                    // Get the common ancestor.
                    var commonAncestor = self.getCommonAncestor(), body = new Node(self.document.body),
                        // For each boundary
                        //		a. Depending on its position, find out the first node to be checked (a sibling) or, if not available, to be enlarge.
                        //		b. Go ahead checking siblings and enlarging the boundary as much as possible until the common ancestor is not reached. After reaching the common ancestor, just save the enlargeable node to be used later.

                        startTop, endTop,
                        enlargeable, sibling, commonReached,

                        // Indicates that the node can be added only if whitespace
                        // is available before it.
                        needsWhiteSpace = FALSE, isWhiteSpace, siblingText,

                        // Process the start boundary.

                        container = self.startContainer,
                        offset = self.startOffset;

                    if (container[0].nodeType == KEN.NODE_TEXT) {
                        if (offset) {
                            // Check if there is any non-space text before the
                            // offset. Otherwise, container is NULL.
                            container = !S.trim(container[0].nodeValue.substring(0, offset)).length && container;

                            // If we found only whitespace in the node, it
                            // means that we'll need more whitespace to be able
                            // to expand. For example, <i> can be expanded in
                            // "A <i> [B]</i>", but not in "A<i> [B]</i>".
                            needsWhiteSpace = !!container;
                        }

                        if (container) {
                            if (!( sibling = container[0].previousSibling ))
                                enlargeable = container.parent();
                        }
                    }
                    else {
                        // If we have offset, get the node preceeding it as the
                        // first sibling to be checked.
                        if (offset)
                            sibling = container[0].childNodes[offset - 1] || container[0].lastChild;

                        // If there is no sibling, mark the container to be
                        // enlarged.
                        if (!sibling)
                            enlargeable = container;
                    }

                    while (enlargeable || sibling) {
                        if (enlargeable && !sibling) {
                            // If we reached the common ancestor, mark the flag
                            // for it.
                            if (!commonReached && DOM._4e_equals(enlargeable, commonAncestor))
                                commonReached = TRUE;

                            if (!body.contains(enlargeable))
                                break;

                            // If we don't need space or this element breaks
                            // the line, then enlarge it.
                            if (!needsWhiteSpace || enlargeable.css('display') != 'inline') {
                                needsWhiteSpace = FALSE;

                                // If the common ancestor has been reached,
                                // we'll not enlarge it immediately, but just
                                // mark it to be enlarged later if the end
                                // boundary also enlarges it.
                                if (commonReached)
                                    startTop = enlargeable;
                                else
                                    self.setStartBefore(enlargeable);
                            }

                            sibling = enlargeable[0].previousSibling;
                        }

                        // Check all sibling nodes preceeding the enlargeable
                        // node. The node wil lbe enlarged only if none of them
                        // blocks it.
                        while (sibling) {
                            // This flag indicates that this node has
                            // whitespaces at the end.
                            isWhiteSpace = FALSE;

                            if (sibling.nodeType == KEN.NODE_TEXT) {
                                siblingText = sibling.nodeValue;

                                if (/[^\s\ufeff]/.test(siblingText))
                                    sibling = NULL;

                                isWhiteSpace = /[\s\ufeff]$/.test(siblingText);
                            }
                            else {
                                // If this is a visible element.
                                // We need to check for the bookmark attribute because IE insists on
                                // rendering the display:none nodes we use for bookmarks. (#3363)
                                // Line-breaks (br) are rendered with zero width, which we don't want to include. (#7041)
                                if ((sibling.offsetWidth > 0 || DOM._4e_name(sibling) == "br") && !sibling.getAttribute('_ke_bookmark')) {
                                    // We'll accept it only if we need
                                    // whitespace, and this is an inline
                                    // element with whitespace only.
                                    if (needsWhiteSpace && dtd.$removeEmpty[ sibling.nodeName.toLowerCase() ]) {
                                        // It must contains spaces and inline elements only.

                                        siblingText = DOM.text(sibling);

                                        if ((/[^\s\ufeff]/).test(siblingText))    // Spaces + Zero Width No-Break Space (U+FEFF)
                                            sibling = NULL;
                                        else {
                                            var allChildren = sibling.all || sibling.getElementsByTagName('*');
                                            for (var i = 0, child; child = allChildren[ i++ ];) {
                                                if (!dtd.$removeEmpty[ child.nodeName.toLowerCase() ]) {
                                                    sibling = NULL;
                                                    break;
                                                }
                                            }
                                        }

                                        if (sibling)
                                            isWhiteSpace = !!siblingText.length;
                                    }
                                    else
                                        sibling = NULL;
                                }
                            }

                            // A node with whitespaces has been found.
                            if (isWhiteSpace) {
                                // Enlarge the last enlargeable node, if we
                                // were waiting for spaces.
                                if (needsWhiteSpace) {
                                    if (commonReached)
                                        startTop = enlargeable;
                                    else if (enlargeable)
                                        self.setStartBefore(enlargeable);
                                }
                                else
                                    needsWhiteSpace = TRUE;
                            }

                            if (sibling) {
                                var next = sibling.previousSibling;

                                if (!enlargeable && !next) {
                                    // Set the sibling as enlargeable, so it's
                                    // parent will be get later outside this while.
                                    enlargeable = new Node(sibling);
                                    sibling = NULL;
                                    break;
                                }

                                sibling = next;
                            }
                            else {
                                // If sibling has been set to NULL, then we
                                // need to stop enlarging.
                                enlargeable = NULL;
                            }
                        }

                        if (enlargeable)
                            enlargeable = enlargeable.parent();
                    }

                    // Process the end boundary. This is basically the same
                    // code used for the start boundary, with small changes to
                    // make it work in the opposite side (to the right). This
                    // makes it difficult to reuse the code here. So, fixes to
                    // the above code are likely to be replicated here.

                    container = self.endContainer;
                    offset = self.endOffset;

                    // Reset the common variables.
                    enlargeable = sibling = NULL;
                    commonReached = needsWhiteSpace = FALSE;

                    if (container[0].nodeType == KEN.NODE_TEXT) {
                        // Check if there is any non-space text after the
                        // offset. Otherwise, container is NULL.
                        container = !S.trim(container[0].nodeValue.substring(offset)).length && container;

                        // If we found only whitespace in the node, it
                        // means that we'll need more whitespace to be able
                        // to expand. For example, <i> can be expanded in
                        // "A <i> [B]</i>", but not in "A<i> [B]</i>".
                        needsWhiteSpace = !( container && container[0].nodeValue.length );

                        if (container) {
                            if (!( sibling = container[0].nextSibling ))
                                enlargeable = container.parent();
                        }
                    }
                    else {
                        // Get the node right after the boudary to be checked
                        // first.
                        sibling = container[0].childNodes[offset];

                        if (!sibling)
                            enlargeable = container;
                    }

                    while (enlargeable || sibling) {
                        if (enlargeable && !sibling) {
                            if (!commonReached && DOM._4e_equals(enlargeable, commonAncestor))
                                commonReached = TRUE;

                            if (!body.contains(enlargeable))
                                break;

                            if (!needsWhiteSpace || enlargeable.css('display') != 'inline') {
                                needsWhiteSpace = FALSE;

                                if (commonReached)
                                    endTop = enlargeable;
                                else if (enlargeable)
                                    self.setEndAfter(enlargeable);
                            }

                            sibling = enlargeable[0].nextSibling;
                        }

                        while (sibling) {
                            isWhiteSpace = FALSE;

                            if (sibling.nodeType == KEN.NODE_TEXT) {
                                siblingText = sibling.nodeValue;

                                if (/[^\s\ufeff]/.test(siblingText))
                                    sibling = NULL;

                                isWhiteSpace = /^[\s\ufeff]/.test(siblingText);
                            }
                            else {
                                // If this is a visible element.
                                // We need to check for the bookmark attribute because IE insists on
                                // rendering the display:none nodes we use for bookmarks. (#3363)
                                if ((sibling.offsetWidth > 0
                                    // <p>^xx^<br/></p> -> ^<p>xx<br/></p> : wrong
                                    // bug report@2012-05-08
                                    || DOM._4e_name(sibling) == "br"
                                    )
                                    && !sibling.getAttribute('_ke_bookmark')) {
                                    // We'll accept it only if we need
                                    // whitespace, and this is an inline
                                    // element with whitespace only.
                                    if (needsWhiteSpace && dtd.$removeEmpty[ sibling.nodeName.toLowerCase() ]) {
                                        // It must contains spaces and inline elements only.

                                        siblingText = DOM.text(sibling);

                                        if ((/[^\s\ufeff]/).test(siblingText))
                                            sibling = NULL;
                                        else {
                                            allChildren = sibling.all || sibling.getElementsByTagName('*');
                                            for (i = 0; child = allChildren[ i++ ];) {
                                                if (!dtd.$removeEmpty[ child.nodeName.toLowerCase() ]) {
                                                    sibling = NULL;
                                                    break;
                                                }
                                            }
                                        }

                                        if (sibling)
                                            isWhiteSpace = !!siblingText.length;
                                    }
                                    else
                                        sibling = NULL;
                                }
                            }

                            if (isWhiteSpace) {
                                if (needsWhiteSpace) {
                                    if (commonReached)
                                        endTop = enlargeable;
                                    else
                                        self.setEndAfter(enlargeable);
                                }
                            }

                            if (sibling) {
                                next = sibling.nextSibling;

                                if (!enlargeable && !next) {
                                    enlargeable = new Node(sibling);
                                    sibling = NULL;
                                    break;
                                }

                                sibling = next;
                            }
                            else {
                                // If sibling has been set to NULL, then we
                                // need to stop enlarging.
                                enlargeable = NULL;
                            }
                        }

                        if (enlargeable)
                            enlargeable = enlargeable.parent();
                    }

                    // If the common ancestor can be enlarged by both boundaries, then include it also.
                    if (startTop && endTop) {
                        commonAncestor = startTop.contains(endTop) ? endTop : startTop;
                        self.setStartBefore(commonAncestor);
                        self.setEndAfter(commonAncestor);
                    }
                    break;

                case KER.ENLARGE_BLOCK_CONTENTS:
                case KER.ENLARGE_LIST_ITEM_CONTENTS:

                    // Enlarging the start boundary.
                    var walkerRange = new KERange(self.document);
                    body = new Node(self.document.body);

                    walkerRange.setStartAt(body, KER.POSITION_AFTER_START);
                    walkerRange.setEnd(self.startContainer, self.startOffset);

                    var walker = new Walker(walkerRange),
                        blockBoundary, // The node on which the enlarging should stop.
                        tailBr, //
                        defaultGuard = Walker.blockBoundary(
                            ( unit == KER.ENLARGE_LIST_ITEM_CONTENTS ) ?
                            { br:1 } : NULL),
                        // Record the encountered 'blockBoundary' for later use.
                        boundaryGuard = function (node) {
                            var retval = defaultGuard(node);
                            if (!retval)
                                blockBoundary = node;
                            return retval;
                        },
                        // Record the encounted 'tailBr' for later use.
                        tailBrGuard = function (node) {
                            var retval = boundaryGuard(node);
                            if (!retval && node[0] && node._4e_name() == 'br')
                                tailBr = node;
                            return retval;
                        };

                    walker.guard = boundaryGuard;

                    enlargeable = walker.lastBackward();

                    // It's the body which stop the enlarging if no block boundary found.
                    blockBoundary = blockBoundary || body;

                    // Start the range at different position by comparing
                    // the document position of it with 'enlargeable' node.
                    self.setStartAt(
                        blockBoundary,
                        blockBoundary._4e_name() != 'br' &&
                            ( !enlargeable && self.checkStartOfBlock()
                                || enlargeable && blockBoundary.contains(enlargeable) ) ?
                            KER.POSITION_AFTER_START :
                            KER.POSITION_AFTER_END);

                    // Enlarging the end boundary.
                    walkerRange = self.clone();
                    walkerRange.collapse();
                    walkerRange.setEndAt(body, KER.POSITION_BEFORE_END);
                    walker = new Walker(walkerRange);

                    // tailBrGuard only used for on range end.
                    walker.guard = ( unit == KER.ENLARGE_LIST_ITEM_CONTENTS ) ?
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
                        ( !enlargeable && self.checkEndOfBlock()
                            || enlargeable && blockBoundary.contains(enlargeable) ) ?
                            KER.POSITION_BEFORE_END :
                            KER.POSITION_BEFORE_START);
                    // We must include the <br> at the end of range if there's
                    // one and we're expanding list item contents
                    if (tailBr)
                        self.setEndAfter(tailBr);
            }
        },
        checkStartOfBlock:function () {
            var self = this, startContainer = self.startContainer,
                startOffset = self.startOffset;

            // If the starting node is a text node, and non-empty before the offset,
            // then we're surely not at the start of block.
            if (startOffset && startContainer[0].nodeType == KEN.NODE_TEXT) {
                var textBefore = S.trim(startContainer[0].nodeValue.substring(0, startOffset));
                if (textBefore.length)
                    return FALSE;
            }

            // Antecipate the trim() call here, so the walker will not make
            // changes to the DOM, which would not get reflected into this
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

        checkEndOfBlock:function () {
            var self = this, endContainer = self.endContainer,
                endOffset = self.endOffset;

            // If the ending node is a text node, and non-empty after the offset,
            // then we're surely not at the end of block.
            if (endContainer[0].nodeType == KEN.NODE_TEXT) {
                var textAfter = S.trim(endContainer[0].nodeValue.substring(endOffset));
                if (textAfter.length)
                    return FALSE;
            }

            // Antecipate the trim() call here, so the walker will not make
            // changes to the DOM, which would not get reflected into this
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
        deleteContents:function () {
            var self = this;
            if (self.collapsed)
                return;
            self.execContentsAction(0);
        },
        extractContents:function () {
            var self = this, docFrag = self.document.createDocumentFragment();
            if (!self.collapsed)
                self.execContentsAction(1, docFrag);
            return docFrag;
        },
        /**
         * Check whether current range is on the inner edge of the specified element.
         * @param {Number} checkType ( CKEDITOR.START | CKEDITOR.END ) The checking side.
         * @param {Node} element The target element to check.
         */
        checkBoundaryOfElement:function (element, checkType) {
            var walkerRange = this.clone();
            // Expand the range to element boundary.
            walkerRange[ checkType == KER.START ?
                'setStartAt' : 'setEndAt' ]
                (element, checkType == KER.START ?
                    KER.POSITION_AFTER_START
                    : KER.POSITION_BEFORE_END);

            var walker = new Walker(walkerRange);

            walker.evaluator = elementBoundaryEval;
            return walker[ checkType == KER.START ?
                'checkBackward' : 'checkForward' ]();
        },

        getBoundaryNodes:function () {
            var self = this, startNode = self.startContainer,
                endNode = self.endContainer,
                startOffset = self.startOffset,
                endOffset = self.endOffset,
                childCount;

            if (startNode[0].nodeType == KEN.NODE_ELEMENT) {
                childCount = startNode[0].childNodes.length;
                if (childCount > startOffset)
                    startNode = new Node(startNode[0].childNodes[startOffset]);
                else if (childCount < 1)
                    startNode = startNode._4e_previousSourceNode();
                else        // startOffset > childCount but childCount is not 0
                {
                    // Try to take the node just after the current position.
                    startNode = startNode[0];
                    while (startNode.lastChild)
                        startNode = startNode.lastChild;
                    startNode = new Node(startNode);

                    // Normally we should take the next node in DFS order. But it
                    // is also possible that we've already reached the end of
                    // document.
                    startNode = startNode._4e_nextSourceNode() || startNode;
                }
            }

            if (endNode[0].nodeType == KEN.NODE_ELEMENT) {
                childCount = endNode[0].childNodes.length;
                if (childCount > endOffset)
                    endNode = new Node(endNode[0].childNodes[endOffset])._4e_previousSourceNode(TRUE);
                else if (childCount < 1)
                    endNode = endNode._4e_previousSourceNode();
                else        // endOffset > childCount but childCount is not 0
                {
                    // Try to take the node just before the current position.
                    endNode = endNode[0];
                    while (endNode.lastChild)
                        endNode = endNode.lastChild;
                    endNode = new Node(endNode);
                }
            }

            // Sometimes the endNode will come right before startNode for collapsed
            // ranges. Fix it. (#3780)
            if (startNode._4e_position(endNode) & KEP.POSITION_FOLLOWING)
                startNode = endNode;

            return { startNode:startNode, endNode:endNode };
        },
        fixBlock:function (isStart, blockTag) {
            var self = this,
                bookmark = self.createBookmark(),
                fixedBlock = new Node(self.document.createElement(blockTag));
            self.collapse(isStart);
            self.enlarge(KER.ENLARGE_BLOCK_CONTENTS);
            fixedBlock[0].appendChild(self.extractContents());
            fixedBlock._4e_trim();
            if (!UA['ie']) {
                fixedBlock._4e_appendBogus();
            }
            self.insertNode(fixedBlock);
            self.moveToBookmark(bookmark);
            return fixedBlock;
        },
        splitBlock:function (blockTag) {
            var self = this, startPath = new ElementPath(self.startContainer),
                endPath = new ElementPath(self.endContainer),
                startBlockLimit = startPath.blockLimit,
                endBlockLimit = endPath.blockLimit,
                startBlock = startPath.block,
                endBlock = endPath.block,
                elementPath = NULL;
            // Do nothing if the boundaries are in different block limits.
            if (!startBlockLimit._4e_equals(endBlockLimit))
                return NULL;

            // Get or fix current blocks.
            if (blockTag != 'br') {
                if (!startBlock) {
                    startBlock = self.fixBlock(TRUE, blockTag);
                    endBlock = new ElementPath(self.endContainer).block;
                }

                if (!endBlock)
                    endBlock = self.fixBlock(FALSE, blockTag);
            }

            // Get the range position.
            var isStartOfBlock = startBlock && self.checkStartOfBlock(),
                isEndOfBlock = endBlock && self.checkEndOfBlock();

            // Delete the current contents.
            // Why is 2.x doing CheckIsEmpty()?
            self.deleteContents();

            if (startBlock && DOM._4e_equals(startBlock, endBlock)) {
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
                    if (!UA['ie'] && !S.inArray(startBlock._4e_name(), ['ul', 'ol']))
                        startBlock._4e_appendBogus();
                }
            }

            return {
                previousBlock:startBlock,
                nextBlock:endBlock,
                wasStartOfBlock:isStartOfBlock,
                wasEndOfBlock:isEndOfBlock,
                elementPath:elementPath
            };
        },
        splitElement:function (toSplit) {
            var self = this;
            if (!self.collapsed)
                return NULL;

            // Extract the contents of the block from the selection point to the end
            // of its contents.
            self.setEndAt(toSplit, KER.POSITION_BEFORE_END);
            var documentFragment = self.extractContents(),
                // Duplicate the element after it.
                clone = toSplit._4e_clone(FALSE);

            // Place the extracted contents into the duplicated element.
            clone[0].appendChild(documentFragment);
            clone.insertAfter(toSplit);
            self.moveToPosition(toSplit, KER.POSITION_AFTER_END);
            return clone;
        },
        moveToElementEditablePosition:function (el, isMoveToEnd) {
            var self = this, isEditable, xhtml_dtd = KE.XHTML_DTD;

            // Empty elements are rejected.
            if (xhtml_dtd.$empty[ el._4e_name() ])
                return FALSE;

            while (el && el[0].nodeType == KEN.NODE_ELEMENT) {
                isEditable = el._4e_isEditable();

                // If an editable element is found, move inside it.
                if (isEditable) {
                    self.moveToPosition(el, isMoveToEnd ?
                        KER.POSITION_BEFORE_END :
                        KER.POSITION_AFTER_START);
                    // 不要返回，继续找可能的文字位置
                }
                // Stop immediately if we've found a non editable inline element (e.g <img>).
                else if (xhtml_dtd.$inline[ el._4e_name() ]) {
                    self.moveToPosition(el, isMoveToEnd ?
                        KER.POSITION_AFTER_END :
                        KER.POSITION_BEFORE_START);
                    return TRUE;
                }

                // Non-editable non-inline elements are to be bypassed, getting the next one.
                if (xhtml_dtd.$empty[ el._4e_name() ])
                    el = el[ isMoveToEnd ? '_4e_previous' : '_4e_next' ](nonWhitespaceOrBookmarkEval);
                else {
                    if (isMoveToEnd) {
                        el = el._4e_last(nonWhitespaceOrBookmarkEval);
                    } else {
                        el = el._4e_first(nonWhitespaceOrBookmarkEval);
                    }
                }
                // Stop immediately if we've found a text node.
                if (el && el[0].nodeType == KEN.NODE_TEXT) {
                    self.moveToPosition(el, isMoveToEnd ?
                        KER.POSITION_AFTER_END :
                        KER.POSITION_BEFORE_START);
                    return TRUE;
                }
            }

            return isEditable;
        },

        selectNodeContents:function (node) {
            this.setStart(node, 0);
            this.setEnd(node, node[0].nodeType == KEN.NODE_TEXT ?
                node[0].nodeValue.length :
                node[0].childNodes.length);
        }
    });
    var inlineChildReqElements = { "abbr":1, "acronym":1, "b":1, "bdo":1,
        "big":1, "cite":1, "code":1, "del":1, "dfn":1,
        "em":1, "font":1, "i":1, "ins":1, "label":1,
        "kbd":1, "q":1, "samp":1, "small":1, "span":1,
        "strike":1, "strong":1, "sub":1, "sup":1, "tt":1, "u":1, 'var':1 };

    // Evaluator for CKEDITOR.dom.element::checkBoundaryOfElement, reject any
    // text node and non-empty elements unless it's being bookmark text.
    function elementBoundaryEval(node) {
        // Reject any text node unless it's being bookmark
        // OR it's spaces. (#3883)
        //如果不是文本节点并且是空的，可以继续取下一个判断边界
        var c1 = node[0].nodeType != KEN.NODE_TEXT
            && node._4e_name() in dtd.$removeEmpty,
            //文本为空，可以继续取下一个判断边界
            c2 = !S.trim(node[0].nodeValue),
            //恩，进去了书签，可以继续取下一个判断边界
            c3 = !!node.parent().attr('_ke_bookmark');
        return c1 || c2 || c3;
    }

    var whitespaceEval = new Walker.whitespaces(),
        bookmarkEval = new Walker.bookmark();

    function nonWhitespaceOrBookmarkEval(node) {
        // Whitespaces and bookmark nodes are to be ignored.
        return !whitespaceEval(node) && !bookmarkEval(node);
    }

    function getCheckStartEndBlockEvalFunction(isStart) {
        var hadBr = FALSE, bookmarkEvaluator = Walker.bookmark(TRUE);
        return function (node) {
            // First ignore bookmark nodes.
            if (bookmarkEvaluator(node))
                return TRUE;

            if (node[0].nodeType == KEN.NODE_TEXT) {
                // If there's any visible text, then we're not at the start.
                if (S.trim(node[0].nodeValue).length)
                    return FALSE;
            }
            else if (node[0].nodeType == KEN.NODE_ELEMENT) {
                // If there are non-empty inline elements (e.g. <img />), then we're not
                // at the start.
                if (!inlineChildReqElements[ node._4e_name() ]) {
                    // If we're working at the end-of-block, forgive the first <br /> in non-IE
                    // browsers.
                    if (!isStart && !UA['ie'] && node._4e_name() == 'br' && !hadBr)
                        hadBr = TRUE;
                    else
                        return FALSE;
                }
            }
            return TRUE;
        };
    }

    function bookmark(contentOnly, isReject) {
        function isBookmarkNode(node) {
            return ( node && node.nodeName == 'span'
                && node.getAttribute('_ke_bookmark') );
        }

        return function (node) {
            var isBookmark, parent;
            // Is bookmark inner text node?
            isBookmark = ( node && !node.nodeName && ( parent = node.parentNode )
                && isBookmarkNode(parent) );
            // Is bookmark node?
            isBookmark = contentOnly ? isBookmark : isBookmark || isBookmarkNode(node);
            return isReject ^ isBookmark;
        };
    }

    function whitespaces(isReject) {
        return function (node) {
            node = node[0] || node;
            var isWhitespace = node && ( node.nodeType == KEN.NODE_TEXT )
                && !S.trim(node.nodeValue);
            return isReject ^ isWhitespace;
        };
    }


    KE.Range = KERange;
});
