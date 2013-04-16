/**
 * dom utils for kissy editor,mainly from ckeditor
 * @author yiminghe@gmail.com
 */
/*
 Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.html or http://ckeditor.com/license
 */
KISSY.add("editor/core/dom", function (S, Editor, Utils) {

    var TRUE = true,
        undefined = undefined,
        FALSE = false,
        NULL = null,
        xhtml_dtd = Editor.XHTML_DTD,
        DOM = S.DOM,
        NodeType = DOM.NodeType,
        UA = S.UA,
        Node = S.Node,
        REMOVE_EMPTY = {
            "a": 1,
            "abbr": 1,
            "acronym": 1,
            "address": 1,
            "b": 1,
            "bdo": 1,
            "big": 1,
            "cite": 1,
            "code": 1,
            "del": 1,
            "dfn": 1,
            "em": 1,
            "font": 1,
            "i": 1,
            "ins": 1,
            "label": 1,
            "kbd": 1,
            "q": 1,
            "s": 1,
            "samp": 1,
            "small": 1,
            "span": 1,
            "strike": 1,
            "strong": 1,
            "sub": 1,
            "sup": 1,
            "tt": 1,
            "u": 1,
            'var': 1
        };
    /**
     * Enum for node position
     * @enum {number}
     */
    Editor.POSITION = {
        POSITION_IDENTICAL: 0,
        POSITION_DISCONNECTED: 1,
        POSITION_FOLLOWING: 2,
        POSITION_PRECEDING: 4,
        POSITION_IS_CONTAINED: 8,
        POSITION_CONTAINS: 16
    };
    var KEP = Editor.POSITION;

    /*
     * Anything whose display computed style is block, list-item, table,
     * table-row-group, table-header-group, table-footer-group, table-row,
     * table-column-group, table-column, table-cell, table-caption, or whose node
     * name is hr, br (when enterMode is br only) is a block boundary.
     */
    var blockBoundaryDisplayMatch = {
            "block": 1,
            'list-item': 1,
            "table": 1,
            'table-row-group': 1,
            'table-header-group': 1,
            'table-footer-group': 1,
            'table-row': 1,
            'table-column-group': 1,
            'table-column': 1,
            'table-cell': 1,
            'table-caption': 1
        },
        blockBoundaryNodeNameMatch = { "hr": 1 },
        /**
         * @param el {(Node)}
         */
            normalElDom = function (el) {
            return el && (el[0] || el);
        },
        /**
         * @param el {(Node)}
         */
            normalEl = function (el) {
            return new Node(el);
        },
        editorDom = {

            /**
             * Whether two nodes are on the same level.
             * @param el1
             * @param [el2]
             * @return {Boolean}
             * @private
             */
            _4e_sameLevel: function (el1, el2) {
                el2 = normalElDom(el2);
                var e1p = el1.parentNode;
                return e1p && e1p == el2.parentNode;
            },

            /**
             * 是否是块状元素或块状元素边界
             * @param el
             * @param [customNodeNames]
             */
            _4e_isBlockBoundary: function (el, customNodeNames) {
                var nodeNameMatches = S.merge(blockBoundaryNodeNameMatch, customNodeNames);
                return !!(blockBoundaryDisplayMatch[ DOM.css(el, 'display') ] || nodeNameMatches[ DOM.nodeName(el) ]);
            },

            /**
             * 返回当前元素在父元素中所有儿子节点中的序号
             * @param [el]
             * @param [normalized]
             */
            _4e_index: function (el, normalized) {
                var siblings = el.parentNode.childNodes,
                    candidate,
                    currentIndex = -1;

                for (var i = 0; i < siblings.length; i++) {
                    candidate = siblings[i];

                    // 连续的字符串节点合并
                    if (normalized &&
                        candidate.nodeType == 3 &&
                        candidate.previousSibling &&
                        candidate.previousSibling.nodeType == 3) {
                        continue;
                    }

                    currentIndex++;

                    if (candidate === el) {
                        return currentIndex;
                    }
                }
                return -1;
            },

            /**
             * 把 thisElement 移到 target 的前面或后面
             * @param thisElement
             * @param target
             * @param toStart
             */
            _4e_move: function (thisElement, target, toStart) {
                target = normalElDom(target);
                if (toStart) {
                    target.insertBefore(thisElement, target.firstChild);
                } else {
                    target.appendChild(thisElement);
                }
            },

            /**
             * 两个元素是否名称和属性都相同
             * @param thisElement
             * @param otherElement
             */
            _4e_isIdentical: function (thisElement, otherElement) {
                if (!otherElement) {
                    return FALSE;
                }

                otherElement = normalElDom(otherElement);

                if (DOM.nodeName(thisElement) != DOM.nodeName(otherElement)) {
                    return FALSE;
                }

                var thisAttributes = thisElement.attributes,
                    otherAttributes = otherElement.attributes;

                var thisLength = thisAttributes.length,
                    otherLength = otherAttributes.length;

                if (thisLength != otherLength) {
                    return FALSE;
                }

                for (var i = 0; i < thisLength; i++) {
                    var attribute = thisAttributes[i],
                        name = attribute.name;
                    if (attribute.specified &&
                        DOM.attr(thisElement, name) != DOM.attr(otherElement, name)) {
                        return FALSE;
                    }
                }

                // For IE, we have to for both elements, because it's difficult to
                // know how the atttibutes collection is organized in its DOM.
                // ie 使用版本 < 8
                if (Utils.ieEngine < 8) {
                    for (i = 0; i < otherLength; i++) {
                        attribute = otherAttributes[ i ];
                        name = attribute.name;
                        if (attribute.specified &&
                            DOM.attr(thisElement, name) != DOM.attr(otherElement, name)) {
                            return FALSE;
                        }
                    }
                }

                return TRUE;
            },

            /**
             * inline 元素是否没有包含有效文字内容
             * @param thisElement
             */
            _4e_isEmptyInlineRemovable: function (thisElement) {
                if (!xhtml_dtd.$removeEmpty[DOM.nodeName(thisElement)]) {
                    return false;
                }
                var children = thisElement.childNodes;
                for (var i = 0, count = children.length; i < count; i++) {
                    var child = children[i],
                        nodeType = child.nodeType;

                    if (nodeType == NodeType.ELEMENT_NODE &&
                        child.getAttribute('_ke_bookmark')) {
                        continue;
                    }

                    if (nodeType == NodeType.ELEMENT_NODE && !DOM._4e_isEmptyInlineRemovable(child) ||
                        nodeType == DOM.NodeType.TEXT_NODE && S.trim(child.nodeValue)) {
                        return FALSE;
                    }
                }
                return TRUE;
            },

            /**
             * 把 thisElement 的所有儿子节点都插入到 target 节点的前面或后面
             * @param thisElement
             * @param target
             * @param toStart
             */
            _4e_moveChildren: function (thisElement, target, toStart) {
                target = normalElDom(target);

                if (thisElement == target) {
                    return;
                }

                var child;

                if (toStart) {
                    while (child = thisElement.lastChild) {
                        target.insertBefore(thisElement.removeChild(child), target.firstChild);
                    }
                } else {
                    while (child = thisElement.firstChild) {
                        target.appendChild(thisElement.removeChild(child));
                    }
                }
            },

            /**
             * 将当前元素和周围的元素合并
             * @example
             * <code>
             * <b><i>1</i></b><b><i>3</i></b>
             * =>
             * <b><i>13</i></b>
             * </code>
             */
            _4e_mergeSiblings: function (thisElement) {
                thisElement = normalEl(thisElement);
                // 只合并空元素不占用空间的标签
                if (REMOVE_EMPTY[thisElement.nodeName()]) {
                    mergeElements(thisElement, TRUE);
                    mergeElements(thisElement);
                }
            },

            /**
             * 将一个字符串节点拆散为两个字符串节点，并返回最后一个。
             * 如果 offset 为 0，仍然拆成两个！第一个字符串为空文字节点。
             * @param el
             * @param offset
             */
            _4e_splitText: function (el, offset) {
                var doc = el.ownerDocument;

                if (el.nodeType != DOM.NodeType.TEXT_NODE) {
                    return;
                }
                // If the offset is after the last char, IE creates the text node
                // on split, but don't include it into the DOM. So, we have to do
                // that manually here.
                if (UA['ie'] && offset == el.nodeValue.length) {
                    var next = doc.createTextNode("");
                    DOM.insertAfter(next, el);
                    return next;
                }

                var ret = el.splitText(offset);

                // IE BUG: IE8 does not update the childNodes array in DOM after splitText(),
                // we need to make some DOM changes to make it update. (#3436)
                // UA['ie']==8 不对，
                // 判断不出来:UA['ie']==7 && doc.documentMode==7
                // 浏览器模式：当ie8处于兼容视图以及ie7时，UA['ie']==7
                // 文本模式: mode=5 ,mode=7, mode=8
                // ie8 浏览器有问题，而不在于是否哪个模式
                if (!!(doc.documentMode)) {
                    var workaround = doc.createTextNode("");
                    DOM.insertAfter(workaround, ret);
                    DOM.remove(workaround);
                }

                return ret;
            },

            /**
             * 得到该节点的所有附近节点集合（包括自身）
             * @param node
             * @param closerFirst
             */
            _4e_parents: function (node, closerFirst) {
                var parents = [];
                parents.__IS_NODELIST = 1;
                do {
                    parents[  closerFirst ? 'push' : 'unshift' ](node);
                } while (node = node.parentNode);
                return parents;
            },

            /**
             * 得到该节点在前序遍历下的下一个节点
             * @param el
             * @param [startFromSibling]
             * @param [nodeType]
             * @param [guard]
             */
            _4e_nextSourceNode: function (el, startFromSibling, nodeType, guard) {
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
                    if (el.nodeType == NodeType.ELEMENT_NODE &&
                        guard && guard(el, TRUE) === FALSE) {
                        return NULL;
                    }
                    node = el.nextSibling;
                }

                while (!node && ( parent = parent.parentNode)) {
                    // The guard check sends the "TRUE" parameter to indicate that
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
             * 得到该节点在从右向左前序遍历下的下一个节点( rtl 情况)
             * @param el
             * @param startFromSibling
             * @param nodeType
             * @param guard
             */
            _4e_previousSourceNode: function (el, startFromSibling, nodeType, guard) {
                if (guard && !guard.call) {
                    var guardNode = normalElDom(guard);
                    guard = function (node) {
                        return node !== guardNode;
                    };
                }

                var node = !startFromSibling && el.lastChild,
                    parent = el;

                // Guarding when we're skipping the current element( no children or 'startFromSibling' ).
                // send the 'moving out' signal even we don't actually dive into.
                if (!node) {
                    if (el.nodeType == NodeType.ELEMENT_NODE &&
                        guard && guard(el, TRUE) === FALSE) {
                        return NULL;
                    }
                    node = el.previousSibling;
                }

                while (!node && ( parent = parent.parentNode )) {
                    // The guard check sends the "TRUE" parameter to indicate that
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
             * 得到两个节点的公共祖先节点
             * @param el
             * @param node
             */
            _4e_commonAncestor: function (el, node) {

                node = normalElDom(node);

                if (el === node) {
                    return el;
                }

                if (DOM.contains(node, el)) {
                    return node;
                }

                var start = el;

                do {
                    if (DOM.contains(start, node)) {
                        return start;
                    }
                } while (start = start.parentNode);

                return NULL;
            },

            /**
             * 判断当前元素是否有设置过属性
             */
            _4e_hasAttributes: Utils.ieEngine < 9 ?
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
                                if (el.getAttribute('class')) {
                                    return TRUE;
                                }
                                break;
                            default :
                                if (attribute.specified) {
                                    return TRUE;
                                }
                        }
                    }
                    return FALSE;
                } : function (el) {
                // 删除firefox自己添加的标志
                if (UA.gecko) {
                    el.removeAttribute("_moz_dirty");
                }
                // 使用原生
                // ie8 莫名其妙多个shape？？specified为false
                return el.hasAttributes();
            },

            /**
             * 得到两个元素的位置关系，参见
             * <a href='https://developer.mozilla.org/en/DOM/Node.compareDocumentPosition'>
             *     compareDocumentPosition
             * </a>
             * 注意：这里的 following 和 preceding 和 mdc 相反！
             * @param el
             * @param otherNode
             */
            _4e_position: function (el, otherNode) {
                var $other = normalElDom(otherNode);

                if (el.compareDocumentPosition) {
                    return el.compareDocumentPosition($other);
                }

                // IE and Safari have no support for compareDocumentPosition.

                if (el == $other) {
                    return KEP.POSITION_IDENTICAL;
                }

                // Only element nodes support contains and sourceIndex.
                if (el.nodeType == NodeType.ELEMENT_NODE &&
                    $other.nodeType == NodeType.ELEMENT_NODE) {
                    if (DOM.contains(el, $other)) {
                        return KEP.POSITION_CONTAINS + KEP.POSITION_PRECEDING;
                    }

                    if (DOM.contains($other, el)) {
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
                var addressOfThis = DOM._4e_address(el),
                    addressOfOther = DOM._4e_address($other),
                    minLevel = Math.min(addressOfThis.length, addressOfOther.length);

                // Determinate preceed/follow relationship.
                for (var i = 0; i <= minLevel - 1; i++) {
                    if (addressOfThis[ i ] != addressOfOther[ i ]) {
                        return addressOfThis[ i ] < addressOfOther[ i ] ?
                            KEP.POSITION_PRECEDING : KEP.POSITION_FOLLOWING;
                    }
                }

                // Determinate contains/contained relationship.
                return ( addressOfThis.length < addressOfOther.length ) ?
                    KEP.POSITION_CONTAINS + KEP.POSITION_PRECEDING :
                    KEP.POSITION_IS_CONTAINED + KEP.POSITION_FOLLOWING;
            },

            /**
             * 得到元素及其所有祖先元素在其兄弟节点中的序号。
             * @param el
             * @param [normalized]
             */
            _4e_address: function (el, normalized) {
                var address = [],
                    $documentElement = el.ownerDocument.documentElement,
                    node = el;

                while (node && node != $documentElement) {
                    address.unshift(DOM._4e_index(node, normalized));
                    node = node.parentNode;
                }

                return address;
            },

            /**
             * 删除一个元素
             * @param el
             * @param preserveChildren 是否保留其子元素（将子元素插入到当前元素之前）
             */
            _4e_remove: function (el, preserveChildren) {
                var parent = el.parentNode;
                if (parent) {
                    if (preserveChildren) {
                        // Move all children before the node.
                        for (var child; child = el.firstChild;) {
                            parent.insertBefore(el.removeChild(child), el);
                        }
                    }
                    parent.removeChild(el);
                }
                return el;
            },

            /**
             * 清除左右空的字符串节点
             * @param el
             */
            _4e_trim: function (el) {
                DOM._4e_ltrim(el);
                DOM._4e_rtrim(el);
            },

            /**
             * 清除左边空的字符串节点
             * @param el
             */
            _4e_ltrim: function (el) {
                var child;
                while (child = el.firstChild) {
                    if (child.nodeType == DOM.NodeType.TEXT_NODE) {
                        var trimmed = Utils.ltrim(child.nodeValue),
                            originalLength = child.nodeValue.length;

                        if (!trimmed) {
                            el.removeChild(child);
                            continue;
                        }
                        else if (trimmed.length < originalLength) {
                            DOM._4e_splitText(child, originalLength - trimmed.length);
                            // IE BUG: child.remove() may raise JavaScript errors here. (#81)
                            el.removeChild(el.firstChild);
                        }
                    }
                    break;
                }
            },

            /**
             * 清除右边空的字符串节点
             * @param el
             */
            _4e_rtrim: function (el) {
                var child;
                while (child = el.lastChild) {
                    if (child.type == DOM.NodeType.TEXT_NODE) {
                        var trimmed = Utils.rtrim(child.nodeValue),
                            originalLength = child.nodeValue.length;
                        if (!trimmed) {
                            el.removeChild(child);
                            continue;
                        } else if (trimmed.length < originalLength) {
                            DOM._4e_splitText(child, trimmed.length);
                            // IE BUG: child.getNext().remove() may raise JavaScript errors here.
                            // (#81)
                            el.removeChild(el.lastChild);
                        }
                    }
                    break;
                }

                if (!UA['ie'] && !UA.opera) {
                    child = el.lastChild;
                    if (child &&
                        child.nodeType == 1 &&
                        DOM.nodeName(child) == 'br') {
                        el.removeChild(child);
                    }
                }
            },

            /**
             * 将一个 bogus 元素添加到元素末尾
             * @param el
             */
            _4e_appendBogus: function (el) {
                var lastChild = el.lastChild, bogus;

                // Ignore empty/spaces text.
                while (lastChild &&
                    lastChild.nodeType == DOM.NodeType.TEXT_NODE &&
                    !S.trim(lastChild.nodeValue)) {
                    lastChild = lastChild.previousSibling;
                }

                if (!lastChild ||
                    lastChild.nodeType == DOM.NodeType.TEXT_NODE ||
                    DOM.nodeName(lastChild) !== 'br') {
                    bogus = UA.opera ?
                        el.ownerDocument.createTextNode('') :
                        el.ownerDocument.createElement('br');
                    if (UA.gecko) {
                        bogus.setAttribute('type', '_moz');
                    }
                    el.appendChild(bogus);
                }
            },

            /**
             * 设置元素的自定义 data 值，并记录
             * @param element
             * @param database
             * @param name
             * @param value
             */
            _4e_setMarker: function (element, database, name, value) {
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
             * 清除元素设置的自定义 data 值。
             * @param element
             * @param database
             * @param removeFromDatabase
             */
            _4e_clearMarkers: function (element, database, removeFromDatabase) {
                element = normalEl(element);
                var names = element.data('list_marker_names'),
                    id = element.data('list_marker_id');
                for (var i in names) {
                    element.removeData(i);
                }
                element.removeData('list_marker_names');
                if (removeFromDatabase) {
                    element.removeData('list_marker_id');
                    delete database[id];
                }
            },

            /**
             * 把属性从 target 复制到 el 上.
             * @param el
             * @param target
             * @param skipAttributes
             */
            _4e_copyAttributes: function (el, target, skipAttributes) {
                target = normalEl(target);
                var attributes = el.attributes;
                skipAttributes = skipAttributes || {};

                for (var n = 0; n < attributes.length; n++) {
                    // Lowercase attribute name hard rule is broken for
                    // some attribute on IE, e.g. CHECKED.
                    var attribute = attributes[n],
                        attrName = attribute.name.toLowerCase(),
                        attrValue;

                    // We can set the type only once, so do it with the proper value, not copying it.
                    if (attrName in skipAttributes) {
                        continue;
                    }

                    if (attrName == 'checked' && ( attrValue = DOM.attr(el, attrName) )) {
                        target.attr(attrName, attrValue);
                    }
                    // IE BUG: value attribute is never specified even if it exists.
                    else if (attribute.specified ||
                        ( UA['ie'] && attribute.value && attrName == 'value' )) {
                        attrValue = DOM.attr(el, attrName);
                        if (attrValue === NULL) {
                            attrValue = attribute.nodeValue;
                        }
                        target.attr(attrName, attrValue);
                    }
                }

                // The style:
                if (el.style.cssText !== '') {
                    target[0].style.cssText = el.style.cssText;
                }
            },

            /**
             * 当前元素是否可以被编辑
             * @param el
             */
            _4e_isEditable: function (el) {
                // Get the element DTD (defaults to span for unknown elements).
                var name = DOM.nodeName(el),
                    dtd = !xhtml_dtd.$nonEditable[ name ] &&
                        ( xhtml_dtd[ name ] || xhtml_dtd["span"] );
                // In the DTD # == text node.
                return dtd && dtd['#text'];
            },

            /**
             * 根据dom路径得到某个节点
             * @param doc
             * @param address
             * @param [normalized]
             * @return {KISSY.NodeList}
             */
            _4e_getByAddress: function (doc, address, normalized) {
                var $ = doc.documentElement;

                for (var i = 0; $ && i < address.length; i++) {
                    var target = address[ i ];

                    if (!normalized) {
                        $ = $.childNodes[ target ];
                        continue;
                    }

                    var currentIndex = -1;

                    for (var j = 0; j < $.childNodes.length; j++) {
                        var candidate = $.childNodes[ j ];

                        if (normalized === TRUE &&
                            candidate.nodeType == 3 &&
                            candidate.previousSibling &&
                            candidate.previousSibling.nodeType == 3) {
                            continue;
                        }

                        currentIndex++;

                        if (currentIndex == target) {
                            $ = candidate;
                            break;
                        }
                    }
                }

                return $;
            }
        };


    function mergeElements(element, isNext) {
        var sibling = element[isNext ? "next" : "prev"](undefined, 1);

        if (sibling && sibling[0].nodeType == NodeType.ELEMENT_NODE) {

            // Jumping over bookmark nodes and empty inline elements, e.g. <b><i></i></b>,
            // queuing them to be moved later. (#5567)
            var pendingNodes = [];

            while (sibling.attr('_ke_bookmark') || sibling._4e_isEmptyInlineRemovable(undefined)) {
                pendingNodes.push(sibling);
                sibling = isNext ? sibling.next(undefined, 1) : sibling.prev(undefined, 1);
                if (!sibling) {
                    return;
                }
            }

            if (element._4e_isIdentical(sibling, undefined)) {
                // Save the last child to be checked too, to merge things like
                // <b><i></i></b><b><i></i></b> => <b><i></i></b>
                var innerSibling = new Node(isNext ? element[0].lastChild : element[0].firstChild);

                // Move pending nodes first into the target element.
                while (pendingNodes.length) {
                    pendingNodes.shift()._4e_move(element, !isNext, undefined);
                }

                sibling._4e_moveChildren(element, !isNext, undefined);
                sibling.remove();

                // Now check the last inner child (see two comments above).
                if (innerSibling[0] && innerSibling[0].nodeType == NodeType.ELEMENT_NODE) {
                    innerSibling._4e_mergeSiblings();
                }
            }
        }
    }

    Utils.injectDom(editorDom);
}, {
    requires: ['./base', './utils']
});
