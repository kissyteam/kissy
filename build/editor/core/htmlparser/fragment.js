/**
 * modified from ckeditor
 * @author <yiminghe@gmail.com>
 */
/*
 Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.html or http://ckeditor.com/license
 */
KISSY.Editor.add("htmlparser-fragment", function() {
    var
        TRUE = true,
        FALSE = false,
        NULL = null,
        KE = KISSY.Editor;

    /**
     * A lightweight representation of an HTML DOM structure.
     * @constructor
     * @example
     */
    function Fragment() {
        /**
         * The nodes contained in the root of this fragment.
         * @type Array
         * @example
         * var fragment = Fragment.fromHtml( '<b>Sample</b> Text' );
         * alert( fragment.children.length );  "2"
         */
        this.children = [];

        /**
         * Get the fragment parent. Should always be NULL.
         * @type Object
         * @default NULL
         * @example
         */
        this.parent = NULL;

        /** @private */
        this._ = {
            isBlockLike : TRUE,
            hasInlineStarted : FALSE
        };
    }

    // Elements which the end tag is marked as optional in the HTML 4.01 DTD
    // (expect empty elements).
    var optionalClose = {"colgroup":1,"dd":1,"dt":1,"li":1,"option":1,"p":1,"td":1,"tfoot":1,"th":1,"thead":1,"tr":1};

    // Block-level elements whose internal structure should be respected during
    // parser fixing.
    var S = KISSY,
        Utils = KE.Utils,
        KEN = KE.NODE,
        XHTML_DTD = KE.XHTML_DTD,
        nonBreakingBlocks = Utils.mix({"table":1,"ul":1,"ol":1,"dl":1},
            XHTML_DTD["table"], XHTML_DTD["ul"], XHTML_DTD["ol"], XHTML_DTD["dl"]),
        listBlocks = XHTML_DTD.$list,
        listItems = XHTML_DTD.$listItem;

    /**
     * Creates a  Fragment from an HTML string.
     * @param {String} fragmentHtml The HTML to be parsed, filling the fragment.
     * @param {boolean|string|undefined} [fixForBody=FALSE] Wrap body with specified element if needed.
     * @returns Fragment The fragment created.
     * @example
     * var fragment = Fragment.fromHtml( '<b>Sample</b> Text' );
     * alert( fragment.children[0].name );  "b"
     * alert( fragment.children[1].value );  " Text"
     * 特例：
     * 自动加p，自动处理标签嵌套规则
     * "<img src='xx'><span>5<div>6</div>7</span>"
     * ="<p><img><span>5</span></p><div><span>6</span></div><p><span>7</span></p>"
     * 自动处理ul嵌套，以及li ie不闭合
     * "<ul><ul><li>xxx</ul><li>1<li>2<ul>");
     */
    Fragment.FromHtml = function(fragmentHtml, fixForBody) {

        var parser = new KE.HtmlParser(),
            //html = [],
            fragment = new Fragment(),
            pendingInline = [],
            pendingBRs = [],
            currentNode = fragment,
            // Indicate we're inside a <pre> element, spaces should be touched differently.
            inPre = FALSE,
            returnPoint;

        /**
         *
         * @param {boolean|undefined|string=} newTagName
         */
        function checkPending(newTagName) {
            var pendingBRsSent;

            if (pendingInline.length > 0) {
                for (var i = 0; i < pendingInline.length; i++) {
                    var pendingElement = pendingInline[ i ],
                        pendingName = pendingElement.name,
                        pendingDtd = XHTML_DTD[ pendingName ],
                        currentDtd = currentNode.name && XHTML_DTD[ currentNode.name ];

                    if (( !currentDtd || currentDtd[ pendingName ] ) && ( !newTagName || !pendingDtd || pendingDtd[ newTagName ] || !XHTML_DTD[ newTagName ] )) {
                        if (!pendingBRsSent) {
                            sendPendingBRs();
                            pendingBRsSent = 1;
                        }

                        // Get a clone for the pending element.
                        pendingElement = pendingElement.clone();

                        // Add it to the current node and make it the current,
                        // so the new element will be added inside of it.
                        pendingElement.parent = currentNode;
                        currentNode = pendingElement;

                        // Remove the pending element (back the index by one
                        // to properly process the next entry).
                        pendingInline.splice(i, 1);
                        i--;
                    }
                }
            }
        }

        function sendPendingBRs() {
            while (pendingBRs.length)
                currentNode.add(pendingBRs.shift());
        }

        /**
         *
         * @param  element
         * @param  {*=} target
         * @param {boolean=} enforceCurrent
         */
        function addElement(element, target, enforceCurrent) {
            target = target || currentNode || fragment;

            // If the target is the fragment and this element can't go inside
            // body
            if (fixForBody && !target.type) {
                var elementName, realElementName;
                if (element.attributes
                    && ( realElementName =
                    element.attributes[ '_ke_real_element_type' ] ))
                    elementName = realElementName;
                else
                    elementName = element.name;
                if (elementName
                    && !( elementName in XHTML_DTD.$body )
                    && !( elementName in XHTML_DTD.$nonBodyContent )) {
                    var savedCurrent = currentNode;

                    // Create a <p> in the fragment.
                    currentNode = target;
                    /**
                     * notice : 2011-01-13
                     * bug
                     * <li>1</li> ->
                     * <p><li>1</li></p>
                     *
                     * should be <ul><li>1</li></ul>
                     */
                    var meta = {
                        li:"ul",
                        dt:"dl",
                        dd:"dl"
                    };
                    parser.onTagOpen(meta[elementName] || fixForBody, {});

                    // The new target now is the <p>.
                    target = currentNode;

                    if (enforceCurrent)
                        currentNode = savedCurrent;
                }
            }

            // Rtrim empty spaces on block end boundary. (#3585)
            if (element._.isBlockLike
                && element.name != 'pre') {

                var length = element.children.length,
                    lastChild = element.children[ length - 1 ],
                    text;
                if (lastChild && lastChild.type == KEN.NODE_TEXT) {
                    if (!( text = Utils.rtrim(lastChild.value) ))
                        element.children.length = length - 1;
                    else
                        lastChild.value = text;
                }
            }

            target.add(element);

            //<ul><ul></ul></ul> -> <ul><li><ul></ul></li></ul>
            //跳过隐形添加的li直接到ul
            if (element.returnPoint) {
                currentNode = element.returnPoint;
                delete element.returnPoint;
            }
        }

        /**
         * 遇到标签开始建立节点和父亲关联 ==  node.parent=parent
         * @param {string|boolean|undefined} tagName
         * @param {Object} attributes
         * @param {boolean=} selfClosing
         */
        parser.onTagOpen = function(tagName, attributes, selfClosing) {
            var element = new KE.HtmlParser.Element(tagName, attributes);

            // "isEmpty" will be always "FALSE" for unknown elements, so we
            // must force it if the parser has identified it as a selfClosing tag.
            if (element.isUnknown && selfClosing)
                element.isEmpty = TRUE;

            // This is a tag to be removed if empty, so do not add it immediately.
            if (XHTML_DTD.$removeEmpty[ tagName ] &&
                S.isEmptyObject(attributes)) {
                pendingInline.push(element);
                return;
            }
            else if (String(tagName) === 'pre')
                inPre = TRUE;
            else if (String(tagName) === 'br' && inPre) {
                currentNode.add(new KE.HtmlParser.Text('\n'));
                return;
            }

            if (String(tagName) === 'br') {
                pendingBRs.push(element);
                return;
            }

            var currentName = currentNode.name;

            var currentDtd = currentName
                && ( XHTML_DTD[ currentName ]
                || ( currentNode._.isBlockLike ? XHTML_DTD["div"] : XHTML_DTD["span"] ) );

            // If the element cannot be child of the current element.
            if (currentDtd   // Fragment could receive any elements.
                && !element.isUnknown && !currentNode.isUnknown && !currentDtd[ tagName ]) {

                var reApply = FALSE,
                    addPoint;   // New position to start adding nodes.

                // Fixing malformed nested lists by moving it into a previous list item. (#3828)
                if (tagName in listBlocks
                    && currentName in listBlocks) {
                    var children = currentNode.children,
                        lastChild = children[ children.length - 1 ];

                    // Establish the list item if it's not existed.
                    if (!( lastChild && lastChild.name in listItems ))
                    //直接添加到父亲
                        addElement(( lastChild = new KE.HtmlParser.Element('li') ), currentNode);
                    //以后直接跳到父亲不用再向父亲添加
                    returnPoint = currentNode,addPoint = lastChild;
                }
                // If the element name is the same as the current element name,
                // then just close the current one and append the new one to the
                // parent. This situation usually happens with <p>, <li>, <dt> and
                // <dd>, specially in IE. Do not enter in this if block in this case.
                else if (tagName == currentName) {
                    //直接把上一个<p>,<li>结束掉，不要再等待</p>,</li>执行此项操作了
                    addElement(currentNode, currentNode.parent);
                }
                else {
                    if (false && nonBreakingBlocks[ currentName ]) {
                        if (!returnPoint)
                            returnPoint = currentNode;
                    }
                    else {
                        //拆分，闭合掉
                        addElement(currentNode, currentNode.parent, TRUE);
                        //li,p等现在就闭合，以后都不用再管了
                        if (!optionalClose[ currentName ] && currentName in XHTML_DTD.$inline) {
                            // The current element is an inline element, which
                            // cannot hold the new one. Put it in the pending list,
                            // and try adding the new one after it.
                            pendingInline.unshift(currentNode);
                        }
                    }

                    reApply = TRUE;
                }

                if (addPoint)
                    currentNode = addPoint;
                // Try adding it to the return point, or the parent element.
                else
                //前面都调用 addElement 将当前节点闭合了，只能往 parent 添加了
                    currentNode = currentNode.returnPoint || currentNode.parent;

                if (reApply) {
                    parser.onTagOpen.apply(this, arguments);
                    return;
                }
            }

            checkPending(tagName);
            sendPendingBRs();

            element.parent = currentNode;
            element.returnPoint = returnPoint;
            returnPoint = 0;

            //自闭合的，不等结束标签，立即加到父亲
            if (element.isEmpty)
                addElement(element);
            else
                currentNode = element;
        };

        /**
         * 遇到标签结束，将open生成的节点添加到dom树中 == 父亲接纳自己 node.parent.add(node)
         * @param tagName
         */
        parser.onTagClose = function(tagName) {
            // Check if there is any pending tag to be closed.
            for (var i = pendingInline.length - 1; i >= 0; i--) {
                // If found, just remove it from the list.
                if (tagName == pendingInline[ i ].name) {
                    pendingInline.splice(i, 1);
                    return;
                }
            }

            var pendingAdd = [],
                newPendingInline = [],
                candidate = currentNode;

            while (candidate.type && candidate.name != tagName) {
                // If this is an inline element, add it to the pending list, if we're
                // really closing one of the parents element later, they will continue
                // after it.
                if (!candidate._.isBlockLike)
                    newPendingInline.unshift(candidate);

                // This node should be added to it's parent at this point. But,
                // it should happen only if the closing tag is really closing
                // one of the nodes. So, for now, we just cache it.
                pendingAdd.push(candidate);

                candidate = candidate.parent;
            }

            if (candidate.type) {
                // Add all elements that have been found in the above loop.
                for (i = 0; i < pendingAdd.length; i++) {
                    var node = pendingAdd[ i ];
                    addElement(node, node.parent);
                }

                currentNode = candidate;

                if (currentNode.name == 'pre')
                    inPre = FALSE;

                if (candidate._.isBlockLike)
                    sendPendingBRs();

                addElement(candidate, candidate.parent);

                // The parent should start receiving new nodes now, except if
                // addElement changed the currentNode.
                if (candidate == currentNode)
                    currentNode = currentNode.parent;

                pendingInline = pendingInline.concat(newPendingInline);
            }

            if (tagName == 'body')
                fixForBody = FALSE;
        };

        parser.onText = function(text) {
            // Trim empty spaces at beginning of element contents except <pre>.
            if (!currentNode._.hasInlineStarted && !inPre) {
                text = Utils.ltrim(text);

                if (text.length === 0)
                    return;
            }

            sendPendingBRs();
            checkPending();

            if (fixForBody
                && ( !currentNode.type || currentNode.name == 'body' )
                && Utils.trim(text)) {
                this.onTagOpen(fixForBody, {});
            }

            // Shrinking consequential spaces into one single for all elements
            // text contents.
            if (!inPre)
                text = text.replace(/[\t\r\n ]{2,}|[\t\r\n]/g, ' ');

            currentNode.add(new KE.HtmlParser.Text(text));
        };

        parser.onCDATA = function(cdata) {
            currentNode.add(new KE.HtmlParser.cdata(cdata));
        };

        parser.onComment = function(comment) {
            currentNode.add(new KE.HtmlParser.Comment(comment));
        };

        // Parse it.
        parser.parse(fragmentHtml);

        sendPendingBRs();

        // Close all pending nodes.
        //<p>xxxxxxxxxxxxx
        //到最后也灭有结束标签
        while (currentNode.type) {
            var parent = currentNode.parent,
                node = currentNode;

            if (fixForBody
                && ( !parent.type || parent.name == 'body' )
                && !XHTML_DTD.$body[ node.name ]) {
                currentNode = parent;
                parser.onTagOpen(fixForBody, {});
                parent = currentNode;
            }

            parent.add(node);
            currentNode = parent;
        }

        return fragment;
    };

    S.augment(Fragment, {
        /**
         * Adds a node to this fragment.
         * @param {Object} node The node to be added. It can be any of of the
         *        following types: {@link Element},
         *        {@link Text}
         * @example
         */
        add : function(node) {
            var len = this.children.length,
                previous = len > 0 && this.children[ len - 1 ] || NULL;

            if (previous) {
                // If the block to be appended is following text, trim spaces at
                // the right of it.
                if (node._.isBlockLike && previous.type == KEN.NODE_TEXT) {
                    previous.value = Utils.rtrim(previous.value);
                    // If we have completely cleared the previous node.
                    if (previous.value.length === 0) {
                        // Remove it from the list and add the node again.
                        this.children.pop();
                        this.add(node);
                        return;
                    }
                }

                previous.next = node;
            }

            node.previous = previous;
            node.parent = this;

            this.children.push(node);
            this._.hasInlineStarted = node.type == KEN.NODE_TEXT || ( node.type == KEN.NODE_ELEMENT && !node._.isBlockLike );
        },

        /**
         * Writes the fragment HTML to a CKEDITOR.htmlWriter.
         * @param writer The writer to which write the HTML.
         * @example
         * var writer = new HtmlWriter();
         * var fragment = Fragment.fromHtml( '&lt;P&gt;&lt;B&gt;Example' );
         * fragment.writeHtml( writer )
         * alert( writer.getHtml() );  "&lt;p&gt;&lt;b&gt;Example&lt;/b&gt;&lt;/p&gt;"
         */
        writeHtml : function(writer, filter) {
            var isChildrenFiltered;
            this.filterChildren = function() {
                var writer = new KE.HtmlParser.BasicWriter();
                this.writeChildrenHtml.call(this, writer, filter, TRUE);
                var html = writer.getHtml();
                this.children = new Fragment.FromHtml(html).children;
                isChildrenFiltered = 1;
            };
            this["filterChildren"] = this.filterChildren;
            // Filtering the root fragment before anything else.
            !this.name && filter && filter.onFragment(this);

            this.writeChildrenHtml(writer, isChildrenFiltered ? NULL : filter);
        },

        writeChildrenHtml : function(writer, filter) {
            for (var i = 0; i < this.children.length; i++)
                this.children[i].writeHtml(writer, filter);
        }
    });

    KE.HtmlParser.Fragment = Fragment;
});
