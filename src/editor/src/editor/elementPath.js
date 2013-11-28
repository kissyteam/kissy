/**
 * @ignore
 * elementPath represents element's tree path from body
 * @author yiminghe@gmail.com
 */
/*
 Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.html or http://ckeditor.com/license
 */
KISSY.add(function (S, require) {
    require('node');
    var Editor = require('./base');
    require('./dom');

    var Dom = S.DOM,
        dtd = Editor.XHTML_DTD,
        TRUE = true,
        FALSE = false,
        NULL = null,
    // Elements that may be considered the "Block boundary" in an element path.
        pathBlockElements = {
            'address': 1,
            'blockquote': 1,
            'dl': 1,
            'h1': 1,
            'h2': 1,
            'h3': 1,
            'h4': 1,
            'h5': 1,
            'h6': 1,
            'p': 1,
            'pre': 1,
            'li': 1,
            'dt': 1,
            'dd': 1
        },
    // Elements that may be considered the "Block limit" in an element path.
    // 特别注意：不带 p 元素
        pathBlockLimitElements = {
            'body': 1,
            'div': 1,
            'table': 1,
            'tbody': 1,
            'tr': 1,
            'td': 1,
            'th': 1,
            'caption': 1,
            'form': 1
        },
    // Check if an element contains any block element.
        checkHasBlock = function (element) {
            var childNodes = element[0].childNodes;
            for (var i = 0, count = childNodes.length; i < count; i++) {
                var child = childNodes[i];
                if (child.nodeType === Dom.NodeType.ELEMENT_NODE &&
                    dtd.$block[ child.nodeName.toLowerCase() ]) {
                    return TRUE;
                }
            }
            return FALSE;
        };

    /**
     * @class KISSY.Editor.ElementPath
     * @param lastNode {KISSY.NodeList}
     */
    function ElementPath(lastNode) {
        var self = this,
            block = NULL,
            blockLimit = NULL,
            elements = [],
            e = lastNode;

        while (e) {
            if (e[0].nodeType === Dom.NodeType.ELEMENT_NODE) {
                if (!this.lastElement){
                    this.lastElement = e;
                }

                var elementName = e.nodeName();

                if (!blockLimit) {
                    if (!block && pathBlockElements[ elementName ]) {
                        block = e;
                    }
                    if (pathBlockLimitElements[ elementName ]) {
                        // DIV is considered the Block, if no block is available (#525)
                        // and if it doesn't contain other blocks.
                        if (!block && elementName === 'div' && !checkHasBlock(e)){
                            block = e;
                        }
                        else{
                            blockLimit = e;
                        }
                    }
                }

                elements.push(e);
                if (elementName === 'body') {
                    break;
                }
            }
            e = e.parent();
        }

        self.block = block;
        self.blockLimit = blockLimit;
        self.elements = elements;
    }

    ElementPath.prototype = {
        constructor: ElementPath,
        /**
         * Compares this element path with another one.
         * @param otherPath ElementPath The elementPath object to be
         * compared with this one.
         * @return {Boolean} "TRUE" if the paths are equal, containing the same
         * number of elements and the same elements in the same order.
         */
        compare: function (otherPath) {
            var thisElements = this.elements;
            var otherElements = otherPath && otherPath.elements;

            if (!otherElements || thisElements.length !== otherElements.length){
                return FALSE;
            }

            for (var i = 0; i < thisElements.length; i++) {
                if (!Dom.equals(thisElements[ i ], otherElements[ i ])){
                    return FALSE;
                }
            }

            return TRUE;
        },

        contains: function (tagNames) {
            var elements = this.elements;
            for (var i = 0; i < elements.length; i++) {
                if (elements[ i ].nodeName() in tagNames){
                    return elements[ i ];
                }
            }
            return NULL;
        },
        toString: function () {
            var elements = this.elements, i, elNames = [];
            for (i = 0; i < elements.length; i++) {
                elNames.push(elements[i].nodeName());
            }
            return elNames.toString();
        }
    };
    Editor.ElementPath = ElementPath;

    return ElementPath;
});
