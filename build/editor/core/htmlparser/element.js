/**
 * modified from ckeditor
 * @author <yiminghe@gmail.com>
 */
/*
Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
*/
KISSY.Editor.add("htmlparser-element", function() {
    var KE = KISSY.Editor,
        TRUE = true,
        FALSE = false,
        NULL = null;

    /**
     * A lightweight representation of an HTML element.
     * @constructor
     * @param {!String} name The element name.
     * @param {Object} attributes And object holding all attributes defined for
     *        this element.
     * @example
     */
    function MElement(name, attributes) {
        /**
         * The element name.
         * @type String
         * @example
         */
        this.name = name;

        /**
         * Holds the attributes defined for this element.
         * @type Object
         * @example
         */
        this.attributes = attributes || ( attributes = {} );

        /**
         * The nodes that are direct children of this element.
         * @type Array
         * @example
         */
        this.children = [];

        var tagName = attributes._ke_real_element_type || name;

        var dtd = KE.XHTML_DTD,
            isBlockLike = !!( dtd.$nonBodyContent[ tagName ] || dtd.$block[ tagName ] || dtd.$listItem[ tagName ] || dtd.$tableContent[ tagName ] || dtd.$nonEditable[ tagName ] || tagName == 'br' ),
            isEmpty = !!dtd.$empty[ name ];

        this.isEmpty = isEmpty;
        this.isUnknown = !dtd[ name ];

        /** @private */
        this._ =
        {
            isBlockLike : isBlockLike,
            hasInlineStarted : isEmpty || !isBlockLike
        };
    }

    // Used to sort attribute entries in an array, where the first element of
    // each object is the attribute name.
    var S = KISSY,
        KEN = KE.NODE,
        sortAttribs = function(a, b) {
            a = a[0];
            b = b[0];
            return a < b ? -1 : a > b ? 1 : 0;
        };
    S.augment(MElement, {
        /**
         * The node type. This is a constant value set to { KEN.NODE_ELEMENT}.
         * @type Number
         * @example
         */
        type : KEN.NODE_ELEMENT,

        /**
         * Adds a node to the element children list.
         * @param {Object} node The node to be added.
         * @function
         * @example
         */
        add : KE.HtmlParser.Fragment.prototype.add,

        /**
         * Clone this element.
         * @returns  The element clone.
         * @example
         */
        clone : function() {
            return new MElement(this.name, this.attributes);
        },

        /**
         * Writes the element HTML to a CKEDITOR.htmlWriter.
         * @param  writer The writer to which write the HTML.
         * @example
         */
        writeHtml : function(writer, filter) {
            var attributes = this.attributes;

            // Ignore cke: prefixes when writing HTML.
            var element = this,
                writeName = element.name,
                a, newAttrName, value;

            var isChildrenFiltered;

            /**
             * Providing an option for bottom-up filtering order ( element
             * children to be pre-filtered before the element itself ).
             */
            element.filterChildren = function() {
                if (!isChildrenFiltered) {
                    var writer = new KE.HtmlParser.BasicWriter();
                    KE.HtmlParser.Fragment.prototype.writeChildrenHtml.call(element, writer, filter);
                    element.children = new KE.HtmlParser.Fragment.FromHtml(writer.getHtml()).children;
                    isChildrenFiltered = 1;
                }
            };
            element["filterChildren"] = element.filterChildren;
            if (filter) {
                while (TRUE) {
                    if (!( writeName = filter.onElementName(writeName) ))
                        return;

                    element.name = writeName;

                    if (!( element = filter.onElement(element) ))
                        return;

                    element.parent = this.parent;

                    if (element.name == writeName)
                        break;

                    // If the element has been replaced with something of a
                    // different type, then make the replacement write itself.
                    if (element.type != KEN.NODE_ELEMENT) {
                        element.writeHtml(writer, filter);
                        return;
                    }

                    writeName = element.name;

                    // This indicate that the element has been dropped by
                    // filter but not the children.
                    if (!writeName) {
                        this.writeChildrenHtml.call(element, writer, isChildrenFiltered ? NULL : filter);
                        return;
                    }
                }

                // The element may have been changed, so update the local
                // references.
                attributes = element.attributes;
            }

            // Open element tag.
            writer.openTag(writeName, attributes);

            // Copy all attributes to an array.
            var attribsArray = [];
            // Iterate over the attributes twice since filters may alter
            // other attributes.
            for (var i = 0; i < 2; i++) {
                for (a in attributes) {
                    newAttrName = a;
                    value = attributes[ a ];
                    if (i == 1)
                        attribsArray.push([ a, value ]);
                    else if (filter) {
                        while (TRUE) {
                            if (!( newAttrName = filter.onAttributeName(a) )) {
                                delete attributes[ a ];
                                break;
                            }
                            else if (newAttrName != a) {
                                delete attributes[ a ];
                                a = newAttrName;
                                //continue;
                            }
                            else
                                break;
                        }
                        if (newAttrName) {
                            if (( value = filter.onAttribute(element, newAttrName, value) ) === FALSE)
                                delete attributes[ newAttrName ];
                            else
                                attributes [ newAttrName ] = value;
                        }
                    }
                }
            }
            // Sort the attributes by name.
            if (writer.sortAttributes)
                attribsArray.sort(sortAttribs);

            // Send the attributes.
            var len = attribsArray.length;
            for (i = 0; i < len; i++) {
                var attrib = attribsArray[ i ];
                writer.attribute(attrib[0], attrib[1]);
            }

            // Close the tag.
            writer.openTagClose(writeName, element.isEmpty);

            if (!element.isEmpty) {
                this.writeChildrenHtml.call(element, writer, isChildrenFiltered ? NULL : filter);
                // Close the element.
                writer.closeTag(writeName);
            }
        },

        writeChildrenHtml : function(writer, filter) {
            // Send children.
            KE.HtmlParser.Fragment.prototype.writeChildrenHtml.apply(this, arguments);
        }
    });
    /**
     * @constructor
     */
    KE.HtmlParser.Element = MElement;
});
