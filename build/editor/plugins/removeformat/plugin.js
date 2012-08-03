/**
 * remove inline-style format for kissy editor,modified from ckeditor
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("removeformat", function (editor) {

    editor.addPlugin("removeformat", function () {
        var S = KISSY,
            KE = S.Editor,
            KER = KE.RANGE,
            ElementPath = KE.ElementPath,
            KEN = KE.NODE,
            /**
             * A comma separated list of elements to be removed
             * when executing the "remove format" command.
             * Note that only inline elements are allowed.
             * @type String
             * @default 'b,big,code,del,dfn,em,font,i,ins,kbd,q,samp,small,span,strike,strong,sub,sup,tt,u,var'
             * @example
             */
                removeFormatTags = 'b,big,code,del,dfn,em,font,i,ins,kbd,' +
                'q,samp,small,span,strike,strong,sub,sup,tt,u,var,s',
            /**
             * A comma separated list of elements attributes to be removed
             * when executing the "remove format" command.
             * @type String
             * @default 'class,style,lang,width,height,align,hspace,valign'
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


        var context = editor.addButton("removeformat", {
            title:"清除格式",
            mode:KE.WYSIWYG_MODE,
            contentCls:"ke-toolbar-removeformat",
            offClick:function () {
                var self = this,
                    editor = self.editor;
                editor.focus();
                tagsRegex['lastIndex'] = 0;
                var ranges = editor.getSelection().getRanges();
                editor.fire("save");
                for (var i = 0, range;
                     range = ranges[ i ];
                     i++) {
                    if (range.collapsed)
                        continue;

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
                            if (pathElement._4e_equals(path.block)
                                || pathElement._4e_equals(path.blockLimit))
                                break;

                            // If this element can be removed (even partially).
                            if (tagsRegex.test(pathElement._4e_name()))
                                node._4e_breakParent(pathElement);
                        }
                    };

                    breakParent(startNode);
                    breakParent(endNode);

                    // Navigate through all nodes between the bookmarks.
                    var currentNode = startNode._4e_nextSourceNode(true, KEN.NODE_ELEMENT);

                    while (currentNode) {
                        // If we have reached the end of the selection, stop looping.
                        if (currentNode._4e_equals(endNode))
                            break;

                        // Cache the next node to be processed. Do it now, because
                        // currentNode may be removed.
                        var nextNode = currentNode._4e_nextSourceNode(false,
                            KEN.NODE_ELEMENT);

                        // This node must not be a fake element.
                        if (!( currentNode._4e_name() == 'img'
                            && (
                            currentNode.attr('_ke_realelement') ||
                                // 占位符
                                /\bke_/.test(currentNode[0].className)
                            ) )
                            ) {
                            // Remove elements nodes that match with this style rules.
                            if (tagsRegex.test(currentNode._4e_name()))
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
                editor.fire("save");
            }
        });

        this.destroy = function () {
            context.destroy();
        };
    });


}, {
    attach:false
});