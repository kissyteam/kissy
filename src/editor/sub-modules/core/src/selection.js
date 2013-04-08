/**
 * modified from ckeditor core - selection
 * @author yiminghe@gmail.com
 */
/*
 Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.html or http://ckeditor.com/license
 */
KISSY.add("editor/core/selection", function (S) {

    var Editor = S.Editor;

    /**
     * selection type enum
     * @enum {number}
     */
    Editor.SELECTION = {
        SELECTION_NONE:1,
        SELECTION_TEXT:2,
        SELECTION_ELEMENT:3

    };
    var TRUE = true,
        FALSE = false,
        NULL = null,
        UA = S.UA,
        DOM = S.DOM,
    //tryThese = Editor.Utils.tryThese,
        Node = S.Node,
        KES = Editor.SELECTION,
        KER = Editor.RANGE,
    // ie9 仍然采用老的 range api，发现新的不稳定
        OLD_IE = UA['ie'], //!window.getSelection,
    //EventTarget = S.EventTarget,
        Walker = Editor.Walker,
    //ElementPath = Editor.ElementPath,
        KERange = Editor.Range;

    /**
     * @constructor
     * @param document {Document}
     */
    function KESelection(document) {
        var self = this;
        self.document = document;
        self._ = {
            cache:{}
        };

        /**
         * IE BUG: The selection's document may be a different document than the
         * editor document. Return NULL if that's the case.
         */
        if (OLD_IE) {
            try {
                var range = self.getNative().createRange();
                if (!range
                    || ( range.item && range.item(0).ownerDocument != document )
                    || ( range.parentElement && range.parentElement().ownerDocument != document )) {
                    self.isInvalid = TRUE;
                }
            }
                // 2012-06-13 发布页 bug
                // 当焦点在一个跨域的 iframe 内，调用该操作抛拒绝访问异常
            catch (e) {
                self.isInvalid = TRUE;
            }
        }
    }

    var styleObjectElements = {
        "img":1, "hr":1, "li":1, "table":1, "tr":1, "td":1, "th":1, "embed":1, "object":1, "ol":1, "ul":1,
        "a":1, "input":1, "form":1, "select":1, "textarea":1, "button":1, "fieldset":1, "thead":1, "tfoot":1
    };

    S.augment(KESelection, {


        /**
         * Gets the native selection object from the browser.
         * @return {Object} The native selection object.
         * @example
         * var selection = editor.getSelection().<b>getNative()</b>;
         */
        getNative:!OLD_IE ?
            function () {
                var self = this,
                    cache = self._.cache;
                return cache.nativeSel || ( cache.nativeSel = DOM.getWindow(self.document).getSelection() );
            }
            :
            function () {
                var self = this, cache = self._.cache;
                return cache.nativeSel || ( cache.nativeSel = self.document.selection );
            },

        /**
         * Gets the type of the current selection. The following values are
         * available:
         * <ul>
         *        <li> SELECTION_NONE (1): No selection.</li>
         *        <li> SELECTION_TEXT (2): Text is selected or
         *            collapsed selection.</li>
         *        <li> SELECTION_ELEMENT (3): A element
         *            selection.</li>
         * </ul>
         * @return {number} One of the following constant values:
         *         SELECTION_NONE,  SELECTION_TEXT or
         *         SELECTION_ELEMENT.
         * @example
         * if ( editor.getSelection().<b>getType()</b> == SELECTION_TEXT )
         *     alert( 'Text is selected' );
         */
        getType:!OLD_IE ?
            function () {
                var self = this, cache = self._.cache;
                if (cache.type)
                    return cache.type;

                var type = KES.SELECTION_TEXT,
                    sel = self.getNative();

                if (!sel)
                    type = KES.SELECTION_NONE;
                else if (sel.rangeCount == 1) {
                    // Check if the actual selection is a control (IMG,
                    // TABLE, HR, etc...).

                    var range = sel.getRangeAt(0),
                        startContainer = range.startContainer;

                    if (startContainer == range.endContainer
                        && startContainer.nodeType == DOM.NodeType.ELEMENT_NODE
                        && Number(range.endOffset - range.startOffset) == 1
                        && styleObjectElements[ startContainer.childNodes[ range.startOffset ].nodeName.toLowerCase() ]) {
                        type = KES.SELECTION_ELEMENT;
                    }
                }

                return ( cache.type = type );
            } :
            function () {
                var self = this, cache = self._.cache;
                if (cache.type)
                    return cache.type;

                var type = KES.SELECTION_NONE;

                try {
                    var sel = self.getNative(),
                        ieType = sel.type;

                    if (ieType == 'Text')
                        type = KES.SELECTION_TEXT;

                    if (ieType == 'Control')
                        type = KES.SELECTION_ELEMENT;

                    // It is possible that we can still get a text range
                    // object even when type == 'None' is returned by IE.
                    // So we'd better check the object returned by
                    // createRange() rather than by looking at the type.
                    //当前一个操作选中文本，后一个操作右键点了字串中间就会出现了
                    if (sel.createRange().parentElement)
                        type = KES.SELECTION_TEXT;
                }
                catch (e) {
                }

                return ( cache.type = type );
            },

        getRanges:OLD_IE ?
            (function () {
                // Finds the container and offset for a specific boundary
                // of an IE range.
                /**
                 *
                 * @param {TextRange} range
                 * @param {Boolean=} start
                 */
                var getBoundaryInformation = function (range, start) {
                    // Creates a collapsed range at the requested boundary.
                    range = range.duplicate();
                    range.collapse(start);

                    // Gets the element that encloses the range entirely.
                    var parent = range.parentElement(), siblings = parent.childNodes,
                        testRange;

                    for (var i = 0; i < siblings.length; i++) {
                        var child = siblings[ i ];

                        if (child.nodeType == DOM.NodeType.ELEMENT_NODE) {
                            testRange = range.duplicate();

                            testRange.moveToElementText(child);

                            var comparisonStart = testRange.compareEndPoints('StartToStart', range),
                                comparisonEnd = testRange.compareEndPoints('EndToStart', range);

                            testRange.collapse();
                            //中间有其他标签
                            if (comparisonStart > 0)
                                break;
                            // When selection stay at the side of certain self-closing elements, e.g. BR,
                            // our comparison will never shows an equality. (#4824)
                            else if (!comparisonStart
                                || comparisonEnd == 1 && comparisonStart == -1)
                                return { container:parent, offset:i };
                            else if (!comparisonEnd)
                                return { container:parent, offset:i + 1 };

                            testRange = NULL;
                        }
                    }

                    if (!testRange) {
                        testRange = range.duplicate();
                        testRange.moveToElementText(parent);
                        testRange.collapse(FALSE);
                    }

                    testRange.setEndPoint('StartToStart', range);
                    // IE report line break as CRLF with range.text but
                    // only LF with textnode.nodeValue, normalize them to avoid
                    // breaking character counting logic below. (#3949)
                    var distance = String(testRange.text)
                        .replace(/\r\n|\r/g, '\n').length;

                    try {
                        while (distance > 0)
                            //bug? 可能不是文本节点 nodeValue undefined
                            //永远不会出现 textnode<img/>textnode
                            //停止时，前面一定为textnode
                            distance -= siblings[ --i ].nodeValue.length;
                    }
                        // Measurement in IE could be somtimes wrong because of <select> element. (#4611)
                    catch (e) {
                        distance = 0;
                    }


                    if (distance === 0) {
                        return {
                            container:parent,
                            offset:i
                        };
                    }
                    else {
                        return {
                            container:siblings[ i ],
                            offset:-distance
                        };
                    }
                };

                return function (force) {
                    var self = this, cache = self._.cache;
                    if (cache.ranges && !force)
                        return cache.ranges;

                    // IE doesn't have range support (in the W3C way), so we
                    // need to do some magic to transform selections into
                    // Range instances.

                    var sel = self.getNative(),
                        nativeRange = sel && sel.createRange(),
                        type = self.getType(),
                        range;

                    if (!sel)
                        return [];

                    if (type == KES.SELECTION_TEXT) {
                        range = new KERange(self.document);
                        var boundaryInfo = getBoundaryInformation(nativeRange, TRUE);
                        range.setStart(new Node(boundaryInfo.container), boundaryInfo.offset);
                        boundaryInfo = getBoundaryInformation(nativeRange);
                        range.setEnd(new Node(boundaryInfo.container), boundaryInfo.offset);
                        return ( cache.ranges = [ range ] );
                    } else if (type == KES.SELECTION_ELEMENT) {
                        var retval = cache.ranges = [];

                        for (var i = 0; i < nativeRange.length; i++) {
                            var element = nativeRange.item(i),
                                parentElement = element.parentNode,
                                j = 0;

                            range = new KERange(self.document);

                            for (; j < parentElement.childNodes.length && parentElement.childNodes[j] != element; j++) { /*jsl:pass*/
                            }

                            range.setStart(new Node(parentElement), j);
                            range.setEnd(new Node(parentElement), j + 1);
                            retval.push(range);
                        }

                        return retval;
                    }

                    return ( cache.ranges = [] );
                };
            })()
            :
            function (force) {
                var self = this, cache = self._.cache;
                if (cache.ranges && !force)
                    return cache.ranges;

                // On browsers implementing the W3C range, we simply
                // tranform the native ranges in Range
                // instances.

                var ranges = [], sel = self.getNative();

                if (!sel)
                    return [];

                for (var i = 0; i < sel.rangeCount; i++) {
                    var nativeRange = sel.getRangeAt(i), range = new KERange(self.document);

                    range.setStart(new Node(nativeRange.startContainer), nativeRange.startOffset);
                    range.setEnd(new Node(nativeRange.endContainer), nativeRange.endOffset);
                    ranges.push(range);
                }

                return ( cache.ranges = ranges );
            },

        /**
         * Gets the DOM element in which the selection starts.
         * @return The element at the beginning of the
         *        selection.
         * @example
         * var element = editor.getSelection().<b>getStartElement()</b>;
         * alert( element.nodeName() );
         */
        getStartElement:function () {
            var self = this, cache = self._.cache;
            if (cache.startElement !== undefined)
                return cache.startElement;

            var node,
                sel = self.getNative();

            switch (self.getType()) {
                case KES.SELECTION_ELEMENT :
                    return this.getSelectedElement();

                case KES.SELECTION_TEXT :

                    var range = self.getRanges()[0];

                    if (range) {
                        if (!range.collapsed) {
                            range.optimize();

                            // Decrease the range content to exclude particial
                            // selected node on the start which doesn't have
                            // visual impact. ( #3231 )
                            while (TRUE) {
                                var startContainer = range.startContainer,
                                    startOffset = range.startOffset;
                                // Limit the fix only to non-block elements.(#3950)
                                if (startOffset == ( startContainer[0].nodeType === DOM.NodeType.ELEMENT_NODE ?
                                    startContainer[0].childNodes.length : startContainer[0].nodeValue.length )
                                    && !startContainer._4e_isBlockBoundary()) {
                                    range.setStartAfter(startContainer);
                                } else {
                                    break;
                                }
                            }

                            node = range.startContainer;

                            if (node[0].nodeType != DOM.NodeType.ELEMENT_NODE) {
                                return node.parent();
                            }

                            node = new Node(node[0].childNodes[range.startOffset]);

                            if (!node[0] || node[0].nodeType != DOM.NodeType.ELEMENT_NODE) {
                                return range.startContainer;
                            }

                            var child = node[0].firstChild;
                            while (child && child.nodeType == DOM.NodeType.ELEMENT_NODE) {
                                node = new Node(child);
                                child = child.firstChild;
                            }
                            return node;
                        }
                    }

                    if (OLD_IE) {
                        range = sel.createRange();
                        range.collapse(TRUE);
                        node = new Node(range.parentElement());
                    }
                    else {
                        node = sel.anchorNode;
                        if (node && node.nodeType != DOM.NodeType.ELEMENT_NODE) {
                            node = node.parentNode;
                        }
                        if (node) {
                            node = new Node(node);
                        }
                    }
            }

            return cache.startElement = node;
        },

        /**
         * Gets the current selected element.
         * @return The selected element. Null if no
         *        selection is available or the selection type is not
         *       SELECTION_ELEMENT.
         * @example
         * var element = editor.getSelection().<b>getSelectedElement()</b>;
         * alert( element.nodeName() );
         */
        getSelectedElement:function () {
            var self = this,
                node,
                cache = self._.cache;

            if (cache.selectedElement !== undefined) {
                return cache.selectedElement;
            }

            // Is it native IE control type selection?
            if (OLD_IE) {
                var range = self.getNative().createRange();
                node = range.item && range.item(0);
            }

            // Figure it out by checking if there's a single enclosed
            // node of the range.
            // 处理 ^  <img/>  ^
            if (!node) {
                node = (function () {
                    var range = self.getRanges()[ 0 ],
                        enclosed,
                        selected;

                    // 先检查第一层
                    // <div>^<img/>^</div>
                    // shrink 再检查
                    // <div><span>^<img/>^</span></div>
                    for (var i = 2;
                         i && !(( enclosed = range.getEnclosedNode() ) &&
                             ( enclosed[0].nodeType == DOM.NodeType.ELEMENT_NODE ) &&
                             // 某些值得这么多的元素？？
                             styleObjectElements[ enclosed.nodeName() ] &&
                             ( selected = enclosed ));
                         i--) {
                        // Then check any deep wrapped element
                        // e.g. [<b><i><img /></i></b>]
                        // 一下子退到底  ^<a><span><span><img/></span></span></a>^
                        // ->
                        //<a><span><span>^<img/>^</span></span></a>
                        range.shrink(KER.SHRINK_ELEMENT);
                    }

                    return  selected;
                })();
            } else {
                node = new Node(node);
            }

            return cache.selectedElement = node;
        },


        reset:function () {
            this._.cache = {};
        },

        selectElement:function (element) {
            var range,
                self = this,
                doc = self.document;
            if (OLD_IE) {
                //do not use empty()，编辑器内滚动条重置了
                //选择的 img 内容前后莫名被清除
                //self.getNative().empty();
                try {
                    // Try to select the node as a control.
                    range = doc.body['createControlRange']();
                    range['addElement'](element[0]);
                    range.select();
                } catch (e) {
                    // If failed, select it as a text range.
                    range = doc.body.createTextRange();
                    range.moveToElementText(element[0]);
                    range.select();
                } finally {
                    // fire('selectionChange');
                }
                self.reset();
            } else {
                // Create the range for the element.
                range = doc.createRange();
                range.selectNode(element[0]);
                // Select the range.
                var sel = self.getNative();
                sel.removeAllRanges();
                sel.addRange(range);
                self.reset();
            }
        },

        selectRanges:function (ranges) {
            var self = this;
            if (OLD_IE) {
                if (ranges.length > 1) {
                    // IE doesn't accept multiple ranges selection, so we join all into one.
                    var last = ranges[ ranges.length - 1 ];
                    ranges[ 0 ].setEnd(last.endContainer, last.endOffset);
                    ranges.length = 1;
                }

                // IE doesn't accept multiple ranges selection, so we just
                // select the first one.
                if (ranges[ 0 ])
                    ranges[ 0 ].select();

                self.reset();
            }
            else {
                var sel = self.getNative();
                if (!sel) {
                    return;
                }
                sel.removeAllRanges();
                for (var i = 0; i < ranges.length; i++) {
                    var range = ranges[ i ],
                        nativeRange = self.document.createRange(),
                        startContainer = range.startContainer;

                    // In FF2, if we have a collapsed range, inside an empty
                    // element, we must add something to it otherwise the caret
                    // will not be visible.
                    // opera move out of this element
                    if (range.collapsed &&
                        (( UA.gecko && UA.gecko < 1.0900 ) || UA.opera || UA['webkit']) &&
                        startContainer[0].nodeType == DOM.NodeType.ELEMENT_NODE &&
                        !startContainer[0].childNodes.length) {
                        // webkit 光标停留不到在空元素内，要fill char，之后范围定在 fill char 之后
                        startContainer[0].appendChild(self.document.createTextNode(UA['webkit'] ? "\u200b" : ""));
                        range.startOffset++;
                        range.endOffset++;
                    }

                    nativeRange.setStart(startContainer[0], range.startOffset);
                    nativeRange.setEnd(range.endContainer[0], range.endOffset);
                    // Select the range.
                    sel.addRange(nativeRange);
                }
                self.reset();
            }
        },
        createBookmarks2:function (normalized) {
            var bookmarks = [],
                ranges = this.getRanges();

            for (var i = 0; i < ranges.length; i++)
                bookmarks.push(ranges[i].createBookmark2(normalized));

            return bookmarks;
        },
        createBookmarks:function (serializable, ranges) {
            var self = this,
                retval = [],
                doc = self.document,
                bookmark;
            ranges = ranges || self.getRanges();
            var length = ranges.length;
            for (var i = 0; i < length; i++) {
                retval.push(bookmark = ranges[ i ].createBookmark(serializable, TRUE));
                serializable = bookmark.serializable;

                var bookmarkStart = serializable ? S.one("#" + bookmark.startNode, doc) : bookmark.startNode,
                    bookmarkEnd = serializable ? S.one("#" + bookmark.endNode, doc) : bookmark.endNode;

                // Updating the offset values for rest of ranges which have been mangled(#3256).
                for (var j = i + 1; j < length; j++) {
                    var dirtyRange = ranges[ j ],
                        rangeStart = dirtyRange.startContainer,
                        rangeEnd = dirtyRange.endContainer;

                    DOM.equals(rangeStart, bookmarkStart.parent()) && dirtyRange.startOffset++;
                    DOM.equals(rangeStart, bookmarkEnd.parent()) && dirtyRange.startOffset++;
                    DOM.equals(rangeEnd, bookmarkStart.parent()) && dirtyRange.endOffset++;
                    DOM.equals(rangeEnd, bookmarkEnd.parent()) && dirtyRange.endOffset++;
                }
            }

            return retval;
        },

        selectBookmarks:function (bookmarks) {
            var self = this, ranges = [];
            for (var i = 0; i < bookmarks.length; i++) {
                var range = new KERange(self.document);
                range.moveToBookmark(bookmarks[i]);
                ranges.push(range);
            }
            self.selectRanges(ranges);
            return self;
        },

        getCommonAncestor:function () {
            var ranges = this.getRanges(),
                startNode = ranges[ 0 ].startContainer,
                endNode = ranges[ ranges.length - 1 ].endContainer;
            return startNode._4e_commonAncestor(endNode);
        },

        // Moving scroll bar to the current selection's start position.
        scrollIntoView:function () {
            // If we have split the block, adds a temporary span at the
            // range position and scroll relatively to it.
            var start = this.getStartElement();
            start && start.scrollIntoView(undefined,{
                alignWithTop:false,
                allowHorizontalScroll:true,
                onlyScrollIfNeeded:true
            });
        },
        removeAllRanges:function () {
            var sel = this.getNative();
            if (!OLD_IE) {
                sel && sel.removeAllRanges();
            } else {
                sel && sel.clear();
            }
        }
    });


    var nonCells = { "table":1, "tbody":1, "tr":1 }, notWhitespaces = Walker.whitespaces(TRUE),
        fillerTextRegex = /\ufeff|\u00a0/;
    KERange.prototype["select"] =
        KERange.prototype.select =
            !OLD_IE ? function () {
                var self = this, startContainer = self.startContainer;

                // If we have a collapsed range, inside an empty element, we must add
                // something to it, otherwise the caret will not be visible.
                if (self.collapsed && startContainer[0].nodeType == DOM.NodeType.ELEMENT_NODE && !startContainer[0].childNodes.length)
                    startContainer[0].appendChild(self.document.createTextNode(""));

                var nativeRange = self.document.createRange();
                nativeRange.setStart(startContainer[0], self.startOffset);

                try {
                    nativeRange.setEnd(self.endContainer[0], self.endOffset);
                } catch (e) {
                    // There is a bug in Firefox implementation (it would be too easy
                    // otherwise). The new start can't be after the end (W3C says it can).
                    // So, let's create a new range and collapse it to the desired point.
                    if (e.toString().indexOf('NS_ERROR_ILLEGAL_VALUE') >= 0) {
                        self.collapse(TRUE);
                        nativeRange.setEnd(self.endContainer[0], self.endOffset);
                    }
                    else
                        throw( e );
                }

                var selection = getSelection(self.document).getNative();
                selection.removeAllRanges();
                selection.addRange(nativeRange);
            } : // V2
                function (forceExpand) {

                    var self = this,
                        collapsed = self.collapsed,
                        isStartMarkerAlone,
                        dummySpan;
                    //选的是元素，直接使用selectElement
                    //还是有差异的，特别是img选择框问题
                    if (
                    //ie8 有问题？？
                    //UA['ie']Engine!=8 &&
                        self.startContainer[0] === self.endContainer[0]
                            && self.endOffset - self.startOffset == 1) {
                        var selEl = self.startContainer[0].childNodes[self.startOffset];
                        if (selEl.nodeType == DOM.NodeType.ELEMENT_NODE) {
                            new KESelection(self.document).selectElement(new Node(selEl));
                            return;
                        }
                    }
                    // IE doesn't support selecting the entire table row/cell, move the selection into cells, e.g.
                    // <table><tbody><tr>[<td>cell</b></td>... => <table><tbody><tr><td>[cell</td>...
                    if (self.startContainer[0].nodeType == DOM.NodeType.ELEMENT_NODE &&
                        self.startContainer.nodeName() in nonCells
                        || self.endContainer[0].nodeType == DOM.NodeType.ELEMENT_NODE &&
                        self.endContainer.nodeName() in nonCells) {
                        self.shrink(KER.SHRINK_ELEMENT, TRUE);
                    }

                    var bookmark = self.createBookmark(),
                    // Create marker tags for the start and end boundaries.
                        startNode = bookmark.startNode,
                        endNode;
                    if (!collapsed)
                        endNode = bookmark.endNode;

                    // Create the main range which will be used for the selection.
                    var ieRange = self.document.body.createTextRange();

                    // Position the range at the start boundary.
                    ieRange.moveToElementText(startNode[0]);
                    //跳过开始 bookmark 标签
                    ieRange.moveStart('character', 1);

                    if (endNode) {
                        // Create a tool range for the end.
                        var ieRangeEnd = self.document.body.createTextRange();
                        // Position the tool range at the end.
                        ieRangeEnd.moveToElementText(endNode[0]);
                        // Move the end boundary of the main range to match the tool range.
                        ieRange.setEndPoint('EndToEnd', ieRangeEnd);
                        ieRange.moveEnd('character', -1);
                    }
                    else {
                        // The isStartMarkerAlone logic comes from V2. It guarantees that the lines
                        // will expand and that the cursor will be blinking on the right place.
                        // Actually, we are using this flag just to avoid using this hack in all
                        // situations, but just on those needed.
                        var next = startNode[0].nextSibling;
                        while (next && !notWhitespaces(next)) {
                            next = next.nextSibling;
                        }
                        isStartMarkerAlone =
                            (
                                !( next && next.nodeValue && next.nodeValue.match(fillerTextRegex) )     // already a filler there?
                                    && ( forceExpand
                                    ||
                                    !startNode[0].previousSibling
                                    ||
                                    (
                                        startNode[0].previousSibling &&
                                            DOM.nodeName(startNode[0].previousSibling) == 'br'
                                        )
                                    )
                                );

                        // Append a temporary <span>&#65279;</span> before the selection.
                        // This is needed to avoid IE destroying selections inside empty
                        // inline elements, like <b></b> (#253).
                        // It is also needed when placing the selection right after an inline
                        // element to avoid the selection moving inside of it.
                        dummySpan = new Node(self.document.createElement('span'));
                        dummySpan.html('&#65279;');	// Zero Width No-Break Space (U+FEFF). See #1359.
                        dummySpan.insertBefore(startNode);
                        if (isStartMarkerAlone) {
                            // To expand empty blocks or line spaces after <br>, we need
                            // instead to have any char, which will be later deleted using the
                            // selection.
                            // \ufeff = Zero Width No-Break Space (U+FEFF). (#1359)
                            DOM.insertBefore(self.document.createTextNode('\ufeff'), startNode[0] || startNode);
                        }
                    }

                    // Remove the markers (reset the position, because of the changes in the DOM tree).
                    self.setStartBefore(startNode);
                    startNode._4e_remove();

                    if (collapsed) {
                        if (isStartMarkerAlone) {
                            // Move the selection start to include the temporary \ufeff.
                            ieRange.moveStart('character', -1);
                            ieRange.select();
                            // Remove our temporary stuff.
                            self.document.selection.clear();
                        } else
                            ieRange.select();
                        if (dummySpan) {
                            self.moveToPosition(dummySpan, KER.POSITION_BEFORE_START);
                            dummySpan._4e_remove();
                        }
                    }
                    else {
                        self.setEndBefore(endNode);
                        endNode._4e_remove();
                        ieRange.select();
                    }
                    // fire('selectionChange');
                };


    function getSelection(doc) {
        var sel = new KESelection(doc);
        return ( !sel || sel.isInvalid ) ? NULL : sel;
    }

    KESelection.getSelection = getSelection;

    Editor.Selection = KESelection;

    return KESelection;
}, {
    requires:['./base', './walker', './range', './dom']
});
