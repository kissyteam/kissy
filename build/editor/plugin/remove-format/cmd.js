/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Feb 17 17:29
*/
/**
 * Add remove-format command for KISSY Editor.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/remove-format/cmd", function (S, Editor) {
    var KER = Editor.RANGE,
        ElementPath = Editor.ElementPath,
        DOM = S.DOM,
        /**
         * A comma separated list of elements to be removed
         * when executing the "remove format" command.
         * Note that only inline elements are allowed.
         * @type {String}
         * Defaults to: 'b,big,code,del,dfn,em,font,i,ins,kbd,q,samp,small,span,strike,strong,sub,sup,tt,u,var'
         * @example
         */
            removeFormatTags = 'b,big,code,del,dfn,em,font,i,ins,kbd,' +
            'q,samp,small,span,strike,strong,sub,sup,tt,u,var,s',
        /**
         * A comma separated list of elements attributes to be removed
         * when executing the "remove format" command.
         * @type {String}
         * Defaults to: 'class,style,lang,width,height,align,hspace,valign'
         * @example
         */
            removeFormatAttributes = ('class,style,lang,width,height,' +
            'align,hspace,valign').split(/,/),
        tagsRegex = new RegExp('^(?:' +
            removeFormatTags.replace(/,/g, '|') +
            ')$', 'i');

    function removeAttrs(el, attrs) {
        for (var i = 0; i < attrs.length; i++) {
            el.removeAttr(attrs[i]);
        }
    }

    return {
        init:function (editor) {
            if (!editor.hasCommand("removeFormat")) {
                editor.addCommand("removeFormat", {
                    exec:function () {
                        editor.focus();
                        tagsRegex.lastIndex = 0;
                        var ranges = editor.getSelection().getRanges();
                        editor.execCommand("save");
                        for (var i = 0, range; range = ranges[ i ]; i++) {

                            if (range.collapsed) {
                                continue;
                            }

                            range.enlarge(KER.ENLARGE_ELEMENT);

                            // Bookmark the range so we can re-select it after processing.
                            var bookmark = range.createBookmark(),
                            // The style will be applied within the bookmark boundaries.
                                startNode = bookmark.startNode,
                                endNode = bookmark.endNode;

                            // We need to check the selection boundaries (bookmark spans) to break
                            // the code in a way that we can properly remove partially selected nodes.
                            // For example, removing a <b> style from
                            //		<b>This is [some text</b> to show <b>the] problem</b>
                            // ... where [ and ] represent the selection, must result:
                            //		<b>This is </b>[some text to show the]<b> problem</b>
                            // The strategy is simple, we just break the partial nodes before the
                            // removal logic, having something that could be represented this way:
                            //		<b>This is </b>[<b>some text</b> to show <b>the</b>]<b> problem</b>

                            var breakParent = function (node) {
                                // Let's start checking the start boundary.
                                var path = new ElementPath(node),
                                    pathElements = path.elements;

                                for (var i = 1, pathElement;
                                     pathElement = pathElements[ i ];
                                     i++) {
                                    if (pathElement.equals(path.block) ||
                                        pathElement.equals(path.blockLimit)) {
                                        break;
                                    }
                                    // If this element can be removed (even partially).
                                    if (tagsRegex.test(pathElement.nodeName())) {
                                        node._4e_breakParent(pathElement);
                                    }
                                }
                            };

                            // does not make bookmark within any format tag
                            // but keep bookmark node is at original text posititon
                            breakParent(startNode);
                            breakParent(endNode);

                            // Navigate through all nodes between the bookmarks.
                            var currentNode = startNode
                                // start from sibling , because obvious bookmark has no children
                                ._4e_nextSourceNode(true, DOM.NodeType.ELEMENT_NODE, undefined, undefined);

                            while (currentNode) {
                                // If we have reached the end of the selection, stop looping.
                                if (currentNode.equals(endNode)) {
                                    break;
                                }

                                // Cache the next node to be processed. Do it now, because
                                // currentNode may be removed.
                                var nextNode = currentNode.
                                    _4e_nextSourceNode(false, DOM.NodeType.ELEMENT_NODE, undefined, undefined);

                                // This node must not be a fake element.
                                if (!( currentNode.nodeName() == 'img' &&
                                    (
                                        currentNode.attr('_ke_realelement') ||
                                            // 占位符
                                            /\bke_/.test(currentNode[0].className)
                                        ) )) {
                                    // Remove elements nodes that match with this style rules.
                                    if (tagsRegex.test(currentNode.nodeName()))
                                        currentNode._4e_remove(true);
                                    else {
                                        removeAttrs(currentNode, removeFormatAttributes);
                                    }
                                }
                                currentNode = nextNode;
                            }
                            range.moveToBookmark(bookmark);
                        }
                        editor.getSelection().selectRanges(ranges);
                        editor.execCommand("save");
                    }
                });
            }
        }
    }

}, {
    requires:['editor']
});
