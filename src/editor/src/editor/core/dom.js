/**
 * dom utils for kissy editor,mainly from ckeditor
 * @author <yiminghe@gmail.com>
 */
/*
 Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.html or http://ckeditor.com/license
 */
KISSY.add("editor/core/dom", function (S) {

    var TRUE = true,
        FALSE = false,
        NULL = null,
        KE = S.Editor,
        DOM = S.DOM,
        UA = S.UA,
        doc = document,
        Node = S.Node,
        Utils = KE.Utils,
        GET_BOUNDING_CLIENT_RECT = 'getBoundingClientRect',
        REMOVE_EMPTY = {
            "abbr":1,
            "acronym":1,
            "address":1,
            "b":1,
            "bdo":1,
            "big":1,
            "cite":1,
            "code":1,
            "del":1,
            "dfn":1,
            "em":1,
            "font":1,
            "i":1,
            "ins":1,
            "label":1,
            "kbd":1,
            "q":1,
            "s":1,
            "samp":1,
            "small":1,
            "span":1,
            "strike":1,
            "strong":1,
            "sub":1,
            "sup":1,
            "tt":1,
            "u":1,
            'var':1
        };
    /**
     * Enum for node type
     * @enum {number}
     */
    KE.NODE = {
        NODE_ELEMENT:1,
        NODE_TEXT:3,
        "NODE_COMMENT":8,
        NODE_DOCUMENT_FRAGMENT:11
    };
    /**
     * Enum for node position
     * @enum {number}
     */
    KE.POSITION = {
        POSITION_IDENTICAL:0,
        POSITION_DISCONNECTED:1,
        POSITION_FOLLOWING:2,
        POSITION_PRECEDING:4,
        POSITION_IS_CONTAINED:8,
        POSITION_CONTAINS:16
    };
    var KEN = KE.NODE, KEP = KE.POSITION;

    /*
     * Anything whose display computed style is block, list-item, table,
     * table-row-group, table-header-group, table-footer-group, table-row,
     * table-column-group, table-column, table-cell, table-caption, or whose node
     * name is hr, br (when enterMode is br only) is a block boundary.
     */
    var blockBoundaryDisplayMatch = {
        "block":1,
        'list-item':1,
        "table":1,
        'table-row-group':1,
        'table-header-group':1,
        'table-footer-group':1,
        'table-row':1,
        'table-column-group':1,
        'table-column':1,
        'table-cell':1,
        'table-caption':1
    },
        blockBoundaryNodeNameMatch = { "hr":1 },
        /**
         * @param el {(Node)}
         */
            normalElDom = function (el) {
            return   el[0] || el;
        },
        /**
         * @param el {(Node)}
         */
            normalEl = function (el) {
            if (el && !el[0]) return new Node(el);
            return el;
        },
        editorDom = {
            _4e_wrap:normalEl,
            _4e_unwrap:normalElDom,
            /**
             *
             * @param el {(Node)}
             * @param customNodeNames {Object}
             */
            _4e_isBlockBoundary:function (el, customNodeNames) {
                el = normalEl(el);
                var nodeNameMatches = S.mix(S.mix({}, blockBoundaryNodeNameMatch), customNodeNames || {});

                return blockBoundaryDisplayMatch[ el.css('display') ] ||
                    nodeNameMatches[ el._4e_name() ];
            },

            /**
             *
             * @param elem {Node|Document}
             */
            _4e_getWin:function (elem) {
                return (elem && ('scrollTo' in elem) && elem["document"]) ?
                    elem :
                    elem && elem.nodeType === 9 ?
                        elem.defaultView || elem.parentWindow :
                        FALSE;
            },
            /**
             *
             * @param el {(Node)}
             */
            _4e_index:function (el) {
                var siblings = el.parentNode.childNodes;
                for (var i = 0; i < siblings.length; i++) {
                    if (siblings[i] === el) return i;
                }
                return -1;
            },
            /**
             *
             * @param el {(Node)}
             * @param [evaluator] {function(KISSY.Node)}
             */
            _4e_first:function (el, evaluator) {
                var first = el.firstChild,
                    retval = first;
                if (retval && evaluator && !evaluator(retval)) {
                    retval = DOM._4e_next(retval, evaluator);
                }
                return retval;
            },
            /**
             *
             * @param thisElement {(Node)}
             * @param target {(Node)}
             * @param [toStart] {boolean}
             */
            _4e_move:function (thisElement, target, toStart) {
                DOM._4e_remove(thisElement);
                target = normalElDom(target);
                if (toStart) {
                    target.insertBefore(thisElement, target.firstChild);
                }
                else {
                    target.appendChild(thisElement);
                }
            },

            /**
             *
             * @param [thisElement] {Node}
             */
            _4e_name:function (thisElement) {
                var nodeName = thisElement.nodeName.toLowerCase();
                //note by yiminghe:http://msdn.microsoft.com/en-us/library/ms534388(VS.85).aspx
                if (UA['ie']) {
                    var scopeName = thisElement['scopeName'];
                    if (scopeName && scopeName != 'HTML')
                        nodeName = scopeName.toLowerCase() + ':' + nodeName;
                }
                return nodeName;
            },
            /**
             *
             * @param thisElement {(Node)}
             * @param otherElement {(Node)}
             */
            _4e_isIdentical:function (thisElement, otherElement) {
                thisElement = normalEl(thisElement);
                otherElement = normalEl(otherElement);
                if (thisElement._4e_name() != otherElement._4e_name())
                    return FALSE;

                var thisAttributes = thisElement[0].attributes,
                    otherAttributes = otherElement[0].attributes,
                    thisLength = thisAttributes.length,
                    otherLength = otherAttributes.length;

                if (thisLength != otherLength)
                    return FALSE;

                for (var i = 0; i < thisLength; i++) {
                    var attribute = thisAttributes[i],
                        name = attribute.name;
                    if (attribute.specified
                        &&
                        thisElement.attr(name) != otherElement.attr(name))
                        return FALSE;
                }

                // For IE, we have to for both elements, because it's difficult to
                // know how the atttibutes collection is organized in its DOM.
                // ie 使用版本 < 8
                if (Utils.ieEngine < 8) {
                    for (i = 0; i < otherLength; i++) {
                        attribute = otherAttributes[ i ];
                        name = attribute.name;
                        if (attribute.specified
                            &&
                            thisElement.attr(name) != otherElement.attr(name))
                            return FALSE;
                    }
                }

                return TRUE;
            },

            /**
             *
             * @param thisElement {(Node)}
             */
            _4e_isEmptyInlineRemoveable:function (thisElement) {
                var children = thisElement.childNodes;
                for (var i = 0, count = children.length; i < count; i++) {
                    var child = children[i],
                        nodeType = child.nodeType;

                    if (nodeType == KEN.NODE_ELEMENT && child.getAttribute('_ke_bookmark'))
                        continue;

                    if (nodeType == KEN.NODE_ELEMENT && !editorDom._4e_isEmptyInlineRemoveable(child)
                        || nodeType == KEN.NODE_TEXT && S.trim(child.nodeValue)) {
                        return FALSE;
                    }
                }
                return TRUE;
            },

            /**
             *
             * @param thisElement {(Node)}
             * @param target {(Node)}
             * @param toStart {boolean}
             */
            _4e_moveChildren:function (thisElement, target, toStart) {
                target = target[0] || target;

                if (thisElement == target)
                    return;

                var child;

                if (toStart) {
                    while (( child = thisElement.lastChild ))
                        target.insertBefore(thisElement.removeChild(child), target.firstChild);
                } else {
                    while (( child = thisElement.firstChild ))
                        target.appendChild(thisElement.removeChild(child));
                }
            },

            /**
             *
             * @param elem {(Node)}
             */
            _4e_mergeSiblings:( function () {

                /**
                 *
                 * @param element {(Node)}
                 * @param sibling {(Node)}
                 * @param  {boolean=} isNext
                 */
                function mergeElements(element, sibling, isNext) {
                    if (sibling[0] && sibling[0].nodeType == KEN.NODE_ELEMENT) {
                        // Jumping over bookmark nodes and empty inline elements, e.g. <b><i></i></b>,
                        // queuing them to be moved later. (#5567)
                        var pendingNodes = [];

                        while (sibling.attr('_ke_bookmark')
                            || sibling._4e_isEmptyInlineRemoveable(undefined)) {
                            pendingNodes.push(sibling);
                            sibling = isNext ? new Node(sibling[0].nextSibling) : new Node(sibling[0].previousSibling);
                            if (!sibling[0] || sibling[0].nodeType != KEN.NODE_ELEMENT)
                                return;
                        }

                        if (element._4e_isIdentical(sibling, undefined)) {
                            // Save the last child to be checked too, to merge things like
                            // <b><i></i></b><b><i></i></b> => <b><i></i></b>
                            var innerSibling = isNext ? element[0].lastChild : element[0].firstChild;

                            // Move pending nodes first into the target element.
                            while (pendingNodes.length)
                                pendingNodes.shift()._4e_move(element, !isNext, undefined);

                            sibling._4e_moveChildren(element, !isNext, undefined);
                            sibling.remove();

                            // Now check the last inner child (see two comments above).
                            if (innerSibling[0] && innerSibling[0].nodeType == KEN.NODE_ELEMENT)
                                innerSibling._4e_mergeSiblings();
                        }
                    }
                }

                return function (thisElement) {
                    thisElement = normalEl(thisElement);
                    //note by yiminghe,why not just merge whatever
                    // Merge empty links and anchors also. (#5567)
                    if (!
                        ( REMOVE_EMPTY[ thisElement._4e_name() ]
                            ||
                            thisElement._4e_name() == "a" )
                        )
                        return;

                    mergeElements(thisElement, new Node(thisElement[0].nextSibling), TRUE);
                    mergeElements(thisElement, new Node(thisElement[0].previousSibling));
                };
            } )(),

            /**
             * @param elem {(Node)}
             * @param [refDocument] {Document}
             */
            _4e_getOffset:function (elem, refDocument) {
                var box,
                    x = 0,
                    y = 0,
                    currentWindow = elem.ownerDocument.defaultView || elem.ownerDocument.parentWindow,
                    currentDoc = elem.ownerDocument,
                    currentDocElem = currentDoc.documentElement;
                refDocument = refDocument || currentDoc;
                //same with DOM.offset
                if (elem[GET_BOUNDING_CLIENT_RECT]) {
                    if (elem !== currentDoc.body && currentDocElem !== elem) {
                        box = elem[GET_BOUNDING_CLIENT_RECT]();
                        //相对于refDocument，里层iframe的滚动不计
                        x = box.left + (refDocument === currentDoc ? DOM["scrollLeft"](currentWindow) : 0);
                        y = box.top + (refDocument === currentDoc ? DOM["scrollTop"](currentWindow) : 0);
                    }
                    if (refDocument) {
                        var refWindow = refDocument.defaultView || refDocument.parentWindow;
                        if (currentWindow != refWindow && currentWindow['frameElement']) {
                            //note:when iframe is static ,still some mistake
                            var iframePosition = editorDom._4e_getOffset(currentWindow['frameElement'], refDocument);
                            x += iframePosition.left;
                            y += iframePosition.top;
                        }
                    }
                }
                return { left:x, top:y };
            },

            /**
             * @param el {(Node)}
             * @param offset {number}
             */
            _4e_splitText:function (el, offset) {
                var doc = el.ownerDocument;
                if (!el || el.nodeType != KEN.NODE_TEXT) return;
                // If the offset is after the last char, IE creates the text node
                // on split, but don't include it into the DOM. So, we have to do
                // that manually here.
                if (UA['ie'] && offset == el.nodeValue.length) {
                    var next = doc.createTextNode("");
                    DOM.insertAfter(next, el);
                    return new Node(next);
                }


                var retval = new Node(el.splitText(offset));

                // IE BUG: IE8 does not update the childNodes array in DOM after splitText(),
                // we need to make some DOM changes to make it update. (#3436)
                //我靠！UA['ie']==8 不对，
                //判断不出来:UA['ie']==7 && doc.documentMode==7
                //浏览器模式：当ie8处于兼容视图以及ie7时，UA['ie']==7
                //文本模式: mode=5 ,mode=7, mode=8
                //alert("ua:"+UA['ie']);
                //alert("mode:"+doc.documentMode);
                //ie8 浏览器有问题，而不在于是否哪个模式
                if (!!doc['documentMode']) {
                    var workaround = doc.createTextNode("");
                    DOM.insertAfter(workaround, retval[0]);
                    DOM._4e_remove(workaround);
                }

                return retval;
            },

            /**
             * @param node {(Node)}
             * @param closerFirst {boolean}
             */
            _4e_parents:function (node, closerFirst) {
                node = normalEl(node);
                var parents = [];
                do {
                    parents[  closerFirst ? 'push' : 'unshift' ](node);
                } while (( node = node.parent() ));

                return parents;
            },

            /**
             *
             * @param el {(Node)}
             * @param [includeChildren] {boolean}
             * @param [cloneId] {string}
             */
            _4e_clone:function (el, includeChildren, cloneId) {
                var $clone = el.cloneNode(includeChildren);

                if (!cloneId) {
                    var removeIds = function (node) {
                        if (node.nodeType != KEN.NODE_ELEMENT)
                            return;

                        node.removeAttribute('id');

                        var childs = node.childNodes;
                        for (var i = 0; i < childs.length; i++)
                            removeIds(childs[ i ]);
                    };

                    // The "id" attribute should never be cloned to avoid duplication.
                    removeIds($clone);
                }
                return new Node($clone);
            },
            /**
             * 深度优先遍历获取下一结点
             * @param el {(Node)}
             * @param [startFromSibling] {boolean}
             * @param [nodeType] {number}
             * @param [guard] {function(KISSY.Node)}
             */
            _4e_nextSourceNode:function (el, startFromSibling, nodeType, guard) {
                // If "guard" is a node, transform it in a function.
                if (guard && !guard.call) {
                    var guardNode = normalElDom(guard);
                    guard = function (node) {
                        return node !== guardNode;
                    };
                }

                var node = !startFromSibling && el.firstChild ,
                    parent = el;

                // Guarding when we're skipping the current element( no children or 'startFromSibling' ).
                // send the 'moving out' signal even we don't actually dive into.
                if (!node) {
                    if (el.nodeType == KEN.NODE_ELEMENT &&
                        guard && guard(el, TRUE) === FALSE) {
                        return NULL;
                    }
                    node = el.nextSibling;
                }

                while (!node && ( parent = parent.parentNode)) {
                    // The guard check sends the "TRUE" paramenter to indicate that
                    // we are moving "out" of the element.
                    if (guard && guard(parent, TRUE) === FALSE) {
                        return NULL;
                    }
                    node = parent.nextSibling;
                }

                if (!node) {
                    return NULL;
                }

                if (guard && guard(node) === FALSE) {
                    return NULL;
                }

                if (nodeType && nodeType != node.nodeType) {
                    return DOM._4e_nextSourceNode(node, FALSE, nodeType, guard);
                }

                return node;
            },

            /**
             *
             * @param el {(Node)}
             * @param startFromSibling {boolean}
             * @param nodeType {number}
             * @param guard {function(KISSY.Node)}
             */
            _4e_previousSourceNode:function (el, startFromSibling, nodeType, guard) {
                if (guard && !guard.call) {
                    var guardNode = normalElDom(guard);
                    guard = function (node) {
                        return node !== guardNode;
                    };
                }

                var node = ( !startFromSibling && el.lastChild),
                    parent = el;

                // Guarding when we're skipping the current element( no children or 'startFromSibling' ).
                // send the 'moving out' signal even we don't actually dive into.
                if (!node) {
                    if (el.nodeType == KEN.NODE_ELEMENT &&
                        guard && guard(el, TRUE) === FALSE) {
                        return NULL;
                    }
                    node = el.previousSibling;
                }

                while (!node && ( parent = parent.parentNode )) {
                    // The guard check sends the "TRUE" paramenter to indicate that
                    // we are moving "out" of the element.
                    if (guard && guard(parent, TRUE) === FALSE)
                        return NULL;
                    node = parent.previousSibling;
                }

                if (!node) {
                    return NULL;
                }

                if (guard && guard(node) === FALSE) {
                    return NULL;
                }

                if (nodeType && node.nodeType != nodeType) {
                    return DOM._4e_previousSourceNode(node, FALSE, nodeType, guard);
                }

                return node;
            },

            /**
             *
             * @param el {(Node)}
             * @param node {(Node)}
             */
            _4e_commonAncestor:function (el, node) {
                el = normalEl(el);
                node = normalEl(node);

                if (el.equals(node)) {
                    return el;
                }
                if (node[0].nodeType != KEN.NODE_TEXT && node.contains(el)) {
                    return node;
                }
                var start = el[0].nodeType == KEN.NODE_TEXT ? el.parent() : el;

                do {
                    if (start[0].nodeType != KEN.NODE_TEXT && start.contains(node)) {
                        return start;
                    }
                } while (start = start.parent());

                return NULL;
            },

            /**
             * @param el {(Node)}
             * @param [name] {string}
             * @param [includeSelf] {boolean}
             */
            _4e_ascendant:function (el, name, includeSelf) {
                el = normalElDom(el);
                if (!includeSelf) {
                    el = el.parentNode;
                }
                if (name && !S.isFunction(name)) {
                    var n = name;
                    name = function (node) {
                        return node._4e_name() == n;
                    };
                }
                //到document就完了
                while (el && el.nodeType != 9) {
                    if (!name || name(new Node(el)) === TRUE)
                        return new Node(el);

                    el = el.parentNode;
                }
                return NULL;
            },

            /**
             * 统一的属性处理方式
             * @param el {(Node)}
             * @param otherNode {(Node)}
             */
            _4e_hasAttributes:Utils.ieEngine < 9 ?
                function (el) {
                    var attributes = el.attributes;
                    for (var i = 0; i < attributes.length; i++) {
                        var attribute = attributes[i];
                        switch (attribute.name) {
                            case 'class' :
                                // IE has a strange bug. If calling removeAttribute('className'),
                                // the attributes collection will still contain the "class"
                                // attribute, which will be marked as "specified", even if the
                                // outerHTML of the element is not displaying the class attribute.
                                // Note : I was not able to reproduce it outside the editor,
                                // but I've faced it while working on the TC of #1391.
                                if (el.getAttribute('class'))
                                    return TRUE;
                                break;
                            default :
                                if (attribute.specified)
                                    return TRUE;
                        }
                    }
                    return FALSE;
                } : function (el) {
                //删除firefox自己添加的标志
                if (UA.gecko) {
                    el.removeAttribute("_moz_dirty");
                }
                //使用原生
                //ie8 莫名其妙多个shape？？specified为false
                return el.hasAttributes();
            },

            /**
             *
             * @param el {(Node)}
             * @param otherNode {(Node)}
             */
            _4e_position:function (el, otherNode) {
                var $other = normalElDom(otherNode);


                if (el.compareDocumentPosition)
                    return el.compareDocumentPosition($other);

                // IE and Safari have no support for compareDocumentPosition.

                if (el == $other) {
                    return KEP.POSITION_IDENTICAL;
                }

                // Only element nodes support contains and sourceIndex.
                if (el.nodeType == KEN.NODE_ELEMENT && $other.nodeType == KEN.NODE_ELEMENT) {
                    if (el.contains) {
                        if (el.contains($other))
                            return KEP.POSITION_CONTAINS + KEP.POSITION_PRECEDING;

                        if ($other.contains(el))
                            return KEP.POSITION_IS_CONTAINED + KEP.POSITION_FOLLOWING;
                    }

                    if ('sourceIndex' in el) {
                        return ( el.sourceIndex < 0 || $other.sourceIndex < 0 ) ?
                            KEP.POSITION_DISCONNECTED :
                            ( el.sourceIndex < $other.sourceIndex ) ?
                                KEP.POSITION_PRECEDING :
                                KEP.POSITION_FOLLOWING;
                    }
                }

                // For nodes that don't support compareDocumentPosition, contains
                // or sourceIndex, their "address" is compared.

                var addressOfThis = DOM._4e_address(el, undefined),
                    addressOfOther = DOM._4e_address($other, undefined),
                    minLevel = Math.min(addressOfThis.length, addressOfOther.length);

                // Determinate preceed/follow relationship.
                for (var i = 0; i <= minLevel - 1; i++) {
                    if (addressOfThis[ i ] != addressOfOther[ i ]) {
                        if (i < minLevel) {
                            return addressOfThis[ i ] < addressOfOther[ i ] ?
                                KEP.POSITION_PRECEDING : KEP.POSITION_FOLLOWING;
                        }
                        break;
                    }
                }

                // Determinate contains/contained relationship.
                return ( addressOfThis.length < addressOfOther.length ) ?
                    KEP.POSITION_CONTAINS + KEP.POSITION_PRECEDING :
                    KEP.POSITION_IS_CONTAINED + KEP.POSITION_FOLLOWING;
            },

            /**
             *
             * @param el {(Node)}
             * @param normalized {boolean}
             */
            _4e_address:function (el, normalized) {
                var address = [],
                    $documentElement = el.ownerDocument.documentElement,
                    node = el;

                while (node && node != $documentElement) {
                    var parentNode = node.parentNode,
                        currentIndex = -1;

                    if (parentNode) {
                        for (var i = 0; i < parentNode.childNodes.length; i++) {
                            var candidate = parentNode.childNodes[i];

                            if (normalized &&
                                candidate.nodeType == 3 &&
                                candidate.previousSibling &&
                                candidate.previousSibling.nodeType == 3) {
                                continue;
                            }

                            currentIndex++;

                            if (candidate == node)
                                break;
                        }

                        address.unshift(currentIndex);
                    }

                    node = parentNode;
                }
                return address;
            },

            /**
             *
             * @param el {(Node)}
             * @param [preserveChildren] {boolean}
             */
            _4e_remove:function (el, preserveChildren) {
                var parent = el.parentNode;
                if (parent) {
                    if (preserveChildren) {
                        // Move all children before the node.
                        for (var child; ( child = el.firstChild );) {
                            parent.insertBefore(el.removeChild(child), el);
                        }
                    }
                    parent.removeChild(el);
                }
                return el;
            },
            /**
             *
             * @param el {(Node)}
             */
            _4e_trim:function (el) {
                DOM._4e_ltrim(el);
                DOM._4e_rtrim(el);
            },

            /**
             * @param el {(Node)}
             */
            _4e_ltrim:function (el) {
                var child;
                while (( child = el.firstChild )) {
                    if (child.nodeType == KEN.NODE_TEXT) {
                        var trimmed = Utils.ltrim(child.nodeValue),
                            originalLength = child.nodeValue.length;

                        if (!trimmed) {
                            el.removeChild(child);
                            continue;
                        }
                        else if (trimmed.length < originalLength) {
                            new Node(child)._4e_splitText(originalLength - trimmed.length, undefined);
                            // IE BUG: child.remove() may raise JavaScript errors here. (#81)
                            el.removeChild(el.firstChild);
                        }
                    }
                    break;
                }
            },

            /**
             * @param el {(Node)}
             */
            _4e_rtrim:function (el) {
                var child;
                while (( child = el.lastChild )) {
                    if (child.type == KEN.NODE_TEXT) {
                        var trimmed = Utils.rtrim(child.nodeValue),
                            originalLength = child.nodeValue.length;
                        if (!trimmed) {
                            el.removeChild(child);
                            continue;
                        } else if (trimmed.length < originalLength) {
                            new Node(child)._4e_splitText(trimmed.length, undefined);
                            // IE BUG: child.getNext().remove() may raise JavaScript errors here.
                            // (#81)
                            el.removeChild(el.lastChild);
                        }
                    }
                    break;
                }

                if (!UA['ie'] && !UA.opera) {
                    child = el.lastChild;
                    if (child && child.nodeType == 1 && child.nodeName.toLowerCase() == 'br') {
                        // Use "eChildNode.parentNode" instead of "node" to avoid IE bug (#324).
                        child.parentNode.removeChild(child);
                    }
                }
            },

            /**
             * @param el {(Node)}
             */
            _4e_appendBogus:function (el) {
                var lastChild = el.lastChild;

                // Ignore empty/spaces text.
                while (lastChild &&
                    lastChild.nodeType == KEN.NODE_TEXT &&
                    !S.trim(lastChild.nodeValue))
                    lastChild = lastChild.previousSibling;
                if (!lastChild ||
                    lastChild.nodeType == KEN.NODE_TEXT ||
                    DOM._4e_name(lastChild) !== 'br') {
                    var bogus = UA.opera ?
                        el.ownerDocument.createTextNode('') :
                        el.ownerDocument.createElement('br');

                    UA.gecko && bogus.setAttribute('type', '_moz');
                    el.appendChild(bogus);
                }
            },


            /**
             * @param el {(Node)}
             * @param [evaluator] {function(KISSY.Node)}
             */
            _4e_previous:function (el, evaluator) {
                var previous = el, retval;
                do {
                    previous = previous.previousSibling;
                    retval = previous && new Node(previous);
                } while (retval && evaluator && !evaluator(retval));
                return retval;
            },

            /**
             * @param el {(Node)}
             * @param evaluator {function(KISSY.Node)}
             */
            _4e_last:function (el, evaluator) {
                var last = el.lastChild,
                    retval = last;
                if (retval && evaluator && !evaluator(retval)) {
                    retval = DOM._4e_previous(retval, evaluator);
                }
                return retval;
            },
            /**
             * @param el {(Node)}
             * @param evaluator {function(KISSY.Node)}
             */
            _4e_next:function (el, evaluator) {
                var next = el,
                    retval;
                do {
                    next = next.nextSibling;
                    retval = next;
                } while (retval && evaluator && !evaluator(retval));
                return retval;
            },
            /**
             * @param el {(Node)}
             */
            _4e_outerHtml:function (el) {
                if (el.outerHTML) {
                    // IE includes the <?xml:namespace> tag in the outerHTML of
                    // namespaced element. So, we must strip it here. (#3341)
                    return el.outerHTML.replace(/<\?[^>]*>/, '');
                }

                var tmpDiv = el.ownerDocument.createElement('div');
                tmpDiv.appendChild(el.cloneNode(TRUE));
                return tmpDiv.innerHTML;
            },

            /**
             * @param element {(Node)}
             * @param database {Object}
             * @param name {string}
             * @param value {string}
             */
            _4e_setMarker:function (element, database, name, value) {
                element = normalEl(element);
                var id = element.data('list_marker_id') ||
                    ( element.data('list_marker_id', S.guid()).data('list_marker_id')),
                    markerNames = element.data('list_marker_names') ||
                        ( element.data('list_marker_names', {}).data('list_marker_names'));
                database[id] = element;
                markerNames[name] = 1;
                return element.data(name, value);
            },

            /**
             * @param element {(Node)}
             * @param database {Object}
             * @param [removeFromDatabase] {boolean}
             */
            _4e_clearMarkers:function (element, database, removeFromDatabase) {
                element = normalEl(element);
                var names = element.data('list_marker_names'),
                    id = element.data('list_marker_id');
                for (var i in names) {
                    if (names.hasOwnProperty(i)) {
                        element.removeData(i);
                    }
                }
                element.removeData('list_marker_names');
                if (removeFromDatabase) {
                    element.removeData('list_marker_id');
                    delete database[id];
                }
            },

            /**
             * @param el {(Node)}
             * @param dest  {(Node)}
             * @param skipAttributes {Object}
             */
            _4e_copyAttributes:function (el, dest, skipAttributes) {
                dest = normalEl(dest);
                var attributes = el.attributes;
                skipAttributes = skipAttributes || {};

                for (var n = 0; n < attributes.length; n++) {
                    // Lowercase attribute name hard rule is broken for
                    // some attribute on IE, e.g. CHECKED.
                    var attribute = attributes[n],
                        attrName = attribute.name.toLowerCase(),
                        attrValue;

                    // We can set the type only once, so do it with the proper value, not copying it.
                    if (attrName in skipAttributes)
                        continue;

                    if (attrName == 'checked' && ( attrValue = DOM.attr(el, attrName) ))
                        dest.attr(attrName, attrValue);
                    // IE BUG: value attribute is never specified even if it exists.
                    else if (attribute.specified ||
                        ( UA['ie'] && attribute.value && attrName == 'value' )) {
                        attrValue = DOM.attr(el, attrName);
                        if (attrValue === NULL)
                            attrValue = attribute.nodeValue;
                        dest.attr(attrName, attrValue);
                    }
                }

                // The style:
                if (el.style.cssText !== '') {
                    dest[0].style.cssText = el.style.cssText;
                }
            },

            /**
             *
             * @param el {(Node)}
             */
            _4e_isEditable:function (el) {
                // Get the element DTD (defaults to span for unknown elements).
                var name = DOM._4e_name(el),
                    xhtml_dtd = KE.XHTML_DTD,
                    dtd = !xhtml_dtd.$nonEditable[ name ]
                        && ( xhtml_dtd[ name ] || xhtml_dtd["span"] );

                // In the DTD # == text node.
                return ( dtd && dtd['#'] );
            },
            /**
             * 修正scrollIntoView在可视区域内不需要滚动
             * @param {Node} [elem]
             */
            _4e_scrollIntoView:function (elem) {
                elem = normalEl(elem);
                var doc = elem[0].ownerDocument;
                // 底部对齐
                elem.scrollIntoView(doc, false);
            }
        };

    Utils.injectDom(editorDom);
}, {
    requires:['./base', './utils']
});
