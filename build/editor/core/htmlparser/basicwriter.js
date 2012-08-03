/**
 * modified from ckeditor,html generator for kissy editor
 * @author <yiminghe@gmail.com>
 */
/*
Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
*/
KISSY.Editor.add("htmlparser-basicwriter", function() {
    var S = KISSY,KE = S.Editor,Utils = KE.Utils,
        FALSE = false;

    /**
     * @constructor
     */
    function BasicWriter() {
        this._ = {
            output : []
        };
    }

    S.augment(BasicWriter, {
        /**
         * Writes the tag opening part for a opener tag.
         * @param {string} tagName The element name for this tag.
         * param {Object=} attributes The attributes defined for this tag. The
         *        attributes could be used to inspect the tag.
         * @example
         * // Writes "&lt;p".
         * writer.openTag( 'p', { class : 'MyClass', id : 'MyId' } );
         */
        openTag : function(tagName/*, attributes*/) {
            this._.output.push('<', tagName);
        },

        /**
         * Writes the tag closing part for a opener tag.
         * @param {string} tagName The element name for this tag.
         * @param {boolean=} isSelfClose Indicates that this is a self-closing tag,
         *        like "br" or "img".
         * @example
         * // Writes "&gt;".
         * writer.openTagClose( 'p', FALSE );
         * @example
         * // Writes " /&gt;".
         * writer.openTagClose( 'br', TRUE );
         */
        openTagClose : function(tagName, isSelfClose) {
            if (isSelfClose)
                this._.output.push(' />');
            else
                this._.output.push('>');
        },

        /**
         * Writes an attribute. This function should be called after opening the
         * tag with {@link #openTagClose}.
         * @param {string} attName The attribute name.
         * @param {string} attValue The attribute value.
         * @example
         * // Writes ' class="MyClass"'.
         * writer.attribute( 'class', 'MyClass' );
         */
        attribute : function(attName, attValue) {
            // Browsers don't always escape special character in attribute values. (#4683, #4719).
            if (typeof attValue == 'string')
                attValue = Utils.htmlEncodeAttr(attValue);

            this._.output.push(' ', attName, '="', attValue, '"');
        },

        /**
         * Writes a closer tag.
         * @param {string} tagName The element name for this tag.
         * @example
         * // Writes "&lt;/p&gt;".
         * writer.closeTag( 'p' );
         */
        closeTag : function(tagName) {
            this._.output.push('</', tagName, '>');
        },

        /**
         * Writes text.
         * @param {string} text The text value
         * @example
         * // Writes "Hello Word".
         * writer.text( 'Hello Word' );
         */
        text : function(text) {
            this._.output.push(text);
        },

        /**
         * Writes a comment.
         * @param {string} comment The comment text.
         * @example
         * // Writes "&lt;!-- My comment --&gt;".
         * writer.comment( ' My comment ' );
         */
        comment : function(comment) {
            this._.output.push('<!--', comment, '-->');
        },

        /**
         * Writes any kind of data to the ouput.
         * @example
         * writer.write( 'This is an &lt;b&gt;example&lt;/b&gt;.' );
         */
        write : function(data) {
            this._.output.push(data);
        },

        /**
         * Empties the current output buffer.
         * @example
         * writer.reset();
         */
        reset : function() {
            this._.output = [];
            this._.indent = FALSE;
        },

        /**
         * Empties the current output buffer.
         * @param {boolean} reset Indicates that the { reset} function is to
         *        be automatically called after retrieving the HTML.
         * @returns {string} The HTML written to the writer so far.
         * @example
         * var html = writer.getHtml();
         */
        getHtml : function(reset) {
            var html = this._.output.join('');

            if (reset)
                this.reset();

            return html;
        }
    });

    KE.HtmlParser.BasicWriter = BasicWriter;
});
